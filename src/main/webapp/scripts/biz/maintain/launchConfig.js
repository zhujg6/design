//当前刷新实例的类型为虚拟机
window.currentInstanceType='lc';
window.Controller = {
		init : function(){
			LC.init();		
		},
		refresh : function(){
			LC.describleLC();			
		}
	};

var LC = {
    currentPool:null,
    resourcePools:null,
    userId:null,
    account:null,
    launchConfigurationId:null,
    AutoScalingGroupId:null,
	inited : false,
	wizard : null,
	instanceName : null,
	selectedInstanceId : null,
	inMenu : null,
	datatable : new com.skyform.component.DataTable(),
	service : com.skyform.service.LaunchConfigService,
	lastCheckedArr:null,
	init : function() {
		LC.currentPool=$("#currentPool").val();
		LC.resourcePools=$("#resourcePools").val();
		LC.userId=$("#userId").val();
		LC.account=$("#account").val();
		LC.inMenu = false; // 用于判断鼠标当前是否在下拉操作框中即$("#contextMenu")和$("#dropdown-menu")
		LC.selectedInstanceId = null;
		LC.instanceName = null;
		LC.instances = [],
		$("#content_container #checkAll").attr("checked", false);
		$("#tbody1 input[type='checkbox']").attr("checked", false);
		$("#moreAction").addClass("disabled");

		$("#dropdown-menu").unbind('mouseover').bind('mouseover', function() {
			LC.inMenu = true;
		});
		$("#dropdown-menu").unbind('mouseout').bind('mouseout', function() {
			LC.inMenu = false;
		});
		$("#dropdown-menu li").unbind('click').bind('click', function(e) {
			if (!$(this).hasClass("disabled"))
				LC.onOptionSelected($(this).attr("action"));
		});

		$("#updateData").unbind().click(function() {
			LC.describleLC();
		});
		$("#executePolicy").unbind().click(function() {
			$("#myModal").modal("show");
			$("#add").bind("click",function(){
				LC.addAlarms();
			});
			$("#cancel").bind("click",function(){
				$("#myModal").modal("hide");
			});
		});
		LC.describleLC();
		$("a#createLC").unbind().click(LC.createLC);
		$("#cpu").blur(function(){
			if($.trim(""+$("#cpu").val()) != '') {
				$("#tip_cpu").empty();
			}
		});
		$("#memory").blur(function(){
			if($.trim(""+$("#memory").val()) != '') {
				$("#tip_memory").empty();
			}
		});
		$("#autoScalingGroupName").blur(function(){
			if($.trim(""+$("#autoScalingGroupName").val()) != '') {
				$("#tip_scalingGroupName").empty();
			}
		});
		$("#minSize").blur(function(){
			if($.trim(""+$("#minSize").val()) != '') {
				$("#tip_minSize").empty();
			}
		});
		$("#maxSize").blur(function(){
			if($.trim(""+$("#maxSize").val()) != '') {
				$("#tip_maxSize").empty();
			}
		});
		$("#policyName").blur(function(){
			if($.trim(""+$("#policyName").val()) != '') {
				$("#tip_policyName").empty();
			}
		});
		$("#name").blur(function(){
			if($.trim(""+$("#name").val()) != '') {
				$("#name").next().hide();
				$("#tip_name").empty();
			}
		});
		$("#threshold").blur(function(){
			if($.trim(""+$("#threshold").val()) != '') {
				$("#threshold").next().hide();
				$("#tip_threshold").empty();
			}
		});
	},
	getInstanceInfoById : function(instanceId) {
		var result = null;
		$(LC.instances).each(function(i,instance){
			if(instance.id+"" == instanceId+"") {
				result = instance;
				return false;
			}
		});
		return result;
	},
	initResourcePool:function(offLineBill){
		var poolContainer = $("#resourcePool");
		poolContainer.empty();
		var portalType = Dcp.biz.getCurrentPortalType();
		var strpools = LC.resourcePools;
		if("public" == portalType){ //3a只开放huhehaote资源池 updata by CQ 20151105 
			strpools = "huhehaote";
		}
		var pools = [];
		if ($.trim(strpools) != "" && strpools != null && strpools != "null") {
			  pools = strpools.split(",");
				$(pools).each(function(i) {
					if(pools[i] == LC.currentPool){
						$("<option value='"+pools[i]+"'  selected>"+CommonEnum.pools[pools[i]]+"</option>").appendTo(poolContainer);
					}else{
						$("<option value='"+pools[i]+"'  >"+CommonEnum.pools[pools[i]]+"</option>").appendTo(poolContainer);
					}			
				});
		}else{
			$("<option value='"+CommonEnum.currentPool+"'  selected>"+CommonEnum.pools[CommonEnum.currentPool]+"</option>").appendTo(poolContainer);
		}
	},
	initOsList:function(){		
		var condition={};
		var rescourePoolName=$("#pool option:selected").attr("value");
		var portalType = Dcp.biz.getCurrentPortalType();
		condition.portalType=portalType;
		condition.imageId="common";
		condition.mirrorType="1";
		condition.rescourePoolName=rescourePoolName;
		condition.billType=5;
		com.skyform.service.vmService.getOs(condition,function(data){
			var osContainer = $("#imageId");
			osContainer.empty();
			$(data).each(function(i,os){
				$("<option value='" + os.value + "' >" + os.desc + "</option>").appendTo(osContainer);
			});
		});
	},
	initNetWork:function(){
		com.skyform.service.privateNetService.query({state:'running'},function (subnets){
			var subnetContainer = $("#privateNetWork");
			subnetContainer.empty();
			$(subnets).each(function(i,subnet){
				if('using' == subnet.state||'running'== subnet.state){
					$("<option value='" + subnet.id + "' >" + subnet.name + "</option>").appendTo(subnetContainer);
				}
			});
		},function(error){
			ErrorMgr.showError(error);
		});
	},
	initLbVolumes:function(){
		com.skyform.service.LBService.listAll(function (data){
			var lbContainer = $("#loadBalance");
			lbContainer.empty();
			$(data).each(function(i,lb){
				if('using' == lb.state||'running'== lb.state){
					$("<option value='" + lb.id + "' >" + lb.instanceName + "</option>").appendTo(lbContainer);
				}
			});
		},function(error){
			ErrorMgr.showError(error);
		});
	},
	createLC : function() {	
		//初始化资源池
		LC.initResourcePool(CommonEnum.offLineBill);
		//初始化模版
		LC.initOsList();
		//初始化网络
		LC.initNetWork();
		//初始化负载均衡
        LC.initLbVolumes();		
		if (LC.wizard == null) {
			LC.wizard = new com.skyform.component.Wizard("#wizard-createVM");
			LC.wizard.onLeaveStep = function(from, to) {
				if(1 == to){
				}
				if(2 == to){
					//每次进入伸缩策略是清空alarmId，清除缓存数据
					$("#alarmId").val("");
					$("#alarmConfig").val("");
					$("#policyType").click(function(){
						if($("#policyType").val()=="ALARM_TRIGGERED"){
							$("#alarmConfigDiv").attr("style","display:block");
						}else{
							$("#alarmConfigDiv").attr("style","display:none");
							$("#alarmConfig").val("");
						}
					});
					$("#policyType").click();
				}
				if(3 == to){
					$("input[type='checkbox'][name='hookTypes']").each(function(){  
						$(this).attr({checked:"checked"}); 
				  	  });
				}
			};
			LC.wizard.onToStep = function(from, to) {
				if(0 == from){
				}
				if(0 < from){
				}				
			};
			LC.wizard.onFinish = function(from, to) {	
				var params={
						Action:"CreateLaunchConfiguration",
						ImageId:$("#imageId").val(),
						Cpu:$("#cpu").val(),
						Memory:$("#memory").val(),
						NetworkId:$("#privateNetWork").val(),
						AccountName:LC.account,
						UserId:LC.userId,
						ResourcePoolId:$("#resourcePool").val()
				};
				LC.createLaunchConfiguration(LC.getParams(params));
				console.info(LC.launchConfigurationId);
			};
		}
		LC.wizard.markSubmitSuccess();
		LC.wizard.reset();
		LC.wizard.render(function onShow(){
		})
		LC.wizard.render(function(){
		});
	},
	getParams:function(params){
		var urlParams="";
		$.each(params,function(index,value){
			urlParams+="&"+index+"="+value;
		});
		return urlParams;
	},
	createLaunchConfiguration:function(params){
		LC.ajaxPost("/pr/createLaunchConfiguration", {params:params}, function sucfun(data){
			if(data.code==0){//将responseName赋值给launchConfigurationId全局变量，作为创建伸缩组的参数launchConfigurationId
				LC.launchConfigurationId=data.responseName;
				var groupParams={
						  Action:"CreateAutoScalingGroup",
						  DefaultCooldown:$("#defaultCooldown").val(),
						  ResourceType:"VM",
						  LaunchConfigurationId:LC.launchConfigurationId,
						  MaxSize:$("#maxSize").val(),
						  MinSize:$("#minSize").val(),
						  LoadBalance:$("#loadBalance").val(),
						  DefaultAdjustStep:$("#defaultAdjustStep").val(),
						  GroupType:$("#groupType").val()
					}
				console.info(groupParams);
				LC.CreateAutoScalingGroup(LC.getParams(groupParams));
			}else{
				$.growlUI("提示", "创建启动配置失败");
			}
		}, function errfun(msg){
			$.growlUI("提示", "创建启动配置失败");
		});
		
	},
	CreateAutoScalingGroup:function(params){
		LC.ajaxPost("/pr/createAutoScalingGroup", {params:params,autoScalingGroupName:$("#autoScalingGroupName").val()}, function sucfun(data){
			if(data.code==0){
				LC.AutoScalingGroupId=data.responseName;
				var policyParams={
						  Action:"PutScalingPolicy",
						  AutoScalingGroupId:LC.AutoScalingGroupId,
						  AdjustStep:$("#adjustStep").val(),
						  Cooldown:$("#cooldown").val(),
						  PolicyType:$("#policyType").val(),
						  ResourceType:"VM",
						  AlarmId:$("#alarmId").val(),
						  PolicyAction:$("#policyAction").val()
					}
				console.info(policyParams);
				LC.PutScalingPolicy(LC.getParams(policyParams));
			}else{
				$.growlUI("提示", "伸缩组创建失败");
				LC.wizard.close();
			}
		}, function errfun(msg){
			$.growlUI("提示", "伸缩组创建失败");
			LC.wizard.markSubmitError();
		});
		
	},
	PutScalingPolicy:function(params){
		LC.ajaxPost("/pr/putScalingPolicy", {params:params,policyName:$("#policyName").val()}, function sucfun(data){
			if(data.code==0){
				 var hookTypes="";
			  	  $("input[type='checkbox'][name='hookTypes']:checked").each(function(){  
			  		hookTypes+=$(this).val()+",";  
			  	  });
			  	if(hookTypes.length>0){
			  		hookTypes=hookTypes.substring(0,hookTypes.length-1);
			  	  }
				var hookParams={
						  Action:"PutLifecycleHook",
						  UpStreamDeviceType:$("#upStreamDeviceType").val(),
						  LifecycleHookName:$("#adjustStep").val(),
						  Cooldown:$("#cooldown").val(),
						  PolicyType:$("#policyType").val(),
						  ResourceType:"VM",
						  HookTypes:hookTypes,
						  AutoScalingGroupId:LC.AutoScalingGroupId,
						  PolicyAction:$("#policyAction").val()
					}
				console.info(hookParams);
				LC.PutLifecycleHook(LC.getParams(hookParams));
			}else{
				$.growlUI("提示", data.msg);
				var hookParams={
						  Action:"PutLifecycleHook",
						  UpStreamDeviceType:$("#upStreamDeviceType").val(),
						  LifecycleHookName:$("#adjustStep").val(),
						  Cooldown:$("#cooldown").val(),
						  PolicyType:$("#policyType").val(),
						  ResourceType:"VM",
						  HookTypes:$("#hookTypes").val(),
						  AutoScalingGroupId:LC.AutoScalingGroupId,
						  PolicyAction:$("#policyAction").val()
					}
				console.info(hookParams);
				LC.PutLifecycleHook(LC.getParams(hookParams));
			}
		}, function errfun(msg){
			$.growlUI("提示", "伸缩策略创建失败");
			LC.wizard.markSubmitError();
			LC.wizard.close();
		});
	},
	PutLifecycleHook:function(params){
		var jsonObj={
				firewall_id:"",
				hostIds:"",
				port:"",
				protocol:""
				};
		Dcp.biz.apiAsyncRequest("/instance/lb/describeLbRule", {lbid:parseInt($("#loadBalance").val())}, function(data) {
			if(data.code==0){
				if(data.data!="[]"){
					jsonObj.firewall_id=data.data[0].id;
					jsonObj.hostIds=data.data[0].lbid;
					jsonObj.port=$("#port").val();
					jsonObj.protocol=data.data[0].protocol;
				}
			}
		});
		console.info(jsonObj);
		var notificationMetaData=JSON.stringify(jsonObj);
		LC.ajaxPost("/pr/putLifecycleHook", {params:params,notificationMetaData:notificationMetaData}, function sucfun(data){
			if(data.code==0){
			}else{
				$.growlUI("提示", "伸缩组hook创建失败");
			}
			LC.wizard.markSubmitSuccess();
			LC.wizard.close();
			LC.describleLC();
		}, function errfun(){
			$.growlUI("提示", "伸缩组hook创建失败");
			LC.wizard.markSubmitError();
			LC.wizard.close();
		});
		
		
	},
	addAlarms:function(){
		var scoreRegName = /^[\u4E00-\u9FA0A-Za-z\-0-9\_]+$/;
		$("#tip_name").empty();
		if($.trim(""+$("#name").val()) == ''&&! scoreRegName.exec($.trim(""+$("#name").val()))) {
			$("#name").next().show();
			$("#tip_name").empty().html("* 请填写不包括非法字符的告警名称！");
			return;
		}
		var scoreRegThreshold=/^(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*))$/;
		$("#tip_threshold").empty();
		if($.trim(""+$("#threshold").val()) == ''){
			$("#threshold").next().show();
			$("#tip_threshold").empty().html("* 请填写浮点数的阀值！");
			return;
		}
		if(!scoreRegThreshold.exec($.trim(""+$("#threshold").val()))) {
			$("#threshold").next().show();
			$("#tip_threshold").empty().html("* 请填写浮点数的阀值！");
			return;
		}
		var params={  
			    "name": $("#name").val(),  
			    "type": "threshold",  
			    "threshold_rule": {  
			        "comparison_operator": $("#operator").val(),  
			        "evaluation_periods": 1,  
			        "meter_name": $("#meterName").val(),  
			        "period": 300,  
			        "query": [  
			            {  
			                "field": "resource_id",  
			                "op": "eq",  
			                "type": "string",  
			                "value": "2a4d689b-f0b8-49c1-9eef-87cae58d80db"  
			            }  
			        ],  
			        "statistic": "avg",  
			        "threshold": $("#threshold").val()  
			    },  
			    "alarm_actions": [  
			        "http://192.168.31.25:8080/scaling/ExecutePolicy"  
			    ],  
			    "repeat_actions": true
			};
		LC.ajaxPost("/pr/addAlarms", {params:JSON.stringify(params)}, function sucfun(data){
			var dataset = $.parseJSON(data);
			if(dataset.alarm_id!=null&&dataset.alarm_id!=""){
				$("#alarmId").val(dataset.alarm_id);
				$("#alarmConfig").val(dataset.name+"\r\n条件："+dataset.threshold_rule.meter_name+" "+LC.service.getOperatorType(dataset.threshold_rule.comparison_operator)+" "+dataset.threshold_rule.threshold);
			}
			if(dataset.error_message){
				$.growlUI("提示", dataset.error_message.faultstring);
			}
			$("#myModal").modal("hide");
		}, function errfun(msg){
			$.growlUI("提示", "创建告警失败");
			$("#myModal").modal("hide");
		});
	},
	deleteLaunchConfig : function(lbIds) {
		var tr=LC.getCheckedArr();
		var id=tr.parents("tr").attr("id");
		if(id==null||id==undefined){
			$.growlUI("提示", "请选择一条记录");
			return;
		}
		var confirmModal = new com.skyform.component.Modal(new Date().getTime(),"销毁伸缩组","<h4>您确认要销毁伸缩组吗?</h4>",{
			buttons : [
				{
					name : "确定",
					onClick : function(){
						// 删除LB存储
						var params = {
								"Action":"DeleteAutoScalingGroup",
								"AutoScalingGroupId" : id
						};
						$.ajax({
							type     : "GET",
							url      : Dcp.getContextPath() +"/pr/deleteAutoScalingGroup" ,
							data:    {params:LC.getParams(params)},
							datatype : "json", //设置获取的数据类型为json
							timeout  : 5000,
							async    : false,
							global   : false,
							success  : function(data) {
								var dataSet=$.parseJSON(data);
								if(dataSet.DeleteAutoScalingGroupResponse.success){
									$.growlUI("提示", "删除伸缩组成功");
								}else{
									$.growlUI("提示", "删除伸缩组失败");
								}
								confirmModal.hide();
								LC.describleLC();
							},
							error    : function(msg) {
								$.growlUI("提示", "删除伸缩组失败");
								confirmModal.hide();
							}
						});
					},
					attrs : [
						{
							name : 'class',
							value : 'btn btn-primary'
						}
					]
				},
				{
					name : "取消",
					attrs : [
						{
							name : 'class',
							value : 'btn'
						}
					],
					onClick : function(){
						confirmModal.hide();
					}
				}
			]
		});
		confirmModal.setWidth(300).autoAlign();
		confirmModal.show();
	},
	describleLC : function() {
		if(LC.inited) LC.datatable.container.find("tbody").html("<tr ><td colspan='7' style='text-align:center;'><img src='"+CONTEXT_PATH+"/images/loader.gif'/><strong>"+Dict.val("common_retrieving_data_please_wait")+"</strong></td></tr>");
		var param={Action:'DescribeAutoScalingGroups'};
		LC.ajaxGet("/pr/describeAutoScalingGroups", {params:LC.getParams(param)}, function sucfun(data){
			if(data.code==0){
				var dataset = $.parseJSON(data.msg);
				LC.renderDataTable(dataset.DescribeAutoScalingGroupsResponse.scalinggroup);
			}
		});
	},
	renderDataTable : function(data) {
		if(LC.inited){
			LC.datatable.updateData(data);
			return;
		}
		LC.datatable.renderByData(
						"#tbody1",// 要渲染的table所在的jQuery选择器
						{
							"data" : data, // 要渲染的数据选择器					
							"pageSize" : 5,
							"onColumnRender" : function(columnIndex,columnMetaData, columnData) {
								var text = '';
								if(columnMetaData.name=='id') {
						              return '<input type="checkbox" name="check" id="' + columnData.id + '" value="'+columnData.id+'">';
						           } else if ("Created" == columnMetaData.name) {
						        	   var strTime=columnData.Created.replace("T"," ");
						        	   var result=strTime.substring(0,strTime.indexOf("+"));
						        	   /*var date = new Date(columnData.Created);
						        	   text =date.format('yyyy-MM-dd hh:mm:ss');
						        	   console.info(text);*/
									   return result;
									}else if ("Status" == columnMetaData.name) {
										return LC.service.getStatusType(columnData.Status);
										}
								
								return columnData[columnMetaData.name];
							},
							
							"afterRowRender" : function(rowIndex, data, tr) {
								
								tr.attr("id",data.id);
								tr.attr("name",data.AutoScalingGroupName);
								
								tr.attr("status",data.Status);
								tr.attr("instanceId",data.id);
								tr.attr("launchConfigurationId",data.LaunchConfigurationId);
								tr.attr("minSize",data.MinSize);
								tr.attr("maxSize",data.MaxSize);
								tr.attr("resourceType",data.ResourceType);
								tr.attr("loadBalance",data.LoadBalance);
								tr.attr("defaultCooldown",data.DefaultCooldown);
								tr.attr("defaultAdjustStep",data.DefaultAdjustStep);
								tr.attr("currentCount",data.CurrentCount);
								tr.attr("groupType",data.GroupType);
								
								LC.bindEventForTr(rowIndex, data, tr);
							},
							"afterTableRender" : function() {
								LC.bindEvent();
//								$("#tbody1 tbody").find("tr").css("background-color","");
								var firstRow = $("#tbody1 tbody").find("tr:eq(0)");
								var	instanceId = firstRow.attr("instanceId");
								var instance = LC.getInstanceInfoById(instanceId);
								//LC.showInstanceInfo(instance);//加载数据之后不再查询关联信息和日志
								firstRow.css("background-color","#BCBCBC");
								LC.setSelectRowBackgroundColor(firstRow);
							}
							
						});
		LC.inited = true;
		LC.datatable.addToobarButton("#toolbar4tbl");
		LC.datatable.enableColumnHideAndShow("right");
	},
	bindEventForTr : function(rowIndex, data, tr) {

		$(tr).unbind().mousedown(
			function(e) {
				
				if (3 == e.which) {
					$("#tbody1 input[type='checkbox']").attr("checked", false);
					$("#content_container #checkAll").attr("checked", false);
					tr.find("input[type='checkbox']").attr("checked", true);
					LC.selectedInstanceId = tr.attr("instanceId");
					$("#moreAction").removeClass("disabled");
					document.oncontextmenu = function() {
						return false;
					}
					var screenHeight = $(document).height();
					var top = e.pageY;
					
					if (e.pageY >= screenHeight / 2) {
						top = e.pageY - $("#contextMenu").height();
						// 如果鼠标所在位置在屏幕高度中线的下半部分，则弹出框往上弹出
					}
					$("#contextMenu").hide();
					$("#contextMenu").attr(
							"style",
							"display: block; position: absolute; top:"
									+ top + "px; left:" + e.pageX
									+ "px; width: 180px;");
					$("#contextMenu").show();
					e.stopPropagation();
					LC.checkSelected(data);

				}
				LC.showInstanceInfo(data);
				LC.setSelectRowBackgroundColor(tr);
		});
		$(tr).click(function() {
			LC.checkboxClick(tr);
		});
	},
	setSelectRowBackgroundColor : function(handler) {
		$("#content_container tr").css("background-color","");
		handler.css("background-color","#d9f5ff");
	},
	showInstanceInfo : function(data) {
		console.info(data);
		if (data==null) return;
		$("#lcRelations").html("");
		LC.appendLCRelation(data);
		$("#opt_logs").empty();
		//com.skyform.service.LogService.describeLogsUIInfo(data.id);
	},
	appendLCRelation : function(data) {
		var dom = "";
		dom += "<li class=\"detail-item\">"
			+"<span>伸缩组名称："+data.AutoScalingGroupName+"</span>&nbsp;&nbsp;&nbsp;&nbsp;"
			+"<span>实例个数："+data.CurrentCount+"</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
			+"<span>默认冷却时间："+data.DefaultCooldown+"</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
			+"<span>实例类型："+data.ResourceType+"</span>"+"</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>"
			+"<span>伸缩组类型："+data.GroupType+"</span>"
			+"</li>";
		$("#lcRelations").empty().append(dom);
	},
	bindEvent : function() {
		// 为table的右键菜单添加监听事件
		$("#contextMenu").unbind("mouseover").bind('mouseover', function() {
			LC.inMenu = true;
		});

		$("#contextMenu").unbind("mouseout").bind('mouseout', function() {
			LC.inMenu = false;
		});
		$("#contextMenu li").unbind("mousedown").bind('mousedown', function(e) {
			$("#contextMenu").hide();
			if (!$(this).hasClass("disabled"))LC.onOptionSelected($(this).attr("action"));
		});
		$("body").unbind('mousedown').bind('mousedown', function() {
			if (!LC.inMenu) {
				$("#contextMenu").hide();
			}
		});

		// 更改配置中添加点击div的效果

		$("div.osList").unbind().click(function() {
			$("div.osList").removeClass("selected");
			$(this).addClass("selected");
		});

		$("#content_container #checkAll").unbind().click(function(e) {
			e.stopPropagation();
			var checked = $(this).attr("checked") || false;
			if(checked) $("#content_container tbody input[type='checkbox']").attr("checked",true);
			else $("#content_container tbody input[type='checkbox']").removeAttr("checked");
			
			LC.checkSelected();
		});
	},
	checkboxClick : function(tr) {
		LC.checkSelected();
	},
	checkSelected : function(selectInstance) {
		var rightClicked = selectInstance?true:false;
		
		var allCheckedBox = $("#tbody1 input[type='checkbox']:checked");
		
		var oneSelected = allCheckedBox.length == 1;
		var hasSelected = allCheckedBox.length > 0;
		
		$(".operation").addClass("disabled");
		
		var state = $(allCheckedBox[0]).parents("tr").attr("Status");
				
		var allInstanceHasTheSameState = true;
		
		var allInstanceStateCanBeDestroy = true;
		
		$(allCheckedBox).each(function(index,checkbox){
			var _state = $(checkbox).parents("tr").attr("Status");
			if(_state != state) {
				allInstanceHasTheSameState = false;
				return false;
			}
		});
		
		$(allCheckedBox).each(function(index,checkbox){
			var _state = $(checkbox).parents("tr").attr("Status");
			if(_state =='deleting' || _state=='opening'){
				allInstanceStateCanBeDestroy = false;
				return false;
			}
		});
		
		$(".operation").each(function(index,operation){
			var condition = $(operation).attr("condition");
			var action = $(operation).attr("action");
			var enabled = true;
			eval("enabled=("+condition+")");
			if(enabled) {
				$(operation).removeClass("disabled");
				$(operation).unbind("click").click(function(){
					LC.onOptionSelected(action||"");
				});
			} else {
				$(operation).addClass("disabled");
				$(operation).unbind();
			}
		});
		
		
		if(rightClicked) {
			LC.instanceName = selectInstance.instanceName;
			LC.selectedInstanceId = ""+selectInstance.id;
		} else {
			for ( var i = 0; i < allCheckedBox.length; i++) {
				var currentCheckBox = $(allCheckedBox[i]);
				if (i == 0) {
					LC.instanceName = currentCheckBox.parents("tr").attr("name");
					LC.selectedInstanceId = currentCheckBox.attr("value");
				} else {
					LC.instanceName += "," + currentCheckBox.parents("tr").attr("name");
					LC.selectedInstanceId += "," + currentCheckBox.attr("value");
				}
			}
		}
	},
	ajaxGet:function(url,param,sucfun,errfun){
		$.ajax({
			type     : "GET",
			url      : Dcp.getContextPath() +url ,
			data:    {params:LC.getParams(param)},
			datatype : "json", //设置获取的数据类型为json
			timeout  : 5000,
			async    : false,
			global   : false,
			success  : function(data) {
				sucfun(data);
			},
			error    : function(msg) {
				errfun(msg);
			}
		});
	},
	ajaxPost:function(url,param,sucfun,errfun){
		$.ajax({
			type     : "POST",
			url      : Dcp.getContextPath() +url ,
			data:    param,
			datatype : "json", //设置获取的数据类型为json
			timeout  : 5000,
			async    : false,
			global   : false,
			success  : function(data) {
				sucfun(data);
			},
			error    : function(msg) {
				errfun(msg);
			}
		});
	},
	leftClickInterrupt : function(obj, title, str) {
		obj.addClass("disabled");
		obj.unbind().mousedown(function(e) {
			if (1 == e.which) {
				$.growlUI(title, str);
			}

		});
	},
	onOptionSelected : function(action) {
		if ("deleteLaunchConfig" == action) {
			LC.deleteLaunchConfig(); //删除
		} 
	},
	getCheckedArr : function() {
		var checkedArr = $("#tbody1 tbody input[type='checkbox']:checked");
		if(checkedArr.length == 0){
			checkedArr = LC.lastCheckedArr;
		}
		else LC.lastCheckedArr = checkedArr;
		return checkedArr;
		
		return $("#tbody1 tbody input[type='checkbox']:checked");
	}
	
};
function validateScalingGroupName(input){
	var scoreReg = /^[\u4E00-\u9FA0A-Za-z\-0-9\_]+$/;
			
	var result = {status : true};
	$("#tip_scalingGroupName").empty();
	if($.trim(""+$(input).val()) == '') {
		$("#tip_scalingGroupName").empty().html("* 请填写不包括非法字符的伸缩组名称！");
		result.status = false;
	}
	
	if(! scoreReg.exec($.trim(""+$(input).val()))) {
		$("#tip_scalingGroupName").empty().html("* 请填写不包括非法字符的伸缩组名称！");
		result.status = false;
	}
	
	return result;			
}	
function validateCpu(input){
	var scoreReg = /^[\-0-9]+$/;
			
	var result = {status : true};
	$("#tip_cpu").empty();
	if($.trim(""+$(input).val()) == '') {
		$("#tip_cpu").empty().html("* 请填写整数类型的CPU(核)！");
		result.status = false;
	}
	
	if(! scoreReg.exec($.trim(""+$(input).val()))) {
		$("#tip_cpu").empty().html("* 请填写整数类型的CPU(核)！");
		result.status = false;
	}
	
	return result;			
}
function validateMemory(input){
	var scoreReg = /^[\-0-9]+$/;
			
	var result = {status : true};
	$("#tip_memory").empty();
	if($.trim(""+$(input).val()) == '') {
		$("#tip_memory").empty().html("* 请填写整数类型的内存！");
		result.status = false;
	}
	
	if(! scoreReg.exec($.trim(""+$(input).val()))) {
		$("#tip_memory").empty().html("* 请填写整数类型的内存！");
		result.status = false;
	}
	
	return result;			
}
function validateDiskSize(input){
	var scoreReg = /^[\-0-9]+$/;
	
	var result = {status : true};
	$("#tip_diskSize").empty();
	if($.trim(""+$(input).val()) != '') {
		if(! scoreReg.exec($.trim(""+$(input).val()))) {
			$("#tip_diskSize").empty().html("* 请填写整数类型的硬盘大小！");
			result.status = false;
		}
	}
	
	return result;	
}
function validateMinSize(input){
	var scoreReg = /^[\-0-9]+$/;
			
	var result = {status : true};
	$("#tip_minSize").empty();
	if($.trim(""+$(input).val()) == '') {
		$("#tip_minSize").empty().html("* 请填写整数类型的最小实例！");
		result.status = false;
	}
	
	if(! scoreReg.exec($.trim(""+$(input).val()))) {
		$("#tip_minSize").empty().html("* 请填写整数类型的最小实例！");
		result.status = false;
	}
	
	return result;			
}
function validateMaxSize(input){
	var scoreReg = /^[\-0-9]+$/;
			
	var result = {status : true};
	$("#tip_maxSize").empty();
	if($.trim(""+$(input).val()) == '') {
		$("#tip_maxSize").empty().html("* 请填写整数类型的最大实例！");
		result.status = false;
	}
	
	if(! scoreReg.exec($.trim(""+$(input).val()))) {
		$("#tip_maxSize").empty().html("* 请填写整数类型的最大实例！");
		result.status = false;
	}
	
	return result;			
}
function validatePolicyName(input){
	var scoreReg = /^[\u4E00-\u9FA0A-Za-z\-0-9\_]+$/;
	
	var result = {status : true};
	$("#tip_policyName").empty();
	if($.trim(""+$(input).val()) == '') {
		$("#tip_policyName").empty().html("* 请填写不包括非法字符的伸策略名称！");
		result.status = false;
	}
	
	if(! scoreReg.exec($.trim(""+$(input).val()))) {
		$("#tip_policyName").empty().html("* 请填写不包括非法字符的伸策略名称！");
		result.status = false;
	}
	return result;
}


