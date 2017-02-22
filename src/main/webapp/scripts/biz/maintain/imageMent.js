window.currentInstanceType='ment';
window.Controller = {
		init : function(){
		imageManagement.init();
	},
		refresh : function(){
			imageManagement.refresh();			
		}
};
var ContextMenu = function(options) {
	var _options = {
		container : options.container || $("#contextMenu"),
		onAction : options.onAction || function(action) {
		},
		trigger : options.trigger || $("body"),
		beforeShow : options.beforeShow || function() {
		},
		afterShow : options.afterShow || function() {
		},
		beforeHide : options.beforeHide || function() {
		},
		afterHide : options.afterHide || function() {
		}
	};
	this.setTrigger = function(trigger) {
		_options.trigger = trigger;
		_init();
	};

	this.reset = function() {
		_init();
	};
	this.inMenu = false;

	var _init = function() {
		_options.container = $(_options.container);
		_options.container.hide();
		$(_options.trigger).unbind("mousedown").bind(
				"mousedown",
				function(e) {
					if (3 == e.which) {
						document.oncontextmenu = function() {
							return false;
						}
						var screenHeight = $(document).height();
						var top = e.pageY;
						if (e.pageY >= screenHeight / 2) {
							top = e.pageY - _options.container.height();// 如果鼠标所在位置在屏幕高度中线的下半部分，则弹出框往上弹出
						}
						_options.container.hide();
						_options.container.attr("style",
								"display: block; position: absolute; top:"
										+ top + "px; left:" + e.pageX
										+ "px; width: 180px;");
						_options.beforeShow($(this));
						_options.container.show();
						e.stopPropagation();
						_options.afterShow($(this));

					}
				});
		var self = this;
		_options.container.unbind("mouseover").bind('mouseover', function() {
			self.inMenu = true;
		});

		_options.container.unbind("mouseout").bind('mouseout', function() {
			self.inMenu = false;
		});
		_options.container.find("li").unbind("mousedown").bind('mousedown',
				function(e) {
					_options.container.hide();
					if (!$(this).hasClass("disabled")) {
						var action = $(this).attr("action");
						if (action)
							_options.onAction(action);
					}
				});
		$("body").unbind('mousedown').bind('mousedown', function() {
			if (!self.inMenu) {
				_options.beforeHide();
				_options.container.hide();
				_options.afterHide();
			}
		});
	};

	_init();
};
var imageManagement = {
	datatable : null,
	currentImageId:null,
	currentImageStatus:null,
	backupDatatable:null,
	instances:null,
	backupInstances:[],
	currentImageName:"",
	modifyImageNameModal:null,
	service : com.skyform.service.imageService,
	snapId:"",
	snapStatus:"",
	currentProductId:"",
	init : function() {
	    imageManagement.refresh();
	    this.checkSelected();
	    $("#btn_create").click(function(){
	    	imageManagement.createImage();
	    });
	},
	refresh:function(){
		if(imageManagement.datatable)imageManagement.datatable.container.find("tbody").html("<tr ><td colspan='7' style='text-align:center;'><img src='"+CONTEXT_PATH+"/images/loader.gif'/><strong>"+Dict.val("common_retrieving_data_please_wait")+"</strong></td></tr>");
		imageManagement.service.listImage(null, function(data) {
			imageManagement.instances = data;	
			imageManagement.renderDataTable();
		},function onError(error){
			$.growlUI(Dict.val("common_tip"), Dict.val("img_select_image_error")+error);
		});		
	
	},
	renderDataTable:function(){
		if(imageManagement.datatable == null){
			imageManagement.initDataTable();
		}else{
			imageManagement.updateDataTable();
		}
		imageManagement.checkSelected();
	},
	updateDataTable : function(){
		imageManagement.datatable.updateData(imageManagement.instances);
	},
	initDataTable:function(){
		imageManagement.datatable = new com.skyform.component.DataTable();
		imageManagement.datatable.renderByData("#imageTable", {
				"data" : imageManagement.instances,
				"pageSize" : 5,
				"onColumnRender" : function(columnIndex,columnMetaData,columnData) {
					 var text = columnData[''+columnMetaData.name] || "";
					 if(columnIndex ==0) {
							 text = '<input type="checkbox" name="imageId" value="'+text+'">';
					 }else if(columnMetaData.name == "imageSize"){
						   //if(columnData.imageSize != undefined){
						   if(columnData.imageSize){
							   text =columnData.imageSize+"G";
						   }else{
							   text = "";
						   }
					 }
					 if (columnMetaData.name == "imageStatus") {
						 text = com.skyform.service.StateService.imageState[columnData.imageStatus];
					 }
					 if (columnMetaData.name == "imageName") {
						 text = columnData.imageName
						  +"<a title="+Dict.val("common_advice")+" href='../user/workOrder.jsp?code=workOrder&cataCode=service&instanceId="+columnData.id+"&serviceType=image&instanceName="+encodeURIComponent(columnData.imageName)+
						  "&instanceStatus="+columnData.imageStatus+
						  "&currentPoolW="+encodeURIComponent(CommonEnum.pools[CommonEnum.currentPool])+
						  "'><i class='icon-comments' ></i></a>";
				       }
					 if (columnMetaData.name == "createTime") {
						  if(columnData.expireDate == '' || columnData.expireDate == 'undefined'){
						  	return '';
						  }
						 try {
								var obj = eval('(' + "{Date: new Date(" + text + ")}" + ')');
								var dateValue = obj["Date"];
								text = dateValue.format('yyyy-MM-dd hh:mm:ss');
							} catch (e) {
						    }
					 }
					 return text;
				}, 
				"afterRowRender" : function(rowIndex,data,tr){
					tr.attr("instanceId",data.imageId);
					tr.find("input[type='checkbox']").attr("currentImageId",data.imageId);
					tr.find("input[type='checkbox']").attr("currentImageName",data.imageName);
					tr.find("input[type='checkbox']").attr("currentImageStatus",data.imageStatus);
					tr.find("input[type='checkbox']").click(function(){
						var checkBox = $("#imageTable input[type='checkbox']:checked").eq(0);
						imageManagement.currentImageId = checkBox.attr("currentImageId");
						imageManagement.currentImageName = checkBox.attr("currentImageName");
						imageManagement.currentImageStatus = checkBox.attr("currentImageStatus");
						imageManagement.checkSelected();
			        });
				},
				afterTableRender : function() {
					imageManagement.bindEvent();
				}
		});
		imageManagement.datatable.addToobarButton("#toolbar4tb2");
		imageManagement.datatable.enableColumnHideAndShow("right");		 
	},
	
	checkSelected:function(){
		$(".operation").addClass("disabled");
		var runningState = false;
		var oneBox = $("#imageTable input[type='checkbox']:checked");
		var selectRadio = oneBox.length == 1;
		if(imageManagement.currentImageStatus == "running"){
			runningState = true;
		}
		$(".operation").each(function(index,operation){
			var condition = $(operation).attr("condition");
			var action = $(operation).attr("action");
			var enabled = true;
			eval("enabled=("+condition+")");
			if(enabled) {
				$(operation).removeClass("disabled");
				$(operation).unbind("click").click(function(){
					imageManagement.onOptionSelected(action||"");
				});
			} else {
				$(operation).addClass("disabled");
				$(operation).unbind();
			}
		});
	},
	onOptionSelected:function(action){
		if ("refresh" == action) {
			imageManagement.refresh();
		}else if("createImage" == action){
			imageManagement.createImage();
		}else if("modifyImage" == action){
			imageManagement.modifyImage();
		}else if("deleteImage" == action){
			imageManagement.deleteImage();
		}else if("createImageShow" == action){
			imageManagement.createImageShow();
		}else if("modifyImageShow" == action){
			imageManagement.modifyImageShow();
		}else if("cancel" == action){
			imageManagement.cancel();
		}
	},
	createImageShow:function(){
		var portalType = Dcp.biz.getCurrentPortalType();
		var condition = {
				"serviceType":1018,
		};
		if(portalType == "private"){
			condition.billType = 5;
		}else if(portalType == "public"){
			condition.billType = 4;
		}
		imageManagement.service.QueryProductIdByServiceTypeBillType(condition, function(result) {
			imageManagement.currentProductId = result.data;
			Dcp.biz.apiAsyncRequest("/snapshot/searchSnap", {vmid:""}, function(data) {	
				if(!data.data){
					data.data = data.snaps;
				}
				if (data.code != "0") {
					$.growlUI(Dict.val("common_tip"), Dict.val("img_select_snapshot_fail") + data.msg); 
				} else {	
					$("#createImageModal").modal("show");
					$("#createImageModal").on("shown",function(){
						imageManagement.backupInstances = [];
						$(data.data).each(function(index,item){
							if(item.status == 'running'){
								imageManagement.backupInstances.push(item);
							}
						});
						$("#spanIdError").hide();
						$("#instanceNameError").text("*");
						imageManagement.renderBackupDataTable();
					});
				}
			},function onError(error){
				alert(error);
			});
		},function onError(error){
			$.growlUI(Dict.val("common_tip"), Dict.val("img_select_product_fail")+error);
		});
		
	},
	cancel:function(){
		this.refresh();
	},
	renderBackupDataTable:function(){
		if(imageManagement.backupDatatable == null){
			imageManagement.initBackupDatatable();
		}else{
			imageManagement.updateBackupDatatable();
		}
	},
	initBackupDatatable:function(){
		imageManagement.backupDatatable = new com.skyform.component.DataTable();
		imageManagement.backupDatatable.renderByData("#backupTable", {
				"data" : imageManagement.backupInstances,
				"pageSize" : 5,
				"onColumnRender" : function(columnIndex,columnMetaData,columnData) {
					 var text = columnData[''+columnMetaData.name] || "";
					 if(columnIndex ==0) {
							 text = '<input type="radio" name="snapID" value="'+columnData.snapID+'">';
					 }
					 if (columnMetaData.name == "status") {
						 text = com.skyform.service.StateService.snapState[columnData.status];
					 }
					 if (columnMetaData.name == "size") {
						 var temp = parseInt(columnData.size) / 1024 /1024;
						 text = temp.toFixed(1)+"M";
					 }
					 if (columnMetaData.name == "createTime") {
						  if(columnData.expireDate == '' || columnData.expireDate == 'undefined'){
						  	return '';
						  }
						 try {
								var obj = eval('(' + "{Date: new Date(" + text + ")}" + ')');
								var dateValue = obj["Date"];
								text = dateValue.format('yyyy-MM-dd hh:mm:ss');
							} catch (e) {
						    }
					 }
					 return text;
				},
				"afterRowRender" : function(rowIndex,data,tr){
					tr.find("input[type='radio']").click(function(){
						imageManagement.snapId = data.snapID;
						imageManagement.snapStatus = data.status;
			        });
				}
		});
		imageManagement.backupDatatable.addToobarButton("#toolbar4tb3");
		 //self.backupDatatable.enableColumnHideAndShow("right");
	},
	updateBackupDatatable:function(){
		imageManagement.backupDatatable.updateData(imageManagement.backupInstances);
	},
	createImage:function(){
		var instanceName = $("#instanceImageName").val();
		var radioSelect = $("#backupTable input[type='radio']:checked").length;
		if(radioSelect == 0){
			$("#spanIdError").show();
			$("#spanIdError").text(Dict.val("img_select_createvm_snapshot_mirror"));
			return
		}
		if(imageManagement.snapStatus != "running"){
			$("#spanIdError").show();
			$("#spanIdError").html(Dict.val("img_vm_snapshots")+com.skyform.service.StateService.snapState[imageManagement.snapStatus]+Dict.val("img_not_used"));
			return
		}
		if(instanceName.length == 0 || instanceName=="null"){
			$("#instanceNameError").show();
			$("#instanceNameError").text(Dict.val("img_please_fill_image_name"));
			return
		}
//		var scoreReg = /^[A-Za-z0-9\_]*$/;
//		// console.log("正则表达式是否正确"+scoreReg.test(property.propertyValue));
//		if (!scoreReg.test(instanceName)) {
//			$("#instanceNameError").text("请输入包含字母数字或下划线");
//			return
//		}
		var sflag = imageManagement.checkImageOpening(imageManagement.snapId);
		if(!sflag){
			$("#spanIdError").show();
			$("#spanIdError").html(Dict.val("img_vm_snapshots_creating_mirror_not_used"));
			return
		}
		var image = {
				"period":1,
				"count":1,
				"productList":[
								{
									"productId":imageManagement.currentProductId,
									"instanceName": $("#instanceImageName").val(),
									"snapshotid":imageManagement.snapId
			}]
	
		};
		$.blockUI();
		imageManagement.service.createImage(image,function(data){
			$.unblockUI();
			//$("#createImageModal").modal("hide");
			var _tradeId = data.tradeId?data.tradeId:data.data.tradeId;
			com.skyform.service.BillService.confirmTradeSubmit(0,
					_tradeId, $("#createImageModal"), function onSuccess(data) {
						$.growlUI(Dict.val("common_tip"), Dict.val("img_create_operation_submit_success"));
						imageManagement.refresh();
				}, function onError(msg) {
					$.growlUI(Dict.val("common_tip"), Dict.val("img_create_operation_submit_fail")+msg);
					$("#createImageModal").modal("hide");
				});
		},function(error){
			$("#createImageModal").modal("hide");
			$.unblockUI();
			$.growlUI(Dict.val("common_tip"), Dict.val("img_create_operation_submit_error")+error); 
			imageManagement.refresh();
		});
		
	},
	checkImageOpening:function(snapshotId){
		var count=0;
		$(imageManagement.instances).each(function(index,item){
			//if(item.imageStatus == 'opening'&&item.snapshotName.indexOf(snapshotId) > 0){
			if(item.imageStatus == 'opening'&&item.snapshotId==snapshotId){
				return false;
   			}
			count+=1;
		});
		var ilength = imageManagement.instances.length;
		if(ilength == count){
			return true;
		}else{
			return false;
		}
	},
    deleteImage:function(){
    	var confirmModal = new com.skyform.component.Modal(
				new Date().getTime(), Dict.val("img_delete_image"), "<h4>"+Dict.val("img_do_you_delete_image")+"</h4>", {
					buttons : [
							{
								name : Dict.val("common_determine"),
								onClick : function() {
									var condition = {
											"subscriptionId":parseInt(imageManagement.currentImageId)
									};
									imageManagement.service.deleImage(condition,function(data){
										confirmModal.hide();
										imageManagement.refresh();
									},function(error){
										$.growlUI(Dict.val("common_tip"), Dict.val("img_delete_image_error")+error);
										confirmModal.hide();
										imageManagement.refresh();
									});
								},
								attrs : [ {
									name : 'class',
									value : 'btn btn-primary'
								} ]
							}, {
								name : Dict.val("common_cancel"),
								attrs : [ {
									name : 'class',
									value : 'btn'
								} ],
								onClick : function() {
									confirmModal.hide();
								}
							} ]
				});
		confirmModal.setWidth(300).autoAlign();
		confirmModal.show();
    },
    modifyImageShow:function(){
    	var id = new Date().getTime();
    	imageManagement.modifyImageNameModal = new com.skyform.component.Modal(
					id,
					Dict.val("img_modify_image_name"),
					'<div class="modal-body"> <form  class=\"form-horizontal\"> '
					        + '<fieldset>'
						        + '<div class=\"control-group\">'
							        + '<label class=\"control-label\" for=\"input01\">名称:</label>'
									+ '<div class=\"controls\"><input type=\"text\" name=\"currentImageName\" id=\"currentImageName'+id+'\" value='+imageManagement.currentImageName+' maxlength=\"32\"><font color=\'red\'>*</font>('+Dict.val("common_required")+')<br>'
									+ '</div>'
								+ '</div>'
								//+ '<font size="4">描述:</font><textarea cols="15" rows="2" id="updateComment"></textarea><br> 
							+ '</fieldset>'
					 + '</form></div>',
					{
						buttons : [
								{
									name : Dict.val("common_determine"),
									onClick : function() {
										var value = $("#currentImageName"+id).val();
										if (value == null || value == "") {
											alert(Dict.val("img_please_modify_name"));
											return;
										}
//										var scoreReg = /^[A-Za-z0-9\_]*$/;
//										// console.log("正则表达式是否正确"+scoreReg.test(property.propertyValue));
//										if (!scoreReg.test(value)) {
//											alert("请输入包含字母数字或下划线");
//											return
//										}
										var condition = {
												"subscriptionId":parseInt(imageManagement.currentImageId),
												"subscripName":value,
												"busiCode":"Image.SubName.Mod"
										};
										imageManagement.service.modifyImage(condition,function(data){
											imageManagement.modifyImageNameModal.hide();
											imageManagement.refresh();
										},function(error){
											$.growlUI(Dict.val("common_tip"), Dict.val("img_modify_happen_error")+error);
											imageManagement.modifyImageNameModal.hide();
											imageManagement.refresh();
										});
									},
									attrs : [ {
										name : 'class',
										value : 'btn btn-primary'
									} ]
								}, {
									name : Dict.val("common_cancel"),
									attrs : [ {
										name : 'class',
										value : 'btn'
									} ],
									onClick : function() {
										imageManagement.modifyImageNameModal.hide();
									}
								} ],
						beforeShow : function(){
							$("#currentImageName"+id).val(imageManagement.currentImageName);
						}
					});

		imageManagement.modifyImageNameModal.show();
	
    },
	test : function() {
		var value = $("#currentImageName")[0].value;
		if (value == null || value == "") {
			alert(Dict.val("img_please_modify_name"));
			return
		}
//		var scoreReg = /^[A-Za-z0-9\_]*$/;
//		// console.log("正则表达式是否正确"+scoreReg.test(property.propertyValue));
//		if (!scoreReg.test(value)) {
//			alert("请输入包含字母数字或下划线");
//			return
//		}
	},
	bindEvent:function(){
		
		if (!imageManagement.contextMenu) {
			imageManagement.contextMenu = new ContextMenu( {
				beforeShow : function(tr) {
					// Route.checkAll(false);
				// 取消所有选中的行，选中当前的行
				$("#imageTable input[type='checkbox']").attr("checked", false);
				var checkBox = tr.find("input[type='checkbox']").attr("checked", true);
				imageManagement.currentImageId = checkBox.attr("currentImageId");
				imageManagement.currentImageName = checkBox.attr("currentImageName");
				imageManagement.currentImageStatus = checkBox.attr("currentImageStatus");
				
				imageManagement.checkSelected();
			},
			afterShow : function(tr) {
				// Route.onInstanceSelected({
				// instanceName : tr.attr("instanceName"),
				// id : tr.attr("instanceId"),
				// state : tr.attr("instanceState")
				// });
			},
			trigger : "#imageTable tr",
			onAction : function(action) {
				imageManagement._invokeAction(action);
			}
			});
		} else {
			imageManagement.contextMenu.reset();
		}

	},
	// 更多操作 的 invoke
	_invokeAction : function(action) {
		var invoker = imageManagement["" + action];
		if (invoker && typeof invoker == 'function') {
			invoker();
		}
	}

};

	