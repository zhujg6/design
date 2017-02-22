var ReCharge = {
		// 存放列表
		datatable : null,
		// 存放查出的充值记录
		infoData : [],
		
		init : function() {
			ReCharge.queryPayFeeCharge();
		},
		// 查询充值记录列表
		queryPayFeeCharge : function() {
			var account = userAccount;
			var datas = {
					loginName:account,
					// 此时间值就为此值，不允许修改,修改时需与亚信确认
					startDate:'19700101',
					// 此时间值就为此值，不允许修改，修改时需与亚信确认
					endDate  :'22001231'
			};
			Dcp.biz.apiRequest("/user/queryPayFeeCharge", datas, function(dataa) {
				if (dataa.code != "0") {
					alert("查询数据错误,当前用户为空" + account);
				} else {
					ReCharge.infoData=dataa.data;
					ReCharge.renderDataTable(dataa.data);
				}
			});
		},
		// 渲染列表
		renderDataTable : function(data) {
			if(ReCharge.datatable !=null){
				ReCharge.datatable.updateData(data);
				return
			}
			if(ReCharge.datatable == null) {
				ReCharge.datatable = new com.skyform.component.DataTable();
				
				ReCharge.datatable
						.renderByData(
								"#rechargeTable",// 要渲染的table所在的jQuery选择器
								{
									"data" : data, // 要渲染的数据选择器
									/**
									 * 下面是对自己数据的描述,数组中有多少个数据就代表着有多少列
									 */
									"columnDefs" : [{
												title : '流水号',
												name : 'serialCode' // 对应数据列中的哪个字段？
											}, {
												title : '充值成功时间',
												name : 'createTime'
											}, {
												title : '金额(元)',
												name : 'fee'
											}, {
												title : '资金渠道',
												name : 'payChannel'
											}, {
												title : '状态',
												name : 'payStatus'
											}],
									"iDisplayLength" : 15,
									"onColumnRender" : function(columnIndex, columnMetaData, columnData) {
										var text = columnData['' + columnMetaData.name]|| "";
										if (columnIndex == 0) {
											text = columnData.serialCode;
										}
										if (columnIndex == 1) {
											text = columnData.createTime;
										}
										if (columnIndex == 2) {
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
										if (columnIndex == 3) {
											text = columnData.payChannel;
										}
										if (columnIndex == 4) {
											// text = columnData.payStatus;
											//不允许修改，修改时需与亚信确认返回值
											text = "成功";
										}
										return text;
									}
								});
			}
		}
};
$(function() {
	ReCharge.init();
});