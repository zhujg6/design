$(function(){
	$("#username").focus();
	$("#regSubmit").click(function(){		
		Modify.modify();			
	});	
	// 特殊字符输入控制，允许输入中文,允许输入空格
	$("input[type='text']").blur(function() {
		var val = $(this).val();
		//邮箱可以输入@
		if (!/^[ \u4E00-\u9FA5a-zA-Z0-9_.@\/-]+$/.test(val)) {
			$(this).val("");
			return;
		}
		
	});
	$('body :input').blur(
		function() {
			// 验证帐号
			if ($(this).is('#username')) {
				var username = $.trim(this.value);
				if (!/^[ \u4E00-\u9FA5a-zA-Z0-9_.@\/-]+$/.test(username)) {
					$(this).val("");
					return;
				}
				if((username.indexOf("@")) > 0){
					var errorMsg = "* 格式：xx@xx.xx";
					if (valiter.isNull($.trim(this.value))
							|| !valiter.checkYWEmail($.trim(this.value))) {		
						$("#nameMsg").addClass("onError").html(errorMsg);
					}
					else {
						$("#nameMsg").removeClass("onError").html("");
					}
				}else{
					if (!valiter.isUserName($.trim(this.value))) {
						$("#nameMsg").addClass("onError").html("* 字母开头的6-30个英文与非特殊字符");
					}
					else {
						$("#nameMsg").removeClass("onError").html("");
					}
				}
				
			}

			// 验证邮箱
			if ($(this).is('#email')) {
				var errorMsg = "* 格式：xx@xx.xx";
				if (valiter.isNull($.trim(this.value))
						|| !valiter.checkYWEmail($.trim(this.value))) {		
					$("#emailMsg").addClass("onError").html(errorMsg);
				}
				else {
					$("#emailMsg").removeClass("onError").html("");
				}
			}
		});
	$('body :input').focus(
			function() {
				// 验证帐号
				if ($(this).is('#username')) {
					if($.trim(this.value).length < 1 ){
			    		$("#nameMsg").removeClass("onError").html("");			    		
			    	}				
				}
				// 验证邮箱
				if ($(this).is('#email')) {
					if($.trim(this.value).length < 1 ){
			    		$("#emailMsg").removeClass("onError").html("");
			    	}
				}
				$("#msgDiv").hide().empty();
			});
});

var Modify = {
		modify: function(){
	    	$("body :input").trigger('blur');	       
	        var back = false;
			back = Modify.valite();
			if (!back) {
				return;
			}
			var account = $.trim($("#username").val());
		    var email = $.trim($("#email").val());
	        var data = {
	        		account:account,
	        		email:email
            };
	        Dcp.biz.apiAsyncRequest("/user/reSendActive", data,function(data) {
	        	state = data.code;
	        	if(state == 0){
	        		$("#msgDiv").append("<span class='text-success'>激活邮件已经发送至您的注册邮箱，请激活后再次登录！</span>").show();
	        		setTimeout("window.location = CONTEXT_PATH+'/jsp/login.jsp'",5000);
	        	}
	        	else {
	        		if(data != null && data != "" && data.msg != null && data.msg != "")
	        		{
		        		var msg = data.msg;
		        		$("#msgDiv").append("<span class='text-error'>您好！"+msg+"</span>").show();
	        		}else{
	        			$("#msgDiv").append("<span class='text-error'>您好！您输入的注册用户名或注册邮箱不存在，请重新输入！</span>").show();
	        		}
	        	}
			});     
	        
	    },
	    valite : function() {		
	    	var numError = $('.onError').length;
			if (numError) {
				return false;// test
			}
			else 
				return true;// test
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

