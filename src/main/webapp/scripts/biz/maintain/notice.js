var CommonEnum = {
		serviceType:{
			"1001":"虚拟机",
			"1002":"弹性块存储",
			"1003":"负载均衡",
			"1012":"对象存储",
			"1013":"文件存储",
			"1006":"公网带宽",
			"1007":"云专享",
			"1008":"路由器",
			"1009":"私有网络",
			"1010":"安全策略组",
			"1015":"云桌面",
			"1016":"物理机",
			"1017":"快照"
		},
		billTypes:com.skyform.service.BillService.getBillType()
};
var Notice = {
		// 存放列表
		datatable : null,
		// 存放查出的充值记录
		infoData : [],
		// 总金额
		totalMoney : 0,
		
		init : function() {
			Notice.setYearRadio();
		},
		// 查询详单记录列表
		describleNotice : function(cycleid) {
			Notice.totalMoney = 0;
			var account = userAccount;
			var datas = {
					loginName:account,
					cycleId:cycleid,
					operatorId:null,
					serviceType:null
			};
			Dcp.biz.apiRequest("/user/queryBillDetailForCommon", datas, function(dataa) {
				if (dataa.code != "0") {
					alert("查询数据错误");
				} else {
					Notice.infoData=dataa.data;
					Notice.renderDataTable(dataa.data);
				}
			});
		},
		// 渲染列表
		renderDataTable : function(data) {
			if(Notice.datatable !=null){
				Notice.datatable.updateData(data);
				return;
			}
			var self = this;
			Notice.datatable = new com.skyform.component.DataTable();
			
			Notice.datatable.renderByData(
							"#monthNotice",// 要渲染的table所在的jQuery选择器
							{
								"data" : data, // 要渲染的数据选择器
								"pageSize" : 5,
								/**
								 * 下面是对自己数据的描述,数组中有多少个数据就代表着有多少列
								 */
								"columnDefs" : [{
											title : '实例名称',
											name : 'subscriptionName' // 对应数据列中的哪个字段？
										}, 
										{
											title : '产品类型',
											name : 'serviceType'
										}, 
//										{
//											title : '计价类型',
//											name : 'billType'
//										},
										{
											title : '金额(元)',
											name : 'totalAmount'
										},
										{
											title : '计价日期',
											name : 'payDate'
										},
										{
											title : '实例配置',
											name : 'instanceDetail'
										}],
								/*"iDisplayLength" : 15,*/
								"onColumnRender" : function(columnIndex, columnMetaData, columnData) {
									var text = '';
									if ("subscriptionName" == columnMetaData.name) {
							        	   text = columnData.subscriptionName;
							           } else if ("serviceType" == columnMetaData.name) {
							              return CommonEnum.serviceType[columnData.serviceType];
							           } else if ("payDate" == columnMetaData.name) {
							        	   var temp = columnData.payDate;
											if(temp){
												var obj = eval('(' + "{Date: new Date(" + temp + ")}" + ')');
												var dateValue = obj["Date"];
												text = dateValue.format('yyyy-MM-dd hh:mm:ss');
											}else{
												text = "";
											}
										}else if ("totalAmount" == columnMetaData.name) {										
										text =  columnData.totalAmount / 1000;
							           }else if ("instanceDetail" == columnMetaData.name) {										
										text =  self.decribeInstanceDetail(columnData);
							           }
									
									return text;
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
			chaxunRadio = Notice.getRadioHtml(vYear,vMon,6);
			var ctx = $("#ctx").val();
			var date = new Date();
			var queryTime= date.format("yyyyMM");
			chaxunRadio = chaxunRadio + "   <a href='"+ctx+"/jsp/user/objectStoreNotice.jsp?code=notice&cataCode=consume&queryTime="+queryTime+"' class='btn btn-info'>对象存储详单</a>";
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
				chaxunRadio += '<label class="radio inline"><input value="'+value+'" checked="checked" name="group" onclick="Notice.clickYearRadio('+nowYear+','+nowMon+','+value+')" type="radio" style="margin-top: 3px">'+content+'</label>';
				Notice.clickYearRadio(nowYear,nowMon,value);
			}else{
				chaxunRadio += '<label class="radio inline"><input value="'+value+'" name="group" type="radio" onclick="Notice.clickYearRadio('+nowYear+','+nowMon+','+value+')" style="margin-top: 3px">'+content+'</label>';
			}
			count -= 1;
			if(startYear == nowYear && nowMon == startMon) {
			}else if(count > 0) {
				chaxunRadio += Notice.getRadioHtml(nowYear,nowMon,count);
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
			Notice.setJiFeiZhouQi(year,month);
			Notice.describleNotice(value);
		},
		decribeInstanceDetail:function(instance){
			var self = this;
			var value= "";
			var serviceType = ""+instance.serviceType;
			switch(serviceType){
			case '1001'://虚拟机
				value = self.describeVMA(instance.instanceDetail);
				break;
			case '1002'://弹性块
				value = self.describeElasticBlockA(instance.instanceDetail);
				break;
			case '1013'://文件存储
				value = self.describleFileStorageA(instance.instanceDetail);
				break;
			case '1012'://对象存储
				value = self.describleObjectStorageA(instance.instanceDetail);
				break;
			case '1016'://物理机
				value = self.describePhysicalMachineA(instance.instanceDetail);
				break;
			case '1003'://负载均衡
				value = self.describleLoadBalanceA(instance.instanceDetail);
				break;
			case '1006'://公网带宽
				value = self.describlePublicNetworkA(instance.instanceDetail);
				break;
			case '1009'://私有网络
				value = self.describlePrivateNetworkA(instance.instanceDetail);
				break;
			case '1008'://
				value = self.describleRouterA(instance.instanceDetail);
				break;
			case '1017':
				value = self.describeBackUpA(instance.instanceDetailInfo);
				break;
			}
			return value;
		},
		describeVMA:function(instanceDetailInfo){
			var self = this;
			var value = "";
		    if(instanceDetailInfo){
		    	var cpunum = '';
		    	var os = '';
		    	var osdisk = '';
		    	var memorySize = '';
		    	var storageSize = '';
		    	var array = instanceDetailInfo.split('\n');
		    	if(array){
		    		$(array).each(function(index,item){
		    			if(item){
		    				var arritem = item.split(':');
		    				   if(arritem[0] == "cpuNum"){
								   cpunum = "CPU核数："
										+ arritem[1]
										+ "核,";
							   }else if(arritem[0] == "memorySize"){
								   memorySize= "内存："+arritem[1]+"GB,";
							   }else if(arritem[0] == "osDisk"){
								   osdisk = "系统盘："+arritem[1]+"GB,";
							   }else if(arritem[0] == "OS"){
								   os="操作系统："+arritem[1]+",";
				           			//os = "操作系统："+self.osList[arritem[1]]+",";
				               }
		    				
		    			}
		    		});
		    		value = cpunum + memorySize+ osdisk +os;
		    		value = value.substring(0, value.length - 1);
		    		return value;
		    	}
		    	
		    }
		},
		describeElasticBlockA:function(instanceDetailInfo){//弹性块
			var value = "";
		    if(instanceDetailInfo){
		    	var storageSize = '';
		    	var array = instanceDetailInfo.split('\n');
		    	if(array){
		    		$(array).each(function(index,item){
		    			if(item){
		    				var arritem = item.split(':');
		    				   if(arritem[0] == "storageSize"){
		    					   storageSize = "存储空间大小："+arritem[1]+"GB";
							   }
		    			}
		    		});
		    		value = storageSize ;
		    		return value;
		    	}
		    	
		    }
		},
		describleRouterA:function(instanceDetailInfo){
			var value = "";
		    if(instanceDetailInfo){
		    	var routerPrice = '';
		    	var driver = "";
		    	var array = instanceDetailInfo.split('\n');
		    	if(array){
		    		$(array).each(function(index,item){
		    			if(item){
		    				var arritem = item.split(':');
		    				   if(arritem[0] == "routerPrice"){
		    					   routerPrice = "路由器价格："+arritem[1]+"元,";
							   }else if(arritem[0] == "driver"){
								   driver = "产品厂商："+arritem[1]+",";
							   }
		    			}
		    		});
		    		value = routerPrice + driver;
		    		value = value.substring(0, value.length - 1);
		    		return value;
		    	}
		    	
		    }
		},
		describePhysicalMachineA:function(instanceDetailInfo){//物理机
			var self = this;
			var value = "";
		    if(instanceDetailInfo){
		    	var disksize = '';
		    	var os = '';
		    	var netcard = '';
		    	var cpu_cores_num = '';
		    	var disknum = '';
		    	var cpuspeed = '';
		    	var cpunumber ='';
		    	var memory = '';
		    	var array = instanceDetailInfo.split('\n');
		    	if(array){
		    		$(array).each(function(index,item){
		    			if(item){
		    				var arritem = item.split(':');
		    				   if(arritem[0] == "cpu_cores_num"){
		    					   cpu_cores_num = "CPU核数："
										+ arritem[1]
										+ "核,";
							   }else if(arritem[0] == "netcard"){
								   netcard= "网卡个数："+arritem[1]+"个,";
							   }else if(arritem[0] == "disksize"){
								   osdisk = "系统盘容量："+arritem[1]+"GB,";
							   }else if(arritem[0] == "os"){
				           			os = "操作系统："+self.osList[arritem[1]]+",";
				               }else if(arritem[0] == "disknum"){
				            	   disknum = "系统盘个数："+arritem[1]+"个,";
				               }else if(arritem[0] == "cpuspeed"){
				            	   cpuspeed = "CPU速度："+arritem[1]+"MHZ,";
				               }else if(arritem[0] == "memory"){
				            	   memory = "内存大小："+arritem[1]+"GB,";
				               }else if(arritem[0] == "cpunumber"){
				            	   cpunumber = "CPU数量："+arritem[1]+"个,";
				               }
		    				
		    			}
		    		});
		    		value = cpu_cores_num +cpunumber+ memory+ osdisk +os+disknum+cpuspeed;
		    		value = value.substring(0, value.length - 1);
		    		return value;
		    	}
		    	
		    }
		},
		describleLoadBalanceA:function(instanceDetailInfo){//弹性块
			var value = "";
		    if(instanceDetailInfo){
		    	var loadBalancePrice = '';
		    	var virtualip = '';
		    	var array = instanceDetailInfo.split('\n');
		    	if(array){
		    		$(array).each(function(index,item){
		    			if(item){
		    				var arritem = item.split(':');
		    				   if(arritem[0] == "loadBalancePrice"){
		    					   loadBalancePrice = "价格："+arritem[1]+"元,";
							   }else if(arritem[0] == "virtualip"){
								   virtualip = "虚拟IP："+arritem[1]+",";
							   }
		    			}
		    		});
		    		value = loadBalancePrice+virtualip ;
		    		value = value.substring(0, value.length - 1);
		    		return value;
		    	}
		    	
		    }
		},
		describlePublicNetworkA:function(instanceDetailInfo){
			var value = "";
		    if(instanceDetailInfo){
		    	var brand_with = '';
		    	var array = instanceDetailInfo.split('\n');
		    	if(array){
		    		$(array).each(function(index,item){
		    			if(item){
		    				var arritem = item.split(':');
		    				   if(arritem[0] == "BAND_WIDTH"){
		    					   brand_with = "带宽："+arritem[1]+"M";
							   }
		    			}
		    		});
		    		value = brand_with ;
		    		return value;
		    	}
		    	
		    }
		},
		describlePrivateNetworkA:function(instanceDetailInfo){
			var value = "";
		    if(instanceDetailInfo){
		    	var endip = "";
		    	var startip = "";
		    	var array = instanceDetailInfo.split('\n');
		    	if(array){
		    		$(array).each(function(index,item){
		    			if(item){
		    				var arritem = item.split(':');
		    				   if(arritem[0] == "startip"){
		    					   startip = "开始网段："+arritem[1]+",";
							   }else if(arritem[0] == "endip"){
								   endip = "结束网段："+arritem[1]+",";
							   }
		    			}
		    		});
		    		value = startip+endip ;
		    		value = value.substring(0,value.length - 1);
		    		return value;
		    	}
		    	
		    }
		},
		describleFileStorageA:function(instanceDetailInfo){
			var value = "";
		    if(instanceDetailInfo){
		    	var storageSize = '';
		    	var allCatalogueName = '';
		    	var array = instanceDetailInfo.split('\n');
		    	if(array){
		    		$(array).each(function(index,item){
		    			if(item){
		    				var arritem = item.split(':');
		    				   if(arritem[0] == "storageSize"){
		    					   storageSize = "存储空间大小："+arritem[1]+"GB,";
							   }else if(arritem[0] == "allCatalogueName"){
								   allCatalogueName = "目录全名："+arritem[1]+",";
							   }
		    			}
		    		});
		    		value = storageSize + allCatalogueName;
		    		value = value.substring(0, value.length - 1);
		    		return value;
		    	}
		    	
		    }
		},
		describleObjectStorageA:function(instanceDetailInfo){
			var value = "";
		    if(instanceDetailInfo){
		    	var storageSize = '';
		    	var objPrice = '';
		    	var array = instanceDetailInfo.split('\n');
		    	if(array){
		    		$(array).each(function(index,item){
		    			if(item){
		    				var arritem = item.split(':');
		    				   if(arritem[0] == "storageSize"){
		    					   storageSize = "存储空间大小："+arritem[1]+"GB,";
							   }else if(arritem[0] == "objPrice"){
								   objPrice = "单元价格："+arritem[1]+"元,";
							   }
		    			}
		    		});
		    		value = storageSize + objPrice;
		    		value = value.substring(0, value.length - 1);
		    		return value;
		    	}
		    	
		    }
		},
		describeBackUpA:function(instanceDetailInfo){
			var value = "";
		    if(instanceDetailInfo){
		    	var vmid = '';
		    	var array = instanceDetailInfo.split('\n');
		    	if(array){
		    		$(array).each(function(index,item){
		    			if(item){
		    				var arritem = item.split(':');
		    				   if(arritem[0] == "vmid"){
		    					   vmid = "虚拟机ID："+arritem[1];
							   }
		    			}
		    		});
		    		value = vmid;
		    		return value;
		    	}
		    	
		    }
		}
		
};

$(function() {
	Notice.init();
});