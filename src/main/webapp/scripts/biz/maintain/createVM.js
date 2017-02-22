var currentUserId = 0;
var ctx = "";
$().ready(function() {
	currentUserId = $("#currentUser").val();
	CommonEnum.init();
	setStyle();
	ctx = $("#path").val();
	testLogin();
	getBillTypeList();
	_initSelected();
	_initWizard();
	VM.getFee();
	allUnitFee();
	//$("#_area").empty().html(CommonEnum.pools[$("#currentPool").val()]);
	$("#_area").empty().html($('#pool .active').attr('title'));
	$("#_payPeriod").val(1);
	osType();
	/*if($('#fromDobule').val()=="dobule"){//双十一活动
		dobule11();
	};*/
	//if($('#pool .active').attr('data-value')=="xiank"||$('#pool .active').attr('data-value')=="shanghai"){
	if($('#pool .active').attr('data-value')!="huhehaote"){
		com.skyform.service.vmService.queryFreeBasicNetworkIp({ "resourcepool":$("#pool .active").attr('data-value') },function onSuccess(data) {
			if(data.data.length==0){
				$("#selectNetWork div[value='BasicNetwork']").attr("style","display:none;");
			}else{
				$(data.data).each(function(index,item){
					if(item.totalIpCount<=item.usedIpCount){
						//禁止基础网络
						/*$("#BasicNetworkMask").show();
						 $("#BasicNetworkMask").css({"width":$("#selectNetWork div:eq(0)").outerWidth(true) ,"height":$("#selectNetWork div:eq(0)").outerHeight(true)});*/
						$("#selectNetWork div[value='BasicNetwork']").attr("style","display:none;");
					}else{
						BasicNetworkIpsubscriptionId=item.subscriptionId;
						$("#BasicNetworkMask").css({"width":"0px","height":"0px"});
						$("#BasicNetworkMask").hide();
						$("#selectNetWork div[value='BasicNetwork']").attr("style","");
						$("#selectNetWork div").eq(0).click();
						return false;
					}
				})
			};
		},function onError(data) {
			//禁止基础网络
			/*$("#BasicNetworkMask").show();
			$("#BasicNetworkMask").css({"width":$("#selectNetWork div:eq(0)").outerWidth(true) ,"height":$("#selectNetWork div:eq(0)").outerHeight(true)});*/
			$("#selectNetWork div[value='BasicNetwork']").attr("style","display:none;");
		});
		/*非hehehaote时显示优惠码输入*/
		$("#demo").show();
	}else{
		$("#selectNetWork div[value='BasicNetwork']").attr("style","display:none;");
		/*hehehaote时隐藏优惠码输入*/
		$("#demo").hide();
	};

});
var serviceOfferingsData = "";
var isWin = false;
var feeUnit = 1000;
var BasicNetworkIpsubscriptionId="";
var vmTypeSelect=null;

function appendConsole() {
	//var html = '<ul class="nav pull-right" style="height:0px"><li style="background:#2694D5;font-size: 15px;">'
	//		+ '<a target="_blank" href="vm.jsp?code=vm">'+Dict.val("menu_management_console")+'</a></li></ul>';
	//$(".sf-main").append(html);
	var html = '<i></i><a class="tar" href="vm.jsp?code=vm" style="color:#fff">控制台</a>';
	$(".sf-topbar .fr").append(html);
}

function setStyle(){
	if (currentUserId > 0) {
		$(".loginTip").attr("style", "display:none");
		$(".loginTip2").attr("style", "display:none");
		$("input[type='radio'][name='sgoption'][value='useExisted']").attr("checked", "checked");//安全组
		$("#useExt").attr("style", "display:block");//已有安全组
		$("#vm_wizard_ip_setting").attr("style", "display:block");
	} else {
		$(".loginTip").attr("style", "display:inline");
		$(".loginTip2").attr("style", "display:block");
		$("input[type='radio'][name='sgoption'][value='createNew']").attr("checked", "checked");
		$("#useExt").attr("style", "display:none");
		$("#image_div").attr("style", "display:none");
		$("#vm_wizard_ip_setting").attr("style", "display:none");
		$("#vm_privatenetwork").empty();
	}
	$(".func-table tr").on('mouseover',function(){//滑过行给相应标题添加样式
		$(this).find("td:eq(0)").css({"background":"#bbb none repeat scroll 0 0","color":"black"});
	});
	$(".func-table tr").on('mouseout',function(){//滑出行给相应标题添加样式
		$(this).find("td:eq(0)").css({"background":"#f2f2f2 none repeat scroll 0 0","color":"#CACACA"});
	});
}

function testLogin() {//登陆检验
	$.blockUI();
	Dcp.JqueryUtil.dalinAsyncReq('/pr/client?p=/subnet/describeSubNet', {
		state : 'running'
	}, function(result) {
		$.unblockUI();
		if (result != null) {
			var msg = result.msg || result.message;
			if (msg == "当前用户会话已失效,请重新登录") {
				currentUserId = 0;
				$(".loginTip").attr("style", "display:inline");
				$(".loginTip2").attr("style", "display:block");
			}
		}
		if (currentUserId > 0) {
			$(".loginTip").attr("style", "display:none");
			$(".loginTip2").attr("style", "display:none");
			appendConsole();
			VM.querySG();
			getPrivateNetForVM(result.data);
		} else {
			$(".loginTip").attr("style", "display:inline");
			$(".loginTip2").attr("style", "display:block");
			$(".alert-info").show();
			$("input[type='radio'][name='sgoption'][value='createNew']").attr("checked", "checked");
			$("#useExt").attr("style", "display:none");
			$("#image_div").attr("style", "display:none");
			$("#vm_wizard_ip_setting").attr("style", "display:none");
			$("#vm_privatenetwork").empty();
		}
	}, function(error){
		$(".loginTip").attr("style", "display:inline");
		$(".loginTip2").attr("style", "display:block");
		$.unblockUI();
	});
}

