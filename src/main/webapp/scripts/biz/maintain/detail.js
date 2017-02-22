var Detail = {
		// 存放列表
		datatable : null,
		// 存放查出的充值记录
		infoData : [],
		// 总金额
		totalMoney : 0,
		
		init : function() {
			Detail.setYearRadio();
		},
		// 查询充值记录列表
		describleDetail : function(day1,day2) {
			Detail.totalMoney = 0;
			var account = userAccount;
			var datas = {
					loginName:account,
					startDate:day1,
					endDate:day2
			};
			Dcp.biz.apiRequest("/user/describeDetail", datas, function(dataa) {
				if (dataa.code != "0") {
					alert("查询数据错误");
				} else {
					Detail.infoData=dataa.data;
					Detail.renderDataTable(dataa.data);
				}
			});
		},
		// 渲染列表
		renderDataTable : function(data) {
			if(Detail.datatable !=null){
				Detail.datatable.updateData(data);
				return
			}
			Detail.datatable = new com.skyform.component.DataTable();
			
			Detail.datatable.renderByData(
							"#detailRecord",// 要渲染的table所在的jQuery选择器
							{
								"data" : data, // 要渲染的数据选择器
								/**
								 * 下面是对自己数据的描述,数组中有多少个数据就代表着有多少列
								 */
								"columnDefs" : [{
											title : '产品名称',
											name : 'productName' // 对应数据列中的哪个字段？
										}, 
										{
											title : '服务名称',
											name : 'serviceType'
										}, 
										{
											title : '计费起始时间',
											name : 'startTime'
										}, 
										{
											title : '时长',
											name : 'duartion'
										}, 
										{
											title : '费用（元）',
											name : 'fee'
										}],
								"iDisplayLength" : 15,
								"onColumnRender" : function(columnIndex, columnMetaData, columnData) {
									var text = columnData['' + columnMetaData.name]|| "";
									if (columnIndex == 0) {
										text = columnData.productName;
									}
									
									if (columnIndex == 1) {
										text = columnData.serviceType;
									}
									
									if (columnIndex == 2) {
										text = columnData.startTime;
									}
									
									if (columnIndex == 3) {
										text = columnData.duartion;
									}
									
									if (columnIndex == 4) {
										// 金额返回的是厘，转换成元，1元 = 1000厘 
										var money = columnData.fee;
										if(null != money && "0" != money) {
											// 转换成元
											money = money/1000;
											// 四舍五入保留两位小数
											money = Math.round(money*Math.pow(10,2))/Math.pow(10,2);
										}else {
											money = "0";
										}
										text = money;
									}
//									
//									if (columnIndex == 5) {
//										// 金额返回的是厘，转换成元，1元 = 1000厘 
//										var money = columnData.price;
//										if(null != money && "0" != money) {
//											// 转换成元
//											money = money/1000;
//											// 四舍五入保留两位小数
//											money = Math.round(money*Math.pow(10,2))/Math.pow(10,2);
//										}else {
//											money = "0";
//										}
//										text = money;
//									}
									
									
									return text;
								},
								"afterTableRender" : function() {
//									var s = Detail.totalMoney;
//									$("#totalMoney").html(Detail.totalMoney);
								}
							});
		},
		// 根据当前的系统时间列出近六个月的数据
		setYearRadio : function () {
			var chaxunRadio = "";
			// 取出当前的系统时间
			var d = new Date();
			var vYear = d.getFullYear();
			var vMon = d.getMonth() + 1;
			chaxunRadio = Detail.getRadioHtml(vYear,vMon,6);
			$("#yearRadios").html(chaxunRadio);
			Detail.datatable.addToobarButton($("#toolbar"));
		},
		
		getRadioHtml : function (nowYear,nowMon, count) {
			var startYear = 2014;
			var startMon = 1;
			var chaxunRadio = "";
			var oldYear = nowYear;
			if(startMon == nowMon) {
				nowMon = 12;
				if(startYear == nowYear) {
				}else {
					nowYear -= 1;
				}
			}else {
				nowMon -= 1;
			}
			var yue = nowMon;
			if(nowMon < 10) {
				yue = "0"+nowMon;
			}
			var content = nowYear + "年" + nowMon + "月";
			var value = nowYear + "" + yue;
			//console.log("大家好，我是第"+(6-count)+"出现，nowYear和nowMon分别是："+nowYear+","+nowMon);
			if(6 == count) {
				chaxunRadio += '<label class="radio inline"><input value="'+value+'" checked="checked" name="group" onclick="Detail.clickYearRadio('+nowYear+','+nowMon+','+value+')" type="radio" style="margin-top: 3px">'+content+'</label>';
				Detail.clickYearRadio(nowYear,nowMon,value);
			}else{
				chaxunRadio += '<label class="radio inline"><input value="'+value+'" name="group" type="radio" onclick="Detail.clickYearRadio('+nowYear+','+nowMon+','+value+')" style="margin-top: 3px">'+content+'</label>';
			}
			count -= 1;
			if(startYear == nowYear && nowMon == startMon) {
			}else if(count > 0) {
				chaxunRadio += Detail.getRadioHtml(nowYear,nowMon,count);
			}
			return chaxunRadio;
		},
		// 设置计费周期
		setJiFeiZhouQi : function (year,month) {
			var new_year = year;    //取当前的年份 
			var new_month = month++;//取下一个月的第一天，方便计算（最后一天不固定）
			if(month>12)            //如果当前大于12月，则年份转到下一年 
			{
				new_month -=12;        //月份减  
				new_year++;            //年份增
			}
			var new_date = new Date(new_year,new_month,1);                //取当年当月中的第一天
			var old_date = (new Date(new_date.getTime()-1000*60*60*24)).getDate();//获取当月最后一天日期
			var jifeizhouqistr = ""+year+"-" + (month-1) + "-1到"+year+"-" + (month-1) + "-" + old_date+"";
			$("#jiefeizhouqi").html(jifeizhouqistr);
		},
		// 近六个月的按钮的单击事件
		clickYearRadio : function (year,month,value) {
			//console.log("year和month分别是："+year+","+month);
			Detail.setJiFeiZhouQi(year,month);
			var new_year = year;    //取当前的年份 
			var new_month = month++;//取下一个月的第一天，方便计算（最后一天不固定）
			if(month>12)            //如果当前大于12月，则年份转到下一年 
			{
				new_month -=12;        //月份减  
				new_year++;            //年份增
			}
			var new_date = new Date(new_year,new_month,1);                //取当年当月中的第一天
			var old_date = (new Date(new_date.getTime()-1000*60*60*24)).getDate();//获取当月最后一天日期
			var month1 = (month-1);
			var month2 = "";
			if(month1<10){
				month2 = "0"+month1;
			}
			var day1 = ""+year+"" + month2 + "01";
			var day2 = ""+year+"" + month2 + old_date+"";
			Detail.describleDetail(day1,day2);
		}

};

$(function() {
	Detail.init();
});