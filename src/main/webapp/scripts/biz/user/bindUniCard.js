var portal = "";
$(function(){
	portal = $("#ctx").val();
	$("#bindCard").click(function(){
		window.location = portal+"/jsp/unicompany/bindCard.jsp";	
	});
	$("#uniPay").click(function(){
		window.location = portal+"/jsp/unicompany/pay.jsp"
	});
	$("#goPay").click(function(){
		window.location = portal+"/jsp/unicompany/uniPop.jsp";	
	});
	$("#paySubmit").click(function(){
		uniPop();
	});
	$("#bind").click(function(){
		goToBindCard();
	})
});



function pay() {
	var isSubmit = true;
	var count = 1;
	var params = 	{"period":1,"count":1,"productList":[{"instanceName":"0411","BAND_WIDTH":"1","productId":5001}]};
	Dcp.biz.apiRequest("/trade/eipSubscribe", params, function(data) {
			//订单提交成功后校验用户余额是否不足
			var _tradeId = data.tradeId;
			var _fee = 90000;
			var createModal = $("#createEipModal");
			confirmTradeSubmit(_fee,_tradeId,function onSuccess(data){
				$.growlUI(Dict.val("common_tip"), "创建互联网接入请求成功，请等待..."); 
				$("#createEipModal").modal("hide");
				// refresh
				eip.updateDataTable();								
			},function onError(msg){
				$.growlUI(Dict.val("common_tip"), "创建互联网接入请求成功,扣款失败"); 
				$("#createEipModal").modal("hide");
			});
	},function onError(msg){
		$.growlUI("提示", "创建申请提交失败：" + msg); 
	});				

	function confirmTradeSubmit(fee,tradeId,onSuccess,onError){
		//var _balance = this.queryBalance();
		var _remain = -1;
		if(_remain<0){
			var confirmModal_balance = new com.skyform.component.Modal(new Date().getTime(),"确定充值","余额不足, 请选择其他支付方式",{
				buttons : [
							{
								name : "沃支付",
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
								name : "银联支付",
								onClick : function(){
									window.location = "/portal/jsp/unicompany/uniPop.jsp";									
									confirmModal_balance.hide();
									//$("#payMessModal").modal("show");
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
			
		}else{
			var confirmModal_submit = new com.skyform.component.Modal(new Date().getTime(),"确定扣款","金额为"+fee+"元, 您确定扣款吗?",{
				buttons : [
							{
								name : "确定",
								onClick : function(){
									com.skyform.service.BillService.tradeSubmit(tradeId,onSuccess,onError);
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
	};
}
function uniPop(){
	$.growlUI(Dict.val("common_tip"), "支付成功" ); 		
	var confirmModal_balance = new com.skyform.component.Modal(new Date().getTime(),"确定充值","余额不足, 请选择其他支付方式",{
	//var confirmModal = new com.skyform.component.Modal(new Date().getTime(),"银联支付","<h4>您确认要支付吗?</h4>",{
		buttons : [
			{
				name : "确定",
				onClick : function(){
					$.growlUI(Dict.val("common_tip"), "支付成功" ); 										
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
					confirmModal.hide();
				}
			}
		]
	});
	
}	
function goToBindCard (){
	
    $.ajax({
        type : "POST",
        url : "../../pr/bindUinCard",
        data : {},
        dataType : 'json',
        async : true,
        global : false,
        success : function(data) {}
    });
}