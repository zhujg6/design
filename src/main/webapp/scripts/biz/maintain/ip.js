//10.10.242.180

window.currentInstanceType = 'ip';
window.Controller = {
		
	init : function() {
		
		//console.log('aaa');
		
		eip.init();
		
		eip._moreOpAction();
	},
	refresh : function() {
		eip.updateDataTable();
	}
}
var ConfirmWindow = new com.skyform.component.Modal("confirmWindow", "", "", {
	buttons : [
			{
				name : '确定',
				attrs : [ {
					name : 'class',
					value : 'btn btn-primary'
				} ],
				onClick : function() {
					if (ConfirmWindow.onSave
							&& typeof ConfirmWindow.onSave == 'function') {
						ConfirmWindow.onSave();
					} else {
						ConfirmWindow.hide();
					}
				}
			}, {
				name : '取消',
				attrs : [ {
					name : 'class',
					value : 'btn'
				} ],
				onClick : function() {
					ConfirmWindow.hide();
				}
			} ]
}).setWidth(400).autoAlign().setTop(100);
var ContextMenu = function(options) {
	var _options = {
		container : options.container || $("#contextMenu"),
		onAction : options.onAction || function(action) {
		},
		trigger : options.trigger || $("body"),
		beforeShow : options.beforeShow || function() {
		},
		afterShow : options.afterShow || function() {
		},
		beforeHide : options.beforeHide || function() {
		},
		afterHide : options.afterHide || function() {
		}
	};

	this.setTrigger = function(trigger) {
		_options.trigger = trigger;
		_init();
	};

	this.reset = function() {
		_init();
	};
	this.inMenu = false;

	var _init = function() {
		_options.container = $(_options.container);
		_options.container.hide();
		$(_options.trigger).unbind("mousedown").bind(
				"mousedown",
				function(e) {
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
						_options.container.attr("style",
								"display: block; position: absolute; top:"
										+ top + "px; left:" + e.pageX
										+ "px; width: 180px;");
						_options.beforeShow($(this));
						_options.container.show();
						e.stopPropagation();
						_options.afterShow($(this));

					}
				});
		var self = this;
		_options.container.unbind("mouseover").bind('mouseover', function() {
			self.inMenu = true;
		});

		_options.container.unbind("mouseout").bind('mouseout', function() {
			self.inMenu = false;
		});
		_options.container.find("li").unbind("mousedown").bind('mousedown',
				function(e) {
					_options.container.hide();
					if (!$(this).hasClass("disabled")) {
						var action = $(this).attr("action");
						if (action)
							_options.onAction(action);
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
var feeUnit = 1000;
var product = {};
var eip = {	
	recoveryandhangedflag:true,
	volumeState : [],
	datatable : new com.skyform.component.DataTable(),
	hostDatatable : null,
	hostDatatable_detach : null,
	routeDatatable : null,
	loadbalanceDatatable : null,
	userListData : [],
	createCountInput : null,
	cretePeriodInput : null,
	selectedProductId : null,
	ipWidthModal : null,
	createPeridInput : null,
	enough : 1,
	quota : 99,
	usedQuota:0,
	serviceType : 0,
	defultPool:null,
	tempdata:[],
	ChannelService : com.skyform.service.channelService,
	areaZoneId:null,
	flagPool:false,
	init : function() {
		eip.serviceType = CommonEnum.serviceType["lb"];
		eip.defultPool= $("#pool").val();
		eip.flagPool=(-1!=Config.privateNetwork.indexOf(eip.defultPool));
//		if(eip.defultPool=="bdzhcs" || eip.defultPool=="neimengguhuanbaoyun"|| eip.defultPool=="shandongzaozhuang"){
		if(eip.flagPool){
			eip.initZoneId();
		};	
		var attachVmTab = ' <form style="display:block"><table class="table" contenteditable="false" id="hostsTable"></table></form>';
		var attachVrTab = ' <form><div id="routeTableDiv"><table class="table" contenteditable="false" id="routesTable"></table></div></form>';
        
		$("#attachModal").on("hidden", function() {
			$("#attachModal #attachVmModal").empty().append(attachVmTab);
			eip.hostDatatable = null;
		});
		$("#attachModal_route").on("hidden", function() {
			$("#attachModal_route #attachVrModal").empty().append(attachVrTab);
			eip.routeDatatable = null;
		});
		$("#createInsName").focus(function() {
			$("#tipCreateInsName").empty();
		});
		$("#modInsName").focus(function() {
			$("#tipModifyInsName").empty();
		});
		$("#agentId").focus(function() {
			$("#agentMsg").empty();
	        });
		$("#useAgentBtn").unbind("click").bind("click", function() {
			//该方法在agentCommon.js里
			com.skyform.agentService.getAgentCouponFeeInfo("ip");
		});
		eip.instances = [], eip.volumeState = {
			"pending" : Dict.val("common_ins_state_pending"),
			"reject" : Dict.val("common_ins_state_reject"),
			"opening" : Dict.val("common_ins_state_opening"),
			"changing" : Dict.val("common_ins_state_changing"),
			"deleting" : Dict.val("common_ins_state_deleting"),
			"deleted" : Dict.val("common_ins_state_deleted"),
			"running" : Dict.val("common_ins_state_running"),// 就绪
			"using" : Dict.val("common_ins_state_binded"),
			"binding" : Dict.val("common_ins_state_binding"),
			"unbinding" : Dict.val("common_ins_state_unbinding"),
			"error" : Dict.val("common_ins_state_error"),
			"create error" : Dict.val("common_ins_state_error"),
			"delete error" : Dict.val("common_ins_state_error"),
			"bind error" : Dict.val("common_ins_state_error"),
			"unbind error" : Dict.val("common_ins_state_error")
		};
		eip.describeEip();
		eip.getBillTypeList();
		$("#createEipA")
				.unbind("click")
				.bind(
						"click",
						function() {
							// 带+-的输入框
							if (eip.createCountInput == null) {
								var container = $("#createCount").empty();
								eip.createCountInput = new com.skyform.component.RangeInputField(
										container, {
											min : 1,
											defaultValue : 1,
											textStyle : "width:137px"
										});
								eip.createCountInput.render();
								// eip.createCountInput.showErrorMsg =
								// function(msg) {};
								// eip.createCountInput.hideErrorMsg =
								// function() {};
							}
							eip.createCountInput.reset();

							$("#createEipModal form")[0].reset();
							$("#slider-range-min").slider("option", "value", 1);
							$("#amount").val(1);
							$("#slider-ip-min").slider("option", "value", 1);
							$("#amount-ip").val(1);

							// $("#tipOwnUserAccount").text("");
							// $("#tipOwnUserId").text("");
							$("#tipCreateCount").text("");
							$("#amount").text("");
							$("#createEipModal").modal("show");
						});

		$("#selectAllEip").click(function(event) {
			var checked = $(this).attr("checked") || false;
			$("#teip input[type='checkbox']").attr("checked", checked);
		});
		$("#selectAll").click(function(event) {
			var checked = $(this).attr("checked") || false;
			$("#tall input[type='checkbox']").attr("checked", checked);
		});

		// 更多操作...中的下拉菜单添加监听事件
		// $(".dropdown-menu").bind('mouseover',function(){
		// inMenu = true;
		// });
		//		
		// $(".dropdown-menu").bind('mouseout',function(){
		// inMenu = false;
		// });
		// $(".dropdown-menu li").bind('click',function(e){
		// eip.handleLi($(this).index());
		// });
		// IP slider
		$("#slider-ip-min").slider({
			range : "min",
			value : 1,
			min : 1,
			max : 30,
			step : 1,
			slide : function(event, ui) {
				// var sp = $("#amount01").val();
				$("#amount-ip").val(ui.value);
				// calc();
			}
		});

		$("#amount-ip").val($("#slider-ip-min").slider("value"));

		$("#amount01").bind("blur", function() {
			calc();
		});
		$("#amount").bind("blur", function() {
			if ($("#amount").val() > product.max) {
				$("#amount").val(product.max);
			}
		});
		$("#modifyAmount").bind("blur", function() {
			if ($("#modifyAmount").val() > product.max) {
				$("#modifyAmount").val(product.max);
			};
			if($("#modifyAmount").val()<$("#modifyAmount").attr("min")){
				if($("#modifyAmount").attr("min")>0){
					$("#modifyAmount").val($("#modifyAmount").attr("min")).focus();
				}else{
					$("#modifyAmount").val("1").focus();
				}
			};
		});
		var realValue;
		$("#amount").bind(
				"keydown",
				function(e) {
					if (e.which == 13) { // 获取Enter键值
						e.preventDefault(); // 阻止表单按Enter键默认行为，防止按回车键提交表单
						realValue = parseInt($("#amount").val());
						$("#slider-range-min").slider("option", "value",
								realValue);
						var max = parseInt($("#slider-range-min").slider(
								"option", "max"));
						if (realValue > max) {
							realValue = max;
						}
						$("#amount").val(realValue);
					}
				});
		$("#amount-ip").bind(
				"keydown",
				function(e) {
					if (e.which == 13) { // 获取Enter键值
						e.preventDefault(); // 阻止表单按Enter键默认行为，防止按回车键提交表单
						realValue = parseInt($("#amount-ip").val());
						$("#slider-ip-min")
								.slider("option", "value", realValue);
						var max = parseInt($("#slider-ip-min").slider("option",
								"max"));
						if (realValue > max) {
							realValue = max;
						}
						$("#amount-ip").val(realValue);
					}
				});

		// $("#amount").bind("blur",function(e){
		// e.preventDefault(); // 阻止表单按Enter键默认行为，防止按回车键提交表单
		// realValue = parseInt(parseInt($("#amount").val())/10) * 10 ;
		// $( "#slider-range-min" ).slider( "option", "value", realValue);
		// $("#amount").val(realValue);
		// });

		// 点击创建按钮
		// $("#createEbsModal").bind('click',function(e){
		// ebs.showCreateEbs();
		// });
		// 新建ebs
		$("#btnCreateEip").bind('click', function(e) {
			if($("#amount").val()<1){
				alert("带宽值最小为“1”");
				$("#amount").val("1").focus();
				return;
			}
			if(eip.createCountInput.getValue()<1){
				alert("周期值最小为“1”");
				return;
			}
			eip.createEip();
		});
		// 绑定主机
		$("#btn_saveRelation").bind('click', function(e) {
			eip.saveRelationInstance();
		});
		// 点击修改按钮
		/*
		 * $("#btn_modifyEip").bind('click',function(e){ eip.handleLi(0); });
		 */
		// 修改eip
		$("#modify_save")
				.bind(
						'click',
						function(e) {
							// 只有当选中一个公网IP时修改名称和备注，其他情况友情提示
							var ids = $("#eipTable tbody input[type='checkbox']:checked");
							var instanceName = $(
									"#modifyEipModal  input[name='instance_name']")
									.val();
							var comment = $("#modifyEipModal textarea").val();
							com.skyform.service.PortalInstanceService
									.querySameNameExist(
											window.currentInstanceType,
											instanceName, function(isExist) {
												if (!isExist) {
													eip.modifyEip($(ids[0])
															.val(),
															instanceName,
															comment);
												} else
													$.growlUI(Dict
															.val("common_tip"),
															Dict.val("common_name_used_re_enter"));
											});

						});
		// 点击扩容按钮
		/*
		 * $("#btn_larger").bind('click',function(e){ eip.handleLi(4); });
		 */
		// eip扩容
		$("#mod_storageSize_save").bind('click', function(e) {
			// var ids = $("#eipTable tbody input[type='checkbox']:checked");
			var storageSize = $("#modifyAmount").val();
			if(storageSize<0){
				if($("#modifyAmount").attr("min")>0){
					$("#modifyAmount").val($("#modifyAmount").attr("min")).focus();
				}else{
					$("#modifyAmount").val("1").focus();
				}

				return;
			}
			var id = eip.getCheckedArr().parents("tr").attr("bandwidthId");
			var ids = $("#eipTable tbody input[type='checkbox']:checked");
			var ipId = $(ids[0]).val();
			eip.modifyEipStorageSize(id, ipId, storageSize);
		});
		$("#btn_saveroute").bind('click', function(e) {
			eip.saveRelationRoute();
		});

		// 带宽类型
		$("#iptype-share").unbind().bind("click", function() {
			$("#iptype-share").addClass("selected");
			$("#iptype-private").removeClass("selected");
		});
		$("#iptype-private").unbind().bind("click", function() {
			$("#iptype-private").addClass("selected");
			$("#iptype-share").removeClass("selected");
		});

		// 按钮变灰
		$(".operation").addClass("disabled");

		$(".subFee4change").bind('mouseup keyup', function() {
			setTimeout('eip.getFee4change()', 100);
		});
		//挂起和恢复特殊控制
//		var currPool=$("#pool").val();
//		$.each(CommonEnum.NewPoolList,function(key,value){
//			if(currPool==value){
//				eip.recoveryandhangedflag=true;
//			}else{
//				eip.recoveryandhangedflag=false;
//			}
//			
//		});
	},
	initZoneId:function(){
		//得到域
//		var az="";
//		com.skyform.service.resQuotaService.queryQuotaAllCountByLoginName(az,function onSuccess(data){
//				if(data&&data.length!=0){
//					eip.areaZoneId=data[0].quotaTotal.availableZoneId;
//				 }
//		},function onError(msg){
//			//$.growlUI(Dict.val("common_tip"),msg);
//		});
//		
		com.skyform.service.resQuotaService.queryAZAndAzQuota(function(data){	
			if(data&&data.length!=0){
				$.each(data,function(i,item){
					if(item.isQuotaExist==1){
				        eip.areaZoneId=item.availableZoneId;
					};
					
				});
			};
		});
	},
	getBillTypeList : function() {
		$("#billType").empty();
		var billtype_hasSelected = false;
		$
				.each(
						CommonEnum.billType,
						function(index) {
							var cpu_option = $("<div  class=\"types-options cpu-options \" data-value='"
									+ index
									+ "'>"
									+ CommonEnum.billType[index]
									+ "</div>");
							cpu_option.appendTo($("#billType"));
							cpu_option.click(function() {
								if ($(this).hasClass("selected"))
									return;
								$("div.type-options").removeClass("selected");
								$(".options .types-options.cpu-options ")
										.removeClass("selected");
								$(this).addClass("selected");
								// VM.getMemoryList(item);
								eip.queryProductPrtyInfo(index);
								eip.getFee();
								if (0 == index) {
									$("#periodUnit").empty().html(Dict.val("common_month"));
								} else if (3 == index) {
									$("#periodUnit").empty().html(Dict.val("common_year"));
								} else if (2 == index) {
									$("#periodUnit").empty().html(Dict.val("common_day"));
								}
							});
							if (index == 0 || index == 5) {
								if (!billtype_hasSelected) {
									billtype_hasSelected = true;
									cpu_option.addClass("selected");
									$("#periodUnit").empty().html(Dict.val("common_month"));
									eip.queryProductPrtyInfo(index);
								}
							}
						});
	},

	queryProductPrtyInfo : function(index) {
		com.skyform.service.BillService.queryProductPrtyInfo(index,
				window.currentInstanceType, function(data) {
					product.max = data.brandWidth.max;
					product.min = data.brandWidth.min;
					product.step = data.brandWidth.step;
					product.unit = data.brandWidth.unit;
					product.productId = data.productId;
					$("#unit").html(product.unit);
					$("#amount").attr("step", data.brandWidth.step);
					$("#amount").attr("max", data.brandWidth.max);
					$("#amount").attr("min", data.brandWidth.min);
				});
	},

	getCheckedHostIds : function() {
		var checkedArr = $("#hostsTable tbody input[type='checkbox']:checked");
		// var volumeNames = "";
		var volumeIds = [];
		$(checkedArr).each(function(index, item) {
			var tr = $(item).parents("tr");
			// volumeNames += $($("td", tr)[2]).text();
			var id = $("input[type='checkbox']", $("td", tr)[0]).val();
			volumeIds.push(id);
			if (index < checkedArr.length - 1) {
				// volumeNames += ",";
			}
		});
		var hostIds = volumeIds.join(",");
		return hostIds;
	},
	generateTable : function(data) {
		this.datatable = new com.skyform.component.DataTable();
		this.datatable
				.renderByData(
						"#eipTable",
						{
							"data" : data,
							"pageSize" : 5,
							onColumnRender : function(columnIndex,
									columnMetaData, columnData) {
								if (columnMetaData.name == 'id') {
									return "<input type='checkbox' value='"
											+ columnData.id + "'/>";
								} else if (columnMetaData.name == 'ID') {
									return columnData.id;
								}
								// else if (columnMetaData.BAND_WIDTH ==
								// 'BAND_WIDTH') {
								// return 2;
								// }
								else if (columnMetaData.name == 'state') {
									return com.skyform.service.StateService
											.getState("ip", columnData.state
													|| columnData);
								} else if ("createDate" == columnMetaData.name) {
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
								} else if ("expireDate" == columnMetaData.name) {
									try {
										var obj = eval('(' + "{Date: new Date("
												+ columnData.expireDate + ")}"
												+ ')');
										var dateValue = obj["Date"];
										text = dateValue
												.format('yyyy-MM-dd hh:mm:ss');
									} catch (e) {

									}
									return text;
								}
								else if("dedLineId"==columnMetaData.name){
									//console.log(columnIndex);
									
									//this.hideOrShowColumn(columnIndex,true);
									text=columnData.displayName;
									return text;
									
								} 
								
								else if ("instanceName" == columnMetaData.name) {
									text = columnData.instanceName
											+ "<a title='咨询建议' href='../user/workOrder.jsp?code=workOrder&cataCode=service&instanceId="
											+ columnData.id
											+ "&serviceType=ip&instanceName="
											+ encodeURIComponent(columnData.instanceName)
											+ "&instanceStatus="
											+ columnData.state
											+ "&currentPoolW="
											+ encodeURIComponent(CommonEnum.pools[CommonEnum.currentPool])
											+ "'><i class='icon-comments' ></i></a>";
									return text;
								}
								return columnData[columnMetaData.name];
							},
							afterRowRender : function(rowIndex, data, tr) {
								tr.attr("state", data.state).attr("comment",
										data.comment);
								tr.attr("ownUserId", data.ownUserId);
								tr.attr("bandwidthId", data.bandwidthId);
								tr.attr("BAND_WIDTH", data.BAND_WIDTH);
								tr.attr("instanceId", data.id);
								tr.attr("hostIds", data.hostIds);

								tr.attr("period", data.period);
								tr.attr("productId", data.productId);
                                tr.attr("dedLineId",data.dedLineId);
								tr.find("input[type='checkbox']").click(
										function() {
											eip.onInstanceSelected();
										});
								tr.click(function() {
									eip.getRelateHosts(data.id);
									eip.getOptLog(data.id);
								});
							},
							afterTableRender : function() {
								eip.bindEvent();
								var firstRow = $("#eipTable tbody").find(
										"tr:eq(0)");
								var instanceId = firstRow.attr("instanceId");
								eip.getRelateHosts(instanceId);
								eip.getOptLog(instanceId);
								//eip.datatable.hideOrShowColumn(6,true);
								//this.hideOrShowColumn(columnIndex,visable);
								
							}
						});
		
		eip.datatable.addToobarButton("#toolbar4tb2");
		eip.datatable.enableColumnHideAndShow("right");
//		if(eip.defultPool!="bdzhcs" && eip.defultPool!="neimengguhuanbaoyun"&& eip.defultPool!="shandongzaozhuang"){
		if(!eip.flagPool){
		$("#eipTable").dataTable().fnSetColumnVis(6, false);
		};	
		//$("#eipTable").dataTable().fnSetColumnVis(4, false);
		//eip.datatable.hideOrShowColumn(1,false);
	},
	describeEip : function() {
		// 将自己编写的显示主机的table渲染
		com.skyform.service.EipService.listAll(function(data) {
			eip.instances = data;
			eip.generateTable(data);
		})
	},
	bindEvent : function() {
		if (!eip.contextMenu) {
			eip.contextMenu = new ContextMenu({
				beforeShow : function(tr) {
					// Route.checkAll(false);
					// 取消所有选中的行，选中当前的行
					$("#eipTable input[type='checkbox']")
							.attr("checked", false);
					tr.find("input[type='checkbox']").attr("checked", true);
					eip.onInstanceSelected();
				},
				afterShow : function(tr) {
					// Route.onInstanceSelected({
					// instanceName : tr.attr("instanceName"),
					// id : tr.attr("instanceId"),
					// state : tr.attr("instanceState")
					// });
				},
				trigger : "#eipTable tr",
				onAction : function(action) {
					eip._invokeAction(action);
				}
			});
		} else {
			eip.contextMenu.reset();
		}

		$("#checkAll").unbind("click").bind("click", function(e) {
			var checked = $(this).attr("checked") || false;
			$("#eipTable input[type='checkbox']").attr("checked", checked);
			eip.onInstanceSelected();
			// eip.showOrHideOpt();
			// e.stopPropagation();
		});

	},

	// 创建公网IP
	createEip : function() {
		var isSubmit = true;
		var instanceName = $.trim($("#createInsName").val());
		var count = 1;
		var storageSize = $.trim($("#amount").val());
		var account = $("#user_name").val();
		//var freeParam={"verifyFlag" : "0",};
		// var type =
		// $("#createEipModal").find(".types-options.selected").attr("datavalue");
		var type = 1;// 先默认为独享带宽
		// var ownUserId = ebs.getOwnUserIdByAccount(account);
		// var ownUserId = $("#ownUserId").val();
		// 验证
		$("#createInsName, #amount").jqBootstrapValidation();
		// if ($("#ownUserId").jqBootstrapValidation("hasErrors")) {
		// $("#tipOwnUserId").text("所属用户必须选择！");
		// isSubmit = false;
		// } else {
		// $("#tipOwnUserId").text("");
		// }

		var scoreReg = /^[\u4E00-\u9FA0A-Za-z\-0-9\_]+$/;
		if (instanceName != "") {
			if (!scoreReg.exec(instanceName)) {
				$("#tipCreateInsName").text(Dict.val("common_ch_en_num"));
				// $("#createInsName").focus();
				isSubmit = false;
			} else {
				$("#tipCreateInsName").text("");
			}
		}

		var countValidateResult = eip.createCountInput.validate();
		if (countValidateResult.code == 1) {
			$("#tipCreateCount").text(countValidateResult.msg);
			isSubmit = false;
		} else {
			$("#tipCreateCount").text("");
			count = eip.createCountInput.getValue();
		}
		// if(eip.quota - eip.instances.length - count< 0) {
		// $.growlUI(Dict.val("common_tip"), "您申请的互联网接入数量已经达到了最大配额:" +
		// eip.quota);
		// // ErrorMgr.showError("您申请的互联网接入数量已经达到了最大配额:" + eip.quota);
		// return;
		// }
		// console.log(eip.enough);
		// console.log(count);
		// console.log(eip.enough - count)
		var freeParam={"verifyFlag" : "0"};
		//if(eip.defultPool=="bdzhcs" || eip.defultPool=="neimengguhuanbaoyun"|| eip.defultPool=="shandongzaozhuang"){
		if(eip.flagPool){
			//freeParam={"verifyFlag" : "0","dedLineId":$("#dedicatedLine").val()};
			freeParam.dedLineId=parseInt($("#dedicatedLine").val());
		};
		var dataCode=0;
		var dataMsg="";
		Dcp.biz.apiRequest("/instance/eip/queryFreeIp", freeParam, function(data) {
			//console.log(data.code);
			if (null != data && data.code == 0) {
				eip.enough = data.data;
			}
			dataCode=data.code;
			dataMsg=data.msg;
		});
		//console.log(dataCode);
		//console.log(dataMsg);
		//console.log(eip.enough-count<0);
		if (eip.enough - count < 0) {
			$.growlUI(Dict.val("common_tip"), Dict.val("eip_applications_balance") + eip.enough
					+ ','+Dict.val("eip_unable_to_create"));
			// ErrorMgr.showError("您申请的互联网接入数量已经达到了最大配额:" + eip.quota);
			return;
		}
		
		if(dataCode==-1){
			$.growlUI(dataMsg);
			return;
		}
		// if ($("#amount01").jqBootstrapValidation("hasErrors")) {
		// $("#tipCreateCount").text("数量必须为大于等于1");
		// isSubmit = false;
		// } else {
		// $("#tipCreateCount").text("");
		// }

		if ($("#amount").jqBootstrapValidation("hasErrors")) {
			$("#tipCreateStorageSize").text(Dict.val("eip_bandwidth_must_greater_equal"));
			$("#amount").val(1);
			$("#slider-range-min").slider("option", "value", 1);
			isSubmit = false;
		} else {
			$("#tipCreateStorageSize").text("");
		}

		if (!isSubmit) {
			return;
		}

		$("#feeInput").val(eip.getFee());
		// TODO 加入输入合法性校验 ,对于portal,获取登录的用户赋值给ownUserId，目前写死测试值1115
		// com.skyform.service.PortalInstanceService.checkDuplcatedName(instanceName,"ip",function(duplcate){
		// duplcate = true;
		// if(!duplcate){
		// $("#tipCreateInsName").text("该名称已经被使用，请重新输入");
		// return;
		// }
		// else {
		// 如果是年，period * 12
		var period = eip.createPeriodInput.getValue();
		if (3 == $("#billType .selected").attr("data-value")) {
			period = period * 12;
		}
		;
		var params = {
			"period" : period,
			"count" : count,
			"productList" : [ {
				"instanceName" : instanceName,
				"BAND_WIDTH" : $("#amount").val(),
			   // "storageSize":$("#amount").val(),
				"productId" : product.productId
			} ]
		};

//		if(eip.defultPool=="bdzhcs" || eip.defultPool=="neimengguhuanbaoyun"|| eip.defultPool=="shandongzaozhuang"){
	    if(eip.flagPool){
		params.productList[0].dedLineId=parseInt($("#dedicatedLine").val());
		}
		
		var _fee = $(".price").html()?Number($(".price").html()):0;
		var createModal = $("#createEipModal");
		var portalType = Dcp.biz.getCurrentPortalType();
		var agentId = $("#agentId").val();
		if (agentId && agentId.length > 0) {
			com.skyform.service.channelService
					.checkAgentCode(
							agentId,
							function(data) {
								if ("-3" == data) {
									$("#agentMsg").html(Dict.val("common_discount_code_no_exist"));
								} else if ("-2" == data || "-1" == data) {
									$("#agentMsg").html(Dict.val("common_discount_code_expired"));
								} else if("-6" == data){
									$("#agentMsg").html(Dict.val("common_coupons_reached_maximum_number"));
								} else if("-4" == data){
									$("#agentMsg").html(Dict.val("common_discount_code_authing"));
								} else if("-5" == data){
									$("#agentMsg").html(Dict.val("common_discount_code_unauthed"));
								}else if("-7" == data){
									$("#agentMsg").html(Dict.val("common_discount_code_noavailable"));
								}							
								else {
									var channel = com.skyform.service.channelService.channel;
									channel.serviceType = CommonEnum.serviceType["ip"];
									channel.agentCouponCode = agentId;
									channel.period = params.period;
									channel.productList[0].price = _fee;
									channel.productList[0].productId = params.productList[0].productId;
									channel.productList[0].serviceType = CommonEnum.serviceType["ip"];
									channel.productList[0].productDesc = params.productList[0];
									// com.skyform.service.channelService.confirmChannelSubmit(channel,createModal,function
									// onSuccess(data) {
									// $.growlUI(Dict.val("common_tip"),"订单已提交，请等待审核通过后完成支付！您可以在用户中心->消费记录中查看该订单信息。");
									// $("#createEipModal").modal("hide");
									// }, function onError(msg) {
									// $.growlUI(Dict.val("common_tip"),
									// "订单提交失败！");
									// $("#createEipModal").modal("hide");
									// });

									com.skyform.service.channelService
											.channelSubmit(
													channel,
													function onSuccess(data) {

														var _tradeId = data.tradeId;
														var disCountFee = data.fee;

														com.skyform.service.BillService
																.confirmTradeSubmit(
																		disCountFee,
																		_tradeId,
																		createModal,
																		function onSuccess(
																				data) {
																			$.growlUI(Dict.val("common_tip"),
																							Dict.val("eip_create_internet_successful_please_wait"));
																			$("#createEipModal").modal("hide");
																			// refresh
																			eip.updateDataTable();
																		},
																		function onError(msg) {
																			$.growlUI(Dict.val("common_tip"),Dict.val("eip_create_internet_successful_failed_charge"));
																			$("#createEipModal").modal("hide");
																		});

													}, function onError(msg) {
														$.growlUI(Dict.val("common_tip"),
																Dict.val("common_create_filing_failure")
																		+ msg);
														$("#createEipModal").modal("hide");
													});
								}
							});
		} else {
			Dcp.biz.apiRequest("/trade/createEip", params, function(data) {
				// 订单提交成功后校验用户余额是否不足
				if (data.code == "0") {
					var _tradeId = data.tradeId ? data.tradeId
							: data.data.tradeId;
					var _fee = $("#feeInput").html();

					com.skyform.service.BillService.confirmTradeSubmit(_fee,
							_tradeId, createModal, function onSuccess(data) {
								$.growlUI(Dict.val("common_tip"),
										Dict.val("eip_create_internet_successful_please_wait"));
								$("#createEipModal").modal("hide");
								// refresh
								eip.updateDataTable();
							}, function onError(msg) {
								$.growlUI(Dict.val("common_tip"),
										Dict.val("eip_create_internet_successful_failed_charge"));
								$("#createEipModal").modal("hide");
							});
				} else {
					$.growlUI(Dict.val("common_tip"), Dict.val("common_create_filing_failure") + data.msg);
					$("#createEipModal").modal("hide");
				}

			}, function onError(msg) {
				$.growlUI(Dict.val("common_tip"), Dict.val("common_create_filing_failure") + msg);
			});
		}

		// Dcp.biz.apiRequest("/instance/eip/createEip", params, function(data)
		// {
		// if (data.code == "0") {
		// $.growlUI(Dict.val("common_tip"), "创建互联网接入请求成功，请等待...");
		// $("#createEipModal").modal("hide");
		// // refresh
		// eip.updateDataTable();
		// } else {
		// $.growlUI(Dict.val("common_tip"), "创建互联网接入请求失败：" + data.msg);
		// }
		// });

		// }
		// },function (errorMsg){
		// //console.log(errorMsg);
		// });
	},
	// 修改公网IP名称和描述 createUserId??????
	modifyEip : function(id, name, comment) {
		var params = {
			"id" : id,
			"instanceName" : name,
			"comment" : comment,
			"modOrLarge" : 1
		};
		eip.saveInstanceName(params)
		var scoreReg = /^[\u4E00-\u9FA0A-Za-z\-0-9\_]+$/;
		if (name != "") {
			if (!scoreReg.exec(name)) {
				$("#tipModifyInsName").text(Dict.val("common_ch_en_num"));
				return;
				// $("#createInsName").focus();
			} else {
				$("#tipModifyInsName").text("");
			}
		}
		// var param = {"instanceName":name,"instanceCode":"ip"};
		var ids = $("#eipTable tbody input[type='checkbox']:checked");
		if (ids.length == 1) {
			var oldInstanceName = eip.getCheckedArr().parents("tr").find(
					"td[name='instanceName']").html();
			if (oldInstanceName != name) {// 名称有改变,需要校验重名
				com.skyform.service.PortalInstanceService.checkDuplcatedName(
						name, "ip", function(duplcate) {
							if (!duplcate) {
								$("#tipModifyInsName").text(Dict.val("common_name_used_re_enter"));
							} else
								eip.saveInstanceName(params);
						}, function(errorMsg) {
							// console.log(errorMsg);
						});
			} else
				eip.saveInstanceName(params);
		}
		// console.log(""+duplcate);
	},
	saveInstanceName : function(params) {
		Dcp.biz.apiRequest("/instance/eip/modifyEipAttributes", params,
				function(data) {
					if (data.code == "0") {
						$.growlUI(Dict.val("common_tip"), Dict.val("eip_modify_internet_successful"));
						$("#modifyEipModal").modal("hide");
						// refresh
						eip.updateDataTable();
					} else {
						$.growlUI(Dict.val("common_tip"), Dict.val("eip_modify_internet_error")
								+ data.msg);
					}
				});
	},
	// 公网IP改变带宽
	modifyEipStorageSize : function(id, ipId, storageSize) {
		// 只有当选中一个公网IP时修改名称和备注，其他情况友情提示
		// var oldbandWidth =
		// eip.getCheckedArr().parents("tr").attr("BAND_WIDTH");

		var oldbandWidth = eip.getCheckedArr().parents("tr").attr("BAND_WIDTH");
		var muprty = {
			"bandwidth" : Number(storageSize)
		};
		if (Number(storageSize) <= oldbandWidth) {
			$("#errorMMM").addClass("icon-exclamation-sign text-error");
			$("#errorMMM").empty().html('"&nbsp;'+Dict.val("eip_higher_than_the_current")+'"');
			// $("#compEmailMsg").addClass("onError").html("请选择高于当前的带宽，否则不能变更！");
			return;
		}
		// console.log(typeof storageSize);
		com.skyform.service.PortalInstanceService.modprodprty("bandwidth",
				ipId, muprty, function(data) {
					// 订单提交成功后校验用户余额是否不足
					var _tradeId = data[0].tradeId;
					var _fee = data[0].feeValue / 1000;
					var _modal = $("#modifyEipStorageSizeModal");
					com.skyform.service.BillService.confirmTradeSubmit(_fee,
							_tradeId, _modal, function onSuccess(data) {
								$.growlUI(Dict.val("common_tip"), Dict.val("eip_changing_bandwidth_please_wait"));
								// $("#createModal").modal("hide");
								$("#modifyEipStorageSizeModal").modal("hide");
								// refresh
								eip.updateDataTable();
							}, function onError(msg) {
								$.growlUI(Dict.val("common_tip"), Dict.val("eip_changing_bandwidth_successful_failed_charge"));
								// $("#createModal").modal("hide");
								$("#modifyEipStorageSizeModal").modal("hide");
							});
				}, function(msg) {
					$.growlUI(Dict.val("common_tip"), Dict.val("eip_internet_changing_bandwidth_error")+msg);
				});

		// var params = {
		// "id" : ipId,
		// // "hostIds":ipId,
		// "BAND_WIDTH" : storageSize,
		// "modOrLarge" : 2
		// };
		//
		// Dcp.biz.apiRequest("/instance/eip/modifyEipAttributes", params,
		// function(data) {
		// if (data.code == "0") {
		// $.growlUI(Dict.val("common_tip"), "正在改变带宽容量，请等待...");
		// $("#modifyEipStorageSizeModal").modal("hide");
		// // refresh
		// eip.updateDataTable();
		// } else {
		// $.growlUI(Dict.val("common_tip"), "互联网接入改变带宽发生错误：" + data.msg);
		// }
		// });
	},
	getInstancesToAttach : function(id, ownUserId) {
		// "targetOrAttached" : 1,
		// "partOrAll" : 2
		var types = [];
		types.push(1);
		// types.push(3); 暂时只有虚拟机
		// types.push(10);
		// 1 虚拟机 3 X86物理机(没有用) 10 物理机
		var typesToAttach = types.join(",");
		var params = {
			"id" : id,
			"ownUserId" : ownUserId,
			"typesToAttach" : typesToAttach,
			"states" : "changing,running,closed"// InstanceStateEnum，已退订和过期的不能挂载
		};
		Dcp.biz
				.apiAsyncRequest(
						"/instance/eip/describeRelatedVm",
						params,
						function(data) {
							if (data.code != "0") {
								$.growlUI(Dict.val("common_tip"),
										Dict.val("eip_user_purchased_running_state_error") + data.msg);
							} else {
								if (data.data.length == 0) {
									$("#hostsTable").html(Dict.val("eip_current_no_host"));
									$("#btn_saveRelation").attr("disabled",
											true);
									return;
								} else {
									$("#hostsTable").html("");
									$("#btn_saveRelation").attr("disabled",
											false);
									if (null != eip.hostDatatable) {
										eip.hostDatatable.updateData(data.data);
									} else {
										eip.hostDatatable = new com.skyform.component.DataTable();
										eip.attachDataTable(data.data, id);
									}
								}
							}
						});
	},
	getInstancesToAttach_route : function(id, ownUserId) {
		// "targetOrAttached" : 1,
		// "partOrAll" : 2

		var types = [];
		types.push(16);
		var typesToAttach = types.join(",");
		var params = {
			"id" : id,
			"ownUserId" : ownUserId,
			"typesToAttach" : typesToAttach,
			"states" : "running"
		};
		Dcp.biz
				.apiAsyncRequest(
						"/instance/eip/describeRelatedInstances",
						params,
						function(data) {
							
//							console.log(data.data);
//							var obj = jQuery.parseJSON(data.data);
//							 //obj=data.data;
//							$.each(obj,function(i,item){
//								console.log(item);
//							});
							if (data.code != "0") {
								$.growlUI(Dict.val("common_tip"),
										Dict.val("eip_user_purchased_running_state_error") + data.msg);
							} else {
								if (typeof (data.data) == "string") {
									var dataJson = $.parseJSON(data.data);
								} else
									var dataJson = data.data;
								
//								if(eip.defultPool=="bdzhcs" || eip.defultPool=="neimengguhuanbaoyun"|| eip.defultPool=="shandongzaozhuang"){
                                if(eip.flagPool){
								var dedRow=eip.getCheckedArr().parents("tr").attr("dedlineid");
									
									//console.log(dataJson);
									var arrData=[];
									$.each(dataJson,function(i,item){
										if($("#pool").val() == 'neimengguhuanbaoyun'){
											arrData.push(item);
										}else{
											if(item.dedLineId==dedRow){
												arrData.push(item);
											}
										}
									});
									dataJson=arrData;
								};	
								
								//console.log(dataJson);
								if (dataJson.length == 0) {
									$("#routesTable").html(Dict.val("eip_cuttent_no_router"));
									$("#btn_saveroute").attr("disabled", true);
									return;
								} else {
									$("#routesTable").html("");
									$("#btn_saveroute").attr("disabled", false);
									if (null != eip.routeDatatable) {

										eip.routeDatatable.updateData(dataJson);
									} else {
										eip.routeDatatable = new com.skyform.component.DataTable();
										eip.attachDataTable_route(dataJson, id);
									}
								}
							}
						});
	},
	getInstancesToAttach_lb : function(id, ownUserId) {
		// "targetOrAttached" : 1,
		// "partOrAll" : 2

		var types = [];
		types.push(1);
		types.push(3);
		types.push(10);
		var typesToAttach = types.join(",");
		var params = {
			"id" : id,
			"ownUserId" : ownUserId,
			"typesToAttach" : typesToAttach,
			"states" : "running"
		};
		Dcp.biz
				.apiRequest(
						"/instance/eip/describeRelatedInstances",
						params,
						function(data) {
							if (data.code != "0") {
								$.growlUI(Dict.val("common_tip"),
										Dict.val("eip_user_purchased_running_state_error") + data.msg);
							} else {

								if (null != eip.loadbalanceDatatable) {
									eip.loadbalanceDatatable
											.updateData(data.data);
								} else {
									eip.loadbalanceDatatable = new com.skyform.component.DataTable();
									eip.attachDataTable_lb(data.data, id);
								}
							}
						});
	},
	attachDataTable : function(data, eipId) {
		/*
		 * var array = data; if (array) { var html = "<option value='-1'>请选择主机</option>";
		 * 
		 * for (var i = 0; i < array.length; i++) { var obj = array[i]; html += "<option
		 * value='" +obj.id + "'>" + obj.instanceName + "</option>"; }
		 * $("#hostSelecter").html(html); }
		 */

		// {title : "<input type='checkbox' id='checkAll_attach'>", name :
		// "id"},
		// {title : "ID", name : "id"},
		eip.hostDatatable
				.renderByData(
						"#hostsTable",
						{
							"data" : data,
							"pageSize" : 5,
							"bInfo" : false,
							"bFilter" : true,
							"aoColumnDefs" : [ {
								"bSortable" : false,
								"aTargets" : [ 0 ]
							} ],// 第一列不排序
							"columnDefs" : [ {
								title : Dict.val("common_select"),
								name : "vmInstanceInfoId",
								attrs : [ {
									name : 'width',
									value : '5px'
								} ]
							}, {
								title : Dict.val("common_name"),
								name : "vmInstanceInfoName",
								attrs : [ {
									name : 'width',
									value : '200px'
								} ]
							} ],
							"onColumnRender" : function(columnIndex,
									columnMetaData, columnData) {
								var text = columnData['' + columnMetaData.name]
										|| "";
								if (columnIndex == 0) {
									text = "<div align='center'><input type='radio' name='instance' value='"
											+ columnData['vmInstanceInfoId']
											+ "'/></div>";
									// text = '<input type="checkbox"
									// value="'+text+'">';
								}

								return text;
							},
							"afterRowRender" : function(rowIndex, data, tr) {
								// 1、申请装载；2：已经装载；3：申请卸载；4：已经卸载；5：正在处理中；6：装载失败；7：卸载失败
								// int[] arr = {1,2,3,5,7};
								if (data.state == 2 || data.state == 7) {
									tr.find(".switch input[type='checkbox']")
											.attr("checked", true);
								} else if (data.state == 1 || data.state == 3
										|| data.state == 5) {
									tr.find(".switch").attr("class", "").html(
											Dict.val("common_processing"));
								} else if (data.state == 4 || data.state == 6
										|| data.state == 0) {
									tr.find(".switch input[type='checkbox']")
											.attr("checked", false);
								}
								tr.find(".switch").bootstrapSwitch();

								tr
										.find(".switch")
										.on(
												'switch-change',
												function(e, _data) {
													var checked = tr
															.find(
																	".switch input[type='checkbox']")
															.attr("checked");
													if (checked) {
														eip
																.attachEip(
																		eipId,
																		data.vmInstanceInfoId);
													} else {
														eip
																.detachEip(
																		eipId,
																		data.vmInstanceInfoId);
													}
													tr.find(".switch").attr(
															"class", "").html(
																	Dict.val("common_processing"));
												});
								tr.find(".switch input[type='checkbox']").bind(
										'click', function(e) {
											alert(1);
										});
							}
						});
	},
	attachDataTable_route : function(data, eipId) {
		// {title : "<input type='checkbox' id='checkAll_attach'>", name :
		// "id"},
		// {title : "ID", name : "id"},routesTable
		eip.routeDatatable
				.renderByData(
						"#routesTable",
						{
							"data" : data,
							"pageSize" : 5,
							"bInfo" : false,
							"bFilter" : true,
							"aoColumnDefs" : [ {
								"bSortable" : false,
								"aTargets" : [ 0 ]
							} ],// 第一列不排序
							"columnDefs" : [ {
								title : Dict.val("common_select"),
								name : "vmInstanceInfoId",
								attrs : [ {
									name : 'width',
									value : '5px'
								} ]
							}, {
								title : Dict.val("common_name"),
								name : "vmInstanceInfoName",
								attrs : [ {
									name : 'width',
									value : '200px'
								} ]
							} ],
							"onColumnRender" : function(columnIndex,
									columnMetaData, columnData) {
								var text = columnData['' + columnMetaData.name]
										|| "";
								if (columnIndex == 0) {
									text = "<div align='center'><input type='radio' name='instance' value='"
											+ columnData['vmInstanceInfoId']
											+ "'/></div>";
									// text = '<input type="checkbox"
									// value="'+text+'">';
								}

								return text;
							},
							"afterRowRender" : function(rowIndex, data, tr) {
								// 1、申请装载；2：已经装载；3：申请卸载；4：已经卸载；5：正在处理中；6：装载失败；7：卸载失败
								// int[] arr = {1,2,3,5,7};

							}
						});
	},
	attachDataTable_lb : function(data, eipId) {
		// {title : "<input type='checkbox' id='checkAll_attach'>", name :
		// "id"},
		// {title : "ID", name : "id"},
		eip.loadbalanceDatatable
				.renderByData(
						"#loadbalancesTable",
						{
							"data" : data,
							"columnDefs" : [ {
								title : "",
								name : "vmInstanceInfoId"
							}, {
								title : Dict.val("common_name"),
								name : "vmInstanceInfoName"
							} ],
							"onColumnRender" : function(columnIndex,
									columnMetaData, columnData) {
								var text = columnData['' + columnMetaData.name]
										|| "";
								if (columnIndex == 0) {
									text = "<div class='switch switch-small' ><input type='checkbox'/></div>";
									// text = '<input type="checkbox"
									// value="'+text+'">';
								}

								return text;
							},
							"afterRowRender" : function(rowIndex, data, tr) {
								// 1、申请装载；2：已经装载；3：申请卸载；4：已经卸载；5：正在处理中；6：装载失败；7：卸载失败
								// int[] arr = {1,2,3,5,7};
								if (data.state == 2 || data.state == 7) {
									tr.find(".switch input[type='checkbox']")
											.attr("checked", true);
								} else if (data.state == 1 || data.state == 3
										|| data.state == 5) {
									tr.find(".switch").attr("class", "").html(
											Dict.val("common_processing"));
								} else if (data.state == 4 || data.state == 6
										|| data.state == 0) {
									tr.find(".switch input[type='checkbox']")
											.attr("checked", false);
								}
								tr.find(".switch").bootstrapSwitch();

								tr
										.find(".switch")
										.on(
												'switch-change',
												function(e, _data) {
													var checked = tr
															.find(
																	".switch input[type='checkbox']")
															.attr("checked");
													if (checked) {
														eip
																.attachEip(
																		eipId,
																		data.vmInstanceInfoId);
													} else {
														eip
																.detachEip(
																		eipId,
																		data.vmInstanceInfoId);
													}
													tr.find(".switch").attr(
															"class", "").html(
																	Dict.val("common_processing"));
												});
								tr.find(".switch input[type='checkbox']").bind(
										'click', function(e) {

										});
							}
						});
	},

	enableColumnHideAndShow : function(position) {
		// this.customColumnBtnPosition = position || "left";
		// if(this.columnShowOrHideCtrlDlg != null) return;
		// _addColumnShowOrHidenSwitchBtn(this,position);
		var content = $("<table class='table'></table>");
		var ths = $(this.container).find("th");
		for ( var i = 0; i < this.columnDefs.length; i++) {
			var columnDef = this.columnDefs[i];
			if (columnDef.contentVisiable == 'always')
				continue;
			if (columnDef.contentVisiable == 'hide') {
				content
						.append("<tr><td>"
								+ columnDef.title
								+ "</td><td><div class='switch switch-small' columnIndex='"
								+ i
								+ "'><input type='checkbox'/></div></td></tr>");
			} else {
				content
						.append("<tr><td>"
								+ columnDef.title
								+ "</td><td><div class='switch switch-small' columnIndex='"
								+ i
								+ "'><input type='checkbox' checked /></div></td></tr>");
			}
		}
		var self = this;
		var switchInited = false;
		this.columnShowOrHideCtrlDlg = new com.skyform.component.Modal(
				new Date().getTime() + Math.random(),
				this.defaultOptions.oLanguage.column.showOrHide,
				content.get(0).outerHTML, {
					afterShow : function(modal) {
						if (switchInited)
							return;
						var switches = $(modal).find(".modal-body .switch")
								.bootstrapSwitch();
						switches.on('switch-change', function(e, data) {
							var columnIndex = $(this).attr("columnIndex");
							var visable = data.value;
							self.hideOrShowColumn(columnIndex, visable);
						});
						switchInited = true;
					}
				});
		return this.columnShowOrHideCtrlDlg;
	},

	// 挂载公网IP
	// TODO 根据登录的用户为createUserId赋值，此处写死1115
	attachEip : function(id, hostIds) {
		var params = {
			"id" : id,
			"hostIds" : hostIds
		// "createUserId" : 1115
		};
		Dcp.biz.apiRequest("/instance/eip/attachVm", params, function(data) {
			if (data.code == "0") {
				$.growlUI(Dict.val("common_tip"), Dict.val("eip_binding_internet_please_wait"));
				// $("#attachModal").modal("hide");
				// refresh
				eip.updateDataTable();
			} else {
				$.growlUI(Dict.val("common_tip"), Dict.val("eip_bind_internet_error") + data.msg);
			}
		});
	},
	// 刷新Table
	updateDataTable : function() {
		if (eip.datatable)
			eip.datatable.container
					.find("tbody")
					.html(
							"<tr ><td colspan='7' style='text-align:center;'><img src='"
									+ CONTEXT_PATH
									+ "/images/loader.gif'/><strong>"+Dict.val("common_retrieving_data_please_wait")+"</strong></td></tr>");
		Dcp.biz.apiRequest("/instance/eip/describeEipServices", null, function(
				data) {
			if (data.code == 0) {
				eip.instances = data.data;
				eip.datatable.updateData(data.data);
				
//				if(eip.defultPool!="bdzhcs" && eip.defultPool!="neimengguhuanbaoyun"&& eip.defultPool!="shandongzaozhuang"){
				if(!eip.flagPool){
				$("#eipTable").dataTable().fnSetColumnVis(6, false);
				};	
				
				eip.onInstanceSelected();
				// var firstInstanceId = $("#eipTable").find("td:eq(1)").text();
				// eip.getRelateHosts(firstInstanceId);
				// eip.getOptLog(firstInstanceId);
			}
		});
	},
	getCheckedArr : function() {
		return $("#eipTable tbody input[type='checkbox']:checked");
	},
	// 根据选中的虚拟硬盘的选择状态判断是否将修改选项置为灰色
	showOrHideOpt : function() {
		
		var checkboxArr = $("#eipTable tbody input[type='checkbox']:checked");
		if (checkboxArr.length == 0) {
			$("#btn_delete").attr("disabled", true);
			// $("#moreAction").removeClass("disabled");
		} else {
			$("#btn_delete").attr("disabled", false);
		}
		if (checkboxArr.length == 1) {
			$("#btn_modifyEip").attr("disabled", false);
			$("#btn_larger").attr("disabled", false);
			
			
			// $("#btn_attach").attr("disabled",false);
			// $("#btn_attach_route").attr("disabled",false);
			$("#btn_detach").attr("disabled", false);
		} else {
			$("#btn_modifyEip").attr("disabled", true);
			$("#btn_larger").attr("disabled", true);
			// $("#btn_attach").attr("disabled",true);
			// $("#btn_attach_route").attr("disabled",true);
			$("#btn_detach").attr("disabled", true);
		}
	},
	// 获取所属用户列表
	getOwnUserList : function() {
		Dcp.biz.apiRequest("/user/describeUsers", null, function(data) {
			if (data.code != "0") {
				$.growlUI(Dict.val("common_tip"), Dict.val("common_query_user_errors") + data.msg);
			} else {
				userListData = data.data;
				$(userListData).each(
						function(index, item) {
							var userOption = "<option value=" + item.id + ">"
									+ item.account + "</option>";
							$("#ownUserList").append(userOption);
						});
			}
		});
	},
	// 获取所属用户account所组成的数组
	getOwnUserAccountArr : function(ownUserList) {
		var ownUserAccountArr = [];
		$(ownUserList).each(function(index, item) {
			ownUserAccountArr.push(item.account);
		});
		return ownUserAccountArr;
	},
	setOwnUser : function() {
		$("#user_name").val($("#ownUserList option:selected").text());
	},
	// 根据所选择的的用户account获取对应的用户id
	getOwnUserIdByAccount : function(ownUserAccount) {
		var ownUserId = "";
		$(userListData).each(function(index, item) {
			if (item.account == ownUserAccount) {
				ownUserId = item.id;
				return;
			}
		});
		return ownUserId;
	},
	changeUserByAccount : function(ownUserAccount) {
		// var ownUserId = "";
		$(userListData).each(function(index, item) {
			if (item.account == ownUserAccount) {
				$("#ownUserList").val(item.id);
				// ownUserId = item.id;

				// return;
			}
		});
		// return ownUserId;
	},
	/*
	 * getInstancesToDetach : function(eipId){ var params = {
	 * "diskInstanceInfoId" : eipId, "state" : 2 };
	 * Dcp.biz.apiRequest("/instance/eip/describeIris", params, function(data) {
	 * if (data.code != "0") { $.growlUI(Dict.val("common_tip"),
	 * "查询用户已经购买的运行状态的资源发生错误：" + data.msg); } else { if(null !=
	 * eip.hostDatatable_detach){
	 * eip.hostDatatable_detach.updateData(data.data); } else {
	 * eip.hostDatatable_detach = new com.skyform.component.DataTable();
	 * eip.detachDataTable(data.data); } } }); },
	 */
	detachDataTable : function(data) {
		eip.hostDatatable_detach.renderByData("#eipUnloadTable",
				{
					"data" : data,
					"columnDefs" : [ {
						title : "<input type='checkbox' id='checkAll_detach'>",
						name : "vmInstanceInfoId"
					}, {
						title : "ID",
						name : "vmInstanceInfoId"
					}, {
						title : Dict.val("common_name"),
						name : "vmInstanceInfoName"
					} ],
					"onColumnRender" : function(columnIndex, columnMetaData,
							columnData) {
						var text = columnData[''
								+ columnMetaData.vmInstanceInfoName]
								|| "";
						if (columnIndex == 0) {
							text = '<input type="checkbox" value="' + text
									+ '">';
						}
						return text;
					}
				});
	},
	// 解绑公网IP
	detachEip : function(eipId, hostIds) {
		// var checkedArr = $("#eipUnloadTable tbody
		// input[type='checkbox']:checked");
		// var volumeNames = "";
		// var volumeIds = [];
		// $(checkedArr).each(function(index, item) {
		// var tr = $(item).parents("tr");
		// volumeNames += $($("td", tr)[2]).text();
		// var id = $("input[type='checkbox']", $("td", tr)[0]).val();
		// volumeIds.push(id);
		// if (index < checkedArr.length - 1) {
		// volumeNames += ",";
		// }
		// });

		// var _hostIds = volumeIds.join(",");
		// var ids = $("#ebsTable tbody input[type='checkbox']:checked");
		var params = {
			"id" : eipId,
			"hostIds" : hostIds
		};
		Dcp.biz.apiRequest("/instance/eip/detachEip", params, function(data) {
			if (data.code == "0") {
				$.growlUI(Dict.val("common_tip"), Dict.val("eip_unbundling_internet_please_wait"));
				// $("#ebsUnload").modal("hide");
			} else {
				$.growlUI(Dict.val("common_tip"), Dict.val("eip_unbundling_internet_error") + data.msg);
			}
		});
	},
	getRelateHosts : function(eipId) {
		$("#relateHosts").html("");
		// var params = {
		// "additionalInstanceId" : eipId,
		// "state" : 2
		// };
		if (!eipId) {
			return;
		}
		com.skyform.service.vmService
				.listRelatedInstances(
						eipId,
						function(data) {
							var array = data;
							if (array == null || array.length == 0) {
								return;
							} else {
								$("#relateHosts").empty();
								// <li class="detail-item"><span>关联存储</span>
								// <a>Vdisk#0001</a></li>
								// var dom = "<tbody>";
								var dom = "";
								$(array)
										.each(
												function(i) {
													dom += "<li class=\"detail-item\">"
															+ "<span>"
															+ eip
																	.switchType(array[i].templateType)
															+ "</span>&nbsp;&nbsp;&nbsp;&nbsp;"
															+ "<span>"
															+ array[i].instanceName
															+ "</span>&nbsp;&nbsp;&nbsp;&nbsp;"
															+ "<span>"
															+ array[i].id
															+ "</span>"
															+ "</li>";
												});
								// dom += "</tbody>";
								$("#relateHosts").append(dom);
							}
						});
	},

	getOptLog : function(eipId) {
		$("#opt_logs").empty();
		if (!eipId) {
			return;
		}
		com.skyform.service.LogService.describeLogsUIInfo(eipId);
		// com.skyform.service.LogService.describeLogsInfo(eipId,
		// function onSuccess(logs) {
		// $("#opt_logs").empty();
		// $(logs).each(
		// function(i, v) {
		// var desc = "";
		// if(v.description){
		// if(v.description != ""){
		// desc = "("+v.description+")";
		// }
		// }
		// var _name = "";
		// if(v.subscription_name){
		// _name = v.subscription_name;
		// }
		// $(
		// "<li class='detail-item'><span>"
		// + v.createTime + " "
		// + v.subscription_name + " "
		// + v.controle + desc + "</span></li>")
		// .appendTo($("#opt_logs"));
		// });
		// }, function onError(msg) {
		// // $.growlUI("提示", "查询弹性块存储日志发生错误：" + msg);
		// });
	},

	switchType : function(type) {
		switch (type) {
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
		case 14:
			return "Paas";
		case 16:
			return "route";
		case 17:
			return Dict.val("vm_private_network");
		default:
			return Dict.val("common_unknown");
		}
	},
	handleLi : function(index) {
		if (index == 0) {
			/*
			 * //只有当选中一个公网IP时修改名称和备注，其他情况友情提示 var ids = $("#eipTable tbody
			 * input[type='checkbox']:checked"); if(ids.length == 1){ var
			 * oldInstanceName =
			 * eip.getCheckedArr().parents("tr").find("td:eq(2)").html(); var
			 * oldComment = eip.getCheckedArr().parents("tr").attr("comment");
			 * $("#modInsName").val(oldInstanceName);
			 * $("#modComment").val(oldComment);
			 * $("#modifyEipModal").modal("show"); } else {
			 * $.growlUI(Dict.val("common_tip"), "修改只能对一个公网IP进行操作，请重新进行选择！"); }
			 */
		} else if (index == 1) {
			/*
			 * var ids = $("#eipTable tbody input[type='checkbox']:checked");
			 * if(ids.length == 1){ var _state =
			 * eip.getCheckedArr().parents("tr").attr("state"); if(_state ==
			 * 'running'){ var ownUserId =
			 * eip.getCheckedArr().parents("tr").attr("ownUserId");
			 * //显示用户可以挂载的资源
			 * eip.getInstancesToAttach($(ids[0]).val(),ownUserId);
			 * $("#attachModal").modal("show");
			 * 
			 * }else{ $.growlUI(Dict.val("common_tip"),
			 * "分配到主机只能对就绪状态的公网IP进行操作，请重新进行选择！"); } }else {
			 * $.growlUI(Dict.val("common_tip"), "分配到主机只能对一个公网IP进行操作，请重新进行选择！"); }
			 */
		} else if (index == 2) {
			/*
			 * var ids = $("#eipTable tbody input[type='checkbox']:checked");
			 * if(ids.length == 1){ var _state =
			 * eip.getCheckedArr().parents("tr").attr("state"); if(_state ==
			 * 'running'){ var ownUserId =
			 * eip.getCheckedArr().parents("tr").attr("ownUserId");
			 * //显示用户可以挂载的资源
			 * eip.getInstancesToAttach_route($(ids[0]).val(),ownUserId);
			 * $("#attachModal_route").modal("show");
			 * 
			 * }else{ $.growlUI(Dict.val("common_tip"),
			 * "分配到路由只能对就绪状态的公网IP进行操作，请重新进行选择！"); } }else {
			 * $.growlUI(Dict.val("common_tip"), "分配到路由只能对一个公网IP进行操作，请重新进行选择！"); }
			 */
		} else if (index == 3) { // 分配到负载均衡器
			/*
			 * var ids = $("#eipTable tbody input[type='checkbox']:checked");
			 * if(ids.length == 1){ var _state =
			 * eip.getCheckedArr().parents("tr").attr("state"); if(_state ==
			 * 'running'){ var ownUserId =
			 * eip.getCheckedArr().parents("tr").attr("ownUserId");
			 * //显示用户可以挂载的资源
			 * eip.getInstancesToAttach_lb($(ids[0]).val(),ownUserId);
			 * $("#attachModal_lb").modal("show"); }else{
			 * $.growlUI(Dict.val("common_tip"),
			 * "分配到负载均衡器只能对就绪状态的公网IP进行操作，请重新进行选择！"); } }else {
			 * $.growlUI(Dict.val("common_tip"),
			 * "分配到负载均衡器只能对一个公网IP进行操作，请重新进行选择！"); }
			 */
		} else if (index == 4) {
			/*
			 * //只有当选中一个公网IP时修改名称和备注，其他情况友情提示 var ids = $("#eipTable tbody
			 * input[type='checkbox']:checked"); if(ids.length == 1){ var state =
			 * eip.getCheckedArr().parents("tr").find("td:eq(3)").html(); var
			 * size = eip.getCheckedArr().parents("tr").find("td:eq(4)").html();
			 * if(state == '就绪'){ //设置原来的old值 eip.initExpandSlider(size);
			 * $("#amount1").val(size);
			 * 
			 * $("#modifyEipStorageSizeModal").modal("show"); }else{
			 * $.growlUI(Dict.val("common_tip"), "改变带宽只能对就绪的公网IP进行操作，请重新进行选择！"); } }
			 * else { $.growlUI(Dict.val("common_tip"),
			 * "改变带宽只能对一个公网IP进行操作，请重新进行选择！"); }
			 */
		} else if (index == 5) {
			/*
			 * if(eip.beforeDelete()){ var checkedArr = eip.getCheckedArr(); var
			 * volumeNames = ""; var volumeIds = [];
			 * $(checkedArr).each(function(index, item) { var tr =
			 * $(item).parents("tr"); var id = $("input[type='checkbox']",
			 * $("td", tr)[0]).val(); volumeNames += $($("td", tr)[2]).text();
			 * volumeIds.push(id); if (index < checkedArr.length - 1) {
			 * volumeNames += ","; } }); var eipIds = volumeIds.join(",");
			 * eip.destroyDisk(eipIds); }
			 */
		} else if (index == 6) {
			/*
			 * var ids = $("#eipTable tbody input[type='checkbox']:checked");
			 * if(ids.length == 1){ var _state =
			 * eip.getCheckedArr().parents("tr").attr("state"); if(_state ==
			 * 'running'){ eip.detachIp(); }else{
			 * $.growlUI(Dict.val("common_tip"), "解绑只能对就绪状态的公网IP进行操作，请重新进行选择！"); }
			 * }else { $.growlUI(Dict.val("common_tip"),
			 * "解绑只能对一个公网IP进行操作，请重新进行选择！"); }
			 */
		}

	},
	initExpandSlider : function(size) {
		$("#slider-modify-amount").slider({
			range : "min",
			value : parseInt(size),
			min : parseInt(size),
			// product.min,
			max : product.max,
			step : product.step,
			slide : function(event, ui) {
				$("#modifyAmount").val(ui.value);
				// var sp = $("#amount01").val();
				calcChange();
			}
		});
		$("#modifyAmount").val($("#slider-modify-amount").slider("value"));
		$("#modifyAmount").bind(
				"keydown",
				function(e) {
					if (e.which == 13) { // 获取Enter键值
						e.preventDefault(); // 阻止表单按Enter键默认行为，防止按回车键提交表单

						var realValue1 = parseInt($("#modifyAmount").val());
						$("#slider-modify-amount").slider("option", "value",
								realValue1);
						var max = parseInt($("#slider-modify-amount").slider(
								"option", "max"));
						if (realValue1 > max) {
							realValue1 = max;
						}
						$("#modifyAmount").val(realValue1);
					}
				});
		initsliderButton("modifyAmount", "slider-modify-amount", product.max,
				parseInt(size), product.step);
		/*
		 * $("#amount1").bind("blur",function(e){ e.preventDefault(); //
		 * 阻止表单按Enter键默认行为，防止按回车键提交表单 var realValue1 =
		 * parseInt(parseInt($("#amount1").val())/10) * 10 ; $(
		 * "#slider-range-min1" ).slider( "option", "value", realValue1);
		 * $("#amount1").val(realValue1); });
		 */

	},
	beforeDelete : function() {
		var checkedArr = eip.getCheckedArr();
		var volumeNames = "";
		var volumeIds = [];
		var _reuslt = true;
		$(checkedArr).each(
				function(index, item) {
					var tr = $(item).parents("tr");
					var id = $("input[type='checkbox']", $("td", tr)[0]).val();
					var state = $(tr).attr("state");
					// if(state != 'running'){
					// $.growlUI(Dict.val("common_tip"), "id为"+id+"的互联网接入不是就绪状态,
					// 删除只能对就绪状态的互联网接入进行操作，请重新进行选择！");
					// _reuslt = false;
					// }
					if (eip.isEipAttached(id)) {
						$.growlUI(Dict.val("common_tip"), "id"+Dict.val("common_wei")+"" + id + Dict.val("eip_bundling_host_please_select"));
						_reuslt = false;
					}
				});
		return _reuslt;
	},
	isEipAttached : function(id) {
		// TODO 删除之前判断是否挂载了vm?????????????????????????? "state" : 2 已经解绑状态的可以删除
		// 正在挂载的eip也不允许删除
		var params = {
			"diskInstanceInfoId" : id,
			"statesStr" : "1,2,3,5,6,7"
		};
		var result = false;
		Dcp.biz.apiRequest("/instance/eip/queryIpResource", params, function(
				data) {
			if (data.code != "0") {
				$.growlUI(Dict.val("common_tip"), Dict.val("eip_user_purchased_related_resource_error")
						+ data.msg);
			} else {
				var array = data.data;
				if (array == null || array.length == 0) {

				} else {
					result = true;
				}
			}
		});
		return result;
	},
	destroyIP : function(eipIds) {
		var confirmModal = new com.skyform.component.Modal(
				new Date().getTime(),
				Dict.val("eip_destruction_internet"),
				"<h4>"+Dict.val("eip_do_you_want_destroy_internet")+"</h4>",
				{
					buttons : [
							{
								name : Dict.val("common_determine"),
								onClick : function() {
									// 删除公网IP
									var params = {
										"ids" : eipIds
									};
									Dcp.biz
											.apiRequest(
													"/instance/eip/deleteEip",
													params,
													function(data) {
														if (data.code == 0) {
															$
																	.growlUI(
																			Dict.val("common_tip"),
																			Dict.val("eip_destroy_internet_please_wait"));
															confirmModal.hide();
															// refresh
															eip
																	.updateDataTable();
														} else {
															$
																	.growlUI(
																			Dict.val("common_tip"),
																			Dict.val("eip_destroy_internet_error")
																					+ data.msg);
														}
													});
								},
								attrs : [ {
									name : 'class',
									value : 'btn btn-primary'
								} ]
							}, {
								name : Dict.val("common_cancel"),
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
	detachIp : function(eipIds) {
		var ids = $("#eipTable tbody input[type='checkbox']:checked");
		var hostIds = eip.getCheckedArr().parents("tr").attr("hostIds");
		var confirmModal = new com.skyform.component.Modal(
				new Date().getTime(),
				Dict.val("eip_unbundling_internet"),
				"<h4>"+Dict.val("eip_do_you_want_unbundling_internet")+"</h4>",
				{
					buttons : [
							{
								name : Dict.val("common_determine"),
								onClick : function() {
									// // 删除公网IP
									var params = {
										"id" : ids[0].value,
										"hostIds" : hostIds
									};
									Dcp.biz
											.apiRequest(
													"/instance/eip/detachEip",
													params,
													function(data) {
														if (data.code == 0) {
															$
																	.growlUI(
																			Dict.val("common_tip"),
																			Dict.val("eip_unbundling_internet_please_wait"));
															confirmModal.hide();
															// refresh
															eip
																	.updateDataTable();
														} else {
															$
																	.growlUI(
																			Dict.val("common_tip"),
																			Dict.val("eip_unbundling_internet_error")
																					+ data.msg);
														}
													});
								},
								attrs : [ {
									name : 'class',
									value : 'btn btn-primary'
								} ]
							}, {
								name : Dict.val("common_cancel"),
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

	getStoreTypeText : function(text) {
		switch (text) {
		case "1":
			return Dict.val("common_shared");
		case "0":
			return Dict.val("common_exclusive");
		default:
			return "";
		}
	},
	// 按钮和更多操作 的action
	_moreOpAction : function() {
		$("#toolbar4tb2 .btn").unbind("click").click(function() {
			if ($(this).hasClass("disabled"))
				return;
			var action = $(this).attr("action");
			eip._invokeAction(action);
		});

		$(".operation").unbind("click").click(function() {
			if ($(this).hasClass("disabled"))
				return;
			var action = $(this).attr("action");
			eip._invokeAction(action);
		});
	},
	// 更多操作 的 invoke
	_invokeAction : function(action) {
		var invoker = eip["" + action];
		if (invoker && typeof invoker == 'function') {
			invoker();
		}
	},
	// 修改公网IP名称
	modifyName : function() {
		$("#tipModifyInsName").empty();
		// 只有当选中一个公网IP时修改名称和备注
		var ids = $("#eipTable tbody input[type='checkbox']:checked");
		if (ids.length == 1) {
			var oldInstanceName = $(eip.getCheckedArr().parents("tr")).find(
					"td[name='instanceName']").text();
			var oldComment = eip.getCheckedArr().parents("tr").attr("comment");
			$("#modInsName").val(oldInstanceName);
			// $("#modComment").val(oldComment);
			$("#modifyEipModal").modal("show");
			$("#modifyEipModal").on("show", function() {
				$("#tipModifyInsName").empty();
			});
		} else {
			$.growlUI(Dict.val("common_tip"), Dict.val("eip_modify_only_operate_internet_please_reselect"));
		}
	},

	getFee : function() {
		if (CommonEnum.offLineBill)
			return;
		var period = eip.createPeriodInput.getValue();
		// 如果是年，period * 12
		if (3 == $("#billType .selected").attr("data-value")) {
			period = period * 12;
		}
		;

		var param = {
			"verifyFlag" : "0",
			"period" : period,
			"productPropertyList" : [ {
				"muProperty" : "BAND_WIDTH",
				"muPropertyValue" : $("#amount").val(),
				"productId" : product.productId
			} ]
		}
		Dcp.biz.apiAsyncRequest("/pm/queryCaculateFeeByPrtyList", param,
				function(data) {
					if (null != data && 0 == data.code) {
						var count = eip.createCountInput.getValue()
						var fee = data.data.fee;
						$("#feeInput").html(count * fee / feeUnit);
					}
				});
                $("#demo").find("span[name$='Msg']").html("");
	},
	getFee4change : function() {
		if (CommonEnum.offLineBill)
			return;
		// var period = eip.createPeriodInput.getValue();
		// // 如果是年，period * 12
		// if (3 == $("#billType .selected").attr("data-value")) {
		// period = period * 12;
		// };
		// var period = eip.getCheckedArr().parents("tr").attr("period");
		var productId = 0;
		if (eip.selectedProductId) {
			productId = Number(VM.selectedProductId);

		} else
			productId = eip.getCheckedArr().parents("tr").attr("productId");

		var param = {
			"period" : 1,
			"productPropertyList" : [ {
				"muProperty" : "BAND_WIDTH",
				"muPropertyValue" : $("#modifyAmount").val(),
				"productId" : parseInt(productId)
			} ]
		}
		Dcp.biz.apiAsyncRequest("/pm/queryCaculateFeeByPrtyList", param,
				function(data) {
					if (null != data && 0 == data.code) {
						// var count = eip.createCountInput.getValue();
						var count = 1;
						var fee = data.data.fee;
						$(".price4change").html(count * fee / feeUnit);
					}
				});
	},
	createIp : function() {
		// 定义一个slider能够选择公网IP的带宽大小

//		if(eip.defultPool=="bdzhcs" || eip.defultPool=="neimengguhuanbaoyun"|| eip.defultPool=="shandongzaozhuang"){
        if(eip.flagPool){
		if(eip.areaZoneId==null){
				$.growlUI("请增加配额");
				return false;
			}
			$("#dedicatedDiv").show();
		com.skyform.service.EipService.queryAllDedLineList({"uuid":eip.areaZoneId},function(data){
//			data =[
//					{
//						"desc": "专线一",
//						"dedLineId": "1001"
//						        },
//						        {
//						"desc": "专线二",
//						"dedLineId": "1002"
//						        },
//						        {
//						"desc": "专线三",
//						"dedLineId": "1003"
//						        }
//			       ];
			//eip.tempdata=data;
			$("#dedicatedLine").empty();
			//console.log(eip.tempdata);
			$(data).each(function(i,item){
				//com.skyform.service.EipService.
				$("#dedicatedLine").append($("<option value='"+item.id+"'>"+item.displayName+"</option>"))
				//console.log(item.ip1);
			});
			
		})
		};
		
		$("#slider-range-min").slider( {
			range : "min",
			value : product.min,
			min : product.min,
			max : product.max,
			step : product.step,
			slide : function(event, ui) {
				// var sp = $("#amount01").val();
				$("#amount").val(ui.value);
				calc();
			}
		});
		$("#amount").bind(
				"change",
				function() {
					$("#slider-range-min").slider("option", "value",
							$("#amount").val());
				});
		initsliderButton("amount", "slider-range-min", product.max,
				product.min, product.step);
		$("#amount").val($("#slider-range-min").slider("value"));
		// 带+-的输入框
		eip.createCountInput = null;
		if (eip.createCountInput == null) {
			var container = $("#createCount").empty();
			// com.skyform.service.Eip.queryEnoughIP(function(enough){
			eip.enough = 5;
			// com.skyform.service.QuotaService.getQuotaByType("ip",function(quota){
			var max = 1// eip.quota;
			// quota和enough比较，取小值限定
			// if(eip.enough >= (quota-eip.instances.length)){
			// max = quota - eip.instances.length
			// }
			// else max = eip.enough;
			eip.createCountInput = new com.skyform.component.RangeInputField(
					container, {
						min : 1,
						defaultValue : 1,
						max : max,
						textStyle : "width:137px"
					}).render();
			eip.createCountInput.reset();
			// },function (errorMsg){
			// //console.log(errorMsg);
			// });

			// });
			// eip.createCountInput.showErrorMsg = function(msg) {};
			// eip.createCountInput.hideErrorMsg = function() {};
		}

		// 带+-的输入框
		eip.createPeriodInput = null;
		if (eip.createPeriodInput == null) {
			var container = $("#period").empty();
			var max = 12;
			eip.createPeriodInput = new com.skyform.component.RangeInputField(
					container, {
						min : 1,
						defaultValue : 1,
						max : max,
						textStyle : "width:137px"
					}).render();
			eip.createPeriodInput.reset();

		}
		// 初始计费值
		eip.getFee();

		$(".subFee").bind('mouseup keyup', function() {
			setTimeout('eip.getFee()', 100);
		});
	        //清空优惠码
		$("#agentDemo").attr("style","display:none");
		$("#agentDemo").find("span[name$='Msg']").html("");

		$("#createEipModal form")[0].reset();
		$("#slider-range-min").slider("option", "value", 1);

		$("#amount").val(1);
		$("#slider-ip-min").slider("option", "value", 1);
		$("#amount-ip").val(1);

		// $("#tipOwnUserAccount").text("");
		// $("#tipOwnUserId").text("");

		$("#createEipModal").modal("show");
		$("#createEipModal").on("show", function() {
			$(".error").empty();
			$("#tipCreateCount").text("");
			// $("#amount").text("");
			$("#tipCreateInsName").empty();
		});
//		$("#createEipModal").on("shown", function() {
//			$("#dedicatedLine").empty();
//			console.log(eip.tempdata);
//			$(eip.tempdata).each(function(i,item){
//				$("#dedicatedLine").append($("<option value='"+item.ip1+"'>"+item.ip1+"</option>"))
//				console.log(item.ip1);
//			});
//			});
	},
	
	// 改变带宽 按钮事件
	modifyBandWidth : function() {
		$("#errorMMM").empty();
		var ids = $("#eipTable tbody input[type='checkbox']:checked");
		var oldbandWidth = eip.getCheckedArr().parents("tr").attr("BAND_WIDTH");
		if (ids.length == 1) {
			var state = eip.getCheckedArr().parents("tr").find(
					"td[name='state']").html();
			// var size = eip.getCheckedArr().parents("tr").find(
			// "td[name='BAND_WIDTH']").html();
			// if(state == '就绪'){
			// 设置原来的old值
			eip.initExpandSlider(oldbandWidth);
			$("#modifyAmount").val(oldbandWidth);

			$("#oldBandWidth").html(oldbandWidth);
			$("#modifyAmount").attr("min", oldbandWidth);
			$("#modifyEipStorageSizeModal").on(
					"show",
					function() {
						$("#errorMMM").removeClass().empty();
						eip.selecteProductId = eip.getCheckedArr()
								.parents("tr").attr("productId");
					});
			eip.getFee4change();
			$("#modifyEipStorageSizeModal").modal("show");

			// }else{
			// $.growlUI(Dict.val("common_tip"),
			// "改变带宽只能对就绪的互联网接入进行操作，请重新进行选择！");
			// }
		} else {
			$.growlUI(Dict.val("common_tip"), Dict.val("eip_modify_bandwidth_only_operate_internet_please_reselect"));
		}
	},
	// 解绑事件
	unbundling : function() {
		var ids = $("#eipTable tbody input[type='checkbox']:checked");
		var _state = eip.getCheckedArr().parents("tr").attr("state");
		if (ids.length == 1) {
			if (_state == 'using') {
				eip.detachIp();
			} else {
				$.growlUI(Dict.val("common_tip"),
						Dict.val("eip_unbundling_only_mounted_operate_internet_please_reselect"));
			}
		} else {
			$.growlUI(Dict.val("common_tip"), Dict.val("eip_unbundling_only_operate_interne_please_reselect"));
		}
	},
	renew : function() {
		var ipId = eip.getCheckedArr().parents("tr").attr("instanceId");
		if (eip.renewModal) {

		} else {
			eip.renewModal = new com.skyform.component.Renew(
					ipId,
					{
						buttons : [
								{
									name : Dict.val("common_determine"),
									onClick : function() {
										var period = eip.renewModal.getPeriod()
												.getValue();
										$("#renewModal").modal("hide");
										var _modal = $("#renewModal");
										com.skyform.service.renewService
												.renew(
														eip
																.getCheckedArr()
																.parents("tr")
																.attr(
																		"instanceId"),
														period,
														function onSuccess(data) {
															// 订单提交成功后校验用户余额是否不足
															var _tradeId = data.tradeId;
															var _fee = $(
																	"#feeInput_renew")
																	.text();
															com.skyform.service.BillService
																	.confirmTradeSubmit(
																			_fee,
																			_tradeId,
																			_modal,
																			function onSuccess(
																					data) {
																				$
																						.growlUI(
																								Dict.val("common_tip"),
																								Dict.val("common_renewal_successful_debit_successful_please_wait"));
																				// refresh
																				eip
																						.updateDataTable();
																			},
																			function onError(
																					msg) {
																				$
																						.growlUI(
																								Dict.val("common_tip"),
																								Dict.val("common_renewal_successful_failed_charge"));
																			});
														},
														function onError(msg) {
															$
																	.growlUI(
																			Dict.val("common_tip"),
																			Dict.val("common_renew_submit_failed")
																					+ msg);
														});
									},
									attrs : [ {
										name : 'class',
										value : 'btn btn-primary'
									} ]
								}, {
									name : Dict.val("common_cancel"),
									attrs : [ {
										name : 'class',
										value : 'btn'
									} ],
									onClick : function() {
										eip.renewModal.hide();
									}
								} ]
					});
		}
		eip.renewModal.getFee_renew(ipId);
		eip.renewModal.show();
		$(".subFee_renew").bind('mouseup keyup', function() {
			setTimeout('eip.renewModal.getFee_renew(' + ipId + ')', 100);
		});
	},
	// 删除带宽
	deleteBandWidth : function() {
		// if(eip.beforeDelete()){
		var checkedArr = eip.getCheckedArr();
		var volumeNames = "";
		var volumeIds = [];
		$(checkedArr).each(function(index, item) {
			var tr = $(item).parents("tr");
			var id = $("input[type='checkbox']", $("td", tr)[0]).val();
			volumeNames += $($("td", tr)[2]).text();
			volumeIds.push(id);
			if (index < checkedArr.length - 1) {
				volumeNames += ",";
			}
		});
		var eipIds = volumeIds.join(",");
		eip.destroyIP(eipIds);
		// }
	},
	// 分配到主机
	allocationToVM : function() {
		var ids = $("#eipTable tbody input[type='checkbox']:checked");
		var _state = eip.getCheckedArr().parents("tr").attr("state");
		if (ids.length == 1) {
			if (_state == 'running') {
				var ownUserId = eip.getCheckedArr().parents("tr").attr(
						"ownUserId");
				// 显示用户可以挂载的资源
				$("#attachModal").on("shown", function() {
					eip.getInstancesToAttach($(ids[0]).val(), ownUserId);
				});
				$("#attachModal").modal("show");

			} else {
				$.growlUI(Dict.val("common_tip"),
						Dict.val("eip_assigned_only_ready_operate_please_reselect"));
			}
		} else {
			$.growlUI(Dict.val("common_tip"), Dict.val("eip_assigned_only_operate_interne_please_reselect"));
		}
	},
	// 分配到路由器
	allocationToRouter : function() {
		var ids = $("#eipTable tbody input[type='checkbox']:checked");
		var _state = eip.getCheckedArr().parents("tr").attr("state");
		if (ids.length == 1) {
			if (_state == 'running') {
				var ownUserId = eip.getCheckedArr().parents("tr").attr(
						"ownUserId");
				// 显示用户可以挂载的资源
				$("#attachModal_route").on("shown", function() {
					eip.getInstancesToAttach_route($(ids[0]).val(), ownUserId);
				});

				$("#attachModal_route").modal("show");

			} else {
				$.growlUI(Dict.val("common_tip"),
						Dict.val("eip_assigned_router_only_ready_operate_please_reselect"));
			}
		} else {
			$.growlUI(Dict.val("common_tip"), Dict.val("eip_assigned_router_only_operate_interne_please_reselect"));
		}
	},
	// 分配到负载均衡
	allocationToLB : function() {
		var ids = $("#eipTable tbody input[type='checkbox']:checked");
		if (ids.length == 1) {
			var _state = eip.getCheckedArr().parents("tr").attr("state");
			if (_state == 'running') {
				var ownUserId = eip.getCheckedArr().parents("tr").attr(
						"ownUserId");
				// 显示用户可以挂载的资源
				eip.getInstancesToAttach_lb($(ids[0]).val(), ownUserId);
				$("#attachModal_lb").modal("show");
			} else {
				$.growlUI(Dict.val("common_tip"),Dict.val("eip_assigned_lb_only_ready_operate_please_reselect"));
			}
		} else {
			$.growlUI(Dict.val("common_tip"),Dict.val("eip_assigned_lb_only_operate_interne_please_reselect"));
		}
	},
	onInstanceSelected : function(selectInstance) {
		var allCheckedBox = $("#eipTable tbody input[type='checkbox']:checked");

		var rightClicked = selectInstance ? true : false;

		var state = $(allCheckedBox[0]).parents("tr").attr("state");
		if (selectInstance) {
			state = selectInstance.state;
		}

		var oneSelected = allCheckedBox.length == 1;
		var hasSelected = allCheckedBox.length > 0;

		$(".operation").addClass("disabled");

		$(".operation").each(function(index, operation) {
			var condition = $(operation).attr("condition");
			var action = $(operation).attr("action");
			var enabled = true;
			eval("enabled=(" + condition + ")");
			
			
			if (enabled) {
				$(operation).removeClass("disabled");
			} else {
				$(operation).addClass("disabled");
			}
//			if(eip.recoveryandhangedflag){
//				//不显示
//				if(action=="hangedToIp"||action=="recoveryToIp"||action=="modifyBandWidth"){
//					$(operation).addClass("hide");
//				}
//			}else{
//				//显示
//				$(operation).removeClass("hide");
//			}
			eip._moreOpAction();
		});

		/*
		 * if(rightClicked) { Route.instanceName = selectInstance.instanceName;
		 * Route.selectedInstanceId = selectInstance.id; } else { for ( var i =
		 * 0; i < allCheckedBox.length; i++) { var currentCheckBox =
		 * $(allCheckedBox[i]); if (i == 0) { Route.instanceName =
		 * currentCheckBox.parents("tr").attr("name"); Route.selectedInstanceId =
		 * currentCheckBox.attr("value"); } else { Route.instanceName += "," +
		 * currentCheckBox.parents("tr").attr("name"); Route.selectedInstanceId +=
		 * "," + currentCheckBox.attr("value"); } } }
		 */
	},
	// 保存绑定到主机
	saveRelationInstance : function() {
		var insId = $("#hostsTable input:radio:checked").val();
		// var select = $("#hostSelecter option:selected");
		if (!insId) {
			// var msg = "<div class='alert alert-error' style='margin-top:
			// 40px;margin-bottom:0px;'><button type='button' class='close'
			// data-dismiss='alert'>&times;</button><p>请选择主机！</p></div>";
			// $("#attachModalErrorMsg").attr("display","");
			// $("#attachModalErrorMsg").append(msg);
			$.growlUI(Dict.val("common_tip"), Dict.val("eip_please_select_host"));
			return;
		}
		// 保存
		var ids = $("#eipTable tbody input[type='checkbox']:checked");
		var params = {
			"id" : ids[0].value,
			"hostIds" : insId
		// "createUserId" : 1115
		};
		Dcp.biz.apiRequest("/instance/eip/attachVm", params, function(data) {
			if (data.code == "0") {
				$.growlUI(Dict.val("common_tip"), Dict.val("eip_internet_being_mounted_please_wait"));
				$("#attachModal").modal("hide");
				// refresh
				eip.updateDataTable();
			} else {
				$.growlUI(Dict.val("common_tip"), Dict.val("eip_internet_being_mounted_error") + data.msg);
			}
		});
	},
	// 绑定到路由器
	saveRelationRoute : function() {
		var insId = $("#routesTable input:radio:checked").val();
		if (!insId) {
			$.growlUI(Dict.val("common_tip"), Dict.val("eip_please_router"));
			return;
		}
		var ids = $("#eipTable tbody input[type='checkbox']:checked");
		var params = {
			"id" : ids[0].value,
			"hostIds" : insId
		// "createUserId" : 1115
		};
		Dcp.biz.apiRequest("/instance/eip/attachRoute", params, function(data) {
			if (data.code == "0") {
				$.growlUI(Dict.val("common_tip"), Dict.val("eip_mounted_router"));
				$("#attachModal_route").modal("hide");
				// refresh
				eip.updateDataTable();
			} else {
				$.growlUI(Dict.val("common_tip"), Dict.val("eip_mounted_router_error") + data.msg);
			}
		});
	},
	hangedToIp : function() {// 挂起
		var ids = $("#eipTable tbody input[type='checkbox']:checked");
		var _state = eip.getCheckedArr().parents("tr").attr("state");
		// var _bandwidth=eip.getCheckedArr().parents("tr").attr("BAND_WIDTH");
		if (CommonEnum.offLineBill) {
			ConfirmWindow.setTitle(Dict.val("eip_network_suspended")).setContent("<h4>"+Dict.val("eip_you_sure_you_want_to_suspend_network")+"</h4>").onSave = function() {

				if (_state == 'running') {
					var params = {
						"id" : ids[0].value
					};
					com.skyform.service.EipService.hangedPublicNetWork(params,
							function onSuccess(data) {
								$.growlUI(Dict.val("common_tip"), Dict.val("eip_suspend_completion"));
								eip.updateDataTable();
								
							}, function onError(msg) {
								$.growlUI(Dict.val("common_tip"), Dict.val("eip_suspend_failure"));
							});
				} else {
					$.growlUI(Dict.val("common_tip"),
							Dict.val("eip_ready_only_internet_operate_please_reselect"));
				}

				/*
				 * var param = {}; desktopCloud.service.destroy(param,function
				 * (data){ $.growlUI("租户销毁成功，请等待..."); },function (error){ });
				 */
				ConfirmWindow.hide();
			};
			ConfirmWindow.setWidth(500).autoAlign().setTop(100);
			ConfirmWindow.show();
		} else {
			if (ids.length == 1) {
				if (_state == 'running') {
					var params = {
						"id" : ids[0].value
					};
					com.skyform.service.EipService.hangedPublicNetWork(params,
							function onSuccess(data) {
								$.growlUI(Dict.val("common_tip"), Dict.val("eip_suspend_completion"));
								eip.updateDataTable();

							}, function onError(msg) {
								$.growlUI(Dict.val("common_tip"), Dict.val("eip_suspend_failure"));
							});
				} else {
					$.growlUI(Dict.val("common_tip"),
							Dict.val("eip_ready_only_internet_operate_please_reselect"));
				}
			} else {
				$.growlUI(Dict.val("common_tip"), Dict.val("eip_ready_only_a_internet_operate_please_reselect"));
			}
		}
	},
	recoveryToIp : function() {// 恢复
		
		var ids=$("#eipTable tbody").find("input[type='checkbox']:checked");
		setTimeout("",500);
		
		var idsVal=ids.val();
		var _state = eip.getCheckedArr().parents("tr").attr("state");			
		 var _bandwidth=eip.getCheckedArr().parents("tr").attr("band_width");		 
		if (CommonEnum.offLineBill) {
			if (!eip.ipWidthModal) {
				var _id = new Date().getTime();
				eip.ipWidthModal = new com.skyform.component.Modal(
						"" + _id,
						Dict.val("eip_setting_bandwidth"),
						$("script#ipWith_list").html(),
						{
							buttons : [
									{
										name : Dict.val("common_determine"),

										onClick : function() {
											var _instanceid = eip.getCheckedArr().parents("tr").attr("instanceid");
											var aaTesta = eip.createPeridInput
													.getValue()
													+ "";
											if(aaTesta=="0"){
												$("#quotaMessage").html(Dict.val("eip_enter_greater"));
												return;
											}
											if(eip.usedQuota==0||eip.usedQuota<parseInt(aaTesta)){
												return;
											}
											if (ids.length == 1) {
												if (_state == 'hanged') {
													var params = {
														"id" :_instanceid,
														"bandwidth" : aaTesta
													};
													com.skyform.service.EipService
															.releasePublicNetWork(
																	params,
																	function onSuccess(
																			data) {
																		$
																				.growlUI(
																						Dict
																								.val("common_tip"),
																								Dict.val("eip_recovery_completed"));
																		eip
																				.updateDataTable();
																	},
																	function onError(
																			msg) {
																		$
																				.growlUI(
																						Dict
																								.val("common_tip"),
																								Dict.val("eip_recovery_failure"));
																	});
													
												} else {
													$
															.growlUI(
																	Dict
																			.val("common_tip"),
																			Dict.val("eip_recovery_pending_only_internet_operate_please_reselect"));
												}
											} else {
												$
														.growlUI(
																Dict
																		.val("common_tip"),
																		Dict.val("eip_recovery_only_a_internet_operate_please_reselect"));
											}

											eip.ipWidthModal.hide();
										},
										attrs : [ {
											name : 'class',
											value : 'btn btn-primary'
										} ]
									}, {
										name : Dict.val("common_cancel"),
										attrs : [ {
											name : 'class',
											value : 'btn'
										} ],
										onClick : function() {
											eip.ipWidthModal.hide();
										}
									} ],
							beforeShow : function() {
								$("#quotaMessage").empty();
								eip.createPeridInput = null;
								if (eip.createPeridInput == null) {
									var container = $("#peridWidh").empty();
									var max = 100;
									var az="";
									Dcp.biz
											.getCurrentUser(function(data1) {
												var loginName = data1.account;
												com.skyform.service.resQuotaService
														.queryQuotaAllCount(
																loginName,az,
																function onSuccess(
																		data) {
//																	console
//																			.log(data[0].quotaTotal.bandwidth);
//																	console
//																			.log(data[0].quotaUesed.bandwidth);
																	if(data.length==0){
																		max=0;
																	}else{
																		max = data[0].quotaTotal.bandwidth-data[0].quotaUesed.bandwidth;
																	}
																	eip.usedQuota=max;
																	var defaultVal=1;
																	if(eip.usedQuota<=0){
																		defaultVal=0;
																		$("#quotaMessage").empty().html(Dict.val("eip_current_available_quota")+eip.usedQuota+Dict.val("eip_insufficient_quota_add_or_cancel"));
																		
																	}else{
																		$("#quotaMessage").empty().html(Dict.val("eip_current_maximum_available_quota")+eip.usedQuota+" M ");
																	}
																	eip.createPeridInput = new com.skyform.component.RangeInputField(
																			container,
																			{
																				min : 0,
																				defaultValue : defaultVal,
																				max : max>100?100:max,
																				textStyle : "width:28px"
																			})
																			.render();
																	$("#peridWidh input").attr("maxlength","3");
																	eip.createPeridInput
																			.reset();																	
																}, function(
																		error) {

																});
											});

								}
							}
						});
			}
			eip.ipWidthModal.setWidth(350).autoAlign();
			eip.ipWidthModal.show();

		} else {
			if (ids.length == 1) {
				if (_state == 'hanged') {
					var params = {
						"id" : eip.getCheckedArr().parents("tr").attr("instanceid"),
						"bandwidth" : _bandwidth+""
					};
					com.skyform.service.EipService.releasePublicNetWork(params,
							function onSuccess(data) {
								$.growlUI(Dict.val("common_tip"), Dict.val("eip_recovery_completed"));
								eip.updateDataTable();
							}, function onError(msg) {
								$.growlUI(Dict.val("common_tip"), Dict.val("eip_recovery_failure"));
							});
				} else {
					$.growlUI(Dict.val("common_tip"),
							Dict.val("eip_recovery_pending_only_internet_operate_please_reselect"));
				}
			} else {
				$.growlUI(Dict.val("common_tip"), Dict.val("eip_recovery_only_a_internet_operate_please_reselect"));
			}
		}
	}

};

function calc() {
	// 随着slider的变化 价格部分作出相应的变化
	/*
	 * var buycount = eip.createCountInput.getValue(); var count =
	 * parseInt(buycount),capacity=parseInt($("#amount").val());
	 * $("#span1").html(capacity/100); $("#span2").html(count);
	 * $("#span3").html((count*capacity/100).toFixed(1));
	 * $("#span4").html((count*capacity*7.2).toFixed(1));
	 */
};
function calcChange() {
	/*
	 * var buycount = 1; var count1 =
	 * parseInt(buycount),capacity1=parseInt($("#modifyAmount").val());
	 * $("#span5").html(capacity1/100); $("#span6").html(count1);
	 * $("#span7").html((count1*capacity1/100).toFixed(1));
	 * $("#span8").html((count1*capacity1*7.2).toFixed(1));
	 */
};