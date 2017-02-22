/**
 * 专门给亚信做的api适配层,主要用于发送完整json格式的数据。
 * 使用方法：将这个js引入到console.jsp最下面.
 * <script type="text/javascript" src="${ctx }/scripts/biz/maintain/apipatch4yaxin.js"></script>
 * 使用了这个js之后，就可以在firebug中看到我们提交数据的json格式是什么样子了。
 * 另外，这个js还需要一个后台proxy来协助工作,所以我添加了一个Controller:AdminController4Yaxin,这个proxy可以将接收到的数据以json格式接收
 * 之后传送给亚信的api.
 * 
 * 注意，为了保证和我们当前的api兼容，所以这个js的引入需要通过参数来判断是否引入，具体实现参见“模拟环境和真实环境的切换”
 */
Dcp.namespace("Dcp.valuation");
Dcp.namespace("Dcp.biz");

Dcp.JqueryUtil.dalinReq = function(url, paramObj, sucsCb,errorCb) {
	$.ajax({
		url : Dcp.getContextPath() +url,
	    data : JSON.stringify(paramObj),
	    type : "POST",
	    dataType:'json',
	    contentType : 'application/json; charset=utf-8',
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
Dcp.JqueryUtil.dalinAsyncReq = function(url, paramObj, sucsCb,errorCb) {
	$.ajax({
		url : Dcp.getContextPath() +url,
		data : JSON.stringify(paramObj),
	    type : "POST",
	    dataType:'json',
	    async : true,
	    contentType : 'application/json; charset=utf-8',
	    success : function(rs) {
	    	sucsCb(rs);
	    },
	    error    : errorCb || function() {
	    	//alert('对不起, 您的请求['+url+']失败, 请尽快联系管理员处理');
	    	if(window.console) console.error('对不起, 您的请求['+url+']失败, 请尽快联系管理员处理');
		}
	 });
}
Dcp.biz.apiRequest = function(cmd, params, cb,errorCb) {
	Dcp.JqueryUtil.dalinReq('/pr/yaxin/client?p=' + cmd, params, cb,errorCb);
}

Dcp.biz.apiAsyncRequest = function(cmd, params, cb,errorCb) {
	Dcp.JqueryUtil.dalinAsyncReq('/pr/yaxin/client?p=' + cmd, params, cb,errorCb);
}

Dcp.biz.getCurrentUser = function(cb,errorCb) {
	Dcp.JqueryUtil.dalinAsyncReq('/pr/yaxin/getCurrentUser',null,function(data){
		//console.log(data);
		if(null!=data&&""!=data){
			var userInfo =  $.toJSON(data);				
			cb(data);
		}		
	},errorCb);
}