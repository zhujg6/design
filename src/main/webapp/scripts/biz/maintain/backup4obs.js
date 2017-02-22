window.currentInstanceType='obs';
var timervdisk = null;
//var AutoUpdater_obs = {
//		updaters : {
//			"obs" : {
//				cache : [],								// 之前缓存的数据
//				instances : [],							// 当前获取的最新的数据
//				isNeedUpdate : function(instance){
//					var oldInstance = this.cache["" + instance.id];
//					if(!oldInstance) return true;
//					if(oldInstance.state != instance.state) return true;		// 当实例状态发生变化时更新数据
//					
//					if(oldInstance.optState != instance.optState) return true;	// 当操作状态发声变化时，告诉需要更新数据
//					return false;
//				},
//				update : function(instance){
//					var row = $("#obsServiceTable tr[id='"+instance.id+"']");
//					if(row && obs.datatable) {
//						obs.datatable.updateRow(row,instance);
//					}
//				},
//				fetchData : function(callback){
//					var self = this;
////					var resourcePool = "huhehaote";
//					obs.service4yaxin.describeObsDetail(function(instances){
//						self.cache = self.instances;
//						self.instances = [];
//						$(instances).each(function(i,instance){
//							self.instances["" + instance.id] = instance;
//							// 设置回掉
//							if(callback && typeof callback == 'function') {
//								callback(instance);
//							}
//						});				
////						if(obs.obsInstance.length != instances.length) obs.updateDataTable();
//					});
//				}
//			}
//		},
//		startObs : function(){
//			var updater = AutoUpdater_obs.updaters["" + currentInstanceType];
//			if (updater) {
//				updater.getInterval = updater.getInterval || function() {
//					return 30 * 1000;
//				};
//				timervdisk = window.setInterval(function(){
//					updater.fetchData(function(instances) {
//						$(instances).each(function(i,instance){
//							// 检查是否需要更新
//							if(updater.isNeedUpdate(instance)) {
//								// 更新数据
//								updater.update(instance);
//							}
//						});
//					});
//				}, updater.getInterval());
//			}
//		},
//		stopVdisk : function(){
//			window.clearInterval(timervdisk);
//		}
//};

window.Controller = {
		init : function(){
			obs.init();	
		}
	};


