//当前刷新实例的类型为虚拟机
window.currentInstanceType='vm';

$(function() {
	CommonEnum.init();
	VM.init();	
});

var RuleState4Yaxin = {0:"处理中",9:"成功"};
var feeUnit = 1000;

var CommonEnum = {
		protocol:[],
		loopType:[],
		billType:'',
		//billType:{0:"包月",3:"包年"},
		offLineBill:false, 
		//billType:{0:"包月",1:"计时",2:"包天"},
		//serviceType:{"vm":1001,"vdisk":1002,"subnet":1003,"route":1004,"lb":1005,"ip":1006,"obs":1012},
		//运营产品定义
		//1001;虚拟机 //1002;弹性块存储 //1003;负载均衡 //1006;公网带宽 //1007;云专享 //1008;路由器 //1009;私有网络
		//1010;安全策略组//1012;对象存储 //1013;文件存储
		serviceType:{"vm":1001,"vdisk":1002,"lb":1003,"ip":1006,"route":1008,"subnet":1009,"obs":1012,"nas":1013},

		
		init : function(){
//			CommonEnum.initProtocol(function(data){
//				CommonEnum.protocol = $.parseJSON(data);
//			});
			
//			CommonEnum.initLoopType(function(data){
//				CommonEnum.loopType = $.parseJSON(data);
//			});
			CommonEnum.billType = com.skyform.service.BillService.getBillTypeOut();
			

		}

	}


