window.currentInstanceType='multiCard';
window.Controller = {
	init : function(){
		multiNIC.init();
	},
	refresh : function(){
		multiNIC.refresh();
	}
};
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
var multiNIC = {
	createNetModal:null,
	dataVMtable:new com.skyform.component.DataTable(),
	dataVMtableId:null,
	datatable:null,
	selectedVMId:null,
	addNetModal:null,
	ipSegments:null,
	currentCardName:null,
	instances:null,
	updateSecurityModal:null,
	service : com.skyform.service.multiCardService,
	securityId:null,
	netType:0,
	netTypeVal:null,
	netTypeFlagSelect:null,
	bandWidthModal:null,
	limitrate:null,
	netTypeFlag:true,
	ipcontroalFlag:false,
	createPeridInput:null,
	currBindWithMax:0,
	bindWithLimitVal:[],
	status:{
		"running":Dict.val("common_ins_state_running"),
		"opening":Dict.val("common_ins_state_opening"),
		"deleted":Dict.val("common_already_destroy"),
		"attached":Dict.val("common_already_mounting"),
		"detached":Dict.val("common_already_solutions_hanging"),
		"attaching":Dict.val("common_ins_state_attaching"),
		"bind error":Dict.val("common_binding_device_error")
	},
	currentCardId:null,
	init : function() {
		multiNIC.refresh();
		this.checkSelected();
	},
	refresh:function(){
		var params={};
		params.targetPage=1;
		params.rowCount=5;
		multiNIC.service.listNetWorkCards(params, function(data) {
			if(data){
				multiNIC.instances = data;
				multiNIC.renderDataTable();
			}
		},function onError(error){
			$.growlUI(Dict.val("common_tip"), Dict.val("common_query_error")+error);
		});

	},
	btnQuery:function(){
		var params={};
		params.targetPage=1;
		params.rowCount=5;
		if($("#queryName").val() !=""&&$("#queryName").val() !=null){
			params.queryName = $("#queryName").val();
		}
		multiNIC.service.listNetWorkCards(params, function(data) {
			if(data){
				multiNIC.instances = data;
				multiNIC.renderDataTable();
			}
		},function onError(error){
			$.growlUI(Dict.val("common_tip"), Dict.val("common_query_error")+error);
		});

	},
	renderDataTable:function(){
		if(multiNIC.datatable == null){
			multiNIC.initDataTable(multiNIC.instances);
		}else{
			multiNIC.updateDataTable();
		}
		//multiNIC.checkSelected();
	},
	updateDataTable : function(){
		//multiNIC.datatable.updateData(multiNIC.instances);
		var pageInfo = {
			"totalPage" : multiNIC.instances.totalPage,
			"currentPage" : 1,
			"data" : multiNIC.instances.data,
			"_TOTAL_" : multiNIC.instances.totalRecord,
			"pageSize" : multiNIC.instances.rowCount
		};
		multiNIC.datatable.setPaginateInfo(pageInfo);
	},
	_query : function(condition, callback) {
		multiNIC.service.listNetWorkCards(condition, function(result) {
			multiNIC.instances = result;
			if (callback && typeof callback == 'function')
				callback(result);
		}, function onError(error) {
			$.growlUI(Dict.val("common_tip"), Dict.val("common_query_error")+error);
		});
	},
	_getQueryCondition : function() {
		var condition = {};
		if($("#queryName").val() !=""&&$("#queryName").val() !=null){
			condition.queryName = $("#queryName").val();
		}
		condition['targetPage'] = 1;
		return condition;
	},
	initDataTable:function(data){
		multiNIC.datatable = new com.skyform.component.DataTable();
		multiNIC.datatable.renderByData("#multiTable", {
			    'selfPaginate' : true,
				"onColumnRender" : function(columnIndex,columnMetaData,columnData) {
					 var text = columnData[''+columnMetaData.name] || "";
					 if(columnIndex ==0) {
							 text = '<input type="checkbox" name="muid" value="'+text+'">';
					 }
					 if (columnMetaData.name == "status") {
						 text =com.skyform.service.StateService.commonState[columnData.status];
					 }
					 if (columnMetaData.name == "limitrate") {
						 var tepText=columnData.limitrate;
						 if(tepText&&tepText!="0"){
							 text=tepText+"M";
						 }else{
							 text="";
						 }
						// text = tepText.length>0&&"0"!=tepText?tepText+"M":"";
					 }
					 if (columnMetaData.name == "networkCardType") {
						 text=(columnData.netType=="2")?"存储网卡":"默认网卡";
					 }
					 if (columnMetaData.name == "networkCardName") {
						 var tmp = columnData.networkCardName;
						 var t ="";
						 if(tmp&&tmp.length > 10){
							t = "<span title='"+columnData.networkCardName+"'>"+tmp.substring(0,10)+"....</span>";
						 }else{
							t = columnData.networkCardName;
						 }
						 text = t
						  +"<a title="+Dict.val("common_advice")+" href='../user/workOrder.jsp?code=workOrder&cataCode=service&instanceId="+columnData.id+"&serviceType=netcard&instanceName="+encodeURIComponent(columnData.networkCardName)+
						  "&instanceStatus="+columnData.status+
						  "&currentPoolW="+encodeURIComponent(CommonEnum.pools[CommonEnum.currentPool])+
						  "'><i class='icon-comments' ></i></a>";
				       }
					 if(columnMetaData.name == "createTime"){
						 if(columnData.createTime){
								var ct = eval('(' + "{Date: new Date("
										+ columnData.createTime + ")}"
										+ ')');
								var requisitionSubmitTime = ct["Date"];
								text = requisitionSubmitTime.format('yyyy-MM-dd hh:mm:ss');
							}else{
								text = "";
							}
					 }
					 return text;
				},
				"afterRowRender" : function(rowIndex,data,tr){
					tr.attr("currentCardId",data.id);
					tr.attr("instanceId",data.id);
					tr.attr("currentCardStatus",data.status);
					tr.attr("currentCardName",data.networkCardName);
					tr.attr("securityId",data.securityId);
					tr.attr("limitrate",data.limitrate);
					tr.attr("netType",data.netType);
					tr.find("input[type='checkbox']").click(function(){
						multiNIC.limitrate = $("#multiTable input[type='checkbox']:checked").eq(0).closest("tr").attr("limitrate");
						multiNIC.currentCardId = $("#multiTable input[type='checkbox']:checked").eq(0).closest("tr").attr("currentCardId");
						multiNIC.currentCardName = $("#multiTable input[type='checkbox']:checked").eq(0).closest("tr").attr("currentCardName");
						multiNIC.securityId = $("#multiTable input[type='checkbox']:checked").eq(0).closest("tr").attr("securityId");
						multiNIC.checkSelected();
						multiNIC.showInstanceInfo(multiNIC.currentCardId);
			        });
				},
				"pageInfo" : {
					"totalPage" : data.totalPage,
					"currentPage" : 1,
					"data" : data.data,
					"_TOTAL_" : data.totalRecord,
					"pageSize" : data.rowCount
				},
				"onPaginate" : function(targetPage) {
					var condition = multiNIC._getQueryCondition();
					//var condition = {};
					condition.targetPage = targetPage;
					condition.rowCount=5;
					multiNIC._query(condition, function(result) {
						if(result.length==0)	return;
						//multiNIC.instances = result;
						var pageInfo = {
							"totalPage" : result.totalPage,
							"currentPage" : targetPage,
							"data" : result.data,
							"_TOTAL_" : result.totalRecord,
							"pageSize" : result.rowCount
						};
						multiNIC.datatable.setPaginateInfo(pageInfo);
					});
				},
				afterTableRender : function() {
					multiNIC.bindEvent();
					if(multiNIC.instances.length > 0){
						var id = $("#multiTable input[type='checkbox']").eq(0).closest("tr").attr("currentCardId");
						multiNIC.showInstanceInfo(id);
					}
				}
		});
		multiNIC.datatable.addToobarButton("#toolbar4tb2");
		multiNIC.datatable.enableColumnHideAndShow("right");
	},

	checkSelected:function(){
		$(".operation").addClass("disabled");
		var selectBox = $("#multiTable input[type='checkbox']:checked");
		var oneSelected  = selectBox.length == 1;
		var hasSelected = selectBox.length >= 1;
		var checkBox = $("#multiTable input[type='checkbox']:checked").eq(0);
		var booleanPool = false;
		$(Config.k_pool.split(",")).each(function(index, item){
			if(item.trim()==CommonEnum.currentPool){
				booleanPool = true;
				return;
			}
		});
		var currentCardStatus = $("#multiTable input[type='checkbox']:checked").eq(0).closest("tr").attr("currentCardStatus");
		multiNIC.netTypeVal=$("#multiTable input[type='checkbox']:checked").eq(0).closest("tr").attr("nettype");
		if(multiNIC.netTypeVal=="2"){
			multiNIC.netTypeFlagSelect=true;
		}else{
			multiNIC.netTypeFlagSelect=false;
		}
		var params={};
		params.subId=parseInt(multiNIC.currentCardId);
		multiNIC.service.checkNetworkCardLimit(params,function(result){
			multiNIC.bindWithLimitVal=result||[];
			if(result.length==0){
				$("li[action='bandWidthSpeedLimit']").addClass("disabled");
				$("li[action='bandWidthSpeedLimit']").unbind();
			}else{
				$("li[action='bandWidthSpeedLimit']").removeClass("disabled");
				$("li[action='bandWidthSpeedLimit']").bind("click",function(){
					multiNIC._invokeAction("bandWidthSpeedLimit");
				});
			}
		});

		$(".operation").each(function(index,operation){
			var condition = $(operation).attr("condition");
			var action = $(operation).attr("action");

			var enabled = true;
			eval("enabled=("+condition+")");

			if(multiNIC.netTypeFlagSelect){
				if("bingSecurityNetwork"==action){
					enabled=false;
				}
			}
			if(0==multiNIC.bindWithLimitVal.length&&"bandWidthSpeedLimit"==action){
				enabled=false;
			}
			if(enabled) {
				$(operation).removeClass("disabled");
				$(operation).unbind("click").click(function(){
					multiNIC._invokeAction(action);
					//imageManagement.onOptionSelected(action||"");
				});
			} else {
				$(operation).addClass("disabled");
				$(operation).unbind();
			}
			if(!booleanPool){
				if("bandWidthSpeedLimit"==action){
					$(this).attr("style","display:none");
				}
			}
		});
	},
	showInstanceInfo : function(id) {
		if (id==null) return;
		$("div#details span.detail_value").each(function(i,item){
			var prop = $(this).attr("prop");
			$(this).html("" + instanceInfo[""+prop]);
		});
		multiNIC.appendCardRelation(id);
		$("#opt_logs").empty();
		com.skyform.service.LogService.describeLogsUIInfo(id);
	},
	appendCardRelation:function(id) {
		$("#cardRelations").html("");
		com.skyform.service.vmService.listRelatedInstances(id,function(data){
			var array = data;
			if(array == null || array.length == 0) {
				return;
			}else{
				$("#cardRelations").empty();
				var dom = "";

				$(array).each(function(i) {
					var _state = com.skyform.service.StateService.commonState[array[i].state];
					if(array[i].templateType==1){
						_state = com.skyform.service.StateService.getState("vm",array[i].state);
					}
					dom += "<li class=\"detail-item\">"
							+"<span>"+array[i].id+"</span>&nbsp;&nbsp;&nbsp;&nbsp;"
							+"<span>"+multiNIC.switchType(array[i].templateType)+"</span>&nbsp;&nbsp;&nbsp;&nbsp;"
							+"<span>"+array[i].instanceName+"</span>&nbsp;&nbsp;&nbsp;&nbsp;"
							+"<span>"+_state+"</span>"
							+"</li>";
				});
				$("#cardRelations").append(dom);
			}
		});
	},
	switchType : function (type){
		switch(type){
			case 1 : return Dict.val("common_vm");
			case 2 : return Dict.val("common_virtual_disk");
			case 3 : return Dict.val("common_minicomputer");
			case 4 : return Dict.val("common_cloud_backup");
			case 5 : return Dict.val("common_cloud_monitor");
			case 6 : return Dict.val("common_load_balanc");
			case 7 : return Dict.val("nic_sg");
			case 8 : return Dict.val("common_bandwidth");
			case 9 : return Dict.val("common_internet_access");
			case 10 : return Dict.val("common_physical_machine");
			case 11 : return Dict.val("common_obs");
			case 12 : return Dict.val("common_volume");
			case 13 : return Dict.val("common_unknown");
			case 14 : return "Paas";
			case 16 : return "route";
			case 17 : return Dict.val("vm_private_network");
			default : return Dict.val("common_unknown");
		}
	},
	deleteNetWorkCard:function(){
		var confirmModal = new com.skyform.component.Modal(
				new Date().getTime(), Dict.val("common_destroy"), "<h4>"+Dict.val("nic_do_you_destroy_nic")+"</h4>", {
					buttons : [
						{
							name : Dict.val("common_determine"),
							onClick : function() {
								var condition = {
									"listIds":parseInt(multiNIC.currentCardId)+""
								};
								multiNIC.service.deleCard(condition,function(data){
									confirmModal.hide();
									multiNIC.refresh();
								},function(error){
									$.growlUI(Dict.val("common_tip"), error);
									confirmModal.hide();
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
	freeNetWorkCard:function(){
		var confirmModal = new com.skyform.component.Modal(
				new Date().getTime(), Dict.val("nic_uninstall"), "<h4>"+Dict.val("nic_do_you_uninstall_nic")+"</h4>", {
					buttons : [
						{
							name : Dict.val("common_determine"),
							onClick : function() {
								var condition = {
									"subscriptionId":parseInt(multiNIC.currentCardId)
								};
								multiNIC.service.freeNetWorkCard(condition,function(data){
									confirmModal.hide();
									multiNIC.refresh();
								},function(error){
									$.growlUI(Dict.val("common_tip"), error);
									confirmModal.hide();
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
	//带宽限速
	bandWidthSpeedLimit:function(){
		if(!multiNIC.bandWidthModal){
			var _id=new Date().getTime();
			multiNIC.bandWidthModal = new com.skyform.component.Modal(
					""+_id,
					Dict.val("nic_broadband_speed"),
					$("script#bandWith_list").html(),
					{
						buttons : [
							{
								name : Dict.val("common_determine"),
								onClick : function() {
									var aaTesta=multiNIC.createPeridInput.getValue()||0;

									var bindNet = {
										"subId":parseInt(multiNIC.currentCardId),
										"limitRate":""+aaTesta
									};
									if(multiNIC.limitrate==null||multiNIC.limitrate==0){
										multiNIC.service.limitNetworkCardsRate(bindNet,function(result){
											multiNIC.bandWidthModal.hide();
											multiNIC.refresh();
										},function(error){
											multiNIC.bandWidthModal.hide();
											$.growlUI(Dict.val("common_error"),Dict.val("nic_broadband_speed_create_error") + error);
										});
									}else{
										multiNIC.service.modifyLimitNetworkCardsRate(bindNet,function(result){
											multiNIC.bandWidthModal.hide();
											multiNIC.refresh();
										},function(error){
											multiNIC.bandWidthModal.hide();
											$.growlUI(Dict.val("common_error"),Dict.val("nic_broadband_speed_modify_error") + error);
										});
									}
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
									multiNIC.bandWidthModal.hide();
								}
							} ],
						beforeShow:function(){
							if(multiNIC.limitrate==null){
								$("#widthtotal").text(Dict.val("common_wu"));
							}else{
								$("#widthtotal").text(multiNIC.limitrate);
							}

							multiNIC.createPeridInput = null;
							if (multiNIC.createPeridInput == null) {
								var container = $("#perid").empty();
								var sum=0;
								var params={};
								params.subId=parseInt(multiNIC.currentCardId);
								multiNIC.service.checkNetworkCardLimit(params,function(result){
									if(result&&result.length>0)
										$.each(result,function(key,value){
											sum+=value.bandTx;
										});
									$("#maxlimitedBDVal").empty().html(sum);
									multiNIC.currBindWithMax=parseInt(sum);
									var max = multiNIC.currBindWithMax;
									multiNIC.createPeridInput = new com.skyform.component.RangeInputField(container, {
										min : 0,
										defaultValue : 0,
										max:max,
										maxlength:"3",
										textStyle : "width:28px"
									}).render();
									multiNIC.createPeridInput.reset();
								},function(error){

								});
							}
						},
						afterShow:function(){
							$($("#perid").find("button")[1]).bind("click",function(){
								var ss=multiNIC.currBindWithMax-0;
								$("#maxlimitedBDVal").empty().html(ss);
							});
							$($("#perid").find("button")[0]).bind("click",function(){
								var ss=multiNIC.currBindWithMax-0;
								$("#maxlimitedBDVal").empty().html(ss);
							});
						}
					});
		}
		multiNIC.bandWidthModal.setWidth(350).autoAlign();
		multiNIC.bandWidthModal.show();
		//$("#widthtotal").html('aaa');
		/*
		 var total=parseInt($("#widthtotal").html());
		 $("#perid button").eq(0).click(function(){


		 $("#widthtotal").html(total-multiNIC.createPeridInput.getValue());
		 });

		 $("#perid button").eq(1).click(function(){
		 //var total=parseInt($("#widthtotal").html());
		 $("#widthtotal").html(total-multiNIC.createPeridInput.getValue());
		 });
		 */
	},

	bingSecurityNetwork:function(){
		if(multiNIC.updateSecurityModal == null){
			var _id=new Date().getTime();
			multiNIC.updateSecurityModal = new com.skyform.component.Modal(
					""+_id,
					Dict.val("fw_modify_sg"),
					$("script#bingSecurityGroupScript").html(),
					{
						buttons : [
							{
								name : Dict.val("common_determine"),
								onClick : function() {
									var security = $("#updateSecurity_select").val();
									if(security.length == 0){
										$("#updateSecurityMsg").text(Dict.val("fw_please_select_sg"));
										return
									}else{
										$("#updateSecurityMsg").text("");
									}
									var condition = {
										"vmId":parseInt(multiNIC.currentCardId),
										"newSecurityGroupId":parseInt(security),
										"oldSecurityGroupId":parseInt(multiNIC.securityId)
									};
									multiNIC.service.bingSecurityNetwork(condition,function(result){
										multiNIC.updateSecurityModal.hide();
										multiNIC.refresh();
									},function(error){
										multiNIC.updateSecurityModal.hide();
										$.growlUI(Dict.val("common_error"), error);
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
									multiNIC.updateSecurityModal.hide();
								}
							} ],
						afterShow : function(){

						},
						beforeShow:function(){
							$("#seNetworkName").val(multiNIC.currentCardName);
							multiNIC.service.listSecurities(function(result){

								var sg = multiNIC.getSecurityUse(result);
								$("#updateSecurity_select").empty();
								$("#updateSecurity_select").append("<option value=''>"+Dict.val("fw_please_select_sg")+"</option>");
								$(sg).each(function(index,item){
									if((item.subServiceStatus == "running"||item.subServiceStatus=="using") && item.isDefault!=1){
										$("#updateSecurity_select").append("<option value='"+
												item.subscriptionId+"'>"+
												item.subscriptionName+
												"</option>");
									}
								});
							},function(error){
								multiNIC.updateSecurityModal.hide();
								$.growlUI(Dict.val("common_error"), error);
							});
						}

					});
		}

		multiNIC.updateSecurityModal.show();
	},
	bindEvent:function(){
		if (!multiNIC.contextMenu) {
			multiNIC.contextMenu = new ContextMenu( {
				beforeShow : function(tr) {
					// Route.checkAll(false);
					// 取消所有选中的行，选中当前的行
					$("#multiTable input[type='checkbox']").attr("checked", false);
					tr.find("input[type='checkbox']").attr("checked", true);

					multiNIC.currentCardId = tr.attr("currentCardId");
					multiNIC.currentCardName = tr.attr("currentCardName");
					multiNIC.securityId = tr.attr("securityId");
					multiNIC.limitrate = tr.attr("limitrate");
					multiNIC.netTypeVal=tr.attr("nettype");

					multiNIC.checkSelected();
					multiNIC.showInstanceInfo(multiNIC.currentCardId);
				},
				afterShow : function(tr) {

				},
				trigger : "#multiTable tr",
				onAction : function(action) {
					multiNIC._invokeAction(action);
				}
			});
		} else {
			multiNIC.contextMenu.reset();
		}

	},
	// 更多操作 的 invoke
	_invokeAction : function(action) {
		if(multiNIC.netTypeFlagSelect){

		}
		var invoker = multiNIC["" + action];
		if (invoker && typeof invoker == 'function') {
			invoker();
		}
	},
	bingNetworkCard : function() {
		var _id=new Date().getTime();
		multiNIC.addNetModal = new com.skyform.component.Modal(
				""+_id,
				Dict.val("nic_mounting"),
				$("script#vm_list").html(),
				{
					buttons : [
						{
							name : Dict.val("common_determine"),
							onClick : function() {
								var checkRadio = $("#"+multiNIC.dataVMtableId).find("input[type='radio']:checked");
								if(checkRadio.length == 0){
									$("#errorVMMsg").text(Dict.val("nic_please_select_mounting_vm"));
									return
								}
								var bindNet = {
									"subscriptionId":parseInt(multiNIC.currentCardId),
									"hostIds":""+multiNIC.selectedVMId
								};
								multiNIC.service.bingNetWorkCard(bindNet,function(result){
									multiNIC.addNetModal.hide();
									multiNIC.refresh();
								},function(error){
									multiNIC.addNetModal.hide();
									$.growlUI(Dict.val("common_error"),Dict.val("nic_mounting_failure") + error);
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
								multiNIC.addNetModal.hide();
							}
						} ],
					afterShow : function(){
						multiNIC.service.listVM(function(result){
							multiNIC.renderVMDataTable(result);
						},function(){
							multiNIC.addNetModal.hide();
							$.growlUI(Dict.val("common_error"),Dict.val("nic_get_vm_failure") + errorMsg);
						})

					},
					beforeShow:function(){
						$("#errorVMMsg").text("");
						$("#vm_instance_list").attr("id","vm_instance_list"+_id);
						multiNIC.dataVMtableId = "vm_instance_list"+_id;
					}
				});
		multiNIC.addNetModal.show();
	},

	renderVMDataTable:function(instances){
		var data = multiNIC.getVMUsingList(instances);
		multiNIC.dataVMtable.renderByData(
            "#"+ multiNIC.dataVMtableId,// 要渲染的table所在的jQuery选择器
            {
                "data" : data, // 要渲染的数据选择器
                "pageSize" : 5,
                "onColumnRender" : function(columnIndex,columnMetaData, columnData) {
                    if(columnMetaData.name=='id') {
                        return '<input type="radio" name="VMSelect" id="' + columnData.id + '" value="'+columnData.id+'">';
                    } else if ("instancename" == columnMetaData.name) {
                        return columnData.instanceName;
                    }
                    return columnData[columnMetaData.name];
                },
                "afterRowRender" : function(rowIndex, data, tr) {
                    tr.find("input[type='radio']").click(function(){
                        multiNIC.selectedVMId = data.id;
                    });
                }
            }
		);
	},
	getVMUsingList:function(instances){
		var data = [];
		$(instances).each(function(index,item){
			var flag = multiNIC.getStatusVM(item.state);
			if(flag){
				data.push(item);
			}
		});
		return data;
	},
	getStatusVM:function(status){
		var statusVM = ["running","closed"];//TODO:什么状态下的虚机可以绑定网卡
		var flag = false;
		$(statusVM).each(function(index,item){
			if(item == status){
				flag = true;
				return false;
			}
		});
		return flag;
	},
	createNetWorkCard:function(){
		var params={"vmId":14170542};
//		com.skyform.service.multiCardService.describeCloudAntivirusLogs(params,function(data){
//			console.log(data);
//
//		},function(error){
//			console.log(error);
//		});
		if(multiNIC.createNetModal == null){
			var _id=new Date().getTime();
			multiNIC.createNetModal = new com.skyform.component.Modal(
					""+_id,
					Dict.val("nic_create"),
					$("script#createNetModal").html(),
					{
						buttons : [
							{
								name : Dict.val("common_determine"),
								onClick : function() {
									if(multiNIC.netTypeFlag){
										multiNIC.saveNetWorkCard(multiNIC.createNetModal);
									}else{
										multiNIC.saveStorgeNetWorkCard(multiNIC.createNetModal);
									}
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
									multiNIC.createNetModal.hide();
								}
							} ],
						afterShow : function(){
						},
						beforeShow:function(){
							var pool1=$("#pool").val().trim();
							var pool2=Config.storgeNetCardPool.trim();
							if(-1<pool2.indexOf(pool1)){
								$("#storgeServiceType").show();
							}else{
								$("#storgeServiceType").hide();
							}
							$("#netWorkNameMsg").text("");
							$("#subNetCreateMsg").text("");
							$("#IPCreateMsg").text("");
							$("#msgSpan").text("");
							$(".msgSpanClass").addClass("hide");
							$("#storgeServiceType").bind("click",function(){
								multiNIC.netTypeFlag=false;
								multiNIC.netType=$("#storgeServiceType").attr("value");
								$("#flagNetCurr").hide();
							});
							$("#privateIP").unbind().bind("keyup",function(){
								var privateIP=$("#privateIP").val().trim().split(".");
								if(privateIP.length==4){
									if(parseInt(privateIP[3])==3||parseInt(privateIP[3])==2){
										$("#IPCreateMsg").addClass("onError");
										$("#IPCreateMsg").text("此ip不可用，请重新输入");
										multiNIC.ipcontroalFlag=true;
									}else{
										$("#IPCreateMsg").text("");
										$("#IPCreateMsg").removeClass("onError");
									}
								}else{
									multiNIC.ipcontroalFlag=false;

//						   					if($("#subNet_select option:selected").val()){
//
//
//
//							   					multiNIC.service.checkIP({"ipaddress":$("#privateIP").val(),"networkid":parseInt($("#subNet_select option:selected").val()),"verifyFlag":"0"},function(result){
//								   			        $("#IPCreateMsg").text("");
//								   			        $("#IPCreateMsg").removeClass("onError");
//								   			     },function(error){
//								   			    	 $("#IPCreateMsg").addClass("onError");
//								   			    	$("#IPCreateMsg").text(Dict.val("common_ip_has_been_occuprrect"));
//								   		      });
//
//							   				}else{
//							   					return;
//							   				}
								}
							});
							$("#baseServiceType").bind("click",function(){
								multiNIC.netTypeFlag=true;
								multiNIC.netType=$("#baseServiceType").attr("value");
								$("#flagNetCurr").show();
							});
							multiNIC.showSubNetAndSecurity(multiNIC.createNetModal);
						}
					});
		}
		multiNIC.createNetModal.show();
	},
	showSubNetAndSecurity:function(modal){
		multiNIC.service.listSubNet(function(reslut){
			var sbs = multiNIC.getSubnetUse(reslut);
			$("#subNet_select").empty();
			$("#subNet_select").append("<option value='' ipSegments=''>"+Dict.val("nic_select_subnet")+"</option>");
			$(sbs).each(function(index,item){
				var option = "<option cidr='"+item.cidr+"' value='"+item.id;
				if(item.ipSegments){
					option +="' ipSegments='"+item.ipSegments
				}
				option +="' ipGateway='"+item.ipGateway+"'>"+item.name+"</option>";
				$("#subNet_select").append(option);
			});
			$("#subNet_select").bind("change",function(){
				multiNIC.ipSegments = $("#subNet_select").find("option:selected").eq(0).attr("ipSegments");
				var cidr = $("#subNet_select").find("option:selected").attr("cidr");
				if(multiNIC.ipSegments&&multiNIC.ipSegments != "-"){
					$(".msgSpanClass").removeClass("hide");
					$("#msgSpan").text(Dict.val("nic_pelase_at")+multiNIC.ipSegments+Dict.val("nic_choose_between"));
				}else if(cidr){
					var obj = cidrToRangeByObject(cidr);
					var ip1 = obj.ip1[0];
					var ip2 = obj.ip1[0] == "10"?(obj.ip2[0]==obj.ip2[1]?obj.ip2[0]:(obj.ip2[0]+"~"+obj.ip2[1])):(obj.ip2[0]);
					var ip3 = obj.ip3[0]==obj.ip3[1]?obj.ip3[0]:(obj.ip3[0]+"~"+obj.ip3[1]);
					var ip4 = obj.ip4[0]==obj.ip4[1]?obj.ip4[0]:(obj.ip4[0]+"~"+obj.ip4[1]);
					var range = ip1+" . "+ip2+" . "+ip3+" . "+ip4;
					$(".msgSpanClass").removeClass("hide");
					$("#msgSpan").text(Dict.val("nic_pelase_at")+range+Dict.val("nic_choose_between"));
				}else{
					$("#msgSpan").text("");
					$(".msgSpanClass").addClass("hide");
				}
			});

		},function(error){
			modal.hide();
			$.growlUI(Dict.val("common_error"), error);
		});

		multiNIC.service.listSecurities(function(result){
			var sg = multiNIC.getSecurityUse(result);
			$("#security_select").empty();
			$("#security_select").append("<option value=''>"+Dict.val("fw_please_select_sg")+"</option>");
			$(sg).each(function(index,item){
				if(item.subServiceStatus == "running"||item.subServiceStatus=="using"){
					$("#security_select").append("<option value='"+
							item.subscriptionId+"'>"+
							item.subscriptionName+
							"</option>");
				}
			});
		},function(error){
			modal.hide();
			$.growlUI(Dict.val("common_error"), errorMsg);
		});
	},
	getSecurityUse:function(securityGroups){
		var status = ["opening","create error"];
		var arr = [];
		$(securityGroups).each(function(index,item){
			var flag = true;
			$(status).each(function(y,s){
				if(item.subServiceStatus == s){
					flag = false;
					return false;
				}
			});
			if(flag){
				arr.push(item);
			}
		});
		return arr;
	},
	getSubnetUse:function(subnets){
		var status = ["opening","error","deleting"];
		var arr = [];
		$(subnets).each(function(index,item){
			var flag = true;
			$(status).each(function(y,s){
				if(item.state.indexOf(s) >= 0){
					flag = false;
					return false;
				}
			});
			if(flag){
				arr.push(item);
			}
		});
		return arr;
	},
	saveStorgeNetWorkCard:function(modal){
		var netWorkName = $("#netWorkName").val();
		var ipGateway=$("#subNet_select").find("option:selected").attr("ipGateway");
		if(netWorkName.length == 0){
			$("#netWorkNameMsg").text(Dict.val("nic_name_can_not_be_empty"));
			return
		}else{
			$("#netWorkNameMsg").text("");
		}
//		var subnet = $("#subNet_select").val();
//		if(subnet.length == 0){
//			 $("#subNetCreateMsg").text(Dict.val("nic_select_subnet"));
//			 return
//		}else{
//			 $("#subNetCreateMsg").text("");
//		}
//		var ip = $("#privateIP").val();
//	    if(ip.length == 0){
//	    	 $("#IPCreateMsg").text(Dict.val("common_ip_not_empty"));
//	    	 return
//	    }else{
//	    	 $("#IPCreateMsg").text("");
//	    }
//
//	    if(ip == ipGateway){
//	    	 $("#IPCreateMsg").text(Dict.val("common_ip_has_been_occupied_gateway"));
//	    	 return
//	    }else{
//	    	 $("#IPCreateMsg").text("");
//	    }
//
//	    if(!valiter.isIp(ip)){
//	    	 $("#IPCreateMsg").text(Dict.val("common_ip_format_is_incorrect"));
//	    	 return
//	    }else{
//	    	 $("#IPCreateMsg").text("");
//	    }
		/*
		 var arr = multiNIC.ipSegments.split("-");
		 var startIPArr= arr[0].split(".");
		 var endIPArr = arr[1].split(".");
		 var ipArr = ip.split('.');
		 if(multiNIC.ipSegments != "-"&&multiNIC.ipSegments){
		 if(ipArr[0]==startIPArr[0]&&ipArr[1]==startIPArr[1]&&ipArr[2] == startIPArr[2]
		 && parseInt(ipArr[3]) >= parseInt(startIPArr[3]) && parseInt(ipArr[3]) <= parseInt(endIPArr[3])){
		 $("#IPCreateMsg").text("");
		 }else{
		 $("#IPCreateMsg").text("填写IP有误");
		 return
		 }
		 }
		 */
//	    var cidr = $("#subNet_select").find("option:selected").attr("cidr");
//	    if(cidr&&cidr!="undefined"){
//	    	if(checkIpInCIDR(ip,cidr)){
//		    	 $("#IPCreateMsg").text("");
//		    }else{
//		    	 $("#IPCreateMsg").text(Dict.val("common_fill_in_iP_incorrect"));
//		    	 return
//		    }
//	    }
//	    var security = $("#security_select").val();
//	    if(security.length == 0){
//			 $("#securityCreateMsg").text(Dict.val("fw_please_select_sg"));
//			 return
//		}else{
//			 $("#securityCreateMsg").text("");
//		}
		$("#IPCreateMsg").removeClass("onError");
//	    if(multiNIC.ipcontroalFlag){
//	    	return
//	    }
//	    	multiNIC.service.checkIP({"ipaddress":$("#privateIP").val(),"networkid":parseInt(subnet),"verifyFlag":"0"},function(result){
//		        $("#IPCreateMsg").text("");
//		        $("#IPCreateMsg").removeClass("onError");
//		     },function(error){
//		    	 $("#IPCreateMsg").addClass("onError");
//		    	$("#IPCreateMsg").text(Dict.val("common_ip_has_been_occuprrect"));
//	      });

		var lengthError = $(".onError").length;
		if(lengthError == 0){
			var nameAndPool={
				customerId:parseInt(Config.defaultName),
				pool:CommonEnum.currentPool
			};
			var pools={
				customerId:parseInt(Config.defaultName),
				pool:CommonEnum.currentPool
			};
			com.skyform.service.privateNetService.queryNetByNameAndPool(nameAndPool,function(data){
				var subStorgeNet=(data.length==0)?"0":data.networkId;
				modal.hide();
				multiNIC.refresh();
				$.growlUI("网卡创建","存储网卡创建中...");
				com.skyform.service.privateNetService.getStoredSubNetIP(pools,function(data){
					var subStorgeIp=data.avalibleIp;
					var securityId="";
					var lastCreateDate=new Date();
					var securityFlag=false;
					var params3={
						"serviceType":1010,
						"pool":CommonEnum.currentPool
					};
					com.skyform.service.multiCardService.getStorgeNetCard(params3,function(result){
						if(null==result){
							securityFlag=true;
							$.growlUI("默认安全组出错，请联系管理员");
						}else{
							securityId=result.subscriptionId;
							securityFlag=false;
						}
						if(securityFlag){
							return
						}
						var netWorkCard = {
							"period":9999,
							"count":1,
							"productList":
									[{"name":netWorkName,
										"networkid":subStorgeNet,
										"ipaddress":subStorgeIp,
										"productId":80211,
										"instanceName":netWorkName,
										"securitygroupid":securityId,
										"nettype":parseInt(multiNIC.netType)
									}]
						};
						multiNIC.service.saveStorgeNetWorkCard(netWorkCard,function(result){
							$.growlUI("网卡创建", "网卡创建成功");
							multiNIC.refresh();
						},function(error){
							modal.hide();
							$.growlUI(Dict.val("common_error"), error);
						});
					},function(error){});
				},function(){});
			},function(data){});
		}
	},
	saveNetWorkCard:function(modal){
		var netWorkName = $("#netWorkName").val();
		var ipGateway=$("#subNet_select").find("option:selected").attr("ipGateway");
		if(netWorkName.length == 0){
			$("#netWorkNameMsg").text(Dict.val("nic_name_can_not_be_empty"));
			return
		}else{
			$("#netWorkNameMsg").text("");
		}
		var subnet = $("#subNet_select").val();
		if(subnet.length == 0){
			$("#subNetCreateMsg").text(Dict.val("nic_select_subnet"));
			return;
		}else{
			$("#subNetCreateMsg").text("");
		}
		var ip = $("#privateIP").val();
		if(ip.length == 0){
			$("#IPCreateMsg").text(Dict.val("common_ip_not_empty"));
			return;
		}else{
			$("#IPCreateMsg").text("");
		}
		var ip2 = $("#privateIP").val().trim().split(".");
		if(ip2.length == 4){
			if(parseInt(ip2[3])==3||parseInt(ip2[3])==2){
				$("#IPCreateMsg").text("此ip不可用，请重新输入");
				return;
			}
		}else{
			$("#IPCreateMsg").text("");
		}
		if(ip == ipGateway){
			$("#IPCreateMsg").text(Dict.val("common_ip_has_been_occupied_gateway"));
			return
		}else{
			$("#IPCreateMsg").text("");
		}
		if(!valiter.isIp(ip)){
			$("#IPCreateMsg").text(Dict.val("common_ip_format_is_incorrect"));
			return
		}else{
			$("#IPCreateMsg").text("");
		}
		var cidr = $("#subNet_select").find("option:selected").attr("cidr");
		if(cidr&&cidr!="undefined"){
			if(checkIpInCIDR(ip,cidr)){
				$("#IPCreateMsg").text("");
			}else{
				$("#IPCreateMsg").text(Dict.val("common_fill_in_iP_incorrect"));
				return;
			}
		}
		var security = $("#security_select").val();
		if(security.length == 0){
			$("#securityCreateMsg").text(Dict.val("fw_please_select_sg"));
			return;
		}else{
			$("#securityCreateMsg").text("");
		}
		$("#IPCreateMsg").removeClass("onError");
		multiNIC.service.checkIP({"ipaddress":$("#privateIP").val(),"networkid":parseInt(subnet),"verifyFlag":"0"},function(result){
			$("#IPCreateMsg").text("");
			$("#IPCreateMsg").removeClass("onError");
		},function(error){
			$("#IPCreateMsg").addClass("onError");
			$("#IPCreateMsg").text(Dict.val("common_ip_has_been_occuprrect"));
		});
		var lengthError = $(".onError").length;
		if(lengthError == 0){
			var netWorkCard = {
				"period":9999,
				"count":1,
				"productList":
                    [{"name":netWorkName,
                        "networkid":subnet,
                        "ipaddress":ip,
                        "productId":80211,
                        "instanceName":netWorkName,
                        "securitygroupid":security,
                        "nettype":parseInt(multiNIC.netType)
                    }]
			};
			multiNIC.service.saveNetWorkCard(netWorkCard,function(result){
				modal.hide();
				multiNIC.refresh();
			},function(error){
				modal.hide();
				$.growlUI(Dict.val("common_error"), error);
			});
		}
	}
};