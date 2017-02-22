/**
 * 防病毒规则
 */
var AntiVirusRule = {
	datatable : null,
	instances : [],
	currentRule : null,
	scope: "rule",
	ScanAction : {
		"INTELLIACTION" : "默认处理措施",
		"CUSTOMACTION" : "自定义处理措施"
	},
	FileToScan : {
		"ALLFILES" : "所有文件",
		"INTELLISCAN" : "系统文件"
	},
	RealAction : {
		"UNSPECIFIED" : "未指定",
		"PASS" : "不予处理",
		"DELETE" : "删除",
		"QUARANTINE" : "隔离",
		"DENY_ACCESS" : "拒绝访问",
		"CLEAN" : "清除"
	},
	_init : function(){
		AntiVirusRule._refresh();
		//$("#details").show();
		$("div.details_content[scope !='" + AntiVirusRule.scope+"']").addClass("hide");
		$("div.details_content[scope ='" + AntiVirusRule.scope+"']").removeClass("hide");
	},
	_query : function(condition, callback) {
		AntiVirus.service.queryAntiVirusRules(condition, function(data) {
			AntiVirusRule.instances = data;	
			if(callback && typeof callback == 'function')		callback(result);
		},function onError(error){
		});	
	},
	_renderDataTable : function() {
		if(AntiVirusRule.datatable == null){
			AntiVirusRule._initDataTable(AntiVirusRule.instances);
		}else{
			AntiVirusRule.datatable.updateData(AntiVirusRule.instances);
		}
	},
	_initDataTable : function(data) {
		AntiVirusRule.datatable = new com.skyform.component.DataTable();
		AntiVirusRule.datatable.renderByData("#ruleTable", {
			"data" : data,				
			"pageSize" : 5,
			"onColumnRender" : function(columnIndex,columnMetaData,columnData) {
				 var text = columnData[''+columnMetaData.name] || "";
				 if(columnIndex ==0) {
						 text = '<input type="checkbox" name="subsid" value="'+text+'">';
				 } else if ("createDate" == columnMetaData.name) {
					 if(columnData.createDate){
							var ct = eval('(' + "{Date: new Date(" + columnData.createDate + ")}" + ')');
							var time = ct["Date"];
							text = time.format('yyyy-MM-dd hh:mm:ss');
						}else{
							text = "";
						}
				 } else if("scanAction" == columnMetaData.name) {
					 text = AntiVirusRule.ScanAction[text];
				 } else if("fileToScan" == columnMetaData.name) {
					 text = AntiVirusRule.FileToScan[text];
				 } else if("scanCustomActionForGeneric" == columnMetaData.name 
						 || "firstScanAction" == columnMetaData.name
						 || "secondScanAction" == columnMetaData.name) {
					 text = AntiVirusRule.RealAction[text];
				 } else if("subStatus" == columnMetaData.name) {
					 text = com.skyform.service.StateService.commonState[text];
				 } 
				 return text;
			}, 
			"afterRowRender" : function(rowIndex,data,tr){
				tr.attr("subsid", data.subsid);
				tr.attr("status", data.subStatus);
				AntiVirusRule.bindEventForTr(rowIndex, data, tr);
			},
			"afterTableRender" : function() {
				AntiVirusRule._bindEvent();
				if(AntiVirusRule.instances.length > 0){
					var firstOne = $("#ruleTable input[type='checkbox']:checked")[0];
					AntiVirusRule._renderDetail($(firstOne).attr("subsid"));
				}
			}
		});
		AntiVirusRule.datatable.addToobarButton("#toolbar-1");
		AntiVirusRule.datatable.enableColumnHideAndShow("right");
	},
	bindEventForTr : function(rowIndex, data, tr){
		//right click event
		$(tr).unbind().mousedown(function(e){
			if (3 == e.which) {
				$("#ruleTable input[type='checkbox']").attr("checked", false);
				$("#ruleTable .checkAll").attr("checked", false);
				tr.find("input[type='checkbox']").attr("checked", true);
				document.oncontextmenu = function() {
					return false;
				}
				var screenHeight = $(document).height();
				var top = e.pageY;
				if (e.pageY >= screenHeight / 2) {
					top = e.pageY - $("#rule-contextMenu").height();
				}
				$("#rule-contextMenu").hide();
				$("#rule-contextMenu").attr("style", "display: block; position: absolute; top:" +top + "px; left:" + e.pageX+ "px; width: 180px;");
				$("#rule-contextMenu").show();
				e.stopPropagation();
				AntiVirusRule.checkSelected(data);
				AntiVirusRule.currentRule = data;
			}
			AntiVirusRule._renderDetail(data.subsid);
			AntiVirusRule.setSelectRowBackgroundColor(tr);
		});
		//click event
		$(tr).click(function() {
			AntiVirusRule.checkSelected(tr);
			var checked = $(this).find("td").find("input[type='checkbox']").attr("checked");
			if(checked=="checked"){
				AntiVirusRule.currentRule = data;
			}
		});
	},
	_bindEvent : function(){
		$(".checkAll").unbind("click").bind("click", function(){
			var checked = $(this).attr("checked");
			if(checked=="checked") {
				$("#ruleTable input[type='checkbox']").attr("checked", true);
			} else {
				$("#ruleTable input[type='checkbox']").attr("checked", false);
			}
			AntiVirusRule.checkSelected();
		});
		$("#rule-contextMenu li").unbind("mousedown").bind('mousedown', function(e) {
			$("#rule-contextMenu").hide();
			if (!$(this).hasClass("disabled"))	AntiVirusRule.onOptionSelected($(this).attr("action"));
		});
		$("#btn-rule-refresh").unbind("click").bind("click", function(){
			$(".checkAll").attr("checked", false);
			AntiVirusRule._refresh();
		});
	},
	setSelectRowBackgroundColor : function(handler) {
		$("#content_container_1 tr").css("background-color","");
		handler.css("background-color","#d9f5ff");
	},
	_refresh : function(params) {
		AntiVirusRule.checkSelected();
		params = params ? params : "";
		AntiVirusRule._query(params, function(data) {
			$("#load_waiting_tbl_1").hide();
			if(data){
				AntiVirusRule._renderDataTable();
			}
		},function onError(error){
			$.growlUI(Dict.val("common_tip"), Dict.val("common_query_error")+error);
		});	
	},
	_renderDetail : function(subsid) {
		if (subsid==null) return;
		$("#rule-relations").html("");
		com.skyform.service.vmService.listRelatedInstances(subsid, function(data) {
			var array = data;
			if(array == null || array.length == 0) {
				return;
			}else{
				$("#rule-relations").empty();
				var dom = "";
				$(array).each(function(i) {
					var _state = com.skyform.service.StateService.commonState[array[i].state];
					dom += "<li class=\"detail-item\">"
						+"<span>"+array[i].subsid+"</span>&nbsp;&nbsp;&nbsp;&nbsp;"
						+"<span>"+array[i].templateType+"</span>&nbsp;&nbsp;&nbsp;&nbsp;"
						+"<span>"+array[i].instanceName+"</span>&nbsp;&nbsp;&nbsp;&nbsp;"							
						+"<span>"+_state+"</span>"
						+"</li>";	
				});
				$("#rule-relations").append(dom);
			}
		},function onError(error){
		});	
	},
	checkSelected : function(tr){
		$(".process").addClass("disabled");
		var selectBoxes = $("#ruleTable input[type='checkbox']:checked");
		var oneSelected  = selectBoxes.length == 1;
		if(selectBoxes.length > 1) {
			$("#rule-contextMenu").hide();
		}
		var status = $(selectBoxes[0]).parents("tr").attr("status");
		var allInstanceHasTheSameState = true;
		$(selectBoxes).each(function(index,checkbox){
			var _status = $(checkbox).parents("tr").attr("status");
			if(_status != status) {
				allInstanceHasTheSameState = false;
				return false;
			}
		});
		$(".process").each(function(index, operation){
			var condition = $(operation).attr("condition");
			var action = $(operation).attr("action");
			var enabled = true;
			eval("enabled=("+condition+")");
			if(enabled) {
				$(operation).removeClass("disabled");
				$(operation).unbind("click").click(function(){
					AntiVirusRule.onOptionSelected(action||"");
				});
			} else {
				$(operation).addClass("disabled");
				$(operation).unbind();
			}
		});
	},
	onOptionSelected : function(action) {
		if ("rule-create" == action) {
			AntiVirusRule._create(); 
		} else if ("rule-rename" == action) {
			AntiVirusRule._rename();
		} else if ("rule-modify" == action) {
			AntiVirusRule._modify();
		} else if ("rule-destroy" == action) {
			AntiVirusRule._destroy();
		}
	},
	_create : function(){
		AntiVirusRule.resetCreateModal();
		$("#createModal").modal("show");
		$("#createSubmit").unbind("click").bind("click", function(){
			if(!AntiVirusRule.validateModalForm($("#createModal"))) {
				return;
			}
			var instanceName = $("#createModal input[name='instanceName']").val().trim() ? 
					$("#createModal input[name='instanceName']").val() : $("#createModal input[name='instanceName']").attr("placeholder");
			var rule_params = $("#createForm").getFormData();
			rule_params.productId = 20020;
			rule_params.instanceName = instanceName;
			rule_params.intelliTrapEnabled = "False";
			rule_params.scanFilesActivity = "READ_WRITE";
			var params = {
					"period": 9999,
					"count": 1,
					"productList": [rule_params]
			}
			$("#createModal").modal("hide");
			AntiVirus.service.createAntivirusRule(params, function(data) {
				AntiVirusRule._refresh();
				$.growlUI(Dict.val("common_tip"), "防病毒规则创建成功！");
			},function onError(error){
				$.growlUI(Dict.val("common_tip"), error);
			});	
		});
	},
	resetCreateModal : function() {
		$("#createModal input[name='instanceName']").val("");
		$("#createModal select").val("");
		$("#addtion").hide();
		$("#createModal select[name='secondScanAction']").addClass("disabled", "disabled");
	},
	validateModalForm : function(modal) {
		var scanAction = modal.find("select[name='scanAction']").val();
		if(scanAction=="CUSTOMACTION") {
			var firstScanAction = modal.find("select[name='firstScanAction']").val();
			var secondScanAction = modal.find("select[name='secondScanAction']").val();
			if(firstScanAction=="" || secondScanAction==""){
				return false;
			}
		}
		return true;
	},
	scanActionChange : function() {
		var scanAction = $("#createModal select[name='scanAction']").val();
		if(scanAction=="INTELLIACTION") {
			$("#addtion").hide();
		} else if(scanAction=="CUSTOMACTION") {
			$("#addtion").show();
		}
	},
	firstScanActionChange : function() {
		var firstScanAction = $("#createModal select[name='firstScanAction']").val();
		if(firstScanAction=="CLEAN") {
			$("#createModal select[name='secondScanAction']").removeAttr("disabled");
		} else {
			$("#createModal select[name='secondScanAction']").val("PASS");
			$("#createModal select[name='secondScanAction']").attr("disabled", "disabled");
		}
	},
	_rename : function(){
		$("#renameModal input[name='instanceName']").val(AntiVirusRule.currentRule.instanceName);
		$("#renameModal .error").hide();
		$("#renameModal").modal("show");
		$("#renameSubmit").unbind("click").bind("click", function(){
			var instanceName = $("#renameModal input[name='instanceName']").val().trim();
			if(instanceName){
				$("#renameModal .error").hide();
			} else {
				$("#renameModal .error").show();
				return;
			}
			if(instanceName==AntiVirusRule.currentRule.instanceName){
				$("#renameModal").modal("hide");
				$.growlUI(Dict.val("common_tip"),Dict.val("common_modify_success"));
				return;
			}
			$("#renameModal").modal("hide");
			com.skyform.service.vmService.updateNameAndDescription(AntiVirusRule.currentRule.subsid, instanceName, null, function onUpdateSuccess(result){
				AntiVirusRule._refresh();
				$.growlUI(Dict.val("common_tip"),Dict.val("common_modify_success"));
			},function onUpdateFailed(errorMsg){
				$.growlUI(Dict.val("common_error"),Dict.val("common_modify_filed") + errorMsg);
			});
		});
	},
	_modify : function() {
		$("#modifyModal").modal("show");
		var scanAction = AntiVirusRule.currentRule.scanAction;
		if(scanAction=="INTELLIACTION") {
			$("#addtion2").hide();
		} else if(scanAction=="CUSTOMACTION") {
			$("#addtion2").show();
		}
		$("#modifyForm").setData(AntiVirusRule.currentRule);
		$("#modifySubmit").unbind("click").bind("click", function(){
			if(!AntiVirusRule.validateModalForm($("#modifyModal"))) {
				return;
			}
			var rule_params = $("#modifyForm").getFormData();
			rule_params.productId = 20020;
			rule_params.intelliTrapEnabled = "False";
			rule_params.scanFilesActivity = "READ_WRITE";
			rule_params.ID = AntiVirusRule.currentRule.id;
			var params = {
					"period": 9999,
					"count": 1,
					"productList": [rule_params]
			}
			$("#modifyModal").modal("hide");
			AntiVirus.service.modifyAntivirusRule(params, function(data) {
				AntiVirusRule._refresh();
				$.growlUI(Dict.val("common_tip"), "防病毒规则修改成功！");
			},function onError(error){
				$.growlUI(Dict.val("common_tip"), error);
			});
		});
	},
	scanActionChange2 : function() {
		var scanAction = $("#modifyModal select[name='scanAction']").val();
		if(scanAction=="INTELLIACTION") {
			$("#addtion2").hide();
		} else if(scanAction=="CUSTOMACTION") {
			$("#addtion2").show();
		}
	},
	firstScanActionChange2 : function() {
		var firstScanAction = $("#modifyModal select[name='firstScanAction']").val();
		if(firstScanAction=="CLEAN") {
			$("#modifyModal select[name='secondScanAction']").removeAttr("disabled");
		} else {
			$("#modifyModal select[name='secondScanAction']").val("PASS");
			$("#modifyModal select[name='secondScanAction']").attr("disabled", "disabled");
		}
	},
	_destroy : function() {
		var content = $("#destroyModal .modal-body p").text();
		$("#destroyModal .modal-body p").text(content.replace("@", AntiVirusRule.currentRule.instanceName));
		$("#destroyModal").modal("show");
		$("#destroySubmit").unbind("click").bind("click", function(){
			var params = {"subscriptionId" : AntiVirusRule.currentRule.subsid};
			$("#destroyModal").modal("hide");
			AntiVirus.service.deleteAntivirusRule(params, function(data) {
				AntiVirusRule._refresh();
				$.growlUI(Dict.val("common_tip"), "防病毒规则销毁成功！");
			},function onError(error){
				$.growlUI(Dict.val("common_tip"), error);
			});	
		});
	}
};
