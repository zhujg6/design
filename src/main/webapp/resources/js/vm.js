/**
 * Created by linyiming on 15/9/19.
 */
//创建ECharts柱状图图表
function DrawCustomer(ec,info) { // 基于准备好的dom，初始化echarts图表
	var custChart = ec.init(document.getElementById('customer'));	
//JSON字符串
	custChart.setTheme('macarons');
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
			text: (function(){
						var ret = "客户信息";
						if(info){
							ret +="："+info.name;
						}
						else ret +="：总量";
						return ret;
					})(),
			subtext: '',
			textStyle:{color:'white'}
		},grid: {
		y:'30%',
			y2:'10%',
			borderWidth:0
	},
		tooltip : {
			trigger: 'axis'
		},
		toolbox: {
			show : false,
			feature : {
				mark : {show: false},
				dataView : {show: false, readOnly: false},
				magicType : {show: false, type: ['line', 'bar']},
				restore : {show: false},
				saveAsImage : {show: false}
			}
		},
		calculable : false,
		xAxis : [
			{
				type : 'category',

				data : [
					{
						value:'电商客户',
						textStyle:
						{
							color:'white'
						}
					},{
						value:'直销客户',
						textStyle:
						{
							color:'white'
						}
					},{
						value:'行业客户',
						textStyle:
						{
							color:'white'
						}
					},{
						value:'内部客户',
						textStyle:
						{
							color:'white'
						}
					}],
				splitLine:{
					show:false
				}
			}
		],
		yAxis : [
			{
				type : 'value',
				show:false,
				axisLabel: {
					show: false,
					textStyle:{
						color:"white" //刻度颜色
						//fontSize:16  //刻度大小
					}
				}
			}
		],
		series : [

			{
				name:'总量',
				type:'bar',
				itemStyle: {
					normal: {
						color: function(params) {
							// build a color map as your need.
							var colorList = [
								'#27727B',
								'#FE8463','#9BCA63','#FAD860','#F3A43B','#60C0DD',
								'#D7504B','#C6E579','#F4E001','#F0805A','#26C0C0'
							];
							return colorList[params.dataIndex]
						}
					}
				},
				data:(function (){
			    	var res = [84,318,192,1];
			    	if(info){
			    		res = [];
			    		res.push(info.online);
			    		res.push(info.offline);
			    		res.push(info.test);
			    		res.push(info.channel);
			    	}
					return res;
				 })(),
				markPoint : {
					data : [

					]
				},
				markLine : {
					data : [

					]
				}
			}
		]
	};
// 为echarts对象加载数据
	custChart.setOption(option,true);
	var ecConfig = require('echarts/config');
	custChart.on(ecConfig.EVENT.CLICK,function(param){		
//		console.log(param.name+":"+param.value);
		var list = getPoolCustomerByType(param.name,info.name);
		//alert(param.name+":"+param.value);
			initTable(list);
			$('#custTab').show();
			document.getElementById("custTab").scrollIntoView(true);
		}
	)
}
function getPoolCustomerByType(type,name){
	var ret = "";
	var custList = getCustList(type);
	if(custList){
		$(custList).each(function(i,item){
			if(name == item.pool){
				ret = item.customer;
				return false;
			}
		})
	}
	return ret;	
	
}

function getCustList(type){
	var ret = "";
	if(type == "电商客户"){
		ret = onlineCustomerList;
	}
	else if(type == "直销客户"){
		ret = offlineCustomerList;
	}
	else if(type == "测试客户"){
		ret = testCustomerList;
	}
	else if(type == "渠道客户"){
		ret = channelCustomerList;
	}
	return ret;
}

function initTable(attrs){
	var container = $("#custList");
	var th = container.find("tr:first").children();
	var html = "<tr>";
	$(th).each(function () {		
		 html += "<td name='"+$(this).attr("name")+"'>"+$(this).text()+"</td>";
	});	
	html += "</tr>";
	$(attrs).each(function(i,item){
		var row = "<tr>";
		$(th).each(function () { 
			var colName = $(this).attr("name");
			$.each(item,function(index,value){	 
	           	          
				if(index == colName){
					var td = "<td>"+value+"</td>";
					row += td;
				}
			
			})
		})
		row += "</tr>";
		html += row;
	})
	$("#custList").empty().append(html);
	
}
