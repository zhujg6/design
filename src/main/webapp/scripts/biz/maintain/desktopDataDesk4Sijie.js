var desktopDataDesk = {
	dtTable:null,
	scope : "dataDesk",
	currentChecked:null,
	init:function(){
		desktopDataDesk.refreshData();
		$('#refreshDataDesk').bind('click', function() {
			desktopDataDesk.refreshData();
		});
		$('#searchDataDesk').bind('click', function() {
			desktopDataDesk.refreshData();
		});
		$('#createDataDesk').bind('click', function() {
		    desktopDataDesk.newInstance();
		});
	},
	refreshData:function(){
		if (desktopDataDesk.dtTable)
			desktopDataDesk.dtTable.container
					.find("tbody")
					.html("<tr ><td colspan='9' style='text-align:center;'><img src='"
							+ CONTEXT_PATH
							+ "/images/loader.gif'/><strong>"
							+ Dict.val("common_retrieving_data_please_wait")
							+ "</strong></td></tr>");
		var params = desktopDataDesk.getCondition();
		com.skyform.service.desktopCloudService.queryTabStoreBlock(params,
				function(data) {
					desktopDataDesk.data = data;
					desktopDataDesk._refreshDataTable(data);
				}, function(msg) {
					if (!msg) {
						msg = Dict.val("common_unknown_error");
					}
					$.growlUI(Dict.val("common_error") + ":" + msg);
				});    
				  
	},
	getCondition:function(){
		var params={"userName":"","subsId":""};
		if($("#queryStatus").val()!=""&&$("#queryStatus").val()!=null){
			if($("#queryStatus").val()=="1"){
		        params.subsId=$("#queryName").val();
			}
			if($("#queryStatus").val()=="2"){
		        params.userName=$("#queryName").val();
			}
			
		}
		return params;
	},
	_refreshDataTable : function(data) {
		if (desktopDataDesk.dtTable) {
			desktopDataDesk.dtTable.updateData(data);
		} else {
			desktopDataDesk.dtTable = new com.skyform.component.DataTable();
			desktopDataDesk.dtTable.renderByData(
					"#desktop_dataDesk_instanceTable", {
						pageSize : 5,
						data : data,
						onColumnRender : function(columnIndex, columnMetaData,
								columnData) {
							var text = columnData["" + columnMetaData.name] || "";
							if (columnMetaData.name == "id") {
								return "<input type='radio' name='dataDeskName' value='"+ columnData["subscriptionId"] + "'/>";
							} else if (columnMetaData.name == 'status') {
			        	  		return com.skyform.service.StateService.getState("",columnData.status);
							}else if (columnMetaData.name == 'createDate') {
								text = text?new Date(text).format("yyyy-MM-dd hh:mm:ss"):"";
							}else if (columnMetaData.name == 'inactiveDate') {
								text = text?new Date(text).format("yyyy-MM-dd hh:mm:ss"):"";
							}
						     return text;
						},
						afterRowRender : function(rowIndex, data, tr) {
							tr.attr("instanceId", data.subscriptionId);
							tr.attr("instanceState", data.status);

							tr.find("input[type='radio']").click(function() {
								desktopDataDesk.currentChecked=$(this).val();
								desktopDataDesk.onInstanceSelected(); 
							});
						},
						afterTableRender : function() {
							 desktopDataDesk.onInstanceSelected();
						}
					});

			desktopDataDesk.dtTable.addToobarButton($("#toolbar4dataDesk"));
		}
	},
	 onInstanceSelected : function(selectInstance) {//单选一个触发的操作
	 	$("#desktop_dataDesk_instanceTable input[type='radio']").each(function(key,value){
   	         if(desktopDataDesk.currentChecked==$(value).val()){
   	         	$(this).attr("checked", true);
   	         }
   	    });
		var allCheckedBox = $("#desktop_dataDesk_instanceTable tbody input[type='radio']:checked");
		var rightClicked = selectInstance ? true : false;
		var state = $(allCheckedBox[0]).parents("tr").attr("instanceState");
		if (selectInstance) {
			state = selectInstance.state;
		}
		var oneSelected = allCheckedBox.length == 1;
		var hasSelected = allCheckedBox.length > 0;
		$("div[scope='" + desktopDataDesk.scope + "'] .operation").addClass("disabled");
		$("div[scope='" + desktopDataDesk.scope + "'] .operation").each(
				function(index, operation) {
					var condition = $(operation).attr("condition");
					var action = $(operation).attr("action");
					var enabled = true;
					eval("enabled=(" + condition + ")");
					if (enabled) {
						$(operation).removeClass("disabled");
					} else {
						$(operation).addClass("disabled");
					}
					desktopDataDesk._bindAction();
				});
		if (rightClicked) {
			desktopDataDesk.selectedInstanceId = selectInstance.id;
		} else {
			for (var i = 0; i < allCheckedBox.length; i++) {
				var currentCheckBox = $(allCheckedBox[i]);
				if (i == 0) {
					desktopDataDesk.selectedInstanceId = currentCheckBox.attr("value");
				} else {
					desktopDataDesk.selectedInstanceId += ","+ currentCheckBox.attr("value");
				}
			}
		}
	},
	_bindAction : function() {
		$("div[scope='" + desktopDataDesk.scope+ "'] #toolbar4dataDesk .actionBtn").unbind("click").click(
				function() {
					if ($(this).hasClass("disabled")) return;
					var action = $(this).attr("action");
					desktopDataDesk._invokeAction(action);
				});
	},

	_invokeAction : function(action) {
		var invoker = desktopDataDesk["" + action];
		if (invoker && typeof invoker == 'function') {
			invoker();
		}
	},
	newInstance:function(){
		$("#cloudNum").val("");
	    $("#cloudNumHidden").val("");
		if (!CommonEnum.offLineBill) {
			$("#billTypeDataDesk")
					.html('<a class="div_block subFee active ty" href="javascript:;" name="billTypeDataDesk" value="0">'
							+ Dict.val("common_month")
							+ '</a>'
							+ '<a class="div_block subFee ty" href="javascript:;" name="billTypeDataDesk" value="3">'
							+ Dict.val("common_year") + '</a>');
		} else {
			//$("#configFeeDiv").remove();
			$("#billTypeDataDesk")
					.html('<a class="div_block active ty" href="javascript:;" name="billTypeDataDesk" value="5">VIP</a>');
		}
							
		initsliderButton("createDataDiskSizeDC","dataDiskDC",150,10,10);
		// 数据盘
		$( "#dataDiskDC" ).slider({
			range: "min",
			value: 10,
			min: 10,
			max: 150,
			step: 10,
			slide: function( event, ui ) {
				$("#createDataDiskSizeDC").val(ui.value);
			}
		});		
		$("#createDataDiskSizeDC").bind("blur",function(){			
			var value = $("#dataDiskDC" ).slider("value");
			var newValue = $(this).val();			
			if(/^[1-9]+[0-9]*$/.test(""+newValue) &&  parseInt(newValue)>= 10 && parseInt(newValue) <= 150) {
				newValue = parseInt(newValue/10) * 10;
				$(this).val(newValue);
				$("#dataDiskDC" ).slider("value",newValue);
			} else {
				$(this).val(value);				
			}	
		});	
		$("#createDataDiskSizeDC").bind("change",function(){
			$( "#dataDiskDC" ).slider( "option", "value", $("#createDataDiskSizeDC").val());
		});
		$("#createDataDiskSizeDC").bind("keydown",function(){
			$("#dataDiskMsgDC").empty().html("<span class='text-error'>"+Dict.val("vm_please_enter_multiple")+"</span>");			
		});	
		$( "#createDataDiskSizeDC" ).val($( "#dataDiskDC" ).slider( "value" ) );
		//$.blockUI({message:null,baseZ:100,overlayCSS:{cursor:'default'}});
		$("#dataDeskMask").show();
		$("#dataDeskDiv").show();
		$("#dataDeskSearchBtn").unbind("click").bind("click",function(){
		  $("#cloudAccountModal").off("shown").on("shown",function(){
		  	    $("#cloudAccountNum").val("");
		  	    $("#cloudAccountName").val("");
		        desktopDataDesk.queryNoBindTabStoreBlock();
		  });
		  $("#cloudAccountModal").modal("show");
		  $("#cloudAccountSave").unbind("click").bind("click",function(){
		  	   var checked = $("#cloudAccountTable tbody input[type='radio']:checked");
		  	   var tempData = $(checked).val();
				if (!tempData) {
					$.growlUI("请选择云桌面用户！！！");
					return;
				}
				$("#cloudNum").val($(checked).attr("userName"));
				$("#cloudNumHidden").val(tempData);
				$("#cloudAccountModal").modal("hide");
		  });
		  $("#cloudAccountSearch").unbind("click").bind("click",function(){
		      desktopDataDesk.queryNoBindTabStoreBlock();
		  })
		});
		//input框失去焦点事件
		$("#dataDisk").bind("blur",function(){
			desktopDataDesk.dataDiskNameValiter();
		});
		$("#orderCycle").bind("blur",function(){
			desktopDataDesk.dataDiskOrderCycleValiter();
		});
		$("#cloudNum").bind("blur",function(){
			desktopDataDesk.dataDiskCloudNumValiter();
		});
		$("#dataDeskDivSave").unbind("click").bind("click",function(){
			desktopDataDesk.dataDiskNameValiter();
			desktopDataDesk.dataDiskOrderCycleValiter();
			desktopDataDesk.dataDiskCloudNumValiter();
			var length=$(".onError").length;
			desktopDataDesk.getDataDiskData.blockSize=$( "#createDataDiskSizeDC" ).val();
			if(length==0){
				com.skyform.service.desktopCloudService.createTabStoreBlock(desktopDataDesk.getDataDiskData,function onSuccess(data){
				   // 清空
					$("#dataDisk").val("");
					$("#orderCycle").val("");
					$("#cloudNum").val("");
					$("#dataDeskDiv").hide();
					$("#dataDeskMask").hide();
				   $.growlUI("数据盘创建成功");
				   desktopDataDesk.refreshData();
				},function onError(msg){
					// 清空
					$("#dataDisk").val("");
					$("#orderCycle").val("");
					$("#cloudNum").val("");
					$("#dataDeskDiv").hide();
					$("#dataDeskMask").hide();
					ErrorMgr.showError(msg);
				});
			}
		});
		$("#dataDeskDivRest").unbind("click").bind("click",function(){
			$("#dataDisk").val("");
			$("#orderCycle").val("");
			$("#cloudNum").val("");
		    $("#dataDeskDiv").hide();
		    $("#dataDeskMask").hide();
			$("#dataDiskTip").hide();
			$("#orderCycleTip1").hide();
			$("#orderCycleTip2").hide();
			$("#cloudNumTip").hide();
		});
	},
	queryNoBindTabStoreBlock:function(){
		  	var params={
		  		"tenantId":0,
		  		"userName":"",
		  		"tenantName":""
		  		};
		  	if($("#cloudAccountNum").val()!=""&&$("#cloudAccountNum").val()!=null){
		  	   params.userName=$("#cloudAccountNum").val();
		  	}
		  	if($("#cloudAccountName").val()!=""&&$("#cloudAccountName").val()!=null){
		  	   params.tenantName=$("#cloudAccountName").val();
		  	}
		    com.skyform.service.desktopCloudService.queryTenantNoBindTabStoreBlock(params,function onSuccess(data){
		    	desktopDataDesk._refreshTenantNoBindDtTable(data);
		    },function onError(msg){
		    	$.growlUI(Dict.val("common_error") + ":" + msg);
		    });
	  },
	//刷新表格
    _refreshTenantNoBindDtTable: function (data) {
        if (desktopDataDesk.NoBindDtDtTable) {
            desktopDataDesk.NoBindDtDtTable.updateData(data);
        } else {
            desktopDataDesk.NoBindDtDtTable = new com.skyform.component.DataTable();
            desktopDataDesk.NoBindDtDtTable.renderByData("#cloudAccountTable", {
                pageSize: 5,
                data: data,
                "columnDefs": [
                    {title: "选定", name: "tenantId"},
                    {title: "云桌面帐号", name: "userName"},
                    {title: "用户名称", name: "tenantName"},
                    {title: "联系电话", name: "phoneNumber"},
                    {title: "邮箱", name: "tenantMail"},
                    {title: "创建时间", name: "createDate"}
                ],
                onColumnRender: function (columnIndex, columnMetaData, columnData) {
                    if (columnMetaData.name == 'tenantId') {
                        return text = '<input type="radio" name="accountTableName" ' +
                        'userName="'+columnData.userName+'"'+
                        'value="' + columnData.tenantId + '" />';
                    } else if (columnMetaData.name == "createDate") {
                        var text = columnData["" + columnMetaData.name]
                        text = text ? new Date(text).format("yyyy-MM-dd hh:mm:ss") : "";
                        return text;
                    }
                    else {
                        return columnData[columnMetaData.name];
                    }
                },
                afterRowRender: function (rowIndex, data, tr) {
                },
                afterTableRender: function () {
                    $("#cloudAccountTable_filter").hide();
                }
            });
        }
    },
	//创建数据盘中的三个判断
	getDataDiskData:{},
	dataDiskNameValiter:function(){
		desktopDataDesk.getDataDiskData.instanceName=$("#dataDisk").val();
		if(desktopDataDesk.getDataDiskData.instanceName==""){
			$("#dataDiskTip").addClass("onError").show();
		}else{
			$("#dataDiskTip").removeClass("onError").hide();
		}
	},
	dataDiskOrderCycleValiter:function(){
		desktopDataDesk.getDataDiskData.period=parseInt($("#orderCycle").val());
		if(desktopDataDesk.getDataDiskData.period==""){
			$("#orderCycleTip1").addClass("onError").show();
			$("#orderCycleTip2").removeClass("onError").hide();
		}else{
			$("#orderCycleTip1").removeClass("onError").hide();
			if(/^([1-9]|10|11|12)$/.test(desktopDataDesk.getDataDiskData.period)){
				$("#orderCycleTip2").removeClass("onError").hide();
			}else{
				$("#orderCycleTip2").addClass("onError").show();
			}
		}
	},
	dataDiskCloudNumValiter:function(){
		desktopDataDesk.getDataDiskData.tenant_id=$("#cloudNumHidden").val();
		if(desktopDataDesk.getDataDiskData.tenant_id==""){
			$("#cloudNumTip").addClass("onError").show();
		}else{
			$("#cloudNumTip").removeClass("onError").hide();
		}
	},
	destoryDataDesk:function(){
			ConfirmWindow.setTitle("数据盘销毁").setContent("<h4>确定要销毁数据盘？</h4>").onSave = function(){
				var subsId = desktopDataDesk.selectedInstanceId;
				if(valiter.isNull(subsId)){
					$.growlUI("请选择要销毁的数据盘！");
					ConfirmWindow.hide();
					return;
				}
				    var param = {"subsId": subsId};
					com.skyform.service.desktopCloudService.deleteTabStoreBlock(param,function (data){
						$.growlUI("销毁数据盘成功");
						desktopDataDesk.refreshData();
					},function (error){
						ErrorMgr.showError(error);
					});
				ConfirmWindow.hide();
			};
			ConfirmWindow.setWidth(500).autoAlign().setTop(100);
			ConfirmWindow.show();
		}
};
