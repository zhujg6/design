//当前刷新实例的类型为子网
window.currentInstanceType='dp';
window.Controller = {
		init : function(){
			IntPrevention.init();
		},
		refresh : function(){
			DeepPacket.refreshData();
			IntPrevention.refreshData();
		}
	}
var IntPrevention = {
		  data : [],
		  dtTable : null,
		  targetPage:1,
		  vmId:null,
		  newFormModal : null,
		  //bindRouteModal : null,
		  //contextMenu : null,
		  scope : "intPrenention",
		  init : function(){
			IntPrevention.intData();
		    IntPrevention._bindAction();
		  },
		  
	  	  ///////////////////////////////////////////////////////////////////////////
		  //	Actions  start
		  ///////////////////////////////////////////////////////////////////////////
			intData:function(){
				IntPrevention.vmId=$("#vmId").val();
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
					$("#webStartDate").datepicker({
						changeMonth : true,
						changeYear : true,
						showWeek : true,
						showButtonPanel : true,
						gotoCurrent : true,
						dateFormat : "yy-mm-dd",
						maxDate : +0,
						onSelect: function( startDate ) {
					        var $startDate = $( "#webStartDate" );
					        var $endDate = $('#webEndDate');
					        var endDate = $endDate.datepicker( 'getDate' );
					        if(endDate < startDate){
					            $endDate.datepicker('setDate', startDate - 3600*1000*24);
					        }
					        $endDate.datepicker( "option", "minDate", startDate );
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
					$("#webStartDate").val(tempYear+'-'+tempMonth+'-'+tempDay);
					
					
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
					$("#webEndDate").datepicker({
						changeMonth : true,
						changeYear : true,
						showWeek : true,
						showButtonPanel : true,
						gotoCurrent : true,
						dateFormat : "yy-mm-dd",
						maxDate : +0 ,
						minDate :-6,
						onSelect: function( endDate ) {
					        var $startDate = $( "#webStartDate" );
					        var $endDate = $('#webEndDate');
					        var startDate = $startDate.datepicker( "getDate" );
					        if(endDate < startDate){
					            $startDate.datepicker('setDate', startDate + 3600*1000*24);
					        }
					        $startDate.datepicker( "option", "maxDate", endDate );
					    }
					});
					$("#webEndDate").val(year+'-'+month+'-'+day);
					
					com.skyform.service.dpService.cloudSecurityQuery({state:"on",csType:"1"},function (data){
						var vmContainer = $("#vm_instance");
						vmContainer.empty();
						$("<option value='' >请选择</option>").appendTo(vmContainer);
						$(data).each(function(i,vm){
						    if(IntPrevention.vmId!=null && vm.vmId==IntPrevention.vmId){
						    	$("<option value='" + vm.vmId + "' selected=\"selected\">" + vm.vmName + "</option>").appendTo(vmContainer);
						    }else{
						    	$("<option value='" + vm.vmId + "' >" + vm.vmName + "</option>").appendTo(vmContainer);
						    }
						});
						IntPrevention.refreshData();
					},function(error){
						ErrorMgr.showError(error);
					});
					
					$("#IPbtnQuery").unbind("click").bind("click", function() {
						IntPrevention.refreshData();
					});
			},
		  refreshData : function(){
			  if (IntPrevention.dtTable)
				  IntPrevention.dtTable.container
							.find("tbody")
							.html(
									"<tr ><td colspan='7' style='text-align:center;'><img src='"
											+ CONTEXT_PATH
											+ "/images/loader.gif'/><strong>"+Dict.val("common_retrieving_data_please_wait")+"</strong></td></tr>");
			  var condation =IntPrevention.getCondition();
			  IntPrevention.dpService.describeCloudWebProtectEvent(condation,function onSuccess(data){
		    	 if(!data){data=[];};
				 if(data){
					 IntPrevention.data = data;
					 if(IntPrevention.data.length>0){
						 IntPrevention.getIntPrevention(data[0]);
				    	}
					if(IntPrevention.dtTable==null){
						IntPrevention.dtTable= new com.skyform.component.DataTable();
						IntPrevention._refreshDtTable(IntPrevention.data);
					}else{
						IntPrevention._updateData();
					}
				}
		    },function onError(msg){
		    	ErrorMgr.showError(msg);
		    });
		  },
		  _updateData : function() {
				var pageInfo = {
					"totalPage" :  Math.ceil(IntPrevention.data.count/IntPrevention.data.rowCount),
					"currentPage" : 1,
					"data" : IntPrevention.data.events,
					"_TOTAL_" : IntPrevention.data.count,
					"pageSize" : IntPrevention.data.rowCount
				};
				
				IntPrevention.dtTable.setPaginateInfo(pageInfo);
			},
		  getCondition:function(){
			  var condation={params:{}};
			  condation.params.timeType="CUSTOM_RANGE";
			  if($("#webStartDate").val() !=""&&$("#webStartDate").val() !=null){
				  condation.params.rangeFrom=$("#webStartDate").val()+" 00:00:00";
			  }
			  if($("#webEndDate").val() !=""&&$("#webEndDate").val() !=null){
				  condation.params.rangeTo=$("#webEndDate").val()+" 23:59:59";
			  }
			  if($("#vm_instance option:selected").val() !=""&&$("#vm_instance option:selected").val() !=null){
				  condation.params.vmId=$("#vm_instance option:selected").val();
				  condation.params.hostType="SPECIFIC_HOST";
			  }else{
					 condation.params.hostType="ALL_HOSTS";
				 }
			  condation.params.targetPage=1;
			  condation.params.rowCount=5;
			  return condation;
		  },
		  ///////////////////////////////////////////////////////////////////////////
		  //	Actions  end
		  ///////////////////////////////////////////////////////////////////////////
		  
		  _bindAction : function(){
				$("div[scope='"+IntPrevention.scope+"'] #toolbar4privatenet .actionBtn").unbind("click").click(function(){
					if($(this).hasClass("disabled")) return;
					var action = $(this).attr("action");
					IntPrevention._invokeAction(action);
				});
		  },
			
		  _invokeAction : function(action){
				var invoker = IntPrevention["" + action];
				if(invoker && typeof invoker == 'function') {
					invoker();
				}
		  },
		  
		  _refreshDtTable : function(data) {
		      IntPrevention.dtTable.renderByData("#IntP_instanceTable",{
		    	'selfPaginate' : true,
		    	//pageSize : 5,		        
		        //data : data,
		        onColumnRender : function(columnIndex,columnMetaData,columnData){
		          if(columnMetaData.name=='ID') {
					  return columnData.id;
				  } else if(columnMetaData.name=="id") {
		              return "<input type='checkbox' value='" + columnData["id"] +"'/>" ;
		          } else {
		        	  return columnData[columnMetaData.name];
		          }
		        },"pageInfo" : {
					"totalPage" :  Math.ceil(data.count/data.rowCount),
					"currentPage" : 1,
					"data" : data.events,
					"_TOTAL_" : data.count,
					"pageSize" : data.rowCount
				},
				"onPaginate" : function(targetPage) {
					IntPrevention.targetPage=targetPage;
					var condition = IntPrevention.getCondition();
					var _rowCount=5;
					condition.params.targetPage=targetPage;
					condition.params.rowCount=_rowCount;
					IntPrevention.dpService.describeCloudWebProtectEvent(condition,function onSuccess(data){
						IntPrevention.data = data;
						var pageInfo = {
								"totalPage" : Math.ceil(IntPrevention.data.count/IntPrevention.data.rowCount),
								"currentPage" : targetPage,
								"data" :IntPrevention.data.events,
								"_TOTAL_" : IntPrevention.data.count,
								"pageSize" : IntPrevention.data.rowCount
							};
						IntPrevention.dtTable.setPaginateInfo(pageInfo);
					});
				},
		        afterRowRender : function(rowIndex,data,tr){
		          tr.attr("vmId",data.vmId);
		          
		          tr.find("input[type='checkbox']").click(function(){
		        	 IntPrevention.onInstanceSelected(); 
		          });
		          
		          tr.unbind("click").click(function(){
		        	  $("tbody input[type='checkbox']").attr("checked", false);
				      $(tr).find("input[type='checkbox']").attr("checked", true);
		        	  IntPrevention.getIntPrevention(data);
		          });
		        },
		        afterTableRender : IntPrevention._afterDtTableRender
		      });
		      
		      IntPrevention.dtTable.addToobarButton($("#toolbar4privatenet"));
		      IntPrevention.dtTable.enableColumnHideAndShow("right");
		  },
		  
		  _afterDtTableRender : function(){
			var firstRow = $("#IntP_instanceTable tbody").find("tr:eq(0)");
			firstRow.find("td[name='id'] input[type='checkbox']").attr("checked", true);
		    var check = $("input#webCheckAll[type='checkbox']").unbind("click").click(function(e){
		      e.stopPropagation();
		      var check = $(this).attr("checked");
		      IntPrevention.checkAll(check);
		    });
		    /*if(!IntPrevention.contextMenu) {
		      IntPrevention.contextMenu = new ContextMenu({
		    	container : "#contextMenuPrivateNet",
		        beforeShow : function(tr){
		          IntPrevention.checkAll(false);
		          tr.find("input[type='checkbox']").attr("checked",true);
		        },
		        afterShow : function(tr) {
		          IntPrevention.onInstanceSelected({
		            instanceName : tr.attr("instanceName"),
		            id : tr.attr("instanceId"),
		            state : tr.attr("state")
		          });
		        },
		        onAction : function(action) {
		        	IntPrevention._invokeAction(action);
		        },
		        trigger : "#IntP_instanceTable tr"
		      });
		    } else {
		      IntPrevention.contextMenu.reset();
		    }*/
		  },
		  
		  checkAll : function(check){//全选触发的操作
		    if(check) $("#IntP_instanceTable tbody input[type='checkbox']").attr("checked",true);
		    else $("#IntP_instanceTable tbody input[type='checkbox']").removeAttr("checked");
		    IntPrevention.onInstanceSelected(false);
		  },
		  
		  onInstanceSelected : function(selectInstance){//单选一个触发的操作
		    var allCheckedBox = $("#IntP_instanceTable tbody input[type='checkbox']:checked");
		    var rightClicked = selectInstance?true:false;
		    var state = $(allCheckedBox[0]).parents("tr").attr("state");
		    
			if(selectInstance) {
				state = selectInstance.state;
			}
		    var oneSelected = allCheckedBox.length == 1;
		    var hasSelected = allCheckedBox.length > 0;
		    $("div[scope='"+IntPrevention.scope+"'] .operation").addClass("disabled");
		    $("div[scope='"+IntPrevention.scope+"'] .operation").each(function(index,operation){
		      var condition = $(operation).attr("condition");
		      var action = $(operation).attr("action");
		      var enabled = true;
		      eval("enabled=("+condition+")");
		      if(enabled) {
		        $(operation).removeClass("disabled");
		      } else {
		        $(operation).addClass("disabled");
		      }
		      IntPrevention._bindAction();
		    });
		    if(rightClicked) {
		      IntPrevention.instanceName = selectInstance.instanceName;
		      IntPrevention.selectedInstanceId = selectInstance.id; 
		    } else {
		      for ( var i = 0; i < allCheckedBox.length; i++) {
		        var currentCheckBox = $(allCheckedBox[i]);
		        if (i == 0) {
		          IntPrevention.instanceName = currentCheckBox.parents("tr").attr("name");
		          IntPrevention.selectedInstanceId = currentCheckBox.attr("value");
		        } else {
		          IntPrevention.instanceName += "," + currentCheckBox.parents("tr").attr("name");
		          IntPrevention.selectedInstanceId += "," + currentCheckBox.attr("value");
		        }
		      }
		    }
		  },
		  getIntPrevention : function(data){
			            $("#webTable").html("");
						$("#webTable").empty();
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
						$("#webTable").append(dom);
		  },
		  dpService : com.skyform.service.dpService
};
$(function(){
	var DeepPacketedInited = false;
	IntPrevention.init();
	$("#rq_tab").on("show",function(){
		
		//window.currentInstanceType='mr';
		$("div.details_content[scope !='" + DeepPacket.scope+"']").addClass("hide");
		$("div.details_content[scope ='" + DeepPacket.scope+"']").removeClass("hide");
	});
	
	$("#rq_tab").on("shown",function(){
		
		if(!DeepPacketedInited) {
			DeepPacketedInited = true;
			DeepPacket.init();
		}
	});
	
	$("#web_tab").on("show",function(){
		
		//window.currentInstanceType='desktopCloud';
		$("div.details_content[scope !='" + IntPrevention.scope+"']").addClass("hide");
		$("div.details_content[scope ='" + IntPrevention.scope+"']").removeClass("hide");
	});
	
	ErrorMgr.init();
	
});