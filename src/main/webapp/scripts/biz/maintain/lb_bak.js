//10.10.242.180
$(function(){
	lb.init();
});
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
	
	createCountInput : null,
	init : function() {
		lb.volumeState = {
				"pending" : "待审核",
				"reject" : "审核拒绝",
				"opening" : "正在开通",
				"changing" : "正在变更",
				"deleting" : "正在销毁",
				"deleted" : "已销毁",
				"running" : "就绪"	,
				"using" : "已挂载",
				"attaching" : "正在挂载",
				"unattaching" : "正在卸载"
		};			
		lb.describeLb();
		lb.describeLbRule();
		lb.describeVM();
		
		
		var inMenu = false;
		
		$("#modifyLbVM").bind('click',function(){			
			//lb.createLbRule();
			lb.modifyLbVM();
		});		
		
//		$("#btnRefresh").bind('click',function(){			
//			lb.describeLb();
//			lb.describeLbRule();
//			lb.describeVM();
//		});	
		
		$("#lbAddvm").bind('click',function(){			
			lb.lbAddvm();
		});			
		
		$("#lbModify").bind('click',function(){
			lb.handleLi(1);
		});		
		
		$("#contextMenu").bind('mouseover',function(){
			inMenu = true;
		});
	
		$("#contextMenu").bind('mouseout',function(){
			inMenu = false;
		});
		
		$("#contextMenu li").bind('click',function(e){
			$("#contextMenu").hide();
			lb.handleLi($(this).index());					
		});
		
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
	
		//定义一个slider能够选择LB存储的大小
		$( "#slider-range-min" ).slider({
			range: "min",
			value: 10,
			min: 10,
			max: 500,
			step: 10,
			slide: function( event, ui ) {
//				var sp = $("#amount01").val();
				$("#amount").val(ui.value);
				calc();
			}
		});
		
		
		
		$( "#amount" ).val($( "#slider-range-min" ).slider( "value" ) );
		
		$("#amount01").bind("blur",function(){
			calc();
		});
		var min=1,max=100,step=1,value=1;
		lb.brandWidthSlider = $( "#bandwidth-range-min" ).slider({
			range: "min",
			value: value,
			min: min,
			max: max,
			step: step,
			slide: function( event, ui ) {
				$("#createBandwidthSize").val(ui.value);
			}
		});
		$("#createBandwidthSize").bind("blur",function(){
			var value = lb.brandWidthSlider.slider("value");
			var newValue = $(this).val();
			if(/^[1-9]+[0-9]*$/.test(""+newValue) &&  parseInt(newValue)>= min && parseInt(newValue) <= max) {
				lb.brandWidthSlider.slider("value",newValue);
			} else {
				$(this).val(value);
			}
		});
		$("#createBandwidthSize").val(value);
		
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
		$("#btn_modifyLb").bind('click',function(e){
			lb.handleLi(0);					
		});	
		//修改lb
		$("#modify_save").bind('click',function(e){
			//只有当选中一个LB存储时修改名称和备注，其他情况友情提示
			var ids = $("#lbTable tbody input[type='checkbox']:checked");
			var instanceName = $("#modifyLbModal  input[name='instance_name']").val();
			var comment = $("#modifyLbModal textarea").val();
			lb.modifyLb($(ids[0]).val(),instanceName,comment);		
		});
		

		//点击挂载按钮
		$("#add_rule").bind('click',function(e){
			lb.handleLi(1);					
		});	
		

		//点击删除按钮
		$("#btn_delete").bind('click',function(e){			
			lb.handleLi(2);					
		});	
		
		$("#btn_modifyLb").attr("disabled",true);
		$("#add_rule").attr("disabled",true);
		$("#btn_delete").attr("disabled",true);
		

		$("#createLB").click(function() {
			if (lb.wizard == null){
				lb.wizard = new com.skyform.component.Wizard($("#wizard-createLB"));	
				lb.wizard.onFinish = function(from,to) {				
					lb.createLb();					
					lb.wizard.close();
				};				
			}
			lb.wizard.reset();
			lb.wizard.render();
		});		
		
		
	},
	
	describeVM : function(){
			var params = {
					"states" : "running",
					"templateType" : 1
			};
			Dcp.biz.apiRequest("/instance/lb/describeInstanceInfos", params, function(data) {
				if (data.code != "0") {
					$.growlUI("提示", "查询用户已经购买的运行状态的资源发生错误：" + data.msg); 
				} else {
					var dom = '';
					for (var i = 0; i < data.data.length; i++) {						
						dom = dom + '<option value="'+ data.data[i].instanceName +'">'+ data.data[i].instanceName +'</option>';
					}										
					
					$("#vmName").append(dom);
				}
			});
	},
	
	createLbRule : function() {		 
		 
		var monitorName = $.trim($("#monitorName").val());
		var lbProtocol = $.trim($("#lbProtocol").val());
		var monitorPort = $.trim($("#monitorPort").val());
		var loopType = $.trim($("#loopType").val());
		var ids = $("#lbTable tbody input[type='checkbox']:checked");
		var id = $(ids[0]).val();
		
		var params = {
				"name" : monitorName,
				"protocol" : lbProtocol,
				"looptype" : loopType,
				"port" : monitorPort,
				"lbid" : id
		};
		
		this.getFormData(params);
		
		Dcp.biz.apiRequest("/instance/lb/createLbRule", params, function(data) {
			if (data.code == "0") {
				$.growlUI("提示", "创建负载均衡监听器成功！"); 
				$("#createLbRule").modal("hide");				
				lb.updateDataTable();
			} else {
				$.growlUI("提示", "创建LB存储失败：" + data.msg); 
			}
		});
		
	},		
	
	// 创建LB存储
	createLb : function() {		
		var isSubmit = true;
		var instanceName = $.trim($("#lbInsName").val());
		var count = 1;
		var storageSize = $.trim($("#amount").val());
		var account = $("#user_name").val();
		var monitorName = 'Monitor';
		var monitorProtocol = $("#monitorProtocol").val();
		var monitorPort = $("#monitorPort").val();
		var loopType = $("#loopType").val();
		
		
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
		var params = {
				"instanceName" : instanceName,
				"count" : 1,
				"storageSize" : 0,
				"ownUserId" : 1115,
				"createUserId" : 1115,
				"name" : monitorName,
				"port" : monitorPort,
				"protocol" : monitorProtocol,
				"looptype" : loopType
		};
		
		this.getFormData(params);
		
		Dcp.biz.apiRequest("/instance/lb/createLbVolumes", params, function(data) {
			if (data.code == "0") {
				$.growlUI("提示", "创建LB存储成功！"); 
				$("#createLbModal").modal("hide");
				// refresh
				lb.updateDataTable();
				lb.wizard.markSubmitSuccess();
				$("#lbInsName").html('');
				$("#monitorName").html('');
				$("#monitorPort").html('');
			} else {
				$.growlUI("提示", "创建LB存储失败：" + data.msg); 
			}
		});
	},
	
	modifyLbVM : function(){
		Dcp.biz.apiRequest("/instance/lb/destroylbRule", {id : lb.modifyLbRuleVM}, function() {
			//lb.describeLbRule();
			$.growlUI("提示", "成功修改负载均衡监听器！");  
			$("#createLbRule").modal("hide");
		},function onError(){
			lb.generateTable();
		});	
		
		var param = {};
		
		$(this.rules_Modify).each(function(i,rule){
			param["firewallRules.rules["+i+"].name"] = rule.name;
			param["firewallRules.rules["+i+"].port"] = rule.port;
			param["firewallRules.rules["+i+"].protocol"] = rule.power;
			param["firewallRules.rules["+i+"].firewall_id"] = lb.lbId;
			
		}); 
		
		Dcp.biz.apiRequest("/instance/lb/addLbRuleVM", param, function() {				
			//lb.describeLbRule();
			$.growlUI("提示", "成功修改负载均衡监听器！");  
			$("#createLbRule").modal("hide");
		},function onError(){
			lb.generateTable();
		});	
		
	},
	
	addModifyLbVM : function(){
		var name = $("#vmName_modify").val();
		var port = $("#vmPort_modify").val();	
		var power = $("#vmPower_modify").val();
		
		var ruleVM = {
				"name" : name,
				"port" : port,		
				"power" : power
			};
		
		if(this.validate(ruleVM)) {
			ruleVM.id = this.id++;
			this.rules_Modify.push(ruleVM);

			var newRow = $(
					"<tr ruleId='" + ruleVM.id + "'>"+
					"<td>" + ruleVM.name + "</td>" + 
					"<td>" + ruleVM.port + "</td>" + 	
					"<td>" + ruleVM.power + "</td>" + 
					"<td><a class='btn btn-del btn-danger '>删除</a></td>"+
					"</tr>"		
			);			
			
			newRow.find(".btn-del").unbind().click(function(){		
				lb.deleteRule2(ruleVM.id);
			});
			
			newRow.insertBefore($("#formTr_modify"));
			
			$("#vmPort_modify").val("");
			$("#vmPower_modify").val("");			
		}
		
	},
	
	lbAddvm : function(){				
		
		var name = $("#vmName").val();
		var port = $("#vmPort").val();	
		var power = $("#vmPower").val();
		
		var ruleVM = {
			"name" : name,
			"port" : port,		
			"power" : power
		};
		
		if(this.validate(ruleVM)) {
			ruleVM.id = this.id++;
			this.rules.push(ruleVM);

			var newRow = $(
					"<tr ruleId='" + ruleVM.id + "'>"+
					"<td>" + ruleVM.name + "</td>" + 
					"<td>" + ruleVM.port + "</td>" + 	
					"<td>" + ruleVM.power + "</td>" + 
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
		//alert('xxx');
		lb.rules_Modify = [];
		lb.modifyLbRuleVM = id;
		
		var params = {
				"states" : "running",
				"templateType" : 1
		};
		Dcp.biz.apiRequest("/instance/lb/describeInstanceInfos", params, function(json) {
			if (json.code != "0") {
				$.growlUI("提示", "查询负载均衡监听器发生错误：" + json.msg); 
			} else {

				Dcp.biz.apiRequest("/instance/lb/describeLbRuleById", {lbid:id}, function(data) {
					if (data.code != "0") {
						$.growlUI("提示", "查询负载均衡监听器发生错误：" + data.msg); 
					} else {	
						$("#lbRule_modify").html('');
						for (var i = 0; i < data.data.length; i++) {
							if (data.code == "0") {
								lb.lbId = data.data[i].lbid;
								var dom = ''								
									+'<tr ruleid="'+ data.data[i].id +'">'
									+'	<td>'+ data.data[i].name +'</td>'
									+'	<td>'+ data.data[i].port +'</td>'
									+'  <td>'+ data.data[i].protocol +'</td>'
									+'  <td><a class="btn btn-del btn-danger " onclick="lb.deleteRuleModify('+ data.data[i].id +')">删除</a></td>'
									+'</tr>';						
								$("#lbRule_modify").append(dom);	
							} else {
								$.growlUI("提示", "创建LB存储失败：" + json.msg); 
							}
								
							var ruleVM = {
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
							+'		<select class="select input-small" id="vmName_modify" style="width:150px" >';
						
						for (var j = 0; j < json.data.length; j++) {
							dom2 = dom2 + '	<option value="'+ json.data[j].instanceName +'">'+ json.data[j].instanceName +'</option>';
						}
						
							
						dom2 = dom2 + '		</select>'
							+'	</td>'
							+'	<td><input type="text" id="vmPort_modify" style="width:50px" /></td>'								
							+'	<td><input type="text" id="vmPower_modify" style="width:50px" /></td>'
							+'	<td>'
							+'		<a class="btn btn-success btn-add" id="lbAddvm" onclick="lb.addModifyLbVM()">添加</a>'
							+'	</td>'
							+'</tr>'
							+'<tr id="errorInfoRow">'
							+'	<td>'
							+'		<span class="text-error" id="name_error"></span>'
							+'	</td>'
							+'	<td colspan="3">'
							+'		<span class="text-error" id="port_error"></span>'
							+'	</td>'
							+'</tr>';
														
						$("#lbRule_modify").append(dom2);	
					}
				},function onError(){
					lb.generateTable();
				});	
			
			}
		},function onError(){
			lb.generateTable();
		});	
	},	
	

	
	deleteRuleModify:function(id) {			
		$(lb.rules_Modify).each(function(i,_rule) {
			if(_rule.id == id) {
				lb.rules_Modify.splice(i,1);
			}
		});
		$("#lbRule_modify").find("tr[ruleId='"+id+"']").remove();
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

	validate : function(rule) {
		var result = true;
		var nameValid = true;
		if($.trim(rule.name+"").length == 0) {
			$("#rule_name").css("border","1px solid red");
			$("#name_error").html("名称不能为空！");
			nameValid = false;
		} else {
			$("#rule_name").removeAttr("style");
			$("#name_error").html("");
		}
		
		var portValid = true;
		if(!/^[1-9]+[0-9]*$/.test("" + rule.port)) {
			$("#rule_port").css("border","1px solid red");
			$("#port_error").html("无效的端口号！");
			portValid = false;
		} else {
			$("#rule_port").removeAttr("style");
			$("#name_error").html("");
		}
		
		result = nameValid && portValid;
		if(!result) {
			$("#errorInfoRow").show();
		} else {
			$("#errorInfoRow").hide();
		}
		
		return result;
	},
	
	generateTable : function(data){
		 
		 lb.datatable.renderByData("#lbTable", {
				"data" : data,
				"columnDefs" : [
				     {title : "<input type='checkbox' id='checkAll'>", name : "id"},
				     {title : "ID", name : "id"},
				     {title : "服务名称", name : "instanceName"},
				     {title : "状态", name : "state"},
				     {title : "容量(GB)", name : "storageSize"},
				     {title : "创建时间", name : "createDate"}
				     
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
						 text = lb.volumeState[text];
					 }
					 if (columnMetaData.name == "createDate") {
						 text = new Date(text).toLocaleString();
					 }
					 return text;
				}, 
				"afterRowRender" : function(rowIndex,data,tr){
					tr.attr("state", data.state).attr("comment", data.comment);
					tr.attr("ownUserId", data.ownUserId);
					tr.attr("instanceId",data.id);
					lb.bindEventForTr(rowIndex, data, tr);					
				},
				"afterTableRender" : function() {
					lb.bindEvent();
				}
		});
		 lb.datatable.addToobarButton("#toolbar4tb2");
		 lb.datatable.enableColumnHideAndShow("right");
	},
	
	bindEventForTr : function(rowIndex, data, tr) {				
		
		$(tr).attr("state", data.optState || data.state);
		$(tr).attr("name", data.instanceName);
		$(tr).unbind().mousedown(				
			function(e) {											
				if (3 == e.which) {					
					$("#lbTable input[type='checkbox']").attr("checked", false);
					$("#checkAll").attr("checked", false);
					tr.find("input[type='checkbox']").attr("checked", true);
					lb.selectedInstanceId = tr.attr("instanceId");
					$("#moreAction").removeClass("disabled");
					document.oncontextmenu = function() {
						return false;
					}
					var screenHeight = $(document).height();
					var top = e.pageY;
					if (e.pageY >= screenHeight / 2) {
						top = e.pageY - $("#contextMenu").height();// 如果鼠标所在位置在屏幕高度中线的下半部分，则弹出框往上弹出
					}
					$("#contextMenu").hide();
					$("#contextMenu").attr(
							"style",
							"display: block; position: absolute; top:"
									+ top + "px; left:" + e.pageX
									+ "px; width: 180px;");
					$("#contextMenu").show();
					e.stopPropagation();
					lb.checkSelected(data);

				}
				lb.showInstanceInfo(data);
		});
		$(tr).click(function() {
			lb.checkboxClick(tr);
		});
	},	
	
	showInstanceInfo : function(instanceInfo) {
		$("div#details span.detail_value").each(function(i,item){
			var prop = $(this).attr("prop");
			$(this).html("" + instanceInfo[""+prop]);
		});
	},
	
	checkSelected : function(selectInstance) {		
		var rightClicked = selectInstance?true:false;
		
		var allCheckedBox = $("#lbTable input[type='checkbox']:checked");
		
		var oneSelected = allCheckedBox.length == 1;
		var hasSelected = allCheckedBox.length > 0;
		
		$(".operation").addClass("disabled");
		
		var state = $(allCheckedBox[0]).parents("tr").attr("state");
		//var state = $("#lbTable tbody input[type='checkbox']:checked").parents("tr").attr("state");			
		 
		$(".operation").each(function(index,operation){
			var condition = $(operation).attr("condition");
			var action = $(operation).attr("action");
			var enabled = true;
			eval("enabled=("+condition+")");
			if(condition == state) {
				$(operation).removeClass("disabled");
//				$(operation).unbind("click").click(function(){
//					lb.onOptionSelected(action||"");
//				});
			} else {
				$(operation).addClass("disabled");
				$(operation).unbind();
			}
		});
		
		
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
		//将自己编写的显示主机的table渲染
		Dcp.biz.apiRequest("/instance/lb/describeLbVolumes", null, function(data) {
			if (data.code != "0") {
				$.growlUI("提示", "查询LB存储发生错误：" + data.msg); 
			} else {	
				if (data.data.length > 0){
					lb.firstRule = data.data[0].id;
					lb.generateTable(data.data); 
				}
			}
		},function onError(){
			lb.generateTable();
		});		
	},
	
	destroylbRule : function(para){	
		
		Dcp.biz.apiRequest("/instance/lb/destroylbRule", {id : para}, function() {				
				lb.describeLbRule();
				$.growlUI("提示", "成功删除负载均衡规则！"); 
		},function onError(){
			lb.generateTable();
		});	
	},
	
	describeLbRuleById : function(id){		
		Dcp.biz.apiRequest("/instance/lb/describeLbRule", {lbid:id}, function(data) {
			if (data.code != "0") {
				$.growlUI("提示", "查询负载均衡监听器发生错误：" + data.msg); 
			} else {	
				$("#showLbRule").html('');
				for (var i = 0; i < data.data.length; i++) {
					
					Dcp.biz.apiRequest("/instance/lb/describeLbRuleVM", {firewallId : data.data[i].id}, function(json) {
						if (json.code == "0") {
							//alert(json.data.length);
							var looptype;
							if(data.data[i].looptype=="min"){
								looptype = "最少链接";
							}
							if(data.data[i].looptype=="looper"){
								looptype = "轮询&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
							}					
							var dom = '<div class=" well">'
							    +' <font size="2">名称：'+ data.data[i].name +'&nbsp;&nbsp;&nbsp;&nbsp;</font>'
							    +'	<font size="2">协议：'+ data.data[i].protocol +'&nbsp;&nbsp;&nbsp;&nbsp;</font>'
							    +'	<font size="2">端口：'+ data.data[i].port +'&nbsp;&nbsp;&nbsp;&nbsp;</font>' 
							    +'	<font size="2">均衡方式：'+ looptype +'&nbsp;&nbsp;&nbsp;&nbsp;</font>' 
							    //+'	<a href="#" onclick="lb.destroylbRule(\'' +  data.data[i].id + '\')" class="btn btn-danger btn-del btn-mini">删除</a>&nbsp;&nbsp;<a href="#" class="btn btn-warning btn-modify btn-mini" id="lbModify">修改</a>'
							    +'		<table class="table"  >'
							    +'			<tr style="font-size:14px;" >'
							    +'				<td>虚机名称</td>'
							    +'				<td>端口号</td>'		    		
							    +'				<td>权重</td>'								    				    		
							    +'			</tr>';
							for (var j = 0; j < json.data.length; j++) {
								dom = dom + '<tr style="font-size:14px;"><td>'+ json.data[j].name +'</td><td>'+ json.data[j].port +'</td><td>'+ json.data[j].protocol +'</td></tr>'; 
							}							
							dom = dom +'</table>'
						    +'</div>';									
							$("#showLbRule").append(dom);	
						} else {
							$.growlUI("提示", "创建LB存储失败：" + json.msg); 
						}
					});
					
					
									
				}
			}
		},function onError(){
			lb.generateTable();
		});		
	},	
	
	describeLbRule : function(){		
		Dcp.biz.apiRequest("/instance/lb/describeLbRule", {lbid:lb.firstRule}, function(data) {
			if (data.code != "0") {
				$.growlUI("提示", "查询负载均衡监听器发生错误：" + data.msg); 
			} else {	
				$("#showLbRule").html('');
				for (var i = 0; i < data.data.length; i++) {
					
					Dcp.biz.apiRequest("/instance/lb/describeLbRuleVM", {firewallId : data.data[i].id}, function(json) {
						if (json.code == "0") {
							//alert(json.data.length);
							var looptype;
							if(data.data[i].looptype=="min"){
								looptype = "最少链接";
							}
							if(data.data[i].looptype=="looper"){
								looptype = "轮询&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
							}					
							var dom = '<div class=" well">'
							    +' <font size="2">名称：'+ data.data[i].name +'&nbsp;&nbsp;&nbsp;&nbsp;</font>'
							    +'	<font size="2">协议：'+ data.data[i].protocol +'&nbsp;&nbsp;&nbsp;&nbsp;</font>'
							    +'	<font size="2">端口：'+ data.data[i].port +'&nbsp;&nbsp;&nbsp;&nbsp;</font>' 
							    +'	<font size="2">均衡方式：'+ looptype +'&nbsp;&nbsp;&nbsp;&nbsp;</font>' 
							    //+'	<a href="#" onclick="lb.destroylbRule(\'' +  data.data[i].id + '\')" class="btn btn-danger btn-del btn-mini">删除</a>&nbsp;&nbsp;<a href="#" class="btn btn-warning btn-modify btn-mini" id="lbModify">修改</a>'
							    +'		<table class="table"  >'
							    +'			<tr style="font-size:14px;" >'
							    +'				<td>虚机名称</td>'
							    +'				<td>端口号</td>'		    		
							    +'				<td>权重</td>'								    				    		
							    +'			</tr>';
							for (var j = 0; j < json.data.length; j++) {
								dom = dom + '<tr style="font-size:14px;"><td>'+ json.data[j].name +'</td><td>'+ json.data[j].port +'</td><td>'+ json.data[j].protocol +'</td></tr>'; 
							}							
							dom = dom +'</table>'
						    +'</div>';									
							$("#showLbRule").append(dom);	
						} else {
							$.growlUI("提示", "创建LB存储失败：" + json.msg); 
						}
					});
					
					
									
				}
			}
		},function onError(){
			lb.generateTable();
		});		
	},	
	
	bindEvent : function() {
		
		$("tbody tr").mousedown(function(e) {
			
		    if (3 == e.which) {
		             document.oncontextmenu = function() {return false;};  
		             var screenHeight = $(document).height();
		             var top = e.pageY;
		             if(e.pageY>=screenHeight/2 ) {
		             	top = e.pageY-$("#contextMenu").height();
		             }
		             $("#contextMenu").hide();  
		             $("#contextMenu").attr("style","display: block; position: absolute; top:"  
		             + top  
		             + "px; left:"  
		             + e.pageX  
		             + "px; width: 180px;");  
		             $("#contextMenu").show();  
		             e.stopPropagation();
		             var state = $("#lbTable tbody input[type='checkbox']:checked").parents("tr").attr("state");	
		             lb.showOrHideOptByState(state);
		     }
		});  
		
		$("#lbTable tbody input[type='checkbox']").unbind("click").bind("click", function() {
			
			var state = $("#lbTable tbody input[type='checkbox']:checked").parents("tr").attr("state");			
			
			lb.showOrHideOptByState(state);
		});
		
		$("#checkAll").unbind("click").bind("click", function(e) {			
			var checked = $(this).attr("checked") || false;
	        $("#lbTable input[type='checkbox']").attr("checked",checked);	 
	        lb.showOrHideOpt();
	        e.stopPropagation();
		});
		
		$("#lbTable tbody tr").unbind("click").bind("click", function() {						
			lb.describeLbRuleById($(this).find("td:eq(1)").html());
		});
		
	},
	
	getFormData : function(param){
		$(this.rules).each(function(i,rule){
			param["firewallRules.rules["+i+"].name"] = rule.name;
			param["firewallRules.rules["+i+"].port"] = rule.port;
			param["firewallRules.rules["+i+"].protocol"] = rule.power;
		});		
	},
	
	// 修改LB存储名称和描述  createUserId??????
	modifyLb : function(id,name,comment) {		
				var params = {
						"id" : id,
						"instanceName": name,
						"comment" : comment,
						"modOrLarge" : 1
				};
				Dcp.biz.apiRequest("/instance/lb/modifyLBVolume", params, function(data){
					if(data.code == "0"){
						$.growlUI("提示", "修改LB存储信息成功！"); 
						$("#modifyLbModal").modal("hide");
						// refresh
						lb.updateDataTable();
					} else {
						$.growlUI("提示", "修改LB存储信息发生错误：" + data.msg); 
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
	updateDataTable : function() {
		Dcp.biz.apiRequest("/instance/lb/describeLbVolumes", null, function(data) {
			if (data.code == 0) {
				lb.datatable.updateData(data.data);
			}
		});
		lb.describeLbRule();
	},
	
	getCheckedArr : function() {
		return $("#lbTable tbody input[type='checkbox']:checked");
	},
	// 根据选中的虚拟硬盘的选择状态判断是否将修改选项置为灰色
	
	
	showOrHideOpt : function() {						
		var checkboxArr = lb.getCheckedArr();
		if(checkboxArr.length == 0){
			$("#btn_delete").attr("disabled",true);
		} else {
			$("#btn_delete").attr("disabled",false);
		}
		if(checkboxArr.length == 1){
			$("#btn_modifyLb").attr("disabled",false);
			$("#add_rule").attr("disabled",false);
		} else {
			$("#btn_modifyLb").attr("disabled",true);
			$("#add_rule").attr("disabled",true);
		}
	},
	
	showOrHideOptByState : function(state) {	

		var checkboxArr = lb.getCheckedArr();

		if(checkboxArr.length == 1){
			$("#btn_modifyLb").attr("disabled",false);
			$("#add_rule").attr("disabled",false);
			if (state == "running"){
				$("#btn_delete").attr("disabled",false);
			}else{
				$("#btn_delete").attr("disabled",true);
			}
		} else {
			$("#btn_delete").attr("disabled",true);
			$("#btn_modifyLb").attr("disabled",true);
			$("#add_rule").attr("disabled",true);
		}
	},

	handleLi : function(index){
		
		if(index==0){
		 
			//只有当选中一个LB存储时修改名称和备注，其他情况友情提示
			var ids = $("#lbTable tbody input[type='checkbox']:checked");
			if(ids.length == 1){
				var oldInstanceName = lb.getCheckedArr().parents("tr").find("td:eq(2)").html();
				var oldComment = lb.getCheckedArr().parents("tr").attr("comment");
				$("#modInsName").val(oldInstanceName);
				$("#modComment").val(oldComment);
				$("#modifyLbModal").modal("show");				
			} else {
				$.growlUI("提示", "修改只能对一个LB存储进行操作，请重新进行选择！"); 
			}						
		}
		else if(index==1){
			 
			var ids = $("#lbTable tbody input[type='checkbox']:checked");			
			var id = $(ids[0]).val();
			var _state = lb.getCheckedArr().parents("tr").attr("state");
			var ownUserId = lb.getCheckedArr().parents("tr").attr("ownUserId");
			lb.modifyLbRule(id);			
			$("#createLbRule").modal("show");
						
		}
		else if(index==2){
			 	
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
		}
	}, 
	
	
	
	
	initExpandSlider : function(size){
		$( "#slider-range-min1" ).slider({
			range: "min",
			value: parseInt(size),
			min: parseInt(size),
			max: 500,
			step: 10,
			slide: function( event, ui ) {			
				$("#amount1").val(ui.value);
//				var sp = $("#amount01").val();
				calcChange();
			}
		});
		$( "#amount1" ).val($( "#slider-range-min1" ).slider( "value" ) );
		$("#amount1").bind("keydown",function(e){
			if (e.which == 13) { // 获取Enter键值
				e.preventDefault(); // 阻止表单按Enter键默认行为，防止按回车键提交表单
				var realValue1 = parseInt(parseInt($("#amount1").val())/10) * 10 ;
				$( "#slider-range-min1" ).slider( "option", "value", realValue1);
				$("#amount1").val(realValue1);			
			}
		});
		$("#amount1").bind("blur",function(e){
				e.preventDefault(); // 阻止表单按Enter键默认行为，防止按回车键提交表单
				var realValue1 = parseInt(parseInt($("#amount1").val())/10) * 10 ;
				$( "#slider-range-min1" ).slider( "option", "value", realValue1);
				$("#amount1").val(realValue1);			
		});
   		
   	}, 
   	
   	destroyLb : function(lbIds) {
		var confirmModal = new com.skyform.component.Modal(new Date().getTime(),"销毁LB存储","<h4>您确认要销毁弹性块吗?</h4>",{
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
								$.growlUI("提示", "销毁LB存储成功！"); 
								confirmModal.hide();
								// refresh
								lb.updateDataTable();
							} else {
								$.growlUI("提示", "销毁LB存储失败：" + data.msg); 
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
	}	
	};


	function validatelbInsName(input){
		var scoreReg = /^[\u4E00-\u9FA0A-Za-z\-0-9\_]+$/;
				
		var result = {status : true};
		if($.trim(""+$(input).val()) == '') {
			result.msg = "请填写不包括非法字符的实例名称";
			result.status = false;
		}
		
		if(! scoreReg.exec($.trim(""+$(input).val()))) {
			result.msg = "请填写不包括非法字符的实例名称";
			result.status = false;
		}
		
		return result;			
	}	
	
	function validatemonitorPort(input){
		var scoreReg = /^[0-9]*$/;
		var result = {status : true};
		if($.trim(""+$(input).val()) == '') {
			result.msg = "请用数字填写监听端口";
			result.status = false;
		}
		
		if(! scoreReg.exec($.trim(""+$(input).val()))) {
			result.msg = "请用数字填写监听端口";
			result.status = false;
		}
		
		return result;			
	}	
	
	function calc() {
		//随着slider的变化 价格部分作出相应的变化
			var buycount = lb.createCountInput.getValue();
			var count = parseInt(buycount),capacity=parseInt($("#amount").val());	
			$("#span1").html(capacity/100);
			$("#span2").html(count);
			$("#span3").html((count*capacity/100).toFixed(1));
			$("#span4").html((count*capacity*7.2).toFixed(1));		
		};
		function calcChange(){
			var buycount = lb.createCountInput.getValue();
			var count1 = parseInt(buycount),capacity1=parseInt($("#amount1").val());
			$("#span5").html(capacity1/100);
			$("#span6").html(count1);
			$("#span7").html((count1*capacity1/100).toFixed(1));
			$("#span8").html((count1*capacity1*7.2).toFixed(1));	
		};			   	