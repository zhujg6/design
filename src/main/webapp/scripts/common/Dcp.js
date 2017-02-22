Dcp = new Object();
Dcp.namespace = function(name) { 
    var parent = window; 
    var arr = name.split('.'); 
    for(var i=0; i <arr.length; i++) { 
        if (!parent[arr[i]]) { 
            parent[arr[i]] = new Object();
        } 
        parent = parent[arr[i]]; 
    }
}

Dcp.getContextPath = function() {
	var tempPath = document.location.pathname.substring(1);
	return '/' + tempPath.substring(0, tempPath.indexOf('/'));
}

Dcp.Ele = function (name, desc, value, nb, type) { // 1文本框，2下拉框
	return {
		id           : name + 'Id',
		name         : name,
		value        : value + '',
		type         : type,
		desc         : desc,
		nb           : nb == undefined ? true : nb
	}
}

Dcp.getEles = function(a) {
	var obj = {};
	for (var b in a) {
		obj[a[b][0]] = Dcp.Ele(a[b][0],a[b][1],a[b][2],a[b][3]);
	}
	return obj;
}

var CONTEXT_PATH = Dcp.getContextPath();
var MSG_LEVEL = 40; // 10DEBUG，20INFO，30WARN，40ERROR


Dcp.namespace("Dcp.util");
Dcp.namespace("Dcp.JqueryUtil");


Dcp.util.isBlank = function(str) { 
	var tp = (str + '').replace(/(^\s*)|(\s*$)/g, "");
	if (tp == 'undefined' || tp == '' | tp == '0') {
		return true;
	}
	return false;
}

/**
 * 验证EMAIL
 */
Dcp.util.validEmail = function(email) {
	var patten = new RegExp(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+(com|cn|net)$/);
	return patten.test(email);
}

Dcp.util.getContextPath = function() {
	var tempPath = document.location.pathname.substring(1);
	return '/' + tempPath.substring(0, tempPath.indexOf('/'));
}

Dcp.util.validEmail = function(email) {
	var patten = new RegExp(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+(com|cn|net)$/);
	return patten.test(email);
}

Dcp.util.checkData = function(d) {
	for (var p in d) {
		if ( d[p] && d[p].nb) {
			if (Dcp.util.isBlank(d[p].value)) {
				$.msgBox({
				    title : Dict.val("key.js.dcp.tip1", "友情提示"),
				    type : "warn",
				    content:(d[p].type == 1 ? Dict.val("key.js.dcp.tip2", "请填写") : Dict.val("key.js.dcp.tip3", "请选择") + d[p].desc)
				});
				return false;
			}
		}
	}
	return true;
}

Dcp.getConfig = function(cb){
	var value = "";
	$.ajax({
		"url" : CONTEXT_PATH+"/ajax/common.json",
		"type" : "GET",
		"dataType" : "json",
		"async" : false,
		"success" : function(result) {
			cb(result);			
		},
		"error" : function(result) {
			
		}		
	});
	return value;
}
var Config = null;
Dcp.getConfig(function(result){
	Config = result;
});
var currentPath = window.location.href;
//启用升级提示页面
if(currentPath.indexOf("update.jsp")==-1&&Config&&Config.model&&"update"==Config.model){
	window.location = CONTEXT_PATH+"/jsp/update.jsp";
}