var product = {};
var obs = {
	obsInstance : null,
	s3_url : null,
	account : null,
	password : null,
	s3_access_key : null,
	s3_secure_key : null,
	obsInsState : null,
	datatable : new com.skyform.component.DataTable(),
	service : com.skyform.service.ObsService,
	service4yaxin : com.skyform.service.ObsService4yaxin,
	init : function(ebs) {
		obs.getObsInstance(ebs);
		obs.bindEvent();
		//点击数据备份
//		$("#btn_backup").bind('click',function(e){
//			obs.backup();					
//		});	

		//点击删除按钮
//		$("#btn_delete").bind('click',function(e){
//			obs.handleLi(3);					
//		});	
//		
//		$("#btn_s3_key").bind('click',function(e){
//			$("#s3KeyModal").modal("show");					
//		});	
		
		$("#btnRefresh").unbind("click").bind("click", function() {					
			obs.updateObsDataTable();
//			obs.refreshObs();
		});

		$("#recover").bind('click',function(e){
			obs.onOptionSelected(1);				
		});	
		$("#btn_delete_bucket_taske").bind('click',function(e){
			obs.onOptionSelected(2);				
		});
//		obs.refreshObs();		
//		obs.queryProductPrtyInfo(4);
//		obs.getFee();
//		$("#btn_delete_bucket_taske").unbind("click").bind("click", function() {
//			var hasObject = true;
//	   		var bucketName = obs.getCheckedArr().parents("tr").attr("volumename");	
//	   		alert(bucketName);
//
//			var resourcePool = $("#pool").val();	
//			var servers = Config.ezs3Server;
//			var _domain = "";
//			$(servers).each(function(i){
//				if(servers[i].pool == resourcePool){
//					_domain = servers[i].value;
//				}			
//			});
//			var defaultDomain = Config.defaultDomain;
//			var params = {
//					"bucketName" : bucketName,
//					"objectName" : "",
//					"domainName" : _domain,
//					"defaultDomain" : defaultDomain								
//			};
//	   		com.skyform.service.ObsService.listObjects(params,function onSuccess(data){
//				//object.obsObjects = data;
//				if(!data){
//					hasObject = false;						
//				}else{
//					if(data.length==0){
//						hasObject = false;
//					}						
//				}
//				if(!hasObject){
//					obs.destroyBucket();
//				}else{
//					$.growlUI("提示", "bucket中包含文件夹及文件, 不能删除"); 
//				}					
//			},function onError(msg){
//				
//			});					
//		});	
	},
	
	refreshObs : function(){
		obs.showOrHideRecoverBtn();
		if(obs.obsInstance != null){
			if(obs.obsInstance.state.indexOf('error') >= 0){
				$.growlUI("提示", "对象存储创建失败,请销毁");		
			}
		}
	},
	onOptionSelected : function(index) {
		if(index == 1){
			obs.showRecover();
		}else if(index == 2){
			obs.showDeleteBack();
		}
	},
	getCheckedArr :function() {
		return $("#obsServiceTable tbody input[type='checkbox']:checked");
	},
	showDeleteBack : function() {
		var _bucketname = obs.getCheckedArr().parents("tr").attr("dst");
		var checkedArr =  obs.getCheckedArr();
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
			deleteTip = "您确认要删除吗?";
		}else{
			deleteTip = "您确认要批量删除吗?";
		}
		obs.confirmModal = new com.skyform.component.Modal(new Date().getTime(),"删除备份","<h4>"+deleteTip+"</h4>",{
				buttons : [
					{
						name : "确定",
						onClick : function(){
							// 删除虚拟硬盘
							var vdiskVolumeIds = volumeIds.join(",");
							com.skyform.service.NasService4yaxin.destroy(vdiskVolumeIds,function onSuccess(data){
								//$.growlUI("提示", "删除申请提交成功, 正在销毁中..."); 
								obs.deleteBucket(_bucketname);
								obs.confirmModal.hide();
								// refresh
								obs.updateDataTable();									
							},function onError(msg){
								$.growlUI("提示", "删除申请提交失败：" + msg);
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
							obs.confirmModal.hide();
						}
					}
				]
			});
			obs.confirmModal.setWidth(500).autoAlign();
			obs.confirmModal.show();
	},
	showRecover : function() {
		var checkedArr =  obs.getCheckedArr();
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
			deleteTip = "您确认要从备份恢复吗?";
		}else{
			deleteTip = "您确认要批量从备份恢复吗?";
		}
			obs.confirmModal = new com.skyform.component.Modal(new Date().getTime(),"从备份恢复","<h4>"+deleteTip+"</h4>",{
				buttons : [
					{
						name : "确定",
						onClick : function(){
							var snapid = volumeIds.join(",");
							var volumeid = obs.getCheckedArr().parents("tr").attr("volumeid");
							var params = {
									"volumeid":parseInt(volumeid),
									"snapid":parseInt(snapid)
								};
							com.skyform.service.VdiskService4yaxin.rollbackVolumeFromSnap(params,function onSuccess(data){
								$.growlUI("提示", "恢复申请提交成功, 正在恢复中..."); 
								obs.confirmModal.hide();
								// refresh
								obs.updateDataTable();									
							},function onError(msg){
								$.growlUI("提示", "恢复申请提交失败：" + msg);
								obs.confirmModal.hide();
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
							obs.confirmModal.hide();
						}
					}
				]
			});
		obs.confirmModal.setWidth(500).autoAlign();
		obs.confirmModal.show();
	},
//	destroyBucket : function() {
//		var _bucketname = obs.getCheckedArr().parents("tr").attr("dst");
//		alert(_bucketname);
//		var confirmModal = new com.skyform.component.Modal(new Date().getTime(),"删除Bucket","<h4>您确认要删除Bucket吗?</h4>",{
//			buttons : [
//				{
//					name : "确定",
//					onClick : function(){
//						obs.deleteBucket(_bucketname);
//						confirmModal.hide();
//					},
//					attrs : [
//						{
//							name : 'class',
//							value : 'btn btn-primary'
//						}
//					]
//				},
//				{
//					name : "取消",
//					attrs : [
//						{
//							name : 'class',
//							value : 'btn'
//						}
//					],
//					onClick : function(){
//						confirmModal.hide();
//					}
//				}
//			]
//		});
//		confirmModal.setWidth(300).autoAlign();
//		confirmModal.show();
//	},
	deleteBucket : function(bucketName){
		var resourcePool = $("#pool").val();	
		var servers = Config.ezs3Server;
		var _domain = "";
		$(servers).each(function(i){
			if(servers[i].pool == resourcePool){
				_domain = servers[i].value;
			}			
		});
		var defaultDomain = Config.defaultDomain;
		
		var params = {
				"bucketNames" : bucketName,
				"domainName" : _domain,
				"defaultDomain" : defaultDomain								
		};
		com.skyform.service.ObsService.deleteBucket(params,function onSuccess(data){
			$.growlUI("提示", "删除Bucket成功"); 
			obs.updateDataTable();
		},function onError(msg){
			$.growlUI("提示", "删除Bucket发生错误：" + msg); 
		});	
	},
	showOrHideRecoverOpt : function() {
		var checkboxArr = $("#obsServiceTable tbody input[type='checkbox']:checked");
		if(checkboxArr.length == 0){
			$("#recover").addClass("disabled");
			$("#recover").attr("disabled",true);
		} else {
			$("#recover").removeClass("disabled");
			$("#recover").attr("disabled",false);
			var hideDelete = false;
			$(checkboxArr).each(function(index, item) {
				var state = $(item).parents("tr").attr("state");
				var optState = $(item).parents("tr").attr("optState");
				if(state != "running"){  //state != "error"
					hideDelete = true;
					return;
				} else {
					if (optState != undefined && optState != "") {
						hideDelete = true;
						return;
					}
				}
			});
		    if (!hideDelete) {
		    	$("#recover").removeClass("disabled");
		    	$("#recover").attr("disabled",false);
		    } else {
		    	$("#recover").addClass("disabled");
		    	$("#recover").attr("disabled",true);
		    }
		}
	},
	showOrHideDeleteOpt : function() {
		var checkboxArr = $("#obsServiceTable tbody input[type='checkbox']:checked");
		if(checkboxArr.length == 0){
			$("#btn_delete_bucket_taske").addClass("disabled");
			$("#btn_delete_bucket_taske").attr("disabled",true);
		} else {
			$("#btn_delete_bucket_taske").removeClass("disabled");
			$("#btn_delete_bucket_taske").attr("disabled",false);
			var hideDelete = false;
			$(checkboxArr).each(function(index, item) {
				var state = $(item).parents("tr").attr("state");
				var optState = $(item).parents("tr").attr("optState");
				if(state != "running"){  //state != "error"
					hideDelete = true;
					return;
				} else {
					if (optState != undefined && optState != "") {
						hideDelete = true;
						return;
					}
				}
			});
		    if (!hideDelete) {
		    	$("#btn_delete_bucket_taske").removeClass("disabled");
		    	$("#btn_delete_bucket_taske").attr("disabled",false);
		    } else {
		    	$("#btn_delete_bucket_taske").addClass("disabled");
		    	$("#btn_delete_bucket_taske").attr("disabled",true);
		    }
		}
	},
	getObsInstance : function(ebs) {
//		var resourcePool = "huhehaote";
		com.skyform.service.VdiskService4yaxin.listAllBackups("1012",function onSuccess(data){
			//var data = {"msg":"","data":[{"state":"opening","expireDate":4070880000000,"comment":"","id":200704,"storageSize":"1024","ownUserName":"zhanghz","instanceName":"obs_zhanghz_1","createDate":1390387408000,"ownUserAccount":0}],"code":0};									
			//data = [{"snapid":1,"snapname":"chentt","volumename":"卷名称","state":"就绪","resourcepoolid":"呼和浩特","createDate":"2015-03-04"},{"snapid":1,"snapname":"chentt","volumename":"卷名称","state":"就绪","resourcepoolid":"呼和浩特","createDate":"2015-03-04"}];
			var _data = data;
	          if(typeof(_data) == "string" && _data.indexOf("error") >= 0) {
		            
		      }else {
		    	  if(_data == null || _data==""){
		    		  obs.obsInstance = null;
		    	  }else{
		    		  if(_data[0].id){
		    			  obs.obsInstance = _data[0];
		    		  }
		    	  }
			  }				
          obs.renderDataTable(_data,ebs);
//          obs.instances = data;
          if(ebs != '' && ebs != 'null'){
				$(".dataTables_filter input").val(decodeURI(ebs));
				$(".dataTables_filter input").trigger("keyup");							
			}
		},function onError(msg){
			$.growlUI("提示", "查询对象存储备份任务列表发生错误：" + msg); 
		});
	},
	

	renderDataTable : function(data,ebs) {
		obs.datatable.renderByData("#obsServiceTable", {
				"data" : data,
				"iDisplayLength": 5,
//				"columnDefs" : [
//				     {name: '',title:'<input type="checkbox" id="checkAll">',contentVisiable: 'always'},
//				     {title : "ID", name : "ID",contentVisiable:"hide"},
//				     {title : "备份名称", name : "snapname"},
//				     {title : "目录名称", name : "volumename"},
//				     {title : "状态", name : "state"},
//				     {title : "资源池", name : "resourcepoolid"},
//				     {title : "创建时间", name : "createDate"}					     
//				],
				"onColumnRender" : function(columnIndex, columnMetaData, columnData) {
					 var text = columnData[''+columnMetaData.name] || "";
					 if(columnMetaData.name == 'snapid') {
						 text = '<input type="checkbox" value="'+text+'">';
					 }
					 if (columnMetaData.name == "ID") {
						 text = text;
					 }
					 if (columnMetaData.name == "state") {
						 if (columnData.optState == null || columnData.optState == "") {
							 text = com.skyform.service.StateService.getState("nas",text);
						 } else {
							 text = com.skyform.service.StateService.getState("nas",columnData.optState);
						 }
					 }
					 if (columnMetaData.name == "createDate") {
						 text = new Date(text).format("yyyy-MM-dd hh:mm:ss");
					 }
					 if(columnMetaData.name == "resourcepoolid"){
						 text =  CommonEnum.pools[text];
					 }
					 return text;
				}, 
				"afterRowRender" : function(rowIndex, data, tr){
					tr.attr("state", data.state).
					attr("comment", data.comment).
					attr("optState", data.optState);
					tr.attr("ownUserId", data.ownUserId).
					attr("id", data.id). 
					attr("dst", data.dst).
					attr("volumeid", data.volumeid);
					var _title = data.instanceName;
	                var insname = commonUtils.subStr4view(_title, 35, "...");
	                tr.find("td[name='instanceName']").html(insname);
					tr.find("td[name='instanceName']").attr("title",_title);
					var title = data.allCatalogueName;
					var ca = commonUtils.subStr4view(title, 35, "...");
	                tr.find("td[name='allCatalogueName']").html(ca);
					tr.find("td[name='allCatalogueName']").attr("title",title);
				},
				"afterTableRender" : function() {
					// 翻页的时候清除前一页选中的checkbox，同时将更多操作置为不可用
					$("#obsServiceTable input[type='checkbox']").attr("checked", false);
		            //全选取消选中
		            $("#checkAll").attr("checked", false);			             
					$("#recover").addClass("disabled");
					$("#recover").attr("disabled",true);
					$("#btn_delete_bucket_taske").addClass("disabled");
					$("#btn_delete_bucket_taske").attr("disabled",true);
					obs.bindEvent();
					var firstRow = $("#obsServiceTable tbody").find("tr:eq(0)");
					var firstInsId = firstRow.attr("id");
					//显示第一条记录的日志
					obs.showInstanceInfo(firstInsId);
					firstRow.css("background-color","#BCBCBC");
					obs.setSelectRowBackgroundColor(firstRow);
				}
			}
		);
		obs.datatable.addToobarButton("#toolbar4obs");
		obs.datatable.enableColumnHideAndShow("right");
	},
	setSelectRowBackgroundColor : function(handler) {
		$("#content_container tr").css("background-color","");
		handler.css("background-color","#BCBCBC");
	},
	showInstanceInfo : function(vdiskId){
		$("#opt_logs").empty();
		if (!vdiskId || vdiskId<=0) return;
		com.skyform.service.LogService.describeLogsUIInfo(vdiskId);
	},
	// 刷新Table
	updateDataTable : function() {
		com.skyform.service.VdiskService4yaxin.listAllBackups("1012",function onSuccess(data){
			//obs.instances = data;
			obs.datatable.updateData(data);	
		},function onError(msg){
		});
		$("#recover").addClass("disabled");
		$("#recover").attr("disabled",true);
		$("#btn_delete_bucket_taske").addClass("disabled");
		$("#btn_delete_bucket_taske").attr("disabled",true);
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
		             } else {
		            	 $("#contextMenu").find("li.deleteVm").addClass("disabled");
		             	 $("#contextMenu").find("li.attachVm").addClass("disabled");
		             }
		             
		             // 选中右键所单击的行，取消其他行的选中效果
		             $("tbody input[type='checkbox']").attr("checked", false);
		             //全选取消选中
		             $("#checkAll").attr("checked", false);			             
		             $("input[type='checkbox']",$(this)).attr("checked", true);
		             //同步“更多操作”
		             obs.showOrHideRecoverOpt();
		             obs.showOrHideDeleteOpt();
		     } 
//		    obs.showInstanceInfo($(this).attr("id"));
//		    obs.setSelectRowBackgroundColor($(this));
		}); 
		
		$("#checkAll").unbind("click").bind("click", function(e) {
			var checked = $(this).attr("checked") || false;
	        $("#obsServiceTable input[type='checkbox']").attr("checked",checked);	 
	        obs.showOrHideRecoverOpt();
	        obs.showOrHideDeleteOpt();
	        e.stopPropagation();
		});
		
		$("#obsServiceTable tbody input[type='checkbox']").unbind("click").bind("click", function() {
			 obs.showOrHideRecoverOpt();
			 obs.showOrHideDeleteOpt();
		});
		
		$("#btnRefresh").unbind("click").bind("click", function() {
			//根据存储上是否开通nas账户来控制创建目录按钮				
			obs.updateDataTable();	
			//obs.showOrHideCreateNas();
		});

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