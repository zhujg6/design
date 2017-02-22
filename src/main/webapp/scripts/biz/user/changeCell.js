$(function() {
	$.ajaxSetup( {
		cache : false
	});// 设置jQuery ajax缓存
	root = $("#ctx").val();
	currentUserId = $("#currentUserId").val();
	// user_info.server = server;
	user_info.initInfo(function() {
		//console.log(currentUserId);
		
		
		
		user_info.init();

		//var telNumber = $("#hiddenCellpNumber").val();
		
		$("#sendMessage").click(function() {
			sendMessage();
		});
		
		$("#sendMessage2").click(function() {
			sendMessage2();
		});
		
		$("#changeCell").click(function() {
			
			changeCellFunc();
		});
	});
});
// 获取ID
//var telNumber = "";
var timeOut = 60;
var max_num = timeOut;
var iCount;
 
var changeCellWizard = null;
var root = ""; // "/portal";
var currentUserId = 0;
var oldEmail = "";
var oldMobile = "";
// var messageCode ="";
var mobileOfTextType = "";
var right = '<img src="' + root + '/newui/images/icons/icon-right.png"/>';
var user_info = {
	curUser : "",
	root : root,
	curCloud : "0",
	init : function() {
		
	//oldMobile = $.trim($("#oldCellpNumber").val());

		// 保存
		$("#btnSave").click(function() {
			Modify.modify();
		});

		

		// 下拉列表失去焦点后
		$('.line12').change(function() {// fix bug to id 0008825:
					// 【BJ-IE&chrom】-自服务门户-用户中心-用户信息页面展示的信息与用户注册时添加的信息不一致
					var $parent = $(this).parent();
					$parent.find("sub").removeClass().empty();
					// 所在城市验证
					if ($(this).is('#szcs')) {
						if (valiter.isNull($.trim(this.value))) {
							// var errorMsg = "*所在城市选项值错误";
							var errorMsg = "*"
									+ Dict.val("key.js.userInfo.tip16");
							$parent.find("sub").removeClass("info").addClass(
									"onError").html(errorMsg);
						}
					}
					
					// 企业规模验证
					if ($(this).is('#qydqdj')) {
						if (valiter.isNull($.trim(this.value))) {
							// var errorMsg = "*企业规模选项值错误";
							var errorMsg = "*"
									+ Dict.val("key.js.userInfo.tip19");
							$parent.find("sub").removeClass("info").addClass(
									"onError").html(errorMsg);
						}
					}

				});

		$('#baseInfo :text').focus(function() {

			
				
				if ($(this).is('#yzbm')) {
					$parent.find("sub").addClass("info")
					// .html("*6位邮政编码");
							.html("*" + Dict.val("key.js.userInfo.tip10"));
				}

			});

	},

	initInfo : function(callback) {

		var data = {
			id : currentUserId
		};
		if (currentUserId > 0) {
			Dcp.biz.apiAsyncRequest("/user/getCustomerByCustomerId", data,
					function(dto) {
						user_info.curUser = dto.data;
						var data = dto.data;
						var compLegalPerson = "";
						var compName = "";
						var compLegalPersonId = "";
						var cityId = "";
						var propertyId = "";
						var categoryId = "";
						var classId = "";
						var compAddress = "";
						var postCode = "";
						var compPhone = "";
						var relaMobile = "";
						var compFax = "";
						var compEmail = "";
						var compOrgCode = "";
						var busLicenseNum = "";
						var blnStartTime = "";
						var blnEndTime = "";
						var compBankName = "";
						var compBankAccount = "";
						var compId = "";
						if (data) {
							$("#account").val(data.account);
							$("#userName").val(data.name);
							$("#email").val(data.email);
							$("#newMobile").val(mobileOfTextType);
							// var messageCode = $("#messageCode").val();
					$("#newCellpNumber").val(data.mobile);
					oldMobile = data.mobile;
					oldEmail = data.email;
					mobileOfTextType = (data.mobile).slice(0, 3) + "****"
							+ (data.mobile).slice(-4, 12);
					// $("#phone").val(data.phone);
					$("#oldCellpNumber").val(data.mobile);
					$("#oldCellNumber").val(mobileOfTextType);
					$("#cellpNumber").text(mobileOfTextType);
					//console.log($("#cellpNumber").val())

					//console.log($("#hiddenCellpNumber").val())

					compName = data.compName;
					// if(compName != null){
					// $("#com").css("display","");
					// }

					if (callback && typeof callback == 'function') {
						callback(data);
					}
					
				}
			});
		} else
			window.location = root + "/jsp/login.jsp";
	},

	insertInfo : function() {
		// 企业信息
		data['tcompanyinfo']['compId'] = companyId;
		data['tcompanyinfo']['compLegalPerson'] = $.trim($("#qyfr").val());
		data['tcompanyinfo']['compCnName'] = $.trim($("#compchinaname").val());
		data['tcompanyinfo']['compLegalPersonId'] = $.trim($("#qyfrid").val());
		data['tcompanyinfo']['TCity']['cityId'] = $.trim($("#szcs").val());
		data['tcompanyinfo']['TProperty']['propertyId'] = $.trim($("#qylb")
				.val());
		data['tcompanyinfo']['TCategory']['categoryId'] = $.trim($("#hylb")
				.val());
		data['tcompanyinfo']['TClass']['classId'] = $.trim($("#qydqdj").val());
		data['tcompanyinfo']['compAddress'] = $.trim($("#qydz").val());
		data['tcompanyinfo']['postCode'] = $.trim($("#yzbm").val());
		data['tcompanyinfo']['compPhone'] = $.trim($("#qydh").val());
		data['tcompanyinfo']['relaMobile'] = $.trim($("#cysj").val());
		data['tcompanyinfo']['compFax'] = $.trim($("#qycz").val());
		data['tcompanyinfo']['compEmail'] = $.trim($("#qymail").val());
		data['tcompanyinfo']['compOrgCode'] = $.trim($("#compcode").val());
		data['tcompanyinfo']['busLicenseNum'] = $.trim($("#gsyyzzid").val());
		data['tcompanyinfo']['compBankName'] = $.trim($("#qykhyh").val());
		data['tcompanyinfo']['compBankAccount'] = $.trim($("#khzh").val());
		// 用户邮箱
		data['tcompanyinfo']['relaEmail'] = $.trim($("#youxiang").val());
		// 传递时间类型的参数
		data['blnStartTime'] = $.trim($("#gsyyzzstime").val());
		data['blnEndTime'] = $.trim($("#gsyyzzetime").val());

		if (GlbObj.publicPrivateCloud == 1) {
			$.ajax( {
				url : root + "/customerAdmin/insertUserInfo.action",
				type : "POST",
				contentType : "application/json",
				dataType : "json",
				data : $.toJSON(data),
				async : false,
				// timeout : 10000,
				success : function(state) {
					if ("true" == state) {
						// alert("成功：信息保存成功！");
				alert(Dict.val("key.js.userInfo.tip23"));
			} else if ("false" == state) {
				// alert("失败：信息保存失败！");
				alert(Dict.val("key.js.userInfo.tip24"));
			}
			// getCompInfo();
			}
			});
		} else {
			// fixed bug : 0009368,0009170
			Dcp.JqueryUtil.dalinReq('/customerAdmin/insertUserInfo.action', {
				"tcompanyinfo.relaEmail" : data['tcompanyinfo']['relaEmail']
			}, function(state) {
				if ("true" == state) {
					// alert("成功：信息保存成功！");
					alert(Dict.val("key.js.userInfo.tip23"));
				} else if ("false" == state) {
					// alert("失败：信息保存失败！");
					alert(Dict.val("key.js.userInfo.tip24"));
				}
			});
		}
	},

	valite : function() {
		var numError = $('#con_tab_1 .onError').length;
		if (numError) {
			// alert("必要信息没有填写正确，请检查！");
			alert(Dict.val("key.js.userInfo.tip25"));
			$("#tongyitiaokuan").show();
			return false;// test
		}
		
		return true;// test
	},
	checkRepEmail : function() {

		var ret = true;
		var data = {
			email : $.trim($("#email").val())
		};
		if (oldEmail != $("#email").val()) {
			Dcp.biz.apiRequest("/user/uniqueCheck", data, function(data) {
				var list = data.data;
				if (-1 == data.code) {
					ret = false;
				}
			});
		}
		return ret;
	},

	checkMessageCode : function() {

		var ret = true;
		var data = {
				mobilephone : $.trim($("#newCellpNumber").val()),
				activeCode : $.trim($("#smCode").val())
		};
		Dcp.biz.apiRequest("/instance/commquery/validateActiveCode", data,
				function(data) {
					if (data.code == -1) {
						ret = false;
					}
				});
		return ret;

		// return true;
	},
	
	
	checkMessageCode2 : function() {

		var ret = true;
		var data = {
			mobileNum : $.trim($("#oldCellpNumber").val()),
			valiCode : $.trim($("#messageCode2").val())
		};
		Dcp.biz.apiRequest("/instance/commquery/validateActiveCode", data,
				function(data) {
					if (data.code == -1) {
						ret = false;
					}
				});
		return ret;

		// return true;
	},

	checkRepMobile : function() {

		var ret = true;
		var data = {
			mobile : $.trim($("#oldCellpNumber").val())
		};
		if (oldMobile != $("#mobile").val()) {
			Dcp.biz.apiRequest("/user/uniqueCheck", data, function(data) {
				if (-1 == data.code) {
					ret = false;
				}
			});
		}

		return ret;

	}

};
// Tab control
function tab(name, cursel, n) {
	for ( var i = 1; i <= n; i++) {
		var menu = document.getElementById(name + i);
		var con = document.getElementById("con_" + name + "_" + i);
		menu.className = i == cursel ? "current" : "";
		con.style.display = i == cursel ? "block" : "none";
	}
}

