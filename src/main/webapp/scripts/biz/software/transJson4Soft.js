vmJson4Soft = {
	 product: 0,
	 oslist : {},
	 softwareList : {},
	 vmConfig : {},
	 trans4Software :function(){
		 var softList = [];
		 var pools = Config.pools;
			$.each(this.softwareList,function(_index,_item){
				var soft = {};
				soft.softwareId = _item.softwareId;
				soft.desc = _item.softwareVersion;//_item.softwareName+" "+_item.softwareVersion;	
				soft.type = _item.type;
				soft.resourcePool = _item.resourcePool;
				var container = $("#resourcePool");
				$.each(_item.resourcePool,function(i,pool){
					$("<option value='"+pool.name+"'>"+pools[pool.name]+"</option>").appendTo(container);
				});
				softList.push(soft);
			});
		 
		return softList;
	 },
	 
	 trans4OS :function(_softwareid){
		 var osList = [];
			$.each(this.softwareList,function(_index,_item){
				if(_item.softwareId == _softwareid){					
					 $.each(_item.oslist,function(index,item){
							var os = {};
							os.id = item.value;   //  item.osId;
							os.name = item.desc;
							os.mindisk = item.osDiskSizeMin;
							os.ostypename = item.desc;
							osList.push(os);
					}); 
					
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
					offer.displaytext = m.name;//  productTypeName
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
					if(null != m.resourcePool){
						$(m.resourcePool).each(function(j,p){
							if(pool == p.name ){
								var offer = {};
								offer.displaytext = m.name;
								offer.cpunumber = cpuNum;
								offer.memory = m.value;	
								offer.osDisk = m.osDisk;
								for(var _name in m){
									if(_name.indexOf("vmPrice")>-1){										
										offer.vmPriceName = _name;
										offer.vmPrice = m[_name];
									}
								}								
								offer.productId = m.productId;
								offer.discount = m.discount;
								ServiceOfferingsList.push(offer);
								return false;
							}
						})
					}					
				})		
				
		 }); 
		 return ServiceOfferingsList;
	 },	

		getVMFeeInstance : function(){
			var productId = parseInt(vmJson4Soft.productId);
			var os = $(".osList.selected span").attr("os");
//			var osValue = $(".osList.selected span").attr("value");
			var osValue = $("#osId").val();
			var oSDesc = $(".osList.selected span").text();
			var templateid = $(".osList.selected span").attr("value");
			var instanceName = $("#instanceName").val();
			var count = 1;
			var account = $("#ownUserAccount").val();
			var cpuNum = 0;
			var memorySize = 0;
			if($(".vm-type[data-value!='DIY']").hasClass("selected")){
				cpuNum = $("#vm-standard #cpu").html();
				memorySize = $("#vm-standard #memory").html();
			}
			else {
//				cpuNum = $(".cpu-options.selected").attr("data-value");
				cpuNum = $("#cpu").html();
//				memorySize = $(".memory-options.selected").attr("data-value");
				memorySize = $("#memory").html();
			}
			
			var serviceofferingid = VM4Soft.getServiceOfferingId(cpuNum, memorySize);
			var loginMode = $("input[type='radio'][name='loginMode']:checked").val();
			var keyPair = $("#keyPair").val();
			var bandwidth = $("#createBandwidthSize").val();
			var period = VM4Soft.createPeriodInput.getValue();
			var unit = $("#unit").val();
			var storageSize = $("#createDataDiskSize").val();
			var rootSize =  $("#createRootDiskSize").val();
			var rootMin = $("div#ostemplates div.selected>span:first").attr("mindisk");
			VM4Soft.defaultNetwork = VM4Soft.defaultNetwork || {id:0};	

			//如果是年，period * 12
			if(3 == $("#billType .selected").attr("data-value")){
				period = period * 12;
			};
			var _vmPrice = $("#vmPrice").val();
			var _vmPriceName = $("#vmPriceName").val();

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
						"muProperty" : _vmPriceName,
						"muPropertyValue" : _vmPrice,
						"productId" : productId
					}					
				] 

			};
