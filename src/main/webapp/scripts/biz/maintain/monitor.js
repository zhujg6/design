var map=''; 
var path = "";
$.getScript("/portal/scripts/common/hashMap.js", function(e){
	map = new Map();
});
var mo = map;
var dataF = [];
var vmID = '';
var totalPoints = 300;
var updateInterval = 10000;
var timeoutId = '';
var tickSize = 240;
$(function(){
	var id = $("#vmId").val();
	monitormg.init(id);
});

var monitormg = {   
    root: "/SkyFormPortal",  
    rs : {},
     cpu_plot : '',
     mem_plot : '',
     net_plot : '',
     disk_plot : '',
    init : function(id) {
    	path = $("#path").val();
    	showProductMonitor('VM',id);
      /**  var end = new Date();
        var start = monitormg.nextNDate(end,-1);
        var vmidList = {
            vmid : id,
            type : 'VM',
            startTime : start,
            endTime : end.getTime()
        };

        $.ajax({
            type : "POST",
            url : "/SkyFormPortal/cloud_mall/getMonitorData.action",
            data : vmidList,
            dataType : 'json',
            async : false,
            global : false,
            success : function(data) {
                if(data.length>0&&data.length<240){
                	tickSize=5;
                }
            }
        });
        */
    },

    getMonitorInfo : function(code) {
        var info = code;
//        info = info.replace("vm", "云主机");
//        info = info.replace("mc", "小型机");
//        info = info.replace("vl", "弹性块存储");
//        info = info.replace("lb", "负载均衡");
//        info = info.replace("fw", "防火墙");
//        info = info.replace("pnip", "弹性公网IP");
//        info = info.replace("bw", "公网带宽");
        
        info = info.replace("vm", Dict.val("key.js.workspace.monitor.info1"));
        info = info.replace("mc", Dict.val("key.js.workspace.monitor.info2"));
        info = info.replace("vl", Dict.val("key.js.workspace.monitor.info3"));
        info = info.replace("lb", Dict.val("key.js.workspace.monitor.info4"));
        info = info.replace("fw", Dict.val("key.js.workspace.monitor.info5"));
        info = info.replace("pnip", Dict.val("key.js.workspace.monitor.info6"));
        info = info.replace("bw", Dict.val("key.js.workspace.monitor.info7"));
        return info;
    },

    nextNDate : function(begin, n){
        //var beginDateStr = "2007/01/29";
        //创建开始时间对象
     beginDate = begin;
        //设置增加的天数
        beginDate.setDate(beginDate.getDate() + n);

        //获取增加天数后的时间字串
        //-3- js中getMonth()的返回值从0开始到11，因此要加1，才是正确的值
        var endDateStr =beginDate.getFullYear() + "-" + (beginDate.getMonth()+1) + "-" + beginDate.getDate() + " "+ beginDate.getHours() + ":"+ beginDate.getMinutes() + ":" +beginDate.getSeconds();
        endDateStr = endDateStr.replace("-","/").replace("-","/");
        var rs=new Date(Date.parse(endDateStr.replace(/-/g, "/")));
        return rs.getTime();
        //输出：2007/2/5
        //alert(beginDate.toLocaleString());
    },


    initBackground : function(){
        var jg = new jsGraphics("moDiv");
        jg.setColor("#F0F0F0");
        jg.fillRect(0,0,700,650);
        jg.paint();     
    },

       getCPUData : function(){
            return {
                            color : "purple",
                            label : " CPU (%)",
                            data : monitormg.rs.get("cpu")
                        };
        },
        getMEMData : function(){
            return {
                            color : "blue",
                            label : " MEM (%)",
                            data : monitormg.rs.get("mem")
                        };
        },

                        
    initPlot : function() {
        monitormg.cpu_plot = $.plot($("#CpuArea"), [monitormg.getCPUData()], optionsCpu);
        monitormg.mem_plot = $.plot($("#MemArea"), [monitormg.getMEMData()], optionsMem);
        monitormg.net_plot = $.plot($("#NetArea"), [{
                            color : "green",
                            label : " NetRead (Mbps)",
                            data : monitormg.rs.get("net_r"),
                            lines : {
                                show : true
                            }
                        }, {
                            color : "red",
                            label : " NetWrite (Mbps)",
                            data : monitormg.rs.get("net_w"),
                            lines : {
                                show : true
                            }
                        }], optionsNet);
        monitormg.disk_plot = $.plot($("#DiskArea"), [ {
                            color : "green",
                            label : " DiskRead (Mbps)",
                            data : monitormg.rs.get("disk_r"),
                            lines : {
                                show : true
                            }
                        }, {
                            color : "red",
                            label : " DiskWrite (Mbps)",
                            data : monitormg.rs.get("disk_w"),
                            lines : {
                                show : true
                            }
                        }], optionsDisk);       
    },
    
     drawPlot : function(){
        monitormg.cpu_plot.setData([monitormg.getCPUData()]); 
        monitormg.cpu_plot.draw();
        
        monitormg.mem_plot.setData([monitormg.getMEMData()]); 
        monitormg.mem_plot.draw();
        
        monitormg.net_plot.setData([{
                            color : "green",
                            label : " NetRead (Mbps)",
                            data : monitormg.rs.get("net_r"),
                            lines : {
                                show : true
                            }
                        }, {
                            color : "red",
                            label : " NetWrite (Mbps)",
                            data : monitormg.rs.get("net_w"),
                            lines : {
                                show : true
                            }
                        }]);  
        monitormg.net_plot.draw();
        
        monitormg.disk_plot.setData([ {
                            color : "green",
                            label : " DiskRead (Mbps)",
                            data : monitormg.rs.get("disk_r"),
                            lines : {
                                show : true
                            }
                        }, {
                            color : "red",
                            label : " DiskWrite (Mbps)",
                            data : monitormg.rs.get("disk_w"),
                            lines : {
                                show : true
                            }
                        }]);  
        monitormg.disk_plot.draw();         
    },    
    
    getMonitorData : function(type,id,callback){
        var cpu = [], mem = [], net_r = [], net_w = [], disk_r = [], disk_w = [];
//        $.getScript("/portal/scripts/common/hashMap.js", function(e){
//        	map = new Map();        	
//        }); 
        map = new Map();  
        mo = map;
        var end = new Date();
        var start = monitormg.nextNDate(end,-1);
        var vmidList = {
            id : id,
            type : type,
            //startTime : start,
           //endTime : end.getTime()
        };
        
        $.ajax({
            type : "POST",
            url : path+"/pr/getMonitorData",
            data : vmidList,
            dataType : 'json',
            async : true,
            global : false,
            success : function(ret) {
//                dataF = data;                              
                //dataF = $.parseJSON(monitormg.getMockMonitiorDate());
                data = ret.result;
                if(data&&data.length > 0){
//                    for(i=0;i<data.length;i++){
//                        var info = data[i];
//                        var ti = new Date(Date.parse(info.timestamp.replace(/-/g, "/")));
//                        cpu.push([ti, info.cpuUt/100]);
//                        mem.push([ti, info.memUt/100]);
//                        net_r.push([ti, Math.round(info.networkRead*10/1024)/10]);
//                        disk_r.push([ti, Math.round(info.diskRead*10/1024)/10]);
//                        net_w.push([ti, Math.round(info.networkWrite*10/1024)/10]);
//                        disk_w.push([ti, Math.round(info.diskWrite*10/1024)/10]);              
//                    }
                	
                	for(i=0;i<data.length;i++){
                        var info = data[i];
                        var ti = new Date(Date.parse(info.time.replace(/-/g, "/")));
                        cpu.push([ti, info.cpuUsage/100]);
                        mem.push([ti, info.memUsage/100]);
                        net_r.push([ti, Math.round(info.netIn*10/1024)/10]);
                        net_w.push([ti, Math.round(info.netOut*10/1024)/10]);
                        disk_r.push([ti, Math.round(info.diskIn*10/1024)/10]);
                        disk_w.push([ti, Math.round(info.diskOut*10/1024)/10]);              
                    }
                            
                    mo.put("cpu", cpu);
                    mo.put("mem", mem);
                    mo.put("net_r", net_r);
                    mo.put("net_w", net_w);
                    mo.put("disk_r", disk_r);
                    mo.put("disk_w", disk_w);
                    
                }
                monitormg.rs = mo;
                // fixed bug : 0008563
                if(callback) {
                	callback();
                }
            }
        });
    } ,  
    
    getMockMonitiorDate : function(){
    	var timeStamp = 1395726910000;
    	for(var i=0;i<100;i++){
    		
    	}
    	var  ret = '[{"cpuHz":0,"cpuNum":null,"cpuUt":1450.0,"cpuhz":0,"cpunum":null,"cpuut":45.0,"diskRead":10.0,"diskWrite":20.0,"diskread":500.0,"diskwrite":0.0,"harddiskRead":null,"harddiskWrite":null,"harddiskread":null,"harddiskwrite":null,"hypervisor":null,"ipAddress":null,"ipaddress":null,"memAllocated":0.0,"memTotal":0.0,"memUt":99.0,"memallocated":0.0,"memtotal":0.0,"memut":99.0,"networkRead":null,"networkWrite":200.0,"networktread":null,"networkwrite":0.0,"resCode":null,"rescode":null,"state":null,"templateName":null,"templatename":null,"timeStamp":"1395726910000","timestamp":"2014-03-25 13:55:10","vmName":null,"vmType":null,"vmid":0,"vmname":null,"vmtype":null,"vnname":null},'
         	+'{"cpuHz":0,"cpuNum":null,"cpuUt":2415.0,"cpuhz":0,"cpunum":null,"cpuut":90.0,"diskRead":0.0,"diskWrite":110.0,"diskread":0.0,"diskwrite":0.0,"harddiskRead":null,"harddiskWrite":null,"harddiskread":null,"harddiskwrite":null,"hypervisor":null,"ipAddress":null,"ipaddress":null,"memAllocated":0.0,"memTotal":0.0,"memUt":199.0,"memallocated":0.0,"memtotal":0.0,"memut":99.0,"networkRead":null,"networkWrite":50.0,"networktread":null,"networkwrite":0.0,"resCode":null,"rescode":null,"state":null,"templateName":null,"templatename":null,"timeStamp":"1395727210000","timestamp":"2014-03-25 14:00:10","vmName":null,"vmType":null,"vmid":0,"vmname":null,"vmtype":null,"vnname":null},'
         	+'{"cpuHz":0,"cpuNum":null,"cpuUt":2425.0,"cpuhz":0,"cpunum":null,"cpuut":80.0,"diskRead":0.0,"diskWrite":0.0,"diskread":100.0,"diskwrite":0.0,"harddiskRead":null,"harddiskWrite":null,"harddiskread":null,"harddiskwrite":null,"hypervisor":null,"ipAddress":null,"ipaddress":null,"memAllocated":0.0,"memTotal":0.0,"memUt":299.0,"memallocated":0.0,"memtotal":0.0,"memut":99.0,"networkRead":null,"networkWrite":700.0,"networktread":null,"networkwrite":0.0,"resCode":null,"rescode":null,"state":null,"templateName":null,"templatename":null,"timeStamp":"1395727510000","timestamp":"2014-03-25 14:05:10","vmName":null,"vmType":null,"vmid":0,"vmname":null,"vmtype":null,"vnname":null},'
         	+'{"cpuHz":0,"cpuNum":null,"cpuUt":2415.0,"cpuhz":0,"cpunum":null,"cpuut":90.0,"diskRead":0.0,"diskWrite":110.0,"diskread":0.0,"diskwrite":0.0,"harddiskRead":null,"harddiskWrite":null,"harddiskread":null,"harddiskwrite":null,"hypervisor":null,"ipAddress":null,"ipaddress":null,"memAllocated":0.0,"memTotal":0.0,"memUt":199.0,"memallocated":0.0,"memtotal":0.0,"memut":99.0,"networkRead":null,"networkWrite":50.0,"networktread":null,"networkwrite":0.0,"resCode":null,"rescode":null,"state":null,"templateName":null,"templatename":null,"timeStamp":"1395727810000","timestamp":"2014-03-25 14:10:10","vmName":null,"vmType":null,"vmid":0,"vmname":null,"vmtype":null,"vnname":null},'
          	+'{"cpuHz":0,"cpuNum":null,"cpuUt":2425.0,"cpuhz":0,"cpunum":null,"cpuut":80.0,"diskRead":0.0,"diskWrite":0.0,"diskread":100.0,"diskwrite":0.0,"harddiskRead":null,"harddiskWrite":null,"harddiskread":null,"harddiskwrite":null,"hypervisor":null,"ipAddress":null,"ipaddress":null,"memAllocated":0.0,"memTotal":0.0,"memUt":299.0,"memallocated":0.0,"memtotal":0.0,"memut":99.0,"networkRead":null,"networkWrite":700.0,"networktread":null,"networkwrite":0.0,"resCode":null,"rescode":null,"state":null,"templateName":null,"templatename":null,"timeStamp":"1395728110000","timestamp":"2014-03-25 14:15:10","vmName":null,"vmType":null,"vmid":0,"vmname":null,"vmtype":null,"vnname":null},'
          	
         	
         	+'{"cpuHz":0,"cpuNum":null,"cpuUt":436.0,"cpuhz":0,"cpunum":null,"cpuut":46.0,"diskRead":0.0,"diskWrite":80.0,"diskread":200.0,"diskwrite":60.0,"harddiskRead":null,"harddiskWrite":null,"harddiskread":null,"harddiskwrite":null,"hypervisor":null,"ipAddress":null,"ipaddress":null,"memAllocated":0.0,"memTotal":0.0,"memUt":0.0,"memallocated":0.0,"memtotal":0.0,"memut":0.0,"networkRead":null,"networkWrite":400.0,"networktread":null,"networkwrite":0.0,"resCode":null,"rescode":null,"state":null,"templateName":null,"templatename":null,"timeStamp":"1395728410000","timestamp":"2014-03-25 14:20:10","vmName":null,"vmType":null,"vmid":0,"vmname":null,"vmtype":null,"vnname":null}]';
        
    	return ret;
    }
};

     var optionsCpu = {
        series : {
            shadowSize : 0
        }, 
        yaxis : {
            min : 0,
            max :100
        },
        xaxis : {
            mode : "time",
            timeformat : "%h %p",
            minTickSize : [1, "minute"],
            twelveHourClock : false,
            tickFormatter: function (val, axis) {   
                var d = new Date(val);   
                //return commonUtils.trim(d.toLocaleTimeString().substr(0,5).replaceAll(':',' ')).replaceAll(' ',':');//转为当地时间格式
                return d.format('hh:mm');
            }   
        },
        legend : {
            position : 'nw'
        }
    };
    var optionsMem = {
        series : {
            shadowSize : 0
        }, // drawing is faster without shadows
        yaxis : {
            min : 0,
            max :100
        },
        xaxis : {
            mode : "time",
            timeformat : "%h %p",
            minTickSize : [1, "minute"],
            //tickSize : [tickSize, "minute"],
            twelveHourClock : false,
            tickFormatter: function (val, axis) {   
                var d = new Date(val);   //bug 0004001
                //return commonUtils.trim(d.toLocaleTimeString().substr(0,5).replaceAll(':',' ')).replaceAll(' ',':');//转为当地时间格式
                return d.format('hh:mm');
            }   
        },
        legend : {
            position : 'nw'
        }
    };
    var optionsNet = {
        series : {
            shadowSize : 0
        }, // drawing is faster without shadows
        yaxis : {
            min : 0,
            autoscaleMargin : 1.5
        },
        xaxis : {
            mode : "time",
            timeformat : "%h %p",
            minTickSize : [1, "minute"],
            //tickSize : [tickSize, "minute"],
            twelveHourClock : false,
            tickFormatter: function (val, axis) {   
                var d = new Date(val);   //bug 0004001
                //return commonUtils.trim(d.toLocaleTimeString().substr(0,5).replaceAll(':',' ')).replaceAll(' ',':');//转为当地时间格式
                return d.format('hh:mm');
            }   
        },
        legend : {
            position : 'nw'
        }
    };
    var optionsDisk = {
        series : {
            shadowSize : 0
        }, // drawing is faster without shadows
        yaxis : {
            min : 0,
            autoscaleMargin : 2
        },
        xaxis : {
            mode : "time",
            timeformat : "%h %p",
            minTickSize : [1, "minute"],
            //tickSize : [tickSize, "minute"],
            twelveHourClock : false,
            tickFormatter: function (val, axis) {   
                var d = new Date(val);   //bug 0004001
                //return commonUtils.trim(d.toLocaleTimeString().substr(0,5).replaceAll(':',' ')).replaceAll(' ',':');//转为当地时间格式
                return d.format('hh:mm');
            }   
        },
        legend : {
            position : 'nw'
        }
    };