var Modify = {
	modify : function() {
		$("#baseInfo :input").trigger('blur');
		var back = false;
		back = Modify.valite();
		if (!back) {
			return;
		}
		var username = $.trim($("#userName").val());
		var email = $.trim($("#email").val());
		var mobile = $.trim($("#oldCellpNumber").val());
		var data = {
			id :parseInt(currentUserId),
			username : username,
			email : email,
			mobile : mobile
		};
		Dcp.biz
				.apiRequest(
						"/user/modifyUser",
						data,
						function(data) {
							confirmModal = null;
							state = data.code;
							if (state == 0) {
								changeCellWizard.markSubmitSuccess();
								confirmModal = new com.skyform.component.Modal(new Date().getTime(),"提示","信息修改成功！",{
									buttons : [{
										name : "确定",
										onClick : function(){
											window.location = "/portal/jsp/user/userInfo.jsp?code=base&&cataCode=user";
											
										},
										attrs : [
											{
												name : 'class',
												value : 'btn btn-primary'
											}
										]
									}]					
								});
								//$.growlUI("提示", "信息修改成功！");								
								//user_info.initInfo();
							} else {
								changeCellWizard.markSubmitError();
								confirmModal = new com.skyform.component.Modal(new Date().getTime(),"提示","信息修改失败！",{
									buttons : []					
								});
								//$.growlUI("提示", "信息修改失败！");
							}
							confirmModal.setWidth(500).autoAlign();
							confirmModal.show();
						});

	},
	valite : function() {
		var numError = $('#baseInfo .onError').length;
		if (numError) {
			return false;// test
} else
	return true;// test
}
};

