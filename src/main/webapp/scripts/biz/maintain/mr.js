//当前刷新实例的类型为负载均衡监控

window.Controller = {
		init : function(){
			MonitorRule.init();
		},
		refresh : function(){
		}
	}
window.currentInstanceType='mr';
var MonitorRule = {//负载均衡监控js模块
	data : [],
	dtTable : null,
	mrDataTable:null,
	mrDataTableOld:null,
	newFormModal : null,
	contextMenu : null,
	params_pool:"",
	scope : "mr",
	//routeName : [],
	instances : [],
	service:com.skyform.service.LBMRService,
	init : function(){
		MonitorRule.refreshData();
		MonitorRule._bindAction();//绑定按钮功能
		params_pool={
			"resourcePool":$("#pool").val(),
		}

		/*$("#monitorRuleTable input[type='checkbox']").live("click",function(){
			var flg=$("#monitorRuleTable tbody input[type='checkbox']:checked").is("checkbox");
			console.log(flg);
			if(flg==false){
				$(this).attr("checked",false);
				//console.log($(this).is(":checkbox"));
			}else {
			 $(this).attr("checked",true);
			 console.log("checkboxtrue");
			 }
		})*/
	},
	///////////////////////////////////////////////////////////////////////////
	//	Actions  start
	///////////////////////////////////////////////////////////////////////////
	destroy : function(){
		var canDestoryRoute = true;
		if (canDestoryRoute){
			ConfirmWindow.setTitle("销毁监控规则").setContent("<h4>确认要销毁所选监控规则吗？</h4>").onSave = function(){
				var ruleIds = new Array();
				ruleIds = MonitorRule.selectedInstanceId.split(",");	
				$(ruleIds).each(function(index, ruleId) {
				    var param = {listIds:ruleId};
				    MonitorRule.service.destroy(param,function (data){
						$.growlUI("销毁监控规则", "销毁监控规则成功!");
						ConfirmWindow.hide();
						MonitorRule.refreshData();
					},function (error){//删除不成功会执行此函数
						ErrorMgr.showError(error);
					});
				});
				ConfirmWindow.hide();
			};			
			ConfirmWindow.setWidth(500).autoAlign().setTop(100);
			ConfirmWindow.show();
		}
	},
	update : function(){
		var obj=MonitorRule.getCheckedArr().parents("tr");
		FormWindow.setTitle("修改监控规则名称").setContent("" + $("#update_monitorRule_form").html()).onSave = function(){
			var params={
					"subsId":parseInt(obj.attr("instanceId")),
					"subscriptionName" : $("#update_form_monitorRule_name").val(),
			};
			MonitorRule.service.updateMRName(params,function(result){
				FormWindow.hide();
				$.growlUI("修改监控规则名称","修改成功！");
				MonitorRule.refreshData();
			},function(error){
				ErrorMgr.showError(error);
			});
		};
		FormWindow.beforeShow = function(container){
			var oldInstanceName = $("#monitorRuleTable tbody input[type='checkbox']:checked").parents("tr").attr("instanceName");
			container.find("#update_form_monitorRule_name").val(oldInstanceName||"");
			
		};
		FormWindow.setWidth(500).autoAlign().setTop(100);
		FormWindow.show();
		
	},
	showDetails : function(instance){
	  if(!MonitorRule.data || MonitorRule.data.length < 1) return;
	  if(!instance) {
		  instance = MonitorRule.data[0];
	  }
	 /* $("div[scope='"+MonitorRule.scope+"'] .detail_value").each(function (i,item){
		  var prop = $(item).attr("prop");
		  var value = instance['' + prop] || "---";
		  if(prop == "status") {
			  value = com.skyform.service.StateService.getState("MonitorRule",instance);
		  } 
		  $(item).html(value);
	  });*/
	  $("#opt_logs").empty();
	  com.skyform.service.LogService.describeLogsUIInfo(instance.id);
	},
	resetData:function(){
		$("#form_monitorRule_mrName").val("");
		$("#form_monitorRule_protocalType").val("HTTP");
		$("#form_monitorRule_maxRequstNum").val("");
		$("#form_monitorRule_mrRate").val("");
		$("#form_monitorRule_timeout").val("");
		$("#form_monitorRule_responseStatusCode").val("");
		$("#form_monitorRule_requestUrl").val("");
		 $("input[type='radio'][name='questMed']").each(function(){  
	  		  $(this).attr("checked",false);  
	  	  });	
  	  $("input[type='checkbox'][name='noticeType']").each(function(){  
  		  $(this).attr("checked",false);  
  	  });	
	},
	refreshData : function(){
		if (MonitorRule.dtTable)
			MonitorRule.dtTable.container
					.find("tbody")
					.html(
							"<tr ><td colspan='7' style='text-align:center;'><img src='"
									+ CONTEXT_PATH
									+ "/images/loader.gif'/><strong>"+Dict.val("common_retrieving_data_please_wait")+"</strong></td></tr>");
		var condation={"resourcePool":$("#pool").val()}
		//查询所有的监控规则
	    MonitorRule.service.listLbHealthMonitor(condation,function onSuccess(result){
	    	/*for (var i = 0; i < result.length; i++) {
	    		MonitorRule.routeName.push(result[i].name);		    		
	    	}*/	
	    	if(MonitorRule.data.length>0){
	    		var firstInstanceId = MonitorRule.data[0].id;		
	    		MonitorRule.getBindLbById(firstInstanceId);
	    		MonitorRule.showDetails(MonitorRule.data[0]);
	    	}

	    	MonitorRule.data = result;
			MonitorRule._refreshDtTable(MonitorRule.data);
		},function onError(msg){
			ErrorMgr.showError(msg);
		});
	},
	_bindAction : function(){
		$("div[scope='"+MonitorRule.scope+"'] #toolbar .actionBtn").unbind().click(function(){
			if($(this).hasClass("disabled")) return;
			var action = $(this).attr("action");
			MonitorRule._invokeAction(action);
		});
	},
	
	_invokeAction : function(action){
		var invoker = MonitorRule["" + action];
		if(invoker && typeof invoker == 'function') {
			invoker();
		}
	},
	
	_refreshDtTable : function(data) {
		if(MonitorRule.dtTable) {
			MonitorRule.dtTable.updateData(data);
		} else {
			MonitorRule.dtTable = new com.skyform.component.DataTable();
			MonitorRule.dtTable.renderByData("#monitorRuleTable",{
				pageSize : 5,
				data : data,
				onColumnRender : function(columnIndex,columnMetaData,columnData){
					  if(columnMetaData.name=='ID') {
						return columnData.id;
					  } else if(columnMetaData.name=="id") {
			            return "<input type='checkbox' value='" + columnData["id"] +"'/>" ;
			          } else if (columnMetaData.name=="state") {
							return com.skyform.service.StateService.getState("monitor",
									columnData.state || columnData);
					 }else if (columnMetaData.name == "createDate") {
						  var text = '';
						  if(columnData.createDate == '' || columnData.createDate == 'undefined'){
						  	return text;
						  }
						  try {
								var obj = eval('(' + "{Date: new Date(" + columnData.createDate + ")}" + ')');
								var dateValue = obj["Date"];
								text = dateValue.format('yyyy-MM-dd hh:mm:ss');
							} catch (e) {
						    }
						  return text;
					  } 
					  else {
			            return columnData[columnMetaData.name];
			          }
				},
				afterRowRender : function(rowIndex,data,tr){
					tr.attr("instanceId",data.id);
					tr.attr("protocol",data.protocol);
					
					tr.attr("instanceName",data.instanceName);
					tr.attr("maxRetryCount",data.maxRetryCount);
					tr.attr("monitorFrequency",data.monitorFrequency);
					tr.attr("timeoutPeriod",data.timeoutPeriod);
					tr.attr("expectedResStatusCode",data.expectedResStatusCode);
					tr.attr("httpRequestMethod",data.httpRequestMethod);
					tr.attr("createDate",data.createDate);
					tr.attr("noticeType",data.noticeType);
					tr.attr("instancestate",data.state);
					tr.attr("requestAddress",data.requestAddress);
					tr.find("input[type='checkbox']").click(function(){
						MonitorRule.onInstanceSelected(); 
			        });
					tr.click(function(){
						MonitorRule.getBindLbById(data.id);
						MonitorRule.showDetails(data); /*
						$("tbody input[type='checkbox']").attr("checked", false);
				        $(tr).find("input[type='checkbox']").attr("checked", true);*/
				        MonitorRule.onInstanceSelected();
			        });
					if(rowIndex == 0) {
						$(tr).find("input[type='checkbox']").attr("checked", true);
					}	
				},
				afterTableRender : MonitorRule._afterDtTableRender
			});
			MonitorRule.dtTable.addToobarButton($("#toolbar"));
			MonitorRule.dtTable.enableColumnHideAndShow("right");
		}
	},
	
	_afterDtTableRender : function(){
		//默认第一条数据勾选
		var firstRow = $("#monitorRuleTable tbody").find("tr:eq(0)");
		firstRow.find("td[name='id'] input[type='checkbox']").attr("checked", true);
		MonitorRule.onInstanceSelected(); 
		var check = $("input#monitorRulecheckAll[type='checkbox']").unbind("click").click(function(e){
			e.stopPropagation();
			var check = $(this).attr("checked");
			MonitorRule.checkAll(check);
		});
		if(!MonitorRule.contextMenu) {
			MonitorRule.contextMenu = new ContextMenu({
				beforeShow : function(tr){
					MonitorRule.checkAll(false);
					tr.find("input[type='checkbox']").attr("checked",true);
				},
				afterShow : function(tr) {
					MonitorRule.onInstanceSelected({
						instanceName : tr.attr("instanceName"),
						id : tr.attr("instanceId"),
						state : tr.attr("instancestate")
					});
				},
				onAction : function(action) {
					MonitorRule._invokeAction(action);
				},
				trigger : "#monitorRuleTable tr"
			});
		} else {
			MonitorRule.contextMenu.reset();
		}
		MonitorRule.showDetails();
	},
	
	checkAll : function(check){
		if(check) $("#monitorRuleTable tbody input[type='checkbox']").attr("checked",true);
		else $("#monitorRuleTable tbody input[type='checkbox']").removeAttr("checked");
		MonitorRule.onInstanceSelected(false);
	},
	
	onInstanceSelected : function(selectInstance){
		var allCheckedBox = $("#monitorRuleTable tbody input[type='checkbox']:checked");
		var rightClicked = selectInstance?true:false;
		var state = $(allCheckedBox[0]).parents("tr").attr("instancestate");
		if(selectInstance) {
			state = selectInstance.state;
		}
		var oneSelected = allCheckedBox.length == 1;
		var hasSelected = allCheckedBox.length > 0;
		if(oneSelected){//如果列表中的路由只有一个被选中，当前的publicIp为那个唯一被选中路由的publicIp
//			MonitorRule.publicIp = $("#monitorRuleTable tbody input[type='checkbox']:checked").parent().parent()[0].attributes["publicip"].value;
		}
		$("div[scope='"+MonitorRule.scope+"'] .operation").addClass("disabled");
		$("div[scope='"+MonitorRule.scope+"'] .operation").each(function(index,operation){
			var condition = $(operation).attr("condition");
			var action = $(operation).attr("action");
			var enabled = true;
			eval("enabled=("+condition+")");
			if(enabled) {
				$(operation).removeClass("disabled");
			} else {
				$(operation).addClass("disabled");
			}
			MonitorRule._bindAction();
		});
		//右键的时候
		if(rightClicked) {
			MonitorRule.instanceName = selectInstance.instanceName;
			MonitorRule.selectedInstanceId = selectInstance.id;
		} else {
			for ( var i = 0; i < allCheckedBox.length; i++) {
				var currentCheckBox = $(allCheckedBox[i]);
				if (i == 0) {
					MonitorRule.instanceName = currentCheckBox.parents("tr").attr("name");
					MonitorRule.selectedInstanceId = currentCheckBox.attr("value");
				} else {
					MonitorRule.instanceName += "," + currentCheckBox.parents("tr").attr("name");
					MonitorRule.selectedInstanceId += "," + currentCheckBox.attr("value");
				}
			}
		}
	},
	updateMR:function(){
		MonitorRule.setLabelClassHide();
		$("#myModalLabel").text("修改监控规则配置");
		var obj=MonitorRule.getCheckedArr().parents("tr");
		if(obj.length==0){
			$.growlUI("提示", "请选择一条记录");
			return;
		}
			var noticeTypeData=obj.attr("noticeType").split(",");
			$("#form_monitorRule_mrName").val(obj.attr("instancename"));
			$("#form_monitorRule_mrName").attr({readOnly:true});
			$("#form_monitorRule_protocalType").val(obj.attr("protocol"));
			$("#form_monitorRule_maxRequstNum").val(obj.attr("maxRetryCount"));
			$("#form_monitorRule_mrRate").val(obj.attr("monitorFrequency"));
			$("#form_monitorRule_timeout").val(obj.attr("timeoutPeriod"));
			$("#form_monitorRule_responseStatusCode").val(obj.attr("expectedResStatusCode").replace(",","\n"));
			$("#form_monitorRule_requestUrl").val(obj.attr("requestAddress"));
			//回填通知类型
		  	$("input[type='checkbox'][name='noticeType']").each(function(){  
		  		var notice=$(this);
		  		$.each(noticeTypeData,function(index,val){
		  			if(notice.val()==val){
		  				notice.attr({checked:'checked'});
		  			}
		  		});
		  	  });
		  	//回填监控频率
		  	//回填请求方法
		  	$("#form_monitorRule_protocalType").unbind('click').bind('click', function(e) {
				var type=$.trim($("#form_monitorRule_protocalType").val());
				if(type=="HTTP"){
					$("#responseStatusCode").show();
					$("#requestMethod").show();
					$("#requestUrl").show();
				}else{
					$("#responseStatusCode").hide();
					$("#requestMethod").hide();
					$("#requestUrl").hide();
					
				}
	        });
		  	$("#form_monitorRule_protocalType").find("option[value='"+obj.attr("protocol")+"']").click();
		  	$("input[type='radio'][name='questMed']").each(function(){
		  		var questMed=$(this);
		  		if(questMed.val()==obj.attr("httpRequestMethod").trim()){
		  			questMed.attr({checked:'checked'});
		  		}
		  	});
			MonitorRule.newFormModal = $("#newMRorm");
			$("#btnCreateMonitorRule").unbind('click').bind('click', function(e) {
				MonitorRule.updateMRComfirm();
			});
            
			MonitorRule.bindValiter();
			$("#newMRorm").modal("show");
	},
	//add by yi 10.28
	updateMRComfirm:function(){
		 if(MonitorRule.checkValiter()){
			// console.log("校验错误");
			  return;
		  };
		  var obj=MonitorRule.getCheckedArr().parents("tr");
	 	  var noticeTypeVal="";
	  	  $("input[type='checkbox'][name='noticeType']:checked").each(function(){  
	  		noticeTypeVal+=$(this).val()+",";  
	  	  });
	  	if(noticeTypeVal.length>0){
	  		noticeTypeVal=noticeTypeVal.substring(0,noticeTypeVal.length-1);
	  	  }
	  	  var type=$.trim($("#form_monitorRule_protocalType").val());
	  	  var expectedResStatusCode="";
	  	  var httpRequestMethod="";
	  	  var requestAddress="";
		  if(type=="HTTP"){
			  expectedResStatusCode =$.trim($("#form_monitorRule_responseStatusCode").val().replace("\n",",")),
              httpRequestMethod =$("input[type='radio'][name='questMed']:checked").val(),
              requestAddress = $.trim($("#form_monitorRule_requestUrl").val())
		  }else{
			  expectedResStatusCode = " ",
              httpRequestMethod =" ",
              requestAddress=" "
		  }
	 	   var params = {
	 			"productList":[{
	 				            subscriptionId:obj.attr("instanceId"),
	 				            productId: 9009,
	 			             	protocol :$.trim($("#form_monitorRule_protocalType").val()),
	 			             	maxRetryCount :$.trim($("#form_monitorRule_maxRequstNum").val()),
	 			             	monitorFrequency : $.trim($("#form_monitorRule_mrRate").val()),
	 			             	timeoutPeriod : $.trim($("#form_monitorRule_timeout").val()),
	 			             	expectedResStatusCode : expectedResStatusCode,
	 			             	httpRequestMethod :httpRequestMethod,
	 			             	requestAddress : requestAddress,
	 			             	noticeType :noticeTypeVal,
			                    resourcePool:$("#pool").val()
	 						}]

	 	   };
	 	   MonitorRule._updateMR(params);
		
	},
	_updateMR : function(params){
		//console.info(params);
		MonitorRule.service.updateMR(params,function onSuccess(data){
//			console.log(data);
			$.growlUI("提示", "创建申请提交成功, 请耐心等待..."); 
			$("#newMRorm").modal("hide");
			// refresh
			MonitorRule.resetData();
			MonitorRule.refreshData();
			},function onError(msg){
			$.growlUI("提示", "负载均衡监控创建失败！");
			$("#newMRorm").modal("hide");
		});
	
	},
	createMR : function() {
		MonitorRule.setLabelClassHide();
		MonitorRule.resetData();
		$("#form_monitorRule_mrName").attr({readOnly:false});
		$("input[type='radio'][name='questMed'][value='POST']").attr({checked:"checked"});  
		$("#myModalLabel").text("创建监控规则配置");
		MonitorRule.newFormModal = $("#newMRorm");
		$("#form_monitorRule_protocalType").unbind('click').bind('click', function(e){
			var type=$.trim($("#form_monitorRule_protocalType").val());
			if(type=="HTTP"){
				$("#responseStatusCode").show();
				$("#requestMethod").show();
				$("#requestUrl").show();
			}else{
				$("#responseStatusCode").hide();
				$("#requestMethod").hide();
				$("#requestUrl").hide();
				
			}
		
	  });
		$("input[type='checkbox'][name='noticeType']").each(function(){  
			$(this).attr({checked:"checked"}); 
	  	  });
		$("#btnCreateMonitorRule").unbind('click').bind('click', function(e) {
			MonitorRule.createComfirm();
		});		
		$("#form_monitorRule_protocalType").find("option[value='HTTP']").click();
		MonitorRule.bindValiter();
		$("#newMRorm").modal("show");
	
	},
	createComfirm : function() {
	  if(MonitorRule.checkValiter()){
		 // console.log("校验错误");
		  return;
	  };
	  var protocol=$.trim($("#form_monitorRule_protocalType").val());
 	  var noticeTypeVal="";
  	  $("input[type='checkbox'][name='noticeType']:checked").each(function(){  
  		noticeTypeVal+=$(this).val()+",";  
  	  });
  	  if(noticeTypeVal.length>0){
  		noticeTypeVal=noticeTypeVal.substring(0,noticeTypeVal.length-1);
  	  }
 	  var expectedResStatusCode="";
 	  var httpRequestMethod="";
 	  var requestAddress="";
	  if(protocol=="HTTP"){
		 expectedResStatusCode =$.trim($("#form_monitorRule_responseStatusCode").val().replace("\n",",")),
         httpRequestMethod =$("input[type='radio'][name='questMed']:checked").val(),
         requestAddress = $.trim($("#form_monitorRule_requestUrl").val())
	  }else{
		 expectedResStatusCode = " ",
         httpRequestMethod =" ",
         requestAddress=" "
	  }
//	   var params = {
//			period:"",
//			count:"",
//			productList:[{
//				            productId:9009,
//			             	name : $.trim($("#form_monitorRule_mrName").val()),
//			             	instanceName:$.trim($("#form_monitorRule_mrName").val()),
//			             	protocol :$.trim($("#form_monitorRule_protocalType").val()),
//			             	maxRetryCount :$.trim($("#form_monitorRule_maxRequstNum").val()),
//			             	monitorFrequency : $.trim($("#form_monitorRule_mrRate").val()),
//			             	timeoutPeriod : $.trim($("#form_monitorRule_timeout").val()),
//			             	expectedResStatusCode : expectedResStatusCode,
//			             	httpRequestMethod :httpRequestMethod,
//			             	requestAddress : $.trim($("#form_monitorRule_requestUrl").val()),
//			             	noticeType :noticeTypeVal
//						}]
//
//	   };
	  var params={
			    "jsonobj": [
			                {
			                    "productId": 9009,
			                    "name": $.trim($("#form_monitorRule_mrName").val()),
			                    "instanceName": $.trim($("#form_monitorRule_mrName").val()),
			                    "protocol": $.trim($("#form_monitorRule_protocalType").val()),
			                    "maxRetryCount": $.trim($("#form_monitorRule_maxRequstNum").val()),
			                    "monitorFrequency": $.trim($("#form_monitorRule_mrRate").val()),
			                    "timeoutPeriod": $.trim($("#form_monitorRule_timeout").val()),
			                    "expectedResStatusCode": expectedResStatusCode,
			                    "httpRequestMethod": httpRequestMethod,
			                    "requestAddress": requestAddress,
			                    "noticeType": noticeTypeVal,
			                    "resourcePool":$("#pool").val()
			                }
			            ]
			        }
 	   MonitorRule._save(params);
	},
	_save : function(params){
		MonitorRule.service.createMR(params,function onSuccess(data){
			$.growlUI("提示", "创建申请提交成功, 请耐心等待..."); 
			$("#newMRorm").modal("hide");
			// refresh
			MonitorRule.refreshData();
			},function onError(msg){
			$.growlUI("提示", "负载均衡监控创建失败！");
			$("#newMRorm").modal("hide");
		});
	
	},
	setLabelClassHide:function(){
		$("#form_monitorRule_mrName").next().next().hide();
		$("#form_monitorRule_maxRequstNum").next().next().hide();
		$("#form_monitorRule_timeout").next().next().hide();
		$("#form_monitorRule_responseStatusCode").next().next().hide();
		$("#form_monitorRule_requestUrl").next().next().hide();
	},
	bindValiter:function(){
		$('#newMRorm').off('shown').on('shown', function () {
			$("#form_monitorRule_mrName").bind('blur',function(e){
				if(valiter.isNull($(this).val())){
				    $(this).next().next().show();
				}
				else{
					$(this).next().next().hide();
				}
				
			});
			$("#form_monitorRule_maxRequstNum").bind('blur',function(e){
				if(valiter.isNull($(this).val())||!valiter.isNumber10($(this).val())){
				    $(this).next().next().show();
				}
				else{
					$(this).next().next().hide();
				}
				
			});
			$("#form_monitorRule_timeout").bind('blur',function(e){
				if(valiter.isNull($(this).val())||valiter.numberInt($(this).val())){
				    $(this).next().next().show();
				}
				else{
					$(this).next().next().hide();
				}
				
			});
			$("#form_monitorRule_responseStatusCode").bind('blur',function(e){
				if(valiter.isNull($(this).val())){
				    $(this).next().next().show();
				}
				else{
					$(this).next().next().hide();
				}
				
			});
			$("#form_monitorRule_requestUrl").bind('blur',function(e){
				if(valiter.isNull($(this).val())){
				    $(this).next().next().show();
				}
				else{
					$(this).next().next().hide();
				}
				
			});

		});
	},
	checkValiter:function(){
		var type=$.trim($("#form_monitorRule_protocalType").val());
		$("#form_monitorRule_mrName").blur();
		  if(valiter.isNull($("#form_monitorRule_mrName").val()))
	   	   {
	   		   return true;
	   	   }
		  $("#form_monitorRule_maxRequstNum").blur();
		  if(valiter.isNull($("#form_monitorRule_maxRequstNum").val())||!valiter.isNumber10($("#form_monitorRule_maxRequstNum").val()))
	   	   {
	   		   return true;
	   	   }
		  $("#form_monitorRule_timeout").blur();
		  if(valiter.isNull($("#form_monitorRule_timeout").val())||valiter.numberInt($("#form_monitorRule_timeout").val()))
	   	   {
	   		   return true;
	   	   }
		  if(type=="HTTP"){
			  $("#form_monitorRule_responseStatusCode").blur();
			  if(valiter.isNull($("#form_monitorRule_responseStatusCode").val()))
		  	   {
		  		   return true;
		  	   }
			  $("#form_monitorRule_requestUrl").blur();
			  if(valiter.isNull($("#form_monitorRule_requestUrl").val()))
		 	   {
		 		   return true;
		 	   }
		  }
	},
	getCheckedArr :function() {
		return $("#monitorRuleTable tbody input[type='checkbox']:checked");
	},
	getBindLbById : function(id){//查询已绑定负载均衡方法
		$("#bindLb").html("");
		MonitorRule.service.listRelatedInstances(id,function(data){
			if(data == null || data.length == 0) {
				return;
			}else{
				$("#bindLb").empty();
				var dom = "";
				
				$(data).each(function(i) {
					var _resId = "";
					var _state = "";
					if(data[i].templateType==6){
						/*_resId = array[i].resId;*/
						//_state = com.skyform.service.StateService.getState("monitor",array[i].state);
						_state = MonitorRule.service.queryBindState(data[i].relaState);
					}
						dom += "<li class=\"detail-item\">"
							+"<span>"+data[i].id+"</span>&nbsp;&nbsp;&nbsp;&nbsp;"
							/*+"<span>"+Route.switchType(array[i].templateType)+"</span>&nbsp;&nbsp;&nbsp;&nbsp;"*/
							+"<span>"+data[i].instanceName+"</span>&nbsp;&nbsp;&nbsp;&nbsp;"							
							/*+"<span>"+_resId+"</span>&nbsp;&nbsp;&nbsp;&nbsp;"*/
							+"<span>"+_state+"</span>"
							+"</li>";	
				});
				$("#bindLb").append(dom);
			}
		});
	},
	authorityMr:function(){
		$('#mrModal').off('shown').on('shown', function () {
	        // do something…
			var lbLbHealthMonitorId=MonitorRule.getCheckedArr().parents("tr").attr("instanceid");
			if(lbLbHealthMonitorId==null||lbLbHealthMonitorId==undefined){
				$("#mrModal").modal("hide");
				$.growlUI("提示", "请选择一条记录");
				return;
			}
			var params={
					lbLbHealthMonitorId:lbLbHealthMonitorId
			};
			MonitorRule.service.bindLbList(params,function onSuccess(data){
					if(data==undefined){
						 return;
					 }
					if(MonitorRule.mrDataTableOld != null){
						MonitorRule.mrDataTableOld.updateData(data);
					} else {
						MonitorRule.mrDataTableOld =  new com.skyform.component.DataTable();
						MonitorRule.attachOldDataTable(data);
					}
			},function onError(msg){
		    	$.growlUI("提示", "查询已授权负载均衡失败：" + msg);
		    });
			MonitorRule.service.unBindLbList(params_pool,function onSuccess(data){
					if(data==undefined){
						 return;
					 }
					if(MonitorRule.mrDataTable != null){
						MonitorRule.mrDataTable.updateData(data);
					} else {
						MonitorRule.mrDataTable =  new com.skyform.component.DataTable();
						MonitorRule.attachDataTable(data);
					}
			},function onError(msg){
		    	$.growlUI("提示", "查询未授权负载均衡失败：" + msg); 
		    });
	      });
		$("#mrModal").modal("show");
	},
	attachDataTable : function(data) {
		MonitorRule.mrDataTable.renderByData("#mrTable", {
				"data" : data,
				"pageSize": 5,
				"columnDefs" : [
				     {title : "", name : "id"},
				     {title : "ID", name : "id"},
				     {title : "名称", name : "instanceName"},
				     {title : "操作", name : "button"}
				],
				"onColumnRender" : function(columnIndex,columnMetaData,columnData) {
					 var text = columnData[''+columnMetaData.name] || "";
					 if(columnIndex ==0) {
						 text = "<input type='radio' name='ownMrId' value=' "+text+" '>";
					 }
					 if ('button'==columnMetaData.name) {
						 return '<a onclick="MonitorRule.associateLbHealthMonitor(this)" class="btn btn-success btn-del btn-mini" id='+columnData.id+'>添加</a>';
						}
					 return text;
				},
				"afterRowRender" : function(index,data,tr){
					tr.attr("instanceId",data.id);
					tr.attr("instanceName",data.instanceName);
					if(index == 0) {
						$(tr).find("input[type='radio']").attr("checked", "checked");
					}					
				}
				
			});
	},
	associateLbHealthMonitor:function(currdata){
		var lbsubscriptionId=$(currdata).attr("id");
		var lbLbHealthMonitorId=MonitorRule.getCheckedArr().parents("tr").attr("instanceid");
		if(lbsubscriptionId==null||lbLbHealthMonitorId==null||lbLbHealthMonitorId==undefined){
			$("#mrModal").modal("hide");
			$.growlUI("提示", "请选择一条记录");
			return;
		}
		var params={
				lbsubscriptionId :lbsubscriptionId,
				lbLbHealthMonitorId:lbLbHealthMonitorId
		};
		var temp={
				lbLbHealthMonitorId:lbLbHealthMonitorId
		}
		MonitorRule.service.associateLbHealthMonitor(params,function onSuccess(data){
			MonitorRule.service.bindLbList(temp,function onSuccess(data){
				if(data==undefined){
					 return;
				 }
				if(MonitorRule.mrDataTableOld != null){
					MonitorRule.mrDataTableOld.updateData(data);
				} else {
					MonitorRule.mrDataTableOld =  new com.skyform.component.DataTable();
					MonitorRule.attachOldDataTable(data);
				}
			},function onError(msg){
		    	$.growlUI("提示", "查询已授权负载均衡失败：" + msg); 
		    });
			MonitorRule.service.unBindLbList(params_pool,function onSuccess(data){
				if(data==undefined){
					 return;
				 }
				if(MonitorRule.mrDataTable != null){
					MonitorRule.mrDataTable.updateData(data);
				} else {
					MonitorRule.mrDataTable =  new com.skyform.component.DataTable();
					MonitorRule.attachDataTable(data);
				}
			},function onError(msg){
		    	$.growlUI("提示", "查询未授权负载均衡失败：" + msg); 
		    });
		},function onError(msg){
	    	$.growlUI("提示", "添加负载均衡授权失败：" + msg); 
	    });
	},
	disassociateLbHealthMonitor:function(currdata){
			var lbsubscriptionId=$(currdata).attr("id");
			var lbLbHealthMonitorId=MonitorRule.getCheckedArr().parents("tr").attr("instanceid");
			if(lbsubscriptionId==null||lbLbHealthMonitorId==null||lbLbHealthMonitorId==undefined){
				$("#mrModal").modal("hide");
				$.growlUI("提示", "请选择一条记录");
				return;
			}
			var params={
					lbsubscriptionId :lbsubscriptionId,
					lbLbHealthMonitorId:lbLbHealthMonitorId
			};
			var temp={
					lbLbHealthMonitorId:lbLbHealthMonitorId
			}
			MonitorRule.service.disassociateLbHealthMonitor(params,function onSuccess(data){
			MonitorRule.service.bindLbList(temp,function onSuccess(data){
				if(MonitorRule.mrDataTableOld != null){
					MonitorRule.mrDataTableOld.updateData(data);
				} else {
					MonitorRule.mrDataTableOld =  new com.skyform.component.DataTable();
					MonitorRule.attachOldDataTable(data);
				}
			},function onError(msg){
		    	$.growlUI("提示", "查询已授权负载均衡失败：" + msg); 
		    });
			MonitorRule.service.unBindLbList(params_pool,function onSuccess(data){
				if(MonitorRule.mrDataTable != null){
					MonitorRule.mrDataTable.updateData(data);
				} else {
					MonitorRule.mrDataTable =  new com.skyform.component.DataTable();
					MonitorRule.attachDataTable(data);
				}
			},function onError(msg){
		    	$.growlUI("提示", "查询未授权负载均衡失败：" + msg); 
		    });
		},function onError(msg){
	    	$.growlUI("提示", "取消负载均衡授权失败：" + msg); 
	    });
	},	
	attachOldDataTable : function(data) {
		MonitorRule.mrDataTableOld.renderByData("#mrTableOld", {
				"data" : data,
				"pageSize": 5,
				"columnDefs" : [
				     {title : " ", name : "id"},
				     {title : "名称", name : "instanceName"},
				     {title : "状态", name : "relationStatus"},
				     {title : "操作", name : "button"}
				],
				"onColumnRender" : function(columnIndex,columnMetaData,columnData) {
					 var text = columnData[''+columnMetaData.name] || "";
					 if(columnIndex ==0) {
						 text = "<input type='radio' name='ownMrIdOld' value=' "+text+" '>";
					 }
					 if ('relationStatus'==columnMetaData.name) {
							return MonitorRule.service.queryBindState(columnData.relationStatus);
						}
					 if ('button'==columnMetaData.name) {
						 if(columnData.relationStatus==9){
							 return '<a href="javascript:void(0);" onclick="MonitorRule.disassociateLbHealthMonitor(this)" class="btn btn-danger btn-del btn-mini" id='+columnData.id+'>取消关联</a>';
						 }else if(columnData.relationStatus==0){
							 return '关系正在建立';
						 }else if(columnData.relationStatus==1){
							 return '关系建立失败';
						 }else if(columnData.relationStatus==2){
							 return '关系正在失效';
						 }else if(columnData.relationStatus==3){
							 return '关系失效失败';
						 }else if(columnData.relationStatus==4){
							 return '关系失效';
						 }else{
							 return '失败';
						 }
						}

					 return text;
				},
				"afterRowRender" : function(index,data,tr){
					if(index == 0) {
						$(tr).find("input[type='radio']").attr("checked", "checked");
					}
				}					
			});
	}
};
var ConfirmWindow = new com.skyform.component.Modal("confirmWindow","","",{
	buttons : [
	  {
		  name : '确定',
		  attrs : [{name:'class',value:'btn btn-primary'}],
		  onClick : function(){
			  if(ConfirmWindow.onSave && typeof ConfirmWindow.onSave == 'function') {
				  ConfirmWindow.onSave();
			  } else {
				  ConfirmWindow.hide();
			  }
		  }
	  },
	  {
		  name : '取消',
		  attrs : [{name:'class',value:'btn'}],
		  onClick : function(){
			  ConfirmWindow.hide();
		  }
	  }
	  ]
}).setWidth(400).autoAlign().setTop(100);
var FormWindow = new com.skyform.component.Modal("FormWindow","","",{
	afterShow : function(container){
		if(FormWindow.beforeShow && typeof FormWindow.beforeShow == 'function') {
			FormWindow.beforeShow(container);
		}
	},
	beforeShow : function(container){
		FormWindow.hideError();
	},
	buttons : [
	  {
		  name : '确定',
		  attrs : [{name:'class',value:'btn btn-primary'}],
		  onClick : function(){
			  if(FormWindow.onSave && typeof FormWindow.onSave == 'function') {
				  FormWindow.onSave();
			  } else {
				  FormWindow.hide();
			  }
		  }
	  },
	  {
		  name : '取消',
		  attrs : [{name:'class',value:'btn'}],
		  onClick : function(){
			  FormWindow.hide();
		  }
	  }
	  ],
	  afterHidden : function(container) {
		  window.currentInstanceType='mr';
		  container.find(".modal-footer").find(".btn").show();
		  FormWindow.setWidth(900).autoAlign();
	  }
}).setWidth(900).autoAlign().setTop(100);
FormWindow.showError = function(error){
	var errorInfo = $("<div class='alert alert-error' style='margin:1px;' id='form_window_error_info'><button class='close' data-dismiss='alert' type='button'>×</button>"+error+"</div>");
	$("#form_window_error_info").remove();
	$("#FormWindow").find(".modal-body").prepend(errorInfo);
},
FormWindow.hideError = function(){
	$("#form_window_error_info").remove();
};

