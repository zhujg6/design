//window.currentInstanceType='bill';
window.currentInstanceType='userkey';
$(function(){
	userKey.init();
});
var userKey = {
		datatable : null,
		userName:null,
		service : com.skyform.service.userKeyService,
		init : function() {
			var billAddr = {
					"data":[]
				};
			userKey.userName=$("#currentAccout").val();
			userKey.quaryDataTable();
			$("#btn_cre").bind('click',function(e){
				var params={
						loginName:userKey.userName
				};
				userKey.service.listKeyInfo(params,function onSuccess(data){
					var obj = jQuery.parseJSON(data);
					if(obj==null){
						userKey.service.getAkAndSkRandom(function onSuccess(data){
							var obj = jQuery.parseJSON(data);
							$("#accessKey").val(obj.accessKey);
							$("#secretKey").val(obj.secretKey);
							$('#createModal').attr("style","display:block");
						},function onError(msg){
							$.growlUI(Dict.val("common_tip"), msg);
						});
					}else{
						$.growlUI(Dict.val("common_tip"), Dict.val("user_user_has_key"));
					}
				},function onError(msg){
					$.growlUI(Dict.val("common_tip"), msg);
				});
				
			});	
			//初始化时间
			userKey.initActiveTime();
			//点击修改
			$("#btn_mod").bind('click',function(e){
				var row = $("#stable tbody input[type='radio']:checked").parents("tr");
				if(row.length==0){
					$.growlUI(Dict.val("common_tip"), Dict.val("user_not_created_ke"));
					return;
				}
				$("#modAccessKey").attr('value',row.eq(0).attr('accessKey'));
				$("#modSecretKey").attr('value',row.eq(0).attr('secretKey'));
                $("#modAkInActiveDate").datepicker({
					changeMonth : true,
					changeYear : true,
					showWeek : true,
					showButtonPanel : true,
					gotoCurrent : true,
					dateFormat : "yy-mm-dd",
					maxDate : +1095
				});
				$("#modAkInActiveDate").attr('value',new Date(parseInt(row.eq(0).attr('akInActiveDate'))).format("yyyy-MM-dd"));
				$("#modSkInActiveDate").datepicker({
					changeMonth : true,
					changeYear : true,
					showWeek : true,
					showButtonPanel : true,
					gotoCurrent : true,
					dateFormat : "yy-mm-dd",
					maxDate : +1095
				});
				$("#modSkInActiveDate").attr('value',new Date(parseInt(row.eq(0).attr('skInActiveDate'))).format("yyyy-MM-dd"));
				$('#modifyModal').attr("style","display:block");
			});	
			$("#cancel").bind('click',function(){
				$('#createModal').attr("style","display:none");
			});
			$("#modCancle").bind('click',function(){
				$('#modifyModal').attr("style","display:none");
			});
			//更改提交
			$("#btnEidtAddress").bind('click',function(){
				var radioModelTable = $("#stable tbody input[type='radio']:checked").parents("tr");
				var params ={};
				params.loginName=userKey.userName;
				params.paramStr={};
				params.paramStr.accessKey=$.trim($("#modAccessKey").val());
				params.paramStr.secretKey=$("#modSecretKey").val();
				params.paramStr.akInActiveDate=$("#modAkInActiveDate").val();
				params.paramStr.skInActiveDate=$("#modSkInActiveDate").val();
				userKey.service.modifyKeyInfo(params,function onSuccess(data){
					$.growlUI(Dict.val("common_tip"), Dict.val("user_modify_key_success"));	
				        	userKey.quaryDataTable();
				        	$("#modifyModal").attr("style","display:none");
				},function onError(msg){
					$.growlUI(Dict.val("common_tip"), msg);
				  });
			});
			$("#refersh").bind('click',function(){
				userKey.service.getAkAndSkRandom(function onSuccess(data){
					var obj = jQuery.parseJSON(data);
					$("#modAccessKey").val(obj.accessKey);
					$("#modSecretKey").val(obj.secretKey);
				},function onError(msg){
					$.growlUI(Dict.val("common_tip"), msg);
				});
			});
			
			$("#btn_del").bind('click',function(e){
				var row = $("#stable tbody input[type='radio']:checked").parents("tr");
				if(row.length==0){
					$.growlUI(Dict.val("common_tip"), Dict.val("user_not_created_ke"));
					return;
				}
					$('#deleteModal').modal('show');
					
									
				});	
			$("#btn_ref").unbind().click(function() {
				userKey.quaryDataTable();
				
			});
			$("#btnDelKey").bind('click',function(){
				var row = $("#stable tbody input[type='radio']:checked").parents("tr");
				if(row.length==0){
					$.growlUI(Dict.val("common_tip"), Dict.val("user_not_created_ke"));
					return;
				}
				var params ={};
				
				params.loginName=userKey.userName;
				userKey.service.deleteKeyInfo(params,function onSuccess(data){
					$.growlUI(Dict.val("common_tip"), Dict.val("user_delete_key_success"));	
				        	userKey.quaryDataTable();
				        	$("#deleteModal").modal('hide');
				},function onError(msg){
					$.growlUI(Dict.val("common_tip"), msg);
				});
			});
		
			$("#createAddress").bind('click',function(){
					
				var accessKey = $.trim($("#accessKey").val());
				var secretKey = $.trim($("#secretKey").val());
				var akInActiveDate= $.trim($("#akInActiveDate").val());
				var skInActiveDate= $.trim($("#skInActiveDate").val());
				var params ={};
				
				params.loginName = userKey.userName;
				params.paramStr={};
				params.paramStr.accessKey = accessKey;
				params.paramStr.secretKey=secretKey;
				params.paramStr.akInActiveDate=akInActiveDate;
				params.paramStr.skInActiveDate=skInActiveDate;

				userKey.service.insertKeyInfo(params,function onSuccess(data){
				        	userKey.quaryDataTable();
				        	$('#createModal').attr("style","display:none");
							$("#accessKey").val('');
							$("#secretKey").val('');
							$.growlUI(Dict.val("common_tip"), Dict.val("user_enter_key_information_success"));	
				},function onError(msg){
					$.growlUI(Dict.val("common_tip"), msg);
				});
		});
	},
		initActiveTime:function(){
			$.datepicker.regional['zh-CN'] = {
					clearText : Dict.val("user_remove"),
					clearStatus : Dict.val("user_clear_selected_date"),
					closeText : Dict.val("common_close"),
					closeStatus : Dict.val("user_does_not_change_current_selection"),
					prevText : '&lt;'+Dict.val("user_last_month"),
					prevStatus : Dict.val("user_display_last_month"),
					nextText : Dict.val("user_next_month")+'&gt;',
					nextStatus : Dict.val("user_show_next_month"),
					currentText : Dict.val("common_today"),
					currentStatus : Dict.val("user_display_this_month"),
					monthNames : [Dict.val("common_january"),
	                              Dict.val("common_february"),
	                              Dict.val("common_march"),
	                              Dict.val("common_april"),
	                              Dict.val("common_may"),
	                              Dict.val("common_june"),
	                              Dict.val("common_july"),
	                              Dict.val("common_august"),
	                              Dict.val("common_september"),
	                              Dict.val("common_october"),
	                              Dict.val("common_november"),
	                              Dict.val("common_december")],
					monthNamesShort : [ Dict.val("common_january"),
			                              Dict.val("common_february"),
			                              Dict.val("common_march"),
			                              Dict.val("common_april"),
			                              Dict.val("common_may"),
			                              Dict.val("common_june"),
			                              Dict.val("common_july"),
			                              Dict.val("common_august"),
			                              Dict.val("common_september"),
			                              Dict.val("common_october"),
			                              Dict.val("common_november"),
			                              Dict.val("common_december")],
					monthStatus : Dict.val("common_select_month"),
					yearStatus : Dict.val("common_select_year"),
					weekHeader : Dict.val("common_zhou"),
					weekStatus : Dict.val("common_weeks_years"),
					dayNames : [ Dict.val("common_sunday"), 
					             Dict.val("common_monday"), 
					             Dict.val("common_tuesday"), 
					             Dict.val("common_wednesday"), 
					             Dict.val("common_thursday"), 
					             Dict.val("common_friday"), 
					             Dict.val("common_saturday")],
					dayNamesShort : [ Dict.val("common_sunday1"), 
					                  Dict.val("common_monday1"), 
					                  Dict.val("common_tuesday1"), 
					                  Dict.val("common_wednesday1"), 
					                  Dict.val("common_thursday1"), 
					                  Dict.val("common_friday1"), 
					                  Dict.val("common_saturday1")],
					dayNamesMin : [Dict.val("common_day"),
			                       Dict.val("common_one"),
			                       Dict.val("common_two"),
			                       Dict.val("common_three"),
			                       Dict.val("common_four"),
			                       Dict.val("common_Fives"),
			                       Dict.val("common_six")],
					dayStatus : Dict.val("common_DD_is_set_start_one_week"),
					dateStatus : Dict.val("common_select_m_month_d_day_DD"),
					dateFormat : 'yy-mm-dd',
					firstDay : 1,
					initStatus : Dict.val("common_please_select_date"),
					isRTL : false
				};
				$.datepicker.setDefaults($.datepicker.regional['zh-CN']);
				// 时间控件
				$("#akInActiveDate").datepicker({
					changeMonth : true,
					changeYear : true,
					showWeek : true,
					showButtonPanel : true,
					gotoCurrent : true,
					dateFormat : "yy-mm-dd",
					maxDate : +1095
				});
				var current = new Date();
				var year = current.getFullYear()+1;
				var month = current.getMonth()+1;
				var day = current.getDate();
				if(month<10){
					month = '0'+month;
				}
				if(day<10){
					day='0'+day;
				}
				$("#akInActiveDate").val(year+'-'+month+'-'+day);
				$("#akInActiveDate").datepicker({dateFormat: 'yy-mm-dd',
					beforeShow: function(i,e){
					 var z = jQuery(i).closest(".ui-dialog").css("z-index") + 4;
					 e.dpDiv.css('z-index', z);
					}});
				$("#skInActiveDate").datepicker({
					changeMonth : true,
					changeYear : true,
					showWeek : true,
					showButtonPanel : true,
					gotoCurrent : true,
					dateFormat : "yy-mm-dd",
					maxDate : +1095
				});
				$("#skInActiveDate").val(year+'-'+month+'-'+day);
		},
		LoadUserKeyDataTable :function(data) {
			if(userKey.datatable){
				userKey.datatable.updateData(data);
			}else{
				userKey.datatable = new com.skyform.component.DataTable(),
			    userKey.datatable.renderByData("#stable", {
					"data" : data,
					"iDisplayLength": 5,				
					"columnDefs" : [
					     {title : "", name : "customerId"},
					     {title : "AK", name : "accessKey"},
					     {title : "SK", name : "secretKey"},
					     {title : "AK"+Dict.val("user_effective_time"), name : "akActiveDate"},
					     {title : "AK"+Dict.val("user_failure_time"), name : "akInActiveDate"},
					     {title : "SK"+Dict.val("user_effective_time"), name : "skActiveDate"},
					     {title : "SK"+Dict.val("user_failure_time"), name : "skInActiveDate"}
					],
					"onColumnRender" : function(columnIndex, columnMetaData, columnData) {
						var text = columnData[''+columnMetaData.name] || "";
						if (columnMetaData.name == "customerId") {
								text = '<input type="radio"  name="customerId" value="'+text+'">'
						 }
						 if (columnMetaData.name == "akActiveDate") {
							 text = new Date(text).format("yyyy-MM-dd hh:mm:ss");
						 }
						 if (columnMetaData.name == "akInActiveDate") {
							 text = new Date(text).format("yyyy-MM-dd hh:mm:ss");
						 }
						 if (columnMetaData.name == "skActiveDate") {
							 text = new Date(text).format("yyyy-MM-dd hh:mm:ss");
						 }
						 if (columnMetaData.name == "skInActiveDate") {
							 text = new Date(text).format("yyyy-MM-dd hh:mm:ss");
						 }
						 return text;
					}, 
					"afterRowRender" : function(rowIndex, data, tr){
						tr.attr("customerId", data.customerId).
						attr("accessKey", data.accessKey).
						attr("secretKey", data.secretKey).
						attr("akActiveDate", data.akActiveDate).
						attr("akInActiveDate", data.akInActiveDate).
						attr("skActiveDate", data.skActiveDate).
						attr("skInActiveDate", data.skInActiveDate);
					},
					"afterTableRender":function(){
						if($("#stable tbody input[type='radio']")){
						   $("#stable tbody input[type='radio']").eq(0).attr('checked','true');
						}
					}
				});
			}
		},
		//查询table
		quaryDataTable:function(){  
			var params={
					loginName:userKey.userName
			};
			userKey.service.listKeyInfo(params,function onSuccess(data){
				var obj = jQuery.parseJSON(data);
				var params=[];
				params[0]=obj;
				userKey.LoadUserKeyDataTable(params);
			},function onError(msg){
				$.growlUI(Dict.val("common_tip"), msg);
			});
	    }
};
