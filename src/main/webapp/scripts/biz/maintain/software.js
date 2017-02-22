//当前刷新实例的类型为我的软件

window.Controller = {
		init : function(){
			SoftWare.init();
		},
		refresh : function(){
		}
	}
window.currentInstanceType='mySoftWare';
var SoftWare = {//我的软件js模块
	newFormModal:null,
	data : [],
	dtTable : null,
	contextMenu : null,
	scope : "mySoftWare",
	instances : [],
	service:com.skyform.service.softWareService,
	init : function(){
		SoftWare.initButtonEvent();
		SoftWare.refreshData();
		SoftWare._bindAction();//绑定按钮功能
		
	},
	///////////////////////////////////////////////////////////////////////////
	//	Actions  start
	///////////////////////////////////////////////////////////////////////////
	showDetails : function(instance){
	  if(!SoftWare.data || SoftWare.data.length < 1) return;
	  if(!instance) {
		  instance = SoftWare.data[0];
	  }
	  $("#opt_logs").empty();
	  com.skyform.service.LogService.describeLogsUIInfo(instance.id);
	},
	refreshData : function(){
		if (SoftWare.dtTable)
			SoftWare.dtTable.container
					.find("tbody")
					.html(
							"<tr ><td colspan='7' style='text-align:center;'><img src='"
									+ CONTEXT_PATH
									+ "/images/loader.gif'/><strong>"+Dict.val("common_retrieving_data_please_wait")+"</strong></td></tr>");
		var condation=SoftWare.getQueryCondition();
		//查询所有的订购软件
	    SoftWare.service.queryAccessSubscription(condation,function onSuccess(result){
	    	if(SoftWare.data.length>0){
	    		var firstInstanceId = SoftWare.data[0].id;		
	    		//SoftWare.getBindLbById(firstInstanceId);
	    		//SoftWare.showDetails(SoftWare.data[0]);
	    	}
		var result=[
				{
					'id':14270500,
					'subscriptionName':"软件名称",
					'subServiceStatus':"开通",
					'standardName':111,
					'period':12,
					'createDate':20150101,
					'absInactive':20160101
				},
				{
					'id':14262515,
					'subscriptionName':"软件",
					'subServiceStatus':"开通",
					'standardName':111,
					'period':120,
					'createDate':20150101,
					'absInactive':20160101
				}
			];
	    	SoftWare.data = result;
			SoftWare._refreshDtTable(SoftWare.data);
		},function onError(msg){
			ErrorMgr.showError(msg);
		});
	},
	getQueryCondition : function() {
        var condition = {};
        condition['accessName'] = $("#queryName").val()==null?"":$("#queryName").val();
        condition['serviceType'] = $("#serviceType").val()==null?"":parseInt($("#serviceType").val());
        return condition;
    },
	_bindAction : function(){
		$("div[scope='"+SoftWare.scope+"'] #toolbar .actionBtn").unbind().click(function(){
			if($(this).hasClass("disabled")) return;
			var action = $(this).attr("action");
			SoftWare._invokeAction(action);
		});
	},
	initButtonEvent:function(){
		$("#btnQuery").unbind().bind("click",function(){
			SoftWare.refreshData();
		});
	},
	_invokeAction : function(action){
		var invoker = SoftWare["" + action];
		if(invoker && typeof invoker == 'function') {
			invoker();
		}
	},
	
	_refreshDtTable : function(data) {
		if(SoftWare.dtTable) {
			SoftWare.dtTable.updateData(data);
		} else {
			SoftWare.dtTable = new com.skyform.component.DataTable();
			SoftWare.dtTable.renderByData("#sgTable",{
				pageSize : 5,
				data : data,
				onColumnRender : function(columnIndex,columnMetaData,columnData){
					  if(columnMetaData.name=='ID') {
						return columnData.id;
					  } else if(columnMetaData.name=="id") {
			            return "<input type='checkbox' value='" + columnData["id"] +"'/>" ;
			          } else if (columnMetaData.name=="subServiceStatus") {
							return com.skyform.service.StateService.getState("common",
									columnData.subServiceStatus || columnData);
					  } else if (columnMetaData.name == "period"){
						  var period = columnData.period;
						  var periodText = period+"月";
						  if(Number(period)>=12 && Number(period)%12==0){
							  periodText = period/12 + "年";
						  }
						  return periodText;
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
					  }else if (columnMetaData.name == "absInactive") {
						  var text = '';
						  if(columnData.absInactive == '' || columnData.absInactive == 'undefined'){
						  	return text;
						  }
						  try {
								var obj = eval('(' + "{Date: new Date(" + columnData.absInactive + ")}" + ')');
								var dateValue = obj["Date"];
								text = dateValue.format('yyyy-MM-dd hh:mm:ss');
							} catch (e) {
						    }
						  return text;
					  }else if(columnMetaData.name =="orderInformation"){
						  return "<button class='btn' onclick='SoftWare.returnOpenInfo(this)' type='button'>订单详情</button>";
					  }else {
			            return columnData[columnMetaData.name];
			          }
				},
				afterRowRender : function(rowIndex,data,tr){
					tr.attr("instanceId",data.id);
					tr.find("input[type='checkbox']").click(function(){
						SoftWare.onInstanceSelected(); 
			        });
					tr.click(function(){
						//SoftWare.getBindLbById(data.id);
						//SoftWare.showDetails(data); 
						$("tbody input[type='checkbox']").attr("checked", false);
				        $(tr).find("input[type='checkbox']").attr("checked", true);
				        SoftWare.onInstanceSelected();
			        });
					if(rowIndex == 0) {
						$(tr).find("input[type='checkbox']").attr("checked", true);
					}	
				},
				afterTableRender : SoftWare._afterDtTableRender
			});
			SoftWare.dtTable.addToobarButton($("#toolbar"));
			SoftWare.dtTable.enableColumnHideAndShow("right");
		}
	},
	//订单详情弹出框
	orderDetailsBox:function(data){
		if(null==SoftWare.newFormModal){
			SoftWare.newFormModal = new com.skyform.component.Modal("abc","<h3>订单详情</h3>",$("script#order_details_box").html(),{
				buttons : [
					//{name:'确定',onClick:function(){
					//},attrs:[{name:'class',value:'btn btn-primary'}]},
					{name:'关闭',onClick:function(){
						SoftWare.newFormModal.hide();
					},attrs:[{name:'class',value:'btn'}]}
				],
				beforeShow : function(){
				},
				afterShow: function(){
					$(".order_tradeId").html(SoftWare.orderData.tradeId);
					$(".order_productId").html(SoftWare.orderData.productId);
					$(".order_productName").html(SoftWare.orderData.productName);
					if(SoftWare.orderData.beginTime == null){
						var beginTime="--";
					}else{
						var beginTime=new Date(SoftWare.orderData.beginTime).format("yyyy-MM-dd hh:mm:ss");
					}
					$(".order_beginTime").html(beginTime);
					if(SoftWare.orderData.endTime == null){
						var endTime="--";
					}else{
						var endTime=new Date(SoftWare.orderData.endTime).format("yyyy-MM-dd hh:mm:ss");
					}
					$(".order_endTime").html(endTime);
					$(".order_ifPay").html(SoftWare.orderData.ifPay);//付费状态
					$(".order_ifOpen").html(SoftWare.orderData.ifOpen);//开通状态
					$(".order_standard").html(SoftWare.orderData.standard);
					$(".order_openInfo").html(SoftWare.orderData.openInfo);
				}
			});
		}
		SoftWare.newFormModal.setWidth(600).autoAlign().setTop().show();
	},
	//订单信息按钮
	returnOpenInfo:function(btn){
		var tr=btn.parentNode.parentNode;
		var id=tr.getElementsByTagName("input")[0].value;
		SoftWare.service.returnOpenInfo({"tradeId":14270500},function onSuccess(data){
		//SoftWare.service.returnOpenInfo({"tradeId":Number(id)},function onSuccess(data){
			SoftWare.orderData = data;
			SoftWare.orderDetailsBox(SoftWare.orderData);
		},function onError(msg){
			SoftWare.orderDetailsBox(SoftWare.orderData);

			ErrorMgr.showError(msg);
		});
	},
	_afterDtTableRender : function(){
		//默认第一条数据勾选
		var firstRow = $("#sgTable tbody").find("tr:eq(0)");
		firstRow.find("td[name='id'] input[type='checkbox']").attr("checked", true);
		SoftWare.onInstanceSelected(); 
		var check = $("input#monitorRulecheckAll[type='checkbox']").unbind("click").click(function(e){
			e.stopPropagation();
			var check = $(this).attr("checked");
			SoftWare.checkAll(check);
		});
		if(!SoftWare.contextMenu) {
			SoftWare.contextMenu = new ContextMenu({
				beforeShow : function(tr){
					SoftWare.checkAll(false);
					tr.find("input[type='checkbox']").attr("checked",true);
				},
				afterShow : function(tr) {
					SoftWare.onInstanceSelected({
						instanceName : tr.attr("instanceName"),
						id : tr.attr("instanceId"),
						state : tr.attr("instancestate")
					});
				},
				onAction : function(action) {
					SoftWare._invokeAction(action);
				},
				trigger : "#sgTable tr"
			});
		} else {
			SoftWare.contextMenu.reset();
		}
	},
	
	checkAll : function(check){
		if(check) $("#sgTable tbody input[type='checkbox']").attr("checked",true);
		else $("#sgTable tbody input[type='checkbox']").removeAttr("checked");
		SoftWare.onInstanceSelected(false);
	},
	
	onInstanceSelected : function(selectInstance){
		var allCheckedBox = $("#sgTable tbody input[type='checkbox']:checked");
		var rightClicked = selectInstance?true:false;
		var state = $(allCheckedBox[0]).parents("tr").attr("instancestate");
		if(selectInstance) {
			state = selectInstance.state;
		}
		var oneSelected = allCheckedBox.length == 1;
		var hasSelected = allCheckedBox.length > 0;
		if(oneSelected){
		}
		$("div[scope='"+SoftWare.scope+"'] .operation").addClass("disabled");
		$("div[scope='"+SoftWare.scope+"'] .operation").each(function(index,operation){
			var condition = $(operation).attr("condition");
			var action = $(operation).attr("action");
			var enabled = true;
			eval("enabled=("+condition+")");
			if(enabled) {
				$(operation).removeClass("disabled");
			} else {
				$(operation).addClass("disabled");
			}
			SoftWare._bindAction();
		});
		//右键的时候
		if(rightClicked) {
			SoftWare.instanceName = selectInstance.instanceName;
			SoftWare.selectedInstanceId = selectInstance.id;
		} else {
			for ( var i = 0; i < allCheckedBox.length; i++) {
				var currentCheckBox = $(allCheckedBox[i]);
				if (i == 0) {
					SoftWare.instanceName = currentCheckBox.parents("tr").attr("name");
					SoftWare.selectedInstanceId = currentCheckBox.attr("value");
				} else {
					SoftWare.instanceName += "," + currentCheckBox.parents("tr").attr("name");
					SoftWare.selectedInstanceId += "," + currentCheckBox.attr("value");
				}
			}
		}
	},
	getCheckedArr :function() {
		return $("#sgTable tbody input[type='checkbox']:checked");
	},
	getBindLbById : function(id){//查询已绑定负载均衡方法
		$("#bindLb").html("");
		SoftWare.service.listRelatedInstances(id,function(data){
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
						_state = SoftWare.service.queryBindState(data[i].relaState);
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
		  window.currentInstanceType='mr';
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
