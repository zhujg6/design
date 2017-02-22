//当前刷新实例的类型为虚拟机
window.currentInstanceType='vm';

//$(function() {
//	VM.init();	
//});

window.Controller = {
		init : function(){
			VM.init();			
		},
		refresh : function(){
			VM.describleVM();			
		}
	}

var RuleState4Yaxin = {0:"处理中",9:"成功"};
var feeUnit = 1000;
var modifyFirewall = {
		rules : [],
		exportRules : [],
		rule_ports : [],
		rule_protocols : [],
		container : "#modifyfirewallrule",
		commonRulesCfg : "#modifycommonRules",
		id : 1,
		
		_getPortArray : function(port1){
			port1 = ""+port1;
			var port = [];
			if(port1.indexOf("-")>0){
				port = port1.split("-");
				port[0] = Number(port[0]);
				port[1] = Number(port[1]);
			}
			else {
				port[0] = Number(port1);
				port[1] = Number(port1);
			}
			return port;
		},
		_ruleEqualsTo : function(rule,anotherRule){			
			if(rule.protocol != anotherRule.protocol) return false;
			if(rule.direction != anotherRule.direction) return false;
			
			var port = this._getPortArray(rule.port);
			var trgPort = this._getPortArray(anotherRule.port);
			if(port[1]<trgPort[0]||port[0]>trgPort[1])return false;	
			
			var ip = rule.ip.split("/")[0];
			var anIp = anotherRule.ip.split("/")[0];
			if(ip!==anIp)return false;	
			
			return true;
		},
		_validateExisted : function(rule){
			var result = false;
			$(this.rules).each(function(i,_rule){
				if(modifyFirewall._ruleEqualsTo(rule, _rule)){
					result = true;
					return false;
				}
			});
			return result;
		},		
		
		getFormData : function(param){
			param.firewallRules = {};
			param.firewallRules.rules = [];
			$(FireWallCfg.rules).each(function(i,rule){				
				param.firewallRules.rules.push(rule);
			});
		},
		
		init : function(firewallid) {
			modifyFirewall.rules = [];
			modifyFirewall.container = $(modifyFirewall.container);
			modifyFirewall.container.find("tr[id != 'formTr'][id != 'errorInfoRow']").remove();
			$("#errorInfoRow",modifyFirewall.container).hide();
			modifyFirewall.container.find(".btn-add").unbind().click(function(){
				modifyFirewall.addRule(firewallid);
			});	
			$("a#exportFirewall").unbind().click(function(){
				modifyFirewall.exportFirewall();
			});
			$("a#importFirewall").unbind().click(function(){
				AutoUpdater.stop();				
				$("#upload_save").removeClass("disabled").attr("disabled",false);				
				$("#uploadDiv").show();
			});
			
			$("#upload_save").unbind("click").bind("click", function() {	
				modifyFirewall.importFirewall();
			});			
			$("#upload_abort").unbind("click").bind("click", function() {
				var vmId = $("#modifyFirewallModal #vmId").val();				
				VM.refreshFirewall(vmId);
				modifyFirewall.resetUploadDiv()
//				if (currXhr) {
//		            currXhr.abort();
//		        }
			});
			$("#rule_protocol",this.container).bind("change",function(){
				$("#modifyFirewallModal input[type='text']").removeAttr("style");
				$("#errorInfoRow",modifyFirewall.container).hide();
				var protocol = $(this).val();
				if("icmp" == protocol) {
					$("#rule_port",modifyFirewall.container).attr("readonly",true).val("");							
				} else {
					$("#rule_port",modifyFirewall.container).attr("readonly",false);					
				}
				if("ip" == protocol){
					$("#rule_ip",modifyFirewall.container).attr("readonly",false);
					$("#rule_port",modifyFirewall.container).attr("readonly",true).val("");	
				} else {
					$("#rule_ip",modifyFirewall.container).attr("readonly",true).val("");
				}	
			});
			$("#rule_protocol",this.container).val("tcp");
			$("#rule_protocol",this.container).change();

			var commonRulesContainer = $(modifyFirewall.commonRulesCfg);
			
			commonRulesContainer.empty();
			
			$(com.skyform.service.FireWallRule).each(function(i,rule){
				var ruleItem = $("<button class='btn btn-success btn-mini'>"+rule.name+"</button>");
				ruleItem.unbind().click(function(e){
					e.preventDefault();
					$(rule.port).each(function(p,rule_ports){
						$(rule.protocol).each(function(r,rule_protocols){
							var newRule = {
								name : rule.name,
								port : rule_ports.port,
								protocol : rule_protocols.type,
								direction : rule.direction,
								ip : ""
							};
							modifyFirewall.addRuleAction(newRule);
							var newRuleUpdirection = {
									name : rule.name,
									port : rule_ports.port,
									protocol : rule_protocols.type,
									direction : "egress",
									ip : ""
							};
							modifyFirewall.addRuleAction(newRuleUpdirection);
						});
					});
					/**
					var newRule = {
						name : rule.name,
						port : rule.port,
						protocol : rule.protocol,
						direction : rule.direction
						//firewallId : firewallid,
						//state : "processing"
					};
					modifyFirewall.addRuleAction(newRule);
					var newRuleUpdirection = {
							name : rule.name,
							port : rule.port,
							protocol : rule.protocol,
							direction : "egress"
							//firewallId : firewallid,
							//state : "processing"
					};
					modifyFirewall.addRuleAction(newRuleUpdirection);
					//**/
				});
				ruleItem.appendTo(commonRulesContainer);
			});
			this._resetFromRow();
		},
		
		
		addRule : function(firewallid){
			var name = $("#rule_name",modifyFirewall.container).val();
			var port = $("#rule_port",modifyFirewall.container).val();
			var protocol = $("#rule_protocol",modifyFirewall.container).val();
			var direction = $("#rule_direction",modifyFirewall.container).val();
			var ip = $("#rule_ip",modifyFirewall.container).val();
			
//			var rule = {
//				"name" : name,
//				"port" : port,
//				"protocol" : protocol,
//				"direction" : direction,
//				"firewallId" : firewallid,
//				"state" : "processing"
//			};
			var rule = {
					"vmId" : $("#modifyFirewallModal #vmId").val(),
					"securityGroupId" : $("#modifyFirewallModal #groupId").val(),
					"securityGroupRules" : 
						[{
							"name" : name,
							"port" : port,
							"protocol" : protocol,
							"direction" : direction,
							"ip" : ip
					}]
				}

			modifyFirewall.addRuleAction(rule.securityGroupRules);
		},
		_addRule : function(rule) {			
			if(modifyFirewall.validate(rule)) {				
				//rule.id = modifyFirewall.id++;
				if(rule instanceof Array){
					modifyFirewall.rules = rule;
					rule = rule[0];
				}
				else modifyFirewall.rules.push(rule);			
				var newRow = modifyFirewall._generateNewRule(rule);
				modifyFirewall._bindEventForBtns(newRow, rule);				
				newRow.insertBefore($("#formTr",modifyFirewall.container));
				modifyFirewall._resetFromRow();
				$("#rule_protocol",modifyFirewall.container).change();
				
			}
		},
		_addRuleForShow : function(rule) {				
			//rule.id = modifyFirewall.id++;
			if(rule instanceof Array){
				modifyFirewall.rules = rule;
				rule = rule[0];
			}
			else modifyFirewall.rules.push(rule);			
			var newRow = modifyFirewall._generateNewRule(rule);
			modifyFirewall._bindEventForBtns(newRow, rule);				
			newRow.insertBefore($("#formTr",modifyFirewall.container));
			modifyFirewall._resetFromRow();			
		},
		addRuleAction : function (rule){
			//添加
			if(modifyFirewall.validate(rule)) {
				var group = {
					"vmId" : $("#modifyFirewallModal #vmId").val(),
					"securityGroupId" : $("#modifyFirewallModal #groupId").val(),
					"securityGroupRules" : []
				};
				if(rule instanceof Array){
					group.securityGroupRules = rule;
				}
				else group.securityGroupRules.push(rule);				
				VM.firewallService.addSecurityGroupRule(group,function(data){
					rule.state = 0;
					modifyFirewall._addRule(rule);										
				},function(data){
					$.growlUI(Dict.val("common_tip"), "添加规则失败：" + data); 
				});
			}
		},
		_generateNewRule : function(rule) {
			var newRow = $(
					"<tr ruleId='" + rule.id + "'>"+
						modifyFirewall._generateContent(rule) +
					"</tr>"		
			);
			return newRow;
		},
		_generateContent : function(rule) {
			var html = ""+
			"<td>" + rule.name + "</td>" + 
			"<td>" + (rule.port!=null?rule.port : "" ) + "</td>" + 
			"<td>" + (null!=rule.ip&&rule.ip.length>0?rule.ip : "" ) + "</td>" + 
			"<td>" + rule.protocol + "</td>" + 
			"<td>" + modifyFirewall.switchDirection(rule.direction) + "</td>" 
			if (rule.state)
			{
				//if (true)	
				if (rule.state == 9)
				{
					html += "<td id='"+rule.securityGroupRuleId+"'><button class='btn btn-danger btn-del btn-mini' ruleId='"+rule.securityGroupRuleId+"'>删除</button></td>"; 
				}
				else if (rule.state == 0)
				{
					html += "<td>正在处理</td>";
				}
				else
				{
					//html += "<td>失败<button class='btn btn-danger btn-del btn-mini' ruleId='"+rule.securityGroupRuleId+"'>删除</button></td>";
					html += "<td>失败</td>";
				}
			}
			else
			{
				html += "<td>正在处理</td>";
			}
			return html;
		},
		_bindEventForBtns : function(row,rule) {
			row.find(".btn-modify").click(function(){
				row.html(
						"<td><input type='text' name='ruleName' value='" + rule.name  + "'/></td>" + 
						"<td><input type='text' name='rulePort' class='input input-mini' value='" + rule.port  + "'/></td>" + 
						"<td><input type='text' name='ruleIp' readonly class='input input-mini' value='" + rule.ip  + "'/></td>"+
						"<td>" +
							"<select name='ruleProtocol' class='select input-small'>" +
								"<option value='udp'>UDP</option>" + 
								"<option value='tcp'>TCP</option>" + 
								"<option value='icmp'>ICMP</option>" +
								"<option value='ip'>IP</option>" +
							"</select>" +
						"</td>" + 
						"<td>" +
							"<select name='ruleDirection' class='select input-small'>" +
								"<option value='ingress'>下行</option>" +
								"<option value='egress'>上行</option>" +
							"</select>" +
						"</td>" +
						"<td> <button class='btn btn-primary btn-save'>保存</button></td>"
				);
				
				row.find(".btn-save").click(function(){
					modifyFirewall.update(row);
				});
				
			});
			
			row.find(".btn-del").click(function(){
				try{
					modifyFirewall.deleteRule(row.attr("ruleid"));
				}catch(e) {
					//console.error(e);
				}
			});
		},
		_resetFromRow : function() {
			$("#rule_name",modifyFirewall.container).val("");
			$("#rule_port",modifyFirewall.container).val("");
			$("#rule_port",modifyFirewall.container).attr("readonly",false);
			$("#rule_protocol",modifyFirewall.container).val("");
			$("#rule_direction",modifyFirewall.container).val("");
			$("#rule_ip",modifyFirewall.container).val("");
		},
		deleteRule:function(id) {
			$(modifyFirewall.rules).each(function(i,_rule) {
				if(_rule.securityGroupRuleId +""== id+"") {
					modifyFirewall.rules.splice(i,1);
					//modifyFirewall.container.find("tr[ruleId='"+id+"']").remove();
					//modifyFirewall.container.find("tr[ruleId='"+id+"']").find(".btn-del").parent("td")[0].append("正在处理啊");
					$("#"+id).html("正在处理");
					//删除
					return false;
				}
			});
			/*VM.firewallService.deleteRule(id,function(data){
				cnsole.log(data);
			},function(e){
				console.log(e);
			});*/
			var param = {
				"securityGroupRuleId" : id,
				"securityGroupId" : $("#modifyFirewallModal #groupId").val(),
				"vmId" : $("#modifyFirewallModal #vmId").val()
			}
			Dcp.biz.apiAsyncRequest("/instance/firewall/deleteSecurityGroupRule", param, function(data) {
//				if (data.code != "0") {
//				} else {				
//				}
				VM.cfgFirewall();
			},function onError(e){
				$.growlUI(Dict.val("common_tip"), "删除规则失败：" + e); 
			});	
		},
		update : function(newRow){
			var id = newRow.attr("ruleId");
			var name = newRow.find("input[name='ruleName']").val();
			var port = newRow.find("input[name='rulePort']").val();
			var protocol = newRow.find("select[name='ruleProtocol']").val();
			var direction = newRow.find("select[name='ruleDirection']").val();
			var ip = newRow.find("select[name='ruleIp']").val();
//			var rule = {
//				"id" : id,
//				"name" : name,
//				"port" : port,
//				"protocol" : protocol,
//				"direction" : direction
//			},
			
			var rule = {
					"vmId" : $("#modifyFirewallModal #vmId").val(),
					"securityGroupId" : $("#modifyFirewallModal #groupId").val(),
					"securityGroupRules" : 
						[{
							"name" : name,
							"port" : port,
							"protocol" : protocol,
							"direction" : direction,
							"ip" : ip
					}]
				}
			
			if(modifyFirewall.validate(rule)) {
				$(modifyFirewall.rules).each(function(i,_rule) {
					if(_rule.id == rule.id) {
						_rule.name = rule.name;
						_rule.port = rule.port;
						_rule.protocol = rule.protocol;
						_rule.direction = rule.direction;
						
						newRow.html(modifyFirewall._generateContent(rule));
						modifyFirewall._bindEventForBtns(newRow,rule);
						return false;
					}
				});
				
				
			}
			
		},
		validate : function(rule,update) {
			if(rule instanceof Array){
				rule = rule[0];
			}			
			var result = true;
			var nameValid = true;
			var nameValidator = update ? "input[type='text'][name='ruleName']" : "#rule_name";
			var portValidator = update ? "input[type='text'][name='rulePort']" : "#rule_port";
			var ipValidator = update ? "input[type='text'][name='ruleIp']" : "#rule_ip";
			if($.trim(rule.name+"").length == 0) {
				$(nameValidator,modifyFirewall.container).css("border","1px solid red");
				$("#name_error",modifyFirewall.container).html("名称不能为空！");
				nameValid = false;
			} else {
				$(nameValidator,modifyFirewall.container).removeAttr("style");
				$("#name_error",modifyFirewall.container).html("");
			}
			
			var portValid = true;
			if(rule.protocol != 'icmp' && rule.protocol != 'ip') {
				var port = [];
				if(rule.port.indexOf("-")> 0){
					port = rule.port.split("-");
					if(port.length == 2){
						port[0] = Number(port[0]);
						port[1] = Number(port[1]);
					}
				}
				else port[0] = Number(rule.port);
				$(port).each(function(index,item){
					if(!/^[1-9]+[0-9]*$/.test("" + item)||item > 65535) {
						$(portValidator,modifyFirewall.container).css("border","1px solid red");
						$("#port_error",modifyFirewall.container).html("无效的端口号！");
						portValid = false;
					}
					//开放80、443的上行端口
					else if((item==80&&rule.direction!='egress')||(item==443&&rule.direction!='egress')){
					  if(CommonEnum.offLineBill){//行业云不效验80,443
					  }else{//公有云效验80,443
						$(portValidator,modifyFirewall.container).css("border","1px solid red");
						$("#port_error",modifyFirewall.container).html("该端口暂不开放，如需开放此端口，请在备案完成后申请打开！");
						portValid = false;
					  }
					}
					else if(nameValid){
						$(portValidator,modifyFirewall.container).removeAttr("style");
						$("#name_error",modifyFirewall.container).html("");
					}
				});	
				if(port.length == 2 && port[1]<port[0]){
					$(portValidator,modifyFirewall.container).css("border","1px solid red");
					$("#port_error",modifyFirewall.container).html("无效的端口号！");
					portValid = false;					
				}
			}
			var ipValid = true;
			if(rule.protocol == 'ip'&&(null!=rule.ip && rule.ip.length>0)) {
				var _IPValidate = function(ip) {
					return /^([0-9]|[1-9][0-9]|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9][0-9]|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9][0-9]|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9][0-9]|1\d\d|2[0-4]\d|25[0-5])$/.test(ip);
				};
				var _NumberCheck = function(num){
					return /^[0-9]*$/.test(num);
				};
				var _showIpError = function(){
					$(ipValidator,modifyFirewall.container).css("border","1px solid red");
					$(".portCol").attr("colspan","0");
					$("#ip_error",modifyFirewall.container).html("无效的IP地址！");
					ipValid = false;
				};
				var inputIp = [];
				if(rule.ip.indexOf("/")>0){
					inputIp = rule.ip.split("/");
					if(!_IPValidate(inputIp[0]) ){					
						 _showIpError();
					}
					else if(!_NumberCheck(inputIp[1])|| Number(inputIp[1])<0 || Number(inputIp[1])>32){
						 _showIpError();
					}
				}
				else {
					inputIp[0] = rule.ip;
					if(!_IPValidate(inputIp[0]) ){					
						_showIpError();
					}
				}
			}
			var notDuplicate = true;
			if(modifyFirewall._validateExisted(rule)) {
				$("#formTr",modifyFirewall.container).css("border","1px solid red");
				$("#port_error",modifyFirewall.container).html("端口号、协议、方向不能重复!");
				notDuplicate = false;
			} else if(portValid){
				$("#formTr",this.container).removeAttr("style")
				$("#port_error",this.container).html("");
			} else if(ipValid){
				$("#formTr",this.container).removeAttr("style")
				$("#ip_error",this.container).html("");
			}

			
			result = nameValid && portValid && ipValid && notDuplicate ;
			if(!result) {
				$("#errorInfoRow",modifyFirewall.container).show();
			} else {
				$("#errorInfoRow",modifyFirewall.container).hide();
			}
			
			return result;
		},
		reset : function (){
			modifyFirewall.container = "#firewallrule";
			modifyFirewall.commonRulesCfg = "#commonRules";
		},
		switchDirection : function(direction){
			switch (direction){
				case "ingress" : return "下行";
				case "egress" : return "上行";
				default : return "下行";
			}
		},
		exportFirewall : function(){
			var data = JSON.stringify(modifyFirewall.exportRules);	 
			$("#exportForm #param").val(data);			
	        window.open("","newWin");
	        $("#exportForm").submit();
		},
		importFirewall : function(){
			var _filename = $('#file2upload').val();				
			if(!_filename){
				$("#tipFile2upload").text("请选择文件!");
				return;
			}else{
				$("#tipFile2upload").text("");
			}
//			var re = /^(doc|pdf|txt|rar|zip)$/;
			var _extend = _filename.substring(_filename.lastIndexOf(".")+1);
			var re = /^(xls)$/;
			var isValid = (_extend && re.test(_extend));
			if (!isValid) {
				$("#tipFile2upload").text("请上传.xls文件!");
				return;
			}else{
				$("#tipFile2upload").text("");
			}
			$("#upload_save").addClass("disabled");
			$("#upload_save").attr("disabled",true);
			
			var vmId = $("#modifyFirewallModal #vmId").val();
			var groupId = $("#modifyFirewallModal #groupId").val();
		    var options = { 
		            data: { "vmId":vmId, "groupId":groupId },
//		            beforeSend : modifyFirewall.showRequest,
		            type : "POST",
		            dataType:  'json',
		            timeout  : 1800000,
		            //uploadProgress : object.showUploadProgress,
		            success: function(rs) {
						$("#upload_save").removeClass("disabled").attr("disabled",false); 
						modifyFirewall.resetUploadDiv();
						if(null!=rs&&rs.code == 0){
							$.growlUI("提示","导入已执行！"+rs.msg); 
						}else if(null!=rs&&rs.msg!== null){
							$.growlUI("提示","导入已执行！"+rs.msg); 
						}
						else $.growlUI("提示","导入失败！文件格式不正确！" ); 
				        VM.selectedInstanceId = vmId;
		            	VM.cfgFirewall();		            	
		            	VM.refreshFirewall(vmId);
		    	    },			            	
		            error    : function() {
		            	$.growlUI("提示", "导入失败！"); 
		    		}
		    }; 
	        $("#uploadObjectForm").ajaxSubmit(options);
		},
		showRequest: function(xhr, opts) {
            currXhr = xhr;
        },	
		resetUploadDiv : function(){
			$("#uploadDiv").hide();
			$("#file2upload").val("");
			$("#tipFile2upload").empty();
		}
	};
