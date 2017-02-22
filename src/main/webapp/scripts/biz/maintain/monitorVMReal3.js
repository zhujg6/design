var nicInsDatas=[];
var nicInDatas=[];
var nicOutDatas=[];
var diskUageDatas=[];
var memUageDatas=[];
var cpuUageDatas=[];
window.Controller = {
		
   init : function() {
	Highcharts.setOptions({
        colors: ['#058DC7', '#ED561B', '#DDDF00', '#50B432', '#24CBE5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4']
    });
		var id = $("#vmId").val();
		monitormg.init(id);
		getFirstTimeVMRealMonitorData('VM', id, function(data) {
			
			var datas =[];
			datas[0]= data.result.nicsIn;
			datas[1]= data.result.nicsOut;
			var n =0 ;
			$.each(datas, function(n, rsData) {
				if(rsData.length==0){
					
					 var data = [];
					 for(i = 0; i< (-pointNumber + 1);i++){
						var time = (new Date()).getTime() ;
						x = time + (pointNumber + i) * minuteTime,
						y = 0;
						data.push( {
							x : x,
							y : y
						});
					}
					if(n==0){
						metricName="流入";
					}else{
						metricName="流出";
					}
					nicInsDatas.push({name:metricName,data});
				}
				$.each(rsData, function(i, nicsItem) {
					 var data = [];
					 var metricName ;
					 var len = nicsItem.length;
					 time = (new Date()).getTime() ;
						if(len < -pointNumber+1&&len>0){
						    for(i = 0; i< (-pointNumber - len + 1);i++){
							x = time + (pointNumber + i) * minuteTime,
							y = 0;
							data.push( {
							x : x,
							y : y
						    });
						}
					}
					var x = '',y = '',j=-pointNumber - len + 1;
					 $.each(nicsItem, function(i, item) {
						
						metricName = item.name;
						x =  time + ((j++)+pointNumber) * minuteTime
						data.push( {
						x : x,
						y : item.val
					});	
			
					});
					 if(n==0){
						 metricName=metricName+"流入";
					 }else{
						 metricName=metricName+"流出";
					 }
					
					 nicInsDatas.push({name:metricName,data});
				 });
				
				
			});
			drawNet();
			$.each(data.result.diskUsage, function(i, diskItem) {
				 var data = [];
				 var metricName ;
				 var len = diskItem.length;
				 time = (new Date()).getTime() ;
					if(len < -pointNumber+1){
					    for(i = 0; i< (-pointNumber - len + 1);i++){
						x = time + (pointNumber + i) * minuteTime,
						y = 0;
						data.push( {
						x : x,
						y : y
					    });
					}
				}
				var x = '',y = '',j=-pointNumber - len + 1;
				 $.each(diskItem, function(i, item) {
					metricName = item.name;
					x =  time + ((j++)+pointNumber) * minuteTime
					data.push( {
					x : x,
					y : item.val
				});	
				});				
				 diskUageDatas.push({name:"硬盘使用率",data});
			 });
			drawDisk();
				
			$.each(data.result.memUsage, function(i, memItem) {
				 var data = [];
				 var metricName ;
				 var len = memItem.length;
				 time = (new Date()).getTime() ;
					if(len < -pointNumber+1){
					    for(i = 0; i< (-pointNumber - len + 1);i++){
						x = time + (pointNumber + i) * minuteTime,
						y = 0;
						data.push( {
						x : x,
						y : y
					    });
					}
				}
				var x = '',y = '',j=-pointNumber - len + 1;
				 $.each(memItem, function(i, item) {
					metricName = item.name;
					x =  time + ((j++)+pointNumber) * minuteTime
					data.push( {
					x : x,
					y : item.val
				});	
				});				
				 memUageDatas.push({name:"内存使用率",data});
			 });
			drawMem();
			$.each(data.result.cpuUsage, function(i, cpuItem) {
				 var data = [];
				 var metricName ;
				 var len = cpuItem.length;
				 time = (new Date()).getTime() ;
					if(len < -pointNumber+1){
					    for(i = 0; i< (-pointNumber - len + 1);i++){
						x = time + (pointNumber + i) * minuteTime,
						y = 0;
						data.push( {
						x : x,
						y : y
					    });
					}
				}
				var x = '',y = '',j=-pointNumber - len + 1;
				 $.each(cpuItem, function(i, item) {
					metricName = item.name;
					x =  time + ((j++)+pointNumber) * minuteTime
					data.push( {
					x : x,
					y : item.val
				});	
				});				
				 cpuUageDatas.push({name:"cpu使用率",data});
			 });
			drawCpu();
			});
//		getHistoryMonitorData('VM', id, function(data) {
//			historyInfo = data.result;
////			drawCpu();
////			drawMem();
////			drawDisk();
//			});
		
   }
	
}
var info = '';
var time = '';
var cpuUsage = 0;
var memUsage = 0;
var diskIn = 0;
var diskOut = 0;
var diskUsage=0;
var netIn = 0;
var netOut = 0;

