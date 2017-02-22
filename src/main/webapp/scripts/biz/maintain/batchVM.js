var obj = "#configModal ";
//window.Controller = {
//		init : function(){
//			BatchVM.init();			
//		}		
//	};
var BatchVM = {	
	configModal:null,
	updateConfigModal:null,
	selectedInstanceId:0,
	defaultSG:0,//69293583,
	azSelect:null,
	init:function(){
		if(CommonEnum.offLineBill){
			$(".public_display_private_not").css("display","none");	
		}
		
		BatchVM.createPeriodInput = null;
		if (BatchVM.createPeriodInput == null) {
			var container = $(obj+"#batch_period").empty();				
			var max = 12;
			BatchVM.createPeriodInput = new com.skyform.component.RangeInputField(container, {
				min : 1,
				defaultValue : 1,
				max:max,
				textStyle : "width:40px",
				isInput:false
			}).render();
			BatchVM.createPeriodInput.reset();				
		}	
		// 带+-的输入框
		BatchVM.createCountInput = null;
		if (BatchVM.createCountInput == null) {
			var container = $(obj+"#batch_count").empty();
//			com.skyform.service.Eip.queryEnoughIP(function(enough){
			var max = 10;
			BatchVM.createCountInput = new com.skyform.component.RangeInputField(container, {
				min : 1,
				defaultValue : 1,
				max:max,
				textStyle : "width:40px",
				isInput:false
			}).render();
			BatchVM.createCountInput.reset();
		}
		$("#batch_instanceName").blur(function(){
			BatchVM.checkInstanceName($(obj+"#batch_instanceName").val());
		}).focus(function(){
			$("#batch_errorTip").removeClass("onError").empty();
		});
		
		$(".batchFee").bind('mouseup keyup',function(){
			setTimeout('BatchVM.getFee()',5);
		});
		
		$("#buy").bind("click",function(){
			$("#buy").addClass("disabled").empty().html(Dict.val("common_submiting"));
			var instance = BatchVM.getVM4JsonInstance();			
			com.skyform.service.vmService.createInstance(instance, function onCreated(instance){
				//订单提交成功后校验用户余额是否不足
				var _tradeId = instance.tradeId;
				var _fee = $(obj+".batchPrice").html();			
				com.skyform.service.BillService.wizardConfirmTradeSubmit2(_fee,_tradeId,null,function onSuccess(data){
					$("#buy").removeClass("disabled").empty().html(Dict.val("dc_buy_now"));	
					$.growlUI(Dict.val("common_tip"), Dict.val("vm_application_submitted"));
				},function onError(msg){
					$.growlUI(Dict.val("common_tip"), Dict.val("vm_application_vm_submitted_fails"));
				});
			},function onError(msg){
				$.growlUI(Dict.val("common_tip"), Dict.val("common_create_filing_failure")+ msg);
			});
		});
		
			$("#go").bind("click",function(){
				window.location.assign("vm.jsp?code=vm");
			})
		
		BatchVM.getBillTypeList(obj);
		BatchVM.bindEventForImageDivButton(obj);
		BatchVM.bindEventForConfigDivButton(obj);	
		BatchVM.getFee();
		BatchVM.azSelect = new com.skyform.component.AZSelect("selectDivBatch","azDivBatch");
		BatchVM.azSelect.setSelectWidth(220);
	},

	validateAZone:function(){
		if(!$("#azDivBatch").is(':hidden')){
			if(!BatchVM.azSelect.showValidateAZSelect()){
				result.status = false;
			}
		}
		return result;
	},
	getFee : function(){
		if(CommonEnum.offLineBill)return;
		var period = BatchVM.createPeriodInput.getValue();
		var count = BatchVM.createCountInput.getValue();
		var param = BatchVM.getVMFeeInstance(obj);
		Dcp.biz.apiAsyncRequest("/pm/queryCaculateFeeByPrtyList",param, function(data) {
			if(null!=data&&0 == data.code){
				var count = BatchVM.createCountInput.getValue()
				var fee =  data.data.fee;
				//$("#feeInput").val(count * fee/feeUnit);
				$(".batchPrice").empty().html(count * fee/feeUnit);
			}
		});
	},	
	
	openBatch:function(){
		BatchVM.defaultSG = 0;
		//因为现在虚拟机创建时可以不需要安全组,所以这个方法应该是没有意义的但是不知道是不是会对后面的代码产生影响,暂时不删除
		VM.service.getDefaultSG(function(result){
			if(result){
				if("opening"!=result.subServiceStatus){
					BatchVM.defaultSG = result.subscriptionId;
				}
			}
			//else BatchVM.createDefaulteSG();
		});
		if (!BatchVM.configModal) {
			var modalId = new Date().getTime(); 
			BatchVM.configModal = new com.skyform.component.Modal(
					modalId,	Dict.val("vm_bulk_create_cloud_hosting"),
					"",
					{
						buttons : [
								{
									name : Dict.val("common_save"),
									onClick : function() {
										$("#batch_instanceName").trigger('blur');
										var numError = $(obj + '.onError').length;
										if (numError) {
											return;
										}
										;
										if ($.inArray($("#pool").val(), $(Config.k_pool.split(","))) > -1) {
											if ($("#sgTable_batch").val() == "") {
												$.growlUI(Dict.val("common_tip"), "请选择安全组或先去创建安全组");
												return;
											}
										}
										//因为现在虚拟机创建时可以需要安全组,所以这个方法放开star
										//if(BatchVM.defaultSG==0){
										//	VM.service.getDefaultSG(function(result){
										//		if(result&&"opening"!=result.subServiceStatus){
										//			BatchVM.defaultSG = result.subscriptionId;
										//			$(".modal-footer").show();
										//			$("#batch_errorTip").removeClass("onError").empty();
										//		}
										//		else {
										//			$(".modal-footer").hide();
										//			$("#batch_errorTip").addClass("onError").empty().html("请先等待默认安全组创建完毕,稍候再试...");
										//			setTimeout(function(){
										//				$(".modal-footer").show();
										//				$("#batch_errorTip").removeClass("onError").empty();
										//			},3000);
										//		}
										//	});
										//}
										//end
										var numError = $(obj + '.onError').length;
										if (numError) {
											return;
										}
										var instance = BatchVM.getVM4JsonInstance();
										if($(".cpu-options").attr("data-value")>0 &&  $(".memory-options").attr("data-value")>0){
										com.skyform.service.vmService.createInstance(instance, function onCreated(instance) {
											//订单提交成功后校验用户余额是否不足
											var _tradeId = instance.tradeId ? instance.tradeId : instance.data.tradeId;
											var _fee = $(obj + ".batchPrice").html();
											com.skyform.service.BillService.confirmTradeSubmit(_fee, _tradeId, $("#" + modalId), function onSuccess(data) {
												//$("#buy").removeClass("disabled").empty().html("立即购买");	
												BatchVM.configModal.hide();
												$.growlUI(Dict.val("common_tip"), Dict.val("common_application_submit"));
											}, function onError(msg) {
												BatchVM.configModal.hide();
												$.growlUI(Dict.val("common_tip"), Dict.val("vm_application_cloud_host_submitted_fails"));
											});
										}, function onError(msg) {
											BatchVM.configModal.hide();
											$.growlUI(Dict.val("common_tip"), Dict.val("lb_create_filing_error") + ":" + msg);
										});
										}


										//else {}										
									},
									attrs : [ {
										name : 'class',
										value : 'btn btn-primary'
									} ]
								}, {
									name : Dict.val("common_cancel"),
									attrs : [ {
										name : 'class',
										value : 'btn'
									} ],
									onClick : function() {
										BatchVM.configModal.hide();
									}
								} ],
						beforeShow : function(){
							$(obj+"#batch_errorTip").removeClass("onError").empty();
							$("#"+modalId).find(".modal-body").load("batchVM.jsp");	
							BatchVM.querySubNet();
						},
						afterShow : function(){
							BatchVM.init();
							//H版资源池不支持自选安全组
							if($.inArray($("#pool").val(),$(Config.k_pool.split(",")))>-1){
								BatchVM.querySGTable();
								$("#sgTable_batch").closest("div.sgTable_batchCon").removeClass("hide");
							}else{
								$("#sgTable_batch").closest("div.sgTable_batchCon").addClass("hide");
							};
						}
					});	
		}		
		BatchVM.configModal.setLeft(520).setHeight(450).setWidth(1000).show();
	},
	getBillTypeList: function(obj) {
		$(obj+"#batch_billType").empty();		
		$.each(CommonEnum.billType, function(index) {
			var cpu_option = $("<div  class=\"types-options batch-period\" data-value='"+ index + "' style='width:50px'>" + CommonEnum.billType[index] + "</div>");
			cpu_option.appendTo($(obj+"#batch_billType"));
			cpu_option.unbind().click(function(){
				if($(this).hasClass("selected"))return;
				$(".types-options.batch-period").removeClass("selected");
				$(this).addClass("selected");
				VM.queryProductPrtyInfo(index);
				VM.queryOsList();
				VM.queryBwProductPrtyInfo(index);
				VM.queryVdiskProductPrtyInfo(index);
				VM.queryRouteProductPrtyInfo(index);
				//VM.queryProductPrtyInfo(index);
				BatchVM._initSelected(obj);				
				if(0 == index){
					$(obj+"#batch_periodUnit").empty().html(Dict.val("common_month"));
				}
				else if(3 == index){
					$(obj+"#batch_periodUnit").empty().html(Dict.val("common_year"));
				}
				else if(2 == index){
					$(obj+"#batch_periodUnit").empty().html(Dict.val("common_day"));
				}
			});
			if (index == 0||index == 5) {
				cpu_option.click();
			}
		});
	},
	_initSelected :function(obj){
		// 获取系统模板之后，可创建虚拟机
		BatchVM.getTemplateList(obj,function postInit(){	
			BatchVM.getServiceOfferings(obj,function(){
				
			});
		});			
		BatchVM.getImageList(obj);
                
		$(obj+" #batch_ostemplates").bind(
				"blur",
				function() {
					var obj = $("#batch_ostemplates").find(
							"option[value='" + $("#batch_ostemplates").val() + "']");
					$("option.osList").removeClass("active");
					obj.addClass("active");
					$("#_os").empty().text(obj.attr("os"));
					$("#_image").empty();
					var osDes = $("#batch_ostemplates .active").text();
					if ((osDes.toLowerCase()).indexOf("win") != -1) {
						VM.isWin = true;
					} else
						VM.isWin = false;
					var osDisk = $("#batch_ostemplates .active").attr("mindisk");
					$("#batch_osDisk").empty().html(osDisk);
                                        BatchVM.hideOrShowStandardOption();
					
				});
	},
	hideOrShowStandardOption : function() {
		var divs = $(obj+"#batch_vm_ul div");
		if (VM.isWin&&!CommonEnum.offLineBill) {
			$.each(divs,function(index, item) {
				var text = $(this).attr("data-value");
				if ($.inArray(text, VM.microType) != -1) {
					$(item).hide();
				}
			});
			$(obj+"#batch_cpu_options .cpu_options").each(function(index, item) {
				var text = $(item).attr("data-value");
				if ($.inArray(text, VM.microCpu) != -1) {
					$(item).hide();
				}
			});
			$(obj+"#batch_memory_options .memory-options").each(function(index, item) {
				var text = $(item).attr("data-value");
                                var activeMemory = $(obj+"#batch_cpu_options .active").attr("data-value");
                                //如果cpu是2核内存是1G显示
				if ($.inArray(text, VM.microMem) != -1) {
                                       if(activeMemory!="2"){
                                          $(item).hide();
                                        }
					
				}
			});
			
			$(obj+"#batch_vm_ul div:visible:last").click();
			// if($(".vm-type[data-value='小型B']").length > 0){
			// if($(".vm-type[data-value='小型B']:visible")){
			// $(".vm-type[data-value='小型B']").click();
			// }
			//			
			// }
			// else {
			// $("#config").find("[value='diy']").click();
			// var cpu_option = $("div.cpu-options:visible:first");
			// cpu_option.click();
			// var memory_option = $("div.memory-options:visible:first");
			// memory_option.click();
			// }
		} else {
			$.each(divs,function(index, item) {
				var text = $(this).attr("data-value");
				if ($.inArray(text, VM.microType) != -1) {
					$(item).show();
				}
			});
			$(obj+"#batch_cpu_options .cpu_options").each(function(index, item) {
				var text = $(item).attr("data-value");
				if ($.inArray(text, VM.microCpu) != -1) {
					$(item).show();
				}
			});
			$(obj+"#batch_memory_options .memory-options").each(function(index, item) {
				var text = $(item).attr("data-value");
				if ($.inArray(text, VM.microMem) != -1) {
					$(item).show();
				}
			});
			// $("#config").find("[value='diy']").click();
		}
	},

	// 获取OS模板列表
	getTemplateList : function(obj,postInit) {
			var active = true;
			//调整批量创建镜像不显示的问题
			var templates =vmJson.batchTrans4OSByPool(vmJson.batchOSList,CommonEnum.currentPool);//vmJson.trans4OSByPool(CommonEnum.currentPool);
			serviceOfferingsData = vmJson.trans4ServiceOfferingsByPool(CommonEnum.currentPool);
			$(obj+"#batch_ostemplates").empty();			
			if(null!=templates&&templates.length>0){
				$(templates).each(function(index,item){
						var template = $("<option class='osList batch-os' os='"+item.name+"' value=" + item.id + " mindisk="+item.mindisk+">" + item.name + "</option>");
						template.appendTo($(obj+"#batch_ostemplates"));
						template.click(function(){
							$("option.batch-os").removeClass("active");
							$(this).addClass("active");
							var osDes = $(obj+"#batch_ostemplates .active").text();
							if((osDes.toLowerCase()).indexOf("win")!=-1){
								VM.isWin = true;
							}
							else VM.isWin = false;
							var osDisk = $(obj+"#batch_ostemplates .active").attr("mindisk");
							$(obj+"#batch_osDisk").empty().html(osDisk);
							BatchVM.hideOrShowStandardOption();
						});
						if (index == 0) {
							active = $(obj+"#batch_image .os").hasClass("active");
							if(active){
								template.click();
							}							
						}
				});
				if(postInit) {
					postInit();					
				}
			}		
	},
	// 获取镜像模板列表
	getImageList : function(obj,postInit) {
		var active = true;
		com.skyform.service.vmService.listImagetemplates(function(templates){
			$(obj+"#batch_imagetemplates").empty();
			if(null!=templates&&templates.length>0){
				$(templates).each(function(index,item){
						var text = Dict.val("dc_mirroring")+"："+item.imageName+";"+Dict.val("common_vm")+"："+item.vmName+";"+Dict.val("vm_system")+"："+item.osName;					
						var template = $("<option class='osList batch-image' os='"+item.osName+"' value='" + item.osId + "' mindisk='"+item.osDisk+"' imageTemplateId='"+item.imageTemplateId+"' value='"+item.imageTemplateId+"' imageName='"+item.imageName+"' >" + text + "</option>");
						template.appendTo($(obj+"#batch_imagetemplates"));
						template.click(function(){							
							$("option.batch-image").removeClass("active");
							$(this).addClass("active");
							var osDes = $(obj+"#batch_imagetemplates .active").text();
							var osDisk = $(obj+"#batch_imagetemplates .active").attr("mindisk");
							$(obj+"#batch_vm_diy #batch_osDisk").empty().html(osDisk);
							$(obj+"#batch_vm_standard #batch_osDisk").empty().html(osDisk);
						});
						if (index == 0) {
							active = $(obj+"#batch_image .image").hasClass("active");
							if(active){
								template.click();
							}							
						}
				});
			}
		});		
	},
	bindEventForImageDivButton : function(obj){
		$("#batch_image div").bind("click",function(){
			$("#batch_image div").each(function(){
				$(this).removeClass("active");
			})
			$("#os_div").addClass("hide");
			$("#image_div").addClass("hide");
			if($(this).attr("value") == "os"){
				$("#os_div").removeClass("hide");
				$(this).addClass("active");
				$("#_showimage").addClass("hide");
				$("#_image").addClass("hide");
				$("#_showos").removeClass("hide");
				$("#_os").removeClass("hide");
				$(obj+"#batch_ostemplates option:last").click();
				
			}
			if($(this).attr("value") == "image"){
				$("#image_div").removeClass("hide");
				$(this).addClass("active");
				$(obj+"#batch_imagetemplates option:first").addClass("active");
				$("#_showos").addClass("hide");
				$("#_os").addClass("hide");
				$("#_showimage").removeClass("hide");
				$("#_image").removeClass("hide");
				$(obj+"#batch_imagetemplates option:first").click();
			}
		});

	},
	
	 bindEventForConfigDivButton:function(obj){
		$("#config div").bind("click",function(){
			$("#config div").each(function(){
				$(this).removeClass("active");
			})
			//$("#_mem").empty();
			$(obj+"#batch_vm_diy").addClass("hide");
			$(obj+"#batch_vm_standard").addClass("hide");
			if($(this).attr("value") == "stand"){
				$(obj+"#batch_vm_standard").removeClass("hide");
				$(this).addClass("active");
				$(obj+"#batch_vm_ul div:visible:first").click();
			}
			if($(this).attr("value") == "diy"){
				$(obj+"#batch_vm_diy").removeClass("hide");
				$(this).addClass("active");
				//$("#batch_vm_ul button").removeClass("active");
				var osDisk = $(obj+".osList.active").attr("mindisk");
				$(obj+"#batch_vm_diy #osDisk").empty().html(osDisk);
				$(obj+"#batch_cpu_options div:visible:first").click();
			}
		});
		//diy.click();
	},
	getServiceOfferings:function(obj,postInit){
		BatchVM.getTypeList(obj);
		BatchVM.getCpuList(obj);
		var cpuarr = BatchVM.getCpuArr();
		BatchVM.getMemoryList(obj,cpuarr[0]);
		$(obj+"#batch_vm_ul div:visible:last").click();
		if(postInit) {
			postInit();
		}
	},
	getTypeList : function(obj){	
		var portalType=Dcp.biz.getCurrentPortalType();
		var types = BatchVM.getTypes();		
		$(obj+"#batch_vm_ul").empty();
		var tab_option = "";
		$(types).each(function(index,item){	
			if("其他配置" == item.displaytext){
				tab_option = $("<div  class=\"types-options div_block type-options vm-type \" " +
						"style='display:none' data-value=\""+ item.displaytext +"\" title=\""+item.displaytext+ "\" vmPrice=\""+item.vmPrice+"\" productid=\""+item.productId+"\">"
						+ item.displaytext.slice(0,5) + "</div>");
			}else if($.inArray(item.displaytext,VM.microType) != -1){
				if(portalType=="private"){
					tab_option = $("<div  class=\"types-options type-options vm-type div_block\" " +
							"data-value=\""+ item.displaytext + "\" title=\""+item.displaytext+ "\" vmPrice=\""+item.vmPrice+"\" productid=\""+item.productId+"\">"
							+ item.displaytext.slice(0,5) + "</div>");
				}else if(portalType=="public"){
					//VM.isWin是否是windows系统,并且是共有云,则显示 微信 和 小型A.
					if(!VM.isWin&&!CommonEnum.offLineBill){	
						tab_option = $("<div  class=\"types-options type-options vm-type div_block\" " +
								"data-value=\""+ item.displaytext + "\" title=\""+item.displaytext+ "\" vmPrice=\""+item.vmPrice+"\" productid=\""+item.productId+"\">"
								+ item.displaytext.slice(0,5) + "</div>");
					}else{//否则不显示
						tab_option = $("<div  class=\"types-options div_block type-options vm-type \" " +
								"style='display:none' data-value=\""+ item.displaytext +"\" title=\""+item.displaytext+ "\" vmPrice=\""+item.vmPrice+"\" productid=\""+item.productId+"\">"
								+ item.displaytext.slice(0,5) + "</div>");
					}
				}
			}
			else tab_option = $("<div  class=\"types-options type-options vm-type div_block\" " +
					"data-value=\""+ item.displaytext + "\" title=\""+item.displaytext+ "\" vmPrice=\""+item.vmPrice+"\" productid=\""+item.productId+"\">"
					+ item.displaytext.slice(0,5) + "</div>");
			tab_option.appendTo($(obj+"#batch_vm_ul"));
//			if("其他配置" == item.displaytext){
//				var tab_option = $("<div class='vm-tab div_block' data-value='"+item.displaytext+"' style='display:none'>"+item.displaytext+"</div>");
//			}
//			else var tab_option = $("<div class='vm-tab div_block' data-value='"+item.displaytext+"'>"+item.displaytext+"</div>");
//			tab_option.appendTo($("#batch_vm_ul"));
			//标配tab事件
			tab_option.click(function(){
				$(obj+"#batch_vm_ul div").removeClass("active");
				$(obj+"#batch_vm_standard").addClass("active");
				BatchVM.selectType(obj,item.displaytext);
				$(this).addClass("active");
				var osDisk = $(obj+".osList.active").attr("mindisk");
				$(obj+"#batch_vm_standard #batch_osDisk").empty().html(osDisk);
				
			});	
		});
		$("#batch_vm_ul div:visible:last").click();

	},
	

		selectType : function(obj,type) {
		$(serviceOfferingsData).each(function(index, item) {
			if (item.displaytext == type) {
				BatchVM.getMemoryList(obj,item.cpunumber, item.memory);
				$(obj+".cpu-options[data-value != '"+ item.cpunumber + "']").removeClass("active");
				$(obj+".cpu-options[data-value = '"+ item.cpunumber + "']").addClass("active");
				$(obj+"#batch_cpu").html(item.cpunumber);
				return false;
			}
		});
	},


	 getTypes : function() {
		var typeArr = [];
		$(serviceOfferingsData).each(function(index, item) {
			if (item.displaytext != null&& -1 == $.inArray(item.displaytext, typeArr)) {
				var vmType = {
					"displaytext" : item.displaytext,
					"vmPrice" : item.vmPrice,
					"productId" : item.productId,
					"osDisk" : item.osDisk
				}
				if (null != item.discount) {
					vmType.discount = item.discount;
				} else
					vmType.discount = "";
				typeArr.push(vmType);
			}
		});
		return typeArr;
	},
	 getCpuList:function(obj) {
		var cpuArr = BatchVM.getCpuArr();
		$(obj+"#batch_cpu_options").empty();
		$(cpuArr).each(function(index, item) {
			var cpu_option = $("<div  class=\"types-options cpu-options div_block\" data-value='"+ item + "'>" + item + "核</div>");
			cpu_option.appendTo($(obj+"#batch_cpu_options"));
			cpu_option.click(function(){
//				if($(this).hasClass("active"))return;
				$(obj+"#batch_cpu_options .types-options.cpu-options ").removeClass("active");
				$(this).addClass("active");
				BatchVM.getMemoryList(obj,item);
			});
//			if (index == 0) {
//				cpu_option.click();
//			}
		});
		$("#batch_cpu_options div:first").click();
	},
 getMemoryList : function(obj,cpuNumber, mem) {
		var memoryArr = BatchVM.getMemoryArr(cpuNumber);
		$(obj+"#batch_memory_options").empty();
		$(memoryArr).each(function(index, item) {
					if (cpuNumber == item.cpunumber) {
						var memory_option = "";
				var memorySize = item.memory;
				if (memorySize >= 1024) {
					memorySize = memorySize / 1024;
				}

				if (cpuNumber == 1
						&& VM.isWin
						&& (item.memory == "0.5" || item.memory == "1")) {
					memory_option = $("<div class=\"types-options batch_memory_options div_block\" data-value="
							+ item.memory
							+ " style='display:none' >"
							+ memorySize + "GB</div>");
				} else {
					memory_option = $("<div class=\"types-options memory-options div_block\" data-value="
							+ item.memory
							+ "  >"
							+ memorySize
							+ "GB</div>");
				}
				memory_option.appendTo($(obj+"#batch_memory_options"));
				memory_option.click(function() {
					$(obj+".memory-options").removeClass("active");
					if (VM.isWin && cpuNumber == 1) {
						$(".memory-options[data-value='2']")
								.addClass("active");
					} else
						$(this).addClass("active");
				});
				if ((mem && mem == item.memory)) {
					memory_option.addClass("active");
					$(obj+"#batch_memory").html(memorySize);
				} else if (VM.isWin && index == 0) {
					memory_option.addClass("active");
					$(obj+"#batch_memory").html(mem);
					$(obj+"#_mem").empty().text(mem);
				} else if (!VM.isWin && index == 0) {
					memory_option.addClass("active");
					$(obj+"#batch_memory").empty().html(mem);
					$(obj+"#_mem").empty().text(mem);
				}
			}
		});
		if (!mem)
			$("#batch_memory_options div:visible:last").click();
		$("#batch_memory").empty().html(mem);
		if (mem)
			$("#_mem").empty().text(mem);
		if (VM.isWin && cpuNumber == 1 && $(".memory-options.active").length < 1) {
			$(".memory-options[data-value='2']").addClass("active");
		}
		// $(".options .types-options.memory-options").click();
		$("#batch_memory_options .types-options.memory-options").click(function() {
			$("#batch_memory_options .types-options.memory-options ")
					.removeClass("active");
			$(this).addClass("active");
		});
	},
	getMemoryArr : function(cpuNumber) {
		var memoryArr = [];
		$(serviceOfferingsData).each(function(index, item) {
			if ("其他配置" == item.displaytext) {
				if (cpuNumber == item.cpunumber) {
					memoryArr.push(item);
				}
			}
		});
		return memoryArr;
	},
	getCpuArr : function() {
		var cpuArr = [];
		$(serviceOfferingsData).each(function(index, item) {
			if ("其他配置" == item.displaytext) {
				if (-1 == $.inArray(item.cpunumber, cpuArr)) {
					cpuArr.push(item.cpunumber);
				}
			}
		});
		return cpuArr;
	},
	getVMFeeInstance : function(obj){
		var productId = vmJson.productId;
		var oos = $(obj+".osList.active");
		var os = oos.attr("os");
		var osValue = oos.attr("value");
		var oSDesc = oos.text();
		var templateid = oos.attr("value");
		var instanceName = $(obj+"#batch_instanceName").val();
		//var count = $.trim($("#count").val());
		var count = BatchVM.createCountInput.getValue();
		var cpuNum = 0;
		var memorySize = 0;
		if($(obj+"#config .div_block[value!='diy']").hasClass("active")){
			cpuNum = $(obj+"#batch_cpu").html();
			memorySize = $(obj+"#batch_memory").html();			
		}
		else {
			cpuNum = $(obj+"#batch_cpu_options .cpu-options.active").attr("data-value");
			memorySize = $(obj+"#batch_memory_options .memory-options.active").attr("data-value");			
		}
		
		var serviceofferingid = VM.getServiceOfferingId(cpuNum, memorySize);
		var period = BatchVM.createPeriodInput.getValue();

		//如果是年，period * 12
		if(3 == $(obj+"#batch_billType .selected").attr("data-value")){
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
		if($(obj+"#config .div_block[value!='diy']").hasClass("active")){
			var value = $(".vm-type.active").attr("vmprice");
			var productId = Number($(".vm-type.active").attr("productid"));
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
		return instance;
	},
	getVM4JsonInstance : function() {
		var productId = vmJson.productId;
		var oos = $(obj+".osList.active");
		var oSDesc = oos.text();
		var templateid = oos.attr("value");
		var osDisk = $(obj+"#batch_osDisk").html();
		var instanceName = $(obj+"#batch_instanceName").val();
		// var count = $.trim($("#count").val());
		var count = BatchVM.createCountInput.getValue();
		var cpuNum = 0;
		var memorySize = 0;
		if($(obj+"#config .div_block[value!='diy']").hasClass("active")){
			cpuNum = $("#batch_vm_standard #batch_cpu").html();
			memorySize = $("#batch_vm_standard #batch_memory").html();
		} else {			
			cpuNum = $(obj+"#batch_cpu_options .cpu-options.active").attr("data-value");
			memorySize = $(obj+"#batch_memory_options .memory-options.active").attr("data-value");	
		}		
		var period = BatchVM.createPeriodInput.getValue();
		var unit = $("#unit").val();		
		
		var imageTemplateId = $(obj+".batch-image.active").attr("imagetemplateid");
		var imageTemplateValue = $(obj+".batch-image.active").attr("value");

		// 如果是年，period * 12
		if (3 == $("#batch_billType .selected").attr("data-value")) {
			period = period * 12;
		}
		;

		var instance = {
			"period" : period,
			"count" : count,
			"productList" : [ {
				"cpuNum" : cpuNum,
				"memorySize" : memorySize,
				"OS" : templateid,
				"instanceName" : instanceName,
				"productId" : productId,
				"osDisk" : osDisk,
				"subNetId" : "0",
				"isBatch" :"1",
				"securityId" :"0"
			}
			]
		};
		var availableZoneId = BatchVM.azSelect.getAzSelectValue();console.log(availableZoneId);
		if(availableZoneId && availableZoneId != 0){
			instance.availableZoneId = availableZoneId;
		};
		if($("#batch_privatenetwork").val() != "") {
			instance.productList[0].subNetId = $("#batch_privatenetwork").val();		
		};
		if($.inArray($("#pool").val(),$(Config.k_pool.split(",")))>-1){
			if($("#sgTable_batch").val() != "") {
				instance.productList[0].securityId = $("#sgTable_batch").val();
			}
		}else{
			var sgId = BatchVM.defaultSG;
			instance.productList[0].securityId = sgId;
		};
		// 选择镜像
		if ($(obj+".image").hasClass("active")) {
			instance.productList[0].imageTemplateId = imageTemplateId;
			instance.productList[0].OS = imageTemplateValue;
		};

		if($(obj+"#config .div_block[value!='diy']").hasClass("active")){
			productId = Number($(".vm-type.active").attr("productid"));
			var vmPrice = $(".vm-type.active").attr("vmprice");
			instance.productList[0].productId = productId;
		} else {
			instance.productList[0].osDisk = $(obj+"#batch_osDisk").html();
		}
		BatchVM.getFirewallData(instance);
		return instance;
	},
	getFirewallData : function(instance){
			instance.productList[0].firewallRules = [];
	//		instance.productList[0].firewallRules.push(tcp_egress);//将默认屏蔽
	//		instance.productList[0].firewallRules.push(udp_egress);
//			$(FireWallCfg.rules).each(function(i,rule){	
//				if("ICMP" == rule.name){
//					rule.port = "0";
//				};			
//				var item = {
//					"direction"	: ""+rule.direction,
//					"name" : rule.name,
//					"port" : ""+rule.port,
//					"protocol" : ""+rule.protocol,
//					"ip" : rule.ip
//				} 
//				instance.productList[0].firewallRules.push(item);
//			});
		},
	createDefaulteSG:function(){
		var instance = {
				  "period": 9999,
				  "count": 1,
				  "productList": [
				    {
				      "defaultSubsFlag": "true",
				      "instanceName": "",
				      "productId": 9000,
				      "firewallRules": []
				    }
				  ]
				};
		com.skyform.service.FirewallService.saveSG(instance, function onSuccess(data){													
		},function onError(msg){
			$.growlUI(Dict.val("common_tip"), Dict.val("fw_application_sg_failed"));
		});
	},
	
	checkInstanceName:function(instanceName){
		if(instanceName != ''&&instanceName.length>0) {
			var scoreReg = /^[\u4E00-\u9FA0A-Za-z\-0-9\_]+$/;
			if(! scoreReg.exec(instanceName) ) {
				//result.msg = "请填写不包括非法字符的实例名称";
				$("#batch_errorTip").addClass("onError").empty().html(Dict.val("common_vm_name_no_illegal_characters"));				
			}
		}
	},
	
	querySubNet:function(){
		com.skyform.service.privateNetService.query({state:'running'},function (subnets){
			var subnetContainer = $("#batch_privatenetwork");
			subnetContainer.empty();
//			$("<option value=''>-- 默认网络--" + "</option>").appendTo(subnetContainer);
			$(subnets).each(function(i,subnet){
				if('using' == subnet.state||'running'== subnet.state){
					$("<option value='" + subnet.id + "' >" + subnet.name + "</option>").appendTo(subnetContainer);
				}
			});
			
			subnetContainer.unbind('change').bind("change",function(){
				if($(this).val() == '') {
					$("#vm_wizard_ip_setting").show();
//					com.skyform.service.EipService.listIdleIps(function(eips){
					com.skyform.service.EipService.listByStates({"states":"running"},function(eips){
						var privatenetworkContainer = $("#existed_ips");
						privatenetworkContainer.empty();
						$("<option value=''>-- "+Dict.val("common_choose")+"--" + "</option>").appendTo(privatenetworkContainer);
						$(eips).each(function(i,eip){
							if('running' == eip.state){
//								$("<option value='" + eip.id + "' eipId='"+eip.eInstanceId+"'>(" + eip.storageSize+"MB)" + eip.eInstanceId + "</option>").appendTo(privatenetworkContainer);
								$("<option value='" + eip.id + "'>(" + eip.BAND_WIDTH+"MB)"+ eip.instanceName +"</option>").appendTo(privatenetworkContainer);
							}
						});
					},function(errorMsg){
						ErrorMgr.showError(errorMsg);
					});
				} else {
					$("#vm_wizard_ip_setting").hide();
				}
			});
			subnetContainer.change();
		},function(error){
			ErrorMgr.showError(error);
		});
	},
	querySGTable:function(){
		com.skyform.service.FirewallService.querySG(function(datas){
			var sgTableContainer = $("#sgTable_batch");
			sgTableContainer.empty();
			$(datas).each(function(i,data){
				if("bind error"==data.subServiceStatus||"using"== data.subServiceStatus){
					data.subServiceStatus = "running";
				}
				$("<option value='" + data.subscriptionId + "' >" + data.subscriptionName + "</option>").appendTo(sgTableContainer);
			});
			sgTableContainer.unbind('change').bind("change",function(){
				if($(this).val() == '') {
				} else {
				}
			});
			sgTableContainer.change();
		},function(error){
			ErrorMgr.showError(error);
		})
	}
}