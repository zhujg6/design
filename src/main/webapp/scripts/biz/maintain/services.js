/**
 * 各种服务的service
 */
Dcp.namespace("com.skyform.service");
var currentUser = "";
var currentUserName = "";
Dcp.biz.getCurrentUser(function(data){
	if(data){
		currentUser = data;		
		currentUserName = currentUser.account;
	}	
	//console.log(admin);
})
// 调用api
com.skyform.service.callApi = function(api,params,onSuccess,onError) {
	Dcp.biz.apiAsyncRequest(api,params || {},function(result){
		if(result&&result.code ==0) {
			if(onSuccess) {
				if(api.indexOf("listCommRelationSources")>0){
					if(typeof(result.data) == "string")
					result.data = $.parseJSON(result.data);
				};
				var keys=null;
				if(typeof(CommonEnum)!='undefined'&&-1!=CommonEnum.currentPool.indexOf(Config.storgeNetCardPool)){
					if(api.indexOf("qrySecurityGroup")>0){
						$.each(result.data,function(key,value){
							if(value.isDefault=="1"){
								keys=key;
							}
						});
						if(keys!=null){
							result.data.splice(keys,1)
						}
						onSuccess(result.data);
					}
				}
				if(typeof(result.snaps)=='undefined'){
					onSuccess(result.data);
				}else{
					onSuccess(result.data||result.snaps);
				}
				
				
			}
		} else {
			com.skyform.service.sessionExecute(result,onError);
		}
			 
		
	},function(error){
		if(error && error.status && error.status == 403) {
			window.alert(Dict.val("nas_your_session_has_expired_please_login_again"));
			window.location = CONTEXT_PATH + "/jsp/login.jsp";
		}
		if(onError) {
			onError(Dict.val("wo_for_data_error_please_try_again_later"));
		}
	});
};
com.skyform.service.callSyncApi = function(api,params,onSuccess,onError) {
	Dcp.biz.apiRequest(api,params || {},function(result){
		if(result&&result.code ==0) {
			if(onSuccess) {
				onSuccess(result.data||result.snaps);
			}
		} else {
			com.skyform.service.sessionExecute(result,onError);
		}
	},function(error){
		if(error && error.status && error.status == 403) {
			window.alert(Dict.val("nas_your_session_has_expired_please_login_again"));
			window.location = CONTEXT_PATH + "/jsp/login.jsp";
		}
		if(onError) {
			onError(Dict.val("wo_for_data_error_please_try_again_later"));
		}
	});
};


com.skyform.service.callSyncApi4yaxin = function(api,params,onSuccess,onError) {
	Dcp.biz.apiRequest(api,params || {},function(result){
		if(result&&result.code ==0) {
			if(onSuccess) {
				onSuccess(result);
			}
		} else {
			com.skyform.service.sessionExecute(result,onError);
		}
	},function(error){
		if(error && error.status && error.status == 403) {
			window.alert(Dict.val("nas_your_session_has_expired_please_login_again"));
			window.location = CONTEXT_PATH + "/jsp/login.jsp";
		}
		if(onError) {
			onError(Dict.val("wo_for_data_error_please_try_again_later"));
		}
	});
};

com.skyform.service.callAsyncApi4yaxin = function(api,params,onSuccess,onError) {
	Dcp.biz.apiAsyncRequest(api,params || {},function(result){
		if(result&&result.code ==0) {
			if(onSuccess) {
				onSuccess(result);
			}
		} else {
			com.skyform.service.sessionExecute(result,onError);
		}
	},function(error){
		if(error && error.status && error.status == 403) {
			window.alert(Dict.val("nas_your_session_has_expired_please_login_again"));
			window.location = CONTEXT_PATH + "/jsp/login.jsp";
		}
		if(onError) {
			onError(Dict.val("wo_for_data_error_please_try_again_later"));
		}
	});
};



com.skyform.service.call = function(api,params,onSuccess,onError) {
	Dcp.JqueryUtil.dalinReq4obs(api,params || {},function(result){
		if(result&&result.code ==0) {
			if(onSuccess) {
				onSuccess(result.data);
			}
		} else {
			com.skyform.service.sessionExecute(result,onError);
		}
	},function(error){
		if(error && error.status && error.status == 403) {
			window.alert(Dict.val("nas_your_session_has_expired_please_login_again"));
			window.location = CONTEXT_PATH + "/jsp/login.jsp";
		}
		if(onError) {
			onError(Dict.val("wo_for_data_error_please_try_again_later"));
		}
	});
};

com.skyform.service.callSyncApi = function(api,params,onSuccess,onError) {
	Dcp.biz.apiRequest(api,params || {},function(result){
		if(result&&result.code ==0) {
			if(onSuccess) {
				onSuccess(result.data);
			}
		} else {
			com.skyform.service.sessionExecute(result,onError);
		}
	},function(error){
		if(error && error.status && error.status == 403) {
			window.alert(Dict.val("nas_your_session_has_expired_please_login_again"));
			window.location = CONTEXT_PATH + "/jsp/login.jsp";
		}
		if(onError) {
			onError(Dict.val("wo_for_data_error_please_try_again_later"));
		}
	});
};

com.skyform.service.callSyncApiPara = function(api,params,onSuccess,onError) {
	Dcp.JqueryUtil.dalinReq4obsSyn(api,params || {},function(result){
		if(result&&result.code ==0) {
			if(onSuccess) {
				onSuccess(result.data);
			}
		} else {
			com.skyform.service.sessionExecute(result,onError);
		}
	},function(error){
		if(error && error.status && error.status == 403) {
			window.alert(Dict.val("nas_your_session_has_expired_please_login_again"));
			window.location = CONTEXT_PATH + "/jsp/login.jsp";
		}
		if(onError) {
			onError(Dict.val("wo_for_data_error_please_try_again_later"));
		}
	});
};

//调用抽奖api 异步post
com.skyform.service.callPostSyncApi = function(api,params,onSuccess,onError) {
	Dcp.biz.apiSoftPostAsyncRequest(api,params || {},function(result){
		if(result&&result.code ==0) {
			if(onSuccess) {
				onSuccess(result.response);
			}
		} else {
			com.skyform.service.sessionExecute(result,onError);
		}
	},function(error){
		if(error && error.status && error.status == 403) {
			window.alert(Dict.val("nas_your_session_has_expired_please_login_again"));
			window.location = CONTEXT_PATH + "/jsp/login.jsp";
		}
		if(onError) {
			onError(Dict.val("wo_for_data_error_please_try_again_later"));
		}
	});
};

com.skyform.service.sessionExecute = function(result,onError){
	 if(result != null){
		  var msg = result.msg||result.message;
		  if(msg == "当前用户会话已失效,请重新登录"){
				$.growlUI("提示", msg);
				window.location = CONTEXT_PATH + "/jsp/login.jsp";
			}  
			else if(onError){
				onError(msg);
			} 
	  }else{
		//onError(Dict.val("wo_for_data_error_please_try_again_later"));
	  }
};
/**
 * 虚拟机service
 */
com.skyform.service.vmService = {
	callApi : com.skyform.service.callApi,
	callSyncApi : com.skyform.service.callSyncApi,
	listTemplates : function(onSuccess,onError){
		var params = {
			"id" : 0
		};
		this.callApi("/instance/vm/listTemplates", params, onSuccess, onError);
	},
	listServiceOfferings : function(onSuccess,onError){
		var params = {
				"id" : 0
		};
		this.callApi("instance/vm/listServiceOfferings", params, onSuccess, onError);
	},
	listInstances : function(onSuccess,onError){
		this.callApi("/instance/vm/describeInstances", {}, onSuccess, onError);
	},
	queryInstances : function(params,onSuccess,onError){
		this.callApi("/instance/vm/describeInstances",params, onSuccess, onError);
	},
	getOs : function(params,onSuccess,onError){
		this.callSyncApi("/pm/getOs",params, onSuccess, onError);
	},
	createInstance : function(instance,onSuccess,onError) {
		com.skyform.service.callSyncApi4yaxin("/trade/vmSubscribe", instance, onSuccess, onError);
	},
	queryFreeBasicNetworkIp : function(instance,onSuccess,onError) {
		com.skyform.service.callSyncApi4yaxin("/publicIp/queryFreeBasicNetworkIp", instance, onSuccess, onError);
	},
	ensureResourceEnough : function(instance,onSuccess,onError) {
		this.callApi("/instance/vm/ensureResourceEnough", instance, onSuccess, onError);
	},
	destroyVM : function(selectedInstanceId,onSuccess,onError) {
		this.callApi("/instance/vm/terminateInstances", {"listIds":selectedInstanceId}, onSuccess, onError);
	},
	getDRPool : function(resourcePool ,onSuccess,onError) {
		this.callSyncApi("/instance/vm/getDRPool", {"resourcePool":resourcePool }, onSuccess, onError);
	},
	bandwidthCreat : function(subId ,onSuccess,onError) {
		this.callSyncApi("/networkCard/queryDefaultNetworkCardByVmId", {"subId":subId }, onSuccess, onError);
	},
	bandwidthChange : function(nicId ,limitRate,onSuccess,onError) {
		var params={
			"subId":nicId,
			"limitRate":limitRate+""
		}
		this.callApi("/instance/networkcard/limitNetworkCards", params, onSuccess, onError);
	},
	queryAZAndAzQuota : function(targetPool ,onSuccess,onError) {
		var timestamp = new Date().getTime();
		this.callApi("/instance/quota/queryAZAndAzQuota&_="+timestamp, {"pool":targetPool }, onSuccess, onError);
	},
	disasterRecoveryVm : function(subscriptionId,targetPool,resourcePool,availableZoneId,onSuccess,onError) {
		var params = {
			"subscriptionId" : parseInt(subscriptionId),
			"targetPool" : targetPool,
			"resourcePool": resourcePool,
			"targetAZId": availableZoneId
		};
		this.callApi("/instance/vm/disasterRecoveryVm",params,onSuccess,onError);
	},
	listNetworks : function(onSuccess,onError) {
		this.callApi("/instance/vm/listNetworks",{},onSuccess,onError);
	},
	stopVms : function(vmIds,onSuccess,onError) {
		this.callApi("/instance/vm/stopInstances" ,{"listIds":vmIds},onSuccess,onError);
	},
	restartVms : function(vmIds,onSuccess,onError) {
		this.callApi("/instance/vm/restartInstances",{"listIds":vmIds},onSuccess,onError);
	},
	startVms : function(vmIds,onSuccess,onError) {
		this.callApi("/instance/vm/startInstances",{"listIds":vmIds},onSuccess,onError);
	} ,
	resetPWD : function(condition,onSuccess,onError) {
		this.callApi("/instance/vm/resetVirtualMachinePassword",condition,onSuccess,onError);
	},
	updateNameAndDescription : function(vmId,newName,newDesc,onSuccess,onError) {
		var params = {
			"subscriptionId" : parseInt(vmId),
			"subscripName" : newName,
			"busiCode": "Vm.SubName.Mod",
			"comment" : newDesc
		};
		this.callApi("/instance/vm/updateSubName",params,onSuccess,onError);
	},
	upgradeCfg : function(instanceInfo,onSuccess,onError) {
		this.callApi("/instance/vm/modifyInstanceAttributes",instanceInfo,onSuccess,onError);
	},
	listRelatedInstances : function(vmId,onSuccess,onError){
		var condition = {
			"subscriptionId" : ""+vmId
		};
		this.callApi("/instance/commquery/listCommRelationSources",condition,onSuccess,onError);
	},
	getConsoleInfo : function(vmEid,onSuccess,onError){
		var param = {
			"subscriptionId" : Number(vmEid)
		};
//		if(!window.WebSocket) {
//			param.id = vmEid;
//			param.type = "novnc";
////			param.type = "xvpvnc";
//			
//		}
		this.callApi("/instance/vm/getConsoleInfo/",param,onSuccess,onError);
	},
	listIriRelation : function (vmId, onSuccess,onError) {
		//listIriRelation
		var param = {"vmId" : vmId};
		this.callApi("/instance/vm/listIriRelation",param,onSuccess,onError);
	},
	bindSecurityGroupToVm : function(firewallId,vmId,onSuccess,onError) {
		var params = {
				"firewallId" : firewallId,
				"vmId" : vmId
			};
		this.callApi("/instance/vm/bindSecurityGroupToVm/",params,onSuccess,onError);
	},

	listVMStock : function(cpuNum,mem,osId,osDisk,onSuccess,onError){
		var param = {
			"cpuNum":cpuNum,
			"mem":mem,
			"os":osId,
			"osDisk":osDisk
		};
		this.callApi("/instance/vm/listVMStock",param,onSuccess,onError);
	},	
	getPrivateNets : function(vmId,bindState,onSuccess,onError){
		var param = {
			"vmId":vmId,
			"bindState":bindState
		};
		this.callApi("/instance/vxnet/getPrivateNets",param,onSuccess,onError);
	},
	addVM : function(netIds,vmIds,onSuccess,onError){
		var param = {
			"netIds":netIds,
			"vmIds":vmIds
		};
		this.callApi("/instance/vxnet/addVM",param,onSuccess,onError);
	},
	removeVM : function(netIds,vmIds,onSuccess,onError){
		var param = {
			"netIds":netIds,
			"vmIds":vmIds
		};
		this.callApi("/instance/vxnet/removeVM",param,onSuccess,onError);
	},
	listImagetemplates : function(onSuccess,onError){
		this.callApi("/image/queryVmImageInfo",null,onSuccess,onError);
	},
	appVmSubscribe : function(instance,onSuccess,onError){	
		com.skyform.service.callSyncApi4yaxin("/trade/appVmSubscribe",instance,onSuccess,onError);
	},
	queryCustIdent : function(onSuccess,onError){
		this.callApi("/instance/query/qryCustIdent",{},onSuccess,onError);
	},
	getOsListByVmId:function(condition,onSuccess,onError){	
		this.callApi("/instance/vm/getOsListByVmId",condition,onSuccess,onError);
	},
	changeVMOs:function(condition,onSuccess,onError){
		this.callApi("/instance/vm/resetVm",condition,onSuccess,onError);
    },
    getVmRandomPassword:function(condition,onSuccess,onError){
		this.callApi("/instance/vm/getVmRandomPassword",condition,onSuccess,onError);
    },
    getDefaultSG:function(onSuccess,onError){
		this.callSyncApi("/instance/commquery/getCustDefaultSub",{"serviceType":1010},onSuccess,onError);
    },
	getDefaultSubnet:function(onSuccess,onError){
		this.callSyncApi("/instance/commquery/getCustDefaultSub",{"serviceType":1009},onSuccess,onError);
    },
    describeInstancesByGroupIsEmpty : function(networkId, onSuccess,onError){
		this.callApi("/instance/vm/describeInstancesByGroupIsEmpty",{"groupIsEmpty":"0", "networkId": networkId}, onSuccess, onError);
	},
	disasterRecoveryInstances : function(vmId,onSuccess,onError){
		var condition = {
			"serviceType" : "1001",
			"subsId" : ""+vmId
		};
		this.callApi("/instance/vm/getDisasterRecoverySubsInfo",condition,onSuccess,onError);
	},
	queryCloudFirewallOpenStatus:function(param,onSuccess,onError){
		this.callApi("/queryCloudFirewallOpenStatus",param, onSuccess, onError);
	},
	openOrCloseCloudFirewall:function(param,onSuccess,onError){
		this.callApi("/openOrCloseCloudFirewall",param, onSuccess, onError);
	},
	describeCloudDefinderState:function(param,onSuccess,onError){
		this.callApi("/describeCloudDefinderState",param, onSuccess, onError);
	},
	setCloudDefinderState:function(param,onSuccess,onError){
		this.callApi("/setCloudDefinderState",param, onSuccess, onError);
	}
};

/**
 * 虚拟机快照service
 */
com.skyform.service.snap = {
		
		callApi : com.skyform.service.callApi,
		
		searchSnap : function(condition,onSuccess,onError){
			this.callApi("/snapshot/searchSnap",condition,onSuccess,onError);
		},
		deleteSnap : function(condition,onSuccess,onError){
			this.callApi("/snapshot/deleteSnap",condition,onSuccess,onError);
		},
		createSnap : function(condition,onSuccess,onError){
			this.callApi("/snapshot/createSnap",condition,onSuccess,onError);
		},
		recovery : function(condition,onSuccess,onError){
			this.callApi("/snapshot/recovery",condition,onSuccess,onError);
		}
		
};
/**
 * 镜像管理service
 */
