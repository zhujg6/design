var CommonEnum = {
		protocol:[],
		loopType:[],
		billType:'',
		billType:{0:"包月",3:"包年"},
		offLineBill:false, 
		//运营产品定义
		serviceType:{"vm":1001,"vdisk":1002,"lb":1003,"ip":1006,"route":1008,"subnet":1009,"obs":1012,"nas":1013}
	};
//当前刷新实例的类型为虚拟机
window.currentInstanceType='vm';


var RuleState4Yaxin = {0:"处理中",9:"成功"};
var feeUnit = 1000;
function validateQuota(){
	var result = {
		status : true
	};
//	var instance = vmJson4Soft.getVM4JsonInstance();
//	VM4Soft.service.callApi = com.skyform.service.callSyncApi;
//	VM4Soft.service.ensureResourceEnough(instance, function(data){
//		VM4Soft.service.callApi = com.skyform.service.callApi;
//	},function(error){
//		result.status = false;
//		result.msg = error;
//		VM4Soft.service.callApi = com.skyform.service.callApi;
//	});
	return result;
}


var VM4Soft = {
	microType : ["微型","小型A"],
	microCpu : 1,
	microMem : ["0.5","1"],
	isWin : false,	
	inited : false,
	initebs : false,
	wizard : null,
	instanceName : null,
	selectedInstanceId : null,
	inMenu : null,
	datatable : new com.skyform.component.DataTable(),
	serviceOfferingsData : [],
	countFiled : null,
	defaultNetwork : null,
	_generateContent_tmp : null,
	quota : 99,
	add2NetTable : null,
	removeFromNetTable : null,
	service : com.skyform.service.vmService,
	firewallService : com.skyform.service.FirewallService,
	PortalInstanceService : com.skyform.service.PortalInstanceService,
	currProductId : 0,
	
	init : function(productId) {
		VM4Soft.currProductId = productId;
		VM4Soft.inMenu = false; // 用于判断鼠标当前是否在下拉操作框中即$("#contextMenu")和$("#dropdown-menu")
		VM4Soft.selectedInstanceId = null;
		VM4Soft.instanceName = null;
		VM4Soft.instances = [],
		VM4Soft._initWizard();		
		VM4Soft.getBillTypeList();
		
		VM4Soft.getProductDetail();
		$("#btnSubcribeSoft").unbind("click").bind("click", function() {	
			VM4Soft.createVMPost();
		});			
	},
//	创建虚拟机
	createVMPost : function(wizard) {
		var instance = vmJson4Soft.getVM4JsonInstance();		
		com.skyform.service.shopproorderService.appVmSubscribe(instance, function onCreated(instance){
			//订单提交成功后校验用户余额是否不足
			if(instance.tradeId)var _tradeId = instance.tradeId;
			else var _tradeId = instance.data.tradeId;
			var _fee = $(".price").html();			
			com.skyform.service.BillService.confirmTradeSubmit4soft(_fee,_tradeId,null, function onSuccess(data){				
				$.growlUI("提示", "申请已提交，请等待开通！");
			},function onError(msg){
				$.growlUI("提示", "申请已提交，扣款失败");
//				wizard.markSubmitError();
			});
			
		},function onError(msg){
			$.growlUI("提示", "申请提交失败：" + msg);
		});
	},	
	getProductDetail : function(){
		var data1 = {
		    "code": 0,
		    "responses": [
		        {
		            "provider": null,
		            "version": "0",
		            "productId": 101,
		            "price": null,
		            "productDesc": "独立虚拟主机",
		            "productAttr": {
		                "id": 1,
		                "service": "11",
		                "logo": null,
		                "seqId": 10,
		                "support": "1",
		                "sellerId": "1",
		                "isNew": "\u0000",
		                "isHot": "\u0000"
		            },
		            "productAccList": [
		                {
		                    "productId": "101",
		                    "accId": "1",
		                    "accName": "文档",
		                    "accUrl": "d:/123/file"
		                }
		            ],
		            "productDependsList": [
		                {
		                    "fromProductId": "10",
		                    "toProductId": "10"
		                }
		            ],
		            "seoId": 10,
		            "productName": "虚拟主机",
		            "logo": null,
		            "os": null
		        }
		    ],
		    "responseName": "productResponse"
		};		
		com.skyform.service.shopprodetailService.getProductDetail(VM4Soft.currProductId,function onSuccess(data0){
			var data = data0;
			$("#productLogo").attr("src",Config.imageUrl+data[0].logo);
			$("#productName").text(data[0].productName || ""); 
			$("#provider").text(data[0].provider || "");
			var subdesc = commonUtils.subStr4view(data[0].productDetail, 300, "...");
			$("#subProductDesc").text(subdesc);
			$("#version").text(data[0].version || "");
			$("#softSupport").text(data[0].productAttr.support || "");			
		},function onError(msg){
			
		});
	},
	
	_initSelected :function(softwareId,softType){
		// 获取系统模板之后，可创建虚拟机
		VM4Soft.getTemplateList(function postInit(){	
			VM4Soft.getServiceOfferings(function(){
				VM4Soft.createVM();
				$(".create-another-server").click(function() {
					VM4Soft.wizard.reset();
				});
				$(".im-done").click(function() {
					VM4Soft.wizard.close();
				});
			},softType);
		},softwareId);	
//		VM4Soft.getImageList();
	},
	
	_initWizard : function(){		
		/*VM4Soft.service.listNetworks(function(networks){
			if(networks && networks.length>0) {
				VM4Soft.defaultNetwork = networks[0];
			}
		});*/		
		
		// 带+-的输入框
		VM4Soft.createCountInput = null;
		if (VM4Soft.createCountInput == null) {
			var container = $("#createCount").empty();
//			com.skyform.service.Eip.queryEnoughIP(function(enough){
			var max = 99;
			VM4Soft.createCountInput = new com.skyform.component.RangeInputField(container, {
				min : 1,
				defaultValue : 1,
				max:max,
				textStyle : "width:137px"
			}).render();
			VM4Soft.createCountInput.reset();
		}	
		
		// 带+-的输入框
		VM4Soft.createPeriodInput = null;
		if (VM4Soft.createPeriodInput == null) {
			var container = $("#period").empty();				
			var max = 12;
			VM4Soft.createPeriodInput = new com.skyform.component.RangeInputField(container, {
				min : 1,
				defaultValue : 1,
				max:max,
				textStyle : "width:90px"
			}).render();
			VM4Soft.createPeriodInput.reset();
				
		}		
		$(".subFee").bind('mouseup keyup',function(){
			setTimeout('VM4Soft.getFee()',5);
		});
		$("input[type='radio'][name='networkoption']").bind('mouseup',function(){
			setTimeout('VM4Soft.getFee()',5);
		});	
		// 带宽
		var min=ipJson.product.min,max=ipJson.product.max,step=ipJson.product.step,value=0;
		$( "#bandwidth-range-min" ).slider({
			range: "min",
			value: value,
			min: ipJson.product.min,
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
	getFee : function(){
		if(CommonEnum.offLineBill)return;
		var period = VM4Soft.createPeriodInput.getValue();		
		var param = vmJson4Soft.getVMFeeInstance();
		
		Dcp.biz.apiAsyncRequest4Soft("/pm/queryCaculateFeeByPrtyList",param, function(data) {
			if(null!=data&&0 == data.code){
				var count = VM4Soft.createCountInput.getValue()
				var fee =  data.data.fee;
				//$("#feeInput").val(count * fee/feeUnit);
				$(".price").empty().html(count * fee/feeUnit);
			}
		});
	},
	getFee4month : function(){
		if(CommonEnum.offLineBill)return;
//		var period = VM4Soft.createPeriodInput.getValue();		
		var param = vmJson4Soft.getVMFeeInstance4month();
		
		Dcp.biz.apiAsyncRequest4Soft("/pm/queryCaculateFeeByPrtyList",param, function(data) {
			console.log(data);
			if(null!=data&&0 == data.code){
				var count = VM4Soft.createCountInput.getValue();
				var fee =  data.data.fee;
				//$("#feeInput").val(count * fee/feeUnit);
				$(".pricem").empty().html(count * fee/feeUnit);
			}
		});
	},	
	createVM : function() {	
//		if(VM4Soft.quota - VM4Soft.instances.length<=0) {
//			ErrorMgr.showError("您申请的虚拟机数量已经达到了最大虚拟机配额:" + VM4Soft.quota);
//			return;
//		}
		
		var value = $("input[type='radio'][name='networkoption']:checked").val();
			$("div.networkoption").each(function(i,div){
				if(!$(div).hasClass("network_" + value)) {
					$(div).addClass("hide");
				} else {
					$(div).removeClass("hide");
				}
			});		
		
		com.skyform.service.privateNetService.query({state:'running'},function (subnets){
			var subnetContainer = $("#vm_privatenetwork");
			subnetContainer.empty();
			$("<option value=''>-- 默认网络--" + "</option>").appendTo(subnetContainer);
			$(subnets).each(function(i,subnet){
				if('using' == subnet.state||'running'== subnet.state){
					$("<option value='" + subnet.id + "' >" + subnet.name + "</option>").appendTo(subnetContainer);
				}
			});
			
			subnetContainer.unbind('change').bind("change",function(){
				if($(this).val() == '') {
					$("#vm_wizard_ip_setting").show();
//					com.skyform.service.EipService.listIdleIps(function(eips){
					com.skyform.service.EipService.listByStates({"states":"running"},function(eips){
						var privatenetworkContainer = $("#existed_ips");
						privatenetworkContainer.empty();
						$("<option value=''>-- 请选择--" + "</option>").appendTo(privatenetworkContainer);
						$(eips).each(function(i,eip){
							if('running' == eip.state){
//								$("<option value='" + eip.id + "' eipId='"+eip.eInstanceId+"'>(" + eip.storageSize+"MB)" + eip.eInstanceId + "</option>").appendTo(privatenetworkContainer);
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
//		if (VM4Soft.wizard == null) {
//			VM4Soft.wizard = new com.skyform.component.Wizard("#wizard-createVM");
//			VM4Soft.wizard.onLeaveStep = function(from, to) {				
//				if(1 == from){
//					$("#discount").empty();
//					var osDes = $(".osList.selected span").text();					
//					if((osDes.toLowerCase()).indexOf("win")!=-1){
//						VM4Soft.isWin = true;
//					}
//					else VM4Soft.isWin = false;
//					if(VM4Soft.isWin){												
//						$(".vm-tab").each(function(index,item){
//							var text = $(item).attr("data-value");
//							if($.inArray(text,VM4Soft.microType) != -1){
//								$(item).hide();
//							}
//						});	
////						$(".cpu-options").each(function(index,item){
////							var text = $(item).attr("data-value");
////							if(text == microCpu){
////								$(item).hide();
////							}
////						});
//						$(".memory-options").each(function(index,item){
//							var text = $(item).attr("data-value");
//							if($.inArray(text,VM4Soft.microMem) != -1){
//								$(item).hide();
//							}
//						});
//						if($(".vm-tab[data-value='小型B']").length > 0){
//							if($(".vm-tab[data-value='小型B']:visible")){
//								$(".vm-tab[data-value='小型B']").click();
//							}
//							
//						}
//						else {
//							$("#diy_tab").click();
//							var cpu_option = $("div .cpu-options:visible:first");
//							cpu_option.click();
//							var memory_option = $("div .memory-options:visible:first");
//							memory_option.click();
//						
//						}
//						
//						VM4Soft.getFee();
//					}
//					else {
//						$(".vm-tab").each(function(index,item){
//							var text = $(item).attr("data-value");
//							if($.inArray(text,VM4Soft.microType) != -1){
//								$(item).show();
//							}
//						});
//						$(".memory-options").each(function(index,item){
//							var text = $(item).attr("data-value");
//							if($.inArray(text,VM4Soft.microMem) != -1){
//								$(item).show();
//							}
//						});
//						$("#diy_tab").click();
//						VM4Soft.getFee();
//					}
//				}
//				if(2 == from){					
//					com.skyform.service.Eip.queryEnoughIP(function(enough){
//						if(enough -  1 < 0) {
//							$("input[type='radio'][name='networkoption'][value='createNew']").attr("disabled","disabled");
//							$("#createNewMsg").empty().append("(互联网接入数量余额:" + enough+",无法创建)")
//						}
//					});
//				}		
//			};
//			VM4Soft.wizard.onToStep = function(from, to) {				
//				if(0 == from){
//					var min = $("div#ostemplates div.selected>span:first").attr("mindisk");
//				}
//				if(0 < from){
//					VM4Soft.getFee();								
//				}				
//			};
//			VM4Soft.wizard.onFinish = function(from, to) {				
//				VM4Soft.createVMPost(VM4Soft.wizard);
//			};
//		}
//		VM4Soft.wizard.markSubmitSuccess();
//		VM4Soft.wizard.reset();
//		VM4Soft.wizard.render(function(){
			/*if (VM4Soft._generateContent_tmp)
			{
				FireWallCfg.reset();
				FireWallCfg._generateContent = VM4Soft._generateContent_tmp;
			}*/
		FireWallCfg.init();
//		});
	},	
	getBillTypeList: function() {
		$("#billType").empty();
		CommonEnum.billType = 0;
		var index = 0;
//		$.each(CommonEnum.billType, function(index) {

			var cpu_option = $("<div  class=\"types-options \" data-value='"+ index + "' style='width:50px'>" + CommonEnum.billType[index] + "</div>");
			cpu_option.click(function(){					
				VM4Soft.queryProductPrtyInfo(index);
				VM4Soft.queryBwProductPrtyInfo(index);
				VM4Soft.queryVdiskProductPrtyInfo(index);
				//VM4Soft._initSelected();				
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
//		});
	},	
	queryProductPrtyInfo : function(index){		 //queryProductPrtyInfo
		com.skyform.service.shopprodetailService.getPmMuPrtyConfigInfoForSoftwareByProdId(VM4Soft.currProductId,function(data){
			if( null != data){				
				vmJson4Soft.softwareList = data.softwareList;  //oslist
				vmJson4Soft.vmConfig = data.vmConfig;
				vmJson4Soft.productId = data.productId;
				//软件版本
				var softwares = vmJson4Soft.trans4Software();
				VM4Soft.getSoftVersion(softwares);
			}		
		});
	},
	queryBwProductPrtyInfo : function(index){
		com.skyform.service.BillService.queryProductPrtyInfo(index,"ip",function(data){
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
//		com.skyform.service.BillService.queryProductPrtyInfo(index,"vdisk",function(data){
//			if( null != data){
				//vdiskJson.product.default = data.dataDisk.default;
//				vdiskJson.product.max = data.dataDisk.max;
//				vdiskJson.product.min = data.dataDisk.min;
//				vdiskJson.product.step = data.dataDisk.step;
//				vdiskJson.product.unit = data.dataDisk.unit;
//				vdiskJson.product.productId = data.productId;
//			}
//			$("#dataDiskUnit").empty().html(vdiskJson.product.unit);			
//		});
	},	
	
	// 获取OS模板列表
	getTemplateList : function(postInit,softwareId,softType) {
			var active = true;
			var templates =  vmJson4Soft.trans4OS(softwareId);
			var pool = $("#resourcePool").val();
			serviceOfferingsData = vmJson4Soft.trans4ServiceOfferingsByPool(pool);   //CommonEnum.currentPool
			$("#ostemplates").empty();			
			if(null!=templates&&templates.length>0){
				$(templates).each(function(index,item){
					$("#osname").text(item.name);
					$("#osId").val(item.id);				
					//if(item.name.indexOf("2008")==-1){//屏蔽模板名称中含有2008的模板
						var template = $("<div class='osList '>" + "  <span os='"+item.name+"' value=" + item.id + " mindisk="+item.mindisk+" class='text-left'><a href='#'>" + item.name + "</a> </span>" + "  </p>" + "</div>");
						template.appendTo($("#ostemplates"));
						template.click(function(){								
							$("div.osList").removeClass("selected");
							$(this).addClass("selected");
							VM4Soft.selectTemplate(item);
							var osDes = $(".osList.selected span").text();					
							if((osDes.toLowerCase()).indexOf("win")!=-1){
								VM4Soft.isWin = true;
							}
							else VM4Soft.isWin = false;
							var osDisk = $(".osList.selected span").attr("mindisk");
							$("#vm-diy #osDisk").empty().html(osDisk);							
						});						
						if (index == 0) {
							active = $("a[href='#osTab']").parent().hasClass("active");
							if(active){
								template.click();
							}							
						}
					//}
							
				});
				if(postInit) {
					postInit();					
				}
			}		
	},
	getSoftVersion : function(softs){
		$(".soft-version").empty();
		if(softs!=null && softs.length>0){
			$(softs).each(function(_index,_item){
				var tab_option = $("<option class='version-option' soft-type='"+_item.type+"' value='"+_item.softwareId+"' data-value='"+_item.softwareId+"'>"+_item.desc+"</option>");
				tab_option.appendTo($(".soft-version"));				
				tab_option.click(function(){
					$(".version-option").removeClass("active");
					//$(this).addClass("selected");
					$(this).addClass("active");					
					$("table.softtype").each(function(i,table){
						if(!$(table).hasClass("type"+_item.type)){
							$(table).attr("style","display:none;");
						}else{
							$(table).attr("style","");
						}
					});
					VM4Soft._initSelected(_item.softwareId,_item.type);	
				});				
				if (_index == 0) {
					tab_option.click();		
					tab_option.attr("selected","true");					
				}
			});
		}
	},

	// 获取镜像模板列表
	getImageList : function(postInit) {	
		var active = true;
		VM4Soft.service.listImagetemplates(function(templates){
			//templates = [{id:"1",mindisk:150,name:"win2008",ostypename:"win2008"}];
			$("#imagetemplates").empty();
			if(null!=templates&&templates.length>0){
				$(templates).each(function(index,item){
						var text = "镜像："+item.imageName+"；云主机："+item.vmName+"；系统："+item.osName;					
						var template = $("<div class='osList '>" + "  <span os='"+item.osName+"' value='" + item.osId + "' mindisk='"+item.osDisk+"' imageTemplateId='"+item.imageTemplateId+"' class='text-left'><a href='#'>" + text + "</a> </span>" + "  </p>" + "</div>");
						template.appendTo($("#imagetemplates"));
						template.click(function(){							
							$("div.osList").removeClass("selected");
							$(this).addClass("selected");
							VM4Soft.selectTemplate(item);
							var osDes = $(".osList.selected span").text();
							var osDisk = $(".osList.selected span").attr("mindisk");
							$("#vm-diy #osDisk").empty().html(osDisk);							
						});
						if (index == 0) {
							active = $("a[href='#imageTab']").parent().hasClass("active");
							if(active){
								template.click();
							}							
						}
				});
				if(postInit) {
					postInit();
				}
			}
			
		});		
	},
	selectTemplate : function(template) {
		$("div.vm-login[ostype != '"+template.ostypename+"']").hide();
		$("div.vm-login[ostype = '"+template.ostypename+"']").show();
	},
	// 获取计算服务列表
	getServiceOfferings : function(postInit,softType) {
		//软件版本
		VM4Soft.getTypeList(softType);
		VM4Soft.getCpuList();
		cpuarr = VM4Soft.getCpuArr();
//		VM4Soft.getMemoryList(cpuarr[0]);
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
					"osDisk" : item.osDisk,
					"vmPriceName" : item.vmPriceName
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
//				VM4Soft.getMemoryList(item.cpunumber, item.memory);
				$("div.cpu-options[data-value != '"+item.cpunumber+"']").removeClass("selected");
				$("div.cpu-options[data-value = '"+item.cpunumber+"']").addClass("selected");
				$("#cpu").html(item.cpunumber);
				$("#memory").html(item.memory);
				return false;
			}
		});
	},
	getTypeList : function(softType){	
		var types = VM4Soft.getTypes();	
		$("#type-options").empty();
		$(".vm-ul").empty();
		var diy_option = $("<div  class=\"types-options type-options vm-type\" data-value=\"DIY\" >其他</div>");
		diy_option.appendTo($("#type-options"));		
		
		var diy = $("<li class='vm-tab' id='diy_tab' data-value='其他'><a href='#vm-diy' data-toggle='tab'><strong>其他</strong></a></li>");
		diy.appendTo($(".vm-ul"));
		//自定义tab事件
		diy.click(function(){
			$("li.vm-tab").removeClass("active");
			$(".vmtab").removeClass("active");
			$("#diy_tab").addClass("active");
			$("#vm-diy").addClass("active");
			var osDisk = $(".osList.selected span").attr("mindisk");
			$("#vm-diy #osDisk").empty().html(osDisk);
			$("div.type-options").removeClass("selected");
			$(".vm-type[data-value='DIY']").addClass("selected");
			$(".cpu-options[data-value=1]").click();
		});
		$(types).each(function(index,item){		
			if("其他配置" == item.displaytext){
				var type_option = $("<div  class=\"types-options type-options vm-type\" " +
						"style='display:none' data-value=\""+ item.displaytext + "\" vmPrice=\""+item.vmPrice+"\" productId=\""+item.productId+"\">"
						+ item.displaytext + "</div>");
			}
			else var type_option = $("<div  class=\"types-options type-options vm-type\" " +
					"data-value=\""+ item.displaytext + "\" vmPrice=\""+item.vmPrice+"\" productId=\""+item.productId+"\">"
					+ item.displaytext + "</div>");
			type_option.appendTo($("#type-options"));
			//标配option事件
			type_option.click(function(){
				$("div.type-options").removeClass("selected");
				$(this).addClass("selected");
			});
			if (index == 0) {
				type_option.click();			
			}

			if("其他配置" == item.displaytext){
				var tab_option = $("<option class='vm-tab' data-value='"+item.displaytext+"' style='display:none'><a href='#vm-standard' data-toggle='tab' >"+item.displaytext+"</a></option>");
			}
			else var tab_option = $("<option class='vm-tab' data-value='"+item.displaytext+"'><a href='#vm-standard' data-toggle='tab' >"+item.displaytext+"</a></option>");
			tab_option.appendTo($(".vm-ul"));
			//标配tab事件
			tab_option.click(function(){
//				基础软件：1
//				业务软件:2
//				服务软件：3
//				if(softType == 1){
					//$("div.type-options").removeClass("selected");
					$("li.vm-tab").removeClass("active");
					$(".vmtab").removeClass("active");
					$("#vm-standard").addClass("active");
					VM4Soft.selectType(item.displaytext);
					//$(this).addClass("selected");
					$(this).addClass("active");
					$("#osDisk").empty().html(item.osDisk);
					$("#vmPrice").val(item.vmPrice);
					$("#vmPriceName").val(item.vmPriceName);				
//					var osDisk = $(".osList.selected span").attr("mindisk");
//					$("#vm-standard #osDisk").empty().html(osDisk);
					//$("#osDiskMsg").empty();
					$("#discount").empty();
					if(""!=item.discount&&item.discount.length>0){
						$("#discount").empty().html(item.discount);
					}								
//					
//				}else if(softType == 2){
//					
//				}else if(softType == 3){
//					
//				}
//				type_option.click();
				VM4Soft.getFee();
				//每个月的价格
				VM4Soft.getFee4month();
			});	
			if (index == 0) {
				tab_option.click();		
				tab_option.attr("selected","true");				
			}
		});		
		diy.click();
	},	
	// 获取计算服务cpu数组
	getCpuArr : function() {
		var cpuArr = [];
		$(serviceOfferingsData).each(function(index, item) {
			if("其他配置" == item.displaytext){
				if (-1 == $.inArray(item.cpunumber, cpuArr)) {
					cpuArr.push(item.cpunumber);
				}
			}			
		});
		return cpuArr;
	},
	getCpuArrAll : function() {
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
		var cpuArr = VM4Soft.getCpuArr();
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
//				VM4Soft.getMemoryList(item);				
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
			if("其他配置" == item.displaytext){
				if (cpuNumber == item.cpunumber) {
					memoryArr.push(item);
				}
			}			
		});
		return memoryArr;
	},
	
	getMemoryArrAll : function(cpuNumber) {
		var memoryArr = [];
		var filter = [];
		$(serviceOfferingsData).each(function(index, item) {
			if (cpuNumber == item.cpunumber) {
				if (-1 == $.inArray(item.memory, filter)) {
					memoryArr.push(item);
					filter.push(item.memory);
				}		
			}
		});
		return memoryArr;
	},
	
	
	
	
	// 获取计算服务内存列表
	getMemoryList : function(cpuNumber,mem) {
		var memoryArr = VM4Soft.getMemoryArr(cpuNumber);
		$("#memory-options").empty();
		$(memoryArr).each(function(index, item) {
			if (cpuNumber == item.cpunumber) {
				var memory_option = "";
				var memorySize = item.memory;
				if (memorySize >= 1024) {
					memorySize = memorySize / 1024;
				} 
				
				if(cpuNumber==1&&VM4Soft.isWin&&(item.memory=="0.5"||item.memory=="1")){
					memory_option = $("<div class=\"types-options memory-options \" data-value=" + item.memory 	+ " style='display:none' >"	+ memorySize+ "GB</div>");
				}
				else {
					memory_option = $("<div class=\"types-options memory-options \" data-value=" + item.memory 	+ "  >"	+ memorySize+ "GB</div>");
				}
				memory_option.appendTo($("#memory-options"));
				memory_option.click(function(){
					$("div.type-options").removeClass("selected");
					$("div.memory-options").removeClass("selected");
					if(VM4Soft.isWin&&cpuNumber==1){
						$("div.memory-options[data-value='2']").addClass("selected");
					}
					else $(this).addClass("selected");	
//					$(this).addClass("selected");	
				});
				if((mem && mem == item.memory)) {
					memory_option.addClass("selected");
					$("#memory").html(memorySize);
				} else if(VM4Soft.isWin&& index == 0){
//					if(memory_option.is(":visible")){
//						memory_option.addClass("selected");						
//					}
					memory_option.addClass("selected");	
					$("#memory").html(mem);
				} 
				else if (!VM4Soft.isWin&& index == 0 ) {
					memory_option.addClass("selected");	
					$("#memory").empty().html(mem);
				} 
			}
		});
		$("#memory").empty().html(mem);
		if(VM4Soft.isWin&&cpuNumber==1&&$(".memory-options.selected").length<1){
			$("div.memory-options[data-value='2']").addClass("selected");
		}
//		$(".options .types-options.memory-options").click();
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
	getCheckedArr : function() {
		return $("#tbody2 tbody input[type='checkbox']:checked");
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
	//点击添加到私有网络按钮
	queryPrivateNets : function(){
		var allCheckedBox = $("#tbody2 input[type='checkbox']:checked");		
		var instanceId = $(allCheckedBox[0]).parents("tr").attr("instanceId");
		VM4Soft.service.getPrivateNets(instanceId,"unbind",function onSuccess(data){	
			$("#add2netModal").on("shown",function(){
				if(VM4Soft.add2NetTable != null){
					VM4Soft.add2NetTable.updateData(data);
				} else {
					VM4Soft.add2NetTable =  new com.skyform.component.DataTable();
					VM4Soft.renderAdd2NetTable(data);
				}				
			});
			$("#add2netModal").modal("show");	    	
	    },function onError(msg){
	      ErrorMgr.showError(msg);
//	      $.growlUI("提示", "查询可用私网发生错误：" + msg); 
	    });	
	},
	renderAdd2NetTable : function(data) {
//		{"msg":"success","data":[{"expireDate":1391914952000,"id":67837058,"ipSegments":"192.168.1.2-192.168.1.254","name":"tttt_67837058","routeName":"route2_67827015","ipGateway":"192.168.1.1","state":"using","createDate":1410925486000}],"code":0}
		 VM4Soft.add2NetTable.renderByData("#add2netTable", {
				"data" : data,
				"pageSize": 5,
				"columnDefs" : [
				     {title : "", name : "id"},
				     {title : "私网名称", name : "name"},
				     {title : "网关", name : "ipGateway"}
				],
				"onColumnRender" : function(columnIndex,columnMetaData,columnData) {
					 var text = columnData[''+columnMetaData.name] || "";
					 if(columnIndex ==0) {
						 text = "<input type='radio' name='id' value="+text+">";
					 }
					 if (columnMetaData.name == "createDate") {
						 text = new Date(text).format("yyyy-MM-dd hh:mm:ss");
					 }
					 return text;
				},
				"afterRowRender" : function(index,data,tr){
					if(index == 0) {
						$(tr).find("input[type='radio']").attr("checked", "checked");
					}
				}					
			});
//		 VM4Soft.add2NetTable.addToobarButton("#add2NetToolbar");
	},
	//点击添加到私有网络按钮
	queryBindPrivateNets : function(){
		var allCheckedBox = $("#tbody2 input[type='checkbox']:checked");		
		var instanceId = $(allCheckedBox[0]).parents("tr").attr("instanceId");
		
		VM4Soft.service.getPrivateNets(instanceId,"bind",function onSuccess(data){	
			$("#removeFromNetModal").on("shown",function(){
				if(VM4Soft.removeFromNetTable != null){
					VM4Soft.removeFromNetTable.updateData(data);
				} else {
					VM4Soft.removeFromNetTable =  new com.skyform.component.DataTable();
					VM4Soft.renderRemoveFromNetTable(data);
				}				
			});
			$("#removeFromNetModal").modal("show");	    	
	    },function onError(msg){
	      ErrorMgr.showError(msg);
//	      $.growlUI("提示", "查询可用私网发生错误：" + msg); 
	    });	
	},

	renderRemoveFromNetTable : function(data) {
//		{"msg":"success","data":[{"expireDate":1391914952000,"id":67837058,"ipSegments":"192.168.1.2-192.168.1.254","name":"tttt_67837058","routeName":"route2_67827015","ipGateway":"192.168.1.1","state":"using","createDate":1410925486000}],"code":0}
		 VM4Soft.removeFromNetTable.renderByData("#removeFromNetTable", {
				"data" : data,
				"pageSize": 5,
				"columnDefs" : [
				     {title : "", name : "id"},
				     {title : "私网名称", name : "name"},
				     {title : "网关", name : "ipGateway"}
				],
				"onColumnRender" : function(columnIndex,columnMetaData,columnData) {
					 var text = columnData[''+columnMetaData.name] || "";
					 if(columnIndex ==0) {
						 text = "<input type='radio' name='id' value=' "+text+" '>";
					 }
					 if (columnMetaData.name == "createDate") {
						 text = new Date(text).format("yyyy-MM-dd hh:mm:ss");
					 }
					 return text;
				},
				"afterRowRender" : function(index,data,tr){
					if(index == 0) {
						$(tr).find("input[type='radio']").attr("checked", "checked");
					}
				}					
			});
//		 VM4Soft.removeFromNetTable.addToobarButton("#add2NetToolbar");
	}	
};