//10.10.242.180
var CommonEnum = {
		serviceType:{"vm":1001,"vdisk":1002,"lb":1003,"ip":1006,"route":1008,"subnet":1009,"obs":1012,"nas":1013},
		billTypes:com.skyform.service.BillService.getBillType(),
		looptypes:{"LEAST_CONNECTIONS":"最少链接","ROUND_ROBIN":"轮循","SOURCE_IP":"源IP"}
};
var ctx = CONTEXT_PATH;
var orderDetail = {
	datatable : new com.skyform.component.DataTable(),
	instances : [],
	service : com.skyform.service.channelService,
	init : function() {
		var orderid = $("#orderid").val();
		var totalPrice = $("#totalPrice").val();
		orderDetail.describeOrder(orderid,totalPrice);
	},
	describeOrder : function(orderid,totalPrice) {
		var datas = {
				orderId : orderid,
				totalPrice : totalPrice
		};
		orderDetail.service.channeldetail(datas,function onSuccess(data){
			var order = data[0];
			orderDetail.datatable.renderByData("#detailTable", {
				//"bDestroy": true,
				"data" : data[0].orderDetail,
				"pageSize": 5,
				"onColumnRender" : function(columnIndex,columnMetaData,columnData) {
					 var text = columnData[''+columnMetaData.name] || "";
					 if(data[0].status!=1){
//						 $(".discount").hide();
//					     $(".discountPrice").hide();
//						 $(".agentId").hide();
						 $(".btn-success").hide();//隐藏支付按钮
						 if(data[0].status==2){
							 $("#chgTime").show();
							 $(".chgTime").show();
						 }
				     }
					 
					 if(columnIndex ==0) {
						 if(columnData.serviceType){
							 var productName = columnData.serviceType;
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

					 
					 if(columnIndex ==1) {
						 var instanceName = columnData.productDesc.instanceName;	
						 text = '<span name="instanceName">'+instanceName+'</span>';							 
					 }
					 if(columnIndex ==2) {
						 text = '<span name="instanceName">'+1+'</span>';	
					 }
					 if(columnIndex ==3) {
						 var productDesc = orderDetail.getConfigSpecification(columnData.productDesc,0,columnData.serviceType);
						 text = '<span name="productDesc">'+productDesc+'</span>';				 
					 }
					 if(columnIndex ==4) {
						 var period = columnData.period;	
						 text = '<span name="period">'+period+'</span>';							 
					 }
					 if(columnIndex ==5) {
						 var price = columnData.price;	
						 text = '<span name="price">'+price+'</span>';
					 }
					 if(data[0].status < 1){
						 if(columnIndex ==6) {
							 text = null;							 
						 }
						 if(columnIndex ==7) {
							 text = null;							 
						 }
					 }else{
						 if(columnIndex ==6) {
							 var discount = columnData.discount;
							 var price = columnData.price;	
							 var discountPrice = discount*price;
							 text = '<span name="discountPrice">'+discountPrice.toFixed(2)+'</span>';							 
						 } 
						 if(columnIndex ==7) {
							 var discount = columnData.discount;	
							 text = '<span name="discount">'+discount+'</span>';							 
						 } 
					 }
//					 if(columnIndex ==7) {
//						 var agentId = columnData.agentId;	
//						 text = '<span name="agentId">'+agentId+'</span>';							 
//					 }
					 return text;
				},
				"afterRowRender" : function(index,data,tr){					 
				},	
				"afterTableRender" : function() {
					$("#orderId").bind("click", function() {
						var y_fv = totalPrice;
			    		if(null != y_fv && "" != y_fv && y_fv > 0) {
			    			// 四舍五入保留两位小数
			    			y_fv = Math.round(y_fv*Math.pow(10,2))/Math.pow(10,2);
			    		}else {
			    			y_fv = 0;
			    		}
			    		orderDetail.confSubmit(order,y_fv);
					});
				}
			});
			//订单编号
			var orderId = data[0].orderId;
			$("#tradeidshow").html(orderId);
			//创建订单时间
			var createDate =  data[0].createTime;
			var created = new Date(createDate).format("yyyy-MM-dd hh:mm:ss");
			$("#createDate").html(created);
			//渠道商名称
			var agentId = data[0].agentId;
			$("#agentId").html(agentId);
			//订单金额
			var feeValue = data[0].totalPrice;
			$(".feeValue").html(feeValue.toFixed(2)+"元");
		 });
	},
	//配置规格 orderDetail.getConfigSpecification(data[0].orderDetail[0].productDesc,0,data[0].orderDetail[0].serviceType);
	getConfigSpecification : function(templateData,billType,serviceType) {
		//var serviceType = templateData.serviceType;
		//var orderType = templateData.orderType;
		
		//var code = CommonEnum.serviceType[serviceType];
		var value = "";
//		if(tradeType == 'A'){//购买订单
		switch (serviceType) {
		case 1001://弹性云主机
			value = orderDetail.showAVMDetail(templateData,billType,"1001");
			break;
		case 1003://弹性负载均衡
			value = orderDetail.showABlanceDetail(templateData);
			break;
		case 1002://弹性块存储
			value = orderDetail.showAVdiskDetail(templateData);
			break;
		case 1006://公网带宽			
			value = orderDetail.showAIpDetail(templateData);
			break;
		case 1013://文件存储
			value = orderDetail.showANasDetail(templateData);
			break;
		case 1012://对象存储
			value = orderDetail.showAObsDetail(templateData);
			break;
		case 1008://路由器
			value = orderDetail.showARouteDetail(templateData);
			break;
		case 1009://虚拟私有云
			value = orderDetail.showASubnetDetail(templateData);
			break;
		case '1017':
			value = orderDetail.showABackupDetail(templateData);
			break;
		}
//	}else if(tradeType == 'M'){//修改订单
//		
//		
//	}else if(tradeType == 'R'){//退订订单
//		
//	}
		if(value != ""){
			  $("#cms").empty();//此时为div
			  var specarr = value.split(',');
			  if(specarr){
			    $(specarr).each(function(index, v) {
				$("#cms").append('<span>'+v+'</span><br/>');
           });
		}
	 }
		
		return value;
	},
	initJsonServiceType : function(data){//待完成
		var text = '';
		if(data&&data.length>0){				
			$(data).each(function(i,item){
				switch(item.serviceType){							
					case 0: text += '"0":"包月"';break;
					case 3: 
						if(text.length>0){
							text +=',';
						}
						text += '"3":"包年"';
						break;
					case 4: 
						if(text.length>0){
							text +=',';
						}
						text += '"4":"后付费"';
						break;
					case 5: 
						if(text.length>0){
							text +=',';
						}
						text += '"5":"VIP"';
						break;
				}					
			});						
		}
		return $.parseJSON("{"+text+"}");
	},
	showAVMDetail:function(templateData,billType,serviceType){
		var value="";
		var cpunum = "";
		var memorySize = "";
		var os = "";
		if(templateData){
			var vm =  templateData;
			if(vm.cpuNum){
				cpunum = "CPU核数："+ vm.cpuNum+ "核,  " || "";
			}
			if(vm.memorySize){
				memorySize =  "内存："+vm.memorySize+"GB," || "";
			}
			if(vm.OS){
	         	   com.skyform.service.BillService.queryProductPrtyInfo(billType,"vm",function(data){
	          			if( null != data){	
//	          				data = {"oslist":[{"osDiskSizeMin":20,"value":"5","desc":"CentOS6.3 64位"},{"osDiskSizeMin":20,"value":"1","desc":"CentOS6.4 64位"},{"osDiskSizeMin":20,"value":"6","desc":"CentOS6.5 64位"},{"osDiskSizeMin":50,"value":"2","desc":"Windows Server 2003 企业版 32位"},{"osDiskSizeMin":50,"value":"3","desc":"Windows Server 2008 R2 标准版 64位"},{"osDiskSizeMin":50,"value":"19","desc":"Windows Server 2008 R2 数据中心版 64位"},{"osDiskSizeMin":50,"value":"20","desc":"Windows Server 2012 R2 数据中心版 64位"},{"osDiskSizeMin":50,"value":"21","desc":"Windows Server 2012 R2 标准版 64位"},{"osDiskSizeMin":50,"value":"22","desc":"Ubuntu14.04 Server CN 64位"}],"vmConfig":[{"value":"1","memory":[{"value":"0.5","vmPrice":"1","discount":"","name":"其他配置","desc":"512M","osDisk":"50","productId":""},{"value":"1","vmPrice":"1","discount":"","name":"其他配置","desc":"1G","osDisk":"80","productId":""},{"value":"2","vmPrice":"1","discount":"","name":"其他配置","desc":"2G","osDisk":"80","productId":""},{"name":"其他配置","desc":"4G","value":"4","discount":"","productId":""}],"desc":"1核"},{"value":"2","memory":[{"name":"其他配置","desc":"1G","value":"1","discount":"","productId":""},{"value":"2","vmPrice":"1","discount":"","name":"其他配置","desc":"2G","osDisk":"150","productId":""},{"value":"4","vmPrice":"1","discount":"","name":"其他配置","desc":"4G","osDisk":"150","productId":""},{"name":"其他配置","desc":"8G","value":"8","discount":"","productId":""}],"desc":"2核"},{"value":"4","memory":[{"name":"其他配置","desc":"2G","value":"2","discount":"","productId":""},{"value":"4","vmPrice":"1","discount":"","name":"其他配置","desc":"4G","osDisk":"220","productId":""},{"value":"8","vmPrice":"1","discount":"","name":"其他配置","desc":"8G","osDisk":"220","productId":""},{"name":"其他配置","desc":"12G","value":"12","discount":"","productId":""},{"name":"其他配置","desc":"16G","value":"16","discount":"","productId":""}],"desc":"4核"},{"value":"8","memory":[{"name":"其他配置","desc":"4G","value":"4","discount":"","productId":""},{"value":"8","vmPrice":"1","discount":"","name":"其他配置","desc":"8G","osDisk":"330","productId":""},{"name":"其他配置","desc":"12G","value":"12","discount":"","productId":""},{"value":"16","vmPrice":"1","discount":"","name":"其他配置","desc":"16G","osDisk":"330","productId":""},{"name":"其他配置","desc":"24G","value":"24","discount":"","productId":""},{"name":"其他配置","desc":"32G","value":"32","discount":"","productId":""}],"desc":"8核"},{"value":"12","memory":[{"name":"其他配置","desc":"32G","value":"32","discount":"","productId":""}],"desc":"12核"}],"productId":201}
	          				var oslist = data.oslist;
	          				$(oslist).each(function(index, system) {
	          					if(system.value == vm.OS){
	          						os = "镜像："+system.desc || "";
	          					}
	          				});
	          			}		
	          		});					
			}				
			var osdisk = "";
			var band_width = "";
			var gateway = "";
			var storageSize = "";			
			value = cpunum + memorySize+ osdisk +band_width+gateway+storageSize+os;
			$(templateData).each(function(index, item) {
				if(item.storageSize){
					storageSize = "磁盘容量："+item.storageSize+"G"|| "";
					value +="<br/>"+storageSize;
				}
			});
			
		}
		return value;
	},
	showABlanceDetail : function(templateData){
		var value="";
		var port = "";
		var protocol = "";
		var looptype = "";			
		if(templateData){
			port = "监听端口："+templateData.port+",";
			protocol = "监听协议："+templateData.protocol+",";
			looptype="均衡方式："+CommonEnum.looptypes[templateData.looptype];
			value =port+protocol+looptype;
		}
		return value;
	},
	showAVdiskDetail : function(templateData){
		var value = "";
		if(templateData){
			var size = templateData.storageSize;
			value = "磁盘容量："+size+"G";
		}
		return value;
	},
	showAIpDetail : function(templateData){
		var value = "";
		if(templateData){
			var band_width = "";
			var bd = templateData.BAND_WIDTH;
			band_width = "带宽："+bd+"M";
			value = band_width;
		}			
		return value;
	},
	showANasDetail : function(templateData){
		var value = "";
//		var storageSize = "";
		var allCatalogueName = "";
//		storageSize = "数据盘："+arritem[1]+"G,";
		if(templateData){
			allCatalogueName = "目录全名："+templateData.allCatalogueName;
			value = storageSize+allCatalogueName;
		}
		return value;
	},
	showAObsDetail : function(templateData){
		var value = "";
//		var storageSize = "";
//		if(templateData){				
//			storageSize = "数据盘："+templateData.storageSize+"G";
//			value = storageSize;
//		}
		return value;
	},
	showARouteDetail : function(templateData){
		var value="";
		var BAND_WIDTH = "";
		if(templateData){
			var route = templateData;
			$(templateData).each(function(index, item) {
				if(item.BAND_WIDTH){
					value = "带宽："+item.BAND_WIDTH+"M"|| "";
				}
			});
			//value = bank_withd+routerPrice;
		}
		return value;
	},
	showASubnetDetail:function(templateData){
		var value="";
		var startip = "";
		var endip = "";
		var gateway = "";
		var netmask = "";

		if(templateData){
			startip = "网段起点："+templateData.startip+",";
			endip = "网段终点："+templateData.endip+",";
			gateway = "网关："+templateData.gateway+",";
			netmask = "子网掩码："+templateData.netmask;
			value = startip+endip+gateway+netmask;
		}
		return value;
	},
	showABackupDetail:function(templateData){
		var value="";
		var vmid = "";
		if(templateData){
			vmid = "虚拟机ID："+templateData.vmid;
			value = vmid;
		}
		return value;
	},
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
													//orderDetail.describeOrder(orderid,totalPrice);
													 $(".btn-success").hide();
												},function onError(msg){
													orderDetail.submitError(tradeId);
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
													//orderDetail.describeOrder(orderid,totalPrice);
													 $(".btn-success").hide();
												},function onError(msg){
													orderDetail.submitError(tradeId);
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
													//orderDetail.describeOrder(orderid,totalPrice);
													 $(".btn-success").hide();
												},function onError(msg){
													orderDetail.submitError(tradeId);
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
													//orderDetail.describeOrder(orderid,totalPrice);
													 $(".btn-success").hide();
												},function onError(msg){
													orderDetail.submitError(tradeId);
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
													//orderDetail.describeOrder(orderid,totalPrice);
													 $(".btn-success").hide();
												},function onError(msg){
													orderDetail.submitError(tradeId);
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
													//orderDetail.describeOrder(orderid,totalPrice);
													 $(".btn-success").hide();
												},function onError(msg){
													orderDetail.submitError(tradeId);
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
													//orderDetail.describeOrder(orderid,totalPrice);
													 $(".btn-success").hide();
												},function onError(msg){
													orderDetail.submitError(tradeId);
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
													//orderDetail.describeOrder(orderid,totalPrice);
													 $(".btn-success").hide();
												},function onError(msg){
													orderDetail.submitError(tradeId);
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
//		
//		$.growlUI("提示", "申请已提交，扣款失败！1秒后将跳转到普通订单，您可以继续支付订单："+tradeId+"！");
//		setTimeout(function(){
//			var url = ctx+"/jsp/unicompany/myOrder.jsp?code=order&&cataCode=consume";
//			window.location.assign(url);
//		},1000);
	}	
};

		
$(function(){
	// var mytable = new com.skyform.component.DataTable().renderFromTable("#orderTable");
	orderDetail.init();
});

