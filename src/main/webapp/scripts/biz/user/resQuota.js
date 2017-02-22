window.currentInstanceType='resQuota';

$(function(){
	resQuota.init();
});
var product = {};

var resQuota = {
		service : com.skyform.service.resQuotaService,
		currentData:"",
		curUsername : "",
		curEmail : "",
		curMobile : "",
		curCustomerId :"",
		confirmModal : null,
		needNewProvider :"true",
		azSelect:null,
		areaJson:{},
		azId:"",
		isAzHidden:"false",
		init : function() {
			
			$(".isNew").hide();
			$(".isOld").hide();
			//根据域初始化下拉框
			resQuota.areaJson=Config.pools;
			resQuota.initPoolSelect();
			resQuota.initSelect();
			resQuota.initDeskSelect();
			$("#currPool").bind('change',function(){
				resQuota.setPools2Session();
			    window.location.reload();
			});
			$("#deskCloudArea").bind('change',function(){
				resQuota.getDeskPE();
			});
		},
		//  查询配额
		queryQuota : function() {	
			resQuota.needNewProvider = $("#needNewProvider").val();
			var loginName = $("#currUserName").val();
			resQuota.service.queryQuotaAllCount(loginName,resQuota.azId,function onSuccess(data){
//				if("true" == resQuota.needNewProvider){
//					$(".isNew").show();
//				}
//				else {
//					$(".isOld").show();
//				}
//				{"msg":"查询配额成功！","data":[{"osdisk":2,"cpu":2,"endDate":1414636657000,"mem":2,"loadbalance":2,"seqId":1,"wordorderid":"12345567677","bandwidth":2,"clouddesktop":2,"operatorId":11111,"startDate":1406774264000,"ip":2,"customerId":1234,"disksize":22,"modifyDate":1408588672000,"router":2,"createDate":1408588669000},{"osdisk":0,"cpu":2,"endDate":1579708800000,"mem":0,"loadbalance":0,"seqId":5,"wordorderid":"88","bandwidth":8,"clouddesktop":1,"type":"1","operatorId":123321,"startDate":1390406400000,"ip":0,"customerId":1234,"disksize":0,"router":0,"createDate":1411550087000}],"code":0}
//				[{"quotaTotal":{"bandwidth":2,"clouddesktop":2,"cpu":2,"createDate":1408588669000,"customerId":9,"disksize":22,"endDate":1414636657000,"ip":2,"loadbalance":2,"mem":2,"modifyDate":1408588672000,"operatorId":11111,"osdisk":2,"router":2,"seqId":1,"startDate":1406774264000,"wordorderid":"12345567677"},"quotaUesed":{"bandwidth":2,"clouddesktop":2,"cpu":2,"disksize":22,"ip":2,"loadbalance":2,"mem":2,"osdisk":2,"router":2}}]
				if(data&&data.length > 0&&data[0].quotaTotal){
					var osdisk = data[0].quotaTotal.osdisk;
					var cpu = data[0].quotaTotal.cpu;
					var mem = data[0].quotaTotal.mem;//(Number(data[0].quotaTotal.mem) /1024).toFixed(0);
					var loadbalance = data[0].quotaTotal.loadbalance;
					var bandwidth = data[0].quotaTotal.bandwidth;
					var ip = data[0].quotaTotal.ip;
					var disksize = data[0].quotaTotal.storageQuota?data[0].quotaTotal.storageQuota:data[0].quotaTotal.disksize;//总量使用storageQuota
					var router = data[0].quotaTotal.router;
					var volume = data[0].quotaTotal.volumeQuota;
					var network = data[0].quotaTotal.networkQuota;
					var serverQuota = data[0].quotaTotal.serverQuota;
					var image = data[0].quotaTotal.imageQuota;
					var use_osdisk = data[0].quotaUesed.osdisk;
					var use_cpu = data[0].quotaUesed.cpu;
					var use_mem = data[0].quotaUesed.mem;//(Number(data[0].quotaUesed.mem) /1024).toFixed(0);
					var use_loadbalance = data[0].quotaUesed.loadbalance;
					var use_bandwidth = data[0].quotaUesed.bandwidth;
					var use_ip = data[0].quotaUesed.ip;
					var use_disksize = data[0].quotaUesed.disksize;
					var use_router = data[0].quotaUesed.router;
//					var use_volume = 0;//data[0].quotaUesed.osdisk;
//					var use_network = 0;//data[0].quotaUesed.network;
					
					var use_volume = data[0].quotaUesed.volumeQuota;
					var use_network = data[0].quotaUesed.networkQuota;
					var use_serverQuota = data[0].quotaUesed.serverQuota;
					var use_image = 0;//data[0].quotaUesed.network;
//					if("true" == resQuota.needNewProvider){
//						use_disksize += use_osdisk; //新池使用量为os+disk
//						//disksize += osdisk;
//					}

					if(!resQuota.isAzHidden){
						use_disksize += use_osdisk; //新池使用量为os+disk
						//disksize += osdisk;
					}
					
					$("#totalCpu").text(cpu);
					$("#totalLB").text(loadbalance);
					$("#totalMem").text(mem);
					$("#totalRoute").text(router);
					$("#totalOsdisk").text(osdisk);
					$("#totalIP").text(ip);
					$("#totalDiskSize").text(disksize);
					$("#totalBandwidth").text(bandwidth);
					$("#totalVolume").text(volume);
					$("#totalNetwork").text(network);
					$("#totalServerQuota").text(serverQuota);
					$("#totalImage").text(image);
					
					$("#usedCpu").text(use_cpu);
					$("#usedLB").text(use_loadbalance);
					$("#usedMem").text(use_mem);
					$("#usedRoute").text(use_router);
					$("#usedOsdisk").text(use_osdisk);
					$("#usedIP").text(use_ip);
					$("#usedDiskSize").text(use_disksize);
					$("#usedBandwidth").text(use_bandwidth);
					$("#usedVolume").text(use_volume);
					$("#usedNetwork").text(use_network);
					$("#usedServerQuota").text(use_serverQuota);
					$("#usedImage").text(use_image);

					
					var per_osdisk = use_osdisk/data[0].quotaTotal.osdisk*100;
					var per_cpu = use_cpu/data[0].quotaTotal.cpu*100;
					var per_mem = use_mem *100/data[0].quotaTotal.mem; //((Number(data[0].quotaTotal.mem)/1024).toFixed(0));
					var per_loadbalance = use_loadbalance/data[0].quotaTotal.loadbalance*100;
					var per_bandwidth = use_bandwidth/data[0].quotaTotal.bandwidth*100;
					var per_ip = use_ip/data[0].quotaTotal.ip*100;
					var per_disksize = use_disksize/disksize*100;
					var per_router = use_router/data[0].quotaTotal.router*100;					
					var per_volume = use_volume/data[0].quotaTotal.volumeQuota*100;
					var per_network = use_network/data[0].quotaTotal.networkQuota*100;
					var per_serverQuota = use_serverQuota/data[0].quotaTotal.serverQuota*100;
					var per_image = use_image/data[0].quotaTotal.imageQuota*100;
					
					$("#bar_cpu").attr("style","width: "+per_cpu+"%");
					$("#bar_LB").attr("style","width: "+per_loadbalance+"%");
					$("#bar_mem").attr("style","width: "+per_mem+"%");
					$("#bar_route").attr("style","width: "+per_router+"%");
					$("#bar_osDisk").attr("style","width: "+per_osdisk+"%");
					$("#bar_ip").attr("style","width: "+per_ip+"%");
					$("#bar_diskSize").attr("style","width: "+per_disksize+"%");
					$("#bar_bindwidth").attr("style","width: "+per_bandwidth+"%");
					$("#bar_volume").attr("style","width: "+per_volume+"%");
					$("#bar_network").attr("style","width: "+per_network+"%");
					$("#bar_serverQuota").attr("style","width: "+per_serverQuota+"%");
					$("#bar_image").attr("style","width: "+per_image+"%");
					
				}
				else {
					$.growlUI(Dict.val("common_tip"), "请联系管理员分配配额！"); 
				}
			},function onError(msg){
				$.growlUI(Dict.val("common_tip"), Dict.val("common_query_error") + msg); 
			});
		},
//		initSelect2 : function(){
//			var dataArea={
//					"sjzzwy":[
//								{"name":"互联网","value":"df198da4-7e90-4fae-b891-78ee413674a5"},
//								{"name":"政务外网","value":"e1f1e822-3116-43ee-814b-83cb6365b6bf"},
//								],
//					"bdzhcs":[
//								{"name":"互联网","value":"0071925c-0485-4a4c-ada5-ca90b4f91e06"},
//								{"name":"政务外网","value":"a6f16fdc-d10a-4c1b-8c17-ab6bd9c81167"},
//								{"name":"政务内网","value":"f9981bdc-03e2-4856-aaf2-6360101cffd7"},
//								],
//					"neimengguhuanbaoyun":[
//                                {"name":"政务网资源池","value":"65822710-100f-4ceb-b87c-dca8acaa5ea2"},
//                                {"name":"互联网资源池","value":"6b835bee-5bfa-4a82-8871-5e64996134d7"},           
//					],
//					"shandongzaozhuang":[
//                                {"name":"政务内网","value":"309b3469-fac7-4899-850b-9e0d36dd8b40"},
//                                {"name":"互联网","value":"cd6094bd-1644-4118-a2fe-89a0834f9bfb"},           
//					],
//					
//			};
//			
//			var sName=$("#curResourcePool").val();
//			var arr=dataArea[sName];
//			
//			if(arr){
//				
//			$(".areaCenter").show();
//			
//			for (var i=0; i<arr.length; i++)
//			{
//				var oNew=new Option();
//				
//				oNew.text=arr[i].name;
//				oNew.value=arr[i].value;
//				
//				$('#areaSelect').append(oNew);
//			}
//			
//			}
//		},
		initSelect : function(){
			
			resQuota.azSelect = new com.skyform.component.AZSelect("selectDiv","azDiv","resQuota",function(){
//				if(!resQuota.azSelect.showValidateAZSelect()){
//					return;
//				}
				resQuota.azId=resQuota.azSelect.getAzSelectValue();
				//console.log(resQuota.azId);
				resQuota.queryQuota();
				resQuota.isAzHidden=$("#azDiv").is(":hidden");
				if(!resQuota.isAzHidden){
					$(".isNew").show();
				}
				else {
					$(".isOld").show();
				}
			});
			$("#azSelect").on('change',function(){
				resQuota.azId=resQuota.azSelect.getAzSelectValue();
				resQuota.queryQuota();
			});
		},
		initPoolSelect:function(){
			var curPool=$("#curResourcePool").val();
			Dcp.biz.getCurrentUser(function(data){
				if(data){
					resQuota.currentData = data;
					resQuota.curCustomerId =data.id;
				};
				var tempData=resQuota.currentData.resourcePool.split(',');
				$.each(tempData,function(index,i){
					var oNew=new Option();
					oNew.value=i;
					oNew.text=resQuota.areaJson[i];
					var pool = Dcp.hidePool(oNew.value);
					if(!pool)	return;
					$("#currPool").append(oNew);
				});
				$("#currPool").find("option[value='"+curPool+"']").attr('selected',true);
			});
		},
		initDeskSelect:function(){
			var params={"serviceType":1015,"pool":"langfangk","billType":5};
			var areaInfo={};
			com.skyform.service.desktopCloudService.queryDesktopConfigInfo(params,function(result){
				var poolInfoArray=result.resoucepool;
				
				$("#deskCloudArea").empty();
				$.each(poolInfoArray?poolInfoArray:[],function(key,value){
					areaInfo[value.name]=value.serviceFactroy;
					var option=$("<option></option>");
					$(option).attr("value",value.name);
					$(option).attr("productId",value.productId);
					$(option).attr("desc",value.desc);
					$(option).attr("serviceFactroy",value.serviceFactroy);
					$(option).html(value.desc);
					$("#deskCloudArea").append(option);
				});
//				var paraData={
//						"ddcId":$("#deskCloudArea").val(),
//						"customerId":resQuota.curCustomerId.toString(),
//					};
//			    resQuota.getDeskPE(paraData);
				resQuota.getDeskPE();
			},function(data){
				    
			});
			
		},
		getDeskPE:function(){
			var para={
					"ddcId":$("#deskCloudArea").val(),
					"customerId":resQuota.curCustomerId.toString(),
				};
				com.skyform.service.desktopCloudService.getCloudTabQuoTa(para,function(data){
					if(data&&data.length > 0){
					//var tmpData=result.data;
					var deskCloudTotal = data[0].quotaSize;
					var deskCloudUsed = data[0].quotaUsed;
					$("#used_deskCloud").text(deskCloudUsed);
					$("#total_deskCloud").text(deskCloudTotal);
					var per_deskCloud = deskCloudUsed/deskCloudTotal*100;
					$("#bar_deskCloud").attr("style","width: "+per_deskCloud+"%");
					}
				},function(data){
					//System.notifyError("桌面云配额查询失败！");
					$.growlUI("桌面云配额查询失败！");
				});
		},
		setPools2Session:function(){
				var pool = $("#currPool").val();
				var data = JSON.stringify({
			        		SESSION_RES_POOL: pool
		            }); 
				$.ajax({
			        	url : "/portal/pr/changeResPool?SESSION_RES_POOL="+pool,
			    	    data : data,
			    	    type : "POST",
			    	    dataType:'json',
			    	    async : false,
			    	    success : function(state) {
				        	if(state == 0){
				        		return;
							}
			    	    },
			    	    error : function() {
			    		}
			    	 });	
			},
};
