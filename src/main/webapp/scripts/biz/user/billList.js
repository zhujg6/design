window.currentInstanceType='bill';

$(function(){
	bill.init();
});
var bill = {
		datatable:null,
		instances : [],
		service : com.skyform.service.billService,
		
		availablePrint : 0,
		init : function() {
			//加载下拉菜单
			bill.selectList();
			// 查询发票列表按钮事件
			$("#querybill").click(bill.queryBill);
			//点击导出按钮
			$("#exportBill").unbind().click(function(){
				bill.exportBill();
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
					dateFormat : "yymmdd",
					maxDate : +0
				});
			/*	var current = new Date();
				var year = current.getFullYear();
				var month = current.getMonth()+1;
				var day = current.getDate();
				if(month<10){
					month = '0'+month;
				}
				$("#starttime").val(year+'-'+month+'-'+'01');*/
				$("#endtime").datepicker({
					changeMonth : true,
					changeYear : true,
					showWeek : true,
					showButtonPanel : true,
					gotoCurrent : true,
					dateFormat : "yymmdd",
					maxDate : +0
				});
			/*	if(day<10){
					day = '0'+day;
				}
				$("#endtime").val(year+'-'+month+'-'+day);*/
				
		},
		//查询发票列表
		queryBill : function() {
			var startDate = $("#starttime").val();
			startDate = startDate.replace(/-/g,"");	
			var endDate = $("#endtime").val();
			endDate = endDate.replace(/-/g,"");
			if(startDate==""||endDate==""){
				$.growlUI("提示", "开始时间和结束时间不能为空！"); 
				return;
			}
			if(startDate>endDate){
				$.growlUI("提示", "开始时间不能大于结束时间！"); 
				return;
			}
			 var tikectTypeval = $('.tikectType').val();
			 var billTypeval = $('.billType').val();
			 var Typeval = $('.Type').val();
			 /*dataa={
					  "msg": "查询成功!",
					  "data": [
					    {
					      "serialCode": "73692726",
					      "invoiceItem": 1,
					      "printMonths": "201501,201502",
					      "invoiceName": "联通云数据公司NewNew",
					      "invoiceType": 1,
					      "createDate": 1446791662000,
					      "receiver": "林一鸣New",
					      "postAddress": "二龙路中国联通研究院New",
					      "telephone": "18600011235",
					      "printFee": 200000,
					      "invoiceStatus": 0,
					      "postDate": 1446791662000,
					      "postCode": "100086"
					    }
					  ],
					  "code": 0
					};*/
			//bill.instances = dataa.data;
			var params = {
					  "startDate":startDate,
					  "endDate":endDate,
					  "invoiceType":tikectTypeval,
					  "invoiceItem":billTypeval,
					  "invoiceStatus":Typeval
			};
			
				bill.service.describePrintLog(params,function onSuccess(data){
					//console.log(data);
					/*$.each(data,function(i,n){
						for(var j=0;j<cityJson[data[i]["areaNo"]].length;j++){
							
							if(cityJson[data[i]["areaNo"]][j].value==data[i]["cityNo"]){
								
								
								data[i]["cityNo"]=cityJson[data[i]["areaNo"]][j].name;
								
								
							
								
							}
							
					 }
					});
					
					console.log(data);
					$.each(data,function(i,n){
						for(var name in provinceJson){
							if(name==data[i].areaNo){
								data[i].areaNo=provinceJson[name];
							}
						}
						
						//i++;
					});
					*/
					//console.log(data);
				$.each(data,function(i,n){
					
					bill.p2h(data[i]);
				})
				bill.instances = data;
				
					//data = dataa.data;
				if(bill.datatable==null){
				bill.renderDataTable(data);
			}else{
				//bill.updateDataTable(data);
				bill.datatable.updateData(data);
			}
			},function onError(msg){
				$.growlUI("提示", "查询发生错误：" + msg); 
			});
		
		},
		renderDataTable : function(data) {
			bill.datatable = new com.skyform.component.DataTable(),
			bill.datatable.renderByData("#billListTable", {
					"data" : data,
					"iDisplayLength": 5,				
					"columnDefs" : [
					     {title : "申请时间", name : "createDate"},
					     {title : "开具类型", name : "invoiceType"},
					     {title : "发票类型", name : "invoiceItem"},
					     {title : "发票抬头", name : "invoiceName"},
					     {title : "发票金额", name : "printFee"},
					     {title : "寄送时间", name : "postDate"},
					     {title : "状态", name : "invoiceStatus"}
					],
					"onColumnRender" : function(columnIndex, columnMetaData, columnData) {
						 var text = columnData[''+columnMetaData.name] || "";
						 if (columnMetaData.name == "createDate") {
							 text = new Date(text).format("yyyy-MM-dd hh:mm:ss");
						 }
						 if (columnMetaData.name == "invoiceType") {
							 text = com.skyform.service.billInfoService.getInvoiceType(columnData.invoiceType);
						 }
						 if (columnMetaData.name == "invoiceItem") {
							 text = com.skyform.service.billInfoService.getInvoiceItem(columnData.invoiceItem);
						 }
						 if (columnMetaData.name == "invoiceName") {
							 text = text;
						 }
						 if (columnMetaData.name == "invoiceStatus") {
							 text= com.skyform.service.BillStateService.getBillState(columnData.invoiceStatus);
						 }
						 if (columnMetaData.name == "printFee") {
							 text = text/1000;
						 }
						 if (columnMetaData.name == "postDate") {
							 if(columnData.invoiceStatus==2){
								
								 text = new Date(text).format("yyyy-MM-dd hh:mm:ss"); 
							 }else{
								 text ="";
							 }
						 }
						 return text;
					}, 
					"afterRowRender" : function(rowIndex, data, tr){
						
						tr.attr("serialCode", data.serialCode).
						attr("printMonths", data.printMonths).
						attr("receiver", data.receiver).
						attr("invoiceItem", data.invoiceItem).
						attr("telephone", data.telephone).
						attr("postCode", data.postCode).
						attr("printDate", data.printDate).
						attr("postAddress", data.postAddress).
						attr("areaNo",data.areaNo).
						attr("cityNo",data.cityNo);
						tr.click(function() {
							bill.getRelateHosts($(this));
						});
					},
					"afterTableRender" : function() {
						var firstRow = $("#billListTable tbody").find("tr:eq(0)");
						bill.getRelateHosts(firstRow);
					}
				}
			);
			bill.datatable.addToobarButton("#disktoolbar");
			bill.datatable.enableColumnHideAndShow("right");
		},
		// 刷新Table
		updateDataTable : function(data) {/*
			var startDate = $("#starttime").val();
			startDate = startDate.replace(/-/g,"");			
			var endDate = $("#endtime").val();
			endDate = endDate.replace(/-/g,"");
			if(startDate==""||endDate==""){
			$.growlUI("提示", "开始时间和结束时间不能为空！"); 
			return;
		}
		if(startDate>endDate){
			$.growlUI("提示", "开始时间不能大于结束时间！"); 
			return;
		}
		 var tikectTypeval = $('.tikectType').val();
		 var billTypeval = $('.billType').val();
		 var Typeval = $('.Type').val();
		 //bill.datatable.updateData(data);
			//bill.instances = data;
		 console.log("updateDataTable");
			var params = {
					  "startDate":startDate,
					  "endDate":endDate,
					  "invoiceType":tikectTypeval,
					  "invoiceItem":billTypeval,
					  "invoiceStatus":Typeval
			};
			bill.service.describePrintLog(params,function onSuccess(data){
				console.log(data);
				//bill.instances = data;
				bill.datatable.updateData(data);	
			},function onError(msg){
			});
		*/},
		getRelateHosts : function(data) {
			
			$("#details").attr("style","display:block;");
			$("#relateHosts").html("");
			var printmonths = data.attr("printmonths");
			var receiver = data.attr("receiver");
			var telephone = data.attr("telephone");
			var postCode = data.attr("postCode");
			var postAddress = data.attr("postAddress");
			var areaNo=data.attr("areaNo");
			var cityNo=data.attr("cityNo");
			
			var dom = "";
			var tabDom = "";
			var textCity="";
			var textProvince="";
			
			if(typeof(areaNo)=="undefined"){
				printmonths="";
			    receiver = "";
				telephone = "";
				postCode = "";
				postAddress = "";
				areaNo="";
				cityNo="";
			}
				dom += "<li class=\"detail-item\">" 
								+ "<span>"
								+ "账单时间："
								+ "</span>&nbsp;&nbsp;&nbsp;&nbsp;"
								+ "<span>"+printmonths
								+ "</span>&nbsp;&nbsp;&nbsp;&nbsp;"
								+ "<span>"
								+ "收件人姓名："
								+ "</span>&nbsp;&nbsp;&nbsp;&nbsp;"
								+ "<span>"+receiver
								+ "</span>&nbsp;&nbsp;&nbsp;&nbsp;"
								+ "<span>"
								+ "电话号码："
								+ "</span>&nbsp;&nbsp;&nbsp;&nbsp;"
								+ "<span>"+telephone
								+ "</span>&nbsp;&nbsp;&nbsp;&nbsp;"
								+ "<span>"
								+ "邮编："
								+ "</span>&nbsp;&nbsp;&nbsp;&nbsp;"
								+ "<span>"+postCode
								+ "</span>&nbsp;&nbsp;&nbsp;&nbsp;"
								+ "<span>"
								+ "地址："
								+ "</span>&nbsp;&nbsp;&nbsp;&nbsp;"
								+ "<span>"+areaNo+cityNo+postAddress
								+ "</span>&nbsp;&nbsp;&nbsp;&nbsp;"
								+ "</li>";
			tabDom +="<table class='table dataTable' contenteditable='false' style='margin-left: 0px; width: 100%;'>"
				+"<thead>"
				    +"<tr>"
					+"<th rowspan='1' colspan='2'>账单时间</th>" 
					+"<th rowspan='1' colspan='1'>收件人姓名</th>" 
					+"<th rowspan='1' colspan='2'>电话号码</th>"
					+"<th rowspan='1' colspan='1'>邮编</th>"
					+"<th rowspan='1' colspan='6'>地址</th>"
					+"</tr>"
					+"</thead>"
					+"<tbody>"
					+"<tr>"
					+"<td rowspan='1' colspan='2'>"+printmonths+"</td>" 
					+"<td rowspan='1' colspan='1'>"+receiver+"</td>" 
					+"<td rowspan='1' colspan='2'>"+telephone+"</td>"
					+"<td rowspan='1' colspan='1'>"+postCode+"</td>"
					+"<td td rowspan='1' colspan='6'>"+areaNo+cityNo+postAddress+"</td>"
					+"</tr>"
					+"<tbody>"
					+"</table>";
				$("#relateHosts").append(tabDom);
		},
		
		
		 //省市拼音转汉字
		 p2h:function(data){
		  for(var i=0;i<cityJson[data["areaNo"]].length;i++){
									if(cityJson[data["areaNo"]][i].value==data["cityNo"]){
										data["cityNo"] =cityJson[data["areaNo"]][i].name;
									}
							 }
							 
				for(var name in provinceJson){
							if(name==data.areaNo){
								data.areaNo=provinceJson[name];
							}
						}				
		 return data;
		 
		 
		 	
		 },
		exportBill : function(){
			//console.log(bill.instances);
			var data = JSON.stringify(bill.instances);
			$("#exportForm #param").val(data);			
	        window.open("","newWin");
	        $("#exportForm").submit();
		},
		selectList : function(){
			$(".selectList").each(function(){
	            var oBillJson=
	  				{
					  "tikectType": [{"id":"0","name":"个人"},
					                 {"id":"1","name":"企业"}],
					  "billType": [
					               {
					            	   "cid":"0","id":"0","name":"增值税普通发票"
					               },
					    {
					      "cid":"1","id":"0","name": "增值税普通发票"
					    },
					    {
					      "cid":"1","id":"1","name": "增值税专用发票"
					    }
					  ]
					};
	            var oTypeJson=
  				{
				  "Type": [{"value":"0","name":"已申请"},
				           {"value":"1","name":"已打印"},
				           {"value":"2","name":"已邮寄"}],
				};
	                var   oTikectType = $('.tikectType',this);
	                var   oBillType = $('.billType',this);
	                var   oType = $('.Type',this);
	                var  tikectTypes = oBillJson.tikectType;
	                var billTypes = oBillJson.billType;
	                var Type=oTypeJson.Type;
	                var html = '';
	                for(var i=0; i<tikectTypes.length; i++){
	                         html += '<option value='+tikectTypes[i].id+'>'+tikectTypes[i].name+'</option>';
	                }
	                oTikectType.append(html);
	                oTikectType.bind('change',function(){
	                    var thtml = '';
	                    var val = $(this).val();
	                    for(var i=0; i<billTypes.length; i++){
	                         if(billTypes[i].cid == val){
	                              thtml += '<option value='+billTypes[i].id+'>'+billTypes[i].name+'</option>';
	                          }
	                    }
	                    oBillType.html("");
	                    oBillType.append(thtml);
	                 });
	                 var shtml = '';
	                 for(var i=0; i<Type.length; i++){
                         shtml += '<option value='+Type[i].value+'>'+Type[i].name+'</option>';
	                 }
	                 oType.append(shtml);
	        });
		},
};
