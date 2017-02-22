window.currentInstanceType='nas_backup';
var timernas = null;

//var AutoUpdater_nas2 = {
//		updaters : {
//			"nas" : {
//			}
//		},
//		startNas : function(){
//			var updater = AutoUpdater_nas2.updaters["" + currentInstanceType];
//			if (updater) {
//				updater.getInterval = updater.getInterval || function() {
//					return 30 * 1000;
//				};
//				timernas = window.setInterval(function(){
//					var showCreateNasBtn = false;
//					//如果用户申请过了存在running状态的实例
//					var _hass3user = nas.hasS3User();
//					if(_hass3user){  //用户在s3上已经存在
//						showCreateNasBtn = true;
//					}							
//					if (showCreateNasBtn) {
//						$("#createNasUser").addClass("disabled");
//						$("#createNasUser").attr("disabled",true);						
//						$("#createNasVolume").removeClass("disabled");
//						$("#createNasVolume").attr("disabled",false);
//						$("#resetPassword").removeClass("disabled");
//						$("#resetPassword").attr("disabled",false);									
//					}else{
//						$("#createNasUser").removeClass("disabled");
//						$("#createNasUser").attr("disabled",false);
//						$("#createNasVolume").addClass("disabled");
//						$("#createNasVolume").attr("disabled",true);
//						$("#resetPassword").addClass("disabled");
//						$("#resetPassword").attr("disabled",true);
//					}					
//				}, updater.getInterval());
//			}
//		},
//		stopNas : function(){
//			window.clearInterval(timernas);
//		}
//};

window.Controller = {
		init : function(){
			nas.init();
			// 查询虚拟硬盘列表
			nas.describeNasVolumes();
		}
	};

