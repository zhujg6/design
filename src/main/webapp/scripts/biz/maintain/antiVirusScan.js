/**
 * 防病毒扫描设置
 */
var AntiVirusScan = {
	datatable : null,
	instances : [],
	ruleDatatable : null,
	ruleDatatable2 : null,
	rules : [],
	currentInstance : null,
	scope: "scan",
	switchValue : "ON",
	Status : {
		"opening" : "<span href=\"#\" data-toggle=\"popover\" title=\"正在开启\" class=\"state-blue\"><i class=\"icon-spinner icon-spin blue mr5\"></i>正在开启</span>",
		"running" : "<span href=\"#\" data-toggle=\"popover\" title=\"已开启\" class=\"state-green\"><i class=\"icon-circle green mr5\"></i>已开启</span>",
		"on" : "<span href=\"#\" data-toggle=\"popover\" title=\"已开启\" class=\"state-green\"><i class=\"icon-circle green mr5\"></i>已开启</span>",
		"closed" : "<span href=\"#\" data-toggle=\"popover\" title=\"已关闭\" class=\"state-gray\"><i class=\"icon-off darkgray mr5\"></i>已关闭</span>",
		"off" : "<span href=\"#\" data-toggle=\"popover\" title=\"已关闭\" class=\"state-gray\"><i class=\"icon-off darkgray mr5\"></i>已关闭</span>",
		"closing" : "<span href=\"#\" data-toggle=\"popover\" title=\"正在关闭\" class=\"state-copper\"><i class=\"icon-spinner icon-spin blue mr5\"></i>正在关闭</span>",
		"error" : "<a href=\"http://wpa.qq.com/msgrd?v=3&uin=4000111000&site=qq&menu=yes\" target=\"_blank\" data-toggle=\"popover\" title=\"错误（点击获得QQ客户帮助）\" class=\"state-red\"><i class=\"icon-warning-sign red mr5\"></i>操作错误</a>"
	},
	RunState : {
		"complete" : "扫描完成",
		"scanning" : "扫描中",
		"error" : "操作错误"
	},
	_init : function(){
		AntiVirusScan._refresh();
		//$("#details").show();
		$("div.details_content[scope !='" + AntiVirusScan.scope+"']").addClass("hide");
		$("div.details_content[scope ='" + AntiVirusScan.scope+"']").removeClass("hide");
	},
	_query : function(condition, callback) {
		AntiVirus.service.queryAntiVirusScans(condition, function(data) {
			AntiVirusScan.instances = data;	
			if(callback && typeof callback == 'function')		callback(result);
		},function onError(error){
		});	
	},
	_renderDataTable : function() {
		if(AntiVirusScan.datatable == null){
			AntiVirusScan._initDataTable(AntiVirusScan.instances);
		}else{
			AntiVirusScan.datatable.updateData(AntiVirusScan.instances);
		}
	},
	_initDataTable : function(data) {
		AntiVirusScan.datatable = new com.skyform.component.DataTable();
		AntiVirusScan.datatable.renderByData("#scanTable", {
			"data" : data,				
			"pageSize" : 5,
			"onColumnRender" : function(columnIndex,columnMetaData,columnData) {
				 var text = columnData[''+columnMetaData.name] || "";
				 if(columnIndex ==0) {
					 text = '<input type="checkbox" name="instanceid" value="'+columnData.vmId+'" vmname="'+columnData.vmName+'" uuid="'+columnData.uuid+'">';
				 } else if("vmState" == columnMetaData.name) {
					 text = com.skyform.service.StateService.getState("vm",columnData.vmState);
				 } else if("os" == columnMetaData.name) {
					 text = "";
					 if(columnData.cpu){
						 text += "CPU:" + columnData.cpu + "核,";
					 }
					 if(columnData.mem){
						 text += "内存:" + columnData.mem + "G,";
					 }
					 if(columnData.os){
						 text += " " + columnData.os;
					 }
				 } else if("open_state" == columnMetaData.name) {
					 var openState = columnData.open_state2==null?columnData.open_state : columnData.open_state2;
					 text = AntiVirusScan.Status[openState];
				 } 
				 return text;
			}, 
			"afterRowRender" : function(rowIndex,data,tr){
				tr.attr("instanceid", data.vmId);
				tr.attr("openState", data.open_state2==null?data.open_state : data.open_state2);
				tr.attr("vmState", data.vmState);
				AntiVirusScan.bindEventForTr(rowIndex, data, tr);
			},
			"afterTableRender" : function() {
				AntiVirusScan._bindEvent();
				if(AntiVirusScan.instances.length > 0){
					var firstOne = $("#scanTable tbody input[type='checkbox']")[0];
					AntiVirusScan._renderDetail($(firstOne).attr("instanceid"));
				}
			}
		});
		AntiVirusScan.datatable.addToobarButton("#toolbar-2");
		AntiVirusScan.datatable.enableColumnHideAndShow("right");
	},
	bindEventForTr : function(rowIndex, data, tr){
		//right click event
		$(tr).unbind().mousedown(function(e){
			if (3 == e.which) {
				$("#scanTable input[type='checkbox']").attr("checked", false);
				$("#scanTable .checkAll").attr("checked", false);
				tr.find("input[type='checkbox']").attr("checked", true);
				document.oncontextmenu = function() {
					return false;
				}
				var screenHeight = $(document).height();
				var top = e.pageY;
				if (e.pageY >= screenHeight / 2) {
					top = e.pageY - $("#scan-contextMenu").height();
				}
				$("#scan-contextMenu").hide();
				$("#scan-contextMenu").attr("style", "display: block; position: absolute; top:" +top + "px; left:" + e.pageX+ "px; width: 180px;");
				$("#scan-contextMenu").show();
				e.stopPropagation();
				AntiVirusScan.checkSelected(data);
				AntiVirusScan.currentInstance = data;
			}
			AntiVirusScan._renderDetail(data.vmId);
			AntiVirusScan.setSelectRowBackgroundColor(tr);
		});
		//click event
		$(tr).click(function() {
			AntiVirusScan.checkSelected(tr);
			var checked = $(this).find("td").find("input[type='checkbox']").attr("checked");
			if(checked=="checked"){
				AntiVirusScan.currentInstance = data;
			}
		});
	},
	_bindEvent : function(){
		$(".checkAll").unbind("click").bind("click", function(){
			var checked = $(this).attr("checked");
			if(checked=="checked") {
				$("#scanTable input[type='checkbox']").attr("checked", true);
			} else {
				$("#scanTable input[type='checkbox']").attr("checked", false);
			}
			AntiVirusScan.checkSelected();
		});
		$("#scan-contextMenu li").unbind("mousedown").bind('mousedown', function(e) {
			$("#scan-contextMenu").hide();
			if (!$(this).hasClass("disabled"))	AntiVirusScan.onOptionSelected($(this).attr("action"));
		});
		$("#btn-scan-refresh").unbind("click").bind("click", function(){
			$(".checkAll").attr("checked", false);
			AntiVirusScan._refresh();
		});
		$("#switchModal .switch").on("switch-change", function(e, data){
			if(data.value) {
				AntiVirusScan.switchValue = "ON";
			} else {
				AntiVirusScan.switchValue = "OFF";
			}
		});
	},
	setSelectRowBackgroundColor : function(handler) {
		$("#content_container_2 tr").css("background-color","");
		handler.css("background-color","#d9f5ff");
	},
	_refresh : function(params) {
		params = params ? params : "";
		AntiVirusScan._query(params, function(data) {
			$("#load_waiting_tbl_2").hide();
			if(data){
				AntiVirusScan._renderDataTable();
			}
		},function onError(error){
			$.growlUI(Dict.val("common_tip"), Dict.val("common_query_error")+error);
		});	
		AntiVirusScan.checkSelected();
	},
	_renderDetail : function(id) {
		if (id==null) return;
		$("#scan-relations").html("");
		var params = {"vmId" : id};
		AntiVirus.service.getRuleInfoBySubId(params, function(data) {
			var array = data;
			if(array == null || array.length == 0) {
				return;
			}else{
				$("#scan-relations").empty();
				var dom = "";
				$(array).each(function(i) {
					if(array[i].manualId){
						dom += "<h5>手动扫描</h5>"
							+"<li class=\"detail-item\"><span>"+array[i].manualId+"</span><span>防病毒规则</span><span>"+array[i].manualName+"</span></li>";
					}
					if(array[i].realTimeId){
						dom += "<h5>自动扫描</h5>"
							+"<li class=\"detail-item\"><span>"+array[i].realTimeId+"</span><span>防病毒规则</span><span>"+array[i].realTimeName+"</span></li>";
					}
				});
				$("#scan-relations").append(dom);
			}
		},function onError(error){
		});	
		$("#opt_logs").empty();
		var params = {"vmId" : id};
		AntiVirus.service.describeAntivirusLogs(params, function(data) {
			$(data).each(function(i,v){
				var _createTime = "";
				if(v.createTime){
					var ct = eval('(' + "{Date: new Date(" +v.createTime + ")}" + ')');
					var time = ct["Date"];
					_createTime = time.format('yyyy-MM-dd hh:mm:ss');
				}
				$("<li class='detail-item'><span>" + _createTime+ "  手动扫描  " + AntiVirusScan.RunState[v.runState]+ "</span></li>").appendTo($("#opt_logs"));
			});
		},function onError(error){
		});	
	},
	checkSelected : function(tr){
		$(".proce").addClass("disabled");
		var selectBoxes = $("#scanTable input[type='checkbox']:checked");
		var oneSelected  = selectBoxes.length == 1;
		if(selectBoxes.length > 1) {
			$("#scan-contextMenu").hide();
		}
		var vmState = $(selectBoxes[0]).parents("tr").attr("vmState");
		var allInstanceHasTheSameVMState = true;
		$(selectBoxes).each(function(index,checkbox){
			var _status = $(checkbox).parents("tr").attr("vmState");
			if(_status != status) {
				allInstanceHasTheSameVMState = false;
				return false;
			}
		});
		var openState = $(selectBoxes[0]).parents("tr").attr("openState");
		var allInstanceHasTheSameState = true;
		$(selectBoxes).each(function(index,checkbox){
			var _status = $(checkbox).parents("tr").attr("openState");
			if(_status != status) {
				allInstanceHasTheSameState = false;
				return false;
			}
		});
		$(".proce").each(function(index, operation){
			var condition = $(operation).attr("condition");
			var action = $(operation).attr("action");
			var enabled = true;
			eval("enabled=("+condition+")");
			if(enabled) {
				$(operation).removeClass("disabled");
				$(operation).unbind("click").click(function(){
					AntiVirusScan.onOptionSelected(action||"");
				});
			} else {
				$(operation).addClass("disabled");
				$(operation).unbind();
			}
		});
	},
	onOptionSelected : function(action) {
		if ("scan-switch" == action) {
			AntiVirusScan._scanSwitch(); 
		} else if ("scan-auto-setting" == action) {
			AntiVirusScan._scanAutoSetting();
		} else if ("scan-manual-setting" == action) {
			AntiVirusScan._scanManualSetting();
		} else if ("scan-result" == action) {
			AntiVirusScan._scanResult();
		}
	},
	/***********防病毒开关*************/
	_scanSwitch : function() {
		var instanceid = AntiVirusScan.currentInstance.vmId;
		var switchStatus = false;
		AntiVirus.service.queryAntiVirusOpenStatus(instanceid, function(data) {
			if(data.status=="ON"){
				switchStatus = true;
			} 
			$("#switchModal .switch").bootstrapSwitch("setState", switchStatus);
		},function onError(error){
		});	
		$("#switchModal").modal("show");
		$("#switchSubmit").unbind("click").bind("click", function(e){
			if($(this).hasClass("disabled"))		return;
			var switchvalue = AntiVirusScan.switchValue;
			var params = {
			      "vmId" : instanceid,
			      "status" : switchvalue
			};
			$("#switchModal").modal("hide");
			AntiVirus.service.openOrCloseAntiVirus(params, function(data) {
				AntiVirusScan._refresh();
				$.growlUI(Dict.val("common_tip"), "防病毒扫描开关设置成功！");
			},function onError(error){
				$.growlUI(Dict.val("common_tip"), error);
			});	
		});
	},
	/**********自动扫描设置*************/
	_scanAutoSetting : function() {
		$("#autoScanModal").modal("show");
		AntiVirusScan._renderScanModal("#scanRuleTable");
		$("#autoScanSubmit").unbind("click").bind("click", function(e){
			var instanceid = AntiVirusScan.currentInstance.vmId;
			var ruleid = $("#scanRuleTable input[type='radio']:checked").val();
			var antiMalwareRealTimeScheduleID = $("#antiMalwareRealTimeScheduleID").val();
			var params = {
    			"vmId":instanceid,
			    "params":{
			        "realTimeId": ruleid,
			        "realTimeScheduleId": antiMalwareRealTimeScheduleID
			    }
			};
			$("#autoScanModal").modal("hide");
			AntiVirus.service.createOrUpdateAntiVirus(params, function(data) {
				AntiVirusScan._refresh();
				$.growlUI(Dict.val("common_tip"), "防病毒自动扫描设置成功！");
			},function onError(error){
				$.growlUI(Dict.val("common_tip"), error);
			});	
		});
	},
	_renderScanModal : function(containerid) {
		AntiVirusScan._getScanRules("", function(data) {
			if(data){
				AntiVirusScan._renderScanRuleDataTable(containerid);
			}
		},function onError(error){
			$.growlUI(Dict.val("common_tip"), Dict.val("common_query_error")+error);
		});	
	},
	_renderScanRuleDataTable : function(containerid) {
		if(containerid=="#scanRuleTable") {
			if(AntiVirusScan.ruleDatatable == null){
				AntiVirusScan._initRuleDataTable(AntiVirusScan.rules, containerid);
			}else{
				AntiVirusScan.ruleDatatable.updateData(AntiVirusScan.rules);
			}
		} else if(containerid=="#scanRuleTable2") {
			if(AntiVirusScan.ruleDatatable2 == null){
				AntiVirusScan._initRuleDataTable(AntiVirusScan.rules, containerid);
			}else{
				AntiVirusScan.ruleDatatable2.updateData(AntiVirusScan.rules);
			}
		}
	},
	_initRuleDataTable : function(data, containerid) {
		if(containerid=="#scanRuleTable") {
			AntiVirusScan.ruleDatatable = new com.skyform.component.DataTable();
			AntiVirusScan.ruleDatatable.renderByData(containerid, {
				"data" : data,				
				"pageSize" : 5,
				"onColumnRender" : function(columnIndex,columnMetaData,columnData) {
					 var text = columnData[''+columnMetaData.name] || "";
					 if(columnIndex ==0) {
							 text = '<input type="radio" name="ruleRadio" value="'+text+'">';
					 } else if("scanAction" == columnMetaData.name) {
						 text = AntiVirusRule.ScanAction[text];
					 } else if("scanCustomActionForGeneric" == columnMetaData.name 
							 || "firstScanAction" == columnMetaData.name
							 || "secondScanAction" == columnMetaData.name) {
						 text = AntiVirusRule.RealAction[text];
					 }
					 return text;
				}
			});
		} else if(containerid=="#scanRuleTable2") {
			AntiVirusScan.ruleDatatable2 = new com.skyform.component.DataTable();
			AntiVirusScan.ruleDatatable2.renderByData(containerid, {
				"data" : data,				
				"pageSize" : 5,
				"onColumnRender" : function(columnIndex,columnMetaData,columnData) {
					 var text = columnData[''+columnMetaData.name] || "";
					 if(columnIndex ==0) {
							 text = '<input type="radio" name="ruleRadio" value="'+text+'">';
					 } else if("scanAction" == columnMetaData.name) {
						 text = AntiVirusRule.ScanAction[text];
					 } else if("scanCustomActionForGeneric" == columnMetaData.name 
							 || "firstScanAction" == columnMetaData.name
							 || "secondScanAction" == columnMetaData.name) {
						 text = AntiVirusRule.RealAction[text];
					 }
					 return text;
				}
			});
		}
	},
	_getScanRules : function(condition, callback) {
		AntiVirus.service.queryAntiVirusRules(condition, function(data) {
			AntiVirusScan.rules = data;	
			if(callback && typeof callback == 'function')		callback(result);
		},function onError(error){
		});	
	},
	/**********手动扫描设置*************/
	_scanManualSetting : function() {
		$("#manualScanModal").modal("show");
		AntiVirusScan._renderScanModal("#scanRuleTable2");
		$("#manualScanSubmit").unbind("click").bind("click", function(e){
			var instanceid = AntiVirusScan.currentInstance.vmId;
			var ruleid = $("#scanRuleTable2 input[type='radio']:checked").val();
			var params = {
		    	"vmId":instanceid,
			    "params":{
			        "manualId":ruleid
			    }
			};
			$("#manualScanModal").modal("hide");
			AntiVirus.service.createOrUpdateAntiVirus(params, function(data) {
				AntiVirusScan._refresh();
				$.growlUI(Dict.val("common_tip"), "防病毒手动扫描设置成功！");
			},function onError(error){
				$.growlUI(Dict.val("common_tip"), error);
			});	
		});
	},
	/**********扫描结果*************/
	_scanResult : function() {
		//跳转
		$("#manager a[href='#result']").click();
	}
};
