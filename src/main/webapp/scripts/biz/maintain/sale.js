//当前刷新实例的类型为虚拟机

var RuleState4Yaxin = {0:"处理中",9:"成功"};
var feeUnit = 1000;

var Sale = {
	packageSaleModal : null,
	userType : 1,
	identStatus : 1,
	qualification : 1,
	free_privateVM :{
		"cpu":"1",
		"memory":"1",
		"storageDisk":{"productId":50042,"size":"100"},
		"bandwidth":{"productId":50043,"size":"1"},
		"productId":50041,
		"os":{"id":6,"name":"CentOS6.5"}},
		
	free_officeVM:{
		"cpu":"1",
		"memory":"2",
		"storageDisk":{"productId":50045,"size":"100"},
		"bandwidth":{"productId":50046,"size":"1"},
		"productId":50044,
		"os":{"id":6,"name":"CentOS6.5"}},
		
	free_companyVM:{
		"cpu":"2",
		"memory":"2",
		"storageDisk":{"productId":50048,"size":"150"},
		"bandwidth":{"productId":50049,"size":"1"},
		"productId":50047,
		"os":{"id":6,"name":"CentOS6.5"}},
	
	privateVM :{
		"cpu":"1",
		"memory":"1",
		"storageDisk":{"productId":50051,"size":"100"},
		"bandwidth":{"productId":50052,"size":"1"},
		"productId":50050,
		"os":{"id":6,"name":"CentOS6.5"}},
		
	officeVM:{
		"cpu":"1",
		"memory":"2",
		"storageDisk":{"productId":50054,"size":"100"},
		"bandwidth":{"productId":50055,"size":"1"},
		"productId":50053,
		"os":{"id":6,"name":"CentOS6.5"}},
		
	companyVM:{
		"cpu":"2",
		"memory":"2",
		"storageDisk":{"productId":50057,"size":"150"},
		"bandwidth":{"productId":50058,"size":"1"},
		"productId":50056,
		"os":{"id":6,"name":"CentOS6.5"}},
		
	VMSubmit:{
		  "period": 1,
		  "count": 1,
		  "productList": [
		    {
		      "cpuNum": "",
		      "memorySize": "",
		      "OS": "6",
		      "instanceName": "",
		      "productId": 0,
		      "osDisk": "20",
		      "subNetId": "0",
		      "firewallRules": []
		    }
		  ]
		},	
		
	init : function(){
		$("a#openSale").unbind().click(function(){
			if(!(VM.customerIdent.identStatus==2)){
				Sale.openIdentModal();				
			}
			else Sale.openSale();
		});
		Sale.getUserType();		
	},	
	
	openSale : function(){		
		var modalId = "packageSaleModal";
		if(Sale.packageSaleModal == null){
			Sale.packageSaleModal = new com.skyform.component.Modal(
					modalId,
					"套餐促销",
					$("script#sale_div").html(),
					{
						buttons : [
								{
									name : "<i class='icon-heart-empty mr5'></i>免费试用",
									onClick : function() {
										Sale.createSalequick(modalId,0);											
//										VM.service.createInstance(instance, function onCreated(instance){
//											//订单提交成功后校验用户余额是否不足
//											var _tradeId = instance.tradeId;
//											var _fee = $("#vm-quick .price").html();	
//											
//											
//											var createModal = $("#"+modalId);
//											com.skyform.service.BillService.confirmTradeSubmit(_fee,_tradeId,createModal,function onSuccess(data){
//												$.growlUI("提示", "创建申请提交成功, 请耐心等待开通服务..."); 
//												$("#"+modalId).modal("hide");
//												// refresh
//												VM.describleVM();									
//											},function onError(msg){
//												$.growlUI("提示", "创建申请提交成功,扣款失败");
//												$("#"+modalId).modal("hide");
//											});				
//										},function onError(msg){
//											$.growlUI("提示", "创建申请提交失败：" + msg);
//										});										
									},
									attrs : [ {
										name : 'class',
										value : 'btn btn-primary'
									}, {
										name:'id',
										value:'freeBtn'
									},{
										name:'style',
										value:'display:none'
									}]
								}, 
								{
									name : "立即购买",
									onClick : function() {
									Sale.createSalequick(modalId,1);
//											var instance = vm4quickJson.getVM4JsonInstance4quick();		
//											VM.service.createInstance(instance, function onCreated(instance){
//												//订单提交成功后校验用户余额是否不足
//												var _tradeId = instance.tradeId;
//												var _fee = $("#vm-quick .price").html();	
//												
//												
//												var createModal = $("#"+modalId);
//												com.skyform.service.BillService.confirmTradeSubmit(_fee,_tradeId,createModal,function onSuccess(data){
//													$.growlUI("提示", "创建申请提交成功, 请耐心等待开通服务..."); 
//													$("#"+modalId).modal("hide");
//													// refresh
//													VM.describleVM();									
//												},function onError(msg){
//													$.growlUI("提示", "创建申请提交成功,扣款失败");
//													$("#"+modalId).modal("hide");
//												});				
//											},function onError(msg){
//												$.growlUI("提示", "创建申请提交失败：" + msg);
//											});										
								},
								attrs : [ {
									name : 'class',
									value : 'btn btn-success'
								} ]
								},
								{
									name : "取消",
									attrs : [ {
										name : 'class',
										value : 'btn'
									} ],
									onClick : function() {
										Sale.packageSaleModal.hide();
									}
								} ],
						beforeShow : function(){							
							Sale.initSaleModel();
						},
						afterShow : function(){
							
							
						}
					});
		}		
		Sale.packageSaleModal.setHeight(450).setWidth(700).setTop(10).show();			
	},
	createSalequick : function(modalId,type){
		$(".gotobuy").hide();
		var productType = $("#productType").val()||$(".sale-ul .active").attr("data-value");
		var data = Sale.getVMProduct(type, productType);
		//查询库存是否足够		
		var cpuNum = data.cpu;
		var memorySize = data.memory;
		var osId = data.os.id;
		var osDisk = 20;
		com.skyform.service.vmService.listVMStock(cpuNum,memorySize,osId,osDisk, function onCreated(data){
			//if(true){
			if(data.count && data.count>0){			
				Sale.getVM4JsonInstance(type,productType);	
				com.skyform.service.vmService.createInstance(Sale.VMSubmit, function onCreated(instance){
					//订单提交成功后校验用户余额是否不足
					var _tradeId = instance.tradeId;
					var _fee = $("#priceSale").html();
					//免费试用
					if(0 == type){
						_fee = 0;
					}
					var createModal = $("#"+modalId);
					com.skyform.service.BillService.confirmTradeSubmit(_fee,_tradeId,createModal,function onSuccess(data){
						var tip = "创建申请提交成功，";
						if(0 == type){
							tip += "您将可免费试用3个月，"
						}
						tip += "请耐心等待开通服务..."
						$.growlUI("提示", tip); 
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
	getUserType:function(){
		Sale.userType = VM.customerIdent.customerType;
		Sale.qualification = VM.customerIdent.qualification;
		Sale.identStatus = VM.customerIdent.identStatus;
	},
	
	initVMModel:function(data){
		$("#os4Sale").empty().html(data.os.name);
		$("#cpu4Sale").empty().html(data.cpu);
		$("#memory4Sale").empty().html(data.memory);
		$("#bandwidth4Sale").empty().html(data.bandwidth.size);	
		$("#osDisk4Sale").empty().html(data.storageDisk.size);
		Sale.getFee();
	},
	
	initSaleModel:function(){
		$(".subFee").off().on('mouseup keyup',function(){
			setTimeout('Sale.getFee()',2);
		});
		
		if(!CommonEnum.offLineBill){
			$(".feeInput_div").show();
		}
		
		if(Sale.qualification==2){
			$("#freeBtn").show();
		}
		
		// 带+-的输入框
		Sale.createPeriodInput = null;
		if (Sale.createPeriodInput == null) {
			var container = $("#period4Sale").empty();				
			var max = 12;
			Sale.createPeriodInput = new com.skyform.component.RangeInputField(container, {
				min : 1,
				defaultValue : 1,
				max:max,
				textStyle : "width:137px"
			}).render();
			Sale.createPeriodInput.reset();
				
		};
		
		$(".sale-ul li a").unbind().click(function(){
			$(".sale-ul li").removeClass("active");
			$(this).parent().addClass("active");
			var type = $(".sale-ul .active").attr("data-value");
			var data = Sale.getVMProduct(1, type);
			Sale.initVMModel(data);
//			if(0 == type){
//				Sale.initVMModel(Sale.privateVM);
//			}
//			else if(1 == type){
//				Sale.initVMModel(Sale.free_officeVM);
//			}
//			else if(2 == type){
//				Sale.initVMModel(Sale.free_companyVM);
//			}
		});	
		
		$(".sale-ul li").removeClass("active");
		$(".sale-ul li[data-value='"+Sale.userType+"']").addClass("active");
		$(".sale-ul li[data-value='"+Sale.userType+"']").show();
		$(".sale-ul .active a").click();
		
		if(3 == Sale.userType){
			$(".sale-ul li[data-value='2']").show();			
		}
	},	
	
	getFee : function(){
		var productType = $("#productType").val()||$(".sale-ul .active").attr("data-value");
		var price = Sale.getVM4Price(1,productType);
		Dcp.biz.apiAsyncRequest("/pm/queryCaculateFeeByPrtyList",price, function(data) {
			if(null!=data&&0 == data.code){
				//目前运营只支持购买1个
				var count = 1;
				var fee =  data.data.fee;
				//$("#feeInput").val(count * fee/feeUnit);
				$("#priceSale").empty().html(count * fee/feeUnit);
			}
		});
	},
	
	getVM4JsonInstance : function(type){
		var productType = $("#productType").val()||$(".sale-ul .active").attr("data-value");
		var data = Sale.getVMProduct(type,productType);
		
		Sale.VMSubmit.period = Sale.createPeriodInput.getValue();
		if(0==type){
			Sale.VMSubmit.period = 3;
		}		
		
		Sale.VMSubmit.productList[0].productId = data.productId;
		Sale.VMSubmit.productList[0].cpuNum = data.cpu;
		Sale.VMSubmit.productList[0].memorySize = data.memory;
		Sale.VMSubmit.productList[0].OS = data.os.id;
		
		var bw = {
				"instanceName" : "bandwidth",
				"BAND_WIDTH" : data.bandwidth.size,
				"productId" : data.bandwidth.productId	
		};
		var storage = {
				"instanceName" : "storageDisk",	
				"storageSize" : data.storageDisk.size,
				"productId" : data.storageDisk.productId	
		};
		Sale.VMSubmit.productList.push(bw);
		Sale.VMSubmit.productList.push(storage);
		
	},
	
	getVMProduct:function(type,productType){
		//免费
		if(0==type){
			//Sale.createPeriodInput.setValue(3);
			if(1==productType){
				return Sale.free_privateVM;
			}
			else if(2==productType){
				return Sale.free_officeVM;
			}
			else if(3==productType){
				return Sale.free_companyVM;
			}
		}
		//购买
		else if(1==type){
			if(1==productType){
				return Sale.privateVM;
			}
			else if(2==productType){
				return Sale.officeVM;
			}
			else if(3==productType){
				return Sale.companyVM;
			}
		}
	},
	
	getVM4Price:function(){
		var productType = $("#productType").val()||$(".sale-ul .active").attr("data-value");
		var data = Sale.getVMProduct(1, productType);
		var price = {
				  "period": Sale.createPeriodInput.getValue(),
				  "productPropertyList": [
				    {
				      "muProperty": "cpuNum",
				      "muPropertyValue": ""+data.cpu,
				      "productId": data.productId
				    },
				    {
				      "muProperty": "memorySize",
				      "muPropertyValue": ""+data.memory,
				      "productId": data.productId
				    },
				    {
				      "muProperty": "OS",
				      "muPropertyValue": ""+data.os.id,
				      "productId": data.productId
				    },
				    {
				        "muProperty": "vmPrice",
				        "muPropertyValue": "1",
				        "productId": data.productId
				      }
				  ]
				};
		var bw = {
			"muProperty" : "BAND_WIDTH",
			"muPropertyValue" : ""+data.bandwidth.size,
			"productId": data.bandwidth.productId
			};
		var bwPrice = {
			      "muProperty": "pnPrice",
			      "muPropertyValue": "1",
			      "productId": data.bandwidth.productId
			    };
		var disk = {
				"muProperty" : "storageSize",
				"muPropertyValue" : ""+data.storageDisk.size,
				"productId": data.storageDisk.productId
			};
		var diskPrice = {
			      "muProperty": "ebsPrice",
			      "muPropertyValue": "1",
			      "productId": data.storageDisk.productId
			    };
			
		price.productPropertyList.push(bw);
		price.productPropertyList.push(bwPrice);
		price.productPropertyList.push(disk);
		price.productPropertyList.push(diskPrice);
		return price;
	},
	openIdentModal : function() {
		var ctx = $("#ctx").val();
		var url = ctx+"/jsp/user/indent.jsp?code=indent";
		var confirmModal = new com.skyform.component.Modal(
				new Date().getTime(),
				"活动提示",
				"<h6>请您先去<a class='state-green' href="+url+"><strong>用户中心</strong></a>进行认证，申请参加活动！</h6>",
				{
					
				});
		confirmModal.setWidth(600).autoAlign();
		confirmModal.show();
	}
};

var BuySale = {
	productType : 1,
	type : 0,
	ctx : "/portal",
	init : function(){
		BuySale.ctx = $("#ctx").val();
		BuySale.productType = $("#productType").empty().val();
		BuySale.type = $("#type").empty().val();
		// 带+-的输入框		
		Sale.createPeriodInput = null;
		$(".subFee").off().on('mouseup keyup',function(){
			setTimeout('Sale.getFee()',2);
		});
		
		if (Sale.createPeriodInput == null) {
			var container = $("#period4Sale").empty();				
			var max = 12;
			Sale.createPeriodInput = new com.skyform.component.RangeInputField(container, {
				min : 1,
				defaultValue : 1,
				max:max,
				textStyle : "width:137px"
			}).render();
			Sale.createPeriodInput.reset();
				
		};
		//console.log("===productType="+BuySale.productType+"===type="+BuySale.type);
		var data = Sale.getVMProduct(BuySale.type, BuySale.productType);
		if(data){
			Sale.initVMModel(data);
		}
		BuySale.queryCustIdent();
		$(".gotobuy").unbind().click(function(){
			Sale.createSalequick("blank",BuySale.type);
		})
	},		
	queryCustIdent:function(){
		com.skyform.service.vmService.queryCustIdent(function(data){
			//customerType:1个人2企业3大客户 ； identStatus:1待审2通过3驳回4缺资料； qualification:1未申请2申请
//			data.qualification = 2;
//			data.customerType = 2;
//			data.identStatus = 2;
//			Sale.userType = data.customerType;
//			Sale.identStatus = data.identStatus;
//			Sale.qualification = data.qualification;
			if(data.identStatus != 2){				
				setTimeout(function(){
					var url = BuySale.ctx+"/jsp/user/indent.jsp?code=indent";
					window.location.assign(url);
				},2000);
				$.growlUI("提示", "没有进行实名认证,2秒后跳转到认证界面...");				
			}
			else{
//				if(BuySale.productType != data.customerType){
//				if(((data.customerType == 1||data.customerType == 2)&&BuySale.productType != data.customerType)||(BuySale.productType == 1&&data.customerType == 3)){
				if((BuySale.productType == 1&&data.customerType != 1)||(BuySale.productType == 2&& data.customerType<2)||(BuySale.productType == 3&& data.customerType <3)){
					$(".gotobuy").hide();
					switch(data.customerType){
						case 1:$.growlUI("提示", '您只能选择"个人开发者"版本的产品,请重新选择...');break;
						case 2:$.growlUI("提示", '您只能选择"中小企业"版本的产品,请重新选择...');break;
						case 3:$.growlUI("提示", '您不能选择"个人开发者"版本的产品,请重新选择...');break;
					}
					setTimeout(function(){
					//var ctx = $("#ctx").val();
					//var url = ctx+"/jsp/user/indent.jsp?code=indent";
					//window.location.assign(url);
						window.location.assign(BuySale.ctx);
					},2000)
				}
				else{
					switch(data.customerType){
						case 1:$("#productLogo").removeAttr("src").attr("src",BuySale.ctx+"/images/private.jpg");break;
						case 2:$("#productLogo").removeAttr("src").attr("src",BuySale.ctx+"/images/officer.jpg");break;
						case 3:$("#productLogo").removeAttr("src").attr("src",BuySale.ctx+"/images/company.jpg");break;
					}
					if(data.qualification == 1){
						BuySale.type = 1;
						var data = Sale.getVMProduct(BuySale.type, BuySale.productType);
						if(data){
							Sale.initVMModel(data);
							Sale.getFee();
							$(".gotobuy").show();
						}
					}
					else{
					    var data2 = Sale.getVMProduct(BuySale.type, BuySale.productType);
						if(data2){
							if(BuySale.type == 0)
								$("#buy_type").text("免费试用");
							
							Sale.initVMModel(data2);
							Sale.getFee();
							$(".gotobuy").show();
						}
					}
				}
			}
		})
	}	
		
}
var CommonEnum = {
		offLineBill: false
}
