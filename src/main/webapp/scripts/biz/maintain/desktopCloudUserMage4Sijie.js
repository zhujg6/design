var ContextMenuCloud = function(options){
	var _options = {
		container : options.container || $("#contextMenudeskCloud"),
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
				var top = e.pageY-200;
				_options.container.hide();
				_options.container.attr(
						"style",
						"display: block; position: absolute; top:"
								+ top+ "px; left:" + e.pageX
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
var desktopCloud = {
	service : com.skyform.service.desktopCloudService,
	data : [],
	tmpArray:[],
	poolInfoArray:null,
	typeParams:null,
	areaInfo:null,
	servicefactroy:null,
	dtTable : null,
	newFormModal : null,
	editFormModal : null,
	scope : "desktopCloud",
	instances : [],
	serviceFactoryInfo:{"huawei":"华为","citrix":"思捷"},
	ContextMenuCloud: null,
	selectedInstanceId:null,
	selectedInstanceVmName:null,
	itaType:null,
	flagPool:false,
	init : function(){
		desktopCloud.flagPool=(-1!=Config.deskCloudPool.indexOf(CommonEnum.currentPool));
//		desktopCloud.getIta();
		desktopCloud.refreshDataQ();
		if(CommonEnum.offLineBill){
			desktopCloud.typeParams={"serviceType":1015,"billType":5};
		    }else{
		    	desktopCloud.typeParams={"serviceType":1015,"billType":0};
		    }
		com.skyform.service.desktopCloudService.queryDesktopConfigInfo(desktopCloud.typeParams,function(data){
			desktopCloud.poolInfoArray=data.resoucepool;
//			console.log(data);
		},function(){});
	},
	//销毁桌面用户
	destroy : function(){
		var canDestorydesktopCloud = true;
		if (canDestorydesktopCloud){
			ConfirmWindow.setTitle(Dict.val("dc_desktop_user_destroy")).setContent("<h4>"+Dict.val("dc_do_you_destory_desktop_user")+"</h4>").onSave = function(){
				var terantid = desktopCloud.selectedInstanceId;
				var vmName = desktopCloud.selectedInstanceVmName;
				//console.log("terantid"+terantid);
				//console.log("vmName"+vmName);
				if(!valiter.isNull(vmName)){
					$.growlUI(Dict.val("dc_unbundling_host_destory_desktop_user"));
					ConfirmWindow.hide();
					desktopCloud.init();
					return;
				}
				    var param = {"UserID": parseInt(terantid)};
					desktopCloud.service.destroy(param,function (data){
						$.growlUI(Dict.val("dc_desktop_user_destory_success"));
						desktopCloud.init();
					},function (error){
						ErrorMgr.showError(error);
						desktopCloud.init();
					});
				ConfirmWindow.hide();
			};
			ConfirmWindow.setWidth(500).autoAlign().setTop(100);
			ConfirmWindow.show();
		}
	},
	
	//查询域
	getIta : function(){
		param={};
		desktopCloud.service.getIta(param,function onSuccess(data){
			desktopCloud.itaType=data;
			if(valiter.isNull(desktopCloud.itaType)){
				$(newdesktopCloud).addClass("disabled");
				$.growlUI(Dict.val("dc_contact_administrator_binding_domain"));
			}else{
				desktopCloud.refreshDataQ();
			}
		},function onError(msg){
			ErrorMgr.showError(msg);
		});
	},
	//原ita方法改造。完成页面刷新功能
	refreshDataQ:function(){
		
		desktopCloud.refreshData();
		desktopCloud._bindAction();
		
		$("#exportFirewall").unbind().click(function(){
			desktopCloud.exportFirewallAdd();
		});
		$("#upload_saveAdd").unbind().click(function(){
			desktopCloud.importFirewall();
		});
		$('#file2upload').val("");
		$("#searchDesktopCloud").unbind().click(function(){
			desktopCloud.refreshData();
		});
		
		if (!CommonEnum.offLineBill){
			$(alldesktopCloud).hide();
			//
			
			}
			
	
	},
	
	//刷新
	refreshData : function(){
		if(desktopCloud.dtTable) desktopCloud.dtTable.container.find("tbody").html("<tr ><td colspan='7' style='text-align:center;'><img src='"+CONTEXT_PATH+"/images/loader.gif'/><strong>"+Dict.val("common_retrieving_data_please_wait")+"</strong></td></tr>");
		var params={
				"serviceFactory":"citrix"
		};
		if($("#queryDesktopCloudStatus").val()=="1"){
		   params.userName=$("#queryDesktopCloudName").val();
		}
		if($("#queryDesktopCloudStatus").val()=="2"){
		   params.tenantName=$("#queryDesktopCloudName").val();
		}
		desktopCloud.service.queryTenantInfo(params,function onSuccess(data){
			desktopCloud.data = data;
//			desktopCloud.instances=desktopCloud.data;
			desktopCloud._refreshDtTable(desktopCloud.data);
			if (!CommonEnum.offLineBill){
				//console.log(desktopCloud.data.state);
				if(desktopCloud.data.length>1){
					$(newdesktopCloud).addClass("disabled");
				}
			}
		},function onError(msg){
			ErrorMgr.showError(msg);
		});
		
	},

	_bindAction : function(){
		$("div[scope='"+desktopCloud.scope+"'] #toolbar .actionBtn").unbind().click(function(){
			if($(this).hasClass("disabled")) return;
			var action = $(this).attr("action");
			desktopCloud._invokeAction(action);
		});
	},
	
	_invokeAction : function(action){
		var invoker = desktopCloud["" + action];
		if(invoker && typeof invoker == 'function') {
			invoker();
		}
	},
	
	_refreshDtTable : function(data) {
		if(desktopCloud.dtTable) {
			desktopCloud.dtTable.updateData(data);
		} else {
			desktopCloud.dtTable = new com.skyform.component.DataTable();
			desktopCloud.dtTable.renderByData("#desktopCloudTable",{
				pageSize : 5,
				data : data,
				onColumnRender : function(columnIndex,columnMetaData,columnData){
					if(columnMetaData.name=='id') {
						return text = '<input type="checkbox" value="'+columnData.tenantId+'">';
					}else if (columnMetaData.name == 'state') {
	        	  		return com.skyform.service.StateService.getState("",columnData.state);
					  } else if (columnMetaData.name == 'UserID') {
						return columnData.UserID;
					  } else if (columnMetaData.name == "createDate") {
						  var text = '';
						  if(columnData.createTime == '' || columnData.createTime == 'undefined'){
						  	return text;
						  }else{
							return new Date(columnData.createTime).format("yyyy-MM-dd hh:mm:ss");
						  }
					  }else if (columnMetaData.name == "UserName") {
					  	return columnData.UserName;
			          }
//					  else if (columnMetaData.name == "serviceFactory") {
//					  	return desktopCloud.serviceFactoryInfo[columnData.serviceFactory];
//					  	
//			          }
			          else if(columnMetaData.name == 'dliName'){
					    	return columnData.dliName;
				          }
					  /*else if(columnMetaData.name == 'vmName'){
				    	return columnData.vmName;
			          }*/else if(columnMetaData.name == 'email'){
				    	return columnData.email;
			          }else if(columnMetaData.name == 'mobile'){
				    	return columnData.mobile;
			          }else if(columnMetaData.name == 'companyName'){
			        	  var comp=columnData.companyName;
			        	  if(typeof(comp)=="undefined"){
			        		  return "";
			        	  }else{
			        		  var temp="";
				        	  if(comp.length>10){
				        		  temp+=comp.substring(0,4)+"..."+columnData.companyName.substring(comp.length-10,4);
				        	  }else{
				        		  temp=comp;
				        	  }
					    	return "<span  " +
					    			"title='"+columnData.companyName+"' data-placement='right'>"+temp+"</span>";
					    	
					    	
			        	  }
			          }
				},
				afterRowRender : function(rowIndex,data,tr){
					tr.attr("instanceId",data.tenantId);
					tr.attr("instanceState",data.state);
					tr.attr("vmName",data.vmName);
					tr.attr("UserID",data.UserID);
					tr.attr("UserName",data.UserName);
					tr.attr("companyName",data.companyName);
					tr.attr("mobile",data.mobile);
					tr.attr("email",data.email);
					tr.attr("ddcId",data.ddcId);
					tr.attr("dliName",data.dliName);
					tr.attr("tenantId",data.tenantId);
					tr.attr("serviceFactory",data.serviceFactory);

					tr.find("input[type='checkbox']").click(function(){
						desktopCloud.onInstanceSelected();
			        });
				},
				afterTableRender : function(){
					var firstRow = $("#desktopCloudTable tbody").find("tr:eq(0)");
					var terantID = firstRow.attr("instanceId");
					desktopCloud.onInstanceSelected();
					 if(!desktopCloud.ContextMenuCloud) {
						 desktopCloud.ContextMenuCloud = new ContextMenuCloud({
					    	container : "#contextMenudeskCloud",
					        beforeShow : function(tr){
					        $("#desktopCloudTable input[type='checkbox']").attr("checked", false);
					          tr.find("input[type='checkbox']").attr("checked",true);
					        },
					        afterShow : function(tr) {
					        	desktopCloud.onInstanceSelected({
                                    id : tr.attr("instanceId"),
                                    state : tr.attr("instanceState")
                                  });
					        },
					        onAction : function(action) {
					        	desktopCloud._invokeAction(action);
					        },
					        trigger : "#desktopCloudTable tr"
					      });
					    } else {
					    	desktopCloud.ContextMenuCloud.reset();
					    }
				}
			});
			desktopCloud.dtTable.addToobarButton($("#toolbar"));
		}
	},
	onInstanceSelected : function(selectInstance){
		var allCheckedBox = $("#desktopCloudTable tbody input[type='checkbox']:checked");
		var rightClicked = selectInstance?true:false;
		var state = $(allCheckedBox[0]).parents("tr").attr("instanceState");
		var terantID = $(allCheckedBox[0]).parents("tr").attr("instanceId");
		var vmName = $(allCheckedBox[0]).parents("tr").attr("vmName");
		//console.log(terantID);
		//console.log(vmName);
		if(terantID) {
			desktopCloud.selectedInstanceId = terantID;
		}
		if(vmName) {
			desktopCloud.selectedInstanceVmName = vmName;
		}
		var oneSelected = allCheckedBox.length == 1;
		var hasSelected = allCheckedBox.length > 0;
		$("div[scope='"+desktopCloud.scope+"'] .operation").addClass("disabled");
		$("div[scope='"+desktopCloud.scope+"'] .operation").each(function(index,operation){
			var condition = $(operation).attr("condition");
			var action = $(operation).attr("action");
			var enabled = true;
			eval("enabled=("+condition+")");
			if(enabled) {
				$(operation).removeClass("disabled");
			} else {
				$(operation).addClass("disabled");
			}
			desktopCloud._bindAction();
		});
		if(rightClicked) {
			desktopCloud.selectedInstanceId = selectInstance.id; 
	    } else {
	      for ( var i = 0; i < allCheckedBox.length; i++) {
	        var currentCheckBox = $(allCheckedBox[i]);
	        if (i == 0) {
	        	desktopCloud.selectedInstanceId = currentCheckBox.attr("value");
	        } else {
	        	desktopCloud.selectedInstanceId += "," + currentCheckBox.attr("value");
	        }
	      }
	    }
	},
	
	//创建桌面用户
	newInstance : function(){
		if(!desktopCloud.newFormModal){
			desktopCloud.newFormModal = new com.skyform.component.Modal("newdesktopCloudForm","<h3>"+Dict.val("dc_create_desktop_user")+"</h3>",$("script#new_desktopCloud_form").html(),{
				buttons : [
				           {name:Dict.val("common_determine"),onClick:function(){
				        	   var account=$("#form_desktopCloud_account").val();
				        	   var name=$("#form_desktopCloud_name").val();	
				        	   var phone=$("#form_desktopCloud_phone").val();	
				        	   var email=$("#form_desktopCloud_email").val();
				        	   var companyName=$("#form_desktopCloud_companyName").val();
				        	   var shortCompany=$("#form_desktopCloud_shortCompany").val();	
				        	   
				        	   if($("#form_desktopCloud_shortCompany").val().length>10){
				        		   $("#shortCompanyMsg").addClass("onError").html("公司名称缩写字符长度大于10");
				        		   return;
				        	   }
				        	   if($("#accountMsg").html().length>0){
				        		   
				        		  
				        	   }
//				        	   var regex1 = /^[@#￥]+$/;
//  							 
//		    					 if(regex1.test($("#form_desktopCloud_account").val())){
//			    						$("#accountMsg").addClass("onError").html("输入了特殊字符");
//			    						 return;
//			    					}
				        	   if (valiter.isNull($.trim(account))) {
				        		   $("#accountMsg").addClass("onError").html(Dict.val("common_desktop_account_not_empty"));
				        		   return;
								}
				        	   if (valiter.isNumber($.trim(account))) {
				        		   $("#accountMsg").addClass("onError").html(Dict.val("common_desktop_account_not_pure_digital"));
				        		   return;
								}
				        	   if ($.inArray($.trim(account),desktopCloud.tmpArray)!=-1) {
				        		   $("#accountMsg").addClass("onError").html(Dict.val("common_desktop_account_existed"));
				        		   return;
								}
				        	   if (valiter.isNull($.trim(name))) {
				        		   $("#nameMsg").addClass("onError").html(Dict.val("common_user_name_not_empty"));
				        		   return;
								}
								
				        	   if (!valiter.mobilephone($.trim(phone))) {
				        		   $("#phoneMsg").addClass("onError").html("*请输入手机号码");
				        		   return;
								}
				        	   if ($("#companyNameMsg").html().length>2) {
				        		   $("#companyNameMsg").addClass("onError").html("*输出的字符大于10位");
				        		   return;
								}
				        	   if (!valiter.checkEmail($.trim(email))) {
				        		   $("#emailMsg").addClass("onError").html(Dict.val("common_enter_correct_email"));
				        		   return;
								}
				        	   if (valiter.isNull($.trim(companyName))) {
				        		   $("#companyNameMsg").addClass("onError").html(Dict.val("common_company_name_not_empty"));
				        		   return;
								}
				        	   if (valiter.isNull($.trim(shortCompany))) {
				        		   $("#shortCompanyMsg").addClass("onError").html(Dict.val("common_company_name_abbreviation_not_empty"));
				        		   return;
								}
				        	   var params = {
				        			   userID:shortCompany+"-"+account,
				        			   userName:name,
				        			   mobile:phone,
				        			   email:email,
				        			   companyName:companyName,
				        			   serviceFactory:$("#areaSelect option:selected").attr("servicefactroy"),
				        			   ddcId:$("#areaSelect option:selected").val().trim()
				        			   //shortCompany:shortCompany
				        	   };
				        	   var datas=[];
				        	   datas.push(params);
				        	   var paramss = {
				        			   users:datas
				        	   };
				        	   //验证ita或ou   调用接口 1:华为，2：思杰getOU
				        	   var paramsArea={
				        			   customerId:""+currentUser.id,
				        			   ddcId:$("#areaSelect option:selected").val()
				        	   };
				        	   if(desktopCloud.areaInfo[$("#areaSelect").val()]=="huawei"){
				        		   desktopCloud.service.getIta(paramsArea,function(result){
				        			   //成功
				        			   //查询到ita可保存数据、未查到数据，不能提交数据。
				        			   
				        			   if(typeof(result)!="undefined"&&result.length==0){
//					    					$(newdesktopCloud).addClass("disabled");
					    					$("#areaMsg").show();
					    					$("button[class='btn btn-primary']").addClass("disabled");
				        					$.growlUI(Dict.val("dc_contact_administrator_binding_domain"));
					    				}else{
					    					$("#areaMsg").hide();
					    					$("button[class='btn btn-primary disabled']").removeClass("disabled");
					    					 desktopCloud.save(paramss);
					    				}
				        			  
				        			   desktopCloud.newFormModal.hide();
				        		   },function(error){
				        			   //失败，
				        			   $.growlUI("查询域错误，请联系管理员");
				        			   desktopCloud.newFormModal.hide();
				        			  
				        		   })
				        	   }else if(desktopCloud.areaInfo[$("#areaSelect").val()]=="citrix"){
//				        		   console.log("citrix");
				        		   desktopCloud.service.getOU(paramsArea,function(result){
				        			   //查询成功
				        			   //查询到ou值 可保存数据到后台，未查到，关闭ui，显示错误
//				        			   if(valiter.isNull(result)){
//				        				   return;
//				        					$(newdesktopCloud).addClass("disabled");
//				        					$.growlUI(Dict.val("dc_contact_administrator_binding_domain"));
//				        				}else{
//				        					 
//								        	   
//				        				}
				        			   
				        			   if(typeof(result)!="undefined"&&result.length==0){
//					    					$(newdesktopCloud).addClass("disabled");
					    					$("#areaMsg").show();
					    					$("button[class='btn btn-primary']").addClass("disabled");
				        					$.growlUI(Dict.val("dc_contact_administrator_binding_domain"));
					    				}else{
					    					$("#areaMsg").hide();
					    					$("button[class='btn btn-primary disabled']").removeClass("disabled");
					    					 desktopCloud.save(paramss);
					    				}
				        			  
//				        			   if(valiter.isNull(result)){
//				        				   return;
//				        					$(newdesktopCloud).addClass("disabled");
//				        					$.growlUI(Dict.val("dc_contact_administrator_binding_domain"));
//				        				}else{
//
//
//				        					$("#areaMsg").hide();
//				        					desktopCloud.save(paramss);
//								        	   
//				        				}
				        			   desktopCloud.newFormModal.hide();
				        		   },function(error){
				        			   return;
				        			   //联系管理员添加域
				        			   $.growlUI("查询域错误，请联系管理员");
				        			   desktopCloud.newFormModal.hide();
				        		   });
				        	   }
				        	 
				           },attrs:[{name:'class',value:'btn btn-primary'}]},
				           
				           {name:Dict.val("common_cancel"),onClick:function(){
							   $("#form_desktopCloud_account").val("");
							   $("#form_desktopCloud_name").val("");
							   $("#form_desktopCloud_phone").val("");
							   $("#form_desktopCloud_email").val("");
							   $("#form_desktopCloud_companyName").val("");
							   $("#form_desktopCloud_shortCompany").val("");

							   $("#accountMsg").html("");
							   $("#nameMsg").html("");
							   $("#phoneMsg").html("");
							   $("#emailMsg").html("");
							   $("#companyNameMsg").html("");
							   $("#shortCompanyMsg").html("");
				        	   desktopCloud.newFormModal.hide();
				           },attrs:[{name:'class',value:'btn'}]}
				           ],
				beforeShow : function(){
					desktopCloud.areaInfo={};
					//调用查询域数据接口
//					console.log(desktopCloud.poolInfoArray);
					$("#areaSelect").empty();
					$.each(desktopCloud.poolInfoArray?desktopCloud.poolInfoArray:[],function(key,value){
						if(value.serviceFactroy!="huawei"){
							desktopCloud.areaInfo[value.name]=value.serviceFactroy;
							var option=$("<option></option>");
							$(option).attr("value",value.name);
							$(option).attr("productId",value.productId);
							$(option).attr("desc",value.desc);
							$(option).attr("serviceFactroy",value.serviceFactroy);
							$(option).html(value.desc);
							$("#areaSelect").append(option);
						}
					});
					
				},
			    afterShow: function(){
			    	desktopCloud.tmpArray.length=0;
			    	$.each(desktopCloud.data, function(i, value) {
			    		desktopCloud.tmpArray.push(value.UserID);
					});
			    		$("#areaSelect").change(function(){
			    			var servicefactroy=	$("#areaSelect option:selected").attr("servicefactroy");
			    			desktopCloud.servicefactroy=servicefactroy;
			    			var paramsArea={
				        			   customerId:""+currentUser.id,
				        			   ddcId:$("#areaSelect option:selected").val()
				        	   };
				    		desktopCloud.service.getIta(paramsArea,function(result){
			        			   //查询成功
			        			   //查询到ou值 可保存数据到后台，未查到，关闭ui，显示错误
				    			if(typeof(result)!="undefined"&&result.length==0){
//			    					$(newdesktopCloud).addClass("disabled");
			    					$("#areaMsg").show();
			    					$("button[class='btn btn-primary']").addClass("disabled");
		        					$.growlUI(Dict.val("dc_contact_administrator_binding_domain"));
			    				}else{
			    					$("button[class='btn btn-primary disabled']").removeClass("disabled");
//			    					console.log($("button[class='btn btn-primary disabled']"));
			    					$("#areaMsg").hide();
			    				}
			        			   
			        		   },function(error){
			        			   return;
			        			   //联系管理员添加域
			        			   $.growlUI("查询域错误，请联系管理员");
			        		   });
			    			
			    			
			    			
//			    			console.log(desktopCloud.areaInfo[$("#areaSelect").val()])
			    		});
			    		 var paramsArea={
			        			   customerId:""+currentUser.id,
			        			   ddcId:$("#areaSelect option:selected").val()
			        	   };
			    		desktopCloud.service.getIta(paramsArea,function(result){
		        			   //查询成功
		        			   //查询到ou值 可保存数据到后台，未查到，关闭ui，显示错误
//			    				console.log);
			    				if(typeof(result)!="undefined"&&result.length==0){
//			    					$(newdesktopCloud).addClass("disabled");
			    					$("#areaMsg").show();
			    					$("button[class='btn btn-primary']").addClass("disabled");
			    					
		        					$.growlUI(Dict.val("dc_contact_administrator_binding_domain"));
			    				}else{
			    					$("button[class='btn btn-primary disabled']").removeClass("disabled");
			    					$("#areaMsg").hide();
			    				}
//		        			   desktopCloud.newFormModal.hide();
		        		   },function(error){
		        			   return;
		        			   //联系管理员添加域
		        			   $("#areaMsg").show();
		        			   $.growlUI("查询域错误，请联系管理员");
		        			   desktopCloud.newFormModal.hide();
		        		   });
			    	   $("#form_desktopCloud_account").focus(
		    				function() {
		    					if ($('#form_desktopCloud_account').val().length < 1) {
		    				    		$("#accountMsg").removeClass("onError").html("");
		    					}
		    				})
		    				
		    				$("#form_desktopCloud_account").keyup(
		    						function(){
		    							if($.inArray($("#form_desktopCloud_account").val(),desktopCloud.tmpArray)!=-1){
				    						$("#accountMsg").removeClass("onError").html(Dict.val("common_desktop_account_existed"));
				    					}else{
				    						$("#accountMsg").removeClass("onError").html("");
				    					}
		    							
		    							 var regex = /^[a-zA-Z]{1}$/;
		    							 
//				    					 if(!regex.test($("#form_desktopCloud_account").val().substr(0,1))){
//					    						$("#accountMsg").addClass("onError").html("请以字母开头填写");
//					    					}
				    					 if(!valiter.isNumber($("#form_desktopCloud_account").val())&&!regex.test($("#form_desktopCloud_account").val().substr(0,1))){
					    						$("#accountMsg").addClass("onError").html("请以字母开头填写");
					    					}
				    					 
				    					 var reg = new RegExp("[\\u4E00-\\u9FFF]+","g");
				    					if(reg.test($("#form_desktopCloud_account").val())){
				    						$("#accountMsg").addClass("onError").html("你不能输入汉字");
				    						} 
				    					 
//				    					 if($("#form_desktopCloud_account").val().indexOf("中国")>=0){
//				    						 $("#accountMsg").removeClass("onError").html("");
//				    					 }
				    					
		    						});
		    				
    				   $("#form_desktopCloud_account").blur(
		    				function() {
		    					
		    					
		    					if (valiter.isNull($('#form_desktopCloud_account').val())) {
		    				    		$("#accountMsg").removeClass("onError").html(Dict.val("common_desktop_account_not_empty"));
		    					}
		    					
		    					
		    					else if($.inArray($("#form_desktopCloud_account").val(),desktopCloud.tmpArray)!=-1){
		    						$("#accountMsg").removeClass("onError").html(Dict.val("common_desktop_account_existed"));
		    					}
//		    					else if(!regex.test($("#form_desktopCloud_account").val())){
//		    						$("#accountMsg").addClass("onError").html("请以字母开头填写");
//		    					}
//		    					else if(valiter.isNumber($("#form_desktopCloud_account").val())){
//		    						$("#accountMsg").addClass("onError").html(Dict.val("common_desktop_account_not_pure_digital"));
//		    					}
		    					
		    					else{
		    						$("#accountMsg").removeClass("onError").html("");
		    					}
		    					 var regex = /^[a-zA-Z]{1}$/;
    							 
		    					 if(valiter.isNumber($("#form_desktopCloud_account").val())&&!regex.test($("#form_desktopCloud_account").val().substr(0,1))){
			    						$("#accountMsg").addClass("onError").html("请以字母开头填写");
			    					}
		    					 
		    					 var reg = new RegExp("[\\u4E00-\\u9FFF]+","g");
			    					if(reg.test($("#form_desktopCloud_account").val())){
			    						$("#accountMsg").addClass("onError").html("你不能输入汉字");
			    						} 
		    					 var str2=$("#form_desktopCloud_account").val();
		    					 if(str2.indexOf("@")>=0||str2.indexOf("#")>=0||str2.indexOf("$")>=0||str2.indexOf("*")>=0||str2.indexOf("&")>=0){
		    						 $("#accountMsg").addClass("onError").html("输入的字符包含特殊字符");
		    					 }
		    				});
//		    				 $("#form_desktopCloud_account").bind("keyup",function(){请不要输入特殊字符
//		    					
//		    				 });
		    		   $("#form_desktopCloud_name").focus(
		    				function() {
		    					if ($('#form_desktopCloud_name').val().length < 1) {
		    				    		$("#nameMsg").removeClass("onError").html("");
		    					}
		    				})
	    			   $("#form_desktopCloud_name").blur(
		    				function() {
		    					if (valiter.isNull($('#form_desktopCloud_name').val())) {
		    				    		$("#nameMsg").removeClass("onError").html(Dict.val("common_user_name_not_empty"));
		    					}
		    				})
		    		   $("#form_desktopCloud_phone").focus(
		    				function() {
		    					if ($('#form_desktopCloud_phone').val().length < 1) {
		    				    		$("#phoneMsg").removeClass("onError").html("");
		    					}
		    				})
    				   $("#form_desktopCloud_phone").blur(
		    				function() {
		    					if (!valiter.mobilephone($('#form_desktopCloud_phone').val())) {
		    				    		$("#phoneMsg").removeClass("onError").html("*请输入手机号码");
		    					}else{
		    						$("#phoneMsg").removeClass("onError").html("");
		    					}
		    				})
		    		   $("#form_desktopCloud_email").focus(
		    				function() {
		    					if ($('#form_desktopCloud_email').val().length < 1) {
		    				    		$("#emailMsg").removeClass("onError").html("");
		    					}
		    				})
    				   $("#form_desktopCloud_email").blur(
		    				function() {
		    					if (!valiter.checkEmail($('#form_desktopCloud_email').val())) {
		    				    		$("#emailMsg").removeClass("onError").html(Dict.val("common_enter_correct_email"));
		    					}else{
		    						$("#emailMsg").removeClass("onError").html("");
		    					}
		    				})
		    		   $("#form_desktopCloud_companyName").focus(
		    				function() {
		    					if ($('#form_desktopCloud_companyName').val().length < 1) {
		    				    		$("#companyNameMsg").removeClass("onError").html("");
		    					}
		    					
		    					
		    				})
	    			   $("#form_desktopCloud_companyName").blur(
	    					   
		    				function() {
		    					if($('#form_desktopCloud_companyName').val().length ==0){
		    						$("#companyNameMsg").addClass("onError").html("*公司名称不能为空");
		    					}
//		    					if (valiter.isNull($('#form_desktopCloud_companyName').val())) {
//		    				    		$("#companyNameMsg").addClass("onError").html(Dict.val("common_company_name_not_empty"));
//		    					}
		    					if ($('#form_desktopCloud_companyName').val().length >20) {
	    				    		$("#companyNameMsg").addClass("onError").html("*名称长度大于20位");
		    					}else if($('#form_desktopCloud_companyName').val().length <20){
		    						$("#companyNameMsg").removeClass("onError").html("");
		    					}
		    					
		    					if($('#form_desktopCloud_companyName').val().length ==0){
		    						$("#companyNameMsg").addClass("onError").html("*公司名称不能为空");
		    					}
		    				})
		    			$("#form_desktopCloud_shortCompany").focus(
		    				function() {
		    					if ($('#form_desktopCloud_shortCompany').val().length < 1) {
		    				    		$("#shortCompanyMsg").removeClass("onError").html("");
		    					}
		    				})
		    				var checkNum = /^[A-Za-z]+$/;
		    			$("#form_desktopCloud_shortCompany").bind("keyup",function(){
		    				if(checkNum.test($(this).val())){
		    					$("#shortCompanyMsg").removeClass("onError").html("");
		    				}else{
		    					$("#shortCompanyMsg").addClass("onError").html("*不能输入数字或汉字字符");
		    				}
		    				if ($('#form_desktopCloud_shortCompany').val().length < 1) {
    				    		$("#shortCompanyMsg").removeClass("onError").html("");
		    				}else if($('#form_desktopCloud_shortCompany').val().length >10){
		    					$("#shortCompanyMsg").addClass("onError").html("*输入字符的长度不能大于10位");
		    				}
		    				
		    			});
	    			   $("#form_desktopCloud_shortCompany").blur(
		    				function() {
		    					if (valiter.isNull($('#form_desktopCloud_shortCompany').val())) {
		    				    		$("#shortCompanyMsg").removeClass("onError").html(Dict.val("common_company_name_abbreviation_not_empty"));
		    					}
		    				})
		    				
		    				
			    		}
				
			});
		} 
		desktopCloud.newFormModal.setWidth(650).autoAlign().setTop(100).show();
	},
	//编辑桌面用户
	editInstance : function(){
		if(!desktopCloud.editFormModal){
			desktopCloud.editFormModal = new com.skyform.component.Modal("editdesktopCloudForm","<h3>"+Dict.val("dc_edit_desktop_user")+"</h3>",$("script#edit_desktopCloud_form").html(),{
				buttons : [
					{name:Dict.val("common_determine"),onClick:function(){
						var account=$("#edit_form_desktopCloud_account").val();
						var name=$("#edit_form_desktopCloud_name").val();
						var phone=$("#edit_form_desktopCloud_phone").val();
						var email=$("#edit_form_desktopCloud_email").val();
						var tenantId=$("#edit_form_desktopCloud_tenantId").val();
						var ddcId=$("#edit_form_desktopCloud_ddcId").val();

						if (valiter.isNull($.trim(name))) {
							$("#edit_nameMsg").addClass("onError").html(Dict.val("common_user_name_not_empty"));
							return;
						}

						if (!valiter.mobilephone($.trim(phone))) {
							$("#edit_phoneMsg").addClass("onError").html("*请输入手机号码");
							return;
						}

						if (!valiter.checkEmail($.trim(email))) {
							$("#edit_emailMsg").addClass("onError").html(Dict.val("common_enter_correct_email"));
							return;
						}

						var params = {
							//userID:account+"",
							userName:name,
							mobile:phone+"",
							tenantId:tenantId+"",
							ddcId:ddcId+"",
							email:email
						};
						//var datas=[];
						//datas.push(params);
						//var paramss = {
						//	users:datas
						//};
						//验证ita或ou   调用接口 1:华为，2：思杰getOU
						var paramsArea={
							customerId:""+currentUser.id
						};
						desktopCloud.update(params);
						desktopCloud.editFormModal.hide();
						//console.log(paramss)
					},attrs:[{name:'class',value:'btn btn-primary'}]},

					{name:Dict.val("common_cancel"),onClick:function(){
						$("#edit_form_desktopCloud_account").val("");
						$("#edit_form_desktopCloud_name").val("");
						$("#edit_form_desktopCloud_phone").val("");
						$("#edit_form_desktopCloud_email").val("");
						$("#edit_form_desktopCloud_companyName").val("");
						$("#edit_form_desktopCloud_tanenId").val("");

						$("#edit_nameMsg").html("");
						$("#edit_phoneMsg").html("");
						$("#edit_emailMsg").html("");

						desktopCloud.editFormModal.hide();
					},attrs:[{name:'class',value:'btn'}]}
				],
				beforeShow : function(){
					desktopCloud.areaInfo={};
					//调用查询域数据接口
					var tdArr = $("#desktopCloudTable tbody input[type='checkbox']:checked").parents("tr");
					//console.log("tdArr",tdArr,tdArr.attr("instanceState"));

					$("#edit_areaSelect").empty();
					/*$.each(desktopCloud.poolInfoArray?desktopCloud.poolInfoArray:[],function(key,value){
						//console.log(tdArr.attr("serviceFactroy") ,tdArr,value.serviceFactroy);
						if(tdArr.attr("serviceFactory") == value.serviceFactroy){
							desktopCloud.areaInfo[value.name]=value.serviceFactroy;
							var option=$("<option></option>");
							$(option).attr("value",value.name);
							$(option).attr("productId",value.productId);
							$(option).attr("desc",value.desc);
							$(option).attr("serviceFactroy",value.serviceFactroy);
							$(option).html(value.desc);
							$("#edit_areaSelect").append(option);
						}

					});*/
					var option=$("<option></option>");
					$(option).attr("value",$(tdArr).attr("ddcId"));
					$(option).html($(tdArr).attr("dliName"));
					$("#edit_areaSelect").append(option);
					
					$("#edit_form_desktopCloud_account").val(tdArr.attr("UserID"));
					$("#edit_form_desktopCloud_name").val(tdArr.attr("UserName"));
					$("#edit_form_desktopCloud_phone").val(tdArr.attr("mobile"));
					$("#edit_form_desktopCloud_email").val(tdArr.attr("email"));
					$("#edit_form_desktopCloud_companyName").val(tdArr.attr("companyName"));
					$("#edit_form_desktopCloud_shortCompany").val(tdArr.attr("instanceState"));
					$("#edit_form_desktopCloud_tenantId").val(tdArr.attr("tenantId"));
					$("#edit_form_desktopCloud_ddcId").val(tdArr.attr("ddcId"));
				},
				afterShow: function(){
					desktopCloud.tmpArray.length=0;
					$.each(desktopCloud.data, function(i, value) {
						desktopCloud.tmpArray.push(value.UserID);
					});


//		    				 $("#form_desktopCloud_account").bind("keyup",function(){请不要输入特殊字符
//
//		    				 });
					$("#edit_form_desktopCloud_name").focus(
						function() {
							if ($('#edit_form_desktopCloud_name').val().length < 1) {
								$("#edit_nameMsg").removeClass("onError").html("");
							}
						})
					$("#edit_form_desktopCloud_name").blur(
						function() {
							if (valiter.isNull($('#edit_form_desktopCloud_name').val())) {
								$("#edit_nameMsg").removeClass("onError").html(Dict.val("common_user_name_not_empty"));
							}
						})
					$("#edit_form_desktopCloud_phone").focus(
						function() {
							if ($('#edit_form_desktopCloud_phone').val().length < 1) {
								$("#edit_phoneMsg").removeClass("onError").html("");
							}
						})
					$("#edit_form_desktopCloud_phone").blur(
						function() {
							if (!valiter.mobilephone($('#edit_form_desktopCloud_phone').val())) {
								$("#edit_phoneMsg").removeClass("onError").html("*请输入手机号码");
							}else{
								$("#edit_phoneMsg").removeClass("onError").html("");
							}
						})
					$("#edit_form_desktopCloud_email").focus(
						function() {
							if ($('#edit_form_desktopCloud_email').val().length < 1) {
								$("#edit_emailMsg").removeClass("onError").html("");
							}
						})
					$("#edit_form_desktopCloud_email").blur(
						function() {
							if (!valiter.checkEmail($('#edit_form_desktopCloud_email').val())) {
								$("#edit_emailMsg").removeClass("onError").html(Dict.val("common_enter_correct_email"));
							}else{
								$("#edit_emailMsg").removeClass("onError").html("");
							}
						})
				}

			});
		}
		desktopCloud.editFormModal.setWidth(650).autoAlign().setTop(100).show();
	},
	save : function(params){
		desktopCloud.service.save(params,function (data){
			$.growlUI(Dict.val("dc_desktop_user_create_success"));
		
			desktopCloud.init();
		},function (error){
			$.growlUI(Dict.val("dc_desktop_user_create_failed")+error);
			desktopCloud.init();
		});
		 
  	   $("#form_desktopCloud_account").val("");
  	   $("#form_desktopCloud_name").val("");
  	   $("#form_desktopCloud_phone").val("");
  	   $("#form_desktopCloud_email").val("");
  	   $("#form_desktopCloud_companyName").val("");
  	   $("#form_desktopCloud_shortCompany").val("");
	},
	update : function(params){
		desktopCloud.service.update(params,function (data){
			$.growlUI(Dict.val("dc_desktop_user_update_success"));

			desktopCloud.init();
		},function (error){
			$.growlUI(Dict.val("dc_desktop_user_update_failed")+error);
			desktopCloud.init();
		});

		$("#edit_form_desktopCloud_account").val("");
		$("#edit_form_desktopCloud_name").val("");
		$("#edit_form_desktopCloud_phone").val("");
		$("#edit_form_desktopCloud_email").val("");
		$("#edit_form_desktopCloud_companyName").val("");
		$("#edit_form_desktopCloud_tanenId").val("");

		$("#edit_nameMsg").html("");
		$("#edit_phoneMsg").html("");
		$("#edit_emailMsg").html("");


	},
	allImprot : function(){
		$("#desktopCloudImprotModal").off("show").on("show",function(){
		});
		$("#desktopCloudImprotModal").modal("show");
	},
	exportFirewallAdd : function(){
		var data = JSON.stringify(desktopCloud.instances);	 
		$("#exportFormAdd #paramAdd").val(data);
		$("#exportFormAdd #paramType").val("desktopCloud4citrix");
        window.open("","newWinAdd");
        $("#exportFormAdd").submit();
	},
	importFirewall : function(){
		var _filename = $('#file2upload').val();				
		if(!_filename){
			$("#tipFile2upload").text(Dict.val("common_please_select_file"));
			return;
		}else{
			$("#tipFile2upload").text("");
		}
		var _extend = _filename.substring(_filename.lastIndexOf(".")+1);
		var re = /^(xls)$/;
		var isValid = (_extend && re.test(_extend));
		if (!isValid) {
			$("#tipFile2upload").text(Dict.val("common_please_up_xls_file"));
			return;
		}else{
			$("#tipFile2upload").text("");
		}
		var options = { 
	            data: {},
	            type : "POST",
	            dataType:  'json',
	            timeout  : 1800000,
	            success: function(rs) {
	            	$("#desktopCloudImprotModal").modal("hide");
					if(null!=rs&&rs.code == 0){
						$.growlUI(Dict.val("common_tip"),Dict.val("common_import_executed")+rs.msg); 
					}else if(null!=rs&&rs.msg!== null){
						$.growlUI(Dict.val("common_tip"),Dict.val("common_import_executed")+rs.msg); 
					}
					else $.growlUI(Dict.val("common_tip"),Dict.val("common_import_failed_file_format_error")); 
					desktopCloud.init();
	    	    },			            	
	            error : function() {
	            	$.growlUI(Dict.val("common_tip"), Dict.val("common_import_failed")); 
	            	desktopCloud.init();
	    		}
	    }; 
	    
		$("#uploadObjectForm").ajaxSubmit(options);
	}
};
