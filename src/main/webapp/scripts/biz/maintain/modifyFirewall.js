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
				firewall.refreshBtnFirewall();
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
							//if(rule.name=="ICMP"){//只有ICMP才有上行
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
					"vmId" : 0,
					"securityGroupId" : firewall.selectedId,
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
					"vmId" : 0,//不需要,先传非空
					"securityGroupId" : parseInt(firewall.selectedId),
					"securityGroupRules" : [],
					"modeunBlock":"true"
				};
				if(rule instanceof Array){
					group.securityGroupRules = rule;
				}
				else group.securityGroupRules.push(rule);				
				com.skyform.service.FirewallService.addSecurityGroupRule(group,function(data){
					rule.state = 0;
					modifyFirewall._addRule(rule);	
					firewall.querySG();
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
			rule.state = rule.securityGroupRuleStatus;
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
					html += "<td id='"+rule.securityGroupRuleId+"'><button class='btn btn-danger btn-del btn-mini' ruleId='"+rule.securityGroupRuleId+"'>"+Dict.val("common_remove")+"</button></td>"; 
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
//				html += "<td id='"+rule.securityGroupRuleId+"'><button class='btn btn-danger btn-del btn-mini' ruleId='"+rule.securityGroupRuleId+"'>删除</button></td>"; 
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
				var ruleid = row.attr("ruleid");
				modifyFirewall.deleteRule(ruleid);				
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
				"securityGroupId" : parseInt(firewall.selectedId),
//				"vmId" : 0 //不需要,先传非空
			};
			com.skyform.service.FirewallService.delSecurityGroupRule(param, function(data) {
//				if (data.code != "0") {
//				} else {				
//				}
				//firewall.cfgFirewall();
				firewall.refreshBtnFirewall();
			},function onError(e){
				//$('#modifyFirewallModal').modal('hide');
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
					$("#port_error",modifyFirewall.container).html(Dict.val("common_invalid_port_number"));
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
			var groupId = firewall.selectedId;
		    var options = { 
		            data: { "vmId":0, "groupId":groupId },
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
		            	firewall.cfgFirewall();		            	
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
	
}