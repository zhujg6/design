//10.10.242.180

//window.Controller = {
//		init : function(){
//			order.init();
//			// 查询虚拟硬盘列表
//			order.describeOrder();
//		}
//	};
var channelState={0:"待批价",1:"待支付",2:"已驳回",3:"已完成",4:"已撤销",5:"已预订"};
var ctx = CONTEXT_PATH;
function getChannelState(index){
	var value = "";
	$.each(channelState, function(i,text) {
		if(i==index){
			value = text;
			return false;
		}		
	});
	return value;
}
var order = {
	datatable : new com.skyform.component.DataTable(),
	instances : [],
	service : com.skyform.service.channelService,
	init : function() {
		order.describeOrder();
	},
	// 查询渠道订单列表
	describeOrder : function() {
		order.service.channelOrder(function onSuccess(data){
			order.instances = data;
			order.generateTable(data);		
		},function onError(){
			$.growlUI("提示", "查询渠道订单发生错误："); 
		});
	},
	generateTable : function(data){
		 order.datatable.renderByData("#orderTable", {
				"data" : data,				
				"pageSize" : 5,
				"bSort" : false,
				"onColumnRender" : function(columnIndex,columnMetaData,columnData) {
					 var text = columnData[''+columnMetaData.name] || "";
					 if(columnMetaData.name=='id') {
						 //text =  columnData.orderId;
						 
						 text = '<a  href="channelOrderDetail.jsp?code=channelOrder&cataCode=consume&orderId='+columnData.orderId+'&totalPrice='+columnData.totalPrice+'">'+columnData.orderId+'</a>';
					 }
					
					 if(columnMetaData.name=='type')  {
						 if(columnData.orderDetail[0].serviceType){
							 var productName = columnData.orderDetail[0].serviceType;
								var serviceType;
									if(productName == "1001"){
										serviceType = "弹性云主机";//1001
									}else if(productName =="1003"){
										serviceType = "弹性负载均衡";//1003
									}else if(productName =="1002"){
										serviceType = "弹性块存储";//1002
									}else if(productName =="1006"){
										serviceType = "公网带宽";//1006
									}else if(productName =="1013"){
										serviceType = "文件存储";//1013
									}else if(productName =="1012"){
										serviceType = "对象存储";//1012
									}else if(productName =="1008"){
										serviceType = "路由器";//1008
									}else if(productName =="1009"){
										serviceType = "私有网络";//1009
									}
							 text = '<span name="serviceType">'+serviceType+'</span>';
						 }else{
							 text = "";
						 }
						
					 }
					 if(columnMetaData.name=='fee')  {
			        		var yumoney = columnData.originalPrice;
			        		if(null != yumoney && "" != yumoney && yumoney > 0) {
			        			// 换算成元columnData.orderDetail[0].price
			        			//yumoney = yumoney/1000;
			        			// 四舍五入保留两位小数
			        			yumoney = Math.round(yumoney*Math.pow(10,2))/Math.pow(10,2);
			        			text = yumoney;
			        		}else {
			        			text = "";
			        		}
					 }
					 if(columnMetaData.name=='discountFee') {
			        		var yumoney = columnData.totalPrice;
			        		if(null != yumoney && "" != yumoney && yumoney > 0) {
			        			// 换算成元columnData.orderDetail[0].price
			        			//yumoney = yumoney/1000;
			        			// 四舍五入保留两位小数
			        			yumoney = Math.round(yumoney*Math.pow(10,2))/Math.pow(10,2);
			        			text = yumoney;
			        		}else {
			        			text = "";
			        		}
					 }
					 if(columnMetaData.name=='state') {
						 var state = columnData.status;
						 if(5==state){
							 text = "<a href="+ctx+"/jsp/unicompany/myOrder.jsp?code=order&&cataCode=consume>"+getChannelState(state)+"</a>";	
						 }
						 else text = getChannelState(state);						 
					 }
					 if(columnMetaData.name=='createTime') {
						 var crtDate = columnData.createTime;
						 
						 if(null != crtDate && "" != crtDate && crtDate > 1) {
							 text =  new Date(crtDate).format("yyyy-MM-dd hh:mm:ss");
							 // text = new Date(text).format("yyyy-MM-dd hh:mm:ss");
							 // text = crtDate.substr(0,4) + "-" + crtDate.substr(4,2) + "-" + crtDate.substr(6,2) + " " + crtDate.substr(8,2) + ":" + crtDate.substr(10,2) + ":" + crtDate.substr(12,2);
						 }else{
							 text = ""; 
						 }
					 }
//					 if(columnIndex ==5) {
//						 var payDateM = columnData.payDate;
//						 if(null != payDateM && "" != payDateM && payDateM > 1) {
//							 var pdt = new Date(payDateM).format("yyyy-MM-dd hh:mm:ss");
//							 text = '<span name="payDateM">'+pdt+'</span>';
//							 // text = new Date(text).format("yyyy-MM-dd hh:mm:ss");
//							//  text = payDateM.substr(0,4) + "-" + payDateM.substr(4,2) + "-" + payDateM.substr(6,2) + " " + payDateM.substr(8,2) + ":" + payDateM.substr(10,2) + ":" + payDateM.substr(12,2);
//						 }else{
//							 text = '<span name="payDateM"></span>'; 
//						 }
//					 }
					 if(columnMetaData.name=='opt') {
						 text = '<input type="button" name="orderId" class="btn btn-success"  value="支付">';
						 // text = '<a href="#" onclick="javascript:confSubmit();" class="btn btn-success" style="text-decoration: none"></a>';
					 }
					 return text;
				}, 
				"afterRowRender" : function(rowIndex,data,tr){
					// tr.attr("state", data.state).attr("comment", data.comment);
					// tr.attr("ownUserId", data.ownUserId);
					var state = data.status;
					if(1 == state) {
						$(tr).find("input[type='button']").bind("click", function() {
							var y_fv = data.orderDetail[0].price;
			        		if(null != y_fv && "" != y_fv && y_fv > 0) {
			        			// 换算成元
			        			//y_fv = y_fv/1000;
			        			// 四舍五入保留两位小数
			        			y_fv = Math.round(y_fv*Math.pow(10,2))/Math.pow(10,2);
			        		}else {
			        			y_fv = 0;
			        		}
							order.confSubmit(data,y_fv);
						});
					}else{
						$(tr).find("input[type='button']").css("display","none");
					}
					if(3 != state) {
						$(tr).find("span[name='payDateM']").html("");
					}
					// 将文件存储改成对象存储，因亚联的人不在，所以在页面临时处理，年后与亚联再修改
					var proName = data.agentId;
//					if("文件存储" == proName) {
//						$(tr).find("span[name='agentId']").html("对象存储");
//					}
				},
				"afterTableRender" : function() {
					// order.bindEvent();
				}
		});
	},
	
//	describeOrder : function(){
//		var _usrAccount = userAccunt;
//		var _token = token;
//		var datas = {
//				// loginName:usrAccount
//				token : _token
//		};
//		//将自己编写的显示主机的table渲染
//		//Dcp.biz.apiAsyncRequest("/user/describeOrder", datas, function(data) {
//		Dcp.biz.apiAsyncRequest("/trade/queryTradeDetailInfoByName", datas, function(data) {
//			if (data.code != "0") {
//				$.growlUI("数据查询错误"); 
//			} else {				
//				 order.generateTable(data.data);
//			}
//		},function onError(){
//			order.generateTable();
//		});		
//	},
	// 确认支付的逻辑
	confSubmit : function (data,feeValue) {
		var _orderId = data.orderId;
		var _balance = order.queryBalance();
		if(null != _balance && "" != _balance && "-1" != _balance) {
			if(_balance < feeValue) {
				var confirmModal_balance = new com.skyform.component.Modal(new Date().getTime(),"确定充值","余额不足, 您确定充值吗?",{
					buttons : [
								{
									name : "确定",
									onClick : function(){
										window.location = CONTEXT_PATH + "/jsp/user/balance.jsp";
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
										confirmModal_balance.hide();
									}
								}
							]					
				});
				confirmModal_balance.setWidth(500).autoAlign();
				confirmModal_balance.show();										
			}else {
				// 余额充足，你确定扣款么
				var confirmModal_submit = new com.skyform.component.Modal(new Date().getTime(),"确定扣款","您确定扣款吗?",{
					buttons : [
								{
									name : "确定",
									onClick : function(){
										var st = data.orderDetail[0].serviceType;
										var channel_st = com.skyform.service.channelService.channel_st;
										
										if("1008" == st){
											$(data.orderDetail).each(function(i,item){
												channel_st.productList[i] = item.productDesc;
											});
										}
										else if("1001" == st){
											$(data.orderDetail).each(function(i,item){
												channel_st.productList[i] = item.productDesc;
											});
										}
										
										else channel_st.productList[0] = data.orderDetail[0].productDesc;
										
										
										channel_st.period = data.orderDetail[0].period;										
										channel_st.productList[0].orderId = data.orderId;
										
										
										if(st == "1001"){
											Dcp.biz.apiRequest("/trade/vmSubscribe", channel_st, function(data) {
												//订单提交成功后校验用户余额是否不足
												var tradeId = data.tradeId;
												order.tradeSubmit(tradeId,function onSuccess(data){
													$.growlUI("提示", "扣款成功, 请耐心等待开通服务...");
													order.updateDataTable();
												},function onError(msg){
													order.submitError(tradeId);													
												});
												confirmModal_submit.hide();
											},function onError(msg){
												$.growlUI("提示", "申请虚拟机提交失败：" + msg);
											});
										}else if(st == "1006"){	
											Dcp.biz.apiRequest("/trade/eipSubscribe", channel_st, function(data) {
												//订单提交成功后校验用户余额是否不足
												var tradeId = data.tradeId;	
												order.tradeSubmit(tradeId,function onSuccess(data){
													$.growlUI("提示", "扣款成功, 请耐心等待开通服务...");
													order.updateDataTable();
												},function onError(msg){
													order.submitError(tradeId);
												});
												confirmModal_submit.hide();
											},function onError(msg){
												$.growlUI("提示", "申请公网带宽提交失败：" + msg);
											});
										}else if(st == "1002"){
											Dcp.biz.apiRequest("/instance/ebs/volumSubscribe", channel_st, function(data) {
												//订单提交成功后校验用户余额是否不足
												var tradeId = data.data.tradeId;	
												order.tradeSubmit(tradeId,function onSuccess(data){
													$.growlUI("提示", "扣款成功, 请耐心等待开通服务...");
													order.updateDataTable();
												},function onError(msg){
													order.submitError(tradeId);
												});
												confirmModal_submit.hide();
											},function onError(msg){
												$.growlUI("提示", "申请弹性块存储提交失败：" + msg);
											});
										}else if(st == "1003"){
											Dcp.biz.apiRequest("/trade/lbSubscribe", channel_st, function(data) {
												//订单提交成功后校验用户余额是否不足
												var tradeId = data.data.tradeId;	
												order.tradeSubmit(tradeId,function onSuccess(data){
													$.growlUI("提示", "扣款成功, 请耐心等待开通服务...");
													order.updateDataTable();
												},function onError(msg){
													order.submitError(tradeId);
												});
												confirmModal_submit.hide();
											},function onError(msg){
												$.growlUI("提示", "申请弹性负载均衡提交失败：" + msg);
											});
										}else if(st == "1008"){
											Dcp.biz.apiRequest("/trade/createRouter", channel_st, function(data) {
												//订单提交成功后校验用户余额是否不足
												var tradeId = data.data.tradeId;	
												order.tradeSubmit(tradeId,function onSuccess(data){
													$.growlUI("提示", "扣款成功, 请耐心等待开通服务...");
													order.updateDataTable();
												},function onError(msg){
													order.submitError(tradeId);
												});
												confirmModal_submit.hide();
											},function onError(msg){
												$.growlUI("提示", "申请路由器提交失败：" + msg);
											});
										}else if(st == "1009"){
											Dcp.biz.apiRequest("/subnet/addSubnet", channel_st, function(data) {
												//订单提交成功后校验用户余额是否不足
												var tradeId = data.tradeId;	
												order.tradeSubmit(tradeId,function onSuccess(data){
													$.growlUI("提示", "扣款成功, 请耐心等待开通服务...");
													order.updateDataTable();
												},function onError(msg){
													order.submitError(tradeId);
												});
												confirmModal_submit.hide();
											},function onError(msg){
												$.growlUI("提示", "申请私有网络提交失败：" + msg);
											});
										}
										else if(st == "1012"){
											Dcp.biz.apiRequest("/instance/obs/createObsVolumes", channel_st, function(data) {
												//订单提交成功后校验用户余额是否不足
												var tradeId = data.tradeId;	
												order.tradeSubmit(tradeId,function onSuccess(data){
													$.growlUI("提示", "扣款成功, 请耐心等待开通服务...");
													order.updateDataTable();
												},function onError(msg){
													order.submitError(tradeId);
												});
												confirmModal_submit.hide();
											},function onError(msg){
												$.growlUI("提示", "申请对象存储提交失败：" + msg);
											});
										}
										else if(st == "1013"){
											Dcp.biz.apiRequest("/instance/nas/createNasVolumes", channel_st, function(data) {
												//订单提交成功后校验用户余额是否不足
												var tradeId = data.tradeId;	
												order.tradeSubmit(tradeId,function onSuccess(data){
													$.growlUI("提示", "扣款成功, 请耐心等待开通服务...");
													order.updateDataTable();
												},function onError(msg){
													order.submitError(tradeId);
												});
												confirmModal_submit.hide();
											},function onError(msg){
												$.growlUI("提示", "申请文件存储提交失败：" + msg);
											});
										}
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
										confirmModal_submit.hide();
									}
								}
							]					
				});
				confirmModal_submit.setWidth(500).autoAlign();
				confirmModal_submit.show();										
			}
		}
	},
	submitError:function(tradeId){		
		ConfirmWindow.setTitle("提示")
		.setContent("申请已提交，扣款失败！您可以跳转到普通订单，继续支付订单：<strong class='text-error'>"+tradeId+"</strong>！")
		.onSave = function(){
			ConfirmWindow.hide();
			var url = ctx+"/jsp/unicompany/myOrder.jsp?code=order&&cataCode=consume";
			window.location.assign(url);
		};
		ConfirmWindow.show();
//		$.growlUI("提示", "申请已提交，扣款失败！1秒后将跳转到普通订单，您可以继续支付！");
//		setTimeout(function(){
//			var url = ctx+"/jsp/unicompany/myOrder.jsp?code=order&&cataCode=consume";
//			window.location.assign(url);
//		},1000);
	},
	
	// 刷新Table
	updateDataTable : function() {
		Dcp.biz.apiRequest("/instance/agent/getCustAmOrder", {}, function(data) {
			if (data.code == 0) {
				order.instances = data.data;
				order.datatable.updateData(data.data);
			}
		},function onError(msg){
			$.growlUI("提示", "数据加载失败..............：" + msg);
		});
	},
	// 确定支付
	tradeSubmit : function(tradeId,onSuccess,onError){
		var params = {
				"tradeId" : tradeId
		};
		var api = "/trade/Submit";
		Dcp.biz.apiRequest(api,params || {},function(result){
			if(result.code ==0) {
				if(onSuccess) {
					$.growlUI("提示","申请已提交，请等待...");
					onSuccess(result.data);
				}
			}else if (onError) {				
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
	},
	// 查询余额
	queryBalance : function(){
		var _balance = 0;
  		Dcp.biz.apiRequest("/account/queryBalance",{},function(data) {
        	var state = data.code;
        	if(state == 0){
        		// 余额 单位厘
        		_balance = data.data.balance;       		
        		// 换算成元
        		_balance = _balance/1000;       		
        		// 四舍五入保留两位小数
        		_balance = Math.round(_balance*Math.pow(10,2))/Math.pow(10,2);  
			}
        	else if(state == -1){
        		alert("用户帐务信息不存在, 请联系管理员");
        		_balance = "-1";
//        		$.growlUI("提示", "用户帐户信息不存在, 请联系管理员");
//        		result = false;
        	}
  		});
		return _balance;
	},
	// 判断钱是否足够
	/*isBalanceEnough : function(orderId,onSuccess,onError){
		var params = {
				"orderId" : orderId
		};
		
		var api = "/trade/Submit";
		Dcp.biz.apiRequest(api,params || {},function(result){
			if(result.code ==0) {
				if(onSuccess) {
					onSuccess(result);
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
		
		
		
//		this.callSyncApi("/trade/Submit", params, onSuccess, onError);		
	}*/
};
		
$(function(){
	// var mytable = new com.skyform.component.DataTable().renderFromTable("#orderTable");
	order.init();
});
