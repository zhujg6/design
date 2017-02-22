//当前刷新实例的类型为负载均衡监控
window.currentInstanceType='subdp';
window.Controller = {
		init : function(){
			DeepPacket.init();
		},
		refresh : function(){
		}
	}
var DeepPacket = {//负载均衡监控js模块
	data : [],
	vmId:null,
	dtTable : null,
	targetPage:1,
	mrDataTable:null,
	mrDataTableOld:null,
	newFormModal : null,
	contextMenu : null,
	scope : "dp",
	//routeName : [],
	instances : [],
	service:com.skyform.service.dpService,
	init : function(){
		DeepPacket.intData();
		DeepPacket._bindAction();//绑定按钮功能
		
	},
	///////////////////////////////////////////////////////////////////////////
	//	Actions  start
	///////////////////////////////////////////////////////////////////////////
	intData:function(){
		DeepPacket.vmId=$("#vmId").val();
		$.datepicker.regional['zh-CN'] = {
				clearText : Dict.val("user_remove"),
				clearStatus : Dict.val("user_clear_selected_date"),
				closeText : Dict.val("common_close"),
				closeStatus : Dict.val("user_does_not_change_current_selection"),
				prevText : '&lt;'+Dict.val("user_last_month"),
				prevStatus : Dict.val("user_display_last_month"),
				nextText : Dict.val("user_next_month")+'&gt;',
				nextStatus : Dict.val("user_show_next_month"),
				currentText : Dict.val("common_today"),
				currentStatus : Dict.val("user_display_this_month"),
				monthNames : [Dict.val("common_january"),
                              Dict.val("common_february"),
                              Dict.val("common_march"),
                              Dict.val("common_april"),
                              Dict.val("common_may"),
                              Dict.val("common_june"),
                              Dict.val("common_july"),
                              Dict.val("common_august"),
                              Dict.val("common_september"),
                              Dict.val("common_october"),
                              Dict.val("common_november"),
                              Dict.val("common_december")],
				monthNamesShort : [ Dict.val("common_january"),
		                              Dict.val("common_february"),
		                              Dict.val("common_march"),
		                              Dict.val("common_april"),
		                              Dict.val("common_may"),
		                              Dict.val("common_june"),
		                              Dict.val("common_july"),
		                              Dict.val("common_august"),
		                              Dict.val("common_september"),
		                              Dict.val("common_october"),
		                              Dict.val("common_november"),
		                              Dict.val("common_december")],
				monthStatus : Dict.val("common_select_month"),
				yearStatus : Dict.val("common_select_year"),
				weekHeader : Dict.val("common_zhou"),
				weekStatus : Dict.val("common_weeks_years"),
				dayNames : [ Dict.val("common_sunday"), 
				             Dict.val("common_monday"), 
				             Dict.val("common_tuesday"), 
				             Dict.val("common_wednesday"), 
				             Dict.val("common_thursday"), 
				             Dict.val("common_friday"), 
				             Dict.val("common_saturday")],
				dayNamesShort : [ Dict.val("common_sunday1"), 
				                  Dict.val("common_monday1"), 
				                  Dict.val("common_tuesday1"), 
				                  Dict.val("common_wednesday1"), 
				                  Dict.val("common_thursday1"), 
				                  Dict.val("common_friday1"), 
				                  Dict.val("common_saturday1")],
				dayNamesMin : [Dict.val("common_day"),
		                       Dict.val("common_one"),
		                       Dict.val("common_two"),
		                       Dict.val("common_three"),
		                       Dict.val("common_four"),
		                       Dict.val("common_Fives"),
		                       Dict.val("common_six")],
				dayStatus : Dict.val("common_DD_is_set_start_one_week"),
				dateStatus : Dict.val("common_select_m_month_d_day_DD"),
				dateFormat : 'yy-mm-dd',
				firstDay : 1,
				initStatus : Dict.val("common_please_select_date"),
				isRTL : false
			};
			$.datepicker.setDefaults($.datepicker.regional['zh-CN']);
			// 时间控件
			$("#rqStartDate").datepicker({
				changeMonth : true,
				changeYear : true,
				showWeek : true,
				showButtonPanel : true,
				gotoCurrent : true,
				dateFormat : "yy-mm-dd",
				maxDate : +0,
				onSelect: function( startDate ) {
			        var endDate = $('#rqEndDate').datepicker( 'getDate' );
			        if(endDate < startDate){
			        	$('#rqEndDate').datepicker('setDate', startDate - 3600*1000*24*6);
			        }
			        $('#rqEndDate').datepicker( "option", "minDate", startDate );
			    }
			});
			
			var tempDate = new Date();
			tempDate.setDate(tempDate.getDate()-6);
			var tempYear=tempDate.getFullYear();
			var tempMonth=tempDate.getMonth()+1;
			var tempDay=tempDate.getDate();
			if(tempMonth<10){
				tempMonth = '0'+tempMonth;
			}
			if(tempDay<10){
				tempDay='0'+tempDay;
			}
			$("#rqStartDate").val(tempYear+'-'+tempMonth+'-'+tempDay);
			
			
			var current = new Date();
			var year = current.getFullYear();
			var month = current.getMonth()+1;
			var day = current.getDate();
			if(month<10){
				month = '0'+month;
			}
			if(day<10){
				day='0'+day;
			}
			$("#rqEndDate").datepicker({
				changeMonth : true,
				changeYear : true,
				showWeek : true,
				showButtonPanel : true,
				gotoCurrent : true,
				dateFormat : "yy-mm-dd",
				maxDate : +0,
				minDate :-6,
				onSelect: function( endDate ) {
			        var startDate = $( "#rqStartDate" ).datepicker( "getDate" );
			        if(endDate < startDate){
			        	$( "#rqStartDate" ).datepicker('setDate', startDate + 3600*1000*24*6);
			        }
			        $( "#rqStartDate" ).datepicker( "option", "maxDate", endDate );
			    }
			});
			$("#rqEndDate").val(year+'-'+month+'-'+day);
			
			com.skyform.service.dpService.cloudSecurityQuery({state:"on",csType:"1"},function (data){
				var vmContainer = $("#rq_vm_instance");
				vmContainer.empty();
				$("<option value='' >请选择</option>").appendTo(vmContainer);
				$(data).each(function(i,vm){
					if(DeepPacket.vmId!=null && vm.vmId==DeepPacket.vmId){
				    	$("<option value='" + vm.vmId + "' selected=\"selected\">" + vm.vmName + "</option>").appendTo(vmContainer);
				    }else{
				    	$("<option value='" + vm.vmId + "' >" + vm.vmName + "</option>").appendTo(vmContainer);
				    }
				});
				DeepPacket.refreshData();
			},function(error){
				ErrorMgr.showError(error);
			});
			
			$("#btnQuery").unbind("click").bind("click", function() {
				DeepPacket.refreshData();
			});
	},
	refreshData : function(){
		if (DeepPacket.dtTable)
			DeepPacket.dtTable.container
					.find("tbody")
					.html(
							"<tr ><td colspan='7' style='text-align:center;'><img src='"
									+ CONTEXT_PATH
									+ "/images/loader.gif'/><strong>"+Dict.val("common_retrieving_data_please_wait")+"</strong></td></tr>");
		 
		//查询所有的监控规则
		var condation=DeepPacket.getCondition();
	    DeepPacket.service.describeCloudDefinderSecurity(condation,function onSuccess(result){
			 if(!result){result=[];};
			 if(result){
				 DeepPacket.data = result;
				 if(DeepPacket.data.length>0){
			    		DeepPacket.getrqTableById(DeepPacket.data[0]);
			    	}
				if(DeepPacket.dtTable==null){
					DeepPacket.dtTable= new com.skyform.component.DataTable();
					DeepPacket._refreshDtTable(DeepPacket.data);
				}else{
					DeepPacket._updateData();
				}
			}
		},function onError(msg){
			ErrorMgr.showError(msg);
		});
	},
	_updateData : function() {
		var pageInfo = {
			"totalPage" : Math.ceil(DeepPacket.data.count/DeepPacket.data.rowCount),
			"currentPage" : 1,
			"data" : DeepPacket.data.events,
			"_TOTAL_" : DeepPacket.data.count,
			"pageSize" : DeepPacket.data.rowCount
		};
		
		DeepPacket.dtTable.setPaginateInfo(pageInfo);
	},
	getCondition:function(){
		var condation={params:{}};
		 condation.params.timeType="CUSTOM_RANGE";
		 if($("#rqStartDate").val() !=""&&$("#rqStartDate").val() !=null){
			 condation.params.rangeFrom=$("#rqStartDate").val()+" 00:00:00";
		 }
		 if($("#rqEndDate").val() !=""&&$("#rqEndDate").val() !=null){
			 condation.params.rangeTo=$("#rqEndDate").val()+" 23:59:59";
		 }
		 if($("#rq_vm_instance option:selected").val() !=""&&$("#rq_vm_instance option:selected").val() !=null){
			 condation.params.vmId=parseInt($("#rq_vm_instance option:selected").val());
			 condation.params.hostType="SPECIFIC_HOST";
		 }else{
			 condation.params.hostType="ALL_HOSTS";
		 }
		 condation.params.targetPage=1;
		 condation.params.rowCount=5;
		 return condation;
	},
	_bindAction : function(){
		$("div[scope='"+DeepPacket.scope+"'] #toolbar .actionBtn").unbind().click(function(){
			if($(this).hasClass("disabled")) return;
			var action = $(this).attr("action");
			DeepPacket._invokeAction(action);
		});
	},
	
	_invokeAction : function(action){
		var invoker = DeepPacket["" + action];
		if(invoker && typeof invoker == 'function') {
			invoker();
		}
	},
	
	_refreshDtTable : function(data) {
			DeepPacket.dtTable.renderByData("#dpTable",{
				'selfPaginate' : true,
				//pageSize : 5,
				//data : data,
				onColumnRender : function(columnIndex,columnMetaData,columnData){
					  if(columnMetaData.name=='ID') {
						return columnData.id;
					  } else if(columnMetaData.name=="id") {
			            return "<input type='checkbox' value='" + columnData["id"] +"'/>" ;
			          } /*else if(columnMetaData.name=="reason") {
			        	  if(columnData.reason.length>15) return columnData.reason.slice(0,15);
			        	  else return columnData.reason;
			          }*/else {
			            return columnData[columnMetaData.name];
			          }
				},"pageInfo" : {
					"totalPage" : Math.ceil(data.count/data.rowCount),
					"currentPage" : 1,
					"data" : data.events,
					"_TOTAL_" : data.count,
					"pageSize" : data.rowCount
				},
				"onPaginate" : function(targetPage) {
					DeepPacket.targetPage=targetPage;
					var condition = DeepPacket.getCondition();
					var _rowCount=5;
					condition.params.targetPage=targetPage;
					condition.params.rowCount=_rowCount;
					DeepPacket.service.describeCloudDefinderSecurity(condition,function onSuccess(data){
						DeepPacket.data = data;
						var pageInfo = {
								"totalPage" : Math.ceil(DeepPacket.data.count/DeepPacket.data.rowCount),
								"currentPage" : targetPage,
								"data" :DeepPacket.data.events,
								"_TOTAL_" : DeepPacket.data.count,
								"pageSize" : DeepPacket.data.rowCount
							};
					
						DeepPacket.dtTable.setPaginateInfo(pageInfo);
					});
				},
				afterRowRender : function(rowIndex,data,tr){
					tr.attr("instanceId",data.id);
					tr.find("input[type='checkbox']").click(function(){
						DeepPacket.onInstanceSelected(); 
			        });
					tr.click(function(){
						DeepPacket.getrqTableById(data);
						$("tbody input[type='checkbox']").attr("checked", false);
				        $(tr).find("input[type='checkbox']").attr("checked", true);
				        DeepPacket.onInstanceSelected();
			        });
					if(rowIndex == 0) {
						$(tr).find("input[type='checkbox']").attr("checked", true);
					}	
				},
				afterTableRender : DeepPacket._afterDtTableRender
			});
			DeepPacket.dtTable.addToobarButton($("#toolbar"));
			DeepPacket.dtTable.enableColumnHideAndShow("right");
	},
	
	_afterDtTableRender : function(){
		//默认第一条数据勾选
		var firstRow = $("#dpTable tbody").find("tr:eq(0)");
		firstRow.find("td[name='id'] input[type='checkbox']").attr("checked", true);
		DeepPacket.onInstanceSelected(); 
		var check = $("input#dpcheckAll[type='checkbox']").unbind("click").click(function(e){
			e.stopPropagation();
			var check = $(this).attr("checked");
			DeepPacket.checkAll(check);
		});
		if(!DeepPacket.contextMenu) {
			DeepPacket.contextMenu = new ContextMenu({
				beforeShow : function(tr){
					DeepPacket.checkAll(false);
					tr.find("input[type='checkbox']").attr("checked",true);
				},
				afterShow : function(tr) {
					DeepPacket.onInstanceSelected({
						instanceName : tr.attr("instanceName"),
						id : tr.attr("instanceId"),
						state : tr.attr("instancestate")
					});
				},
				onAction : function(action) {
					DeepPacket._invokeAction(action);
				},
				trigger : "#dpTable tr"
			});
		} else {
			DeepPacket.contextMenu.reset();
		}
	},
	
	checkAll : function(check){
		if(check) $("#dpTable tbody input[type='checkbox']").attr("checked",true);
		else $("#dpTable tbody input[type='checkbox']").removeAttr("checked");
		DeepPacket.onInstanceSelected(false);
	},
	
	onInstanceSelected : function(selectInstance){
		var allCheckedBox = $("#dpTable tbody input[type='checkbox']:checked");
		var rightClicked = selectInstance?true:false;
		var state = $(allCheckedBox[0]).parents("tr").attr("instancestate");
		if(selectInstance) {
			state = selectInstance.state;
		}
		var oneSelected = allCheckedBox.length == 1;
		var hasSelected = allCheckedBox.length > 0;
		if(oneSelected){//如果列表中的路由只有一个被选中，当前的publicIp为那个唯一被选中路由的publicIp
//			DeepPacket.publicIp = $("#dpTable tbody input[type='checkbox']:checked").parent().parent()[0].attributes["publicip"].value;
		}
		$("div[scope='"+DeepPacket.scope+"'] .operation").addClass("disabled");
		$("div[scope='"+DeepPacket.scope+"'] .operation").each(function(index,operation){
			var condition = $(operation).attr("condition");
			var action = $(operation).attr("action");
			var enabled = true;
			eval("enabled=("+condition+")");
			if(enabled) {
				$(operation).removeClass("disabled");
			} else {
				$(operation).addClass("disabled");
			}
			DeepPacket._bindAction();
		});
		//右键的时候
		if(rightClicked) {
			DeepPacket.instanceName = selectInstance.instanceName;
			DeepPacket.selectedInstanceId = selectInstance.id;
		} else {
			for ( var i = 0; i < allCheckedBox.length; i++) {
				var currentCheckBox = $(allCheckedBox[i]);
				if (i == 0) {
					DeepPacket.instanceName = currentCheckBox.parents("tr").attr("name");
					DeepPacket.selectedInstanceId = currentCheckBox.attr("value");
				} else {
					DeepPacket.instanceName += "," + currentCheckBox.parents("tr").attr("name");
					DeepPacket.selectedInstanceId += "," + currentCheckBox.attr("value");
				}
			}
		}
	},
	getCheckedArr :function() {
		return $("#dpTable tbody input[type='checkbox']:checked");
	},
	getrqTableById : function(data){//查询已绑定负载均衡方法
		    $("#rqTable").html("");
			if(data == null || data.length == 0) {
				return;
			}else{
				$("#rqTable").empty();
				var severity=data.severity;
				if(severity==undefined){
					severity="";
				}
				var dom = "";
					dom +="<table border=\"1\" width=\"100%\">"
						  +"<tr>"
						  +"<td>流</td>"
						  +"<td>"+data.flow+"</td>"
						  +"<td>目标MAC</td>"
						  +"<td>"+data.destinationMAC+"</td>"
						  +"</tr>"
						  +"<tr>"
						  +"<td>接口</td>"
						  +"<td>"+data.iface+"</td>"
						  +"<td>目标端口</td>"
						  +"<td>"+data.destinationPort+"</td>"
						  +"</tr>"
						  +"<tr>"
						  +"<td>协议</td>"
						  +"<td>"+data.protocol+"</td>"
						  +"<td>源IP</td>"
						  +"<td>"+data.sourceIP+"</td>"
						  +"</tr>"
						  +"<tr>"
						  +"<td>标志</td>"
						  +"<td>"+data.flags+"</td>"
						  +"<td>源MAC</td>"
						  +"<td>"+data.sourceMAC+"</td>"
						  +"</tr>"
						  +"<tr>"
						  +"<td>事件来源</td>"
						  +"<td>"+data.eventOrigin+"</td>"
						  +"<td>源端口</td>"
						  +"<td>"+data.sourcePort+"</td>"
						  +"</tr>"
						  +"<tr>"
						  +"<td>目标IP</td>"
						  +"<td>"+data.destinationIP+"</td>"
						  +"</tr>"
						+"</table>";
				$("#rqTable").append(dom);
			}
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
		  window.currentInstanceType='dp';
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
