window.currentInstanceType='billInfo';

$(function(){
	billInfo.init();
});

var billInfo = {
		currentAccount:"",
		ctx:"",
		datatable : new com.skyform.component.DataTable(),
		service : com.skyform.service.billInfoService,
		availablePrint : 0,
		stateTotal:0,
		//个人发票总数
		 psTotal:0,
		//企业发票总数
		 qyTotal:0,
		//企业普通发票数量
		 qyType:0,
		newFormModal:null,
		updateFormModal:null,
		init : function() {
			billInfo.ctx = $("#ctx").val();
			billInfo.currentAccount=$("#loginName").val();
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
					billInfo.onOptionSelected($(this).index());					
				}
			});
			// 新建发票信息
			$("#createBillInfo").unbind("click").bind('click', function(e) {
				billInfo.newInstance();
			});
			//修改发票信息
			$("#updateBillInfo").unbind("click").bind('click', function(e) {
				billInfo.updateBillInfo();
			});
			billInfo.describeInvoiceTemplate();
			billInfo.bindEvent();	
			
		},
		describeInvoiceTemplate:function(){
			var params={};
			billInfo.service.describeInvoiceTemplate(params,function onSuccess(data){
				billInfo.renderDataTable(data);		
			},function onError(msg){
				$.growlUI("提示", "查询发生错误：" + msg); 
			});
			
		},
		onOptionSelected : function(index) {
		},
	    valite : function() {	
	    	var numError = $('.onError').length;
			if (numError) {
				return false;
			}
			return true;
		},
		renderDataTable : function(data) {
			billInfo.datatable.renderByData("#billInfoTable", {
					"data" : data,
					"iDisplayLength": 5,				
					"columnDefs" : [
					     {title : "序号", name : "id"},
					     {title : "开具类型", name : "invoiceType"},
					     {title : "发票抬头", name : "invoiceName"},
					     {title : "发票类型", name : "invoiceItem"},
					     {title : "状态", name : "templateStatus"}
					],
					"onColumnRender" : function(columnIndex, columnMetaData, columnData) {
						 var text = "";
						 if (columnMetaData.name == "invoiceType") {
							 text =billInfo.service.getInvoiceType(columnData.invoiceType);
						 }else if (columnMetaData.name == "invoiceItem") {
							 text =billInfo.service.getInvoiceItem(columnData.invoiceItem);
						 }else if (columnMetaData.name == "templateStatus") {
							 var status = 1;
							 if(columnData.invoiceItem==1&&columnData.invoiceType==1){
								 status = columnData.templateStatus;
							 }
							 text =billInfo.service.getTemplateStatusType(status);
						 }else if(columnMetaData.name == 'id') {
							 text = '<input type="checkbox"  value="'+columnData.templateId+'">';
						 } else 
							 text = columnData[''+columnMetaData.name] || "";
						 return text;
					}, 
					"afterRowRender" : function(rowIndex, data, tr){
						tr.attr("templateId", data.templateId).
						attr("invoiceType", data.invoiceType).
						attr("invoiceItem", data.invoiceItem).
						attr("invoiceName", data.invoiceName).
						attr("taxerNo", data.taxerNo).
						attr("bankName", data.bankName).
						attr("bankNo", data.bankNo).
						attr("registerAddress", data.registerAddress).
						attr("registerTelephone", data.registerTelephone).
						attr("businessLicence", data.businessLicence).
						attr("taxLicence", data.taxLicence).
						attr("isUsed", data.isUsed).
						attr("taxerLicence", data.taxerLicence);
					},
					"afterTableRender" : function() {
						// 翻页的时候清除前一页选中的checkbox，同时将更多操作置为不可用
						$("#billInfoTable input[type='checkbox']").attr("checked", false);
						//全选取消选中
//			            $("#checkAll").attr("checked", false);			             
						
						billInfo.bindEvent();
						var firstRow = $("#billInfoTable tbody").find("tr:eq(0)");
						//默认第一条数据勾选
						firstRow.find("td[name='id'] input[type='checkbox']").attr("checked", true);
						firstRow.css("background-color","#BCBCBC");
						billInfo.setSelectRowBackgroundColor(firstRow);
						
						//更新完页面之后 校验数量
						var allRow = $("#billInfoTable tbody").find("tr");
						var allStateTotal=0;
						if(allRow){
							allRow.each(function(index,element){
								if($(this).attr("invoiceType")=="0"){
									allStateTotal=allStateTotal+1;
								}
								if($(this).attr("invoiceType")=="1"){
									if($(this).attr("isUsed")=="1"){
										allStateTotal=allStateTotal+1;
									}
								}
							})
						}
						if(allStateTotal>=3){
							$("#createBillInfo").addClass("disabled");
							$("#createBillInfo").unbind();
							//$.growlUI("提示", "已达上限！");	
							return;
						}else{
							$("#createBillInfo").removeClass("disabled");
						}
					}
				}
			);
			//billInfo.datatable.addToobarButton("#disktoolbar");
			billInfo.datatable.enableColumnHideAndShow("right");
		},
		setSelectRowBackgroundColor : function(handler) {
			$("#billInfoTable tr").css("background-color","");
			handler.css("background-color","#BCBCBC");
		},
		setLabelClassHide:function(type){
			if(type=="new"){
				   //$("#newBillInfoForm #psInvoiceName").next().hide();
				   $("#newBillInfoForm #bankNo").next().hide();
	        	   $("#newBillInfoForm #registerTelephone").next().hide();
	        	   $("#newBillInfoForm #qyInvoiceName").next().hide();
	        	   $("#newBillInfoForm #taxerNo").next().hide();
	        	   $("#newBillInfoForm #bankName").next().hide();
	        	   $("#newBillInfoForm #registerAddress").next().hide();
				
			}else{
				   //$("#updateBillInfoForm #psInvoiceName").next().hide();
				   $("#updateBillInfoForm #bankNo").next().hide();
	        	   $("#updateBillInfoForm #registerTelephone").next().hide();
	        	   $("#updateBillInfoForm #qyInvoiceName").next().hide();
	        	   $("#updateBillInfoForm #taxerNo").next().hide();
	        	   $("#updateBillInfoForm #bankName").next().hide();
	        	   $("#updateBillInfoForm #registerAddress").next().hide();
				
			}
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
			             $("input[type='checkbox']",$(this)).attr("checked", true);
			     } 
			    billInfo.setSelectRowBackgroundColor($(this));
			}); 
			
			$("tbody tr").unbind("click").bind("click",function(e){
				 // 选中右键所单击的行，取消其他行的选中效果
	             $("tbody input[type='checkbox']").attr("checked", false);
	             $("input[type='checkbox']",$(this)).attr("checked", true);

			});
			
			$("#billInfoTable tbody input[type='checkbox']").unbind("click").bind("click", function() {
				
			});
			
			$("#btnRefresh").unbind("click").bind("click", function() {
				billInfo.refreshDataTable();
			});
			
		},
		// 刷新Table
		refreshDataTable : function() {
			var params={};
			billInfo.service.describeInvoiceTemplate(params,function onSuccess(data){
				billInfo.datatable.updateData(data);	
			},function onError(msg){
				$.growlUI("提示", "查询发生错误：" + msg); 
			});
		},
		getCheckedArr :function() {
			return $("#billInfoTable tbody input[type='checkbox']:checked");
		},
		newInstance : function(){//新建
			var allRow = $("#billInfoTable tbody").find("tr");
			if(allRow){
				allRow.each(function(index,element){
					if($(this).attr("invoiceType")=="0"){
						billInfo.stateTotal=billInfo.stateTotal+1;
						billInfo.psTotal=billInfo.psTotal+1;
					}
					if($(this).attr("invoiceType")=="1"){
						if($(this).attr("isUsed")=="1"){
							billInfo.stateTotal=billInfo.stateTotal+1;
							billInfo.qyTotal=billInfo.qyTotal+1;
							if($(this).attr("invoiceItem")=="0"){
								billInfo.qyType=billInfo.qyType+1;
							}
						}
					}
				})
			}
			if(billInfo.stateTotal>=3){
				$("#createBillInfo").addClass("disabled");
				$("#createBillInfo").unbind();
				//$.growlUI("提示", "已达上限！");	
				return;
			}else{
				$("#createBillInfo").removeClass("disabled");
			}
			if(!billInfo.newFormModal){
				billInfo.newFormModal = new com.skyform.component.Modal("newBillInfoForm","<h3>新增发票信息</h3>",$("script#new_billInfo_form").html(),{
					buttons : [
					           {name:'确定',onClick:function(){
					        	   var currentInvoiceItem =$("#newBillInfoForm input[name='invoiceType'][checked='checked']").val();
									//判断当前选中行的开具类型：个人：0，企业：1
									if(currentInvoiceItem=="0"){
										 //$("#newBillInfoForm #psInvoiceName").blur();
							        	   /*if(valiter.isNull($("#newBillInfoForm #psInvoiceName").val())){
							        		   return;
							        		  
							        	   }*/
							        	 
										 var params={
												invoiceType:currentInvoiceItem,
												//invoiceName:$("#newBillInfoForm #psInvoiceName").val()
												invoiceName:billInfo.service.getInvoiceType(0),
												
										   };
									}else if(currentInvoiceItem=="1"){
										 //提交前 获取焦点 防止为 获取焦点就提交
							        	   $("#newBillInfoForm #bankNo").blur();
							        	   $("#newBillInfoForm #registerTelephone").blur();
							        	   $("#newBillInfoForm #qyInvoiceName").blur();
							        	   $("#newBillInfoForm #taxerNo").blur();
							        	   $("#newBillInfoForm #bankName").blur();
							        	   $("#newBillInfoForm #registerAddress").blur();
							        	   //如果验证失败，不提交
							        	   if(!(valiter.isBankNo($("#newBillInfoForm #bankNo").val())&&
							        		   !valiter.telephone($("#newBillInfoForm #registerTelephone").val())&&
							        		   !valiter.isNull($("#newBillInfoForm #qyInvoiceName").val())&&
							        		   !valiter.isNull($("#newBillInfoForm #taxerNo").val())&&
							        		   !valiter.isNull($("#newBillInfoForm #bankName").val())&&
							        		   !valiter.isNull($("#newBillInfoForm #registerAddress").val()))
							        		   )
							        	   {
							        		   return;
							        	   }
										var invoiceItem=$("#newBillInfoForm input[name='invoiceItem'][checked='checked']").val()
										var businessLicenceAttachment = $("#newBillInfoForm #businessLicenceText").val();
										if(businessLicenceAttachment){
											$("#businessLicenceAttachmentMsg").html("");
										}else{
											$("#businessLicenceAttachmentMsg").html("请上传营业执照复印件");
											return;
										}
										var taxLicenceAttachment = $("#newBillInfoForm #taxLicenceText").val();
										if(taxLicenceAttachment){
											$("#taxLicenceAttachmentMsg").html("");
										}else{
											$("#taxLicenceAttachmentMsg").html("请上传税务登记复印件");
											return
										}
										if(invoiceItem==1){
											var taxerLicenceAttachment = $("#newBillInfoForm #taxerLicenceText").val();
											if(taxerLicenceAttachment){
												$("#taxerLicenceAttachmentMsg").html("");
											}else{
												$("#taxerLicenceAttachmentMsg").html("请上传一般纳税人认证资格");
												return
											}
										}
										var params={
												invoiceType:currentInvoiceItem,
												invoiceItem:invoiceItem,
												invoiceName:$("#newBillInfoForm #qyInvoiceName").val(),
												taxerNo:$("#newBillInfoForm #taxerNo").val(),
												bankName:$("#newBillInfoForm #bankName").val(),
												bankNo:$("#newBillInfoForm #bankNo").val(),
												registerAddress:$("#newBillInfoForm #registerAddress").val(),
												registerTelephone:$("#newBillInfoForm #registerTelephone").val(),
												businessLicence:$("#newBillInfoForm #businessLicenceText").val(),
												taxLicence:$("#newBillInfoForm #taxLicenceText").val(),
												taxerLicence:$("#newBillInfoForm #taxerLicenceText").val()
												
										   };
									}
									billInfo.service.createInvoiceTemplate(params,function onSuccess(data){
										billInfo.newFormModal.hide();
										billInfo.refreshDataTable();
										$.growlUI("提示", "添加成功！");	
										billInfo.setLabelClassHide("new");
										
									},function onError(msg){
										billInfo.newFormModal.hide();
										$.growlUI("提示", "添加失败！");
										billInfo.setLabelClassHide("new");
									});
					        	   
					           },attrs:[{name:'class',value:'btn btn-primary'}]},
					           {name:'取消',onClick:function(){
					        	   billInfo.newFormModal.hide();
					        	   billInfo.setLabelClassHide("new");
					           },attrs:[{name:'class',value:'btn'}]}
					           ],
		           beforeShow : function(){
		        	    //清空数据
		        	   $("#newBillInfoForm #qyInvoiceName").val("");
		        	   $("#newBillInfoForm #taxerNo").val("");
		        	   $("#newBillInfoForm #bankName").val("");
		        	   $("#newBillInfoForm #bankNo").val("");
		        	   $("#newBillInfoForm #registerAddress").val("");
		        	   $("#newBillInfoForm #registerTelephone").val("");
		        	   
		        	   //清空隐藏上传文件名称
						$("#newBillInfoForm #businessLicenceText").val("");
						$("#newBillInfoForm #taxLicenceText").val("");
						$("#newBillInfoForm #taxerLicenceText").val("");
						//清空上传文件
						$("#newBillInfoForm input[name='files']").val("");
						//清空下载文件超链接
						$("#newBillInfoForm #businessLicenceDiv a").attr('href', "#").text("");
						$("#newBillInfoForm #taxerLicenceDiv a").attr('href', "#").text("");
						$("#newBillInfoForm #taxLicenceDiv a").attr('href', "#").text("");
						//清空文件上传失败时的提示信息
						$("#newBillInfoForm #businessLicenceAttachmentMsg").html("");
						$("#newBillInfoForm #taxerLicenceAttachmentMsg").html("");
						$("#newBillInfoForm #taxLicenceAttachmentMsg").html("");
						
						
						
						//绑定click事件
		        	    $("#newBillInfoForm input[name='invoiceItem']").bind('click', function(e) {
		        	    	//每次click事件时，先去掉checked和disabled属性
		        	    	$("#newBillInfoForm input[name='invoiceItem']").removeAttr("checked").removeAttr("disabled");
		        	    	$(this).attr("checked","checked");
							 if( $(this).val()=="0"){
								 $('#newBillInfoForm .taxpayer').removeClass('show');
			        	    	 $('#newBillInfoForm .taxpayer').addClass('hide');
							 }else{
								 $('#newBillInfoForm .taxpayer').removeClass('hide');
							     $('#newBillInfoForm .taxpayer').addClass('show');
							 }
					     });
		        	     
		        	     $("#newBillInfoForm input[name='invoiceType']").bind('click', function(e) {
		        	    	 //每次click事件时，先去掉checked和disabled属性
		        	    	 $("#newBillInfoForm input[name='invoiceType']").removeAttr("checked").removeAttr("disabled");
		        	    	 //增加属性checked
		        	    	 $(this).attr("checked","checked");
							 if( $(this).val()=="0"){
								 $('#newBillInfoForm .enterprise_wrap').addClass('hide');
							     $('#newBillInfoForm .personal_wrap').removeClass('hide');
							 }else{
								 $('#newBillInfoForm .personal_wrap').addClass('hide');
						         $('#newBillInfoForm .enterprise_wrap').removeClass('hide');
							 }
					     });
		        	     //如果个人发票为空
		        	     if(billInfo.psTotal==0){
		        	    	 //如果企业发票已经填满，默认选择个人发票按钮
		        	    	 if(billInfo.qyTotal==2){
		        	    		 $("#newBillInfoForm input[name='invoiceType'][value=0]").click();
							     $("#newBillInfoForm input[name='invoiceType']").attr("disabled",true);
							  //否则默认选择普通发票
		        	    	 }else{
		        	    		 $("#newBillInfoForm input[name='invoiceType'][value=1]").click();
		        	    		// $("#newBillInfoForm input[name='invoiceType'][value=0]").attr("disabled",true);
		        	    		 $("#newBillInfoForm input[name='invoiceItem'][value=0]").click();
		        	    	 }
		        	     //如果有个人发票
		        	     }else if(billInfo.psTotal==1){
		        	    	 //并且还有普通发票，则默认选择专用发票
		        	    	 if(billInfo.qyType==1){
		        	    		 $("#newBillInfoForm input[name='invoiceType'][value=1]").click();
			        	    	 $("#newBillInfoForm input[name='invoiceType']").attr("disabled",true);
			        	    	 $("#newBillInfoForm input[name='invoiceItem'][value=1]").click();
			        	    	 $("#newBillInfoForm input[name='invoiceItem']").attr("disabled",true);
		        	    	 }else{//否则选择普通发票
		        	    		 //默认发票类型不置灰
		        	    		 if(billInfo.qyType==0&&billInfo.stateTotal==1){
		        	    			 $("#newBillInfoForm input[name='invoiceType'][value=1]").click();
		        	    	    	 $("#newBillInfoForm input[name='invoiceType']").attr("disabled",true);
		        	    	    	 $("#newBillInfoForm input[name='invoiceItem'][value=0]").click();
		        	    		 }else{
		        	    			 $("#newBillInfoForm input[name='invoiceType'][value=1]").click();
		        	    			 $("#newBillInfoForm input[name='invoiceType']").attr("disabled",true);
		        	    			 $("#newBillInfoForm input[name='invoiceItem'][value=0]").click();
		        	    			 $("#newBillInfoForm input[name='invoiceItem'][value=1]").attr("disabled",true);
		        	    		 }
		        	    	 }
		        	    	
		        	     }
					},
					afterShow:function(){
						billInfo.stateTotal=0;
						billInfo.psTotal=0;
						billInfo.qyTotal=0;
						billInfo.qyType=0;
						$("#newBillInfoForm #bankNo").bind('blur',function(e){
							if(!valiter.isBankNo($(this).val())){
							 $(this).next().show();
							}
							else{
								$(this).next().hide();
							}
							
						});
						
						$("#newBillInfoForm #registerTelephone").bind('blur',function(e){
							if(valiter.telephone($(this).val())){
							 $(this).next().show();
							}
							else{
								$(this).next().hide();
							}
							
						});
						$("#newBillInfoForm #qyInvoiceName").bind('blur',function(e){
							if(valiter.isNull($(this).val())){
							 $(this).next().show();
							}
							else{
								$(this).next().hide();
							}
							
						});
						/*
						$("#newBillInfoForm #psInvoiceName").bind('blur',function(e){
							if(valiter.isNull($(this).val())){
							 $(this).next().show();
							}
							else{
								$(this).next().hide();
							}
							
						});
						*/
						$("#newBillInfoForm #taxerNo").bind('blur',function(e){
							if(valiter.isNull($(this).val())){
							 $(this).next().show();
							}
							else{
								$(this).next().hide();
							}
							
						});
						$("#newBillInfoForm #bankName").bind('blur',function(e){
							if(valiter.isNull($(this).val())){
							 $(this).next().show();
							}
							else{
								$(this).next().hide();
							}
							
						});
						$("#newBillInfoForm #registerAddress").bind('blur',function(e){
							if(valiter.isNull($(this).val())){
							 $(this).next().show();
							}
							else{
								$(this).next().hide();
							}
							
						});
						
					}
				});
			} 
			//每次页面show前把checked和disabled状态清空
			$("#newBillInfoForm input[name='invoiceItem']").removeAttr("checked").removeAttr("disabled");
			$("#newBillInfoForm input[name='invoiceType']").removeAttr("checked").removeAttr("disabled");
			/*if(billInfo.psTotal==1&&billInfo.qyTotal==0&&billInfo.stateTotal==1){
				  console.info(3333333333333333);
				 $("#newBillInfoForm input[name='invoiceType'][value=0]").click();
    	    	 $("#newBillInfoForm input[name='invoiceType'][value=1]").attr("disabled",true);
			}*/
			billInfo.newFormModal.setWidth(600).setHeight(450).setTop(50).show();
		},
		updateBillInfo : function(){//更改
			if(!billInfo.updateFormModal){
				//为了newFormModal隐藏影响updateFormModal
				billInfo.updateFormModal = new com.skyform.component.Modal("updateBillInfoForm","<h3>修改发票信息</h3>",$("script#new_billInfo_form").html(),{
					buttons : [
					           {name:'确定',onClick:function(){
					        	   var currentInvoiceItem =$("#updateBillInfoForm input[name='invoiceType'][checked='checked']").val();
									var params={};
									//判断当前选中行的开具类型：个人：0，企业：1
									if(currentInvoiceItem=="0"){
									  // $("#updateBillInfoForm #psInvoiceName").blur();
						        	  // if(valiter.isNull($("#updateBillInfoForm #psInvoiceName").val())){
						        		//   return;
						        		   
						        	  // }
									  params={
											//templateId:$("#templateId").val(),
											invoiceType:currentInvoiceItem,
											//invoiceName:$("#updateBillInfoForm #psInvoiceName").val()
											invoiceName:billInfo.service.getInvoiceType(0),
									   };
									}else if(currentInvoiceItem=="1"){
										   $("#updateBillInfoForm #bankNo").blur();
							        	   $("#updateBillInfoForm #registerTelephone").blur();
							        	   $("#updateBillInfoForm #qyInvoiceName").blur();
							        	   $("#updateBillInfoForm #taxerNo").blur();
							        	   $("#updateBillInfoForm #bankName").blur();
							        	   $("#updateBillInfoForm #registerAddress").blur();
							        	   
							        	   if(!(valiter.isBankNo($("#updateBillInfoForm #bankNo").val()) &&
								        		   !valiter.telephone($("#updateBillInfoForm #registerTelephone").val()) &&
								        		   !valiter.isNull($("#updateBillInfoForm #qyInvoiceName").val()) &&
								        		   !valiter.isNull($("#updateBillInfoForm #taxerNo").val()) &&
								        		   !valiter.isNull($("#updateBillInfoForm #bankName").val()) &&
								        		   !valiter.isNull($("#updateBillInfoForm #registerAddress").val())))
							        	       {
								        		   return false;
								        	   }
										var invoiceItem=$("#updateBillInfoForm input[name='invoiceItem'][checked='checked']").val();
										var businessLicenceAttachment = $("#updateBillInfoForm #businessLicenceText").val();
										if(businessLicenceAttachment){
											$("#businessLicenceAttachmentMsg").html("");
										}else{
											$("#businessLicenceAttachmentMsg").html("请上传营业执照复印件");
											return
										}
										var taxLicenceAttachment = $("#updateBillInfoForm #taxLicenceText").val();
										if(taxLicenceAttachment){
											$("#taxLicenceAttachmentMsg").html("");
										}else{
											$("#taxLicenceAttachmentMsg").html("请上传税务登记复印件");
											return
										}
										if(invoiceItem==1){
											var taxerLicenceAttachment = $("#updateBillInfoForm #taxerLicenceText").val();
											if(taxerLicenceAttachment){
												$("#taxerLicenceAttachmentMsg").html("");
											}else{
												$("#taxerLicenceAttachmentMsg").html("请上传一般纳税人认证资格");
												return
											}
										}
										var allCheckedBox = $("#billInfoTable tbody input[type='checkbox']:checked");
										var currentTr=$(allCheckedBox[0]).parents("tr");
										var businessLicence=$("#updateBillInfoForm #businessLicenceText").val();
										var taxLicence=$("#updateBillInfoForm #taxLicenceText").val();
										var taxerLicence=$("#updateBillInfoForm #taxerLicenceText").val();
										 params={
												invoiceType:currentInvoiceItem,
												invoiceItem:invoiceItem,
												//templateId:$("#templateId").val(),
												invoiceName:$("#updateBillInfoForm #qyInvoiceName").val(),
												taxerNo:$("#updateBillInfoForm #taxerNo").val(),
												bankName:$("#updateBillInfoForm #bankName").val(),
												bankNo:$("#updateBillInfoForm #bankNo").val(),
												registerAddress:$("#updateBillInfoForm #registerAddress").val(),
												registerTelephone:$("#updateBillInfoForm #registerTelephone").val(),
												businessLicence:businessLicence,
												taxLicence:taxLicence,
												taxerLicence:taxerLicence
										   };
									}
									billInfo.service.createInvoiceTemplate(params,function onSuccess(data){
										billInfo.updateFormModal.hide();
										billInfo.refreshDataTable();
										$.growlUI("提示", "修改成功！");	
										billInfo.setLabelClassHide("update");
									},function onError(msg){
										billInfo.updateFormModal.hide();
										$.growlUI("提示", "修改失败！");
										billInfo.setLabelClassHide("update");
									});
					        	   
					           },attrs:[{name:'class',value:'btn btn-primary'}]},
					           {name:'取消',onClick:function(){
					        	   billInfo.updateFormModal.hide();
					        	   billInfo.setLabelClassHide("update");
					           },attrs:[{name:'class',value:'btn'}]}
					           ],
					beforeShow : function(){
						//清空数据
						$("#updateBillInfoForm #businessLicenceText").val("");
						$("#updateBillInfoForm #taxLicenceText").val("");
						$("#updateBillInfoForm #taxerLicenceText").val("");//files
						$("#updateBillInfoForm input[name='files']").val("");
						
						//注意前缀必须加上 #updateBillInfoForm 解决共用new_billInfo_form造成的串码问题
						var allCheckedBox = $("#billInfoTable tbody input[type='checkbox']:checked");
						var currentTr=$(allCheckedBox[0]).parents("tr");
						var currentInvoiceItem =currentTr.attr("invoiceType");
						$("#updateBillInfoForm input[name='invoiceItem']").bind('click', function(e) {
							$(this).attr("checked","checked");
							 if($(this).val()=="0"){
								 $('#updateBillInfoForm .taxpayer').removeClass('show');
								 $('#updateBillInfoForm .taxpayer').addClass('hide');
							 }else{
								 $('#updateBillInfoForm .taxpayer').removeClass('hide');
							     $('#updateBillInfoForm .taxpayer').addClass('show');
							 }
					    });
						$("#updateBillInfoForm input[name='invoiceType']").bind('click', function(e) {
							$(this).attr("checked","checked");
							if($(this).val()=="0"){
					    		  $('#updateBillInfoForm .enterprise_wrap').addClass('hide');
							      $('#updateBillInfoForm .personal_wrap').removeClass('hide');
					    	  }else{
					    		  $('#updateBillInfoForm .personal_wrap').addClass('hide');
							      $('#updateBillInfoForm .enterprise_wrap').removeClass('hide');
					    	  }
					       
					      });
						//判断当前选中行的开具类型：个人：0，企业：1
						if(currentInvoiceItem=="0"){
							//控制单选按钮 个人显示 企业隐藏
							$("#updateBillInfoForm input[name='invoiceType'][value=0]").click();
					        $("#updateBillInfoForm input[name='invoiceType']").attr("disabled",true);
							//赋值
							$("#updateBillInfoForm #templateId").val(currentTr.attr("templateId"));
							//$("#updateBillInfoForm #psInvoiceName").val(currentTr.attr("invoiceName"));
							//清空企业信息
							$("#updateBillInfoForm #qyInvoiceName").val("");
							$("#updateBillInfoForm #taxerNo").val("");
							$("#updateBillInfoForm #bankName").val("");
							$("#updateBillInfoForm #bankNo").val("");
							$("#updateBillInfoForm #registerAddress").val("");
							$("#updateBillInfoForm #registerTelephone").val("");
							

						}else if(currentInvoiceItem=="1"){
							//清空个人信息 
							//$("#updateBillInfoForm #psInvoiceName").val("");
							
					        //赋值企业信息
					        $("#updateBillInfoForm input[name='invoiceType'][value='"+currentInvoiceItem+"']").click();
					        $("#updateBillInfoForm input[name='invoiceType']").attr("disabled",true);
							$("#updateBillInfoForm input[name='invoiceItem'][value='"+currentTr.attr("invoiceItem")+"']").click();
							$("#updateBillInfoForm input[name='invoiceItem']").attr("disabled",true);
							
							$("#updateBillInfoForm #qyInvoiceName").val(currentTr.attr("invoiceName"));
							$("#updateBillInfoForm #templateId").val(currentTr.attr("templateId"));
							$("#updateBillInfoForm #taxerNo").val(currentTr.attr("taxerNo"));
							$("#updateBillInfoForm #bankName").val(currentTr.attr("bankName"));
							$("#updateBillInfoForm #bankNo").val(currentTr.attr("bankNo"));
							$("#updateBillInfoForm #registerAddress").val(currentTr.attr("registerAddress"));
							$("#updateBillInfoForm #registerTelephone").val(currentTr.attr("registerTelephone"));
							
							//照片
							//$("#updateBillInfoForm #businessLicenceText").val(currentTr.attr("businessLicence")).attr("disabled",true); 
							//$("#updateBillInfoForm #businessLicenceDiv img").attr('src','http://localhost:9091/portal/indentShow/attachment?filename=CN1447674497521.jpg&username=test_wangqy');
							var businessLicenceFilename=currentTr.attr("businessLicence");
							if(businessLicenceFilename){
								$("#updateBillInfoForm #businessLicenceText").val(currentTr.attr("businessLicence"));
								$("#updateBillInfoForm #businessLicenceDiv").attr("style","display: 'block';");
								$("#updateBillInfoForm #businessLicenceDiv a").attr('href', billInfo.ctx +"/indentShow/attachment?filename="+businessLicenceFilename+"&username="+billInfo.currentAccount).text(businessLicenceFilename);
							}
							
							//$("#updateBillInfoForm #taxLicenceText").val(currentTr.attr("taxLicence")).attr("disabled",true);
							var taxLicenceFilename=currentTr.attr("taxLicence");
							if(taxLicenceFilename){
								$("#updateBillInfoForm #taxLicenceText").val(currentTr.attr("taxLicence"));
								$("#updateBillInfoForm #taxLicenceDiv").attr("style","display: 'block';");
								$("#updateBillInfoForm #taxLicenceDiv a").attr('href',billInfo.ctx +"/indentShow/attachment?filename="+taxLicenceFilename+"&username="+billInfo.currentAccount).text(taxLicenceFilename);
							}
							
							//$("#updateBillInfoForm #taxerLicenceText").val(currentTr.attr("taxerLicence")).attr("disabled",true);
							var taxerLicenceFilename=currentTr.attr("taxerLicence");
							if(taxerLicenceFilename){
								$("#updateBillInfoForm #taxerLicenceText").val(currentTr.attr("taxerLicence"));
								$("#updateBillInfoForm #taxerLicenceDiv").attr("style","display: 'block';");
								$("#updateBillInfoForm #taxerLicenceDiv a").attr('href', billInfo.ctx +"/indentShow/attachment?filename="+taxerLicenceFilename+"&username="+billInfo.currentAccount).text(taxerLicenceFilename);
							}
						}
					},
					afterShow:function(){
						$("#updateBillInfoForm #bankNo").bind('blur',function(e){
							if(!valiter.isBankNo($(this).val())){
							  $(this).next().show();
							}
							else{
								$(this).next().hide();
							}
							
						});
						
						$("#updateBillInfoForm #registerTelephone").bind('blur',function(e){
							if(valiter.telephone($(this).val())){
							 $(this).next().show();
							}
							else{
								$(this).next().hide();
							}
							
						});
						
						$("#updateBillInfoForm #qyInvoiceName").bind('blur',function(e){
							if(valiter.isNull($(this).val())){
							 $(this).next().show();
							}
							else{
								$(this).next().hide();
							}
							
						});
						/*$("#updateBillInfoForm #psInvoiceName").bind('blur',function(e){
							if(valiter.isNull($(this).val())){
							 $(this).next().show();
							}
							else{
								$(this).next().hide();
							}
							
						});
						*/
						$("#updateBillInfoForm #taxerNo").bind('blur',function(e){
							if(valiter.isNull($(this).val())){
							 $(this).next().show();
							}
							else{
								$(this).next().hide();
							}
							
						});
						$("#updateBillInfoForm #bankName").bind('blur',function(e){
							if(valiter.isNull($(this).val())){
							 $(this).next().show();
							}
							else{
								$(this).next().hide();
							}
							
						});
						$("#updateBillInfoForm #registerAddress").bind('blur',function(e){
							if(valiter.isNull($(this).val())){
							 $(this).next().show();
							}
							else{
								$(this).next().hide();
							}
							
						});
					}
				});
			} 
			//每次页面show前把checked和disabled状态清空
			$("#updateBillInfoForm input[name='invoiceItem']").removeAttr("checked").removeAttr("disabled");
			$("#updateBillInfoForm input[name='invoiceType']").removeAttr("checked").removeAttr("disabled");
			billInfo.updateFormModal.setWidth(600).setHeight(450).setTop(50).show();
		},
		uploadFile:function(type){
			var formType = "";
			//判断显示的modal
			$(".modal").each(function(i,item){
				if($(this).hasClass("in")){
					formType = $(this).attr("id");
					return false;
				}
			});
			var attachment = "";
			//根据选中的按钮判断是添加form还是修改form
            if(formType=="newBillInfoForm"){
            	
            	$("#newBillInfoForm #taxLicenceAttachmentMsg").removeClass("onError").html("");
    			$("#newBillInfoForm #businessLicenceAttachmentMsg").removeClass("onError").html("");
    			$("#newBillInfoForm #taxerLicenceAttachmentMsg").removeClass("onError").html("");
    			
    			if(type == "taxLicence"){
    				attachment = $("#newBillInfoForm #taxLicenceAttachment").val();
        		}else if(type == "taxerLicence"){
        			attachment = $("#newBillInfoForm #taxerLicenceAttachment").val();
        		}else if(type == "businessLicence"){
        			attachment = $("#newBillInfoForm #businessLicenceAttachment").val();
        		}
            	
            	if(billInfo.geshiTest(attachment)){
    				var options = { 
    			            data: {},
    			            type : "POST",
    			            dataType:  'json',
    			            timeout  : 1800000,
    			            async:false,
    			            success: function(rs) {
    			            	if(rs.successFlag == "2"){
    			            		if(type == "taxLicence"){
    			            			$("#newBillInfoForm #taxLicenceAttachmentMsg").html("图片大小已超过2M");
    			            		}else if(type == "businessLicence"){
    			            			$("#newBillInfoForm #businessLicenceAttachmentMsg").html("图片大小已超过2M");
    			            		}else if(type="taxerLicence"){
    			            			$("#newBillInfoForm #taxerLicenceAttachmentMsg").html("图片大小已超过2M");
    			            		}
    			            	}else if(rs.successFlag == '1'){
    			            		var str = attachment.substring(attachment.indexOf("."),attachment.length);
    			            		var date = new Date();
    			            	    var filename = "CN"+ date.getTime()+str;
    			            	    var options = { 
    			            	            data: { "objectName1":filename},
    			            	            type : "POST",
    			            	            dataType:  'json',
    			            	            timeout  : 1800000,
    			            	            success: function(rs) {
    			            	            	if(rs.successFlag == '1'){
    			            	            		 /*msgModal.setContent("<span class='text-success'>图片上传成功</span>");
    				            	        		 msgModal.show();*/
    				            	        		 var ctx = billInfo.ctx;
    				            	        		 var allCheckedBox = $("#billInfoTable tbody input[type='checkbox']:checked");
    				         						 var currentTr=$(allCheckedBox[0]).parents("tr");
    				            	        		 if(type == "taxLicence"){
    				            	        			 //$("#imageShowBl").removeClass("hide");
    				            	        			 //$("#attachmentShowLb").attr("src", ctx +"/indentShow/attachment?filename="+filename+"&username="+billInfo.currentAccount);
    				            	        			 //$("#attachmentShowLb").attr("attachmentShowLbFileName",filename);
    				            	        			 //如果修改时不上传图片，则选择默认值
    				            	        			 if(!$("#newBillInfoForm #taxLicenceAttachment").val()){
    				            	        				 $("#newBillInfoForm #taxLicenceText").val(currentTr.attr("taxLicence"));
    				            	        				 
    				            	        				 $("#newBillInfoForm #taxLicenceDiv").attr("style","display: 'block';");
 					         								 $("#newBillInfoForm #taxLicenceDiv a").attr('href', billInfo.ctx +"/indentShow/attachment?filename="+currentTr.attr("taxLicence")+"&username="+billInfo.currentAccount).text(currentTr.attr("taxLicence"));
    				            	        			 }else{
    				            	        				 $("#newBillInfoForm #taxLicenceText").val(filename);
    				            	        				 $("#newBillInfoForm #taxLicenceDiv").attr("style","display: 'block';");
 					         								 $("#newBillInfoForm #taxLicenceDiv a").attr('href', billInfo.ctx +"/indentShow/attachment?filename="+filename+"&username="+billInfo.currentAccount).text(filename);
    				            	        			 }
    				     		            		}else if(type == "taxerLicence"){
    				     		            			if(!$("#newBillInfoForm #taxerLicenceAttachment").val()){
    				     		            				$("#newBillInfoForm #taxerLicenceText").val(currentTr.attr("taxerLicence"));
    				     		            				$("#newBillInfoForm #taxerLicenceDiv").attr("style","display: 'block';");
					         								$("#newBillInfoForm #taxerLicenceDiv a").attr('href', billInfo.ctx +"/indentShow/attachment?filename="+currentTr.attr("taxerLicence")+"&username="+billInfo.currentAccount).text(currentTr.attr("taxerLicence"));
    				     		            			}else{
    				     		            				$("#newBillInfoForm #taxerLicenceText").val(filename);
    				     		            				$("#newBillInfoForm #taxerLicenceDiv").attr("style","display: 'block';");
					         								$("#newBillInfoForm #taxerLicenceDiv a").attr('href', billInfo.ctx +"/indentShow/attachment?filename="+filename+"&username="+billInfo.currentAccount).text(filename);
    				     		            			}
    				     		            		}else if(type == "businessLicence"){
    				     		            			if(!$("#newBillInfoForm #businessLicenceAttachment").val()){
    				     		            				$("#newBillInfoForm #businessLicenceText").val(currentTr.attr("businessLicence"));
    				     		            				$("#newBillInfoForm #businessLicenceDiv").attr("style","display: 'block';");
					         								$("#newBillInfoForm #businessLicenceDiv a").attr('href', billInfo.ctx +"/indentShow/attachment?filename="+currentTr.attr("businessLicence")+"&username="+billInfo.currentAccount).text(currentTr.attr("businessLicence"));
    				     		            			}else{
    				     		            				$("#newBillInfoForm #businessLicenceText").val(filename);
    				     		            				$("#newBillInfoForm #businessLicenceDiv").attr("style","display: 'block';");
					         								$("#newBillInfoForm #businessLicenceDiv a").attr('href', billInfo.ctx +"/indentShow/attachment?filename="+filename+"&username="+billInfo.currentAccount).text(filename);
    				     		            			}
    				     		            		}
    			            	            	}else if(rs.successFlag == '2'){
    			            	            		if(type == "businessLicence"){
    			        		            			$("#newBillInfoForm #businessLicenceAttachmentMsg").html("图片上传失败");
    			        		            		}else if(type == "taxLicence"){
    			        		            			$("#newBillInfoForm #taxLicenceAttachmentMsg").html("图片上传失败");
    			        		            		}else if(type="taxerLicence"){
    			    			            			$("#newBillInfoForm #taxerLicenceAttachmentMsg").html("图片上传失败");
    			    			            		}
    			            	            	}
    			            	            	
    			            	    	    },			            	
    			            	            error: function() {
    			            	            	$.growlUI("提示", "上传失败"); 
    			            	             }
    			            	            };
    			            	    var ctx = billInfo.ctx;
    			            	    if(type == "taxLicence"){
    			            	    	$("#newBillInfoForm #createFormTL").attr("action",ctx +"/pr/indent/uploadObjectIndent");
    				            	     $("#newBillInfoForm #createFormTL").ajaxSubmit(options);
    			            		}else if(type == "businessLicence"){
    			            			$("#newBillInfoForm #createFormBL").attr("action",ctx +"/pr/indent/uploadObjectIndent");
    				            	     $("#newBillInfoForm #createFormBL").ajaxSubmit(options);
    			            		}else if(type == "taxerLicence"){
    			            			$("#newBillInfoForm #createFormTx").attr("action",ctx +"/pr/indent/uploadObjectIndent");
    				            	     $("#newBillInfoForm #createFormTx").ajaxSubmit(options);
    			            		}
    			            	     
    			            	}						            	
    			    	    }
    			    }; 
    			    var ctx = billInfo.ctx;
    			    if(type == "taxLicence"){
    			    	$("#newBillInfoForm #createFormTL").attr("action",ctx +"/pr/indent/isObjectSizeOver2MIndent");
    			        $("#newBillInfoForm #createFormTL").ajaxSubmit(options);
    	    		}else if(type == "businessLicence"){
    	    			$("#newBillInfoForm #createFormBL").attr("action",ctx +"/pr/indent/isObjectSizeOver2MIndent");
    			        $("#newBillInfoForm #createFormBL").ajaxSubmit(options);
    	    		}else if(type == "taxerLicence"){
    	    			$("#newBillInfoForm #createFormTx").attr("action",ctx +"/pr/indent/isObjectSizeOver2MIndent");
    			        $("#newBillInfoForm #createFormTx").ajaxSubmit(options);
    	    		}
    			    
    			}else{
    				if(type == "taxLicence"){
            			$("#newBillInfoForm #taxLicenceAttachmentMsg").html("图片以jpg,gif,png格式提交");
            		}else if(type == "businessLicence"){
            			$("#newBillInfoForm #businessLicenceAttachmentMsg").html("图片以jpg,gif,png格式提交");
            		}else if(type == "taxerLicence"){
            			$("#newBillInfoForm #taxerLicenceAttachmentMsg").html("图片以jpg,gif,png格式提交");
            		}
    			}
            	
				
			}else if(formType=="updateBillInfoForm"){
				
				$("#updateBillInfoForm #taxLicenceAttachmentMsg").removeClass("onError").html("");
				$("#updateBillInfoForm #businessLicenceAttachmentMsg").removeClass("onError").html("");
				$("#updateBillInfoForm #taxerLicenceAttachmentMsg").removeClass("onError").html("");
				
				if(type == "taxLicence"){
    				attachment = $("#updateBillInfoForm #taxLicenceAttachment").val();
        		}else if(type == "taxerLicence"){
        			attachment = $("#updateBillInfoForm #taxerLicenceAttachment").val();
        		}else if(type == "businessLicence"){
        			attachment = $("#updateBillInfoForm #businessLicenceAttachment").val();
        		}
				
				if(billInfo.geshiTest(attachment)){
					var options = { 
				            data: {},
				            type : "POST",
				            dataType:  'json',
				            timeout  : 1800000,
				            async:false,
				            success: function(rs) {
				            	if(rs.successFlag == "2"){
				            		if(type == "taxLicence"){
				            			$("#updateBillInfoForm #taxLicenceAttachmentMsg").html("图片大小已超过2M");
				            		}else if(type == "businessLicence"){
				            			$("#updateBillInfoForm #businessLicenceAttachmentMsg").html("图片大小已超过2M");
				            		}else if(type="taxerLicence"){
				            			$("#updateBillInfoForm #taxerLicenceAttachmentMsg").html("图片大小已超过2M");
				            		}
				            	}else if(rs.successFlag == '1'){
				            		var str = attachment.substring(attachment.indexOf("."),attachment.length);
				            		var date = new Date();
				            	    var filename = "CN"+ date.getTime()+str;
				            	    var options = { 
				            	            data: { "objectName1":filename},
				            	            type : "POST",
				            	            dataType:  'json',
				            	            timeout  : 1800000,
				            	            success: function(rs) {
				            	            	if(rs.successFlag == '1'){
				            	            		 /*msgModal.setContent("<span class='text-success'>图片上传成功</span>");
					            	        		 msgModal.show();*/
					            	        		 var ctx = billInfo.ctx;
					            	        		 var allCheckedBox = $("#billInfoTable tbody input[type='checkbox']:checked");
					         						 var currentTr=$(allCheckedBox[0]).parents("tr");
					            	        		 if(type == "taxLicence"){
					            	        			 //如果修改时不上传图片，则选择默认值
					            	        			 if(!$("#updateBillInfoForm #taxLicenceAttachment").val()){
					            	        				 $("#updateBillInfoForm #taxLicenceText").val(currentTr.attr("taxLicence"));
					            	        				 
					            	        				 $("#updateBillInfoForm #taxLicenceDiv").attr("style","display: 'block';");
					         								 $("#updateBillInfoForm #taxLicenceDiv a").attr('href', billInfo.ctx +"/indentShow/attachment?filename="+currentTr.attr("taxLicence")+"&username="+billInfo.currentAccount).text(currentTr.attr("taxLicence"));
					            	        			 }else{
					            	        				 $("#updateBillInfoForm #taxLicenceText").val(filename);
					            	        				 $("#updateBillInfoForm #taxLicenceDiv").attr("style","display: 'block';");
					         								 $("#updateBillInfoForm #taxLicenceDiv a").attr('href', billInfo.ctx +"/indentShow/attachment?filename="+filename+"&username="+billInfo.currentAccount).text(filename);
					            	        			 }
					     		            		}else if(type == "taxerLicence"){
					     		            			if(!$("#updateBillInfoForm #taxerLicenceAttachment").val()){
					     		            				$("#updateBillInfoForm #taxerLicenceText").val(currentTr.attr("taxerLicence"));
					     		            				$("#updateBillInfoForm #taxerLicenceDiv").attr("style","display: 'block';");
					         								$("#updateBillInfoForm #taxerLicenceDiv a").attr('href', billInfo.ctx +"/indentShow/attachment?filename="+currentTr.attr("taxerLicence")+"&username="+billInfo.currentAccount).text(currentTr.attr("taxerLicence"));
					     		            			}else{
					     		            				$("#updateBillInfoForm #taxerLicenceText").val(filename);
					     		            				$("#updateBillInfoForm #taxerLicenceDiv").attr("style","display: 'block';");
					         								$("#updateBillInfoForm #taxerLicenceDiv a").attr('href', billInfo.ctx +"/indentShow/attachment?filename="+filename+"&username="+billInfo.currentAccount).text(filename);
					     		            			}
					     		            		}else if(type == "businessLicence"){
					     		            			if(!$("#updateBillInfoForm #businessLicenceAttachment").val()){
					     		            				$("#updateBillInfoForm #businessLicenceText").val(currentTr.attr("businessLicence"));
					     		            				$("#updateBillInfoForm #businessLicenceDiv").attr("style","display: 'block';");
					         								$("#updateBillInfoForm #businessLicenceDiv a").attr('href', billInfo.ctx +"/indentShow/attachment?filename="+currentTr.attr("businessLicence")+"&username="+billInfo.currentAccount).text(currentTr.attr("businessLicence"));
					     		            			}else{
					     		            				$("#updateBillInfoForm #businessLicenceText").val(filename);
					     		            				$("#updateBillInfoForm #businessLicenceDiv").attr("style","display: 'block';");
					         								$("#updateBillInfoForm #businessLicenceDiv a").attr('href', billInfo.ctx +"/indentShow/attachment?filename="+filename+"&username="+billInfo.currentAccount).text(filename);
					     		            			}
					     		            		}
				            	            	}else if(rs.successFlag == '2'){
				            	            		if(type == "businessLicence"){
				        		            			$("#updateBillInfoForm #businessLicenceAttachmentMsg").html("图片上传失败");
				        		            		}else if(type == "taxLicence"){
				        		            			$("#updateBillInfoForm #taxLicenceAttachmentMsg").html("图片上传失败");
				        		            		}else if(type="taxerLicence"){
				    			            			$("#updateBillInfoForm #taxerLicenceAttachmentMsg").html("图片上传失败");
				    			            		}
				            	            	}
				            	            	
				            	    	    },			            	
				            	            error: function() {
				            	            	$.growlUI("提示", "上传失败"); 
				            	             }
				            	            };
				            	    var ctx = billInfo.ctx;
				            	    if(type == "taxLicence"){
				            	    	$("#updateBillInfoForm #createFormTL").attr("action",ctx +"/pr/indent/uploadObjectIndent");
					            	     $("#updateBillInfoForm #createFormTL").ajaxSubmit(options);
				            		}else if(type == "businessLicence"){
				            			$("#updateBillInfoForm #createFormBL").attr("action",ctx +"/pr/indent/uploadObjectIndent");
					            	     $("#updateBillInfoForm #createFormBL").ajaxSubmit(options);
				            		}else if(type == "taxerLicence"){
				            			$("#updateBillInfoForm #createFormTx").attr("action",ctx +"/pr/indent/uploadObjectIndent");
					            	     $("#updateBillInfoForm #createFormTx").ajaxSubmit(options);
				            		}
				            	     
				            	}						            	
				    	    }
				    }; 
				    var ctx = billInfo.ctx;
				    if(type == "taxLicence"){
				    	$("#updateBillInfoForm #createFormTL").attr("action",ctx +"/pr/indent/isObjectSizeOver2MIndent");
				        $("#updateBillInfoForm #createFormTL").ajaxSubmit(options);
		    		}else if(type == "businessLicence"){
		    			$("#updateBillInfoForm #createFormBL").attr("action",ctx +"/pr/indent/isObjectSizeOver2MIndent");
				        $("#updateBillInfoForm #createFormBL").ajaxSubmit(options);
		    		}else if(type == "taxerLicence"){
		    			$("#updateBillInfoForm #createFormTx").attr("action",ctx +"/pr/indent/isObjectSizeOver2MIndent");
				        $("#updateBillInfoForm #createFormTx").ajaxSubmit(options);
		    		}
				    
				}else{
					if(type == "taxLicence"){
	        			$("#updateBillInfoForm #taxLicenceAttachmentMsg").html("图片以jpg,gif,png格式提交");
	        		}else if(type == "businessLicence"){
	        			$("#updateBillInfoForm #businessLicenceAttachmentMsg").html("图片以jpg,gif,png格式提交");
	        		}else if(type == "taxerLicence"){
	        			$("#updateBillInfoForm #taxerLicenceAttachmentMsg").html("图片以jpg,gif,png格式提交");
	        		}
				}
				
			}
		},
		geshiTest:function(attachment){//获取格式信息
			var str = attachment.substring(attachment.indexOf("."),attachment.length).toLowerCase();
			if(str == ".jpg" || str == ".gif"|| str == ".png"){
				return true;
			}else{
				return false;
			}
		}	
};
