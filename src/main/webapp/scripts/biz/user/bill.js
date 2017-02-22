window.currentInstanceType='bill';

$(function(){
	bill.init();
});
var product = {};

var bill = {
		datatable : new com.skyform.component.DataTable(),
		instances : [],
		service : com.skyform.service.billService,
		availablePrint : 0,
		init : function() {
			//为table的右键菜单添加监听事件
			$("#contextMenu").bind('mouseover',function(){
				inMenu = true;
			});		
			$("#contextMenu").bind('mouseout',function(){
				inMenu = false;
			});
			
			$("#contextMenu li").bind('click',function(e){
				$("#contextMenu").hide();
				// 如果选项是灰色不可用的
				if (!$(this).hasClass("disabled")) {
					bill.onOptionSelected($(this).index());					
				}
			});
			
			// 新建虚拟硬盘
			$("#btnCreateVdiskVolume").click(bill.createVdiskVolume);
						
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
					maxDate : +0
				});
				var current = new Date();
				var year = current.getFullYear();
				var month = current.getMonth()+1;
				var day = current.getDate();
				if(month<10){
					month = '0'+month;
				}
				$("#starttime").val(year+'-'+month+'-'+'01');
				$("#endtime").datepicker({
					changeMonth : true,
					changeYear : true,
					showWeek : true,
					showButtonPanel : true,
					gotoCurrent : true,
					dateFormat : "yy-mm-dd",
					maxDate : +0
				});
				if(day<10){
					day = '0'+day;
				}
				$("#endtime").val(year+'-'+month+'-'+day);
				
			
			// 查询发票
			bill.describePrintLog();			
			bill.bindEvent();	
			
			$("#querybill").bind('click',function(){
				bill.updateDataTable();
			});
			$("#create_bill :input").blur(function(){
				//发票抬头
				if($(this).is('#billName')){
					if(valiter.isNull($.trim(this.value)) || $.trim($.trim(this.value)).length > 255){
						$("#tipBillName").removeClass("onError").html("");
						$("#tipBillName").addClass("onError").html("请输入255个以内的非特殊字符");
					}else{
						$("#tipBillName").removeClass("onError").html("");
					}					
				}
				
				var billtype = $("#sel_billtype").val();
				if(billtype == 102){
					if($(this).is('#taxpayerId')){  //纳税人识别号
						if(valiter.isNull($.trim(this.value)) || $.trim($.trim(this.value)).length > 255){
							$("#tipTaxpayerId").removeClass("onError").html("");
							$("#tipTaxpayerId").addClass("onError").html("请输入255个以内的非特殊字符");
						}else{
							$("#tipTaxpayerId").removeClass("onError").html("");
						}					
					}
					if($(this).is('#bankname')){  //开户行名称
						if(valiter.isNull($.trim(this.value)) || $.trim($.trim(this.value)).length > 255){
							$("#tipBankName").removeClass("onError").html("");
							$("#tipBankName").addClass("onError").html("请输入255个以内的非特殊字符");
						}else{
							$("#tipBankName").removeClass("onError").html("");
						}					
					}
					if($(this).is('#bankid')){  //开户行帐号
						if(valiter.isNull($.trim(this.value)) || $.trim($.trim(this.value)).length > 255){
							$("#tipBankId").removeClass("onError").html("");
							$("#tipBankId").addClass("onError").html("请输入255个以内的非特殊字符");
						}else{
							$("#tipBankId").removeClass("onError").html("");
						}					
					}
					if($(this).is('#compaddr')){  //开户行帐号
						if(valiter.isNull($.trim(this.value)) || $.trim($.trim(this.value)).length > 255){
							$("#tipcompaddr").removeClass("onError").html("");
							$("#tipcompaddr").addClass("onError").html("请输入255个以内的非特殊字符");
						}else{
							$("#tipcompaddr").removeClass("onError").html("");
						}					
					}

					if($(this).is('#comptell')){  //开户行帐号
						if(valiter.isNull($.trim(this.value)) || $.trim($.trim(this.value)).length > 255){
							$("#tipcomptell").removeClass("onError").html("");
							$("#tipcomptell").addClass("onError").html("请输入255个以内的非特殊字符");
						}else{
							$("#tipcomptell").removeClass("onError").html("");
						}					
					}
					if($(this).is('#fileName1')){
						if(valiter.isNull($.trim(this.value))){
							$("#tipFile2upload").removeClass("onError").html("");
							$("#tipFile2upload").addClass("onError").html("请选择文件");
						}else{
						    var options = { 
						            data: { "objectName":1 },
						            type : "POST",
						            dataType:  'json',
						            timeout  : 1800000,
						            success: function(rs) {	
						            	if(rs){
						            		$("#tipFile2upload").addClass("onError").html("图片大小已超过2M");
						            	}else{
						            		$("#tipFile2upload").removeClass("onError").html("");
						            	}						            	
						    	    },			            	
						            error    : function() {
						            	
						    		}
						    }; 
						    $("#createForm").attr("action","/portal/pr/invoice/isObjectSizeOver2M");
					        $("#createForm").ajaxSubmit(options);							
						}					
					}
					if($(this).is('#fileName2')){
						if(valiter.isNull($.trim(this.value))){
							$("#tipFile2upload2").removeClass("onError").html("");
							$("#tipFile2upload2").addClass("onError").html("请选择文件");
						}else{
						    var options = { 
						            data: { "objectName":2 },
						            type : "POST",
						            dataType:  'json',
						            timeout  : 1800000,
						            success: function(rs) {	
						            	if(rs){
						            		$("#tipFile2upload2").addClass("onError").html("图片大小已超过2M");
						            	}else{
						            		$("#tipFile2upload2").removeClass("onError").html("");
						            	}						            	
						    	    },			            	
						            error    : function() {
						            	
						    		}
						    }; 
						    $("#createForm").attr("action","/portal/pr/invoice/isObjectSizeOver2M");
					        $("#createForm").ajaxSubmit(options);							
							
						}					
					}
					if($(this).is('#fileName3')){
						if(valiter.isNull($.trim(this.value))){
							$("#tipFile2upload3").removeClass("onError").html("");
							$("#tipFile2upload3").addClass("onError").html("请选择文件");
						}else{
						    var options = { 
						            data: { "objectName":3 },
						            type : "POST",
						            dataType:  'json',
						            timeout  : 1800000,
						            //uploadProgress : object.showUploadProgress,
						            success: function(rs) {	
						            	if(rs){
						            		$("#tipFile2upload3").addClass("onError").html("图片大小已超过2M");
						            	}else{
						            		$("#tipFile2upload3").removeClass("onError").html("");
						            	}						            	
						    	    },			            	
						            error    : function() {
						            	
						    		}
						    }; 
						    $("#createForm").attr("action","/portal/pr/invoice/isObjectSizeOver2M");
					        $("#createForm").ajaxSubmit(options);							
							
						}					
					}
					
					
				}
				
				//收件人
				if($(this).is('#receiver')){
					if(valiter.isNull($.trim(this.value)) || $.trim($.trim(this.value)).length > 255){
						$("#tipReceiver").removeClass("onError").html("");
						$("#tipReceiver").addClass("onError").html("请输入255个以内的非特殊字符");
					}else{
						$("#tipReceiver").removeClass("onError").html("");
					}					
				}
				//联系电话
				if($(this).is('#telephone')){
					if(valiter.isNull($.trim(this.value)) || valiter.cellphone($.trim($.trim(this.value)))){
						$("#tipTelephone").removeClass("onError").html("");
						$("#tipTelephone").addClass("onError").html("请输入手机号码");
					}else{
						$("#tipTelephone").removeClass("onError").html("");
					}					
				}
				//邮寄地址
				if($(this).is('#address')){
					if(valiter.isNull($.trim(this.value)) || $.trim($.trim(this.value)).length > 255){
						$("#tipAddress").removeClass("onError").html("");
						$("#tipAddress").addClass("onError").html("请输入255个以内的非特殊字符");
					}else{
						$("#tipAddress").removeClass("onError").html("");
					}					
				}
				//邮编
				if($(this).is('#postcode')){
					if (!valiter.isNull($.trim($.trim(this.value)))) {
						if (valiter.numberInt($.trim($.trim(this.value)))) {
							$("#tipPostcode").removeClass("onError").html("");
							$("#tipPostcode").addClass("onError").html("请输入6位邮政编码");
						} else {
							$("#tipPostcode").removeClass("onError").html("");
						}
					}else{
						$("#tipPostcode").removeClass("onError").html("");
					}					
				}
				//金额
				if($(this).is('#sum')){
					var sum = $.trim(this.value) || 0;
					if(bill.availablePrint <=0){
						$("#tipSum").removeClass("onError").html("");
						$("#tipSum").addClass("onError").html("可开发票额度为负数, 不能开具发票");
					}else{
						//金额不能超过
						if(sum>bill.availablePrint){
							$("#tipSum").removeClass("onError").html("");
							$("#tipSum").addClass("onError").html("金额大于可开发票额度");
						}else{
							var billmoney = $("#billedMoney").html();
							var type = $("#sel_billtype").val();
							//金额 
							var monli = $.trim(sum)*1000;
							if(valiter.isNull(sum) || sum<=0 || valiter.number2($.trim(sum)) || monli > 9999999999999999){
								$("#tipSum").removeClass("onError").html("");
								$("#tipSum").addClass("onError").html("请输入整数位13位以内的正数，小数点后最多可以有2位数字");
							}else{
								if(type == 102){
									if(sum>billmoney){
										$("#tipSum").removeClass("onError").html("");
										$("#tipSum").addClass("onError").html("金额大于已出帐金额");									
									}else{
										$("#tipSum").removeClass("onError").html("");
									}
								}else{
									$("#tipSum").removeClass("onError").html("");
								}

							}							
							
						}						
					}					
				}
			});
			$("#sel_billtype").bind("change",function(){
				var type = $(this).val();
				if(type == 101) {
					$("#specialBill").attr("style","display:none");
				} else if(type == 102){
					$("#specialBill").attr("style","display:block");
				}
			});
			$("#sel_userType").bind("change",function(){
				var type = $(this).val();
				$("#sel_billtype").empty();
				$('.onError').html("");
				if(type == 1) {
					$("<option value='101'>增值税普通发票</option>").appendTo($("#sel_billtype"));
					$("#billName").val("个人");
					$("#specialBill").attr("style","display:none");					
				} else if(type == 2){
					$("<option value='101'>增值税普通发票</option><option value='102'>增值税专用发票</option>").appendTo($("#sel_billtype"));
					$("#billName").val("");
				}
			});			
		},
		describePrintBalance : function(){
			var yishenqing_101=0;
			var shenhe_yes_102=0;
			var shenhe_no_103=0;
			var yidayin_104=0;
			var yijichu_105=0;
			bill.service.describePrintBalance(function onSuccess(data){		
				$(data).each(function(x) {
					var printFee = data[x].printFee;
					var invoiceStatus = data[x].invoiceStatus;

					if(invoiceStatus == 101){
						yishenqing_101 = printFee/1000;						
					}else if(invoiceStatus == 102){
						shenhe_yes_102 = printFee/1000;
					}else if(invoiceStatus == 103){  //审核未通过
						shenhe_no_103 = printFee/1000;
					}else if(invoiceStatus == 104){  //已打印
						yidayin_104 = printFee/1000;
					}else if(invoiceStatus == 105){  //已邮寄
						yijichu_105 = printFee/1000; //
					}
				});		
				//已开金额=审核通过+已打印+已邮寄
				var yikai = parseInt(parseInt(shenhe_yes_102)+parseInt(yidayin_104)+parseInt(yijichu_105));  
				$("#printedMoney").html(yikai);
				bill.service.describeUnPrintBalance(function onSuccess(data){	
					//最终可打金额 = 可打金额（describeUnPrintBalance查出） -已打金额 （状态为已审核 状态为102） -已打金额（已申请 状态为101）
					//总金额
					var unPrintBalance = data.unPrintBalance/1000;
					//可开=总金额-已开-已申请+审核未通过
					var kekai = unPrintBalance-yikai-parseInt(yishenqing_101)+parseInt(shenhe_no_103);
					$("#totalMoney").html(kekai);
					bill.availablePrint = kekai;
				},function onError(msg){
					$.growlUI("提示", "查询可开金额失败：" + msg); 
				});			

			},function onError(msg){
				$.growlUI("提示", "查询已开金额失败：" + msg); 
			});			
		},
		onOptionSelected : function(index) {
		},
		// 创建虚拟硬盘
		createVdiskVolume : function() {
			$("#create_bill :input").trigger('blur');
			var isSubmit = true;
			isSubmit = bill.valite();
			if (!isSubmit) {
				return;
			}			
			
			var fileName1 = $("#fileName1").val();
			var fileName2 = $("#fileName2").val();
			var fileName3 = $("#fileName3").val();	        		

			var billtype = $("#sel_billtype").val();
			var bill_name = $.trim($("#billName").val());
			var receiver = $.trim($("#receiver").val());
			var address = $.trim($("#address").val());
			var postcode = $.trim($("#postcode").val());
			var _telephone = $.trim($("#telephone").val());
			var sel_item = $("#sel_item").val();
			var sum = $.trim($("#sum").val()) || 0;

			var taxpayerId = $("#taxpayerId").val();
			var bankname = $("#bankname").val();
			var bankid = $("#bankid").val();
			var compaddr = $("#compaddr").val();
			var comptell = $("#comptell").val();

			var params = {
					"invoiceType":billtype,
					"invoiceName":bill_name,
					"receiver":receiver,
					"address":address,
					"postCode":postcode,
					"telephone":_telephone,
					"invoiceItem":sel_item,
					"printFee":sum*1000,			
					
					
					"bankName":bankname,
					"bankNo":bankid,
					"taxerNo":taxpayerId,					
					"registerAddress":compaddr,					  
					"registerTelephone":comptell,
					"businessLicence":fileName1,
					"taxLicence":fileName2,
					"taxerLicence":fileName3
			};
			bill.service.save(params,function onSuccess(data){				
				$.growlUI("提示", "申请发票提交成功");
				bill.updateDataTable();
				$("#billTable_wrapper").attr("style","display:block;");
				$("#create_bill").attr("style","display:none;");
				$("#selTime").attr("style","display:block;");

			},function onError(msg){
				$.growlUI("提示", "申请发票提交失败：" + msg); 
			});
			var billtype = $("#sel_billtype").val();
			if(billtype == 102){
				var _filename = $('#fileName1').val();
				var _filename2 = $('#fileName2').val();
				var _filename3 = $('#fileName3').val();
			    var options = { 
			            data: { "objectName1":_filename, "objectName2":_filename2,"objectName3":_filename3},
			            type : "POST",
			            dataType:  'json',
			            timeout  : 1800000,
			            success: function(rs) {	   
			    	    },			            	
			            error    : function() {
			    		}
			    }; 
			    $("#createForm").attr("action","/portal/pr/invoice/uploadObject");
		        $("#createForm").ajaxSubmit(options);
			}
			
		},
	    valite : function() {	
	    	var numError = $('.onError').length;
			if (numError) {
				return false;
			}
			return true;
		},
		// 查询虚拟硬盘列表
		describePrintLog : function() {
			var startDate = $("#starttime").val();
			startDate = startDate.replace(/-/g,"");			
			var endDate = $("#endtime").val();
			endDate = endDate.replace(/-/g,"");
			bill.service.describePrintLog(startDate,endDate,function onSuccess(data){
				bill.instances = data;
				bill.renderDataTable(data);		
			},function onError(msg){
				$.growlUI("提示", "查询发生错误：" + msg); 
			});
		},
		renderDataTable : function(data) {
			bill.datatable.renderByData("#billTable", {
					"data" : data,
					"iDisplayLength": 5,				
					"columnDefs" : [
					     {title : "发票金额(元)", name : "printFee"},
					     {title : "发生时间", name : "createDate"},
					     {title : "发票抬头", name : "invoiceName"},
					     {title : "状态", name : "invoiceStatus"}
					],
					"onColumnRender" : function(columnIndex, columnMetaData, columnData) {
						 var text = columnData[''+columnMetaData.name] || "";
						 if(columnMetaData.name == 'id') {
							 text = '<input type="checkbox" value="'+text+'">';
						 }
						 if (columnMetaData.name == "ID") {
							 text = text;
						 }
						 if (columnMetaData.name == "invoiceStatus") {
							 text = com.skyform.service.BillStateService.getBillState(text);
						 }
						 if (columnMetaData.name == "printFee") {
							 text = text/1000;
						 }

						 if (columnMetaData.name == "createDate") {
							 text = new Date(text).format("yyyy-MM-dd hh:mm:ss");
						 }

						 return text;
					}, 
					"afterRowRender" : function(rowIndex, data, tr){
						tr.attr("address", data.address).
						attr("invoiceName", data.invoiceName).
						attr("serialCode", data.serialCode).
						attr("printFee", data.printFee).
						attr("receiver", data.receiver).
						attr("invoiceItem", data.invoiceItem).
						attr("telephone", data.telephone).
						attr("invoiceType", data.invoiceType).
						attr("accountId", data.accountId).
						attr("postCode", data.postCode).
						attr("printDate", data.printDate).
						attr("invoiceStatus", data.invoiceStatus);
					},
					"afterTableRender" : function() {
						// 翻页的时候清除前一页选中的checkbox，同时将更多操作置为不可用
						$("#billTable input[type='checkbox']").attr("checked", false);
			            //全选取消选中
//			            $("#checkAll").attr("checked", false);			             
						
						bill.bindEvent();
						var firstRow = $("#billTable tbody").find("tr:eq(0)");
						//显示第一条记录的日志
						bill.showInstanceInfo(firstRow);
						firstRow.css("background-color","#BCBCBC");
						bill.setSelectRowBackgroundColor(firstRow);
					}
				}
			);
			bill.datatable.addToobarButton("#disktoolbar");
			bill.datatable.enableColumnHideAndShow("right");
		},
		setSelectRowBackgroundColor : function(handler) {
			$("#billTable tr").css("background-color","");
			handler.css("background-color","#BCBCBC");
		},		
		bindEvent : function() {
			$("tbody tr").mousedown(function(e) {  
			    if (3 == e.which) {  
			             document.oncontextmenu = function() {return false;};  
			             var screenHeight = $(document).height();
			             var top = e.pageY;
			             if(e.pageY >= screenHeight / 2) {
			             	top = e.pageY - $("#contextMenu").height();
			             }
			             $("#contextMenu").hide();  
			             $("#contextMenu").attr("style","display: block; position: absolute; top:"  
			             + top  
			             + "px; left:"  
			             + e.pageX  
			             + "px; width: 180px;");  
			             $("#contextMenu").show();  
			             e.stopPropagation();
			             
			             
			             // 选中右键所单击的行，取消其他行的选中效果
			             $("tbody input[type='checkbox']").attr("checked", false);
			             //全选取消选中
//			             $("#checkAll").attr("checked", false);			             
			             $("input[type='checkbox']",$(this)).attr("checked", true);
			     } 
			    bill.showInstanceInfo($(this));
			    bill.setSelectRowBackgroundColor($(this));
			}); 
			
			$("tbody tr").unbind("click").bind("click",function(e){
	             // 选中右键所单击的行，取消其他行的选中效果
	             $("tbody input[type='checkbox']").attr("checked", false);
	             //全选取消选中
//	             $("#checkAll").attr("checked", false);			             
	             $("input[type='checkbox']",$(this)).attr("checked", true);

				bill.showInstanceInfo($(this));
			});
			
//			$("#checkAll").unbind("click").bind("click", function(e) {
//				var checked = $(this).attr("checked") || false;
//		        $("#billTable input[type='checkbox']").attr("checked",checked);	 
//		        e.stopPropagation();
//			});
			
			$("#billTable tbody input[type='checkbox']").unbind("click").bind("click", function() {
				
			});
			
			$("#btnRefresh").unbind("click").bind("click", function() {
				bill.updateDataTable();
			});
			
			$("#createVdiskVolume").unbind("click").bind("click", function() {								
				$("#btnCreateVdiskVolume").removeClass("disabled");
				$("#btnCreateVdiskVolume").attr("disabled",false);			

				bill.describePrintBalance();
				bill.describeBillBalance();
				$("#billTable_wrapper").attr("style","display:none;");
				$("#create_bill").attr("style","display:block;");
				$("#selTime").attr("style","display:none;");				
				$("#details").attr("style","display:none;");
			});
			$("#btnBilllist").unbind("click").bind("click", function() {								
				$("#billTable_wrapper").attr("style","display:block;");
				$("#create_bill").attr("style","display:none;");
				$("#selTime").attr("style","display:block;");
				$("#details").attr("style","display:block;");
			});
			$("#btnCacel").unbind("click").bind("click", function() {
				$("#billTable_wrapper").attr("style","display:block;");
				$("#create_bill").attr("style","display:none;");
				$("#selTime").attr("style","display:block;");
				$("#details").attr("style","display:block;");
			});
			
		},
		showInstanceInfo : function(selectRow){
			$("#opt_logs").empty();
			
			 var chktr = selectRow;				
				var invoiceType =  chktr.attr("invoiceType") || "";
				var invoiceItem =  chktr.attr("invoiceItem") || "";
				var invoiceName =  chktr.attr("invoiceName") || "";
				var receiver =  chktr.attr("receiver") || "";				
				var telephone =  chktr.attr("telephone") || "";
				var address =  chktr.attr("address") || "";
				var postCode =  chktr.attr("postCode") || "";
				var printFee =  chktr.find("td[name='printFee']").html() || "";		
				var printDate =  chktr.find("td[name='printDate']").html() || "";								
				var invoiceStatus =  chktr.find("td[name='invoiceStatus']").html() || "";		


				$("<li class='detail-item' style='width:50%;float:left'><span>发票类型: " + invoiceType + "</span></li>").appendTo($("#opt_logs"));
				$("<li class='detail-item' style='width:50%;float:left'><span>发票条目: " + invoiceItem + "</span></li>").appendTo($("#opt_logs"));
				$("<li class='detail-item' style='width:50%;float:left'><span>发票抬头: " + invoiceName + "</span></li>").appendTo($("#opt_logs"));
				$("<li class='detail-item' style='width:50%;float:left'><span>收件人: " + receiver + "</span></li>").appendTo($("#opt_logs"));
				$("<li class='detail-item' style='width:50%;float:left'><span>联系电话: " + telephone + "</span></li>").appendTo($("#opt_logs"));
				$("<li class='detail-item' style='width:50%;float:left'><span>邮寄地址: " + address + "</span></li>").appendTo($("#opt_logs"));
				$("<li class='detail-item' style='width:50%;float:left'><span>邮编: " + postCode + "</span></li>").appendTo($("#opt_logs"));
				$("<li class='detail-item' style='width:50%;float:left'><span>金额: " + printFee + "</span></li>").appendTo($("#opt_logs"));
				$("<li class='detail-item' style='width:50%;float:left'><span>发生时间: " + printDate + "</span></li>").appendTo($("#opt_logs"));
				$("<li class='detail-item' style='width:50%;float:left'><span>状态: " + invoiceStatus + "</span></li>").appendTo($("#opt_logs"));
			
		},
		// 刷新Table
		updateDataTable : function() {
			var startDate = $("#starttime").val();
			startDate = startDate.replace(/-/g,"");			
			var endDate = $("#endtime").val();
			endDate = endDate.replace(/-/g,"");
			bill.service.describePrintLog(startDate,endDate,function onSuccess(data){
				bill.instances = data;
				bill.datatable.updateData(data);	
			},function onError(msg){
			});
			$("#beforeModify").addClass("disabled");
			$("#beforeModify").attr("disabled",true);
			$("#attachVm").addClass("disabled");
			$("#attachVm").attr("disabled",true);
			$("#detachVm").addClass("disabled");
			$("#detachVm").attr("disabled",true);
			$("#delete").addClass("disabled");
			$("#delete").attr("disabled",true);
		},
		getCheckedArr :function() {
			return $("#billTable tbody input[type='checkbox']:checked");
		},
		describeBillBalance : function(){
			bill.service.describeBillBalance(function onSuccess(data){
				var billMoney = data.balance/1000;
				$("#billedMoney").html(billMoney);
				
			},function onError(msg){
			});			
		}		
};
