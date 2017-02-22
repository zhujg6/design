//当前刷新实例的类型为云桌面
window.Controller = {
		init : function(){
			desktopmanage.init();
		},
		refresh : function(){

			desktopmanage.refreshData();
		}
	}
var ConfirmWindow = new com.skyform.component.Modal("confirmWindow","","",{
	buttons : [
	  {
		  name : Dict.val("common_determine"),
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
		  name : Dict.val("common_cancel"),
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
		  name : Dict.val("common_determine"),
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
		  name : Dict.val("common_cancel"),
		  attrs : [{name:'class',value:'btn'}],
		  onClick : function(){
			  FormWindow.hide();
		  }
	  }
	  ],
	  afterHidden : function(container) {
		  window.currentInstanceType='route';
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
}
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



var desktopmanage = {
		 dtTable : null,
		  contextMenu : null,
		  scope : "deskTop",
		  selectedInstanceId:null,
		  selectedTenantId:null,
		  selectedOsId:null,
		  selectedOsInfo:null,
		  
		  renewModal:null,
		  feeParams:{},
		  billType_ : "",
		  instanceName:null,
		  data:[],
		  data2:[],
		  data3:[],
		  data4:[],
		  dtTable2:null,
		  getFeeParams:null,
		  newFormModal : null,
		  currResPool:null,
		  createDesktopCloudData:null,
		  accIdList:[],
		  privateNetName : [],
		  getLogIdFlag:true,
		  firstDataId:null,
                  clickflag:false,
		  selecedUserNumber:1,
		  currentNetId:null,
		  typeParams:{},
		  //newStatus:null,
		  init : function(){	
//			window.currentInstanceType='desktopmanage';
			desktopmanage.refreshData();
			desktopmanage.currResPool=$("#pool").val();
			desktopmanage.getTenantInfo();
			$('#refreshDt').bind('click',function(){
				desktopmanage.refreshData();
			});
			$('#createInstance').bind('click',function(){
				desktopmanage.newInstance();
			});
			if(CommonEnum.offLineBill){
				desktopmanage.typeParams={"serviceType":1015,"billType":5};
			    }else{
			    desktopmanage.typeParams={"serviceType":1015,"billType":0};
			    }
		  },
		  
	  	  ///////////////////////////////////////////////////////////////////////////
		  //	Actions  start
		  ///////////////////////////////////////////////////////////////////////////
		  getTenantInfo:function(){
				var params2={
    					"serviceFactory":""
    			};
			 //需要给入参
//				desktopmanage.getTenantInfoByArea(params2);
			  com.skyform.service.desktopCloudService.unListTenant(params2,function(data){  
	    			 
	        		desktopmanage.data4=data;
	        		
	        	},function(data){
	        		
	        		
	        	});
		  },
		  //
		  getTenantInfoByArea:function(params){
			  var firsttrchecked=true;
//			  firsttrchecked=false;
			  com.skyform.service.desktopCloudService.unListTenant(params,function(data){ 
				  
	        		desktopmanage.data3=data;
	        		desktopmanage.data2=desktopmanage.data3;
////	        		desktopmanage.data4=data;
	        		if(desktopmanage.dtTable2) {
					      desktopmanage.dtTable2.updateData(desktopmanage.data2);
					    }
//	        		else{
//	        			 desktopmanage.dtTable2 = new com.skyform.component.DataTable();
//					      
//					      desktopmanage.dtTable2.renderByData("#private_desktop_user_instanceTable1",{
//					    	pageSize : 5,
//					        data : desktopmanage.data3,
//					        onColumnRender : function(columnIndex,columnMetaData,columnData){
//					        	
//					          if(columnMetaData.name=='ID') {
//								  return columnData.tenantId;
//							  } else if(columnMetaData.name=="id") {
//								  if(firsttrchecked){
//									  return "<input type='checkbox' checked='checked' value='" + columnData["tenantId"] +"'/>" ;
//						        	  firsttrchecked=false;
//						          }
//					              return "<input type='checkbox' checked='false' value='" + columnData["tenantId"] +"'/>" ;
//					          }  
//					          /*
//							  else if(columnMetaData.name=="deskName") {
//					              return "<input type='text'  value='" + columnData["vmName"] +"'/>" ;
//					          } 
//					          */
//							  else {
//					        	  return columnData[columnMetaData.name];
//					          }
//					        },
//					        afterRowRender : function(rowIndex,data,tr){
//					          tr.attr("instanceId",data.tenantId);
//					          tr.attr("instanceName",data.UserName);
//					          if(firsttrchecked){
//					        	  tr.attr("checked","checked");
////					        	  $(this).attr("checked");
//					        	  firsttrchecked=false;
//					          }
//					          var flag1=false;
//					          var thistrId=null;
//					          var selectdVal=null;
//					          var inputVal=null;
//					          var configflag=true;
//					          
//					          tr.find("input[type='checkbox']").click(function(){
//						        	 thistrId=$(this).attr("value");
//						        	 selectdVal=$(this).attr("checked");
//						          });
//					          tr.unbind("click").click(function(){
//					        	  var dataList=desktopmanage.accIdList;
//					        	  var keyPostion=null;
//					        	  inputVal=$(this).find("input[type='text']").val();
//					        	  var checkboxVal=$(this).find("input[type='checkbox']").attr("value");
//					        	 
//					        	  //var data={"id":thistrId,"name":$(this).find("input[type='text']").val()};
//					        	  var data={"id":thistrId};
////					        	  var dataFlag=true;
////						    		if(dataList.length>0){
////						    			$.each(dataList,function(key,value){
////						    				if(value.id==thistrId){
////						    					dataFlag=false;
////						    					value.name=$(this).find("input[type='text']").val();
////						    				}
////						    			});
////						    			
////						    		}else{
////						    			dataFlag=false;
////						    			dataList.push(data);
////						    		}
////						    		if(dataFlag){
////						    			dataList.push(data);
////						    		}
//					        	  
//					        	  
//					        	  
//					        	  
//					        	  
//					        	  if(dataList.length>0){
//					        		  $.each(dataList,function(key,value){
//						        		  if(value.id==thistrId){
//						        			  keyPostion=key;
//						        		  }
//						        		  
//						        	  });
//					        	  }
//					        	 
//					        	  if(selectdVal=="checked"){
//					        		  if(null==keyPostion){
//					        			  desktopmanage.clickflag=true;
//					        			  $("#selectQuotaFalg").empty()
//					        			  dataList.push(data);
//					        		  }
//					        		 
//					        	  }else{
//					        		  var temp=null;
//					        		  var index = $.inArray(data,dataList);
//					        		  if(null!=keyPostion){
//					        			  dataList.splice(keyPostion,1); 
//					        		  }
//					        	  }
////					        	 
////					        	  var arrays=desktopmanage.arraySplice(dataList,data,"id",thistrId,selectdVal);
////					        	 
//					        	  $("#orderNumber").val(dataList.length);
//					        	  
//					        	  $("#_orderNumber").html(dataList.length);
////					        	  desktopmanage.getFeeParams={};
////					        	  desktopmanage.getFeeParams.count=dataList.length;
//					        	  desktopmanage.selecedUserNumber=dataList.length;
////					        	  var diskParams={"muProperty":"diskSize","muPropertyValue":ui.value.toString(),"productId":1019};
////						    		queryFeeParams.productPropertyList.push(diskParams);
////						    		queryFeeParams.count=dataList.length;
////						    		desktopmanage.getFeeParams=queryFeeParams;
//						    		if(!CommonEnum.offLineBill){
//						    			  setTimeout('desktopmanage.getFee()',5);
//						    		  }
//					        	  
//					        	  
//					        	  desktopParamsAll.count=dataList.length;
//					          });
//					        
//					        },
//					        afterTableRender : desktopmanage._afterDtTableRender
//					      });
//	        		}
	        	},function(data){
	        		
	        		
	        	});
			  
		  },
		  refreshData:function(){
				if(desktopmanage.dtTable) desktopmanage.dtTable.container.find("tbody").html("<tr ><td colspan='9' style='text-align:center;'><img src='"+CONTEXT_PATH+"/images/loader.gif'/><strong>"+Dict.val("common_retrieving_data_please_wait")+"</strong></td></tr>");
/*
				com.skyform.service.desktopCloudService.test(function(data){
					  
					 
					 data=[
					          {
					            "id": "70738881",
					            "serviceName": " chenjian_desktop ",
					            "serviceAccount": "chenjian",
					            "userName": "陈健",
					            "status": "running",
					            "ip": "192.168.1.4",
					            "createTime": 1451040485000,
					            "expireDate": 1453718885000,
					            "osId": 123,
					            "desc": "windows桌面 简体中文繁体版",
					            "cpu": "2",
					            "memory": "2",
					            "publicIp":"120.10.23.121",
					            "BAND_WHITH":"10",
					            "storageSize":"20"
					          },
					          {
						            "id": "70738882",
						            "serviceName": " chenjian_desktop ",
						            "serviceAccount": "chenjian",
						            "userName": "陈健",
						            "status": "closed",
						            "ip": "192.168.1.4",
						            "createTime": 1451040485000,
						            "expireDate": 1453718885000,
						            "osId": 124,
						            "desc": "windows桌面 简体中文标准版",
						            "cpu": "2",
						            "memory": "2",
						            "publicIp":"120.10.23.121",
						            "BAND_WHITH":"10",
						            "storageSize":"20"
						          },
						          {
							            "id": "70738883",
							            "serviceName": " chenjian_desktop ",
							            "serviceAccount": "chenjian",
							            "userName": "陈健",
							            "status": "opening",
							            "ip": "192.168.1.4",
							            "createTime": 1451040485000,
							            "expireDate": 1453718885000,
							            "osId": 125,
							            "desc": "windows桌面 简体中文标准版",
							            "cpu": "2",
							            "memory": "2",
							            "publicIp":"120.10.23.121",
							            "BAND_WHITH":"10",
							            "storageSize":"20"
							          }
					        ];

					
					
					  desktopmanage._refreshDataTable(data);
					  desktopmanage.onInstanceSelected();
				  },function(msg){
					  $.growlUI("错误：" + msg);
				  });
				*/   
				//alert('a');
				
				
				com.skyform.service.desktopCloudService.queryCloudTab(function(data){
					
					
					  desktopmanage._refreshDataTable(data);
					  desktopmanage.onInstanceSelected();
					  desktopmanage.data=data;
					  if(!desktopmanage.data || desktopmanage.data.length < 1) return;
					  if(desktopmanage.data.length>0){
							desktopmanage.showDetails(desktopmanage.data[0].id);
							};
				  },function(msg){
					  if(!msg){
						  msg=Dict.val("common_unknown_error");
					  }
					  $.growlUI(Dict.val("common_error")+":" + msg);
				  });    
				
				
				  },
				  _refreshDataTable:function(data){
					  if(desktopmanage.dtTable) {
						  
					    	desktopmanage.dtTable.updateData(data);
					    } else {
					    	desktopmanage.dtTable = new com.skyform.component.DataTable();
					    	desktopmanage.dtTable.renderByData("#desktop_manager_instanceTable",{
					    	pageSize : 5,
					        
					        data : data,
					        onColumnRender : function(columnIndex,columnMetaData,columnData){
					         
								  if(columnMetaData.name=="id") {
					              return "<input type='checkbox' value='" + columnData["id"] +"'/>" ;
					          } else if (columnMetaData.name == 'serviceName') {
					        	  return columnData['serviceName'];
					          
					          }
//					          else if (columnMetaData.name == 'serviceFactory') {
//					        	  return columnData['serviceFactory'];
//					        	  
//					          
//					          }
					          else if (columnMetaData.name == 'dliName') {
					        	  return columnData['dliName'];
					        	  
					          
					          } else if(columnMetaData.name == 'serviceAccount'){
					        	  return columnData['serviceAccount'];
					          } else if(columnMetaData.name == 'userName'){
					        	  return columnData['userName'];
					          } 
					          /*else if(columnMetaData.name == 'publicIp'){
					        	  return columnData['publicIp'];
					          }
					          */
					          else if(columnMetaData.name == 'expireDate'){
					        	  try {
										var obj = eval('(' + "{Date: new Date("
												+ columnData.expireDate + ")}"
												+ ')');
										var dateValue = obj["Date"];
										var text = dateValue
												.format('yyyy-MM-dd hh:mm:ss');
									} catch (e) {

									}
					        	  return text;
					          } else if(columnMetaData.name == 'cfgInfo'){
					        	  var osDesc="";
					        	  if(columnData['desc']){
					        		   osDesc=columnData['desc'];
					        	  }
					        	  var text=osDesc+"("+columnData['cpu']+"vcpu "+columnData['memory']+"G "+columnData['storageSize']+"G)";
					        	  return text;
					          
					        }else if(columnMetaData.name == 'status'){
					        	//var newStatus=null;
					        	/*
					        	if(columnData['optStatus']==" "){
					        		desktopmanage.newStatus=columnData['status'];
					        	}else{
					        		desktopmanage.newStatus=columnData['optStatus'];
					        	}
					        	*/
					        	//columnData['optStatus']==" "?newStatus=columnData['status']:newStatus=columnData['optStatus'];
					        	/*
					        	var text=com.skyform.service.StateService.getState("", desktopmanage.newStatus);
				                  return text;  
				                  */
					        	return com.skyform.service.StateService.getState("",columnData['status']);
					          } 
								  
								  
								  
					          else if(columnMetaData.name == 'createTime'){
					        	  try {
										var obj = eval('(' + "{Date: new Date("
												+ columnData.createTime + ")}"
												+ ')');
										var dateValue = obj["Date"];
										var text = dateValue
												.format('yyyy-MM-dd hh:mm:ss');
									} catch (e) {

									}
									return text;
					        	 
					          }
					        },
					        afterRowRender : function(rowIndex,data,tr){
					          tr.attr("instanceId",data.id);
					          tr.attr("instanceState",data.status);
					         
					          tr.attr("instanceDesc",data.desc);
					          tr.attr("instanceTenantId",data.tenantId);
					          tr.find("input[type='checkbox']").click(function(){
					        	  desktopmanage.onInstanceSelected(); 
					          });
					          tr.unbind("click").click(function(){
					        	 var instanceid=$(this).attr("instanceId");
					        	  desktopmanage.showDetails(instanceid); 
					        	  //console.log(instanceid);
					          });  
					        },
					        afterTableRender : desktopmanage._afterDataTableRender
					      });
					      
					    	desktopmanage.dtTable.addToobarButton($("#toolbar4deskTop"));
					    	//desktopCloud.dtTable.enableColumnHideAndShow("right");
					    }
				  },
				  _afterDataTableRender:function(){
                                         
					 
					  //desktopmanage.showDetails(desktopmanage.firstDataId);
					    if(!desktopmanage.contextMenu) {
					    	desktopmanage.contextMenu = new ContextMenu({
					    	container : "#contextMenudeskTop",
					        beforeShow : function(tr){
					        $("#desktop_manager_instanceTable input[type='checkbox']").attr("checked", false);
					          tr.find("input[type='checkbox']").attr("checked",true);
					        },
					        afterShow : function(tr) {
					        	desktopmanage.onInstanceSelected({
					            id : tr.attr("instanceId"),
					            state : tr.attr("instanceState"),
					            osId:tr.attr("instanceOsId"),
					            desc:tr.attr("instanceDesc"),
					            tenantId:tr.attr("instanceTenantId")
					          });
					        },
					        onAction : function(action) {
					        	desktopmanage._invokeAction(action);
					        },
					        trigger : "#desktop_manager_instanceTable tr"
					      });
					    } else {
					    	desktopmanage.contextMenu.reset();
					    }
					    desktopmanage.showDetails();
				  },
				  onInstanceSelected : function(selectInstance){//单选一个触发的操作
					    var allCheckedBox = $("#desktop_manager_instanceTable tbody input[type='checkbox']:checked");
					    var rightClicked = selectInstance?true:false;
					    var state = $(allCheckedBox[0]).parents("tr").attr("instanceState");
					    var tenantId = $(allCheckedBox[0]).parents("tr").attr("instanceTenantId");
					    desktopmanage.selectedTenantId=tenantId;
					    desktopmanage.selectedOsInfo=$(allCheckedBox[0]).parents("tr").attr("instanceDesc");
						if(selectInstance) {
							state = selectInstance.state;
							
						}
					    var oneSelected = allCheckedBox.length == 1;
					    var hasSelected = allCheckedBox.length > 0;
					    $("div[scope='"+desktopmanage.scope+"'] .operation").addClass("disabled");
					    $("div[scope='"+desktopmanage.scope+"'] .operation").each(function(index,operation){
					      var condition = $(operation).attr("condition");
					      var action = $(operation).attr("action");
					      var enabled = true;
					      eval("enabled=("+condition+")");
					      if(enabled) {
					        $(operation).removeClass("disabled");
					      } else {
					        $(operation).addClass("disabled");
					      }
					      desktopmanage._bindAction();
					    });
					    if(rightClicked) {
					    	desktopmanage.selectedInstanceId = selectInstance.id; 
					    	desktopmanage.selectedTenantId = selectInstance.tenantId;
					    } else {
					      for ( var i = 0; i < allCheckedBox.length; i++) {
					        var currentCheckBox = $(allCheckedBox[i]);
					        if (i == 0) {
					        	desktopmanage.selectedInstanceId = currentCheckBox.attr("value");
					        } else {
					        	desktopmanage.selectedInstanceId += "," + currentCheckBox.attr("value");
					        }
					      }
					    }
					  },
					  _bindAction : function(){
							$("div[scope='"+desktopmanage.scope+"'] #toolbar4deskTop .actionBtn").unbind("click").click(function(){
								if($(this).hasClass("disabled")) return;
								var action = $(this).attr("action");
								desktopmanage._invokeAction(action);
							});
					  },
						
					  _invokeAction : function(action){
							var invoker = desktopmanage["" + action];
							if(invoker && typeof invoker == 'function') {
								invoker();
							}
					  },
					  /*
					//开机
					  startup : function(){
							ConfirmWindow.setTitle("开启云桌面").setContent("<h4>确认要开启云桌面吗？</h4>").onSave = function(){
								//var subnetIds = new Array();
								//subnetIds = deskTopwork.selectedInstanceId.split(",");
								var destTopId = desktopmanage.selectedInstanceId;
								 com.skyform.service.desktopCloudService.teststartup(destTopId,function(data){
									 $.growlUI("操作成功!");
										ConfirmWindow.hide();
										desktopmanage.refreshData();
								  },function(error){
									  ErrorMgr.showError(error);
								  });
								ConfirmWindow.hide();
							};
							ConfirmWindow.show();
						  },
						//关机
						  closedown : function(){
								ConfirmWindow.setTitle("关闭云桌面").setContent("<h4>确认要关闭云桌面吗？</h4>").onSave = function(){
									var destTopId = desktopmanage.selectedInstanceId;
									 com.skyform.service.desktopCloudService.testclosedown(destTopId,function(data){
										 $.growlUI("操作成功!");
											ConfirmWindow.hide();
											desktopmanage.refreshData();
									  },function(error){
										  ErrorMgr.showError(error);
									  });
									ConfirmWindow.hide();
								};
								ConfirmWindow.show();
							  },
							  */ 
							//重启
							  restartup : function(){
									ConfirmWindow.setTitle(Dict.val("dc_restart_desktop_cloud")).setContent("<h4>"+Dict.val("dc_do_you_restart_dektop_cloud")+"</h4>").onSave = function(){
										var destTopId = desktopmanage.selectedInstanceId;
										 com.skyform.service.desktopCloudService.restartCloudTab(destTopId,function(data){
											 $.growlUI(Dict.val("common_success_operation"));
												ConfirmWindow.hide();
												desktopmanage.refreshData();
										  },function(error){
											  ErrorMgr.showError(error);
											  
										  });
										ConfirmWindow.hide();
									};
									ConfirmWindow.show();
								  },  
								 //销毁
								  destroydown : function(){
										ConfirmWindow.setTitle(Dict.val("dc_destory_desktop_cloud")).setContent("<h4>"+Dict.val("dc_do_you_destory_desktop_cloud")+"</h4>").onSave = function(){
											var destTopId = desktopmanage.selectedInstanceId;
											 com.skyform.service.desktopCloudService.deleteCloudTab(destTopId,function(data){
												 $.growlUI(Dict.val("common_success_operation"));
													ConfirmWindow.hide();
													desktopmanage.refreshData();
											  },function(error){
												  ErrorMgr.showError(error);
											  });
											ConfirmWindow.hide();
										};
										ConfirmWindow.show();
									  },  
									//重置操作系统
									  /*
									  resetOs : function(){
											ConfirmWindow.setTitle("重置操作系统").setContent("<h4>当前重置操作系统为: "+desktopmanage.selectedOsInfo+"</h4><span style='color:red;font-size:13px;'></span>").onSave = function(){
												var destTopId = desktopmanage.selectedInstanceId;
												 com.skyform.service.desktopCloudService.resetCloudTabForOS(destTopId,function(data){
													 $.growlUI("操作成功!");
														ConfirmWindow.hide();
														desktopmanage.refreshData();
												  },function(error){
													  ErrorMgr.showError(error);
												  });
												ConfirmWindow.hide();
											};
											ConfirmWindow.show();
										  }, 
										  */
										  //重发邀请邮件
							        retransMail:function(){
							        	ConfirmWindow.setTitle(Dict.val("dc_resend_invitation_email")).setContent("<h4>"+Dict.val("dc_do_you_resend_inviation_email")+"</h4>").onSave = function(){
											var destTopId = desktopmanage.selectedTenantId;
											//console.log(destTopId);
											 com.skyform.service.desktopCloudService.resendEmailCloudTab(destTopId,function(data){
												 $.growlUI(Dict.val("common_success_operation"));
													ConfirmWindow.hide();
													desktopmanage.refreshData();
											  },function(error){
												  ErrorMgr.showError(error);
											  });
											ConfirmWindow.hide();
										};
										ConfirmWindow.show();
							        },
							    	renew : function(){
							    		
							    		if(desktopmanage.renewModal){
							    			
							    		}else{
							    			
							    			desktopmanage.renewModal = new com.skyform.component.Renew(desktopmanage.selectedInstanceId,{
							    				buttons : [
							    							{
							    								name : Dict.val("common_determine"),
							    								onClick : function(){
							    									var period = desktopmanage.renewModal.getPeriod().getValue();
							    									$("#renewModal").modal("hide");	
							    									var _modal = $("#renewModal");
							    									//com.skyform.service.renewService.renew(desktopmanage.selectedInstanceId,period,function onSuccess(data){
							    									com.skyform.service.desktopCloudService.deskRenew(desktopmanage.selectedInstanceId,period,function onSuccess(data){
							    										
							    										//订单提交成功后校验用户余额是否不足
							    										var _tradeId = data.tradeId;
							    										var _fee = $("#feeInput_renew").text();
							    										com.skyform.service.desktopCloudService.deskConfirmTradeSubmit(_fee,_tradeId,_modal,function onSuccess(data){
							    											$.growlUI(Dict.val("common_tip"), Dict.val("dc_renew_submit_success")); 
							    											// refresh
							    											desktopmanage.refreshData();									
							    										},function onError(msg){
							    											$.growlUI(Dict.val("common_tip"), Dict.val("dc_renew_failed"));
							    										});		
							    										
							    										//$.growlUI(Dict.val("common_tip"), "续订申请成功");
							    									},function onError(msg){
							    										$.growlUI(Dict.val("common_tip"), Dict.val("dc_renew_application_failed") + msg); 
							    									});				
							    								},
							    								/*
							    								afterShow : function(container){
							    									
							    									desktopmanage.renewModal.getPeriod().setValue(1);
							    								},
							    								*/
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
							    									desktopmanage.renewModal.hide();
							    								}
							    							}
							    						]
							    					});
							    			}
							    			//desktopmanage.renewModal.getFee_renew(desktopmanage.selectedInstanceId);
							    		    desktopmanage.renewModal.hhht_getFee_renew(desktopmanage.selectedInstanceId);
							    			desktopmanage.renewModal.show();		
							    			$(".subFee_renew").bind('mouseup keyup',function(){
							    				setTimeout('desktopmanage.renewModal.hhht_getFee_renew('+desktopmanage.selectedInstanceId+')',100);
							    			});
							    	},
							    	 newInstance : function(){
							    		 $("#_image").empty();
							    		 $("#_areaNameVal").empty();
							    		 $("#_configInfo").empty();
							    		 $("#_dataSize").empty();
							    		 $("#_orderNumber").empty();
							    		 $("#orderTimeUnitLong").empty();
							    		 $("#selectQuotaFalg").empty();
							    		 
							    		 $("#_orderTime").empty().html("1");
							    		 if(desktopmanage.data4==""){
							    			 $.growlUI(Dict.val("common_tip"), Dict.val("dc_no_desktop_user_information_unbound"));
							    			 return;
							    		 }
							    		var currdesktopResPool=null;
										var billTypeVal=0;
										var queryFeeParams=new Object();
										queryFeeParams.period=1;
										//queryFeeParams.productPropertyList=new Array();
										//
										queryFeeParams.verifyFlag="0";
										queryFeeParams.productPropertyList=[];
										//queryFeeParams.productPropertyList.length=0;
										
										
										
//										var queryFeeParams={
//												"period":1,
//												"productPropertyList":[],
//												"verifyFlag":"0"
////												"count":1
//										}
										var productDetailParams={
												"muProperty":"",
												"muPropertyValue":"1",
												
										}
//										{"period":1,"productPropertyList":[{"muProperty":"cpuNum","muPropertyValue":"1","productId":101},{"muProperty"
//											:"memorySize","muPropertyValue":"4","productId":101},{"muProperty":"OS","muPropertyValue":"1","productId"
//											:101}],"verifyFlag":"0"}
										var desktopParamsAll=new Object();
										desktopParamsAll.period=1;
										desktopParamsAll.count=0;
										desktopParamsAll.productList=[];
										/*
										var desktopParamsAll={
												"period":"1",
											"count":0,
//												"resPool":"",
												"productList":[],
											};
										*/
//										var desktopParams={
//													"productId": 0,
//													"osDisk": "",
//													"OS": "",
//													"cpuNum": "",
//													"memorySize": "",
//													"dataDisk": 0,
//													"BAND_WIDTH": 0,
//													"CloudTabUsers": []
//									               	
//										};
										var desktopParams=new Object();
										
										//desktopParams.productId=1025;
										desktopParams.resPool="";
										desktopParams.osDisk="";
										desktopParams.OS="";
										desktopParams.cpuNum="";
										desktopParams.memorySize="";
										desktopParams.storageSize="150";
										//desktopParams.BAND_WIDTH="0";
										desktopParams.CloudTabUsers=[];
										var m = 0;
										
										//$('#createDataDiskSize').val('1');
											if(!desktopmanage.newFormModal){
											      desktopmanage.newFormModal = new com.skyform.component.Modal("newDesktopCloudForm2","<h3>"+Dict.val("dc_create_cloud_desktop")+"</h3>",
											      $("script#new_desktopCloud_form2").html(),{
											        buttons : [
											                   {name:Dict.val("common_determine"),
															       onClick:function(){
															    	   desktopParams.CloudTabUsers=desktopmanage.accIdList;
															    	   if(Number($("#orderTimeLong").val())==0){
																			  $("#orderTimeUnitLong").empty().html(Dict.val("dc_please_enter_purchase_long"));
//																			  $.growlUI(Dict.val("common_tip"), "你还没有选中桌面用户");
																			  return;
																		  }
//															    	   console.log(typeof($("#orderTimeLong").val()))
															    	   if(Number($("#orderTimeLong").val())<=12&&Number($("#orderTimeLong").val())>=0){
															    	   }else{
															    		   return;
															    	   }
																		  if(Number($("#orderNumber").val())==0){
//																			  $("#selectQuotaFalg").empty().html(Dict.val("dc_not_selected_desktop_users"));
																			  $("#selectQuotaFalg").empty().html("请选择用户");
//																			  $.growlUI(Dict.val("common_tip"), "你还没有选中桌面用户");
																			  return;
																		  }
																		  desktopParamsAll.productList.length=0;
																		  
																		  desktopParams.storageSize=$("#_dataSize").text();
//																		  console.log(desktopParams);
//																		  console.log($("#_dataSize").text());
															    	   desktopParamsAll.productList.push(desktopParams);
															    	   //desktopParamsAll.productList=desktopParams;
															    	   
															         desktopmanage._save(desktopParamsAll);
															       },
											                   attrs:[{name:'class',value:'btn btn-primary'}]},
											                   {name:Dict.val("common_cancel"),
											                   onClick:function(){
											                     desktopmanage.newFormModal.hide();
											                   },
											                   attrs:[{name:'class',value:'btn'}]}
											                   ],
											        beforeShow : function(container){
											        	 desktopmanage.accIdList=[];
											        	var portalType=Dcp.biz.getCurrentPortalType();
//											        	CommonEnum.offLineBill
//											        	if(portalType=="public"){
//											        		$("#billType").html('<a class="div_block active ty" href="javascript:;" name="billType1" value="0">包月</a>'
//											        				+'<a class="div_block ty" href="javascript:;" name="billType1" value="3">包年</a>');
//											        	}else{
//											        		$("#billType").html('<a class="div_block ty" href="javascript:;" name="billType1" value="5">VIP</a>');
//											        	}
											        	if(!CommonEnum.offLineBill){
											        		
//											        		
											        		$("#billType").html('<a class="div_block subFee active ty" href="javascript:;" name="billType1" value="0">'+Dict.val("common_monthly")+'</a>'
											        				+'<a class="div_block subFee ty" href="javascript:;" name="billType1" value="3">'+Dict.val("common_monthly")+'</a>');
											        	}else{
											        		$("#configFeeDiv").remove();
											        		$("#billType").html('<a class="div_block active ty" href="javascript:;" name="billType1" value="5">VIP</a>');
											        		
											        		
											        	}
													    $("#areaNameId").html("");
													    $("#_ostemplates").html("");
													   
													    
													    
													    com.skyform.service.desktopCloudService.queryDesktopConfigInfo(desktopmanage.typeParams,function(data){
													    	desktopmanage.createDesktopCloudData=data;
												    	desktopParams.productId=parseInt(data.resoucepool[0].productId);
													    	//desktopParams.productId=1025;
													    	var html="";
													    	var flag=true;
													    	$.each(data.resoucepool,function(key,value){
													    			if(flag){
													    				currdesktopResPool=value.name;
														                        desktopParams.resPool=currdesktopResPool;
													    				$("#_areaNameVal").html(value.desc);
//													    				desktopParamsAll.resoucePool=value.name;
													    				flag=false;
													    			}
													    			html+="<option value="+value.name+",name="+value.desc+' productId='+value.productId +' serviceFactroy='+value.serviceFactroy+">"+value.desc+"</option><br\>";
													    	});
													    	$("#areaNameId").append(html);
													    	var servicefactroy=$('#areaNameId option:selected').attr("servicefactroy");
											    			//查询用户信息
											    			var params2={
											    					"serviceFactory":servicefactroy
											    			};
											    			desktopmanage.getTenantInfoByArea(params2);
													    	var oshtml="";
													    	var flagos=true;
													    	$.each(data.oslist,function(key,value){
													    		$.each(value.resourcePool,function(osresPoolkey,osresPoolVal){
													    			if(osresPoolVal.name==currdesktopResPool){
													    				if(flagos){
													    					$("#_image").html(value.desc);
													    					$("#osDiskSize").html(value.osDisk);
													    					desktopParams.osDisk=value.osDisk;
																		desktopParams.OS=value.OS;
													    					flagos=false;
													    				}
													    				oshtml+="<option value='"+value.OS+"' name='"+value.desc+"' osDisk='"+value.osDisk+"'>"+value.desc+"</option><br\>";
													    			}
													    		});
													    	});
													    	$("#_ostemplates").append(oshtml);
													    	$("#config").html("");
													    	$("#os_config").html("");
													    	var confightml="";
													    	var currVal=null;
													    	var currmemoryVal=null;
													    	var cpuVal=null;
													    	var memoryVal=null;
													    	var desc=null;
													    	var isCurrResPoolFlag=false;
													    	 var configflag=true;
													    	$.each(data.vmConfig,function(key,value){
													    		$.each(value.config,function(key1,value1){
												    				$.each(value1.memory,function(key2,value2){
												    					$.each(value2.resourcePool,function(key3,value3){
												    						if(currdesktopResPool==value3.name){
												    							isCurrResPoolFlag=true;
												    						}
												    					});
												    				});
													    		});
													    		if(isCurrResPoolFlag){
													    			var osConfigHtml="";
														    		if($("#os_config").html()==""){
														    			
														    			currVal=value.type;
														    			$.each(value.config,function(key1,value1){
															    			desc=value1.desc;
															    			cpuVal=value1.cpuNum;
															    			$.each(value1.memory,function(key2,value2){
															    				if(key2==0){
															    					memoryVal=value2.memorySize;
															    					currmemoryVal=value2.memorySize+Dict.val("dc_g_ram");
															    					osConfigHtml+="<div class='ty active subFee div_block' value='base' memorySize='"+value2.memorySize+"'>"+value1.desc+" "+value2.memorySize+Dict.val("dc_g_ram")+"</div>"
															    					}else{
															    						osConfigHtml+="<div class='ty  subFee div_block' value='base' memorySize='"+value2.memorySize+"'>"+value1.desc+" "+value2.memorySize+Dict.val("dc_g_ram")+"</div>"
															    					}
															    			});
															    			if(key1==0){
															    				$("#os_config").append(osConfigHtml);
															    			}else{
															    				$("#os_config").append("<div class='ty  subFee div_block' value='base' >"+value1.desc+" "+value1.cpuNum+"</div>");
															    			}
															    		});
														    			confightml+="<div class='ty active subFee div_block' value='base' name='configval'>"+value.type+"</div>";
														    		}else{
														    			confightml+="<div class='ty  subFee div_block' value='base' name='configval'>"+value.type+"</div>";
														    		}
																desktopParams.cpuNum=cpuVal;
															    	desktopParams.memorySize=memoryVal;
													    			isCurrResPoolFlag=false;
													    		}
													    	}); 								    	
													    	$("#config").append(confightml);
													    	$("#_configInfo").html(currVal+" "+desc+" "+currmemoryVal);
													    	if(configflag){
													    		queryFeeParams.productPropertyList.length=0;
												    			var cpuParams={"muProperty":"cpuNum","muPropertyValue":cpuVal,"productId":desktopParams.productId};
													    		queryFeeParams.productPropertyList.push(cpuParams);
													    		var memoryParams={"muProperty":"memorySize","muPropertyValue":memoryVal,"productId":desktopParams.productId};
													    		queryFeeParams.productPropertyList.push(memoryParams);
													    		
												    			configflag=false;
												    		}
//													    	
												    		desktopmanage.getFeeParams=queryFeeParams;
													    },function(data){});
											          $("#tip_ipSegments").empty();
											          desktopmanage.isGateWay = null;
											          if(!desktopmanage.newFormModal.countField) {
											            desktopmanage.newFormModal.countField = new com.skyform.component.RangeInputField("#newPrivateNetForm #privateNetCount",{
											              defaultValue : 1,
											              min : 1,
											              max : 5, 
											              textClass : 'text-large'
											            }).render();
											          }
											          desktopmanage.newFormModal.countField.reset();
											          com.skyform.component.utils.restrainInputFieldToMatchIntNumber("#privatenet_instance_count");
											          $("#orderNumber").val("0");
											          if(!CommonEnum.offLineBill){
										    			  setTimeout('desktopmanage.getFee()',5);
										    		  }
											        },
											      afterShow : function(){
											    	  $(".func-table tr").on('mouseover',function(){
															
															$(this).find("td:eq(0)").css({"background":"#bbb none repeat scroll 0 0","color":"black"});
														});
														$(".func-table tr").on('mouseout',function(){
															
															$(this).find("td:eq(0)").css({"background":"#f2f2f2 none repeat scroll 0 0","color":"#CACACA"});
														});
														
														
											    	  $(".price").html('0');
											    	  $("#orderTimeLong").val('1');
											    	  $("#createDataDiskSize").val('150');
											    	  $("#_dataSize").html('150');
											    	  $("#dataDisk-range-min").val('150');
											    	  desktopParams.storageSize="150";
											    	  var firsttrchecked=true;
											    	  //com.skyform.service.desktopCloudService.queryUserInfo(function(data){
											    	  /*
											    		  com.skyform.service.desktopCloudService.unListTenant(function(data){  
											    			 
											        		desktopmanage.data2=data;
											        	},function(data){});*/
											    	  var p =/^[1-9](\d+(\.\d{1,2})?)?$/; 
											    	 
											    	  $("#orderTimeLong").bind("keyup",function(){
											    		  $("#orderTimeUnitLong").empty();
											    		  var tt=$("#orderTimeLong").val().trim();
											    		  		if(p.test(tt)){
											    		  			$("#orderTimeUnitLong").empty();
											    		  			if(parseInt(tt)>0&&parseInt(tt)<=12){
											    		  				$("#orderTimeUnitLong").empty();
											    		  			}else{
											    		  				$("#orderTimeUnitLong").empty().html("请输入1到12的整数");
											    		  				return;
											    		  			}
											    		  		}else{
											    		  			$("#orderTimeUnitLong").empty().html("请输入数字");
											    		  		}
											    			 
											    			
											    		  if(billTypeVal=="0"||billTypeVal=="5"){
											    			  billTypeVal=1;
											    		  }else if(billTypeVal=="3"){
											    			  billTypeVal=12;
											    		  }
//											    		  $("#orderTimeUnitLong").empty();
											    		  $("#_orderTime").html($("#orderTimeLong").val());
											    		  desktopParamsAll.period=(parseInt($("#orderTimeLong").val())*billTypeVal);
											    		  desktopmanage.getFeeParams={};
											        	  desktopmanage.getFeeParams.period=parseInt($("#orderTimeLong").val())*billTypeVal;
											        	  queryFeeParams.period=parseInt($("#orderTimeLong").val())*billTypeVal;
//											        	  var orderTimeLong={"muProperty":"diskSize","muPropertyValue":parseInt($("#orderTimeLong").val())*billTypeVal,"productId":1019};
//												    		queryFeeParams.productPropertyList.push(orderTimeLong);
												    		desktopmanage.getFeeParams=queryFeeParams;
											    	  });
													    if(desktopmanage.dtTable2) {
													    	
													      desktopmanage.dtTable2.updateData(desktopmanage.data2);
													    } else {
													    	
													      desktopmanage.dtTable2 = new com.skyform.component.DataTable();
													      
													      desktopmanage.dtTable2.renderByData("#private_desktop_user_instanceTable1",{
													    	pageSize : 5,
													        data : desktopmanage.data2,
													        onColumnRender : function(columnIndex,columnMetaData,columnData){
													        	
													          if(columnMetaData.name=='ID') {
																  return columnData.tenantId;
															  } else if(columnMetaData.name=="id") {
																  if(firsttrchecked){
																	  return "<input type='checkbox' checked='checked' value='" + columnData["tenantId"] +"'/>" ;
														        	  firsttrchecked=false;
														          }
													              return "<input type='checkbox' checked='false' value='" + columnData["tenantId"] +"'/>" ;
													          }  
													          /*
															  else if(columnMetaData.name=="deskName") {
													              return "<input type='text'  value='" + columnData["vmName"] +"'/>" ;
													          } 
													          */
															  else {
													        	  return columnData[columnMetaData.name];
													          }
													        },
													        afterRowRender : function(rowIndex,data,tr){
													          tr.attr("instanceId",data.tenantId);
													          tr.attr("instanceName",data.UserName);
													          if(firsttrchecked){
													        	  tr.attr("checked","checked");
//													        	  $(this).attr("checked");
													        	  firsttrchecked=false;
													          }
													          var flag1=false;
													          var thistrId=null;
													          var selectdVal=null;
													          var inputVal=null;
													          var configflag=true;
													          
													          tr.find("input[type='checkbox']").click(function(){
														        	 thistrId=$(this).attr("value");
														        	 selectdVal=$(this).attr("checked");
														          });
													          tr.unbind("click").click(function(){
													        	  var dataList=desktopmanage.accIdList;
													        	  var keyPostion=null;
													        	  inputVal=$(this).find("input[type='text']").val();
													        	  var checkboxVal=$(this).find("input[type='checkbox']").attr("value");
													        	 
													        	  //var data={"id":thistrId,"name":$(this).find("input[type='text']").val()};
													        	  var data={"id":thistrId};
//													        	  var dataFlag=true;
//														    		if(dataList.length>0){
//														    			$.each(dataList,function(key,value){
//														    				if(value.id==thistrId){
//														    					dataFlag=false;
//														    					value.name=$(this).find("input[type='text']").val();
//														    				}
//														    			});
//														    			
//														    		}else{
//														    			dataFlag=false;
//														    			dataList.push(data);
//														    		}
//														    		if(dataFlag){
//														    			dataList.push(data);
//														    		}
													        	  
													        	  
													        	  
													        	  
													        	  
													        	  if(dataList.length>0){
													        		  $.each(dataList,function(key,value){
														        		  if(value.id==thistrId){
														        			  keyPostion=key;
														        		  }
														        		  
														        	  });
													        	  }
													        	 
													        	  if(selectdVal=="checked"){
													        		  if(null==keyPostion){
													        			  desktopmanage.clickflag=true;
													        			  $("#selectQuotaFalg").empty()
													        			  dataList.push(data);
													        		  }
													        		 
													        	  }else{
													        		  var temp=null;
													        		  var index = $.inArray(data,dataList);
													        		  if(null!=keyPostion){
													        			  dataList.splice(keyPostion,1); 
													        		  }
													        	  }
//													        	 
//													        	  var arrays=desktopmanage.arraySplice(dataList,data,"id",thistrId,selectdVal);
//													        	 
													        	  $("#orderNumber").val(dataList.length);
													        	  
													        	  $("#_orderNumber").html(dataList.length);
//													        	  desktopmanage.getFeeParams={};
//													        	  desktopmanage.getFeeParams.count=dataList.length;
													        	  desktopmanage.selecedUserNumber=dataList.length;
//													        	  var diskParams={"muProperty":"diskSize","muPropertyValue":ui.value.toString(),"productId":1019};
//														    		queryFeeParams.productPropertyList.push(diskParams);
//														    		queryFeeParams.count=dataList.length;
														    		desktopmanage.getFeeParams=queryFeeParams;
														    		if(!CommonEnum.offLineBill){
														    			  setTimeout('desktopmanage.getFee()',5);
														    		  }
													        	  
													        	  
													        	  desktopParamsAll.count=dataList.length;
													          });
													        
													        },
													        afterTableRender : desktopmanage._afterDtTableRender
													      });
													    }
											    	  $("div[name='configval']").unbind("click").bind("click",function(){
											    		  $("div[name='configval']").removeClass("active");
												    		$(this).addClass("active");
												    		var currVal=$(this).html();
												    		var desc=null;
												    		var osConfigHtml1="";
												    		var currmemoryVal1=null;
												    		var currObj=null;
												    		var datas=desktopmanage.createDesktopCloudData.vmConfig;
												    		var deskmemorySize=null;
												    		var cpuNumVal=null;
												    		$.each(datas,function(key,value){
												    			if(currVal==value.type){
												    				$.each(value.config,function(key1,value1){
												    					$("#os_config").html("");
														    			desc=value1.desc;
														    			cpuNumVal=value1.cpuNum;
														    			desktopParams.cpuNum=value1.cpuNum;
														    			$.each(value1.memory,function(key2,value2){
														    				if(key2==0){
														    					currmemoryVal1=value2.memorySize+Dict.val("dc_g_ram");
														    					desktopParams.memorySize=value2.memorySize;
														    					deskmemorySize=value2.memorySize;
														    					osConfigHtml1+="<div class='ty active subFee div_block' value='base' memorySize='"+value2.memorySize+"'>"+value1.desc+" "+value2.memorySize+Dict.val("dc_g_ram")+"</div>"
														    					}else{
														    						osConfigHtml1+="<div class='ty  subFee div_block' value='base' memorySize='"+value2.memorySize+"'>"+value1.desc+" "+value2.memorySize+Dict.val("dc_g_ram")+"</div>"
														    					}
														    			});
														    			if(key1==0){
														    				$("#os_config").append(osConfigHtml1);
														    			}else{
														    				$("#os_config").append("<div class='ty  subFee div_block' value='base' >"+value1.desc+"</div>");
														    			}
														    			
														    		});
												    			}
												    		});
												    		$("#_configInfo").html(currVal+" "+desc+" "+currmemoryVal1);
												    		var keyOpt=-1;
												    		
												    		var cpuParams={"muProperty":"cpuNum","muPropertyValue":cpuNumVal,"productId":desktopParams.productId};
												    		var cpuFlag=true;
												    		if(queryFeeParams.productPropertyList.length>0){
												    			
												    			$.each(queryFeeParams.productPropertyList,function(key,value){
												    				if(value.muProperty=="cpuNum"){
												    					
												    					cpuFlag=false;
												    					value.muPropertyValue=cpuNumVal;
												    				}
												    			});
												    			
												    		}else{
												    			
												    			cpuFlag=false;
												    			queryFeeParams.productPropertyList.push(cpuParams);
												    		}
												    		if(cpuFlag){
												    			
												    			//cpuFlag=false;
												    			queryFeeParams.productPropertyList.push(cpuParams);
												    		}
												    		
												    		
//												    		if(queryFeeParams.productPropertyList.length>0){
//												    			
//												    			$.each(queryFeeParams.productPropertyList,function(key,values){
//												    				
//												    				currObj=values;
//													    			if(currObj.muProperty=="cpuNum"){
//													    				keyOpt=key;
//													    				
//													    			}
//													    		});
//												    			
//												    		}
//												    		if(keyOpt>=0){
//												    			queryFeeParams.productPropertyList.splice(keyOpt,1,cpuParams); 
//												    		}
												    		
//												    		queryFeeParams.productPropertyList.push(cpuParams);
												    		var memoryParams={"muProperty":"memorySize","muPropertyValue":deskmemorySize,"productId":desktopParams.productId};
												    		var flagVal=true;
												    		if(queryFeeParams.productPropertyList.length>0){
												    			$.each(queryFeeParams.productPropertyList,function(key,value){
												    				if(value.muProperty=="memorySize"){
												    					flagVal=false;
												    					value.muPropertyValue=deskmemorySize;
												    				}
												    			});
												    			
												    		}else{
												    			flagVal=false;
												    			queryFeeParams.productPropertyList.push(memoryParams);
												    		}
												    		if(flagVal){
												    			queryFeeParams.productPropertyList.push(memoryParams);
												    		}
												    		
												    		
												    		
//												    		if(queryFeeParams.productPropertyList.length>0){
//												    			$.each(queryFeeParams.productPropertyList,function(key,value33){
////												    				currObj=value33;
//													    			if(value33.muProperty=="memorySize"){
//													    				keyOpt=key;
//													    			}
//													    		});
//												    			
//												    		}
//												    		if(keyOpt>=0){
//												    			queryFeeParams.productPropertyList.splice(keyOpt,1,memoryParams);
//												    		}
												    		 
//												    		queryFeeParams.productPropertyList.push(memoryParams);
												    		
												    		
											    	  });
//											    	  $("a[name='billType1']").bind("mouseover",function(){
//											    		  $("a[name='billType1']").removeClass("active");
//												    		$(this).addClass("active");
//											    	  });
											    	  $("a[name='billType1']").bind(" click ",function(){
											    		$("a[name='billType1']").removeClass("active");
											    		$(this).addClass("active");
											    		billTypeVal=$(this).attr("value");
											    		var unit="";
											    		if($(this).attr("value")==0||$(this).attr("value")==5){
											    			queryFeeParams.period=1
											    			unit=Dict.val("common_month");
											    		}else if($(this).attr("value")==3){
											    			queryFeeParams.period=12
											    			unit=Dict.val("common_year");
											    		}
											    		billTypeVal=$(this).attr("value");
											    		$("#_orderTimeUnit").html(unit);
											    		$("#orderTimeUnit1").html(unit);
											    		
											    	  });
											    	  $("#_ostemplates").bind("change",function(){
											    		  var option = ($(this).find("option[value='"+$(this).val()+"']"));											    		  
											    		  $("#_image").empty().html(option.attr("name"));
											    		  $("#osDiskSize").empty().html(option.attr("osDisk"));
											    		  desktopParams.osDisk=option.attr("osDisk");
											    		  desktopParams.OS=option.val();
											    		  var dataList=queryFeeParams.productPropertyList;
											        	  var keyPostion=null;
											        	  var data={"muProperty":"OS","muPropertyValue":"11","productId":desktopParams.productId};
//											        	  var data={"id":thistrId,"name":$(this).find("input[type='text']").val()};
											        	  if(dataList.length>0){
											        		  $.each(dataList,function(key,value){
												        		  if(value.muProperty=="OS"){
												        			  keyPostion=key;
												        		  }
												        		  
												        	  });
											        	  }
											        	  if(null==keyPostion){
										        			  dataList.push(data);
										        		  }else{
										        			  var index = $.inArray(data,dataList);
											        		  if(null!=keyPostion){
											        			  dataList.splice(keyPostion,1); 
											        		  }
										        		  }
											       		desktopmanage.getFeeParams=queryFeeParams;
											    		  
											    		 
//												    		queryFeeParams.productPropertyList.push(osParams);
												   
											    	  });
											    	  $("#areaNameId").bind("change",function(){
											    		  $("#_ostemplates").html("");
											    			$("#_areaNameVal").html($(this).val().split("=")[1]);
											    			currdesktopResPool=$(this).val().split(",")[0];
											    			var productid=$('#areaNameId option:selected').attr("productid");
											    			desktopParams.productId=parseInt(productid);
											    			var servicefactroy=$('#areaNameId option:selected').attr("servicefactroy");
											    			//查询用户信息
											    			var params2={
											    					"serviceFactory":servicefactroy
											    			};
//											    			desktopmanage.getTenantInfo();
											    			
//											    			  com.skyform.service.desktopCloudService.unListTenant(params2,function(data){  
//											  	        		desktopmanage.data2=data;
//											  	        		if(desktopmanage.dtTable2) {
//																      desktopmanage.dtTable2.updateData(desktopmanage.data2);
//																    }
//											  	        		
//											  	        	},function(data){
//											  	        		
//											  	        		
//											  	        	});
											    			
											    			desktopmanage.getTenantInfoByArea(params2);
//											    			if(desktopmanage.dtTable2) {
//															      desktopmanage.dtTable2.updateData(desktopmanage.data3);
//															    }
											    			var oshtml="";
													    	var flagos=true;
													    	desktopParams.resPool=currdesktopResPool;
													    	$.each(desktopmanage.createDesktopCloudData.oslist,function(key,value){
													    		$.each(value.resourcePool,function(osresPoolkey,osresPoolVal){
													    			if(osresPoolVal.name==currdesktopResPool){
													    				
													    				if(flagos){
													    					$("#_image").html(value.desc);
													    					$("#osDiskSize").html(value.osDisk);
													    					desktopParams.osDisk=value.osDisk;
													    					flagos=false;
													    				}
													    				oshtml+="<option value='"+value.OS+"' name='"+value.desc+"' osDisk='"+value.osDisk+"'>"+value.desc+"</option><br\>";
													    																    			}
													    		});
													    	});
													    	$("#_ostemplates").append(oshtml);
													    	$("#config").html("");
													    	$("#os_config").html("");
													    	var confightml="";
													    	var currVal=null;
													    	var currmemoryVal=null;
													    	var desc=null;
													    	var isCurrResPoolFlag=false;
													    	$.each(desktopmanage.createDesktopCloudData.vmConfig,function(key,value){
													    		$.each(value.config,function(key1,value1){
												    				$.each(value1.memory,function(key2,value2){
												    					$.each(value2.resourcePool,function(key3,value3){
												    						if(currdesktopResPool==value3.name){
												    							isCurrResPoolFlag=true;
												    						}
												    					});
												    				});
													    		});
													    		if(isCurrResPoolFlag){
													    			var osConfigHtml="";
														    		if($("#os_config").html()==""){
														    			currVal=value.type;
														    			
														    			$.each(value.config,function(key1,value1){
															    			desc=value1.desc;
															    			$.each(value1.memory,function(key2,value2){
															    				if(key2==0){
															    					currmemoryVal=value2.memorySize+Dict.val("dc_g_ram");
															    					osConfigHtml+="<div class='ty active subFee div_block' value='base' memorySize='"+value2.memorySize+"'>"+value1.desc+" "+value2.memorySize+Dict.val("dc_g_ram")+"</div>"
															    					}else{
															    						osConfigHtml+="<div class='ty  subFee div_block' value='base' memorySize='"+value2.memorySize+"'>"+value1.desc+" "+value2.memorySize+Dict.val("dc_g_ram")+"</div>"
															    					}
															    			});
															    			if(key1==0){
															    				$("#os_config").append(osConfigHtml);
															    			}else{
															    				$("#os_config").append("<div class='ty  subFee div_block' value='base' >"+value1.desc+" "+value1.cpuNum+"</div>");
															    			}
															    		});
														    			confightml+="<div class='ty active subFee div_block' value='base' name='configval'>"+value.type+"</div>";
														    		}else{
														    			confightml+="<div class='ty  subFee div_block' value='base' name='configval'>"+value.type+"</div>";
														    		}
													    			isCurrResPoolFlag=false;
													    		}
													    	}); 								    	
													    	$("#config").append(confightml);
													    	$("#_configInfo").html(currVal+" "+desc+" "+currmemoryVal);
													    	var configflag=true;
														    $("div[name='configval']").unbind("click").bind("click",function(){
													    		  $("div[name='configval']").removeClass("active");
														    		$(this).addClass("active");
														    		var currVal=$(this).html();
														    		var desc=null;
														    		var osConfigHtml1="";
														    		var cpuNumVal=null;
														    		var currmemoryVal1=null;
														    		var datas=desktopmanage.createDesktopCloudData.vmConfig;
														    		desktopmanage.getFeeParams={};
														    		$.each(datas,function(key,value){
														    			if(currVal==value.type){
														    				$.each(value.config,function(key1,value1){
														    					cpuNumVal=value1.cpuNum;
														    					$("#os_config").html("");
																    			desc=value1.desc;
																    			desktopParams.cpuNum=value1.cpuNum;
																    			$.each(value1.memory,function(key2,value2){
																    				if(key2==0){
																    					currmemoryVal1=value2.memorySize+Dict.val("dc_g_ram");
																    					desktopParams.memorySize=value2.memorySize;
																    					osConfigHtml1+="<div class='ty active subFee div_block' value='base' memorySize='"+value2.memorySize+"'>"+value1.desc+" "+value2.memorySize+Dict.val("dc_g_ram")+"</div>"
																    					}else{
																    						osConfigHtml1+="<div class='ty  subFee div_block' value='base' memorySize='"+value2.memorySize+"'>"+value1.desc+" "+value2.memorySize+Dict.val("dc_g_ram")+"</div>"
																    					}
																    			});
																    			if(key1==0){
																    				$("#os_config").append(osConfigHtml1);
																    			}else{
																    				$("#os_config").append("<div class='ty  subFee div_block' value='base' >"+value1.desc+"</div>");
																    			}
																    		});
														    			}
														    		});
//														    		{"period":1,"productPropertyList":[{"muProperty":"cpuNum","muPropertyValue":"1","productId":101},{"muProperty"
//														    			:"memorySize","muPropertyValue":"4","productId":101},{"muProperty":"OS","muPropertyValue":"1","productId"
//														    			:101}],"verifyFlag":"0"}
														    		$("#_configInfo").html(currVal+" "+desc+" "+currmemoryVal1);
//														    		desktopmanage.getFeeParams.memorySize=desktopParams.memorySize;
//														    		desktopmanage.getFeeParams.cpuNum=cpuNumVal;
														    		var cpuParams={"muProperty":"cpuNum","muPropertyValue":desktopParams.cpuNum,"productId":desktopParams.productId};
														    		var memoryParams={"muProperty":"memorySize","muPropertyValue":desktopParams.memorySize,"productId":desktopParams.productId};
														    		if(configflag){
														    			
														    			
															    		queryFeeParams.productPropertyList.push(cpuParams);
															    		
															    		queryFeeParams.productPropertyList.push(memoryParams);
															    	
														    			configflag=false;
														    		}else{
														    			var cpuParamsflagVal=true;
															    		if(queryFeeParams.productPropertyList.length>0){
															    			$.each(queryFeeParams.productPropertyList,function(key,value){
															    				if(value.muProperty=="cpuNum"){
															    					cpuParamsflagVal=false;
															    					value.muPropertyValue=desktopParams.cpuNum;
															    				}
															    			});
															    			
															    		}else{
															    			cpuParamsflagVal=false;
															    			queryFeeParams.productPropertyList.push(cpuParams);
															    		}
															    		if(cpuParamsflagVal){
															    			queryFeeParams.productPropertyList.push(cpuParams);
															    		}
															    		var memorySizeflagVal=true;
															    		if(queryFeeParams.productPropertyList.length>0){
															    			$.each(queryFeeParams.productPropertyList,function(key,value){
															    				if(value.muProperty=="memorySize"){
															    					memorySizeflagVal=false;
															    					value.muPropertyValue=desktopParams.memorySize;
															    				}
															    			});
															    			
															    		}else{
															    			memorySizeflagVal=false;
															    			queryFeeParams.productPropertyList.push(memoryParams);
															    		}
															    		if(memorySizeflagVal){
															    			queryFeeParams.productPropertyList.push(memoryParams);
															    		}
														    		}
														    		desktopmanage.getFeeParams=queryFeeParams;
//														    		
														    });
														    if(!CommonEnum.offLineBill){
												    			  setTimeout('desktopmanage.getFee()',5);
												    		  }
											    	  });
											    	  $(".subFee").bind('mouseup keyup',function(){
											    		  if(!CommonEnum.offLineBill){
											    			  setTimeout('desktopmanage.getFee()',5);
											    		  }
											  			
											  		});
											    	  $("div [name='diskSize']").bind("click",function(){
											    		  $("div [name='diskSize']").removeClass("active");
											    		  $(this).addClass("active");
											    		  $("#_dataSize").html($(this).attr("value"));
											    		  
											    	  });
											    	  $("#createDataDiskSize").bind("click",function(){
											    		  $("#_dataSize").empty().text($("#createDataDiskSize").val());
											    		  //console.log($("#createDataDiskSize").val());
											    		  var diskParams={"muProperty":"storageSize","muPropertyValue":$("#_dataSize").val(),"productId":desktopParams.productId};
										    				var storageSizeflagVal=true;
										    				//console.log(queryFeeParams.productPropertyList);
												    		if(queryFeeParams.productPropertyList.length>0){
												    			$.each(queryFeeParams.productPropertyList,function(key,value){
												    				if(value.muProperty=="storageSize"){
												    					storageSizeflagVal=false;
												    					value.muPropertyValue=$("#createDataDiskSize").val();
												    				}
												    			});
												    			
												    		}else{
												    			storageSizeflagVal=false;
												    			queryFeeParams.productPropertyList.push(diskParams);
												    		}
												    		if(storageSizeflagVal){
												    			queryFeeParams.productPropertyList.push(diskParams);
												    		}
											    	  });
											    	  /*
											    	  $("#createBandwidthSize").bind("click",function(){
											    		  //$("#_publicWidth").html($("#createBandwidthSize").val());
											    			var BAND_WIDTH={"muProperty":"BAND_WIDTH","muPropertyValue":$("#createBandwidthSize").val(),"productId":desktopParams.productId};
										    				var BAND_WIDTHflagVal=true;
												    		if(queryFeeParams.productPropertyList.length>0){
												    			$.each(queryFeeParams.productPropertyList,function(key,value){
												    				if(value.muProperty=="BAND_WIDTH"){
												    					BAND_WIDTHflagVal=false;
												    					value.muPropertyValue=$("#createBandwidthSize").val();
												    				}
												    			});
												    			
												    		}else{
												    			BAND_WIDTHflagVal=false;
												    			queryFeeParams.productPropertyList.push(BAND_WIDTH);
												    		}
												    		if(BAND_WIDTHflagVal){
												    			queryFeeParams.productPropertyList.push(BAND_WIDTH);
												    		}
											    	  });
											    	  */
											    	  $("#_dataSize").empty().text("20");
											    	  $("#dataDisk-range-min").slider({
											    			range : "min",
											    			value : 150,
											    			min : 50,
											    			max : 1000,
											    			step : 10,
											    			slide : function(event, ui) {
											    				$("#createDataDiskSize").val(ui.value);
//											    				$("#_dataSize").empty().text(ui.value);
											    				desktopParams.storageSize=ui.value.toString();
											    				desktopmanage.getFeeParams={};
											    				desktopmanage.getFeeParams.dataDisk=ui.value;
											    				var keyOpt=-1;
											    				var diskParams={"muProperty":"storageSize","muPropertyValue":$("#_dataSize").val(),"productId":desktopParams.productId};
											    				var storageSizeflagVal=true;
													    		if(queryFeeParams.productPropertyList.length>0){
													    			$.each(queryFeeParams.productPropertyList,function(key,value){
													    				if(value.muProperty=="storageSize"){
													    					storageSizeflagVal=false;
													    					value.muPropertyValue=ui.value.toString();
													    				}
													    			});
													    			
													    		}else{
													    			storageSizeflagVal=false;
													    			queryFeeParams.productPropertyList.push(diskParams);
													    		}
													    		if(storageSizeflagVal){
													    			queryFeeParams.productPropertyList.push(diskParams);
													    		}
											    				
											    				
											    				
											    				
											    				
											    				
											    				
											    				
											    				
											    				
//											    				if(queryFeeParams.productPropertyList.length>0){
//													    			
//													    			$.each(queryFeeParams.productPropertyList,function(key,value33){
////													    				currObj=value33;
//														    			if(value33.muProperty=="storageSize"){
//														    				keyOpt=key;
//														    			}
//														    		});
//													    			queryFeeParams.productPropertyList.splice(keyOpt,1,diskParams); 
//													    		}
											    				
//											    				queryFeeParams.productPropertyList.push(diskParams);
													    		desktopmanage.getFeeParams=queryFeeParams;
											    			}
											    		});
											    	  /*
											    	  $("#bandwidth-range-min").slider({
											    			range : "min",
											    			value : 0,
											    			min : 0,
											    			max : 200,
											    			step : 1,
											    			slide : function(event, ui) {
											    				$("#createBandwidthSize").val(ui.value);
											    				$("#_publicWidth").html(ui.value);
											    				desktopParams.BAND_WIDTH=ui.value.toString();
											    				desktopmanage.getFeeParams={};
											    				desktopmanage.getFeeParams.BAND_WIDTH=ui.value.toString();
											    				var keyOpt=-1;
//											    				var BAND_WIDTH={"muProperty":"BAND_WIDTH","muPropertyValue":ui.value.toString(),"productId":desktopParams.productId};
											    				var BAND_WIDTH={"muProperty":"BAND_WIDTH","muPropertyValue":ui.value.toString(),"productId":desktopParams.productId};
											    				var BAND_WIDTHflagVal=true;
													    		if(queryFeeParams.productPropertyList.length>0){
													    			$.each(queryFeeParams.productPropertyList,function(key,value){
													    				if(value.muProperty=="BAND_WIDTH"){
													    					BAND_WIDTHflagVal=false;
													    					value.muPropertyValue=ui.value.toString();
													    				}
													    			});
													    			
													    		}else{
													    			BAND_WIDTHflagVal=false;
													    			queryFeeParams.productPropertyList.push(BAND_WIDTH);
													    		}
													    		if(BAND_WIDTHflagVal){
													    			queryFeeParams.productPropertyList.push(BAND_WIDTH);
													    		}
											    				
											    				
											    				
											    				
											    				
//											    				if(queryFeeParams.productPropertyList.length>0){
//													    			
//													    			$.each(queryFeeParams.productPropertyList,function(key,value33){
////													    				currObj=value33;
//														    			if(value33.muProperty=="BAND_WIDTH"){
//														    				keyOpt=key;
//														    			}
//														    		});
//													    			
//													    			queryFeeParams.productPropertyList.splice(keyOpt,1,BAND_WIDTH); 
//													    		}
//											    				
//											    				queryFeeParams.productPropertyList.push(BAND_WIDTH);
													    		desktopmanage.getFeeParams=queryFeeParams;
											    				
											    			}
											    		});
											    	  $("#createBandwidthSize").bind(
											    				"blur",
											    				function() {
											    					var value = $("#bandwidth-range-min").slider("value");
											    					var newValue = $(this).val();
											    					if (/^[1-9]+[0-9]*$/.test("" + newValue)
											    							&& parseInt(newValue) >= 1
											    							&& parseInt(newValue) <= 200) {
											    						$("#bandwidth-range-min").slider("value", newValue);
											    					} else {
											    						$(this).val(value);
											    					}
											    				});
											    		$("#createBandwidthSize").val($("#bandwidth-range-min").slider("value"));
											    		*/
											    		$("#createDataDiskSize").bind(
											    				"blur",
											    				function() {
											    					var value = $("#dataDisk-range-min").slider("value");
											    					var newValue = $(this).val();
											    					//console.log($(this));
											    					//console.log(newValue);
											    					if (/^[1-9]+[0-9]*$/.test("" + newValue)
											    							&& parseInt(newValue) >= 50
											    							&& parseInt(newValue) <= 1000) {
											    						if( parseInt(newValue)%10==0){
											    							newValue = parseInt(newValue);
											    						}else{
											    							newValue = parseInt(newValue / 10) * 10+10;	
											    						}
											    						
											    						$(this).val(newValue);
											    						$("#dataDisk-range-min").slider("value", newValue);
											    						$("#_dataSize").text(newValue);
											    					} else {
											    						$(this).val(value);
											    						$("#_dataSize").text(value);
											    					}
//											    					VM.getFee();
											    				});
											      }
											      });
											    }
											    desktopmanage.newFormModal.setWidth(1200).autoAlign().setTop(60).show();
						    	 },
							    	 getFee : function(){
											if(CommonEnum.offLineBill)return;
											var param =desktopmanage.getFeeParams;
											if(null==param)return;
											Dcp.biz.apiAsyncRequest("/desktopCloud/pm/queryCaculateFeeByPrtyList",param, function(data) {
											
												$(".price").empty().html(desktopmanage.selecedUserNumber*600);
												if(null!=data&&0 == data.code){
													var count =   desktopmanage.selecedUserNumber;
													
													var fee =  data.data.fee;
													$(".price").empty().html(count * fee/1000);
													
												}
											});
										},	
									  onChangeareaName:function(areaVal,areaName) {
											$("#_areaNameVal").html(areaVal.split("=")[1]);
											var pool = $("#areaNameId").val();
										},
									  _save : function(params){
//										  
										  
										  
										  
										  com.skyform.service.desktopCloudService.saveDesktopInfo(params,function onSuccess(data){
											  desktopmanage.getFeeParams={};
											  //console.log(data.tradeId);
											 //alert($(".price").html());
											 // if(!CommonEnum.offLineBill){
											//com.skyform.service.BillService.confirmTradeSubmit($(".price").html(),data.tradeId,$("#newDesktopCloudForm2"),function onSuccess(data){
											  com.skyform.service.desktopCloudService.deskConfirmTradeSubmit($(".price").html(),data.tradeId,$("#newDesktopCloudForm2"),function onSuccess(data){
											//$.growlUI(Dict.val("common_tip"), "操作成功"); 
											//$("#newDesktopCloudForm2").hide();
												$.growlUI(Dict.val("common_tip"), Dict.val("dc_create_cloud_desktop_success"));
												 desktopmanage.refreshData();
											},function onError(msg){
												
												$.growlUI(Dict.val("common_tip"), Dict.val("dc_create_cloud_desktop_failed"));
											});
											 // }
											  $(".price").empty().html(0);
										      desktopmanage.newFormModal.hide();
										      
										      //desktopmanage.refreshData();
											}, function onError(msg) {
												desktopmanage.newFormModal.hide();
												$.growlUI(Dict.val("common_tip"), Dict.val("dc_create_cloud_desktop_request_failed")+msg);
											});
//											com.skyform.service.BillService.confirmTradeSubmit(2000,"3532434234234",$("#newDesktopCloudForm2"),function onSuccess(data){
////															
//											},function onError(msg){
//												$.growlUI(Dict.val("common_tip"), "续订申请提交成功,扣款失败...");
//											});
										  desktopmanage.getTenantInfo();
										  
									  },
									  getBillType : function(){
										  	var obj = com.skyform.service.BillService.getBillType();
										  	$.each(obj,function(key,value){
										  		desktopmanage.billType_ = key;
										  	});
										  },
									  showDetails : function(instance){
										  
										  
										  if(!desktopmanage.data || desktopmanage.data.length < 1) return;
									      if(!instance) {
											  instance = desktopmanage.data[0].id;
									      }
//										  $("div[scope='"+desktopmanage.scope+"'] .detail_value").each(function (i,item){
//											  var prop = $(item).attr("prop");
//											  var value = instance['' + prop] || "---";
//											  if(prop == "state") {
//												  value = com.skyform.service.StateService.getState("",value);
//											  } 
//											  $(item).html(value);
//										  });
										  $("#desktopmanage_logs").empty();
										  //com.skyform.service.LogService.describeLogsUIInfo(instance.id);
										  //com.skyform.service.LogService.describeLogsUIInfo(instance);
										  com.skyform.service.desktopCloudService.describeLogs(instance,function(logs){
											  //console.log(logs);
											  $("#desktopmanage_logs").empty();
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
													
													$("<li class='detail-item'><span>" + v.createTime + "  " +_name+"  "+ v.controle +desc+ "</span></li>").appendTo($("#desktopmanage_logs"));
													  });
										  },function onError(msg){
												$.growlUI(Dict.val("common_tip"), Dict.val("dc_query_cloud_desktop_log_error") + msg); 
											});
									  }
		 
};
/*
$(function(){
	var privateNetworkInited = false;
	$("#desktop_manager_tab").on("show",function(){
		
		desktopmanage.init();
		window.currentInstanceType='desktopmanage';
		
		$("#_product").text(CommonEnum.product[window.currentInstanceType]);
		$("div.details_content[scope !='" + desktopmanage.scope+"']").addClass("hide");
		$("div.details_content[scope ='" + desktopmanage.scope+"']").removeClass("hide")
	});
	
	$("#desktop_manager_tab").on("shown",function(){
		alert('b');
		if(!privateNetworkInited) {
			//privateNetworkInited = true;
			desktopCloud.init();
		}
	});
	$("#desktopCloud_tab").on("show",function(){
		alert('c');
		desktopCloud.init();

		window.currentInstanceType='desktopCloud';
		$("#_product").text(CommonEnum.product[window.currentInstanceType]);
		$("div.details_content[scope !='" + desktopCloud.scope+"']").addClass("hide");
		$("div.details_content[scope ='" + desktopCloud.scope+"']").removeClass("hide")
	});
	
	//$("#private_net_tab").on("shown",function(){
	
});
*/