//modeBlock 针对特定url进行锁死
Dcp.JqueryUtil.dalinReq = function(url, paramObj, sucsCb,errorCb) {	
	var options = {
		url : Dcp.getContextPath() +url,
	    data : JSON.stringify(paramObj),
	    type : "POST",
	    dataType:'json',
	    async : false,
	    success : function(rs) {	    	
	    	sucsCb(rs);
	    },
	    error    : errorCb || function() {
			//alert('对不起, 您的请求['+url+']失败, 请尽快联系管理员处理');
	    	if(window.console) console.error('对不起, 您的请求['+url+']失败, 请尽快联系管理员处理');
		},
		"mode":"block",
		"index":Dcp.getContextPath() +url
	 };
    if(paramObj&&paramObj["modeunBlock"]){
    	options.mode="unblock";
    }
	$.getDateJSON(options,sucsCb,errorCb);
}
Dcp.JqueryUtil.dalinReqByGet = function(url, sucsCb) {
	var options = {
		type     : "GET",
		url      : Dcp.getContextPath() + url,
		datatype : "json", //设置获取的数据类型为json
		timeout  : 5000,
		async    : false,
		global   : false,
		success  : function(data) {
			sucsCb(data);
		},
		error    : function() {
	    	if(window.console) console.error(Dict.valParam("key.js.dcp.tip4", 
					"对不起, 您的请求[" + url + "]失败, 请尽快联系管理员处理", 
					[{"name" : "1", "value" : url}]));
		},
		"mode":"block",
		"index":Dcp.getContextPath() +url
	};
	$.getDateJSON(options,sucsCb,options.error);
}
Dcp.JqueryUtil.dalinAsyncReq = function(url, paramObj, sucsCb,errorCb) {
	if(url.indexOf("/pm/queryCaculateFeeByPrtyList")>0){
		paramObj.verifyFlag="0";
	}
	var options = {
		url : Dcp.getContextPath() +url,
	    data : JSON.stringify(paramObj),
	    type : "POST",
	    dataType:'json',
	    contentType:"application/json; charset=utf-8",
	    "async": true,
	    "cache":false,
	    success : function(rs) {
	    	sucsCb(rs);
	    },
	    error    : errorCb || function() {
	    	//alert('对不起, 您的请求['+url+']失败, 请尽快联系管理员处理');
	    	if(window.console) console.error('对不起, 您的请求['+url+']失败, 请尽快联系管理员处理');
		},
		"mode":"block",
		"index":Dcp.getContextPath() +url
	 };
	 if(paramObj&&paramObj["modeunBlock"]){
	    	options.mode="unblock";
	    }
	 $.getDateJSON(options,sucsCb,errorCb);
}
Dcp.JqueryUtil.dalinAsyncReqByGet = function(url, sucsCb,errorCb) {
	var options = {
		type     : "GET",
		url      : Dcp.getContextPath() + url,
		datatype : "json", //设置获取的数据类型为json
		timeout  : 5000,
		"async": true,
	    "cache":false,
		global   : false,
		success  : function(data) {
			sucsCb(data);
		},
		error    : function() {
			//alert('对不起, 您的请求['+url+']失败, 请尽快联系管理员处理');
			if(window.console) console.error(Dict.valParam("key.js.dcp.tip4", 
					"对不起, 您的请求[" + url + "]失败, 请尽快联系管理员处理", 
					[{"name" : "1", "value" : url}]));
		},
		"mode":"block",
		"index":Dcp.getContextPath() +url
	};	
	$.getDateJSON(options,sucsCb,errorCb);
}
Dcp.JqueryUtil.dalinReqRedmine = function(url, paramObj,method, sucsCb,errorCb,async) {
	var options = {
		url : Dcp.getContextPath() +url,
	    data : JSON.stringify(paramObj),
	    type : method,
	    dataType:'json',
	    contentType:"application/json; charset=utf-8",
	    "async" : async,
	    "cache":false,
	    success : function(rs) {
	    	sucsCb(rs);
	    },
	    error    : errorCb || function() {
	    	//alert('对不起, 您的请求['+url+']失败, 请尽快联系管理员处理');
	    	if(window.console) console.error('对不起, 您的请求['+url+']失败, 请尽快联系管理员处理');
		},
		"mode":"unblock",
		"index":Dcp.getContextPath() +url
	 };
	$.getDateJSON(options,sucsCb,errorCb);
}
Dcp.JqueryUtil.dalinReqRedmineUpload = function(url,paramObj, sucsCb,errorCb,async) {
	var options = {
		url : Dcp.getContextPath() +url,
	    data : paramObj,
	    type : "POST",
	    dataType:'json',
	    contentType:"application/octet-stream",
	    "async": true,
	    "cache":false,
	    success : function(rs) {
	    	sucsCb(rs);
	    },
	    error    : errorCb || function() {
	    	//alert('对不起, 您的请求['+url+']失败, 请尽快联系管理员处理');
	    	if(window.console) console.error('对不起, 您的请求['+url+']失败, 请尽快联系管理员处理');
		},
		"mode":"unblock",
		"index":Dcp.getContextPath() +url
	 };
	$.getDateJSON(options,sucsCb,errorCb);
}
Dcp.JqueryUtil.dalinReqRedmineByGet = function(url, sucsCb,errorCb,async) {
	var options = {
		type     : "GET",
		url      : Dcp.getContextPath() + url,
		datatype : "json", //设置获取的数据类型为json
		timeout  : 5000,
		"async"    : async,
	    "cache":false,
		global   : false,
		success  : function(data) {
			sucsCb(data);
		},
		error    : errorCb ||function() {
			//alert('对不起, 您的请求['+url+']失败, 请尽快联系管理员处理');
			if(window.console) console.error(Dict.valParam("key.js.dcp.tip4", 
					"对不起, 您的请求[" + url + "]失败, 请尽快联系管理员处理", 
					[{"name" : "1", "value" : url}]));
		},
		"mode":"unblock",
		"index":Dcp.getContextPath() +url
	};
	$.getDateJSON(options,sucsCb,errorCb);
}
Dcp.JqueryUtil.setCombo = function(url, selectId, sucsCb) {
	Dcp.JqueryUtil.dalinReqByGet(url, function(data) {
		if (Dcp.util.isBlank(data)) {
			//alert(selectId + '下拉框取值为空');
			Dict.valParam("key.js.dcp.tip5", 
						  selectId + "下拉框取值为空", 
						  [{"name" : "1", "value" : selectId}]);
		} else {
			
		}
	});
}

