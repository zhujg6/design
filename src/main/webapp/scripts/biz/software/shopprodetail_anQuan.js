var feeUnit = 1000;
$(function(){
	$("#aA").hide();
	$("#bB").hide();
	if(shopprodetail.codeS == "A"){
		$("#aA").show();
	}
	if(shopprodetail.codeS == "B"){
		$("#bB").show();
	}
})
var shopprodetail = {
	microType : ["微型","小型A"],
	microCpu : 1,
	microMem : ["0.5","1"],
	isWin : false,	
	inited : false,
	initebs : false,
	wizard : null,
	instanceName : null,
	selectedInstanceId : null,
	countFiled : null,
	defaultNetwork : null,
	_generateContent_tmp : null,
	specProductId:[10050,10051,10053,10057],
	messageModal:null,
	currentUser:null,
	currentProduct : null,
	producttype : [],
	codeS:null,
	init : function(productId) {
		shopprodetail.codeSfun();
		//shopprodetail.getProduct(productId);
		shopprodetail.getPrtyConfig(productId);
		//shopprodetail.specProductOrder(productId);
		//lb_fan

		$("#aA").hide();
		$("#bB").hide();
		if(shopprodetail.codeS == "A"){
			$("#aA").show();
		}
		if(shopprodetail.codeS == "B"){
			$("#bB").show();
		}
	},
	//产品订购
	specProductOrder : function(productId){
		if($.inArray(productId,shopprodetail.specProductId) == -1)return;
		$(".specSoftPrice").show();
		$("tr:has('#osName')").remove();
		$(".softprice").remove();
		$(".shoporderprice hr").remove();
	},
	buttonClick: function(productId){
		//判断用户是否登录
		if(currentUserId>0){
			ConfirmWindow = new com.skyform.component.Modal(new Date().getTime(),"<h3>软件商城</h3>",
				"<center>请您确认购买？</center>",{
					buttons : [
						{
							name : '确定',
							attrs : [{name:'class',value:'btn btn-primary'}],
							onClick : function(){
								ConfirmWindow.hide();
								shopprodetail.tradSpecProduct(productId);
							}
						},
						{
							name : '取消',
							attrs : [{name:'class',value:'btn'}],
							onClick : function(){
								ConfirmWindow.hide();
							}
						}
					]
				});
			ConfirmWindow.setWidth(500).setTop(150).show();
		}else {
			ConfirmWindow = new com.skyform.component.Modal(new Date().getTime(),"<h3>软件商城</h3>",
				"<center>请您先去登录！</center>",{
					buttons : [
						{
							name : '确定',
							attrs : [{name:'class',value:'btn btn-primary'}],
							onClick : function(){
								window.location = ctx+"/jsp/login.jsp?returnURL=shopprodetail";
								ConfirmWindow.hide();
							}
						},
						{
							name : '取消',
							attrs : [{name:'class',value:'btn'}],
							onClick : function(){
								ConfirmWindow.hide();
							}
						}
					]
				});
			ConfirmWindow.setWidth(500).setTop(150).show();
		}
	},
	//确定提交订购信息
	tradSpecProduct :function(productId){
		$.blockUI();
		var period = $("button[name='period'].active").val();
		var standard = $("button[name='standard'].active").val();
		var instance = {
			"productList":
				[
					{
						"instanceName":shopprodetail.currentProduct.softwareName,
						"period": period,
						"productId": productId,
						"standard": standard
					}
				]
		};
		com.skyform.service.shopproorderService.createAccessSubscription(instance, function onCreated(result){
			var _tradeId = result.data.tradeId;
			if("-1"==_tradeId){
				$.unblockUI();
				com.skyform.service.shopproorderService.specProductOrder(result);
			} else {
				//查询订单总价格
				var chargeParams = {
					"ProductPropertyList" : [{
						"muProperty" : "standard",
						"muPropertyValue" : standard,
						"productId" : productId
					},{
						"muProperty" : "period",
						"muPropertyValue" : period,
						"productId" : productId
					}]
				};
				com.skyform.service.shopproorderService.queryAccessCaculateFeeByPrtyList(chargeParams, function onChargeSuccess(charge){
					var _fee = charge.data/1000;
					$.unblockUI();
					//校验余额是否充足
					com.skyform.service.shopproorderService.queryBalance(_fee,_tradeId,null,function(onSuccess){

					},function(onError){
						$.growlUI("错误", "软件订购提交失败!");
					});
				}, function onChargeError(e){
					$.growlUI("错误", "订单价格查询失败!");
				});
			}
		},function(e){
			$.growlUI("错误", e);
		});
	},
	//获取产品信息
	getProduct : function(productId){
		com.skyform.service.shopprodetailService.getProductDetail(productId,function onSuccess(data){
			shopprodetail.currentProduct = data[0];
			$("#productName").text(data[0].productName || "");
			$("#provider").text(data[0].provider || "");			
			var subdesc = commonUtils.subStr4view(data[0].productDetail, 300, "...") || "";
			$("#subProductDesc").text(subdesc);
			var ff = commonUtils.subStr4view(data[0].productDesc, 60, "...") || "";
			$("#feature").text(ff || "");
			$("#productDesc").text(data[0].productDesc || "");
			var logoUrl = Config.imageUrl+"/software/downloadForSoftware?downName="+data[0].logo+"&provider="+data[0].productAttr.sellerId;
			$("#productLogo").attr("src", logoUrl);
			$("#afterservice").html(data[0].productAttr.service || "");
			var _docs = data[0].productAccList;
			var docsContainer = $("#docs");
			docsContainer.empty();
			$(_docs).each(function(i,doc){
				var _docname = doc.accName || "";
				if(_docname != ""){
					var _docurl = Config.imageUrl+"/software/downloadForSoftware?downName="+doc.accUrl+"&provider="+data[0].productAttr.sellerId;
					$("<a href='"+_docurl+"'><i class='fa fa-file-text-o mr5'></i>"+_docname+"</a><br>").appendTo(docsContainer);
				}				
			});
		},function onError(msg){
			alert("onError");
		});
	},
	//获取价格信息
	getPrtyConfig : function(productId) {
		var params = {"parameter":{"productId":productId}};
		com.skyform.service.shopproorderService.getPrtyConfig(params,function onSuccess(data){
			if(!data.data){
				$.growlUI("提示", data.msg);
				setTimeout(function(){
					window.location = ctx+"/jsp/software/software.jsp";
				}, 2000);
			}
            var container = $(".softprice");
			shopprodetail.currentProduct = data.data.software;
			//渲染产品信息
			var software = data.data.software ? data.data.software : [];
			var logoUrl = Config.imageUrl+"/software/downloadForSoftware?downName="+software.logo+"&provider="+software.sellerId;
			//if(){}
			$("#productLogo").attr("src", logoUrl);
			$("#productName").text(software.softwareName || "");
			var ff = commonUtils.subStr4view(software.introduction, 120, "...") || "";
			$("#feature").text(ff || "");
			$("#productDesc").text(software.softwareDetail || "");
			$("#provider").text(data.data.provider || "");
			$("#customerServiceTel").text(software.customerServiceTel || "");
			$("#customerServiceMail").text(software.customerServiceMail || "");
			$("#customerServiceUrl").text(software.customerServiceUrl || "");
			var _docurl = Config.imageUrl+"/software/downloadForSoftware?downName="+software.useinstructions+"&provider="+software.sellerId;
			$("#docs").empty().append("<a href='"+_docurl+"'><i class='fa fa-file-text-o mr5'></i>"+software.useinstructions+"</a>");
			//渲染价格信息
			shopprodetail.producttype = data.data.producttype ? data.data.producttype : [];
			$(shopprodetail.producttype).each(function(index, priceInfo){
				$(".standardContent").append("<button type='button' name='standard' class='input_block' tabindex='"+index+"' value='"+ priceInfo.specificationNo+"'>"+priceInfo.specification+"</button>");
			});
			$(".standardContent button:eq(0)").addClass("active");
			shopprodetail.getPeriodAndFee(0);
			$(".standardContent").find("button").unbind("click").bind("click", function(){
				$(this).parent("div").find("button").removeClass("active");
				$(this).addClass("active");
				var speIndex = $(".standardContent button.active").attr("tabindex");
				shopprodetail.getPeriodAndFee(speIndex);
			});
		},function onError(msg){
			
		});		
	},
	getPeriodAndFee : function(speIndex){
		var periodAndPrices = shopprodetail.producttype[speIndex].prices;
		if(periodAndPrices && periodAndPrices.length==0)	return;
		$(".periodContent").empty();
		$(periodAndPrices).each(function(index, item){
			var period = item.period;
			var periodText = period+"月";
			if(Number(period)>=12 && Number(period)%12==0){
				periodText = period/12 + "年";
			}
			$(".periodContent").append("<button type='button' name='period' class='input_block' tabindex='"+ index +"' value='"+ item.period +"'>"+periodText+"</button>");
		});
		$(".periodContent button:eq(0)").addClass("active");
		shopprodetail.getFee(speIndex, 0);
		$(".periodContent").find("button").unbind("click").bind("click", function(){
			$(this).parent("div").find("button").removeClass("active");
			$(this).addClass("active");
			var periodIndex = $(".periodContent button.active").attr("tabindex");
			shopprodetail.getFee(speIndex, periodIndex);
		});
	},
	getFee : function(speIndex, periodIndex){
		var price = shopprodetail.producttype[speIndex].prices[periodIndex].price;
		$(".now_price").html("¥"+price);
	},
	codeSfun:function(){
		shopprodetail.codeS=GetQueryString("code");
	}
};
function GetQueryString(name){
	var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
	var r = window.location.search.substr(1).match(reg);
	if(r!=null)return  unescape(r[2]); return null;
}