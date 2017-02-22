//当前刷新实例的类型为路由
window.Controller = {
	init : function() {
	},
	refresh : function() {
	}
}
window.otherCurrentInstanceType = 'route';
window.othersCurrentInstanceType = 'eip';
var product = {};
var feeUnit = 1000;
var eip = {};
var Route = {// 路由功能js模块
	data : [],
	dtTable : null,
	newFormModal : null,
	contextMenu : null,
	createPeridInput : null,
	quota : 1,
	exportRules : null,// 获取路由数据
	goodRules : [],
	route_quota : 1,
	scope : "route",
	routeName : [],
	routePort : [],
	routePortP : [],
	instances : [],
	currPool:"",
	booleanPool:false,
	areaZoneId:null,
	brandWidthSet:"",
	eipServiceData:null,
	dedLineParamVal:0,
	init : function() {
		Route.initZoneId();
		Route.refreshData();
		Route._bindAction();

	},
	// /////////////////////////////////////////////////////////////////////////
	// Actions start
	// /////////////////////////////////////////////////////////////////////////

	start : function() {
		ConfirmWindow.setTitle(Dict.val("net_open_router")).setContent(
				Dict.val("net_do_you_open_router")+"<strong>" + Route.instanceName + "</strong>？").onSave = function() {
			ConfirmWindow.hide();
		};
		ConfirmWindow.show();
	},
	destroy : function() {
		var canDestoryRoute = true;
		if (canDestoryRoute) {
			ConfirmWindow.setTitle(Dict.val("net_destory_router")).setContent("<h4>"+Dict.val("net_do_you_destory_router")+"</h4>").onSave = function() {
				var routeIds = new Array();
				routeIds = Route.selectedInstanceId.split(",");
				$(routeIds).each(
						function(index, _routeIds) {
							var ruint = _routeIds;
							var param = {
								"subscriptionId" : parseInt(_routeIds)
							};
							Route.service.destroy(param, function(data) {
								// 下面的四五行其实是用不到了，暂时留着吧，路由删除不成功，不会执行此函数了，会执行function(error)这个函数
								if (data == 1) {
									ErrorMgr.showError("ID"+Dict.val("common_wei") + _routeIds
											+ Dict.val("net_delete_subnet"));
								}
								if (data == 2) {
									ErrorMgr.showError("ID为" + _routeIds
											+ Dict.val("net_please_unbundling"));
								}
								if (data != 1 && data != 2) {
									$.growlUI(Dict.val("net_destory_router"), Dict.val("net_destory_router_success"));
									ConfirmWindow.hide();
									Route.refreshData();
								}
							}, function(error) {// 删除不成功会执行此函数
								ErrorMgr.showError(error);
							});
						});
				ConfirmWindow.hide();
			};
			ConfirmWindow.setWidth(500).autoAlign().setTop(100);
			ConfirmWindow.show();
		}
	},
	close : function() {
		ConfirmWindow.setTitle(Dict.val("net_close_router")).setContent(Dict.val("net_do_you_close_router")).onSave = function() {
			ConfirmWindow.hide();
		};
		ConfirmWindow.show();
	},
	restore : function() {
		ConfirmWindow.setTitle(Dict.val("net_restore_router")).setContent(Dict.val("net_do_you_restore_router")).onSave = function() {
			ConfirmWindow.hide();
		};
		ConfirmWindow.show();
	},
	update : function() {
		Route.service.getById(Route.selectedInstanceId, function(routes) {
			var route = routes[0];
			FormWindow.setTitle(Dict.val("net_modify_router")).setContent(
					"" + $("#update_route_form").html()).onSave = function() {
				Route.service.update(Route.selectedInstanceId, {
					"subscriptionId" : parseInt(Route.selectedInstanceId),
					"instanceName" : $("#update_form_route_name").val(),
					"comment" : $("#update_form_route_desc").val()
				}, function(result) {
					FormWindow.hide();
					$.growlUI(Dict.val("net_modify_router"), Dict.val("common_modify_success"));
					Route.refreshData();
				}, function(error) {
					FormWindow.showError(error);
				});
			};
			FormWindow.beforeShow = function(container) {
				var oldInstanceName = $(
						"#instanceTable tbody input[type='checkbox']:checked")
						.parents("tr").attr("instanceName");
				container.find("#update_form_route_name").val(
						oldInstanceName || "");
				// container.find("#update_form_route_name").val(route.name||"");
				container.find("#update_form_route_desc").val(
						route.comment || "");
			};
			FormWindow.setWidth(500).autoAlign().setTop(100);
			FormWindow.show();

		}, function(error) {
			ErrorMgr.showError(error);
		});
	},
	openTopoView : function() {
		var row = Route.dtTable.getContainer().find("tbody").find(
				"input[type='checkbox']:checked").closest('tr');
		// window.location.href = "topoView.jsp?id="+row.attr("eInstanceId");
		window.open("topoView.jsp?code=net&id=" + row.attr("eInstanceId"));
	},
	natMgr : function() {// 设置端口转发规则
		if ((Route.publicIp == null) || (Route.publicIp == "")) {
			ErrorMgr.showError(Dict.val("net_please_set_public_network_IP"));
			return;
		} else {
			FormWindow.setTitle(Dict.val("net_set_up_port_forwarding_rules")).setContent(
					"" + $("#nat_rule").html()).onSave = function() {
				FormWindow.hide();
			};

			var lDom = '';
			lDom += '<option value=\"tcp\" selected >TCP</option>';
			lDom += '<option value=\"udp\">UDP</option>';
			lDom += '<option value=\"ip\">IP</option>'
			lDom += '<option value=\"icmp\">ICMP</option>';
			;
			$("#nat_rule_protocol").empty().append(lDom);
			FormWindow.settings.publicButtonFlag = true;
			FormWindow.beforeShow = function(container) {
				container.find(".modal-footer").find(".btn").hide();
				NatCfg.init(Route.selectedInstanceId);
				$("#nat_rule_protocol").off().on(
						"click",
						function() {
							var protocol = $("#nat_rule_protocol").val();
							if ("ip" == protocol || "icmp" == protocol) {
								$("#nat_rule_sourcePort").attr("disabled",
										"disabled").val("");
								$("#nat_rule_targetPort").attr("disabled",
										"disabled").val("");
							} else {
								$("#nat_rule_sourcePort")
										.removeAttr("disabled");
								$("#nat_rule_targetPort")
										.removeAttr("disabled");
							}
						})
			};
			FormWindow.setWidth(1020).autoAlign().setTop(100);
			FormWindow.show();
			com.skyform.service.privateNetService.query({
				routeId : Route.selectedInstanceId,
				states : 'running',
				"verifyFlag" : "0"
			}, function onSuccess(subnets) {
				if (subnets == null || subnets.length == 0) {
					ErrorMgr.showError(Dict.val("nic_router")+"：" + Route.instanceName
							+ Dict.val("net_please_apply_private_network"));
					return;
				}

			}, function onError(error) {

			});
		}
		Route.refreshRoute_natrule(Route.selectedInstanceId);
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
	initPublicIPSelect : function(routeId) {// 路由关联的公网ip资源的查询方法
		$("#nat_public_ip").html("");
		var allCheckedBox = $("#instanceTable tbody input[type='checkbox']:checked");
		var routeId = $(allCheckedBox[0]).parents("tr").attr("instanceId");
		var resourcePool = $("#pool").val();
		if (Route.ifNewPool(resourcePool)) {
			Route.service.queryRelatedPublicIp(parseInt(routeId), function (data) {
				var array = data;
				if (array == null || array.length == 0) {
					return;
				} else {
					$("#nat_public_ip").empty();
					var dom = "";
					$(array).each(
						function (i) {
							if (array[i].state == "using") {
								dom += "<option value=\""
									+ array[i].resId + "\" >"
									+ array[i].resId + "</option>";
							}
						});
					$("#nat_public_ip").append(dom);
				}
			});
		} else {
			com.skyform.service.vmService.listRelatedInstances(parseInt(routeId),
				function (data) {
					var array = data;
					if (array == null || array.length == 0) {
						return;
					} else {
						$("#nat_public_ip").empty();
						var dom = "";
						$(array).each(
							function (i) {
								if (array[i].templateType == 9
									&& array[i].state == "using") {
									dom += "<option value=\""
										+ array[i].resId + "\" >"
										+ array[i].resId + "</option>";
								}
							});
						$("#nat_public_ip").append(dom);
						// $("#remove").click(function(){
						// PrivateNetwork.removeFromPrivateNetwork();
						// })
					}
				});

		}
	},
		// 停止虚拟机，刷新防火墙
	refreshRoute_natrule : function(routeId) {
		AutoUpdater.stop();
		AutoUpdater.parentid = routeId;
		window.currentInstanceType = 'route_natrule';
		AutoUpdater.start();
	},
	showDetails : function(instance) {
		if (!Route.data || Route.data.length < 1)
			return;
		if (!instance) {
			instance = Route.data[0];
		}
		$("div[scope='" + Route.scope + "'] .detail_value").each(
				function(i, item) {
					var prop = $(item).attr("prop");
					var value = instance['' + prop] || "---";
					if (prop == "status") {
						value = com.skyform.service.StateService.getState(
								"route", instance);
					}
					$(item).html(value);
				});
		// com.skyform.service.LogService.getRouteLogByRouteId(instance.id,function(logs){
		// $("#opt_logs").empty();
		// $(logs).each(function(i,v){
		// $("<li class='detail-item'><span>" + new
		// Date(v.createTime).format("yyyy-MM-dd hh:mm:ss") + ":" +
		// v.operateContent + "</span></li>").appendTo($("#opt_logs"));
		// });
		// });

		$("#opt_logs").empty();
		com.skyform.service.LogService.describeLogsUIInfo(instance.id);
		// com.skyform.service.LogService.describeLogsInfo(instance.id,function(logs){
		// $("#opt_logs").empty();
		// $(logs).each(function(i,v){
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
		// $("<li class='detail-item'><span>" + v.createTime + "
		// "+v.subscription_name +" "+ v.controle +
		// desc+"</span></li>").appendTo($("#opt_logs"));
		// });
		// },function onError(msg){
		// // $.growlUI(Dict.val("common_tip"), "查询弹性块存储日志发生错误：" + msg);
		// });
		/*
		 * Route.service.listRelatedInstances(instance.id,function(nets){
		 * $("#routeNet").empty(); var dom = ""; $(nets).each(function(i,net){
		 * dom = ""; dom += "<li class=\"detail-item\">" +"<span>私有网络ID&nbsp;&nbsp;&nbsp;&nbsp;" +
		 * net.id +"</span>&nbsp;&nbsp;&nbsp;&nbsp;" +"<span>私有网络名称&nbsp;&nbsp;&nbsp;&nbsp;"+
		 * net.name+"</span>&nbsp;&nbsp;&nbsp;&nbsp;" +"</li>";
		 * $("#routeNet").append(dom); }); },function(error){ //TODO show error
		 * info in window });
		 */
		// TODO 显示该显示的内容
	},
	refreshData : function() {
		
		if (Route.dtTable)
			Route.dtTable.container
					.find("tbody")
					.html(
							"<tr ><td colspan='7' style='text-align:center;'><img src='"
									+ CONTEXT_PATH
									+ "/images/loader.gif'/><strong>"+Dict.val("common_retrieving_data_please_wait")+"</strong></td></tr>");
		
		/*
		PrivateNetwork.service.listAll(function onSuccess(nets) {
			for ( var i = 0; i < nets.length; i++) {
				PrivateNetwork.routeId.push(nets[i].routeId);
			}
		}, function onError(msg) {
			ErrorMgr.showError(msg);
		});
		*/
		
		Route.service.listAll(function onSuccess(nets) {
			
			Route.currPool=CommonEnum.currentPool;
			Route.booleanPool=(-1!=Config.privateNetwork.indexOf(Route.currPool));
			
			
			for ( var i = 0; i < nets.length; i++) {
				Route.routeName.push(nets[i].name);
			}
			Route.data = nets;
			// 添加关联资源功能 added by shixianzhi
			if (Route.data.length > 0) {
				var firstInstanceId = Route.data[0].id;
				Route.getRouteNet(firstInstanceId);
			}
//			var i=0;
//			Route.currPool=$("#pool").val();
//			console.log($("#pool").val())
//			while (Route.currPool==null&&i<30)
//			  {
//				Route.currPool=$("#pool").val();
//				console.log(i);
//				console.log(Route.currPool);
////				  var start = new Date().getTime();
////			      while (true) if (new Date().getTime() - start > 500) break;
////				Route.sleep(3000);
////				setTimeout('Route.currPool=$("#pool").val()',5000)
//			  i++;
//				
//			  }
//			console.log(CommonEnum.currentPool);
//			Route.currPool="langfang"
//			Route.currPool=$("#pool").val();
//			console.log(Route.currPool)
		
			if(Route.booleanPool){
				$("table th[name='displayName']").removeAttr("contentvisiable");
			}
//			Route.currPool=$("#pool option:selected").val();
			
			Route._refreshDtTable(Route.data);
		}, function onError(msg) {
			ErrorMgr.showError(msg);
		});
		
	
	},
	// /////////////////////////////////////////////////////////////////////////
	// Actions end
	// /////////////////////////////////////////////////////////////////////////
	_bindAction : function() {
		$("div[scope='" + Route.scope + "'] #toolbar .actionBtn").unbind()
				.click(function() {
					if ($(this).hasClass("disabled"))
						return;
					var action = $(this).attr("action");
					Route._invokeAction(action);
				});
	},

	_invokeAction : function(action) {
		var invoker = Route["" + action];
		if (invoker && typeof invoker == 'function') {
			invoker();
		}
	},

	_refreshDtTable : function(data) {
		if (Route.dtTable) {
			Route.dtTable.updateData(data);
		} else {
			Route.dtTable = new com.skyform.component.DataTable();
			Route.dtTable
					.renderByData(
							"#instanceTable",
							{
								pageSize : 5,
								data : data,
								onColumnRender : function(columnIndex,
										columnMetaData, columnData) {
									if (columnMetaData.name == 'ID') {
										return columnData.id;
									} else if (columnMetaData.name == "id") {
										return "<input type='checkbox' value='"
												+ columnData["id"] + "'/>";
									} else if (columnMetaData.name == 'state') {
										return com.skyform.service.StateService
												.getState("route",
														columnData.status
																|| columnData);
									} else if (columnMetaData.name == 'routeType') {
										if (columnData.productName) {
											return columnData.productName;
										} else {
											return "";
										}

									}else if (Route.booleanPool&&columnMetaData.name == 'displayName') {
										if (columnData.displayName) {
											return columnData.displayName;
										} else {
											return "";
										}

									} else if (columnMetaData.name == "createDate") {
										// return new
										// Date(columnData.createDate).toLocaleString();
										var text = '';
										// console.log(columnData.createDate);
										if (columnData.createDate == ''
												|| columnData.createDate == 'undefined') {
											return text;
										}
										try {
											var obj = eval('('
													+ "{Date: new Date("
													+ columnData.createDate
													+ ")}" + ')');
											var dateValue = obj["Date"];
											text = dateValue
													.format('yyyy-MM-dd hh:mm:ss');
										} catch (e) {
										}
										return text;
									} else if (columnMetaData.name == "expireDate") {
										// return new
										// Date(columnData.expireDate).toLocaleString();
										var text = '';
										// console.log(columnData.expireDate);
										if (columnData.expireDate == ''
												|| columnData.expireDate == 'undefined') {
											return text;
										}
										try {
											var obj = eval('('
													+ "{Date: new Date("
													+ columnData.expireDate
													+ ")}" + ')');
											var dateValue = obj["Date"];
											text = dateValue
													.format('yyyy-MM-dd hh:mm:ss');
										} catch (e) {
										}
										return text;
									} else if (columnMetaData.name == 'name') {
										text = columnData.name
												+ "<a title="+Dict.val("common_advice")+" href='../user/workOrder.jsp?code=workOrder&cataCode=service&instanceId="
												+ columnData.id
												+ "&serviceType=route&instanceName="
												+ encodeURIComponent(columnData.name)
												+ "&instanceStatus="
												+ columnData.status
												+ "&currentPoolW="
												+ encodeURIComponent(CommonEnum.pools[CommonEnum.currentPool])
												+ "'><i class='icon-comments' ></i></a>";
										return text;
									} else {
										return columnData[columnMetaData.name];
									}
								},
								afterRowRender : function(rowIndex, data, tr) {
									tr.attr("instanceId", data.id);
									tr.attr("eInstanceId", data.eInstanceId);

									tr.attr("instanceName", data.name);
									tr.attr("instanceState", data.status);
									tr.attr("publicIp", data.publicIp || "");
									tr.attr("createDate", data.createDate);
									tr.attr("expireDate", data.expireDate);
									tr.find("input[type='checkbox']").click(
											function() {
												Route.onInstanceSelected();
											});
									tr.click(function() {
										Route.getRouteNet(data.id);
										Route.showDetails(data);
									});
								},
								afterTableRender : Route._afterDtTableRender
							});
			Route.dtTable.addToobarButton($("#toolbar"));
			Route.dtTable.enableColumnHideAndShow("right");
		}
	},

	_afterDtTableRender : function() {
		var check = $("input#selectAllRoutes[type='checkbox']").unbind("click")
				.click(function(e) {
					e.stopPropagation();
					var check = $(this).attr("checked");
					Route.checkAll(check);
				});
		if (!Route.contextMenu) {
			Route.contextMenu = new ContextMenu({
				beforeShow : function(tr) {
					Route.checkAll(false);
					tr.find("input[type='checkbox']").attr("checked", true);
				},
				afterShow : function(tr) {
					Route.onInstanceSelected({
						instanceName : tr.attr("instanceName"),
						id : tr.attr("instanceId"),
						state : tr.attr("instanceState"),
						publicIp : tr.attr("publicIp")
					});
				},
				onAction : function(action) {
					Route._invokeAction(action);
				},
				trigger : "#instanceTable tr"
			});
		} else {
			Route.contextMenu.reset();
		}
		Route.showDetails();
	},

	checkAll : function(check) {
		if (check)
			$("#instanceTable tbody input[type='checkbox']").attr("checked",
					true);
		else
			$("#instanceTable tbody input[type='checkbox']").removeAttr(
					"checked");
		Route.onInstanceSelected(false);
	},

	onInstanceSelected : function(selectInstance) {
		var allCheckedBox = $("#instanceTable tbody input[type='checkbox']:checked");
		var rightClicked = selectInstance ? true : false;
		var state = $(allCheckedBox[0]).parents("tr").attr("instanceState");
		if (selectInstance) {
			state = selectInstance.state;
		}
		var oneSelected = allCheckedBox.length == 1;
		var hasSelected = allCheckedBox.length > 0;
		if (oneSelected) {// 如果列表中的路由只有一个被选中，当前的publicIp为那个唯一被选中路由的publicIp
			Route.publicIp = $(
					"#instanceTable tbody input[type='checkbox']:checked")
					.parent().parent()[0].attributes["publicip"].value;
		}
		$("div[scope='" + Route.scope + "'] .operation").addClass("disabled");
		$("div[scope='" + Route.scope + "'] .operation").each(
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
					Route._bindAction();
				});
		// 右键的时候
		if (rightClicked) {
			Route.instanceName = selectInstance.instanceName;
			Route.selectedInstanceId = selectInstance.id;
			Route.publicIp = selectInstance.publicIp;
		} else {
			for ( var i = 0; i < allCheckedBox.length; i++) {
				var currentCheckBox = $(allCheckedBox[i]);
				if (i == 0) {
					Route.instanceName = currentCheckBox.parents("tr").attr(
							"name");
					Route.selectedInstanceId = currentCheckBox.attr("value");
				} else {
					Route.instanceName += ","
							+ currentCheckBox.parents("tr").attr("name");
					Route.selectedInstanceId += ","
							+ currentCheckBox.attr("value");
				}
			}
		}
	},

	getFee : function() {// 购买路由时，计算当前规格的路由价格是多少
		if (CommonEnum.offLineBill)
			return;
		var shijian; // 表示有多少月，若按年计算，要乘以12
		if ("年" == $("#peridUnit").html()) {
			shijian = Route.createPeridInput.getValue() * 12;
		}
		if ("月" == $("#peridUnit").html()) {
			shijian = Route.createPeridInput.getValue();
		}
		var period = shijian;
		var param = com.skyform.service.channelService.getProductFee();
		param.period = period;
		param.productPropertyList[0].muProperty = product.muProperty;
		param.productPropertyList[0].muPropertyValue = product.muPropertyValue;
		param.productPropertyList[0].productId = product.productId;
		// var param = {
		// "period":period,
		// "productPropertyList":[
		// {
		// "muProperty":product.muProperty,
		// "muPropertyValue":product.muPropertyValue,
		// "productId":product.productId
		// }
		// ]
		// };
		var networkoption = $(
				"input[type='radio'][name='networkoption']:checked").val();
		var bandwidth = $("#createBandwidthSize").val();
		if ("createNew" == networkoption) {
			var bw = {
				"muProperty" : "BAND_WIDTH",
				"muPropertyValue" : bandwidth,
				"productId" : ipJson.product.productId
			};
			param.productPropertyList[1] = bw;
		} else
			delete param.productPropertyList[1];
		Dcp.biz.apiAsyncRequest("/pm/queryCaculateFeeByPrtyList", param,
				function(data) {
					if (0 == data.code) {
						var fee = data.data.fee / feeUnit;
						$("#feeInput").val(fee);
						$("#feeInput").html(fee);
					}
				});
		$("#demo").find("span[name$='Msg']").html("");
	},
	trans4RouterByPool : function(data, pool) {
		var routerList = [];
		$.each(data, function(index, item) {
			if (item.resourcePool && item.resourcePool.length > 0) {
				$(item.resourcePool).each(function(j, p) {
					if (pool == p.name) {
						routerList.push(item);
					}
				});
			} else if (null == item.resourcePool
					|| (item.resourcePool && item.resourcePool.length == 0)) {
				routerList.push(item);
			}
		});
		return routerList;
	},
	queryProductPrtyInfo : function(index) {// 查询路由产品的相关信息
		// $("#peridUnit").empty().html("月");// TODO
		com.skyform.service.BillService
				.queryProductPrtyInfo(
						index,
						window.otherCurrentInstanceType,
						function(data) {
							var products = Route.trans4RouterByPool(data,
									CommonEnum.currentPool);
							$("#serviceTypeProduct").empty();
							$(products)
									.each(
											function(index1, item) {
												var cpu_option = "";
												if (item.productname) {
													cpu_option = $("<div  class=\"types-options cpu-options serviceType \" style=\"width:111px;\" data-value='"
															+ item.productId
															+ "'>"
															+ item.productname
															+ "</div>");
												} else {
													cpu_option = $("<div  class=\"types-options cpu-options serviceType \" style=\"width:111px;\" data-value='"
															+ item.productId
															+ "'>"
															+ item.productId
															+ "</div>");
												}

												cpu_option
														.appendTo($("#serviceTypeProduct"));
												cpu_option
														.click(function() {// 点击包年或者包月返回产品不同规格的信息
															if ($(this)
																	.hasClass(
																			"selected"))
																return;
															$(
																	"div.type-options.serviceType")
																	.removeClass(
																			"selected");
															$(
																	".options .types-options.cpu-options.serviceType ")
																	.removeClass(
																			"selected");
															$(this).addClass(
																	"selected");
															product.productId = item.productId;
															// console.log($(this).attr("data-value"));
															product.muProperty = "routerPrice";
															product.muPropertyValue = item.routerPrice;
															// Route.queryBwProductPrtyInfo(index);//TODO:是否进行公共带宽查询
															// Route.queryOtherProductPrtyInfo(index);
															if (index != 5) {
																Route.getFee();
															}

														});
												if (index1 == 0) {
													cpu_option
															.addClass("selected");
													product.productId = item.productId;
													product.muProperty = "routerPrice";
													product.muPropertyValue = item.routerPrice;
												}
											});
							// if(product){
							// $("#serviceTypeProduct").find('div[data-value="'+product.productId+'"]').addClass("selected");
							// }
							if (0 == index) {
								$("#peridUnit").empty().html(Dict.val("common_month"));
							} else if (1 == index) {
								$("#peridUnit").empty().html(Dict.val("common_hour"));
							} else if (2 == index) {
								$("#peridUnit").empty().html(Dict.val("common_day"));
							} else if (3 == index) {
								$("#peridUnit").empty().html(Dict.val("common_year"));
							} else if (5 == index) {// 线下用户也有周期，默认为月
								$("#peridUnit").empty().html(Dict.val("common_month"));
							}
						});
	},

	queryOtherProductPrtyInfo : function(index) {// 暂时没用，留着
	// com.skyform.service.BillService.queryProductPrtyInfo(index,window.othersCurrentInstanceType,function(data){
	// });
	},

	queryBwProductPrtyInfo : function(index) {// 查询公网带宽产品的相关规格信息
		com.skyform.service.BillService.queryProductPrtyInfo(index, "ip",
				function(data) {
					if (null != data) {
						ipJson.product.max = data.brandWidth.max;
						ipJson.product.min = data.brandWidth.min;
						ipJson.product.step = data.brandWidth.step;
						ipJson.product.unit = data.brandWidth.unit;
						ipJson.product.productId = data.productId;
					}
				});
	},
	
	/*newInstance : function(){//点击创建路由所执行的函数，开始
		if(!Route.newFormModal){
			Route.newFormModal = new com.skyform.component.Modal("newRouteForm","<h3>新建路由器</h3>",$("script#new_route_form").html(),{
				buttons : [
				           {name:'确定',onClick:function(){
				        	   if($.trim($("#form_route_name").val())=="" || $.trim($("#form_route_name").val())==null){
				        		   alert("新建路由的名字不能为空！");
				        		   return;
				        	   }				        	   
				        	   //新建路由名字不能包含特殊字符和空格
				        	   var routeName = $.trim($("#form_route_name").val());
				        	   var re1 = new RegExp(" ","g");
				        	   var re2 = new RegExp("@","g");
				        	   var re3 = new RegExp("#","g");
				        	   var re4 = new RegExp("\\$","g");
				        	   var re5 = new RegExp("%","g");
				        	   var re6 = new RegExp("\\^","g");
				        	   var re7 = new RegExp("&","g");
				        	   var re8 = new RegExp("\\*","g");
				        	   var re9 = new RegExp("~","g");
				        	   var re10 = new RegExp("!","g");
				        	   if((routeName.match(re1)!=null) || (routeName.match(re2)!=null) || 
				        			   (routeName.match(re3)!=null) || (routeName.match(re4)!=null) || 
				        			   (routeName.match(re5)!=null) || (routeName.match(re6)!=null) || 
				        			   (routeName.match(re7)!=null) || (routeName.match(re8)!=null) || 
				        			   (routeName.match(re9)!=null) || (routeName.match(re10)!=null)){
				        		   alert("新建路由的名称不能包含特殊字符");
				        		   return;
				        	   }
				        	   //购买路由的时间(月数)，无论是按月还是按年，单位都是按月算，所以年的情况要乘以12
				        	   var shijian;  //表示有多少月
				        	   if("年" == $("#peridUnit").html()){
				        		   shijian = Route.createPeridInput.getValue() * 12;
				        	   }
				        	   if("月" == $("#peridUnit").html()){
				        		   shijian = Route.createPeridInput.getValue();
				        	   }
				        	   var params = {//无任何绑定创建路由的入参
				        			period:shijian,
				        			count:1,   
				        			productList:[{
				        			             	instanceName : $.trim($("#form_route_name").val()),
				        			             	productId : product.productId
				        						}]
				        	   };
				        	   var netCfg = $("input[type='radio'][name='networkoption']:checked").val();
				        	   if(netCfg == 'useExisted') {
				        		   params = {//绑定已有公网带宽创建路由的入参
						        			period:shijian,
						        			count:1,   
						        			productList:[{
						        			             	instanceName : $.trim($("#form_route_name").val()),
						        			             	productId : product.productId,
						        			             	eipId : $("select.existed_brandwidth").val()
						        						}]
						        	   };
				        	   } else if (netCfg == 'createNew') {
				        		   params = {//新申请公网带宽创建路由的入参
						        			period:shijian,
						        			count:1,   
						        			productList:[{
						        			             	instanceName : $.trim($("#form_route_name").val()),
						        			             	productId : product.productId
						        						},{
						        			             	instanceName : "BW",
						        			             	BAND_WIDTH : $("#createBandwidthSize").val(),
						        			             	productId : ipJson.product.productId,
						        			             	serviceType : CommonEnum.serviceType["route"]
						        						}
						        						]
						        	   };
				        	   }
				        	   Route._save(params);
				           },attrs:[{name:'class',value:'btn btn-primary'}]},
				           
				           {name:'取消',onClick:function(){
				        	   Route.newFormModal.hide();
				           },attrs:[{name:'class',value:'btn'}]}
				           ],
				
				beforeShow : function(){//创建路由窗口显示之前要做的事情
					if(!CommonEnum.offLineBill){
						$(".feeInput_div").show();
						$(".period_div").show();
					}else{
						$(".period_div").show();
						$(".public_display_private_not").hide();
					}
					$("#billType").empty();
					var billtype_hasSelected = false;
					$.each(CommonEnum.billType, function(index) {
						var cpu_option = $("<div  class=\"types-options cpu-options \" data-value='"+ index + "'>" + CommonEnum.billType[index] + "</div>");
						cpu_option.appendTo($("#billType"));
						cpu_option.click(function(){//点击包年或者包月返回产品不同规格的信息
							if($(this).hasClass("selected"))return;
							$("div.type-options").removeClass("selected");
							$(".options .types-options.cpu-options ").removeClass("selected");
							$(this).addClass("selected");
							Route.queryProductPrtyInfo(index);
							Route.queryBwProductPrtyInfo(index);
							Route.queryOtherProductPrtyInfo(index);
							if(index != 5){
								Route.getFee();
							}
						});
						if (index == 0||index == 5) {
							if(!billtype_hasSelected)
							{
								billtype_hasSelected = true;
								cpu_option.addClass("selected");
								Route.queryProductPrtyInfo(index);
								Route.queryBwProductPrtyInfo(index);
								Route.queryOtherProductPrtyInfo(index);
							}
						}
					});
					//查询当前现有的带宽并放置在select中，此处暂时没用，留着吧
					Dcp.biz.apiRequest("/instance/eip/describeEipServices", null, function(data) {
						if (data.code == 0) {
							//console.log("我是477行的ip："+data.data.id);
						}
					});
					//新申请独享带宽时弹出的slider
					Route.createPeridInput = null;
					if (Route.createPeridInput == null) {
						var container = $("#perid").empty();				
						var max = 12;
						Route.createPeridInput = new com.skyform.component.RangeInputField(container, {
							min : 1,
							defaultValue : 1,
							max:max,
							textStyle : "width:137px"
						}).render();
						Route.createPeridInput.reset();
					}
					
					Route.getFee();
					//查询当前公网IP数量是不是够用
					com.skyform.service.Eip.queryEnoughIP(function(enough){
						if(enough -  1 < 0) {
							$("#createNew").attr("disabled","true");
							$("#createNewMsg").empty().append("(互联网接入数量余额:" + enough+",无法创建)");
						}
					});
					$(".subFee").bind('mouseup keyup',function(){
						setTimeout('Route.getFee()',100);
					});
					if(!Route.newFormModal.brandWidthSlider) {
						var min=ipJson.product.min,max=ipJson.product.max,step=ipJson.product.step,value=min;
						Route.newFormModal.brandWidthSlider = $( "#bandwidth-range-min" ).slider({
							range: "min",
							value: value,
							min: min,
							max: max,
							step: step,
							slide: function( event, ui ) {
								$("#createBandwidthSize").val(ui.value);
							}
						});
						initsliderButton("createBandwidthSize","bandwidth-range-min",max,min,step);
						$("#createBandwidthSize").bind("blur",function(){
							var value = Route.newFormModal.brandWidthSlider.slider("value");
							var newValue = $(this).val();
							if(/^[1-9]+[0-9]*$/.test(""+newValue) &&  parseInt(newValue)>= min && parseInt(newValue) <= max) {
								Route.newFormModal.brandWidthSlider.slider("value",newValue);
							} else {
								$(this).val(value);
							};
						});
						$("#createBandwidthSize").val(value);
						FireWallCfg.init();
					}
					$("input[type='radio'][name='networkoption']").click(function(){
						var value = $(this).val();
						$("div.networkoption").each(function(i,div){
							if(!$(div).hasClass("network_" + value)) {
								$(div).addClass("hide");
							} else {
								$(div).removeClass("hide");
							}
						});
						
					});
					if(!Route.newFormModal.countField) {
						Route.newFormModal.countField = new com.skyform.component.RangeInputField("#newRouteForm #routeCount",{
							defaultValue : 1,
							min : 1,
							max : 5, 
							textClass : 'text-large'
						}).render();
					}
					Route.newFormModal.countField.reset();
					com.skyform.component.utils.restrainInputFieldToMatchIntNumber("#route_instance_count");
					//路由创建的第二种方式时，查询出可用的公网宽带，并显示出来
					$("select.existed_brandwidth").empty();
					com.skyform.service.EipService.listAll(function(data){
						$(data).each(function(i,n){
							if(data[i].state=="running"){
								$("<option value='" + data[i].id + "'>" + data[i].instanceName+"</option>").appendTo($("select.existed_brandwidth"));
							}
						});
					},function(error){
						ErrorMgr.showError(error);
					});
					//每次切换路由的创建方式，页面都要重新计费
					$("label.radio").click(function(){
						Route.getFee();
						//if(Dcp.biz.getCurrentPortalType()!="private"){
						//}
					});
				}
			});
		} 
		Route.newFormModal.setWidth(750).autoAlign().setTop(100).show();
	}, *///点击创建路由所执行的函数，结束
	
	initZoneId:function(){
		
		
		com.skyform.service.resQuotaService.queryAZAndAzQuota(function(data){
			if(data&&data.length!=0){
				$.each(data,function(key,value){
					if("1"==value.isQuotaExist){
						Route.areaZoneId=value.availableZoneId;
					}
				});
			};
//			console.log(Route.areaZoneId);
		},function(data){
			console.log(data);
		});
		
		//得到域
//		var az="";
//		com.skyform.service.resQuotaService.queryQuotaAllCountByLoginName(az,function onSuccess(data){
//				if(data&&data.length!=0){
//					Route.areaZoneId=data[0].quotaTotal.availableZoneId;
//				 }
//		},function onError(msg){
//			//$.growlUI(Dict.val("common_tip"),msg);
//		});
	},
	//add by yi for test 10.28
	createRoute : function() {
		if(Route.booleanPool){
			if(Route.areaZoneId==null){
				$.growlUI("请增加配额");
				return false;
			}	
		}
	
		//清空优惠码
		$("#agentDemo").attr("style","display:none");
		$("#agentDemo").find("span[name$='Msg']").html("");
		
//		if(CommonEnum.areaZoneId==null){
//			$.growlUI(Dict.val("common_quotas_not_empty_please_increase_quota"));
//			return false;
//		}
		if(Route.booleanPool){
			$("#deLineDiv").show();
		}
		else{
			$("#deLineDiv").hide();
		}
		$("#brandwidthMsg").empty();
		//判断资源池
		
		
		
		Route.newFormModal = $("#newRouteForm");
		$("#btnCreateRoute").bind('click', function(e) {
			if($("input[type='radio'][name='networkoption']:checked").val()=="createNew"&&$("#createBandwidthSize").val()<1){
				alert("带宽值最小为“1”");
				$("#createBandwidthSize").val("1").focus();
				return;
			}
			if(Route.createPeridInput.getValue()<1){
				alert("周期值最小为“1”");
				return;
			}
			Route.createComfirm();
		});		
		$("#newRouteForm").modal("show");
		$("#newRouteForm").off("shown").on("shown", function(){			
			//创建路由窗口显示之前要做的事情
			if(!CommonEnum.offLineBill){
				$(".feeInput_div").show();
				$(".period_div").show();
			}else{
				$(".period_div").show();
				$(".public_display_private_not").hide();
			}
			$("#billType").empty();
			var billtype_hasSelected = false;
			$.each(CommonEnum.billType, function(index) {
				var cpu_option = $("<div  class=\"types-options cpu-options \" data-value='"+ index + "'>" + CommonEnum.billType[index] + "</div>");
				cpu_option.appendTo($("#billType"));
				cpu_option.click(function(){//点击包年或者包月返回产品不同规格的信息
					if($(this).hasClass("selected"))return;
					$("div.type-options").removeClass("selected");
					$(".options .types-options.cpu-options ").removeClass("selected");
					$(this).addClass("selected");
					Route.queryProductPrtyInfo(index);
					Route.queryBwProductPrtyInfo(index);
					Route.queryOtherProductPrtyInfo(index);
					if(index != 5){
						Route.getFee();
					}
				});
				if (index == 0||index == 5) {
					if(!billtype_hasSelected)
					{
						billtype_hasSelected = true;
						cpu_option.addClass("selected");
						Route.queryProductPrtyInfo(index);
						Route.queryBwProductPrtyInfo(index);
						Route.queryOtherProductPrtyInfo(index);
					}
				}
			});
//			//查询当前现有的带宽并放置在select中，此处暂时没用，留着吧
//			Dcp.biz.apiRequest("/instance/eip/describeEipServices", null, function(data) {
//				if (data.code == 0) {
//					//console.log("我是477行的ip："+data.data.id);
//				}
//			});
			//新申请独享带宽时弹出的slider
			Route.createPeridInput = null;
			if (Route.createPeridInput == null) {
				var container = $("#period").empty();				
				var max = 12;
				Route.createPeridInput = new com.skyform.component.RangeInputField(container, {
					min : 1,
					defaultValue : 1,
					max:max,
					textStyle : "width:137px"
				}).render();
				Route.createPeridInput.reset();
			}
			
			Route.getFee();
			//查询当前公网IP数量是不是够用
			if(Route.booleanPool){
				
			}else{
				com.skyform.service.Eip.queryEnoughIP(function(enough){
					if(enough -  1 < 0) {
						$("#createNew").attr("disabled","true");
						$("#createNewMsg").empty().append(Dict.val("net_internet_access_number_balance") + enough+","+Dict.val("net_not_create")+")");
					}
				});
			}
			
			$(".subFee").bind('mouseup keyup',function(){
				setTimeout('Route.getFee()',100);
			});
			
			$("#agentId").focus(function(){
				$("#agentMsg").text("");
			});
			$("#useAgentBtn").unbind("click").bind("click", function() {
				//该方法在agentCommon.js里
				com.skyform.agentService.getAgentCouponFeeInfo("route");
			});	
			if(!Route.newFormModal.brandWidthSlider) {
				var min=ipJson.product.min,max=ipJson.product.max,step=ipJson.product.step,value=min;
				Route.newFormModal.brandWidthSlider = $( "#bandwidth-range-min" ).slider({
					range: "min",
					value: value,
					min: min,
					max: max,
					step: step,
					slide: function( event, ui ) {
						$("#createBandwidthSize").val(ui.value);
					}
				});
				initsliderButton("createBandwidthSize","bandwidth-range-min",max,min,step);
				$("#createBandwidthSize").bind("blur",function(){
					var value = Route.newFormModal.brandWidthSlider.slider("value");
					var newValue = $(this).val();
					if(/^[1-9]+[0-9]*$/.test(""+newValue) &&  parseInt(newValue)>= min && parseInt(newValue) <= max) {
						Route.newFormModal.brandWidthSlider.slider("value",newValue);
					} else {
						$(this).val(value);
					};
				});
				$("#createBandwidthSize").val(value);
			}
			
			if(Route.booleanPool){
				var optionVal="";
			
				$("#dedicatedDiv").show();
				//专线查询接口
//				console.log(Route.areaZoneId)
				var params={"uuid":Route.areaZoneId};
				com.skyform.service.routeService.queryAllDedLineList(params,function(data){
//					var data=[{"displayName":"专线11",dedLineId:"1"},{"displayName":"专线21",dedLineId:"2"},{"displayName":"专线31",dedLineId:"3"}];
					$.each(data,function(key,value){
						if(key==0){
							Route.dedLineParamVal=value.id;
							optionVal+="<option value='"+value.id+"' selected='selected'>"+value.displayName+"</optoion>";
						}else{
							optionVal+="<option value='"+value.id+"'>"+value.displayName+"</optoion>";
						}
						
					});
					$("#dedicatedLineSelect").empty().html(optionVal);
					$("#deLineDiv").show();
				},function(erro){
					//专线查询失败
				});
				//该数据调用后台接口。该data是模拟数据
//				var data=[{"displayName":"专线11",dedLineId:"1"},{"displayName":"专线21",dedLineId:"2"},{"displayName":"专线31",dedLineId:"3"}];
//				$.each(data,function(key,value){
//					optionVal+="<option value='"+value.dedLineId+"'>"+value.displayName+"</optoion>";
//				});
//				$("#dedicatedLineSelect").empty().html(optionVal);
//				$("#deLineDiv").show();
//				
				
			
			//添加路由专线功能
//			console.log($("#dedicatedLineSelect option:selected").val());//默认路由专线值
//			console.log($("#dedicatedLineSelect option:selected").val());
			var params={
					dedLineId:parseInt($("#dedicatedLineSelect option:selected").val())//默认值
				};
				Route.listBindWidthInfo(params);
				var paramseip={
						"verifyFlag" : "0",
						"dedLineId":parseInt($("#dedicatedLineSelect option:selected").val())
				};
				//专线ip查询,默认操作
//				Route.queryEnoughIPdedLine(paramseip);
			$("#dedicatedLineSelect").change(function(){
				
				var currDedLineId=parseInt($("#dedicatedLineSelect option:selected").val());
					$("select.existed_brandwidth").empty();
					$("#brandwidthMsg").empty();
					$(Route.eipServiceData).each(function(i,n){
						if(Route.eipServiceData[i].state=="running"&&Route.eipServiceData[i].dedLineId==currDedLineId){
							$("<option value='" + Route.eipServiceData[i].id + "'>" + Route.eipServiceData[i].instanceName+"</option>").appendTo($("select.existed_brandwidth"));
						}
					});
					var paramseip={
							"verifyFlag" : "0",
							"dedLineId":currDedLineId
					};
					Route.queryEnoughIPdedLine(paramseip);
			});
			
			}
//			$("#dedicatedLineSelect option").click(function(){//选择路由专线的值
//				console.log("tessssssaaaaaa");
//				
//				var params={
//						dedLineId:$("#dedicatedLineSelect option:selected").val()//默认值
//					};
//					Route.listBindWidthInfo(params);
//					var paramseip={
//							"dedLineId":$("#dedicatedLineSelect option:selected").val()
//					};
//					//专线ip查询,默认操作
//					Route.queryEnoughIPdedLine(paramseip);
//				//根据专线的值查询公网带宽，并回填带宽的选择框
//			});
			$("input[type='radio'][name='networkoption']").click(function(){
				$("#brandwidthMsg").empty();
				var value = $(this).val();
				Route.brandWidthSet=value;
				$("div.networkoption").each(function(i,div){
					if(!$(div).hasClass("network_" + value)) {
						$(div).addClass("hide");
					} else {
						$(div).removeClass("hide");
					}
				});
				Route.getFee();
			});
			
			if(!Route.newFormModal.countField) {
				Route.newFormModal.countField = new com.skyform.component.RangeInputField("#newRouteForm #routeCount",{
					defaultValue : 1,
					min : 1,
					max : 5, 
					textClass : 'text-large'
				}).render();
			}
			Route.newFormModal.countField.reset();
			com.skyform.component.utils.restrainInputFieldToMatchIntNumber("#route_instance_count");
			//路由创建的第二种方式时，查询出可用的公网宽带，并显示出来
			$("select.existed_brandwidth").empty();
			//更具资源池来选择查询带宽接口，原接口不动，如果是保定智慧城市则调用新的查询带宽接口。
			if(Route.booleanPool){
				//调用新开发的接口
				
				var params={
						dedLineId:$("#dedicatedLineSelect option:selected").val()//默认值
				};
				
				Route.listBindWidthInfo(params);
			}else{
				com.skyform.service.EipService.listAll(function(data){
					$(data).each(function(i,n){
						if(data[i].state=="running"){
							$("<option value='" + data[i].id + "'>" + data[i].instanceName+"</option>").appendTo($("select.existed_brandwidth"));
						}
					});
				},function(error){
					ErrorMgr.showError(error);
				});	
			}
			//如果选择新独享带宽，也需要根据资源池来判断是否调用其它新接口
					
		
		});
	},
	queryEnoughIPdedLine:function(params){
		com.skyform.service.Eip.queryEnoughIPdedLine(params,function(enough){
//			$("#createNew").attr("disabled","false");
			$("#createNew").removeAttr("disabled");
			$("#createNewMsg").empty();
		},function(error){
			$("#createNew").attr("disabled","true");
			$("#createNewMsg").empty().append("("+Dict.val("net_public_ip_not_create")+")");
		});
		
	},
	listBindWidthInfo:function(params){
//		var data=[{"id":"12312323","instanceName":"dd_12312323","state":"running"},
//		          {"id":"1255512323","instanceName":"dd_1255512323","state":"running"},
//		          {"id":"123123777","instanceName":"dd_12312777","state":"running"}]
//		$(data).each(function(i,n){
//			if(data[i].state=="running"){
//				$("<option value='" + data[i].id + "'>" + data[i].instanceName+"</option>").appendTo($("select.existed_brandwidth"));
//			}
//		});
		//查询专线下面的可用的公网带宽
		com.skyform.service.EipService.listBindWidthBydedLineId(params,function(data){
			Route.eipServiceData=data;
			
			var currDedLineId=parseInt($("#dedicatedLineSelect option:selected").val());
			$("select.existed_brandwidth").empty();
			$(Route.eipServiceData).each(function(i,n){
				if(Route.eipServiceData[i].state=="running"&&Route.eipServiceData[i].dedLineId==currDedLineId){
					$("<option value='" + Route.eipServiceData[i].id + "'>" + Route.eipServiceData[i].instanceName+"</option>").appendTo($("select.existed_brandwidth"));
				}
			});
			var params={
					"verifyFlag" : "0",
					"dedLineId":Route.dedLineParamVal
			};
			//专线ip查询,默认操作
			Route.queryEnoughIPdedLine(params);
			
		},function(error){
			ErrorMgr.showError(error);
		});
	},
	//add by yi 10.28
	createComfirm : function() {
		if(Route.brandWidthSet=="useExisted"){
			if($.trim($("select.existed_brandwidth").val())==""||$.trim($("select.existed_brandwidth").val())==null){
				$("#brandwidthMsg").empty().html(Dict.val("net_currently_no_selectable_bandwidth_create_bandwidth"));
				return;
			}
		}
		
 	   if($.trim($("#form_route_name").val())=="" || $.trim($("#form_route_name").val())==null){
 		   alert(Dict.val("net_new_route_name_not_empty"));
 		   return;
 	   }				        	   
 	   //新建路由名字不能包含特殊字符和空格
 	   var routeName = $.trim($("#form_route_name").val());
 	   var re1 = new RegExp(" ","g");
 	   var re2 = new RegExp("@","g");
 	   var re3 = new RegExp("#","g");
 	   var re4 = new RegExp("\\$","g");
 	   var re5 = new RegExp("%","g");
 	   var re6 = new RegExp("\\^","g");
 	   var re7 = new RegExp("&","g");
 	   var re8 = new RegExp("\\*","g");
 	   var re9 = new RegExp("~","g");
 	   var re10 = new RegExp("!","g");
 	   if((routeName.match(re1)!=null) || (routeName.match(re2)!=null) || 
 			   (routeName.match(re3)!=null) || (routeName.match(re4)!=null) || 
 			   (routeName.match(re5)!=null) || (routeName.match(re6)!=null) || 
 			   (routeName.match(re7)!=null) || (routeName.match(re8)!=null) || 
 			   (routeName.match(re9)!=null) || (routeName.match(re10)!=null)){
 		   alert(Dict.val("net_name_new_route_not_special_characters"));
 		   return;
 	   }
 	   //购买路由的时间(月数)，无论是按月还是按年，单位都是按月算，所以年的情况要乘以12
 	   var shijian;  //表示有多少月
 	   if("年" == $("#peridUnit").html()){
 		   shijian = Route.createPeridInput.getValue() * 12;
 	   }
 	   if("月" == $("#peridUnit").html()){
 		   shijian = Route.createPeridInput.getValue();
 	   }
 	   
 	  
 		  var params = {//无任何绑定创建路由的入参
 		 			period:shijian,
 		 			count:1,   
 		 			productList:[{
 		 			             	instanceName : $.trim($("#form_route_name").val()),
 		 			             	productId : product.productId
 		 						}]
 		 	   };
 		 	   var netCfg = $("input[type='radio'][name='networkoption']:checked").val();
 		 	   if(netCfg == 'useExisted') {
 		 		   params = {//绑定已有公网带宽创建路由的入参
 			        			period:shijian,
 			        			count:1,   
 			        			productList:[{
 			        			             	instanceName : $.trim($("#form_route_name").val()),
 			        			             	productId : product.productId,
 			        			             	eipId : $("select.existed_brandwidth").val()
 			        						}]
 			        	   };
 		 	   } else if (netCfg == 'createNew') {
 		 		   params = {//新申请公网带宽创建路由的入参
 			        			period:shijian,
 			        			count:1,   
 			        			productList:[{
 			        			             	instanceName : $.trim($("#form_route_name").val()),
 			        			             	productId : product.productId
 			        						},{
 			        			             	instanceName : "BW",
 			        			             	BAND_WIDTH : $("#createBandwidthSize").val(),
 			        			             	productId : ipJson.product.productId,
 			        			             	serviceType : CommonEnum.serviceType["route"]
 			        						}
 			        						]
 			        	   };
 		 	   }  
 		 	 //添加保定智慧城市请求参数,如果不是走原来的请求参数
 		 	   if(Route.booleanPool){
 		 		 params.productList[0].dedLineId=parseInt($("#dedicatedLineSelect option:selected").val());
 		 		 if(netCfg == 'createNew'){
 		 			 params.productList[1].dedLineId=parseInt($("#dedicatedLineSelect option:selected").val());
 		 		 }
 		 	   }
 	   Route._save(params);
	},
	_save : function(params) {
		var agentId = $("#agentId").val();
		var _fee = $("#feeInput").val();
		var newRouteForm = $("#newRouteForm");
		if (agentId && agentId.length > 0) {
			com.skyform.service.channelService
					.checkAgentCode(
							agentId,
							function(data) {
								if ("-3" == data) {
									$("#agentMsg").html(Dict.val("net_channel_discount_not_exist_please_re_enter"));
								} else if ("-2" == data || "-1" == data) {
									$("#agentMsg").html(Dict.val("net_channel_discount_expired_please_re_enter"));
								} else if("-6" == data){
									$("#agentMsg").html(Dict.val("common_coupons_reached_maximum_number"));
								} else if("-4" == data){
									$("#agentMsg").html(Dict.val("common_discount_code_authing"));
								} else if("-5" == data){
									$("#agentMsg").html(Dict.val("common_discount_code_unauthed"));
								} else if("-7" == data){
									$("#agentMsg").html(Dict.val("common_discount_code_noavailable"));
								}
								else {
									var channel = {
										"period" : 1,
										"count" : 1,
										"agentCouponCode" : "",
										"serviceType" : CommonEnum.serviceType["route"],
										"productList" : []
									};
									channel.agentCouponCode = agentId;
									channel.period = params.period;
									$(params.productList)
											.each(
													function(i, item) {
														var product = {
															"price" : 0,
															"productId" : "",
															"serviceType" : "",
															"productDesc" : {}
														}
														var itemFee = com.skyform.service.channelService
																.getProductFee();
														itemFee.period = params.period;

														// product.price = _fee;
														product.productId = item.productId;
														itemFee.productPropertyList[0].productId = item.productId;
														if (0 == i) {
															itemFee.productPropertyList[0].muProperty = "routerPrice";
															com.skyform.service.channelService
																	.getItemFee(
																			itemFee,
																			function(
																					data) {
																				product.price = data.fee
																						/ feeUnit;
																			});
															product.serviceType = CommonEnum.serviceType["route"];

														} else {
															itemFee.productPropertyList[0].muProperty = "BAND_WIDTH";
															itemFee.productPropertyList[0].muPropertyValue = item.BAND_WIDTH;
															com.skyform.service.channelService
																	.getItemFee(
																			itemFee,
																			function(
																					data) {
																				product.price = data.fee
																						/ feeUnit;
																			});
															product.serviceType = CommonEnum.serviceType["ip"];
														}
														product.productDesc = item;
														channel.productList[i] = product;

													});
									// .cpuNum = instance.productList[0].cpuNum;
									// channel.productList[0].productDesc.memorySize
									// = instance.productList[0].memorySize;
									// channel.productList[0].productDesc.OS =
									// instance.productList[0].OS;
									// channel.productList[0].productDesc.osDiskSize
									// = instance.productList[0].osDiskSize;
									// com.skyform.service.channelService.confirmChannelSubmit(channel,newRouteForm,
									// function onSuccess(data){
									// $.growlUI(Dict.val("common_tip"),
									// "订单已提交，请等待审核通过后完成支付！您可以在用户中心->消费记录中查看该订单信息。");
									// $("#newRouteForm").modal("hide");
									// // refresh
									// Route.refreshData();
									// },function onError(msg){
									// $.growlUI(Dict.val("common_tip"), "订单提交失败！");
									// $("#newRouteForm").modal("hide");
									// });

									com.skyform.service.channelService
											.channelSubmit(
													channel,
													function onSuccess(data) {
														// 订单提交成功后校验用户余额是否不足
														var _tradeId = data.tradeId;
														var disCountFee = data.fee;
														com.skyform.service.BillService
																.confirmTradeSubmit(
																		disCountFee,
																		_tradeId,
																		newRouteForm,
																		function onSuccess(
																				data) {
																			$
																					.growlUI(
																							Dict.val("common_tip"),
																							Dict.val("common_creating_application_submitted_successfully_please_patient"));
																			$(
																					"#newRouteForm")
																					.modal(
																							"hide");
																			// refresh
																			Route
																					.refreshData();
																		},
																		function onError(
																				msg) {
																			$(
																					"#newRouteForm")
																					.modal(
																							"hide");
																		});
													}, function onError(msg) {
														if(msg){
															$.growlUI(Dict.val("common_tip"),msg);
														}else {
															$.growlUI(Dict.val("common_tip"),
																	Dict.val("common_order_submission_failed"));
														}
														
														$("#newRouteForm")
																.modal("hide");
													});
								}
							});
		} else {
			Route.service.submit(params, function onSuccess(data) {
				// 订单提交成功后校验用户余额是否不足
				var _tradeId = data.tradeId;
				com.skyform.service.BillService.confirmTradeSubmit(_fee,
						_tradeId, newRouteForm, function onSuccess(data) {
							$.growlUI(Dict.val("common_tip"), Dict.val("common_creating_application_submitted_successfully_please_patient"));
							$("#newRouteForm").modal("hide");
							// refresh
							Route.refreshData();
						}, function onError(msg) {
							$("#newRouteForm").modal("hide");
						});
			}, function onError(msg) {
				$.growlUI(Dict.val("common_tip"), Dict.val("common_create_filing_failure") + msg);
				$("#newRouteForm").modal("hide");
			});
//			if(Route.booleanPool){
//				//调用专用接口
//				Route.service.dedLineSave(params, function onSuccess(data) {
//					// 订单提交成功后校验用户余额是否不足
//					var _tradeId = data.tradeId;
//					com.skyform.service.BillService.confirmTradeSubmit(_fee,
//							_tradeId, newRouteForm, function onSuccess(data) {
//								$.growlUI(Dict.val("common_tip"), "创建申请提交成功, 请耐心等待...");
//								$("#newRouteForm").modal("hide");
//								// refresh
//								Route.refreshData();
//							}, function onError(msg) {
//								$("#newRouteForm").modal("hide");
//							});
//				}, function onError(msg) {
//					$.growlUI(Dict.val("common_tip"), "创建申请提交失败：" + msg);
//					$("#newRouteForm").modal("hide");
//				});
//			}else{
//				
//			}
			
		}
	},

	getRouteNet : function(routeId) {// 路由子网关联资源的查询方法
		$("#routeNet").html("");
		com.skyform.service.vmService.listRelatedInstances(routeId, function(
				data) {
			var array = data;
			if (array == null || array.length == 0) {
				return;
			} else {
				$("#routeNet").empty();
				var dom = "";

				$(array).each(
						function(i) {
							var _resId = "";
							var _state = "";
							if (array[i].templateType == 9) {
								_resId = array[i].resId;
								_state = com.skyform.service.StateService
										.getState("route", array[i].state);

							}

							dom += "<li class=\"detail-item\">" + "<span>"
									+ array[i].id
									+ "</span>&nbsp;&nbsp;&nbsp;&nbsp;"
									+ "<span>"
									+ Route.switchType(array[i].templateType)
									+ "</span>&nbsp;&nbsp;&nbsp;&nbsp;"
									+ "<span>" + array[i].instanceName
									+ "</span>&nbsp;&nbsp;&nbsp;&nbsp;"
									+ "<span>" + _resId
									+ "</span>&nbsp;&nbsp;&nbsp;&nbsp;"
									+ "<span>" + _state + "</span>"
									// +"<button id='remove'
									// style='width:50px'>移除</button>"
									+ "</li>";
						});
				$("#routeNet").append(dom);
				// $("#remove").click(function(){
				// PrivateNetwork.removeFromPrivateNetwork();
				// })
			}
		});
	},
	// removeFromPrivateNetwork : function(routeId){
	// alert("hello world");
	// },
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
	service : com.skyform.service.routeService,
	renew : function() {
		var lbId = Route.selectedInstanceId;
		if (Route.renewModal) {

		} else {
			Route.renewModal = new com.skyform.component.Renew(
					lbId,
					{
						buttons : [
								{
									name : Dict.val("common_determine"),
									onClick : function() {
										var period = Route.renewModal
												.getPeriod().getValue();
										$("#renewModal").modal("hide");
										var _modal = $("#renewModal");
										com.skyform.service.renewService
												.renew(
														Route.selectedInstanceId,
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
																				// Route.updateDataTable();
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
										Route.renewModal.hide();
									}
								} ]
					});
		}
		Route.renewModal.getFee_renew(lbId);
		Route.renewModal.show();
		$(".subFee_renew").bind('mouseup keyup', function() {
			setTimeout('Route.renewModal.getFee_renew(' + lbId + ')', 100);
		});
	}

};

var NatCfg = {// 端口转发规则功能js模块
	rules : [],
	routeId : null,
	container : $("#natrule"),

	_getStateInfo : function(state) {
		var stateDict = {
			"opening" : Dict.val("common_ins_state_opening"),
			"success" : Dict.val("common_ins_state_expired"),
			"closed" : Dict.val("common_ins_state_stoped"),
			"failed" : Dict.val("common_ins_state_error"),
			"deleting" : Dict.val("common_ins_state_removing"),
			"9" : Dict.val("common_ins_state_running"),
			"4" : Dict.val("common_failure"),
			"0" : Dict.val("common_ins_state_opening")
		};
		return stateDict[state + ""] || "---";
	},

	id : 1,

	commonRules : [],

	getFormData : function(param) {
		$(this.rules).each(function(i, rule) {
			param["natrules.rules[" + i + "].name"] = rule.name;
			param["natrules.rules[" + i + "].sourcePort"] = rule.sourcePort;
			param["natrules.rules[" + i + "].protocol"] = rule.protocol;
		});

	},

	init : function(routeId, subnets) {// 初始化方法
		this.rules = [];
		this.routeId = routeId;
		this.container = $("#natrule");
		/**
		 * $("#nat_rule_targetIp").empty(); $(subnets).each(function(i,subnet){
		 * $("<option value='"+subnet.ipSegments+"'
		 * eInstanceId='"+subnet.networkId+"'>"+subnet.ipSegments+"("+
		 * subnet.name +")</option>").appendTo($("#nat_rule_targetIp")); });
		 */
		Route.initPublicIPSelect();
		this.container.find("tr[id != 'nat_formTr'][id != 'errorInfoRow']")
				.remove();
		Route.routePort = [];
		Route.routePortP = [];
		Route.service.listNatRulesByRoute(routeId, function(rules) {
			Route.exportRules = rules;
			$(rules).each(function(i, rule) {
				Route.routePort.push(rule.sourcePort);
				// nextline added by shixianzhi
				Route.routePortP.push(rule.sourcePort);
				NatCfg._addRule(rule);
				NatCfg.rules.push(rule);
			});
		}, function(error) {
			// TODO show error info in window
		});
		this.container.find(".btn-add").unbind().click(function() {
			NatCfg.addRule();
		});
		// added by shixianzhi 刷新规则列表
		this.container.find(".btn-refresh").unbind().click(function() {
			$("#errorInfoRow .text-error").empty();
			NatCfg.init(routeId);
		});
		// ///////////////////////////////////////////////
		// 点击导出按钮
		$("a#exportFirewall").unbind().click(function() {
			NatCfg.exportFirewall();
		});
		// 点击导入按钮
		$("a#importFirewall").unbind().click(function() {
			$("#upload_save").removeClass("disabled").attr("disabled", false);
			$("#uploadDiv").show();
		});
		// 点击上传按钮提交结果
		$("#upload_save").unbind("click").bind("click", function() {
			NatCfg.importFirewall();
		});
		// 点击取消按钮
		$("#upload_abort").unbind("click").bind("click", function() {
			NatCfg.resetUploadDiv();
		});
		// ///////////////////////////////////////////////
	},

	addRule : function() {// 添加按钮所对应的方法
		var name = $("#nat_rule_name").val() || "";
		var sourcePort = $("#nat_rule_sourcePort").val().replace(/[ ]/g, "");
		var protocol = $("#nat_rule_protocol").val();
		var targetIp = $("#nat_rule_targetIp").val().replace(/[ ]/g, "");
		var targetPort = $("#nat_rule_targetPort").val().replace(/[ ]/g, "");
		var publicip = $("#nat_public_ip").val();
		var self = this;

		var rule = {
			jsonStr : {
				"routeId" : self.routeId,
				"name" : name,
				"sourcePort" : sourcePort,
				"protocol" : protocol,
				"targetIp" : targetIp,
				"targetPort" : targetPort,
				"publicip" : publicip
			}
		};
		$("#errorInfoRow .text-error").empty();
		if (this.validate(rule.jsonStr)) {
			Route.service.addNatRule(rule, function(ruleInDB) {// 添加一条规则
				Route.service.listNatRulesByRoute(rule.jsonStr.routeId,
						function(rules) {
							NatCfg._addRule(rule.jsonStr);// 把添加的那条规则从数据库查出来并展示在页面上
							Route.goodRules = [];
							$(rules).each(function(i, rule) {
								if ("success" == rule.state) {
									Route.goodRules.push(rule);
								}
							});
						});
				Route.routePortP.push(sourcePort); // 此行应该在this.validate(rule)为真时才执行--by
													// shixianzhi
			}, function(error) {
				FormWindow.showError(error);
			});
		}
	},

	_addRule : function(rule) {
		this.rules.push(rule);
		var newRow = this._generateNewRule(rule);
		this._bindEventForBtns(newRow, rule);
		newRow.insertBefore($("#nat_formTr"));
		this._resetFromRow();
	},

	_generateNewRule : function(rule) {
		var newRow = $("<tr ruleId='" + rule.id + "' port='" + rule.sourcePort
				+ "'>" + this._generateContent(rule) + "</tr>");
		return newRow;
	},

	_generateContent : function(rule) {
		var _publicip = rule.publicip || "";
		var _sourcePort = rule.sourcePort||"";
		var _targetPort = rule.targetPort||"";
		var result = "" + "<td>" + rule.name + "</td>" + "<td>" + rule.protocol
				+ "</td>" + "<td>" + _publicip + "</td>" + "<td>"
				+ _sourcePort + "</td>" + "<td>" + rule.targetIp + "</td>"
				+ "<td>" + _targetPort + "</td>" + "<td>"
				+ NatCfg._getStateInfo(rule.state) + "</td>";
		if (rule.state == 'success' || rule.state == '9' || rule.state == '0') {
			result += "<td>&nbsp;<button class='btn btn-danger btn-del btn-mini'>"+Dict.val("common_remove")+"</button></td>";
		} else {
			result += "<td>--</td>";
		}
		return result;
	},

	_bindEventForBtns : function(row, rule) {
		row
				.find(".btn-modify")
				.click(
						function() {
							row
									.html("<td><input type='text' name='ruleName' value='"
											+ rule.name
											+ "'/></td>"
											+ "<td>"
											+ "<select name='ruleProtocol' class='select input-small'>"
											+ "<option value='udp'>UDP</option>"
											+ "<option value='tcp'>TCP</option>"
											+ "<option value='icmp'>ICMP</option>"
											+ "</select>"
											+ "</td>"
											+ "<td><input type='text' name='rulePort' class='input input-mini' value='"
											+ rule.sourcePort
											+ "'/></td>"
											+ "<td>"
											+ "<select name='targetIp' class='select'>"
											+ "<option value='192.168.1.1(QA)'>192.168.1.1(QA)</option>"
											+ "<option value='192.168.1.1(QA)'>192.168.1.2(DEV)</option>"
											+ "</select>"
											+ "</td>"
											+ "<td><input type='text' name='targetPort' class='input input-mini' value='"
											+ rule.targetPort
											+ "'/></td>"
											+ "<td colspan='2'> <button class='btn btn-primary btn-save'>保存</button></td>");

							row.find(".btn-save").click(function() {
								NatCfg.update(row);
							});

						});

		row.find(".btn-del").unbind().click(function() {
			NatCfg.deleteRule(rule.id);
		});
		$("#nat_rule_sourcePort").blur(function(){
			if (CommonEnum.userHttpRecord.length > 0) {
				if($("#nat_rule_sourcePort").val()==80 || $("#nat_rule_sourcePort").val()==443){
					$("#nat_rule_targetPort").addClass("disabled");
					$("#nat_rule_targetPort").attr("disabled", true);
					$("#nat_rule_targetPort").val($("#nat_rule_sourcePort").val());
				}else{
					$("#nat_rule_targetPort").removeClass("disabled").attr("disabled",false);
					$("#nat_rule_targetPort").val(""); 
				}
			} 
		});
	},

	_resetFromRow : function() {
		$("#nat_rule_name").val("");
		$("#nat_rule_sourcePort").val("");
		$("#nat_rule_protocol").val("");
		$("#nat_rule_targetIp").val("");
		$("#nat_rule_targetPort").val("");
	},

	deleteRule : function(id) {
		var self = this;
		self.container.find("tr[ruleId='" + id + "']").find(".btn-del").html(
				Dict.val("common_ins_state_removing"));
		var tr = self.container.find("tr[ruleId='" + id + "']")
		var port = tr.attr("port");
		// $(tr).each(function(){
		// port = ($(this).children('td').eq(2).html());
		// });
		$(NatCfg.rules).each(function(i, _rule) {
			if (_rule.id == id) {
				NatCfg.rules.splice(i, 1);
				return false;
			}
		});
		$(Route.routePort).each(function(i, _port) {
			if (port == _port) {
				Route.routePort.splice(i, 1);
				return false;
			}
		});
		$(Route.routePortP).each(function(i, _port) {
			if (port == _port) {
				Route.routePortP.splice(i, 1);
				return false;
			}
		});
		Route.service.deleteNatRule(id, function() {
			// self.container.find("tr[ruleId='"+id+"']").remove();
			$(Route.goodRules).each(function(i, rule) {
				if (rule.id == id) {
					Route.goodRules.splice(i, 1);
					return false;
				}
			});
		}, function(error) {
			ErrorMgr.showError(errro);
		});
	},

	update : function(newRow) {
		var id = newRow.attr("ruleId");
		var name = newRow.find("input[name='ruleName']").val();
		var sourcePort = newRow.find("input[name='rulePort']").val();
		var protocol = newRow.find("select[name='ruleProtocol']").val();
		var targetIp = newRow.find("select[name='targetIp']").val();
		var targetPort = newRow.find("input[name='targetPort']").val();

		var rule = {
			"id" : id,
			"name" : name,
			"sourcePort" : sourcePort,
			"protocol" : protocol,
			"targetIp" : targetIp,
			"targetPort" : targetPort
		};
		if (this.validate(rule)) {
			var self = this;

			$(this.rules).each(function(i, _rule) {
				if (_rule.id == rule.id) {
					_rule.name = rule.name;
					_rule.sourcePort = rule.sourcePort;
					_rule.protocol = rule.protocol;
					_rule.targetIp = rule.targetIp;
					_rule.targetPort = rule.targetPort;

					newRow.html(self._generateContent(rule));
					self._bindEventForBtns(newRow, rule);
					return false;
				}
			});
		}
	},
	// ////////////////////////////
	exportFirewall : function() {
		var data = JSON.stringify(Route.exportRules);
		$("#exportForm #param").val(data);
		window.open("", "newWin");
		$("#exportForm").submit();
	},
	importFirewall : function() {
		var _filename = $('#file2upload').val();
		if (!_filename) {
			$("#tipFile2upload").text(Dict.val("common_please_select_file"));
			return;
		} else {
			$("#tipFile2upload").text("");
		}
		var _extend = _filename.substring(_filename.lastIndexOf(".") + 1);
		var re = /^(xls)$/;
		var isValid = (_extend && re.test(_extend));
		if (!isValid) {
			$("#tipFile2upload").text(Dict.val("common_please_up_xls_file"));
			return;
		} else {
			$("#tipFile2upload").text("");
		}
		$("#upload_save").addClass("disabled");
		$("#upload_save").attr("disabled", true);
		var self = this;
		var routeId = self.routeId;
		var options = {
			data : {
				"routeId" : routeId
			},
			type : "POST",
			dataType : 'json',
			timeout : 1800000,
			success : function(rs) {
				$("#upload_save").removeClass("disabled").attr("disabled",
						false);
				NatCfg.resetUploadDiv(); // 点击上传按钮隐藏导入层
				if (null != rs && rs.code == 0) {
					$.growlUI(Dict.val("common_tip"), Dict.val("common_import_executed") + rs.msg);
				} else if (null != rs && rs.msg !== null) {
					$.growlUI(Dict.val("common_tip"), Dict.val("common_import_executed") + rs.msg);
				} else
					$.growlUI(Dict.val("common_tip"), Dict.val("common_import_failed_file_format_error"));
				// firewall.cfgFirewall(); //刷新弹出页面的数据
			},
			error : function() {
				$.growlUI(Dict.val("common_tip"), Dict.val("common_import_failed"));
			}
		};
		$("#uploadObjectForm").ajaxSubmit(options);
	},
	// ////////////////////////////
	validate : function(rule) {
		var self = this;
		var routeId = self.routeId;
		Route.goodRules = [];
		Route.service.listNatRules(routeId, function(rules) {
			Route.exportRules = rules;
			$(rules).each(function(i, rule) {
				if ("success" == rule.state || "opening" == rule.state) {
					Route.goodRules.push(rule);
				}
				NatCfg.rules.push(rule);
			});
		}, function(error) {
			// TODO show error info in window
		});

		var result = true;
		var nameValid = true;
		if ($.trim(rule.name + "").length == 0) {
			$("#nat_rule_name").css("border", "1px solid red");
			$("#nat_name_error").html(Dict.val("common_name_not_empty"));
			nameValid = false;
		} else {
			$("#nat_rule_name").removeAttr("style");
			$("#nat_name_error").html("");
		}
		var sourcePortValid = true;
		var sourcePortPort = true;
		var sourcePortPPort = true;
		var targetPortValid = true;
		if ("ip" != rule.protocol && "icmp" != rule.protocol) {
			if (!/^[1-9]+[0-9]*$/.test("" + rule.sourcePort)
					|| rule.sourcePort > 65535) {
				$("#nat_rule_sourcePort").css("border", "1px solid red");
				$("#nat_sourcePort_error").html(Dict.val("common_invalid_source_port_number"));
				sourcePortValid = false;
			} else if (rule.sourcePort == 80 || rule.sourcePort == 443) {
				// console.log('route.js');
				if (CommonEnum.userHttpRecord.length > 0) {
					$("#nat_rule_sourcePort").trigger("blur");
					
				} else {
					$("#nat_rule_sourcePort")
							.css("border", "1px solid red");
					$("#nat_sourcePort_error").html(
							Dict.val("common_record_information_websites"));
					sourcePortValid = false;
				}
				/*if (CommonEnum.offLineBill) {// 行业云不效验80,443
				} else {// 公有云效验80,443
					
					 * $("#nat_rule_sourcePort").css("border","1px solid red");
					 * $("#nat_sourcePort_error").html("该端口暂时不开放！");
					 * sourcePortValid = false;
					 
				}*/
			} else {
				$("#nat_rule_sourcePort").removeAttr("style");
				$("#nat_sourcePort_error").html("");
			}

			$(NatCfg.rules).each(
					function(i, item) {
						if (item.publicip == rule.publicip
								&& item.sourcePort == rule.sourcePort&& item.protocol == rule.protocol) {
							$("#nat_rule_sourcePort").css("border",
									"1px solid red");
							$("#nat_sourcePortRe_error").html(
									Dict.val("common_source_port") + rule.sourcePort + Dict.val("common_occupied"));
							sourcePortPort = false;
						}
					});
			// $(Route.routePort).each(function(i,_routePort) {
			// if(_routePort == rule.sourcePort){
			// $("#nat_rule_sourcePort").css("border","1px solid red");
			// $("#nat_sourcePortRe_error").html("源端口号"+ rule.sourcePort
			// +"已经被占用");
			// sourcePortPort = false;
			// }
			// });
			if (sourcePortPort) {
				$("#nat_rule_sourcePort").removeAttr("style");
				$("#nat_sourcePortRe_error").html("");
			}

			// $(Route.routePortP).each(function(i,_routePort) {
			// if(_routePort == rule.sourcePort){
			// $("#nat_rule_sourcePort").css("border","1px solid red");
			// $("#nat_sourcePortRe_error").html("源端口号"+ rule.sourcePort
			// +"已经被占用");
			// sourcePortPPort = false;
			// }
			// });
			// if (sourcePortPPort){
			// $("#nat_rule_sourcePort").removeAttr("style");
			// $("#nat_sourcePortRe_error").html("");
			// }

			if (!/^[1-9]+[0-9]*$/.test("" + rule.targetPort)
					|| rule.targetPort > 65535) {
				$("#nat_rule_targetPort").css("border", "1px solid red");
				$("#nat_targetPort_error").html(Dict.val("common_invalid_network_port_number"));
				targetPortValid = false;
			} else {
				$("#nat_rule_targetPort").removeAttr("style");
				$("#nat_targetPort_error").html("");
			}
		}

		var ipValid = true;
		// var _IPValidate = function(ip) {
		// return
		// /^([0-9]|[1-9][0-9]|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9][0-9]|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9][0-9]|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9][0-9]|1\d\d|2[0-4]\d|25[0-5])$/.test(ip);
		// };
		if (!_IPValidate($("#nat_rule_targetIp").val())) {
			$("#nat_rule_targetIp").css("border", "1px solid red");
			$("#nat_targetPort_error").html(Dict.val("common_invalid_ip"));
			ipValid = false;
		} else if (NatCfg.isIpExist($("#nat_rule_targetIp").val(),
				rule.protocol)) {
			$("#nat_rule_targetIp").css("border", "1px solid red");
			$("#nat_targetPort_error").html(Dict.val("common_network_IP_address_mapped"));
			ipValid = false;
		} else {
			$("#nat_rule_targetIp").removeAttr("style");
			$("#nat_targetPort_error").html("");
		}
		// 校验公网ip地址
		if (!_IPValidate($("#nat_public_ip").val())) {
			$("#nat_public_ip").css("border", "1px solid red");
			$("#nat_publicIp_error").html(Dict.val("common_invalid_public_IP_address"));
			ipValid = false;
		} else if (NatCfg.isIpExist($("#nat_public_ip").val(), rule.protocol)) {
			$("#nat_public_ip").css("border", "1px solid red");
			$("#nat_publicIp_error").html(Dict.val("common_public_IP_address_mapped"));
			ipValid = false;
		} else {
			$("#nat_public_ip").removeAttr("style");
			$("#nat_publicIp_error").html("");
		}

		result = nameValid && sourcePortValid && targetPortValid && ipValid
				&& sourcePortPort && sourcePortPPort;
		if (!result) {
			$("#nat_errorInfoRow").show();
		} else {
			$("#nat_errorInfoRow").hide();
		}
		return result;
	},
	resetUploadDiv : function() {
		$("#uploadDiv").hide();
		$("#file2upload").val("");
		$("#tipFile2upload").empty();
	},
	isIpExist : function(ip, protocol) {
		var ret = false;
		if (Route.goodRules) {
			$(Route.goodRules).each(function(i, item) {
				if ("ip" == protocol) {
					if (item.publicip == ip) {
						ret = true;
						return false;
					}
					if (item.targetIp == ip) {
						ret = true;
						return false;
					}
				} else {
					if ("icmp" == protocol && item.protocol == protocol) {
						if (item.publicip == ip) {
							ret = true;
							return false;
						}
					}
					if (("ip" == item.protocol) && item.publicip == ip) {
						ret = true;
						return false;
					}
					if (("ip" == item.protocol) && item.targetIp == ip) {
						ret = true;
						return false;
					}
				}
			});
		}
		return ret;
	}
};
