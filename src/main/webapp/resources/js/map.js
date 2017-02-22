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
		            roam: false,
		            hoverable: false,
		            mapType: 'china',
		            itemStyle:{
		                normal:{
		                	label:{show:true},
		                    borderColor:'white',
		                    borderWidth:1,
		                    areaStyle:{
		                        color: '#000000'
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
						'廊坊2': [117.521,40.0509],
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
		                '韶关': [113.7964,24.7028],
						'香港': [113.9200,22.2400],
						'中卫': [105.19902,37.492774],
						'高平': [112.929561,35.803705],
						'鸡西': [130.97688,45.301515]
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
							{name:'廊坊2'},
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
		                    {name:'上海'},
		                    {name:'杭州'},
							{name:'香港'},
							{name:'太原'},
							{name:'长春'},
							{name:'南宁'},
							{name:'中卫'},
							{name:'海口'},
							{name:'长沙'},
							{name:'枣庄'},
							{name:'高平'},
							{name:'大连'},
							{name:'鸡西'}
		                ]
		            }
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
function initResourceValue(info){
	var resource = $("#mainRes .resource");
	$(resource).each(function(i,item){
		$.each(info,function(index,value){
			if(index == item.attr("name")){
				item.empty().html(value);
			}
		})
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
	{'name':'呼和浩特','cpu':2444,'tcpu':1856,'mem':5412,'tmem':5568,'storage':152,'tstorage':110,'ip':690,'tip':1009,'online':84,'offline':208,'test':79,'channel':0},
	{'name':'廊坊','cpu':1921,'tcpu':2304,'mem':5045,'tmem':9216,'storage':169,'tstorage':540,'ip':210,'tip':525,'online':0,'offline':9,'test':40,'channel':1},
	{'name':'廊坊2','cpu':6156,'tcpu':11616,'mem':2907,'tmem':13312,'storage':0,'tstorage':0,'ip':3,'tip':255,'online':0,'offline':9,'test':40,'channel':1},
	{'name':'上海','cpu':388,'tcpu':1024,'mem':'843','tmem':4096,'storage':43,'tstorage':180,'ip':118,'tip':913},
	{'name':'北京','cpu':9057,'tcpu':3648,'mem':20696,'tmem':11648,'storage':588,'tstorage':610,'ip':175,'tip':759,'online':0,'offline':11,'test':35,'channel':0},
	{'name':'成都','cpu':606,'tcpu':576,'mem':1812,'tmem':1728,'storage':60,'tstorage':134,'ip':83,'tip':759,'online':0,'offline':2,'test':15,'channel':0},
	{'name':'武汉','cpu':732,'tcpu':640,'mem':1934,'tmem':1920,'storage':108,'tstorage':134,'ip':91,'tip':502,'online':0,'offline':5,'test':26,'channel':0},
	{'name':'哈尔滨','cpu':1886,'tcpu':2048,'mem':4327,'tmem':7168,'storage':141,'tstorage':192,'ip':204,'tip':500,'online':0,'offline':10,'test':63,'channel':0},
	{'name':'郑州','cpu':1049,'tcpu':1024,'mem':2216,'tmem':3584,'storage':137,'tstorage':145,'ip':142,'tip':506,'online':0,'offline':0,'test':19,'channel':0},
	{'name':'南京','cpu':1094,'tcpu':704,'mem':2736,'tmem':2112,'storage':89,'tstorage':108,'ip':147,'tip':753,'online':0,'offline':11,'test':35,'channel':0},
	{'name':'西安','cpu':820,'tcpu':960,'mem':2451,'tmem':3840,'storage':95,'tstorage':180,'ip':108,'tip':468,'online':0,'offline':1,'test':31,'channel':0},
	{'name':'沈阳','cpu':2492,'tcpu':3024,'mem':7684,'tmem':10496,'storage':357,'tstorage':726,'ip':442,'tip':215,'online':0,'offline':0,'test':19,'channel':0},
	{'name':'贵阳','cpu':517,'tcpu':1024,'mem':1246,'tmem':4096,'storage':29,'tstorage':180,'ip':51,'tip':125},
	{'name':'福州','cpu':425,'tcpu':1024,'mem':1153,'tmem':4096,'storage':75,'tstorage':180,'ip':181,'tip':61},
	{'name':'佛山','cpu':1490,'tcpu':1024,'mem':3718,'tmem':4096,'storage':129,'tstorage':180,'ip':126,'tip':945},
	{'name':'南昌','cpu':387,'tcpu':912,'mem':689,'tmem':3328,'storage':32,'tstorage':131,'ip':69,'tip':215},
	{'name':'西宁','cpu':525,'tcpu':484,'mem':1162,'tmem':1792,'storage':22,'tstorage':108,'ip':77,'tip':215},
	{'name':'天津','cpu':559,'tcpu':912,'mem':1836,'tmem':3328,'storage':70,'tstorage':131,'ip':78,'tip':759},
	{'name':'济南','cpu':603,'tcpu':512,'mem':1535,'tmem':2048,'storage':78,'tstorage':108,'ip':164,'tip':759},
	{'name':'石家庄','cpu':1128,'tcpu':1024,'mem':3026,'tmem':3072,'storage':122,'tstorage':134,'ip':160,'tip':880,'online':0,'offline':1,'test':28,'channel':0},
	{'name':'重庆','cpu':656,'tcpu':832,'mem':1634,'tmem':2496,'storage':47,'tstorage':133,'ip':125,'tip':253,'online':0,'offline':5,'test':43,'channel':0},
	{'name':'杭州','cpu':1905,'tcpu':1536,'mem':4815,'tmem':7168,'storage':246,'tstorage':336,'ip':232,'tip':731,'online':0,"offline":18,"test":71,"channel":0},
	{'name':'太原','cpu':960,'tcpu':896,'mem':2053,'tmem':2688,'storage':59,'tstorage':134,'ip':166,'tip':188,'online':0,"offline":6,"test":59,"channel":0},
	{'name':'长春','cpu':741,'tcpu':1024,'mem':2531,'tmem':4096,'storage':123,'tstorage':180,'ip':106,'tip':721,'online':0,"offline":1,"test":1,"channel":0},
	{'name':'南宁','cpu':821,'tcpu':1280,'mem':1896,'tmem':4096,'storage':41,'tstorage':94,'ip':12,'tip':253},
	{'name':'中卫','cpu':150,'tcpu':640,'mem':279,'tmem':2048,'storage':9,'tstorage':95.23,'ip':12,'tip':254},
	{'name':'海口','cpu':323,'tcpu':1040,'mem':685,'tmem':3328,'storage':14,'tstorage':59,'ip':13,'tip':125},
	{'name':'西咸','cpu':648,'tcpu':9120,'mem':95,'tmem':19456,'storage':3,'tstorage':347,'ip':8,'tip':0},
	{'name':'呼和浩特超融合','cpu':0,'tcpu':15120,'mem':0,'tmem':48384,'storage':0,'tstorage':863,'ip':2,'tip':253},
	{'name':'长沙','cpu':0,'tcpu':960,'mem':0,'tmem':3072,'storage':0,'tstorage':54.8,'ip':7,'tip':378},
	{'name':'北京2','cpu':0,'tcpu':2960,'mem':0,'tmem':9472,'storage':0,'tstorage':1698,'ip':6,'tip':92},
	{'name':'鸡西','cpu':162,'tcpu':96,'mem':434,'tmem':768,'storage':38,'tstorage':58,'ip':3,'tip':18},
	{'name':'内蒙古环保云','cpu':331,'tcpu':192,'mem':1119,'tmem':1536,'storage':61,'tstorage':176,'ip':119,'tip':156},
	{'name':'河北政务云','cpu':996,'tcpu':880,'mem':2411,'tmem':5632,'storage':85,'tstorage':100,'ip':100,'tip':511},
	{'name':'互联港湾','cpu':499,'tcpu':480,'mem':499,'tmem':2304,'storage':10,'tstorage':108,'ip':0,'tip':0},
	{'name':'保定智慧城市','cpu':1115,'tcpu':4640,'mem':2886,'tmem':7424,'storage':147,'tstorage':394,'ip':73,'tip':972},
	{'name':'Erricsson-DC-1','cpu':89,'tcpu':544,'mem':280,'tmem':2560,'storage':7,'tstorage':71,'ip':10,'tip':0},
	{'name':'高平','cpu':20,'tcpu':680,'mem':40,'tmem':4352,'storage':1,'tstorage':116,'ip':4,'tip':6},
	{'name':'枣庄','cpu':294,'tcpu':440,'mem':1083,'tmem':2816,'storage':32,'tstorage':50,'ip':20,'tip':125},
	{'name':'内蒙古信用云','cpu':13,'tcpu':32,'mem':50,'tmem':256,'storage':1,'tstorage':8,'ip':6,'tip':71},
	{'name':'大连','cpu':70,'tcpu':128,'mem':135,'tmem':1024,'storage':6,'tstorage':80,'ip':19,'tip':214},
	{'name':'总量','cpu':54061,'tcpu':81248,'mem':103167.6,'tmem':235520,'storage':3347,'tstorage':7580,'ip':4362,'tip':16544}
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


