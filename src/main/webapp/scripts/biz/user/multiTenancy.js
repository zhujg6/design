window.currentInstanceType='multiTenacy';

$(function(){
	multiTenacy.init();
	Dcp.biz.getCurrentUser(function(data){
		admin = data;
		//console.log(admin);
	})
});
var admin = null;
var product = {};
var ctx = "/portal";
var multiTenacy = {
		datatable : new com.skyform.component.DataTable(),
		instances : [],
		service : com.skyform.service.multiTenacyService,
		addOrMod : "",
		curUsername : "",
		curEmail : "",
		curMobile : "",
		confirmModal : null,
		pools:null,
		init : function() {
			ctx = $("#ctx").val();
			multiTenacy.pools = Config.pools;
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
					multiTenacy.onOptionSelected($(this).index());					
				}
			});
//			$("body").bind('mousedown',function(){
//				if(!inMenu){
//					$("#contextMenu").hide();
//				}
//			});
			
			// 新建虚拟硬盘
			$("#regSubmit").bind('click',function(e){
				if(multiTenacy.addOrMod == 'add'){
					multiTenacy.createUser();
				}else if(multiTenacy.addOrMod == 'mod'){
					multiTenacy.modifyUser();
				}
			});
			// 查询多桌面用户
			multiTenacy.describeAdminUser();			
			multiTenacy.bindEvent();	
			//新增数据校验
			$("#create_bill :input").blur(function(){
				//验证用户名
				if($(this).is('#username_tenancy')){
					if(multiTenacy.addOrMod=='mod' && multiTenacy.curUsername==$.trim(this.value)){
						
					}else{
						if(!valiter.isUserName($.trim(this.value))){
							$("#nameMsg").addClass("onError").html("6-30个英文字符与非特殊字符");
						}else{
							Register.checkAccount(function(ret){
								if(!ret){
									$("#nameMsg").addClass("onError").html("该用户名已经存在");
								}else{
									$("#nameMsg").removeClass("onError").html("");
								}
							});
						}						
					}
				}
				//密码
				if($(this).is('#password')){
					if(multiTenacy.addOrMod=='add'){
						if($.trim(this.value).length < 1){
							$("#pwdMsg").addClass("onError").html(Dict.val("tenant_password_not_empty"));
						}
						if(valiter.isNull($.trim(this.value)) || $.trim(this.value).length<8 || $.trim(this.value).length>32){
							$("#pwdMsg").addClass("onError").html(Dict.val("tenant_8_to_32_password"));
						}else if ((!valiter.isNull($("#rePassword").val()))
								&& this.value != $("#rePassword").val()) {
							var errorMsg = Dict.val("user_confirm_password_and_password_inconsistent");
							$("#rePwdMsg").addClass("onError").html(errorMsg);
							$("#rePwdMsg").val("");
						}
						else {
							$("#pwdMsg").removeClass("onError").empty();
						}						
					}
				}
				
				//确认密码
				if ($(this).is('#rePassword')) {		
					if(multiTenacy.addOrMod=='add'){
						if (valiter.isNull(this.value) || this.value.length < 8||$.trim(this.value).length>32) {
							var errorMsg = Dict.val("tenant_8_to_32_password");
							$("#rePwdMsg").addClass("onError").html(errorMsg);
						} else if ((!valiter.isNull(this.value))
								&& this.value != $("#password").val()) {
							var errorMsg = Dict.val("user_confirm_password_and_password_inconsistent");
							$("#rePwdMsg").addClass("onError").html(errorMsg);
						}
						else {
							$("#rePwdMsg").removeClass("onError").empty();
						}						
					}
				}
				//邮箱
				if ($(this).is('#email')) {
					//if($("input:radio:checked").val()==1){
					if(multiTenacy.addOrMod=='mod' && multiTenacy.curEmail==$.trim(this.value)){
						
					}else{
						var errorMsg = Dict.val("user_format_email");
						if (valiter.isNull($.trim(this.value))
								|| !valiter.checkYWEmail($.trim(this.value))) {		
							$("#emailMsg").addClass("onError").html(errorMsg);
						}
						else Register.checkEmail(function(ret){
							if(!ret){
								$("#emailMsg").addClass("onError").html(Dict.val("tenant_mailbox_already_registered"));
							}
							else $("#emailMsg").removeClass("onError").html("");
						});								
					}
					//}					
				}
				//手机号
				if($(this).is('#mobile')){
//					$('#sendMessage').removeAttr("disabled"); 
//					$('#sendMessage').attr('disabled',"false");
					if(multiTenacy.addOrMod=='mod' && multiTenacy.curMobile==$.trim(this.value)){
						
					}else{
						var errorMsg = Dict.val("tenant_enter_mobile_phone_number");
						var errorMsgT = Dict.val("tenant_phone_number_registered");
						if(!valiter.isNull($.trim(this.value))){
							if (valiter.cellphone($.trim(this.value))) {
								$("#mobileMsg").addClass("onError").html(errorMsg);
							}
							else {
								Register.checkMobile(function(ret){
									if(!ret){
//										$('#sendMessage').attr('disabled',"disabled");
										$("#mobileMsg").removeClass("onError").html("");
										$("#mobileMsg").addClass("onError").html(errorMsgT);
										
									}
									else {
										$("#mobileMsg").removeClass("onError").html("");
									}
								});
								}
						}else{
							$("#mobileMsg").addClass("onError").html(errorMsg);
//							var buttonElement = document.getElementById("sendMessage");
//							buttonElement.setAttribute("disabled", "false");
						}
						
					}
				}
				
				if($("input:radio:checked").val()==1){	
					$("div #company").find("span").removeClass("onError").html("");				
				}
				else{
					//验证公司名称
					if($(this).is('#compCnName')){
						var errorMsg = Dict.val("special_characters_or_less");
						var errorMsgT = Dict.val("tenant_company_name_already_registered");
						if(!valiter.isNull($.trim(this.value))){
						var scoreReg = /^[\u4E00-\u9FA0A-Za-z\-0-9\_.]+$/;
							if ($.trim(this.value).length>100 || !scoreReg.exec($.trim(this.value))) {
								$("#cnMsg").attr("style","font-family:FontAwesome");
								$("#cnMsg").addClass("onError").html(errorMsg);
								
							}else{
								$("#cnMsg").removeClass("onError").html("");
							}
							
//							else {
//								comRegister.checkCompyName(function(ret){
//									if(!ret){
//										$("#cnMsg").removeClass("onError").html("");
//										$("#cnMsg").addClass("onError").html(errorMsgT);
//									}
//									else $("#cnMsg").removeClass("onError").html("");					
//								});
//								}
						}else{
							$("#cnMsg").removeClass("onError").html("");
						}
					}
					//验证企业编码
					if($(this).is('#compOrgCode')){
						var errorMsg = Dict.val("special_characters_or_less");
						var errorMsgT = Dict.val("tenant_company_code_registered");
						var scoreReg = /^[\u4E00-\u9FA0A-Za-z\-0-9\_.]+$/;
						if(!valiter.isNull($.trim(this.value))){
							if ($.trim(this.value).length>10 || !scoreReg.exec($.trim(this.value))) {
								$("#codeMsg").addClass("onError").html(errorMsg);
							}else{
								$("#codeMsg").removeClass("onError").html("");
							}
							
//							else{
//								comRegister.checkCompyCode(function(ret){
//									if(!ret){
//										$("#codeMsg").removeClass("onError").html("");
//										$("#codeMsg").addClass("onError").html(errorMsgT);
//									}
//									else $("#codeMsg").removeClass("onError").html("");					
//								});
//								}
						}else{
							$("#codeMsg").removeClass("onError").html("");
						}
					}
					//验证企业地址
					if($(this).is('#compAddress')){
						var errorMsg = Dict.val("special_characters_or_less");
						var scoreReg = /^[\u4E00-\u9FA0A-Za-z\-0-9\_.]+$/;
						if(!valiter.isNull($.trim(this.value))){
							if ($.trim(this.value).length>100 || !scoreReg.exec($.trim(this.value))) {
								$("#addressMsg").addClass("onError").html(errorMsg);
							}
							else $("#addressMsg").removeClass("onError").html("");
						}else{
							$("#addressMsg").removeClass("onError").html("");
						}
					}
				}

			});	
