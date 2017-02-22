var Record = {
		// 存放列表
		datatable : null,
		// 存放查出的充值记录
		infoData : [],
		// 总金额
		totalMoney : 0,
		
		init : function() {
			Record.setYearRadio();
		},
		// 查询充值记录列表
		describleRecord : function(cycleid) {
			Record.totalMoney = 0;
			var account = userAccount;
			var datas = {
					loginName:account,
					cycleId:String(cycleid)
			};
			Dcp.biz.apiRequest("/user/queryBill", datas, function(dataa) {
				if (dataa.code != "0") {
					alert("查询数据错误");
				} else {
					Record.infoData=dataa.data;
					Record.renderDataTable(dataa.data);
				}
			});
		},
		// 渲染列表
		renderDataTable : function(data) {
			if(Record.datatable !=null){
				Record.datatable.updateData(data);
				return
			}
			Record.datatable = new com.skyform.component.DataTable();
			
			Record.datatable.renderByData(
							"#monthRecord",// 要渲染的table所在的jQuery选择器
							{
								"data" : data, // 要渲染的数据选择器
								/**
								 * 下面是对自己数据的描述,数组中有多少个数据就代表着有多少列
								 */
								"columnDefs" : [{
											title : '费用名称',
											name : 'subjectName' // 对应数据列中的哪个字段？
										}, 
//										{
//											title : '减免金额（元）',
//											name : 'discountFee'
//										}, 
//										{
//											title : '调账金额（元）',
//											name : 'adjustFee'
//										}, 
										{
											title : '欠费金额（元）',
											name : 'balance'
										}, 
										{
											title : '账单金额（元）',
											name : 'totalFee'
										}],
								"iDisplayLength" : 15,
								"onColumnRender" : function(columnIndex, columnMetaData, columnData) {
									var text = columnData['' + columnMetaData.name]|| "";
									if (columnIndex == 0) {
										text = columnData.service_type_desc+"("+columnData.subjectName+")";
									}
									
//									if (columnIndex == 1) {
//										// 金额返回的是厘，转换成元，1元 = 1000厘 
//										var money = columnData.discountFee;
//										if(null != money && "0" != money) {
//											// 转换成元
//											money = money/1000;
//							        		// 四舍五入保留两位小数
//											money = Math.round(money*Math.pow(10,2))/Math.pow(10,2);
//										}else {
//											money = "0";
//										}
//										//Record.totalMoney = Record.totalMoney + money;
//										text = money;
//									}
//									
//									if (columnIndex == 2) {
//										// 金额返回的是厘，转换成元，1元 = 1000厘 
//										var money = columnData.adjustFee;
//										if(null != money && "0" != money) {
//											// 转换成元
//											money = money/1000;
//							        		// 四舍五入保留两位小数
//											money = Math.round(money*Math.pow(10,2))/Math.pow(10,2);
//										}else {
//											money = "0";
//										}
//										//Record.totalMoney = Record.totalMoney + money;
//										text = money;
//									}
//									
//									if (columnIndex == 3) {
//										// 金额返回的是厘，转换成元，1元 = 1000厘 
//										var money = columnData.lateFee;
//										if(null != money && "0" != money) {
//											// 转换成元
//											money = money/1000;
//											// 四舍五入保留两位小数
//											money = Math.round(money*Math.pow(10,2))/Math.pow(10,2);
//										}else {
//											money = "0";
//										}
//										//Record.totalMoney = Record.totalMoney + money;
//										text = money;
//									}
									
									if (columnIndex == 1) {
										// 金额返回的是厘，转换成元，1元 = 1000厘 
										var money = columnData.balance;
										if(null != money && "0" != money) {
											// 转换成元
											money = money/1000;
											// 四舍五入保留两位小数
											money = Math.round(money*Math.pow(10,2))/Math.pow(10,2);
										}else {
											money = "0";
										}
										//Record.totalMoney = Record.totalMoney + money;
										text = money;
									}
									
									if (columnIndex == 2) {
										// 金额返回的是厘，转换成元，1元 = 1000厘 
										var money = columnData.totalFee;
										if(null != money && "0" != money) {
											// 转换成元
											money = money/1000;
											// 四舍五入保留两位小数
											money = Math.round(money*Math.pow(10,2))/Math.pow(10,2);
										}else {
											money = "0";
										}
										Record.totalMoney = Record.totalMoney + money;
										text = money;
									}
									
									
									return text;
								},
								"afterTableRender" : function() {
									var s =  Math.floor(parseFloat(Record.totalMoney * 100))/100;
									$("#totalMoney").html(s);
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
			//nextline added by shixianzhi
			//vMon = d.getMonth()+4;
			chaxunRadio = Record.getRadioHtml(vYear,vMon,6);
			$("#yearRadios").html(chaxunRadio);
		},
		
		getRadioHtml : function (nowYear,nowMon, count) {
			var startYear = 2014;
			var startMon = 1;
			var chaxunRadio = "";
			var oldYear = nowYear;
			if(startMon == nowMon) {
				nowMon = 12;
				if(startYear == nowYear) {
					nowYear = startYear;
					nowMon = startMon;
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
			if(6 == count) {
				chaxunRadio += '<label class="radio inline"><input value="'+value+'" checked="checked" name="group" onclick="Record.clickYearRadio('+nowYear+','+nowMon+','+value+')" type="radio" style="margin-top: 3px">'+content+'</label>';
				Record.clickYearRadio(nowYear,nowMon,value);
			}else{
				chaxunRadio += '<label class="radio inline"><input value="'+value+'" name="group" type="radio" onclick="Record.clickYearRadio('+nowYear+','+nowMon+','+value+')" style="margin-top: 3px">'+content+'</label>';
			}
			count -= 1;
			if(startYear == nowYear && nowMon == startMon) {
			}else if(count > 0) {
				chaxunRadio += Record.getRadioHtml(nowYear,nowMon,count);
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
			//next line modifyed by shixianzhi
			var jifeizhouqistr = ""+year+"-" + (month-1) + "-1到"+year+"-" + (month-1) + "-" + old_date+"";
			$("#jiefeizhouqi").html(jifeizhouqistr);
		},
		// 近六个月的按钮的单击事件
		clickYearRadio : function (year,month,value) {
			Record.setJiFeiZhouQi(year,month);
			Record.describleRecord(value);
		}
		
};

$(function() {
	Record.init();
});