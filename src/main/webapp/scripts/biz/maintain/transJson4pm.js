pmJson = {
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
			os.osDiskSizeMin=item.osDiskSizeMin;
			osList.push(os);
		 }); 
		 return osList;
	 },
	 
	 trans4ServiceOfferings : function(){
		 var ServiceOfferingsList = [];
		 $.each(this.vmConfig,function(index,item){				
				var cpuNum =  item.value;
				var cpuspeed = item.cpuspeed;
				var cpu_cores_num = item.cpu_cores_num;
				var memList = item.memory;
				$.each(memList,function(i,m){
					var offer = {};
					
					
					
//		            "value":"2",
//		            "desc":"2个",
//		            "cpuspeed":"0",
//		            "cpu_cores_num":"4",
//		            "memory":[
//		                {
//		                    "value":"48",
//		                    "desc":"48G",
//		                    "name":"测试物理机A",
//		                    "productId":"1016",
//		                    "os":"2",
//		                    "os_desc":"MAC OS Esxi5.0",
//		                    "disknum":"1",
//		                    "osDisk":"1024",
//		                    "netcard":"2",
//		                    "discount":""
//		                }
//		            ]

					
					
					
					
					offer.displaytext = m.name;
					offer.cpunumber = cpuNum;//cpuNum
					offer.cpuspeed = cpuspeed;  //cpu速率
					offer.cpu_cores_num = cpu_cores_num;  //cpu核数
					offer.memory = m.value;	   //内存大小
					offer.disknum = m.disknum;  //硬盘个数
					offer.osDisk = m.osDisk;  //osDisc 系统盘大小
					offer.os_id=m.os;   //操作系统id
					offer.netcard = m.netcard;  //网卡个数
					
					offer.pmPrice = m.pmPrice;
					offer.productId = m.productId;
					offer.discount = m.discount;
					offer.os_desc=m.os_desc;  //操作系统描述  os_desk
					
					ServiceOfferingsList.push(offer);
				});		
				
		 }); 
		 return ServiceOfferingsList;
	 },	
		getPMFee4quick : function(){
//			var productId = pmJson.productId;
			var productId = parseInt(pm.curProductId);
			/*var os = $(".osList.selected span").attr("os");
			var osValue = $("#vm-quick #_osId").html();
					
			var _cpuspeed = $("#vm-quick #_cpuspeed").html();
			var _cpu_cores_num = $("#vm-quick #_cpu_cores_num").html();
			var _disknum = $("#vm-quick #_disknum").html();
			var _netcard = $("#vm-quick #_netcard").html();
			var pmPrice = $("#vm-quick #_pmPrice").html();
			
			
			var oSDesc = $(".osList.selected span").text();
			var templateid = $(".osList.selected span").attr("value");
			var instanceName = $("#instanceName4pm").val();
			var account = $("#ownUserAccount").val();
			

			var cpuNum = $("#vm-quick #cpu").html();
			var memorySize = $("#vm-quick #memory").html();
			var serviceofferingid = pm.getServiceOfferingId(cpuNum, memorySize);
			var loginMode = $("input[type='radio'][name='loginMode']:checked").val();
			var keyPair = $("#keyPair").val();
			var bandwidth = $("#createBandwidthSize").val();
			var period = pm.createPeriodInput.getValue();
			var unit = $("#unit").val();
			var storageSize = $("#vm-quick #osDisk").html();
			
			var rootSize =  $("#createRootDiskSize").val();
			var rootMin = $("div#ostemplates div.selected>span:first").attr("mindisk");
			pm.defaultNetwork = pm.defaultNetwork || {id:0};*/	
			
			var osDisk = $("#vm-standard #osDisk").html();
			var instanceName = $("#instanceName4pm").val();
			var cpuNum = $("#vm-standard #cpu").html();
			var memorySize=$("#vm-standard #memory").html();
			var period = pm.createPeriodInput.getValue();
			//如果是年，period * 12
			if(3 == $("#billType .selected").attr("data-value")){
				period = period * 12;
			};
//			{"period":1,"productPropertyList":
//				[{"muProperty":"cpuNum","muPropertyValue":"1","productId":112},{"muProperty":"memorySize","muPropertyValue":"1","productId":112},{"muProperty":"OS","muPropertyValue":"5","productId":112},{"muProperty":"vmPrice","muPropertyValue":"1","productId":112}]}
			var instance = {
				"period" : period,
				"productPropertyList":[					
					{
						"muProperty" : "cpunumber",     //cpuNum
						"muPropertyValue" : cpuNum,
						"productId" : productId
					},
					{
						"muProperty" : "memory",      //memorySize
						"muPropertyValue" : memorySize,
						"productId" : productId
					},
					/*{
						"muProperty" : "disksize",
						"muPropertyValue" : storageSize,
						"productId" : productId
					},*/
					{
						"muProperty" : "os",
						"muPropertyValue" : osValue,
						"productId" : productId
					},
					{
						"muProperty" : "cpu_cores_num",   //CPU核数
						"muPropertyValue" : _cpu_cores_num,
						"productId" : productId
					},
					{
						"muProperty" : "disknum",   //系统盘个数
						"muPropertyValue" : _disknum,
						"productId" : productId
					},
					{
						"muProperty" : "cpuspeed",   //CPU速度
						"muPropertyValue" : _cpuspeed,
						"productId" : productId
					},
					{
						"muProperty" : "pmPrice",   //物理机计价属性
						"muPropertyValue" : pmPrice,
						"productId" : productId
					}
				] 
			};
			return instance;
		},
		getVM4JsonInstance : function(){
			var productId = parseInt(pm.curProductId);		
			//var oSDesc = $(".osList.selected span").text();
			var osDisk = $("#vm-standard #osDisk").html();
			//var templateid = $(".osList.selected span").attr("value");
			var instanceName = $("#instanceName4pm").val();
			//var count = $.trim($("#count").val());
			//var count = pm.createCountInput.getValue();
			//var account = $("#ownUserAccount").val();
			//var cpuNum = $(".cpu-options.selected").attr("data-value");
			var cpuNum = $("#vm-standard #cpu").html();
			//var memorySize = $(".memory-options.selected").attr("data-value");
			var memorySize=$("#vm-standard #memory").html();
			//var serviceofferingid = pm.getServiceOfferingId(cpuNum, memorySize);
			//var loginMode = $("input[type='radio'][name='loginMode']:checked").val();
			//var keyPair = $("#keyPair").val();
			//var bandwidth = $("#createBandwidthSize").val();
			var period = pm.createPeriodInput.getValue();
			//var unit = $("#unit").val();
			//var storageSize = $("#createDataDiskSize").val();
			//var rootSize =  $("#createRootDiskSize").val();
			//var rootMin = $("div#ostemplates div.selected>span:first").attr("mindisk");
			//pm.defaultNetwork = pm.defaultNetwork || {id:0};
			//如果是年，period * 12
			if(3 == $("#billType .selected").attr("data-value")){
				period = period * 12;
			};
			
			var instance = {
					"period" : period,
					"count" : 1,
					"productList" : [
						{
							"cpuNum" : cpuNum,
							"memorySize" : memorySize,
							//"OS" : templateid,
							"instanceName" : instanceName,
							"productId" : productId,
							"osDisk" : osDisk,
							"subNetId" : "0"
						},
					
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
			
			
			//instance.productList[0].osDisk = $("#vm-standard #osDisk").html();
			
			if($("#vm_privatenetwork").val() != "") {
				instance.productList[0].subNetId = $("#vm_privatenetwork").val();		
			} 
			//this.getFirewallData(instance);
			return instance;
	},
		
	getFirewallData : function(instance){
		instance.productList[0].firewallRules = [];
		$(FireWallCfg.rules).each(function(i,rule){	
			if("ICMP" == rule.name){
				rule.port = "0";
			};			
			var item = {
				"direction"	: ""+rule.direction,
				"name" : rule.name,
				"port" : ""+rule.port,
				"protocol" : ""+rule.protocol,
				"ip" : "192.168.0.1"
			} 
			instance.productList[0].firewallRules.push(item);
		});
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

vdiskJson = {
	product:{
		productId : 0,
		deft : 20,
		max : 200,
		min : 1,
		step : 1,
		unit : "G"
	}	
}
