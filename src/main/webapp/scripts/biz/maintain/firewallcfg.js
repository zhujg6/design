//创建虚拟机，维护防火墙规则
var FireWallCfg = {
	rules : [],
		rule_ports : [],
		rule_protocols : [],
	container : "#firewallrule",
	id : 1,
//	defaultFireWareRule:[{
//		"direction":"egress",
//		"name":"TCP上行",
//		"port":"1-65535",
//		"protocol":"tcp",
//		"ip" :""		
//	},
//	{
//		"direction":"egress",
//		"name":"UDP上行",
//		"port":"1-65535",
//		"protocol":"udp",
//		"ip" :""		
//	}
//	],
	defaultFireWareRule:[],
	getFormData : function(param){
		$(FireWallCfg.rules).each(function(i,rule){
			param["firewallRules.rules["+i+"].name"] = rule.name;
			param["firewallRules.rules["+i+"].port"] = rule.port;
			param["firewallRules.rules["+i+"].protocol"] = rule.protocol;
			param["firewallRules.rules["+i+"].direction"] = rule.direction;
		});
		
	},
	
	init : function() {
		FireWallCfg.rules = [];
		FireWallCfg.container = $(FireWallCfg.container);
		FireWallCfg.container.find("tr[id != 'formTr'][id != 'errorInfoRow']").remove();
		FireWallCfg.container.find(".btn-add").unbind().click(function(){
			FireWallCfg.addRule();			
		});
		
		var commonRulesContainer = $("#commonRules");
		$("a#exportFirewallAdd").unbind().click(function(){
			FireWallCfg.exportFirewallAdd();
		});
		$("a#importFirewallAdd").unbind().click(function(){
			AutoUpdater.stop();				
			$("#upload_saveAdd").removeClass("disabled").attr("disabled",false);				
			$("#uploadDivAdd").show();
		});
		$("#upload_saveAdd").unbind("click").bind("click", function() {	
			FireWallCfg.importFirewallAdd();
		});
		$("#upload_abortAdd").unbind("click").bind("click", function() {
			FireWallCfg.resetUploadDivAdd()
		});
		$("#rule_protocol",FireWallCfg.container).bind("change",function(){
			$("#firewall input[type='text']").removeAttr("style");
			$("#errorInfoRow",FireWallCfg.container).hide();
			var protocol = $(this).val();
			if("icmp" == protocol) {
				$("#rule_port",FireWallCfg.container).attr("readonly",true).val("");							
			} else {
				$("#rule_port",FireWallCfg.container).attr("readonly",false);					
			}
			if("ip" == protocol){
				$("#rule_ip",FireWallCfg.container).attr("readonly",false);
				$("#rule_port",FireWallCfg.container).attr("readonly",true).val("");	
			} else {
				$("#rule_ip",FireWallCfg.container).attr("readonly",true).val("");
			}	
		});
		$("#rule_protocol",FireWallCfg.container).val("tcp");
		$("#rule_protocol",FireWallCfg.container).change();
		commonRulesContainer.empty();
		
		$(com.skyform.service.FireWallRule).each(function(i,rule){
			var ruleItem = $("<button class='btn btn-success btn-mini'>"+rule.name+"</button>");
			ruleItem.unbind().click(function(e){
				e.preventDefault();
					//alert(rule.port);
					$(rule.port).each(function(p,rule_ports){
						$(rule.protocol).each(function(r,rule_protocols){
							//alert(rule_ports.port);
							//alert(rule_protocols.type);
							var newRule = {
								name : rule.name,
								port : rule_ports.port,
								protocol : rule_protocols.type,
								direction : rule.direction,
								ip : rule.ip
							};
							FireWallCfg._addRule(newRule);
							//if(rule.name == "ICMP"){//只有ICMP才有上行
								var newRuleUpdirection = {
										name : rule.name,
										port : rule_ports.port,
										protocol : rule_protocols.type,
										direction : "egress",
										ip : rule.ip
								};
								FireWallCfg._addRule(newRuleUpdirection);
							//}
							
						});
					});
					//alert(rule.protocol);
					/**
				var newRule = {
					name : rule.name,
					port : rule.port,
					protocol : rule.protocol,
					direction : rule.direction
				};
				FireWallCfg._addRule(newRule);
				var newRuleUpdirection = {
						name : rule.name,
						port : rule.port,
						protocol : rule.protocol,
						direction : 'egress'
				};
				FireWallCfg._addRule(newRuleUpdirection);
				
				//**/
			});
			ruleItem.appendTo(commonRulesContainer);
		});
		$(FireWallCfg.defaultFireWareRule).each(function(index,item){
			FireWallCfg._addRule(item);
		});
		
		this._resetFromRow();
	},
	importFirewallAdd : function(){
		var _filename = $('#file2uploadAdd').val();				
		if(!_filename){
			$("#tipFile2uploadAdd").text(Dict.val("common_please_select_file"));
			return;
		}else{
			$("#tipFile2uploadAdd").text("");
		}
		var _extend = _filename.substring(_filename.lastIndexOf(".")+1);
		var re = /^(xls)$/;
		var isValid = (_extend && re.test(_extend));
		if (!isValid) {
			$("#tipFile2uploadAdd").text(Dict.val("common_please_up_xls_file"));
			return;
		}else{
			$("#tipFile2uploadAdd").text("");
		}
		$("#upload_saveAdd").addClass("disabled");
		$("#upload_saveAdd").attr("disabled",true);
		
		var vmId = $("#modifyFirewallModalAdd #vmId").val();
		var groupId = firewall.selectedId;
	    var options = { 
	            data: { "vmId":0, "groupId":groupId },
	            type : "POST",
	            dataType:  'json',
	            timeout  : 1800000,
	            success: function(rs) {
					$("#upload_saveAdd").removeClass("disabled").attr("disabled",false); 
					FireWallCfg.resetUploadDivAdd();
					$(rs.securityGroupRules).each(function(i,rule){
						var newRule = {
							name : rule.name,
							port : rule.port,
							protocol : rule.protocol,
							direction : rule.direction,
							ip : rule.ip
						};
						FireWallCfg._addRule(newRule);
					});
					if(null!=rs&&rs.code == 0){
						$.growlUI(Dict.val("common_tip"),Dict.val("common_import_executed")+rs.msg); 
					}else if(null!=rs&&rs.msg!== null){
						$.growlUI(Dict.val("common_tip"),Dict.val("common_import_executed")+rs.msg); 
					}
					else $.growlUI(Dict.val("common_tip"),Dict.val("common_import_failed_file_format_error")); 
	    	    },			            	
	            error : function() {
	            	$.growlUI(Dict.val("common_tip"), Dict.val("common_import_failed")); 
	    		}
	    }; 
        $("#uploadObjectFormAdd").ajaxSubmit(options);
	},
	resetUploadDivAdd : function(){
		$("#uploadDivAdd").hide();
		$("#file2uploadAdd").val("");
		$("#tipFile2uploadAdd").empty();
	},
	exportFirewallAdd : function(){
		var data = JSON.stringify(FireWallCfg.rules);	 
		$("#exportFormAdd #paramAdd").val(data);			
        window.open("","newWinAdd");
        $("#exportFormAdd").submit();
	},
	addRule : function(){
		var name = $("#rule_name",FireWallCfg.container).val();
		var port = $("#rule_port",FireWallCfg.container).val();
		var protocol = $("#rule_protocol",FireWallCfg.container).val();
		var direction = $("#rule_direction",FireWallCfg.container).val();
		var ip = $("#rule_ip",FireWallCfg.container).val();
		
		var rule = {
			"name" : name,
			"port" : port,
			"protocol" : protocol,
			"direction" : direction,
			"ip" : ip
		};
		
//		if($.trim(rule.port) == "") {
//			rule.port = -1;
//		}
		FireWallCfg._addRule(rule);
		
	},
	
	_addRule : function(rule) {
		if(FireWallCfg.validate(rule)) {
			rule.id = FireWallCfg.id++;
			FireWallCfg.rules.push(rule);
			
			var newRow = FireWallCfg._generateNewRule(rule);
			FireWallCfg._bindEventForBtns(newRow, rule);
			
			newRow.insertBefore($("#formTr",FireWallCfg.container));
			
			FireWallCfg._resetFromRow();
			$("#rule_protocol",FireWallCfg.container).change();
		}
	},
	_generateNewRule : function(rule) {
		var newRow = $(
				"<tr ruleId='" + rule.id + "'>"+
					FireWallCfg._generateContent(rule) +
				"</tr>"		
		);
		return newRow;
	},
	_generateContent : function(rule) {
		return ""+
		"<td>" + rule.name + "</td>" + 
		"<td>" + (rule.port!=null?rule.port : "" ) + "</td>" + 
		"<td>" + (null!=rule.ip&&rule.ip.length>=0?rule.ip : "" ) + "</td>" + 
		"<td>" + rule.protocol + "</td>" + 
		"<td>" + this._switchDirection(rule.direction) + "</td>" + 
		"<td> <button class='btn btn-warning btn-modify btn-mini'>"+Dict.val("common_modify")+"</button>&nbsp;<button class='btn btn-danger btn-del btn-mini' ruleId='"+rule.id+"'>"+Dict.val("common_remove")+"</button></td>"; 
	},
	_switchDirection : function(direction) {
		switch (direction) {
		case "ingress":
			return Dict.val("common_ingress");
		case "egress":
			return Dict.val("common_egress");
		default:
			return Dict.val("common_ingress");
		}
	},
	_bindEventForBtns : function(row,rule) {
		row.find(".btn-modify").click(function(){
			row.html(
					"<td><input type='text' name='ruleName' value='" + rule.name  + "'/></td>" + 
					"<td><input type='text' name='rulePort' class='input input-mini' value='" + rule.port  + "'/></td>" + 
					"<td><input type='text' name='ruleIp' class='input input-mini' readonly value='" + rule.ip  + "'/></td>" + 
					"<td>" +
						"<select name='ruleProtocol' class='select input-small'>" +
						"<option value='tcp'>TCP</option>" +
							"<option value='udp'>UDP</option>" + 
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
			row.find("select").val(rule.protocol);
			if(rule.protocol == "icmp"){
				row.find("input[name='rulePort']").attr("readonly",true).val("");
			}
			if(rule.protocol == "ip"){
				row.find("input[name='rulePort']").attr("readonly",true).val("");
				row.find("input[name='ruleIp']").attr("readonly",false);
			}
			
			row.find("select[name='ruleProtocol']").bind("change",function(){
				var protocol = $(this).val();
				$("#firewall input[type='text']").removeAttr("style");
				$("#errorInfoRow",FireWallCfg.container).hide();
				if("icmp" == protocol) {
					row.find("input[name='rulePort']").attr("readonly",true).val("");
				} else {
					row.find("input[name='rulePort']").attr("readonly",false);
				}
				if("ip" == protocol){
					row.find("input[name='ruleIp']").attr("readonly",false);
					row.find("input[name='rulePort']").attr("readonly",true).val("");
				} else {
					row.find("input[name='ruleIp']").attr("readonly",true).val("");
				}
			});
			row.find(".btn-save").click(function(){
				try {
					FireWallCfg.update(row);
				} catch(e){
					//console.log(e);
				}
				return false;
			});
			
		});
		
		row.find(".btn-del").click(function(){
			FireWallCfg.deleteRule(row.attr("ruleid"));
		});
	},
	_resetFromRow : function() {
		$("#rule_name",FireWallCfg.container).val("");
		$("#rule_port",FireWallCfg.container).attr("readonly",false).val("");
		$("#rule_ip",FireWallCfg.container).attr("readonly",true).val("");
	},
	deleteRule:function(id) {
		$(FireWallCfg.rules).each(function(i,_rule) {
			if(_rule.id +""== id+"") {
				FireWallCfg.rules.splice(i,1);
				FireWallCfg.container.find("tr[ruleId='"+id+"']").remove();
				return false;
			}
		});
	},
	update : function(newRow){
		var id = newRow.attr("ruleId");
		var name = newRow.find("input[name='ruleName']").val();
		var port = newRow.find("input[name='rulePort']").val();
		var protocol = newRow.find("select[name='ruleProtocol']").val();
		var direction = newRow.find("select[name='ruleDirection']").val();
		var ip = newRow.find("input[name='ruleIp']").val();
		
		var rule = {
			"id" : id,
			"name" : name,
			"port" : port,
			"protocol" : protocol,
			"direction" : direction,
			"ip" : ip
			
		}
		if(FireWallCfg.validate(rule,true)) {
			$(FireWallCfg.rules).each(function(i,_rule) {
				if(_rule.id == rule.id) {
					_rule.name = rule.name;
					_rule.port = rule.port;
					_rule.protocol = rule.protocol;
					_rule.direction = rule.direction;
					
					newRow.html(FireWallCfg._generateContent(rule));
					FireWallCfg._bindEventForBtns(newRow,rule);
					return false;
				}
			});
			
			
		}
		
	},
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
		
		return true;
	},
	_validateExisted : function(rule){
		var result = false;
		$(this.rules).each(function(i,_rule){
			if(rule.id != _rule.id && FireWallCfg._ruleEqualsTo(rule, _rule)){
				result = true;
				return false;
			}
		});
		return result;
	},
	validate : function(rule,update) {
		var result = true;
		var nameValid = true;
		var nameValidator = update ? "input[type='text'][name='ruleName']" : "#rule_name";
		var portValidator = update ? "input[type='text'][name='rulePort']" : "#rule_port";
		var ipValidator = update ? "input[type='text'][name='ruleIp']" : "#rule_ip";
		if($.trim(rule.name+"").length == 0) {
			$(nameValidator,FireWallCfg.container).css("border","1px solid red");
			$("#name_error",FireWallCfg.container).html(Dict.val("common_name_not_empty"));
			nameValid = false;
		} else {
			$(nameValidator,FireWallCfg.container).removeAttr("style");
			$("#name_error",FireWallCfg.container).html("");
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
					$(portValidator,FireWallCfg.container).css("border","1px solid red");
					$("#port_error",FireWallCfg.container).html(Dict.val("common_invalid_port_number"));
					portValid = false;
				}
				//开放80、443的下行端口			
				else if((item==80&&rule.direction!='egress')||(item==443&&rule.direction!='egress')){
					//console.log('firewallcfg.js');'
					if(CommonEnum.userHttpRecord.length>0){//共有云，行业云备案的用户开放80,443下行
					}else{//效验80,443
						$(portValidator,FireWallCfg.container).css("border","1px solid red");
						$("#port_error",FireWallCfg.container).html(Dict.val("common_temporarily_open_port"));
						portValid = false;
					}
				}
				else if(nameValid){
					$(portValidator,FireWallCfg.container).removeAttr("style");
					$("#name_error",FireWallCfg.container).html("");
				}
			});
			if(port.length == 2 && port[1]<port[0]){
				$(portValidator,FireWallCfg.container).css("border","1px solid red");
				$("#port_error",FireWallCfg.container).html(Dict.val("common_invalid_port_number"));
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
				$(ipValidator,FireWallCfg.container).css("border","1px solid red");
				$(".portCol").attr("colspan","0");
				$("#ip_error",FireWallCfg.container).html(Dict.val("common_invalid_ip"));
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
				else if(!_NumberCheck(inputIp[1]) || Number(inputIp[1])<0 || Number(inputIp[1])>32){
					_showIpError();
				}
			}
			else {
				inputIp[0] = rule.ip;
				if(!_IPValidate(inputIp[0]) ){					
					_showIpError();
				}
			}
			
//			if(!_IPValidate(rule.ip) ){					
//				$(ipValidator,FireWallCfg.container).css("border","1px solid red");
//				$(".portCol").attr("colspan","0");
//				$("#ip_error",FireWallCfg.container).html(Dict.val("common_invalid_ip"));
//				ipValid = false;
//			}
			
		}
		var notDuplicate = true;
		if(FireWallCfg._validateExisted(rule)) {
			$("#formTr",FireWallCfg.container).css("border","1px solid red");
			$("#port_error",FireWallCfg.container).html(Dict.val("common_port_protocol_direction_not_repeated"));
			notDuplicate = false;
		} else if(portValid){
			$("#formTr",FireWallCfg.container).removeAttr("style")
			$("#port_error",FireWallCfg.container).html("");
		}  else if(ipValid){
			$("#formTr",FireWallCfg.container).removeAttr("style")
			$("#ip_error",FireWallCfg.container).html("");
		}
		
		result = nameValid && portValid && ipValid && notDuplicate;
		if(!result) {
			$("#errorInfoRow",FireWallCfg.container).show();
		} else {
			$("#errorInfoRow",FireWallCfg.container).hide();
		}
		
		return result;
	}
};