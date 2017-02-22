window.currentInstanceType='obs';
window.currentInstanceType4autobuckup='obsAutoBackup';
//window.Controller = {
//		refresh : function(){
//			obs.updateObsDataTable();
//			obs.refreshObs();				
//		}
//	}
var timervdisk = null;
var AutoUpdater_obs = {
		updaters : {
			"obs" : {
				cache : [],								// 之前缓存的数据
				instances : [],							// 当前获取的最新的数据
				isNeedUpdate : function(instance){
					var oldInstance = this.cache["" + instance.id];
					if(!oldInstance) return true;
					if(oldInstance.state != instance.state) return true;		// 当实例状态发生变化时更新数据
					
					if(oldInstance.optState != instance.optState) return true;	// 当操作状态发声变化时，告诉需要更新数据
					return false;
				},
				update : function(instance){
					var row = $("#obsServiceTable tr[id='"+instance.id+"']");
					if(row && obs.datatable) {
						obs.datatable.updateRow(row,instance);
					}
				},
				fetchData : function(callback){
					var self = this;
//					var resourcePool = "huhehaote";
					obs.service4yaxin.describeObsDetail(function(instances){
						self.cache = self.instances;
						self.instances = [];
						$(instances).each(function(i,instance){
							self.instances["" + instance.id] = instance;
							// 设置回掉
							if(callback && typeof callback == 'function') {
								callback(instance);
							}
						});				
//						if(obs.obsInstance.length != instances.length) obs.updateDataTable();
					});
				}
			}
		},
		startObs : function(){
			var updater = AutoUpdater_obs.updaters["" + currentInstanceType];
			if (updater) {
				updater.getInterval = updater.getInterval || function() {
					return 30 * 1000;
				};
				timervdisk = window.setInterval(function(){
					updater.fetchData(function(instances) {
						$(instances).each(function(i,instance){
							// 检查是否需要更新
							if(updater.isNeedUpdate(instance)) {
								// 更新数据
								updater.update(instance);
							}
						});
					});
				}, updater.getInterval());
			}
		},
		stopVdisk : function(){
			window.clearInterval(timervdisk);
		}
};

//$(function(){
//	var currXhr = null;
//	obs.init();	
//	bucket.init();
//	object.init();	
//});
window.Controller = {
		init : function(){
			var currXhr = null;
			obs.init();	
			bucket.init();
			object.init();	
		},
		refresh : function(){
			obs.updateObsDataTable();
			obs.refreshObs();				
		}
	};


