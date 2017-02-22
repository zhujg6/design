/**
 * 实例动态刷新功能
 * 每一种实例都可以有一个自动更新器，每个更新器以自身的code为key，如虚拟机的话用vm，虚拟磁盘用vdisk
 * 对于每一种自动更新器，只需要告诉
 * 1）如何去取得要检查的数据 ：fetchData
 * 2）如何判断这条数据是否需要更新 ：isNeedUpdate
 * 3）如何去更新显示内容 ：update
 * 
 * 使用方法：console.jsp的最下方加入下面的语句:
 * <script type="text/javascript" src="${ctx }/scripts/biz/maintain/InstanceAutoUpdate.js"></script>
 * 在响应的js里加入如下内容（以vm.js为例）：
 * window.currentInstanceType='vm';
 */
var mainWindowUpdateTime = 30*1000;

var subWindowUpdateTime = 10*1000;

var AutoUpdater = {
		datas : [],
		timer : null,
		parentid : null,
	updaters : {
		/////////////////////////////////////////////////////////////////////////////////////
		//		这个是虚拟机的例子
		/////////////////////////////////////////////////////////////////////////////////////
		"vm" : {
			
			cache : [],								// 之前缓存的数据
			instances : [],							// 当前获取的最新的数据			
			isNeedUpdate : function(instance) {
				
				var oldInstance = this.cache["" + instance.id];
				if(!oldInstance) return true;
				
				if(oldInstance.state != instance.state) return true;		// 当实例状态发生变化时更新数据
				
				if(oldInstance.optState != instance.optState) return true;	// 当操作状态发声变化时，告诉需要更新数据
				
				return false;
			},
			update : function(instance) {
				
				// 这里结合虚拟机的例子，每个数据在datatable中展示为1行，且行有个属性叫做instanceId
				// 所以，可以根据instanceId找到要更新的行
				var row = $("#tbody2 tr[instanceId='"+instance.id+"']");
				if(row && VM.datatable) {
					var checked = $("input[type='checkbox']",row).attr("checked");
					// 找到之后，调用datatable的api，更新相应的行数据
					// 注意，这个api是刚加上去的，所以一定要确保我们的ui库的js是最新的(com.skyform.component.js)
					VM.datatable.updateRow(row,instance,checked);
				}
			},
			fetchData : function(callback) {
				
				var self = this;
				// 调用vmsservice的取数据方法去取得需要的数据
				com.skyform.service.vmService.listInstances(function(instances){
					if (AutoUpdater.datas.length!=instances.length){
						VM.datatable.updateData(instances);
					}
					if(instances && instances.length>0) {
						$("#details").show();
						VM.showInstanceInfo(instances[0]);
					} else {
						$("#details").hide();
					}
					AutoUpdater.datas = instances;
					self.cache = self.instances;
					VM.instances = instances;
					self.instances = [];
					$(instances).each(function(i,instance){
						self.instances["" + instance.id] = instance;
						// 设置回掉
						if(callback && typeof callback == 'function') {
							callback(instance);
						}
					});
					
				});
			},
			getInterval:function() {
				
				 return mainWindowUpdateTime;
			}
		},
	"backupCreate1" : {//云备份
			
			cache : [],								// 之前缓存的数据
			instances : [],							// 当前获取的最新的数据			
			isNeedUpdate : function(instance) {
				
				var oldInstance = this.cache["" + instance.id];
				if(!oldInstance) return true;
				
				if(oldInstance.state != instance.state) return true;		// 当实例状态发生变化时更新数据
				
				if(oldInstance.optState != instance.optState) return true;	// 当操作状态发声变化时，告诉需要更新数据
				
				return false;
			},
			update : function(instance) {
				
				// 这里结合虚拟机的例子，每个数据在datatable中展示为1行，且行有个属性叫做instanceId
				// 所以，可以根据instanceId找到要更新的行
				var row = $("#instanceTable tr[instanceId='"+instance.id+"']");
				if(row && BackupCreate.dtTable) {
					var checked = $("input[type='checkbox']",row).attr("checked");
					// 找到之后，调用datatable的api，更新相应的行数据
					// 注意，这个api是刚加上去的，所以一定要确保我们的ui库的js是最新的(com.skyform.component.js)
					BackupCreate.dtTable.updateRow(row,instance,checked);
				}
			},
			fetchData : function(callback) {
				BackupCreate.init();
//				var self = this;
//				// 调用vmsservice的取数据方法去取得需要的数据
////				BackupCreate.refreshData();
//				 var params={
//						  "vmName":"",
//						  "taskName":"",
//						  "createTimeMin":"",
//						  "createTimeMax":"",
//						  "backupType":""
//				  };
//				  var params2={};
//				  params2.condition=params;
//				com.skyform.service.backupCloudService.listBackupCloudByParams(params2,function(instances){
//					if (AutoUpdater.datas.length!=instances.length){
//						BackupCreate.dtTable.updateData(instances);
//					}
//					if(instances && instances.length>0) {
//						com.skyform.service.LogService.describeLogsUIInfo(instances[0],"opt_logs");
//					} else {
//					}
//					AutoUpdater.datas = instances;
//					self.cache = self.instances;
//					BackupCreate.data = instances;
//					self.instances = [];
//					$(instances).each(function(i,instance){
//						self.instances["" + instance.id] = instance;
//						// 设置回掉
//						if(callback && typeof callback == 'function') {
//							callback(instance);
//						}
//					});
//				});
//				com.skyform.service.vmService.listInstances(function(instances){
//					if (AutoUpdater.datas.length!=instances.length){
//						BackupCreate.datatable.updateData(instances);
//					}
//					if(instances && instances.length>0) {
//						$("#details").show();
//						BackupCreate.showInstanceInfo(instances[0]);
//					} else {
//						$("#details").hide();
//					}
//					AutoUpdater.datas = instances;
//					self.cache = self.instances;
//					BackupCreate.instances = instances;
//					self.instances = [];
//					$(instances).each(function(i,instance){
//						self.instances["" + instance.id] = instance;
//						// 设置回掉
//						if(callback && typeof callback == 'function') {
//							callback(instance);
//						}
//					});
//					
//				});
			},
			getInterval:function() {
				
				 //return mainWindowUpdateTime;
				 return 60000;
			}
		},
		"vmVirus" : {
			cache : [],								// 之前缓存的数据
			instances : [],							// 当前获取的最新的数据			
			isNeedUpdate : function(instance) {
				
				var oldInstance = this.cache["" + instance.id];
				if(!oldInstance) return true;
				
				return false;
			},
			update : function(instance) {
				// 这里结合虚拟机的例子，每个数据在datatable中展示为1行，且行有个属性叫做instanceId
				// 所以，可以根据instanceId找到要更新的行
				var row = $("#tbody2 tr[instanceId='"+instance.id+"']");
				if(row && VM.datatable) {
					var checked = $("input[type='checkbox']",row).attr("checked");
					// 找到之后，调用datatable的api，更新相应的行数据
					// 注意，这个api是刚加上去的，所以一定要确保我们的ui库的js是最新的(com.skyform.component.js)
					VM.datatable.updateRow(row,instance,checked);
				}
			},
			fetchData : function(callback) {
				var self = this;
				// 调用vmsservice的取数据方法去取得需要的数据
				com.skyform.service.virusService.listInstances(function(instances){
					if (AutoUpdater.datas.length!=instances.length){
						VM.datatable.updateData(instances);
					}
					AutoUpdater.datas = instances;
					self.cache = self.instances;
					self.instances = [];
					$(instances).each(function(i,instance){
						self.instances["" + instance.id] = instance;
						// 设置回掉
						if(callback && typeof callback == 'function') {
							callback(instance);
						}
					});
					
				});
			},
			getInterval:function() {
				 return mainWindowUpdateTime;
			}
		},
		"virus" : {
		cache : [],								// 之前缓存的数据
		instances : [],							// 当前获取的最新的数据			
		isNeedUpdate : function(instance) {
			
			var oldInstance = this.cache["" + instance.id];
			if(!oldInstance) return true;
			
			return false;
		},
		update : function(instance) {
			// 这里结合虚拟机的例子，每个数据在datatable中展示为1行，且行有个属性叫做instanceId
			// 所以，可以根据instanceId找到要更新的行
			var row = $("#configDataTable tr[instanceId='"+instance.id+"']");
			if(row) {
				var checked = $("input[type='checkbox']",row).attr("checked");
				// 找到之后，调用datatable的api，更新相应的行数据
				// 注意，这个api是刚加上去的，所以一定要确保我们的ui库的js是最新的(com.skyform.component.js)
				Virus.configDataTable.updateRow(row,instance,checked);
			}
		},
		fetchData : function(callback) {
			var self = this;
			// 调用vmsservice的取数据方法去取得需要的数据
			com.skyform.service.virusService.queryConfig(function(instances){
				Virus.configDataTable.updateData(instances);
				AutoUpdater.datas = instances;
				self.cache = self.instances;
				self.instances = [];
				$(instances).each(function(i,instance){
					self.instances["" + instance.id] = instance;
					// 设置回掉
					if(callback && typeof callback == 'function') {
						callback(instance);
					}
				});
				
			});
		},
		getInterval:function() {
			 return mainWindowUpdateTime;
		}
	},
		"firewall" : {
			cache : [],								// 之前缓存的数据
			instances : [],							// 当前获取的最新的数据
			isNeedUpdate : function(instance) {
				var oldInstance = this.cache["" + instance.id];
				if(!oldInstance) return true;
				
				if(oldInstance.state != instance.state) return true;		// 当实例状态发生变化时更新数据
				
				return false;
			},
			update : function(instance) {
				if("firewall" != window.currentInstanceType)return;
				// 所以，可以根据instanceId找到要更新的行
				var row = $("#modifyfirewallrule tr[ruleid='"+instance.id+"']");
				if(row) {
					// 找到之后，调用modifyFirewall的_generateContent，更新相应的行数据
					row.empty();
					var ruletr = modifyFirewall._generateContent(instance);
					row.html(ruletr);
					modifyFirewall._bindEventForBtns(row, instance);
				}
			},
			fetchData : function(callback) {				
				var firewallId = AutoUpdater.parentid;
				if($("#modifyFirewallModal").attr("class").indexOf("in")==-1){
					AutoUpdater.stop();
					window.currentInstanceType='securityGroup';					
					AutoUpdater.start();
				}
				if("firewall" != window.currentInstanceType)return;
				var self = this;
				//查询规则
				//VM.firewallService.listRulesByFirewall(firewallId,function(rules){				
				com.skyform.service.FirewallService.queryRuleBySG(firewallId, function(data){
					var rules = data.securityGroupRules;
					if (rules)
					{
						if (rules.length!=AutoUpdater.datas.length){
							firewall.initModifyFirewall(data);
						}
						AutoUpdater.datas = rules;
						self.cache = self.instances;
						self.instances = [];
						$(rules).each(function(i,rule){
							rule.id = rule.securityGroupRuleId;
							self.instances["" + rule.id] = rule;
							// 设置回掉
							if(callback && typeof callback == 'function') {
								callback(rule);
							}
						});
						
					}
					
							
				});
			},
			getInterval:function() {
				 return subWindowUpdateTime;
			}
		},
		"subnet" : {
			cache : [],								// 之前缓存的数据
			instances : [],							// 当前获取的最新的数据
			isNeedUpdate : function(instance) {
				
				var oldInstance = this.cache["" + instance.id];
				if(!oldInstance) return true;
				
				if(oldInstance.state != instance.state) return true;		// 当实例状态发生变化时更新数据
				
				return false;
			},
			update : function(instance) {
				// 这里结合虚拟机的例子，每个数据在datatable中展示为1行，且行有个属性叫做instanceId
				// 所以，可以根据instanceId找到要更新的行
				var row = $("#private_network_instanceTable_wrapper tr[instanceid='"+instance.id+"']");
				if(row && PrivateNetwork.dtTable) {
					// 找到之后，调用datatable的api，更新相应的行数据
					// 注意，这个api是刚加上去的，所以一定要确保我们的ui库的js是最新的(com.skyform.component.js)
					PrivateNetwork.dtTable.updateRow(row,instance);
				}
			},
			fetchData : function(callback) {
				if($("#route_tab").attr("class")=="active"){
					AutoUpdater.stop();
					window.currentInstanceType='route';
					AutoUpdater.start();
				}
				var self = this;
				// 调用vmsservice的取数据方法去取得需要的数据
				PrivateNetwork.service.listAll(function onSuccess(instances){
					if (AutoUpdater.datas.length!=instances.length && PrivateNetwork.dtTable!=null){
						PrivateNetwork.dtTable.updateData(instances);
					}
					AutoUpdater.datas = instances;
					self.cache = self.instances;
					self.instances = [];
					$(instances).each(function(i,instance){
						self.instances["" + instance.id] = instance;
						// 设置回掉
						if(callback && typeof callback == 'function') {
							callback(instance);
						}
					});
					
				});
			},
			getInterval:function() {
				 return mainWindowUpdateTime;
			}
		},
		"route" : {
			cache : [],							
			instances : [],						
			isNeedUpdate : function(instance) {
				
				var oldInstance = this.cache["" + instance.id];
				if(!oldInstance) return true;
				
				if(oldInstance.status != instance.status) return true;		// 当实例状态发生变化时更新数据
				
				return false;
			},
			update : function(instance) {
				// 这里结合虚拟机的例子，每个数据在datatable中展示为1行，且行有个属性叫做instanceId
				// 所以，可以根据instanceId找到要更新的行
				var row = $("#instanceTable_wrapper tr[instanceid='"+instance.id+"']");
				if(row && Route.dtTable) {
					// 找到之后，调用datatable的api，更新相应的行数据
					// 注意，这个api是刚加上去的，所以一定要确保我们的ui库的js是最新的(com.skyform.component.js)
					Route.dtTable.updateRow(row,instance);
				}
			},
			fetchData : function(callback) {
				if($("#private_net_tab").attr("class")=="active"){
					AutoUpdater.stop();
					window.currentInstanceType='subnet';
					AutoUpdater.start();
				}
				var self = this;
				// 调用vmsservice的取数据方法去取得需要的数据
				Route.service.listAll(function onSuccess(instances){
//					if (AutoUpdater.datas.length!=instances.length && Route.dtTable!=null){
//						Route.dtTable.updateData(instances);
//					}
//					AutoUpdater.datas = instances;
					self.cache = self.instances;
					self.instances = [];
					if(Route.data.length != instances.length) {
						Route.dtTable.updateData(instances);
					}
					else {
						$(instances).each(function(i,instance){
							self.instances["" + instance.id] = instance;
							// 设置回掉
							if(callback && typeof callback == 'function') {
								callback(instance);
							}
						});
					}

					
				});
			},
			getInterval:function() {
				 return mainWindowUpdateTime;
			}
		},
		"route_natrule" : {
			cache : [],							
			instances : [],						
			isNeedUpdate : function(instance) {
				
				var oldInstance = this.cache["" + instance.id];
				if(!oldInstance) return true;
				
				if(oldInstance.state != instance.state) return true;		// 当实例状态发生变化时更新数据
				
				return false;
			},
			update : function(instance) {
				if("route_natrule" != window.currentInstanceType)return;
				// 这里结合虚拟机的例子，每个数据在datatable中展示为1行，且行有个属性叫做instanceId
				// 所以，可以根据instanceId找到要更新的行
				var row = $("#natrule tr[ruleid='"+instance.id+"']");
				if(row && instance) {
					// 找到之后，调用datatable的api，更新相应的行数据
					// 注意，这个api是刚加上去的，所以一定要确保我们的ui库的js是最新的(com.skyform.component.js)
//					Route.dtTable.updateRow(row,instance);
					row.empty();
					var route_natruletr = NatCfg._generateContent(instance);
					row.html(route_natruletr);
					NatCfg._bindEventForBtns(row, instance);
				}
			},
			fetchData : function(callback) {
				if("route_natrule" != window.currentInstanceType)return;
				var ruteId = AutoUpdater.parentid;
				if($("#FormWindow").attr("class")!=undefined && $("#FormWindow").attr("class").indexOf("in")==-1){
					AutoUpdater.stop();
					window.currentInstanceType='route';
					AutoUpdater.start();
				}
				var self = this;
				// 调用Route.service.的取数据方法listNatRulesByRoute去取得需要的数据
				Route.service.listNatRulesByRoute(ruteId,function onSuccess(instances){
					if (AutoUpdater.datas.length>instances.length){
						NatCfg.init(AutoUpdater.parentid);
					}
					AutoUpdater.datas = instances;
					self.cache = self.instances;
					self.instances = [];
					$(instances).each(function(i,instance){
						self.instances["" + instance.id] = instance;
						// 设置回掉
						if(callback && typeof callback == 'function') {
							callback(instance);
						}
					});
					
				});
			},
			getInterval:function() {
				 return subWindowUpdateTime;
			}
		},
		"ip" :{
			cache : [],								// 之前缓存的数据
			instances : [],							// 当前获取的最新的数据
			isNeedUpdate : function(instance) {
				
				var oldInstance = this.cache[""+instance.id];
				if(!oldInstance) return true;					
				if(oldInstance.state != instance.state) return true;		// 当实例状态发生变化时更新数据
				
				if(oldInstance.optState != instance.optState) return true;	// 当操作状态发声变化时，告诉需要更新数据
				
				return false;
			},
			update : function(instance) {
				// 这里结合虚拟机的例子，每个数据在datatable中展示为1行，且行有个属性叫做instanceId
				// 所以，可以根据instanceId找到要更新的行
				var row = $("#eipTable tr[instanceid='"+instance.id+"']");
				if(row && eip.datatable) {
					var checked = $("input[type='checkbox']",row).attr("checked");
					// 找到之后，调用datatable的api，更新相应的行数据
					// 注意，这个api是刚加上去的，所以一定要确保我们的ui库的js是最新的(com.skyform.component.js)
					eip.datatable.updateRow(row,instance,checked);
				}
			},
			fetchData : function(callback) {
				var self = this;
				com.skyform.service.EipService.listAll(function(instances){
					eip.instances = instances;
					self.cache = self.instances;
					self.instances = [];
					if(eip.instances.length != instances.length) {
						eip.updateDataTable();
					}
					else {
						$(instances).each(function(i,instance){
							self.instances["" + instance.id] = instance;
							// 设置回掉
							if(callback && typeof callback == 'function') {
								callback(instance);
							}
						});		
					}						
				});
			},
			getInterval:function() {
				 return mainWindowUpdateTime;
			},
			isAuto : function(){
				var ret = true;
				$(eip.instances).each(function(i,instance){
					if('running'!=instance.state&&'using'!=instance.state&&(null!=instance.optState||''!=instance.optState)){
						ret = true;
						return false;
					}
					else if(eip.instances.length -1 == i){
						ret = false;
					}
				})
				return ret;
			}
		},
		"lb" :{
			cache : [],								// 之前缓存的数据
			instances : [],							// 当前获取的最新的数据
			isNeedUpdate : function(instance) {
				
				var oldInstance = this.cache[""+instance.id];
				if(!oldInstance) return true;					
				if(oldInstance.state != instance.state) return true;		// 当实例状态发生变化时更新数据
				
				if(oldInstance.optState != instance.optState) return true;	// 当操作状态发声变化时，告诉需要更新数据
				
				return false;
			},
			update : function(instance) {
				// 这里结合虚拟机的例子，每个数据在datatable中展示为1行，且行有个属性叫做instanceId
				// 所以，可以根据instanceId找到要更新的行
				var row = $("#lbTable tr[instanceid='"+instance.id+"']");
				if(row && lb.datatable) {
					var checked = $("input[type='checkbox']",row).attr("checked");
					// 找到之后，调用datatable的api，更新相应的行数据
					// 注意，这个api是刚加上去的，所以一定要确保我们的ui库的js是最新的(com.skyform.component.js)
					lb.datatable.updateRow(row,instance,checked);
				}
			},
			fetchData : function(callback) {
				var self = this;				
				com.skyform.service.LBService.listAll(function(instances){
					if (instances&&AutoUpdater.datas.length!=instances.length){
						lb.datatable.updateData(instances);
						lb.checkSelected();//初始化按钮置灰
					}
					AutoUpdater.datas = instances;
					self.cache = self.instances;
					self.instances = [];
					$(instances).each(function(i,instance){
						self.instances["" + instance.id] = instance;
						// 设置回掉
						if(callback && typeof callback == 'function') {
							callback(instance);
						}
					});
				});
			},
			getInterval:function() {
				 return mainWindowUpdateTime;
			},
			isAuto : function(){
				var ret = true;				
				return ret;
			}
		},
		"lb_member" :{
			cache : [],								// 之前缓存的数据
			instances : [],							// 当前获取的最新的数据
			isNeedUpdate : function(instance) {
				var oldInstance = this.cache["" + instance.id];
				if(!oldInstance) return true;
				
				if(oldInstance.state != instance.state) return true;		// 当实例状态发生变化时更新数据
				
				return false;
			},
			update : function(instance) {
				if("lb_member" != window.currentInstanceType)return;
				// 所以，可以根据instanceId找到要更新的行
				var row = $("#lbRule_modify tr[ruleid='"+instance.id+"']");
				if(row) {
					// 找到之后，调用modifyFirewall的_generateContent，更新相应的行数据
					row.empty();
					var state = ''+instance.state;
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
					var ruletr = $(							
							"<td>" + instance.name + "</td>" + 
							"<td>" + instance.port + "</td>" + 	
							"<td>" + instance.protocol + "</td>" + 
							"<td>"+ stateMsg +"</td>" +
							"<td><a class='btn btn-del btn-danger '>删除</a></td>"
					);					
					row.html(ruletr);
					ruletr.find(".btn-del").unbind().click(function(){		
						lb.deleteRule(instance.id);
					});
					//modifyFirewall._bindEventForBtns(row, instance);
				}
			},
			fetchData : function(callback) {
				if("lb_member" != window.currentInstanceType)return;
				var firewallId = lb.lbId;
				if($("#modifyLbRule").attr("class").indexOf("in")==-1){
					AutoUpdater.stop();
					window.currentInstanceType='lb';
					AutoUpdater.start();
				}
				var self = this;
				//查询规则
				//VM.firewallService.listRulesByFirewall(firewallId,function(rules){				
				Dcp.biz.apiRequest("/instance/lb/describeLbRuleVM", {firewallId : firewallId}, function(data){
					if(data.code == "0"){
						var rules = data.data;
						if (rules)
						{
							if (rules.length!=AutoUpdater.datas.length){
								lb.modifyRuleShow();
							}
							AutoUpdater.datas = rules;
							self.cache = self.instances;
							self.instances = [];
							$(rules).each(function(i,rule){
								self.instances["" + rule.id] = rule;
								// 设置回掉
								if(callback && typeof callback == 'function') {
									callback(rule);
								}
							});
							
						}
						
					}					
				});
			},
			getInterval:function() {
				 return subWindowUpdateTime;
			}
		
		},
		"mr" : {
			cache : [],							
			instances : [],						
			isNeedUpdate : function(instance) {
				var oldInstance = this.cache["" + instance.id];
				if(!oldInstance) return true;
				
				if(oldInstance.state != instance.state) return true;		// 当实例状态发生变化时更新数据
				
				return false;
			},
			update : function(instance) {
				// 这里结合虚拟机的例子，每个数据在datatable中展示为1行，且行有个属性叫做instanceId
				// 所以，可以根据instanceId找到要更新的行
				var row = $("#monitorRuleTable_wrapper tr[instanceid='"+instance.id+"']");
				if(row && MonitorRule.dtTable) {
					// 找到之后，调用datatable的api，更新相应的行数据
					// 注意，这个api是刚加上去的，所以一定要确保我们的ui库的js是最新的(com.skyform.component.js)
					MonitorRule.dtTable.updateRow(row,instance);
				}
			},
			fetchData : function(callback) {
				if($("#monitorRule_health_tab").attr("class")=="active"){
					AutoUpdater.stop();
					window.currentInstanceType='submr';
					AutoUpdater.start();
				}
				var self = this;
				// 调用vmsservice的取数据方法去取得需要的数据
				var condation={"resourcePool":$("#pool").val()};
				MonitorRule.service.listLbHealthMonitor(condation,function onSuccess(instances){
					self.cache = self.instances;
					self.instances = [];
					if(MonitorRule.data.length != instances.length) {
						MonitorRule._refreshDtTable(instances);
					}
					else {
						$(instances).each(function(i,instance){
							self.instances["" + instance.id] = instance;
							// 设置回掉
							if(callback && typeof callback == 'function') {
								callback(instance);
							}
						});
						var firstRow = $("#monitorRuleTable tbody").find("tr:eq(0)");
						firstRow.find("td[name='id'] input[type='checkbox']").attr("checked", true);
						MonitorRule.onInstanceSelected(); 
					}
				});
				if($("#mrModal").attr("class")=="modal hide fade in"){
					var lbLbHealthMonitorId=MonitorRule.getCheckedArr().attr("value");
					if(lbLbHealthMonitorId==null||lbLbHealthMonitorId==undefined){
						$("#mrModal").modal("hide");
						return;
					}
					var params={
							lbLbHealthMonitorId:lbLbHealthMonitorId
					};
					MonitorRule.service.bindLbList(params,function onSuccess(data){
							if(data==undefined){
								 return;
							 }
							if(MonitorRule.mrDataTableOld != null){
								MonitorRule.mrDataTableOld.updateData(data);
							} else {
								MonitorRule.mrDataTableOld =  new com.skyform.component.DataTable();
								MonitorRule.attachOldDataTable(data);
							}
					},function onError(msg){
				    	$.growlUI("提示", "查询已授权负载均衡失败：" + msg);
				    });
					MonitorRule.service.unBindLbList(function onSuccess(data){
							if(data==undefined){
								 return;
							 }
							if(MonitorRule.mrDataTable != null){
								MonitorRule.mrDataTable.updateData(data);
							} else {
								MonitorRule.mrDataTable =  new com.skyform.component.DataTable();
								MonitorRule.attachDataTable(data);
							}
					},function onError(msg){
				    	$.growlUI("提示", "查询未授权负载均衡失败：" + msg); 
				    });
				}
			},
			getInterval:function() {
				 return mainWindowUpdateTime;
			}
		},
		"submr" : {
			cache : [],								// 之前缓存的数据
			instances : [],							// 当前获取的最新的数据
			isNeedUpdate : function(instance) {
				var oldInstance = this.cache["" + instance.vmId];
				if(!oldInstance) return true;
				
				if(oldInstance.state != instance.state) return true;		// 当实例状态发生变化时更新数据
				
				return false;
			},
			update : function(instance) {
				// 这里结合虚拟机的例子，每个数据在datatable中展示为1行，且行有个属性叫做instanceId
				// 所以，可以根据instanceId找到要更新的行
				var row = $("#private_vmHealthy_instanceTable_wrapper tr[instanceId='"+instance.id+"']");
				if(row && VmHealthyMonitor.dtTable) {
					// 找到之后，调用datatable的api，更新相应的行数据
					// 注意，这个api是刚加上去的，所以一定要确保我们的ui库的js是最新的(com.skyform.component.js)
					VmHealthyMonitor.dtTable.updateRow(row,instance);
				}
			},
			fetchData : function(callback) {
				if($("#monitorRule_tab").attr("class")=="active"){
					AutoUpdater.stop();
					window.currentInstanceType='mr';
					AutoUpdater.start();
				}
				var self = this;
				// 调用vmsservice的取数据方法去取得需要的数据
				var condation={"resourcePool":$("#pool").val()}
				VmHealthyMonitor.mrService.describeVMHealthCondition(condation,function onSuccess(instances){
					if (AutoUpdater.datas.length!=instances.length && VmHealthyMonitor.dtTable!=null){
						VmHealthyMonitor.dtTable.updateData(instances);
					}
					AutoUpdater.datas = instances;
					self.cache = self.instances;
					self.instances = [];
					$(instances).each(function(i,instance){
						self.instances["" + instance.id] = instance;
						// 设置回掉
						if(callback && typeof callback == 'function') {
							callback(instance);
						}
					});
					
				});
			},
			getInterval:function() {
				 return mainWindowUpdateTime;
			}
		},
		"vScan" : {
			cache : [],							
			instances : [],						
			isNeedUpdate : function(instance) {
				var oldInstance = this.cache["" + instance.id];
				if(!oldInstance) return true;
				
				if(oldInstance.state != instance.state) return true;		// 当实例状态发生变化时更新数据
				
				return false;
			},
			update : function(instance) {
				// 这里结合虚拟机的例子，每个数据在datatable中展示为1行，且行有个属性叫做instanceId
				// 所以，可以根据instanceId找到要更新的行
				var row = $("#scanTable_wrapper tr[instanceid='"+instance.id+"']");
				if(row && ScanRule.dtTable) {
					// 找到之后，调用datatable的api，更新相应的行数据
					// 注意，这个api是刚加上去的，所以一定要确保我们的ui库的js是最新的(com.skyform.component.js)
					ScanRule.dtTable.updateRow(row,instance);
				}
			},
			fetchData : function(callback) {
				if($("#scanResult_tab").attr("class")=="active"){
					AutoUpdater.stop();
					window.currentInstanceType='subvScan';
					AutoUpdater.start();
				}
				var self = this;
				// 调用vmsservice的取数据方法去取得需要的数据
				var condation={};//var condation={"resourcePool":$("#pool").val()};
				ScanRule.service.describeScanner(condation,function onSuccess(instances){//listLbHealthMonitor
					self.cache = self.instances;
					self.instances = [];
					if(ScanRule.data.length != instances.length) {
						ScanRule._refreshDtTable(instances);
					}
					else {
						$(instances).each(function(i,instance){
							self.instances["" + instance.id] = instance;
							// 设置回掉
							if(callback && typeof callback == 'function') {
								callback(instance);
							}
						});
						var firstRow = $("#scanTable tbody").find("tr:eq(0)");
						firstRow.find("td[name='id'] input[type='checkbox']").attr("checked", true);
						ScanRule.onInstanceSelected(); 
					}
				});
				/*if($("#mrModal").attr("class")=="modal hide fade in"){
					var lbLbHealthMonitorId=ScanRule.getCheckedArr().attr("value");
					if(lbLbHealthMonitorId==null||lbLbHealthMonitorId==undefined){
						$("#mrModal").modal("hide");
						return;
					}
					var params={
							lbLbHealthMonitorId:lbLbHealthMonitorId
					};
					ScanRule.service.bindLbList(params,function onSuccess(data){
							if(data==undefined){
								 return;
							 }
							if(ScanRule.mrDataTableOld != null){
								ScanRule.mrDataTableOld.updateData(data);
							} else {
								ScanRule.mrDataTableOld =  new com.skyform.component.DataTable();
								ScanRule.attachOldDataTable(data);
							}
					},function onError(msg){
				    	$.growlUI("提示", "查询已授权负载均衡失败：" + msg);
				    });
				}*/
			},
			getInterval:function() {
				 return mainWindowUpdateTime;
			}
		},
		"subvScan" : {
			cache : [],								// 之前缓存的数据
			instances : [],							// 当前获取的最新的数据
			isNeedUpdate : function(instance) {
				var oldInstance = this.cache["" + instance.vmId];
				if(!oldInstance) return true;
				
				if(oldInstance.state != instance.state) return true;		// 当实例状态发生变化时更新数据
				
				return false;
			},
			update : function(instance) {
				// 这里结合虚拟机的例子，每个数据在datatable中展示为1行，且行有个属性叫做instanceId
				// 所以，可以根据instanceId找到要更新的行
				
				var row = $("#scan_result_instanceTable_wrapper tr[instanceId='"+instance.id+"']");
				if(row && ScanResult.dtTable) {
					// 找到之后，调用datatable的api，更新相应的行数据
					// 注意，这个api是刚加上去的，所以一定要确保我们的ui库的js是最新的(com.skyform.component.js)
					ScanResult.dtTable.updateRow(row,instance);
				}
			},
			fetchData : function(callback) {
				if($("#scan_tab").attr("class")=="active"){
					AutoUpdater.stop();
					window.currentInstanceType='vScan';
					AutoUpdater.start();
				}
				var self = this;
				// 调用vmsservice的取数据方法去取得需要的数据
				ScanResult.scanResultService.describeScannerResult({},function onSuccess(instances){
					if (AutoUpdater.datas.length!=instances.length && ScanResult.dtTable!=null){
						ScanResult.dtTable.updateData(instances);
					}
					AutoUpdater.datas = instances;
					self.cache = self.instances;
					self.instances = [];
					$(instances).each(function(i,instance){
						self.instances["" + instance.id] = instance;
						// 设置回掉
						if(callback && typeof callback == 'function') {
							callback(instance);
						}
					});
					
				});
			},
			getInterval:function() {
				 return mainWindowUpdateTime;
			}
		},
		"dp" : {
			cache : [],
			instances : [],
			isNeedUpdate : function(instance) {
				var oldInstance = this.cache["" + instance.id];
				if(!oldInstance) return true;

				if(oldInstance.state != instance.state) return true;		// 当实例状态发生变化时更新数据

				return false;
			},
			update : function(instance) {
				// 这里结合虚拟机的例子，每个数据在datatable中展示为1行，且行有个属性叫做instanceId
				// 所以，可以根据instanceId找到要更新的行
				var row = $("#IntP_instanceTable_wrapper tr[instanceid='"+instance.id+"']");
				if(row && IntPrevention.dtTable) {
					// 找到之后，调用datatable的api，更新相应的行数据
					// 注意，这个api是刚加上去的，所以一定要确保我们的ui库的js是最新的(com.skyform.component.js)
					IntPrevention.dtTable.updateRow(row,instance);
				}
			},
			fetchData : function(callback) {
				if($("#rq_tab").attr("class")=="active"){
					AutoUpdater.stop();
					window.currentInstanceType='subdp';
					AutoUpdater.start();
				}
				var self = this;
				var condation=IntPrevention.getCondition();
				if(IntPrevention.targetPage!=1){
					condation.params.targetPage=IntPrevention.targetPage;
				}
				IntPrevention.dpService.describeCloudWebProtectEvent(condation,function onSuccess(instances){
					self.cache = self.instances;
					self.instances = [];
					if(IntPrevention.data.length != instances.length) {
						IntPrevention._refreshDtTable(instances);
					}
					else {
						$(instances).each(function(i,instance){
							self.instances["" + instance.id] = instance;
							// 设置回掉
							if(callback && typeof callback == 'function') {
								callback(instance);
							}
						});
					}
				});
			},
			getInterval:function() {
				 return mainWindowUpdateTime;
			}
		},
		"subdp" : {
			cache : [],								// 之前缓存的数据
			instances : [],							// 当前获取的最新的数据
			isNeedUpdate : function(instance) {
				var oldInstance = this.cache["" + instance.vmId];
				if(!oldInstance) return true;

				if(oldInstance.state != instance.state) return true;		// 当实例状态发生变化时更新数据

				return false;
			},
			update : function(instance) {
				// 这里结合虚拟机的例子，每个数据在datatable中展示为1行，且行有个属性叫做instanceId
				// 所以，可以根据instanceId找到要更新的行

				var row = $("#dpTable_wrapper tr[instanceId='"+instance.id+"']");
				if(row && DeepPacket.dtTable) {
					// 找到之后，调用datatable的api，更新相应的行数据
					// 注意，这个api是刚加上去的，所以一定要确保我们的ui库的js是最新的(com.skyform.component.js)
					DeepPacket.dtTable.updateRow(row,instance);
				}
			},
			fetchData : function(callback) {
				if($("#web_tab").attr("class")=="active"){
					AutoUpdater.stop();
					window.currentInstanceType='dp';
					AutoUpdater.start();
				}
				var self = this;
				var condation=DeepPacket.getCondition();
				if(DeepPacket.targetPage!=1){
					condation.params.targetPage=DeepPacket.targetPage;
				}
				DeepPacket.service.describeCloudDefinderSecurity(condation,function onSuccess(instances){
					if (AutoUpdater.datas.length!=instances.length && DeepPacket.dtTable!=null){
						DeepPacket.dtTable.updateData(instances);
					}
					AutoUpdater.datas = instances;
					self.cache = self.instances;
					self.instances = [];
					$(instances).each(function(i,instance){
						self.instances["" + instance.id] = instance;
						// 设置回掉
						if(callback && typeof callback == 'function') {
							callback(instance);
						}
					});
				});
			},
			getInterval:function() {
				 return mainWindowUpdateTime;
			}
		},
	"vdisk" : {
		cache : [],								// 之前缓存的数据
		instances : [],							// 当前获取的最新的数据
		isNeedUpdate : function(instance){
			var oldInstance = this.cache["" + instance.id];
			if(!oldInstance) return true;
			if(oldInstance.state != instance.state) return true;		// 当实例状态发生变化时更新数据
			
			if(oldInstance.optState != instance.optState) return true;	// 当操作状态发声变化时，告诉需要更新数据
			return false;
		},
		update : function(instance){
			var row = $("#volumeTable tr[id='"+instance.id+"']");
			
			if(row && VdiskVolume.datatable) {
				var checked = $("input[type='checkbox']",row).attr("checked");
				
				VdiskVolume.datatable.updateRow(row,instance,checked);
				VdiskVolume.bindEvent();
			}
		},
		fetchData : function(callback){
			var self = this;
			var _user = "";
			var _targetPage=1;
			var _rowCount=5; 
			var _states = "opening,running,changing,deleting,using,error,create error,delete error,attach error,detach error";
			var params={};
			params.ownUserId=_user;
			params.states=_states;
			params.targetPage=_targetPage;
			params.rowCount=_rowCount;
			com.skyform.service.VdiskService4yaxin.listAll(params,function(instances){
				if (instances){
					$("#disktoolbar .operation").addClass("disabled");
					VdiskVolume.instances = instances;
					if(VdiskVolume.datatable==null){
						VdiskVolume.datatable= new com.skyform.component.DataTable();
						VdiskVolume.renderDataTable(VdiskVolume.instances);
					}else{
						VdiskVolume._updateData();
					}
				}
				AutoUpdater.datas = instances;
				self.cache = self.instances;
				VdiskVolume.instances = instances;
				self.instances = [];
				$(instances).each(function(i,instance){
					self.instances["" + instance.id] = instance;
					// 设置回掉
					if(callback && typeof callback == 'function') {
						callback(instance);
					}
				});				
			});
		},
		getInterval:function() {
			 return mainWindowUpdateTime;
		}					
	},	
	"nas" : {
		cache : [],								// 之前缓存的数据
		instances : [],							// 当前获取的最新的数据
		isNeedUpdate : function(instance){
			var oldInstance = this.cache[""+instance.id];
			if(!oldInstance) return true;
			if(oldInstance.state != instance.state) return true;		// 当实例状态发生变化时更新数据
			
			if(oldInstance.optState != instance.optState) return true;	// 当操作状态发声变化时，告诉需要更新数据
			return false;
		},
		update : function(instance){
			var row = $("#nasTable tr[id='"+instance.id+"']");
			if(row && nas.datatable) {
				var checked = $("input[type='checkbox']",row).attr("checked");
				nas.datatable.updateRow(row,instance,checked);
				nas.bindEvent();
			}
		},
		fetchData : function(callback){
			var self = this;
			var _user = "";
			var _states = "opening,running,changing,deleting,using,error,create error,delete error,attach error,detach error";
			com.skyform.service.NasService4yaxin.listAll(_user,_states,function(instances){
				if(instances){
					if (AutoUpdater.datas.length!=instances.length){
						nas.datatable.updateData(instances);
					}
					AutoUpdater.datas = instances;
					self.cache = self.instances;
					nas.instances = instances;								
					self.instances = [];
					$(instances).each(function(i,instance){
						self.instances["" + instance.id] = instance;
						// 设置回掉
						if(callback && typeof callback == 'function') {
							callback(instance);
						}
					});	
				}
			});
		},
		getInterval:function() {
		 return mainWindowUpdateTime;
		},
		isAuto : function(){
			var ret = true;
			$(nas.instances).each(function(i,instance){
				if('running'!=instance.state&&'using'!=instance.state&&(null!=instance.optState||''!=instance.optState)){
					ret = true;
					return false;
				}
				else if(nas.instances.length -1 == i){
					ret = false;
				}
			});
			return ret;
		}
		
		},
		"pm" : {
			cache : [],								// 之前缓存的数据
			instances : [],							// 当前获取的最新的数据			
			isNeedUpdate : function(instance) {
				
				var oldInstance = this.cache["" + instance.id];
				if(!oldInstance) return true;
				
				if(oldInstance.state != instance.state) return true;		// 当实例状态发生变化时更新数据
				
				if(oldInstance.optState != instance.optState) return true;	// 当操作状态发声变化时，告诉需要更新数据
				
				return false;
			},
			update : function(instance) {
				// 这里结合虚拟机的例子，每个数据在datatable中展示为1行，且行有个属性叫做instanceId
				// 所以，可以根据instanceId找到要更新的行
				var row = $("#tbody2 tr[instanceId='"+instance.id+"']");
				if(row && pm.datatable) {
					var checked = $("input[type='checkbox']",row).attr("checked");
					// 找到之后，调用datatable的api，更新相应的行数据
					// 注意，这个api是刚加上去的，所以一定要确保我们的ui库的js是最新的(com.skyform.component.js)
					pm.datatable.updateRow(row,instance,checked);
				}
			},
			fetchData : function(callback) {
				var self = this;
				// 调用vmsservice的取数据方法去取得需要的数据
				com.skyform.service.pmService.describePmInstances(function(instances){
					if (AutoUpdater.datas.length!=instances.length){
						pm.datatable.updateData(instances);
					}
					AutoUpdater.datas = instances;
					self.cache = self.instances;
					pm.instances = instances;
					self.instances = [];
					$(instances).each(function(i,instance){
						self.instances["" + instance.id] = instance;
						// 设置回掉
						if(callback && typeof callback == 'function') {
							callback(instance);
						}
					});
					
				});
			},
			getInterval:function() {
				 return mainWindowUpdateTime;
			}
		},
		"ment" : {
			cache : [],								// 之前缓存的数据
			instances : [],							// 当前获取的最新的数据			
			isNeedUpdate : function(instance) {
				
				var oldInstance = this.cache["" + instance.imageId];
				if(!oldInstance) return true;
				if(oldInstance.imageStatus != instance.imageStatus) return true;		// 当实例状态发生变化时更新数据
				
				return false;
			},
			update : function(instance) {
				// 这里结合虚拟机的例子，每个数据在datatable中展示为1行，且行有个属性叫做instanceId
				// 所以，可以根据instanceId找到要更新的行
				var row = $("#imageTable tr[instanceId='"+instance.imageId+"']");
				if(row && imageManagement.datatable) {
					var checked = $("input[type='checkbox']",row).attr("checked");
					// 找到之后，调用datatable的api，更新相应的行数据
					// 注意，这个api是刚加上去的，所以一定要确保我们的ui库的js是最新的(com.skyform.component.js)
					imageManagement.datatable.updateRow(row,instance,checked);
					imageManagement.checkSelected();
				}
			},
			fetchData : function(callback) {
				var self = this;
				// 调用vmsservice的取数据方法去取得需要的数据
				com.skyform.service.imageService.listImage(null,function(instances){
					imageManagement.instances = instances;
					if (AutoUpdater.datas.length!=instances.length){
						imageManagement.datatable.updateData(instances);
						imageManagement.checkSelected();
					}
					AutoUpdater.datas = instances;
					self.cache = self.instances;
					imageManagement.instances = instances;
					self.instances = [];
					$(instances).each(function(i,instance){
						self.instances["" + instance.imageId] = instance;
						// 设置回掉
						if(callback && typeof callback == 'function') {
							callback(instance);
						}
					});
					
				});
			},
			getInterval:function() {
				 return mainWindowUpdateTime;
			}
		},
		"snap" : {
			cache : [],								// 之前缓存的数据
			instances : [],							// 当前获取的最新的数据			
			isNeedUpdate : function(instance) {
				var oldInstance = this.cache["" + instance.id];
				if(!oldInstance) return true;
				if(oldInstance.status != instance.status) return true;		// 当实例状态发生变化时更新数据
				return false;
			},
			update : function(instance) {
				// 这里结合虚拟机的例子，每个数据在datatable中展示为1行，且行有个属性叫做instanceId
				// 所以，可以根据instanceId找到要更新的行
				var row = $("#lbTable tr[instanceId='"+instance.snapID+"']");
				if(row && lb.datatable) {
					var checked = $("input[type='checkbox']",row).attr("checked");
					// 找到之后，调用datatable的api，更新相应的行数据
					// 注意，这个api是刚加上去的，所以一定要确保我们的ui库的js是最新的(com.skyform.component.js)
					lb.datatable.updateRow(row,instance,checked);
				}
			},
			fetchData : function(callback) {
				var self = this;
				// 调用vmsservice的取数据方法去取得需要的数据
				com.skyform.service.snap.searchSnap({vmid:$("#vmid").val()},function(instances){
					var flag = false;
					for(var i=0;i<instances.length;i++){
						if(instances[i].status == "opening"){
							flag = true;
							break;
						}
					}
					if(!flag)
						$("#createSnap").removeClass("disabled");
					if (AutoUpdater.datas.length!=instances.length){
						lb.datatable.updateData(instances);
					}
					AutoUpdater.datas = instances;
					self.cache = self.instances;
//					snap.instances = instances;
					self.instances = [];
					$(instances).each(function(i,instance){
						self.instances["" + instance.snapID] = instance;
						// 设置回掉
						if(callback && typeof callback == 'function') {
							callback(instance);
						}
					});
					
				});
			},
			getInterval:function() {
				 return mainWindowUpdateTime;
			}
		},
		"desktop" :{
			cache : [],								// 之前缓存的数据
			instances : [],							// 当前获取的最新的数据			
			isNeedUpdate : function(instance) {
				var oldInstance = this.cache["" + instance.id];
				if(!oldInstance) return true;
				if(oldInstance.state != instance.state) return true;		// 当实例状态发生变化时更新数据
				
				if(oldInstance.optState != instance.optState) return true;	// 当操作状态发声变化时，告诉需要更新数据
				return false;
			},
			update : function(instance) {
				var row = $("#volumeTable tr[id='"+instance.id+"']");
				
				if(row && Desktop.datatable) {
					var checked = $("input[type='checkbox']",row).attr("checked");
					
					Desktop.datatable.updateRow(row,instance,checked);
					Desktop.bindEvent();
				}
			},
			fetchData : function(callback) {
				var self = this;
				com.skyform.service.desktopService.listAll(function(instances) {
					if(instances){
						Desktop.instances = instances;
						self.cache = self.instances;
						self.instances = [];
						$(instances).each(function(i, instance) {
							self.instances["" + instance.id] = instance;
							// 设置回掉
							if (callback && typeof callback == 'function') {
								callback(instance);
							}
						});
						if (Desktop.instances.length != instances.length)
							Desktop.updateDataTable();
					}					
				});
			},
			getInterval : function() {
				return mainWindowUpdateTime;
			}
		},
		"multiCard" : {
			cache : [],								// 之前缓存的数据
			instances : [],							// 当前获取的最新的数据			
			isNeedUpdate : function(instance) {
				
				var oldInstance = this.cache["" + instance.id];
				if(!oldInstance) return true;
				if(oldInstance.status != instance.status) return true;		// 当实例状态发生变化时更新数据
				
				return false;
			},
			update : function(instance) {
				// 这里结合虚拟机的例子，每个数据在datatable中展示为1行，且行有个属性叫做instanceId
				// 所以，可以根据instanceId找到要更新的行
				var row = $("#multiTable tr[instanceId='"+instance.id+"']");
				if(row && multiNIC.datatable) {
					var checked = $("input[type='checkbox']",row).attr("checked");
					// 找到之后，调用datatable的api，更新相应的行数据
					// 注意，这个api是刚加上去的，所以一定要确保我们的ui库的js是最新的(com.skyform.component.js)
					multiNIC.datatable.updateRow(row,instance,checked);
					multiNIC.checkSelected();
				}
			},
			fetchData : function(callback) {
				var self = this;
				// 调用vmsservice的取数据方法去取得需要的数据
				var params={};
				params.targetPage=1;
				params.rowCount=5;
				multiNIC.service.listNetWorkCards(params, function(instances) {
					if(instances){
						multiNIC.instances = instances;	
						multiNIC.renderDataTable();
						AutoUpdater.datas = instances;
						self.cache = self.instances;
						self.instances = [];
						$(instances).each(function(i,instance){
							self.instances["" + instance.id] = instance;
							// 设置回掉
							if(callback && typeof callback == 'function') {
								callback(instance);
							}
						});
					}
				});		
//				com.skyform.service.multiCardService.listNetWorkCards(null,function(instances){
//					if (AutoUpdater.datas.length!=instances.length){
//						multiNIC.datatable.updateData(instances);
//						multiNIC.checkSelected();
//					}
//					AutoUpdater.datas = instances;
//					self.cache = self.instances;
//					self.instances = [];
//					$(instances).each(function(i,instance){
//						self.instances["" + instance.id] = instance;
//						// 设置回掉
//						if(callback && typeof callback == 'function') {
//							callback(instance);
//						}
//					});
//					
//				});
			},
			getInterval:function() {
				 return mainWindowUpdateTime;
			}
		},
		"securityGroup":{
			cache : [],								// 之前缓存的数据
			instances : [],							// 当前获取的最新的数据			
			isNeedUpdate : function(instance) {
				
				var oldInstance = this.cache["" + instance.id];
				if(!oldInstance) return true;
				
				return false;
			},
			update : function(instance) {
				// 这里结合虚拟机的例子，每个数据在datatable中展示为1行，且行有个属性叫做instanceId
				// 所以，可以根据instanceId找到要更新的行
				var row = $("#firewallTable tr[instanceId='"+instance.id+"']");
				if(row) {
					var checked = $("input[type='checkbox']",row).attr("checked");
					// 找到之后，调用datatable的api，更新相应的行数据
					// 注意，这个api是刚加上去的，所以一定要确保我们的ui库的js是最新的(com.skyform.component.js)
					firewall.datatable.updateRow(row,instance,checked);
				}
			},
			fetchData : function(callback) {
				$(".operation").addClass("disabled");
				var self = this;
				// 调用vmsservice的取数据方法去取得需要的数据
				com.skyform.service.FirewallService.querySG(function(instances){		
//					instances.splice(instances.length-1,1);
					firewall.datatable.updateData(instances);
					AutoUpdater.datas = instances;
					self.cache = self.instances;
					self.instances = [];
					$(instances).each(function(i,instance){
						self.instances["" + instance.id] = instance;
						// 设置回掉
						if(callback && typeof callback == 'function') {
							callback(instance);
						}
					});
					
				});
			},
			getInterval:function() {
				 return mainWindowUpdateTime;
			}
		
		},
		"desktopCloud":{
			cache : [],								// 之前缓存的数据
			instances : [],							// 当前获取的最新的数据			
			isNeedUpdate : function(instance) {
				var oldInstance = this.cache["" + instance.id];
				if(!oldInstance) return true;
				
				return false;
			},
			update : function(instance) {
				// 这里结合虚拟机的例子，每个数据在datatable中展示为1行，且行有个属性叫做instanceId
				// 所以，可以根据instanceId找到要更新的行
				var row = $("#desktopCloudTable tr[instanceId='"+instance.id+"']");
				if(row) {
					var checked = $("input[type='checkbox']",row).attr("checked");
					// 找到之后，调用datatable的api，更新相应的行数据
					// 注意，这个api是刚加上去的，所以一定要确保我们的ui库的js是最新的(com.skyform.component.js)
					desktopCloud.dtTable.updateRow(row,instance,checked);
				}
			},
			fetchData : function(callback) {
				$(".operation").addClass("disabled");
				var self = this;
				desktopCloud.init();
				
			},
			getInterval:function() {
				 return mainWindowUpdateTime;
			}		
		},
		"desktopmanage" : {
			
			cache : [],								// 之前缓存的数据
			instances : [],							// 当前获取的最新的数据			
			isNeedUpdate : function(instance) {
				//console.log('a');
				var oldInstance = this.cache["" + instance.id];
				if(!oldInstance) return true;
				
				if(oldInstance.state != instance.state) return true;		// 当实例状态发生变化时更新数据
				
				if(oldInstance.optState != instance.optState) return true;	// 当操作状态发声变化时，告诉需要更新数据
				
				return false;
			},
			update : function(instance) {
				//console.log('a');
				// 每个数据在datatable中展示为1行，且行有个属性叫做instanceId
				// 所以，可以根据instanceId找到要更新的行
				var row = $("#desktop_manager_instanceTable tr[instanceId='"+instance.id+"']");
				if(row && desktopmanage.dtTable) {
					var checked = $("input[type='checkbox']",row).attr("checked");
					// 找到之后，调用datatable的api，更新相应的行数据
					// 注意，这个api是刚加上去的，所以一定要确保我们的ui库的js是最新的(com.skyform.component.js)
					desktopmanage.dtTable.updateRow(row,instance,checked);
				}
			},
			fetchData : function(callback) {
				$(".operation").addClass("disabled");
				
				desktopmanage.refreshData();
				
			},
			getInterval:function() {
				 return mainWindowUpdateTime;
			}
		},
		"desktopCloud4Sijie":{
			cache : [],								// 之前缓存的数据
			instances : [],							// 当前获取的最新的数据			
			isNeedUpdate : function(instance) {
				var oldInstance = this.cache["" + instance.id];
				if(!oldInstance) return true;
				
				return false;
			},
			update : function(instance) {
				// 这里结合虚拟机的例子，每个数据在datatable中展示为1行，且行有个属性叫做instanceId
				// 所以，可以根据instanceId找到要更新的行
				var row = $("#desktopCloudTable tr[instanceId='"+instance.id+"']");
				if(row) {
					var checked = $("input[type='checkbox']",row).attr("checked");
					// 找到之后，调用datatable的api，更新相应的行数据
					// 注意，这个api是刚加上去的，所以一定要确保我们的ui库的js是最新的(com.skyform.component.js)
					desktopCloud.dtTable.updateRow(row,instance,checked);
				}
			},
			fetchData : function(callback) {
				if($("#desktop_distribution_tab").attr("class")=="active"){
					AutoUpdater.stop();
					window.currentInstanceType='desktopDistribution4Sijie';
					AutoUpdater.start();
				}else if($("#desktop_manager_tab").attr("class")=="active"){
					AutoUpdater.stop();
					window.currentInstanceType='desktopmanage4Sijie';
					AutoUpdater.start();
				}else if($("#desktop_dataDesk_tab").attr("class")=="active"){
					AutoUpdater.stop();
					window.currentInstanceType='desktopdataDesk4Sijie';
					AutoUpdater.start();
				}else{
				  desktopCloud.refreshData();
				}
			},
			getInterval:function() {
				 return mainWindowUpdateTime;
			}		
		},
		"desktopdataDesk4Sijie" : {
			cache : [],								// 之前缓存的数据
			instances : [],							// 当前获取的最新的数据			
			isNeedUpdate : function(instance) {
				//console.log('a');
				var oldInstance = this.cache["" + instance.id];
				if(!oldInstance) return true;
				
				if(oldInstance.state != instance.state) return true;		// 当实例状态发生变化时更新数据
				
				if(oldInstance.optState != instance.optState) return true;	// 当操作状态发声变化时，告诉需要更新数据
				
				return false;
			},
			update : function(instance) {
				//console.log('a');
				// 每个数据在datatable中展示为1行，且行有个属性叫做instanceId
				// 所以，可以根据instanceId找到要更新的行
				var row = $("#desktop_dataDesk_instanceTable tr[instanceId='"+instance.id+"']");
				if(row && desktopDataDesk.dtTable) {
					var checked = $("input[type='checkbox']",row).attr("checked");
					// 找到之后，调用datatable的api，更新相应的行数据
					// 注意，这个api是刚加上去的，所以一定要确保我们的ui库的js是最新的(com.skyform.component.js)
					desktopDataDesk.dtTable.updateRow(row,instance,checked);
				}
			},
			fetchData : function(callback) {
				if($("#desktop_distribution_tab").attr("class")=="active"){
					AutoUpdater.stop();
					window.currentInstanceType='desktopDistribution4Sijie';
					AutoUpdater.start();
				}else if($("#desktopCloud_tab").attr("class")=="active"){
					AutoUpdater.stop();
					window.currentInstanceType='desktopCloud4Sijie';
					AutoUpdater.start();
				}else if($("#desktop_manager_tab").attr("class")=="active"){
					AutoUpdater.stop();
					window.currentInstanceType='desktopmanage4Sijie';
					AutoUpdater.start();
				}else{
				   desktopDataDesk.refreshData();
				}
				
			},
			getInterval:function() {
				 return mainWindowUpdateTime;
			}
		},
		"desktopmanage4Sijie" : {
			
			cache : [],								// 之前缓存的数据
			instances : [],							// 当前获取的最新的数据			
			isNeedUpdate : function(instance) {
				//console.log('a');
				var oldInstance = this.cache["" + instance.id];
				if(!oldInstance) return true;
				
				if(oldInstance.subServiceStatus != instance.subServiceStatus) return true;		// 当实例状态发生变化时更新数据
				
				if(oldInstance.optState != instance.optState) return true;	// 当操作状态发声变化时，告诉需要更新数据
				
				return false;
			},
			update : function(instance) {
				//console.log('a');
				// 每个数据在datatable中展示为1行，且行有个属性叫做instanceId
				// 所以，可以根据instanceId找到要更新的行
				var row = $("#desktop_manager_instanceTable tr[instanceId='"+instance.id+"']");
				if(row && desktopmanage.dtTable) {
					var checked = $("input[type='radio']",row).attr("checked");
					// 找到之后，调用datatable的api，更新相应的行数据
					// 注意，这个api是刚加上去的，所以一定要确保我们的ui库的js是最新的(com.skyform.component.js)
					desktopmanage.dtTable.updateRow(row,instance,checked);
				}
			},
			fetchData : function(callback) {
				if($("#desktop_distribution_tab").attr("class")=="active"){
					AutoUpdater.stop();
					window.currentInstanceType='desktopDistribution4Sijie';
					AutoUpdater.start();
				}else if($("#desktopCloud_tab").attr("class")=="active"){
					AutoUpdater.stop();
					window.currentInstanceType='desktopCloud4Sijie';
					AutoUpdater.start();
				}else if($("#desktop_dataDesk_tab").attr("class")=="active"){
					AutoUpdater.stop();
					window.currentInstanceType='desktopdataDesk4Sijie';
					AutoUpdater.start();
				} else {
                   $(".operation").addClass("disabled");
					var self = this;
					var params = {
						"serviceFactory" : "citrix",
						"cloudType" : "01",
						"userName" : "",
						"tenantName" : ""
					};
					if ($("#queryManagerStatus").val() == "2") {
						params.userName = $("#queryManagerName").val();
					}
					if ($("#queryManagerStatus").val() == "1") {
						params.userId = $("#queryManagerName").val();
					}
					com.skyform.service.desktopCloudService.queryNewCloudTab(
							params, function(instances) {
								if (AutoUpdater.datas.length != instances.length) {
									desktopmanage.dtTable.updateData(instances);
								}
								$("#desktop_manager_instanceTable_filter").addClass("hide");
								AutoUpdater.datas = instances;
								self.cache = self.instances;
								desktopmanage.data = instances;
								self.instances = [];
								$(instances).each(function(i, instance) {
									self.instances["" + instance.id] = instance;
									// 设置回掉
									if (callback && typeof callback == 'function') {
										callback(instance);
									}
								});

							});

				}
				
			},
			getInterval:function() {
				 return mainWindowUpdateTime;
			}
		},
		"desktopDistribution4Sijie" : {
			
			cache : [],								// 之前缓存的数据
			instances : [],							// 当前获取的最新的数据			
			isNeedUpdate : function(instance) {
				//console.log('a');
				var oldInstance = this.cache["" + instance.id];
				if(!oldInstance) return true;
				
				if(oldInstance.state != instance.state) return true;		// 当实例状态发生变化时更新数据
				
				if(oldInstance.optState != instance.optState) return true;	// 当操作状态发声变化时，告诉需要更新数据
				
				return false;
			},
			update : function(instance) {
				//console.log('a');
				// 每个数据在datatable中展示为1行，且行有个属性叫做instanceId
				// 所以，可以根据instanceId找到要更新的行
				var row = $("#distributionTable tr[instanceId='"+instance.id+"']");
				if(row && desktopDistribution.dtTable) {
					var checked = $("input[type='radio']",row).attr("checked");
					// 找到之后，调用datatable的api，更新相应的行数据
					// 注意，这个api是刚加上去的，所以一定要确保我们的ui库的js是最新的(com.skyform.component.js)
					desktopDistribution.dtTable.updateRow(row,instance,checked);
				}
			},
			fetchData : function(callback) {
				if($("#desktop_manager_tab").attr("class")=="active"){
					AutoUpdater.stop();
					window.currentInstanceType='desktopmanage4Sijie';
					AutoUpdater.start();
				}else if($("#desktopCloud_tab").attr("class")=="active"){
					AutoUpdater.stop();
					window.currentInstanceType='desktopCloud4Sijie';
					AutoUpdater.start();
				}else if($("#desktop_dataDesk_tab").attr("class")=="active"){
					AutoUpdater.stop();
					window.currentInstanceType='desktopdataDesk4Sijie';
					AutoUpdater.start();
				}else{
				   desktopDistribution.refreshData();
				}
				
			},
			getInterval:function() {
				 return mainWindowUpdateTime;
			}
		},
		"antiVirusRule":{
			cache : [],								// 之前缓存的数据
			instances : [],							// 当前获取的最新的数据
			isNeedUpdate : function(instance) {
				var oldInstance = this.cache["" + instance.id];
				if(!oldInstance) return true;
				return false;
			},
			update : function(instance) {
				var row = $("#ruleTable tr[subsid='"+instance.subsid+"']");
				if(row) {
					var checked = $("input[type='checkbox']",row).attr("checked");
					AntiVirusRule.datatable.updateRow(row,instance,checked);
				}
			},
			fetchData : function(callback) {
				$(".operation").addClass("disabled");
				if($("#scan-manager").attr("class").indexOf("active")>-1){
					AutoUpdater.stop();
					window.currentInstanceType='antiVirusScan';
					AutoUpdater.start();
				} else if($("#result").attr("class").indexOf("active")>-1){
					AutoUpdater.stop();
					window.currentInstanceType='antiVirusResult';
					AutoUpdater.start();
				} else {
					AntiVirusRule._refresh();
				}
			},
			getInterval:function() {
				 return mainWindowUpdateTime;
			}
		},
		"antiVirusScan":{
			cache : [],								// 之前缓存的数据
			instances : [],							// 当前获取的最新的数据
			isNeedUpdate : function(instance) {
				var oldInstance = this.cache["" + instance.id];
				if(!oldInstance) return true;
				return false;
			},
			update : function(instance) {
				var row = $("#scanTable tr[instanceid='"+instance.id+"']");
				if(row) {
					var checked = $("input[type='checkbox']",row).attr("checked");
					AntiVirusScan.datatable.updateRow(row,instance,checked);
				}
			},
			fetchData : function(callback) {
				$(".operation").addClass("disabled");
				if($("#rule-manager").attr("class").indexOf("active")>-1){
					AutoUpdater.stop();
					window.currentInstanceType='antiVirusRule';
					AutoUpdater.start();
				} else if($("#result").attr("class").indexOf("active")>-1){
					AutoUpdater.stop();
					window.currentInstanceType='antiVirusResult';
					AutoUpdater.start();
				} else {
					AntiVirusScan._refresh();
				}
			},
			getInterval:function() {
				 return mainWindowUpdateTime;
			}
		},
		"antiVirusResult":{
			cache : [],								// 之前缓存的数据
			instances : [],							// 当前获取的最新的数据
			isNeedUpdate : function(instance) {
				var oldInstance = this.cache["" + instance.id];
				if(!oldInstance) return true;
				return false;
			},
			update : function(instance) {
				var row = $("#resultTable tr[subsid='"+instance.subsid+"']");
				if(row) {
					var checked = $("input[type='checkbox']",row).attr("checked");
					AntiVirusResult.datatable.updateRow(row,instance,checked);
				}
			},
			fetchData : function(callback) {
				if($("#rule-manager").attr("class").indexOf("active")>-1){
					AutoUpdater.stop();
					window.currentInstanceType='antiVirusRule';
					AutoUpdater.start();
				} else if($("#scan-manager").attr("class").indexOf("active")>-1){
					AutoUpdater.stop();
					window.currentInstanceType='antiVirusScan';
					AutoUpdater.start();
				} else {
					AntiVirusResult._refresh();
				}
			},
			getInterval:function() {
				 return mainWindowUpdateTime;
			}
		}
	},
	start : function() {
		// 在启动自动更新器时，需要告诉当前的instance类型
		// 这就要求我们在每个实例初始之前告诉更新器类型
		// 虚拟机是这么做的：在vm.js的开头，加上这么一句话：window.currentInstanceType='vm';
		// 其他的类似
		//console.log('sddf');
		var currentInstanceType = window.currentInstanceType;
		var updater = AutoUpdater.updaters["" + currentInstanceType];
		if (updater) {
			updater.getInterval = updater.getInterval || function() {
				return subWindowUpdateTime;
			}
			updater.isAuto = updater.isAuto || function() {
				return false;
			}
			timer = window.setInterval(function() {
				// 获取数据
				if(updater.isAuto){
					updater.fetchData(function(instances) {
						$(instances).each(function(i,instance){
							// 检查是否需要更新
							if(updater.isNeedUpdate(instance)) {
								// 更新数据
								updater.update(instance);
							}
						});
					});
				}				
			}, updater.getInterval());
		}
	},
	stop:function(){
		window.clearInterval(timer);
	}
	
};
$(function(){
	AutoUpdater.start();
});