com.skyform.service.imageService = {
		
		callSyncApi4yaxin : com.skyform.service.callSyncApi4yaxin,
		
		listImage : function(condition,onSuccess,onError){
			com.skyform.service.callApi("/image/listImage",condition,onSuccess,onError);
		},
		createImage : function(condition,onSuccess,onError){
			this.callSyncApi4yaxin("/image/createImage",condition,onSuccess,onError);
		},
		deleImage : function(condition,onSuccess,onError){
			this.callSyncApi4yaxin("/image/deleteImage",condition,onSuccess,onError);
		},
		modifyImage : function(condition,onSuccess,onError){
			this.callSyncApi4yaxin("/image/modifyImage",condition,onSuccess,onError);
		},
		QueryProductIdByServiceTypeBillType: function(condition,onSuccess,onError){
			this.callSyncApi4yaxin("/pm/getConsoleDiyProduct",condition,onSuccess,onError);
		}
};
//lb monitor rule
com.skyform.service.LBMRService = {
		callApi : com.skyform.service.callApi,
		callSyncApi:com.skyform.service.callSyncApi,
		createMR:function(indent,onSuccess,onError){//创建监控规则
			this.callApi("/instance/lb/createLbHealthMonitor",indent,onSuccess,onError);
		},
		updateMR:function(indent,onSuccess,onError){//更新监控规则
			this.callApi("/instance/lb/modifyLbHealthMonitor",indent,onSuccess,onError);
		},
		listLbHealthMonitor:function(params,onSuccess,onError){//查询所有的监控规则
//			var params={};
			this.callApi("/instance/lb/listLbHealthMonitor",params,onSuccess,onError);
		},
		unBindLbList:function(onSuccess,onError){//查询所有的监控规则
			var params={};
			this.callApi("/instance/lb/unBindLbList",params,onSuccess,onError);
		},
		bindLbList:function(params,onSuccess,onError){//查询所有的监控规则
			this.callApi("/instance/lb/bindLbList",params,onSuccess,onError);
		},
		destroy : function(mrId,onSuccess,onError) {//删除监控规则
			this.callApi("/instance/lb/deleteLbHealthMonitor",mrId,onSuccess,onError);
		},
		updateMRName:function(ident,onSuccess,onError){
			this.callApi("/instance/lb/modifyLbHealthMonitorName",ident,onSuccess,onError);
		},
		describeVMHealthCondition:function(params,onSuccess,onError){
			//var params = {};
			this.callApi("/instance/lb/describeVMHealthCondition",params,onSuccess,onError);
			/*var result=null;
			$.ajax({
				"url" : "/portal/ajax/mrhealthlist.json",
				"type" : "GET",
				"dataType" : "json",
				"async" : false,
				"success" : function(data) {
					result=data.data;
				}
				});
			if(onSuccess){
				onSuccess(result);
			}else if(onError){
				onError("request data is not exists");
			}
*/
		},
		queryVMHealthState:function(type){
			switch(type){
			case "0"  : return "正常";
			case "1"  : return "不正常";
			default : return "";
		    }
		},
		queryBindState:function(type){
			switch(type){
			case  0  : return "<span href=\"#\" data-toggle=\"popover\" title=\"关系正在建立\" class=\"state-blue\"><i class=\"icon-spinner icon-spin blue mr5\"></i>关系正在建立</span>";
			case  1  : return "<span href=\"#\" data-toggle=\"popover\" title=\"关系建立失败\" class=\"state-red\"><i class=\"icon-warning-sign orange mr5\"></i>关系建立失败</span>";
			case  2  : return "<span href=\"#\" data-toggle=\"popover\" title=\"关系正在失效\" class=\"state-copper\"><i class=\"icon-spinner icon-spin blue mr5\"></i>关系正在失效</span>";
			case  3  : return "<span href=\"#\" data-toggle=\"popover\" title=\"关系失效失败\" class=\"state-red\"><i class=\"icon-warning-sign orange mr5\"></i>关系失效失败</span>";
			case  4  : return "<span href=\"#\" data-toggle=\"popover\" title=\"关系失效\" class=\"state-gray\"><i class=\"icon-reply darkgray mr5\"></i>关系失效</span>";
			case  9  : return "<span href=\"#\" data-toggle=\"popover\" title=\"关系建立成功\" class=\"state-green\"><i class=\"icon-ok green mr5\"></i>关系建立成功</span>";
			default : return "";
		    }
		},
		associateLbHealthMonitor:function(params,onSuccess,onError){
			this.callApi("/instance/lb/associateLbHealthMonitor",params,onSuccess,onError);
		},
		disassociateLbHealthMonitor:function(params,onSuccess,onError){
			this.callApi("/instance/lb/disassociateLbHealthMonitor",params,onSuccess,onError);
		},
		listRelatedInstances : function(mrId,onSuccess,onError){
			var condition = {
					"subscriptionId" : ""+mrId
				};
//				this.callApi("/instance/commquery/listCommRelationSources",condition,onSuccess,onError);
			
			this.callApi("/instance/commquery/listCommRelationSources",condition,onSuccess,onError);
		}
};
com.skyform.service.dpService = {
		callApi : com.skyform.service.callApi,
		callSyncApi:com.skyform.service.callSyncApi,
		describeCloudDefinderSecurity:function(indent,onSuccess,onError){
			this.callApi("/describeCloudDefinderSecurityEvent",indent,onSuccess,onError);
		},
		cloudSecurityQuery:function(indent,onSuccess,onError){
			this.callApi("/cloudSecurityQuery",indent,onSuccess,onError);
		},
		getType : function(data,type){
			switch(data){
				case "on" : return "<a onclick=\"safetyProfile.showDetails(\'"+type+"\')\" class=\"btn actionBtn\" data-toggle=\"modal\" >查看详情</a>";
				case "off" : return "<a class=\"btn actionBtn disabled\" data-toggle=\"modal\" >查看详情</a>";
				default : return data;
			}
		},
		cloudSecurityStatistics:function(onSuccess,onError){
			this.callApi("/cloudSecurityStatistics",{},onSuccess,onError);
		},
		describeCloudWebProtectEvent:function(indent,onSuccess,onError){
			this.callApi("/describeCloudWebProtectEvent",indent,onSuccess,onError);
		}
};

//网络漏洞扫描
com.skyform.service.scanService = {
		callApi : com.skyform.service.callApi,
		callSyncApi:com.skyform.service.callSyncApi,
		listRelatedInstances : function(mrId,onSuccess,onError){
			var condition = {
					"subscriptionId" : ""+mrId
				};
//				this.callApi("/instance/commquery/listCommRelationSources",condition,onSuccess,onError);
			
			this.callApi("/instance/commquery/listCommRelationSources",condition,onSuccess,onError);
		},
		createScanner :function(params,onSuccess,onError){
			this.callApi("/createScanner",params,onSuccess,onError);
		},
		deleteScanner :function(params,onSuccess,onError){
			this.callApi("/deleteScanner",params,onSuccess,onError);
		},
		runScanner  :function(params,onSuccess,onError){
			this.callApi("/runScanner",params,onSuccess,onError);
		},
		describeScanner :function(params,onSuccess,onError){
			this.callApi("/describeScanner",params,onSuccess,onError);
		},
		describeScannerResult :function(params,onSuccess,onError){
			this.callApi("/describeScannerResult",params,onSuccess,onError);
		},
		downloadShareFile :function(params,onSuccess,onError){
			this.callApi("/downloadShareFile",params,onSuccess,onError);
		},
		listInstances : function(params,onSuccess,onError){
			this.callApi("/instance/vm/describeInstances", params, onSuccess, onError);
		}
};


/**
 * 路由器service
 */
com.skyform.service.routeService = {
	callApi : com.skyform.service.callApi,
	callSyncApi:com.skyform.service.callSyncApi,
	getById : function(id,onSuccess,onError){
		this.callApi("/instance/route/describeRouter",{queryMine:true,id:id},onSuccess,onError);
	},
	listAll : function(onSuccess,onError){
		this.callApi("/instance/route/describeRouter",{queryMine:true},onSuccess,onError);
	},
	query : function(condition,onSuccess,onError){
		condition.queryMine = true;
		this.callApi("/instance/route/describeRouter",condition,onSuccess,onError);
	},
	save : function(route,onSuccess,onError){
		this.callApi("/instance/route/addRoute",route,onSuccess,onError);
	},
	submit : function(route,onSuccess,onError){ //added by shixianzhi
		this.callApi("/trade/createRouter",route,onSuccess,onError);
	},
	update : function(routeId,route,onSuccess,onError){
		this.callApi("/instance/route/modifyRouterName",route,onSuccess,onError);
	},
	destroy : function(routeId,onSuccess,onError) {
		this.callApi("/instance/route/deleteRoute",routeId,onSuccess,onError);
	},
	listPublicIpsByRoute : function(routeId,onSuccess,onError){
		this.callApi("/instance/route/ip" ,{routeId:routeId},onSuccess,onError);
	},
	listNatRulesByRoute : function(routeId,onSuccess,onError) {
		this.callApi("/instance/route/queryRuleByRouterId",{subscriptionId:parseInt(routeId)},onSuccess,onError);
	},
	listNatRules : function(routeId,onSuccess,onError) {
		this.callSyncApi("/instance/route/queryRuleByRouterId",{subscriptionId:parseInt

(routeId)},onSuccess,onError);
	},
	addNatRule : function(rule,onSuccess,onError) {
		this.callApi("/instance/route/addRule",rule,onSuccess,onError);
	},
	updateNatRule : function(ruleId,rule,onSuccess,onError) {
		this.callApi("/instance/route/updateRule/" + ruleId,rule,onSuccess,onError);
	},
	deleteNatRule : function(ruleId,onSuccess,onError) {// modifyed by shixianzhi : 大括号里面加东西
		this.callApi("/instance/route/deleteRule",{"ruleId":ruleId+""},onSuccess,onError);
	},
	listRelatedInstances : function(routeId,onSuccess,onError){
		var condition = {
			"subscriptionId" : ""+routeId
		};
		this.callApi("/instance/route/listCommRelationSources",condition,onSuccess,onError);
	},
	queryAllDedLineList:function(params,onSuccess,onError){
			this.callApi("/instance/route/queryAllDedLineList",params,onSuccess,onError);
	},
	querydedLineInfo:function(dedLineId,onSuccess,onError){
		var condition = {
				"dedLineId" : ""+dedLineId
			};
			this.callApi("/instance/route/querydedLineInfoList",condition,onSuccess,onError);
	},
	listBindWidthByDedLine:function(dedLineId,onSuccess,onError){
		var condition = {
				"dedLineId" : ""+dedLineId
			};
			this.callApi("/instance/route/listBindWidthByDedLine",condition,onSuccess,onError);
	},
	dedLineSave : function(route,onSuccess,onError){
		this.callApi("/instance/route/addRouteByDedLine",route,onSuccess,onError);
	}
};
com.skyform.service.desktopCloudService = {
		callApi : com.skyform.service.callApi,
		saveDesktopInfo:function(params,onSuccess,onError){
			this.callApi("/desktopCloud/createCloudTab",params,onSuccess,onError);
		},
		queryResArea:function(onSuccess,onError){
			var result=null;
			$.ajax({
				"url" : "/portal/ajax/queryArea.json",
				"type" : "GET",
				"dataType" : "json",
				"async" : false,
				"success" : function(result1) {
					result=result1;
				}
				});
			if(onSuccess){
				onSuccess(result);
			}else if(onError){
				onError("request data is not exists");
			}
			//this.callApi("/instance/route/listCommRelationSources",condition,onSuccess,onError);
		},
		queryAreaInfo:function(condition,onSuccess,onError){
			var result=[{"desc":"廊坊一区","ereaFlag":"1","ereaId":"1"},
			            {"desc":"廊坊一区","ereaFlag":"1","ereaId":"2"},
			            {"desc":"河北","ereaFlag":"2","ereaId":"3"},
			            {"desc":"山东","ereaFlag":"2","ereaId":"4"}
			            ]

			if(onSuccess){
				onSuccess(result);
			}else if(onError){
				onError("request data is not exists");
			}
//			this.callApi("/desktopCloud/queryAreaInfo",condition,onSuccess,onError);
		},
		getIta:function(condition,onSuccess,onError){
			this.callApi("/desktopCloud/getIta",condition,onSuccess,onError);
		},
		getOU:function(condition,onSuccess,onError){
			this.callApi("/desktopCloud/getIta",condition,onSuccess,onError);
		},
		queryUserInfo:function(condition,onSuccess,onError){
			this.callApi("/desktopCloud/listTenant",condition,onSuccess,onError);
		},
		destroy:function(condition,onSuccess,onError){
			this.callApi("/desktopCloud/destroyTenant",condition,onSuccess,onError);
		},
		save:function(condition,onSuccess,onError){
			this.callApi("/desktopCloud/createTeant",condition,onSuccess,onError);
		},
		update:function(condition,onSuccess,onError){
			this.callApi("/desktopCloud/updateTenant",condition,onSuccess,onError);
		},
		queryDesktopConfigInfo:function(params,onSuccess,onError){
			this.callApi("/desktopCloud/pm/getPmMuPrtyConfigInfoByBillAndServiceType",
					params,onSuccess,onError);
		},
		getCloudTabQuoTa:function(params,onSuccess,onError){
			this.callApi("/getCloudTabQuoTa",params, onSuccess, onError);		
		},
		/*
		test:function(onSuccess,onError){
//			var result=null;
//			$.ajax({
//				"url" : "/portal/ajax/mrlist.json",
//				"type" : "GET",
//				"dataType" : "json",
//				"async" : false,
//				"success" : function(result1) {
//					alert(result1);
//				},
//				"error":function(result1){
//					console.log(result1);
//				}
//				});
			
			//this.callApi("/ajax/mrlist.json",indent,onSuccess,onError);
			this.callApi("/instance/vm/describeInstances", {}, onSuccess, onError);
		},
		
		*/
		//查询桌面云
		queryCloudTab:function(onSuccess,onError){
			this.callApi("/desktopCloud/queryCloudTab ", {}, onSuccess, onError);
		},
		//开机
		openCloudTab:function(subsId,onSuccess,onError){
			this.callApi("/desktopCloud/openCloudTab", {"subsId":subsId}, onSuccess, onError);
		},
		//销毁
		deleteCloudTab:function(subsId,onSuccess,onError){
			this.callApi("/desktopCloud/deleteCloudTab", {"subsId":subsId}, onSuccess, onError);
		},
		//关机
		closeCloudTab:function(subsId,onSuccess,onError){
			this.callApi("/desktopCloud/closeCloudTab", {"subsId":subsId}, onSuccess, onError);
		},
		//重启
		restartCloudTab:function(subsId,onSuccess,onError){
			this.callApi("/desktopCloud/restartCloudTab", {"subsId":subsId}, onSuccess, onError);
		},
		//重发邮件
		resendEmailCloudTab:function(tenantId,onSuccess,onError){
			this.callApi("/desktopCloud/resendEmailCloudTab", {"tenantId":tenantId}, onSuccess, onError);
		},
		//重置操作
		/*
		resetCloudTabForOS:function(subsId,onSuccess,onError){
			this.callApi("/desktopCloud/resetCloudTabForOS", {"subsId":subsId}, onSuccess, onError);
		},
		*/
		//查询未绑定桌面用户
		unListTenant:function(params,onSuccess,onError){
			this.callApi("/desktopCloud/unListTenant",params, onSuccess, onError);
		},
		//私有查询日志方法
		describeLogs : function(subscriptionId,onSuccess,onError){
			var params = {
					"subscriptionId" : ""+subscriptionId
			};		
			this.callApi("/desktopCloud/user/describeLogsInfo",params,onSuccess,onError);		
		},
		
		deskConfirmTradeSubmit : function(fee,tradeId,createModal,onSuccess,onError){
			createModal.modal("hide");
			var confirmModal_submit;
			if(CommonEnum.offLineBill){				
				confirmModal_submit = new com.skyform.component.Modal(new Date().getTime(),Dict.val

("nas_determine_submit"),Dict.val("nas_do_you_determine_submit"),{
					buttons : [
								{
									name : Dict.val("common_determine"),
									onClick : function(){
										confirmModal_submit.hide();
										

com.skyform.service.desktopCloudService.deskTradeSubmit(tradeId,onSuccess,onError);
										
									},
									attrs : [
										{
											name : 'class',
											value : 'btn btn-primary'
										}
									]
								},
								{
									name : Dict.val("common_cancel"),
									attrs : [
										{
											name : 'class',
											value : 'btn'
										}
									],
									onClick : function(){
										confirmModal_submit.hide();
									}
								}
							]					
				});
				confirmModal_submit.setWidth(500).autoAlign();
				confirmModal_submit.show();									

	    			
				return;
			}
			else {
				com.skyform.service.desktopCloudService.deskQueryBalance2

(fee,tradeId,createModal,onSuccess,onError);
			}
		},
		
		deskTradeSubmit : function(tradeId,onSuccess,onError){
			var params = {
					"tradeId" : tradeId
			};			
			var api = "/desktopCloud/trade/Submit";
			//Dcp.biz.apiRequest(api,params || {},function(result){
			Dcp.biz.apiAsyncRequest(api,params || {},function(result){
				$.unblockUI();
				if(result&&result.code ==0) {
					if(onSuccess) {
						onSuccess(result.data);
					}
				}else if (onError) {
					onError(result.msg);
				} 				
			},function(error){
				$.unblockUI();
				if(error && error.status && error.status == 403) {
					window.alert(Dict.val("nas_your_session_has_expired_please_login_again"));
					window.location = CONTEXT_PATH + "/jsp/login.jsp";
				}
				if(onError) {
					onError(Dict.val("wo_for_data_error_please_try_again_later"));
				}
			});
		},
		
		deskQueryBalance2 : function(fee,tradeId,component,onSuccess,onError){
			var _balance = 0;
			var noCashBalance = 0;
	  		Dcp.biz.apiRequest("/desktopCloud/account/queryBalance",{},function(data) {
	        	var state = data.code;
	        	if(state == 0){
	        		// 余额 单位厘
	        		_balance = data.data[0].Balance;       		
	        		// 换算成元
	        		_balance = _balance/1000;
	        		noCashBalance = data.data[0].noCashBalance;
	        		noCashBalance = noCashBalance/1000;
	        		// 四舍五入保留两位小数
	        		var _remain = noCashBalance+_balance-fee;
	        		_remain = Math.round(_remain*Math.pow(10,2))/Math.pow(10,2);
	        		
//	        		_balance = Math.round(_balance*Math.pow(10,2))/Math.pow(10,2);
//	        		noCashBalance = data.data[0].noCashBalance;
//	        		noCashBalance = noCashBalance/1000;
//	        		noCashBalance = Math.round(noCashBalance*Math.pow(10,2))/Math.pow(10,2);
//	        		var _remain = parseInt(parseInt(noCashBalance)+parseInt(_balance)-parseInt(fee));
					if(_remain<0){
					var html = $('<div class="control-group forFee"><label for="" class="control-label">余额不足,完成该笔订单还需充值<strong style="color: #ff945c">'+-_remain+'</strong>元,您确定充值吗?</label>' +
							'<div class="controls"style="font-size: 14px;font-weight: normal;">应付金额：<span style="color: #ff945c;font-size: 14px;font-weight: 400;">'+fee+'</span>元' +
							'<br>现金余额：<span class="money" style="color: #ff945c;font-size: 14px;font-weight: 400;">'+_balance+'</span>元<br> 代金券：<span style="color: #ff945c;font-size: 14px;font-weight: 400;">' +noCashBalance+
							'</span>元</div></div>');
					var confirmModal_balance = new com.skyform.component.Modal(new Date().getTime

(),Dict.val("common_confirming_recharge"),html.html(),{
						buttons : [
									{
										name : Dict.val("common_confirming_recharge"),
										onClick : function(){
											window.location = 

"/portal/jsp/user/balance.jsp";
										},
										attrs : [
											{
												name : 'class',
												value : 'btn btn-primary'
											}
										]
									},
									{
										name : "返回修改配置",
										onClick : function(){
											confirmModal_balance.hide();
											if(component != null){
												if(component instanceof 

com.skyform.component.Wizard){
													

component.markSubmitSuccess();
													component.reset();
													component.render();
												}else{
													component.modal

("show");
												}
											}
										},
										attrs : [
											{
												name : 'class',
												value : 'btn btn-warning'
											}
										]
									},
									{
										name : Dict.val("common_cancel"),
										attrs : [
											{
												name : 'class',
												value : 'btn'
											}
										],
										onClick : function(){
											confirmModal_balance.hide();
										}
									}
								]					
					});
					confirmModal_balance.setWidth(500).autoAlign();
					confirmModal_balance.show();								

		
					
				}else{
					var html = $('<div class="control-group forFee"><label for="" class="control-label"></label>' +
							'<div class="controls"style="font-size: 14px;font-weight: normal;">应付金额：<span style="color: #ff945c;font-size: 14px;font-weight: 400;">'+fee+'</span>元' +
							'<br>现金余额：<span class="money" style="color: #ff945c;font-size: 14px;font-weight: 400;">'+_balance+'</span>元<br> 代金券：<span style="color: #ff945c;font-size: 14px;font-weight: 400;">' +noCashBalance+
							'</span>元</div></div>');
					var confirmModal_submit = new com.skyform.component.Modal(new Date().getTime(),"确定扣款",html.html(),{
						buttons : [
									{
										name : Dict.val("common_determine"),
										onClick : function(){
											confirmModal_submit.hide();
											$.blockUI();
											

com.skyform.service.desktopCloudService.deskTradeSubmit(tradeId,onSuccess,onError);
										},
										attrs : [
											{
												name : 'class',
												value : 'btn btn-primary'
											}
										]
									},
									{
										name : Dict.val("common_cancel"),
										attrs : [
											{
												name : 'class',
												value : 'btn'
											}
										],
										onClick : function(){
											confirmModal_submit.hide();
										}
									}
								]					
					});
					confirmModal_submit.setWidth(500).autoAlign();
					confirmModal_submit.show();								

		
				}
				}
	        	else if(state == -1){
	        		alert("用户帐务信息不存在, 请联系管理员");
	        		return;
	        	}
	  		});
		},
		deskRenew : function(subsId,period,onSuccess,onError){
			var params = {
					"subscriptionId" : parseInt(subsId),
					"period": period
			};		
			this.callApi("/desktopCloud/trade/renew",params,onSuccess,onError);
		},
		queryTenantInfo : function(params,onSuccess,onError){
			this.callApi("/desktopCloud/tenantInfo",params,onSuccess,onError);
		},
		queryNewCloudTab:function(params,onSuccess,onError){
			this.callApi("/desktopCloud/queryNewCloudTab",params,onSuccess,onError);
		},
		leisureTenantInfo:function(params,onSuccess,onError){
			this.callApi("/desktopCloud/leisureTenantInfo",params,onSuccess,onError);
		},
		queryProCloudTab:function(params,onSuccess,onError){
			this.callApi("/desktopCloud/queryProCloudTab",params,onSuccess,onError);
		},
		queryTenantNoBindTabStoreBlock:function(params,onSuccess,onError){
			this.callApi("/desktopCloud/queryTenantNoBindTabStoreBlock",params,onSuccess,onError);
		},
		queryTabStoreBlock:function(params,onSuccess,onError){
			this.callApi("/desktopCloud/queryTabStoreBlock",params,onSuccess,onError);
		},
		cancelCloudTabUser:function(params,onSuccess,onError){
			this.callApi("/desktopCloud/cancelCloudTabUser",params,onSuccess,onError);
		},
		deleteTabStoreBlock:function(params,onSuccess,onError){
			this.callApi("/desktopCloud/deleteTabStoreBlock",params,onSuccess,onError);
		},
		createCitrixCloudTab:function(params,onSuccess,onError){
			this.callApi("/desktopCloud/createCitrixCloudTab",params,onSuccess,onError);
		},
		distributionProperCloudTab:function(params,onSuccess,onError){
			this.callApi("/desktopCloud/distributionProperCloudTab",params,onSuccess,onError);
		},
		bindingRandomDesk:function(params,onSuccess,onError){
			this.callApi("/desktopCloud/bindingRandomDesk",params,onSuccess,onError);
		},
		unbindingRandomDesk:function(params,onSuccess,onError){
			this.callApi("/desktopCloud/unbindingRandomDesk",params,onSuccess,onError);
		},
		getRandomTenantInfo:function(params,onSuccess,onError){
			this.callApi("/desktopCloud/getRandomTenantInfo",params,onSuccess,onError);
		},
		getRandomTabInfo:function(params,onSuccess,onError){
			this.callApi("/desktopCloud/getRandomTabInfo",params,onSuccess,onError);
		},
		queryRandomTab:function(params,onSuccess,onError){
			this.callApi("/desktopCloud/queryRandomTab",params,onSuccess,onError);
		},
		createTabStoreBlock:function(params,onSuccess,onError){
			this.callApi("/desktopCloud/createTabStoreBlock",params,onSuccess,onError);
		},
		deleteCitrixCloudTab:function(params,onSuccess,onError){
			this.callApi("/desktopCloud/deleteCitrixCloudTab",params,onSuccess,onError);
		},
		queryUnRandomDeskUser:function(params,onSuccess,onError){
			this.callApi("/desktopCloud/queryUnRandomDeskUser",params,onSuccess,onError);
		}
};



