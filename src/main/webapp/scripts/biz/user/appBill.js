window.currentInstanceType='bill';

$(function(){
	bill.init();
});
var billTr = "";
var bill = {
		datatable : null,
		modelDatatable :null,
		modelPostable :null,
		
		instances : [],
		service : com.skyform.service.billService,
		addrService:com.skyform.service.billAddressService,
		billInfoService:com.skyform.service.billInfoService,
		currentAccount:"",
		ctx:"",
		//billdatatable : new com.skyform.component.DataTable(),
		//service : com.skyform.service.billInfoService,
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
		templateTotal:0,
		dataTemplateTotal:0,
		
		init : function() {
			/*var billAddr ={
			    "msg":"查询成功!",
			    "data":[
			        {
			            "postId":73536701,
			            "postCode":"100088",
			            "receiver":"林一鸣",
			            "postAddress":"二龙路中国联通研究院",
			            "isUsed":1,
			            "telephone":"18600011235",
			            "accountId":400014
			        }
			    ],
			    "code":0
			};*/
			bill.ctx = $("#ctx").val();
			bill.describeInvoicePostInfo();
			bill.describeInvoiceTemplate();
	                bill.billInfoService.describeInvoiceTemplate({},function onSuccess(data){
				bill.dataTemplateTotal=data.length;
			});
			
			
			
			for (var name in provinceJson)
			{
				var oNew=new Option();
				
				oNew.value=name;
				oNew.text=provinceJson[name];
			
				$('#createProvince').append(oNew);
			}
			//修改页初始化下拉列表
			for (var name in provinceJson)
			{
				var oNew=new Option();
				
				oNew.value=name;
				oNew.text=provinceJson[name];
			
				$('#modProvince').append(oNew);
			}
			
	$('#createProvince').bind('change',function(e){
					
				
				var sName=$("#createProvince  option:selected").val();
				
				if(sName=="请选择"){
					$('#createCity').html('<option>请选择</option>');
				}else{
					$(this).next().hide();
				$('#createCity').html('');
				
				var arr=cityJson[sName];
				
				
				
				for (var i=0; i<arr.length; i++)
				{
					var oNew=new Option();
					
					oNew.text=arr[i].name;
					oNew.value=arr[i].value;
					
					$('#createCity').append(oNew);
				}
				}
				
								
			});	
			
	$('#modProvince').bind('change',function(e){
		
		var sName=$("#modProvince  option:selected").val();
		
		if(sName=="请选择"){
			
			$('#modCity').html('<option>请选择</option>');
		}else{
			$(this).next().hide();
		$('#modCity').html('');
		var arr=cityJson[sName];
		
		for (var i=0; i<arr.length; i++)
		{
			var oNew=new Option();
			//console.log('a');
			oNew.text=arr[i].name;
			oNew.value=arr[i].value;
			
			$('#modCity').append(oNew);
		}
		}
		
						
	});	
			/*var bill = {
					  "msg": "查询成功!",
					  "data": [
					    {
					      "registerTelephone": "010-60880188",
					      "invoiceItem": 1,
					      "registerAddress": "北京君太百货NewNew",
					      "bankName": "招商银行NewNew",
					      "businessLicence": "21321654984",
					      "bankNo": 6226090107518888,
					      "taxerNo": "885621486241856",
					      "invoiceName": "联通云数据公司NewNew",
					      "taxerLicence": "634654354",
					      "invoiceType": 1,
					      "templateId": 73528701,
					      "isUsed": 1,
					      "taxLicence": "2545635496",
					      "templateStatus": 0,
					      "checkDate": 1446779264000,
					      "accountId": 400014
					    },
					    {
					      "invoiceItem": 0,
					      "bankNo": 0,
					      "invoiceName": "王健New",
					      "templateId": 73598701,
					      "invoiceType": 0,
					      "isUsed": 1,
					      "templateStatus": 1,
					      "checkDate": 1446792895000,
					      "accountId": 400014
					    }
					  ],
					  "code": 0
					};*/
			//bill.describeInvoiceTemplate();
		
			
			
			$("#btn_cre").bind('click',function(e){
				
				$('#createModal').modal('show');
				
								
			});	
			
			$("#nname").bind('blur',function(e){
				if(!valiter.isName($(this).val())){
				$(this).next().show();
				}
				else{
					$(this).next().hide();
				}
				
			});
			
			$("#naddress").bind('blur',function(e){
				if(!valiter.isAddress($(this).val()))
					{
					$(this).next().show();
					}else{
						$(this).next().hide();
					}
				
			});
			
			$("#nphone").bind('blur',function(e){
				
				if(!valiter.mobilephone($(this).val())){
				$(this).next().show();
				}else{
					$(this).next().hide();
				}
			});
			$("#npostcard").bind('blur',function(e){
				
				if(!valiter.isPostalCode($(this).val())){
				
				$(this).next().show();
				}else{
					$(this).next().hide();
				}
			});
			
			//绑定新建发票模版
			$("#createBillInfo").unbind("click").bind('click', function(e) {
				bill.newInstance();
			});
			
		$("#createAddress").bind('click',function(){
				
				if(($("#createProvince option:selected").text()=="请选择")){
					
					$("#createProvince").next().show();
					
				}
				
				$("#nname").blur();
				$("#nphone").blur();
				$("#naddress").blur();
				$("#npostcard").blur();
				
			
				if(!( ($("#createProvince option:selected").val()!="请选择")&&valiter.isName($("#nname").val())&&valiter.mobilephone($("#nphone").val())&&
				valiter.isPostalCode($("#npostcard").val())&&valiter.isAddress($("#naddress").val()))){
				
					return;
				}else{
					
				if(($("#createProvince option:selected").text()!="请选择")){
					$("#createCity").next().hide();
					
				}
					
				var newName = $.trim($("#nname").val());
				
				//var newAddress = $("#createProvince  option:selected").text()+$("#createCity  option:selected").text()+$.trim($("#naddress").val());
				var newAddress = $.trim($("#naddress").val());
				var newPostcard = $.trim($("#npostcard").val());
				var newPhone = $.trim($("#nphone").val());
				var newProvince=$("#createProvince  option:selected").val();
				var newCity=$("#createCity  option:selected").val();
				
//				$.post("#",{"newName","1"},function(data){
//					
//				});
				var params ={};
				
				params.receiver = newName;
				params.telephone = newPhone ;
				params.postAddress = newAddress;
				params.postCode = newPostcard;
				params.areaNo=newProvince;
				params.cityNo=newCity;

				
				bill.addrService.createAddress(params,function onSuccess(data){
				//address.service.createAddress(params,function onSuccess(data){
					//var cJson=eval('('+data+')');
					 //if(cJson.code == 0){
							
				        	bill.describeInvoicePostInfo();
				        	$('#createModal').modal('hide');
							$("#nname").val('');
							$("#npostcard").val('');
							$("#nphone").val('');
							$("#naddress").val('');
							//$("#createProvince").eq(0).attr("selected",true);
							$("#createProvince option:first").attr("selected",true);
							//$("#createCity option:first").attr("selected",true);
							//$('#createProvince').html('<option>请选择</option>');
							$('#createCity').html('<option>请选择</option>');
							$.growlUI("提示", "地址创建成功！");	
				       // }else{
				        	//$.growlUI("提示", cJson.msg);
				        //}
				},function onError(msg){
					
					$.growlUI("提示", msg);
				});

			};
			}
			);
		
			
			// 绑定申请发票按钮事件
			$("#createBill").unbind("click").bind("click", function() {				
				var row = $("#billTable tbody input[type='checkbox']:checked").parents("tr");
				
				if(row.length==0){
					$.growlUI("提示", "您还没选择账单!");
					return;
				}
				var j=0,aa;
				$(row).each(function(i,items){
					aa=$(items).attr("month");
					j++;
				});
 	                        if(bill.dataTemplateTotal>=3){
 	                        	
					$("#createBillInfo").addClass("disabled");
					$("#createBillInfo").unbind();
				}
				//获取到已经勾选的账单月份
				var billTimeSelect = [],src,res;
				$("#btnComfirm").unbind("click").bind("click", function() {
					var addrRow = $("#billAddrTable tbody input[type='radio']:checked").parents("tr");
					//var billRow = $("#stable tbody input[type='radio']:checked").parents("tr");
					var billRow=$("#billModelTable tbody input[type='radio']:checked").parents("tr");
					
					if(addrRow.length==0||billRow.length==0){
						
						$.growlUI("提示", "请完善您的信息！");
						return;
					}
					
					$(row).each(function(i,item){
						src=$(item).attr("month");
						billTimeSelect.push(src);
						if(i<j-1){
							billTimeSelect.push(",");
						}
						res=billTimeSelect.join("");
					});
					var radioModelTable = $("#billModelTable tbody input[type='radio']:checked").parents("tr");
					var templateId = parseFloat(radioModelTable.attr("templateId"));
					var radioAddrTable = $("#billAddrTable tbody input[type='radio']:checked").parents("tr");
					var postId = parseFloat(radioAddrTable.attr("postId"));
					var params = {
							"printFee":total,
							"printMonths":res,
							"postId":postId,
							"templateId":templateId,
					};
				    bill.createTiecketBill(params);
				});
				//返回上一步按钮事件
				$("#btnCacel").unbind("click").bind("click", function() {
					//bill.updateDataTable();
					$("#create_bill").attr("style","display:none;");
					$("#selTime").attr("style","display:block;");
				});
				/*
				if(null==bill.instances){
					$.growlUI("提示", "请到发票信息管理添加发票信息!"); 
					return;
				}else{
					bill.describeInvoiceTemplate();
				};
				*/
				//bill.describeInvoiceTemplate();
				$("#create_bill").attr("style","display:block;");
				$("#selTime").attr("style","display:none;");
				//选择账单金额合计
				var total = 0;
				
				var row = $("#billTable tbody input[type='checkbox']:checked").parents("tr");
				//console.log(row);
				
				$(row).each(function(i,item){
					total += Number($(this).attr("totalFee"));
				});
				$("#selectSum").html("选择了"+row.length+"个账单，合计"+total/1000+"元。");
			});
			// 查询账单返回的json格式
			/*var data ={
				  "msg": "查询成功!",
				  "data": {
				    "billList": [
				      {
				        "totalFee": 126680,
				        "banlance": 0,
				        "canPrintFee": 126680,
				        "month": "201510"
				      },
				      {
				        "totalFee": 151340,
				        "banlance": 0,
				        "canPrintFee": 151340,
				        "month": "201509"
				      },
				      {
				        "totalFee": 183470,
				        "banlance": 0,
				        "canPrintFee": 183470,
				        "month": "201508"
				      },
				      {
				        "totalFee": 328050,
				        "banlance": 0,
				        "canPrintFee": 328050,
				        "month": "201507"
				      },
				      {
				        "totalFee": 538710,
				        "banlance": 0,
				        "canPrintFee": 538710,
				        "month": "201506"
				      },
				      {
				        "totalFee": 218960,
				        "banlance": 0,
				        "canPrintFee": 218960,
				        "month": "201505"
				      },
				      {
				        "totalFee": 200130,
				        "banlance": 0,
				        "canPrintFee": 200130,
				        "month": "201504"
				      },
				      {
				        "totalFee": 111450,
				        "banlance": 0,
				        "canPrintFee": 111450,
				        "month": "201501"
				      }
				    ],
				    "flag": "201501,201502"
				  },
				  "code": 0
				};*/
			
			bill.describeBillBalance();
			$("#create_bill").attr("style","display:none;");
		},
			renderDataTable : function(data) {
			var flag="";
			bill.datatable = new com.skyform.component.DataTable(),
			bill.datatable.renderByData("#billTable", {
					"data" : data,
					"iDisplayLength": 12,				
					"columnDefs" : [
					     {title : "", name : "ID"},
					     {title : "账单时间", name : "month"},
					     {title : "账单金额(元)", name : "totalFee"},
					     {title : "账单状态", name : "billStatus"}
					],
					"onColumnRender" : function(columnIndex, columnMetaData, columnData) {
						var text = columnData[''+columnMetaData.name] || "";
						if (columnMetaData.name == "ID") {
							if(billTr.indexOf(columnData.month)!= -1){
								text = '<input type="checkbox" disabled value="'+text+'">';
							}else{
								text = '<input type="checkbox" value="'+text+'">';
							}
						 }
						 if (columnMetaData.name == "month") {
							 text = text;
							 flag=text;
						 }
						 if (columnMetaData.name == "totalFee") {
							 text = text/1000;
						 }
						 if (columnMetaData.name == "billStatus") {
							if(billTr.indexOf(flag)!= -1){
								text="已申请";
								flag="";
							}else{
								text="未申请";
								flag="";
							}
						 }
						 return text;
					},
					"afterRowRender" : function(rowIndex, data, tr){
						tr.attr("month", data.month).
						attr("ID", data.month).
						attr("totalFee", data.totalFee);
					},
				}
			);
		},
		LoadBillModelDataTable : function(data) {
			
			if(null==bill.modelDatatable){
				
				bill.modelDatatable = new com.skyform.component.DataTable();
				bill.modelDatatable.renderByData("#billModelTable", {
					"data" : data,
					"iDisplayLength": 5,				
					"columnDefs" : [
					     {title : "", name : "templateId"},
					     {title : "开具类型", name : "invoiceType"},
					     {title : "发票抬头", name : "invoiceName"},
					     {title : "发票类型", name : "invoiceItem"}
					],
					"onColumnRender" : function(columnIndex, columnMetaData, columnData) {
						var text = columnData[''+columnMetaData.name] || "";
						if (columnMetaData.name == "templateId") {
						         text = '<input type="radio" name="billModel" value="'+text+'">';
							}
						 
						 if (columnMetaData.name == "invoiceType") {
							 
							 text = com.skyform.service.billInfoService.getInvoiceType(columnData.invoiceType);
								
						 }
						 if (columnMetaData.name == "invoiceName") {
							 
							 text = text;
								
						 }
						 if (columnMetaData.name == "invoiceItem") {
							
							text = com.skyform.service.billInfoService.getInvoiceItem(columnData.invoiceItem);
								
							}
						 return text;
					},
					"afterRowRender" : function(rowIndex, data, tr){
						tr.attr("invoiceType", data.invoiceType).
						attr("templateId", data.templateId).
						attr("billType", data.invoiceItem).
						attr("invoiceName", data.invoiceName);
					},
					"afterTableRender" : function() {
						 $("input[name=billModel]:eq(0)").attr("checked",'checked');
						//更新完页面之后 校验数量
//							var allRow = $("#billModelTable tbody").find("tr");
//							var allStateTotal=0;
//							if(allRow){
//								allRow.each(function(index,element){
//									if($(this).attr("invoicetype")=="0"){
//										allStateTotal=allStateTotal+1;
//									}
//									if($(this).attr("invoicetype")=="1"){
//											allStateTotal=allStateTotal+1;
//									}
//								})
//							}
//							if(allStateTotal>=3){
//								$("#createBillInfo").addClass("disabled");
//								$("#createBillInfo").unbind();
//								//$.growlUI("提示", "已达上限！");	
//								return;
//							}else{
//								$("#createBillInfo").removeClass("disabled");
//							}
					}
					}
			);
			}
			else {
				
				//bill.updateTempleDataTable();	
				bill.modelDatatable.updatedata(data);
			}
			    
		},
		LoadBillAddrDataTable : function(data) {
			if(bill.modelPostable){
				
				bill.modelPostable.updateData(data);
			}else{
			
			bill.modelPostable=new com.skyform.component.DataTable(),
			bill.modelPostable.renderByData("#billAddrTable", {
					"data" : data,
					"iDisplayLength": 5,				
					"columnDefs" : [
					     {title : "", name : "postId"},
					     {title : "收件人姓名", name : "receiver"},
					     {title : "电话号码", name : "telephone"},
					     {title : "地址", name : "postAddress"},
					     {title : "邮编", name : "postCode"}
					],
					"onColumnRender" : function(columnIndex, columnMetaData, columnData) {
						var text = columnData[''+columnMetaData.name] || "";
						if (columnMetaData.name == "postId") {
								text = '<input type="radio" name="billAddr" value="'+text+'">';
						 }
						 if (columnMetaData.name == "receiver") {
								text = text;
						 }
						 if (columnMetaData.name == "telephone") {
								text = text;
						 }
						 if (columnMetaData.name == "postAddress") {
							 for(var i=0;i<cityJson[columnData["areaNo"]].length;i++){
									
									if(cityJson[columnData["areaNo"]][i].value==columnData["cityNo"]){
										var textCity =cityJson[columnData["areaNo"]][i].name;
										
										
									}
							 }
							
							 text =provinceJson[columnData["areaNo"]]+textCity+text;
								//text = provinceJson[columnData["areaNo"]]+columnData["cityNo"]+text;
								//text = text;
						 }
						 if (columnMetaData.name == "postCode") {
							 	text = text;
						 }
						 return text;
					},
					"afterRowRender" : function(rowIndex, data, tr){
						tr.attr("postId", data.postId).
						attr("receiver", data.receiver).
						attr("telephone", data.telephone).
						attr("postCode", data.postCode).
						attr("postAddress", data.postAddress).
						attr("areaNo",data.areaNo).
						attr("cityNo",data.cityNo);
					},
					"afterTableRender" : function() {
						 $("input[name=billAddr]:eq(0)").attr("checked",'checked');
					}
				}
			);
			}
		},
		//新建发票模版
		
			newInstance : function(){//新建
//				bill.stateTotal=bill.dataTemplateTotal;
//				if(bill.stateTotal>=3){
//					$("#createBillInfo").addClass("disabled");
//					$("#createBillInfo").unbind();
//					//$.growlUI("提示", "已达上限！");	
//					return;
//				}else{
//					$("#createBillInfo").removeClass("disabled");
//				}
//				var allRow = $("#billModelTable tbody").find("tr");
//				
//				
//				if(allRow){
//					allRow.each(function(index,element){
//						if($(this).attr("invoicetype")=="0"){
//							//bill.stateTotal=bill.stateTotal+1;
//							
//							bill.psTotal=bill.psTotal+1;
//						}
//						if($(this).attr("invoicetype")=="1"){
//							//	bill.stateTotal=bill.stateTotal+1;
//								bill.qyTotal=bill.qyTotal+1;
//								if($(this).attr("billtype")=="0"){
//									bill.qyType=bill.qyType+1;
//								}
//							
//						}
//					})
//				}
//				if(bill.stateTotal>=3){
//					$("#createBillInfo").addClass("disabled");
//					$("#createBillInfo").unbind();
//					//$.growlUI("提示", "已达上限！");	
//					return;
//				}else{
//					$("#createBillInfo").removeClass("disabled");
//				}
				if(!bill.newFormModal){
					bill.newFormModal = new com.skyform.component.Modal("newBillInfoForm","<h3>新增发票信息</h3>",$("script#new_billInfo_form").html(),{
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
													invoiceName:bill.billInfoService.getInvoiceType(0),
													
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
												return
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
										bill.billInfoService.createInvoiceTemplate(params,function onSuccess(data){
											
											bill.newFormModal.hide();
											
											
											bill.refreshDataTable();
											//bill.describeInvoiceTemplate();
											$.growlUI("提示", "添加成功！");	
											bill.setLabelClassHide("new");
											bill.refreshDataTable();
											
										},function onError(msg){
											bill.newFormModal.hide();
											$.growlUI("提示", "添加失败！");
											bill.setLabelClassHide("new");
										});
						        	   
						           },attrs:[{name:'class',value:'btn btn-primary'}]},
						           {name:'取消',onClick:function(){
						        	   bill.newFormModal.hide();
						        	   bill.setLabelClassHide("new");
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
			        	     //console.log(bill.psTotal);
			        	     //console.log(bill.qyTotal);
			        	     //如果个人发票为空
                             //console.log(bill.psTotal);
			        	     if(bill.psTotal==0){
			        	    	 //如果企业发票已经填满，默认选择个人发票按钮
			        	    	 if(bill.qyTotal==2){
			        	    		 $("#newBillInfoForm input[name='invoiceType'][value=0]").click();
								     $("#newBillInfoForm input[name='invoiceType']").attr("disabled",true);
								  //否则默认选择普通发票
			        	    	 }else{
			        	    		 if(bill.qyType==1){
					        	    		// alert('f');
					        	    		 $("#newBillInfoForm input[name='invoiceType'][value=0]").click();
						        	    	 //$("#newBillInfoForm input[name='invoiceType']").attr("disabled",true);
						        	    	 $("#newBillInfoForm input[name='invoiceItem'][value=1]").click();
						        	    	 $("#newBillInfoForm input[name='invoiceItem']").attr("disabled",true);
					        	    }else{
					        	    	 if(bill.qyType==0&&bill.qyTotal==1){
					        	    		 $("#newBillInfoForm input[name='invoiceType'][value=0]").click(); 
					        	    	     $("#newBillInfoForm input[name='invoiceItem'][value=0]").click();
					        	    	     $("#newBillInfoForm input[name='invoiceItem']").attr("disabled",true);
				        	    		 }else{
					        	    	     $("#newBillInfoForm input[name='invoiceType'][value=0]").click(); 
					        	    	     $("#newBillInfoForm input[name='invoiceItem'][value=0]").click();
					        	    	     //$("#newBillInfoForm input[name='invoiceItem'][value=1]").attr("disabled",true);
				        	    		 }
					        	    }
			        	    		 
//			        	    		 $("#newBillInfoForm input[name='invoiceType'][value=1]").click();
//			        	    		// $("#newBillInfoForm input[name='invoiceType'][value=0]").attr("disabled",true);
//			        	    		 $("#newBillInfoForm input[name='invoiceItem'][value=0]").click();
			        	    	 }
			        	     //如果有个人发票
			        	     }else if(bill.psTotal==1){
			        	    	 //alert('e');
			        	    	 //并且还有普通发票，则默认选择专用发票
			        	    	 if(bill.qyType==1){
			        	    		// alert('f');
			        	    		 $("#newBillInfoForm input[name='invoiceType'][value=1]").click();
				        	    	 $("#newBillInfoForm input[name='invoiceType']").attr("disabled",true);
				        	    	 $("#newBillInfoForm input[name='invoiceItem'][value=1]").click();
				        	    	 $("#newBillInfoForm input[name='invoiceItem']").attr("disabled",true);
			        	    	 }else{//否则选择普通发票
			        	    		 //默认发票类型不置灰
//			        	    		 if(bill.qyType==0&&bill.stateTotal==1){
//			        	    			 $("#newBillInfoForm input[name='invoiceType'][value=1]").click();
//			        	    	    	 $("#newBillInfoForm input[name='invoiceType']").attr("disabled",true);
//			        	    	    	 $("#newBillInfoForm input[name='invoiceItem'][value=0]").click();
//			        	    		 }else{
//			        	    			 $("#newBillInfoForm input[name='invoiceType'][value=1]").click();
//			        	    			 $("#newBillInfoForm input[name='invoiceType']").attr("disabled",true);
//			        	    			 $("#newBillInfoForm input[name='invoiceItem'][value=0]").click();
//			        	    			 $("#newBillInfoForm input[name='invoiceItem'][value=1]").attr("disabled",true);
//			        	    		 }
			        	    		 if(bill.qyType==0&&bill.qyTotal==1){
			        	    			 
			        	    			 $("#newBillInfoForm input[name='invoiceType'][value=1]").click();
			        	    			 $("#newBillInfoForm input[name='invoiceType']").attr("disabled",true);
			        	    			 $("#newBillInfoForm input[name='invoiceItem'][value=0]").click();
			        	    			 $("#newBillInfoForm input[name='invoiceItem']").attr("disabled",true)
			        	    			 ;
			        	    		 }else{
			        	    			 //alert('bb');
			        	    			 
			        	    			 $("#newBillInfoForm input[name='invoiceType'][value=1]").click();
			        	    			 $("#newBillInfoForm input[name='invoiceType']").attr("disabled",true);
			        	    			 $("#newBillInfoForm input[name='invoiceItem'][value=0]").click();
			        	    		 }
			        	    	 }
			        	    	
			        	     }
						},
						
						
						
						afterShow:function(){
							//bill.stateTotal=0;
							//bill.psTotal=0;
							//bill.qyTotal=0;
							//bill.qyType=0;
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
				/*if(bill.psTotal==1&&bill.qyTotal==0&&bill.stateTotal==1){
					
					 $("#newBillInfoForm input[name='invoiceType'][value=0]").click();
	    	    	 $("#newBillInfoForm input[name='invoiceType'][value=1]").attr("disabled",true);
				}*/
				bill.newFormModal.setWidth(600).setHeight(450).setTop(50).show();
			
		},
		// 刷新Table
	/*	updateDataTable : function() {
			bill.service.describeBillBalance(function onSuccess(data){
					bill.datatable.updateData(data);
				},function onError(msg){
					$.growlUI("提示", "查询发生错误：" + msg); 
				});
		},*/
		refreshDataTable : function() {
			var params={};
			bill.billInfoService.describeInvoiceTemplate(params,function onSuccess(data){
				
				
				//bill.LoadBillModelDataTable(data);
//				if(allRow){
//					allRow.each(function(index,element){
//						if($(this).attr("invoicetype")=="0"){
//							//bill.stateTotal=bill.stateTotal+1;
//							
//							bill.psTotal=bill.psTotal+1;
//						}
//						if($(this).attr("invoicetype")=="1"){
//							//	bill.stateTotal=bill.stateTotal+1;
//								bill.qyTotal=bill.qyTotal+1;
//								if($(this).attr("billtype")=="0"){
//									bill.qyType=bill.qyType+1;
//								}
//							
//						}
//					})
//				}
				
				
				
				if(data.length!=0){
					
				bill.templateTotal = data.length;
				//console.log(data);
				//console.log(data.length);
				//console.log(bill.templateTotal+'aaaaa');
				var datas = [];
				var j = 0;
				//console
				var tempPsTotal=0;
				var tempQyTotal=0;
				var tempQyType=0;
				//console.log(bill.templateTotal+"888");
				if(bill.templateTotal>=3){
					$("#createBillInfo").addClass("disabled");
					$("#createBillInfo").unbind();
					//$.growlUI("提示", "已达上限！");	
				}else{
					$("#createBillInfo").removeClass("disabled");
				}
//				if($(this).attr("invoicetype")=="0"){
//					//bill.stateTotal=bill.stateTotal+1;
//					
//					bill.psTotal=bill.psTotal+1;
//				}
//				if($(this).attr("invoicetype")=="1"){
//					//	bill.stateTotal=bill.stateTotal+1;
//						bill.qyTotal=bill.qyTotal+1;
//						if($(this).attr("billtype")=="0"){
//							bill.qyType=bill.qyType+1;
//						}
//					
//				}
				$.each(data,function(i,n){
					//console.log(n);
					if(n.invoiceType=="0"){
                     //console.log('0');
//						
						tempPsTotal=tempPsTotal+1;
					};
					if(n.invoiceType=="1"){
						//console.log('1');
						tempQyTotal=tempQyTotal+1;
						if(n.invoiceItem=="0"){
							tempQyType=tempQyType+1;
						}
					};
					
				});
				
				bill.qyTotal=tempQyTotal;
				bill.qyType=tempQyType;
				bill.psTotal=tempPsTotal;

				bill.stateTotal=bill.dataTemplateTotal;
				//console.log(bill.dataTemplateTotal);
				//console.log(bill.stateTotal);
				
				
				
				$(data).each(function(i,item){
						if(item.invoiceType!=1){
							datas.push(item);							
						}
						else if(item.invoiceItem != 1){
							datas.push(item);							
						}
						else if(item.templateStatus == 1){
							datas.push(item);
						}
					});
//					$.each(data,function(i,n){
//						if(n.invoiceItem==1){
//							if(n.templateStatus == 1){
//								datas[j]=n;
//								j++;
//							}
//						}else{
//							datas[j]=n;
//							j++;
//					}
//					});	
					if(bill.modelDatatable){
						bill.modelDatatable.updateData(datas);
						}else{
							bill.LoadBillModelDataTable(datas);
						}
				}else{
					bill.instances = null;
					return;
				}
				
				//bill.describeInvoiceTemplate();
			},function onError(msg){
				$.growlUI("提示", "查询发生错误：" + msg); 
			});
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
		
		updateTempleDataTable : function() {
			
		},
		describeBillBalance:function(){
			// 查询账单接口
			bill.service.describeBillBalance(function onSuccess(data){
				var dataJson=jQuery.parseJSON(data);
				//console.log(dataJson);
				billTr=dataJson.flag;
				if(bill.datatable==null){
					bill.renderDataTable(dataJson.billList);
				}else{
					bill.datatable.updateData(dataJson.billList);
				}
				},function onError(msg){
					$.growlUI("提示", "查询发生错误：" + msg); 
				});
		},
		describeInvoiceTemplate:function(){
			// 查询发票模板接口
			var params={};
			
			bill.billInfoService.describeInvoiceTemplate(params,function onSuccess(data){
				//过滤掉待审核的发票模板
				//console.log(data);
				if(data.length!=0){
					var datas = [];
					var j = 0;
					var tempPsTotal=0;
					var tempQyTotal=0;
					var tempQyType=0;
//					if($(this).attr("invoicetype")=="0"){
//						//bill.stateTotal=bill.stateTotal+1;
//						
//						bill.psTotal=bill.psTotal+1;
//					}
//					if($(this).attr("invoicetype")=="1"){
//						//	bill.stateTotal=bill.stateTotal+1;
//							bill.qyTotal=bill.qyTotal+1;
//							if($(this).attr("billtype")=="0"){
//								bill.qyType=bill.qyType+1;
//							}
//						
//					}
					$.each(data,function(i,n){
						//console.log(n);
						if(n.invoiceType=="0"){
                         //console.log('0');
//							
							tempPsTotal=tempPsTotal+1;
						};
						if(n.invoiceType=="1"){
							//console.log('1');
							tempQyTotal=tempQyTotal+1;
							if(n.invoiceItem=="0"){
								tempQyType=tempQyType+1;
							}
						};
						
					});
					
					bill.qyTotal=tempQyTotal;
					bill.qyType=tempQyType;
					bill.psTotal=tempPsTotal;
					//console.log(bill.qyTotal);
					//console.log(bill.qyType);
					//console.log(bill.psTotal);
					$.each(data,function(i,n){
						if(n.invoiceItem==1){
							if(n.templateStatus == 1&& n.invoiceType==1){
								datas[j]=n;
								j++;
							}
						}else{
							datas[j]=n;
							j++;
					}
					});	
					
					bill.instances = datas;
					
						bill.LoadBillModelDataTable(datas);
				}else{
					bill.instances = null;
				
					return;
				}
				//bill.LoadBillModelDataTable(data);
				},function onError(msg){
					$.growlUI("提示", "查询发生错误：" + msg); 
				});
		},
		describeInvoicePostInfo:function(){
			 //查询邮寄地址接口
			bill.addrService.quaryAddress(function onSuccess(data){
				bill.LoadBillAddrDataTable(data);
				},function onError(msg){
					$.growlUI("提示", "查询发生错误：" + msg); 
				});
		},
		createTiecketBill:function(param){
			bill.service.save(param,function onSuccess(data){		
				$.growlUI("提示", "申请发票提交成功");				
				$("#create_bill").attr("style","display:none;");
				$("#selTime").attr("style","display:block;");
				bill.describeBillBalance();
			},function onError(msg){
				$.growlUI("提示", "申请发票提交失败：" + msg); 
			});
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
            	
            	if(bill.geshiTest(attachment)){
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
    				            	        		 var ctx = bill.ctx;
    				            	        		 var allCheckedBox = $("#billModelTable tbody input[type='checkbox']:checked");
    				         						 var currentTr=$(allCheckedBox[0]).parents("tr");
    				            	        		 if(type == "taxLicence"){
    				            	        			 //$("#imageShowBl").removeClass("hide");
    				            	        			 //$("#attachmentShowLb").attr("src", ctx +"/indentShow/attachment?filename="+filename+"&username="+bill.currentAccount);
    				            	        			 //$("#attachmentShowLb").attr("attachmentShowLbFileName",filename);
    				            	        			 //如果修改时不上传图片，则选择默认值
    				            	        			 if(!$("#newBillInfoForm #taxLicenceAttachment").val()){
    				            	        				 $("#newBillInfoForm #taxLicenceText").val(currentTr.attr("taxLicence"));
    				            	        				 
    				            	        				 $("#newBillInfoForm #taxLicenceDiv").attr("style","display: 'block';");
 					         								 $("#newBillInfoForm #taxLicenceDiv a").attr('href', bill.ctx +"/indentShow/attachment?filename="+currentTr.attr("taxLicence")+"&username="+bill.currentAccount).text(currentTr.attr("taxLicence"));
    				            	        			 }else{
    				            	        				 $("#newBillInfoForm #taxLicenceText").val(filename);
    				            	        				 $("#newBillInfoForm #taxLicenceDiv").attr("style","display: 'block';");
 					         								 $("#newBillInfoForm #taxLicenceDiv a").attr('href', bill.ctx +"/indentShow/attachment?filename="+filename+"&username="+bill.currentAccount).text(filename);
    				            	        			 }
    				     		            		}else if(type == "taxerLicence"){
    				     		            			if(!$("#newBillInfoForm #taxerLicenceAttachment").val()){
    				     		            				$("#newBillInfoForm #taxerLicenceText").val(currentTr.attr("taxerLicence"));
    				     		            				$("#newBillInfoForm #taxerLicenceDiv").attr("style","display: 'block';");
					         								$("#newBillInfoForm #taxerLicenceDiv a").attr('href', bill.ctx +"/indentShow/attachment?filename="+currentTr.attr("taxerLicence")+"&username="+bill.currentAccount).text(currentTr.attr("taxerLicence"));
    				     		            			}else{
    				     		            				$("#newBillInfoForm #taxerLicenceText").val(filename);
    				     		            				$("#newBillInfoForm #taxerLicenceDiv").attr("style","display: 'block';");
					         								$("#newBillInfoForm #taxerLicenceDiv a").attr('href', bill.ctx +"/indentShow/attachment?filename="+filename+"&username="+bill.currentAccount).text(filename);
    				     		            			}
    				     		            		}else if(type == "businessLicence"){
    				     		            			if(!$("#newBillInfoForm #businessLicenceAttachment").val()){
    				     		            				$("#newBillInfoForm #businessLicenceText").val(currentTr.attr("businessLicence"));
    				     		            				$("#newBillInfoForm #businessLicenceDiv").attr("style","display: 'block';");
					         								$("#newBillInfoForm #businessLicenceDiv a").attr('href', bill.ctx +"/indentShow/attachment?filename="+currentTr.attr("businessLicence")+"&username="+bill.currentAccount).text(currentTr.attr("businessLicence"));
    				     		            			}else{
    				     		            				$("#newBillInfoForm #businessLicenceText").val(filename);
    				     		            				$("#newBillInfoForm #businessLicenceDiv").attr("style","display: 'block';");
					         								$("#newBillInfoForm #businessLicenceDiv a").attr('href', bill.ctx +"/indentShow/attachment?filename="+filename+"&username="+bill.currentAccount).text(filename);
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
    			            	    var ctx = bill.ctx;
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
    			    var ctx = bill.ctx;
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
