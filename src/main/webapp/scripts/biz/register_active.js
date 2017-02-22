$(function() {
	    //激活用户//fix buf 3040 增加用户激活功能
	    activeUser();
		
	});
	
	function activeUser(){		
		$("#failed").hide();
		$("#success").hide();
		$("#activeError").hide();
		$("#activing").show();
	    var activeCode = $("#activeCode").val();
	    var loginacct = $("#loginacct").val();
	    if(loginacct != null && loginacct != '' && activeCode != null && activeCode != '' )
	    {	    	
	    	//var data = {loginacct:loginacct,activeCode:activeCode};
	    	var data = {account:loginacct,code:activeCode};
			Dcp.biz.apiRequest("/user/active", data,
				function(data) {
					if(null!=data){
						if("-1" == data.code) {
						if("activeCodeNull" == data.msg){
							$.growlUI("提示", "激活用户失败：激活码不能为空！");
						}
						else if("userError" == data.msg){
							$.growlUI("提示", "激活用户失败：用户不存在！");
						}
						else if("activeCodeError" == data.msg){
							$.growlUI("提示", "激活用户失败：激活码不正确！");
						} else{
							//alert("激活用户失败：系统异常！请联系管理员。");
							$.growlUI("提示", "激活用户失败：系统异常！请联系管理员！" ); 	
						}
						//alert("激活用户失败！请联系管理员。");
						$("#failed").show();
						$("#success").hide();
						$("#activing").hide();
						$("#activeError").hide();
					}else if("0" == data.code){
						if("actived" == data.msg){
							//alert("激活用户失败！用户已激活，请直接登录门户。");
							$.growlUI("提示", "激活用户失败！用户已激活，请直接登录门户！" ); 		
							$("#failed").hide();
							$("#success").show();
							$("#activing").hide();
							$("#activeError").hide();
						}
						else {
							$.growlUI("提示", "激活用户成功！");
							$("#failed").hide();
							$("#success").show();
							$("#activing").hide();
							$("#activeError").hide();
							if(data.data){
								var customerId = ""+data.data.customerId;
								genzong(customerId);
							}
						}
					}
				}						
			},function(){
				alert("激活用户失败：系统异常！请联系管理员。");
				$("#failed").hide();
				$("#success").hide();
				$("#activing").hide();
				$("#activeError").show();					
			});
		}else{
			alert("账号与激活码不能为空！");
			$("#failed").hide();
			$("#success").hide();
			$("#activing").hide();
			$("#activeError").show();
		}
	}
	function to_ADWQ(customerId){
		_adwq.push([
			'_setAction','7xqw3g',customerId
			]); 
	}