vmJson = {
	 product: 0,
	 oslist : {},
	 vmConfig : {},
	 batchOSList : {},
	 trans4OS :function(){
		 var osList = [];
		 $.each(this.oslist,function(index,item){
			var os = {};
			os.id =  item.value;
			os.name = item.desc;
			os.mindisk = item.osDiskSizeMin;
			os.ostypename = item.desc;
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
				osList.push(os);
			}
		});
		return osList;
	},
	batchTrans4OSByPool : function(os,pool) {
		var osList = [];
		$.each(os, function(index, item) {
			if (item.resourcePool&&item.resourcePool.length>0) {
				$(item.resourcePool).each(function(j, p) {
					if (pool == p.name) {
						var os = {};
						os.id = item.value;
						os.name = item.desc;
						os.mindisk = item.osDiskSizeMin;
						os.ostypename = item.desc;
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
					if(m.name!='微型')
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
								if(m.name!='微型')
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
						if(m.name!='微型')
							ServiceOfferingsList.push(offer);
					}
				})		
				
		 }); 
		 return ServiceOfferingsList;
	 },	

		getVMFeeInstance : function(){
			var productId = vmJson.productId;
			var os = $(".osList.selected span").attr("os");
			var osValue = $(".osList.selected span").attr("value");
			var oSDesc = $(".osList.selected span").text();
			var templateid = $(".osList.selected span").attr("value");
			var instanceName = $("#instanceName").val();
			//var count = $.trim($("#count").val());
			var count = VM.createCountInput.getValue();
			var account = $("#ownUserAccount").val();
			var cpuNum = 0;
			var memorySize = 0;
			if($(".vm-type[data-value!='DIY']").hasClass("selected")){
				cpuNum = $("#vm-standard #cpu").html();
				memorySize = $("#vm-standard #memory").html();
			}
			else {
				cpuNum = $(".cpu-options.selected").attr("data-value");
				memorySize = $(".memory-options.selected").attr("data-value");
			}
			
			var serviceofferingid = VM.getServiceOfferingId(cpuNum, memorySize);
			var loginMode = $("input[type='radio'][name='loginMode']:checked").val();
			var keyPair = $("#keyPair").val();
			var bandwidth = $("#createBandwidthSize").val();
			var period = VM.createPeriodInput.getValue();
			var unit = $("#unit").val();
			var storageSize = $("#createDataDiskSize").val();
			var bandwidthSize = $("#acreateBandwidthSize").val();
			var rootSize =  $("#createRootDiskSize").val();
			var rootMin = $("div#ostemplates div.selected>span:first").attr("mindisk");
			VM.defaultNetwork = VM.defaultNetwork || {id:0};

			//如果是年，period * 12
			if(3 == $("#billType .selected").attr("data-value")){
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
			//vps
			if(!$("#privateNetwork-tab").hasClass("active")){
				console.log($("#acreateBandwidthSize").val()+"2")
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
				if($("#vm_privatenetwork").val()) {
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
			}else if($("#privateNetwork-tab").hasClass("active")){
				console.log($("#acreateBandwidthSize").val()+"1")
				if($("#basicNetwork-tab").hasClass("active")){
					console.log($("#acreateBandwidthSize").val()+"3")
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
					if(storageSize > 0){
						var disk = {
							"muProperty" : "storageSize",
							"muPropertyValue" : storageSize,
							"productId": vdiskJson.product.productId
						};
						instance.productPropertyList.push(disk);
					}
				}

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
                if(storageSize > 0){
                    var disk = {
                        "muProperty" : "storageSize",
                        "muPropertyValue" : storageSize,
                        "productId": vdiskJson.product.productId
                    };
                    instance.productPropertyList.push(disk);
                }
				var bw1 = {
					"muProperty" : "BAND_WIDTH",
					"muPropertyValue" : $("#acreateBandwidthSize").val(),
					"productId": ipJson.product.productId
				};
				instance.productPropertyList.push(bw1);

            }


//			if($("#vm_privatenetwork option:selected").attr("relStatus") != "9"&&"createNew" == networkoption){
//				var _route = {
//						"muProperty" : "routerPrice",
//						"muPropertyValue" : "1",
//						"productId": VM.routeProductId
//				};
//				instance.productPropertyList.push(_route);
//			}

			return instance;
		},
    getVMFeeInstance_type : function(){
        var productId = vmJson.productId;
        var os = $(".osList.selected span").attr("os");
        var osValue = $(".osList.selected span").attr("value");
        var oSDesc = $(".osList.selected span").text();
        var templateid = $(".osList.selected span").attr("value");
        var instanceName = $("#instanceName").val();
        //var count = $.trim($("#count").val());
        var count = VM.createCountInput.getValue();
        var account = $("#ownUserAccount").val();
        var cpuNum = 0;
        var memorySize = 0;
        if($(".vm-type[data-value!='DIY']").hasClass("selected")){
            cpuNum = $("#vm-standard #cpu").html();
            memorySize = $("#vm-standard #memory").html();
        }
        else {
            cpuNum = $(".cpu-options.selected").attr("data-value");
            memorySize = $(".memory-options.selected").attr("data-value");
        }

        var serviceofferingid = VM.getServiceOfferingId(cpuNum, memorySize);
        var loginMode = $("input[type='radio'][name='loginMode']:checked").val();
        var keyPair = $("#keyPair").val();
        var bandwidth = $("#createBandwidthSize").val();
        var period = VM.createPeriodInput.getValue();
        var unit = $("#unit").val();
        var storageSize = $("#createDataDiskSize").val();
        var bandwidthSize = $("#acreateBandwidthSize").val();
        var rootSize =  $("#createRootDiskSize").val();
        var rootMin = $("div#ostemplates div.selected>span:first").attr("mindisk");
        VM.defaultNetwork = VM.defaultNetwork || {id:0};

        //如果是年，period * 12
        if(3 == $("#billType .selected").attr("data-value")){
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
        if($("#vm_privatenetwork").val()) {
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

//			if($("#vm_privatenetwork option:selected").attr("relStatus") != "9"&&"createNew" == networkoption){
//				var _route = {
//						"muProperty" : "routerPrice",
//						"muPropertyValue" : "1",
//						"productId": VM.routeProductId
//				};
//				instance.productPropertyList.push(_route);
//			}

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
			var oSDesc = $(".osList.selected span").text();
			var osDisk = $("#vm-standard #osDisk").html();
			var templateid = $(".osList.selected span").attr("value");
			var instanceName = $(".wizard-card #instanceName").val();
			//var count = $.trim($("#count").val());
			var count = VM.createCountInput.getValue();
			var account = $("#ownUserAccount").val();
			var cpuNum = 0;
			var memorySize = 0;
			if($(".vm-type[data-value!='DIY']").hasClass("selected")){
				cpuNum = $("#vm-standard #cpu").html();
				memorySize = $("#vm-standard #memory").html();
			}
			else {
				cpuNum = $(".cpu-options.selected").attr("data-value");
				memorySize = $(".memory-options.selected").attr("data-value");
			}
			var serviceofferingid = VM.getServiceOfferingId(cpuNum, memorySize);
			var loginMode = $("input[type='radio'][name='loginMode']:checked").val();
			var keyPair = $("#keyPair").val();
			var bandwidth = $("#createBandwidthSize").val();
			var period = VM.createPeriodInput.getValue();
			var unit = $("#unit").val();
			var storageSize = $("#createDataDiskSize").val();
			var rootSize =  $("#createRootDiskSize").val();
			var rootMin = $("div#ostemplates div.selected>span:first").attr("mindisk");
			var basicNet = $("#acreateBandwidthSize").val();
			//var privateNet = $("#vm_privatenetwork option:selected").text();
			VM.defaultNetwork = VM.defaultNetwork || {id:0};
			var imageTemplateId = $(".osList.selected span").attr("imagetemplateid");
			//如果是年，period * 12
			if(3 == $("#billType .selected").attr("data-value")){
				period = period * 12;
			}

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
						/*"bandwidth_tx":'',*/
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
			var availableZoneId = VM.azSelect.getAzSelectValue();
			if(availableZoneId && availableZoneId != 0){
				instance.availableZoneId = availableZoneId;
			}
			/*com.skyform.service.vmService.queryAZAndAzQuota($("#pool").val(),function(data){
			 var zoneName = "";
			 if(data.length>0){
			 zoneName=data[0].availableZoneId;
			 $.each(data,function(key,value){
			 if(value.isQuotaExist==1){
			 zoneName=value.availableZoneId;
			 }
			 });
			 }
			 instance.availableZoneId=zoneName;
			 });*/
			//选择镜像
			var mirrorType=$(".mirrorType .selected").attr("mirrorType");
			if(mirrorType=="identify"){
				instance.productList[0].imageTemplateId = imageTemplateId;
			}

			if($(".vm-type[data-value!='DIY']").hasClass("selected")){
				productId = Number($(".vm-type.selected").attr("productid"));
				var vmPrice = $(".vm-type.selected").attr("vmprice");
				instance.productList[0].productId = productId;
			}
			else {
				instance.productList[0].osDisk = $("#vm-diy #osDisk").html();
			}
			//选择网络vps
			if ($("#privateNetwork").hasClass("active")){
				var resourcePool=$("#pool").val();
				var subscriptionId="";
				/*VM.service.bandwidthPool(resourcePool,function(data){
				 subscriptionId=data[0].subscriptionId;
				 });*/

				/*var instanceBasicNetwork={ "resourcePool":resourcePool };
				 com.skyform.service.vmService.queryFreeBasicNetworkIp(instanceBasicNetwork,function onSuccess(data) {
				 subscriptionId=data[0].subscriptionId;
				 },function onError(data) {});*/

				com.skyform.service.vmService.queryFreeBasicNetworkIp({ "resourcePool":$("#pool").val() },function onSuccess(data) {
					$(data.data).each(function(index,item){
						if(item.totalIpCount<=item.usedIpCount){
							//禁止基础网络
						}else{
							subscriptionId=item.subscriptionId;

							return false;
						}
					})
				},function onError(data) {
					//禁止基础网络

				});
				bandwidth_tx=Number($("#acreateBandwidthSize").val());
				/*var bandwidth_tx="";
				bandwidth_tx=Number($("#acreateBandwidthSize").val());
				instance.productList[0].subNetId=subscriptionId;
				instance.productList[0].bandwidth_tx=bandwidth_tx;*/
				var bw = {
					"instanceName" : "bandwidth",
					"BAND_WIDTH" : bandwidth_tx,
					"productId" : ipJson.product.productId,
					"serviceType":CommonEnum.serviceType["ip"]
				}
				instance.productList.push(bw) ;

			}else {
				if($("#vm_privatenetwork").val() != "") {
					instance.productList[0].subNetId = $("#vm_privatenetwork").val();
				}
				else  {
					var networkoption = $("input[type='radio'][name='networkoption']:checked").val();
					if("useExisted" == networkoption) {
						if($("#existed_ips").val() != "") {
							instance.productList[0].bindId = $("#existed_ips").val();
						}
					} else if("createNew" == networkoption){
						var bw = {
							"instanceName" : "bandwidth",
							"BAND_WIDTH" : bandwidth,
							"productId" : ipJson.product.productId,
							"serviceType":CommonEnum.serviceType["ip"]
						}
						instance.productList.push(bw) ;
					}
				}
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
					"serviceType":CommonEnum.serviceType["vdisk"]
				};
				instance.productList.push(storage);
			}
//			if("createNew" == networkoption){
//				if($("#vm_privatenetwork option:selected").attr("routerid") == "undefined"){
//					var route = {
//						"ROUTER" : "1",
//						"productId" : VM.routeProductId,
//						"resourcePool" : $("#pool").val()
//					}
//					instance.productList.push(route);
//				}
//				else{
//					var route = {
//						"ROUTER" : "1",
//						"productId" : VM.routeProductId,
//						"routerId" : $("#vm_privatenetwork option:selected").attr("routerid")
//					}
//					instance.productList.push(route);
//				}
//			}
			this.getFirewallData(instance);
			return instance;
	},
	getVM4JsonInstanceForVps : function(){
		var productId = vmJson.productId;
		var oSDesc = $(".osList.selected span").text();
		var osDisk = $("#vm-standard #osDisk").html();
		var templateid = $(".osList.selected span").attr("value");
		var instanceName = $(".wizard-card #instanceName").val();
		//var count = $.trim($("#count").val());
		var count = VM.createCountInput.getValue();
		var account = $("#ownUserAccount").val();
		var cpuNum = 0;
		var memorySize = 0;
		if($(".vm-type[data-value!='DIY']").hasClass("selected")){
			cpuNum = $("#vm-standard #cpu").html();
			memorySize = $("#vm-standard #memory").html();
		}
		else {
			cpuNum = $(".cpu-options.selected").attr("data-value");
			memorySize = $(".memory-options.selected").attr("data-value");
		}
		var serviceofferingid = VM.getServiceOfferingId(cpuNum, memorySize);
		var loginMode = $("input[type='radio'][name='loginMode']:checked").val();
		var keyPair = $("#keyPair").val();
		var bandwidth = $("#createBandwidthSize").val();
		var period = VM.createPeriodInput.getValue();
		var unit = $("#unit").val();
		var storageSize = $("#createDataDiskSize").val();
		var rootSize =  $("#createRootDiskSize").val();
		var rootMin = $("div#ostemplates div.selected>span:first").attr("mindisk");
		var basicNet = $("#acreateBandwidthSize").val();
		//var privateNet = $("#vm_privatenetwork option:selected").text();
		VM.defaultNetwork = VM.defaultNetwork || {id:0};
		var imageTemplateId = $(".osList.selected span").attr("imagetemplateid");
		//如果是年，period * 12
		if(3 == $("#billType .selected").attr("data-value")){
			period = period * 12;
		}
		var instance="";
		if($("#privateNetwork").hasClass("active")){
			instance = {
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
						"bandwidth_tx":'',
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
		}else {
			instance = {
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
		}
		var availableZoneId = VM.azSelect.getAzSelectValue();
		if(availableZoneId && availableZoneId != 0){
			instance.availableZoneId = availableZoneId;
		}
		/*com.skyform.service.vmService.queryAZAndAzQuota($("#pool").val(),function(data){
		 var zoneName = "";
		 if(data.length>0){
		 zoneName=data[0].availableZoneId;
		 $.each(data,function(key,value){
		 if(value.isQuotaExist==1){
		 zoneName=value.availableZoneId;
		 }
		 });
		 }
		 instance.availableZoneId=zoneName;
		 });*/
		//选择镜像
		var mirrorType=$(".mirrorType .selected").attr("mirrorType");
		if(mirrorType=="identify"){
			instance.productList[0].imageTemplateId = imageTemplateId;
		}

		if($(".vm-type[data-value!='DIY']").hasClass("selected")){
			productId = Number($(".vm-type.selected").attr("productid"));
			var vmPrice = $(".vm-type.selected").attr("vmprice");
			instance.productList[0].productId = productId;
		}
		else {
			instance.productList[0].osDisk = $("#vm-diy #osDisk").html();
		}
		//选择网络vps
		if ($("#privateNetwork").hasClass("active")){
			var resourcePool=$("#pool").val();
			var subscriptionId="";
			/*VM.service.bandwidthPool(resourcePool,function(data){
			 subscriptionId=data[0].subscriptionId;
			 });*/

			/*var instanceBasicNetwork={ "resourcePool":resourcePool };
			 com.skyform.service.vmService.queryFreeBasicNetworkIp(instanceBasicNetwork,function onSuccess(data) {
			 subscriptionId=data[0].subscriptionId;
			 },function onError(data) {});*/

			com.skyform.service.vmService.queryFreeBasicNetworkIp({ "resourcepool":$("#pool").val() },function onSuccess(data) {
				$(data.data).each(function(index,item){
					if(item.totalIpCount<=item.usedIpCount){
						//禁止基础网络
					}else{
						subscriptionId=item.subscriptionId;

						return false;
					}
				})
			},function onError(data) {
				//禁止基础网络

			});
			var bandwidth_tx="";
			bandwidth_tx=Number($("#acreateBandwidthSize").val());
			instance.productList[0].subNetId=subscriptionId;
			instance.productList[0].bandwidth_tx=bandwidth_tx;

		}else {
			if($("#vm_privatenetwork").val() != "") {
				instance.productList[0].subNetId = $("#vm_privatenetwork").val();
			}
			else  {
				var networkoption = $("input[type='radio'][name='networkoption']:checked").val();
				if("useExisted" == networkoption) {
					if($("#existed_ips").val() != "") {
						instance.productList[0].bindId = $("#existed_ips").val();
					}
				} else if("createNew" == networkoption){
					var bw = {
						"instanceName" : "bandwidth",
						"BAND_WIDTH" : bandwidth,
						"productId" : ipJson.product.productId,
						"serviceType":CommonEnum.serviceType["ip"]
					}
					instance.productList.push(bw) ;
				}
			}
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
				"serviceType":CommonEnum.serviceType["vdisk"]
			};
			instance.productList.push(storage);
		}
//			if("createNew" == networkoption){
//				if($("#vm_privatenetwork option:selected").attr("routerid") == "undefined"){
//					var route = {
//						"ROUTER" : "1",
//						"productId" : VM.routeProductId,
//						"resourcePool" : $("#pool").val()
//					}
//					instance.productList.push(route);
//				}
//				else{
//					var route = {
//						"ROUTER" : "1",
//						"productId" : VM.routeProductId,
//						"routerId" : $("#vm_privatenetwork option:selected").attr("routerid")
//					}
//					instance.productList.push(route);
//				}
//			}
		this.getFirewallData(instance);
		return instance;
	},
	getFirewallData : function(instance){
		instance.productList[0].firewallRules = [];
//		instance.productList[0].firewallRules.push(tcp_egress);//将默认屏蔽
//		instance.productList[0].firewallRules.push(udp_egress);
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

vm4quickJson = {
		vmQuickConfig : {},
		 trans4ServiceOfferings4quick : function(){
			 var ServiceOfferingsList4quick = [];
			 $.each(this.vmQuickConfig,function(index,item){				
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
						offer.os = m.os;
						offer.os_desc = m.os_desc;
						if(m.name!='微型')
							ServiceOfferingsList4quick.push(offer);
					});		
					
			 }); 
			 return ServiceOfferingsList4quick;
		 },
			getVMFee4quick : function(){				
//				var count = VM.createCountInput.getValue();				
				var cpuNum = $("#vm-quick #cpu4quick").html();
				var memorySize = $("#vm-quick #memory4quick").html();
				var period = VM4quick.createPeriodInput4quick.getValue();
				var unit = $("#unit").val();
				var storageSize = $("#vm-quick #osDisk4quick").html();				
//				VM.defaultNetwork = VM.defaultNetwork || {id:0};	

				//如果是年，period * 12
				if(3 == $("#billType .selected").attr("data-value")){
					period = period * 12;
				};
				
//				{"period":1,"productPropertyList":
//					[{"muProperty":"cpuNum","muPropertyValue":"1","productId":112},{"muProperty":"memorySize","muPropertyValue":"1","productId":112},{"muProperty":"OS","muPropertyValue":"5","productId":112},{"muProperty":"vmPrice","muPropertyValue":"1","productId":112}]}
				
				var productId = 0;
				var osId = 0;
				var vmPrice = 0;
				if($(".quick-vm-ul li.vm-tab").hasClass("active")){
					productId = Number($(".quick-vm-ul li.vm-tab.active").attr("productid"));
					osId = $(".quick-vm-ul li.vm-tab.active").attr("osid");
					vmPrice = $(".quick-vm-ul li.vm-tab.active").attr("vmPrice");
				}
				
				var instance = {
					"period" : period,
					"productPropertyList":[					
						{
							"muProperty" : "cpuNum",     //cpuNum
							"muPropertyValue" : cpuNum,
							"productId" : productId
						},
						{
							"muProperty" : "memorySize",      //memorySize
							"muPropertyValue" : memorySize,
							"productId" : productId
						},
//						{
//							"muProperty" : "storageSize",
//							"muPropertyValue" : storageSize,
//							"productId" : productId
//						},
						{
							"muProperty" : "OS",
							"muPropertyValue" : osId,
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
			getVM4JsonInstance4quick : function(){
				var osDisk = $("#vm-quick #osDisk4quick").html();
				var instanceName = $("#instanceName4quick").val();
//				var count = VM.createCountInput.getValue();
				var cpuNum = $("#vm-quick #cpu4quick").html();
				var memorySize = $("#vm-quick #memory4quick").html();
				var period = VM4quick.createPeriodInput4quick.getValue();
				var unit = $("#unit").val();
				//如果是年，period * 12
				if(3 == $("#billType .selected").attr("data-value")){
					period = period * 12;
				};
				var productId = 0;
				var osId = 0;
				if($(".quick-vm-ul li.vm-tab").hasClass("active")){
					productId = Number($(".quick-vm-ul li.vm-tab.active").attr("productid"));
					osId = Number($(".quick-vm-ul li.vm-tab.active").attr("osid"));
				}				
//				{"period":1,"count":1,"productList":[{"cpuNum":"1","memorySize":"0.5","OS":"1","instanceName":"","productId":101,"osDisk":"20","subNetId":"0","firewallRules":[]}]}
				var instance = {
						"period" : period,
						"count" : 1,
						"productList" : [
							{
								"cpuNum" : cpuNum,
								"memorySize" : memorySize,
								"OS" : osId,
								"instanceName" : instanceName,
								"productId" : productId,
								"osDisk" : osDisk,
								"subNetId" : "0",
								"firewallRules":[]
							},				
						  ]
						};				
				return instance;
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
};
var tcp_egress = {
		"direction":"egress",
		"name":"TCP上行",
		"port":"1-65535",
		"protocol":"tcp",
		"ip" :""		
	};
var udp_egress = {
	"direction":"egress",
	"name":"UDP上行",
	"port":"1-65535",
	"protocol":"udp",
	"ip" :""		
};
