var ctx = "";
$(function(){
	ctx = $("#ctx").val();
//	$("#bindCard").click(function(){
//		window.location = ctx+"/jsp/unicompany/bindUniCard.jsp";	
//	});
	$("#uniPay").click(function(){
		window.location = ctx+"/jsp/unicompany/pay.jsp";
	});
//	$("#goPay").click(function(){
//		window.location = ctx+"/jsp/unicompany/uniPop.jsp";
//	});
	$("#bind").click(function(){
		goToBindCard();
	});
	$(".unbind").click(function(){
		unBindCard();
	});
});



function goToBindCard (){
	
    $.ajax({
        type : "POST",
        url : "../../pr/unionpay/bindUinCard",
        data : {},
        dataType : 'json',
        async : false,
        global : false,
        success : function(html) {
        	autoPost(html);
        },error : function(html) {
        	autoPost(html);
		}
    });    
}

function autoPost(html){
	if(html&&200==html.status){
		$("#postUni").empty().html(html.responseText);
	}
	else {
		var returnModal = new com.skyform.component.Modal(new Date().getTime(),"充值支付","<h4>支付未成功</h4>",{
			buttons : [
				{
					name : "确定",
					onClick : function(){
						returnModal.hide();
					},
					attrs : [
						{
							name : 'class',
							value : 'btn btn-primary'
						}
					]
				}
			]
		});
		returnModal.setWidth(500).autoAlign();
		returnModal.show();	
	}
}

function unBindCard(){
	
}