function listResourcePool(offLineBill) {//资源池列表信息
	var poolContainer = $("#pool");
	poolContainer.empty();
	var strpools = Config.publicregisterpools;
	var pools = [];
	var _pooldata="";
	if ($.trim(strpools) != "" && strpools != null && strpools != "null") {
		//pools = strpools.split(",");
		pools = strpools;
		$.each(pools,function(key,value){
			//var pool = Dcp.hidePool(pools[i]);
			if(!value)	return;
			if (key == $("#currentPool").val()) {
				_pooldata=$("<div class=\"types-options div_block active\" data-value='"
				+ key
				+ "' title="+value+">"
				+ value
				+ "</div>");

			} else {
				_pooldata=$("<div class=\"types-options div_block\" data-value='"
				+key
				+ "' title="+value+">"
				+ value
				+ "</div>");

			}
			_pooldata.appendTo(poolContainer);
			_pooldata.click(function() {
				$("#pool div").removeClass("active");
				$(this).addClass("active");
				$("#_area").empty().html($(this).html());
				onChangePool($('#pool .active').attr('data-value'));
			})
		});
	} else {
		_pooldata=$("<div class=\"types-options div_block active\" data-value='"
		+ CommonEnum.currentPool
		+ "' title="+CommonEnum.pools[CommonEnum.currentPool]+">"
		+ CommonEnum.pools[CommonEnum.currentPool]
		+ "</div>");
		_pooldata.appendTo(poolContainer);
		_pooldata.click(function() {
			$("#pool div").removeClass("active");
			$(this).addClass("active");
			$("#_area").empty().html($(this).html());
			onChangePool($('#pool .active').attr('data-value'));
		})


	};

};
function setPools2Session(){
	var pool = $("#pool .active").attr('data-value');
	var data = JSON.stringify({
		SESSION_RES_POOL: pool
	});
	$.ajax({
		url : $("#path").val()+"/pr/changeResPool?SESSION_RES_POOL="+pool,
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
			$("#logMsg").addClass("onError").html(Dict.val("wo_sorry_your_request_failed"));
		}
	});
}
function onChangePool(newPool) {
	var pool = $("#pool .active").attr('data-value');
	setPools2Session();
	$("#currentPool").val(newPool);
	window.location.reload();
	var instanceBasicNetwork={ "resourcepool":pool };
	//if($('#pool .active').attr('data-value')=="xiank"||$('#pool .active').attr('data-value')=="shanghai"){
	if($('#pool .active').attr('data-value')!="huhehaote"){
		com.skyform.service.vmService.queryFreeBasicNetworkIp(instanceBasicNetwork,function onSuccess(data) {
			if(data.data.length==0){
				$("#selectNetWork div[value='BasicNetwork']").attr("style","display:none;");
			}else{
				$(data.data).each(function(index,item){
					if(item.totalIpCount<=item.usedIpCount){
						//禁止基础网络
						/*$("#BasicNetworkMask").show();
						 $("#BasicNetworkMask").css({"width":$("#selectNetWork div:eq(0)").outerWidth(true) ,"height":$("#selectNetWork div:eq(0)").outerHeight(true)});*/
						$("#selectNetWork div[value='BasicNetwork']").attr("style","display:none;");
					}else{
						BasicNetworkIpsubscriptionId=item.subscriptionId;
						$("#BasicNetworkMask").css({"width":"0px","height":"0px"});
						$("#BasicNetworkMask").hide();
						$("#selectNetWork div[value='BasicNetwork']").attr("style","");
						$("#selectNetWork div").eq(0).click();
						return false;
					}
				})
			}

		},function onError(data) {
			//禁止基础网络
			/*$("#BasicNetworkMask").show();
			$("#BasicNetworkMask").css({"width":$("#selectNetWork div:eq(0)").outerWidth(true) ,"height":$("#selectNetWork div:eq(0)").outerHeight(true)});*/
			$("#selectNetWork div[value='BasicNetwork']").attr("style","display:none;");
		});
		/*非hehehaote时显示优惠码输入*/
		$("#demo").show();
	}else{
		$("#selectNetWork div[value='BasicNetwork']").attr("style","display:none;");
		/*hehehaote时隐藏优惠码输入*/
		$("#demo").hide();
	};
};
function getBillTypeList() {//付费类型
	$("#billType").empty();
	$.each(
		CommonEnum.billType,
		function(index) {
			var cpu_option = $("<div class=\"types-options div_block ty subFee\" data-value='"
			+ index
			+ "'>"
			+ CommonEnum.billType[index]
			+ "</div>");
			cpu_option.appendTo($("#billType"));
			cpu_option.unbind().click(
				function() {
					if ($(this).hasClass("active"))
						return;
					$("#billType .types-options").removeClass(
						"active");
					$(this).addClass("active");
					queryProductPrtyInfo(index);
					queryBwProductPrtyInfo(index);
					queryVdiskProductPrtyInfo(index);
					VM.queryRouteProductPrtyInfo(index);
					_initSelected_Time();
					if (0 == index) {
						$("#periodUnit").empty().html(Dict.val("common_month"));
					} else if (3 == index) {
						$("#periodUnit").empty().html(Dict.val("common_year"));
					} else if (2 == index) {
						$("#periodUnit").empty().html(Dict.val("common_day"));
					}
					$("#_price").empty().text(
						CommonEnum.billType[$(this).attr(
							"data-value")]);
				});
			if (index == 0 || index == 5) {
				cpu_option.click();
			}
		});
};
function _initSelected() {
	// 获取系统模板之后，可创建虚拟机
	getTemplateList(function postInit() {
		getServiceOfferings(function() {
			bindEventForImageDivButton();
			bindEventForConfigDivButton();
			bindEventForNetworkDivButton();
		});
	},$("#osType .controls div.active").attr("value"));
	if (currentUserId > 0) {
		getImageList();
	}

};
function _initSelected_Time() {
	// 获取系统模板之后，可创建虚拟机
	getTemplateList(function postInit() {
		getServiceOfferings_Time(function() {
			bindEventForImageDivButton();
			bindEventForConfigDivButton();
			bindEventForNetworkDivButton();
		});
	},$("#osType .controls div.active").attr("value"));
	if (currentUserId > 0) {
		getImageList();
	}

};
function getServiceOfferings(postInit) {
	getTypeList();
	getCpuList();
	cpuarr = getCpuArr();
	getMemoryList(cpuarr[0]);
	//$("#vm-ul tr:visible:first").click();
	if(vmTypeSelect==null){
		$("#vm-ul tr:visible:first").click();
	}else{
		$("#vm-ul").find("tr[data-value="+vmTypeSelect+"]").click();
	};
	if (postInit) {
		postInit();
	}
};
function getServiceOfferings_Time(postInit) {
	getTypeList();
	getCpuList();
	cpuarr = getCpuArr();
	getMemoryList(cpuarr[0]);
	//$("#vm-ul tr:visible:first").click();
	if(vmTypeSelect==null){
		$("#vm-ul tr:visible:first").click();
	}else{
		$("#vm-ul").find("tr[data-value="+vmTypeSelect+"]").click();
	};
	if (postInit) {
		postInit();
	}
};
function bindEventForImageDivButton() {//为镜像添加点击事件
	$("#image div").bind("click", function() {
		$("#image div").each(function() {
			$(this).removeClass("active");
		})
		$("#os_div").addClass("hide");
		$("#image_div").addClass("hide");
		$("#osType").addClass("hide");
		if ($(this).attr("value") == "os") {
			$("#os_div").removeClass("hide");
			$(this).addClass("active");
			$("#osType").removeClass("hide");
			$("#_showimage").addClass("hide");
			$("#_image").addClass("hide");
			$("#_showos").removeClass("hide");
			$("#_os").removeClass("hide");
			if($("#osType .controls div.active").attr("value")=="SUSE"){
				$("#_os").empty();
				$("#data_DiskSize").empty().text("数据盘：");
			}else{
				$("#ostemplates option:first").click();
			}


		}
		if ($(this).attr("value") == "image") {
			$("#image_div").removeClass("hide");
			$(this).addClass("active");
			$("#imagetemplates option:first").addClass("active");
			$("#_showos").addClass("hide");
			$("#_os").addClass("hide");
			$("#_showimage").removeClass("hide");
			$("#_image").removeClass("hide");
			$("#imagetemplates option:first").click();
		}
	});
	$("#ostemplates").unbind("change").bind("change",function(){
		clearAgent();
		setTimeout('VM.getFee()', 5);
		setTimeout('allUnitFee()', 10);
	});

};
function bindEventForNetworkDivButton(){
	$("#selectNetWork div").bind("click", function() {
		$("#selectNetWork div").each(function() {
			$(this).removeClass("active");
		});
		if ($(this).attr("value") == "PrivateNetwork") {
			$("#PrivateNetworkCon").removeClass("hide");
			$(this).addClass("active");
		};
		if ($(this).attr("value") == "BasicNetwork") {
			$("#PrivateNetworkCon").addClass("hide");
			$(this).addClass("active");
		};
	});
};
function bindEventForConfigDivButton() {
	$("#config div").bind("click", function() {
		$("#config div").each(function() {
			$(this).removeClass("active");
		})
		// $("#_mem").empty();
		$("#vm-diy").addClass("hide");
		$("#vm-standard").addClass("hide");
		if ($(this).attr("value") == "stand") {
			$(".displayOsDiskForStand").removeClass("hide")
			$(".displayOsDiskForDiy").addClass("hide")
			$("#vm-standard").removeClass("hide");
			$(this).addClass("active");
			//$("#vm-ul tr:visible:first").click();
			if(vmTypeSelect==null){
				$("#vm-ul tr:visible:first").click();
			}else{
				$("#vm-ul").find("tr[data-value="+vmTypeSelect+"]").click();
			}
		}
		if ($(this).attr("value") == "diy") {
			$(".displayOsDiskForStand").addClass("hide")
			$(".displayOsDiskForDiy").removeClass("hide")
			$("#vm-diy").removeClass("hide");
			$(this).addClass("active");
			// $("#vm-ul button").removeClass("active");
			var osDisk = $(".osList.active").attr("mindisk");
			//$("#vm-diy #osDisk").empty().html(osDisk);
			if(osDisk=="undefined"){
				osDisk="";
			}
			$("#osDisk").empty().html(osDisk);
			$("#_osDiskSize").empty().html(osDisk);

			// $(".cpu-options[data-value=1]").click();
			$("#cpu-options div:visible:first").click();
		}
	});
	// diy.click();
};
function osType(){
	$("#osType .controls div").click(function(){
		$("#osType .controls div").removeClass("active");
		$(this).addClass("active");
		_initSelected_Time();
		$("#vm-ul .active").click();
	})
}
function getTemplateList(postInit,osType) {//操作系统
	var active = true;//console.log(osType);
	var templates = vmJson.trans4OSByPool($("#pool .active").attr("data-value"));//(CommonEnum.currentPool);
	serviceOfferingsData = vmJson
		.trans4ServiceOfferingsByPool($("#pool .active").attr("data-value"));//(CommonEnum.currentPool);
	$("#ostemplates").empty();//console.log(templates);
	if (null != templates && templates.length > 0) {
		$(templates).each(
			function(index, item) {//console.log(item.type);
				if(item.type==osType){
					var template = $("<option class='osList' os='" + item.name
					+ "' value=" + item.id + " mindisk=" + item.mindisk
					+ ">" + item.name + "</option>");
					template.appendTo($("#ostemplates"));
					template.click(function() {
						$("option.osList").removeClass("active");
						$(this).addClass("active");
						if($("#osType .controls div.active").attr("value")=="SUSE"){
							$("#_os").empty();
						}else{
							$("#_os").empty().text($(this).attr("os"));
						}
						$("#_image").empty();
						var osDes = $("#ostemplates .active").text();
						if ((osDes.toLowerCase()).indexOf("win") != -1) {
							isWin = true;
						} else
							isWin = false;
						var osDisk = $("#ostemplates .active").attr("mindisk");

						//$("#vm-diy #osDisk").empty().html(osDisk);

						//$("#vm-standard #osDisk").empty().html(osDisk);
						if(osDisk=="undefined"){
							osDisk="";
						}
						$("#osDisk").empty().html(osDisk);
						$("#_osDiskSize").empty().html(osDisk);
						$("#_osDiskSize2").empty().html(osDisk);
						if($("#osType .controls div.active").attr("value")=="SUSE"){
							$("#data_DiskSize").empty().text("数据盘：");
						}else{
							var dataSizeTotal=parseInt(osDisk)+parseInt($("#_dataSize").text());
							$("#data_DiskSize").empty().text("数据盘：");
						}


						hideOrShowStandardOption()
					});
					if (index == 0) {
						active = $("#image .os").hasClass("active");
						if (active) {
							template.click();
						}
					}
				}

			});
		if($("#osType .controls div.active").attr("value")=="SUSE"){
			$("#_os").empty();
			$("#data_DiskSize").empty().text("数据盘：");
		}else{
			$("#ostemplates option").eq(0).click();
		}

		if (postInit) {
			postInit();
		}
	}
};
function getImageList() {//镜像名称
	var active = true;
	com.skyform.service.vmService.listImagetemplates(function(templates) {
		//console.log(templates);
		$("#imagetemplates").empty();
		if (null != templates && templates.length > 0) {
			$(templates).each(
				function(index, item) {
					if(!item.vmName){
						item.vmName="无";
					};
					if(!item.osName){
						item.osName="无";
					};
					var text = "镜像：" + item.imageName + "；云主机："
						+ item.vmName + "；系统：" + item.osName;
					var template = $("<option class='osList' os='"
					+ item.osName + "' value='" + item.osId
					+ "' mindisk='" + item.osDisk
					+ "' imageTemplateId='" + item.imageTemplateId
					+ "'value='" + item.imageTemplateId
					+ "' imageName='" + item.imageName + "' >"
					+ text + "</option>");
					template.appendTo($("#imagetemplates"));
					template.click(function() {
						$("option.osList").removeClass("active");
						$(this).addClass("active");
						$("#_image").empty()
							.text($(this).attr("imageName"));
						$("#_os").empty();
						var osDes = $("#imagetemplates .active").text();
						var osDisk = $("#imagetemplates .active").attr(
							"mindisk");
						//$("#vm-diy #osDisk").empty().html(osDisk);
						//$("#vm-standard #osDisk").empty().html(osDisk);
						if(osDisk=="undefined"){
							osDisk="";
						}
						$("#osDisk").empty().html(osDisk);
						$("#_osDiskSize").empty().html(osDisk);
						$("#_osDiskSize2").empty().html(osDisk);
						var dataSizeTotal=parseInt(osDisk)+parseInt($("#_dataSize").text());
						if(osDisk==""){
							$("#data_DiskSize").empty().text("数据盘：");
						}else{
							$("#data_DiskSize").empty().text("数据盘：");
						}


						hideOrShowStandardOption()
					});
					if (index == 0) {
						active = $("#image .image").hasClass("active");
						if (active) {
							template.click();
						}
					}
				});
		}
	});
};
function getTypes() {
	var typeArr = [];
	$(serviceOfferingsData).each(
		function(index, item) {
			if (item.displaytext != null
				&& -1 == $.inArray(item.displaytext, typeArr)) {
				var vmType = {
					"displaytext" : item.displaytext,
					"vmPrice" : item.vmPrice,
					"productId" : item.productId,
					"osDisk" : item.osDisk,
					"cpunumber" : item.cpunumber,
					"memory" : item.memory
				}
				if (null != item.discount) {
					vmType.discount = item.discount;
				} else
					vmType.discount = "";
				typeArr.push(vmType);
			}
		});
	return typeArr;
};
function getTypeList() {//实例规格
	var types = getTypes();
	$("#vm-ul").empty();
	var tab_option = "";
	$(types)
		.each(
		function(index, item) {
			//var vm_fee=VM.vmTypeUnitFee({"muProperty":"vmPrice","muPropertyValue":"1","productId":item.productId});
			//if(vm_fee){}
			//else{
			//	vm_fee=""
			//}
			if ("其他配置" == item.displaytext) {
				tab_option =$("<tr "+ "style='display:none' data-value=\""
				+ item.displaytext
				+ "\" title=\""
				+ item.displaytext
				+ "\" vmPrice=\""
				+ item.vmPrice
				+ "\" productid=\""
				+ item.productId+"\">" +
				"<label class=\"radio\">"+
				"<td>" +
				"<input type='radio' name='productName'>"+
				item.displaytext.slice(0, 5)+
				"</td>" +
				"<td>" +
				item.cpunumber+"核"
				+
				"</td>" +
				"<td>" +
				item.memory+"G"+
				"</td>" +
				"<td class='vm_fee'>" +
				"费用"+
				"</td>"+
				"</label>"+
				"</tr>");
			}else if("微型" != item.displaytext){
				tab_option = $("<tr "+ "data-value=\""
				+ item.displaytext
				+ "\" title=\""
				+ item.displaytext
				+ "\" vmPrice=\""
				+ item.vmPrice
				+ "\" productid=\""
				+ item.productId+"\">" +
				"<label class=\"radio\">"+
				"<td>" +
				"<input type='radio' name='productName'>"+
				item.displaytext.slice(0, 5)+
				"</td>" +
				"<td>" +
				item.cpunumber+"核"
				+
				"</td>" +
				"<td>" +
				item.memory+"G"+
				"</td>" +
				"<td class='vm_fee'>" +
				"费用"+
				"</td>"+
				"</label>"+
				"</tr>");
				tab_option.appendTo($("#vm-ul"));

				// if("其他配置" == item.displaytext){
				// var tab_option = $("<div class='vm-tab div_block'
				// data-value='"+item.displaytext+"'
				// style='display:none'>"+item.displaytext+"</div>");
				// }
				// else var tab_option = $("<div class='vm-tab
				// div_block'
				// data-value='"+item.displaytext+"'>"+item.displaytext+"</div>");
				// tab_option.appendTo($("#vm-ul"));
				// 标配tab事件
				tab_option
					.click(function() {
						$("#vm-ul tr").removeClass("active");
						$("#vm-standard").addClass("active");
						selectType(item.displaytext);
						$(this).addClass("active");
						$(this).find('input').attr('checked','checked');
						vmTypeSelect=null;
						vmTypeSelect=$(this).attr("data-value");
						var osDisk = $(".osList.active").attr(
							"mindisk");
						//$("#vm-standard #osDisk").empty().html(
						//	osDisk);
						if(osDisk=="undefined"){
							osDisk="";
						};
						$("#osDisk").empty().html(osDisk);
						$("#_osDiskSize2").empty().html(osDisk);
						var dataSizeTotal=parseInt(osDisk)+parseInt($("#_dataSize").text());
						$("#data_DiskSize").empty().text("数据盘：");

						$("#discount").empty();
						if ("" != item.discount
							&& item.discount.length > 0) {
							$("#discount").empty().html(
								item.discount);
						};
					});

			}
		});
	write_vmfee();
	if(vmTypeSelect==null){
		$("#vm-ul tr:visible:first").click();
	}else{
		$("#vm-ul").find("tr[data-value="+vmTypeSelect+"]").click();
	}


};
function write_vmfee(){
	$("#vm-ul tr").eq(0).find(".vm_fee").html("<span style='color: #f00;'>40.7元</span>/月起");
	$("#vm-ul tr").eq(1).find(".vm_fee").html("<span style='color: #f00;'>76.7元</span>/月起");
	$("#vm-ul tr").eq(2).find(".vm_fee").html("<span style='color: #f00;'>133.7元</span>/月起");
	$("#vm-ul tr").eq(3).find(".vm_fee").html("<span style='color: #f00;'>132.7元</span>/月起");
	$("#vm-ul tr").eq(4).find(".vm_fee").html("<span style='color: #f00;'>177.7元</span>/月起");
	$("#vm-ul tr").eq(5).find(".vm_fee").html("<span style='color: #f00;'>267.7元</span>/月起");
	$("#vm-ul tr").eq(6).find(".vm_fee").html("<span style='color: #f00;'>265.7元</span>/月起");
	$("#vm-ul tr").eq(7).find(".vm_fee").html("<span style='color: #f00;'>355.7元</span>/月起");
	$("#vm-ul tr").eq(8).find(".vm_fee").html("<span style='color: #f00;'>535.7元</span>/月起");
	$("#vm-ul tr").eq(9).find(".vm_fee").html("<span style='color: #f00;'>532.7元</span>/月起");
	$("#vm-ul tr").eq(10).find(".vm_fee").html("<span style='color: #f00;'>712.7元</span>/月起");
	$("#vm-ul tr").eq(11).find(".vm_fee").html("<span style='color: #f00;'>1072.7元</span>/月起");
}
function selectType(type) {//console.log(serviceOfferingsData);
	$(serviceOfferingsData).each(
		function(index, item) {
			if (item.displaytext == type) {
				getMemoryList(item.cpunumber, item.memory);
				$(".cpu-options[data-value != '" + item.cpunumber + "']")
					.removeClass("active");
				$(".cpu-options[data-value = '" + item.cpunumber + "']")
					.addClass("active");
				$("#cpu").html(item.cpunumber);
				$("#_cpu").empty().text(item.cpunumber);
				$("#_displaytext").empty().text('('+item.displaytext+')');
				$("._displaytext").empty().text(item.displaytext+'：');
				return false;
			}
		});
};

