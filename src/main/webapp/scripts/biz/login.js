var portalType = "";
var timeOut=60;
$(function(){
	portalType = Dcp.biz.getCurrentPortalType();
	if('public' == portalType){
		$("#publicRegister").show();
		$("#publicReActive").show();
	};
	GetAllCookie();
	$("#loginSubmit").click(function(){
		if($("#loginSubmit").attr("state")=="0"){
			LoginFirst.login();
		}
		else
			Login.login();
	});
	//为回车键绑上登陆事件
	$("body").bind("keydown",function(e){
		if(e.keyCode==13 && $("#loginSubmit").attr("state")=="0"){
			LoginFirst.login();
		}
		else if(e.keyCode==13 && $("#loginSubmit").attr("state")=="1"){
			Login.login();
		}
		else if(e.keyCode==13 && $("#loginSubmit").attr("state")=="-2"){
			Login.login();
		}
		else
			return;
	});
	$("#regSubmit").click(function(){
		location.href = "register.jsp";
	});
	$('body :input').blur(
		function() {
			// 验证帐号
			if ($(this).is('#username')) {
				if($.trim(this.value).length < 1 ){
					//$("#nameMsg").addClass("onError").html("* 用户名不能为空");
					//$("#logMsg").addClass("onError").html(Dict.val("wo_user_name_not_empty"));
					//$("#logMsg").addClass("onError").html("请您填写用户名");
				}
			}
			// 验证密码
			if ($(this).is('#password')) {
				if($.trim(this.value).length < 1 ){
					//$("#pwdMsg").addClass("onError").html("* 密码不能为空");
					//$("#logMsg").addClass("onError").html(Dict.val("tenant_password_not_empty"));
					//$("#logMsg").addClass("onError").html("请您填写密码");
				}
				else{
					//$("#pwdMsg").removeClass("onError").html("");
					//$("#logMsg").removeClass("onError").html("");
				}
			}
			// 验证验证码
			else if($("#loginSubmit").attr("state")!=="0"){
				if ($(this).is('#captcha')) {
					if($.trim(this.value).length < 1 ){
						//$("#capMsg").addClass("onError").html("* 验证码不能为空");
						//$("#logMsg").addClass("onError").html(Dict.val("wo_code"));
					}
				}
			}

		});
	$('body :input').focus(
		function() {
			// 验证帐号
			if ($(this).is('#username')) {
				if($.trim(this.value).length < 1 ){
					//$("#nameMsg").removeClass("onError").html("");
					$("#logMsg").removeClass("onError").html("");
					//GetAllCookie();
				}
			}
			// 验证密码
			else if ($(this).is('#password')) {
				if($.trim(this.value).length >=0 ){
					//$("#pwdMsg").removeClass("onError").html("");
					$("#logMsg").removeClass("onError").html("");
				}
			}
			// 验证验证码
			else if($("#loginSubmit").attr("state")!=="0"){
				if ($(this).is('#captcha')) {
					if($.trim(this.value).length < 1 ){
						//$("#capMsg").removeClass("onError").html("");
						$("#logMsg").removeClass("onError").html("");
					}
				}
			}
		});
	$("#password").change(function(){
		$("#logMsg").removeClass("onError").html("");
	});
	//用户名禁止输入空格
	$('#username').keydown(function(e){
		var keynum;
		e=e||event;
		if(window.event) // IE
		{
			keynum = e.keyCode
		}
		else if(e.which) // Netscape/Firefox/Opera
		{
			keynum = e.which
		}
		if(keynum == 32){
			return false;
		}
		return true;
	});
	$("#getNum").mouseover(function(){
		$(this).css("background","#286090");
		$(this).css("color","#fff");
	});
	$("#getNum").mouseout(function(){
		$(this).css("background","#fff");
		$(this).css("color","#a7a7a7");
	});
	checkPhoneOrPhoneCode();
});

