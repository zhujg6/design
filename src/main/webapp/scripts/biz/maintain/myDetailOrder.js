//10.10.242.180
var CommonEnum = {
		serviceType:{"vm":1001,"vdisk":1002,"lb":1003,"ip":1006,"route":1008,
			"subnet":1009,"obs":1012,"nas":1013,"snap":1017,"image":1018},
		billTypes:com.skyform.service.BillService.getBillType(),
		looptypes:{"LEAST_CONNECTIONS":"最少链接","ROUND_ROBIN":"轮循","SOURCE_IP":"源IP"}
}
var snapText = "快照";
var imageText = "云主机镜像";
var orderDetail = {
	init : function() {
		var tradeid = $("#tradeid").val();
		orderDetail.orderInfo(tradeid);
	},
	 orderInfo : function (tradeid) {
				var datas = {
						tradeId : tradeid
				};
				//将自己编写的显示主机的table渲染
				
				
//					Dcp.biz.apiAsyncRequest("/trade/getTradeInfoByTradeId", datas, function(data) {
//						if (data.code != "0") {
//							$.growlUI("数据查询错误"); 
//						} else {				
//							if(data != null){
//				            	 $("#tradeidshow").html(tradeid);			            	 
//				            	 var tradeType =data.data.tradeType;
//				            	 if(1017 == data.data.serviceType){
//				            		 tradeType = "A"; 
//				            	 }
//				            	 $("#tradeType").html(orderDetail.getOrderStatus(tradeType));
//				            	 //时间显示
//								var createDate =  data.data.createDate.replace(/(.{4})(.{2})(.{2})(.{2})(.{2})(.{2})/,'$1-$2-$3 $4:$5:$6');
//								$("#createDate").html(createDate);
//								$("#instanceName").html(data.data.instanceName);
//								var payDate = data.data.payDate;
//								if(payDate){
//									payDate = data.data.payDate.replace(/(.{4})(.{2})(.{2})(.{2})(.{2})(.{2})/,'$1-$2-$3 $4:$5:$6');
//								}
//								$("#payDate").html(payDate);
//								
//				            	 //订单类型和付款方式支付时间
//								 var billType = data.data.billType;
//								
//								
//								
//								var serviceType = data.data.serviceType;
//								
////								//TODO:数据虚拟
////									var productName = data.data.productName
////									if(productName == "弹性云主机"){
////										serviceType = "vm";
////									}else if(productName =="弹性负载均衡"){
////										serviceType = "lb";
////									}else if(productName =="弹性块存储"){
////										serviceType = "vdisk";
////									}else if(productName =="公网带宽"){
////										serviceType = "ip";
////									}else if(productName =="文件存储"){
////										serviceType = "nas";
////									}else if(productName =="对象存储"){
////										serviceType = "obs";
////									}else if(productName =="路由器"){
////										serviceType = "route";
////									}else if(productName =="私有网络"){
////										serviceType = "subnet";
////									}
//								 billType = CommonEnum.billTypes[billType]?CommonEnum.billTypes[billType]:"-";	
//								 $("#billType").html(billType);
//								 $("#productName").html(data.data.productName);
//								 var feeValue = data.data.feeValue /1000;
//								 $(".feeValue").html(feeValue.toFixed(2)+"元");
//								 $("#count").html(data.data.count);
//								 $("#period").html(data.data.period);
//								 
//								 orderDetail.getConfigSpecification(data.data.tradeDetailInfo,0,serviceType,tradeType);
//				            	 
//				             }
//						}
//					},function onError(){
//					});		
		 			var currentPool=$("#currentPool").val();
		 			if(currentPool=="huhehaote"){
						Dcp.biz.apiAsyncRequest("/trade/getTradeInfoByTradeId", datas, function(data) {
//						com.skyform.service.callAsyncApi4yaxin("/trade/queryTreadInfoById", datas, function(data) {
							if (data.code != "0") {
								$.growlUI("数据查询错误");
							} else {
								if(data != null){
									$("#tradeidshow").html(tradeid);
									var tradeType =data.data.tradeType;
									if(1017 == data.data.serviceType){
										tradeType = "A";
									}
									$("#tradeType").html(orderDetail.getOrderStatus(tradeType));
									//时间显示
									var date_CH=new Date(parseInt(data.data.createDate));
									var createDate=date_CH.getUTCFullYear()+"-"+(date_CH.getUTCMonth()+1)+"-"+date_CH.getDate()+"  ";
									var dateLast=date_CH.getHours()+":"+date_CH.getMinutes()+":"+date_CH.getSeconds();
//					            	 console.log(date_CH.getUTCFullYear()+"-"+(date_CH.getUTCMonth()+1)+"-"+date_CH.getDate()+":"+date_CH.getHours()+":"+date_CH.getMinutes()+":"+date_CH.getSeconds())
//									var date1=data.data.createDate;
//					            	 var createDate =  date1.replace(/(.{4})(.{2})(.{2})(.{2})(.{2})(.{2})/,'$1-$2-$3 $4:$5:$6');
//					            	 var createDate=new Date(data.data.createDate)
									$("#createDate").html(data.data.createDate.slice(0,4)+"-"+data.data.createDate.slice(4,6)+"-"+data.data.createDate.slice(6,8)+" "+data.data.createDate.slice(8,10)+":"+data.data.createDate.slice(10,12)+":"+data.data.createDate.slice(12,14));
									$("#instanceName").html(data.data.instanceName);
									var payDate = data.data.payDate||"";
									var createDate1="";
									var dateLast1="";
									if(payDate){
										var date_CH1=new Date(parseInt(data.data.payDate));
										createDate1=date_CH1.getUTCFullYear()+"-"+(date_CH1.getUTCMonth()+1)+"-"+date_CH1.getDate()+"  ";
										dateLast1=date_CH1.getHours()+":"+date_CH1.getMinutes()+":"+date_CH1.getSeconds();
//										payDate = data.data.payDate.replace(/(.{4})(.{2})(.{2})(.{2})(.{2})(.{2})/,'$1-$2-$3 $4:$5:$6');
									}
									if(payDate){
										$("#payDate").html(data.data.payDate.slice(0,4)+"-"+data.data.payDate.slice(4,6)+"-"+data.data.payDate.slice(6,8)+" "+data.data.payDate.slice(8,10)+":"+data.data.payDate.slice(10,12)+":"+data.data.payDate.slice(12,14));
									}


									//订单类型和付款方式支付时间
									var billType = data.data.billType;



									var serviceType = data.data.serviceType;

//									//TODO:数据虚拟
//										var productName = data.data.productName
//										if(productName == "弹性云主机"){
//											serviceType = "vm";
//										}else if(productName =="弹性负载均衡"){
//											serviceType = "lb";
//										}else if(productName =="弹性块存储"){
//											serviceType = "vdisk";
//										}else if(productName =="公网带宽"){
//											serviceType = "ip";
//										}else if(productName =="文件存储"){
//											serviceType = "nas";
//										}else if(productName =="对象存储"){
//											serviceType = "obs";
//										}else if(productName =="路由器"){
//											serviceType = "route";
//										}else if(productName =="私有网络"){
//											serviceType = "subnet";
//										}
									billType = CommonEnum.billTypes[billType]?CommonEnum.billTypes[billType]:"-";
									$("#billType").html(billType);
									$("#productName").html(data.data.productName);
									var feeValue = data.data.feeValue /1000;
									$(".feeValue").html(feeValue.toFixed(2)+"元");
									$(".realValue").html(feeValue.toFixed(2)+"元");
									$("#count").html(data.data.count);
									$("#period").html(data.data.period);

									orderDetail.getConfigSpecification(data.data.tradeDetailInfo,0,serviceType,tradeType);

								}
							}
						},function onError(){
						});
					}else{
						Dcp.biz.apiAsyncRequest("/trade/queryTreadDetailInfo", datas, function(data) {
//						com.skyform.service.callAsyncApi4yaxin("/trade/queryTreadInfoById", datas, function(data) {
							if (data.code != "0") {
								$.growlUI("数据查询错误");
							} else {
								if(data != null){
									$("#tradeidshow").html(tradeid);
									var tradeType =data.data.tradeType;
									if(1017 == data.data.serviceType){
										tradeType = "A";
									}
									$("#tradeType").html(orderDetail.getOrderStatus(tradeType));
									//时间显示
									var date_CH=new Date(parseInt(data.data.createDate));
									var createDate=date_CH.getUTCFullYear()+"-"+(date_CH.getUTCMonth()+1)+"-"+date_CH.getDate()+"  ";
									var dateLast=date_CH.getHours()+":"+date_CH.getMinutes()+":"+date_CH.getSeconds();
//					            	 console.log(date_CH.getUTCFullYear()+"-"+(date_CH.getUTCMonth()+1)+"-"+date_CH.getDate()+":"+date_CH.getHours()+":"+date_CH.getMinutes()+":"+date_CH.getSeconds())
//									var date1=data.data.createDate;
//					            	 var createDate =  date1.replace(/(.{4})(.{2})(.{2})(.{2})(.{2})(.{2})/,'$1-$2-$3 $4:$5:$6');
//					            	 var createDate=new Date(data.data.createDate)
									$("#createDate").html(createDate+dateLast);
									$("#instanceName").html(data.data.instanceName);
									var payDate = data.data.payDate||"";
									var createDate1="";
									var dateLast1="";
									if(payDate){
										var date_CH1=new Date(parseInt(data.data.payDate));
										createDate1=date_CH1.getUTCFullYear()+"-"+(date_CH1.getUTCMonth()+1)+"-"+date_CH1.getDate()+"  ";
										dateLast1=date_CH1.getHours()+":"+date_CH1.getMinutes()+":"+date_CH1.getSeconds();
//										payDate = data.data.payDate.replace(/(.{4})(.{2})(.{2})(.{2})(.{2})(.{2})/,'$1-$2-$3 $4:$5:$6');
									}
									$("#payDate").html(createDate1+dateLast1);

									//订单类型和付款方式支付时间
									var billType = data.data.billType;



									var serviceType = data.data.serviceType;

//									//TODO:数据虚拟
//										var productName = data.data.productName
//										if(productName == "弹性云主机"){
//											serviceType = "vm";
//										}else if(productName =="弹性负载均衡"){
//											serviceType = "lb";
//										}else if(productName =="弹性块存储"){
//											serviceType = "vdisk";
//										}else if(productName =="公网带宽"){
//											serviceType = "ip";
//										}else if(productName =="文件存储"){
//											serviceType = "nas";
//										}else if(productName =="对象存储"){
//											serviceType = "obs";
//										}else if(productName =="路由器"){
//											serviceType = "route";
//										}else if(productName =="私有网络"){
//											serviceType = "subnet";
//										}
									billType = CommonEnum.billTypes[billType]?CommonEnum.billTypes[billType]:"-";
									$("#billType").html(billType);
									$("#productName").html(data.data.productName);
									var feeValue = data.data.feeValue /1000;
									$(".feeValue").html(feeValue.toFixed(2)+"元");
									$(".realValue").html(feeValue.toFixed(2)+"元");
									$("#count").html(data.data.count);
									$("#period").html(data.data.period);

									orderDetail.getConfigSpecification(data.data.tradeDetailInfo,0,serviceType,tradeType);

								}
							}
						},function onError(){
						});
					}

				
				
				
				
	    },
	//配置规格
	getConfigSpecification : function(templateData,billType,serviceType,tradeType) {
		//var serviceType = templateData.serviceType;
		//var orderType = templateData.orderType;
		
		//var code = CommonEnum.serviceType[serviceType];
		var value = "";
		if(tradeType == 'A'){//购买订单
		switch (serviceType) {
		case 1001://弹性云主机
			value = orderDetail.showAVMDetail(templateData,billType,"vm");
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
		case 1017:
			$("#productName").html(snapText);
			value = orderDetail.showASnapDetail(templateData);
			break;
		case 1018:
			$("#productName").html(imageText);
			value = orderDetail.showAImageDetail(templateData);
			break;
		}
	}else if(tradeType == 'M'){//修改订单
		
		
	}else if(tradeType == 'R'){//退订订单
		
	}
		if(value != ""){
			  $("#cms").empty();//此时为div
			  var specarr = value.split(',');
			  if(specarr){
			    $(specarr).each(function(index, v) {
				$("#cms").append('<span>'+v+'</span><br/>');
           });
		}
	 }

	},
	getOrderStatus: function(status){
		var value = "";
		switch(status){
		case 'A':
			value = "购买订单";
			break;
		case 'M':
			value="修改订单";
			break;
		case 'R':
			value="销毁订单";
			break;
		}
		return value;
	},
	showAVMDetail:function(templateData,billType,serviceType){
		var value="";
		if(templateData){
			var arr = templateData.split('\n');
			var cpunum = "";
			var memorySize =  "";
			var os = "";
			var osdisk = "";
			var band_width = "";
			var gateway = "";
			var storageSize = "";
			var router = "";
			if(arr){
				var routerContain = false;
				 $(arr).each(function(index, v) {
					   if(v){
						   if(v.indexOf("routerPrice")>=0) {
							   routerContain = true;
						   }
						   var arritem = v.split(':');
						   if(arritem){
							   if(arritem[0] == "cpuNum"){
								   cpunum = "CPU核数:"
										+ arritem[1]
										+ "核,  ";
							   }else if(arritem[0] == "memorySize"){
								   memorySize= "内存："+arritem[1]+"GB,";
							   }else if(arritem[0] == "osDisk"){
								   osdisk = "系统盘："+arritem[1]+"GB,";
							   }else if(arritem[0] == "BAND_WIDTH"||arritem[0] == "bandwidth_tx"){
					              band_width = "带宽："+arritem[1]+"M,";
				               }else if(arritem[0] == "gateway"){
				            	   if(arritem[1] == "0.0.0.0"){
				            		  gateway = "默认网络,"; 
				            	   }else{
				            		  gateway = "子网络："+arritem[1]+",";
				            	   }
				               }else if(arritem[0] == "storageSize"){
				            	   storageSize = "数据盘："+arritem[1]+"GB,";
				               }else if(arritem[0] == "OS"){
								   com.skyform.service.BillService.queryProductPrtyInfo(billType,"vm",function(data){
										if( null != data){
	//				           				data = {"oslist":[{"osDiskSizeMin":20,"value":"5","desc":"CentOS6.3 64位"},{"osDiskSizeMin":20,"value":"1","desc":"CentOS6.4 64位"},{"osDiskSizeMin":20,"value":"6","desc":"CentOS6.5 64位"},{"osDiskSizeMin":50,"value":"2","desc":"Windows Server 2003 企业版 32位"},{"osDiskSizeMin":50,"value":"3","desc":"Windows Server 2008 R2 标准版 64位"},{"osDiskSizeMin":50,"value":"19","desc":"Windows Server 2008 R2 数据中心版 64位"},{"osDiskSizeMin":50,"value":"20","desc":"Windows Server 2012 R2 数据中心版 64位"},{"osDiskSizeMin":50,"value":"21","desc":"Windows Server 2012 R2 标准版 64位"},{"osDiskSizeMin":50,"value":"22","desc":"Ubuntu14.04 Server CN 64位"}],"vmConfig":[{"value":"1","memory":[{"value":"0.5","vmPrice":"1","discount":"","name":"其他配置","desc":"512M","osDisk":"50","productId":""},{"value":"1","vmPrice":"1","discount":"","name":"其他配置","desc":"1G","osDisk":"80","productId":""},{"value":"2","vmPrice":"1","discount":"","name":"其他配置","desc":"2G","osDisk":"80","productId":""},{"name":"其他配置","desc":"4G","value":"4","discount":"","productId":""}],"desc":"1核"},{"value":"2","memory":[{"name":"其他配置","desc":"1G","value":"1","discount":"","productId":""},{"value":"2","vmPrice":"1","discount":"","name":"其他配置","desc":"2G","osDisk":"150","productId":""},{"value":"4","vmPrice":"1","discount":"","name":"其他配置","desc":"4G","osDisk":"150","productId":""},{"name":"其他配置","desc":"8G","value":"8","discount":"","productId":""}],"desc":"2核"},{"value":"4","memory":[{"name":"其他配置","desc":"2G","value":"2","discount":"","productId":""},{"value":"4","vmPrice":"1","discount":"","name":"其他配置","desc":"4G","osDisk":"220","productId":""},{"value":"8","vmPrice":"1","discount":"","name":"其他配置","desc":"8G","osDisk":"220","productId":""},{"name":"其他配置","desc":"12G","value":"12","discount":"","productId":""},{"name":"其他配置","desc":"16G","value":"16","discount":"","productId":""}],"desc":"4核"},{"value":"8","memory":[{"name":"其他配置","desc":"4G","value":"4","discount":"","productId":""},{"value":"8","vmPrice":"1","discount":"","name":"其他配置","desc":"8G","osDisk":"330","productId":""},{"name":"其他配置","desc":"12G","value":"12","discount":"","productId":""},{"value":"16","vmPrice":"1","discount":"","name":"其他配置","desc":"16G","osDisk":"330","productId":""},{"name":"其他配置","desc":"24G","value":"24","discount":"","productId":""},{"name":"其他配置","desc":"32G","value":"32","discount":"","productId":""}],"desc":"8核"},{"value":"12","memory":[{"name":"其他配置","desc":"32G","value":"32","discount":"","productId":""}],"desc":"12核"}],"productId":201}
											var oslist = data.oslist;
											$(oslist).each(function(index, system) {
												if(system.value == arritem[1]){
													os = "镜像："+system.desc + ",";
												}
											});
										}
				           			});
				               } else if(routerContain && arritem[0] == "roterRoles"){
								   router = "路由器: 1个";
							   }
						   }
					   }
					   });
			}
			
			value = cpunum + memorySize+ osdisk +band_width+gateway+storageSize +os + router;
			}
		return value;
	},
	showABlanceDetail : function(templateData){
		var value="";
		if(templateData){
			var arr = templateData.split('\n');
			var port = "";
			var protocol = "";
			var looptype = "";
			  if(arr){
			    $(arr).each(function(index, v) {
				   if(v){
					   var arritem = v.split(':');
					   if(arritem){
						 if(arritem[0] == "port"){
							   port = "监听端口："+arritem[1]+",";
						   }else if(arritem[0] == "protocol"){
							   protocol = "监听协议："+arritem[1]+",";
						   }else if(arritem[0] == "looptype"){
							   looptype="均衡方式："+CommonEnum.looptypes[arritem[1]];
						   }
					   }
				   }
              });
			  }
			value =port+protocol+looptype;
			}
		return value;
	},
	showAVdiskDetail : function(templateData){
		var value = "";
		if(templateData){
			var arr = templateData.split('\n');
			if(arr){
				 $(arr).each(function(index, v) {
					 
					 if(v){
						 var arritem = v.split(':');
						 if(arritem[0]=="storageSize"){
							 value = "磁盘容量："+arritem[1]+"G";
						 }
					 }
				 });
			}
		}
		return value;
	},
	showAIpDetail : function(templateData){
		var value = "";
		if(templateData){
			var arr = templateData.split('\n');
			var band_width = "";
			var arr = templateData.split('\n');
			if(arr){
				 $(arr).each(function(index, v) {
					 if(v){
						 var arritem = v.split(':');
						 if(arritem[0]=="BAND_WIDTH"){
							 band_width = "带宽："+arritem[1]+"M";
						 }
					 }
				 });
			}
			value = band_width;
			}
		return value;
	},
	showANasDetail : function(templateData){
		var value = "";
		if(templateData){
			var arr = templateData.split('\n');
			var storageSize = "";
			var allCatalogueName = "";
			if(arr){
				 $(arr).each(function(index, v) {
					 if(v){
						 var arritem = v.split(':');
						 if(arritem[0]=="storageSize"){
							 storageSize = "数据盘："+arritem[1]+"G,";
						 }else if(arritem[0]=="allCatalogueName"){
							 allCatalogueName = "目录全名："+arritem[1];
						 }
						 }
					 });
					 }
			value = storageSize+allCatalogueName;
			}
		return value;
	},
	showAObsDetail : function(templateData){
		var value = "";
		if(templateData){
			var arr = templateData.split('\n');
			var storageSize = "";
			if(arr){
				 $(arr).each(function(index, v) {
					 if(v){
						 var arritem = v.split(':');
						 if(arritem[0]=="storageSize"){
							 storageSize = "数据盘："+arritem[1]+"G";
						 }
						 }
					 });
					 }
			value = storageSize;
			}
		return value;
	},
	showARouteDetail : function(templateData){
		var value="";
		if(templateData){
			var arr = templateData.split('\n');
			var bank_withd = "";
			var routerPrice = "";
			if(arr){
				 $(arr).each(function(index, v) {
					 if(v){
						 var arritem = v.split(':');
						 if(arritem[0]=="BAND_WIDTH"){
							 bank_withd = "带宽："+arritem[1]+"M,";
						 }
						 }
					 });
					 }
			value = bank_withd+routerPrice;
			}
		return value;
	},
	showASubnetDetail:function(templateData){
		var value="";
		if(templateData){
			var arr = templateData.split('\n');
			var startip = "";
			var endip = "";
			var gateway = "";
			var netmask = "";
			if(arr){
				 $(arr).each(function(index, v) {
					 if(v){
						 var arritem = v.split(':');
						 if(arritem[0]=="startip"){
							 startip = "网段起点："+arritem[1]+",";
						 }else if(arritem[0]=="endip"){
							 endip = "网段终点："+arritem[1]+",";
						 }else if(arritem[0]=="gateway"){
							 gateway = "网关："+arritem[1]+",";
						 }else if(arritem[0]=="netmask"){
							 netmask = "子网掩码："+arritem[1];
						 }
						 }
					 });
					 }
			value = startip+endip+gateway+netmask;
			}
		return value;
	},
	showASnapDetail:function(templateData){
		var value="";
		if(templateData){
			var arr = templateData.split('\n');
			var vmid = "";
			if(arr){
				 $(arr).each(function(index, v) {
					 if(v){
						 var arritem = v.split(':');
						 if(arritem[0]=="vmid"){
							 vmid = "虚拟机ID："+arritem[1];
						 }
						 }
					 });
					 }
			value = vmid;
			}
		return value;
	},
	showAImageDetail:function(templateData){
		var value="";
		if(templateData){
			var arr = templateData.split('\n');
			if(arr){
				 $(arr).each(function(index, v) {
					 if(v){
						 var arritem = v.split(':');
						 if(arritem[0]=="snapshotid"){
							 vmid = "快照ID："+arritem[1];
						 }
//						 else if(arritem[0]=="nimageSize"){
//							 vmid = "镜像："+arritem[1];
//						 }
						 }
					 });
					 }
			value = vmid;
			}
		return value;
	}
	
};

		
$(function(){
	// var mytable = new com.skyform.component.DataTable().renderFromTable("#orderTable");
	orderDetail.init();
});
