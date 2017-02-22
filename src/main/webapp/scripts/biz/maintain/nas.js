window.currentInstanceType='nas';
window.currentInstanceType4autobuckup='nasAutoBackup';

var timernas = null;

var AutoUpdater_nas2 = {
		updaters : {
			"nas" : {
//				cache : [],								// 之前缓存的数据
//				instances : [],							// 当前获取的最新的数据
//				isNeedUpdate : function(instance){
//					var oldInstance = this.cache["" + instance.id];
//					if(!oldInstance) return true;
//					if(oldInstance.state != instance.state) return true;		// 当实例状态发生变化时更新数据
//					
//					if(oldInstance.optState != instance.optState) return true;	// 当操作状态发声变化时，告诉需要更新数据
//					return false;
//				}
			}
		},
		startNas : function(){
			var updater = AutoUpdater_nas2.updaters["" + currentInstanceType];
			if (updater) {
				updater.getInterval = updater.getInterval || function() {
					return 30 * 1000;
				};
				timernas = window.setInterval(function(){
					var showCreateNasBtn = false;
					//如果用户申请过了存在running状态的实例
					var _hass3user = nas.hasS3User();
					if(_hass3user){  //用户在s3上已经存在
						showCreateNasBtn = true;
					}							
					if (showCreateNasBtn) {
						$("#createNasUser").addClass("disabled");						
						$("#createNasVolume").removeClass("disabled");
						$("#queryBackup").removeClass("disabled");
						$("#queryBackup").attr("disabled",false);	
					}else{
						$("#createNasUser").removeClass("disabled");
						$("#createNasVolume").addClass("disabled");
						$("#queryBackup").addClass("disabled");
						$("#queryBackup").attr("disabled",true);
					}					
				}, updater.getInterval());
			}
		},
		stopNas : function(){
			window.clearInterval(timernas);
		}
};

window.Controller = {
		init : function(){
//			if(!window.domain)
			nas.getDomainForNas()
			nas.init();
			// 查询虚拟硬盘列表
			nas.describeNasVolumes();
			authIp4linux.init();
			
		},
		refresh : function(){
				nas.updateDataTable();	
				nas.showOrHideCreateNas();			
		}
	};


//$(function() {	
//	nas.init();
//	// 查询虚拟硬盘列表
//	nas.describeNasVolumes();
//	authIp4linux.init();
//});