userMsgModal = new com.skyform.component.Modal("userMsgModal", "<h4>信息</h4>",
		"", {
			buttons : [ {
				name : '关闭',
				onClick : function() {
					userMsgModal.hide();
				},
				attrs : [ {
					name : 'class',
					value : 'btn'
				} ]
			} ],
			afterHidden : function() {
				if (userMsgModal.afterHidden
						&& typeof userMsgModal.afterHidden == 'function') {
					userMsgModal.afterHidden();
				}
			}
		});

TimeOut2 = {
	changeTime : function() {
		if (max_num > 0) {
			max_num = max_num - 1;
			curnum = max_num;
			$("#sss2").empty().html("若" + curnum + "秒后未收到短信，请再点击获取！");
		} else {
			if (max_num == 0) {
				max_num = timeOut;
				$("#sss2").empty();
				clearInterval(iCount);

			}
		}
	}
};

TimeOut = {
		changeTime : function() {
			if (max_num > 0) {
				max_num = max_num - 1;
				curnum = max_num;
				$("#sss").empty().html("若" + curnum + "秒后未收到短信，请再点击获取！");
			} else {
				if (max_num == 0) {
					max_num = timeOut;
					$("#sss").empty();
					clearInterval(iCount);

				}
			}
		}
	};

function sendMessage() {
	var telNumber = $("#newCellpNumber").val();
	//var secondTelNumber = $("#mobile").val();
	var errorMsg = " 输入移动电话号码";
	

	if(!valiter.isNull($.trim(telNumber))){
		if (valiter.cellphone($.trim(telNumber))) {
			$("#mobileMsg").removeClass("onError");
			$("#mobileMsg").addClass("onError").empty().html(errorMsg);
		}
		else {
			var back = false;
			back = valiteMessageCode();
			if (!back) {
				return;
			}
			var currTime = new Date();
			iCount = setInterval('TimeOut.changeTime()',1000);
			telNumber = parseInt(telNumber);
			if(max_num >= timeOut ){
				Dcp.biz.apiAsyncRequest("/user/sendMessage", {"telNumber":telNumber,"validateC": $("#messageCode").val(),"source":"update"},function(data) {//	
					changeMessageImg();
					$("#messageCode").val("");
				});						
			}
		}
	}else{
		$("#mobileMsg").addClass("onError").html(errorMsg);
	}
	this.document.getElementById('smCode').focus();
};

