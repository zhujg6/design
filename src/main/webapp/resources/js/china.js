/**
 * Created by linyiming on 15/9/19.
 */
function drawMap(ec) {
    // 基于准备好的dom，初始化echarts图表
    var myChart = ec.init(document.getElementById('main'));
    //配置文件路径
    var ecConfig = require('echarts/config');
    option = {
    /*		color: ['gold','aqua','lime'],
    		padding: 15,*/
    	//	backgroundColor:'rgba(254,45,120,0.8)',
    		backgroundColor:'',
	/*	    title : {
		        text: '模拟迁徙',
		        subtext:'数据纯属虚构',
		        x:'center',
		        textStyle : {
		            color: '#fff'
		        }
		    },*/
		    tooltip : {
		        trigger: 'item',
		        backgroundColor:'rgba(254,45,120,0.8)',
		        formatter: '{b}'
		    },
		   /* tooltip : {
	            trigger: 'item',
	            padding: 15,
	            backgroundColor:'rgba(254,45,120,0.8)',
	            formatter: function(a){
					res = '<strong>'+a[1]+'</strong>'; 
					for (var i = 0; i < data_py.length; i++) { 
					   if(a[1] == data_py[i].name){ 
						 res +=  '<br /><div style="padding-top:10px;"><span style="float:right;text-align:right;">' +data_py[i].value + '</span> 物理机(台)： </div>'; 
					   } 
					   if(a[1] == data_route[i].name){ 
						 res +=  '<br /><div><span style="float:right; text-align:right;">' + data_route[i].value +'</span> 路由器（台）：</div>'; 
					   } 
					   if(a[1] == data_ebs[i].name){ 
						 res +=  '<br /><div><span style="float:right; text-align:right;">' + data_ebs[i].value +'</span> 存储（T） ： </div>'; 
					   } 
					   if(a[1] == data_ip[i].name){ 
						 res +=  '<br /><div><span style="float:right; text-align:right;">' + data_ip[i].value +'</span> 公网IP（个）： </div>'; 
					   } 
					}                      
					return res; 
				}
	        },*/
		    legend: {
		        orient: 'vertical',
		        x:'left',
		         data:['资源池'],
		        textStyle : {
		            color: '#fff'
		        }
		    },
		    series : [
		        {
		            name: '全国',
		            type: 'map',
		            roam: true,
		            hoverable: false,
		            mapType: 'china',
		            itemStyle:{
		                normal:{
		                	label:{show:true},
		                    borderColor:'rgba(100,149,237,1)',
		                    borderWidth:0.5,
		                    areaStyle:{
		                        color: '#195f99'
		                    }
		                }
		            },
		            data:[],
		            geoCoord: {
		                '上海': [121.4648,31.2891],
		                '东莞': [113.8953,22.901],
		                '东营': [118.7073,37.5513],
		                '中山': [113.4229,22.478],
		                '临汾': [111.4783,36.1615],
		                '临沂': [118.3118,35.2936],
		                '丹东': [124.541,40.4242],
		                '丽水': [119.5642,28.1854],
		                '乌鲁木齐': [87.9236,43.5883],
		                '佛山': [112.8955,23.1097],
		                '保定': [115.0488,39.0948],
		                '兰州': [103.5901,36.3043],
		                '包头': [110.3467,41.4899],
		                '北京': [116.4551,40.2539],
		                '北海': [109.314,21.6211],
		                '南京': [118.8062,31.9208],
		                '南宁': [108.479,23.1152],
		                '南昌': [116.0046,28.6633],
		                '南通': [121.1023,32.1625],
		                '厦门': [118.1689,24.6478],
		                '台州': [121.1353,28.6688],
		                '合肥': [117.29,32.0581],
		                '呼和浩特': [111.4124,40.4901],
		                '咸阳': [108.4131,34.8706],
		                '哈尔滨': [127.9688,45.368],
		                '唐山': [118.4766,39.6826],
		                '嘉兴': [120.9155,30.6354],
		                '大同': [113.7854,39.8035],
		                '大连': [122.2229,39.4409],
		                '天津': [117.4219,39.4189],
		                '太原': [112.3352,37.9413],
		                '威海': [121.9482,37.1393],
		                '宁波': [121.5967,29.6466],
		                '宝鸡': [107.1826,34.3433],
		                '宿迁': [118.5535,33.7775],
		                '常州': [119.4543,31.5582],
		                '广州': [113.5107,23.2196],
		                '廊坊': [116.521,39.0509],
		                '延安': [109.1052,36.4252],
		                '张家口': [115.1477,40.8527],
		                '徐州': [117.5208,34.3268],
		                '德州': [116.6858,37.2107],
		                '惠州': [114.6204,23.1647],
		                '成都': [103.9526,30.7617],
		                '扬州': [119.4653,32.8162],
		                '承德': [117.5757,41.4075],
		                '拉萨': [91.1865,30.1465],
		                '无锡': [120.3442,31.5527],
		                '日照': [119.2786,35.5023],
		                '昆明': [102.9199,25.4663],
		                '杭州': [119.5313,29.8773],
		                '枣庄': [117.323,34.8926],
		                '柳州': [109.3799,24.9774],
		                '株洲': [113.5327,27.0319],
		                '武汉': [114.3896,30.6628],
		                '汕头': [117.1692,23.3405],
		                '江门': [112.6318,22.1484],
		                '沈阳': [123.1238,42.1216],
		                '沧州': [116.8286,38.2104],
		                '河源': [114.917,23.9722],
		                '泉州': [118.3228,25.1147],
		                '泰安': [117.0264,36.0516],
		                '泰州': [120.0586,32.5525],
		                '济南': [117.1582,36.8701],
		                '济宁': [116.8286,35.3375],
		                '海口': [110.3893,19.8516],
		                '淄博': [118.0371,36.6064],
		                '淮安': [118.927,33.4039],
		                '深圳': [114.5435,22.5439],
		                '清远': [112.9175,24.3292],
		                '温州': [120.498,27.8119],
		                '渭南': [109.7864,35.0299],
		                '湖州': [119.8608,30.7782],
		                '湘潭': [112.5439,27.7075],
		                '滨州': [117.8174,37.4963],
		                '潍坊': [119.0918,36.524],
		                '烟台': [120.7397,37.5128],
		                '玉溪': [101.9312,23.8898],
		                '珠海': [113.7305,22.1155],
		                '盐城': [120.2234,33.5577],
		                '盘锦': [121.9482,41.0449],
		                '石家庄': [114.4995,38.1006],
		                '福州': [119.4543,25.9222],
		                '秦皇岛': [119.2126,40.0232],
		                '绍兴': [120.564,29.7565],
		                '聊城': [115.9167,36.4032],
		                '肇庆': [112.1265,23.5822],
		                '舟山': [122.2559,30.2234],
		                '苏州': [120.6519,31.3989],
		                '莱芜': [117.6526,36.2714],
		                '菏泽': [115.6201,35.2057],
		                '营口': [122.4316,40.4297],
		                '葫芦岛': [120.1575,40.578],
		                '衡水': [115.8838,37.7161],
		                '衢州': [118.6853,28.8666],
		                '西宁': [101.4038,36.8207],
		                '西安': [109.1162,34.2004],
		                '贵阳': [106.6992,26.7682],
		                '连云港': [119.1248,34.552],
		                '邢台': [114.8071,37.2821],
		                '邯郸': [114.4775,36.535],
		                '郑州': [113.4668,34.6234],
		                '鄂尔多斯': [108.9734,39.2487],
		                '重庆': [107.7539,30.1904],
		                '金华': [120.0037,29.1028],
		                '铜川': [109.0393,35.1947],
		                '银川': [106.3586,38.1775],
		                '镇江': [119.4763,31.9702],
		                '长春': [125.8154,44.2584],
		                '长沙': [113.0823,28.2568],
		                '长治': [112.8625,36.4746],
		                '阳泉': [113.4778,38.0951],
		                '青岛': [120.4651,36.3373],
		                '韶关': [113.7964,24.7028]
		            }
		        },
		        {
		            name: '资源池',
		            type: 'map',
		            mapType: 'china',
		            itemStyle:{
	                    normal:{
	                        label:{show:true},
	                        borderColor:'rgba(100,149,237,1)',
	                        borderWidth:0.5,
	                        areaStyle:{
	                        	color: '#195f99'
	                        }
	                    },
	                    emphasis: {
	                        label:{position:'top'}
	                    }
	                },
		            data:[],
		         /*  data : [
		                    {name:'内蒙古',value:90},
		                    {name:'河北',value:90},
		                    {name:'重庆',value:90},
		                    {name:'上海',value:90}
		                ],*/
		            markPoint : {
		                symbol:'emptyCircle',
		                symbolSize : function (v){
		                    return 10 + v/10
		                },
		                effect : {
		                    show: true,
		                    shadowBlur : 0
		                },
		                itemStyle:{
		                    normal:{
		                        label:{show:true}
		                    },
		                    emphasis: {
		                        label:{position:'top'}
		                    }
		                },
		                data : [
		                    {name:'呼和浩特'},
		                    {name:'廊坊'},
		                    {name:'北京'},
		                    {name:'成都'},
		                    {name:'武汉'},
		                    {name:'重庆'},
		                    {name:'哈尔滨'},
		                    {name:'郑州'},
		                    {name:'南京'},
		                    {name:'西安'},
		                    {name:'沈阳'},
		                    {name:'贵阳'},
		                    {name:'福州'},
		                    {name:'佛山'},
		                    {name:'南昌'},
		                    {name:'西宁'},
		                    {name:'天津'},
		                    {name:'济南'},
		                    {name:'石家庄'},
		                    {name:'上海'}
		                ]
		            },
		        },
		        
		    ]
		};
    function focus(param){
		option.series[0].name = param.name;
		//myChart.setOption(option, true);
		getGeoCoord(ec,param.name);
		//option.legend.slected = {};		

	};
	myChart.on(ecConfig.EVENT.CLICK, focus);

	// 为echarts对象加载数据
	myChart.setOption(option);
}
 