/**
 * 网络service
 */
com.skyform.service.privateNetService = {
	callApi : com.skyform.service.callApi,
    listAll : function(onSuccess,onError){
		this.callApi("/subnet/describeSubNet",{queryMine:true},onSuccess,onError);
	},
	queryNetByNameAndPool:function(condition,onSuccess,onError){
		this.callApi("/subnet/getStoredSubNet",condition,onSuccess,onError);
//		this.callApi("/subnet/describeSubNet",{queryMine:true},onSuccess,onError);
	},
	getStoredSubNetIP:function(params,onSuccess,onError){
		
		this.callApi("/subnet/getStoredSubNetIP",params,onSuccess,onError);
	},
	query : function(condition,onSuccess,onError) {
		condition.queryMine = true;
		this.callApi("/subnet/describeSubNet",condition,onSuccess,onError);
	},
	queryById : function(condition,onSuccess,onError) {
		condition.queryMine = true;
		this.callApi("/subnet/describeSubNet",condition,onSuccess,onError);
	},
	save : function(subnet,onSuccess,onError){
		this.callApi("/subnet/createSubNet",subnet,onSuccess,onError);
	},
//	save2 : function(subnet,onSuccess,onError){
//		this.callApi("/subnet/add",subnet,onSuccess,onError);
//	},
    update : function(subnetId,route,onSuccess,onError){
		this.callApi("/subnet/modifyName",route,onSuccess,onError);
	},
	destroy : function(subnetId,onSuccess,onError) {
		this.callApi("/subnet/deleteSubNet",{"subscriptionId" : parseInt(subnetId)},onSuccess,onError);
	},
	attachRoute : function(condition,onSuccess,onError) {
		this.callApi("/subnet/bindRouterToNetwork",condition,onSuccess,onError);
	},
	bindVmToSubnet : function(vmIds,netId,onSuccess,onError) {
		var params = {
				//"primaryInstanceId" : subnet.id,
				//"subnetEid" : subnet.networkid,
				//"vmEid" : vm.eInstanceId,
				//"additionalInstanceId" : vm.id
				"netId" : netId,
				"vmIds" : vmIds
			};
		this.callApi("/instance/vm/addToPrivateNetwork",params,onSuccess,onError);
	},
	unbindVmToSubnet : function(vmIds,netId,onSuccess,onError) {
		var params = {
				//"primaryInstanceId" : subnet.id,
				//"subnetEid" : subnet.networkid,
				//"vmEid" : vm.eInstanceId,
				//"additionalInstanceId" : vm.id
				"netId" : netId,
				"vmIds" : vmIds
			};
		this.callApi("/instance/vm/removeFromPrivateNetwork",params,onSuccess,onError);
	},
	listRelatedInstances : function(netId,onSuccess,onError){
		var condition = {
			"subscriptionId" : ""+netId
		};
		this.callApi("/subnet/listCommRelationSources",condition,onSuccess,onError);
	}
	
	
};
/**
 * 防火墙service
 */
com.skyform.service.FirewallService = {
	callApi : com.skyform.service.callApi,
	listRulesByFirewall : function(routeId,onSuccess,onError) {
		this.callApi("/instance/firewall/rules/" + routeId,{},onSuccess,onError);
	},
	addRule : function(rule,onSuccess,onError) {
		this.callApi("/instance/firewall/addRule",rule,onSuccess,onError);
	},
	updateRule : function(ruleId,rule,onSuccess,onError) {
		this.callApi("/instance/firewall/updateRule/" + ruleId,rule,onSuccess,onError);
	},
	deleteRule : function(ruleId,onSuccess,onError) {
		this.callApi("/instance/firewall/deleteRule",{"ruleId":ruleId+""},onSuccess,onError);
	},
	delSecurityGroupRule : function(param,onSuccess,onError) {
		this.callApi("/instance/securitygroup/delSecurityGroupRule",param,onSuccess,onError);
	},
	addSecurityGroupRule : function(rule,onSuccess,onError) {
		this.callApi("/instance/firewall/addSecurityGroupRule",rule,onSuccess,onError);
	},
	querySG:function(onSuccess,onError){
		this.callApi("/instance/securitygroup/qrySecurityGroup",{},onSuccess,onError);
		
	},
	queryRuleBySG:function(sgId,onSuccess,onError){
		this.callApi("/instance/securitygroup/qrySecurityGroupRulesBySecurityGroup",{"securityGroupId":parseInt

(sgId)},onSuccess,onError);
	},
	saveSG:function(param,onSuccess,onError){
		this.callApi("/instance/securitygroup/createSecurityGroupOnly",param,onSuccess,onError);
	},
	updateSG:function(param,onSuccess,onError){
		this.callApi("/instance/securitygroup/updateSubName",param,onSuccess,onError);
	},
	changeSG:function(param,onSuccess,onError){
		this.callApi("/instance/securitygroup/modifySecurityGroupAndVmRelation",param,onSuccess,onError);
	},
	destroySG:function(param,onSuccess,onError){
		this.callApi("/instance/securitygroup/deleteSecurityGroupOnly",{"securityGroupId":parseInt

(param)},onSuccess,onError);
	},
	getVMIpsbySgId:function(param,onSuccess,onError){
		this.callApi("/instance/securitygroup/queryVmInfoBySecurityGroup",param,onSuccess,onError);
	}
};
/**
 * Eipservice
 */
com.skyform.service.EipService = {
	callApi : com.skyform.service.callApi,
	listAll : function(onSuccess,onError){
		this.callApi("/instance/eip/describeEipServices",{},onSuccess,onError);
	},
	listBindWidthBydedLineId : function(params,onSuccess,onError){
		this.callApi("/instance/eip/describeEipServices",{},onSuccess,onError);
	},
	listByStates : function(states,onSuccess,onError){
		this.callApi("/instance/eip/describeEipServices",{states:states},onSuccess,onError);
	},
	listIdleIps : function(onSuccess,onError) {
		this.callApi("/instance/eip/listIdelIps",{},onSuccess,onError);
	},
	hangedPublicNetWork:function(params,onSuccess,onError) {
		this.callApi("/instance/eip/hangedPublicNetWork",params,onSuccess,onError);
	},
	releasePublicNetWork:function(params,onSuccess,onError) {
		this.callApi("/instance/eip/releasePublicNetWork",params,onSuccess,onError);
	},
	queryAllDedLineList:function(params,onSuccess,onError){
		this.callApi("/instance/eip/queryAllDedLineList",params,onSuccess,onError);
	}
};

com.skyform.service.LBService = {
	callApi : com.skyform.service.callApi,
	listAll : function(onSuccess,onError){
		this.callApi("/instance/lb/describeLbVolumes",{},onSuccess,onError);
	},
	//根据网络id查询负载均衡
	describeLbVolumesByNetworkId:function(networkId,onSuccess,onError){
		var params = {"networkId" : networkId};
		this.callApi("/instance/lb/describeLbVolumesByNetworkId",params,onSuccess,onError);
	}
};
/**
 * vdisk service
 */
com.skyform.service.VdiskService = {
	callApi : com.skyform.service.callApi,
	listAll : function(ownUserId,states,onSuccess,onError){
		var params = {
				"ownUserId":ownUserId,
				"states":states				
		};				
		this.callApi("/instance/vdisk/describeVdiskVolumes",params,onSuccess,onError);
	},
	save : function(volume,onSuccess,onError){
		this.callApi("/instance/vdisk/createVdiskVolumes",volume,onSuccess,onError);
	},
	listVmsToAttach : function(volumeId,onSuccess,onError){
		var params = {
				"id" : volumeId,
				"targetOrAttached" : 1,
				"typesToAttach" : 1,
				"states" : "running"
		};		
		this.callApi("/instance/ebs/describeInstanceInfos",params,onSuccess,onError);	
	},
	attach : function(volumeIds,vmId,onSuccess,onError){
		var params = {
				"volumeIds" : volumeIds,
				"vmId" : vmId
		};
		this.callApi("/instance/vdisk/attachVdiskVolumes",params,onSuccess,onError);		
	},
	detach : function(volumeIds,vmIds,onSuccess,onError){
		var params = {
				"volumeIds" : volumeIds,
				"vmIds" : vmIds
		};
		this.callApi("/instance/vdisk/detachVdiskVolumes",params,onSuccess,onError);
		
	},
	update : function(volumeId,instanceName,onSuccess,onError){
		var params = {
				"id" : volumeId,
				"instanceName": instanceName
		};		
		this.callApi("/instance/vdisk/modifyVdiskVolumeAttributes",params,onSuccess,onError);
		
	},
	destroy : function(volumeIds,onSuccess,onError){
		this.callApi("/instance/vdisk/deleteVdiskVolumes",{"ids" : volumeIds},onSuccess,onError);
	}
};

com.skyform.service.VdiskService4yaxin = {
	callApi : com.skyform.service.callApi,
	//callApi :com.skyform.service.callSyncApi4yaxin,
	listAll : function(params,onSuccess,onError){
		this.callApi("/instance/ebs/describeEbsVolumes",params,onSuccess,onError);
	},
	save : function(volume,onSuccess,onError){
		this.callApi("/instance/ebs/volumSubscribe",volume,onSuccess,onError);
	},
	listVmsToAttach : function(volumeId,onSuccess,onError){
		var params = {
				"id" : Number(volumeId),
//				"targetOrAttached" : 1,
				"typesToAttach" : "1",
				"states" : "running"
		};		
		this.callApi("/instance/ebs/describeHosts",params,onSuccess,onError);	
	},
	attach : function(volumeIds,vmId,onSuccess,onError){
		var params = {
				"ebsid" : volumeIds,
				"hostIds" : vmId
		};
		this.callApi("/instance/ebs/attachEbsVolumes",params,onSuccess,onError);		
	},
	detach : function(volumeIds,vmIds,onSuccess,onError){
		var params = {
				"ebsid" : volumeIds,
				"hostIds" : vmIds
		};
		this.callApi("/instance/ebs/detachEbsVolumes",params,onSuccess,onError);
		
	},
	update : function(volumeId,instanceName,onSuccess,onError){
		var params = {
				"id" : volumeId,
				"instanceName": instanceName
		};		
		this.callApi("/instance/ebs/modifyEbsVolumeAttributes",params,onSuccess,onError);
		
	},
	destroy : function(volumeIds,onSuccess,onError){
		this.callApi("/instance/ebs/deleteEbsVolumes",{"ids" : volumeIds},onSuccess,onError);
	},
	createVolumeReplication : function(params,onSuccess,onError){
		this.callApi("/instance/vdisk/backup/createVolumeReplication",params,onSuccess,onError);
	},
	listAllBackups : function(serviceType,onSuccess,onError){
		this.callApi("/instance/vdisk/backup/listVolumeSnap",{"serviceType":serviceType},onSuccess,onError);
	},
	destroyBackup : function(snapids,onSuccess,onError){
		this.callApi("/instance/vdisk/backup/removeVolumeSnap",{"snapid" : snapids},onSuccess,onError);
	},
	rollbackVolumeFromSnap : function(params,onSuccess,onError){
		this.callApi("/instance/vdisk/backup/rollbackVolumeFromSnap",params,onSuccess,onError);
	},
	CreateStorageFromSnapshot : function(params,onSuccess,onError){
		this.callApi("/instance/vdisk/backup/CreateStorageFromSnapshot",params,onSuccess,onError);
	},
	newOrEditVolumeReplicationTask : function(params,onSuccess,onError){
		this.callApi("/instance/vdisk/backup/createOrmodifyVolumeReplicationTask",params,onSuccess,onError);
	},	
	listVolumeRelicationTask : function(params,onSuccess,onError){
		this.callApi("/instance/vdisk/backup/listVolumeRelicationTask",params,onSuccess,onError);
	},
	deleteReplicationTask : function(params,onSuccess,onError){
		this.callApi("/instance/vdisk/backup/deleteReplicationTask",params,onSuccess,onError);
	}
};

com.skyform.service.ObsService4yaxin = {
		callApi : com.skyform.service.callSyncApi,
		describeObsDetail : function(onSuccess,onError){
			var params = {
					"states":"deleted"
//					"resourcePool":resourcePool
			};				
			this.callApi("/instance/obs/describeObsDetail",params,onSuccess,onError);
		},
		createObsVolumes : function(params,onSuccess,onError){
			this.callApi("/instance/obs/createObsVolumes",params,onSuccess,onError);
		},	
		getObsUser : function(resourcePool,onSuccess,onError){
			var params = {
					"resourcePool":resourcePool				
			};							
			this.callApi("/instance/obs/getObsUser",params,onSuccess,onError);
		},
		rollbackBucketFromBackup : function(params,onSuccess,onError){
			this.callApi("/instance/obs/backup/rollbackBucketFromBackup",params,onSuccess,onError);
		},
		deleteReplicationTask : function(params,onSuccess,onError){
			this.callApi("/instance/obs/backup/deleteReplicationTask",params,onSuccess,onError);
		},
		deleteObsVolumes:function(params,onSuccess,onError){
			this.callApi("/instance/obs/deleteObsVolumes",params,onSuccess,onError);
		}
};