function valiteMessageCode() {	
	
	var ret = false;
	$.ajax({
		url : root+"/pr/verifyMessageCode",
		type : 'POST',
		data : {
			code : $("#messageCode").val()
		},
		async : false,
		dataType : 'json',
		success : function(state) {
			var stateX = state+"";
			if (stateX == "false") {
				$("#messageCodeMsg").addClass("onError").html("验证码输入错误");
				$("#sss").empty();
				changeMessageImg();
				
			}
			// 验证码session超时
			else if (stateX == "timeout") {
				$("#messageCodeMsg").addClass("onError").html("操作超时，请重新输入验证码！");
				$("#sss").empty();
				changeMessageImg();
			}	
			else 
				ret =  true;						
		}
	});
	return ret;
	
}


function sendMessage2() {
	//var telNumber = $("#hiddenCellpNumber").val();
	var newTelNumber = $("#oldCellpNumber").val();
	var errorMsg = " 输入移动电话号码";
	if (!valiter.isNull($.trim(newTelNumber))) {
		if (valiter.cellphone($.trim(newTelNumber))) {
			$("#tip_monitorProtocol3").removeClass("onError");
			$("#tip_monitorProtocol3").addClass("onError").empty().html(errorMsg);
		} else {
			var currTime = new Date();
			if (max_num >= timeOut) {
				Dcp.biz.apiAsyncRequest("/user/sendMessage", {
					"telNumber" : newTelNumber,
					"validateC" : $("#messageCode").val()
				}, function(data) {//	
					
					
				});
				iCount = setInterval('TimeOut2.changeTime()', 1000);
			}
			
		}
	} else {
		$("#tip_monitorProtocol3").addClass("onError").html(errorMsg);
	}
	this.document.getElementById('messageCode2').focus();
};


