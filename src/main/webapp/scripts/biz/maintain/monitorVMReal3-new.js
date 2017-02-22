window.Controller = {
	init : function() {
		//var id = $("#vmId").val();
		var id = "Zabbix server";
		getdataForHour(id);
	}
};

//释放资源
function releaseSource(){
    cpuchart=null;
    netIoChart=null;
    diskChart=null;
    memoryChart=null;
}

function formDate(dateStr){
    var splitStr = dateStr.indexOf('T') > 0 ? "T" : " ";
    var f = dateStr.split(splitStr, 2);
    var d = (f[0] ? f[0] : '').split('-', 3);
    var t = (f[1] ? f[1] : '').split(':', 3);
    return new Date(
        parseInt(d[0], 10) || null,
        (parseInt(d[1], 10) || 1) - 1,
        parseInt(d[2], 10) || null,
        parseInt(t[0], 10) || null,
        parseInt(t[1], 10) || null,
        parseInt(t[2], 10) || null
    );
}

//获取一小时的数据
function getdataForHour(id){
    releaseSource();
    var date = new Date();
    date.setHours(date.getHours() + date.getTimezoneOffset()/60);
    var end_time = date.format("yyyy-MM-dd hh:mm:ss");
    date.setHours(date.getHours() - 1);
    var  start_time = date.format("yyyy-MM-dd hh:mm");
    var paramStr = "q.field=resource_id&q.value=".concat(id).concat("&q.op=eq&")
        			.concat("q.field=timestamp&q.value=").concat(start_time).concat("&q.op=ge&")
        			.concat("q.field=timestamp&q.value=").concat(end_time).concat("&q.op=lt&");
    cupUsed("vm.cpu.system?".concat(paramStr));
    memoryUsed("vm.memory.used?".concat(paramStr));
    initDisk("vm.disk.read?".concat(paramStr),"vm.disk.write?".concat(paramStr));
    initNetIo("vm.network.read?".concat(paramStr),"vm.network.write?".concat(paramStr));
}
	
