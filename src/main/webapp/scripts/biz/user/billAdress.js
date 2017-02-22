//window.currentInstanceType='bill';
window.currentInstanceType='address';
$(function(){
	
	
	address.init();
	
});
//var billTr = "";
var address = {
		/*
		 provinceJson:{
				'beijing':'北京市',
				'tianjin':'天津市',
				'heibei':'河北省'
			},
			cityJson:{
					
					'beijing':[
						{'name':'东城区', 'value':'dongchengqu'},
						{'name':'西城区', 'value':'xichengqu'},
						{'name':'朝阳区', 'value':'chaoyangqu'},
						{'name':'丰台区', 'value':'fengtaiqu'},
						{'name':'石景山区', 'value':'shijingshanqu'},
						{'name':'海淀区', 'value':'haidianqu'},
					],
					'tianjin':[
						{'name':'和平区', 'value':'hepingqu'},
						{'name':'河东区', 'value':'hedongqu'},
						{'name':'河西区', 'value':'hexiqu'},
						{'name':'南开区', 'value':'nankaiqu'},
						{'name':'河北区', 'value':'hebeiqu'},
						{'name':'红桥区', 'value':'hongqiaoqu'}	
					],
					'heibei':[
						{'name':'石家庄市', 'value':'shijiazhuang'},
						{'name':'承德市', 'value':'chengde'},
						{'name':'张家口市', 'value':'zhangjiakou'},
						{'name':'廊坊市', 'value':'langfang'},
						{'name':'衡水市', 'value':'hengshui'},
						{'name':'邢台市', 'value':'xingtai'}	
					]	
					
					
				},
			*/	
		datatable : null,
		service : com.skyform.service.billAddressService,
		
		
		init : function() {
			var billAddr = {
					"data":[]
				  
				};
			//var provinceJson=address.provinceJson;
			//var cityJson=address.cityJson;
			/*var cityJson={
					
					'beijing':[
						{'name':'东城区', 'value':'dongchengqu'},
						{'name':'西城区', 'value':'xichengqu'},
						{'name':'朝阳区', 'value':'chaoyangqu'},
						{'name':'丰台区', 'value':'fengtaiqu'},
						{'name':'石景山区', 'value':'shijingshanqu'},
						{'name':'海淀区', 'value':'haidianqu'},
					],
					'tianjin':[
						{'name':'和平区', 'value':'hepingqu'},
						{'name':'河东区', 'value':'hedongqu'},
						{'name':'河西区', 'value':'hexiqu'},
						{'name':'南开区', 'value':'nankaiqu'},
						{'name':'河北区', 'value':'hebeiqu'},
						{'name':'红桥区', 'value':'hongqiaoqu'}	
					],
					'heibei':[
						{'name':'石家庄市', 'value':'shijiazhuang'},
						{'name':'承德市', 'value':'chengde'},
						{'name':'张家口市', 'value':'zhangjiakou'},
						{'name':'廊坊市', 'value':'langfang'},
						{'name':'衡水市', 'value':'hengshui'},
						{'name':'邢台市', 'value':'xingtai'}	
					]	
					
					
				};
				*/
				//新建页初始化下拉列表
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
				//alert($("#createProvince").eq(0).text());
			address.quaryDataTable();
			
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
			//alert($('#sel2').options);
			$('#modCity').append(oNew);
		}
		}
		
						
	});	
		
			
		
			$("#btn_cre").bind('click',function(e){
				
				$('#createModal').modal('show');
				
								
			});	
			//校验
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
				//alert($(this).val());
				//alert(valiter.checkYWEmail(11));
				if(!valiter.mobilephone($(this).val())){
				$(this).next().show();
				}else{
					$(this).next().hide();
				}
			});
			$("#npostcard").bind('blur',function(e){
				//alert(valiter.isPostalCode());
				if(!valiter.isPostalCode($(this).val())){
				
				$(this).next().show();
				}else{
					$(this).next().hide();
				}
			});
			
			$("#modName").bind('blur',function(e){
				if(!valiter.isName($(this).val())){
				$(this).next().show();
				}
				else{
					$(this).next().hide();
				}
				
			});
			
			$("#modAddress").bind('blur',function(e){
				if(!valiter.isAddress($(this).val()))
					{
					$(this).next().show();
					}else{
						$(this).next().hide();
					}
				
			});
			
			$("#modPhone").bind('blur',function(e){
				//alert($(this).val());
				//alert(valiter.checkYWEmail(11));
				if(!valiter.mobilephone($(this).val())){
				$(this).next().show();
				}else{
					$(this).next().hide();
				}
			});
			$("#modPostcard").bind('blur',function(e){
				//alert(valiter.isPostalCode());
				if(!valiter.isPostalCode($(this).val())){
				
				$(this).next().show();
				}else{
					$(this).next().hide();
				}
			});
			
			//点击修改
			$("#btn_mod").bind('click',function(e){
				var row = $("#stable tbody input[type='radio']:checked").parents("tr");
				if(row.length==0){
					$.growlUI("提示", "您还未创建地址!");
					return;
				}
				//var row = $("#stable tbody input[type='radio']:checked").parents("tr");
				
				
				//var num=row.eq(0).attr('dataprovince');
				$("#modName").attr('value',row.eq(0).attr('dataname'));
				$("#modPhone").attr('value',row.eq(0).attr('dataphone'));
				$("#modAddress").attr('value',row.eq(0).attr('dataaddress'));
				$("#modPostcard").attr('value',row.eq(0).attr('datapostcode'));
				//$("#sel1  option:selected").text('aaaaa');
				//var bpro=radioModelTable.eq(0).attr('datacity');
				//alert(bpro);
				$("#modProvince").find("option[value="+row.eq(0).attr("dataprovince")+"]").attr("selected",true);
				/*$("#modProvince option").each(function() { 
						
				    if($(this).text() == row.eq(0).attr('dataprovince')) { 

				        $(this).attr("selected",true); 

				    } 

				});
				*/
				$("#modProvince").change();
				$("#modCity").find("option[value="+row.eq(0).attr("datacity")+"]").attr("selected",true);
				/*$("#modCity option").each(function() { 
					//alert($(this).text());
				    if($(this).text() == row.eq(0).attr('datacity')) { 
				    	
				        $(this).attr("selected",true); 

				    } 
				    //alert('zzzz');
				});*/
				
				//$("#modCity").html("<option>"+row.eq(0).attr('datacity')+"</option>");
				    //alert('zzzz');
				
				
				
				//$("#modProvince option[text=北京市]").attr('selected','true');
				//$("#modCity").find("option[value=radioModelTable.eq(0).attr('datacity')]").attr("selected",true);
				//$("#modCity option:selected").text(radioModelTable.eq(0).attr('datacity'));
				$('#modifyModal').modal('show');
				
								
			});	
			//更改提交
			$("#btnEidtAddress").bind('click',function(){
				var radioModelTable = $("#stable tbody input[type='radio']:checked").parents("tr");
				if(($("#modProvince option:selected").text()=="请选择")){
					$("#modProvince").next().show();
				}
				$("#modName").blur();
				$("#modPhone").blur();
				$("#modAddress").blur();
				$("modPostcard").blur();
				/*if(!($("#modProvince option:selected").text()!="请选择")){
				alert($("#modProvince option:selected").text());
				
				}*/
				//alert($("#modProvince option:selected").val()!="请选择");
				//alert(valiter.isName($("#modName").val()));
				//alert(valiter.mobilephone($("#modPhone").val()));
				//alert(($("#modProvince option:selected").val()!="请选择")&&valiter.isName($("#modName").val())&&valiter.mobilephone($("#modPhone").val())&&
						//valiter.isPostalCode($("#modPostcard").val())&&valiter.isAddress($("#modAddress").val()));
				//alert(valiter.isAddress($("#modAddress").val()));
				if(!( ($("#modProvince option:selected").val()!="请选择")&&valiter.isName($("#modName").val())&&valiter.mobilephone($("#modPhone").val())&&
				valiter.isPostalCode($("#modPostcard").val())&&valiter.isAddress($("#modAddress").val()))){
					
					return;
				}else{
				
				if(($("#modProvince option:selected").text()!="请选择")){
					$("#modCity").next().hide();
				}
				var params ={};
				
				params.postId=radioModelTable.eq(0).attr('datapostid'),
				params.receiver=$.trim($("#modName").val()),
				params.telephone=$.trim($("#modPhone").val()),
			    //"postAddress":"亚信科技大楼new",
				params.postCode=$.trim($("#modPostcard").val());
				params.postAddress=$("#modAddress").val();
				params.areaNo=$("#modProvince").val();
				params.cityNo=$("#modCity").val();
				//console.log(params);
				address.service.modifyAddress(params,function onSuccess(data){
					//var cJson=eval('('+data+')');
					 //if(cJson.code == 0){
					
					$.growlUI("提示", "地址修改成功！");	
							//alert('修改成功');
				        	address.quaryDataTable();
				        	$("#modifyModal").modal('hide');
					
				       // }else{
				        	//$.growlUI("提示", cJson.msg);
				        //}
				},function onError(msg){
					//alert(msg);
					$.growlUI("提示", msg);
				});
				/*
				$.ajax(
						{ url: "billAdress.jsp", 
						data: {
						    "postId":radioModelTable.eq(0).attr('dataname'),
						    "receiver":$.trim($("#modName").val()),
						    "telephone":$.trim($("#modPhone").val()),
						    //"postAddress":"亚信科技大楼new",
						    "postCode":$.trim($("#modPostcard").val())
						},

						success: function(data){
					    var data = {"code":"0","msg":"创建发票邮寄信息成功!"};
					        if(data.code == 0){
			
					        	address.quaryDataTable();
						       
						$.growlUI("提示", data.msg);
						
					        }
					        }
						}
						);*/
				
				}
			})
			
			$("#btn_del").bind('click',function(e){
				var row = $("#stable tbody input[type='radio']:checked").parents("tr");
				if(row.length==0){
					$.growlUI("提示", "您还未创建地址!");
					return;
				}
					$('#deleteModal').modal('show');
					
									
				});	
			$("#btn_ref").unbind().click(function() {
				address.quaryDataTable();
				
			});
			$("#btnDelAddress").bind('click',function(){
				var row = $("#stable tbody input[type='radio']:checked").parents("tr");
				if(row.length==0){
					$.growlUI("提示", "您还未创建地址!");
					return;
				}
				var params ={};
				
				params.postId=row.eq(0).attr('datapostid'),
				
				//console.log(params);
				
				address.service.deleteAddress(params,function onSuccess(data){
					//var cJson=eval('('+data+')');
					 //if(cJson.code == 0){
					
					
							//alert('修改成功');
					$.growlUI("提示", "地址删除成功！");	
				        	address.quaryDataTable();
				        	$("#deleteModal").modal('hide');
					
				       // }else{
				        	//$.growlUI("提示", cJson.msg);
				        //}
				},function onError(msg){
					//alert(msg);
					$.growlUI("提示", msg);
				});
				
				/*$.ajax(
						{ url: "billAdress.jsp", 
						data: {
						    "postId":radioModelTable.eq(0).attr('datapostid')
						}
, 
						success: function(data){
					    var data = {"code":"0","msg":"创建发票邮寄信息成功!"};
					        if(data.code == 0){
			
					        	address.quaryDataTable();
						       
						$.growlUI("提示", data.msg);
						
					        }
					        }
						}
						);
				$("#deleteModal").modal('hide');
			*/
			});
		
			$("#createAddress").bind('click',function(){
				
				if(($("#createProvince option:selected").text()=="请选择")){
					
					$("#createProvince").next().show();
					
				}
				
				$("#nname").blur();
				$("#nphone").blur();
				$("#naddress").blur();
				$("#npostcard").blur();
				
				/*if(!($("#modProvince option:selected").text()!="请选择")){
				alert($("#modProvince option:selected").text());
				
				}*/
				//alert($("#modProvince option:selected").val()!="请选择");
				//alert(valiter.isName($("#modName").val()));
				//alert(valiter.mobilephone($("#modPhone").val()));
				//alert(($("#modProvince option:selected").val()!="请选择")&&valiter.isName($("#modName").val())&&valiter.mobilephone($("#modPhone").val())&&
						//valiter.isPostalCode($("#modPostcard").val())&&valiter.isAddress($("#modAddress").val()));
				//alert(valiter.isAddress($("#modAddress").val()));
				if(!( ($("#createProvince option:selected").val()!="请选择")&&valiter.isName($("#nname").val())&&valiter.mobilephone($("#nphone").val())&&
				valiter.isPostalCode($("#npostcard").val())&&valiter.isAddress($("#naddress").val()))){
				
					return;
				}else{
					
				if(($("#createProvince option:selected").text()!="请选择")){
					$("#createCity").next().hide();
					//alert('c');
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

				//console.log(params);
				address.service.createAddress(params,function onSuccess(data){
					//var cJson=eval('('+data+')');
					 //if(cJson.code == 0){
							//alert('a');
				        	address.quaryDataTable();
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
					//alert(msg);
					$.growlUI("提示", msg);
				});
				//var remotUrl = "/account/createInvoicePostInfo";
				/*$.ajax(
						{ url: "/portal/account/createInvoicePostInfo", 
						data: params, 
						success: function(data){
							console.log(data);
							var cJson=eval(data);
					  //  var data = {"code":"0","msg":"创建发票邮寄信息成功!"};
					        if(cJson.code == 0){
			
					        	address.quaryDataTable();
						       
						
						
					        }else{
					        	$.growlUI("提示", data.msg);
					        }
					        }
						}
						);
			
				if($("#btn_default").attr("checked")){
					console.log('a');
					$("#nname").val('');
				}
				
				
				$('#createModal').modal('hide');
				$("#nname").val('');
				$("#npostcard").val('');
				$("#nphone").val('');
				$("#naddress").val('');
			}*/
			};
			}
			);
		},
		
			
			
		
		LoadBillAddrDataTable :function(dataAddr) {
			//var bflag=true;
			//alert(dataAddr[0]["areaNo"]);
			//alert(JSON.stringify(dataAddr));
			//var provinceJson=address.provinceJson;
			//var cityJson=address.cityJson;
			//var citydata='';
			/*for(var i=0;i<cityJson[dataAddr[0]["areaNo"]].length;i++){
			//alert(JSON.stringify(cityJson[dataAddr[0]["areaNo"]][i]));
			if(cityJson[dataAddr[0]["areaNo"]][i].value==dataAddr[0]["cityNo"]){
				citydata=cityJson[dataAddr[0]["areaNo"]][i].name;
				return;
			}
			}*/
			//alert(provinceJson[dataAddr[0]["areaNo"]]);
			if(address.datatable){
				
				address.datatable.updateData(dataAddr);
			}else{
				
				address.datatable = new com.skyform.component.DataTable(),
			address.datatable.renderByData("#stable", {
					"data" : dataAddr,
					"iDisplayLength": 5,				
					"columnDefs" : [
					     {title : "", name : "postId"},
					     {title : "收件人姓名", name : "receiver"},
					     {title : "电话号码", name : "telephone"},
					     {title : "地址", name : "postAddress"},
					     {title : "邮编", name : "postCode"}
					],
					"onColumnRender" : function(columnIndex, columnMetaData, columnData) {
						//columnData.areaNo = 'hebei'
						var text = columnData[''+columnMetaData.name] || "";
						//alert(columnIndex);
						//console.log(columnData);
						//alert(JSON.stringify(columnMetaData.name));
						if (columnMetaData.name == "postId") {
							//if(columnIndex==0&&bflag){
								//alert('a');
								//text = '<input type="radio" checked name="billAddr" value="'+text+'">';
								//bflag=false;
							//}else{
								//alert('b');
								text = '<input type="radio"  name="billAddr" value="'+text+'">'
							//}
						 }
						 if (columnMetaData.name == "receiver") {
							 
								text = text;
						 }
						 if (columnMetaData.name == "telephone") {
								text = text;
						 }
						 if (columnMetaData.name == "postAddress") {
							 for(var i=0;i<cityJson[columnData["areaNo"]].length;i++){
									//alert(JSON.stringify(cityJson[dataAddr[0]["areaNo"]][i]));
									if(cityJson[columnData["areaNo"]][i].value==columnData["cityNo"]){
										var textCity =cityJson[columnData["areaNo"]][i].name;
										//alert(text);
										//return;
									}
							 }
							 //alert('a');
							 text =provinceJson[columnData["areaNo"]]+textCity+text;
								//text = provinceJson[columnData["areaNo"]]+columnData["cityNo"]+text;
								
						 }
						 if (columnMetaData.name == "postCode") {
							 	text = text;
						 }
						 return text;
					}, 
					"afterRowRender" : function(rowIndex, data, tr){
						
							
						
						tr.attr("datapostid", data.postId).
						attr("dataname", data.receiver).
						attr("dataphone", data.telephone).
						attr("dataaddress", data.postAddress).
						attr("datapostcode", data.postCode).
						attr("dataprovince",data.areaNo).
						attr("datacity",data.cityNo);
					},
					"afterTableRender":function(){
						if($("#stable tbody input[type='radio']")){
						$("#stable tbody input[type='radio']").eq(0).attr('checked','true');
						}
					}
				}
			);
			}
		},
		//查询table
		quaryDataTable:function(){  
			
			
			address.service.quaryAddress(function onSuccess(data){
				 /*var data=[
					        {
					            "postId":73536701,
					            "postCode":"100088",
					            "receiver":"林一鸣",
					            "postAddress":"二龙路中国联通研究院",
					            "isUsed":1,
					            "telephone":"18600011235",
					            "accountId":400014,
					            "areaNo":"北京市",
					            "cityNo":"昌平区"
					        },
					        
					        {
					            "postId":73536702,
					            "postCode":"050001",
					            "receiver":"小林",
					            "postAddress":"平西王府西",
					            "isUsed":1,
					            "telephone":"18888888888",
					            "accountId":400014,
					            "areaNo":"河北省",
					            "cityNo":"邢台市"
					        },
					       

					    ];
					    */
				address.LoadBillAddrDataTable(data);
				//console.log(data);
				//var qJson=eval('('+data+')');
				// if(qJson.code == 0){
						//alert('查询成功');
						
			        	/*address.quaryDataTable();
			        	$('#createModal').modal('hide');
						$("#nname").val('');
						$("#npostcard").val('');
						$("#nphone").val('');
						$("#naddress").val('');
				
				*/
			        //}else{
				
			        	//$.growlUI("提示",msg);
			        //}
			},function onError(msg){
				
				//alert(msg+'查询失败');
				$.growlUI("提示", msg);
			});
			
	    		/*{$.ajax(
	    		   { 
	    			 url: "billAdress.jsp",
	    			 success: function(data){
			         var data = {
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
			        },
			        
			        {
			            "postId":73536702,
			            "postCode":"050001",
			            "receiver":"小林",
			            "postAddress":"平西王府西",
			            "isUsed":1,
			            "telephone":"18888888888",
			            "accountId":400014
			        },
			       

			    ],
			    "code":0
			};
	
	if(data.code == 0){
		
		address.LoadBillAddrDataTable(data.data);
}
}
	    		   }
	    		   );
	    		}*/
	    },
		
		
		createBill:function(){
			
		}
};
