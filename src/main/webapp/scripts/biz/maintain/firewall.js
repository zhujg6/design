window.currentInstanceType='securityGroup';
window.Controller = {
		init : function(){
			firewall.init();
			FireWallCfg.init();
		},
		refresh : function(){
			firewall.querySG();			
		}
	}

var ContextMenu = function(options){
	var _options = {
		container : options.container || $("#contextMenu"),
		onAction : options.onAction || function(action){},
		trigger  : options.trigger || $("body"),
		beforeShow : options.beforeShow || function(){},
		afterShow : options.afterShow || function(){},
		beforeHide : options.beforeHide || function(){},
		afterHide : options.afterHide || function() {}
	};
	
	
	this.setTrigger = function(trigger) {
		_options.trigger = trigger;
		_init();
	};
	
	this.reset = function(){
		_init();
	};
	this.inMenu = false;
	
	var _init = function(){
		_options.container = $(_options.container);
		_options.container.hide();
		$(_options.trigger).unbind("mousedown").bind("mousedown",function(e) {
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
				_options.container.attr(
						"style",
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
		_options.container.find("li").unbind("mousedown").bind('mousedown', function(e) {
			_options.container.hide();
			if (!$(this).hasClass("disabled")){
				var action = $(this).attr("action");
				if(action) _options.onAction(action);
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



var firewall = {
		data:[],
		datatable : null,
		arraylist : null,
		contextMenu: null,
		selectedId:null,
		selectedName:null,	
		updateFirewallModal:null,
		copyFirewallModal:null,
		service: com.skyform.service.FirewallService,
		groupQuota:10,
		groupTotal:0,
		customerIdent :null,
		VMIpsTable:null,
		showVMIPsModal:null,
		refreshAndCfgFirewall:"",
		defaultSG:0,
		init : function() {	
			//firewall.queryCustIdent();
			com.skyform.service.vmService.getDefaultSG(function(result){
				if(result){
					firewall.defaultSG = result.subscriptionId;
				}
			});
			
			
			firewall.querySG();			
			$("#refresh").unbind().bind("click",function(){
				window.currentInstanceType='securityGroup';
				firewall.querySG();	
			});
			
		
			
			$("#createFirewallBtn").bind("click",function(){
				firewall.createFirewall();
			});
//			
//			$("#updateFirewallMenu").bind("click",function(){
//				firewall.createFirewall();
//			});
			
			$("#checkAll").bind("click",function(){
				if ($("#checkAll")[0].checked)
				{
					//选中
					//如果已经选择某行，不用循环判断，直接清除列表。
					arraylist = new Array();
					var obj = $("#firewallTable").find("input[type='checkbox']").each(function(){
						$(this)[0].checked = true;
					});
					$("#firewallTable tbody tr").each(function(i,tr){
							var obj = new Object;
							obj.appid = $(tr).attr("id");
							obj.state = $(tr).attr("name");
							arraylist.push(obj);
							//alert($(tr).attr("appid"));
					});
				}
				else
				{
					var obj = $("#firewallTable").find("input[type='checkbox']").each(function(){
						$(this)[0].checked = false;
					});
					arraylist = new Array();
				}
				firewall.changeBtnState();
			});
			
//			$("#updateFirewallBtn").addClass("disabled");
//			//$("#updateFirewallBtn").unbind();
//			$("#updateFirewallMenu").addClass("disabled");
//			$("#sendToBtn").addClass("disabled");
//			//$("#sendToBtn").unbind();
//			$("#sendToMenu").addClass("disabled");
//			$("#deleteFirewallBtn").addClass("disabled");
//			//$("#deleteFirewallBtn").unbind();
//			$("#deleteFirewallMenu").addClass("disabled");
			
		},
		
		queryCustIdent:function(){
			com.skyform.service.vmService.queryCustIdent(function(data){
				//customerType:1个人2企业3大客户 ； identStatus:1待审2通过3驳回4缺资料； qualification:1未申请2申请
				//data.qualification = 2;
				//data.customerType = 3;
				firewall.customerIdent = data;
				firewall.customerIdent.authentication = false;
				if(firewall.customerIdent.identStatus==2){
					firewall.customerIdent.authentication = true;
				}
				
			})
		},
		//停止虚拟机，刷新防火墙
		refreshFirewall : function(sgId){
			AutoUpdater.stop();
			AutoUpdater.parentid = sgId;
			window.currentInstanceType='firewall';
			AutoUpdater.start();
		},
		querySG:function(){
			if(firewall.datatable) firewall.datatable.container.find("tbody").html("<tr ><td colspan='7' style='text-align:center;'><img src='"+CONTEXT_PATH+"/images/loader.gif'/><strong>"+Dict.val("common_retrieving_data_please_wait")+"</strong></td></tr>");
			firewall.service.querySG(function(data){
				var datas = [];
				var pool1=$("#pool").val().trim();
				var pool2=Config.securityGroupPool.trim();
				if(pool2.indexOf(pool1) > -1){
					$(data).each(function(index, item){
						if(item.isDefault!=1){
							datas.push(item);
						}
					});
				} else {
					datas = data;
				}
				firewall.generateTable(datas);
				firewall.checkSelected();//初始化按钮置灰
			})
		},
		//表格
		generateTable : function(data){
			if(firewall.datatable){
				firewall.datatable.updateData(data);
				return;
			}
			firewall.data = data;
			firewall.datatable = new com.skyform.component.DataTable(),
			firewall.datatable.renderByData("#firewallTable", {
				"data" : data,
				"pageSize" : 5,
				"onColumnRender" : function(columnIndex,columnMetaData,columnData) {
					 var text = columnData[''+columnMetaData.name] || "";
					 if(columnMetaData.name=='id') {
						 text = '<input type="checkbox" value="'+columnData['subscriptionId']+'">';
					 }
					 else if (columnMetaData.name == "ID") {
						 text = columnData['subscriptionId'];
					 }
					 else if (columnMetaData.name == "instanceName") {
						 text = columnData['subscriptionName']+"<a title="+Dict.val("common_advice")+" href='../user/workOrder.jsp?code=workOrder&cataCode=service&instanceId="+columnData['subscriptionId']+"&serviceType=security&instanceName="+encodeURIComponent(columnData['subscriptionName'])+
						  "&instanceStatus="+columnData.subServiceStatus+
						  "&currentPoolW="+encodeURIComponent(CommonEnum.pools[CommonEnum.currentPool])+
						  "'><i class='icon-comments' ></i></a>";
					 }
					 else if (columnMetaData.name == "state") {
						 if("bind error"==columnData.subServiceStatus||"using"== columnData.subServiceStatus){
							 columnData.subServiceStatus = "running";
						 }
						 text = com.skyform.service.StateService.getState("",columnData.subServiceStatus || columnData);						 
					 }			 
					 else if (columnMetaData.name == "descrInfo") {
						 text = "";
					 }
					 else if ("createDate" == columnMetaData.name) {
							try {
								var obj = eval('(' + "{Date: new Date("
										+ columnData.createDate + ")}"
										+ ')');
								var dateValue = obj["Date"];
								text = dateValue
										.format('yyyy-MM-dd hh:mm:ss');
							} catch (e) {

							}
						}else if ("expireDate" == columnMetaData.name) {
							try {
								var obj = eval('(' + "{Date: new Date("
										+ columnData.inactiveDate + ")}"
										+ ')');
								var dateValue = obj["Date"];
								text = dateValue
										.format('yyyy-MM-dd hh:mm:ss');
							} catch (e) {

							}
							
						}
					 return text;
				}, 
				"afterRowRender" : function(rowIndex,data,tr){
					tr.attr("instanceId",data.subscriptionId);
					tr.attr("instanceState",data.subServiceStatus);
					tr.attr("instanceName",data.subscriptionName);
					if(firewall.defaultSG == data.subscriptionId){
						data.isUser = "1";
					}
					tr.attr("isUsed",data.isUsed);
					tr.find("input[type='checkbox']").click(function(){						
						firewall.onInstanceSelected(); 
			        });
					tr.click(function(){						
						firewall.showDetails(data); 
			        });
					if(0 == rowIndex){
						tr.click();
					}			
					
				},
				"afterTableRender" : function() {
					firewall._afterDtTableRender();
					//nas.bindEvent();
				}
		});		 
			firewall.datatable.addToobarButton("#toolbar4tbl");
			firewall.datatable.enableColumnHideAndShow("right");
		},
		
		onInstanceSelected : function(selectInstance){
			var allCheckedBox = $("#firewallTable tbody input[type='checkbox']:checked");
			var rightClicked = selectInstance?true:false;
			var state = $(allCheckedBox[0]).parents("tr").attr("instanceState");
			var isUsed = $(allCheckedBox[0]).parents("tr").attr("isUsed");
			
			firewall.selectedId = $(allCheckedBox[0]).parents("tr").attr("instanceId");
			firewall.selectedName = $(allCheckedBox[0]).parents("tr").attr("instanceName");
			
			if(selectInstance) {
				state = selectInstance.state;
				isUsed = selectInstance.isUsed;
			}
			var oneSelected = allCheckedBox.length == 1;
			var hasSelected = allCheckedBox.length > 0;

			$(".operation").addClass("disabled");
			$(".operation").each(function(index,operation){
				var condition = $(operation).attr("condition");
				var action = $(operation).attr("action");
				var enabled = true;
				eval("enabled=("+condition+")");
				if(enabled) {
					$(operation).removeClass("disabled");
				} else {
					$(operation).addClass("disabled");
				}
				firewall._bindAction();
			});
			//右键的时候
			if(rightClicked) {
				firewall.instanceName = selectInstance.instanceName;
				firewall.selectedInstanceId = selectInstance.id;
				firewall.publicIp = selectInstance.publicIp;
			} else {
				for ( var i = 0; i < allCheckedBox.length; i++) {
					var currentCheckBox = $(allCheckedBox[i]);
					if (i == 0) {
						firewall.instanceName = currentCheckBox.parents("tr").attr("name");
						firewall.selectedInstanceId = currentCheckBox.attr("instanceId");
					} else {
						firewall.instanceName += "," + currentCheckBox.parents("tr").attr("name");
						firewall.selectedInstanceId += "," + currentCheckBox.attr("instanceId");
					}
				}
			}
		},
		showDetails : function(instance){
			$("#ruleTbody").empty();	
			  if(!firewall.data || firewall.data.length < 1) return;
			  if(!instance) {
				  instance = firewall.data[0];
			  }
			  var sgId = instance.subscriptionId;
			  firewall.service.queryRuleBySG(sgId,function(group){
				  $.each(group.securityGroupRules,function(i,rule){					  	
						var newRow = firewall._generateNewRule(rule);
						newRow.appendTo ($("#ruleTbody"));
					});	
			  })
			  $("#opt_logs").empty();
			  com.skyform.service.LogService.describeLogsUIInfo(String(sgId));
			},
		_bindAction : function(){
			$("#toolbar4tbl .operation").unbind().click(function(){
				if($(this).hasClass("disabled")) return;
				var action = $(this).attr("action");
				firewall._invokeAction(action);				
			});
		},
		
		_invokeAction : function(action){
			var invoker = firewall["" + action];
			if(invoker && typeof invoker == 'function') {
				invoker();
			}
		},
		_generateNewRule : function(rule) {
			var newRow = $(
					"<tr ruleId='" + rule.id + "'>"+
						firewall._generateContent(rule) +
					"</tr>"		
			);
			return newRow;
		},
		_generateContent : function(rule) {
			rule.state = rule.securityGroupRuleStatus;
			var html = ""+
			"<td>" + rule.name + "</td>" + 
			"<td>" + (rule.port!=null?rule.port : "" ) + "</td>" + 
			"<td>" + (null!=rule.ip&&rule.ip.length>0?rule.ip : "" ) + "</td>" + 
			"<td>" + rule.protocol + "</td>" + 
			"<td>" + firewall.switchDirection(rule.direction) + "</td>" 
			if (rule.state)
			{
				//if (true)	
				if (rule.state == 9)
				{
					html += "<td id='"+rule.securityGroupRuleId+"'>"+Dict.val("common_normal")+"</td>"; 
				}
				else if (rule.state == 0)
				{
					html += "<td>"+Dict.val("common_processing")+"</td>";
				}
				else
				{
					//html += "<td>失败<button class='btn btn-danger btn-del btn-mini' ruleId='"+rule.securityGroupRuleId+"'>删除</button></td>";
					html += "<td>"+Dict.val("common_failure")+"</td>";
				}
			}
			else
			{
				html += "<td>"+Dict.val("common_processing")+"</td>";
			}
			return html;
		},	
		switchDirection : function(direction){
			switch (direction){
				case "ingress" : return Dict.val("common_ingress");
				case "egress" : return Dict.val("common_egress");
				default : return Dict.val("common_ingress");
			}
		},
		downRuleTable : function (data){
			firewall.datatable.renderByData("#downRuleTable", {
				"data" : data,
				"columnDefs" : [
				     {title : "<input type='checkbox' id='checkAll'>", name : "id"},
				     {title : Dict.val("common_name"), name : "name"},
				     {title : Dict.val("common_priority"), name : "level"},
				     {title : Dict.val("common_protocol"), name : "treaty"},
				     {title : Dict.val("common_behavior"), name : "action"},
				     {title : Dict.val("common_start_port"), name : "startPort"},
				     {title : Dict.val("common_end_port"), name : "endPort"},
				     {title : Dict.val("common_source"), name : "ip"}
				     
				],
				"bPaginate" : false,
				"bInfo" : false,
				"bFilter" : false,
				"onColumnRender" : function(columnIndex,columnMetaData,columnData) {
					 var text = columnData[''+columnMetaData.name] || "";
					 if(columnIndex ==0) {
						 text = '<input type="checkbox" value="'+text+'">';
					 }
					 if (columnMetaData.title == "ID") {
						 text = "<a href='javascript:firewall.detail11(\""+columnData['id']+"\",\""+columnData['createDate']+"\")'>" + text + "</a>";
					 }
					 if (columnMetaData.name == "createDate") {
						 text = new Date(text).toLocaleString();
					 }
					 return text;
				}, 
				"afterRowRender" : function(rowIndex,data,tr){
					//tr.attr("state", data.state).attr("comment", data.comment);
					//tr.attr("ownUserId", data.ownUserId);
				},
				"afterTableRender" : function() {
					//nas.bindEvent();
				}
		});
		},
		upRuleTable : function (data){			
			firewall.datatable.renderByData("#upRuleTable", {
				"data" : data,
				"columnDefs" : [
				     {title : "<input type='checkbox' id='checkAll'>", name : "id"},
				     {title : Dict.val("common_name"), name : "name"},
				     {title : Dict.val("common_priority"), name : "level"},
				     {title : Dict.val("common_protocol"), name : "treaty"},
				     {title : Dict.val("common_behavior"), name : "action"},
				     {title : Dict.val("common_start_port"), name : "startPort"},
				     {title : Dict.val("common_end_port"), name : "endPort"},
				     {title : Dict.val("common_source"), name : "ip"}
				     
				],
				"bPaginate" : false,
				"bInfo" : false,
				"bFilter" : false,
				"onColumnRender" : function(columnIndex,columnMetaData,columnData) {
					 var text = columnData[''+columnMetaData.name] || "";
					 if(columnIndex ==0) {
						 text = '<input type="checkbox" value="'+text+'">';
					 }
					 if (columnMetaData.title == "ID") {
						 text = "<a href='javascript:firewall.detail11(\""+columnData['id']+"\",\""+columnData['createDate']+"\")'>" + text + "</a>";
					 }
					 if (columnMetaData.name == "createDate") {
						 text = new Date(text).toLocaleString();
					 }
					 return text;
				}, 
				"afterRowRender" : function(rowIndex,data,tr){
					//tr.attr("state", data.state).attr("comment", data.comment);
					//tr.attr("ownUserId", data.ownUserId);
				},
				"afterTableRender" : function() {
					//nas.bindEvent();
				}
			});
		},
		changeBtnState : function(){
			if (arraylist.length == 0)
			{
				$("#updateFirewallBtn").addClass("disabled");
	 			$("#updateFirewallBtn").unbind();
	 			$("#updateFirewallMenu").addClass("disabled");
				$("#deleteFirewallBtn").addClass("disabled");
				$("#deleteFirewallBtn").unbind();
				$("#deleteFirewallMenu").addClass("disabled");
				$("#deleteFirewallMenu").unbind();
			}
			else if (arraylist.length == 1)
	 		{
	 			$("#updateFirewallBtn").removeClass("disabled");
	 			$("#updateFirewallMenu").removeClass("disabled");
				$("#deleteFirewallBtn").removeClass("disabled");
				$("#deleteFirewallMenu").removeClass("disabled");
	 		}
	 		else
	 		{
	 			$("#updateFirewallBtn").addClass("disabled");
	 			$("#updateFirewallBtn").unbind();
	 			$("#updateFirewallMenu").addClass("disabled");
				$("#deleteFirewallBtn").removeClass("disabled");
				$("#deleteFirewallMenu").removeClass("disabled");
				
	 		}
		},
		checkAll : function(check){
			if(check) $("#firewallTable tbody input[type='checkbox']").attr("checked",true);
			else $("#firewallTable tbody input[type='checkbox']").removeAttr("checked");
			firewall.onInstanceSelected(false);
		},
		_afterDtTableRender : function (){
			var check = $("#checkAll").unbind("click").click(function(e){
				e.stopPropagation();
				var check = $(this).attr("checked");
				firewall.checkAll(check);
			});
			if(!firewall.contextMenu) {
				firewall.contextMenu = new ContextMenu({
					beforeShow : function(tr){
						firewall.checkAll(false);
						tr.find("input[type='checkbox']").attr("checked",true);
					},
					afterShow : function(tr) {
						firewall.onInstanceSelected({
							instanceName : tr.attr("instanceName"),
							id : tr.attr("instanceId"),
							state : tr.attr("instanceState"),
							isUsed : tr.attr("isUsed")
						});
					},
					trigger : "#firewallTable tr",
					onAction:function(action){
						firewall._invokeAction(action);
					}
				});
			} else {
				firewall.contextMenu.reset();
			}
		},
		createFirewall : function (){
//			暂时取消上限控制 --update by CQ 20150303
//			if(firewall.groupTotal >= firewall.groupQuota){
//				$.growlUI("提示", "您已经超过最大上限"+firewall.groupQuota+"，不能再创建新的安全组！");
//				return;
//			}
			FireWallCfg.init();			
			$("#createFirewallModal").off("show").on('show',function(){	
				$("#createFirewallModal #firewallName").val("");
				var _modal = $("#createFirewallModal");
				$("#createFirewallModal .btn-primary").unbind().click(function(){
					var instanceName = $("#firewallName").val().trim();
//					$(PrivateNetwork.privateNetName).each(function(i,_netName) {
//						if(_netName == instanceName){
//							$("#tip_name").empty().html("* 该安全组名称已经被使用！");
//							isNetIP = false;
//							//return;
//						}
//					});
					if(instanceName != ''&&instanceName.length>0) {
						var scoreReg = /^[\u4E00-\u9FA0A-Za-z\-0-9\_]+$/;
						if(! scoreReg.exec(instanceName) ) {
							//result.msg = "请填写不包括非法字符的实例名称";
							$("#tip_name").empty().html(Dict.val("common_name_no_illegal_char"));
							isNetIP = false;
							return;
						}
					}
					var instance = firewall.getInstance();	
					$('#createFirewallModal').modal('hide');
					firewall.service.saveSG(instance, function onSuccess(data){
						//$("#createFirewallModal .btn-primary").unbind();
						$.growlUI(Dict.val("common_tip"), Dict.val("common_application_submit"));							
						firewall.querySG();													
					},function onError(msg){
						$('#createFirewallModal').modal('hide');
						$.growlUI(Dict.val("common_tip"), Dict.val("fw_application_sg_failed"));
					});
				});
			});
			$("#createFirewallModal").modal('show');
		},		
		updateFirewall : function (){
			//点击创建路由所执行的函数，开始
			if(!firewall.updateFirewallModal){
				firewall.updateFirewallModal = new com.skyform.component.Modal(new Date().getTime(),"<h3>"+Dict.val("fw_modify_sg")+"</h3>",$("script#update_form").html(),{
					buttons : [
					           {name:Dict.val("common_determine"),onClick:function(){
					        		var instanceName = $("#updateName").val().trim();
									if(instanceName != ''&&instanceName.length>0) {
										var scoreReg = /^[\u4E00-\u9FA0A-Za-z\-0-9\_]+$/;
										if(! scoreReg.exec(instanceName) ) {
											//result.msg = "请填写不包括非法字符的实例名称";
											$("#tip_updateName").empty().html(Dict.val("common_name_no_illegal_char"));
											isNetIP = false;
											return;
										}
									}
									var instance = {
										"subscriptionId":parseInt(firewall.selectedId),
										"subscripName":instanceName,
										"busiCode":"SecurityGroup.SubName.Mod"
									}					
									firewall.service.updateSG(instance, function onSuccess(data){
										//$("#updateFirewallModal .btn-primary").hide();
										firewall.updateFirewallModal.hide();
										$.growlUI(Dict.val("common_tip"), Dict.val("common_modify_success"));							
										firewall.querySG();													
									},function onError(msg){
										firewall.updateFirewallModal.hide();
										$.growlUI(Dict.val("common_tip"), Dict.val("common_modify_filed"));
									});
					        	   
					           },attrs:[{name:'class',value:'btn btn-primary'}]},
					           
					           {name:Dict.val("common_cancel"),onClick:function(){
					        	   firewall.updateFirewallModal.hide();
					           },attrs:[{name:'class',value:'btn'}]}
					           ],
					
					beforeShow : function(){
						var allCheckedBox = $("#firewallTable tbody input[type='checkbox']:checked");
						$("#updateName").val($(allCheckedBox[0]).parents("tr").attr("instanceName"));
					}
				});
			} 
			firewall.updateFirewallModal.autoAlign().setTop(100).show();
		
		},
		copyFirewall:function(){
//			暂时取消上限控制 --update by CQ 20150303
//			if(firewall.groupTotal >= firewall.groupQuota){
//				$.growlUI("提示", "您已经超过最大上限"+firewall.groupQuota+"，不能再创建新的安全组！");
//				return;
//			}
			//点击创建路由所执行的函数，开始
			var rule = [];
			if(!firewall.copyFirewallModal){
				firewall.copyFirewallModal = new com.skyform.component.Modal(new Date().getTime(),"<h3>"+Dict.val("fw_copy_sg")+"</h3>",$("script#copy_form").html(),{
					buttons : [
					           {name:Dict.val("common_determine"),onClick:function(){
					        		var instanceName = $("#copyName").val().trim();
									if(instanceName != ''&&instanceName.length>0) {
										var scoreReg = /^[\u4E00-\u9FA0A-Za-z\-0-9\_]+$/;
										if(! scoreReg.exec(instanceName) ) {
											//result.msg = "请填写不包括非法字符的实例名称";
											$("#tip_copyName").empty().html(Dict.val("common_name_no_illegal_char"));
											isNetIP = false;
											return;
										}
									}
									var instance = {
											  "period": 9999,
											  "count": 1,
											  "productList": [
											    {
											      "instanceName": instanceName,
											      "productId": 9000	,
											      "firewallRules":rule
											    }
											  ]
											};				
									firewall.service.saveSG(instance, function onSuccess(data){
										firewall.copyFirewallModal.hide();
										$.growlUI(Dict.val("common_tip"), Dict.val("fw_copy_sg_success"));	
										
										firewall.querySG();													
									},function onError(msg){
										firewall.copyFirewallModal.hide();
										$.growlUI(Dict.val("common_tip"), Dict.val("fw_copy_sg_filed"));
										firewall.copyFirewallModal = null;
									});
					        	   
					           },attrs:[{name:'class',value:'btn btn-primary'}]},
					           
					           {name:Dict.val("common_cancel"),onClick:function(){
					        	   firewall.copyFirewallModal.hide();
					           },attrs:[{name:'class',value:'btn'}]}
					           ],
					
					beforeShow : function(){
						$("#copyName").val("");
						var allCheckedBox = $("#firewallTable tbody input[type='checkbox']:checked");
						var sgId = $(allCheckedBox[0]).parents("tr").attr("instanceId");
						firewall.service.queryRuleBySG(sgId,function(group){
							rule = group.securityGroupRules;
						});
					}
				});
			} 
			firewall.copyFirewallModal.autoAlign().setTop(100).show();		
		
		},
		//配置防火墙规则弹出方法
		cfgFirewall : function(){			
			var sgId = firewall.selectedId;
			firewall.refreshAndCfgFirewall = 'cfg';
			firewall.service.queryRuleBySG(sgId, function(data){
				firewall.initModifyFirewall(data);
			},function onError(errorMsg){
				ErrorMgr.showError(Dict.val("fw_query_sg_rule") + errorMsg);
			});	
		},
		refreshBtnFirewall : function(){			
			var sgId = firewall.selectedId;
			firewall.refreshAndCfgFirewall = 'refresh';
			firewall.service.queryRuleBySG(sgId, function(data){
				firewall.initModifyFirewall(data);
			},function onError(errorMsg){
				ErrorMgr.showError(Dict.val("fw_query_sg_rule") + errorMsg);
			});	
		},
		initModifyFirewall:function(data){
			var sgId = firewall.selectedId;
			var group = data;
			modifyFirewall.exportRules = group.securityGroupRules;
			if (group){					
				//$("#modifyFirewallModal #vmId").val(vmId);
				//$("#modifyFirewallModal #groupId").val(group.securityGroupId);					
				firewallId = group.securityGroupId;	
				modifyFirewall.init(sgId); 
				$.each(group.securityGroupRules,function(i,rule){
					rule.id = rule.securityGroupRuleId;
					modifyFirewall._addRuleForShow(rule);	
				});	
				if(firewall.refreshAndCfgFirewall == 'cfg'){
					$("#modifyFirewallModal").off("show").on("show",function(){
						modifyFirewall.resetUploadDiv();
						//firewall.refreshFirewall(sgId);	
					});
					$("#modifyFirewallModal").modal("show");
				}
				
			}
		},
		sendToVM : function (){
			$("#sendtoVMModal").modal('show');
		},
		deleteFirewall : function (){
			ConfirmWindow.setTitle(Dict.val("fw_destory_sg")).setContent("<h4>"+Dict.val("fw_confirm_destory_sg")+"</h4>").onSave = function(){
				var sgId = firewall.selectedId;
				firewall.service.destroySG(sgId,function onDestroied(data){
					$.growlUI(Dict.val("fw_destory_sg"), Dict.val("fw_destory_sg_success"));
					ConfirmWindow.hide();
					firewall.querySG(); 
				},function failedToDestroy(error){
					ErrorMgr.showError(error);
				});
				ConfirmWindow.hide();
			};
			ConfirmWindow.show();
		  
		},
		getVMIpsbySgId:function(){
				if (firewall.showVMIPsModal == null) {
					firewall.showVMIPsModal = new com.skyform.component.Modal(
							new Date().getTime(),
							Dict.val("fw_sg_view_vm"),
							$("script#vmIPs_form").html(),
							{
								buttons : [
										{
											name : Dict.val("common_close"),
											onClick : function() {
												firewall.showVMIPsModal.hide();
												
											},
											attrs : [ {
												name : 'class',
												value : 'btn btn-primary'
											} ]
										}
										],
								beforeShow : function(){
									
								},
								afterShow:function(){
									var sgId = firewall.selectedId;
									var param={
											"securityGroupId":parseInt(sgId)
									};
									firewall.service.getVMIpsbySgId(param,function(data){
										firewall.initVMIpsTable(data);
									},function(error){
										ErrorMgr.showError(error);
									});
								}
							});

				}
				// VM.modifyVMNameModal.setWidth(600).autoAlign();
				firewall.showVMIPsModal.show();
		},
		initVMIpsTable:function(data){
			if(firewall.VMIpsTable){
				firewall.VMIpsTable.updateData(data);
				return;
			}
			firewall.VMIpsTable = new com.skyform.component.DataTable(),
			firewall.VMIpsTable.renderByData("#vmIPsTable", {
				"data" : data,
				"pageSize" : 5,
				"onColumnRender" : function(columnIndex,columnMetaData,columnData) {
					var text = columnData[columnMetaData.name]||'';
					if(columnMetaData.name == "ip"){
						text = columnData.ip.join(",");
					}
					 return text;
				}, 
				"afterRowRender" : function(rowIndex,data,tr){
					
				},
				"afterTableRender" : function() {
				}
		});		 
		},
		getInstance:function(){
			var instance = {
					  "period": 9999,
					  "count": 1,
					  "productList": [
					    {
					      "instanceName": $("#firewallName").val().trim(),
					      "productId": 9000					     
					    }
					  ]
					};
			instance.productList[0].firewallRules = [];
//			instance.productList[0].firewallRules.push(tcp_egress);
//			instance.productList[0].firewallRules.push(udp_egress);
			$(FireWallCfg.rules).each(function(i,rule){	
				if("ICMP" == rule.name||"icmp" ==rule.protocol){
					rule.port = "0";
				};			
				var item = {
					"direction"	: ""+rule.direction,
					"name" : rule.name.trim(),
					"port" : ""+rule.port.trim(),
					"protocol" : ""+rule.protocol,
					"ip" : rule.ip
				} 
				instance.productList[0].firewallRules.push(item);
			});
			return instance;
		},
		checkSelected : function(selectInstance) {
			$(".operation").addClass("disabled");			
		}
};

var ConfirmWindow = new com.skyform.component.Modal("confirmWindow","","",{
	buttons : [
	  {
		  name : Dict.val("common_determine"),
		  attrs : [{name:'class',value:'btn btn-primary'}],
		  onClick : function(){
			  if(ConfirmWindow.onSave && typeof ConfirmWindow.onSave == 'function') {
				  ConfirmWindow.onSave();
			  } else {
				  ConfirmWindow.hide();
			  }
		  }
	  },
	  {
		  name : Dict.val("common_cancel"),
		  attrs : [{name:'class',value:'btn'}],
		  onClick : function(){
			  ConfirmWindow.hide();
		  }
	  }
	  ]
}).setWidth(400).autoAlign().setTop(100);

var tcp_egress = {
		"direction":"egress",
		"name":Dict.val("common_tcp_egress"),
		"port":"1-65535",
		"protocol":"tcp",
		"ip" :""		
	};
var udp_egress = {
	"direction":"egress",
	"name":Dict.val("common_udp_egress"),
	"port":"1-65535",
	"protocol":"udp",
	"ip" :""		
};