//首次登录失败之后的登录
var Login = {
	login: function(){
		//$("body :input").trigger('blur');
		checkUserOrPassword();
		var loginName = $("#username").val();
		var loginPass = $("#password").val();
		var loginCap = $("#captcha").val();
		if (loginName.length < 1) {
			$("#username").val("");
			//$("#nameMsg").addClass("onError").html("* 用户名不能为空");
			$("#logMsg").addClass("onError").html(Dict.val("wo_user_name_not_empty"));
		}
		else  if (loginPass.length < 1) {
			$("#password").val("");
			//$("#pwdMsg").addClass("onError").html("* 密码不能为空");
			$("#logMsg").addClass("onError").html(Dict.val("tenant_password_not_empty"));
		}
		else if (loginCap.length < 1) {
			$("#captcha").val("");
			//$("#capMsg").addClass("onError").html("* 验证码不能为空");
			$("#logMsg").addClass("onError").html(Dict.val("wo_code"));
			return;
		}
		var back = false;
		back = Login.valite();
		if (!back) {
			return;
		}
		var securityLevel = Login.getSecurityLevel(loginPass);
		var data = JSON.stringify({
			username: loginName,
			password: loginPass,
			portalType:portalType,
			securityLevel:securityLevel
		});
		$.ajax({
			url : "../pr/login",
			data : data,
			type : "POST",
			dataType:'json',
			async : false,
			success : function(result) {
				var state = result.code;
				if(state == 0){
					//登陆成功
					writeCookie();
					/*绑定手机号star*/
					Dcp.biz.apiRequest("/pm/userLegitimacyCheck", {"loginName":result.data.account},function(data){
						if(data.code==-3){
							$("#bindPhoneDiv").modal("show");
							$("#bindPhoneDiv").modal({backdrop:"static", keyboard:false});
							checkPhoneOrPhoneCode();
							bindMobile(result);
						}else{
							//支持第三方跳转
							window.location = loginRedirect(result, window.returnURL);
							return;
						}
					});
					/*绑定手机号end*/
				}else if(state == 1){
					//登陆失败
					$("#password").val("");
					//$("#password").focus();
					$("#logMsg").addClass("onError").html(Dict.val("wo_correct_user_name_password"));
				}else if(state == 2){
					$("#password").val("");
					//$("#password").focus();
					$("#logMsg").addClass("onError").html(Dict.val("wo_user_has_not_yet_become_effective"));
				}else if(state==-3){
					$("#password").val("");
					//$("#password").focus();
					$("#logMsg").addClass("onError").html("您输入的帐号或密码有误");
				}else if(state==-2){
					$("#password").val("");
					//$("#password").focus();
					$("#logMsg").addClass("onError").html("查询到多个用户，请联系管理员！");
				}else if(state==-5){
					$("#password").val("");
					//$("#password").focus();
					$("#logMsg").addClass("onError").html("您用户登记的手机号码非法，请修改手机号码！");
				}else{
					$("#password").val("");
					//$("#password").focus();
					$("#logMsg").addClass("onError").html(result.msg);
				}
				$("#find_imgvercode").click();
			},
			error    : function() {
				$("#logMsg").addClass("onError").html(Dict.val("wo_sorry_your_request_failed"));
				$("#find_imgvercode").click();
			}
		});
	},

	getSecurityLevel:function(string){
		if(/[a-zA-Z]+/.test(string) && /[0-9]+/.test(string) && /\W+\D+/.test(string)) {
			return "3";
		}else if(/[a-zA-Z]+/.test(string) || /[0-9]+/.test(string) || /\W+\D+/.test(string)) {
			if(/[a-zA-Z]+/.test(string) && /[0-9]+/.test(string)) {
				return "2";
			}else if(/\[a-zA-Z]+/.test(string) && /\W+\D+/.test(string)) {
				return "2";
			}else if(/[0-9]+/.test(string) && /\W+\D+/.test(string)) {
				return "2";
			}else{
				return "1";
			}
		}
	},
	valite : function() {
		var numError = $('.onError').length;
		if (numError) {
			return false;
		}
		else {
			var ret = false;
			$.ajax({
				url : "../pr/verifyCode",
				type : 'POST',
				data : {
					code : $("#captcha").val()
				},
				async : false,
				cache : false,
				dataType : 'json',
				success : function(state) {
					var stateX = state+"";
					if (stateX == "false") {
						//$("#capMsg").addClass("onError").html("* 验证码输入错误");
						$("#logMsg").addClass("onError").html(Dict.val("wo_incorrect_verification_code"));
						changeImg();
						$("#captcha").val("");
					}
					// 验证码session超时
					else if (stateX == "timeout") {
						//$("#capMsg").addClass("onError").html("* 操作超时，请重新输入验证码！");
						$("#logMsg").addClass("onError").html(Dict.val("wo_the_operation_timed_out"));
						changeImg();
						$("#captcha").val("");
					}
					else
						ret =  true;
				}
			});
			return ret;
		}
	}
};

