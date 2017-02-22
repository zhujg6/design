var desktopmanage = {
	dtTable : null,
	properDtTable:null,
	unbindProperDtTable:null,
	contextMenu : null,
	scope : "deskTop",
	selectedInstanceId : null,
	selectedTenantId : null,
	selectedOsId : null,
	cloudType : {
		"01" : "专有桌面",
		"02" : "随机桌面"
	},
	renewModal : null,
	feeParams : {},
	billType_ : "",
	instanceName : null,
	data : [],
	//data2 : [],
	//data3 : [],
	//data4 : [],
	dtTable2 : null,
	getFeeParams : null,
	newFormModal : null,
	createDesktopCloudData : null,
	//accIdList : [],
	privateNetName : [],
	getLogIdFlag : true,
	firstDataId : null,
	clickflag : false,
	selecedUserNumber : 1,
	currentNetId : null,
	typeParams : {},
	currentChecked:null,
	// newStatus:null,
	init : function() {
		desktopmanage.refreshData();
		//desktopmanage.getTenantInfo();
		$('#refreshDt').unbind().bind('click', function() {
			desktopmanage.refreshData();
		});
	    $("#searchManager").unbind().bind('click', function() {
			desktopmanage.refreshData();
		});
		$('#createInstance').bind('click', function() {
			desktopmanage.newInstance();
		});
		if (CommonEnum.offLineBill) {
			desktopmanage.typeParams = {
				"serviceType" : 1015,
				"billType" : 5
			};
		} else {
			desktopmanage.typeParams = {
				"serviceType" : 1015,
				"billType" : 0
			};
		}
	},

	// /////////////////////////////////////////////////////////////////////////
	// Actions start
	// /////////////////////////////////////////////////////////////////////////
	/*getTenantInfo : function() {
		var params2 = {
			"serviceFactory" : ""
		};
		// 需要给入参
		// desktopmanage.getTenantInfoByArea(params2);
		com.skyform.service.desktopCloudService.unListTenant(params2, function(
						data) {

					desktopmanage.data4 = data;

				}, function(data) {

				});
	},*/
	/*getTenantInfoByArea : function(params) {
		var firsttrchecked = true;
		com.skyform.service.desktopCloudService.unListTenant(params, function(
						data) {
					desktopmanage.data3 = data;
					desktopmanage.data2 = desktopmanage.data3;
					if (desktopmanage.dtTable2) {
						desktopmanage.dtTable2.updateData(desktopmanage.data2);
					}
				}, function(data) {

				});
	},*/
	refreshData : function() {
		$(".operation").addClass("disabled");
		if (desktopmanage.dtTable)
			desktopmanage.dtTable.container
					.find("tbody")
					.html("<tr ><td colspan='9' style='text-align:center;'><img src='"
							+ CONTEXT_PATH
							+ "/images/loader.gif'/><strong>"
							+ Dict.val("common_retrieving_data_please_wait")
							+ "</strong></td></tr>");
		var params = {
			"serviceFactory" : "citrix",
			"cloudType": "01",
			"userName":"",
			"tenantName":""
		};
		if($("#queryManagerStatus").val()=="2"){
		   params.userName=$("#queryManagerName").val();
		}
		if($("#queryManagerStatus").val()=="1"){
		   params.userId=$("#queryManagerName").val();
		}
		com.skyform.service.desktopCloudService.queryNewCloudTab(params,
				function(data) {
					desktopmanage._refreshDataTable(data);
					desktopmanage.data = data;
					if (!desktopmanage.data || desktopmanage.data.length < 1)
						return;
					/*if (desktopmanage.data.length > 0) {
						desktopmanage.showDetails(desktopmanage.data[0].id);
					};*/
				}, function(msg) {
					if (!msg) {
						msg = Dict.val("common_unknown_error");
					}
					$.growlUI(Dict.val("common_error") + ":" + msg);
				});
	},
	_refreshDataTable : function(data) {
		if (desktopmanage.dtTable) {
			desktopmanage.dtTable.updateData(data);
		} else {
			desktopmanage.dtTable = new com.skyform.component.DataTable();
			desktopmanage.dtTable.renderByData(
					"#desktop_manager_instanceTable", {
						pageSize : 5,
						data : data,
						onColumnRender : function(columnIndex, columnMetaData,
								columnData) {
							if (columnMetaData.name == "id") {
								return "<input type='radio' name='managerId' value='"
										+ columnData["id"] + "' subscriptionId='"+columnData["subscriptionId"]+"'/>";
							} else if (columnMetaData.name == 'cloudType') {
								return desktopmanage.cloudType[columnData['cloudType']];
							}
							else if (columnMetaData.name == 'expireDate') {
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
							} else if (columnMetaData.name == 'cfgInfo') {
								var osDesc = "";
								if (columnData['desc']) {
									osDesc = columnData['desc'];
								}
								var text = osDesc + "(" + columnData['cpu']
										+ "vcpu " + columnData['memory'] + "G "
										+ columnData['storageSize'] + "G)";
								return text;

							} else if (columnMetaData.name == 'status') {
								return com.skyform.service.StateService
										.getState("",
												columnData['subServiceStatus']);
							}

							else if (columnMetaData.name == 'createTime') {
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

							}else {
		                        return columnData[columnMetaData.name];
		                    }
						},
						afterRowRender : function(rowIndex, data, tr) {
							tr.attr("instanceId", data.id);
							tr.attr("instanceState", data.subServiceStatus);

							tr.attr("instanceDesc", data.desc);
							tr.attr("instanceTenantId", data.tenantId);
							tr.find("input[type='radio']").unbind("click").bind("click",function(){
							   desktopmanage.currentChecked=$(this).attr("subscriptionId");
							   desktopmanage.onInstanceSelected();
							});
						/*	tr.unbind("click").click(function() {
								var instanceid = $(this).attr("instanceId");
								desktopmanage.showDetails(instanceid);
									// console.log(instanceid);
								});*/
						},
						afterTableRender : desktopmanage._afterDataTableRender
					});

			desktopmanage.dtTable.addToobarButton($("#toolbar4deskTop"));
			// desktopCloud.dtTable.enableColumnHideAndShow("right");
		}
		$("#desktop_manager_instanceTable_filter").addClass("hide");
	},
	_afterDataTableRender : function() {
		desktopmanage.onInstanceSelected();
		/*$("#desktop_manager_instanceTable input[type='radio']").each(function(key,value){
   	         if(desktopmanage.currentChecked==$(value).val()){
   	         	$(this).attr("checked", true);
   	         	$(this).click();
   	         }
   	    });*/
		// desktopmanage.showDetails(desktopmanage.firstDataId);
		if (!desktopmanage.contextMenu) {
			desktopmanage.contextMenu = new ContextMenu({
						container : "#contextMenudeskTop",
						beforeShow : function(tr) {
							$("#desktop_manager_instanceTable input[type='radio']")
									.attr("checked", false);
							tr.find("input[type='radio']").attr("checked",
									true);
						},
						afterShow : function(tr) {
							desktopmanage.onInstanceSelected({
										id : tr.attr("instanceId"),
										state : tr.attr("instanceState"),
										osId : tr.attr("instanceOsId"),
										desc : tr.attr("instanceDesc"),
										tenantId : tr.attr("instanceTenantId")
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
		//desktopmanage.showDetails();
	},
	onInstanceSelected : function(selectInstance) {// 单选一个触发的操作
		var allCheckedBox = $("#desktop_manager_instanceTable tbody input[type='radio']:checked");
		var rightClicked = selectInstance ? true : false;
		var state = $(allCheckedBox[0]).parents("tr").attr("instanceState");
		var tenantId = $(allCheckedBox[0]).parents("tr")
				.attr("instanceTenantId");
		desktopmanage.selectedTenantId = tenantId;
		if (selectInstance) {
			state = selectInstance.state;
		}
		var oneSelected = allCheckedBox.length == 1;
		var hasSelected = allCheckedBox.length > 0;
		$("div[scope='" + desktopmanage.scope + "'] .operation")
				.addClass("disabled");
		$("div[scope='" + desktopmanage.scope + "'] .operation").each(
				function(index, operation) {
					var condition = $(operation).attr("condition");
					var action = $(operation).attr("action");
					var enabled = true;
					eval("enabled=(" + condition + ")");
					if (enabled) {
						$(operation).removeClass("disabled");
					} else {
						$(operation).addClass("disabled");
					}
					desktopmanage._bindAction();
				});
		if (rightClicked) {
			desktopmanage.selectedInstanceId = selectInstance.id;
			desktopmanage.selectedTenantId = selectInstance.tenantId;
		} else {
			for (var i = 0; i < allCheckedBox.length; i++) {
				var currentCheckBox = $(allCheckedBox[i]);
				if (i == 0) {
					desktopmanage.selectedInstanceId = currentCheckBox
							.attr("value");
				} else {
					desktopmanage.selectedInstanceId += ","
							+ currentCheckBox.attr("value");
				}
			}
		}
	},
	_bindAction : function() {
		$("div[scope='" + desktopmanage.scope
				+ "'] #toolbar4deskTop .actionBtn").unbind("click").click(
				function() {
					if ($(this).hasClass("disabled"))
						return;
					var action = $(this).attr("action");
					desktopmanage._invokeAction(action);
				});
	},

	_invokeAction : function(action) {
		var invoker = desktopmanage["" + action];
		if (invoker && typeof invoker == 'function') {
			invoker();
		}
	},
	// 重启
	restartup : function() {
		ConfirmWindow.setTitle(Dict.val("dc_restart_desktop_cloud"))
				.setContent("<h4>" + Dict.val("dc_do_you_restart_dektop_cloud")
						+ "</h4>").onSave = function() {
			var destTopId = desktopmanage.selectedInstanceId;
			com.skyform.service.desktopCloudService.restartCloudTab(destTopId,
					function(data) {
						$.growlUI(Dict.val("common_success_operation"));
						ConfirmWindow.hide();
						desktopmanage.refreshData();
					}, function(error) {
						ErrorMgr.showError(error);

					});
			ConfirmWindow.hide();
		};
		ConfirmWindow.show();
	},
	// 销毁
	destroydown : function() {
		ConfirmWindow.setTitle(Dict.val("dc_destory_desktop_cloud")).setContent("<h4>"
						+ Dict.val("dc_do_you_destory_desktop_cloud") + "</h4>").onSave = function() {
			var subsId = desktopmanage.selectedInstanceId;
			var params={
				"subsId":subsId
			}
			com.skyform.service.desktopCloudService.deleteCitrixCloudTab(params,
					function(data) {
						$.growlUI(Dict.val("common_success_operation"));
						ConfirmWindow.hide();
						desktopmanage.refreshData();
					}, function(error) {
						ErrorMgr.showError(error);
					});
			ConfirmWindow.hide();
		};
		ConfirmWindow.show();
	},
	
	// 重发邀请邮件
	retransMail : function() {
		ConfirmWindow.setTitle(Dict.val("dc_resend_invitation_email"))
				.setContent("<h4>"
						+ Dict.val("dc_do_you_resend_inviation_email")
						+ "</h4>").onSave = function() {
			var destTopId = desktopmanage.selectedTenantId;
			com.skyform.service.desktopCloudService.resendEmailCloudTab(
					destTopId, function(data) {
						$.growlUI(Dict.val("common_success_operation"));
						ConfirmWindow.hide();
						desktopmanage.refreshData();
					}, function(error) {
						ErrorMgr.showError(error);
					});
			ConfirmWindow.hide();
		};
		ConfirmWindow.show();
	},
	renew : function() {

		if (desktopmanage.renewModal) {

		} else {

			desktopmanage.renewModal = new com.skyform.component.Renew(
					desktopmanage.selectedInstanceId, {
						buttons : [{
							name : Dict.val("common_determine"),
							onClick : function() {
								var period = desktopmanage.renewModal
										.getPeriod().getValue();
								$("#renewModal").modal("hide");
								var _modal = $("#renewModal");
								// com.skyform.service.renewService.renew(desktopmanage.selectedInstanceId,period,function
								// onSuccess(data){
								com.skyform.service.desktopCloudService
										.deskRenew(
												desktopmanage.selectedInstanceId,
												period,
												function onSuccess(data) {

													// 订单提交成功后校验用户余额是否不足
													var _tradeId = data.tradeId;
													var _fee = $("#feeInput_renew")
															.text();
													com.skyform.service.desktopCloudService
															.deskConfirmTradeSubmit(
																	_fee,
																	_tradeId,
																	_modal,
																	function onSuccess(data) {
																		$.growlUI(Dict.val("common_tip"),Dict.val("dc_renew_submit_success"));
																		desktopmanage.refreshData();
																	},
																	function onError(msg) {
																		$.growlUI(Dict.val("common_tip"),Dict.val("dc_renew_failed"));
																	});

													// $.growlUI(Dict.val("common_tip"),
													// "续订申请成功");
												}, function onError(msg) {
													$.growlUI(Dict.val("common_tip"),Dict.val("dc_renew_application_failed")+ msg);
												});
							},
							/*
							 * afterShow : function(container){
							 * 
							 * desktopmanage.renewModal.getPeriod().setValue(1); },
							 */
							attrs : [{
										name : 'class',
										value : 'btn btn-primary'
									}]
						}, {
							name : Dict.val("common_cancel"),
							attrs : [{
										name : 'class',
										value : 'btn'
									}],
							onClick : function() {
								desktopmanage.renewModal.hide();
							}
						}]
					});
		}
		// desktopmanage.renewModal.getFee_renew(desktopmanage.selectedInstanceId);
		desktopmanage.renewModal
				.hhht_getFee_renew(desktopmanage.selectedInstanceId);
		desktopmanage.renewModal.show();
		$(".subFee_renew").bind('mouseup keyup', function() {
			setTimeout('desktopmanage.renewModal.hhht_getFee_renew('
							+ desktopmanage.selectedInstanceId + ')', 100);
		});
	},
	newInstance : function() {
		$("#_image").empty();
		$("#_areaNameVal").empty();
		$("#_configInfo").empty();
		$("#_dataSize").empty();
		$("#_orderNumber").empty();
		$("#orderTimeUnitLong").empty();
		$("#selectQuotaFalg").empty();

		$("#_orderTime").empty().html("1");
		/*if (desktopmanage.data4 == "") {
			$.growlUI(Dict.val("common_tip"), Dict
							.val("dc_no_desktop_user_information_unbound"));
			return;
		}*/
		var currdesktopResPool = null;
		var billTypeVal = 0;
		var queryFeeParams = new Object();
		queryFeeParams.period = 1;
		// queryFeeParams.productPropertyList=new Array();
		//
		queryFeeParams.verifyFlag = "0";
		queryFeeParams.productPropertyList = [];
		var productDetailParams = {
			"muProperty" : "",
			"muPropertyValue" : "1"

		}
		// {"period":1,"productPropertyList":[{"muProperty":"cpuNum","muPropertyValue":"1","productId":101},{"muProperty"
		// :"memorySize","muPropertyValue":"4","productId":101},{"muProperty":"OS","muPropertyValue":"1","productId"
		// :101}],"verifyFlag":"0"}
		var desktopParamsAll = new Object();
		desktopParamsAll.period = 1;
		desktopParamsAll.count = 0;
		desktopParamsAll.productList = [];
		var desktopParams = new Object();

		// desktopParams.productId=1025;
		desktopParams.cloudType="01";
		desktopParams.resPool = "";
		desktopParams.osDisk = "";
		desktopParams.OS = "";
		desktopParams.cpuNum = "";
		desktopParams.memorySize = "";
		desktopParams.storageSize = "";
		// desktopParams.BAND_WIDTH="0";
		//desktopParams.CloudTabUsers = [];
		var m = 0;

		if (!desktopmanage.newFormModal) {
			desktopmanage.newFormModal = new com.skyform.component.Modal(
					"newDesktopCloudForm2", "<h3>"
							+ Dict.val("dc_create_cloud_desktop") + "</h3>",
					$("script#new_desktopCloud_form2").html(), {
						buttons : [{
							name : Dict.val("common_determine"),
							onClick : function() {
								//desktopParams.CloudTabUsers = desktopmanage.accIdList;
								if (Number($("#orderTimeLong").val()) == 0) {
									$("#orderTimeUnitLong").empty().html(Dict.val("dc_please_enter_purchase_long"));
									return;
								}
								if (Number($("#orderTimeLong").val()) <= 12
										&& Number($("#orderTimeLong").val()) >= 0) {
								} else {
									return;
								}
								
								var p = /^[1-9](\d+(\.\d{1,2})?)?$/;
								if (!p.test($("#orderNumber").val().trim())) {
									$("#orderNumberSpan").empty().html("请输入大于0的数字");
									return;
								}
								var msgLength=$(".onError").length;
								if(msgLength>0){
									return;
								}
								    
								desktopParamsAll.productList.length = 0;
								desktopParamsAll.count=parseInt($("#orderNumber").val().trim());
								desktopParams.storageSize = "";
								desktopParams.BAND_WIDTH = "";
								desktopParamsAll.productList.push(desktopParams);

								desktopmanage._save(desktopParamsAll);
							},
							attrs : [{
										name : 'class',
										value : 'btn btn-primary'
									}]
						}, {
							name : Dict.val("common_cancel"),
							onClick : function() {
								desktopmanage.newFormModal.hide();
							},
							attrs : [{
										name : 'class',
										value : 'btn'
									}]
						}],
						beforeShow : function(container) {
							//desktopmanage.accIdList = [];
							var portalType = Dcp.biz.getCurrentPortalType();
							if (!CommonEnum.offLineBill) {										        		
								$("#billType").html('<a class="div_block subFee active ty" href="javascript:;" name="billType1" value="0">'
												+ Dict.val("common_monthly")
												+ '</a>'
												+ '<a class="div_block subFee ty" href="javascript:;" name="billType1" value="3">'
												+ Dict.val("common_monthly")
												+ '</a>');
							} else {
								$("#configFeeDiv").remove();
								$("#billType").html('<a class="div_block active ty" href="javascript:;" name="billType1" value="5">VIP</a>');
							}
							$("#areaNameId").html("");
							$("#_ostemplates").html("");

							com.skyform.service.desktopCloudService.queryDesktopConfigInfo(
											desktopmanage.typeParams, function(data) {
												desktopmanage.createDesktopCloudData = data;
												desktopParams.productId = parseInt(data.resoucepool[0].productId);
												// desktopParams.productId=1025;
												var html = "";
												var flag = true;
												$.each(data.resoucepool,
														function(key, value) {
															if(value.serviceFactroy!="huawei"){
																if (flag) {
																currdesktopResPool = value.name;
																desktopParams.resPool = currdesktopResPool;
																$("#_areaNameVal").html(value.desc);
																flag = false;
															   }
																html += "<option value="
																		+ value.name
																		+ " productId="
																		+ value.productId
																		+ " serviceFactroy="
																		+ value.serviceFactroy
																		+ ">"
																		+ value.desc
																		+ "</option><br\>";
															}
															
														});
												$("#areaNameId").append(html);
												/*var servicefactroy = $('#areaNameId option:selected')
														.attr("servicefactroy");
												// 查询用户信息
												var params2 = {
													"serviceFactory" : servicefactroy
												};
												desktopmanage
														.getTenantInfoByArea(params2);*/
												var oshtml = "";
												var flagos = true;
												$.each(data.oslist, function(key, value) {
													$.each(value.resourcePool,
																	function(osresPoolkey,osresPoolVal) {
																		if (osresPoolVal.name == currdesktopResPool) {
																			if (flagos) {
																				$("#_image").html(value.desc);
																				$("#osDiskSize").html(value.osDisk);
																				desktopParams.osDisk = value.osDisk;
																				desktopParams.OS = value.OS;
																				flagos = false;
																			}
																			oshtml += "<option value='"
																					+ value.OS
																					+ "' name='"
																					+ value.desc
																					+ "' osDisk='"
																					+ value.osDisk
																					+ "'>"
																					+ value.desc
																					+ "</option><br\>";
																		}
																	});
												});
												$("#_ostemplates").append(oshtml);
												$("#config").html("");
												$("#os_config").html("");
												var confightml = "";
												var currVal = null;
												var currmemoryVal = null;
												var cpuVal = null;
												var memoryVal = null;
												var desc = null;
												var isCurrResPoolFlag = false;
												var configflag = true;
												$.each(data.vmConfig, function(
														key, value) {
													$.each(value.config,
															function(key1,value1) {
																$.each(value1.memory,function(
																						key2,
																						value2) {
																					$.each(value2.resourcePool,
																									function(
																											key3,
																											value3) {
																										if (currdesktopResPool == value3.name) {
																											isCurrResPoolFlag = true;
																										}
																									});
																				});
															});
													if (isCurrResPoolFlag) {
														var osConfigHtml = "";
														if ($("#os_config")
																.html() == "") {

															currVal = value.type;
															$.each(value.config,function(key1,value1) {
																				desc = value1.desc;
																				cpuVal = value1.cpuNum;
																				$.each(value1.memory,
																								function(
																										key2,
																										value2) {
																									if (key2 == 0) {
																										memoryVal = value2.memorySize;
																										currmemoryVal = value2.memorySize
																												+ Dict
																														.val("dc_g_ram");
																										osConfigHtml += "<div class='ty active subFee div_block' value='base' memorySize='"
																												+ value2.memorySize
																												+ "'>"
																												+ value1.desc
																												+ " "
																												+ value2.memorySize
																												+ Dict
																														.val("dc_g_ram")
																												+ "</div>"
																									} else {
																										osConfigHtml += "<div class='ty  subFee div_block' value='base' memorySize='"
																												+ value2.memorySize
																												+ "'>"
																												+ value1.desc
																												+ " "
																												+ value2.memorySize
																												+ Dict
																														.val("dc_g_ram")
																												+ "</div>"
																									}
																								});
																				if (key1 == 0) {
																					$("#os_config")
																							.append(osConfigHtml);
																				} else {
																					$("#os_config")
																							.append("<div class='ty  subFee div_block' value='base' >"
																									+ value1.desc
																									+ " "
																									+ value1.cpuNum
																									+ "</div>");
																				}
																			});
															confightml += "<div class='ty active subFee div_block' value='base' name='configval'>"
																	+ value.type
																	+ "</div>";
														} else {
															confightml += "<div class='ty  subFee div_block' value='base' name='configval'>"
																	+ value.type
																	+ "</div>";
														}
														desktopParams.cpuNum = cpuVal;
														desktopParams.memorySize = memoryVal;
														isCurrResPoolFlag = false;
													}
												});
												$("#config").append(confightml);
												$("#_configInfo").html(currVal
														+ " " + desc + " "
														+ currmemoryVal);
												if (configflag) {
													queryFeeParams.productPropertyList.length = 0;
													var cpuParams = {
														"muProperty" : "cpuNum",
														"muPropertyValue" : cpuVal,
														"productId" : desktopParams.productId
													};
													queryFeeParams.productPropertyList
															.push(cpuParams);
													var memoryParams = {
														"muProperty" : "memorySize",
														"muPropertyValue" : memoryVal,
														"productId" : desktopParams.productId
													};
													queryFeeParams.productPropertyList
															.push(memoryParams);

													configflag = false;
												}
												//													    	
												desktopmanage.getFeeParams = queryFeeParams;
											}, function(data) {
											});
							$("#orderNumber").val("1");
							if (!CommonEnum.offLineBill) {
								setTimeout('desktopmanage.getFee()', 5);
							}
						},
						afterShow : function() {
							$(".func-table tr").on('mouseover', function() {

								$(this).find("td:eq(0)").css({
									"background" : "#bbb none repeat scroll 0 0",
									"color" : "black"
								});
							});
							$(".func-table tr").on('mouseout', function() {

								$(this).find("td:eq(0)").css({
									"background" : "#f2f2f2 none repeat scroll 0 0",
									"color" : "#CACACA"
								});
							});

							$(".price").html('0');
							$("#orderTimeLong").val('1');
							//$("#createDataDiskSize").val('20');
							//$("#_dataSize").html('20');
							//$("#dataDisk-range-min").val('20');
							//desktopParams.storageSize = "20";
							//var firsttrchecked = true;
							
							var p = /^[1-9](\d+(\.\d{1,2})?)?$/;

							$("#orderTimeLong").bind("keyup", function() {
								$("#orderTimeUnitLong").empty();
								var tt = $("#orderTimeLong").val().trim();
								if (p.test(tt)) {
									$("#orderTimeUnitLong").empty();
									if (parseInt(tt) > 0 && parseInt(tt) <= 12) {
										$("#orderTimeUnitLong").empty();
									} else {
										$("#orderTimeUnitLong").empty()
												.html("请输入1到12的整数");
										return;
									}
								} else {
									$("#orderTimeUnitLong").empty()
											.html("请输入数字");
								}

								if (billTypeVal == "0" || billTypeVal == "5") {
									billTypeVal = 1;
								} else if (billTypeVal == "3") {
									billTypeVal = 12;
								}
								// $("#orderTimeUnitLong").empty();
								$("#_orderTime")
										.html($("#orderTimeLong").val());
								desktopParamsAll.period = (parseInt($("#orderTimeLong")
										.val()) * billTypeVal);
								desktopmanage.getFeeParams = {};
								desktopmanage.getFeeParams.period = parseInt($("#orderTimeLong")
										.val())
										* billTypeVal;
								queryFeeParams.period = parseInt($("#orderTimeLong")
										.val())
										* billTypeVal;
								// var
								// orderTimeLong={"muProperty":"diskSize","muPropertyValue":parseInt($("#orderTimeLong").val())*billTypeVal,"productId":1019};
								// queryFeeParams.productPropertyList.push(orderTimeLong);
								desktopmanage.getFeeParams = queryFeeParams;
							});
							
							$("#orderNumber").bind("keyup", function() {
								$("#orderNumberSpan").empty();
								var tt = $("#orderNumber").val().trim();
								if (!p.test(tt)) {
									$("#orderNumberSpan").empty().html("请输入大于0的数字");
								}else
								    $("#_orderNumber").html($("#orderNumber").val());

							});
							/*if (desktopmanage.dtTable2) {

								desktopmanage.dtTable2
										.updateData(desktopmanage.data2);
							} else {

								desktopmanage.dtTable2 = new com.skyform.component.DataTable();

								desktopmanage.dtTable2.renderByData(
										"#desktopUser", {
											pageSize : 5,
											data : desktopmanage.data2,
											onColumnRender : function(
													columnIndex,
													columnMetaData, columnData) {

												if (columnMetaData.name == 'ID') {
													return columnData.tenantId;
												} else if (columnMetaData.name == "id") {
													if (firsttrchecked) {
														return "<input type='checkbox' checked='checked' value='"
																+ columnData["tenantId"]
																+ "'/>";
														firsttrchecked = false;
													}
													return "<input type='checkbox' checked='false' value='"
															+ columnData["tenantId"]
															+ "'/>";
												}
												
												 * else
												 * if(columnMetaData.name=="deskName") {
												 * return "<input type='text'
												 * value='" +
												 * columnData["vmName"] +"'/>" ; }
												 
												else {
													return columnData[columnMetaData.name];
												}
											},
											afterRowRender : function(rowIndex,
													data, tr) {
												tr.attr("instanceId",
														data.tenantId);
												tr.attr("instanceName",
														data.UserName);
												if (firsttrchecked) {
													tr.attr("checked",
															"checked");
													// $(this).attr("checked");
													firsttrchecked = false;
												}
												var flag1 = false;
												var thistrId = null;
												var selectdVal = null;
												var inputVal = null;
												var configflag = true;

												tr.find("input[type='checkbox']")
														.click(function() {
															thistrId = $(this)
																	.attr("value");
															selectdVal = $(this)
																	.attr("checked");
														});
												tr.unbind("click").click(
														function() {
															var dataList = desktopmanage.accIdList;
															var keyPostion = null;
															inputVal = $(this)
																	.find("input[type='text']")
																	.val();
															var checkboxVal = $(this)
																	.find("input[type='checkbox']")
																	.attr("value");

															// var
															// data={"id":thistrId,"name":$(this).find("input[type='text']").val()};
															var data = {
																"id" : thistrId
															};

															if (dataList.length > 0) {
																$.each(dataList,function(key,value) {
																if (value.id == thistrId) {keyPostion = key;}
																				});
															}

															if (selectdVal == "checked") {
																if (null == keyPostion) {
																	desktopmanage.clickflag = true;
																	$("#selectQuotaFalg")
																			.empty()
																	dataList
																			.push(data);
																}

															} else {
																var temp = null;
																var index = $.inArray(data,dataList);
																if (null != keyPostion) {
																	dataList.splice(keyPostion,1);
																}
															}
															
															$("#_orderNumber").html(dataList.length);
															desktopmanage.selecedUserNumber = dataList.length;
															desktopmanage.getFeeParams = queryFeeParams;
															if (!CommonEnum.offLineBill) {
																setTimeout('desktopmanage.getFee()',5);
															}

															desktopParamsAll.count = dataList.length;
														});

											},
											afterTableRender : desktopmanage._afterDtTableRender
										});
							}*/
							$("div[name='configval']").unbind("click").bind(
									"click", function() {
										$("div[name='configval']")
												.removeClass("active");
										$(this).addClass("active");
										var currVal = $(this).html();
										var desc = null;
										var osConfigHtml1 = "";
										var currmemoryVal1 = null;
										var currObj = null;
										var datas = desktopmanage.createDesktopCloudData.vmConfig;
										var deskmemorySize = null;
										var cpuNumVal = null;
										$.each(datas, function(key, value) {
											if (currVal == value.type) {
												$.each(value.config, function(
														key1, value1) {
													$("#os_config").html("");
													desc = value1.desc;
													cpuNumVal = value1.cpuNum;
													desktopParams.cpuNum = value1.cpuNum;
													$.each(value1.memory,
															function(key2,
																	value2) {
																if (key2 == 0) {
																	currmemoryVal1 = value2.memorySize
																			+ Dict
																					.val("dc_g_ram");
																	desktopParams.memorySize = value2.memorySize;
																	deskmemorySize = value2.memorySize;
																	osConfigHtml1 += "<div class='ty active subFee div_block' value='base' memorySize='"
																			+ value2.memorySize
																			+ "'>"
																			+ value1.desc
																			+ " "
																			+ value2.memorySize
																			+ Dict
																					.val("dc_g_ram")
																			+ "</div>"
																} else {
																	osConfigHtml1 += "<div class='ty  subFee div_block' value='base' memorySize='"
																			+ value2.memorySize
																			+ "'>"
																			+ value1.desc
																			+ " "
																			+ value2.memorySize
																			+ Dict
																					.val("dc_g_ram")
																			+ "</div>"
																}
															});
													if (key1 == 0) {
														$("#os_config")
																.append(osConfigHtml1);
													} else {
														$("#os_config")
																.append("<div class='ty  subFee div_block' value='base' >"
																		+ value1.desc
																		+ "</div>");
													}

												});
											}
										});
										$("#_configInfo").html(currVal + " "
												+ desc + " " + currmemoryVal1);
										var keyOpt = -1;

										var cpuParams = {
											"muProperty" : "cpuNum",
											"muPropertyValue" : cpuNumVal,
											"productId" : desktopParams.productId
										};
										var cpuFlag = true;
										if (queryFeeParams.productPropertyList.length > 0) {
											$.each(
															queryFeeParams.productPropertyList,
															function(key, value) {
																if (value.muProperty == "cpuNum") {

																	cpuFlag = false;
																	value.muPropertyValue = cpuNumVal;
																}
															});

										} else {

											cpuFlag = false;
											queryFeeParams.productPropertyList
													.push(cpuParams);
										}
										if (cpuFlag) {

											// cpuFlag=false;
											queryFeeParams.productPropertyList
													.push(cpuParams);
										}

										var memoryParams = {
											"muProperty" : "memorySize",
											"muPropertyValue" : deskmemorySize,
											"productId" : desktopParams.productId
										};
										var flagVal = true;
										if (queryFeeParams.productPropertyList.length > 0) {
											$.each(
															queryFeeParams.productPropertyList,
															function(key, value) {
																if (value.muProperty == "memorySize") {
																	flagVal = false;
																	value.muPropertyValue = deskmemorySize;
																}
															});

										} else {
											flagVal = false;
											queryFeeParams.productPropertyList
													.push(memoryParams);
										}
										if (flagVal) {
											queryFeeParams.productPropertyList
													.push(memoryParams);
										}

									});
						;
							$("a[name='billType1']").bind(" click ",
									function() {
										$("a[name='billType1']")
												.removeClass("active");
										$(this).addClass("active");
										billTypeVal = $(this).attr("value");
										var unit = "";
										if ($(this).attr("value") == 0
												|| $(this).attr("value") == 5) {
											queryFeeParams.period = 1
											unit = Dict.val("common_month");
										} else if ($(this).attr("value") == 3) {
											queryFeeParams.period = 12
											unit = Dict.val("common_year");
										}
										billTypeVal = $(this).attr("value");
										$("#_orderTimeUnit").html(unit);
										$("#orderTimeUnit1").html(unit);

									});
							$("#_ostemplates").bind("change", function() {
								var option = ($(this).find("option[value='"
										+ $(this).val() + "']"));
								$("#_image").empty().html(option.attr("name"));
								$("#osDiskSize").empty().html(option
										.attr("osDisk"));
								desktopParams.osDisk = option.attr("osDisk");
								desktopParams.OS = option.val();
								var dataList = queryFeeParams.productPropertyList;
								var keyPostion = null;
								var data = {
									"muProperty" : "OS",
									"muPropertyValue" : "11",
									"productId" : desktopParams.productId
								};
								// var
								// data={"id":thistrId,"name":$(this).find("input[type='text']").val()};
								if (dataList.length > 0) {
									$.each(dataList, function(key, value) {
												if (value.muProperty == "OS") {
													keyPostion = key;
												}

											});
								}
								if (null == keyPostion) {
									dataList.push(data);
								} else {
									var index = $.inArray(data, dataList);
									if (null != keyPostion) {
										dataList.splice(keyPostion, 1);
									}
								}
								desktopmanage.getFeeParams = queryFeeParams;

							});
							$("#areaNameId").bind("change", function() {
								$("#_ostemplates").html("");
								$("#_areaNameVal").html($(this).text());
								currdesktopResPool = $(this).val();
								if(!currdesktopResPool) return;
								var paramsArea={
				        			   customerId:""+currentUser.id,
				        			   ddcId:currdesktopResPool
				        	   };
				    		desktopCloud.service.getIta(paramsArea,function(result){
			        			   //查询成功
			        			   //查询到ou值 可保存数据到后台，未查到，关闭ui，显示错误
				    			if(result.length==0){
			    					$("#properAreaMsg").addClass("onError").show();
			    				}else{
			    					$("#properAreaMsg").removeClass("onError").hide();
			    				}
			        			   
			        		   },function(error){
			        		   	   $("#properAreaMsg").addClass("onError").show();
			        			   $.growlUI("查询域错误，请联系管理员");
			        			   return;
			        		   });
			        		   
								var productid = $('#areaNameId option:selected').attr("productid");
								desktopParams.productId = parseInt(productid);
								
								var oshtml = "";
								var flagos = true;
								desktopParams.resPool = currdesktopResPool;
								$.each(desktopmanage.createDesktopCloudData.oslist,function(key, value) {
												$.each(value.resourcePool,function(osresPoolkey,osresPoolVal) {
																		if (osresPoolVal.name == currdesktopResPool) {

																			if (flagos) {
																				$("#_image")
																						.html(value.desc);
																				$("#osDiskSize")
																						.html(value.osDisk);
																				desktopParams.osDisk = value.osDisk;
																				flagos = false;
																			}
																			oshtml += "<option value='"
																					+ value.OS
																					+ "' name='"
																					+ value.desc
																					+ "' osDisk='"
																					+ value.osDisk
																					+ "'>"
																					+ value.desc
																					+ "</option><br\>";
																		}
																	});
												});
								$("#_ostemplates").append(oshtml);
								$("#config").html("");
								$("#os_config").html("");
								var confightml = "";
								var currVal = null;
								var currmemoryVal = null;
								var desc = null;
								var isCurrResPoolFlag = false;
								$.each(
												desktopmanage.createDesktopCloudData.vmConfig,
												function(key, value) {
													$.each(value.config,
															function(key1,value1) {
																$.each(value1.memory,function(key2,value2) {
																					$.each(value2.resourcePool,
																									function(key3,value3) {
																										if (currdesktopResPool == value3.name) {
																											isCurrResPoolFlag = true;
																										}
																									});
																				});
															});
													if (isCurrResPoolFlag) {
														var osConfigHtml = "";
														if ($("#os_config")
																.html() == "") {
															currVal = value.type;

															$.each(value.config,function(key1,value1) {
																				desc = value1.desc;
																				$.each(value1.memory,function(key2,value2) {
																									if (key2 == 0) {
																										currmemoryVal = value2.memorySize
																												+ Dict
																														.val("dc_g_ram");
																										osConfigHtml += "<div class='ty active subFee div_block' value='base' memorySize='"
																												+ value2.memorySize
																												+ "'>"
																												+ value1.desc
																												+ " "
																												+ value2.memorySize
																												+ Dict
																														.val("dc_g_ram")
																												+ "</div>"
																									} else {
																										osConfigHtml += "<div class='ty  subFee div_block' value='base' memorySize='"
																												+ value2.memorySize
																												+ "'>"
																												+ value1.desc
																												+ " "
																												+ value2.memorySize
																												+ Dict
																														.val("dc_g_ram")
																												+ "</div>"
																									}
																								});
																				if (key1 == 0) {
																					$("#os_config").append(osConfigHtml);
																				} else {
																					$("#os_config").append("<div class='ty  subFee div_block' value='base' >"
																									+ value1.desc
																									+ " "
																									+ value1.cpuNum
																									+ "</div>");
																				}
																			});
															confightml += "<div class='ty active subFee div_block' value='base' name='configval'>"
																	+ value.type
																	+ "</div>";
														} else {
															confightml += "<div class='ty  subFee div_block' value='base' name='configval'>"
																	+ value.type
																	+ "</div>";
														}
														isCurrResPoolFlag = false;
													}
												});
								$("#config").append(confightml);
								$("#_configInfo").html(currVal + " " + desc+ " " + currmemoryVal);
								var configflag = true;
								$("div[name='configval']").unbind("click")
										.bind("click", function() {
											$("div[name='configval']").removeClass("active");
											$(this).addClass("active");
											var currVal = $(this).html();
											var desc = null;
											var osConfigHtml1 = "";
											var cpuNumVal = null;
											var currmemoryVal1 = null;
											var datas = desktopmanage.createDesktopCloudData.vmConfig;
											desktopmanage.getFeeParams = {};
											$.each(datas, function(key, value) {
												if (currVal == value.type) {
													$.each(value.config,
															function(key1,
																	value1) {
																cpuNumVal = value1.cpuNum;
																$("#os_config")
																		.html("");
																desc = value1.desc;
																desktopParams.cpuNum = value1.cpuNum;
																$.each(value1.memory,function(key2,value2) {
																					if (key2 == 0) {
																						currmemoryVal1 = value2.memorySize
																								+ Dict.val("dc_g_ram");
																						desktopParams.memorySize = value2.memorySize;
																						osConfigHtml1 += "<div class='ty active subFee div_block' value='base' memorySize='"
																								+ value2.memorySize
																								+ "'>"
																								+ value1.desc
																								+ " "
																								+ value2.memorySize
																								+ Dict
																										.val("dc_g_ram")
																								+ "</div>"
																					} else {
																						osConfigHtml1 += "<div class='ty  subFee div_block' value='base' memorySize='"
																								+ value2.memorySize
																								+ "'>"
																								+ value1.desc
																								+ " "
																								+ value2.memorySize
																								+ Dict
																										.val("dc_g_ram")
																								+ "</div>"
																					}
																				});
																if (key1 == 0) {
																	$("#os_config")
																			.append(osConfigHtml1);
																} else {
																	$("#os_config")
																			.append("<div class='ty  subFee div_block' value='base' >"
																					+ value1.desc
																					+ "</div>");
																}
															});
												}
											});
											// {"period":1,"productPropertyList":[{"muProperty":"cpuNum","muPropertyValue":"1","productId":101},{"muProperty"
											// :"memorySize","muPropertyValue":"4","productId":101},{"muProperty":"OS","muPropertyValue":"1","productId"
											// :101}],"verifyFlag":"0"}
											$("#_configInfo").html(currVal
													+ " " + desc + " "
													+ currmemoryVal1);
											// desktopmanage.getFeeParams.memorySize=desktopParams.memorySize;
											// desktopmanage.getFeeParams.cpuNum=cpuNumVal;
											var cpuParams = {
												"muProperty" : "cpuNum",
												"muPropertyValue" : desktopParams.cpuNum,
												"productId" : desktopParams.productId
											};
											var memoryParams = {
												"muProperty" : "memorySize",
												"muPropertyValue" : desktopParams.memorySize,
												"productId" : desktopParams.productId
											};
											if (configflag) {

												queryFeeParams.productPropertyList
														.push(cpuParams);

												queryFeeParams.productPropertyList
														.push(memoryParams);

												configflag = false;
											} else {
												var cpuParamsflagVal = true;
												if (queryFeeParams.productPropertyList.length > 0) {
													$.each(
																	queryFeeParams.productPropertyList,
																	function(
																			key,
																			value) {
																		if (value.muProperty == "cpuNum") {
																			cpuParamsflagVal = false;
																			value.muPropertyValue = desktopParams.cpuNum;
																		}
																	});

												} else {
													cpuParamsflagVal = false;
													queryFeeParams.productPropertyList
															.push(cpuParams);
												}
												if (cpuParamsflagVal) {
													queryFeeParams.productPropertyList
															.push(cpuParams);
												}
												var memorySizeflagVal = true;
												if (queryFeeParams.productPropertyList.length > 0) {
													$.each(
																	queryFeeParams.productPropertyList,
																	function(
																			key,
																			value) {
																		if (value.muProperty == "memorySize") {
																			memorySizeflagVal = false;
																			value.muPropertyValue = desktopParams.memorySize;
																		}
																	});

												} else {
													memorySizeflagVal = false;
													queryFeeParams.productPropertyList
															.push(memoryParams);
												}
												if (memorySizeflagVal) {
													queryFeeParams.productPropertyList
															.push(memoryParams);
												}
											}
											desktopmanage.getFeeParams = queryFeeParams;
										});
								if (!CommonEnum.offLineBill) {
									setTimeout('desktopmanage.getFee()', 5);
								}
							});
							$("#areaNameId").trigger("change");
							$("div[name='deskType']").unbind("click").bind(
									"click", function() {
										$("div[name='deskType']")
												.removeClass("active");
										$(this).addClass("active");
									});
							$(".subFee").bind('mouseup keyup', function() {
										if (!CommonEnum.offLineBill) {
											setTimeout(
													'desktopmanage.getFee()', 5);
										}

									});
							$("div [name='diskSize']").bind("click",
									function() {
										$("div [name='diskSize']")
												.removeClass("active");
										$(this).addClass("active");
										$("#_dataSize").html($(this)
												.attr("value"));

									});
							/*$("#createDataDiskSize").bind("click", function() {
								$("#_dataSize").empty()
										.text($("#createDataDiskSize").val());
								// console.log($("#createDataDiskSize").val());
								var diskParams = {
									"muProperty" : "storageSize",
									"muPropertyValue" : $("#_dataSize").val(),
									"productId" : desktopParams.productId
								};
								var storageSizeflagVal = true;
								// console.log(queryFeeParams.productPropertyList);
								if (queryFeeParams.productPropertyList.length > 0) {
									$.each(queryFeeParams.productPropertyList,
											function(key, value) {
												if (value.muProperty == "storageSize") {
													storageSizeflagVal = false;
													value.muPropertyValue = $("#createDataDiskSize")
															.val();
												}
											});

								} else {
									storageSizeflagVal = false;
									queryFeeParams.productPropertyList
											.push(diskParams);
								}
								if (storageSizeflagVal) {
									queryFeeParams.productPropertyList
											.push(diskParams);
								}
							});*/
							
							/*$("#_dataSize").empty().text("20");
							$("#dataDisk-range-min").slider({
								range : "min",
								value : 20,
								min : 20,
								max : 500,
								step : 10,
								slide : function(event, ui) {
									$("#createDataDiskSize").val(ui.value);
									$("#_dataSize").empty().text(ui.value);
									desktopParams.storageSize = ui.value
											.toString();
									desktopmanage.getFeeParams = {};
									desktopmanage.getFeeParams.dataDisk = ui.value;
									var keyOpt = -1;
									var diskParams = {
										"muProperty" : "storageSize",
										"muPropertyValue" : $("#_dataSize")
												.val(),
										"productId" : desktopParams.productId
									};
									var storageSizeflagVal = true;
									if (queryFeeParams.productPropertyList.length > 0) {
										$
												.each(
														queryFeeParams.productPropertyList,
														function(key, value) {
															if (value.muProperty == "storageSize") {
																storageSizeflagVal = false;
																value.muPropertyValue = ui.value
																		.toString();
															}
														});

									} else {
										storageSizeflagVal = false;
										queryFeeParams.productPropertyList
												.push(diskParams);
									}
									if (storageSizeflagVal) {
										queryFeeParams.productPropertyList
												.push(diskParams);
									}

									desktopmanage.getFeeParams = queryFeeParams;
								}
							});
							*/
							/*$("#createDataDiskSize").bind("blur", function() {
								var value = $("#dataDisk-range-min")
										.slider("value");
								var newValue = $(this).val();
								// console.log($(this));
								// console.log(newValue);
								if (/^[1-9]+[0-9]*$/.test("" + newValue)
										&& parseInt(newValue) >= 50
										&& parseInt(newValue) <= 1000) {
									if (parseInt(newValue) % 10 == 0) {
										newValue = parseInt(newValue);
									} else {
										newValue = parseInt(newValue / 10) * 10
												+ 10;
									}

									$(this).val(newValue);
									$("#dataDisk-range-min").slider("value",
											newValue);
									$("#_dataSize").text(newValue);
								} else {
									$(this).val(value);
									$("#_dataSize").text(value);
								}
									// VM.getFee();
							});*/
						}
					});
		}
		desktopmanage.newFormModal.setWidth(1200).autoAlign().setTop(60).show();
	},
	getFee : function() {
		if (CommonEnum.offLineBill)
			return;
		var param = desktopmanage.getFeeParams;
		if (null == param)
			return;
		Dcp.biz.apiAsyncRequest("/desktopCloud/pm/queryCaculateFeeByPrtyList",
				param, function(data) {

					$(".price").empty().html(desktopmanage.selecedUserNumber
							* 600);
					if (null != data && 0 == data.code) {
						var count = desktopmanage.selecedUserNumber;

						var fee = data.data.fee;
						$(".price").empty().html(count * fee / 1000);

					}
				});
	},
	_save : function(params) {
		com.skyform.service.desktopCloudService.createCitrixCloudTab(params,
				function onSuccess(data) {
					desktopmanage.getFeeParams = {};
					com.skyform.service.desktopCloudService
							.deskConfirmTradeSubmit($(".price").html(),
									data.tradeId, $("#newDesktopCloudForm2"),
									function onSuccess(data) {
										// $.growlUI(Dict.val("common_tip"),
										// "操作成功");
										// $("#newDesktopCloudForm2").hide();
										$.growlUI(Dict.val("common_tip"),Dict.val("dc_create_cloud_desktop_success"));
										desktopmanage.refreshData();
									}, function onError(msg) {
										$.growlUI(Dict.val("common_tip"),Dict.val("dc_create_cloud_desktop_failed"));
									});
					$(".price").empty().html(0);
					desktopmanage.newFormModal.hide();
				}, function onError(msg) {
					desktopmanage.newFormModal.hide();
					$.growlUI(Dict.val("common_tip"),
							Dict.val("dc_create_cloud_desktop_request_failed")
									+ msg);
				});
	},
	getBillType : function() {
		var obj = com.skyform.service.BillService.getBillType();
		$.each(obj, function(key, value) {
					desktopmanage.billType_ = key;
				});
	},
	showDetails : function(instance) {

		if (!desktopmanage.data || desktopmanage.data.length < 1)
			return;
		if (!instance) {
			instance = desktopmanage.data[0].id;
		}
		// $("div[scope='"+desktopmanage.scope+"'] .detail_value").each(function
		// (i,item){
		// var prop = $(item).attr("prop");
		// var value = instance['' + prop] || "---";
		// if(prop == "state") {
		// value = com.skyform.service.StateService.getState("",value);
		// }
		// $(item).html(value);
		// });
		$("#desktopmanage_logs").empty();
		// com.skyform.service.LogService.describeLogsUIInfo(instance.id);
		// com.skyform.service.LogService.describeLogsUIInfo(instance);
		com.skyform.service.desktopCloudService.describeLogs(instance,
				function(logs) {
					// console.log(logs);
					$("#desktopmanage_logs").empty();
					$(logs).each(function(i, v) {
						var desc = "";
						if (v.description) {
							if (v.description != "") {
								desc = "(" + v.description + ")";
							}
						}
						var _name = "";
						if (v.subscription_name) {
							_name = v.subscription_name;
						}

						$("<li class='detail-item'><span>" + v.createTime
								+ "  " + _name + "  " + v.controle + desc
								+ "</span></li>")
								.appendTo($("#desktopmanage_logs"));
					});
				}, function onError(msg) {
					$.growlUI(Dict.val("common_tip"), Dict
									.val("dc_query_cloud_desktop_log_error")
									+ msg);
				});
	},
	getLeisureTenantInfo:function(){
			var params={"serviceFactory": "citrix"};
			if($("#properNum").val()!=""&&$("#properNum").val()!=null){
			   params.userName=$("#properNum").val();
			}
			if($("#properUserName").val()!=""&&$("#properUserName").val()!=null){
			   params.tenantName=$("#properUserName").val();
			}
			com.skyform.service.desktopCloudService.leisureTenantInfo(params,function onSuccess(data){
				desktopmanage._refreshDtTable(data);
			},function onError(msg){
				$.growlUI(Dict.val("common_tip"),"查询专有用户失败"+ msg);
			});
		
	},
	bindProperUser:function(){
		$('#bindProperDiv').off('shown').on('shown', function () {
			$("#properNum").val("");
			$("#properUserName").val("");
		    desktopmanage.getLeisureTenantInfo();
		});
		$("#bindProperDiv").modal("show");
		$("#bindProperUserSearch").unbind("click").bind("click",function(){
		    desktopmanage.getLeisureTenantInfo();
		});
		$("#bindProperSave").unbind("click").bind("click",function(){
		   var temp=$("#bindProperTable tbody input[type='radio']:checked");
		   var tempData=$(temp).val();
		   if(!tempData){
			   	$.growlUI("请选择云桌面用户！！！");
			   	return;
		   }
		   if(!desktopmanage.currentChecked){
		   		$.growlUI("请选择专有桌面！！！");
		   	    return;
		   }
			var params={
			 "subscriptionId":desktopmanage.currentChecked,
			 "tenantId":tempData
			};
		  com.skyform.service.desktopCloudService.distributionProperCloudTab(params,function onSuccess(data){
		  	$("#bindProperDiv").modal("hide");
		  	$.growlUI("绑定桌面用户成功");
		  	desktopmanage.currentChecked=null;
		  	setTimeout("desktopmanage.refreshData()",3000);
		  	//desktopmanage.refreshData();
		  	
		  },function onError(msg){
		  	 ErrorMgr.showError(msg);
		  });
		});
	},
	_refreshDtTable : function(data) {
		if(desktopmanage.properDtTable) {
			desktopmanage.properDtTable.updateData(data);
		} else {
			desktopmanage.properDtTable = new com.skyform.component.DataTable();
			desktopmanage.properDtTable.renderByData("#bindProperTable",{
				pageSize : 5,
				data : data,
				"columnDefs" : [
				{title : "选定", name : "id"},
				{title : "云桌面帐号", name : "UserID"},
				{title : "用户名称", name : "UserName"},
				{title : "联系电话", name : "mobile"},
				{title : "邮箱", name : "email"},
				{title : "创建时间", name : "createTime"}
			    ],
				onColumnRender : function(columnIndex,columnMetaData,columnData){
					   if(columnMetaData.name=="id") {
			            return "<input type='radio' name='bindProperName' value='" + columnData["tenantId"] +"'/>" ;
			          }else if (columnMetaData.name == "createTime") {
					 	var text=columnData["" + columnMetaData.name]
					     text = text?new Date(text).format("yyyy-MM-dd hh:mm:ss"):"";
					     return text;
					 } 
					  else {
			            return columnData[columnMetaData.name];
			          }
				},
				afterRowRender : function(rowIndex,data,tr){},
				afterTableRender : function(){
				}
			});
		}
	},
	unbindProperUser:function(){
			ConfirmWindow.setTitle("用户解绑").setContent("<h4>确定要解绑该专有桌面和用户的绑定关系？</h4>").onSave = function(){
				var subsId = desktopmanage.selectedInstanceId;
				if(valiter.isNull(subsId)){
					$.growlUI("请选择已绑定用户的专有桌面");
					return;
				}
			    var param = {"subsId": subsId};
				com.skyform.service.desktopCloudService.cancelCloudTabUser(param,function (data){
					$.growlUI("云桌面用户解绑成功");
					desktopmanage.currentChecked=null;
					setTimeout("desktopmanage.refreshData()",3000);
					//desktopmanage.refreshData();
				},function (error){
					ErrorMgr.showError(error);
				});
				ConfirmWindow.hide();
			};
			ConfirmWindow.setWidth(500).autoAlign().setTop(100);
			ConfirmWindow.show();
	}

};
