$(function() {
	
	userHome.init();
});
var userHome = {
		init:function(){
			var portalType = Dcp.biz.getCurrentPortalType();
			if(portalType == "public"){
				 userHome.showSecurityLevel();
				 userHome.showIndentStatus();
				 userHome.showMoney();
			}
		   
		    userHome.showOrders(portalType);
		   
		},
		showSecurityLevel:function(){
			var securityLevel = $("#securityLevelCurrent").val();
			switch(securityLevel){
			    case "1":
			    	$("#securityLevelShow").text(Dict.val("user_weak"));
			    	break;
			    case "2":
			    	$("#securityLevelShow").text(Dict.val("user_in"));
			    	break;
			    case "3":
			    	$("#securityLevelShow").text(Dict.val("user_high"));
			    	break;	
			}
		},
		showMoney:function(){
			var account = $("#userNameCurrent").val();
			var datas = {
	        		loginName:account+""
            };
	  		Dcp.biz.apiRequest("/account/queryBalance", datas ,function(data) {
	        	state = data.code;
	        	if(state == 0){
	        		var yumoney = data.data[0].Balance;
	        		var redmoney = data.data[0].noCashBalance;
	        		
	        		// 换算成元
	        		yumoney = yumoney/1000;
	        		redmoney = redmoney/1000;
    				yumoney = formatCurrency(yumoney);
 					redmoney = formatCurrency(redmoney);
	        		$("#userHoBalance").html(yumoney);
	        		$("#userHoRedbalance").html(redmoney);
				}
	        	else if(state == 1){
	        		alert(Dict.val("user_balance_inquiries_abnormal"));
	        	}
			});
		},
		showIndentStatus:function(){
			 com.skyform.service.indentService.queryCustIdentStatus(function(result){  
				 var ctx = $("#ctx").val();
			 	   if(result[0].length == 0 || result[0].status== "3"){
			 		   $("#indentImages").attr("src",ctx+"/images/shenfen-start.png");
			 		  $("#indentStatusCurrent").html("<a href='"+ctx+"/jsp/user/indent.jsp?code=indent&&cataCode=user'>"+Dict.val("user_no_identity_authentication")+"</a>");
			 	   }else{
			 		   var status = result[0].status;
			 		   if(status == "1"){
			 			  $("#indentImages").attr("src",ctx+"/images/shenfen-pro.png");
			 			 $("#indentStatusCurrent").html(Dict.val("user_identity_authentication"));
			 		   }else if(status == "2"){
			 			  $("#indentImages").attr("src",ctx+"/images/shenfen-success.png");
			 			  $("#indentStatusCurrent").html(Dict.val("user_identity_verified"));
			 		   }
			 	   }
			    
			 },function(error){
		   		$.growlUI(Dict.val("user_dat_query_error"));
		    });
		},
		showOrders:function(portalType){
			$("#order_tbody").empty();
			var _token = $("#tokenCurrent").val();
			var datas = {
					token : _token
			};
			
			//将自己编写的显示主机的table渲染
			Dcp.biz.apiAsyncRequest("/trade/queryTradeDetailInfoByName", datas, function(data) {
				if (data.code != "0") {
					$.growlUI(Dict.val("user_dat_query_error")); 
				} else {		
					var orders = [];
					var j=0;
					for(var i in data.data){
						if(data.data[i].status!=7){
							orders[j++]=data.data[i];
						}
					};
					$("#order_desc").text("");
					if(orders.length > 5){
						for(var i=0;i < 5;i++){
							var arr=[];
							arr.push(orders[i]);
							userHome.showTable(arr,portalType);
						}
					}else if(orders.length>0&&orders.length<=5){
						userHome.showTable(orders,portalType);
					}else{
						$("#order_table").hide();
						$("#order_desc").text(Dict.val("user_you_have_not_resources_make_purchase"));
					}
				     
				}
			},function onError(){
				$.growlUI(Dict.val("user_dat_query_error")); 
			});		
		},
		showTable:function(orders,portalType){
			var status = {
					"0":Dict.val("user_init"),
					"1":Dict.val("user_processing"),
					"2":Dict.val("user_to_be_paid"),
					"4":Dict.val("user_failure"),
					"7":Dict.val("user_revocation"),
					"8":Dict.val("user_paid"),
					"9":Dict.val("user_implement")
			};
			$(orders).each(function(index,item){
				var yumoney = item.feeValue;
        		if(null != yumoney && "" != yumoney && yumoney > 0) {
        			// 换算成元
        			yumoney = yumoney/1000;
        			// 四舍五入保留两位小数
        			yumoney = Math.round(yumoney*Math.pow(10,2))/Math.pow(10,2);
        		}else {
        			yumoney = "0.00";
        		}
        	var productname = item.productName;
        	if(!productname){
        		productname = " ";
        	}
        	var monenyTd = "";
        	if(portalType=="private"){
        		monenyTd = "";
        	}else if(portalType=="public"){
        		monenyTd = "<td>" +yumoney+"</td>";
        	}
				if(item.status!=2)
				{
					var dt="<tr>" +
						"<td>" +
						item.tradeId+
						"</td>" +
						"<td>" +
						productname+
						"</td>" +monenyTd+
						"<td>" +
						new Date(item.createDate).format("yyyy-MM-dd hh:mm:ss")+
						"</td>" +
						"<td>" +
						status[item.status]+
						"</td>"+
						"<td>" +
						'<input type="button" name="tradeId" class="btn" style="text-decoration: none;visibility:hidden;" value="支付" onclick="userHome.confSubmit('+item.tradeId+','+yumoney+')" />'+
						'<input type="button" name="tradeId" class="btn btn-danger" style="text-decoration: none" value="删除" onclick="userHome.delConfirm('+item.tradeId+')" />'+
						"</td>"+
						"</tr>";
				}
				else{
					var dt="<tr>" +
						"<td>" +
						item.tradeId+
						"</td>" +
						"<td>" +
						productname+
						"</td>" +monenyTd+
						"<td>" +
						new Date(item.createDate).format("yyyy-MM-dd hh:mm:ss")+
						"</td>" +
						"<td>" +
						status[item.status]+
						"</td>"+
						"<td>" +
						'<input type="button" name="tradeId" class="btn" style="text-decoration: none;" value="支付" onclick="userHome.confSubmit('+item.tradeId+','+yumoney+')" />'+
						'<input type="button" name="tradeId" class="btn btn-danger" style="text-decoration: none" value="删除" onclick="userHome.delConfirm('+item.tradeId+')" />'+
						"</td>"+
						"</tr>";
				}


			$("#order_tbody").append(dt);
			//if(item.status!=2){
			//	$("#order_tbody input[value='支付']").css("visibility", "hidden");
			//}
			});
		},

	// 确认支付的逻辑star
	confSubmit : function (tradeId,feeValue) {
		var _tradeId = tradeId+"";
		var _balance = userHome.queryBalance();
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
								userHome.tradeSubmit(tradeId+"",function onSuccess(data){
									$.growlUI("提示", "扣款成功, 请耐心等待开通服务...");
									//点完支付按钮之后 刷新当前表格
									var portalType = Dcp.biz.getCurrentPortalType();
									userHome.showOrders(portalType);
									/*var _usrAccount = userAccunt;
									var _token = token;
									var datas = {
										token : _token
									};
									Dcp.biz.apiAsyncRequest("/trade/queryTradeDetailInfoByName", datas, function(data) {
										if (data.code != "0") {
											$.growlUI("数据查询错误");
										} else {
											//userHome.datatable.updateData(data.data);
										}
									},function onError(){
										//order.generateTable();
									});*/


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
	// 确认支付的逻辑end
	// 删除记录的逻辑star
	delConfirm : function(tradeId){
		//console.log(tradeId);
		var tradeID=tradeId+"";
		var params={tradeId:tradeID,status:7};
		/*com.skyform.service.BillService.delRecord(params,function onSuccess(data){
			console.log(1);
		},function onError(msg){
			console.log(2);
		});*/
		var confirmModal_submit = new com.skyform.component.Modal(new Date().getTime(),"确定删除","您确定删除该记录吗?",{
			buttons : [
				{
					name : "确定",
					onClick : function(){
						com.skyform.service.BillService.delRecord(params,function onSuccess(data){
							$.growlUI("提示", "删除交易记录成功。");
							//点完支付按钮之后 刷新当前表格
							var portalType = Dcp.biz.getCurrentPortalType();
							userHome.showOrders(portalType);
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