//首次登陆
var LoginFirst = {
	login: function(){
		//$("body :input").trigger('blur');
		checkUserOrPassword();
		var loginName = $("#username").val();
		var loginPass = $("#password").val();
		if (loginName.length < 1) {
			$("#username").val("");
			// $("#nameMsg").addClass("onError").html("* 用户名不能为空");
			$("#logMsg").addClass("onError").html(Dict.val("wo_user_name_not_empty"));
		}
		else if (loginPass.length < 1) {
			$("#password").val("");
			//$("#pwdMsg").addClass("onError").html("* 密码不能为空");
			$("#logMsg").addClass("onError").html(Dict.val("tenant_password_not_empty"));
		}
		var back = false;
		back = LoginFirst.valite();
		if (!back) {
			return;
		}
		var securityLevel = Login.getSecurityLevel(loginPass);
		var data = JSON.stringify({
			username:loginName,
			password:loginPass,
			portalType:portalType,
			securityLevel:securityLevel
		});
		$.ajax({
			//url : "http://172.31.100.39:8082/portal/user/getCustomerByCustomerId",
			url : "../pr/login",
			data : data,
			type : "POST",
			dataType:'json',
			"async" : false,
			"cache" : false,
			success : function(result) {
				var state = result.code;
				if(state == 0){
					//登陆成功
					writeCookie();
					/*绑定手机号star*/
					Dcp.biz.apiRequest("/pm/userLegitimacyCheck", {"loginName":result.data.account},function(data){
						if(data.code==-3){
							$("#bindPhoneDiv").modal("show");
							$("#bindPhoneDiv").modal({backdrop:"static", keyboard:false});
							checkPhoneOrPhoneCode();
							bindMobile(result);
						}else{
							//支持第三方跳转
							window.location = loginRedirect(result, window.returnURL);
							return;
						}
					});
					/*绑定手机号end*/
				}else if(state == 1){
					//登陆失败
					$("#password").val("");
					//$("#password").focus();
					var t = parseInt($("#loginSubmit").attr("state"))+1;
					$("#loginSubmit").attr("state",t);
					$("#capDiv").css("display","");
					$("#logMsg").addClass("onError").html(Dict.val("wo_correct_user_name_password"));
				}else if(state == 2){
					$("#password").val("");
					//$("#password").focus();
					$("#logMsg").addClass("onError").html(Dict.val("wo_user_has_not_yet_become_effective"));
				}else if(state==-4){
					$("#password").val("");
					//$("#password").focus();
					$("#logMsg").addClass("onError").html(result.msg);
					$("#loginSubmit").attr("state",state);
					$("#capDiv").show();
				}else if(state==-3){
					$("#password").val("");
					//$("#password").focus();
					$("#logMsg").addClass("onError").html("您输入的帐号或密码有误");
				}else if(state==-2){
					$("#password").val("");
					//$("#password").focus();
					$("#logMsg").addClass("onError").html("查询到多个用户，请联系管理员！");
				}else if(state==-5){
					$("#password").val("");
					//$("#password").focus();
					$("#logMsg").addClass("onError").html("您用户登记的手机号码非法，请修改手机号码！");
				}else{
					$("#password").val("");
					//$("#password").focus();
					$("#logMsg").addClass("onError").html(result.msg);
				}
			},
			error    : function() {
				$("#logMsg").addClass("onError").html(Dict.val("wo_sorry_your_request_failed"));
			}
		});

	},
	valite : function() {
		var numError = $('.onError').length;
		if (numError) {
			return false;
		}else {
			return true;
		}
	}
};

