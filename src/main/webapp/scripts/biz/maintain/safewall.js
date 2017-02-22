window.currentInstanceType='safewall';
window.Controller = {
		init : function(){
//			safewall.init();
		},
		refresh : function(){
		}
	}
$(function(){
	safewall.init();
//	if(safewall.GetQueryString("paramData")=="paySucc"){
//		$('#myTab a:last').tab('show');
//	};
	
	
});
var safewall = {
		newFormModal:null,
		datatable : null,
		data_table : null,
		data_Name:null,
		createPeridInput:null,
		service : com.skyform.service.safewallService,
		data_vmId : null,
		instances : null,
		init : function() {
			safewall.data_vmId=safewall.GetQueryString("vmId");
//			console.log(safewall.data_vmId);
			$.datepicker.regional['zh-CN'] = {
					clearText : '清除',
					clearStatus : '清除已选日期',
					closeText : '关闭',
					closeStatus : '不改变当前选择',
					prevText : '&lt;上月',
					prevStatus : '显示上月',
					nextText : '下月&gt;',
					nextStatus : '显示下月',
					currentText : '今天',
					currentStatus : '显示本月',
					monthNames : [ '一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月',
							'十月', '十一月', '十二月' ],
					monthNamesShort : [ '一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月',
							'九月', '十月', '十一月', '十二月' ],
					monthStatus : '选择月份',
					yearStatus : '选择年份',
					weekHeader : '周',
					weekStatus : '年内周次',
					dayNames : [ '星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六' ],
					dayNamesShort : [ '周日', '周一', '周二', '周三', '周四', '周五', '周六' ],
					dayNamesMin : [ '日', '一', '二', '三', '四', '五', '六' ],
					dayStatus : '设置 DD 为一周起始',
					dateStatus : '选择 m月 d日, DD',
					dateFormat : 'yy-mm-dd',
					firstDay : 1,
					initStatus : '请选择日期',
					isRTL : false
				};
				$.datepicker.setDefaults($.datepicker.regional['zh-CN']);
				// 时间控件
				$("#starttime").datepicker({
					
					changeMonth : true,
					changeYear : true,
					showWeek : true,
					showButtonPanel : true,
					gotoCurrent : true,
					dateFormat : "yy-mm-dd",
					maxDate : +0,
					onSelect: function( startDate ) {
				        var endDate = $('#endtime').datepicker( 'getDate' );
				        if(endDate < startDate){
				        	$('#endtime').datepicker('setDate', startDate - 3600*1000*24*6);
				        }
				        $('#endtime').datepicker( "option", "minDate", startDate );
				    }
				});
				var current = new Date();
				var year = current.getFullYear();
				var month = current.getMonth()+1;
				var day = current.getDate();
				
				var tmp_current=new Date(current.getTime()-6 * 24 * 3600 * 1000);
				var tmp_year = tmp_current.getFullYear();
				var tmp_month = tmp_current.getMonth()+1;
				var tmp_day = tmp_current.getDate();
				if(month<10){
					month = '0'+month;
				}
				if(day<10){
					day = '0'+day;
				}
				if(tmp_month<10){
					tmp_month = '0'+tmp_month;
				}
				if(tmp_day<10){
					tmp_day = '0'+tmp_day;
				}
				$("#starttime").val(tmp_year+"-"+tmp_month+"-"+tmp_day);
				$("#endtime").datepicker({
					changeMonth : true,
					changeYear : true,
					showWeek : true,
					showButtonPanel : true,
					gotoCurrent : true,
					dateFormat : "yy-mm-dd",
					maxDate : +0,
					minDate :-6,
					onSelect: function( endDate ) {
				        var startDate = $( "#starttime" ).datepicker( "getDate" );
				        if(endDate < startDate){
				        	$( "#starttime" ).datepicker('setDate', startDate + 3600*1000*24*6);
				        }
				        $( "#starttime" ).datepicker( "option", "maxDate", endDate );
				    }
				});
				$("#endtime").val(year+"-"+month+"-"+day);
				
				
				
				safewall.queryOpenVM();
				//safewall.quaryDataTable();
				//safewall.queryOpenVM();
				$("#query").bind('click',function(){
					safewall.quaryDataTable();	
				});
				$("#btn_ref").bind('click',function(){
					safewall.quaryDataTable();
				});
				
		},
		queryOpenVM:function(){
			var params={state:"on",csType:"2"};
			com.skyform.service.dpService.cloudSecurityQuery(params,function onSuccess(data){
			$('#vmName').html('<option value="">请选择</option>');
			$(data).each(function(i,item){
				var oNew=new Option();
				
				oNew.text=item.vmName;
				oNew.value=item.vmId;
				
				$('#vmName').append(oNew);
				
			});
			//$("vmName option[value='"+safewall.data_vmId+"']").attr(value);
			if(safewall.data_vmId){
			    $("#vmName option[value='"+safewall.data_vmId+"']").attr("selected",true);
			};
			safewall.quaryDataTable();
			},function onError(msg){
				$.growlUI("提示", msg);
			});
		},
		
		GetQueryString :function(name){
			var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
			var r = window.location.search.substr(1).match(reg);
			if(r!=null)return unescape(r[2]); return null;
		},
		
		//管理员充值汇总页面
		
		_getQueryCondition : function() {
			var condition = {};
			condition={
			    	    "timeType": "CUSTOM_RANGE",
//			    	    "rangeFrom": "2014-10-11 08:00:00",
			    	    "rangeFrom":$("#starttime").val()+" 00:00:00",
			    	    "rangeTo": $("#endtime").val()+" 23:59:59",
			    	    "hostType": "ALL_HOSTS",
			    	    "targetPage":1,
			    	    "rowCount":5
			    	    //"hostUUID": $("#vmName").val(),
			    		};
			    if($("#vmName").val()){
			    	condition.vmId=$("#vmName").val();
			    	condition.hostType="SPECIFIC_HOST";
			    };
			    
			
			
			return condition;
		},
		
		_updateData : function() {
			
//			var pageInfo = {
//				"totalPage" : safewall.instances.totalPage,
//				"currentPage" : 1,
//				"data" : safewall.instances.events,
//				"_TOTAL_" : VdiskVolume.instances.totalRecord,
//				"pageSize" : VdiskVolume.instances.rowCount
//			};
			
			var pageInfo ={
				"totalPage" : Math.ceil(safewall.instances.count/5),
				"currentPage" : 1,
				"data" : safewall.instances.events,
				"_TOTAL_" : safewall.instances.count,
				"pageSize" : safewall.instances.rowCount
			};
			
			safewall.datatable.setPaginateInfo(pageInfo);
		},
		
		loadDataTable :function(dataAddr) {
			if(safewall.datatable){
				//safewall.datatable.updateData(dataAddr);
				safewall._updateData();
			}else{
				safewall.datatable = new com.skyform.component.DataTable(),
				safewall.datatable.renderByData("#safewallTable", {
					'selfPaginate' : true,
//					"data" : dataAddr,
					"iDisplayLength": 5,				
					"columnDefs" : [
					     {title : "", name : "id"},
					     {title : "检测时间" , name :"startTime"},
					     {title : "云主机名称", name : "hostName"},
					     {title : "处理方式", name : "action"},
					     {title : "方向", name : "direction"},
					     {title : "帧类型", name : "frameType"},

					     
					],
					"onColumnRender" : function(columnIndex, columnMetaData, columnData) {
						var text = "";
						if (columnMetaData.name == "id") {
								text = '<input type="checkbox" value="'+columnData.firewallEventID+'">';
						 }
						else if('startTime'==columnMetaData.startTime){
							text=columnData.startTime;
				        }
						else if('hostName'==columnMetaData.name){
							text=columnData.hostName;
						}
						else if('action'==columnMetaData.name){
							text=columnData.action;
						}else if('direction'==columnMetaData.name){
							//console.log(columnData);
							text=columnData.direction;
						}
						else if('frameType'==columnMetaData.name){
							text=columnData.frameType;
						}
						else{
							 text = columnData[''+columnMetaData.name] || "";
						}
						 return text;
					}, 
					"pageInfo" : {
						"totalPage" : Math.ceil(dataAddr.count/5),
						"currentPage" : 1,
						"data" : dataAddr.events,
						"_TOTAL_" : dataAddr.count,
						"pageSize" : dataAddr.rowCount
					},
					
					"onPaginate" : function(targetPage) {
						var condition = safewall._getQueryCondition();
						var _rowCount=5;
						condition.targetPage=targetPage;
						condition.rowCount=_rowCount;
						var reqParam={};
					    reqParam.params=condition;
						
						safewall.service.queryCloudFirewallEvent(reqParam,function onSuccess(data){
						//VdiskVolume.service.listAll(condition,function onSuccess(data){
						//	safewall.instances = data;
							var pageInfo = {
									"totalPage" : Math.ceil(data.count/5),
									"currentPage" : targetPage,
									"data" :data.events,
									"_TOTAL_" : data.count,
									"pageSize" : data.rowCount
								};
							safewall.datatable.setPaginateInfo(pageInfo);
						});
					},
					
					"afterRowRender" : function(rowIndex, data, tr){
						tr.attr("id", data.firewallEventID).
						attr("startTime",data.startTime).
						attr("hostName", data.hostName).
						attr("action", data.action).
						attr("direction",data.direction).
						attr("frameType",data.frameType).
						attr("flow",data.flow).
						attr("destinationIP", data.destinationIP).
						attr("iface", data.iface).
						attr("destinationMAC",data.destinationMAC).
						attr("protocol", data.protocol).
						attr("destinationPort", data.destinationPort).
						attr("flags",data.flags).
						attr("sourceIP",data.sourceIP).
						attr("eventOrigin",data.eventOrigin).
						attr("sourceMAC", data.sourceMAC).
						attr("reason", data.reason).
						attr("sourcePort",data.sourcePort);
						tr.unbind("click").click(function(){
						//	tr.find("input[type='checkbox']").attr("checked",false);
							$("#safewallTable tbody input[type='checkbox']").attr("checked",false);
							tr.find("input[type='checkbox']").attr("checked",true);
				        //	    var instanceid=$(this).attr("id");
//				           	    $("#info_flow").html($(this).attr("flow")||"");
//								$("#info_destinationIP").html($(this).attr("destinationIP")||"");
//								$("#info_iface").html($(this).attr("iface")||"");
//								$("#info_destinationMAC").html($(this).attr("destinationMAC")||"");
//								$("#info_protocol").html($(this).attr("protocol")||"");
//								$("#info_destinationPort").html($(this).attr("destinationPort")||"");
//								$("#info_flags").html($(this).attr("flags")||"");
//								$("#info_sourceIP").html($(this).attr("sourceIP")||"");
//								$("#info_eventOrigin").html($(this).attr("eventOrigin")||"");
//								$("#info_sourceMAC").html($(this).attr("sourceMAC")||"");
//								$("#info_reason").html($(this).attr("reason")||"");
//								$("#info_sourcePort").html($(this).attr("sourcePort")||"");
							
							$("#info_flow").html(data.flow||"");
							$("#info_destinationIP").html(data.destinationIP||"");
							$("#info_iface").html(data.iface||"");
							$("#info_destinationMAC").html(data.destinationMAC||"");
							$("#info_protocol").html(data.protocol||"");
							$("#info_destinationPort").html(data.destinationPort||"");
							
							$("#info_flags").html(data.dataFlags||"0");
							$("#info_sourceIP").html(data.sourceIP||"");
							$("#info_eventOrigin").html(data.eventOrigin||"");
							$("#info_sourceMAC").html(data.sourceMAC||"");
							$("#info_reason").html(data.reason||"");
							$("#info_sourcePort").html(data.sourcePort||"");
				          }); 
					},
				});
			}
		},
		
		loadInfoTable:function(dataAddr){
			if(dataAddr&&dataAddr.length!=0){
				$("#info_flow").html(dataAddr[0].flow);
				$("#info_destinationIP").html(dataAddr[0].destinationIP);
				$("#info_iface").html(dataAddr[0].iface);
				$("#info_destinationMAC").html(dataAddr[0].destinationMAC);
				$("#info_protocol").html(dataAddr[0].protocol);
				$("#info_destinationPort").html(dataAddr[0].destinationPort);
				$("#info_flags").html(dataAddr[0].dataFlags);
				$("#info_sourceIP").html(dataAddr[0].sourceIP);
				$("#info_eventOrigin").html(dataAddr[0].eventOrigin);
				$("#info_sourceMAC").html(dataAddr[0].sourceMAC);
				$("#info_reason").html(dataAddr[0].reason);
				$("#info_sourcePort").html(dataAddr[0].sourcePort);
			}else{
				$("#info_flow").html();
				$("#info_destinationIP").html();
				$("#info_iface").html();
				$("#info_destinationMAC").html();
				$("#info_protocol").html();
				$("#info_destinationPort").html();
				$("#info_flags").html();
				$("#info_sourceIP").html();
				$("#info_eventOrigin").html();
				$("#info_sourceMAC").html();
				$("#info_reason").html();
				$("#info_sourcePort").html();	
			}
		},
		getCheckedArr :function() {
			return $("#safewallTable tbody input[type='checkbox']:checked");
		},
		//查询table
		quaryDataTable:function(){
			if(safewall.datatable){
				safewall.datatable.container.find("tbody").html("<tr ><td colspan='7' style='text-align:center;'><img src='"+CONTEXT_PATH+"/images/loader.gif'/><strong>"+Dict.val("common_retrieving_data_please_wait")+"</strong></td></tr>");
			}
			    var paramData={
			    	    "timeType": "CUSTOM_RANGE",
//			    	    "rangeFrom": "2014-10-11 08:00:00",
			    	    "rangeFrom":$("#starttime").val()+" 00:00:00",
			    	    "rangeTo": $("#endtime").val()+" 23:59:59",
			    	    "hostType": "ALL_HOSTS",
			    	    "targetPage":1,
			    	    "rowCount":5
			    	    //"hostUUID": $("#vmName").val(),
			    		};
//			    console.log($("#vmName").val());
			    if($("#vmName").val()){
			    	paramData.vmId=$("#vmName").val();
			    	paramData.hostType="SPECIFIC_HOST";
			    };
			    var reqParam={};
			    reqParam.params=paramData;
				safewall.service.queryCloudFirewallEvent(reqParam,function onSuccess(data){
					$("#load_waiting_temp").hide();
//					var data=data.events;
//					data= [
//					         {
//					           "dataFlags": 8,
//					           "direction": "传入",
//					           "protocol": "N/A",
//					           "destinationPort": "N/A",
//					           "packetSize": 110,
//					           "hostName": "DSHA-nn2.clouddata.demo",
//					           "rank": 50,
//					           "reason": "IPv6 数据包",
//					           "hostID": 72,
//					           "dataIndex": 112,
//					           "startTime": "2016-04-11 14:45:58",
//					           "sourcePort": "N/A",
//					           "sourceIP":"192.168.0.1",
//					           "destinationMAC": "33:33:00:01:00:02",
//					           "sourceMAC": "00:B2:73:64:1C:7B",
//					           "iface": "00:B2:73:64:1C:29",
//					           "destinationIP": "192.168.1.1",
//					           "firewallEventID": 91045,
//					           "data": "MzMAAQACALJzZBx7ht1gAAAAADgRQP6AAAAAAAAAArJz//5kHHv/AgAAAAAAAAAAAAAAAQACAiICIwA4QNQ=",
//					           "flow": "连接流",
//					           "note":222,
//					           "flags": null,
//					           "eventOrigin": "GUESTAGENT",
//					           "repeatCount": 1,
//					           "action": "拒绝",
//					           "endTime": 2222,
//					           "frameType": "其他: 86DD"
//					         },
//					         {
//						           "dataFlags": 7,
//						           "direction": "传入",
//						           "protocol": "N/A",
//						           "destinationPort": "N/A",
//						           "packetSize": 11,
//						           "hostName": "DSHA-nn2.clouddata.demo",
//						           "rank": 5,
//						           "reason": "IPv6 数据包",
//						           "hostID": 7,
//						           "dataIndex": 11,
//						           "startTime": "2016-04-11 14:45:58",
//						           "sourcePort": "N/A",
//						           "sourceIP": null,
//						           "destinationMAC": "33:33:00:01:00:02",
//						           "sourceMAC": "00:B2:73:64:1C:7B",
//						           "iface": "00:B2:73:64:1C:29",
//						           "destinationIP": null,
//						           "firewallEventID": 910,
//						           "data": "MzMAAQACALJzZBx7ht1gAAAAADgRQP6AAAAAAAAAArJz//5kHHv/AgAAAAAAAAAAAAAAAQACAiICIwA4QNQ=",
//						           "flow": "连接流",
//						           "note": null,
//						           "flags": null,
//						           "eventOrigin": "GUESTAGENT",
//						           "repeatCount": 1,
//						           "action": "拒绝",
//						           "endTime": null,
//						           "frameType": "其他: 86DD"
//						         }
//					       ];
					if(!data){data=[];};
					if(data){
					safewall.instances = data;
					safewall.loadDataTable(data);
					safewall.loadInfoTable(data.events);
					};
				},function onError(msg){
					$.growlUI("提示", msg);
				});
			
			
			;	
	    },
		};


