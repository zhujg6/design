//10.10.242.180
window.currentInstanceType='lb';

window.Controller = {
		
		init : function(){
	lb.init();
		},
		refresh : function(){
			lb.updateDataTable();			
		}
		
	}
var product = {};
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

var lb = {
	rules : [],
	rules_Modify : [],
	id : 1,
	firstRule : 0,
	lbId : 0,
	modifyLbRuleVM : 0,
	container : $("#lbRule"),	
	volumeState: [],
	wizard : null,
	datatable : new com.skyform.component.DataTable(),		
	subnet : [],
	curSubnet : [],
	createPeridInput : null,
	quota : 1,
	oldName : '',
	init : function() {
		lb.volumeState = {
				"pending" : Dict.val("common_ins_state_pending"),
				"reject" : "审核拒绝",
				"opening" : Dict.val("common_ins_state_opening"),
				"changing" : Dict.val("common_ins_state_changing"),
				"deleting" : Dict.val("common_ins_state_deleting"),
				"deleted" : Dict.val("common_ins_state_deleted"),
				"running" : Dict.val("common_ins_state_running"),// 就绪
				"using" : "就绪（已负载）",
				"error" : Dict.val("common_ins_state_error")
				,"create error" : Dict.val("common_ins_state_error")
				,"delete error" : Dict.val("common_ins_state_error")
		};
		//查询协议
		CommonEnum.initProtocol(function(data){			
			CommonEnum.protocol = $.parseJSON(data);	
			var pDom = '';
			$.each(CommonEnum.protocol, function(i) {
				pDom +='<option value="'+i+'">'+CommonEnum.protocol[i]+'</option>';
			});
			$("#monitorProtocol").empty().append(pDom);
		});
		//查询负载方式
		CommonEnum.initLoopType(function(data){
			CommonEnum.loopType = $.parseJSON(data);
			var lDom = '';
			//console.log(CommonEnum.loopType);
			$.each(CommonEnum.loopType, function(i) {					
				lDom +='<option value="'+i+'">'+CommonEnum.loopType[i]+'</option>';
			});	
			//console.log(lDom);
			$("#loopType").empty().append(lDom);
			//console.log($("#loopType").html());
		});
		lb.describeLb();
		
		
		var inMenu = false;
		
		$("#modifyLbVM").bind('click',function(){			
			lb.modifyLbVM();
		});		
		
		$("#btnRefresh").bind('click',function(){			
			lb.updateDataTable();
		});	
		
		$("#lbAddvm").bind('click',function(){			
			lb.lbAddvm();
		});	
		
		$("#createLB").click(function() {
			lb.createLbShow();
//			var _net = $("#vm_privatenetwork").val();
//			if(!_net){
//				$.growlUI("提示", "请先创建内网..."); 
//				return;
//			}else{
//				lb.createLbShow();
//			}		
		});
//		$("#lbModify").bind('click',function(){
//			lb.handleLi(1);
//		});		
		
		$("#contextMenu").bind('mouseover',function(){
			inMenu = true;
		});
	
		$("#contextMenu").bind('mouseout',function(){
			inMenu = false;
		});
		
//		$("#contextMenu li").bind('click',function(e){
//			$("#contextMenu").hide();
//			lb.handleLi($(this).index());					
//		});
		
		$("body").bind('mousedown',function(){
			if(!inMenu){
				$("#contextMenu").hide();
			}
		});	
		
		//更多操作...中的下拉菜单添加监听事件
		$(".dropdown-menu").bind('mouseover',function(){
			inMenu = true;
		});
		
		$(".dropdown-menu").bind('mouseout',function(){
			inMenu = false;
		});
		$(".dropdown-menu li").bind('click',function(e){
			//lb.handleLi($(this).index());					
		});		

		
			lb.getBillTypeList();
		
	
		
		var realValue;
		$("#amount").bind("keydown",function(e){
			if (e.which == 13) { // 获取Enter键值
				e.preventDefault(); // 阻止表单按Enter键默认行为，防止按回车键提交表单
				realValue = parseInt(parseInt($("#amount").val())/10) * 10 ;
				$( "#slider-range-min" ).slider( "option", "value", realValue);
				$("#amount").val(realValue);			
			}
		});
		$("#amount").bind("blur",function(e){
				e.preventDefault(); // 阻止表单按Enter键默认行为，防止按回车键提交表单
				realValue = parseInt(parseInt($("#amount").val())/10) * 10 ;
				$( "#slider-range-min" ).slider( "option", "value", realValue);
				$("#amount").val(realValue);			
		});
		
		// 点击创建按钮
		// 新建lb
		$("#btnCreateLb").bind('click',function(e){			
			lb.createLb();
		});	
		//点击修改按钮
//		$("#btn_modifyLb").bind('click',function(e){
//			lb.handleLi(0);	firewallId				
//		});	
		//修改lb
		$("#modify_save").bind('click',function(e){
			//只有当选中一个LB存储时修改名称和备注，其他情况友情提示
			var ids = $("#lbTable tbody input[type='checkbox']:checked");
			var instanceName = $("#modifyLbModal  input[name='instance_name']").val();
			var comment = $("#modifyLbModal textarea").val();
			lb.modifyLb($(ids[0]).val(),instanceName,comment);		
		});
		
//		$("#btn_modifyLb").attr("disabled",true);
//		$("#add_rule").attr("disabled",true);
//		$("#btn_delete").attr("disabled",true);
//		$("#btn_renew").attr("disabled",true);
/**
		var pDom = '';
		$.each(CommonEnum.protocol, function(i) {
			pDom +='<option value="'+i+'">'+CommonEnum.protocol[i]+'</option>';
		});
		$("#monitorProtocol").append(pDom);
		var lDom = '';
		$.each(CommonEnum.loopType, function(i) {					
			lDom +='<option value="'+i+'">'+CommonEnum.loopType[i]+'</option>';
		});	
		$("#loopType").append(lDom);
*/		
	},	
	getFee : function(){
		var period = lb.createPeridInput.getValue();
		//如果是年，period * 12
		if(3 == $("#billType .selected").attr("data-value")){
			period = period * 12;
		};
		var param = {
				"period":period,
				"productPropertyList":[									
				    {
				    		"muProperty":"loadBalancePrice",
							"muPropertyValue":'1',
							"productId":product.productId
					}
					] 
				}
			Dcp.biz.apiAsyncRequest("/pm/queryCaculateFeeByPrtyList",param, function(data) {
				if(0 == data.code){
					var count = lb.createPeridInput.getValue();
					var fee =  data.data.fee;
					$("#feeInput").val(fee/1000);
					$(".price").html(fee/1000);
				}
			});
	},
	createLbShow : function(){
		lb.initWizard();
		/*  //查询协议
		CommonEnum.initProtocol(function(data){			
			CommonEnum.protocol = $.parseJSON(data);	
			var pDom = '';
			$.each(CommonEnum.protocol, function(i) {
				pDom +='<option value="'+i+'">'+CommonEnum.protocol[i]+'</option>';
			});
			$("#monitorProtocol").empty().append(pDom);
		});
		//查询负载方式
		CommonEnum.initLoopType(function(data){
			CommonEnum.loopType = $.parseJSON(data);
			var lDom = '';
			//console.log(CommonEnum.loopType);
			$.each(CommonEnum.loopType, function(i) {					
				lDom +='<option value="'+i+'">'+CommonEnum.loopType[i]+'</option>';
			});	
			//console.log(lDom);
			$("#loopType").empty().append(lDom);
			//console.log($("#loopType").html());
		});
		//*/
		
		lb.createPeridInput = null;
		if (lb.createPeridInput == null) {
			var container = $("#perid").empty();				
			var max = 12;
			lb.createPeridInput = new com.skyform.component.RangeInputField(container, {
				min : 1,
				defaultValue : 1,
				max:max,
				textStyle : "width:137px"
			}).render();
			lb.createPeridInput.reset();
				
		};
		lb.getFee();
		
		$(".subFee").bind('mouseup',function(){
			setTimeout('lb.getFee()',100);
		});

		com.skyform.service.privateNetService.listAll(function(data){
			var dom = '';

			if(''!=''+data){	
				lb.subnet = data;
				$.each(data, function(i) {
					if(data[i].state=='using' || data[i].state=='running'){
						dom +='<option value="'+data[i].id+'">'+data[i].name+'</option>';
					}
				});	
				$("#vm_privatenetwork").empty().append(dom);
				
			}				
			else {
				$.growlUI("提示", "目前没有可选的私有网络，请先去申请！" ); 				
			}
		});		
		if (lb.wizard == null){
			lb.wizard = new com.skyform.component.Wizard($("#wizard-createLB"));
			lb.wizard.onToStep = function(from,to){
				lb.getCurSubnet();
				if(null!=lb.curSubnet){
					$("#ipSegments_input_3").val(lb.getIpByDot(lb.curSubnet.ipSegments,3) );
				}
			};
			lb.wizard.onLeaveStep = function(from, to) {
				if(to == 3){
				var obj = {};
				obj.name = $.trim($("#lbInsName").val());
				obj.period = lb.createPeridInput.getValue();
				
				var payType = $("#billType .selected").attr("data-value");
				switch(payType){
					case "0" :obj.payType = "包月";break;
					case "3" :obj.payType = "包年";break;
					case "5" :obj.payType = "VIP(月)";break; 
				}
				obj.price = $(".feeInput_div span").eq(0).text();
				
				
				obj.privateNet = $("#vm_privatenetwork option:selected").text();
				obj.protocol = $("#monitorProtocol option:selected").text();
				obj.port = $("#monitorPort").val();
				obj.loopType = $("#loopType option:selected").text();
				
				$.each(obj,function(key,value){
					$("#configForm").find("p[name='" + key + "']").text(value);
				})
			}
			};
			lb.wizard.onFinish = function(from,to) {				
				lb.createLb();					
				lb.wizard.close();
			};
			
		}
		lb.wizard.markSubmitSuccess();
		lb.wizard.reset();
		lb.wizard.render();
	},
	// 创建LB
	createLb : function() {		
		var isSubmit = true;
		var instanceName = $.trim($("#lbInsName").val());
		var count = 1;
		var storageSize = $.trim($("#amount").val());
		var account = $("#user_name").val();
		var monitorName = $.trim($("#lbInsName").val()); //'Monitor';
		var monitorProtocol = $("#monitorProtocol").val();
		var monitorPort = $("#monitorPort").val();
		var loopType = $("#loopType").val();
		var network = $("#vm_privatenetwork").val();
		
		
		$("#lbInsName, #amount").jqBootstrapValidation();
		
		var scoreReg = /^[\u4E00-\u9FA0A-Za-z\-0-9\_]+$/;
		if(! scoreReg.exec(instanceName)) {
			$("#tipCreateLbName").text("名称中包含非法字符。");
			$("#lbInsName").focus();
			isSubmit = false;
		}else{
			$("#tipCreateLbName").text("");
		}
						
		if (!isSubmit) {
			return;
		}

		// TODO 加入输入合法性校验  ,对于portal,获取登录的用户赋值给ownUserId，目前写死测试值1115
		var period = lb.createPeridInput.getValue();
		//如果是年，period * 12
		if(3 == $("#billType .selected").attr("data-value")){
			period = period * 12;
		};
		var params = {
					"period":period,
					"count":1,
					"productList":[
					      {

						"instanceName" : instanceName,
						"network"  : network,
						"name" : monitorName,
						"productId" : product.productId,
						"port" : monitorPort,
						"protocol" : monitorProtocol,
						"looptype" : loopType
					       }
					      ]
		};
		if(this.rules.length>0){
			params.productList[0].backendmember = [];
			$(this.rules).each(function(i,rule){	
				var item = {
					"name" :rule.name,
					"port" : rule.port,
					"protocol" : rule.protocol
				} 
				params.productList[0].backendmember.push(item);
			});
		}
		//this.getFormData(params);
		var agentId = $("#agentId").val();
		var _fee = $("#feeInput").val();
		if(agentId&&agentId.length>0){
			com.skyform.service.channelService.checkAgentCode(agentId,function(data){
				if("-1" == data){
					$("#agentMsg").html("*渠道优惠码不存在，请重新输入！");
				}
				else {
					var channel = com.skyform.service.channelService.channel;
					channel.agentId = agentId;
					channel.period = params.period;
					channel.productList[0].price = _fee;			
					channel.productList[0].productId = params.productList[0].productId;				
					channel.productList[0].serviceType = CommonEnum.serviceType["lb"];
					channel.productList[0].productDesc = params.productList[0];
					
					com.skyform.service.channelService.wizardConfirmChannelSubmit(channel,lb.wizard, function onSuccess(data){
						$.growlUI("提示", "订单已提交，请等待审核通过后完成支付！您可以在用户中心->消费记录中查看该订单信息。");
						lb.wizard.markSubmitSuccess();
						lb.updateDataTable();
					},function onError(msg){
						$.growlUI("提示", "订单提交失败！");
						wizard.markSubmitError();
					});
				}
			});
		}
		else {
			Dcp.biz.apiRequest("/trade/lbSubscribe", params, function(data) {
				if (data.code == "0") {
					var _tradeId = data.data.tradeId;
					com.skyform.service.BillService.wizardConfirmTradeSubmit(_fee,_tradeId,lb.wizard, function onSuccess(data){
						$.growlUI("提示", "正在创建负载均衡，请等待！"); 
						// refresh	
						$("#lbInsName").html("");
						$("#monitorPort").html('');
						lb.wizard.markSubmitSuccess();
						lb.updateDataTable();
					},function onError(msg){
						$.growlUI("提示", "创建负载均衡失败：" + msg);
//						wizard.markSubmitError();
					});
				} else {
					lb.wizard.markSubmitError();
					$.growlUI("提示", "创建负载均衡失败：" + data.msg);
				}
			},function(error){
				ErrorMgr.showError(error);
			});
		}
		
		lb.wizard.reset();
		lb.wizard.render();
	},

	
	
	//增删Lb后端服务器
	modifyLbVM : function(){
		//先清除再批量创建//		
//		Dcp.biz.apiRequest("/instance/lb/destroylbRule", {id : lb.modifyLbRuleVM}, function() {
//			//lb.describeLbRule();
//			$.growlUI("提示", "成功修改负载均衡后端服务器！");  
//			$("#modifyLbRule").modal("hide");
//		},function onError(){
//			lb.generateTable();
//		});
		
		param["hostIds"] = lb.lbId;
		$(this.rules_Modify).each(function(i,rule){			
			param["id"] = lb.modifyLbRuleVM;			
			param["firewallRules.rules["+i+"].name"] = rule.name;
			param["firewallRules.rules["+i+"].port"] = rule.port;
			param["firewallRules.rules["+i+"].protocol"] = rule.power;
			
		});
		
		
		Dcp.biz.apiRequest("/instance/lb/modifyLbRule", param, function() {				
			//lb.describeLbRule();
			$.growlUI("提示", "正在修改负载均衡后端服务器，请等待！");  
			$("#modifyLbRule").modal("hide");
			window.currentInstanceType = "lb"; 
			var wait = setTimeout(function(){ 
//				alert("999");
            },1000); 
			lb.updateDataTable(lb.modifyLbRuleVM);
			
			
		},function onError(){
			lb.generateTable();
		});	
		
	},
	
	addModifyLbVM : function(){	
		
		var name = $("#ipSegments_modify_1").val()+"."+$("#ipSegments_modify_2").val()
					+"."+$("#ipSegments_modify_3").val()+"."+$("#ipSegments_modify_4").val();
		var port = $("#vmPort_modify").val();	
		var power = $("#vmPower_modify").val();
		
		var ruleVM = {
				"rules":[{
					"firewall_id": lb.lbId,
					"hostIds":hostIds,
					"name":name,
					"port":port,
					"protocol":power
				}]

		};
		
		if(this.validate(ruleVM.rules[0],"modifyLbRule")) {
			
			Dcp.biz.apiRequest("/instance/lb/createRuleById", ruleVM, function(data) {	
				if (data.code != "0") {
					$.growlUI("提示", "查询负载后端服务器发生错误：" + data.msg); 
				} else {
					ruleVM.id = this.id++;
					//this.rules_Modify.push(ruleVM);
		
					var newRow = $(
							"<tr ruleId='" + ruleVM.id + "'>"+
							"<td>" + ruleVM.rules[0].name + "</td>" + 
							"<td>" + ruleVM.rules[0].port + "</td>" + 	
							"<td>" + ruleVM.rules[0].protocol + "</td>" + 
							"<td>正在处理</td>"+
							"<td></td>"+
							"</tr>"		
					);			
					
					newRow.find(".btn-del").unbind().click(function(){		
						lb.deleteRule2(ruleVM.id);
					});
					
					newRow.insertBefore($("#formTr_modify"));
					
					$("#vmPort_modify").val("");
					$("#vmPower_modify").val("");
				}
			});			
		}
		
	},
	initWizard:function(){
		this.rules=[];
		this.container = $("#lbRule");
		this.container.find("tr[id != 'formTr'][id != 'errorInfoRow']").remove();
		$("#lbInsName").html("");
		$("#agentMsg").html("");
		$("#tip_lbInsName").html("");
		$("#tip_monitorPort").html("");
		$("#monitorPort").html('');
		
		$("#agentId").focus(function(){
			$("#agentMsg").html("");
		});
		$("#lbInsName").focus(function(){
			$("#tip_lbInsName").html("");
		});
		$("#monitorPort").focus(function(){
			$("#tip_monitorPort").html("");
		});
	},
	lbAddvm : function(){				
		var name =$("#ipSegments_input_1").val()+"."+$("#ipSegments_input_2").val()
		+"."+$("#ipSegments_input_3").val()+"."+$("#ipSegments_input_4").val();
		var port = $("#vmPort").val();	
		var power = $("#vmPower").val();
		//console.log("quanzhong="+power);
		var ruleVM = {
			"name" : name,
			"port" : port,		
			"protocol" : power
		};
		if(this.validate(ruleVM)) {
			ruleVM.id = this.id++;
			this.rules.push(ruleVM);

			var newRow = $(
					"<tr ruleId='" + ruleVM.id + "'>"+
					"<td>" + ruleVM.name + "</td>" + 
					"<td>" + ruleVM.port + "</td>" + 	
					"<td>" + ruleVM.protocol + "</td>" + 
					"<td><a class='btn btn-del btn-danger '>删除</a></td>"+
					"</tr>"		
			);			
			
			newRow.find(".btn-del").unbind().click(function(){		
				lb.deleteRule(ruleVM.id);
			});
			
			newRow.insertBefore($("#formTr"));
			
			$("#vmPort").val("");
			$("#vmPower").val("");			
		}
		
	},
	
	modifyLbRule : function(id){
		lb.rules_Modify = [];
		lb.modifyLbRuleVM = id;
		
		Dcp.biz.apiRequest("/instance/lb/describeLbRule", {lbid:id}, function(data) {
			if (data.code != "0") {
				$.growlUI("提示", "查询负载均衡后端服务器发生错误：" + data.msg); 
			} else {
				if(null!=data.data.length > 0 ){
					var test=$.parseJSON(data.data);
					lb.lbId =test[0].id;
					lb.refreshFirewall(id);
					Dcp.biz.apiRequest("/instance/lb/describeLbRuleVM", {firewallId:lb.lbId}, function(data) {
						if (data.code != "0") {
							$.growlUI("提示", "查询负载后端服务器发生错误：" + data.msg); 
						} else {	
							$("#lbRule_modify").html('<input type="hidden" id="modifyHost" value="'+id+'">');
							for (var i = 0; i < data.data.length; i++) {
								var state = ''+data.data[i].state;
								var stateMsg = ''
								//console.log('lbRule_modify state='+data.data[i].state);
								if('success' == state){
									stateMsg = '成功';
								}else if('failed' == state){
									stateMsg = '失败';
								}else if('opening' == state){
									stateMsg = '正在处理';
								}else if('unbinding' == state){
									stateMsg = '正在解绑';
								}else if('unbindfailed' == state){
									stateMsg = '解绑失败';
								}else{
									stateMsg = '';
								}
								//console.log('lbRule_modify2 state='+state);
								var dom = ''								
									+'<tr ruleid="'+ data.data[i].id +'">'
									+'	<td>'+ data.data[i].name +'</td>'
									+'	<td>'+ data.data[i].port +'</td>'
									+'  <td>'+ data.data[i].protocol +'</td>'
									+'  <td>'+ stateMsg +'</td>';
								if('opening' == state || 'unbinding' == state){
									dom = dom+'  <td></td>';
								}else{
									dom = dom+'  <td><a class="btn btn-del btn-danger " onclick="lb.deleteRuleModify('+ data.data[i].id +')">删除</a></td>';
								}
									dom = dom+'</tr>';
								$("#lbRule_modify").append(dom);					
									
								var ruleVM = {
									"firewallId" : lb.lbId,	
									"id"    : data.data[i].id,
									"name"  : data.data[i].name,
									"port"  : data.data[i].port,		
									"power" : data.data[i].protocol
								};	
								
								lb.rules_Modify.push(ruleVM);
									
							} 
							var dom2 = ''
								+'<tr id="formTr_modify">'
								+'	<td>'
								+'<div id="form_privatenetwork_ipSegments" class="address">'	
			    				+'<input id="ipSegments_modify_1" class="ip input-ip" type="text" disabled="" value="192"></input>'
									+'<span class="dot"></span>'
									+'<input id="ipSegments_modify_2" class="ip input-ip" type="text" disabled="" value="168"></input>'
									+'<span class="dot"></span>'
									+'<input id="ipSegments_modify_3" class="ip input-ip disabled" type="text" disabled=""></input> '   							
									+'<span class="dot"></span>'
									+'<input id="ipSegments_modify_4" class="ip ip_network input-ip" maxlength="3" type="text" value="2"></input> '   								
								+'</div>'
								//+'		<input id="vmName_modify" class="input" style="width:180px"type="text" placeholder="内网IP"></input>'
								+'	</td>'
								+'	<td><input type="text" id="vmPort_modify" class="ip input-ip" maxlength="5" style="width:40px" /></td>'								
								+'	<td><input type="text" id="vmPower_modify" maxlength="2" class="ip input-ip" style="width:40px" /></td>'
								+'  <td></td>'
								+'	<td>'
								+'		<a class="btn btn-success btn-add" id="lbAddvm" onclick="lb.addModifyLbVM()">添加</a>'
								+'	</td>'
								+'</tr>'
								+'<tr id="errorInfoRow">'
								+'	<td colspan="4">'
								+'		<span class="text-error" id="errorInfo"></span>'
								+'	</td>'
								+'</tr>';
															
							$("#lbRule_modify").append(dom2);	
						}
					},function onError(){
						lb.generateTable();
					});	
				
				}				
			}
		});

	
	},	
	refreshFirewall : function(lbId){
		AutoUpdater.stop();
		AutoUpdater.parentid = lbId;
		if($("#modifyLbRule").attr("class").indexOf("in")==-1){
			window.currentInstanceType='lb';
		}
		else window.currentInstanceType='lb_member';
		AutoUpdater.start();
	},
	deleteRuleModify:function(id) {	
		var row = $("#lbRule_modify tr[ruleid='"+id+"']");
		//console.log(row.td[3]);
		Dcp.biz.apiAsyncRequest("/instance/lb/deleteLbRuleById", {ruleId:id}, function(data) {			
			if(0 == data.code){
				$("#lbRule_modify").find("tr[ruleId='"+id+"']").remove();
				return false;
			}
		});
	},	
	
	deleteRule2 : function(id) {
		 
		var self = this;
		$(this.rules_Modify).each(function(i,_rule) {
			if(_rule.id == id) {
				self.rules_Modify.splice(i,1);
				$("#lbRule_modify").find("tr[ruleId='"+id+"']").remove();
				return false;
			}
		});
	},	

	deleteRule:function(id) {		
		var self = this;
		$(this.rules).each(function(i,_rule) {
			if(_rule.id == id) {
				self.rules.splice(i,1);
				$("#lbRule").find("tr[ruleId='"+id+"']").remove();
				return false;
			}
		});
	},		

	validate : function(rule,dom) {
		var result = true;
		var errorMsg = "";
		var ip = $.trim(rule.name);
		if(!valiter.isIp(ip)){
			errorMsg += "IP输入格式不正确！";
			result = false;
		}
		else if(!lb.chaeckIpInVlan(lb.getIpByDot(lb.curSubnet.ipSegments,4),254,lb.getIpByDot(ip,4))){
			errorMsg += "IP不在Vlan内！";
			result = false;
		}
		if(!/^[1-9]+[0-9]*$/.test("" + rule.port)) {
			errorMsg += "无效的端口号！";
			result = false;
		}  	
		if(!/^[1-9]+[0-9]*$/.test("" + rule.protocol)) {
			errorMsg += "无效的权重值！";
			result = false;
		}  
		if(!result) {
			$("#"+dom+" #errorInfo").html(errorMsg);
			$("#"+dom+" #errorInfoRow").show();
		} else {
			$("#"+dom+" #errorInfoRow").hide();
		}
		return result;
	},
	
	generateTable : function(data){
		lb.datatable = new com.skyform.component.DataTable();
		 lb.datatable.renderByData("#lbTable", {
				"data" : data,
				"columnDefs" : [
				     {title : "<input type='checkbox' id='checkAll'>", name : "id"},
				     {title : "ID", name : "id"},
				     {title : "服务名称", name : "instanceName"},
				     {title : "状态", name : "state"},
				     {title : "协议", name : "protocol"},
				     {title : "端口", name : "port"},
				     {title : "均衡方式", name : "looptype"},
				     {title : "IP地址", name : "address"},
				     {title : "创建时间", name : "createDate"},
				     {title : "到期时间", name : "expireDate"}
				     
				],
				"pageSize" : 5,
				"onColumnRender" : function(columnIndex,columnMetaData,columnData) {
					 var text = columnData[''+columnMetaData.name] || "";
					 if(columnIndex ==0) {
						 text = '<input type="checkbox" value="'+text+'">';
					 }
					 if (columnMetaData.title == "ID") {
						 text = text;						 
					 }
					 if (columnMetaData.name == "state") {
						 //text = lb.volumeState[text];
						 text = com.skyform.service.StateService.getState("lb",text);
					 }
					 if(columnMetaData.name == "protocol"){
						text = CommonEnum.protocol[text];
					 }
					 if(columnMetaData.name == "looptype"){
						 text = CommonEnum.loopType[text];
					 }
					 if (columnMetaData.name == "createDate") {
						 //text = new Date(text).toLocaleString();
						  //console.log(columnData.createDate);
						  if(columnData.createDate == '' || columnData.createDate == 'undefined'){
						  	return '';
						  }
						 try {
								var obj = eval('(' + "{Date: new Date(" + text + ")}" + ')');
								var dateValue = obj["Date"];
								text = dateValue.format('yyyy-MM-dd hh:mm:ss');
							} catch (e) {
						    }
					 }
					 if (columnMetaData.name == "expireDate") {
						 //text = new Date(text).toLocaleString();
						  //console.log(columnData.expireDate);
						  if(columnData.expireDate == '' || columnData.expireDate == 'undefined'){
						  	return '';
						  }
						 try {
								var obj = eval('(' + "{Date: new Date(" + text + ")}" + ')');
								var dateValue = obj["Date"];
								text = dateValue.format('yyyy-MM-dd hh:mm:ss');
							} catch (e) {
						    }
					 }
					 if(columnMetaData.name == "instanceName"){
						 text = columnData.instanceName
						        +"<a title='咨询建议' " +
						        		"href='../user/workOrder.jsp?code=workOrder&cataCode=service" +
						        		"&instanceId="+columnData.id+"&serviceType=lb" +
						        				"&instanceName="+encodeURIComponent(columnData.instanceName)+
						        				"&instanceStatus="+columnData.state+"" +
						        				"&currentPoolW="+encodeURIComponent(CommonEnum.pools[CommonEnum.currentPool])+
						        		"'><i class='icon-comments' ></i></a>";
					 }
					 return text;
				}, 
				"afterRowRender" : function(rowIndex,data,tr){
					tr.attr("state", data.state).attr("comment", data.comment);
					tr.attr("ownUserId", data.ownUserId);
					tr.attr("instanceId",data.id);
					//lb.bindEventForTr(rowIndex, data, tr);					
					tr.find("input[type='checkbox']").click(function(){
						lb.checkSelected();
			        });
//					tr.unbind().bind('mousedown',function(){
//						//console.log("tr.click="+data.id);
//						lb.describeLbRuleById(data.id);
//						lb.getOptLog(data.id);
//					});
					tr.click(function(){
						//console.log("tr.click="+data.id);
						lb.describeLbRuleById(data.id);
						lb.getOptLog(data.id);
					});					
				},      
				"afterTableRender" : function() {
					lb.bindEvent();
					if(!lb.contextMenu) {
						lb.contextMenu = new ContextMenu({
							beforeShow : function(tr){
								lb.checkAll(false);
								tr.find("input[type='checkbox']").attr("checked",true);
							},
							onAction : function(action) {
								lb._invokeAction(action);
							},
							afterShow : function(tr) {
								lb.checkSelected({
									instanceName : tr.attr("instancename"),
									id : tr.attr("instanceid"),
									state : tr.attr("state")
								});
							},
							trigger : "#lbTable tr"
						});
					}else {
						lb.contextMenu.reset();
					}
				}
		});
		 lb.datatable.addToobarButton("#toolbar4tb2");
		 lb.datatable.enableColumnHideAndShow("right");		 
	},
	checkAll : function(check){
		if(check) $("#lbTable tbody input[type='checkbox']").attr("checked",true);
		else $("#lbTable tbody input[type='checkbox']").removeAttr("checked");
		
		lb.checkSelected(false);
	},
	bindEventForTr : function(rowIndex, data, tr) {

	},
	
	showInstanceInfo : function(instanceInfo) {
		$("div#details span.detail_value").each(function(i,item){
			var prop = $(this).attr("prop");
			$(this).html("" + instanceInfo[""+prop]);
		});
	},
	
	checkSelected : function(selectInstance) {
		$(".operation").addClass("disabled");
		var rightClicked = selectInstance?true:false;
		
		var allCheckedBox = $("#lbTable input[type='checkbox']:checked");
		
		var oneSelected = allCheckedBox.length == 1;
		var hasSelected = allCheckedBox.length > 0;
		
		$(".operation").addClass("disabled");
		
		var state = $(allCheckedBox[0]).parents("tr").attr("state");
		if(selectInstance) {
			state = selectInstance.state;
		}
		//var state = $("#lbTable tbody input[type='checkbox']:checked").parents("tr").attr("state");	
		$(".operation").each(function(index,operation){
			var condition = $(operation).attr("condition");			
			var action = $(operation).attr("action");
			var enabled = true;
			eval("enabled=("+condition+")");
			if(enabled) {
				$(operation).removeClass("disabled");
				//$(operation).removeAttr("disabled");
			} else {
				$(operation).addClass("disabled");
				//$(operation).attr("disabled","disabled");
			}
		});
		
		lb._bindAction();
		
		if(rightClicked) {
			lb.instanceName = selectInstance.instanceName;
			lb.selectedInstanceId = selectInstance.id;	
		} else {
			for ( var i = 0; i < allCheckedBox.length; i++) {
				var currentCheckBox = $(allCheckedBox[i]);
				if (i == 0) {
					lb.instanceName = currentCheckBox.parents("tr").attr("name");
					lb.selectedInstanceId = currentCheckBox.attr("value");
				} else {
					lb.instanceName += "," + currentCheckBox.parents("tr").attr("name");
					lb.selectedInstanceId += "," + currentCheckBox.attr("value");
				}
			}
		}
	},
	
	describeLb : function(){	
//		alert("describeLb");
		//将自己编写的显示主机的table渲染
		com.skyform.service.LBService.listAll(function(data){
			lb.instances = data;					
			lb.generateTable(data);
			lb.checkSelected();//初始化按钮置灰
			if(data){
				if (data.length > 0){
					lb.firstRule = data[0].id;
					lb.getOptLog(0);						
				}						
			}
	
		});
			
	},
	
	destroylbRule : function(para){	
		
		Dcp.biz.apiRequest("/instance/lb/destroylbRule", {id : para}, function() {				
				lb.describeLbRuleById(0);
				lb.getOptLog(0);
				$.growlUI("提示", "成功删除负载均衡规则！"); 
		},function onError(){
			lb.generateTable();
		});	
	},
	
	describeLbRuleById : function(id){	
		if(null==id||id == 0){
			id = $("#lbTable tbody").find("td[name='id']").text();	
		}
		//console.log("describeLbRuleById = "+id);
		Dcp.biz.apiAsyncRequest("/instance/lb/describeLbRule", {lbid:id}, function(data) {
			if (data.code != "0") {
				$.growlUI("提示", "查询负载均衡后端服务器发生错误：" + data.msg); 
			} else {
				$("#showLbRule").empty();
					if(null!=data.data.length > 0 ){
					var test=$.parseJSON(data.data);
					lb.lbId =test[0].id;
					var dom = "";
					Dcp.biz.apiRequest("/instance/lb/describeLbRuleVM", {firewallId : lb.lbId}, function(json) {
						if (json.code == "0") {
							//alert(json.data.length);
							dom = '<div class=" well">'
								+'		<table class="table"  >'
							    +'			<tr style="font-size:14px;" >'
							    +'				<td>主机IP</td>'
							    +'				<td>端口号</td>'		    		
							    +'				<td>权重</td>'
							    +'              <td>状态</td>'
							    +'			</tr>';
							for (var j = 0; j < json.data.length; j++) {
								dom =  dom + '<tr style="font-size:14px;"><td>'+ json.data[j].name +'</td><td>'+ json.data[j].port +'</td>'
									+'<td>'+ json.data[j].protocol +'</td>';
									//console.log('state='+json.data[j].state);
									if('success' == json.data[j].state){
										dom = dom + '<td>成功</td></tr>'; 
									}else if('failed' == json.data[j].state){
										dom = dom + '<td>失败</td></tr>';
									}else if('opening' == json.data[j].state){
										dom = dom + '<td>正在处理</td></tr>';
									}else if('unbinding' == json.data[j].state){
										dom = dom + '<td>正在解绑</td></tr>';
									}else if('unbindfailed' == json.data[j].state){
										dom = dom + '<td>解绑失败</td></tr>';
									}else{
										dom = dom + '<td></td></tr>'; 
									}
							}							
							dom = dom +'</table>'
						    +'</div>';
							$("#showLbRule").empty().append(dom);	
						} else {
							$.growlUI("提示", "查询负载均衡后端服务器发生错误：" + json.msg); 
						}
					});
				}
			}
//		},function onError(){
//			lb.generateTable();
		});		
	},
	
bindEvent : function() {
		
		
		$("#checkAll").unbind("click").bind("click", function(e) {
			var checked = $(this).attr("checked") || false;
	        $("#lbTable input[type='checkbox']").attr("checked",checked);	 
	        lb.checkSelected();
	        //eip.showOrHideOpt();
	       // e.stopPropagation();
		});
		
	},
	
	getFormData : function(param){
//		$(this.rules).each(function(i,rule){
//			param["firewallRules.rules["+i+"].name"] = rule.name;
//			param["firewallRules.rules["+i+"].port"] = rule.port;
//			param["firewallRules.rules["+i+"].protocol"] = rule.power;
//		});		
	},
	
	// 修改LB存储名称和描述  createUserId??????
	modifyLb : function(id,name,comment) {
		var old_name = lb.oldName;
		if(name == old_name){
			$.growlUI("提示","请修改负载均衡实例名称！");
			return;
		}
		com.skyform.service.PortalInstanceService.querySameNameExist(window.currentInstanceType,name,function(isExist){
			if(!isExist)
			{
				var params = {
						"id" : id,
						"instanceName": name,
						"comment" : comment
				};
				Dcp.biz.apiRequest("/instance/lb/modifyLBVolume", params, function(data){
					if(data.code == "0"){
						$.growlUI("提示", "修改负载均衡信息成功！"); 
						$("#modifyLbModal").modal("hide");
						// refresh
						lb.updateDataTable(id);
					} else {
						$.growlUI("提示", "修改负载均衡信息发生错误：" + data.msg); 
					}
				});
			} else {
				$.growlUI("提示","该名称已经被使用，请重新输入");
			}
		});	
	},

	
	enableColumnHideAndShow : function(position){
		var content = $("<table class='table'></table>");
		var ths = $(this.container).find("th");
		for(var i=0; i<this.columnDefs.length; i++) {
			var columnDef = this.columnDefs[i];
			if(columnDef.contentVisiable == 'always' ) continue;
			if(columnDef.contentVisiable == 'hide' ) {
				content.append("<tr><td>"+columnDef.title+"</td><td><div class='switch switch-small' columnIndex='"+i+"'><input type='checkbox'/></div></td></tr>");
			} else {
				content.append("<tr><td>"+columnDef.title+"</td><td><div class='switch switch-small' columnIndex='"+i+"'><input type='checkbox' checked /></div></td></tr>");
			}
		}
		var self = this;
		var switchInited = false;
		this.columnShowOrHideCtrlDlg = new com.skyform.component.Modal(new Date().getTime()+Math.random(),this.defaultOptions.oLanguage.column.showOrHide,content.get(0).outerHTML,{
			afterShow: function(modal) {
				if(switchInited) return;
				var switches = $(modal).find(".modal-body .switch").bootstrapSwitch();
				switches.on('switch-change', function (e, data) {
					var columnIndex = $(this).attr("columnIndex");
					var visable = data.value;
						self.hideOrShowColumn(columnIndex,visable);
				});
				switchInited = true;
			}
		});
		return this.columnShowOrHideCtrlDlg;
	},
	
	// 刷新Table
	updateDataTable : function(id) {
//		alert("updateDataTable");
		Dcp.biz.apiAsyncRequest("/instance/lb/describeLbVolumes", null, function(data) {
			if (data.code == 0) {
				lb.instances = data.data;
				lb.datatable.updateData(data.data);
				//lb.describeLbRuleById(id);
				lb.getOptLog(id);
			}
		});		
	},
	
	getCheckedArr : function() {
		return $("#lbTable tbody input[type='checkbox']:checked");
	},
	
	_bindAction : function(){
		$("div .actionBtn").unbind().click(function(){
			if($(this).hasClass("disabled")) return;
			var action = $(this).attr("action");
			lb._invokeAction(action);
		});
	},
	_invokeAction : function(action){
		var invoker = lb["" + action];
		if(invoker && typeof invoker == 'function') {
			invoker();
		}
	},
	showOrHideOptByState : function(state) {	

//		var checkboxArr = lb.getCheckedArr();
//
//		if(checkboxArr.length == 1){
//			$("#btn_modifyLb").attr("disabled",false);
//			$("#add_rule").attr("disabled",false);
//			if (state == "running"){
//				$("#btn_delete").attr("disabled",false);
//			}else{
//				$("#btn_delete").attr("disabled",true);
//			}
//		} else {
//			$("#btn_delete").attr("disabled",true);
//			$("#btn_modifyLb").attr("disabled",true);
//			$("#add_rule").attr("disabled",true);
//		}
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
				lb.queryProductPrtyInfo(index);
				lb.getFee();
			});
			if (index == 0||index == 5) {
				if(!billtype_hasSelected){
					billtype_hasSelected = true;
					cpu_option.addClass("selected");
					lb.queryProductPrtyInfo(index);
				}
			}
		});
	},
	queryProductPrtyInfo :function(index){
			if(0==index){
				$("#peridUnit").empty().html("月");
			}
			else if(1 == index){
				$("#peridUnit").empty().html("小时");
			}
			else if(2 == index){
				$("#peridUnit").empty().html("天");
			}
			else if(3 == index){
				$("#peridUnit").empty().html("年");
			}
			
		    com.skyform.service.BillService.queryProductPrtyInfo(index,window.currentInstanceType,function(data){
	
			product.productId = data.productId;
		});
	},
	
	modifyLbShow : function(){
		var ids = $("#lbTable tbody input[type='checkbox']:checked");
		if(ids.length == 1){
			var oldInstanceName = lb.getCheckedArr().parents("tr").find("td[name='instanceName']").text();
			var oldComment = lb.getCheckedArr().parents("tr").attr("comment");
			$("#modInsName").val(oldInstanceName);
			lb.oldName = oldInstanceName;
			$("#modComment").val(oldComment);
			$("#modifyLbModal").modal("show");				
		} else {
			$.growlUI("提示", "修改只能对一个负载均衡进行操作，请重新进行选择！"); 
		}	
	},
	
	modifyRuleShow : function(){
		var ids = $("#lbTable tbody input[type='checkbox']:checked");			
		var id = $(ids[0]).val();
		var _state = lb.getCheckedArr().parents("tr").attr("state");
		var ownUserId = lb.getCheckedArr().parents("tr").attr("ownUserId");
		hostIds=id;
		lb.modifyLbRule(id);
		//$("#modifyLbRule").setWidth("200px");
		$('#modifyLbRule').modal().css({
		    width: 800		  
		});
		$("#modifyLbRule").on("show",function(){
			Dcp.biz.apiRequest("/instance/lb/querySubnetByLB", {id:id},
					function(data) {	        	
	        	if(null!=data.data){
	        		lb.curSubnet = $.parseJSON(data.data);
	        		$("#ipSegments_modify_3").val(lb.getIpByDot(lb.curSubnet.ipSegments,3) );
				}		        	
			});
		});
		$("#modifyLbRule").modal("show");
	},
	
	destoryLbShow : function (){
		var checkedArr =  lb.getCheckedArr();
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
		var lbIds = volumeIds.join(",");
		lb.destroyLb(lbIds);		
	},
	
   	destroyLb : function(lbIds) {
		var confirmModal = new com.skyform.component.Modal(new Date().getTime(),"销毁负载均衡","<h4>您确认要销毁负载均衡吗?</h4>",{
			buttons : [
				{
					name : "确定",
					onClick : function(){
						// 删除LB存储
						var params = {
								"ids" : lbIds
						};
						Dcp.biz.apiRequest("/instance/lb/deleteLbVolumes", params, function(data) {
							if (data.code == 0) {
								$.growlUI("提示", "正在销毁负载均衡，请等待！"); 
								confirmModal.hide();
								// refresh
								lb.updateDataTable();
							} else {
								$.growlUI("提示", "销毁负载均衡失败：" + data.msg); 
							}
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
						confirmModal.hide();
					}
				}
			]
		});
		confirmModal.setWidth(300).autoAlign();
		confirmModal.show();
	},
	getOptLog:function(lbId){
		$("#opt_logs").empty();
		if(null==lbId||0==lbId){
			lbId = $("#lbTable").find("td[name='id']").text();		
		}	
		com.skyform.service.LogService.describeLogsUIInfo(lbId);
//		com.skyform.service.LogService.describeLogsInfo(lbId,function onSuccess(logs){
//			$("#opt_logs").empty();
//			$(logs).each(function(i,v){
//				var desc = "";
//				if(v.description){
//					if(v.description != ""){
//						desc = "("+v.description+")";
//					}						
//				}
//				var _name = "";
//				if(v.subscription_name){
//					_name = v.subscription_name;
//				}
//				$("<li class='detail-item'><span>" + v.createTime+ "  "+v.subscription_name+"  " + v.controle +desc+  "</span></li>").appendTo($("#opt_logs"));
//			});
//		},function onError(msg){
////			$.growlUI("提示", "查询弹性块存储日志发生错误：" + msg); 
//		});
	},
	chaeckIpInVlan: function(ipstart,ipend,ip){ 		
		if (ip>=ipstart && ip<=ipend){
		   return true;
		}
		return false; 
	} ,
	getCurSubnet : function(){
		var netId = $("#vm_privatenetwork").val();							
		if(lb.subnet.length>0){
			$.each(lb.subnet, function(i) {
				if(netId == lb.subnet[i].id){
					lb.curSubnet = lb.subnet[i];
					return false;
				}									
			});
		}
		return lb.curSubnet;
	},
	getIpByDot : function(ip,index){
		var ip4 = /(\d+)\.(\d+)\.(\d+)\.(\d+)/;
		var r1 = ip.match(ip4);
		return parseInt(r1[index]);
	},
	renew : function(){
		var lbId = lb.getCheckedArr().parents("tr").attr("instanceId");
		if(lb.renewModal){
			
		}else{
			lb.renewModal = new com.skyform.component.Renew(lbId,{
				buttons : [
							{
								name : "保存",
								onClick : function(){
									var period = lb.renewModal.getPeriod().getValue();
									$("#renewModal").modal("hide");	
									var _modal = $("#renewModal");
									com.skyform.service.renewService.renew(lb.getCheckedArr().parents("tr").attr("instanceId"),period,function onSuccess(data){
										//订单提交成功后校验用户余额是否不足
										var _tradeId = data.tradeId;
										var _fee = $("#feeInput_renew").text();
										com.skyform.service.BillService.confirmTradeSubmit(_fee,_tradeId,_modal,function onSuccess(data){
											$.growlUI("提示", "续订申请提交成功,扣款成功, 请耐心等待..."); 
											// refresh
											lb.updateDataTable();									
										},function onError(msg){
											$.growlUI("提示", "续订申请提交成功,扣款失败...");
										});								
									},function onError(msg){
										$.growlUI("提示", "续订时长提交失败：" + msg); 
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
									lb.renewModal.hide();
								}
							}
						]
					});
			
		}
			lb.renewModal.getFee_renew(lbId);
			lb.renewModal.show();		
			$(".subFee_renew").bind('mouseup keyup',function(){
				setTimeout('lb.renewModal.getFee_renew('+lbId+')',100);
			});
	}
};

	function validatelbList(result){
		//var result = {status : true};
		//if(result.msg == 'undefined'){result.msg = '';}
		var subnet = $("#vm_privatenetwork").val();
		$("#tip_privatenetwork").empty();
		if(subnet <= 0) {
			$("#tip_privatenetwork").html("* 请选择创建负载均衡所属的私有网络！");
			result.status = false;
			//return result;
		}
		var protocol = $("#monitorProtocol").val();
		$("#tip_monitorProtocol").empty();
		if(protocol == '') {
			$("#tip_monitorProtocol").html("* 请选择创建负载均衡的监听协议！");
			result.status = false;
			//return result;
		}
		var loopType = $("#loopType").val();
		$("#tip_loopType").empty();
		if(loopType == '') {
			$("#tip_loopType").html("* 请选择创建负载均衡的均衡方式！");
			result.status = false;
			//return result;
		}
		//result = {status : true};
		return result;
	}

	function validatelbInsName(input){
		var scoreReg = /^[\u4E00-\u9FA0A-Za-z\-0-9\_]+$/;
				
		var result = {status : true};
		$("#tip_lbInsName").empty();
		if($.trim(""+$(input).val()) == '') {
			//result.msg = "请填写不包括非法字符的实例名称";
			$("#tip_lbInsName").empty().html("* 请填写不包括非法字符的实例名称！");
			result.status = false;
		}
		
		if(! scoreReg.exec($.trim(""+$(input).val()))) {
			//result.msg = "请填写不包括非法字符的实例名称";
			$("#tip_lbInsName").empty().html("* 请填写不包括非法字符的实例名称！");
			result.status = false;
		}
		
		return result;			
	}	
	
	function validatemonitorPort(input){
		var scoreReg = /^[0-9]*$/;
		var result = {status : true};
		$("#tip_monitorPort").empty();
		if($.trim(""+$(input).val()) == '') {
			//result.msg = "请用数字填写监听端口";
			$("#tip_monitorPort").empty().html("* 监听端口不能为空，请输入(0-65535)范围数字！");
			result.status = false;
			//return result;
		}
		
		if(! scoreReg.exec($.trim(""+$(input).val()))) {
			//result.msg = "请用数字填写监听端口";
			$("#tip_monitorPort").empty().html("* 监听端口只能输入数字，请输入(0-65535)范围数字！");
			result.status = false;
			$(input).val("");
			//return result;
		}else{
			if(eval($.trim(""+$(input).val())) > 65535){
				$("#tip_monitorPort").empty().html("* 监听端口只能输入(0-65535)范围数字！");
				result.status = false;
				$(input).val("");
			}
		}
		//result.msg = "";
		result = validatelbList(result);
		return result;
	}		
	
	function calc() {
		//随着slider的变化 价格部分作出相应的变化
			var buycount = lb.createPeridInput.getValue();
			var count = parseInt(buycount),capacity=parseInt($("#amount").val());	
			$("#span1").html(capacity/100);
			$("#span2").html(count);
			$("#span3").html((count*capacity/100).toFixed(1));
			$("#span4").html((count*capacity*7.2).toFixed(1));		
		};
		function calcChange(){
			var buycount = lb.createPeridInput.getValue();
			var count1 = parseInt(buycount),capacity1=parseInt($("#amount1").val());
			$("#span5").html(capacity1/100);
			$("#span6").html(count1);
			$("#span7").html((count1*capacity1/100).toFixed(1));
			$("#span8").html((count1*capacity1*7.2).toFixed(1));	
		};	
		function validateAgentCode(select){
			var result = {status : true};
			$("#agentMsg").empty();
			var agentId = $("#agentId").val();
			if(agentId&&agentId.length>0){
				com.skyform.service.channelService.checkAgentCode(agentId,function(data){
					if("-1" == data){
						$("#agentMsg").html("渠道优惠码不存在，请重新输入！");
						result.status = false;
					}
				});
			}					
			return result; 
		}