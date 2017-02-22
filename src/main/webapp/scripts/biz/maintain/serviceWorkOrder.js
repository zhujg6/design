/**
 * 各种服务的service
 */
Dcp.namespace("com.skyform.service");
// 调用api post
com.skyform.service.callApi = function(api,params,method,onSuccess,onError,async) {
	Dcp.biz.apiRequestRedmine(api,params || {},method,function(result){
//		if(result) {
//			if(onSuccess) {
//				onSuccess(result);
//			}
//		} 
		if(onSuccess) {
			onSuccess(result);
		}
	},function(error){
		if(error && error.status && error.status == 403) {
			window.alert(Dict.val("nas_your_session_has_expired_please_login_again"));
			window.location = CONTEXT_PATH + "/jsp/login.jsp";
		}
		if(onError) {
			onError(Dict.val("wo_for_data_error_please_try_again_later"));
		}
	},async);
};

//调用api get
com.skyform.service.callGetApi = function(api,onSuccess,onError,async) {
	Dcp.biz.apiRedmineRequestGet(api,function(result){
		if(result) {
			if(onSuccess) {
				onSuccess(result);
			}
		} else if (onError) {
			onError(result);
		}
	},function(error){
		if(error && error.status && error.status == 403) {
			window.alert(Dict.val("nas_your_session_has_expired_please_login_again"));
			window.location = CONTEXT_PATH + "/jsp/login.jsp";
		}
		if(onError) {
			onError(Dict.val("wo_for_data_error_please_try_again_later"));
		}
	},async);
};
com.skyform.service.StateService={
		workOrderStatus:{
				"new":"<span class='label label-info'>"+Dict.val("wo_new")+"</span>",
				"running":"<span class='label label-inverse'>"+Dict.val("user_processing")+"</span>",
				"runningR":"<span class='label label-inverse'>"+Dict.val("wo_pool_processing")+"</span>",
				"runningY":"<span class='label label-inverse'>"+Dict.val("wo_R_&_D_processing")+"</span>",
				"finished":"<span class='label label-success'>"+Dict.val("wo_solved")+"</span>",
				"back":"<span class='label label-warning'>"+Dict.val("wo_feedback")+"</span>",
				"closed":"<span class='label'>"+Dict.val("wo_closed")+"</span>",
				"disagree":"<span class='label label-important'>"+Dict.val("wo_rejected")+"</span>"
		}
		
};
/**
 * 工单service
 */
com.skyform.service.workOrderService = {
	callApi : com.skyform.service.callGetApi,
	callPApi:com.skyform.service.callApi,
	getListWorkOrders : function(api,onSuccess,onError){
	    var action = "/issues.json"+api;
		this.callApi(action,onSuccess, onError,false);
	},
	listCategories:function(id,onSuccess,onError){
	    var action = "/projects/"+id+"/issue_categories.json";
		this.callApi(action,onSuccess, onError,false);
	},
	getWorkOrder:function(id,onSuccess,onError){
	    var action = "/issues/"+id+".json";
		this.callApi(action,onSuccess, onError,false);
	},
	getRecord:function(id,onSuccess,onError){
	    var action = "/issues/"+id+".json&include=journals";
		this.callApi(action,onSuccess, onError,false);
	},
	getStatus:function(onSuccess,onError){
	    var action = "/issue_statuses.json";
		this.callApi(action,onSuccess, onError,false);
	},
	getUser:function(account,onSuccess,onError){
		 var action = "/users.json&name="+account;
		this.callApi(action,onSuccess, onError,false);
	},
	recordBack:function(record,onSuccess,onError){
		var action = "/issues/"+record.id+".json";
		this.callPApi(action,record,"PUT",onSuccess,onError,false);
	},
	createIssue:function(record,onSuccess,onError){
		var action = "/issues.json";
		this.callPApi(action,record,"POST",onSuccess,onError,false);
	},
	closeWorkOrder:function(record,onSuccess,onError){
		var action ="/issues/"+record.id+".json";
		this.callPApi(action,record,"PUT",onSuccess,onError,false);
	},
	updateAttachment:function(record,onSuccess,onError){
		var action ="/issues/"+record.id+".json&typeFlag=journals";
		this.callPApi(action,record,"PUT",onSuccess,onError,false);
	},
	insertJournals:function(record,onSuccess,onError){
		var date = new Date();
		var action ="/issues/"+record.id+".json?&typeFlag=journals";
		this.callPApi(action,record,"PUT",onSuccess,onError,false);
	}
};