var historyInfo = '';
var pointNumber = -29;
var timeInterval = 1000 * 10;//
var minuteTime = 1000 * 10;
var map = '';
var path = "";
var mo = map;
var dataF = [];
var vmID = '';
var totalPoints = 300;
var updateInterval = 10000;
var timeoutId = '';
var tickSize = 240;

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
	disk_uage : [],
	disk_r : [],
	disk_w : [],
	init : function(id) {
		path = $("#path").val();
		showProductMonitor('VM', id);
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

	nextNDate : function(begin, n) {
		// 创建开始时间对象
		beginDate = begin;
		// 设置增加的天数
		beginDate.setDate(beginDate.getDate() + n);
		// 获取增加天数后的时间字串
		// -3- js中getMonth()的返回值从0开始到11，因此要加1，才是正确的值
		var endDateStr = beginDate.getFullYear() + "-"
				+ (beginDate.getMonth() + 1) + "-" + beginDate.getDate() + " "
				+ beginDate.getHours() + ":" + beginDate.getMinutes() + ":"
				+ beginDate.getSeconds();
		endDateStr = endDateStr.replace("-", "/").replace("-", "/");
		var rs = new Date(Date.parse(endDateStr.replace(/-/g, "/")));
		return rs.getTime();
	},

	initBackground : function() {
		var jg = new jsGraphics("moDiv");
		jg.setColor("#F0F0F0");
		jg.fillRect(0, 0, 700, 650);
		jg.paint();
	},

	getCPUData : function() {
		return {
			color : "purple",
			label : " CPU (%)",
			data : monitormg.rs.get("cpu")
		};
	},
	getMEMData : function() {
		return {
			color : "blue",
			label : " MEM (%)",
			data : monitormg.rs.get("mem")
		};
	},

	initPlot : function() {
	},

	
	
	
	getMonitorData : function(type, id, callback) {

		map = new Map();
		mo = map;
		var date = new Date();
	    date.setHours(date.getHours() + date.getTimezoneOffset()/60);
	    var end_time = date.format("yyyy-MM-dd HH:mm");
	    date.setMinutes(date.getMinutes()-20)
	    var  start_time = date.format("yyyy-MM-dd HH:mm");
		
		var vmidList = {
			id : id,
			type : type,
			start_time : start_time,
			end_time : end_time
		};
		
		Dcp.JqueryUtil.dalinAsyncReq("/pr/getVMRealMonitorData", vmidList,function(data) {
				// 查询实时数据,每次返回一条记录getVMRealMonitorData
				var info = data.result;
				if (info != null) {
				var nowDate = new Date();
				var ti = new Date(Date.parse((nowDate.getYear() + "/"
						+ (nowDate.getMonth() + 1) + "/" + nowDate.getMonth()
						+ " " + info.time).replace(/-/g, "/")));
				monitormg.cpu.push( [ ti, info.cpuUsage ]);
				monitormg.mem.push( [ ti, Math.round(info.memUsage*100)/100 ]);
				monitormg.net_r.push( [ ti, info.netIn ]);
				monitormg.net_w.push( [ ti, info.netOut ])
				monitormg.disk_uage.push( [ ti, info.diskUsage ]);
				monitormg.disk_r.push( [ ti, info.diskIn ]);
				monitormg.disk_w.push( [ ti, info.diskOut ]);
				mo.put("cpu", monitormg.cpu);
				mo.put("mem", monitormg.mem);
				mo.put("net_r", monitormg.net_r);
				mo.put("net_w", monitormg.net_w);
				mo.put("disk_uage", monitormg.disk_uage);
				mo.put("disk_r", monitormg.disk_r);
				mo.put("disk_w", monitormg.disk_w);
			}
			monitormg.rs = mo;
			if (callback) {
				callback(data);
			}
		});
	},
	
	getFirstTimeVMRealMonitorData : function(type, id, callback) {

		map = new Map();
		mo = map;
		var date = new Date();
	    date.setHours(date.getHours() + date.getTimezoneOffset()/60);
	    var end_time = date.format("yyyy-MM-dd HH:mm");
	    date.setMinutes(date.getMinutes()-20)
	    var  start_time = date.format("yyyy-MM-dd HH:mm");
		
		var vmidList = {
			id : id,
			type : type,
			start_time : start_time,
			end_time : end_time
		};
		
		Dcp.JqueryUtil.dalinAsyncReq("/pr/getFirstTimeVMRealMonitorData", vmidList,function(data) {
				// 查询实时数据,每次返回一条记录getVMRealMonitorData
				var info = data.result;
				if (info != null) {
				var nowDate = new Date();
				var ti = new Date(Date.parse((nowDate.getYear() + "/"
						+ (nowDate.getMonth() + 1) + "/" + nowDate.getMonth()
						+ " " + info.time).replace(/-/g, "/")));
				monitormg.cpu.push( [ ti, info.cpuUsage ]);
				monitormg.mem.push( [ ti, Math.round(info.memUsage*100)/100 ]);
				monitormg.net_r.push( [ ti, info.netIn ]);
				monitormg.net_w.push( [ ti, info.netOut ])
				monitormg.disk_uage.push( [ ti, info.diskUsage ]);
				monitormg.disk_r.push( [ ti, info.diskIn ]);
				monitormg.disk_w.push( [ ti, info.diskOut ]);
				mo.put("cpu", monitormg.cpu);
				mo.put("mem", monitormg.mem);
				mo.put("net_r", monitormg.net_r);
				mo.put("net_w", monitormg.net_w);
				mo.put("disk_uage", monitormg.disk_uage);
				mo.put("disk_r", monitormg.disk_r);
				mo.put("disk_w", monitormg.disk_w);
			}
			monitormg.rs = mo;
			if (callback) {
				callback(data);
			}
		});
	}
	
	
};

