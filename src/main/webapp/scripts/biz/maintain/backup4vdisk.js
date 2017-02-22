window.currentInstanceType='backup4vdisk';


var product = {};
var VdiskBackup = {
		datatable : new com.skyform.component.DataTable(),
		attachVolumnDataTable  : null,
		backupDataTable  : null,
		confirmModal : null,
		confirmModal_detach : null,
		instances : [],
		service : com.skyform.service.VdiskService4yaxin,
		init : function(ebs) {
			//弹性块计费类型
			VdiskBackup.getBillTypeList();
			
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
					VdiskBackup.onOptionSelected($(this).index());
				}
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
					VdiskBackup.onOptionSelected($(this).index());					
				}
			});
			$("body").bind('mousedown',function(){
				if(!inMenu){
					$("#contextMenu").hide();
				}
			});
			
			// 新建虚拟硬盘
			$("#btnCreateVdiskVolume").click(VdiskBackup.createVdiskVolume);
			
			// 查询虚拟硬盘列表
			VdiskBackup.describeVdiskVolumes(ebs);
			//点击删除按钮
			$("#delete").bind('click',function(e){
				VdiskBackup.onOptionSelected(0);				
			});
			$("#recover").bind('click',function(e){
				VdiskBackup.onOptionSelected(1);				
			});	

			VdiskBackup.bindEvent();	
			$("#rd_auto").unbind("click").bind("click", function() {
				$("#time4backup").attr("style","display:block;");
			});
			$("#rd_one").unbind("click").bind("click", function() {
				$("#time4backup").attr("style","display:none;");
			});

			$("#createVdiskVolume").unbind("click").bind("click", function() {								
				var vdisk_quota = 0;
					// 带+-的输入框
					VdiskBackup.createPeridInput = null;
					if (VdiskBackup.createPeridInput == null) {
						var container = $("#perid").empty();				
						var max = 12;
						VdiskBackup.createPeridInput = new com.skyform.component.RangeInputField(container, {
							min : 1,
							defaultValue : 1,
							max:max,
							textStyle : "width:137px"
						}).render();
						VdiskBackup.createPeridInput.reset();								
					}
					
					//初始计费值
					VdiskBackup.getFee();
					
					$(".subFee").bind('mouseup keyup',function(){
						setTimeout('VdiskBackup.getFee()',100);
					});
					
					$("#createModal form")[0].reset();
					$("#slider-range-min").slider("option", "value", 10);
					$("#createStorageSize").val(10);					
					$("#tipCreateCount").text("");
					$("#tipCreateStorageSize").text("");
					$("#createModal").modal("show");					
		});
			