msgModal = new com.skyform.component.Modal("msgModal","<h4>信息</h4>","",{
	buttons : [
		{name:'关闭',onClick:function(){
			msgModal.hide();
		},attrs:[{name:'class',value:'btn'}]}
	],
	afterHidden : function(){
		if(msgModal.afterHidden && typeof msgModal.afterHidden == 'function') {
			msgModal.afterHidden();
		}
	}
});
//cookie记录用户名start
function SetCookie(name, value, expires,path) {
	var argv = SetCookie.arguments;
	var argc = SetCookie.arguments.length;
	var expires = (argc > 2) ? argv[2] : null;
	var path = (argc > 3) ? argv[3] : null;
	var domain = (argc > 4) ? argv[4] : null;
	var secure = (argc > 5) ? argv[5] : false;
	document.cookie = name + "=" + (value) + ((expires == null) ? "" : ("; expires=" + expires.toGMTString())) + ((path == null) ? "" : ("; path=" + path)) + ((domain == null) ? "" : ("; domain=" + domain)) + ((secure == true) ? "; secure" : "");
};
function writeCookie(){
	var userName="User"+$("#username").val();
	var value=$("#username").val();
	var expdate = new Date();
	expdate.setTime(expdate.getTime() + 1000 * (24 * 60 * 60 * 1000));
	var path="/portal/jsp/";
	SetCookie(userName,value,expdate,path);
};
//获取指定cookie
function GetAllCookie1() {
	$("#cookie_name ul").empty();
	var cookieArray=document.cookie.split("; ",3);
	if(cookieArray[0]!=""){
		$("#cookie_name").show();
	};
	for(var i=0;i<cookieArray.length;i++){
		if(cookieArray[i].split("=")[0]!="JSESSIONID"){
			if(cookieArray[i].split("=")[0]!=""){
				var cookie_li=$("<li>"+cookieArray[i].split("=")[1]+"</li>");
				$("#cookie_name ul").append(cookie_li);
				cookie_li.click(function(){
					$("#username").val($(this).text());
					$("#cookie_name").hide();
				});
			}
		}
	}
};
function GetAllCookie(){
	var userName_cookie=[];
	var k=0;
	var cookieArray=document.cookie.split("; ");
	for(var i=0;i<cookieArray.length;i++){
		if(cookieArray[i].split("=")[0][0]=="U"){
			if(cookieArray[i].split("=")[0]!=""){
				userName_cookie[k++]="\""+cookieArray[i].split("=")[1]+"\"";
			}
		}
	}
	$("#username").attr("data-source","["+userName_cookie+"]");
};
//校验用户名或密码是否为空
function checkUserOrPassword(){
	if($.trim($('#username').val()).length < 1 ){
		$("#logMsg").addClass("onError").html("请您填写用户名");
	}
	// 验证密码
	else if($.trim($('#password').val()).length < 1 ){
		$("#logMsg").addClass("onError").html("请您填写密码");
	}
	// 验证验证码
	else if($("#loginSubmit").attr("state")!=="0"){
		if($.trim($('#captcha').val()).length < 1 ){
			$("#logMsg").addClass("onError").html(Dict.val("wo_code"));
		}
	}
}
/*绑定手机号*/
function bindMobile(result){
	$("#bindPhoneDiv .close").mouseup(function(){
		//支持第三方跳转
		window.location = loginRedirect(result, window.returnURL);
		return;
	})
	$("#bindPhoneBtn").unbind("click").bind("click",function(){
		var PhotoNum=$("#phoneInput").val();
		var PhotoCodem=$("#confirmNumInput").val();
		if(PhotoNum==""||PhotoCodem==""){
			$("#bindPhoneTip").show().html("* 手机号或验证码不能为空");
			return;
		}
		Dcp.biz.apiRequest("/pm/modifyMobileNo", {"account":result.data.account, "mobile":PhotoNum, "verificationCode":PhotoCodem},function(data){
			if(data.code==0){
				$("#bindPhoneDiv").modal("hide");
				$("#bindOkDiv").modal("show");
				$("#bindOkDiv").modal({backdrop:"static", keyboard:false});
				$("#bindOk").click(function(){
					$("#bindOkDiv").modal("hide");
					//支持第三方跳转
					window.location = loginRedirect(result, window.returnURL);
					return;
				});
			}else{
				$("#bindPhoneTip").show().html(data.msg);
				return;
			}
		});
	});
};
function checkPhoneOrPhoneCode(){
	$("#phoneInput").focus(function(){
		$("#bindPhoneTip").hide().html("");
	});
	$("#confirmNumInput").focus(function(){
		$("#bindPhoneTip").hide().html("");
	});
	$("#phoneInput").unbind("blur").bind("blur",function(){
		var phoneNum=$("#phoneInput").val();
		if(valiter.isNull($.trim(phoneNum)) || $.trim(phoneNum).length < 1 ){
			$("#bindPhoneTip").show().html("* 请输入您的手机号");
			return
		}else if(!valiter.mobilephone($.trim(phoneNum))){
			$("#bindPhoneTip").show().html("* 您输入的手机号有误");
			return;
		}else{
			$("#bindPhoneTip").html("").hide();
		}
		var data = {mobile:$.trim($("#phoneInput").val())};
		Dcp.biz.apiRequest("/pm/userLegitimacyCheck", {"loginName":$("#phoneInput").val()},function(data){
			if(data.code==-2||data.code==-3){
				$("#bindPhoneTip").show().html("* "+data.msg);
			}else if(data.code==-4){
				$("#bindPhoneTip").show().html("* 您输入的手机号已绑定其他账号，请更换");
			}
		});
	});
	$("#confirmNumInput").unbind("blur").bind("blur",function(){
		var phoneCode=$("#confirmNumInput").val();
		if(valiter.isNull($.trim(phoneCode)) || $.trim(phoneCode).length < 1 ){
			$("#bindPhoneTip").show().html("* 请输入手机验证码");
			return;
		}
	});
	$("#getNum").unbind("click").bind("click",function(){
		var data = {mobile:$.trim($("#phoneInput").val())};
		if(valiter.isNull($.trim($("#phoneInput").val())) || $.trim($("#phoneInput").val()).length < 1||!valiter.mobilephone($.trim($("#phoneInput").val()))){
			$("#bindPhoneTip").show().html("* 您输入的手机号有误");
			return;
		}
		Dcp.biz.apiRequest("/pm/userLegitimacyCheck", {"loginName":$("#phoneInput").val()},function(data){
			if(data.code==-2||data.code==-3){
				$("#bindPhoneTip").show().html("* "+data.msg);
			}else if(data.code==-4){
				$("#bindPhoneTip").show().html("* 您输入的手机号已绑定其他账号，请更换");
			}else if(data.code==0||data.code==-1){
				Dcp.biz.apiAsyncRequest("/user/sendMessage", {"telNumber":parseInt($("#phoneInput").val()),"code":"","source":"register"},function(data){
					if(data.code==0){
						$("#bindPhoneTip").show().html("* 手机验证码发送成功");
						$("#getNumMask").show();
						$("#getNumMask").css({"width":$("#getNum").outerWidth(true) ,"height":$("#getNum").outerHeight(true),"line-height":"36px","color":"#2388c5"});
						var times=setInterval(function(){
							$("#getNumMask").html("请"+timeOut+"s后重试");
							timeOut-=1;
							if(timeOut<=0){
								timeOut=60;
								clearInterval(times);
								$("#getNumMask").hide();
								$("#getNumMask").css({"width":"0px" ,"height":"0px","line-height":"0px"});
							}
						},1000);
					}else{
						$("#bindPhoneTip").show().html("* 手机验证码发送失败，请刷新重试");
						$("#getNumMask").hide();
						$("#getNumMask").css({"width":"0px" ,"height":"0px"});
					}
				})
			}
		});
	});
};
function loginRedirect(result, returnURL){
	//支持第三方跳转
	if(returnURL.indexOf("http://") != -1
		|| returnURL.indexOf("https://") != -1){
		var suffix="";
		var token = result.data.token
		var uuid = result.data.id
		if(returnURL.indexOf("?")==-1){
			suffix = "?id="+uuid+"&tk="+token;
		}else{
			suffix = "&id="+uuid+"&tk="+token;
		}
		return returnURL+suffix;
	}else{
		return returnURL;
	}

}
