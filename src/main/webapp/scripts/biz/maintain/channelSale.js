//当前刷新实例的类型为虚拟机

var RuleState4Yaxin = {0:"处理中",9:"成功"};
var feeUnit = 1000;

var Sale = {
	packageSaleModal : null,
	userType : 1,
	identStatus : 1,
	qualification : 1,	
	miniA :{
		"name":"小型A",
		"cpu":"1",
		"memory":"1",
		"storageDisk":{"productId":1001,"size":"50"},
		"bandwidth":{"productId":5001,"size":"2"},
		"route":{"productId":6001},
		"productId":112,
		"os":{"id":6,"name":"CentOS6.5"}},
		
	miniB:{
		"name":"小型B",
		"cpu":"1",
		"memory":"2",
		"storageDisk":{"productId":1001,"size":"50"},
		"bandwidth":{"productId":5001,"size":"2"},
		"route":{"productId":6001},
		"productId":113,
		"os":{"id":6,"name":"CentOS6.5"}},
		
	midB:{
		"name":"中型B",
		"cpu":"2",
		"memory":"4",
		"storageDisk":{"productId":1001,"size":"50"},
		"bandwidth":{"productId":5001,"size":"2"},
		"route":{"productId":6001},
		"productId":115,
		"os":{"id":6,"name":"CentOS6.5"}},
		
	VMSubmit:null,	
		
	init : function(){
		
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
		var agentId = BuySale.agentCode;
		if(!agentId||agentId.length<0){
			$("#agentMsg").html("请输入优惠码！");
			return;
		}
		$(".gotobuy").hide();
		var productType = Number($("#productType").val()||$(".sale-ul .active").attr("data-value"));
		var data = Sale.getVMProduct(type, productType);
		Sale.getVM4JsonInstance(type,productType);	
//		//查询库存是否足够
		readFile(BuySale.fileName);		
		if(Sale.getLimited(productType)==0){
			$("#agentMsg").html("今天的优惠套餐已经售完，请您明天再来！");
			return;
		}		
//		writeFile(Sale.setLimited(productType));
//		return;
		var cpuNum = data.cpu;
		var memorySize = data.memory;
		var osId = data.os.id;
		var osDisk = 20;
		

		var channel = {
			"period" : 1,
			"count" : 1,
			"agentCouponCode" : "",
			"serviceType" : 1001,
			"productList" : []
		};
		instance = Sale.VMSubmit;
		channel.agentCouponCode = agentId;
		channel.period = instance.period;

		$(instance.productList).each(function(i, item) {
				var product = {
					"price" : 0,
					"productId" : "",
					"serviceType" : "",
					"productDesc" : {}
				};
				var vmFee = Sale.getVM4Price();
				// product.price = _fee;
				product.productId = item.productId;
				if (item.cpuNum) {
					var itemFee = com.skyform.service.channelService.getProductFee();
					itemFee.period = instance.period;
					product.serviceType = 1001;
					$(vmFee.productPropertyList).each(function(m,pp) {
						if (m < 4) {
							itemFee.productPropertyList.push(pp);
							// delete
							// itemFee.productPropertyList[i];
						}
					});
				com.skyform.service.channelService.getItemFee(itemFee,function(data) {
						product.price = data.fee / feeUnit;
					});
				} else if (item.storageSize) {					
					var itemFee = com.skyform.service.channelService.getProductFee();
					itemFee.period = instance.period;
					product.serviceType = 1002;
					$(vmFee.productPropertyList).each(function(n,pp) {
						if ("storageSize" == pp.muProperty) {
							itemFee.productPropertyList[0] = pp;
							return false;
						};

					});
					com.skyform.service.channelService.getItemFee(itemFee,function(data) {
						product.price = data.fee/ feeUnit;
					});
				} else if (item.BAND_WIDTH) {
					var itemFee = com.skyform.service.channelService.getProductFee();
					itemFee.period = instance.period;
					product.serviceType = 1006;
					$(vmFee.productPropertyList).each(function(n,pp) {
						if ("BAND_WIDTH" == pp.muProperty) {
							itemFee.productPropertyList[0] = pp;
							return false;
						};

					});
					com.skyform.service.channelService.getItemFee(itemFee,function(data) {
						product.price = data.fee/ feeUnit;
					});
				} else if (item.ROUTER) {
					var itemFee = com.skyform.service.channelService.getProductFee();
					itemFee.period = instance.period;
					product.serviceType = 1008;
					$(vmFee.productPropertyList).each(function(n,pp) {
						if ("routerPrice" == pp.muProperty) {
							itemFee.productPropertyList[0] = pp;
							return false;
						};

					});
					com.skyform.service.channelService.getItemFee(itemFee,function(data) {
						product.price = data.fee/ feeUnit;
					});
				}

				product.productDesc = item;
				channel.productList[i] = product;
			});// com.skyform.service.channelService
			var subnet = {
				      "price": 0,
				      "productId": 6002,
				      "serviceType": 1009,
				      "productDesc": {
				    	  "instanceName": "subnet",
				    	  "cidr": "192.168.1.0/24",
				    	  "gateway": "192.168.1.1",
				    	  "dns": "114.114.114.114",
				    	  "backupDNS": "",
					  	  "netmask": "255.255.255.0",
				          "productId": 6002,
				          "serviceType": 1009
				      }
				    };
			//channel.productList.push(subnet);
			com.skyform.service.channelService.channelSubmit(channel,function onCreated(data) {							
							// 订单提交成功后校验用户余额是否不足
							var _tradeId = data.tradeId;
							var disCountFee = data.fee;

							com.skyform.service.BillService.wizardConfirmTradeSubmit2(disCountFee,_tradeId,null,function onSuccess(data) {
									writeFile(Sale.setLimited(productType));
									$.growlUI("提示","申请已提交，请等待开通！您可以在控制台查看该产品");
									$(".gotobuy").show();
									createDefaulteSubnet();	
								},								
								function onError(
										msg) {
								$.growlUI(
									"提示",
									"申请虚拟机已提交，扣款失败");
								});
	
						}, function onError(msg) {
							$.growlUI("提示", "创建申请提交失败："
									+ msg);
							wizard.markSubmitError();
						});
	
		
//		com.skyform.service.vmService.listVMStock(cpuNum,memorySize,osId,osDisk, function onCreated(data){
//			//if(true){
//			if(data.count && data.count>0){			
//				Sale.getVM4JsonInstance(type,productType);	
//				com.skyform.service.vmService.createInstance(Sale.VMSubmit, function onCreated(instance){
//					//订单提交成功后校验用户余额是否不足
//					var _tradeId = instance.tradeId;
//					var _fee = $("#priceSale").html();
//					//免费试用
//					if(0 == type){
//						_fee = 0;
//					}
//					var createModal = $("#"+modalId);
//					com.skyform.service.BillService.confirmTradeSubmit(_fee,_tradeId,createModal,function onSuccess(data){
//						var tip = "创建申请提交成功，";
//						if(0 == type){
//							tip += "您将可免费试用3个月，"
//						}
//						tip += "请耐心等待开通服务..."
//						$.growlUI("提示", tip); 
//						$("#"+modalId).modal("hide");
//						// refresh
//						VM.describleVM();									
//					},function onError(msg){
//						$.growlUI("提示", "创建申请提交成功,扣款失败");
//						$("#"+modalId).modal("hide");
//					});				
//				},function onError(msg){
//					$.growlUI("提示", "创建申请提交失败：" + msg);
//				});																		
//			}else{
//				$("#"+modalId).modal("hide");
//				$.growlUI("提示", "很抱歉库存不足");
//			}
//		},function onError(msg){
//			$.growlUI("提示", "创建申请提交失败：" + msg);
//		});													
		
		
	
	},
	getUserType:function(){
		Sale.userType = VM.customerIdent.customerType;
		Sale.qualification = VM.customerIdent.qualification;
		Sale.identStatus = VM.customerIdent.identStatus;
	},
	
	initVMModel:function(data){
		$("#productName").empty().html(data.name);
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
		Dcp.biz.apiAsyncRequest("/pm/caculateFeeByProd",price, function(data) {
			if(null!=data&&0 == data.code){
				//目前运营只支持购买1个
				var count = 1;
				var fee =  data.data.fee;
				//$("#feeInput").val(count * fee/feeUnit);
				$("#priceSale").empty().html(count * fee/feeUnit);
				$("#priceOff").empty().html(count * fee * 0.6/feeUnit);
			}
		});
	},
	
	getVM4JsonInstance : function(type){
		var productType = $("#productType").val()||$(".sale-ul .active").attr("data-value");
		var data = Sale.getVMProduct(type,productType);
		Sale.VMSubmit = {
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
				};
		Sale.VMSubmit.period = Sale.createPeriodInput.getValue();
		
		if(0==type){
			Sale.VMSubmit.period = 3;
		}		
		
		
		com.skyform.service.vmService.getDefaultSubnet(function(result){
			if(result){
				//if("opening"!=result.subServiceStatus){					
					Sale.VMSubmit.productList[0].subNetId = result.subscriptionId;
				//}
			}
		}) 
		
		
		Sale.VMSubmit.productList[0].productId = data.productId;
		Sale.VMSubmit.productList[0].cpuNum = data.cpu;
		Sale.VMSubmit.productList[0].memorySize = data.memory;
		Sale.VMSubmit.productList[0].OS = data.os.id;
		
		var bw = {
				"instanceName" : "bandwidth",
				"BAND_WIDTH" : data.bandwidth.size,
				"productId" : data.bandwidth.productId,
				"serviceType": 1006
		};
		var storage = {
				"instanceName" : "storageDisk",	
				"storageSize" : data.storageDisk.size,
				"productId" : data.storageDisk.productId,
				"serviceType": 1002
		};
		var route = {
				"ROUTER" : "1",
				"productId" : data.route.productId,
				"serviceType": 1008
			}
		
		Sale.VMSubmit.productList.push(bw);
		Sale.VMSubmit.productList.push(route);
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
		else if(1==type){
			switch(Number(productType)){
				case 112:return Sale.miniA;break;
				case 113:return Sale.miniB;break;
				case 115:return Sale.midB;break;
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
		
		var disk = {
				"muProperty" : "storageSize",
				"muPropertyValue" : ""+data.storageDisk.size,
				"productId": data.storageDisk.productId
			};
		var route = {
			      "muProperty": "routerPrice",
			      "muPropertyValue": "1",
			      "productId": data.route.productId
			    }
			
		price.productPropertyList.push(bw);
		price.productPropertyList.push(disk);
		price.productPropertyList.push(route);
		return price;
	},
	getLimited:function(productType){
		var limited = BuySale.limited.split(",");
		switch(productType){
			case 112:return Number(limited[0]);break;
			case 113:return Number(limited[1]);break;
			case 115:return Number(limited[2]);break;
		}
	},	
//	getLimited:function(productType){
//		var limited = BuySale.limited;
//		var ret = 100;
//		$(limited).each(function(i,item){
//			if(productType == item.id){
//				ret = item.value;
//				return false;
//			}
//		})
//		console.log(ret);
//		return ret;
//	},
	
	setLimited:function(productType){
		var limited = BuySale.limited.split(",");
		switch(productType){
			case 112: limited[0] = Number(limited[0])-1;break;
			case 113: limited[1] = Number(limited[1])-1;break;
			case 115: limited[2] = Number(limited[2])-1;break;
		}
		var s = "";
		$(limited).each(function(i,item){
			s += item+",";
		})
		return s.substring(0,s.length-1);
	}
	
//	setLimited:function(productType){
//		var limited = BuySale.limited;
//		switch(productType){
//			case 112: limited[0].value = Sale.setLimitedJson(productType,limited);break;
//			case 113: limited[1].value = Sale.setLimitedJson(productType,limited);break;
//			case 115: limited[2].value = Sale.setLimitedJson(productType,limited);break;
//		};
//		console.log(limited);
//		return limited;
//	},
//	
//	setLimitedJson : function(productType,limited){
//		
//		var ret = 100;
//		$(limited).each(function(i,item){
//			if(productType == item.id){
//				ret = item.value--;
//				return false;
//			}
//		})
//		return ret;
//	}
	
};

var BuySale = {
	productType : 1,
	type : 0,
	ctx : "/portal",
	agentCode : "QD0001D55Y",//"QD0002SO80",
	limited : "400,200,100",
	fileName :　"/ajax/1212.json",
	init : function(){		
		BuySale.ctx = $("#ctx").val();
		BuySale.productType = Number($("#productType").empty().val());
		BuySale.fileName = BuySale.ctx+BuySale.fileName;
		BuySale.type = 1;
		$("#agentId").val("");
		$("#agentMsg").empty();		
		if($(".modal .btn")[1]){
			$(".modal .btn")[1].on("click",function(){
				$(".gotobuy").show();
			});
		}
		
		// 带+-的输入框		
		Sale.createPeriodInput = null;
		$(".subFee").off().on('mouseup keyup',function(){
			setTimeout('Sale.getFee()',2);
		});
		
		$(".gotobuy").unbind().click(function(){			
			Sale.createSalequick("blank",BuySale.type);
		})
		
//		$("#agentId").off().on('keyup  mouseup',function(){
//			$("#agentMsg").empty();
//			var agentId = $("#agentId").val();
//			if (agentId && agentId.length > 9) {
//				com.skyform.service.channelService.checkAgentCode(agentId, function(data) {
//					if ("-3" == data) {
//						$("#agentMsg").html("优惠码不存在，请重新输入！");
//						//$(".gotobuy").addClass("disabled").unbind();
//					} else if ("-2" == data || "-1" == data) {
//						$("#agentMsg").html("优惠码已经失效，请重新输入！");
//						//$(".gotobuy").addClass("disabled").unbind();
//					}
//					else {
//						$(".gotobuy").removeClass("disabled").show();
//					}
//					
//				});
//			}
//		});
		
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
	}	
}
var CommonEnum = {
		offLineBill: false
};
//function readFile(filename){ 
//	$.ajax({
//		"url" : "http://172.16.1.13/portal/ajax/1212.json",
//		"type" : "GET",
//		"dataType" : "json",
//		"async" : true,
//		"success" : function(result) {
//			BuySale.limited = result.responseText;
//		},
//		"error" : function(result) {
//			BuySale.limited = result.responseText;
//			console.log("rrr:"+BuySale.limited);
//		}		
//	}); 
//}
	function readFile(filename){ 
		$.ajax({
			"url" : "../../pr/1210",
			"type" : "GET",
			"dataType" : "json",
			"async" : true,
			"success" : function(result) {
				BuySale.limited = result.responseText;
			},
			"error" : function(result) {
				BuySale.limited = result.responseText;
			}		
		}); 
	}

	//写文件 
	function writeFile(filecontent){ 
		$.ajax({
			"url" : "../../pr/1212",
			"type" : "POST",
			"dataType" : "json",
			"async" : true,
			"data" :filecontent,
			"success" : function(result) {
				
			},
			"error" : function(result) {
				
			}		
		}); 
	};
	
	

