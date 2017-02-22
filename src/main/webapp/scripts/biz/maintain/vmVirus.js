//当前刷新实例的类型为虚拟机
window.currentInstanceType='vmVirus';

window.Controller = {
		init : function(){
			VM.init();			
		}
	}

var RuleState4Yaxin = {0:"处理中",9:"成功"};
var feeUnit = 1000;

function validateApplyCount(input) {
	var result = {
		status : true
	};
	var validateResult = VM.countFiled.validate();
	if(validateResult.code != 0) {
		result.status = false;
	}
	return result;
};


var VM = {
	inited : false,
	initebs : false,
	modifyVMNameModal : null,
	modifyVMConfigurationModal : null,
	queryResultModal : null,
	instanceName : null,
	selectedInstanceId : null,
	selectedConfigId : null,
	inMenu : null,
	inVirusMenu:null,
	datatable : null,
	VMState : [],
	serviceOfferingsData : [],
	countFiled : null,
	defaultNetwork : null,
	_generateContent_tmp : null,
	quota : 99,
	backupDataTable : null,
	add2NetTable : null,
	removeFromNetTable : null,
	customerIdent :null,
	service : com.skyform.service.vmService,
	
	init : function() {
		VM.inMenu = false; // 用于判断鼠标当前是否在下拉操作框中即$("#contextMenu")和$("#dropdown-menu")
		VM.inVirusMenu = false;
		VM.selectedInstanceId = null;
		VM.instanceName = null;
		VM.instances = [],

		
		$("#content_container #checkAll").attr("checked", false);
		$("#tbody2 input[type='checkbox']").attr("checked", false);
		$("#moreAction").addClass("disabled");

		$("#dropdown-menu").unbind('mouseover').bind('mouseover', function() {
			VM.inMenu = true;
		});
		$("#dropdown-menu").unbind('mouseout').bind('mouseout', function() {
			VM.inMenu = false;
		});
		$("#dropdown-menu li").unbind('click').bind('click', function(e) {
			if (!$(this).hasClass("disabled"))
				VM.onOptionSelected($(this).attr("action"));
		});

		$("#updateData").unbind().click(function() {
			VM.describleVM();
		});
		$("#config").unbind().click(function() {
			Virus.openConfig();
		});
		$("#createConfig").unbind().click(function() {
			Virus.createConfig();
		});	
		$("#refreshConfig").unbind().click(function() {
			Virus.queryConfig();
		});	
		if(CommonEnum.offLineBill){
		}
		
		$("#virus_tab").on("shown",function(){
			AutoUpdater.stop();
			window.currentInstanceType = "virus";			
			AutoUpdater.start();
			Virus.init();
		});
		$("#vmVirus_tab").on("show",function(){
			AutoUpdater.stop();
			window.currentInstanceType = "vmVirus";			
			AutoUpdater.start();
			VM.init();
		});
				
		VM.describleVM();
		Virus.querySchedule();
	},


	getInstanceInfoById : function(instanceId) {
		var result = null;
		$(VM.instances).each(function(i,instance){
			if(instance.id+"" == instanceId+"") {
				result = instance;
				return false;
			}
		});
		return result;
	},
	getFee : function(){
		if(CommonEnum.offLineBill)return;
		var period = VM.createPeriodInput.getValue();		
		var param = vmJson.getVMFeeInstance();
		Dcp.biz.apiAsyncRequest("/pm/queryCaculateFeeByPrtyList",param, function(data) {
			if(null!=data&&0 == data.code){
				var count = VM.createCountInput.getValue()
				var fee =  data.data.fee;
				//$("#feeInput").val(count * fee/feeUnit);
				$(".price").empty().html(count * fee/feeUnit);
			}
		});
	},
	getFee4change : function(){
		var _period = VM.getCheckedArr().parents("tr").attr("period");
		if(CommonEnum.offLineBill)return;
		var period = VM.createPeriodInput.getValue();		
		var param = vmJson.getVMFeeInstance();
		Dcp.biz.apiAsyncRequest("/pm/queryCaculateFeeByPrtyList",param, function(data) {
			if(null!=data&&0 == data.code){
//				var count = VM.createCountInput.getValue();
				var count = 1;
				var fee =  data.data.fee;
				//$("#feeInput").val(count * fee/feeUnit);
				$(".price4change").empty().html(count * fee/feeUnit);
			}
		});
	},

	describleVM : function() {
		if(VM.inited) VM.datatable.container.find("tbody").html("<tr ><td colspan='7' style='text-align:center;'><img src='"+CONTEXT_PATH+"/images/loader.gif'/><strong>"+Dict.val("common_retrieving_data_please_wait")+"</strong></td></tr>");
		Virus.virusService.listInstances(function(instances){
			$("#load_waiting_tbl").hide()
			VM.instances = instances;
			if(instances && instances.length>0) {
				$("#details").show();
//				VM.showInstanceInfo(instances[0]);
			} else {
				$("#details").hide();
			}
			
			VM.renderDataTable(instances);
		}, function(errorMsg){
			$.growlUI("提示", "查询云主机发生错误：" + errorMsg);
		});
	},
	
	getBillTypeList: function() {
		$("#billType").empty();
		$.each(CommonEnum.billType, function(index) {
			var cpu_option = $("<div  class=\"types-options \" data-value='"+ index + "' style='width:50px'>" + CommonEnum.billType[index] + "</div>");
			cpu_option.appendTo($("#billType"));
			cpu_option.click(function(){
				if($(this).hasClass("selected"))return;
				$("div.type-options").removeClass("selected");
				$(".options .types-options").removeClass("selected");
				$(this).addClass("selected");					
				VM.queryProductPrtyInfo(index);
				if(0 == index){
					$("#periodUnit").empty().html("月");
				}
				else if(3 == index){
					$("#periodUnit").empty().html("年");
				}
				else if(2 == index){
					$("#periodUnit").empty().html("天");
				}
			});
			if (index == 0||index == 5) {
				cpu_option.click();
				cpu_option.click();
			}
		});
	},
//	创建虚拟机
	createVMPost : function(wizard) {
		var instance = vmJson.getVM4JsonInstance();		
		VM.service.createInstance(instance, function onCreated(instance){
			//订单提交成功后校验用户余额是否不足
			var _tradeId = instance.tradeId;
			var _fee = $(".price").html();			
			com.skyform.service.BillService.wizardConfirmTradeSubmit(_fee,_tradeId,VM.wizard, function onSuccess(data){				
				$.growlUI("提示", "申请已提交，请等待开通！");
				wizard.markSubmitSuccess();
				VM.describleVM();
			},function onError(msg){
				$.growlUI("提示", "申请虚拟机已提交，扣款失败");
				wizard.markSubmitError();
			});
			
//			com.skyform.service.BillService.tradeSubmit(_tradeId);				
		},function onError(msg){
			$.growlUI("提示", "创建申请提交失败：" + msg);
		});
	},	
	
	
	
	queryProductPrtyInfo : function(index){		
		com.skyform.service.BillService.queryProductPrtyInfo(index,window.currentInstanceType,function(data){
			if( null != data){	
				vmJson.oslist = data.oslist;
				vmJson.vmConfig = data.vmConfig;
				vmJson.productId = data.productId;
				vm4quickJson.vmQuickConfig = data.vmQuickConfig;
			}		
		});
	},


	
	renderDataTable : function(data) {
	 if(VM.datatable) {
		 VM.datatable.updateData(data);
		 VM.checkSelected();
	    } else {
	    	VM.datatable = new com.skyform.component.DataTable();
			VM.datatable.renderByData(
					"#tbody2",// 要渲染的table所在的jQuery选择器
					{
						"data" : data, // 要渲染的数据选择器					
						"pageSize" : 5,
						"onColumnRender" : function(columnIndex,columnMetaData, columnData) {
							var text = '';
							if(columnMetaData.name=='id') {
					              return '<input type="checkbox" name="check" id="' + columnData.id + '" value="'+columnData.id+'">';
					           } else if ("ID" == columnMetaData.name) {
					              return columnData.id;
					           } else if ("instanceName" == columnMetaData.name) {
					        	   if(null!=columnData.uuid&&""!=columnData.uuid){
										text = '<a  href="monitor.jsp?code=monitor&vmId='+columnData.uuid+'&vmName='+encodeURI(encodeURI(columnData.instanceName))+'" >'+columnData.instanceName+'</a>';
									}
									else text = columnData.instanceName;
					        	   return text;
					           }  else if ("state" == columnMetaData.name) {
					              return com.skyform.service.StateService.getState("vm",columnData.state||columnData);
					           }  else if ("configState" == columnMetaData.name) {
					              return com.skyform.service.StateService.getState("vm",columnData.configState||columnData);
					           } else if ("configSwitch" == columnMetaData.name) {
					        	   text = com.skyform.service.StateService.getState("vm",columnData.configSwitch);
					        	   
					        	   return text ;
					           }
							return columnData[columnMetaData.name];
						},
						
//						{"message":"success","data":[{"vmPrice":1,"mem":"0.5","state":"opening","expireDate":1412493362000,"productId":101,"createDate":1409901362000,"cpu":"1","instanceName":"VM_67786912","disk":"50","osId":"1","id":67786912,"ip":" ","period":1,"os":"Cetnos6.4-x86_64"},{"vmPrice":1,"mem":"0.5","state":"opening","expireDate":1412476682000,"productId":101,"createDate":1409884682000,"cpu":"1","instanceName":"VM_67784939","disk":"50","osId":"1","id":67784939,"ip":" ","period":1,"os":"Cetnos6.4-x86_64"}],"code":0}
						"afterRowRender" : function(rowIndex, data, tr) {
							
							tr.attr("uuid",data.uuid);
							//tr.attr("act",data.instanceName);
							tr.attr("configState",data.configState);
							tr.attr("configSwitch",data.configSwitch);
							tr.attr("configId",data.configId);
							tr.attr("state",data.state);
							tr.attr("instanceId",data.id);
							tr.attr("productID",data.productId);
							//tr.attr("cpu",data.cpu);
							//tr.attr("mem",data.mem);
							//tr.attr("os",data.os);
							//tr.attr("period",data.period);
							//tr.attr("vmPrice",data.vmPrice);
							tr.attr("productId",data.productId);
							//tr.attr("osId",data.osId);
							VM.bindEventForTr(rowIndex, data, tr);
						},
						"afterTableRender" : function() {
							VM.bindEvent();
//							$("#tbody2 tbody").find("tr").css("background-color","");
							var firstRow = $("#tbody2 tbody").find("tr:eq(0)");
							var	instanceId = firstRow.attr("instanceId");
							var instance = VM.getInstanceInfoById(instanceId);
							//VM.showInstanceInfo(instance);
							firstRow.css("background-color","#BCBCBC");
							VM.setSelectRowBackgroundColor(firstRow);
							
						}
						
					});
			VM.checkSelected();
	    }
		VM.inited = true;
		VM.datatable.addToobarButton("#toolbar4VMVirus");
		VM.datatable.enableColumnHideAndShow("right");
	},
	bindEventForTr : function(rowIndex, data, tr) {
		$(tr).attr("state", data.optState || data.state);
		$(tr).attr("name", data.instanceName);
		$(tr).attr("jobState", data.jobState);
		$(tr).attr("configSwitch",data.configSwitch);
		$(tr).attr("configState",data.configState);

		$(tr).unbind().mousedown(
			function(e) {
				
				if (3 == e.which) {
					$("#tbody2 input[type='checkbox']").attr("checked", false);
					$("#content_container #checkAll").attr("checked", false);
					tr.find("input[type='checkbox']").attr("checked", true);
					VM.selectedInstanceId = tr.attr("instanceId");
					VM.selectedConfigId = tr.attr("configId");
					$("#moreAction").removeClass("disabled");
					document.oncontextmenu = function() {
						return false;
					}
					var screenHeight = $(document).height();
//					console.log($(document).height());
//					console.log(e.pageY);
//					console.log(e.pageX);
					var top = e.pageY;
					
					if (e.pageY >= screenHeight / 2) {
						top = e.pageY - $("#contextMenu").height();
//						console.log($("#contextMenu").height())
						// 如果鼠标所在位置在屏幕高度中线的下半部分，则弹出框往上弹出
					}
					$("#contextMenu").hide();
					$("#contextMenu").attr(
							"style",
							"display: block; position: absolute; top:"
									+ top + "px; left:" + e.pageX
									+ "px; width: 180px;");
					$("#contextMenu").show();
					e.stopPropagation();
					VM.checkSelected(data);

				}
				//VM.showInstanceInfo(data);
				VM.setSelectRowBackgroundColor(tr);
		});
		$(tr).click(function() {
			VM.checkboxClick(tr);
		});
	},
	setSelectRowBackgroundColor : function(handler) {
		$("#content_container tr").css("background-color","");
		handler.css("background-color","#BCBCBC");
	},
	showInstanceInfo : function(instanceInfo) {
		if (instanceInfo==null) return;
		$("div#details span.detail_value").each(function(i,item){
			var prop = $(this).attr("prop");
			$(this).html("" + instanceInfo[""+prop]);
		});
		var array = new Array();
		$("#vmRelations").html("");
		//查询详情
		VM.service.listRelatedInstances(instanceInfo.id,function(data){
			data = $.parseJSON(data);
			VM.appendVmRelation(data,instanceInfo);
			VM.service.listIriRelation(instanceInfo.id,function(data){
				VM.appendVmRelation(data,instanceInfo);
			},function(e){
			});
		},function(e){
		});
		$("#opt_logs").empty();
		com.skyform.service.LogService.describeLogsUIInfo(instanceInfo.id);		
	},
	appendVmRelation : function(array,instanceInfo) {
		var dom = "";
		$(array).each(function(i) {
			var ipaddress = "";
			var templateType = array[i].templateType;

			if(templateType==9){
				ipaddress = " ("+array[i].resId+")";
			}
			ipaddress = ipaddress.replace("null","");		
			
			var insState = com.skyform.service.StateService.getState(templateType,array[i].state);
			if(templateType==7 && "using"!=array[i].state){
				//亚信工作流不支持人为干预，由线下处理
				//insState = insState+"<a class='bindSecurity' value="+array[i].id+"> 重新绑定</a>";
				insState = insState+"<span class='text-error'> 未绑定</span>";
			}
			dom += "<li class=\"detail-item\">"
				+"<span>"+array[i].id+"</span>&nbsp;&nbsp;&nbsp;&nbsp;"
				+"<span>" + VM.switchType(array[i].templateType) +"</span>&nbsp;&nbsp;&nbsp;&nbsp;"
				+"<span>"+array[i].instanceName+"</span>&nbsp;"
				+"<span>"+ipaddress+"</span>&nbsp;&nbsp;&nbsp;&nbsp;"
				+"<span>"+insState+"</span>"
				+"</li>";
		});
		$("#vmRelations").empty().append(dom);
		$("#vmRelations").find("a.bindSecurity").unbind("click").click(function(){
			VM.service.bindSecurityGroupToVm($(this).attr("value"),instanceInfo.id,function (data){
				$.growlUI("提示",data.msg);
			},function onUpdateFailed(errorMsg){
				$.growlUI("错误",data.msg);
			})
		}).css("cursor","pointer");
	},
	switchType : function(type) {
		switch(type){
			case 1 : return "云主机";
			case 2 : return "弹性块存储";//"虚拟磁盘";
			case 3 : return "小型机";
			case 4 : return "云备份";
			case 5 : return "云监控";
			case 6 : return "负载均衡";
			case 7 : return "防火墙";
			case 8 : return "带宽";
			case 9 : return "互联网接入";
			case 10 : return "物理机";
			case 11 : return "对象存储";
			case 12 : return "弹性块存储";
			case 13 : return "文件存储";
			case 14 : return "Paas";
			case 16 : return "路由";
			case 17 : return "私有网络";
			default : return "未知";
		}
	},
	bindEvent : function() {	

		// 为table的右键菜单添加监听事件
		$("#contextMenu").unbind("mouseover").bind('mouseover', function() {
			VM.inMenu = true;
		});

		$("#contextMenu").unbind("mouseout").bind('mouseout', function() {
			VM.inMenu = false;
		});
		$("#contextMenu li").unbind("mousedown").bind('mousedown', function(e) {
			$("#contextMenu").hide();
			if (!$(this).hasClass("disabled"))VM.onOptionSelected($(this).attr("action"));
		});
		$("body").unbind('mousedown').bind('mousedown', function() {
			if (!VM.inMenu) {
				$("#contextMenu").hide();
			}
			if (!VM.inVirusMenu) {
				$("#contextMenu2").hide();
			}
		});
		// 为table的右键菜单添加监听事件
		$("#contextMenu2").unbind("mouseover").bind('mouseover', function() {
			VM.inVirusMenu = true;
		});

		$("#contextMenu2").unbind("mouseout").bind('mouseout', function() {
			VM.inVirusMenu = false;
		});
		$("#contextMenu2 li").unbind("mousedown").bind('mousedown', function(e) {
			$("#contextMenu2").hide();
			if (!$(this).hasClass("disabled"))VM.onOptionSelected($(this).attr("action"));
		});
		// 更改配置中添加点击div的效果

		$("div.osList").unbind().click(function() {
			$("div.osList").removeClass("selected");
			$(this).addClass("selected");
		});

		$("#content_container #checkAll").unbind().click(function(e) {
			e.stopPropagation();
			var checked = $(this).attr("checked") || false;
			if(checked) $("#content_container tbody input[type='checkbox']").attr("checked",true);
			else $("#content_container tbody input[type='checkbox']").removeAttr("checked");
			
			VM.checkSelected();
		});
	},
	checkboxClick : function(tr) {
		VM.checkSelected();
	},
	checkSelected : function(selectInstance) {
		var rightClicked = selectInstance?true:false;
		var allCheckedBox = $("#tbody2 input[type='checkbox']:checked");
		
		var oneSelected = allCheckedBox.length == 1;
		var hasSelected = allCheckedBox.length > 0;
		
		$(".operation").addClass("disabled");
		
		var state = $(allCheckedBox[0]).parents("tr").attr("state");
		var configSwitch = $(allCheckedBox[0]).parents("tr").attr("configSwitch");
		var configState = $(allCheckedBox[0]).parents("tr").attr("configState");
		var jobState = $(allCheckedBox[0]).parents("tr").attr("jobState");
		
		var allInstanceHasTheSameState = true;
		
		var allInstanceStateCanBeDestroy = true;
		
		$(allCheckedBox).each(function(index,checkbox){
			var _state = $(checkbox).parents("tr").attr("state");
			var _configSwitch = $(checkbox).parents("tr").attr("configSwitch");
			var _configState = $(checkbox).parents("tr").attr("configState");
			if(_state != state) {
				allInstanceHasTheSameState = false;
				return false;
			}
		});
		
		$(allCheckedBox).each(function(index,checkbox){
			var _state = $(checkbox).parents("tr").attr("state");
			var _configSwitch = $(checkbox).parents("tr").attr("configSwitch");
			var _configState = $(checkbox).parents("tr").attr("configState");
			var _jobState = $(checkbox).parents("tr").attr("jobState");
			if(_state =='deleting' || _state=='opening' || _jobState=='lock'){
				allInstanceStateCanBeDestroy = false;
				return false;
			}
		});
		
		$("#vmVirus_content .operation").each(function(index,operation){
			var condition = $(operation).attr("condition");
			var action = $(operation).attr("action");
			var enabled = true;
			eval("enabled=("+condition+")");
			if(enabled) {
				$(operation).removeClass("disabled");
				$(operation).unbind("click").click(function(){
					VM.onOptionSelected(action||"");
				});
			} else {
				$(operation).addClass("disabled");
				$(operation).unbind();
			}
		});
		
		
		if(rightClicked) {
			VM.instanceName = selectInstance.instanceName;
			VM.selectedInstanceId = selectInstance.id;	
			VM.selectedConfigId = selectInstance.configId;
		} else {
			for ( var i = 0; i < allCheckedBox.length; i++) {
				var currentCheckBox = $(allCheckedBox[i]);
				if (i == 0) {
					VM.instanceName = currentCheckBox.parents("tr").attr("name");
					VM.selectedInstanceId = currentCheckBox.attr("value");
					VM.selectedConfigId = currentCheckBox.parents("tr").attr("configId");
				} else {
					VM.instanceName += "," + currentCheckBox.parents("tr").attr("name");
					VM.selectedInstanceId += "," + currentCheckBox.attr("value");
				}
			}
		}
	},

	leftClickInterrupt : function(obj, title, str) {
		obj.addClass("disabled");
		obj.unbind().mousedown(function(e) {
			if (1 == e.which) {
				$.growlUI(title, str);
			}

		});
	},
	onOptionSelected : function(action) {
		{
			if ("config" == action) {
				Virus.openConfig(); // 修改
			} else if ("createConfig" == action) { // 创建杀毒配置==
				Virus.createConfig();
			} else if ("updateConfig" == action) { // 修改杀毒配置==
				Virus.updateConfig();
			} else if ("playConfig" == action) { // 启动主机杀毒
				Virus.playConfig();
			} else if ("pauseConfig" == action) { // 暂停主机杀毒
				Virus.pauseConfig();
			} else if ("unbindConfig" == action) { // 关闭主机杀毒
				Virus.unbindConfig();
			} else if("deleteConfig" == action){   //删除杀毒配置==
				Virus.deleteConfig();
			}else if("manual" == action){   //手动杀毒
				Virus.manual();
			}
			
			
			
			
			else if ("openVM" == action) { // 启动云主机
				VM.openVM();
			} else if ("closeVM" == action) {
				VM.closeVM(); // 关机云主机
			} else if ("queryResult" == action) {  // 查看杀毒结果
				VM.queryResult(); 
			} else if ("loadVdisk" == action) {// 加载硬盘
				 
				VM.showRuningEbs();
				$("#myModal002").modal("show"); 
			} else if ("changeEquipment" == action) {  //更改主机配置
				VM.modifyVMConfiguration();
			} else if ("createSnapShot" == action) {  //创建快照
				VM.showBackupVMModal();
			} else if ("showSnapShot" == action) {  //快照管理
				VM.showVMSnapshotModal();
//				window.location.href='snap.jsp';
			} else if ("destroyVM" == action) {   //销毁虚拟机
				VM.destroyVM(); // 销毁
			} else if ("cfgFirewall" == action){
				VM.cfgFirewall();
			} else if ("vncVM" == action) {
				VM.vncVM();
			} else if ("renew" == action) {
				VM.renew();
			} else if ("backup" == action) {
				VM.backup();
			} else if ("queryBackup" == action) {
				VM.queryBackup();
			} else if ("msnap" == action) {
				msnap();
			} else if ("addVM2net" == action) {
				VM.queryPrivateNets();
			} else if("deleteVMFromNet" == action){
				VM.queryBindPrivateNets();
			}
			else if("ResetPassword" == action){
				VM.ResetPassword();
			}
			else if("export" == action){
				modifyFirewall.exportFile();
			}
//			else if("SavePassword" == action){
//				VM.SavePassword();
//			}
		}
	},

	getCheckedArr : function() {
		return $("#tbody2 tbody input[type='checkbox']:checked");
	},
	modifyVMConfiguration : function(id) {
		// TODO

		if (VM.modifyVMConfigurationModal == null) {
			var _id=new Date().getTime();
			VM.modifyVMConfigurationModal = new com.skyform.component.Modal(
					""+_id,
					"更改主机的配置",
					$("script#upgradeCfg").html(),
					{
						buttons : [
								{
									name : "确定",
									onClick : function() {
										var instanceId = VM.selectedInstanceId;
										var cpu = $("#myModal006change").find(
												".cpu-options.selected").attr(
												"data-value");
										var memory = $("#myModal006change")
												.find(
														".memory-options.selected")
												.attr("data-value");
										var muprty = {
												"cpuNum" : Number(cpu),
												"memorySize" : Number(memory)
										};
										//var instance = VM.getInstanceInfoById(VM.selectedInstanceId);
										var oc = $.trim($("#myModal006change #oldCpu").html());
										var om = $("#myModal006change #oldMem").html();										
										if(oc >= cpu || om >= memory) {
											$("#myModal006change #errorMsg").addClass("icon-exclamation-sign text-error");
											$("#myModal006change #errorMsg").empty().html("&nbsp;请选择高于当前的配置，否则不能变更。")
											return;
										}
										com.skyform.service.PortalInstanceService.modprodprty("serviceroffering",instanceId,muprty,function(result){
											//订单提交成功后校验用户余额是否不足
											var _tradeId = result[0].tradeId;
											//{"msg":"","data":[{"feeValue":99520,"tradeId":"1409190068221003"}],"code":0}
											var _fee = result[0].feeValue/1000;
											var _modal = $("#"+_id);
											com.skyform.service.BillService.confirmTradeSubmit(_fee,_tradeId,_modal,function onSuccess(data){
												$.growlUI("提示", "操作成功"); 
//												$("#createModal").modal("hide");
												VM.modifyVMConfigurationModal.hide();
												// refresh
												VM.describleVM();							
											},function onError(msg){
												$.growlUI("提示", "更改配置申请提交成功,扣款失败");
//												$("#createModal").modal("hide");
												VM.modifyVMConfigurationModal.hide();
											});				
										},function(error){
											VM.modifyVMConfigurationModal.hide();
											ErrorMgr.showError("操作失败:" + error);
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
										VM.modifyVMConfigurationModal.hide();
									}
								} ],
								beforeShow : function(){
									var osDes = VM.getCheckedArr().parents("tr").attr("os");		
									if((osDes.toLowerCase()).indexOf("win")!=-1){
										VM.isWin = true;
									}
									else VM.isWin = false;
									VM.getServiceOfferingId();
									VM.getCpuListUpgrade();
									cpuarr = VM.getCpuArr();
									VM.getMemoryListUpgrade(cpuarr[0]);
									var oldCpu = VM.getCheckedArr().parents("tr").attr("cpu");
									var oldMem = VM.getCheckedArr().parents("tr").attr("mem");
									$("#myModal006change #oldCpu").html(oldCpu);
									$("#myModal006change #oldMem").html(oldMem);
									$("#myModal006change #errorMsg").removeClass().empty();
									$("#myModal006change").find(".options .types-options.cpu-options")
									.click(
											function() {
												$("#myModal006change").find(
														".options .types-options.cpu-options ")
														.removeClass("selected");
												$(this).addClass("selected");
												//cpu = $(this).attr("data-value");							
											});
							$("#myModal006change").find(".options .types-options.memory-options")
									.click(
											function() {
												$("#myModal006change").find(
														".options .types-options.memory-options ")
														.removeClass("selected");
												$(this).addClass("selected");
												//memory = $(this).attr("data-value");
												
											});
							 var oldC = $("#myModal006change").find(".options .types-options.cpu-options[data-value="+oldCpu+"]");
							 oldC.click();
							 if(oldMem!=0.5){
								 var oldM = $("#myModal006change").find(".options .types-options.memory-options[data-value="+oldMem+"]");
								 oldM.click();
							 }
							if(!CommonEnum.offLineBill){
								$(".feeInput_div").show();
							}
							 
							 VM.getFee4change();
						}	
					
					});

		};
		$(".subFee4change").bind('mouseup keyup',function(){
			setTimeout('VM.getFee4change()',5);
		});

		VM.modifyVMConfigurationModal.show();
	},
	destroyVM : function(id) {
		var confirmModal = new com.skyform.component.Modal(
				new Date().getTime(),
				"销毁云主机",
				"<h4>您确认要销毁" + "吗?</h4>",
				{
					buttons : [
							{
								name : "确定",
								onClick : function() {
									confirmModal.hide();
									VM.service.destroyVM(VM.selectedInstanceId,function(result){
										$.growlUI("提示", "操作成功");
										com.skyform.service.modifyStatus.modifyAllStatus(VM.selectedInstanceId,"deleting",VM.instances,function(){
									    	VM.renderDataTable(VM.instances);
									    });
										
									},function onError(errorMsg){
										ErrorMgr.showError("销毁虚机失败:" + errorMsg);
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
									confirmModal.hide();
								}
							} ]
				});
		confirmModal.setWidth(300).autoAlign();
		confirmModal.show();
	},


	renew : function(){
		var lbId = VM.getCheckedArr().parents("tr").attr("instanceId");
		if(VM.renewModal){
			
		}else{
			VM.renewModal = new com.skyform.component.Renew(lbId,{
				buttons : [
							{
								name : "保存",
								onClick : function(){
									var period = VM.renewModal.getPeriod().getValue();
									$("#renewModal").modal("hide");	
									var _modal = $("#renewModal");
									com.skyform.service.renewService.renew(VM.getCheckedArr().parents("tr").attr("instanceId"),period,function onSuccess(data){
										//订单提交成功后校验用户余额是否不足
										var _tradeId = data.tradeId;
										var _fee = $("#feeInput_renew").text();
										com.skyform.service.BillService.confirmTradeSubmit(_fee,_tradeId,_modal,function onSuccess(data){
											$.growlUI("提示", "续订申请提交成功,扣款成功, 请耐心等待..."); 
											// refresh
//											VM.updateDataTable();									
										},function onError(msg){
											$.growlUI("提示", "续订申请提交成功,扣款失败...");
										});								
									},function onError(msg){
										$.growlUI("提示", "续订时长提交失败：" + msg); 
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
									VM.renewModal.hide();
								}
							}
						]
					});
			}
			VM.renewModal.getFee_renew(lbId);
			VM.renewModal.show();		
			$(".subFee_renew").bind('mouseup keyup',function(){
				setTimeout('VM.renewModal.getFee_renew('+lbId+')',100);
			});
	},
	
	queryResult:function(){
		var row = $("#tbody2 tbody").find("input[type='checkbox']:checked").closest('tr');
		if (VM.queryResultModal == null) {
			VM.queryResultModal = new com.skyform.component.Modal(
				new Date().getTime(),
				"查看杀毒结果",
				$("script#result_div").html(),
				{
					buttons : [],
					beforeShow : function(){						
					},
					afterShow : function(){
						$("#hostName").html(row.attr("name"));
						$("#query").off().click(function(){
							Virus.queryResultList();
						});
					}
				})
		}
		VM.queryResultModal.setWidth(800).setHeight(450).show();
	}
}