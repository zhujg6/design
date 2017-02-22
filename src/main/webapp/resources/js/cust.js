/**
 * Created by linyiming on 15/9/19.
 */
//创建ECharts柱状图图表
function DrawCustomer2(ec,info) { // 基于准备好的dom，初始化echarts图表
   initOnline(ec,info);
   initOffline(ec,info);
}
function GetRandomNum(Min,Max)
{   
	var Range = Max - Min;   
	var Rand = Math.random();   
	return(Min + Math.round(Rand * Range));   
}

function initOnline(ec,info){
	var mychart = ec.init(document.getElementById('onlineCust'));
    option = {
    	    title : {
    	    	x: 'center',
    	        text: '电商客户增长量',
    	        textStyle:{color:'white'}
    	    },
    	    tooltip : {
    	        trigger: 'axis'
    	    },
    	    grid: {
    	        borderWidth: 0,
    	        y: 80,
    	        y2: 60
    	    },
    	    xAxis : [
    	        {
    	            type : 'category',
    	            boundaryGap : false,
    	            show:true,
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
    	            show:true,
    	            axisLabel : {
    	            	textStyle:{
							color:"white", //刻度颜色
						},
    	                formatter: '{value} 人'
    	            }
    	        }
    	    ],
    	    series : [
    	        {
    	            name:'客户人数',
    	            type:'line',
    	            data:[GetRandomNum(5000,7000), GetRandomNum(7000,10000), GetRandomNum(10000,12000), GetRandomNum(12000,17000), GetRandomNum(17000,20000), GetRandomNum(20000,22000), GetRandomNum(22000,26000)],
    	            markPoint : {
    	                data : [
    	                    {type : 'max', name: '最大值'},
    	                   // {type : 'min', name: '最小值'}
    	                ]
    	            },
    	        }
    	    ]
    	};
    	                    
// 为echarts对象加载数据
    mychart.setOption(option,true);
}

function initOffline(ec,info){
		var mychart = ec.init(document.getElementById('offlineCust'));
    option = {
    	    title : {
    	    	x: 'center',
    	        text: '直销客户增长量',
    	        textStyle:{color:'white'}
    	    },
    	    tooltip : {
    	        trigger: 'axis'
    	    },
    	    grid: {
    	        borderWidth: 0,
    	        y: 80,
    	        y2: 60
    	    },
    	    xAxis : [
    	        {
    	            type : 'category',
    	            boundaryGap : false,
    	            show:true,
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
    	            show:true,
    	            axisLabel : {
    	            	textStyle:{
							color:"white", //刻度颜色
						},
    	                formatter: '{value} 人'
    	            }
    	        }
    	    ],
    	    series : [
    	        {
    	            name:'客户人数',
    	            type:'line',
    	            data:[GetRandomNum(100,300), GetRandomNum(300,800), GetRandomNum(800,1500), GetRandomNum(1500,4000), GetRandomNum(4000,7000), GetRandomNum(7000,9000), GetRandomNum(9000,10000)],
    	            markPoint : {
    	                data : [
    	                    {type : 'max', name: '最大值'},
    	                   // {type : 'min', name: '最小值'}
    	                ]
    	            },
    	        }
    	    ]
    	};
    	                    
// 为echarts对象加载数据
    mychart.setOption(option,true);
}