var product = {};
var product4autobuckup = {};
var nas = {
		datatable : new com.skyform.component.DataTable(),
		confirmModal : null,
		confirmModal_detach : null,
		instances : [],
		instancesTask : [],
		data_id:null,
		lastCheckedArr:null,
		domain : {},
		folderNamePerfix : null,
		service : com.skyform.service.NasService4yaxin,
		obsService4yaxin : com.skyform.service.ObsService4yaxin,
		defPool:"",
		init : function() {
			var resourcePools_all = $("#resourcePools").val();
			var currentPool = $("#currentPool").val();
			var account = $("#account").val();
			$("#week_sel").hide();
			//使用产品id
			nas.queryProductPrtyInfo4backupauto();
			//弹性块计费类型
			nas.queryProductPrtyInfo(4);
			nas.bindEvent();			
			//更多操作...中的下拉菜单添加监听事件
			var inMenu = false;
			$(".dropdown-menu").bind('mouseover',function(){
				inMenu = true;
			});		
			$(".dropdown-menu").bind('mouseout',function(){
				inMenu = false;
			});
			$("#dropdown li").bind('click',function(e){
				$("#dropdown-menu").hide();
				// 如果选项是灰色不可用的
				if (!$(this).hasClass("disabled")) {
					nas.onOptionSelected($(this).index());
				}
			});	
						
			nas.folderNamePrefix = $("#allCatalogueNamePrefix").val();
			$("#catalogueName").bind("blur",function(e){
				$("#tipCatalogueName").text("");
				e.preventDefault(); // 阻止表单按Enter键默认行为，防止按回车键提交表单
				var _fold = $("#catalogueName").val();
				var _fullname = nas.folderNamePrefix+_fold;
				$("#allCatalogueName").val(_fullname);
			});
			
			
			//为table的右键菜单添加监听事件
			$("#contextMenu").bind('mouseover',function(){
				inMenu = true;
			});		
			$("#contextMenu").bind('mouseout',function(){
				inMenu = false;
			});
			
			$("#contextMenu li").bind('click',function(e){
				$("#contextMenu").hide();
				// 如果选项是灰色不可用的
				if (!$(this).hasClass("disabled")) {
					nas.onOptionSelected($(this).index(),resourcePools_all,currentPool);					
				}
			});
			$("body").bind('mousedown',function(){
				if(!inMenu){
					$("#contextMenu").hide();
				}
			});
			
			$("#createNasUser").unbind("click").bind("click", function() {
				if($("#createNasUser").hasClass("disabled"))return;
				nas.service.createEmpowerUser({},function onSuccess(data){
					nas.showOrHideCreateNas();
					nas.updateDataTable();
					$.growlUI(Dict.val("common_tip"), Dict.val("nas_create_submit_success")); 
				},function onError(msg){
					$.growlUI(Dict.val("common_tip"), Dict.val("nas_create_submit_error") + msg); 
				});				
			});
			
			// 新建虚拟硬盘
			$("#btnCreateNasVolume").click(nas.createNasVolume);
						
			
			//点击IP授权按钮
			$("#attachVm").bind('click',function(e){
				if($("#attachVm").hasClass("disabled"))return;
				nas.onOptionSelected(1);				
			});	
			//点击删除按钮
			$("#delete").bind('click',function(e){
				if($("#delete").hasClass("disabled"))return;
				nas.onOptionSelected(2);				
			});	
			$("#resetPassword").bind('click',function(e){
				if($("#resetPassword").hasClass("disabled"))return;
				nas.onOptionSelected(6);				
			});		
			$("#reset_password").bind('click',function(e){
				nas._restPassword();				
			});		
			$("#queryBackup").bind('click',function(e){
				nas.onOptionSelected(4);				
			});
			//点击设置备份的保存按钮
			$("#backup_save").bind("click", function(e) {
				nas.onOptionSelected(5,null,null,account);
			});
			$("#backup").bind("click",function(e){
				nas.onOptionSelected(3,resourcePools_all,currentPool);
			});	
			$("#ckb_open .switch").on('switch-change',function(e,data){
				var checked = $("#ckb_open .switch input[type='checkbox']").attr("checked");
				if(checked){
					nas.enableRemoteDiv();
				}else{
					nas.disableRemoteDiv();
				}
			});
			$("#resPool").change(function() {
				nas.changePool(this);
			});
			$("#day_week_sel").change(function(){
				var type = $("#day_week_sel").val();
				if(type == "day"){
					$("#week_sel").attr("style","display:none;");
				}else if(type == "week"){
					$("#week_sel").attr("style","display:inline;width:100px;");
				}
			});
			//根据存储上是否开通nas账户来控制创建目录按钮
			nas.showOrHideCreateNas();
			//根据资源池隐藏 灾备按钮
			var booleanPool =(-1!=nas.defPool.indexOf(CommonEnum.currentPool));
			if(!booleanPool){
				$("#backup").attr("style","display:none");
				//$("#backup4auto").attr("style","display:none");
				$("#queryBackup").attr("style","display:none");
			}
		},
		getDomainForNas : function(){
			com.skyform.service.NasService4yaxin.getDomainForNas(function(result){
				var data = result;
				$.each(data,function(index,item){
					nas.domain[item.resourcePool] = item.domainName;
				})
				$("#domain").text(nas.domain[$("#pool").val()]+".wocloud.cn");
			});
		},
		_restPassword : function(){
			var pass = $("#resetpass").val();
			var params = {
				     "password" : pass
			};		
			$("#resetPasswordModal").modal("hide");	
			nas.service.resetPassword(params,function onSuccess(data){			
				$.growlUI(Dict.val("common_tip"), Dict.val("nas_modify_password_success")); 
			},function onError(msg){
				$.growlUI(Dict.val("common_tip"), Dict.val("nas_modify_password_error")+msg);
			});				
			
		},
		disableRemoteDiv : function(){
			//$("#ckb_open").attr("checked",false);
			var _childs = $("#backupContent").children();
			$(_childs).each(function(index, item) {
				$(item).find("select").attr("disabled",true);
//				$(item).find("input").attr("disabled",true);
			});											
		},
		enableRemoteDiv : function(){
			//$("#ckb_open").attr("checked",true);
			var _childs = $("#backupContent").children();
			$(_childs).each(function(index, item) {
				if(nas.instancesTask.length == 1){
					$("#resPool").attr("disabled","desabled");
				}
				$(item).find("select").attr("disabled",false);
//				$(item).find("input").attr("disabled",false);
			});						
		},
		showOrHideCreateNas : function(){
			var showCreateNasBtn = false;
			//如果用户申请过了存在running状态的实例
			var _hass3user = nas.hasS3User();
			if(_hass3user){  //用户在s3上已经存在
				showCreateNasBtn = true;
			}							
			if (showCreateNasBtn) {
				$("#createNasUser").addClass("disabled");				
				$("#createNasVolume").removeClass("disabled");
				$("#resetPassword").removeClass("disabled");
			}else{
				$("#createNasUser").removeClass("disabled");
				$("#createNasUser").show();
				//用户暂停时all bucket按钮不可用
				$("#createNasVolume").addClass("disabled");
				$("#resetPassword").addClass("disabled");
//				AutoUpdater_nas2.startNas();
			}
			//根据资源池隐藏 灾备按钮
			var booleanPool =(-1!=nas.defPool.indexOf(CommonEnum.currentPool));
			if(booleanPool){
				$("#createNasUser").addClass("disabled");
			}
		},
		
		hasS3User : function() {	
			var result = true;
			nas.service.queryS3User(function onSuccess(data){
//				{"msg":"","data":[{"username":"chenjun9_NAS","status":"active","password":"chenjun9_NAS0","secretkey":"BzqNbpp+yf7y5yTaf98YdELrNh74aaRLTOctaR6O","used":"0","created":1395828493000,"allocated":10737418240,"accesskey":"Z2GJ2NT86XKXRRUD4486"}],"code":0}
				var _data = data.data[0];
		        if(_data == null){
		        	result = false;
		        }else{
					if(typeof(_data) == "string" && _data.indexOf("error") >= 0) {
			        	result = false;
				    }else {
				    	if(_data.status=='active'){  //pause
				    	}else{
				    		result = false;
				    		$.growlUI(Dict.val("common_tip"), Dict.val("nas_user_files_are_stored_suspended_state"));
				    	}
					}						        	
		        }
				
			},function onError(msg){	
				result = false;
			});
			return result;
		},
		onOptionSelected : function(index,resourcePools_all,currentPool,account) {
			if(index == 0){
				var oldInstanceName = nas.getCheckedArr().parents("tr").find("td[name='instanceName']").html();
				var valName = [];
				valName = oldInstanceName.split("<a");
				$(valName).each(function(i) {
					var ebsName = valName[0];
					$("#modifyVolumeName").val(ebsName);
				});
				var oldComment = nas.getCheckedArr().parents("tr").attr("comment");
				$("#modifyDiskModal").modal("show");
			} else if(index == 1){
				authIp4linux._resetFromRow();
				authIp4linux.init();
				var id = nas.getCheckedArr().parents("tr").attr("nasid");
				var param = {
						"id"  : id
				};				
				//查询IP授权
				nas.service.descripeEmpowerNas(param,function onSuccess(data){
					if(data.data[0].directory){
						var ips = data.data[0].directory.spare2;	
						if(ips){
							var arr = ips.split(",");					
							$(arr).each(function(i){
								var _ip = arr[i];
								if(_ip != "1.1.1.1"){
									var ips = {
										"ip2auth" : [{
											"ip" : _ip				
										}]
									};
									authIp4linux._addIp(ips.ip2auth);									
								}
							});
						}											
					}
				},function onError(msg){
					$.growlUI(Dict.val("common_tip"), Dict.val("nas_select_IP_authorize_error") + msg); 
				});
				$("#authModal").modal("show");			
			} else if (index == 2) {				
				nas.showDeleteVdiskVolume();
			} else if(index == 6){
				nas.service.queryS3User(function onSuccess(data){
//					{"msg":"","data":[{"username":"chenjun9_NAS","status":"active","password":"chenjun9_NAS0","secretkey":"BzqNbpp+yf7y5yTaf98YdELrNh74aaRLTOctaR6O","used":"0","created":1395828493000,"allocated":10737418240,"accesskey":"Z2GJ2NT86XKXRRUD4486"}],"code":0}
					var _data = data.data[0];
			        if(_data == null){
			        }else{
						if(typeof(_data) == "string" && _data.indexOf("error") >= 0) {
					    }else {
					    	if(_data.status=='active'){  //pause
					    		$("#resetName").html(_data.username);
					    		$("#resetpass").val(_data.password);
					    	}else{
					    	}
						}						        	
			        }				
				},function onError(msg){					
				});				
				$("#resetPasswordModal").modal("show");
			} else if (index == 4) {				
				nas.describeBackup();
			} else if(index == 5){
				var isopen = $("#ckb_open .switch input[type='checkbox']").attr("checked");
				if(isopen){
					nas.createBackupAuto(account);
				}else{
					if(nas.instancesTask[0].status == "running"){
						nas.deleteReplicationTask();
					}else{
						$.growlUI(Dict.val("common_tip"), Dict.val("nas_task_status_ready_state_task"));
					}
				}				
			} else if(index == 3){
				nas.listVolumeRelicationTask(resourcePools_all,currentPool);
				$("#backup4autoModal").modal("show");
			}

		},
		//创建设置自动备份
		createBackupAuto : function(account){
			$("#autobackup_save").attr("disabled",true);
			var id = nas.getCheckedArr().val();	
			var time = "";
			var week = "";
			var allCatalogue ="";
			time = $("#timeofday").val();
			week = $("#week_sel").val();
			allCatalogue = $("#allCatalogue").val();
			var all_CatalogueName = nas.getCheckedArr().parents("tr").find("td[name='allCatalogueName']").html();
			var params = {
					"period":240,
					"count":1,
					"productList":[
							{
								"taskId":"",
								"productId":product4autobuckup.productId,
								"destresourcepoolid":"",
								"type":"fs",
								"srcvolumeid":id,
								"dstvolumeid":"",
								"dayorweek":"",
								"time":time,
//								"week_day":week,
								"remoteornot":"",
								"maxcount":1,
								"serviceType":"1026",
								"verifyFlag":"0"
							}
						]
					};
			
				var respool = $("#resPool").val();
				params.productList[0].destresourcepoolid = respool;
				params.productList[0].remoteornot = "remote";
				params.productList[0].taskId = $("#taskid").val();
				var type = $("#day_week_sel").val();
				if(type == "day"){
					params.productList[0].dayorweek = "day";
				}else if(type == "week"){
					params.productList[0].dayorweek = "week";
					if(week != "" || week != null || week != undefined){
						params.productList[0].week_day = week;
					}
				}
				var lsid = "";
				/////////////如果没有bucket，重新创建新的////////////////
				if(allCatalogue == null || allCatalogue == ""){
					var bucket_all_CatalogueName = "NFS_"+all_CatalogueName;
					//----------------------start影响url访问，目前没用到这个功能暂时注释掉，显示备份到资源池下面已经有的文件存储目录中-----------------------//
					var _user = "";
					var _states = "";
					nas.service.queryNasName(_user,_states,respool,function onSuccess(data){
						$(data).each(function(i,v){
							if(v.allCatalogueName == bucket_all_CatalogueName){
								lsid = v.id;
							}
						});
						if(lsid == null || lsid == ""){
					//-------------------------------end-------------------------//
//							var param = {
//									pool : respool,
//									dirname : bucket_all_CatalogueName,
//									owner : account+"_nas"
//								};
//								Dcp.JqueryUtil.dalinReq("/pr/createNas", param,function (data) {////1111
									var param = {
										"period":1,
										"count":1,
										"dirname":bucket_all_CatalogueName,
										"srcpool":respool,
										"productList":[
											{
												"instanceName" : "",
												"srcPool" : respool,
												"storageSize" : 1024,
												"allCatalogueName" : bucket_all_CatalogueName,//data.directory.id
												"productId":product.productId
											}
										] 
									};			
									nas.service.saveNas(param,function onSuccess(data){
										params.productList[0].dstvolumeid = data.SUBSCRIPTION_ID;
									},function onError(msg){
										$.growlUI(Dict.val("common_tip"), Dict.val("nas_directory_backup_creation_fails")); 
									});
//								});
					//---------------------start影响url访问，同上------------------//
						}else{
							params.productList[0].dstvolumeid = lsid;
						}
					});
					//---------------------start------------------//
				}else{
					params.productList[0].dstvolumeid = lsid;  //如果bucketName输入，就使用输入的bucketName。
				}
				////////////////////////////
			com.skyform.service.VdiskService4yaxin.newOrEditVolumeReplicationTask(params,function onSuccess(data){
				$.growlUI(Dict.val("common_tip"), Dict.val("nas_submit_recovery_service_success")); 
				$("#backup4autoModal").modal("hide");
				$("div option:empty").attr("selected",false);
				$("#week_sel").hide();
				$("#timeofday").val("");
				$("#day_week_sel option[name='day']").attr("selected", true);
				$("#task_status").html(Dict.val("vdisk_no_task"));
				$("#ckb_open").attr("checked",false);
			},function onError(msg){
				$.growlUI(Dict.val("common_tip"), Dict.val("nas_submit_recovery_service_failure")+msg);
				$("#backup4autoModal").modal("hide");
			});

		},
		//关闭自动备份
		deleteReplicationTask : function(subsId){
			var taskid =  $("#taskid").val();
			var params = {
					"taskid":taskid
				};
			com.skyform.service.VdiskService4yaxin.deleteReplicationTask(params,function onSuccess(data){
				$("#backup4autoModal").modal("hide");
				$.growlUI(Dict.val("common_tip"), Dict.val("nas_off_recovery_service_success"));
			},function onError(msg){
				$("#backup4autoModal").modal("hide");
				$.growlUI(Dict.val("common_tip"), Dict.val("nas_off_recovery_service_failure")+msg);
			});
		},
		queryProductPrtyInfo4backupauto :function(){
			com.skyform.service.BillService.queryProductPrtyInfo(0,window.currentInstanceType4autobuckup,function(data){
				product4autobuckup.productId = data.productId;
			});
		},
		changePool: function(newPool){
			var pool = $("#resPool").val();
	    	//nas.allCatalogueNameList(pool);
		},
		allCatalogueNameList : function(resourcePool){	
			  var allCatalogue = $("#allCatalogue");
			  allCatalogue.empty();
			    var _user = "";
				var _states = "";
				nas.service.queryNas(_user,_states,resourcePool,function onSuccess(data){
					$("<option value='' style='width:250px;'>"+Dict.val("common_choose")+"</option>").appendTo(allCatalogue);
					$(data).each(function(i,v){
						if(v.allCatalogueName != undefined){
							$("<option value='"+v.id+"' style='width:250px;'>"+v.allCatalogueName+"</option>").appendTo(allCatalogue);
						}
					});
				},function onError(msg){
					$.growlUI(Dict.val("common_tip"), Dict.val("nas_select_fs_error") + msg); 
				});
		  },
		  nasmuluList : function(resourcePool,dstvolume_id){	
			  var allCatalogue = $("#allCatalogue");
			  allCatalogue.empty();
			    var _user = "";
				var _states = "";
				nas.service.queryNas(_user,_states,resourcePool,function onSuccess(data){
					$("<option value='' style='width:250px;'>"+Dict.val("common_choose")+"</option>").appendTo(allCatalogue);
					$(data).each(function(i,v){
						if(v.allCatalogueName != undefined){
							if(v.id == dstvolume_id){
								$("<option value='"+v.id+"' selected style='width:250px;'>"+v.allCatalogueName+"</option>").appendTo(allCatalogue);
							}else{
								$("<option value='"+v.id+"' style='width:250px;'>"+v.allCatalogueName+"</option>").appendTo(allCatalogue);
							}
						}
					});
				},function onError(msg){
					$.growlUI(Dict.val("common_tip"), Dict.val("nas_select_fs_error") + msg); 
				});
		  },
		  listallResourcePoolTask:function(resourcePools_all,pool_s,currentPool){
			  var resPool = $("#resPool");
			  resPool.empty();
			var pools = [];
				  pools = resourcePools_all.split(",");
					$(pools).each(function(i) {
						if(pools[i] == pool_s){
							$("<option value='"+pools[i]+"'  selected>"+CommonEnums.pools[pools[i]]+"</option>").appendTo("#resPool");
							resPool.attr("disabled","desabled");
						}else{
							if(pools[i] == currentPool){
								//$("<option value='"+pools[i]+"'  selected>"+CommonEnums.pools[pools[i]]+"</option>").appendTo(poolContainer);
							}else{
								$("<option value='"+pools[i]+"'  >"+CommonEnums.pools[pools[i]]+"</option>").appendTo(resPool);
								resPool.attr("disabled","desabled");
							}
							
						}
					});
		  },
		  listallResourcePool:function(resourcePools_all,currentPool){
			  var poolContainer = $("#resPool");
				poolContainer.empty();
				var pools = [];
					  pools = resourcePools_all.split(",");
						$(pools).each(function(i) {
							if(pools[i] == currentPool){
								//$("<option value='"+pools[i]+"'  selected>"+CommonEnums.pools[pools[i]]+"</option>").appendTo(poolContainer);
							}else{
								$("<option value='"+pools[i]+"'  >"+CommonEnums.pools[pools[i]]+"</option>").appendTo(poolContainer);
							}			
						});
		  },
		  listVolumeRelicationTask : function(resourcePools_all,currentPool){
			    $("div option:empty").attr("selected",false);
				$("#week_sel").hide();
				$("#timeofday").val("");
				$("#day_week_sel option[name='day']").attr("selected", true);
				$("#task_status").html(Dict.val("vdisk_no_task"));
			    var id = nas.getCheckedArr().val();
				var params = {
						"volumeid":""+id
				};
				com.skyform.service.VdiskService4yaxin.listVolumeRelicationTask(params,function onSuccess(data){
					nas.instancesTask = data;
					if(data.length == 0){
						$("#day_week_sel option[name='day']").attr("selected", true);
						$("#ckb_open").bootstrapSwitch("setState", false);
						nas.listallResourcePool(resourcePools_all,currentPool);
						var pool = $("#resPool").val();
				    	//nas.allCatalogueNameList(pool);//注释：需求是有文件存储目录的下拉框，现在没有这个需求，先注释掉，因为影响访问/instance/nas/describeNasVolumes?SRC_RES_POOL=
						return;
					}else if(data.length == 1){
						$("#ckb_open").bootstrapSwitch("setState", true);
						var _childs = $("#backupContent").children();
						$(_childs).each(function(index, item) {
							$(item).find("select").attr("disabled",false);
						});
						var pool_s = data[0].destresourcepoolid;
						var dstvolume_id = data[0].dstvolumeid;
						
						//nas.nasmuluList(pool_s,dstvolume_id);//注释：需求是有文件存储目录的下拉框，现在没有这个需求，先注释掉，因为影响访问/instance/nas/describeNasVolumes?SRC_RES_POOL=
						nas.listallResourcePoolTask(resourcePools_all,pool_s,currentPool);
						
						$("#day_week_sel").val(data[0].dayorweek);
						$("#taskid").val(data[0].taskid);
						$("#maxCount").val(data[0].maxcount);
						
						$("#timeofday").val(data[0].time);
						var state = com.skyform.service.StateService.getState("vdisk",data[0].status);
						$("#task_status").html(state);
						if(data[0].dayorweek=="week"){
							$("#week_sel").show();
							$("#week_sel").val(data[0].week_day);
						}else{
							$("#week_sel").hide();
						}
					}
				},function onError(msg){
					$.growlUI(Dict.val("common_tip"), Dict.val("nas_select_disaster_recovery_error")+msg);
				});
			},
		//显示该所属用户下的可用云主机
		describeBackup : function() {
			var nasName = nas.getCheckedArr().parents("tr").find("td[name='allCatalogueName']").html();
			var valName = [];
			valName = nasName.split("<a");
			$(valName).each(function(i) {
				var ebsName = valName[0];
				ebsName = encodeURI(encodeURI(ebsName));  
				window.location = Dcp.getContextPath()+"/jsp/maintain/backup4nas.jsp?ebs="+ebsName+"&code=backup4nas";
			});
		},
		showDeleteVdiskVolume : function() {
			var checkedArr =  nas.getCheckedArr();
			var volumeNames = "";
			var volumeIds = [];
			$(checkedArr).each(function(index, item) {
				var tr = $(item).parents("tr");
				volumeNames += $($("td", tr)[2]).text();
				var id = $("input[type='checkbox']", $("td", tr)[0]).val();
				volumeIds.push(id);
				if (index < checkedArr.length - 1) {
					volumeNames += ",";
				}
			});
			var deleteTip = "";
			if(checkedArr.length==1){
				deleteTip = Dict.val("nas_you_sure_you_want_to_destroy");
			}else{
				deleteTip = Dict.val("nas_you_sure_you_want_to_bulk_destroy");
			}
				nas.confirmModal = new com.skyform.component.Modal(new Date().getTime(),Dict.val("nas_destory_fs"),"<h4>"+deleteTip+"</h4>",{
					buttons : [
						{
							name : Dict.val("common_determine"),
							onClick : function(){
								// 删除虚拟硬盘
								var vdiskVolumeIds = volumeIds.join(",");
								nas.service.destroy(vdiskVolumeIds,function onSuccess(data){
									$.growlUI(Dict.val("common_tip"), Dict.val("nas_destory_app_submit_success_please")); 
									nas.confirmModal.hide();
									// refresh
									nas.updateDataTable();									
								},function onError(msg){
									$.growlUI(Dict.val("common_tip"), Dict.val("nas_destory_app_submit_error") + msg);
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
							name : Dict.val("common_cancel"),
							attrs : [
								{
									name : 'class',
									value : 'btn'
								}
							],
							onClick : function(){
								nas.confirmModal.hide();
							}
						}
					]
				});
			nas.confirmModal.setWidth(500).autoAlign();
			nas.confirmModal.show();
		},
		
		// 创建nas
		createNasVolume : function() {
			var isSubmit = true;
			// 验证
			if(nas.folderNamePrefix==""){
				$("#tipAllCatalogueName").text(Dict.val("nas_your_session_has_expired_please_login_again"));
				isSubmit = false;
			}else{
				$("#tipAllCatalogueName").text("");
			}
			$("#createCount").jqBootstrapValidation();	
		    //同名校验
			var instanceName = $.trim($("#catalogueName").val());	//$.trim($("#createInstanceName").val());	
//			var catalogueName = $.trim($("#catalogueName").val());	
			
			$("#catalogueName").jqBootstrapValidation();
			if ($("#catalogueName").jqBootstrapValidation("hasErrors")) {
				$("#tipCatalogueName").text(Dict.val("nas_directory_name_not_be_empty"));
				isSubmit = false;
			} else {
				$("#tipCatalogueName").text("");
			}
			
			var _name = $("#allCatalogueName").val();
			if (commonUtils.len(_name) > 96) {
				$("#tipAllCatalogueName").text(Dict.val("nas_length_not_exceed_characters"));
				isSubmit = false;
			}else{
				$("#tipAllCatalogueName").text("");
			}
			
			if (!isSubmit) {
				return;
			}

			var count = 1;	
						
			var scoreReg = /^[A-Za-z\-0-9\_]+$/;
	        if(!scoreReg.exec(instanceName)) {
//	            dialog_confirmation('#dialog_confirmation', "模板名称只能包含中文、字母、数字、下划线及连接符");
	            $("#tipCatalogueName").text(Dict.val("nas_directory_name_not_chinese"));
	            isSubmit = false;
	        }else{
				//目录名重名校验
				var param = {
						"id"  : $("#allCatalogueName").val()
				};
				nas.service.descripeEmpowerNas(param,function onSuccess(data){
//					{"msg":"","data":[{"error":"get DirectoryAPI failed."}],"code":0}
					$("#tipCatalogueName").text(Dict.val("nas_directory_name_already_exists_please_re_enter"));
					isSubmit = false;
				},function onError(msg){
					$("#tipCatalogueName").text("");
					
				    com.skyform.service.PortalInstanceService.querySameNameExist(window.currentInstanceType,instanceName,function(isExist){
				    	if(isExist){
				    		$("#tipCreateInstanceName").text(Dict.val("nas_service_name_already_use_please_enter"));
				    		isSubmit = false;
				    	}else{
				    		$("#tipCreateInstanceName").text("");
							$("#feeInput").text(nas.getFee());
							var period = nas.createPeridInput.getValue();
							var peridUnit = $("#peridUnit").html();			
							if(peridUnit == '年'){
								period = period*12;
							}
							//TODO period目前写死1  
							var params = {
									"period":1,
									"count":1,
									"productList":[
										{
											"instanceName" : instanceName,
											"storageSize" : 1024,
											"allCatalogueName" : $("#allCatalogueName").val(),
											"productId":product.productId
										}
									] 
							};			
							$("#createModal").modal("hide");
							nas.service.save(params,function onSuccess(data){				
								//订单提交成功后校验用户余额是否不足
								var _tradeId = data.tradeId;
								var _fee = $("#feeInput").text();
								var createModal = $("#createModal");
								nas.confirmTradeSubmit(_fee,_tradeId,createModal,function onSuccess(data){
									// refresh
									nas.updateDataTable();									
									$.growlUI(Dict.val("common_tip"), Dict.val("nas_create_directory_application_submitted_successfully")); 						
								},function onError(msg){
									$.growlUI(Dict.val("common_tip"), Dict.val("nas_create_directory_application_submitted_successfully_failed_charge"));
									$("#createModal").modal("hide");
								});				
							},function onError(msg){
								$.growlUI(Dict.val("common_tip"), Dict.val("nas_create_directory_applications_filed") + msg); 
							});
				    		
				    	}
				    });
				});	        	
	        }
		},
		confirmTradeSubmit : function(fee,tradeId,createModal,onSuccess,onError){
			var _balance = com.skyform.service.BillService.queryBalance();
			var _remain = parseInt(parseInt(_balance)-parseInt(fee));
			createModal.modal("hide");
			if(_remain<0){
				var confirmModal_balance = new com.skyform.component.Modal(new Date().getTime(),Dict.val("nas_determine_recharge"),Dict.val("nas_do_you_derermine_recjarge"),{
					buttons : [
								{
									name : Dict.val("common_determine"),
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
				var confirmModal_submit = new com.skyform.component.Modal(new Date().getTime(),Dict.val("nas_determine_submit"),Dict.val("nas_do_you_determine_submit"),{
					buttons : [
								{
									name : Dict.val("common_determine"),
									onClick : function(){
										com.skyform.service.BillService.tradeSubmit(tradeId,onSuccess,onError);
										confirmModal_submit.hide();
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
		},		
		// 查询虚拟硬盘列表
		describeNasVolumes : function() {
			//如果没有返回结果 {"msg":"","data":"返回结果为空！","code":0} 明天要问
			var _user = "";
			var _states = "";
			nas.service.listAll(_user,_states,function onSuccess(data){
				nas.instances = data;
				nas.renderDataTable(data);		
			},function onError(msg){
				$.growlUI(Dict.val("common_tip"), Dict.val("nas_select_fs_error") + msg); 
			});
		},
		renderDataTable : function(data) {
			nas.datatable.renderByData("#nasTable", {
					"data" : data,
					"iDisplayLength": 5,
//					"columnDefs" : [
//					     {title : "<input type='checkbox' id='checkAll'>", name : "id"},
//					     {title : "ID", name : "id"},
//					     {title : "名称", name : "instanceName"},
//					     {title : "状态", name : "state"},
//					     {title : "目录全名", name : "allCatalogueName"},
//					     {title : "已使用容量", name : "storageSize"},
//					     {title : "创建时间", name : "createDate"},
//					     {title : "到期时间", name : "expireDate"}					     
//					],
					"onColumnRender" : function(columnIndex, columnMetaData, columnData) {
						 var text = columnData[''+columnMetaData.name] || "";
						 var _used = -1;
						 if(columnMetaData.name == 'id') {
							 text = '<input type="checkbox" value="'+text+'">';
						 }
						 if (columnMetaData.name == "ID") {
//							 text = "<a href='#'>" + text + "</a>";
							 text = columnData.id;
						 }
						 if (columnMetaData.name == "instanceName") {
								 text = columnData.instanceName
								  +"<a title="+Dict.val("common_advice")+" href='../user/workOrder.jsp?code=workOrder&cataCode=service&instanceId="+columnData.id+
								  "&serviceType=nas&instanceName="+encodeURIComponent(columnData.instanceName)+
								  "&instanceStatus="+columnData.state+
								  "&currentPoolW="+encodeURIComponent(CommonEnum.pools[CommonEnum.currentPool])+
								  "'><i class='icon-comments' ></i></a>";
						 }

						 if (columnMetaData.name == "state") {
							 if (columnData.optState == null || columnData.optState == "") {
								 text = com.skyform.service.StateService.getState("vdisk",text);
							 } else {
								 text = com.skyform.service.StateService.getState("vdisk",columnData.optState);
							 }
						 }
						 if (columnMetaData.name == "storageSize") {
							 text = columnData.totalSize-columnData.freeSize;
//								var id = columnData.nasid;															
//								text = nas.getUsed(id);
						 }
						 if (columnMetaData.name == "createDate") {
							 text = new Date(text).format("yyyy-MM-dd hh:mm:ss");
						 }
						 if (columnMetaData.name == "expireDate") {
							 text = new Date(text).format("yyyy-MM-dd hh:mm:ss");
						 }
						 return text;
					}, 
					"afterRowRender" : function(rowIndex, data, tr){
						tr.attr("state", data.state).
						attr("comment", data.comment).
						attr("optState", data.optState);
						tr.attr("ownUserId", data.ownUserId).
						attr("id", data.id). 
						attr("nasid", data.nasid);
						var _title = data.instanceName;
		                var insname = commonUtils.subStr4view(_title, 35, "...");
		                var tal = "<a title="+Dict.val("common_advice")+" href='../user/workOrder.jsp?code=workOrder&cataCode=service&instanceId="+data.id+"&serviceType=nas&instanceName="+encodeURIComponent(data.instanceName)+"&instanceStatus="+data.state+
		                "&currentPoolW="+encodeURIComponent(CommonEnum.pools[CommonEnum.currentPool])+
		                "'><i class='icon-comments' ></i></a>";
		                tr.find("td[name='instanceName']").html(insname+tal);
						tr.find("td[name='instanceName']").attr("title",_title);
						var title = data.allCatalogueName;
						var ca = commonUtils.subStr4view(title, 35, "...");
		                tr.find("td[name='allCatalogueName']").html(ca);
						tr.find("td[name='allCatalogueName']").attr("title",title);
					
					},
					"afterTableRender" : function() {
						// 翻页的时候清除前一页选中的checkbox，同时将更多操作置为不可用
						$("#nasTable input[type='checkbox']").attr("checked", false);
			            //全选取消选中
			            $("#checkAll").attr("checked", false);			             
						$("#beforeModify").addClass("disabled");
						//$("#beforeModify").attr("disabled",true);
						$("#attachVm").addClass("disabled");						
						$("#delete").addClass("disabled");
						$("#backup").addClass("disabled");
						$("#backup").attr("disabled",true);
						$("#queryBackup").addClass("disabled");
						$("#queryBackup").attr("disabled",true);
						nas.bindEvent();
						var firstRow = $("#nasTable tbody").find("tr:eq(0)");
						var firstInsId = firstRow.attr("id");
						//显示第一条记录的日志
						nas.showInstanceInfo(firstInsId);
						firstRow.css("background-color","#d9f5ff");
						nas.setSelectRowBackgroundColor(firstRow);
					}
				}
			);
			nas.datatable.addToobarButton("#nastoolbar");
			nas.datatable.enableColumnHideAndShow("right");
		},
//		getUsed : function(id){
//			var param = {
//					"id"  : id
//			};
//			var _used = 0;
//			nas.service.descripeEmpowerNas(param,function onSuccess(data){
//				if(data.data[0].directory){
//					_used = data.data[0].directory.totalSize-data.data[0].directory.freeSize;
////					_used = 1805353;
//					if(_used > 0){
//						if(_used/1024/1024/1024 >=1){
//							_used = _used/1024/1024/1024;
//							_used = _used.toFixed(2)+"GB";
//						}else if(_used/1024/1024 >=1){
//							_used = _used/1024/1024;
//							_used = _used.toFixed(2)+"MB";
//						}else if(_used/1024 >=1){
//							_used = _used/1024;
//							_used = _used.toFixed(2)+"KB";
//						}else if(_used/1024 <1){
//							_used = _used.toFixed(2)+"B";
//						}
//					}
//				}
//			},function onError(msg){
//				
//			});
//			return _used;
//		},
		setSelectRowBackgroundColor : function(handler) {
			$("#content_container tr").css("background-color","");
			handler.css("background-color","#BCBCBC");
		},		
		bindEvent : function() {
			$("tbody tr").mousedown(function(e) {  
			    if (3 == e.which) { 
			             document.oncontextmenu = function() {return false;};  
			             var screenHeight = $(document).height();
			             var top = e.pageY;
			             if(e.pageY >= screenHeight / 2) {
			             	top = e.pageY - $("#contextMenu").height();
			             }
			             $("#contextMenu").hide();  
			             $("#contextMenu").attr("style","display: block; position: absolute; top:"  
			             + top  
			             + "px; left:"  
			             + e.pageX  
			             + "px; width: 180px;");  
			             $("#contextMenu").show();  
			             e.stopPropagation();
			             
			             var state = $(this).attr("state");
			             var optState = $(this).attr("optState");
			             // 如果不是非就绪状态，则将删除选项和挂载到主机以及快照管理选项置为不可用灰色
			             if (state == "running" && (optState == undefined || optState == "")) {
			            	 $("#contextMenu").find("li.deleteVm").removeClass("disabled");
			             	 $("#contextMenu").find("li.attachVm").removeClass("disabled");
			             	 $("#contextMenu").find("li.backupVm").removeClass("disabled");
			             } else {
			            	 $("#contextMenu").find("li.deleteVm").addClass("disabled");
			             	 $("#contextMenu").find("li.attachVm").addClass("disabled");
			             	$("#contextMenu").find("li.backupVm").addClass("disabled");
			             }
			             
			             // 选中右键所单击的行，取消其他行的选中效果
			             $("tbody input[type='checkbox']").attr("checked", false);
			             //全选取消选中
			             $("#checkAll").attr("checked", false);			             
			             $("input[type='checkbox']",$(this)).attr("checked", true);
			             //同步“更多操作”
			             nas.showOrHideModifyOpt();
			             nas.showOrHideAttachOpt();
						 nas.showOrHideDeleteOpt();
						 nas.showOrHideBackupOpt();
						 nas.showOrHideQueryBackuppOpt();
			     } 
			    nas.showInstanceInfo($(this).attr("id"));
			    nas.setSelectRowBackgroundColor($(this));
			}); 
			
			$("#checkAll").unbind("click").bind("click", function(e) {
				var checked = $(this).attr("checked") || false;
		        $("#nasTable input[type='checkbox']").attr("checked",checked);	 
		        nas.showOrHideModifyOpt();
		        nas.showOrHideAttachOpt();
		        nas.showOrHideDeleteOpt();
		        nas.showOrHideBackupOpt();
		        nas.showOrHideQueryBackuppOpt();
		        e.stopPropagation();
			});
			
			$("#nasTable tbody input[type='checkbox']").unbind("click").bind("click", function() {
				 nas.showOrHideModifyOpt();
				 nas.showOrHideAttachOpt();
				 nas.showOrHideDeleteOpt();
				 nas.showOrHideBackupOpt();
				 nas.showOrHideQueryBackuppOpt();
			});
			
			$("#btnRefresh").unbind("click").bind("click", function() {
				//根据存储上是否开通nas账户来控制创建目录按钮				
				nas.updateDataTable();	
				nas.showOrHideCreateNas();
			});
			
			// IP授权
			$("#auth_save").bind("click", function() {
				nas.authUserAndIps();
			});
			
			// 修改虚拟硬盘名称和描述
			$("#modify_save").bind("click", function() {
				nas.modifyVdiskVolume();
			});
				
			$("#createNasVolume").unbind("click").bind("click", function() {
				if($("#createNasVolume").hasClass("disabled"))return;
					var vdisk_quota = 0;
						// 带+-的输入框
						nas.createPeridInput = null;
						if (nas.createPeridInput == null) {
							var container = $("#perid").empty();				
							var max = 12;
							nas.createPeridInput = new com.skyform.component.RangeInputField(container, {
								min : 1,
								defaultValue : 1,
								max:max,
								textStyle : "width:137px"
							}).render();
							nas.createPeridInput.reset();								
						}
						
						//初始计费值
						nas.getFee();
						
						$(".subFee").bind('mouseup keyup',function(){
							setTimeout('nas.getFee()',100);
						});
						
						$("#createModal form")[0].reset();
						$("#tipCreateCount").text("");
						$("#createModal").modal("show");					
			});
		},
		showInstanceInfo : function(vdiskId){
			$("#opt_logs").empty();
			if (!vdiskId || vdiskId<=0) return;
			com.skyform.service.LogService.describeLogsUIInfo(vdiskId);
//			com.skyform.service.LogService.describeLogsInfo(vdiskId,function onSuccess(logs){	
//				$("#opt_logs").empty();
//				$(logs).each(function(i,v){
//					var desc = "";
//					if(v.description){
//						if(v.description != ""){
//							desc = "("+v.description+")";
//						}						
//					}
//					var _name = "";
//					if(v.subscription_name){
//						_name = v.subscription_name;
//					}
//					$("<li class='detail-item'><span>" + v.createTime + "  "+v.subscription_name+"  " + v.controle +desc+ "</span></li>").appendTo($("#opt_logs"));
//				});
//			},function onError(msg){
//			});			
		},
		// 刷新Table
		updateDataTable : function() {
			if(nas.datatable)nas.datatable.container.find("tbody").html("<tr ><td colspan='7' style='text-align:center;'><img src='"+CONTEXT_PATH+"/images/loader.gif'/><strong>"+Dict.val("common_retrieving_data_please_wait")+"</strong></td></tr>");
			var _user = "";
			var _states = "";
			nas.service.listAll(_user,_states,function onSuccess(data){
				nas.instances = data;
				nas.datatable.updateData(data);	
			},function onError(msg){
			});
			$("#beforeModify").addClass("disabled");
			//$("#beforeModify").attr("disabled",true);
			$("#attachVm").addClass("disabled");
			$("#delete").addClass("disabled");
			$("#backup").addClass("disabled");
			$("#backup").attr("disabled",true);
			$("#queryBackup").addClass("disabled");
			$("#queryBackup").attr("disabled",true);
		},
		// 根据选中的虚拟硬盘的个数判断是否将修改选项置为灰色
		showOrHideModifyOpt : function() {
			var checkboxArr = $("#nasTable tbody input[type='checkbox']:checked");
			if(checkboxArr.length == 0){
				$("#beforeModify").addClass("disabled");
			} else if(checkboxArr.length == 1){
				$("#beforeModify").removeClass("disabled");
			} else {
				$("#beforeModify").addClass("disabled");
			}
			//点击修改按钮
			$("#beforeModify").bind('click',function(e){
				if(!$("#beforeModify").hasClass("disabled")){
					$("#tipModifyVolumeName").text("");
					nas.onOptionSelected(0);		
				}
			});
			
		},
		// 根据选中的虚拟硬盘的个数判断是否将设置备份选项置为灰色==备份
		showOrHideBackupOpt : function() {
			var checkboxArr = $("#nasTable tbody input[type='checkbox']:checked");
			if(checkboxArr.length == 0){
				$("#backup").addClass("disabled");
				$("#backup").attr("disabled",true);
			} else {
				$("#backup").removeClass("disabled");
				$("#backup").attr("disabled",false);
				var hideDelete = false;
				$(checkboxArr).each(function(index, item) {
					var state = $(item).parents("tr").attr("state");
					var optState = $(item).parents("tr").attr("optState");
					if(state != "running"){  //state != "error"
						hideDelete = true;
						return;
					} else {
						if (optState != undefined && optState != "" && optState=="recovering") {
							hideDelete = true;
							return;
						}
					}
				});
			    if (!hideDelete) {
			    	$("#backup").removeClass("disabled");
			    	$("#backup").attr("disabled",false);
			    } else {
			    	$("#backup").addClass("disabled");
			    	$("#backup").attr("disabled",true);
			    }
			}
		},
		// 根据选中的虚拟硬盘的个数判断是否将查看备份选项置为灰色==查看备份
		showOrHideQueryBackuppOpt : function() {
			var checkboxArr = $("#nasTable tbody input[type='checkbox']:checked");
			if(checkboxArr.length == 0){
				$("#queryBackup").addClass("disabled");
				$("#queryBackup").attr("disabled",true);
			} else if(checkboxArr.length == 1){
				$("#queryBackup").removeClass("disabled");
				$("#queryBackup").attr("disabled",false);
			} else {
				$("#queryBackup").addClass("disabled");
				$("#queryBackup").attr("disabled",true);
			}
		},
		// 根据选中的虚拟硬盘的状态判断是否将删除选项置为不可用， 还要根据是否挂载虚机
		showOrHideDeleteOpt : function() {
			var checkboxArr = $("#nasTable tbody input[type='checkbox']:checked");
			if(checkboxArr.length == 0){
				$("#delete").addClass("disabled");
			} else {
				$("#delete").removeClass("disabled");
				var hideDelete = false;
				$(checkboxArr).each(function(index, item) {
					var state = $(item).parents("tr").attr("state");
					var optState = $(item).parents("tr").attr("optState");
					if(state != "running"){  //state != "error"
						hideDelete = true;
						return;
					} else {
						if (optState != undefined && optState != "" && optState=="recovering") {
							hideDelete = true;
							return;
						}
					}
				});
			    if (!hideDelete) {
			    	$("#delete").removeClass("disabled");
			    } else {
			    	$("#delete").addClass("disabled");
			    }
			}
		},
		// 根据选中的虚拟硬盘的状态判断是否将挂载到主机选项置为不可用
		showOrHideAttachOpt : function() {
			var checkboxArr = $("#nasTable tbody input[type='checkbox']:checked");
			if(checkboxArr.length == 0 || checkboxArr.length>1){
				$("#attachVm").addClass("disabled");
			} else {
				$("#attachVm").removeClass("disabled");		
				var hideAttach = false;
				$(checkboxArr).each(function(index, item) {
					var state = $(item).parents("tr").attr("state");
					var optState = $(item).parents("tr").attr("optState");
					if (state != "running") {
						hideAttach = true;
						return;
					} else  {
						if (optState != undefined && optState != "") {
							hideAttach = true;
							return;
						}
					}
				});
			    if (!hideAttach) {
			    	$("#attachVm").removeClass("disabled");
			    } else {
			    	$("#attachVm").addClass("disabled");
			    }
			}
		},		
//		getCheckedArr :function() {
//			return $("#nasTable tbody input[type='checkbox']:checked");
//		},
		getCheckedArr :function() {
			var checkedArr = $("#nasTable tbody input[type='checkbox']:checked");
			if(checkedArr.length == 0){
				checkedArr = nas.lastCheckedArr;
			}
			else nas.lastCheckedArr = checkedArr;
			return checkedArr;
		},
		// 修改虚拟硬盘名称和描述
		modifyVdiskVolume : function() {
			var isSubmit = true;
			var instanceName = $("#modifyVolumeName").val();
			// 验证
			$("#modifyVolumeName").jqBootstrapValidation();
			if ($("#modifyVolumeName").jqBootstrapValidation("hasErrors")) {
				$("#tipModifyVolumeName").text(Dict.val("nas_name_can_not_be_empty"));
				return;
			} else {
				$("#tipModifyVolumeName").text("");
			}
			if (!isSubmit) {
				return;
			}
			var oldInstanceName = nas.getCheckedArr().parents("tr").find("td[name='instanceName']").html();
			if(oldInstanceName == instanceName){
				$("#modifyDiskModal").modal("hide");
			}else{
				com.skyform.service.PortalInstanceService.querySameNameExist(window.currentInstanceType,instanceName,function(isExist){
					if(isExist){
			    		$("#tipModifyVolumeName").text(Dict.val("nas_name_existed"));						
					}else{
						$("#tipModifyVolumeName").text("");
						var id = nas.getCheckedArr().val();		
						var params = {
								"id" : id,
								"instanceName": instanceName
						};						
						nas.service.update(params,function onSuccess(data){
							$.growlUI(Dict.val("common_tip"), Dict.val("nas_modify_fs_success")); 
							nas.updateDataTable();				
						},function onError(msg){
							$.growlUI(Dict.val("common_tip"), Dict.val("nas_modify_fs_error")+msg);
						});
						$("#modifyDiskModal").modal("hide");
					}
				});				
			}
		},
		authUserAndIps : function(){		
			var nasid = nas.getCheckedArr().parents("tr").attr("nasid");
			var array = $("#modifyUsers").find("tr");
			var users = [];
			$(array).each(function(index, item) {
				if(index < array.length-1){
					var user = $(item).find("td:eq(0)").html();
					users.push(user);					
				}
			});
			var userlist = users.join(",");
			var array = $("#modifyIps").find("tr");
			var ips = [];
			$(array).each(function(index, item) {
				if(index < array.length-2){
					var ip = $(item).find("td:eq(0)").html();
					ips.push(ip);					
				}
			});
			var hostlist = ips.join(",");
			if(hostlist == ""){
				hostlist = "1.1.1.1";
			}
			var subscriptionid = nas.getCheckedArr().parents("tr").attr("id");
			var params = {
					"subid":subscriptionid,
					"id" : nasid,
					"hostlist" : hostlist,
					"userlist" : userlist
			};			
			//调用修改授权的接口 empowerForNas   为文件存储赋权接口
			nas.service.empowerForNas(params,function onSuccess(data){
				$.growlUI(Dict.val("common_tip"), Dict.val("nas_IP_authorize_success")); 
				nas.updateDataTable();				
			},function onError(msg){
				$.growlUI(Dict.val("common_tip"), Dict.val("nas_IP_authorize_error")+msg);
			});
			$("#authModal").modal("hide");
		},
		queryProductPrtyInfo :function(index){
			com.skyform.service.BillService.queryProductPrtyInfo(index,window.currentInstanceType,function(data){
				product.productId = data.productId;
				$("#unit").html(product.unit);
			});
		},
		getFee : function(){
			if(CommonEnum.offLineBill)return;
			var period = nas.createPeridInput.getValue();
			var peridUnit = $("#peridUnit").html();
			if(peridUnit == '年'){
				period = period*12;
			}
			var param = {
					"period":period,
					"productPropertyList":[									
					    {
								"muProperty":"storageSize",
								"muPropertyValue":$("#createStorageSize").val(),
								"productId":product.productId
						}
						] 
					};
				Dcp.biz.apiAsyncRequest("/pm/queryCaculateFeeByPrtyList",param, function(data) {
					if(0 == data.code){
						var count =1;
						var fee =  data.data.fee;
						$("#feeInput").text(count *fee/1000);
					}
				});
		}
		
};

var authIp4linux = {
		ips : [],
		container : "#modifyIps",
		init : function(){
			authIp4linux.container = $(authIp4linux.container);
			authIp4linux.container.find(".btn-add").unbind().click(function(){
				authIp4linux.addIp();
			});
			authIp4linux.container.find("tr[id != 'formTr'][id != 'errorInfoRow']").remove();
		},
		addIp : function(){
			var _ip = $("#ip2add",authIp4linux.container).val();
			var ips = {
				"ip2auth" : [{
					"ip" : _ip				
				}]
			};
			authIp4linux._addIp(ips.ip2auth);
		},
		_addIp : function(_ip){
			if(authIp4linux.validate(_ip)){
				var newRow = authIp4linux._generateNewIP(_ip);
				authIp4linux._bindEventForBtns(newRow, _ip);	
				newRow.insertBefore($("#formTr",authIp4linux.container));
				authIp4linux._resetFromRow();
			}
		},
		_generateNewIP : function(_ip){
			var newRow = $(
					"<tr ruleId='" + _ip[0].ip + "'>"+
						authIp4linux._generateContent(_ip) +
					"</tr>"	
			);
			return newRow;
		},
		_generateContent : function(_ip){
			var html = ""+
			"<td>" + _ip[0].ip + "</td>" ;
			html += "<td id='"+_ip[0].ip+"'><button class='btn btn-danger btn-del btn-mini' ruleId='"+_ip[0].ip+"'>"+Dict.val("common_remove")+"</button></td>";
			return html;
		},
		_bindEventForBtns : function(row,ip){
			row.find(".btn-del").click(function(event){
//				if (event.which == 13) {
//				}
				event.stopPropagation();		
				try{
					authIp4linux.deleteIP(row);
				}catch(e) {
					console.error(e);
				}
			});
			
		},
		deleteIP : function(row,id){
			row.remove();
		},		
		validate : function(_ip){
			var ip = _ip[0].ip;
			if(!ip){
				$("#ip_error").html(Dict.val("common_please_enter_IP"));
				return false;
			}else{
				$("#ip_error").html("");
			}
//			var _IPValidate = function(ip) {
//				return /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/.test(ip);
//			};
			if(!_IPValidate(ip)) {
				$("#ip_error").html(Dict.val("common_invalid_ip"));
				return false;
			} else {
				$("#ip_error").html("");
			}

			return true;
		},
		_resetFromRow : function(){
			$("#ip2add",authIp4linux.container).val("");
		}
};