//10.10.242.180
$(function(){
	ebs.init();
});
var ebs = {
	volumeState: [],
	datatable : new com.skyform.component.DataTable(),
	hostDatatable : null,
	hostDatatable_detach : null,
	userListData:[],
	createCountInput : null,
	init : function() {
		ebs.volumeState = {
				"pending" : Dict.val("common_ins_state_pending"),
				"reject" : Dict.val("common_ins_state_reject"),
				"opening" : Dict.val("common_ins_state_opening"),
				"changing" : Dict.val("common_ins_state_changing"),
				"deleting" : Dict.val("common_ins_state_deleting"),
				"deleted" : Dict.val("common_ins_state_deleted"),
				"running" : Dict.val("common_ins_state_running"),// 就绪
				"using" : Dict.val("common_ins_state_using"),
				"attaching" : Dict.val("common_ins_state_attaching"),
				"unattaching" : Dict.val("common_ins_state_unattaching"),
				"error" : Dict.val("common_ins_state_error")
				,"create error" : Dict.val("common_ins_state_error")
				,"delete error" : Dict.val("common_ins_state_error")
				,"attach error" : Dict.val("common_ins_state_error")
				,"unattach error" : Dict.val("common_ins_state_error")
		};			
		ebs.describeEbs();
		
//		$("#ebsTable tbody tr");
//		$("#ebsId").html($(this).find("td:eq(1)").html());			
//		$("#ebsName").html($(this).find("td:eq(2)").html());
////		ebsDetail.state = detail.state;
//		$("#state").html($(this).find("td:eq(3)").html());
////		$("#hostName").html("待讨论");
//		$("#comment").html(detail.comment);
//		var text = new Date(detail.createDate).toLocaleString();
//		$("#createDate").html($(this).find("td:eq(5)").html());
//		$("#storageSize").html($(this).find("td:eq(4)").html());
////		$("#used").html(0);
////		$("#notUsed").html($(this).find("td:eq(4)").html());
//		ebs.getRelateHosts($(this).find("td:eq(1)").text());

		
		var inMenu = false;
		$("#contextMenu").bind('mouseover',function(){
			inMenu = true;
		});
	
		$("#contextMenu").bind('mouseout',function(){
			inMenu = false;
		});
		$("#contextMenu li").bind('click',function(e){
			$("#contextMenu").hide();
			ebs.handleLi($(this).index());					
		});
		$("body").bind('mousedown',function(){
			if(!inMenu){
				$("#contextMenu").hide();
			}
		});
		
		
		$("#createEbsA").unbind("click").bind("click", function() {			
			// 带+-的输入框
			if (ebs.createCountInput == null) {
				var container = $("#createCount").empty();
				ebs.createCountInput = new com.skyform.component.RangeInputField(container, {
					min : 1,
					defaultValue : 1,
					textStyle : "width:137px"
				});
				ebs.createCountInput.render();
//				ebs.createCountInput.showErrorMsg = function(msg) {};
//				ebs.createCountInput.hideErrorMsg = function() {};
			}
			ebs.createCountInput.reset();
			
			$("#createEbsModal form")[0].reset();
			$("#slider-range-min").slider("option", "value", 10);
			$("#amount").val(10);
			
//			$("#tipOwnUserAccount").text("");
//			$("#tipOwnUserId").text("");
			$("#tipCreateCount").text("");
			$("#amount").text("");
			$("#createEbsModal").modal("show");
		});
		
		
		$("#selectAllEbs").click(function(event){
			var checked = $(this).attr("checked")||false;                                                                                                                                    
			$("#tebs input[type='checkbox']").attr("checked",checked);
		}); 
		$("#selectAll").click(function(event){
			var checked = $(this).attr("checked")||false;
			$("#tall input[type='checkbox']").attr("checked",checked);
		});

		
		
		
		
		
		
		
		//更多操作...中的下拉菜单添加监听事件
		$(".dropdown-menu").bind('mouseover',function(){
			inMenu = true;
		});
		
		$(".dropdown-menu").bind('mouseout',function(){
			inMenu = false;
		});
		$(".dropdown-menu li").bind('click',function(e){
			ebs.handleLi($(this).index());					
		});	
	
		//定义一个slider能够选择弹性块存储的大小
		$( "#slider-range-min" ).slider({
			range: "min",
			value: 10,
			min: 10,
			max: 500,
			step: 10,
			slide: function( event, ui ) {
//				var sp = $("#amount01").val();
				$("#amount").val(ui.value);
				calc();
			}
		});
		
		
		
		$( "#amount" ).val($( "#slider-range-min" ).slider( "value" ) );
		
		$("#amount01").bind("blur",function(){
			calc();
		});
		var realValue;
		$("#amount").bind("keydown",function(e){
			if (e.which == 13) { // 获取Enter键值
				e.preventDefault(); // 阻止表单按Enter键默认行为，防止按回车键提交表单
				realValue = parseInt(parseInt($("#amount").val())/10) * 10 ;
				$( "#slider-range-min" ).slider( "option", "value", realValue);
				$("#amount").val(realValue);			
			}
		});
//		$("#amount").bind("blur",function(e){
//				e.preventDefault(); // 阻止表单按Enter键默认行为，防止按回车键提交表单
//				realValue = parseInt(parseInt($("#amount").val())/10) * 10 ;
//				$( "#slider-range-min" ).slider( "option", "value", realValue);
//				$("#amount").val(realValue);			
//		});
		
		// 点击创建按钮
//		$("#createEbsModal").bind('click',function(e){
//			ebs.showCreateEbs();					
//		});	
		// 新建ebs
		$("#btnCreateEbs").bind('click',function(e){
			ebs.createEbs();
		});	
		//点击修改按钮
		$("#btn_modifyEbs").bind('click',function(e){
			ebs.handleLi(0);					
		});	
		//修改ebs
		$("#modify_save").bind('click',function(e){
			//只有当选中一个弹性块存储时修改名称和备注，其他情况友情提示
			var ids = $("#ebsTable tbody input[type='checkbox']:checked");
			var instanceName = $("#modifyEbsModal  input[name='instance_name']").val();
			var comment = $("#modifyEbsModal textarea").val();
			ebs.modifyEbs($(ids[0]).val(),instanceName,comment);		
		});
		//点击扩容按钮
		$("#btn_larger").bind('click',function(e){
			ebs.handleLi(2);					
		});			
		//ebs扩容
		$("#mod_storageSize_save").bind('click',function(e){
			var ids = $("#ebsTable tbody input[type='checkbox']:checked");
			var storageSize = $("#amount1").val();
			ebs.modifyEbsStorageSize($(ids[0]).val(),storageSize);
		});
		//点击挂载按钮
		$("#btn_attach").bind('click',function(e){
			ebs.handleLi(1);					
		});	
		//挂载
//		$("#attach_save").bind('click',function(e){
//			var ids = $("#ebsTable tbody input[type='checkbox']:checked");
//			ebs.attachEbs($(ids[0]).val(),ebs.getCheckedHostIds());
//		});
		//点击解挂按钮
		$("#btn_detach").bind('click',function(e){
			ebs.handleLi(4);					
		});			
		//解挂
//		$("#ebsUnload_save").bind('click',function(e){
//			ebs.detachEbs();
//		});

		//点击删除按钮
		$("#btn_delete").bind('click',function(e){
			ebs.handleLi(3);					
		});	
		
		$("#btn_modifyEbs").attr("disabled",true);
		$("#btn_larger").attr("disabled",true);
		$("#btn_attach").attr("disabled",true);
		$("#btn_detach").attr("disabled",true);
		$("#btn_delete").attr("disabled",true);
//		$("#moreAction").addClass("disabled");
//		ebs.getOwnUserList();
//		$("#user_name").blur(function() {
//			var account = $("#user_name").val();
//			ebs.changeUserByAccount(account);
//		});
	},
	getCheckedHostIds : function(){		
		var checkedArr = $("#hostsTable tbody input[type='checkbox']:checked");
//		var volumeNames = "";
		var volumeIds = [];
		$(checkedArr).each(function(index, item) {
			var tr = $(item).parents("tr");
//			volumeNames += $($("td", tr)[2]).text();
			var id = $("input[type='checkbox']", $("td", tr)[0]).val();
			volumeIds.push(id);
			if (index < checkedArr.length - 1) {
//				volumeNames += ",";
			}
		});
		var hostIds = volumeIds.join(",");
		return hostIds;
	},
	generateTable : function(data){
		 ebs.datatable.renderByData("#ebsTable", {
				"data" : data,
				"columnDefs" : [
				     {title : "<input type='checkbox' id='checkAll'>", name : "id"},
				     {title : "ID", name : "id"},
				     {title : Dict.val("common_service_name"), name : "instanceName"},
				     {title : Dict.val("common_state"), name : "state"},
				     {title : Dict.val("common_size"), name : "storageSize"},
				     {title : Dict.val("common_create_time"), name : "createDate"}
				     
				],
				"pageSize" : 5,
				"onColumnRender" : function(columnIndex,columnMetaData,columnData) {
					 var text = columnData[''+columnMetaData.name] || "";
					 if(columnIndex ==0) {
						 text = '<input type="checkbox" value="'+text+'">';
					 }
					 if (columnMetaData.title == "ID") {
						 text = "<a href='ebsDetails.jsp?id="+text+"'>" + text + "</a>";
					 }
					 if (columnMetaData.name == "state") {
						 text = ebs.volumeState[text];
					 }
					 if (columnMetaData.name == "createDate") {
						 text = new Date(text).format("yyyy-MM-dd hh:mm:ss");
						 //text = new Date(text);
					 }
					 return text;
				}, 
				"afterRowRender" : function(rowIndex,data,tr){
					tr.attr("state", data.state).attr("comment", data.comment);
					tr.attr("ownUserId", data.ownUserId);
				},
				"afterTableRender" : function() {
					ebs.bindEvent();
				}
		});
		 ebs.datatable.addToobarButton("#toolbar4tb2");
		 ebs.datatable.enableColumnHideAndShow("right");
	},
	describeEbs : function(){
		//将自己编写的显示主机的table渲染
		Dcp.biz.apiAsyncRequest("/instance/ebs/describeEbsVolumes", null, function(data) {
			if (data.code != "0") {
				$.growlUI(Dict.val("common_tip"), Dict.val("ebs_query_error")+"：" + data.msg); 
			} else {				
				//{title : "用户", name : "ownUserAccount"}
				 ebs.generateTable(data.data);
			}
		},function onError(){
			ebs.generateTable();
		});		
	},
	bindEvent : function() {
		$("tbody tr").mousedown(function(e) {  
		    if (3 == e.which) {  
		             document.oncontextmenu = function() {return false;};  
		             var screenHeight = $(document).height();
		             var top = e.pageY;
		             if(e.pageY>=screenHeight/2 ) {
		             	top = e.pageY-$("#contextMenu").height();
		             }
		             $("#contextMenu").hide();  
		             $("#contextMenu").attr("style","display: block; position: absolute; top:"  
		             + top  
		             + "px; left:"  
		             + e.pageX  
		             + "px; width: 180px;");  
		             $("#contextMenu").show();  
		             e.stopPropagation();
		             
		     }
		});  
		
		$("#ebsTable tbody input[type='checkbox']").unbind("click").bind("click", function() {
			 ebs.showOrHideOpt();
		});
		
		$("#checkAll").unbind("click").bind("click", function(e) {
			var checked = $(this).attr("checked") || false;
	        $("#ebsTable input[type='checkbox']").attr("checked",checked);	 
	        ebs.showOrHideOpt();
	        e.stopPropagation();
		});

		
		$("#ebsTable tbody tr").unbind("click").bind("click", function() {
			$("#ebsId").html($(this).find("td:eq(1)").html());			
			$("#ebsName").html($(this).find("td:eq(2)").html());
//			ebsDetail.state = detail.state;
			$("#state").html($(this).find("td:eq(3)").html());
//			$("#hostName").html("待讨论");
			$("#comment").html(detail.comment);
			var text = new Date(detail.createDate).toLocaleString();
			$("#createDate").html($(this).find("td:eq(5)").html());
			$("#storageSize").html($(this).find("td:eq(4)").html());
//			$("#used").html(0);
//			$("#notUsed").html($(this).find("td:eq(4)").html());
			ebs.getRelateHosts($(this).find("td:eq(1)").text());
		});
		
	},
	
	
	
	showCreateEbs : function() {
		// 带+-的输入框
		if (ebs.createCountInput == null) {
			var container = $("#createCount").empty();
			ebs.createCountInput = new com.skyform.component.RangeInputField(container, {
				min : 1,
				defaultValue : 1,
				textStyle : "width:137px"
			});
			ebs.createCountInput.render();
			ebs.createCountInput.showErrorMsg = function(msg) {};
			ebs.createCountInput.hideErrorMsg = function() {};
		}
		ebs.createCountInput.reset();
		
//		$("#user_name").typeahead({
//			source : ebs.getOwnUserAccountArr(userListData)
//		});
		
	},
	// 创建弹性块存储
	createEbs : function() {
		var isSubmit = true;
		var instanceName = $.trim($("#createInsName").val());
		var count = 1;
//		var count = $.trim($("#amount01").val());
		var storageSize = $.trim($("#amount").val());
		var account = $("#user_name").val();
		
//		var ownUserId = ebs.getOwnUserIdByAccount(account);
//		var ownUserId = $("#ownUserId").val();
		// 验证
		$("#createInsName, #amount").jqBootstrapValidation();
//		if ($("#ownUserId").jqBootstrapValidation("hasErrors")) {
//			$("#tipOwnUserId").text("所属用户必须选择！");
//			isSubmit = false;
//		} else {
//			$("#tipOwnUserId").text("");
//		}
		
      var scoreReg = /^[\u4E00-\u9FA0A-Za-z\-0-9\_]+$/;
      if(instanceName != ""){
          if(! scoreReg.exec(instanceName)) {
        	  $("#tipCreateInsName").text(Dict.val("common_valid_normal_letter"));
              $("#createInsName").focus();
              isSubmit = false;
          }else{
        	  $("#tipCreateInsName").text("");
          }    	  
      }

		var countValidateResult = ebs.createCountInput.validate();
		if (countValidateResult.code == 1) {
			$("#tipCreateCount").text(countValidateResult.msg);
			isSubmit = false;
		} else {
			$("#tipCreateCount").text("");
			count = ebs.createCountInput.getValue();
		}
      
//	    if ($("#amount01").jqBootstrapValidation("hasErrors")) {
//	    	$("#tipCreateCount").text("数量必须为大于等于1");
//	    	isSubmit = false;
//	    } else {
//	    	$("#tipCreateCount").text("");
//	    }
	    
	    
	    if ($("#amount").jqBootstrapValidation("hasErrors")) {
	    	$("#tipCreateStorageSize").text(Dict.valParam("common_valid_minimum_size",null,[10]));
	    	$("#amount").val(10);
	    	$("#slider-range-min").slider("option", "value", 10);
	    	isSubmit = false;
	    } else {
	    	$("#tipCreateStorageSize").text("");
	    }
		
		if (!isSubmit) {
			return;
		}

		// TODO 加入输入合法性校验  ,对于portal,获取登录的用户赋值给ownUserId，目前写死测试值1115
		var params = {
				"instanceName" : instanceName,
				"count" : count,
				"storageSize" : storageSize,
				"ownUserId" : 1115,
				"createUserId" : 1115
		};
		Dcp.biz.apiRequest("/instance/ebs/createEbsVolumes", params, function(data) {
			if (data.code == "0") {
				$.growlUI(Dict.val("common_tip"), Dict.val("ebs_create_success")); 
				$("#createEbsModal").modal("hide");
				// refresh
				ebs.updateDataTable();
			} else {
				$.growlUI(Dict.val("common_tip"), Dict.val("ebs_create_fail")+": " + data.msg); 
			}
		});
	},
	// 修改弹性块存储名称和描述  createUserId??????
	modifyEbs : function(id,name,comment) {		
				var params = {
						"id" : id,
						"instanceName": name,
						"comment" : comment,
						"modOrLarge" : 1
				};
				Dcp.biz.apiRequest("/instance/ebs/modifyEbsVolumeAttributes", params, function(data){
					if(data.code == "0"){
						$.growlUI(Dict.val("common_tip"), Dict.val("ebs_modify_success")); 
						$("#modifyEbsModal").modal("hide");
						// refresh
						ebs.updateDataTable();
					} else {
						$.growlUI(Dict.val("common_tip"), Dict.val("ebs_modify_fail")+": " + data.msg); 
					}
				});
	},
	//弹性块存储扩容
	modifyEbsStorageSize : function(id,storageSize) {
		//只有当选中一个弹性块存储时修改名称和备注，其他情况友情提示
				var params = {
						"id" : id,
						"storageSize": storageSize,
						"modOrLarge" : 2
				};
				Dcp.biz.apiRequest("/instance/ebs/modifyEbsVolumeAttributes", params, function(data){
					if(data.code == "0"){
						$.growlUI(Dict.val("common_tip"), Dict.val("ebs_increase_success")); 
						$("#modifyEbsStorageSizeModal").modal("hide");
						// refresh
						ebs.updateDataTable();
					} else {
						$.growlUI(Dict.val("common_tip"), Dict.val("ebs_increase_fail")+": " + data.msg); 
					}
				});
	},
	getInstancesToAttach : function(id,ownUserId){
		//"targetOrAttached" : 1,
		//"partOrAll" : 2

			var types = [];
			types.push(1);
			types.push(3);
			types.push(10);
			var typesToAttach = types.join(",");
			var params = {
					"id" : id,				
					"ownUserId" : ownUserId,
					"typesToAttach" : typesToAttach,
					"states" : "running"
			};
			Dcp.biz.apiRequest("/instance/ebs/describeHosts", params, function(data) {
				if (data.code != "0") {
					$.growlUI(Dict.val("common_tip"), Dict.val("ebs_query_host_fail")+": " + data.msg); 
				} else {
					
					if(null != ebs.hostDatatable){
						ebs.hostDatatable.updateData(data.data);
					} else {
						ebs.hostDatatable =  new com.skyform.component.DataTable();
						ebs.attachDataTable(data.data,id);
					}
				}
			});
	},
	attachDataTable : function(data,ebsId){
		//{title : "<input type='checkbox' id='checkAll_attach'>", name : "id"},
		//{title : "ID", name : "id"},
		ebs.hostDatatable.renderByData("#hostsTable", {
			"data" : data,
			"columnDefs" : [
			     {title : Dict.val("common_bind_unbind"), name : "vmInstanceInfoId"},		     
			     {title : Dict.val("common_name"), name : "vmInstanceInfoName"}
			],
			"onColumnRender" : function(columnIndex,columnMetaData,columnData) {
				 var text = columnData[''+columnMetaData.name] || "";				 
				 if(columnIndex ==0) {
					 text = "<div class='switch switch-small' ><input type='checkbox'/></div>";
//					 text = '<input type="checkbox" value="'+text+'">';
				 }
				 
				 return text;
			},
			"afterRowRender" : function(rowIndex,data,tr) {
//				1、申请装载；2：已经装载；3：申请卸载；4：已经卸载；5：正在处理中；6：装载失败；7：卸载失败
//				int[] arr = {1,2,3,5,7};
				if(data.state == 2 || data.state == 7){
					tr.find(".switch input[type='checkbox']").attr("checked",true);
				}else if(data.state == 1 || data.state == 3 || data.state == 5){
					tr.find(".switch").attr("class","").html(Dict.val("common_operating"));
				}
				else if(data.state == 4 || data.state == 6 || data.state == 0){
					tr.find(".switch input[type='checkbox']").attr("checked",false);
				}
				tr.find(".switch").bootstrapSwitch();
				
				tr.find(".switch").on('switch-change', function (e, _data) {
					var checked = tr.find(".switch input[type='checkbox']").attr("checked");
					if(checked){
						ebs.attachEbs(ebsId,data.vmInstanceInfoId);
					}else{
						ebs.detachEbs(ebsId,data.vmInstanceInfoId);
					}
					tr.find(".switch").attr("class","").html(Dict.val("common_operating"));
				});
				tr.find(".switch input[type='checkbox']").bind('click',function(e){
					
				});
			}
		});		
	},
	enableColumnHideAndShow : function(position){
//		this.customColumnBtnPosition = position || "left";
//		if(this.columnShowOrHideCtrlDlg != null) return;
//		_addColumnShowOrHidenSwitchBtn(this,position);
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
	
	
	//挂载弹性块存储
	//TODO 根据登录的用户为createUserId赋值，此处写死1115
	attachEbs : function(id,hostIds) {		
				var params = {
						"id" : id,
						"hostIds": hostIds,
						"createUserId" : 1115
				};
				Dcp.biz.apiRequest("/instance/ebs/attachEbsVolumes", params, function(data){
					if(data.code == "0"){
						$.growlUI(Dict.val("common_tip"), Dict.val("ebs_attach_success")); 
//						$("#attachModal").modal("hide");
						// refresh
						ebs.updateDataTable();
					} else {
						$.growlUI(Dict.val("common_tip"), Dict.val("ebs_attach_fail")+": " + data.msg); 
					}
				});
	},
	// 刷新Table
	updateDataTable : function() {
		Dcp.biz.apiRequest("/instance/ebs/describeEbsVolumes", null, function(data) {
			if (data.code == 0) {
				ebs.datatable.updateData(data.data);
			}
		});
	},
	getCheckedArr : function() {
		return $("#ebsTable tbody input[type='checkbox']:checked");
	},
	// 根据选中的虚拟硬盘的选择状态判断是否将修改选项置为灰色
	showOrHideOpt : function() {
		var checkboxArr = $("#ebsTable tbody input[type='checkbox']:checked");
		if(checkboxArr.length == 0){
			$("#btn_delete").attr("disabled",true);
//			$("#moreAction").removeClass("disabled");
		} else {
			$("#btn_delete").attr("disabled",false);
		}
		if(checkboxArr.length == 1){
			$("#btn_modifyEbs").attr("disabled",false);
			$("#btn_larger").attr("disabled",false);
			$("#btn_attach").attr("disabled",false);
			$("#btn_detach").attr("disabled",false);
		} else {
			$("#btn_modifyEbs").attr("disabled",true);
			$("#btn_larger").attr("disabled",true);
			$("#btn_attach").attr("disabled",true);
			$("#btn_detach").attr("disabled",true);
		}
	},
	//获取所属用户列表
	getOwnUserList : function() {
		Dcp.biz.apiRequest("/user/describeUsers", null, function(data) {
			if (data.code != "0") {
				$.growlUI(Dict.val("common_tip"), "查询用户发生错误：" + data.msg); 
			} else {
				userListData = data.data;
				$(userListData).each(function(index, item) {
					var userOption ="<option value="+item.id+">"+item.account+"</option>";
					$("#ownUserList").append(userOption);
				});
			}
		});
	},
	// 获取所属用户account所组成的数组
	getOwnUserAccountArr : function(ownUserList) {
		var ownUserAccountArr = [];
		$(ownUserList).each(function(index, item) {
			ownUserAccountArr.push(item.account);
		});
		return ownUserAccountArr;
	},
	setOwnUser: function(){
		$("#user_name").val($("#ownUserList option:selected").text());
	},
	// 根据所选择的的用户account获取对应的用户id
	getOwnUserIdByAccount : function(ownUserAccount) {
		var ownUserId = "";
		$(userListData).each(function(index, item) {
			if (item.account == ownUserAccount) {
				ownUserId = item.id;
				return;
			}
		});
		return ownUserId;
	},
	changeUserByAccount : function(ownUserAccount) {
//		var ownUserId = "";
		$(userListData).each(function(index, item) {
			if (item.account == ownUserAccount) {
				$("#ownUserList").val(item.id);
//				ownUserId = item.id;
				
//				return;
			}
		});
//		return ownUserId;
	},
//	getInstancesToDetach : function(ebsId){
//		var params = {
//				"diskInstanceInfoId" : ebsId,				
//				"states" : 2
//		};
//		Dcp.biz.apiRequest("/instance/ebs/describeHostsRelated", params, function(data) {
//			if (data.code != "0") {
//				$.growlUI(Dict.val("common_tip"), "查询用户已经购买的运行状态的资源发生错误：" + data.msg); 
//			} else {
//				if(null != ebs.hostDatatable_detach){
//					ebs.hostDatatable_detach.updateData(data.data);
//				} else {
//					ebs.hostDatatable_detach =  new com.skyform.component.DataTable();
//					ebs.detachDataTable(data.data);
//				}
//			}
//		});
//	},
	detachDataTable : function(data) {
		ebs.hostDatatable_detach.renderByData("#ebsUnloadTable", {
			"data" : data,
			"columnDefs" : [
			     {title : "<input type='checkbox' id='checkAll_detach'>", name : "vmInstanceInfoId"},
			     {title : "ID", name : "vmInstanceInfoId"},
			     {title : Dict.val("common_name"), name : "vmInstanceInfoName"}
			],
			"onColumnRender" : function(columnIndex,columnMetaData,columnData) {
				 var text = columnData[''+columnMetaData.name] || "";
				 if(columnIndex ==0) {
					 text = '<input type="checkbox" value="'+text+'">';
				 }
				 return text;
			}
		});		
	},
	//解挂弹性块存储
	detachEbs : function(ebsId,hostIds) {
//		var checkedArr = $("#ebsUnloadTable tbody input[type='checkbox']:checked");
//		var volumeNames = "";
//		var volumeIds = [];
//		$(checkedArr).each(function(index, item) {
//			var tr = $(item).parents("tr");
//			volumeNames += $($("td", tr)[2]).text();
//			var id = $("input[type='checkbox']", $("td", tr)[0]).val();
//			volumeIds.push(id);
//			if (index < checkedArr.length - 1) {
//				volumeNames += ",";
//			}
//		});
		
//		var _hostIds = volumeIds.join(",");
//		var ids = $("#ebsTable tbody input[type='checkbox']:checked");
				var params = {
						"id" : ebsId,
						"hostIds": hostIds
				};
				Dcp.biz.apiRequest("/instance/ebs/detachEbsVolumes", params, function(data){
					if(data.code == "0"){
						$.growlUI(Dict.val("common_tip"), Dict.val("ebs_detach_fail")); 
//						$("#ebsUnload").modal("hide");
					} else {
						$.growlUI(Dict.val("common_tip"), Dict.val("ebs_attach_fail")+": " + data.msg); 
					}
				});
	},
	getRelateHosts : function(ebsId){
		$("#relateHosts").html("");
		var params = {
				"diskInstanceInfoId" : ebsId,				
				"states" : "1,2,3,5,7"
		};
		Dcp.biz.apiRequest("/instance/ebs/describeHostsRelated", params, function(data) {
			if (data.code != "0") {
				$.growlUI(Dict.val("common_tip"), Dict.val("ebs_query_relate_res_fail")+": " + data.msg); 
			} else {
				var array = data.data;
				if(array == null || array.length == 0) {
					return;
				}else{
//					<li class="detail-item"><span>关联存储</span> <a>Vdisk#0001</a></li>
//					var dom = "<tbody>";
					var dom = "";
					$(array).each(function(i) {							
						dom += "<li class=\"detail-item\">"
								+"<span>"+array[i].vmInstanceInfoName+"</span>&nbsp;&nbsp;&nbsp;&nbsp;"
								+"<a>"+array[i].vmInstanceInfoId+"</a>"
								+"</li>";
					});
//					dom += "</tbody>";
					$("#relateHosts").append(dom);
				}
			}
		});
	},
	handleLi : function(index){
		if(index==0){
			//只有当选中一个弹性块存储时修改名称和备注，其他情况友情提示
			var ids = $("#ebsTable tbody input[type='checkbox']:checked");
			if(ids.length == 1){
				var oldInstanceName = ebs.getCheckedArr().parents("tr").find("td:eq(2)").html();
				var oldComment = ebs.getCheckedArr().parents("tr").attr("comment");
				$("#modInsName").val(oldInstanceName);
				$("#modComment").val(oldComment);
				$("#modifyEbsModal").modal("show");				
			} else {
				$.growlUI(Dict.val("common_tip"), Dict.val("ebs_modify_selectone")); 
			}						
		}
		else if(index==1){
			var ids = $("#ebsTable tbody input[type='checkbox']:checked");				
			if(ids.length == 1){
				var _state = ebs.getCheckedArr().parents("tr").attr("state");
				if(_state == 'running'){
					var ownUserId = ebs.getCheckedArr().parents("tr").attr("ownUserId");
					//显示用户可以挂载的资源
					ebs.getInstancesToAttach($(ids[0]).val(),ownUserId);	
					$("#attachModal").modal("show");
					
				}else{
					$.growlUI(Dict.val("common_tip"), Dict.val("ebs_attach_only_running")); 
				}
			}else {
				$.growlUI(Dict.val("common_tip"), Dict.val("ebs_attach_selectone")); 
			}			
		}
		else if(index==2){
			//只有当选中一个弹性块存储时修改名称和备注，其他情况友情提示
			var ids = $("#ebsTable tbody input[type='checkbox']:checked");
			if(ids.length == 1){
				var state = ebs.getCheckedArr().parents("tr").find("td:eq(3)").html();
				var size = ebs.getCheckedArr().parents("tr").find("td:eq(4)").html();
				if(state == Dict.val("common_ins_state_running")){
					//设置原来的old值
					ebs.initExpandSlider(size);
					$("#amount1").val(size);			
					
					$("#modifyEbsStorageSizeModal").modal("show");
				}else{
					$.growlUI(Dict.val("common_tip"), Dict.val("ebs_increase_only_running")); 
				}					
			} else {
				$.growlUI(Dict.val("common_tip"), Dict.val("ebs_increase_selectone")); 
			}				
		}
		else if(index==3){
			if(ebs.beforeDelete()){
				var checkedArr =  ebs.getCheckedArr();
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
				var ebsIds = volumeIds.join(",");
				ebs.destroyDisk(ebsIds);					
			}
		}	
//		else if(index==4){
//			var ids = $("#ebsTable tbody input[type='checkbox']:checked");				
//			if(ids.length == 1){
//				var _state = ebs.getCheckedArr().parents("tr").attr("state");
//				if(_state == 'running'){
////					var ownUserId = ebs.getCheckedArr().parents("tr").attr("ownUserId");
//					//显示用户可以解挂的资源
//					ebs.getInstancesToDetach($(ids[0]).val());						
//					$("#ebsUnload").modal("show");
//					
//				}else{
//					$.growlUI(Dict.val("common_tip"), Dict.val("ebs_detach_only_running")); 
//				}
//			}else {
//				$.growlUI(Dict.val("common_tip"), Dict.val("ebs_detach_selectone")); 
//			}			
//		}
	}, 
	initExpandSlider : function(size){
		$( "#slider-range-min1" ).slider({
			range: "min",
			value: parseInt(size),
			min: parseInt(size),
			max: 500,
			step: 10,
			slide: function( event, ui ) {			
				$("#amount1").val(ui.value);
//				var sp = $("#amount01").val();
				calcChange();
			}
		});
		$( "#amount1" ).val($( "#slider-range-min1" ).slider( "value" ) );
		$("#amount1").bind("keydown",function(e){
			if (e.which == 13) { // 获取Enter键值
				e.preventDefault(); // 阻止表单按Enter键默认行为，防止按回车键提交表单
				var realValue1 = parseInt(parseInt($("#amount1").val())/10) * 10 ;
				$( "#slider-range-min1" ).slider( "option", "value", realValue1);
				$("#amount1").val(realValue1);			
			}
		});
		$("#amount1").bind("blur",function(e){
				e.preventDefault(); // 阻止表单按Enter键默认行为，防止按回车键提交表单
				var realValue1 = parseInt(parseInt($("#amount1").val())/10) * 10 ;
				$( "#slider-range-min1" ).slider( "option", "value", realValue1);
				$("#amount1").val(realValue1);			
		});
   		
   	}, 
   	beforeDelete : function(){
		var checkedArr =  ebs.getCheckedArr();
		var volumeNames = "";
		var volumeIds = [];
		var _reuslt = true;
		$(checkedArr).each(function(index, item) {
			var tr = $(item).parents("tr");					
			var id = $("input[type='checkbox']", $("td", tr)[0]).val();
			var state = $(tr).attr("state");
			if(state != 'running'){
				$.growlUI(Dict.val("common_tip"), Dict.valParam("ebs_remove_only_running",null,[id]));
				_reuslt = false;
			}
			if(ebs.isEbsAttached(id)){
				$.growlUI(Dict.val("common_tip"), Dict.valParam("ebs_remove_attached",null,[id])); 
				_reuslt = false;
			}
		});	
   		return _reuslt;
   	},
   	isEbsAttached : function(id){
		//TODO 删除之前判断是否挂载了vm?????????????????????????? "state" : 2 已经解挂状态的可以删除
   		//正在挂载的ebs也不允许删除
		var params = {
				"diskInstanceInfoId" : id,	
				"states" : "1,2,3,5,6,7"
		};
		var result = false;
		///instance/ebs/describeIris
		Dcp.biz.apiRequest("/instance/ebs/describeHostsRelated", params, function(data) {
			if (data.code != "0") {
				$.growlUI(Dict.val("common_tip"), Dict.val("ebs_query_relate_res_fail")+": " + data.msg); 
			} else {
				var array = data.data;
				if(array == null || array.length == 0) {
					
				}else{
					result = true;						
				}
			}
		});
   		return result;
   	},
   	destroyDisk : function(ebsIds) {			
		var confirmModal = new com.skyform.component.Modal(new Date().getTime(),Dict.val("ebs_remove"),"<h4>"+Dict.val("ebs_remove_confirm")+"</h4>",{
			buttons : [
				{
					name : Dict.val("common_confirm"),
					onClick : function(){
						// 删除弹性块存储
						var params = {
								"ids" : ebsIds
						};
						Dcp.biz.apiRequest("/instance/ebs/deleteEbsVolumes", params, function(data) {
							if (data.code == 0) {
								$.growlUI(Dict.val("common_tip"), Dict.val("ebs_remove_success")); 
								confirmModal.hide();
								// refresh
								ebs.updateDataTable();
							} else {
								$.growlUI(Dict.val("common_tip"), Dict.val("ebs_remove_fail")+": " + data.msg); 
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
	}	
	};

	
	function calc() {
		//随着slider的变化 价格部分作出相应的变化
			var buycount = ebs.createCountInput.getValue();
			var count = parseInt(buycount),capacity=parseInt($("#amount").val());	
			$("#span1").html(capacity/100);
			$("#span2").html(count);
			$("#span3").html((count*capacity/100).toFixed(1));
			$("#span4").html((count*capacity*7.2).toFixed(1));		
		};
		function calcChange(){
//			var buycount = ebs.createCountInput.getValue();
//			var count1 = parseInt(buycount),capacity1=parseInt($("#amount1").val());
			var capacity1=parseInt($("#amount1").val());
			$("#span5").html(capacity1/100);
//			$("#span6").html(count1);
//			$("#span7").html((count1*capacity1/100).toFixed(1));
//			$("#span8").html((count1*capacity1*7.2).toFixed(1));	
			$("#span7").html((capacity1/100).toFixed(1));
			$("#span8").html((capacity1*7.2).toFixed(1));	
		};			   	