Dcp.namespace("Dcp.valuation");
Dcp.namespace("Dcp.biz");


Dcp.biz.apiRequest = function(cmd, params, cb,errorCb) {
	if(!checkPeriodAndCount(cmd,params)){
		$.growlUI("提示","参数有误，请重新填写！")
		return;
	}
	Dcp.JqueryUtil.dalinReq('/pr/client?p=' + cmd, params, cb,errorCb);
}

Dcp.biz.apiAsyncRequest = function(cmd, params, cb,errorCb) {
	if(!checkPeriodAndCount(cmd,params)){
		$.growlUI("提示","参数有误，请重新填写！")
		return;
	}
	Dcp.JqueryUtil.dalinAsyncReq('/pr/client?p=' + cmd, params, cb,errorCb);
}
Dcp.biz.apiAsyncRequest4Soft = function(cmd, params, cb,errorCb) {
	Dcp.JqueryUtil.dalinAsyncReq4Soft('/pr/client?p=' + cmd, params, cb,errorCb);
}
Dcp.biz.apiRequestRedmine = function(cmd, params,method, cb,errorCb,async) {
	if(method=="PUT"){
		Dcp.JqueryUtil.dalinReqRedmine('/pr/redminePUT?p=' + cmd, params,method, cb,errorCb,async);
	}else if(method == "POST"){
		Dcp.JqueryUtil.dalinReqRedmine('/pr/redminePOST?p=' + cmd, params,method, cb,errorCb,async);
	}
	
}
Dcp.biz.apiRequestRedmineUpload = function(cmd, params, cb,errorCb) {
	Dcp.JqueryUtil.dalinReqRedmine('/pr/uploadR?p=' + cmd, params, cb,errorCb);
}
Dcp.biz.apiRedmineRequestGet = function(cmd, cb,errorCb,async) {
	Dcp.JqueryUtil.dalinReqRedmineByGet('/pr/redmine?p=' + cmd,cb,errorCb,async);
}
Dcp.biz.apiSoftPostAsyncRequest = function(cmd, params, cb,errorCb) {
	Dcp.JqueryUtil.dalinAsyncReq('/pr' + cmd, params, cb,errorCb);
}
Dcp.biz.apiSoftRequest = function(cmd,  cb,errorCb) {
	Dcp.JqueryUtil.dalinReqByGet('/pr' + cmd,  cb,errorCb);
}
Dcp.biz.apiSoftAsyncRequest = function(cmd,  cb,errorCb) {
	Dcp.JqueryUtil.dalinAsyncReqByGet('/pr' + cmd,  cb,errorCb);
}
Dcp.biz.apiASGetRequest = function(cmd, cb, errorCb) {
	Dcp.JqueryUtil.dalinReqByGet('/pr/autoScalling?' + cmd,cb,errorCb);
}
Dcp.biz.apiASPostRequest = function(cmd, cb,errorCb) {
	Dcp.JqueryUtil.dalinReq('/pr/autoScalling?' + cmd,cb,errorCb);
}
Dcp.biz.apiCeilometerPostRequest = function(cmd, cb,errorCb) {
	Dcp.JqueryUtil.dalinReq('/pr/ceilometer?' + cmd,cb,errorCb);
}
Dcp.biz.getCurrentUser = function(cb,errorCb) {
	Dcp.JqueryUtil.dalinAsyncReq('/pr/getCurrentUser',null,function(data){
		//console.log(data);
		if(null!=data&&""!=data){
			var userInfo =  $.toJSON(data);				
			cb(data);
		}		
	},errorCb);
};

Dcp.biz.getCurrentPortalType = function() {
	var portalType = 'private';//行业云门户
    portalType = 'public';//公有云门户，打开注释即可
	return portalType;
};

Dcp.biz.getCurrentUinPay = function() {
	var isUinPay = false; //启用true，不启用false;
	return isUinPay;
};