var product = {};
var nas = {
		datatable : new com.skyform.component.DataTable(),
		confirmModal : null,
		confirmModal_detach : null,
		instances : [],
		folderNamePerfix : null,
		service : com.skyform.service.NasService4yaxin,
		obsService4yaxin : com.skyform.service.ObsService4yaxin,
		init : function(ebs) {
			//弹性块计费类型
			nas.queryProductPrtyInfo(4);
			nas.bindEvent();			
			//更多操作...中的下拉菜单添加监听事件
			var inMenu = false;
			$(".dropdown-menu").bind('mouseover',function(){
				inMenu = true;
			});		
			$(".dropdown-menu").bind('mouseout',function(){
				inMenu = false;
			});
			$("#dropdown li").bind('click',function(e){
				$("#dropdown-menu").hide();
				// 如果选项是灰色不可用的
				if (!$(this).hasClass("disabled")) {
					nas.onOptionSelected($(this).index());
				}
			});	
			// 查询虚拟硬盘列表
			nas.describeNasVolumes(ebs);
			//为table的右键菜单添加监听事件
			$("#contextMenu").bind('mouseover',function(){
				inMenu = true;
			});		
			$("#contextMenu").bind('mouseout',function(){
				inMenu = false;
			});
			
			$("#contextMenu li").bind('click',function(e){
				$("#contextMenu").hide();
				// 如果选项是灰色不可用的
				if (!$(this).hasClass("disabled")) {
					nas.onOptionSelected($(this).index());					
				}
			});
			$("body").bind('mousedown',function(){
				if(!inMenu){
					$("#contextMenu").hide();
				}
			});

			//点击恢复按钮
			$("#recover").bind('click',function(e){
				nas.onOptionSelected(0);				
			});	
			$("#delete").bind('click',function(e){
				nas.onOptionSelected(1);				
			});	
		},
		onOptionSelected : function(index) {
			if(index == 0){
				nas.showRecover();
			}else if(index == 1){
				nas.showDeleteBack();	
			}
		},
		showDeleteBack : function() {
			var checkedArr =  nas.getCheckedArr();
			var volumeNames = "";
			var volumeIds = [];
			$(checkedArr).each(function(index, item) {
				var tr = $(item).parents("tr");
				volumeNames += $($("td", tr)[2]).text();
				var id = $("input[type='checkbox']", $("td", tr)[0]).val();
				volumeIds.push(id);
				if (index < checkedArr.length - 1) {
					volumeNames += ",";
				}
			});
			var deleteTip = "";
			if(checkedArr.length==1){
				deleteTip = "您确认要删除吗?";
			}else{
				deleteTip = "您确认要批量删除吗?";
			}
				nas.confirmModal = new com.skyform.component.Modal(new Date().getTime(),"删除备份","<h4>"+deleteTip+"</h4>",{
					buttons : [
						{
							name : "确定",
							onClick : function(){
								// 删除虚拟硬盘
								var vdiskVolumeIds = volumeIds.join(",");
								nas.service.destroy(vdiskVolumeIds,function onSuccess(data){
									$.growlUI("提示", "删除申请提交成功, 正在销毁中..."); 
									nas.confirmModal.hide();
									// refresh
									nas.updateDataTable();									
								},function onError(msg){
									$.growlUI("提示", "删除申请提交失败：" + msg);
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
							name : "取消",
							attrs : [
								{
									name : 'class',
									value : 'btn'
								}
							],
							onClick : function(){
								nas.confirmModal.hide();
							}
						}
					]
				});
			nas.confirmModal.setWidth(500).autoAlign();
			nas.confirmModal.show();
		},
		showRecover : function() {
			var checkedArr =  nas.getCheckedArr();
			var volumeNames = "";
			var volumeIds = [];
			$(checkedArr).each(function(index, item) {
				var tr = $(item).parents("tr");
				volumeNames += $($("td", tr)[2]).text();
				var id = $("input[type='checkbox']", $("td", tr)[0]).val();
				volumeIds.push(id);
				if (index < checkedArr.length - 1) {
					volumeNames += ",";
				}
			});
			var deleteTip = "";
			if(checkedArr.length==1){
				deleteTip = "您确认要从备份恢复吗?";
			}else{
				deleteTip = "您确认要批量从备份恢复吗?";
			}
				nas.confirmModal = new com.skyform.component.Modal(new Date().getTime(),"从备份恢复","<h4>"+deleteTip+"</h4>",{
					buttons : [
						{
							name : "确定",
							onClick : function(){
								var snapid = volumeIds.join(",");
								var volumeid = nas.getCheckedArr().parents("tr").attr("volumeid");
								var params = {
										"volumeid":parseInt(volumeid),
										"snapid":parseInt(snapid)
									};
								com.skyform.service.VdiskService4yaxin.rollbackVolumeFromSnap(params,function onSuccess(data){
									$.growlUI("提示", "恢复申请提交成功, 正在恢复中..."); 
									nas.confirmModal.hide();
									// refresh
									nas.updateDataTable();									
								},function onError(msg){
									$.growlUI("提示", "恢复申请提交失败：" + msg);
									nas.confirmModal.hide();
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
							name : "取消",
							attrs : [
								{
									name : 'class',
									value : 'btn'
								}
							],
							onClick : function(){
								nas.confirmModal.hide();
							}
						}
					]
				});
			nas.confirmModal.setWidth(500).autoAlign();
			nas.confirmModal.show();
		},	
		// 查询虚拟硬盘列表
		describeNasVolumes : function(ebs) {
			//如果没有返回结果 {"msg":"","data":"返回结果为空！","code":0} 明天要问
//			var _user = "";
//			var _states = "";
			com.skyform.service.VdiskService4yaxin.listAllBackups("1013",function onSuccess(data){
			/*	data = [{"snapid":1,"snapname":"chentt","volumename":"卷名称","state":"就绪","resourcepoolid":"呼和浩特","createDate":"2015-03-04"},{"snapid":1,"snapname":"chentt","volumename":"卷名称","state":"就绪","resourcepoolid":"呼和浩特","createDate":"2015-03-04"}];*/
				nas.instances = data;
				nas.renderDataTable(data,ebs);	
				if(ebs != '' && ebs != 'null'){
					$(".dataTables_filter input").val(decodeURI(ebs));
					$(".dataTables_filter input").trigger("keyup");							
				}
			},function onError(msg){
				$.growlUI("提示", "查询文件存储发生错误：" + msg); 
			});
		},
		renderDataTable : function(data,ebs) {
			nas.datatable.renderByData("#nasTable", {
					"data" : data,
					"iDisplayLength": 5,
//					"columnDefs" : [
//					     {title:"<input type='checkbox' id='checkAll'>", name : "id"},
//					    // {title : "ID", name : "id",contentVisiable:"hide"},
//					     {title : "备份名称", name : "snapname"},
//					     {title : "目录名称", name : "volumename"},
//					     {title : "状态", name : "state"},
//					     {title : "资源池", name : "resourcepoolid"},
//					     {title : "创建时间", name : "createDate"}					     
//					],
					"onColumnRender" : function(columnIndex, columnMetaData, columnData) {
						 var text = columnData[''+columnMetaData.name] || "";
						 if(columnMetaData.name == 'snapid') {
							 text = '<input type="checkbox" value="'+text+'">';
						 }
						 if (columnMetaData.name == "ID") {
							 text = text;
						 }
						 if (columnMetaData.name == "state") {
							 if (columnData.optState == null || columnData.optState == "") {
								 text = com.skyform.service.StateService.getState("vdisk",text);
							 } else {
								 text = com.skyform.service.StateService.getState("vdisk",columnData.optState);
							 }
						 }
						 if (columnMetaData.name == "createDate") {
							 text = new Date(text).format("yyyy-MM-dd hh:mm:ss");
						 }
						 if (columnMetaData.name == "expireDate") {
							 text = new Date(text).format("yyyy-MM-dd hh:mm:ss");
						 }
						 if(columnMetaData.name == "resourcepoolid"){
							 text =  CommonEnum.pools[text];
						 }
						 return text;
					}, 
					"afterRowRender" : function(rowIndex, data, tr){
						tr.attr("state", data.state).
						attr("comment", data.comment).
						attr("optState", data.optState);
						tr.attr("ownUserId", data.ownUserId).
						attr("id", data.id). 
						attr("volumeid", data.volumeid);
						var _title = data.instanceName;
		                var insname = commonUtils.subStr4view(_title, 35, "...");
		                tr.find("td[name='instanceName']").html(insname);
						tr.find("td[name='instanceName']").attr("title",_title);
						var title = data.allCatalogueName;
						var ca = commonUtils.subStr4view(title, 35, "...");
		                tr.find("td[name='allCatalogueName']").html(ca);
						tr.find("td[name='allCatalogueName']").attr("title",title);
					
					},
					"afterTableRender" : function() {
						// 翻页的时候清除前一页选中的checkbox，同时将更多操作置为不可用
						$("#nasTable input[type='checkbox']").attr("checked", false);
			            //全选取消选中
			            $("#checkAll").attr("checked", false);			             
						$("#recover").addClass("disabled");
						$("#recover").attr("disabled",true);
						$("#delete").addClass("disabled");
						$("#delete").attr("disabled",true);
						nas.bindEvent();
						var firstRow = $("#nasTable tbody").find("tr:eq(0)");
						var firstInsId = firstRow.attr("id");
						//显示第一条记录的日志
						nas.showInstanceInfo(firstInsId);
						firstRow.css("background-color","#BCBCBC");
						nas.setSelectRowBackgroundColor(firstRow);
					}
				}
			);
			nas.datatable.addToobarButton("#nastoolbar");
			nas.datatable.enableColumnHideAndShow("right");
		},
		setSelectRowBackgroundColor : function(handler) {
			$("#content_container tr").css("background-color","");
			handler.css("background-color","#BCBCBC");
		},		
		bindEvent : function() {
			$("tbody tr").mousedown(function(e) {  
			    if (3 == e.which) {  
			             document.oncontextmenu = function() {return false;};  
			             var screenHeight = $(document).height();
			             var top = e.pageY;
			             if(e.pageY >= screenHeight / 2) {
			             	top = e.pageY - $("#contextMenu").height();
			             }
			             $("#contextMenu").hide();  
			             $("#contextMenu").attr("style","display: block; position: absolute; top:"  
			             + top  
			             + "px; left:"  
			             + e.pageX  
			             + "px; width: 180px;");  
			             $("#contextMenu").show();  
			             e.stopPropagation();
			             
			             var state = $(this).attr("state");
			             var optState = $(this).attr("optState");
			             // 如果不是非就绪状态，则将删除选项和挂载到主机以及快照管理选项置为不可用灰色
			             if (state == "running" && (optState == undefined || optState == "")) {
			            	 $("#contextMenu").find("li.deleteVm").removeClass("disabled");
			             	 $("#contextMenu").find("li.attachVm").removeClass("disabled");
			             } else {
			            	 $("#contextMenu").find("li.deleteVm").addClass("disabled");
			             	 $("#contextMenu").find("li.attachVm").addClass("disabled");
			             }
			             
			             // 选中右键所单击的行，取消其他行的选中效果
			             $("tbody input[type='checkbox']").attr("checked", false);
			             //全选取消选中
			             $("#checkAll").attr("checked", false);			             
			             $("input[type='checkbox']",$(this)).attr("checked", true);
			             //同步“更多操作”
			             nas.showOrHideDeleteOpt();
			             nas.showOrHideRecoverOpt();
			     } 
			    nas.showInstanceInfo($(this).attr("id"));
			    nas.setSelectRowBackgroundColor($(this));
			}); 
			
			$("#checkAll").unbind("click").bind("click", function(e) {
				var checked = $(this).attr("checked") || false;
		        $("#nasTable input[type='checkbox']").attr("checked",checked);	 
		        nas.showOrHideDeleteOpt();
		        nas.showOrHideRecoverOpt();
		        e.stopPropagation();
			});
			
			$("#nasTable tbody input[type='checkbox']").unbind("click").bind("click", function() {
				 nas.showOrHideDeleteOpt();
				 nas.showOrHideRecoverOpt();
			});
			
			$("#btnRefresh").unbind("click").bind("click", function() {
				//根据存储上是否开通nas账户来控制创建目录按钮				
				nas.updateDataTable();	
				//nas.showOrHideCreateNas();
			});

		},
		showInstanceInfo : function(vdiskId){
			$("#opt_logs").empty();
			if (!vdiskId || vdiskId<=0) return;
			com.skyform.service.LogService.describeLogsUIInfo(vdiskId);
//			com.skyform.service.LogService.describeLogsInfo(vdiskId,function onSuccess(logs){	
//				$("#opt_logs").empty();
//				$(logs).each(function(i,v){
//					var desc = "";
//					if(v.description){
//						if(v.description != ""){
//							desc = "("+v.description+")";
//						}						
//					}
//					var _name = "";
//					if(v.subscription_name){
//						_name = v.subscription_name;
//					}
//					$("<li class='detail-item'><span>" + v.createTime + "  "+v.subscription_name+"  " + v.controle +desc+ "</span></li>").appendTo($("#opt_logs"));
//				});
//			},function onError(msg){
//			});			
		},
		// 刷新Table
		updateDataTable : function() {
			com.skyform.service.VdiskService4yaxin.listAllBackups("1013",function onSuccess(data){
				nas.instances = data;
				nas.datatable.updateData(data);	
			},function onError(msg){
			});
			$("#recover").addClass("disabled");
			$("#recover").attr("disabled",true);
			$("#delete").addClass("disabled");
			$("#delete").attr("disabled",true);
		},
		// 根据选中的虚拟硬盘的状态判断是否将删除选项置为不可用， 还要根据是否挂载虚机
		showOrHideDeleteOpt : function() {
			var checkboxArr = $("#nasTable tbody input[type='checkbox']:checked");
			if(checkboxArr.length == 0){
				$("#delete").addClass("disabled");
				$("#delete").attr("disabled",true);
			} else {
				$("#delete").removeClass("disabled");
				$("#delete").attr("disabled",false);
				var hideDelete = false;
				$(checkboxArr).each(function(index, item) {
					var state = $(item).parents("tr").attr("state");
					var optState = $(item).parents("tr").attr("optState");
					if(state != "running"){  //state != "error"
						hideDelete = true;
						return;
					} else {
						if (optState != undefined && optState != "") {
							hideDelete = true;
							return;
						}
					}
				});
			    if (!hideDelete) {
			    	$("#delete").removeClass("disabled");
			    	$("#delete").attr("disabled",false);
			    } else {
			    	$("#delete").addClass("disabled");
			    	$("#delete").attr("disabled",true);
			    }
			}
		},
		// 根据选中的虚拟硬盘的状态判断是否将删除选项置为不可用， 还要根据是否挂载虚机
		showOrHideRecoverOpt : function() {
			var checkboxArr = $("#nasTable tbody input[type='checkbox']:checked");
			if(checkboxArr.length == 0){
				$("#recover").addClass("disabled");
				$("#recover").attr("disabled",true);
			} else {
				$("#recover").removeClass("disabled");
				$("#recover").attr("disabled",false);
				var hideDelete = false;
				$(checkboxArr).each(function(index, item) {
					var state = $(item).parents("tr").attr("state");
					var optState = $(item).parents("tr").attr("optState");
					if(state != "running"){  //state != "error"
						hideDelete = true;
						return;
					} else {
						if (optState != undefined && optState != "") {
							hideDelete = true;
							return;
						}
					}
				});
			    if (!hideDelete) {
			    	$("#recover").removeClass("disabled");
			    	$("#recover").attr("disabled",false);
			    } else {
			    	$("#recover").addClass("disabled");
			    	$("#recover").attr("disabled",true);
			    }
			}
		},
		getCheckedArr :function() {
			return $("#nasTable tbody input[type='checkbox']:checked");
		},
		queryProductPrtyInfo :function(index){
			com.skyform.service.BillService.queryProductPrtyInfo(index,window.currentInstanceType,function(data){
				product.productId = data.productId;
				$("#unit").html(product.unit);
			});
		},
		getFee : function(){
			if(CommonEnum.offLineBill)return;
			var period = nas.createPeridInput.getValue();
			var peridUnit = $("#peridUnit").html();
			if(peridUnit == '年'){
				period = period*12;
			}
			var param = {
					"period":period,
					"productPropertyList":[									
					    {
								"muProperty":"storageSize",
								"muPropertyValue":$("#createStorageSize").val(),
								"productId":product.productId
						}
						] 
					};
				Dcp.biz.apiAsyncRequest("/pm/queryCaculateFeeByPrtyList",param, function(data) {
					if(0 == data.code){
						var count =1;
						var fee =  data.data.fee;
						$("#feeInput").text(count *fee/1000);
					}
				});
		}
		
};