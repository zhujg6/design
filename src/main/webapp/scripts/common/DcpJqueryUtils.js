Dcp.JqueryUtil.dalinReq = function(url, paramObj, sucsCb,errorCb) {
	$.ajax({
		url : Dcp.getContextPath() +url,
	    data : paramObj,
	    type : "POST",
	    dataType:'json',
	    async : false,
	    success : function(rs) {
	    	sucsCb(rs);
	    },
	    error    : errorCb || function() {
			//alert('对不起, 您的请求['+url+']失败, 请尽快联系管理员处理');
	    	if(window.console) console.error('对不起, 您的请求['+url+']失败, 请尽快联系管理员处理');
		}
	 });
}
Dcp.JqueryUtil.dalinReqByGet = function(url, sucsCb) {
	$.ajax({
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
		}
	});
}
Dcp.JqueryUtil.dalinAsyncReq = function(url, paramObj, sucsCb,errorCb) {
	$.ajax({
		url : Dcp.getContextPath() +url,
	    data : paramObj,
	    type : "POST",
	    dataType:'json',
	    contentType:"application/json; charset=utf-8",
	    async : true,	   
	    success : function(rs) {
	    	sucsCb(rs);
	    },
	    error    : errorCb || function() {
	    	//alert('对不起, 您的请求['+url+']失败, 请尽快联系管理员处理');
	    	if(window.console) console.error('对不起, 您的请求['+url+']失败, 请尽快联系管理员处理');
		}
	 });
}

Dcp.JqueryUtil.dalinAsyncReqByGet = function(url, sucsCb) {
	$.ajax({
		type     : "GET",
		url      : Dcp.getContextPath() + url,
		datatype : "json", //设置获取的数据类型为json
		timeout  : 5000,
		async    : true,//异步
		global   : false,
		success  : function(data) {
			sucsCb(data);
		},
		error    : function() {
			//alert('对不起, 您的请求['+url+']失败, 请尽快联系管理员处理');
			if(window.console) console.error(Dict.valParam("key.js.dcp.tip4", 
					"对不起, 您的请求[" + url + "]失败, 请尽快联系管理员处理", 
					[{"name" : "1", "value" : url}]));
		}
	});
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
