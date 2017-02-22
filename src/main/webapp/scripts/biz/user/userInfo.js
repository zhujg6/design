$(function() {
		user_info.init();
});
var user_info = {
		init:function(){
			var portalType =Dcp.biz.getCurrentPortalType();
			$("#account").text($("#currentAccout").val());
			$("#email").text($("#infoEmail").val());
			$("#userName").text($("#infoUserName").val());
			var currentUserId = $("#infocurrentUserId").val();
			var data = {
					id : currentUserId
				};
			Dcp.biz.apiAsyncRequest("/user/getCustomerByCustomerId", data,
					function(dto) {
				var mobileOfTextType = (dto.data.mobile).slice(0, 3) + "****"
				+ (dto.data.mobile).slice(-4, 12);
				$("#cellpNumber").val(mobileOfTextType);
				   var custType=dto.data.custType;
				   if(portalType == "private"){
					   $("#userNameShow").text(Dict.val("user_client_name"));
				   }else if(portalType=="public"){
					   if(custType=="0"){
						   $("#userNameShow").text(Dict.val("user_user_name"));
					   }else if(custType == "1"){
						   $("#userNameShow").text(Dict.val("common_company_name"));
					   }
				   }
			});
		}
};