//			$("#pools").bind('input propertychange', function() {
//				var ss = multiTenacy._getSelectedPools();
//				if(null==ss||ss.length==0){
//					$("#poolMsg").addClass("onError").html("请选择数据中心");
//				}
//				else $("#poolMsg").removeClass("onError").html("");
//			});
			$("#pools").bind('change', function() {
				var ss = multiTenacy._getSelectedPools($("#pools"));
				if(null==ss||ss.length==0){
					$("#poolMsg").addClass("onError").html(Dict.val("tenant_please_select_data_center"));
				}
				else $("#poolMsg").removeClass("onError").html("");
			});
		},
		
		"initMultiSelect" : function(pool){				
			multiTenacy.initResourcePool(function(result){
				var pools = result;
				$("#pools").empty();
				 $(pools).each(function(i,item){
					 var pool = $('<option value="'+item.value+'">'+item.text+'</option>');
					 pool.appendTo($("#pools"));
				 })
				 $("#pools").multiselect({
						noneSelectedText: "=="+Dict.val("common_choose")+"==",
				        checkAllText: Dict.val("tenant_select_all"),
				        uncheckAllText: Dict.val("tenant_unselect_all"),
				        selectedList:5
				        
				 }); 
				 if(null!=pool&&pool.length>0){
					 var dataarray = pool.split(",");
					 $("#pools").val(dataarray);					 
					 $("#pools").multiselect("refresh");
					 if("mod" == multiTenacy.addOrMod){
						 var checkedPool = $("input[type='checkbox'][name='multiselect_pools']:checked");	
						 $(checkedPool).each(function(i,item){	
							 $(this).attr("disabled","disabled");
						 })
					 }
				 }
				
			})
		},	
		initResourcePool : function(callback){
			var pools = [];		
			//com.skyform.service.SessionService.user.pool = "huhehaote,langfang,NM-xinyongyun";	
			var userPools = $("#userPools").val();
			if(null!=userPools&&userPools.length>0){
				var resourcepool = userPools.split(",");
				if(null!=resourcepool&&resourcepool.length>0){	
					 $(resourcepool).each( function(i,item) {
						if(null!=item&&item.length>0&&"undefined"!=item){
							var p = {
									"value":"",
									"text" :""
								}
							p.value = item;
							p.text = multiTenacy.pools[item];
							pools.push(p);
						} 						
					})
				}
				callback(pools);
			}
		},
		onOptionSelected : function(index) {
		},
		_getSelectedPools : function(obj){
			var selectedArr = obj.multiselect("getChecked").map(function() {
	            return this.value;
	        }).get();
			var valuestr = "";
			if(null!=selectedArr){
				valuestr = selectedArr.join(',');
			}
			return valuestr;
		},
		// 创建用户
		createUser : function() {
			$("#create_bill :input").trigger('blur');
			$("#pools").trigger('change');
			var isSubmit = true;
			isSubmit = Register.valite();
			if (!isSubmit) {
				return;
			}			
			$("#regSubmit").attr("disabled","disabled");
			var account = $.trim($("#username_tenancy").val());
			var username = $.trim($("#username_tenancy").val());
		    var password = $.trim($("#password").val());
		    var email = $.trim($("#email").val());
		    var mobile = $.trim($("#mobile").val());
		    var compCnName = $.trim($("#compCnName").val());
			var compOrgCode = $.trim($("#compOrgCode").val());
		    var compAddress = $.trim($("#compAddress").val());
		    var selectedArr = multiTenacy._getSelectedPools($("#pools"));
		    
			var params = {
				  "account":account,
				  "email":email,
				  "mobile":mobile,
				  "password":password,
				  "roleId":1,
				  "username":account,
				  "compAddress":compAddress,
				  "compCnName":compCnName,
				  "compEmail":"",
				  "compFax":"",
				  "compOrgCode":compOrgCode,
				  "compPhone":"",
				  "resourcePool":selectedArr,
				  "onLine":admin.online
				};			
			multiTenacy.service.save(params,function onSuccess(data){
				$.growlUI(Dict.val("common_tip"), Dict.val("tenant_create_user_submit_success"));
				multiTenacy.updateDataTable();
				$("#billTable_wrapper").attr("style","display:block;");
				$("#create_bill").attr("style","display:none;");
				$("#toolbar").attr("style","display:block;");

			},function onError(msg){
				$.growlUI(Dict.val("common_tip"), Dict.val("tenant_create_user_submit_error") + msg); 
			});
		},
		modifyUser : function(){
			$("#create_bill :input").trigger('blur');
			$("#pools").trigger('change');
			var isSubmit = true;
			isSubmit = Register.valite();
			if (!isSubmit) {
				return;
			}			
			$("#regSubmit").attr("disabled","disabled");
			var account = $.trim($("#username_tenancy").val());
//			var username = $.trim($("#username_tenancy").val());
		    var password = $.trim($("#password").val());
		    var email = $.trim($("#email").val());
		    var mobile = $.trim($("#mobile").val());
		    var compCnName = $.trim($("#compCnName").val());
			var compOrgCode = $.trim($("#compOrgCode").val());
		    var compAddress = $.trim($("#compAddress").val());
		    var chktr = multiTenacy.getCheckedArr().parents("tr");
			var customerId =  chktr.attr("customerId");
			var selectedArr = multiTenacy._getSelectedPools($("#pools"));
			var params = {
					  "customerId":parseInt(customerId),
					  "email":email,
					  "mobile":mobile,  
					  "username":account,
					  "compAddress":compAddress,
					  "compCnName":compCnName,
					  "compEmail":"",
					  "compFax":"",
					  "compOrgCode":compOrgCode,
					  "compPhone":"",
					  "resourcePool":selectedArr
					};

			multiTenacy.service.modify(params,function onSuccess(data){
				$.growlUI(Dict.val("common_tip"), Dict.val("tenant_modify_user_submit_success"));
				multiTenacy.updateDataTable();
				$("#billTable_wrapper").attr("style","display:block;");
				$("#create_bill").attr("style","display:none;");
				$("#toolbar").attr("style","display:block;");

			},function onError(msg){
				$.growlUI(Dict.val("common_tip"), Dict.val("tenant_modify_user_submit_error") + msg); 
			});
		},
		//删除用户
		deleteUser : function(){
			var customerId =  multiTenacy.getCheckedArr().parents("tr").attr("customerId");
			var loginName =  multiTenacy.getCheckedArr().parents("tr").attr("loginName");
			var params = {
					  "customerId":parseInt(customerId),
					  "loginname":loginName
					};

			multiTenacy.service.deleteUser(params,function onSuccess(data){
				$.growlUI(Dict.val("common_tip"), Dict.val("tenant_delete_user_submit_success"));
				multiTenacy.updateDataTable();
//				$("#billTable_wrapper").attr("style","display:block;");
//				$("#create_bill").attr("style","display:none;");
//				$("#toolbar").attr("style","display:block;");
			},function onError(msg){
				$.growlUI(Dict.val("common_tip"), Dict.val("tenant_delete_user_submit_error")+ msg); 
			});			
		},
		// 查询虚拟硬盘列表
		describeAdminUser : function() {
			multiTenacy.service.describeAdminUser(function onSuccess(data){
				multiTenacy.instances = data;
				multiTenacy.renderDataTable(data);		
			},function onError(msg){
				$.growlUI(Dict.val("common_tip"), Dict.val("common_query_error") + msg); 
			});
		},
		renderDataTable : function(data) {
			multiTenacy.datatable.renderByData("#billTable", {
					"data" : data,
					"iDisplayLength": 5,				
					"columnDefs" : [
					     {title : "<input type='checkbox' id='checkAll'>", name : "id"},
//					     {title : "ID", name : "id"},
					     					     
					     {title : Dict.val("common_user_ming"), name : "loginName"},
					     {title : Dict.val("tenant_email"), name : "customerEmail"},
					     {title : Dict.val("common_mobile_phone"), name : "customerMobile"},
					     {title : Dict.val("obs_modified_date"), name : "modifyDate"}					     
					],
					"onColumnRender" : function(columnIndex, columnMetaData, columnData) {
						 var text = columnData[''+columnMetaData.name] || "";
						 if(columnMetaData.name == 'id') {
							 text = '<input type="checkbox" value="'+text+'">';
						 }
						 if (columnMetaData.name == "ID") {
							 text = text;
						 }
						 if (columnMetaData.name == "state") {
							 text = text;
						 }
						 if (columnMetaData.name == "printFee") {
							 text = text/1000;
						 }

						 if (columnMetaData.name == "modifyDate") {
							 text = new Date(text).format("yyyy-MM-dd hh:mm:ss");
						 }
						 return text;
					}, 
					"afterRowRender" : function(rowIndex, data, tr){
						tr.attr("customerId", data.customerId).
						attr("loginName", data.loginName).
						attr("password", data.password).
						attr("customerEmail", data.customerEmail).
						attr("customerMobile", data.customerMobile).
						attr("compaddress", data.compaddress).
						attr("compname", data.compname).
						attr("comporgcode", data.comporgcode).
						attr("resourcePool",data.resourcePool);												
//						{"customerType":1,"modifyTag":"X","comporgcode":"100086","statusChgDate":1405068705000,"compaddress":"云基地","customerId":67026403,"compemail":" master@chinaskycloud.com","compphone":"82166666","modifyDate":1405068705000,"loginName":"zhanghz1","isCustAdmin":0,"compfax":"82166666","onLine":0,"compname":"天云融创软件技术有限公司","accountId":484027,"password":"fcea920f7412b5da7be0cf42b8c93759","customerName":"张慧征","customerMobile":"18666666666","certType":0,"roleId":1,"customerEmail":"zhanghz@chinaskycloud.com","customerStatus":1,"createDate":1405068705000}						
					},
					"afterTableRender" : function() {
						// 翻页的时候清除前一页选中的checkbox，同时将更多操作置为不可用
						$("#billTable input[type='checkbox']").attr("checked", false);
			            //全选取消选中
			            $("#checkAll").attr("checked", false);			             
						$("#modifyUser").addClass("disabled");
						$("#modifyUser").attr("disabled",true);
						$("#deleteUser").addClass("disabled");
						$("#deleteUser").attr("disabled",true);						
						multiTenacy.bindEvent();
						var firstRow = $("#billTable tbody").find("tr:eq(0)");
						var firstInsId = firstRow.attr("id");
						//显示第一条记录的日志
						multiTenacy.showInstanceInfo(firstInsId);
						firstRow.css("background-color","#BCBCBC");
						multiTenacy.setSelectRowBackgroundColor(firstRow);
					}
				}
			);
			multiTenacy.datatable.addToobarButton("#disktoolbar");
			multiTenacy.datatable.enableColumnHideAndShow("right");
		},
		setSelectRowBackgroundColor : function(handler) {
//			$("#content_container tr").css("background-color","");
//			handler.css("background-color","#BCBCBC");
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
			             $("#checkAll").attr("checked", false);			             
			             $("input[type='checkbox']",$(this)).attr("checked", true);
						multiTenacy.showOrHideModifyOpt();
						multiTenacy.showOrHideDeleteOpt();
			     } 
			    multiTenacy.showInstanceInfo($(this).attr("id"));
			    multiTenacy.setSelectRowBackgroundColor($(this));
			}); 
			
			$("#checkAll").unbind("click").bind("click", function(e) {
				var checked = $(this).attr("checked") || false;
		        $("#billTable input[type='checkbox']").attr("checked",checked);	 
				multiTenacy.showOrHideModifyOpt();
				multiTenacy.showOrHideDeleteOpt();
		        e.stopPropagation();
			});
			
			$("#billTable tbody input[type='checkbox']").unbind("click").bind("click", function() {
				multiTenacy.showOrHideModifyOpt();
				multiTenacy.showOrHideDeleteOpt();
			});
			
			$("#btnRefresh").unbind("click").bind("click", function() {
				multiTenacy.updateDataTable();
			});
			
			$("#createUser").unbind("click").bind("click", function() {
				$("#create_bill").attr("style","display:block;");
				$("#create_bill span .text-error").removeClass("onError").empty();
				var userPools = "<%=resourcePools%>";
				multiTenacy.initMultiSelect(userPools);
				$("body form")[0].reset();
				$("#regSubmit").attr("disabled",false);
				$("#username_tenancy").attr("disabled",false);
				$("#password").attr("disabled",false);
				$("#passwordDiv").attr("style","display:block;");
				$("#rePasswordDiv").attr("style","display:block;");
				$("#billTable_wrapper").attr("style","display:none;");
				
				$("#toolbar").attr("style","display:none;");
				multiTenacy.addOrMod = "add";			
				
			});
			$("#btnBilllist").unbind("click").bind("click", function() {								
				$("#billTable_wrapper").attr("style","display:block;");
				$("#create_bill").attr("style","display:none;");
				$("#toolbar").attr("style","display:block;");				
			});
			$("#btnCancel").unbind("click").bind("click", function() {								
				$("#billTable_wrapper").attr("style","display:block;");
				$("#create_bill").attr("style","display:none;");
				$("#toolbar").attr("style","display:block;");				
			});
			$("#modifyUser").unbind("click").bind("click", function() {								
//				$("#createModal form")[0].reset();
//				$("#createModal").modal("show");
				$("#create_bill span .text-error").removeClass("onError").empty();
				$("#regSubmit").attr("disabled",false);
				$("#username_tenancy").attr("disabled",true);
				$("#password").attr("disabled",true);				
				$("#passwordDiv").attr("style","display:none;");
				$("#rePasswordDiv").attr("style","display:none;");
				$("#billTable_wrapper").attr("style","display:none;");
				$("#create_bill").attr("style","display:block;");
				$("#toolbar").attr("style","display:none;");
				multiTenacy.addOrMod = "mod";												

				var chktr = multiTenacy.getCheckedArr().parents("tr");
				var customerId =  chktr.attr("customerId");
				var loginName =  chktr.attr("loginName");
				var password =  chktr.attr("password");				
				var customerEmail =  chktr.attr("customerEmail");
				var customerMobile =  chktr.attr("customerMobile");
				var compaddress =  chktr.attr("compaddress");
				var compname =  chktr.attr("compname");
				var comporgcode =  chktr.attr("comporgcode");	
				var resourcepool = chktr.attr("resourcePool");	
				multiTenacy.initMultiSelect(resourcepool);
				
				
				//查询用户信息
				$("#username_tenancy").val(loginName);
			    $("#password").val(password);
			    $("#email").val(customerEmail);
			    $("#mobile").val(customerMobile);
			    $("#compCnName").val(compname);
				$("#compOrgCode").val(comporgcode);
			    $("#compAddress").val(compaddress);
			    multiTenacy.curUsername = loginName;
			    multiTenacy.curEmail = customerEmail;
			    multiTenacy.curMobile = customerMobile;


			});
			$("#deleteUser").unbind("click").bind("click", function() {	
				multiTenacy.confirmModal = new com.skyform.component.Modal(new Date().getTime(),Dict.val("tenant_delete_user"),"<h4>"+Dict.val("tenant_do_you_delete_user")+" </h4>",{
					buttons : [
						{
							name : Dict.val("common_determine"),
							onClick : function(){
								// 删除用户
								multiTenacy.deleteUser();
								multiTenacy.confirmModal.hide();
							},
							attrs : [
								{
									name : 'class',
									value : 'btn btn-primary'
								}
							]
						},
						{
							name : Dict.val("common_cancel"),
							attrs : [
								{
									name : 'class',
									value : 'btn'
								}
							],
							onClick : function(){
								multiTenacy.confirmModal.hide();
							}
						}
					]
				});
			multiTenacy.confirmModal.setWidth(500).autoAlign();
			multiTenacy.confirmModal.show();				
			});			
		},
		showOrHideModifyOpt : function() {
			var checkboxArr = $("#billTable tbody input[type='checkbox']:checked");
			if(checkboxArr.length == 0){
				$("#modifyUser").addClass("disabled");
				$("#modifyUser").attr("disabled",true);
			} else if(checkboxArr.length == 1){
				$("#modifyUser").removeClass("disabled");
				$("#modifyUser").attr("disabled",false);
			} else {
				$("#modifyUser").addClass("disabled");
				$("#modifyUser").attr("disabled",true);
			}
		},
		// 根据选中的虚拟硬盘的状态判断是否将删除选项置为不可用， 还要根据是否挂载虚机
		showOrHideDeleteOpt : function() {
			var checkboxArr = $("#billTable tbody input[type='checkbox']:checked");
			if(checkboxArr.length == 0){
				$("#deleteUser").addClass("disabled");
				$("#deleteUser").attr("disabled",true);
			} else if(checkboxArr.length == 1){				
				$("#deleteUser").removeClass("disabled");
				$("#deleteUser").attr("disabled",false);
			} else {
				$("#deleteUser").addClass("disabled");
				$("#deleteUser").attr("disabled",true);				
			}
		},

		showInstanceInfo : function(vdiskId){
			$("#opt_logs").empty();
			if (!vdiskId || vdiskId<=0) return;
			com.skyform.service.LogService.describeLogsUIInfo(vdiskId);
//			com.skyform.service.LogService.describeLogsInfo(vdiskId,function onSuccess(logs){
//				$("#opt_logs").empty();
//				$(logs).each(function(i,v){
//					var desc = "";
//					if(v.description){
//						if(v.description != ""){
//							desc = "("+v.description+")";
//						}						
//					}
//					var _name = "";
//					if(v.subscription_name){
//						_name = v.subscription_name;
//					}
//					$("<li class='detail-item'><span>" + v.createTime + "  " +_name + "  " + v.controle + desc + "</span></li>").appendTo($("#opt_logs"));
//				});				
//			},function onError(msg){
//			});
			
		},
		// 刷新Table
		updateDataTable : function() {
			multiTenacy.service.describeAdminUser(function onSuccess(data){
				multiTenacy.instances = data;
				multiTenacy.datatable.updateData(data);	
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
		}
};

var Register = {
		register: function(){			
	    	$("body :input").trigger('blur');	       
	        var back = false;
			back = Register.valite();
			if (!back) {
				return;
			}
			$("#regSubmit").attr("disabled","disabled");
			var account = $.trim($("#username_tenancy").val());
			var username = $.trim($("#username_tenancy").val());
		    var password = $.trim($("#password").val());
		    var email = $.trim($("#email").val());
		  //  var phone = $.trim($("#phone").val());
		    var mobile = $.trim($("#mobile").val());
		    var messageCode = $("#messageCode").val();
	        var data = {
	        		messageCode:messageCode,
	        		account:account,
	        		username: username,
	        		password: password,
	        		email:email,
	        		mobile:mobile,
	        		roleId:1,
	        		"onLine":admin.online
            };      
	        Dcp.biz.apiRequest("/user/createUser", data,
					function(data) {
	        	state = data.code;
	        	if(state == 0){
	        		msgModal.setContent("<span class='text-success'><h3>"+Dict.val("tenant_successful_registration")+"<h3></span>");
	        		msgModal.show();	
	        		msgModal.afterHidden = function(){
	        			window.location = window.returnURL;
	        		};
				}
	        	else if(state == -1){
	        		msgModal.setContent("<span class='text-success'><h3>"+data.msg+"<h3></span>");
	        		msgModal.show();
	        		$("#regSubmit").removeAttr("disabled");
	        	}
	        	else if(state == 1){
	        		msgModal.setContent("<span class='text-success'><h3>"+Dict.val("tenant_fail_registration")+"<h3></span>");
	        		msgModal.show();
	        		$("#regSubmit").removeAttr("disabled");
	        	}
			});   
	    },
	    valite : function() {	
	    	var numError = $('.onError').length;
			if (numError) {
				return false;
			}
			return true;
		},
		
		checkAccount:function(callback){
			var ret = true;
			var data = {loginName:$.trim($("#username_tenancy").val())};
//			var data = {arg0:{loginName:$.trim($("#username_tenancy").val())}};
			Dcp.biz.apiAsyncRequest("/user/uniqueCheck", data,function(data) {
	        	var flag = data.code;	  
	        	if(flag == -1){
	        		ret = false;
				}
	        	callback(ret);
			});
			return ret;
			
		},
		checkEmail:function(callback){
			var ret = true;
			var data = {email:$.trim($("#email").val())};
//			var data = {arg0:{email:$.trim($("#email").val())}};
			Dcp.biz.apiAsyncRequest("/user/uniqueCheck", data,function(data) {
				var flag = data.code;	  
	        	if(flag == -1){
	        		ret = false;
				}
	        	callback(ret);
			});
			return ret;
		},
		checkMobile:function(callback){
			var ret = true;
			var data = {mobile:$.trim($("#mobile").val())};
//			var data = {arg0:{mobile:$.trim($("#mobile").val())}};
			Dcp.biz.apiAsyncRequest("/user/uniqueCheck", data,function(data) {
				var flag = data.code;	  
	        	if(flag == -1){
	        		ret = false;
				}
	        	callback(ret);
			});
			return ret;
		}

};

//var comRegister = {
//		register: function(){
//	    	$("body :input").trigger('blur');	       
//	        var back = false;
//			back = comRegister.valite();
//			if (!back) {
//				return;
//			}
//			$("#regSubmit").attr("disabled","disabled");
//			var account = $.trim($("#username_tenancy").val());
//			var username = $.trim($("#username_tenancy").val());
//		    var password = $.trim($("#password").val());
//		    var email = $.trim($("#email").val());
//		  //  var phone = $.trim($("#phone").val());
//		    var mobile = $.trim($("#mobile").val());
//		    var compCnName = $.trim($("#compCnName").val());
//			var compOrgCode = $.trim($("#compOrgCode").val());
//		    var compAddress = $.trim($("#compAddress").val());
//		    //var compPhone = $.trim($("#compPhone").val());
//		    //var compFax = $.trim($("#compFax").val());
//		    var compEmail = $.trim($("#email").val());
//		    var messageCode = $("#messageCode").val();
//	        var data = {
//	        		messageCode:messageCode,
//	        		account:account,
//	        		username: username,
//	        		password: password,
//	        		email:email,
//	        		mobile:mobile,
//	        		roleId:1,
//	        		compCnName:compCnName,
//	        		compOrgCode:compOrgCode,
//	        		compAddress:compAddress,
//	        		//compPhone:compPhone,
//	        		//compFax:compFax,
//	        		compEmail:compEmail,
//	        		//checkCode: $.trim($("#activeHost").val())//portal服务地址
//            };
//	        Dcp.biz.apiRequest("/user/createCompany", data,
//					function(data) {
//	        	state = data.code;
//	        	if(state == 0){
//	        		msgModal.setContent("<span class='text-success'><h3>注册成功，请先去您注册的邮箱激活后再登录！<h3></span>");
//	        		msgModal.show();	
//	        		msgModal.afterHidden = function(){
//	        			window.location = window.returnURL;	        			
//	        		};
//				}
//	        	else if(state == -1){
//	        		msgModal.setContent("<span class='text-success'><h3>"+data.msg+"<h3></span>");
//	        		msgModal.show();
//	        		$("#regSubmit").removeAttr("disabled");
//	        	}
//	        	else if(state == 1){
//	        		msgModal.setContent("<span class='text-success'><h3>注册失败，请联系管理员！<h3></span>");
//	        		msgModal.show();
//	        		$("#regSubmit").removeAttr("disabled");
//	        	}
//			});  
//	    },
//	    valite : function() {
//	    	var numError = $('.onError').length;
//			if (numError) {
//				return false;
//			}
//			else {	
//				var ret = false;
//				$.ajax({
//					url : "../pr/verifyCode",
//					type : 'POST',
//					data : {
//						code : $("#captcha").val()
//					},
//					async : false,
//					dataType : 'json',
//					success : function(state) {
//						var stateX = state+"";
//						if (stateX == "false") {
//							$("#capMsg").addClass("onError").html("* 验证码输入错误");
//							
//							changeImg();
//							$("#captcha").val("");
//							
//						}
//						// 验证码session超时
//						else if (stateX == "timeout") {
//							$("#capMsg").addClass("onError").html("* 操作超时，请重新输入验证码！");
//							changeImg();
//							$("#captcha").val("");
//						}	
//						else 
//							ret =  true;
//					}
//				});
//				return ret;
//			}			
//		},
//		
//		checkAccount:function(callback){
//			var ret = true;
//			var data = {account:$.trim($("#username_tenancy").val())};
//			Dcp.biz.apiAsyncRequest("/user/uniqueCheck", data,function(data) {
//				var flag = data.code;	  
//	        	if(flag == -1){
//	        		ret = false;
//				}
//	        	callback(ret);
//			});
//			return ret;
//			
//		},
//		checkCompyName:function(callback){
//			var ret = true;
//			var data = {compyName:$.trim($("#compCnName").val())};
//			Dcp.biz.apiAsyncRequest("/user/uniqueCheck", data,function(data) {
//				var flag = data.code;	  
//	        	if(flag == -1){
//	        		ret = false;
//				}
//	        	callback(ret);
//			});
//			return ret;
//		},
//		checkCompyCode:function(callback){
//			var ret = true;
//			var data = {compyCode:$.trim($("#compOrgCode").val())};
//			Dcp.biz.apiAsyncRequest("/user/uniqueCheck", data,function(data) {
//				var flag = data.code;	  
//	        	if(flag == -1){
//	        		ret = false;
//				}
//	        	callback(ret);
//			});
//			return ret;
//		}
//};

