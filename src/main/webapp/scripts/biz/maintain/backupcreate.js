//当前刷新实例的类型为云备份
window.Controller = {
	init : function() {
		BackupCreate.init();
	},
	refresh : function() {
		BackupCreate.refreshData();
	}
}
window.otherCurrentInstanceType = 'backupCreate1';
//window.othersCurrentInstanceType = 'eip';
var BackupCreate = {// 
	setupType:{"1":"系统文件备份","2":"网络文件备份","3":"数据库文件备份"},
	backupPriod:{"1":"每天","7":"每周"},
	backupsdays:{"1":"星期一","2":"星期二","3":"星期三","4":"星期四","5":"星期五","6":"星期六","0":"星期日"},
	//开启，关闭，备份中，开启中，关闭中，备份错误，开启错误，关闭错误，创建中，创建失败
	state:{
	    "stopping": "关闭中...",
	    "closed": "关闭",
	    "backuping": "备份中...",
	    "starting": "开启中...",
	    "stopping": "关闭中...",
	    "running":"开启",
	    "opening": "创建中...",
	    "deleting":"删除中...",
	    "create error": "创建失败",
	    "stop error": "关闭失败",
	    "start error": "开启失败",
	    "backup error":"备份失败",
	    "cloud backup error":"备份失败",
	    "delete error":"删除失败",
	    "cloud backup path error":"备份路径错误",
	    "rollbacking":"还原中",
		"rollback error":"还原失败"



	},
	data : [],
	wizard:null,
	dtTable : null,
	contextMenu : null,
	fullData:null,
	services:com.skyform.service.backupCloudService,
	scope : "backupCreate1",
	paramsbackupSee:null,
	backupKey:"",
	periodVal:"",
	taskCurrentPage:1,
	refreshFlag:true,
	init : function() {
		BackupCreate.refreshData();
		BackupCreate._bindAction();
		BackupCloud.describleVM();
	},
	// /////////////////////////////////////////////////////////////////////////
	// Actions start
	// /////////////////////////////////////////////////////////////////////////

	destroy : function() {
		var canDestoryRoute = true;
		if (canDestoryRoute) {
			ConfirmWindow.setTitle("删除云备份文件").setContent("<h4>确认要删除云备份吗？</h4>").onSave = function() {
				var Ids = new Array();
				Ids = BackupCreate.selectedInstanceId.split(",");
				var params={
						"subscriptionId":Ids[0]
				};
				 ;
				 BackupCreate.services.listBackupCloudDir(BackupCreate.paramsbackupSee,function(result){
//					  if(result.length<0){
					if(result.length>0){
						
						  ErrorMgr.showError("ID为" + Ids
									+ "的云备份文件有备份的文件，请先删除备份的文件。");
						  
					  }else{
						  BackupCreate.services.deleteBackupCloud(params,function(result){
								$.growlUI("删除云备份文件", "删除云备份文件成功!");
							},function(error){
								ErrorMgr.showError("ID为" + Ids
										+ "的云备份文件有备份的文件，请先删除备份的文件。");
							});
					  }
				  },function(error){
					  ErrorMgr.showError("ID为" + Ids
								+ "查询该任务下面的备份文件错误");
				  });
				
				//需要查询该备份文件下是否有正在备份的文件或有备份好的文件
//				$(routeIds).each(
//						function(index, _routeIds) {
//							var ruint = _routeIds;
//							var param = {
//								"subscriptionId" : parseInt(_routeIds)
//							};
//							Route.service.destroy(param, function(data) {
//								// 下面的四五行其实是用不到了，暂时留着吧，路由删除不成功，不会执行此函数了，会执行function(error)这个函数
//								if (data == 1) {
//									ErrorMgr.showError("ID为" + _routeIds
//											+ "的路由下有关联子网，请先删除子网。");
//								}
//								if (data == 2) {
//									ErrorMgr.showError("ID为" + _routeIds
//											+ "的路由已经和带宽绑定，请先解绑。");
//								}
//								if (data != 1 && data != 2) {
//									$.growlUI("销毁路由器", "路由器销毁成功!");
//									ConfirmWindow.hide();
//									Route.refreshData();
//								}
//							}, function(error) {// 删除不成功会执行此函数
//								ErrorMgr.showError(error);
//							});
//						});
				ConfirmWindow.hide();
			};
			ConfirmWindow.setWidth(500).autoAlign().setTop(100);
			ConfirmWindow.show();
		}
	},
//	update : function() {
//			FormWindow.setTitle("开启").setContent(
//					"" + $("#update_route_form").html()).onSave = function() {
//				
//				BackupCreate.service.update(BackupCreate.selectedInstanceId, {
//					"subscriptionId" : parseInt(BackupCreate.selectedInstanceId),
//					"instanceName" : $("#update_form_route_name").val(),
//					"comment" : $("#update_form_route_desc").val()
//				}, function(result) {
//					FormWindow.hide();
//					$.growlUI("修改路由器", "修改成功！");
//					BackupCreate.refreshData();
//				}, function(error) {
//					FormWindow.showError(error);
//				});
//			};
//			FormWindow.beforeShow = function(container) {
//				var oldInstanceName = $(
//						"#instanceTable tbody input[type='checkbox']:checked")
//						.parents("tr").attr("instanceName");
//				container.find("#update_form_route_name").val(
//						oldInstanceName || "");
//				// container.find("#update_form_route_name").val(route.name||"");
//			};
//			FormWindow.setWidth(500).autoAlign().setTop(100);
//			FormWindow.show();
//
//		
//	},
	start : function() {
		FormWindow.setTitle("开启").setContent(
				"<h4>确定要开启此虚拟机云备份吗？</h4>" ).onSave = function() {
			
			com.skyform.service.backupCloudService.startBackupCloud({
				"subscriptionId" : BackupCreate.selectedInstanceId
			}, function(result) {
				FormWindow.hide();
				$.growlUI("开启云备份任务", "开启成功！");
				BackupCreate.refreshData();
			}, function(error) {
				FormWindow.hide();
//				FormWindow.showError(error);
				$.growlUI("提示", "日志发生错误：" + error);
			});
		};
		
		
		
//		FormWindow.beforeShow = function(container) {
//			var oldInstanceName = $(
//					"#instanceTable tbody input[type='checkbox']:checked")
//					.parents("tr").attr("instanceName");
//			container.find("#update_form_route_name").val(
//					oldInstanceName || "");
//			// container.find("#update_form_route_name").val(route.name||"");
//		};
		FormWindow.setWidth(500).autoAlign().setTop(100);
		FormWindow.show();

	
	},
	
//	secretKey: function() {
//		FormWindow1.setTitle("云备份秘钥").setContent(
//			"<div class='control-group' style='float: left;'><label class='control-label' style='float: left; margin-top:5px;margin-left:10px;'>云备份 key:</label><input type='text' value='"+BackupCreate.backupKey+"' style='margin-top:3px; width:300px; '  />&nbsp;&nbsp;</div>").onSave = function() {
//				
//	};
	
	secretKey: function() {
//		$("a[name='seebackup']").unbind().bind("click",function(){
			  $("a[href='#private_network']").trigger("click");
			  $("#taskName1").empty().val( BackupCreate.paramsbackupSee.condition.taskName);
			  $("#vmName1").empty().val(BackupCreate.paramsbackupSee.condition.vmName);
			  $("#vmName1_id").empty().val(BackupCreate.paramsbackupSee.condition.vm_id);
			  $("#taskName_id").empty().val(BackupCreate.paramsbackupSee.condition.backuptask_id);
			  $("#searchByParams1").trigger("click");
//			   setTimeout(function () { 
//				   $("a[href='#searchByParams1']").trigger("click");
//			    }, 1000);
//			});

	
//	FormWindow1.afterHidden = function(container) {
//	};
//	FormWindow1.setWidth(500).autoAlign().setTop(100);
//	FormWindow1.show();
	
	
	},
	
	closed : function() {
		FormWindow.setTitle("关闭").setContent(
				"<h4>确定要关闭此虚拟机云备份吗？</h4>").onSave = function() {
			
			com.skyform.service.backupCloudService.closedBackupCloud({
				"subscriptionId" : BackupCreate.selectedInstanceId
			}, function(result) {
				FormWindow.hide();
				$.growlUI("关闭云备份任务", "关闭成功！");
				BackupCreate.refreshData();
			}, function(error) {
				FormWindow.hide();
//				FormWindow.showError(error);
				$.growlUI("提示", "日志发生错误：" + error);
			});
		};
//		FormWindow.beforeShow = function(container) {
//			var oldInstanceName = $(
//					"#instanceTable tbody input[type='checkbox']:checked")
//					.parents("tr").attr("instanceName");
//			container.find("#update_form_route_name").val(
//					oldInstanceName || "");
//			// container.find("#update_form_route_name").val(route.name||"");
//		};
		FormWindow.setWidth(500).autoAlign().setTop(100);
		FormWindow.show();
	
	
	},
//	newExecute : function() {
//		FormWindow.setTitle("立即执行").setContent(
//				"<h4>确定要立即执行此云备份吗？</h4>").onSave = function() {
//
//			com.skyform.service.backupCloudService.nowExecuteBackupCloud({
//				"subscriptionId" : BackupCreate.selectedInstanceId
//			}, function(result) {
//				FormWindow.hide();
//				$.growlUI("立即执行允备份任务", "立即执行成功！");
//				BackupCreate.refreshData();
//			}, function(error) {
//				FormWindow.hide();
//				$.growlUI("立即执行允备份任务出错", error);
////				FormWindow.showError(error);
//			});
//		};
////		FormWindow.beforeShow = function(container) {
////			var oldInstanceName = $(
////					"#instanceTable tbody input[type='checkbox']:checked")
////					.parents("tr").attr("instanceName");
////			container.find("#update_form_route_name").val(
////					oldInstanceName || "");
////			// container.find("#update_form_route_name").val(route.name||"");
////		};
//		FormWindow.setWidth(500).autoAlign().setTop(100);
//		FormWindow.show();
//
//
//	},
	newExecute : function() {		var context =
		"<input type=\"checkbox\" id=\"fullbackupFlag\" value='true'  />&nbsp;&nbsp;" +
		"<label class='control-label' for='fullbackupFlag' style='float: left; margin-top:5px;margin-left:0px;'>完全备份：</label>";
		FormWindow.setTitle("立即执行").setContent(context).onSave = function() {
			var params={
				"params":{
					"subscriptionId":BackupCreate.selectedInstanceId,
					"flag":$('input:checkbox[id="fullbackupFlag"]:checked').val()=='true'?'true':'false'
				}
			};//
			com.skyform.service.backupCloudService.nowExecuteBackupCloud(params, function(result) {
				FormWindow.hide();
				$.growlUI("立即执行允备份任务", "立即执行成功！");
				BackupCreate.refreshData();
			}, function(error) {
				FormWindow.hide();
				$.growlUI("立即执行允备份任务出错", error);
			});
		};
		FormWindow.setWidth(500).autoAlign().setTop(100);
		FormWindow.show();
	},
	openTopoView : function() {
		var row = BackupCreate.dtTable.getContainer().find("tbody").find(
				"input[type='checkbox']:checked").closest('tr');
		// window.location.href = "topoView.jsp?id="+row.attr("eInstanceId");
		window.open("topoView.jsp?code=net&id=" + row.attr("eInstanceId"));
	},
	showDetails : function(instance) {
		if (!BackupCreate.data || BackupCreate.data.length < 1)
			return;
		if (!instance) {
			instance = BackupCreate.data[0];
		}
		$("div[scope='" + BackupCreate.scope + "'] .detail_value").each(
				function(i, item) {
					var prop = $(item).attr("prop");
					var value = instance['' + prop] || "---";
					if (prop == "status") {
						value = com.skyform.service.StateService.getState("route", instance);
					}
					$(item).html(value);
				});
		// com.skyform.service.LogService.getRouteLogByRouteId(instance.id,function(logs){
		// $("#opt_logs").empty();
		// $(logs).each(function(i,v){
		// $("<li class='detail-item'><span>" + new
		// Date(v.createTime).format("yyyy-MM-dd hh:mm:ss") + ":" +
		// v.operateContent + "</span></li>").appendTo($("#opt_logs"));
		// });
		// });

		$("#opt_logs").empty();
			com.skyform.service.LogService.describeLogsUIInfo(instance.id);
//		 com.skyform.service.LogService.describeLogsInfo(instance.id,function(logs){
//		 $("#opt_logs").empty();
//		 $(logs).each(function(i,v){
//		 var desc = "";
//		 if(v.description){
//		 if(v.description != ""){
//		 desc = "("+v.description+")";
//		 }
//		 }
//		 var _name = "";
//		 if(v.subscription_name){
//		 _name = v.subscription_name;
//		 }
//		 $("<li class='detail-item'><span>" + v.createTime + ""+v.subscription_name +" "+ v.controle +
//		 desc+"</span></li>").appendTo($("#opt_logs"));
//		 });
//		 },function onError(msg){
//		  $.growlUI("提示", "查询弹性块存储日志发生错误：" + msg);
//		 });
		/*
		 * Route.service.listRelatedInstances(instance.id,function(nets){
		 * $("#routeNet").empty(); var dom = ""; $(nets).each(function(i,net){
		 * dom = ""; dom += "<li class=\"detail-item\">" +"<span>私有网络ID&nbsp;&nbsp;&nbsp;&nbsp;" +
		 * net.id +"</span>&nbsp;&nbsp;&nbsp;&nbsp;" +"<span>私有网络名称&nbsp;&nbsp;&nbsp;&nbsp;"+
		 * net.name+"</span>&nbsp;&nbsp;&nbsp;&nbsp;" +"</li>";
		 * $("#routeNet").append(dom); }); },function(error){ //TODO show error
		 * info in window });
		 */
		// TODO 显示该显示的内容
	},
	refreshData : function() {
//		if (BackupCreate.dtTable)
//			BackupCreate.dtTable.container
//					.find("tbody")
//					.html(
//							"<tr ><td colspan='7' style='text-align:center;'><img src='"
//									+ CONTEXT_PATH
//									+ "/images/loader.gif'/><strong>正在获取数据，请稍后....</strong></td></tr>");
		/*
		BackupSee.service.listAll(function onSuccess(nets) {
			for ( var i = 0; i < nets.length; i++) {
				BackupSee.routeId.push(nets[i].routeId);
			}
		}, function onError(msg) {
			ErrorMgr.showError(msg);
		});
		*/
		  var params={
				  //"vmName":"",
				  //"taskName":"",
//				  "createTimeMin":"",
//				  "createTimeMax":"",
//				  "backupType":""
			  "targetPage":BackupCreate.taskCurrentPage,
			  "rowCount":5
		  };
		  var params2={};
		  params2.params=params;
		  $("#backupCreate").click(function(){
			  BackupCreate.refreshFlag=false;
			});
		com.skyform.service.backupCloudService.listBackupCloudByParams(params2,function(result){
			$("#updateData").click();
			BackupCreate._refreshDtTable(result);
			if(result.cloudBackupTaskList.length==0){
			}else{
				if("1"==result.cloudBackupTaskList[0].backupType){
					$("#dbAttrVal").hide();
					$("#dbType4").empty().html("");
					$("#dbUser4").empty().html("");
					$("#dbPort4").empty().html("");
					$("#dbName4").empty().html("");
				}else if("3"==result.cloudBackupTaskList[0].backupType){
					$("#dbAttrVal").show();
					$("#dbType4").empty().html("sqlserver");
					$("#dbUser4").empty().html(result.cloudBackupTaskList[0].dbUser);
					$("#dbPort4").empty().html(result.cloudBackupTaskList[0].dbPort);
					$("#dbName4").empty().html(result.cloudBackupTaskList[0].dbSchema);
				}
				$("#backupSereverIP").empty().html(result.cloudBackupTaskList[0].backupServerIp);
				$("#uuidVal").empty().html(result.cloudBackupTaskList[0].taskUuid);
				com.skyform.service.LogService.describeLogsUIInfo(result.cloudBackupTaskList[0].id,"opt_logs");
			}
			
		},function(error){});
		
	},
	// /////////////////////////////////////////////////////////////////////////
	// Actions end
	// /////////////////////////////////////////////////////////////////////////
	_bindAction : function() {
		if(BackupCreate.refreshFlag){
			$("li[action='newExecute']").unbind().bind("click",function(){
				
				BackupCreate.newExecute();
			});
			$("li[action='destroy']").unbind().bind("click",function(){
				
				BackupCreate.destroy();
			});
			$("li[action='start']").unbind().bind("click",function(){
				
				BackupCreate.start();
			});
			$("li[action='closed']").unbind().bind("click",function(){
				BackupCreate.closed();
			});
			
		}
		
		$("div[scope='" + BackupCreate.scope + "'] #toolbar .actionBtn").unbind()
				.click(function() {
					if ($(this).hasClass("disabled"))
						return;
					var action = $(this).attr("action");
					BackupCreate._invokeAction(action);
				});
//		$("#backupCreate").trigger("click");
		$(".availableTime").datepicker({
			showButtonPanel : true,
			changeYear : true,
			changeMonth : true,
			dateFormat : "yy-mm-dd",
            closeText:"关闭",
            nextText:"下一月",
            prevText:"上一月",
            currentText: '今天',
            monthNamesShort: ['一月','二月','三月','四月','五月','六月',
                      		'七月','八月','九月','十月','十一月','十二月'],
	         dayNamesMin: ['日','一','二','三','四','五','六'],
	         showMonthAfterYear: true
		});
		$("#searchbackup").unbind("click").bind("click",function(){
			var sss=$("#endTime").val();
			if($("#vmName").val().indexOf("=")!= -1){
				$.growlUI("提示", "主机名称中不能包含特殊字符\"=\"");
				$("#vmName").val("");
				return;
			}
			if($("#taskName").val().indexOf("=")!= -1){
				$.growlUI("提示", "任务名称中不能包含特殊字符\"=\"");
				$("#taskName").val("");
				return;
			}
			  var params={
					  "vmName":$("#vmName").val(),
					  "taskName":$("#taskName").val(),
//					  "createTimeMin":$("#createTime").val(),
//					  "createTimeMax":sss.substring(0,sss.length-2)+(parseInt(sss.substring(sss.length-2,sss.length))+1),
					  "backupType":$("#dataBackupType1").val(),
					  "targetPage":1,
					  "rowCount":5
			  };
			  
			  var params2={};
			  params2.params=params;
			  
			  com.skyform.service.backupCloudService.listBackupCloudByParams(params2,function(result){
				  $("#updateData").click();
				  BackupCreate._refreshDtTable(result);
				  var id=0;
				  if(result.length!=0){
					  id=result.cloudBackupTaskList[0].id;
					  com.skyform.service.LogService.describeLogsUIInfo(id,"opt_logs");
				  }else{
					  $("#opt_logs").empty();
				  }
				  
			  },function(error){});
		});

	},

	_invokeAction : function(action) {
		var invoker = BackupCreate["" + action];
		if (invoker && typeof invoker == 'function') {
			invoker();
		}
	},

	_refreshDtTable : function(data) {
		if (BackupCreate.dtTable) {
			//BackupCreate.dtTable.updateData(data);
			var pageInfo = {
				"totalPage" : data.pageInfo.totalPage,
				"currentPage" : BackupCreate.taskCurrentPage,
				"data" : data.cloudBackupTaskList,
				"_TOTAL_" : data.pageInfo.totalRecord,
				"pageSize" : data.pageInfo.rowCount
			};
			BackupCreate.dtTable.setPaginateInfo(pageInfo);
		} else {
			BackupCreate.dtTable = new com.skyform.component.DataTable();
			BackupCreate.dtTable.renderByData(
				"#instanceTable",
				{
					'selfPaginate' : true,
					onColumnRender : function(columnIndex, columnMetaData, columnData) {
									var schdata=null;
									var periodVal="";
									if (columnMetaData.name == 'ID') {
										return columnData.id;
									} else if (columnMetaData.name == "id") {
										return "<input type='checkbox' value='"
												+ columnData["id"] + "'/>";
									} else if (columnMetaData.name == 'state') {
										var te="";
										if(columnData.state=="backuping"||columnData.state=="opening"||columnData.state=="deleteing"||columnData.state=="stopping"||columnData.state=="starting"||columnData.state=="rollbacking"){
											 te='<span class="state-copper" title="" data-toggle="popover" href="#"><i class="icon-spinner icon-spin blue mr5"></i>'+BackupCreate.state[columnData.state]+'</span>';
										}else if(columnData.state=="closed"||columnData.state=="running"){
											te='<span class="state-green" title="" data-toggle="popover" href="#"><i class="icon-circle green mr5"></i>'+BackupCreate.state[columnData.state]+'</span>';
										}else{
											te='<span class="state-red" title="" data-toggle="popover" href="#"><i class="icon-remove-sign red mr5"></i>'+BackupCreate.state[columnData.state]+'</span>';
										}
										
										return te;
									} else if (columnMetaData.name == 'ip') {
										if (columnData.ip) {
											return columnData.ip;
										} else {
											return "";
										}

									}else if (columnMetaData.name == 'taskName') {
										if (columnData.taskName) {
											return columnData.taskName;
										} else {
											return "";
										}

									}else if (columnMetaData.name == 'backupType') {
										if (columnData.backupType) {
											return BackupCreate.setupType[columnData.backupType];
										} else {
											return "";
										}

									}else if (columnMetaData.name == 'filePath') {
//										return "";
										if (columnData.filePath) {
											//return columnData.filePath;
											var text=(columnData.filePath.length>15?"<span title='"+columnData.filePath+"'>"+columnData.filePath.slice(0,15)+"..."+"</span>":columnData.filePath);
											return text;
										} else {
											return "";
										}

									}
							/*		  else if(columnMetaData.name == 'backupServerIp'){
							        	 
							        	  if (columnData.backupServerIp) {
							        		  return columnData['backupServerIp'];
											} else {
												return "";
											}
							          }*/
									else if (columnMetaData.name == 'peroid') {
										if (columnData.peroid) {
											if(columnData.days.length>0){
												return BackupCreate.backupPriod[columnData.peroid]+"/"+BackupCreate.backupsdays[columnData.days];
											}else{
												return BackupCreate.backupPriod[columnData.peroid]
											}
											
										} else {
											return "";
										}

									}
//									else if (columnMetaData.name == 'schedule') {
//										if (columnData.schedule) {
//											
//											var periodArr=columnData.schedule.split(" ");
//											BackupCreate.fullData=periodArr;
//											var text="";
//											if(periodArr[2]=="*"){
////												text=BackupCreate.backupPriod[periodArr[2]];
//												text=BackupCreate.backupPriod[1];
//											}
//											if(periodArr[4]!="*"){
//												text= "每周/"+BackupCreate.backupsdays[periodArr[4]];
//											}
//											BackupCreate.periodVal=text;
////											return text;
//										} else {
//											BackupCreate.periodVal="";
////											return "";
//										}
//
//									}
									else if (columnMetaData.name == 'backupSize') {
										if (columnData.backupSize) {
											return columnData.backupSize;
										} else {
											return "";
										}

									}
//									else if (columnMetaData.name == 'backupTime') {
//										if (columnData.backupTime) {
//											return columnData.backupTime;
//										} else {
//											return "";
//										}
//
//									} 
									else if (columnMetaData.name == "schedule1") {
										// return new
										// Date(columnData.createDate).toLocaleString();
//										var text = '';
//										if (columnData.schedule == ''
//												|| columnData.schedule == 'undefined') {
//											return text;
//										}
//										try {
//											var obj = eval('('
//													+ "{Date: new Date("
//													+ columnData.createDate
//													+ ")}" + ')');
//											var dateValue = obj["Date"];
//											text = dateValue
//													.format('yyyy-MM-dd h:mm:ss');
//										} catch (e) {
//										}
										if (columnData.schedule) {
											
											var periodArr=columnData.schedule.split(" ");
											BackupCreate.fullData=periodArr;
											var text="";
											if(periodArr[2]=="*"){
//												text=BackupCreate.backupPriod[periodArr[2]];
												text=BackupCreate.backupPriod[1];
											}
											if(periodArr[4]!="*"){
												var weeks=periodArr[4].split(",");
												var weeksChina="";
												for(var i=0;i<weeks.length;i++){
													weeksChina+=BackupCreate.backupsdays[weeks[i]];
												}
												text= "每周/"+weeksChina;
											}
											BackupCreate.periodVal=text;
//											return text;
										} else {
											BackupCreate.periodVal="";
//											return "";
										}
										
										
										var minute=parseInt(BackupCreate.fullData[0]);
										var hour=parseInt(BackupCreate.fullData[1]);
										var minute1="";
										var hour1="";
										if(minute<10){
											minute1="0"+minute;
										}else{
											minute1=minute;
										}
										if(hour<10){
											hour1="0"+hour;
										}else{
											hour1=hour;
										}
										return BackupCreate.periodVal+"/"+hour1+":"+minute1;
									} 
									else if (columnMetaData.name == 'vmName') {
										text = "<a title='查看备份' href='#' name='seebackup'><i class='icon-comments' ></i>"+columnData.vmName+"</a>";
										return text;
									} else {
										return columnData[columnMetaData.vmName];
									}
								},
					afterRowRender : function(rowIndex, data, tr) {
									tr.attr("instanceId", data.id);
									tr.attr("ip", data.ip);
									tr.attr("taskUuid", data.taskUuid);
									tr.attr("instanceState", data.state);
									tr.attr("taskName", data.taskName);
									tr.attr("schedule", data.schedule);
									tr.attr("networkId", data.networkId);
									tr.attr("instanceName", data.vmName);
									tr.attr("backupType", data.backupType || "");
									tr.attr("filePath", data.filePath);
									tr.attr("state", data.state);
									tr.attr("peroid", data.peroid);
									tr.attr("dbPort", data.dbPort);
									tr.attr("dbUser", data.dbUser);
									tr.attr("dbName", data.dbSchema);
									tr.attr("backupSereverIP", data.backupServerIp);
									tr.attr("backupset_id", data.taskId);
									tr.attr("vmId", data.vmId);
									tr.attr("backupTime", data.createDate);	
									tr.attr("backupFileSize", data.backupSize);	
									tr.find("input[type='checkbox']").click(
											function() {
												BackupCreate.onInstanceSelected();
											});
//									$("a[name='seebackup']").unbind().bind("click",function(){
//										console.log("ssssss");
//									  $("a[href='#private_network']").trigger("click");
//										BackupSee.searchAndClickAFlag=false;
//										BackupSee.tabClickFlag=true;
//									});
									tr.click(function() {
//										BackupCreate.getRouteNet(data.id);
										
										var params=new Object();
										params.vmName=data.vmName;
										params.taskName=data.taskName;
										params.backuptask_id=data.taskId+"";
										params.vm_id=data.vmId+"";
										params.backupTimeMin=""||$("#backupTime1").val();
										params.backupTimeMax=""||$("#backupTime2").val();
//										var date=new Date().format("yyyy-MM-dd");
//										var ss2=date;
//										params.backupTimeMax=ss2.substring(0,ss2.length-1)+(parseInt(ss2.substr(-1))+1);
//										params.backupTimeMax=ss2.substring(0,ss2.length-2)+(parseInt(date.substring(date.length-2,date.length))+1);
//										params.backupTimeMin=new Date(data.createDate).format("yyyy-MM-dd");
										//这里根据云备份id来查询备份文件
//										BackupSee._refreshDtTable(BackupSee.data);
										  
										  var params2={};
										  params2.condition=params;
										  
										  BackupCreate.paramsbackupSee=params2;
//										  BackupSee.listBackupCloudDir(params2);
//										  $("a[name='seebackup']").unbind().bind("click",function(){
//												console.log("ssssss");
//											  $("a[href='#private_network']").trigger("click");
//												BackupSee.searchAndClickAFlag=false;
//												BackupSee.tabClickFlag=true;
//											});
										//$("#b").click(function(){$("#a").trigger("click")});
//										com.skyform.service.LogService.describeLogsInfo();
										  	
										com.skyform.service.LogService.describeLogsUIInfo(data.id,"opt_logs");
										BackupCreate.showDetails(data);
										BackupCreate._bindAction();
									});
									
								},
					"pageInfo" : {
						"totalPage" : data.pageInfo.totalPage,
						"currentPage" : 1,
						"data" : data.cloudBackupTaskList,
						"_TOTAL_" : data.pageInfo.totalRecord,
						"pageSize" : data.pageInfo.rowCount
					},
					"onPaginate" : function(targetPage) {
						var params={
							"vmName":$("#vmName").val(),
							"taskName":$("#taskName").val(),
							"backupType":$("#dataBackupType1").val(),
							"targetPage":targetPage,
							"rowCount":5

						};
						BackupCreate.taskCurrentPage=targetPage;
						var params2={};
						params2.params=params;
						com.skyform.service.backupCloudService.listBackupCloudByParams(params2,function(result){
							$("#updateData").click();
							var pageInfo = {
								"totalPage" : result.pageInfo.totalPage,
								"currentPage" : targetPage,
								"data" : result.cloudBackupTaskList,
								"_TOTAL_" : result.pageInfo.totalRecord,
								"pageSize" : result.pageInfo.rowCount
							};
							BackupCreate.dtTable.setPaginateInfo(pageInfo);
							var id=0;
							if(result.length!=0){
								id=result.cloudBackupTaskList[0].id;
								com.skyform.service.LogService.describeLogsUIInfo(id,"opt_logs");
							}else{
								$("#opt_logs").empty();
							}
						},function(error){});
					},
					afterTableRender : BackupCreate._afterDtTableRender
				});
			BackupCreate.dtTable.addToobarButton($("#toolbar"));
			BackupCreate.dtTable.enableColumnHideAndShow("right");
			
//			BackupCreate.refreshData();
		}
	},

	_afterDtTableRender : function() {
		
		$("a[name='seebackup']").unbind().bind("click",function(){
		  $("a[href='#private_network']").trigger("click");
			BackupSee.searchAndClickAFlag=false;
			BackupSee.tabClickFlag=true;
		});
		var check = $("input#selectAllRoutes[type='checkbox']").unbind("click")
				.click(function(e) {
					e.stopPropagation();
					var check = $(this).attr("checked");
					BackupCreate.checkAll(check);
				});
		if (!BackupCreate.contextMenu) {
			
			BackupCreate.contextMenu = new ContextMenu({
				beforeShow : function(tr) {
					BackupCreate.checkAll(false);
					tr.find("input[type='checkbox']").attr("checked", true);
				},
				afterShow : function(tr) {
					BackupCreate.onInstanceSelected({
						instanceName : tr.attr("instanceName"),
						id : tr.attr("instanceId"),
						state : tr.attr("state"),
						publicIp : tr.attr("ip"),
						taskname : tr.attr("taskname")
					});
				},
				onAction : function(action) {
					BackupCreate._invokeAction(action);
				},
				trigger : "#instanceTable tr"
			});
		} else {
			BackupCreate.contextMenu.reset();
		}
		BackupCreate.showDetails();
		
//		BackupCreate.showDetails(data);
	},

	checkAll : function(check) {
		if (check)
			$("#instanceTable tbody input[type='checkbox']").attr("checked",
					true);
		else
			$("#instanceTable tbody input[type='checkbox']").removeAttr(
					"checked");
		BackupCreate.onInstanceSelected(false);
	},

	onInstanceSelected : function(selectInstance) {
		var allCheckedBox = $("#instanceTable tbody input[type='checkbox']:checked");
		var rightClicked = selectInstance ? true : false;
		var state = $(allCheckedBox[0]).parents("tr").attr("instanceState");
		if (selectInstance) {
			state = selectInstance.state;
		}
		var oneSelected = allCheckedBox.length == 1;
		var hasSelected = allCheckedBox.length > 0;
		if (oneSelected) {// 如果列表中的路由只有一个被选中，当前的publicIp为那个唯一被选中路由的publicIp
			BackupCreate.publicIp = $(
					"#instanceTable tbody input[type='checkbox']:checked")
					.parent().parent()[0].attributes["ip"].value;
			BackupCreate.backupKey= $("#instanceTable tbody input[type='checkbox']:checked").parent().parent().attr("taskuuid")
			$("#uuidVal").empty().html(BackupCreate.backupKey);
			$("#backupSereverIP").empty().html($("#instanceTable tbody input[type='checkbox']:checked").parent().parent().attr("backupSereverIP"));
			var dbType=$("#instanceTable tbody input[type='checkbox']:checked").parent().parent().attr("backuptype")
			var obj=$("#instanceTable tbody input[type='checkbox']:checked").parent().parent();
			if("1"==dbType){
				$("#dbAttrVal").hide();
				$("#dbType4").empty().html("");
				$("#dbUser4").empty().html("");
				$("#dbPort4").empty().html("");
				$("#dbName4").empty().html("");
			}else if("3"==dbType){
				$("#dbAttrVal").show();
				$("#dbType4").empty().html("sqlserver");
				$("#dbUser4").empty().html(obj.attr("dbUser"));
				$("#dbPort4").empty().html(obj.attr("dbPort"));
				$("#dbName4").empty().html(obj.attr("dbName"));
			}
		}
		$("div[scope='" + BackupCreate.scope + "'] .operation").addClass("disabled");
		$("div[scope='" + BackupCreate.scope + "'] .operation").each(
				function(index, operation) {
					var condition = $(operation).attr("condition");
					var action = $(operation).attr("action");
					var enabled = true;
					
					eval("enabled=(" + condition + ")");
					if (enabled) {
						$(operation).removeClass("disabled");
					} else {
						$(operation).addClass("disabled");
					}
					BackupCreate._bindAction();
				});
		// 右键的时候
		if (rightClicked) {
			BackupCreate.instanceName = selectInstance.instanceName;
			BackupCreate.selectedInstanceId = selectInstance.id;
			BackupCreate.publicIp = selectInstance.publicIp;
			var params6=new Object();
			params6.vmName=selectInstance.instanceName;
			params6.taskName=selectInstance.taskname;
			  var params2={};
			  params2.condition=params6;
			  BackupCreate.paramsbackupSee=params2;
		} else {
			for ( var i = 0; i < allCheckedBox.length; i++) {
				var currentCheckBox = $(allCheckedBox[i]);
				if (i == 0) {
					BackupCreate.instanceName = currentCheckBox.parents("tr").attr(
							"name");
					BackupCreate.selectedInstanceId = currentCheckBox.attr("value");
					BackupCreate.backupKey=$(currentCheckBox ).parent().parent().attr("taskuuid");
					
					
					$("#uuidVal").empty().html(BackupCreate.backupKey);
					if("1"===$(currentCheckBox ).parent().parent().attr("backuptype")){
						$("#dbAttrVal").hide();
						$("#dbType4").empty().html("");
						$("#dbUser4").empty().html("");
						$("#dbPort4").empty().html("");
						$("#dbName4").empty().html("");
					}else if("3"===$(currentCheckBox ).parent().parent().attr("backuptype")){
						$("#dbAttrVal").show();
						$("#dbType4").empty().html("sqlserver");
						$("#dbUser4").empty().html(obj.attr("dbUser"));
						$("#dbPort4").empty().html(obj.attr("dbPort"));
						$("#dbName4").empty().html(obj.attr("dbName"));
					}
				} else {
					BackupCreate.instanceName += ","
							+ currentCheckBox.parents("tr").attr("name");
					BackupCreate.selectedInstanceId += ","
							+ currentCheckBox.attr("value");
				}
			}
		}
	},
	//add by yi for test 10.28
	createRoute : function() {
		BackupCloud.createVM();
	},
	
	//add by yi 10.28
	renew : function() {
		var lbId = Route.selectedInstanceId;
		if (BackupCreate.renewModal) {

		} else {
			BackupCreate.renewModal = new com.skyform.component.Renew(
					lbId,
					{
						buttons : [
								{
									name : "确定",
									onClick : function() {
										var period = BackupCreate.renewModal
												.getPeriod().getValue();
										$("#renewModal").modal("hide");
										var _modal = $("#renewModal");
										com.skyform.service.renewService
												.renew(
														BackupCreate.selectedInstanceId,
														period,
														function onSuccess(data) {
															// 订单提交成功后校验用户余额是否不足
															var _tradeId = data.tradeId;
															var _fee = $(
																	"#feeInput_renew")
																	.text();
															com.skyform.service.BillService
																	.confirmTradeSubmit(
																			_fee,
																			_tradeId,
																			_modal,
																			function onSuccess(
																					data) {
																				$
																						.growlUI(
																								"提示",
																								"续订申请提交成功,扣款成功, 请耐心等待...");
																				// refresh
																				// Route.updateDataTable();
																			},
																			function onError(
																					msg) {
																				$
																						.growlUI(
																								"提示",
																								"续订申请提交成功,扣款失败...");
																			});
														},
														function onError(msg) {
															$
																	.growlUI(
																			"提示",
																			"续订时长提交失败："
																					+ msg);
														});
									},
									attrs : [ {
										name : 'class',
										value : 'btn btn-primary'
									} ]
								}, {
									name : "取消",
									attrs : [ {
										name : 'class',
										value : 'btn'
									} ],
									onClick : function() {
										BackupCreate.renewModal.hide();
									}
								} ]
					});
		}
		BackupCreate.renewModal.getFee_renew(lbId);
		BackupCreate.renewModal.show();
		$(".subFee_renew").bind('mouseup keyup', function() {
			setTimeout('BackupCreate.renewModal.getFee_renew(' + lbId + ')', 100);
		});
	},
	addLink : function(e){
		var tr = $(e).closest(".backUpPath");
		BackupCreate.appendNewRow();
	},
	removeLink : function(e) {
		var tr = $(e).closest(".backUpPath");
		tr.find("input").val("");
		$(tr).remove();
	},
	appendNewRow : function(){
		var row = "<div class='control-group pt10 network_createNew networkoption subFee backUpPath' style='margin: 0px;'>"+
		"<label class='control-label divfloatstyle' style='width:100px;  margin-top: 9px;'></label>"+
		"<input type='text' class='contentbackup'  style='margin-top:3px; width:220px; 'readonly='readonly' />&nbsp;&nbsp;&nbsp;"+
		"<span class='operators' style='vertical-align: text-bottom;'>"+
		"<span class='btn' style='background: #2694d5;padding:0px;color:#fff;' onclick='BackupCreate.browsePath($(this));' >浏览</span>&nbsp;"+
		"<i class=' icon-plus' style='cursor:pointer;' onclick='BackupCreate.addLink(this);'></i>&nbsp;&nbsp;"+
		"<i class=' icon-minus removeMultiPath' style='cursor:pointer;' onclick='BackupCreate.removeLink(this);'></i>"+
		"</span>"+
		"<span style='color:red;'>"+
		"*<span class='contentMsg'></span>"+
		"<span>&nbsp;&nbsp;</span>"+
		"</span>"+
		"</div>";
		$("#backUpPathContainer").append(row);
	},
	ResourceTree : function(path){
		var params={
				"networkId":$("#tbody3 input[type='radio']:checked").parents("tr").attr("networkid")||"",
				"params":{
					"vm_ipaddr":$("#tbody3 input[type='radio']:checked").parents("tr").attr("ip"),
					"filedir":path
				}
			}
		//	var params={
		//			"networkId":"15749211",
		//			"params":{
		//				"vm_ipaddr":"192.168.3.14",
		//				"filedir":path
		//			}
		//		};
		com.skyform.service.backupCloudService.backupListResource(params,function(result){$("#houTaiBackPath").val(result.filedir.join("?--?"))},function(error){console.log(error);$.growlUI(Dict.val("common_tip"), error);});
	},
	browsePath : function(browseSpan){
		var thisPathInput=browseSpan.parents('div.backUpPath').find('input:eq(0)');
		var isWIn=$("#tbody3 input[type='radio']:checked").parents("tr").attr("osType")=="WIN"?true:false;
		var selectPath="";
		$('#browsePath').show();
		var zTree;
		//var demoIframe;
		var setting = {
			view: {
				dblClickExpand: false,
				showLine: true,
				selectedMulti: false
			},
			data: {
				simpleData: {
					enable:true,
					idKey: "id",
					pIdKey: "pId",
					rootPId: ""
				}
			},
			callback: {
				beforeClick: function(treeId, treeNode) {
					var zTree = $.fn.zTree.getZTreeObj("pathTree");
					if (treeNode.isParent) {
						//zTree.expandNode(treeNode);父节点点击是否打开子节点
						var nodes = treeNode.children;//console.log(nodes);
						//var newNodes = [{name:"newNode1"}, {name:"newNode2"}, {name:"newNode3"}];
						var newNodes=[];
						BackupCreate.ResourceTree(treeNode.file);
						var pathArray=$("#houTaiBackPath").val().split("?--?");
						if($("#houTaiBackPath").val()!=""){
							for(i=0;i<pathArray.length;i++){
								if(treeNode.file=="/"){
									if(isWIn){
										newNodes.push({name:pathArray[i], file:treeNode.file+pathArray[i],open:false,isParent:true})
									}else{
										newNodes.push({name:pathArray[i], file:treeNode.file+pathArray[i],open:false,isParent:true})
									}
									//newNodes.push({name:pathArray[i], file:treeNode.file+pathArray[i],open:false,isParent:true})
								}else{
									newNodes.push({name:pathArray[i], file:treeNode.file+"/"+pathArray[i],open:false,isParent:true})
								}
							}
							//newNodes = zTree.addNodes(treeNode, newNodes);
							if(nodes){
								//zTree.addNodes(treeNode, {});
								zTree.expandNode(treeNode);
								return true;
							}else{
								zTree.addNodes(treeNode, newNodes);
							}
							return true;
						}else{

						}

					} else {
						/*demoIframe.attr("src",treeNode.file + ".html");*/
						return true;
					}
				},
				onClick :function(event, treeId, treeNode){
					selectPath=treeNode.file;
					//thisPathInput.val(treeNode.file);
				}
			}
		};
		//if($("#tbody3 input[type='radio']:checked").parents("tr").attr("osType")){
		//	var zNodes =[{id:1, pId:0, name:"root", file:"/",open:false,isParent:true}];
		//}
		//else{
		//	var zNodes =[{id:1, pId:0, name:"root", file:"/",open:false,isParent:true}];
		//}
		if(isWIn){
			var zNodes =[{id:1, pId:0, name:"我的电脑", file:"/",open:false,isParent:true}];
		}else{
			var zNodes =[{id:1, pId:0, name:"root", file:"/",open:false,isParent:true}];
		}
		var t = $("#pathTree");
		t = $.fn.zTree.init(t, setting, zNodes);
		/*if (!desktopDistribution.ContextMenuTree) {
		 desktopDistribution.ContextMenuTree = new ContextMenuCloud({
		 container : "#leftmenu",
		 beforeShow : function(tr) {
		 },
		 afterShow : function(tr) {
		 },
		 onAction : function(action) {
		 desktopDistribution._invokeAction(action);
		 },
		 trigger : "#leftContent"
		 });
		 console.info(desktopDistribution.ContextMenuTree);
		 } else {
		 desktopDistribution.ContextMenuTree.reset();
		 }*/
		//$("#browsePath").modal("show");
		$("#browsePath .modal-body").css("width","280px");
		//$("#browsePath").setTop(100);
		$("#pathSave").click(function(){
			$('#browsePath').hide();
			var bool=true;
			for(var i=0;i<$("#backUpPathContainer .contentbackup").length;i++){
				if($("#backUpPathContainer .contentbackup").eq(i).val()==selectPath){
					bool=false;
				}
			};
			if(selectPath==$("#contentbackup_").val()){
				bool=false;
			};
			if(thisPathInput.attr("id")=="contentbackup_"){
				bool=true;
			};
			if(bool){
				if(isWIn){
					var selectPath_="";
					for(var i=1;i<selectPath.length;i++){
						if(i==1){
							selectPath_+=selectPath[i]+":";
						}else{
							selectPath_+=selectPath[i];
						}
					};
					thisPathInput.val(selectPath_);
				}else{
					thisPathInput.val(selectPath);
				};
				//thisPathInput.val(selectPath);
			}else{
				thisPathInput.val("");
			};
			$("#contentbackup_").change();
			$("#tbody3_filter input:eq(0)").val("");
			$.fn.zTree.destroy("pathTree");
		});
		$("#pathCancle").click(function(){
			$('#browsePath').hide();
			$.fn.zTree.destroy("pathTree");
		});
	}


};