com.skyform.service.NasService4yaxin = {
		callSyncApi : com.skyform.service.callSyncApi,
		callApi : com.skyform.service.callApi,
		save : function(nas,onSuccess,onError){
			this.callApi("/instance/nas/createNasVolumes",nas,onSuccess,onError);
		},
		saveNas : function(nas,onSuccess,onError){
			this.callSyncApi("/instance/nas/createNasVolumesForTask",nas,onSuccess,onError);
		},
		listAll : function(ownUserId,states,onSuccess,onError){
			var params = {
					"ownUserId":ownUserId,
					"states":states				
			};				
			this.callApi("/instance/nas/describeNasVolumes",params,onSuccess,onError);
		},
		queryNas : function(ownUserId,states,resourcePool,onSuccess,onError){
			var params = {
					"ownUserId":ownUserId,
					"states":states				
			};				
			this.callApi("/instance/nas/describeNasVolumes?SRC_RES_POOL="+resourcePool,params,onSuccess,onError);
		},
		queryNasName : function(ownUserId,states,resourcePool,onSuccess,onError){
			var params = {
					"ownUserId":ownUserId,
					"states":states	,
					"srcpool":resourcePool
			};				
			this.callSyncApi("/instance/nas/describeNasVolumes",params,onSuccess,onError);
		},
		update : function(nas,onSuccess,onError){
			this.callApi("/instance/nas/modifyNasVolumeAttributes",nas,onSuccess,onError);
		},
		empowerForNas : function(params,onSuccess,onError){			
			this.callApi("/instance/nas/empowerForNas",params,onSuccess,onError);
		},
		createEmpowerUser : function(params,onSuccess,onError){			
			this.callApi("/instance/nas/createEmpowerUser",params,onSuccess,onError);
		},
		descripeEmpowerNas : function(params,onSuccess,onError){		
			com.skyform.service.callSyncApi4yaxin("/instance/nas/descripeEmpowerNas", params, onSuccess, 

onError);
//			this.callApi("/instance/nas/descripeEmpowerNas",params,onSuccess,onError);
		},
		resetPassword : function(params,onSuccess,onError){			
			this.callApi("/instance/nas/resetUserPassword",params,onSuccess,onError);
		},
		destroy : function(params,onSuccess,onError){			
			this.callApi("/instance/nas/deleteNasVolumes",{"ids" : params},onSuccess,onError);
		},
		queryS3User : function(onSuccess,onError){		
			com.skyform.service.callSyncApi4yaxin("/instance/nas/queryS3User",{},onSuccess,onError);
//			this.callApi("/instance/nas/queryS3User",{},onSuccess,onError);
		},
		getDomainForNas : function(onSuccess,onError){
			this.callApi("/instance/commquery/getDomainNameByPool",{"subsType":"nas"},onSuccess,onError);
		}
};

com.skyform.service.ObsService = {
	callSyncApiPa : com.skyform.service.callSyncApiPara,
	callSyncApi : com.skyform.service.callSyncApi,
	call : com.skyform.service.call,
	listBucket : function(params,onSuccess,onError){
		this.call("/pr/obs/listBucket",params,onSuccess,onError);
	},
	listBucketResourcePool : function(params,onSuccess,onError){
		this.call("/pr/obs/listBucketResorcePool",params,onSuccess,onError);
	},
	listBucketResourcePoolSyn : function(params,onSuccess,onError){
		this.callSyncApiPa("/pr/obs/listBucketResorcePool",params,onSuccess,onError);
	},
	createBucket : function(params,onSuccess,onError){
		this.call("/pr/obs/createBucket",params,onSuccess,onError);
	},
	createBucketSet : function(params,onSuccess,onError){
		this.callSyncApiPa("/pr/obs/createBucket",params,onSuccess,onError);
	},
	deleteBucket: function(params,onSuccess,onError){
		this.call("/pr/obs/deleteBucket",params,onSuccess,onError);
	},	
	setAcl4Bucket: function(params,onSuccess,onError){
		this.call("/pr/obs/setAcl4bucket",params,onSuccess,onError);
	},
	getBucketAcl: function(params,onSuccess,onError){
		this.call("/pr/obs/getBucketAcl",params,onSuccess,onError);
	},
	listObjects : function(params,onSuccess,onError){
		this.call("/pr/obs/listObject",params,onSuccess,onError);
	},
//	uploadObject : function(onSuccess,onError){
//		this.call("/pr/obs/putObject",null,onSuccess,onError);
//	},
	getObject : function(bucketName,objectName,onSuccess,onError){
		var params = {
				"bucketName" : bucketName,
				"objectName" : objectName
		};		
		this.call("/pr/obs/getObject",params,onSuccess,onError);
	},
	viewObject : function(bucketName,objectName,onSuccess,onError){
		var params = {
				"bucketName" : bucketName,
				"objectName" : objectName
		};		
		this.call("/pr/obs/viewObject",params,onSuccess,onError);
	},
	getPercent4object : function(bucketName,objectName,onSuccess,onError){
		var params = {
				"bucketName" : bucketName,
				"objectName" : objectName
		};		
		this.call("/pr/obs/getObjectPercent",params,onSuccess,onError);
	},
	abortObject : function(onSuccess,onError){
		this.call("/pr/obs/abortObject",null,onSuccess,onError);
	},
	createFolder : function(params,onSuccess,onError){
//		var params = {
//				"bucketName" : bucketName,
//				"objectName" : objectName,
//				"folderName" : folderName
//		};
		this.call("/pr/obs/createFolder",params,onSuccess,onError);
	},
	deleteObject: function(params,onSuccess,onError){
//		var params = {
//				"bucketName" : bucketName,
//				"objectKeys" : objectKeys
//		};
		this.call("/pr/obs/deleteObject",params,onSuccess,onError);
	},
	copyObject : function(params,onSuccess,onError){
		this.call("/pr/obs/copyObject",params,onSuccess,onError);
	},
	moveObject : function(params,onSuccess,onError){
		this.call("/pr/obs/moveObject",params,onSuccess,onError);
	},
	setAcl4object : function(params,onSuccess,onError){
//		var params = {
//				"bucketName" : bucketName,
//				"objectName" : objectName,
//				"granteeAndPermis" : granteeAndPermis
////				"grantee" : grantee,
////				"permissions" : permissions
//		};
		this.call("/pr/obs/setAcl4object",params,onSuccess,onError);
	},
	addMetadata4object : function(params,onSuccess,onError){
//		var params = {
//				"bucketName" : bucketName,
//				"objectName" : objectName,
//				"keyAndValues" : keyAndValues
//		};
		this.call("/pr/obs/addMetadata4object",params,onSuccess,onError);		
	},
	getObjectAcl: function(params,onSuccess,onError){
//		var params = {
//				"bucketName" : bucketName,
//				"objectName" : objectName
//		};
		this.call("/pr/obs/getObjectAcl",params,onSuccess,onError);
	},
	getMetadata4object : function(params,onSuccess,onError){
//		var params = {
//				"bucketName" : bucketName,
//				"objectName" : objectName
//		};
		this.call("/pr/obs/getMetadata4object",params,onSuccess,onError);
	}
	
};

/**
 * 配额相关的service
 */
com.skyform.service.QuotaService = {
	callApi : com.skyform.service.callApi,
	getQuotaByType : function(type,onSuccess,onError){
		this.callApi("/quota/" + type,{},onSuccess,onError);
	},
	listAllQuotas : function(onSuccess,onError) {
		this.callApi("/quota/quotas",{},onSuccess,onError);
	}	
};
/**
 * T_SCS_PUBLIC_IP IP余额
 */
com.skyform.service.Eip = {
	callApi : com.skyform.service.callApi,
	queryEnoughIP : function(onSuccess,onError){
		com.skyform.service.callSyncApi("/instance/eip/queryFreeIp",{},onSuccess,onError);
	},
	queryEnoughIPdedLine :function(params,onSuccess,onError){
		com.skyform.service.callSyncApi("/instance/eip/queryFreeIp",params,onSuccess,onError);
	}
};

/**
 * service同名校验
 */
com.skyform.service.PortalInstanceService = {
	callApi : com.skyform.service.callApi,
	checkDuplcatedName : function(name,code,onSuccess,onError){
		this.callApi("/instance/duplcatedName",

{"instanceName":name,"instanceCode":code,"verifyFlag":"0"},onSuccess,onError);
	},
	queryProtocol : function(onSuccess,onError){
		this.callApi("/instance/lb/queryProtocol",{},onSuccess,onError);
	},
	queryLoopType : function(onSuccess,onError){
		this.callApi("/instance/lb/queryLoopType",{},onSuccess,onError);
	},
	querySameNameExist : function(serviceType,name,onSuccess,onError){
		var params = {
			"serviceType" :  CommonEnum.serviceType[serviceType],
			"name" : name,
			"verifyFlag":"0"
		}//commquery
		this.callApi("/instance/pm/querySamecustSubsnameExist",params,onSuccess,onError);
	},modprodprty : function(target,subsId,muprty,onSuccess,onError){
		var param = {
				"target" : target,
				"subsId" : subsId,
				"muprty" : muprty
		};
		var paramStr = param ;
		var params = {
				"jstr"   : paramStr
		};
		 
		this.callApi("/trade/modprodprty",params,onSuccess,onError);
	}
};

/**
 * 日志相关的service
 */
com.skyform.service.LogService = {
	callApi : com.skyform.service.callApi,
	getLogByInstanceId : function(instanceType,instanceId,onSuccess,onError){
		var condition = {"instanceType" : instanceType,"showLevel":1}
		condition.instanceId = instanceId;
		this.callApi("/log/logs",condition,onSuccess,onError);
	},
	getVmLogByVmId : function(instanceId,onSuccess,onError){
		this.getLogByInstanceId("vm", instanceId,onSuccess,onError);
	},
	getRouteLogByRouteId : function(instanceId,onSuccess,onError){
		this.getLogByInstanceId("route", instanceId,onSuccess,onError);
	},
	getNetLogByNetId : function(instanceId,onSuccess,onError){
		this.getLogByInstanceId("net", instanceId,onSuccess,onError);
	},
	getIpLogByIpId : function(instanceId,onSuccess,onError){
		this.getLogByInstanceId("ip", instanceId,onSuccess,onError);
	},
	getVdiskLogByNetId : function(instanceId,onSuccess,onError){
		this.getLogByInstanceId("vdisk", instanceId,onSuccess,onError);
	},
	getObsLogByNetId : function(instanceId,onSuccess,onError){
		this.getLogByInstanceId("obs", instanceId,onSuccess,onError);
	},
	getLbLogByLbId : function(instanceId,onSuccess,onError){
		this.getLogByInstanceId("lb", instanceId,onSuccess,onError);
	},
	describeLogsInfo : function(subscriptionId,onSuccess,onError){
		var params = {
				"subscriptionId" : ""+subscriptionId
		};		
		this.callApi("/user/describeLogsInfo",params,onSuccess,onError);		
	},
	describeLogsUIInfo : function(instanceId,target){
//		$("#opt_logs").empty();
		this.describeLogsInfo(instanceId,function(logs,obj){
			var targetObj = $("#opt_logs");
			if(target){
				targetObj = $("#"+target);
			}
			targetObj.empty();
			$(logs).each(function(i,v){
				var desc = "";
				if(v.description){
					if(v.description != ""){
						desc = "("+v.description+")";
					}						
				}
				var _name = "";
				if(v.subscription_name){
					_name = v.subscription_name;
				}
				$("<li class='detail-item'><span>" + v.createTime+ "  "+_name+"  " + v.controle + desc+ 

"</span></li>").appendTo(targetObj);
			});
		},function onError(msg){
		});		
	}
};
/**
 * 获取实例状态service
 */
