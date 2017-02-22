$(function() {
	$.ajaxSetup({
		cache : false
	});//设置jQuery ajax缓存
	root = $("#ctx").val();
	currentUserId = $("#currentUserId").val();
	//user_info.server = server;
	initInfo();
	$("#btnSave").removeAttr("style");
	$("#btnSave").removeAttr("disabled");
	$("#btnSave").click(function(){
		Modify.modify();
	});
	
	
	// 特殊字符输入控制，允许输入中文,允许输入空格
	$("input[type='text']").blur(function() {
		var val = $(this).val();
		//邮箱可以输入@
		if($(this).is('#email')||$(this).is('#compEmail')){
			if (!/^[ \u4E00-\u9FA5a-zA-Z0-9_.@\/-]+$/.test(val)) {
				$(this).val("");
				return;
			}
		}
		else if($(this).is('#compCnName')){
			return;
		}
		else if($(this).is('#compAddress')){
			return;
		}
		else if (!/^[ \u4E00-\u9FA5a-zA-Z0-9_.\/-]+$/.test(val)) {
			$(this).val("");
			return;
		}
	});
	// 文本框失去焦点后
	$('#baseInfo :text').blur(function() {
		//验证企业名称
		if($(this).is('#compCnName')){
			var errorMsg = Dict.val("user_100_characters_or_less");
			if(!valiter.isNull($.trim(this.value))){
				if ($.trim(this.value).length>100) {
					$("#cnMsg").addClass("onError").html(errorMsg);
				}
				else $("#cnMsg").removeClass("onError").html("");
			}else{
				$("#cnMsg").addClass("onError").html(errorMsg);
			}
		}
		//验证企业编码
		if($(this).is('#compOrgCode')){
			var errorMsg = Dict.val("special_characters_or_less");
			if(!valiter.isNull($.trim(this.value))){
				if ($.trim(this.value).length>10) {
					$("#codeMsg").addClass("onError").html(errorMsg);
				}
				else $("#codeMsg").removeClass("onError").html("");
			}
//			else{
//				$("#codeMsg").addClass("onError").html(errorMsg);
//			}
		}
		//验证企业地址
		if($(this).is('#compAddress')){
			var errorMsg = Dict.val("user_100_characters_or_less");
			if(!valiter.isNull($.trim(this.value))){
				if ($.trim(this.value).length>100) {
					$("#addressMsg").addClass("onError").html(errorMsg);
				}
				else $("#addressMsg").removeClass("onError").html("");
			}else{
				$("#addressMsg").addClass("onError").html(errorMsg);
			}
		}
		//验证企业电话
		if ($(this).is('#compPhone')) {
			var errorMsg = Dict.val("user_press_7/8_position_fill");
			if(!valiter.isNull($.trim(this.value))){
				if (valiter.telephone($.trim(this.value))) {						
					$("#compPhoneMsg").addClass("onError").html(errorMsg);
				}
				else {
					$("#compPhoneMsg").removeClass("onError").html("");
				}
			}else{
				$("#compPhoneMsg").addClass("onError").html(errorMsg);
			}						
		}
		//验证企业传真
		if ($(this).is('#compFax')) {
			var errorMsg = Dict.val("user_fill_fax_incorrect");
			if(!valiter.isNull($.trim(this.value))){
				if (valiter.telephone($.trim(this.value))) {						
					$("#faxMsg").addClass("onError").html(errorMsg);
				}
				else {
					$("#faxMsg").removeClass("onError").html("");
				}
			}
			else{
				$("#faxMsg").addClass("onError").html(errorMsg);
			}						
		}
		//验证企业邮箱
		if ($(this).is('#compEmail')) {
			var errorMsg = Dict.val("user_format_email");
			if (valiter.isNull($.trim(this.value))|| !valiter.checkYWEmail($.trim(this.value))) {		
				$("#compEmailMsg").addClass("onError").html(errorMsg);
			}
			else 
				$("#compEmailMsg").removeClass("onError").html("");
		}

	}).keyup(function() {
		$(this).triggerHandler("blur");
	}).change(function() {
		$(this).triggerHandler("blur");
	});// end blur
});

var companyId;

function initInfo() {
//	console.log(currentUserId);
	var data = {id:currentUserId};
	if (currentUserId > 0) {
		Dcp.biz.apiAsyncRequest("/user/getCustomerByCustomerId", data,function(dto) {
        	var data = dto.data;
			if (data) {
					$("#compCnName").val(data.compname);
					$("#compAddress").val(data.compaddress);
					$("#compFax").val(data.compfax);
					$("#compEmail").val(data.compemail);
					$("#compOrgCode").val(data.comporgcode);
					$("#compPhone").val(data.compphone);
			}
		}); 
	}		
	else window.location = root+"/jsp/login.jsp";
}

var Modify = {
		modify: function(){
	    	$("#baseInfo :input").trigger('blur');	       
	        var back = false;
			back = Modify.valite();
			if (!back) {
				return;
			}
			var compCnName = $.trim($("#compCnName").val());
		    var compAddress = $.trim($("#compAddress").val());
		    var compFax = $.trim($("#compFax").val());
		    //var compEmail = $.trim($("#compEmail").val());
		    var compOrgCode = $.trim($("#compOrgCode").val());
		    //var compPhone = $.trim($("#compPhone").val());
	        var data = {
	        		customerId:parseInt(currentUserId),
	        		compCnName:compCnName,
	        		//compEmail:compEmail,
	        		//compPhone:compPhone,
	        		compFax:compFax,
	        		compAddress:compAddress,
	        		compOrgCode:compOrgCode
            };
	        $("#btnSave").css({
	        	"cursor": "default",
		           "opacity": 0.65,
		           "background":"#e6e6e6",
		           "color":"#333333"
	        });
	        $("#btnSave").attr("disabled",true);
			$("#btnSave").text(Dict.val("common_submiting"));
	        Dcp.biz.apiRequest("/user/modifyCompany", data,function(data) {
	        	$("#btnSave").removeAttr("style");
	        	$("#btnSave").removeAttr("disabled");
	        	$("#btnSave").text(Dict.val("user_save_profile"));
	        	state = data.code;
	        	if(state == 0){	
	        		userMsgModal.setContent("<span class='text-success'><h3>"+Dict.val("user_modift_information_success")+"<h3></span>");
	        		userMsgModal.show();
	        		initInfo();
				}
	        	else {
	        		userMsgModal.setContent("<span class='text-error'><h3>"+Dict.val("user_modify_information_failure")+"<h3></span>");
	        		userMsgModal.show();	        		
	        	}
			});     
	        
	    },
	    valite : function() {	    
	    	var numError = $('#baseInfo .onError').length;
			if (numError) {
				return false;// test
			}
			else 
				return true;// test
		}
};


userMsgModal = new com.skyform.component.Modal("userMsgModal","<h4>"+Dict.val("user_information")+"</h4>","",{
	buttons : [
	           {name:Dict.val("common_close"),onClick:function(){	        	   
	        	   userMsgModal.hide();	    				        	   
	           },attrs:[{name:'class',value:'btn'}]}
	           ],
     afterHidden : function(){
   		if(userMsgModal.afterHidden && typeof userMsgModal.afterHidden == 'function') {
   			userMsgModal.afterHidden();
   		}
   	}           
});
