/**
 * 各种服务的service
 */
Dcp.namespace("com.skyform.service");
// 调用api 异步post
com.skyform.service.callPostSyncApi = function(api,params,onSuccess,onError) {
	Dcp.biz.apiSoftPostAsyncRequest(api,params || {},function(result){
		if(result&&result.code ==0) {
			if(onSuccess) {
				if(!result.response){
					result.response = result.data;
				}
				onSuccess(result.response);
			}
		} else if (onError) {
		  if(result != null){
			onError(result.msg);
		  }else{
			//onError("获取数据出错，请稍后再试...");
		  }
		}
	},function(error){
		console.log(error);
		if(error && error.status && error.status == 403) {
			window.alert("您会话已经过期，请重新登录！");
			window.location = CONTEXT_PATH + "/jsp/login.jsp";
		}
		if(onError) {
			onError("获取数据出错，请稍后再试...");
		}
	});
};
//调用api 异步post 调用亚信接口
com.skyform.service.callPostSyncApi4Yaxin = function(api,params,onSuccess,onError) {
	Dcp.biz.apiAsyncRequest4Soft(api,params || {},function(result){
		if(result&&result.code ==0) {
			if(onSuccess) {
				onSuccess(result);
			}
		} else if (onError) {
		  if(result != null){
			onError(result.msg);
		  }else{
			//onError("获取数据出错，请稍后再试...");
		  }
		}
	},function(error){
		if(error && error.status && error.status == 403) {
			window.alert("您会话已经过期，请重新登录！");
			window.location = CONTEXT_PATH + "/jsp/login.jsp";
		}
		if(onError) {
			onError("获取数据出错，请稍后再试...");
		}
	});
};

//调用api 异步get
com.skyform.service.callGetSyncApi = function(api,onSuccess,onError) {
	Dcp.biz.apiSoftAsyncRequest(api,function(result){
		if(result&&result.code ==0) {
			if(onSuccess) {
				if(!result.response){
					result.response = result.data;
				}
				onSuccess(result.response);
			}
		} else if (onError) {
		  if(result != null){
			onError(result.msg);
		  }else{
			//onError("获取数据出错，请稍后再试...");
		  }
		}
	},function(error){
		if(error && error.status && error.status == 403) {
			window.alert("您会话已经过期，请重新登录！");
			window.location = CONTEXT_PATH + "/jsp/login.jsp";
		}
		if(onError) {
			onError("获取数据出错，请稍后再试...");
		}
	});
};
//调用api 同步get
com.skyform.service.callGetApi = function(api,params,onSuccess,onError) {
	Dcp.biz.apiSoftRequest(api,params || {},function(result){
		if(result&&result.code ==0) {
			if(onSuccess) {
				if(!result.response){
					result.response = result.data;
				}
				onSuccess(result.response);
			}
		} else if (onError) {
			onError(result.msg);
		}
	},function(error){
		if(error && error.status && error.status == 403) {
			window.alert("您会话已经过期，请重新登录！");
			window.location = CONTEXT_PATH + "/jsp/login.jsp";
		}
		if(onError) {
			onError("获取数据出错，请稍后再试...");
		}
	});
};
com.skyform.service.call = function(api,params,onSuccess,onError) {
	Dcp.JqueryUtil.dalinReq4obs(api,params || {},function(result){
		if(result&&result.code ==0) {
			if(onSuccess) {
				if(!result.response){
					result.response = result.data;
				}
				onSuccess(result.responses);
			}
		} else if (onError) {
			onError(result.msg);
		}
	},function(error){
		if(error && error.status && error.status == 403) {
			window.alert("您会话已经过期，请重新登录！");
			window.location = CONTEXT_PATH + "/jsp/login.jsp";
		}
		if(onError) {
			onError("获取数据出错，请稍后再试...");
		}
	});
};

/**
 * 菜单service
 */
com.skyform.service.menuService = {
	callApi : com.skyform.service.callPostSyncApi,
	listTree : function(onSuccess,onError){
		var params = {};
		this.callApi("/client?p=/software/querySoftwareListByTree",params,onSuccess, onError);
	}	
};

