window.currentInstanceType='desktop';
window.Controller = {
		init : function(){
			Desktop.init();
		}
	};

var product = {};
var Desktop = {
		datatable : new com.skyform.component.DataTable(),
		attachVolumnDataTable  : null,
		backupDataTable  : null,
		confirmModal : null,
		confirmModal_detach : null,
		instances : [],
		selectedInstanceId : 0,
		//service : com.skyform.service.VdiskService4yaxin,
		service : com.skyform.service.desktopService,
		init : function() {

			//弹性块计费类型
			//Desktop.getBillTypeList();
				
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
					Desktop.onOptionSelected($(this).index());
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
			            $("#feeInput").text(Desktop.getFee());
			            return;
			        }
			        if (Number($(this).val()) < 10) {
			            $(this).val(10);
			            $("#feeInput").text(Desktop.getFee());
			            return;
			        }
			        if (Number($(this).val()) >product.max) {
			            $(this).val(product.max);
			            $("#feeInput").text(Desktop.getFee());
			            return;
			        }
			        if (Number($(this).val()) % 1 != 0) {
			            $(this).val(1);
			            $("#feeInput").text(Desktop.getFee());
			            return;
			        }
			        
			        if (Number($(this).val()) % 10 != 0) {
			            $(this).val(parseInt(parseInt($(this).val())/10) * 10);
			            $("#feeInput").text(Desktop.getFee());
			            return;
			        }			        
			        $(this).val(Number($(this).val()));
			        $("#feeInput").text(Desktop.getFee());					
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
					Desktop.onOptionSelected($(this).index());					
				}
			});
			$("body").bind('mousedown',function(){
				if(!inMenu){
					$("#contextMenu").hide();
				}
			});
			
			// 新建虚拟硬盘
			$("#btnCreateDesktop").click(Desktop.createDesktop);
			
			// 查询虚拟硬盘列表
			Desktop.describeDesktops();
			
			//点击修改按钮
			$("#beforeModify").bind('click',function(e){
				$("#tipModifyVolumeName").text("");
				Desktop.onOptionSelected(0);			
			});	

			//点击挂载按钮
			$("#attachDesktop").bind('click',function(e){
				Desktop.onOptionSelected(1);				
			});	
			
			//点击卸载按钮
			$("#detachDesktop").bind('click',function(e){
				Desktop.onOptionSelected(2);				
			});	

			//点击删除按钮
			$("#delete").bind('click',function(e){
				Desktop.onOptionSelected(3);				
			});	
			//点击续订按钮
			$("#renew").bind('click',function(e){
				Desktop.onOptionSelected(4);				
			});	
			$("#renew_save").bind('click',function(e){
				Desktop.renew();				
			});	
			
			Desktop.bindEvent();	
			$("#backup").bind('click',function(e){
				$("#backupModal").modal("show");
			});	
			//点击查看备份按钮
			$("#queryBackup").bind('click',function(e){
				Desktop.onOptionSelected(5);		
			});	

			
		},
		onOptionSelected : function(index) {
			if(index == 0){
				var oldInstanceName = Desktop.getCheckedArr().parents("tr").find("td:[name='instanceName']").html();
				var oldComment = Desktop.getCheckedArr().parents("tr").attr("comment");
				$("#modifyVolumeName").val(oldInstanceName);
				$("#modifyDiskModal").modal("show");
			} else if(index == "describeDesktop"){
				Desktop.describeDesktop();
			} else if(index == "reopen"){
				Desktop.reopenDesktop();
			} else if (index == "createDesktop") {
				Desktop.createDesktop();
			} else if(index == "showDeleteDesktop"){
				Desktop.showDeleteDesktop();
			} else if(index == "renew"){				
				// 带+-的输入框
				Desktop.createPeridInput_renew = null;
				if (Desktop.createPeridInput_renew == null) {
					var container = $("#perid_renew").empty();				
					var max = 12;
					Desktop.createPeridInput_renew = new com.skyform.component.RangeInputField(container, {
						min : 1,
						defaultValue : 1,
						max:max,
						textStyle : "width:137px"
					}).render();
					Desktop.createPeridInput_renew.reset();								
				}
				
				//TODO 续费计费值   
				var subsId = Desktop.getCheckedArr().parents("tr").attr("id");
				Desktop.getFee_renew(subsId);
				
				$(".subFee_renew").bind('mouseup keyup',function(){
					setTimeout('Desktop.getFee_renew('+subsId+')',100);
				});
				
				
				$("#renewModal").modal("show");
			} else if(index == 5){
				Desktop.describeBackup();
			}
		},
		reopenDesktop : function(id) {
			var confirmModal = new com.skyform.component.Modal(
					new Date().getTime(), "重启云桌面", "<h4>您确认要重启吗?</h4>", {
						buttons : [
								{
									name : "确定",
									onClick : function() {
										Desktop.service.restartDesktop(Desktop.selectedInstanceId,function onRestarted(result){
											confirmModal.hide();
											$.growlUI("提示", "操作成功");
											com.skyform.service.modifyStatus.modifyAllStatus(Desktop.selectedInstanceId,"resetting",Desktop.instances,function(){
										    	Desktop.updateDataTable();
										    });
											//VM.describleVM();
										},function onRestartFailed(errorMsg){
											confirmModal.hide();
											ErrorMgr.showError("重启失败："+errorMsg);
										})
									},
									attrs : [ {
										name : 'class',
										value : 'btn btn-primary'
									} ]
								}, {
									name : "取消",
									attrs : [ {
										name : 'class',
										value : 'btn'
									} ],
									onClick : function() {
										confirmModal.hide();
									}
								} ]
					});
			confirmModal.setWidth(300).autoAlign();
			confirmModal.show();
		},
		showDeleteDesktop : function() {
			var checkedArr =  Desktop.getCheckedArr();
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
				deleteTip = "您确认要退订吗?";
			}else{
				deleteTip = "您确认要批量退订吗?";
			}
				Desktop.confirmModal = new com.skyform.component.Modal(new Date().getTime(),"退订云桌面","<h4>"+deleteTip+"</h4>",{
					buttons : [
						{
							name : "确定",
							onClick : function(){
								// 删除虚拟硬盘
								var desktopIds = volumeIds.join(",");
								Desktop.service.destroy(desktopIds,function onSuccess(data){
									$.growlUI("提示", "退订申请提交成功, 正在退订中..."); 
									Desktop.confirmModal.hide();
									// refresh
									Desktop.updateDataTable();									
								},function onError(msg){
									$.growlUI("提示", "退订申请提交失败：" + msg);
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
								Desktop.confirmModal.hide();
							}
						}
					]
				});
			Desktop.confirmModal.setWidth(500).autoAlign();
			Desktop.confirmModal.show();
		},
		

		// 创建虚拟硬盘
		createDesktop : function() {
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
					$("#feeInput").text(Desktop.getFee());
					var period = Desktop.createPeridInput.getValue();
					var peridUnit = $("#peridUnit").html();			
					if(peridUnit == '年'){
						period = period*12;
					}
					
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
					
					Desktop.service.save(params,function onSuccess(data){				
						//订单提交成功后校验用户余额是否不足
						var _tradeId = data.tradeId;
						var _fee = $("#feeInput").text();
						var createModal = $("#createModal");
						com.skyform.service.BillService.confirmTradeSubmit(_fee,_tradeId,createModal,function onSuccess(data){
							$.growlUI("提示", "创建申请提交成功, 请耐心等待开通服务..."); 
							$("#createModal").modal("hide");
							// refresh
							Desktop.updateDataTable();									
						},function onError(msg){
							$.growlUI("提示", "创建申请提交成功,扣款失败");
							$("#createModal").modal("hide");
						});				
					},function onError(msg){
						$.growlUI("提示", "创建申请提交失败：" + msg); 
					});
		    		
		    	}
		    });
			
			
		},
		renew : function(){
			var volumeId = Desktop.getCheckedArr().parents("tr").attr("id");
			var period = Desktop.createPeridInput_renew.getValue();
			$("#renewModal").modal("hide");			
			var _modal = $("#renewModal");
			com.skyform.service.renewService.renew(volumeId,period,function onSuccess(data){
				//订单提交成功后校验用户余额是否不足
				var _tradeId = data.tradeId;
				var _fee = $("#feeInput_renew").text();
				com.skyform.service.BillService.confirmTradeSubmit(_fee,_tradeId,_modal,function onSuccess(data){
					$.growlUI("提示", "续订申请提交成功,扣款成功, 请耐心等待..."); 
					// refresh
					Desktop.updateDataTable();									
				},function onError(msg){
					$.growlUI("提示", "续订申请提交成功,扣款失败...");
				});			
			},function onError(msg){
				$.growlUI("提示", "续订时长提交失败：" + msg); 
			});			
		},
		// 查询虚拟硬盘列表
		describeDesktops : function() {
			//如果没有返回结果 {"msg":"","data":"返回结果为空！","code":0} 明天要问
			var _user = "";
			var _states = "";
			Desktop.service.listAll(function onSuccess(data){
				Desktop.instances = data;
				Desktop.renderDataTable(data);		
			},function onError(msg){
				$.growlUI("提示", "查询云桌面发生错误：" + msg); 
			});
		},
		renderDataTable : function(data) {			
			Desktop.datatable.renderByData("#desktopTable", {
					"data" : data,
					"pageSize" : 5,
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
						 //columnData.state = "running";
						 //columnData.optState = "running";
						 var text = columnData[''+columnMetaData.name] || "";						 
						 if(columnMetaData.name == 'id') {
							 text = '<input type="checkbox" value="'+text+'">';
						 }
						 else if (columnMetaData.name == "ID") {
							 text = text;
						 }
						 else if (columnMetaData.name == "state") {
							 if (columnData.optState == null || columnData.optState == "") {
								 text = com.skyform.service.StateService.getState("vdisk",text);
							 } else {
								 text = com.skyform.service.StateService.getState("vdisk",columnData.optState);
							 }
						 }
						 else if (columnMetaData.name == "createDate") {
							 text = new Date(text).format("yyyy-MM-dd hh:mm:ss");
						 }
						 else if (columnMetaData.name == "expireDate") {
							 text = new Date(text).format("yyyy-MM-dd hh:mm:ss");
						 }
						 else if ("descrInfo" == columnMetaData.name) {										
				        	   try {
				        		   var cpuNum = "";
				        		   var mem = "";
				        		   var os = "";
				        		   if(columnData.cpuNum&&columnData.cpuNum.length>0){
				        			   cpuNum = columnData.cpuNum;
				        		   }
				        		   if(columnData.os&&columnData.os.length>0){
					        			  os = columnData.os; 
					        		   }
				        		   if(columnData.memorySize&&columnData.memorySize.length>0){
				        			  mem = columnData.memorySize; 
				        		   }
									var appendText = "CPU个数:"
											+ cpuNum + "个 操作系统:"
											+ os + " 内存:"
											+ mem
											+ "GB "
									text = text + appendText;
								} catch (e) {

								}							
				           }
						return text;;
					}, 
					"afterRowRender" : function(rowIndex, data, tr){
						tr.attr("state", data.state).
						attr("comment", data.comment).
						attr("optState", data.optState);
						tr.attr("ownUserId", data.ownUserId).
						attr("ownUserId", data.ownUserId).
						attr("id", data.id). 
						attr("attachedHostId", data.attachedHostId);
						Desktop.bindEventForTr(rowIndex, data, tr);
					},
					"afterTableRender" : function() {
						// 翻页的时候清除前一页选中的checkbox，同时将更多操作置为不可用
						$("#desktopTable input[type='checkbox']").attr("checked", false);
			            //全选取消选中
			            $("#checkAll").attr("checked", false);			             
//						$("#beforeModify").addClass("disabled");
//						$("#beforeModify").attr("disabled",true);
//						$("#attachDesktop").addClass("disabled");
//						$("#attachDesktop").attr("disabled",true);						
//						$("#detachDesktop").addClass("disabled");
//						$("#detachDesktop").attr("disabled",true);					
						$("#delete").addClass("disabled");
						//$("#delete").attr("disabled",true);
						$("#renew").addClass("disabled");
						//$("#renew").attr("disabled",true);
//						
						
						var firstRow = $("#desktopTable tbody").find("tr:eq(0)");
						var firstInsId = firstRow.attr("id");
						//显示第一条记录的日志
						Desktop.showInstanceInfo(firstInsId);
						firstRow.css("background-color","#BCBCBC");
						Desktop.setSelectRowBackgroundColor(firstRow);
					}
				}
			);
			Desktop.datatable.addToobarButton("#disktoolbar");
			Desktop.datatable.enableColumnHideAndShow("right");
		},
		setSelectRowBackgroundColor : function(handler) {
			$("#content_container tr").css("background-color","");
			handler.css("background-color","#BCBCBC");
		},
		bindEventForTr : function(rowIndex, data, tr) {
			$(tr).attr("state", data.optState || data.state);
			$(tr).attr("name", data.instanceName);
			$(tr).attr("jobState", data.jobState);
			

			$(tr).unbind().mousedown(
				function(e) {
					
					if (3 == e.which) {
						$("#desktopTable input[type='checkbox']").attr("checked", false);
						$("#content_container #checkAll").attr("checked", false);
						tr.find("input[type='checkbox']").attr("checked", true);
						Desktop.selectedInstanceId = tr.attr("instanceId");
						$("#moreAction").removeClass("disabled");
						document.oncontextmenu = function() {
							return false;
						}
						var screenHeight = $(document).height();
//						console.log($(document).height());
//						console.log(e.pageY);
//						console.log(e.pageX);
						var top = e.pageY;
						
						if (e.pageY >= screenHeight / 2) {
							top = e.pageY - $("#contextMenu").height();
//							console.log($("#contextMenu").height())
							// 如果鼠标所在位置在屏幕高度中线的下半部分，则弹出框往上弹出
						}
						$("#contextMenu").hide();
						$("#contextMenu").attr(
								"style",
								"display: block; position: absolute; top:"
										+ top + "px; left:" + e.pageX
										+ "px; width: 180px;");
						$("#contextMenu").show();
						e.stopPropagation();
						Desktop.checkSelected(data);

					}
					Desktop.showInstanceInfo(data);
					Desktop.setSelectRowBackgroundColor(tr);
			});
			$(tr).click(function() {
				Desktop.checkboxClick(tr);
			});
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
			            	 $("#contextMenu").find("li.deleteDesktop").removeClass("disabled");
			             	 $("#contextMenu").find("li.attachDesktop").removeClass("disabled");
			             	$("#contextMenu").find("li.volumeSnapshot").removeClass("disabled");
			             } else {
			            	 $("#contextMenu").find("li.deleteDesktop").addClass("disabled");
			             	 $("#contextMenu").find("li.attachDesktop").addClass("disabled");
			             	 $("#contextMenu").find("li.volumeSnapshot").addClass("disabled");
			             }
			             
			             if ((state == "using") && (optState == undefined || optState == "")){
			            	 $("#contextMenu").find("li.detachDesktop").removeClass("disabled");
			             } else {
			            	 $("#contextMenu").find("li.detachDesktop").addClass("disabled");
			             }
			             
			             // 选中右键所单击的行，取消其他行的选中效果
			             $("tbody input[type='checkbox']").attr("checked", false);
			             //全选取消选中
			             $("#checkAll").attr("checked", false);			             
			             $("input[type='checkbox']",$(this)).attr("checked", true);
			             //同步“更多操作”
