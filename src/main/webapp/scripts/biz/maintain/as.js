window.Controller = {
	physicalManagerRoot : "/physical-manager/",	//目前没有物理机，该地址没有ip暂时废弃
	init : function(){
		AS.bindAction();
		AS.listAS();
	}
};
var AS = {
    wizard : null,
    chooseRowData : null,
	datatable : new com.skyform.component.DataTable(),
	datas : [],
	inited : false,
	serviceOfferingsData : [],
	portalType : Dcp.biz.getCurrentPortalType(),	//公有云
	service : com.skyform.service.autoScallingGroupService,
	inMenu : false,
	rowRefreshQueue : [],  //行刷新任务队列
	azSelect : null,
	//请求地址集合
	URL : {
		"putScalingPolicy" : Dcp.getContextPath() + "/pr/autoScalling?Action=PutScalingPolicy",		//创建伸缩策略
		"putLifecycleHook" : Dcp.getContextPath() +"/pr/autoScalling?PutLifecycleHook",	//创建hook
		"createAlarm" :  Dcp.getContextPath() + "/pr/ceilometer?alarms",	//创建自动伸缩组告警
		"executePolicy" : "http://172.29.3.2:8080/scaling/ExecutePolicy",
	    "phy_physicalList" : window.Controller.physicalManagerRoot + "physical/list/getPhysicalList"
	},
	ResourceType : {
		"VM" : "虚拟机",
		"PHYSICAL_MACHINE" : "物理机"
	},
	GroupType : {
		"ALARM_TRIGGERED" : "告警触发",
		"TIME_SCHEDULED"  : "定时触发"
	},
	TerminationPolicy : {
		"NEWEST" : "最新的",
		"OLDEST" : "最老的",
		"RANDOM" : "随机的"
	},
	PolicyAction : {
		"SCALE_OUT" : "创建新实例",
		"SCALE_OUT_START" : "根据步长逐个对实例开机",
		"SCALE_IN" : "销毁选定的实例",
		"SCALE_IN_STOP" : "根据步长逐个对实例关机"
	},
	PolicyType : {
		"ALARM_TRIGGERED" : "告警触发",
		"TIME_SCHEDULED" : "定时触发"
	},
	ExecutionTime : {
		"BEFORE_ADD_INSTANCE" : "添加实例之前",
		"AFTER_ADD_INSTANCE" : "添加实例之后",
		"BEFORE_REMOVE_INSTANCE" : "删除实例之前",
		"AFTER_REMOVED_INSTANCE" : "删除实例之后"
	},
	Status : {
		"CREATED" : "创建完成",
		"SCALING_OUT" : "扩容中",
		"SCALING_IN" : "缩容中",
		"COOLINGDOWN" : "冷却中",
		"COOLDOWN_OVER" : "冷却完成",
		"READY" : "就绪"
	},
	PolicyStatus : {
		"EXECUTING" : "策略执行中",
		"READY" : "就绪",
		"COOLINGDOWN" : "冷却中",
		"COOLDOWN_OVER" : "冷却完成"
	},
	VMState : {
		"Running" : "运行中",
		"Stopped" : "关机"
	},
/************function*******************/
	handlerRefresh: function(groupid){
		//如果此伸缩组已经有了定时器，则不用再设置
        var queueLength = AS.rowRefreshQueue.length, groupIntidflag = false;
        for(var i=0;i<queueLength;i++) {
            if(AS.rowRefreshQueue[i].id == groupid) {
            	groupIntidflag = true;
                break;
            };
        };
        if(groupIntidflag) return;
		var intevalid = window.setInterval("AS.processTasks('"+groupid+"');", 10*1000);
	    var groupInterval = {
	        id:groupid,
	        intevalid:intevalid
	    };
	    AS.rowRefreshQueue.push(groupInterval);
	},
	processTasks : function(groupid) {
        AS.queryById(groupid, function(result) {
			var newData = result;
			AS.updateTableRow(groupid, newData);
			if(newData.Status=="READY"){
				AS.cancelRowRefresh(groupid);
			}
		});
	},
	//更新行内容
	updateTableRow:function(id, updateColumeData){
		var row = null;
		var checked = false;
		$("#asTable input[type='checkbox']").each(function(index, item){
			if($(item).attr("id")==id){
				row = $(item).parent("td").parent("tr");
				checked = $(item).attr("checked");
			}
		});
		if(row){
			AS.datatable.updateRow(row, updateColumeData, checked);
		}
	},
	//取消定时器
	cancelRowRefresh: function(id){
		var queueLength = AS.rowRefreshQueue.length;
        for(var i=0;i<queueLength;i++) {
        	var rowQueue = AS.rowRefreshQueue[i];
            if(rowQueue.id == id) {
            	window.clearInterval(rowQueue.intevalid);
            	//更新队列
            	AS.rowRefreshQueue.splice(i, 1);
            	AS.rowRefreshQueue--;
            };
        };
	},
	bindAction: function() {
		$("#moreAction").attr("disabled","disabled");
		$("#dropdown-menu li").unbind('click').bind('click', function(e) {
			AS.onOptionSelected($(this).attr("action"));
		});
		$("#updateData").unbind().click(function() {
			AS.listAS();
		});
		$("a#createAS").unbind().click(function() {
			AS.createAS();
		});
		$("a#policyMag").unbind().click(function(e) {
			if($(this).hasClass("disabled"))		return;
			AS.policyMag();
		});
		$('#myTab a').on('shown.bs.tab', function (e) {
	        e.preventDefault();//阻止a链接的跳转行为 
	        $(this).tab('show');//显示当前选中的链接及关联的content 
	    });
		// 为table的右键菜单添加监听事件
		$("#contextMenu").unbind("mouseover").bind('mouseover', function() {
			AS.inMenu = true;
		});
		$("#contextMenu").unbind("mouseout").bind('mouseout', function() {
			AS.inMenu = false;
		});
		$("#contextMenu li").unbind("mousedown").bind('mousedown', function(e) {
			$("#contextMenu").hide();
			if (!$(this).hasClass("disabled"))	AS.onOptionSelected($(this).attr("action"));
		});
		$("body").unbind('mousedown').bind('mousedown', function() {
			if (!AS.inMenu) {
				$("#contextMenu").hide();
			}
		});
		//table  checkbox
		$("#asTable input[type='checkbox']").unbind('click').bind('click', function(e) {
			AS.checkButton(e);
		});
		//policy management
		$("#policyMagModal").find("button.edit").unbind("click").bind("click", function(e){
			if($(this).hasClass("disabled"))	return;
			var prop = $(this).attr("prop");
			var container = $(this).parents(".tab-pane").find("form")[0];
			if(prop=="edit"){
				$(this).attr("prop", "editConfirm");
				$(this).text("保存");
				AS.editPolicy(container);
			} else if(prop=="editConfirm"){
				var type = $(this).parents(".tab-pane").attr("id");
				AS.editConfirmPolicy(container, type);
			}
		});
		$("#policyMagModal").find("button.delete").unbind("click").bind("click", function(e){
			if($(this).hasClass("disabled"))	return;
			$("#policyMagModal").modal("hide");
			var container = $(this).parents(".tab-pane").find("form")[0];
			var policyId = $(container).attr("policyId");
			var name = $(container).find("input[name='PolicyName']").val().trim();
			AS.deletePolicy(policyId, name);
		});
	},
	listAS : function() {
		if(AS.inited){
			AS.datatable.container.find("tbody").html("<tr ><td colspan='7' style='text-align:center;'><img src='"+CONTEXT_PATH+"/images/loader.gif'/><strong>正在获取数据，请稍后....</strong></td></tr>");
		}
		AS.service.list("", function(result) {
			$("#load_waiting_tbl").hide();
			AS.datas = result.DescribeAutoScalingGroupsResponse.scalinggroup;
			AS.renderDataTable(AS.datas);
	    }, function(error){
	    	console.log(error);
	    });
	},
	queryById: function(id, callback) {
		if(id==null || id==undefined)	callback(null);
		AS.service.list("&AutoScalingGroupId="+ id, function(result) {
			var data = result.DescribeAutoScalingGroupsResponse.scalinggroup;
			if(data && data.length > 0){
				var group = data[0];
				group.policy = [];
				AS.service.describePolicies("&AutoScalingGroupId="+ id, 
					function(msg) {
						var result = msg.DescribePoliciesResponse;
						if(result && result.scalingpolicy) {
							group.policy = result.scalingpolicy;
						}
						callback(group);
					}, function(){
						callback(group);
					}
				);
			}else {
				callback(null);
			}
	    }, function(){
	    	callback(null);
	    });
	},
	renderDataTable : function(data) {
		if(AS.inited){
			AS.datatable.updateData(data);
			return;
		}
		AS.datatable.renderByData(
			"#asTable", 
			{
				"data" : data, // 要渲染的数据选择器					
				"pageSize" : 5,	//每页显示的记录条数
				"onColumnRender" : function(columnIndex,columnMetaData, columnData) {
					var text = columnData[columnMetaData.name];
					if(columnMetaData.name=='id') {
			              text = '<input type="checkbox" id="' + columnData.id + '">';
			        }else if("ID" == columnMetaData.name) {
			              text = columnData.id;
			        } else if(columnMetaData.name == "AutoScalingGroupName"){
	                    var name = columnData.AutoScalingGroupName;
	                    text = name.length>10 ? "<span title='"+name+"'>"+name.slice(0,15)+"..."+"</span>":name;
	                }else if(columnMetaData.name == "ResourceType") {
			        	text = AS.ResourceType[columnData.ResourceType];
			        } else if ("Status" == columnMetaData.name) {
			        	text = AS.Status[columnData.Status];
			        } else if(columnMetaData.name == "Created") {
			        	var date = columnData.Created;
                        var datesub = date.substring(0, date.indexOf("+"));
                        text = datesub.substring(0, datesub.indexOf("T")) + " " + datesub.substring(datesub.indexOf("T") + 1);
			        }
					return text;
				},
				"afterRowRender" : function(rowIndex, data, tr) {
					AS.bindEventForTr(rowIndex, data, tr);
				},
				"afterTableRender" : function() {
					var firstRow = $("#asTable tbody").find("tr:eq(0)");
					AS.setSelectRowBackgroundColor(firstRow);
					firstRow.find("input[type='checkbox']").attr("checked", true);
					AS.checkButton(firstRow.find("input[type='checkbox']"));
				}
			}
		);
		AS.inited = true;
		AS.datatable.addToobarButton("#toolbar4tbl");
		AS.datatable.enableColumnHideAndShow("right");
	},
	bindEventForTr : function(rowIndex, data, tr) {
		$(tr).unbind().mousedown(function(e){
			if (3 == e.which) {
				$("#asTable input[type='checkbox']").attr("checked", false);
				tr.find("input[type='checkbox']").attr("checked", true);
				$("#moreAction").removeClass("disabled");
				document.oncontextmenu = function() {
					return false;
				}
				var screenHeight = $(document).height();
				var top = e.pageY;
				if (e.pageY >= screenHeight / 2) {
					top = e.pageY - $("#contextMenu").height();
				}
				$("#contextMenu").hide();
				$("#contextMenu").attr( "style", "display: block; position: absolute; top:" + top + "px; left:" + e.pageX + "px; width: 180px;");
				$("#contextMenu").show();
				e.stopPropagation();
				AS.checkButton(tr.find("input[type='checkbox']"));
			}
			AS.setSelectRowBackgroundColor(tr);
		});
		$(tr).click(function() {
			AS.checkButton(tr.find("input[type='checkbox']"));
		});
	},
	setSelectRowBackgroundColor : function(handler) {
		$("#content_container tr").css("background-color","");
		handler.css("background-color","#d9f5ff");
	},
	onOptionSelected : function(action){
		if ("dilatation" == action) { 
			//只有就绪状态的才可以进行扩容、缩容、释放
			if(AS.chooseRowData.CurrentCount>=AS.chooseRowData.MaxSize) {
				$.growlUI(Dict.val("common_tip"), "当前实例个数小于最大实例个数时才可以进行该项操作！");
	    		return;
			} 
			OperateModal.renderOperateModal(action, $("#operateModal_1"));
		} else if("shrink" == action){
			if(AS.chooseRowData.CurrentCount<=AS.chooseRowData.MinSize) {
				$.growlUI(Dict.val("common_tip"), "当前实例个数大于最小实例个数时才可以进行该项操作！");
	    		return;
			}
			OperateModal.renderOperateModal(action, $("#operateModal_2"));
		} else if("release" == action){
			//只有就绪状态的才可以进行扩容、缩容、释放
			if(AS.chooseRowData.CurrentCount<1){
				$.growlUI(Dict.val("common_tip"), "没有可释放的资源实例！");
	    		return;
			}
			OperateModal.renderOperateModal(action, $("#operateModal_3"));
		} else if ("delete" == action) { // 删除:有实例关联或策略的不可删除;就绪或创建完成状态的方可删除
			if(AS.chooseRowData.CurrentCount > 0 || AS.chooseRowData.policy.length >0) {
				$.growlUI(Dict.val("common_tip"), "请先删除该伸缩组下关联的资源实例和伸缩策略信息！");
	    		return;
			}
			OperateModal.deleteGroup();
		}
	},
	checkButton : function(e){
		if($(e).attr("checked")){
			$("#asTable input[type='checkbox']").each(function(index, item) {
				$(item).attr("checked", false);
			});
			$(e).attr("checked", true);
			$("#moreAction").removeAttr("disabled");
			AS.queryById($(e).attr("id"), function(result) {
				AS.chooseRowData = result;
				AS.showInstanceInfo(AS.chooseRowData);
				if(AS.chooseRowData.Status=="READY") {
					$(".release").removeClass("disabled");
				} else {
					$(".release").addClass("disabled");
				}
				if(AS.chooseRowData.Status=="READY" || AS.chooseRowData.Status=="CREATED") {
					$(".delete").removeClass("disabled");
				} else {
					$(".delete").addClass("disabled");
				}
				$("#policyMag").addClass("disabled");
				if(AS.chooseRowData.policy!=undefined){
					var scalOutPolicy = AS.getScalOutPolicy(AS.chooseRowData.policy) || {};
					var scalInPolicy = AS.getScalInPolicy(AS.chooseRowData.policy) || {};
					if(scalOutPolicy.id!=undefined || scalInPolicy.id!=undefined) {
						$("#policyMag").removeClass("disabled");
					}
					if(scalOutPolicy.id!=undefined && AS.chooseRowData.Status=="READY") {
						$(".dilatation").removeClass("disabled");
					} else {
						$(".dilatation").addClass("disabled");
					}
					if(scalInPolicy.id!=undefined && AS.chooseRowData.Status=="READY") {
						$(".shrink").removeClass("disabled");
					} else {
						$(".shrink").addClass("disabled");
					}
				}
			});
		}else{
			$("#policyMag").addClass("disabled");
			$("#moreAction").attr("disabled","disabled");
			AS.chooseRowData = null;
		}
	},
	//相关信息
	showInstanceInfo : function(data) {
		if (data==null) return;
		//查询详情
		$("#asRelations li.detail-item").each(function(i,item){
			var prop = $(item).find("span").attr("prop");
			var value = data[""+prop];
			if(prop=="ResourceType") {
				value = AS.ResourceType[value];
			}
			if(prop=="GroupType") {
				value = AS.GroupType[value];
			}
			if(prop=="TerminationPolicy") {
				value = AS.TerminationPolicy[value];
			}
			if(prop=="Status") {
				value = AS.Status[value];
			}
			$(item).find("span").html(value);
		});
		//启动配置
		AS.getLaunchConfiguration(data.LaunchConfigurationId);
		//关联资源
		AS.getRelateInstance(data.id);
    	//查询关联事件
		AS.getRelateEvent(data.id);
	},
	getRelateEvent: function(groupId){
		com.skyform.service.LogService.describeLogsInfo(groupId, function(success){
			if(success) {
	    		AS.renderRelateEventTable(success);
	    	}
		});
	},
	renderRelateEventTable : function(data){
		$("#relateEvent-table").empty();
		$(data).each(function(index, item){
			$("#relateEvent-table").append("<li>"+item.createTime+"&nbsp;&nbsp;&nbsp;&nbsp;"+ item.controle+"&nbsp;&nbsp;&nbsp;&nbsp;"
				+(item.subscription_name||"" )+"&nbsp;&nbsp;&nbsp;&nbsp;" + item.description+"</li>");
		});
	},
	getLaunchConfiguration : function(launchId) {
		AS.service.describeLaunchConfigurations("&LaunchConfigurationId=" + launchId, function(success){
			var response = success.DescribeLaunchConfigurationsResponse.LaunchConfiguration;
			if(response && response.length>0) {
				var data = response[0];
				AS.chooseRowData.launchConfig = data;
	    		AS.setLaunchConfig(data, $("#launchConfig"));
	    	}
		});
	},
	getRelateInstance: function(groupId){
		AS.service.describeAutoScalingInstances("&AutoScalingGroupId=" + groupId, function(success){
			var response = success.DescribeAutoScalingInstancesResponse;
			if(response) {
				var data = response.AutoScalingInstance;
	    		AS.renderRelateInstanceTable(data);
	    	}
		});
	},
	renderRelateInstanceTable : function(data){
		$("#relateInstance-table").empty();
		$(data).each(function(index, item){
			var date = item.created;
			var datesub = date.substring(0, date.indexOf("+"));
			var createdate = datesub.substring(0, datesub.indexOf("T")) + " " + datesub.substring(datesub.indexOf("T") + 1);
			var state = item.InstanceStatus==undefined ? "--" : AS.VMState[item.InstanceStatus];
			$("#relateInstance-table").append("<li>"+ createdate +"&nbsp;&nbsp;&nbsp;&nbsp;"+ item.InstanceName+"&nbsp;&nbsp;&nbsp;&nbsp;" 
				+item.IpAddress+"&nbsp;&nbsp;&nbsp;&nbsp;"+state +"</li>");
		});
	},
	setLaunchConfig : function(data, container){
		$(container).find("li.detail-item").each(function(i,item){
			var prop = $(item).find("span").attr("prop");
			var value = data[""+prop];
			if(prop=="created") {
				var datesub = value.substring(0, value.indexOf("+"));
				var createdate = datesub.substring(0, datesub.indexOf("T")) + " " + datesub.substring(datesub.indexOf("T") + 1);
				value = createdate;
			}
			$(item).find("span").html(value);
		});
	},
	setPolicy: function(data, policy, container){
		$(container).find(".form-horizontal input").each(function(i,item){
			var prop = $(item).attr("name");
			var value = policy[""+prop];
			if(prop=="PolicyType") {
				value = AS.PolicyType[value];
			}
			if(prop=="Status") {
				value = AS.PolicyStatus[value];
			}
			if(prop=="PolicyAction") {
				value = AS.PolicyAction[value];
			}
			$(item).val(value);
		});
		$(container).find("form").attr("policyId", policy.id);
		var button = $(container).find("button");
		if(policy.id && policy.Status == "READY" && data.Status == "READY") {//就绪状态的策略方可删除(策略就绪，伸缩组就绪)
			$(button).removeClass("disabled");
		} else {
			$(button).addClass("disabled");
		}
	},
	getScalOutPolicy: function(policyArr) {
		var policy = null;
		for (var i = 0; i < policyArr.length; i++) {
			var policyAction = policyArr[i].PolicyAction;
			if (policyAction == "SCALE_OUT" || policyAction == "SCALE_OUT_START") {
				policy = policyArr[i];
				break;
			}
		}
		return policy;
	},
	getScalInPolicy: function(policyArr) {
		var policy = null;
		for (var i = 0; i < policyArr.length; i++) {
			var policyAction = policyArr[i].PolicyAction;
			if (policyAction == "SCALE_IN" || policyAction == "SCALE_IN_STOP") {
				policy = policyArr[i];
				break;
			}
		}
		return policy;
	},
	//删除伸缩策略
	deletePolicy : function(id, name) {
		if(id==undefined || id == null)		return;
		var params = "&PolicyId=" + id;
		var msg = "确定要删除@吗？";
		$("#deleteModal2 p").html(msg.replace("@", name));
		$("#deleteModal2").modal("show");
		$("#deleteConfirm2").unbind().bind("click",function(){
			AS.service.deleteScalingPolicy(params,function(result){
				if(result.DeleteScalingPolicyResponse.success == "true"){
					AS.listAS();
					$("#deleteModal2").modal("hide");
					$.growlUI(Dict.val("common_tip"), "删除成功！");
				}else {
					$("#deleteModal2").modal("hide");
					$.growlUI(Dict.val("common_tip"), "删除失败！");
				}
			}, function(error){
				$.growlUI(Dict.val("common_tip"), "删除失败！");
			});
		});
	},
	//编辑策略
	editPolicy : function(container){
		$(container).find(".editTag").each(function(index, item){
			var attrValue = $(item).attr("name");
			var value = $(item).val();
			$(item).removeAttr("readonly");
			$(item).attr("placeholder", value);
		});
	},
	//编辑策略完成
	editConfirmPolicy : function(container, type) {
		var Id = $(container).attr("policyId");
		var PolicyName = $(container).find("input[name='PolicyName']").val().trim();
		var AdjustStep = $(container).find("input[name='AdjustStep']").val();
		var Cooldown = $(container).find("input[name='Cooldown']").val();
		var oldname = $(container).find("input[name='PolicyName']").attr("placeholder");
		var oldAdjustStep = $(container).find("input[name='AdjustStep']").attr("placeholder");
		var oldCooldown = $(container).find("input[name='Cooldown']").attr("placeholder");
		if(PolicyName==oldname && AdjustStep==oldAdjustStep && Cooldown==oldCooldown)	return;
		if(type=="out") {
			var result_1 = true, result_2 = true, result_3 = true;
			var el = $(container).find("input[name='PolicyName']");
			if(Utils._required(el) && Utils._maxlength(el, 30)){
	    		$(".nameError").hide();
	    		result_1=true;
	    	} else {
	    		$(".nameError").show();
	    		result_1=false;
	    	}
			result_2 = validateAdjustStep(AdjustStep, $(".stepError")).status;
			result_3 = validateCoolDown(Cooldown, $(".coolTimeError")).status;
			if(!result_1 || !result_2 || !result_3)	return;
		}else if(type=="in"){
			var result_1 = true, result_2 = true, result_3 = true;
			var el = $(container).find("input[name='PolicyName']");
			if(Utils._required(el) && Utils._maxlength(el, 30)){
	    		$(".inNameError").hide();
	    		result_1=true;
	    	} else {
	    		$(".inNameError").show();
	    		result_1=false;
	    	}
			result_2 = validateAdjustStep(AdjustStep, $(".inStepError")).status;
			result_3 = validateCoolDown(Cooldown, $(".inCoolTimeError")).status;
			if(!result_1 || !result_2 || !result_3)	return;
		}
		var params = "&PolicyId=" + Id + "&PolicyName=" + PolicyName + "&AdjustStep=" + AdjustStep + "&Cooldown=" + Cooldown;
		AS.service.putScalingPolicy(params, function(success){
			$("#policyMagModal").modal("hide");
			$.growlUI(Dict.val("common_tip"), "编辑策略 "+oldname+" 成功！");
			AS.listAS();
		}, function(error){
			$("#policyMagModal").modal("hide");
			$.growlUI(Dict.val("common_tip"), "编辑策略 "+oldname+" 失败！");
		});
	},
/************伸缩组的各项操作*******************/
	/**
	 * 创建伸缩组
	 * 王培培
	 * 2016-04-18
	 */
	createAS : function() {
		$("#wizard-createAS .error").hide();
		$("#wizard-createAS input").val("");
		$("#wizard-createAS select option:selected").removeAttr("selected");
		$("#wizard-createAS input[type='checkbox']").removeAttr("checked");
		$("#osDisk").attr("placeholder", "10");
		$(".osDiskError").text("只能输入非0正整数，且不小于提示的磁盘大小");
		if (AS.wizard == null) {
			AS.wizard = new com.skyform.component.Wizard("#wizard-createAS");
		};
		//初始化启动配置页面
		LaunchConfiguration.init();
		AS.wizard.onLeaveStep = function(from, to) {
			//初始化自动伸缩组配置页面
			if(from == 0 && to == 1) {
				ASGroupConfig.init();
			}
			//初始化伸缩策略页面
			if(from == 1 && to == 2) {
				ExpansionStrategy.init();
			}
			//初始化hook页面
			if(from == 2 && to == 3) {
				GroupHook.init();
			}
			//初始化预览页面的信息
			if(from == 3 && to == 4) {
				ReviewAndCreate.init();
			}
		};
		AS.wizard.onToStep = function(from, to) {		
			//初始化自动伸缩组配置页面
			if(from == 0 && to == 1) {
				ASGroupConfig.init();
			}
			//初始化伸缩策略页面
			if(from == 1 && to == 2) {
				ExpansionStrategy.init();
			}
			//初始化hook页面
			if(from == 2 && to == 3) {
				GroupHook.init();
			}
			//初始化预览页面的信息
			if(from == 3 && to == 4) {
				ReviewAndCreate.init();
			}
		};
		AS.wizard.onFinish = function(from, to) {
			AS.createASPost(AS.wizard);
		};
		AS.wizard.markSubmitSuccess();
		AS.wizard.reset();
		AS.wizard.render();
	},
	createASPost : function(wizard) {
		var instanceType = $("#instanceType option:selected").val();
		$("#createView").show();
		ReviewAndCreate.createLaunchConfig(instanceType);
	},
	//策略管理
	policyMag : function(){
		$("#policyMagModal").modal("show");
		$("#policyMagModal .error").hide();
		$("#policyMagModal input").attr("readonly", "readonly");
		$("#policyMagModal button.edit").attr("prop", "edit");
		$("#policyMagModal button.edit").text("编辑");
		if(AS.chooseRowData.policy==undefined){
			$("a[href='#out']").hide();
			$("a[href='#in']").hide();
			return;
		}
		var scalOutPolicy = AS.getScalOutPolicy(AS.chooseRowData.policy) || {};
		if(scalOutPolicy.id!=undefined){
			$("a[href='#out']").show();
			$("#policyTab a[href='#out']").click();
			AS.setPolicy(AS.chooseRowData, scalOutPolicy, $("#out"));
		}else {
			$("#policyTab a[href='#in']").click();
			$("a[href='#out']").hide();
		}
		var scalInPolicy = AS.getScalInPolicy(AS.chooseRowData.policy) || {};
		if(scalInPolicy.id!=undefined){
			$("a[href='#in']").show();
			AS.setPolicy(AS.chooseRowData, scalInPolicy, $("#in"));
		}else {
			$("a[href='#in']").hide();
		}
	}
};
//番茄鸡蛋刀削面，点赞！
var Utils = {
	ajaxData : function(url, callback, error) {
	    $.ajax({
	        'url' : url,
	        async : false,
	        dataType : 'json',
	        contentType : "application/json; charset=utf-8",
	        "success" : function(data) {
	            callback(data);
	        },
	        error : function(error) {
	        	error(error);
	        }
	    });
	},
	ajaxPostData : function(url, requestData, callback, error) {
		$.ajax({
			type: 'POST',
	        'url': url,
	        dataType : 'json',
	        contentType: "application/json",
	        data:requestData,
	        "success" : function(data){
	            callback(data);
	        },
	        error : function(error) {
	        	error(error);
	        }
		});
	},
	////////////////////////////////////////校验//////////////////////////////////
	//再也不吃凉皮了
	//input 输入框只能输入正整数
    onlyNum: function(id){
        $("#"+id).keydown(
            function(event)
            {
                var keyCode = event.which;
                if(keyCode == 46 || keyCode == 8 || keyCode == 37 || keyCode == 39 || (keyCode >= 48 && keyCode <= 57) || (keyCode >= 96 && keyCode <= 105))
                {
                    return true;
                }
                else
                {
                    return false
                }
            }
        ).focus(function()
            {
                this.style.imeMode = 'disabled';
            }
        );
    },
    //required
    _required : function(field) {
    	if(field==undefined)	return true;
    	var value = $(field).val().trim();
    	if(value==null || value=="")
    		return false;
    	return true;
    },
    //Integer
    _integer : function(field) {
    	var value = $(field).val().trim();
    	if(!Utils._required(field)) {
    		return false;
    	}
    	var reg = /^[0-9]*$/;
    	return reg.test(value);
    },
    //非0正整数
    _positiveInteger : function(field) {
    	var value = $(field).val().trim();
    	var reg = /^\+?[1-9][0-9]*$/;
		return reg.test(value);
    },
    //最大长度
    _maxlength : function(field, length) {
    	var value = $(field).val().trim();
    	if(value==null || value==undefined || value.length > length)	return false;
    	return true;
    },
    //最大值
    _max : function(field, max) {
    	var value = $(field).val().trim();
    	if(value==null || value==undefined || value>max)	return false;
    	return true;
    },
    //最小值
    _min : function(field,  min) {
    	var value = $(field).val().trim();
    	if(value==null || value==undefined || value<min)	return false;
    	return true;
    }
};
//启动配置页面
var LaunchConfiguration = {
    init: function() {
		var that = LaunchConfiguration;
		AS.azSelect = new com.skyform.component.AZSelect("selectDiv","azDiv","as");
		AS.azSelect.setSelectWidth(236);
		that.getImages();
		that.getNetworks();
		that.getSG();
	},
	images : null,
	//获取镜像(只查询自定义镜像)
	getImages : function() {
		$("#imagetemplates option").remove();
		$("#imagetemplates").append("<option value=''>请选择</option>");
		com.skyform.service.vmService.listImagetemplates(function(templates) {
			if (templates && templates.length > 0) {
				LaunchConfiguration.images = templates;
				$(templates).each(function(index, item) {
					$("#imagetemplates").append("<option value='"+item.imageTemplateId+"'>" + item.imageName + "</option>");
				});
			}
		}, function(error) {
			console.log("镜像获取失败！");
		});
	},
	changeImage: function(e){
		var val = $(e).val();
		if(!val)	return;
		$(LaunchConfiguration.images).each(function(index, item) {
			if(item.imageTemplateId == val) {
				$("#osDisk").attr("placeholder", item.osDisk);
				$(".osDiskError").text("只能输入非0正整数，且不小于"+ item.osDisk +"G");
			}
		});
	},
	//获取私有网络
	getNetworks : function() {
		$("#networks option").remove();
		$("#networks").append("<option value=''>请选择</option>");
		com.skyform.service.privateNetService.query({state:'running'},function (subnets){
			$(subnets).each(function(index, item) {
				if('using' == item.state||'running'== item.state){
					$("#networks").append("<option value='"+item.id+"'>" + item.name + "</option>");
				}
			});
		}, function(error) {
			console.log("网络获取失败！");
		});
	},
	//获取安全组
	getSG : function(){
		com.skyform.service.FirewallService.querySG(function(data){
			$("#sg option").remove();
			$("#sg").append("<option value=''>请选择</option>");
			$(data).each(function(index, item) {
				$("#sg").append("<option value='"+item.subscriptionId+"'>" + item.subscriptionName + "</option>");
			});
		}, function(error){
			$("#sg option").remove();
			$("#sg").append("<option value=''>请选择</option>");
		});
	},
	//获取页面输入启动配置的值
    getLanchInputData: function() {
        var $pool = $("#pool option:selected");
        var zoneId = AS.azSelect.getAzSelectValue();
        var zoneName = AS.azSelect.getAzSelectValueName();
        var $template = $("#imagetemplates option:selected");
        var $network = $("#networks option:selected");
        //create lunch configuration used parameter
        var lanchData = {};
        lanchData.ResourcePoolId = $pool.val();
        lanchData.ResourcePoolName = $pool.text();
        lanchData.ImageId =  $template.val();
        lanchData.ImageName = $template.text();
        lanchData.NetworkId =  $network.val();
        lanchData.NetworkName = $network.text();
        lanchData.Cpu = $("#cpu").val();
        lanchData.Memory = $("#memory").val();
        lanchData.DiskSize = $("#osDisk").val();
        lanchData.UserId = portalUser.id;
        lanchData.UserName = portalUser.name;
        lanchData.AccountName = portalUser.account;
        lanchData.StorageTags = $("#sg").val();
        lanchData.ZoneId = zoneId;
        lanchData.ZoneName = zoneName;
//        lanchData.UserData = "";
        return lanchData;
    },
	//获取输入的业务、实例类型
	getInsTypeData: function() {
		var insData = {};
        insData.ResourceType = $("#instanceType option:selected").val();
        return insData;
	}
};
//自动伸缩组配置页面
var ASGroupConfig = {
    init : function() {
    	ASGroupConfig.getDestroyStrategyName();
	},
	//终止策略类型
	getDestroyStrategyName: function()
    {
        var $destroyName = $("#destroyName");
        var option = "<option value='NEWEST'>最新的</option>" + 
        		"<option value='OLDEST'>最老的</option>" + 
        		"<option value='RANDOM'>随机的</option>";
        $destroyName.empty().append(option);
    },
  //获取输入的group 信息
  getAutoGroupData: function(){
      var autoGroupData = {};
      autoGroupData.AutoScalingGroupName = $("#groupName").val().trim();
      autoGroupData.GroupType = $("#groupType option:selected").val();
      //默认最小实例个数为1
      var minSize = ($("#min").val()).trim();
      if(!minSize) {
    	  minSize = $("#min").attr("placeholder");
      }
      autoGroupData.MinSize = minSize;
      autoGroupData.MaxSize = $("#max").val();
      //默认调整步长
      var $adjustStep =  $("#defaultAdjustStep");
      var defaultAdjustStepVal = ($adjustStep.val()).trim();
      if(!defaultAdjustStepVal) {
          defaultAdjustStepVal = $adjustStep.attr("placeholder");
      }
      autoGroupData.DefaultAdjustStep = defaultAdjustStepVal;
      //默认冷却时间
      var $coolTime = $("#defaultCoolDown");
      var coolTimeVal = ($coolTime.val()).trim();
      if(!coolTimeVal) {
          coolTimeVal = $coolTime.attr("placeholder");
      }
      autoGroupData.DefaultCoolDown = coolTimeVal;
      autoGroupData.TerminationPolicy = $("#destroyName option:selected").val();
      autoGroupData.UserId = portalUser.id;
      return autoGroupData;
    }
};
//伸缩策略页面
var ExpansionStrategy = {
	alarmOutInputName: "",
	alarmInInputName: "",
	isExistAlarName: false,
	outAlarmInformation: null,
	inAlarmInformation: null,
	isExistAlarmName: function(name){
	    var option = {
	        url: window.Controller.ceilometerRoot + "alarms?q.field=name&q.value=" + name,
	        type: "GET",
	        async: false
	    };
	    option.success = function(msg)
	    {
	        var len = msg.length;
	        if(len) ExpansionStrategy.isExistAlarName = true;
	        else ExpansionStrategy.isExistAlarName = false;
	    };
	    $.ajax(option);
	},
	init : function() {
		var self = ExpansionStrategy;
		//告警阈值
		var metricOptions = self.getAlarmMetric();
		var cond = self.conditionContent(metricOptions);
		//初始化告警弹出框
		self.updateAlarmCondition(cond);
		//伸策略
	    $("#configBtn").unbind("click").bind("click", function() {
	    	var content = $("#alarmBody").html();
	    	$("#createAlarmContainer td:eq(0)").empty().append(content);
	        $(content).show();
	    });
	  //缩策略
      $("#configInBtn").unbind("click").bind("click", function() {
    	  	var content = $("#alarmBody").html();
	    	$("#createAlarmContainer2 td:eq(0)").empty().append(content);
	        $(content).show();
      });
	}, 
	noConfigAction : function() {
    	$("#policyStep").hide();
	},
	configAction : function() {
		var that = ExpansionStrategy;
        $("#policyStep").show();
	},
	conditionContent : function(metricOptions) {
		var content = '<ul class="alarmMetricUl alarm-condition">'
				+'<li>'
				+'	<span>指标</span>'
				+' <select class="metric" style="width: 140px;" onchange="ExpansionStrategy.metricChangeToChangeUnit(this)" data-validate="validateMetric">'
				+metricOptions
				+'	</select>'
				+'<span class="error metricError" style="float:none;">指标重复</span>'
				+'</li>'
				+'<li>'
				+'	<span>比较符</span>'
				+'	<select class="comparison" style="width: 60px;">'
				+'		<option value="gt">&gt;</option>'
				+'		<option value="ge">&gt;=</option>'
				+'		<option value="lt">&lt;</option>'
				+'		<option value="le">&lt;=</option>'
				+'		<option value="eq">=</option>'
				+'		<option value="nq">&lt;&gt;</option>'
				+'	</select>'
				+'</li>'
				+'<li>'
				+'	<span>阈值</span>'
				+'	<input class="threshold" type="text" style="width: 90px;" data-validate="validateThreshold">'
				+'	<span name="metricUnit" class="metricUnit" style="text-align: left;width: 28px;">%</span>'
				+'<span class="error thresholdError" style="float:none;">数值无效</span>'
				+'</li>'
				+'<li>'
				+'	<button type="button" class="btn btn-small remove-condition" onclick="ExpansionStrategy.removeAlarmCondition(this)">删除</button>'
				+'</li>'
			+'</ul>';
		return content;
	}, 
	updateAlarmCondition : function(cond) {
		var self = ExpansionStrategy;
		//告警条件只有一条
		var container = $("#alarmMetricPanel");
		container.empty();
		container.append(cond);
        //多条件联合关系
        container.find("#condition").hide();
	},
	//验证告警
    validateAlarm: function(container) {
        //验证告警
        var flag = true;
        var type = container.find("td:eq(0)").attr("type");
//        var result = validateAlarmName($("td[type='"+type+"']").find(".alarmName"));
//        if(!result.status)	flag = false;
        $("td[type='"+type+"']").find(".metric").each(function(index, item){
        	var result = validateMetric(type, $(item));
        	if(!result.status){
        		flag = false;
        	}
        });
        $("td[type='"+type+"']").find(".threshold").each(function(index, item){
        	var result = validateThreshold($(item));
        	if(!result.status){
        		flag = false;
        	}
        });
        return flag;
    },
	//添加告警条件
	addAlarmCondition : function(e){
		var container = $(e).parent().parent().find("#alarmMetricPanel");
		container.append(ExpansionStrategy.conditionContent(ExpansionStrategy.getAlarmMetric())); //添加告警条件
        container.parent().find("#condition").show(); //联合条件
	},
	//获取告警指标
	 getAlarmMetric: function(){
		  var option = "";
	      var vmMetric = ["group.vm.cpu.rate.Monitor:CPU使用率","group.vm.memory.usedRate.Monitor:内存使用率",
	          "group.vm.network.write.Monitor:网络流入量","group.vm.network.read.Monitor:网络流出量",
	          "group.vm.disk.write.Monitor:磁盘写速率","group.vm.disk.read.Monitor:磁盘读速率"];
	      //物理机暂不考虑
//	      var phyMetric = ["group.physical.cpu.utilization","group.physical.memory.utilization","group.physical.network.write",
//	          "group.physical.network.read","group.physical.disk.write","group.physical.disk.read","group.hadoop.load.five",
//	          "group.hadoop.cpu.utilization","group.hadoop.disk.total","group.hadoop.disk.free","group.hadoop.datanodes.memory.total",
//	          "group.hadoop.datanodes.memory.free"
//	      ];
//	      var instanceType = $("#instanceType option:selected").val();
//	      var metric = phyMetric;
//	      if(instanceType == "VM"){
//	          metric = vmMetric;
//	      }
	      var metric = vmMetric;
	      var metricLength = metric.length;
	      for(var i=0; i< metricLength; i++){
	    	  var metricValue = metric[i].split(":") || [];
	          option += "<option value='"+ metricValue[0] +"'>"+ metricValue[1] + "</option>";
	      }
	      return option;
	  },
	  //metric 替换上更新指标单位
	  metricChangeToChangeUnit: function(e) {
	      var val = $(e).val();
	      //找到该metric所在行的单位标记
	      var $parent = $(e).parent().parent();
	      var unit = $parent.find("span[name=metricUnit]");
	
	      //查询字符串中是否有CPU字段
	      if(val.indexOf("cpu") != "-1" || val.indexOf("memory") != "-1"){
	          $(unit).text("%");
	      }
	      if(val.indexOf("network") != "-1" || (val.indexOf("disk") != "-1" && val.indexOf("hadoop") == "-1")
	          || val == "group.iis.byte_received" || val == "group.iis.byte_send") {
	          $(unit).text("KB/s");
	      }
	
	      if(val.indexOf("hadoop.disk") != "-1"){
	          $(unit).text("GB");
	      }
	
	      if(val.indexOf("hadoop.datanodes.memory") != "-1"){
	          $(unit).text("MB");
	      }
	
	      if(val.indexOf("nginx") != "-1")
	      {
	          $(unit).text("count");
	      }
	      if(val == "group.iis.connection_attemps" || val == "group.iis.connections" || val == "group.iis.errors")
	      {
	          $(unit).text("count/s");
	      }
	      if(val == "group.hadoop.load.five")
	      {
	          $(unit).text("");
	      }
	  },
	  //删除告警条件
	  removeAlarmCondition: function(e){
	      //删除当前行
	      var $parent = $(e).parent().parent();
	      var length = $parent.parent().find(".alarm-condition").length - 1;
	      var conditionContainer = $parent.parent().parent().find("#condition");
	      $parent.remove();
	      //只有一个时，多条件联合关系不可见
	      if(length == 1)	conditionContainer.hide();
	  },
	//关闭告警条件
	cancelAlarmCondtion : function(e) {
		$(e).parent().parent().remove();
	},
	//提交告警条件
	createAlarmCondtion : function(e) {
		var container = $(e).parent().parent().parent().parent();
		if(ExpansionStrategy.validateAlarm(container)) {
			ExpansionStrategy.sureAlarmRule(container);
	        ExpansionStrategy.cancelAlarmCondtion(e);
		}
	},
	//获取告警配置的信息
	getAlarmInformation : function(e) {
		//单个告警的名字随机生成uuid
        var singleAlarm = {};
        var singleAlarmData = [];
        var alarmCon = $(e).find(".alarm-condition");
        var metric = $(e).find(".metric"); //指标
        var comparison = $(e).find(".comparison");//比较符
        var threshold = $(e).find(".threshold");//阈值
        var unit = $(e).find(".metricUnit");//单位

        var alarmConLength = alarmCon.length;
        for(var i=0; i<alarmConLength; i++){
            var alarmConObject = {};
            //value值
            alarmConObject.meter_name = $(metric[i]).val().trim();
            alarmConObject.comparison_operator = $(comparison[i]).val();
            //文字版
            alarmConObject.meter_name_text = $(metric[i]).find("option:selected").text().trim();
            alarmConObject.comparison_operator_text = $(comparison[i]).find("option:selected").text();
            //指标值
            alarmConObject.threshold = threshold[i].value;
            //告警指标单位
            alarmConObject.unit = $(unit[i]).text();
            singleAlarmData.push(alarmConObject);
        }
        singleAlarm.data = singleAlarmData;
        singleAlarm.type = "threshold";
        //下面两个参数是最后一次调用的时候需要的参数
        singleAlarm.operator = $(e).find("#operator option:selected").val();
        singleAlarm.operator_text = $(e).find("#operator option:selected").text();
//        singleAlarm.name = $(e).find("#alarmName").val().trim();
		//获取系统当前时间构建告警规则的名称
		var currentDate = new Date();
		var currentVal = currentDate.format("yyyyMMddhhmmss");
		singleAlarm.name = currentVal;
        return singleAlarm;
	},
	//确定添加告警策略 type:伸缩类型
    sureAlarmRule : function(container) {
    	var that = ExpansionStrategy;
    	var policyType = container.siblings("tr:eq(3)").find("#PolicyType").val();
    	var type = container.find("td:eq(0)").attr("type");
	    var data = that.getAlarmInformation(container);
	    var alarmName = data.name;
	    var condition = data.data;
	    var conditionLength = condition.length;
	    var alarmCon = "";
	    var alarmDescription;
	    var alarmConText = "";
	    var alarmDescriptionText;
	    if(conditionLength == 1){
	          alarmCon = condition[0].meter_name +" "+ condition[0].comparison_operator +" "+ condition[0].threshold;
	          alarmConText = condition[0].meter_name_text +" "+ condition[0].comparison_operator_text +" "+ condition[0].threshold;
	          var metricUnit = condition[0].unit;
	          if(metricUnit == "%") {
	              alarmCon += metricUnit;
	              alarmConText += metricUnit;
	          } else {
	              alarmCon += " " + metricUnit;
	              alarmConText += metricUnit;
	          }
	      } else{
	          //连接符  data.operator
	          var operator = data.operator;
	          var operator_text = data.operator_text;
	          for(var i=0; i<conditionLength; i++) {
	              if(i==0) {
	                  alarmCon = condition[0].meter_name +" "+ condition[0].comparison_operator +" "+ condition[0].threshold;
	                  alarmConText = condition[0].meter_name_text +" "+ condition[0].comparison_operator_text +" "+ condition[0].threshold;
	                  var unit = condition[0].unit;
	                  if(unit == "%") {
	                      alarmCon += unit;
	                      alarmConText += unit;
	                  } else {
	                      alarmCon += " " + unit;
	                      alarmConText += " " +unit;
	                  }
	              } else  {
	                  alarmCon += " " + data.operator + "\n"+ ( condition[i].meter_name+" " + condition[i].comparison_operator +" "+ condition[i].threshold);
	                  alarmConText += " " + data.operator_text + "\n"+ (condition[i].meter_name_text +" "+ condition[i].comparison_operator_text +" "+ condition[i].threshold);
	                  var unitTwo = condition[i].unit;
	                  if(unitTwo == "%") {
	                      alarmCon += unitTwo;
	                      alarmConText += unitTwo;
	                  }  else {
	                      alarmCon += " " + unitTwo;
	                      alarmConText += " " + unitTwo;
	                  }
	              }
	          }
	      }
	      alarmDescription = alarmName  + "\n" + "告警条件: " + alarmCon ;
	      alarmDescriptionText = "告警条件: " + alarmConText ;
	      //向告警配置中添加告警名称及表达式信息
	      var alarmArea = $("#in-alarm-description");
	     //伸策略
	      if(type == "out") {
	          alarmArea = $("#alarm-description");
	          that.outAlarmInformation = data;
	          that.alarmOutInputName = alarmName;
	      }else {
	          that.inAlarmInformation = data;
	          that.alarmInInputName = alarmName;
	      }
	      alarmArea.val("");
	      alarmArea.attr("realValue", alarmDescription);
	      alarmArea.val(alarmDescriptionText);
    },
  //获取伸策略输入信息
  getOutPolicyData: function(){
      var outPolicyType = $("#PolicyType option:selected").val();
      var outPolicyData = {};
      outPolicyData.PolicyName = $("#outName").val().trim();
      //默认调整步长
      var $adjustStep =  $("#step");
      var step = ($adjustStep.val()).trim();
      if(!step) {
          step = $adjustStep.attr("placeholder");
      }
      outPolicyData.AdjustStep = step;
      //默认冷却时间
      var $coolTime = $("#coolTime");
      var coolTimeVal = ($coolTime.val()).trim();
      if(!coolTimeVal) {
          coolTimeVal = $coolTime.attr("placeholder");
      }
      outPolicyData.Cooldown = coolTimeVal;
      outPolicyData.PolicyType = outPolicyType;
      //告警表达式
      outPolicyData.AlarmDescription = $("#alarm-description").attr("realValue");
      outPolicyData.AlarmDescriptionText = $("#alarm-description")[0].value;
      var time = $("#outTime option:selected").val();
      var hourVal = $("#outHour option:selected").val();
      var cronTime = hourVal;
      var cronDescription = "AM";
      if(time == "PM") {
          //下午的时间 12 + hourVal
          var hourInt = parseInt(hourVal);
          if(hourInt == 12) {
              cronTime = 0;
          } else {
              cronTime = 12 + hourInt;
          }
          cronDescription = "PM";
      }
      //定时表达式描述信息
      var cronDesc = "每天@1 @2点 执行该任务";
      var nextCronDesc = cronDesc.replace("@1",cronDescription);
      var lastCronDesc = nextCronDesc.replace("@2",hourVal);
      outPolicyData.CronDescription = lastCronDesc;
      //定时表达式
      outPolicyData.CronExpression =  "0 0 " + cronTime + " * * ?";
      outPolicyData.PolicyAction = $("#outOperate option:selected").val();
      return outPolicyData;
  },
  //获取缩策略输入信息
  getInPolicyData: function() {
      var inPolicyType = $("#policyTypeIn option:selected").val();
      var inPolicyData = {};
      inPolicyData.PolicyName = $("#inName").val().trim();
      //默认调整步长
      var $adjustStep =  $("#inStep");
      var step = ($adjustStep.val()).trim();
      if(!step) {
          step = $adjustStep.attr("placeholder");
      }
      inPolicyData.AdjustStep = step;
      //默认冷却时间
      var $coolTime = $("#inCoolTime");
      var coolTimeVal = ($coolTime.val()).trim();
      if(!coolTimeVal) {
          coolTimeVal = $coolTime.attr("placeholder");
      }
      inPolicyData.Cooldown = coolTimeVal;
      inPolicyData.PolicyType = inPolicyType;
      //告警表达式
      inPolicyData.AlarmDescription = $("#in-alarm-description").attr("realValue");
      inPolicyData.AlarmDescriptionText = $("#in-alarm-description")[0].value;
      var inTime = $("#inTime option:selected").val();
      var hourVal = $("#inHour option:selected").val();
      var cronTime = hourVal;
      var cronDescription = "AM";
      if(inTime == "PM")
      {
          var hourInt = parseInt(hourVal);
          if(hourInt == 12)
          {
              cronTime = 0;
          }
          else
          {
              cronTime = 12 + hourInt;
          }
          cronDescription = "PM";
      }
      //定时表达式描述信息
      var cronDesc = "每天@1 @2点 执行该任务";
      var nextCronDesc = cronDesc.replace("@1",cronDescription);
      var lastCronDesc = nextCronDesc.replace("@2",hourVal);
      inPolicyData.CronDescription = lastCronDesc;
      //定时表达式
      inPolicyData.CronExpression =  "0 0 " + cronTime + " * * ?";
      inPolicyData.PolicyAction =  $("#inOperate option:selected").val();
      return inPolicyData;
  	}
};
//hook页面
var GroupHook = {
	init : function() {
		var that = GroupHook;
//		that.getDeviceType();
	    that.getElbList();
//	    that.initPage();
//	    Utils.onlyNum("protectTime");
	}, 
	noConfigAction : function() {
		$(".hookConfigContent").hide();
    	$("#hookDiv").hide();
	},
	configAction : function() {
		var that = GroupHook;
		//移出之前的验证信息
        $("div.formError").remove();
//        that.addELBPolicy(true);
        $(".hookConfigContent").show();
        $("#hookDiv").show();
	},
	changeDeviceType : function(e) {
		//移出之前的验证信息
        $("div.formError").remove();
        var val = $(e).val();
        that.decideWhichLabelToShows(val);
	},
	//获取上端设备类型
    getDeviceType : function() {
		var $deviceType = $("#hookDeviceType");
        var elb = $(".elb"),cloudera = $(".cloudera");
        elb.show();
        cloudera.hide();
        AS.service.getUpstreamDeviceTypes("", function(success){
        	var list = success.DescribeUpstreamDeviceTypesResponse.UpStreamDeviceType;
            var length = list.length;
            var option = "";
            for(var i=0 ;i< length; i++) {
                option += "<option value='"+ list[i].name +"'>"+ list[i].name + "</option>";
            }
            $deviceType.append(option);
            //判断显示什么标签
            var hookDeviceType = $("#hookDeviceType");
            var deviceType = hookDeviceType.val();
            GroupHook.decideWhichLabelToShows(deviceType);
        });
	},
	//获取负载均衡
    getElbList:function(){
		$("#elbselect").empty();
    	$("#elbselect").append("<option value=''>请选择</option>");
    	var networkId = $("#networks").val();
    	com.skyform.service.LBService.describeLbVolumesByNetworkId(networkId, function(data) {
    		var elbList = data||[];
            $(elbList).each(function(index, item){
            	$("#elbselect").append("<option ip='"+ item.address +"' value='"+ item.id +"'>"+ item.instanceName +"</option>");
            });
		});
	},
	initPage: function(){
        var that = GroupHook;
        //添加负载策略
        that.addELBPolicy();
    },
  //添加负载策略(暂时废弃)
  addELBPolicy: function() {
      var that = GroupHook;
      var addBtn = $("#addElbBtnDiv"); //"添加"按钮所在行
      var removeRow =  $(".elb-condition");
      removeRow.remove();
      var $dom_tp = $('<div class="form-row elb-condition">'+ '</div>');
      var $elbConditon = $('<input class="virtualPort" type="text"><input class="realPort" type="text">');
      var $remove = $('<a style="color: #005580;cursor: pointer;" type="button" class="remove-btn">删除</a>');
      $dom_tp.append($elbConditon);
      addBtn.before($dom_tp.clone(true));
      $dom_tp.append($remove);
      //删除条件
      var $removeBtn = $($dom_tp.find(".remove-btn"));
      $removeBtn.on("click",that.removeCondition);

      //添加条件
      var addCondition = $("#addElbBtn");
      //解除click事件绑定
      addCondition.unbind("click");
      addCondition.unbind("click").bind("click", function(){
          addBtn.before($dom_tp.clone(true));
      });
    },
  //判断显示哪些标签
  decideWhichLabelToShows: function(deviceType) {
	  var elb = $(".elb"),cloudera = $(".cloudera");
      if(deviceType == "ELB") {
          elb.show();
          cloudera.hide();
      } else {
          elb.hide();
          cloudera.show();
      }
  },
  //获取hook配置信息
  getHookInformation: function(){
      var hook = {};
      var deviceType = $("#hookDeviceType").val();
      hook.UpStreamDeviceType = deviceType;

      var checkBox = $("input:checkbox[name=executionTime]:checked");
      var hookType = "",hookTypeDescription = "";
      var length = checkBox.length;
      for(var i=0;i<length; i++)
      {
          if(i==0)
          {
              var val = $(checkBox[0]).attr("id");
              hookType = val;
              hookTypeDescription = AS.ExecutionTime[hookType];
          }
          else
          {
              hookType += "," + $(checkBox[i]).attr("id");
              hookTypeDescription += "," + AS.ExecutionTime[$(checkBox[i]).attr("id")];
          }
      }
      hook.HookTypes = hookType;
      hook.HookTypeDescription = hookTypeDescription;
      if(deviceType == "ELB") {
    	  /**新的参数（仅限ELB）**/
          /**
           * var ELBMeteDataArray = [],elbString = "";
          var elbCon = $(".elb-condition");
          var virtualPort = $(".virtualPort"); //前端端口
          var realPort = $(".realPort");//后端端口
          var elbSelect = $("#elbselect option:selected");
          var conLength = elbCon.length;
          for(var j=0; j<conLength; j++){
              var ELBMeteData = {};
              var realPortVal = $(realPort[j]).val().trim();
              var virtualPortVal =  $(virtualPort[j]).val().trim();
              if(realPortVal && virtualPortVal)
              {
                  ELBMeteData.realPort = realPortVal;
                  ELBMeteData.virtualPort = virtualPortVal;
                  ELBMeteDataArray.push(ELBMeteData);
                  if(j == 0)
                  {
                      elbString = "虚拟端口: " + virtualPortVal + ", 真实端口: " + realPortVal;
                  }
                  else
                  {
                      elbString += "; 虚拟端口: " + virtualPortVal + ", 真实端口: " + realPortVal;
                  }
              }
          }
          //会话保护时间
          var protectTime = $("#protectTime").val().trim();
          var protectTimeVal = 0;
          if(protectTime)
          {
              protectTimeVal = protectTime;
          }
          hook.NotificationMetaData = {"protectTime":protectTimeVal,"ports": ELBMeteDataArray};
          hook.elbPolicy = elbString;
          */
    	 var elbSelect = $("#elbselect option:selected");
    	 var lbid = elbSelect.val();
    	 hook.LbDeviceId = lbid;
         hook.LoadBalance = elbSelect.attr("ip"); //保存IP信息
         hook.LbDeviceName = elbSelect.text();
         var realPortVal = $(".realPort").val().trim();//后端端口
         hook.elbPolicy = "后端端口: " + realPortVal;
         var elbSelect = $("#elbselect option:selected");
         Dcp.biz.apiRequest("/instance/lb/describeLbRule", {"lbid":parseInt(lbid)}, function(data) {
	       	 if(data.data.length > 0&&data.data!="[]" ){
	       		 var test = data.data; 
	       		 if(typeof(data.data)=="string"){
	       			 test=$.parseJSON(data.data);
	       		 }
				 var firewall_id=test[0].id;
				 hook.NotificationMetaData = {
		    		  "rules" : [{
		    			  "firewall_id" : firewall_id,
		    			  "hostIds" : lbid,
		    			  "port" : realPortVal,
		    			  "protocol" : "1"
		    		  }]
		          };
	       	 }
         });
      }else {
          hook.NotificationIp = $("#clouderaIP").val().trim();
          var notificationMeteData = {};
          notificationMeteData.serverUsername = $("#clouderaUserName").val().trim();
          notificationMeteData.serverPassword = $("#clouderaPass").val().trim();
          notificationMeteData.clusterName = $("#clouderaCluster").val().trim();

          var service = "";
          var checkBoxService = $("input:checkbox[name=service]:checked");
          var serviceLength = checkBoxService.length;
          for(var k=0;k<serviceLength; k++) {
              if(k==0)
              {
                  service = $(checkBoxService[0]).attr("id");
              }
              else
              {
                  service += "," + $(checkBoxService[k]).attr("id");
              }
          }
          notificationMeteData.dataNodeServices = service;
          hook.NotificationMetaData = notificationMeteData;
      }
      return hook;
  	}       
};
//预览页面的信息
var ReviewAndCreate = {
	tasks		: [],  //任务队列
	alarmsOut	:	[],	//伸策略告警id集合
	alarmsIn	:	[], 	//缩策略告警id集合
	outAlarmId	: "",	 //伸策略创建时的alarm id
	inAlarmId	: "",  	//缩策略创建时的alarm id
	init : function() {
		ReviewAndCreate.showConfigInfor();
	},
	showConfigInfor: function() {
		//启动配置
		var insData = LaunchConfiguration.getInsTypeData();
		var insType = insData.ResourceType;
		$("#insType").text(AS.ResourceType[insType]);
		if(insType == "VM") {
			var launchData = LaunchConfiguration.getLanchInputData();
            $("#poolName").text(launchData.ResourcePoolName);
            $("#zoneName").text(launchData.ZoneName);
            $("#templateName").text(launchData.ImageName);
            $("#netWorkName").text(launchData.NetworkName);
            $("#cpuNum").text(launchData.Cpu);
            $("#memorySize").text(launchData.Memory);
            $("#diskSize").text(launchData.DiskSize);
            $("#sgName").text(launchData.StorageTags);
		}
		
		//自动伸缩组配置
        var autoGroupData = ASGroupConfig.getAutoGroupData();
        var groupType = autoGroupData.GroupType;
        var desType = autoGroupData.TerminationPolicy;
        $("#groupNa").text(autoGroupData.AutoScalingGroupName);
        $("#groupTy").text(AS.GroupType[groupType]);
        $("#minNum").text(autoGroupData.MinSize);
        $("#maxNum").text(autoGroupData.MaxSize);
        $("#stepView").text(autoGroupData.DefaultAdjustStep);
        $("#coolTimeView").text(autoGroupData.DefaultCoolDown);
        $("#desType").text(AS.TerminationPolicy[desType]);
        
	      //伸策略
	      var outPolicyData = ExpansionStrategy.getOutPolicyData();
	      var outAction = outPolicyData.PolicyAction;
	      $("#outPolicyName").text(outPolicyData.PolicyName);
	      $("#outStepView").text(outPolicyData.AdjustStep);
	      $("#outTimeView").text(outPolicyData.Cooldown);
	      var policyView = outPolicyData.CronDescription;
	      if(outPolicyData.PolicyType == "ALARM_TRIGGERED") {
	          policyView = outPolicyData.AlarmDescriptionText;
	      }
	      $("#policyView").text(policyView);
	      $("#outOperateView").text(AS.PolicyAction[outAction]);

	      //缩策略
	      var inPolicyData = ExpansionStrategy.getInPolicyData();
	      var inAction = inPolicyData.PolicyAction;
	      $("#inPolicyName").text(inPolicyData.PolicyName);
	      $("#inStepView").text(inPolicyData.AdjustStep);
	      $("#inTimeView").text(inPolicyData.Cooldown);
	      var policyViewIn = inPolicyData.CronDescription;
	      if(inPolicyData.PolicyType == "ALARM_TRIGGERED") {
	          policyViewIn = inPolicyData.AlarmDescriptionText;
	      }
	      $("#inPolicyView").text(policyViewIn);
	      $("#inOperateView").text(AS.PolicyAction[inAction]);

	      //hook配置信息
	      var hookInformation = GroupHook.getHookInformation();
	      var deviceType = hookInformation.UpStreamDeviceType;
	      $("#deviceTypeView").text(deviceType);
	      $("#executionTime").text(hookInformation.HookTypeDescription);
	      if(deviceType == "ELB") {
	          $("#elbPolicyView").text(hookInformation.elbPolicy);
	          $("#balance").text(hookInformation.LbDeviceName);
//	          $("#protectTimeView").text($("#protectTime").val().trim());
	      } else {
	          $("#cloudIPView").text(hookInformation.NotificationIp);
	          var meteData = hookInformation.NotificationMetaData;
	          $("#cloudUserNameView").text(meteData.serverUsername);
	          $("#cloudPassView").text(meteData.serverPassword);
	          $("#cloudCluster").text(meteData.clusterName);
	          $("#cloudData").text(meteData.dataNodeServices);
	      }
	},
	//创建自动伸缩组
    //创建过程：启动配置——自动伸缩组——告警规则——伸缩策略
    //创建启动配置: 第一步
	createLaunchConfig : function(instanceType) {
		var that = ReviewAndCreate;
		if(instanceType == "VM") {
			//vm 类型需要创建启动配置
			$("#createLaunch").show();
			var launchData = LaunchConfiguration.getLanchInputData();
			//暂时写死，以后删除
			var serviceType="211";
			if(AS.portalType=="public"){
				serviceType="201";
			}
			//结束
            var launchParam = "&ResourcePoolId=" + launchData.ResourcePoolId + "&ResourcePoolName=" + launchData.ResourcePoolName
                + "&ImageId=" + launchData.ImageId + "&ImageName=" + launchData.ImageName
                + "&NetworkId=" + launchData.NetworkId + "&NetworkName=" + launchData.NetworkName + "&StorageTags=" +launchData.StorageTags
                + "&Cpu=" + launchData.Cpu + "&Memory=" + launchData.Memory
                + "&AccountName=" + launchData.AccountName + "&UserId=" + launchData.UserId + "&UserName=" + launchData.UserName
                + "&ZoneId=" + launchData.ZoneId + "&UserData=" + serviceType;
            var diskSize = launchData.DiskSize;
            if(diskSize){
                launchParam += "&DiskSize=" + diskSize;
            }
            //创建启动配置(1)
            var param = encodeURI(launchParam);
            AS.service.createLaunchConfiguration(param, function(success) {
            	$("#createLaunchResult").text("成功");
            	var launchResult = success.CreateLaunchConfigurationResponse.LaunchConfiguration;
                var launchId = launchResult.id;
                that.createAutoScalingGroup(instanceType, launchId);
            }, function(error) {
            	$("#createLaunchResult").text("失败");
            	return false;
            });
		} else {
			//实例类型为物理机时，不需要创建启动配置
            that.createAutoScalingGroup(instanceType,"");
		}
	},
	//创建自动伸缩组：第二步
	createAutoScalingGroup : function(instanceType,launchId) {
		$("#createGroupInfor").show();
		var that = ReviewAndCreate;
        var groupData = ASGroupConfig.getAutoGroupData();
        var groupType = groupData.GroupType;
        var hookRadio = $("#hookRadio");  //是否添加hook
        //获取系统当前时间构建告警规则的名称
		var currentDate = new Date();
		var currentVal = currentDate.format("yyyyMMddhhmmss");
		var groupName = groupData.AutoScalingGroupName + "_" + currentVal;
        var groupParam = "&AutoScalingGroupName=" + groupName
            + "&GroupType=" + groupType + "&MinSize=" + groupData.MinSize + "&MaxSize=" + groupData.MaxSize
            + "&DefaultAdjustStep=" + groupData.DefaultAdjustStep + "&DefaultCoolDown=" + groupData.DefaultCoolDown
            + "&TerminationPolicy=" + groupData.TerminationPolicy + "&ResourceType=" + instanceType + "&UserId=" + groupData.UserId;
        if(launchId) {
            groupParam +="&LaunchConfigurationId=" + launchId;
        }
        var hookData = GroupHook.getHookInformation();
        if(hookData.UpStreamDeviceType == "ELB") {
        	groupParam += "&LoadBalance=" + hookData.LbDeviceId;
        }
        //创建自动伸缩组(2)
        var param = encodeURI(groupParam);
        AS.service.createAutoScalingGroup(param, function(success) {
        	$("#createGroupResult").text("成功");
        	var groupResult = success.CreateAutoScalingGroupResponse.scalinggroup;
        	var groupId = groupResult.id;
        	ReviewAndCreate.createAutoScaling(groupId, groupType);
        }, function(error) {
        	$("#createGroupResult").text("失败");
        	return false;
        });
	},
	createAutoScaling : function(groupId, groupType) {
		var okRadio = $("#configSaclingPolicies").attr("checked");//判定是否添加伸缩策略
        if(okRadio == "checked") {
        	$("#createPolicy").show();
        	var policyOutData = ExpansionStrategy.getOutPolicyData();
            var policyInData = ExpansionStrategy.getInPolicyData();
            //伸策略task
            var policyOutObject = ReviewAndCreate.getPolicyTask(groupId,"out");
            //缩策略task
            var policyInObject = ReviewAndCreate.getPolicyTask(groupId,"in");
            ReviewAndCreate.tasks = [];
            //自动伸策略
            if(groupType == "ALARM_TRIGGERED") {
            	//伸策略告警
            	var outAlarmData = ExpansionStrategy.outAlarmInformation;
            	ReviewAndCreate.tasks = ReviewAndCreate.getAlarmTask(outAlarmData,groupId,"out");
            	//伸策略
            	policyOutObject.send = function(){
            		policyOutObject.action += "&AlarmId=" + ReviewAndCreate.outAlarmId;
            	};
            	ReviewAndCreate.tasks.push(policyOutObject);
            
	            //缩策略告警
	            var inAlarmData = ExpansionStrategy.inAlarmInformation;
	            var inAlarm = ReviewAndCreate.getAlarmTask(inAlarmData,groupId,"in");
	            for(var k=0 ;k<inAlarm.length; k++){
	            	ReviewAndCreate.tasks.push(inAlarm[k]);
	            }
	            //缩策略
	            policyInObject.send = function(){
	            	policyInObject.action += "&AlarmId=" + ReviewAndCreate.inAlarmId;
	            };
	            ReviewAndCreate.tasks.push(policyInObject);
          	} else {
	          	//定时伸策略
	            policyOutObject.action += "&CronExpression=" + policyOutData.CronExpression;
	            ReviewAndCreate.tasks.push(policyOutObject);
	            //缩策略
	            policyInObject.action += "&CronExpression=" + policyInData.CronExpression;
	            ReviewAndCreate.tasks.push(policyInObject);
          	}
        }
        ReviewAndCreate.createHookConfig(groupId);
	},
	createHookConfig : function(AutoScalingGroupId) {
		var hookChecked =  $("#hookRadio").attr("checked") == "checked";
        if(hookChecked) {
        	$("#createHook").show();
        	var hookData = ReviewAndCreate.getHookConfiguration(AutoScalingGroupId);
        	ReviewAndCreate.tasks.push(hookData);
        }
        //执行tasks
        ReviewAndCreate.process_tasks(ReviewAndCreate.tasks);
        //伸缩组创建完成，初始化自动扩容
	},
	//获取告警队列信息
    getAlarmTask: function(alarmData,groupId,policyType){
    	var tasks = [];
        //添加告警,判定需要添加几条告警
        var alarmConditionData = alarmData.data;
        var alarmConDataLength = alarmConditionData.length;
        var alarmAction = [];
        alarmAction[0] = AS.URL.executePolicy;
        //如果告警条件为一条的话，只需要调用告警创建API一次；如果告警条件大于一条，则需要调用告警创建API n+1 次
        var alarmParam = {},createAlarmParam;
        var alarmConObj = {};
        alarmConObj.evaluation_periods = 1;
        alarmConObj.period = 5*60;
        alarmConObj.statistic = "avg";
        alarmConObj.query = [];
        var queryObj = {};
        queryObj.field = "resource_id";
        queryObj.op = "eq";
        queryObj.type = "string";
        queryObj.value = groupId;
        alarmConObj.query[0] = queryObj;
        alarmParam.threshold_rule = alarmConObj;
        //创建告警
		var taskAlarmObject = {};
        taskAlarmObject.action = AS.URL.createAlarm;
        taskAlarmObject.type = "POST";
        taskAlarmObject.success = function(result) {
        	var alarmId = result.alarm_id;
			ReviewAndCreate.inAlarmId = alarmId;
            //创建伸缩策略
            if(policyType == "out") {
            	ReviewAndCreate.outAlarmId = alarmId;
            }
        };
        taskAlarmObject.error = function() {
        	$("#createPolicyResult").text("失败");
        	return false;
        };
        
		//如果告警条件为一条的话，只需要调用告警创建API一次；如果告警条件大于一条，则需要调用告警创建API n+1 次
		if(alarmConDataLength == 1) {
			alarmConObj.comparison_operator = alarmConditionData[0].comparison_operator;
            alarmConObj.meter_name = alarmConditionData[0].meter_name;
            alarmConObj.threshold = alarmConditionData[0].threshold;
            alarmParam.alarm_actions = alarmAction;
            alarmParam.repeat_actions = true;
            alarmParam.name = alarmData.name;
            alarmParam.type = "threshold";
            //转换成json串
            createAlarmParam = $.toJSON(alarmParam);
            taskAlarmObject.param = createAlarmParam;
		} else {
			for(var j=0 ;j<alarmConDataLength; j++) {
				//获取系统当前时间构建告警规则的名称
				var currentDate = new Date();
				var currentVal = currentDate.format("yyyyMMddhhmmss");
                alarmConObj.comparison_operator = alarmConditionData[j].comparison_operator;
                alarmConObj.meter_name = alarmConditionData[j].meter_name;
                alarmConObj.threshold = alarmConditionData[j].threshold;
                alarmParam.type = "threshold";
                alarmParam.name = currentVal + j + "_" +policyType;
                //转换成json串
                createAlarmParam = $.toJSON(alarmParam);
                var tasksObject = {};
                tasksObject.action = AS.URL.createAlarm;
                tasksObject.type = "POST";
                tasksObject.param = createAlarmParam;
                tasksObject.success = function(result) {
                	ReviewAndCreate.alarmsIn.push(result.alarm_id);
                    if(policyType == "out") {
                    	ReviewAndCreate.alarmsOut.push(result.alarm_id);
                    }
                };
                tasksObject.error = function() {
                	$("#createPolicyResult").text("失败");
                	return false;
                };
                tasks.push(tasksObject);
            }
			//n 次循环完后，第n+1 次插入,combination parameter
            var combParam = {};
            combParam.name = alarmData.name;
            combParam.type = "combination";
            combParam.alarm_actions = alarmAction;
            combParam.repeat_actions = true;
            //idObj为前面创建的告警规则的id 的集合
            var idObj = {};
            idObj.alarm_ids = [];
            idObj.operator = alarmData.operator;
            combParam.combination_rule = idObj;
            createAlarmParam = $.toJSON(combParam);
            taskAlarmObject.param = createAlarmParam;
            taskAlarmObject.send = function()
            {
                combParam.combination_rule.alarm_ids = ReviewAndCreate.alarmsIn;
                if(policyType == "out")
                {
                    combParam.combination_rule.alarm_ids = ReviewAndCreate.alarmsOut;
                }
                createAlarmParam = $.toJSON(combParam);
                taskAlarmObject.param = createAlarmParam;
            };
		}
		tasks.push(taskAlarmObject);
        return tasks;
	},
	//获取策略信息
	getPolicyParam: function(groupId,policyData) {
        var param = "&AutoScalingGroupId=" + groupId + "&PolicyName=" + policyData.PolicyName
            + "&AdjustStep=" + policyData.AdjustStep + "&Cooldown=" + policyData.Cooldown
            + "&PolicyType=" + policyData.PolicyType + "&PolicyAction=" + policyData.PolicyAction;
        return encodeURI(param);
    },
    //获取策略任务队列
	getPolicyTask: function(groupId,type) {
		var policyObject = {};
        var policyOutData = ExpansionStrategy.getOutPolicyData();
        var policyParam = ReviewAndCreate.getPolicyParam(groupId,policyOutData);
        if(type == "in") {
        	var policyInData = ExpansionStrategy.getInPolicyData();
        	policyParam =  ReviewAndCreate.getPolicyParam(groupId,policyInData);
		}
        policyObject.action = AS.URL.putScalingPolicy + policyParam ;
        policyObject.type = "GET";
        policyObject.success = function(){};
        if(type == "in") {
            policyObject.success = function(){
            	$("#createPolicyResult").text("成功");
            };
        }
        policyObject.error = function(e){
        	$("#createPolicyResult").text("失败");
        };
        return policyObject;
	},
	process_tasks : function(tasks) {
        if(!tasks || tasks.length == 0) return 0;
        var task = tasks.shift();//取出数组中的第一个
        if(task.send) {
            task.send.call(null);
        }
        $.ajax({
            url: task.action,
            data: task.param,
            dataType:"json",
            type: task.type,
            contentType: 'application/json',
            success: function(result) {
                task.success(result);
                ReviewAndCreate.process_tasks(tasks);
            },
            error: function(e) {
                if(task.error) {
                    task.error(e);
                }
            }
        })
	},
	//添加hook
    getHookConfiguration: function(AutoScalingGroupId) {
    	var hookData = GroupHook.getHookInformation();
        var hookObject = {};
        hookObject.type = "POST";
        var hookParam = {};
        var deviceType = hookData.UpStreamDeviceType;
        hookParam.UpStreamDeviceType = deviceType;
        hookParam.HookTypes =  hookData.HookTypes;
        hookParam.AutoScalingGroupId = AutoScalingGroupId;
        hookParam.NotificationMetaData = hookData.NotificationMetaData;
        if(deviceType == "CLOUDERA") {
            hookParam.NotificationIp = hookData.NotificationIp;
        }
        hookObject.action = AS.URL.putLifecycleHook;
        hookObject.param = $.toJSON(hookParam);
        hookObject.success = function(e) {
        	$("#createHookResult").text("成功");
        	AS.wizard.reset();
        	AS.wizard.close();
        	ReviewAndCreate.initGroup(AutoScalingGroupId);
        };
        hookObject.error = function(e) {
        	$("#createHookResult").text("失败");
        };
        return hookObject;
	},
	//初始化伸缩组（首次扩容到最小实例个数）
	initGroup: function(groupId){
		AS.service.initGroup("&AutoScalingGroupId=" + groupId, function(success){
			$.growlUI(Dict.val("common_tip"), "伸缩组初始化进行中，请等待结果！");
			AS.listAS();
			AS.handlerRefresh(groupId);
		}, function(error){
			$.growlUI(Dict.val("common_tip"), "伸缩组初始化失败，请联系管理员进行处理！");
			AS.listAS();
			AS.handlerRefresh(groupId);
		});
	}
};
//更多操作modal
var OperateModal = {	
    instanceTable_1: null,
    instanceTable_2: null,
    instanceTable_3: null,
    chooseRowData : [],
	getChooseInstance : function() {
		OperateModal.chooseRowData = [];
		$(".instance-table input[type='checkbox']:checked").each(function(index, item) {
			OperateModal.chooseRowData.push($(item).attr("id"));
		});
	},
	resetChooseInstance : function(container) {
		$(".instance-table input[type='checkbox']").each(function(index, item) {
			$(item).attr("checked", false);
		});
		OperateModal.chooseRowData = [];
		container.find(".manualAdd").click();
	},
	/***************删除**************************/
	deleteGroup : function() {
		if(AS.chooseRowData == null)	return;
		var params = "&AutoScalingGroupId=" + AS.chooseRowData.id;
		var msg = "确定要删除@吗？";
		$("#deleteModal p").html(msg.replace("@", AS.chooseRowData.AutoScalingGroupName));
		$("#deleteModal").modal("show");
		$("#deleteConfirm").unbind().bind("click",function(){
			AS.service.deleteGroup(params,function(result){
				if(result.DeleteAutoScalingGroupResponse.success == "true"){
					AS.listAS();
					$("#deleteModal").modal("hide");
					$.growlUI(Dict.val("common_tip"), "删除成功！");
				}else{
					$("#deleteModal").modal("hide");
					$.growlUI(Dict.val("common_tip"), "删除失败！");
				}
			});
		});
	},
	renderOperateModal : function(action, container) {
        var autoClick = container.find(".autoAdd");
        var manualClick = container.find(".manualAdd");
        var instanceLi = container.find(".instanceLi");
        //点击事件
        autoClick.click(function(){
        	instanceLi.hide();
        });
        manualClick.click(function(){
        	instanceLi.show();
        });
        var policyAction = "SCALE_IN";
        if(action == "dilatation") {
        	policyAction = "SCALE_OUT";
        }
        /////////////////////渲染数据////////////////
        var chooseData = AS.chooseRowData;
        //初始化生成instance table
		var groupId = chooseData.id;
		var instanceType = chooseData.ResourceType;
		//判断是否“自动更新”是否可用，有伸缩策略时可用，没有伸缩策略时不可用
		AS.service.describePolicies("&AutoScalingGroupId="+ groupId + "&PolicyAction=" + policyAction,
			function(msg) {
				var result = msg.DescribePoliciesResponse;
				if(result==null || result.length==0) {
					autoClick.attr("disabled","disabled");
				}
		});
	    //可扩展实例个数
		var instanceNum;
		if(action == "dilatation"){
	    	instanceNum = chooseData.MaxSize - chooseData.CurrentCount;
			$("#needInsNum_1").text("当前最大可扩展实例个数:" + instanceNum);
	    } else if(action=="release"){
	    	instanceNum = chooseData.CurrentCount;
		    $("#needInsNum_3").text("当前最大可释放实例个数:" + (instanceNum<0?0:instanceNum));
	    } else if(action == "shrink") {
		   //可缩减实例个数
		    instanceNum = chooseData.CurrentCount - chooseData.MinSize;
		    $("#needInsNum_2").text("当前最大可收缩实例个数:" + (instanceNum<0?0:instanceNum));
	    }
	    OperateModal.initInstancePage(groupId, action, instanceType); 
	    OperateModal.resetChooseInstance(container);
	    container.modal("show");
        //提交按钮事件
        $("button.operateSure").unbind("click").bind("click", function(){
        	OperateModal.getChooseInstance();
        	if(action == "shrink" || action=="dilatation") {
        		var isAutoChecked = autoClick.attr("checked");
        		OperateModal.expandOrReduce(action,groupId,instanceNum,isAutoChecked);
        	}
        	if(action == "release" || action == "nanotubes") {
        		OperateModal.collectOrRelease(action,groupId,instanceNum);
        	}
        });
	},
	initInstancePage: function(groupId, operateType, instanceType){
        var name = "物理机名称";
        if(instanceType == "VM"){
			name = "虚拟机名称";
		}
        $("#instance-table-tool-bar").find(".name").html(name);
        OperateModal.createInstanceTable(groupId,operateType,instanceType);
	},
	//还好还有你：果丹皮！
	renderInstanceTable : function(data, operateType, instanceType, tableType) {
		$("#instanceDiv .dataTables_wrapper").hide();
		if(operateType=="dilatation") {//扩容
			$("#instance-table-1").show();
			if(!OperateModal.instanceTable_1){
				var options = OperateModal.initOption(operateType,instanceType,tableType);
				OperateModal.instanceTable_1 = new com.skyform.component.DataTable();
				OperateModal.instanceTable_1.renderByData("#instance-table-1", {
					 "data" : data,					
					 "pageSize" : 5,
					 "columnDefs" : options.columnDefs,
					 "onColumnRender" : options.onColumnRender
				 });
			}else {
				OperateModal.instanceTable_1.updateData(data);
			}
		}
		if(operateType=="shrink") {//缩容
			$("#instance-table-2").show();
			if(!OperateModal.instanceTable_2){
				var options = OperateModal.initOption(operateType,instanceType,tableType);
				OperateModal.instanceTable_2 = new com.skyform.component.DataTable();
				OperateModal.instanceTable_2.renderByData("#instance-table-2", {
					 "data" : data,					
					 "pageSize" : 5,
					 "columnDefs" : options.columnDefs,
					 "onColumnRender" : options.onColumnRender
				 });
			}else {
				OperateModal.instanceTable_2.updateData(data);
			}
		}
		if(operateType=="release") {//释放
			$("#instance-table-3").show();
			if(!OperateModal.instanceTable_3){
				var options = OperateModal.initOption(operateType,instanceType,tableType);
				OperateModal.instanceTable_3 = new com.skyform.component.DataTable();
				OperateModal.instanceTable_3.renderByData("#instance-table-3", {
					 "data" : data,					
					 "pageSize" : 5,
					 "columnDefs" : options.columnDefs,
					 "onColumnRender" : options.onColumnRender
				 });
			}else {
				OperateModal.instanceTable_3.updateData(data);
			}
		}
	},
	createInstanceTable : function(groupId,operateType,instanceType) {
		OperateModal.throughAjaxGetTableData(groupId,operateType,instanceType);
	},
	initOption : function(operateType,instanceType,tableType) {
		var options = {
            selfPaginate: true,
            columnDefs: [
                {name: '',title: '', contentVisiable: 'always', width: 35},
                {title: "实例名称", name: "instanceName",contentVisiable:'always'},
                {title: "类型", name: "ResourceType"},
                {title: "IP", name: "ip", width:200},
                {title: "状态", name: "status"},
                {title: "创建时间", name: "createDate"}
            ]
        };
        if(instanceType != "VM") {
        	options.columnDefs[5].title = "更新时间";
            options.columnDefs[1].title = "机器名";
        }
        //纳管、扩容
        if(operateType == "nanotubes" || operateType == "dilatation") {
        	options.onColumnRender = function(columnIndex,columnMetaData,columnData) {
    			var text = columnData[''+columnMetaData.name] || "";
                if(columnIndex ==0) {
                	var tableId = columnData.InstanceId;
                    if(tableType == "vm") {
                        tableId = columnData.id;
                    }
                    if(tableType == "physical"){
                        tableId = columnData.uuid;
                    }
                    text = "<input type='checkbox' id='"+ tableId + "' name='"+"' onclick='OperateModal.checkButton(this);'>";
                }
                if(columnMetaData.name == "instanceName"){
                    var name = columnData.instanceName;
                    text = name.length>10 ? "<span title='"+name+"'>"+name.slice(0,15)+"..."+"</span>":name;
                }
                if(columnMetaData.name == "ResourceType") {
                	text = AS.ResourceType[instanceType];
                }
                if(columnMetaData.name == "status") {
                	text = com.skyform.service.StateService.getState("vm", columnData.state) || "";
                }
                if(columnMetaData.name == "createDate") {
                	try {
						var obj = eval('(' + "{Date: new Date(" + columnData.createDate + ")}" + ')');
						var dateValue = obj["Date"];
						text = dateValue .format('yyyy-MM-dd hh:mm:ss');
					} catch (e) {

					}
                }
                return text;
    		};
        } else { //缩容、释放
        	options.onColumnRender = function(columnIndex,columnMetaData,columnData){
                var text = columnData[''+columnMetaData.name] || "";
                if(columnIndex ==0){
                    var tableId = columnData.InstanceId;
                    if(tableType == "vm") {
                        tableId = columnData.id;
                    }
                    if(tableType == "physical"){
                        tableId = columnData.uuid;
                    }
                    text = "<input type='checkbox' id='"+ tableId + "' name='"+"' onclick='OperateModal.checkButton(this);'>";
                }
                if(columnMetaData.name == "instanceName"){
                    var name = columnData.InstanceName;
                    text = name.length>10 ? "<span title='"+name+"'>"+name.slice(0,15)+"..."+"</span>":name;
                }
                if(columnMetaData.name == "ResourceType"){
                	text = AS.ResourceType[text];
                }
                if(columnMetaData.name == "status"){
                    text = columnData.InstanceStatus==undefined ? "--" : AS.VMState[columnData.InstanceStatus];
                }
                if(columnMetaData.name == "ip"){
                    text = columnData.IpAddress;
                }
                if(columnMetaData.name == "createDate"){
                	var date = columnData.created;
                    var datesub = date.substring(0, date.indexOf("+"));
                    text = datesub.substring(0, datesub.indexOf("T")) + " " + datesub.substring(datesub.indexOf("T") + 1);
                }
                return text;
            };
        }
        return options;
	},
	checkButton : function(e){
		if($(e).attr("checked")){
			$(e).parents("tbody").find("input[type='checkbox']").each(function(index, item) {
				$(item).attr("checked", false);
			});
			$(e).attr("checked", true);
		}
	},
	//通过ajax请求为table封装数据
	throughAjaxGetTableData : function(groupId,operateType,instanceType){
		var data=[];
        //纳管、扩容
        if(operateType == "nanotubes" || operateType == "dilatation") {
            if(instanceType == "VM") {   //获取虚拟机实例信息
                OperateModal.getVmsData(operateType, instanceType);
            } else {//获取服务器实例信息
                //OperateModal.getPhysicalData(operateType, instanceType);
            }
        } else {
        	OperateModal.getGroupInstancesData(groupId,operateType, instanceType);
        }
	},
	//"纳管"、“扩容”时 获取vm信息，纳管时只获取运行状态的虚拟机
	getVmsData : function(operateType,instanceType) {
		var networkId = AS.chooseRowData.launchConfig.NetworkId || "";
        com.skyform.service.vmService.describeInstancesByGroupIsEmpty(networkId, function(instances){
        	if(instances && instances.length>0) {
        		var datas = [];
        		$(instances).each(function(index, item){
        			if(item.state=="running" || item.state=="closed") {
        				datas.push(item);
        			}
        		});
        		OperateModal.renderInstanceTable(datas, operateType, instanceType, "vm");
        	} else {
        		OperateModal.renderInstanceTable([], operateType, instanceType, "vm");
        	}
		});
	},
	//蔓越莓 good！
	//"纳管"、“扩容”时 获取服务器信息
	getPhysicalData : function(operateType, instanceType) {
		var tableParam = OperateModal.searchPhysicalData();
        Utils.ajaxPostData(AS.URL.phy_physicalList, tableParam, function(success){
        	if(msg.result && msg.result.models>0) {
        		OperateModal.renderInstanceTable(instances, operateType, instanceType, "physical");
        	} else {
        		OperateModal.renderInstanceTable([], operateType, instanceType, "physical");
        	}
        });
	},
	//获取服务器查询参数
    searchPhysicalData: function() {
        var param = {};
        param.is_nanotubes = 1;
        param.is_hypervisor = "0";
        param.state = "UP";
        return param;
    },
	//自动伸缩组下包含的实例信息，”释放“操作时的数据源
	getGroupInstancesData : function(groupId,operateType,instanceType) {
		var tableParam = OperateModal.searchInstanceTable(groupId);
		AS.service.describeAutoScalingInstances(tableParam, function(success){
			var response = success.DescribeAutoScalingInstancesResponse;
			if(response) {
				var data = response.AutoScalingInstance;
        		OperateModal.renderInstanceTable(data, operateType, instanceType, "autoGroup");
        	} else {
        		OperateModal.renderInstanceTable([], operateType, instanceType, "autoGroup");
        	}
		});
	},
	searchInstanceTable : function(groupId) {
        var param = "";
        if(groupId) {
            param += "&AutoScalingGroupId=" + groupId;
        }
        return param;
	},
	/***************扩容/缩容**************************/
	expandOrReduce: function(action,groupId,addInstanceNum, isAutoChecked) {
		var param = "&AutoScalingGroupId=" + groupId;
        //是否自动添加实例
        if(isAutoChecked == "checked") {
        	param += "&IsAuto=true";
            if(addInstanceNum == 0){
                $.growlUI(Dict.val("common_tip"), "可操作的实例个数为0，请取消操作。");
                return;
            }
        }else {
        	param += "&IsAuto=false";
            var instancesIds="";
            var chooseItems = OperateModal.chooseRowData;
            var chooseItemsLength = chooseItems.length;
            if(!chooseItemsLength){
            	$.growlUI(Dict.val("common_tip"), "请选择实例。");
                return;
            } else {
            	if(chooseItemsLength > addInstanceNum) {
                    $.growlUI(Dict.val("common_tip"),"选择的实例个数大于最大可操作的实例个数，请取消多余的选项。");
                    return;
                }
            	for(var i=0; i<chooseItemsLength; i++) {
                    if(i==0) {
                        instancesIds = chooseItems[0];
                    } else {
                        instancesIds += "," + chooseItems[i];
                    }
                }
            }
            param += "&InstanceId=" + instancesIds + "&EnableHook=true";
        }
        //send ajax
        if(action == "dilatation")  {//扩容
        	$("#operateModal_1").modal('hide');
        	//扩容前先检查配额
        	$.growlUI(Dict.val("common_tip"), "配额检查中，请稍后... ...");
        	//查询所需资源
        	AS.service.describeAutoScalingAndConfig("&AutoScalingGroupId="+groupId, function(success){
        		//sophia
        		var cpu = 0;
        		var memory = 0;
        		var diskstorage = 0;
        		var vmCount = 1;
        		var data = success.DescribeAutoScalingAndConfigResponse.scalinggroup;
        		if(data && data.length>0){
        			var group = data[0];
        			cpu = group.Cpu * group.DefaultAdjustStep;
        			memory = group.Memory * group.DefaultAdjustStep;
        			diskstorage = group.DiskSize * group.DefaultAdjustStep;
        			vmCount = group.DefaultAdjustStep;
        		}
        		//校验配额
        		var az="";
        		com.skyform.service.resQuotaService.queryQuotaAllCount(portalUser.name, az,function(success){
            		var cpuQuota = 0;
            		var memoryQuota = 0;
            		var storageQuota = 0;
            		var vmQuota = 0;
            		if(success && success.length>0) {
            			cpuQuota = success[0].quotaTotal.cpu - success[0].quotaUesed.cpu;
            			memoryQuota = success[0].quotaTotal.mem - success[0].quotaUesed.mem;
            			storageQuota = success[0].quotaTotal.storageQuota - success[0].quotaUesed.osdisk;
            			vmQuota = success[0].quotaTotal.serverQuota - success[0].quotaUesed.serverQuota;
            		}
            		if(cpuQuota>=cpu && memoryQuota>=memory && storageQuota>=diskstorage && vmQuota >=vmCount) {
            			//发送请求
            			AS.service.group_scale_out(param, function(success){
                			$.growlUI(Dict.val("common_tip"), "扩容操作已提交，请等待结果。");
                			AS.listAS();
                			AS.handlerRefresh(groupId);
                		}, function(error){
                			var msg = error.ExceptionResponse.Exception.ErrorText;
                			$.growlUI(Dict.val("common_tip"), "操作失败："+msg);
                		});
            		} else {
            			$.growlUI(Dict.val("common_tip"), "配额不足，请先清理闲置资源以释放配额。");
            		}
            	});
        	});
        } else {
        	AS.service.group_scale_in(param, function(success){
    			$("#operateModal_2").modal('hide');
    			$.growlUI(Dict.val("common_tip"), "缩容操作已提交，请等待结果。");
    			AS.listAS();
    			AS.handlerRefresh(groupId);
    		}, function(error){
    			$("#operateModal_2").modal('hide');
    			var msg = error.ExceptionResponse.Exception.ErrorText;
    			$.growlUI(Dict.val("common_tip"), "操作失败："+msg);
    		});
        }
	},
	/***************纳管/释放**************************/
	collectOrRelease: function(action,groupId,addInstanceNum) {
		var param , operateUrl;
        var instancesIds="";
        var chooseItems = OperateModal.chooseRowData;
        var chooseItemsLength = chooseItems.length;
        if(!chooseItemsLength){
            $.growlUI(Dict.val("common_tip"), "请选择实例。");
            return;
        }
        if(chooseItemsLength > addInstanceNum) {
            $.growlUI(Dict.val("common_tip"), "选择的实例个数大于最大可操作的实例个数，请取消多余的选项。");
            return;
        }
        param = "&AutoScalingGroupId=" + groupId;
        for(var i=0; i<chooseItemsLength; i++) {
            if(i==0) {
                instancesIds = chooseItems[0];
            } else {
                instancesIds += "," + chooseItems[i];
            }
        }
        param += "&InstanceIds=" + instancesIds;
        //send ajax
        if(action == "release"){
        	AS.service.group_detach_instances(param, function(success){
      			$("#operateModal_3").modal('hide');
      			$.growlUI(Dict.val("common_tip"), "释放成功!");
    			AS.listAS();
    		});
        } 
//        else {//纳管
//        	param += "&ResourceType=" + instanceType;
//        	AS.service.group_attach_instances(param, function(success){
//      			$("#operateModal").modal('hide');
//      			$.growlUI(Dict.val("common_tip"), "纳管成功!");
//    			AS.listAS();
//    		});
//        }
	}
};
function validateAZone(){
	var result = {status : true};
	if(!AS.azSelect.getAzSelectValue()){
		$(".zoneError").show();
		result.status = false;
	} else {
		$(".zoneError").hide();
		result.status = true;
	}
	return result;
}
function validateImages(el){
	var result = {status : true};
	if(!Utils._required(el)){
		$(".templatesError").show();
		result.status=false;
	} else {
		$(".templatesError").hide();
		result.status=true;
	}
	return result;
}
function validateNetworks(el) {
	var result = {status : true};
	if(!Utils._required(el)){
		$(".networksError").show();
		result.status=false;
	} else {
		$(".networksError").hide();
		result.status=true;
	}
	return result;
}
function validateSG(el) {
	var result = {status : true};
	if(!Utils._required(el)){
		$(".sgError").show();
		result.status=false;
	} else {
		$(".sgError").hide();
		result.status=true;
	}
	return result;
}
function validateCpu(el){
	var result = {status : true};
	var value = $(el).val().trim();
	if(Utils._required(el) && Utils._positiveInteger(el) && value>=1 && value<=32){
		$(".cpuError").hide();
		result.status=true;
	} else {
		$(".cpuError").show();
		result.status=false;
	}
	return result;
}
function validateMemory(el) {
	var result = {status : true};
	var value = $(el).val().trim();
	if(!Utils._positiveInteger(el)){
		$(".memoryError").show();
		result.status=false;
	} else {
		$(".memoryError").hide();
		result.status=true;
	}
	return result;
}
function validateDisk(el) {
	var result = {status : true};
	var value = $(el).val().trim();
	var placeholder = $(el).attr("placeholder");
	if(Utils._integer(el) && parseInt(value)>=parseInt(placeholder)){
		$(".osDiskError").hide();
		result.status=true;
	} else {
		$(".osDiskError").show();
		result.status=false;
	}
	return result;
}
function validateGroupName(el) {
	var result = {status : true};
	if(Utils._required(el) && Utils._maxlength(el, 50)){
		$(".groupNameError").hide();
		result.status=true;
	} else {
		$(".groupNameError").show();
		result.status=false;
	}
	return result;
}
function validateGroupMax(el) {
	var result = {status : true};
	if(Utils._required(el)){
		$(".groupMaxError").hide();
		result.status=true;
	} else {
		$(".groupMaxError").show();
		result.status=false;
	}
	return result;
}
function validateOutName(el) {
	var result = {status : true};
	var checkRadio = $("#configSaclingPolicies").attr("checked");
    if( checkRadio == "checked") {
    	if(Utils._required(el) && Utils._maxlength(el, 30)){
    		$(".outNameError").hide();
    		result.status=true;
    	} else {
    		$(".outNameError").show();
    		result.status=false;
    	}
    }
	return result;
}
function validateStep(el) {
	var result = {status : true};
	var checkRadio = $("#configSaclingPolicies").attr("checked");
    if( checkRadio == "checked") {
    	if(Utils._positiveInteger(el)){
    		$(".stepError").hide();
    		result.status=true;
    	} else {
    		$(".stepError").show();
    		result.status=false;
    	}
    }
	return result;
}
function validateCoolTime(el) {
	var result = {status : true};
	var checkRadio = $("#configSaclingPolicies").attr("checked");
    if( checkRadio == "checked") {
    	if(Utils._positiveInteger(el)){
    		$(".coolTimeError").hide();
    		result.status=true;
    	} else {
    		$(".coolTimeError").show();
    		result.status=false;
    	}
    }
	return result;
}
function validateAlarmDesc(el) {
	var result = {status : true};
	var checkRadio = $("#configSaclingPolicies").attr("checked");
    if( checkRadio == "checked") {
    	if(Utils._required(el)){
    		$(".alarmDescError").hide();
    		result.status=true;
    	} else {
    		$(".alarmDescError").show();
    		result.status=false;
    	}
    }
	return result;
}
function validateInName(el) {
	var result = {status : true};
	var checkRadio = $("#configSaclingPolicies").attr("checked");
    if( checkRadio == "checked") {
    	if(Utils._required(el) && Utils._maxlength(el, 30)){
    		$(".inNameError").hide();
    		result.status=true;
    	} else {
    		$(".inNameError").show();
    		result.status=false;
    	}
    }
	return result;
}
function validateInStep(el) {
	var result = {status : true};
	var checkRadio = $("#configSaclingPolicies").attr("checked");
    if( checkRadio == "checked") {
    	if(Utils._positiveInteger(el)){
    		$(".inStepError").hide();
    		result.status=true;
    	} else {
    		$(".inStepError").show();
    		result.status=false;
    	}
    }
	return result;
}
function validateInCoolTime(el) {
	var result = {status : true};
	var checkRadio = $("#configSaclingPolicies").attr("checked");
    if( checkRadio == "checked") {
    	if(Utils._positiveInteger(el)){
    		$(".inCoolTimeError").hide();
    		result.status=true;
    	} else {
    		$(".inCoolTimeError").show();
    		result.status=false;
    	}
    }
	return result;
}
function validateInAlarmDesc(el) {
	var result = {status : true};
	var checkRadio = $("#configSaclingPolicies").attr("checked");
    if( checkRadio == "checked") {
    	if(Utils._required(el)){
    		$(".inAlarmDescError").hide();
    		result.status=true;
    	} else {
    		$(".inAlarmDescError").show();
    		result.status=false;
    	}
    }
	return result;
}
function validateHookDeviceType(el) {
	var result = {status : true};
	var checked = $("#hookRadio").attr("checked");
    if(checked == "checked") {
    	if(Utils._required(el)){
    		$(".hookDeviceTypeError").hide();
    		result.status=true;
    	} else {
    		$(".hookDeviceTypeError").show();
    		result.status=false;
    	}
    }
    return result;
}
function validateExecutionTime(el) {
	var result = {status : true};
	var checked = $("#hookRadio").attr("checked");
    if(checked == "checked") {
    	var checkBox = $("input:checkbox[name=executionTime]:checked");
        var length = checkBox.length;
        if(length>0){        
    		$(".executionTimeError").hide();
    		result.status=true;
    	} else {
    		$(".executionTimeError").show();
    		result.status=false;
    	}
    }
    return result;
}
function validateElbselect(el) {
	var result = {status : true};
	var checked = $("#hookRadio").attr("checked");
    if(checked == "checked") {
    	if(Utils._required(el)){
    		$(".elbselectError").hide();
    		result.status=true;
    	} else {
    		$(".elbselectError").show();
    		result.status=false;
    	}
    }
    return result;
}
function validatePort(el) {
	var result = {status : true};
	var checked = $("#hookRadio").attr("checked");
    if(checked == "checked") {
    	var value = $(el).val().trim();
    	if(Utils._required(el) && Utils._positiveInteger(el) && value>=0 && value<=35536){
    		$(".portError").hide();
    		result.status=true;
    	} else {
    		$(".portError").show();
    		result.status=false;
    	}
    }
    return result;
}
//验证名称
function validateAlarmName(field) {
	var result = {status : true};
	var checkRadio = $("#configSaclingPolicies").attr("checked");
    if( checkRadio == "checked") {
    	var val = field.val();
    	if(!val) {
    		$(".alarmNameError").show();
    		result.status=false;
    	} else {
    		if(val.length > 50) {
    			$(".alarmNameError").show();
        		result.status=false;
    		} else {
    			$(".alarmNameError").hide();
        		result.status=true;
    		}
    	}
    }
	return result;
}
//验证告警指标
function validateMetric(type, field) {
	var result = {status : true};
	var val = field.val(), flag = 0;
	var $metric = $("td[type='"+type+"']").find(".metric");
	var metricLength = $metric.length;
    if(metricLength > 1) {
        for(var i=0; i<metricLength; i++) {
        	var metricVal = $($metric[i]).val();
            if(val == metricVal) {
                flag ++;
            }
        }
        if(flag >1) {
        	$(".metricError").show();
    		result.status=false;
        } else {
        	
        	$(".metricError").hide();
    		result.status=true;
        }
    }
	return result;
}
//验证阈值信息
function validateThreshold(field) {
	var result = {status : true};
	var reNum = /^\d+(\.\d+)?$/; //正数
	var val = field.val().trim();
	var metric = field.parent().parent().find(".metric").val();
	if(!val){//required
		$(".thresholdError").show();
		result.status=false;
	}else {
		if(!reNum.test(val)) {//Integer
			$(".thresholdError").show();
			result.status=false;
		} else {
			if((metric.indexOf("cpu") != "-1" || metric.indexOf("memory") != "-1") && parseInt(val) > 100) {//max
				$(".thresholdError").show();
				result.status=false;
			} else {
				$(".thresholdError").hide();
				result.status=true;
			}
		}
	}
	return result;
}
//验证步长
function validateAdjustStep(value, errorContainer){
	var result = {status : true};
	if(value){
		if(parseInt(value)>=1){
			$(errorContainer).hide();
			result.status=true;
		} else {
			$(errorContainer).show();
			result.status=false;
		}
	}
	return result;
}
function validateDefaultAdjustStep(field){
	var val = field.val().trim();
	return validateAdjustStep(val, $(".defaultAdjustStepError"));
}
function validateStep(field){
	var val = field.val().trim();
	return validateAdjustStep(val, $(".stepError"));
}
function validateInStep(field){
	var val = field.val().trim();
	return validateAdjustStep(val, $(".inStepError"));
}
//验证冷却时间
function validateCoolDown(value, errorContainer){
	var result = {status : true};
	if(value){
		if(parseInt(value)>=300){
			$(errorContainer).hide();
			result.status=true;
		} else {
			$(errorContainer).show();
			result.status=false;
		}
	}
	return result;
}
function validateDefaultCoolDown(field) {
	var val = field.val().trim();
	return validateCoolDown(val, $(".defaultCoolDownError"));
}
function validateCoolTime(field) {
	var val = field.val().trim();
	return validateCoolDown(val, $(".coolTimeError"));
}
function validateInCoolTime(field) {
	var val = field.val().trim();
	return validateCoolDown(val, $(".inCoolTimeError"));
}