com.skyform.service.shopProductService = {
	pagesize : 4,
	callApi : com.skyform.service.callPostSyncApi,
	listProduct : function(serviceType,page,onSuccess,onError){
		var param = {"id": serviceType, "page": page, "pagesize": this.pagesize};
		this.callApi("/client?p=/product/queryProductList&_"+serviceType, param, onSuccess, onError);
	},
	listAllProduct : function(serviceType,page,timestamp,pagesize,onSuccess,onError){
		//var param = {"id": serviceType, "page": page, "pagesize": 10};
		var param ={};
		if(pagesize !=null){
			param = {"id": serviceType, "page": page, "pagesize": pagesize};
		}else{
			param = {"id": serviceType, "page": page, "pagesize": 10};
		}
		//if(timestamp !=null){
		//	this.callApi("/client?p=/software/queryProductList&_"+serviceType+"&_"+timestamp, param, onSuccess, onError);
		//}else{
		//	this.callApi("/client?p=/software/queryProductList&_"+serviceType, param, onSuccess, onError);
		//}
		this.callApi("/client?p=/software/queryProductList&_"+serviceType+"&_"+timestamp, param, onSuccess, onError);
	},
	listProducts : function(serviceType,page,timestamp,onSuccess,onError){
		var param = {"id": serviceType, "page": page, "pagesize": this.pagesize};
		//if(timestamp){
		//	this.callApi("/client?p=/software/queryProductList&_"+serviceType+"&_"+timestamp, param, onSuccess, onError);
		//}else{
		//	this.callApi("/client?p=/software/queryProductList&_"+serviceType, param, onSuccess, onError);
		//}
		this.callApi("/client?p=/software/queryProductList&_"+serviceType+"&_"+timestamp, param, onSuccess, onError);
	}
};
/**
 * 获取产品详情
 */
com.skyform.service.shopprodetailService = {
	callApi : com.skyform.service.callPostSyncApi,
	getProductDetail : function(productId,onSuccess,onError){
		var param = {"id": productId};
		this.callApi("/client?p=/product/getProductDetail", param, onSuccess, onError);
	},
	getPmMuPrtyConfigInfoForSoftwareByProdId :function(productId,onSuccess, onError){
		var param = {"productId": Number(productId)};
		this.callApi("/client?p=/getPmMuPrtyConfigInfoForSoftwareByProdId", param, onSuccess, onError);
	}
};

/**
 * 软件产品开通
 */