Dcp.hidePool = function(pool){
	var hiddenPools = Config.hidden_pools;
	var result = pool;
	if(hiddenPools=="")	return result;
	var pools = hiddenPools.split(",");
	$(pools).each(function(index, item){
		if(item==pool){
			result = "";
			return;
		}
	});
	return result;
};

Date.prototype.format = function(format)
{
 var o = {
 "M+" : this.getMonth()+1, //month
 "d+" : this.getDate(),    //day
 "h+" : this.getHours(),   //hour
 "m+" : this.getMinutes(), //minute
 "s+" : this.getSeconds(), //second
 "q+" : Math.floor((this.getMonth()+3)/3),  //quarter
 "S" : this.getMilliseconds() //millisecond
 }
 if(/(y+)/.test(format)) format=format.replace(RegExp.$1,
 (this.getFullYear()+"").substr(4 - RegExp.$1.length));
 for(var k in o)if(new RegExp("("+ k +")").test(format))
 format = format.replace(RegExp.$1,
 RegExp.$1.length==1 ? o[k] :
 ("00"+ o[k]).substr((""+ o[k]).length));
 return format;
};

initsliderButton = function(input,slider,max,min,step,callback){
	if(!step){
		step = 1;
	}
	if(!min){
		min = 0;
	}
	var $parentDiv = "";
	if($("#"+input).parent().is('div')){
		$parentDiv = $("#"+input).parent();
	}else{
		$parentDiv = $("#"+input).parents("div");
	}
	var increase = $parentDiv.find(".increase");
	var decrease = $parentDiv.find(".decrease");
	increase.off().on("click",function(){
		var val = Number($("#"+input).val());
		if(val+step <= max){
			$("#"+input).val(val+step);
		}
		$("#"+slider ).slider( "option", "value", $("#"+input).val());
		if(typeof callback == "function") 
			  callback();
	});
	decrease.off().on("click",function(){
		var val = Number($("#"+input).val());
		if(val-step >= min){
			$("#"+input).val(val-step);
		}
		$("#"+slider ).slider( "option", "value", $("#"+input).val());
		if(typeof callback == "function") 
			  callback();
	});
		
};
checkPeriodAndCount = function(cmd,params){
	if(cmd == "/trade/vmSubscribe"||
	cmd == "/trade/lbSubscribe"||
	cmd == "/instance/ebs/volumSubscribe"||
	cmd == "/instance/nas/createNasVolumes"||
	cmd == "/instance/obs/createObsVolumes"||
	cmd == "/trade/eipSubscribe"||
	cmd == "/trade/createRouter"){
		if(params.period < 1||params.count < 1){
			return false;
		}
		else
			return true;
	}
	else
	 return true;
};
$.fn.serializeObject = function()
{
   var o = {};
   var a = this.serializeArray();
   $.each(a, function() {
       if (o[this.name]) {
           if (!o[this.name].push) {
               o[this.name] = [o[this.name]];
           }
           o[this.name].push($.trim(this.value) || '');
       } else {
           o[this.name] = $.trim(this.value) || '';
       }
   });
   return o;
};
//内容填充
$.fn.setData = function(data){
	for(item in data){
		this.find("textarea[name='"+item+"'], input[type='text'][name='" + item + "'], input[type='number'][name='" + item + "'], input[type='mobile'][name='" + item + "'],input[type='email'][name='" + item + "'], input[type='password'][name='" + item + "'], input[type='hidden'][name='" + item + "']").val(data[item+""]);
		this.find("select[name='" + item + "'] option[value='"+data[item+""]+"']").prop("selected", true);
		this.find("input[type='radio'][name='" + item + "'][value='"+data[item+'']+"']").attr("checked", true);
		this.find("input[type='checkbox'][name='" + item + "']").attr("checked", data[item+'']);
	}
};
//表单内容获取
$.fn.getFormData = function(){
	var result = null;
	var value = new Object();
	$(this).find("input,textarea,select").each(function(i,input){
		var _name = $(input).attr("name");
		var _value = $(input).val();
		if(!_value || (""+_value).length==0){
			_value = "";
		}
		value[_name] = _value;
	});
	result = value;
	return result;
};