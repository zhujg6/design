//当前刷新实例的类型为子网

window.Controller = {
		init : function(){
		},
		refresh : function(){
			Route.refreshData();
			PrivateNetwork.refreshData();
		}
	}
$(function(){
	
});

var PrivateNetwork = {
		  billType_ : "",
		  cidr_ : "",
		  data : [],
		  dtTable : null,
		  newFormModal : null,
		  bindRouteModal : null,
		  contextMenu : null,
		  scope : "privateNet",
		  privateNetIP : [],
		  routeId : [],
		  privateNetName : [],
		  isGateWay : null,
		  currentNetId:null,
		  init : function(){
		  	PrivateNetwork.getBillType()
		    PrivateNetwork.refreshData();
		    PrivateNetwork._bindAction();
		  },
		  
	  	  ///////////////////////////////////////////////////////////////////////////
		  //	Actions  start
		  ///////////////////////////////////////////////////////////////////////////
			
		  destroy : function(){
			ConfirmWindow.setTitle(Dict.val("net_destruction_private_network")).setContent("<h4>"+Dict.val("net_do_you_destruction_private_network")+"</h4>").onSave = function(){
				var subnetIds = new Array();
				subnetIds = PrivateNetwork.selectedInstanceId.split(",");	
				$(subnetIds).each(function(index, _subnetIds) {
					PrivateNetwork.service.destroy(_subnetIds,function onDestroied(data){
						if (data==0){
							ErrorMgr.showError(Dict.val("net_presence_network_private_cloud_hosting_first_remove_cloud_host"));
						}
						if (data==1){
							$.growlUI(Dict.val("net_destruction_private_network"), Dict.val("net_destruction_private_network_success"));
							ConfirmWindow.hide();
						}
						PrivateNetwork.refreshData(); //现在返回的data其实是对应私网的id号，上面四五行代码其实没用了，此行有用。
					},function failedToDestroy(error){
						ErrorMgr.showError(error);
					});
				});
				ConfirmWindow.hide();
			};
			ConfirmWindow.show();
		  },
		  bindRoute : function(){
			  if(PrivateNetwork.bindRouteModal == null){
			      PrivateNetwork.bindRouteModal = new com.skyform.component.Modal("bdRoute","<h3>"+Dict.val("net_unBind_router")+"</h3>",
			      $("script#bindRoute").html(),{
			        buttons : [
			                   {name:Dict.val("common_determine"),
			                   
							onClick:function(){
								var row = $("#private_network_instanceTable tbody input[type='checkbox']:checked").closest("tr");
								var condition = {};
								condition.routerId = parseInt($(".routes select").val());
								condition.networkId = parseInt(row.attr("instanceId"));
//								var cidr_ = row.attr("cidr")
								if(!isIpSegmentCoincide(PrivateNetwork.cidr_,PrivateNetwork.data,condition.routerId)){
									$.growlUI(Dict.val("common_tip"),Dict.val("net_subnet_network_route_reselect"));
									return;
								}
								com.skyform.service.privateNetService.attachRoute(condition,function(result){
									$.growlUI(Dict.val("common_tip"),Dict.val("net_bind_success"));
									PrivateNetwork.bindRouteModal.hide();
									PrivateNetwork.refreshData();
								},function(result){
									$.growlUI(Dict.val("common_tip"),Dict.val("net_bind_fails")+result);
									PrivateNetwork.bindRouteModal.hide();
								});
							},
			                   attrs:[{name:'class',value:'btn btn-primary'}]},
			                   {name:Dict.val("common_cancel"),
			                   onClick:function(){
			                     PrivateNetwork.bindRouteModal.hide();
			                   },
			                   attrs:[{name:'class',value:'btn'}]}
			                   ],
			      beforeShow : function(container){
			      },
			      afterShow : function(){
			    	  PrivateNetwork.subnetList(function(nets){
			    		  PrivateNetwork.setSubnetListForBindRoute(nets)
			    	  });
			    	  PrivateNetwork.cidr_ = $("#private_network_instanceTable tbody input[type='checkbox']:checked").closest("tr").attr("cidr");
			      }
			      });
			    }
			  PrivateNetwork.bindRouteModal.setWidth(700).autoAlign().setTop(60).show();
		  },
		  
		  update : function(){
			  //PrivateNetwork.service.queryById({id:PrivateNetwork.selectedInstanceId},function(net){
				//	var net = net[0];
					FormWindow.setTitle(Dict.val("net_modify_private_network")).setContent("" + $("#update_privatenet_form").html()).onSave = function(){
						var param  = {
								"subscriptionId": parseInt(PrivateNetwork.selectedInstanceId),
								"name":$("#update_form_subnet_name").val()
						};
						PrivateNetwork.service.update(PrivateNetwork.selectedInstanceId, param,function(result){
							FormWindow.hide();
							$.growlUI(Dict.val("net_modify_private_network"),Dict.val("common_modify_success"));
							PrivateNetwork.refreshData();
						},function(error){
							ErrorMgr.showError(error);
						});
						FormWindow.hide();
					};			
					FormWindow.beforeShow = function(container){
						var oldInstanceName = $("#private_network_instanceTable tbody input[type='checkbox']:checked").parents("tr").attr("instanceName");
						container.find("#update_form_subnet_name").val(oldInstanceName||"");
						//container.find("#update_form_subnet_name").val(net.name||"");
					};
					FormWindow.setWidth(500).autoAlign().setTop(100);
					FormWindow.show();					
				//},function(error){
				//	ErrorMgr.showError(error);
				//});
		  },
		  
		  addToVM : function(){
			  FormWindow.setWidth(480).autoAlign().setTop(100);
			  FormWindow.setTitle(Dict.val("net_adding_host")).setContent("" + $("#privatenet_form_add2VM").html()).onSave = function(){
				  var str = "";
				  var vmIds = "";
				  $("input[type='checkbox'][name='form_privatenet_vm']:checked").each(function(){
					  if(vmIds == ""){
						  vmIds = ""+$(this).val()
					  }
					  else{ 
						  vmIds += ","+$(this).val()
					  }
				   });
				  	//var subnet = PrivateNetwork.getInstanceInfoById(PrivateNetwork.selectedInstanceId);
				  	//var vm = {
				  			//eInstanceId : vms
				  	//};
				  	var netId =PrivateNetwork.selectedInstanceId;
				  	PrivateNetwork.bindVmToSubnet(vmIds, netId);
				   FormWindow.hide();
				};
				FormWindow.beforeShow = function(){
					PrivateNetwork.vmList();
					
				};
				FormWindow.show();
		  },
		  
		  connect : function(){
			  FormWindow.setTitle(Dict.val("net_connection_router")).setContent("" + $("#privatenet_form_connect2Route").html()).onSave = function(){
					//TODO invoke service method
				   FormWindow.hide();
				};
				FormWindow.beforeShow = function(container){
					PrivateNetwork._subNetCfg(container);
				};
				FormWindow.show();
		  },
		  
		  _subNetCfg: function(container){
			  $(container).find("a.advanced-options").unbind("click").click(function(){
					if(!this.hide) {
						this.hide = true;
						container.find("div.advance-options").removeClass("hide");
						$(this).html(Dict.val("net_hide_advanced_options"));
					} else {
						this.hide = false;
						container.find("div.advance-options").addClass("hide");
						$(this).html(Dict.val("net_show_advanced_options"));
					}
				});
				com.skyform.component.utils.restrainInputFieldToMatchIntNumber("input.input-ip",function numberFix(input){
					var value = input.val();
					if(value+"" == "") {
						input.val("");
					} else if (parseInt(value) > 255) {
						input.val(255);
					}
					if(input.hasClass("ip_network") && !input.hasClass("disabled")) {
						$(container).find("input.ip_network").val(input.val());
					}
				});
		  },
		  
		  disconnect : function(){
			  ConfirmWindow.setTitle(Dict.val("net_disconnect_router")).setContent(Dict.val("net_do_you_disconnect_router")).onSave = function(){
					ConfirmWindow.hide();
				};
				ConfirmWindow.show();
		  },
		  
		  refreshData : function(){
			  if(PrivateNetwork.dtTable) PrivateNetwork.dtTable.container.find("tbody").html("<tr ><td colspan='7' style='text-align:center;'><img src='"+CONTEXT_PATH+"/images/loader.gif'/><strong>"+Dict.val("common_retrieving_data_please_wait")+"</strong></td></tr>");
		    PrivateNetwork.service.listAll(function onSuccess(nets){		    			    	
		    	for (var i = 0; i < nets.length; i++) {
		    		PrivateNetwork.privateNetIP.push(nets[i].ipSegments);	
		    		PrivateNetwork.privateNetName.push(nets[i].name);	
		    	}
		    	
		    	//过滤掉已删除的私网
		    	for(var i = 0; i < nets.length; i++){
		    		if(i==0){
		    			PrivateNetwork.data=[];
		    		}
		    		if(!(nets[i].state=="deleted")){
		    			PrivateNetwork.data.push(nets[i]);
		    		}
		    	}
		    	
		    	//首先得到第一个私网的关联资源放到页面上
		    	if(PrivateNetwork.data.length>0){
		    		var firstInstanceId = PrivateNetwork.data[0].id;
		    		PrivateNetwork.getNetRule(firstInstanceId);
		    	}
		        PrivateNetwork._refreshDtTable(PrivateNetwork.data);
		    },function onError(msg){
		      alert(Dict.val("common_error")+"：" + msg);
		    });
		  },
		  
		  showDetails : function(instance){
			  if(!PrivateNetwork.data || PrivateNetwork.data.length < 1) return;
			  if(!instance) {
				  instance = PrivateNetwork.data[0];
			  }
			  $("div[scope='"+PrivateNetwork.scope+"'] .detail_value").each(function (i,item){
				  var prop = $(item).attr("prop");
				  var value = instance['' + prop] || "---";
				  if(prop == "state") {
					  value = com.skyform.service.StateService.getState("Subnet",value);
				  } 
				  $(item).html(value);
			  });
//			  com.skyform.service.LogService.getNetLogByNetId(instance.id,function(logs){
//				  $("#subnet_logs").empty();
//				  $(logs).each(function(i,v){
//					  $("<li class='detail-item'><span>" + new Date(v.createTime).format("yyyy-MM-dd hh:mm:ss") + ":" + v.operateContent + "</span></li>").appendTo($("#subnet_logs"));
//				  });
//			  });	
			  $("#subnet_logs").empty(); 
			  com.skyform.service.LogService.describeLogsUIInfo(instance.id,"subnet_logs");
//			  com.skyform.service.LogService.describeLogsInfo(instance.id,function(logs){
//				  $("#subnet_logs").empty();
//					$(logs).each(function(i,v){
//						var desc = "";
//						if(v.description){
//							if(v.description != ""){
//								desc = "("+v.description+")";
//							}						
//						}
//						var _name = "";
//						if(v.subscription_name){
//							_name = v.subscription_name;
//						}
//						$("<li class='detail-item'><span>" + v.createTime + "  " +v.subscription_name+"  "+ v.controle +desc+ "</span></li>").appendTo($("#subnet_logs"));
//						  });
//			  },function onError(msg){
////					$.growlUI(Dict.val("common_tip"), "查询弹性块存储日志发生错误：" + msg); 
//				});
			  com.skyform.service.vmService.listRelatedInstances(instance.id,function(vm){
				  $("#netRule").empty(); 
				  var dom = "";
				  $(vm).each(function(i,_vm){
					  dom = "";			
					  dom += "<li class=\"detail-item\">"
						  +"<span>" + PrivateNetwork.switchType(_vm.templateType) + "ID&nbsp;&nbsp;&nbsp;&nbsp;" + _vm.id +"</span>&nbsp;&nbsp;&nbsp;&nbsp;"
						  +"<span>" + PrivateNetwork.switchType(_vm.templateType) + Dict.val("common_name")+"&nbsp;&nbsp;&nbsp;&nbsp;"+ _vm.instanceName+"</span>&nbsp;&nbsp;&nbsp;&nbsp;"
						  +"</li>";
					  $("#netRule").append(dom);
				  });
			  },function(error){
				  //TODO show error info in window
			  }); 			
		  },
		  ///////////////////////////////////////////////////////////////////////////
		  //	Actions  end
		  ///////////////////////////////////////////////////////////////////////////
		  
		  getInstanceInfoById : function(instanceId) {
			var result = null;
			$(PrivateNetwork.data).each(function(i,instance){
				if(instance.id+"" == instanceId+"") {
					result = instance;
					return false;
				}
			});
			return result;
		  },
		  
		  _bindAction : function(){
				$("div[scope='"+PrivateNetwork.scope+"'] #toolbar4privatenet .actionBtn").unbind("click").click(function(){
					if($(this).hasClass("disabled")) return;
					var action = $(this).attr("action");
					PrivateNetwork._invokeAction(action);
				});
		  },
			
		  _invokeAction : function(action){
				var invoker = PrivateNetwork["" + action];
				if(invoker && typeof invoker == 'function') {
					invoker();
				}
		  },
		  
		  _refreshDtTable : function(data) {
		    if(PrivateNetwork.dtTable) {
		      PrivateNetwork.dtTable.updateData(data);
		    } else {
		      PrivateNetwork.dtTable = new com.skyform.component.DataTable();
		      PrivateNetwork.dtTable.renderByData("#private_network_instanceTable",{
		    	pageSize : 5,
		        
		        data : data,
		        onColumnRender : function(columnIndex,columnMetaData,columnData){
		          if(columnMetaData.name=='ID') {
					  return columnData.id;
				  } else if(columnMetaData.name=="id") {
		              return "<input type='checkbox' value='" + columnData["id"] +"'/>" ;
		          } else if (columnMetaData.name == 'state') {
		        	  return com.skyform.service.StateService.getState("Subnet",columnData['state']);
		          } else if(columnMetaData.name == 'ipSegments'){ //added by shixianzhi
		        	  var data1 = columnData['ipSegments']+"";
		        	  if(data1=="undefined"){
		        		  return "";
		        	  }
		        	  if(data1=="-"){
		        		  return "";
		        	  }
		        	  return data1.split(".")[0]+"."+data1.split(".")[1]+"."+data1.split(".")[2]+"."+"0/24";
		          } else if(columnMetaData.name == 'routeNname'){
		        	  return columnData['routeNname'];
		          } else if(columnMetaData.name == 'dns'){
		        	  return columnData['dns'];
		          } else if(columnMetaData.name == 'ipGateway'){
		        	  return columnData['ipGateway'];
		          } else if(columnMetaData.name == 'createDate'){
		        	  //var time = columnData.createDate+"";
		        	  //return time.substring(0, 4)+"-"+time.substring(4, 6)+"-"+time.substring(6, 8)+" "+time.substring(8, 32);
					  var text = '';
					  //console.log(columnData.createDate);
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
		          }else if(columnMetaData.name=='name'){
		        	  text = columnData.name
					  +"<a title="+Dict.val("common_advice")+" href='../user/workOrder.jsp?code=workOrder&cataCode=service&instanceId="+columnData.id+"&serviceType=subnet&instanceName="+encodeURIComponent(columnData.name)+
					  "&instanceStatus="+columnData.status+
					  "&currentPoolW="+encodeURIComponent(CommonEnum.pools[CommonEnum.currentPool])+
					  "'><i class='icon-comments' ></i></a>";
			    	 return text;
		          }else {
		        	  return columnData[columnMetaData.name];
		          }
		        },
		        afterRowRender : function(rowIndex,data,tr){
		          tr.attr("instanceId",data.id);
		          tr.attr("instanceName",data.name);
		          tr.attr("instanceState",data.state);
		          tr.attr("cidr",data.cidr);
		          tr.attr("routeName",data.routeName);
		          
		          tr.find("input[type='checkbox']").click(function(){
		        	 PrivateNetwork.onInstanceSelected(); 
		          });
		          
		          tr.unbind("click").click(function(){
		        	 PrivateNetwork.getNetRule(data.id); //added by shixianzhi 关联资源
		        	 PrivateNetwork.showDetails(data); 
		          });
		        },
		        afterTableRender : PrivateNetwork._afterDtTableRender
		      });
		      
		      PrivateNetwork.dtTable.addToobarButton($("#toolbar4privatenet"));
		      PrivateNetwork.dtTable.enableColumnHideAndShow("right");
		    }
		  },
		  
		  _afterDtTableRender : function(){
		    var check = $("input#selectAllIp[type='checkbox']").unbind("click").click(function(e){
		      e.stopPropagation();
		      var check = $(this).attr("checked");
		      PrivateNetwork.checkAll(check);
		    });
		    if(!PrivateNetwork.contextMenu) {
		      PrivateNetwork.contextMenu = new ContextMenu({
		    	container : "#contextMenuPrivateNet",
		        beforeShow : function(tr){
		          PrivateNetwork.checkAll(false);
		          tr.find("input[type='checkbox']").attr("checked",true);
		        },
		        afterShow : function(tr) {
		          PrivateNetwork.onInstanceSelected({
		            instanceName : tr.attr("instanceName"),
		            id : tr.attr("instanceId"),
		            state : tr.attr("instanceState")
		          });
		        },
		        onAction : function(action) {
		        	PrivateNetwork._invokeAction(action);
		        },
		        trigger : "#private_network_instanceTable tr"
		      });
		    } else {
		      PrivateNetwork.contextMenu.reset();
		    }
		    PrivateNetwork.showDetails();
		  },
		  
		  checkAll : function(check){//全选触发的操作
		    if(check) $("#private_network_instanceTable tbody input[type='checkbox']").attr("checked",true);
		    else $("#private_network_instanceTable tbody input[type='checkbox']").removeAttr("checked");
		    PrivateNetwork.onInstanceSelected(false);
		  },
		  
		  onInstanceSelected : function(selectInstance){//单选一个触发的操作
		    var allCheckedBox = $("#private_network_instanceTable tbody input[type='checkbox']:checked");
		    var rightClicked = selectInstance?true:false;
		    var state = $(allCheckedBox[0]).parents("tr").attr("instanceState");
		    var routeName = $(allCheckedBox[0]).parents("tr").attr("routeName");
		    
			if(selectInstance) {
				state = selectInstance.state;
			}
		    var oneSelected = allCheckedBox.length == 1;
		    var hasSelected = allCheckedBox.length > 0;
		    $("div[scope='"+PrivateNetwork.scope+"'] .operation").addClass("disabled");
		    $("div[scope='"+PrivateNetwork.scope+"'] .operation").each(function(index,operation){
		      var condition = $(operation).attr("condition");
		      var action = $(operation).attr("action");
		      var enabled = true;
		      eval("enabled=("+condition+")");
		      if(enabled) {
		        $(operation).removeClass("disabled");
		      } else {
		        $(operation).addClass("disabled");
		      }
		      PrivateNetwork._bindAction();
		    });
		    if(rightClicked) {
		      PrivateNetwork.instanceName = selectInstance.instanceName;
		      PrivateNetwork.selectedInstanceId = selectInstance.id; 
		    } else {
		      for ( var i = 0; i < allCheckedBox.length; i++) {
		        var currentCheckBox = $(allCheckedBox[i]);
		        if (i == 0) {
		          PrivateNetwork.instanceName = currentCheckBox.parents("tr").attr("name");
		          PrivateNetwork.selectedInstanceId = currentCheckBox.attr("value");
		        } else {
		          PrivateNetwork.instanceName += "," + currentCheckBox.parents("tr").attr("name");
		          PrivateNetwork.selectedInstanceId += "," + currentCheckBox.attr("value");
		        }
		      }
		    }
		  },
		  
		  newInstance : function(){
			PrivateNetwork.subnetList(function(nets){
//				if(!nets || nets.length <=0) {					
//					ErrorMgr.showError("请先去申请路由!");
//				}else if(PrivateNetwork.data && PrivateNetwork.data.length >0&&$("#private_network_instanceTable tbody").length <1){
//					ErrorMgr.showError("正在获取数据，请稍后....");
//				}else {
					var count  = nets.length;
					var m = 0;
					$(nets).each(function(i,v){
						if(v.status.indexOf("error")!=-1){
							m++;
						}
					});
//					if(m == count){
//						ErrorMgr.showError("请先去申请路由!");
//					}
//					else {						
						if(!PrivateNetwork.newFormModal){
						      PrivateNetwork.newFormModal = new com.skyform.component.Modal("newPrivateNetForm","<h3>"+Dict.val("net_create_subnet")+"</h3>",
						      $("script#new_privatenet_form2").html(),{
						        buttons : [
						                   {name:Dict.val("common_determine"),
						                   
       onClick:function(){
//       	if(PrivateNetwork.getBillType() != "5"){
//       	   var ipSegments = $("#ipSegments_input_1").val()+"."+$("#ipSegments_input_2").val()+"."+$("#ipSegments_input_3").val()+"."+$("#ipSegments_input_4").val();
//    	   var ipMask = $("#ipMask_input_1").val()+"."+$("#ipMask_input_2").val()+"."+$("#ipMask_input_3").val()+"."+$("#ipMask_input_4").val();
//    	   var ipGateway = $("#ipGateway_input_1").val()+"."+$("#ipGateway_input_2").val()+"."+$("#ipGateway_input_3").val()+"."+$("#ipGateway_input_4").val();
//    	   var dns = "";
//    	   if($("#dns_input_1").val()!=""){
//    		   dns = $("#dns_input_1").val()+"."+$("#dns_input_2").val()+"."+$("#dns_input_3").val()+"."+$("#dns_input_4").val();
//    	   }
//    	   var standbyDns = "";
//    	   if($("#standbyDns_input_1").val()!=""){
//    		   standbyDns = $("#standbyDns_input_1").val()+"."+$("#standbyDns_input_2").val()+"."+$("#standbyDns_input_3").val()+"."+$("#standbyDns_input_4").val();
//    	   }
//         var params = {
//          name : $("#form_privatenetwork_name").val(),
//          routeId : $("#form_privatenetwork_routeId").val(),
//          routeName : $("#form_privatenetwork_routeId option:selected").text(),
//          ipSegments : ipSegments,
//          ipMask : ipMask, 
//          ipGateway : ipGateway, 
//          dns : dns, 
//          standbyDns : standbyDns 
//         };
//         PrivateNetwork._save(params);
//       	}
//       	else{
       	   var cidr = $("#ipSegments_input_1").val()+"."+$("#ipSegments_input_2").val()+"."+$("#ipSegments_input_3").val()+"."+$("#ipSegments_input_4").val()+"/"+$("#mask").val();
    	   var ipGateway = $("#ipGateway_input_1").val()+"."+$("#ipGateway_input_2").val()+"."+$("#ipGateway_input_3").val()+"."+$("#ipGateway_input_4").val();
    	   var dns = "";
    	   if($("#dns_input_1").val()!=""){
    		   dns = $("#dns_input_1").val()+"."+$("#dns_input_2").val()+"."+$("#dns_input_3").val()+"."+$("#dns_input_4").val();
    	   }
    	   var standbyDns = "";
    	   if($("#standbyDns_input_1").val()!=""){
    		   standbyDns = $("#standbyDns_input_1").val()+"."+$("#standbyDns_input_2").val()+"."+$("#standbyDns_input_3").val()+"."+$("#standbyDns_input_4").val();
    	   }
    	   //var ipMask = $("#ipMask_input_1").val()+"."+$("#ipMask_input_2").val()+"."+$("#ipMask_input_3").val()+"."+$("#ipMask_input_4").val();
         var params = {
          "period": 9999,		 
          name : $("#form_privatenetwork_name").val(),
          routeId : $("#form_privatenetwork_routeId").val(),
          routeName : $("#form_privatenetwork_routeId option:selected").text(),
          cidr : cidr,
          ipGateway : ipGateway, 
          dns : dns, 
          backupDNS : standbyDns 
          //ipSegments : ipSegments,
          //ipMask : ipMask, 
         };
         PrivateNetwork._save(params);
//       	}
    	   
       },
						                   attrs:[{name:'class',value:'btn btn-primary'}]},
						                   {name:Dict.val("common_cancel"),
						                   onClick:function(){
						                     PrivateNetwork.newFormModal.hide();
						                   },
						                   attrs:[{name:'class',value:'btn'}]}
						                   ],
						        beforeShow : function(container){
//						        	if(PrivateNetwork.getBillType() != "5"){
						          $("#tip_ipSegments").empty();
						          PrivateNetwork.isGateWay = null;
						          if(!PrivateNetwork.newFormModal.countField) {
						            PrivateNetwork.newFormModal.countField = new com.skyform.component.RangeInputField("#newPrivateNetForm #privateNetCount",{
						              defaultValue : 1,
						              min : 1,
						              max : 5, 
						              textClass : 'text-large'
						            }).render();
						          }
						          PrivateNetwork.newFormModal.countField.reset();
						          com.skyform.component.utils.restrainInputFieldToMatchIntNumber("#privatenet_instance_count");
						          PrivateNetwork.setSubnetList(nets);
						          PrivateNetwork._subNetCfg(container);
//						        }else{
//						         $("#tip_ipSegments").empty();
////						          if(!PrivateNetwork.newFormModal.countField) {
////						            PrivateNetwork.newFormModal.countField = new com.skyform.component.RangeInputField("#newPrivateNetForm #privateNetCount",{
////						              defaultValue : 1,
////						              min : 1,
////						              max : 5, 
////						              textClass : 'text-large'
////						            }).render();
////						          }
////						          PrivateNetwork.newFormModal.countField.reset();
////						          com.skyform.component.utils.restrainInputFieldToMatchIntNumber("#privatenet_instance_count");
////						          PrivateNetwork._subNetCfg(container);
//						          PrivateNetwork.isGateWay = null;
//						          PrivateNetwork.setSubnetList(nets);
//						        }
						      },
						      afterShow : function(){
						      	if(PrivateNetwork.billType_ != "5" ){
						      		$("#form_privatenetwork_ipSegments input[type='text']").attr("readonly","readonly");
						      		$("#form_privatenetwork_ipSegments input[type='text']:eq(2)").removeAttr("readonly");
						      		$("#form_privatenetwork_ipSegments input[type='text']:eq(0)").val(192);
						      		$("#form_privatenetwork_ipSegments input[type='text']:eq(1)").val(168);
						      		$("#form_privatenetwork_ipSegments input[type='text']:eq(3)").val(0);
						      		$("#form_privatenetwork_ipSegments input[type='text']:eq(4)").val(24);
						      		$("._public_").removeClass("hide");
						      	}
						      	else{
						      		$("._private_").removeClass("hide");
						      	}
						      	$(".cidr .cidr_blur").on("blur",function(){
						      		var flag = true;
						      		$(".cidr .cidr_blur").each(function(){
						      			if($(this).val() == "")
						      				flag = false;
						      		});
						      		if(flag){
						      			var cidr = $("#ipSegments_input_1").val()+"."+$("#ipSegments_input_2").val()+"."
						      			+$("#ipSegments_input_3").val()+"."+$("#ipSegments_input_4").val()+"/"+$("#mask").val();
    	   								if(!checkCIDR(cidr)){
    	   									$("#tip_cidr").empty().html(Dict.val("net_please_enter_rule_cidr"));
    	   									$("#ipGateway_input_1").val("");
    	   									$("#ipGateway_input_2").val("");
    	   									$("#ipGateway_input_3").val("");
    	   									$("#ipGateway_input_4").val("");
    	   								}
    	   								else{
    	   									$("#ipGateway_input_1").val($("#ipSegments_input_1").val());
    	   									$("#ipGateway_input_2").val($("#ipSegments_input_2").val());
    	   									$("#ipGateway_input_3").val($("#ipSegments_input_3").val());
    	   									$("#ipGateway_input_4").val(Number($("#ipSegments_input_4").val())+1);
    	   								}
						      		}
						      	})
						      	$("#form_privatenetwork_ipGateway .range").on("blur",function(){
						      		var flag = true;
						      		$(".cidr .cidr_blur").each(function(){
						      			if($(this).val() == "")
						      				flag = false;
						      		});
						      		$("#form_privatenetwork_ipGateway .range").each(function(){
						      			if($(this).val() == "")
						      				flag = false;
						      		});
						      		if(flag){
						      			var cidr = $("#ipSegments_input_1").val()+"."+$("#ipSegments_input_2").val()+"."+$("#ipSegments_input_3").val()+"."+$("#ipSegments_input_4").val()+"/"+$("#mask").val();
						      			var ipGateway = $("#ipGateway_input_1").val()+"."+$("#ipGateway_input_2").val()+"."+$("#ipGateway_input_3").val()+"."+$("#ipGateway_input_4").val();
    	   								if(!checkIpGateWay(ipGateway,cidr)){
												$("#tip_ipGateway").empty().html(Dict.val("common_please_enter_correct_gateway"));
										}
						      		}
						      	});
						      	$(".cidr .cidr_blur").on("focus",function(){
						      		$("#tip_cidr").empty().html("*");
						      	});
						      	$("#form_privatenetwork_ipGateway .range").on("focus",function(){
						      		$("#tip_ipGateway").empty().html("*");
						      	});
						      }
						      });
						    }
						    PrivateNetwork.newFormModal.setWidth(700).autoAlign().setTop(60).show();
						    //PrivateNetwork.newFormModal.show();
//					}
//				} 
			});
		  },
		  
		  _save : function(network){
			$("#tip_form_privatenetwork_name").empty()
//		    $("#tip_ipSegments").empty();
			$("._tips").empty();
			$("._tips").text("*");
			$("#tip_backupDNS").empty();
			
			var isNetIP = true;
			$(PrivateNetwork.privateNetName).each(function(i,_netName) {
				if(_netName == network.name){
					$("#tip_form_privatenetwork_name").empty().html(Dict.val("common_subnet_name_already_used"));
					isNetIP = false;
					//return;
				}
			});
			if($.trim(network.name) == '') {
				//result.msg = "请填写不包括非法字符的实例名称";
				$("#tip_form_privatenetwork_name").empty().html(Dict.val("common_please_fill_in_name_subnet"));
				isNetIP = false;
				//return;
			}else {
				var scoreReg = /^[\u4E00-\u9FA0A-Za-z\-0-9\_]+$/;
				if(! scoreReg.exec($.trim(network.name)) ) {
					//result.msg = "请填写不包括非法字符的实例名称";
					$("#tip_form_privatenetwork_name").empty().html(Dict.val("common_name_no_illegal_char"));
					isNetIP = false;
					//return;
				}
			}
			
			//做对子网网段是否使用的判断
//			var route_net_ips = {};  //键值对，用于存放每个路由下所对应的私网的网关
//			var pNets = PrivateNetwork.data;
//			for(var i=0; i<pNets.length; i++){
//				route_net_ips[pNets[i].routeName] = [];
//			}
//			for(var j=0; j<pNets.length; j++){
//				route_net_ips[pNets[j].routeName].push(pNets[j].ipSegments);
//			}
//			if(route_net_ips[network.routeName]+""=="undefined"){
//				//do nothing
//			}else{
//				for(var k=0; k<route_net_ips[network.routeName].length; k++){
//					if((route_net_ips[network.routeName][k].split("-")[0])==network.ipSegments){
//						$("#tip_ipSegments").empty().html("* 该网段已经被使用！");
//						//alert('该子网网段已经被使用');
//						isNetIP = false;
//						//return;
//					}
//				}
//			}
//			if(PrivateNetwork.currentNetId != null){
//				if((PrivateNetwork.currentNetId.split("-")[0])==network.ipSegments){
//					$("#tip_ipSegments").empty().html("* 该网段已经被使用！");
//					//alert('该子网网段已经被使用');
//					isNetIP = false;
//					//return;
//				}
//			}
			var _flag = true;
//			if(PrivateNetwork.getBillType() == "5"){
//				var _flag = true;
				if(!checkCIDR(network.cidr)){
					$("#tip_cidr").empty().html(Dict.val("net_please_enter_rule_cidr"));
					_flag = false;
				}else{
					if(!checkIpGateWay(network.ipGateway,network.cidr)){
						$("#tip_ipGateway").empty().html(Dict.val("net_please_enter_correct_gateway"));
						_flag = false;
					}
					if(!isIpSegmentCoincide(network.cidr,PrivateNetwork.data,network.routeId)){
						$("#tip_cidr").empty().html(Dict.val("net_cidr_under_route_used"));
						_flag = false;
					}
				}
				if(!checkDNS(network.dns)){
					$("#tip_dns").empty().html(Dict.val("net_please_enter_correct_dns"));
					_flag = false;
				}
				if(!checkBackupDNS(network.backupDNS)){
					$("#tip_backupDNS").empty().html(Dict.val("net_please_enter_correct_backup_dns"));
					_flag = false;
				}
				if(network.routeId == ""){
					delete network.routeId;
					delete network.routeName;
				}
//			}
			if(!isNetIP)
				return;
			if(!_flag){
				return;
			}
//			return;
//			if(PrivateNetwork.getBillType() == "5"){
				network.ipMask = getMask((network.cidr).split("/")[1]);
//			}
			//赋给多次提交标志位
//			if(PrivateNetwork.isGateWay == network.ipSegments){
//				isNetIP = false;
//				PrivateNetwork.newFormModal.hide();
//			    $.growlUI(Dict.val("common_tip"), "* 已提交成功请不要多次提交！");		
//			}
//			if(isNetIP){
//				PrivateNetwork.isGateWay = network.ipSegments;
				 //加入变量可以添加
//			      PrivateNetwork.currentNetId = network.ipSegments;
				var params = {//无任何绑定创建路由的入参
	        			period:9999,
	        			count:1,   
	        			productList:[{
	        				backupDNS :network.backupDNS ,
	        				cidr :network.cidr ,
	        				dns :network.dns ,
	        				ipGateway :network.ipGateway ,
	        				ipMask :network.ipMask ,
	        				name :network.name ,
	        				period :network.period ,
	        				routeId:network.routeId,
	        				routeName:network.routeName
	        			             	
	        			}]
	        	   };
				
			    PrivateNetwork.service.save(params,function onSuccess(){
			      PrivateNetwork.newFormModal.hide();
			      $.growlUI(Dict.val("common_tip"), Dict.val("net_creating_private_network_request_successful_please_wait"));	
				  PrivateNetwork.refreshData();
				}, function onError(msg) {
					PrivateNetwork.newFormModal.hide();
					$.growlUI(Dict.val("common_tip"), Dict.val("net_creating_private_network_fails")+msg);
				});
//			}
		  },
		  
		  subnetList : function(callback){		
			  PrivateNetwork.routeService.query({state:'running'},function onSuccess(nets){
					if(callback && typeof callback == 'function'){
						callback(nets);
					}
				},function onError(msg){
					ErrorMgr.showError(msg);
				});
		  },
		  
		  setSubnetList : function(ruteData){			 
			  $("#form_privatenetwork_routeId").find("option").remove();
//			  var billType = PrivateNetwork.getBillType();
//			  if(billType == "5"){
			  	$("#form_privatenetwork_routeId").append("<option value=''>-------"+Dict.val("common_choose")+"-------</option>");
//			  }
			  $(ruteData).each(function(i,rute){
				  	 //过滤掉无用的路由，只有状态为running的路由才可以绑定私网
				     if(rute.status=="running"){
				    	 var ruteOption = "<option value="+rute.id+">"+rute.name+"</option>";
				    	 $("#form_privatenetwork_routeId").append(ruteOption);
				     }
				});
		  },
		  setSubnetListForBindRoute : function(ruteData){			 
			  $(".routes select").empty();
//			  var billType = PrivateNetwork.getBillType();
//			  if(billType == "5"){
//				  $("#form_privatenetwork_routeId").append("<option value=''>-------请选择-------</option>");
//			  }
			  $(ruteData).each(function(i,rute){
				  //过滤掉无用的路由，只有状态为running的路由才可以绑定私网
				  if(rute.status=="running"){
					  var ruteOption = "<option value="+rute.id+">"+rute.name+"</option>";
					  $(".routes select").append(ruteOption);
				  }
			  });
		  },
		  vmList : function() {
			    var params = {
						"states" : "running"
				};
			    PrivateNetwork.vmService.queryInstances(params,function(instances){
					if(instances && instances.length>0) {
						PrivateNetwork.setVmList(instances);
					}
				}, function(errorMsg){
					$.growlUI(Dict.val("common_tip"),  Dict.val("net_select_vm_error") + errorMsg);
				});
		  },
		   
		  setVmList : function(vmData){
			    $("#form_privatenet_vms_checkbox tbody").empty();
			    $(vmData).each(function(i,vm){
				       var vms_checkbox = "<tr>" +
				     		  "<td><input type='checkbox' name='form_privatenet_vm' value="+vm.id+" eInstanceId='"+vm.eInstanceId+"'/></td><td>"+vm.instanceName+"</td>" +
				     		  "</tr>";
					   $("#form_privatenet_vms_checkbox tbody").append(vms_checkbox);
				});
		  },
		   
		  bindVmToSubnet : function(vm,subnet) {
			    PrivateNetwork.service.bindVmToSubnet(vm,subnet,function(instances){
					if(instances && instances.length>0) {
						PrivateNetwork.setVmList(instances);
					}
					PrivateNetwork.getNetRule(subnet);
					$.growlUI(Dict.val("common_tip"), Dict.val("common_add_success"));
				}, function(errorMsg){
					$.growlUI(Dict.val("common_tip"), Dict.val("net_select_vm_error") + errorMsg);
				});
		  },
		  unbindVmToSubnet : function(vm,subnet) {
			    PrivateNetwork.service.unbindVmToSubnet(vm,subnet,function(instances){
//					if(instances && instances.length>0) {
//						PrivateNetwork.setVmList(instances);
//					}
					$.growlUI(Dict.val("common_tip"), Dict.val("common_removed_success"));
				}, function(errorMsg){
					$.growlUI(Dict.val("common_tip"), Dict.val("net_select_vm_error") + errorMsg);
				});
		  },
		  
		  getNetRule : function(routeId){//路由子网关联资源的查询
//				$("#netRule").html("");
//				com.skyform.service.vmService.listRelatedInstances(routeId,function(data){
//					var array = $.parseJSON(data);
//					if(data == null || data.length == 0) {
//						return;
//					}else{
//						$("#netRule").empty();
//						var dom = "";
//						$(data).each(function(i) {
//							if(data[i].relaState == 9){
//								dom += "<li class=\"detail-item\">"
//									+"<span>"+PrivateNetwork.switchType(data[i].templateType)+"</span>&nbsp;&nbsp;&nbsp;&nbsp;"
//									+"<span>"+data[i].instanceName+"</span>&nbsp;&nbsp;&nbsp;&nbsp;"
//									+"<span>"+data[i].id+"</span>&nbsp;&nbsp;&nbsp;&nbsp;"
//								if(data[i].templateType == 1 ){
//									dom	+= "<button class='remove' style='width:50px' vmIds='" +data[i].id + "'>移除</button>"
//								}	
//								dom += "</li>";	
//							}	
//								
////								$(".remove").click(function(){
////									PrivateNetwork.removeFromPrivateNetwork();
////								})
//						});
//						$("#netRule").append(dom);
//						$(".remove").click(function(){
//							var vmIds = $(this).attr("vmIds");
//							PrivateNetwork.removeFromPrivateNetwork(vmIds,routeId);
//						})
//					}
//				});
				
		  },
		  
		  removeFromPrivateNetwork : function(vmIds,routeId){			  
			  PrivateNetwork.unbindVmToSubnet(vmIds,routeId);
			  PrivateNetwork.getNetRule(routeId);
		  },
		  
	      switchType : function (type){
				switch(type){
				case 1:
					return Dict.val("common_vm");
				case 2:
					return Dict.val("common_virtual_disk");
				case 3:
					return Dict.val("common_minicomputer");
				case 4:
					return Dict.val("common_cloud_backup");
				case 5:
					return Dict.val("common_cloud_monitor");
				case 6:
					return Dict.val("common_load_balanc");
				case 7:
					return Dict.val("common_firewall");
				case 8:
					return Dict.val("common_bandwidth");
				case 9:
					return Dict.val("common_internet_access");
				case 10:
					return Dict.val("common_physical_machine");
				case 11:
					return Dict.val("common_obs");
				case 12:
					return Dict.val("common_volume");
				case 13:
					return Dict.val("common_file_storage");
				case 14 :
					return "Paas";
				case 16 : 
					return Dict.val("nic_router");
				case 17 : 
					return "Subnet";
				default : 
					return Dict.val("common_unknown");
				}
		  },
		  
		  service : com.skyform.service.privateNetService,
		  routeService : com.skyform.service.routeService,
		  vmService : com.skyform.service.vmService,
		  getBillType : function(){
		  	var obj = com.skyform.service.BillService.getBillType();
//		  	var billType = ""
		  	$.each(obj,function(key,value){
		  		PrivateNetwork.billType_ = key;
		  	});
//		  	return "5";
		  }
};
