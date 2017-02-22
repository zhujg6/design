var map=''; 
var path = "";
var mo = map;
var dataF = [];
var vmID = '';
var totalPoints = 300;
var updateInterval = 10000;
var timeoutId = '';
var tickSize = 240;

window.Controller = {
	init : function(){
		var id = $("#vmId").val();
		monitormg.init(id);
	}
}

var monitormg = {
    rs : {},
     cpu_plot : '',
     mem_plot : '',
     net_plot : '',
     disk_plot : '',
     cpu : [], 
     mem : [], 
     net_r : [], 
     net_w : [], 
     disk_r : [], 
     disk_w : [],
    init : function(id) {
    	path = $("#path").val();
    	showProductMonitor('VM',id);
    },

    getMonitorInfo : function(code) {
        var info = code;
        
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
                            label : " NetRead (kbps)",
                            data : monitormg.rs.get("net_r"),
                            lines : {
                                show : true
                            }
                        }, {
                            color : "red",
                            label : " NetWrite (kbps)",
                            data : monitormg.rs.get("net_w"),
                            lines : {
                                show : true
                            }
                        }], optionsNet);
        monitormg.disk_plot = $.plot($("#DiskArea"), [ {
                            color : "green",
                            label : " DiskRead (kbps)",
                            data : monitormg.rs.get("disk_r"),
                            lines : {
                                show : true
                            }
                        }, {
                            color : "red",
                            label : " DiskWrite (kbps)",
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
                            label : " NetRead (kbps)",
                            data : monitormg.rs.get("net_r"),
                            lines : {
                                show : true
                            }
                        }, {
                            color : "red",
                            label : " NetWrite (kbps)",
                            data : monitormg.rs.get("net_w"),
                            lines : {
                                show : true
                            }
                        }]);  
        monitormg.net_plot.draw();
        
        monitormg.disk_plot.setData([ {
                            color : "green",
                            label : " DiskRead (kbps)",
                            data : monitormg.rs.get("disk_r"),
                            lines : {
                                show : true
                            }
                        }, {
                            color : "red",
                            label : " DiskWrite (kbps)",
                            data : monitormg.rs.get("disk_w"),
                            lines : {
                                show : true
                            }
                        }]);  
        monitormg.disk_plot.draw();         
    },    
    
    getMonitorData : function(type,id,callback){
        //var cpu = [], mem = [], net_r = [], net_w = [], disk_r = [], disk_w = [];

        map = new Map();  
        mo = map;
        var end = new Date();
        var start = monitormg.nextNDate(end,-1);
        var vmidList = {
            id : id
            ,type : type
        };
        
	  	Dcp.JqueryUtil.dalinAsyncReq( "/pr/getVMRealMonitorData",vmidList,function(data) {
                //查询实时数据,每次返回一条记录
                var info = data.result;
                if(info != null){
                    //console.log(info);
                    //var ti = new Date(Date.parse(info.time.replace(/-/g, "/")));
                    //monitormg.cpu.push([ti, info.cpuUsage/100]);
                    //monitormg.mem.push([ti, info.memUsage/100]);
                    //monitormg.net_r.push([ti, Math.round(info.netIn*10/1024)/10]);
                    //monitormg.net_w.push([ti, Math.round(info.netOut*10/1024)/10]);
                    //monitormg.disk_r.push([ti, Math.round(info.diskIn*10/1024)/10]);
                    //monitormg.disk_w.push([ti, Math.round(info.diskOut*10/1024)/10]);
                    var nowDate = new Date();
                    var ti = new Date(Date.parse((nowDate.getYear()+"/"+(nowDate.getMonth()+1)+"/"+nowDate.getMonth()+" "+info.time).replace(/-/g, "/")));
                    //console.log(ti);
                    monitormg.cpu.push([ti, info.cpuUsage]);
                    monitormg.mem.push([ti, info.memUsage]);
                    monitormg.net_r.push([ti, Math.round(info.netIn)]);
                    monitormg.net_w.push([ti, Math.round(info.netOut)]);
                    monitormg.disk_r.push([ti, Math.round(info.diskIn)]);
                    monitormg.disk_w.push([ti, Math.round(info.diskOut)]);
                            
                    //console.log(monitormg.cpu);
                    mo.put("cpu", monitormg.cpu);
                    mo.put("mem", monitormg.mem);
                    mo.put("net_r", monitormg.net_r);
                    mo.put("net_w", monitormg.net_w);
                    mo.put("disk_r", monitormg.disk_r);
                    mo.put("disk_w", monitormg.disk_w);
                }
                monitormg.rs = mo;
                if(callback) {
                	callback();
                }
	  	});
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