//当前刷新实例的类型为负载均衡监控

window.Controller = {
		init : function(){
			ScanRule.init();
		},
		refresh : function(){
		}
	}
window.currentInstanceType='vScan';
var ScanRule = {//网络漏洞扫描js模块
	data : [],
	dtTable : null,
	mrDataTableOld:null,
	newFormModal : null,
	contextMenu : null,
	scope : "vScan",
	instances : [],
	service:com.skyform.service.scanService,
	init : function(){
		ScanRule.refreshData();
		ScanRule._bindAction();//绑定按钮功能
		
	},
	///////////////////////////////////////////////////////////////////////////
	//	Actions  start
	///////////////////////////////////////////////////////////////////////////
	destroy : function(){
		var canDestoryRoute = true;
		if (canDestoryRoute){
			ConfirmWindow.setTitle("销毁网络漏洞扫描").setContent("<h4>确认要销毁所选网络漏洞扫描吗？</h4>").onSave = function(){
				var ruleIds = new Array();
				ruleIds = ScanRule.selectedInstanceId.split(",");	
				$(ruleIds).each(function(index, ruleId) {
				    var param = {subscriptionId:parseInt(ruleId)};
				    ScanRule.service.deleteScanner(param,function (data){
						$.growlUI("提示", "销毁网络漏洞扫描成功!");
						ConfirmWindow.hide();
						ScanRule.refreshData();
					},function (error){//删除不成功会执行此函数
						ErrorMgr.showError(error);
					});
				});
				ConfirmWindow.hide();
			};			
			ConfirmWindow.setWidth(500).autoAlign().setTop(100);
			ConfirmWindow.show();
		}
	},
	showDetails : function(instance){
	  if(!ScanRule.data || ScanRule.data.length < 1) return;
	  if(!instance) {
		  instance = ScanRule.data[0];
	  }
	  $("#opt_logs").empty();
	  com.skyform.service.LogService.describeLogsUIInfo(instance.id);
	},
	resetData:function(){
		$("#form_scanRule_name").val("");
	},
	refreshData : function(){
		if (ScanRule.dtTable)
			ScanRule.dtTable.container
					.find("tbody")
					.html(
							"<tr ><td colspan='7' style='text-align:center;'><img src='"
									+ CONTEXT_PATH
									+ "/images/loader.gif'/><strong>"+Dict.val("common_retrieving_data_please_wait")+"</strong></td></tr>");
		var condation={};
	    ScanRule.service.describeScanner(condation,function onSuccess(result){
	    	if(result){
	    		ScanRule.data = result;
	    		if(ScanRule.data.length>0){
	    			var firstInstanceId = ScanRule.data[0].id;		
	    			//ScanRule.getBindLbById(firstInstanceId);
	    			ScanRule.showDetails(ScanRule.data[0]);
	    		}
	    		ScanRule._refreshDtTable(ScanRule.data);
	    	}
		},function onError(msg){
			ErrorMgr.showError(msg);
		});
	},
	_bindAction : function(){
		$("div[scope='"+ScanRule.scope+"'] #toolbar .actionBtn").unbind().click(function(){
			if($(this).hasClass("disabled")) return;
			var action = $(this).attr("action");
			ScanRule._invokeAction(action);
		});
		$("#mr_save").unbind('click').bind("click",function(){
			ScanRule.saveScan();
		})
	},
	
	_invokeAction : function(action){
		var invoker = ScanRule["" + action];
		if(invoker && typeof invoker == 'function') {
			invoker();
		}
	},
	
	_refreshDtTable : function(data) {
		if(ScanRule.dtTable) {
			ScanRule.dtTable.updateData(data);
		} else {
			ScanRule.dtTable = new com.skyform.component.DataTable();
			ScanRule.dtTable.renderByData("#scanTable",{
				pageSize : 5,
				data : data,
				onColumnRender : function(columnIndex,columnMetaData,columnData){
					  if(columnMetaData.name=='ID') {
						return columnData.id;
					  } else if(columnMetaData.name=="id") {
			            return "<input type='checkbox' value='" + columnData["id"] +"'/>" ;
			          } else if (columnMetaData.name=="state") {
							return com.skyform.service.StateService.getState("vScan",
									columnData.optStatus || columnData.state);
					 }else if (columnMetaData.name == "createDate") {
						  var text = '';
						  if(columnData.createDate == '' || columnData.createDate == 'undefined'){
						  	return text;
						  }
						  try {
								var obj = eval('(' + "{Date: new Date(" + columnData.createDate + ")}" + ')');
								var dateValue = obj["Date"];
								text = dateValue.format('yyyy-MM-dd hh:mm:ss');
							} catch (e) {
						    }
						  return text;
					  } 
					  else {
			            return columnData[columnMetaData.name];
			          }
				},
				afterRowRender : function(rowIndex,data,tr){
					tr.attr("instanceId",data.id);
					tr.attr("instanceName",data.instanceName);
					tr.attr("networkId",data.networkId);
					tr.attr("instancestate",data.optStatus||data.state);
					tr.find("input[type='checkbox']").click(function(){
						ScanRule.onInstanceSelected(); 
			        });
					tr.click(function(){
						//ScanRule.getBindLbById(data.id);
						ScanRule.showDetails(data); 
						$("tbody input[type='checkbox']").attr("checked", false);
				        $(tr).find("input[type='checkbox']").attr("checked", true);
				        ScanRule.onInstanceSelected();
			        });
					if(rowIndex == 0) {
						$(tr).find("input[type='checkbox']").attr("checked", true);
					}	
				},
				afterTableRender : ScanRule._afterDtTableRender
			});
			ScanRule.dtTable.addToobarButton($("#toolbar"));
			ScanRule.dtTable.enableColumnHideAndShow("right");
		}
	},
	
	_afterDtTableRender : function(){
		//默认第一条数据勾选
		var firstRow = $("#scanTable tbody").find("tr:eq(0)");
		firstRow.find("td[name='id'] input[type='checkbox']").attr("checked", true);
		ScanRule.onInstanceSelected(); 
		var check = $("input#monitorRulecheckAll[type='checkbox']").unbind("click").click(function(e){
			e.stopPropagation();
			var check = $(this).attr("checked");
			ScanRule.checkAll(check);
		});
		if(!ScanRule.contextMenu) {
			ScanRule.contextMenu = new ContextMenu({
				beforeShow : function(tr){
					ScanRule.checkAll(false);
					tr.find("input[type='checkbox']").attr("checked",true);
				},
				afterShow : function(tr) {
					ScanRule.onInstanceSelected({
						instanceName : tr.attr("instanceName"),
						id : tr.attr("instanceId"),
						state : tr.attr("instancestate")
					});
				},
				onAction : function(action) {
					ScanRule._invokeAction(action);
				},
				trigger : "#scanTable tr"
			});
		} else {
			ScanRule.contextMenu.reset();
		}
		ScanRule.showDetails();
	},
	
	checkAll : function(check){
		if(check) $("#scanTable tbody input[type='checkbox']").attr("checked",true);
		else $("#scanTable tbody input[type='checkbox']").removeAttr("checked");
		ScanRule.onInstanceSelected(false);
	},
	
	onInstanceSelected : function(selectInstance){
		var allCheckedBox = $("#scanTable tbody input[type='checkbox']:checked");
		var rightClicked = selectInstance?true:false;
		var state = $(allCheckedBox[0]).parents("tr").attr("instancestate");
		if(selectInstance) {
			state = selectInstance.state;
		}
		var oneSelected = allCheckedBox.length == 1;
		var hasSelected = allCheckedBox.length > 0;
		if(oneSelected){//如果列表中的路由只有一个被选中，当前的publicIp为那个唯一被选中路由的publicIp
//			ScanRule.publicIp = $("#scanTable tbody input[type='checkbox']:checked").parent().parent()[0].attributes["publicip"].value;
		}
		$("div[scope='"+ScanRule.scope+"'] .operation").addClass("disabled");
		$("div[scope='"+ScanRule.scope+"'] .operation").each(function(index,operation){
			var condition = $(operation).attr("condition");
			var action = $(operation).attr("action");
			var enabled = true;
			eval("enabled=("+condition+")");
			if(enabled) {
				$(operation).removeClass("disabled");
			} else {
				$(operation).addClass("disabled");
			}
			ScanRule._bindAction();
		});
		//右键的时候
		if(rightClicked) {
			ScanRule.instanceName = selectInstance.instanceName;
			ScanRule.selectedInstanceId = selectInstance.id;
		} else {
			for ( var i = 0; i < allCheckedBox.length; i++) {
				var currentCheckBox = $(allCheckedBox[i]);
				if (i == 0) {
					ScanRule.instanceName = currentCheckBox.parents("tr").attr("name");
					ScanRule.selectedInstanceId = currentCheckBox.attr("value");
				} else {
					ScanRule.instanceName += "," + currentCheckBox.parents("tr").attr("name");
					ScanRule.selectedInstanceId += "," + currentCheckBox.attr("value");
				}
			}
		}
	},
	createVScan : function() {
		com.skyform.service.privateNetService.listAll(function(data){
			var dom = '';
			if(data){	
				$.each(data, function(i) {
					if(data[i].state=='using' || data[i].state=='running'){
						dom +='<option value="'+data[i].id+'">'+data[i].name+'</option>';
					}
				});	
				$("#vm_privatenetwork").empty().append(dom);
				
			}				
			else {
				$.growlUI(Dict.val("common_tip"), Dict.val("lb_no_alternative_private_network")); 				
			}
		});		
		ScanRule.setLabelClassHide();
		ScanRule.resetData();
		/*$("#form_scanRule_name").attr({readOnly:false});
		$("input[type='radio'][name='questMed'][value='POST']").attr({checked:"checked"});*/  
		$("#myModalLabel").text("网络漏洞扫描创建");
		ScanRule.newFormModal = $("#newMRorm");
		$("#btnCreateMonitorRule").unbind('click').bind('click', function(e) {
			ScanRule.createComfirm();
		});		
		ScanRule.bindValiter();
		$("#newMRorm").modal("show");
	
	},
	createComfirm : function() {
	  if(ScanRule.checkValiter()){
		  //console.log("校验错误");
		  return;
	  };
	  var params={
			      "period":9999,
			      "count":1,
			      "productList":[
			          {   
				          "productId":20010,
			              "subNetId":$("#vm_privatenetwork").val(),
			              "instanceName":$("#form_scanRule_name").val()
			          }
			      ]
	  }
 	   ScanRule._save(params);
	},
	_save : function(params){
		ScanRule.service.createScanner(params,function onSuccess(data){
			$.growlUI("提示", "创建申请提交成功, 请耐心等待..."); 
			$("#newMRorm").modal("hide");
			ScanRule.refreshData();
			},function onError(msg){
			$.growlUI("提示", "网络漏洞扫描创建失败！");
			$("#newMRorm").modal("hide");
		});
	
	},
	setLabelClassHide:function(){
		$("#form_scanRule_name").next().next().hide();
		$("#vm_privatenetwork").next().next().hide();
	},
	bindValiter:function(){
		$('#newMRorm').off('shown').on('shown', function () {
			$("#form_scanRule_name").bind('blur',function(e){
				if(valiter.isNull($(this).val())){
				    $(this).next().next().show();
				}
				else{
					$(this).next().next().hide();
				}
				
			});
			$("#vm_privatenetwork").bind('blur',function(e){
				if(valiter.isNull($(this).val())){
				    $(this).next().next().show();
				}
				else{
					$(this).next().next().hide();
				}
				
			});
		});
	},
	checkValiter:function(){
		  $("#form_scanRule_name").blur();
		  if(valiter.isNull($("#form_scanRule_name").val()))
	   	   {
	   		   return true;
	   	   }
		  $("#vm_privatenetwork").blur();
		  if(valiter.isNull($("#vm_privatenetwork").val())){
			   return true;
		  }
	},
	getCheckedArr :function() {
		return $("#scanTable tbody input[type='checkbox']:checked");
	},
	getBindLbById : function(id){//查询已绑定负载均衡方法
		$("#bindLb").html("");
		ScanRule.service.listRelatedInstances(id,function(data){
			if(data == null || data.length == 0) {
				return;
			}else{
				$("#bindLb").empty();
				var dom = "";
				
				$(data).each(function(i) {
					var _resId = "";
					var _state = "";
					if(data[i].templateType==6){
						/*_resId = array[i].resId;*/
						//_state = com.skyform.service.StateService.getState("monitor",array[i].state);
						_state = ScanRule.service.queryBindState(data[i].relaState);
					}
						dom += "<li class=\"detail-item\">"
							+"<span>"+data[i].id+"</span>&nbsp;&nbsp;&nbsp;&nbsp;"
							/*+"<span>"+Route.switchType(array[i].templateType)+"</span>&nbsp;&nbsp;&nbsp;&nbsp;"*/
							+"<span>"+data[i].instanceName+"</span>&nbsp;&nbsp;&nbsp;&nbsp;"							
							/*+"<span>"+_resId+"</span>&nbsp;&nbsp;&nbsp;&nbsp;"*/
							+"<span>"+_state+"</span>"
							+"</li>";	
				});
				$("#bindLb").append(dom);
			}
		});
	},
	authorityScan:function(){
		$('#mrModal').off('shown').on('shown', function () {
	        // do something…
			var networkId=ScanRule.getCheckedArr().parents("tr").attr("networkId");
			if(networkId==null||networkId==undefined){
				$("#mrModal").modal("hide");
				$.growlUI("提示", "请选择一条记录");
				return;
			}
			var params={
					networkId:networkId
			};
			ScanRule.service.listInstances(params,function onSuccess(data){
				if(data){
					var tempdata=[];
					$.each(data, function(i) {
						if(data[i].state=='running'){
							tempdata.push(data[i]);
						}
					});	
					if(ScanRule.mrDataTableOld != null){
						ScanRule.mrDataTableOld.updateData(tempdata);
					} else {
						ScanRule.mrDataTableOld =  new com.skyform.component.DataTable();
						ScanRule.attachOldDataTable(tempdata);
					}
				}
			},function onError(msg){
		    	$.growlUI("提示", "查询云主机失败：" + msg);
		    });
			
	      });
		$("#mrModal").modal("show");
	},
	saveScan:function(){
		var vmId=$("#mrTableOld tbody input[type='radio']:checked").val();
		var scannerId=ScanRule.getCheckedArr().parents("tr").attr("instanceid");
		if(scannerId==null||scannerId==undefined){
			$("#mrModal").modal("hide");
			$.growlUI("提示", "请选择一条记录");
			return;
		}
		var params={
				scannerId:parseInt(scannerId),
				vmId:parseInt(vmId),
				scannerType:"scan"
		};
		ScanRule.service.runScanner(params,function onSuccess(data){
			$.growlUI("提示", "执行扫描成功");
			$("#mrModal").modal("hide");
			ScanRule.refreshData();
		},function onError(msg){
	    	$.growlUI("提示", "执行扫描失败：" + msg);
	    });
	},
	attachOldDataTable : function(data) {
		ScanRule.mrDataTableOld.renderByData("#mrTableOld", {
				"data" : data,
				"pageSize": 5,
				"columnDefs" : [
				     {title : " ", name : "id"},
				     {title : "服务名称", name : "instanceName"},
				     {title : "状态", name : "state"},
				     {title : "内网IP", name : "ip"}
				],
				"onColumnRender" : function(columnIndex,columnMetaData,columnData) {
					 var text = columnData[''+columnMetaData.name] || "";
					 if(columnIndex ==0) {
						 text = "<input type='radio' name='ownMrIdOld' value=' "+text+" '>";
					 }
					 if ('state'==columnMetaData.name) {
							return com.skyform.service.StateService.getState("",columnData.state || columnData);
					 }

					 return text;
				},
				"afterRowRender" : function(index,data,tr){
					if(index == 0) {
						$(tr).find("input[type='radio']").attr("checked", "checked");
					}
				}					
			});
	}
};
var ConfirmWindow = new com.skyform.component.Modal("confirmWindow","","",{
	buttons : [
	  {
		  name : '确定',
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
		  name : '取消',
		  attrs : [{name:'class',value:'btn'}],
		  onClick : function(){
			  ConfirmWindow.hide();
		  }
	  }
	  ]
}).setWidth(400).autoAlign().setTop(100);
var FormWindow = new com.skyform.component.Modal("FormWindow","","",{
	afterShow : function(container){
		if(FormWindow.beforeShow && typeof FormWindow.beforeShow == 'function') {
			FormWindow.beforeShow(container);
		}
	},
	beforeShow : function(container){
		FormWindow.hideError();
	},
	buttons : [
	  {
		  name : '确定',
		  attrs : [{name:'class',value:'btn btn-primary'}],
		  onClick : function(){
			  if(FormWindow.onSave && typeof FormWindow.onSave == 'function') {
				  FormWindow.onSave();
			  } else {
				  FormWindow.hide();
			  }
		  }
	  },
	  {
		  name : '取消',
		  attrs : [{name:'class',value:'btn'}],
		  onClick : function(){
			  FormWindow.hide();
		  }
	  }
	  ],
	  afterHidden : function(container) {
		  window.currentInstanceType='vScan';
		  container.find(".modal-footer").find(".btn").show();
		  FormWindow.setWidth(900).autoAlign();
	  }
}).setWidth(900).autoAlign().setTop(100);
FormWindow.showError = function(error){
	var errorInfo = $("<div class='alert alert-error' style='margin:1px;' id='form_window_error_info'><button class='close' data-dismiss='alert' type='button'>×</button>"+error+"</div>");
	$("#form_window_error_info").remove();
	$("#FormWindow").find(".modal-body").prepend(errorInfo);
},
FormWindow.hideError = function(){
	$("#form_window_error_info").remove();
};

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

			} else {
				_options.container.hide();
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

$(function(){
	var ScanResultInited = false;
	ScanRule.init();
	
	$("#scanResult_tab").on("show",function(){
		$("div.details_content[scope !='" + ScanResult.scope+"']").addClass("hide");
		$("div.details_content[scope ='" + ScanResult.scope+"']").removeClass("hide");
	});
	$("#scanResult_tab").on("shown",function(){
		if(!ScanResultInited) {
			ScanResultInited = true;
		}
		ScanResult.init();
	});
	
	$("#scan_tab").on("show",function(){
		$("div.details_content[scope !='" + ScanRule.scope+"']").addClass("hide");
		$("div.details_content[scope ='" + ScanRule.scope+"']").removeClass("hide");
	});
	
	ErrorMgr.init();
	
});