com.skyform.service.shopproorderService = {
	callApi : com.skyform.service.callPostSyncApi4Yaxin,
	appVmSubscribe : function(instance,onSuccess,onError){
		this.callApi("/trade/appVmSubscribe",instance,onSuccess,onError);
	},
	getPrtyConfig : function(params,onSuccess,onError){
		this.callApi("/prtyConfig/getPrtyConfig",params,onSuccess,onError);
	},
	specProductOrder : function(result){
		var dom = "<div>"+result.msg+"</div>";
		var messageModal = null;
		if(messageModal==null){
			messageModal = new com.skyform.component.Modal(new Date().getTime(),"<h3>软件超市</h3>",
				dom,{
				buttons : [
						   {name:'关闭',
						   onClick:function(){
							   messageModal.hide();
						   },
						   attrs:[{name:'class',value:'btn'}]}
						   ],
				beforeShow : function(){
				},
				afterShow : function(){

				}
			});
		}
		messageModal.setContent(dom);
		messageModal.setWidth(500).setTop(150).show();
	},
	//订购
	createAccessSubscription : function(params, onSuccess,onError) {
		this.callApi("/createAccessSubscription",params,onSuccess,onError);
	},
	//竣工
	accessOrderSubmit : function(_tradeId, onSuccess,onError) {
		var params = {"tradeId": _tradeId};
		this.callApi("/accessOrderSubmit",params,onSuccess,onError);
	},
	//查询订单价格
	queryAccessCaculateFeeByPrtyList :function(params,onSuccess,onError){
		this.callApi("/queryAccessCaculateFeeByPrtyList",params,onSuccess,onError);
	},
	//查询
	queryAccessSubscription:function(params,onSuccess,onError){
		params.loginName=currentUserName;
		this.callApi("/queryAccessSubscription",params,onSuccess,onError);
	},
	queryBalance : function(fee,tradeId,onSuccess,onError){
		var _balance = 0;
		var noCashBalance = 0;
		Dcp.biz.apiRequest("/account/queryBalance",{},function(data) {
			var state = data.code;
			if(state == 0){
				// 余额 单位厘
				_balance = data.data[0].Balance;
				// 换算成元
				_balance = _balance/1000;
				noCashBalance = data.data[0].noCashBalance;
				noCashBalance = noCashBalance/1000;
				// 四舍五入保留两位小数
				var _remain = noCashBalance+_balance-fee;
				_remain = Math.round(_remain*Math.pow(10,2))/Math.pow(10,2);
				if(_remain<0){
					var html = $('<div class="control-group forFee"><label for="" class="control-label">余额不足,完成该笔订单还需充值<strong style="color: #ff945c">'+-_remain+'</strong>元,您确定充值吗?</label>' +
							'<div class="controls"style="font-size: 14px;font-weight: normal;">应付金额：<span style="color: #ff945c;font-size: 14px;font-weight: 400;">'+fee+'</span>元' +
							'<br>现金余额：<span class="money" style="color: #ff945c;font-size: 14px;font-weight: 400;">'+_balance+'</span>元<br> 代金券：<span style="color: #ff945c;font-size: 14px;font-weight: 400;">' +noCashBalance+
							'</span>元</div></div>');
					var confirmModal_balance = new com.skyform.component.Modal(new Date().getTime(),Dict.val("common_confirming_recharge"),html.html(),{
						buttons : [
							{
								name : Dict.val("common_confirming_recharge"),
								onClick : function(){
									window.location = "/portal/jsp/user/balance.jsp";
								},
								attrs : [
									{
										name : 'class',
										value : 'btn btn-primary'
									}
								]
							},
							{
								name : Dict.val("common_cancel"),
								attrs : [
									{
										name : 'class',
										value : 'btn'
									}
								],
								onClick : function(){
									confirmModal_balance.hide();
								}
							}
						]
					});
					confirmModal_balance.setWidth(500).autoAlign();
					confirmModal_balance.show();
				}else{
					var html = $('<div class="control-group forFee"><label for="" class="control-label"></label>' +
							'<div class="controls"style="font-size: 14px;font-weight: normal;">应付金额：<span style="color: #ff945c;font-size: 14px;font-weight: 400;">'+fee+'</span>元' +
							'<br>现金余额：<span class="money" style="color: #ff945c;font-size: 14px;font-weight: 400;">'+_balance+'</span>元<br> 代金券：<span style="color: #ff945c;font-size: 14px;font-weight: 400;">' +noCashBalance+
							'</span>元</div></div>');
					var confirmModal_submit = new com.skyform.component.Modal(new Date().getTime(),Dict.val("common_confirming_debit"),html.html(),{
						buttons : [
							{
								name : Dict.val("common_determine"),
								onClick : function(){
									confirmModal_submit.hide();
									$.growlUI("提示", "软件订购提交中!");
									$.blockUI();
									com.skyform.service.shopproorderService.accessOrderSubmit(tradeId,function onCreated(success){
										$.unblockUI();
										$.growlUI("提示", "软件订购成功!");
									}, function (error) {
										$.unblockUI();
										$.growlUI("错误", error.msg);
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
								name : Dict.val("common_cancel"),
								attrs : [
									{
										name : 'class',
										value : 'btn'
									}
								],
								onClick : function(){
									confirmModal_submit.hide();
								}
							}
						]
					});
					confirmModal_submit.setWidth(500).autoAlign().setTop(180);
					confirmModal_submit.show();
				}
			}
			else if(state == -1){
				alert(Dict.val("common_accounting_information_not_exist"));
				return;
			}
		});
	}
};
com.skyform.service.softWareService={
		callApi : com.skyform.service.callApi,
		callSyncApi:com.skyform.service.callSyncApi,
		queryAccessSubscription:function(params,onSuccess,onError){
			params.loginName=currentUserName;
			this.callApi("/queryAccessSubscription",params,onSuccess,onError);
		},
        //订单信息
		returnOpenInfo:function(params,onSuccess,onError){
			//params.purchaserName=currentUserName;
			this.callApi("/software/returnOpenInfo",params,onSuccess,onError);
		}
};
