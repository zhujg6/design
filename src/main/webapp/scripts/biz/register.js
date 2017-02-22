var timeOut = 60;
var max_num = 0;
var resourcePools="";
var iCount;
var sliderLeft=0;
var sliderTop=0;
$(function(){
	//注册按钮的disabled
	$("#regSubmit").unbind("click").bind("click", function(){
		var keyFlag = $("#regSubmit").attr("keyFlag");
		$("#regSubmit").attr("keyFlag","0");
		if(keyFlag == "0"){
			//if($("input:radio:checked").val()==2){
			//	comRegister.register();
			//}
			//else if($("input:radio:checked").val()==1){
			//	Register.register();
			//}
			//else
			//	return;
			Register.register();
		}
		//changeMessageImg();
		//$("#messageCodeMsg").removeClass("onShow").removeClass("onError").html("");
	});
	var pools = Config.publicregisterpools;
	$("#resourcePool_update").empty();
	var boolKey=true;
	var poolDesc="";
	$.each(pools,function(key,value){
		var pool = $('<option value="'+key+'">'+value+'</option>');
		if(boolKey){
			pool = $('<option value="'+key+'" selected="selected">'+value+'</option>');
		}
		pool.appendTo($("#resourcePool_update"));
		boolKey=false;
	});
	$("#resourcePool_update").multiselect({
		selectedText: poolDesc,
		checkAllText: "全选",
		uncheckAllText: '全不选',
		selectedList:4,
		noneSelectedText: "==请选择=="
	});
	var row = $("body").find("input[type='checkbox']:checked");
	var resourePool="";
	$.each(row, function(index, value) {
		if(index+1==row.length){
			resourePool+=$(value).val();
		}else{
			resourePool+=$(value).val()+",";
		}

	});
	resourcePools=resourePool;
	$("#password").bind("keyup",function(){
		//AuthPasswd($("#password").val());
	});
	//为回车键绑上注册事件
	$("#regSubmit").bind("keydown",function(e){
		//$("#regSubmit").attr("keyFlag","1");
		if(e.keyCode==13){
				Register.register();
			}
		//if(e.keyCode==13 && $("input:radio:checked").val()==1){
		//	Register.register();
		//}
		//else if(e.keyCode==13 && $("input:radio:checked").val()==2){
		//	comRegister.register();
		//}
		//else
		//	return;
		//changeMessageImg();
		//$("#messageCodeMsg").removeClass("onShow").removeClass("onError").html("");
	});
	//判断是个人用户还是企业用户
	$("input:radio").click(function(){
		if($("input:radio:checked").val()==1){
			$("#username").attr("placeholder","请输入用户姓名");
			$("#userNameShow").text("用户姓名");
		} else{
			$("#username").attr("placeholder","请输入公司名称");
			$("#userNameShow").text("公司名称");
		}
	});
	$("input:radio").each(function(index,item){
		if(item.checked){
			$(item).trigger("click");
		}
	});
	$('body :input').blur(
		function() {
			// 验证帐号
			/*if ($(this).is('#username')) {
			 var username = this.value;
			 $("input:radio").each(function(index,item){
			 if(item.checked){
			 if(item.value == "1"){
			 if (valiter.isNull($.trim(username))) {
			 $("#nameMsg").addClass("onError").html("* 用户姓名不能为空");
			 }
			 }else if(item.value == "2"){
			 if (valiter.isNull($.trim(username))) {
			 $("#nameMsg").addClass("onError").html("* 公司名称不能为空");
			 }
			 }
			 }
			 });
			 }*/
			// 验证密码
			if ($(this).is('#password')) {
				if(valiter.isNull($.trim(this.value)) || $.trim(this.value).length < 1 ){
					$("#pwdMsg").removeClass("onShow").removeClass("onError").html("");
				}
			}
			// 验证登入密码
			if ($(this).is('#password')) {
				if (($.trim(this.value).length >=1&&$.trim(this.value).length < 8)||$.trim(this.value).length>32) {
					var errorMsg = "<span></span><i class='text-error icon-ban-circle'></i> 8-32位半角字符，可为字母、数字及组合，区分大小写";
					$("#pwdMsg").removeClass("onShow").addClass("onError").html(errorMsg);
				}
				else if(valiter.isNull($.trim(this.value)) || $.trim(this.value).length < 1 ){
					$("#pwdMsg").removeClass("onShow").removeClass("onError").html("");
				}
				else if ((!valiter.isNull($("#rePassword").val()))
					&& this.value != $("#rePassword").val()) {
					var errorMsg = "<span></span><i class='text-error icon-ban-circle'></i> 确认密码与登录密码不一致";
					$("#rePwdMsg").removeClass("onShow").addClass("onError").html(errorMsg);
					$("#rePwdMsg").val("");
				}
				else {
					$("#pwdMsg").removeClass("onShow").removeClass("onError").html("<i class='text-info icon-ok-sign'></i>");
				}
			}

			// 验证确认密码
			if ($(this).is('#rePassword')) {
				if (valiter.isNull(this.value)) {
					var errorMsg = "<span></span><i class='text-error icon-ban-circle'></i> 确认密码与登录密码不一致";
					$("#rePwdMsg").removeClass("onShow").removeClass("onError").html("");
				}
				else if(this.value.length < 8||$.trim(this.value).length>32){
					var errorMsg = "<span></span><i class='text-error icon-ban-circle'></i> 确认密码与登录密码不一致";
					$("#rePwdMsg").removeClass("onShow").addClass("onError").html(errorMsg);
				}
				else if ((!valiter.isNull(this.value))
					&& this.value != $("#password").val()) {
					var errorMsg = "<span></span><i class='text-error icon-ban-circle'></i> 确认密码与登录密码不一致";
					$("#rePwdMsg").removeClass("onShow").addClass("onError").html(errorMsg);
				}
				else {
					$("#rePwdMsg").removeClass("onShow").removeClass("onError").html("<i class='text-info icon-ok-sign'></i>");
				}
			}
			// 验证邮箱
			if ($(this).is('#email')) {
				var errorMsg = "<span></span><i class='text-error icon-ban-circle'></i> 请输入正确的邮箱格式，例如：xx@xx.xx";
				if (valiter.isNull($.trim(this.value))&&!valiter.checkYWEmail($.trim(this.value))) {
					$("#emailMsg").removeClass("onShow").removeClass("onError").html("");
				}
				else if(!valiter.checkYWEmail($.trim(this.value))){
					$("#emailMsg").removeClass("onShow").addClass("onError").html(errorMsg);
				}
				else Register.checkEmail(function(ret){
					if(!ret){
						$("#emailMsg").removeClass("onShow").addClass("onError").html("<span></span><i class='text-error icon-ban-circle'></i> 该邮箱已经被注册，请更换邮箱、或使用该邮箱<a href='login.jsp?returnURL=/''>登录</a>");
					}
					else{
						$("#emailMsg").removeClass("onError").removeClass("onShow").html("<i class='text-info icon-ok-sign'></i>");
					}
				});
			}
			//验证手机号码
			if($(this).is('#mobile')){
				var errorMsg = "<span></span><i class='text-error icon-ban-circle'></i> 手机号码格式不正确";
				var errorMsgEmpty = "<span></span><i class='text-error icon-ban-circle'></i> 请输入手机号码";
				var errorMsgT = "<span></span><i class='text-error icon-ban-circle'></i> 该手机号已经被绑定，请直接登录";
				if(!valiter.isNull($.trim(this.value))){
					if (valiter.cellphone($.trim(this.value))) {
						$("#mobileMsg").removeClass("onShow").addClass("onError").html(errorMsg);
					}
					else {
						Register.checkMobile(function(ret){
							if(!ret){
								$("#mobileMsg").removeClass("onShow").removeClass("onError").html("");
								$("#mobileMsg").addClass("onError").html(errorMsgT);
							}
							else {
								$("#mobileMsg").removeClass("onShow").removeClass("onError").html("<i class='text-info icon-ok-sign'></i>");
								$(".nocaptcha-info-mask").hide();
								silderElemnet.css({left:273+"px",top:0+"px"});
								getCaptchaInfo();
								$("#captchaContainer").show();
							}
						});
					}
				}else{
					$("#mobileMsg").removeClass("onShow").removeClass("onError").html("");
				}
			}
			//验证码
			/*if ($(this).is('#messageCode')) {
				var errorMsg = "<span></span><i class='text-error icon-ban-circle'></i> 请输入验证码";
				if (valiter.isNull($.trim(this.value))) {
					$("#messageCodeMsg").removeClass("onShow").removeClass("onError").html("");
				}
				else
					$("#messageCodeMsg").removeClass("onShow").removeClass("onError").html("");
				//Register.valiteMessageCode();
			}*/
			//手机验证码
			if($(this).is("#captcha")){
				$("#capMsg").removeClass("onShow").removeClass("onError").empty("");
			}
		});

	$('body :input').focus(
		function() {
			// 验证帐号
			/*if ($(this).is('#username')) {
			 if($.trim(this.value).length < 1 ){
			 $("#nameMsg").removeClass("onError").html("");
			 }
			 }*/
			// 验证密码
			if ($(this).is('#password')) {
				if($.trim(this.value).length < 1 ){
					$("#pwdMsg").removeClass("onError").addClass("onShow").html("<span></span>8-32位半角字符，可为字母、数字及组合，区分大小写");
				}
			}
			// 验证确认密码
			if ($(this).is('#rePassword')) {
				if($.trim(this.value).length < 1 ){
					$("#rePwdMsg").addClass("onShow").removeClass("onError").html("<span></span>请再输入一次相同的密码");
				}
			}
			// 验证邮箱
			if ($(this).is('#email')) {
				if($.trim(this.value).length < 1 ){
					$("#emailMsg").removeClass("onError").addClass("onShow").html("<span></span>推荐使用常用邮箱，格式如：xx@xx.xx");
				}
			}
			//移动电话
			if($(this).is('#mobile')){
				if($.trim(this.value).length < 1 ){
					$("#mobileMsg").addClass("onShow").removeClass("onError").html("<span></span>请填写手机号码，必须是11位");
				}
			}
			//验证码
			/*if($(this).is('#messageCode')){
				if($.trim(this.value).length < 1 ){
					$("#messageCodeMsg").addClass("onShow").removeClass("onError").html("<span></span>请输入验证码");
				}
			}*/
			//手机验证码
			if ($(this).is('#captcha')) {
				if($.trim(this.value).length < 1 ){
					$("#capMsg").addClass("onShow").removeClass("onError").html("<span></span>请输入手机验证码");
				}
			}
		});
	//$("#sendMessage").click(function(){
	//	if(max_num <= 0){
	//		if(Register.valiteMessageCode()){
	//			max_num = timeOut;
	//			sendMessage();
	//		}
	//	}else{
	//	}
	//});
	$("#sendMessagesNew").click(function(){
		if(max_num <= 0){
			if(Register.valiteMessageCode()){
				max_num = timeOut;
				sendMessage();
			}
		}else{
		}
	});
	$("#agreeServiceTerm").change(function(){//console.log($("#agreeServiceTerm").attr("checked")+"1");
		if($("#agreeServiceTerm").attr("checked")=="checked"){
			$("#regSubmit").removeAttr("disabled");//console.log("false");
		}else{
			$("#regSubmit").attr("disabled","true");//console.log("true");
		}
	});
	//验证star
	//getCaptchaInfo();
	var silderElemnet=$("#silderElemnet");
	var captchaContainer=$("#captchaContainer");
	$("#nocaptcha-change").click(function(){
		$(".nocaptcha-info-mask").hide();
		silderElemnet.css({left:273+"px",top:0+"px"});
		getCaptchaInfo();
	});
	$(".nocaptcha-info-mask").click(function(){
		$(".nocaptcha-info-mask").hide();
		silderElemnet.css({left:273+"px",top:0+"px"});
		getCaptchaInfo();
	});
	silderElemnet.mousedown(function(){
		/*获取container位置*/
		var captchaContainerLeft=captchaContainer.offset().left;
		var captchaContainerTop=captchaContainer.offset().top;
		/*获取滚动条位置*/
		var scrollTop=document.documentElement.scrollTop||document.body.scrollTop;
		var scrollLeft=document.documentElement.scrollLeft||document.body.scrollLeft;
		$("#mask").show();
		captchaContainer.mousemove(function(e){
			e=e||event;
			silderElemnet.css({left:e.clientX+scrollLeft-captchaContainerLeft-30+"px",top:e.clientY+scrollTop-captchaContainerTop-30+"px"});
		})
	});
	silderElemnet.mouseup(function(){
		$("#mask").hide();
		captchaContainer.unbind().mousemove(function(){});
		$(".nocaptcha-info-mask").show();
		if((parseInt(silderElemnet.css('left'))-sliderLeft>-5&&parseInt(silderElemnet.css('left'))-sliderLeft<5)&&(parseInt(silderElemnet.css('top'))-sliderTop>-5&&parseInt(silderElemnet.css('top'))-sliderTop<5)){
			$(".nocaptcha-info-mask span").html('验证码已发送您手机');
			if(max_num <= 0&&Register.valiteMessageCode()){
				max_num = timeOut;
				sendMessage();
			}
			else if(max_num > 0){
				$(".nocaptcha-info-mask span").html('请'+max_num+'s后再试');
			}
			else{
				$(".nocaptcha-info-mask span").html('请认真填写之前信息后再试');
			}
			setTimeout(function(){$("#captchaContainer").hide();},1000);
		}
		else{
			$(".nocaptcha-info-mask span").html('拼图好像不正确，请刷新重试');
		}
	})
	//验证end
});

