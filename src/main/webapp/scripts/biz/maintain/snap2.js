window.currentInstanceType='snap';
window.Controller = {
		init : function(){
			lb.init();
			if($("#state").val() == "coping"||$("#state").val() == "recovering"){
				$(".coping").addClass("disabled");
				$(".recovering").addClass("disabled");
			}
		},
		refresh : function(){
			lb.updateDataTable();
		}
}
var product = {};
var ContextMenu = function(options){
	var _options = {
		container : options.container || $("#contextMenu"),
		onAction : options.onAction || function(action){},
		trigger  : options.trigger || $("body"),
		beforeShow : options.beforeShow || function(){},
		afterShow : options.afterShow || function(){},
		beforeHide : options.beforeHide || function(){},
		afterHide : options.afterHide || function() {}
	};
	this.setTrigger = function(trigger) {
		_options.trigger = trigger;
		_init();
	};
	this.reset = function(){
		_init();
	};
	this.inMenu = false;
	var _init = function(){
		_options.container = $(_options.container);
		_options.container.hide();
		$(_options.trigger).unbind("mousedown").bind("mousedown",function(e) {
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
				_options.container.attr(
						"style",
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
		_options.container.find("li").unbind("mousedown").bind('mousedown', function(e) {
			_options.container.hide();
			if (!$(this).hasClass("disabled")){
				var action = $(this).attr("action");
				if(action) _options.onAction(action);
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
var lb = {
	productid : "",
	rules : [],
	rules_Modify : [],
	id : 1,
	firstRule : 0,
	lbId : 0,
	modifyLbRuleVM : 0,
	container : $("#lbRule"),	
	wizard : null,
	datatable : new com.skyform.component.DataTable(),		
	subnet : [],
	curSubnet : [],
	createPeridInput : null,
	quota : 1,
	oldName : '',
	currentSnapStatus:null,
	currentSnapId:null,
	createImageModal:null,
	init : function() {
	com.skyform.service.BillService.queryProductPrtyInfo2(function(data){
		lb.productid = data.productId;	
	});
		lb.describeLb();
		var inMenu = false;
		$("#btnRefresh").bind('click',function(){			
			lb.updateDataTable();
		});	
		//创建快照
		$("#btn_create").click(function() {
			 $("#tip").text("")
			 var name = $("#snap_name").val();
			 if(name == ""||name ==null){
				 $("#tip").text(Dict.val("common_name_not_empty"))
				 return
			 }
			 if(valiter.containsChinese(name)){
				 $("#tip").text("不允许输入中文");
				 return;
			 }
				 var condition = {
						 period:0,
						 count:1,
						 productList:[
						 				{
						 			  instanceName : name,
						 	          vmid : $("#vmid").val(),
						 			  productId : Number(lb.productid)//10221
						 				}
						 			  ]
				};
			 com.skyform.service.snap.createSnap(condition,
			function(data) {
				 $("#SnapModal").modal("hide");
				 var _tradeId = data.tradeId;
//					var _fee = $("#feeInput").html();
					var createModal = $("#SnapModal");
					com.skyform.service.BillService.confirmTradeSubmit(0,
							_tradeId, createModal, function onSuccess(data) {
								$.growlUI(Dict.val("common_tip"), Dict.val("img_create_operation_submit_success"));
								lb.updateDataTable();
								$("#createSnap").addClass("disabled");
						}, function onError(msg) {
							$.growlUI(Dict.val("common_tip"), Dict.val("img_create_operation_submit_fail"));
							$("#SnapModal").modal("hide");
							$("#createSnap").addClass("disabled");
						});
					}, function(error) {
						$("#SnapModal").modal("hide");
						$.growlUI(Dict.val("common_tip"), Dict.val("img_create_operation_submit_fail"));
					});
		});
		//删除快照
		$("#btn_delet").click(function() {
			var row = lb.datatable.getContainer().find("tbody").find("input[type='checkbox']:checked").closest('tr');
			var id = $("#vmid").val();
			var snap_id = row.attr("snap_id");
			 var condition = {
					 vmid :  id,
					 //snapID : snap_id,
					 listIds :snap_id
			 }
			 com.skyform.service.snap.deleteSnap(condition, function(result) {
					$("#deleteModal").modal("hide");
						$.growlUI(Dict.val("common_tip"), Dict.val("snap_delete_operation_submit_success"));
						lb.updateDataTable()
					}, function(error) {
						$("#deleteModal").modal("hide");
						$.growlUI(Dict.val("common_tip"), Dict.val("snap_delete_operation_submit_fail"));
					});
		});
		//从快照恢复
		$("#btn_recovery").click(function() {
		var row = lb.datatable.getContainer().find("tbody").find("input[type='checkbox']:checked").closest('tr');
			var id = $("#vmid").val();
			var snap_id = row.attr("snap_id");
			 var condition = {
					 vmid :  id,
					 snapID : snap_id
			 }
			 com.skyform.service.snap.recovery(condition, function(result) {
					$("#backupModal").modal("hide");
						$.growlUI(Dict.val("common_tip"), Dict.val("snap_revert_operation_submit_success"));
					}, function(error) {
						$("#backupModal").modal("hide");
						$.growlUI(Dict.val("common_tip"), Dict.val("snap_revert_operation_submit_fail"));
					});
		});
		$("#contextMenu").bind('mouseover',function(){
			inMenu = true;
		});
		$("#contextMenu").bind('mouseout',function(){
			inMenu = false;
		});
		$("body").bind('mousedown',function(){
			if(!inMenu){
				$("#contextMenu").hide();
			}
		});	
		//更多操作...中的下拉菜单添加监听事件
		$(".dropdown-menu").bind('mouseover',function(){
			inMenu = true;
		});
		$(".dropdown-menu").bind('mouseout',function(){
			inMenu = false;
		});
		$(".dropdown-menu li").bind('click',function(e){
			//lb.handleLi($(this).index());					
		});		
		var realValue;
	},	
	enableButton : function(){
			$("#recoverySnap").attr("disabled",false);
			$("#deleteSnap").attr("disabled",false);
			$("#createImageAction").attr("disabled",false);
	},
	disabledButton : function(){
			$("#recoverySnap").attr("disabled",true);
			$("#deleteSnap").attr("disabled",true);
			$("#createImageAction").attr("disabled",true);
	},
	createImageAction:function(){
		com.skyform.service.imageService.listImage(null, function(data) {
			var sflag = lb.checkImageOpening(data);
			if(sflag){
				var portalType = Dcp.biz.getCurrentPortalType();
				var condition = {
						"serviceType":1018
				};
				if(portalType == "private"){
					condition.billType = 5;
				}else if(portalType == "public"){
					condition.billType = 4;
				}
				com.skyform.service.imageService.QueryProductIdByServiceTypeBillType(condition, function(result) {
					lb.createImageShow(result.data);
				},function onError(error){
					$.growlUI(Dict.val("common_tip"), Dict.val("snap_discover_mirror_product_failures")+error);
				});
			}else{
				$.growlUI(Dict.val("common_tip"),Dict.val("snap_snapshot_image_being_created"));
			}
		},function onError(error){
			$.growlUI(Dict.val("common_tip"), Dict.val("snap_discover_mirror_error") + error.msg);
		});		
	},
	deleteSnap : function(){
			com.skyform.service.imageService.listImage(null, function(data) {
			var sflag = lb.checkImageOpening(data);
			if(sflag){
				$("#deleteModal").modal("show");
			}else{
				$.growlUI(Dict.val("common_tip"),Dict.val("snap_delete_operation"));
			}
		},function onError(error){
			$.growlUI(Dict.val("common_tip"), Dict.val("snap_discover_mirror_error") + error.msg);
		});
	},
	createSnap : function(){
		$("#tip").text("");
			$("#SnapModal").modal("show");	
		},
		recoverySnap : function(){
			com.skyform.service.imageService.listImage(null, function(data) {
			var sflag = lb.checkImageOpening(data);
			if(sflag){
				$("#backupModal").modal("show");
			}else{
				$.growlUI(Dict.val("common_tip"),Dict.val("snap_recovery_operation"));
			}
		},function onError(error){
			$.growlUI(Dict.val("common_tip"), Dict.val("snap_discover_mirror_error") + error.msg);
		});
		},
	test : function() {
		$("#imagetip").text("");
		var value = $("#createImageName").val();
		if (value == null || value == "") {
			$("#imagetip").text(Dict.val("snap_enter_img_name"));
			return;
		}
		if (valiter.containsChinese(value)) {
			$("#imagetip").text("不允许输入中文");
			return;
		}
//		var scoreReg = /^[A-Za-z0-9\_]*$/;
//		if (!scoreReg.test(value)) {
//			alert("请输入包含字母数字或下划线");
//			return
//		}
	},
	checkImageOpening:function(instances){
		var count=0;
		$(instances).each(function(index,item){
			//if(item.imageStatus == 'opening'&&item.snapshotName.indexOf(lb.currentSnapId) > 0){
			if(item.imageStatus == 'opening'&&item.snapshotId==lb.currentSnapId){
				return false;
   			}
			count+=1;
		});
		var ilength = instances.length;
		if(ilength == count){
			return true;
		}else{
			return false;
		}
	},
	createImageShow:function(productId){
		if(!lb.createImageModal){
			lb.createImageModal = new com.skyform.component.Modal(
					"imageModal",
					Dict.val("img_create_image"),
					'<div class="modal-body"> <form  class=\"form-horizontal\"> '
					        + '<fieldset>'
						        + '<div class=\"control-group\">'
							        + '<label class=\"control-label\" for=\"input01\">名称:</label>'
									+ '<div class=\"controls\"><input type=\"text\" style=\"margin-bottom:10px;\" name=\"createImageName\" id=\"createImageName\" onblur=\"lb.test()\"  maxlength=\"32\"><font color=\'red\'>*</font>(必填项)<br>'
									+'<span style=\"color: red;margin-left: 110px;\" id=\"imagetip\"></span>'
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
										var value = $("#createImageName").val();
										if (value == null || value == "") {
											$("#imagetip").text(Dict.val("snap_enter_img_name"));
											return;
										}
										if (valiter.containsChinese(value)) {
											 $("#imagetip").text("不允许输入中文");
											return;
										}
//										var scoreReg = /^[A-Za-z0-9\_]*$/;
//										if (!scoreReg.test(value)) {
//											alert("请输入包含字母数字或下划线");
//											return
//										}
										var image = {
												"period":1,
												"count":1,
												"productList":[
																{
																	"productId":productId,
																	"instanceName": $("#createImageName").val(),
																	"snapshotid":lb.currentSnapId
											}]
									
										};
										$.blockUI();
										var modal = $("#imageModal");
										com.skyform.service.imageService.createImage(image,function(data){
											var _tradeId = data.tradeId?data.tradeId:data.data.tradeId
											$.unblockUI();
											com.skyform.service.BillService.confirmTradeSubmit(0,
													_tradeId, modal, function onSuccess(data) {
														$.growlUI(Dict.val("common_tip"), Dict.val("img_create_operation_submit_success"));
														lb.updateDataTable();
												}, function onError(msg) {
													$.growlUI(Dict.val("common_tip"), Dict.val("img_create_operation_submit_fail")+error);
													$("#createImageName").val("");
													$("#imagetip").text("");
													lb.createImageModal.hide();
													lb.updateDataTable();
												});
										},function(error){
											lb.createImageModal.hide();
											$.unblockUI();
											$.growlUI(Dict.val("common_tip"), Dict.val("img_create_operation_submit_fail")+error); 
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
										$("#createImageName").val("");
										$("#imagetip").text("");
										lb.createImageModal.hide();
									}
								} ]
					});
		}
		lb.createImageModal.show();
	},
	generateTable : function(data){
		lb.datatable = new com.skyform.component.DataTable();
		 lb.datatable.renderByData("#lbTable", {
				"data" : data,
				"pageSize" : 5,
				"onColumnRender" : function(columnIndex,columnMetaData,columnData) {
					 var text = columnData[''+columnMetaData.name] || "";
					 if(columnIndex ==0) {
						 
//						 if($("#state").val() == "coping"||$("#state").val() == "recovering")
//							 text = '<input type="checkbox" disabled="disabled" value="'+text+'">';
//						 else
							 text = '<input type="checkbox" value="'+text+'">';
					 }
					 if (columnMetaData.name == "status") {
//						 text = text;
//						 if(text == "running")
//							 text = "创建成功";
//						else if(text == "opening")
//							 text = "创建中...";
//						else if(text == "create error")
//							 text = "创建失败";
//						else if(text == "deleted")
//							 text = "已删除";
//						else if(text == "deleting")
//							 text = "删除中...";
//						else if(text == "delete error")
//							 text = "删除失败";
					 	text = com.skyform.service.StateService.snapState[columnData.status];
					 }
//					  if (columnMetaData.name == "size") {
//						 text = text;
//						 text = (text/1024)/1024+"M";
//					 }
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
					 if(columnMetaData.name == 'backupName'){
						 text = columnData.backupName
						  +"<a title='"+Dict.val("common_advice")+"' href='../user/workOrder.jsp?code=workOrder&cataCode=service&instanceId="+columnData.snapID+"&serviceType=backup&instanceName="+encodeURIComponent(columnData.backupName)+
						  "&instanceStatus="+columnData.status+
						  "&currentPoolW="+encodeURIComponent(CommonEnum.pools[CommonEnum.currentPool])+
						  "'><i class='icon-comments' ></i></a>";
					 }
					 return text;
				}, 
				"afterRowRender" : function(rowIndex,data,tr){
					tr.attr("instanceId",data.snapID);
					tr.attr("state",data.status);
					tr.attr("status",data.status);
					tr.attr("snap_id",data.snapID);
					lb.bindEventForTr(rowIndex, data, tr);					
					tr.find("input[type='checkbox']").click(function(){
						lb.checkSelected();
						var row = $("#lbTable input[type='checkbox']:checked").eq(0).closest('tr');
						lb.currentSnapStatus = row.attr("status");
						lb.currentSnapId = row.attr("snap_id");
			        });
					tr.click(function(){
//						lb.getOptLog(data.id);
					});					
				},      
				"afterTableRender" : function() {
					lb.bindEvent();
					if(!lb.contextMenu) {
						lb.contextMenu = new ContextMenu({
							beforeShow : function(tr){
								lb.checkAll(false);
								tr.find("input[type='checkbox']").attr("checked",true);
								lb.currentSnapId = tr.attr("snap_id");
							},
							onAction : function(action) {
								lb._invokeAction(action);
							},
							afterShow : function(tr) {
								lb.checkSelected({
									instanceName : tr.attr("instancename"),
									id : tr.attr("instanceid"),
									state : tr.attr("state")
								});
							},
							trigger : "#lbTable tr"
						});
					}else {
						lb.contextMenu.reset();
					}
				}
		});
		 lb.datatable.addToobarButton("#toolbar4tb2");
		 lb.datatable.enableColumnHideAndShow("right");		 
	},
	checkAll : function(check){
		if(check) $("#lbTable tbody input[type='checkbox']").attr("checked",true);
		else $("#lbTable tbody input[type='checkbox']").removeAttr("checked");
		lb.checkSelected(false);
	},
	bindEventForTr : function(rowIndex, data, tr) {
		$(tr).click(function(e) {
			if(3 == e.which){
				var checkboxArr = lb.getCheckedArr();
				if(checkboxArr.length == 1){
					lb.enableButton();
				} else {
					lb.disabledButton();
				}
			}
			var checkboxArr = lb.getCheckedArr();
			if(checkboxArr.length == 1){
				lb.enableButton();
			} else {
				lb.disabledButton();
			}
		});
	},
	checkSelected : function(selectInstance) {
		var rightClicked = selectInstance?true:false;
		var allCheckedBox = $("#lbTable input[type='checkbox']:checked");
		var oneSelected = allCheckedBox.length == 1;
		var hasSelected = allCheckedBox.length > 0;
		var state = $(allCheckedBox[0]).parents("tr").attr("state");
		if(selectInstance) {
			state = selectInstance.state;
		}
		$(".operation").each(function(index,operation){
			var condition = $(operation).attr("condition");			
			var action = $(operation).attr("action");
			var enabled = true;
			eval("enabled=("+condition+")");
			if(enabled) {
				$(operation).removeClass("disabled");
				$(operation).removeAttr("disabled");
			} else {
				$(operation).addClass("disabled");
				$(operation).attr("disabled","disabled");
			}
		});
		lb._bindAction();
		if(rightClicked) {
			$("#recoverySnap").attr("disabled",false);
			$("#deleteSnap").attr("disabled",false);
			lb.instanceName = selectInstance.instanceName;
			lb.selectedInstanceId = selectInstance.id;	
		} else {
			for ( var i = 0; i < allCheckedBox.length; i++) {
				var currentCheckBox = $(allCheckedBox[i]);
				if (i == 0) {
					lb.instanceName = currentCheckBox.parents("tr").attr("name");
					lb.selectedInstanceId = currentCheckBox.attr("value");
				} else {
					lb.instanceName += "," + currentCheckBox.parents("tr").attr("name");
					lb.selectedInstanceId += "," + currentCheckBox.attr("value");
				}
			}
		}
	},
	describeLb : function(){	
		//将自己编写的显示主机的table渲染
		Dcp.biz.apiAsyncRequest("/snapshot/searchSnap", {vmid:$("#vmid").val()}, function(data) {	
			if (data.code != "0") {
				$.growlUI(Dict.val("common_tip"), Dict.val("img_select_snapshot_fail") + data.msg); 
			} else {	
					if(!data.data){
						data.data = data.snaps;
					}
					lb.instances = data.data ;					
					lb.generateTable(data.data);
					if(data.data){
						if (data.data.length > 0){
							lb.firstRule = data.data[0].id;
						}						
					}
			}
		},function onError(){
			lb.generateTable();
		});		
	},
bindEvent : function() {
		$("#checkAll").unbind("click").bind("click", function(e) {
			var checked = $(this).attr("checked") || false;
	        $("#lbTable input[type='checkbox']").attr("checked",checked);	 
		});
		lb.checkSelected();
	},
	// 刷新Table
	updateDataTable : function(id) {
		 lb.datatable.container.find("tbody").html("<tr ><td colspan='7' style='text-align:center;'><img src='"+CONTEXT_PATH+"/images/loader.gif'/><strong>"+Dict.val("common_retrieving_data_please_wait")+"</strong></td></tr>");
		Dcp.biz.apiAsyncRequest("/snapshot/searchSnap",{vmid:$("#vmid").val()}, function(data) {
			if (data.code == 0) {
				if(!data.data){
					data.data = data.snaps;
				}
				lb.disabledButton();
				lb.instances = data.data;
				lb.datatable.updateData(data.data);
			}
		});		
	},
	getCheckedArr : function() {
		return $("#lbTable tbody input[type='checkbox']:checked");
	},
	_bindAction : function(){
		$(".actionBtn").unbind().click(function(){
			if($(this).hasClass("disabled")) return;
			var action = $(this).attr("action");
			lb._invokeAction(action);
		});
	},
	_invokeAction : function(action){
		var invoker = lb["" + action];
		if(invoker && typeof invoker == 'function') {
			invoker();
		}
	},
	renew : function(){
		var lbId = lb.getCheckedArr().parents("tr").attr("instanceId");
		if(lb.renewModal){
			
		}else{
			lb.renewModal = new com.skyform.component.Renew(lbId,{
				buttons : [
							{
								name : Dict.val("common_save"),
								onClick : function(){
									var period = lb.renewModal.getPeriod().getValue();
									$("#renewModal").modal("hide");	
									var _modal = $("#renewModal");
									com.skyform.service.renewService.renew(lb.getCheckedArr().parents("tr").attr("instanceId"),period,function onSuccess(data){
										//订单提交成功后校验用户余额是否不足
										var _tradeId = data.tradeId;
										var _fee = $("#feeInput_renew").text();
										com.skyform.service.BillService.confirmTradeSubmit(_fee,_tradeId,_modal,function onSuccess(data){
											$.growlUI(Dict.val("common_tip"), Dict.val("common_renewal_successful_debit_successful_please_wait")); 
											// refresh
											lb.updateDataTable();									
										},function onError(msg){
											$.growlUI(Dict.val("common_tip"), Dict.val("common_renewal_successful_failed_charge"));
										});								
									},function onError(msg){
										$.growlUI(Dict.val("common_tip"), Dict.val("common_renew_submit_failed") + msg); 
									});				
								},
								attrs : [
									{
										name : 'class',
										value : 'btn btn-primary'
									}
								]
							},
							{
								name : Dict.val("common_cancel"),
								attrs : [
									{
										name : 'class',
										value : 'btn'
									}
								],
								onClick : function(){
									lb.renewModal.hide();
								}
							}
						]
					});
		}
			lb.renewModal.getFee_renew(lbId);
			lb.renewModal.show();		
			$(".subFee_renew").bind('mouseup keyup',function(){
				setTimeout('lb.renewModal.getFee_renew('+lbId+')',100);
			});
	}
};