com.skyform.service.StateService = {
		vmState : {
			//"running" : "<div id=\"stateIcon\" ><a class=\"btn btn-large btn-danger\" data-content=\"And here's some amazing content. It's very engaging. right?\" title=\"\" data-toggle=\"popover\" href=\"#\" data-original-title=\"A Title\"><i class=\"icon-circle orange fs20\"></i></a></div>"
			//"running" : "<a title=\"运行中\" data-content=\"state desc.\" data-placement=\"right\" data-toggle=\"popover\" href=\"#\" data-original-title=\"Popover on right\"><i class=\"icon-circle orange fs20\"></i></a>"
			"restting"        : "<span href=\"#\" data-toggle=\"popover\" title=\"正在格式化\"     class=\"state-copper\"><i class=\"icon-spinner icon-spin blue mr5\"></i>正在格式化</span>"  //
			,"reset error"    : "<a href=\"http://wpa.qq.com/msgrd?v=3&uin=4000111000&site=qq&menu=yes\" target=\"_blank\" data-toggle=\"popover\" title=\"重置失败（点击获得QQ客户客户帮助）\"       class=\"state-red\"><i class=\"icon-remove-sign red mr5\"></i>"+ Dict.val("common_ins_state_reset_failed")+"</a>"    //<i class=\"icon-remove-sign red mr5\"></i>
			,"running"        : "<span href=\"javascript:void(0);\" id=\"vm_state_running\" data-placement=\"right\" title=\"运行中\" data-original-title=\"运行中\" data-content=\"云主机状态：运行中。\" class=\"state-green\"><i class=\"icon-circle green mr5\"></i>"+ Dict.val("common_ins_state_operation")+"</span>"  //
			,"copying"        : "<span href=\"#\" data-toggle=\"popover\" title=\"灾备中\"     class=\"state-copper\"><i class=\"icon-spinner icon-spin blue mr5\"></i>灾备中</span>"  //
			,"deploy error"  : "<a href=\"http://wpa.qq.com/msgrd?v=3&uin=4000111000&site=qq&menu=yes\" target=\"_blank\" data-toggle=\"popover\" title=\"创建失败（点击获得QQ客户客户帮助）\"       class=\"state-red\"><i class=\"icon-remove-sign red mr5\"></i>"+ Dict.val("common_ins_state_error")+"</a>"    //<i class=\"icon-remove-sign red mr5\"></i>
			,"start error"   : "<a href=\"http://wpa.qq.com/msgrd?v=3&uin=4000111000&site=qq&menu=yes\" target=\"_blank\" data-toggle=\"popover\" title=\"启动云主机错误（点击获得QQ客户客户帮助）\" class=\"state-red\"><i class=\"icon-warning-sign orange mr5\"></i>"+ Dict.val("common_ins_state_operation_error")+"</a>" //<i class=\"icon-warning-sign orange mr5\">"+ Dict.val("common_ins_state_operation_error")+"</i>
			,"stop error"    : "<a href=\"http://wpa.qq.com/msgrd?v=3&uin=4000111000&site=qq&menu=yes\" target=\"_blank\" data-toggle=\"popover\" title=\"停止云主机错误（点击获得QQ客户客户帮助）\" class=\"state-red\"><i class=\"icon-warning-sign orange mr5\"></i>"+ Dict.val("common_ins_state_operation_error")+"</a>" //<i class=\"icon-warning-sign orange mr5\">"+ Dict.val("common_ins_state_operation_error")+"</i> 
			,"reboot error"  : "<a href=\"http://wpa.qq.com/msgrd?v=3&uin=4000111000&site=qq&menu=yes\" target=\"_blank\" data-toggle=\"popover\" title=\"重启云主机错误（点击获得QQ客户客户帮助）\" class=\"state-red\"><i class=\"icon-warning-sign orange mr5\"></i>"+ Dict.val("common_ins_state_operation_error")+"</a>" //<i class=\"icon-warning-sign orange mr5\">"+ Dict.val("common_ins_state_operation_error")+"</i> 
			,"destory error" : "<a href=\"http://wpa.qq.com/msgrd?v=3&uin=4000111000&site=qq&menu=yes\" target=\"_blank\" data-toggle=\"popover\" title=\"销毁云主机错误（点击获得QQ客户客户帮助）\" class=\"state-red\"><i class=\"icon-warning-sign orange mr5\"></i>"+ Dict.val("common_ins_state_operation_error")+"</a>" //<i class=\"icon-warning-sign orange mr5\">"+ Dict.val("common_ins_state_operation_error")+"</i>
			,"pause error"   : "<a href=\"http://wpa.qq.com/msgrd?v=3&uin=4000111000&site=qq&menu=yes\" target=\"_blank\" data-toggle=\"popover\" title=\"暂停云主机错误（点击获得QQ客户客户帮助）\" class=\"state-red\"><i class=\"icon-warning-sign orange mr5\"></i>"+ Dict.val("common_ins_state_operation_error")+"</a>" //<i class=\"icon-warning-sign orange mr5\">"+ Dict.val("common_ins_state_operation_error")+"</i>
			,"unpause error" : "<a href=\"http://wpa.qq.com/msgrd?v=3&uin=4000111000&site=qq&menu=yes\" target=\"_blank\" data-toggle=\"popover\" title=\"取消云主机错误（点击获得QQ客户客户帮助）\" class=\"state-red\"><i class=\"icon-warning-sign orange mr5\"></i>"+ Dict.val("common_ins_state_operation_error")+"</a>" //<i class=\"icon-warning-sign orange mr5\">"+ Dict.val("common_ins_state_operation_error")+"</i>
			,"suspend error" : "<a href=\"http://wpa.qq.com/msgrd?v=3&uin=4000111000&site=qq&menu=yes\" target=\"_blank\" data-toggle=\"popover\" title=\"挂起云主机错误（点击获得QQ客户客户帮助）\" class=\"state-red\"><i class=\"icon-warning-sign orange mr5\"></i>"+ Dict.val("common_ins_state_operation_error")+"</a>" //<i class=\"icon-warning-sign orange mr5\">"+ Dict.val("common_ins_state_operation_error")+"</i>
			,"resume error"  : "<a href=\"http://wpa.qq.com/msgrd?v=3&uin=4000111000&site=qq&menu=yes\" target=\"_blank\" data-toggle=\"popover\" title=\"恢复云主机错误（点击获得QQ客户客户帮助）\" class=\"state-red\"><i class=\"icon-warning-sign orange mr5\"></i>"+ Dict.val("common_ins_state_operation_error")+"</a>" //<i class=\"icon-warning-sign orange mr5\">"+ Dict.val("common_ins_state_operation_error")+"</i>
			,"migrate error" : "<a href=\"http://wpa.qq.com/msgrd?v=3&uin=4000111000&site=qq&menu=yes\" target=\"_blank\" data-toggle=\"popover\" title=\"迁移云主机错误（点击获得QQ客户客户帮助）\" class=\"state-red\"><i class=\"icon-warning-sign orange mr5\"></i>"+ Dict.val("common_ins_state_operation_error")+"</a>" //<i class=\"icon-warning-sign orange mr5\">"+ Dict.val("common_ins_state_operation_error")+"</i>
			,"resetpassword error" : "<span href=\"#\" data-toggle=\"popover\" title=\"重置云主机密码错误\" class=\"state-red\"><i class=\"icon-warning-sign orange mr5\"></i>"+ Dict.val("common_ins_state_operation_error")+"</span>" //<i class=\"icon-warning-sign orange mr5\"></i>
			,"OFF"        : "<span href=\"#\" data-toggle=\"popover\" title=\"已关闭\"       class=\"state-gray\"><i class=\"icon-off darkgray mr5\"></i>"+ Dict.val("")+"已关闭</span>" //<i class=\"icon-off darkgray mr5\">已关机</i>	
			,"ON"        : "<span href=\"javascript:void(0);\" id=\"vm_state_running\" data-placement=\"right\" title=\"已开启\" data-original-title=\"已开启\" data-content=\"已开启\" class=\"state-green\"><i class=\"icon-circle green mr5\"></i>"+ Dict.val("common_ins_state_turned_on")+"</span>"  //	
			,"pwdresetting"	:"<span href=\"#\" data-toggle=\"popover\" title=\"正在重置\"     class=\"state-copper\"><i class=\"icon-spinner icon-spin blue mr5\"></i>"+ Dict.val("common_ins_state_resetting")+"</span>"  //
		},
		vdiskState : {
			"using" : "<span href=\"#\" data-toggle=\"popover\" title=\"已挂载\" class=\"state-green\"><i class=\"icon-ok green mr5\"></i>"+ Dict.val("common_ins_state_using")+"</span>"   //<i class=\"icon-ok green mr5\">已挂载</i>
		},
		ipState : {
			"using" : "<span href=\"#\" data-toggle=\"popover\" title=\"已绑定\" class=\"state-green\"><i class=\"icon-ok green mr5\"></i>"+ Dict.val("common_ins_state_binded")+"</span>"  //<i class=\"icon-ok green mr5\">已绑定</i>
		},
		imageState:{
			"running"   : "<span href=\"#\" data-toggle=\"popover\" title=\"创建镜像成功\" class=\"state-green\"><i class=\"icon-circle green mr5\"></i>"+ Dict.val("common_ins_state_running")+"</span>" //<i class=\"icon-circle green mr5\">创建成功</i>
				,"opening"    : "<span href=\"#\" data-toggle=\"popover\" title=\"创建镜像中\" class=\"state-blue\"><i class=\"icon-spinner icon-spin blue mr5\"></i>"+ Dict.val("common_ins_state_creating")+"</span>" //<i class=\"icon-spinner icon-spin blue mr5\">创建中</i> 
				,"create error"  : "<span href=\"#\" data-toggle=\"popover\" title=\"创建镜像失败错误\" class=\"state-red\"><i class=\"icon-warning-sign orange mr5\"></i>"+ Dict.val("common_ins_state_operation_error")+"</span>" //<i class=\"icon-warning-sign orange mr5\">"+ Dict.val("common_ins_state_operation_error")+"</i> 
				,"deleting" : "<span href=\"#\" data-toggle=\"popover\" title=\"删除镜像中\" class=\"state-copper\"><i class=\"icon-spinner icon-spin blue mr5\"></i>"+ Dict.val("common_ins_state_deleting")+"</span>" //<i class=\"icon-spinner icon-spin blue mr5\">删除中</i>
				,"delete error"   : "<span href=\"#\" data-toggle=\"popover\" title=\"删除镜像错误\" class=\"state-red\"><i class=\"icon-spinner icon-spin blue mr5\"></i>"+ Dict.val("common_ins_state_deleting")+"</span>" //<i class=\"icon-warning-sign orange mr5\">"+ Dict.val("common_ins_state_operation_error")+"</i>
			    ,"update error"   : "<span href=\"#\" data-toggle=\"popover\" title=\"修改镜像错误\" class=\"state-red\"><i class=\"icon-warning-sign orange mr5\"></i>"+ Dict.val("common_ins_state_operation_error")+"</span>" //<i class=\"icon-warning-sign orange mr5\">"+ Dict.val("common_ins_state_operation_error")+"</i>
			    ,"remove error"  : "<span href=\"#\" data-toggle=\"popover\" title=\"删除镜像错误\" class=\"state-red\"><i class=\"icon-warning-sign orange mr5\"></i>"+ Dict.val("common_ins_state_operation_error")+"</span>"//<i class=\"icon-warning-sign orange mr5\">"+ Dict.val("common_ins_state_operation_error")+"</i>
		},
		snapState:{
			"running"   : "<span href=\"#\" data-toggle=\"popover\" title=\"创建快照成功\" class=\"state-green\"><i class=\"icon-circle green mr5\"></i>"+ Dict.val("common_ins_state_running")+"</span>" //<i class=\"icon-circle green mr5\">创建成功</i>
				,"opening"    : "<span href=\"#\" data-toggle=\"popover\" title=\"创建快照中\" class=\"state-blue\"><i class=\"icon-spinner icon-spin blue mr5\"></i>"+ Dict.val("common_ins_state_creating")+"</span>" //<i class=\"icon-spinner icon-spin blue mr5\">创建中</i> 
				,"create error"  : "<span href=\"#\" data-toggle=\"popover\" title=\"创建快照失败错误\" class=\"state-red\"><i class=\"icon-warning-sign orange mr5\"></i>"+ Dict.val("common_ins_state_operation_error")+"</span>" //<i class=\"icon-warning-sign orange mr5\">"+ Dict.val("common_ins_state_operation_error")+"</i> 
				,"deleting" : "<span href=\"#\" data-toggle=\"popover\" title=\"删除快照中\" class=\"state-copper\"><i class=\"icon-spinner icon-spin blue mr5\"></i>"+ Dict.val("common_ins_state_deleting")+"</span>" //<i class=\"icon-spinner icon-spin blue mr5\">删除中</i>
				,"delete error"   : "<span href=\"#\" data-toggle=\"popover\" title=\"删除快照错误\" class=\"state-red\"><i class=\"icon-warning-sign orange mr5\"></i>"+ Dict.val("common_ins_state_operation_error")+"</span>" //<i class=\"icon-warning-sign orange mr5\">"+ Dict.val("common_ins_state_operation_error")+"</i>
				,"deleted"   : "<span href=\"#\" data-toggle=\"popover\" title=\"已删除镜像\" class=\"state-gray\"><i class=\"icon-reply darkgray mr5\"></i>"+ Dict.val("common_ins_state_deleted")+"</span>" //<i class=\"icon-reply darkgray mr5\">已删除</i>
		},
		monitorState:{//监控规则
			    "running"   : "<span href=\"#\" data-toggle=\"popover\" title=\"正在运行\" class=\"state-green\"><i class=\"icon-circle green mr5\"></i>"+ Dict.val("common_ins_state_running")+"</span>" //<i class=\"icon-circle green mr5\">创建成功</i>
				,"opening"    : "<span href=\"#\" data-toggle=\"popover\" title=\"正在开通\" class=\"state-blue\"><i class=\"icon-spinner icon-spin blue mr5\"></i>"+ Dict.val("common_ins_state_opening")+"</span>" //<i class=\"icon-spinner icon-spin blue mr5\">创建中</i> 
				,"create error"  : "<span href=\"#\" data-toggle=\"popover\" title=\"创建失败\" class=\"state-red\"><i class=\"icon-warning-sign orange mr5\"></i>"+ Dict.val("common_ins_state_error")+"</span>" //<i class=\"icon-warning-sign orange mr5\">"+ Dict.val("common_ins_state_operation_error")+"</i>
				,"delete error"   : "<span href=\"#\" data-toggle=\"popover\" title=\"销毁失败\" class=\"state-red\"><i class=\"icon-spinner icon-spin blue mr5\"></i>"+ Dict.val("common_ins_state_delete_fail")+"</span>" //<i class=\"icon-warning-sign orange mr5\">"+ Dict.val("common_ins_state_operation_error")+"</i>
				,"update error"   : "<span href=\"#\" data-toggle=\"popover\" title=\"修改失败\" class=\"state-red\"><i class=\"icon-warning-sign orange mr5\"></i>"+ Dict.val("common_ins_state_modify_fail")+"</span>" //<i class=\"icon-warning-sign orange mr5\">"+ Dict.val("common_ins_state_operation_error")+"</i>	
				,"bind error"    : "<span href=\"#\" data-toggle=\"popover\" title=\"绑定失败\" class=\"state-red\"><i class=\"icon-warning-sign orange mr5\"></i>"+ Dict.val("common_ins_state_bind_fails")+"</span>"
			    ,"unbind error"  : "<span href=\"#\" data-toggle=\"popover\" title=\"解绑失败\" class=\"state-red\"><i class=\"icon-warning-sign orange mr5\"></i>"+ Dict.val("common_unbund_failure")+"</span>"
		},
		vScanState:{//漏洞扫描
			"complete"   : "<span href=\"#\" data-toggle=\"popover\" title=\"已完成\" class=\"state-green\"><i class=\"icon-circle green mr5\"></i>"+ Dict.val("common_completed")+"</span>" //<i class=\"icon-circle green mr5\">创建成功</i>
			,"scanning"    : "<span href=\"#\" data-toggle=\"popover\" title=\"扫描中\" class=\"state-blue\"><i class=\"icon-spinner icon-spin blue mr5\"></i>"+ Dict.val("common_scan")+"</span>" //<i class=\"icon-spinner icon-spin blue mr5\">创建中</i> 
		},
		commonState :{
				"deleted"        : "<span href=\"#\" data-toggle=\"popover\" title=\"已销毁\"       class=\"state-gray\"><i class=\"icon-reply darkgray mr5\"></i>"+ Dict.val("common_ins_state_deleted")+"</span>" //<i class=\"icon-reply darkgray mr5\">已销毁</i>
				,"running"       : "<span href=\"#\" data-toggle=\"popover\" title=\"就绪\"         class=\"state-green\"><i class=\"icon-circle green mr5\"></i>"+ Dict.val("common_ins_state_running")+"</span>"  //<i class=\"icon-circle green mr5\">就绪</i>
				,"limiting"      : "<span href=\"#\" data-toggle=\"popover\" title=\"限速中\"         class=\"state-green\"><i class=\"icon-circle green mr5\"></i>"+ Dict.val("common_ins_state_speed_limit")+"</span>"  //<i class=\"icon-circle green mr5\">限速中</i>
				,"limit error"   : "<span href=\"#\" data-toggle=\"popover\" title=\"限速不成功\"         class=\"state-green\"><i class=\"icon-circle green mr5\"></i>"+ Dict.val("common_ins_state_unsuccessful")+"</span>"  //<i class=\"icon-circle green mr5\">限速不成功</i>
				,"using"         : "<span href=\"#\" data-toggle=\"popover\" title=\"已使用\"       class=\"state-green\"><i class=\"icon-ok green mr5\"></i>"+ Dict.val("common_ins_state_used")+"</span>"  //<i class=\"icon-ok green mr5\">已使用</i>
				,"closed"        : "<span href=\"#\" data-toggle=\"popover\" title=\"已关机\"       class=\"state-gray\"><i class=\"icon-off darkgray mr5\"></i>"+ Dict.val("common_ins_state_close")+"</span>" //<i class=\"icon-off darkgray mr5\">已关机</i>
				,"hanged"        : "<span href=\"#\" data-toggle=\"popover\" title=\"已挂起\"     class=\"state-green\"><i class=\"icon-ok green mr5\"></i>"+ Dict.val("common_ins_state_suspended")+"</span>"  //<i class=\"icon-spinner icon-spin blue mr5\">已挂起</i>
				,"opening"       : "<span href=\"#\" data-toggle=\"popover\" title=\"正在开通\"     class=\"state-blue\"><i class=\"icon-spinner icon-spin blue mr5\"></i>"+ Dict.val("common_ins_state_opening")+"</span>"  //<i class=\"icon-spinner icon-spin blue mr5\">正在开通</i>
				,"changing"      : "<span href=\"#\" data-toggle=\"popover\" title=\"正在变更\"     class=\"state-blue\"><i class=\"icon-spinner icon-spin blue mr5\"></i>"+ Dict.val("common_ins_state_changing")+"</span>"  //<i class=\"icon-spinner icon-spin blue mr5\">正在变更</i>
				,"deleting"      : "<span href=\"#\" data-toggle=\"popover\" title=\"正在销毁\"     class=\"state-copper\"><i class=\"icon-spinner icon-spin blue mr5\"></i>"+ Dict.val("common_ins_state_deleting")+"</span>"  //<i class=\"icon-spinner icon-spin blue mr5\">正在销毁</i>
				,"attaching"     : "<span href=\"#\" data-toggle=\"popover\" title=\"正在挂载\"     class=\"state-blue\"><i class=\"icon-spinner icon-spin blue mr5\"></i>"+ Dict.val("common_ins_state_attaching")+"</span>" //<i class=\"icon-spinner icon-spin blue mr5\">正在挂载</i>
				,"unattaching"   : "<span href=\"#\" data-toggle=\"popover\" title=\"正在卸载\"     class=\"state-copper\"><i class=\"icon-spinner icon-spin blue mr5\"></i>"+ Dict.val("common_ins_state_unattaching")+"</span>"  //<i class=\"icon-spinner icon-spin blue mr5\">正在卸载</i>
				,"stopping"      : "<span href=\"#\" data-toggle=\"popover\" title=\"正在关机\"     class=\"state-copper\"><i class=\"icon-spinner icon-spin blue mr5\"></i>"+ Dict.val("common_ins_state_shutting_down")+"</span>"  //<i class=\"icon-spinner icon-spin blue mr5\">正在关机</i>
				,"starting"      : "<span href=\"#\" data-toggle=\"popover\" title=\"正在开机\"     class=\"state-blue\"><i class=\"icon-spinner icon-spin blue mr5\"></i>"+ Dict.val("common_ins_state_booting")+"</span>"  //<i class=\"icon-spinner icon-spin blue mr5\">正在开机</i>
				,"restarting"    : "<span href=\"#\" data-toggle=\"popover\" title=\"正在重启\"     class=\"state-blue\"><i class=\"icon-spinner icon-spin blue mr5\"></i>"+ Dict.val("common_ins_state_restarting")+"</span>"  //<i class=\"icon-spinner icon-spin blue mr5\">正在重启</i>
				,"resetting"     : "<span href=\"#\" data-toggle=\"popover\" title=\"正在重启\"     class=\"state-blue\"><i class=\"icon-spinner icon-spin blue mr5\"></i>"+ Dict.val("common_ins_state_restarting")+"</span>"  //<i class=\"icon-spinner icon-spin blue mr5\">正在重启</i>
				,"binding"       : "<span href=\"#\" data-toggle=\"popover\" title=\"正在绑定\"     class=\"state-blue\"><i class=\"icon-spinner icon-spin blue mr5\"></i>"+ Dict.val("common_ins_state_binding")+"</span>"  //<i class=\"icon-spinner icon-spin blue mr5\">正在绑定</i>
				,"coping"        : "<span href=\"#\" data-toggle=\"popover\" title=\"快照创建中\"     class=\"state-blue\"><i class=\"icon-spinner icon-spin blue mr5\"></i>"+ Dict.val("common_ins_state_snapshot_creation")+"</span>"  //<i class=\"icon-spinner icon-spin blue mr5\">快照创建中</i>
				,"recovering"    : "<span href=\"#\" data-toggle=\"popover\" title=\"恢复中\"     class=\"state-blue\"><i class=\"icon-spinner icon-spin blue mr5\"></i>"+ Dict.val("common_ins_state_restoration")+"</span>"  //<i class=\"icon-spinner icon-spin blue mr5\">恢复中</i>
				,"unbinding"     : "<span href=\"#\" data-toggle=\"popover\" title=\"正在解绑\"     class=\"state-copper\"><i class=\"icon-spinner icon-spin blue mr5\"></i>"+ Dict.val("common_ins_state_unbinding")+"</span>"  //<i class=\"icon-spinner icon-spin blue mr5\">正在解绑</i>
				,"backuping"     : "<span href=\"#\" data-toggle=\"popover\" title=\"正在创建快照\" class=\"state-blue\"><i class=\"icon-spinner icon-spin blue mr5\"></i>"+ Dict.val("common_ins_state_create_snapshot")+"</span>"  //<i class=\"icon-spinner icon-spin blue mr5\">正在创建快照</i>
				,"restoreing"    : "<span href=\"#\" data-toggle=\"popover\" title=\"正在恢复快照\" class=\"state-blue\"><i class=\"icon-spinner icon-spin blue mr5\"></i>"+ Dict.val("common_ins_state_resuming_snapshot")+"</span>"  //<i class=\"icon-spinner icon-spin blue mr5\">正在恢复快照</i>
				,"snapshotDeling": "<span href=\"#\" data-toggle=\"popover\" title=\"正在删除快照\" class=\"state-copper\"><i class=\"icon-spinner icon-spin blue mr5\"></i>"+ Dict.val("common_ins_state_deleting_snapshot")+"</span>"  //<i class=\"icon-spinner icon-spin blue mr5\">正在删除快照</i>
				,"error"         : "<a href=\"http://wpa.qq.com/msgrd?v=3&uin=4000111000&site=qq&menu=yes\" target=\"_blank\" data-toggle=\"popover\" title=\"错误（点击获得QQ客户帮助）\"         class=\"state-red\"><i class=\"icon-warning-sign red mr5\"></i>"+ Dict.val("common_error")+"</a>"  //<i class=\"icon-warning-sign red mr5\">错误</i>
				,"create error"  : "<a href=\"http://wpa.qq.com/msgrd?v=3&uin=4000111000&site=qq&menu=yes\" target=\"_blank\" data-toggle=\"popover\" title=\"创建资源错误（点击获得QQ客户帮助）\" class=\"state-red\"><i class=\"icon-remove-sign red mr5\"></i>"+ Dict.val("common_ins_state_error")+"</a>"  //<i class=\"icon-remove-sign red mr5\">创建失败</i>
				,"delete error"  : "<a href=\"http://wpa.qq.com/msgrd?v=3&uin=4000111000&site=qq&menu=yes\" target=\"_blank\" data-toggle=\"popover\" title=\"删除资源错误（点击获得QQ客户帮助）\" class=\"state-red\"><i class=\"icon-warning-sign orange mr5\"></i>"+ Dict.val("common_ins_state_operation_error")+"</a>"
				,"update error"  : "<a href=\"http://wpa.qq.com/msgrd?v=3&uin=4000111000&site=qq&menu=yes\" target=\"_blank\" data-toggle=\"popover\" title=\"变更资源错误（点击获得QQ客户帮助）\" class=\"state-red\"><i class=\"icon-warning-sign orange mr5\"></i>"+ Dict.val("common_ins_state_operation_error")+"</a>"
				,"attach error"  : "<a href=\"http://wpa.qq.com/msgrd?v=3&uin=4000111000&site=qq&menu=yes\" target=\"_blank\" data-toggle=\"popover\" title=\"挂载资源错误（点击获得QQ客户帮助）\" class=\"state-red\"><i class=\"icon-warning-sign orange mr5\"></i>"+ Dict.val("common_ins_state_operation_error")+"</a>"
				,"detach error"  : "<a href=\"http://wpa.qq.com/msgrd?v=3&uin=4000111000&site=qq&menu=yes\" target=\"_blank\" data-toggle=\"popover\" title=\"解挂资源错误（点击获得QQ客户帮助）\" class=\"state-red\"><i class=\"icon-warning-sign orange mr5\"></i>"+ Dict.val("common_ins_state_operation_error")+"</a>"
				,"add error"     : "<a href=\"http://wpa.qq.com/msgrd?v=3&uin=4000111000&site=qq&menu=yes\" target=\"_blank\" data-toggle=\"popover\" title=\"添加资源错误（点击获得QQ客户帮助）\" class=\"state-red\"><i class=\"icon-warning-sign orange mr5\"></i>"+ Dict.val("common_ins_state_operation_error")+"</a>"
				,"remove error"  : "<a href=\"http://wpa.qq.com/msgrd?v=3&uin=4000111000&site=qq&menu=yes\" target=\"_blank\" data-toggle=\"popover\" title=\"移除资源错误（点击获得QQ客户帮助）\" class=\"state-red\"><i class=\"icon-warning-sign orange mr5\"></i>"+ Dict.val("common_ins_state_operation_error")+"</a>"
				,"bind error"    : "<a href=\"http://wpa.qq.com/msgrd?v=3&uin=4000111000&site=qq&menu=yes\" target=\"_blank\" data-toggle=\"popover\" title=\"绑定资源错误（点击获得QQ客户帮助）\" class=\"state-red\"><i class=\"icon-warning-sign orange mr5\"></i>"+ Dict.val("common_ins_state_operation_error")+"</a>"
				,"unbind error"  : "<a href=\"http://wpa.qq.com/msgrd?v=3&uin=4000111000&site=qq&menu=yes\" target=\"_blank\" data-toggle=\"popover\" title=\"解绑资源错误（点击获得QQ客户帮助）\" class=\"state-red\"><i class=\"icon-warning-sign orange mr5\"></i>"+ Dict.val("common_ins_state_operation_error")+"</a>"
				,"apply error"   : "<a href=\"http://wpa.qq.com/msgrd?v=3&uin=4000111000&site=qq&menu=yes\" target=\"_blank\" data-toggle=\"popover\" title=\"应用资源错误（点击获得QQ客户帮助）\" class=\"state-red\"><i class=\"icon-warning-sign orange mr5\"></i>"+ Dict.val("common_ins_state_operation_error")+"</a>"
				,"change error"  : "<a href=\"http://wpa.qq.com/msgrd?v=3&uin=4000111000&site=qq&menu=yes\" target=\"_blank\" data-toggle=\"popover\" title=\"修改资源错误（点击获得QQ客户帮助）\" class=\"state-red\"><i class=\"icon-warning-sign orange mr5\"></i>"+ Dict.val("common_ins_state_operation_error")+"</a>"
		},
		getType : function(type){
			switch(type){
				case 1 : return "vm";
				case 2 : return "vdisk";
				case 3 : return "mc";
				case 4 : return "backup";
				case 5 : return "monitor";
				case 6 : return "lb";
				case 7 : return "fw";
				case 8 : return "bw";
				case 9 : return "ip";
				case 10 : return "pm";
				case 11 : return "obs";
				case 12 : return "ebs";
				case 13 : return "nas";
				case 14 : return "Paas";
				case 16 : return "route";
				case 17 : return "Subnet";
				case 18 : return "virus";
				default : return type;
			}
		},
		getState : function(type,statecode){
			var states = this["" + type + "State"];
			if(states) {
				return states[""+statecode] || this.commonState[""+statecode] || "--";
			} 
			return this.commonState[""+statecode] || "--";
		}
		
}

