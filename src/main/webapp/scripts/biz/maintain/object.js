var CommonEnum = {
	currentPool:"xiank", //�Է����Ż������ã����ߵ�ʱ��Ҫ��Ӧ�޸�
	pools:Config.pools,
	billType:'',
	//新框架资源池
	NewPoolList:[],
	offLineBill:false,
	serviceType:{"vm":1001,"vdisk":1002,"lb":1003,"ip":1006,"route":1008,"subnet":1009,"obs":1012,"nas":1013,"pm":1016,"virus":8008,"vdiskBackup":1020,"vdiskAutoBackup":1021},	
	init : function(){
		//获取新框架资源池
		CommonEnum.getResourcePoolNew();
		if(currentUser>0){
			CommonEnum.billType = com.skyform.service.BillService.getBillType();
		}
		else CommonEnum.billType = {0:Dict.val("common_monthly"),3:Dict.val("common_annual")};
		$.each(CommonEnum.billType, function(index) {
			if(5 == index){
				CommonEnum.offLineBill = true;
				return false;
			}
			else {
				return false;
			}
		});
		listResourcePool(CommonEnum.offLineBill);
	},
	getResourcePoolNew :function(){
		$.ajax({
	        	url : $("#path").val()+"/pr/getResourcePoolNew",
	    	    //data : data,
	    	    type : "POST",
	    	    dataType:'json',
	    	    async : false,
	    	    success : function(data) {
		        	//console.info(data);
		        	if(data.code==0){
		        	   var obj=data.info;
		        	   if(obj){
		        	     if(obj.indexOf(",")!=-1){
		        	         if(obj.charAt(obj.length - 1)==","){
		        	           obj=obj.substring(0,obj.length-1);
		        	         }
		        	         CommonEnum.NewPoolList=obj.split(",");
		        	     }else{
		        	         CommonEnum.NewPoolList[0]=obj;
		        	     }
		        	   }
		        	}
	    	    },
	    	    error : function() {
	    			$("#logMsg").addClass("onError").html(Dict.val("wo_sorry_your_request_failed"));
	    		}
	    	 });	
	}
};
var VM={
routeProductId : 0,
microType : ["微型","小型A"],
microCpu : 1,
microMem : ["0.5","1"],
groupTotal : 0,
defaultNetwork : null,
createPeriodInput:null,
sgTable : null,
sgInstances:null,
	getFee : function(){
		if(CommonEnum.offLineBill)return;
		var period = VM.createPeriodInput.getValue();
		var param = vmJson.getVMFeeInstance();
		/*$(param).each(function(index, item){
			Dcp.biz.apiAsyncRequest("/pm/queryCaculateFeeByPrtyList",item, function(data) {
				if(null!=data&&0 == data.code){
					var count = 1;
					var fee =  data.data.fee;
					//$("#feeInput").val(count * fee/feeUnit);
					//$(".price").empty().html(count * fee/feeUnit);
					console.log(count * fee/feeUnit+'abc');
				}
			});
		})*/

		Dcp.biz.apiAsyncRequest("/pm/queryCaculateFeeByPrtyList",param, function(data) {
			if(null!=data&&0 == data.code){
				var count = 1;
				var fee =  data.data.fee;
				//$("#feeInput").val(count * fee/feeUnit);
				$(".price").empty().html(count * fee/feeUnit);
			}
		});
	},
	vmTypeFee : function(){
		if(CommonEnum.offLineBill)return;
		var period = VM.createPeriodInput.getValue();
		var param = vmJson.getVMFeeInstance();
		Dcp.biz.apiAsyncRequest("/pm/queryCaculateFeeByPrtyList&_="+new Date().getTime(),{"period":param.period,"productPropertyList":[param.productPropertyList
			[0],param.productPropertyList[1],param.productPropertyList[2],param.productPropertyList
			[3]],"verifyFlag":param.verifyFlag}, function(data) {
			if(null!=data&&0 == data.code){
				var count = 1;
				var fee =  data.data.fee;
				$("#vmTypeFee").html(count * fee/feeUnit+'元');
			}
		});
	},
	vmTypeUnitFee : function(param){
		if(CommonEnum.offLineBill)return;
		//var period = VM.createPeriodInput.getValue();
		Dcp.biz.apiAsyncRequest("/pm/queryCaculateFeeByPrtyList&_="+new Date().getTime(),{"period":1,"productPropertyList":[param],"verifyFlag":"0"}, function(data) {
			if(null!=data&&0 == data.code){
				var count = 1;
				var fee =  data.data.fee;
				$("#vm-ul tr[productid='"+param.productId+"']").find('td:eq(3)').html('<span style="color:#f00;">'+count * fee/feeUnit+'</span>'+'元/月起');
			}
		});
	},
	bandWidthFee : function(){
		if(CommonEnum.offLineBill)return;
		var period = VM.createPeriodInput.getValue();
		var param = vmJson.getVMFeeInstance();
		Dcp.biz.apiAsyncRequest("/pm/queryCaculateFeeByPrtyList&_="+new Date().getTime(),{"period":param.period,"productPropertyList":[param.productPropertyList[4]],"verifyFlag":param.verifyFlag}, function(data) {
			if(null!=data&&0 == data.code){
				var count = 1;
				var fee =  data.data.fee;
				$("#bandWidthFee").html(count * fee/feeUnit+'元');
			}
		});
	},
	dataSizeFee : function(){
		if(CommonEnum.offLineBill)return;
		var period = VM.createPeriodInput.getValue();
		var param = vmJson.getVMFeeInstance();
		if(param.productPropertyList[5]){
			Dcp.biz.apiAsyncRequest("/pm/queryCaculateFeeByPrtyList&_="+new Date().getTime(),{"period":param.period,"productPropertyList":[param.productPropertyList[5]],"verifyFlag":param.verifyFlag}, function(data) {
				if(null!=data&&0 == data.code){
					var count = 1;
					var fee =  data.data.fee;
					$("#data_DiskSizeFee").html(count * fee/feeUnit+'元');
				}
			});
		}
	},
	routerFee : function(){
		if(CommonEnum.offLineBill)return;
		var period = VM.createPeriodInput.getValue();
		var param = vmJson.getVMFeeInstance();
		if(param.productPropertyList[6]){
			Dcp.biz.apiAsyncRequest("/pm/queryCaculateFeeByPrtyList&_="+new Date().getTime(),{"period":param.period,"productPropertyList":[param.productPropertyList[6]],"verifyFlag":param.verifyFlag}, function(data) {
				if(null!=data&&0 == data.code){
					var count = 1;
					var fee =  data.data.fee;
					$("#router").html(count * fee/feeUnit+'元');
				}
			});
		}
		else{
			$("#router").html('0元');
		}
	},
	getServiceOfferingId : function(cpuNumber, memory) {
		var serviceOfferingId = 0;
		$(serviceOfferingsData).each(function(index, item) {
			if (cpuNumber == item.cpunumber && memory == item.memory) {
				serviceOfferingId = item.id;
			}
		});
		return serviceOfferingId;
	},
	querySG:function(){
		com.skyform.service.FirewallService.querySG(function(data){
//		VM.sgInstances = data;
		var _data = VM.querySGByState(data);
		VM.groupTotal = _data.length;
		VM.renderSGTable(_data);
		if(data.length != 0&&VM.groupTotal == 0)
			$("#_aqzTips").removeClass("hide");
//		if(data.length > 10){
//			$("#createNewSG").addClass("hide");
//			$("#sgSetting [type='radio'][value='useExisted']").prop("checked",true);
//			$("#sgSetting [type='radio'][value='useExisted']").click();
//	//		$("#sgSetting [type='radio']").each(function(){
//	//			if($(this).attr("value") == "useExisted")
//	//		})
//		}
//		else 
		if(data.length == 0){
			$("#useExt").addClass("hide");
			$("#sgSetting [type='radio'][value='createNew']").prop("checked",true);
			$("#sgSetting [type='radio'][value='createNew']").click();
	//		$("#sgSetting [type='radio']").each(function(){
	//			$(this).attr("disabled",false);
	//		})
		}
		})
	},
	renderSGTable:function(result){	
		var data = VM.querySGByState(result);
		if(VM.sgTable) {
			VM.sgTable.updateData(data);				
		} else {
			VM.sgTable = new com.skyform.component.DataTable();
			VM.sgTable.renderByData("#sgTable",{
				pageSize : 5,
				data : data,
				onColumnRender : function(columnIndex,columnMetaData,columnData){
					 var text = columnData[''+columnMetaData.name] || "";
					 if(columnMetaData.name=='id') {
						 text = '<input type="radio" name="sgRadio" value="'+columnData['subscriptionId']+'">';
					 }
					 else if (columnMetaData.name == "ID") {
						 text = columnData['subscriptionId'];
					 }
					 else if (columnMetaData.name == "instanceName") {
						 text = columnData['subscriptionName'];
					 }
					 else if (columnMetaData.name == "state") {
						 if("bind error"==columnData.subServiceStatus||"using"== columnData.subServiceStatus){
							 columnData.subServiceStatus = "running";
						 }
						 text = com.skyform.service.StateService.getState("",columnData.subServiceStatus || columnData);
					 }
					 else if (columnMetaData.name == "descrInfo") {
						 text = "";
					 }
					 else if ("createDate" == columnMetaData.name) {
							try {
								var obj = eval('(' + "{Date: new Date("
										+ columnData.createDate + ")}"
										+ ')');
								var dateValue = obj["Date"];
								text = dateValue
										.format('yyyy-MM-dd hh:mm:ss');
							} catch (e) {

							}
							return text;
						}else if ("expireDate" == columnMetaData.name) {
							try {
								var obj = eval('(' + "{Date: new Date("
										+ columnData.inactiveDate + ")}"
										+ ')');
								var dateValue = obj["Date"];
								text = dateValue
										.format('yyyy-MM-dd hh:mm:ss');
							} catch (e) {

							}
							
						}
					 return text;
				},
				afterRowRender : function(rowIndex,data,tr){
					if(0==rowIndex){
						tr.find("input[type='radio'][name='sgRadio']").attr("checked",'checked');
					};
					tr.click(function(){
						tr.find("input[type='radio'][name='sgRadio']").attr("checked",'checked');
					})
				},
				afterTableRender : function(){
					$("#sgTable_wrapper .btn").hide();						
				}
				
			});				
			
		}
	
	},
	querySGByState:function(data){
		var result = [];
		$(data).each(function(i,item){
			if(item.subServiceStatus!=='opening'&&'create error'!=item.subServiceStatus&&item.subServiceStatus.indexOf('dele')==-1){
				result.push(item);
			}
		});
		return result;
	},
	queryRouteProductPrtyInfo : function(index){
		com.skyform.service.BillService.queryProductPrtyInfo(index,"route",function(result){
			$.each(result,function(index,item){
				if(item.productname.indexOf("默认")!=-1)
					VM.routeProductId = item.productId;
					return false;
			});
		});
	}
};
vdiskJson = {
	product:{
		productId : 0,
		deft : 20,
		max : 200,
		min : 1,
		step : 1,
		unit : "G"
	}	
};
vmJson = {
	 product: 0,
	 oslist : {},
	 vmConfig : {},
	 
	 trans4OS :function(){
		 var osList = [];
		 $.each(this.oslist,function(index,item){
			var os = {};
			os.id =  item.value;
			os.name = item.desc;
			os.mindisk = item.osDiskSizeMin;
			os.ostypename = item.desc;
			 if(os.name!='微型'||os.id!=111)
				osList.push(os);
		 }); 
		 return osList;
	 },
	 trans4OSByPool : function(pool) {
		var osList = [];
		$.each(this.oslist, function(index, item) {
			if (item.resourcePool&&item.resourcePool.length>0) {
				$(item.resourcePool).each(function(j, p) {
					if (pool == p.name) {
						var os = {};
						os.id = item.value;
						os.name = item.desc;
						os.mindisk = item.osDiskSizeMin;
						os.ostypename = item.desc;
						os.type=item.type;
						if(os.name!='微型'||os.id!=111)
							osList.push(os);
					}
				});
			}
			else if(null==item.resourcePool ||(item.resourcePool&&item.resourcePool.length == 0)){
				var os = {};
				os.id = item.value;
				os.name = item.desc;
				os.mindisk = item.osDiskSizeMin;
				os.ostypename = item.desc;
				os.type=item.type;
				if(os.name!='微型'||os.id!=111)
					osList.push(os);
			}
		});
		return osList;
	},
	 
	 trans4ServiceOfferings : function(){
		 var ServiceOfferingsList = [];
		 $.each(this.vmConfig,function(index,item){				
				var cpuNum =  item.value;
				var memList = item.memory;
				$.each(memList,function(i,m){
					var offer = {};
					offer.displaytext = m.name;
					offer.cpunumber = cpuNum;
					offer.memory = m.value;	
					offer.osDisk = m.osDisk;
					offer.vmPrice = m.vmPrice;
					offer.productId = m.productId;
					offer.discount = m.discount;
					ServiceOfferingsList.push(offer);
				})		
				
		 }); 
		 return ServiceOfferingsList;
	 },	 
	 trans4ServiceOfferingsByPool : function(pool){
		 var ServiceOfferingsList = [];
		 $.each(this.vmConfig,function(index,item){				
				var cpuNum =  item.value;
				var memList = item.memory;
				$.each(memList,function(i,m){
					if(m.resourcePool&&m.resourcePool.length > 0){
						$(m.resourcePool).each(function(j,p){
							if(pool == p.name ){
								var offer = {};
								offer.displaytext = m.name;
								offer.cpunumber = cpuNum;
								offer.memory = m.value;	
								offer.osDisk = m.osDisk;
								offer.vmPrice = m.vmPrice;
								offer.productId = m.productId;
								offer.discount = m.discount;
								ServiceOfferingsList.push(offer);
								return false;
							}
						})
					}					
					else if(null == m.resourcePool||( m.resourcePool&&m.resourcePool.length == 0)){
						var offer = {};
						offer.displaytext = m.name;
						offer.cpunumber = cpuNum;
						offer.memory = m.value;	
						offer.osDisk = m.osDisk;
						offer.vmPrice = m.vmPrice;
						offer.productId = m.productId;
						offer.discount = m.discount;
						ServiceOfferingsList.push(offer);
					}
				})		
				
		 }); 
		 return ServiceOfferingsList;
	 },	

		getVMFeeInstance : function(){
			var productId = vmJson.productId;
			var os = $(".osList.active").attr("os");
			var osValue = $(".osList.active").attr("value");
			var oSDesc = $(".osList.active").text();
			var templateid = $(".osList.active").attr("value");
			var instanceName = $("#instanceName").val();
			//var count = $.trim($("#count").val());
			var count = 1;
			var account = $("#ownUserAccount").val();
			
			/*
			if($("#config .active").attr("value") == "stand"){
				//cpuNum = $("#vm-standard #cpu").html();
				cpuNum = $("#_cpu").html();
				//memorySize = $("#vm-standard #memory").html();
				memorySize = $("#_mem").html();
			}
			else {
				//cpuNum = $(".cpu-options.active").attr("data-value");
				//memorySize = $(".memory-options.active").attr("data-value");
				cpuNum = $("#_cpu").html();
				memorySize = $("#_mem").html();
			}
			*/
			var cpuNum = $("#_cpu").html();
			var memorySize = $("#_mem").html();
			var serviceofferingid = VM.getServiceOfferingId(cpuNum, memorySize);
			var loginMode = $("input[type='radio'][name='loginMode']:checked").val();
			var keyPair = $("#keyPair").val();
			var bandwidth = $("#createBandwidthSize").val();
			var period = VM.createPeriodInput.getValue();
			var unit = $("#unit").val();
			var storageSize = $("#createDataDiskSize").val();
			var rootSize =  $("#createRootDiskSize").val();
			var rootMin = $("div#ostemplates div.selected>span:first").attr("mindisk");
			VM.defaultNetwork = VM.defaultNetwork || {id:0};	

			//������꣬period * 12
			if(3 == $("#billType .active").attr("data-value")){
				period = period * 12;
			};
			var instance = {
				"period" : period,
				"productPropertyList":[					
					{
						"muProperty" : "cpuNum",
						"muPropertyValue" : cpuNum,
						"productId" : productId
					},
					{
						"muProperty" : "memorySize",
						"muPropertyValue" : memorySize,
						"productId" : productId
					},
					{
						"muProperty" : "OS",
						"muPropertyValue" : osValue,
						"productId" : productId
					}
				] 

			};
			if($("#config .active").attr("value") == "stand"){
				var value = $("#vm-ul .active").attr("vmprice");
				var productId = Number($("#vm-ul .active").attr("productid"));
				var vmPrice = {
						"muProperty" : "vmPrice",
						"muPropertyValue" : value,
						"productId" : productId
					};
				instance.productPropertyList[0].productId = productId;
				instance.productPropertyList[1].productId = productId;
				instance.productPropertyList[2].productId = productId;
				instance.productPropertyList.push(vmPrice);
			}
			if($("#vm_privatenetwork").val() == "") {}
			var networkoption = $("input[type='radio'][name='networkoption']:checked").val();
			if("createNew" == networkoption){
				var bw = {
						"muProperty" : "BAND_WIDTH",
						"muPropertyValue" : bandwidth,
						"productId": ipJson.product.productId
					};
				instance.productPropertyList.push(bw);
			}
						
			if(storageSize >= 0){
				var disk = {
						"muProperty" : "storageSize",
						"muPropertyValue" : storageSize,
						"productId": vdiskJson.product.productId
					};
				instance.productPropertyList.push(disk);
			}
			
			if($("#vm_privatenetwork option:selected").attr("relStatus") != "9"&&"createNew" == networkoption){
				var _route = {
						"muProperty" : "routerPrice",
						"muPropertyValue" : "1",
						"productId": VM.routeProductId
				};
				instance.productPropertyList.push(_route);
			}
			return instance;
		},
		getVMFeeInstance4change : function(){
			var productId = VM.getCheckedArr().parents("tr").attr("productId");
			var osValue = VM.getCheckedArr().parents("tr").attr("osId");
			var cpuNum = $("#myModal006change").find(".cpu-options.selected").attr("data-value");
			var memorySize = $("#myModal006change").find(".memory-options.selected").attr("data-value");
			var period = VM.getCheckedArr().parents("tr").attr("period");
			var vmPrice = VM.getCheckedArr().parents("tr").attr("vmPrice");
			var instance = {
				"period" : period,
				"productPropertyList":[					
					{
						"muProperty" : "cpuNum",
						"muPropertyValue" : cpuNum,
						"productId" : productId
					},
					{
						"muProperty" : "memorySize",
						"muPropertyValue" : memorySize,
						"productId" : productId
					},
					{
						"muProperty" : "OS",
						"muPropertyValue" : osValue,
						"productId" : productId
					},
					{
						"muProperty" : "vmPrice",
						"muPropertyValue" : vmPrice,
						"productId" : productId
					}
				] 

			};			
			return instance;
		},
		
		getVM4JsonInstance : function(){
			var productId = vmJson.productId;
			var oSDesc = $(".osList.active").text();
			//var osDisk = $("#vm-standard #osDisk").html();
			var osDisk = $("#osDisk").html();
			var templateid = $("#ostemplates").val();
			var instanceName = $("#instanceName").val();
			//var count = $.trim($("#count").val());
			var count = 1;
//			var account = $("#ownUserAccount").val();
			/*
			var cpuNum = 0;
			var memorySize = 0;
			
			if($("#config .active").attr("value") == "stand"){
				//cpuNum = $("#vm-standard #cpu").html();
				cpuNum = $("#_cpu").html();
				memorySize = $("#_mem").html();
			}
			else {
				//cpuNum = $(".cpu-options.active").attr("data-value");
				//memorySize = $(".memory-options.active").attr("data-value");
				cpuNum = $("#_cpu").html();
				memorySize = $("#_mem").html();
			}*/
			var cpuNum = $("#_cpu").html();
			var memorySize = $("#_mem").html();
			
			var serviceofferingid = VM.getServiceOfferingId(cpuNum, memorySize);
			var loginMode = $("input[type='radio'][name='loginMode']:checked").val();
			var keyPair = $("#keyPair").val();
			var bandwidth = $("#createBandwidthSize").val();
			
			var period = VM.createPeriodInput.getValue();
			var unit = $("#unit").val();
			var storageSize = $("#createDataDiskSize").val();
			
			var rootSize =  $("#createRootDiskSize").val();
			var rootMin = $("div#ostemplates div:first").attr("mindisk");
			VM.defaultNetwork = VM.defaultNetwork || {id:0};
			var imageTemplateId = $("#imagetemplates .osList.active").attr("imageTemplateId");
			var imageTemplateValue = $("#imagetemplates").val();
			//������꣬period * 12
			if(3 == $("#billType .active").attr("data-value")){
				period = period * 12;
			};
			var instance = {
					"period" : period,
					"count" : count,
					"productList" : [
						{
							"cpuNum" : cpuNum,
							"memorySize" : memorySize,
							"OS" : templateid,
							"instanceName" : instanceName,
							"productId" : productId,
							"osDisk" : osDisk,
							"subNetId" : "0"
						}
					
//						{
//							"BAND_WIDTH":"5",
//							"instanceName":"",
//							"productId":productId
//						},
//						{
//							"instanceName " : " ebs_test_9",
//							"storageSize " : storageSize,
//							"productId":productId
//						}
					  ]
					}
			//ѡ����
			if($("#image .image").hasClass("active")){
				instance.productList[0].imageTemplateId = imageTemplateId;
				instance.productList[0].OS = imageTemplateValue;
			}
			
			if($("#config .active").attr("value") == "stand"){
				productId = Number($("#vm-ul .active").attr("productid"));
				var vmPrice = $("#vm-ul .active").attr("vmprice");
				instance.productList[0].productId = productId;				
			}
			else {
				//instance.productList[0].osDisk = $("#vm-diy #osDisk").html();
				instance.productList[0].osDisk = $("#osDisk").html();
			}
			
			if($("#vm_privatenetwork").val() != "") {} else {}
			instance.productList[0].subNetId = $("#vm_privatenetwork").val();		
		
			var networkoption = $("input[type='radio'][name='networkoption']:checked").val();
			if("useExisted" == networkoption) {
				if($("#existed_ips").val() != "") {
					instance.productList[0].bindId = $("#existed_ips").val();
				}
			} else if("createNew" == networkoption){
				var bw = {
						"instanceName" : "bandwidth",
						"BAND_WIDTH" : bandwidth,
						"productId" : ipJson.product.productId	
				}
				instance.productList.push(bw) ;
			}
			
			var sgoption = $("input[type='radio'][name='sgoption']:checked").val();
			if("useExisted" == sgoption) {
				var sgId = $("input[type='radio'][name='sgRadio']:checked").val();				
				instance.productList[0].securityId = sgId;
				
			}
			else if("createNew" == sgoption){
				var firewallName = $("#firewallName").val();				
				instance.productList[0].firewallName = firewallName;
			}
			if(storageSize > 0){
				var storage = {
						"instanceName" : "storageDisk",	
						"storageSize" : storageSize,
						"productId" : vdiskJson.product.productId,
						"serviceType" : CommonEnum.serviceType["vdisk"]
				};
				instance.productList.push(storage); 
			}
			
			if("createNew" == networkoption){
				if($("#vm_privatenetwork option:selected").attr("routerid") == "undefined"){
					var route = {
						"ROUTER" : "1",
						"productId" :VM.routeProductId,
						"resourcePool" : $("#pool").val()
					}
					instance.productList.push(route);
				}
				else{
					var route = {
						"ROUTER" : "1",
						"routerId" :$("#vm_privatenetwork option:selected").attr("routerid")
					}
					instance.productList.push(route);
				}
			}
			
			this.getFirewallData(instance);
			return instance;
	},		
	getFirewallData : function(instance){
		instance.productList[0].firewallRules = [];
//		instance.productList[0].firewallRules.push(tcp_egress);
//		instance.productList[0].firewallRules.push(udp_egress);
//		$(FireWallCfg.rules).each(function(i,rule){	
//			if("ICMP" == rule.name){
//				rule.port = "0";
//			};			
//			var item = {
//				"direction"	: ""+rule.direction,
//				"name" : rule.name,
//				"port" : ""+rule.port,
//				"protocol" : ""+rule.protocol,
//				"ip" : rule.ip
//			} 
//			instance.productList[0].firewallRules.push(item);
//		});
	}
};
ipJson = {
	product:{
		productId : 0,
		max : 200,
		min : 1,
		step : 1,
		unit : "M"
	}
};