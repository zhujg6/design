//创建ECharts柱状图图表
function DrawColumnEChart(ec,info) { // 基于准备好的dom，初始化echarts图表    
	var mychart = ec.init(document.getElementById('resources1'));
	if(!info){
		info = infoList[infoList.length-1];
	}
	
	initResourceValue(info);
	
	
    mychart.setTheme('macarons');
			option = {
					tooltip : {
				        trigger: 'item',
				        formatter: "{a} <br/>{b} : {c} ({d}%)"
				    },
			    legend: {
			    	show:false,
			        x: 'left',
			        y: 'center',
			        data:[
			            'cpu','mem','storage','ip'
			        ]
			    },
			    title : {
			        text: (function(){
						var ret = "资源信息";
						if(info){
							ret =info.name+"："+ret;
						}
						return ret;
					})(),
			        textStyle:{color:'white'},
			        x: 'left'
			    },
			    series:(function(){
			    	if(info){
			    		var rest = [];
			    		if(info.cpu/info.tcpu>=0.9){
			    			var cpuPie=createPieWarn('cpu','23%','cpu',info.cpu,info.tcpu,'cpu使用量超过90%','cpu报警','23%','160');
			    		}else{
			    			var cpuPie=createPieNorm('cpu','23%','cpu',info.cpu,info.tcpu);
			    		}
			    		if(info.mem/info.tmem>=0.9){
			    			var memPie=createPieWarn('mem','37%','mem',info.mem,info.tmem,'mem使用量超过90%','mem报警','37%','160');
			    		}else{
			    			var memPie=createPieNorm('mem','37%','mem',info.mem,info.tmem);
			    		}
					    if(info.storage/info.tstorage>=0.9){
					    	var storagePie=createPieWarn('storage','51%','storage',info.storage,info.tstorage,'storage使用量超过90%','storage报警','51%','160');
					    }else{
					    	var storagePie=createPieNorm('storage','51%','storage',info.storage,info.tstorage);
					    }
					    if(info.ip/info.tip>=0.9){
					    	var ipPie=createPieWarn('ip','65%','ip',info.ip,info.tip,'ip使用量超过90%','ip报警','65%','160');
					    }else{
					    	var ipPie=createPieNorm('ip','65%','ip',info.ip,info.tip);
					    }
						rest.push(cpuPie);
						rest.push(memPie);
						rest.push(storagePie);
						rest.push(ipPie);
						return rest;
			    	}else{			    		
			    		var rest = [];
		    			var cpuPie=createPieLogin('cpu','23%','cpu',110,0);
				    	var memPie=createPieLogin('mem','37%','mem',66,33);
				    	var storagePie=createPieLogin('storage','51%','storage',12,88);
				    	var ipPie=createPieLogin('ip','65%','ip',23,77);
				    	rest.push(cpuPie);
				    	rest.push(memPie);
				    	rest.push(storagePie);
				    	rest.push(ipPie);
				    	return rest;
		    		
			    	}
			    })()
			};
// 为echarts对象加载数据
    mychart.setOption(option,true);
}
function createPieWarn(piename,pos,dataname,infoa,infob,notes,warnname,pinx,piny){
	var labelTop = {
		    normal : {
		        label : {
		            show : true,
		            position : 'center',
		            formatter : '{b}',
		            textStyle: {
		                baseline : 'bottom'
					            }
					        },
					        labelLine : {
					            show : false
					        }
					    }
					};
			var labelBottom = {
			    normal : {
				        color: 'lightgrey',
				        label : {
				            show : true,
				            position : 'center'
				        },
				        labelLine : {
				            show : false
				        }
			    }
			};
	var radius = [40, 55];
	var pie = {
		name:piename,
		type : 'pie',
	    center : [pos, '30%'],
	    radius : radius,
	   itemStyle :{ normal : {
	   		color:'rgba(255,0,0,0.4)',
	        label : {
	        	position : 'center',
	            formatter : function (params){
	            	return (infoa/infob*100).toFixed(2) + '%';
	            },
	            textStyle: {
	                baseline : 'top'
	            }
	        },  labelLine : {
	            show : false
	        }
	  }
	    },
	   data:(function (){
	    	var res = [];
	    	var other = {name:'other', value:infob-infoa,itemStyle:labelBottom}
			var cpu = {name:dataname, value:infoa,itemStyle:labelTop}
	    	res.push(other);
	    	res.push(cpu);
			return res;
		 })(),
		 markPoint :{
			    symbol: 'droplet',
			    symbolSize:26,
			    itemStyle:{
			        normal:{
			            label:{
			            	show:true,
			            	formatter:'{b}'
			                }
			        },
			        emphasis: {
			            label:{position:'top'}
			        }
			    },
			    data : [
			        		{name:warnname, value:notes,x:pinx, y:piny}
		        	   ]
			}
		};
	return pie;
}
function createPieNorm(piename,pos,dataname,infoa,infob){
	var labelTop = {
		    normal : {
		        label : {
		            show : true,
		            position : 'center',
		            formatter : '{b}',
		            textStyle: {
		                baseline : 'bottom'
					            }
					        },
					        labelLine : {
					            show : false
					        }
					    }
					};
			var labelBottom = {
			    normal : {
				        color: 'lightgrey',
				        label : {
				            show : true,
				            position : 'center'
				        },
				        labelLine : {
				            show : false
				        },
				    emphasis: {
				        color: 'rgba(0,0,0,0)'
				    }
			    }
			};
	var radius = [40, 55];
	var pie={
			name:piename,
        	type : 'pie',
            center : [pos, '30%'],
            radius : radius,
            itemStyle :{ 
            	normal : {
            		label : {
		        	position:'center',
		            formatter : function (params){
		            	//console.log((infoa/infob*100).toFixed(2));
		            	return (infoa/infob*100).toFixed(2) + '%';
		            },
		            textStyle: {
		                baseline : 'top'
		            }
		        },labelLine:{
		        	show:false
		        }
		  }
		    },
           data:(function (){
            	var res = [];
            	var other = {name:'other', value:infob-infoa, itemStyle : labelBottom}
				var cpu = {name:dataname, value:infoa, itemStyle : labelTop}
            	res.push(other);
            	res.push(cpu);
				return res;
			 })(),
	}
	return pie;
}
function createPieLogin(piename,pos,dataname,a,b){
	var labelTop = {
    normal : {
        label : {
            show : true,
            position : 'center',
            formatter : '{b}',
            textStyle: {
                baseline : 'bottom'
			            }
			        },
			        labelLine : {
			            show : false
			        }
			    }
	};
	var labelBottom = {
	    normal : {
		        color: 'lightgrey',
		        label : {
		            show : true,
		            position : 'center'
		        },
		        labelLine : {
		            show : false
		        },
		    emphasis: {
		        color: 'rgba(0,0,0,0)'
		    }
	    }
	};
	var radius = [40, 55];
	var pie={
			name:piename,
        	type : 'pie',
            center : [pos, '30%'],
            radius : radius,
            itemStyle :{ normal : {
		        label : {
		        	position:'center',
		            formatter : function (params){
				            return 100 - params.value + '%';
		            },
		            textStyle: {
		                baseline : 'top'
		            }
		        	},
		        	labelLine:{
		        	  show:false
		        }
		  }
	},
   data:(function (){
		var res = [];
		res = [
				{name:'other', value:b, itemStyle : labelBottom},
				{name:dataname, value:a,itemStyle : labelTop}
			];
		return res;
	 })(),
	}
	return pie;
}
function initResourceValue(info){
	var resource = $("#mainRes .resource");
	if(!info){
		var len = infoList.length;
		info = infoList[len-1];
	}
	$(resource).each(function(){
		var span = $(this);
		$.each(info,function(index,value){
			if(index == span.attr("name")){
				span.empty().html(value);
			}
		})
	})
}
