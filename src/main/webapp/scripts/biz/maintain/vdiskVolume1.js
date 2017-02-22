window.currentInstanceType='vdisk';
window.currentInstanceType4buckup='vdiskBackup';
window.currentInstanceType4autobuckup='vdiskAutoBackup';
window.Controller = {
		init : function(){
			VdiskVolume.init();
		},
		refresh : function(){
			VdiskVolume.updateDataTable();			
		}
		
	};

var product = {};
var product4buckup = {};
var product4autobuckup = {};
var VdiskVolume = {
		datatable : new com.skyform.component.DataTable(),
		attachVolumnDataTable  : null,
		backupDataTable  : null,
		confirmModal : null,
		confirmModal_detach : null,
		instances : [],
		service : com.skyform.service.VdiskService4yaxin,
		init : function() {
			if(CommonEnum.offLineBill){
				$("#renew").attr("style","display: none;");
			}else{
				$("#renew").attr("style","display: inline;");
			}

			//弹性块计费类型
			VdiskVolume.getBillTypeList();
			VdiskVolume.queryProductPrtyInfo4backup();
			VdiskVolume.queryProductPrtyInfo4backupauto();
				
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
					VdiskVolume.onOptionSelected($(this).index());
				}
			});	
			
			//定义一个slider能够选择硬盘的大小
			$( "#slider-range-min" ).slider({
				range: "min",
				value: 10,
				min: 10,
				max: product.max,
				step: product.step,
				slide: function( event, ui ) {
					var sp = $("#createCount").val();
					$("#createStorageSize").val(ui.value);
					
				}
			});
			$( "#createStorageSize" ).val($( "#slider-range-min" ).slider( "value" ) );
			initsliderButton("createStorageSize","slider-range-min",product.max,10,product.step);
			var realValue;
			$("#createStorageSize").bind("keydown",function(e){
				if (e.which == 13) { // 获取Enter键值
					e.preventDefault(); // 阻止表单按Enter键默认行为，防止按回车键提交表单
					realValue = parseInt(parseInt($("#createStorageSize").val())/10) * 10 ;
					$( "#slider-range-min" ).slider( "option", "value", realValue);
					$("#createStorageSize").val(realValue);			
				}
			});
			$("#createStorageSize").bind("blur",function(e){
					e.preventDefault(); // 阻止表单按Enter键默认行为，防止按回车键提交表单					
			        if (Number($(this).val()) + "" == "NaN") {
			            $(this).val(10);
			            $("#feeInput").text(VdiskVolume.getFee());
			            return;
			        }
			        if (Number($(this).val()) < 10) {
			            $(this).val(10);
			            $("#feeInput").text(VdiskVolume.getFee());
			            return;
			        }
			        if (Number($(this).val()) >product.max) {
			            $(this).val(product.max);
			            $("#feeInput").text(VdiskVolume.getFee());
			            return;
			        }
			        if (Number($(this).val()) % 1 != 0) {
			            $(this).val(1);
			            $("#feeInput").text(VdiskVolume.getFee());
			            return;
			        }
			        
			        if (Number($(this).val()) % 10 != 0) {
			            $(this).val(parseInt(parseInt($(this).val())/10) * 10);
			            $("#feeInput").text(VdiskVolume.getFee());
			            return;
			        }			        
			        $(this).val(Number($(this).val()));
			        $("#feeInput").text(VdiskVolume.getFee());					
			        var _size = Number($(this).val());
					$( "#slider-range-min" ).slider( "option", "value", _size);					
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
					VdiskVolume.onOptionSelected($(this).index());					
				}
			});
			$("body").bind('mousedown',function(){
				if(!inMenu){
					$("#contextMenu").hide();
				}
			});
			
			// 新建虚拟硬盘
			$("#btnCreateVdiskVolume").click(VdiskVolume.createVdiskVolume);
			
			// 查询虚拟硬盘列表
			VdiskVolume.describeVdiskVolumes();
			
			//点击修改按钮
			$("#beforeModify").bind('click',function(e){
				$("#tipModifyVolumeName").text("");
				VdiskVolume.onOptionSelected(0);			
			});	

			//点击挂载按钮
			$("#attachVm").bind('click',function(e){
				VdiskVolume.onOptionSelected(1);				
			});	
			
			//点击卸载按钮
			$("#detachVm").bind('click',function(e){
				VdiskVolume.onOptionSelected(2);				
			});	

			//点击删除按钮
			$("#delete").bind('click',function(e){
				VdiskVolume.onOptionSelected(3);				
			});	
			//点击续订按钮
			$("#renew").bind('click',function(e){
				VdiskVolume.onOptionSelected(4);				
			});	
			$("#renew_save").bind('click',function(e){
				VdiskVolume.renew();				
			});	
			
			VdiskVolume.bindEvent();	
			
			//点击查看备份按钮
			$("#queryBackup").bind('click',function(e){
				VdiskVolume.onOptionSelected(7);		
			});	
			$("#backup").bind('click',function(e){
				VdiskVolume.onOptionSelected(5);
			});	
			$("#backup4auto").bind("click",function(e){
				VdiskVolume.onOptionSelected(6);
			});			
			
			$("#rd_home").unbind("click").bind("click", function() {
				$("#nativeDiv").attr("style","display:block;");
				$("#remoteDiv").attr("style","display:none;");
			});
			$("#rd_other").unbind("click").bind("click", function() {
				$("#nativeDiv").attr("style","display:none;");
				$("#remoteDiv").attr("style","display:block;");
			});
			
			$("#ckb_open").unbind("click").bind("click", function(e) {
				var checked = $(this).attr("checked");
				if(checked){
					VdiskVolume.enableNativeDiv();
				}else{
					VdiskVolume.disableNativeDiv();
				}
			});
			$("#ckb_open_yd").unbind("click").bind("click", function(e) {
				var checked = $(this).attr("checked");
				if(checked){
					VdiskVolume.enableRemoteDiv();
				}else{
					VdiskVolume.disableRemoteDiv();
				}
			});
			
			var type = $("#day_week_sel").val();
			if(type == "day"){
				$("#week_sel").attr("style","display:none;");
			}else if(type == "week"){
				$("#week_sel").attr("style","display:inline;width:150px;");
			}
			
			$("#day_week_sel").change(function(){
				var type = $("#day_week_sel").val();
				if(type == "day"){
					$("#week_sel").attr("style","display:none;");
				}else if(type == "week"){
					$("#week_sel").attr("style","display:inline;width:100px;");
				}
			});
			
			var type_yd = $("#day_week_sel_yd").val();
			if(type_yd == "day"){
				$("#week_sel_yd").attr("style","display:none;");
			}else if(type == "week"){
				$("#week_sel_yd").attr("style","display:inline;width:150px;");
			}

			$("#day_week_sel_yd").change(function(){
				var type = $("#day_week_sel_yd").val();
				if(type == "day"){
					$("#week_sel_yd").attr("style","display:none;");
				}else if(type == "week"){
					$("#week_sel_yd").attr("style","display:inline;width:100px;");
				}
			});
			
			$("#backup4autoModal input[type='radio']").attr("checked", false);
			$("#backup_save").unbind("click").bind("click", function(e) {
				VdiskVolume.onOptionSelected(8);
			});
			$("#autobackup_save").unbind("click").bind("click", function(e) {
				VdiskVolume.onOptionSelected(9);
			});
			
			
		},
		onOptionSelected : function(index) {
			if(index == 0){
				var oldInstanceName = VdiskVolume.getCheckedArr().parents("tr").attr("instanceName");
				var oldComment = VdiskVolume.getCheckedArr().parents("tr").attr("comment");
				$("#modifyVolumeName").val(oldInstanceName);
				$("#modifyDiskModal").modal("show");
			} else if(index == 1){
				VdiskVolume.describeVM();
			} else if (index == 2) {
				VdiskVolume.showDetachVdiskVolume();
			} else if(index == 3){
				VdiskVolume.showDeleteVdiskVolume();
			} else if(index == 4){
				// 带+-的输入框
				VdiskVolume.createPeridInput_renew = null;
				if (VdiskVolume.createPeridInput_renew == null) {
					var container = $("#perid_renew").empty();				
					var max = 12;
					VdiskVolume.createPeridInput_renew = new com.skyform.component.RangeInputField(container, {
						min : 1,
						defaultValue : 1,
						max:max,
						textStyle : "width:137px"
					}).render();
					VdiskVolume.createPeridInput_renew.reset();								
				}
				
				//TODO 续费计费值   
				var subsId = VdiskVolume.getCheckedArr().parents("tr").attr("id");
				VdiskVolume.getFee_renew(subsId);
				
				$(".subFee_renew").bind('mouseup keyup',function(){
					setTimeout('VdiskVolume.getFee_renew('+subsId+')',100);
				});
				$("#renewModal").modal("show");
			} else if(index == 5){
				$("#backupModal").modal("show");
			} else if(index == 6){
				VdiskVolume.listVolumeRelicationTask();
				$("#rd_home").attr("checked", true);
				$("#nativeDiv").attr("style","display:block;");
				$("#remoteDiv").attr("style","display:none;");
				
				$("#autobackup_save").attr("disabled",false);
				$("#backup4autoModal").modal("show");
			} else if(index == 7){
				VdiskVolume.describeBackup();
			} else if(index == 8){
				VdiskVolume.createBackupByHand();
			} else if(index == 9){
				
				
				var ck_home = $("#rd_home").attr("checked");
				var ck_other = $("#rd_other").attr("checked");
				if(ck_home){
					var isopen = $("#ckb_open").attr("checked");
					if(isopen){
						VdiskVolume.createBackupAuto();
					}else{
						var taskid = $("#taskid").val();
						VdiskVolume.deleteReplicationTask(taskid);
					}				
					
				}else if(ck_other){
					var _isopen = $("#ckb_open_yd").attr("checked");
					if(_isopen){
						VdiskVolume.createBackupAuto();
					}else{
						taskid = $("#taskid_yd").val();
						VdiskVolume.deleteReplicationTask(taskid);
					}
				}
				
				
			}
		},
		showDeleteVdiskVolume : function() {
			var checkedArr =  VdiskVolume.getCheckedArr();
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
				deleteTip = "您确认要销毁吗?";
			}else{
				deleteTip = "您确认要批量销毁吗?";
			}
				VdiskVolume.confirmModal = new com.skyform.component.Modal(new Date().getTime(),"销毁弹性块存储","<h4>"+deleteTip+"</h4>",{
					buttons : [
						{
							name : "确定",
							onClick : function(){
								// 删除虚拟硬盘
								var vdiskVolumeIds = volumeIds.join(",");
								VdiskVolume.service.destroy(vdiskVolumeIds,function onSuccess(data){
									$.growlUI("提示", "销毁申请提交成功, 正在销毁中..."); 
									VdiskVolume.confirmModal.hide();
									// refresh
									VdiskVolume.updateDataTable();									
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
								VdiskVolume.confirmModal.hide();
							}
						}
					]
				});
			VdiskVolume.confirmModal.setWidth(500).autoAlign();
			VdiskVolume.confirmModal.show();
		},
		
		showDetachVdiskVolume : function(){
			var checkedArr =  VdiskVolume.getCheckedArr();
			var hostIds = "";
			var hostName = "";
			var volumeIds = [];
			$(checkedArr).each(function(index, item) {
				var tr = $(item).parents("tr");
				hostIds += tr.attr("attachedHostId");
				hostName += $($("td", tr)[4]).text();
				var id = $("input[type='checkbox']", $("td", tr)[0]).val();
				volumeIds.push(id);
				if (index < checkedArr.length - 1) {
					hostIds += ",";
					hostName += ",";
				}
			});
			var vdiskVolumeIds = volumeIds.join(",");
			var detachTip = "";
			if(checkedArr.length==1){
				detachTip = "您确认要从云主机上卸载弹性块存储吗?";
			}else{
				detachTip = "您确认要从云主机上批量卸载弹性块存储吗?";
			}
				VdiskVolume.confirmModal_detach = new com.skyform.component.Modal(new Date().getTime(),"卸载弹性块存储","<h4>"+detachTip+"</h4>",{
					buttons : [
								{
									name : "确定",
									onClick : function(){
										VdiskVolume.service.detach(vdiskVolumeIds,hostIds,function onSuccess(data){
											$.growlUI("提示", "卸载申请提交成功, 正在卸载中..."); 
											VdiskVolume.confirmModal_detach.hide();
											// refresh
											VdiskVolume.updateDataTable();											
										},function onError(msg){
											$.growlUI("提示", "卸载申请提交失败：" + msg);
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
										VdiskVolume.confirmModal_detach.hide();
									}
								}
							]					
				});
			VdiskVolume.confirmModal_detach.setWidth(500).autoAlign();
			VdiskVolume.confirmModal_detach.show();

		},
		// 创建虚拟硬盘
		createVdiskVolume : function() {
			var isSubmit = true;
			// 验证
			$("#createInstanceName, #createCount").jqBootstrapValidation();	
		    //同名校验
			var instanceName = $.trim($("#createInstanceName").val());			
			var _param = {"instanceName":instanceName,"instanceCode":"vdisk"};
			var count = 1;
			var storageSize = $.trim($("#createStorageSize").val());			
		    if (parseInt(storageSize) < 10) {
		    	$("#tipCreateStorageSize").text("容量必须为大于等于10!");
		    	$("#createStorageSize").val(10);
		    	$("#slider-range-min").slider("option", "value", 10);
		    	isSubmit = false;
		    } else {
		    	$("#tipCreateStorageSize").text("");
		    }
		    
		    if(parseInt(storageSize)>product.max){
		    	$("#tipCreateStorageSize").text("容量不能大于"+product.max);
		    	$("#createStorageSize").val(product.max);
		    	$("#slider-range-min").slider("option", "value", product.max);
		    	isSubmit = false;		    	
		    }else {
		    	$("#tipCreateStorageSize").text("");
		    }
		    
			if (!isSubmit) {
				return;
			}			
			
		    com.skyform.service.PortalInstanceService.querySameNameExist(window.currentInstanceType,instanceName,function(isExist){
		    	if(isExist){
		    		$("#tipCreateInstanceName").text("该名称已经被使用, 请重新输入");
		    	}else{
		    		$("#tipCreateInstanceName").text("");
					$("#feeInput").text(VdiskVolume.getFee());
					var period = VdiskVolume.createPeridInput.getValue();
					var peridUnit = $("#peridUnit").html();			
					if(peridUnit == '年'){
						period = period*12;
					}
					var _fee = $("#feeInput").text();
					var createModal = $("#createModal");
					var agentId = $("#agentId").val();
					var params = {
							"period":period,
							"count":1,
							"productList":[
								{
									"instanceName" : instanceName,
									"storageSize" : storageSize,
									"productId":product.productId
								}
							] 
					};		
					if(agentId&&agentId.length>0){
						com.skyform.service.channelService.checkAgentCode(agentId,function(data){
							if("-1" == data){
								$("#agentMsg").html("渠道优惠码不存在，请重新输入！");
							}
							else {
								var channel = com.skyform.service.channelService.channel;
								channel.serviceType = CommonEnum.serviceType["vdisk"];
								channel.agentCouponCode = agentId;	
								channel.period = params.period;
								channel.productList[0].price = _fee;	
								channel.productList[0].productId = params.productList[0].productId;
								channel.productList[0].serviceType = CommonEnum.serviceType["vdisk"];
								channel.productList[0].productDesc = params.productList[0];
								com.skyform.service.channelService.confirmChannelSubmit(channel,createModal,function onSuccess(data) {
										$.growlUI(Dict.val("common_tip"),"订单已提交，请等待审核通过后完成支付！您可以在用户中心->消费记录中查看该订单信息。");
										$("#createModal").modal("hide");
								}, function onError(msg) {
									$.growlUI(Dict.val("common_tip"), "订单提交失败！");
									$("#createModal").modal("hide");
								});
							}
						});	
					}
					else {
						VdiskVolume.service.save(params,function onSuccess(data){				
							//订单提交成功后校验用户余额是否不足
							var _tradeId = data.tradeId;							
							com.skyform.service.BillService.confirmTradeSubmit(_fee,_tradeId,createModal,function onSuccess(data){
								$.growlUI("提示", "创建申请提交成功, 请耐心等待开通服务..."); 
								$("#createModal").modal("hide");
								// refresh
								VdiskVolume.updateDataTable();									
							},function onError(msg){
								$.growlUI("提示", "创建申请提交成功,扣款失败");
								$("#createModal").modal("hide");
							});				
						},function onError(msg){
							$.growlUI("提示", "创建申请提交失败：" + msg); 
						});
					}
		    	}
		    });
			
			
		},
		renew : function(){
			var volumeId = VdiskVolume.getCheckedArr().parents("tr").attr("id");
			var period = VdiskVolume.createPeridInput_renew.getValue();
			$("#renewModal").modal("hide");			
			var _modal = $("#renewModal");
			com.skyform.service.renewService.renew(volumeId,period,function onSuccess(data){
				//订单提交成功后校验用户余额是否不足
				var _tradeId = data.tradeId;
				var _fee = $("#feeInput_renew").text();
				com.skyform.service.BillService.confirmTradeSubmit(_fee,_tradeId,_modal,function onSuccess(data){
					$.growlUI("提示", "续订申请提交成功,扣款成功, 请耐心等待..."); 
					// refresh
					VdiskVolume.updateDataTable();									
				},function onError(msg){
					$.growlUI("提示", "续订申请提交成功,扣款失败...");
				});			
			},function onError(msg){
				$.growlUI("提示", "续订时长提交失败：" + msg); 
			});			
		},
		// 查询虚拟硬盘列表
		describeVdiskVolumes : function() {
			//如果没有返回结果 {"msg":"","data":"返回结果为空！","code":0} 明天要问
			var _user = "";
			var _states = "";
			VdiskVolume.service.listAll(_user,_states,function onSuccess(data){
				VdiskVolume.instances = data;
				VdiskVolume.renderDataTable(data);
				$("#disktoolbar .operation").addClass("disabled");
			},function onError(msg){
				$.growlUI("提示", "查询弹性块存储发生错误：" + msg); 
			});
		},
		renderDataTable : function(data) {
			VdiskVolume.datatable.renderByData("#volumeTable", {
					"data" : data,
					"iDisplayLength": 5,
//					"columnDefs" : [
//					     {title : "<input type='checkbox' id='checkAll'>", name : "id"},
//					     {title : "ID", name : "id"},
//					     {title : "名称", name : "instanceName"},
//					     {title : "状态", name : "state"},
//					     {title : "应用主机", name : "attachedHostName"},
//					     {title : "容量(GB)", name : "storageSize"},
//					     {title : "创建时间", name : "createDate"},
//					     {title : "到期时间", name : "expireDate"}
//					],
					"onColumnRender" : function(columnIndex, columnMetaData, columnData) {
						 var text = columnData[''+columnMetaData.name] || "";
						 if(columnMetaData.name == 'id') {
							 text = '<input type="checkbox" value="'+text+'">';
						 }
						 if (columnMetaData.name == "ID") {
							 text = columnData.id;
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
						 if(columnMetaData.name == "instanceName"){
							 text = columnData.instanceName
							        +"<a title='咨询建议' href='../user/workOrder.jsp?code=workOrder&cataCode=service&instanceId="+columnData.id+"&serviceType=vdisk&instanceName="+encodeURIComponent(columnData.instanceName)+"" +
							        		"&instanceStatus="+columnData.state+
							        		"&currentPoolW="+encodeURIComponent(CommonEnum.pools[CommonEnum.currentPool])+
							        		"'><i class='icon-comments' ></i></a>";
						 }

						 return text;
					}, 
					"afterRowRender" : function(rowIndex, data, tr){
						tr.attr("instanceName", data.instanceName)
						tr.attr("state", data.state).
						attr("comment", data.comment).
						attr("optState", data.optState);
						tr.attr("ownUserId", data.ownUserId).
						attr("ownUserId", data.ownUserId).
						attr("id", data.id). 
						attr("attachedHostId", data.attachedHostId);
					},
					"afterTableRender" : function() {
						// 翻页的时候清除前一页选中的checkbox，同时将更多操作置为不可用
						$("#volumeTable input[type='checkbox']").attr("checked", false);
			            
						VdiskVolume.bindEvent();
						var firstRow = $("#volumeTable tbody").find("tr:eq(0)");
						var firstInsId = firstRow.attr("id");
						//显示第一条记录的日志
						VdiskVolume.showInstanceInfo(firstInsId);
						firstRow.css("background-color","#d9f5ff");
						VdiskVolume.setSelectRowBackgroundColor(firstRow);
					}
				}
			);
			VdiskVolume.datatable.addToobarButton("#disktoolbar");
			VdiskVolume.datatable.enableColumnHideAndShow("right");
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
			             	$("#contextMenu").find("li.beforeModify").removeClass("disabled");
			             	$("#contextMenu").find("li.attachVm").removeClass("disabled");
			             	$("#contextMenu").find("li.deleteVm").removeClass("disabled");
			             	$("#contextMenu").find("li.renew").removeClass("disabled");
			             	$("#contextMenu").find("li.backup").removeClass("disabled");
			             	$("#contextMenu").find("li.backup4remote").removeClass("disabled");
			             	$("#contextMenu").find("li.queryBackup").removeClass("disabled");
			             	$("#contextMenu").find("li.volumeSnapshot").removeClass("disabled");
			             	
			             } else {
			            	 $("#contextMenu").find("li.deleteVm").addClass("disabled");
			             	 $("#contextMenu").find("li.attachVm").addClass("disabled");
			             	 $("#contextMenu").find("li.volumeSnapshot").addClass("disabled");
			             	$("#contextMenu").find("li.backup").addClass("disabled");
			             	$("#contextMenu").find("li.backup4remote").addClass("disabled");
			             	$("#contextMenu").find("li.queryBackup").addClass("disabled");
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
			             //同步“更多操作"
			             VdiskVolume.showOrHideModifyOpt();
						 VdiskVolume.showOrHideAttachOpt();
						 VdiskVolume.showOrHideDetachOpt();
						 VdiskVolume.showOrHideDeleteOpt();
						 VdiskVolume.showOrHideRenewOpt();
						 VdiskVolume.showOrHideBackupOpt();
						 VdiskVolume.showOrHideBackup4autoOpt();
						 VdiskVolume.showOrHideQueryBackupOpt();
			     } 
			    VdiskVolume.showInstanceInfo($(this).attr("id"));
			    VdiskVolume.setSelectRowBackgroundColor($(this));
			}); 
			
			$("#checkAll").unbind("click").bind("click", function(e) {
				var checked = $(this).attr("checked") || false;
		        $("#volumeTable input[type='checkbox']").attr("checked",checked);	 
		        VdiskVolume.showOrHideModifyOpt();
		        VdiskVolume.showOrHideAttachOpt();
		        VdiskVolume.showOrHideDetachOpt();
		        VdiskVolume.showOrHideDeleteOpt();
		        VdiskVolume.showOrHideRenewOpt();
		        VdiskVolume.showOrHideBackupOpt();
		        VdiskVolume.showOrHideBackup4autoOpt();
		        VdiskVolume.showOrHideQueryBackupOpt();
		        e.stopPropagation();
			});
			
			$("#volumeTable tbody input[type='checkbox']").unbind("click").bind("click", function() {
				 VdiskVolume.showOrHideModifyOpt();
				 VdiskVolume.showOrHideAttachOpt();
				 VdiskVolume.showOrHideDetachOpt();
				 VdiskVolume.showOrHideDeleteOpt();
				 VdiskVolume.showOrHideRenewOpt();
				 VdiskVolume.showOrHideBackupOpt();
				 VdiskVolume.showOrHideBackup4autoOpt();
				 VdiskVolume.showOrHideQueryBackupOpt();
			});
			
			$("#btnRefresh").unbind("click").bind("click", function() {
				VdiskVolume.updateDataTable();
			});
			
			// 挂载虚拟硬盘
			$("#attach_save").unbind("click").bind("click", function() {
				VdiskVolume.attachVdiskVolume();
			});
			
			// 修改虚拟硬盘名称和描述
			$("#modify_save").unbind("click").bind("click", function() {
				VdiskVolume.modifyVdiskVolume();
			});
			
			$("#createVdiskVolume").unbind("click").bind("click", function() {								
					var vdisk_quota = 0;
						// 带+-的输入框
						VdiskVolume.createPeridInput = null;
						if (VdiskVolume.createPeridInput == null) {
							var container = $("#perid").empty();				
							var max = 12;
							VdiskVolume.createPeridInput = new com.skyform.component.RangeInputField(container, {
								min : 1,
								defaultValue : 1,
								max:max,
								textStyle : "width:137px"
							}).render();
							VdiskVolume.createPeridInput.reset();								
						}
						
						//初始计费值
						VdiskVolume.getFee();
						
						$(".subFee").bind('mouseup keyup',function(){
							setTimeout('VdiskVolume.getFee()',100);
						});
						$("#agentId").focus(function(){
							$("#agentMsg").text("");
						});
						$("#createModal form")[0].reset();
						$("#slider-range-min").slider("option", "value", 10);
						$("#createStorageSize").val(10);					
						$("#tipCreateCount").text("");
						$("#tipCreateStorageSize").text("");
						$("#agentMsg").text("");
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
//					$("<li class='detail-item'><span>" + v.createTime + "  " +_name + "  " + v.controle + desc + "</span></li>").appendTo($("#opt_logs"));
//				});				
//			},function onError(msg){
//			});
			
		},
		// 刷新Table
		updateDataTable : function() {
			var _user = "";
			var _states = "";
			VdiskVolume.service.listAll(_user,_states,function onSuccess(data){
				VdiskVolume.instances = data;
				VdiskVolume.datatable.updateData(data);	
			},function onError(msg){
			});
		},
		// 根据选中的虚拟硬盘的个数判断是否将修改选项置为灰色
		showOrHideModifyOpt : function() {
			var checkboxArr = $("#volumeTable tbody input[type='checkbox']:checked");
			if(checkboxArr.length == 0){
				$("#beforeModify").addClass("disabled");
				//$("#beforeModify").attr("disabled",true);
			} else if(checkboxArr.length == 1){
				$("#beforeModify").removeClass("disabled");
				//$("#beforeModify").attr("disabled",false);
			} else {
				$("#beforeModify").addClass("disabled");
				//$("#beforeModify").attr("disabled",true);
			}
		},
		// 根据选中的虚拟硬盘的状态判断是否将挂载到主机选项置为不可用
		showOrHideAttachOpt : function() {
			var checkboxArr = $("#volumeTable tbody input[type='checkbox']:checked");
			if(checkboxArr.length == 0 || checkboxArr.length>1){
				$("#attachVm").addClass("disabled");
				//$("#attachVm").attr("disabled",true);

			} else {
				$("#attachVm").removeClass("disabled");
				//$("#attachVm").attr("disabled",false);			
				var hideAttach = false;
				var ownUser = $(checkboxArr[0]).parents("tr").attr("ownUserId");
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
					if ($(item).parents("tr").attr("ownUserId") != ownUser) {
						hideAttach = true;
						return;
					} 
				});
			    if (!hideAttach) {
			    	$("#attachVm").removeClass("disabled");
			    	//$("#attachVm").attr("disabled",false);
			    } else {
			    	$("#attachVm").addClass("disabled");
			    	//$("#attachVm").attr("disabled",true);
			    }
			}
		},
		
		// 根据选中的虚拟硬盘的状态判断是否将从主机卸载选项置为不可用
		showOrHideDetachOpt : function() {
			var checkboxArr = $("#volumeTable tbody input[type='checkbox']:checked");
			if(checkboxArr.length == 0 || checkboxArr.length>1){
				$("#detachVm").addClass("disabled");
				//$("#detachVm").attr("disabled",true);
			} else {
				$("#detachVm").removeClass("disabled");
				//$("#detachVm").attr("disabled",false);
				var hideDetach = false;
				var ownUser = $(checkboxArr[0]).parents("tr").attr("ownUserId");
				$(checkboxArr).each(function(index, item) {
					var state = $(item).parents("tr").attr("state");
					var optState = $(item).parents("tr").attr("optState");
					if (state != "using") { //running
						hideDetach = true;
						return;
					} else  {
						if (optState != undefined && optState != "" && optState == "unattaching") {
							hideDetach = true;
							return;
						}
					}
					if ($(item).parents("tr").attr("ownUserId") != ownUser) {
						hideDetach = true;
						return;
					} 
				});
			    if (!hideDetach) {
			    	$("#detachVm").removeClass("disabled");
			    	//$("#detachVm").attr("disabled",false);
			    } else {
			    	$("#detachVm").addClass("disabled");
			    	//$("#detachVm").attr("disabled",true);
			    }
			}
		},
		
		showOrHideRenewOpt : function() {
			var checkboxArr = $("#volumeTable tbody input[type='checkbox']:checked");
			if(checkboxArr.length == 0 || checkboxArr.length>1){
				$("#renew").addClass("disabled");
				//$("#renew").attr("disabled",true);
			} else {
				$("#renew").removeClass("disabled");
				//$("#renew").attr("disabled",false);

				var hideDetach = false;
				var ownUser = $(checkboxArr[0]).parents("tr").attr("ownUserId");
				$(checkboxArr).each(function(index, item) {
					var state = $(item).parents("tr").attr("state");
					if (state == "opening" || state.indexOf("error")>=0) {
						hideDetach = true;
						return;
					} 
					if ($(item).parents("tr").attr("ownUserId") != ownUser) {
						hideDetach = true;
						return;
					} 
				});
			    if (!hideDetach) {
			    	$("#renew").removeClass("disabled");
			    	//$("#renew").attr("disabled",false);
			    } else {
			    	$("#renew").addClass("disabled");
			    	//$("#renew").attr("disabled",true);
			    }
			}
		},
				
		// 根据选中的虚拟硬盘的状态判断是否将删除选项置为不可用， 还要根据是否挂载虚机
		showOrHideDeleteOpt : function() {
			var checkboxArr = $("#volumeTable tbody input[type='checkbox']:checked");
			if(checkboxArr.length == 0){
				$("#delete").addClass("disabled");
				//$("#delete").attr("disabled",true);
			} else {
				$("#delete").removeClass("disabled");
				//$("#delete").attr("disabled",false);

				var hideDelete = false;
				$(checkboxArr).each(function(index, item) {
					var state = $(item).parents("tr").attr("state");
					var optState = $(item).parents("tr").attr("optState");
					if(state != "running"){
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
			    	//$("#delete").attr("disabled",false);
			    } else {
			    	$("#delete").addClass("disabled");
			    	//$("#delete").attr("disabled",true);
			    }
			}
		},
		// 根据选中的虚拟硬盘的个数判断是否将备份选项置为灰色
		showOrHideBackupOpt : function() {
			var checkboxArr = $("#volumeTable tbody input[type='checkbox']:checked");
			if(checkboxArr.length == 0){
				$("#backup").addClass("disabled");
				//$("#backup").attr("disabled",true);
			} else if(checkboxArr.length == 1){
				$("#backup").removeClass("disabled");
				//$("#backup").attr("disabled",false);
			} else {
				$("#backup").addClass("disabled");
				//$("#backup").attr("disabled",true);
			}
		},
		// 根据选中的虚拟硬盘的个数判断是否将备份选项置为灰色
		showOrHideBackup4autoOpt : function() {
			var checkboxArr = $("#volumeTable tbody input[type='checkbox']:checked");
			if(checkboxArr.length == 0){
				$("#backup4auto").addClass("disabled");
				//$("#backup4auto").attr("disabled",true);
			} else if(checkboxArr.length == 1){
				$("#backup4auto").removeClass("disabled");
				//$("#backup4auto").attr("disabled",false);
			} else {
				$("#backup4auto").addClass("disabled");
				//$("#backup4auto").attr("disabled",true);
			}
		},		
		showOrHideQueryBackupOpt : function() {
			var checkboxArr = $("#volumeTable tbody input[type='checkbox']:checked");
			if(checkboxArr.length == 0){
				$("#queryBackup").addClass("disabled");
				//$("#queryBackup").attr("disabled",true);
			} else if(checkboxArr.length == 1){
				$("#queryBackup").removeClass("disabled");
				//$("#queryBackup").attr("disabled",false);
			} else {
				$("#queryBackup").addClass("disabled");
				//$("#queryBackup").attr("disabled",true);
			}
		},		
		
		getCheckedArr :function() {
			return $("#volumeTable tbody input[type='checkbox']:checked");
		},
		//显示该所属用户下的可用云主机
		describeVM : function() {
			var volumeId = VdiskVolume.getCheckedArr().parents("tr").attr("id");
			VdiskVolume.service.listVmsToAttach(volumeId,function onSuccess(data){
				if(data.length == 0){
					$.growlUI("提示", "没有可用的云主机！"); 
			    } else {
			    	$("#vmModal").modal("show");
					if(VdiskVolume.attachVolumnDataTable != null){
						VdiskVolume.attachVolumnDataTable.updateData(data);
					} else {
						VdiskVolume.attachVolumnDataTable =  new com.skyform.component.DataTable();
						VdiskVolume.attachDataTable(data);
					}
				}				
			},function onError(msg){
				$.growlUI("提示", "查询可用云主机发生错误：" + msg); 
			});
		},
		attachDataTable : function(data) {
			 VdiskVolume.attachVolumnDataTable.renderByData("#vmTable", {
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
		//显示该所属用户下的可用云主机
		describeBackup : function() {
			var volumeName = VdiskVolume.getCheckedArr().parents("tr").find("td:[name='instanceName']").html();
			window.location = Dcp.getContextPath()+"/jsp/maintain/backup4vdisk.jsp?ebs="+volumeName+"&code=backup4vdisk";
		},

		renderBackupDataTable : function(data) {
			 VdiskVolume.backupDataTable.renderByData("#backupTable", {
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
			 VdiskVolume.backupDataTable.addToobarButton("#backuptoolbar");
		},
		
		
		// 修改虚拟硬盘名称和描述
		modifyVdiskVolume : function() {
			var isSubmit = true;
			var instanceName = $("#modifyVolumeName").val();
			// 验证
			$("#modifyVolumeName").jqBootstrapValidation();
			if ($("#modifyVolumeName").jqBootstrapValidation("hasErrors")) {
				$("#tipModifyVolumeName").text("弹性块存储名称不能为空！");
				return;
			} else {
				$("#tipModifyVolumeName").text("");
			}			
			if (!isSubmit) {
				return;
			}
			var oldInstanceName = VdiskVolume.getCheckedArr().parents("tr").find("td[name='instanceName']").html();
			if(oldInstanceName == instanceName){
				$("#modifyDiskModal").modal("hide");
			}else{
//				com.skyform.service.PortalInstanceService.querySameNameExist(window.currentInstanceType,instanceName,function(isExist){
//					if(isExist){
//			    		$("#tipModifyVolumeName").text("该名称已经存在");						
//					}else{
//						$("#tipModifyVolumeName").text("");
						var id = VdiskVolume.getCheckedArr().val();			
						VdiskVolume.service.update(id,instanceName,function onSuccess(data){
							$.growlUI("提示", "修改弹性块存储信息成功! "); 
							VdiskVolume.updateDataTable();				
						},function onError(msg){
							$.growlUI("提示", "修改弹性块存储信息失败: "+msg);
						});
						$("#modifyDiskModal").modal("hide");
//					}
//				});				
			}
		},
		// 挂载虚拟硬盘
		attachVdiskVolume : function(){
			var checkedArr =  VdiskVolume.getCheckedArr();
			var volumeIds = "";
			$(checkedArr).each(function(index, item) {
				var tr = $(item).parents("tr");
				volumeIds += $("input", $("td", tr)[0]).val();
				if (index < checkedArr.length - 1) {
					volumeIds += ",";
				}
			});
			var vmId = $("#vmTable input[type='radio']:checked").val();
			var _vmid = vmId.trim();
			VdiskVolume.service.attach(volumeIds,_vmid,function onSuccess(data){
				$.growlUI("提示", "挂载申请提交成功, 正在挂载中..."); 
				VdiskVolume.updateDataTable();				
			},function onError(msg){
				$.growlUI("提示", "挂载申请提交失败: "+msg);
			});
			$("#vmModal").modal("hide");
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
					VdiskVolume.queryProductPrtyInfo(index);	
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
					VdiskVolume.getFee();
				});
				if (index == 0 || index == 5) {
					if(!billtype_hasSelected){
						billtype_hasSelected = true;
						cpu_option.addClass("selected");
						$("#peridUnit").empty().html("月");
						VdiskVolume.queryProductPrtyInfo(index);
					}
				}
				
			});
		},
		queryProductPrtyInfo :function(index){
			com.skyform.service.BillService.queryProductPrtyInfo(index,window.currentInstanceType,function(data){
				product.max = data.dataDisk.max;
				product.min = data.dataDisk.min;
				product.step = data.dataDisk.step;
				product.unit = data.dataDisk.unit;
				product.productId = data.productId;
				$("#unit").html(product.unit);
			});
		},
		queryProductPrtyInfo4backup :function(){
			com.skyform.service.BillService.queryProductPrtyInfo(0,window.currentInstanceType4buckup,function(data){
				product4buckup.productId = data.productId;
			});
		},
		queryProductPrtyInfo4backupauto :function(){
			com.skyform.service.BillService.queryProductPrtyInfo(0,window.currentInstanceType4autobuckup,function(data){
				product4autobuckup.productId = data.productId;
			});
		},
		
		getFee : function(){
			if(CommonEnum.offLineBill)return;
			var period = VdiskVolume.createPeridInput.getValue();
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
		},
		getFee_renew : function(subsId){
			var period = VdiskVolume.createPeridInput_renew.getValue();
			var peridUnit = $("#peridUnit").html();
			if(peridUnit == '年'){
				period = period*12;
			}
			var param = {
					"period":period,
					"subsId":subsId
			};
			Dcp.biz.apiAsyncRequest("/pm/queryCaculateFeeBySubsId",param, function(data) {
				if(0 == data.code){
					var count =1;
					var fee2=data.data.fee;
					var fee =  (typeof fee2=='number')?data.data.fee:data.data;
					$("#feeInput_renew").text(count *fee/1000);
				}
			});
		},
		createBackupByHand : function(subsId){
			var id = VdiskVolume.getCheckedArr().val();	
			var _name = $("#backupName").val();
			var params = {
				"period":240,
				"count":1,
				"productList":[
					{
						"instanceName":_name,
						"productId":product4buckup.productId, 
						"volumeid":id
					}
				]
			};
			
			VdiskVolume.service.createVolumeReplication(params,function onSuccess(data){
				$.growlUI("提示", "创建弹性块存储备份成功! "); 
				VdiskVolume.updateDataTable();		
				$("#backupModal").modal("hide");			
			},function onError(msg){
				$.growlUI("提示", "创建弹性块存储备份失败: "+msg);
			});

		},
		createBackupAuto : function(subsId){
			$("#autobackup_save").attr("disabled",true);
			var id = VdiskVolume.getCheckedArr().val();	
			
			var maxCount = "";
			var time = "";
			var week = "";
			
			var ck_home = $("#rd_home").attr("checked");
			var ck_other = $("#rd_other").attr("checked");
			if(ck_home){
				maxCount = $("#maxCount").val();
				time = $("#timeofday").val();
				week = $("#week_sel").val();				
			}else if(ck_other){
				maxCount = $("#maxCount_yd").val();
				time = $("#timeofday_yd").val();
				week = $("#week_sel_yd").val();				
			}
			
			var params = {
					"period":240,
					"count":1,
					"productList":[
							{
								"taskId" : "",
								"productId":product4autobuckup.productId ,
								"destresourcepoolid":"",
								"type":"native_rbd",
								"srcvolumeid":id,
								"dstvolumeid":id,
								"dayorweek": "",
								"time": time,
								"week_day": week,
								"remoteornot": "",
								"maxcount":maxCount,
								"serviceType":CommonEnum.serviceType[window.currentInstanceType4autobuckup]
							}
						]
					};
			
			var respool = $("#resPool").val();
			var _pool = $("#pool").val();
			if(ck_home){
				params.productList[0].destresourcepoolid = _pool;
				params.productList[0].remoteornot = "native";
				params.productList[0].taskId = $("#taskid").val();
//				var type = $("#day_week_sel").val();
//				if(type == "day"){
					params.productList[0].dayorweek = "day";
//				}else if(type == "week"){
//					params.productList[0].dayorweek = "week";
//				}

			}else if(ck_other){
				params.productList[0].destresourcepoolid = respool;
				params.productList[0].remoteornot = "remote";
				params.productList[0].taskId = $("#taskid_yd").val();
				var type = $("#day_week_sel_yd").val();
				if(type == "day"){
					params.productList[0].dayorweek = "day";
				}else if(type == "week"){
					params.productList[0].dayorweek = "week";
				}
			}			
			
			VdiskVolume.service.newOrEditVolumeReplicationTask(params,function onSuccess(data){
				$.growlUI("提示", "提交自动备份任务成功，请等待任务开通! "); 
				VdiskVolume.updateDataTable();		
				$("#backup4autoModal").modal("hide");			
			},function onError(msg){
				$.growlUI("提示", "提交自动备份任务失败: "+msg);
			});

		},
		listVolumeRelicationTask : function(subsId){
			var id = VdiskVolume.getCheckedArr().val();	
			var params = {
					"volumeid":""+id
			};
			
			VdiskVolume.service.listVolumeRelicationTask(params,function onSuccess(data){					
				if(data.length == 0){
					$("#ckb_open").attr("checked",false);
					VdiskVolume.disableNativeDiv();
					$("#ckb_open_yd").attr("checked",false);
					VdiskVolume.disableRemoteDiv();
					$("#task_status").html("");
					$("#task_status_yd").html("");
					$("#backup4autoModal form")[0].reset();
				}else if(data.length == 1){
					var remoteornot = data[0].remoteornot;
					if(remoteornot == "native"){						
						VdiskVolume.enableNativeDiv();
						$("#ckb_open_yd").attr("checked",false);
						$("#ckb_open").attr("checked",true);
//						$("#nativeDiv").attr("style","display:none;");
						$("#day_week_sel").val(data[0].dayorweek);
						$("#taskid").val(data[0].taskid);
						$("#maxCount").val(data[0].maxcount);
						$("#timeofday").val(data[0].time);
						$("#week_sel").val(data[0].week_day);
						var state = com.skyform.service.StateService.getState("vdisk",data[0].status);
						$("#task_status").html(state);	
						$("#task_status_yd").html("");
					}else if(remoteornot = "remote"){
						$("#ckb_open").attr("checked",false);		
						$("#ckb_open_yd").attr("checked",true);
						VdiskVolume.enableRemoteDiv();
						$("#resPool").val(data[0].destresourcepoolid);
						$("#day_week_sel_yd").val(data[0].dayorweek);
						$("#taskid_yd").val(data[0].taskid);
						$("#maxCount_yd").val(data[0].maxcount);
						$("#timeofday_yd").val(data[0].time);
						$("#week_sel_yd").val(data[0].week_day);	
						var state1 = com.skyform.service.StateService.getState("vdisk",data[0].status);
						$("#task_status_yd").html(state1);
						$("#task_status").html("");	
					}										
				}else if(data.length == 2){
					$(data).each(function(i){
						var remoteornot = data[i].remoteornot;
						if(remoteornot == "native"){
							$("#ckb_open").attr("checked",true);
							$("#day_week_sel").val(data[i].dayorweek);
							$("#taskid").val(data[i].taskid);
							$("#maxCount").val(data[i].maxcount);
							$("#timeofday").val(data[i].time);
							$("#week_sel").val(data[i].week_day);
							var state2 = com.skyform.service.StateService.getState("vdisk",data[i].status);
							$("#task_status").html(state2);
						}else if(remoteornot = "remote"){
							$("#ckb_open_yd").attr("checked",true);
							$("#resPool").val(data[i].destresourcepoolid);
							$("#day_week_sel_yd").val(data[i].dayorweek);
							$("#taskid_yd").val(data[i].taskid);
							$("#maxCount_yd").val(data[i].maxcount);
							$("#timeofday_yd").val(data[i].time);
							$("#week_sel_yd").val(data[i].week_day);
							var state3 = com.skyform.service.StateService.getState("vdisk",data[i].status);
							$("#task_status_yd").html(state3);
						}
					});									
				}
//				if(remoteornot == "native"){
//				$("#rd_home").attr("checked",true);
//				$("#resourcePool").attr("style","display:none;");
////				$("#rd_other").attr("checked",false);
//			}else if(remoteornot = "remote"){
////				$("#rd_home").attr("checked",false);
//				$("#rd_other").attr("checked",true);
//				$("#resourcePool").attr("style","display:block;");
//			}	

			},function onError(msg){
				$.growlUI("提示", "查询自动灾备服务配置信息失败: "+msg);
			});
		},
		disableNativeDiv : function(){
			var _childs = $("#backupContent").children();
			$(_childs).each(function(index, item) {
				$(item).find("input").attr("disabled",true);
				$(item).find("select").attr("disabled",true);
			});								
		},
		enableNativeDiv : function(){
			$("#ckb_open").attr("checked",true);
			var _childs = $("#backupContent").children();
			$(_childs).each(function(index, item) {
				$(item).find("input").attr("disabled",false);
				$(item).find("select").attr("disabled",false);
			});			
		},
		disableRemoteDiv : function(){
			var _childs = $("#backupContent_yd").children();
			$(_childs).each(function(index, item) {
				$(item).find("input").attr("disabled",true);
				$(item).find("select").attr("disabled",true);
			});											
		},
		enableRemoteDiv : function(){
			$("#ckb_open_yd").attr("checked",true);
			var _childs = $("#backupContent_yd").children();
			$(_childs).each(function(index, item) {
				$(item).find("input").attr("disabled",false);
				$(item).find("select").attr("disabled",false);
			});						
		},
		deleteReplicationTask : function(taskid){
//			var id = VdiskVolume.getCheckedArr().val();	
			var params = {
					"taskid": taskid
				};
			
			VdiskVolume.service.deleteReplicationTask(params,function onSuccess(data){
				$("#backup4autoModal").modal("hide");
				$.growlUI("提示", "关闭自动灾备服务成功");
			},function onError(msg){
				$("#backup4autoModal").modal("hide");
				$.growlUI("提示", "关闭自动灾备服务失败: "+msg);
			});
		}
		
						
};