var VM = {
	microType : ["微型","小型A"],
	microCpu : 1,
	microMem : ["0.5","1"],
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
	VMState : [],
	serviceOfferingsData : [],
	countFiled : null,
	defaultNetwork : null,
	_generateContent_tmp : null,
	quota : 99,
	
	
	service : com.skyform.service.vmService,
	firewallService : com.skyform.service.FirewallService,
	PortalInstanceService : com.skyform.service.PortalInstanceService,
		
	init : function() {
		VM.inMenu = false; // 用于判断鼠标当前是否在下拉操作框中即$("#contextMenu")和$("#dropdown-menu")
		VM.selectedInstanceId = null;
		VM.instanceName = null;
		VM.instances = [],
		VM.VMState = {
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
		};


		
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
				
		VM.getBillTypeList();	
		VM._initWizard();
		VM.getFee();
	},
	_initSelected :function(){
		// 获取系统模板之后，可创建虚拟机
		VM.getTemplateList(function postInit(){				
			VM.getServiceOfferings(function(){
				$("a#createVM").unbind().click(VM.createVM);
				$(".create-another-server").click(function() {
					VM.wizard.reset();
				});

				$(".im-done").click(function() {
					VM.wizard.close();
				});
			});
		});
	},
	
	_initWizard : function(){		
		
		/*VM.service.listNetworks(function(networks){
			if(networks && networks.length>0) {
				VM.defaultNetwork = networks[0];
			}
		});*/		
		
		// 带+-的输入框
		VM.createCountInput = null;
		if (VM.createCountInput == null) {
			var container = $("#createCount").empty();
//			com.skyform.service.Eip.queryEnoughIP(function(enough){
			var max = 99;
			VM.createCountInput = new com.skyform.component.RangeInputField(container, {
				min : 1,
				defaultValue : 1,
				max:max,
				textStyle : "width:137px"
			}).render();
			VM.createCountInput.reset();
		}	
		
		// 带+-的输入框
		VM.createPeriodInput = null;
		if (VM.createPeriodInput == null) {
			var container = $("#period").empty();				
			var max = 12;
			VM.createPeriodInput = new com.skyform.component.RangeInputField(container, {
				min : 1,
				defaultValue : 1,
				max:max,
				textStyle : "width:137px"
			}).render();
			VM.createPeriodInput.reset();
				
		}		
		$(".subFee").bind('mouseup keyup',function(){
			setTimeout('VM.getFee()',5);
		});
		
		$("input[type='radio'][name='networkoption']").bind('mouseup',function(){
			setTimeout('VM.getFee()',5);
		});
		
		$("#btnBackupSave").unbind("click").bind("click", function() {
			VM.backupVolume();
		});		
		
		// 系统盘
		$( "#rootDisk-range-min" ).slider({
			range: "min",
			value: value,
			min: 1,
			max: 200,
			step: 10,
			slide: function( event, ui ) {
				$("#createRootDiskSize").val(ui.value);
			}
		});		
		$("#createRootDiskSize").bind("blur",function(){
			var value = $("#rootDisk-range-min" ).slider("value");
			var newValue = $("div#ostemplates div.selected>span:first").attr("mindisk");
			if(/^[1-9]+[0-9]*$/.test(""+newValue) &&  parseInt(newValue)>= min && parseInt(newValue) <= max) {
				$("#rootDisk-range-min" ).slider("value",newValue);
			} else {
				$(this).val(value);
			}
		});
		$( "#createRootDiskSize" ).val($( "#RootDisk-range-min" ).slider( "value" ) );
		// 数据盘
		$( "#dataDisk-range-min" ).slider({
			range: "min",
			value: value,
			min: vdiskJson.product.min,
			max: vdiskJson.product.max,
			step: vdiskJson.product.step,
			slide: function( event, ui ) {
				$("#createDataDiskSize").val(ui.value);
			}
		});		
		$("#createDataDiskSize").bind("blur",function(){			
			var value = $("#dataDisk-range-min" ).slider("value");
			var newValue = $(this).val();			
			if(/^[1-9]+[0-9]*$/.test(""+newValue) &&  parseInt(newValue)>= vdiskJson.product.min && parseInt(newValue) <= vdiskJson.product.max) {
				newValue = parseInt(newValue/10) * 10;
				$(this).val(newValue);
				$("#dataDisk-range-min" ).slider("value",newValue);
			} else {
				$(this).val(value);				
			}	
			VM.getFee();
		});	
		$("#createDataDiskSize").bind("keydown",function(){
			$("#dataDiskMsg").empty().html("<span class='text-error'>请输入10的倍数</span>");			
		});	
		$( "#createDataDiskSize" ).val($( "#dataDisk-range-min" ).slider( "value" ) );
		// 带宽
		var min=ipJson.product.min,max=ipJson.product.max,step=ipJson.product.step,value=0;
		$( "#bandwidth-range-min" ).slider({
			range: "min",
			value: value,
			min: 0,//ipJson.product.min,
			max: ipJson.product.max,
			step: ipJson.product.step,
			slide: function( event, ui ) {
				$("#createBandwidthSize").val(ui.value);
			}
		});
		$("#createBandwidthSize").bind("blur",function(){
			var value = $("#bandwidth-range-min" ).slider("value");
			var newValue = $(this).val();
			if(/^[1-9]+[0-9]*$/.test(""+newValue) &&  parseInt(newValue)>= min && parseInt(newValue) <= max) {
				$("#bandwidth-range-min" ).slider("value",newValue);
			} else {
				$(this).val(value);
			}
		});
		$( "#createBandwidthSize" ).val($( "#bandwidth-range-min" ).slider( "value"));
		
		$("input[type='radio'][name='networkoption']").click(function(){
			var value = $(this).val();
			$("div.networkoption").each(function(i,div){
				if(!$(div).hasClass("network_" + value)) {
					$(div).addClass("hide");
				} else {
					$(div).removeClass("hide");
				}
			});
				
		});
	

		
		$("input[type='radio'][name='loginMode']").click(function(){
			if($(this).val() == 'password') {
				$("#login_mode_use_password").removeClass("hide");
			} else {
				$("#login_mode_use_password").addClass("hide");
			}
		});
	},
	vncVM : function(){},
	getInstanceInfoById : function(instanceId) {},
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

	createVM : function() {},
	

	describleVM : function() {},
	
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
				VM.queryBwProductPrtyInfo(index);
				VM.queryVdiskProductPrtyInfo(index);
				VM._initSelected();
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
	createVMPost : function(wizard) {},	
	
	
	
	queryProductPrtyInfo : function(index){		
		com.skyform.service.BillService.queryProductPrtyInfoOut(index,window.currentInstanceType,function(data){
			if( null != data){	
//				data = {"oslist":[{"osDiskSizeMin":20,"value":"5","desc":"CentOS6.3 64位"},{"osDiskSizeMin":20,"value":"1","desc":"CentOS6.4 64位"},{"osDiskSizeMin":20,"value":"6","desc":"CentOS6.5 64位"},{"osDiskSizeMin":50,"value":"2","desc":"Windows Server 2003 企业版 32位"},{"osDiskSizeMin":50,"value":"3","desc":"Windows Server 2008 R2 标准版 64位"},{"osDiskSizeMin":50,"value":"19","desc":"Windows Server 2008 R2 数据中心版 64位"},{"osDiskSizeMin":50,"value":"20","desc":"Windows Server 2012 R2 数据中心版 64位"},{"osDiskSizeMin":50,"value":"21","desc":"Windows Server 2012 R2 标准版 64位"},{"osDiskSizeMin":50,"value":"22","desc":"Ubuntu14.04 Server CN 64位"}],"vmConfig":[{"value":"1","memory":[{"value":"0.5","vmPrice":"1","discount":"","name":"其他配置","desc":"512M","osDisk":"50","productId":""},{"value":"1","vmPrice":"1","discount":"","name":"其他配置","desc":"1G","osDisk":"80","productId":""},{"value":"2","vmPrice":"1","discount":"","name":"其他配置","desc":"2G","osDisk":"80","productId":""},{"name":"其他配置","desc":"4G","value":"4","discount":"","productId":""}],"desc":"1核"},{"value":"2","memory":[{"name":"其他配置","desc":"1G","value":"1","discount":"","productId":""},{"value":"2","vmPrice":"1","discount":"","name":"其他配置","desc":"2G","osDisk":"150","productId":""},{"value":"4","vmPrice":"1","discount":"","name":"其他配置","desc":"4G","osDisk":"150","productId":""},{"name":"其他配置","desc":"8G","value":"8","discount":"","productId":""}],"desc":"2核"},{"value":"4","memory":[{"name":"其他配置","desc":"2G","value":"2","discount":"","productId":""},{"value":"4","vmPrice":"1","discount":"","name":"其他配置","desc":"4G","osDisk":"220","productId":""},{"value":"8","vmPrice":"1","discount":"","name":"其他配置","desc":"8G","osDisk":"220","productId":""},{"name":"其他配置","desc":"12G","value":"12","discount":"","productId":""},{"name":"其他配置","desc":"16G","value":"16","discount":"","productId":""}],"desc":"4核"},{"value":"8","memory":[{"name":"其他配置","desc":"4G","value":"4","discount":"","productId":""},{"value":"8","vmPrice":"1","discount":"","name":"其他配置","desc":"8G","osDisk":"330","productId":""},{"name":"其他配置","desc":"12G","value":"12","discount":"","productId":""},{"value":"16","vmPrice":"1","discount":"","name":"其他配置","desc":"16G","osDisk":"330","productId":""},{"name":"其他配置","desc":"24G","value":"24","discount":"","productId":""},{"name":"其他配置","desc":"32G","value":"32","discount":"","productId":""}],"desc":"8核"},{"value":"12","memory":[{"name":"其他配置","desc":"32G","value":"32","discount":"","productId":""}],"desc":"12核"}],"productId":201}
				vmJson.oslist = data.oslist;
				vmJson.vmConfig = data.vmConfig;
				vmJson.productId = data.productId;
			}		
		});
	},
	queryBwProductPrtyInfo : function(index){
		com.skyform.service.BillService.queryProductPrtyInfoOut(index,"ip",function(data){
			if( null != data){
				ipJson.product.max = data.brandWidth.max;
				ipJson.product.min = data.brandWidth.min;
				ipJson.product.step = data.brandWidth.step;
				ipJson.product.unit = data.brandWidth.unit;
				ipJson.product.productId = data.productId;
			}
			$("#bwUnit").empty().html(ipJson.product.unit);			
		});
	},
	
	queryVdiskProductPrtyInfo : function(index){
		com.skyform.service.BillService.queryProductPrtyInfoOut(index,"vdisk",function(data){
			if( null != data){
				//vdiskJson.product.default = data.dataDisk.default;
				vdiskJson.product.max = data.dataDisk.max;
				vdiskJson.product.min = data.dataDisk.min;
				vdiskJson.product.step = data.dataDisk.step;
				vdiskJson.product.unit = data.dataDisk.unit;
				vdiskJson.product.productId = data.productId;
			}
			$("#dataDiskUnit").empty().html(vdiskJson.product.unit);			
		});
	},	
	
	// 获取OS模板列表
	getTemplateList : function(postInit) {			
			var templates =  vmJson.trans4OS();
			serviceOfferingsData = vmJson.trans4ServiceOfferings();
			$("#ostemplates").empty();
			if(null!=templates&&templates.length>0){
				$(templates).each(function(index,item){
					//if(item.name.indexOf("2008")==-1){//屏蔽模板名称中含有2008的模板
//						var template = $("<div class='osList '>" + "  <span os='"+item.name+"' value=" + item.id + " mindisk="+item.mindisk+" class='text-left'><a href='#'>" + item.name + "</a> </span>" + "  </p>" + "</div>");
						var template = $("<option class='osList'  os='"+item.name+"' value=" + item.id + " mindisk="+item.mindisk+" ><a href='#'>" + item.name + "</a></option>");

						template.appendTo($("#ostemplates"));
						template.click(function(){
							$("option.osList").removeClass("selected");
							$(this).addClass("selected");
							VM.selectTemplate(item);
							var osDes = $(".osList.selected").text();					
							if((osDes.toLowerCase()).indexOf("win")!=-1){
								VM.isWin = true;
								if(VM.isWin){												
									$(".vm-tab").each(function(index,item){
										var text = $(item).attr("data-value");
										if($.inArray(text,VM.microType) != -1){
											$(item).hide();
										}
									});	
//									$(".cpu-options").each(function(index,item){
//										var text = $(item).attr("data-value");
//										if(text == microCpu){
//											$(item).hide();
//										}
//									});
									$(".memory-options").each(function(index,item){
										var text = $(item).attr("data-value");
										if($.inArray(text,VM.microMem) != -1){
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
									
									VM.getFee();
								}
								else {
									$(".vm-tab").each(function(index,item){
										var text = $(item).attr("data-value");
										if($.inArray(text,VM.microType) != -1){
											$(item).show();
										}
									});
									$(".memory-options").each(function(index,item){
										var text = $(item).attr("data-value");
										if($.inArray(text,VM.microMem) != -1){
											$(item).show();
										}
									});
									$("#diy_tab").click();
									VM.getFee();
								}
							}
							else VM.isWin = false;
							var osDisk = $(".osList.selected").attr("mindisk");
							$("#vm-diy #osDisk").empty().html(osDisk);							
						});
						if (index == 0) {
							template.click();
						}
					//}
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
		VM.getTypeList();
		VM.getCpuList();
		cpuarr = VM.getCpuArr();
		VM.getMemoryList(cpuarr[0]);
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
					"vmPrice" : item.vmPrice,
					"productId" : item.productId,
					"osDisk" : item.osDisk
				} 
				if(null!=item.discount){
					vmType.discount = item.discount;
				}
				else vmType.discount = "";
				typeArr.push(vmType);
			}
		});
		return typeArr;
	},
	selectType : function(type){
		$(serviceOfferingsData).each(function(index, item) {
			if(item.displaytext == type) {
				VM.getMemoryList(item.cpunumber, item.memory);
				$("div.cpu-options[data-value != '"+item.cpunumber+"']").removeClass("selected");
				$("div.cpu-options[data-value = '"+item.cpunumber+"']").addClass("selected");
				$("#cpu").html(item.cpunumber);
				return false;
			}
		});
	},
	getTypeList : function(){		
		var types = VM.getTypes();		
		$("#type-options").empty();
		$(".vm-ul").empty();
		var diy_option = $("<div  class=\"types-options type-options vm-type \" data-value=\"DIY\" >自定义</div>");
		diy_option.appendTo($("#type-options"));		
		
		var diy = $("<li class='vm-tab ' id='diy_tab' data-value='自定义'><a href='#vm-diy' data-toggle='tab'><strong>自定义</strong></a></li>");
		diy.appendTo($(".vm-ul"));
		//自定义tab事件
		diy.click(function(){
			$("li.vm-tab").removeClass("active");
			$(".vmtab").removeClass("active");
			$("#diy_tab").addClass("active");
			$("#vm-diy").addClass("active");
			var osDisk = $(".osList.selected").attr("mindisk");
			$("#vm-diy #osDisk").empty().html(osDisk);
			$("div.type-options").removeClass("selected");
			$(".vm-type[data-value='DIY']").addClass("selected");
			$(".cpu-options[data-value=1]").click();
		});
		$(types).each(function(index,item){			
//			if("其他配置" == item.displaytext){
//				var type_option = $("<div  class=\"types-options type-options vm-type\" " +
//						"style='display:none' data-value=\""+ item.displaytext + "\" vmPrice=\""+item.vmPrice+"\" productId=\""+item.productId+"\">"
//						+ item.displaytext + "</div>");
//			}
//			else var type_option = $("<div  class=\"types-options type-options vm-type\" " +
//					"data-value=\""+ item.displaytext + "\" vmPrice=\""+item.vmPrice+"\" productId=\""+item.productId+"\">"
//					+ item.displaytext + "</div>");
//			type_option.appendTo($("#type-options"));
			//标配option事件
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
			//标配tab事件
//			tab_option.click(function(){
//				//$("div.type-options").removeClass("selected");
//				$("li.vm-tab").removeClass("active");
//				$(".vmtab").removeClass("active");
//				$("#vm-standard").addClass("active");
//				VM.selectType(item.displaytext);
//				//$(this).addClass("selected");
//				$(this).addClass("active");
//				$("#vm-standard #osDisk").empty().html(item.osDisk);
//				//$("#osDiskMsg").empty();
//				$("#discount").empty();
//				if(""!=item.discount&&item.discount.length>0){
//					$("#discount").empty().html(item.discount);
//				}				
//				type_option.click();
//			});	
		});		
		diy.click();
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
		var cpuArr = VM.getCpuArr();
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
				VM.getMemoryList(item);				
			});
			if (index == 0) {
				cpu_option.click();
			}
		});
	},
	// 获取计算服务cpu列表4变更
	getCpuListUpgrade : function() {
		var cpuArr = VM.getCpuArr();
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
				VM.getMemoryListUpgrade(item);
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
	getMemoryList : function(cpuNumber,mem) {
		var memoryArr = VM.getMemoryArr(cpuNumber);
		$("#memory-options").empty();
		$(memoryArr).each(function(index, item) {
			if (cpuNumber == item.cpunumber) {
				var memory_option = "";
				var memorySize = item.memory;
				if (memorySize >= 1024) {
					memorySize = memorySize / 1024;
				} 
				
				if(cpuNumber==1&&VM.isWin&&(item.memory=="0.5"||item.memory=="1")){
					memory_option = $("<div class=\"types-options memory-options \" data-value=" + item.memory 	+ " style='display:none' >"	+ memorySize+ "GB</div>");
				}
				else {
					memory_option = $("<div class=\"types-options memory-options \" data-value=" + item.memory 	+ "  >"	+ memorySize+ "GB</div>");
				}
				memory_option.appendTo($("#memory-options"));
				memory_option.click(function(){
					$("div.type-options").removeClass("selected");
					$("div.memory-options").removeClass("selected");
					if(VM.isWin&&cpuNumber==1){
						$("div.memory-options[data-value='2']").addClass("selected");
					}
					else $(this).addClass("selected");	
//					$(this).addClass("selected");	
				});
				if((mem && mem == item.memory)) {
					memory_option.addClass("selected");
					$("#memory").html(memorySize);
				} else if(VM.isWin&& index == 0){
					if(memory_option.is(":visible")){
						memory_option.addClass("selected");
						$("#memory").html(memorySize);
					}
				} 
				else if (!VM.isWin&&!mem&& index == 0 ) {
					memory_option.addClass("selected");
				} 
			}
		});
		if(VM.isWin&&cpuNumber==1&&$(".memory-options.selected").length<1){
			$("div.memory-options[data-value='2']").addClass("selected");
		}
//		$(".options .types-options.memory-options").click();
		$(".options .types-options.memory-options").click(function() {
			$(".options .types-options.memory-options ").removeClass("selected");
			$(this).addClass("selected");
		});
	},
	// 获取计算服务内存列表4变更
	getMemoryListUpgrade : function(cpuNumber,mem) {
		var memoryArr = VM.getMemoryArr(cpuNumber);
		$("#memory-options-upgrade").empty();
		$(memoryArr).each(function(index, item) {
			if (cpuNumber == item.cpunumber) {
				var memory_option = "";
				var memorySize = item.memory;
				if (memorySize >= 1024) {
					memorySize = memorySize / 1024;
				} 

				if(cpuNumber==1&&VM.isWin&&(item.memory=="0.5"||item.memory=="1")){
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
				} else if(VM.isWin&& index == 0){
					if(memory_option.is(":visible")){
						memory_option.addClass("selected");
						$("#memory").html(memorySize);
					}
				} 
				else if (!VM.isWin&&!mem&& index == 0 ) {
					memory_option.addClass("selected");
				} 
			}
		});
		if(VM.isWin&&cpuNumber==1&&$(".memory-options.selected").length<1){
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
	
	renderDataTable : function(data) {},
	bindEventForTr : function(rowIndex, data, tr) {
		$(tr).attr("state", data.optState || data.state);
		$(tr).attr("name", data.instanceName);
		$(tr).attr("jobState", data.jobState);
		

		$(tr).unbind().mousedown();
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
	appendVmRelation : function(array,instanceInfo) {},
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
		} else {
			for ( var i = 0; i < allCheckedBox.length; i++) {
				var currentCheckBox = $(allCheckedBox[i]);
				if (i == 0) {
					VM.instanceName = currentCheckBox.parents("tr").attr("name");
					VM.selectedInstanceId = currentCheckBox.attr("value");
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
	onOptionSelected : function(action) {},
	
	showRuningEbs : function(id) {},
	
	attachEbsToTable : function(data){},	
	
	modifyVMName : function(id) {},
	getCheckedArr : function() {
		return $("#tbody2 tbody input[type='checkbox']:checked");
	},
	modifyVMConfiguration : function(id) {},
	destroyVM : function(id) {},
	closeVM : function(id) {},
	openVM : function(id) {},
	reopenVM : function(id) {},
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
	showBackupVMModal : function() {},
	// 虚拟硬盘备份
	backupVolume : function() {},
	// 虚拟硬盘快照管理
	showVMSnapshotModal : function() {
		$("#recoveryVolumeId").val(VM.selectedInstanceId);
		$("#recoveryVolumeName").val(VM.selectedInstanceId);
		VM.renderVolumeUserSnapshotList(VM.selectedInstanceId);
	},
	// 渲染快照列表
	renderVolumeUserSnapshotList : function(volumeId) {},
	// 虚拟硬盘快照恢复
	recoverySnapshot : function(volumeId, userSnapshotId) {},
	// 虚拟硬盘快照删除
	deleteSnapshot : function(volumeId, userSnapshotId) {},
	//配置防火墙规则弹出方法
	cfgFirewall : function(){},
	//停止虚拟机，刷新防火墙

	renew : function(){}
	
};
