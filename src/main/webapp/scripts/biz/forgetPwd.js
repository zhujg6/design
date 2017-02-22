var timeOut = 60;
var max_num = 0;
var iCount;
var checkEmailCode=false;
$(function(){
	$("#firstStepBtn").click(function(){
		Modify.firstStep();
	});
	$("#secondStepBtn").click(function(){
		Modify.secondStep();
	});
	$("#resetSubmit").click(function(){
		Modify.modify();
	});
	$('#step1 :input').blur(function(){
		if($(this).is('#account')){
			$("#accountMsg").removeClass('onShow').removeClass("onError").html("");
		};
		/*if ($(this).is('#email')) {
			var errorMsg = "<span></span><i class='text-error icon-ban-circle'></i> 请输入正确的邮箱格式，例如：xx@xx.xx";
			if (valiter.isNull($.trim(this.value))&&!valiter.checkYWEmail($.trim(this.value))) {
				$("#emailMsg").removeClass("onShow").removeClass("onError").html("");
			}
			else if(!valiter.checkYWEmail($.trim(this.value))){
				$("#emailMsg").removeClass("onShow").addClass("onError").html(errorMsg);
			}
			else{
				$("#emailMsg").removeClass("onShow").removeClass("onError").html("");
			}
		};*/
		if($(this).is('#messageCode')){
			$("#messageCodeMsg").removeClass("onShow").removeClass("onError").html("");
		}
	});
	$('#emailCode').blur(function(){
		$("#emailCodeMsg").removeClass("onShow").removeClass("onError").html("");
	});
	$('#step3 :input').blur(
		function() {
			// 验证新密码
			if ($(this).is('#password')) {
				if (($.trim(this.value).length >=1&&$.trim(this.value).length < 8)||$.trim(this.value).length>32) {
					$("#pwdMsg").removeClass("onShow").addClass('onError').html("<span></span><i class='text-error icon-ban-circle'></i> 请输入8-32位半角字符，可为字母、数字及组合，区分大小写");
				}
				else if(valiter.isNull($.trim(this.value)) || $.trim(this.value).length < 1 ){
					$("#pwdMsg").removeClass("onShow").removeClass('onError').html("");
				}
				else if ((!valiter.isNull($("#rePassword").val()))&& this.value != $("#rePassword").val()) {
					$("#rePwdMsg").removeClass("onShow").addClass('onError').html("<span></span><i class='text-error icon-ban-circle'></i> 确认新密码与新密码不一致");
				}
				else {
					$("#pwdMsg").removeClass("onShow").removeClass('onError').html("");
				}
			}
			// 验证确认密码
			if ($(this).is('#rePassword')) {
				if (valiter.isNull(this.value)) {
					$("#rePwdMsg").removeClass("onShow").removeClass('onError').html("");
				}
				else if(this.value.length < 8||$.trim(this.value).length>32){
					$("#rePwdMsg").removeClass("onShow").addClass('onError').html("<span></span><i class='text-error icon-ban-circle'></i> 确认新密码与新密码不一致");
				}
				else if ((!valiter.isNull(this.value))&& this.value != $("#password").val()) {
					$("#rePwdMsg").removeClass("onShow").addClass('onError').html("<span></span><i class='text-error icon-ban-circle'></i> 确认新密码与新密码不一致");
				}
				else {
					$("#rePwdMsg").removeClass("onShow").removeClass('onError').html("");
				}
			}
		});
	$('body :input').focus(
		function() {
			//用户名
			if ($(this).is('#account')) {
				if($.trim(this.value).length < 1 ){
					$("#accountMsg").addClass("onShow").removeClass("onError").html("<span></span>请输入您的用户名/邮箱账号");
				}
			}
			//邮箱
			if ($(this).is('#email')) {
				if($.trim(this.value).length < 1 ){
					$("#emailMsg").addClass("onShow").removeClass("onError").html("<span></span>请输入您的邮箱");
				}
			}
			//验证码
			if ($(this).is('#messageCode')) {
				if($.trim(this.value).length < 1 ){
					$("#messageCodeMsg").addClass("onShow").removeClass("onError").html("<span></span>请输入验证码");
				}
			}
			//邮箱验证码
			if ($(this).is('#emailCode')) {
				if($.trim(this.value).length < 1 ){
					$("#emailCodeMsg").addClass("onShow").removeClass("onError").html("<span></span>请输入邮箱验证码");
				}
			}
			// 验证新密码
			if ($(this).is('#password')) {
				if($.trim(this.value).length < 1 ){
					//$("#pwdMsg").css("color","#2e2e2e").html("请输入8-32位半角字符，可为字母、数字及组合，区分大小写");
					$("#pwdMsg").addClass("onShow").removeClass('onError').html("<span></span>请输入8-32位半角字符，可为字母、数字及组合，区分大小写");
				}
			}
			// 验证确认密码
			if ($(this).is('#rePassword')) {
				if($.trim(this.value).length < 1 ){
					$("#rePwdMsg").addClass("onShow").removeClass('onError').html("<span></span>请再输入一次相同的密码");
				}
			}
		});
	$("#sendMessage").click(function(){
		$("#sendMessage").attr('disabled','disabled');
		if(max_num <= 0){
			max_num = timeOut;
			var reqParamJson={
				"account":$.trim($("#account").val()),
				"email":""
			};
			Dcp.biz.apiRequest("/pm/getVerificationCode", reqParamJson,
				function(data) {
					state = data.code;
					if(state == 0){
						$("#emailCodeMsg").addClass("onShow").removeClass('onError').empty().html("<span></span>"+data.msg);
						iCount = setInterval('setTimeOut_.changeTime()',1000);
					}
					else if(state == -1){
						$("#emailCodeMsg").removeClass("onShow").addClass('onError').empty().html("<span></span><i class='text-error icon-ban-circle'></i> "+data.msg);
						$("#sendMessage").removeAttr('disabled');
					}
					/*else if(state == -2){
						$("#emailCodeMsg").removeClass("onShow").addClass('onError').empty().html("<span></span><i class='text-error icon-ban-circle'></i> "+data.msg);
						$("#sendMessage").removeAttr('disabled');
					}*/
				});
		}else{
			$("#sendMessage").removeAttr('disabled');
		}

	});
});
var Modify = {
	modify: function(){
		$("#step3 :input").trigger('blur');
		if (valiter.isNull($.trim($("#password").val())) || $.trim($("#password").val()).length < 1) {
			$("#pwdMsg").removeClass("onShow").addClass('onError').html("<span></span><i class='text-error icon-ban-circle'></i> 请输入8-32位半角字符，可为字母、数字及组合，区分大小写");
		}
		if(valiter.isNull($("#rePassword").val())){
			$("#rePwdMsg").removeClass("onShow").addClass('onError').html("<span></span><i class='text-error icon-ban-circle'></i> 确认新密码不能为空");
		};
		var back = false;
		back = Modify.valite('#step3 .onError');
		if (!back) {
			return;
		}
		var account = $.trim($("#account").val());
		var email = "";
		var password = $.trim($("#password").val());
		var emailCode=$('#emailCode').val();
		var reqParamJson= {
			"account":account,
			"email":"",
			"verificationCode":emailCode
		};
		Dcp.biz.apiRequest("/pm/checkVerificationCode", reqParamJson,
			function(data) {
				state = data.code;
				if(state == 0){
					checkEmailCode=true;
				}else{
					checkEmailCode=false;
				}
			});
		if(!checkEmailCode){
			$("#resetMsg").empty().html("邮箱验证码校验失败，重置密码失败，请稍后刷新重试。");
			return;
		};
		var data = {
			"account":account,
			"email":email,
			"password":password
		};
		Dcp.biz.apiRequest("/pm/resetForgotPassword", data,
			function(data) {
				state = data.code;
				if(state == 0){
					$("#resetMsg").empty().html("重置密码成功，新的密码已发至您的邮箱。");
					//setTimeout(function(){window.location = CONTEXT_PATH+"/jsp/login.jsp";},5000);
					msgModal.show();
				}
				else{
					$("#resetMsg").empty().html("重置密码失败，请稍后刷新重试。");
				}
			});

	},
	valite : function(path) {
		var numError = $(path).length;
		if (numError) {
			return false;// test
		}
		else
			return true;// test
	},
	firstStep:function(){
		$("#step1 :input").trigger('blur');
		if (valiter.isNull($.trim($("#account").val())) || $.trim($("#account").val()).length < 1) {
			$("#accountMsg").removeClass("onShow").addClass("onError").html("<span></span><i class='text-error icon-ban-circle'></i> 用户名不能为空");
			//return;
		}
		/*if (valiter.isNull($.trim($("#email").val())) || $.trim($("#email").val()).length < 1) {
			$("#emailMsg").addClass("onError").html("<span></span><i class='text-error icon-ban-circle'></i> 邮箱不能为空");
			//return;
		}*/
		if(valiter.isNull($("#messageCode").val())){
			$("#messageCodeMsg").addClass('onError').html("<span></span><i class='text-error icon-ban-circle'></i> 验证码不能为空");
			return;
		};
		$.ajax({
			url : "../pr/verifyMessageCode",
			type : 'POST',
			data : {
				code : $("#messageCode").val()
			},
			async : false,
			cache : false,
			dataType : 'json',
			success : function(state) {
				var stateX = state+"";
				if (stateX == "false") {
					//$("#capMsg").addClass("onError").html("* 验证码输入错误");
					$("#messageCodeMsg").removeClass("onShow").addClass("onError").html("<span></span><i class='text-error icon-ban-circle'></i> "+Dict.val("wo_incorrect_verification_code"));
					changeMessageImg();
					$("#messageCode").val("");
					return;
				}
				// 验证码session超时
				else if (stateX == "timeout") {
					//$("#capMsg").addClass("onError").html("* 操作超时，请重新输入验证码！");
					$("#messageCodeMsg").removeClass("onShow").addClass("onError").html("<span></span><i class='text-error icon-ban-circle'></i> "+Dict.val("wo_the_operation_timed_out"));
					changeMessageImg();
					$("#messageCode").val("");
					return;
				}
			}
		});
		var back = false;
		back = Modify.valite('#step1 .onError');
		if (!back) {
			return;
		};
		//var email = $.trim($("#email").val());
		var email = "";
		var account=$.trim($("#account").val());
		var reqParamJson={
			"account":account,
			"email":email
		};
		Dcp.biz.apiRequest("/pm/checkAccountAndMail", reqParamJson,
			function(data) {
				state = data.code;
				if(state == 0){
					$("#checkEmail").empty().html(account);
					$("#lastCheckEmail").empty().html(account);
					$("#step1").hide();
					$("#step").css('background',"url('../images/stepTwo.png') no-repeat");
					$("#step ul li").eq(0).css('color','#2e2e2e');
					$("#step ul li").eq(1).css('color','#fff');
					$("#step2").show();
					$("#step3").hide();
				}
				else if(state == -1){
					$("#accountMsg").removeClass("onShow").addClass('onError').empty().html("<span></span><i class='text-error icon-ban-circle'></i> "+data.msg);
				}
				/*else if(state == -2){
					$("#emailMsg").removeClass("onShow").addClass('onError').empty().html("<span></span><i class='text-error icon-ban-circle'></i> "+data.msg);
				}*/
			});
	},
	secondStep:function(){
		var emailCode=$('#emailCode').val();
		var account=$.trim($("#account").val());
		var email=1;
		var reqParamJson= {
			"account":account,
			"email":"1",
			"verificationCode":emailCode
		};
		Dcp.biz.apiRequest("/pm/checkVerificationCode", reqParamJson,
			function(data) {
				state = data.code;
				if(state == 0){
					$("#emailCodeMsg").addClass("onShow").removeClass('onError').empty().html(data.msg);
					$("#step1").hide();
					$("#step2").hide();
					$("#step").css('background',"url('../images/stepThree.png') no-repeat");
					$("#step ul li").eq(0).css('color','#2e2e2e');
					$("#step ul li").eq(1).css('color','#2e2e2e');
					$("#step ul li").eq(2).css('color','#fff');
					$("#step3").show();
				}
				else if(state == -1){
					$("#emailCodeMsg").removeClass('onShow').addClass('onError').empty().html("<span></span><i class='text-error icon-ban-circle'></i> "+data.msg);
					return;
				}
				else if(state == -2){
					$("#emailCodeMsg").removeClass('onShow').addClass('onError').empty().html("<span></span><i class='text-error icon-ban-circle'></i> "+data.msg);
					return;
				}
				/*else if(state == -3){
					$("#emailCodeMsg").removeClass('onShow').addClass('onError').empty().html("<span></span><i class='text-error icon-ban-circle'></i> "+data.msg);
					return;
				}
				else if(state == -4){
					$("#emailCodeMsg").removeClass('onShow').addClass('onError').empty().html("<span></span><i class='text-error icon-ban-circle'></i> "+data.msg);
					return;
				}*/
				else if(state == -5){
					$("#emailCodeMsg").removeClass('onShow').addClass('onError').empty().html("<span></span><i class='text-error icon-ban-circle'></i> "+data.msg);
					return;
				}
				else if(state == -6){
					$("#emailCodeMsg").removeClass('onShow').addClass('onError').empty().html("<span></span><i class='text-error icon-ban-circle'></i> "+data.msg);
					return;
				}
				else if(state == -7){
					$("#emailCodeMsg").removeClass('onShow').addClass('onError').empty().html("<span></span><i class='text-error icon-ban-circle'></i> "+data.msg);
					return;
				}
			});
	},
	checkEmail:function(callback){
		var ret = true;
		var data = {email:$.trim($("#email").val())};
		Dcp.biz.apiAsyncRequest("/user/uniqueCheck", data,function(data) {
			var flag = data.code;
			if(flag == -1){
				ret = false;
			}
			callback(ret);
		});
		return ret;
	}
};

msgModal = new com.skyform.component.Modal("msgModal","<h4>信息</h4>","<p>重置密码成功，新的密码已发至您的邮箱。</p>",{
	buttons : [
		{name:'关闭',onClick:function(){
			msgModal.hide();
			window.location = CONTEXT_PATH+"/jsp/login.jsp";
		},attrs:[{name:'class',value:'btn'}]}
	],
	afterHidden : function(){
		if(msgModal.afterHidden && typeof msgModal.afterHidden == 'function') {
			msgModal.afterHidden();
		}
	}
});
setTimeOut_ = {
	changeTime : function (){
		if(max_num > 0){
			max_num = max_num - 1;
			curnum = max_num;
			$("#sendMessage").val("请"+curnum+"秒后重试");
		}
		else{
			if(max_num == 0){
				$("#sendMessage").val("获取验证码");
				$("#sendMessage").removeAttr('disabled');
				clearInterval(iCount);
			}
		};
		if(max_num == 55){
			$("#emailCodeMsg").removeClass("onShow").removeClass('onError').empty().html("");
		}
	}
};
