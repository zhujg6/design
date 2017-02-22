//当前刷新实例的类型为虚拟机
window.currentInstanceType='vm';

//$(function() {
//	VM.init();	
//});

window.Controller = {
		init : function(){
			VM.init();		
			$(".provider-filter").tooltip();
		},
		refresh : function(){
			VM.describleVM();			
		}
	};

var RuleState4Yaxin = {0:Dict.val("user_processing"),9:Dict.val("common_success")};
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
			$("a#refreshBtnFirewall").unbind().click(function(){
				modifyFirewall.refreshBtnFirewall();
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
				//VM.refreshFirewall(vmId);
				modifyFirewall.resetUploadDiv();
//				if (currXhr) {
//		            currXhr.abort();
//		        }
			});
			
//			$("safe_switch").on('switch-change',function(e,data){
//				var ck = $("#safe_switch input[type='checkbox']").attr("checked");
////				if(ck){ //开启
////					VdiskVolume.enableNativeDiv();
////				}else{
////					VdiskVolume.disableNativeDiv();
////				}
//			});
			
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
			//安全组
			$(com.skyform.service.FireWallRule).each(function(i,rule){
				var ruleItem = $("<button class='btn btn-success btn-mini'>"+rule.name+"</button>");
				ruleItem.unbind().click(function(e){
					e.preventDefault();
					$(rule.port).each(function(p,rule_ports){
						$(rule.protocol).each(function(r,rule_protocols){
							var newRule = {
								name : rule.name,
								port : rule_ports.port,
								protocol : rulvm_privatenetworke_protocols.type,
								direction : rule.direction,
								ip : ""
							};
							modifyFirewall.addRuleAction(newRule);
							//if(rule.name=="ICMP"){
								var newRuleUpdirection = {
										name : rule.name,
										port : rule_ports.port,
										protocol : rule_protocols.type,
										direction : "egress",
										ip : ""
								};
								modifyFirewall.addRuleAction(newRuleUpdirection);
							//}
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
		//修改安全组规则
		refreshBtnFirewall:function(){
			var vmId = VM.selectedInstanceId;
			//VM.refreshFirewall(vmId);
			var params = {
					"vmId" : parseInt(vmId)
			};
			var firewallId = "";
			Dcp.biz.apiRequest("/instance/firewall/qrySecurityGroupRules", params, function(data){
				if(data.code == "0"){
					var group = data.data;
					modifyFirewall.exportRules = group.securityGroupRules;
					if (group){					
						$("#modifyFirewallModal #vmId").val(vmId);
						$("#modifyFirewallModal #groupId").val(group.securityGroupId);					
						firewallId = group.securityGroupId;					
						modifyFirewall.init(group.securityGroupId); 
						$.each(group.securityGroupRules,function(i,rule){
//							rule.state = RuleState4Yaxin[rule.state];
							rule.id = rule.securityGroupRuleId;
							modifyFirewall._addRuleForShow(rule);	
						});			
					}
				} else {
					$.growlUI(Dict.val("common_vm"), Dict.val("vm_queries_related_resource_error") + data.msg); 
				}
			});	
		},
		addRule : function(firewallid){
			var name = $("#rule_name",modifyFirewall.container).val().trim();
			var port = $("#rule_port",modifyFirewall.container).val().trim();
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
					"vmId" : parseInt($("#modifyFirewallModal #vmId").val()),
					"securityGroupId" : parseInt($("#modifyFirewallModal #groupId").val()),
					"securityGroupRules" : [],
					"modeunBlock":"true"
				};
				if(rule instanceof Array){
					group.securityGroupRules = rule;
				}
				else group.securityGroupRules.push(rule);				
				VM.firewallService.addSecurityGroupRule(group,function(data){
					rule.state = 0;
					modifyFirewall._addRule(rule);										
				},function(data){
					$.growlUI(Dict.val("common_tip"), Dict.val("fw_add_rule_fails") + data); 
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
								"<option value='ingress'>"+Dict.val("common_ingress")+"</option>" +
								"<option value='egress'>"+Dict.val("common_egress")+"</option>" +
							"</select>" +
						"</td>" +
						"<td> <button class='btn btn-primary btn-save'>"+Dict.val("common_save")+"</button></td>"
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
					modifyFirewall.container.find("td[id='"+id+"']").empty();
					modifyFirewall.container.find("td[id='"+id+"']").eq(0).append(Dict.val("common_processing"));
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
				"securityGroupRuleId" : parseInt(id),
				"securityGroupId" : parseInt($("#modifyFirewallModal #groupId").val()),
				"vmId" : parseInt($("#modifyFirewallModal #vmId").val())
			}
			com.skyform.service.FirewallService.delSecurityGroupRule(param, function(data) {
//				if (data.code != "0") {
//				} else {				
//				}
				VM.cfgFirewall();
			},function onError(e){
				$.growlUI(Dict.val("common_tip"), Dict.val("fw_delete_fule_fails") + e); 
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
				$("#name_error",modifyFirewall.container).html(Dict.val("common_name_not_empty"));
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
						$("#port_error",modifyFirewall.container).html(Dict.val("common_invalid_port_number"));
						portValid = false;
					}
					//开放80、443的下行端口
					else if((item==80&&rule.direction!='egress')||(item==443&&rule.direction!='egress')){
						if(CommonEnum.userHttpRecord.length>0){//共有云，行业云备案的用户开放80,443下行
						  }else{//效验80,443
						$(portValidator,modifyFirewall.container).css("border","1px solid red");
						$("#port_error",modifyFirewall.container).html(Dict.val("fw_temporarily_open_port"));
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
					$("#port_error",modifyFirewall.container).html(Dict.val("\u65e0\u6548\u7684\u7aef\u53e3\u53f7"));
					portValid = false;					
				}
			}
			var ipValid = true;
			if(rule.protocol == 'ip') {
				var _IPValidate = function(ip) {
					return /^([0-9]|[1-9][0-9]|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9][0-9]|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9][0-9]|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9][0-9]|1\d\d|2[0-4]\d|25[0-5])$/.test(ip);
				};
				var _NumberCheck = function(num){
					return /^[0-9]*$/.test(num);
				};
				var _showIpError = function(){
					$(ipValidator,modifyFirewall.container).css("border","1px solid red");
					$(".portCol").attr("colspan","0");
					$("#ip_error",modifyFirewall.container).html(Dict.val("common_invalid_ip"));
					ipValid = false;
				};
				var inputIp = [];
				if(null==rule.ip||rule.ip.length==0){
					_showIpError();
				}
				else if(rule.ip.indexOf("/")>0){
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
				$("#port_error",modifyFirewall.container).html(Dict.val("common_port_protocol_direction_not_repeated"));
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
				case "ingress" : return Dict.val("common_ingress");
				case "egress" : return Dict.val("common_egress");
				default : return Dict.val("common_ingress");
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
				$("#tipFile2upload").text(Dict.val("common_please_select_file"));
				return;
			}else{
				$("#tipFile2upload").text("");
			}
//			var re = /^(doc|pdf|txt|rar|zip)$/;
			var _extend = _filename.substring(_filename.lastIndexOf(".")+1);
			var re = /^(xls)$/;
			var isValid = (_extend && re.test(_extend));
			if (!isValid) {
				$("#tipFile2upload").text(Dict.val("common_please_up_xls_file"));
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
							$.growlUI(Dict.val("common_tip"),Dict.val("common_import_executed")+rs.msg); 
						}else if(null!=rs&&rs.msg!== null){
							$.growlUI(Dict.val("common_tip"),Dict.val("common_import_executed")+rs.msg); 
						}
						else $.growlUI(Dict.val("common_tip"),Dict.val("common_import_failed_file_format_error") ); 
				        VM.selectedInstanceId = vmId;
		            	VM.cfgFirewall();		            	
		            	//VM.refreshFirewall(vmId);
		    	    },			            	
		            error    : function() {
		            	$.growlUI(Dict.val("common_tip"), Dict.val("common_import_failed")); 
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
	var vmInstance = VM.getInstanceInfoById(VM.selectedInstanceId);
	window.location.href = "snap2.jsp?code=snap&vmId="+VM.selectedInstanceId+"&state="+vmInstance.state;
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
	routeProductId : "",
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
	selectedProductId : null,
	selectedOsId:null,
	selectedInstanceOsId:null,
	selectedInstanceDisk:null,
	selectedInstanceOs:null,
	selectedOsDisk:null,
	securityVMModal:null,
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
	ChannelService :com.skyform.service.channelService,
	changeFirewallModal:null,
	selectTable:null,
	groupQuota:10,
	groupTotal:0,
	selectSGid:0,
	nicId:0,
	limitRate:0,
	BasicNetworkIpsubscriptionId:"",
	sgInstances:null,
	ssRadioInited:false,
	selectSGName:'',
	lastCheckedArr:null,
	defPool:"tianjin,nanchang",
//	safeWallMsg:"",
//	deepBagMsg:"",
	init : function() {
		VM.inMenu = false; // 用于判断鼠标当前是否在下拉操作框中即$("#contextMenu")和$("#dropdown-menu")
		VM.selectedInstanceId = null;
		VM.selectedProductId = null;
		VM.instanceName = null;
		VM.instances = [],
		VM.VMState = {
			"pending" : Dict.val("common_ins_state_pending"),
			"reject" : Dict.val("common_ins_state_reject"),
			"opening" : Dict.val("common_ins_state_opening"),
			"changing" : Dict.val("common_ins_state_changing"),
			"deleting" : Dict.val("common_we_are_destroyed"),
			"deleted" : Dict.val("common_been_destroyed"),
			"running" : Dict.val("common_ins_state_operation"),
			"using" : Dict.val("common_ins_state_is_using"),
			"attaching" : Dict.val("common_ins_state_attaching"),
			"unattaching" : Dict.val("common_ins_state_unattaching"),
			"stopping" : Dict.val("common_ins_state_stopping"),
			"starting" : Dict.val("common_ins_state_booting"),
			"restarting" : Dict.val("common_ins_state_restarting"),
			"resetting" : Dict.val("common_ins_state_restarting"),
			"error" : Dict.val("common_error"),
			"closed" : Dict.val("common_ins_state_close"),
			"backuping" : Dict.val("common_ins_state_create_snapshot"),
			"restoreing" : Dict.val("common_ins_state_resuming_snapshot"),
			"snapshotDeling" : Dict.val("common_ins_state_deleting_snapshot")
		};
		$(".mirrorType a").unbind("click").bind("click",function(){
			$(".osempty").hide();
			if($(this).hasClass("selected")){
				return
			}
			var mirrorType = $(this).attr("mirrorType");
			
			$(".mirrorType a").removeClass("selected");
			$(this).addClass("selected");
			if(mirrorType == "using"){
				$(".systemOs").hide();
				VM.queryOsList();
				VM._initSelected();
			}else if(mirrorType == "all"){
				$(".systemOs").show();
				VM.queryOsList();
				VM._initSelected();
			}else if(mirrorType=="identify"){
				$(".systemOs").hide();
				VM.getImageList();
			}
		});
		$(".osTypeSelect a").unbind("click").bind("click",function(){
			$(".osempty").hide();
			if($(this).hasClass("selected")){
				return
			}
			$(".osTypeSelect a").removeClass("selected");
			$(this).addClass("selected");
			VM.queryOsList();
			VM._initSelected();
		});
		$("#modifyFirewallModal").on('hide',function(){
			modifyFirewall._resetFromRow();
			window.currentInstanceType='vm';
		})
		if($("#modifyFirewallModal").attr("class").indexOf("in")==-1){
			
		}
		$("#openMore").click(function(){
			setTimeout(function(){
				if($("#learn-more-content").attr("class").indexOf("in")==-1){
					$("#openMore").empty().html(Dict.val("vm_expansion"));
				}
				else if($("#learn-more-content").attr("class").indexOf("in")!=-1){
					$("#openMore").empty().html(Dict.val("vm_collapse"));
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
		$("a#createVM").unbind().click(function() {
			VM.createVM();
		});
		$("a#openBatch").unbind().click(function(){
			BatchVM.openBatch();
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
				$.growlUI(Dict.val("common_tip"), Dict.val("vm_added_private_network_requests_submitted_successfully")); 
		    },function onError(msg){
		      ErrorMgr.showError(msg);
//		      $.growlUI(Dict.val("common_tip"), "查询可用私网发生错误：" + msg); 
		    });	
		});
		$("#unbindVMFromNet").unbind('click').bind('click', function(e) {
			var allCheckedBox = $("#tbody2 input[type='checkbox']:checked");		
			var vmId = $(allCheckedBox[0]).parents("tr").attr("instanceId");
			var routeId = $("#removeFromNetTable input[type='radio']:checked").val();
			VM.service.removeVM(parseInt(routeId),vmId,function onSuccess(data){	
				$.growlUI(Dict.val("common_tip"), Dict.val("vm_from_the_private_network")); 
		    },function onError(msg){
		      ErrorMgr.showError(msg);
//		      $.growlUI(Dict.val("common_tip"), "查询可用私网发生错误：" + msg); 
		    });	
		});	
		
		//根据资源池隐藏 灾备按钮
		var booleanPool =(-1!=VM.defPool.indexOf(CommonEnum.currentPool));
		if(!booleanPool){
			$(".disasterVM").attr("style","display:none");
		}
		var display=$("#net_public").css('display');
		if(display != 'none'){
			$("#net_private").hide();
		}
		//查询用户活动资格
//		VM.queryCustIdent();
//		Virus.init()
		//Sale.init()
	},
	
	queryCustIdent:function(){
		VM.service.queryCustIdent(function(data){
			//customerType:1个人2企业3大客户 ； identStatus:1待审2通过3驳回4缺资料； qualification:1未申请2申请
			//data.qualification = 2;
			//data.customerType = 3;
			VM.customerIdent = data;
			VM.customerIdent.authentication = false;
			if(VM.customerIdent.identStatus==2){
				VM.customerIdent.authentication = true;
			}
			Sale.init();
		})
	},
	_initSelected :function(){
		// 获取系统模板之后，可创建虚拟机
		VM.getTemplateList(function postInit(){	
			VM.getServiceOfferings(function(){
				$("a#createVM").unbind().click(VM.createVM);
				$("a#quickVM").unbind().click(VM.quickVM);				
				$(".create-another-server").unbind("click").bind('click',function() {
					VM.wizard.reset();
				});

				$(".im-done").unbind("click").bind('click',function() {
					VM.wizard.close();
				});
			});
		});	
		//VM.getImageList();
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
			var max = 50;
			VM.createCountInput = new com.skyform.component.RangeInputField(container, {
				min : 1,
				defaultValue : 1,
				max:max,
				textStyle : "width:137px"
			}).render();
			VM.createCountInput.reset();
		}

		VM.azSelect = new com.skyform.component.AZSelect("selectDiv","azDiv","vm");
		VM.azSelect.setSelectWidth(236);
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
		$(".subFee_before").bind('mouseup keyup',function(){
			setTimeout('VM.getFee_type()',5);
		});
		$("input[type='radio'][name='networkoption']").bind('mouseup',function(){
			setTimeout('VM.getFee()',5);
		});
		$("#agentId").focus(function(){
			$("#agentMsg").html("");
		});
		$("#useAgentBtn").unbind("click").bind("click", function() {
			//该方法在agentCommon.js里
			com.skyform.agentService.getAgentCouponFeeInfo("vm");
		});	
		
		$("#btnBackupSave").unbind("click"	).bind("click", function() {
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
			VM.getFee_type();
		});	
		$("#createDataDiskSize").bind("change",function(){
			$( "#dataDisk-range-min" ).slider( "option", "value", $("#createDataDiskSize").val());
		});
		$("#createDataDiskSize").bind("keydown",function(){
			$("#dataDiskMsg").empty().html("<span class='text-error'>"+Dict.val("vm_please_enter_multiple")+"</span>");			
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
		$("#createBandwidthSize").bind("change",function(){
			$( "#bandwidth-range-min" ).slider( "option", "value", $("#createBandwidthSize").val());
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
		//添加带宽
		// 带宽
		var min=ipJson.product.min,max=ipJson.product.max,step=ipJson.product.step,value=0;
		$( "#abandwidth-range-min" ).slider({
			range: "min",
			value: value,
			min: ipJson.product.min,
			max: 100,
			step: ipJson.product.step,
			slide: function( event, ui ) {
				$("#acreateBandwidthSize").val(ui.value);
			}
		});

		$("#acreateBandwidthSize").bind("blur",function(){
			var value = $("#abandwidth-range-min" ).slider("value");
			var newValue = $(this).val();
			if(/^[1-9]+[0-9]*$/.test(""+newValue) &&  parseInt(newValue)>= min && parseInt(newValue) <= max) {
				$("#abandwidth-range-min" ).slider("value",newValue);
			} else {
				$(this).val(value);
			}
			VM.getFee();
		});
		$( "#acreateBandwidthSize" ).val($( "#abandwidth-range-min" ).slider( "value"));
		$("#acreateBandwidthSize").bind("change",function(){
			$( "#abandwidth-range-min" ).slider( "option", "value", $("#acreateBandwidthSize").val());
			//$("#mabandwidth-range-min" ).slider("value",$("#acreateBandwidthSize").val());
		});
		$("#privateNetwork .icon-sort-up ").bind("click",function(){
			var newValue=Number($("#acreateBandwidthSize" ).val())+Number(1);
			$("#acreateBandwidthSize" ).val(newValue);
			$( "#abandwidth-range-min" ).slider( "option", "value", $("#acreateBandwidthSize").val());
			VM.getFee();
		});

		$("#privateNetwork .icon-sort-down ").bind("click",function(){
			if($("#acreateBandwidthSize" ).val()!=1){
				var newValue=Number($("#acreateBandwidthSize" ).val())-Number(1);
				$("#acreateBandwidthSize" ).val(newValue);
				$( "#abandwidth-range-min" ).slider( "option", "value", $("#acreateBandwidthSize").val());
				VM.getFee();
			}
		});

		//修改带宽


	},
	vncVM : function(){
		var vmInstance = VM.getInstanceInfoById(VM.selectedInstanceId);
		if(vmInstance && vmInstance.state=='running') {
			VM.service.getConsoleInfo(VM.selectedInstanceId,function(consoleInfo){
				var url=consoleInfo.url?consoleInfo.url:consoleInfo.data.console.url;
				if(url) {
					if(window.showModalDialog)
						window.showModalDialog(url,'',"dialogWidth=800px;dialogHeight=600px");
					else
						window.open(url,'',"width=800px;height=600");
				} else {
					ErrorMgr.showError(Dict.val("vm_unable_access_desktop_address"));
				}
			},function(error){
				ErrorMgr.showError(Dict.val("vm_inaccessible")+error);
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
	getFee_type : function(){
		if(CommonEnum.offLineBill)return;
		var period = VM.createPeriodInput.getValue();
		var param = vmJson.getVMFeeInstance_type();
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
		var _productId = 0;
		if(VM.selectedProductId){
			_productId = Number(VM.selectedProductId);
			
		}
		else _productId = Number(VM.getCheckedArr().parents("tr").attr("productid"));
		if(CommonEnum.offLineBill)return;
		//var period = VM.createPeriodInput.getValue();		
		var param = vmJson.getVMFeeInstance();
		param.productPropertyList[0].productId = _productId;
		param.productPropertyList[1].productId = _productId;
		param.productPropertyList[2].productId = _productId;
		param.period = 1;
		
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
				//网络配置
				var subnetContainer = $("#vm_privatenetwork");
				subnetContainer.empty();
				//$("<option value='-1'>-- 默认网络--" + "</option>").appendTo(subnetContainer);
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
							$("<option value=''>-- "+Dict.val("common_choose")+"--" + "</option>").appendTo(privatenetworkContainer);
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
				var css=$(".wizard-card [data-cardname='basicoptions']").css('display');
				/*if(css!='none'){
					$(".vm-tab[data-value='小型A']").click();
					//VM.getFee_type();
				}*/
				if(1 == from){					
					VM.querySG();
					$("#discount").empty();
					var osDes = $(".osList.selected span").text();					
					if((osDes.toLowerCase()).indexOf("win")!=-1){
						VM.isWin = true;
					}
					else VM.isWin = false;
					if(VM.isWin&&!CommonEnum.offLineBill){												
						$(".vm-tab").each(function(index,item){
							var text = $(item).attr("data-value");
							if($.inArray(text,VM.microType) != -1){
								$(item).hide();
							}
						});	
//						$(".cpu-options").each(function(index,item){
//							var text = $(item).attr("data-value");
//							if(text == microCpu){
//								$(item).hide();//							}
//						});
						if($(".vm-tab[data-value='小型A']").length > 0){
							if($(".vm-tab[data-value='小型A']:visible")){
								$(".vm-tab[data-value='小型A']").click();
							}
						}
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
						
						VM.getFee_type();
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
						VM.getFee_type();
					}
				}
				//无默认网络,取消新建带宽的查询				
//				if(2 == from){
//					com.skyform.service.Eip.queryEnoughIP(function(enough){
//						if(enough -  1 < 0) {
//							$("input[type='radio'][name='networkoption'][value='createNew']").attr("disabled","disabled");
//							$("#createNewMsg").empty().append("(互联网接入数量余额:" + enough+",无法创建)")
//						}
//					});
//					$("input[type='radio'][name='networkoption']:first").click();
//				}
				
				
				
				if(4 == to){
					clearPwdInfo();
//					暂时取消上限控制 --update by CQ 20150303
//					if(VM.groupTotal >= VM.groupQuota){
//						$("#createNewSG").hide();
//						$("#sgMsg").empty().append("您已经超过最大上限"+VM.groupQuota+"，不能再创建新的安全组，请选择已有安全组！（失败的安全组同样占用名额）");
//					}
//					else 
					if(VM.groupTotal == 0){
						$("#useExistedSG").hide();
						$("input[type='radio'][name='sgoption'][value='createNew']").attr("checked","checked").click();
					}
					$("input[type='radio'][name='sgoption']").unbind('click').click(function(){
						var value = $(this).val();
						$("div.sgoption").each(function(i,div){
							if(!$(div).hasClass("sg_" + value)) {
								$(div).attr("style", "display:none");
							} else {
								$(div).attr("style", "display:block");
							}					
						});	
						if("useExisted" == value){
							VM.renderSGTable(VM.sgInstances);
						}
					});	
					$("input[type='radio'][name='sgoption'][checked='checked']").click();	
					
				}
				if(2 == to){
					initsliderButton("createDataDiskSize","dataDisk-range-min",vdiskJson.product.max,vdiskJson.product.min,vdiskJson.product.step);
					//VM.getFee();
				}
				if(3 == to){

					com.skyform.service.vmService.queryFreeBasicNetworkIp({ "resourcePool":$("#pool").val() },function onSuccess(data) {
						$(data.data).each(function(index,item){
							if(item.totalIpCount<=item.usedIpCount){
								//禁止基础网络
							}else{
								//BasicNetworkIpsubscriptionId=item.subscriptionId;

								return false;
							}
						})
					},function onError(data) {
						//禁止基础网络
					});



					//initsliderButton("acreateBandwidthSize","abandwidth-range-min",100,ipJson.product.min,ipJson.product.step);
					if($("input[type='radio'][name='networkoption']:checked").val() == "createNew")
						$(".network_createNew").removeClass("hide");
					VM.getFee();
					initsliderButton("createBandwidthSize","bandwidth-range-min",ipJson.product.max,ipJson.product.min,ipJson.product.step);


				}

				//虚拟机配置信息
				
				if(to == 6){
					//clearPwdInfo();
					$("#agentDemo").attr("style","display:none");
					$("#agentDemo").find("span[name$='Msg']").html("");
					$("#configForm table span").text("");
					var firewallName = "";
					var sgoption = $("input[type='radio'][name='sgoption']:checked").val();
					if("useExisted" == sgoption) {
						firewallName = $("input[type='radio'][name='sgRadio']:checked").closest("tr").find("td:eq(1)").html();				
					} 
					else if("createNew" == sgoption){
						firewallName = $("#firewallName").val();				
					}
					var config = vmJson.getVM4JsonInstance();
					var obj = {	};
					obj.name = config.productList[0].instanceName;
					obj.period = config.period;
					obj.azZoneName = VM.azSelect.getAzSelectValueName();
					var payType = $("#billType .selected").attr("data-value");
					switch(payType){
						case "0" :obj.payType = Dict.val("common_monthly");break;
						case "3" :obj.payType = Dict.val("common_annual");break;
						case "5" :obj.payType = "VIP("+Dict.val("common_month")+")";break;
					}
					var mirrorType=$(".mirrorType .selected").attr("mirrorType");
					if(mirrorType=="using" || mirrorType=="all"){
						obj.os = $("#ostemplates .osList.selected span a").text();
						$(".os_").removeClass("hide");
						$(".image_").addClass("hide");
					}else if(mirrorType=="identify"){
						obj.image = $("#ostemplates .osList.selected span").text();
						$(".image_").removeClass("hide");
						$(".os_").addClass("hide");
					}
					obj.anquanzu = firewallName;
					obj.price = $(".feeInput_div span").eq(0).text();
					obj.cpu = config.productList[0].cpuNum;
					obj.mem = config.productList[0].memorySize;
					obj.diskSize = $("#createDataDiskSize").val();
					obj.osDiskSize = config.productList[0].osDisk;
					if($("#privateNetwork-tab").hasClass("active")){
						obj.basicNet = $("#acreateBandwidthSize").val();
						$(".net_").removeClass("hide");
						$(".prv_").addClass("hide");
					}else {
						obj.privateNet = $("#vm_privatenetwork option:selected").text();
						$(".net_").addClass("hide");
						$(".prv_").removeClass("hide");
					}
//					$(config.productList).each(function(i,item){
//						if(item.BAND_WIDTH){
//							obj.bandwidth = item.BAND_WIDTH;
//							if($("#vm_privatenetwork option:selected").attr("relStatus") != "9")
//								obj.router = "后台自动创建路由（15元/月）";
//						}
						
//					});
					if(payType == "3"){
						obj.period = Number(obj.period)/12;
						$("#configForm").find("span[name='period_text']").text(Dict.val("common_duration")+"（"+Dict.val("common_annual")+"）");
					}
					else
						$("#configForm").find("span[name='period_text']").text(Dict.val("common_duration")+"（"+Dict.val("common_monthly")+"）");
					$.each(obj,function(key,value){
						$("#configForm").find("span[name='" + key + "']").text(value);
					})
					$("#_jine").text(obj.price);

				}
			};
			VM.wizard.onToStep = function(from, to) {				
				if(0 == from){
					var min = $("div#ostemplates div.selected>span:first").attr("mindisk");
				}
				if(0 < from&&from<3){
					VM.getFee_type();
				}else{
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
		})
		VM.wizard.render(function(){
			/*if (VM._generateContent_tmp)
			{
				FireWallCfg.reset();
				FireWallCfg._generateContent = VM._generateContent_tmp;
			}*/
		FireWallCfg.init();
		});
		$("#privateNetwork-tab").click(function(){
			if(!$("#privateNetwork-tab").hasClass("active")){
				$("#basicNetwork-tab").removeClass("active");
				$("#privateNetwork-tab").addClass("active");
				$("#basicNetwork").hide();
				$("#privateNetwork").show();
				$("#basicNetwork").removeClass("active");
				$("#privateNetwork").addClass("active");
			}
			VM.getFee();
		});
		$("#basicNetwork-tab").click(function(){
			if(!$("#basicNetwork-tab").hasClass("active")){
				$("#privateNetwork-tab").removeClass("active");
				$("#basicNetwork-tab").addClass("active");
				$("#basicNetwork").show();
				$("#privateNetwork").hide();
				$("#basicNetwork").addClass("active");
				$("#privateNetwork").removeClass("active");
			}
			VM.getFee();
		});
	},
	quickVM : function(){
//		window.location = "/portal/jsp/maintain/vm4quick.jsp";
		var modalId = "quickVMModal";
		if(VM4quick.quickVMModal == null){
			VM4quick.quickVMModal = new com.skyform.component.Modal(
					modalId,
					Dict.val("vm_rapid_opening"),
					$("script#quick_vm_div").html(),
					{
						buttons : [
								{
									name : Dict.val("common_determine"),
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
//														$.growlUI(Dict.val("common_tip"), "创建申请提交成功, 请耐心等待开通服务..."); 
//														$("#"+modalId).modal("hide");
//														// refresh
//														VM.describleVM();									
//													},function onError(msg){
//														$.growlUI(Dict.val("common_tip"), "创建申请提交成功,扣款失败");
//														$("#"+modalId).modal("hide");
//													});				
//												},function onError(msg){
//													$.growlUI(Dict.val("common_tip"), "创建申请提交失败：" + msg);
//												});										
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
			VM.sgInstances = datas;
			VM.groupTotal = datas.length;
		})
	},
	renderSGTable:function(result){	
		var data = VM.querySGByState(result);
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
					 }else if(columnMetaData.name == "availableZoneName"){
						 text = columnData['availableZoneId'];
					 }
					 else if (columnMetaData.name == "state") {
						 if("bind error"==columnData.subServiceStatus||"using"== columnData.subServiceStatus){
							 columnData.subServiceStatus = "running";
						 }
						 text = com.skyform.service.StateService.getState("",columnData.subServiceStatus || columnData);
					 }
					 //vps
					/* else if("networkType" == columnMetaData.name){
						 if ( undefined == columnData.networkType || columnData.networkType == "0" ){
							 text="私有网络";
						 }else if (columnData.networkType =="1" ){
							 text="基础网络";
						 }
					 }*/
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
			if(item.subServiceStatus!=='opening'&&'create error'!=item.subServiceStatus&&item.subServiceStatus.indexOf('dele')==-1){
				result.push(item);
			}
		});
		//VM.groupTotal = result.length;
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
			$("#load_waiting_tbl").hide();
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
			$.growlUI(Dict.val("common_tip"), Dict.val("net_select_vm_error") + errorMsg);
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
				VM.queryOsList();
				VM.queryBwProductPrtyInfo(index);
				VM.queryVdiskProductPrtyInfo(index);
				VM.queryRouteProductPrtyInfo(index);
				VM._initSelected();				
				if(0 == index){
					$("#periodUnit").empty().html(Dict.val("common_month"));
				}
				else if(3 == index){
					$("#periodUnit").empty().html(Dict.val("common_year"));
				}
				else if(2 == index){
					$("#periodUnit").empty().html(Dict.val("common_day"));
				}
			});
			if (index == 0||index == 5) {
				cpu_option.click();
			}
		});
	},
//	创建虚拟机
	createVMPost : function(wizard) {
		var instance= vmJson.getVM4JsonInstance_new();
		var _fee = Number($(".price").html());
		var portalType = Dcp.biz.getCurrentPortalType();
		var agentId = $("#agentId").val();		
		
		if(agentId&&agentId.length>0){			
			var channel =  {
					  "period": 1,
					  "count": 1,
					  "agentCouponCode":"",
					  "serviceType":CommonEnum.serviceType["vm"],
				      "productList":[],
					  "availableZoneId":""
				};
			/*az*/
			com.skyform.service.vmService.queryAZAndAzQuota($("#pool option:selected").attr("value"),function(data){
				var zoneName = "";
				if(data.length>0){
					zoneName=data[0].availableZoneId;
					$.each(data,function(key,value){
						if(value.isQuotaExist==1){
							zoneName=value.availableZoneId;
						}
					});
				}
				channel.availableZoneId=zoneName;
			});
			channel.agentCouponCode = agentId;
			channel.period = instance.period;	
			$(instance.productList).each(function(i,item){
				var product = {		      	
					      "price": 0,
					      "productId": "",
					      "serviceType": "",
					      "productDesc": {}
					    }												
				product.productId = item.productId;
				product.productDesc.availableZoneId = instance.availableZoneId;
				/*az*/
				com.skyform.service.vmService.queryAZAndAzQuota($("#pool option:selected").attr("value"),function(data){
					var zoneName = "";
					if(data.length>0){
						zoneName=data[0].availableZoneId;
						$.each(data,function(key,value){
							if(value.isQuotaExist==1){
								zoneName=value.availableZoneId;
							}
						});
					}
					item.availableZoneId=zoneName;
				});
				if(item.cpuNum){	
					var vmFee = vmJson.getVMFeeInstance();
					var itemFee = com.skyform.service.channelService.getProductFee();
					itemFee.period = instance.period;	
					product.serviceType = CommonEnum.serviceType["vm"];					
					$(vmFee.productPropertyList).each(function(m,pp){
						if(m<4) {
							itemFee.productPropertyList.push(pp);								
							//delete itemFee.productPropertyList[i];
						}							
					})
					com.skyform.service.channelService.getItemFee(itemFee,function(data){
						product.price = data.fee/feeUnit;
					});
				}
				else if(item.storageSize){
					var vmFee = vmJson.getVMFeeInstance();
					var itemFee = com.skyform.service.channelService.getProductFee();
					itemFee.period = instance.period;	
					product.serviceType = CommonEnum.serviceType["vdisk"];
					$(vmFee.productPropertyList).each(function(n,pp){
						if("storageSize" == pp.muProperty){
							itemFee.productPropertyList[0] = pp;
						};
							
					});
					com.skyform.service.channelService.getItemFee(itemFee,function(data){
						product.price = data.fee/feeUnit;
					});
				}
				else if(item.BAND_WIDTH){
					var vmFee = vmJson.getVMFeeInstance();
					var itemFee = com.skyform.service.channelService.getProductFee();
					itemFee.period = instance.period;	
					product.serviceType = CommonEnum.serviceType["ip"];
					$(vmFee.productPropertyList).each(function(n,pp){
						if("BAND_WIDTH" == pp.muProperty){
							itemFee.productPropertyList[0] = pp;
						};
							
					});
					com.skyform.service.channelService.getItemFee(itemFee,function(data){
						product.price = data.fee/feeUnit;
					});
				}
				else if(item.ROUTER){
					var vmFee = vmJson.getVMFeeInstance();
					var itemFee = com.skyform.service.channelService.getProductFee();
					itemFee.period = instance.period;	
					product.serviceType = CommonEnum.serviceType["route"];
					$(vmFee.productPropertyList).each(function(n,pp){
						if("routerPrice" == pp.muProperty){
							itemFee.productPropertyList[0] = pp;
						};
							
					});
					com.skyform.service.channelService.getItemFee(itemFee,function(data){
						product.price = data.fee/feeUnit;
					});
				}
				
				product.productDesc = item;					
				channel.productList[i] = product;

			});


//			channel.productList[0].price = _fee;			
//			channel.productList[0].productId = instance.productList[0].productId;				
//			channel.productList[0].serviceType = CommonEnum.serviceType["vm"];
//			channel.productList[0].productDesc = instance.productList;
			
				
//			.cpuNum = instance.productList[0].cpuNum;
//			channel.productList[0].productDesc.memorySize = instance.productList[0].memorySize;
//			channel.productList[0].productDesc.OS = instance.productList[0].OS;
//			channel.productList[0].productDesc.osDiskSize = instance.productList[0].osDiskSize;
//			VM.ChannelService.wizardConfirmChannelSubmit(channel,VM.wizard, function onSuccess(data){
//				$.growlUI(Dict.val("common_tip"), "订单已提交，请等待审核通过后完成支付！您可以在用户中心->消费记录中查看该订单信息。");
//				wizard.markSubmitSuccess();
//				VM.describleVM();
//			},function onError(msg){
//				$.growlUI(Dict.val("common_tip"), "订单提交失败！");
//				wizard.markSubmitError();
//			});
			console.log(channel.availableZoneId+"111111");
			VM.ChannelService.channelSubmit(channel, function onCreated(data){
				//订单提交成功后校验用户余额是否不足
				var _tradeId = data.tradeId;	
				var disCountFee = data.fee;
				com.skyform.service.BillService.wizardConfirmTradeSubmit(disCountFee,_tradeId,VM.wizard, function onSuccess(data){				
					$.growlUI(Dict.val("common_tip"), Dict.val("common_application_submit"));
					wizard.markSubmitSuccess();
					VM.describleVM();
				},function onError(msg){
					$.growlUI(Dict.val("common_tip"), Dict.val("common_creating_application_submitted_successfully_debit_failure"));
					wizard.markSubmitError();
				});
				
//				com.skyform.service.BillService.tradeSubmit(_tradeId);				
			},function onError(msg){
				$.growlUI(Dict.val("common_tip"), Dict.val("lb_create_filing_error") + msg);
				wizard.markSubmitError();
			});
		}
		else {
			console.log(instance);
			VM.service.createInstance(instance, function onCreated(instance){
				//订单提交成功后校验用户余额是否不足
				var _tradeId = instance.tradeId?instance.tradeId:instance.data.tradeId;
				com.skyform.service.BillService.wizardConfirmTradeSubmit(_fee,_tradeId,VM.wizard, function onSuccess(data){				
					$.growlUI(Dict.val("common_tip"), Dict.val("common_application_submit"));
					wizard.markSubmitSuccess();
					VM.describleVM();
				},function onError(msg){
					$.growlUI(Dict.val("common_tip"), Dict.val("common_creating_application_submitted_successfully_debit_failure"));
					wizard.markSubmitError();
				});
				
//				com.skyform.service.BillService.tradeSubmit(_tradeId);				
			},function onError(msg){
				$.growlUI(Dict.val("common_tip"), Dict.val("lb_create_filing_error") + msg);
			});
		}
	},	
	
	
	
	queryProductPrtyInfo : function(index){		
		com.skyform.service.BillService.queryProductPrtyInfo(index,window.currentInstanceType,function(data){
			if( null != data){	
//				data = {"oslist":[{"osDiskSizeMin":20,"value":"5","desc":"CentOS6.3 64位"},{"osDiskSizeMin":20,"value":"1","desc":"CentOS6.4 64位"},{"osDiskSizeMin":20,"value":"6","desc":"CentOS6.5 64位"},{"osDiskSizeMin":50,"value":"2","desc":"Windows Server 2003 企业版 32位"},{"osDiskSizeMin":50,"value":"3","desc":"Windows Server 2008 R2 标准版 64位"},{"osDiskSizeMin":50,"value":"19","desc":"Windows Server 2008 R2 数据中心版 64位"},{"osDiskSizeMin":50,"value":"20","desc":"Windows Server 2012 R2 数据中心版 64位"},{"osDiskSizeMin":50,"value":"21","desc":"Windows Server 2012 R2 标准版 64位"},{"osDiskSizeMin":50,"value":"22","desc":"Ubuntu14.04 Server CN 64位"}],"vmConfig":[{"value":"1","memory":[{"value":"0.5","vmPrice":"1","discount":"","name":"其他配置","desc":"512M","osDisk":"50","productId":""},{"value":"1","vmPrice":"1","discount":"","name":"其他配置","desc":"1G","osDisk":"80","productId":""},{"value":"2","vmPrice":"1","discount":"","name":"其他配置","desc":"2G","osDisk":"80","productId":""},{"name":"其他配置","desc":"4G","value":"4","discount":"","productId":""}],"desc":"1核"},{"value":"2","memory":[{"name":"其他配置","desc":"1G","value":"1","discount":"","productId":""},{"value":"2","vmPrice":"1","discount":"","name":"其他配置","desc":"2G","osDisk":"150","productId":""},{"value":"4","vmPrice":"1","discount":"","name":"其他配置","desc":"4G","osDisk":"150","productId":""},{"name":"其他配置","desc":"8G","value":"8","discount":"","productId":""}],"desc":"2核"},{"value":"4","memory":[{"name":"其他配置","desc":"2G","value":"2","discount":"","productId":""},{"value":"4","vmPrice":"1","discount":"","name":"其他配置","desc":"4G","osDisk":"220","productId":""},{"value":"8","vmPrice":"1","discount":"","name":"其他配置","desc":"8G","osDisk":"220","productId":""},{"name":"其他配置","desc":"12G","value":"12","discount":"","productId":""},{"name":"其他配置","desc":"16G","value":"16","discount":"","productId":""}],"desc":"4核"},{"value":"8","memory":[{"name":"其他配置","desc":"4G","value":"4","discount":"","productId":""},{"value":"8","vmPrice":"1","discount":"","name":"其他配置","desc":"8G","osDisk":"330","productId":""},{"name":"其他配置","desc":"12G","value":"12","discount":"","productId":""},{"value":"16","vmPrice":"1","discount":"","name":"其他配置","desc":"16G","osDisk":"330","productId":""},{"name":"其他配置","desc":"24G","value":"24","discount":"","productId":""},{"name":"其他配置","desc":"32G","value":"32","discount":"","productId":""}],"desc":"8核"},{"value":"12","memory":[{"name":"其他配置","desc":"32G","value":"32","discount":"","productId":""}],"desc":"12核"}],"productId":201}
//				vmJson.oslist = data.oslist;
				//var newPool=["langfang","huhehaote"];
				var condition={};
				var rescourePoolName=$("#pool option:selected").attr("value");
				var billType=$("#billType .selected").attr("data-value");
				var mirrortype=$(".mirrorType .selected").attr("mirrorType");
				var portalType = Dcp.biz.getCurrentPortalType();
				var datas=null;
				condition.portalType=portalType;
				condition.osType="";
				if(mirrortype =="all"){
					var osType=$(".osTypeSelect .selected").attr("osType");
					condition.osType="";
					condition.mirrorType="2";
				}else if(mirrortype=="using"){
					condition.mirrorType="2";
				}
				vmJson.batchOSList = data.oslist;
				$.each(CommonEnum.NewPoolList,function(key,value){
					if(rescourePoolName==value){
						condition.rescourePoolName=rescourePoolName;
						condition.billType=billType;
						com.skyform.service.vmService.getOs(condition,function(data){
							if( null != data){	
								datas = data;
								vmJson.batchOSList = data;
							}		
						});
					}else{

					}
					
				});
			
				vmJson.vmConfig = data.vmConfig;
				vmJson.productId = data.productId;
				vm4quickJson.vmQuickConfig = data.vmQuickConfig;
			}		
		});
	},
	queryOsList:function(){		
		var condition={};
		var rescourePoolName=$("#pool option:selected").attr("value");
		var billType=$("#billType .selected").attr("data-value");
		var mirrortype=$(".mirrorType .selected").attr("mirrorType");
		var portalType = Dcp.biz.getCurrentPortalType();
		condition.portalType=portalType;
		condition.osType="common";
		if(mirrortype =="all"){
			var osType=$(".osTypeSelect .selected").attr("osType");
			condition.osType=osType;
			condition.mirrorType="2";
		}else if(mirrortype=="using"){
			condition.mirrorType="1";
		}
		condition.rescourePoolName=rescourePoolName;
		condition.billType=billType;
		com.skyform.service.vmService.getOs(condition,function(data){
			if( null != data){	
				vmJson.oslist = data;
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
				$("#createBandwidthSize").attr("step",data.brandWidth.step);
				$("#createBandwidthSize").attr("max",data.brandWidth.max);
				$("#createBandwidthSize").attr("min",data.brandWidth.min);				
			}
			$("#bwUnit").empty().html(ipJson.product.unit);
			$("#mbwUnit").empty().html(ipJson.product.unit);
			$("#abwUnit").empty().html(ipJson.product.unit);
		});
	},
	queryRouteProductPrtyInfo : function(index){
		com.skyform.service.BillService.queryProductPrtyInfo(index,"route",function(result){
			$.each(result,function(index,item){
				if(item.productname.indexOf("默认")!=-1)
					VM.routeProductId = item.productId;
				return false;
			});
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
				$("#createDataDiskSize").attr("step",vdiskJson.product.step);
				$("#createDataDiskSize").attr("max",vdiskJson.product.max);
				$("#createDataDiskSize").attr("min",vdiskJson.product.min);
			}
			$("#dataDiskUnit").empty().html(vdiskJson.product.unit);			
		});
	},	
	
	// 获取OS模板列表
	getTemplateList : function(postInit) {
			var active = "";
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
								template.click();
						}
					//}
				});
				if(postInit) {
					postInit();					
				}
			}		
	},
	// 获取镜像模板列表
	getImageList : function() {	
		var active = "";
		VM.service.listImagetemplates(function(templates){
			//templates = [{id:"1",mindisk:150,name:"win2008",ostypename:"win2008"}];
			$("#ostemplates").empty();
			if(null!=templates&&templates.length>0){
				$(templates).each(function(index,item){
						var text = Dict.val("dc_mirroring")+"："+item.imageName+"；"+Dict.val("common_vm")+"："+item.vmName+"；"+Dict.val("vm_system")+"："+item.osName;					
						var template = $("<div class='osList '>" + "  <span os='"+item.osName+"' value='" + item.osId + "' mindisk='"+item.osDisk+"' imageTemplateId='"+item.imageTemplateId+"' class='text-left'><a href='#'>" + text + "</a> </span>" + "  </p>" + "</div>");
						template.appendTo($("#ostemplates"));
						template.click(function(){							
							$("div.osList").removeClass("selected");
							$(this).addClass("selected");
							var osDes = $(".osList.selected span").text();
							var osDisk = $(".osList.selected span").attr("mindisk");
							$("#vm-diy #osDisk").empty().html(osDisk);							
						});
						if (index == 0) {
								template.trigger("click");
						}
				});
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
			$(".cpu-options:first").click();
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
		return VM.sortMemeory(memoryArr);
	},
	
	sortMemeory : function(memoryArr){
		var sort = [];
		if(memoryArr&&memoryArr.length>0){
			var s = [];
			$(memoryArr).each(function(i,item){
				s.push(item.memory);
			});
			s.sort(function sortNumber(a,b){return a-b});
			$(s).each(function(i,item){
				var value = s[i];
				$(memoryArr).each(function(j,item){
					if(item.memory == value){
						sort.push(item);
						return false;
					}
				});				
			});  
		} 
		return sort;
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
						        	   if(null!=columnData.uuid&&""!=columnData.uuid){
											text = '<a  href="monitor.jsp?code=monitor&vmId='+columnData.uuid+'&vmName='+encodeURI(encodeURI(columnData.instanceName))+'" >'+columnData.instanceName+'</a>'
											+VM.getWorkOrderUrl(columnData);
										}
										else 
						        	   
						        	   text = (columnData.instanceName.length>15?"<span title='"+columnData.instanceName+"'>"+columnData.instanceName.slice(0,15)+"..."+"</span>":columnData.instanceName)+VM.getWorkOrderUrl(columnData);
						        	   return text;
						           } else if ("state" == columnMetaData.name) {
//						        	   if(columnData.state == "coping")
//						        		   return "快照创建中";
//						        	   else if(columnData.state == "recovering")
//						        		   return "恢复中";
									   
						              return com.skyform.service.StateService.getState("vm",columnData.state||columnData);
						           }
									//vps
									/* else if("networkType" == columnMetaData.name){
										if ( columnData.networkType == 0 ){
											text="私有网络";
										}else if (columnData.networkType =="1" ){
											text="基础网络";
										}
										return text;
									}*/
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
						        		   if(columnData.cpu&&columnData.cpu.toString().length>0){
						        			   cpuNum = columnData.cpu;
						        		   }
						        		   if(columnData.os&&columnData.os.length>0){
							        			  os = columnData.os; 
							        		   }
						        		   if(columnData.mem&&columnData.mem.toString().length>0){
						        			  mem = columnData.mem; 
						        		   }if("bandwidth" == columnMetaData.name){
											  // var bandwidth=columnData.bandwidth;
										   }
										   var appendText = "CPU:"
													+ cpuNum + Dict.val("vm_he")+","+Dict.val("dc_ram")+":"
													+ mem + "G,"
													+ os
										   //vps
										   /*+",带宽:"+((columnData.bandwidth!=undefined) ? columnData.bandwidth : 0)+"M";*/
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
								tr.attr("isDR",true);
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
	getWorkOrderUrl:function(columnData){
		var ipurl ='';
		var ctx = $("#ctx").val();
		if(columnData.publicIp){
			ipurl += "&publicIP="+columnData.publicIp;
		}
		if(columnData.ip){
			ipurl += "&innerIP="+columnData.ip;
		}
		var url = "<a title='咨询建议' href='"+ctx+"/jsp/user/workOrder.jsp?code=workOrder&cataCode=service&instanceId="+columnData.id+"&serviceType=vm&instanceName="+encodeURIComponent(columnData.instanceName)+"" +
		"&instanceStatus="+columnData.state
		+"&currentPoolW="+encodeURIComponent(CommonEnum.pools[CommonEnum.currentPool])+ipurl+
		"'><i class='icon-comments' ></i></a>"
		return url;
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
					VM.selectedProductId = tr.attr("productid");
					VM.selectedInstanceDisk = tr.attr("disk");
					VM.selectedInstanceOsId = tr.attr("osId");
					VM.selectedInstanceOs = tr.attr("os");
					$("#moreAction").removeClass("disabled");
					document.oncontextmenu = function() {
						return false;
					}
					var screenHeight = $(document).height();
					var top = e.pageY;
					
					if (e.pageY >= screenHeight / 2) {
						top = e.pageY - $("#contextMenu").height();
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
		//灾备资源
		$("#drRelations").empty().append("<li class=\"detail-item\"><span>暂无灾备资源</span></li>");
		var tr;
		$("#tbody2 input[type='checkbox']").each(function(index,item) {
			var trTemp = $(item).parent("td").parent("tr");
			if($(trTemp).attr("id")==instanceInfo.id) {
				tr = trTemp;
				return false;
			}
		});
		var zoneName = instanceInfo.availableZoneName;
		if(zoneName=="az01.cell01.nanchang" || zoneName=="az01.cell01.tianjin"){
			$(tr).attr("isDR", true);
		}
		VM.service.disasterRecoveryInstances(instanceInfo.id,function(data){
			if(data && data.length>0) {
				$(tr).attr("isDR", true);
				VM.appendVmDRRelation(data, instanceInfo);
			} else {
				$(tr).attr("isDR", false);
			}
		},function(e){
		});
		$("div#details span.detail_value").each(function(i,item){
			var prop = $(this).attr("prop");
			$(this).html("" + instanceInfo[""+prop]);
		});
		var array = new Array();
		$("#vmRelations").html("");
		//查询详情
		VM.service.listRelatedInstances(instanceInfo.id,function(data){
			//data = data;
			VM.appendVmRelation(data,instanceInfo);
//			VM.service.listIriRelation(instanceInfo.id,function(data){
//				VM.appendVmRelation(data,instanceInfo);
//			},function(e){
//			});
		},function(e){
		});
		$("#opt_logs").empty();
		com.skyform.service.LogService.describeLogsUIInfo(instanceInfo.id);
	},
	appendVmDRRelation : function(array,instanceInfo) {
		var dom = "";
		$(array).each(function(index, item) {
			var str = "源资源";
			var id = item.resSubsId;
			var name = item.resSubsName;
			var pool = item.resPool;
			if(item.resSubsId == instanceInfo.id) {
				str = "目标资源";
				id = item.tagSubsId;
				name = item.tagSubsName;
				pool = item.tagPool;
			}
			dom += "<li class=\"detail-item\">"
				+"<span>"+str+"</span>&nbsp;&nbsp;&nbsp;&nbsp;"
				+"<span>"+id+"</span>&nbsp;&nbsp;&nbsp;&nbsp;"
				+"<span>" + name +"</span>&nbsp;&nbsp;&nbsp;&nbsp;"
				+"<span>"+CommonEnum.pools[pool]+"</span>"
				+"</li>";
		});
		if(dom){
			$("#drRelations").empty().append(dom);
		} else {
			$("#drRelations").empty().append("<li class=\"detail-item\"><span>暂无灾备资源</span></li>");
		}
	},
	appendVmRelation : function(array,instanceInfo) {
		var dom = "";
		var hasSg = false;
		$(array).each(function(i) {
			var ipaddress = "";
			var templateType = array[i].templateType;

			if(templateType==9){
				ipaddress = " ("+array[i].resId+")";
			}else if(templateType==19){
				ipaddress = array[i].ipaddress;
			}
			ipaddress = ipaddress.replace("null","");		
			
			var insState = com.skyform.service.StateService.getState(templateType,array[i].state);
			if(templateType==7){
				hasSg = true;
				VM.selectSGid = array[i].id;
				VM.selectSGName = array[i].instanceName;				
				if(9!=array[i].relaState){
					//亚信工作流不支持人为干预，由线下处理
					//insState = insState+"<a class='bindSecurity' value="+array[i].id+"> 重新绑定</a>";
					insState = insState+"<span class='text-error'> "+Dict.val("vm_unbound")+"</span>";				
				}
			}
			dom += "<li class=\"detail-item\">"
				+"<span>"+array[i].id+"</span>&nbsp;&nbsp;&nbsp;&nbsp;"
				+"<span>" + VM.switchType(array[i].templateType) +"</span>&nbsp;&nbsp;&nbsp;&nbsp;"
				+"<span>"+array[i].instanceName+"</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
				+"<span>"+ipaddress+"</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
				+"<span>"+insState+"</span>"
				+"</li>";
		});
		if(!hasSg){
			VM.selectSGid = 0;
			VM.selectSGName = "无安全组";
		}
		$("#vmRelations").empty().append(dom);
		$("#vmRelations").find("a.bindSecurity").unbind("click").click(function(){
			VM.service.bindSecurityGroupToVm($(this).attr("value"),instanceInfo.id,function (data){
				$.growlUI(Dict.val("common_tip"),data.msg);
			},function onUpdateFailed(errorMsg){
				$.growlUI(Dict.val("common_error"),data.msg);
			})
		}).css("cursor","pointer");
	},
	switchType : function(type) {
		switch(type){
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
			return Dict.val("nic_sg");
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
		case 14 :
			return "Paas";
		case 16 : 
			return Dict.val("nic_router");
		case 17 : 
			return Dict.val("vm_private_network");
		case 18 : 
			return Dict.val("vm_antivirus_security");
		case 19 : 
			return "NIC";
		default : 
			return Dict.val("common_unknown");
		}
	},
	bindEvent : function() {
		$("#SavePassword").unbind("click").bind('click', function() {
			VM.SavePassword();
		});
		$("#disasterRecovery").unbind("click").bind('click', function() {
			VM.disasterRecovery();
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
		//申请云主机选择设置密码方式
		$("#pwdType input").eq(0).attr("checked","checked");
		$("#psd").show();
		$("#sjmm").unbind("click").bind("click",function(){
			$("#pwdType input").removeAttr("checked");
			$("#pwdType input").eq(1).attr("checked","checked");
			$("#psd").hide();
		});
		$("#zdmm").unbind("click").bind("click",function(){
			$("#pwdType input").removeAttr("checked");
			$("#pwdType input").eq(0).attr("checked","checked");
			$("#psd").show();
		});
		//重置密码失去焦点事件
		$("#nPassword").bind("blur",function(){
		  VM._npasswordTip();
		});
		$("#confirmPassword").bind("blur",function(){
			VM._confirmPasswordTip();
		});
		//申请云主机密码输入框失去焦点事件
		$("#loginPassword").bind("blur",function(){
			loginPassword();
		});
		$("#passwordAgain").bind("blur",function(){
			passwordAgain();
		});
		//格式化云主机设置登录方式
		$("#setPwd input").eq(0).attr("checked","checked");
		$("#pwd").show();
		$("#suiji").unbind("click").bind("click",function(){
			$("#setPwd input").removeAttr("checked");
			$("#setPwd input").eq(1).attr("checked","checked");
			$("#pwd").hide();
		});
		$("#zhiding").unbind("click").bind("click",function(){
			$("#setPwd input").removeAttr("checked");
			$("#setPwd input").eq(0).attr("checked","checked");
			$("#pwd").show();
		});
		//格式化云主机失去焦点事件
		$("#_loginPassword").bind("blur",function(){
			VM._loginPassword();
		});
		$("#_passwordAgain").bind("blur",function(){
			VM._passwordAgain();
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
		$(".operation").addClass("disabled");
		
		var allCheckedBox = $("#tbody2 input[type='checkbox']:checked");
		
		var oneSelected = allCheckedBox.length == 1;
		var hasSelected = allCheckedBox.length > 0;
		var state = $(allCheckedBox[0]).parents("tr").attr("state");
		var os = $(allCheckedBox[0]).parents("tr").attr("os");
		var jobState = $(allCheckedBox[0]).parents("tr").attr("jobState");
		var isDR  = $(allCheckedBox[0]).parents("tr").attr("isDR")=="true" ? true : false;
		var allInstanceHasTheSameState = true;
		var allInstanceStateCanBeDestroy = true;
		
		if(allCheckedBox.length>1) {
			isDR = false;
		}
		
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
			VM.selectedInstanceId = ""+selectInstance.id;
			VM.selectedProductId = selectInstance.productid;
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
					VM.selectedProductId = currentCheckBox.parents("tr").attr("productid");
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
			} else if ("destroyVM" == action) {
				VM.destroyVM(); // 销毁
			} else if ("cfgFirewall" == action){
				VM.cfgFirewall();
			} else if ("vncVM" == action) {
				VM.vncVM();
			} else if ("renew" == action) {
				VM.renew();
			}else if ("renewVM_" == action) {
				VM.renew();
			}else if ("disasterVM" == action) {
				VM.disasterVM();//灾备
			}else if ("securityVM" == action) {
				VM.securityVM();//主机安全
			}else if ("backup" == action) {
				VM.backup();
			} else if ("queryBackup" == action) {
				VM.queryBackup();
			} else if ("msnap" == action) {
				msnap();
			} else if ("addVM2net" == action) {
				VM.queryPrivateNets();
			} else if("deleteVMFromNet" == action){
				VM.queryBindPrivateNets();
			}else if("ResetPassword" == action){
				VM.ResetPassword();
			}else if("export" == action){
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
			}else if ("bandwidthVM" == action){
				VM.bandwidthVM();
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
				$.growlUI(Dict.val("common_tip"), Dict.val("ebs_query_error")+"：" + data.msg); 
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
					Dict.val("vm_modify_vm_pro"),
					'<div class="modal-body"> <form  class=\"form-horizontal\"> '
					        + '<fieldset>'
						        + '<div class=\"control-group\">'
							        + '<label class=\"control-label\" for=\"input01\">'+Dict.val("common_name")+':</label>'
									+ '<div class=\"controls\"><input type=\"text\" name=\"instance_name\" id=\"updateName\" onblur=\"VM.test()\" value='+VM.instanceName+' maxlength=\"32\"><font color=\'red\'>*</font>(必填项)<br>'
									+ '</div>'
								+ '</div>'
								//+ '<font size="4">描述:</font><textarea cols="15" rows="2" id="updateComment"></textarea><br> 
							+ '</fieldset>'
					 + '</form></div>',
					{
						buttons : [
								{
									name : Dict.val("common_determine"),
									onClick : function() {
										var value = $("#updateName")[0].value;
										if (value == null || value == "") {
											alert(Dict.val("vm_pelase_enter_modify_name"));
											return;
										}
//										var updateComment= $("#updateComment")[0].value;										
										if(oldInstanceName != value){
											com.skyform.service.PortalInstanceService.querySameNameExist(window.currentInstanceType,value,function(isExist){
												if(!isExist){
													VM.service.updateNameAndDescription(VM.selectedInstanceId,$("#updateName")[0].value,null,function onUpdateSuccess(result){
														VM.modifyVMNameModal.hide();
														$.growlUI(Dict.val("common_tip"),Dict.val("common_modify_success"));
														VM.describleVM();
													},function onUpdateFailed(errorMsg){
														VM.modifyVMNameModal.hide();
														$.growlUI(Dict.val("common_error"),Dict.val("common_modify_filed") + errorMsg);
													});
												}
												else {
													$.growlUI(Dict.val("common_tip"),Dict.val("common_name_used_re_enter"));
												}
											});	
										}
										else {
											VM.service.updateNameAndDescription(VM.selectedInstanceId,$("#updateName")[0].value,null,function onUpdateSuccess(result){
												VM.modifyVMNameModal.hide();
												$.growlUI(Dict.val("common_tip"),Dict.val("common_modify_success"));
												VM.describleVM();
											},function onUpdateFailed(errorMsg){
												VM.modifyVMNameModal.hide();
												$.growlUI(Dict.val("common_error"),Dict.val("common_modify_filed") + errorMsg);
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
		var checkedArr = $("#tbody2 tbody input[type='checkbox']:checked");
		if(checkedArr.length == 0){
			checkedArr = VM.lastCheckedArr;
		}
		else VM.lastCheckedArr = checkedArr;
		return checkedArr;
		
		return $("#tbody2 tbody input[type='checkbox']:checked");
	},
	
	changeVMOs : function() {
		if (VM.changeVMOsModal == null) {
			var _id=new Date().getTime();
			VM.changeVMOsModal = new com.skyform.component.Modal(
					""+_id,
					Dict.val("vm_rest_operating_system"),
					$("script#change_vm_os").html(),
					{
						buttons : [
								{
									name : Dict.val("common_determine"),
									onClick : function() {
										
										var count = $("#vm_oslist").find("input[type='radio']:checked").length;
										if(count == 0){
											$("#errorOsMsg").text(Dict.val("vm_please_select_reset"));
											return
										}
										var idisk = parseInt(VM.selectedInstanceDisk);
										var odisk = parseInt(VM.selectedOsDisk);
										if(idisk < odisk){
											$("#errorOsMsg").text(Dict.val("vm_selected_system_disk_operating"));
											return
										}
										var changeos = {
												"id":VM.selectedInstanceId,
												"os":VM.selectedOsId
										};
										VM.service.changeVMOs(changeos,function(){
											VM.changeVMOsModal.hide();
											$.growlUI(Dict.val("common_tip"),"主机格式化成功");
											VM.describleVM();
										},function(errorMsg){
											$.growlUI(Dict.val("common_error"),Dict.val("vm_reset_error") + errorMsg);
											VM.changeVMOsModal.hide();
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
										$.growlUI(Dict.val("common_error"),Dict.val("common_modify_filed") + errorMsg);
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
					Dict.val("vm_change_configuration"),
					$("script#upgradeCfg").html(),
					{
						buttons : [
								{
									name : Dict.val("common_determine"),
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
											//$("#myModal006change #errorMsg").addClass("icon-exclamation-sign text-error");
											//$("#myModal006change #errorMsg").empty().html("&nbsp;"+Dict.val("vm_configuration_changes"))
											//return;
										}
										com.skyform.service.PortalInstanceService.modprodprty("serviceroffering",instanceId,muprty,function(result){
											//订单提交成功后校验用户余额是否不足
											var _tradeId = result[0].tradeId;
											//{"msg":"","data":[{"feeValue":99520,"tradeId":"1409190068221003"}],"code":0}
											var _fee = result[0].feeValue/1000;
											var _modal = $("#"+_id);
											com.skyform.service.BillService.confirmTradeSubmit(_fee,_tradeId,_modal,function onSuccess(data){
												$.growlUI(Dict.val("common_tip"), Dict.val("common_success_operation")); 
//												$("#createModal").modal("hide");
												VM.modifyVMConfigurationModal.hide();
												// refresh
												VM.describleVM();							
											},function onError(msg){
												$.growlUI(Dict.val("common_tip"), Dict.val("common_creating_application_submitted_successfully_debit_failure"));
//												$("#createModal").modal("hide");
												VM.modifyVMConfigurationModal.hide();
											});				
										},function(error){
											VM.modifyVMConfigurationModal.hide();
											ErrorMgr.showError(Dict.val("vm_operation_error") + error);
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
										VM.modifyVMConfigurationModal.hide();
									}
								} ],
								beforeShow : function(){
									VM.selectedProductId = VM.getCheckedArr().parents("tr").attr("productid");	
									var osDes = VM.getCheckedArr().parents("tr").attr("os");		
									if(!VM.isWin){
										if((osDes.toLowerCase()).indexOf("win")!=-1){
											VM.isWin = true;
										}
										else VM.isWin = false;
									}									
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
		var confirmModal = null;
		if(VM.selectedInstanceId>0&&VM.selectedInstanceOs.length>0){
			Dcp.biz.apiAsyncRequest("/snapshot/searchSnap", {"vmid":VM.selectedInstanceId}, function(data) {	
			if (data.code != "0") {
				$.growlUI(Dict.val("common_tip"), Dict.val("img_select_snapshot_fail") + data.msg); 
			} else {
				data.snaps = data.snaps?data.snaps:data.data;
				confirmModal =  new com.skyform.component.Modal(
							new Date().getTime(),
							//Dict.val("common_reset_operating_system"),
							"格式化云主机",
							"<h4>"+"当前操作系统："+VM.selectedInstanceOs+ "</h4><span id='snapCount' style='color:red;font-size:13px;'></span><h6 style='font:12px normal;padding-top:15px'><i class='icon-info-sign' style='font-size: 14px'></i>&nbsp;&nbsp;"+"格式化操作后，云主机会自动开机，数据和快照将全部丢失，是否继续？"+"</h6>",
							{
								buttons : [
										{
											name : Dict.val("common_determine"),
											onClick : function() {

												confirmModal.hide();
												$("#setLoginTypeDiv").off("shown").on("shown",function(){
												$("#_loginPassword").val("");
												$("#_passwordAgain").val("");
												$("#tipName_loginPassword").html("");
												$("#tipName_passwordAgain").html("");
												});
												$("#setLoginTypeDiv").modal("show");
												$("#submitPassword").unbind("click").bind("click",function(){
													VM._loginPassword();
													VM._passwordAgain();
													var condition = VM._condition;
													if(!condition.flag) return;
													VM.service.changeVMOs(condition,function(result){
														//console.log(condition);
														$.growlUI(Dict.val("common_tip"),"主机格式化成功");
														VM.describleVM();
													},function onError(errorMsg){
														ErrorMgr.showError(Dict.val("vm_reset_error") + errorMsg);
													});
													$("#setLoginTypeDiv").modal("hide");
												})
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
										} ],
										afterShow : function(){
											if(data.snaps){
												if(data.snaps.length > 0){
													var ss = [];
													$(data.snaps).each(function(i,item){
														if('deleted' != item.status){
															ss.push(item);
														}
													});
													/*if(ss.length>0){
														$("#snapCount").empty().html("此云主机下有"+data.snaps.length+"条快照，本操作将使这些快照失效，请确定？");
													}*/
												}
											}else{
												$("#snapCount").hide();
											}
										}
							});
					}
					confirmModal.autoAlign();
					confirmModal.show();
				},function onError(){
					$.growlUI(Dict.val("common_tip"), Dict.val("img_select_snapshot_fail"));
				});					
			}else{
				confirmModal = new com.skyform.component.Modal(
						new Date().getTime(),
						Dict.val("common_reset_operating_system"),
						"<h4 class='text-error'>"+Dict.val("vm_operating_system_parameters_incorrect")+" </h4>",
						{
							buttons : [ {
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
				confirmModal.autoAlign();
				confirmModal.show();
			}			
		},
	showRadomPassword:function(){
		var condition = {
				"subsId":parseInt(VM.selectedInstanceId)
				//"subscriptionId":parseInt(VM.selectedInstanceId)
		};
		VM.service.getVmRandomPassword(condition,function(result){
			//var newPassword=result[0].vncPassword?result[0].vncPassword:result.password;
			var newPassword=result.password||result[0].vncPassword;
			var confirmModal = new com.skyform.component.Modal(
					new Date().getTime(),
					//Dict.val("vm_random_password"),
					"查看密码",
					//"<h4>当前虚机的初始密码为："+result[0].vncPassword+ "</h4><br><h5>注：此密码为虚拟机创建时初始化密码，若您已重置过系统密码或者在系统中修改密码，则此密码失效，请重置您的系统密码</h5>",
					"<h4>"+"当前虚拟机的管理员密码为："+newPassword+ "</h4><br><h5>"+"注：此密码为最后一次在控制台更改后的云主机密码，若您在系统中修改密码，则此密码失效"+"</h5>",
					{
						buttons : [
								{
									name : Dict.val("common_determine"),
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
			ErrorMgr.showError(Dict.val("vm_discover_random_password_failed") + errorMsg);
		});
		
	},
	destroyVM : function(id) {
		var confirmModal = new com.skyform.component.Modal(
				new Date().getTime(),
				Dict.val("vm_destory_vm"),
				"<h4>"+Dict.val("vm_destory_vm")+"</h4>",
				{
					buttons : [
							{
								name : Dict.val("common_determine"),
								onClick : function() {
									confirmModal.hide();
									VM.service.destroyVM(VM.selectedInstanceId,function(result){
										$.growlUI(Dict.val("common_tip"), Dict.val("common_success_operation"));
										com.skyform.service.modifyStatus.modifyAllStatus(VM.selectedInstanceId,"deleting",VM.instances,function(){
									    	VM.renderDataTable(VM.instances);
									    });
										
									},function onError(errorMsg){
										ErrorMgr.showError(Dict.val("vm_destory_vm_fails") + errorMsg);
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
	closeVM : function(id) {
		var confirmModal = new com.skyform.component.Modal(
				new Date().getTime(), Dict.val("vm_close_cloud_hosting"), "<h4>"+Dict.val("vm_do_you_shutDict")+"</h4>", {
					buttons : [
							{
								name : Dict.val("common_determine"),
								onClick : function() {
									VM.service.stopVms(VM.selectedInstanceId,function(result){
										$.growlUI(Dict.val("common_tip"), Dict.val("common_success_operation"));
										confirmModal.hide();
										com.skyform.service.modifyStatus.modifyAllStatus(VM.selectedInstanceId,"stopping",VM.instances,function(){
									    	VM.renderDataTable(VM.instances);
									    });
									},function onError(errorMsg){
										confirmModal.hide();
										$.growlUI(Dict.val("common_error"),Dict.val("vm_shutdown_failure") + errorMsg);
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
	openVM : function(id) {
		var confirmModal = new com.skyform.component.Modal(
				new Date().getTime(), Dict.val("vm_open_vm"), "<h4>"+Dict.val("vm_do_you_open_vm")+"</h4>", {
					buttons : [
							{
								name : Dict.val("common_determine"),
								onClick : function() {
									VM.service.startVms(VM.selectedInstanceId,function onStarted(result){
										confirmModal.hide();
										$.growlUI(Dict.val("common_tip"), Dict.val("common_success_operation"));
										//刷新开启云主机缓存
										com.skyform.service.modifyStatus.modifyAllStatus(VM.selectedInstanceId,"starting",VM.instances,function(){
									    	VM.renderDataTable(VM.instances);
									    });
									},function onFailedToStart(errorMsg){
										confirmModal.hide();
										ErrorMgr.showError(Dict.val("vm_start_fails")+errorMsg);
									})
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
	reopenVM : function(id) {
		var confirmModal = new com.skyform.component.Modal(
				new Date().getTime(), Dict.val("vm_restart_cloud_hosting"), "<h4>"+Dict.val("vm_do_you_restart")+"</h4>", {
					buttons : [
							{
								name : Dict.val("common_determine"),
								onClick : function() {
									VM.service.restartVms(VM.selectedInstanceId,function onRestarted(result){
										confirmModal.hide();
										$.growlUI(Dict.val("common_tip"), Dict.val("common_success_operation"));
										com.skyform.service.modifyStatus.modifyAllStatus(VM.selectedInstanceId,"resetting",VM.instances,function(){
									    	VM.renderDataTable(VM.instances);
									    });
										//VM.describleVM();
									},function onRestartFailed(errorMsg){
										confirmModal.hide();
										ErrorMgr.showError(Dict.val("vm_restart_failed")+errorMsg);
									})
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
	//修改主机带宽
	bandwidthVM : function() {
		//$('#createDataDiskSize').val('1');
		if(!VM.createModal){
			VM.createModal = new com.skyform.component.Modal(
				"id_bandwidth",
				"<h3>"+"更改主机带宽"+"</h3>",
				$("script#changeBandWidth").html(),{
					buttons : [
						{
							name : "确定",
							onClick : function() {
								var limitRate=$("#mabandwidth-range-min" ).slider("value");
								VM.service.bandwidthChange(nicId,limitRate,function(data){

								});
								VM.changewidt();
								VM.createModal.hide();
							},
							attrs : [ {
								name : 'class',
								value : 'btn btn-primary'
							} ]
						}, {
							name :"取消",
							attrs : [ {
								name : 'class',
								value : 'btn'
							} ],
							onClick : function() {
								VM.createModal.hide();
							}
						} ],
					afterShow : function(){
						//修改带宽
						var min=ipJson.product.min,max=ipJson.product.max,step=ipJson.product.step,value=0;
						$( "#mabandwidth-range-min" ).slider({
							range: "min",
							value: value,
							min: ipJson.product.min,
							max: 100,
							step: ipJson.product.step,
							slide: function( event, ui ) {
								$("#macreateBandwidthSize").val(ui.value);
							}
						});
						$("#macreateBandwidthSize").bind("blur",function(){
							var value = $("#mabandwidth-range-min" ).slider("value");
							var newValue = $(this).val();
							if(/^[1-9]+[0-9]*$/.test(""+newValue) &&  parseInt(newValue)>= min && parseInt(newValue) <= max) {
								$("#mabandwidth-range-min" ).slider("value",newValue);
							} else {
								$(this).val(value);
							}

						});
						$("#macreateBandwidthSize").bind("blur",function(){
							$( "#mabandwidth-range-min" ).slider( "option", "value", $("#macreateBandwidthSize").val());
						});
						$( "#macreateBandwidthSize" ).val($( "#mabandwidth-range-min" ).slider( "value"));

						var allCheckedBox = $("#tbody2 input[type='checkbox']:checked");
						var subId= Number($(allCheckedBox[0]).parents("tr").attr("id"));
						var bandwidth_rx="";
						VM.service.bandwidthCreat(subId,function(data){
							bandwidth_rx=Number(data.bandwidth_rx);
							nicId=data.nicId;
						});
						$("#macreateBandwidthSize").val(bandwidth_rx);
						$("#mabandwidth-range-min" ).slider("value",bandwidth_rx);


						$("#oldBandWidth").html(bandwidth_rx);
						VM.changewidt();

					},
					beforeShow : function(){
						$("#mabandwidth-range-min").click(function(){
							VM.changewidt();
						});
						$("#mabandwidth-range-min a").click(function(){
							VM.changewidt();
						});
					}
				});

		}
		VM.createModal.setWidth(1200).autoAlign().setTop(60).show();
	},
	changewidt : function(){
		var productId = 0;
		if (VM.selectedProductId) {
			productId = Number(VM.selectedProductId);

		} else
			productId = VM.getCheckedArr().parents("tr").attr("productId");

		//var limitRate1=$("#mabandwidth-range-min" ).slider("value");
		var param = {
			"period" : 1,
			"productPropertyList" : [ {
				"muProperty" : "BAND_WIDTH",
				"muPropertyValue" : $("#macreateBandwidthSize" ).val()+'',
				"productId" : 5001
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
	test : function() {
		var value = $("#updateName")[0].value;
//		var commentvalue = $("#updateComment")[0].value;
		if (value == null || value == "") {
			alert(Dict.val("vm_pelase_enter_modify_name"));
		}
		if (value.length > 32) {
			alert(Dict.val("nas_length_not_exceed_16_characters"));
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
				$.growlUI(Dict.val("common_tip"), Dict.val("vm_virtual_hard_disk_backup_success"));
				$("#updateData").click();
			} else {
				$.growlUI(Dict.val("common_tip"), data.msg);
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
				$.growlUI(Dict.val("common_tip"), data.msg);
			}
		});
	},
	// 虚拟硬盘快照恢复
	recoverySnapshot : function(volumeId, userSnapshotId) {
		var container = $("#snapshotModal");
		$(".userSnapshotlistBody", container).addClass("hide");
		$(".userSnapshotlistFooter", container).addClass("hide");
		$(".deleteOrRecoveryUserSnapshotBody", container).find("h4").html(
				Dict.val("vm_do_you_recover_snap_success"));
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
									$.growlUI(Dict.val("common_tip"), Dict.val("vm_recover_snap_success"));
									$("#snapshotModal").modal("hide");
									$("#updateData").click();
								} else {
									$.growlUI(Dict.val("common_tip"), data.msg);
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
		$(".deleteOrRecoveryUserSnapshotBody", container).find("h4").html(Dict.val("vm_do_you_delete_snap_success"));
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
									$.growlUI(Dict.val("common_tip"), Dict.val("vm_delete_sanp_success"));
									$("#snapshotModal").modal("hide");
									$("#updateData").click();
								} else {
									$.growlUI(Dict.val("common_tip"), data.msg);
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
		//VM.refreshFirewall(vmId);
		var params = {
				"vmId" : parseInt(vmId)
		};
		var firewallId = "";
		Dcp.biz.apiRequest("/instance/firewall/qrySecurityGroupRules", params, function(data){
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
				$.growlUI(Dict.val("common_vm"), Dict.val("vm_queries_related_resource_error") + data.msg); 
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
		$("#securityNameShow").text("");
		$("#securityNameShow").text("("+VM.selectSGName+")");
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
								name : Dict.val("common_determine"),
								onClick : function(){
									var period = VM.renewModal.getPeriod().getValue();
									$("#renewModal").modal("hide");	
									var _modal = $("#renewModal");
									com.skyform.service.renewService.renew(VM.getCheckedArr().parents("tr").attr("instanceId"),period,function onSuccess(data){
										//订单提交成功后校验用户余额是否不足
										var _tradeId = data.tradeId;
										var _fee = $("#feeInput_renew").text();
										com.skyform.service.BillService.confirmTradeSubmit(_fee,_tradeId,_modal,function onSuccess(data){
											$.growlUI(Dict.val("common_tip"), Dict.val("common_renewal_successful_debit_successful_please_wait")); 
											// refresh
//											VM.updateDataTable();									
										},function onError(msg){
											$.growlUI(Dict.val("common_tip"), Dict.val("common_renewal_successful_failed_charge"));
										});								
									},function onError(msg){
										$.growlUI(Dict.val("common_tip"), Dict.val("common_renew_submit_failed") + msg); 
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
								name : Dict.val("common_cancel"),
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
//				$.growlUI(Dict.val("common_tip"), "没有！"); 
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
//			$.growlUI(Dict.val("common_tip"), "查询可用备份发生错误：" + msg); 
//		});
		
	},
	renderBackupDataTable : function(data) {
		 VM.backupDataTable.renderByData("#backupTable", {
				"data" : data,
				"pageSize": 5,
				"columnDefs" : [
				     {title : "<input type='checkbox' id='checkAll'>", name : "id"},
				     {title : Dict.val("common_copy_name"), name : "vmInstanceInfoName"},
				     {title : Dict.val("obs_type"), name : "type"},
				     {title : Dict.val("common_create_time"), name : "createDate"},
				     {title : Dict.val("vdisk_backup_size")+"(GB)", name : "backupSize"}
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
//	      $.growlUI(Dict.val("common_tip"), "查询可用私网发生错误：" + msg); 
	    });	
	},
	renderAdd2NetTable : function(data) {
//		{"msg":"success","data":[{"expireDate":1391914952000,"id":67837058,"ipSegments":"192.168.1.2-192.168.1.254","name":"tttt_67837058","routeName":"route2_67827015","ipGateway":"192.168.1.1","state":"using","createDate":1410925486000}],"code":0}
		 VM.add2NetTable.renderByData("#add2netTable", {
				"data" : data,
				"pageSize": 5,
				"columnDefs" : [
				     {title : "", name : "id"},
				     {title : Dict.val("vm_private_name"), name : "name"},
				     {title : Dict.val("net_gateway"), name : "ipGateway"}
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
//	      $.growlUI(Dict.val("common_tip"), "查询可用私网发生错误：" + msg); 
	    });	
	},
	
	ResetPassword : function(){
		$("#nPassword").val("");
		$("#confirmPassword").val("");
		$("#tipName_nPassword").html("");
		$("#tipName_confirmPassword").html("");
		var row = VM.datatable.getContainer().find("tbody").find("input[type='checkbox']:checked").closest('tr');
		$("#resetPassword").modal("show");
		$("#subscriptionId").val(row.attr("id"));
		$("#uuid").val(row.attr("uuid"));
		$("#act").val(row.attr("act"));
			
	},

	//灾备model框
	disasterVM : function(){
		var row = VM.datatable.getContainer().find("tbody").find("input[type='checkbox']:checked").closest('tr');
		$("#zbVM").modal("show");
		//$("#subscriptionId").val(row.attr("id"));
		$("#targetPool").empty();
		var resourcePool = $("#pool").val().trim();
		VM.service.getDRPool(resourcePool,function(data){
			for ( var i = 0; i < data.length; i++) {
				$("#targetPool").append(
						"<option value='" + data[i].id
								+ "'>"
								+ CommonEnum.pools[data[i].name]
								+ "</option>");
			}
		});
		var targetPool=$("#targetPool").val();
		VM.service.queryAZAndAzQuota(targetPool,function(data){
			$("#targetAzone").empty();
			if(data.length==0){
				$("#Azone").hide();
			}else{
				$("#Azone").show();
			}
			for ( var i = 0; i < data.length; i++) {
				var zoneName = data[i].availableZoneName;
				if(zoneName=="az01.cell01.nanchang" || zoneName=="az01.cell01.tianjin"){
					$("#targetAzone").append("<option value='" + data[i].availableZoneId+"' disabled='disabled'>" + data[i].availableZoneName + "</option>");
				} else {
					$("#targetAzone").append("<option value='" + data[i].availableZoneId+"'>" + data[i].availableZoneName + "</option>");
				}
			}
		});
		$("#targetPool").change(function(data){
			$("#targetAzone").empty();
			var Pool=$("#targetPool").val();
			VM.service.queryAZAndAzQuota(Pool,function(data){
				if(data.length==0){
					$("#Azone").hide();
				}else{
					$("#Azone").show();
				}
				/**
				 * {
					  "code": 0,
					  "msg": "查询AZ及配额成功！",
					  "data": [
					    {
					      "isQuotaExist": 0,
					      "id": 2,
					      "createTime": 1463367291000,
					      "availableZoneId": "42da73aa-bb5b-4603-bec3-7dddf2870304",
					      "status": "1",
					      "availableZoneName": "az01.test.langfang",
					      "resourcePool": "langfang2"
					    }
					  ]
					}
				 */
				for ( var i = 0; i < data.length; i++) {
					$("#targetAzone").append(
							"<option value='" + data[i].availableZoneId
									+ "'>"
									+ data[i].availableZoneName
									+ "</option>");
				}
			});
		});

		$("#at").val(row.attr("act"));
			
	},

	//开始灾备
	disasterRecovery : function(){
		var row = VM.datatable.getContainer().find("tbody").find("input[type='checkbox']:checked").closest('tr');
		//$("#subscriptionId").val(row.attr("id"));
		//$("#uuid").val(row.attr("uuid"));
		var subscriptionId = row.attr("id");
		var targetPool = $("#targetPool").val();
		var availableZoneId = $("#targetAzone").val();
		var resourcePool = $("#pool").val();
		VM.service.disasterRecoveryVm(subscriptionId,targetPool,resourcePool,availableZoneId,function(result){
			$("#zbVM").modal("hide");
			$.growlUI(Dict.val("common_tip"), Dict.val("vm_backup_success"));
		}, function(error) {
			$("#zbVM").modal("hide");
			$.growlUI(Dict.val("common_tip"), Dict.val("vm_backup_fali"));
		});
			
	},
	
	securityVM:function(){
		    var bflag=true;
		    var vmId=parseInt(VM.getCheckedArr().parents("tr").attr("instanceId"));
			if (VM.securityVMModal == null) {
				VM.securityVMModal = new com.skyform.component.Modal(
						new Date().getTime(),
						Dict.val("vm_safety_switch"),
						$("script#securityVM_form").html(),
						{
							buttons : [
									{
										name : Dict.val("common_determine"),
										onClick : function() {
											var _isopen = $("#deep_bag_switch input[type='checkbox']").attr("checked");
											var _open = $("#fire_wall_switch input[type='checkbox']").attr("checked");
											var params={"vmId":vmId};
											var paraDefined={"vmId":vmId};
											params.status=_open?"ON":"OFF";
											paraDefined.openState=_isopen?"ON":"OFF";
											if($("#safeWallNotice").is(":hidden")){
											 VM.service.openOrCloseCloudFirewall(params,function onSuccess(data){
												 
											    },function onError(msg){
											    	ErrorMgr.showError("防火墙开关设置失败！！");
												});	
											}
											if($("#deepBagNotice").is(":hidden")){
											 VM.service.setCloudDefinderState(paraDefined,function onSuccess(data){
												 
											    },function onError(msg){
											    	ErrorMgr.showError("防火墙开关设置失败！！");
												});
											};
											VM.securityVMModal.hide();
											//$.growlUI("提示", "深度包开关设置成功");
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
											VM.securityVMModal.hide();
										}
									} ],
							beforeShow : function(){
								if(bflag){
								$("#deep_bag_switch").bootstrapSwitch();
								$("#fire_wall_switch").bootstrapSwitch();
								bflag=false;
								};
								var param={"vmId":vmId};
					//			var param={"vmId":14631218};
								 VM.service.describeCloudDefinderState(param,function onSuccess(data){
//								    	var data={
//								    			"openState":"ON"
//								    			};
								    	if(data.openState=="ON"){
								    	    $("#deep_bag_switch").bootstrapSwitch('setState', true);
								    	    $('#deepBagNotice').hide();
								    	}
								    	else if(data.openState=="error"){
								    		$('#deep_bag_switch').bootstrapSwitch('setActive', false); 
								    		$('#deepBagNotice').show();
								    	}
								    	else{
								    		$("#deep_bag_switch").bootstrapSwitch('setState', false);
								    		$('#deepBagNotice').hide();
								    	};
								    },function onError(msg){
										$.growlUI("提示", msg);
									});	
								 VM.service.queryCloudFirewallOpenStatus(param,function onSuccess(data){
//								    	var data={
//								    			"openState":"ON"
//								    			};
								    	if(data.status=="ON"){
								    	    $("#fire_wall_switch").bootstrapSwitch('setState', true);
								    	    $('#safeWallNotice').hide();
								    	}
								    	else if(data.status=="error"){
								    		$('#fire_wall_switch').bootstrapSwitch('setActive', false); 
								    		$('#safeWallNotice').show();
								    	}
								    	else{
								    		$("#fire_wall_switch").bootstrapSwitch('setState', false);
								    		$('#safeWallNotice').hide();
								    	}
								    },function onError(msg){
										$.growlUI("提示", msg);
									});	
								
							}
						});

			}
			// VM.modifyVMNameModal.setWidth(600).autoAlign();
			VM.securityVMModal.show();
		
	},
	_npasswordTip:function(){
		$("#tipName_nPassword").text("");
		$("#tipName_confirmPassword").text("");

		var reg=/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[%!#&$@*.,|^();]).{8,30}$/;
		var _nPassword = $("#nPassword").val();
		if(valiter.isNull($.trim(_nPassword)) || $.trim(_nPassword).length < 1)
		{
			$("#tipName_nPassword").text("请设置新密码");
		}
		else if(($.trim(_nPassword).length >=1&&$.trim(_nPassword).length < 8)||$.trim(_nPassword).length>30)
		{
			$("#tipName_nPassword").text("密码长度不符合");
		}
		else if(!reg.test(_nPassword))
		{
			$("#tipName_nPassword").text("密码格式不正确");
		}
	},
	_confirmPasswordTip:function(){
		$("#tipName_nPassword").text("");
		$("#tipName_confirmPassword").text("");

		var reg=/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[%!#&$@*.,|^();]).{8,30}$/;
		var flag = true;
		var subscriptionId = $("#subscriptionId").val();
		var uuid = $("#uuid").val();
		var _nPassword = $("#nPassword").val();
		var _confirmPassword = $("#confirmPassword").val();

		if(valiter.isNull($.trim(_nPassword)) || $.trim(_nPassword).length < 1)
		{
			$("#tipName_nPassword").text("请设置新密码");
			flag = false;
		}
		else if(($.trim(_nPassword).length >=1&&$.trim(_nPassword).length < 8)||$.trim(_nPassword).length>30)
		{
			$("#tipName_nPassword").text("密码长度不符合");
			flag = false;
		}
		else if(!reg.test(_nPassword))
		{
			$("#tipName_nPassword").text("密码格式不正确");
			flag = false;
		}
		else{
			if (_nPassword != _confirmPassword) {
				$("#tipName_confirmPassword").text("确认密码与新密码不一致");
				flag = false;
			}
		}
		VM.condition = {
			"id" : subscriptionId,
			"uuid" : uuid,
			"password" : _nPassword,
			"flag":flag
		}
		return VM.condition;
	},
	SavePassword : function(){
		VM._confirmPasswordTip();
		condition=VM.condition;
		if(condition.flag == false)
			return;
		VM.service.resetPWD(condition, function(result) {
			$("#resetPassword").modal("hide");
//			 System.notifyInfo("重置成功！")
				$.growlUI(Dict.val("common_tip"), "重置成功！");
			}, function(error) {
				$("#resetPassword").modal("hide");
//				 System.notifyError("重置错误！");
				$.growlUI(Dict.val("common_tip"), "重置错误！");
			});
		// $("#resetPassword").modal("hide");
			
	},

	//格式化云主机密码校验
	 _loginPassword: function(){
		 $("#tipName_loginPassword").text("");
		 $("#tipName_passwordAgain").text("");
	var setPwd=$("#setPwd input[checked]").attr("id");
	if(setPwd==="zhiding"){
		var reg=/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[%!#&$@*.,|^();]).{8,30}$/;
		var pwd=$("#_loginPassword").val();
		if(valiter.isNull($.trim(pwd)) || $.trim(pwd).length < 1 ){
			$("#tipName_loginPassword").text("请设置登录密码");
		}
		else if (($.trim(pwd).length >=1&&$.trim(pwd).length < 8)||$.trim(pwd).length>30) {
			$("#tipName_loginPassword").text("密码长度不符合");
		}
		else if (!reg.test(pwd)) {
			$("#tipName_loginPassword").text("密码格式不正确");
		}
	}
	},
 	_passwordAgain:function(){
		$("#tipName_loginPassword").text("");
		$("#tipName_passwordAgain").text("");
		var setPwd=$("#setPwd input[checked]").attr("id");
		if(setPwd==="zhiding"){
			var reg=/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[%!#&$@*.,|^();]).{8,30}$/;
			var flag = true;

			var _nPassword = $("#_loginPassword").val();
			var _confirmPassword = $("#_passwordAgain").val();

			if(valiter.isNull($.trim(_nPassword)) || $.trim(_nPassword).length < 1)
			{
				$("#tipName_loginPassword").text("请设置登录密码");
				flag = false;
			}
			else if(($.trim(_nPassword).length >=1&&$.trim(_nPassword).length < 8)||$.trim(_nPassword).length>30)
			{
				$("#tipName_loginPassword").text("密码长度不符合");
				flag = false;
			}
			else if(!reg.test(_nPassword))
			{
				$("#tipName_loginPassword").text("密码格式不正确");
				flag = false;
			}
			else{
				if (_nPassword != _confirmPassword) {
					$("#tipName_passwordAgain").text("确认密码与新密码不一致");
					flag = false;
				}
			}
			VM._condition = {
				"subscriptionId":parseInt(VM.selectedInstanceId),
				"osId":parseInt(VM.selectedInstanceOsId),
				"osDiskSizeMin":0,
				"passwordMethod":setPwd,
				"password" : _nPassword,
				"flag":flag
			}
		}else{
			VM._condition = {
				"subscriptionId":parseInt(VM.selectedInstanceId),
				"osId":parseInt(VM.selectedInstanceOsId),
				"osDiskSizeMin":0,
				"passwordMethod":setPwd,
				"flag":true
			}
		}
		return VM._condition;
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
			VM.changeFirewallModal = new com.skyform.component.Modal(new Date().getTime(),"<h3>修改安全组<span style='font-weight:normal;' id='changeFirewallH'></span></h3>",$("script#firewall_form").html(),{
				buttons : [
				           {name:'确定',onClick:function(){	
				        	   var vmid = VM.selectedInstanceId;
				        	   var oldsecurityid = VM.selectSGid;
				        	   var sgId = $("input[type='radio'][name='ssRadio']:checked").val();		
								var instance = {
										"vmId":parseInt(vmid),
										"oldSecurityGroupId":parseInt(oldsecurityid),
										"newSecurityGroupId":parseInt(sgId)
									};				
								com.skyform.service.FirewallService.changeSG(instance, function onSuccess(data){
									VM.changeFirewallModal.hide();
									var instance = {};
									instance.id = VM.selectedInstanceId;
									VM.showInstanceInfo(instance);
									$.growlUI(Dict.val("common_tip"), "修改成功！");										
								},function onError(msg){
									VM.changeFirewallModal.hide();
									$.growlUI(Dict.val("common_tip"), "修改失败！");
								});
				        	   
				           },attrs:[{name:'class',value:'btn btn-primary'}]},
				           
				           {name:'取消',onClick:function(){
				        	   VM.changeFirewallModal.hide();
				           },attrs:[{name:'class',value:'btn'}]}
				           ],
				beforeShow : function(){
					
				},
				afterShow:function(){
					$("#changeFirewallH").html("("+VM.selectSGName+")");
					var allCheckedBox = $("#tbody2 input[type='checkbox']:checked");
					var vmId = $(allCheckedBox[0]).parents("tr").attr("instanceId");					
					com.skyform.service.FirewallService.querySG(function(result){
						var datas = [];
						var pool1=$("#pool").val().trim();
						var pool2=Config.securityGroupPool.trim();
						if(pool2.indexOf(pool1) > -1){
							$(result).each(function(index, item){
								if(item.isDefault!=1){
									datas.push(item);
								}
							});
						} else {
							datas = result;
						}
						var data = VM.querySGByState(datas);
						//var data = VM.querySGByState(result);
						if(VM.selectTable) {
							VM.selectTable.updateData(data);				
						} else {
							VM.selectTable = new com.skyform.component.DataTable();							
//							if(!VM.ssRadioInited){
//								VM.selectTable.container.find("tbody").html("<tr ><td colspan='7' style='text-align:center;'><img src='"+CONTEXT_PATH+"/images/loader.gif'/><strong>正在获取数据，请稍后....</strong></td></tr>");
//							} 
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
										 if("bind error"==columnData.subServiceStatus||"using"== columnData.subServiceStatus){											 
												columnData.subServiceStatus = "running";											 
										 }
										 text = com.skyform.service.StateService.getState("",columnData.subServiceStatus || columnData);
									 }
									 //vps
									/* else if("networkType" == columnData.name){
										 if (  columnData.networkType == 0 ){
											 text="私有网络";
										 }else if (columnData.networkType =="1" ){
											 text="基础网络";
										 }
									 }*/
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
									var oldsecurityid = VM.selectSGid;
									if(oldsecurityid>0){
										tr.find("input[type='radio'][name='ssRadio'][value="+oldsecurityid+"]").attr("checked",'checked');
									} else {
										tr.find("input[type='radio'][name='ssRadio']").attr("checked", false);
									}
								},
								afterTableRender : function(){
									
								}
							});	
						}		
					})
				}
			});
		}
		VM.changeFirewallModal.autoAlign().setTop(100).setWidth(700).setHeight().show();
	}	
};

/*function validatehadPrivateNet1(){
	var result = {status : true};
	if($("#privateNetwork").hasClass("active")){
		console.log("111")
		result.status = true;
	}else {
		result.status = false;
	}
	return result;
}*/
function validatehadPrivateNet(select){
	var result = {status : true};
	/*if($("#basicNetwork").hasClass("active")){*/
		$("#tip_1226").empty();
		if($("#vm_privatenetwork option").length == 0){
			console.log("22222")
			$("#tip_1226").empty().html("* 请先去申请私有网络！");
			result.status = false;
		}else {
			result.status = true;
		}
		return result;
	/*}
	if($("#privateNetwork").hasClass("active")){
		if($("#privateNetwork").hasClass("active")){
			console.log("111")
			result.status = true;
		}else {
			result.status = false;
		}
		return result;
	}*/


}




	function validateosempty(select){
		var result = {status : true};
		if($("#ostemplates .osList.selected").length == 0){
			$(".osempty").show();
			result.status=false;
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
	};

	function validateAZone(){
		var result = {status : true};
		if(!$("#azDiv").is(':hidden')){
			if(!VM.azSelect.showValidateAZSelect()){
				result.status = false;
			}
		}
		return result;
	}

   //申请云主机指定密码
	function loginPassword(){
		var pwdType=$("#pwdType input[checked]").attr("id");
		if(pwdType==="zdmm"){
			var result = {
				status : false
			};
			var reg=/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[%!#&$@*.,|^();]).{8,30}$/;
			var pwd=$("#loginPassword").val();
			//console.log(pwd);
			if(valiter.isNull($.trim(pwd)) || $.trim(pwd).length < 1 ){
				$("#pwdTip").html("* 请设置登录密码").css("color","red");
			}else if (($.trim(pwd).length >=1&&$.trim(pwd).length < 8)||$.trim(pwd).length>30) {
				var errorMsg ="* 密码长度不符合";
				$("#pwdTip").html(errorMsg).css("color","red");

			}else if (!reg.test(pwd)) {
				    var errorMsg ="* 密码格式不正确";
					$("#pwdTip").html(errorMsg).css("color","red");

			}else if(reg.test(pwd)){
				$("#pwdTip").html("");
				result.status = true;
			}
			return result;
		}
	}
	function passwordAgain(){
		var pwdType=$("#pwdType input[checked]").attr("id");
		if(pwdType==="zdmm"){
			var result = {
				status : false
			};
			var reg=/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[%!#&$@*.,|^();]).{8,30}$/;
			var pwd=$("#loginPassword").val();
			var pwdAgain=$("#passwordAgain").val();
			if((reg.test(pwd))){
				if(pwd===pwdAgain){
					$("#pwdAgainTip").html("");
					result.status = true;
				}else{
					$("#pwdAgainTip").html("* 确认密码与登录密码不一致").css("color","red");
					result.status = false;
				}
			}else{
				$("#pwdAgainTip").html("");
				result.status = false;
			}
			return result;
		}
	}
//申请云主机清空密码信息
	function clearPwdInfo(){
		$(".wizard-card #instanceName").val("");
		//console.log($("#instanceName").val());
		$("#loginPassword").val("");
		$("#passwordAgain").val("");
		$("#pwdTip").html("");
		$("#pwdAgainTip").html("");
	}
	function validateAgentCode(select){
		var result = {status : true};
		$("#agentMsg").empty();
		var agentId = $("#agentId").val();
		if(agentId&&agentId.length>0){
			VM.ChannelService.checkAgentCode(agentId,function(data){
				if("-3" == data){
					$("#agentMsg").html(Dict.val("common_discount_code_no_exist"));
					result.status = false;
				}
				else if("-2" == data||"-1" == data){
					$("#agentMsg").html(Dict.val("common_discount_code_expired"));
					result.status = false;
				}else if("-6" == data){
					$("#agentMsg").html(Dict.val("common_coupons_reached_maximum_number"));
					result.status = false;
				}else if("-4" == data){
					$("#agentMsg").html(Dict.val("common_discount_code_authing"));
					result.status = false;
				} else if("-5" == data){
					$("#agentMsg").html(Dict.val("common_discount_code_unauthed"));
					result.status = false;
				} 
					else if("-7" == data){
					$("#agentMsg").html(Dict.val("common_discount_code_noavailable"));
					result.status = false;
				}		
			});
		}
		return result;
	};
