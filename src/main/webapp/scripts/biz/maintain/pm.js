//当前刷新实例的类型为物理机
window.currentInstanceType='pm';

//$(function() {
//	pm.init();	
//});

window.Controller = {
		init : function(){
			pm.init();
			$(".provider-filter").tooltip();
		},
		refresh : function(){
			pm.describleVM();			
		}
	}

var feeUnit = 1000;
function validateApplyCount(input) {
	var result = {
		status : true
	};
	var validateResult = pm.countFiled.validate();
	if(validateResult.code != 0) {
		result.status = false;
	}
	return result;
};

function validatePhysicalName(){
	var result = {
		status : true
	};
	if($("#instanceName4pm").val()==""||$("#instanceName4pm").val()==null){
		$("#tip_Name").empty().html("* 请输入物理机名称！");
		result.status = false;
	}
//	pm.PortalInstanceService.callApi = com.skyform.service.callSyncApi;
//	var instanceName = $("#instanceName").val();
//	var code="vm";
//	pm.PortalInstanceService.checkDuplcatedName(instanceName,code,function(data){
//		result.status = data;
//		result.msg = "物理机名称重复!";
//	},function(error){
//		result.status = false;
//		result.msg = error;
//	});
	return result;
};
function validatehadPrivateNet(select){		
	var result = {status : true};
	$("#tip_1226").empty();
	if($("#vm_privatenetwork option").length == 0||$("#vm_privatenetwork option:selected").val()==""){
		$("#tip_1226").empty().html("* 请先去申请私有网络！");
		result.status = false;
	}
	return result;			
};