/*var optionsCpu = {
	series : {
		shadowSize : 0
	},
	yaxis : {
		min : 0,
		max : 100
	},
	xaxis : {
		mode : "time",
		timeformat : "%h %p",
		minTickSize : [ 1, "minute" ],
		twelveHourClock : false,
		tickFormatter : function(val, axis) {
		var d = new Date(val);
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
	}, 
	yaxis : {
		min : 0,
		max : 100
	},
	xaxis : {
		mode : "time",
		timeformat : "%h %p",
		minTickSize : [ 1, "minute" ],
		twelveHourClock : false,
		tickFormatter : function(val, axis) {
		var d = new Date(val); // bug 0004001
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
	}, 
	yaxis : {
		min : 0,
		autoscaleMargin : 1.5
	},
	xaxis : {
		mode : "time",
		timeformat : "%h %p",
		minTickSize : [ 1, "minute" ],
		twelveHourClock : false,
		tickFormatter : function(val, axis) {
		var d = new Date(val); 
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
	}, 
	yaxis : {
		min : 0,
		autoscaleMargin : 2
	},
	xaxis : {
		mode : "time",
		timeformat : "%h %p",
		minTickSize : [ 1, "minute" ],
		twelveHourClock : false,
		tickFormatter : function(val, axis) {
		var d = new Date(val); // bug 0004001
		return d.format('hh:mm');
	}
	},
	legend : {
		position : 'nw'
	}
};*/
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