//			$("#backup4remoteModal input[type='radio']").attr("checked", false);
		},
		onOptionSelected : function(index) {
			if(index == 0){
				VdiskBackup.showDelete();
			} else if(index == 1){
				VdiskBackup.showRecover();
			} 
		},
		showDelete : function() {
			var checkedArr =  VdiskBackup.getCheckedArr();
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
				deleteTip = "您确认要销毁弹性块备份吗?";
			}else{
				deleteTip = "您确认要批量销毁弹性块备份吗?";
			}
				VdiskBackup.confirmModal = new com.skyform.component.Modal(new Date().getTime(),"销毁弹性块备份","<h4>"+deleteTip+"</h4>",{
					buttons : [
						{
							name : "确定",
							onClick : function(){
								// 删除虚拟硬盘
								var vdiskVolumeIds = parseInt(volumeIds.join(","));
								VdiskBackup.service.destroyBackup(vdiskVolumeIds,function onSuccess(data){
									$.growlUI("提示", "销毁申请提交成功, 正在销毁中..."); 
									VdiskBackup.confirmModal.hide();
									// refresh
									VdiskBackup.updateDataTable();									
								},function onError(msg){
									$.growlUI("提示", "销毁申请提交失败：" + msg);
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
								VdiskBackup.confirmModal.hide();
							}
						}
					]
				});
			VdiskBackup.confirmModal.setWidth(500).autoAlign();
			VdiskBackup.confirmModal.show();
		},
		showRecover : function() {
			var checkedArr =  VdiskBackup.getCheckedArr();
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
				VdiskBackup.confirmModal = new com.skyform.component.Modal(new Date().getTime(),"从备份恢复","<h4>"+deleteTip+"</h4>",{
					buttons : [
						{
							name : "确定",
							onClick : function(){
								// 删除虚拟硬盘
								var snapid = volumeIds.join(",");
								var volumeid = VdiskBackup.getCheckedArr().parents("tr").attr("volumeid");
								var params = {
									"volumeid":parseInt(volumeid),
									"snapid":parseInt(snapid)
								};

								VdiskBackup.service.rollbackVolumeFromSnap(params,function onSuccess(data){
									$.growlUI("提示", "恢复申请提交成功, 正在恢复中..."); 
									VdiskBackup.confirmModal.hide();
									// refresh
									VdiskBackup.updateDataTable();									
								},function onError(msg){
									$.growlUI("提示", "恢复申请提交失败：" + msg);
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
								VdiskBackup.confirmModal.hide();
							}
						}
					]
				});
			VdiskBackup.confirmModal.setWidth(500).autoAlign();
			VdiskBackup.confirmModal.show();
		},		
		// 查询虚拟硬盘列表
		describeVdiskVolumes : function(ebs) {
			VdiskBackup.service.listAllBackups("1002",function onSuccess(data){
//				data = [{"instanceName":"BACKUP_68223205","expireDate":1417788562000,"id":68223205,"state":"running","storageSize":"10","optState":"","createDate":1415196562000,"comment":""},{"instanceName":"BACKUP_68223201","expireDate":1417787065000,"id":68223201,"state":"create error","storageSize":"10","optState":"","createDate":1415195065000,"comment":""},{"instanceName":"BACKUP_68215298","expireDate":1417779117000,"id":68215298,"state":"create error","storageSize":"10","optState":"","createDate":1415187117000,"comment":""},{"instanceName":"BACKUP_67853233","expireDate":1413690032000,"id":67853233,"state":"running","optState":"","createDate":1411098032000,"comment":""},{"attachedHostName":"EBS_67853126","optState":"","attachedHostId":67853126,"state":"using","expireDate":1391914952000,"comment":"","id":67807023,"vmState":"change error","instanceName":"BACKUP_67807023","createDate":1410412928000}];
				VdiskBackup.instances = data;
				VdiskBackup.renderDataTable(data,ebs);
				if(ebs != '' && ebs != 'null'){
					$(".dataTables_filter input").val(decodeURI(ebs));
					$(".dataTables_filter input").trigger("keyup");							
				}

			},function onError(msg){
				$.growlUI("提示", "查询弹性块存储备份发生错误：" + msg); 
			});
		},
		renderDataTable : function(data,ebs) {
			VdiskBackup.datatable.renderByData("#volumeTable", {
					"data" : data,
					"iDisplayLength": 5,
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
								 text = com.skyform.service.StateService.getState("vdisk",text);
							 } else {
								 text = com.skyform.service.StateService.getState("vdisk",columnData.optState);
							 }
						 }
						 if (columnMetaData.name == "createDate") {
							 text = new Date(text).format("yyyy-MM-dd hh:mm:ss");
						 }
						 if (columnMetaData.name == "expireDate") {
							 text = new Date(text).format("yyyy-MM-dd hh:mm:ss");
						 }
						 if(columnMetaData.name == "autoornot"){
							 if(text == 'hand'){
								 text = '手动';
							 }else{
								 text = '自动';
							 }
						 }
						 if(columnMetaData.name == "remoteornot"){
							 if(text == 'native'){
								 text = '本地';
							 }else{
								 text = '异地';
							 }
						 }
						 if(columnMetaData.name == "resourcepoolid"){
							 text =  CommonEnum.pools[text];
						 }
						 return text;
					}, 
					"afterRowRender" : function(rowIndex, data, tr){
						tr.attr("state", data.state).
						attr("optState", data.optState);
						tr.attr("storagesize", data.storagesize).
						attr("id", data.snapid). 
						attr("volumeid", data.volumeid);
					},
					"afterTableRender" : function() {
						// 翻页的时候清除前一页选中的checkbox，同时将更多操作置为不可用
						$("#volumeTable input[type='checkbox']").attr("checked", false);
			            //全选取消选中
			            $("#checkAll").attr("checked", false);			             
						$("#delete").addClass("disabled");
						$("#delete").attr("disabled",true);
						$("#recover").addClass("disabled");
						$("#recover").attr("disabled",true);
						$("#createVdiskVolume").addClass("disabled");
						$("#createVdiskVolume").attr("disabled",true);

						VdiskBackup.bindEvent();
						var firstRow = $("#volumeTable tbody").find("tr:eq(0)");
						var firstInsId = firstRow.attr("id");
						//显示第一条记录的日志
						VdiskBackup.showInstanceInfo(firstInsId);
						firstRow.css("background-color","#BCBCBC");
						VdiskBackup.setSelectRowBackgroundColor(firstRow);
					}
				}
			);
			VdiskBackup.datatable.addToobarButton("#disktoolbar");
			VdiskBackup.datatable.enableColumnHideAndShow("right");
		},
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
			             	$("#contextMenu").find("li.volumeSnapshot").removeClass("disabled");
			             } else {
			            	 $("#contextMenu").find("li.deleteVm").addClass("disabled");
			             	 $("#contextMenu").find("li.attachVm").addClass("disabled");
			             	 $("#contextMenu").find("li.volumeSnapshot").addClass("disabled");
			             }
			             
			             if ((state == "using") && (optState == undefined || optState == "")){
			            	 $("#contextMenu").find("li.detachVm").removeClass("disabled");
			             } else {
			            	 $("#contextMenu").find("li.detachVm").addClass("disabled");
			             }
			             
			             // 选中右键所单击的行，取消其他行的选中效果
			             $("tbody input[type='checkbox']").attr("checked", false);
			             //全选取消选中
			             $("#checkAll").attr("checked", false);			             
			             $("input[type='checkbox']",$(this)).attr("checked", true);
			             //同步“更多操作”
			             VdiskBackup.showOrHideRecoverOpt();
						 VdiskBackup.showOrHideDeleteOpt();
						 VdiskBackup.showOrHideCreateOpt();
			     } 
			    VdiskBackup.showInstanceInfo($(this).attr("id"));
			    VdiskBackup.setSelectRowBackgroundColor($(this));
			}); 
			
			$("#checkAll").unbind("click").bind("click", function(e) {
				var checked = $(this).attr("checked") || false;
		        $("#volumeTable input[type='checkbox']").attr("checked",checked);	 
		        VdiskBackup.showOrHideRecoverOpt();
		        VdiskBackup.showOrHideDeleteOpt();
		        VdiskBackup.showOrHideCreateOpt();
		        e.stopPropagation();
			});
			
			$("#volumeTable tbody input[type='checkbox']").unbind("click").bind("click", function() {
				 VdiskBackup.showOrHideRecoverOpt();
				 VdiskBackup.showOrHideDeleteOpt();
				 VdiskBackup.showOrHideCreateOpt();
			});
			
			$("#btnRefresh").unbind("click").bind("click", function() {
				VdiskBackup.updateDataTable();
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
//					$("<li class='detail-item'><span>" + v.createTime + "  " +_name + "  " + v.controle + desc + "</span></li>").appendTo($("#opt_logs"));
//				});				
//			},function onError(msg){
//			});
			
		},
		// 刷新Table
		updateDataTable : function() {
			var _user = "";
			var _states = "";
			VdiskBackup.service.listAllBackups("1002",function onSuccess(data){
				VdiskBackup.instances = data;
				VdiskBackup.datatable.updateData(data);	
			},function onError(msg){
			});
			$("#delete").addClass("disabled");
			$("#delete").attr("disabled",true);
			$("#recover").addClass("disabled");
			$("#recover").attr("disabled",true);
		},
		// 根据选中的备份的个数判断是否将修改选项置为灰色
		showOrHideRecoverOpt : function() {
			var checkboxArr = $("#volumeTable tbody input[type='checkbox']:checked");
			if(checkboxArr.length == 0 || checkboxArr.length > 1){
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
			var checkboxArr = $("#volumeTable tbody input[type='checkbox']:checked");
			if(checkboxArr.length == 0 || checkboxArr.length > 1){
				$("#delete").addClass("disabled");
				$("#delete").attr("disabled",true);
			} else {
				$("#delete").removeClass("disabled");
				$("#delete").attr("disabled",false);
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
			    	$("#delete").removeClass("disabled");
			    	$("#delete").attr("disabled",false);
			    } else {
			    	$("#delete").addClass("disabled");
			    	$("#delete").attr("disabled",true);
			    }
			}
		},
		showOrHideCreateOpt : function() {
			var checkboxArr = $("#volumeTable tbody input[type='checkbox']:checked");
			if(checkboxArr.length == 0){
				$("#createVdiskVolume").addClass("disabled");
				$("#createVdiskVolume").attr("disabled",true);
			} else if(checkboxArr.length == 1){
				$("#createVdiskVolume").removeClass("disabled");
				$("#createVdiskVolume").attr("disabled",false);
			} else {
				$("#createVdiskVolume").addClass("disabled");
				$("#createVdiskVolume").attr("disabled",true);
			}
		},	
		
		
		getCheckedArr :function() {
			return $("#volumeTable tbody input[type='checkbox']:checked");
		},
		//显示该所属用户下的可用云主机
		describeVM : function() {
			var volumeId = VdiskBackup.getCheckedArr().parents("tr").attr("id");
			VdiskBackup.service.listVmsToAttach(volumeId,function onSuccess(data){
				if(data.length == 0){
					$.growlUI("提示", "没有可用的云主机！"); 
			    } else {
			    	$("#vmModal").modal("show");
					if(VdiskBackup.attachVolumnDataTable != null){
						VdiskBackup.attachVolumnDataTable.updateData(data);
					} else {
						VdiskBackup.attachVolumnDataTable =  new com.skyform.component.DataTable();
						VdiskBackup.attachDataTable(data);
					}
				}				
			},function onError(msg){
				$.growlUI("提示", "查询可用云主机发生错误：" + msg); 
			});
		},
		attachDataTable : function(data) {
			 VdiskBackup.attachVolumnDataTable.renderByData("#vmTable", {
					"data" : data,
					"pageSize": 5,
					"columnDefs" : [
					     {title : "", name : "vmInstanceInfoId"},
					     {title : "ID", name : "vmInstanceInfoId"},
					     {title : "名称", name : "vmInstanceInfoName"}
					],
					"onColumnRender" : function(columnIndex,columnMetaData,columnData) {
						 var text = columnData[''+columnMetaData.name] || "";
						 if(columnIndex ==0) {
							 text = "<input type='radio' name='ownUserId' value=' "+text+" '>";
						 }
						 return text;
					},
					"afterRowRender" : function(index,data,tr){
						if(index == 0) {
							$(tr).find("input[type='radio']").attr("checked", "checked");
						}
					}					
				});
		},
		renderBackupDataTable : function(data) {
			 VdiskBackup.backupDataTable.renderByData("#backupTable", {
					"data" : data,
					"pageSize": 5,
					"columnDefs" : [
					     {title : "<input type='checkbox' id='checkAll'>", name : "id"},
					     {title : "备份名称", name : "vmInstanceInfoName"},
					     {title : "类型", name : "type"},
					     {title : "创建时间", name : "createDate"},
					     {title : "备份大小(GB)", name : "backupSize"}
					],
					"onColumnRender" : function(columnIndex,columnMetaData,columnData) {
						 var text = columnData[''+columnMetaData.name] || "";
						 if(columnIndex ==0) {
							 text = "<input type='checkbox' name='id' value=' "+text+" '>";
						 }
						 if (columnMetaData.name == "createDate") {
							 text = new Date(text).format("yyyy-MM-dd hh:mm:ss");
						 }
						 return text;
					},
					"afterRowRender" : function(index,data,tr){
						if(index == 0) {
							$(tr).find("input[type='checkbox']").attr("checked", "checked");
						}
					}					
				});
			 VdiskBackup.backupDataTable.addToobarButton("#backuptoolbar");
		},
		getFee : function(){
			if(CommonEnum.offLineBill)return;
			var period = VdiskBackup.createPeridInput.getValue();
			var peridUnit = $("#peridUnit").html();
			if(peridUnit == '年'){
				period = period*12;
			}
			var storagesize = VdiskBackup.getCheckedArr().parents("tr").attr("storagesize");
			var param = {
				"period":period,
				"productPropertyList":[									
				    {
							"muProperty":"storageSize",
							"muPropertyValue":storagesize,
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
		},
		getBillTypeList: function() {			
			$("#billType").empty();
			var billtype_hasSelected = false;
			$.each(CommonEnum.billType, function(index) {				
				var cpu_option = $("<div  class=\"types-options cpu-options \" data-value='"+ index + "'>" + CommonEnum.billType[index] + "</div>");
				cpu_option.appendTo($("#billType"));
				cpu_option.click(function(){
					if($(this).hasClass("selected"))return;
					$("div.type-options").removeClass("selected");
					$(".options .types-options.cpu-options ").removeClass("selected");
					$(this).addClass("selected");
					VdiskBackup.queryProductPrtyInfo(index);	
					if(0==index){
						$("#peridUnit").empty().html("月");
					}
					else if(1 == index){
						$("#peridUnit").empty().html("小时");
					}
					else if(2 == index){
						$("#peridUnit").empty().html("天");
					}else if(3 == index){
						$("#peridUnit").empty().html("年");
					}
					VdiskBackup.getFee();
				});
				if (index == 0 || index == 5) {
					if(!billtype_hasSelected){
						billtype_hasSelected = true;
						cpu_option.addClass("selected");
						$("#peridUnit").empty().html("月");
						VdiskBackup.queryProductPrtyInfo(index);
					}
				}
				
			});
		},
		queryProductPrtyInfo :function(index){
			com.skyform.service.BillService.queryProductPrtyInfo(index,"vdisk",function(data){  //window.currentInstanceType
				product.max = data.dataDisk.max;
				product.min = data.dataDisk.min;
				product.step = data.dataDisk.step;
				product.unit = data.dataDisk.unit;
				product.productId = data.productId;
				$("#unit").html(product.unit);
			});
		},
		// 创建虚拟硬盘
		createVdiskVolume : function() {
			var isSubmit = true;
			// 验证
			$("#createInstanceName").jqBootstrapValidation();	
		    //同名校验
			var instanceName = $.trim($("#createInstanceName").val());			
			var _param = {"instanceName":instanceName,"instanceCode":"vdisk"};
			var count = 1;
		    
			if (!isSubmit) {
				return;
			}			
			
//		    com.skyform.service.PortalInstanceService.querySameNameExist(window.currentInstanceType,instanceName,function(isExist){
//		    	if(isExist){
//		    		$("#tipCreateInstanceName").text("该名称已经被使用, 请重新输入");
//		    	}else{
		    		$("#tipCreateInstanceName").text("");
					$("#feeInput").text(VdiskBackup.getFee());
					var period = VdiskBackup.createPeridInput.getValue();
					var peridUnit = $("#peridUnit").html();			
					if(peridUnit == '年'){
						period = period*12;
					}
					var snapid = VdiskBackup.getCheckedArr().parents("tr").attr("id");
					var storagesize = VdiskBackup.getCheckedArr().parents("tr").attr("storagesize");
					var params = {
							"period":period,
							"count":1,
							"productList":[
								{
									"instanceName" : instanceName,
									"storageSize" : storagesize,
									"productId":product.productId,
									"snapid":snapid,
									"storagetype":"native_rbd"
								}
							] 
					};			
					
					VdiskBackup.service.CreateStorageFromSnapshot(params,function onSuccess(data){				
						//订单提交成功后校验用户余额是否不足
						var _tradeId = data.tradeId;
						var _fee = $("#feeInput").text();
						var createModal = $("#createModal");
						com.skyform.service.BillService.confirmTradeSubmit(_fee,_tradeId,createModal,function onSuccess(data){
							$.growlUI("提示", "创建申请提交成功, 请耐心等待开通服务..."); 
							$("#createModal").modal("hide");
							// refresh
							VdiskBackup.updateDataTable();									
						},function onError(msg){
							$.growlUI("提示", "创建申请提交成功,扣款失败");
							$("#createModal").modal("hide");
						});				
					},function onError(msg){
						$.growlUI("提示", "创建申请提交失败：" + msg); 
					});		    		
//		    	}
//		    });
		}
		
};