function getPrivateNetForVM(subnets) {//网络设置
	var subnetContainer = $("#vm_privatenetwork");
	subnetContainer.empty();
	// $("<option value=''>-- 默认网络--" + "</option>").appendTo(subnetContainer);
	$(subnets).each(
		function(i, subnet) {
			if ('using' == subnet.state || 'running' == subnet.state) {
				$(
					"<option routerId='"
					+ subnet.routerId
					+ "' relStatus='"
					+ subnet.relStatus
					+ "'value='"
					+ subnet.id
					+ "' >"
					+ subnet.name
					+ "("
					+ (subnet.relStatus == "9" ? "已绑定路由"
						: "未绑定路由") + ")</option>")
					.appendTo(subnetContainer);
			}
		});
	setTimeout('VM.getFee()', 5);
	setTimeout('allUnitFee()', 10);
	subnetContainer.unbind('change').bind(
		"change",
		function() {
			// if($(this).val() == '') {
			$("#vm_wizard_ip_setting").show();
			// com.skyform.service.EipService.listIdleIps(function(eips){
			com.skyform.service.EipService.listByStates({
				"states" : "running"
			}, function(eips) {
				var privatenetworkContainer = $("#existed_ips");
				privatenetworkContainer.empty();
				$("<option value=''>-- "+Dict.val("common_choose")+"--" + "</option>").appendTo(
					privatenetworkContainer);
				$(eips).each(
					function(i, eip) {
						if ('running' == eip.state) {
							// $("<option value='" + eip.id + "'
							// eipId='"+eip.eInstanceId+"'>(" +
							// eip.storageSize+"MB)" + eip.eInstanceId +
							// "</option>").appendTo(privatenetworkContainer);
							$(
								"<option value='" + eip.id + "'>("
								+ eip.BAND_WIDTH + "MB)"
								+ eip.instanceName
								+ "</option>").appendTo(
								privatenetworkContainer);
						}
					});
			}, function(errorMsg) {
				ErrorMgr.showError(errorMsg);
			});
			// } else {
			// $("#vm_wizard_ip_setting").hide();
			// }
		});
	subnetContainer.change();
};
function getCpuList() {
	var cpuArr = getCpuArr();
	$("#cpu-options").empty();
	$(cpuArr)
		.each(
		function(index, item) {
			var cpu_option = $("<div  class=\"types-options cpu-options div_block\" data-value='"
			+ item + "'>" + item + Dict.val("vm_he")+"</div>");
			cpu_option.appendTo($("#cpu-options"));
			cpu_option
				.click(function() {
					// if($(this).hasClass("active"))return;
					$(
						"#cpu-options .types-options.cpu-options ")
						.removeClass("active");
					$(this).addClass("active");
					getMemoryList(item);
					$("#_cpu").empty().text(
						$(this).attr("data-value"));
				});
			// if (index == 0) {
			// cpu_option.click();
			// }
		});
	$("#cpu-options div:first").click();
};
function getMemoryList(cpuNumber, mem) {
	var memoryArr = getMemoryArr(cpuNumber);
	$("#memory-options").empty();
	$(memoryArr)
		.each(
		function(index, item) {
			if (cpuNumber == item.cpunumber) {
				var memory_option = "";
				var memorySize = item.memory;
				if (memorySize >= 1024) {
					memorySize = memorySize / 1024;
				}

				if (cpuNumber == 1
					&& isWin
					&& (item.memory == "0.5" || item.memory == "1")) {
					memory_option = $("<div class=\"types-options memory-options div_block\" data-value="
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
				memory_option.appendTo($("#memory-options"));
				memory_option.click(function() {
					$(".memory-options").removeClass("active");
					if (isWin && cpuNumber == 1) {
						$(".memory-options[data-value='2']")
							.addClass("active");
					} else
						$(this).addClass("active");
					$("#_mem").empty().text(
						$(this).attr("data-value"))
				});
				if ((mem && mem == item.memory)) {
					memory_option.addClass("active");
					$("#memory").html(memorySize);
					$("#_mem").empty().text(memorySize);
				} else if (isWin && index == 0) {
					memory_option.addClass("active");
					$("#memory").html(mem);
					$("#_mem").empty().text(mem);
				} else if (!isWin && index == 0) {
					memory_option.addClass("active");
					$("#memory").empty().html(mem);
					$("#_mem").empty().text(mem);
				}
			}
		});
	if (!mem)
		$("#memory-options div:visible:last").click();
	$("#memory").empty().html(mem);
	if (mem)
		$("#_mem").empty().text(mem);
	if (isWin && cpuNumber == 1 && $(".memory-options.active").length < 1) {
		$(".memory-options[data-value='2']").addClass("active");
	}
	// $(".options .types-options.memory-options").click();
	$("#memory-options .types-options.memory-options").click(
		function() {
			$("#memory-options .types-options.memory-options ")
				.removeClass("active");
			$(this).addClass("active");
		});
};
function getMemoryArr(cpuNumber) {
	var memoryArr = [];
	$(serviceOfferingsData).each(function(index, item) {
		if ("其他配置" == item.displaytext) {
			if (cpuNumber == item.cpunumber) {
				memoryArr.push(item);
			}
		}
	});
	return memoryArr;
};
function getCpuArr() {
	var cpuArr = [];
	$(serviceOfferingsData).each(function(index, item) {
		if ("其他配置" == item.displaytext) {
			if (-1 == $.inArray(item.cpunumber, cpuArr)) {
				cpuArr.push(item.cpunumber);
			}
		}
	});
	return cpuArr;
};
function _initWizard() {
	// 带+-的输入框
	VM.createPeriodInput = null;
	if (VM.createPeriodInput == null) {
		var container = $("#period").empty();
		var max = 12;
		VM.createPeriodInput = new com.skyform.component.RangeInputField(
			container, {
				min : 1,
				defaultValue : 1,
				max : max,
				textStyle : "width:107px;float:left;"
			}).render();
		VM.createPeriodInput.reset();
	}
	$(".subFee").bind('mouseup keyup', function() {
		clearAgent();
		setTimeout('VM.getFee()', 5);
		setTimeout('allUnitFee()', 10);
	});
	$("#vm_privatenetwork").blur(function(){
		setTimeout('VM.getFee()', 5);
		setTimeout('allUnitFee()', 10);
	})
	$("#agentId").focus(function(){
		$("#agentMsg").html("请在此填写优惠码，若无请忽略此项。");
	});
	$("#agentId").blur(function(){
		$("#agentMsg").html("");
	});
	$("#useAgentBtn").unbind("click").bind("click", function() {
		//该方法在agentCommon.js里
		com.skyform.agentService.getAgentCouponFeeInfo("vm");
	});
	$("input[type='radio'][name='networkoption']").bind('mouseup', function() {
		clearAgent();
		setTimeout('VM.getFee()', 5);
		setTimeout('allUnitFee()', 10);
	});
	$("#btnBackupSave").unbind("click").bind("click", function() {
		VM.backupVolume();
	});
	// 系统盘
	$("#rootDisk-range-min").slider({
		range : "min",
		value : value,
		min : 1,
		max : 200,
		step : 10,
		slide : function(event, ui) {
			$("#createRootDiskSize").val(ui.value);
		}
	});
	$("#createRootDiskSize").bind(
		"blur",
		function() {
			var value = $("#rootDisk-range-min").slider("value");
			var newValue = $("div#ostemplates div.selected>span:first")
				.attr("mindisk");
			if (/^[1-9]+[0-9]*$/.test("" + newValue)
				&& parseInt(newValue) >= min
				&& parseInt(newValue) <= max) {
				$("#rootDisk-range-min").slider("value", newValue);
			} else {
				$(this).val(value);
			}
		});
	$("#createRootDiskSize").val($("#RootDisk-range-min").slider("value"));
	// 数据盘
	$("#dataDisk-range-min").slider({
		range : "min",
		value : value,
		min : vdiskJson.product.min,
		max : vdiskJson.product.max,
		step : vdiskJson.product.step,
		slide : function(event, ui) {
			$("#createDataDiskSize").val(ui.value);
			// VM.getFee();
			$("#_dataSize").empty().text(ui.value);
			var dataSizeTotal=parseInt(ui.value)+parseInt($("#_osDiskSize2").text());
			$("#data_DiskSize").empty().text("数据盘：");
		}
	});
	$("#createDataDiskSize").bind(
		"blur",
		function() {
			var value = $("#dataDisk-range-min").slider("value");
			var newValue = $(this).val();
			if (/^[1-9]+[0-9]*$/.test("" + newValue)
				&& parseInt(newValue) >= vdiskJson.product.min
				&& parseInt(newValue) <= vdiskJson.product.max) {
				newValue = parseInt(newValue / 10) * 10;
				$(this).val(newValue);
				$("#dataDisk-range-min").slider("value", newValue);
				$("#_dataSize").text(newValue);
				var dataSizeTotal=parseInt(newValue)+parseInt($("#_osDiskSize2").text());
				$("#data_DiskSize").empty().text("数据盘：");
			} else {
				$(this).val(value);
				$("#_dataSize").text(value);
				var dataSizeTotal=parseInt(value)+parseInt($("#_osDiskSize2").text());
				$("#data_DiskSize").empty().text("数据盘：");
			}
			clearAgent();
			VM.getFee();
			allUnitFee();
		});
	$("#createDataDiskSize").bind("click", function() {
		$("#_dataSize").text($("#createDataDiskSize").val());
		var dataSizeTotal=parseInt($("#createDataDiskSize").val())+parseInt($("#_osDiskSize2").text());
		$("#data_DiskSize").empty().text("数据盘：");
	});


	// $("#createDataDiskSize").bind("keydown",function(){
	// $("#dataDiskMsg").empty().html("<span
	// class='text-error'>请输入10的倍数</span>");
	// });
	$("#createDataDiskSize").val($("#dataDisk-range-min").slider("value"));

	initsliderButton("createDataDiskSize", "dataDisk-range-min",
		vdiskJson.product.max, vdiskJson.product.min,
		vdiskJson.product.step,function(){
			//$("#_dataSize").val($("#dataDisk-range-min").slider("value"));
			$("#_dataSize").text($("#dataDisk-range-min").slider("value"));
			var dataSizeTotal=parseInt($("#dataDisk-range-min").slider("value"))+parseInt($("#_osDiskSize2").text());
			$("#data_DiskSize").empty().text("数据盘：");
		});
	// 带宽
	var min = ipJson.product.min, max = ipJson.product.max, step = ipJson.product.step, value = 0;
	$("#bandwidth-range-min").slider({
		range : "min",
		value : value,
		min : ipJson.product.min,
		max : ipJson.product.max,
		step : ipJson.product.step,
		slide : function(event, ui) {
			$("#createBandwidthSize").val(ui.value);
			$("#_bandWidth").empty().html(ui.value+'M');
			$("._bandWidth").empty().html(+ui.value+'M带宽：');
			// VM.getFee();
		}
	});
	$("#createBandwidthSize").bind(
		"blur",
		function() {
			var value = $("#bandwidth-range-min").slider("value");
			var newValue = $(this).val();
			if (/^[1-9]+[0-9]*$/.test("" + newValue)
				&& parseInt(newValue) >= min
				&& parseInt(newValue) <= ipJson.product.max) {
				$(this).val(newValue);
				$("#bandwidth-range-min").slider("value", newValue);
				$("#_bandWidth").empty().html(newValue+'M');
				$("._bandWidth").empty().html(+newValue+'M带宽：');
			} else {
				$(this).val(value);
				$("#_bandWidth").empty().html(value+'M');
				$("._bandWidth").empty().html(+value+'M带宽：');
			}
			VM.getFee();
			allUnitFee();
		});
	$("#createBandwidthSize").val($("#bandwidth-range-min").slider("value"));
	$("#_bandWidth").empty().html($("#bandwidth-range-min").slider("value")+'M');
	$("._bandWidth").empty().html(+$("#bandwidth-range-min").slider("value")+'M带宽：');
	initsliderButton("createBandwidthSize", "bandwidth-range-min",
		ipJson.product.max, ipJson.product.min,
		ipJson.product.step,function(){
			//$("#_dataSize").val($("#dataDisk-range-min").slider("value"));
			//$("#_dataSize").text($("#bandwidth-range-min").slider("value"));
			$("#bandwidth-range-min").slider("value");
			$("#_bandWidth").empty().html($("#bandwidth-range-min").slider("value")+'M');
			$("._bandWidth").empty().html(+$("#bandwidth-range-min").slider("value")+'M带宽：');
		});
	//购买时长
	//var min = 1, max = 12, step = 1, value = 0;
	$("#payPeriod").slider({
		range : "min",
		value : 1,
		min : 1,
		max : 12,
		step : 1,
		slide : function(event, ui) {
			//$("#_payPeriod").val(ui.value);
			//if(ui.value<10){
			//	$("#_day").empty().html(ui.value+'个月');
			//	//$("#billType div").eq(0).click();
			//	$("#period .input-medium").val(ui.value);
			//	for(var i=0;i<9;i++){
			//		$("#payPeriod_Time span").eq(i).html(i+1);
			//	};
			//	for(var i=0;i<ui.value;i++){
			//		$("#payPeriod_Time span").eq(i).html(i+1);
			//	};
			//	$("#payPeriod_Time span").eq(ui.value-1).html(ui.value+"个月");
			//}
			//else{
			//	for(var i=0;i<9;i++){
			//		$("#payPeriod_Time span").eq(i).html(i+1);
			//	};
			//	$("#_day").empty().html(ui.value-9+'年');
			//	//$("#billType div").eq(1).click();
			//	$("#period .input-medium").val(ui.value-9);
			//};
			//$("#period .input-medium").blur();
			//setTimeout(VM.getFee(),5);
			//setTimeout('allUnitFee()', 20);
		}
	});
	$("#payPeriod").mouseup(function(){
		var ui_value=$("#payPeriod").slider("value");
		$("#_payPeriod").val(ui_value);
		if(ui_value<10){
			$("#_day").empty().html(ui_value+'个月');
			$("#billType div").eq(0).click();
			$("#period .input-medium").val(ui_value);
			for(var i=0;i<9;i++){
				$("#payPeriod_Time span").eq(i).html(i+1);
			};
			for(var i=0;i<ui_value;i++){
				$("#payPeriod_Time span").eq(i).html(i+1);
			};
			$("#payPeriod_Time span").eq(ui_value-1).html(ui_value+"个月");
		}
		else{
			for(var i=0;i<9;i++){
				$("#payPeriod_Time span").eq(i).html(i+1);
			};
			$("#_day").empty().html(ui_value-9+'年');
			$("#billType div").eq(1).click();
			$("#period .input-medium").val(ui_value-9);
		};
		$("#period .input-medium").blur();
		$("#vm-ul .active").click();
		setTimeout('VM.getFee()',5);
		setTimeout('allUnitFee()', 20);
	});
	//购买时长end
	$("input[type='radio'][name='networkoption']").click(function() {
		var value = $(this).val();
		$("div.networkoption").each(function(i, div) {
			if (!$(div).hasClass("network_" + value)) {
				$(div).addClass("hide");
			} else {
				$(div).removeClass("hide");
			}
		});
	});
	$("input[type='radio'][name='loginMode']").click(function() {
		if ($(this).val() == 'password') {
			$("#login_mode_use_password").removeClass("hide");
		} else {
			$("#login_mode_use_password").addClass("hide");
		}
	});
	//立即购买按钮
	$("#buy").unbind("click").bind("click",function() {
		if(validateAgentCodeCheck()==false){return;}
		//$.blockUI();
		$('.blockOverlay').click($.unblockUI);
		if (currentUserId == 0) {
			var url = ctx + "/jsp/login.jsp?returnURL=createVM";
			window.location.assign(url);
		}

		$("#error_firewallName").empty();
		if ($("input[type='radio'][name='sgoption']:checked").val() == "createNew") {
			if ($.trim($("#firewallName").val()) == "") {
				$("#error_firewallName").text(Dict.val("cvm_enter_sg_name"));
				$("#firewallName").focus();
				//$.unblockUI();
				return;
			}
		}
		$("#tip_1226").text("");
		if($("#selectNetWork .active").attr("value")=="PrivateNetwork"){
			if (!$("#vm_privatenetwork").val()) {
				$("#tip_1226").text(Dict.val("cvm_create_network"));
				$("#vm_privatenetwork").focus();
				//$.unblockUI();
				return;
			}
		};
		if($("#createDataDiskSize").val()<0){
			$.growlUI("数据盘值最少为“0”");
			$("#createDataDiskSize").val("0").focus();
			return;
		};
		var sgoption = $("input[type='radio'][name='sgoption']:checked").val();
		if ("useExisted" == sgoption) {
			var sgId = $("input[type='radio'][name='sgRadio']:checked").val();
			if (!sgId) {
				if (VM.groupTotal == 0) {
					$.growlUI(Dict.val("cvm_not_use_sg"));
					//$.unblockUI();
					return;
				} else {
					$.growlUI(Dict.val("fw_please_select_sg"));
					//$.unblockUI();
					return;
				}
			}
		}
		var instance = vmJson.getVM4JsonInstance();
		if(instance.productList[1].BAND_WIDTH<1){
			$.growlUI("带宽值最少为“1”");
			$("#createBandwidthSize").val("1").focus();
			return;
		};
		var agentId = $("#agentId").val();
		$.blockUI();
		if (agentId && agentId.length > 0) {
			//查询AZ
			com.skyform.service.vmService.queryAZAndAzQuota($("#pool .active").attr('data-value'),function(data){
				var zoneName = "";
				if(data.length>0){
					zoneName=data[0].availableZoneId;
					$.each(data,function(key,value){
						if(value.isQuotaExist==1){
							zoneName=value.availableZoneId;
						}
					});
				};
				var channel = {
					"period" : 1,
					"count" : 1,
					"agentCouponCode" : "",
					"serviceType" : CommonEnum.serviceType["vm"],
					"productList" : [],
					"availableZoneId" : zoneName
				};
				channel.agentCouponCode = agentId;
				channel.period = instance.period;
				$(instance.productList).each(function(i, item) {
					var product = {
						"price" : 0,
						"productId" : "",
						"serviceType" : "",
						"productDesc" : {}
					};
					// product.price = _fee;
					product.productId = item.productId;
					item.availableZoneId=zoneName;
					if (item.cpuNum) {
						var vmFee = vmJson.getVMFeeInstance();
						var itemFee = com.skyform.service.channelService.getProductFee();
						itemFee.period = instance.period;
						product.serviceType = CommonEnum.serviceType["vm"];
						$(vmFee.productPropertyList).each(function(m,pp) {
							if (m < 4) {
								itemFee.productPropertyList.push(pp);
							}
						});
						if($("#selectNetWork .active").attr("value")=="BasicNetwork"){
							var itemFee_bNet=itemFee;
							itemFee_bNet.productPropertyList.push({
								"muProperty": "bandwidth_tx",
								"muPropertyValue": $("#createBandwidthSize").val(),
								"productId": itemFee.productPropertyList[2].productId
							})
							com.skyform.service.channelService.getItemFee(itemFee_bNet,function(data) {
								product.price = data.fee / feeUnit;
							});
						}else{
							com.skyform.service.channelService.getItemFee(itemFee,function(data) {
								product.price = data.fee / feeUnit;
							});
						};
					} else if (item.storageSize) {
						var vmFee = vmJson.getVMFeeInstance();
						var itemFee = com.skyform.service.channelService.getProductFee();
						itemFee.period = instance.period;
						product.serviceType = CommonEnum.serviceType["vdisk"];
						$(vmFee.productPropertyList).each(function(n,pp) {
							if ("storageSize" == pp.muProperty) {
								itemFee.productPropertyList[0] = pp;
							}
						});
						com.skyform.service.channelService.getItemFee(itemFee,function(data) {
							product.price = data.fee / feeUnit;
						});
					} else if (item.BAND_WIDTH) {
						var vmFee = vmJson .getVMFeeInstance();
						var itemFee = com.skyform.service.channelService .getProductFee();
						itemFee.period = instance.period;
						product.serviceType = CommonEnum.serviceType["ip"];
						$(vmFee.productPropertyList).each(function(n,pp) {
							if ("BAND_WIDTH" == pp.muProperty) {
								itemFee.productPropertyList[0] = pp;
							}
						});
						com.skyform.service.channelService.getItemFee(itemFee,function(data) {
							product.price = data.fee / feeUnit;
						});
					} else if (item.ROUTER) {
						var vmFee = vmJson.getVMFeeInstance();
						var itemFee = com.skyform.service.channelService.getProductFee();
						itemFee.period = instance.period;
						product.serviceType = CommonEnum.serviceType["route"];
						$(vmFee.productPropertyList).each(function(n,pp) {
							if ("routerPrice" == pp.muProperty) {
								itemFee.productPropertyList[0] = pp;
							}
						});
						com.skyform.service.channelService.getItemFee(itemFee,function(data) {
							product.price = data.fee/ feeUnit;
						});
					}
					product.productDesc = item;
					channel.productList[i] = product;
				});// com.skyform.service.channelService
				if($("#selectNetWork .active").attr("value")=="BasicNetwork"){
					var instanceBasicNetwork={
						"period": channel.period,
						"count": channel.count,
						"agentCouponCode": channel.agentCouponCode,
						"serviceType": channel.serviceType,
						"productList": [channel.productList[0]],
						"availableZoneId": channel.availableZoneId
					};
					instanceBasicNetwork.productList[0].productDesc.subNetId= BasicNetworkIpsubscriptionId;//获取基础子网id
					instanceBasicNetwork.productList[0].productDesc.bandwidth_tx= channel.productList[1].productDesc.BAND_WIDTH;
					com.skyform.service.channelService.channelSubmit(instanceBasicNetwork,
						function onCreated(data) {
							// 订单提交成功后校验用户余额是否不足
							var _tradeId = data.tradeId;
							var disCountFee = data.fee;
							$.unblockUI();
							com.skyform.service.BillService.wizardConfirmTradeSubmit2(disCountFee,_tradeId,null,
								function onSuccess(data) {
									$.growlUI(Dict.val("common_tip"),Dict.val("cvm_app_submit"));
									window.location.href ="../../jsp/maintain/paySuccess.jsp?code=order&cataCode=consume&tradeId="+_tradeId+'&osName='+encodeURIComponent($("#ostemplates .active").text());
								},
								function onError(msg) {
									$.growlUI(Dict.val("common_tip"),Dict.val("vm_application_vm_submitted_fails"));
								});
							// com.skyform.service.BillService.tradeSubmit(_tradeId);
						}, function onError(msg) {
							$.unblockUI();
							$.growlUI(Dict.val("common_tip"), Dict.val("vdisk_create_app_submit_failure")+ msg);
							//wizard.markSubmitError();
						});
				}else{
					com.skyform.service.channelService.channelSubmit(channel,
						function onCreated(data) {
							// 订单提交成功后校验用户余额是否不足
							var _tradeId = data.tradeId;
							var disCountFee = data.fee;
							$.unblockUI();
							com.skyform.service.BillService.wizardConfirmTradeSubmit2(disCountFee,_tradeId,null,
								function onSuccess(data) {
									$.growlUI(Dict.val("common_tip"),Dict.val("cvm_app_submit"));
									window.location.href ="../../jsp/maintain/paySuccess.jsp?code=order&cataCode=consume&tradeId="+_tradeId+'&osName='+encodeURIComponent($("#ostemplates .active").text());
								},
								function onError(msg) {
									$.growlUI(Dict.val("common_tip"),Dict.val("vm_application_vm_submitted_fails"));
								});
							// com.skyform.service.BillService.tradeSubmit(_tradeId);
						}, function onError(msg) {
							$.unblockUI();
							$.growlUI(Dict.val("common_tip"), Dict.val("vdisk_create_app_submit_failure")+ msg);
							//wizard.markSubmitError();
						});
				};
			});
		} else {
			com.skyform.service.vmService.queryAZAndAzQuota($("#pool .active").attr('data-value'),function(data){
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
				$.unblockUI();
				if($("#selectNetWork .active").attr("value")=="BasicNetwork"){
					var instanceBasicNetwork={
						"period": instance.period,
						"count": instance.count,
						"productList": [instance.productList[0]],
						"availableZoneId": instance.availableZoneId

					};
					instanceBasicNetwork.productList[0].subNetId= BasicNetworkIpsubscriptionId;//获取基础子网id
					instanceBasicNetwork.productList[0].bandwidth_tx= instance.productList[1].BAND_WIDTH;
					com.skyform.service.vmService.createInstance(instanceBasicNetwork,
						function onCreated(data) {
							// 订单提交成功后校验用户余额是否不足
							var _tradeId = data.tradeId?data.tradeId:data.data.tradeId;
							var _fee = $(".price").html();
							// 计算优惠额度
							var portalType = Dcp.biz.getCurrentPortalType();

							// if(agentId&&agentId.length>0){
							//
							// com.skyform.service.ChannelService.checkAgentCode(agentId,function(data){
							// var result={"status":true};
							// alert("check Agent Code");
							// if("-1" == data){
							// $("#agentMsg").html("渠道优惠码不存在，请重新输入！");
							// result.status = false;
							// }
							// else if("-2" == data||"-1" ==
							// data){
							// $("#agentMsg").html("渠道优惠码已经失效，请重新输入！");
							// result.status = false;
							// }
							// });
							// }

							com.skyform.service.BillService.wizardConfirmTradeSubmit2(_fee,_tradeId,null,
								function onSuccess(data) {
									$.growlUI(Dict.val("common_tip"),Dict.val("cvm_app_submit"));
									window.location.href ="../../jsp/maintain/paySuccess.jsp?code=order&cataCode=consume&tradeId="+_tradeId+'&osName='+encodeURIComponent($("#ostemplates .active").text());
								},
								function onError(msg) {
									$.growlUI(Dict.val("common_tip"),Dict.val("vm_application_vm_submitted_fails"));
								});
						}, function onError(msg) {
							$.growlUI(Dict.val("common_tip"), Dict.val("vdisk_create_app_submit_failure")+ msg);
						});
				}else{
					com.skyform.service.vmService.createInstance(instance,
						function onCreated(data) {
							// 订单提交成功后校验用户余额是否不足
							var _tradeId = data.tradeId?data.tradeId:data.data.tradeId;
							var _fee = $(".price").html();
							// 计算优惠额度
							var portalType = Dcp.biz.getCurrentPortalType();

							// if(agentId&&agentId.length>0){
							//
							// com.skyform.service.ChannelService.checkAgentCode(agentId,function(data){
							// var result={"status":true};
							// alert("check Agent Code");
							// if("-1" == data){
							// $("#agentMsg").html("渠道优惠码不存在，请重新输入！");
							// result.status = false;
							// }
							// else if("-2" == data||"-1" ==
							// data){
							// $("#agentMsg").html("渠道优惠码已经失效，请重新输入！");
							// result.status = false;
							// }
							// });
							// }

							com.skyform.service.BillService.wizardConfirmTradeSubmit2(_fee,_tradeId,null,
								function onSuccess(data) {
									$.growlUI(Dict.val("common_tip"),Dict.val("cvm_app_submit"));
									window.location.href ="../../jsp/maintain/paySuccess.jsp?code=order&cataCode=consume&tradeId="+_tradeId+'&osName='+encodeURIComponent($("#ostemplates .active").text());
								},
								function onError(msg) {
									$.growlUI(Dict.val("common_tip"),Dict.val("vm_application_vm_submitted_fails"));
								});
						}, function onError(msg) {
							$.growlUI(Dict.val("common_tip"), Dict.val("vdisk_create_app_submit_failure")+ msg);
						});
				};

			});
		}

	});

	$("#ostemplates").bind(
		"blur",
		function() {
			var obj = $("#ostemplates").find(
				"option[value='" + $("#ostemplates").val() + "']");
			$("option.osList").removeClass("active");
			obj.addClass("active");
			$("#_os").empty().text(obj.attr("os"));
			$("#_image").empty();
			var osDes = $("#ostemplates .active").text();
			if ((osDes.toLowerCase()).indexOf("win") != -1) {
				isWin = true;
			} else
				isWin = false;
			var osDisk = $("#ostemplates .active").attr("mindisk");
			//$("#vm-diy #osDisk").empty().html(osDisk);
			//$("#vm-standard #osDisk").empty().html(osDisk);
			if(osDisk=="undefined"){
				osDisk="";
			}
			$("#osDisk").empty().html(osDisk);
			$("#_osDiskSize").empty().html(osDisk);
			$("#_osDiskSize2").empty().html(osDisk);

			$("#_os").empty().text(obj.attr("os"));
			hideOrShowStandardOption()
		});
	$("#imagetemplates").bind(
		"blur",
		function() {
			var obj = $("#imagetemplates").find(
				"option[value='" + $("#imagetemplates").val() + "']");
			$("option.osList").removeClass("active");
			obj.addClass("active");
			$("#_image").empty().text(obj.attr("imageName"));
			$("#_os").empty();
			var osDes = $("#imagetemplates .active").text();
			var osDisk = $("#imagetemplates .active").attr("mindisk");
			//$("#vm-diy #osDisk").empty().html(osDisk);
			//$("#vm-standard #osDisk").empty().html(osDisk);
			if(osDisk=="undefined"){
				osDisk="";
			}
			$("#osDisk").empty().html(osDisk);
			$("#_osDiskSize").empty().html(osDisk);
			$("#_osDiskSize2").empty().html(osDisk);

			$("#_image").empty().text(obj.attr("imagename"));
			hideOrShowStandardOption()
		});
	$("#_showimage").addClass("hide");
	$("#_image").addClass("hide");
	$("input[type='radio'][name='sgoption']").unbind('click').click(function() {
		var value = $(this).val();
		$("div.sgoption").each(function(i, div) {
			if (!$(div).hasClass("sg_" + value)) {
				$(div).attr("style", "display:none");
			} else {
				$(div).attr("style", "display:block");
			}
		});
		if ("useExisted" == value && currentUserId > 0) {
			com.skyform.service.FirewallService.querySG(function(data){
				VM.sgInstances = data;
				VM.groupTotal = data.length;
				VM.renderSGTable(VM.sgInstances);
			});
		}
	});
	$("input[type='radio'][name='networkoption']:first").prop("checked", true);
	$("input[type='radio'][name='sgoption'][checked='checked']").click();
};
function getNewResourcePoolOs(data){
	var newPool=CommonEnum.NewPoolList;
	var condition={};
	var rescourePoolName=$("#pool .active").attr("data-value");
	var billType=$("#billType .active").attr("data-value");
	var mirrortype="all";
	var portalType = "public";//Dcp.biz.getCurrentPortalType();
	var datas=null;
	condition.portalType=portalType;
	condition.osType="";
	if(mirrortype =="all"){
		var osType=$(".osTypeSelect .selected").attr("osType");
		condition.osType="";
		condition.mirrorType="2";
	}else if(mirrortype=="using"){
		condition.mirrorType="2";
	}
	vmJson.oslist = data.oslist;
	$.each(newPool,function(key,value){
//		console.log(key);
//		console.log(value);
		if(rescourePoolName==value){
			condition.rescourePoolName=rescourePoolName;
			condition.billType=billType;
			com.skyform.service.vmService.getOs(condition,function(data){
				if( null != data){
					datas = data;
					vmJson.oslist = data;
				}
			});
		}else{

		}

	});
};
function queryProductPrtyInfo(index) {
	com.skyform.service.BillService.queryProductPrtyInfo(index, 'vm', function(data) {
		if (null != data) {
			getNewResourcePoolOs(data);
			vmJson.vmConfig = data.vmConfig;
			vmJson.productId = data.productId;
		}
	}, function(error){});
};
function queryBwProductPrtyInfo(index) {
	com.skyform.service.BillService.queryProductPrtyInfo(index, "ip", function(data) {
		if (null != data) {
			ipJson.product.max = data.brandWidth.max;
			ipJson.product.min = data.brandWidth.min;
			ipJson.product.step = data.brandWidth.step;
			ipJson.product.unit = data.brandWidth.unit;
			ipJson.product.productId = data.productId;
		}
		$("#bwUnit").empty().html(ipJson.product.unit);
	});
};
function queryVdiskProductPrtyInfo(index) {
	com.skyform.service.BillService.queryProductPrtyInfo(index, "vdisk",
		function(data) {
			if (null != data) {
				vdiskJson.product.max = data.dataDisk.max;
				vdiskJson.product.min = data.dataDisk.min;
				vdiskJson.product.step = data.dataDisk.step;
				vdiskJson.product.unit = data.dataDisk.unit;
				vdiskJson.product.productId = data.productId;
			}
			$("#dataDiskUnit").empty().html(vdiskJson.product.unit);
		});
};
function hideOrShowStandardOption() {
	var osDes = $(".osList.active").text();
	if ((osDes.toLowerCase()).indexOf("win") != -1) {
		isWin = true;
	} else
		VisWin = false;
	if (isWin) {
		$(".vm-type").each(function(index, item) {
			var text = $(item).attr("data-value");
			if ($.inArray(text, VM.microType) != -1) {
				$(item).hide();
			}
		});
		// $(".cpu-options").each(function(index,item){
		// var text = $(item).attr("data-value");
		// if(text == microCpu){
		// $(item).hide();
		// }
		// });
		$(".memory-options").each(function(index, item) {
			var text = $(item).attr("data-value");
			if ($.inArray(text, VM.microMem) != -1) {
				$(item).hide();
			}
		});
		//$("#vm-ul tr:visible:first").click();
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
		$(".vm-type").each(function(index, item) {
			var text = $(item).attr("data-value");
			if ($.inArray(text, VM.microType) != -1) {
				$(item).show();
			}
		});
		$(".memory-options").each(function(index, item) {
			var text = $(item).attr("data-value");
			if ($.inArray(text, VM.microMem) != -1) {
				$(item).show();
			}
		});
		// $("#config").find("[value='diy']").click();
	}
};
function clearAgent(){
	//清空优惠码
	$("#agentDemo").attr("style","display:none");
	$("#agentDemo").find("span[name$='Msg']").html("");
}
var tcp_egress = {
	"direction" : "egress",
	"name" : "TCP上行",
	"port" : "1-65535",
	"protocol" : "tcp",
	"ip" : ""
};
var udp_egress = {
	"direction" : "egress",
	"name" : "UDP上行",
	"port" : "1-65535",
	"protocol" : "udp",
	"ip" : ""
};
function validateAgentCode(select) {

	var result = {
		status : true
	};
	$("#agentMsg").empty();
	var agentId = $("#agentId").val();
	if (agentId && agentId.length > 0) {

		VM.ChannelService.checkAgentCode(agentId, function(data) {
			if ("-3" == data) {
				$("#agentMsg").html(Dict.val("common_discount_code_no_exist"));
				result.status = false;
			} else if ("-2" == data || "-1" == data) {
				$("#agentMsg").html(Dict.val("common_discount_code_expired"));
				result.status = false;
			} else if("-6" == data){
				$("#agentMsg").html(Dict.val("common_coupons_reached_maximum_number"));
				result.status = false;
			} else if("-4" == data){
				$("#agentMsg").html(Dict.val("common_discount_code_authing"));
				result.status = false;
			} else if("-5" == data){
				$("#agentMsg").html(Dict.val("common_discount_code_unauthed"));
				result.status = false;
			}else if("-7" == data){
				$("#agentMsg").html(Dict.val("common_discount_code_noavailable"));
				result.status = false;
			}
		});
	}
	return result;
};
function validateAgentCodeCheck() {

	var result = {
		status : true
	};
	$("#agentMsg").empty();
	var agentId = $("#agentId").val();
	if (agentId && agentId.length > 0) {
		com.skyform.service.channelService.checkAgentCode(agentId, function(data) {
			if ("-3" == data) {
				$("#agentMsg").html(Dict.val("common_discount_code_no_exist"));
				result.status = false;
			} else if ("-2" == data || "-1" == data) {
				$("#agentMsg").html(Dict.val("common_discount_code_expired"));
				result.status = false;
			} else if("-6" == data){
				$("#agentMsg").html(Dict.val("common_coupons_reached_maximum_number"));
				result.status = false;
			} else if("-4" == data){
				$("#agentMsg").html(Dict.val("common_discount_code_authing"));
				result.status = false;
			} else if("-5" == data){
				$("#agentMsg").html(Dict.val("common_discount_code_unauthed"));
				result.status = false;
			}else if("-7" == data){
				$("#agentMsg").html(Dict.val("common_discount_code_noavailable"));
				result.status = false;
			}
		});
	}
	return result.status;
};
function allUnitFee(){
	//var param = vmJson.getVMFeeInstance();
	//var vmTypeparam={"period":param.period,"productPropertyList":[param.productPropertyList
	//    [0],param.productPropertyList[1],param.productPropertyList[2],param.productPropertyList
	//    [3]],"verifyFlag":param.verifyFlag};
	//var bandWidthparam={"period":param.period,"productPropertyList":[param.productPropertyList[4]],"verifyFlag":param.verifyFlag};
	VM.vmTypeFee();
	VM.bandWidthFee();
	VM.dataSizeFee();
	VM.routerFee();
};
/*function dobule11(){//双十一活动
	var ui_value=10;
	$("#payPeriod").slider("value",10);
	$("#_payPeriod").val(ui_value);
	if(ui_value<10){
		$("#_day").empty().html(ui_value+'个月');
		$("#billType div").eq(0).click();
		$("#period .input-medium").val(ui_value);
		for(var i=0;i<9;i++){
			$("#payPeriod_Time span").eq(i).html(i+1);
		};
		for(var i=0;i<ui_value;i++){
			$("#payPeriod_Time span").eq(i).html(i+1);
		};
		$("#payPeriod_Time span").eq(ui_value-1).html(ui_value+"个月");
	}
	else{
		for(var i=0;i<9;i++){
			$("#payPeriod_Time span").eq(i).html(i+1);
		};
		$("#_day").empty().html(ui_value-9+'年');
		$("#billType div").eq(1).click();
		$("#period .input-medium").val(ui_value-9);
	};
	$("#period .input-medium").blur();
	$("#vm-ul .active").click();
	setTimeout('VM.getFee()',500);
	setTimeout('allUnitFee()', 20);
}*/