function changeCellFunc() {	
	$("#messageCode").focus(function(){
		$("#messageCodeMsg").removeClass("onError").empty();
	});
	$("#smCode").focus(function(){
		$("#tip_monitorProtocol").removeClass("onError").empty();
	})
	$("#oldCellpNumber").focus(function(){
		$("#tip_monitorProtocol3").removeClass("onError").empty();
	})
	//var changeCellWizard = "";
	if (changeCellWizard == null){
		
	
		changeCellWizard = new com.skyform.component.Wizard("#wizard-create11");
		
		
//		changeCellWizard.onFinish = function(from, to) {
//			//console.log(changeCellWizard);
//		};
	
	}
	changeCellWizard.reset();
	changeCellWizard.render(function onShow(){
		changeMessageImg();
		$("#wizard-create11").find("input[type='text']").val();
	})
	
	changeCellWizard.onFinish = function(from, to) {
		
		//var newCellpNumber = $.trim($("#oldCellpNumber").val());
		
		//$.growlUI("提示", "修改成功");
		changeCellWizard.close();
		
		changeCellWizard.markSubmitSuccess();
		
		Modify.modify();
		
		
	};
	
	changeCellWizard.reset();
	
	changeCellWizard.render();
	
	//function(){}
	
};


function validateIns(input){
	var result = {status : true};
	
	$("#tip_monitorProtocol").empty();
	var messageCode = $("#smCode").val();
	var errorMsg = "请输入短信密码！";
	//console.log($(input).val());
	var wrongNumber = "短信密码错误,请重新获取！";
	if (valiter.isNull($.trim(messageCode))) {
		//$("#messageCodeMsg").addClass("onError").html(errorMsg);
		$("#tip_monitorProtocol").empty().html(errorMsg);
		result.status = false;
	} else if (!user_info.checkMessageCode()) {
		$("#tip_monitorProtocol").empty().html(wrongNumber);
		result.status = false;
		//$("#messageCodeMsg").addClass("onError").html(wrongNumber);
//		alert(wrongNumber);
	} 
	
	//result.status = true;
	
	//$("#tip_monitorProtocol").empty()
	
	return result;
};


function validateIns2(input){
	var result = {status : true};
	$("#tip_monitorProtocol2").empty();
	var messageCode2 = $("#messageCode2").val();
	var errorMsg = "请输入短信密码！";
	//console.log($(input).val());
	var wrongNumber = "短信密码错误,请重新获取！";
	if (valiter.isNull($.trim(messageCode2))) {
		//$("#messageCodeMsg").addClass("onError").html(errorMsg);
		$("#tip_monitorProtocol2").empty().html(errorMsg);
		result.status = false;
	} else if (!user_info.checkMessageCode2()) {
		$("#tip_monitorProtocol2").empty().html(wrongNumber);
		result.status = false;
		//$("#messageCodeMsg").addClass("onError").html(wrongNumber);
//		alert(wrongNumber);
	}
	
	
	
	//result.status = true;
	
	return result;
}




function validateIns3(input){
	var result = {status : true};
//	var messageCode2 = $("#messageCode2").val();
//	var errorMsg = "请输入动态密码！";
//	//console.log($(input).val());
//	var wrongNumber = "激活码错误,请重新获取！";
//	if (valiter.isNull($.trim(messageCode2))) {
//		//$("#messageCodeMsg").addClass("onError").html(errorMsg);
//		$("#tip_monitorProtocol2").empty().html(errorMsg);
//		result.status = false;
//	} else if (!user_info.checkMessageCode2()) {
//		$("#tip_monitorProtocol2").empty().html(wrongNumber);
//		result.status = false;
//	}
//	return result;
	$("#tip_monitorProtocol3").empty();
	
	var newCellpNumber = $.trim($("#oldCellpNumber").val());

		var errorMsg = " 输入正确格式的移动电话号码";
		var errorMsgT = " 该手机号已经被注册";
		if (valiter.isNull(newCellpNumber)
				|| valiter.cellphone(newCellpNumber)) {

			$("#tip_monitorProtocol3").empty().html(errorMsg);
			result.status = false;
//			$("#mobileMsg").addClass("onError").html(
//					errorMsg);
		}
		else if(newCellpNumber == oldMobile){
			//$("#mobileMsg").removeClass("onError").html("");
			
			$("#tip_monitorProtocol3").empty().html("请输入新手机号码！");
			
			result.status = false;
		}

		else if (!user_info.checkRepMobile()) {
			//$("#mobileMsg").addClass("onError").html(errorMsgT);
			
			$("#tip_monitorProtocol3").empty().html(errorMsgT);
			
			result.status = false;
			
		} 
		

		return result;
	
	
	
	
}

