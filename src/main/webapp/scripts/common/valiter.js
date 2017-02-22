var valiter = {
		
	checkEmail : function(email) {

		// var emailRegExp = new
		// RegExp("[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?");
		if (!/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/
				.test(email)) {
			return false;
		} else {
			return true;
		}
	},
	isNull : function(val) {
		if ($.trim(val) != "" && val != null) {
			return false;
		} else {
			return true;
		}
	},
	max : function(val, max) {
		try {
			if (parseFloat(val) <= parseFloat(max))
				return true;
			return false;
		} catch (e) {
			return false;
		}
	},

	min : function(val, min) {
		try {
			if (parseFloat(val) >= parseFloat(min))
				return true;
			return false;
		} catch (e) {
			return false;
		}
	},
	chinese : function(val) {
		try {
			if (/^[\u4e00-\u9fa5]+$/i.test(val))
				return false;
			return true;
		} catch (e) {
			return false;
		}
	},
	numberInt : function(val) {
		try {
			if (/^[-+]?[\d]+$/.test(val))
				return false;
			return true;
		} catch (e) {
			return false;
		}
	},
	// 只能输入10-19位的数字
	numberInt2 : function(val) {
		try {
			if (/^[_0-9]{10,19}$/.test(val))
				return false;
			return true;
		} catch (e) {
			return false;
		}
	},
	//小数点后2位   /^\d+[.]?\d{1,2}$/      /^[0-9]*\.?[0-9]{0,2}$/
	number2 : function(val) {
		try {
			if (/^(0?|[1-9]\d*)(\.\d{0,2})?$/.test(val))
				return false;
			return true;
		} catch (e) {
			return false;
		}
	},

	date : function(val) {
		try {
			var regex = /^(\d{4})-(\d{2})-(\d{2})$/;
			if (!regex.test(val))
				return true;
			var d = new Date(val.replace(regex, '$1/$2/$3'));
			var back = (parseInt(RegExp.$2, 10) == (1 + d.getMonth()))
					&& (parseInt(RegExp.$3, 10) == d.getDate())
					&& (parseInt(RegExp.$1, 10) == d.getFullYear());
			return !back;
		} catch (e) {
			return false;
		}
	},

	// 身份证验证
	iscardid : function(val) {
		try {
			if (valiter.isNull(val)) {
				return false;
			}
			if (valiter.numberInt(val)) {
				return false;
			}
			if (!(val.length == 15 || val.length == 18)) {
				return false;
			}
			return true;
		} catch (e) {
			return false;
		}
	},
	// 身份证验证
	checkIdcard : function(idcard) {
		var Errors = new Array("1", // 验证通过返回值
		"证件位数不对!", "出生日期超出范围或含有非法字符!", "证件校验错误!", "证件地区非法!");
		var area = {
			11 : "北京",
			12 : "天津",
			13 : "河北",
			14 : "山西",
			15 : "内蒙古",
			21 : "辽宁",
			22 : "吉林",
			23 : "黑龙江",
			31 : "上海",
			32 : "江苏",
			33 : "浙江",
			34 : "安徽",
			35 : "福建",
			36 : "江西",
			37 : "山东",
			41 : "河南",
			42 : "湖北",
			43 : "湖南",
			44 : "广东",
			45 : "广西",
			46 : "海南",
			50 : "重庆",
			51 : "四川",
			52 : "贵州",
			53 : "云南",
			54 : "西藏",
			61 : "陕西",
			62 : "甘肃",
			63 : "青海",
			64 : "宁夏",
			65 : "新疆",
			71 : "台湾",
			81 : "香港",
			82 : "澳门",
			91 : "国外"
		};

		var idcard, Y, JYM;
		var S, M;
		var idcard_array = new Array();
		idcard_array = idcard.split("");
		// 地区检验
		if (area[parseInt(idcard.substr(0, 2))] == null)
			return Errors[4];
		// 身份号码位数及格式检验		
		switch (idcard.length) {
		case 15:
			if(parseInt(idcard.substr(6, 2))+1900<1940){
				return Errors[2];
			}
			if ((parseInt(idcard.substr(6, 2)) + 1900) % 4 == 0
					|| ((parseInt(idcard.substr(6, 2)) + 1900) % 100 == 0 && (parseInt(idcard
							.substr(6, 2)) + 1900) % 4 == 0)) {
				ereg = /^[1-9][0-9]{5}[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|[1-2][0-9]))[0-9]{3}$/;// 测试出生日期的合法性
			} else {
				ereg = /^[1-9][0-9]{5}[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|1[0-9]|2[0-8]))[0-9]{3}$/;// 测试出生日期的合法性
			}
			if (ereg.test(idcard))
				return Errors[0];
			else
				return Errors[2];
			break;
		case 18:
			if(parseInt(idcard.substr(6, 4))<1940){
				return Errors[2];
			}
			// 18位身份号码检测
			// 出生日期的合法性检查
			// 闰年月日:((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|[1-2][0-9]))
			// 平年月日:((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|1[0-9]|2[0-8]))
			if (parseInt(idcard.substr(6, 4)) % 4 == 0
					|| (parseInt(idcard.substr(6, 4)) % 100 == 0 && parseInt(idcard
							.substr(6, 4)) % 4 == 0)) {
				ereg = /^[1-9][0-9]{5}19[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|[1-2][0-9]))[0-9]{3}[0-9Xx]$/;// 闰年出生日期的合法性正则表达式
			} else {
				ereg = /^[1-9][0-9]{5}19[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|1[0-9]|2[0-8]))[0-9]{3}[0-9Xx]$/;// 平年出生日期的合法性正则表达式
			}
			if (ereg.test(idcard)) {// 测试出生日期的合法性
				// 计算校验位
				S = (parseInt(idcard_array[0]) + parseInt(idcard_array[10]))
						* 7
						+ (parseInt(idcard_array[1]) + parseInt(idcard_array[11]))
						* 9
						+ (parseInt(idcard_array[2]) + parseInt(idcard_array[12]))
						* 10
						+ (parseInt(idcard_array[3]) + parseInt(idcard_array[13]))
						* 5
						+ (parseInt(idcard_array[4]) + parseInt(idcard_array[14]))
						* 8
						+ (parseInt(idcard_array[5]) + parseInt(idcard_array[15]))
						* 4
						+ (parseInt(idcard_array[6]) + parseInt(idcard_array[16]))
						* 2 + parseInt(idcard_array[7]) * 1
						+ parseInt(idcard_array[8]) * 6
						+ parseInt(idcard_array[9]) * 3;
				Y = S % 11;
				M = "F";
				JYM = "10X98765432";
				M = JYM.substr(Y, 1);// 判断校验位
				if (M == idcard_array[17])
					return Errors[0]; // 检测ID的校验位
				else
					return Errors[3];
			} else
				return Errors[2];
			break;
		default:
			return Errors[1];
			break;
		}

	},
	businessLicense:function(value){
		var ret = false;
		if (value.length == 15) {
			var sum = 0;
			var s = [];
			var p = [];
			var a = [];
			var m = 10;
			p[0] = m;
			for (var i = 0; i < value.length; i++) {
				a[i] = parseInt(value.substring(i, i + 1), m);
				s[i] = (p[i] % (m + 1)) + a[i];
				if (0 == s[i] % m) {
					p[i + 1] = 10 * 2;
				} else {
					p[i + 1] = (s[i] % m) * 2;
				}
			}
			if (1 == (s[14] % m)) {
				//营业执照编号正确!
				ret = true;
			} else {
				//营业执照编号错误!
				ret = false;
			}
		}
		return ret;
	},

	telephone : function(val) {
		try {
			if (/^((0\d{2,3})-)?(\d{7,8})(-(\d{3,}))?$/.test(val))
				return false;
			return true;
		} catch (e) {
			return false;
		}
	},
	cellphone : function(val) {
		try {
			if (val.length == 11 && /^1[3578]\d{9}$/.test(val))
				return false;
			return true;
		} catch (e) {
			return false;
		}
	},
	
	checkYWEmail : function(email) {

		if (!/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/
				.test(email)) {
			return false;
		} else {
			return true;
		}
	},

	isUserName : function(val) {
		if (/^[a-zA-Z]{1}([a-zA-Z0-9_.-]){5,29}$/.test(val))
			return true;

		return false;
	},
	isChinese : function(val) {
		if (/[\u4E00-\u9FA5\uF900-\uFA2D]/.test(val))
			return true;
		return false;
	},
	isIp : function(val) {
		return /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/.test(val);

	},
	
	//校验130-139,150-159,180-189号码段的手机号码

	mobilephone:function(val){
		
		if (/^(((13[0-9]{1})|(15[0-9]{1})|(17[0-9]{1})|(18[0-9]{1}))+\d{8})$/.test(val))
			return true;
		return false;
	},
	//校验邮编
	isPostalCode:function (val){
	//var patrn=/^[a-zA-Z0-9]{3,12}$/;
	
	if (/^\d{6}$/.test(val)) 
		return true;
	return false;
	},
	//校验地址(只能有汉字和数字，字母（不能全为数字或字母）,最多为128个字符)
	isAddress:function(val)
	{
		if(/[\dA-Za-z\u4E00-\u9FA5]{1,128}/.test(val))
			return true;
		return false;
	},
	//校验用户名
	isName:function(val){
		if(/[\dA-Za-z\u4E00-\u9FA5]{1,128}/.test(val))
			return true;
		return false;
	


	},
	isBankNo : function(val) {
		if (/^[0-9]{16,19}$/.test(val))
			return true;
		return false;
	},
	isNumber10:function(val){
		if(/^([1-9]|10)$/.test(val))
			return true;
		return false;
	},
	isNumber:function(val){
		if(/^[0-9]+$/.test(val))
			return true;
		return false;
	},
	containsChinese : function(val) {
		try {
			if (/^[^\u4e00-\u9fa5]{0,}$/i.test(val))
				return false;
			return true;
		} catch (e) {
			return false;
		}
	}
	

};