function getGeoCoord (ec,name) {
    $(infoList).each(function(i,info){		
		if(name == info.name){
			DrawColumnEChart(ec,info);
			DrawCustomer(ec,info);
			return false;
		}
	})
}
/*function selectedGeoCoord (ec,name) {
	$(infoList).each(function(i,info){
		if(name == info.name){
			DrawColumnEChart(ec,info);			
			return false;
		}
	})
}*/
var infoList = [
{'name':'呼和浩特','cpu':Math.round(236543/6),'tcpu':Math.round(246543/6),'mem':Math.round(2365430/6),'tmem':Math.round(2465430/6),'ebs':Math.round(246543/6),'tebs':Math.round(286543/6),'ip':9100,'tip':21000,'obs':Math.round(430/6),'tobs':Math.round(5430/6),'nas':Math.round(430/6),'tnas':Math.round(5430/6),'a':GetRandomNum(5000,8000),'b':GetRandomNum(8000,12000),'c':GetRandomNum(12000,16000),'d':GetRandomNum(16000,20000),'e':GetRandomNum(20000,25000),'f':GetRandomNum(25000,30000),'g':GetRandomNum(30000,40000)},
{'name':'廊坊','cpu':Math.round(246543/6),'tcpu':Math.round(2203257/6),'mem':Math.round(212875/6),'tmem':Math.round(246543/6),'ebs':Math.round(216543/6),'tebs':Math.round(286543/6),'ip':Math.round(54300/6),'tip':Math.round(154300/6),'obs':Math.round(430/6),'tobs':Math.round(8430/6),'nas':Math.round(3430/6),'tnas':Math.round(5430/6),'a':GetRandomNum(5000,8000),'b':GetRandomNum(8000,12000),'c':GetRandomNum(12000,16000),'d':GetRandomNum(16000,20000),'e':GetRandomNum(20000,25000),'f':GetRandomNum(25000,30000),'g':GetRandomNum(30000,40000)},
{'name':'上海','cpu':Math.round(1158732/6),'tcpu':Math.round(1403257/6),'mem':Math.round(1158372/6),'tmem':Math.round(2279520/6),'ebs':Math.round(1158372/3),'tebs':Math.round(1158372/2),'ip':65732,'tip':132960,'obs':88,'tobs':5000,'nas':330,'tnas':1092,'a':GetRandomNum(5000,8000),'b':GetRandomNum(8000,12000),'c':GetRandomNum(12000,16000),'d':GetRandomNum(16000,20000),'e':GetRandomNum(20000,25000),'f':GetRandomNum(25000,30000),'g':GetRandomNum(30000,40000)},
{'name':'北京','cpu':Math.round(228732/6),'tcpu':Math.round(1403257/6),'mem':Math.round(2158372/6),'tmem':Math.round(3279520/6),'ebs':Math.round(3279520/8),'tebs':Math.round(3279520/6),'ip':50732,'tip':332962,'obs':88,'tobs':5000,'nas':330,'tnas':8092,'a':GetRandomNum(5000,8000),'b':GetRandomNum(8000,12000),'c':GetRandomNum(12000,16000),'d':GetRandomNum(16000,20000),'e':GetRandomNum(20000,25000),'f':GetRandomNum(25000,30000),'g':GetRandomNum(30000,40000)},
{'name':'成都','cpu':Math.round(1403257/9),'tcpu':Math.round(1403257/6),'mem':Math.round(2158372/6),'tmem':Math.round(4279520/6),'ebs':Math.round(2158372/6),'tebs':Math.round(2998372/6),'ip':5732,'tip':13292,'obs':88,'tobs':5000,'nas':433,'tnas':10920,'a':GetRandomNum(5000,8000),'b':GetRandomNum(8000,12000),'c':GetRandomNum(12000,16000),'d':GetRandomNum(16000,20000),'e':GetRandomNum(20000,25000),'f':GetRandomNum(25000,30000),'g':GetRandomNum(30000,40000)},
{'name':'武汉','cpu':Math.round(3403257/9),'tcpu':Math.round(3403257/6),'mem':Math.round(1158372/6),'tmem':Math.round(2279520/6),'ebs':Math.round(8403257/6),'tebs':Math.round(9403257/6),'ip':Math.round(5430/6),'tip':Math.round(8430/6),'obs':Math.round(430/6),'tobs':Math.round(8430/6),'nas':Math.round(843/6),'tnas':Math.round(5430/6),'a':GetRandomNum(5000,8000),'b':GetRandomNum(8000,12000),'c':GetRandomNum(12000,16000),'d':GetRandomNum(16000,20000),'e':GetRandomNum(20000,25000),'f':GetRandomNum(25000,30000),'g':GetRandomNum(30000,40000)},
{'name':'哈尔滨','cpu':Math.round(148732/6),'tcpu':Math.round(4003257/6),'mem':Math.round(1158372/6),'tmem':Math.round(4279520/6),'ebs':Math.round(1118430/7),'tebs':Math.round(1118430/6),'ip':Math.round(8430/8),'tip':Math.round(8430/3),'obs':Math.round(843/9),'tobs':Math.round(4843/2),'nas':Math.round(1843/6),'tnas':Math.round(9843/2),'a':GetRandomNum(5000,8000),'b':GetRandomNum(8000,12000),'c':GetRandomNum(12000,16000),'d':GetRandomNum(16000,20000),'e':GetRandomNum(20000,25000),'f':GetRandomNum(25000,30000),'g':GetRandomNum(30000,40000)},
{'name':'郑州','cpu':Math.round(1258732/6),'tcpu':Math.round(1403257/6),'mem':Math.round(2158372/6),'tmem':Math.round(4279520/6),'ebs':Math.round(843000/8),'tebs':Math.round(843000/6),'ip':Math.round(8430/7),'tip':Math.round(8430/5),'obs':Math.round(843/8),'tobs':Math.round(4843/2),'nas':Math.round(1843/8),'tnas':Math.round(7843/2),'a':GetRandomNum(5000,8000),'b':GetRandomNum(8000,12000),'c':GetRandomNum(12000,16000),'d':GetRandomNum(16000,20000),'e':GetRandomNum(20000,25000),'f':GetRandomNum(25000,30000),'g':GetRandomNum(30000,40000)},
{'name':'南京','cpu':Math.round(958732/6),'tcpu':Math.round(1403257/6),'mem':Math.round(3358372/6),'tmem':Math.round(4279520/6),'ebs':Math.round(843000/6),'tebs':Math.round(843000/3),'ip':Math.round(8430/6),'tip':Math.round(8430/4),'obs':Math.round(843/6),'tobs':Math.round(5843/1),'nas':Math.round(5843/7),'tnas':Math.round(9843/2),'a':GetRandomNum(5000,8000),'b':GetRandomNum(8000,12000),'c':GetRandomNum(12000,16000),'d':GetRandomNum(16000,20000),'e':GetRandomNum(20000,25000),'f':GetRandomNum(25000,30000),'g':GetRandomNum(30000,40000)},
{'name':'西安','cpu':Math.round(258732/6),'tcpu':Math.round(1403257/6),'mem':Math.round(5258372/6),'tmem':Math.round(14279520/6),'ebs':Math.round(1111843/6),'tebs':Math.round(1111843/3),'ip':Math.round(4843/5),'tip':Math.round(6843/3),'obs':Math.round(843/6),'tobs':Math.round(3843/1),'nas':Math.round(2843/6),'tnas':Math.round(5843/2),'a':GetRandomNum(5000,8000),'b':GetRandomNum(8000,12000),'c':GetRandomNum(12000,16000),'d':GetRandomNum(16000,20000),'e':GetRandomNum(20000,25000),'f':GetRandomNum(25000,30000),'g':GetRandomNum(30000,40000)},
{'name':'沈阳','cpu':Math.round(358732/6),'tcpu':Math.round(1403257/6),'mem':Math.round(1358372/6),'tmem':Math.round(4279520/6),'ebs':Math.round(2222843/6),'tebs':Math.round(2222843/3),'ip':Math.round(1843/6),'tip':Math.round(3843/4),'obs':Math.round(843/6),'tobs':Math.round(4843/1),'nas':Math.round(1843/6),'tnas':Math.round(3843/2),'a':GetRandomNum(5000,8000),'b':GetRandomNum(8000,12000),'c':GetRandomNum(12000,16000),'d':GetRandomNum(16000,20000),'e':GetRandomNum(20000,25000),'f':GetRandomNum(25000,30000),'g':GetRandomNum(30000,40000)},
{'name':'贵阳','cpu':Math.round(458732/6),'tcpu':Math.round(2403257/6),'mem':Math.round(3583720/6),'tmem':Math.round(4279520/6),'ebs':373999,'tebs':1210999,'ip':5732,'tip':132962,'obs':188,'tobs':2500,'nas':333,'tnas':3092,'a':GetRandomNum(5000,8000),'b':GetRandomNum(8000,12000),'c':GetRandomNum(12000,16000),'d':GetRandomNum(16000,20000),'e':GetRandomNum(20000,25000),'f':GetRandomNum(25000,30000),'g':GetRandomNum(30000,40000)},
{'name':'福州','cpu':Math.round(158732/6),'tcpu':Math.round(1403257/6),'mem':Math.round(158372/6),'tmem':Math.round(4279520/6),'ebs':Math.round(2228430/9),'tebs':Math.round(2228430/6),'ip':Math.round(2243/8),'tip':Math.round(2243/6),'obs':Math.round(222/6),'tobs':Math.round(2843/6),'nas':Math.round(2284/8),'tnas':Math.round(2284/3),'a':GetRandomNum(5000,8000),'b':GetRandomNum(8000,12000),'c':GetRandomNum(12000,16000),'d':GetRandomNum(16000,20000),'e':GetRandomNum(20000,25000),'f':GetRandomNum(25000,30000),'g':GetRandomNum(30000,40000)},
{'name':'佛山','cpu':Math.round(258732/6),'tcpu':Math.round(440357/6),'mem':Math.round(4258372/6),'tmem':Math.round(4279520/6),'ebs':Math.round(2228430/9),'tebs':Math.round(2228430/7),'ip':15732,'tip':832962,'obs':Math.round(2284/8),'tobs':Math.round(2284/1),'nas':Math.round(2284/8),'tnas':Math.round(2284/2),'a':GetRandomNum(5000,8000),'b':GetRandomNum(8000,12000),'c':GetRandomNum(12000,16000),'d':GetRandomNum(16000,20000),'e':GetRandomNum(20000,25000),'f':GetRandomNum(25000,30000),'g':GetRandomNum(30000,40000)},
{'name':'南昌','cpu':Math.round(258732/6),'tcpu':Math.round(440357/6),'mem':Math.round(4258372/6),'tmem':Math.round(4279520/6),'ebs':Math.round(2228430/9),'tebs':Math.round(2228430/7),'ip':5732,'tip':132962,'obs':Math.round(2284/8),'tobs':Math.round(2284/1),'nas':Math.round(2284/8),'tnas':Math.round(2284/2),'a':GetRandomNum(5000,8000),'b':GetRandomNum(8000,12000),'c':GetRandomNum(12000,16000),'d':GetRandomNum(16000,20000),'e':GetRandomNum(20000,25000),'f':GetRandomNum(25000,30000),'g':GetRandomNum(30000,40000)},
{'name':'西宁','cpu':Math.round(258732/6),'tcpu':Math.round(440357/6),'mem':Math.round(4279520/9),'tmem':Math.round(4279520/6),'ebs':Math.round(2228430/9),'tebs':Math.round(2228430/7),'ip':5732,'tip':13296,'obs':Math.round(2284/8),'tobs':Math.round(2284/1),'nas':Math.round(2284/8),'tnas':Math.round(2284/2),'a':GetRandomNum(5000,8000),'b':GetRandomNum(8000,12000),'c':GetRandomNum(12000,16000),'d':GetRandomNum(16000,20000),'e':GetRandomNum(20000,25000),'f':GetRandomNum(25000,30000),'g':GetRandomNum(30000,40000)},
{'name':'天津','cpu':Math.round(258732/6),'tcpu':Math.round(440357/6),'mem':Math.round(4279520/8),'tmem':Math.round(4279520/6),'ebs':Math.round(2228430/9),'tebs':Math.round(2228430/7),'ip':5732,'tip':12962,'obs':Math.round(2284/8),'tobs':Math.round(2284/1),'nas':Math.round(2284/8),'tnas':Math.round(2284/2),'a':GetRandomNum(5000,8000),'b':GetRandomNum(8000,12000),'c':GetRandomNum(12000,16000),'d':GetRandomNum(16000,20000),'e':GetRandomNum(20000,25000),'f':GetRandomNum(25000,30000),'g':GetRandomNum(30000,40000)},
{'name':'济南','cpu':Math.round(258732/6),'tcpu':Math.round(440357/6),'mem':Math.round(4279520/8),'tmem':Math.round(4279520/6),'ebs':Math.round(2228430/9),'tebs':Math.round(2228430/7),'ip':5732,'tip':12962,'obs':Math.round(2284/8),'tobs':Math.round(2284/1),'nas':Math.round(2284/8),'tnas':Math.round(2284/2),'a':GetRandomNum(5000,8000),'b':GetRandomNum(8000,12000),'c':GetRandomNum(12000,16000),'d':GetRandomNum(16000,20000),'e':GetRandomNum(20000,25000),'f':GetRandomNum(25000,30000),'g':GetRandomNum(30000,40000)},
{'name':'石家庄','cpu':Math.round(258732/6),'tcpu':Math.round(440357/6),'mem':Math.round(4279520/8),'tmem':Math.round(4279520/6),'ebs':Math.round(2228430/9),'tebs':Math.round(2228430/7),'ip':5732,'tip':12962,'obs':Math.round(2284/8),'tobs':Math.round(2284/1),'nas':Math.round(2284/8),'tnas':Math.round(2284/2),'a':GetRandomNum(5000,8000),'b':GetRandomNum(8000,12000),'c':GetRandomNum(12000,16000),'d':GetRandomNum(16000,20000),'e':GetRandomNum(20000,25000),'f':GetRandomNum(25000,30000),'g':GetRandomNum(30000,40000)},
{'name':'重庆','cpu':980000,'tcpu':1000000,'mem':9600000,'tmem':10000000,'ebs':9200000,'tebs':10000000,'ip':9300,'tip':100000,'obs':20,'tobs':10000,'nas':880,'tnas':20000,'2009':11,'2010':42,'2011':78,'2012':130,'2013':223,'2014':260,'2015':300,'a':GetRandomNum(5000,8000),'b':GetRandomNum(8000,12000),'c':GetRandomNum(12000,16000),'d':GetRandomNum(16000,20000),'e':GetRandomNum(20000,25000),'f':GetRandomNum(25000,30000),'g':GetRandomNum(30000,40000)}
//{'name':'重庆','cpu':Math.round(48232/6),'tcpu':Math.round(403257/6),'mem':Math.round(18372/6),'tmem':Math.round(42720/6),'ebs':234,'tebs':45324,'ip':6743,'tip':23415,'obs':76,'tobs':674,'nas':54,'tnas':2345,'a':8000,'b':17000,'c':22000,'d':23000,'e':25000,'f':29000,'g':34000}
];
function MathRand(n)
{
	var Num="";
	for(var i=0;i<n;i++)
	{
			Num+=Math.floor(Math.random()*10);
	}	
	return Num;
}
function GetRandomNum(Min,Max)
{   
	var Range = Max - Min;   
	var Rand = Math.random();   
	return(Min + Math.round(Rand * Range));   
}   
/*var infoList = [
{'name':'内蒙古','cpu':Math.round(56743/6),'mem':Math.round(128475/6),'ebs':373,'ip':5732,'obs':88,'nas':33,a1:11,a2:42,b1:11,b2:44,c1:223,c2:8,d1:22,d2:33},
{'name':'河北','cpu':Math.round(45982/6),'mem':Math.round(129486/6),'ebs':482,'ip':4728,'obs':388,'nas':233,a1:41,a2:25,b1:11,b2:54,c1:203,c2:12,d1:23,d2:63},
{name: '北京','cpu':Math.round(49572/6),'mem':Math.round(128494/6),'ebs':238,'ip':5892,'obs':88,'nas':33,a1:11,a2:55,b1:11,b2:34,c1:223,c2:22,d1:22,d2:33},
{name: '天津','cpu':Math.round(38275/6),'mem':Math.round(145738/6),'ebs':547,'ip':7847,'obs':88,'nas':33,a1:11,a2:55,b1:11,b2:34,c1:223,c2:22,d1:22,d2:33},
{name: '上海','cpu':Math.round(58732/6),'mem':Math.round(158372/6),'ebs':238,'ip':4293,'obs':88,'nas':33,a1:11,a2:55,b1:11,b2:34,c1:223,c2:22,d1:22,d2:33},
{name: '重庆','cpu':Math.round(76428/6),'mem':Math.round(173849/6),'ebs':342,'ip':4872,'obs':88,'nas':33,a1:11,a2:55,b1:11,b2:34,c1:223,c2:22,d1:22,d2:33},
{name: '河南','cpu':Math.round(54382/6),'mem':Math.round(124983/6),'ebs':387,'ip':5673,'obs':88,'nas':33,a1:11,a2:55,b1:11,b2:34,c1:223,c2:22,d1:22,d2:33},
{name: '辽宁','cpu':Math.round(48724/6),'mem':Math.round(128794/6),'ebs':274,'ip':5823,'obs':88,'nas':33,a1:11,a2:55,b1:11,b2:34,c1:223,c2:22,d1:22,d2:33},
{name: '黑龙江','cpu':Math.round(59832/6),'mem':Math.round(149823/6),'ebs':318,'ip':3845,'obs':88,'nas':33,a1:11,a2:55,b1:11,b2:34,c1:223,c2:22,d1:22,d2:33},
{name: '湖南','cpu':Math.round(38472/6),'mem':Math.round(109274/6),'ebs':638,'ip':7482,'obs':88,'nas':33,a1:11,a2:55,b1:11,b2:34,c1:223,c2:22,d1:22,d2:33},
{name: '山东','cpu':Math.round(87465/6),'mem':Math.round(203982/6),'ebs':487,'ip':4827,'obs':88,'nas':33,a1:11,a2:55,b1:11,b2:34,c1:223,c2:22,d1:22,d2:33},
{name: '江苏','cpu':Math.round(67492/6),'mem':Math.round(187462/6),'ebs':482,'ip':4785,'obs':88,'nas':33,a1:11,a2:55,b1:11,b2:34,c1:223,c2:22,d1:22,d2:33},
{name: '浙江','cpu':Math.round(48275/6),'mem':Math.round(123287/6),'ebs':784,'ip':5723,'obs':88,'nas':33,a1:11,a2:55,b1:11,b2:34,c1:223,c2:22,d1:22,d2:33},
{name: '江西','cpu':Math.round(48576/6),'mem':Math.round(128729/6),'ebs':637,'ip':4829,'obs':88,'nas':33,a1:11,a2:55,b1:11,b2:34,c1:223,c2:22,d1:22,d2:33},
{name: '湖北','cpu':Math.round(34956/6),'mem':Math.round(98734/6),'ebs':673,'ip':3825,'obs':88,'nas':33,a1:11,a2:55,b1:11,b2:34,c1:223,c2:22,d1:22,d2:33},
{name: '山西','cpu':Math.round(74628/6),'mem':Math.round(158372/6),'ebs':438,'ip':7632,'obs':88,'nas':33,a1:11,a2:55,b1:11,b2:34,c1:223,c2:22,d1:22,d2:33},
{name: '陕西','cpu':Math.round(67932/6),'mem':Math.round(188942/6),'ebs':385,'ip':3626,'obs':88,'nas':33,a1:11,a2:55,b1:11,b2:34,c1:223,c2:22,d1:22,d2:33},
{name: '吉林','cpu':Math.round(61845/6),'mem':Math.round(146852/6),'ebs':582,'ip':2846,'obs':88,'nas':33,a1:11,a2:55,b1:11,b2:34,c1:223,c2:22,d1:22,d2:33},
{name: '福建','cpu':Math.round(87593/6),'mem':Math.round(120909/6),'ebs':536,'ip':4777,'obs':47,'nas':33,a1:11,a2:55,b1:11,b2:34,c1:223,c2:22,d1:22,d2:33},
{name: '贵州','cpu':Math.round(83925/6),'mem':Math.round(109122/6),'ebs':472,'ip':3564,'obs':88,'nas':33,a1:11,a2:55,b1:11,b2:34,c1:223,c2:22,d1:22,d2:33},
{name: '广东','cpu':Math.round(37266/6),'mem':Math.round(182311/6),'ebs':474,'ip':5837,'obs':88,'nas':33,a1:11,a2:55,b1:11,b2:34,c1:223,c2:22,d1:22,d2:33},
{name: '青海','cpu':Math.round(28472/6),'mem':Math.round(8900/6),'ebs':527,'ip':4758,'obs':88,'nas':33,a1:11,a2:55,b1:11,b2:34,c1:223,c2:22,d1:22,d2:33},
{name: '四川','cpu':Math.round(23845/6),'mem':Math.round(122315/6),'ebs':748,'ip':4873,'obs':88,'nas':33,a1:11,a2:55,b1:11,b2:34,c1:223,c2:22,d1:22,d2:33},
{name: '廊坊','cpu':Math.round(23845/6),'mem':Math.round(122315/6),'ebs':748,'ip':4873,'obs':88,'nas':33,a1:11,a2:55,b1:11,b2:34,c1:223,c2:22,d1:22,d2:33},
{name: '呼和浩特','cpu':Math.round(23845/6),'mem':Math.round(122315/6),'ebs':748,'ip':4873,'obs':88,'nas':33,a1:11,a2:55,b1:11,b2:34,c1:223,c2:22,d1:22,d2:33},
{name: '总量','cpu':Math.round(1403257/6),'mem':Math.round(4279520/6),'ebs':12810,'ip':132962,'obs':2471,'nas':1092,a1:111,a2:155,b1:111,b2:134,c1:223,c2:22,d1:22,d2:33}
];*/