function monitorConfig(info) {
	var monitorInfo = monitormg.getMonitorInfo(info.networkDesc);
	monitorInfo = monitorInfo != undefined ? monitorInfo : '';
	return monitorInfo;
}

function monitorState(info) {
	return stateName[info.state];
}

function monitorOperate(info) {
	return '';
}

    function hideProductMonitor() {
        $("#resourceArea").show();
        $("#prev").show();
        $("#moDiv").hide();
        $("#MonitorCancel").hide();
        $("#monitorArea").hide();
        clearTimeout(timeoutId);
    }

    function showMonitor() {
        $("#resourceArea").hide();
        $("#prev").hide();
        $("#monitorArea").show();
        $("#moDiv").show();
        $("#MonitorCancel").show();
    }

var thread='';
var timerKey="my_monitor";
function update(type,vmid){  
    $("body").stopTime(timerKey);
    $("body").everyTime(updateInterval,timerKey,function() {  //10秒钟刷新一次
        if(vmid==undefined){
            return;
        }
        monitormg.getMonitorData(type,vmid,function(){
        	 monitormg.initPlot();
             monitormg.drawPlot();
             // fixed bug : 0008896,0008849
             $("div.legend>div").css({
     	    	left:'',
     	    	opacity:0.7,
     	    	right:8,
     	    	top:5
     	    	}).width(160);
             $("div.legend>table").css({
     	    	left:'',
     	    	opacity:0.7,
     	    	right:8,
     	    	top:5
     	    	}).width(160);
             $(".tickLabel").width(40);
        });
       
    });
}
/*
function update1(vmid) {
    timeoutId = setTimeout(function(){
    	if(vmid==undefined){
    		return;
    	}
        monitormg.rs = monitormg.getMonitorData(vmid);
        monitormg.drawPlot();
        setTimeout(arguments.callee, updateInterval);
    },updateInterval);
    Concurrent.Thread.sleep(updateInterval);
    if(thread!=''){
       thread.kill();
       thread = Concurrent.Thread.create(update);//实现多线程
    }
}*/
Date.prototype.format = function(fmt)   
{ //author: meizz   
  var o = {   
    "M+" : this.getMonth()+1,                 //月份   
    "d+" : this.getDate(),                    //日   
    "h+" : this.getHours(),                   //小时   
    "m+" : this.getMinutes(),                 //分   
    "s+" : this.getSeconds(),                 //秒   
    "q+" : Math.floor((this.getMonth()+3)/3), //季度   
    "S"  : this.getMilliseconds()             //毫秒   
  };   
  if(/(y+)/.test(fmt))   
    fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));   
  for(var k in o)   
    if(new RegExp("("+ k +")").test(fmt))   
  fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
  return fmt;   
}  



function showProductMonitor(type,vmid) {
		monitormg.getMonitorData(type,vmid,function(){
		monitormg.initPlot();
	    monitormg.drawPlot();
	    $("div.legend>div").css({
	    	left:'',
	    	opacity:0.7,
	    	right:8,
	    	top:5
	    	}).width(160);
	    $("div.legend>table").css({
	    	left:'',
	    	opacity:0.7,
	    	right:8,
	    	top:5
	    	}).width(160);	 
	    $(".tickLabel").width(40);
	    update(type,vmid);
	});
   
}