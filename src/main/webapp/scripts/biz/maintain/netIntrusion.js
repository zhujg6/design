/*入侵检测设置*/
window.currentInstanceType='netIntrusion';
$(function(){
    netIntrusion.init();
});
window.Controller = {

    init : function() {
        netIntrusion.init();
    },
    refresh : function() {
    }
}
var netIntrusion = {
    datatable : false,
    datatable1 : false,
    instances : [],
    instances1 : [],
    instances2 : [],
    datatable2 : new com.skyform.component.DataTable(),
    createModal : null,
    startupModal : null,
    stopModal : null,
    deleteModal : null,
    inited2 : false,
    container : $("#instanceTable"),
    backupCloudData : {},
    service : com.skyform.service.netIntrusion,
    init : function () {
        //为table的右键菜单添加监听事件
        var inMenu;
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
         netIntrusion.onOptionSelected($(this).index());
         }
         });
        $("body").bind('mousedown',function(){
            if(!inMenu){
                $("#contextMenu").hide();
            }
        });
        //点击启动、停止、删除
        $("#start").bind('click',function(e){
            netIntrusion.onOptionSelected(0);
        });
        $("#stop").bind('click',function(e){
            netIntrusion.onOptionSelected(1);
        });
        $("#delete").bind('click',function(e){
            netIntrusion.onOptionSelected(2);
        });
        $("#btnCreatenetIntrusion").click(netIntrusion.createnetIntrusion);
        //netIntrusion.queryDataTable();
        netIntrusion.bindEvent();


        $(".expended").toggle(function () {
            $("#tab-content").fadeOut();
            $("#nav-tabs").fadeOut();
            $("#details i").removeClass("icon-caret-up").addClass("icon-caret-down");
        },function () {
            $("#tab-content").fadeIn();
            $("#nav-tabs").fadeIn();
            $("#details i").removeClass("icon-caret-down").addClass("icon-caret-up");
        });
        $("#route_tab").click(function () {
            $("#details_content").removeClass("hide");
            $("#details_content1").removeClass("show");
            $("#details_content").addClass("show");
            $("#details_content1").addClass("hide");
        });
        $("#private_net_tab").click(function (){
            $("#details_content").removeClass("show");
            $("#details_content1").removeClass("hide");
            $("#details_content").addClass("hide");
            $("#details_content1").addClass("show");
        });

        $("a#createModal").unbind().click(function() {
            netIntrusion.createVM();
        });
        $("#stop_c").click(function(){
            netIntrusion.stopIntrusionDetectionTask();
            $("#stopModal").hide();
            $(".modal-backdrop").hide();
            netIntrusion.updateDataTable();
        });
        $("#dele_c").click(function(){
            netIntrusion.deleteIntrusionDetectionTask();
            $("#destroyModal").hide();
            $(".modal-backdrop").hide();
            netIntrusion.updateDataTable();
        });
        $("#star_c").click(function(){
            netIntrusion.startIntrusionDetectionTask();
            $("#openModal").hide();
            $(".modal-backdrop").hide();
            netIntrusion.updateDataTable();
        });



        netIntrusion.updateDataTable();
        netIntrusion.updateDataTable_next();
        netIntrusion.netIntrusion_details();
    },
    onOptionSelected : function(index) {
        if(index == 0){
            $("#openModal").show();
        } else if(index == 1){
            $("#stopModal").show();
        }else if(index == 2){
            $("#destroyModal").show();
        }
    },
    bindEvent : function() {
        $("#backupCreate").unbind("click").bind("click", function() {
            netIntrusion.updateDataTable();
        });
        $("#updateData").unbind("click").bind("click", function() {
            //netIntrusion.updateDataTable();
        });
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
                var state = $(this).attr("state");
                var optState = $(this).attr("optState");
                if (state == "running" && (optState == undefined || optState == "")) {
                    $("#contextMenu").find("li.start-up").removeClass("disabled");
                    $("#contextMenu").find("li.stop-it").removeClass("disabled");
                    $("#contextMenu").find("li.delete").removeClass("disabled");

                } else {
                    $("#contextMenu").find("li.start-up").addClass("disabled");
                    $("#contextMenu").find("li.stop-it").addClass("disabled");
                    $("#contextMenu").find("li.delete").addClass("disabled");
                }
                if ((state == "using") && (optState == undefined || optState == "")){
                    $("#contextMenu").find("li.detachVm").removeClass("disabled");
                } else {
                    $("#contextMenu").find("li.detachVm").addClass("disabled");
                }
                // 选中右键所单击的行，取消其他行的选中效果
                $("tbody input[type='checkbox']").attr("checked", false);
                //全选取消选中
                $("#checkAll").attr("checked", false);
                $("input[type='checkbox']",$(this)).attr("checked", true);
            }
            //netIntrusion.showInstanceInfo($(this).attr("id"));
            //netIntrusion.setSelectRowBackgroundColor($(this));
        });
    },
    renderDataTable_net : function(data) {
        if(netIntrusion.datatable){
            netIntrusion.updateDataTable(netIntrusion.instances);
            return;
        }else{
            netIntrusion.datatable = new com.skyform.component.DataTable(),
            netIntrusion.datatable.renderByData("#netIntrusion", {
                    "data": data,
                     "pageSize" : 5,
                    "columnDefs": [
                        {title: "", name: "id"},
                        {title: "云主机名称", name: "vmName"},
                        {title: "内网IP", name: "inNet"},
                        {title: "网卡名称", name: "netCard"},
                        {title: "创建时间", name: "createTime"},
                        {title: "状态", name: "state"},
                    ],
                    "onColumnRender": function (columnIndex, columnMetaData, columnData) {
                        var text = columnData['' + columnMetaData.name] || "";
                        if (columnMetaData.name == 'id') {
                            text = '<input type="checkbox" value="' + text + '">';
                        }
                        else if (columnMetaData.name == "createTime") {
                            text = new Date(text).format("yyyy-MM-dd hh:mm:ss");
                        }
                        else if("state" == columnMetaData.name) {
                            if (columnData.state == "closed") {
                                text ="<span class='state-green'><i class='icon-off darkgray mr5'></i>关闭</span>";
                            } else if (columnData.state == "starting") {
                                text = "<span class='state-blue'><i class='icon-spinner icon-spin blue mr5'></i>开启中...</span>";
                            }else if (columnData.state == "running") {
                                text = "<span class='state-green'><i class='icon-circle green mr5'></i>运行中</span>";
                            }else if (columnData.state == "opening") {
                                text = "<span class='state-green'><i class='icon-circle green mr5'></i>创建中...</span>";
                            }else if (columnData.state == "deleting") {
                                text = "<span class='state-copper'><i class='icon-spinner icon-spin blue mr5'></i>删除中...</span>";
                            }else if (columnData.state == "stopping") {
                                text = "<span class='state-copper'><i class='icon-spinner icon-spin blue mr5'></i>关闭中...</span>";
                            } else if (columnData.state == "create error") {
                                text = "<span class='state-red'><i class='icon-warning-sign orange mr5'></i>创建失败</span>";
                            }else if (columnData.state == "start error") {
                                text = "<span class='state-red'><i class='icon-warning-sign orange mr5'></i>开启失败</span>";
                            }else if (columnData.state == "stop error") {
                                text = "<span class='state-red'><i class='icon-warning-sign orange mr5'></i>关闭失败</span>";
                            }else if (columnData.state == "delete error") {
                                text ="<span class='state-red'><i class='icon-warning-sign orange mr5'></i>删除失败</span>";
                            }

                        }
                        return text;
                    },

                    "afterRowRender": function (rowIndex, data, tr) {

                        tr.attr("id",data.subscriptionId);
                        tr.click(function () {
                            netIntrusion.getRelateHosts(data.subscriptionId);
                            netIntrusion.getOptLog(data.subscriptionId);
                        });
                    },
                    "afterTableRender": function () {
                        // 翻页的时候清除前一页选中的checkbox，同时将更多操作置为不可用
                        $("#netTable input[type='checkbox']").attr("checked", false);
                        netIntrusion.bindEvent();
                        var firstRow = $("#netIntrusion tbody").find("tr:eq(0)").attr("id");

                        //显示第一条记录的日志
                        netIntrusion.getRelateHosts(firstRow);
                        netIntrusion.getOptLog(firstRow);

                    }

                });
        }

        //netIntrusion.datatable.addToobarButton("#disktoolbar");
        netIntrusion.datatable.enableColumnHideAndShow("right");
    },
    //入侵检测
    listIntrusionDetectionTask : function(){
        var params={
            "subscriptionId":"",
        }
        com.skyform.service.netIntrusion.listIntrusionDetectionTask(params,function(data){

            netIntrusion.renderDataTable_net(data);
        });
    },
    /*setSelectRowBackgroundColor : function(handler) {
        $("#content_container tr").css("background-color","");
        handler.css("background-color","#BCBCBC");
    },*/
    updateDataTable : function() {
        /* if(netIntrusion.datatable) {
         netIntrusion.datatable.container.find("tbody").html("<tr ><td colspan='7' style='text-align:center;'><img src='"+CONTEXT_PATH+"/images/loader.gif'/><strong>"+Dict.val("common_retrieving_data_please_wait")+"</strong></td></tr>");
         }*/
        var params = {
            "subscriptionId":"",
        };

        com.skyform.service.netIntrusion.listIntrusionDetectionTask(params,function onSuccess(data){

            netIntrusion.instances = data;
            netIntrusion.renderDataTable_net(data);
            //console.log(data)

        },function onError(msg){
        });

    },
    loadDataTable :function(data) {
        if(netIntrusion.datatable1){
            netIntrusion.updateDataTable_next(netIntrusion.instances1);
        }else{
            netIntrusion.datatable1 = new com.skyform.component.DataTable(),
                netIntrusion.datatable1.renderByData("#private_network_instanceTable", {
                    "data": data,
                    "pageSize" : 5,
                   /* "columnDefs" : [
                        {title : "", name : "id"},
                        {title : "云主机名称" , name :"vm_name"},
                        {title : "源IP", name : "src_ip"},
                        {title : "目的IP", name : "dst_ip"},
                        {title : "攻击时间" , name :"timestamp"},
                        {title : "入侵类型", name : "ips_type"},
                        {title : "攻击次数", name : "attact_times"},
                    ],*/
                    "onColumnRender" : function(columnIndex, columnMetaData, columnData) {
                        var text = columnData['' + columnMetaData.name] || "";
                        if (columnMetaData.name == "id") {
                            text = '<input type="checkbox" value="' + text + '">';
                        }else if(columnMetaData.name=='timestamp'){
                            text = new Date(text).format("yyyy-MM-dd hh:mm:ss");
                        }
                        return text;
                    },
                    "afterRowRender" : function(rowIndex, data, tr){
                        tr.attr("name",data.vm_name);
                        tr.attr("src_ip",data.src_ip);
                        tr.attr("dst_ip",data.dst_ip);
                        tr.attr("state",data.state);
                        tr.attr("timestamp",data.timestamp);
                        tr.attr("ips_type",data.ips_type);
                        tr.attr("attact_times",data.attact_times);

                        tr.click(function () {
                            netIntrusion.checksel(data.subscriptionId);
                        });

                    },
                    "afterTableRender": function () {
                        // 翻页的时候清除前一页选中的checkbox，同时将更多操作置为不可用
                        $("#private_network_instanceTable input[type='checkbox']").attr("checked", false);
                        netIntrusion.bindEvent();
                        var firstRow = $("#private_network_instanceTable tbody").find("tr:eq(0)");
                        var firstInsId = firstRow.attr("id");
                        //显示第一条记录的日志
                        //netIntrusion.showInstanceInfo(firstInsId);
                        //netIntrusion.getRelateHosts(firstInsId);
                        //netIntrusion.getOptLog(firstInsId);
                        firstRow.css("background-color", "#d9f5ff");
                        //netIntrusion.setSelectRowBackgroundColor(firstRow);
                    }
                });
        }
    },
    updateDataTable_next : function() {
       /* if(netIntrusion.datatable1) {
         netIntrusion.datatable1.container.find("tbody").html("<tr ><td colspan='7' style='text-align:center;'><img src='"+CONTEXT_PATH+"/images/loader.gif'/><strong>"+Dict.val("common_retrieving_data_please_wait")+"</strong></td></tr>");
         }*/
        var params={
            "subscriptionId":"",

        }
        com.skyform.service.netIntrusion.listIntrusionAlarm(params,function onSuccess(data){
            //netIntrusion.instances1 = data;
            netIntrusion.loadDataTable(data);
        },function onError(msg){
        });

    },
    getCheckedArr :function() {
        return $("#netTable tbody input[type='checkbox']:checked");
    },
    getRelateHosts : function(eipId) {
        $("#opt_logs").html("");
        if (!eipId) {
            return;
        }
        com.skyform.service.LogService.describeLogsInfo(
                eipId,
                function(data) {
                    var array = data;
                    if (array == null || array.length == 0) {
                        return;
                    } else {
                        $("#opt_logs").empty();
                        var dom = "";
                        $(array)
                            .each(function(i) {
                                dom += "<li class=\"detail-item\">"
                                    + "<span>"
                                    + array[i].subscription_name
                                    + "</span>&nbsp;&nbsp;&nbsp;&nbsp;"
                                    + "<span>"
                                    + array[i].controle
                                    + "</span>&nbsp;&nbsp;&nbsp;&nbsp;"
                                    + "<span>"
                                    + array[i].createTime
                                    + "</span>"
                                    + "</li>";
                            });
                        $("#opt_logs").append(dom);
                    }
                });
    },
    getOptLog : function(eipId1) {
        $("#netIntrusionRts").empty();
        if (!eipId1) {
            return;
        }
        /*com.skyform.service.LogService.describeLogsUIInfo(eipId);*/
        com.skyform.service.vmService
            .listRelatedInstances(
                eipId1,
                function(data) {
                    var array1 = data;
                    if (array1 == null || array1.length == 0) {
                        return;
                    } else {
                        $("#netIntrusionRts").empty();
                        var dom1 = "";
                        $(array1)
                            .each(function(i) {
                                dom1 += "<li class=\"detail-item\">"
                                    + "<span>"
                                    + array1[i].id
                                    + "</span>&nbsp;&nbsp;&nbsp;&nbsp;"
                                    + "<span>"
                                    + array1[i].instanceName
                                    + "</span>&nbsp;&nbsp;&nbsp;&nbsp;"
                                    + "<span>"
                                    + array1[i].state
                                    + "</span>"
                                    + "</li>";
                            });

                        $("#netIntrusionRts").append(dom1);
                    }
                });
    },
    //攻击详情
    netIntrusion_details : function(){

        var allCheckedBox = $("#private_network_instanceTable input[type='checkbox']:checked");
        var eventType= $(allCheckedBox).parents("tr").attr("ips_type");
        var ipSrc= $(allCheckedBox[0]).parents("tr").attr("ips_type");
        var ipDst= $(allCheckedBox[0]).parents("tr").attr("dst_ip");
        var params={
            "eventType":$("#private_network_instanceTable input[type='checkbox']:checked").parents("tr").attr("ips_type"),
            "ipSrc":$("#private_network_instanceTable input[type='checkbox']:checked").parents("tr").attr("src_ip"),
            "ipDst":$("#private_network_instanceTable input[type='checkbox']:checked").parents("tr").attr("dst_ip"),
        }
        //console.log(params)
        com.skyform.service.netIntrusion.listIntrusionDetectionDetail(params,function onSuccess(data){
            $("#attackTimeEvent").html(data.timestamp);
            $("#intrusionTimesEvent").html();
        },function onError(msg){
        });
    },
    //启动
    startIntrusionDetectionTask :function(){
        var subscriptionId=$("#netIntrusion input[type='checkbox']:checked").parents("tr").attr("id");
        var params={
            "subscriptionId":Number($("#netIntrusion input[type='checkbox']:checked").parents("tr").attr("id")),
        };
        com.skyform.service.netIntrusion.startIntrusionDetectionTask(params,function onSuccess(data){

        },function onError(msg){
        });
    },
    //停止
    stopIntrusionDetectionTask :function(){
        var subscriptionId=$("#netIntrusion input[type='checkbox']:checked").parents("tr").attr("id");
        var params={
            "subscriptionId":Number(subscriptionId),
        };
        com.skyform.service.netIntrusion.stopIntrusionDetectionTask(params,function onSuccess(data){

        },function onError(msg){
        });
    },
    //删除
    deleteIntrusionDetectionTask :function(){
        var subscriptionId=$("#netIntrusion input[type='checkbox']:checked").parents("tr").attr("id");
        var params={
            "subscriptionId":Number(subscriptionId),
        };
        com.skyform.service.netIntrusion.deleteIntrusionDetectionTask(params,function onSuccess(data){

        },function onError(msg){
        });
    },
    //创建
    showrenderDtTable:function(data){
        if(netIntrusion.inited2){
            netIntrusion.datatable2.updateData(netIntrusion.instances2);
            return;
        }
        netIntrusion.datatable2.renderByData(
            "#tbody3",// 要渲染的table所在的jQuery选择器
            {
                "data" : data, // 要渲染的数据选择器
                "pageSize" : 3,
                "onColumnRender" : function(columnIndex,columnMetaData, columnData) {
                    var text = columnData['' + columnMetaData.name] || "";
                    if(columnMetaData.name=='id1') {
                        return '<input type="radio" name="check" id="' + columnData.id + '" value="'+columnData.id+'">';
                    } else if ("ID1" == columnMetaData.name) {
                        return columnData.id;
                    }else if ("state" == columnMetaData.name) {
                        return com.skyform.service.StateService.getState("vm",columnData.state||columnData);
                    } else if ("createDate" == columnMetaData.name) {
                        try {
                            var obj = eval('(' + "{Date: new Date("
                                + columnData.createDate + ")}"
                                + ')');
                            var dateValue = obj["Date"];
                            text = dateValue
                                .format('yyyy-MM-dd hh:mm:ss');
                        } catch (e) {

                        }
                        return text;
                    }
                    return columnData[columnMetaData.name];
                },

//					{"message":"success","data":[{"vmPrice":1,"mem":"0.5","state":"opening","expireDate":1412493362000,"productId":101,"createDate":1409901362000,"cpu":"1","instanceName":"VM_67786912","disk":"50","osId":"1","id":67786912,"ip":" ","period":1,"os":"Cetnos6.4-x86_64"},{"vmPrice":1,"mem":"0.5","state":"opening","expireDate":1412476682000,"productId":101,"createDate":1409884682000,"cpu":"1","instanceName":"VM_67784939","disk":"50","osId":"1","id":67784939,"ip":" ","period":1,"os":"Cetnos6.4-x86_64"}],"code":0}
                "afterRowRender" : function(rowIndex, data, tr) {

                    tr.attr("id",data.networkId);
                    tr.attr("vmName",data.vmName);
                    tr.attr("state",data.state);
                    tr.attr("createDate",data.createDate);
                    tr.attr("networkId",data.networkId);
                    tr.attr("ip",data.ip);
                    netIntrusion.bindEventForTr(rowIndex, data, tr);

                },
                "afterTableRender" : function() {
                    netIntrusion.bindEvent();

                    var firstRow = $("#tbody3 tbody").find("tr:eq(0)");
                    var	instanceId = firstRow.attr("instanceId");
                    //var instance = netIntrusionEvent.getInstanceInfoById(instanceId);
                    netIntrusion.backupCloudData.vmId=instanceId;
                    netIntrusion.backupCloudData.vmName=firstRow.attr("name");
                    netIntrusion.backupCloudData.networkId=firstRow.attr("networkid");
                    //firstRow.css("background-color","#BCBCBC");

                    //netIntrusion.setSelectRowBackgroundColor(firstRow);
                }

            });
        netIntrusion.inited2 = true;
    },

    createVM : function() {
        //$('#createDataDiskSize').val('1');
        if(!netIntrusion.createModal){
            netIntrusion.createModal = new com.skyform.component.Modal(
                "id_create",
                "<h3>"+"服务创建"+"</h3>",
                $("script#new_backup4cloud_form3").html(),{
                    buttons : [
                        {
                            name : "确定",
                            onClick : function() {
                                //var isSubmit = true;
                                var vm_ipaddr=$("#vmip2").val();
                                var netcard_name=$("#vmnetwork").val();
                                var vm_name=$("#vmname").val();
                                var network_id=$("#tbody3 input[type='radio']:checked").parents("tr").attr("networkid");
                                if($("#vmnetwork").val()==""){
                                    //isSubmit = false;
                                } else if($("#vmnetwork").val()!=""){
                                    //isSubmit = true;
                                }
                                //return isSubmit;
                                var params={
                                    "period":1,
                                    "count":1,
                                    "productList":[{
                                    "vm_ipaddr":vm_ipaddr,
                                    "netcard_name":netcard_name,
                                    "vm_name":vm_name,
                                    "productId":10400,
                                    "network_id":network_id,
                                    "instanceName":"IPS"

                                    }]
                                };
                                com.skyform.service.netIntrusion.createIntrusionDetectionTask(params,function onSuccess(data){

                                },function onError(msg){
                                });
                                netIntrusion.createModal.hide();
                                netIntrusion.updateDataTable();
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
                                netIntrusion.createModal.hide();
                            }
                        } ],
                    afterShow : function(){

                        com.skyform.service.netIntrusion.queryVmInfo(null,function(data) {
                            netIntrusion.showrenderDtTable(data);
                        });


                    },
                });
        }
        netIntrusion.createModal.setWidth(1200).autoAlign().setTop(60).show();
    },
    bindEventForTr : function(rowIndex, data, tr) {
        $(tr).click(function() {
            netIntrusion.checkboxClick(tr);

        });
    },
    checkboxClick : function(tr) {
        netIntrusion.checkSelected();
    },
    checkSelected : function(selectInstance) {
        var ip=$("#tbody3 input[type='radio']:checked").parents("tr").attr("ip");
        var vmname_1=$("#tbody3 input[type='radio']:checked").parents("tr").attr("vmName");
        $("#vmname").val(vmname_1);
        $("#vmip2").val(ip);
    },
    checksel:function(){
        $("#attackTimeEvent").html($("#private_network_instanceTable input[type='checkbox']:checked").parents("tr").children().eq(4).html())
        $("#intrusionTimesEvent").html($("#private_network_instanceTable input[type='checkbox']:checked").parents("tr").attr("attact_times"))

    }

}
$(function(){
    var privateNetworkInited = false;

    $("#private_net_tab").on("show",function(){
        window.currentInstanceType='subnet';
    });
    $("#private_net_tab").on("shown",function(){
        if(!privateNetworkInited) {
            privateNetworkInited = true;
            netIntrusion.init();
        }
    });
    $("#route_tab").on("show",function(){
        window.currentInstanceType='route';
    });

});