com.skyform.service.BillService = {
		callSyncApi : com.skyform.service.callSyncApi,
		callApi : com.skyform.service.callApi,
		queryProductPrtyInfo :function(billType,serviceType,onSuccess,onError){
			var serviceType = CommonEnum.serviceType[serviceType];
			this.callSyncApi("/pm/getPmMuPrtyConfigInfoByBillAndServiceType", {"serviceType":serviceType,"billType":Number(billType)}, onSuccess, onError);		
		},
		queryProductPrtyInfo2 :function(onSuccess,onError){
			var serviceType = CommonEnum.serviceType[serviceType];
			this.callSyncApi("/pm/getPmMuPrtyConfigInfoByBillAndServiceType", {"serviceType":1017,"billType":4}, onSuccess, onError);		
		},
		qryPmPrtyConfigInfo :function(productId,onSuccess,onError){
			var serviceType = CommonEnum.serviceType[serviceType];
			this.callSyncApi("/getPmMuPrtyConfigInfoByProdId ", {"productId":productId}, onSuccess, onError);	
		},
		queryProductPrtyInfoOut :function(billType,serviceType,onSuccess,onError){
			var serviceType = CommonEnum.serviceType[serviceType];
			this.callSyncApi("/pm/QueryProductPrtyInfoOut", {"resourcePool":"huhehaote","serviceType":serviceType,"billType":Number(billType)}, onSuccess, onError);		
		},
		tradeSubmit : function(tradeId,onSuccess,onError){
			var params = {
					"tradeId" : tradeId
			};			
			var api = "/trade/Submit";
			//Dcp.biz.apiRequest(api,params || {},function(result){
			Dcp.biz.apiAsyncRequest(api,params || {},function(result){
				$.unblockUI();
				if(result&&result.code ==0) {
					if(onSuccess) {
						onSuccess(result.data);
					}
				}else if (onError) {
					onError(result.msg);
				} 				
			},function(error){
				$.unblockUI();
				if(error && error.status && error.status == 403) {
					window.alert(Dict.val("nas_your_session_has_expired_please_login_again"));
					window.location = CONTEXT_PATH + "/jsp/login.jsp";
				}
				if(onError) {
					onError(Dict.val("wo_for_data_error_please_try_again_later"));
				}
			});
		},
		queryBalance : function(){
			var _balance = 0;
	  		Dcp.biz.apiRequest("/account/queryBalance",{},function(data) {
	        	var state = data.code;
	        	if(state == 0){
	        		// 余额 单位厘
	        		_balance = data.data.balance;       		
	        		// 换算成元
	        		_balance = _balance/1000;       		
	        		// 四舍五入保留两位小数
	        		_balance = Math.round(_balance*Math.pow(10,2))/Math.pow(10,2);  
	        		
				}
	        	else if(state == -1){
	        		alert("用户帐务信息不存在, 请联系管理员");
	        		return;
	        	}
	  		});
			return _balance;
		},
		queryBalance2 : function(fee,tradeId,component,onSuccess,onError){
			var _balance = 0;
			var noCashBalance = 0;
	  		Dcp.biz.apiRequest("/account/queryBalance",{},function(data) {
	        	var state = data.code;
	        	if(state == 0){
	        		// 余额 单位厘
	        		_balance = data.data[0].Balance;       		
	        		// 换算成元
	        		_balance = _balance/1000;
	        		noCashBalance = data.data[0].noCashBalance;
	        		noCashBalance = noCashBalance/1000;
	        		// 四舍五入保留两位小数
	        		var _remain = noCashBalance+_balance-fee;
	        		_remain = Math.round(_remain*Math.pow(10,2))/Math.pow(10,2);
	        		
//	        		_balance = Math.round(_balance*Math.pow(10,2))/Math.pow(10,2);
//	        		noCashBalance = data.data[0].noCashBalance;
//	        		noCashBalance = noCashBalance/1000;
//	        		noCashBalance = Math.round(noCashBalance*Math.pow(10,2))/Math.pow(10,2);
//	        		var _remain = parseInt(parseInt(noCashBalance)+parseInt(_balance)-parseInt(fee));
					if(_remain<0){
					var html = $('<div class="control-group forFee"><label for="" class="control-label">余额不足,完成该笔订单还需充值<strong style="color: #ff945c">'+-_remain+'</strong>元,您确定充值吗?</label>' +
							'<div class="controls"style="font-size: 14px;font-weight: normal;">应付金额：<span style="color: #ff945c;font-size: 14px;font-weight: 400;">'+fee+'</span>元' +
							'<br>现金余额：<span class="money" style="color: #ff945c;font-size: 14px;font-weight: 400;">'+_balance+'</span>元<br> 代金券：<span style="color: #ff945c;font-size: 14px;font-weight: 400;">' +noCashBalance+
							'</span>元</div></div>');
					var confirmModal_balance = new com.skyform.component.Modal(new Date().getTime(),Dict.val("common_confirming_recharge"),html.html(),{
						buttons : [
									{
										name : Dict.val("common_confirming_recharge"),
										onClick : function(){
											window.location = "/portal/jsp/user/balance.jsp";
										},
										attrs : [
											{
												name : 'class',
												value : 'btn btn-primary'
											}
										]
									},
									{
										name : "返回修改配置",
										onClick : function(){
											confirmModal_balance.hide();
											if(component != null){
												if(component instanceof 

com.skyform.component.Wizard){
													

component.markSubmitSuccess();
													component.reset();
													component.render();
												}else{
													component.modal

("show");
												}
											}
										},
										attrs : [
											{
												name : 'class',
												value : 'btn btn-warning'
											}
										]
									},
									{
										name : Dict.val("common_cancel"),
										attrs : [
											{
												name : 'class',
												value : 'btn'
											}
										],
										onClick : function(){
											confirmModal_balance.hide();
										}
									}
								]					
					});
					confirmModal_balance.setWidth(500).autoAlign().setTop(180);
					confirmModal_balance.show();								

		
					
				}else{
					var html = $('<div class="control-group forFee"><label for="" class="control-label"></label>' +
							'<div class="controls"style="font-size: 14px;font-weight: normal;">应付金额：<span style="color: #ff945c;font-size: 14px;font-weight: 400;">'+fee+'</span>元' +
							'<br>现金余额：<span class="money" style="color: #ff945c;font-size: 14px;font-weight: 400;">'+_balance+'</span>元<br> 代金券：<span style="color: #ff945c;font-size: 14px;font-weight: 400;">' +noCashBalance+
							'</span>元</div></div>');
					var confirmModal_submit = new com.skyform.component.Modal(new Date().getTime(),Dict.val("common_confirming_debit"),html.html(),{
						buttons : [
									{
										name : Dict.val("common_determine"),
										onClick : function(){
											confirmModal_submit.hide();
com.skyform.service.BillService.tradeSubmit(tradeId,onSuccess,onError);
										},
										attrs : [
											{
												name : 'class',
												value : 'btn btn-primary'
											}
										]
									},
									{
										name : Dict.val("common_cancel"),
										attrs : [
											{
												name : 'class',
												value : 'btn'
											}
										],
										onClick : function(){
											confirmModal_submit.hide();
										}
									}
								]					
					});
					confirmModal_submit.setWidth(500).autoAlign().setTop(180);
					confirmModal_submit.show();
					}
				}
	        	else if(state == -1){
	        		alert(Dict.val("common_accounting_information_not_exist"));
	        		return;
	        	}
	  		});
		},
		confirmTradeSubmit : function(fee,tradeId,createModal,onSuccess,onError){
			createModal.modal("hide");
			var confirmModal_submit;
			if(CommonEnum.offLineBill){				
				confirmModal_submit = new com.skyform.component.Modal(new Date().getTime(),Dict.val

("nas_determine_submit"),Dict.val("nas_do_you_determine_submit"),{
					buttons : [
								{
									name : Dict.val("common_determine"),
									onClick : function(){
										confirmModal_submit.hide();
										com.skyform.service.BillService.tradeSubmit

(tradeId,onSuccess,onError);
										
									},
									attrs : [
										{
											name : 'class',
											value : 'btn btn-primary'
										}
									]
								},
								{
									name : Dict.val("common_cancel"),
									attrs : [
										{
											name : 'class',
											value : 'btn'
										}
									],
									onClick : function(){
										confirmModal_submit.hide();
									}
								}
							]					
				});
				confirmModal_submit.setWidth(500).autoAlign().setTop(180);;
				confirmModal_submit.show();									

	    			
				return;
			}
			else {
				com.skyform.service.BillService.queryBalance2(fee,tradeId,createModal,onSuccess,onError);
			}
		},
		confirmTradeSubmit4soft : function(fee,tradeId,createModal,onSuccess,onError){
			var confirmModal_submit;
			if(CommonEnum.offLineBill){				
				confirmModal_submit = new com.skyform.component.Modal(new Date().getTime(),Dict.val

("common_OK_to_create"),Dict.val("common_do_you_create"),{
					buttons : [
								{
									name : Dict.val("common_determine"),
									onClick : function(){
										confirmModal_submit.hide();
										com.skyform.service.BillService.tradeSubmit

(tradeId,onSuccess,onError);
										
									},
									attrs : [
										{
											name : 'class',
											value : 'btn btn-primary'
										}
									]
								},
								{
									name : Dict.val("common_cancel"),
									attrs : [
										{
											name : 'class',
											value : 'btn'
										}
									],
									onClick : function(){
										confirmModal_submit.hide();
									}
								}
							]					
				});
				confirmModal_submit.setWidth(500).setTop(180);
				confirmModal_submit.show();									

	    			
				return;
			}
			else {
				com.skyform.service.BillService.queryBalance2(fee,tradeId,createModal,onSuccess,onError);
			}
		},		
		wizardConfirmTradeSubmit : function(fee,tradeId,createWizard,onSuccess,onError){
			var confirmModal_submit;
			createWizard.close();
			createWizard.reset();
			if(CommonEnum.offLineBill){
				confirmModal_submit = new com.skyform.component.Modal(new Date().getTime(),Dict.val

("common_OK_to_create"),Dict.val("common_do_you_create"),{
					buttons : [
								{
									name : Dict.val("common_determine"),
									onClick : function(){
										$.blockUI(Dict.val

("common_being_submitted"));
										confirmModal_submit.hide();
										com.skyform.service.BillService.tradeSubmit

(tradeId,onSuccess,onError);
									},
									attrs : [
										{
											name : 'class',
											value : 'btn btn-primary'
										}
									]
								},
								{
									name : Dict.val("common_cancel"),
									attrs : [
										{
											name : 'class',
											value : 'btn'
										}
									],
									onClick : function(){
										confirmModal_submit.hide();
									}
								}
							]					
				});
				confirmModal_submit.setWidth(500).autoAlign().setTop(180);;
				confirmModal_submit.show();	
				return;
			}
			else {
				com.skyform.service.BillService.queryBalance2(fee,tradeId,createWizard,onSuccess,onError);
			}
		},
		wizardConfirmTradeSubmit2 : function(fee,tradeId,createWizard,onSuccess,onError){
			var confirmModal_submit;
			if(CommonEnum.offLineBill){
				confirmModal_submit = new com.skyform.component.Modal(new Date().getTime(),Dict.val

("common_OK_to_create"),Dict.val("common_do_you_create"),{
					buttons : [
								{
									name : Dict.val("common_determine"),
									onClick : function(){
										$.blockUI(Dict.val

("common_being_submitted"));
										confirmModal_submit.hide();
										com.skyform.service.BillService.tradeSubmit

(tradeId,onSuccess,onError);
									},
									attrs : [
										{
											name : 'class',
											value : 'btn btn-primary'
										}
									]
								},
								{
									name : Dict.val("common_cancel"),
									attrs : [
										{
											name : 'class',
											value : 'btn'
										}
									],
									onClick : function(){
										confirmModal_submit.hide();
									}
								}
							]					
				});
				confirmModal_submit.setWidth(500).setTop(200);
				confirmModal_submit.show();	
				return;
			}
			else {
				com.skyform.service.BillService.queryBalance2(fee,tradeId,createWizard,onSuccess,onError);
			}
		},
		qryCustPayType:function(onSuccess,onError){
			this.callSyncApi("/pm/qryCustPayType", {}, onSuccess, onError);		
		},
		delRecord:function(params,onSuccess,onError){
			this.callSyncApi("/pm/updateTradeStatus", params, onSuccess, onError);
		},
		qryCustPayTypeOut:function(onSuccess,onError){
			this.callSyncApi("/pm/qryCustPayTypeOut", {}, onSuccess, onError);		
		},
		initJsonBillType : function(data){
			var text = '';
			if(data&&data.length>0){				
				$(data).each(function(i,item){
					switch(item.billtype){							
						case 0: text += '"0":"包月"';break;
						case 3: 
							if(text.length>0){
								text +=',';
							}
							text += '"3":"包年"';
							break;
						case 4: 
							if(text.length>0){
								text +=',';
							}
							text += '"4":"后付费"';
							break;
						case 5: 
							if(text.length>0){
								text +=',';
							}
							text += '"5":"VIP"';
							break;
					}					
				});						
			}
			return $.parseJSON("{"+text+"}");
		},
		getBillType : function(){
			var billType = '';
			this.qryCustPayType(function(data){
				billType = com.skyform.service.BillService.initJsonBillType(data);
			});
			return billType;
		},
		getBillTypeOut : function(){
			var billType = '';
			this.qryCustPayTypeOut(function(data){
				billType = com.skyform.service.BillService.initJsonBillType(data);
			});
			return billType;
		}
	};

/**
 * 获取安全组快捷端口service
 */
com.skyform.service.FireWallRule = [
	    	{
		    	name : 'http',
		    	port : [{port:'80'}],
		    	protocol : [{type:'tcp'}],
		    	direction : "ingress",
		    	ip : ""	
		    },
		    {
		    	name : 'ssh',
		    	port : [{port:'22'}],
		    	protocol : [{type:'tcp'}],
		    	direction : "ingress",
		    	ip : ""	
		    },
		    {
		    	name : 'https',
		    	port : [{port:'443'}],
		    	protocol : [{type:'tcp'}],
		    	direction : "ingress",
		    	ip : ""		
		    },
		    {
		    	name : 'openvpn',
		    	//port : 1194,
		    	//protocol : 'udp',
		    	port : [{port:'1194'}],
		    	protocol : [{type:'udp'}],
		    	direction : "ingress",
		    	ip : ""	
		    },
		    {
		    	name : 'RemoteDesktop',
		    	port : [{port:'3389'}],
		    	protocol : [{type:'tcp'}],
		    	direction : "ingress",
		    	ip : ""	
		    },
		    {
		    	name : 'DNS',
		    	port : [{port:'53'}],
		    	protocol : [{type:'udp'}],
		    	direction : 'ingress',
		    	ip : ""	
		    },
		    {
		    	name : 'ICMP',
		    	port : [{port:'0'}],
		    	protocol : [{type:'icmp'}],
		    	direction : 'ingress',
		    	ip : ""	
		    },
		    {
		    	name : 'NFS',
		    	port : [{port:'111'},{port:'2049'},{port:'4000'},{port:'4001'},{port:'4002'}],
		    	protocol : [{type:'tcp'},{type:'udp'}],
		    	direction : 'ingress',
		    	ip : ""	
		    },
		    {
		    	name : 'CIFS',
		    	port : [{port:'139'},{port:'445'}],
		    	protocol : [{type:'tcp'}],
		    	direction : 'ingress',
		    	ip : ""	
	    	}
	];