function validateApplyCount(input) {
	var result = {
		status : true
	};
	var validateResult = VM.countFiled.validate();
	if(validateResult.code != 0) {
		result.status = false;
	}
	return result;
};

function msnap(){
	
	var row = VM.datatable.getContainer().find("tbody").find("input[type='checkbox']:checked").closest('tr');
	
	window.location.href = "snap2.jsp?code=snap&vmId="+row.attr("instanceId")+"&state="+row.attr("state");
};

function validateDuplicateNameBeforeCommit(){
	var result = {
		status : true
	};
//	VM.PortalInstanceService.callApi = com.skyform.service.callSyncApi;
//	var instanceName = $("#instanceName").val();
//	var code="vm";
//	VM.PortalInstanceService.checkDuplcatedName(instanceName,code,function(data){
//		result.status = data;
//		result.msg = "虚拟机名称重复!";
//	},function(error){
//		result.status = false;
//		result.msg = error;
//	});
	return result;
};
function validateQuota(){
	var result = {
		status : true
	};
//	var instance = vmJson.getVM4JsonInstance();
//	VM.service.callApi = com.skyform.service.callSyncApi;
//	VM.service.ensureResourceEnough(instance, function(data){
//		VM.service.callApi = com.skyform.service.callApi;
//	},function(error){
//		result.status = false;
//		result.msg = error;
//		VM.service.callApi = com.skyform.service.callApi;
//	});
	return result;
}