var product = {};
var product4autobuckup = {};
var obs = {
	obsInstance : null,
	s3_url : null,
	data_name : null,
	account : null,
	instancesTask : [],
	password : null,
	s3_access_key : null,
	s3_secure_key : null,
	obsInsState : null,
	datatable : new com.skyform.component.DataTable(),
	service : com.skyform.service.ObsService,
	service4yaxin : com.skyform.service.ObsService4yaxin,
	domainName : null,
	defaultDomain : null,
	currentResoucePool : null,
	defPool:"",
	init : function() {
		var resourcePool = $("#pool").val();
		currentResoucePool = resourcePool;
		var servers = Config.ezs3Server;
		$(servers).each(function(i){
			if(servers[i].pool == resourcePool){
				var _domain = servers[i].value;
				obs.domainName = _domain;
				$("#s3endpoint").html(_domain);
			}			
		});
		obs.defaultDomain = Config.defaultDomain;
		$("#week_sel").hide();
		
		var resourcePools_all = $("#resourcePools").val();
		var currentPool = $("#currentPool").val();
		//使用产品id
		obs.queryProductPrtyInfo4backupauto();
		if(CommonEnum.offLineBill){
			$("#btn_fee_desc").attr("style","display: none;");
		}else{
			$("#btn_fee_desc").attr("style","display: inline;");
		}
		obs.getObsInstance();
		
		$("#createObsA").unbind("click").bind("click", function() {	
			if($("#createObsA").hasClass("disabled"))return;
			$("#createObsModal form")[0].reset();
			$("#createObsModal").modal("show");
		});
	
		// 新建obs
		$("#btnCreateObs").bind('click',function(e){
			obs.createObs();
		});	
		//点击修改按钮
		$("#btn_modifyObs").bind('click',function(e){
			if($("#btn_modifyObs").hasClass("disabled"))return;
			obs.handleLi(0);					
		});	
		//点击数据备份
//		$("#btn_backup").bind('click',function(e){
//			obs.backup();					
//		});	
		//修改obs
		$("#modify_save").bind('click',function(e){
			var instanceName = $("#modifyObsModal  input[name='instance_name']").val();
			obs.modifyObs(instanceName);		
		});

		//点击删除按钮
		$("#btn_delete").bind('click',function(e){
			if($("#btn_delete").hasClass("disabled"))return;
			obs.handleLi(3);					
		});	
		
		$("#btn_s3_key").bind('click',function(e){
			if($("#btn_s3_key").hasClass("disabled"))return;
			$("#s3KeyModal").modal("show");					
		});	
		
		$("#btnRefresh").unbind("click").bind("click", function() {					
			obs.updateObsDataTable();
			obs.refreshObs();
		});
		$("#btn_back_obs").unbind("click").bind("click", function() {
			$("#toolbar4obs").show();
			$("#toolbar4bucket").hide();
			$("#obsBucketTableDiv").hide();		
			$("#property4bucket").hide();	
			$("#breadcrumbDiv").hide();
			$("#obsServiceTableDiv").show();
		});
		$("#btn_show_allbucket").unbind("click").bind("click", function() {
			if($("#btn_show_allbucket").hasClass("disabled"))return;
			$("#toolbar4obs").hide();
			$("#toolbar4bucket").show();
			$("#obsBucketTableDiv").show();		
			if(bucket.currentBucketName){
				$("#property4bucket").show();
			}			
			$("#breadcrumbDiv").show();
			$("#obsServiceTableDiv").hide();
			bucket.currentBucketName = "";
			bucket.currentObjectName = "";
		});	
		obs.refreshObs();		
		obs.queryProductPrtyInfo(4);
		obs.getFee();
		$("#btn_fee_desc").bind('click',function(e){			
			$("#feeDescTable").html("");
			var arr = product.product_desc;
			var dom = '<tbody>';
			$(arr).each(function(i) {
				var name = arr[i].name;
				var describes = arr[i].describe;
				$(describes).each(function(x) {
		            dom += '<tr>';
		                if(x<1){
		                	dom += '  <td rowspan="'+describes.length+'" style="text-align:center;">'+name+'</td>';
		                }		                					
					var unit = describes[x].unit;
					var descs = describes[x].desc;
					var remark = describes[x].remark;
					
					dom +=
					'  <td width="60px;" style="text-align:center;">'+unit+'</td>'+	                
	                '  <td width="200px;" style="text-align:right;">';
	                $(descs).each(function(j) {
	                	var _desc = descs[j].content;
	                	dom += _desc+'<br>';
	                });	                
	                dom +='  </td>'+
	                '  <td>'+remark+'</td>'+
	                '</tr>';					
				});				
			});	
			dom += '</tbody>';
			$("#feeDescTable").html(dom);
			$("#feeDescModal").modal("show");				
		});	
		$("#backup").bind('click',function(e){
			$("#backupModal").modal("show");
		});	
		$("#backup").bind("click",function(e){
			obs.onOptionSelected(6,resourcePools_all,currentPool);
		});	
		//点击查看备份按钮
		$("#queryBackup").bind('click',function(e){
			obs.onOptionSelected(8);		
		});	
		//点击设置备份的保存按钮
		$("#backup_save").bind("click", function(e) {
			obs.onOptionSelected(9);
		});
		$("#ckb_open_obs .switch").on('switch-change',function(e,data){
			var checked = $("#ckb_open_obs .switch input[type='checkbox']").attr("checked");
			if(checked){
				obs.enableRemoteDiv();
			}else{
				obs.disableRemoteDiv();
			}
		});
		$("#bucketResPool").change(function() {
			obs.changePool(this);
		});
//		var type = $("#day_week_sel").val();
//		if(type == "day"){
//			$("#week_sel").attr("style","display:none;");
//		}else if(type == "week"){
//			$("#week_sel").attr("style","display:inline;width:150px;");
//		}

		$("#day_week_sel").change(function(){
			var type = $("#day_week_sel").val();
			if(type == "day"){
				$("#week_sel").attr("style","display:none;");
			}else if(type == "week"){
				$("#week_sel").attr("style","display:inline;width:100px;");
			}
		});
		//根据资源池隐藏 灾备按钮
		var booleanPool =(-1!=obs.defPool.indexOf(CommonEnum.currentPool));
		if(!booleanPool){
			$("#backup").attr("style","display:none");
			//$("#backup4auto").attr("style","display:none");
			$("#queryBackup").attr("style","display:none");
		}
	},
	ifNewPool: function (poolName){
		var newResourcePool = [];
		$(Config.k_pool.split(",")).each(function(index,item){
			newResourcePool[index] = item;
		});
		for(var i = 0 ; i <= newResourcePool.length; i++){
			if(newResourcePool[i]  == poolName){
				return true;
			}
		}
		return false;
	},
	//
	onOptionSelected : function(index,resourcePools_all,currentPool) {
		if(index == 8){
			obs.describeBackup();
		} else if(index == 6){
			obs.listVolumeRelicationTask(resourcePools_all,currentPool);
//			$("#rd_home").attr("checked", true);
//			$("#nativeDiv").attr("style","display:block;");
//			$("#remoteDiv").attr("style","display:none;");
//			
//			$("#autobackup_save").attr("disabled",false);
			$("#backup4autoModal").modal("show");
		} else if(index == 9){
			//var isopen = $("#ckb_open_obs").attr("checked");
			var isopen = $("#ckb_open_obs .switch input[type='checkbox']").attr("checked");
			if(isopen){
				obs.createBackupAuto();
			}else{
				if(obs.instancesTask[0].status == "running"){
					obs.deleteReplicationTask();
				}else{
					$.growlUI(Dict.val("common_tip"), Dict.val("obs_task_status"));
				}
			}					
		}
	},
	//创建设置自动备份
	createBackupAuto : function(subsId){
//		$("#autobackup_save").attr("disabled",true);
		var bucket_name_null = bucket.getCheckedArr_bucket().val();	
		var vid = obs.obsInstance.id;
		var time = "";
		var week = "";
		var bucketName ="";
		
		time = $("#timeofday").val();
		week = $("#week_sel").val();
		bucketName = $("#bucketName").val();
		var params = {
				"period":240,
				"count":1,
				"productList":[
						{
							"taskId":"",
							"productId":product4autobuckup.productId,
							"destresourcepoolid":"",
							"type":"s3",
							"srcvolumeid":vid,
							"dstvolumeid":bucket_name_null,
							"dayorweek":"",
							"time":time,
							//"week_day":week,
							"remoteornot":"",
							"maxcount":1,
							"bucketname":bucket_name_null,
							"serviceType":"1024"
						}
					]
				};
		
			var respool = $("#bucketResPool").val();
			params.productList[0].destresourcepoolid = respool;
			params.productList[0].remoteornot = "remote";
			params.productList[0].taskId = $("#taskid").val();
			var type = $("#day_week_sel").val();
			if(type == "day"){
				params.productList[0].dayorweek = "day";
				//params.productList[0].week_day = "";
			}else if(type == "week"){
				params.productList[0].dayorweek = "week";
				if(week != "" || week != null || week != undefined){
					params.productList[0].week_day = week;
				}
			}
			
			var lsid = "";
			/////////////如果没有bucket，重新创建新的////////////////
//			if(bucketName == null || bucketName == "" || bucketName == undefined){
//				var bucket_name_null_par = "buckte_"+bucket_name_null;
//				var paramr = {
//						"resourcePool" : respool,
//						"domainName" : obs.domainName,
//						"defaultDomain" : obs.defaultDomain,
//				};
//				obs.service.listBucketResourcePoolSyn(paramr,function onSuccess(data){
//					$(data).each(function(i,v){
//						if(v.name == bucket_name_null_par){
//							lsid = v.name;
//						}
//					});
//					if(lsid == null || lsid == ""){
//						var param = {
//								"bucketName" : bucket_name_null_par,
//								"domainName" : obs.domainName,
//								"defaultDomain" : obs.defaultDomain,
//						};
//						bucket.service.createBucketSet(param,function onSuccess(data){
//							params.productList[0].dstvolumeid = data.name;
//						});
//					}else{
//						params.productList[0].dstvolumeid = lsid;
//					}
//				});
//			}else{
//				params.productList[0].dstvolumeid = lsid;  //如果bucketName输入，就使用输入的bucketName。
//			}
			//////////////如果没有bucket，重新创建新的////////////////
		com.skyform.service.VdiskService4yaxin.newOrEditVolumeReplicationTask(params,function onSuccess(data){
			$.growlUI(Dict.val("common_tip"), Dict.val("nas_submit_recovery_service_success")); 
			$("div option:empty").attr("selected",false);
			$("#week_sel").hide();
			$("#timeofday").val("");
			$("#day_week_sel option[name='day']").attr("selected", true);
			$("#task_status").html(Dict.val("vdisk_no_task"));
			$("#ckb_open_obs").attr("checked",false);			
			$("#backup4autoModal").modal("hide");
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
	disableRemoteDiv : function(){
		var _childs = $("#backupContent").children();
		$(_childs).each(function(index, item) {
			$(item).find("select").attr("disabled",true);
		});											
	},
	enableRemoteDiv : function(){
		$("#ckb_open_obs").attr("checked",true);
		var _childs = $("#backupContent").children();
		$(_childs).each(function(index, item) {
			if(obs.instancesTask.length == 1){
				$("#bucketResPool").attr("disabled","desabled");
			}
			$(item).find("select").attr("disabled",false);
		});						
	},
	queryProductPrtyInfo4backupauto :function(){
		com.skyform.service.BillService.queryProductPrtyInfo(0,window.currentInstanceType4autobuckup,function(data){
			product4autobuckup.productId = data.productId;
		});
	},
	changePool: function(newPool){
		var pool = $("#bucketResPool").val();
		obs.bucketNameList(pool);
	},
	bucketNameList : function(resourcePool){
		var allCatalogue = $("#bucketName");
		allCatalogue.empty();
		var params = {
				"resourcePool" : resourcePool,
				"domainName" : obs.domainName,
				"defaultDomain" : obs.defaultDomain				
		};
		obs.service.listBucketResourcePool(params,function onSuccess(data){
			$("<option value='' >"+Dict.val("common_choose")+"</option>").appendTo(allCatalogue);
			$(data).each(function(i,v){
				if(v.name != undefined){
					$("<option value='"+v.name+"'  >"+v.name+"</option>").appendTo(allCatalogue);
				}
			});
		},function onError(msg){
			$.growlUI(Dict.val("common_tip"), Dict.val("obs_select_obs_failure") + msg); 
		});
	  },
	  nasmuluList : function(resourcePool,dstvolume_id){	
		var allCatalogue = $("#bucketName");
		allCatalogue.empty();
		var params = {
				"resourcePool" : resourcePool,
				"domainName" : obs.domainName,
				"defaultDomain" : obs.defaultDomain				
		};
		obs.service.listBucketResourcePool(params,function onSuccess(data){
			$(data).each(function(i,v){
				if(v.name != undefined){
					if(v.name == dstvolume_id){
						$("<option value='"+v.name+"' selected style='width:250px;'>"+v.name+"</option>").appendTo(allCatalogue);
					}else{
						$("<option value='"+v.name+"' style='width:250px;'>"+v.name+"</option>").appendTo(allCatalogue);
					}
				}
			});
		},function onError(msg){
			$.growlUI(Dict.val("common_tip"), Dict.val("obs_select_obs_failure") + msg); 
		});
	  },
	  listallResourcePoolTask:function(resourcePools_all,pool_s,currentPool){
		  var resPool = $("#bucketResPool");
		  resPool.empty();
		var pools = [];
			  pools = resourcePools_all.split(",");
				$(pools).each(function(i) {
					if(pools[i] == pool_s){
						$("<option value='"+pools[i]+"'  selected>"+CommonEnums.pools[pools[i]]+"</option>").appendTo(resPool);
						resPool.attr("disabled","desabled");
					}else{
						if(pools[i] == currentPool){//这里注释加上==当前资源池不选
							//$("<option value='"+pools[i]+"'  selected>"+CommonEnums.pools[pools[i]]+"</option>").appendTo(poolContainer);
						}else{
							$("<option value='"+pools[i]+"'  >"+CommonEnums.pools[pools[i]]+"</option>").appendTo(resPool);
							resPool.attr("disabled","desabled");
						}
						
					}
				});
	  },
	  listallResourcePool:function(resourcePools_all,currentPool){
		  var poolContainer = $("#bucketResPool");
			poolContainer.empty();
			var pools = [];
				  pools = resourcePools_all.split(",");
					$(pools).each(function(i) {
						if(pools[i] == currentPool){//这里注释加上==当前资源池不选
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
			//$("#ckb_open_obs").attr("checked",false);
		    var id = obs.obsInstance.id;
		    var checkedArr = bucket.getCheckedArr_bucket();
			var _bucket_name = checkedArr.parents("tr").attr("name");
			var params = {
					"volumeid":""+id,
					"bucketname":_bucket_name
			};
			com.skyform.service.VdiskService4yaxin.listVolumeRelicationTask(params,function onSuccess(data){
				obs.instancesTask = data;
				if(data.length == 0){
					$('#ckb_open_obs').bootstrapSwitch('setState', false);
					obs.listallResourcePool(resourcePools_all,currentPool);
					var pool = $("#bucketResPool").val();
					//obs.bucketNameList(pool);//注释：需求是有文件存储目录的下拉框，现在没有这个需求，先注释掉，
					return;
				}else if(data.length == 1){
					
					$('#ckb_open_obs').bootstrapSwitch('setState', true);
					var _childs = $("#backupContent").children();
					$(_childs).each(function(index, item) {
						$(item).find("select").attr("disabled",false);
					});
					var pool_s = data[0].destresourcepoolid;
					var dstvolume_id = data[0].dstvolumeid;
					
					//obs.nasmuluList(pool_s,dstvolume_id);//注释：需求是有文件存储目录的下拉框，现在没有这个需求，先注释掉，
					obs.listallResourcePoolTask(resourcePools_all,pool_s,currentPool);
					
					$("#day_week_sel").val(data[0].dayorweek);
					$("#taskid").val(data[0].taskid);
					$("#maxCount").val(data[0].maxcount);
					
					//$("<option value='"+dstvolume_id+"' selected style='width:250px;'>"+dstvolume_id+"</option>").appendTo("#allCatalogue");
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
		var buck_name =bucket.currentBucketName;
		buck_name = encodeURI(encodeURI(buck_name));
		window.location = Dcp.getContextPath()+"/jsp/maintain/backup4obs.jsp?ebs="+buck_name+"&code=backup4obs";
	},
	refreshObs : function(){
		obs.showOrHideCreateBtn();
		obs.showOrHideDeleteBtn();
		obs.showOrHideModifyBtn();
		obs.showOrHideS3KeyBtn();
		obs.showOrHideToolbar4bucket();
		if(obs.obsInstance != null){
			if(obs.obsInstance.state.indexOf('error') >= 0){
				$.growlUI(Dict.val("common_tip"), Dict.val("obs_obs_create_failure"));		
			}
		}
	},
	showOrHideCreateBtn : function(){
		var hideCreate = false;
		//如果用户申请过了存在running或者opening状态的实例，则disabled
		if(obs.obsInstance != null){
			if(obs.obsInstance.state=='running' || obs.obsInstance.state=='opening' || obs.obsInstance.state=='deleting' || obs.obsInstance.state=='error'){
				hideCreate = true;
			}
		}else{
			hideCreate = false;
		}
		if (!hideCreate) {
			$("#createObsA").removeClass("disabled");				
		}else{	
			$("#createObsA").addClass("disabled");
			$("#createObsA").unbind("click");
		}
	},
	showOrHideCreateBucketBtn : function(){
		var hideCreate = false;
		//如果用户申请过了存在running或者opening状态的实例，则disabled
		if(obs.obsInstance != null){
			if(obs.obsInstance.state!='running' && obs.obsInstance.state.indexOf('error') == -1){
				hideCreate = true;
			}
		}else{
			hideCreate = true;
		}
		if (!hideCreate) {
			$("#createObsBucket").attr("disabled",false);
			$("#createObsBucket").unbind("click").bind("click", function() {	
				$("#createObsBucket").addClass("disabled");
				$("#createObsBucket").attr("disabled",true);
				
				$("#createObsBucketModal form")[0].reset();
				$("#createBucketName").val("");
				$("#tipCreateBucketName").text("");
				$("#createObsBucketModal").modal("show");
			});			
		}else{			
			$("#createObsBucket").attr("disabled",true);
			$("#createObsBucket").unbind("click");
		}
	},

	showOrHideDeleteBtn : function(){
		var hideDelete = false;
		if(obs.obsInstance != null){
			if(obs.obsInstance.state!='running' && obs.obsInstance.state.indexOf('error') == -1){
				hideDelete = true;
			}			
		}else{
			hideDelete = true;
		}
		if (!hideDelete) {
			$("#btn_backup").attr("disabled",false);
			$("#btn_delete").removeClass("disabled");
		}else{
			$("#btn_delete").addClass("disabled");
			$("#btn_backup").attr("disabled",true);
		}
	},
	showOrHideDeleteBucketBtn : function(){
		var hideDelete = false;
		if(obs.obsInstance != null){
			if(obs.obsInstance.state!='running' && obs.obsInstance.state.indexOf('error') == -1){
				hideDelete = true;
			}			
		}else{
			hideDelete = true;
		}
		if (!hideDelete) {
			$("#btn_delete_bucket").removeClass("disabled");
		}else{
			$("#btn_delete_bucket").addClass("disabled");
		}
	},
	
	showOrHideModifyBtn : function(){
		var hideModify = false;
		if(obs.obsInstance == null){
			hideModify = true;
		}else{
			if(obs.obsInstance.state=='deleting' || obs.obsInstance.state.indexOf('error') >= 0){
				hideModify = true;
			}
		}
		if (!hideModify) {
			$("#btn_modifyObs").removeClass("disabled");
		}else{
			$("#btn_modifyObs").addClass("disabled");
		}
	},
	showOrHideS3KeyBtn : function(){
		var hideS3Key = false;
		if(obs.obsInstance == null){
			hideS3Key = true;
		}else{
			if(obs.obsInstance.state!='running'){
				hideS3Key = true;
			}
		}
		if (!hideS3Key) {
			$("#btn_s3_key").removeClass("disabled");
		}else{
			$("#btn_s3_key").addClass("disabled");
		}
	},
	showOrHideObsName : function(){
		var hideObsName = false;
		//如果用户申请过了存在running状态的实例，则disabled
		if(obs.obsInstance == null){
			hideObsName = true;
		}
		if (!hideObsName) {
		}else{
		}
	},
	showOrHideCreatingDiv : function(){
		var showCreatingDiv = false;
		if(obs.obsInstance != null){
			if(obs.obsInstance.state=='opening'){
				showCreatingDiv = true;
			}
		}
		if(showCreatingDiv){
			$("#OSCreatingdiv").show();
		}else{
			$("#OSCreatingdiv").hide();
		}
	},
	showOrHideDeletingDiv : function(){
		var showObsDeletingDiv = false;
		if(obs.obsInstance != null){
			if(obs.obsInstance.state=='deleting'){
				showObsDeletingDiv = true;
			}
		}
		if(showObsDeletingDiv){
			$("#OSDeletingdiv").show();
		}else{
			$("#OSDeletingdiv").hide();
		}
	},
	showOrHideToolbar4bucket : function(){
		var showToolbar4bucket = false;
		//如果用户申请过了存在running状态的实例
//		if(obs.obsInstance != null){			
//			if(obs.obsInstance.state=='running'){ //存在running状态的实例
//				//先去主资源池上查询用户是否存在，如果存在就不显示创建按钮
//				var mainPool = Config.obsMainPool;  //"huhehaote";
//				var _hass3user = obs.getS3User(mainPool);
//				if(_hass3user){  //用户在主资源池上已经存在
//					showToolbar4bucket = true;
//				}							
//			}
//		}
		
//		var _hass3user = obs.getS3User();
//		if(_hass3user){  //用户在s3上已经存在
//			showToolbar4bucket = true;
//		}									
//		if (showToolbar4bucket) {
			//再去当前资源池上查询用户是否存在，如果存在就显示bucket，不存在则停留在实例页面
			var resourcePool = $("#pool").val();
			var _isuserSync = obs.getS3User(resourcePool);
			if(_isuserSync){  //用户在当前资源池上已经存在
				$("#toolbar4obs").hide();
				$("#toolbar4bucket").show();
				$("#obsBucketTableDiv").show();
				
				$("#breadcrumbDiv").show();
				
				$("#btn_show_allbucket").removeClass("disabled");
				$("#obsServiceTableDiv").hide();
				
				
				
				if(!bucket.datatable) {
					bucket.datatable = new com.skyform.component.DataTable(),
					bucket.describeObsBuckets();
				}else{
					bucket.updateBucketDataTable();
				}
				
			}else{
				$("#toolbar4obs").show();
				$("#toolbar4bucket").hide();
				$("#obsBucketTableDiv").hide();
				$("#breadcrumbDiv").hide();
				//用户暂停时all bucket按钮不可用
				$("#btn_show_allbucket").addClass("disabled");
				$("#obsServiceTableDiv").show();
				AutoUpdater_obs.startObs();
				//$.growlUI(Dict.val("common_tip"), "用户没有同步到该资源池上, 请稍后再试...");
				$("#createObsA").removeClass("disabled")
				$("#createObsA").unbind("click").bind("click", function() {	
					if($("#createObsA").hasClass("disabled"))return;
					$("#createObsModal form")[0].reset();
					$("#createObsModal").modal("show");
				});
			}							
//		}else{
//			$("#toolbar4obs").show();
//			$("#toolbar4bucket").hide();
//			$("#obsBucketTableDiv").hide();
//			$("#breadcrumbDiv").hide();
//			//用户暂停时all bucket按钮不可用
//			$("#btn_show_allbucket").addClass("disabled");
//			$("#obsServiceTableDiv").show();
//			AutoUpdater_obs.startObs();
//		}
	},	
	getS3User : function(resourcePool) {	
		var result = true;
//		http://172.31.100.16:8080/OBSMGR/obsmgr/useradmin/zhanghz?pool=langfang
		obs.service4yaxin.getObsUser(resourcePool,function onSuccess(data){
//			{"msg":"","data":[{"username":"zhanghz","status":"active","password":"zhanghz0","secretkey":"Ie2K0ALgz1+o3lsbQsJXT7eDVzsNLqiD+HxF5peZ","used":0,"created":1390551990000,"allocated":1099511627776,"accesskey":"QWCVJ7EQVPGJE9SE322Z"}],"code":0}
			var _data = data[0];
	        if(_data == null){
	        	result = false;
	        }else{
				if(typeof(_data) == "string" && _data.indexOf("error") >= 0) {
		        	result = false;
			    }else {
			    	//{"username":"chenqiang","status":"active","created":1385360793000,"allocated":1099511627776,"used":0,"password":"523b74a7067e566fd00754f12d11aeca","accesskey":"34YI5Z05NUHIEFFDGNWT","secretkey":"E+cUpssfo1oRNg+NPszVKGT7AcpqZ2ygl5wQjOHr"}
			    	if(_data.result == 'failed'){
			    		result = false;
			    		$.growlUI(Dict.val("common_tip"), Dict.val("obs_obs_opening"));
			    	}else{
			    		if(_data.status=='active'){  //pause
					    	obs.s3_access_key = _data.accesskey;
							obs.s3_secure_key = _data.secretkey;
							$("#s3_access_key").val(_data.accesskey);
							$("#s3_secure_key").val(_data.secretkey);
							obs.password = _data.password;
			    		}else{
			    			result = false;
			    			$.growlUI(Dict.val("common_tip"), Dict.val("obs_obs_user_state_"));
			    		}
			    	}			    	
				}						        	
	        }			
		},function onError(msg){	
//			{"msg":"error:username is not exist","code":-1}
			result = false;
		});		
		return result;
	},
	getObsInstance : function() {
		obs.service4yaxin.describeObsDetail(function onSuccess(data){
			//var data1 = {"msg":"","data":[{"state":"opening","expireDate":2114352000000,"comment":"","createDate":1472455609000,"id":12635121,"instanceName":"tianjin_12635121","resourcePool":"tianjin"},{"state":"running","storageSize":"1024","expireDate":2114352000000,"comment":"","createDate":1472454779000,"id":12634020,"instanceName":"xian_12634020","optState":"","resourcePool":"jinan"}],"code":0}
			var _data = data;
			var resultData = [];
	          if(typeof(_data) == "string" && _data.indexOf("error") >= 0) {
		            
		      }else {
		    	  if(_data == null || _data==""){
		    		  obs.obsInstance = null;
		    	  }else{
					  for(var i = 0; i < _data.length; i++){
						  if(obs.ifNewPool(currentResoucePool)){
							  if( _data[i].resourcePool == currentResoucePool){
								  obs.obsInstance = _data[i];
								  resultData.push(_data[i]);
								  break;
							  }
						  }else{
							  if( !obs.ifNewPool(_data[i].resourcePool) ){
								  obs.obsInstance = _data[i];
								  resultData.push(_data[i]);
								  break;
							  }
						  }

					  }
		    	  }
			  }				
	          obs.renderDataTable(resultData);
		},function onError(msg){
			
		});
	},
	

	renderDataTable : function(data) {
		obs.datatable.renderByData("#obsServiceTable", {
				"data" : data,
				"iDisplayLength": 1,
//				"columnDefs" : [
//				     {title : "ID", name : "id"},
//				     {title : "名称", name : "instanceName"},
//				     {title : "状态", name : "state"},
//					 {title : "创建时间", name : "createDate"}
//				],
				"onColumnRender" : function(columnIndex, columnMetaData, columnData) {
					 var text = columnData[''+columnMetaData.name] || "";
					 if (columnMetaData.name == "ID") {
//						 text = "<a href='#'>" + text + "</a>";
						 text = text;
					 }
					 if (columnMetaData.name == "state") {
						 if (columnData.optState == null || columnData.optState == "") {
							 text = com.skyform.service.StateService.getState("obs",text);
						 } else {
							 text = com.skyform.service.StateService.getState("obs",columnData.optState);
						 }
					 }
					 if("instanceName" == columnMetaData.name){
							text = columnData.instanceName
							  +"<a title="+Dict.val("common_advice")+" href='../user/workOrder.jsp?code=workOrder&cataCode=service&instanceId="+columnData.id+
							  "&serviceType=obs&instanceName="+encodeURIComponent(columnData.instanceName)+
							  "&instanceStatus="+columnData.state+
							  "&currentPoolW="+encodeURIComponent(CommonEnum.pools[CommonEnum.currentPool])+
							  "'><i class='icon-comments' ></i></a>";
						}
					 if (columnMetaData.name == "createDate") {
						 text = new Date(text).format("yyyy-MM-dd hh:mm:ss");
					 }
					 return text;
				}, 
				"afterRowRender" : function(rowIndex, data, tr){
					tr.attr("id", data.id);
				},
				"afterTableRender" : function() {
					$("#obsServiceTable_filter").remove();
					$("#obsServiceTable_info").remove();
					$("#obsServiceTable_paginate").remove();				
					
					// 翻页的时候清除前一页选中的checkbox，同时将更多操作置为不可用
					$("#obsServiceTable input[type='checkbox']").attr("checked", false);
				}
			}
		);
		obs.datatable.addToobarButton("#toolbar4obs");
	},
	
	// 刷新Table
	updateObsDataTable : function() {
		obs.service4yaxin.describeObsDetail(function onSuccess(data){
			//var data1 = {"msg":"","data":[{"state":"opening","expireDate":2114352000000,"comment":"","createDate":1472455609000,"id":12635121,"instanceName":"tianjin_12635121","resourcePool":"tianjin"},{"state":"running","storageSize":"1024","expireDate":2114352000000,"comment":"","createDate":1472454779000,"id":12634020,"instanceName":"xian_12634020","optState":"","resourcePool":"jinan"}],"code":0}
			var _data = data;
			var resultData = [];
	          if(typeof(_data) == "string" && _data.indexOf("error") >= 0) {
		            
		      }else {
		    	  if(_data == null || _data==""){
		    		  obs.obsInstance = null;
		    	  }else{
					  for(var i = 0; i < _data.length; i++){
						  if(obs.ifNewPool(currentResoucePool)){
							  if( _data[i].resourcePool == currentResoucePool){
								  obs.obsInstance = _data[i];
								  resultData.push(_data[i]);
								  break;
							  }
						  }else{
							  if( !obs.ifNewPool(_data[i].resourcePool) ){
								  obs.obsInstance = _data[i];
								  resultData.push(_data[i]);
								  break;
							  }
						  }

					  }
		    	  }
			  }				
	          obs.datatable.updateData(resultData);
		},function onError(msg){
			$.growlUI(Dict.val("common_tip"), Dict.val("obs_view_obs_failure") + msg); 
		});
	},	
	
	
	
	// 创建对象存储
	createObs : function() {
		var isSubmit = true;
		var instanceName = $.trim($("#createInsName").val());
		// 验证
		$("#createInsName").jqBootstrapValidation();
		
      var scoreReg = /^[\u4E00-\u9FA0A-Za-z\-0-9\_]+$/;
      if(instanceName != ""){
          if(! scoreReg.exec(instanceName)) {
        	  $("#tipCreateInsName").text(Dict.val("obs_please_enter_letters_numbers_underscores"));
              $("#createInsName").focus();
              isSubmit = false;
          }else{
        	  $("#tipCreateInsName").text("");
          }     	  
      	}
		
		if (!isSubmit) {
			return;
		}
		$("#feeInput").text(obs.getFee());
		var params = {
				"period":1,
				"count":1,
				"productList":[
					{
						"instanceName" : instanceName,
						"storageSize" : 1024,
						"productId":product.productId
					}
				] 
		};			
//		{"tradeId":"1401XXX000200902","msg":"success","code":0}
		$("#createObsModal").modal("hide");
		obs.service4yaxin.createObsVolumes(params,function onSuccess(data){				
			//订单提交成功后校验用户余额是否不足
			var _tradeId = data.tradeId;
			var _fee = $("#feeInput").text();
			var createModal = $("#createObsModal");
			obs.confirmTradeSubmit(_fee,_tradeId,createModal,function onSuccess(data){
				$.growlUI(Dict.val("common_tip"), Dict.val("common_creating_application_submitted_successfully_please_patient"));
				// refresh
				obs.updateObsDataTable();
				obs.refreshObs();
			},function onError(msg){				
			});
		},function onError(msg){
			$.growlUI(Dict.val("common_tip"), Dict.val("common_create_filing_failure") + msg); 
		});
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
	
	
	// 修改对象存储名称和描述
	modifyObs : function(name) {		
				var params = {
						"id" : obs.obsInstance.id,
						"instanceName": name,
						"modOrLarge" : "1"
				};
				$("#modifyObsModal").modal("hide");
				Dcp.biz.apiRequest("/instance/obs/modifyObsVolumeAttributes", params, function(data){
					if(data.code == "0"){
						obs.obsInstance.instanceName = name;
						obs.updateObsDataTable();
						$.growlUI(Dict.val("common_tip"), Dict.val("obs_modify_obs_success")); 												
					} else {
						$.growlUI(Dict.val("common_tip"), Dict.val("obs_modify_obs_error") + data.msg); 
					}
				});
	},
	// 根据选中的虚拟硬盘的选择状态判断是否将修改选项置为灰色
	showOrHideOpt : function() {
		var applycount = 1;
		if(applycount == 1){
			$("#btn_modifyObs").removeClass("disabled");
			$("#btn_delete").removeClass("disabled");
		} else {
			$("#btn_modifyObs").addClass("disabled");
			$("#btn_delete").addClass("disabled");

		}
	},
	handleLi : function(index){
		if(index==0){
			//只有当选中一个对象存储时修改名称和备注，其他情况友情提示
			var oldInstanceName = "";
			if(obs.obsInstance){
				oldInstanceName = obs.obsInstance.instanceName;
			}else{
			}
			$("#modInsName").val(oldInstanceName);
			$("#modifyObsModal").modal("show");										
		}
		else if(index==3){
			obs.destroyObs();					
		}	
	},
	backup : function(){
//		$("#backupModal").modal("show");
		window.location.href = "data_backup.jsp";

	},
   	destroyObs : function() {			
		var confirmModal = new com.skyform.component.Modal(new Date().getTime(),Dict.val("obs_destory_obs"),"<h4>"+Dict.val("obs_do_you_destory_obs")+"</h4>",{
			buttons : [
				{
					name : Dict.val("common_determine"),
					onClick : function(){
						// 删除对象存储
						var _id = obs.obsInstance.id;
						var params = {
								"ids" : ""+_id
						};
						obs.service4yaxin.deleteObsVolumes(params,function onSuccess(data){
							$.growlUI(Dict.val("common_tip"), Dict.val("obs_destory_obs_success_please_wait")); 
							obs.updateObsDataTable();
							obs.refreshObs();
							confirmModal.hide();	
						},function onError(msg){
							$.growlUI(Dict.val("common_tip"), Dict.val("obs_destroy_obs_failure") + msg);
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
						confirmModal.hide();
					}
				}
			]
		});
		confirmModal.setWidth(300).autoAlign();
		confirmModal.show();
	},
	queryProductPrtyInfo :function(index){
		com.skyform.service.BillService.queryProductPrtyInfo(index,window.currentInstanceType,function(data){
			product.productId = data.productId;
			product.objPrice = data.objPrice;
			product.product_desc = data.product_desc;
		});
		
	},
	getFee : function(){
		if(CommonEnum.offLineBill)return;
		var param = {
				"period":1,
				"productPropertyList":[									
				    {
							"muProperty":"objPrice",
							"muPropertyValue":product.objPrice,
							"productId":product.productId
					}
					] 
				};
			Dcp.biz.apiAsyncRequest("/pm/queryCaculateFeeByPrtyList",param, function(data) {
				if(0 == data.code){
					var count =1;
					var fee =  data.data.fee;
					if(fee == 0){
						$("#feedesc").hide();
						
					}else{
						$("#feedesc").show();
						$("#feeInput").text(count *fee/1000);
					}					
				}
			});
	}
};	 


var bucket = {
		service : com.skyform.service.ObsService,
		datatable : null,
		currentBucketName : null,
		currentObjectName : null,
		bucketName4copy : null,
		objectName4copy : null,
		folderName4copy : null,
		bucketName4move : null,
		objectName4move : null,
		folderName4move : null,
		uploadPercent : null,
		copyOrMove : null,
		isAbort : false,
		init : function(){			
			$("#btn_delete_bucket").unbind("click").bind("click", function() {
				if($("#btn_delete_bucket").hasClass("disabled"))return;
				var hasObject = true;
		   		var checkedobj = bucket.getCheckedArr_bucket();
		   		var tr = $(checkedobj).parents("tr");
		   		var bucketName = $("input[type='radio']", $("td", tr)[0]).val();
				var params = {
						"bucketName" : bucketName,
						"objectName" : "",
						"domainName" : obs.domainName,
						"defaultDomain" : obs.defaultDomain
				};
				object.service.listObjects(params,function onSuccess(data){
					object.obsObjects = data;
					if(!data){
						hasObject = false;						
					}else{
						if(data.length==0){
							hasObject = false;
						}						
					}
					if(!hasObject){
						bucket.destroyBucket();
					}else{
						$.growlUI(Dict.val("common_tip"), Dict.val("obs_bucket_contains_folders_and_files_not_deleted")); 
					}					
				},function onError(msg){
					
				});					
			});			
			bucket.showOrHideDeleteBucket();
			$("#addPermis4bucket").unbind("click").bind("click", function() {
				var container = $("#grantandpermisdiv4bucket");
				var dom = "";
		        dom += '  <div class="alert alert-info fade in" >'+
//		        '    <button type="button" class="close" data-dismiss="alert">&times;</button>'+
		        Dict.val("obs_licensed_to")+
				'		<select class="grantees" style=" margin-bottom: 3px;">'+
				'			<option value="everyone">'+Dict.val("obs_possessor")+'</option>'+
				'			<option value="authenUsers">'+Dict.val("obs_authenticated_user")+'</option>'+
				'			<option value="me">'+Dict.val("obs_myself")+'</option>'+
				'		</select>'+		
				'			<input type="checkbox" class="permissions" value="perm4list" style="margin-bottom: 7px;margin-left: 14px;">'+
				'			List  '+
				'			<input type="checkbox" class="permissions" value="perm4write" style="margin-bottom: 7px;margin-left: 14px;">'+
				'			Upload/Delete  '+
				'			<input type="checkbox" class="permissions" value="perm4view" style="margin-bottom: 7px;margin-left: 14px;">'+
				'			View Permissions  '+
				'			<input type="checkbox" class="permissions" value="perm4edit" style="margin-bottom: 7px;margin-left: 14px;">'+
				'			Edit Permissions'+							            
		        '  </div>';

				$(dom).appendTo(container);
			});	
			$("#btn_createFolder").unbind("click").bind("click", function() {
				$("#createFolderName").val("");
				$("#tipCreateFolderName").text("");				
				$("#createFolderModal").modal("show");					
			});						
		},
		showOrHideDeleteBucket : function() {
			var checkboxArr = bucket.getCheckedArr_bucket();
			if(checkboxArr.length == 0){
				$("#btn_delete_bucket").addClass("disabled");
				
				$("#backup").addClass("disabled");
				$("#backup").attr("disabled",true);
				
				$("#queryBackup").addClass("disabled");
				$("#queryBackup").attr("disabled",true);
			} else {
				$("#btn_delete_bucket").removeClass("disabled");
				
				$("#backup").removeClass("disabled");
				$("#backup").attr("disabled",false);
				
				$("#queryBackup").removeClass("disabled");
				$("#queryBackup").attr("disabled",false);
			}
		},
		// 查询bucket列表
		describeObsBuckets : function() {
			var params = {
				"domainName" : obs.domainName,
				"defaultDomain" : obs.defaultDomain
			};
			bucket.service.listBucket(params,function onSuccess(data){
				bucket.renderDataTable(data);		
			},function onError(msg){
				$.growlUI(Dict.val("common_tip"), Dict.val("obs_select_bucket_error") + msg); 
			});
		},
		renderDataTable : function(data) {
			bucket.datatable.renderByData("#obsBucketTable", {
					"data" : data,
					"iDisplayLength": 5,
					"columnDefs" : [
					     {title : "", name : "name"},
					     {title : Dict.val("common_name"), name : "name"}
					],
					"onColumnRender" : function(columnIndex, columnMetaData, columnData) {
						 var text = columnData[''+columnMetaData.name] || "";
						 if(columnIndex ==0) {
							 var _bucketname = columnData['name'] || "";
							 text = '<input type="radio" name="radio_bucket" value="'+text+'" onclick="bucket.showBucketProperty(\''+_bucketname+'\')">';
						 }
						 if (columnIndex ==1) {
							 text = "<a onclick='bucket.getObjectsOfBucket(\""+text+"\")' href='#'>" + text + "</a>";
						 }
						 return text;
					}, 
					"afterRowRender" : function(rowIndex, data, tr){
						tr.attr("name", data.name);
					},
					"afterTableRender" : function() {
						$("#obsBucketTable_filter").css("position","absolute");
						$("#obsBucketTable_filter").css("right","0px");
						$("#obsBucketTable_filter").css("top","-52px");
						$("#obsObjectTable_filter").css("style","position:absolute;right:0px;top:-52px;");
						$("#obsBucketTable_filter input").css("width","100px");
						// 翻页的时候清除前一页选中的checkbox，同时将更多操作置为不可用
						$("#obsBucketTable input[type='checkbox']").attr("checked", false);
			             bucket.bindEvent();
						var firstRow = $("#obsBucketTable tbody").find("tr:eq(0)");
						var first = firstRow.attr("name");
						firstRow.css("background-color","#d9f5ff");
						bucket.setSelectRowBackgroundColor(firstRow);
					}
				}
			);
			bucket.datatable.addToobarButton("#disktoolbar");
		},
		getObjectsOfBucket : function(bucketName){
			bucket.currentBucketName = bucketName;
			$("#toolbar4obs").hide();
			$("#toolbar4bucket").hide();
			$("#toolbar4object").show();
			$("#breadcrumbUl").find("li:last a:first").after('<span class="divider">/</span>');
			$("#breadcrumbUl").append('<li><a style="color:#000;" onclick="object.updateObjectDataTable()" href="#">'+bucketName+'</a> </li>');
			$("#obsBucketTableDiv").hide();
			object.describeObjects(bucketName);
		},
		bindEvent : function() {
			$("#obsBucketTable tbody tr").mousedown(function(e) {  
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
			             // 选中右键所单击的行，取消其他行的选中效果
			             $("tbody input[type='checkbox']").attr("checked", false);
			             $("input[type='checkbox']",$(this)).attr("checked", true);
			             //同步
			             bucket.showOrHideDeleteBucket();
			     } 
			    bucket.setSelectRowBackgroundColor($(this));
			}); 
			
			$("#obsBucketTable tbody input[type='radio']").unbind("click").bind("click", function() {
				bucket.showOrHideDeleteBucket();
			});
			
			$("#btnRefresh4bucket").unbind("click").bind("click", function() {
				//隐藏bucket授权
				$("#property4bucket").hide();
				bucket.updateBucketDataTable();
			});
			
			$("#createObsBucket").unbind("click").bind("click", function() {														
				$("#createObsBucketModal form")[0].reset();
				$("#createBucketName").val("");
				$("#tipCreateBucketName").text("");
				$("#createObsBucketModal").modal("show");					
			});
			
			$("#btnCreateObsBucket").unbind("click").bind("click", function() {	
				bucket.createBucket();
			});
			$("#save_permis4bucket").unbind("click").bind("click", function() {	
				bucket.createPermission4bucket();
			});
		},
		setSelectRowBackgroundColor : function(handler) {
			$("#content_container tr").css("background-color","");
			handler.css("background-color","#BCBCBC");
		},
		// 刷新Table
		updateBucketDataTable : function() {
			var params = {
					"domainName" : obs.domainName,
					"defaultDomain" : obs.defaultDomain
				};
			bucket.service.listBucket(params,function onSuccess(data){
				bucket.datatable.updateData(data);		
			},function onError(msg){
				$.growlUI(Dict.val("common_tip"), Dict.val("obs_select_bucket_error") + msg); 
			});
		},	
		reshowBucket : function (){
	   		var _lis = $("#breadcrumbUl li");
			$(_lis).each(function(index, _li) {
				if(index>0){
					$(_li).remove();
				}				
			});
			$("#breadcrumbUl").find("li:last span").remove();
			$("#obsObjectTableDiv").html("");
			$("#obsObjectTableDiv").append('<table class="table" contenteditable="false" id="obsObjectTable"></table>');
			
			bucket.updateBucketDataTable();
			$("#obsObjectTableDiv").hide();
			$("#obsBucketTableDiv").show();
			$("#toolbar4obs").hide();
			$("#toolbar4object").hide();
			$("#toolbar4bucket").show();
			//隐藏bucket授权
			$("#property4bucket").hide();
			bucket.currentBucketName = "";
			bucket.currentObjectName = "";
		},
		createBucket : function(){
			var bucketName = $("#createBucketName").val();
			if (commonUtils.len(bucketName) < 3) {
				$("#tipCreateBucketName").text(Dict.val("obs_length_must_greater_or_equal_3"));
				return;
			}else{
				$("#tipCreateBucketName").text("");
			}

//			var scoreReg = /^[A-Za-z\-0-9.]+$/;
			var scoreReg = /^[A-Za-z\-0-9\_.]+$/;
			if (!scoreReg.exec(bucketName)) {
				$("#tipCreateBucketName").text(Dict.val("obs_please_enter_letters_numbers_underscores"));
				return;
			}else{
				$("#tipCreateBucketName").text("");
			}
			$("#createObsBucketModal").modal("hide");
			var params = {
					"bucketName" : bucketName,
					"domainName" : obs.domainName,
					"defaultDomain" : obs.defaultDomain
			};
			bucket.service.createBucket(params,function onSuccess(data){
				$.growlUI(Dict.val("common_tip"), Dict.val("obs_create_bucket_success"));
				bucket.updateBucketDataTable();
			},function onError(msg){
				$.growlUI(Dict.val("common_tip"), Dict.val("obs_bucket_same_name_already_exists")); 
			});							
		},
		getCheckedArr_bucket :function() {
			return $("#obsBucketTable tbody input[type='radio']:checked");
		},
	   	destroyBucket : function() {
	   		var checkedArr = bucket.getCheckedArr_bucket();
			var _bucketname = checkedArr.parents("tr").attr("name");
			var confirmModal = new com.skyform.component.Modal(new Date().getTime(),Dict.val("obs_delete_bucket"),"<h4>"+Dict.val("obs_do_you_delete_bucket")+"</h4>",{
				buttons : [
					{
						name : Dict.val("common_determine"),
						onClick : function(){
							bucket.deleteBucket(_bucketname);
							confirmModal.hide();
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
							confirmModal.hide();
						}
					}
				]
			});
			confirmModal.setWidth(300).autoAlign();
			confirmModal.show();
		},
		deleteBucket : function(bucketName){
			var params = {
					"bucketNames" : bucketName,
					"domainName" : obs.domainName,
					"defaultDomain" : obs.defaultDomain									
			};

			bucket.service.deleteBucket(params,function onSuccess(data){
				$.growlUI(Dict.val("common_tip"), Dict.val("obs_delete_bucket_success")); 
				bucket.updateBucketDataTable();
			},function onError(msg){
				$.growlUI(Dict.val("common_tip"), Dict.val("obs_delete_bucket_error") + msg); 
			});	
		},
		showBucketProperty : function(bucketName){
			bucket.currentBucketName = bucketName;
			$("#grantandpermisdiv4bucket").html("");
			if(!bucketName) return;	

			var checkboxArr = bucket.getCheckedArr_bucket();
			if(checkboxArr.length == 0 || checkboxArr.length>1){
				$("#property4bucket").hide();
				$("#property4object").hide();
				return;
			}					
			var _bucketname = checkboxArr.parents("tr").attr("name");
			$("#property4bucket").show();
			$("#property4object").hide();
			var params = {
					"bucketName" : _bucketname,
					"domainName" : obs.domainName,
					"defaultDomain" : obs.defaultDomain
			};

			bucket.service.getBucketAcl(params,function onSuccess(data){
				var grantArray = data;			
				var dom ='';
				$(grantArray).each(function(i) {
					var _grantee = grantArray[i].text;
					var isEveryone = "";
					var isAuthenUsers = "";
					var isMe = "";
					var isDisabled = "";
					if(_grantee == 'everyone'){
						isEveryone = "selected";
					}
					if(_grantee == 'authenUsers'){
						isAuthenUsers = "selected";
					}
					if(_grantee == 'me'){
						isMe = "selected";
						isDisabled = "disabled";
					}
					
					var _permis = grantArray[i].value;
					var permises = _permis.split(",");
					var isRead = "";
					var isWrite = "";
					var isRead_acp = "";
					var isWrite_acp = "";

					$(permises).each(function(i) {								
						if(permises[i].indexOf("READ")>=0 && permises[i].indexOf("READ_ACP")<0){
							isRead = "checked";
						}
						if(permises[i].indexOf("WRITE")>=0 && permises[i].indexOf("WRITE_ACP")<0){
							isWrite = "checked";
						}
						if(permises[i].indexOf("READ_ACP")>=0){
							isRead_acp = "checked";
						}
						if(permises[i].indexOf("WRITE_ACP")>=0){
							isWrite_acp = "checked";
						}
						if(permises[i].indexOf("FULL_CONTROL")>=0){
							isRead = "checked";
							isWrite = "checked";
							isRead_acp = "checked";
							isWrite_acp = "checked";
						}

					});					
					
			        dom += '  <div class="alert alert-info fade in" id="grantAndPremisDiv_'+i+'">'+
//			        '    <button type="button" class="close" data-dismiss="alert">&times;</button>'+
			        Dict.val("obs_licensed_to")+
					'		<select id="sel_permis4bucket_'+i+'" class="grantees" '+isDisabled+' style=" margin-bottom: 3px;">'+
					'			<option value="everyone" '+isEveryone+'>'+Dict.val("obs_possessor")+'</option>'+
					'			<option value="authenUsers" '+isAuthenUsers+'>'+Dict.val("obs_authenticated_user")+'</option>'+
					'			<option value="me" '+isMe+'>'+Dict.val("obs_myself")+'</option>'+
					'		</select>'+		
					'			<input type="checkbox" '+isRead+' class="permissions" '+isDisabled+' value="perm4list" id="chk_perm4list4bucket_'+i+'" style="margin-bottom: 7px;margin-left: 14px;">'+
					'			List  '+
					'			<input type="checkbox" '+isWrite+' class="permissions" '+isDisabled+' value="perm4write" id="chk_perm4write4bucket_'+i+'" style="margin-bottom: 7px;margin-left: 14px;">'+
					'			Upload/Delete  '+
					'			<input type="checkbox" '+isRead_acp+' class="permissions" '+isDisabled+' value="perm4view" id="chk_perm4view4bucket_'+i+'" style="margin-bottom: 7px;margin-left: 14px;">'+
					'			View Permissions  '+
					'			<input type="checkbox" '+isWrite_acp+' class="permissions" '+isDisabled+' value="perm4edit" id="chk_perm4edit4bucket_'+i+'" style="margin-bottom: 7px;margin-left: 14px;">'+
					'			Edit Permissions'+							            
			        '  </div>';
				});	
				$("#grantandpermisdiv4bucket").html(dom);
			},function onError(msg){
				$.growlUI(Dict.val("common_tip"), Dict.val("obs_select_bucket_error") + msg); 
			});	
		},
		createPermission4bucket : function(){
	   		var checkedArr = bucket.getCheckedArr_bucket();
			var chk_bucketname = checkedArr.parents("tr").attr("name");
	        var arr = $("#grantandpermisdiv4bucket .alert");	        
	        var postdata = new Array();
	        $(arr).each(function(index, item) {
	        	var _grant = $("select", item).val();
	        	var checkedArr = $("input[type='checkbox']:checked",item);
	        	var permises = [];
				$(checkedArr).each(function(_index, _item) {
					var _val = $(_item).val();
					permises.push(_val);
				});
				var _permises = permises.join(",");
				postdata[index]= { grantee: _grant, permissions: _permises };
	        });
	        var _postData = $.toJSON(postdata);
			
			var _bucketName = "";
	        if(chk_bucketname){
	        	_bucketName = chk_bucketname;
	        }else{
	        	_bucketName = bucket.currentBucketName;
	        }
			var params = {
					"bucketName" : _bucketName,
					"granteeAndPermis" : _postData,
					"domainName" : obs.domainName,
					"defaultDomain" : obs.defaultDomain				
			};
	        
			bucket.service.setAcl4Bucket(params,function onSuccess(data){
				$.growlUI(Dict.val("common_tip"), Dict.val("obs_save_access_permission_success")); 
			},function onError(msg){
				$.growlUI(Dict.val("common_tip"), Dict.val("obs_save_access_permission_error") + msg); 
			});						
		}
};

var object = {
		service : com.skyform.service.ObsService,
		datatable : new com.skyform.component.DataTable(),
		obsObjects : [],
		
		init : function(){
			
			object.showOrHideDownload();
			object.showOrHideView();
			object.showOrHideCopy();
			object.showOrHidePaste();
			object.showOrHideMove();
			object.showOrHideDeleteObject();
			$("#create_folder_save").unbind("click").bind("click", function() {
				var objectName = $("#createFolderName").val();
				if (commonUtils.len(objectName) ==0) {
					$("#tipCreateFolderName").text(Dict.val("obs_length_must_greater_or_equal"));
					return;
				}else{
					$("#tipCreateFolderName").text("");
				}
				object.createFolder();
			});		
			$("#btn_delete_object").unbind("click").bind("click", function() {
				if($("#btn_delete_object").hasClass("disabled"))return;
				object.destroyObject();
			});	
			$("#btn_uploadFile").unbind("click").bind("click", function() {		
				$("#upload_save").removeClass("disabled");
				$("#upload_save").attr("disabled",false);						
				$('#file2upload').val("");				
				$('#progressbar').hide();
		        var $li = $('#progressbar');
		        $percent = $li.find('.progress .bar');
		        $percent.css( 'width', '0%' );
		        $("#upload_abort").attr("disabled",false);
			    $('#uploadModal').modal({
			    	backdrop: "static"
			    });
				$("#uploadModal").modal("show");
			});
			$("#btn_copy").unbind("click").bind("click", function() {	
				if($("#btn_copy").hasClass("disabled"))return;
				$("#btn_copy").addClass("disabled");

		   		var checkedArr = object.getCheckedArr_object();
				var objectNames = [];
				$(checkedArr).each(function(index, item) {
					var tr = $(item).parents("tr");
					var id = $("input[type='checkbox']", $("td", tr)[0]).val();
					objectNames.push(id);
				});
				var _objectNames = objectNames.join(",");				
				bucket.bucketName4copy = bucket.currentBucketName;
				bucket.folderName4copy = bucket.currentObjectName;				
				bucket.objectName4copy = _objectNames;
				bucket.copyOrMove = 'copy';				
				$("#btn_paste").removeClass("disabled");					
			});
			$("#btn_paste").unbind("click").bind("click", function() {
				if($("#btn_paste").hasClass("disabled"))return;
				$("#btn_paste").addClass("disabled");
				var copyOrmove = bucket.copyOrMove;
				if(copyOrmove == 'copy'){
					var sourceBucket = bucket.bucketName4copy;
					var currentBucket = bucket.currentBucketName;
					var sourceObject = bucket.objectName4copy;
					var currentFolder = bucket.currentObjectName;
					var folderName4copy = bucket.folderName4copy;
					if(sourceBucket == currentBucket && folderName4copy == currentFolder){
						$.growlUI(Dict.val("common_tip"), Dict.val("obs_same_not_copy_folder_select_different_folder")); 
						return;
					}
					var params = {
							"sourceBucketName" : sourceBucket,
							"sourceObjectKey" : sourceObject,
							"destinationBucketName" : currentBucket,
							"destinationFolderName" : currentFolder,
							"domainName" : obs.domainName,
							"defaultDomain" : obs.defaultDomain				
					};

					object.service.copyObject(params,function onSuccess(data){
						object.updateObjectDataTable(bucket.currentObjectName);
						$.growlUI(Dict.val("common_tip"), Dict.val("obs_paste_success")); 
					},function onError(msg){
						$.growlUI(Dict.val("common_tip"), Dict.val("obs_paste_error") + msg); 
					});											

				}else if(copyOrmove == 'move'){
					var sourceBucket = bucket.bucketName4move;
					var currentBucket = bucket.currentBucketName;
					var sourceObject = bucket.objectName4move;
					var currentFolder = bucket.currentObjectName;
					var folderName4move = bucket.folderName4move;
					if(sourceBucket == currentBucket && folderName4move == currentFolder){
						$.growlUI(Dict.val("common_tip"), Dict.val("obs_same_not_move_folder_select_different_folder")); 
						return;						
					}
					var params = {
							"sourceBucketName" : sourceBucket,
							"sourceObjectKey" : sourceObject,
							"destinationBucketName" : currentBucket,
							"destinationFolderName" : currentFolder,
							"domainName" : obs.domainName,
							"defaultDomain" : obs.defaultDomain							
					};

					object.service.moveObject(params,function onSuccess(data){
						object.updateObjectDataTable(bucket.currentObjectName);
						$.growlUI(Dict.val("common_tip"), Dict.val("obs_paste_success")); 
					},function onError(msg){
						$.growlUI(Dict.val("common_tip"), Dict.val("obs_paste_error") + msg); 
					});																
				}
				$("#btn_copy").removeClass("disabled");
				$("#btn_move").removeClass("disabled");	
			});
			$("#btn_move").unbind("click").bind("click", function() {
				if($("#btn_move").hasClass("disabled"))return;
				$("#btn_move").addClass("disabled");

		   		var checkedArr = object.getCheckedArr_object();
				var objectNames = [];
				$(checkedArr).each(function(index, item) {
					var tr = $(item).parents("tr");
					var id = $("input[type='checkbox']", $("td", tr)[0]).val();
					objectNames.push(id);
				});
				var _objectNames = objectNames.join(",");
				bucket.bucketName4move = bucket.currentBucketName;
				bucket.folderName4move = bucket.currentObjectName;				
				bucket.objectName4move = _objectNames;
				bucket.copyOrMove = 'move';
				$("#btn_paste").removeClass("disabled");					

			});		
			
			$("#upload_save").unbind("click").bind("click", function() {	
				var _filename = $('#file2upload').val();				
				if(!_filename){
					$("#tipFile2upload").text(Dict.val("common_please_select_file"));
					return;
				}else{
					$("#tipFile2upload").text("");
				}
//				var re = /^(doc|pdf|txt|rar|zip)$/;
				var _extend = _filename.substring(_filename.lastIndexOf(".")+1);
				var re = /^(htm|html|jsp|asp|js|php|aspx|shtm|shtml|xhtml|cgi|mht)$/;
				var isValid = (_extend && re.test(_extend));
				if (isValid) {
					$("#tipFile2upload").text(Dict.val("obs_such_files_not_allowed_upload"));
					return;
				}else{
					$("#tipFile2upload").text("");
				}
				$("#upload_save").addClass("disabled");
				$("#upload_save").attr("disabled",true);
				
		    	var _bucketName = bucket.currentBucketName;
		        var _objectName = bucket.currentObjectName;	
		        if(!_bucketName) {return;}
		        $('#progressbar').show();
			    var options = { 
			            data: { "bucketName":_bucketName, "objectName":_objectName,"domainName":obs.domainName,"defaultDomain":obs.defaultDomain },
			            beforeSend : object.showRequest,
			            type : "POST",
			            dataType:  'json',
			            timeout  : 1800000,
			            uploadProgress : object.showUploadProgress,
			            success: function(rs) {	   
							$("#uploadModal").modal("hide");
					        var _objectName = bucket.currentObjectName;	
					        if(!_objectName) {_objectName = "";}
					        object.updateObjectDataTable(_objectName); 
					        $.growlUI(Dict.val("common_tip"), Dict.val("obs_upload_success")); 	
					        var $li = $('#progressbar');
					        $percent = $li.find('.progress .bar');
					        $percent.css( 'width', '0%' );
			    	    },			            	
			            error    : function() {
			    		}
			    }; 
		        $("#uploadObjectForm").ajaxSubmit(options);
			});
			$("#upload_abort").unbind("click").bind("click", function() {
				if (currXhr) {
		            currXhr.abort();
		        }
			});
			
			$("#btn_download").unbind("click").click(function(){
				if($("#btn_download").hasClass("disabled"))return;
				var checkboxArr = object.getCheckedArr_object();
				if(checkboxArr.length == 0 || checkboxArr.length>1){
					return;
				}
				var _bucketName = bucket.currentBucketName;
		   		var checkedArr = object.getCheckedArr_object();
				var objectNames = [];
				$(checkedArr).each(function(index, item) {
					var tr = $(item).parents("tr");
					var id = $("input[type='checkbox']", $("td", tr)[0]).val();
					objectNames.push(id);
				});
			    //console.log("bucketName="+_bucketName+"&objectName="+objectNames[0]);
				
				$(this).attr("href","/portal/pr/obs/getObject?bucketName="+_bucketName+"&objectName="+objectNames[0]+"&domainName="+obs.domainName+"&defaultDomain="+obs.defaultDomain);
			});
			$("#btn_view").click(function(){
				if($("#btn_view").hasClass("disabled"))return;
				var checkboxArr = object.getCheckedArr_object();
				if(checkboxArr.length == 0 || checkboxArr.length>1){
					return;
				}
				var _bucketName = bucket.currentBucketName;
		   		var checkedArr = object.getCheckedArr_object();
				var objectNames = [];
				$(checkedArr).each(function(index, item) {
					var tr = $(item).parents("tr");
					var id = $("input[type='checkbox']", $("td", tr)[0]).val();
					objectNames.push(id);
				});
			    //console.log("bucketName="+_bucketName+"&objectName="+objectNames[0]);
//				$("#getImage2").attr("src",System.getContextPath() + "/indent/download?filename="+result.data.file+"&username="+row.attr("account"));
				$("#viewPicture").hide();
				var filename = objectNames[0].toLocaleLowerCase();
				if(filename.indexOf(".txt")>=0){
					$("#viewTxt").attr("href","/portal/pr/obs/viewObject?bucketName="+_bucketName+"&objectName="+objectNames[0]+"&domainName="+obs.domainName+"&defaultDomain="+obs.defaultDomain);
					$('#viewTxt').find('span').trigger('click');
				}else if(filename.indexOf(".jpg")>=0 || filename.indexOf(".png")>=0
						|| filename.indexOf(".bmp")>=0 || filename.indexOf(".jpeg")>=0
						|| filename.indexOf(".gif")>=0 ){  //BMP、JPG、JPEG、PNG、GIF
					$("#viewPicture").show();
					$("#viewPicture").attr("src","/portal/pr/obs/getObject?bucketName="+_bucketName+"&objectName="+objectNames[0]+"&domainName="+obs.domainName+"&defaultDomain="+obs.defaultDomain);
					$("#viewModal").modal("show");
				}else{
				}
			});
			$("#save_permis4object").unbind("click").bind("click", function() {	
				object.createPermission4object();
			});
			$("#save_metadata4object").unbind("click").bind("click", function() {	
				object.createMetadata4object();
			});
			$("#addPermis4object").unbind("click").bind("click", function() {
				var container = $("#grantandpermisdiv4object");
		        var dom = '  <div class="alert alert-info fade in">'+
//		        '    <button type="button" class="close" data-dismiss="alert">&times;</button>'+
		        Dict.val("obs_licensed_to")+
				'		<select class="grantees" style=" margin-bottom: 3px;">'+
				'			<option value="everyone">'+Dict.val("obs_possessor")+'</option>'+
				'			<option value="authenUsers">'+Dict.val("obs_authenticated_user")+'</option>'+
				'			<option value="me">'+Dict.val("obs_myself")+'</option>'+
				'		</select>'+											
				'			<input type="checkbox" class="permissions" value="perm4read" style="margin-bottom: 7px;margin-left: 14px;">'+
				'			Open/Download'+
				'			<input type="checkbox" class="permissions" value="perm4view" style="margin-bottom: 7px;margin-left: 14px;">'+
				'			View Permissions'+
				'			<input type="checkbox" class="permissions" value="perm4edit" style="margin-bottom: 7px;margin-left: 14px;">'+
				'			Edit Permissions'+							            
		        '  </div>';			
				$(dom).appendTo(container);
			});	
			$("#addMetadata4object").unbind("click").bind("click", function() {
				var container = $("#metadatadiv4object");
				var dom = '  <div class="alert alert-info fade in">'+
//		            '<button type="button" class="close" data-dismiss="alert">&times;</button>'+
		            'Key:<input type="text" name="metaKey" />'+
		            'Value:<input type="text" name="metaValue" />'+
		          '</div>';								
				$(dom).appendTo(container);				
			});
		},	
		
		showRequest: function(xhr, opts) {
            currXhr = xhr;
        },
		afterUpload : function(){
				$("#uploadModal").modal("hide");
		        var _objectName = bucket.currentObjectName;	
		        if(!_objectName) {_objectName = "";}
		        object.updateObjectDataTable(_objectName); 
		        $.growlUI(Dict.val("common_tip"), Dict.val("obs_upload_success")); 	
		        var $li = $('#progressbar');
		        $percent = $li.find('.progress .bar');
		        $percent.css( 'width', '0%' );		        
		},
		showUploadProgress : function(){
				$('#progressbar').show();
		        var $li = $('#progressbar');
		        $percent = $li.find('.progress .bar');
		        $li.find('p.state').text(Dict.val("obs_uploading"));
				object.service.getPercent4object("","",function onSuccess(data){
					if (data == '100%') {
						$("#upload_abort").attr("disabled",true);
					}else{
						$("#upload_abort").attr("disabled",false);
					}
					var per = data.substr(0,data.length-1);
					per = per*0.8;
			        $percent.css( 'width', per+'%' );
				},function onError(msg){
				});				
		},
		showOrHideDownload : function() {
			var checkboxArr = object.getCheckedArr_object();
			if(checkboxArr.length == 0 || checkboxArr.length>1){
				$("#btn_download").addClass("disabled");
			} else {
				$("#btn_download").removeClass("disabled");
			}
		},
		showOrHideView : function() {
			var checkboxArr = object.getCheckedArr_object();
			if(checkboxArr.length == 0 || checkboxArr.length>1){
				$("#btn_view").addClass("disabled");
			} else {
				var objectNames = [];
				$(checkboxArr).each(function(index, item) {
					var tr = $(item).parents("tr");
					var id = $("input[type='checkbox']", $("td", tr)[0]).val();
					objectNames.push(id);
				});
				var filename = objectNames[0].toLocaleLowerCase();
				if(filename.indexOf(".txt")>=0 || filename.indexOf(".jpg")>=0 || filename.indexOf(".png")>=0
						|| filename.indexOf(".bmp")>=0 || filename.indexOf(".jpeg")>=0
						|| filename.indexOf(".gif")>=0 ){ //BMP、JPG、JPEG、PNG、GIF
					$("#btn_view").removeClass("disabled");
				}else{
					$("#btn_view").addClass("disabled");										
				}
			}
		},
		
		showOrHideCopy : function() {
			var checkboxArr = object.getCheckedArr_object();
			if(checkboxArr.length == 0){
				$("#btn_copy").addClass("disabled");
			} else {
				$("#btn_copy").removeClass("disabled");	
			}
		},
		showOrHidePaste : function() {
				$("#btn_paste").addClass("disabled");
		},		
		showOrHideMove : function() {
			var checkboxArr = object.getCheckedArr_object();
			if(checkboxArr.length == 0){
				$("#btn_move").addClass("disabled");
			} else {
				$("#btn_move").removeClass("disabled");	
			}
		},
		showOrHideDeleteObject : function() {
			var checkboxArr = object.getCheckedArr_object();
			if(checkboxArr.length == 0){
				$("#btn_delete_object").addClass("disabled");
			} else {
				$("#btn_delete_object").removeClass("disabled");	
			}
		},		
		describeObjects : function(bucketName){
			var params = {
					"bucketName" : bucketName,
					"objectName" : "",
					"domainName" : obs.domainName,
					"defaultDomain" : obs.defaultDomain
			};			
			object.service.listObjects(params,function onSuccess(data){
				$("#obsObjectTableDiv").show();
				object.obsObjects = data;
				object.renderDataTable(data);	
				
				$("#property4bucket").hide();
				
			},function onError(msg){
				$.growlUI(Dict.val("common_tip"), Dict.val("obs_select_bucket_error") + msg); 
			});	
		},
		renderDataTable : function(data) {
			object.datatable.renderByData("#obsObjectTable", {
					"data" : data,
					"iDisplayLength": 5,
					"columnDefs" : [
					     {title : "<input type='checkbox' id='checkAll4object'>", name : "name"},
					     {title : Dict.val("common_name"), name : "name"},
					     {title : Dict.val("obs_type"), name : "storageClass"},
					     {title : Dict.val("obs_size"), name : "contentLength"},
					     {title : Dict.val("obs_modified_date"), name : "lastModifiedDate"}
					     //{title : "所属用户", name : "ownUserAccount"}
					],
					"onColumnRender" : function(columnIndex, columnMetaData, columnData) {
						 var text = columnData[''+columnMetaData.name] || "";
						 if(columnIndex ==0) {
							 var _storageClass = columnData['storageClass'] || "";							 
							 var _objectname = columnData['name'] || "";
							 text = '<input type="checkbox" value="'+text+'" onclick="object.showObjectProperty(\''+_objectname+'\',\''+_storageClass+'\')">';
						 }
						 
						 if (columnIndex ==1) {
							 var _fileName = text;
							 var _last = text.charAt(text.length-1);
							 if(text && text.indexOf("/")>0 && _last){
								 if(_last == '/'){
									 var arr = text.split("/");
									 if(arr.length>1){
										 _fileName = arr[arr.length-2];
									 }						
									 text = '<a onclick="object.updateObjectDataTable(\''+text+'\')" href="#">' + _fileName + '</a>';
								 }else{
									 var arr = text.split("/");
									 if(arr.length>1){
										 _fileName = arr[arr.length-1];
									 }	
									 var _objectname = columnData['name'] || "";
								 }
							 }					 
						 }

						 if (columnMetaData.name == "storageClass") {
							 if(text == 'STANDARD'){
								 text = Dict.val("obs_file");
							 }
						 }
						 if (columnMetaData.name == "contentLength") {
							 if(text){
								 text  = parseFloat(parseFloat(text)/1024).toFixed(2);
							 }else{
								 text = "";
							 }							 
						 }
						 if (columnMetaData.name == "lastModifiedDate") {
							 if(text){
								 text = new Date(text).format("yyyy-MM-dd hh:mm:ss");
							 }
							 
						 }
						 return text;
					}, 
					"afterRowRender" : function(rowIndex, data, tr){
						tr.attr("bucketName", data.bucketName)
						.attr("objectName", data.name)
						.attr("storageClass",data.storageClass);
					},
					"afterTableRender" : function() {
						$("#obsObjectTable_filter").css("position","absolute");
						$("#obsObjectTable_filter").css("right","0px");
						$("#obsObjectTable_filter").css("top","-52px");
						$("#obsObjectTable_filter").css("style","position:absolute;right:0px;top:-52px;");
						$("#obsObjectTable_filter input").css("width","100px");

						// 翻页的时候清除前一页选中的checkbox，同时将更多操作置为不可用
						$("#obsObjectTable input[type='checkbox']").attr("checked", false);
			            //全选取消选中
			            $("#checkAll4object").attr("checked", false);			             
			            object.bindEvent();
						var firstRow = $("#obsObjectTable tbody").find("tr:eq(0)");
						var firstObjectName = firstRow.attr("objectName");
						var storageClass = firstRow.attr("storageClass");
						firstRow.css("background-color","#BCBCBC");
						object.setSelectRowBackgroundColor(firstRow);
					}
				}
			);
			object.datatable.addToobarButton("#disktoolbar");
		},
		bindEvent : function() {
			$("#obsObjectTable tbody tr").mousedown(function(e) {  
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
			             
			             // 选中右键所单击的行，取消其他行的选中效果
			             $("tbody input[type='checkbox']").attr("checked", false);
			             $("input[type='checkbox']",$(this)).attr("checked", true);
			             //全选取消选中
			             $("#checkAll4object").attr("checked", false);			             
			             //同步
			             object.showOrHideDownload();
			             object.showOrHideView();
			             object.showOrHideCopy();
			             object.showOrHidePaste();
			             object.showOrHideMove();
			             object.showOrHideDeleteObject();
			     } 			    
			    object.setSelectRowBackgroundColor($(this));
			}); 	
			
			$("#checkAll4object").unbind("click").bind("click", function(e) {
				var checked = $(this).attr("checked") || false;
		        $("#obsObjectTable input[type='checkbox']").attr("checked",checked);	
		        object.showOrHideDownload();
		        object.showOrHideView();
		        object.showOrHideCopy();
		        object.showOrHidePaste();
		        object.showOrHideMove();
		        object.showOrHideDeleteObject();
		        e.stopPropagation();
			});
			
			$("#obsObjectTable tbody input[type='checkbox']").unbind("click").bind("click", function() {
				object.showOrHideDownload();
				object.showOrHideView();
				object.showOrHideCopy();
				object.showOrHidePaste();
				object.showOrHideMove();
				object.showOrHideDeleteObject();
			});
			
			$("#btnRefresh4object").unbind("click").bind("click", function() {
				object.updateObjectDataTable(bucket.currentObjectName);
			});			
		},
		setSelectRowBackgroundColor : function(handler) {
			$("#content_container tr").css("background-color","");
			handler.css("background-color","#BCBCBC");
		},
		// 刷新Table
		updateObjectDataTable : function(objectName) {
			$("#obsObjectTableDiv").show();
			$("#obsBucketTableDiv").hide();
			$("#property4bucket").hide();
			bucket.currentObjectName = objectName;
	   		var _lis = $("#breadcrumbUl li");
			$(_lis).each(function(index, _li) {
				if(index>1){
					$(_li).remove();
				}				
			});
			$("#breadcrumbUl").find("li:last span").remove();
			var bucketName = bucket.currentBucketName;		
			if(objectName && objectName.indexOf("/")>0){
				var arr = objectName.split('/'); 
				for(var i=0;i<arr.length-1;i++){
					var fileName = arr[i];
					var _objectname = "";
					for(var j=0;j<=i;j++){
						_objectname += arr[j]+"/";
					}					
					$("#breadcrumbUl").find("li:last a:first").after('<span class="divider">/</span>');
					$("#breadcrumbUl").append('<li><a style="color:#000;" onclick="object.updateObjectDataTable(\''+_objectname+'\')" href="#">'+fileName+'</a> </li>');
				}
			}
			var params = {
					"bucketName" : bucketName,
					"objectName" : objectName,
					"domainName" : obs.domainName,
					"defaultDomain" : obs.defaultDomain
			};			
			object.service.listObjects(params,function onSuccess(data){
				object.obsObjects = data;
				object.datatable.updateData(data);	
				object.bindEvent();
			},function onError(msg){
				$.growlUI(Dict.val("common_tip"), Dict.val("common_query_error") + msg); 
			});
		},
		createFolder : function(){
			var bucketName = bucket.currentBucketName;
			var objectName = bucket.currentObjectName;
			var folderName = $("#createFolderName").val();
			$("#createFolderModal").modal("hide");
			var params = {
					"bucketName" : bucketName,
					"objectName" : objectName,
					"folderName" : folderName,
					"domainName" : obs.domainName,
					"defaultDomain" : obs.defaultDomain				
			};
			
			object.service.createFolder(params,function onSuccess(data){										
				object.updateObjectDataTable(bucket.currentObjectName);
				$.growlUI(Dict.val("common_tip"), Dict.val("obs_create_new_directory_success"));
			},function onError(msg){
				$.growlUI(Dict.val("common_tip"), Dict.val("obs_create_new_directory_error")+msg); 
			});					
		},		
		getCheckedArr_object :function() {
			return $("#obsObjectTable tbody input[type='checkbox']:checked");
		},		
	   	destroyObject : function() {
	   		var checkedArr = object.getCheckedArr_object();
	   		if(checkedArr.length==0){
	   			$.growlUI(Dict.val("common_tip"), Dict.val("common_please_select_file"));
	   			return;
	   		}
			var objectNames = [];
			var deleteTip = "";
			if(checkedArr.length==1){
				deleteTip = Dict.val("obs_you_sure_delete");
			}else{
				deleteTip = Dict.val("obs_you_sure_bulk_delete");
			}	   		

			$(checkedArr).each(function(index, item) {
				var tr = $(item).parents("tr");
				var id = $("input[type='checkbox']", $("td", tr)[0]).val();
				objectNames.push(id);
				var _storageClass = tr.attr("storageClass");
				if(_storageClass != 'STANDARD'){
					deleteTip = Dict.val("obs_delete_directory_also_delete_file_do_you");
				}
			});
			var confirmModal = new com.skyform.component.Modal(new Date().getTime(),Dict.val("obs_delete_obs"),"<h4>"+deleteTip+"</h4>",{
				buttons : [
					{
						name : Dict.val("common_determine"),
						onClick : function(){
							var _objectNames = objectNames.join(",");
							object.deleteObject(_objectNames);
							confirmModal.hide();
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
							confirmModal.hide();
						}
					}
				]
			});
			confirmModal.setWidth(300).autoAlign();
			confirmModal.show();
		},		
		deleteObject : function(objectKeys){
			var bucketName = bucket.currentBucketName;
			var params = {
					"bucketName" : bucketName,
					"objectKeys" : objectKeys,
					"domainName" : obs.domainName,
					"defaultDomain" : obs.defaultDomain				
			};

			object.service.deleteObject(params,function onSuccess(data){
				object.updateObjectDataTable(bucket.currentObjectName);
				$.growlUI(Dict.val("common_tip"), Dict.val("obs_delete_obs_success")); 
			},function onError(msg){
				$.growlUI(Dict.val("common_tip"), Dict.val("obs_delete_obs_error") + msg); 
			});				
		},
		showObjectProperty : function(objectName,storageClass){
			$("#grantandpermisdiv4object").html("");
			if(!objectName || !storageClass) return;		
			var checkboxArr = object.getCheckedArr_object();
			if(checkboxArr.length == 0 || checkboxArr.length>1){				
				$("#property4bucket").hide();
				$("#property4object").hide();			
				return;
			}

			if(storageClass == 'STANDARD'){
				$("#property4bucket").hide();
				$("#property4object").show();				
			}
			var bucketName = bucket.currentBucketName;
			var _objectname = checkboxArr.parents("tr").attr("objectName");
			$("#url4a").html("http://s3.wocloud.cn/"+bucketName+"/"+_objectname);
//			$("#url4a").attr("href","http://s3.wocloud.cn/"+bucketName+"/"+_objectname);
			var params = {
					"bucketName" : bucketName,
					"objectName" : _objectname,
					"domainName" : obs.domainName,
					"defaultDomain" : obs.defaultDomain				
			};

			object.service.getObjectAcl(params,function onSuccess(data){
				var grantArray = data;			
				var dom ='';
				$(grantArray).each(function(i) {
					var _grantee = grantArray[i].text;
					var isEveryone = "";
					var isAuthenUsers = "";
					var isMe = "";
					var isDisabled = "";
					if(_grantee == 'everyone'){
						isEveryone = "selected";
					}
					if(_grantee == 'authenUsers'){
						isAuthenUsers = "selected";
					}
					if(_grantee == 'me'){
						isMe = "selected";
					    isDisabled = "disabled";
					}					
					var _permis = grantArray[i].value;
					var permises = _permis.split(",");
					var isRead = "";
					var isRead_acp = "";
					var isWrite_acp = "";
					$(permises).each(function(i) {								
						if(permises[i].indexOf("READ")>=0 && permises[i].indexOf("READ_ACP")<0){
							isRead = "checked";
						}
						if(permises[i].indexOf("READ_ACP")>=0){
							isRead_acp = "checked";
						}
						if(permises[i].indexOf("WRITE_ACP")>=0){
							isWrite_acp = "checked";
						}
						if(permises[i].indexOf("FULL_CONTROL")>=0){
							isRead = "checked";
							isRead_acp = "checked";
							isWrite_acp = "checked";
						}
					});					
					dom += '  <div class="alert alert-info fade in">'+
//			        '    <button type="button" class="close" data-dismiss="alert">&times;</button>'+
					Dict.val("obs_licensed_to")+
					'		<select id="sel_permis4object_'+i+'" class="grantees" '+isDisabled+' style=" margin-bottom: 3px;">'+
					'			<option value="everyone" '+isEveryone+'>'+Dict.val("obs_possessor")+'</option>'+
					'			<option value="authenUsers" '+isAuthenUsers+'>'+Dict.val("obs_authenticated_user")+'</option>'+
					'			<option value="me" '+isMe+'>'+Dict.val("obs_myself")+'</option>'+
					'		</select>'+											
					'			<input type="checkbox" '+isRead+' class="permissions" '+isDisabled+' value="perm4read" id="chk_perm4read4object_'+i+'" style="margin-bottom: 7px;margin-left: 14px;">'+
					'			Open/Download'+
					'			<input type="checkbox" '+isRead_acp+' class="permissions" '+isDisabled+' value="perm4view" id="chk_perm4view4object_'+i+'" style="margin-bottom: 7px;margin-left: 14px;">'+
					'			View Permissions'+
					'			<input type="checkbox" '+isWrite_acp+' class="permissions" '+isDisabled+' value="perm4edit" id="chk_perm4edit4object_'+i+'" style="margin-bottom: 7px;margin-left: 14px;">'+
					'			Edit Permissions'+							            
			        '  </div>';
				});	
				$("#grantandpermisdiv4object").html(dom);
				object.showMetadata4object();
			},function onError(msg){
				$.growlUI(Dict.val("common_tip"), Dict.val("obs_select_access_permission_error") + msg); 
			});	
		},
		createPermission4object : function(){
			var bucketName = bucket.currentBucketName;
	   		var checkedArr = object.getCheckedArr_object();
			var objectNames = [];
			$(checkedArr).each(function(index, item) {
				var tr = $(item).parents("tr");
				var id = $("input[type='checkbox']", $("td", tr)[0]).val();
				objectNames.push(id);
			});
			var _objectName = "";
			var objectName = objectNames[0];
			if(objectName){
				_objectName = objectName;
			}else{
				_objectName = bucket.currentObjectName;
			}
			
	        var arr = $("#grantandpermisdiv4object .alert");
	        var postdata = new Array();
	        $(arr).each(function(index, item) {
	        	var _grant = $("select", item).val();
	        	var checkedArr = $("input[type='checkbox']:checked",item);
	        	var permises = [];
				$(checkedArr).each(function(_index, _item) {
					var _val = $(_item).val();
					permises.push(_val);
				});
				var _permises = permises.join(",");
				postdata[index]= { grantee: _grant, permissions: _permises };
	        });
	        var _postData = $.toJSON(postdata);
			var params = {
					"bucketName" : bucketName,
					"objectName" : _objectName,
					"granteeAndPermis" : _postData,
					"domainName" : obs.domainName,
					"defaultDomain" : obs.defaultDomain				
//					"grantee" : grantee,
//					"permissions" : permissions
			};

			object.service.setAcl4object(params,function onSuccess(data){
				$.growlUI(Dict.val("common_tip"), Dict.val("obs_save_access_permission_success")); 
			},function onError(msg){
				$.growlUI(Dict.val("common_tip"), Dict.val("obs_save_access_permission_error") + msg); 
			});							
		},
		showMetadata4object : function(objectName,storageClass){
			$("#metadatadiv4object").html("");
			var checkboxArr = object.getCheckedArr_object();		
			var bucketName = bucket.currentBucketName;
			var _objectname = checkboxArr.parents("tr").attr("objectName");
			var params = {
					"bucketName" : bucketName,
					"objectName" : _objectname,
					"domainName" : obs.domainName,
					"defaultDomain" : obs.defaultDomain									
			};

			object.service.getMetadata4object(params,function onSuccess(data){
				var metaArray = data;			
				var dom ='';
				$(metaArray).each(function(i) {
					var _text = metaArray[i].text;
					var _value = metaArray[i].value;
					dom += '<div class="alert alert-info fade in">'+
//			            '<button type="button" class="close" data-dismiss="alert">&times;</button>'+
			            'Key:<input type="text" name="metaKey" value="'+_text+'" />'+
			            'Value:<input type="text" name="metaValue" value="'+_value+'" />'+
			          '</div>';
					
				});
				$("#metadatadiv4object").html(dom);
			});	
		},
		createMetadata4object : function(){
			var bucketName = bucket.currentBucketName;
	   		var checkedArr = object.getCheckedArr_object();
			var objectNames = [];
			$(checkedArr).each(function(index, item) {
				var tr = $(item).parents("tr");
				var id = $("input[type='checkbox']", $("td", tr)[0]).val();
				objectNames.push(id);
			});
			var objectName = objectNames[0];

	        var arr = $("#metadatadiv4object .alert");
	        var postdata = new Array();
	        $(arr).each(function(index, item) {
	        	var _key = $("input:first", item).val();
	        	var _value = $("input:last", item).val();
				postdata[index]= { key: _key, value: _value };
	        });
	        var _postData = $.toJSON(postdata);
			var params = {
					"bucketName" : bucketName,
					"objectName" : objectName,
					"keyAndValues" : _postData,
					"domainName" : obs.domainName,
					"defaultDomain" : obs.defaultDomain				
			};

			object.service.addMetadata4object(params,function onSuccess(data){
				$.growlUI(Dict.val("common_tip"), Dict.val("obs_save_source_data_success")); 
			},function onError(msg){
				$.growlUI(Dict.val("common_tip"), Dict.val("obs_save_source_data_error") + msg); 
			});										
		},
		viewObject : function(obs_id){
			var _bucketName = bucket.currentBucketName;
			console.log("_bucketName="+_bucketName+"==objectName="+obs_id);			
		}

};