com.skyform.service.renewService = {
//		callSyncApi : com.skyform.service.callSyncApi,
		callApi : com.skyform.service.callApi,
	renew : function(subsId,period,onSuccess,onError){
		var params = {
				"subscriptionId" : parseInt(subsId),
				"period": period
		};		
		this.callApi("/trade/renew",params,onSuccess,onError);
	}
};
	

/**
 * 获取产品周期单位名称service
 */
com.skyform.service.UnitService = {
		preName : {
			 "0" : "月（预付）"
			,"3" : "年（预付）"
			,"4" : ""
		},
		aftName : {
			 "1" : "月（后付）"
			,"2" : "年（后付）"
		},
		AllName : {
			 "0" : "月"
			,"3" : "年"
			,"5" : "月"
		},
		getType : function(type){
			switch(type){
				case 1  : return "pre";
				case 2  : return "aft";
				default : return "";
			}
		},
		getUnitName : function(type,name_code){
			var unit_names = this["" + type + "Name"];
			if(unit_names) {
				return unit_names[""+name_code] || this.AllName[""+name_code] || "--";
			} 
			return this.AllName[""+name_code] || "--";
		}
	};
com.skyform.service.modifyStatus = {
		modifyAllStatus: function(instanceid,status,datas,func){
			if(instanceid != null){
			var dataleg = datas.length;
			for(var i= 0;i < dataleg;i++){
				if(instanceid == datas[i].id){
					datas[i].state = status;
				}
			}
			if(func != null){
				func();
			}
		}
	}
}


/*发票管理*/
com.skyform.service.billService = {
	callApi : com.skyform.service.callSyncApi,
	myApi :com.skyform.service.callApi,
	describePrintBalance : function(onSuccess,onError){
		this.callApi("/oldInvoice/account/describePrintBalance",{"loginName":currentUserName},onSuccess,onError);
	},
	save : function(params,onSuccess,onError){
		var paramsData={};
		paramsData.loginName = currentUserName;
		paramsData.invoiceInfo=params;
		this.myApi("/oldInvoice/account/printInvoice",paramsData,onSuccess,onError);
	},	
	describePrintLog : function(params,onSuccess,onError){
		var paramsData={};
		paramsData.loginName = currentUserName;
		paramsData.paramInput=params;
		//this.myApi("/oldInvoice/account/describePrintLog",params,onSuccess,onError);
		this.myApi("/oldInvoice/account/queryPrintLog",paramsData,onSuccess,onError);
	},
	describeUnPrintBalance : function(onSuccess,onError){
		this.callApi("/oldInvoice/account/describeUnPrintBalance",{"loginName":currentUserName},onSuccess,onError);
	},
	describeBillBalance : function(onSuccess,onError){
		//this.callApi("/oldInvoice/account/describeBillBalance",params,onSuccess,onError);
		this.callApi("/oldInvoice/account/queryBillBalance",{"loginName":currentUserName},onSuccess,onError);
	},
	describeInvoiceTemplate : function(onSuccess,onError){
		//this.callApi("/oldInvoice/account/describeInvoiceTemplate",params,onSuccess,onError);
		this.callApi("/oldInvoice/account/queryInvoiceTemplates",{"loginName":currentUserName},onSuccess,onError);
	},
	describeInvoicePostInfo : function(onSuccess,onError){
		//this.callApi("/oldInvoice/account/describeInvoicePostInfo",params,onSuccess,onError);
		this.callApi("/oldInvoice/account/queryInvoicePostInfos",{"loginName":currentUserName},onSuccess,onError);
	},
	printInvoice : function(params,onSuccess,onError){
		var paramsData={};
		paramsData.loginName = currentUserName;
		paramsData.invoiceInfo=params;
		this.myApi("/oldInvoice/account/printInvoice",paramsData,onSuccess,onError);
	}
};

/*发票信息管理*/
com.skyform.service.billInfoService = {
	callApi : com.skyform.service.callSyncApi,
	describeInvoiceTemplate : function(params,onSuccess,onError){
		params.loginName = currentUserName;
		//this.callApi("/oldInvoice/account/describeInvoiceTemplate",params,onSuccess,onError);
		this.callApi("/oldInvoice/account/queryInvoiceTemplates",params,onSuccess,onError);
	},
	createInvoiceTemplate : function(params,onSuccess,onError){
		var paramsData={};
		paramsData.loginName = currentUserName;
		paramsData.invoiceTemplateInfo=params;
		this.callApi("/oldInvoice/account/createInvoiceTemplate",paramsData,onSuccess,onError);
	},
	getTemplateStatusType : function(type){
		switch(type){
			case 0  : return "待审核";
			case 1  : return "可用";
			case 2  : return "审核未通过";
			default : return "";
		}
	},
	getInvoiceType : function(type){
		switch(type){
			case 0  : return "个人";
			case 1  : return "企业";
			default : return "";
		}
	},
	getInvoiceItem: function(type){
		switch(type){
		case 0  : return "增值税普通发票";
		case 1  : return "增值税专用发票";
		default : return "";
	 }
   }
};
com.skyform.service.userKeyService = {
	callApi : com.skyform.service.callSyncApi,
	listKeyInfo:function(params,onSuccess,onError){
		this.callApi("/listKeyInfo",params,onSuccess,onError);
	},
	insertKeyInfo:function(params,onSuccess,onError){
		this.callApi("/insertKeyInfo",params,onSuccess,onError);
	},
	getAkAndSkRandom:function(onSuccess,onError){
		var params={};
		this.callApi("/getAkAndSkRandom",params,onSuccess,onError);
	},
	deleteKeyInfo:function(params,onSuccess,onError){
		this.callApi("/deleteKeyInfo",params,onSuccess,onError);
	},
	modifyKeyInfo:function(params,onSuccess,onError){
		this.callApi("/modifyKeyInfo",params,onSuccess,onError);
	}
};
com.skyform.service.agentCouponService = {
		callApi : com.skyform.service.callSyncApi,
		agentCouponFeeInfo:function(params,onSuccess,onError){
			this.callApi("/agentCouponFeeInfo",params,onSuccess,onError);
		}
	};
/*多桌面用户管理*/
com.skyform.service.multiTenacyService = {
	callApi : com.skyform.service.callSyncApi,
	save : function(params,onSuccess,onError){
		this.callApi("/user/createAdminUser",params,onSuccess,onError);
	},	
	describeAdminUser : function(onSuccess,onError){
		this.callApi("/user/describeAdminUser",{},onSuccess,onError);
	},
	modify : function(params,onSuccess,onError){
		this.callApi("/user/modifyAdminUser",params,onSuccess,onError);
	},
	deleteUser : function(params,onSuccess,onError){
		this.callApi("/user/deleteAdminUser",params,onSuccess,onError);
	}
};
com.skyform.service.backupCloudService = {	
		callApi : com.skyform.service.callSyncApi,
		saveBackupCloud : function(params,onSuccess,onError){
			this.callApi("/backupCloud/createCloudBackupTask",params,onSuccess,onError);
		},
		deleteBackupCloud : function(params,onSuccess,onError){
			this.callApi("/backupCloud/deleteCloudBackupTask",params,onSuccess,onError);
		},
		startBackupCloud : function(params,onSuccess,onError){
			this.callApi("/backupCloud/startCloudBackupTask",params,onSuccess,onError);
		},
		closedBackupCloud : function(params,onSuccess,onError){
			this.callApi("/backupCloud/stopCloudBackupTask",params,onSuccess,onError);
		},
		nowExecuteBackupCloud : function(params,onSuccess,onError){
			this.callApi("/backupCloud/nowExecuteCloudBackupTask",params,onSuccess,onError);
		},
		queryVmInfoForBackup:function(onSuccess,onError){
			this.callApi("/backupCloud/queryVmInfoForBackup",{},onSuccess,onError);
		},
		
		listBackupCloudByParams : function(params,onSuccess,onError){
			var listreque={};
			listreque.params=params.condition;
			this.callApi("/backupCloud/listCloudBackupTask",listreque,onSuccess,onError);
			//this.callApi("/backupCloud/listCloudBackupTask",params,onSuccess,onError);
			//this.callApi("/backupCloud/listCloudBackupTask",{},onSuccess,onError);
		},
		listBackupCloudDir : function(params,onSuccess,onError){
			if(!params){
				return;
			};
			var reque={};
			reque.params=params.condition;
			reque.params.backuptask_id=params.condition.taskName.split("_")[params.condition.taskName.split("_").length-1];
			reque.params.vm_id=params.condition.vmName.split("_")[params.condition.vmName.split("_").length-1];

			this.callApi("/backupCloud/listCloudBackup",reque,onSuccess,onError);
		},
		deleteBackupCloudDir : function(params,onSuccess,onError){
			
			this.callApi("/backupCloud/deleteCloudBackup",params,onSuccess,onError);
		},
		createAndExecuteCloudBackupTask : function(params,onSuccess,onError){
			
			this.callApi("/backupCloud/createAndExecuteCloudBackupTask",params,onSuccess,onError);
		},
		backupListResource : function(params,onSuccess,onError){
			this.callApi("/listResource",params,onSuccess,onError);
		},
		cloudBackukFileDetails : function(params,onSuccess,onError){
			this.callApi("/cloudBackukFileDetails",params,onSuccess,onError);
		},
		listCloudBackukFile : function(params,onSuccess,onError){
			this.callApi("/listCloudBackukFile",params,onSuccess,onError);
		},
		rollbackCloudBackup : function(params,onSuccess,onError){
			this.callApi("/rollbackCloudBackup",params,onSuccess,onError);
		},
	downloadCloudBackukFile : function(params,onSuccess,onError){
			this.callApi("/downloadCloudBackukFile",params,onSuccess,onError);
		}

	};
/*支付充值记录*/
com.skyform.service.payLogService = {
	callApi : com.skyform.service.callSyncApi,
	addPayLog : function(params,onSuccess,onError){
		this.callApi("/account/log/addPayLog",params,onSuccess,onError);
	},	
	editPayLog : function(params,onSuccess,onError){
		this.callApi("/account/log/editPayLog",params,onSuccess,onError);
	}
};
/*发票寄送地址*/
com.skyform.service.billAddressService = {
		callApi : com.skyform.service.callApi,
		
		createAddress : function(params,onSuccess,onError){
			var paramsData={};
			paramsData.loginName = currentUserName;
			paramsData.invoicePostInfo=params;
			this.callApi("/oldInvoice/account/createInvoicePostInfo",paramsData,onSuccess,onError);
		},	
		quaryAddress : function(onSuccess,onError){
			//this.callApi ("/oldInvoice/account/describeInvoicePostInfo",{},onSuccess,onError);
			this.callApi ("/oldInvoice/account/queryInvoicePostInfos",

{"loginName":currentUserName},onSuccess,onError);
		},
		modifyAddress:function(params,onSuccess,onError){
			var paramsData={};
			paramsData.loginName = currentUserName;
			paramsData.modifyInfo=params;
			this.callApi("/oldInvoice/account/updateInvoicePostInfo",paramsData,onSuccess,onError);
		},
		deleteAddress:function(params,onSuccess,onError){
			params.loginName = currentUserName;
			params.postId=parseInt(params.postId);
			//this.callApi("/oldInvoice/account/removeInvoicePostInfo",params,onSuccess,onError);
			this.callApi("/oldInvoice/account/deleteInvoicePostInfo",params,onSuccess,onError);
		}
	};
com.skyform.service.BillStateService = {
		getBillState : function(type){
			switch(type){
				case 101 : return "已申请";
				case 102 : return "审核通过";
				case 103 : return "审核未通过";
				case 104 : return "已打印";
				case 0 : return "已申请";
				case 1 : return "已打印";
				case 2 : return "已邮寄";
				default : return type;
			}
		},
		getInvoiceType : function(type){
			switch(type){
				case 0 : return "个人";
				case 1 : return "企业";
				default : return type;
			}
		},
		getInvoiceItem : function(type){
			switch(type){
				case 0 : return "增值税普通发票";
				case 1 : return "增值税专用发票";
				default : return type;
			}
		}
};

com.skyform.service.pmService = {
	callApi : com.skyform.service.callSyncApi,
	callSyncApi : com.skyform.service.callSyncApi,
	queryPmProducts : function(onSuccess,onError){
		this.callApi("/instance/pm/queryPmProducts",{"productId":"1016"},onSuccess,onError);
	},
	describePmInstances : function(onSuccess,onError){
		this.callApi("/instance/pm/describePmInstances",{},onSuccess,onError);
	},
	runPmInstance : function(params,onSuccess,onError){
		com.skyform.service.callAsyncApi4yaxin("/instance/pm/runPmInstance",params,onSuccess,onError);
	},
	startPm : function(pmId,onSuccess,onError){
		var params = {
			"subscriptionId":pmId
		};		
		this.callApi("/instance/pm/startPmInstances",params,onSuccess,onError);
	},
	stopPm : function(pmId,onSuccess,onError){
		var params = {
				"subscriptionId":parseInt(pmId)
			};		
		this.callApi("/instance/pm/stopPmInstances",params,onSuccess,onError);
	},
	destroyPm : function(pmId,onSuccess,onError){
		var params = {
				"subscriptionId":pmId
			};		
		this.callApi("/instance/pm/delePmInstance",params,onSuccess,onError);
	},
	restartPm : function(pmId,onSuccess,onError){
		var params = {
				"subscriptionId":parseInt(pmId)
			};		
		this.callApi("/instance/pm/restartPmInstances",params,onSuccess,onError);
	},
	updateNameAndDescription : function(pmId,newName,onSuccess,onError) {
		var params = {
			"subscriptionId" : pmId,
			"instanceName" : newName
		};
		this.callApi("/instance/pm/modifyPmInstanceAttributes",params,onSuccess,onError);
	},
	/*listPhysicalMachines : function(cpuNum,mem,osValue,disksize,allocateflag,onSuccess,onError) {
		var params = {
			"cpuNum":cpuNum,
			"mem":mem,
			"os":osValue,
			"osDisk":disksize,
			"allocateflag" : allocateflag
		};
		this.callApi("/instance/pm/listPhysicalMachines",params,onSuccess,onError);
	},*/
	listPhysicalMachines : function(params,onSuccess,onError){
		this.callApi("/instance/pm/listPhysicalMachines",params,onSuccess,onError);
	},
	getPhysicalOs : function(params,onSuccess,onError){
		this.callSyncApi("/pm/getPhysicalOs",params, onSuccess, onError);
	}
};
com.skyform.service.desktopService = {
		callApi : com.skyform.service.callApi,
		listAll : function(onSuccess,onError){			
			this.callApi("/instance/cloudtab/describeCloudTabs",{},onSuccess,onError);
		},
		start : function(onSuccess,onError){			
			this.callApi("/instance/cloudtab/startCloudTabInstances",{},onSuccess,onError);
		},
		restartDesktop : function(id,onSuccess,onError){			
			this.callApi("/instance/cloudtab/restartCloudTabInstances",{"listIds":id},onSuccess,onError);
		},
		destroy : function(id,onSuccess,onError){			
			this.callApi("/instance/cloudtab/detachDesktopInstance",{"ids":id},onSuccess,onError);
		}
	};

//com.skyform.service.resQuotaService = {
//		callApi : com.skyform.service.callApi,
//		queryQuotaAllCount : function(loginName,az,onSuccess,onError){	
//			az = az?az:"";
//			this.callApi("/instance/quota/queryQuotaAllCount",{"loginName":loginName,"az":az},onSuccess,onError);
//		},
//		queryQuotaAllCountByLoginName : function(az,onSuccess,onError){
//			az = az?az:"";
//			this.callApi("/instance/quota/queryQuotaAllCount",{"loginName":currentUserName,"az":az},onSuccess,onError);
//		},
//		queryAZAndAzQuota:function(onSuccess,onError){
//			this.callApi("/instance/quota/queryAZAndAzQuota",{},onSuccess,onError);
//		},
//		showOrHideAZTh :function(){
//			this.queryAZAndAzQuota(function(data){			
//				if(data){
//					$("th [name='availableZoneName']").attr("contentVisiable","");
//				}
//				else {
//					$("th [name='availableZoneName']").attr("contentVisiable","hide");
//					$("th [name='availableZoneName']");
//				}
//			});
//		},
//
//};
com.skyform.service.indentService = {
		callApi:com.skyform.service.callApi,
		createIndet:function(indent,onSuccess,onError){
			this.callApi("/user/custIdent",indent,onSuccess,onError);
		},
		queryCustIdentStatus:function(onSuccess,onError){
			this.callApi("/user/queryCustIdentStatus",{},onSuccess,onError);
		},
		indentDetailShow:function(condition,onSuccess,onError){
			this.callApi("/customer/customerMessage",condition,onSuccess,onError);
		}
};
com.skyform.service.virusService = {
		callApi:com.skyform.service.callApi,
		queryConfig:function(onSuccess,onError){
			this.callApi("/instance/hostSecurity/describeAllAntivirusConfig",{},onSuccess,onError);
		},
		saveConfig:function(config,onSuccess,onError){
			this.callApi("/instance/hostSecurity/createAntivirus",config,onSuccess,onError);
		},
		playConfigAct:function(id,onSuccess,onError){
			this.callApi("/instance/hostSecurity/startSafe",{"id":id},onSuccess,onError);
		},
		pauseConfigAct:function(id,onSuccess,onError){
			this.callApi("/instance/hostSecurity/stopSafe",{"id":id},onSuccess,onError);
		},
		manualSafe:function(id,onSuccess,onError){
			this.callApi("/instance/hostSecurity/manualSafe",{"id":id},onSuccess,onError);
		},
		unbindConfigAct:function(vmid,configId,onSuccess,onError){
			this.callApi("/instance/hostSecurity/unBindSafe",{"vmId":vmid,"configId":configId},onSuccess,onError);
		},
		bindVirus:function(param,onSuccess,onError){
			this.callApi("/instance/hostSecurity/bindSafe",param,onSuccess,onError);
		},
		deleteConfigAct:function(id,onSuccess,onError){
			this.callApi("/instance/hostSecurity/deleteSafeConfig",{"id":id},onSuccess,onError);
		},
		querySafeRefVM:function(id,onSuccess,onError){
			this.callApi("/instance/hostSecurity/querySafeRefVM",{"configId":id},onSuccess,onError);
		},
		listInstances : function(onSuccess,onError){
			this.callApi("/instance/hostSecurity/describeInstancesWithSafe", {}, onSuccess, onError);
		},
		querySchedule:function(onSuccess,onError){
			this.callApi("/instance/hostSecurity/querySchedule", {}, onSuccess, onError);
		},
		querySafeReport:function(vmId,range,onSuccess,onError){
			this.callApi("/instance/hostSecurity/querySafeReport", {"vmId":vmId,"range":range}, onSuccess, onError);
		},
		updateConfigAct:function(config,onSuccess,onError){
			this.callApi("/instance/hostSecurity/modifyAntivirusConfig", config, onSuccess, onError);
		}
	},
	com.skyform.service.PresentService = {
		callApi:com.skyform.service.callPostSyncApi,
		queryUserPresent:function(id,onSuccess,onError){
			this.callApi("/profit/queryUserQualify",{"userId":id},onSuccess,onError);
		},
		present:function(id,onSuccess,onError){
			this.callApi("/profit/queryPresent",{"userId":id},onSuccess,onError);
		},
		queryPresentDate:function(id,onSuccess,onError){
			this.callApi("/profit/queryPresentDate",{"userId":id},onSuccess,onError);
		}
	};