var Register = {
	register: function(){
		//$("body :input").trigger('blur');
		checkInputIsEmpty();
		var back = false;
		var numError = $('.onError').length;
		if (numError) {
			back=false;
		}else{
			back=true;
		};
		//back = Register.valiteMessageCode();

		var data = $("body").find("input[type='checkbox']:checked");
		var resourePool="";
		$.each(data, function(index, value) {
			if(index+1==data.length){
				resourePool+=$(value).val();
			}else{
				resourePool+=$(value).val()+",";
			}
		});
		resourcePools=resourePool;
		/*if(resourcePools==""){
		 $("#poolMsg").addClass("onError").html("* 数据中心不能为空");
		 }
		 if (!back || resourcePools=="") {
		 return;
		 }
		 $("#poolMsg").removeClass("onError").html("");*/
		if(!back){
			return;
		}
		$("#regSubmit").attr("disabled","disabled");
		var account = $.trim($("#email").val());
		//var username = $.trim($("#username").val());
		var password = $.trim($("#password").val());
		var email = $.trim($("#email").val());
		//  var phone = $.trim($("#phone").val());
		var mobile = $.trim($("#mobile").val());
		var messageCode = $("#captcha").val();
		var data = {
			//resourcePool:resourcePools,
			messageCode:messageCode,
			account:account,
			//username: username,
			password: password,
			email:email,
			mobile:mobile,
			roleId:1
		};
		Dcp.biz.apiRequest("/user/register", data,
			function(data) {
				state = data.code;
				if(state == 0){
					msgModal.setContent("<span class='text-success'><h3>注册成功，请先去您注册的邮箱激活后再登录！<h3>" +
					"如果1小时内还未收到激活邮件，请联系在线客服或者拨打沃云400客服"+
					"</span>");
					msgModal.show();
					msgModal.afterHidden = function(){
						window.location = window.returnURL;
					};
				}
				else if(state == -1){
					//msgModal.setContent("<span class='text-success'><h3>"+data.msg+"<h3></span>");console.log(data.msg);
					//msgModal.show();
					//if(data.msg=='激活码错误,请重新获取!'){
					//	$("#capMsg").removeClass("onShow").addClass("onError").html("<span></span><i class='text-error icon-ban-circle'></i> 手机激活码错误,请重新输入或获取!");
					//}
					$("#capMsg").removeClass("onShow").addClass("onError").html("<span></span><i class='text-error icon-ban-circle'></i> "+data.msg);
					if(data.msg=='激活码错误,请重新获取!'){
						$("#capMsg").removeClass("onShow").addClass("onError").html("<span></span><i class='text-error icon-ban-circle'></i> 手机激活码错误,请重新输入或获取!");
					}
					$("#regSubmit").removeAttr("disabled");
				}
				else if(state == 1){
					msgModal.setContent("<span class='text-success'><h3>注册失败，请联系管理员！<h3></span>");
					msgModal.show();
					$("#regSubmit").removeAttr("disabled");
				}
			});
	},
	valiteMessageCode : function() {
		var numError = $('.onError').length;
		if (numError) {
			return false;
		}
		else{
			return true;
		}
		/*else {
			var ret = false;
			$.ajax({
				url : "../pr/verifyMessageCode",
				type : 'POST',
				data : {
					code : $("#messageCode").val()
				},
				async : false,
				dataType : 'json',
				success : function(state) {
					var stateX = state+"";
					if (stateX == "false") {
						$("#messageCodeMsg").removeClass("onShow").addClass("onError").html("<span></span><i class='text-error icon-ban-circle'></i> 验证码输入错误");
						$("#sss").removeClass("onError").removeClass("onShow").empty();
						changeMessageImg();
					}
					// 验证码session超时
					else if (stateX == "timeout") {
						$("#messageCodeMsg").removeClass("onShow").addClass("onError").html("<span></span><i class='text-error icon-ban-circle'></i> 操作超时，请重新输入验证码！");
						$("#sss").removeClass("onError").removeClass("onShow").empty();
						changeMessageImg();
					}
					else{
						ret =  true;
						$("#messageCodeMsg").removeClass("onShow").removeClass("onError").html("<i class='text-info icon-ok-sign'></i>");
					}
				}
			});
			return ret;
		}*/
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
	},
	checkMobile:function(callback){
		var ret = true;
		var data = {mobile:$.trim($("#mobile").val())};
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

var comRegister = {
	register: function(){
		$("body :input").trigger('blur');
		var back = false;
		//back = Register.valiteMessageCode();
		if (!back) {
			return;
		}
		$("#regSubmit").attr("disabled","disabled");
		var account = $.trim($("#email").val());
		//var username = $.trim($("#username").val());
		var password = $.trim($("#password").val());
		var email = $.trim($("#email").val());
		//  var phone = $.trim($("#phone").val());
		var mobile = $.trim($("#mobile").val());
		var messageCode = $("#captcha").val();
		var data = {
			messageCode:messageCode,
			account:account,
			//username: username,
			password: password,
			email:email,
			mobile:mobile,
			roleId:1
//	        		compCnName:compCnName,
//	        		compOrgCode:compOrgCode,
//	        		compAddress:compAddress,
//	        		//compPhone:compPhone,
//	        		//compFax:compFax,
//	        		compEmail:compEmail
			//checkCode: $.trim($("#activeHost").val())//portal服务地址
		};
		Dcp.biz.apiRequest("/user/createCompany", data,
			function(data) {
				state = data.code;
				if(state == 0){
					msgModal.setContent("<span class='text-success'><h3>注册成功，请先去您注册的邮箱激活后再登录！<h3>" +
					"如果1小时内还未收到激活邮件，请联系在线客服或者拨打沃云400客服"+
					"</span>");
					msgModal.show();
					msgModal.afterHidden = function(){
						window.location = window.returnURL;
					};
				}
				else if(state == -1){
					msgModal.setContent("<span class='text-success'><h3>"+data.msg+"<h3></span>");
					msgModal.show();
					$("#regSubmit").removeAttr("disabled");
				}
				else if(state == 1){
					msgModal.setContent("<span class='text-success'><h3>注册失败，请联系管理员！<h3></span>");
					msgModal.show();
					$("#regSubmit").removeAttr("disabled");
				}
			});
	}

};

TimeOut = {
	changeTime : function (){
		if(max_num > 0)	    {
			max_num = max_num - 1;
			curnum = max_num;
			//$("#sss").removeClass("onError").addClass("onShow").empty().html("<span></span>若"+curnum+"秒后未收到短信，请再次点击获取！");
			$("#sendMessagesNew").empty().html("请"+curnum+"s后重新发送");
		}
		else	   {
			if(max_num == 0){
				$("#sss").removeClass("onError").removeClass("onShow").empty();
				$("#sendMessagesNew").empty().html("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;重新发送");
				clearInterval(iCount);
			}
		}
	}
};
function AuthPasswd(string) {
	if(string.length >=8&&string.length <= 32) {
		if(/[a-zA-Z]+/.test(string) && /[0-9]+/.test(string) && /\W+\D+/.test(string)) {
			noticeAssign(1);
		}else if(/[a-zA-Z]+/.test(string) || /[0-9]+/.test(string) || /\W+\D+/.test(string)) {
			if(/[a-zA-Z]+/.test(string) && /[0-9]+/.test(string)) {
				noticeAssign(-1);
			}else if(/\[a-zA-Z]+/.test(string) && /\W+\D+/.test(string)) {
				noticeAssign(-1);
			}else if(/[0-9]+/.test(string) && /\W+\D+/.test(string)) {
				noticeAssign(-1);
			}else{
				noticeAssign(0);
			}
		}
	}else{
		noticeAssign(null);
	}
}

function noticeAssign(num) {
	if(num == 1) {
		$('#weak').css({backgroundColor:'#009900'});
		$('#middle').css({backgroundColor:'#009900'});
		$('#strength').css({backgroundColor:'#009900'});
	}else if(num == -1){
		$('#weak').css({backgroundColor:'#ffcc33'});
		$('#middle').css({backgroundColor:'#ffcc33'});
		$('#strength').css({backgroundColor:''});
	}else if(num ==0) {
		$('#weak').css({backgroundColor:'#dd0000'});
		$('#middle').css({backgroundColor:''});
		$('#strength').css({backgroundColor:''});
	}else{
		$('#weak').css({backgroundColor:''});
		$('#middle').css({backgroundColor:''});
		$('#strength').css({backgroundColor:''});
	}
}
function to_ADWQ(customerId){
	var _adwq = _adwq || [];
	_adwq.push([
		'_setAction','7xqw3g',customerId
	]);
}
function sendMessage(){
	var telNumber = $("#mobile").val();
	var errorMsg = "<span></span><i class='text-error icon-ban-circle'></i> 输入移动电话号码";
	//var msgCode = $("#messageCode").val();
	Register.checkMobile(function(ret){
		if(!ret){
			errorModal.setWidth(250);
			errorModal.show();
		}
		else {
			if(!valiter.isNull($.trim(telNumber))){
				if (valiter.cellphone($.trim(telNumber))) {
					$("#mobileMsg").removeClass("onShow").removeClass("onError");
					$("#mobileMsg").addClass("onError").empty().html(errorMsg);
				}
				else {
					var currTime = new Date();
					iCount = setInterval('TimeOut.changeTime()',1000);
					telNumber = parseInt(telNumber);
					if(max_num >= timeOut ){
						Dcp.biz.apiAsyncRequest("/user/sendMessage", {"telNumber":telNumber,"code":"","source":"register"},function(data) {
							//changeMessageImg();
							//$("#messageCode").val("");
						});
					}
				}
			}else{
				$("#mobileMsg").removeClass("onShow").addClass("onError").html(errorMsg);
			}
			this.document.getElementById('captcha').focus();
		}
	});
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

errorModal = new com.skyform.component.Modal("msgModal","<h4>提示</h4>","该号码已经被注册,请重新输入!",{
	buttons : [
		{name:'关闭',onClick:function(){
			errorModal.hide();
		},attrs:[{name:'class',value:'btn'}]}
	]
});

function checkInputIsEmpty(){
	//验证密码
	if (valiter.isNull($.trim($('#password').val()))||$.trim($('#password').val()).length<1) {
		$("#pwdMsg").removeClass("onShow").addClass("onError").html("<span></span><i class='text-error icon-ban-circle'></i>密码不能为空");
		};
	// 验证确认密码
	if (valiter.isNull($.trim($('#rePassword').val()))||$.trim($('#rePassword').val()).length<1) {
		var errorMsg = "<span></span><i class='text-error icon-ban-circle'></i> 确认密码不能为空";
		$("#rePwdMsg").removeClass("onShow").addClass("onError").html(errorMsg);
	};
	// 验证邮箱
	if (valiter.isNull($.trim($('#email').val()))||$.trim($('#email').val()).length<1) {
		var errorMsg = "<span></span><i class='text-error icon-ban-circle'></i> 请输入邮箱，格式如：xx@xx.xx";
		$("#emailMsg").removeClass("onShow").addClass("onError").html(errorMsg);
		};
	//验证手机号码
	if(valiter.isNull($.trim($('#mobile').val()))||$.trim($('#mobile').val()).length<1){
		var errorMsgEmpty = "<span></span><i class='text-error icon-ban-circle'></i> 请输入手机号码";
			$("#mobileMsg").removeClass("onShow").addClass("onError").html(errorMsgEmpty);
		};
	//手机验证码
	if(valiter.isNull($.trim($('#captcha').val()))||$.trim($('#captcha').val()).length<1){
			$("#capMsg").removeClass("onShow").addClass("onError").html("<span></span><i class='text-error icon-ban-circle'></i> 请输入短信验证码");
	}
};
function getCaptchaInfo(){
	$.ajax({
		url : "../pr/getPictureVerification.do",
		type : 'POST',
		data : {},
		async : false,
		cache : false,
		dataType : 'json',
		success : function(data) {
			$(".nocaptcha-ori").attr("style","background:url("+".."+data.data.basePictureUrl+")");
			$(".nocaptcha-new").attr("style","background:url("+".."+data.data.deletionPictureUrl+")");
			$("#silderElemnet").attr("style","background:url("+".."+data.data.littlePictureUrl+")");
			var coordinate=data.data.coordinate.split(',');
			sliderLeft=coordinate[0];
			sliderTop=coordinate[1];
		}
	});
}