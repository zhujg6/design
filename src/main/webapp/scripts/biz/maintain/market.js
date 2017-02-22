window.currentInstanceType='market';
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
		});
		var self = this;
		_options.container.unbind("mouseover").bind('mouseover', function() {
			self.inMenu = true;
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
		lb.describeLb();
		var inMenu = false;
		$("#btnRefresh").bind('click',function(){			
			lb.updateDataTable();
		});	
		$("body").bind('mousedown',function(){
			if(!inMenu){
				$("#contextMenu").hide();
			}
		});	
		var realValue;
		$("#btnCreateLb").bind('click',function(e){			
			lb.createLb();
		});	
	},	
	generateTable : function(data){
		lb.datatable = new com.skyform.component.DataTable();
		 lb.datatable.renderByData("#lbTable", {
				"data" : data,
				"pageSize" : 5,
				"onColumnRender" : function(columnIndex,columnMetaData,columnData) {
					 var text = columnData[''+columnMetaData.name] || "";
					 if(columnIndex ==0) {
						 text = '<input type="checkbox" value="'+text+'">';
					 }
					 if (columnMetaData.name == "activeTime"||columnMetaData.name == "inactiveTime") {
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
					 if (columnMetaData.name == "subscriptionName") {
						  text = '<a href="'+$('#path').val()+'/jsp/maintain/vm.jsp?code=vm&vmName='+text+'" style="color:blue;" target="_blank" title="点击查看虚拟机">'+text+'</a>';
					 }
					 if(columnMetaData.name == 'productName'){
						 text = columnData.productName
						  +"<a title='咨询建议' href='../user/workOrder.jsp?code=workOrder&cataCode=service&instanceId="+columnData.subscriptionId+"&serviceType=software&instanceName="+encodeURIComponent(columnData.productName)+
						  "&currentPoolW="+encodeURIComponent(CommonEnum.pools[CommonEnum.currentPool])+
						  "'><i class='icon-comments' ></i></a>";
					 }
					 return text;
				}, 
				"afterRowRender" : function(rowIndex,data,tr){
					tr.attr("subscriptionId", data.subscriptionId);
					
					tr.click(function(){
						lb.describeLbRuleById(data.subscriptionId);
					});					
				},      
				"afterTableRender" : function() {
					var firstRow = $("#lbTable tbody").find("tr:eq(0)");
					var	instanceId = firstRow.attr("subscriptionId");
					lb.describeLbRuleById(instanceId)
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
		if(selectInstance) {
			state = selectInstance.state;
		}
		$(".operation").each(function(index,operation){
			var condition = $(operation).attr("condition");			
			var action = $(operation).attr("action");
			var enabled = true;
			eval("enabled=("+condition+")");
			if(enabled) {
				$(operation).removeClass("disabled");
				$(operation).removeAttr("disabled");
			} else {
				$(operation).addClass("disabled");
				$(operation).attr("disabled","disabled");
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
		Dcp.biz.apiAsyncRequest("/software/querySoftWareList", null, function(data) {	
			if (data.code != "0") {
				$.growlUI("提示", "查询我的软件发生错误：" + data.msg); 
			} else {	
//					
					lb.instances = data.data;					
					lb.generateTable(data.data);
					if(data.data){
						if (data.data.length > 0){
							lb.firstRule = data.data[0].id;
						}						
					}
//				}
			}
		},function onError(){
			lb.generateTable();
		});		
	},
	describeLbRuleById : function(id){
		com.skyform.service.vmService.listRelatedInstances(id,function(data){
			data = $.parseJSON(data);
			lb.appendVmRelation(data,id);
			com.skyform.service.vmService.listIriRelation(id,function(data){
				lb.appendVmRelation(data,id);
			},function(e){
			});
		},function(e){
		});
		$("#opt_logs").empty();
		com.skyform.service.LogService.describeLogsUIInfo(id);
	},
	appendVmRelation : function(array,id) {
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
			VM.service.bindSecurityGroupToVm($(this).attr("value"),id,function (data){
				$.growlUI("提示",data.msg);
			},function onUpdateFailed(errorMsg){
				$.growlUI("错误",data.msg);
			})
		}).css("cursor","pointer");
	},
bindEvent : function() {
		$("#checkAll").unbind("click").bind("click", function(e) {
			var checked = $(this).attr("checked") || false;
	        $("#lbTable input[type='checkbox']").attr("checked",checked);	 
	        lb.checkSelected();
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
		Dcp.biz.apiAsyncRequest("/software/querySoftWareList", null, function(data) {
			if (data.code == 0) {
				lb.instances = data.data;
				lb.datatable.updateData(data.data);
			}
		});		
	},
	getCheckedArr : function() {
		return $("#lbTable tbody input[type='checkbox']:checked");
	}}