var thread = '';
var timerKey = "my_monitor";
function update(type, vmid) {
	$("body").stopTime(timerKey);
	$("body").everyTime(updateInterval, timerKey, function() { // 设置刷新时间
				if (vmid == undefined) {
					return;
				}
				monitormg.getMonitorData(type, vmid, function(data) {
                    info = data.result;
                    if(info == null || info == ""){
                    	cpuUsage = "0";
    					memUsage = "0";
    					diskUsage = "0";
    				    diskIn = "0";
    					diskOut = "0";
    					netIn = "0";
    					nicInDatas=[];
    					netOut = "0";
                    }else{
						time = info.time;
						cpuUsage = info.cpuUsage;
						memUsage = info.memUsage;
						diskUsage = info.diskUsage;;
					    diskIn = info.diskIn;
						diskOut = info.diskOut;
						netIn = info.netIn;
						nicInDatas=info.netIn;
						netOut = info.netOut;
                    }
				});

			});
}
Date.prototype.format = function(fmt) { // author: meizz
	var o = {
		"M+" : this.getMonth() + 1, // 月份
		"d+" : this.getDate(), // 日
		"h+" : this.getHours(), // 小时
		"m+" : this.getMinutes(), // 分
		"s+" : this.getSeconds(), // 秒
		"q+" : Math.floor((this.getMonth() + 3) / 3), // 季度
		"S" : this.getMilliseconds()
	};
	if (/(y+)/.test(fmt))
		fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "")
				.substr(4 - RegExp.$1.length));
	for ( var k in o)
		if (new RegExp("(" + k + ")").test(fmt))
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k])
					: (("00" + o[k]).substr(("" + o[k]).length)));
	return fmt;
}

function showProductMonitor(type, vmid) {
	monitormg.getMonitorData(type, vmid, function() {
		update(type, vmid);
	});

}

function drawCpu() {
	Highcharts.setOptions( {
		global : {
			useUTC : false
		}
	});
	var chart;
	$('#CpuArea1')
			.highcharts(
					{
						chart : {
							type : 'spline',
							animation : Highcharts.svg,
							marginRight : 10,
							events : {
								load : function() {
									var series = this.series[0];
									setInterval(
											function() {
												var nowDate = new Date();
												var dateParse = Date.parse((nowDate.getFullYear()+"/"+(nowDate.getMonth()+1)+"/"+nowDate.getDate()+" "+time).replace(/-/g, "/"))
												var x ='', y = '';
												if(info == null || info == ""){
													x = (new Date()).getTime(),
													y = 0;
												}
												else{
												    x = (new Date()).getTime(),//dateParse,
												    y = Number(cpuUsage)
												}
												series.addPoint( [ x, y ],
														true, true);
											}, timeInterval);
								}
							}
						},
						title : {
							text : 'CPU使用率'
						},
						xAxis : {
							type : 'datetime',
							tickPixelInterval : 100
						},
						yAxis : {
							//min : 0,
							//max : 100,
							//tickPositions : [0,25,50,75,100],
							title : {
								text : 'CPU USED（%）'
							},
							plotLines : [ {
								value : 0,
								width : 1,
								color : '#808080'
							} ]
						},
						tooltip : {
							formatter : function() {
								return '<b>'
										+ this.series.name
										+ " ： "
										+ '</b>'
										+ Highcharts.numberFormat(this.y, 2)+"%"

										+ '<br/>'
										+ Highcharts.dateFormat(
												'%Y-%m-%d %H:%M:%S', this.x);
							}
						},
						legend : {
						},
						exporting : {
							enabled : false
						},
						series : cpuUageDatas
					});
};


function drawMem() {
	
	Highcharts.setOptions( {
		global : {
			useUTC : false
		}
	});
	var chart;
	$('#MemArea12')
			.highcharts(
					{
						chart : {
						//设置以折线形式（spline）显示信息
							type : 'spline',
							animation : Highcharts.svg,
							marginRight : 10,
							events : {
						
								load : function() {
						            //取得第一条折线
									var series = this.series[0];
									
									setInterval(
											
											function() {
												var nowDate = new Date();
												var dateParse = Date.parse((nowDate.getFullYear()+"/"+(nowDate.getMonth()+1)+"/"+nowDate.getDate()+" "+time).replace(/-/g, "/"))
												var x ='', y = '';
												if(info == null || info == ""){
													x = (new Date()).getTime();
													y = 0;
												}
												else{
												    x = (new Date()).getTime(),//dateParse,
												    y = Number(memUsage)
												}
												series.addPoint( [ x, y ],
														true, true);
											}, timeInterval);
								}
							}
						},
						title : {
							text : '内存使用率'
						},
						//设置x轴的属性
						xAxis : {
							type : 'datetime',
							tickPixelInterval : 100
							//labels : {step : 1}
						},
						//设置y轴的属性
						yAxis : {
							//min : 0,
							//max : 100,
							//tickPositions : [0,25,50,75,100],
							title : {
								text : 'MEMORY USED（%）'
							},
							plotLines : [ {
								value : 0,
								width : 1,
								color : '#808080'
							} ]
						},
						//设置显示提示信息的格式
						tooltip : {
							formatter : function() {
								return '<b>'
										+ this.series.name
										+ " ： "
										+ '</b>'
										+ Highcharts.numberFormat(this.y, 2)+"%"

										+ '<br/>'
										+ Highcharts.dateFormat(
												'%Y-%m-%d %H:%M:%S', this.x);
							}
						},
						legend : {
						},
						exporting : {
							enabled : false
						},
						//生成占位数据。
						series : memUageDatas
					});
};



