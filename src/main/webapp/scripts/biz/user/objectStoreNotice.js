$(function(){
	objStoreN.init();
});
var objStoreN = {
		datatable:null,
		instances:null,
		pools:null,
		init:function(){
			objStoreN.pools = Config.pools;
			var date = new Date();
			var year = date.getFullYear();
			var month = date.getMonth()+1;
			var strHref = window.document.location.href;
			var index = strHref.indexOf("?");
			if(index > 0){
				var array = strHref.substring(strHref.indexOf("?")+1,strHref.length).split("&");
				var queryTime = array[2].split("=");
				if(queryTime[0]=="queryTime"){
					var y1 = queryTime[1].substring(0,4);
					var y = parseInt(y1);
					var m1 = queryTime[1].substring(4,6);
					var m = parseInt(m1);
					if(m == month&&y==year){
						$("#startTime").val(y+"-"+m1+"-01");
						var formate = date.format("yyyy-MM-dd ");
						$("#endTime").val(formate);
					}else{
						var day = objStoreN.DayNumOfMonth(y, m);
						console.log(day);
						$("#startTime").val(y+"-"+m1+"-01");
						$("#endTime").val(y+"-"+m1+"-"+day);
					}
				}
			}
			
			objStoreN.describeOJN();
			objStoreN.bindEvent();
		},
		describeOJN:function(){
			var condition = objStoreN.getCondition();
			if(condition){
				Dcp.biz.apiAsyncRequest("/user/queryBillDetailForMeasure",condition, function(data) {
					if(data.code == "0"){
						objStoreN.instances = data.data;	
						objStoreN.renderDataTable();
					}else{
						$.growlUI("提示", data.msg);
					}
					
				},function onError(){
					$.growlUI("提示", "查询数据发生错误");
				});
			}else{
				objStoreN.instances = [];	
				objStoreN.renderDataTable();
			}
			
		},
		renderDataTable:function(){
			if(objStoreN.datatable == null){
				objStoreN.initDataTable();
			}else{
				objStoreN.updateDataTable();
			}
		},
		getCondition:function(){
			var startTime = $("#startTime").val();
			var endTime = $("#endTime").val();
			if(startTime.length == 0){
				$.growlUI("提示", "起始日期不能为空");
				return
			}
			if(endTime.length == 0){
				$.growlUI("提示", "结束日期不能为空");
				return
			}
			var date = new Date();
			var month = date.getMonth()+1;
			var monthRange = month - 6;
			var year = date.getFullYear();
			var stArr = startTime.split("-");
			var enArr = endTime.split("-");
//			if(stArr[0] != year||enArr[0] != year){
//				if(monthRange < 0){
//					$.growlUI("提示", "只能今年查询一月到"+month+"月");
//				}else{
//					$.growlUI("提示", "只能今年查询"+monthRange+"月到"+month+"月");
//				}
//				
//				return
//			}
			if(stArr[0]!=enArr[0]){
				$.growlUI("提示", "不能跨月查询对象存储的详单");
				return
			}
			if(stArr[1] != enArr[1]){
				$.growlUI("提示", "不能跨月查询对象存储的详单");
				return
			}
			var strDay = parseInt(stArr[2]);
			var endDay = parseInt(enArr[2]);
			if(strDay > endDay){
				$.growlUI("提示", "起始日期不能超过结束日期");
				return
			}
			var st = ""+stArr[0]+""+stArr[1]+""+stArr[2];
			var end = ""+enArr[0]+""+enArr[1]+""+enArr[2];
			var condition = {
					"startTime":st,
					"endTime":end,
					"serviceType":"1012"
			};
			return condition;
		},
		updateDataTable : function(){
			objStoreN.datatable.updateData(objStoreN.instances);
		},
		initDataTable:function(){
			objStoreN.datatable = new com.skyform.component.DataTable();
			objStoreN.datatable.renderByData("#objectStoreTable", {
					"data" : objStoreN.instances,
					"pageSize" : 5,
					"bSort":false,
					"onColumnRender" : function(columnIndex,columnMetaData,columnData) {
						 var text = columnData[''+columnMetaData.name] || "";
						 if (columnMetaData.name == "instanceName") {
							 text = columnData.subscriptionName;
						 }else if(columnMetaData.name == "inFlow"){
							 var temp = columnData.inputKb / 1024 / 1024 ;
							 if(temp > 1){
								 text =temp.toFixed(2) +"M";
							 }else{
								 text = (columnData.inputKb / 1024).toFixed(2)+"KB";
							 }
							 
						 }else if(columnMetaData.name == "inFee"){
							 //text = columnData.inputFee / 1000+"元";
							 text=0+"元";
						 }else if(columnMetaData.name == "outFlow"){
							 var temp = columnData.ouputKb / 1024 / 1024;
							 if(temp > 1){
								 var m = temp;
								 text =m.toFixed(2) +"M";
							 }else{
								 text = (columnData.ouputKb / 1024).toFixed(2)+"KB";
							 }
						 }else if(columnMetaData.name == "outFee"){
							 //text = columnData.outputFee / 1000+"元";
							 text=0+"元";
						 }else if(columnMetaData.name == "requestCount"){
							 text = columnData.times+"次";
						 }else if(columnMetaData.name == "reFee"){
							 //text = columnData.timesFee+"元";
							 text=0+"元";
						 }else if(columnMetaData.name == "storeSize"){
							 var temp = columnData.useKb / 1024;
							text = temp.toFixed(2)+"M";
						 }else if(columnMetaData.name == "stFee"){
							 //text = columnData.useFee / 1000 +"元";
							 text=0+"元";
						 }else if(columnMetaData.name == "feeTime"){
							 text = columnData.dateTime;
						 }else if(columnMetaData.name == "resourcePool"){
							 text = objStoreN.pools[columnData.pool];
						 }
						 
						 return text;
					}, 
					"afterRowRender" : function(rowIndex,data,tr){
						
					},
					afterTableRender : function() {
					}
			});
			//objStoreN.datatable.enableColumnHideAndShow("right");		 
		},
		bindEvent:function(){
			$(".basicDatepickerTime").datepicker({
				showButtonPanel : true,
				changeYear : true,
				changeMonth : true,
				dateFormat : "yy-mm-dd",
	            closeText:"关闭",
	            nextText:"下一月",
	            prevText:"上一月",
	            hideIfNoPrevNext: true,
	            currentText: '今天',
	            monthNamesShort: ['一月','二月','三月','四月','五月','六月',
	                      		'七月','八月','九月','十月','十一月','十二月'],
		         dayNamesMin: ['日','一','二','三','四','五','六'],
		         showMonthAfterYear: true,
			});
			$.datepicker._gotoToday = function(id) {
				 var target = $(id);
				 var inst = this._getInst(target[0]);
				 if (this._get(inst, 'gotoCurrent') && inst.currentDay) {
				   inst.selectedDay = inst.currentDay;
				   inst.drawMonth = inst.selectedMonth = inst.currentMonth;
				   inst.drawYear = inst.selectedYear = inst.currentYear;
				 }
				 else {
				   var date = new Date();
				   inst.selectedDay = date.getDate();
				   inst.drawMonth = inst.selectedMonth = date.getMonth();
				   inst.drawYear = inst.selectedYear = date.getFullYear();
				   // the below two lines are new
				   this._setDateDatepicker(target, date);
				   this._selectDate(id, this._getDateDatepicker(target));
				 }
				 this._notifyChange(inst);
				 this._adjustDate(target);
				};
				$("#btnSearch").click(function(){
						objStoreN.describeOJN();
					
				});
//			var date = new Date();
//			var year = date.getFullYear();
//			var month = date.getMonth();
//			var day = objStoreN.DayNumOfMonth(year, month);
//			$(".basicDatepickerTime").datepicker("option", "minDate",new Date(year,month,01));
//			$(".basicDatepickerTime").datepicker("option", "maxDate",new Date(year,month,day));
		},
		DayNumOfMonth:function(Year,Month)
		{
		    var d = new Date(Year,Month+1,0);
		    return d.getDate();
		},
};