//			if($(".vm-type[data-value!='DIY']").hasClass("selected")){
//				var value = $(".vm-type.selected").attr("vmprice");
//				var productId = Number($(".vm-type.selected").attr("productid"));
//				var vmPrice = {
//						"muProperty" : "vmPrice",
//						"muPropertyValue" : value,
//						"productId" : productId
//					};
//				instance.productPropertyList[0].productId = productId;
//				instance.productPropertyList[1].productId = productId;
//				instance.productPropertyList[2].productId = productId;
//				instance.productPropertyList.push(vmPrice);
//			}
			if($("#vm_privatenetwork").val() == "") {
				var networkoption = $("input[type='radio'][name='networkoption']:checked").val();
				if("createNew" == networkoption){
					var bw = {
							"muProperty" : "BAND_WIDTH",
							"muPropertyValue" : bandwidth,
							"productId": ipJson.product.productId
						};
					instance.productPropertyList.push(bw);
				}
			}			
			if(storageSize > 0){
				var disk = {
						"muProperty" : "storageSize",
						"muPropertyValue" : storageSize,
						"productId": vdiskJson.product.productId
					};
				instance.productPropertyList.push(disk);
			}
			
			return instance;
		},
		getVMFeeInstance4month : function(){
			var productId = parseInt(vmJson4Soft.productId);
			var os = $(".osList.selected span").attr("os");
//			var osValue = $(".osList.selected span").attr("value");
			var osValue = $("#osId").val();
			var oSDesc = $(".osList.selected span").text();
			var templateid = $(".osList.selected span").attr("value");
			var instanceName = $("#instanceName").val();
			var count = 1;
			var account = $("#ownUserAccount").val();
			var cpuNum = 0;
			var memorySize = 0;
			if($(".vm-type[data-value!='DIY']").hasClass("selected")){
				cpuNum = $("#vm-standard #cpu").html();
				memorySize = $("#vm-standard #memory").html();
			}
			else {
//				cpuNum = $(".cpu-options.selected").attr("data-value");
				cpuNum = $("#cpu").html();
//				memorySize = $(".memory-options.selected").attr("data-value");
				memorySize = $("#memory").html();
			}
			
			var serviceofferingid = VM4Soft.getServiceOfferingId(cpuNum, memorySize);
			var loginMode = $("input[type='radio'][name='loginMode']:checked").val();
			var keyPair = $("#keyPair").val();
			var bandwidth = $("#createBandwidthSize").val();
			var period = VM4Soft.createPeriodInput.getValue();
			var unit = $("#unit").val();
			var storageSize = $("#createDataDiskSize").val();
			var rootSize =  $("#createRootDiskSize").val();
			var rootMin = $("div#ostemplates div.selected>span:first").attr("mindisk");
			VM4Soft.defaultNetwork = VM4Soft.defaultNetwork || {id:0};	

			//如果是年，period * 12
			if(3 == $("#billType .selected").attr("data-value")){
				period = period * 12;
			};
			var _vmPrice = $("#vmPrice").val();
			var _vmPriceName = $("#vmPriceName").val();

			var instance = {
				"period" : 1,
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
						"muProperty" : _vmPriceName,
						"muPropertyValue" : _vmPrice,
						"productId" : productId
					}										
				] 

			};
			if($(".vm-type[data-value!='DIY']").hasClass("selected")){
				var value = $(".vm-type.selected").attr("vmprice");
				var productId = Number($(".vm-type.selected").attr("productid"));
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
			if($("#vm_privatenetwork").val() == "") {
				var networkoption = $("input[type='radio'][name='networkoption']:checked").val();
				if("createNew" == networkoption){
					var bw = {
							"muProperty" : "BAND_WIDTH",
							"muPropertyValue" : bandwidth,
							"productId": ipJson.product.productId
						};
					instance.productPropertyList.push(bw);
				}
			}			
			if(storageSize > 0){
				var disk = {
						"muProperty" : "storageSize",
						"muPropertyValue" : storageSize,
						"productId": vdiskJson.product.productId
					};
				instance.productPropertyList.push(disk);
			}
			
			return instance;
		},		
		getVMFeeInstance4change : function(){
			var productId = VM4Soft.getCheckedArr().parents("tr").attr("productId");
			var osValue = VM4Soft.getCheckedArr().parents("tr").attr("osId");
			var cpuNum = $("#myModal006change").find(".cpu-options.selected").attr("data-value");
			var memorySize = $("#myModal006change").find(".memory-options.selected").attr("data-value");
			var period = VM4Soft.getCheckedArr().parents("tr").attr("period");
			var vmPrice = VM4Soft.getCheckedArr().parents("tr").attr("vmPrice");
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
			var productId = parseInt(vmJson4Soft.productId);			
			var oSDesc = $(".osList.selected span").text();
//			var osDisk = $("#vm-standard #osDisk").html();
			var osDisk = $("#osDisk").html();
//			var templateid = $(".osList.selected span").attr("value");
			var templateid = $("#osId").val();
			var instanceName = "soft_vm";
			//var count = $.trim($("#count").val());
			var count = VM4Soft.createCountInput.getValue();
			var account = $("#ownUserAccount").val();
			var cpuNum = 0;
			var memorySize = 0;
			if($(".vm-type[data-value!='DIY']").hasClass("selected")){
				cpuNum = $("#vm-standard #cpu").html();
				memorySize = $("#vm-standard #memory").html();
			}
			else {
//				cpuNum = $(".cpu-options.selected").attr("data-value");
//				memorySize = $(".memory-options.selected").attr("data-value");
				cpuNum = $("#cpu").text();
				memorySize = $("#memory").text();

			}
			var serviceofferingid = VM4Soft.getServiceOfferingId(cpuNum, memorySize);
			var loginMode = $("input[type='radio'][name='loginMode']:checked").val();
			var keyPair = $("#keyPair").val();
			var bandwidth = $("#createBandwidthSize").val();
			var period = VM4Soft.createPeriodInput.getValue();
			var unit = $("#unit").val();
			var storageSize = $("#createDataDiskSize").val();
			var rootSize =  $("#createRootDiskSize").val();
			var rootMin = $("div#ostemplates div.selected>span:first").attr("mindisk");
			VM4Soft.defaultNetwork = VM4Soft.defaultNetwork || {id:0};
			var imageTemplateId = $(".osList.selected span").attr("imagetemplateid");
			
			//如果是年，period * 12
			if(3 == $("#billType .selected").attr("data-value")){
				period = period * 12;
			};
//			{"period":1,"count":1,"productList":[{"cpuNum":"1","memorySize":"4","OS":"1","instanceName":"","productId":101,"osDisk":"50","subNetId":"0","firewallRules":[]}]}
			var softwareid = "";
			if($(".version-option").hasClass("active")){
				softwareid = $(".version-option.active").val();
			}
			var _vmPrice = $("#vmPrice").val();
			var _vmPriceName = $("#vmPriceName").val();
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
							"subNetId" : "0",
							"vmPriceName" : _vmPriceName,
							"vmPrice" : _vmPrice,
							"swInfo" : softwareid
						}
					
//						{
//							"BAND_WIDTH":"5",
//							"instanceName":"",
//							"productId":productId
//						}
//						{
//							"instanceName " : "ebs_test_9",
//							"storageSize " : storageSize,
//							"productId":productId
//						}
					  ]
					};
			//选择镜像
			if($("a[href='#imageTab']").parent().hasClass("active")){
				instance.productList[0].imageTemplateId = imageTemplateId;	
			}
			
//			if($(".vm-type[data-value!='DIY']").hasClass("selected")){
//				productId = Number($(".vm-type.selected").attr("productid"));
//				var vmPrice = $(".vm-type.selected").attr("vmprice");
//				instance.productList[0].productId = productId;				
//			}
//			else {
//				instance.productList[0].osDisk = $("#vm-diy #osDisk").html();
//			}
			
			if($("#vm_privatenetwork").val() != "") {
				instance.productList[0].subNetId = $("#vm_privatenetwork").val();		
			} 
			else {
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
			}
			if(storageSize > 0){
				var storage = {
						"instanceName" : "storageDisk",	
						"storageSize" : storageSize,
						"productId" : vdiskJson.product.productId	
				};
				instance.productList.push(storage); 
			}
			
			this.getFirewallData(instance);
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
				"ip" : rule.ip
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