var ContextMenu = function(options){
	var _options = {
		container : options.container || $("#contextMenu"),
		onAction : options.onAction || function(action){},
		trigger  : options.trigger || $("body"),
		beforeShow : options.beforeShow || function(){},
		afterShow : options.afterShow || function(){},
		beforeHide : options.beforeHide || function(){},
		afterHide : options.afterHide || function() {}
	};
	
	
	this.setTrigger = function(trigger) {
		_options.trigger = trigger;
		_init();
	};
	
	this.reset = function(){
		_init();
	};
	this.inMenu = false;
	
	var _init = function(){
		_options.container = $(_options.container);
		_options.container.hide();
		$(_options.trigger).unbind("mousedown").bind("mousedown",function(e) {
			if (3 == e.which) {
				document.oncontextmenu = function() {
					return false;
				}
				var screenHeight = $(document).height();
				var top = e.pageY;
				if (e.pageY >= screenHeight / 2) {
					top = e.pageY - _options.container.height();// 如果鼠标所在位置在屏幕高度中线的下半部分，则弹出框往上弹出
				}
				_options.container.hide();
				_options.container.attr(
						"style",
						"display: block; position: absolute; top:"
								+ top + "px; left:" + e.pageX
								+ "px; width: 180px;");
				_options.beforeShow($(this));
				_options.container.show();
				e.stopPropagation();
				_options.afterShow($(this));

			} else {
				_options.container.hide();
			}
			
		});
		var self = this;
		_options.container.unbind("mouseover").bind('mouseover', function() {
			self.inMenu = true;
		});

		_options.container.unbind("mouseout").bind('mouseout', function() {
			self.inMenu = false;
		});
		_options.container.find("li").unbind("mousedown").bind('mousedown', function(e) {
			_options.container.hide();
			if (!$(this).hasClass("disabled")){
				var action = $(this).attr("action");
				if(action) _options.onAction(action);
			}
		});
		$("body").unbind('mousedown').bind('mousedown', function() {
			if (!self.inMenu) {
				_options.beforeHide();
				_options.container.hide();
				_options.afterHide();
			}
		});
	};
	
	_init();
};
/*
$(function(){
	var VmHealthyMonitorInited = false;
	//
	MonitorRule.init();
	
	$("#monitorRule_health_tab").on("show",function(){
		$("div.details_content[scope !='" + VmHealthyMonitor.scope+"']").addClass("hide");
		$("div.details_content[scope ='" + VmHealthyMonitor.scope+"']").removeClass("hide");
	});
	$("#monitorRule_health_tab").on("shown",function(){
		if(!VmHealthyMonitorInited) {
			VmHealthyMonitorInited = true;
			VmHealthyMonitor.init();
		}
	});
	
	$("#monitorRule_tab").on("show",function(){
		$("div.details_content[scope !='" + MonitorRule.scope+"']").addClass("hide");
		$("div.details_content[scope ='" + MonitorRule.scope+"']").removeClass("hide");
	});
	
	ErrorMgr.init();
	
});
*/