//			             Desktop.showOrHideModifyOpt();
//						 Desktop.showOrHideAttachOpt();
//						 Desktop.showOrHideDetachOpt();
//						 Desktop.showOrHideDeleteOpt();
//						 Desktop.showOrHideRenewOpt();
			     } 
			    Desktop.showInstanceInfo($(this).attr("id"));
			    Desktop.setSelectRowBackgroundColor($(this));
			}); 
			
			$("#checkAll").unbind("click").bind("click", function(e) {
				var checked = $(this).attr("checked") || false;
		        $("#desktopTable input[type='checkbox']").attr("checked",checked);	 
//		        Desktop.showOrHideModifyOpt();
//		        Desktop.showOrHideAttachOpt();
//		        Desktop.showOrHideDetachOpt();
//		        Desktop.showOrHideDeleteOpt();
//		        Desktop.showOrHideRenewOpt();
		        e.stopPropagation();
			});
			
			$("#desktopTable tbody input[type='checkbox']").unbind("click").bind("click", function() {
//				 Desktop.showOrHideModifyOpt();
//				 Desktop.showOrHideAttachOpt();
//				 Desktop.showOrHideDetachOpt();
//				 Desktop.showOrHideDeleteOpt();
//				 Desktop.showOrHideRenewOpt();
			});
			
			$("#btnRefresh").unbind("click").bind("click", function() {
				Desktop.updateDataTable();
			});
			$("#download").unbind("click").bind("click", function() {
				window.open ('/portal/download');
			});
			
			// 挂载虚拟硬盘
			$("#attach_save").unbind("click").bind("click", function() {
				Desktop.attachDesktop();
			});
			
			// 修改虚拟硬盘名称和描述
			$("#modify_save").unbind("click").bind("click", function() {
				Desktop.modifyDesktop();
			});
			
			$("#createDesktop").unbind("click").bind("click", function() {								
					var vdisk_quota = 0;
						// 带+-的输入框
						Desktop.createPeridInput = null;
						if (Desktop.createPeridInput == null) {
							var container = $("#perid").empty();				
							var max = 12;
							Desktop.createPeridInput = new com.skyform.component.RangeInputField(container, {
								min : 1,
								defaultValue : 1,
								max:max,
								textStyle : "width:137px"
							}).render();
							Desktop.createPeridInput.reset();								
						}
						
						//初始计费值
						Desktop.getFee();
						
						$(".subFee").bind('mouseup keyup',function(){
							setTimeout('Desktop.getFee()',100);
						});
						
						$("#createModal form")[0].reset();
						$("#slider-range-min").slider("option", "value", 10);
						$("#createStorageSize").val(10);					
						$("#tipCreateCount").text("");
						$("#tipCreateStorageSize").text("");
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
			Desktop.service.listAll(function onSuccess(data){
				Desktop.instances = data;
				Desktop.datatable.updateData(data);	
			},function onError(msg){
			});
			$("#beforeModify").addClass("disabled");
			$("#beforeModify").attr("disabled",true);
//			$("#attachDesktop").addClass("disabled");
//			$("#attachDesktop").attr("disabled",true);
//			$("#detachDesktop").addClass("disabled");
//			$("#detachDesktop").attr("disabled",true);
			$("#delete").addClass("disabled");
			//$("#delete").attr("disabled",true);
		},

		
		showOrHideRenewOpt : function() {
			var checkboxArr = $("#desktopTable tbody input[type='checkbox']:checked");
			if(checkboxArr.length == 0 || checkboxArr.length>1){
				$("#renew").addClass("disabled");
				$("#renew").attr("disabled",true);
			} else {
				$("#renew").removeClass("disabled");
				$("#renew").attr("disabled",false);

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
			    	$("#renew").attr("disabled",false);
			    } else {
			    	$("#renew").addClass("disabled");
			    	$("#renew").attr("disabled",true);
			    }
			}
		},
				

		getCheckedArr :function() {
			return $("#desktopTable tbody input[type='checkbox']:checked");
		},


		
		// 修改虚拟硬盘名称和描述
		modifyDesktop : function() {
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
			var oldInstanceName = Desktop.getCheckedArr().parents("tr").find("td[name='instanceName']").html();
			if(oldInstanceName == instanceName){
				$("#modifyDiskModal").modal("hide");
			}else{
//				com.skyform.service.PortalInstanceService.querySameNameExist(window.currentInstanceType,instanceName,function(isExist){
//					if(isExist){
//			    		$("#tipModifyVolumeName").text("该名称已经存在");						
//					}else{
//						$("#tipModifyVolumeName").text("");
						var id = Desktop.getCheckedArr().val();			
						Desktop.service.update(id,instanceName,function onSuccess(data){
							$.growlUI("提示", "修改弹性块存储信息成功! "); 
							Desktop.updateDataTable();				
						},function onError(msg){
							$.growlUI("提示", "修改弹性块存储信息失败: "+msg);
						});
						$("#modifyDiskModal").modal("hide");
//					}
//				});				
			}
		},

		getBillTypeList: function() {			
			$("#billType").empty();
			$.each(CommonEnum.billType, function(index) {				
				var cpu_option = $("<div  class=\"types-options cpu-options \" data-value='"+ index + "'>" + CommonEnum.billType[index] + "</div>");
				cpu_option.appendTo($("#billType"));
				cpu_option.click(function(){
					if($(this).hasClass("selected"))return;
					$("div.type-options").removeClass("selected");
					$(".options .types-options.cpu-options ").removeClass("selected");
					$(this).addClass("selected");
					Desktop.queryProductPrtyInfo(index);	
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
					Desktop.getFee();
				});
				if (index == 0 || index == 5) {
					cpu_option.addClass("selected");
					$("#peridUnit").empty().html("月");
					Desktop.queryProductPrtyInfo(index);
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
		getFee : function(){
			if(CommonEnum.offLineBill)return;
			var period = Desktop.createPeridInput.getValue();
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
			var period = Desktop.createPeridInput_renew.getValue();
			var peridUnit = $("#peridUnit").html();
			if(peridUnit == '年'){
				period = period*12;
			}
			var param = {
					"period":parseInt(period),
					"subsId":parseInt(subsId)
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
		checkboxClick : function(tr) {
			Desktop.checkSelected();
		},
		checkSelected : function(selectInstance) {
			var rightClicked = selectInstance?true:false;
			
			var allCheckedBox = $("#desktopTable input[type='checkbox']:checked");
			
			var oneSelected = allCheckedBox.length == 1;
			var hasSelected = allCheckedBox.length > 0;
			
			$(".operation").addClass("disabled");
			
			var state = $(allCheckedBox[0]).parents("tr").attr("state");
			
			var jobState = $(allCheckedBox[0]).parents("tr").attr("jobState");
			
			var allInstanceHasTheSameState = true;
			
			var allInstanceStateCanBeDestroy = true;
			
			$(allCheckedBox).each(function(index,checkbox){
				var _state = $(checkbox).parents("tr").attr("state");
				if(_state != state) {
					allInstanceHasTheSameState = false;
					return false;
				}
			});
			
			$(allCheckedBox).each(function(index,checkbox){
				var _state = $(checkbox).parents("tr").attr("state");
				var _jobState = $(checkbox).parents("tr").attr("jobState");
				if(_state =='deleting' || _state=='opening' || _jobState=='lock'){
					allInstanceStateCanBeDestroy = false;
					return false;
				}
			});
			
			$(".operation").each(function(index,operation){
				var condition = $(operation).attr("condition");
				var action = $(operation).attr("action");
				var enabled = true;
				eval("enabled=("+condition+")");
				if(enabled) {
					$(operation).removeClass("disabled");
					$(operation).unbind("click").click(function(){
						Desktop.onOptionSelected(action||"");
					});
				} else {
					$(operation).addClass("disabled");
					$(operation).unbind();
				}
			});
			
			
			if(rightClicked) {
				Desktop.instanceName = selectInstance.instanceName;
				Desktop.selectedInstanceId = selectInstance.id;	
			} else {
				for ( var i = 0; i < allCheckedBox.length; i++) {
					var currentCheckBox = $(allCheckedBox[i]);
					if (i == 0) {
						Desktop.instanceName = currentCheckBox.parents("tr").attr("name");
						Desktop.selectedInstanceId = currentCheckBox.attr("value");
					} else {
						Desktop.instanceName += "," + currentCheckBox.parents("tr").attr("name");
						Desktop.selectedInstanceId += "," + currentCheckBox.attr("value");
					}
				}
			}
		}	
};