function cupUsed(paramStr){
	$('#CpuArea1').html("");
    var cpuPieChart = {
        chart: {
            type: 'spline',
            animation: Highcharts.svg, // don't animate in old IE
            events: {
                load: function() {
                    cpuChart = this;
                }
            }
        },
        title: {
            text: "CPU使用率",
            x: -20
        },
        subtitle: {
            text: '',
            x: -20
        },
        credits:{
            enabled:false
        },
        xAxis: {
            categories: [],
            minTickInterval: 1 ,
            labels : {
                rotation : -45,
                align : 'right',
                useHTML : true,
                y:30,
                x:6
            }
        },
        yAxis: {
            title: {
                text: '%'
            },
            labels:{
                enabled:true,

                formatter:function() {
                    return this.value;
                }
            },
            min:0,
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        tooltip: {
            formatter:function(){
                var showTime;
                var dataTime = this.point.name;
                if(dataTime != " "){
                    showTime = " ("+ dataTime +")";
                }else{
                    showTime="";
                }
                return this.series.name+":"+this.point.y+"%"+showTime;
            }
        },
        legend: {
            // layout: 'vertical',
            align: 'center',
            verticalAlign: 'bottom',
            borderWidth: 0
        },
        series: []
    };
	Dcp.JqueryUtil.dalinAsyncReq("/pr/getVMRealMonitorData?_&=" + new Date().getTime(), paramStr,function(msg) {
       var series = formatData(msg);
       $.each(series, function(i, n){
			 n.name = "CPU使用率";
		 });
        cpuPieChart.series=(series);
        $('#CpuArea1').highcharts(cpuPieChart);
    });
    Highcharts.setOptions({
        global: {
            useUTC: false
        }
    });
    
}

function memoryUsed(paramStr){
	$('#MemArea12').html("");
    var memoryPieChart = {
        chart: {
            type: 'spline',
            animation: Highcharts.svg, // don't animate in old IE
            events: {
                load: function() {
                    memoryChart = this;
                }
            }
        },
        title: {
            text: "内存使用率",
            x: -20
        },
        subtitle: {
            text: '',
            x: -20
        },
        credits:{
            enabled:false
        },
        xAxis: {
            categories: [],
            minTickInterval: 1 ,
            labels : {
                rotation : -45,
                align : 'right',
                useHTML : true,
                y:30,
                x:6
            }
        },
        yAxis: {
            title: {
                text: '%'
            },
            labels:{
                enabled:true,

                formatter:function() {
                    return this.value;
                }
            },
            min:0,
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        tooltip: {
            formatter:function(){
                /*  if(this.point.y==-1){
                 return " ";
                 }*/
                var showTime;
                var dataTime = this.point.name;
                if(dataTime != " "){
                    showTime = " ("+ dataTime +")";
                }else{
                    showTime="";
                }
                return this.series.name+":"+this.point.y+"%"+showTime;
            }
        },
        legend: {
            // layout: 'vertical',
            align: 'center',
            verticalAlign: 'bottom',
            borderWidth: 0
        },
        series: []
    };
	Dcp.JqueryUtil.dalinAsyncReq("/pr/getVMRealMonitorData?_&=" + new Date().getTime(), paramStr,function(msg) {
       /* var zeroCpuFlag = 0;
        $.each(msg,function(i,n){
            if(n.resource_metadata.memUsage == 0){
                zeroCpuFlag++;
            }
        });
        if(zeroCpuFlag == msg.length){
        	memoryPieChart.yAxis.max = 100;
        }*/
		 var series = formatData(msg);
		 $.each(series, function(i, n){
			 n.name = "内存使用率";
		 });
		 memoryPieChart.series=(series);
        $('#MemArea12').highcharts(memoryPieChart);
    });
    Highcharts.setOptions({
        global: {
            useUTC: false
        }
    });
    
}

function initDisk(urlRead, urlWrite){
    var diskReadData = [];
    Dcp.JqueryUtil.dalinReq("/pr/getVMRealMonitorData?_&=" + new Date().getTime(), urlRead,function(msg) {
    	diskReadData = msg;
   });
    Dcp.JqueryUtil.dalinReq("/pr/getVMRealMonitorData?_&=" + new Date().getTime(), urlWrite,function(diskWriteData) {
        initDiskData(diskReadData,diskWriteData);
    });

}

function initDiskData(diskReadData,diskWriteData)
{
	var series1='';
	var series2='';
	var categories=[];
	for(var i = diskReadData.length-1; i>=0; i--){
		var item = diskReadData[i];
        var date = formDate(item.timestamp);
        date.setHours(date.getHours() - date.getTimezoneOffset()/60);
        categories.push(date.format('hh:mm:ss'));
	}
    Highcharts.setOptions({
        global: {
            useUTC: true
        }
    });

    var diskIOPie = {
        chart: {
            type: 'spline',
            animation: Highcharts.svg, // don't animate in old IE
            events: {
                load: function() {
                    diskChart=this;
                }
            }
        },
        title: {
            text: "磁盘读/写速度",
            x: -20 //center
        },
        credits:{
            enabled:false
        },
        subtitle: {
            text: '',
            x: -20
        },
        xAxis: {
            categories: categories,
            minTickInterval: 1 ,
            labels : {
                rotation : -45,
                align : 'right',
                useHTML : true,
                y:30,
                x:6
            }
        },
        yAxis: {
            title: {
                text: 'KB/s'
            },
            labels:{
                enabled:true,

                formatter:function() {
                    return this.value;
                }
            },
            min:0,
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        tooltip: {
            formatter:function(){
                /* if(this.point.y==-1){
                 return " ";
                 }*/
                var showTime;
                var dataTime = this.point.name;
                if(dataTime != " "){
                    showTime = " ("+ dataTime +")";
                }else{
                    showTime="";
                }
                
                return this.series.name+":"+this.point.y+" KB/s"+showTime;
            }
        },
        legend: {
            //layout: 'vertical',
            align: 'center',
            verticalAlign: 'bottom',
            borderWidth: 0
        },
        series: []
    };
    series1= formatData(diskReadData);
    for(var i = series1.length-1; i >= 0; i--){
    	series1[i].name += '读速度';
    }
   series2= formatData(diskWriteData);
   for(var i = series2.length-1; i >= 0; i--){
   		series2[i].name += '写速度';
   }
   var arr = series1.concat(series2);
   diskIOPie.series=(arr);
    $('#DiskArea1').highcharts(diskIOPie);
}


//初始化netio
function initNetIo(urlRead, urlWrite){
    var netoutdata = [];
    Dcp.JqueryUtil.dalinReq("/pr/getVMRealMonitorData?_&=" + new Date().getTime(), urlRead,function(msg) {
        netoutdata = msg;
    });
    Dcp.JqueryUtil.dalinReq("/pr/getVMRealMonitorData?_&=" + new Date().getTime(), urlWrite,function(msg) {
    	 initNetData1(netoutdata,msg);
    });
}

function initNetData1(msg,netInData)
{
	var series1='';
	var series2='';
	var categories=[];
	for(var i = msg.length-1; i >= 0; i--){
		var item = msg[i];
        var date= formDate(item.timestamp);
        date.setHours(date.getHours() - date.getTimezoneOffset()/60);
        categories.push(date.format('hh:mm:ss'));
	}
    Highcharts.setOptions({
        global: {
            useUTC: false
        }
    });

    var netIOPie = {
        chart: {
            type: 'spline',
            animation: Highcharts.svg, // don't animate in old IE
            events: {
                load: function() {
                    netIoChart=this;
                }
            }
        },
        title: {
            text: "网络流入/流出速率",
            x: -20 //center
        },
        subtitle: {
            text: '',
            x: -20
        },
        credits:{
            enabled:false
        },
        xAxis: {
            categories: categories,
            minTickInterval: 1 ,
            labels : {
                rotation : -45,
                align : 'right',
                useHTML : true,
                y:30,
                x:6
            }
        },
        yAxis: {
            title: {
                text: 'KB/s'
            },
            min:0,
            labels:{
                enabled:true,

                formatter:function() {
                    return this.value;
                }
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        tooltip: {
        	formatter:function(){
                var showTime;
                var dataTime = this.point.name;
                if(dataTime != " "){
                    showTime = " ("+ dataTime +")";
                }else{
                    showTime="";
                }
                    return this.series.name+":"+this.point.y+" KB/s"+showTime;
            }
        },
        legend: {
            align: 'center',
            verticalAlign: 'bottom',
            borderWidth: 0
        },
        series: []
    };

    series1= formatData(msg); 
    for(var i = series1.length-1; i >= 0; i--){
    	series1[i].name += '流入速率';
    }
    series2= formatData(netInData);
    for(var i = series2.length-1;i >= 0; i--){
    	series2[i].name += '流出速率';
    }
    var arr = series1.concat(series2);
     netIOPie.series=(arr);
    $('#NetArea1').highcharts(netIOPie);
}


//格式化磁盘读写速度数据
function formatData(arr){
    var x=[];
    var result=[];
    var keys=[];
    var series=[];
    var n;
    if(arr.length == 0){
    	series = [0];
    }
    for(var i = 0;i < arr.length; i++){
        if(i==0){
            for(var k in arr[i].resource_metadata){
            	keys.push(k);
           }
        }
        x.push(arr[i].timestamp);
        result.push(arr[i].resource_metadata);
    }
    for(var k = 0;k < keys.length; k++){
        if(!(series[k] && series[k].keys[k])){
            var obj = {};
            obj.name = keys[k];
            obj.data = [];
            series.push(obj);
        }
    }
    for(var t = 0; t < 12 - result.length; t++){
   	 for(var kk in result[t]){
            for(var s = 0; s < series.length; s++){
           	 if(series[s].name == kk){
	                 var d = new Array();
	                 d.push(" ");
	                 d.push(null);
	                 series[s].data.push(d);
	             }
            }
        }
   }
    for(var j = result.length-1; j >= 0; j--){
        for(var kk in result[j]){
            for(var s = 0; s < series.length; s++){
                if(series[s].name == kk){
                    var d = new Array();
                    var date = formDate(x[j]);
                    date.setHours(date.getHours() - date.getTimezoneOffset()/60);
                    d.push(date.format('hh:mm:ss'));
                    d.push(Math.round(result[j][kk]*100)/100);
                    series[s].data.push(d);
                }
            }
        }
    }
    return series;
}

