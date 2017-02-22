/**
 * 防病毒规则
 */
var AntiVirusResult = {
	datatable : null,
	instances : [],
	vmid : null,
	vmname : "",
	ScanType : {
		"REALTIME" : "实时扫描",
		"MANUAL" : "手动扫描"
	},
	_init : function(){
		$("#vmName option").remove();
		$("#vmName").append("<option value=''>请选择</option>");
		var selectBox = $("#scanTable input[type='checkbox']:checked")[0];
		AntiVirus.service.queryAntiVirusScans("", function(data) {
			$(data).each(function(index, vm){
				if(selectBox || AntiVirusResult.vmid){
					$("#vmName").append("<option value='"+vm.vmId+"' selected='selected'>"+vm.vmName+"</option>");
					AntiVirusResult.vmid = vm.vmId;
					AntiVirusResult.vmname = vm.vmName;
				} else {
					$("#vmName").append("<option value='"+vm.vmId+"'>"+vm.vmName+"</option>");
				}
			});
		},function onError(error){
		});	
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
		AntiVirusResult._refresh();
		$("#details").hide();
		AntiVirusResult._bindEvent();
	},
	_query : function(condition, callback) {
		AntiVirus.service.queryAntiVirusResults(condition, function(data) {
			AntiVirusResult.instances = data;	
			if(callback && typeof callback == 'function')		callback(data);
		},function onError(error){
		});	
	},
	_getCondition : function(targetPage){
		var condition = {};
		var params = {
				"timeType": "CUSTOM_RANGE",
				"rangeFrom": $("#starttime").val()+" 00:00:00",
				"rangeTo": $("#endtime").val()+" 23:59:59",
				"hostType": "ALL_HOSTS"
	 	};
		if(AntiVirusResult.vmid && AntiVirusResult.vmid!=""){
			params = {
				"timeType": "CUSTOM_RANGE",
			    "rangeFrom": $("#starttime").val()+" 00:00:00",
			    "rangeTo": $("#endtime").val()+" 23:59:59",
			    "hostType": "SPECIFIC_HOST",
			    "vmId" : AntiVirusResult.vmid
		 	};
		}
		condition.params = params;
        condition.params.targetPage = targetPage==null ? 1 : targetPage;
        condition.params.rowCount = 10;
        return condition;
	},
	_renderDataTable : function() {
		if(AntiVirusResult.datatable == null){
			AntiVirusResult._initDataTable(AntiVirusResult.instances);
		}else{
			AntiVirusResult._updateTable(AntiVirusResult.instances);
		}
	},
	_updateTable : function(result){
		var pageInfo = {
            "totalPage" : Math.ceil(result.count/result.rowCount),
            "totalCount":   result.count,
            "currentPage" : 1,
            "data" : result.events
        };
        AntiVirusResult.datatable.setPaginateInfo(pageInfo);
	},
	_initDataTable : function(dataResult) {
		AntiVirusResult.datatable = new com.skyform.component.DataTable();
		AntiVirusResult.datatable.renderByData("#resultTable", {
			"selfPaginate" : true,
			"onColumnRender" : function(columnIndex,columnMetaData,columnData) {
				 var text = columnData[''+columnMetaData.name] || "";
				 if ("scanType" == columnMetaData.name) {
					 text = AntiVirusResult.ScanType[columnData.scanType];
				 }
				 return text;
			}, 
			"afterRowRender" : function(rowIndex,data,tr){
				tr.attr("subsid", data.subsid);
				AntiVirusResult.bindEventForTr(rowIndex, data, tr);
			},
			"pageInfo" : {
				"totalPage" : Math.ceil(dataResult.count/dataResult.rowCount),
				"currentPage" : 1,
				"data" : dataResult.events,
				"_TOTAL_" : dataResult.count,
				"pageSize" : dataResult.rowCount
            },
            "onPaginate" : function(targetPage) {
            	var condition = AntiVirusResult._getCondition(targetPage);
            	AntiVirusResult._query(condition, function(result){
                    var pageInfo = {
                        "totalPage" : Math.ceil(result.count/result.rowCount),
                        "_TOTAL_":   result.count,
                        "currentPage" : targetPage,
                        "data" : result.events,
                        "pageSize" : result.rowCount
                    };
                    AntiVirusResult.datatable.setPaginateInfo(pageInfo);
                });
            }
		});
		AntiVirusResult.datatable.addToobarButton("#toolbar-3");
		AntiVirusResult.datatable.enableColumnHideAndShow("right");
	},
	bindEventForTr : function(rowIndex, data, tr){
		//right click event
		$(tr).unbind().mousedown(function(e){
			AntiVirusResult.setSelectRowBackgroundColor(tr);
		});
		//click event
		$(tr).click(function() {
			var checked = $(this).find("td").find("input[type='checkbox']").attr("checked");
			if(checked=="checked"){
				AntiVirusResult.checkSelected(tr);
			}
		});
	},
	_bindEvent : function(){
		$("#btn-result-refresh").unbind("click").bind("click", function(){
			AntiVirusResult._refresh();
		});
		$("#btn-result-query").unbind("click").bind("click", function(){
			AntiVirusResult.vmid = $("#vmName").val();
			AntiVirusResult._refresh();
		});
	},
	setSelectRowBackgroundColor : function(handler) {
		$("#content_container_3 tr").css("background-color","");
		handler.css("background-color","#d9f5ff");
	},
	_refresh : function() {
		var condition = AntiVirusResult._getCondition();
		AntiVirusResult._query(condition,function(data) {
			$("#load_waiting_tbl_3").hide();
			if(data){
				AntiVirusResult._renderDataTable();
			}
		},function onError(error){
			$.growlUI(Dict.val("common_tip"), Dict.val("common_query_error")+error);
		});	
	}
};