var VM = {
	microType : ["微型","小型A"],
	microCpu : 1,
	microMem : ["0.5","1"],
	isWin : false,	
	inited : false,
	initOsed:false,
	initebs : false,
	wizard : null,
	modifyVMNameModal : null,
	modifyVMConfigurationModal : null,
	changeVMOsModal:null,
	instanceName : null,
	selectedInstanceId : null,
	selectedOsId:null,
	selectedInstanceOsId:null,
	selectedInstanceDisk:null,
	selectedInstanceOs:null,
	selectedOsDisk:null,
	inMenu : null,
	datatable : new com.skyform.component.DataTable(),
	dataOstable : new com.skyform.component.DataTable(),
	VMState : [],
	serviceOfferingsData : [],
	countFiled : null,
	defaultNetwork : null,
	_generateContent_tmp : null,
	quota : 99,
	quickVMModal : null,
	backupDataTable : null,
	add2NetTable : null,
	removeFromNetTable : null,
	customerIdent :null,
	service : com.skyform.service.vmService,
	firewallService : com.skyform.service.FirewallService,
	PortalInstanceService : com.skyform.service.PortalInstanceService,
	changeFirewallModal:null,
	selectTable:null,
	groupQuota:10,
	groupTotal:0,
	selectSGid:0,
	sgInstances:null,
	ssRadioInited:false,
	
	init : function() {
		VM.inMenu = false; // 用于判断鼠标当前是否在下拉操作框中即$("#contextMenu")和$("#dropdown-menu")
		VM.selectedInstanceId = null;
		VM.instanceName = null;
		VM.instances = [],
		VM.VMState = {
			"pending" : "待审核",
			"reject" : "审核拒绝",
			"opening" : "正在开通",
			"changing" : "正在变更",
			"deleting" : "正在销毁",
			"deleted" : "已销毁",
			"running" : "运行中",
			"using" : "正在使用",
			"attaching" : "正在挂载",
			"unattaching" : "正在卸载",
			"stopping" : "正在关机",
			"starting" : "正在开机",
			"restarting" : "正在重启",
			"resetting" : "正在重启",
			"error" : "错误",
			"closed" : "已关机",
			"backuping" : "正在创建快照",
			"restoreing" : "正在恢复快照",
			"snapshotDeling" : "正在删除快照"
		};
		$("#modifyFirewallModal").on('hide',function(){
			modifyFirewall._resetFromRow();
			window.currentInstanceType='vm';
		})
		if($("#modifyFirewallModal").attr("class").indexOf("in")==-1){
			
		}
		$("#openMore").click(function(){
			setTimeout(function(){
				if($("#learn-more-content").attr("class").indexOf("in")==-1){
					$("#openMore").empty().html("展开");
				}
				else if($("#learn-more-content").attr("class").indexOf("in")!=-1){
					$("#openMore").empty().html("收起");
				}
			},10);
			
			
//			if("收起" == $("#openMore").html()||$("#learn-more-content").attr("class").indexOf("in")!=-1){
//				$("#openMore").empty().html("展开");
//			}
//			else if("展开" == $("#openMore").html()||$("#learn-more-content").attr("class").indexOf("in")==-1){
//				$("#openMore").empty().html("收起");
//			}
			
//			if($("#learn-more-content").attr("class").indexOf("in")==-1){
//				$("#openMore").empty().html("收起");
//			}
//			else $("#openMore").empty().html("展开");
		});
		
		$("#content_container #checkAll").attr("checked", false);
		$("#tbody2 input[type='checkbox']").attr("checked", false);
		$("#moreAction").addClass("disabled");

		$("#dropdown-menu").unbind('mouseover').bind('mouseover', function() {
			VM.inMenu = true;
		});
		$("#dropdown-menu").unbind('mouseout').bind('mouseout', function() {
			VM.inMenu = false;
		});
		$("#dropdown-menu li").unbind('click').bind('click', function(e) {
			if (!$(this).hasClass("disabled"))
				VM.onOptionSelected($(this).attr("action"));
		});

		$("#updateData").unbind().click(function() {
			VM.describleVM();
		});
		if(CommonEnum.offLineBill){
			$("#quickVM").attr("style","display:none;");  //行业云
		}else{
			$("#quickVM").attr("style","display:inline;");
		}
		VM.describleVM();
		VM.getBillTypeList();
		VM._initWizard();
		$("#bindVM2Net").unbind('click').bind('click', function(e) {
			var allCheckedBox = $("#tbody2 input[type='checkbox']:checked");		
			var vmId = $(allCheckedBox[0]).parents("tr").attr("instanceId");
			var routeId = $("#add2netTable input[type='radio']:checked").val();
			
			VM.service.addVM(parseInt(routeId),vmId,function onSuccess(data){	
				$.growlUI("提示", "添加到私有网络的请求提交成功"); 
		    },function onError(msg){
		      ErrorMgr.showError(msg);
//		      $.growlUI("提示", "查询可用私网发生错误：" + msg); 
		    });	
		});
		$("#unbindVMFromNet").unbind('click').bind('click', function(e) {
			var allCheckedBox = $("#tbody2 input[type='checkbox']:checked");		
			var vmId = $(allCheckedBox[0]).parents("tr").attr("instanceId");
			var routeId = $("#removeFromNetTable input[type='radio']:checked").val();
			VM.service.removeVM(parseInt(routeId),vmId,function onSuccess(data){	
				$.growlUI("提示", "从私有网络移除虚拟机的请求提交成功"); 
		    },function onError(msg){
		      ErrorMgr.showError(msg);
//		      $.growlUI("提示", "查询可用私网发生错误：" + msg); 
		    });	
		});	
		//查询用户活动资格
//		VM.queryCustIdent();
//		Virus.init()
		//Sale.init();
	},
	
	queryCustIdent:function(){
		VM.service.queryCustIdent(function(data){
			//customerType:1个人2企业3大客户 ； identStatus:1待审2通过3驳回4缺资料； qualification:1未申请2申请
			//data.qualification = 2;
			//data.customerType = 3;
			VM.customerIdent = data;
			Sale.init();
		})
	},
	_initSelected :function(){
		// 获取系统模板之后，可创建虚拟机
		VM.getTemplateList(function postInit(){	
			VM.getServiceOfferings(function(){
				$("a#createVM").unbind().click(VM.createVM);
				$("a#quickVM").unbind().click(VM.quickVM);
				$(".create-another-server").click(function() {
					VM.wizard.reset();
				});

				$(".im-done").click(function() {
					VM.wizard.close();
				});
			});
		});	
		VM.getImageList();
	},
	
	_initWizard : function(){
		/*VM.service.listNetworks(function(networks){
			if(networks && networks.length>0) {
				VM.defaultNetwork = networks[0];
			}
		});*/		
		
		// 带+-的输入框
		VM.createCountInput = null;
		if (VM.createCountInput == null) {
			var container = $("#createCount").empty();
//			com.skyform.service.Eip.queryEnoughIP(function(enough){
			var max = 99;
			VM.createCountInput = new com.skyform.component.RangeInputField(container, {
				min : 1,
				defaultValue : 1,
				max:max,
				textStyle : "width:137px"
			}).render();
			VM.createCountInput.reset();
		}	
		
		// 带+-的输入框
		VM.createPeriodInput = null;
		if (VM.createPeriodInput == null) {
			var container = $("#period").empty();				
			var max = 12;
			VM.createPeriodInput = new com.skyform.component.RangeInputField(container, {
				min : 1,
				defaultValue : 1,
				max:max,
				textStyle : "width:137px"
			}).render();
			VM.createPeriodInput.reset();
				
		}		
		$(".subFee").bind('mouseup keyup',function(){
			setTimeout('VM.getFee()',5);
		});
		$("input[type='radio'][name='networkoption']").bind('mouseup',function(){
			setTimeout('VM.getFee()',5);
		});
		
		$("#btnBackupSave").unbind("click").bind("click", function() {
			VM.backupVolume();
		});		
		
		// 系统盘
		$( "#rootDisk-range-min" ).slider({
			range: "min",
			value: value,
			min: 1,
			max: 200,
			step: 10,
			slide: function( event, ui ) {
				$("#createRootDiskSize").val(ui.value);
			}
		});		
		$("#createRootDiskSize").bind("blur",function(){
			var value = $("#rootDisk-range-min" ).slider("value");
			var newValue = $("div#ostemplates div.selected>span:first").attr("mindisk");
			if(/^[1-9]+[0-9]*$/.test(""+newValue) &&  parseInt(newValue)>= min && parseInt(newValue) <= max) {
				$("#rootDisk-range-min" ).slider("value",newValue);
			} else {
				$(this).val(value);
			}
		});
		$( "#createRootDiskSize" ).val($( "#RootDisk-range-min" ).slider( "value" ) );
		// 数据盘
		$( "#dataDisk-range-min" ).slider({
			range: "min",
			value: value,
			min: vdiskJson.product.min,
			max: vdiskJson.product.max,
			step: vdiskJson.product.step,
			slide: function( event, ui ) {
				$("#createDataDiskSize").val(ui.value);
			}
		});		
		$("#createDataDiskSize").bind("blur",function(){			
			var value = $("#dataDisk-range-min" ).slider("value");
			var newValue = $(this).val();			
			if(/^[1-9]+[0-9]*$/.test(""+newValue) &&  parseInt(newValue)>= vdiskJson.product.min && parseInt(newValue) <= vdiskJson.product.max) {
				newValue = parseInt(newValue/10) * 10;
				$(this).val(newValue);
				$("#dataDisk-range-min" ).slider("value",newValue);
			} else {
				$(this).val(value);				
			}	
			VM.getFee();
		});	
		$("#createDataDiskSize").bind("keydown",function(){
			$("#dataDiskMsg").empty().html("<span class='text-error'>请输入10的倍数</span>");			
		});	
		$( "#createDataDiskSize" ).val($( "#dataDisk-range-min" ).slider( "value" ) );
		// 带宽
		var min=ipJson.product.min,max=ipJson.product.max,step=ipJson.product.step,value=0;
		$( "#bandwidth-range-min" ).slider({
			range: "min",
			value: value,
			min: ipJson.product.min,
			max: ipJson.product.max,
			step: ipJson.product.step,
			slide: function( event, ui ) {
				$("#createBandwidthSize").val(ui.value);
			}
		});
		$("#createBandwidthSize").bind("blur",function(){
			var value = $("#bandwidth-range-min" ).slider("value");
			var newValue = $(this).val();
			if(/^[1-9]+[0-9]*$/.test(""+newValue) &&  parseInt(newValue)>= min && parseInt(newValue) <= max) {
				$("#bandwidth-range-min" ).slider("value",newValue);
			} else {
				$(this).val(value);
			}
		});
		$( "#createBandwidthSize" ).val($( "#bandwidth-range-min" ).slider( "value"));
		
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
	

		
		$("input[type='radio'][name='loginMode']").click(function(){
			if($(this).val() == 'password') {
				$("#login_mode_use_password").removeClass("hide");
			} else {
				$("#login_mode_use_password").addClass("hide");
			}
		});
	},
	vncVM : function(){
		var vmInstance = VM.getInstanceInfoById(VM.selectedInstanceId);
		if(vmInstance && vmInstance.state=='running') {
			VM.service.getConsoleInfo(VM.selectedInstanceId,function(consoleInfo){
				if(consoleInfo && consoleInfo.url) {
					window.showModalDialog(consoleInfo.url,'',"dialogWidth=800px;dialogHeight=600px");
				} else {
					ErrorMgr.showError("无法获取桌面访问地址，请稍后再试！");
				}
			},function(error){
				ErrorMgr.showError("无法访问："+error);
			});
		}
	},
	getInstanceInfoById : function(instanceId) {
		var result = null;
		$(VM.instances).each(function(i,instance){
			if(instance.id+"" == instanceId+"") {
				result = instance;
				return false;
			}
		});
		return result;
	},
	getFee : function(){
		if(CommonEnum.offLineBill)return;
		var period = VM.createPeriodInput.getValue();		
		var param = vmJson.getVMFeeInstance();
		Dcp.biz.apiAsyncRequest("/pm/queryCaculateFeeByPrtyList",param, function(data) {
			if(null!=data&&0 == data.code){
				var count = VM.createCountInput.getValue()
				var fee =  data.data.fee;
				//$("#feeInput").val(count * fee/feeUnit);
				$(".price").empty().html(count * fee/feeUnit);
			}
		});
	},
	getFee4change : function(){
		var _period = VM.getCheckedArr().parents("tr").attr("period");
		if(CommonEnum.offLineBill)return;
		var period = VM.createPeriodInput.getValue();		
		var param = vmJson.getVMFeeInstance();
		Dcp.biz.apiAsyncRequest("/pm/queryCaculateFeeByPrtyList",param, function(data) {
			if(null!=data&&0 == data.code){
//				var count = VM.createCountInput.getValue();
				var count = 1;
				var fee =  data.data.fee;
				//$("#feeInput").val(count * fee/feeUnit);
				$(".price4change").empty().html(count * fee/feeUnit);
			}
		});
	},

	createVM : function() {
		com.skyform.service.privateNetService.query({state:'running'},function (subnets){
			var subnetContainer = $("#vm_privatenetwork");
			subnetContainer.empty();
//			$("<option value=''>-- 默认网络--" + "</option>").appendTo(subnetContainer);
			$(subnets).each(function(i,subnet){
				if('using' == subnet.state||'running'== subnet.state){
					$("<option value='" + subnet.id + "' >" + subnet.name + "</option>").appendTo(subnetContainer);
				}
			});
			
			subnetContainer.unbind('change').bind("change",function(){
				if($(this).val() == '') {
					$("#vm_wizard_ip_setting").show();
//					com.skyform.service.EipService.listIdleIps(function(eips){
					com.skyform.service.EipService.listByStates({"states":"running"},function(eips){
						var privatenetworkContainer = $("#existed_ips");
						privatenetworkContainer.empty();
						$("<option value=''>-- 请选择--" + "</option>").appendTo(privatenetworkContainer);
						$(eips).each(function(i,eip){
							if('running' == eip.state){
//								$("<option value='" + eip.id + "' eipId='"+eip.eInstanceId+"'>(" + eip.storageSize+"MB)" + eip.eInstanceId + "</option>").appendTo(privatenetworkContainer);
								$("<option value='" + eip.id + "'>(" + eip.BAND_WIDTH+"MB)"+ eip.instanceName +"</option>").appendTo(privatenetworkContainer);
							}
						});
					},function(errorMsg){
						ErrorMgr.showError(errorMsg);
					});
				} else {
					$("#vm_wizard_ip_setting").hide();
				}
			});
			subnetContainer.change();
		},function(error){
			ErrorMgr.showError(error);
		});
		if (VM.wizard == null) {
			VM.wizard = new com.skyform.component.Wizard("#wizard-createVM");
			VM.wizard.onLeaveStep = function(from, to) {				
				if(1 == from){
					VM.querySG();
					$("#discount").empty();
					var osDes = $(".osList.selected span").text();					
					if((osDes.toLowerCase()).indexOf("win")!=-1){
						VM.isWin = true;
					}
					else VM.isWin = false;
					if(VM.isWin){												
						$(".vm-tab").each(function(index,item){
							var text = $(item).attr("data-value");
							if($.inArray(text,VM.microType) != -1){
								$(item).hide();
							}
						});	
//						$(".cpu-options").each(function(index,item){
//							var text = $(item).attr("data-value");
//							if(text == microCpu){
//								$(item).hide();
//							}
//						});
						$(".memory-options").each(function(index,item){
							var text = $(item).attr("data-value");
							if($.inArray(text,VM.microMem) != -1){
								$(item).hide();
							}
						});
						if($(".vm-tab[data-value='小型B']").length > 0){
							if($(".vm-tab[data-value='小型B']:visible")){
								$(".vm-tab[data-value='小型B']").click();
							}
							
						}
						else {
							$("#diy_tab").click();
							var cpu_option = $("div .cpu-options:visible:first");
							cpu_option.click();
							var memory_option = $("div .memory-options:visible:first");
							memory_option.click();
						
						}
						
						VM.getFee();
					}
					else {
						$(".vm-tab").each(function(index,item){
							var text = $(item).attr("data-value");
							if($.inArray(text,VM.microType) != -1){
								$(item).show();
							}
						});
						$(".memory-options").each(function(index,item){
							var text = $(item).attr("data-value");
							if($.inArray(text,VM.microMem) != -1){
								$(item).show();
							}
						});
						$("#diy_tab").click();
						VM.getFee();
					}
				}
				if(2 == from){					
					com.skyform.service.Eip.queryEnoughIP(function(enough){
						if(enough -  1 < 0) {
							$("input[type='radio'][name='networkoption'][value='createNew']").attr("disabled","disabled");
							$("#createNewMsg").empty().append("(互联网接入数量余额:" + enough+",无法创建)")
						}
					});
				}
				if(4 == to){
					$("input[type='radio'][name='sgoption']").unbind('click').click(function(){
						var value = $(this).val();
						$("div.sgoption").each(function(i,div){
							if(!$(div).hasClass("sg_" + value)) {
								$(div).addClass("hide");
							} else {
								$(div).removeClass("hide");
							}					
						});	
						if("useExisted" == value){
							VM.renderSGTable(VM.sgInstances);
						}
					});	
					$("input[type='radio'][name='sgoption'][checked='checked']").click();	
					
				}				
			};
			VM.wizard.onToStep = function(from, to) {				
				if(0 == from){
					var min = $("div#ostemplates div.selected>span:first").attr("mindisk");
				}
				if(0 < from){
					VM.getFee();								
				}				
			};
			VM.wizard.onFinish = function(from, to) {				
				VM.createVMPost(VM.wizard);
			};
		}
		VM.wizard.markSubmitSuccess();
		VM.wizard.reset();
		VM.wizard.render(function onShow(){
			//console.log("I ' m showing...");
			//FireWallCfg.init();
		})
		VM.wizard.render(function(){
			/*if (VM._generateContent_tmp)
			{
				FireWallCfg.reset();
				FireWallCfg._generateContent = VM._generateContent_tmp;
			}*/
			
		});
	},
	quickVM : function(){
//		window.location = "/portal/jsp/maintain/vm4quick.jsp";
		var modalId = "quickVMModal";
		if(VM4quick.quickVMModal == null){
			VM4quick.quickVMModal = new com.skyform.component.Modal(
					modalId,
					"快速开通",
					$("script#quick_vm_div").html(),
					{
						buttons : [
								{
									name : "确定",
									onClick : function() {
										VM4quick.createVM4quick(modalId);
//												var instance = vm4quickJson.getVM4JsonInstance4quick();		
//												VM.service.createInstance(instance, function onCreated(instance){
//													//订单提交成功后校验用户余额是否不足
//													var _tradeId = instance.tradeId;
//													var _fee = $("#vm-quick .price").html();	
//													
//													
//													var createModal = $("#"+modalId);
//													com.skyform.service.BillService.confirmTradeSubmit(_fee,_tradeId,createModal,function onSuccess(data){
//														$.growlUI("提示", "创建申请提交成功, 请耐心等待开通服务..."); 
//														$("#"+modalId).modal("hide");
//														// refresh
//														VM.describleVM();									
//													},function onError(msg){
//														$.growlUI("提示", "创建申请提交成功,扣款失败");
//														$("#"+modalId).modal("hide");
//													});				
//												},function onError(msg){
//													$.growlUI("提示", "创建申请提交失败：" + msg);
//												});										
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
										VM4quick.quickVMModal.hide();
									}
								} ],
						beforeShow : function(){
							VM4quick.init();
//							VM4quick.getQuickTypeList();
//							if(!CommonEnum.offLineBill){
//								$(".feeInput_div").show();
//							}
						},
						afterShow : function(){
							
							
						}
					});
		}
		VM4quick.quickVMModal.setHeight(420).setWidth(700).setTop(100).autoAlign().show();			
	},	
	querySG:function(){
		com.skyform.service.FirewallService.querySG(function(data){
			VM.groupTotal = data.length;
			VM.sgInstances = data;			
		})
	},
	renderSGTable:function(result){	
		var data = VM.querySGByState(result);
		console.log(data.length);
		if(VM.sgTable) {
			VM.sgTable.updateData(data);				
		} else {
			VM.sgTable = new com.skyform.component.DataTable();
			VM.sgTable.renderByData("#sgTable",{
				pageSize : 5,
				data : data,
				onColumnRender : function(columnIndex,columnMetaData,columnData){

					 var text = columnData[''+columnMetaData.name] || "";
					 if(columnMetaData.name=='id') {
						 text = '<input type="radio" name="sgRadio" value="'+columnData['subscriptionId']+'">';
					 }
					 else if (columnMetaData.name == "ID") {
						 text = columnData['subscriptionId'];
					 }
					 else if (columnMetaData.name == "instanceName") {
						 text = columnData['subscriptionName'];
					 }
					 else if (columnMetaData.name == "state") {
						 if("bind error"==columnData.subServiceStatus){
							 if("0"==columnData.isUsed){
								 columnData.subServiceStatus = "running";
							 }
							 else columnData.subServiceStatus = "using";
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
							return text;
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
				afterRowRender : function(rowIndex,data,tr){
//					tr.find("input[type='checkbox']").click(function(){
//						firewall.onInstanceSelected(); 
//			        });
//					tr.click(function(){
//						firewall.showDetails(data); 
//			        });
					if(0==rowIndex){
						tr.find("input[type='radio'][name='sgRadio']").attr("checked",'checked');
					}
				},
				afterTableRender : function(){
					$("#sgTable_wrapper .btn").hide();						
				}
				
			});				
			
		}
	
	},
	
	querySGByState:function(data){
		var result = [];
		$(data).each(function(i,item){
			if(item.subServiceStatus!=='opening'&&'create error'!=item.subServiceStatus){
				result.push(item);
			}
		});
		return result;
	},
	/***
	 * 使用亚信格式
	 * 
	 getVMFormInstance : function(){
		var oSDesc = $(".osList.selected span").text();
		var templateid = $(".osList.selected span").attr("value")
		var instanceName = $("#instanceName").val();
		//var count = $.trim($("#count").val());
		var count = VM.createCountInput.getValue();
		var account = $("#ownUserAccount").val();
		var cpuNum = $(".cpu-options.selected").attr("data-value");
		var memorySize = $(".memory-options.selected").attr("data-value");
		var serviceofferingid = VM.getServiceOfferingId(cpuNum, memorySize);
		var loginMode = $("input[type='radio'][name='loginMode']:checked").val();
		var keyPair = $("#keyPair").val();
		var brandwidth = $("#createBandwidthSize").val();
		var period = VM.createPeriodInput.getValue();
		var unit = $("#unit").val();
		var storageSize = $("#createDataDiskSize").val();
		var rootSize =  $("#createRootDiskSize").val();
		var rootMin = $("div#ostemplates div.selected>span:first").attr("mindisk");
		VM.defaultNetwork = VM.defaultNetwork || {id:0};
		//var firewallRules = FireWallCfg.getFormData();
		
		var instance = {
			"storageSize" : storageSize,
			"instanceName" : instanceName,
			"count" : count,
			"templateid" : templateid,
			"oSDesc" : oSDesc,
			"serviceofferingid" : serviceofferingid,
			"cpuNum" : cpuNum,
			"memorySize" : memorySize,
			"loginMode" : loginMode,
			"keyPair"   : keyPair,
			"brandWidth" : brandwidth,
			"period"  : period,
			"unit" : unit,
			"nicsNum" : 1,
			"nicsList" : [
				 {
						"eVlanId" : VM.defaultNetwork.id
				}
				],
				applySecurityGroup : true
			
		};
		
		
		delete instance.nicsNum;
		delete instance.nicsList;
		var networkoption = $("input[type='radio'][name='networkoption']:checked").val();
		if("no" == networkoption) {
			delete instance.brandWidth;
		} else if("useExisted" == networkoption) {
			delete instance.brandWidth;
			if($("#existed_ips").val() != "") {
				instance.useExistedBrandWidth = true;
				instance.ipId = $("#existed_ips").val();
				instance.eIpId = $("#existed_ips").attr("eIpId");
			}
		} 
		
		if($("#vm_privatenetwork").val() != "") {
			instance.addToSubnet = true;
			instance.subnetId = $("#vm_privatenetwork").val();
			instance.subnetEid = $("#vm_privatenetwork option:selected").attr("sutnetEid");
		} 
		
		FireWallCfg.getFormData(instance);
		return instance;
	},
	*/
	describleVM : function() {
		if(VM.inited) VM.datatable.container.find("tbody").html("<tr ><td colspan='7' style='text-align:center;'><img src='"+CONTEXT_PATH+"/images/loader.gif'/><strong>"+Dict.val("common_retrieving_data_please_wait")+"</strong></td></tr>");
		VM.service.listInstances(function(instances){
			$("#load_waiting_tbl").hide()
			VM.instances = instances;
			if(instances && instances.length>0) {
				$("#details").show();
				VM.showInstanceInfo(instances[0]);
			} else {
				$("#details").hide();
			}
			
			VM.renderDataTable(instances);
			VM.checkSelected();//初始化按钮置灰
		}, function(errorMsg){
			$.growlUI("提示", "查询云主机发生错误：" + errorMsg);
		});
	},
	
	getBillTypeList: function() {
		$("#billType").empty();
		$.each(CommonEnum.billType, function(index) {
			var cpu_option = $("<div  class=\"types-options \" data-value='"+ index + "' style='width:50px'>" + CommonEnum.billType[index] + "</div>");
			cpu_option.appendTo($("#billType"));
			cpu_option.unbind().click(function(){
				if($(this).hasClass("selected"))return;
				$("div.type-options").removeClass("selected");
				$(".options .types-options").removeClass("selected");
				$(this).addClass("selected");					
				VM.queryProductPrtyInfo(index);
				VM.queryBwProductPrtyInfo(index);
				VM.queryVdiskProductPrtyInfo(index);
				VM._initSelected();				
				if(0 == index){
					$("#periodUnit").empty().html("月");
				}
				else if(3 == index){
					$("#periodUnit").empty().html("年");
				}
				else if(2 == index){
					$("#periodUnit").empty().html("天");
				}
			});
			if (index == 0||index == 5) {
				cpu_option.click();
			}
		});
	},
//	创建虚拟机
	createVMPost : function(wizard) {
		var instance = vmJson.getVM4JsonInstance();		
		VM.service.createInstance(instance, function onCreated(instance){
			//订单提交成功后校验用户余额是否不足
			var _tradeId = instance.tradeId;
			var _fee = $(".price").html();			
			com.skyform.service.BillService.wizardConfirmTradeSubmit(_fee,_tradeId,VM.wizard, function onSuccess(data){				
				$.growlUI("提示", "申请已提交，请等待开通！");
				wizard.markSubmitSuccess();
				VM.describleVM();
			},function onError(msg){
				$.growlUI("提示", "申请虚拟机已提交，扣款失败");
				wizard.markSubmitError();
			});
			
//			com.skyform.service.BillService.tradeSubmit(_tradeId);				
		},function onError(msg){
			$.growlUI("提示", "创建申请提交失败：" + msg);
		});
	},	
	
	
	
	queryProductPrtyInfo : function(index){		
		com.skyform.service.BillService.queryProductPrtyInfo(index,window.currentInstanceType,function(data){
			if( null != data){	
//				data = {"oslist":[{"osDiskSizeMin":20,"value":"5","desc":"CentOS6.3 64位"},{"osDiskSizeMin":20,"value":"1","desc":"CentOS6.4 64位"},{"osDiskSizeMin":20,"value":"6","desc":"CentOS6.5 64位"},{"osDiskSizeMin":50,"value":"2","desc":"Windows Server 2003 企业版 32位"},{"osDiskSizeMin":50,"value":"3","desc":"Windows Server 2008 R2 标准版 64位"},{"osDiskSizeMin":50,"value":"19","desc":"Windows Server 2008 R2 数据中心版 64位"},{"osDiskSizeMin":50,"value":"20","desc":"Windows Server 2012 R2 数据中心版 64位"},{"osDiskSizeMin":50,"value":"21","desc":"Windows Server 2012 R2 标准版 64位"},{"osDiskSizeMin":50,"value":"22","desc":"Ubuntu14.04 Server CN 64位"}],"vmConfig":[{"value":"1","memory":[{"value":"0.5","vmPrice":"1","discount":"","name":"其他配置","desc":"512M","osDisk":"50","productId":""},{"value":"1","vmPrice":"1","discount":"","name":"其他配置","desc":"1G","osDisk":"80","productId":""},{"value":"2","vmPrice":"1","discount":"","name":"其他配置","desc":"2G","osDisk":"80","productId":""},{"name":"其他配置","desc":"4G","value":"4","discount":"","productId":""}],"desc":"1核"},{"value":"2","memory":[{"name":"其他配置","desc":"1G","value":"1","discount":"","productId":""},{"value":"2","vmPrice":"1","discount":"","name":"其他配置","desc":"2G","osDisk":"150","productId":""},{"value":"4","vmPrice":"1","discount":"","name":"其他配置","desc":"4G","osDisk":"150","productId":""},{"name":"其他配置","desc":"8G","value":"8","discount":"","productId":""}],"desc":"2核"},{"value":"4","memory":[{"name":"其他配置","desc":"2G","value":"2","discount":"","productId":""},{"value":"4","vmPrice":"1","discount":"","name":"其他配置","desc":"4G","osDisk":"220","productId":""},{"value":"8","vmPrice":"1","discount":"","name":"其他配置","desc":"8G","osDisk":"220","productId":""},{"name":"其他配置","desc":"12G","value":"12","discount":"","productId":""},{"name":"其他配置","desc":"16G","value":"16","discount":"","productId":""}],"desc":"4核"},{"value":"8","memory":[{"name":"其他配置","desc":"4G","value":"4","discount":"","productId":""},{"value":"8","vmPrice":"1","discount":"","name":"其他配置","desc":"8G","osDisk":"330","productId":""},{"name":"其他配置","desc":"12G","value":"12","discount":"","productId":""},{"value":"16","vmPrice":"1","discount":"","name":"其他配置","desc":"16G","osDisk":"330","productId":""},{"name":"其他配置","desc":"24G","value":"24","discount":"","productId":""},{"name":"其他配置","desc":"32G","value":"32","discount":"","productId":""}],"desc":"8核"},{"value":"12","memory":[{"name":"其他配置","desc":"32G","value":"32","discount":"","productId":""}],"desc":"12核"}],"productId":201}
				vmJson.oslist = data.oslist;
				vmJson.vmConfig = data.vmConfig;
				vmJson.productId = data.productId;
				vm4quickJson.vmQuickConfig = data.vmQuickConfig;
			}		
		});
	},
	queryBwProductPrtyInfo : function(index){
		com.skyform.service.BillService.queryProductPrtyInfo(index,"ip",function(data){
			if( null != data){
				ipJson.product.max = data.brandWidth.max;
				ipJson.product.min = data.brandWidth.min;
				ipJson.product.step = data.brandWidth.step;
				ipJson.product.unit = data.brandWidth.unit;
				ipJson.product.productId = data.productId;
			}
			$("#bwUnit").empty().html(ipJson.product.unit);			
		});
	},
	
	queryVdiskProductPrtyInfo : function(index){
		com.skyform.service.BillService.queryProductPrtyInfo(index,"vdisk",function(data){
			if( null != data){
				//vdiskJson.product.default = data.dataDisk.default;
				vdiskJson.product.max = data.dataDisk.max;
				vdiskJson.product.min = data.dataDisk.min;
				vdiskJson.product.step = data.dataDisk.step;
				vdiskJson.product.unit = data.dataDisk.unit;
				vdiskJson.product.productId = data.productId;
			}
			$("#dataDiskUnit").empty().html(vdiskJson.product.unit);			
		});
	},	
	
	// 获取OS模板列表
	getTemplateList : function(postInit) {
			var active = true;
			var templates =  vmJson.trans4OSByPool(CommonEnum.currentPool);
			serviceOfferingsData = vmJson.trans4ServiceOfferingsByPool(CommonEnum.currentPool);
			$("#ostemplates").empty();			
			if(null!=templates&&templates.length>0){
				$(templates).each(function(index,item){
					//if(item.name.indexOf("2008")==-1){//屏蔽模板名称中含有2008的模板
						var template = $("<div class='osList '>" + "  <span os='"+item.name+"' value=" + item.id + " mindisk="+item.mindisk+" class='text-left'><a href='#'>" + item.name + "</a> </span>" + "  </p>" + "</div>");
						template.appendTo($("#ostemplates"));
						template.click(function(){								
							$("div.osList").removeClass("selected");
							$(this).addClass("selected");
							VM.selectTemplate(item);
							var osDes = $(".osList.selected span").text();					
							if((osDes.toLowerCase()).indexOf("win")!=-1){
								VM.isWin = true;
							}
							else VM.isWin = false;
							var osDisk = $(".osList.selected span").attr("mindisk");
							$("#vm-diy #osDisk").empty().html(osDisk);							
						});						
						if (index == 0) {
							active = $("a[href='#osTab']").parent().hasClass("active");
							if(active){
								template.click();
							}							
						}
					//}
				});
				if(postInit) {
					postInit();					
				}
			}		
	},
	// 获取镜像模板列表
	getImageList : function(postInit) {	
		var active = true;
		VM.service.listImagetemplates(function(templates){
			//templates = [{id:"1",mindisk:150,name:"win2008",ostypename:"win2008"}];
			$("#imagetemplates").empty();
			if(null!=templates&&templates.length>0){
				$(templates).each(function(index,item){
						var text = "镜像："+item.imageName+"；云主机："+item.vmName+"；系统："+item.osName;					
						var template = $("<div class='osList '>" + "  <span os='"+item.osName+"' value='" + item.osId + "' mindisk='"+item.osDisk+"' imageTemplateId='"+item.imageTemplateId+"' class='text-left'><a href='#'>" + text + "</a> </span>" + "  </p>" + "</div>");
						template.appendTo($("#imagetemplates"));
						template.click(function(){							
							$("div.osList").removeClass("selected");
							$(this).addClass("selected");
							VM.selectTemplate(item);
							var osDes = $(".osList.selected span").text();
							var osDisk = $(".osList.selected span").attr("mindisk");
							$("#vm-diy #osDisk").empty().html(osDisk);							
						});
						if (index == 0) {
							active = $("a[href='#imageTab']").parent().hasClass("active");
							if(active){
								template.click();
							}							
						}
				});
				if(postInit) {
					postInit();
				}
			}
			
		});		
	},
	selectTemplate : function(template) {
		$("div.vm-login[ostype != '"+template.ostypename+"']").hide();
		$("div.vm-login[ostype = '"+template.ostypename+"']").show();
	},
	// 获取计算服务列表
	getServiceOfferings : function(postInit) {
		VM.getTypeList();
		VM.getCpuList();
		cpuarr = VM.getCpuArr();
		VM.getMemoryList(cpuarr[0]);
		if(postInit) {
			postInit();
		}
		
	},
	getTypes : function(){
		var typeArr = [];
		$(serviceOfferingsData).each(function(index, item) {
			if (item.displaytext != null && -1 == $.inArray(item.displaytext, typeArr)) {
				var vmType = {
					"displaytext" : item.displaytext,
					"vmPrice" : item.vmPrice,
					"productId" : item.productId,
					"osDisk" : item.osDisk
				} 
				if(null!=item.discount){
					vmType.discount = item.discount;
				}
				else vmType.discount = "";
				typeArr.push(vmType);
			}
		});
		return typeArr;
	},
	selectType : function(type){
		$(serviceOfferingsData).each(function(index, item) {
			if(item.displaytext == type) {
				VM.getMemoryList(item.cpunumber, item.memory);
				$("div.cpu-options[data-value != '"+item.cpunumber+"']").removeClass("selected");
				$("div.cpu-options[data-value = '"+item.cpunumber+"']").addClass("selected");
				$("#cpu").html(item.cpunumber);
				return false;
			}
		});
	},
//	selectQuickType : function(type){
//		$(serviceOfferingsData).each(function(index, item) {
//			if(item.displaytext == type) {
//				VM.getMemoryList(item.cpunumber, item.memory);
//				$("div.cpu-options[data-value != '"+item.cpunumber+"']").removeClass("selected");
//				$("div.cpu-options[data-value = '"+item.cpunumber+"']").addClass("selected");
//				$("#vm-quick #cpu").html(item.cpunumber);
//				$("#vm-quick #memory").html(item.memory);
//				return false;
//			}
//		});
//	},
	getTypeList : function(){		
		var types = VM.getTypes();		
		$("#type-options").empty();
		$(".vm-ul").empty();
		var diy_option = $("<div  class=\"types-options type-options vm-type\" data-value=\"DIY\" >其他</div>");
		diy_option.appendTo($("#type-options"));		
		
		var diy = $("<li class='vm-tab' id='diy_tab' data-value='其他'><a href='#vm-diy' data-toggle='tab'><strong>其他</strong></a></li>");
		diy.appendTo($(".vm-ul"));
		//自定义tab事件
		diy.click(function(){
			$("li.vm-tab").removeClass("active");
			$(".vmtab").removeClass("active");
			$("#diy_tab").addClass("active");
			$("#vm-diy").addClass("active");
			var osDisk = $(".osList.selected span").attr("mindisk");
			$("#vm-diy #osDisk").empty().html(osDisk);
			$("div.type-options").removeClass("selected");
			$(".vm-type[data-value='DIY']").addClass("selected");
			$(".cpu-options[data-value=1]").click();
		});
		$(types).each(function(index,item){			
			if("其他配置" == item.displaytext){
				var type_option = $("<div  class=\"types-options type-options vm-type\" " +
						"style='display:none' data-value=\""+ item.displaytext + "\" vmPrice=\""+item.vmPrice+"\" productId=\""+item.productId+"\">"
						+ item.displaytext + "</div>");
			}
			else var type_option = $("<div  class=\"types-options type-options vm-type\" " +
					"data-value=\""+ item.displaytext + "\" vmPrice=\""+item.vmPrice+"\" productId=\""+item.productId+"\">"
					+ item.displaytext + "</div>");
			type_option.appendTo($("#type-options"));
			//标配option事件
			type_option.click(function(){
				$("div.type-options").removeClass("selected");
				$(this).addClass("selected");
			});
			if (index == 0) {
				type_option.click();			
			}
			if("其他配置" == item.displaytext){
				var tab_option = $("<li class='vm-tab' data-value='"+item.displaytext+"' style='display:none'><a href='#vm-standard' data-toggle='tab' >"+item.displaytext+"</a></li>");
			}
			else var tab_option = $("<li class='vm-tab' data-value='"+item.displaytext+"'><a href='#vm-standard' data-toggle='tab' >"+item.displaytext+"</a></li>");
			tab_option.appendTo($(".vm-ul"));
			//标配tab事件
			tab_option.click(function(){
				//$("div.type-options").removeClass("selected");
				$("li.vm-tab").removeClass("active");
				$(".vmtab").removeClass("active");
				$("#vm-standard").addClass("active");
				VM.selectType(item.displaytext);
				//$(this).addClass("selected");
				$(this).addClass("active");
				//
				//$("#vm-standard #osDisk").empty().html(item.osDisk);
				var osDisk = $(".osList.selected span").attr("mindisk");
				$("#vm-standard #osDisk").empty().html(osDisk);
				
				
				//$("#osDiskMsg").empty();
				$("#discount").empty();
				if(""!=item.discount&&item.discount.length>0){
					$("#discount").empty().html(item.discount);
				}				
				type_option.click();
			});	
		});		
		diy.click();
	},	
	// 获取计算服务cpu数组
	getCpuArr : function() {
		var cpuArr = [];
		$(serviceOfferingsData).each(function(index, item) {
			if("其他配置" == item.displaytext){
				if (-1 == $.inArray(item.cpunumber, cpuArr)) {
					cpuArr.push(item.cpunumber);
				}
			}			
		});
		return cpuArr;
	},
	getCpuArrAll : function() {
		var cpuArr = [];
		$(serviceOfferingsData).each(function(index, item) {
			if (-1 == $.inArray(item.cpunumber, cpuArr)) {
				cpuArr.push(item.cpunumber);
			}
		});
		return cpuArr;
	},
	// 获取计算服务cpu列表
	getCpuList : function() {
		var cpuArr = VM.getCpuArr();
		$("#cpu-options").empty();
		$(cpuArr).each(
		function(index, item) {
			var cpu_option = $("<div  class=\"types-options cpu-options \" data-value='"+ item + "'>" + item + "核</div>");
			cpu_option.appendTo($("#cpu-options"));
			cpu_option.click(function(){
				if($(this).hasClass("selected"))return;
				$("div.type-options").removeClass("selected");
				$(".options .types-options.cpu-options ").removeClass("selected");
				$(this).addClass("selected");
				VM.getMemoryList(item);				
			});
			if (index == 0) {
				cpu_option.click();
			}
		});
	},
	// 获取计算服务cpu列表4变更
	getCpuListUpgrade : function() {
		var cpuArr = VM.getCpuArrAll();
		$("#cpu-options-upgrade").empty();
		$(cpuArr).each(
		function(index, item) {
			var cpu_option = $("<div  class=\"types-options cpu-options \" data-value='"+ item + "'>" + item + "核</div>");
			cpu_option.appendTo($("#cpu-options-upgrade"));
			cpu_option.click(function(){
				$("#myModal006change #errorMsg").removeClass().empty();
				if($(this).hasClass("selected"))return;
				$("div.type-options").removeClass("selected");
				$(".options .types-options.cpu-options ").removeClass("selected");
				$(this).addClass("selected");
				VM.getMemoryListUpgrade(item);
			});
			if (index == 0) {
				cpu_option.click();
			}
		});
	},
	// 获取计算服务内存数组
	getMemoryArr : function(cpuNumber) {
		var memoryArr = [];
		$(serviceOfferingsData).each(function(index, item) {
			if("其他配置" == item.displaytext){
				if (cpuNumber == item.cpunumber) {
					memoryArr.push(item);
				}
			}			
		});
		return memoryArr;
	},
	
	getMemoryArrAll : function(cpuNumber) {
		var memoryArr = [];
		var filter = [];
		$(serviceOfferingsData).each(function(index, item) {
			if (cpuNumber == item.cpunumber) {
				if (-1 == $.inArray(item.memory, filter)) {
					memoryArr.push(item);
					filter.push(item.memory);
				}		
			}
		});
		return memoryArr;
	},
	
	
	
	
	// 获取计算服务内存列表
	getMemoryList : function(cpuNumber,mem) {
		var memoryArr = VM.getMemoryArr(cpuNumber);
		$("#memory-options").empty();
		$(memoryArr).each(function(index, item) {
			if (cpuNumber == item.cpunumber) {
				var memory_option = "";
				var memorySize = item.memory;
				if (memorySize >= 1024) {
					memorySize = memorySize / 1024;
				} 
				
				if(cpuNumber==1&&VM.isWin&&(item.memory=="0.5"||item.memory=="1")){
					memory_option = $("<div class=\"types-options memory-options \" data-value=" + item.memory 	+ " style='display:none' >"	+ memorySize+ "GB</div>");
				}
				else {
					memory_option = $("<div class=\"types-options memory-options \" data-value=" + item.memory 	+ "  >"	+ memorySize+ "GB</div>");
				}
				memory_option.appendTo($("#memory-options"));
				memory_option.click(function(){
					$("div.type-options").removeClass("selected");
					$("div.memory-options").removeClass("selected");
					if(VM.isWin&&cpuNumber==1){
						$("div.memory-options[data-value='2']").addClass("selected");
					}
					else $(this).addClass("selected");	
//					$(this).addClass("selected");	
				});
				if((mem && mem == item.memory)) {
					memory_option.addClass("selected");
					$("#memory").html(memorySize);
				} else if(VM.isWin&& index == 0){
//					if(memory_option.is(":visible")){
//						memory_option.addClass("selected");						
//					}
					memory_option.addClass("selected");	
					$("#memory").html(mem);
				} 
				else if (!VM.isWin&& index == 0 ) {
					memory_option.addClass("selected");	
					$("#memory").empty().html(mem);
				} 
			}
		});
		$("#memory").empty().html(mem);
		if(VM.isWin&&cpuNumber==1&&$(".memory-options.selected").length<1){
			$("div.memory-options[data-value='2']").addClass("selected");
		}
//		$(".options .types-options.memory-options").click();
		$(".options .types-options.memory-options").click(function() {
			$(".options .types-options.memory-options ").removeClass("selected");
			$(this).addClass("selected");
		});
	},
	// 获取计算服务内存列表4变更
	getMemoryListUpgrade : function(cpuNumber,mem) {
		var memoryArr = VM.getMemoryArrAll(cpuNumber);
		$("#memory-options-upgrade").empty();
		$(memoryArr).each(function(index, item) {
			if (cpuNumber == item.cpunumber) {
				var memory_option = "";
				var memorySize = item.memory;
				if (memorySize >= 1024) {
					memorySize = memorySize / 1024;
				} 

				if(cpuNumber==1&&VM.isWin&&(item.memory=="0.5"||item.memory=="1")){
					memory_option = $("<div class=\"types-options memory-options \" data-value=" + item.memory 	+ " style='display:none' >"	+ memorySize+ "GB</div>");
				} else {
					memory_option = $("<div class=\"types-options memory-options \" data-value=" + item.memory	+ "  >" + memorySize+ "GB</div>");
				}

				memory_option.appendTo($("#memory-options-upgrade"));
				memory_option.click(function(){
					$("#myModal006change #errorMsg").empty();
					$("div.type-options").removeClass("selected");
					$("div.memory-options").removeClass("selected");
					$(this).addClass("selected");
				});
				if((mem && mem == item.memory)) {
					memory_option.addClass("selected");
					$("#memory").html(memorySize);
				} else if(VM.isWin&& index == 0){
					if(memory_option.is(":visible")){
						memory_option.addClass("selected");
						$("#memory").html(memorySize);
					}
				} 
				else if (!VM.isWin&&!mem&& index == 0 ) {
					memory_option.addClass("selected");
				} 
			}
		});
		if(VM.isWin&&cpuNumber==1&&$(".memory-options.selected").length<1){
			$("div.memory-options[data-value='2']").addClass("selected");
		}
		$(".options .types-options.memory-options").click(function() {
			$(".options .types-options.memory-options ").removeClass("selected");
			$(this).addClass("selected");
		});
	},
	// 获取计算服务id
	getServiceOfferingId : function(cpuNumber, memory) {
		var serviceOfferingId = 0;
		$(serviceOfferingsData).each(function(index, item) {
			if (cpuNumber == item.cpunumber && memory == item.memory) {
				serviceOfferingId = item.id;
			}
		});
		return serviceOfferingId;
	},
	
	renderDataTable : function(data) {
		if(VM.inited){
			VM.datatable.updateData(data);
			return;
		}
		VM.datatable.renderByData(
						"#tbody2",// 要渲染的table所在的jQuery选择器
						{
							"data" : data, // 要渲染的数据选择器					
							"pageSize" : 5,
							"onColumnRender" : function(columnIndex,columnMetaData, columnData) {
								var text = '';
								if(columnMetaData.name=='id') {
						              return '<input type="checkbox" name="check" id="' + columnData.id + '" value="'+columnData.id+'">';
						           } else if ("ID" == columnMetaData.name) {
						              return columnData.id;
						           } else if ("instanceName" == columnMetaData.name) {
						        	   var ctx = $("#ctx").val();
						        	   if(null!=columnData.uuid&&""!=columnData.uuid){
											text = '<a  href="monitor.jsp?code=monitor&vmId='+columnData.uuid+'&vmName='+encodeURI(encodeURI(columnData.instanceName))+'" >'+columnData.instanceName+'</a>'
											+"<a title='咨询建议' href='"+ctx+"/jsp/user/workOrder.jsp?code=workOrder&cataCode=service&instanceId="+columnData.id+"&serviceType=vm&instanceName="+encodeURIComponent(columnData.instanceName)+"&instanceStatus="+columnData.state+"'><i class='icon-comments' ></i></a>";
										}
										else text = (columnData.instanceName.length>15?"<span title='"+columnData.instanceName+"'>"+columnData.instanceName.slice(0,15)+"..."+"</span>":columnData.instanceName)+"<a title='咨询建议' href='../user/workOrder.jsp?code=workOrder&cataCode=service&instanceId="+columnData.id+"&serviceType=vm&instanceName="+encodeURIComponent(columnData.instanceName)+"&instanceStatus="+columnData.state+"'><i class='icon-comments' ></i></a>";
						        	   return text;
						           } else if ("state" == columnMetaData.name) {
//						        	   if(columnData.state == "coping")
//						        		   return "快照创建中";
//						        	   else if(columnData.state == "recovering")
//						        		   return "恢复中";
						              return com.skyform.service.StateService.getState("vm",columnData.state||columnData);
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
									}else if ("expireDate" == columnMetaData.name) {
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
									}else if ("descrInfo" == columnMetaData.name) {										
						        	   try {
						        		   var cpuNum = "";
						        		   var mem = "";
						        		   var os = "";
						        		   if(columnData.cpu&&columnData.cpu.length>0){
						        			   cpuNum = columnData.cpu;
						        		   }
						        		   if(columnData.os&&columnData.os.length>0){
							        			  os = columnData.os; 
							        		   }
						        		   if(columnData.mem&&columnData.mem.length>0){
						        			  mem = columnData.mem; 
						        		   }
											var appendText = "CPU:"
													+ cpuNum + "核,内存:"
													+ mem + "G,"
													+ os;
											text = text + appendText;
										} catch (e) {

										}
									return text;
						           }
								return columnData[columnMetaData.name];
							},
							
//							{"message":"success","data":[{"vmPrice":1,"mem":"0.5","state":"opening","expireDate":1412493362000,"productId":101,"createDate":1409901362000,"cpu":"1","instanceName":"VM_67786912","disk":"50","osId":"1","id":67786912,"ip":" ","period":1,"os":"Cetnos6.4-x86_64"},{"vmPrice":1,"mem":"0.5","state":"opening","expireDate":1412476682000,"productId":101,"createDate":1409884682000,"cpu":"1","instanceName":"VM_67784939","disk":"50","osId":"1","id":67784939,"ip":" ","period":1,"os":"Cetnos6.4-x86_64"}],"code":0}
							"afterRowRender" : function(rowIndex, data, tr) {
								
								tr.attr("id",data.id);
								tr.attr("uuid",data.uuid);
								tr.attr("act",data.instanceName);
								
								tr.attr("state",data.state);
								tr.attr("instanceId",data.id);
								tr.attr("productID",data.productId);
								tr.attr("cpu",data.cpu);
								tr.attr("mem",data.mem);
								tr.attr("os",data.os);
								tr.attr("period",data.period);
								tr.attr("vmPrice",data.vmPrice);
								tr.attr("productId",data.productId);
								tr.attr("osId",data.osId);
								
								tr.attr("disk",data.disk);
								
								VM.bindEventForTr(rowIndex, data, tr);
							},
							"afterTableRender" : function() {
								VM.bindEvent();
//								$("#tbody2 tbody").find("tr").css("background-color","");
								var firstRow = $("#tbody2 tbody").find("tr:eq(0)");
								var	instanceId = firstRow.attr("instanceId");
								var instance = VM.getInstanceInfoById(instanceId);
								//VM.showInstanceInfo(instance);//加载数据之后不再查询关联信息和日志
								firstRow.css("background-color","#BCBCBC");
								VM.setSelectRowBackgroundColor(firstRow);
								if($("#vmName").val() !=null&&$("#vmName").val() != ""&&$("#vmName").val() !="null"){
								$("#tbody2_filter").find("input[type='text']").val($("#vmName").val());
								$("#tbody2_filter").find("input[type='text']").trigger("keyup");
								}
							}
							
						});
		VM.inited = true;
		VM.datatable.addToobarButton("#toolbar4tbl");
		VM.datatable.enableColumnHideAndShow("right");
	},
	bindEventForTr : function(rowIndex, data, tr) {
		$(tr).attr("state", data.optState || data.state);
		$(tr).attr("name", data.instanceName);
		$(tr).attr("jobState", data.jobState);
		

		$(tr).unbind().mousedown(
			function(e) {
				
				if (3 == e.which) {
					$("#tbody2 input[type='checkbox']").attr("checked", false);
					$("#content_container #checkAll").attr("checked", false);
					tr.find("input[type='checkbox']").attr("checked", true);
					VM.selectedInstanceId = tr.attr("instanceId");
					VM.selectedInstanceDisk = tr.attr("disk");
					VM.selectedInstanceOsId = tr.attr("osId");
					VM.selectedInstanceOs = tr.attr("os");
					$("#moreAction").removeClass("disabled");
					document.oncontextmenu = function() {
						return false;
					}
					var screenHeight = $(document).height();
//					console.log($(document).height());
//					console.log(e.pageY);
//					console.log(e.pageX);
					var top = e.pageY;
					
					if (e.pageY >= screenHeight / 2) {
						top = e.pageY - $("#contextMenu").height();
//						console.log($("#contextMenu").height())
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
					VM.checkSelected(data);

				}
				VM.showInstanceInfo(data);
				VM.setSelectRowBackgroundColor(tr);
		});
		$(tr).click(function() {
			VM.checkboxClick(tr);
		});
	},
	setSelectRowBackgroundColor : function(handler) {
		$("#content_container tr").css("background-color","");
		handler.css("background-color","#d9f5ff");
	},
	showInstanceInfo : function(instanceInfo) {
		if (instanceInfo==null) return;
		$("div#details span.detail_value").each(function(i,item){
			var prop = $(this).attr("prop");
			$(this).html("" + instanceInfo[""+prop]);
		});
		var array = new Array();
		$("#vmRelations").html("");
		//查询详情
		VM.service.listRelatedInstances(instanceInfo.id,function(data){
			data = $.parseJSON(data);
			VM.appendVmRelation(data,instanceInfo);
//			VM.service.listIriRelation(instanceInfo.id,function(data){
//				VM.appendVmRelation(data,instanceInfo);
//			},function(e){
//			});
		},function(e){
		});
		$("#opt_logs").empty();
		com.skyform.service.LogService.describeLogsUIInfo(instanceInfo.id);
//		com.skyform.service.LogService.describeLogsInfo(instanceInfo.id,function(logs){	
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
//				$("<li class='detail-item'><span>" + v.createTime+ "  "+v.subscription_name+"  " + v.controle + desc+ "</span></li>").appendTo($("#opt_logs"));
//			});
//		});
		
	},
	appendVmRelation : function(array,instanceInfo) {
		var dom = "";
		$(array).each(function(i) {
			var ipaddress = "";
			var templateType = array[i].templateType;

			if(templateType==9){
				ipaddress = " ("+array[i].resId+")";
			}
			ipaddress = ipaddress.replace("null","");		
			
			var insState = com.skyform.service.StateService.getState(templateType,array[i].state);
			if(templateType==7 && "using"!=array[i].state){
				//亚信工作流不支持人为干预，由线下处理
				//insState = insState+"<a class='bindSecurity' value="+array[i].id+"> 重新绑定</a>";
				insState = insState+"<span class='text-error'> 未绑定</span>";
				VM.selectSGid = array[i].id;
			}
			dom += "<li class=\"detail-item\">"
				+"<span>"+array[i].id+"</span>&nbsp;&nbsp;&nbsp;&nbsp;"
				+"<span>" + VM.switchType(array[i].templateType) +"</span>&nbsp;&nbsp;&nbsp;&nbsp;"
				+"<span>"+array[i].instanceName+"</span>&nbsp;"
				+"<span>"+ipaddress+"</span>&nbsp;&nbsp;&nbsp;&nbsp;"
				+"<span>"+insState+"</span>"
				+"</li>";
		});
		$("#vmRelations").empty().append(dom);
		$("#vmRelations").find("a.bindSecurity").unbind("click").click(function(){
			VM.service.bindSecurityGroupToVm($(this).attr("value"),instanceInfo.id,function (data){
				$.growlUI("提示",data.msg);
			},function onUpdateFailed(errorMsg){
				$.growlUI("错误",data.msg);
			})
		}).css("cursor","pointer");
	},
	switchType : function(type) {
		switch(type){
			case 1 : return "云主机";
			case 2 : return "弹性块存储";//"虚拟磁盘";
			case 3 : return "小型机";
			case 4 : return "云备份";
			case 5 : return "云监控";
			case 6 : return "负载均衡";
			case 7 : return "防火墙";
			case 8 : return "带宽";
			case 9 : return "互联网接入";
			case 10 : return "物理机";
			case 11 : return "对象存储";
			case 12 : return "弹性块存储";
			case 13 : return "文件存储";
			case 14 : return "Paas";
			case 16 : return "路由";
			case 17 : return "私有网络";
			case 18 : return "杀毒安全";
			default : return "未知";
		}
	},
	bindEvent : function() {
		
		$("#SavePassword").unbind("click").bind('click', function() {
			VM.SavePassword();
		});

		// 为table的右键菜单添加监听事件
		$("#contextMenu").unbind("mouseover").bind('mouseover', function() {
			VM.inMenu = true;
		});

		$("#contextMenu").unbind("mouseout").bind('mouseout', function() {
			VM.inMenu = false;
		});
		$("#contextMenu li").unbind("mousedown").bind('mousedown', function(e) {
			$("#contextMenu").hide();
			if (!$(this).hasClass("disabled"))VM.onOptionSelected($(this).attr("action"));
		});
		$("body").unbind('mousedown').bind('mousedown', function() {
			if (!VM.inMenu) {
				$("#contextMenu").hide();
			}
		});

		// 更改配置中添加点击div的效果

		$("div.osList").unbind().click(function() {
			$("div.osList").removeClass("selected");
			$(this).addClass("selected");
		});

		$("#content_container #checkAll").unbind().click(function(e) {
			e.stopPropagation();
			var checked = $(this).attr("checked") || false;
			if(checked) $("#content_container tbody input[type='checkbox']").attr("checked",true);
			else $("#content_container tbody input[type='checkbox']").removeAttr("checked");
			
			VM.checkSelected();
		});
	},
	checkboxClick : function(tr) {
		VM.checkSelected();
	},
	checkSelected : function(selectInstance) {
		var rightClicked = selectInstance?true:false;
		
		var allCheckedBox = $("#tbody2 input[type='checkbox']:checked");
		
		var oneSelected = allCheckedBox.length == 1;
		var hasSelected = allCheckedBox.length > 0;
		
		$(".operation").addClass("disabled");
		
		var state = $(allCheckedBox[0]).parents("tr").attr("state");
		var os = $(allCheckedBox[0]).parents("tr").attr("os");
		
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
					VM.onOptionSelected(action||"");
				});
			} else {
				$(operation).addClass("disabled");
				$(operation).unbind();
			}
		});
		
		
		if(rightClicked) {
			VM.instanceName = selectInstance.instanceName;
			VM.selectedInstanceId = selectInstance.id;	
			VM.selectedInstanceDisk = selectInstance.disk;
			VM.selectedInstanceOsId = selectInstance.osId;
			VM.selectedInstanceOs = selectInstance.os;
		} else {
			for ( var i = 0; i < allCheckedBox.length; i++) {
				var currentCheckBox = $(allCheckedBox[i]);
				if (i == 0) {
					VM.instanceName = currentCheckBox.parents("tr").attr("name");
					VM.selectedInstanceDisk = currentCheckBox.parents("tr").attr("disk");
					VM.selectedInstanceOsId = currentCheckBox.parents("tr").attr("osId");
					VM.selectedInstanceOs = currentCheckBox.parents("tr").attr("os");
					VM.selectedInstanceId = currentCheckBox.attr("value");
				} else {
					VM.instanceName += "," + currentCheckBox.parents("tr").attr("name");
					VM.selectedInstanceId += "," + currentCheckBox.attr("value");
				}
			}
		}
	},

	leftClickInterrupt : function(obj, title, str) {
		obj.addClass("disabled");
		obj.unbind().mousedown(function(e) {
			if (1 == e.which) {
				$.growlUI(title, str);
			}

		});
	},
	onOptionSelected : function(action) {
		{
			if ("changeVM" == action) {
				VM.modifyVMName(); // 修改
			} else if ("openVM" == action) { // 启动
				VM.openVM();
			} else if ("closeVM" == action) {
				VM.closeVM(); // 关机
			} else if ("reopenVM" == action) {
				VM.reopenVM(); // 重启
			} else if ("loadVdisk" == action) {
				 
				VM.showRuningEbs();
				$("#myModal002").modal("show"); // 加载硬盘
			} else if ("changeEquipment" == action) {
				VM.modifyVMConfiguration();
			} else if ("createSnapShot" == action) {
				VM.showBackupVMModal();
			} else if ("showSnapShot" == action) {
				VM.showVMSnapshotModal();
//				window.location.href='snap.jsp';
			} else if ("destroyVM" == action) {
				VM.destroyVM(); // 销毁
			} else if ("cfgFirewall" == action){
				VM.cfgFirewall();
			} else if ("vncVM" == action) {
				VM.vncVM();
			} else if ("renew" == action) {
				VM.renew();
			} else if ("backup" == action) {
				VM.backup();
			} else if ("queryBackup" == action) {
				VM.queryBackup();
			} else if ("msnap" == action) {
				msnap();
			} else if ("addVM2net" == action) {
				VM.queryPrivateNets();
			} else if("deleteVMFromNet" == action){
				VM.queryBindPrivateNets();
			}
			else if("ResetPassword" == action){
				VM.ResetPassword();
			}
			else if("export" == action){
				modifyFirewall.exportFile();
			}else if("changeVMOs" == action){
				VM.changeVMOs();
			}else if("changeVMOs1" == action){
				VM.changeVMOs1();
			}else if("startConfig" == action){
				Virus.startConfig();
			}else if("showRadomPassword" == action){
				VM.showRadomPassword();
			}else if ("changeFirewall" == action){
				VM.changeFirewall();
			}
//			else if("SavePassword" == action){
//				VM.SavePassword();
//			}
		}
	},
	
	showRuningEbs : function(id) {
		
		var params = {
				"id" : id,				
				"ownUserId" : "6",	
				"typesToAttach" : "12",
				"states" : "running",
				"targetOrAttached" : 1
		};
		
		Dcp.biz.apiRequest("/instance/ebs/describeEbsVolumes", params, function(data) {
			if (data.code != "0") {
				$.growlUI("提示", "查询弹性块存储发生错误：" + data.msg); 
			} else {				
				//{title : "用户", name : "ownUserAccount"}
				//VM.attachEbsToTable(data.data);
				if(null != VM.datatable){
					 
					if(VM.initebs){
						//VM.datatable.updateData(data.data);
						return;
					}
					VM.attachEbsToTable(data.data);
					VM.initebs = true;
					//alert(initebs);
					//VM.datatable.updateData(data.data);
				} 
//				else {						 
//					VM.datatable =  new com.skyform.component.DataTable();
//					VM.attachEbsToTable(data.data);
//				}
			}
		},function onError(){
			VM.attachEbsToTable(data.data);
		});	
	},
	
	attachEbsToTable : function(data){
		//{title : "<input type='checkbox' id='checkAll_attach'>", name : "id"},
		VM.datatable.renderByData("#vmToEbstable", { 
			"data" : data,
			"columnDefs" : [
			     {title : "", name : "id"},
			     {title : "ID", name : "id"},
			     {title : "名称", name : "instanceName"}
			],
			"onColumnRender" : function(columnIndex,columnMetaData,columnData) {
				 var text = columnData[''+columnMetaData.name] || "";
				 if(columnIndex ==0) {
					 text = "<div class='switch switch-small' ><input type='checkbox' checked/></div>";
//					 text = '<input type="checkbox" value="'+text+'">';
				 }
				 return text;
			},
			"afterRowRender" : function(rowIndex,data,tr) {
				tr.find(".switch").bootstrapSwitch();
			}
		});		
	},	
	
	modifyVMName : function(id) {
		var oldInstanceName = VM.getCheckedArr().parents("tr").find("td[name='instanceName']").text();
		VM.instanceName = oldInstanceName;
		if (VM.modifyVMNameModal == null) {
			VM.modifyVMNameModal = new com.skyform.component.Modal(
					new Date().getTime(),
					"修改主机的属性",
					'<div class="modal-body"> <form  class=\"form-horizontal\"> '
					        + '<fieldset>'
						        + '<div class=\"control-group\">'
							        + '<label class=\"control-label\" for=\"input01\">名称:</label>'
									+ '<div class=\"controls\"><input type=\"text\" name=\"instance_name\" id=\"updateName\" onblur=\"VM.test()\" value='+VM.instanceName+' maxlength=\"32\"><font color=\'red\'>*</font>(必填项)<br>'
									+ '</div>'
								+ '</div>'
								//+ '<font size="4">描述:</font><textarea cols="15" rows="2" id="updateComment"></textarea><br> 
							+ '</fieldset>'
					 + '</form></div>',
					{
						buttons : [
								{
									name : "确定",
									onClick : function() {
										var value = $("#updateName")[0].value;
										if (value == null || value == "") {
											alert("请输入修改后的名称");
											return;
										}
//										var updateComment= $("#updateComment")[0].value;										
										if(oldInstanceName != value){
											com.skyform.service.PortalInstanceService.querySameNameExist(window.currentInstanceType,value,function(isExist){
												if(!isExist){
													VM.service.updateNameAndDescription(VM.selectedInstanceId,$("#updateName")[0].value,null,function onUpdateSuccess(result){
														VM.modifyVMNameModal.hide();
														$.growlUI("提示","修改成功");
														VM.describleVM();
													},function onUpdateFailed(errorMsg){
														VM.modifyVMNameModal.hide();
														$.growlUI("错误","修改失败：" + errorMsg);
													});
												}
												else {
													$.growlUI("提示","该名称已经被使用，请重新输入");
												}
											});	
										}
										else {
											VM.service.updateNameAndDescription(VM.selectedInstanceId,$("#updateName")[0].value,null,function onUpdateSuccess(result){
												VM.modifyVMNameModal.hide();
												$.growlUI("提示","修改成功");
												VM.describleVM();
											},function onUpdateFailed(errorMsg){
												VM.modifyVMNameModal.hide();
												$.growlUI("错误","修改失败：" + errorMsg);
											});
										}
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
										VM.modifyVMNameModal.hide();
									}
								} ],
						beforeShow : function(){
							$("#updateName").val(VM.instanceName);
						}
					});

		}
		// VM.modifyVMNameModal.setWidth(600).autoAlign();
		VM.modifyVMNameModal.show();
	},
	getCheckedArr : function() {
		return $("#tbody2 tbody input[type='checkbox']:checked");
	},
	
	
	changeVMOs : function() {
		if (VM.changeVMOsModal == null) {
			var _id=new Date().getTime();
			VM.changeVMOsModal = new com.skyform.component.Modal(
					""+_id,
					"重置虚机操作系统",
					$("script#change_vm_os").html(),
					{
						buttons : [
								{
									name : "确定",
									onClick : function() {
										
										var count = $("#vm_oslist").find("input[type='radio']:checked").length;
										if(count == 0){
											$("#errorOsMsg").text("请选择要重置的操作系统");
											return
										}
										var idisk = parseInt(VM.selectedInstanceDisk);
										var odisk = parseInt(VM.selectedOsDisk);
										if(idisk < odisk){
											$("#errorOsMsg").text("所选的操作系统的系统盘不能超过虚机设定的系统盘");
											return
										}
										var changeos = {
												"id":VM.selectedInstanceId,
												"os":VM.selectedOsId
										};
										VM.service.changeVMOs(changeos,function(){
											VM.changeVMOsModal.hide();
											$.growlUI("提示","重置虚机操作系统成功");
											VM.describleVM();
										},function(errorMsg){
											$.growlUI("错误","重置错误：" + errorMsg);
											VM.changeVMOsModal.hide();
										});
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
										VM.changeVMOsModal.hide();
									}
								} ],
								afterShow : function(){
									var condition= {
											"id":VM.selectedInstanceId
									};
									VM.service.getOsListByVmId(condition,function(data){
										vmJson.oslist = data.oslist;
										VM.renderOsDataTable();
									},function(errorMsg){
										VM.changeVMOsModal.hide();
										$.growlUI("错误","修改失败：" + errorMsg);
									});
					           },
					           beforeShow:function(){
					        	   $("#errorOsMsg").text("");
					           }

		});

	}
		VM.changeVMOsModal.show();
	},
	renderOsDataTable:function(){
		var osdata =  vmJson.trans4OSByPool(CommonEnum.currentPool); 
		if(VM.initOsed){
			VM.dataOstable.updateData(osdata);
			return;
		}
		VM.dataOstable.renderByData(
						"#vm_oslist",// 要渲染的table所在的jQuery选择器
						{
							"data" : osdata, // 要渲染的数据选择器					
							"pageSize" : 5,
							"onColumnRender" : function(columnIndex,columnMetaData, columnData) {
								if(columnMetaData.name=='id') {
						              return '<input type="radio" name="osSelect" id="' + columnData.id + '" value="'+columnData.id+'">';
						           } else if ("osname" == columnMetaData.name) {
						              return columnData.name;
						           } else if ("mindisk" == columnMetaData.name) {
						        	   return columnData.mindisk+"G"
						           }
								return columnData[columnMetaData.name];
							},
							
							"afterRowRender" : function(rowIndex, data, tr) {
								tr.find("input[type='radio']").click(function(){
									VM.selectedOsId = data.id;
									VM.selectedOsDisk = data.mindisk;
								});
							}
						});
		VM.initOsed = true;
	},

	modifyVMConfiguration : function(id) {
		// TODO

		if (VM.modifyVMConfigurationModal == null) {
			var _id=new Date().getTime();
			VM.modifyVMConfigurationModal = new com.skyform.component.Modal(
					""+_id,
					"更改主机的配置",
					$("script#upgradeCfg").html(),
					{
						buttons : [
								{
									name : "确定",
									onClick : function() {
										var instanceId = VM.selectedInstanceId;
										var cpu = $("#myModal006change").find(
												".cpu-options.selected").attr(
												"data-value");
										var memory = $("#myModal006change")
												.find(
														".memory-options.selected")
												.attr("data-value");
										var muprty = {
												"cpuNum" : Number(cpu),
												"memorySize" : Number(memory)
										};
										//var instance = VM.getInstanceInfoById(VM.selectedInstanceId);
										var oc = $.trim($("#myModal006change #oldCpu").html());
										var om = $("#myModal006change #oldMem").html();
										if(Number(cpu) >= Number(oc) && Number(memory) >= Number(om) && (Number(cpu) > Number(oc) || Number(memory) > Number(om))) 
										{//CPU和内存必须大于等于原配置
											//CPU和内存必须大于等于原配置，且只要有一个配置大于原来值
											//console.log('CPU和内存必须大于等于原配置，且只要有一个配置大于原来值 === ok');
										}else {
											$("#myModal006change #errorMsg").addClass("icon-exclamation-sign text-error");
											$("#myModal006change #errorMsg").empty().html("&nbsp;请选择高于当前的配置，否则不能变更。")
											return;
										}
										com.skyform.service.PortalInstanceService.modprodprty("serviceroffering",instanceId,muprty,function(result){
											//订单提交成功后校验用户余额是否不足
											var _tradeId = result[0].tradeId;
											//{"msg":"","data":[{"feeValue":99520,"tradeId":"1409190068221003"}],"code":0}
											var _fee = result[0].feeValue/1000;
											var _modal = $("#"+_id);
											com.skyform.service.BillService.confirmTradeSubmit(_fee,_tradeId,_modal,function onSuccess(data){
												$.growlUI("提示", "操作成功"); 
//												$("#createModal").modal("hide");
												VM.modifyVMConfigurationModal.hide();
												// refresh
												VM.describleVM();							
											},function onError(msg){
												$.growlUI("提示", "更改配置申请提交成功,扣款失败");
//												$("#createModal").modal("hide");
												VM.modifyVMConfigurationModal.hide();
											});				
										},function(error){
											VM.modifyVMConfigurationModal.hide();
											ErrorMgr.showError("操作失败:" + error);
										});
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
										VM.modifyVMConfigurationModal.hide();
									}
								} ],
								beforeShow : function(){
									var osDes = VM.getCheckedArr().parents("tr").attr("os");		
									if((osDes.toLowerCase()).indexOf("win")!=-1){
										VM.isWin = true;
									}
									else VM.isWin = false;
									VM.getServiceOfferingId();
									VM.getCpuListUpgrade();
									cpuarr = VM.getCpuArr();
									VM.getMemoryListUpgrade(cpuarr[0]);
									var oldCpu = VM.getCheckedArr().parents("tr").attr("cpu");
									var oldMem = VM.getCheckedArr().parents("tr").attr("mem");
									$("#myModal006change #oldCpu").html(oldCpu);
									$("#myModal006change #oldMem").html(oldMem);
									$("#myModal006change #errorMsg").removeClass().empty();
									$("#myModal006change").find(".options .types-options.cpu-options")
									.click(
											function() {
												$("#myModal006change").find(
														".options .types-options.cpu-options ")
														.removeClass("selected");
												$(this).addClass("selected");
												//cpu = $(this).attr("data-value");							
											});
							$("#myModal006change").find(".options .types-options.memory-options")
									.click(
											function() {
												$("#myModal006change").find(
														".options .types-options.memory-options ")
														.removeClass("selected");
												$(this).addClass("selected");
												//memory = $(this).attr("data-value");
												
											});
							 var oldC = $("#myModal006change").find(".options .types-options.cpu-options[data-value="+oldCpu+"]");
							 oldC.click();
							 if(oldMem!=0.5){
								 var oldM = $("#myModal006change").find(".options .types-options.memory-options[data-value="+oldMem+"]");
								 oldM.click();
							 }
							if(!CommonEnum.offLineBill){
								$(".feeInput_div").show();
							}
							 
							 VM.getFee4change();
						}	
					
					});

		};
		$(".subFee4change").bind('mouseup keyup',function(){
			setTimeout('VM.getFee4change()',5);
		});

		VM.modifyVMConfigurationModal.show();
	},
	changeVMOs1:function(){
		var confirmModal = new com.skyform.component.Modal(
				new Date().getTime(),
				"重置虚机操作系统",
				"<h4>当前重置操作系统为"+VM.selectedInstanceOs+ "</h4>",
				{
					buttons : [
							{
								name : "确定",
								onClick : function() {
									confirmModal.hide();
									var condition = {
											"id":VM.selectedInstanceId,
											"os":VM.selectedInstanceOsId
									};
									VM.service.changeVMOs(condition,function(result){
										$.growlUI("提示", "重置操作系统成功");
										VM.describleVM();
									},function onError(errorMsg){
										ErrorMgr.showError("重置虚机操作系统失败:" + errorMsg);
									});
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
		confirmModal.autoAlign();
		confirmModal.show();
	},
	showRadomPassword:function(){
		var condition = {
				"id":VM.selectedInstanceId,
		};
		VM.service.getVmRandomPassword(condition,function(result){
			var confirmModal = new com.skyform.component.Modal(
					new Date().getTime(),
					"随机密码",
					"<h4>当前虚机的初始密码为："+result.password+ "</h4><br><h5>注：此密码为虚拟机创建时初始化密码，若您已重置过系统密码或者在系统中修改密码，则此密码失效，请重置您的系统密码</h5>",
					{
						buttons : [
								{
									name : "确定",
									onClick : function() {
										confirmModal.hide();
									},
									attrs : [ {
										name : 'class',
										value : 'btn btn-primary'
									} ]
								} ]
					});
			confirmModal.autoAlign();
			confirmModal.show();
		},function onError(errorMsg){
			ErrorMgr.showError("查询随机密码失败:" + errorMsg);
		});
		
	},
	destroyVM : function(id) {
		var confirmModal = new com.skyform.component.Modal(
				new Date().getTime(),
				"销毁云主机",
				"<h4>您确认要销毁" + "吗?</h4>",
				{
					buttons : [
							{
								name : "确定",
								onClick : function() {
									confirmModal.hide();
									VM.service.destroyVM(VM.selectedInstanceId,function(result){
										$.growlUI("提示", "操作成功");
										com.skyform.service.modifyStatus.modifyAllStatus(VM.selectedInstanceId,"deleting",VM.instances,function(){
									    	VM.renderDataTable(VM.instances);
									    });
										
									},function onError(errorMsg){
										ErrorMgr.showError("销毁虚机失败:" + errorMsg);
									});
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
	closeVM : function(id) {
		var confirmModal = new com.skyform.component.Modal(
				new Date().getTime(), "关闭云主机", "<h4>您确认要关机吗?</h4>", {
					buttons : [
							{
								name : "确定",
								onClick : function() {
									VM.service.stopVms(VM.selectedInstanceId,function(result){
										$.growlUI("提示", "操作成功");
										confirmModal.hide();
										com.skyform.service.modifyStatus.modifyAllStatus(VM.selectedInstanceId,"stopping",VM.instances,function(){
									    	VM.renderDataTable(VM.instances);
									    });
									},function onError(errorMsg){
										confirmModal.hide();
										$.growlUI("错误","关机失败:" + errorMsg);
									});
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
	openVM : function(id) {
		var confirmModal = new com.skyform.component.Modal(
				new Date().getTime(), "开启云主机", "<h4>您确认要开机吗?</h4>", {
					buttons : [
							{
								name : "确定",
								onClick : function() {
									VM.service.startVms(VM.selectedInstanceId,function onStarted(result){
										confirmModal.hide();
										$.growlUI("提示", "操作成功");
										//刷新开启云主机缓存
										com.skyform.service.modifyStatus.modifyAllStatus(VM.selectedInstanceId,"starting",VM.instances,function(){
									    	VM.renderDataTable(VM.instances);
									    });
									},function onFailedToStart(errorMsg){
										confirmModal.hide();
										ErrorMgr.showError("开机失败："+errorMsg);
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
	reopenVM : function(id) {
		var confirmModal = new com.skyform.component.Modal(
				new Date().getTime(), "重启云主机", "<h4>您确认要重启吗?</h4>", {
					buttons : [
							{
								name : "确定",
								onClick : function() {
									VM.service.restartVms(VM.selectedInstanceId,function onRestarted(result){
										confirmModal.hide();
										$.growlUI("提示", "操作成功");
										com.skyform.service.modifyStatus.modifyAllStatus(VM.selectedInstanceId,"resetting",VM.instances,function(){
									    	VM.renderDataTable(VM.instances);
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
	test : function() {
		var value = $("#updateName")[0].value;
//		var commentvalue = $("#updateComment")[0].value;
		if (value == null || value == "") {
			alert("请输入修改后的名称");
		}
		if (value.length > 32) {
			alert("名称不能大于16个字符");
		}
//		if (commentvalue.length > 100) {
//			alert("描述不能大于100个字符");
//		}
	},

	// 显示虚拟硬盘备份MODAL
	showBackupVMModal : function() {
		$("#backupVolumeId").val(VM.selectedInstanceId);
		$("#backupVolumeName").val(VM.instanceName);
		$("#backupModal").modal("show");
	},
	// 虚拟硬盘备份
	backupVolume : function() {
		var params = {
			"instanceInfoId" : VM.selectedInstanceId
			//"comment" : $.trim($("#backupVolumeComment").val())
		};
		Dcp.biz.apiRequest("/instance/cbsVolumn/createSnapShot", params, function(
				data) {
			if (data.code == "0") {
				$.growlUI("提示", "备份虚拟硬盘成功！");
				$("#updateData").click();
			} else {
				$.growlUI("提示", data.msg);
			}
			$("#backupModal").modal("hide");
		});
	},
	// 虚拟硬盘快照管理
	showVMSnapshotModal : function() {
		$("#recoveryVolumeId").val(VM.selectedInstanceId);
		$("#recoveryVolumeName").val(VM.selectedInstanceId);
		VM.renderVolumeUserSnapshotList(VM.selectedInstanceId);
	},
	// 渲染快照列表
	renderVolumeUserSnapshotList : function(volumeId) {
		var params = {
			"vmID" : volumeId
		};
		Dcp.biz.apiRequest("/instance/cbsVolumn/descCbsVolumnOfVM",params,function(data) {
			if (data.code == "0") {
				var snapshotList = data.data;
				var container = $("#volumeSnapshotTable tbody").empty();
				if (snapshotList.length == 0) {
					container.append("<tr><td colspan='4'>此虚拟硬盘无可用快照</td></tr>");
				} else {
					$(snapshotList).each(
						function(i, item) {
							var dom = "";
							dom = $("<tr>"
									+ "<td>"
									+ item.id
									+ "</td>"
									+ "<td>"
									+ (new Date(
											item.createDt)
											.format("yyyy-MM-dd hh:mm:ss"))
									+ "</td>"
									+ "<td>"
									+ item.comment
									+ "</td>"
									+ "<td>"
									+ "<a href='javascript:void(0);' class='icon-refresh' title='恢复'></a>&nbsp;&nbsp;"
									+ "<a href='javascript:void(0);' class='icon-remove' title='删除'></a>"
									+ "</td>"
									+ "</tr>");
							dom.find(
								".icon-refresh")
								.unbind("click")
								.bind("click",function() {
									VM.recoverySnapshot(volumeId,item.id);
								});
							dom.find(".icon-remove").unbind("click").bind("click",
								function() {
									VM.deleteSnapshot(volumeId,item.id);
								});
							container.append(dom);
						});
				}
			$("#snapshotModal").modal("show");
			} else {
				$.growlUI("提示", data.msg);
			}
		});
	},
	// 虚拟硬盘快照恢复
	recoverySnapshot : function(volumeId, userSnapshotId) {
		var container = $("#snapshotModal");
		$(".userSnapshotlistBody", container).addClass("hide");
		$(".userSnapshotlistFooter", container).addClass("hide");
		$(".deleteOrRecoveryUserSnapshotBody", container).find("h4").html(
				"你确认要恢复快照吗？");
		$(".deleteOrRecoveryUserSnapshotBody", container).removeClass("hide");
		$(".deleteOrRecoveryUserSnapshotFooter", container).removeClass("hide");

		// 确认恢复
		$("#btnDeleteOrRecoverySnapshotSave", container).unbind("click").bind(
				"click",
				function() {
					var params = {
						"id" : userSnapshotId
					};
					Dcp.biz.apiRequest(
							"/instance/cbsVolumn/restoreSnapShot/"+userSnapshotId, params,
							function(data) {
								$(".deleteOrRecoveryUserSnapshotBody",
										container).addClass("hide");
								$(".deleteOrRecoveryUserSnapshotFooter",
										container).addClass("hide");
								$(".userSnapshotlistBody", container)
										.removeClass("hide");
								$(".userSnapshotlistFooter", container)
										.removeClass("hide");
								if (data.code == "0") {
									$.growlUI("提示", "恢复快照成功！");
									$("#snapshotModal").modal("hide");
									$("#updateData").click();
								} else {
									$.growlUI("提示", data.msg);
								}
							});
				});

		// 取消恢复
		$("#btnDeleteOrRecoverySnapshotCancel", container).unbind("click")
				.bind(
						"click",
						function() {
							$(".deleteOrRecoveryUserSnapshotBody", container)
									.addClass("hide");
							$(".deleteOrRecoveryUserSnapshotFooter", container)
									.addClass("hide");
							$(".userSnapshotlistBody", container).removeClass(
									"hide");
							$(".userSnapshotlistFooter", container)
									.removeClass("hide");
						});
	},
	// 虚拟硬盘快照删除
	deleteSnapshot : function(volumeId, userSnapshotId) {
		var container = $("#snapshotModal");
		$(".userSnapshotlistBody", container).addClass("hide");
		$(".userSnapshotlistFooter", container).addClass("hide");
		$(".deleteOrRecoveryUserSnapshotBody", container).find("h4").html("你确认要删除快照吗？");
		$(".deleteOrRecoveryUserSnapshotBody", container).removeClass("hide");
		$(".deleteOrRecoveryUserSnapshotFooter", container).removeClass("hide");

		// 确认删除
		$("#btnDeleteOrRecoverySnapshotSave", container).unbind("click").bind(
				"click",
				function() {
					var params = {
						"id" : userSnapshotId
					};
					Dcp.biz.apiRequest("/instance/cbsVolumn/deleteVolumeSnapshot/"+userSnapshotId,
							params, function(data) {
								$(".deleteOrRecoveryUserSnapshotBody",
										container).addClass("hide");
								$(".deleteOrRecoveryUserSnapshotFooter",
										container).addClass("hide");
								$(".userSnapshotlistBody", container)
										.removeClass("hide");
								$(".userSnapshotlistFooter", container)
										.removeClass("hide");
								if (data.code == "0") {
									$.growlUI("提示", "删除快照成功！");
									$("#snapshotModal").modal("hide");
									$("#updateData").click();
								} else {
									$.growlUI("提示", data.msg);
								}
							});
				});

		// 取消删除
		$("#btnDeleteOrRecoverySnapshotCancel", container).unbind("click")
				.bind(
						"click",
						function() {
							$(".deleteOrRecoveryUserSnapshotBody", container)
									.addClass("hide");
							$(".deleteOrRecoveryUserSnapshotFooter", container)
									.addClass("hide");
							$(".userSnapshotlistBody", container).removeClass(
									"hide");
							$(".userSnapshotlistFooter", container)
									.removeClass("hide");
						});
	},
	//配置防火墙规则弹出方法
	cfgFirewall : function(){		
		//查询关联的防火墙
		//var id  = $("#tbody2 tbody input[type='checkbox']:checked");
		var vmId = VM.selectedInstanceId;
		VM.refreshFirewall(vmId);
		var params = {
				"vmId" : vmId
		};
		var firewallId = "";
		Dcp.biz.apiRequest("/instance/firewall/SecurityGroupRule", params, function(data){
			if(data.code == "0"){
				var group = data.data;
				modifyFirewall.exportRules = group.securityGroupRules;
				if (group){					
					$("#modifyFirewallModal #vmId").val(vmId);
					$("#modifyFirewallModal #groupId").val(group.securityGroupId);					
					firewallId = group.securityGroupId;					
					modifyFirewall.init(group.securityGroupId); 
					$.each(group.securityGroupRules,function(i,rule){
//						rule.state = RuleState4Yaxin[rule.state];
						rule.id = rule.securityGroupRuleId;
						modifyFirewall._addRuleForShow(rule);	
					});			
				}
			} else {
				$.growlUI("云主机", "查询关联资源错误：" + data.msg); 
			}
		});	
		
		
		
		//FireWallCfg.container = "#modifyfirewallrule";
		//FireWallCfg.commonRulesCfg = "#modifycommonRules";
		//VM._generateContent_tmp = FireWallCfg._generateContent;
		/*FireWallCfg._generateContent = function (rule){
			return ""+
			"<td>" + rule.name + "</td>" + 
			"<td>" + rule.port + "</td>" + 
			"<td>" + rule.protocol + "</td>" + 
			"<td align='center'> <button class='btn btn-danger btn-del btn-mini' ruleId='"+rule.id+"'>删除</button></td>";
		};
		FireWallCfg.init();*/
		$("#modifyFirewallModal").off("show").on("show",function(){
			modifyFirewall.resetUploadDiv();
		});
		$("#modifyFirewallModal").modal("show");
	},
	//停止虚拟机，刷新防火墙
	refreshFirewall : function(vmId){
		AutoUpdater.stop();
		AutoUpdater.parentid = vmId;
		window.currentInstanceType='firewall';
		AutoUpdater.start();
	},
	renew : function(){
		var lbId = VM.getCheckedArr().parents("tr").attr("instanceId");
		if(VM.renewModal){
			
		}else{
			VM.renewModal = new com.skyform.component.Renew(lbId,{
				buttons : [
							{
								name : "保存",
								onClick : function(){
									var period = VM.renewModal.getPeriod().getValue();
									$("#renewModal").modal("hide");	
									var _modal = $("#renewModal");
									com.skyform.service.renewService.renew(VM.getCheckedArr().parents("tr").attr("instanceId"),period,function onSuccess(data){
										//订单提交成功后校验用户余额是否不足
										var _tradeId = data.tradeId;
										var _fee = $("#feeInput_renew").text();
										com.skyform.service.BillService.confirmTradeSubmit(_fee,_tradeId,_modal,function onSuccess(data){
											$.growlUI("提示", "续订申请提交成功,扣款成功, 请耐心等待..."); 
											// refresh
//											VM.updateDataTable();									
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
									VM.renewModal.hide();
								}
							}
						]
					});
			}
			VM.renewModal.getFee_renew(lbId);
			VM.renewModal.show();		
			$(".subFee_renew").bind('mouseup keyup',function(){
				setTimeout('VM.renewModal.getFee_renew('+lbId+')',100);
			});
	},
	backup : function(){
		$("#backupModal").modal("show");
	},
	//点击查看备份按钮
	queryBackup : function(){
//		var volumeId = VM.getCheckedArr().parents("tr").attr("id");
//		VM.service.listVmsToAttach(volumeId,function onSuccess(data){
//			if(data.length == 0){
//				$.growlUI("提示", "没有！"); 
//		    } else {
		var data = null;
		$("#queryBackupModal").on("shown",function(){
			if(VM.backupDataTable != null){
				VM.backupDataTable.updateData(data);
			} else {
				VM.backupDataTable =  new com.skyform.component.DataTable();
				VM.renderBackupDataTable(data);
			}				
		});
		$("#queryBackupModal").modal("show");
		    	
//			}				
//		},function onError(msg){
//			$.growlUI("提示", "查询可用备份发生错误：" + msg); 
//		});
		
	},
	renderBackupDataTable : function(data) {
		 VM.backupDataTable.renderByData("#backupTable", {
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
		 VM.backupDataTable.addToobarButton("#backuptoolbar");
	},
	//点击添加到私有网络按钮
	queryPrivateNets : function(){
		var allCheckedBox = $("#tbody2 input[type='checkbox']:checked");		
		var instanceId = $(allCheckedBox[0]).parents("tr").attr("instanceId");
		VM.service.getPrivateNets(instanceId,"unbind",function onSuccess(data){	
			$("#add2netModal").on("shown",function(){
				if(VM.add2NetTable != null){
					VM.add2NetTable.updateData(data);
				} else {
					VM.add2NetTable =  new com.skyform.component.DataTable();
					VM.renderAdd2NetTable(data);
				}				
			});
			$("#add2netModal").modal("show");	    	
	    },function onError(msg){
	      ErrorMgr.showError(msg);
//	      $.growlUI("提示", "查询可用私网发生错误：" + msg); 
	    });	
	},
	renderAdd2NetTable : function(data) {
//		{"msg":"success","data":[{"expireDate":1391914952000,"id":67837058,"ipSegments":"192.168.1.2-192.168.1.254","name":"tttt_67837058","routeName":"route2_67827015","ipGateway":"192.168.1.1","state":"using","createDate":1410925486000}],"code":0}
		 VM.add2NetTable.renderByData("#add2netTable", {
				"data" : data,
				"pageSize": 5,
				"columnDefs" : [
				     {title : "", name : "id"},
				     {title : "私网名称", name : "name"},
				     {title : "网关", name : "ipGateway"}
				],
				"onColumnRender" : function(columnIndex,columnMetaData,columnData) {
					 var text = columnData[''+columnMetaData.name] || "";
					 if(columnIndex ==0) {
						 text = "<input type='radio' name='id' value="+text+">";
					 }
					 if (columnMetaData.name == "createDate") {
						 text = new Date(text).format("yyyy-MM-dd hh:mm:ss");
					 }
					 return text;
				},
				"afterRowRender" : function(index,data,tr){
					if(index == 0) {
						$(tr).find("input[type='radio']").attr("checked", "checked");
					}
				}					
			});
//		 VM.add2NetTable.addToobarButton("#add2NetToolbar");
	},
	//点击添加到私有网络按钮
	queryBindPrivateNets : function(){
		var allCheckedBox = $("#tbody2 input[type='checkbox']:checked");		
		var instanceId = $(allCheckedBox[0]).parents("tr").attr("instanceId");
		
		VM.service.getPrivateNets(instanceId,"bind",function onSuccess(data){	
			$("#removeFromNetModal").on("shown",function(){
				if(VM.removeFromNetTable != null){
					VM.removeFromNetTable.updateData(data);
				} else {
					VM.removeFromNetTable =  new com.skyform.component.DataTable();
					VM.renderRemoveFromNetTable(data);
				}				
			});
			$("#removeFromNetModal").modal("show");	    	
	    },function onError(msg){
	      ErrorMgr.showError(msg);
//	      $.growlUI("提示", "查询可用私网发生错误：" + msg); 
	    });	
	},
	
	ResetPassword : function(){
		var row = VM.datatable.getContainer().find("tbody").find("input[type='checkbox']:checked").closest('tr');
		$("#resetPassword").modal("show");
		$("#uuid").val(row.attr("uuid"));
		$("#act").val(row.attr("act"));
			
	},
	
	SavePassword : function(){
		$("#tipName_nPassword").text("");
		$("#tipName_confirmPassword").text("");
		
		var flag = true;
		var uuid = $("#uuid").val();
		var _nPassword = $("#nPassword").val();
		var _confirmPassword = $("#confirmPassword").val();
		
//		$("#tipName_confirmPassword").removeClass("error").empty();
		if($.trim(_nPassword).length < 8||$.trim(_nPassword).length>32)
		{
			$("#tipName_nPassword").text("8-32位密码！");
			flag = false;
		}
//		if($.trim(_confirmPassword).length < 8||$.trim(_confirmPassword).length>32)
//		{
//			$("#tipName_confirmPassword").addClass("error").text("8-32位密码！");
//			flag = false;
//		}
		if (_nPassword != _confirmPassword) {
			$("#tipName_confirmPassword").text("两次输入密码不一致！");
			flag = false;
		}
		if(flag == false)
			return;
		var condition = {
			"id" : uuid,
			"password" : _nPassword
		}
		
		VM.service.resetPWD(condition, function(result) {
			$("#resetPassword").modal("hide");
//			 System.notifyInfo("重置成功！")
				$.growlUI("提示", "重置成功！");
			}, function(error) {
				$("#resetPassword").modal("hide");
//				 System.notifyError("重置错误！");
				$.growlUI("提示", "重置错误！");
			});
		// $("#resetPassword").modal("hide");
			
	},
	
	renderRemoveFromNetTable : function(data) {
//		{"msg":"success","data":[{"expireDate":1391914952000,"id":67837058,"ipSegments":"192.168.1.2-192.168.1.254","name":"tttt_67837058","routeName":"route2_67827015","ipGateway":"192.168.1.1","state":"using","createDate":1410925486000}],"code":0}
		 VM.removeFromNetTable.renderByData("#removeFromNetTable", {
				"data" : data,
				"pageSize": 5,
				"columnDefs" : [
				     {title : "", name : "id"},
				     {title : "私网名称", name : "name"},
				     {title : "网关", name : "ipGateway"}
				],
				"onColumnRender" : function(columnIndex,columnMetaData,columnData) {
					 var text = columnData[''+columnMetaData.name] || "";
					 if(columnIndex ==0) {
						 text = "<input type='radio' name='id' value=' "+text+" '>";
					 }
					 if (columnMetaData.name == "createDate") {
						 text = new Date(text).format("yyyy-MM-dd hh:mm:ss");
					 }
					 return text;
				},
				"afterRowRender" : function(index,data,tr){
					if(index == 0) {
						$(tr).find("input[type='radio']").attr("checked", "checked");
					}
				}					
			});
//		 VM.removeFromNetTable.addToobarButton("#add2NetToolbar");
	},
	changeFirewall:function(){		
		if(!VM.changeFirewallModal){
			VM.changeFirewallModal = new com.skyform.component.Modal(new Date().getTime(),"<h3>修改安全组</h3>",$("script#firewall_form").html(),{
				buttons : [
				           {name:'提交',onClick:function(){	
				        	   var sgId = $("input[type='radio'][name='ssRadio']:checked").val();		
								var instance = {
										"vmid":VM.selectedInstanceId,
										"oldsecurityid":VM.selectSGid,
										"newsecurityid":sgId
									};				
								com.skyform.service.FirewallService.changeSG(instance, function onSuccess(data){
									VM.changeFirewallModal.hide();
									$.growlUI("提示", "修改成功！");										
								},function onError(msg){
									VM.changeFirewallModal.hide();
									$.growlUI("提示", "修改失败！");
								});
				        	   
				           },attrs:[{name:'class',value:'btn btn-primary'}]},
				           
				           {name:'取消',onClick:function(){
				        	   VM.changeFirewallModal.hide();
				           },attrs:[{name:'class',value:'btn'}]}
				           ],
				
				beforeShow : function(){
					var allCheckedBox = $("#tbody2 input[type='checkbox']:checked");
					var vmId = $(allCheckedBox[0]).parents("tr").attr("instanceId");					
					com.skyform.service.FirewallService.querySG(function(result){
						var data = VM.querySGByState(result);
						if(VM.selectTable) {
							VM.selectTable.updateData(data);				
						} else {							
							VM.selectTable = new com.skyform.component.DataTable();
							VM.selectTable.renderByData("#selectTable",{
								pageSize : 5,
								data : data,
								onColumnRender : function(columnIndex,columnMetaData,columnData){

									 var text = columnData[''+columnMetaData.name] || "";
									 if(columnMetaData.name=='id') {
										 text = '<input type="radio" name="ssRadio" value="'+columnData['subscriptionId']+'">';
									 }
									 else if (columnMetaData.name == "ID") {
										 text = columnData['subscriptionId'];
									 }
									 else if (columnMetaData.name == "instanceName") {
										 text = columnData['subscriptionName'];
									 }
									 else if (columnMetaData.name == "state") {
										 if("bind error"==columnData.subServiceStatus){
											 if("0"==columnData.isUsed){
												 columnData.subServiceStatus = "running";
											 }
											 else columnData.subServiceStatus = "using";
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
											return text;
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
								afterRowRender : function(rowIndex,data,tr){
									if(0==rowIndex){
										tr.find("input[type='radio'][name='ssRadio']").attr("checked",'checked');
									}
									
								},
								afterTableRender : function(){
									//$("#sgTable_wrapper .btn").hide();
								}
								
							});				
							VM.ssRadioInited = true;
						}		
					})
				
				},
				afterShow:function(){
					
				}
			});
		}
		VM.changeFirewallModal.autoAlign().setTop(100).setWidth(700).setHeight().show();		
	
	
	}
	
};

	function validatehadPrivateNet(select){		
		var result = {status : true};
		$("#tip_1226").empty();
		if($("#vm_privatenetwork option").length == 0){
			$("#tip_1226").empty().html("* 请先去申请私有网络！");
			result.status = false;
		}
		return result;			
	};
	function validatehadsg(select){
		var result = {status : true};
		$("#sgMsg").empty();
		var sgoption = $("input[type='radio'][name='sgoption']:checked").val();
		if("useExisted" == sgoption) {
			if (!$("input[type='radio'][name='sgRadio']").is(':checked')){
				$("#sgMsg").empty().html("<strong class='text-error'>* 请选择一个安全组!</strong>");
				result.status = false;
			}
		} 		
		return result;
	}