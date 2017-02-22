//当前刷新实例的类型为子网
window.currentInstanceType='submr';
window.Controller = {
		init : function(){
			
			VmHealthyMonitor.init();
		},
		refresh : function(){
			MonitorRule.refreshData();
			VmHealthyMonitor.refreshData();
		}
	}
var VmHealthyMonitor = {
		  //billType_ : "",
		  //cidr_ : "",
		  data : [],
		  dtTable : null,
		  newFormModal : null,
		  //bindRouteModal : null,
		  //contextMenu : null,
		  scope : "vmHealthy",
		  //privateNetIP : [],
		  //routeId : [],
		  //privateNetName : [],
		  //isGateWay : null,
		  //currentNetId:null,
		  init : function(){
		    VmHealthyMonitor.refreshData();
		    VmHealthyMonitor._bindAction();
		  },
		  
	  	  ///////////////////////////////////////////////////////////////////////////
		  //	Actions  start
		  ///////////////////////////////////////////////////////////////////////////
			
		  refreshData : function(){
			  if (VmHealthyMonitor.dtTable)
				  VmHealthyMonitor.dtTable.container
							.find("tbody")
							.html(
									"<tr ><td colspan='7' style='text-align:center;'><img src='"
											+ CONTEXT_PATH
											+ "/images/loader.gif'/><strong>"+Dict.val("common_retrieving_data_please_wait")+"</strong></td></tr>");
			  var condation={"resourcePool":$("#pool").val()}
			  VmHealthyMonitor.mrService.describeVMHealthCondition(condation,function onSuccess(data){
				VmHealthyMonitor.data=data;
				if(VmHealthyMonitor.data.length>0){
					VmHealthyMonitor.getLbHealthyRelation(VmHealthyMonitor.data[0].lbId, VmHealthyMonitor.data[0].lbHealthId);
					VmHealthyMonitor.showDetails(VmHealthyMonitor.data[0]); 
				}
		    	VmHealthyMonitor._refreshDtTable(data);
		    },function onError(msg){
		    	$.growlUI("提示", "查询云主机健康状况失败：" + msg); 
		    });
		  },
		  
		  showDetails : function(instance){
			  if(!VmHealthyMonitor.data || VmHealthyMonitor.data.length < 1) return;
			  if(!instance) {
				  instance = VmHealthyMonitor.data[0];
			  }
			  $("#subnet_logs").empty();
			  com.skyform.service.LogService.describeLogsInfo(instance.vmId,function(logs){
				  $("#subnet_logs").empty();
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
						$("<li class='detail-item'><span>" + v.createTime + "  " +v.subscription_name+"  "+ v.controle +desc+ "</span></li>").appendTo($("#subnet_logs"));
						  });
			  },function onError(msg){
//					$.growlUI("提示", "查询弹性块存储日志发生错误：" + msg); 
				});
		  },
		  ///////////////////////////////////////////////////////////////////////////
		  //	Actions  end
		  ///////////////////////////////////////////////////////////////////////////
		  
		  _bindAction : function(){
				$("div[scope='"+VmHealthyMonitor.scope+"'] #toolbar4privatenet .actionBtn").unbind("click").click(function(){
					if($(this).hasClass("disabled")) return;
					var action = $(this).attr("action");
					VmHealthyMonitor._invokeAction(action);
				});
		  },
			
		  _invokeAction : function(action){
				var invoker = VmHealthyMonitor["" + action];
				if(invoker && typeof invoker == 'function') {
					invoker();
				}
		  },
		  
		  _refreshDtTable : function(data) {
		    if(VmHealthyMonitor.dtTable) {
		      VmHealthyMonitor.dtTable.updateData(data);
		    } else {
		      VmHealthyMonitor.dtTable = new com.skyform.component.DataTable();
		      VmHealthyMonitor.dtTable.renderByData("#private_vmHealthy_instanceTable",{
		    	pageSize : 5,		        
		        data : data,
		        onColumnRender : function(columnIndex,columnMetaData,columnData){
		          if(columnMetaData.name=='ID') {
					  return columnData.id;
				  } else if(columnMetaData.name=="id") {
		              return "<input type='checkbox' value='" + columnData["id"] +"'/>" ;
		          } else if (columnMetaData.name == 'state') {
		        	  return com.skyform.service.LBMRService.queryVMHealthState(columnData.state);
		          }else if(columnMetaData.name == 'creatTime'){
					  var text = '';
					  if(columnData.createDate == '' || columnData.createDate == 'undefined'){
					  	return text;
					  }
					  try {
							var obj = eval('(' + "{Date: new Date(" + columnData.creatTime + ")}" + ')');
							var dateValue = obj["Date"];
							text = dateValue.format('yyyy-MM-dd hh:mm:ss');
						} catch (e) {
					    }
					  return text;
		          }else {
		        	  return columnData[columnMetaData.name];
		          }
		        },
		        afterRowRender : function(rowIndex,data,tr){
		          tr.attr("lbName",data.lbName);
		          tr.attr("vmName",data.vmName);
		          tr.attr("state",data.state);
		          tr.attr("lbHealthName",data.lbHealthName);
		          tr.attr("vmId",data.vmId);
		          tr.attr("lbHealthId",data.lbHealthId);
		          tr.attr("lbId",data.lbId);
		          
		          tr.find("input[type='checkbox']").click(function(){
		        	 VmHealthyMonitor.onInstanceSelected(); 
		          });
		          
		          tr.unbind("click").click(function(){
		        	 VmHealthyMonitor.getLbHealthyRelation(data.lbId,data.lbHealthId);
		        	 VmHealthyMonitor.showDetails(data); 
		          });
		        },
		        afterTableRender : VmHealthyMonitor._afterDtTableRender
		      });
		      
		      VmHealthyMonitor.dtTable.addToobarButton($("#toolbar4privatenet"));
		      VmHealthyMonitor.dtTable.enableColumnHideAndShow("right");
		    }
		  },
		  
		  _afterDtTableRender : function(){
		    var check = $("input#vmHealthycheckAll[type='checkbox']").unbind("click").click(function(e){
		      e.stopPropagation();
		      var check = $(this).attr("checked");
		      VmHealthyMonitor.checkAll(check);
		    });
		    /*if(!VmHealthyMonitor.contextMenu) {
		      VmHealthyMonitor.contextMenu = new ContextMenu({
		    	container : "#contextMenuPrivateNet",
		        beforeShow : function(tr){
		          VmHealthyMonitor.checkAll(false);
		          tr.find("input[type='checkbox']").attr("checked",true);
		        },
		        afterShow : function(tr) {
		          VmHealthyMonitor.onInstanceSelected({
		            instanceName : tr.attr("instanceName"),
		            id : tr.attr("instanceId"),
		            state : tr.attr("state")
		          });
		        },
		        onAction : function(action) {
		        	VmHealthyMonitor._invokeAction(action);
		        },
		        trigger : "#private_vmHealthy_instanceTable tr"
		      });
		    } else {
		      VmHealthyMonitor.contextMenu.reset();
		    }*/
		   // VmHealthyMonitor.showDetails();
		  },
		  
		  checkAll : function(check){//全选触发的操作
		    if(check) $("#private_vmHealthy_instanceTable tbody input[type='checkbox']").attr("checked",true);
		    else $("#private_vmHealthy_instanceTable tbody input[type='checkbox']").removeAttr("checked");
		    VmHealthyMonitor.onInstanceSelected(false);
		  },
		  
		  onInstanceSelected : function(selectInstance){//单选一个触发的操作
		    var allCheckedBox = $("#private_vmHealthy_instanceTable tbody input[type='checkbox']:checked");
		    var rightClicked = selectInstance?true:false;
		    var state = $(allCheckedBox[0]).parents("tr").attr("state");
		    
			if(selectInstance) {
				state = selectInstance.state;
			}
		    var oneSelected = allCheckedBox.length == 1;
		    var hasSelected = allCheckedBox.length > 0;
		    $("div[scope='"+VmHealthyMonitor.scope+"'] .operation").addClass("disabled");
		    $("div[scope='"+VmHealthyMonitor.scope+"'] .operation").each(function(index,operation){
		      var condition = $(operation).attr("condition");
		      var action = $(operation).attr("action");
		      var enabled = true;
		      eval("enabled=("+condition+")");
		      if(enabled) {
		        $(operation).removeClass("disabled");
		      } else {
		        $(operation).addClass("disabled");
		      }
		      VmHealthyMonitor._bindAction();
		    });
		    if(rightClicked) {
		      VmHealthyMonitor.instanceName = selectInstance.instanceName;
		      VmHealthyMonitor.selectedInstanceId = selectInstance.id; 
		    } else {
		      for ( var i = 0; i < allCheckedBox.length; i++) {
		        var currentCheckBox = $(allCheckedBox[i]);
		        if (i == 0) {
		          VmHealthyMonitor.instanceName = currentCheckBox.parents("tr").attr("name");
		          VmHealthyMonitor.selectedInstanceId = currentCheckBox.attr("value");
		        } else {
		          VmHealthyMonitor.instanceName += "," + currentCheckBox.parents("tr").attr("name");
		          VmHealthyMonitor.selectedInstanceId += "," + currentCheckBox.attr("value");
		        }
		      }
		    }
		  },
		  getLbHealthyRelation : function(lbId,lbHealthId){//路由子网关联资源的查询
			    $("#lb").html("");
				$("#lbHealthy").html("");
				MonitorRule.service.listRelatedInstances(lbId,function(data){
					var array = $.parseJSON(data);
					if(array == null || array.length == 0) {
						return;
					}else{
						$("#lb").empty();
						var dom = "";
						
						$(array).each(function(i) {
							var _resId = "";
							var _state = "";
							if(array[i].templateType==20){
								/*_resId = array[i].resId;*/
								//_state = com.skyform.service.StateService.getState("monitor",array[i].state);
								_state = MonitorRule.service.queryBindState(array[i].relaState);
								dom += "<li class=\"detail-item\">"
									+"<span>监控规则</span>&nbsp;&nbsp;&nbsp;&nbsp;"
									+"<span>"+array[i].id+"</span>&nbsp;&nbsp;&nbsp;&nbsp;"
									/*+"<span>"+Route.switchType(array[i].templateType)+"</span>&nbsp;&nbsp;&nbsp;&nbsp;"*/
									+"<span>"+array[i].instanceName+"</span>&nbsp;&nbsp;&nbsp;&nbsp;"							
									/*+"<span>"+_resId+"</span>&nbsp;&nbsp;&nbsp;&nbsp;"*/
									+"<span>"+_state+"</span>"
									+"</li>";	
							}
						});
						$("#lb").append(dom);
					}
				});
				var params={
						lbLbHealthMonitorId:""+lbHealthId
				};
				MonitorRule.service.bindLbList(params,function onSuccess(data){
					var dom="";
					if(data.length>0){
						for(i=0;i<data.length;i++){
							dom += "<li class=\"detail-item\">"
								+"<span>负载均衡</span>&nbsp;&nbsp;&nbsp;&nbsp;"
								+"<span>"+data[i].id+"</span>&nbsp;&nbsp;&nbsp;&nbsp;"
								+"<span>"+data[i].instanceName+"</span>&nbsp;&nbsp;&nbsp;&nbsp;"							
								+"<span>"+MonitorRule.service.queryBindState(data[i].relationStatus)+"</span>"
								+"</li>";
						}
						$("#lbHealthy").append(dom);
					}
				},function onError(msg){
			    	$.growlUI("提示", "查询负载均衡出错：" + msg); 
			    });
				
		  },
		  service : com.skyform.service.privateNetService,
		  mrService : com.skyform.service.LBMRService
};
$(function(){
	var VmHealthyMonitorInited = false;
	//
	//MonitorRule.init();
	VmHealthyMonitor.init();
	$("#monitorRule_tab").on("show",function(){
		
		//window.currentInstanceType='mr';
		//$("#_product").text(CommonEnum.product[window.currentInstanceType]);
		$("div.details_content[scope !='" + MonitorRule.scope+"']").addClass("hide");
		$("div.details_content[scope ='" + MonitorRule.scope+"']").removeClass("hide");
	});
	
	$("#monitorRule_tab").on("shown",function(){
		
		if(!VmHealthyMonitorInited) {
			VmHealthyMonitorInited = true;
			//VmHealthyMonitor.init();
			MonitorRule.init();
		}
	});
	
	$("#monitorRule_health_tab").on("show",function(){
		
		//window.currentInstanceType='desktopCloud';
		//$("#_product").text(CommonEnum.product[window.currentInstanceType]);
		$("div.details_content[scope !='" + VmHealthyMonitor.scope+"']").addClass("hide");
		$("div.details_content[scope ='" + VmHealthyMonitor.scope+"']").removeClass("hide");
	});
	
	ErrorMgr.init();
	
});