//10.10.242.180
var snapText = "快照";
var imageText = "云主机镜像";
var order = {
	datatable : new com.skyform.component.DataTable(),
	init : function() {
		order.describeOrder();
	},
	generateTable : function(data){
		 order.datatable.renderByData("#orderTable", {
				"data" : data,
				"bSort" : false,
				"columnDefs" : [
				     {title : "订单号", name : "tradeId"},
				     {title : "产品名称", name : "productName"},// 与接口没有对应上
				     {title : "金额(元)", name : "feeValue"},
				     {title : "状态", name : "status"},
				     {title : "创建时间", name : "createDate"}, // 给我格式 ：yyyy-MM-dd HH:mm:ss
				     {title : "支付时间", name : "payDate"},// 与接口没有对应上
				     {title : "操作", name : ""}
				     
				],
				"pageSize" : 5,
				"onColumnRender" : function(columnIndex,columnMetaData,columnData) {
					 var text = columnData[''+columnMetaData.name] || "";
					 if(columnIndex ==0) {
						 //text =  columnData.tradeId;
						 
						 text = '<a  href="../user/myDetailOrder.jsp?code=order&cataCode=consume&tradeId='+columnData.tradeId+'">'+columnData.tradeId+'</a>';
					 }
					 if(columnIndex ==1) {
						 if(columnData.productName){
							 text = '<span name="productName">'+columnData.productName+'</span>';
						 }else if(1017 == columnData.serviceType){
							 text = snapText;
						 }else if(1018 == columnData.serviceType){
							 text = imageText;
						 }else text = "";
						
					 }
					 if(columnIndex ==2) {
			        		var yumoney = columnData.feeValue;
			        		if(null != yumoney && "" != yumoney && yumoney > 0) {
			        			// 换算成元
			        			yumoney = yumoney/1000;
			        			// 四舍五入保留两位小数
			        			yumoney = Math.round(yumoney*Math.pow(10,2))/Math.pow(10,2);
			        			text = yumoney;
			        		}else {
			        			text = "-";
			        		}
					 }
					 if(columnIndex ==3) {
						 var state = columnData.status;
						 if(0 == state) {
							 text = "初始化";
						 } else if(1 == state) {
							 text = "处理中";
						 } else if(2 == state) {
							 text = "待支付";
						 } else if(4 == state) {
							 text = "失败";
						 } else if(7 == state) {
							 text = "撤销";
						 } else if(8 == state) {
							 text = "已支付";
						 } else if(9 == state) {
							 text = "完成";
						 }
					 }
					 if(columnIndex ==4) {
						 var crtDate = columnData.createDate;
						 
						 if(null != crtDate && "" != crtDate && crtDate > 1) {
							 text =  new Date(crtDate).format("yyyy-MM-dd hh:mm:ss");
							 // text = new Date(text).format("yyyy-MM-dd hh:mm:ss");
							 // text = crtDate.substr(0,4) + "-" + crtDate.substr(4,2) + "-" + crtDate.substr(6,2) + " " + crtDate.substr(8,2) + ":" + crtDate.substr(10,2) + ":" + crtDate.substr(12,2);
						 }else{
							 text = ""; 
						 }
					 }
					 if(columnIndex ==5) {
						 var payDateM = columnData.payDate;
						 if(null != payDateM && "" != payDateM && payDateM > 1) {
							 var pdt = new Date(payDateM).format("yyyy-MM-dd hh:mm:ss");
							 text = '<span name="payDateM">'+pdt+'</span>';
							 // text = new Date(text).format("yyyy-MM-dd hh:mm:ss");
							//  text = payDateM.substr(0,4) + "-" + payDateM.substr(4,2) + "-" + payDateM.substr(6,2) + " " + payDateM.substr(8,2) + ":" + payDateM.substr(10,2) + ":" + payDateM.substr(12,2);
						 }else{
							 text = '<span name="payDateM">-</span>'; 
						 }
					 }
					 if(columnIndex ==6) {
						 text = '<input type="button" name="tradeId" class="btn" style="text-decoration: none" value="支付">' +
						 '<input type="button" name="tradeId" class="btn btn-danger" style="text-decoration: none" value="删除">';
						 // text = '<a href="#" onclick="javascript:confSubmit();" class="btn btn-success" style="text-decoration: none"></a>';
					 }
					 return text;
				}, 
				"afterRowRender" : function(rowIndex,data,tr){
					// tr.attr("state", data.state).attr("comment", data.comment);
					// tr.attr("ownUserId", data.ownUserId);
					var state = data.status;
					if(2 == state) {
						$(tr).find("input[type='button']").eq(0).bind("click", function() {
							var y_fv = data.feeValue;
			        		if(null != y_fv && "" != y_fv && y_fv > 0) {
			        			// 换算成元
			        			y_fv = y_fv/1000;
			        			// 四舍五入保留两位小数
			        			y_fv = Math.round(y_fv*Math.pow(10,2))/Math.pow(10,2);
			        		}else {
			        			y_fv = 0;
			        		}
							order.confSubmit(data.tradeId,y_fv);
						});
						$(tr).find("input[type='button']").eq(1).bind("click", function() {//删除
							var tradeID=data.tradeId+"";
							order.delConfirm(tradeID);
							console.log(data.tradeId);
						});
					}else{
						$(tr).find("input[type='button']").eq(0).css("visibility", "hidden");
						$(tr).find("input[type='button']").eq(1).bind("click", function() {//删除
							var tradeID=data.tradeId+"";
							order.delConfirm(tradeID);
						});
					}
					if(8 != state && 9 != state) {
						$(tr).find("span[name='payDateM']").html("");
					}
					// 将文件存储改成对象存储，因亚联的人不在，所以在页面临时处理，年后与亚联再修改
					var proName = data.productName;
//					if("文件存储" == proName) {
//						$(tr).find("span[name='productName']").html("对象存储");
//					}
				},
				"afterTableRender" : function() {
					// order.bindEvent();
				}
		});
	},
	describeOrder : function(){
		var _usrAccount = userAccunt;
		var _token = token;
		var datas = {
				// loginName:usrAccount
				token : _token
		};
		//将自己编写的显示主机的table渲染
		//Dcp.biz.apiAsyncRequest("/user/describeOrder", datas, function(data) {
		Dcp.biz.apiAsyncRequest("/trade/queryTradeDetailInfoByName", datas, function(data) {
			if (data.code != "0") {
				$.growlUI("数据查询错误"); 
			} else {
				var dataSelect=[];
				var j=0;
				for(var i in data.data){
					if(data.data[i].status!=7){
						dataSelect[j++]=data.data[i];
					}
				};
				 order.generateTable(dataSelect);
			}
		},function onError(){
			order.generateTable();
		});		
	},
	// 确认支付的逻辑
	confSubmit : function (tradeId,feeValue) {
		var _tradeId = tradeId;
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
										order.tradeSubmit(tradeId,function onSuccess(data){
											$.growlUI("提示", "扣款成功, 请耐心等待开通服务..."); 
											//点完支付按钮之后 刷新当前表格
											var _usrAccount = userAccunt;
											var _token = token;
											var datas = {
													token : _token
											};
											Dcp.biz.apiAsyncRequest("/trade/queryTradeDetailInfoByName", datas, function(data) {
												if (data.code != "0") {
													$.growlUI("数据查询错误"); 
												} else {
													var dataSelect=[];
													var j=0;
													for(var i in data.data){
														if(data.data[i].status!=7){
															dataSelect[j++]=data.data[i];
														}
													};
													 order.datatable.updateData(dataSelect);
												}
											},function onError(){
												//order.generateTable();
											});		
											
											
										},function onError(msg){
											$.growlUI("提示", "扣款失败...");
										});
										confirmModal_submit.hide();
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
	// 确定支付
	tradeSubmit : function(tradeId,onSuccess,onError){
		var params = {
				"tradeId" : tradeId
		};
		
		var api = "/trade/Submit";
		Dcp.biz.apiRequest(api,params || {},function(result){
			if(result.code ==0) {
				if(onSuccess) {
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
	/*isBalanceEnough : function(tradeId,onSuccess,onError){
		var params = {
				"tradeId" : tradeId
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
	// 删除记录的逻辑star
	delConfirm : function(tradeId){
		//console.log(tradeId);
		var tradeID=tradeId+"";
		var params={tradeId:tradeID,status:7};
		var confirmModal_submit = new com.skyform.component.Modal(new Date().getTime(),"确定删除","您确定删除该记录吗?",{
			buttons : [
				{
					name : "确定",
					onClick : function(){
						com.skyform.service.BillService.delRecord(params,function onSuccess(data){
							$.growlUI("提示", "删除交易记录成功。");
							//点完删除按钮之后 刷新当前表格
							var _usrAccount = userAccunt;
							var _token = token;
							var datas = {
								token : _token
							};
							Dcp.biz.apiAsyncRequest("/trade/queryTradeDetailInfoByName", datas, function(data) {
								if (data.code != "0") {
									$.growlUI("数据查询错误");
								} else {
									var dataSelect=[];
									var j=0;
									for(var i in data.data){
										if(data.data[i].status!=7){
											dataSelect[j++]=data.data[i];
										}
									};
									order.datatable.updateData(dataSelect);
								}
							},function onError(){
								//order.generateTable();
							});
						},function onError(msg){
							$.growlUI("提示", "删除交易记录失败，请刷新重试。");
						});
						confirmModal_submit.hide();
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
	// 删除记录的逻辑end
};
		
$(function(){
	// var mytable = new com.skyform.component.DataTable().renderFromTable("#orderTable");
	order.init();
});