com.skyform.service.multiCardService = {
		callApi:com.skyform.service.callApi,
		callSyncApi:com.skyform.service.callSyncApi,
		listNetWorkCards:function(indent,onSuccess,onError){
			this.callApi("/instance/networkcard/listNetworkCards",indent,onSuccess,onError);
			
//			$.ajax({
//				"url" : "/portal/ajax/mrhealthlist.json",
//				"type" : "GET",
//				"dataType" : "json",
//				"async" : false,
//				"success" : function(data) {
//					if(onSuccess){
//						onSuccess(data.data);
//					}else if(onError){
//						onError("request data is not exists");
//					}
//				}
//				});
		
		},
		freeNetWorkCard:function(condition,onSuccess,onError){
			this.callApi("/instance/networkcard/detachNetworkCard",condition,onSuccess,onError);
		},
		listSubNet:function(onSuccess,onError){
			this.callApi("/subnet/describeSubNet",{queryMine:true},onSuccess,onError);
		},
		listSecurities:function(onSuccess,onError){
			this.callApi("/instance/securitygroup/qrySecurityGroup",{},onSuccess,onError);
		},
		saveNetWorkCard:function(condition,onSuccess,onError){
			this.callApi("/instance/networkcard/createNetworkCard",condition,onSuccess,onError);
		},
		saveStorgeNetWorkCard:function(condition,onSuccess,onError){
//			console.log(condition);
//			if(true){
//				onSuccess(data);
//			}
			this.callApi("/instance/networkcard/createNetworkCard",condition,onSuccess,onError);
		},
		bingNetWorkCard:function(condition,onSuccess,onError){
			this.callApi("/instance/networkcard/attachNetworkCard",condition,onSuccess,onError);
		},
		bingSecurityNetwork:function(condition,onSuccess,onError){
			this.callApi

("/instance/securitygroup/modifySecurityGroupAndNetWorkCardsRelation",condition,onSuccess,onError);
		},
		listVM:function(onSuccess,onError){
			this.callApi("/instance/vm/describeInstances",{},onSuccess,onError);
		},
		deleCard:function(condition,onSuccess,onError){
			this.callApi("/instance/networkcard/deleteNetworkCard",condition,onSuccess,onError);
		},
		checkIP:function(condition,onSuccess,onError){
			this.callSyncApi("/instance/networkcard/checkIP",condition,onSuccess,onError);
		},
		limitNetworkCardsRate:function(condition,onSuccess,onError){
			//this.callApi("/instance/networkcard/limitNetworkCardsRate",condition,onSuccess,onError);
			this.callApi("/instance/networkcard/limitNetworkCards",condition,onSuccess,onError);
		},
		modifyLimitNetworkCardsRate:function(condition,onSuccess,onError){
			//this.callApi("/instance/networkcard/modifyLimitNetworkCardsRate",condition,onSuccess,onError);
			this.callApi("/instance/networkcard/limitNetworkCardsUpdate",condition,onSuccess,onError);
		},
		getStorgeNetCard:function(params,onSuccess,onError){
			this.callApi("/instance/networkcard/getCustDefaultSubByPool",params,onSuccess,onError);
		},
		checkNetworkCardLimit:function(params,onSuccess,onError){
//			if(onSuccess){
//				var ttt={
//						  "message": null,
//						  "code": 0,
//						  "data": {
//						    "bandTx":"8",
//						    "bandRx":"8"
//						  }
//				}
//				onSuccess(ttt);
//			}
				
			this.callApi("/instance/networkcard/checkNetworkCardLimit",params,onSuccess,onError);
		},
		describeCloudAntivirusLogs:function(params,onSuccess,onError){
	
				
			this.callApi("/instance/networkcard/describeCloudAntivirusLogs",params,onSuccess,onError);
		}
};
com.skyform.service.diaryService = {
		callApi:com.skyform.service.callApi,
		search:function(condition,onSuccess,onError){
			this.callApi("/instance/commquery/querySubsLogInfo",condition,onSuccess,onError);
		}
		
};
com.skyform.service.channelService = {
	callApi:com.skyform.service.callApi,
	callSyncApi:com.skyform.service.callSyncApi,
	channel:{
		  "period": 1,
		  "count": 1,
		  "agentCouponCode":"",
		  "productList": [
					{		      	
					    "price": 0,
					    "productId": "",
					    "serviceType": "",
					    "productDesc": {}
					  }
	         ]	
	},
	product : {		      	
	      "price": 0,
	      "productId": "",
	      "serviceType": "",
	      "productDesc": {}
	    },	            			  
	channel_st:{
		  "period":"",
		  "count": 1,
		  "productList": [
  		    {		      	
  		      "orderId": ""
  		    }
  		  ]
	},
	getProductFee:function(){
		var productFee = {
		  "period": 0,
		  "productPropertyList": [
		    {
		      "muProperty": "cpuNum",
		      "muPropertyValue": "1",
		      "productId": 513
		    }
		  ]
		}
		return productFee;
	},
	channelOrder: function(onSuccess,onError){
		this.callApi("/instance/agent/getCustAmOrder",{}, onSuccess, onError);
	},
	channeldetail:function(orderid,onSuccess,onError){
		this.callApi("/instance/agent/getCustAmOrder",orderid,onSuccess,onError);
	},
	submitOrder : function(param,onSuccess,onError){
		this.callApi("/instance/agent/createAmOrder",param,onSuccess,onError);
	},
	payOrder : function(param,onSuccess,onError){
		this.callApi("",param,onSuccess,onError);
	},
//	checkAgentCode : function(agentCode,onSuccess,onError){
//		this.callSyncApi("/agent/checkAgentCode",{"agentCode":agentCode},onSuccess,onError);
//	},
	checkAgentCode : function(agentCode,onSuccess,onError){
		this.callSyncApi("/agent/checkAgentCouponCode",

{"agentCouponCode":agentCode,"verifyFlag":"0"},onSuccess,onError);
	},
	getItemFee:function(param,onSuccess,onError){
		if(CommonEnum.offLineBill)return;
		this.callSyncApi("/pm/queryCaculateFeeByPrtyList",param,onSuccess,onError);	
	},
	channelSubmit : function(channel,onSuccess,onError) {
		this.callApi("/trade/runAgentVmInstance", channel, onSuccess, onError);
	},
	wizardConfirmChannelSubmit : function(channel,createWizard,onSuccess,onError){		
		var confirmModal_submit;
		createWizard.close();
		createWizard.reset();		
		confirmModal_submit = new com.skyform.component.Modal(new Date().getTime(),Dict.val

("nas_determine_submit"),Dict.val("common_submit_orde"),{
			buttons : [
						{
							name : Dict.val("common_determine"),
							onClick : function(){
								$.blockUI(Dict.val("common_being_submitted"));
								confirmModal_submit.hide();
								com.skyform.service.channelService.submitOrder

(channel,onSuccess,onError);
							},
							attrs : [
								{
									name : 'class',
									value : 'btn btn-primary'
								}
							]
						},
						{
							name : Dict.val("common_cancel"),
							attrs : [
								{
									name : 'class',
									value : 'btn'
								}
							],
							onClick : function(){
								confirmModal_submit.hide();
							}
						}
					]					
		});
		confirmModal_submit.setWidth(500).autoAlign().setTop(180);;
		confirmModal_submit.show();	
		return;
		
	},	
	confirmChannelSubmit : function(channel,createModal,onSuccess,onError){
		createModal.modal("hide");
		var portalType = Dcp.biz.getCurrentPortalType();
		if("private"== portalType){
			channel.productList[0].price = 0;
		};
		var confirmModal_submit;
		confirmModal_submit = new com.skyform.component.Modal(new Date().getTime(),Dict.val

("nas_determine_submit"),Dict.val("common_submit_orde"),{
			buttons : [
						{
							name : Dict.val("common_determine"),
							onClick : function(){
								$.blockUI(Dict.val("common_being_submitted"));
								confirmModal_submit.hide();
								com.skyform.service.channelService.submitOrder

(channel,onSuccess,onError);
							},
							attrs : [
								{
									name : 'class',
									value : 'btn btn-primary'
								}
							]
						},
						{
							name : Dict.val("common_cancel"),
							attrs : [
								{
									name : 'class',
									value : 'btn'
								}
							],
							onClick : function(){
								confirmModal_submit.hide();
							}
						}
					]					
		});
		confirmModal_submit.setWidth(500).autoAlign().setTop(180);;
		confirmModal_submit.show();										    	

		
		return;
	}
}
// 调用autoScalling
com.skyform.service.callASGet = function(api,onSuccess,onError) {
	Dcp.biz.apiASGetRequest(api,function(result){
		onSuccess($.parseJSON(result)||{});
	},function(error){
		onError(Dict.val("wo_for_data_error_please_try_again_later"));
	});
};
com.skyform.service.callASPost = function(api,params,onSuccess,onError) {
	Dcp.biz.apiASPostRequest(api, params || {},function(result){
		onSuccess($.parseJSON(result) ||{});
	},function(error){
		onError(Dict.val("wo_for_data_error_please_try_again_later"));
	});
};
com.skyform.service.autoScallingGroupService = {
	callASGet: com.skyform.service.callASGet,
	callASPost: com.skyform.service.callASPost,
	//查询自动伸缩组
	list : function(params, onSuccess,onError) {
		var timestamp = Date.parse( new Date());
		this.callASGet("Action=DescribeAutoScalingGroups&UserId=" +portalUser.id + params + "&_=" + timestamp, onSuccess, onError);
	},
	//创建启动配置
	createLaunchConfiguration : function(params, onSuccess,onError) {
		this.callASGet("Action=CreateLaunchConfiguration"+ params, onSuccess, onError);
	},
	//创建伸缩组
	createAutoScalingGroup : function(params, onSuccess,onError) {
		this.callASGet("Action=CreateAutoScalingGroup" + params, onSuccess, onError);
	},
	//创建伸缩策略
	putScalingPolicy : function(params, onSuccess,onError) {
		this.callASGet("Action=PutScalingPolicy" + params, onSuccess, onError);
	},
	//创建hook
	putLifecycleHook : function(params, onSuccess,onError) {
		this.callASPost("PutLifecycleHook", params, onSuccess, onError);
	},
	//扩容
	group_scale_out : function(params, onSuccess,onError) {
		this.callASGet("Action=ScaleOut" + params, onSuccess, onError);
	},
	//缩容
	group_scale_in : function(params, onSuccess,onError) {
		this.callASGet("Action=ScaleIn" + params, onSuccess, onError);
	},
	//纳管实例
	group_attach_instances : function(params, onSuccess,onError) {
		this.callASGet("Action=AttachInstances" + params, onSuccess, onError);
	},
	//释放实例
	group_detach_instances : function(params, onSuccess,onError) {
		this.callASGet("Action=DetachInstances" + params, onSuccess, onError);
	},
	//通过id删除自动伸缩组
	deleteGroup : function(params, onSuccess,onError) {
		this.callASGet("Action=DeleteAutoScalingGroup" + params, onSuccess, onError);
	},
	//获取上端设备类型
	getUpstreamDeviceTypes : function(params, onSuccess,onError) {
		var timestamp = Date.parse( new Date());
		this.callASGet("Action=DescribeUpstreamDeviceTypes" + params + "&_=" + timestamp, onSuccess, onError);
	},
	//查询策略
	describePolicies : function(params, onSuccess,onError) {
		var timestamp = Date.parse( new Date());
		this.callASGet("Action=DescribePolicies" + params  + "&_=" + timestamp, onSuccess, onError);
	},
	//删除策略
	deleteScalingPolicy : function(params, onSuccess,onError) {
		this.callASGet("Action=DeleteScalingPolicy" + params, onSuccess, onError);
	},
	//查询实例信息
	describeAutoScalingInstances : function(params, onSuccess,onError) {
		var timestamp = Date.parse( new Date());
		this.callASGet("Action=DescribeAutoScalingInstances" + params + "&_=" + timestamp, onSuccess, onError);
	},
	//查询伸缩组一次扩容所需的资源信息
	describeAutoScalingAndConfig : function(params, onSuccess,onError){
		var timestamp = Date.parse( new Date());
		this.callASGet("Action=DescribeAutoScalingAndConfig" + params + "&_=" + timestamp, onSuccess, onError);
	},
	//初始化伸缩组
	initGroup : function(params, onSuccess,onError){
		this.callASGet("Action=InitGroup" + params, onSuccess, onError);
	},
	//查询启动配置
	describeLaunchConfigurations : function(params, onSuccess,onError){
		var timestamp = Date.parse( new Date());
		this.callASGet("Action=DescribeLaunchConfigurations" + params + "&_=" + timestamp, onSuccess, onError);
	}
}
// 调用ceilometer
com.skyform.service.callCeilometerPost = function(api,params,onSuccess,onError) {
	Dcp.biz.apiCeilometerPostRequest(api, params || {},function(result){
		onSuccess($.parseJSON(result) ||{});
	},function(error){
		onError(Dict.val("wo_for_data_error_please_try_again_later"));
	});
};
com.skyform.service.celiometerService = {
	callCeilometerPost: com.skyform.service.callCeilometerPost,
	//创建自动伸缩组告警
	createAlarm : function(params, onSuccess,onError) {
		this.callCeilometerPost("alarms", params, onSuccess, onError);
	}

}

com.skyform.service.resQuotaService = {
	callApi : com.skyform.service.callApi,
	queryQuotaAllCount : function(loginName,az,onSuccess,onError){
		az = az?az:"";
		this.callApi("/instance/quota/queryQuotaAllCount",{"loginName":loginName,"az":az},onSuccess,onError);
	},
	queryQuotaAllCountByLoginName : function(az,onSuccess,onError){
		az = az?az:"";
		this.callApi("/instance/quota/queryQuotaAllCount",{"loginName":currentUserName,"az":az},onSuccess,onError);
	},
	queryAZAndAzQuota:function(onSuccess,onError){
		var timestamp = new Date().getTime();
		this.callApi("/instance/quota/queryAZAndAzQuota&_=" + timestamp,{},onSuccess,onError);
	},
	/*queryAZAndAzQuota:function(onSuccess,onError){
		this.callApi("/instance/vm/describeInstances",{},onSuccess,onError);
	},*/
	showOrHideAZTh :function(){
		this.queryAZAndAzQuota(function(data){
			if(data){
				$("th [name='availableZoneName']").attr("contentVisiable","");
			}
			else {
				$("th [name='availableZoneName']").attr("contentVisiable","hide");
				$("th [name='availableZoneName']");
			}
		})
	}
}
com.skyform.service.safewallService = {
		callApi : com.skyform.service.callApi,
		queryCloudFirewallEvent : function(params, onSuccess,onError) {
			this.callApi("/queryCloudFirewallEvent",params,onSuccess,onError);
			//this.callApi("/desktopCloud/listTenant",params,onSuccess,onError);
		}
};

com.skyform.service.securityService = {
	callApi : com.skyform.service.callApi,
	queryAntiVirusRules : function(vmid,onSuccess,onError){
		vmid = vmid?vmid:"";
		this.callApi("/instance/vm/describeCloudAntivirusRule", {}, onSuccess, onError);
	},
	createAntivirusRule : function(params,onSuccess,onError){
		this.callApi("/instance/vm/createCloudAntivirusRule", params, onSuccess, onError);
	},
	modifyAntivirusRule : function(params,onSuccess,onError){
		this.callApi("/instance/vm/updateCloudAntivirusRule", params, onSuccess, onError);
	},
	deleteAntivirusRule : function(params,onSuccess,onError){
		this.callApi("/instance/vm/deleteCloudAntivirusRule", params, onSuccess, onError);
	},
	//扫描主机查询
	queryAntiVirusScans : function(params,onSuccess,onError){
		this.callApi("/instance/vm/cloudAntivirusVmList", params, onSuccess, onError);
	},
	//扫描开关
	queryAntiVirusOpenStatus : function(vmid,onSuccess,onError){
		this.callApi("/instance/vm/queryCloudAntivirusOpenStatus", {"vmId" : vmid}, onSuccess, onError);
	},
	openOrCloseAntiVirus : function(params,onSuccess,onError){
		this.callApi("/instance/vm/openOrCloseCloudAntivirus", params, onSuccess, onError);
	},
	//自动\手动规则配置
	createOrUpdateAntiVirus : function(params,onSuccess,onError){
		this.callApi("/instance/vm/createOrUpdateCloudAntivirus", params, onSuccess, onError);
	},
	//关联资源
	getRuleInfoBySubId : function(params,onSuccess,onError){
		this.callApi("/instance/vm/getRuleInfoBySubId", params, onSuccess, onError);
	},
	//扫描日志查询
	describeAntivirusLogs : function(params,onSuccess,onError){
		this.callApi("/instance/vm/describeCloudAntivirusLogs", params, onSuccess, onError);
	},
	//扫描结果查询
	queryAntiVirusResults : function(params, onSuccess,onError){
		this.callApi("/instance/vm/queryCloudAntivirusEvent", params, onSuccess, onError);
	}
};
