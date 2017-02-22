/**
 * Created by linyiming on 15/9/19.
 */
//创建ECharts柱状图图表
function DrawCustomer(ec,info) { // 基于准备好的dom，初始化echarts图表
    var mychart = ec.init(document.getElementById('customer'));
//JSON字符串
    mychart.setTheme('macarons');
    var placeHoledStyle = {
        normal:{
            barBorderColor:'rgba(0,0,0,0)',
            color:'rgba(0,0,0,0)'
        },
        emphasis:{
            barBorderColor:'rgba(0,0,0,0)',
            color:'rgba(0,0,0,0)'
        }
    };
    var dataStyle = {
        normal: {
            label : {
                show: true,
                position: 'insideLeft',
                formatter: '{c}'
            }
        }
    };
    var textStyle= {
        color:"white"
    }

    var option = {
        title : {
            text: '客户信息',
            textStyle:{color:'white'}
        },grid: {
            y:'30%',
            y2:'10%',
			borderWidth:0
        },
        tooltip : {
            trigger: 'axis'
        },
        legend: {
            textStyle:{color:'white'},
            data:['今日新增','总量']
        },
        toolbox: {
            show : false,
            feature : {
                mark : {show: true},
                dataView : {show: true, readOnly: false},
                magicType : {show: true, type: ['line', 'bar']},
                restore : {show: true},
                saveAsImage : {show: true}
            }
        },
        calculable : true,
        xAxis : [
            {
                show:true,
				type : 'category',
                data : ['电商客户','直销客户','渠道客户','试用客户'],
				axisLabel: {
					show: true,
					textStyle:{
						color:"white", //刻度颜色
						//fontSize:16  //刻度大小
					}
				},

            }
        ],
        yAxis : [
            {
                show:false,
                type : 'value',
				axisLabel: {
					show: false,
					textStyle:{
						color:"white", //刻度颜色
						//fontSize:16  //刻度大小
					}
				},
            }
        ],
        series : [
            {
                name:'今日新增',
                type:'bar',
                data:(function (){
					var res = [];
					var len = 4;
					//if(info){
					//	res.push(info.a1,info.b1,info.c1,info.d1);
					//}
                    res.push( 350, 143,57,47);
					return res;
				 })(),
                markPoint : {
                    show:false,
                    data : [
                        {type : 'max', name: '最大值'},
                        {type : 'min', name: '最小值'}
                    ]
                },
                markLine : {
                    show:false,
                    data : [

                    ]
                }
            },
            {
                name:'总量',
                type:'bar',
                data:(function (){
					var res = [];
					var len = 4;
					//if(info){
					//	res.push(info.a2,info.b2,info.c2,info.d2);
					//}
                    res.push(25332,9600,800,8280);
					return res;
				})(),
                markPoint : {
                    data : [

                    ]
                },
                markLine : {
                    show:false,
                    data : [

                    ]
                }
            }
        ]
    };
// 为echarts对象加载数据
    mychart.setOption(option,true);

}
