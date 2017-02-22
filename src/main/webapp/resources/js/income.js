/**
 * Created by linyiming on 15/9/19.
 */
//创建ECharts柱状图图表
function DrawCustomer1(ec,info) { // 基于准备好的dom，初始化echarts图表
    var mychart = ec.init(document.getElementById('onlineIncom'));
    /*option = {
    	    title: {
    	        x: 'center',
    	        text: '收入情况',
    	        textStyle:{color:'white'}
    	    },
    	    tooltip: {
    	        trigger: 'item'
    	    },
    	    grid: {
    	        borderWidth: 0,
    	        y: 80,
    	        y2: 60
    	    },
    	    xAxis: [
    	        {
    	            type: 'category',
    	            show: true,
    	            data: ['Line', 'Bar', 'Scatter', 'K', 'Pie', 'Radar', 'Chord', 'Force', 'Map', 'Gauge', 'Funnel']
    	        }
    	    ],
    	    yAxis: [
    	        {
    	            type: 'value',
    	            show: false
    	        }
    	    ],
    	    series: [
    	        {
    	            name: 'ECharts例子个数统计',
    	            type: 'bar',
    	            itemStyle: {
    	                normal: {
    	                    color: function(params) {
    	                        // build a color map as your need.
    	                        var colorList = [
    	                          '#C1232B','#B5C334','#FCCE10','#E87C25','#27727B',
    	                           '#FE8463','#9BCA63','#FAD860','#F3A43B','#60C0DD',
    	                           '#D7504B','#C6E579','#F4E001','#F0805A','#26C0C0'
    	                        ];
    	                        return colorList[params.dataIndex]
    	                    },
    	                    label: {
    	                        show: true,
    	                        position: 'top',
    	                        formatter: '{b}\n{c}'
    	                    }
    	                }
    	            },
    	            data: [12,21,10,4,12,5,6,5,25,23,7],
    	            markPoint: {
    	                tooltip: {
    	                    trigger: 'item',
    	                    backgroundColor: 'rgba(0,0,0,0)',
    	                    formatter: function(params){
    	                        return '<img src="' 
    	                                + params.data.symbol.replace('image://', '')
    	                                + '"/>';
    	                    }
    	                },
    	                data: [
    	                    {xAxis:0, y: 350, name:'Line', symbolSize:20, symbol: 'image://../asset/ico/折线图.png'},
    	                    {xAxis:1, y: 350, name:'Bar', symbolSize:20, symbol: 'image://../asset/ico/柱状图.png'},
    	                    {xAxis:2, y: 350, name:'Scatter', symbolSize:20, symbol: 'image://../asset/ico/散点图.png'},
    	                    {xAxis:3, y: 350, name:'K', symbolSize:20, symbol: 'image://../asset/ico/K线图.png'},
    	                    {xAxis:4, y: 350, name:'Pie', symbolSize:20, symbol: 'image://../asset/ico/饼状图.png'},
    	                    {xAxis:5, y: 350, name:'Radar', symbolSize:20, symbol: 'image://../asset/ico/雷达图.png'},
    	                    {xAxis:6, y: 350, name:'Chord', symbolSize:20, symbol: 'image://../asset/ico/和弦图.png'},
    	                    {xAxis:7, y: 350, name:'Force', symbolSize:20, symbol: 'image://../asset/ico/力导向图.png'},
    	                    {xAxis:8, y: 350, name:'Map', symbolSize:20, symbol: 'image://../asset/ico/地图.png'},
    	                    {xAxis:9, y: 350, name:'Gauge', symbolSize:20, symbol: 'image://../asset/ico/仪表盘.png'},
    	                    {xAxis:10, y: 350, name:'Funnel', symbolSize:20, symbol: 'image://../asset/ico/漏斗图.png'},
    	                ]
    	            }
    	        }
    	    ]
    	};*/
    option = {
    	    title : {
    	    	 x: 'center',
     	        text: '电商客户收入增长量',
     	        textStyle:{color:'white'}
    	    },
    	    tooltip : {
    	        trigger: 'axis'
    	    },
    	   /* legend: {
    	        data:['蒸发量','降水量']
    	    },*/
    	    grid: {
    	        borderWidth: 0,
    	        y: 80,
    	        y2: 60
    	    },
    	    xAxis : [
    	        {
    	            type : 'category',
    	            show:false,
    	            axisLabel : {
    	            	textStyle:{
							color:"white", //刻度颜色
						}
    	            },
    	            data : ['2013.12','2014.3','2014.6','2014.9','2014.12','2015.3','2015.6']
    	        }
    	    ],
    	    yAxis : [
    	        {
    	            type : 'value',
    	            show:false,
    	            axisLabel : {
    	            	textStyle:{
							color:"white", //刻度颜色
						},
    	                formatter: '{value} 万元'
    	            }
    	        
    	        }
    	    ],
    	    series : [
    	        {
    	            name:'收入',
    	            type:'bar',
    	            itemStyle: {
    	                normal: {
    	                    color: function(params) {
    	                        // build a color map as your need.
    	                        var colorList = [
    	                          '#C1232B','#B5C334','#FCCE10','#E87C25','#27727B',
    	                           '#FE8463','#9BCA63','#FAD860','#F3A43B','#60C0DD',
    	                           '#D7504B','#C6E579','#F4E001','#F0805A','#26C0C0'
    	                        ];
    	                        return colorList[params.dataIndex]
    	                    },
    	                    label: {
    	                        show: true,
    	                        position: 'top',
    	                        formatter: '{b}\n{c}\t万'
    	                    }
    	                }
    	            },
    	            data:[GetRandomNum(20,100),GetRandomNum(100,200), GetRandomNum(200,800), GetRandomNum(800,1600), GetRandomNum(1600,2500), GetRandomNum(2500,4000), GetRandomNum(4000,5000)],
    	           /* markPoint : {
    	                data : [
    	                    {type : 'max', name: '最大值'},
    	                    {type : 'min', name: '最小值'}
    	                ]
    	            },*/
    	          /*  markLine : {
    	                data : [
    	                    {type : 'average', name: '平均值'}
    	                ]
    	            }*/
    	        }
    	    ]
    	};
    // 为echarts对象加载数据
    mychart.setOption(option,true);


/********/
/********/
/********/
/********/
/********/
    var mychart2 = ec.init(document.getElementById('offlineIncom'));

    option = {
    	    title : {
    	    	 x: 'center',
     	        text: '直销客户收入增长量',
     	        textStyle:{color:'white'}
    	    },
    	    tooltip : {
    	        trigger: 'axis'
    	    },
    	   /* legend: {
    	        data:['蒸发量','降水量']
    	    },*/
    	    grid: {
    	        borderWidth: 0,
    	        y: 80,
    	        y2: 60
    	    },
    	    xAxis : [
    	        {
    	            type : 'category',
    	            show:false,
    	            axisLabel : {
    	            	textStyle:{
							color:"white", //刻度颜色
						}
    	            },
    	            data : ['2013.12','2014.3','2014.6','2014.9','2014.12','2015.3','2015.6']
    	        }
    	    ],
    	    yAxis : [
    	        {
    	            type : 'value',
    	            show:false,
    	            axisLabel : {
    	            	textStyle:{
							color:"white", //刻度颜色
						},
    	                formatter: '{value} 万元'
    	            }
    	        
    	        }
    	    ],
    	    series : [
    	        {
    	            name:'收入',
    	            type:'bar',
    	            itemStyle: {
    	                normal: {
    	                    color: function(params) {
    	                        // build a color map as your need.
    	                        var colorList = [
    	                          '#C1232B','#B5C334','#FCCE10','#E87C25','#27727B',
    	                           '#FE8463','#9BCA63','#FAD860','#F3A43B','#60C0DD',
    	                           '#D7504B','#C6E579','#F4E001','#F0805A','#26C0C0'
    	                        ];
    	                        return colorList[params.dataIndex]
    	                    },
    	                    label: {
    	                        show: true,
    	                        position: 'top',
    	                        formatter: '{b}\n{c}\t万'
    	                    }
    	                }
    	            },
    	            data:[GetRandomNum(200,500), GetRandomNum(500,1000), GetRandomNum(1000,3000), GetRandomNum(3000,5000), GetRandomNum(5000,9000), GetRandomNum(9000,15000), GetRandomNum(15000,20000)],
    	           /* markPoint : {
    	                data : [
    	                    {type : 'max', name: '最大值'},
    	                    {type : 'min', name: '最小值'}
    	                ]
    	            },*/
    	          /*  markLine : {
    	                data : [
    	                    {type : 'average', name: '平均值'}
    	                ]
    	            }*/
    	        }
    	    ]
    	};
    // 为echarts对象加载数据
    mychart2.setOption(option,true);
}

function GetRandomNum(Min,Max)
{   
	var Range = Max - Min;   
	var Rand = Math.random();   
	return(Min + Math.round(Rand * Range));   
}