function drawDisk() {
	Highcharts.setOptions( {
		global : {
			useUTC : false
		}
	});
	var chart;
	$('#DiskArea1')
			.highcharts(
					{
						chart : {
							type : 'spline',
							animation : Highcharts.svg,
							marginRight : 10,
							events : {
								load : function() {
									var series0 = this.series[0];
									//var series1 = this.series[1];
									setInterval(
											function() {
												var nowDate = new Date();
												var dateParse = Date.parse((nowDate.getFullYear()+"/"+(nowDate.getMonth()+1)+"/"+nowDate.getDate()+" "+time).replace(/-/g, "/"));
												var x ='', y = '';
												
												if(info == null || info == ""){
												//	x = (new Date()).getTime();
													x0 = (new Date()).getTime();
//													y = 0;
													y0 = 0;
												}
												else{
												 //   x = (new Date()).getTime(),//dateParse,
												    x0 = (new Date()).getTime(),//dateParse,
												  //  y = Number(diskOut),
												    y0 = Number(diskUsage)
												}
												//series1.addPoint( [ x, y ],true, true);
//												console.log(series0.name+"****"+$.toJSON(series0.xData));
//												console.log(series0.name+"****"+$.toJSON(series0.yData));
												series0.addPoint( [ x0, y0 ],true, true);
											}, timeInterval);
								}
							}
						},
						title : {
							//text : '硬盘（读/写）'
							text : '硬盘（使用率）'
						},
						xAxis : {
							type : 'datetime',
							tickPixelInterval : 100
						},
						yAxis : {
							//min : 0,
							title : {
								text : 'RATE(%)'
							},
							plotLines : [ {
								value : 0,
								width : 1,
								color : '#808080'
							} ]
						},
						tooltip : {
							formatter : function() {
								return '<b>'
										+ this.series.name
										+ " ： "
										+ '</b>'
										+ Highcharts.numberFormat(this.y, 2)+"%"

										+ '<br/>'
										+ Highcharts.dateFormat(
												'%Y-%m-%d %H:%M:%S', this.x);
							}
						},
						legend : {
						},
						exporting : {
							enabled : false
						},
						series : diskUageDatas
					});
};
function drawNet() {
	Highcharts.setOptions( {
		global : {
			useUTC : false
		}
	});
	var chart;
	$('#NetArea1')
			.highcharts(
					{
						chart : {
							type : 'spline',
							animation : Highcharts.svg,
							marginRight : 10,
							events : {
								load : function() {
									var series0 = this.series[0];
									var series1 = this.series[1];
									var series = this.series;
									setInterval(
											function() {
												var nowDate = new Date();
												var dateParse = Date.parse((nowDate.getFullYear()+"/"+(nowDate.getMonth()+1)+"/"+nowDate.getDate()+" "+time).replace(/-/g, "/"))
												var x ='', y = '';
												if(nicInDatas == null || nicInDatas == ""){
													x = (new Date()).getTime();
													x0 = (new Date()).getTime();
													y = 0;
													y0 = 0;
												}
												else{
													$.each(nicInDatas, function(i, nicsItem) {
														 var data = [];
														 var metricName ;
														 $.each(nicsItem, function(i, item) {
																var x = '',y = '';
																metricName = item.name;															
																$.each(series, function(i, serie) {
																	 if(serie.name==(metricName+"流入")||serie.name==(metricName+"流出")){
//																		 console.log(metricName+"***"+$.toJSON(serie.xData)+"***"+(Number(serie.xData[29])+minuteTime) );
//																		 console.log(metricName+"***"+$.toJSON(serie.yData+"****"));
//																		 alert(item.val);
																		 serie.addPoint( [(Number(serie.xData[29])+minuteTime), item.val ],true, true);
																	 }
																	// series0.addPoint( [ item.t, item.val ],true, true);
																 });
																
														 });
														 
														 
													 });
												}
											}, timeInterval);
								}
							}
						},
						title : {
							text : '网络（流入/流出）'
						},
						xAxis : {
							type : 'datetime',
							tickPixelInterval : 100
						},
						yAxis : {
							//min : 0,
							title : {
								text : 'NETWORK I/O(KB/s)'
							},
							plotLines : [ {
								value : 0,
								width : 1,
								color : '#808080'
							} ]
						},
						tooltip : {
							formatter : function() {
								return '<b>'
										+ this.series.name
										+ " ： "
										+ '</b>'
										+ Highcharts.numberFormat(this.y, 2)+"KB/s"

										+ '<br/>'
										+ Highcharts.dateFormat(
												'%Y-%m-%d %H:%M:%S', this.x);
							}
						},
						legend : {
						},
						exporting : {
							enabled : false
						},
						series :nicInsDatas
					});
};


