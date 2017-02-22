var feeUnit = 1000;
var VM4quick = {	
		serviceOfferingsData4quick : [],
		curProductId : 0,
		init : function(){		
			if(!CommonEnum.offLineBill){
				$(".feeInput_div").show();
			}
			VM4quick._initQuickVM();
			VM4quick.getBillTypeList();
			
		},
		_initQuickVM : function(){			
			// 带+-的输入框
			VM4quick.createPeriodInput4quick = null;
			if (VM4quick.createPeriodInput4quick == null) {
				var container = $("#period4quick").empty();				
				var max = 12;
				VM4quick.createPeriodInput4quick = new com.skyform.component.RangeInputField(container, {
					min : 1,
					defaultValue : 1,
					max:max,
					textStyle : "width:137px"
				}).render();
				VM4quick.createPeriodInput4quick.reset();					
			}					
	
			$(".subFee").bind('mouseup keyup',function(){
				setTimeout('VM4quick.getFee4quick()',5);
			});
		},
		getBillTypeList: function() {
			$("#billType4quick").empty();
			$.each(CommonEnum.billType, function(index) {
				var bill_type = $("<div  class=\"types-options \" data-value='"+ index + "' style='width:50px'>" + CommonEnum.billType[index] + "</div>");
				bill_type.appendTo($("#billType4quick"));
				bill_type.click(function(){
					if($(this).hasClass("selected"))return;
					$("#billType4quick .types-options").removeClass("selected");
					$(this).addClass("selected");	
					VM4quick.queryProductPrtyInfo(index);
					VM4quick._initSelected();
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
//					bill_type.click();
				}
			});
		},
		queryProductPrtyInfo : function(index){		
//			com.skyform.service.BillService.queryProductPrtyInfo(index,"vm",function(data){
			com.skyform.service.BillService.queryProductPrtyInfoOut(index,"vm",function(data){
				if( null != data){	
//					data = {"oslist":[{"osDiskSizeMin":20,"value":"5","desc":"CentOS6.3 64位"},{"osDiskSizeMin":20,"value":"1","desc":"CentOS6.4 64位"},{"osDiskSizeMin":20,"value":"6","desc":"CentOS6.5 64位"},{"osDiskSizeMin":50,"value":"2","desc":"Windows Server 2003 企业版 32位"},{"osDiskSizeMin":50,"value":"3","desc":"Windows Server 2008 R2 标准版 64位"},{"osDiskSizeMin":50,"value":"19","desc":"Windows Server 2008 R2 数据中心版 64位"},{"osDiskSizeMin":50,"value":"20","desc":"Windows Server 2012 R2 数据中心版 64位"},{"osDiskSizeMin":50,"value":"21","desc":"Windows Server 2012 R2 标准版 64位"},{"osDiskSizeMin":50,"value":"22","desc":"Ubuntu14.04 Server CN 64位"}],"vmConfig":[{"value":"1","memory":[{"value":"0.5","vmPrice":"1","discount":"","name":"其他配置","desc":"512M","osDisk":"50","productId":""},{"value":"1","vmPrice":"1","discount":"","name":"其他配置","desc":"1G","osDisk":"80","productId":""},{"value":"2","vmPrice":"1","discount":"","name":"其他配置","desc":"2G","osDisk":"80","productId":""},{"name":"其他配置","desc":"4G","value":"4","discount":"","productId":""}],"desc":"1核"},{"value":"2","memory":[{"name":"其他配置","desc":"1G","value":"1","discount":"","productId":""},{"value":"2","vmPrice":"1","discount":"","name":"其他配置","desc":"2G","osDisk":"150","productId":""},{"value":"4","vmPrice":"1","discount":"","name":"其他配置","desc":"4G","osDisk":"150","productId":""},{"name":"其他配置","desc":"8G","value":"8","discount":"","productId":""}],"desc":"2核"},{"value":"4","memory":[{"name":"其他配置","desc":"2G","value":"2","discount":"","productId":""},{"value":"4","vmPrice":"1","discount":"","name":"其他配置","desc":"4G","osDisk":"220","productId":""},{"value":"8","vmPrice":"1","discount":"","name":"其他配置","desc":"8G","osDisk":"220","productId":""},{"name":"其他配置","desc":"12G","value":"12","discount":"","productId":""},{"name":"其他配置","desc":"16G","value":"16","discount":"","productId":""}],"desc":"4核"},{"value":"8","memory":[{"name":"其他配置","desc":"4G","value":"4","discount":"","productId":""},{"value":"8","vmPrice":"1","discount":"","name":"其他配置","desc":"8G","osDisk":"330","productId":""},{"name":"其他配置","desc":"12G","value":"12","discount":"","productId":""},{"value":"16","vmPrice":"1","discount":"","name":"其他配置","desc":"16G","osDisk":"330","productId":""},{"name":"其他配置","desc":"24G","value":"24","discount":"","productId":""},{"name":"其他配置","desc":"32G","value":"32","discount":"","productId":""}],"desc":"8核"},{"value":"12","memory":[{"name":"其他配置","desc":"32G","value":"32","discount":"","productId":""}],"desc":"12核"}],"productId":201}
					vm4quickJson.vmQuickConfig = data.vmQuickConfig;
				}		
			});
		},
		_initSelected :function(){
			// 获取系统模板之后，可创建虚拟机
			VM4quick.getTemplateList(function postInit(){	
				VM4quick.getServiceOfferings(function(){
				});
			});
		},
		vmReset : function(){
			$("#vm-quick .price").empty();
			$("#vm-quick #osDisk4quick").empty();
			$("#vm-quick #cpu4quick").empty();
			$("#vm-quick #memory4quick").empty();
			$("#vm-quick #os4quick").empty();		
		},
		// 获取计算服务列表
		getServiceOfferings : function(postInit) {
			VM4quick.getQuickTypeList();
			if(postInit) {
				postInit();
			}			
		},
		
		// 获取OS模板列表
		getTemplateList : function(postInit) {
			serviceOfferingsData4quick = vm4quickJson.trans4ServiceOfferings4quick();
			if(postInit) {
				postInit();
			}
		},
		getQuickTypes : function(){
			var typeArr = [];
			$(serviceOfferingsData4quick).each(function(index, item) {
				if (item.displaytext != null && -1 == $.inArray(item.displaytext, typeArr)) {
					var vmType = {
						"displaytext" : item.displaytext,
						"vmPrice" : item.vmPrice,
						"productId" : item.productId,
						"osDisk" : item.osDisk,
						"osId" : item.os,
						"os_desc" : item.os_desc,
						"cpunumber" : item.cpunumber,
						"memory" : item.memory
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
		getQuickTypeList : function(){	
			var types = VM4quick.getQuickTypes();		
			$(".quick-vm-ul").empty();
			VM4quick.vmReset();
			if(types.length>0){
				$(types).each(function(index,item){			
					var tab_option = $("<li class='vm-tab' data-value='"+item.displaytext+"' productId='"+item.productId+"' osId='"+item.osId+"' vmPrice='"+item.vmPrice+"'><a href='#vm-standard4quick' data-toggle='tab' >"+item.displaytext+"</a></li>");
					tab_option.appendTo($(".quick-vm-ul"));
					//标配tab事件
					tab_option.click(function(){
						var productid = item.productId;
						VM4quick.curProductId = productid;
						if(productid >0){
							$("#quickVMModal .modal-footer .btn-primary").attr("disabled",false);
						}else{
							$("#quickVMModal .modal-footer .btn-primary").attr("disabled",true);
						}
						$("#vm-quick .price").empty();
						$(".quick-vm-ul li.vm-tab").removeClass("active");
						VM4quick.selectQuickType(item.displaytext);
						$(this).addClass("active");
						$("#vm-quick #osDisk4quick").empty().html(item.osDisk);
						$("#vm-quick #cpu4quick").empty().html(item.cpunumber);
						$("#vm-quick #memory4quick").empty().html(item.memory);
						$("#vm-quick #os4quick").empty().html(item.os_desc);
						$("#discount").empty();
						if(""!=item.discount&&item.discount.length>0){
							$("#discount").empty().html(item.discount);
						}
					});	
					if (index == 0) {
						tab_option.click();		
						VM4quick.getFee4quick();
					}
				});					
			}else{
				$("#quickVMModal .modal-footer .btn-primary").attr("disabled",true);
			}
		},
		selectQuickType : function(type){
			$(serviceOfferingsData4quick).each(function(index, item) {
				if(item.displaytext == type) {
					$("#vm-quick #cpu").html(item.cpunumber);
					$("#vm-quick #memory").html(item.memory);
					return false;
				}
			});
		},
		getFee4quick : function(){
			if(CommonEnum.offLineBill)return;
			var period = VM4quick.createPeriodInput4quick.getValue();		
			var param = vm4quickJson.getVMFee4quick();
			Dcp.biz.apiAsyncRequest("/pm/queryCaculateFeeByPrtyList",param, function(data) {
				if(null!=data&&0 == data.code){
					//目前运营只支持购买1个
					var count = 1;
					var fee =  data.data.fee;
					//$("#feeInput").val(count * fee/feeUnit);
					$("#vm-quick .price").empty().html(count * fee/feeUnit);
				}
			});
		},
		createVM4quick : function(modalId){
			var productId = 0;
			if($(".quick-vm-ul li.vm-tab").hasClass("active")){
				productId = Number($(".quick-vm-ul li.vm-tab.active").attr("productid"));
			}			
			//查询库存是否足够
			var cpuNum = $("#vm-quick #cpu4quick").html();
			var memorySize = $("#vm-quick #memory4quick").html();
			var osId = 0;
			if($(".quick-vm-ul li.vm-tab").hasClass("active")){
				osId = $(".quick-vm-ul li.vm-tab.active").attr("osid");
			}

			var osDisk = $("#vm-quick #osDisk4quick").html();
			com.skyform.service.vmService.listVMStock(cpuNum,memorySize,osId,osDisk,function onCreated(data){
				if(data.count && data.count>0){
					var instance = vm4quickJson.getVM4JsonInstance4quick();	
					com.skyform.service.vmService.createInstance(instance, function onCreated(instance){
						//订单提交成功后校验用户余额是否不足
						var _tradeId = instance.tradeId;
						var _fee = $("#vm-quick .price").html();	
						var createModal = $("#"+modalId);
						com.skyform.service.BillService.confirmTradeSubmit(_fee,_tradeId,createModal,function onSuccess(data){
							$.growlUI("提示", "创建申请提交成功, 请耐心等待开通服务..."); 
							$("#"+modalId).modal("hide");
							// refresh
							VM.describleVM();									
						},function onError(msg){
							$.growlUI("提示", "创建申请提交成功,扣款失败");
							$("#"+modalId).modal("hide");
						});				
					},function onError(msg){
						$.growlUI("提示", "创建申请提交失败：" + msg);
					});																		
				}else{
					$("#"+modalId).modal("hide");
					$.growlUI("提示", "很抱歉库存不足");
				}
			},function onError(msg){
				$.growlUI("提示", "创建申请提交失败：" + msg);
			});													
			
		},
		createVM4quick2 : function(modalId){
			var instance = vm4quickJson.getVM4JsonInstance4quick();		
			com.skyform.service.vmService.createInstance(instance, function onCreated(instance){
				//订单提交成功后校验用户余额是否不足
				var _tradeId = instance.tradeId;
				var _fee = $("#vm-quick .price").html();	
				var createModal = $("#"+modalId);
				com.skyform.service.BillService.confirmTradeSubmit(_fee,_tradeId,createModal,function onSuccess(data){
					$.growlUI("提示", "创建申请提交成功, 请耐心等待开通服务..."); 
				},function onError(msg){
					$.growlUI("提示", "创建申请提交成功,扣款失败");
				});				
			},function onError(msg){
				$.growlUI("提示", "创建申请提交失败：" + msg);
			});													
		}
		
};
