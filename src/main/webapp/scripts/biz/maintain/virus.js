//当前刷新实例的类型为虚拟机
window.otherCurrentInstanceType='virus';

//$(function() {
//	Virus.init();	
//});
//window.Controller = {
//		init : function(){
//			VM.init();			
//		}
//	}
var Virus = {
	configList:null,	
	configModal:null,
	resultTable:null,
	startConfigModal:null,
	createConfigModal:null,
	updateConfigModal:null,
	selectedInstanceId:0,
	configDataTable : null,	
	virusProductId:0,
	virusService:com.skyform.service.virusService,
	autoRange:[
	       {"id":1,"value":"每日一次（周一至周五 08:00~16:00）"},
	       {"id":2,"value":"晚上（周一至周四 22:00~02:00，周五 22:00~24:00）"},
	       {"id":3,"value":"周末（周六至周日 08:00~16:00）"},
	       {"id":4,"value":"每天全天（周一至周日 00:00~24:00）"}
	       ],
	
	init:function(){		
		$("#createConfig").off().click(function(){
			Virus.createConfig();
		});
		$("#refreshVirus").off().click(function(){
			Virus.queryConfig("#configDataTable");
		});
		Virus.queryProductPrtyInfo();
		Virus.queryConfig("#configDataTable");		
	},
	
	createConfig:function(){
		if (!Virus.createConfigModal) {
			Virus.createConfigModal = new com.skyform.component.Modal(
					new Date().getTime(),
					"创建新杀毒配置",
					$("script#createConfigModal").html(),
					{
						buttons : [
								{
									name : "保存",
									onClick : function() {
										$(".error").empty();
										var name = $("#configTag").val();
										if (name == null || name == "") {
											$("#tagError").empty().html("请输入杀毒配置Tag");
											return;
										}
										var desc = $("#configDesc").val();
										if (desc == null || desc == "") {
											$("#descError").empty().html("请输入描述");
											return;
										}
										Virus.saveConfig();
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
										Virus.createConfigModal.hide();
									}
								} ],
						beforeShow : function(){
							$(".error").empty();
							Virus.initRange();
							Virus.initSchedule();
						}
					});	
		}
		Virus.createConfigModal.setHeight(350).setWidth(700).show();
		//$("#createConfigModal").modal("show");
	},

	initRange:function(){
		$(".autoRange").empty();
		$(Virus.autoRange).each(function(i,item){
			var option = $("<option value='"+item.id+"'>"+item.value+"</option>");
			option.appendTo($(".autoRange"));
		});
	},
	initSchedule:function(){
		$(".schedule").empty();
		$(Virus.configList).each(function(i,item){
			var option = $("<option value='"+item.id+"'>"+item.name+"</option>");
			option.appendTo($(".schedule"));
		});
	},
	
	initUpdateModal:function(){
		Virus.initRange();
		Virus.initSchedule();
		
		var row = $("#configDataTable tbody").find("input[type='checkbox']:checked").closest('tr');
		
		$("#configId").val(row.attr("id"));
		$("#upConfigTag").empty().attr("disabled",false);
		$("#upConfigTag").val(row.attr("instanceName")).attr("disabled","disabled");
		$("#upConfigDesc").empty().attr("disabled",false);
		$("#upConfigDesc").val(row.attr("desc")).attr("disabled","disabled");
		
		var autoSchedule = row.attr("autoSchedule");
		$("#upAutoSchedule option[value='"+autoSchedule+"']").attr("selected", true);
		var autoRange = row.attr("autoRange");
		$("#upAutoRange option[value='"+autoRange+"']").attr("selected", true);
		var manualSchedule = row.attr("manualSchedule");
		$("#upManualSchedule option[value='"+manualSchedule+"']").attr("selected", true);	
		
		
	},
	playConfig:function(){
		var confirmModal = new com.skyform.component.Modal(
				new Date().getTime(), "启动主机杀毒", "<h4>您确认要启动主机杀毒吗?</h4>", {
					buttons : [
							{
								name : "确定",
								onClick : function() {
									Virus.virusService.playConfigAct(VM.selectedInstanceId,function onStarted(result){
										confirmModal.hide();
										VM.describleVM();
										$.growlUI("提示", "操作成功");
									},function onFailedToStart(errorMsg){
										confirmModal.hide();
										$.growlUI("操作失败", errorMsg);
										ErrorMgr.showError("启动失败："+errorMsg);
									})
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
									confirmModal.hide();
								}
							} ]
				});
		confirmModal.setWidth(300).autoAlign();
		confirmModal.show();
	
	},
	pauseConfig:function(){
		var confirmModal = new com.skyform.component.Modal(
				new Date().getTime(), "暂停主机杀毒", "<h4>您确认要暂停主机杀毒吗?</h4>", {
					buttons : [
							{
								name : "确定",
								onClick : function() {
									Virus.virusService.pauseConfigAct(VM.selectedInstanceId,function onStarted(result){
										confirmModal.hide();
										VM.describleVM();
										$.growlUI("提示", "操作成功");
									},function onFailedToStart(errorMsg){
										confirmModal.hide();
										$.growlUI("操作失败", errorMsg);
										ErrorMgr.showError("暂停失败："+errorMsg);
									})
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
									confirmModal.hide();
								}
							} ]
				});
		confirmModal.setWidth(300).autoAlign();
		confirmModal.show();
	},
	manual:function(){
		var confirmModal = new com.skyform.component.Modal(
				new Date().getTime(), "手动杀毒", "<h4>您确认要手动杀毒吗?</h4>", {
					buttons : [
							{
								name : "确定",
								onClick : function() {
									Virus.virusService.manualSafe(VM.selectedInstanceId,function onStarted(result){
										confirmModal.hide();
										VM.describleVM();
										$.growlUI("提示", "操作成功");
									},function onFailedToStart(errorMsg){
										confirmModal.hide();
										$.growlUI("操作失败", errorMsg);
										ErrorMgr.showError("手动杀毒失败："+errorMsg);
									})
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
									confirmModal.hide();
								}
							} ]
				});
		confirmModal.setWidth(300).autoAlign();
		confirmModal.show();
	},
	unbindConfig:function(){		
		var confirmModal  = new com.skyform.component.Modal(
				new Date().getTime(), "关闭主机杀毒", "<h4>您确认要关闭主机杀毒吗?</h4>", {
					buttons : [
							{
								name : "确定",
								onClick : function() {
									Virus.virusService.unbindConfigAct(VM.selectedInstanceId,VM.selectedConfigId,function onStarted(result){
										confirmModal.hide();
										VM.describleVM();
										$.growlUI("提示", "操作成功");
									},function onFailedToStart(errorMsg){
										confirmModal.hide();
										$.growlUI("操作失败", errorMsg);
										ErrorMgr.showError("关闭失败："+errorMsg);
									})
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
									confirmModal.hide();
								}
							} ]
				});
		confirmModal.setWidth(300).autoAlign();
		confirmModal.show();
	},
	startConfig:function(){	//虚拟机页面的开启主机杀毒功能	
		if (Virus.startConfigModal == null) {
			Virus.startConfigModal = new com.skyform.component.Modal(
					"virusModal",
					"开启主机杀毒",
					$("script#start_div").html(),
					{
						beforeShow : function(){
							$("input[type='radio'][name='safeoption']").click(function(){
								//Virus.safeOption($(this));
								var value = $(this).val();
								$("div.safeoption").each(function(i,div){
									if(!$(div).hasClass("safe_" + value)) {
										$(div).addClass("hide");
									} else {
										$(div).removeClass("hide");
									}
									if("useExisted" == value){
										//query
									}
								});	
							});	
							$("input[type='radio'][name='safeoption'][checked='checked']").click();		
						},
						afterShow : function(){
//							if(!Virus.configDataTable)
								Virus.queryConfig("#configDataTable2");
						}
					});
			}
			Virus.startConfigModal.setHeight(360).setWidth(800).show();
		},
	renderSafeConfigTable:function(data,str){
		if(!str)str = "#configDataTable";
		 if(Virus.configDataTable) {
			 Virus.configDataTable.updateData(data);
		    } else {
		    	Virus.configDataTable = new com.skyform.component.DataTable();
				Virus.configDataTable.renderByData(
						str,// 要渲染的table所在的jQuery选择器
						{
							"data" : data, // 要渲染的数据选择器					
							"pageSize" : 5,
							"onColumnRender" : function(columnIndex,columnMetaData, columnData) {
								var text = '';
								if(columnMetaData.name=='id') {
						              return '<input type="checkbox" name="check" id="' + columnData.id + '" value="'+columnData.id+'">';
						           } else if ("ID" == columnMetaData.name) {
						              return columnData.id;
						           } 
						           else if (columnMetaData.name=='createDate') {
										try {
											var obj = eval('(' + "{Date: new Date("
													+ columnData.createDate + ")}"
													+ ')');
											var dateValue = obj["Date"];
											text = dateValue
													.format('yyyy-MM-dd hh:mm:ss');
										} catch (e) {

										}
										return text;
									}
						           else if ("instanceName" == columnMetaData.name) {
						        	   if(null!=columnData.uuid&&""!=columnData.uuid){
											text = '<a  href="monitor.jsp?code=monitor&vmId='+columnData.uuid+'&vmName='+encodeURI(encodeURI(columnData.instanceName))+'" >'+columnData.instanceName+'</a>';
										}
										else text = columnData.instanceName;
						        	   return text;
						           } else if ("state" == columnMetaData.name) {
						        	   if(!columnData.desc){
						        		   columnData.state = "opening";
						        	   }
						        	   else if(!columnData.antimalwarerealtimeid){
						        		   columnData.state = "changing";
						        	   }
						              return com.skyform.service.StateService.getState("vm",columnData.state||columnData);
						           } else if ("descrInfo" == columnMetaData.name) {										
						        	   try {
						        		   var cpuNum = "";
						        		   var mem = "";
						        		   var os = "";
						        		   if(columnData.cpu&&columnData.cpu.length>0){
						        			   cpuNum = columnData.cpu;
						        		   }
						        		   if(columnData.os&&columnData.os.length>0){
							        			  os = columnData.os; 
							        		   }
						        		   if(columnData.mem&&columnData.mem.length>0){
						        			  mem = columnData.mem; 
						        		   }
											var appendText = "CPU个数:"
													+ cpuNum + "个 操作系统:"
													+ os + " 内存:"
													+ mem
													+ "GB "
											text = text + appendText;
										} catch (e) {

										}
									return text;
						           }
								return columnData[columnMetaData.name];
							},
							
//							{"message":"success","data":[{"vmPrice":1,"mem":"0.5","state":"opening","expireDate":1412493362000,"productId":101,"createDate":1409901362000,"cpu":"1","instanceName":"VM_67786912","disk":"50","osId":"1","id":67786912,"ip":" ","period":1,"os":"Cetnos6.4-x86_64"},{"vmPrice":1,"mem":"0.5","state":"opening","expireDate":1412476682000,"productId":101,"createDate":1409884682000,"cpu":"1","instanceName":"VM_67784939","disk":"50","osId":"1","id":67784939,"ip":" ","period":1,"os":"Cetnos6.4-x86_64"}],"code":0}
							"afterRowRender" : function(rowIndex, data, tr) {
								
								tr.attr("id",data.id);
								
								if(!data.desc){
					        		   data.state = "opening";
								}
								else if(!data.antimalwarerealtimeid){
				        		   data.state = "changing";
								}
								tr.attr("state",data.state);
								tr.attr("instanceName",data.instanceName);
								tr.attr("autoSchedule",data.antimalwarerealtimeid);
								tr.attr("autoRange",data.antimalwarerealtimescheduleid);
								tr.attr("manualSchedule",data.antimalwaremanualid);
								
								tr.attr("desc",data.desc);
//								tr.find("input[type='checkbox']").click(function(){
//									Virus.onInstanceSelected(); 
//						        });
								Virus.bindEventForTr1(rowIndex, data, tr);
							},
							"afterTableRender" : function() {
								
								$("#bindConfig").on("click",function(){Virus.bindVirusEvent();})
								
							}
							
						});
				
		     }
		Virus.configDataTable.addToobarButton("#toolbar4Virus");
		Virus.configDataTable.enableColumnHideAndShow("right");
	
	},
	bindEventForTr1 : function(rowIndex, data, tr) {

		$(tr).unbind().mousedown(
			function(e) {
				
				if (3 == e.which) {
					$("#configDataTable input[type='checkbox']").attr("checked", false);
					tr.find("input[type='checkbox']").attr("checked", true);
					Virus.selectedInstanceId = tr.attr("id");
					document.oncontextmenu = function() {
						return false;
					}
					var screenHeight = $(document).height();
//					console.log($(document).height());
//					console.log(e.pageY);
//					console.log(e.pageX);
					var top = e.pageY;
					
					if (e.pageY >= screenHeight / 2) {
						top = e.pageY - $("#contextMenu2").height();
//						console.log($("#contextMenu").height())
						// 如果鼠标所在位置在屏幕高度中线的下半部分，则弹出框往上弹出
					}
					$("#contextMenu2").hide();
					$("#contextMenu2").attr(
							"style",
							"display: block; position: absolute; top:"
									+ top + "px; left:" + e.pageX
									+ "px; width: 180px;");
					$("#contextMenu2").show();
					e.stopPropagation();
					Virus.onInstanceSelected(data);

				}
				//VM.showInstanceInfo(data);
				Virus.setSelectRowBackgroundColor1(tr);
		});
		$(tr).click(function() {
			Virus.onInstanceSelected(data);
		});
	},
	setSelectRowBackgroundColor1 : function(handler) {
		$("#configDataTable tr").css("background-color","");
		handler.css("background-color","#BCBCBC");
	},
	onInstanceSelected : function(selectInstance){
		var allCheckedBox = $("#configDataTable tbody input[type='checkbox']:checked");
		var rightClicked = selectInstance?true:false;
		var state = $(allCheckedBox[0]).parents("tr").attr("state");
		if(selectInstance) {
			state = selectInstance.state;
		}
		var oneSelected = allCheckedBox.length == 1;
		var hasSelected = allCheckedBox.length > 0;
		
		$("div[scope='virus'] .operation").addClass("disabled");
		$("div[scope='virus'] .operation").each(function(index,operation){
			var condition = $(operation).attr("condition");
			var action = $(operation).attr("action");
			var enabled = true;
			eval("enabled=("+condition+")");
			if(enabled) {
				$(operation).removeClass("disabled");
			} else {
				$(operation).addClass("disabled");
			}
			Virus._bindAction();
		});
		//右键的时候
		if(rightClicked) {
			Virus.instanceName = selectInstance.instanceName;
			Virus.selectedInstanceId = selectInstance.id;
		} else {
			for ( var i = 0; i < allCheckedBox.length; i++) {
				var currentCheckBox = $(allCheckedBox[i]);
				if (i == 0) {
					Virus.instanceName = currentCheckBox.parents("tr").attr("name");
					Virus.selectedInstanceId = currentCheckBox.attr("value");
				} else {
					Virus.instanceName += "," + currentCheckBox.parents("tr").attr("name");
					Virus.selectedInstanceId += "," + currentCheckBox.attr("value");
				}
			}
		}
	},
	_bindAction : function(){
		$("div[scope='virus'] #toolbar4Virus .operation").unbind().click(function(){
			if($(this).hasClass("disabled")) return;
			var action = $(this).attr("action");
			Virus._invokeAction(action);
		});
	},
	_invokeAction : function(action){
		var invoker = Virus["" + action];
		if(invoker && typeof invoker == 'function') {
			invoker();
		}
	},
	
	queryConfig : function(str){
		Virus.virusService.queryConfig(function(data){
			if(data && data.length>0){
				Virus.renderSafeConfigTable(data,str);
			}
		})
	},
	queryProductPrtyInfo : function(){		
		com.skyform.service.BillService.queryProductPrtyInfo(5,"virus",function(data){
			if( null != data){	
				//CommonEnum.currentPool
				Virus.virusProductId = data.productId;				
			}		
		});
	},
	querySchedule:function(){
		Virus.virusService.querySchedule(function(data){
			Virus.configList = data.getallantivirusconfresponse.antivirusconf;
		})	
	},
	saveConfig:function(){
		var tag = $("#configTag").val().trim();
		var desc = $("#configDesc").val();
		//tag = "test";
		//desc = "desc";
		var config = {
			"period":240,
			"count":1,
			"productList":[{
				"instanceName":tag,
				"productId":Virus.virusProductId,
				"desc":	desc,
				"antimalwarerealtimeid": $("#autoSchedule").val(), //（1杀毒配置（默认）1；2杀毒配置2；3杀毒配置3）
				"antimalwarerealtimescheduleid": $("#autoRange").val(),//（1每日一次（默认）；2晚上；3周末；4每天全天）
				"antimalwaremanualid":$("#manualSchedule").val()
			
			}]
		}

		Virus.virusService.saveConfig(config,function(data){
			$.growlUI(Dict.val("common_tip"),
			"保存杀毒配置请求成功，请等待...");
			Virus.createConfigModal.hide();
			// refresh
			Virus.queryConfig("#configDataTable");
		}, function onError(msg) {
			$.growlUI(Dict.val("common_tip"), "保存杀毒配置请求成功,扣款失败");
			Virus.createConfigModal.hide();
		});
	},
	
	updateConfig:function(){
		Virus.virusService.querySafeRefVM(Virus.selectedInstanceId, function(data){
			if(data&&data.length > 0){
				var text = "该配置已经被使用在主机：";
				$(data).each(function(i,item){
					text += item.instanceName+",";
				});
				text = text.substring(0,text.length-1);
				text +="，请先关闭使用。"
				var confirmModal = new com.skyform.component.Modal(
						new Date().getTime(), "提示", "<h4>"+text+"</h4>", {
							buttons : [
									{
										name : "确定",
										onClick : function() {
											confirmModal.hide();
										},
										attrs : [ {
											name : 'class',
											value : 'btn btn-primary'
										} ]
									} ]
						});
				confirmModal.setWidth(800).autoAlign().show();
			}
			else{
				if(!Virus.updateConfigModal){
					Virus.updateConfigModal = new com.skyform.component.Modal(
							new Date().getTime(),
							"修改杀毒配置",
							$("script#updateConfigModal").html(),
							{
								buttons : [
										{
											name : "保存",
											onClick : function() {
												Virus.updateConfigAct();
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
												Virus.updateConfigModal.hide();
											}
										} ],
								beforeShow : function(){
									
									
								},
								afterShow : function(){
									$(".error").empty();
									Virus.initUpdateModal();
								}
							});
				}
				Virus.updateConfigModal.setHeight(350).setWidth(700).show();
			}
		});		
		
	},
	
	deleteConfig:function(){
		Virus.virusService.querySafeRefVM(Virus.selectedInstanceId, function(data){
			if(data&&data.length > 0){
				var text = "该配置已经被使用在主机：";
				$(data).each(function(i,item){
					text += item.instanceName+",";
				});
				text = text.substring(0,text.length-1);
				text +="，请先关闭使用。"
				var confirmModal = new com.skyform.component.Modal(
						new Date().getTime(), "提示", "<h4>"+text+"</h4>", {
							buttons : [
									{
										name : "确定",
										onClick : function() {
											confirmModal.hide();
										},
										attrs : [ {
											name : 'class',
											value : 'btn btn-primary'
										} ]
									} ]
						});
				confirmModal.setWidth(800).autoAlign().show();
			}
			else{
				var confirmModal = new com.skyform.component.Modal(
						new Date().getTime(), "删除杀毒配置", "<h4>您确认要删除杀毒配置吗?</h4>", {
							buttons : [
									{
										name : "确定",
										onClick : function() {
											Virus.virusService.deleteConfigAct(Virus.selectedInstanceId,function onStarted(result){
												confirmModal.hide();
												$.growlUI("提示", "操作成功");
												Virus.queryConfig();
											},function onFailedToStart(errorMsg){
												confirmModal.hide();
												$.growlUI("操作失败", errorMsg);
												ErrorMgr.showError("操作失败："+errorMsg);
											})
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
											confirmModal.hide();
										}
									} ]
						});
				confirmModal.setWidth(300).autoAlign();
				confirmModal.show();
			}
		});
	},
	

		bindVirusEvent : function() {

		var ids = [];
		$("#configDataTable2 tbody").find("input[type='checkbox']:checked")
				.each(function(i, custId) {
					ids.push(i);
				});
		if (ids.length != 1) {
			$.growlUI("提示", "请选择一个杀毒配置");
			return;
		}
		;
		var row = $("#configDataTable2 tbody").find(
				"input[type='checkbox']:checked").closest('tr');

		if (row.attr("state") != "running") {
			$.growlUI("提示", "只能对就绪中的杀毒配置进行操作！");
			return;
		}

		var row2 = $("#tbody2 tbody").find("input[type='checkbox']:checked")
				.closest('tr');

		var virusID = row.attr("id");
		var vmID = row2.attr("id");
		Virus.virusService.bindVirus({
			"vmId" : vmID,
			"configId" : virusID
		}, function onStarted(result) {
			Virus.startConfigModal.hide();
			$.growlUI("提示", "操作成功");
		}, function onFailedToStart(errorMsg) {
			Virus.startConfigModal.hide();
			$.growlUI("提示", "操作失败" + errorMsg);
		})
	},
	
	
	queryResultList:function(){
		var range = $("#range").val();		
		Virus.virusService.querySafeReport(Number(VM.selectedInstanceId), Number(range),function(data){
			Virus.renderResultTable(data);
		})
	},
	
	renderResultTable:function(data){
	    if(Virus.resultTable) {
	      Virus.resultTable.updateData(data);
	    } else {
	    	Virus.resultTable = new com.skyform.component.DataTable();
	    	Virus.resultTable.renderByData("#resultDataTable",{
	    	pageSize : 5,
	        
	        data : data,
	        onColumnRender : function(columnIndex,columnMetaData,columnData){
	          if(columnMetaData.title=='ID') {
				  return columnData.id;
			  }  else if (columnMetaData.name == 'state') {
	        	  return com.skyform.service.StateService.getState("Subnet",columnData['state']);
	          } else if(columnMetaData.name == 'scanType'){ //added by shixianzhi
	        	  var data1 = columnData['scanType']+"";
	        	  if(data1=="MANUAL"){
	        		  data1 =  "手动";
	        	  }
	        	  else data1 =  "自动";
	        	  
	        	  return data1;
	          } else if(columnMetaData.name == 'ipGateway'){
	        	  return columnData['ipGateway'];
	          } else {
	        	  return columnData[columnMetaData.name];
	          }
	        },
	        afterRowRender : function(rowIndex,data,tr){

	        }
	      });
	      
	      Virus.resultTable.addToobarButton($("#toolbar4privatenet"));
	      Virus.resultTable.enableColumnHideAndShow("right");
	    }
	  
	},
	updateConfigAct:function(){		
		var param = {
				  "target": "antivirusconfig",
				  "subsId": $("#configId").val(),
				  "muprty": {
				    "antimalwarerealtimeid": $("#upAutoSchedule").find("option:selected").val() ,
				    "antimalwarerealtimescheduleid": $("#upAutoRange").find("option:selected").val() ,
				    "antimalwaremanualid": $("#upManualSchedule").find("option:selected").val() 
				  }
				}
		Virus.virusService.updateConfigAct(param,function(data){
			$.growlUI(Dict.val("common_tip"),
			"保存杀毒配置请求成功，请等待...");
			Virus.updateConfigModal.hide();
			// refresh
			Virus.queryConfig("#configDataTable");
		}, function onError(msg) {
			$.growlUI(Dict.val("common_tip"), "保存失败");
			Virus.updateConfigModal.hide();
		});	
	}
}