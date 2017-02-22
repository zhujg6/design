//当前刷新实例的类型为子网

window.Controller = {
		init : function(){
		},
		refresh : function(){
//			BackupCreate.refreshData();
//			BackupSee.refreshData();
		}
	}
$(function(){
	$.fn.dataTableExt.sErrMode = 'throw';
	$("#private_net_tabmask").css("width",$("#private_net_tab").css("width"));
	$("#private_net_tabmask").css("height",$("#private_net_tab").css("height"));
});

var BackupSee = {
		  data : [],
		  wizard : null,
		  searchAndClickAFlag:false,
		  tabClickFlag:true,
		  backupSeeState:{"1":"还原成功","2":"--","3":"还原中","4":"还原失败","5":"删除中"},
		  dtTable : null,
		  contextMenu : null,
		  scope : "privateNet",
		  BackukFilelist : [],
		  datatable : new com.skyform.component.DataTable(),
		  datatable_restore : null,
		  init : function(){
			  
			  BackupSee.refreshData();
			  BackupSee._bindAction();
		  },
		  
	  	  ///////////////////////////////////////////////////////////////////////////
		  //	Actions  start
	//"cloudBackupId":BackupSee.selectedInstanceId,
		  ///////////////////////////////////////////////////////////////////////////
		  destroy : function(){
			ConfirmWindow.setTitle("删除备份文件").setContent("<h4>确认要删除备份文件吗？</h4>").onSave = function(){
				var params={params:{
					"backuptask_id": BackupSee.selectedInstanceId,
					"backupset_id": BackupSee.selectedInstancebackupset_id,
					"backup_type": BackupSee.selectedInstancebackupType
				}



				};
				com.skyform.service.backupCloudService.deleteBackupCloudDir(params,function(result){
					if(result.length==0){
						$.growlUI("删除备份", "删除备份文件成功!");
						setTimeout(BackupSee.refreshData(),3000);
					}else{
						ErrorMgr.showError("该备份文件删除不成功");
						ConfirmWindow.hide();
					}
				},function(error){
					
				});
				
				ConfirmWindow.hide();
			};
			ConfirmWindow.show();
		  },
		  listBackupCloudDir:function(params){
			  com.skyform.service.backupCloudService.listBackupCloudDir(params,function(result){
				  BackupSee._refreshDtTable(result);
			  },function(){});
		  },
		  
		  refreshData : function(){
			  if(BackupSee.dtTable) BackupSee.dtTable.container.find("tbody").html("<tr ><td colspan='7' style='text-align:center;'><img src='"+CONTEXT_PATH+"/images/loader.gif'/><strong>正在获取数据，请稍后....</strong></td></tr>");
//			  var params={
//					  "name":"",
//					  "backupTime":""
//			  };
//			  
				var params=new Object();
				params.vmName=$("#vmName1").val().trim()||"";
				params.taskName=$("#taskName1").val().trim()||"";
				var sss2=$("#backupTime2").val().trim()||new Date().format("yyyy-MM-dd");
//				params.backupTimeMax=sss2.substring(0,sss2.length-2)+(parseInt(sss2.substring(sss2.length-2,sss2.length))+1);
//				params.backupTimeMin=$("#backupTime1").val().trim()||new Date().format("yyyy-MM-dd");
				//这里根据云备份id来查询备份文件
//				BackupSee._refreshDtTable(BackupSee.data);
				  
				
				  var params2={};
				  params2.condition=params;
				  BackupSee.listBackupCloudDir(BackupCreate.paramsbackupSee);
//				  BackupSee._refreshDtTable([]);
				  
//				  if(BackupSee.tabClickFlag){
//					  if(BackupSee.searchAndClickAFlag){
//						  BackupSee.listBackupCloudDir(params2);
//					  }else{
//						  BackupSee.listBackupCloudDir(BackupCreate.paramsbackupSee);
//					  }
//					  
//				  }else{
//					  BackupSee._refreshDtTable([]);
//				  }
			  
			  
			  
//			  BackupSee.service.listAll(function onSuccess(nets){		    			    	
//		    	for (var i = 0; i < nets.length; i++) {
//		    		BackupSee.privateNetIP.push(nets[i].ipSegments);	
//		    		BackupSee.privateNetName.push(nets[i].name);	
//		    	}
//		    	
//		    	//过滤掉已删除的私网
//		    	for(var i = 0; i < nets.length; i++){
//		    		if(i==0){
//		    			BackupSee.data=[];
//		    		}
//		    		if(!(nets[i].state=="deleted")){
//		    			BackupSee.data.push(nets[i]);
//		    		}
//		    	}
//		    	
//		    	//首先得到第一个私网的关联资源放到页面上
//		    	if(BackupSee.data.length>0){
//		    		var firstInstanceId = BackupSee.data[0].id;
//		    	}
//		        
//		    },function onError(msg){
//		      alert("错误：" + msg);
//		    });
		  },
		  
		  showDetails : function(instance){
			  if(!BackupSee.data || BackupSee.data.length < 1) return;
			  if(!instance) {
				  instance = BackupSee.data[0];
			  }
			  $("div[scope='"+BackupSee.scope+"'] .detail_value").each(function (i,item){
				  var prop = $(item).attr("prop");
				  var value = instance['' + prop] || "---";
				  if(prop == "state") {
					  value = com.skyform.service.StateService.getState("Subnet",value);
				  } 
				  $(item).html(value);
			  });	
			  $("#subnet_logs").empty(); 
			  com.skyform.service.LogService.describeLogsUIInfo(instance.id,"subnet_logs");

					
		  },
		  ///////////////////////////////////////////////////////////////////////////
		  //	Actions  end
		  ///////////////////////////////////////////////////////////////////////////
		  
		  getInstanceInfoById : function(instanceId) {
			var result = null;
			$(BackupSee.data).each(function(i,instance){
				if(instance.id+"" == instanceId+"") {
					result = instance;
					return false;
				}
			});
			return result;
		  },
		  
		  _bindAction : function(){
				$("div[scope='"+BackupSee.scope+"'] #toolbar4privatenet .actionBtn").unbind("click").click(function(){
					if($(this).hasClass("disabled")) return;
					var action = $(this).attr("action");
					BackupSee._invokeAction(action);
				});
				$("#searchByParams1").unbind("click").click(function(){
					BackupSee.searchAndClickAFlag=true;
					BackupSee.tabClickFlag=true;
					  var params={
							  "name":$("#vmName1").val()||"",
							  "backupTime":$("#backupTime1").val()||""
					  };
						var params=new Object();
						params.vmName=$("#vmName1").val()||"";
						params.taskName=$("#taskName1").val()||"";
						params.backuptask_id=$("#taskName_id").val()||"";
						params.vm_id=$("#vmName1_id").val()||"";
						var date=new Date();
						var s1=""||$("#backupTime2").val();
						var ss2=s1;
//						params.backupTimeMax=ss2.substring(0,ss2.length-1)+(parseInt(ss2.substr(-1))+1);
//						console.log(ss2.substring(0,ss2.length-2));
//						console.log((parseInt(date.substring(date.length-2,date.length))+1))
						if(ss2.length==0){
							params.backupTimeMax="";
						}else{
							params.backupTimeMax=ss2.substring(0,ss2.length-2)+(parseInt(ss2.substring(ss2.length-2,ss2.length))+1);
						}
					
						params.backupTimeMin=""||$("#backupTime1").val();
						//这里根据云备份id来查询备份文件
//						BackupSee._refreshDtTable(BackupSee.data);
						  
						  var params2={};
						  params2.condition=params;
						  
						  BackupSee.listBackupCloudDir(params2);
//					  
//					  
//					  BackupSee.listBackupCloudDir(params);
				});
				
		  },
			
		  _invokeAction : function(action){
				var invoker = BackupSee["" + action];
				if(invoker && typeof invoker == 'function') {
					invoker();
				}
		  },
		  
		  _refreshDtTable : function(data) {
			  //console.log(data);
		    if(BackupSee.dtTable) {
		    	BackupSee.dtTable.updateData(data);
		    } else {
		    	BackupSee.dtTable = new com.skyform.component.DataTable();
		    	BackupSee.dtTable.renderByData("#private_network_instanceTable",{
		    	pageSize : 5,
		        
		        data : data,
		        onColumnRender : function(columnIndex,columnMetaData,columnData){
		          if(columnMetaData.name=='ID') {
					  return columnData.id;
				  } else if(columnMetaData.name=="id") {
		              return "<input type='checkbox' value='" + columnData["id"] +"'/>" ;
		          }
//				  else if (columnMetaData.name == 'state') {
//		        	  return com.skyform.service.StateService.getState("Subnet",columnData['state']);
//		          }
//		          else if(columnMetaData.name == 'ipSegments'){ //added by shixianzhi
//		        	  var data1 = columnData['ipSegments']+"";
//		        	  if(data1=="undefined"){
//		        		  return "";
//		        	  }
//		        	  if(data1=="-"){
//		        		  return "";
//		        	  }
//		        	  return data1.split(".")[0]+"."+data1.split(".")[1]+"."+data1.split(".")[2]+"."+"0/24";
//		          }
		          else if(columnMetaData.name == 'name'){
		        	  return columnData['name'];
		          } else if(columnMetaData.name == 'ip'){
		        	  return columnData['ip'];
		          }else if (columnMetaData.name == 'backupType') {
					  if (columnData.backupType) {
						  return BackupCreate.setupType[columnData.backupType];
					  } else {
						  return "";
					  }
				  }else if(columnMetaData.name == 'taskName'){
		        	  return columnData['taskName'];
		          }
		          else if(columnMetaData.name == 'filePath'){
		        	  //return columnData['filePath'];
					  if(columnData['filePath']){
						  var text = (columnData['filePath'].length>15?"<span title='"+columnData['filePath']+"'>"+columnData['filePath'].slice(0,15)+"..."+"</span>":columnData['filePath']);
						  return text;
					  }else {
						  return "";
					  }

		          }
		          else if(columnMetaData.name == 'state'){
		        	  var te="";
						if(columnData.rollbackup_state){
							if(columnData.rollbackup_state=="1"){
								te='<span class="state-green" title="" data-toggle="popover" href="#"><i class="icon-circle green mr5"></i>'+BackupSee.backupSeeState["1"]+'</span>';
							}else if(columnData.rollbackup_state=="2"){
								te='<span class="state-red" title="" data-toggle="popover" href="#"><i class="icon-remove-sign red mr5"></i>'+BackupSee.backupSeeState["4"]+'</span>';
							}else if(columnData.rollbackup_state=="3"){
								te='<span class="state-copper" title="" data-toggle="popover" href="#"><i class="icon-spinner icon-spin blue mr5"></i>'+BackupSee.backupSeeState["5"]+'</span>';
							}else if(columnData.rollbackup_state=="0"){
								te='<span class="state-copper" title="" data-toggle="popover" href="#"><i class="icon-spinner icon-spin blue mr5"></i>'+BackupSee.backupSeeState["3"]+'</span>';
							}
						}else{
							if(columnData.state=="rollbacking"){
								te='<span class="state-copper" title="" data-toggle="popover" href="#"><i class="icon-spinner icon-spin blue mr5"></i>'+BackupSee.backupSeeState["3"]+'</span>';
							}else if(columnData.state=="rollback error"){
								te='<span class="state-red" title="" data-toggle="popover" href="#"><i class="icon-remove-sign red mr5"></i>'+BackupSee.backupSeeState["4"]+'</span>';
							}
//						else if(columnData.state=="1"){
//							te='<span class="state-green" title="" data-toggle="popover" href="#"><i class="icon-circle green mr5"></i>'+BackupCreate.state[columnData.state]+'</span>';
//						}
							else {
								//else if(columnData.state=="2"){
								//	te='<span class="state-red" title="" data-toggle="popover" href="#"><i class="icon-remove-sign red mr5"></i>'+BackupSee.backupSeeState["2"]+'</span>';
								te='<span class="state-red" title="" data-toggle="popover" href="#">'+BackupSee.backupSeeState["2"]+'</span>';
							}
						}

					
						return te;
		        	  
		        	  
//		        	  return BackupSee.backupSeeState[columnData.state];
		          }
//		          else if(columnMetaData.name == 'backUPtime'){
//		        	  return columnData.backUPtime ;
//		          }
		          else if(columnMetaData.name == 'backupTime'){
					  var text = '';
					  if(columnData.backupset_date == '' || columnData.backupset_date == 'undefined'){
					  	return text;
					  }
					  try {
							//var obj = eval('(' + "{Date: new Date(" + columnData.backupset_date + ")}" + ')');
							//var dateValue = obj["Date"];
							//text = dateValue.format('yyyy-MM-dd hh:mm:ss');
						  text=columnData.backupset_date;
						} catch (e) {
					    }
					  return text;
		          }
				  else if(columnMetaData.name == 'backupSize'){
					  return columnData['used_storage'];
				  }
//		          else if(columnMetaData.name=='name'){
//		        	  text = columnData.name
//					  +"<a title='咨询建议' href='../user/workOrder.jsp?code=workOrder&cataCode=service&instanceId="+columnData.id+"&serviceType=subnet&instanceName="+encodeURIComponent(columnData.name)+
//					  "&instanceStatus="+columnData.status+
//					  "&currentPoolW="+encodeURIComponent(CommonEnum.pools[CommonEnum.currentPool])+
//					  "'><i class='icon-comments' ></i></a>";
//			    	 return text;
//		          }
		          else {
		        	  return columnData[columnMetaData.name];
		          }
		        },
		        afterRowRender : function(rowIndex,data,tr){
		          tr.attr("instanceId",data.id);
		          tr.attr("instanceName",data.name);
		          tr.attr("instanceState",data.state);
		          tr.attr("instanceIP",data.ip);
		          tr.attr("fileDir",data.fileDir);
		          tr.attr("backUPtime",data.backUPtime);
		          tr.attr("backupset_date",data.backupset_date);
		          tr.attr("filePath",data.filePath);
		          tr.attr("backupType",data.backupType);
		          tr.attr("osType",data.osType);
		          tr.attr("backupset_id",data.backupset_id);
		          tr.attr("networkId",data.networkId);
		          tr.attr("vmName",data.vmName);
		          tr.attr("taskName",data.taskName);
		          tr.attr("rollbackup_state",data.rollbackup_state);
					if(!data.filePath){
						tr.attr("filePath","");
					}else{
						tr.attr("filePath",data.filePath);
					}


		          tr.find("input[type='checkbox']").click(function(){
		        	  BackupSee.onInstanceSelected(); 
		          });
		          
		          tr.unbind("click").click(function(){
		        	  BackupSee.showDetails(data); 
		          });
		        },
		        afterTableRender : BackupSee._afterDtTableRender
		      });
		      
		    	BackupSee.dtTable.addToobarButton($("#toolbar4privatenet"));
		    	BackupSee.dtTable.enableColumnHideAndShow("right");
		    }
		  },
		  
		  _afterDtTableRender : function(){
		    var check = $("input#selectAllIp[type='checkbox']").unbind("click").click(function(e){
		      e.stopPropagation();
		      var check = $(this).attr("checked");
		      BackupSee.checkAll(check);
		    });
		    if(!BackupSee.contextMenu) {
		    	BackupSee.contextMenu = new ContextMenu({
		    	container : "#contextMenuPrivateNet",
		        beforeShow : function(tr){
		        	BackupSee.checkAll(false);
		          tr.find("input[type='checkbox']").attr("checked",true);
		        },
		        afterShow : function(tr) {
		        	BackupSee.onInstanceSelected({
		            instanceName : tr.attr("instanceName"),
		            id : tr.attr("instanceId"),
		            state : tr.attr("instanceState")
		          });
		        },
		        onAction : function(action) {
		        	BackupSee._invokeAction(action);
		        },
		        trigger : "#private_network_instanceTable tr"
		      });
		    } else {
		    	BackupSee.contextMenu.reset();
		    }
		    BackupSee.showDetails();
		  },
		  
		  checkAll : function(check){//全选触发的操作
		    if(check) $("#private_network_instanceTable tbody input[type='checkbox']").attr("checked",true);
		    else $("#private_network_instanceTable tbody input[type='checkbox']").removeAttr("checked");
		    BackupSee.onInstanceSelected(false);
		  },
		  
		  onInstanceSelected : function(selectInstance){//单选一个触发的操作
		    var allCheckedBox = $("#private_network_instanceTable tbody input[type='checkbox']:checked");
		    var rightClicked = selectInstance?true:false;
		    var state = $(allCheckedBox[0]).parents("tr").attr("instanceState");
			  var osType = $(allCheckedBox[0]).parents("tr").attr("osType")=='WIN' ? false : true;
			  var down = ($(allCheckedBox[0]).parents("tr").attr("backupType")=='3' ? false : true)||($(allCheckedBox[0]).parents("tr").attr("osType")=='WIN' ? false : true);
			  var rollbackup_state=($(allCheckedBox[0]).parents("tr").attr("rollbackup_state")=='3'||$(allCheckedBox[0]).parents("tr").attr("rollbackup_state")=='0') ? false : true;
		    //var osType = $(allCheckedBox[0]).parents("tr").attr("osType");
		    //var backupType = $(allCheckedBox[0]).parents("tr").attr("backupType");
		    var routeName = $(allCheckedBox[0]).parents("tr").attr("routeName");
		    
			if(selectInstance) {
				state = selectInstance.state;
			};
			  if(selectInstance) {
				  osType = selectInstance.osType;
			  }
		    var oneSelected = allCheckedBox.length == 1;
		    var hasSelected = allCheckedBox.length > 0;
		    $("div[scope='"+BackupSee.scope+"'] .operation").addClass("disabled");
		    $("div[scope='"+BackupSee.scope+"'] .operation").each(function(index,operation){
		      var condition = $(operation).attr("condition");
		      var action = $(operation).attr("action");
		      var enabled = true;
		      eval("enabled=("+condition+")");
		      if(enabled) {
		        $(operation).removeClass("disabled");
		      } else {
		        $(operation).addClass("disabled");
		      }
		      BackupSee._bindAction();

		    });
		    if(rightClicked) {
		    	BackupSee.instanceName = selectInstance.instanceName;
		    	BackupSee.selectedInstanceId = selectInstance.id;
		    	BackupSee.selectedInstancebackupType = selectInstance.backupType;
				BackupSee.selectedInstancebackupset_id = currentCheckBox.parents("tr").attr("backupset_id");
		    } else {
		      for ( var i = 0; i < allCheckedBox.length; i++) {
		        var currentCheckBox = $(allCheckedBox[i]);
		        if (i == 0) {
		        	BackupSee.instanceName = currentCheckBox.parents("tr").attr("name");
		        	BackupSee.selectedInstanceId = currentCheckBox.attr("value");
					BackupSee.selectedInstancebackupType = currentCheckBox.parents("tr").attr("backupType");
					BackupSee.selectedInstancebackupset_id =currentCheckBox.parents("tr").attr("backupset_id");
		        } else {
		        	BackupSee.instanceName += "," + currentCheckBox.parents("tr").attr("name");
		        	BackupSee.selectedInstanceId += "," + currentCheckBox.attr("value");
					BackupSee.selectedInstancebackupType +=","+ currentCheckBox.parents("tr").attr("backupType");
					BackupSee.selectedInstancebackupset_id +=","+ currentCheckBox.parents("tr").attr("backupset_id");
		        }
		      }
		    }
		  },
	listCloudBackukFile:function(type,backuptask_id,backup_disk,backup_path,backup_date){
		var requestBody={
			"type":type,
			"params":{
				"backuptask_id":backuptask_id,
				"backup_disk": "\""+backup_disk+"\"",
				"backup_path": "\""+backup_path+"\"",
				"backup_date":backup_date
			}
		};
		BackupSee.BackukFilelist=[];
		com.skyform.service.backupCloudService.listCloudBackukFile(requestBody,function(result){
				BackupSee.BackukFilelist=result.files;
			},
			function(error){$.growlUI(Dict.val("common_tip"), error);});
	},
	downloadCloudBackukFile:function(type,backuptask_id,backup_disk,backup_file,backup_date){
		//var downBackup_date=backup_date.slice(0,4)+"-"+backup_date.slice(4,6)+"-"+backup_date.slice(6,8)+"-"+backup_date.slice(8,10)+"-"+backup_date.slice(10,12)+"-"+backup_date.slice(12,14);
		var requestBody={
			"type":type=="1"?"sysbackupers":"dbbackupers",
			"params":{
				"backuptask_id": backuptask_id,
				"backup_disk": backup_disk,
				"backup_file": backup_file,
				"backup_date": backup_date
			}

		};
		com.skyform.service.backupCloudService.downloadCloudBackukFile(requestBody,function(result){
				//console.log(result.download_link);
				$("#copyDownUrl span:eq(0)").html(result.download_link);
				//$("#copyDownUrl a:eq(0)").attr("href","java");
				$("#copyDownUrl").show();
				$("#copyDownUrlCancle").click(function(){
					$("#copyDownUrl").hide();
				});
			},
			function(error){$.growlUI(Dict.val("common_tip"), error);});
	},
	deleteSecletFile:function(node){
		var tr = $(node).closest("li");
		$(tr).remove();
	},
	downloadFile:function(){
		//BackupSee.listCloudBackukFile();
		//$("#down_Restore").val($("#private_network_instanceTable tr").find("input[type='checkbox']:checked").parents("tr").attr("instanceip"));
		$("#down_Restore_id").val($("#private_network_instanceTable tr").find("input[type='checkbox']:checked").parents("tr").attr("instanceid"));
		$("#downbackUpTimes").val($("#private_network_instanceTable tr").find("input[type='checkbox']:checked").parents("tr").attr("backupset_date"));
		$("#downBackupType").attr("data-value",$("#private_network_instanceTable tr").find("input[type='checkbox']:checked").parents("tr").attr("backupType"));
		$("#downBackupType").html(BackupCreate.setupType[$("#private_network_instanceTable tr").find("input[type='checkbox']:checked").parents("tr").attr("backupType")]);
		$("#down_Restore_name").html($("#private_network_instanceTable tr").find("input[type='checkbox']:checked").parents("tr").attr("taskName"));
		$("#down_Restore_vmName").html($("#private_network_instanceTable tr").find("input[type='checkbox']:checked").parents("tr").attr("vmname"));
		var downoldBackUpPath=$("#private_network_instanceTable tr").find("input[type='checkbox']:checked").parents("tr").attr("filePath").split("\"|\"");
		$("#downFromPath").empty();
		for(var i=0;i<downoldBackUpPath.length;i++){
			if(i==0){
				downoldBackUpPath[i]=downoldBackUpPath[i].slice(1);
			};
			if(i==downoldBackUpPath.length-1){
				downoldBackUpPath[i]=downoldBackUpPath[i].slice(0,downoldBackUpPath[i].length-1);
			};
			if(downoldBackUpPath[i]=="/"){
				$("<option "+ "value=\"" + downoldBackUpPath[i] + "\" >" +"root"+ "</option>").appendTo($("#downFromPath"));
			}else{
				$("<option "+ "value=\"" + downoldBackUpPath[i] + "\" >" +downoldBackUpPath[i]+ "</option>").appendTo($("#downFromPath"));
			}
		};
		if(!downoldBackUpPath){
			$("<option "+ "value=\"" +  + "\" >" + "</option>").appendTo($("#downFromPath"));
		}
		$("#leftContent").empty();
		/*$("#downFromPath").change(function(){
			$("#leftContent").empty();
			var ztreeObj=$.fn.zTree.getZTreeObj("tree");
			ztreeObj.expandAll(false);
			ztreeObj.refresh();
			$.fn.zTree.destroy("tree");
			$.fn.zTree.init($("#tree"), setting, zNodes);
		});*/
		$('#download').off('shown').on('shown', function () {
			var zTree;
			//var demoIframe;

			var setting = {
				view: {
					dblClickExpand: false,
					showLine: false,
					selectedMulti: true
				},
				data: {
					simpleData: {
						enable:true,
						idKey: "id",
						pIdKey: "pId",
						rootPId: ""
					}
				},
				callback: {
					beforeClick: function(treeId, treeNode) {
						var zTree = $.fn.zTree.getZTreeObj("tree");
						if (treeNode.isParent) {
							var nodes = treeNode.children;
							var newNodes=[];
							//BackupSee.listCloudBackukFile(treeNode.file);
							var downBackupType="";
							if($("#downBackupType").attr("data-value")=="1"){
								downBackupType="sysbackupers"
							}else if($("#downBackupType").attr("data-value")=="3"){
								downBackupType="dbbackupers"
							}
							//var downTimes=$("#downbackUpTimes").val().slice(0,4)+"-"+$("#downbackUpTimes").val().slice(4,6)+"-"+$("#downbackUpTimes").val().slice(6,8)+"-"+$("#downbackUpTimes").val().slice(8,10)+"-"+$("#downbackUpTimes").val().slice(10,12)+"-"+$("#downbackUpTimes").val().slice(12,14);
							BackupSee.listCloudBackukFile(downBackupType,$("#down_Restore_id").val(),$("#downFromPath").val(),treeNode.file,$("#downbackUpTimes").val());
							if(BackupSee.BackukFilelist.length!=0){
								for(i=0;i<BackupSee.BackukFilelist.length;i++){
									if(treeNode.file=="/"){//根目录
										if(BackupSee.BackukFilelist[i][BackupSee.BackukFilelist[i].length-1]=="/"){
											var TemporaryStorage="";
											for(var j=0;j<BackupSee.BackukFilelist[i].length-1;j++){
												TemporaryStorage+=BackupSee.BackukFilelist[i][j];
											};
											newNodes.push({name:TemporaryStorage, file:TemporaryStorage,open:false,isParent:true});
										}else{
											newNodes.push({name:BackupSee.BackukFilelist[i], file:BackupSee.BackukFilelist[i],isParent:false});
										}
									}else{//不是根目录
										if(BackupSee.BackukFilelist[i][BackupSee.BackukFilelist[i].length-1]=="/"){
											var TemporaryStorage="";
											for(var j=0;j<BackupSee.BackukFilelist[i].length-1;j++){
												TemporaryStorage+=BackupSee.BackukFilelist[i][j];
											};
											newNodes.push({name:TemporaryStorage, file:treeNode.file+"/"+TemporaryStorage,open:false,isParent:true});
										}else{
											newNodes.push({name:BackupSee.BackukFilelist[i], file:treeNode.file+"/"+BackupSee.BackukFilelist[i],isParent:false});
										}
									}
								}
								//newNodes = zTree.addNodes(treeNode, newNodes);
								if(nodes){
									//zTree.addNodes(treeNode, {});
									zTree.expandNode(treeNode);
									return true;
								}else{
									zTree.addNodes(treeNode, newNodes);
								}
								return true;
							}else{

							}

						} else {
							/*demoIframe.attr("src",treeNode.file + ".html");*/
							return true;
						}
					},
					onClick :function(event, treeId, treeNode){
						if(treeNode.isParent){
							var isExistence=false;
							$("#leftContent li input").each(function(){
								if($(this).val()==treeNode.file){
									isExistence=true;
								}
							});
							if(!isExistence){
								if(treeNode.file==$("#downFromPath").val()){

								}else{
									$("#leftContent").append("<li id='"+treeNode.id+"' style='line-height:28px;'>"+"<input type='hidden' value='"+treeNode.file+"'>"+"<span class='icon-folder-close-alt '></span>"+treeNode.name+"<span class='btn' style='margin-left: 12px;padding:0px 2px;' onclick='BackupSee.deleteSecletFile($(this))'>取消</span>"+"</li>");
								}
							}
						}else{
							var isExistence=false;
							$("#leftContent li input").each(function(){
								if($(this).val()==treeNode.file){
									isExistence=true;
								}
							});
							if(!isExistence){
								$("#leftContent").append("<li id='"+treeNode.id+"' style='line-height:28px;'>"+"<input type='hidden' value='"+treeNode.file+"'>"+"<span class='icon-file-alt '></span>"+treeNode.name+"<span class='btn' style='margin-left: 12px;padding:0px 2px;' onclick='BackupSee.deleteSecletFile($(this))'>取消</span>"+"</li>");
							}
						}

					}
				}
			};
			var zNodes =[
				{id:1, pId:0, name:$("#downFromPath").val()=="/"?"root":$("#downFromPath").val(),file:$("#downFromPath").val(), open:false,isParent:true}
			];
			var t = $("#tree");
			t = $.fn.zTree.init(t, setting, zNodes);
			$("#downFromPath").change(function(){
				$("#leftContent").empty();
				$.fn.zTree.destroy("tree");
				$.fn.zTree.init($("#tree"), setting, [{id:1, pId:0, name:$("#downFromPath").val()=="/"?"root":$("#downFromPath").val(),file:$("#downFromPath").val(), open:false,isParent:true}
				]);
			});
			/*demoIframe = $("#testIframe");
			 demoIframe.bind("load", loadReady);*/
			//var zTree = $.fn.zTree.getZTreeObj("tree");
			//zTree.selectNode(zTree.getNodeByParam("id", 101));
		});
		/*if (!desktopDistribution.ContextMenuTree) {
		 desktopDistribution.ContextMenuTree = new ContextMenuCloud({
		 container : "#leftmenu",
		 beforeShow : function(tr) {
		 },
		 afterShow : function(tr) {
		 },
		 onAction : function(action) {
		 desktopDistribution._invokeAction(action);
		 },
		 trigger : "#leftContent"
		 });
		 console.info(desktopDistribution.ContextMenuTree);
		 } else {
		 desktopDistribution.ContextMenuTree.reset();
		 }*/
		$("#download").modal("show");
		$("#makeDownUrl").unbind().bind("click",function(){
			if($("#leftContent input").length==0){
				$.growlUI(Dict.val("common_tip"), "请选择下载文件");
				return;
			}
			var backup_file="";
			for(var i=0;i<$("#leftContent").find("input[type='hidden']").length;i++){
				if(i==0){
					backup_file+="\""+$("#leftContent").find("input[type='hidden']").eq(i).val()+"\"";
				}else{
					backup_file+="|"+"\""+$("#leftContent").find("input[type='hidden']").eq(i).val()+"\"";
				}
			};
			BackupSee.downloadCloudBackukFile($("#downBackupType").attr("data-value"),$("#down_Restore_id").val(),"\""+$("#downFromPath").val()+"\"",backup_file,$("#downbackUpTimes").val());
			return;
		});
	},
	restoreSystem:function(){
		$("#ip_Restore").val($("#private_network_instanceTable tr").find("input[type='checkbox']:checked").parents("tr").attr("instanceip"));
		$("#ip_Restore_id").val($("#private_network_instanceTable tr").find("input[type='checkbox']:checked").parents("tr").attr("instanceid"));
		$("#backUpTimes").val($("#private_network_instanceTable tr").find("input[type='checkbox']:checked").parents("tr").attr("backupset_date"));
		var originalTime=$("#private_network_instanceTable tr").find("input[type='checkbox']:checked").parents("tr").attr("backupset_date")
		//var times_type=originalTime.slice(0,4)+"-"+originalTime.slice(4,6)+"-"+originalTime.slice(6,8)+" "+originalTime.slice(8,10)+":"+originalTime.slice(10,12)+":"+originalTime.slice(12,14);
		$("#backUpTimes_type").val(originalTime);
		$("#ip_Restore_name").val($("#private_network_instanceTable tr").find("input[type='checkbox']:checked").parents("tr").attr("networkId"));
		$("#ip_Restore_name_name").val($("#private_network_instanceTable tr").find("input[type='checkbox']:checked").parents("tr").attr("vmName"));
		var oldBackUpPath=$("#private_network_instanceTable tr").find("input[type='checkbox']:checked").parents("tr").attr("filePath").split("\"|\"");
		$("#oldBackUpPath").empty();
		for(var i=0;i<oldBackUpPath.length;i++){
			if(i==0){
				oldBackUpPath[i]=oldBackUpPath[i].slice(1);
			};
			if(i==oldBackUpPath.length-1){
				oldBackUpPath[i]=oldBackUpPath[i].slice(0,oldBackUpPath[i].length-1);
			};
			if(oldBackUpPath[i]=="/"){
				$("<option "+ "value=\"" + oldBackUpPath[i] + "\" >" +"root"+ "</option>").appendTo($("#oldBackUpPath"));
			}else{
				$("<option "+ "value=\"" + oldBackUpPath[i] + "\" >" +oldBackUpPath[i]+ "</option>").appendTo($("#oldBackUpPath"));
			}
		};
		$("#oldBackUpChildPath").val($("#oldBackUpPath").val());
		$("#oldBackUpPath").unbind().bind("change",function() {
			$("#oldBackUpChildPath").val($("#oldBackUpPath").val());
			//var times=$("#backUpTimes").val().slice(0,4)+"-"+$("#backUpTimes").val().slice(4,6)+"-"+$("#backUpTimes").val().slice(6,8)+"-"+$("#backUpTimes").val().slice(8,10)+"-"+$("#backUpTimes").val().slice(10,12)+"-"+$("#backUpTimes").val().slice(12,14);
			var requestBody={
				"type":"sysbackupers",
				"params":{
					"backuptask_id":$("#ip_Restore_id").val(),
					"backup_disk": "\""+$("#oldBackUpPath").val()+"\"",
					"backup_path": "\""+$("#oldBackUpChildPath").val()+"\"",
					"backup_date":$("#backUpTimes").val()
				}
			};
			com.skyform.service.backupCloudService.listCloudBackukFile(requestBody,function(result){
					$("#oldFile").empty();
					$("#restoreFile").empty();
					for(var i=0;i<result.files.length;i++){
						var oldBackUpChildPath=$("#oldBackUpChildPath").val();
						if(result.files[i][result.files[i].length-1]=="/"){
							var screenString="";
							for(var j=0;j<result.files[i].length-1;j++){
								screenString+=result.files[i][j];
							};
							$("<li><label class='checkbox'><input type='checkbox' value=\""+oldBackUpChildPath+"/"+screenString+"\"><span class='icon-folder-close-alt'></span><span>"+screenString+"</span></label></li>").appendTo($("#oldFile"));
						}else{
							$("<li><label class='checkbox'><input type='checkbox' value=\""+oldBackUpChildPath+"/"+result.files[i]+"\"><span class='icon-file-alt'></span><span>"+result.files[i]+"</span></label></li>").appendTo($("#oldFile"));
						}

					}
					//$(result.files).each(function(index, item){
					//	$("<li><label class='checkbox'><input type='checkbox' value=\""+item+"\"><span>"+item+"</span></label></li>").appendTo($("#oldFile"));
					//})
				},
				function(error){console.log(error);$.growlUI(Dict.val("common_tip"), error);});
		});
		$("#oldBackUpPath").change();
		BackupSee.showTargetOsList();
		if (BackupSee.wizard == null) {
			BackupSee.wizard = new com.skyform.component.Wizard("#wizard-createVM_restore");
			BackupSee.wizard.onLeaveStep = function(from, to) {
				if(0==to){
					$("#areaNameId_restore").val("文件备份");
				}
				if(1 == to){
					//console.log(1);
					/*BackupSee.showTargetOsList();*/
				}
				if(2 == to){
					$("#oldYunId").empty().val($("#ip_Restore_name").val());
					$("#oldYunId_name").empty().val($("#ip_Restore_name_name").val());
					$("#oldYunIp").empty().val($("#ip_Restore").val());
					$("#SeleckedOldPath").empty().val($("#oldBackUpPath").val());
					$("#SeleckedOldPathchild").empty().val($("#oldBackUpChildPath").val());
					$("#checkFile").empty().html($("#restoreFile").html());
					$("#targetYunId").empty().val($("#TargetRestoreId").val());
					$("#targetYunId_name").empty().val($("#TargetRestoreId_name").val());
					$("#targetYunIp").empty().val($("#TargetIp").val());
					$("#SeleckedtargetPath").empty().val($("#targetFile").val());
				}
			};
			BackupSee.wizard.onToStep = function(from, to) {
				if(0 == from){
					//var min = $("div#ostemplates div.selected>span:first").attr("mindisk");
				}
				if(0 < from){
					//VM.getFee();
				}
			};
			BackupSee.wizard.onFinish = function(from, to) {
				BackupSee.submit();
			};
		}
		BackupSee.wizard.markSubmitSuccess();
		BackupSee.wizard.reset();
		BackupSee.wizard.render(function onShow(){
			//console.log("I ' m showing...");
		})
		BackupSee.wizard.render(function(){
			/*if (VM._generateContent_tmp)
			 {
			 FireWallCfg.reset();
			 FireWallCfg._generateContent = VM._generateContent_tmp;
			 }*/
			//FireWallCfg.init();
		});

	},
	cloudBackukFileDetails:function(path){
		var requestBody={
			"type":"sysbackuper",
			"params":{
				"backuptask_id": $("#ip_Restore_id").val(),
				"backup_disk":path
			}
		};
		com.skyform.service.backupCloudService.cloudBackukFileDetails(requestBody,function(result){
			//console.log(result);
				$("#backUpRestore_path").val(result.filedir.join("-"))
			},
			function(error){console.log(error);$.growlUI(Dict.val("common_tip"), error);});
	},
	fileToLeft:function(){
		$("#restoreFile").find("input[type='checkbox']:checked").parents("li").appendTo($("#oldFile"));
		//$("#restoreFile").remove($("#restoreFile").find("input[type='checkbox']:checked").parents("li"));
	},
	fileToRight:function(){
		$("#oldFile").find("input[type='checkbox']:checked").parents("li").appendTo($("#restoreFile"));
		$("#restoreFileMsg").html("");
		//$("#oldFile").remove($("#oldFile").find("input[type='checkbox']:checked").parents("li"));
	},
	browseOldPath : function(browseSpan){
		//var backUp_Path=$("#private_network_instanceTable tr").find("input[type='checkbox']:checked").parents("tr").find("td:eq(4)").html();
		//var thisPathInput=browseSpan.parents('div').find('input:eq(0)');
		var selectPath;
		$('#oldBackUppathTreeCon').show();
		var zTree;
		//var demoIframe;
		var setting = {
			view: {
				dblClickExpand: false,
				showLine: true,
				selectedMulti: false
			},
			data: {
				simpleData: {
					enable:true,
					idKey: "id",
					pIdKey: "pId",
					rootPId: ""
				}
			},
			callback: {
				beforeClick: function(treeId, treeNode) {
					var zTree = $.fn.zTree.getZTreeObj("oldBackUppathTree");
					if (treeNode.isParent) {
						var nodes = treeNode.children;
						var newNodes=[];
						//BackupSee.listCloudBackukFile(treeNode.file);
						//var times=$("#backUpTimes").val().slice(0,4)+"-"+$("#backUpTimes").val().slice(4,6)+"-"+$("#backUpTimes").val().slice(6,8)+"-"+$("#backUpTimes").val().slice(8,10)+"-"+$("#backUpTimes").val().slice(10,12)+"-"+$("#backUpTimes").val().slice(12,14);
						BackupSee.listCloudBackukFile("sysbackupers",$("#ip_Restore_id").val(),$("#oldBackUpPath").val(),treeNode.file,$("#backUpTimes").val());
						if(BackupSee.BackukFilelist.length!=0){
							for(i=0;i<BackupSee.BackukFilelist.length;i++){
								if(treeNode.file=="/"){//根目录
									if(BackupSee.BackukFilelist[i][BackupSee.BackukFilelist[i].length-1]=="/"){
										var TemporaryStorage="";
										for(var j=0;j<BackupSee.BackukFilelist[i].length-1;j++){
											TemporaryStorage+=BackupSee.BackukFilelist[i][j];
										};
										newNodes.push({name:TemporaryStorage, file:TemporaryStorage,open:false,isParent:true});
									}else{
										//newNodes.push({name:BackupSee.BackukFilelist[i], file:BackupSee.BackukFilelist[i],isParent:false});
									}
								}else{//不是根目录
									if(BackupSee.BackukFilelist[i][BackupSee.BackukFilelist[i].length-1]=="/"){
										var TemporaryStorage="";
										for(var j=0;j<BackupSee.BackukFilelist[i].length-1;j++){
											TemporaryStorage+=BackupSee.BackukFilelist[i][j];
										};
										newNodes.push({name:TemporaryStorage, file:treeNode.file+"/"+TemporaryStorage,open:false,isParent:true});
									}else{
										//newNodes.push({name:BackupSee.BackukFilelist[i], file:treeNode.file+BackupSee.BackukFilelist[i],isParent:false});
									}
								}
							}
							//newNodes = zTree.addNodes(treeNode, newNodes);
							if(nodes){
								//zTree.addNodes(treeNode, {});
								zTree.expandNode(treeNode);
								return true;
							}else{
								zTree.addNodes(treeNode, newNodes);
							}
							return true;
						}else{

						}

					} else {
						/*demoIframe.attr("src",treeNode.file + ".html");*/
						return true;
					}
				},
				onClick :function(event, treeId, treeNode){
					selectPath=treeNode.file;
					//thisPathInput.val(treeNode.file);
				}
			}
		};
		var zNodes =[{id:1, pId:0, name:$("#oldBackUpPath").val(), file:$("#oldBackUpPath").val(),open:false,isParent:true}];
		var t = $("#oldBackUppathTree");
		t = $.fn.zTree.init(t, setting, zNodes);
		$("#browsePath .modal-body").css("width","280px");
		//$("#browsePath").setTop(100);
		$("#oldBackUppathSave").click(function(){
			//thisPathInput.val(selectPath);console.log(selectPath);
			$("#oldBackUpChildPath").val(selectPath);
			$('#oldBackUppathTreeCon').hide();
			//setTimeout(function(){$("#oldBackUpPath").change()},500)
			var requestBody_={
				"type":"sysbackupers",
				"params":{
					"backuptask_id":$("#ip_Restore_id").val(),
					"backup_disk": "\""+$("#oldBackUpPath").val()+"\"",
					"backup_path": "\""+$("#oldBackUpChildPath").val()+"\"",
					"backup_date":$("#backUpTimes").val()
				}
			};
			com.skyform.service.backupCloudService.listCloudBackukFile(requestBody_,function(result){
					$("#oldFile").empty();
					$("#restoreFile").empty();
					for(var i=0;i<result.files.length;i++){
						var oldBackUpChildPath=$("#oldBackUpChildPath").val();
						if(result.files[i][result.files[i].length-1]=="/"){
							var screenString="";
							for(var j=0;j<result.files[i].length-1;j++){
								screenString+=result.files[i][j];
							};
							$("<li><label class='checkbox'><input type='checkbox' value=\""+oldBackUpChildPath+"/"+screenString+"\"><span class='icon-folder-close-alt'></span><span>"+screenString+"</span></label></li>").appendTo($("#oldFile"));
						}else{
							$("<li><label class='checkbox'><input type='checkbox' value=\""+oldBackUpChildPath+"/"+result.files[i]+"\"><span class='icon-file-alt'></span><span>"+result.files[i]+"</span></label></li>").appendTo($("#oldFile"));
						}

					}
				},
				function(error){console.log(error);$.growlUI(Dict.val("common_tip"), error);});
		});
		$("#oldBackUppathCancle").click(function(){
			$('#oldBackUppathTreeCon').hide();
		});
	},
	showTargetOsList:function(){
		$("#tbody_restore tbody").empty();
		if(BackupSee.datatable_restore) {
			BackupSee.datatable_restore.updateData(BackupCloud.instancesSelect);
		} else{
			BackupSee.datatable_restore=new com.skyform.component.DataTable();
			BackupSee.datatable_restore.renderByData(
				"#tbody_restore",// 要渲染的table所在的jQuery选择器
				{
					"data" : BackupCloud.instancesSelect, // 要渲染的数据选择器
					"pageSize" : 5,
					"onColumnRender" : function(columnIndex,columnMetaData, columnData) {
						var text = '';
						if(columnMetaData.name=='id1') {
							return '<input type="radio" name="restore" id="' + columnData.id + '" value="'+columnData.id+'">';
						} else if ("ID1" == columnMetaData.name) {
							return columnData.id;
						} else if ("instanceName1" == columnMetaData.name) {
							if(null!=columnData.uuid&&""!=columnData.uuid){
								text = '<a  href="monitor.jsp?code=monitor&vmId='+columnData.uuid+'&vmName='+encodeURI(encodeURI(columnData.instanceName))+'" >'+columnData.instanceName+'</a>'
								+BackupCloud.getWorkOrderUrl(columnData);
							}
							else

								text = (columnData.vmName.length>15?"<span title='"+columnData.vmName+"'>"+columnData.vmName.slice(0,15)+"..."+"</span>":columnData.vmName)+BackupCloud.getWorkOrderUrl(columnData);
							return text;
						} else if ("state1" == columnMetaData.name) {
							return com.skyform.service.StateService.getState("vm",columnData.state||columnData);
						} else if ("createDate1" == columnMetaData.name) {
							try {
								var obj = eval('(' + "{Date: new Date("
								+ columnData.createDate + ")}"
								+ ')');
								var dateValue = obj["Date"];
								text = dateValue
									.format('yyyy-MM-dd hh:mm:ss');
							} catch (e) {

							}
							return text;
						}
						return columnData[columnMetaData.name];
					},

//					{"message":"success","data":[{"vmPrice":1,"mem":"0.5","state":"opening","expireDate":1412493362000,"productId":101,"createDate":1409901362000,"cpu":"1","instanceName":"VM_67786912","disk":"50","osId":"1","id":67786912,"ip":" ","period":1,"os":"Cetnos6.4-x86_64"},{"vmPrice":1,"mem":"0.5","state":"opening","expireDate":1412476682000,"productId":101,"createDate":1409884682000,"cpu":"1","instanceName":"VM_67784939","disk":"50","osId":"1","id":67784939,"ip":" ","period":1,"os":"Cetnos6.4-x86_64"}],"code":0}
					"afterRowRender" : function(rowIndex, data, tr) {

						tr.attr("id",data.vmId);
						tr.attr("uuid",data.uuid);
						tr.attr("name",data.vmName);
						tr.attr("ip",data.ip);
						tr.attr("state",data.state);
						tr.attr("instanceId",data.vmId);
						tr.attr("networkId",data.networkId);
						tr.attr("createDate",data.createDate);

						tr.attr("disk",data.disk);


						//BackupCloud.bindEventForTr(rowIndex, data, tr);
						BackupSee.bindEventForTr(rowIndex, data, tr);
					},
					"afterTableRender" : function() {
						BackupCloud.bindEvent();

						var firstRow = $("#tbody_restore tbody").find("tr:eq(0)");
						$("#tbody_restore input[type='radio']:eq(0)").click();
						$("#TargetIp").val($("#tbody_restore input[type='radio']:checked").parents("tr").attr("ip"));
						$("#TargetRestoreId").val($("#tbody_restore input[type='radio']:checked").parents("tr").attr("networkId"));
						$("#TargetRestoreId_name").val($("#tbody_restore input[type='radio']:checked").parents("tr").attr("name"));
						var	instanceId = firstRow.attr("instanceId");
						//var instance = BackupCloud.getInstanceInfoById(instanceId);
						//BackupCloud.backupCloudData.vmId=instanceId;
						//BackupCloud.backupCloudData.vmName=firstRow.attr("name");
						//BackupCloud.backupCloudData.networkId=firstRow.attr("networkid");
						//firstRow.css("background-color","#BCBCBC");
						//BackupCloud.setSelectRowBackgroundColor(firstRow);
//						}
					}

				});
		};

		//$("#tbody_restore tbody tr").unbind().click(function(e){
		//	e.stopPropagation();
		//	//$(this).find("input:eq(0)").click();
		//	console.log($(this));
		//	$("#TargetIp").val($("#tbody_restore input[type='radio']:checked").parents("tr").attr("ip"));
		//})
	},
	bindEventForTr:function(rowIndex, data, tr){
		$(tr).unbind().mousedown(
			function(e) {
				tr.find("input[type='radio']").attr("checked", true);
				$("#TargetIp").val($("#tbody_restore input[type='radio']:checked").parents("tr").attr("ip"));
				$("#TargetRestoreId").val($("#tbody_restore input[type='radio']:checked").parents("tr").attr("networkId"));
				$("#TargetRestoreId_name").val($("#tbody_restore input[type='radio']:checked").parents("tr").attr("name"));
				$("#tbody_restore tr").css("background-color","");
				$(tr).css("background-color","#d9f5ff")
			})
	},
	ResourceTree : function(path){
		var params={
				"networkId":$("#tbody_restore input[type='radio']:checked").parents("tr").attr("networkid")||"",
				"params":{
					"vm_ipaddr":$("#tbody_restore input[type='radio']:checked").parents("tr").attr("ip"),
					"filedir":path
				}
			}
		//var params={
		//	"networkId":"15749211",
		//	"params":{
		//		"vm_ipaddr":"192.168.3.14",
		//		"filedir":path
		//	}
		//};
		com.skyform.service.backupCloudService.backupListResource(params,function(result){$("#targethouTaiBackPath").val(result.filedir.join("?--?"))},function(error){console.log(error);$.growlUI(Dict.val("common_tip"), error);});
	},
	browsePath : function(browseSpan){
		$("#targetFileMsg").html("");
		var thisPathInput=browseSpan.parents('div').find('input:eq(0)');
		var selectPath;
		//BackupCreate.ResourceTree("/");
		//var backUpPath=$("#houTaiBackPath").val().split("-");
		//var backUpPath_=[];
		//	for(var i=0;i<backUpPath.length;i++){
		//
		//		backUpPath_.push({id:i, pId:0, name:backUpPath[i], file:"/"+backUpPath[i],open:false,isParent:true});
		//	};
		//console.log(backUpPath_);

		$('#targetbrowsePath').show();
		var zTree;
		//var demoIframe;
		var setting = {
			view: {
				dblClickExpand: false,
				showLine: true,
				selectedMulti: false
			},
			data: {
				simpleData: {
					enable:true,
					idKey: "id",
					pIdKey: "pId",
					rootPId: ""
				}
			},
			callback: {
				beforeClick: function(treeId, treeNode) {
					var zTree = $.fn.zTree.getZTreeObj("targetpathTree");
					if (treeNode.isParent) {
						//zTree.expandNode(treeNode);父节点点击是否打开子节点
						var nodes = treeNode.children;//console.log(nodes);
						//var newNodes = [{name:"newNode1"}, {name:"newNode2"}, {name:"newNode3"}];
						var newNodes=[];
						BackupSee.ResourceTree(treeNode.file);
						var pathArray=$("#targethouTaiBackPath").val().split("?--?");
						if($("#targethouTaiBackPath").val()!=""){
							for(i=0;i<pathArray.length;i++){
								if(treeNode.file=="/"){
									newNodes.push({name:pathArray[i], file:treeNode.file+pathArray[i],open:false,isParent:true})
								}else{
									newNodes.push({name:pathArray[i], file:treeNode.file+"/"+pathArray[i],open:false,isParent:true})
								}
							}
							//newNodes = zTree.addNodes(treeNode, newNodes);
							if(nodes){
								//zTree.addNodes(treeNode, {});
								zTree.expandNode(treeNode);
								return true;
							}else{
								zTree.addNodes(treeNode, newNodes);
							}
							return true;
						}else{

						}

					} else {
						/*demoIframe.attr("src",treeNode.file + ".html");*/
						return true;
					}
				},
				onClick :function(event, treeId, treeNode){
					selectPath=treeNode.file;
					//thisPathInput.val(treeNode.file);
				}
			}
		};
		var zNodes =[{id:1, pId:0, name:"root", file:"/",open:false,isParent:true}];
		var t = $("#targetpathTree");
		t = $.fn.zTree.init(t, setting, zNodes);
		/*if (!desktopDistribution.ContextMenuTree) {
		 desktopDistribution.ContextMenuTree = new ContextMenuCloud({
		 container : "#leftmenu",
		 beforeShow : function(tr) {
		 },
		 afterShow : function(tr) {
		 },
		 onAction : function(action) {
		 desktopDistribution._invokeAction(action);
		 },
		 trigger : "#leftContent"
		 });
		 console.info(desktopDistribution.ContextMenuTree);
		 } else {
		 desktopDistribution.ContextMenuTree.reset();
		 }*/
		//$("#browsePath").modal("show");
		$("#browsePath .modal-body").css("width","280px");
		//$("#browsePath").setTop(100);
		$("#targetpathSave").click(function(){
			thisPathInput.val(selectPath);
			$('#targetbrowsePath').hide();
			//$("#contentbackup").change();
		});
		$("#targetpathCancle").click(function(){
			$('#targetbrowsePath').hide();

		});
	},
	submit:function(){
		//VM.createVMPost(VM.wizard);
		var backup_file="";
		for(var i=0;i<$("#checkFile").find("input").length;i++){
			if(i==0){
				backup_file="\""+$("#checkFile").find("input").eq(i).val()+"\"";
			}else{
				backup_file+="|"+"\""+$("#checkFile").find("input").eq(i).val()+"\"";
			};
		};
		//console.log(backup_file);
		var requestBody={
			"params":{
				"backuptask_id": $("#ip_Restore_id").val(),
				"backup_disk": "\""+$("#SeleckedOldPath").val()+"\"",
				"backup_path": "\""+$("#SeleckedtargetPath").val()+"\"",
				"backup_file": backup_file,
				"backup_date": $("#backUpTimes").val(),
				"network_id": $("#targetYunId").val(),
				"dst_host": $("#targetYunIp").val(),
				"vm_id": $("#oldYunId").val(),
				"backupset_id":BackupSee.selectedInstancebackupset_id
			}
		};
		//console.log(requestBody);
		com.skyform.service.backupCloudService.rollbackCloudBackup(requestBody,function(result){
				//console.log(result);
				BackupSee.wizard.markSubmitSuccess();
				BackupSee.wizard.close();
				$.growlUI(Dict.val("common_tip"), "还原申请已提交");
				BackupSee.refreshData();

			},
			function(error){
				//console.log(error);
				$.growlUI(Dict.val("common_tip"), error);
				BackupSee.wizard.markSubmitError();
				BackupSee.wizard.close();
			});
	}

};
function checkOldInfo(){
	var result = {status : true};
	if($("#restoreFile li").length<=0){
		result.status = false;
		$("#restoreFileMsg").html("请选择还原文件")
	};
	return result;
};
function checkTargetInfo(){
	var result = {status : true};
	if($("#targetFile").val()==""){
		result.status = false;
		$("#targetFileMsg").html("请选择还原目录");
	};
	return result;
};