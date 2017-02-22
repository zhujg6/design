//fix bug 3310
var currentUserId = 0;
$(function() {
	$.ajaxSetup({
		cache : false
	});//设置jQuery ajax缓存
	currentUserId = $("#currentUserId").val();
	$("#oPassword").focus();
	$('#setPassword :input').blur(function(){
		if ($(this).is('#oPassword')) {
			if (valiter.isNull(this.value) || this.value.length < 8||$.trim(this.value).length>32) {
				var errorMsg = Dict.val("user_8_38_password");
				//$("#oPwdMsg").addClass("onError").html(errorMsg);
			}
//			else checkPassword(function(ret){				
//				if(null==ret){
//					$("#oPwdMsg").addClass("onError").html(errorMsg);
//				}    	
//		    	else {
//		    		console.log("ret.data.length的值为："+ret.data.length);
//		    		var errorMsg = "*原密码不符";
//		    		var list = ret.data;
//		        	if(null== ret.data||ret.data.length == 0){
//		        		$("#oPwdMsg").addClass("onError").html(errorMsg);
//		    		}
//		        	else {
//		    			$("#oPwdMsg").removeClass("onError").empty();
//		    		}
//		    	}
//			});
			else $("#oPwdMsg").removeClass("onError").empty();
		}
		// 验证登入密码 
		if ($(this).is('#password')) {					
			if (valiter.isNull(this.value) || this.value.length < 8||$.trim(this.value).length>32) {
				var errorMsg = Dict.val("user_8_38_password");
				$("#pwdMsg").addClass("onError").html(errorMsg);
			}
			else if($(this).val()==$("#oPassword").val()){
				var errorMsg=Dict.val("user_new_password_not_same_old_password");
				$("#pwdMsg").addClass("onError").html(errorMsg);
			}
			
			
			else if ((!valiter.isNull($("#rePassword").val()))
					&& this.value != $("#rePassword").val()) {
				var errorMsg = Dict.val("user_confirm_password_and_password_inconsistent");
				$("#rePwdMsg").addClass("onError").html(errorMsg);
				$("#rePwdMsg").val("");
			}
			else {
				$("#pwdMsg").removeClass("onError").empty();
			}
		}
		// 验证确认密码
		if ($(this).is('#rePassword')) {					
			if (valiter.isNull(this.value) || this.value.length < 8||$.trim(this.value).length>32) {
				var errorMsg = Dict.val("user_8_38_password");
				$("#rePwdMsg").addClass("onError").html(errorMsg);
			} else if ((!valiter.isNull(this.value))
					&& this.value != $("#password").val()) {
				var errorMsg = Dict.val("user_confirm_password_and_password_inconsistent");
				$("#rePwdMsg").addClass("onError").html(errorMsg);
			}
			else {
				$("#rePwdMsg").removeClass("onError").empty();
			}
		}
	});	
	
	$("#pwdSave").click(function(){
		savePassword();
	});
	
	$(".pwdReset").click(function(){
		reset();
	});

});
function savePassword(){	
	$("#setPassword :input").trigger('blur');

	var numError = $("#setPassword .onError").length;
	if (numError) {
		return ;
	}
	var securityLevel=getSecurityLevel($("#password").val());
	var data = {passwordOld:$("#oPassword").val(),password:$("#password").val(),"securityLevel":securityLevel};	
	Dcp.biz.apiAsyncRequest("/user/modifyPassword", data,
			function(data) {
    	state = data.code;
    	if(state == 0){
    		//$("#pwdRetMsg").addClass("onError").html("*修改成功");
    		//alert("修改成功");
    		reset();//清空内容
    		//$("setPassword").on("hidden",successModal.show());   
    		msgModal.setContent("<span class='text-success'><h3>"+Dict.val("user_modify_password_success")+"<h3></span>");
    		msgModal.show();
    		var ctx = $("#ctx").val();
    		window.location.href= ctx +"/jsp/user/userInfo.jsp?code=base&&cataCode=user";
		}
    	else if(state == 1){
    		//$("#pwdRetMsg").addClass("onError").html("*修改失败");
    		msgModal.setContent("<span class='text-success'><h3>"+Dict.val("user_password_modify_fails_contact_administrator")+"<h3></span>");
    		msgModal.show();
    	}
    	else if(state == -1){
    		//$("#pwdRetMsg").addClass("onError").html("*修改失败");
    		msgModal.setContent("<span class='text-success'><h3>"+Dict.val("user_old_password_not_match_modification_fails")+"<h3></span>");
    		msgModal.show();
    	}
	}); 	

	
};
function reset() {	
	//$('#setPassword').modal('hide');
    //$('#setPassword').on('hidden', function () {
    	$("#setPassword .password").each(function() {
    		$(this).val('');
    	});	
    	$("form: .icon-lock").removeClass("onError").empty();
    	$(".msg").removeClass("onError").empty();	
    // })
}



	var account = '';
	Dcp.biz.getCurrentUser(function(data1){
		//console.log("----------------:"+data1.account);
		account = data1.account;
	});


//function checkPassword(callback){
//	console.log("我进入了checkPassword方法");
//	var data = {id:currentUserId,password:$("#oPassword").val()};	
//	Dcp.biz.apiAsyncRequest("/user/uniqueCheck", data,function(ret) {
//		//console.log("我去后台搜索完毕了");
//		callback(ret);
//	}); 	
//}

msgModal = new com.skyform.component.Modal("msgModal","<h4>"+Dict.val("user_information")+"</h4>","",{
	buttons : [
	           {name:Dict.val("common_close"),onClick:function(){	        	   
	        	   msgModal.hide();	    				        	   
	           },attrs:[{name:'class',value:'btn'}]}
	           ],
     afterHidden : function(){
   		if(msgModal.afterHidden && typeof msgModal.afterHidden == 'function') {
   			msgModal.afterHidden();
   		}
   	}           
});
function getSecurityLevel(string){
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
 };