var pm = {
	//microType : ["微型","小型A"],
	//microCpu : 1,
	//microMem : ["0.5","1"],
	isWin : false,	
	inited : false,
	initebs : false,
	wizard : null,
	modifyVMNameModal : null,
	modifyVMConfigurationModal : null,
	instanceName : null,
	selectedInstanceId : null,
	inMenu : null,
	datatable : new com.skyform.component.DataTable(),
	//VMState : [],
	serviceOfferingsData : [],
	countFiled : null,
	//defaultNetwork : null,
	quota : 99,
	curProductId : 0,
	service : com.skyform.service.pmService,
	firewallService : com.skyform.service.FirewallService,
	PortalInstanceService : com.skyform.service.PortalInstanceService,
	
	init : function() {
		pm.inMenu = false; // 用于判断鼠标当前是否在下拉操作框中即$("#contextMenu")和$("#dropdown-menu")
		pm.selectedInstanceId = null;
		pm.instanceName = null;
		pm.instances = [],
		/*pm.VMState = {
			"pending" : "待审核",
			"reject" : "审核拒绝",
			"opening" : "正在开通",
			"changing" : "正在变更",
			"deleting" : "正在销毁",
			"deleted" : "已销毁",
			"running" : "运行中",
			"using" : "正在使用",
			"attaching" : "正在挂载",
			"unattaching" : "正在卸载",
			"stopping" : "正在关机",
			"starting" : "正在开机",
			"restarting" : "正在重启",
			"resetting" : "正在重启",
			"error" : "错误",
			"closed" : "已关机",
			"backuping" : "正在创建快照",
			"restoreing" : "正在恢复快照",
			"snapshotDeling" : "正在删除快照"
		};*/
		$(".mirrorType a").unbind("click").bind("click",function(){
			$(".osempty").hide();
			if($(this).hasClass("selected")){
				return
			}
			var mirrorType = $(this).attr("mirrorType");
			
			$(".mirrorType a").removeClass("selected");
			$(this).addClass("selected");
			if(mirrorType == "using"){
				//$(".systemOs").hide();
				pm.queryOsList();
				pm._initSelected();
			}/*else if(mirrorType == "all"){
				$(".systemOs").show();
				pm.queryOsList();
				pm._initSelected();
			}else if(mirrorType=="identify"){
				$(".systemOs").hide();
				pm.getImageList();
			}*/
		});
//		$("#modifyFirewallModal").on('hide',function(){
//			window.currentInstanceType='vm';
//		})
//		if($("#modifyFirewallModal").attr("class").indexOf("in")==-1){
//			
//		}
		$("#openMore").click(function(){
			setTimeout(function(){
				if($("#learn-more-content").attr("class").indexOf("in")==-1){
					$("#openMore").empty().html("展开");
				}
				else if($("#learn-more-content").attr("class").indexOf("in")!=-1){
					$("#openMore").empty().html("收起");
				}
			},10);
			
			
//			if("收起" == $("#openMore").html()||$("#learn-more-content").attr("class").indexOf("in")!=-1){
//				$("#openMore").empty().html("展开");
//			}
//			else if("展开" == $("#openMore").html()||$("#learn-more-content").attr("class").indexOf("in")==-1){
//				$("#openMore").empty().html("收起");
//			}
			
//			if($("#learn-more-content").attr("class").indexOf("in")==-1){
//				$("#openMore").empty().html("收起");
//			}
//			else $("#openMore").empty().html("展开");
		});
		
		$("#content_container #checkAll").attr("checked", false);
		$("#tbody2 input[type='checkbox']").attr("checked", false);
		$("#moreAction").addClass("disabled");

		$("#dropdown-menu").unbind('mouseover').bind('mouseover', function() {
			pm.inMenu = true;
		});
		$("#dropdown-menu").unbind('mouseout').bind('mouseout', function() {
			pm.inMenu = false;
		});
		$("#dropdown-menu li").unbind('click').bind('click', function(e) {
			if (!$(this).hasClass("disabled"))
				pm.onOptionSelected($(this).attr("action"));
		});

		$("#updateData").unbind().click(function() {
			pm.describleVM();
		});
		$("#createPM").bind('click',function(e){
			pm.createPM();
		});
		
		pm.describleVM();
		pm._initWizard();
		pm.getBillTypeList();	
		
	},
	/*initCreate : function(){
		pm._initQuickVM();	
		pm.getBillTypeList4quick();							
		if(!CommonEnum.offLineBill){
			$(".feeInput_div").show();
		}
		$("#createModal").modal("show");
	},*/
	_initSelected :function(){
		// 获取系统模板之后，可创建物理机
		pm.getTemplateList(function postInit(){				
			pm.getServiceOfferings(function(){
				$("a#createPM").unbind().click(pm.createPM);
				//$("a#quickVM").unbind().click(pm.quickVM);
				$(".create-another-server").click(function() {
					pm.wizard.reset();
				});

				$(".im-done").click(function() {
					pm.wizard.close();
				});
			});
		});
	},
	_initWizard : function(){
		
		/*pm.service.listNetworks(function(networks){
			if(networks && networks.length>0) {
				pm.defaultNetwork = networks[0];
			}
		});*/		
		
//		// 带+-的输入框
//		pm.createCountInput = null;
//		if (pm.createCountInput == null) {
//			var container = $("#createCount").empty();
////			com.skyform.service.Eip.queryEnoughIP(function(enough){
//			var max = 99;
//			pm.createCountInput = new com.skyform.component.RangeInputField(container, {
//				min : 1,
//				defaultValue : 1,
//				max:max,
//				textStyle : "width:137px"
//			}).render();
//			pm.createCountInput.reset();
//		}	
		
		// 带+-的输入框
		pm.createPeriodInput = null;
		if (pm.createPeriodInput == null) {
			var container = $("#period").empty();				
			var max = 12;
			pm.createPeriodInput = new com.skyform.component.RangeInputField(container, {
				min : 1,
				defaultValue : 1,
				max:max,
				textStyle : "width:137px"
			}).render();
			pm.createPeriodInput.reset();
				
		}		
		$(".subFee").bind('mouseup keyup',function(){
			setTimeout('pm.getFee()',5);
		});
		
		$("#instanceName4pm").bind("blur",function(){
			if($("#instanceName4pm").val()==""||$("#instanceName4pm").val()==null){
				$("#tip_Name").empty().html("* 请输入物理机名称！");
			}else{
				$("#tip_Name").empty().html("");
			}
		})
		
		$("#vm_privatenetwork").bind("blur",function(){
			if($("#vm_privatenetwork option:selected").val()==""||$("#vm_privatenetwork option:selected").val()==null){
				$("#tip_1226").empty().html("* 请选择网络设置！");
			}else{
				$("#tip_1226").empty().html("");
			}
		})
		
//		$("input[type='radio'][name='networkoption']").bind('mouseup',function(){
//			setTimeout('pm.getFee()',5);
//		});
//		
//		$("#btnBackupSave").unbind("click").bind("click", function() {
//			pm.backupVolume();
//		});		
		
		// 系统盘
//		$( "#rootDisk-range-min" ).slider({
//			range: "min",
//			value: value,
//			min: 1,
//			max: 200,
//			step: 10,
//			slide: function( event, ui ) {
//				$("#createRootDiskSize").val(ui.value);
//			}
//		});		
//		$("#createRootDiskSize").bind("blur",function(){
//			var value = $("#rootDisk-range-min" ).slider("value");
//			var newValue = $("div#ostemplates div.selected>span:first").attr("mindisk");
//			if(/^[1-9]+[0-9]*$/.test(""+newValue) &&  parseInt(newValue)>= min && parseInt(newValue) <= max) {
//				$("#rootDisk-range-min" ).slider("value",newValue);
//			} else {
//				$(this).val(value);
//			}
//		});
//		$( "#createRootDiskSize" ).val($( "#RootDisk-range-min" ).slider( "value" ) );
		// 数据盘
//		$( "#dataDisk-range-min" ).slider({
//			range: "min",
//			value: value,
//			min: vdiskJson.product.min,
//			max: vdiskJson.product.max,
//			step: vdiskJson.product.step,
//			slide: function( event, ui ) {
//				$("#createDataDiskSize").val(ui.value);
//			}
//		});		
//		$("#createDataDiskSize").bind("blur",function(){			
//			var value = $("#dataDisk-range-min" ).slider("value");
//			var newValue = $(this).val();			
//			if(/^[1-9]+[0-9]*$/.test(""+newValue) &&  parseInt(newValue)>= vdiskJson.product.min && parseInt(newValue) <= vdiskJson.product.max) {
//				newValue = parseInt(newValue/10) * 10;
//				$(this).val(newValue);
//				$("#dataDisk-range-min" ).slider("value",newValue);
//			} else {
//				$(this).val(value);				
//			}	
//			pm.getFee();
//		});	
//		$("#createDataDiskSize").bind("keydown",function(){
//			$("#dataDiskMsg").empty().html("<span class='text-error'>请输入10的倍数</span>");			
//		});	
//		$( "#createDataDiskSize" ).val($( "#dataDisk-range-min" ).slider( "value" ) );
		// 带宽
//		var min=ipJson.product.min,max=ipJson.product.max,step=ipJson.product.step,value=0;
//		$( "#bandwidth-range-min" ).slider({
//			range: "min",
//			value: value,
//			min: ipJson.product.min,
//			max: ipJson.product.max,
//			step: ipJson.product.step,
//			slide: function( event, ui ) {
//				$("#createBandwidthSize").val(ui.value);
//			}
//		});
//		$("#createBandwidthSize").bind("blur",function(){
//			var value = $("#bandwidth-range-min" ).slider("value");
//			var newValue = $(this).val();
//			if(/^[1-9]+[0-9]*$/.test(""+newValue) &&  parseInt(newValue)>= min && parseInt(newValue) <= max) {
//				$("#bandwidth-range-min" ).slider("value",newValue);
//			} else {
//				$(this).val(value);
//			}
//		});
//		$( "#createBandwidthSize" ).val($( "#bandwidth-range-min" ).slider( "value"));
		
//		$("input[type='radio'][name='networkoption']").click(function(){
//			var value = $(this).val();
//			$("div.networkoption").each(function(i,div){
//				if(!$(div).hasClass("network_" + value)) {
//					$(div).addClass("hide");
//				} else {
//					$(div).removeClass("hide");
//				}
//			});
//				
//		});
	

		
//		$("input[type='radio'][name='loginMode']").click(function(){
//			if($(this).val() == 'password') {
//				$("#login_mode_use_password").removeClass("hide");
//			} else {
//				$("#login_mode_use_password").addClass("hide");
//			}
//		});
	},
	/*vncVM : function(){
		var vmInstance = pm.getInstanceInfoById(pm.selectedInstanceId);
		if(vmInstance && vmInstance.state=='running') {
			pm.service.getConsoleInfo(pm.selectedInstanceId,function(consoleInfo){
				if(consoleInfo && consoleInfo.url) {
					window.showModalDialog(consoleInfo.url,'',"dialogWidth=800px;dialogHeight=600px");
				} else {
					ErrorMgr.showError("无法获取桌面访问地址，请稍后再试！");
				}
			},function(error){
				ErrorMgr.showError("无法访问："+error);
			});
		}
	},*/
	getInstanceInfoById : function(instanceId) {
		var result = null;
		$(pm.instances).each(function(i,instance){
			if(instance.id+"" == instanceId+"") {
				result = instance;
				return false;
			}
		});
		return result;
	},
	getFee : function(){
		if(CommonEnum.offLineBill)return;
		var period = pm.createPeriodInput.getValue();
		//TODO 确定计费接口要传的参数
		var param = pmJson.getPMFee4quick();
		Dcp.biz.apiAsyncRequest("/pm/queryCaculateFeeByPrtyList",param, function(data) {
			if(null!=data&&0 == data.code){
//				var count = pm.createCountInput.getValue();
				var count = 1;
				var fee =  data.data.fee;
				//$("#feeInput").val(count * fee/feeUnit);
				$(".price").empty().html(count * fee/feeUnit);
			}else if(data.code == -1){
				$(".price").empty();
			}
		});
	},

	createPM : function() {	
		$("#tip_Name").empty();
		if(pm.quota - pm.instances.length<=0) {
			ErrorMgr.showError("您申请的物理机数量已经达到了最大物理机配额:" + pm.quota);
			return;
		}
		if(pmJson.oslist.length<1){
			//$("#pool option:selected").text()
			$.growlUI("提示", "该数据中心下暂无可选操作系统,请联系管理员！！！"); 
			return;
		}
		
		com.skyform.service.privateNetService.query({state:'running'},function (subnets){
			var subnetContainer = $("#vm_privatenetwork");
			subnetContainer.empty();
			$("<option value=''>-- 请选择--" + "</option>").appendTo(subnetContainer);
			$(subnets).each(function(i,subnet){
				if('using' == subnet.state||'running'== subnet.state){
					$("<option value='" + subnet.id + "' >" + subnet.name + "</option>").appendTo(subnetContainer);
				}
			});
			
			subnetContainer.unbind('change').bind("change",function(){
				if($(this).val() == '') {
					$("#vm_wizard_ip_setting").show();
					com.skyform.service.EipService.listByStates({"states":"running"},function(eips){
						var privatenetworkContainer = $("#existed_ips");
						privatenetworkContainer.empty();
						$("<option value=''>-- 请选择--" + "</option>").appendTo(privatenetworkContainer);
						$(eips).each(function(i,eip){
							if('running' == eip.state){
								$("<option value='" + eip.id + "'>(" + eip.BAND_WIDTH+"MB)"+ eip.instanceName +"</option>").appendTo(privatenetworkContainer);
							}
						});
					},function(errorMsg){
						ErrorMgr.showError(errorMsg);
					});
				} else {
					$("#vm_wizard_ip_setting").hide();
				}
			});
			subnetContainer.change();
		},function(error){
			ErrorMgr.showError(error);
		});
		if (pm.wizard == null) {
			pm.wizard = new com.skyform.component.Wizard("#wizard-createVM");
			pm.wizard.onLeaveStep = function(from, to) {				
				if(1 == from){/*
					$("#discount").empty();
					var osDes = $(".osList.selected span").text();					
					if((osDes.toLowerCase()).indexOf("win")!=-1){
						pm.isWin = true;
					}
					else pm.isWin = false;
					if(pm.isWin){												
						$(".vm-tab").each(function(index,item){
							var text = $(item).attr("data-value");
							if($.inArray(text,pm.microType) != -1){
								$(item).hide();
							}
						});	
//						$(".cpu-options").each(function(index,item){
//							var text = $(item).attr("data-value");
//							if(text == microCpu){
//								$(item).hide();
//							}
//						});
						$(".memory-options").each(function(index,item){
							var text = $(item).attr("data-value");
							if($.inArray(text,pm.microMem) != -1){
								$(item).hide();
							}
						});
						if($(".vm-tab[data-value='小型B']").length > 0){
							if($(".vm-tab[data-value='小型B']:visible")){
								$(".vm-tab[data-value='小型B']").click();
							}
							
						}
						else {
							$("#diy_tab").click();
							var cpu_option = $("div .cpu-options:visible:first");
							cpu_option.click();
							var memory_option = $("div .memory-options:visible:first");
							memory_option.click();
						
						}
						
						pm.getFee();
					}
					else {
						$(".vm-tab").each(function(index,item){
							var text = $(item).attr("data-value");
							if($.inArray(text,pm.microType) != -1){
								$(item).show();
							}
						});
						$(".memory-options").each(function(index,item){
							var text = $(item).attr("data-value");
							if($.inArray(text,pm.microMem) != -1){
								$(item).show();
							}
						});
						$("#diy_tab").click();
						pm.getFee();
					}*/
				}
				if(2 == from){					
				}
				if(to == 5){
					$("#configForm table span").text("");
					var config = pmJson.getVM4JsonInstance();
					var obj = {};
					obj.name = config.productList[0].instanceName;
					obj.period = config.period;
					var payType = $("#billType .selected").attr("data-value");
					switch(payType){
						case "0" :obj.payType = "包月";break;
						case "3" :obj.payType = "包年";break;
						case "5" :obj.payType = "VIP(月)";break; 
					}
					var mirrorType=$(".mirrorType .selected").attr("mirrorType");
					if(mirrorType=="using" /*|| mirrorType=="all"*/){
						obj.os = $("#ostemplates .osList.selected span").text();
						$(".os_").removeClass("hide");
						//$(".image_").addClass("hide");
					}/*else if(mirrorType=="identify"){
						obj.image = $("#ostemplates .osList.selected span").text();
						$(".image_").removeClass("hide");
						$(".os_").addClass("hide");
					}*/
					//obj.anquanzu = firewallName;
					obj.price = $(".feeInput_div span").eq(0).text();
					obj.cpu = config.productList[0].cpuNum;
					obj.mem = config.productList[0].memorySize;
					//obj.diskSize = $("#createDataDiskSize").val();
					obj.osDiskSize = config.productList[0].osDisk;
					obj.privateNet = $("#vm_privatenetwork option:selected").text();
					if(payType == "3"){
						obj.period = Number(obj.period)/12;
						$("#configForm").find("span[name='period_text']").text("时长（包年）");
					}
					else
						$("#configForm").find("span[name='period_text']").text("时长（包月）");
					$.each(obj,function(key,value){
						$("#configForm").find("span[name='" + key + "']").text(value);
					})
					$("#_jine").text(obj.price);
				}
				
			};
			pm.wizard.onToStep = function(from, to) {				
				if(0 == from){
					//var min = $("div#ostemplates div.selected>span:first").attr("mindisk");
				}
				if(0 < from){
					pm.getFee();								
				}				
			};
			pm.wizard.onFinish = function(from, to) {				
				pm.createPMPost();
			};
		}
		pm.wizard.markSubmitSuccess();
		pm.wizard.reset();
		pm.wizard.render(function(){
		   FireWallCfg.init();
		});
	},
	createPMPost: function(){
		var productId = 0;
		if(pm.curProductId){
			productId = parseInt(pm.curProductId);
		}
		//var allocateflag = "0";
		//查询库存是否足够
		var cpuNum = $("#vm-standard #cpu").html();
		var memorySize = $("#vm-standard #memory").html();
		//var osValue = $("#vm-standard #_osId").html();
		var osValue = $("#ostemplates .osList.selected span").attr("value");
		var osdisksizemin=$("#ostemplates .osList.selected span").attr("osdisksizemin");
		var disksize = $("#vm-standard #osDisk").html();
		var subNetId = $("#vm_privatenetwork option:selected").val();
		var condition={};
		condition.cpuNum=cpuNum;
		condition.mem=memorySize;
		condition.disksize=disksize;
		//condition.os=osValue;
		//console.info(condition);
		//getPhysicalNode
		pm.service.listPhysicalMachines(condition,function(data){
			if(data.count && data.count>0){
				var instanceName = $("#instanceName4pm").val();
				var period = pm.createPeriodInput.getValue();
				var params = {
						"period" : period,
						"count" : 1,
						"productList" : [
							{
								  "productId":productId,
								  "instanceName":instanceName,
								  "cpunumber":cpuNum,
								  "memory":memorySize,
								  "disksize":disksize,
								  "os":osValue,
								  "subNetId":subNetId,
								  "osdisksizemin":osdisksizemin
							}												
						  ]
						};											
				//console.info(params);
				pm.service.runPmInstance(params,function onUpdateSuccess(data){												
					//订单提交成功后校验用户余额是否不足
					var _tradeId = data.tradeId?data.tradeId:data.data.tradeId;
					var _fee = $(".price").html();
					/*var createModal = $("#createModal");
					com.skyform.service.BillService.confirmTradeSubmit(_fee,_tradeId,createModal,function onSuccess(data){
						$.growlUI("提示", "申请已提交，请等待开通！");
						$("#createModal").modal("hide");
						pm.describleVM();
					},function onError(msg){
						$.growlUI("提示", "申请物理机已提交，扣款失败");
						$("#createModal").modal("hide");
					});	*/		
					com.skyform.service.BillService.wizardConfirmTradeSubmit(_fee,_tradeId,pm.wizard, function (data){				
						$.growlUI("提示", "申请已提交，请等待开通！");
						pm.wizard.markSubmitSuccess();
						pm.describleVM();
					},function onError(msg){
						$.growlUI("提示", "申请物理机已提交，扣款失败");
						//wizard.markSubmitError();
						pm.wizard.close();
					});
				},function onUpdateFailed(errorMsg){
					//$("#createModal").modal("hide");
					$.growlUI("错误","创建申请提交失败：" + errorMsg);
					pm.wizard.close();
				});						
			}else{
				//$("#createModal").modal("hide");
				$.growlUI("提示", "很抱歉库存不足");				
				pm.wizard.close();
			}
		},function(error){
			ErrorMgr.showError("无法查询到库存："+error);
			pm.wizard.close();
		})			
	},
	/*getBillTypeList4quick: function() {
		$("#billType4quick").empty();
		
		$.each(CommonEnum.billType, function(index) {
			var bill_type = $("<div  class=\"types-options \" data-value='"+ index + "' style='width:50px'>" + CommonEnum.billType[index] + "</div>");
			bill_type.appendTo($("#billType4quick"));
			bill_type.click(function(){
				if($(this).hasClass("selected"))return;
				$("#billType4quick .types-options").removeClass("selected");
				$(this).addClass("selected");	
				pm.queryProductPrtyInfo(index);
				pm._initSelected();
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
				bill_type.click();
//				bill_type.click();
			}
		});
	},*/
	
	_initQuickVM : function(){
		// 带+-的输入框
//		pm.createCountInput = null;
//		if (pm.createCountInput == null) {
//			var container = $("#vm-standard #createCount").empty();
////			com.skyform.service.Eip.queryEnoughIP(function(enough){
//			var max = 99;
//			pm.createCountInput = new com.skyform.component.RangeInputField(container, {
//				min : 1,
//				defaultValue : 1,
//				max:max,
//				textStyle : "width:137px"
//			}).render();
//			pm.createCountInput.reset();
//		}	
		
		// 带+-的输入框
		pm.createPeriodInput = null;
		if (pm.createPeriodInput == null) {
			var container = $("#vm-standard #period").empty();				
			var max = 12;
			pm.createPeriodInput = new com.skyform.component.RangeInputField(container, {
				min : 1,
				defaultValue : 1,
				max:max,
				textStyle : "width:137px"
			}).render();
			pm.createPeriodInput.reset();
				
		}		
		$(".subFee").bind('mouseup keyup',function(){
			setTimeout('pm.getFee()',5);
		});
	},
	describleVM : function() {
		if(pm.inited) pm.datatable.container.find("tbody").html("<tr ><td colspan='7' style='text-align:center;'><img src='"+CONTEXT_PATH+"/images/loader.gif'/><strong>"+Dict.val("common_retrieving_data_please_wait")+"</strong></td></tr>");		
		
		pm.service.describePmInstances(function(instances){
			$("#load_waiting_tbl").hide();
			pm.instances = instances;
			if(instances && instances.length>0) {
				$("#details").show();
				pm.showInstanceInfo(instances[0]);
			} else {
				$("#details").hide();
			}
			
			pm.renderDataTable(instances);
		}, function(errorMsg){
			$.growlUI("提示", "查询物理机发生错误：" + errorMsg);
		});
	},
	
	getBillTypeList: function() {
		$("#billType").empty();
		$.each(CommonEnum.billType, function(index) {
//			var index =0;
			var cpu_option = $("<div  class=\"types-options \" data-value='"+ index + "' style='width:50px'>" + CommonEnum.billType[index] + "</div>");
			cpu_option.appendTo($("#billType"));
			cpu_option.click(function(){
				if($(this).hasClass("selected"))return;
				$("div.type-options").removeClass("selected");
				$(".options .types-options").removeClass("selected");
				$(this).addClass("selected");					
				pm.queryProductPrtyInfo(index);
				pm.queryOsList();
//				pm.queryBwProductPrtyInfo(index);
//				pm.queryVdiskProductPrtyInfo(index);
				pm._initSelected();
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
			}
		});
	},
	queryOsList:function(){		
		var condition={};
		var rescourePoolName=$("#pool option:selected").attr("value");
		var billType=$("#billType .selected").attr("data-value");
		var mirrortype=$(".mirrorType .selected").attr("mirrorType");
		var portalType = Dcp.biz.getCurrentPortalType();
		condition.portalType=portalType;
		condition.osType="common";
		/*if(mirrortype =="all"){
			var osType=$(".osTypeSelect .selected").attr("osType");
			condition.osType=osType;
			condition.mirrorType="2";
		}else if(mirrortype=="using"){
			condition.mirrorType="1";
		}*/
		condition.mirrorType="1";
		condition.rescourePoolName=rescourePoolName;
		condition.billType=billType;
		//pm.service.getPhysicalOs
		pm.service.getPhysicalOs(condition,function(data){
			if( null != data){	
				pmJson.oslist = data;
			}		
		});
	},
	queryProductPrtyInfo : function(index){		
		com.skyform.service.BillService.queryProductPrtyInfo(index,window.currentInstanceType,function(data){
			if( null != data){	
				pmJson.vmConfig = data.physicalMachineConfig;
			}else{
				pmJson.vmConfig = [];
			}		
		},function(data){
			pmJson.vmConfig = [];
		});
	},	
	// 获取OS模板列表
	getTemplateList : function(postInit) {		
		    //pmJson.trans4OS
		    var templates =  pmJson.trans4OS();
			//console.info(templates);
			serviceOfferingsData = pmJson.trans4ServiceOfferings();
			$("#ostemplates").empty();
			if(null!=templates&&templates.length>0){
				$(templates).each(function(index,item){
						var template = $("<div class='osList '>" + "  <span os='"+item.name
								+"' value=" + item.id + " mindisk="+item.mindisk
								+ " osDiskSizeMin="+item.osDiskSizeMin
								+" class='text-left'><a href='#'>" + item.name + "</a> </span>" + "  </p>" + "</div>");
						template.appendTo($("#ostemplates"));
						template.click(function(){
							$("div.osList").removeClass("selected");
							$(this).addClass("selected");
							//pm.selectTemplate(item);
							var osDes = $(".osList.selected span").text();					
							if((osDes.toLowerCase()).indexOf("win")!=-1){
								pm.isWin = true;
							}
							else pm.isWin = false;
							//var osDisk = $(".osList.selected span").attr("mindisk");
							//$("#vm-diy #osDisk").empty().html(osDisk);							
						});
						if (index == 0) {
							template.click();
						}
				});
				if(postInit) {
					postInit();
				}
			}		
	},
	selectTemplate : function(template) {
		$("div.vm-login[ostype != '"+template.ostypename+"']").hide();
		$("div.vm-login[ostype = '"+template.ostypename+"']").show();
	},
	// 获取计算服务列表
	getServiceOfferings : function(postInit) {
		pm.getQuickTypeList();
		pm.getCpuList();
		cpuarr = pm.getCpuArr();
		//pm.getMemoryList(cpuarr[0]);
		if(postInit) {
			postInit();
		}
		
	},
	getTypes : function(){
		var typeArr = [];
		$(serviceOfferingsData).each(function(index, item) {
			if (item.displaytext != null && -1 == $.inArray(item.displaytext, typeArr)) {
				var vmType = {
					"displaytext" : item.displaytext,
					"pmPrice" : item.pmPrice,
					"productId" : item.productId,
					
					"cpunumber" : item.cpunumber,//cpuNum
					"cpuspeed" : item.cpuspeed,  //cpu速率
					"cpu_cores_num" : item.cpu_cores_num,  //cpu核数
					"memory" :item.memory,	   //内存大小
					"disknum" : item.disknum,  //硬盘个数
					"osDisk" : item.osDisk,  //osDisc 系统盘大小
					"os_id" : item.os_id,   //操作系统id
					"netcard" : item.netcard,  //网卡个数
						
					"os_desc" : item.os_desc				
				}; 
				if(null!=item.discount){
					vmType.discount = item.discount;
				}
				else vmType.discount = "";
				typeArr.push(vmType);
			}
		});
		return typeArr;
	},
	/*selectType : function(type){
		$(serviceOfferingsData).each(function(index, item) {
			if(item.displaytext == type) {
				pm.getMemoryList(item.cpunumber, item.memory);
				$("div.cpu-options[data-value != '"+item.cpunumber+"']").removeClass("selected");
				$("div.cpu-options[data-value = '"+item.cpunumber+"']").addClass("selected");
				$("#cpu").html(item.cpunumber);
				return false;
			}
		});
	},*/
	selectQuickType : function(type){
		$(serviceOfferingsData).each(function(index, item) {
			if(item.displaytext == type) {
				//pm.getMemoryList(item.cpunumber, item.memory);
				$("div.cpu-options[data-value != '"+item.cpunumber+"']").removeClass("selected");
				$("div.cpu-options[data-value = '"+item.cpunumber+"']").addClass("selected");
				$("#vm-standard #cpu").html(item.cpunumber);
				$("#vm-standard #memory").html(item.memory);
				return false;
			}
		});
	},
//	getTypeList : function(){		
//		var types = pm.getTypes();		
//		$("#type-options").empty();
//		$(".vm-ul").empty();
//		var diy_option = $("<div  class=\"types-options type-options vm-type\" data-value=\"DIY\" >自定义</div>");
//		diy_option.appendTo($("#type-options"));		
//		
//		var diy = $("<li class='vm-tab' id='diy_tab' data-value='自定义'><a href='#vm-diy' data-toggle='tab'><strong>自定义</strong></a></li>");
//		diy.appendTo($(".vm-ul"));
//		//自定义tab事件
//		diy.click(function(){
//			$("li.vm-tab").removeClass("active");
//			$(".vmtab").removeClass("active");
//			$("#diy_tab").addClass("active");
//			$("#vm-diy").addClass("active");
//			var osDisk = $(".osList.selected span").attr("mindisk");
//			$("#vm-diy #osDisk").empty().html(osDisk);
//			$("div.type-options").removeClass("selected");
//			$(".vm-type[data-value='DIY']").addClass("selected");
//			$(".cpu-options[data-value=1]").click();
//		});
//		$(types).each(function(index,item){			
//			if("其他配置" == item.displaytext){
//				var type_option = $("<div  class=\"types-options type-options vm-type\" " +
//						"style='display:none' data-value=\""+ item.displaytext + "\" pmPrice=\""+item.pmPrice+"\" productId=\""+item.productId+"\">"
//						+ item.displaytext + "</div>");
//			}
//			else var type_option = $("<div  class=\"types-options type-options vm-type\" " +
//					"data-value=\""+ item.displaytext + "\" pmPrice=\""+item.pmPrice+"\" productId=\""+item.productId+"\">"
//					+ item.displaytext + "</div>");
//			type_option.appendTo($("#type-options"));
//			//标配option事件
//			type_option.click(function(){
//				$("div.type-options").removeClass("selected");
//				$(this).addClass("selected");
//			});
//			if (index == 0) {
//				type_option.click();			
//			}
//			if("其他配置" == item.displaytext){
//				var tab_option = $("<li class='vm-tab' data-value='"+item.displaytext+"' style='display:none'><a href='#vm-standard' data-toggle='tab' >"+item.displaytext+"</a></li>");
//			}
//			else var tab_option = $("<li class='vm-tab' data-value='"+item.displaytext+"'><a href='#vm-standard' data-toggle='tab' >"+item.displaytext+"</a></li>");
//			tab_option.appendTo($(".vm-ul"));
//			//标配tab事件
//			tab_option.click(function(){
//				//$("div.type-options").removeClass("selected");
//				$("li.vm-tab").removeClass("active");
//				$(".vmtab").removeClass("active");
//				$("#vm-standard").addClass("active");
//				pm.selectType(item.displaytext);
//				//$(this).addClass("selected");
//				$(this).addClass("active");
//				$("#vm-standard #osDisk").empty().html(item.osDisk);
//				$("#vm-standard #_os").empty().html(item.os_desc);
//				$("#vm-standard #_osId").empty().html(item.os);
//				//$("#osDiskMsg").empty();
//				$("#discount").empty();
//				if(""!=item.discount&&item.discount.length>0){
//					$("#discount").empty().html(item.discount);
//				}				
//				type_option.click();
//			});	
//		});		
//		diy.click();
//	},
	getQuickTypeList : function(){	
		var types = pm.getTypes();		
		$("#type-options").empty();
		$(".quick-vm-ul").empty();
		if(types.length>0){
			$(types).each(function(index,item){			
				
				if("其他配置" == item.displaytext){
					var tab_option = $("<li class='vm-tab vm-type' data-value='"+item.displaytext+"' style='display:none'><a href='#vm-standard' data-toggle='tab' >"+item.displaytext+"</a></li>");
				}
				else var tab_option = $("<li class='vm-tab vm-type' data-value='"+item.displaytext+"'><a href='#vm-standard' data-toggle='tab' >"+item.displaytext+"</a></li>");
				tab_option.appendTo($(".quick-vm-ul"));
				//标配tab事件
				tab_option.click(function(){
					pm.curProductId = item.productId;

					//$("div.type-options").removeClass("selected");
					$("li.vm-tab").removeClass("active");
					$(".vmtab").removeClass("active");
					$("#vm-standard").addClass("active");
					pm.selectQuickType(item.displaytext);
					$(this).addClass("selected");
					$(this).addClass("active");
					$("#vm-standard #cpu").empty().html(item.cpunumber);
					$("#vm-standard #osDisk").empty().html(item.osDisk);
					/*$("#discount").empty();
					if(""!=item.discount&&item.discount.length>0){
						$("#discount").empty().html(item.discount);
					}*/
				});	
				if (index == 0) {
					tab_option.click();		
					pm.getFee();
				}
			});				
		}
	},
	
	// 获取计算服务cpu数组
	getCpuArr : function() {
		var cpuArr = [];
		$(serviceOfferingsData).each(function(index, item) {
			if (-1 == $.inArray(item.cpunumber, cpuArr)) {
				cpuArr.push(item.cpunumber);
			}
		});
		return cpuArr;
	},
	// 获取计算服务cpu列表
	getCpuList : function() {
		var cpuArr = pm.getCpuArr();
		$("#cpu-options").empty();
		$(cpuArr).each(
		function(index, item) {
			var cpu_option = $("<div  class=\"types-options cpu-options \" data-value='"+ item + "'>" + item + "核</div>");
			cpu_option.appendTo($("#cpu-options"));
			cpu_option.click(function(){
				if($(this).hasClass("selected"))return;
				$("div.type-options").removeClass("selected");
				$(".options .types-options.cpu-options ").removeClass("selected");
				$(this).addClass("selected");
				//pm.getMemoryList(item);				
			});
			if (index == 0) {
				cpu_option.click();
			}
		});
	},
	// 获取计算服务cpu列表4变更
	getCpuListUpgrade : function() {
		var cpuArr = pm.getCpuArr();
		$("#cpu-options-upgrade").empty();
		$(cpuArr).each(
		function(index, item) {
			var cpu_option = $("<div  class=\"types-options cpu-options \" data-value='"+ item + "'>" + item + "核</div>");
			cpu_option.appendTo($("#cpu-options-upgrade"));
			cpu_option.click(function(){
				$("#myModal006change #errorMsg").removeClass().empty();
				if($(this).hasClass("selected"))return;
				$("div.type-options").removeClass("selected");
				$(".options .types-options.cpu-options ").removeClass("selected");
				$(this).addClass("selected");
				pm.getMemoryListUpgrade(item);
			});
			if (index == 0) {
				cpu_option.click();
			}
		});
	},
	// 获取计算服务内存数组
	getMemoryArr : function(cpuNumber) {
		var memoryArr = [];
		$(serviceOfferingsData).each(function(index, item) {
			if (cpuNumber == item.cpunumber) {
				memoryArr.push(item);
			}
		});
		return memoryArr;
	},
	// 获取计算服务内存列表
	/*getMemoryList : function(cpuNumber,mem) {
		var memoryArr = pm.getMemoryArr(cpuNumber);
		$("#memory-options").empty();
		$(memoryArr).each(function(index, item) {
			if (cpuNumber == item.cpunumber) {
				var memory_option = "";
				var memorySize = item.memory;
				if (memorySize >= 1024) {
					memorySize = memorySize / 1024;
				} 
				
				if(cpuNumber==1&&pm.isWin&&(item.memory=="0.5"||item.memory=="1")){
					memory_option = $("<div class=\"types-options memory-options \" data-value=" + item.memory 	+ " style='display:none' >"	+ memorySize+ "GB</div>");
				}
				else {
					memory_option = $("<div class=\"types-options memory-options \" data-value=" + item.memory 	+ "  >"	+ memorySize+ "GB</div>");
				}
				memory_option.appendTo($("#memory-options"));
				memory_option.click(function(){
					$("div.type-options").removeClass("selected");
					$("div.memory-options").removeClass("selected");
					if(pm.isWin&&cpuNumber==1){
						$("div.memory-options[data-value='2']").addClass("selected");
					}
					else $(this).addClass("selected");	
				});
				if((mem && mem == item.memory)) {
					memory_option.addClass("selected");
					$("#memory").html(memorySize);
				} else if(pm.isWin&& index == 0){
					if(memory_option.is(":visible")){
						memory_option.addClass("selected");
						$("#memory").html(memorySize);
					}
				} 
				else if (!pm.isWin&&!mem&& index == 0 ) {
					memory_option.addClass("selected");
				} 
			}
		});
		if(pm.isWin&&cpuNumber==1&&$(".memory-options.selected").length<1){
			$("div.memory-options[data-value='2']").addClass("selected");
		}
		$(".options .types-options.memory-options").click(function() {
			$(".options .types-options.memory-options ").removeClass("selected");
			$(this).addClass("selected");
		});
	},*/
	// 获取计算服务内存列表4变更
	getMemoryListUpgrade : function(cpuNumber,mem) {
		var memoryArr = pm.getMemoryArr(cpuNumber);
		$("#memory-options-upgrade").empty();
		$(memoryArr).each(function(index, item) {
			if (cpuNumber == item.cpunumber) {
				var memory_option = "";
				var memorySize = item.memory;
				if (memorySize >= 1024) {
					memorySize = memorySize / 1024;
				} 

				if(cpuNumber==1&&pm.isWin&&(item.memory=="0.5"||item.memory=="1")){
					memory_option = $("<div class=\"types-options memory-options \" data-value=" + item.memory 	+ " style='display:none' >"	+ memorySize+ "GB</div>");
				} else {
					memory_option = $("<div class=\"types-options memory-options \" data-value=" + item.memory	+ "  >" + memorySize+ "GB</div>");
				}

				memory_option.appendTo($("#memory-options-upgrade"));
				memory_option.click(function(){
					$("#myModal006change #errorMsg").empty();
					$("div.type-options").removeClass("selected");
					$("div.memory-options").removeClass("selected");
					$(this).addClass("selected");
				});
				if((mem && mem == item.memory)) {
					memory_option.addClass("selected");
					$("#memory").html(memorySize);
				} else if(pm.isWin&& index == 0){
					if(memory_option.is(":visible")){
						memory_option.addClass("selected");
						$("#memory").html(memorySize);
					}
				} 
				else if (!pm.isWin&&!mem&& index == 0 ) {
					memory_option.addClass("selected");
				} 
			}
		});
		if(pm.isWin&&cpuNumber==1&&$(".memory-options.selected").length<1){
			$("div.memory-options[data-value='2']").addClass("selected");
		}
		$(".options .types-options.memory-options").click(function() {
			$(".options .types-options.memory-options ").removeClass("selected");
			$(this).addClass("selected");
		});
	},
	// 获取计算服务id
	getServiceOfferingId : function(cpuNumber, memory) {
		var serviceOfferingId = 0;
		$(serviceOfferingsData).each(function(index, item) {
			if (cpuNumber == item.cpunumber && memory == item.memory) {
				serviceOfferingId = item.id;
			}
		});
		return serviceOfferingId;
	},
	
	renderDataTable : function(data) {
		if(pm.inited){
			pm.datatable.updateData(data);
			return;
		}					
		pm.datatable.renderByData(
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
//											text = '<a  href="monitor.jsp?code=monitor&vmId='+columnData.uuid+'&vmName='+encodeURI(encodeURI(columnData.instanceName))+'" >'+columnData.instanceName+'</a>';
											text = columnData.instanceName;
										}
										else text = columnData.instanceName;
						        	   return text;
						           } else if ("state" == columnMetaData.name) {
						              return com.skyform.service.StateService.getState("vm",columnData.state||columnData);
						           } else if ("createDate" == columnMetaData.name) {
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
									}else if ("expireDate" == columnMetaData.name) {
										try {
											var obj = eval('(' + "{Date: new Date("
													+ columnData.expireDate + ")}"
													+ ')');
											var dateValue = obj["Date"];
											text = dateValue
													.format('yyyy-MM-dd hh:mm:ss');
										} catch (e) {

										}
										return text;
									}else if ("descrInfo" == columnMetaData.name) {										
						        	   try {
						        		   var cpuNum = "";
						        		   var mem = "";
						        		   var os = "";
						        		   var netcard = "";
						        		   if(columnData.cpu&&columnData.cpu>0){
						        			   cpuNum = columnData.cpu;
						        		   }
						        		   if(columnData.os&&columnData.os.length>0){
							        			  os = columnData.os; 
							        	   }
						        		   if(columnData.memory&&columnData.memory>0){
						        			  mem = columnData.memory; 
						        		   }
						        		   if(columnData.netcard&&columnData.netcard>0){
						        			   netcard = columnData.netcard; 
						        		   }
											var appendText = "CPU个数:"
													+ cpuNum + "个 操作系统:"
													+ os + " 内存:"
													+ mem
													+ "GB 网卡个数:"
													+netcard+"个";
											text = text + appendText;
										} catch (e) {

										}
									return text;
						           }
								return columnData[columnMetaData.name];
							},
							"afterRowRender" : function(rowIndex, data, tr) {
								tr.attr("instanceId",data.id);
								tr.attr("cpu",data.cpu);
								tr.attr("mem",data.mem);
								tr.attr("os",data.os);
								pm.bindEventForTr(rowIndex, data, tr);
							},
							"afterTableRender" : function() {
								pm.bindEvent();
//								$("#tbody2 tbody").find("tr").css("background-color","");
								var firstRow = $("#tbody2 tbody").find("tr:eq(0)");
								var	instanceId = firstRow.attr("instanceId");
								var instance = pm.getInstanceInfoById(instanceId);
								pm.showInstanceInfo(instance);
								firstRow.css("background-color","#BCBCBC");
								pm.setSelectRowBackgroundColor(firstRow);
								
							}
							
						});
		pm.inited = true;
		pm.datatable.addToobarButton("#toolbar4tbl");
		pm.datatable.enableColumnHideAndShow("right");
	},
	bindEventForTr : function(rowIndex, data, tr) {
		$(tr).attr("state", data.optState || data.state);
		$(tr).attr("name", data.instanceName);
		$(tr).attr("jobState", data.jobState);
		

		$(tr).unbind().mousedown(
			function(e) {
				
				if (3 == e.which) {
					$("#tbody2 input[type='checkbox']").attr("checked", false);
					$("#content_container #checkAll").attr("checked", false);
					tr.find("input[type='checkbox']").attr("checked", true);
					pm.selectedInstanceId = tr.attr("instanceId");
					$("#moreAction").removeClass("disabled");
					document.oncontextmenu = function() {
						return false;
					}
					var screenHeight = $(document).height();
					var top = e.pageY;
					if (e.pageY >= screenHeight / 2) {
						top = e.pageY - $("#contextMenu").height();// 如果鼠标所在位置在屏幕高度中线的下半部分，则弹出框往上弹出
					}
					$("#contextMenu").hide();
					$("#contextMenu").attr(
							"style",
							"display: block; position: absolute; top:"
									+ top + "px; left:" + e.pageX
									+ "px; width: 180px;");
					$("#contextMenu").show();
					e.stopPropagation();
					pm.checkSelected(data);

				}
				pm.showInstanceInfo(data);
				pm.setSelectRowBackgroundColor(tr);
		});
		$(tr).click(function() {
			pm.checkboxClick(tr);
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
//		pm.service.listRelatedInstances(instanceInfo.id,function(data){
//			data = $.parseJSON(data);
//			pm.appendVmRelation(data,instanceInfo);
//			pm.service.listIriRelation(instanceInfo.id,function(data){
//				pm.appendVmRelation(data,instanceInfo);
//			},function(e){
//			});
//		},function(e){
//		});
		$("#opt_logs").empty();
		com.skyform.service.LogService.describeLogsUIInfo(instanceInfo.id);
//		com.skyform.service.LogService.describeLogsInfo(instanceInfo.id,function(logs){	
//			$("#opt_logs").empty();
//			$(logs).each(function(i,v){
//				var desc = "";
//				if(v.description){
//					if(v.description != ""){
//						desc = "("+v.description+")";
//					}						
//				}
//				var _name = "";
//				if(v.subscription_name){
//					_name = v.subscription_name;
//				}
//				$("<li class='detail-item'><span>" + v.createTime+ "  "+v.subscription_name+"  " + v.controle + desc+ "</span></li>").appendTo($("#opt_logs"));
//			});
//		});
		
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
				+"<span>" + pm.switchType(array[i].templateType) +"</span>&nbsp;&nbsp;&nbsp;&nbsp;"
				+"<span>"+array[i].instanceName+"</span>&nbsp;"
				+"<span>"+ipaddress+"</span>&nbsp;&nbsp;&nbsp;&nbsp;"
				+"<span>"+insState+"</span>"
				+"</li>";
		});
		$("#vmRelations").empty().append(dom);
		$("#vmRelations").find("a.bindSecurity").unbind("click").click(function(){
			pm.service.bindSecurityGroupToVm($(this).attr("value"),instanceInfo.id,function (data){
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
			pm.inMenu = true;
		});

		$("#contextMenu").unbind("mouseout").bind('mouseout', function() {
			pm.inMenu = false;
		});
		$("#contextMenu li").unbind("mousedown").bind('mousedown', function(e) {
			$("#contextMenu").hide();
			if (!$(this).hasClass("disabled"))pm.onOptionSelected($(this).attr("action"));
		});
		$("body").unbind('mousedown').bind('mousedown', function() {
			if (!pm.inMenu) {
				$("#contextMenu").hide();
			}
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
			
			pm.checkSelected();
		});
	},
	checkboxClick : function(tr) {
		pm.checkSelected();
	},
	checkSelected : function(selectInstance) {
		var rightClicked = selectInstance?true:false;
		
		var allCheckedBox = $("#tbody2 input[type='checkbox']:checked");
		
		var oneSelected = allCheckedBox.length == 1;
		var hasSelected = allCheckedBox.length > 0;
		
		$(".operation").addClass("disabled");
		
		var state = $(allCheckedBox[0]).parents("tr").attr("state");
		
		var jobState = $(allCheckedBox[0]).parents("tr").attr("jobState");
		
		var allInstanceHasTheSameState = true;
		
		var allInstanceStateCanBeDestroy = true;
		
		$(allCheckedBox).each(function(index,checkbox){
			var _state = $(checkbox).parents("tr").attr("state");
			if(_state != state) {
				allInstanceHasTheSameState = false;
				return false;
			}
		});
		
		$(allCheckedBox).each(function(index,checkbox){
			var _state = $(checkbox).parents("tr").attr("state");
			var _jobState = $(checkbox).parents("tr").attr("jobState");
			if(_state =='deleting' || _state=='opening' || _jobState=='lock'){
				allInstanceStateCanBeDestroy = false;
				return false;
			}
		});
		
		$(".operation").each(function(index,operation){
			var condition = $(operation).attr("condition");
			var action = $(operation).attr("action");
			var enabled = true;
			eval("enabled=("+condition+")");
			if(enabled) {
				$(operation).removeClass("disabled");
				$(operation).unbind("click").click(function(){
					pm.onOptionSelected(action||"");
				});
			} else {
				$(operation).addClass("disabled");
				$(operation).unbind();
			}
		});
		
		
		if(rightClicked) {
			pm.instanceName = selectInstance.instanceName;
			pm.selectedInstanceId = selectInstance.id;	
		} else {
			for ( var i = 0; i < allCheckedBox.length; i++) {
				var currentCheckBox = $(allCheckedBox[i]);
				if (i == 0) {
					pm.instanceName = currentCheckBox.parents("tr").attr("name");
					pm.selectedInstanceId = currentCheckBox.attr("value");
				} else {
					pm.instanceName += "," + currentCheckBox.parents("tr").attr("name");
					pm.selectedInstanceId += "," + currentCheckBox.attr("value");
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
			if ("changeVM" == action) {
				pm.modifyVMName(); // 修改
			} else if ("openVM" == action) { // 启动
				pm.openVM();
			} else if ("closeVM" == action) {
				pm.closeVM(); // 关机
			} else if ("reopenVM" == action) {
				pm.reopenVM(); // 重启
			} else if ("loadVdisk" == action) {
				 
				pm.showRuningEbs();
				$("#myModal002").modal("show"); // 加载硬盘
			} else if ("changeEquipment" == action) {
				pm.modifyVMConfiguration();
			} else if ("createSnapShot" == action) {
				pm.showBackupVMModal();
			} else if ("showSnapShot" == action) {
				pm.showVMSnapshotModal();
			} else if ("destroyVM" == action) {
				pm.destroyVM(); // 销毁
			}
//			else if ("cfgFirewall" == action){
//				pm.cfgFirewall();
//			} 
			else if ("renew" == action) {
				pm.renew();
			} 
		}
	},
	
	showRuningEbs : function(id) {
		
		var params = {
				"id" : id,				
				"ownUserId" : "6",	
				"typesToAttach" : "12",
				"states" : "running",
				"targetOrAttached" : 1
		};
		
		Dcp.biz.apiRequest("/instance/ebs/describeEbsVolumes", params, function(data) {
			if (data.code != "0") {
				$.growlUI("提示", "查询弹性块存储发生错误：" + data.msg); 
			} else {				
				//{title : "用户", name : "ownUserAccount"}
				//pm.attachEbsToTable(data.data);
				if(null != pm.datatable){
					 
					if(pm.initebs){
						//pm.datatable.updateData(data.data);
						return;
					}
					pm.attachEbsToTable(data.data);
					pm.initebs = true;
					//alert(initebs);
					//pm.datatable.updateData(data.data);
				} 
//				else {						 
//					pm.datatable =  new com.skyform.component.DataTable();
//					pm.attachEbsToTable(data.data);
//				}
			}
		},function onError(){
			pm.attachEbsToTable(data.data);
		});	
	},
	
	attachEbsToTable : function(data){
		//{title : "<input type='checkbox' id='checkAll_attach'>", name : "id"},
		pm.datatable.renderByData("#vmToEbstable", { 
			"data" : data,
			"columnDefs" : [
			     {title : "", name : "id"},
			     {title : "ID", name : "id"},
			     {title : "名称", name : "instanceName"}
			],
			"onColumnRender" : function(columnIndex,columnMetaData,columnData) {
				 var text = columnData[''+columnMetaData.name] || "";
				 if(columnIndex ==0) {
					 text = "<div class='switch switch-small' ><input type='checkbox' checked/></div>";
//					 text = '<input type="checkbox" value="'+text+'">';
				 }
				 return text;
			},
			"afterRowRender" : function(rowIndex,data,tr) {
				tr.find(".switch").bootstrapSwitch();
			}
		});		
	},	
	
	modifyVMName : function(id) {
		var oldInstanceName = pm.getCheckedArr().parents("tr").find("td[name='instanceName']").text();
		pm.instanceName = oldInstanceName;
		if (pm.modifyVMNameModal == null) {
			pm.modifyVMNameModal = new com.skyform.component.Modal(
					new Date().getTime(),
					"修改物理机的属性",
					'<div class="modal-body"> <form  class=\"form-horizontal\"> '
					        + '<fieldset>'
						        + '<div class=\"control-group\">'
							        + '<label class=\"control-label\" for=\"input01\">名称:</label>'
									+ '<div class=\"controls\"><input type=\"text\" name=\"instance_name\" id=\"updateName\" onblur=\"pm.test()\" value='+pm.instanceName+' maxlength=\"32\"><font color=\'red\'>*</font>(必填项)<br>'
									+ '</div>'
								+ '</div>'
								//+ '<font size="4">描述:</font><textarea cols="15" rows="2" id="updateComment"></textarea><br> 
							+ '</fieldset>'
					 + '</form></div>',
					{
						buttons : [
								{
									name : "确定",
									onClick : function() {
										var value = $("#updateName")[0].value;
										if (value == null || value == "") {
											alert("请输入修改后的名称");
											return;
										}
//										var updateComment= $("#updateComment")[0].value;										
										if(oldInstanceName != value){
											com.skyform.service.PortalInstanceService.querySameNameExist(window.currentInstanceType,value,function(isExist){
												if(!isExist){
													pm.service.updateNameAndDescription(pm.selectedInstanceId,$("#updateName")[0].value,function onUpdateSuccess(result){
														pm.modifyVMNameModal.hide();
														$.growlUI("提示","修改成功");
														pm.describleVM();
													},function onUpdateFailed(errorMsg){
														pm.modifyVMNameModal.hide();
														$.growlUI("错误","修改失败：" + errorMsg);
													});
												}
												else {
													$.growlUI("提示","该名称已经被使用，请重新输入");
												}
											});	
										}
										else {
											pm.service.updateNameAndDescription(pm.selectedInstanceId,$("#updateName")[0].value,function onUpdateSuccess(result){
												pm.modifyVMNameModal.hide();
												$.growlUI("提示","修改成功");
												pm.describleVM();
											},function onUpdateFailed(errorMsg){
												pm.modifyVMNameModal.hide();
												$.growlUI("错误","修改失败：" + errorMsg);
											});
										}
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
										pm.modifyVMNameModal.hide();
									}
								} ],
						beforeShow : function(){
							$("#updateName").val(pm.instanceName);
						}
					});

		}
		// pm.modifyVMNameModal.setWidth(600).autoAlign();
		pm.modifyVMNameModal.show();
	},
	getCheckedArr : function() {
		return $("#tbody2 tbody input[type='checkbox']:checked");
	},
	modifyVMConfiguration : function(id) {
		// TODO

		if (pm.modifyVMConfigurationModal == null) {
			pm.modifyVMConfigurationModal = new com.skyform.component.Modal(
					new Date().getTime(),
					"更改主机的配置",
					$("script#upgradeCfg").html(),
					{
						buttons : [
								{
									name : "确定",
									onClick : function() {
										var instanceId = pm.selectedInstanceId;
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
										//var instance = pm.getInstanceInfoById(pm.selectedInstanceId);
										var oc = $.trim($("#myModal006change #oldCpu").html());
										var om = $("#myModal006change #oldMem").html();
										if(oc >= cpu && om >= memory) {
											$("#myModal006change #errorMsg").addClass("icon-exclamation-sign text-error");
											$("#myModal006change #errorMsg").empty().html("&nbsp;请选择高于当前的配置，否则不能变更。")
											return;
										}
										com.skyform.service.PortalInstanceService.modprodprty("serviceroffering",instanceId,muprty,function(result){
											$.growlUI("提示","操作成功");
											pm.modifyVMConfigurationModal.hide();
											pm.describleVM();
										},function(error){
											pm.modifyVMConfigurationModal.hide();
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
										pm.modifyVMConfigurationModal.hide();
									}
								} ],
								beforeShow : function(){
									var osDes = pm.getCheckedArr().parents("tr").attr("os");		
									if((osDes.toLowerCase()).indexOf("win")!=-1){
										pm.isWin = true;
									}
									else pm.isWin = false;
									pm.getServiceOfferingId();
									pm.getCpuListUpgrade();
									cpuarr = pm.getCpuArr();
									pm.getMemoryListUpgrade(cpuarr[0]);
									var oldCpu = pm.getCheckedArr().parents("tr").attr("cpu");
									var oldMem = pm.getCheckedArr().parents("tr").attr("mem");
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
							
						}	
					
					});

		};
		pm.modifyVMConfigurationModal.show();
	},
	destroyVM : function(id) {
		var confirmModal = new com.skyform.component.Modal(
				new Date().getTime(),
				"销毁物理机",
				"<h4>您确认要销毁" + "吗?</h4>",
				{
					buttons : [
							{
								name : "确定",
								onClick : function() {
									confirmModal.hide();
									pm.service.destroyPm(pm.selectedInstanceId,function(result){
										$.growlUI("提示", "操作成功");
										com.skyform.service.modifyStatus.modifyAllStatus(pm.selectedInstanceId,"deleting",pm.instances,function(){
									    	pm.renderDataTable(pm.instances);
									    });
										
									},function onError(errorMsg){
										ErrorMgr.showError("销毁物理机失败:" + errorMsg);
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
	closeVM : function(id) {
		var confirmModal = new com.skyform.component.Modal(
				new Date().getTime(), "关闭物理机", "<h4>您确认要关机吗?</h4>", {
					buttons : [
							{
								name : "确定",
								onClick : function() {
									pm.service.stopPm(pm.selectedInstanceId,function(result){
										$.growlUI("提示", "操作成功");
										confirmModal.hide();
										com.skyform.service.modifyStatus.modifyAllStatus(pm.selectedInstanceId,"stopping",pm.instances,function(){
									    	pm.renderDataTable(pm.instances);
									    });
									},function onError(errorMsg){
										confirmModal.hide();
										$.growlUI("错误","关机失败:" + errorMsg);
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
	openVM : function(id) {
		var confirmModal = new com.skyform.component.Modal(
				new Date().getTime(), "开启物理机", "<h4>您确认要开机吗?</h4>", {
					buttons : [
							{
								name : "确定",
								onClick : function() {
									pm.service.startPm(pm.selectedInstanceId,function onStarted(result){
										confirmModal.hide();
										$.growlUI("提示", "操作成功");
										//刷新开启云主机缓存
										com.skyform.service.modifyStatus.modifyAllStatus(pm.selectedInstanceId,"starting",pm.instances,function(){
									    	pm.renderDataTable(pm.instances);
									    });
									},function onFailedToStart(errorMsg){
										confirmModal.hide();
										ErrorMgr.showError("开机失败："+errorMsg);
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
	reopenVM : function(id) {
		var confirmModal = new com.skyform.component.Modal(
				new Date().getTime(), "重启物理机", "<h4>您确认要重启吗?</h4>", {
					buttons : [
							{
								name : "确定",
								onClick : function() {
									pm.service.restartPm(pm.selectedInstanceId,function onRestarted(result){
										confirmModal.hide();
										$.growlUI("提示", "操作成功");
										com.skyform.service.modifyStatus.modifyAllStatus(pm.selectedInstanceId,"resetting",pm.instances,function(){
									    	pm.renderDataTable(pm.instances);
									    });
										//pm.describleVM();
									},function onRestartFailed(errorMsg){
										confirmModal.hide();
										ErrorMgr.showError("重启失败："+errorMsg);
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
	test : function() {
		var value = $("#updateName")[0].value;
//		var commentvalue = $("#updateComment")[0].value;
		if (value == null || value == "") {
			alert("请输入修改后的名称");
		}
		if (value.length > 32) {
			alert("名称不能大于16个字符");
		}
//		if (commentvalue.length > 100) {
//			alert("描述不能大于100个字符");
//		}
	},

	// 显示虚拟硬盘备份MODAL
	showBackupVMModal : function() {
		$("#backupVolumeId").val(pm.selectedInstanceId);
		$("#backupVolumeName").val(pm.instanceName);
		$("#backupModal").modal("show");
	},
	// 虚拟硬盘备份
	backupVolume : function() {
		var params = {
			"instanceInfoId" : pm.selectedInstanceId
			//"comment" : $.trim($("#backupVolumeComment").val())
		};
		Dcp.biz.apiRequest("/instance/cbsVolumn/createSnapShot", params, function(
				data) {
			if (data.code == "0") {
				$.growlUI("提示", "备份虚拟硬盘成功！");
				$("#updateData").click();
			} else {
				$.growlUI("提示", data.msg);
			}
			$("#backupModal").modal("hide");
		});
	},
	// 虚拟硬盘快照管理
	showVMSnapshotModal : function() {
		$("#recoveryVolumeId").val(pm.selectedInstanceId);
		$("#recoveryVolumeName").val(pm.selectedInstanceId);
		pm.renderVolumeUserSnapshotList(pm.selectedInstanceId);
	},
	// 渲染快照列表
	renderVolumeUserSnapshotList : function(volumeId) {
		var params = {
			"vmID" : volumeId
		};
		Dcp.biz.apiRequest("/instance/cbsVolumn/descCbsVolumnOfVM",params,function(data) {
			if (data.code == "0") {
				var snapshotList = data.data;
				var container = $("#volumeSnapshotTable tbody").empty();
				if (snapshotList.length == 0) {
					container.append("<tr><td colspan='4'>此虚拟硬盘无可用快照</td></tr>");
				} else {
					$(snapshotList).each(
						function(i, item) {
							var dom = "";
							dom = $("<tr>"
									+ "<td>"
									+ item.id
									+ "</td>"
									+ "<td>"
									+ (new Date(
											item.createDt)
											.format("yyyy-MM-dd hh:mm:ss"))
									+ "</td>"
									+ "<td>"
									+ item.comment
									+ "</td>"
									+ "<td>"
									+ "<a href='javascript:void(0);' class='icon-refresh' title='恢复'></a>&nbsp;&nbsp;"
									+ "<a href='javascript:void(0);' class='icon-remove' title='删除'></a>"
									+ "</td>"
									+ "</tr>");
							dom.find(
								".icon-refresh")
								.unbind("click")
								.bind("click",function() {
									pm.recoverySnapshot(volumeId,item.id);
								});
							dom.find(".icon-remove").unbind("click").bind("click",
								function() {
									pm.deleteSnapshot(volumeId,item.id);
								});
							container.append(dom);
						});
				}
			$("#snapshotModal").modal("show");
			} else {
				$.growlUI("提示", data.msg);
			}
		});
	},
	// 虚拟硬盘快照恢复
	recoverySnapshot : function(volumeId, userSnapshotId) {
		var container = $("#snapshotModal");
		$(".userSnapshotlistBody", container).addClass("hide");
		$(".userSnapshotlistFooter", container).addClass("hide");
		$(".deleteOrRecoveryUserSnapshotBody", container).find("h4").html(
				"你确认要恢复快照吗？");
		$(".deleteOrRecoveryUserSnapshotBody", container).removeClass("hide");
		$(".deleteOrRecoveryUserSnapshotFooter", container).removeClass("hide");

		// 确认恢复
		$("#btnDeleteOrRecoverySnapshotSave", container).unbind("click").bind(
				"click",
				function() {
					var params = {
						"id" : userSnapshotId
					};
					Dcp.biz.apiRequest(
							"/instance/cbsVolumn/restoreSnapShot/"+userSnapshotId, params,
							function(data) {
								$(".deleteOrRecoveryUserSnapshotBody",
										container).addClass("hide");
								$(".deleteOrRecoveryUserSnapshotFooter",
										container).addClass("hide");
								$(".userSnapshotlistBody", container)
										.removeClass("hide");
								$(".userSnapshotlistFooter", container)
										.removeClass("hide");
								if (data.code == "0") {
									$.growlUI("提示", "恢复快照成功！");
									$("#snapshotModal").modal("hide");
									$("#updateData").click();
								} else {
									$.growlUI("提示", data.msg);
								}
							});
				});

		// 取消恢复
		$("#btnDeleteOrRecoverySnapshotCancel", container).unbind("click")
				.bind(
						"click",
						function() {
							$(".deleteOrRecoveryUserSnapshotBody", container)
									.addClass("hide");
							$(".deleteOrRecoveryUserSnapshotFooter", container)
									.addClass("hide");
							$(".userSnapshotlistBody", container).removeClass(
									"hide");
							$(".userSnapshotlistFooter", container)
									.removeClass("hide");
						});
	},
	// 虚拟硬盘快照删除
	deleteSnapshot : function(volumeId, userSnapshotId) {
		var container = $("#snapshotModal");
		$(".userSnapshotlistBody", container).addClass("hide");
		$(".userSnapshotlistFooter", container).addClass("hide");
		$(".deleteOrRecoveryUserSnapshotBody", container).find("h4").html("你确认要删除快照吗？");
		$(".deleteOrRecoveryUserSnapshotBody", container).removeClass("hide");
		$(".deleteOrRecoveryUserSnapshotFooter", container).removeClass("hide");

		// 确认删除
		$("#btnDeleteOrRecoverySnapshotSave", container).unbind("click").bind(
				"click",
				function() {
					var params = {
						"id" : userSnapshotId
					};
					Dcp.biz.apiRequest("/instance/cbsVolumn/deleteVolumeSnapshot/"+userSnapshotId,
							params, function(data) {
								$(".deleteOrRecoveryUserSnapshotBody",
										container).addClass("hide");
								$(".deleteOrRecoveryUserSnapshotFooter",
										container).addClass("hide");
								$(".userSnapshotlistBody", container)
										.removeClass("hide");
								$(".userSnapshotlistFooter", container)
										.removeClass("hide");
								if (data.code == "0") {
									$.growlUI("提示", "删除快照成功！");
									$("#snapshotModal").modal("hide");
									$("#updateData").click();
								} else {
									$.growlUI("提示", data.msg);
								}
							});
				});

		// 取消删除
		$("#btnDeleteOrRecoverySnapshotCancel", container).unbind("click")
				.bind(
						"click",
						function() {
							$(".deleteOrRecoveryUserSnapshotBody", container)
									.addClass("hide");
							$(".deleteOrRecoveryUserSnapshotFooter", container)
									.addClass("hide");
							$(".userSnapshotlistBody", container).removeClass(
									"hide");
							$(".userSnapshotlistFooter", container)
									.removeClass("hide");
						});
	},
	//停止物理机，刷新防火墙
	refreshFirewall : function(vmId){
		AutoUpdater.stop();
		AutoUpdater.parentid = vmId;
		window.currentInstanceType='firewall';
		AutoUpdater.start();
	},
	renew : function(){
		var pmId = pm.getCheckedArr().parents("tr").attr("instanceId");
		if(pm.renewModal){
			
		}else{
			pm.renewModal = new com.skyform.component.Renew(pmId,{
				buttons : [
							{
								name : "保存",
								onClick : function(){
									var period = pm.renewModal.getPeriod().getValue();
									$("#renewModal").modal("hide");	
									var _modal = $("#renewModal");
									com.skyform.service.renewService.renew(pm.getCheckedArr().parents("tr").attr("instanceId"),period,function onSuccess(data){
										//订单提交成功后校验用户余额是否不足
										var _tradeId = data.tradeId;
										var _fee = $("#feeInput_renew").text();
										com.skyform.service.BillService.confirmTradeSubmit(_fee,_tradeId,_modal,function onSuccess(data){
											$.growlUI("提示", "续订申请提交成功,扣款成功, 请耐心等待..."); 
											// refresh
//											pm.updateDataTable();									
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
									pm.renewModal.hide();
								}
							}
						]
					});
			}
			pm.renewModal.getFee_renew(pmId);
			pm.renewModal.show();		
			$(".subFee_renew").bind('mouseup keyup',function(){
				setTimeout('pm.renewModal.getFee_renew('+pmId+')',100);
			});
	}
	
};
