var desktopDistribution = {
    service: com.skyform.service.desktopCloudService,
    dtTable: null,
    scope: "distribution",
    currentChecked:null,
    cloudType : {
		"01" : "专有桌面",
		"02" : "随机桌面"
	},
    data: [],
    init: function () {
        desktopDistribution.refreshData();
        desktopDistribution._bindAction();
        if (CommonEnum.offLineBill) {
			desktopDistribution.typeParams = {
				"serviceType" : 1015,
				"billType" : 5
			};
		} else {
			desktopDistribution.typeParams = {
				"serviceType" : 1015,
				"billType" : 0
			};
		}
    },
    //随机桌面刷新按钮
    refreshData: function () {
        if(desktopDistribution.dtTable)
        desktopDistribution.dtTable.container.find("tbody").html("<tr ><td colspan='7' style='text-align:center;'><img src='"+CONTEXT_PATH+"/images/loader.gif'/><strong>"+Dict.val("common_retrieving_data_please_wait")+"</strong></td></tr>");
        var params = {
            "cloudType": "02"
        };
        desktopDistribution.service.queryRandomTab(params, function onSuccess(data) {
            desktopDistribution.data = data;
            desktopDistribution._refreshDtTable(desktopDistribution.data);
        }, function onError(msg) {
            ErrorMgr.showError(msg);
        });
    },
    _refreshDtTable: function (data) {
        if (desktopDistribution.dtTable) {
            desktopDistribution.dtTable.updateData(data);
        } else {
            desktopDistribution.dtTable = new com.skyform.component.DataTable();
            desktopDistribution.dtTable.renderByData("#distributionTable", {
                pageSize: 5,
                data: data,
                onColumnRender: function (columnIndex, columnMetaData, columnData) {
                	var text = columnData["" + columnMetaData.name] || "";
                    if (columnMetaData.name == 'id') {
                        return text = "<input type='radio' name='distributionName' value='" + columnData.createTime + 
                        "' os='"+columnData.os+
                        "' osDisk='"+columnData.osDisk+
                        "' siteId='"+columnData.siteId+
                        "' memorySize='"+columnData.memorySize+
                        "' cpuNum='"+columnData.cpuNum+"'>";
                    }
                    return text;
                },
                afterRowRender: function (rowIndex, data, tr) {
                    //console.log(data);
                    tr.attr("instanceId", data.subscriptionId);
                    tr.attr("cloudType", data.cloudType);
                    tr.attr("dliName", data.dliName);
                    tr.attr("desktopNum", data.desktopNum);
                    tr.attr("memory", data.memory);
                    tr.attr("id", data.id);
                    tr.attr("serviceFactory", data.serviceFactory);

                    //TODO   右键操作资源功能
                    tr.find("input[type='radio']").click(function () {
                        desktopDistribution.currentChecked=$(this);
                        desktopDistribution.onInstanceSelected();
                    });
                },
                afterTableRender: function () {
                    $("#distributionTable_filter").hide();
                    desktopDistribution.onInstanceSelected();
                    /*$("#distributionTable input[type='radio']").each(function(key,value){
			   	         if(desktopDistribution.currentChecked==$(value).val()){
			   	         	$(this).attr("checked", true);
			   	         }
			   	    });*/
                    if (!desktopDistribution.ContextMenu) {
                        desktopDistribution.ContextMenu = new ContextMenu({
                            container: "#contextMenuDistribution",
                            beforeShow: function (tr) {
                                $("#distributionTable input[type='radio']").attr("checked", false);
                                tr.find("input[type='radio']").attr("checked", true);
                            },
                            afterShow: function (tr) {
                               /* desktopDistribution.onInstanceSelected({
                                    id: tr.attr("instanceId"),
                                    state: tr.attr("instanceState")
                                });*/
                            },
                            onAction: function (action) {
                                desktopDistribution._invokeAction(action);
                            },
                            trigger: "#distributionTable tr"
                        });
                    } else {
                        desktopDistribution.ContextMenu.reset();
                    }

                }
            });
        }
    },
    _bindAction: function () {
        $("div[scope='" + desktopDistribution.scope + "'] #toolbar4distribution .actionBtn").unbind().click(function () {
            if ($(this).hasClass("disabled")) return;
            var action = $(this).attr("action");
            desktopDistribution._invokeAction(action);
        });
    },
   onInstanceSelected: function (selectInstance) {
        var allCheckedBox = $("#distributionTable tbody input[type='radio']:checked");
        var rightClicked = selectInstance ? true : false;
        var state = $(allCheckedBox[0]).parents("tr").attr("instanceState");
        var instanceID = $(allCheckedBox[0]).parents("tr").attr("instanceId");
        if (instanceID) {
            desktopDistribution.selectedInstanceId = instanceID;
        }
        var oneSelected = allCheckedBox.length == 1;
        var hasSelected = allCheckedBox.length > 0;
        $("div[scope='" + desktopDistribution.scope + "'] .operation").addClass("disabled");
        $("div[scope='" + desktopDistribution.scope + "'] .operation").each(function (index, operation) {
            var condition = $(operation).attr("condition");
            var action = $(operation).attr("action");
            var enabled = true;
            eval("enabled=(" + condition + ")");
            if (enabled) {
                $(operation).removeClass("disabled");
            } else {
                $(operation).addClass("disabled");
            }
            desktopDistribution._bindAction();
        });
        if (rightClicked) {
            desktopDistribution.selectedInstanceId = selectInstance.id;
        } else {
            for (var i = 0; i < allCheckedBox.length; i++) {
                var currentCheckBox = $(allCheckedBox[i]);
                if (i == 0) {
                    desktopDistribution.selectedInstanceId = currentCheckBox.attr("value");
                } else {
                    desktopDistribution.selectedInstanceId += "," + currentCheckBox.attr("value");
                }
            }
        }

    },
    _invokeAction: function (action) {
        var invoker = desktopDistribution["" + action];
        if (invoker && typeof invoker == 'function') {
            invoker();
        }
    },
//绑定用户页面
    randomBindUserDtTable: null,      //随机桌面绑定用户页面表格
    bindUserCheckedData: null,   //被选中的用户信息
    //查询条件
    getRandomBindUserCondition: function () {
        var params = {
            "serviceFactory": "citrix",
            "cloudType": "02"
        };
        params.userName = $("#randomDeskNum").val();
        params.tenantName = $("#randomUserName").val();
        return params;
    },
    //绑定用户页面事件
    bindUser: function () {
        $("#bindUserModal").off("shown").on("shown", function () {
        	$("#randomDeskNum").val("");
            $("#randomUserName").val("");
            desktopDistribution.refreshRandomBindUserData();
        });
        $("#bindUserModal").modal("show");
        //绑定用户查询按钮
        $("#bindUserSearch").unbind("click").bind("click", function () {
            desktopDistribution.refreshRandomBindUserData();
        });
        //绑定用户提交按钮
        $("#bindUserSubmit").unbind("click").bind("click", function() {
				// console.log(desktopDistribution.bindUserCheckedData);
				// TODO 把desktopDistribution.bindUserCheckedData传给后台

				var temp = $("#userInfo tbody input[type='radio']:checked");
				var tempData = $(temp).val();
				if (!tempData) {
					$.growlUI("请选择云桌面用户！！！");
					return;
				}
				if (!desktopDistribution.currentChecked) {
					$.growlUI("请选择随机桌面！！！");
					return;
				}
				 var params = {
				 	"tenantId":tempData,
		        	"os":desktopDistribution.currentChecked.attr("os"),
		        	"osDisk":desktopDistribution.currentChecked.attr("osDisk"), 
		        	"siteId":desktopDistribution.currentChecked.attr("siteId"), 
		        	"memorySize":desktopDistribution.currentChecked.attr("memorySize"),
		        	"cpuNum":desktopDistribution.currentChecked.attr("cpuNum")
		        };
				com.skyform.service.desktopCloudService.bindingRandomDesk(params, function onSuccess(data) {
					    $.growlUI("绑定用户提交成功！！！");
		                $("#bindUserModal").modal("hide");
		                desktopDistribution.bindUserCheckedData = null;
		                desktopDistribution.currentChecked=null;
		                setTimeout("desktopDistribution.refreshData()",3000);
		                //desktopDistribution.refreshData();
			       },function onError(msg) {
			       	 $("#bindUserModal").modal("hide");
					 ErrorMgr.showError(msg);
				});

			
		});
        // 绑定用户取消按钮
        $("#bindUserCancle").unbind("click").bind("click", function () {
            $("#bindUserModal").modal("hide");
            desktopDistribution.bindUserCheckedData = null;
        });
    },
//随机桌面绑定用户页面刷新数据
    refreshRandomBindUserData: function () {
        if(desktopDistribution.randomBindUserDtTable)
        	desktopDistribution.randomBindUserDtTable.container.find("tbody").html("<tr ><td colspan='7' style='text-align:center;'><img src='"+CONTEXT_PATH+"/images/loader.gif'/><strong>"+Dict.val("common_retrieving_data_please_wait")+"</strong></td></tr>");
        var params = desktopDistribution.getRandomBindUserCondition();
        desktopDistribution.service.queryUnRandomDeskUser(params, function onSuccess(data) {
            desktopDistribution._refreshRandomBindUserDtTable(data);
        }, function onError(msg) {
            ErrorMgr.showError(msg);
        });
    },
    //刷新表格
    _refreshRandomBindUserDtTable: function (data) {
        if (desktopDistribution.randomBindUserDtTable) {
            desktopDistribution.randomBindUserDtTable.updateData(data);
        } else {
            desktopDistribution.randomBindUserDtTable = new com.skyform.component.DataTable();
            desktopDistribution.randomBindUserDtTable.renderByData("#userInfo", {
                pageSize: 5,
                data: data,
                "columnDefs": [
                    {title: "选定", name: "ID"},
                    {title: "云桌面帐号", name: "UserID"},
                    {title: "用户名称", name: "UserName"},
                    {title: "联系电话", name: "mobile"},
                    {title: "邮箱", name: "email"},
                    {title: "创建时间", name: "createTime"}
                ],
                onColumnRender: function (columnIndex, columnMetaData, columnData) {
                    if (columnMetaData.name == 'ID') {
                        return text = '<input type="radio" name="userName" ' +
                        'value="' + columnData.tenantId + '" />';
                    } else if (columnMetaData.name == "createTime") {
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
                    $("#userInfo_filter").hide();
                }
            });
        }
    },

//用户解绑页面
    randomUnBindUserDtTable: null,
    unBindUserCheckedData: null,
    //查询条件
    getRandomUnBindUserCondition: function () {
        var checked = $("#distributionTable tbody input[type='radio']:checked");
        var params = {
        	"os":$(checked).attr("os"),
        	"osDisk":$(checked).attr("osDisk"), 
        	"siteId":$(checked).attr("siteId"), 
        	"memorySize":$(checked).attr("memorySize"),
        	"cpuNum":$(checked).attr("cpuNum")
        };
        params.userName = $("#unBindRandomDeskNum").val();
        params.tenantName = $("#unBindRandomUserName").val();
        return params;
    },
    unBindUser: function () {
        $('#unBindUser').off('shown').on('shown', function () {
        	$("#unBindRandomDeskNum").val("");
            $("#unBindRandomUserName").val("");
            desktopDistribution.refreshRandomUnBindUserData();
        });
        $("#unBindUser").modal("show");
        //查询按钮
        $("#unBindUserSearch").unbind("click").bind("click", function () {
            desktopDistribution.refreshRandomUnBindUserData();
        });
        //拿到选中的checkbox数据
        $("#unBindUserInfo").off("click").on("click", "input[type='radio']", function () {
            var checked = $("#unBindUserInfo input[type='radio']:checked");
            desktopDistribution.unBindUserCheckedData = {};
            desktopDistribution.unBindUserCheckedData.tenantId = $(checked).val();
        });
        //用户解绑提交按钮
        $("#unBindUserSubmit").unbind("click").bind("click", function () {
            if (desktopDistribution.unBindUserCheckedData == null) {
                $.growlUI("提示","请选择要解绑的用户");
            } else {
                //console.log(desktopDistribution.unBindUserCheckedData);
                //   TODO   把desktopDistribution.unBindUserCheckedData传给后台
            	if(!desktopDistribution.currentChecked){
            		$.growlUI("提示","请选择随机桌面");
            		return;
            	}
		        var params = {
		        	"tenantId":desktopDistribution.unBindUserCheckedData.tenantId,
		        	"os":desktopDistribution.currentChecked.attr("os"),
		        	"osDisk":desktopDistribution.currentChecked.attr("osDisk"), 
		        	"siteId":desktopDistribution.currentChecked.attr("siteId"), 
		        	"memorySize":desktopDistribution.currentChecked.attr("memorySize"),
		        	"cpuNum":desktopDistribution.currentChecked.attr("cpuNum")
		        };
               com.skyform.service.desktopCloudService.unbindingRandomDesk(params,function onSuccess(data){
	               	 // 清空该数据
	                 $.growlUI("解绑用户提交成功！！！");
	                $("#unBindUser").modal("hide");
	                desktopDistribution.unBindUserCheckedData = null;
	                desktopDistribution.currentChecked=null;
	                setTimeout("desktopDistribution.refreshData()",3000);
	                //desktopDistribution.refreshData();
	              },function onError(msg){
	              	$("#unBindUser").modal("hide");
	              	ErrorMgr.showError("用户解绑失败："+msg);
	              }
               );
            }
        });
        //用户解绑取消按钮
        $("#unBindUserCancle").unbind("click").bind("click", function () {
            $("#unBindUser").modal("hide");
            desktopDistribution.unBindUserCheckedData = null;
        });
    },
    refreshRandomUnBindUserData: function () {
        if(desktopDistribution.randomUnBindUserDtTable)
        	desktopDistribution.randomUnBindUserDtTable.container.find("tbody").html("<tr ><td colspan='7' style='text-align:center;'><img src='"+CONTEXT_PATH+"/images/loader.gif'/><strong>"+Dict.val("common_retrieving_data_please_wait")+"</strong></td></tr>");
        var params = desktopDistribution.getRandomUnBindUserCondition();
        desktopDistribution.service.getRandomTenantInfo(params, function onSuccess(data) {
            //console.log(params);
            //console.log(data);
            desktopDistribution._refreshRandomUnBindUserDtTable(data);
        }, function onError(msg) {
            ErrorMgr.showError(msg);
        });
    },

    _refreshRandomUnBindUserDtTable: function (data) {
        if (desktopDistribution.randomUnBindUserDtTable) {
            desktopDistribution.randomUnBindUserDtTable.updateData(data);
        } else {
            desktopDistribution.randomUnBindUserDtTable = new com.skyform.component.DataTable();
            desktopDistribution.randomUnBindUserDtTable.renderByData("#unBindUserInfo", {
                pageSize: 5,
                data: data,
                "columnDefs": [
                    {title: "选定", name: "id"},
                    {title: "云桌面帐号", name: "userName"},
                    {title: "用户名称", name: "tenantName"},
                    {title: "联系电话", name: "phoneNumber"},
                    {title: "邮箱", name: "tenantMail"},
                    {title: "创建时间", name: "createDate"}
                ],
                onColumnRender: function (columnIndex, columnMetaData, columnData) {
                    if (columnMetaData.name == "id") {
                        return "<input type='radio' name='bindProperName'" +
                            "value='" + columnData["tenantId"] + "'/>";
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
                    $("#unBindUserInfo_filter").hide();
                }
            });
        }
    },

    //查看详情页面
    randomUserDetailsDtTable: null,
    randomDeskDetailsDtTable: null,
    viewDetails: function () {
        $('#viewDetails').off('shown').on('shown', function () {
            desktopDistribution.refreshRandomUserDetailsData();
            desktopDistribution.refreshRandomDeskDetailsData();
        });
        $("#viewDetails").modal("show");
        $('#viewDetailsReturn').unbind("click").bind("click", function () {
            $("#viewDetails").modal("hide");
        });
    },
    //用户详情
    refreshRandomUserDetailsData: function () {
    	var checked = $("#distributionTable tbody input[type='radio']:checked");
        var params = {
        	"tenantName":"",
        	"userName":"",
        	"os":$(checked).attr("os"),
        	"osDisk":$(checked).attr("osDisk"), 
        	"siteId":$(checked).attr("siteId"), 
        	"memorySize":$(checked).attr("memorySize"),
        	"cpuNum":$(checked).attr("cpuNum")
        };
        desktopDistribution.service.getRandomTenantInfo(params, function onSuccess(data) {
            desktopDistribution._refreshRandomUserDetailsDtTable(data);
        }, function onError(msg) {
            ErrorMgr.showError(msg);
        });
    },
    _refreshRandomUserDetailsDtTable: function (data) {
        if (desktopDistribution.randomUserDetailsDtTable) {
            desktopDistribution.randomUserDetailsDtTable.updateData(data);
        } else {
            desktopDistribution.randomUserDetailsDtTable = new com.skyform.component.DataTable();
            desktopDistribution.randomUserDetailsDtTable.renderByData("#userDetails", {
                pageSize: 3,
                data: data,
                "columnDefs": [
                    {title: "区域", name: "dliName"},
                    {title: "云桌面帐号", name: "userName"},
                    {title: "用户姓名", name: "tenantName"},
                    {title: "联系电话", name: "phoneNumber"},
                    {title: "邮箱", name: "tenantMail"},
                    {title: "公司名称", name: "companyName"},
                    {title: "创建时间", name: "createDate"}
                ],
                onColumnRender: function (columnIndex, columnMetaData, columnData) {
                     if (columnMetaData.name == "createDate") {
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
                    $("#userDetails_filter").hide();
                }
            });
        }
    },
    //桌面详情
    refreshRandomDeskDetailsData: function () {
        var checked = $("#distributionTable tbody input[type='radio']:checked");
        var params = {
        	"os":$(checked).attr("os"),
        	"osDisk":$(checked).attr("osDisk"), 
        	"siteId":$(checked).attr("siteId"), 
        	"memorySize":$(checked).attr("memorySize"),
        	"cpuNum":$(checked).attr("cpuNum")
        };
        desktopDistribution.service.getRandomTabInfo(params,function onSuccess(data){
           desktopDistribution._refreshRandomDeskDetailsDtTable(data);
        },function onError(msg){
        	ErrorMgr.showError(msg);
        });
    },
    _refreshRandomDeskDetailsDtTable: function (data) {
        if (desktopDistribution.randomDeskDetailsDtTable) {
            desktopDistribution.randomDeskDetailsDtTable.updateData(data);
        } else {
            desktopDistribution.randomDeskDetailsDtTable = new com.skyform.component.DataTable();
            desktopDistribution.randomDeskDetailsDtTable.renderByData("#deskDetails", {
                pageSize: 3,
                data: data,
                "columnDefs": [
                    {title: "", name: "UserID"},
                    {title: "区域", name: "dliName"},
                    {title: "云桌面ID", name: "serviceName"},
                    {title: "状态", name: "status"},
                    {title: "创建时间", name: "createTime"},
                    {title: "到期时间", name: "inactiveDate"},
                    {title: "配置信息", name: "tempLeteInfo"}
                ],
                onColumnRender: function (columnIndex, columnMetaData, columnData) {
                    /*if(columnMetaData.name=="UserID") {
                     return "<input type='radio' name='bindProperName'" +
                     " UserID='" + columnData["UserID"] +"' " +
                     " UserName='" + columnData["UserName"] +"' " +
                     " companyName='" + columnData["companyName"] +"' " +
                     " mobile='" + columnData["mobile"] +"' " +
                     " email='" + columnData["email"] +"' " +
                     " createTime='" + columnData["createTime"] +"' " +
                     "value='" + columnData["id"] +"'/>" ;
                     }else */
                    if (columnMetaData.name == "createTime") {
                        var text = columnData["" + columnMetaData.name]
                        text = text ? new Date(text).format("yyyy-MM-dd hh:mm:ss") : "";
                        return text;
                    }else if (columnMetaData.name == 'status') {
						return com.skyform.service.StateService.getState("",columnData['status']);
					}else if(columnMetaData.name == "inactiveDate") {
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
                    $("#deskDetails_filter").hide();
                }
            });
        }
    },

    //随机桌面创建按钮
    //accIdList: [],
    create: function () {
        $("#_image_Random").empty();
        $("#_areaNameVal_Random").empty();
        $("#_configInfo_Random").empty();
        $("#_orderNumber_Random").empty();
        $("#orderTimeUnitLong_Random").empty();
        $("#selectQuotaFalg_Random").empty();

        $("#_orderTime_Random").empty().html("1");
        /*if(desktopDistribution.data4==""){
         $.growlUI(Dict.val("common_tip"), Dict.val("dc_no_desktop_user_information_unbound"));
         return;
         }*/
        var currdesktopResPool = null;
        var billTypeVal = 0;
        var queryFeeParams = new Object();
        queryFeeParams.period = 1;
        //queryFeeParams.productPropertyList=new Array();
        //
        queryFeeParams.verifyFlag = "0";
        queryFeeParams.productPropertyList = [];
        //queryFeeParams.productPropertyList.length=0;


//										var queryFeeParams={
//												"period":1,
//												"productPropertyList":[],
//												"verifyFlag":"0"
////												"count":1
//										}
        var productDetailParams = {
            "muProperty": "",
            "muPropertyValue": "1"

        }
//										{"period":1,"productPropertyList":[{"muProperty":"cpuNum","muPropertyValue":"1","productId":101},{"muProperty"
//											:"memorySize","muPropertyValue":"4","productId":101},{"muProperty":"OS","muPropertyValue":"1","productId"
//											:101}],"verifyFlag":"0"}
        var desktopParamsAll = new Object();
        desktopParamsAll.period = 1;
        desktopParamsAll.count = 0;
        desktopParamsAll.productList = [];
        /*
         var desktopParamsAll={
         "period":"1",
         "count":0,
         //												"resPool":"",
         "productList":[],
         };
         */
//										var desktopParams={
//													"productId": 0,
//													"osDisk": "",
//													"OS": "",
//													"cpuNum": "",
//													"memorySize": "",
//													"dataDisk": 0,
//													"BAND_WIDTH": 0,
//													"CloudTabUsers": []
//
//										};
        var desktopParams = new Object();

        //desktopParams.productId=1025;
        desktopParams.cloudType="02";
        desktopParams.resPool = "";
        desktopParams.osDisk = "";
        desktopParams.OS = "";
        desktopParams.cpuNum = "";
        desktopParams.memorySize = "";
       // desktopParams.storageSize = "150";
        //desktopParams.BAND_WIDTH="0";
       // desktopParams.CloudTabUsers = [];
        var m = 0;

        //$('#createDataDiskSize_Random').val('1');
        if (!desktopDistribution.newFormModal) {
            desktopDistribution.newFormModal = new com.skyform.component.Modal("newDesktopCloudForm2_Random", "<h3>" + Dict.val("dc_create_cloud_desktop") + "</h3>",
                $("script#new_DesktopCloud_form2_Random").html(), {
                    buttons: [
                        {
                            name: Dict.val("common_determine"),
                            onClick: function () {
                               // desktopParams.CloudTabUsers = desktopDistribution.accIdList;
                                if (Number($("#orderTimeLong_Random").val()) == 0) {
                                    $("#orderTimeUnitLong").empty().html(Dict.val("dc_please_enter_purchase_long"));
                                    return;
                                }
                                if (Number($("#orderTimeLong_Random").val()) <= 12 && Number($("#orderTimeLong_Random").val()) >= 0) {
                                } else {
                                    return;
                                }
                                var p = /^[1-9](\d+(\.\d{1,2})?)?$/;
								if (!p.test($("#orderNumber_Random").val().trim())) {
									$("#orderNumberRandomSpan").empty().html("请输入大于0的数字");
									return;
								}
								
								var msgLength=$(".onError").length;
								if(msgLength>0){
									return;
								}
								
                                desktopParamsAll.productList.length = 0;
                                desktopParamsAll.count=parseInt($("#orderNumber_Random").val().trim());
                                desktopParams.storageSize = "";
                                desktopParams.BAND_WIDTH = "";
                                desktopParamsAll.productList.push(desktopParams);
                                //desktopParamsAll.productList=desktopParams;

                                desktopDistribution._save(desktopParamsAll);
                            },
                            attrs: [{name: 'class', value: 'btn btn-primary'}]
                        },
                        {
                            name: Dict.val("common_cancel"),
                            onClick: function () {
                                desktopDistribution.newFormModal.hide();
                            },
                            attrs: [{name: 'class', value: 'btn'}]
                        }
                    ],
                    beforeShow: function (container) {
                       // desktopDistribution.accIdList = [];
                        var portalType = Dcp.biz.getCurrentPortalType();
                        if (!CommonEnum.offLineBill) {

                            $("#billType_Random").html('<a class="div_block subFee active ty" href="javascript:;" name="billType1" value="0">' + Dict.val("common_monthly") + '</a>'
                            + '<a class="div_block subFee ty" href="javascript:;" name="billType1" value="3">' + "包年" + '</a>');
                        } else {
                            $("#configFeeDiv_Random").remove();
                            $("#billType_Random").html('<a class="div_block active ty" href="javascript:;" name="billType1" value="5">VIP</a>');

                        }
                        $("#areaNameId_Random").html("");
                        $("#_ostemplates_Random").html("");


                        com.skyform.service.desktopCloudService.queryDesktopConfigInfo(desktopDistribution.typeParams, function (data) {
                            desktopDistribution.createDesktopCloudData = data;
                            desktopParams.productId = parseInt(data.resoucepool[0].productId);
                            //desktopParams.productId=1025;
                            var html = "";
                            var flag = true;
                            $.each(data.resoucepool, function (key, value) {
                            if(value.serviceFactroy!="huawei"){
                                if (flag) {
                                    currdesktopResPool = value.name;
                                    desktopParams.resPool = currdesktopResPool;
                                    $("#_areaNameVal_Random").html(value.desc);
//													    				desktopParamsAll.resoucePool=value.name;
                                    flag = false;
                                }
                                html += "<option value=" + value.name +  " productId=" + value.productId + " serviceFactroy=" + value.serviceFactroy + ">" + value.desc + "</option><br\>";
                             }
                            });
                            $("#areaNameId_Random").append(html);
                           /* var servicefactroy = $('#areaNameId_Random option:selected').attr("servicefactroy");
                            //查询用户信息
                            var params2 = {
                                "serviceFactory": servicefactroy
                            };
                            desktopDistribution.getTenantInfoByArea(params2);*/
                            var oshtml = "";
                            var flagos = true;
                            $.each(data.oslist, function (key, value) {
                                $.each(value.resourcePool, function (osresPoolkey, osresPoolVal) {
                                    if (osresPoolVal.name == currdesktopResPool) {
                                        if (flagos) {
                                            $("#_image_Random").html(value.desc);
                                            $("#osDiskSize_Random").html(value.osDisk);
                                            desktopParams.osDisk = value.osDisk;
                                            desktopParams.OS = value.OS;
                                            flagos = false;
                                        }
                                        oshtml += "<option value='" + value.OS + "' name='" + value.desc + "' osDisk='" + value.osDisk + "'>" + value.desc + "</option><br\>";
                                    }
                                });
                            });
                            $("#_ostemplates_Random").append(oshtml);
                            $("#config_Random").html("");
                            $("#os_config_Random").html("");
                            var confightml = "";
                            var currVal = null;
                            var currmemoryVal = null;
                            var cpuVal = null;
                            var memoryVal = null;
                            var desc = null;
                            var isCurrResPoolFlag = false;
                            var configflag = true;
                            $.each(data.vmConfig, function (key, value) {
                                $.each(value.config, function (key1, value1) {
                                    $.each(value1.memory, function (key2, value2) {
                                        $.each(value2.resourcePool, function (key3, value3) {
                                            if (currdesktopResPool == value3.name) {
                                                isCurrResPoolFlag = true;
                                            }
                                        });
                                    });
                                });
                                if (isCurrResPoolFlag) {
                                    var osConfigHtml = "";
                                    if ($("#os_config_Random").html() == "") {

                                        currVal = value.type;
                                        $.each(value.config, function (key1, value1) {
                                            desc = value1.desc;
                                            cpuVal = value1.cpuNum;
                                            $.each(value1.memory, function (key2, value2) {
                                                if (key2 == 0) {
                                                    memoryVal = value2.memorySize;
                                                    currmemoryVal = value2.memorySize + Dict.val("dc_g_ram");
                                                    osConfigHtml += "<div class='ty active subFee div_block' value='base' memorySize='" + value2.memorySize + "'>" + value1.desc + " " + value2.memorySize + Dict.val("dc_g_ram") + "</div>"
                                                } else {
                                                    osConfigHtml += "<div class='ty  subFee div_block' value='base' memorySize='" + value2.memorySize + "'>" + value1.desc + " " + value2.memorySize + Dict.val("dc_g_ram") + "</div>"
                                                }
                                            });
                                            if (key1 == 0) {
                                                $("#os_config_Random").append(osConfigHtml);
                                            } else {
                                                $("#os_config_Random").append("<div class='ty  subFee div_block' value='base' >" + value1.desc + " " + value1.cpuNum + "</div>");
                                            }
                                        });
                                        confightml += "<div class='ty active subFee div_block' value='base' name='configval'>" + value.type + "</div>";
                                    } else {
                                        confightml += "<div class='ty  subFee div_block' value='base' name='configval'>" + value.type + "</div>";
                                    }
                                    desktopParams.cpuNum = cpuVal;
                                    desktopParams.memorySize = memoryVal;
                                    isCurrResPoolFlag = false;
                                }
                            });
                            $("#config_Random").append(confightml);
                            $("#_configInfo_Random").html(currVal + " " + desc + " " + currmemoryVal);
                            if (configflag) {
                                queryFeeParams.productPropertyList.length = 0;
                                var cpuParams = {
                                    "muProperty": "cpuNum",
                                    "muPropertyValue": cpuVal,
                                    "productId": desktopParams.productId
                                };
                                queryFeeParams.productPropertyList.push(cpuParams);
                                var memoryParams = {
                                    "muProperty": "memorySize",
                                    "muPropertyValue": memoryVal,
                                    "productId": desktopParams.productId
                                };
                                queryFeeParams.productPropertyList.push(memoryParams);

                                configflag = false;
                            }
//
                            desktopDistribution.getFeeParams = queryFeeParams;
                        }, function (data) {
                        });
                        $("#orderNumber_Random").val("1");
                        if (!CommonEnum.offLineBill) {
                            setTimeout('desktopDistribution.getFee()', 5);
                        }
                    },
                    afterShow: function () {
                        $(".func-table tr").on('mouseover', function () {

                            $(this).find("td:eq(0)").css({
                                "background": "#bbb none repeat scroll 0 0",
                                "color": "black"
                            });
                        });
                        $(".func-table tr").on('mouseout', function () {

                            $(this).find("td:eq(0)").css({
                                "background": "#f2f2f2 none repeat scroll 0 0",
                                "color": "#CACACA"
                            });
                        });


                        $(".price").html('0');
                        $("#orderTimeLong_Random").val('1');
                       // desktopParams.storageSize = "20";
                        var firsttrchecked = true;
                        var p = /^[1-9](\d+(\.\d{1,2})?)?$/;

                        $("#orderTimeLong_Random").bind("keyup", function () {
                            $("#orderTimeUnitLong").empty();
                            var tt = $("#orderTimeLong_Random").val().trim();
                            if (p.test(tt)) {
                                $("#orderTimeUnitLong").empty();
                                if (parseInt(tt) > 0 && parseInt(tt) <= 12) {
                                    $("#orderTimeUnitLong").empty();
                                } else {
                                    $("#orderTimeUnitLong").empty().html("请输入1到12的整数");
                                    return;
                                }
                            } else {
                                $("#orderTimeUnitLong").empty().html("请输入数字");
                            }


                            if (billTypeVal == "0" || billTypeVal == "5") {
                                billTypeVal = 1;
                            } else if (billTypeVal == "3") {
                                billTypeVal = 12;
                            }

                            $("#_orderTime_Random").html($("#orderTimeLong_Random").val());
                            desktopParamsAll.period = (parseInt($("#orderTimeLong_Random").val()) * billTypeVal);
                            desktopDistribution.getFeeParams = {};
                            desktopDistribution.getFeeParams.period = parseInt($("#orderTimeLong_Random").val()) * billTypeVal;
                            queryFeeParams.period = parseInt($("#orderTimeLong_Random").val()) * billTypeVal;
                            desktopDistribution.getFeeParams = queryFeeParams;
                        });
                        
                        $("#orderNumber_Random").bind("keyup", function() {
								$("#orderNumberRandomSpan").empty();
								var tt = $("#orderNumber_Random").val().trim();
								if (!p.test(tt)) {
									$("#orderNumberRandomSpan").empty().html("请输入大于0的数字");
								}else
								    $("#_orderNumber_Random").html($("#orderNumber_Random").val());

						});
							
                        $("div[name='configval']").unbind("click").bind("click", function () {
                            $("div[name='configval']").removeClass("active");
                            $(this).addClass("active");
                            var currVal = $(this).html();
                            var desc = null;
                            var osConfigHtml1 = "";
                            var currmemoryVal1 = null;
                            var currObj = null;
                            var datas = desktopDistribution.createDesktopCloudData.vmConfig;
                            var deskmemorySize = null;
                            var cpuNumVal = null;
                            $.each(datas, function (key, value) {
                                if (currVal == value.type) {
                                    $.each(value.config, function (key1, value1) {
                                        $("#os_config_Random").html("");
                                        desc = value1.desc;
                                        cpuNumVal = value1.cpuNum;
                                        desktopParams.cpuNum = value1.cpuNum;
                                        $.each(value1.memory, function (key2, value2) {
                                            if (key2 == 0) {
                                                currmemoryVal1 = value2.memorySize + Dict.val("dc_g_ram");
                                                desktopParams.memorySize = value2.memorySize;
                                                deskmemorySize = value2.memorySize;
                                                osConfigHtml1 += "<div class='ty active subFee div_block' value='base' memorySize='" + value2.memorySize + "'>" + value1.desc + " " + value2.memorySize + Dict.val("dc_g_ram") + "</div>"
                                            } else {
                                                osConfigHtml1 += "<div class='ty  subFee div_block' value='base' memorySize='" + value2.memorySize + "'>" + value1.desc + " " + value2.memorySize + Dict.val("dc_g_ram") + "</div>"
                                            }
                                        });
                                        if (key1 == 0) {
                                            $("#os_config_Random").append(osConfigHtml1);
                                        } else {
                                            $("#os_config_Random").append("<div class='ty  subFee div_block' value='base' >" + value1.desc + "</div>");
                                        }

                                    });
                                }
                            });
                            $("#_configInfo_Random").html(currVal + " " + desc + " " + currmemoryVal1);
                            var keyOpt = -1;

                            var cpuParams = {
                                "muProperty": "cpuNum",
                                "muPropertyValue": cpuNumVal,
                                "productId": desktopParams.productId
                            };
                            var cpuFlag = true;
                            if (queryFeeParams.productPropertyList.length > 0) {

                                $.each(queryFeeParams.productPropertyList, function (key, value) {
                                    if (value.muProperty == "cpuNum") {

                                        cpuFlag = false;
                                        value.muPropertyValue = cpuNumVal;
                                    }
                                });

                            } else {

                                cpuFlag = false;
                                queryFeeParams.productPropertyList.push(cpuParams);
                            }
                            if (cpuFlag) {

                                //cpuFlag=false;
                                queryFeeParams.productPropertyList.push(cpuParams);
                            }


                            var memoryParams = {
                                "muProperty": "memorySize",
                                "muPropertyValue": deskmemorySize,
                                "productId": desktopParams.productId
                            };
                            var flagVal = true;
                            if (queryFeeParams.productPropertyList.length > 0) {
                                $.each(queryFeeParams.productPropertyList, function (key, value) {
                                    if (value.muProperty == "memorySize") {
                                        flagVal = false;
                                        value.muPropertyValue = deskmemorySize;
                                    }
                                });

                            } else {
                                flagVal = false;
                                queryFeeParams.productPropertyList.push(memoryParams);
                            }
                            if (flagVal) {
                                queryFeeParams.productPropertyList.push(memoryParams);
                            }
                        });

                        $("a[name='billType1']").bind(" click ", function () {
                            $("a[name='billType1']").removeClass("active");
                            $(this).addClass("active");
                            billTypeVal = $(this).attr("value");
                            var unit = "";
                            if ($(this).attr("value") == 0 || $(this).attr("value") == 5) {
                                queryFeeParams.period = 1
                                unit = Dict.val("common_month");
                            } else if ($(this).attr("value") == 3) {
                                queryFeeParams.period = 12
                                unit = Dict.val("common_year");
                            }
                            billTypeVal = $(this).attr("value");
                            $("#_orderTimeUnit_Random").html(unit);
                            $("#orderTimeUnit1_Random").html(unit);

                        });
                        $("#_ostemplates_Random").bind("change", function () {
                            var option = ($(this).find("option[value='" + $(this).val() + "']"));
                            $("#_image_Random").empty().html(option.attr("name"));
                            $("#osDiskSize_Random").empty().html(option.attr("osDisk"));
                            desktopParams.osDisk = option.attr("osDisk");
                            desktopParams.OS = option.val();
                            var dataList = queryFeeParams.productPropertyList;
                            var keyPostion = null;
                            var data = {
                                "muProperty": "OS",
                                "muPropertyValue": "11",
                                "productId": desktopParams.productId
                            };

                            if (dataList.length > 0) {
                                $.each(dataList, function (key, value) {
                                    if (value.muProperty == "OS") {
                                        keyPostion = key;
                                    }

                                });
                            }
                            if (null == keyPostion) {
                                dataList.push(data);
                            } else {
                                var index = $.inArray(data, dataList);
                                if (null != keyPostion) {
                                    dataList.splice(keyPostion, 1);
                                }
                            }
                            desktopDistribution.getFeeParams = queryFeeParams;
                        });
                        $("#areaNameId_Random").bind("change", function () {
                            $("#_ostemplates_Random").html("");
                            $("#_areaNameVal_Random").html($(this).text());
                            currdesktopResPool = $(this).val();
                            if(!currdesktopResPool) return;
                            var paramsArea={
				        			   customerId:""+currentUser.id,
				        			   ddcId:currdesktopResPool
				        	   };
                            desktopCloud.service.getIta(paramsArea,function(result){
			        			   //查询成功
			        			   //查询到ou值 可保存数据到后台，未查到，关闭ui，显示错误
				    			if(result.length==0){
			    					$("#randomAreaMsg").addClass("onError").show();
			    				}else{
			    					$("#randomAreaMsg").removeClass("onError").hide();
			    				}
			        			   
			        		   },function(error){
			        		   	   $("#randomAreaMsg").addClass("onError").show();
			        			   $.growlUI("查询域错误，请联系管理员");
			        			   return;
			        		   });
                            var productid = $('#areaNameId_Random option:selected').attr("productid");
                            desktopParams.productId = parseInt(productid);
                            var servicefactroy = $('#areaNameId_Random option:selected').attr("servicefactroy");
                            //查询用户信息
                            var params2 = {
                                "serviceFactory": servicefactroy
                            };
                            var oshtml = "";
                            var flagos = true;
                            desktopParams.resPool = currdesktopResPool;
                            $.each(desktopDistribution.createDesktopCloudData.oslist, function (key, value) {
                                $.each(value.resourcePool, function (osresPoolkey, osresPoolVal) {
                                    if (osresPoolVal.name == currdesktopResPool) {

                                        if (flagos) {
                                            $("#_image_Random").html(value.desc);
                                            $("#osDiskSize_Random").html(value.osDisk);
                                            desktopParams.osDisk = value.osDisk;
                                            flagos = false;
                                        }
                                        oshtml += "<option value='" + value.OS + "' name='" + value.desc + "' osDisk='" + value.osDisk + "'>" + value.desc + "</option><br\>";
                                    }
                                });
                            });
                            $("#_ostemplates_Random").append(oshtml);
                            $("#config_Random").html("");
                            $("#os_config_Random").html("");
                            var confightml = "";
                            var currVal = null;
                            var currmemoryVal = null;
                            var desc = null;
                            var isCurrResPoolFlag = false;
                            $.each(desktopDistribution.createDesktopCloudData.vmConfig, function (key, value) {
                                $.each(value.config, function (key1, value1) {
                                    $.each(value1.memory, function (key2, value2) {
                                        $.each(value2.resourcePool, function (key3, value3) {
                                            if (currdesktopResPool == value3.name) {
                                                isCurrResPoolFlag = true;
                                            }
                                        });
                                    });
                                });
                                if (isCurrResPoolFlag) {
                                    var osConfigHtml = "";
                                    if ($("#os_config_Random").html() == "") {
                                        currVal = value.type;

                                        $.each(value.config, function (key1, value1) {
                                            desc = value1.desc;
                                            $.each(value1.memory, function (key2, value2) {
                                                if (key2 == 0) {
                                                    currmemoryVal = value2.memorySize + Dict.val("dc_g_ram");
                                                    osConfigHtml += "<div class='ty active subFee div_block' value='base' memorySize='" + value2.memorySize + "'>" + value1.desc + " " + value2.memorySize + Dict.val("dc_g_ram") + "</div>"
                                                } else {
                                                    osConfigHtml += "<div class='ty  subFee div_block' value='base' memorySize='" + value2.memorySize + "'>" + value1.desc + " " + value2.memorySize + Dict.val("dc_g_ram") + "</div>"
                                                }
                                            });
                                            if (key1 == 0) {
                                                $("#os_config_Random").append(osConfigHtml);
                                            } else {
                                                $("#os_config_Random").append("<div class='ty  subFee div_block' value='base' >" + value1.desc + " " + value1.cpuNum + "</div>");
                                            }
                                        });
                                        confightml += "<div class='ty active subFee div_block' value='base' name='configval'>" + value.type + "</div>";
                                    } else {
                                        confightml += "<div class='ty  subFee div_block' value='base' name='configval'>" + value.type + "</div>";
                                    }
                                    isCurrResPoolFlag = false;
                                }
                            });
                            $("#config_Random").append(confightml);
                            $("#_configInfo_Random").html(currVal + " " + desc + " " + currmemoryVal);
                            var configflag = true;
                            $("div[name='configval']").unbind("click").bind("click", function () {
                                $("div[name='configval']").removeClass("active");
                                $(this).addClass("active");
                                var currVal = $(this).html();
                                var desc = null;
                                var osConfigHtml1 = "";
                                var cpuNumVal = null;
                                var currmemoryVal1 = null;
                                var datas = desktopDistribution.createDesktopCloudData.vmConfig;
                                desktopDistribution.getFeeParams = {};
                                $.each(datas, function (key, value) {
                                    if (currVal == value.type) {
                                        $.each(value.config, function (key1, value1) {
                                            cpuNumVal = value1.cpuNum;
                                            $("#os_config_Random").html("");
                                            desc = value1.desc;
                                            desktopParams.cpuNum = value1.cpuNum;
                                            $.each(value1.memory, function (key2, value2) {
                                                if (key2 == 0) {
                                                    currmemoryVal1 = value2.memorySize + Dict.val("dc_g_ram");
                                                    desktopParams.memorySize = value2.memorySize;
                                                    osConfigHtml1 += "<div class='ty active subFee div_block' value='base' memorySize='" + value2.memorySize + "'>" + value1.desc + " " + value2.memorySize + Dict.val("dc_g_ram") + "</div>"
                                                } else {
                                                    osConfigHtml1 += "<div class='ty  subFee div_block' value='base' memorySize='" + value2.memorySize + "'>" + value1.desc + " " + value2.memorySize + Dict.val("dc_g_ram") + "</div>"
                                                }
                                            });
                                            if (key1 == 0) {
                                                $("#os_config_Random").append(osConfigHtml1);
                                            } else {
                                                $("#os_config_Random").append("<div class='ty  subFee div_block' value='base' >" + value1.desc + "</div>");
                                            }
                                        });
                                    }
                                });
//														    		{"period":1,"productPropertyList":[{"muProperty":"cpuNum","muPropertyValue":"1","productId":101},{"muProperty"
//														    			:"memorySize","muPropertyValue":"4","productId":101},{"muProperty":"OS","muPropertyValue":"1","productId"
//														    			:101}],"verifyFlag":"0"}
                                $("#_configInfo_Random").html(currVal + " " + desc + " " + currmemoryVal1);
//														    		desktopDistribution.getFeeParams.memorySize=desktopParams.memorySize;
//														    		desktopDistribution.getFeeParams.cpuNum=cpuNumVal;
                                var cpuParams = {
                                    "muProperty": "cpuNum",
                                    "muPropertyValue": desktopParams.cpuNum,
                                    "productId": desktopParams.productId
                                };
                                var memoryParams = {
                                    "muProperty": "memorySize",
                                    "muPropertyValue": desktopParams.memorySize,
                                    "productId": desktopParams.productId
                                };
                                if (configflag) {


                                    queryFeeParams.productPropertyList.push(cpuParams);

                                    queryFeeParams.productPropertyList.push(memoryParams);

                                    configflag = false;
                                } else {
                                    var cpuParamsflagVal = true;
                                    if (queryFeeParams.productPropertyList.length > 0) {
                                        $.each(queryFeeParams.productPropertyList, function (key, value) {
                                            if (value.muProperty == "cpuNum") {
                                                cpuParamsflagVal = false;
                                                value.muPropertyValue = desktopParams.cpuNum;
                                            }
                                        });

                                    } else {
                                        cpuParamsflagVal = false;
                                        queryFeeParams.productPropertyList.push(cpuParams);
                                    }
                                    if (cpuParamsflagVal) {
                                        queryFeeParams.productPropertyList.push(cpuParams);
                                    }
                                    var memorySizeflagVal = true;
                                    if (queryFeeParams.productPropertyList.length > 0) {
                                        $.each(queryFeeParams.productPropertyList, function (key, value) {
                                            if (value.muProperty == "memorySize") {
                                                memorySizeflagVal = false;
                                                value.muPropertyValue = desktopParams.memorySize;
                                            }
                                        });

                                    } else {
                                        memorySizeflagVal = false;
                                        queryFeeParams.productPropertyList.push(memoryParams);
                                    }
                                    if (memorySizeflagVal) {
                                        queryFeeParams.productPropertyList.push(memoryParams);
                                    }
                                }
                                desktopDistribution.getFeeParams = queryFeeParams;
//
                            });
                            if (!CommonEnum.offLineBill) {
                                setTimeout('desktopDistribution.getFee()', 5);
                            }
                        });
                         $("#areaNameId_Random").trigger("change");
                        $("div[name='deskType']").unbind("click").bind("click", function () {
                            $("div[name='deskType']").removeClass("active");
                            $(this).addClass("active");
                        });
                        $(".subFee").bind('mouseup keyup', function () {
                            if (!CommonEnum.offLineBill) {
                                setTimeout('desktopDistribution.getFee()', 5);
                            }

                        });
                    }
                });
        }
        desktopDistribution.newFormModal.setWidth(1200).autoAlign().setTop(60).show();
    },
    _save : function(params) {
		com.skyform.service.desktopCloudService.createCitrixCloudTab(params,
				function onSuccess(data) {
					desktopDistribution.getFeeParams = {};
					com.skyform.service.desktopCloudService
							.deskConfirmTradeSubmit($(".price").html(),
									data.tradeId, $("#newDesktopCloudForm2"),
									function onSuccess(data) {
										// $.growlUI(Dict.val("common_tip"),
										// "操作成功");
										// $("#newDesktopCloudForm2").hide();
										$.growlUI(Dict.val("common_tip"),Dict.val("dc_create_cloud_desktop_success"));
										desktopDistribution.refreshData();
									}, function onError(msg) {
										$.growlUI(Dict.val("common_tip"),Dict.val("dc_create_cloud_desktop_failed"));
									});
					$(".price").empty().html(0);
					desktopDistribution.newFormModal.hide();
				}, function onError(msg) {
					desktopDistribution.newFormModal.hide();
					$.growlUI(Dict.val("common_tip"),
							Dict.val("dc_create_cloud_desktop_request_failed")
									+ msg);
				});
	},
    getFeeParams: null,
    getFee: function () {
        if (CommonEnum.offLineBill)return;
        var param = desktopDistribution.getFeeParams;
        if (null == param)return;
        Dcp.biz.apiAsyncRequest("/desktopCloud/pm/queryCaculateFeeByPrtyList", param, function (data) {

            $(".price").empty().html(desktopDistribution.selecedUserNumber * 600);
            if (null != data && 0 == data.code) {
                var count = desktopDistribution.selecedUserNumber;

                var fee = data.data.fee;
                $(".price").empty().html(count * fee / 1000);

            }
        });
    },


    //随机桌面重启按钮
    restartDtTable: null,
    restartCheckedData: null,
    restart: function () {
        $('#restart').off('shown').on('shown', function () {
            desktopDistribution.refreshRandomRestartData();
        });
        $("#restart").modal("show");
        //拿到选中的checkbox数据
        $("#restartInfo").off("click").on("click", "input[type='radio']", function () {
            $("#restartTip").hide();
            var checked = $("#restartInfo input[type='radio']:checked");
            desktopDistribution.restartCheckedData = {};
            desktopDistribution.restartCheckedData.subsId = $(checked).attr("subsId");
        });
        //用户解绑提交按钮
        $("#restartSubmit").unbind("click").bind("click", function () {
            if (desktopDistribution.restartCheckedData == null) {
               $.growlUI("请选择一条记录");
            } else {
                //console.log(desktopDistribution.restartCheckedData);
                //   TODO   把desktopDistribution.restartCheckedData传给后台
            	
				var subsId = desktopDistribution.restartCheckedData.subsId;
				com.skyform.service.desktopCloudService.restartCloudTab(subsId,
						function(data) {
							$.growlUI(Dict.val("common_success_operation"));
							desktopDistribution.refreshData();
						}, function(error) {
							ErrorMgr.showError(error);
	
						});		
                // 清空该数据
                desktopDistribution.restartCheckedData = null;
                $("#restart").modal("hide");
            }
        });
        $("#restartCancle").unbind("click").bind("click", function () {
            $("#restart").modal("hide");
            $("#restartTip").hide();
            desktopDistribution.restartCheckedData = null;
        });
    },
    refreshRandomRestartData: function () {
         var checked = $("#distributionTable tbody input[type='radio']:checked");
		 if (!$(checked)) {
			$.growlUI("请选择随机桌面！！！");
			return;
		  }
		 var params = {
        	"os":$(checked).attr("os"),
        	"osDisk":$(checked).attr("osDisk"), 
        	"siteId":$(checked).attr("siteId"), 
        	"memorySize":$(checked).attr("memorySize"),
        	"cpuNum":$(checked).attr("cpuNum")
        };
        desktopDistribution.service.getRandomTabInfo(params,function onSuccess(data){
        	var tempData=[];
        	if(data){
        		$.each(data,function(key,value){
        			if(value.status=="running"|| value.status=="using"){
        			  tempData.push(data[key]);
        			}
        		});
        	}
           desktopDistribution._refreshRandomRestartDtTable(tempData);
        },function onError(msg){
        	ErrorMgr.showError(msg);
        });
    },
    _refreshRandomRestartDtTable: function (data) {
        if (desktopDistribution.restartDtTable) {
            desktopDistribution.restartDtTable.updateData(data);
        } else {
            desktopDistribution.restartDtTable = new com.skyform.component.DataTable();
            desktopDistribution.restartDtTable.renderByData("#restartInfo", {
                pageSize: 6,
                data: data,
                "columnDefs": [
                    {title: "", name: "UserID"},
                    {title: "区域", name: "dliName"},
                    {title: "云桌面ID", name: "serviceName"},
                    {title: "状态", name: "status"},
                    {title: "创建时间", name: "createTime"},
                    {title: "到期时间", name: "inactiveDate"},
                    {title: "配置信息", name: "tempLeteInfo"}
                ],
                onColumnRender: function (columnIndex, columnMetaData, columnData) {
                    if (columnMetaData.name == "UserID") {
                        return "<input type='radio' name='restart'" +
                            " subsId='" + columnData["id"] + "'/>";
                    } else if (columnMetaData.name == "createTime") {
                        var text = columnData["" + columnMetaData.name]
                        text = text ? new Date(text).format("yyyy-MM-dd hh:mm:ss") : "";
                        return text;
                    }else if (columnMetaData.name == 'status') {
						return com.skyform.service.StateService.getState("",columnData['status']);
					}else if(columnMetaData.name == "inactiveDate") {
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
                    $("#restartInfo_filter").hide();
                }
            });
        }
    },
    reBuyDtTable:null,
    rebuyCheckedData: null,
    createPeridInput_renew:null,
    //随机桌面续订按钮
    reBuy: function () {
        $('#reBuyModal').off('shown').on('shown', function () {
        	desktopDistribution.initPeridInput();
        	desktopDistribution.rebuyCheckedData=null;
            desktopDistribution.refreshRandomRebuyData();
        });
        $("#reBuyModal").modal("show");
        //拿到选中的checkbox数据
        $("#reBuyInfo").off("click").on("click", "input[type='radio']", function () {
            var checked = $("#reBuyInfo input[type='radio']:checked");
            desktopDistribution.rebuyCheckedData = {};
            desktopDistribution.rebuyCheckedData.subsId = $(checked).attr("subsId");
            desktopDistribution.getFeeBySubId(desktopDistribution.rebuyCheckedData.subsId);
        });
        //用户解绑提交按钮
        $("#reBuySubmit").unbind("click").bind("click", function () {
            if (desktopDistribution.rebuyCheckedData == null) {
            	$.growlUI("请选择一条记录");
            } else {
                // 清空该数据
                $("#reBuyModal").modal("hide");
				var period = createPeridInput_renew.getValue();
				var _modal = $("#reBuyModal");
				com.skyform.service.desktopCloudService.deskRenew(
						desktopDistribution.rebuyCheckedData.subsId, period,
						function onSuccess(data) {
							// 订单提交成功后校验用户余额是否不足
							var _tradeId = data.tradeId;
							var _fee = $("#feeInput_renew").text();
							com.skyform.service.desktopCloudService.deskConfirmTradeSubmit(_fee, _tradeId,
											_modal, function onSuccess(data) {
												$.growlUI(Dict.val("common_tip"),Dict.val("dc_renew_submit_success"));
												desktopDistribution.refreshData();
											}, function onError(msg) {
												$.growlUI(Dict.val("common_tip"),Dict.val("dc_renew_failed"));
											});
						}, function onError(msg) {
							$.growlUI(Dict.val("common_tip"), Dict.val("dc_renew_application_failed")+ msg);
						});
							
            }
        });
        $("#reBuyCancle").unbind("click").bind("click", function () {
            $("#reBuyModal").modal("hide");
            desktopDistribution.rebuyCheckedData = null;
        });
    },
    refreshRandomRebuyData:function(){
         var checked = $("#distributionTable tbody input[type='radio']:checked");
		 if (!$(checked)) {
			$.growlUI("请选择随机桌面！！！");
			return;
		  }
		 var params = {
        	"os":$(checked).attr("os"),
        	"osDisk":$(checked).attr("osDisk"), 
        	"siteId":$(checked).attr("siteId"), 
        	"memorySize":$(checked).attr("memorySize"),
        	"cpuNum":$(checked).attr("cpuNum")
        };
        desktopDistribution.service.getRandomTabInfo(params,function onSuccess(data){
        	var tempData=[];
        	if(data){
        		$.each(data,function(key,value){
        			if(value.status=="running"|| value.status=="closed"){
        			  tempData.push(data[key]);
        			}
        		});
        	}
          desktopDistribution._refreshRandomRebuyDtTable(tempData);
        },function onError(msg){
        	ErrorMgr.showError(msg);
        });
    
    },
    _refreshRandomRebuyDtTable:function(data){
        if (desktopDistribution.reBuyDtTable) {
            desktopDistribution.reBuyDtTable.updateData(data);
        } else {
            desktopDistribution.reBuyDtTable = new com.skyform.component.DataTable();
            desktopDistribution.reBuyDtTable.renderByData("#reBuyInfo", {
                pageSize: 6,
                data: data,
                "columnDefs": [
                    {title: "", name: "UserID"},
                    {title: "区域", name: "dliName"},
                    {title: "云桌面ID", name: "serviceName"},
                    {title: "状态", name: "status"},
                    {title: "创建时间", name: "createTime"},
                    {title: "到期时间", name: "inactiveDate"},
                    {title: "配置信息", name: "tempLeteInfo"}
                ],
                onColumnRender: function (columnIndex, columnMetaData, columnData) {
                    if (columnMetaData.name == "UserID") {
                        return "<input type='radio' name='reBuyInfo'" +
                            " subsId='" + columnData["id"] + "' " +
                            "config='" + columnData["config"] + "'/>";
                    } else if (columnMetaData.name == "createTime") {
                        var text = columnData["" + columnMetaData.name]
                        text = text ? new Date(text).format("yyyy-MM-dd hh:mm:ss") : "";
                        return text;
                    }else if (columnMetaData.name == 'status') {
						return com.skyform.service.StateService.getState("",columnData['status']);
					}else if(columnMetaData.name == "inactiveDate") {
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
                    $("#destroyInfo_filter").hide();
                }
            });
        }
    
    },
    initPeridInput:function(){
    	var modalBody=$('#reBuyModal').find(".myRebuy");
            modalBody.find(".form-horizontal").empty();
        	if (CommonEnum.offLineBill){
				var content = 
					$('<form class="form-horizontal">' +	    
					'	<fieldset>' +
					'		<div class="control-group">' +
					'			<label class="control-label" style="width:80px;">'+Dict.val("common_renew_duration")+':</label>' +
					'			<div class="controls" style="margin-left:0px;">' +
					'				<span id="perid_renew" class="subFee_renew"></span>' +
					'				&nbsp;&nbsp;<span id="unit_name">月</span>&nbsp;&nbsp;<font color="red" >*</font><span id="peridUnit_renew"></span>&nbsp;&nbsp;' +
					'				<span id="tipPerid_renew" style="color: red"></span>' +
					'			</div>' +
					'		</div>' +		
					'		<div class="control-group">' +
					'			<label style="">'+Dict.val("common_renew_tip")+'</label>' +
					'		</div>' +
					'	</fieldset>' +
					'</form>' );
			}else{
				var content = 
					$('<form class="form-horizontal">' +	    
					'	<fieldset>' +
					'		<div class="control-group">' +
					'			<label class="control-label" style="width:80px;">'+Dict.val("common_renew_duration")+':</label>' +
					'			<div class="controls" style="margin-left:0px;">' +
					'				<span id="perid_renew" class="subFee_renew"></span>' +
					'				&nbsp;&nbsp;<span id="unit_name"></span>&nbsp;&nbsp;<font color="red" >*</font><span id="peridUnit_renew"></span>&nbsp;&nbsp;' +
					'				<span id="tipPerid_renew" style="color: red"></span>' +
					'				<span id="feeInput_renew"  required="required" class="text-info" style="left:right;color: orange;font-size: 20px;"/></span> 元' +
					'			</div>' +
					'		</div>' +		
					'		<div class="control-group">' +
					'			<label style="">'+Dict.val("common_renew_tip")+'</label>' +
					'		</div>' +
					'	</fieldset>' +
					'</form>' );
			}
			content.appendTo(modalBody);
			// 带+-的输入框
			var container = $("#perid_renew").empty();				
			var max = 12;
			createPeridInput_renew = new com.skyform.component.RangeInputField(container, {
				min : 1,
				defaultValue : 1,
				max:max,
				textStyle : "width:137px"
			}).render();
			createPeridInput_renew.reset();
    },
    getFeeBySubId :function(subsId){
		var period = createPeridInput_renew.getValue();
		//获取续订周期单位
		var unit_name = Dict.val("common_month");//默认为"按月"
		var paramUnit = {
				"subscriptionId":parseInt(subsId)
		};
		Dcp.biz.apiAsyncRequest("/desktopCloud/account/queryBillType",paramUnit, function(data) {
			if(0 == data.code){
				var unit_code =  data.data;
				unit_name = com.skyform.service.UnitService.getUnitName("",unit_code);
				$("#unit_name").html(unit_name);
			}else{
				$("#unit_name").html(unit_name);
			}
		});
		
		//获取续订价格
		var param = {
				"period":parseInt(period),
				"subsId":parseInt(subsId)
		};
		Dcp.biz.apiAsyncRequest("/desktopCloud/pm/queryCaculateFeeBySubsId",param, function(data) {
			if(0 == data.code){

				var fee2=data.data.fee;
				var fee =  (typeof fee2=='number')?data.data.fee:data.data;
				$("#feeInput_renew").text(fee/1000);
			}
		});		
	},

    //随机桌面销毁按钮
    destroyDtTable: null,
    destroyCheckedData: null,
    destroyDistribution: function () {
        $('#destroyModal').off('shown').on('shown', function () {
            desktopDistribution.refreshRandomDestroyData();
        });
        $("#destroyModal").modal("show");
        //拿到选中的checkbox数据
        $("#destroyInfo").off("click").on("click", "input[type='radio']", function () {
            $("#destroyTip").hide();
            var checked = $("#destroyInfo input[type='radio']:checked");
            desktopDistribution.destroyCheckedData = {};
            desktopDistribution.destroyCheckedData.subsId = $(checked).attr("subsId");
        });
        //用户解绑提交按钮
        $("#destroySubmit").unbind("click").bind("click", function () {
            if (desktopDistribution.destroyCheckedData == null) {
                $.growlUI("请选择要一条记录");
            } else {
				var subsId = desktopDistribution.destroyCheckedData.subsId;
				var params={"subsId":subsId};
				com.skyform.service.desktopCloudService.deleteCitrixCloudTab(params,
						function(data) {
							$.growlUI(Dict.val("common_success_operation"));
							desktopDistribution.refreshData();
						}, function(error) {
							ErrorMgr.showError(error);
						});
			  // 清空该数据
                desktopDistribution.destroyCheckedData = null;
                $("#destroyModal").modal("hide");
            }
        });
        $("#destroyCancle").unbind("click").bind("click", function () {
            $("#destroyModal").modal("hide");
            $("#destroyTip").hide();
            desktopDistribution.destroyCheckedData = null;
        });
    },
    refreshRandomDestroyData: function () {
        var checked = $("#distributionTable tbody input[type='radio']:checked");
		 if (!$(checked)) {
			$.growlUI("请选择随机桌面！！！");
			return;
		  }
		 var params = {
        	"os":$(checked).attr("os"),
        	"osDisk":$(checked).attr("osDisk"), 
        	"siteId":$(checked).attr("siteId"), 
        	"memorySize":$(checked).attr("memorySize"),
        	"cpuNum":$(checked).attr("cpuNum")
        };
        desktopDistribution.service.getRandomTabInfo(params,function onSuccess(data){
        	var tempData=[];
        	if(data){
        		$.each(data,function(key,value){
        			if(value.status=="running"){
        			  tempData.push(data[key]);
        			}
        		});
        	}
           desktopDistribution._refreshRandomDestroyDtTable(tempData);
        },function onError(msg){
        	ErrorMgr.showError(msg);
        });
    },
    _refreshRandomDestroyDtTable: function (data) {
        if (desktopDistribution.destroyDtTable) {
            desktopDistribution.destroyDtTable.updateData(data);
        } else {
            desktopDistribution.destroyDtTable = new com.skyform.component.DataTable();
            desktopDistribution.destroyDtTable.renderByData("#destroyInfo", {
                pageSize: 6,
                data: data,
                "columnDefs": [
                    {title: "", name: "UserID"},
                    {title: "区域", name: "dliName"},
                    {title: "云桌面ID", name: "serviceName"},
                    {title: "状态", name: "status"},
                    {title: "创建时间", name: "createTime"},
                    {title: "到期时间", name: "inactiveDate"},
                    {title: "配置信息", name: "tempLeteInfo"}
                ],
                onColumnRender: function (columnIndex, columnMetaData, columnData) {
                    if (columnMetaData.name == "UserID") {
                        return "<input type='radio' name='Destroy'" +
                             " subsId='" + columnData["id"] + "' " +
                            "config='" + columnData["config"] + "'/>";
                    } else if (columnMetaData.name == "createTime") {
                        var text = columnData["" + columnMetaData.name]
                        text = text ? new Date(text).format("yyyy-MM-dd hh:mm:ss") : "";
                        return text;
                    }else if (columnMetaData.name == 'status') {
						return com.skyform.service.StateService.getState("",columnData['status']);
					}else if(columnMetaData.name == "inactiveDate") {
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
                    $("#destroyInfo_filter").hide();
                }
            });
        }
    }
}
