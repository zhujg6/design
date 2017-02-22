Dcp.namespace("com.skyform.agentService");
//调用api
com.skyform.agentService.getAgentCouponFeeInfo = function(type) {
	$("#demo").find("span[name$='Msg']").html("");
	//$("#agentDemo").attr("style","display:block");
	if(type=="vm"){
		var instance = vmJson.getVM4JsonInstance();		
		var _fee = Number($(".price").html());
		var portalType = Dcp.biz.getCurrentPortalType();
		var agentId = $("#agentId").val();		
		
		if(agentId&&agentId.length>0){
			com.skyform.service.channelService.checkAgentCode(agentId,function(data){
				if("-3" == data){
					$("#agentMsg").html(Dict.val("net_channel_discount_not_exist_please_re_enter"));								
				}
				else if("-2" == data||"-1" == data){
					$("#agentMsg").html(Dict.val("net_channel_discount_expired_please_re_enter"));	
				}else if("-6" == data){
					$("#agentMsg").html(Dict.val("common_coupons_reached_maximum_number"));
				}else if("-4" == data){
					$("#agentMsg").html(Dict.val("common_discount_code_authing"));
				} else if("-5" == data){
					$("#agentMsg").html(Dict.val("common_discount_code_unauthed"));
				}else if("-7" == data){
					$("#agentMsg").html(Dict.val("common_discount_code_noavailable"));
				}
				else {
					$("#agentDemo").attr("style","display:block");
					var channel =  {
							  "period": 1,
							  "count": 1,
							  "agentCouponCode":"",
							  "serviceType":CommonEnum.serviceType["vm"],
						      "productList":[]
						};
					
					channel.agentCouponCode = agentId;
					channel.period = instance.period;	
					
					
					$(instance.productList).each(function(i,item){
						var product = {		      	
							      "price": 0,
							      "productId": "",
							      "serviceType": "",
							      "productDesc": {}
							    }												
						product.productId = item.productId;	
						if(item.cpuNum){	
							var vmFee = vmJson.getVMFeeInstance();
							var itemFee = com.skyform.service.channelService.getProductFee();
							itemFee.period = instance.period;	
							product.serviceType = CommonEnum.serviceType["vm"];					
							$(vmFee.productPropertyList).each(function(m,pp){
								if(m<4) {
									itemFee.productPropertyList.push(pp);								
								}							
							})
							com.skyform.service.channelService.getItemFee(itemFee,function(data){
								product.price = data.fee/feeUnit;
							});
						}
						else if(item.storageSize){
							var vmFee = vmJson.getVMFeeInstance();
							var itemFee = com.skyform.service.channelService.getProductFee();
							itemFee.period = instance.period;	
							product.serviceType = CommonEnum.serviceType["vdisk"];
							$(vmFee.productPropertyList).each(function(n,pp){
								if("storageSize" == pp.muProperty){
									itemFee.productPropertyList[0] = pp;
								};
									
							});
							com.skyform.service.channelService.getItemFee(itemFee,function(data){
								product.price = data.fee/feeUnit;
							});
						}
						else if(item.BAND_WIDTH){
							var vmFee = vmJson.getVMFeeInstance();
							var itemFee = com.skyform.service.channelService.getProductFee();
							itemFee.period = instance.period;	
							product.serviceType = CommonEnum.serviceType["ip"];
							$(vmFee.productPropertyList).each(function(n,pp){
								if("BAND_WIDTH" == pp.muProperty){
									itemFee.productPropertyList[0] = pp;
								};
									
							});
							com.skyform.service.channelService.getItemFee(itemFee,function(data){
								product.price = data.fee/feeUnit;
							});
						}
						else if(item.ROUTER){
							var vmFee = vmJson.getVMFeeInstance();
							var itemFee = com.skyform.service.channelService.getProductFee();
							itemFee.period = instance.period;	
							product.serviceType = CommonEnum.serviceType["route"];
							$(vmFee.productPropertyList).each(function(n,pp){
								if("routerPrice" == pp.muProperty){
									itemFee.productPropertyList[0] = pp;
								};
									
							});
							com.skyform.service.channelService.getItemFee(itemFee,function(data){
								product.price = data.fee/feeUnit;
							});
						}
						
						product.productDesc = item;					
						channel.productList[i] = product;							
					});
					com.skyform.service.agentCouponService.agentCouponFeeInfo(channel,function onSuccess(data){
						$.each(data,function(name,value){
							$("#agentDemo").find("span[name='" + name + "Msg']").html(""+value);
						});
					});
				}
			});	
			
		}else{
			$("#agentMsg").html("请输入优惠码");
		}
	}else if(type=="lb"){
		$("#agentDemo").attr("style","display:block");
		var isSubmit = true;
		var instanceName = $.trim($("#lbInsName").val());
		var count = 1;
		var storageSize = $.trim($("#amount").val());
		var account = $("#user_name").val();
		var monitorName = $.trim($("#lbInsName").val()); //'Monitor';
		var monitorProtocol = $("#monitorProtocol").val();
		var monitorPort = $("#monitorPort").val();
		var loopType = $("#loopType").val();
		var network = $("#vm_privatenetwork").val();
		$("#lbInsName, #amount").jqBootstrapValidation();
		var scoreReg = /^[\u4E00-\u9FA0A-Za-z\-0-9\_]+$/;
		if(! scoreReg.exec(instanceName)) {
			$("#tipCreateLbName").text(Dict.val("common_name_contains_illegal_characters"));
			$("#lbInsName").focus();
			isSubmit = false;
		}else{
			$("#tipCreateLbName").text("");
		}
						
		if (!isSubmit) {
			return;
		}

		// TODO 加入输入合法性校验  ,对于portal,获取登录的用户赋值给ownUserId，目前写死测试值1115
		var period = lb.createPeridInput.getValue();
		//如果是年，period * 12
		if(3 == $("#billType .selected").attr("data-value")){
			period = period * 12;
		};
		var params = {
					"period":period,
					"count":1,
					"productList":[
					      {

						"instanceName" : instanceName,
						"network"  : network,
						"name" : monitorName,
						"productId" : product.productId,
						"port" : monitorPort,
						"protocol" : monitorProtocol,
						"looptype" : loopType
					       }
					      ]
		};
		if(lb.rules.length>0){
			params.productList[0].backendmember = [];
			$(lb.rules).each(function(i,rule){	
				var item = {
					"name" :rule.name,
					"port" : rule.port,
					"protocol" : rule.protocol
				} 
				params.productList[0].backendmember.push(item);
			});
		}
		//this.getFormData(params);
		var agentId = $("#agentId").val();
		var _fee = $("#feeInput").val();
		if(agentId&&agentId.length>0){
			com.skyform.service.channelService.checkAgentCode(agentId,function(data){
				if("-3" == data){
					$("#agentMsg").html(Dict.val("common_discount_code_no_exist"));								
				}
				else if("-2" == data||"-1" == data){
					$("#agentMsg").html(Dict.val("common_discount_code_expired"));	
				}else if("-6" == data){
					$("#agentMsg").html(Dict.val("common_coupons_reached_maximum_number"));
				}else if("-4" == data){
					$("#agentMsg").html(Dict.val("common_discount_code_authing"));
				} else if("-5" == data){
					$("#agentMsg").html(Dict.val("common_discount_code_unauthed"));
				} else if("-7" == data){
					$("#agentMsg").html(Dict.val("common_discount_code_noavailable"));
				}
				else {
					var channel = com.skyform.service.channelService.channel;
					channel.serviceType = CommonEnum.serviceType["lb"];
					channel.agentCouponCode = agentId;
					channel.period = params.period;
					channel.productList[0].price = _fee;			
					channel.productList[0].productId = params.productList[0].productId;				
					channel.productList[0].serviceType = CommonEnum.serviceType["lb"];
					channel.productList[0].productDesc = params.productList[0];
					com.skyform.service.agentCouponService.agentCouponFeeInfo(channel,function onSuccess(data){
						$.each(data,function(name,value){
							$("#demo").find("span[name='" + name + "Msg']").html(""+value);
						});
					});
				}
			});
		}
		else {
			$("#agentMsg").html("请输入优惠码");
		}
	}else if(type=="route"){
		$("#agentDemo").attr("style","display:block");
		if(Route.brandWidthSet=="useExisted"){
			if($.trim($("select.existed_brandwidth").val())==""||$.trim($("select.existed_brandwidth").val())==null){
				$("#brandwidthMsg").empty().html(Dict.val("net_currently_no_selectable_bandwidth_create_bandwidth"));
				return;
			}
		}
 	   //购买路由的时间(月数)，无论是按月还是按年，单位都是按月算，所以年的情况要乘以12
 	   var shijian;  //表示有多少月
 	   if("年" == $("#peridUnit").html()){
 		   shijian = Route.createPeridInput.getValue() * 12;
 	   }
 	   if("月" == $("#peridUnit").html()){
 		   shijian = Route.createPeridInput.getValue();
 	   }
 	   
 	  
 		  var params = {//无任何绑定创建路由的入参
 		 			period:shijian,
 		 			count:1,   
 		 			productList:[{
 		 			             	instanceName : $.trim($("#form_route_name").val()),
 		 			             	productId : product.productId
 		 						}]
 		 	   };
 		 	   var netCfg = $("input[type='radio'][name='networkoption']:checked").val();
 		 	   if(netCfg == 'useExisted') {
 		 		   params = {//绑定已有公网带宽创建路由的入参
 			        			period:shijian,
 			        			count:1,   
 			        			productList:[{
 			        			             	instanceName : $.trim($("#form_route_name").val()),
 			        			             	productId : product.productId,
 			        			             	eipId : $("select.existed_brandwidth").val()
 			        						}]
 			        	   };
 		 	   } else if (netCfg == 'createNew') {
 		 		   params = {//新申请公网带宽创建路由的入参
 			        			period:shijian,
 			        			count:1,   
 			        			productList:[{
 			        			             	instanceName : $.trim($("#form_route_name").val()),
 			        			             	productId : product.productId
 			        						},{
 			        			             	instanceName : "BW",
 			        			             	BAND_WIDTH : $("#createBandwidthSize").val(),
 			        			             	productId : ipJson.product.productId,
 			        			             	serviceType : CommonEnum.serviceType["route"]
 			        						}
 			        						]
 			        	   };
 		 	   }  
 		 	 //添加保定智慧城市请求参数,如果不是走原来的请求参数
 		 	   if(Route.booleanPool){
 		 		 params.productList[0].dedLineId=parseInt($("#dedicatedLineSelect option:selected").val());
 		 		 if(netCfg == 'createNew'){
 		 			 params.productList[1].dedLineId=parseInt($("#dedicatedLineSelect option:selected").val());
 		 		 }
 		 	   }
		var agentId = $("#agentId").val();
		var _fee = $("#feeInput").val();
		var newRouteForm = $("#newRouteForm");
		if (agentId && agentId.length > 0) {
			com.skyform.service.channelService
					.checkAgentCode(agentId,
							function(data) {
								if ("-3" == data) {
									$("#agentMsg").html(Dict.val("net_channel_discount_not_exist_please_re_enter"));
								} else if ("-2" == data || "-1" == data) {
									$("#agentMsg").html(Dict.val("net_channel_discount_expired_please_re_enter"));
								} else if("-6" == data){
									$("#agentMsg").html(Dict.val("common_coupons_reached_maximum_number"));
								} else if("-4" == data){
									$("#agentMsg").html(Dict.val("common_discount_code_authing"));
								} else if("-5" == data){
									$("#agentMsg").html(Dict.val("common_discount_code_unauthed"));
								} else if("-7" == data){
									$("#agentMsg").html(Dict.val("common_discount_code_noavailable"));
								}
								else {
									var channel = {
										"period" : 1,
										"count" : 1,
										"agentCouponCode" : "",
										"serviceType" : CommonEnum.serviceType["route"],
										"productList" : []
									};
									channel.agentCouponCode = agentId;
									channel.period = params.period;
									$(params.productList)
											.each(
													function(i, item) {
														var product = {
															"price" : 0,
															"productId" : "",
															"serviceType" : "",
															"productDesc" : {}
														}
														var itemFee = com.skyform.service.channelService
																.getProductFee();
														itemFee.period = params.period;

														// product.price = _fee;
														product.productId = item.productId;
														itemFee.productPropertyList[0].productId = item.productId;
														if (0 == i) {
															itemFee.productPropertyList[0].muProperty = "routerPrice";
															com.skyform.service.channelService
																	.getItemFee(itemFee,function(data) {
																				product.price = data.fee/ feeUnit;
																			});
															product.serviceType = CommonEnum.serviceType["route"];

														} else {
															itemFee.productPropertyList[0].muProperty = "BAND_WIDTH";
															itemFee.productPropertyList[0].muPropertyValue = item.BAND_WIDTH;
															com.skyform.service.channelService
																	.getItemFee(itemFee,function(data) {
																				product.price = data.fee/ feeUnit;
																			});
															product.serviceType = CommonEnum.serviceType["ip"];
														}
														product.productDesc = item;
														channel.productList[i] = product;
													});
								com.skyform.service.agentCouponService.agentCouponFeeInfo(channel,function onSuccess(data){
									$.each(data,function(name,value){
										$("#demo").find("span[name='" + name + "Msg']").html(""+value);
									});
								});

								}
							});
		} else {
			$("#agentMsg").html("请输入优惠码");
		}
	}else if(type=="ip"){
		$("#agentDemo").attr("style","display:block");
		var isSubmit = true;
		var instanceName = $.trim($("#createInsName").val());
		var count = 1;
		var storageSize = $.trim($("#amount").val());
		var account = $("#user_name").val();
		var type = 1;// 先默认为独享带宽
		// 验证
		$("#createInsName, #amount").jqBootstrapValidation();
		var scoreReg = /^[\u4E00-\u9FA0A-Za-z\-0-9\_]+$/;
		if (instanceName != "") {
			if (!scoreReg.exec(instanceName)) {
				$("#tipCreateInsName").text(Dict.val("common_ch_en_num"));
				// $("#createInsName").focus();
				isSubmit = false;
			} else {
				$("#tipCreateInsName").text("");
			}
		}

		var countValidateResult = eip.createCountInput.validate();
		if (countValidateResult.code == 1) {
			$("#tipCreateCount").text(countValidateResult.msg);
			isSubmit = false;
		} else {
			$("#tipCreateCount").text("");
			count = eip.createCountInput.getValue();
		}
		var freeParam={"verifyFlag" : "0"};
		if(eip.defultPool=="bdzhcs" || eip.defultPool=="neimengguhuanbaoyun"){
			freeParam.dedLineId=parseInt($("#dedicatedLine").val());
		};
		var dataCode=0;
		var dataMsg="";
		Dcp.biz.apiRequest("/instance/eip/queryFreeIp", freeParam, function(data) {
			if (null != data && data.code == 0) {
				eip.enough = data.data;
			}
			dataCode=data.code;
			dataMsg=data.msg;
		});
		if (eip.enough - count < 0) {
			$.growlUI(Dict.val("common_tip"), Dict.val("eip_applications_balance") + eip.enough
					+ ','+Dict.val("eip_unable_to_create"));
			return;
		}
		
		if(dataCode==-1){
			$.growlUI(dataMsg);
			return;
		}

		if ($("#amount").jqBootstrapValidation("hasErrors")) {
			$("#tipCreateStorageSize").text(Dict.val("eip_bandwidth_must_greater_equal"));
			$("#amount").val(1);
			$("#slider-range-min").slider("option", "value", 1);
			isSubmit = false;
		} else {
			$("#tipCreateStorageSize").text("");
		}

		if (!isSubmit) {
			return;
		}

		$("#feeInput").val(eip.getFee());
		// 如果是年，period * 12
		var period = eip.createPeriodInput.getValue();
		if (3 == $("#billType .selected").attr("data-value")) {
			period = period * 12;
		}
		;
		var params = {
			"period" : period,
			"count" : count,
			"productList" : [ {
				"instanceName" : instanceName,
				"BAND_WIDTH" : $("#amount").val(),
			   // "storageSize":$("#amount").val(),
				"productId" : product.productId
			} ]
		};

		if(eip.defultPool=="bdzhcs" || eip.defultPool=="neimengguhuanbaoyun"){
			params.productList[0].dedLineId=parseInt($("#dedicatedLine").val());
		}
		
		var _fee = $(".price").html()?Number($(".price").html()):0;
		var createModal = $("#createEipModal");
		var portalType = Dcp.biz.getCurrentPortalType();
		var agentId = $("#agentId").val();
		if (agentId && agentId.length > 0) {
			com.skyform.service.channelService
					.checkAgentCode(
							agentId,
							function(data) {
								if ("-3" == data) {
									$("#agentMsg").html(Dict.val("common_discount_code_no_exist"));
								} else if ("-2" == data || "-1" == data) {
									$("#agentMsg").html(Dict.val("common_discount_code_expired"));
								} else if("-6" == data){
									$("#agentMsg").html(Dict.val("common_coupons_reached_maximum_number"));
								} else if("-4" == data){
									$("#agentMsg").html(Dict.val("common_discount_code_authing"));
								} else if("-5" == data){
									$("#agentMsg").html(Dict.val("common_discount_code_unauthed"));
								}else if("-7" == data){
									$("#agentMsg").html(Dict.val("common_discount_code_noavailable"));
								}							
								else {
									var channel = com.skyform.service.channelService.channel;
									channel.serviceType = CommonEnum.serviceType["ip"];
									channel.agentCouponCode = agentId;
									channel.period = params.period;
									channel.productList[0].price = _fee;
									channel.productList[0].productId = params.productList[0].productId;
									channel.productList[0].serviceType = CommonEnum.serviceType["ip"];
									channel.productList[0].productDesc = params.productList[0];
									com.skyform.service.agentCouponService.agentCouponFeeInfo(channel,function onSuccess(data){
										$.each(data,function(name,value){
											$("#demo").find("span[name='" + name + "Msg']").html(""+value);
										});
									});
									
								}
							});
		} else {
			$("#agentMsg").html("请输入优惠码");
		}
	}else if(type=="vdisk"){
		$("#agentDemo").attr("style","display:block");
		var isSubmit = true;
		// 验证
		$("#createInstanceName, #createCount").jqBootstrapValidation();	
	    //同名校验
		var instanceName = $.trim($("#createInstanceName").val());			
		var _param = {"instanceName":instanceName,"instanceCode":"vdisk"};
		var count = 1;
		var storageSize = $.trim($("#createStorageSize").val());			
	    if (parseInt(storageSize) < 10) {
	    	$("#tipCreateStorageSize").text(Dict.val("vdisk_capacity_must_be_greater_or_equal"));
	    	$("#createStorageSize").val(10);
	    	$("#slider-range-min").slider("option", "value", 10);
	    	isSubmit = false;
	    } else {
	    	$("#tipCreateStorageSize").text("");
	    }
	    
	    if(parseInt(storageSize)>product.max){
	    	$("#tipCreateStorageSize").text(Dict.val("vdisk_capacity_can_not_be_greater_than")+product.max);
	    	$("#createStorageSize").val(product.max);
	    	$("#slider-range-min").slider("option", "value", product.max);
	    	isSubmit = false;		    	
	    }else {
	    	$("#tipCreateStorageSize").text("");
	    }
	    
		if (!isSubmit) {
			return;
		}			
		
	    com.skyform.service.PortalInstanceService.querySameNameExist(window.currentInstanceType,instanceName,function(isExist){
	    	if(isExist){
	    		$("#tipCreateInstanceName").text(Dict.val("common_name_used_re_enter"));
	    	}else{
	    		$("#tipCreateInstanceName").text("");
				$("#feeInput").text(VdiskVolume.getFee());
				var period = VdiskVolume.createPeridInput.getValue();
				var peridUnit = $("#peridUnit").html();			
				if(peridUnit == '年'){
					period = period*12;
				}
				var _fee = $("#feeInput").text();
				var createModal = $("#createModal");
				var agentId = $("#agentId").val();
				var params = {
						"period":period,
						"count":1,
						"productList":[
							{
								"instanceName" : instanceName,
								"storageSize" : storageSize,
								"productId":product.productId
							}
						] 
				};		
				if(agentId&&agentId.length>0){
					com.skyform.service.channelService.checkAgentCode(agentId,function(data){
						if("-3" == data){
							$("#agentMsg").html(Dict.val("net_channel_discount_not_exist_please_re_enter"));								
						}
						else if("-2" == data||"-1" == data){
							$("#agentMsg").html(Dict.val("net_channel_discount_expired_please_re_enter"));	
						}else if("-6" == data){
							$("#agentMsg").html(Dict.val("common_coupons_reached_maximum_number"));
						}else if("-4" == data){
							$("#agentMsg").html(Dict.val("common_discount_code_authing"));
						} else if("-5" == data){
							$("#agentMsg").html(Dict.val("common_discount_code_unauthed"));
						}else if("-7" == data){
							$("#agentMsg").html(Dict.val("common_discount_code_noavailable"));
						}
						else {
							var channel = com.skyform.service.channelService.channel;
							channel.serviceType = CommonEnum.serviceType["vdisk"];
							channel.agentCouponCode = agentId;	
							channel.period = params.period;
							channel.productList[0].price = _fee;	
							channel.productList[0].productId = params.productList[0].productId;
							channel.productList[0].serviceType = CommonEnum.serviceType["vdisk"];
							channel.productList[0].productDesc = params.productList[0];
							com.skyform.service.agentCouponService.agentCouponFeeInfo(channel,function onSuccess(data){
								$.each(data,function(name,value){
									$("#demo").find("span[name='" + name + "Msg']").html(""+value);
								});
							});
						}
					});	
				}
				else {
					$("#agentMsg").html("请输入优惠码");
				}
	    	}
	    });
	}
	
};