Dcp.JqueryUtil.dalinReq4obs = function(url, paramObj, sucsCb,errorCb) {	
	var options = {
		url : Dcp.getContextPath() +url,
	    data : paramObj,
	    type : "POST",
	    dataType:'json',
	    "async": true,
	    "cache":false,
	    success : function(rs) {	    	
	    	sucsCb(rs);
	    },
	    error    : errorCb || function() {
			//alert('对不起, 您的请求['+url+']失败, 请尽快联系管理员处理');
	    	if(window.console) console.error('对不起, 您的请求['+url+']失败, 请尽快联系管理员处理');
		},
		"mode":"block",
		"index":Dcp.getContextPath() +url
	 };
	 if(paramObj&&paramObj["modeunBlock"]){
	    	options.mode="unblock";
	    }
	$.getDateJSON(options,sucsCb,errorCb);
}

Dcp.JqueryUtil.dalinReq4obsSyn = function(url, paramObj, sucsCb,errorCb) {	
	var options = {
		url : Dcp.getContextPath() +url,
	    data : paramObj,
	    type : "POST",
	    dataType:'json',
	    "async": false,
	    "cache":false,
	    success : function(rs) {	    	
	    	sucsCb(rs);
	    },
	    error    : errorCb || function() {
			//alert('对不起, 您的请求['+url+']失败, 请尽快联系管理员处理');
	    	if(window.console) console.error('对不起, 您的请求['+url+']失败, 请尽快联系管理员处理');
		},
		"mode":"block",
		"index":Dcp.getContextPath() +url
	 };
	 if(paramObj&&paramObj["modeunBlock"]){
	    	options.mode="unblock";
	    }
	$.getDateJSON(options,sucsCb,errorCb);
}

Dcp.JqueryUtil.dalinAsyncReq4Soft = function(url, paramObj, sucsCb,errorCb) {
      var options = {
		url : Dcp.getContextPath() +url,
	    data : JSON.stringify(paramObj),
	    type : "POST",
	    dataType:'json',
	    "async": true,
	    "cache":false,
	    success : function(rs) {
	    	sucsCb(rs);
	    },
	    error    : errorCb || function() {
	    	//alert('对不起, 您的请求['+url+']失败, 请尽快联系管理员处理');
	    	if(window.console) console.error('对不起, 您的请求['+url+']失败, 请尽快联系管理员处理');
		},
		"mode":"block",
		"index":Dcp.getContextPath() +url
	 };
      if(paramObj&&paramObj["modeunBlock"]){
      	options.mode="unblock";
      }
	$.getDateJSON(options,sucsCb,errorCb);
}