function getFirstTimeVMRealMonitorData (type, id, callback) {

	map = new Map();
	mo = map;
	var date = new Date();
    date.setHours(date.getHours() + date.getTimezoneOffset()/60);
    var end_time = date.format("yyyy-MM-dd HH:mm");
    date.setMinutes(date.getMinutes()-20)
    var  start_time = date.format("yyyy-MM-dd HH:mm");
	
	var vmidList = {
		id : id,
		type : type,
		start_time : start_time,
		end_time : end_time
	};
	
	Dcp.JqueryUtil.dalinAsyncReq("/pr/getFirstTimeVMRealMonitorData", vmidList,function(data) {
			// 查询实时数据,每次返回一条记录getVMRealMonitorData
			var info = data.result;
			if (info != null) {
			var nowDate = new Date();
			var ti = new Date(Date.parse((nowDate.getYear() + "/"
					+ (nowDate.getMonth() + 1) + "/" + nowDate.getMonth()
					+ " " + info.time).replace(/-/g, "/")));
			monitormg.cpu.push( [ ti, info.cpuUsage ]);
			monitormg.mem.push( [ ti, Math.round(info.memUsage*100)/100 ]);
			monitormg.net_r.push( [ ti, info.netIn ]);
			monitormg.net_w.push( [ ti, info.netOut ])
			monitormg.disk_uage.push( [ ti, info.diskUsage ]);
			monitormg.disk_r.push( [ ti, info.diskIn ]);
			monitormg.disk_w.push( [ ti, info.diskOut ]);
			mo.put("cpu", monitormg.cpu);
			mo.put("mem", monitormg.mem);
			mo.put("net_r", monitormg.net_r);
			mo.put("net_w", monitormg.net_w);
			mo.put("disk_uage", monitormg.disk_uage);
			mo.put("disk_r", monitormg.disk_r);
			mo.put("disk_w", monitormg.disk_w);
		}
		monitormg.rs = mo;
		if (callback) {
			callback(data);
		}
	});
}


function getHistoryMonitorData(type, id, callback) {
	map = new Map();
	mo = map;
	var end = new Date();
	var start = monitormg.nextNDate(end, -3);
	
	var d=new Date();
	var day=d.getDate();
	var month=d.getMonth() + 1;
	var year=d.getFullYear();
	var hour=d.getHours()-3;
	if(hour < 0){
		hour = hour + 24;
		day = day - 1;
	}
	var minute=d.toString().split(":")[1]
	var second=(d.toString().split(":")[2]).split(" ")[0]
	var time = year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
	var vmidList = {
		id : id,
		timeType : "HOUR",
		valueType : "MAX",
		startTime : time
	};

	Dcp.JqueryUtil.dalinAsyncReq("/pr/getVMHistoryMonitorData", vmidList,function(data) {
			// 查询实时数据,每次返回一条记录getVMRealMonitorData
			var info = data.result;
			if (info != null) {
		}
		if (callback) {
			callback(data);
		}
	});
}


