//10.10.242.180
window.currentInstanceType='lb';

window.Controller = {
	init : function(){
		lb.init();
		certificateAge.init();
	},
	refresh : function(){
		lb.updateDataTable();
	}
}
var product = {};
var ContextMenu = function(options){
	var _options = {
		container : options.container || $("#contextMenu"),
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
				var top = e.pageY;
				if (e.pageY >= screenHeight / 2) {
					top = e.pageY - _options.container.height();// 如果鼠标所在位置在屏幕高度中线的下半部分，则弹出框往上弹出
				}
				_options.container.hide();
				_options.container.attr(
						"style",
						"display: block; position: absolute; top:"
								+ top + "px; left:" + e.pageX
								+ "px; width: 180px;");
				_options.beforeShow($(this));
				_options.container.show();
				e.stopPropagation();
				_options.afterShow($(this));
				
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

var lb = {
	_ipsegment : "",
	_cidr : "",
	rules : [],
	rules_Modify : [],
	id : 1,
	firstRule : 0,
	lbId : 0,
	modifyLbRuleVM : 0,
	createModal:null,
	container : $("#lbRule"),	
	volumeState: [],
	wizard : null,
	subResh : null,
	datatable : new com.skyform.component.DataTable(),
	datatable_un : new com.skyform.component.DataTable(),
	datatable_b : new com.skyform.component.DataTable(),
	mrDataTable  : null,
	service : com.skyform.service.VdiskService4yaxin,
	mrService:com.skyform.service.LBMRService,
    highAvailble_type:"",
	subnet : [],
	curSubnet : [],
	createPeridInput : null,
	quota : 1,
	renderingModalData:[],
	oldName : '',
	subscriptionId:'',
	defPool:"nanchang",
	init : function() {
		lb.volumeState = {
				"pending" : Dict.val("common_ins_state_pending"),
				"reject" : Dict.val("common_ins_state_reject"),
				"opening" : Dict.val("common_ins_state_opening"),
				"changing" : Dict.val("common_ins_state_changing"),
				"deleting" : Dict.val("common_ins_state_deleting"),
				"deleted" : Dict.val("common_ins_state_deleted"),
				"running" : Dict.val("common_ins_state_running"),// 就绪
				"using" : Dict.val("common_ins_state_running_load"),
				"error" : Dict.val("common_ins_state_error")
				,"create error" : Dict.val("common_ins_state_error")
				,"delete error" : Dict.val("common_ins_state_error")
		};
		//查询协议
		CommonEnum.initProtocol(function(data){			
			CommonEnum.protocol = $.parseJSON(data);
			var pDom = '';
			$.each(CommonEnum.protocol, function(i) {
				pDom +='<option value="'+i+'">'+CommonEnum.protocol[i]+'</option>';
			});
			//console.log(pDom);
			$("#monitorProtocol").empty().append(pDom);
		});
		//查询负载方式
		CommonEnum.initLoopType(function(data){
			CommonEnum.loopType = $.parseJSON(data);
			var lDom = '';
			//console.log(CommonEnum.loopType);
			if("HTTP" == $("#monitorProtocol").val()){
				$.each(CommonEnum.loopType, function(i) {
					if("SOURCE_IP" != i){
						lDom +='<option value="'+i+'">'+CommonEnum.loopType[i]+'</option>';
					}
				});
			}else {
				$.each(CommonEnum.loopType, function(i) {
					lDom +='<option value="'+i+'">'+CommonEnum.loopType[i]+'</option>';
				});
			}

			//console.log(lDom);
			$("#loopType").empty().append(lDom);
			//console.log($("#loopType").html());
		});
		lb.describeLb();
		
		
		var inMenu = false;
		$("#monitorProtocol").off("change").on("change",function(){
			var value = $("#monitorProtocol").val();
			var lDom = '';
			if("UDP" == value){
				$.each(CommonEnum.loopType, function(i) {
					if("APP_COOKIE" != i && "HTTP_COOKIE" != i){
						lDom +='<option value="'+i+'">'+CommonEnum.loopType[i]+'</option>';
					}
					
				});
			}else if("TCP" == value){
				$.each(CommonEnum.loopType, function(i) {
					if("APP_COOKIE" != i && "HTTP_COOKIE" != i){
						lDom +='<option value="'+i+'">'+CommonEnum.loopType[i]+'</option>';
					}

				});
			}else if("HTTPS" == value){
				$.each(CommonEnum.loopType, function(i) {
					if("SOURCE_IP" != i){
						lDom +='<option value="'+i+'">'+CommonEnum.loopType[i]+'</option>';
					}

				});
			}else if("HTTP" == value){
				$.each(CommonEnum.loopType, function(i) {
					if("SOURCE_IP" != i){
						lDom +='<option value="'+i+'">'+CommonEnum.loopType[i]+'</option>';
					}

				});
			}
			/*else {
				$.each(CommonEnum.loopType, function(i) {
					lDom +='<option value="'+i+'">'+CommonEnum.loopType[i]+'</option>';
				});
			};*/

			$("#loopType").empty().append(lDom);
		});
		$("#modifyLbVM").bind('click',function(){			
			lb.modifyLbVM();
		});		
		
		$("#btnRefresh").bind('click',function(){			
			lb.updateDataTable();
		});	
		
		$("#lbAddvm").bind('click',function(){			
			lb.lbAddvm();
		});	
		$("#mr_save").bind('click',function(){			
			lb.createMR();
		});	
		
		$("#createLB").click(function() {
			lb.createLbShow();
//			var _net = $("#vm_privatenetwork").val();
//			if(!_net){
//				$.growlUI(Dict.val("common_tip"), "请先创建内网..."); 
//				return;
//			}else{
//				lb.createLbShow();
//			}		
		});
//		$("#lbModify").bind('click',function(){
//			lb.handleLi(1);
//		});		
		if($("#loopType option").val()=="APP_COOKIE"){

		}
		$("#contextMenu").bind('mouseover',function(){
			inMenu = true;
		});
	
		$("#contextMenu").bind('mouseout',function(){
			inMenu = false;
		});
		
//		$("#contextMenu li").bind('click',function(e){
//			$("#contextMenu").hide();
//			lb.handleLi($(this).index());					
//		});
		
		$("body").bind('mousedown',function(){
			if(!inMenu){
				$("#contextMenu").hide();
			}
		});	
		
		//更多操作...中的下拉菜单添加监听事件
		$(".dropdown-menu").bind('mouseover',function(){
			inMenu = true;
		});
		
		$(".dropdown-menu").bind('mouseout',function(){
			inMenu = false;
		});
		$(".dropdown-menu li").bind('click',function(e){
			//lb.handleLi($(this).index());					
		});
		lb.getBillTypeList();
		var realValue;
		$("#amount").bind("keydown",function(e){
			if (e.which == 13) { // 获取Enter键值
				e.preventDefault(); // 阻止表单按Enter键默认行为，防止按回车键提交表单
				realValue = parseInt(parseInt($("#amount").val())/10) * 10 ;
				$( "#slider-range-min" ).slider( "option", "value", realValue);
				$("#amount").val(realValue);			
			}
		});
		$("#amount").bind("blur",function(e){
				e.preventDefault(); // 阻止表单按Enter键默认行为，防止按回车键提交表单
				realValue = parseInt(parseInt($("#amount").val())/10) * 10 ;
				$( "#slider-range-min" ).slider( "option", "value", realValue);
				$("#amount").val(realValue);			
		});
		
		// 点击创建按钮
		// 新建lb
		$("#btnCreateLb").bind('click',function(e){
			lb.createLb();
		});	
		//点击修改按钮
//		$("#btn_modifyLb").bind('click',function(e){
//			lb.handleLi(0);	firewallId				
//		});	
		//修改lb
		$("#modify_save").bind('click',function(e){
			//只有当选中一个LB存储时修改名称和备注，其他情况友情提示
			var ids = $("#lbTable tbody input[type='checkbox']:checked");
			var instanceName = $("#modifyLbModal  input[name='instance_name']").val();
			var comment = $("#modifyLbModal textarea").val();
			lb.modifyLb($(ids[0]).val(),instanceName,comment);		
		});
		//根据当前资源池 隐藏 健康检查 按钮
		var booleanPool =(-1!=lb.defPool.indexOf(CommonEnum.currentPool));
		if(!booleanPool){
			$("#btn_mr").attr("style","display:none");
		}
		
//		$("#btn_modifyLb").attr("disabled",true);
//		$("#add_rule").attr("disabled",true);
//		$("#btn_delete").attr("disabled",true);
//		$("#btn_renew").attr("disabled",true);
/**
		var pDom = '';
		$.each(CommonEnum.protocol, function(i) {
			pDom +='<option value="'+i+'">'+CommonEnum.protocol[i]+'</option>';
		});
		$("#monitorProtocol").append(pDom);
		var lDom = '';
		$.each(CommonEnum.loopType, function(i) {					
			lDom +='<option value="'+i+'">'+CommonEnum.loopType[i]+'</option>';
		});	
		$("#loopType").append(lDom);
*/

		//lb_fan 判断资源池
		if(booleanPool){
			$("#health_allocation").attr("style","display:none");
		}
		$("#health_allocation").unbind("click").bind("click",function(){
			lb.healthAllocation();
		});
		//$(".operation[action='healthAllocation']").unbind("click").bind("click",function(){
		//	lb.healthAllocation();
		//});
		//lb_fan 点击选项卡负载均衡 刷新table
		$("#load_balancing_tab").unbind("click").bind("click",function(){
			if($("#load_balancing_content").is(":hidden")){
				lb.updateDataTable();
				lb.checkSelected();//初始化按钮置灰
			}else{}
		});

		$("#health_allocation1").live('click',function(){
			lb.createAddRule();
		});
		$("#healthAllocation1").live('click',function(){
			console.log("show");
			lb.createAddRule();
		});
		if($("#load_balancing_content").hasClass("active")){
			$("#details").removeClass("show");
			$("#details").addClass("hide");
		}
		$("#load_balancing_tab").live('click',function(){
			if($("#load_balancing_content").hasClass("active")){
				$("#details").removeClass("show");
				$("#details").addClass("hide");
			}
		});

		$("#certificate_management_tab").live('click',function(){
			if($("#certificate_management_tab").hasClass("active")) {
				$("#details").removeClass("hide");
				$("#details").addClass("show");
			}
		});





	},

	getFee : function(){
		if(CommonEnum.offLineBill)return;
		var period = lb.createPeridInput.getValue();
		//如果是年，period * 12
		if(3 == $("#billType .selected").attr("data-value")){
			period = period * 12;
		};
		var param = {
				"period":period,
				"productPropertyList":[									
				    {
				    		"muProperty":"loadBalancePrice",
							"muPropertyValue":'1',
							"productId":product.productId
					}
					] 
				}
			Dcp.biz.apiAsyncRequest("/pm/queryCaculateFeeByPrtyList",param, function(data) {
				if(0 == data.code){
					var count = lb.createPeridInput.getValue();
					var fee =  data.data.fee;
					$("#feeInput").val(fee/1000);
					$(".price").html(fee/1000);
				}
			});
	},
    //lb_an
	createLbShow : function(){
		lb.initWizard();
		/*  //查询协议
		CommonEnum.initProtocol(function(data){			
			CommonEnum.protocol = $.parseJSON(data);	
			var pDom = '';
			$.each(CommonEnum.protocol, function(i) {
				pDom +='<option value="'+i+'">'+CommonEnum.protocol[i]+'</option>';
			});
			$("#monitorProtocol").empty().append(pDom);
		});
		//查询负载方式
		CommonEnum.initLoopType(function(data){
			CommonEnum.loopType = $.parseJSON(data);
			var lDom = '';
			//console.log(CommonEnum.loopType);
			$.each(CommonEnum.loopType, function(i) {					
				lDom +='<option value="'+i+'">'+CommonEnum.loopType[i]+'</option>';
			});	
			//console.log(lDom);
			$("#loopType").empty().append(lDom);
			//console.log($("#loopType").html());
		});
		//*/
		
		lb.createPeridInput = null;
		if (lb.createPeridInput == null) {
			var container = $("#perid").empty();				
			var max = 12;
			lb.createPeridInput = new com.skyform.component.RangeInputField(container, {
				min : 1,
				defaultValue : 1,
				max:max,
				textStyle : "width:137px"
			}).render();
			lb.createPeridInput.reset();
				
		};
		lb.getFee();
		
		$(".subFee").bind('mouseup',function(){
			setTimeout('lb.getFee()',100);
		});

		com.skyform.service.privateNetService.listAll(function(data){
			var dom = '';

			if(''!=''+data){	
				lb.subnet = data;
				$.each(data, function(i) {
					if(data[i].state=='using' || data[i].state=='running'){
						dom +='<option value="'+data[i].id+'">'+data[i].name+'</option>';
					}
				});	
				$("#vm_privatenetwork").empty().append(dom);
				
			}				
			else {
				$.growlUI(Dict.val("common_tip"), Dict.val("lb_no_alternative_private_network")); 				
			}
		});		
		if (lb.wizard == null){
			lb.wizard = new com.skyform.component.Wizard($("#wizard-createLB"));
			lb.wizard.onToStep = function(from,to){
				lb.getCurSubnet();
				if(null!=lb.curSubnet){
					//lb.curSubnet.ipSegments = "192.168.3.1";
//					$("#ipSegments_input_3").val(lb.getIpByDot(lb.curSubnet.ipSegments,3) );
				}
			};
            //lb_an  信息展示
			lb.wizard.onLeaveStep = function(from, to) {
				if(to==1){
					certificateAge.mrService.queryCertificate({"pool":$("#pool").val()},function onSuccess(data){//$("#pool").val()
						//console.log(data.length>0)
						if(data.length>0){
							$("#certificate_name").removeClass("hide");
							$("#certificate_name").addClass("show");
							var dom="";
							$.each(data, function(i) {
								dom +='<option value="'+data[i].id+'">'+data[i].NAME+'</option>';
								//console.log(dom)
							});
							$("#certificate").empty().append(dom);
						}else {
							$("#certificate_name").addClass("hide");
							$("#certificate_name").removeClass("show");
						}
					},function onError(msg){

					});
					if($("#loopType").val()=="APP_COOKIE"){
						$(".session").removeClass("hide");
						$(".session").addClass("show");
					}
					$("#loopType").change(function(){

						if($("#loopType").val()=="APP_COOKIE"){
							$(".session").removeClass("hide");
							$(".session").addClass("show");
							console.log("app")
						}else {
							$(".session").addClass("hide");
							$(".session").removeClass("show");
						}
					});
					$("#monitorProtocol").change(function(){
						if($("#loopType").val()=="APP_COOKIE"){
							$(".session").removeClass("hide");
							$(".session").addClass("show");
						}else {
							$(".session").addClass("hide");
							$(".session").removeClass("show");
						}
					});

				}
				if(to == 2){
				//清空优惠码
				$("#agentDemo").attr("style","display:none");
				$("#agentDemo").find("span[name$='Msg']").html("");
				var maxLink=$("#maxLink").val();
				var highAvailable=$("#highAvailable").val();
				var session=$("#session").val();
				var certificate=$("#certificate option").val();
				var obj = {};
				obj.name = $.trim($("#lbInsName").val());
				obj.period = lb.createPeridInput.getValue();
				
				var payType = $("#billType .selected").attr("data-value");
				switch(payType){
					case "0" :obj.payType = Dict.val("common_monthly");break;
					case "3" :obj.payType = Dict.val("common_annual");break;
					case "5" :obj.payType = Dict.val("common_vip_month");break; 
				}
				obj.price = $(".feeInput_div span").eq(0).text();



				
				obj.privateNet = $("#vm_privatenetwork option:selected").text();
				obj.protocol = $("#monitorProtocol option:selected").text();
				obj.port = $("#monitorPort").val();
				obj.loopType = $("#loopType option:selected").text();
					$("#max_Link").html($("#maxLink").val());
					$("#certificate_name_new").html($("#certificate option").val());
					$("#session_name").html($("#session").val());
					$("#high_Available").html($("#highAvailable").val());
				$.each(obj,function(key,value){
					$("#configForm").find("span[name='" + key + "']").text(value);
				})
			}
			/*if(to == 2){
				if(lb.curSubnet.ipSegments&&lb.curSubnet.ipSegments != ""&&lb.curSubnet.ipSegments != "-"){
        			var array = lb.curSubnet.ipSegments.split(".");
        			var range = array[0]+"."+array[1]+"."+array[2]+".2~254"
        			$(".range__").text("("+Dict.val("lb_fanwei")+range+")");
        		}
        		if(lb.curSubnet.cidr&&lb.curSubnet.cidr != ""){
        			   var obj = cidrToRangeByObject(lb.curSubnet.cidr);
				   	   var ip1 = obj.ip1[0];
				   	   var ip2 = obj.ip1[0] == "10"?(obj.ip2[0]==obj.ip2[1]?obj.ip2[0]:(obj.ip2[0]+"~"+obj.ip2[1])):(obj.ip2[0]);
				   	   var ip3 = obj.ip3[0]==obj.ip3[1]?obj.ip3[0]:(obj.ip3[0]+"~"+obj.ip3[1]);
				   	   var ip4 = obj.ip4[0]==obj.ip4[1]?obj.ip4[0]:(obj.ip4[0]+"~"+obj.ip4[1]);
				   	   var range = ip1+" . "+ip2+" . "+ip3+" . "+ip4;
				   	   $(".range__").text("("+Dict.val("lb_fanwei")+range+")");
        		}
			}*/
			};
			lb.wizard.onFinish = function(from,to) {				
				lb.createLb();					
				lb.wizard.close();
			};
			
		}
		lb.wizard.markSubmitSuccess();
		lb.wizard.reset();
		lb.wizard.render();
	},
	relationMrShow:function(){
		/*com.skyform.service.callApi('',params,function onSuccess(data){
			if(data&&data.length == 0){
				$.growlUI(Dict.val("common_tip"), "没有可用关联监控规则！"); 
		    } else {
		    	$("#mrModal").modal("show");
				if(lb.mrDataTable != null){
					lb.mrDataTable.updateData(data);
				} else {
					lb.mrDataTable =  new com.skyform.component.DataTable();
					lb.attachDataTable(data);
				}
			}				
		},function onError(msg){
			$.growlUI(Dict.val("common_tip"), "查询可用关联监控规则发生错误：" + msg); 
		});*/
		
		
		$('#mrModal').off('shown').on('shown', function () {	 
			var condation={"resourcePool":$("#pool").val()}
			com.skyform.service.LBMRService.listLbHealthMonitor(condation,function onSuccess(data){
				var tempdata=[];
				for(i=0;i<data.length;i++){
					if(data[i].state=="running"){
						tempdata.push(data[i]);
					}
				}
				if(lb.mrDataTable != null){
					lb.mrDataTable.updateData(tempdata);
				} else {
					lb.mrDataTable =  new com.skyform.component.DataTable();
					lb.attachDataTable(tempdata);
				}
			},function onError(msg){
		    	$.growlUI(Dict.val("common_tip"), Dict.val("lb_select_monitoring_rule_fails") + msg); 
		    });
	      });
		$("#mrModal").modal("show");

	},
	attachDataTable : function(data) {
		 lb.mrDataTable.renderByData("#mrTable", {
				"data" : data,
				"pageSize": 5,
				"columnDefs" : [
				     {title : "", name : "id"},
				     {title : Dict.val("common_name"), name : "instanceName"},
				     {title : Dict.val("common_state"), name : "state"},
				     {title : Dict.val("common_create_time"), name : "createDate"}
				],
				"onColumnRender" : function(columnIndex,columnMetaData,columnData) {
					 var text = columnData[''+columnMetaData.name] || "";
					 if(columnIndex ==0) {
						 text = "<input type='radio' name='ownMrId' value=' "+text+" '>";
					 }
					 if ("createDate" == columnMetaData.name) {
							try {
								var obj = eval('(' + "{Date: new Date("
										+ columnData.createDate + ")}" + ')');
								var dateValue = obj["Date"];
								text = dateValue.format('yyyy-MM-dd hh:mm:ss');
							} catch (e) {

							}
							return text;
						}
					 if ('state'==columnMetaData.name) {
							return com.skyform.service.StateService.getState("ip",
									columnData.state || columnData);
						}
					 return text;
				},
				"afterRowRender" : function(index,data,tr){
					if(index == 0) {
						$(tr).find("input[type='radio']").attr("checked", "checked");
					}
				}					
			});
	},
	// 保存监控规则
	createMR : function(){
		var lbsubscriptionId =  lb.getCheckedArr().attr("value");
		var lbLbHealthMonitorId = $("#mrTable input[type='radio']:checked").val().trim();
		if(lbsubscriptionId==null||lbsubscriptionId==undefined||lbLbHealthMonitorId==null){
			$.growlUI(Dict.val("common_tip"), Dict.val("common_please_choose_a_record"));
			return;
		}
		var params={
				lbsubscriptionId :lbsubscriptionId,
				lbLbHealthMonitorId:lbLbHealthMonitorId
		};
		lb.mrService.associateLbHealthMonitor(params,function onSuccess(data){
			$.growlUI(Dict.val("common_tip"), Dict.val("lb_monitoring_rule_association_being_created_please_wait")); 
			lb.updateDataTable();
		},function onError(msg){
	    	$.growlUI(Dict.val("common_tip"), Dict.val("lb_monitoring_association_rule_fails") + msg); 
	    });
		$("#mrModal").modal("hide");
		
	},
	// 创建LB  lb_an
	createLb : function() {		
		var isSubmit = true;
		var instanceName = $.trim($("#lbInsName").val());
		var count = 1;
		var storageSize = $.trim($("#amount").val());
		var account = $("#user_name").val();
		var monitorName = $.trim($("#lbInsName").val()); //'Monitor';
		var monitorProtocol = $("#monitorProtocol").val();
		var monitorPort = $("#monitorPort").val();
		var loopType = $("#loopType").val();
		var network = $("#vm_privatenetwork").val();
        var maxLink=$("#maxLink").val();
		var sessionName=$("#session").val();
		var certificateId=$("#certificate").val();
		var params={};


        if($("#highAvailable option").val()=="是"){
            highAvailble_type="1";

        }else {
            highAvailble_type="0";
        }
		
		
		$("#lbInsName, #amount").jqBootstrapValidation();
		
		var scoreReg = /^[\u4E00-\u9FA0A-Za-z\-0-9\_]+$/;
		if(! scoreReg.exec(instanceName)) {
			$("#tipCreateLbName").text(Dict.val("common_name_contains_illegal_characters"));
			$("#lbInsName").focus();
			isSubmit = false;
		}else{
			$("#tipCreateLbName").text("");
		}
						
		if (!isSubmit) {
			return;
		}

		// TODO 加入输入合法性校验  ,对于portal,获取登录的用户赋值给ownUserId，目前写死测试值1115
		var period = lb.createPeridInput.getValue();
		//如果是年，period * 12
		if(3 == $("#billType .selected").attr("data-value")){
			period = period * 12;
		};
		if($("#certificate_name").hasClass("hide")&&$(".session").hasClass("hide")){
			params = {
				"period":period,
				"count":1,
				"productList":[{
					"instanceName" : instanceName,
					"network"  : network,
					"name" : instanceName,
					"productId" : product.productId,
					"port" : monitorPort,
					"protocol" : monitorProtocol,
					"looptype" : loopType,
					"haMode":Number(highAvailble_type),
					"connectionLimit":Number(maxLink),
					"lbHealthMonitor":[{
						"name": "health",
						"instanceName": "health",
						"protocol":monitorProtocol,
						"maxRetryCount": "3",
						"monitorFrequency": "3",
						"timeoutPeriod": "3",
						"expectedResStatusCode": "200",
						"httpRequestMethod": "POST",
						"resourcePool": $("#pool").val(),
					}]
				}
				]
			};
		}else if($("#certificate_name").hasClass("show")&&$(".session").hasClass("hide")){
			params = {
				"period":period,
				"count":1,
				"productList":[{
					"instanceName" : instanceName,
					"network"  : network,
					"name" : instanceName,
					"productId" : product.productId,
					"port" : monitorPort,
					"protocol" : monitorProtocol,
					"looptype" : loopType,
					"haMode":Number(highAvailble_type),
					"certificateId":$("#certificate").val(),
					"connectionLimit":Number(maxLink),
					"lbHealthMonitor":[{
						"name": "health",
						"instanceName": "health",
						"protocol":monitorProtocol,
						"maxRetryCount": "3",
						"monitorFrequency": "3",
						"timeoutPeriod": "3",
						"expectedResStatusCode": "200",
						"httpRequestMethod": "POST",
						"resourcePool": $("#pool").val(),
					}]
				}
				]
			};
		}else if($("#certificate_name").hasClass("show")&&$(".session").hasClass("show")){
			params = {
				"period":period,
				"count":1,
				"productList":[{
					"instanceName" : instanceName,
					"network"  : network,
					"name" : instanceName,
					"productId" : product.productId,
					"port" : monitorPort,
					"protocol" : monitorProtocol,
					"looptype" : loopType,
					"haMode":Number(highAvailble_type),
					"sessionName":sessionName,
					"certificateId":$("#certificate").val(),
					"connectionLimit":Number(maxLink),
					"lbHealthMonitor":[{
						"name": "health",
						"instanceName": "health",
						"protocol":monitorProtocol,
						"maxRetryCount": "3",
						"monitorFrequency": "3",
						"timeoutPeriod": "3",
						"expectedResStatusCode": "200",
						"httpRequestMethod": "POST",
						"resourcePool": $("#pool").val(),
					}]
				}
				]

			};
			console.log(params)
		}else if($("#certificate_name").hasClass("hide")&&$(".session").hasClass("show")){
			params = {
				"period":period,
				"count":1,
				"productList":[{
					"instanceName" : instanceName,
					"network"  : network,
					"name" : instanceName,
					"productId" : product.productId,
					"port" : monitorPort,
					"protocol" : monitorProtocol,
					"looptype" : loopType,
					"haMode":Number(highAvailble_type),
					"sessionName":sessionName,
					"connectionLimit":Number(maxLink),
					"lbHealthMonitor":[{
						"name": "health",
						"instanceName": "health",
						"protocol":monitorProtocol,
						"maxRetryCount": "3",
						"monitorFrequency": "3",
						"timeoutPeriod": "3",
						"expectedResStatusCode": "200",
						"httpRequestMethod": "POST",
						"resourcePool": $("#pool").val(),
					}]
				}
				]
			};

		}

		if(this.rules.length>0){
			params.productList[0].backendmember = [];
			$(this.rules).each(function(i,rule){	
				var item = {
					"name" :rule.name,
					"port" : rule.port,
					"protocol" : rule.protocol
				} 
				params.productList[0].backendmember.push(item);
			});
		}
		/*if(sessionName!=""){
			params.productList[0].sessionName = [];
			var item={
				"name":"sessionName",
				"port":sessionName,
				"protocol" : protocol
			}
			params.productList[0].sessionName.push(item);
		}*/
		/*if(certificateId!=""){
			params.productList[0].certificateId = [];
			var item={
				"name":"certificateId",
				"port":certificateId,
				"protocol" : protocol
			}
			params.productList[0].certificateId.push(item);
		}*/
		//this.getFormData(params);
		var agentId = $("#agentId").val();
		var _fee = $("#feeInput").val();
		if(agentId&&agentId.length>0){
			com.skyform.service.channelService.checkAgentCode(agentId,function(data){
				if("-3" == data){
					$("#agentMsg").html(Dict.val("common_discount_code_no_exist"));								
				}
				else if("-2" == data||"-1" == data){
					$("#agentMsg").html(Dict.val("common_discount_code_expired"));	
				}else if("-6" == data){
					$("#agentMsg").html(Dict.val("common_coupons_reached_maximum_number"));
				}else if("-4" == data){
					$("#agentMsg").html(Dict.val("common_discount_code_authing"));
				} else if("-5" == data){
					$("#agentMsg").html(Dict.val("common_discount_code_unauthed"));
				} else if("-7" == data){
					$("#agentMsg").html(Dict.val("common_discount_code_noavailable"));
				}
				else {
					var channel = com.skyform.service.channelService.channel;
					channel.serviceType = CommonEnum.serviceType["lb"];
					channel.agentCouponCode = agentId;
					channel.period = params.period;
					channel.productList[0].price = _fee;			
					channel.productList[0].productId = params.productList[0].productId;				
					channel.productList[0].serviceType = CommonEnum.serviceType["lb"];
					channel.productList[0].productDesc = params.productList[0];
					
//					com.skyform.service.channelService.wizardConfirmChannelSubmit(channel,lb.wizard, function onSuccess(data){
//						$.growlUI(Dict.val("common_tip"), "订单已提交，请等待审核通过后完成支付！您可以在用户中心->消费记录中查看该订单信息。");
//						lb.wizard.markSubmitSuccess();
//						lb.updateDataTable();
//					},function onError(msg){
//						$.growlUI(Dict.val("common_tip"), "订单提交失败！");
//						wizard.markSubmitError();
//					});
					com.skyform.service.channelService.channelSubmit(channel, function onSuccess(data){
						var _tradeId = data.tradeId;
						var disCountFee = data.fee;
						com.skyform.service.BillService.wizardConfirmTradeSubmit(disCountFee,_tradeId,lb.wizard, function onSuccess(data){
							$.growlUI(Dict.val("common_tip"), Dict.val("lb_being_create_lb")); 
							// refresh	
							$("#lbInsName").html("");
							$("#monitorPort").html('');
							lb.wizard.markSubmitSuccess();
							lb.updateDataTable();
						},function onError(msg){
							$.growlUI(Dict.val("common_tip"), Dict.val("lb_create_lb_error") + msg);
//							wizard.markSubmitError();
						});
					},function onError(msg){
						$.growlUI(Dict.val("common_tip"), Dict.val("lb_create_filing_error") + msg);
						wizard.markSubmitError();
					});
				}
			});
		}
		else {
			Dcp.biz.apiRequest("/trade/createLbVolumes", params, function(data) {
				if (data.code == "0") {
					var _tradeId = data.data.tradeId;
					com.skyform.service.BillService.wizardConfirmTradeSubmit(_fee,_tradeId,lb.wizard, function onSuccess(data){
						$.growlUI(Dict.val("common_tip"), Dict.val("lb_being_create_lb")); 
						// refresh	
						$("#lbInsName").html("");
						$("#monitorPort").html('');
						lb.wizard.markSubmitSuccess();
						lb.updateDataTable();
					},function onError(msg){
						$.growlUI(Dict.val("common_tip"), Dict.val("lb_create_lb_error") + msg);
//						wizard.markSubmitError();
					});
				} else {
					lb.wizard.markSubmitError();
					$.growlUI(Dict.val("common_tip"), Dict.val("lb_create_lb_error") + data.msg);
				}
			},function(error){
				ErrorMgr.showError(error);
			});
		}
		
		lb.wizard.reset();
		lb.wizard.render();
	},

	
	
	//增删Lb后端服务器
	modifyLbVM : function(){
		//先清除再批量创建//		
//		Dcp.biz.apiRequest("/instance/lb/destroylbRule", {id : lb.modifyLbRuleVM}, function() {
//			//lb.describeLbRule();
//			$.growlUI(Dict.val("common_tip"), "成功修改负载均衡后端服务器！");  
//			$("#modifyLbRule").modal("hide");
//		},function onError(){
//			lb.generateTable();
//		});
		
		param["hostIds"] = lb.lbId;
		$(this.rules_Modify).each(function(i,rule){			
			param["id"] = lb.modifyLbRuleVM;			
			param["firewallRules.rules["+i+"].name"] = rule.name;
			param["firewallRules.rules["+i+"].port"] = rule.port;
			param["firewallRules.rules["+i+"].protocol"] = rule.power;
			
		});
		
		
		Dcp.biz.apiRequest("/instance/lb/modifyLbRule", param, function() {				
			//lb.describeLbRule();
			$.growlUI(Dict.val("common_tip"), Dict.val("lb_being_modify_lb_port"));  
			$("#modifyLbRule").modal("hide");
			window.currentInstanceType = "lb"; 
			var wait = setTimeout(function(){ 
//				alert("999");
            },1000); 
			lb.updateDataTable(lb.modifyLbRuleVM);
			
			
		},function onError(){
			lb.generateTable();
		});	
		
	},
	refreshModifyLbVM: function(){
		//console.log(lb.subResh);
		lb.modifyLbRule(lb.subResh);
	},
	addModifyLbVM : function(){	
		
		var name = $("#ipSegments_modify_1").val()+"."+$("#ipSegments_modify_2").val()
					+"."+$("#ipSegments_modify_3").val()+"."+$("#ipSegments_modify_4").val();
		var port = $("#vmPort_modify").val();	
		var power = $("#vmPower_modify").val();
		
		var ruleVM = {
				"rules":[{
					"firewall_id": lb.lbId,
					"hostIds":hostIds,
					"name":name,
					"port":port,
					"protocol":power
				}]

		};
		var _ip_ = $("#ipSegments_modify_1").val()+"."
			+$("#ipSegments_modify_2").val()+"."
			+$("#ipSegments_modify_3").val()+"."
			+$("#ipSegments_modify_4").val();
		if(this.validate(ruleVM.rules[0],"modifyLbRule",_ip_)) {
			                                //createRuleById
			Dcp.biz.apiRequest("/instance/lb/createBackendmember", ruleVM, function(data) {	
				if (data.code != "0") {
					$.growlUI(Dict.val("common_tip"), Dict.val("lb_select_lb_port_error") + data.msg); 
				} else {
					ruleVM.id = this.id++;
					//this.rules_Modify.push(ruleVM);
		
					var newRow = $(
							"<tr ruleId='" + ruleVM.id + "'>"+
							"<td>" + ruleVM.rules[0].name + "</td>" + 
							"<td>" + ruleVM.rules[0].port + "</td>" + 	
							"<td>" + ruleVM.rules[0].protocol + "</td>" + 
							"<td>"+Dict.val("common_processing")+"</td>"+
							"<td></td>"+
							"</tr>"		
					);			
					
					newRow.find(".btn-del").unbind().click(function(){		
						lb.deleteRule2(ruleVM.id);
					});
					
					newRow.insertBefore($("#formTr_modify"));
					
					$("#vmPort_modify").val("");
					$("#vmPower_modify").val("");
				}
			});			
		}
		
	},
	initWizard:function(){
		this.rules=[];
		this.container = $("#lbRule");
		this.container.find("tr[id != 'formTr'][id != 'errorInfoRow']").remove();
		$("#lbInsName").html("");
		$("#agentMsg").html("");
		$("#tip_lbInsName").html("*");
		$("#tip_monitorPort").html("*");
		$("#monitorPort").html('');
		
		$("#agentId").focus(function(){
			$("#agentMsg").html("");
		});
		$("#useAgentBtn").unbind("click").bind("click", function() {
			//该方法在agentCommon.js里
			com.skyform.agentService.getAgentCouponFeeInfo("lb");
		});	
		$("#lbInsName").focus(function(){
			$("#tip_lbInsName").html("*");
		});
		$("#monitorPort").focus(function(){
			$("#tip_monitorPort").html("*");
		});
	},
	lbAddvm : function(){				
		var name =$("#ipSegments_input_1").val()+"."+$("#ipSegments_input_2").val()
		+"."+$("#ipSegments_input_3").val()+"."+$("#ipSegments_input_4").val();
		var port = $("#vmPort").val();	
		var power = $("#vmPower").val();
		//console.log("quanzhong="+power);
		var ruleVM = {
			"name" : name,
			"port" : port,		
			"protocol" : power
		};
		var _ip_ = $("#ipSegments_input_1").val()+"."
			+$("#ipSegments_input_2").val()+"."
			+$("#ipSegments_input_3").val()+"."
			+$("#ipSegments_input_4").val();
		if(this.validate(ruleVM,"lbRule",_ip_)) {
			ruleVM.id = this.id++;
			this.rules.push(ruleVM);

			var newRow = $(
					"<tr ruleId='" + ruleVM.id + "'>"+
					"<td>" + ruleVM.name + "</td>" + 
					"<td>" + ruleVM.port + "</td>" + 	
					"<td>" + ruleVM.protocol + "</td>" + 
					"<td><a class='btn btn-del btn-danger '>"+Dict.val("common_remove")+"</a></td>"+
					"</tr>"		
			);			
			
			newRow.find(".btn-del").unbind().click(function(){		
				lb.deleteRule(ruleVM.id);
			});
			
			newRow.insertBefore($("#formTr"));
			
			$("#vmPort").val("");
			$("#vmPower").val("");			
		}
		
	},
	
	modifyLbRule : function(id){
		lb.rules_Modify = [];
		lb.modifyLbRuleVM = id;
		
		Dcp.biz.apiRequest("/instance/lb/describeLbRule", {lbid:parseInt(id)}, function(data) {
			if (data.code != "0") {
				$.growlUI(Dict.val("common_tip"), Dict.val("lb_select_lb_port_error") + data.msg); 
			} else {
				if(data.data.length > 0&&data.data!="[]" ){
					if(typeof(data.data)=="string")	var test=$.parseJSON(data.data);
					else var test = data.data;
					lb.lbId =test[0].id;
					//lb.refreshFirewall(id);
					Dcp.biz.apiRequest("/instance/lb/describeLbRuleVM", {firewallId:lb.lbId}, function(data) {
						if (data.code != "0") {
							$.growlUI(Dict.val("common_tip"), Dict.val("lb_select_lb_port_error") + data.msg); 
						} else {	
							$("#lbRule_modify").html('<input type="hidden" id="modifyHost" value="'+id+'">');
							for (var i = 0; i < data.data.length; i++) {
								var state = ''+data.data[i].state;
								var stateMsg = ''
								//console.log('lbRule_modify state='+data.data[i].state);
								if('success' == state){
									stateMsg = Dict.val("common_success");
								}else if('failed' == state){
									stateMsg = Dict.val("common_failure");
								}else if('opening' == state){
									stateMsg = Dict.val("common_processing");
								}else if('unbinding' == state){
									stateMsg = Dict.val("common_unbundling");
								}else if('unbindfailed' == state){
									stateMsg = Dict.val("common_unbund_failure");
								}else{
									stateMsg = '';
								}
								//console.log('lbRule_modify2 state='+state);
								var dom = ''								
									+'<tr ruleid="'+ data.data[i].id +'">'
									+'	<td>'+ data.data[i].name +'</td>'
									+'	<td>'+ data.data[i].port +'</td>'
									+'  <td>'+ data.data[i].protocol +'</td>'
									+'  <td>'+ stateMsg +'</td>';
								if('opening' == state || 'unbinding' == state){
									dom = dom+'  <td></td>';
								}else{
									dom = dom+'  <td><a class="btn btn-del btn-danger " onclick="lb.deleteRuleModify('+ data.data[i].id +')">'+Dict.val("common_remove")+'</a></td>';
								}
									dom = dom+'</tr>';
								$("#lbRule_modify").append(dom);					
									
								var ruleVM = {
									"firewallId" : lb.lbId,	
									"id"    : data.data[i].id,
									"name"  : data.data[i].name,
									"port"  : data.data[i].port,		
									"power" : data.data[i].protocol
								};	
								
								lb.rules_Modify.push(ruleVM);
									
							} 
							var dom2 = ''
								+'<tr id="formTr_modify">'
								+'	<td>'
								+'<div id="form_privatenetwork_ipSegments" class="address">'	
			    				+'<input id="ipSegments_modify_1" class="ip input-ip" type="text"></input>'
									+'<span class="dot"></span>'
									+'<input id="ipSegments_modify_2" class="ip input-ip" type="text"></input>'
									+'<span class="dot"></span>'
									+'<input id="ipSegments_modify_3" class="ip input-ip disabled" type="text"></input> '   							
									+'<span class="dot"></span>'
									+'<input id="ipSegments_modify_4" class="ip ip_network input-ip" maxlength="3" type="text"></input> '   								
								+'</div>'
								//+'		<input id="vmName_modify" class="input" style="width:180px"type="text" placeholder="内网IP"></input>'
								+'	</td>'
								+'	<td><input type="text" id="vmPort_modify" class="ip input-ip" maxlength="5" style="width:40px" /></td>'								
								+'	<td><input type="text" id="vmPower_modify" maxlength="2" class="ip input-ip" style="width:40px" /></td>'
								+'  <td></td>'
								+'	<td>'
								+'		<a class="btn btn-success btn-add" id="lbRefreshvm" onclick="lb.refreshModifyLbVM()">'+Dict.val("common_refresh")+'</a>'
								+'		<a class="btn btn-success btn-add" id="lbAddvm" onclick="lb.addModifyLbVM()">'+Dict.val("common_add")+'</a>'
								+'	</td>'
								+'</tr>'
								+'<tr id="errorInfoRow">'
								+'	<td colspan="4">'
								+'		<span class="text-error" id="errorInfo"></span>'
								+'	</td>'
								+'</tr>';
															
							$("#lbRule_modify").append(dom2);	
						}
					},function onError(){
						lb.generateTable();
					});	
				
				}				
			}
		});

	
	},	
	refreshFirewall : function(lbId){
		AutoUpdater.stop();
		AutoUpdater.parentid = lbId;
		if($("#modifyLbRule").attr("class").indexOf("in")==-1){
			window.currentInstanceType='lb';
		}
		else window.currentInstanceType='lb_member';
		AutoUpdater.start();
	},
	deleteRuleModify:function(id) {	
		var row = $("#lbRule_modify tr[ruleid='"+id+"']");
		//console.log(row.td[3]);
		Dcp.biz.apiAsyncRequest("/instance/lb/deleteBackendmember", {ruleId:id}, function(data) {			
			if(0 == data.code){
				$("#lbRule_modify").find("tr[ruleId='"+id+"']").remove();
				return false;
			}
		});
	},	
	
	deleteRule2 : function(id) {
		 
		var self = this;
		$(this.rules_Modify).each(function(i,_rule) {
			if(_rule.id == id) {
				self.rules_Modify.splice(i,1);
				$("#lbRule_modify").find("tr[ruleId='"+id+"']").remove();
				return false;
			}
		});
	},	

	deleteRule:function(id) {		
		var self = this;
		$(this.rules).each(function(i,_rule) {
			if(_rule.id == id) {
				self.rules.splice(i,1);
				$("#lbRule").find("tr[ruleId='"+id+"']").remove();
				return false;
			}
		});
	},		

	validate : function(rule,dom,segment) {
		var result = true;
		var errorMsg = "";
		var ip = $.trim(rule.name);
//		if(!valiter.isIp(ip)){
//			errorMsg += "IP输入格式不正确！";
//			result = false;
//		}
//		else if(!lb.chaeckIpInVlan(lb.getIpByDot(lb.curSubnet.ipSegments,4),254,lb.getIpByDot(ip,4))){
//			errorMsg += "IP不在Vlan内！";
//			result = false;
//		}
		if(lb.curSubnet.ipSegments&&lb.curSubnet.ipSegments != ""&&lb.curSubnet.ipSegments != "-"){
			var array = lb.curSubnet.ipSegments.split(".");
			var array2 = ip.split(".");
			if(array[0] != array2[0]
			||array[1] != array2[1]
			||array[2] != array2[2]
			||Number(array2[3]) < 2
			||Number(array2[3]) > 254){
				errorMsg += Dict.val("common_iP_is_not_within_vlan");
				result = false;
			}
		}
		if(lb.curSubnet.cidr&&lb.curSubnet.cidr != ""){
			var ip_ = ip;
			if(!checkIpInCIDR(ip_,lb.curSubnet.cidr)){
				errorMsg += Dict.val("common_iP_is_not_within_vlan");
				result = false;
			}
		}
		if(!/^[1-9]+[0-9]*$/.test("" + rule.port)) {
			errorMsg += Dict.val("common_invalid_port_number");
			result = false;
		}  	
		if(!/^[1-9]+[0-9]*$/.test("" + rule.protocol)) {
			errorMsg += Dict.val("common_invalid_weight_value");
			result = false;
		}  
		if(!result) {
			$("#"+dom+" #errorInfo").html(errorMsg);
			$("#"+dom+" #errorInfoRow").show();
		} else {
			$("#"+dom+" #errorInfoRow").hide();
		}
		return result;
	},
	//lb_an
	generateTable : function(data){
		lb.datatable = new com.skyform.component.DataTable();
		 lb.datatable.renderByData("#lbTable", {
				"data" : data,
				"columnDefs" : [
				     {title : "<input type='checkbox' id='checkAll'>", name : "id"},
				     {title : "ID", name : "id"},
				     {title : Dict.val("common_service_name"), name : "instanceName"},
				     {title : Dict.val("common_state"), name : "state"},
				     {title : Dict.val("common_protocol"), name : "protocol"},
					 {title : Dict.val("lb_balanced_way"), name : "looptype"},
				     {title : Dict.val("common_port"), name : "port"},
				     {title : Dict.val("common_ip_address"), name : "address"},
				     {title : Dict.val("common_create_time"), name : "createDate"},
				     {title : Dict.val("common_expire_time"), name : "expireDate"}
				     
				],
				"pageSize" : 5,
				"onColumnRender" : function(columnIndex,columnMetaData,columnData) {
					 var text = columnData[''+columnMetaData.name] || "";
					 if(columnIndex ==0) {
						 text = '<input type="checkbox" value="'+text+'">';
					 }
					 if (columnMetaData.title == "ID") {
						 text = text;						 
					 }
					 if (columnMetaData.name == "state") {
						 //text = lb.volumeState[text];
						 text = com.skyform.service.StateService.getState("lb",text);
					 }
					 if(columnMetaData.name == "protocol"){
						text = CommonEnum.protocol[text];
					 }
					 if(columnMetaData.name == "looptype"){
						 text = CommonEnum.loopType[text];
					 }
					 if (columnMetaData.name == "createDate") {
						 //text = new Date(text).toLocaleString();
						  //console.log(columnData.createDate);
						  if(columnData.createDate == '' || columnData.createDate == 'undefined'){
						  	return '';
						  }
						 try {
								var obj = eval('(' + "{Date: new Date(" + text + ")}" + ')');
								var dateValue = obj["Date"];
								text = dateValue.format('yyyy-MM-dd hh:mm:ss');
							} catch (e) {
						    }
					 }
					 if (columnMetaData.name == "expireDate") {
						 //text = new Date(text).toLocaleString();
						  //console.log(columnData.expireDate);
						  if(columnData.expireDate == '' || columnData.expireDate == 'undefined'){
						  	return '';
						  }
						 try {
								var obj = eval('(' + "{Date: new Date(" + text + ")}" + ')');
								var dateValue = obj["Date"];
								text = dateValue.format('yyyy-MM-dd hh:mm:ss');
							} catch (e) {
						    }
					 }
					 if(columnMetaData.name == "instanceName"){
						 text = columnData.instanceName
						        +"<a title='"+Dict.val("common_advice")+"' " +
						        		"href='../user/workOrder.jsp?code=workOrder&cataCode=service" +
						        		"&instanceId="+columnData.id+"&serviceType=lb" +
						        				"&instanceName="+encodeURIComponent(columnData.instanceName)+
						        				"&instanceStatus="+columnData.state+"" +
						        				"&currentPoolW="+encodeURIComponent(CommonEnum.pools[CommonEnum.currentPool])+
						        		"'><i class='icon-comments' ></i></a>";
					 }
					 return text;
				}, 
				"afterRowRender" : function(rowIndex,data,tr){
					tr.attr("state", data.state).attr("comment", data.comment);
					tr.attr("ownUserId", data.ownUserId);
					tr.attr("instanceId",data.id);
					//lb.bindEventForTr(rowIndex, data, tr);					
					tr.find("input[type='checkbox']").click(function(){
						lb.checkSelected();
			        });
//					tr.unbind().bind('mousedown',function(){
//						//console.log("tr.click="+data.id);
//						lb.describeLbRuleById(data.id);
//						lb.getOptLog(data.id);
//					});
					tr.click(function(){
						//console.log("tr.click="+data.id);
						lb.describeLbRuleById(data.id);
						lb.getOptLog(data.id);
					});					
				},      
				"afterTableRender" : function() {
					lb.bindEvent();
					if(!lb.contextMenu) {
						lb.contextMenu = new ContextMenu({
							beforeShow : function(tr){
								lb.checkAll(false);
								tr.find("input[type='checkbox']").attr("checked",true);
							},
							onAction : function(action) {
								lb._invokeAction(action);
							},
							afterShow : function(tr) {
								lb.checkSelected({
									instanceName : tr.attr("instancename"),
									id : tr.attr("instanceid"),
									state : tr.attr("state")
								});
							},
							trigger : "#lbTable tr"
						});
					}else {
						lb.contextMenu.reset();
					}
				}
		});
		 lb.datatable.addToobarButton("#toolbar4tb2");
		 lb.datatable.enableColumnHideAndShow("right");		 
	},
	checkAll : function(check){
		if(check) $("#lbTable tbody input[type='checkbox']").attr("checked",true);
		else $("#lbTable tbody input[type='checkbox']").removeAttr("checked");
		
		lb.checkSelected(false);
	},
	bindEventForTr : function(rowIndex, data, tr) {

	},
	healthAllocation : function(){
		$("#_monitorFrequency,#_timeoutPeriod").unbind("focus").bind("focus",function(){
			if($(".tipMonitorFrequency").is(":visible")){$(".tipMonitorFrequency").hide()}
		});
		var ids = $("#lbTable tbody input[type='checkbox']:checked");
		var protocol=$("#lbTable tbody input[type='checkbox']:checked").parents("tr").find("td[name=protocol]").html();
		//console.log(protocol);
		if(ids.length == 1){
			//lb_fan 查询健康检查配置
			Dcp.biz.apiRequest("/trade/queryLbHealthMonitorByLb",{"subscriptionId":Number(ids.val())},function onSuccess(data){
				lb.renderingModalData=data;
				subscriptionId=data.data[0].subscriptionId
				lb.renderingModal(lb.renderingModalData);
				//console.log(subscriptionId);
			},function onError(msg){
				//console.log(msg)
			});
		} else {
			//$.growlUI(Dict.val("common_tip"), Dict.val("lb_can_only_modify_a_lb_operation_please_reselect"));
		}
		if(protocol=="HTTP" || protocol=="HTTPS" || protocol == ""){
			$(".conceal").show();
			//console.log("show")
		}else{
			$(".conceal").hide();
			//console.log("hide")
		}
		$("#healthModal").modal("show");
		$("#health_save").unbind("click").bind("click",function(){
			var m=Number($("#_monitorFrequency").val());
			var t=Number($("#_timeoutPeriod").val());
			var expectedResStatusCode=$("#_expectedResStatusCode").val();
			/*if( 200<=Number($("#_expectedResStatusCode").val())<=201){

				$("button#health_save").unbind("click",function(){

				});
				$("#tipExpectedResStatusCode").addClass("icon-exclamation-sign text-error").html("预期响应状态码应为200或201");
				console.log("die")
			}else {*/
				if( m >= t){
					//console.log(m)
					//console.log(t)
					//lb_fan 更新健康检查配置
					var params=lb.getParmas();
					Dcp.biz.apiRequest("/instance/lb/modifyLbHealthMonitor",params,function onSuccess(data){

					},function onError(msg){

					});
					$("#healthModal").hide();
					$(".modal-backdrop").hide();
				}else {
					$(".tipMonitorFrequency").show();
				}
			/*}*/


		});

	},
	//lb_fan 获得查询健康检查配置数据渲染modal框
	renderingModal:function(data){
		$("#_protocol").val(data.data[0].protocol);
		$("#_maxRetryCount").val(data.data[0].maxRetryCount);
		$("#_expectedResStatusCode").val(data.data[0].expectedResStatusCode);
		var method=data.data[0].httpRequestMethod;
		//console.log(method)
		if(method =="GET"){
			$("#_httpRequestMethod_GET").attr("checked",true);
		}else{
			$("#_httpRequestMethod_POST").attr("checked",true);
		}
		$("#_requestAddress").val(data.data[0].requestAddress);
		var tyPe=data.data[0].noticeType;
		//console.log(tyPe)
		if(tyPe == "0"){
			$("#_noticeType_SMS").attr("checked",true);
		}else if(tyPe == "1"){
			$("#_noticeType_mail").attr("checked",true);
		}else{

		}

	},
	//lb_fan 修改健康检查配置获取参数
	getParmas:function(){
		var _protocol=$("#_protocol").val();
		var ids = $("#lbTable tbody input[type='checkbox']:checked").val();
		var _maxRetryCount=$("#_maxRetryCount").val();
		var _monitorFrequency=$("#_monitorFrequency").val();
		var _timeoutPeriod=$("#_timeoutPeriod").val();
		var _expectedResStatusCode=$("#_expectedResStatusCode").val();
		var _requestAddress=$("#_requestAddress").val();
		var httpRequestMethod =$("input[type='radio'][name='questMed']:checked").val();
		var noticeTypeVal="";
		$("input[type='checkbox'][name='noticeType']:checked").each(function(){
			noticeTypeVal+=$(this).val()+",";
		});
		if(noticeTypeVal.length>0){
			noticeTypeVal=noticeTypeVal.substring(0,noticeTypeVal.length-1);
		}
		if(noticeTypeVal=="SMS"){
			noticeTypeVal="0"
		}else {
			noticeTypeVal="1";
		}

		var params="";
		if(_protocol=="HTTP" || _protocol=="HTTPS"){
			params={
				"productList":
						[
							{
								"productId": 9009,             //产品ID
								"subscriptionId": subscriptionId+"",    //健康检查ID
								"protocol": _protocol,           //监听协议
								"maxRetryCount": _maxRetryCount,         //失败重试次数
								"monitorFrequency": _monitorFrequency,       //监控频率
								"timeoutPeriod": _timeoutPeriod,			//超时时间
								"expectedResStatusCode": _expectedResStatusCode, //预期响应状态码
								"httpRequestMethod":httpRequestMethod, //HTTP请求方式
								"requestAddress": _requestAddress, //请求地址
								"noticeType": noticeTypeVal,                      //通知类型
								"resourcePool":$("#pool").val()          //资源池
							}
						]
			};
			return params;
		}else {
			 params={
				"productList":
						[
							{
								"productId": 9009,             //产品ID
								"subscriptionId": subscriptionId+"",    //健康检查ID
								"protocol": _protocol,           //监听协议
								"maxRetryCount": _maxRetryCount,         //失败重试次数
								"monitorFrequency": _monitorFrequency,       //监控频率
								"timeoutPeriod": _timeoutPeriod,			//超时时间
								"noticeType": noticeTypeVal,                      //通知类型
								"resourcePool": $("#pool").val(),         //资源池
							}
						]
			};
			return params;
		}
		//console.log(params)
	},
	//修改createAddRule
	createAddRule : function(){
		var rules="";
		var ruleId="";
		if(!lb.createModal){
			lb.createModal = new com.skyform.component.Modal(
					"id_create",
					"<h3>"+"后端服务器管理"+"</h3>",
					$("script#backendModal").html(),{
						buttons : [
							{
								name : "确定",
								onClick : function() {
									ruleId=[];
									if($("#leftTbody input").hasClass("vmID")){
										for (var i=0;i<$("#leftTbody input[type='checkbox']").length;i++){
											var val={
												"ruleId":Number($("#leftTbody input[type='checkbox']").eq(i).val())
											}
											ruleId.push(val);
											//console.log(ruleId)

										}
									}
									$("#bind_table input").change(function(){
										$(this).parents("tr").addClass("bind_new bind_un");
									});
									if($("#bind_table tr").hasClass("bind_un")){
										for (var i=0;i<$("#bind_table tr.bind_un").length;i++){
											var val={
												"ruleId":Number($("#bind_table tr.bind_un").eq(i).val())
											}
											ruleId.push(val);
											//console.log(ruleId)

										}
									}
									for(var i=0;i<ruleId.length;i++){
										Dcp.biz.apiRequest("/instance/lb/deleteBackendmember",ruleId[i],function onSuccess(data){

										},function onError(msg){
											//console.log(msg)
										});
									}
									rules={"rules":[]};
									var id=$("#lbTable input[type='checkbox']:checkbox").val();
									if($("#rightTbody1 input").hasClass("bind")){
										for(var i=0;i<$(".bind").length;i++){
											var val={
												"hostIds":id,
												"name":$("#rightTbody1 .bind").parents("tr").children("td").eq(2).children("input").val(),
												"port":$("#rightTbody1 .bind").parents("tr").children("td").eq(3).children("input").val(),
												"protocol":$("#rightTbody1 .bind").parents("tr").children("td").eq(4).children("input").val(),
												"vmId":$("#rightTbody1 .bind").parents("tr").children("td").eq(0).children("input").val(),
											}
											rules.rules.push(val);
										}
									}
									if($("#bind_table tr").hasClass("bind_new")){
										for(var i=0;i<$(".bind").length;i++){
											var val={
												"hostIds":id,
												"name":$("#bind_table .bind_new").children("td").eq(2).children("input").val(),
												"port":$("#bind_table .bind_new").children("td").eq(3).children("input").val(),
												"protocol":$("#bind_table .bind_new").children("td").eq(4).children("input").val(),
												"vmId":$("#bind_table .bind_new").children("td").eq(0).children("input").val(),
											}
											rules.rules.push(val);
										}
									}

									Dcp.biz.apiRequest("/instance/lb/createBackendmember",rules,function onSuccess(data){

									},function onError(msg){
										//console.log(msg)
									});

									lb.createModal.hide();
								},
								attrs : [ {
									name : 'class',
									value : 'btn btn-primary'
								} ]
							}, {
								name :"取消",
								attrs : [ {
									name : 'class',
									value : 'btn'
								} ],
								onClick : function() {
									lb.createModal.hide();
								}
							} ],
						afterShow : function(){
							lb.unbind_table();
							lb.bind_table();

						},
					});
		}
		lb.createModal.show();
		lb.createModal.setWidth(1200).autoAlign().setTop(60).show();
	},
	//unbind 渲染
	unbind:function(data){
		if(lb.datatable_un){
			//lb.datatable_un.unbind_table();
		}
			lb.datatable_un = new com.skyform.component.DataTable();
			lb.datatable_un.renderByData("#unbind_table", {
				"data" : data,
				"columnDefs" : [
					{title : "<input type='checkbox' id='checkAll_all_un'>", name : "vmId"},
					{title : "ID", name : "vmId"},
					{title : "云主机名称", name : "instanceName"},
					{title : "内网IP", name : "ip"},

				],
				"pageSize" : 5,
				"onColumnRender" : function(columnIndex,columnMetaData,columnData) {
					var text = columnData[''+columnMetaData.name] || "";
					if(columnMetaData.name=="vmId"){
						text="<input  type='checkbox' id='checkAll_all_un' style='width: 40px;'  name='item' value='"+columnData.vmId+"'>"
					}
					if(columnMetaData.name=="instanceName"){
						text="<input id='id"+columnData.vmId+"' value='"+text+"' disabled>"
					}
					if(columnMetaData.name=="ip"){
						text="<input id='ip"+columnData.vmId+"' value='"+text+"' disabled>"
					}
					return text;
				},
				"afterRowRender" : function(rowIndex,data,tr){

				},
			});

	},
	//bind渲染
	bind:function(data){
		if(lb.datatable_b){
			//lb.datatable_b.bind_table();
		}
			lb.datatable_b = new com.skyform.component.DataTable();
			lb.datatable_b.renderByData("#bind_table", {
				"data" : data,
				"columnDefs" : [
					{title : "<input type='checkbox' id='checkAll_all_b'>", name : "vmId"},
					{title : "ID", name : "vmId"},
					{title : "云主机名称", name : "vmName"},
					{title : "内网IP", name : "ip"},
					{title : "端口", name : "port"},
					{title : "权重", name : "weight"},

				],
				"pageSize" : 5,
				"onColumnRender" : function(columnIndex,columnMetaData,columnData) {
					var text = columnData[''+columnMetaData.name] || "";
					if(columnMetaData.name=="vmId"){
						text="<input type='checkbox' id='checkAll_all_un'   name='item1' value='"+columnData.id+"'>"
					}
					if(columnMetaData.name =="port"){
						text="<input class='"+columnData.id+"' value='"+text+"' type='text'>"
					}if(columnMetaData.name =="weight"){
						text="<input value='"+text+"' type='text'>"
					}if(columnMetaData.name=="vmName"){
						text="<input id='id"+columnData.id+"' value='"+text+"' value='"+columnData.id+"'  disabled >"
					}
					if(columnMetaData.name=="ipAddress"){
						text="<input id='ip"+columnData.id+"' value='"+text+"' disabled>"
					}
					return text;
				},
				"afterRowRender" : function(rowIndex,data,tr){

				},
			});
			//lb.datatable_b.addToobarButton("#toolbar4tb2");
			//lb.datatable_b.enableColumnHideAndShow("right");

	},
	//unbind table数据显示
	unbind_table:function(){
		Dcp.biz.apiRequest("/instance/lb/queryVmByLb", {"subscriptionId":Number(20401023)}, function(data) {
			lb.instances = data.data.all;
			lb.unbind(data.data.all);
			//console.log(data.data.all);
			lb.checkSelected();//初始化按钮置灰
		},function onError(){
			lb.unbind();
		});
	},
	//bind table数据显示
	bind_table:function(){

		Dcp.biz.apiRequest("/instance/lb/queryVmByLb", {"subscriptionId":Number(20401023)}, function(data) {
			lb.instances = data.data.bind;
			lb.bind(data.data.bind);
			lb.checkSelected();//初始化按钮置灰
		},function onError(){
			lb.bind();
		});
	},
	//后端服务器管理开始
	//移动左边表格的值到右边表格
	sendValueToRight:function(){
		var ary = new Array();
		var items = document.getElementsByName("item");
		for(var i = 0;i < items.length;i++){
			if(items[i].checked){
				//console.log(items[i].value);
				ary[i] = document.getElementById("id"+items[i].value).parentNode.parentNode.rowIndex;//保存下所选行的索引
				lb.moveValueOfLeft(items[i].value);//移值
				//console.log(items[i].value);
				$(".dataTables_empty").hide();
			}
		}
		for(var i = ary.length;i >0;i--){
			var leftTbody = document.getElementById("unbind_table");
			//左边表格的tbody
			//判断数组ary里的值是不是行索引
			if(!isNaN(ary[i-1])){
				//leftTbody.deleteRow(ary[i-1]-1);
				//移除表格的所选行
			}
		}
		//document.getElementById("check_all").checked = false;
		//全选复选框置为false
	},
	//移动左边表格的值到右边表格
	moveValueOfLeft:function(op){
		var wbid = document.getElementById("id"+op).value;
		var wbno = document.getElementById("ip"+op).value;

		var rightTbody = document.getElementById("rightTbody1");
		//右边表格的tbody
		var tr = document.createElement("tr");
		var td1 = document.createElement("td");
		var td2 = document.createElement("td");
		var td3 = document.createElement("td");
		var td4 = document.createElement("td");
		var td5 = document.createElement("td");
		//console.log(op)
		td1.innerHTML = "<input class='bind' type='checkbox' id='checkAll_all_un' name='item1' style='width: 50px;' value='"+op+"'>";
		//console.log(op)
		td2.innerHTML = "<input type='text' id='id"+wbid+"' value='"+wbid+"'>";
		td3.innerHTML = "<input type='text' id='ip"+wbid+"' value='"+wbno+"'>";
		td4.innerHTML = "<input type='text'>";
		td5.innerHTML = "<input type='text'>";
		tr.appendChild(td1);
		tr.appendChild(td2);
		tr.appendChild(td3);
		tr.appendChild(td4);
		tr.appendChild(td5);
		rightTbody.appendChild(tr);
	},
	//移动右边表格的值到左边表格
	sendValueToLeft:function(){
	var ary1 = new Array();
	var items = document.getElementsByName("item1");
	for(var i = 0;i < items.length;i++){
		if(items[i].checked){
			//先保存所选行的索引 在移除掉所选行
			ary1[i] = document.getElementById("id"+items[i].value).parentNode.parentNode.rowIndex;
			//保存下所选行的索引
			var rightTbody = document.getElementById("rightTbody1");
			if($("#rightTbody1 input").hasClass("bind")){
				//lb.moveValueOfRight1(items[i].value);//移值
				rightTbody.deleteRow(ary1[i-1]-1);
			}else {
				lb.moveValueOfRight(items[i].value);//移值
			}
		}
	}
	for(var i = ary1.length;i >0;i--){
		var rightTbody = document.getElementById("rightTbody1");
		//右边表格的tbody
		//判断数组ary里的值是不是行索引
		if(!isNaN(ary1[i-1])){
			rightTbody.deleteRow(ary1[i-1]-1);
			//移除表格的所选行
		}
	}
	//document.getElementById("check_all3").checked = false;
	//全选复选框置为false
	},
	//移动右边表格的值到左边表格
	moveValueOfRight:function(op){
		var wbid = document.getElementById("id"+op).value;
		var wbno = document.getElementById("ip"+op).value;
		var leftTbody = document.getElementById("leftTbody");
		//左边表格的tbody
		var tr = document.createElement("tr");
		var td1 = document.createElement("td");
		var td2 = document.createElement("td");
		var td3 = document.createElement("td");
		td1.innerHTML = "<input class='unbind' type='checkbox' id='check_one' name='item' value='"+wbid+"'>";
		td2.innerHTML = "<input type='text' id='id"+wbid+"' value='"+wbid+"'>";
		td3.innerHTML = "<input type='text' id='ip"+wbid+"' value='"+wbno+"'>";
		tr.appendChild(td1);
		tr.appendChild(td2);
		tr.appendChild(td3);
		leftTbody.appendChild(tr);
	},
	moveValueOfRight1:function (op){
		var wbid = document.getElementById("id"+op).value;
		var wbno = document.getElementById("ip"+op).value;
		var leftTbody = document.getElementById("leftTbody");
		//左边表格的tbody
		var tr = document.createElement("tr");
		var td1 = document.createElement("td");
		var td2 = document.createElement("td");
		var td3 = document.createElement("td");
		td1.innerHTML = "<input type='checkbox' id='check_one' name='item' value='"+wbid+"'>";
		td2.innerHTML = "<input type='text' id='id"+wbid+"' value='"+wbid+"'>";
		td3.innerHTML = "<input type='text' id='ip"+wbid+"' value='"+wbno+"'>";
		tr.appendChild(td1);
		tr.appendChild(td2);
		tr.appendChild(td3);
		leftTbody.appendChild(tr);
	},
	//后端服务器管理结束
	showInstanceInfo : function(instanceInfo) {
		$("div#details span.detail_value").each(function(i,item){
			var prop = $(this).attr("prop");
			$(this).html("" + instanceInfo[""+prop]);
		});
	},

	checkSelected : function(selectInstance) {
		$(".operation").addClass("disabled");
		var rightClicked = selectInstance?true:false;
		
		var allCheckedBox = $("#lbTable input[type='checkbox']:checked");
		
		var oneSelected = allCheckedBox.length == 1;
		var hasSelected = allCheckedBox.length > 0;
		
		
		$(".operation").addClass("disabled");
		
		var state = $(allCheckedBox[0]).parents("tr").attr("state");
		if(selectInstance) {
			state = selectInstance.state;
		}
		//var state = $("#lbTable tbody input[type='checkbox']:checked").parents("tr").attr("state");	
		$(".operation").each(function(index,operation){
			var condition = $(operation).attr("condition");			
			var action = $(operation).attr("action");
			var enabled = true;
			eval("enabled=("+condition+")");
			if(enabled) {
				$(operation).removeClass("disabled");
				//$(operation).removeAttr("disabled");
			} else {
				$(operation).addClass("disabled");
				//$(operation).attr("disabled","disabled");
			}
		});
		
		lb._bindAction();
		
		if(rightClicked) {
			lb.instanceName = selectInstance.instanceName;
			lb.selectedInstanceId = selectInstance.id;	
		} else {
			for ( var i = 0; i < allCheckedBox.length; i++) {
				var currentCheckBox = $(allCheckedBox[i]);
				if (i == 0) {
					lb.instanceName = currentCheckBox.parents("tr").attr("name");
					lb.selectedInstanceId = currentCheckBox.attr("value");
				} else {
					lb.instanceName += "," + currentCheckBox.parents("tr").attr("name");
					lb.selectedInstanceId += "," + currentCheckBox.attr("value");
				}
			}
		}
	},
	
	describeLb : function(){	
//		alert("describeLb");
		//将自己编写的显示主机的table渲染
		com.skyform.service.LBService.listAll(function(data){
			lb.instances = data;					
			lb.generateTable(data);
			lb.checkSelected();//初始化按钮置灰
			if(data){
				if (data.length > 0){
					lb.firstRule = data[0].id;
					lb.describeLbRuleById(data[0].id);
					lb.getOptLog(data[0].id);						
				}						
			}
	
		});
			
	},
	
	destroylbRule : function(para){	
		
		Dcp.biz.apiRequest("/instance/lb/destroylbRule", {id : para}, function() {				
				lb.describeLbRuleById(0);
				lb.getOptLog(0);
				$.growlUI(Dict.val("common_tip"), Dict.val("lb_delect_lb_rule_success")); 
		},function onError(){
			lb.generateTable();
		});	
	},
	
	describeLbRuleById : function(id){	
		if(null==id||id == 0){
			id = $("#lbTable tbody").find("td[name='id']").text();	
		}
		//console.log("describeLbRuleById = "+id);
		Dcp.biz.apiAsyncRequest("/instance/lb/describeLbRule", {lbid:id}, function(data) {			
			if (data.code != "0") {
				$.growlUI(Dict.val("common_tip"), Dict.val("lb_select_lb_port_error") + data.msg); 
			} else {				
				$("#showLbRule").empty();
					if(data.data!="[]"&&data.data.length>0){
						if(typeof(data.data)=="string")var test=$.parseJSON(data.data);
						else var test=data.data;				
					lb.lbId =test[0].id;
					var dom = "";
					Dcp.biz.apiRequest("/instance/lb/describeLbRuleVM", {firewallId : lb.lbId}, function(json) {
						if (json.code == "0") {
							//alert(json.data.length);
							dom = '<div class=" well">'
								+'		<table class="table"  >'
							    +'			<tr style="font-size:14px;" >'
							    +'				<td>'+Dict.val("lb_cloud_host")+'</td>'
							    +'				<td>'+Dict.val("common_port")+'</td>'		    		
							    +'				<td>'+Dict.val("lb_weights")+'</td>'
							    +'              <td>'+Dict.val("common_state")+'</td>'
							    +'			</tr>';
							for (var j = 0; j < json.data.length; j++) {
								dom =  dom + '<tr style="font-size:14px;"><td>'+ json.data[j].name +'</td><td>'+ json.data[j].port +'</td>'
									+'<td>'+ json.data[j].protocol +'</td>';
									//console.log('state='+json.data[j].state);
									if('success' == json.data[j].state){
										dom = dom + '<td>'+Dict.val("common_success")+'</td></tr>'; 
									}else if('failed' == json.data[j].state){
										dom = dom + '<td>'+Dict.val("common_failure")+'</td></tr>';
									}else if('opening' == json.data[j].state){
										dom = dom + '<td>'+Dict.val("common_processing")+'</td></tr>';
									}else if('unbinding' == json.data[j].state){
										dom = dom + '<td>'+Dict.val("common_unbundling")+'</td></tr>';
									}else if('unbindfailed' == json.data[j].state){
										dom = dom + '<td>'+Dict.val("common_unbund_failure")+'</td></tr>';
									}else{
										dom = dom + '<td></td></tr>'; 
									}
							}							
							dom = dom +'</table>'
						    +'</div>';
							$("#showLbRule").empty().append(dom);	
						} else {
							$.growlUI(Dict.val("common_tip"), Dict.val("lb_select_lb_port_error") + json.msg); 
						}
					});
				}
			}
//		},function onError(){
//			lb.generateTable();
		});		
	},
	
	bindEvent : function() {
		
		
		$("#checkAll").unbind("click").bind("click", function(e) {
			var checked = $(this).attr("checked") || false;
	        $("#lbTable input[type='checkbox']").attr("checked",checked);	 
	        lb.checkSelected();
	        //eip.showOrHideOpt();
	       // e.stopPropagation();
		});
		
	},
	
	getFormData : function(param){
//		$(this.rules).each(function(i,rule){
//			param["firewallRules.rules["+i+"].name"] = rule.name;
//			param["firewallRules.rules["+i+"].port"] = rule.port;
//			param["firewallRules.rules["+i+"].protocol"] = rule.power;
//		});		
	},
	
	// 修改LB存储名称和描述  createUserId??????
	modifyLb : function(id,name,comment) {
		var old_name = lb.oldName;
		if(name == old_name){
			$.growlUI(Dict.val("common_tip"),Dict.val("lb_modify_lb_instance_name"));
			return;
		}
		com.skyform.service.PortalInstanceService.querySameNameExist(window.currentInstanceType,name,function(isExist){
			if(!isExist)
			{
				var params = {
						"subscriptionId" : parseInt(id),
						"subscriptionName": name
				};
				Dcp.biz.apiRequest("/instance/lb/modifyLBVolume", params, function(data){
					if(data.code == "0"){
						$.growlUI(Dict.val("common_tip"), Dict.val("lb_modify_lb_information_success")); 
						$("#modifyLbModal").modal("hide");
						// refresh
						lb.updateDataTable(id);
					} else {
						$.growlUI(Dict.val("common_tip"), Dict.val("lb_modify_lb_information_error") + data.msg); 
					}
				});
			} else {
				$.growlUI(Dict.val("common_tip"),Dict.val("common_name_used_re_enter"));
			}
		});	
	},

	
	enableColumnHideAndShow : function(position){
		var content = $("<table class='table'></table>");
		var ths = $(this.container).find("th");
		for(var i=0; i<this.columnDefs.length; i++) {
			var columnDef = this.columnDefs[i];
			if(columnDef.contentVisiable == 'always' ) continue;
			if(columnDef.contentVisiable == 'hide' ) {
				content.append("<tr><td>"+columnDef.title+"</td><td><div class='switch switch-small' columnIndex='"+i+"'><input type='checkbox'/></div></td></tr>");
			} else {
				content.append("<tr><td>"+columnDef.title+"</td><td><div class='switch switch-small' columnIndex='"+i+"'><input type='checkbox' checked /></div></td></tr>");
			}
		}
		var self = this;
		var switchInited = false;
		this.columnShowOrHideCtrlDlg = new com.skyform.component.Modal(new Date().getTime()+Math.random(),this.defaultOptions.oLanguage.column.showOrHide,content.get(0).outerHTML,{
			afterShow: function(modal) {
				if(switchInited) return;
				var switches = $(modal).find(".modal-body .switch").bootstrapSwitch();
				switches.on('switch-change', function (e, data) {
					var columnIndex = $(this).attr("columnIndex");
					var visable = data.value;
						self.hideOrShowColumn(columnIndex,visable);
				});
				switchInited = true;
			}
		});
		return this.columnShowOrHideCtrlDlg;
	},
	
	// 刷新Table
	updateDataTable : function(id) {
//		alert("updateDataTable");
		if(lb.datatable)lb.datatable.container.find("tbody").html("<tr class='load_waiting'><td colspan='7' style='text-align:center;'><img src='"+CONTEXT_PATH+"/images/loader.gif'/><strong>"+Dict.val("common_retrieving_data_please_wait")+"</strong></td></tr>");
		Dcp.biz.apiAsyncRequest("/instance/lb/describeLbVolumes", null, function(data) {
			if (data.code == 0&&data.data.length>0) {
				lb.instances = data.data;				
				lb.describeLbRuleById(data.data[0].id);
				lb.getOptLog(data.data[0].id);

			}	
			else data.data = [];
			$(".load_waiting").hide();
			lb.datatable.updateData(data.data);
		});		
	},
	
	getCheckedArr : function() {
		return $("#lbTable tbody input[type='checkbox']:checked");
	},
	
	_bindAction : function(){
		$("div .actionBtn").unbind().click(function(){
			if($(this).hasClass("disabled")) return;
			var action = $(this).attr("action");
			lb._invokeAction(action);
		});
	},
	_invokeAction : function(action){
		var invoker = lb["" + action];
		if(invoker && typeof invoker == 'function') {
			invoker();
		}
	},
	showOrHideOptByState : function(state) {	

//		var checkboxArr = lb.getCheckedArr();
//
//		if(checkboxArr.length == 1){
//			$("#btn_modifyLb").attr("disabled",false);
//			$("#add_rule").attr("disabled",false);
//			if (state == "running"){
//				$("#btn_delete").attr("disabled",false);
//			}else{
//				$("#btn_delete").attr("disabled",true);
//			}
//		} else {
//			$("#btn_delete").attr("disabled",true);
//			$("#btn_modifyLb").attr("disabled",true);
//			$("#add_rule").attr("disabled",true);
//		}
	},
	
	getBillTypeList: function() {
		$("#billType").empty();
		var billtype_hasSelected = false;
		$.each(CommonEnum.billType, function(index) {
			var cpu_option = $("<div  class=\"types-options cpu-options \" data-value='"+ index + "'>" + CommonEnum.billType[index] + "</div>");
			cpu_option.appendTo($("#billType"));
			cpu_option.click(function(){
				if($(this).hasClass("selected"))return;
				$("div.type-options").removeClass("selected");
				$(".options .types-options.cpu-options ").removeClass("selected");
				$(this).addClass("selected");			
				lb.queryProductPrtyInfo(index);
				lb.getFee();
			});
			if (index == 0||index == 5) {
				if(!billtype_hasSelected){
					billtype_hasSelected = true;
					cpu_option.addClass("selected");
					lb.queryProductPrtyInfo(index);
				}
			}
		});
	},
	queryProductPrtyInfo :function(index){
			if(0==index){
				$("#peridUnit").empty().html(Dict.val("common_month"));
			}
			else if(1 == index){
				$("#peridUnit").empty().html(Dict.val("common_hour"));
			}
			else if(2 == index){
				$("#peridUnit").empty().html(Dict.val("common_day"));
			}
			else if(3 == index){
				$("#peridUnit").empty().html(Dict.val("common_year"));
			}
			
		    com.skyform.service.BillService.queryProductPrtyInfo(index,window.currentInstanceType,function(data){
	
			product.productId = data.productId;
		});
	},
	
	modifyLbShow : function(){
		var ids = $("#lbTable tbody input[type='checkbox']:checked");
		if(ids.length == 1){
			var oldInstanceName = lb.getCheckedArr().parents("tr").find("td[name='instanceName']").text();
			var oldComment = lb.getCheckedArr().parents("tr").attr("comment");
			$("#modInsName").val(oldInstanceName);
			lb.oldName = oldInstanceName;
			$("#modComment").val(oldComment);
			$("#modifyLbModal").modal("show");				
		} else {
			$.growlUI(Dict.val("common_tip"), Dict.val("lb_can_only_modify_a_lb_operation_please_reselect")); 
		}	
	},
	
	modifyRuleShow : function(){
		var ids = $("#lbTable tbody input[type='checkbox']:checked");			
		var id = $(ids[0]).val();
		lb.subResh = id;
		var _state = lb.getCheckedArr().parents("tr").attr("state");
		var ownUserId = lb.getCheckedArr().parents("tr").attr("ownUserId");
		hostIds=id;
		lb.modifyLbRule(id);
		//$("#modifyLbRule").setWidth("200px");
		$('#modifyLbRule').modal().css({
		    width: 800		  
		});
		$("#modifyLbRule").on("show",function(){
			lb.curSubnet = [];
			Dcp.biz.apiRequest("/instance/lb/querySubnetByLB", {id:id},
					function(data) {	        	
	        	if(0==data.code&&null!=data.data){
	        		if(typeof(data.data)=="string")lb.curSubnet = $.parseJSON(data.data);
	        		else lb.curSubnet = data.data;	        		
	        		if(lb.curSubnet.ipSegments&&lb.curSubnet.ipSegments != ""){
	        			var array = lb.curSubnet.ipSegments.split(".");
	        			var range = array[0]+"."+array[1]+"."+array[2]+".2~254"
	        			$("#range").text("("+Dict.val("lb_fanwei")+range+")");
	        		}
	        		if(lb.curSubnet.cidr&&lb.curSubnet.cidr != ""){
	        			   var obj = cidrToRangeByObject(lb.curSubnet.cidr);
					   	   var ip1 = obj.ip1[0];
					   	   var ip2 = obj.ip1[0] == "10"?(obj.ip2[0]==obj.ip2[1]?obj.ip2[0]:(obj.ip2[0]+"~"+obj.ip2[1])):(obj.ip2[0]);
					   	   var ip3 = obj.ip3[0]==obj.ip3[1]?obj.ip3[0]:(obj.ip3[0]+"~"+obj.ip3[1]);
					   	   var ip4 = obj.ip4[0]==obj.ip4[1]?obj.ip4[0]:(obj.ip4[0]+"~"+obj.ip4[1]);
					   	   var range = ip1+" . "+ip2+" . "+ip3+" . "+ip4;
					   	   $("#range").text("("+Dict.val("lb_fanwei")+range+")");
	        		}
//	        		console.log(lb.curSubnet.cidr);
//	        		$("#ipSegments_modify_3").val(lb.getIpByDot(lb.curSubnet.ipSegments,3) );
				}	
	        	else if(-1==data.code){
	        		$.growlUI(Dict.val("common_tip"), Dict.val("lb_select_network_error")); 
	        	}
			});
		});
		$("#modifyLbRule").modal("show");
	},
	
	destoryLbShow : function (){
		var checkedArr =  lb.getCheckedArr();
		var volumeNames = "";
		var volumeIds = [];
		$(checkedArr).each(function(index, item) {
			var tr = $(item).parents("tr");					
			var id = $("input[type='checkbox']", $("td", tr)[0]).val();
			volumeNames += $($("td", tr)[2]).text();
			volumeIds.push(id);
			if (index < checkedArr.length - 1) {
				volumeNames += ",";
			}
		});
		var lbIds = volumeIds.join(",");
		lb.destroyLb(lbIds);		
	},
	
   	destroyLb : function(lbIds) {
		var confirmModal = new com.skyform.component.Modal(new Date().getTime(),Dict.val("lb_destroy_lb"),"<h4>"+Dict.val("lb_do_you_want_to_destroy_lb")+"</h4>",{
			buttons : [
				{
					name : Dict.val("common_determine"),
					onClick : function(){
						// 删除LB存储
						var params = {
								"subscriptionId" : lbIds
						};
						Dcp.biz.apiRequest("/instance/lb/deleteLbVolumes", params, function(data) {
							if (data.code == 0) {
								$.growlUI(Dict.val("common_tip"), Dict.val("lb_being_destroy_lb")); 
								confirmModal.hide();
								// refresh
								lb.updateDataTable();
							} else {
								$.growlUI(Dict.val("common_tip"), Dict.val("lb_destroy_lb_failed") + data.msg); 
							}
						});												
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
						confirmModal.hide();
					}
				}
			]
		});
		confirmModal.setWidth(300).autoAlign();
		confirmModal.show();
	},
	getOptLog:function(lbId){
		$("#opt_logs").empty();
		if(null==lbId||0==lbId){
			lbId = $("#lbTable").find("td[name='id']").text();		
		}	
		com.skyform.service.LogService.describeLogsUIInfo(lbId);
//		com.skyform.service.LogService.describeLogsInfo(lbId,function onSuccess(logs){
//			$("#opt_logs").empty();
//			$(logs).each(function(i,v){
//				var desc = "";
//				if(v.description){
//					if(v.description != ""){
//						desc = "("+v.description+")";
//					}						
//				}
//				var _name = "";
//				if(v.subscription_name){
//					_name = v.subscription_name;
//				}
//				$("<li class='detail-item'><span>" + v.createTime+ "  "+v.subscription_name+"  " + v.controle +desc+  "</span></li>").appendTo($("#opt_logs"));
//			});
//		},function onError(msg){
////			$.growlUI(Dict.val("common_tip"), "查询弹性块存储日志发生错误：" + msg); 
//		});
	},
	chaeckIpInVlan: function(ipstart,ipend,ip){ 		
		if (ip>=ipstart && ip<=ipend){
		   return true;
		}
		return false; 
	} ,
	getCurSubnet : function(){
		var netId = $("#vm_privatenetwork").val();							
		if(lb.subnet.length>0){
			$.each(lb.subnet, function(i) {
				if(netId == lb.subnet[i].id){
					lb.curSubnet = lb.subnet[i];
					return false;
				}									
			});
		}
		return lb.curSubnet;
	},
	getIpByDot : function(ip,index){
		var ip4 = /(\d+)\.(\d+)\.(\d+)\.(\d+)/;
		var r1 = ip.match(ip4);
		return parseInt(r1[index]);
	},
	renew : function(){
		var lbId = lb.getCheckedArr().parents("tr").attr("instanceId");
		if(lb.renewModal){
			
		}else{
			lb.renewModal = new com.skyform.component.Renew(lbId,{
				buttons : [
							{
								name : Dict.val("common_save"),
								onClick : function(){
									var period = lb.renewModal.getPeriod().getValue();
									$("#renewModal").modal("hide");	
									var _modal = $("#renewModal");
									com.skyform.service.renewService.renew(lb.getCheckedArr().parents("tr").attr("instanceId"),period,function onSuccess(data){
										//订单提交成功后校验用户余额是否不足
										var _tradeId = data.tradeId;
										var _fee = $("#feeInput_renew").text();
										com.skyform.service.BillService.confirmTradeSubmit(_fee,_tradeId,_modal,function onSuccess(data){
											$.growlUI(Dict.val("common_tip"), Dict.val("common_renewal_successful_debit_successful_please_wait")); 
											// refresh
											lb.updateDataTable();									
										},function onError(msg){
											$.growlUI(Dict.val("common_tip"), Dict.val("common_renewal_successful_failed_charge"));
										});								
									},function onError(msg){
										$.growlUI(Dict.val("common_tip"), Dict.val("common_renew_submit_failed") + msg); 
									});				
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
									lb.renewModal.hide();
								}
							}
						]
					});
			
		}
			lb.renewModal.getFee_renew(lbId);
			lb.renewModal.show();		
			$(".subFee_renew").bind('mouseup keyup',function(){
				setTimeout('lb.renewModal.getFee_renew('+lbId+')',100);
			});
	}
	};
//lb_fan 证书管理
var certificateAge={
	dtTable : null,
	dataC:null,
	mrService:com.skyform.service.LBMRService,
	defPool:"nanchang",
	init:function(){
		certificateAge.bindingEvent();//绑定事件
		certificateAge.refreshData();//lb_fan 页面加载时获取证书管理data
		certificateAge.checkSelected_C();//初始化按钮置灰

	},
	//绑定事件
	bindingEvent:function(){
		//		lb_fan 管理证书的销毁按钮
		$("#btn_delete_c").unbind("click").bind("click",function(){
			certificateAge.destoryLbShow_C();
		});
		//		lb_fan 切换证书管理时调用查询接口,刷新按钮
		$("#certificate_management_tab").unbind("click").bind("click",function(){
			if($("#certificate_management_content").is(":hidden")){
				certificateAge.refreshData();
				certificateAge.checkSelected_C();//初始化按钮置灰
			}else{

			}
		});
		$("#btnRefresh_C").unbind("click").bind("click",function(){
			certificateAge.refreshData();
			certificateAge.checkSelected_C();//初始化按钮置灰
		});
		//		lb_fan 证书创建
		$("#createLB_C").unbind("click").bind("click",function(){
			$("#tipCerSSL").hide();
			$("#tipCerContent").hide();
			//$("#cerContent").html("");
			//	$("#cerSSL").html("");
			//随机生成证书名称
			var cerName=certificateAge.randomCerName();
			$("#cerName").val();
			certificateAge.createLbShow_C();
		});
	},
	//lb_fan 证书管理获取data
	refreshData : function(){
		if (certificateAge.dtTable)
			certificateAge.dtTable.container
					.find("tbody")
					.html(
							"<tr ><td colspan='7' style='text-align:center;'><img src='"
							+ CONTEXT_PATH
							+ "/images/loader.gif'/><strong>"+Dict.val("common_retrieving_data_please_wait")+"</strong></td></tr>");
		certificateAge.mrService.queryCertificate({"pool":$("#pool").val()},function onSuccess(data){//$("#pool").val()
			certificateAge.dataC = data;
			certificateAge._refreshDtTable(certificateAge.dataC);
		},function onError(msg){
			ErrorMgr.showError(msg);
		});
	},
	//lb_fan 证书管理table
	_refreshDtTable : function(data){
		if(certificateAge.dtTable) {
			certificateAge.dtTable.updateData(data);
		}
		else {
			certificateAge.dtTable = new com.skyform.component.DataTable();
			certificateAge.dtTable.renderByData("#cTable",{
				pageSize : 5,
				data : data,
				onColumnRender : function(columnIndex,columnMetaData,columnData){
					if(columnMetaData.name=='ID') {
						return columnData.id;
					} else if(columnMetaData.name=="id") {
						return "<input type='checkbox' value='" + columnData["id"] +"'/>" ;
					} else if (columnMetaData.name=="STATUS") {
						if(columnData.STATUS=="opening"){
							text="<span class='state-green'><i class='icon-circle green mr5'></i>创建中</span>";
						}else if(columnData.STATUS=="deleting"){
							text="<span class='state-copper'><i class='icon-spinner icon-spin blue mr5'></i>删除中</span>";
						}else if(columnData.STATUS=="running" && columnData.lbNum==1){
							text = "<span class='state-green'><i class='icon-circle green mr5'></i>已使用</span>";
						}else if(columnData.STATUS=="running" && columnData.lbNum==0){
							text = "<span class='state-green'><i class='icon-circle green mr5'></i>未使用</span>";
						}
						return text;
					} else if (columnMetaData.name == "NAME"){
						return columnData.NAME+"<a><i class='icon-comments' ></i></a>";
					}else if (columnMetaData.name == "createDate") {
						var text = '';
						if(columnData.createDate == '' || columnData.createDate == 'undefined'){
							return text;
						}
						try {
							var obj = eval('(' + "{Date: new Date(" + columnData.createDate + ")}" + ')');
							var dateValue = obj["Date"];
							text = dateValue.format('yyyy-MM-dd hh:mm:ss');
						} catch (e) {
						}
						return text;
					}else if (columnMetaData.name == "lbNum"){
						return columnData.lbNum;
					}
					else {
						return columnData[columnMetaData.name];
					}
				},
				afterRowRender : function(rowIndex,data,tr){
					$("#checkAll_C").unbind("click").bind("click", function(e) {
						var checked = $(this).attr("checked") || false;
						$("#cTable input[type='checkbox']").attr("checked",checked);
						//certificateAge.checkSelected_C(false);//初始化按钮置灰
					});
					tr.find("input[type='checkbox']").click(function(){
						//console.log("checkbox")
						certificateAge.checkSelected_C();
						var firstRow = $("#cTable input[type='checkbox']:checked").val();
						//console.log(firstRow+"firstRow")
						certificateAge.resources(firstRow);
						Dcp.biz.apiAsyncRequest("/certificate/queryCertificateLb",{ "certificateId":Number(firstRow)}, function(data) {
							var array = data;
							if (array == null || array.length == 0) {
								return;
							} else {
								$("#showLbRule_C").empty();
								var dom = "";
								$(array)
										.each(function(i) {
											dom += "<li class=\"detail-item\">"
													+ "<span>"
													+"证书名称"+array[i].NAME
													+ "</span>&nbsp;&nbsp;&nbsp;&nbsp;"
													+ "<span>"
													+"挂载负载均衡器数量"+ array[i].lbNum
													+ "</li>";
										});
								$("#showLbRule_C").append(dom);
							}
						});
					});

				},
				afterTableRender: function () {
					// 翻页的时候清除前一页选中的checkbox，同时将更多操作置为不可用
					$("#cTable input[type='checkbox']").attr("checked", false);
					var firstRow = $("#cTable input[type='checkbox']:eq(0)").val();

					//显示第一条记录的日志
					Dcp.biz.apiAsyncRequest("/certificate/queryCertificateLb",{ "certificateId":Number(firstRow)}, function(data) {
						//console.log(id);
						var array = data;
						if (array == null || array.length == 0) {
							return;
						} else {
							$("#showLbRule_C").empty();
							var dom = "";
							$(array)
									.each(function(i) {
										dom += "<li class=\"detail-item\">"
												+ "<span>"
												+"证书名称"+array[i].lbName
												+ "</span>&nbsp;&nbsp;&nbsp;&nbsp;"
												+ "<span>"
												+"挂载负载均衡器数量"+ array[i].lbName
												+ "</li>";
									});
							$("#showLbRule_C").append(dom);
						}
					});
					//certificateAge.resources(firstRow);

				}
			});
			certificateAge.dtTable.addToobarButton($("#toolbar"));
			certificateAge.dtTable.enableColumnHideAndShow("right");

		}
	},
	//lb_fan 证书管理--销毁
	destoryLbShow_C:function(){
		var checkedArr =  $("#cTable tbody input[type='checkbox']:checked");
		var volumeNames = "";
		var volumeIds = [];
		$(checkedArr).each(function(index, item) {
			var tr = $(item).parents("tr");
			var id = $("input[type='checkbox']", $("td", tr)[0]).val();
			volumeNames += $($("td", tr)[2]).text();
			volumeIds.push(id);
			if (index < checkedArr.length - 1) {
				volumeNames += ",";
			}
		});
		var lbIds = volumeIds.join(",");
		certificateAge.destroyLb_C(lbIds);
	},
	//lb_fan 删除证书
	destroyLb_C : function(lbIds) {
		var confirmModal = new com.skyform.component.Modal(new Date().getTime(),Dict.val("lb_destroy_lb"),"<h4>"+"确定要删除该证书吗？"+"</h4>",{
			buttons : [
				{
					name : Dict.val("common_determine"),
					onClick : function(){
						// 删除LB存储
						var params = {
							"certificateId" : Number(lbIds)
						};
						Dcp.biz.apiRequest("/certificate/deleteCertificate", params, function(data) {
							if (data.code == 0) {
								$.growlUI(Dict.val("common_tip"), Dict.val("lb_being_destroy_lb"));
								confirmModal.hide();
								// refresh
								certificateAge.refreshData();
							} else {
								$.growlUI(Dict.val("common_tip"), Dict.val("lb_destroy_lb_failed") + data.msg);
							}
						});
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
						confirmModal.hide();
					}
				}
			]
		});
		confirmModal.setWidth(300).autoAlign();
		confirmModal.show();
	},
	checkSelected_C : function(selectInstance) {
		//alert("checkSelected_C")
		$("#toolbar .operation").addClass("disabled");
		var rightClicked = selectInstance?true:false;

		var allCheckedBox = $("#cTable input[type='checkbox']:checked");

		var oneSelected = allCheckedBox.length == 1;
		var hasSelected = allCheckedBox.length > 0;


		$("#toolbar .operation").addClass("disabled");

		var state = $(allCheckedBox[0]).parents("tr").attr("STATUS");
		if(selectInstance) {
			state = selectInstance.state;
		}
		//var state = $("#lbTable tbody input[type='checkbox']:checked").parents("tr").attr("state");
		$("#toolbar .operation").each(function(index,operation){
			var condition = $(operation).attr("condition");
			var action = $(operation).attr("action");
			var enabled = true;
			eval("enabled=("+condition+")");
			if(enabled) {
				$(operation).removeClass("disabled");
				//$(operation).removeAttr("disabled");
			} else {
				$(operation).addClass("disabled");
				//$(operation).attr("disabled","disabled");
			}
		});

		certificateAge._bindAction_C();

		if(rightClicked) {
			certificateAge.instanceName = selectInstance.NAME;
			certificateAge.selectedInstanceId = selectInstance.id;
		} else {
			for ( var i = 0; i < allCheckedBox.length; i++) {
				var currentCheckBox = $(allCheckedBox[i]);
				if (i == 0) {
					certificateAge.NAME = currentCheckBox.parents("tr").attr("name");
					certificateAge.selectedInstanceId = currentCheckBox.attr("value");
				} else {
					certificateAge.NAME += "," + currentCheckBox.parents("tr").attr("name");
					certificateAge.selectedInstanceId += "," + currentCheckBox.attr("value");
				}
			}
		}
		if($("#cTable input[type='checkbox']:checked").length==1){
			$("#btn_delete_c").removeClass("disabled");
		}
	},
	_bindAction_C : function(){
		$("#toolbar .actionBtn").unbind().click(function(){
			if($(this).hasClass("disabled")) return;
			var action = $(this).attr("action");
			certificateAge._invokeAction_C(action);
		});
	},
	_invokeAction_C : function(action){
		var invoker = certificateAge["" + action];
		if(invoker && typeof invoker == 'function') {
			invoker();
		}
	},
	//lb_fan 证书创建
	createLbShow_C:function(){
		$("#certificateModal").modal("show");
		//示例按钮 textarea得焦事件
		certificateAge.sampleBtn();
		//确定-- 调用证书创建接口
		certificateAge.tuningInterface();
	},
	getCerParmas:function(){
		var cerCon=$("#cerContent").val();
		var cerSSL=$("#cerSSL").val();
		cerCon=cerCon.replace(/=/g,"%3D")
		cerSSL=cerSSL.replace(/=/g,"%3D")
		var parmas={
			"pool": $("#pool").val(),
			"productList": [
				{
					"name":$("#cerName").val(),
					"content":cerCon,
					"secretKey":cerSSL,
				}
			]
		};
		return parmas;
	},
	sampleBtn:function(){
		$(".contentSample").unbind("click").bind("click",function(){
			var content=certificateAge.getCerParmas().productList[0].content;
			$("#cerContent").html(content);
			$("#tipCerContent").hide();
		});
		$(".keySample").unbind("click").bind("click",function(){
			var secretKey=certificateAge.getCerParmas().productList[0].secretKey;
			$("#cerSSL").html(secretKey);
			$("#tipCerSSL").hide();
		});
		$("#cerContent").unbind("focus").bind("focus",function(){
			$("#cerContent").html("");
			$("#tipCerContent").hide();
		});
		$("#cerSSL").unbind("focus").bind("focus",function(){
			$("#cerSSL").html("");
			$("#tipCerSSL").hide();
		});
		//$("#cerContent").unbind("blur").bind("blur",function(){
		//	if($("#cerContent").html() == "" || $("#cerContent").html() == null){
		//		$("#tipCerContent").show();
		//	}
		//});
		//$("#cerSSL").unbind("blur").bind("blur",function(){
		//	if($("#cerSSL").html() == "" || $("#cerSSL").html() == null){
		//		$("#tipCerSSL").show();
		//	}
		//});
	},

	tuningInterface:function(){
		$("#determine").unbind("click").bind("click",function(){
			var parmas=certificateAge.getCerParmas();
			var cerCon=$("#cerContent").val();
			var cerSSL=$("#cerSSL").val();
			//console.log(cerCon+","+cerSSL);
			if(cerCon !="" && cerSSL !=""){
				certificateAge.mrService.createCertificate(parmas,function onSuccess(data){
					$("#certificateModal").modal("hide");
					$.growlUI("<br>创建证书成功!<br>");
				},function onError(msg){
					ErrorMgr.showError(msg);
				});
			}else{
				$("#tipCerSSL").show();
				$("#tipCerContent").show();
			}
		})
	},
	randomCerName:function(){
		var result = [];
		var sNum=[];
		var CerName=null;
		for(var i=0;i<4;i++){
			var ranNum = Math.ceil(Math.random() * 25); //生成一个0到25的数字
			//a~z的ASCII码就是65 + 0~25;然后调用String.fromCharCode()传入ASCII值返回相应的字符并push进数组里
			result.push(String.fromCharCode(97+ranNum));
		}
		for(var i=0;i<4;i++){
			var n=Math.random()*10;
			sNum.push(Math.floor(n))
		}
		return CerName=result.join("")+"_"+sNum.join("")
	},
	//相关资源
	resources : function(id){
		//console.log("id")
		$("#showLbRule_C").html("");
		if (!id) {
			return;
		}

		Dcp.biz.apiAsyncRequest("/certificate/queryCertificateLb",{ "certificateId":Number(id)}, function(data) {
			//console.log(id);
			var array = data;
			if (array == null || array.length == 0) {
				return;
			} else {
				$("#showLbRule_C").empty();
				var dom = "";
				$(array)
					.each(function(i) {
						dom += "<li class=\"detail-item\">"
								+ "<span>"
								+"证书名称"+array[i].lbName
								+ "</span>&nbsp;&nbsp;&nbsp;&nbsp;"
								+ "<span>"
								+"挂载负载均衡器数量"+ array[i].lbName
								+ "</li>";
					});
				$("#showLbRule_C").append(dom);
			}
		});

	}
};
	function validatelbList(result){
		//var result = {status : true};
		//if(result.msg == 'undefined'){result.msg = '';}
		var subnet = $("#vm_privatenetwork").val();
		$("#tip_privatenetwork").empty();
		if(subnet <= 0) {
			$("#tip_privatenetwork").html(Dict.val("lb_select_create_lb_private_network"));
			result.status = false;
			//return result;
		}
		var protocol = $("#monitorProtocol").val();
		$("#tip_monitorProtocol").empty();
		if(protocol == '') {
			$("#tip_monitorProtocol").html(Dict.val("lb_select_create_lb_snooping"));
			result.status = false;
			//return result;
		}
		var loopType = $("#loopType").val();
		$("#tip_loopType").empty();
		if(loopType == '') {
			$("#tip_loopType").html(Dict.val("lb_select_create_lb_way"));
			result.status = false;
			//return result;
		}
		//result = {status : true};
		return result;
	}

	function validatelbInsName(input){
		var scoreReg = /^[\u4E00-\u9FA0A-Za-z\-0-9\_]+$/;
				
		var result = {status : true};
		$("#tip_lbInsName").empty();
		if($.trim(""+$(input).val()) == '') {
			//result.msg = "请填写不包括非法字符的实例名称";
			$("#tip_lbInsName").empty().html(Dict.val("common_please_in_no_include_illegal_characters"));
			result.status = false;
		}
		
		if(! scoreReg.exec($.trim(""+$(input).val()))) {
			//result.msg = "请填写不包括非法字符的实例名称";
			$("#tip_lbInsName").empty().html(Dict.val("common_please_in_no_include_illegal_characters"));
			result.status = false;
		}
		
		return result;			
	}
	function validatemaxLink(input){
		var scoreReg = /^[\u4E00-\u9FA0A-Za-z\-0-9\_]+$/;

		var result = {status : true};
		$("#tip_maxLink").empty();
		if($.trim(""+$(input).val()) == '') {
			//result.msg = "请填写不包括非法字符的实例名称";
			$("#tip_maxLink").empty().html("请填写不包括非法字符的最大链接数");
			result.status = false;
		}

		if(! scoreReg.exec($.trim(""+$(input).val()))) {
			//result.msg = "请填写不包括非法字符的实例名称";
			$("#tip_maxLink").empty().html("请填写不包括非法字符的最大链接数");
			result.status = false;
		}

		return result;
	}
	function validatemonitorPort(input){
		var scoreReg = /^[0-9]*$/;
		var result = {status : true};
		$("#tip_monitorPort").empty();
		if($.trim(""+$(input).val()) == '') {
			//result.msg = "请用数字填写监听端口";
			$("#tip_monitorPort").empty().html(Dict.val("lb_listening_port_not_be_empty"));
			result.status = false;
			//return result;
		}
		
		if(! scoreReg.exec($.trim(""+$(input).val()))) {
			//result.msg = "请用数字填写监听端口";
			$("#tip_monitorPort").empty().html(Dict.val("lb_listening_port_only_enter_num"));
			result.status = false;
			$(input).val("");
			//return result;
		}else{
			if(eval($.trim(""+$(input).val())) > 65535){
				$("#tip_monitorPort").empty().html(Dict.val("lb_listening_port_only_enter"));
				result.status = false;
				$(input).val("");
			}
		}
		//result.msg = "";
		result = validatelbList(result);
		return result;
	}		
	
	function calc() {
		//随着slider的变化 价格部分作出相应的变化
			var buycount = lb.createPeridInput.getValue();
			var count = parseInt(buycount),capacity=parseInt($("#amount").val());	
			$("#span1").html(capacity/100);
			$("#span2").html(count);
			$("#span3").html((count*capacity/100).toFixed(1));
			$("#span4").html((count*capacity*7.2).toFixed(1));		
		};
		function calcChange(){
			var buycount = lb.createPeridInput.getValue();
			var count1 = parseInt(buycount),capacity1=parseInt($("#amount1").val());
			$("#span5").html(capacity1/100);
			$("#span6").html(count1);
			$("#span7").html((count1*capacity1/100).toFixed(1));
			$("#span8").html((count1*capacity1*7.2).toFixed(1));	
		};	
		function validateAgentCode(select){
			var result = {status : true};
			$("#agentMsg").empty();
			var agentId = $("#agentId").val();
			if(agentId&&agentId.length>0){
				com.skyform.service.channelService.checkAgentCode(agentId,function(data){
					if("-1" == data){
						$("#agentMsg").html(Dict.val("common_discount_code_no_exist"));
						result.status = false;
					}
					else if("-2" == data||"-1" == data){
						$("#agentMsg").html(Dict.val("common_discount_code_expired"));
						result.status = false;
					}else if("-4" == data){
						$("#agentMsg").html(Dict.val("common_discount_code_authing"));
						result.status = false;
					} else if("-5" == data){
						$("#agentMsg").html(Dict.val("common_discount_code_unauthed"));
						result.status = false;
					} else if("-6" == data){
						$("#agentMsg").html(Dict.val("common_coupons_reached_maximum_number"));
						result.status = false;
					} else if("-7" == data){
						$("#agentMsg").html(Dict.val("common_discount_code_noavailable"));
						result.status = false;
					}
				});
			}					
			return result; 
		}
$(function(){

	$("#load_balancing_tab").on("show",function(){
		window.currentInstanceType='lb';
	});
	$("#certificate_management_tab").on("show",function(){
		window.currentInstanceType='certificateAge';
	});

});