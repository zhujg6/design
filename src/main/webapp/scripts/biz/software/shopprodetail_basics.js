var feeUnit = 1000;
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
	
	init : function(productId) {
		//shopprodetail.getProduct(productId);
		shopprodetail.getPrtyConfig(productId);
		//shopprodetail.specProductOrder(productId);
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
	}
};
//基础类
var basicsObj={
	init:function(){
		var list=[
			{
				"index":0,
				"code":1,
				"image":"os",
				"osType":"WIN",
				"image_div_id":1092,
				"productName":"Java环境Windows Server 2008 R2企业版",
				"productDesc":"系统概述：WINSRV_2008,JDK1.8",
				"osDisk":50,
				"os":"Windows",
				"provider":"云数据公司",
				"version":"1.0",
				"url":"Java_Windows_Server_2008_R2",
				"productBriefBas":"WINSRV_2008,JDK1.8",
				//"productDetailsBas":"镜像环境均采用官方发布的软件安装，Tomcat与MySQL采用官方的免安装版，开放镜像环境安装的脚本源代码，可自行用脚本在对应云主机上初始化镜像环境；所有软件均使用开源版本或评估版（WinRAR），不存在侵权问题；Jdk是面向对象的跨平台应用软件的程序设计语言Java的软件开放工具包（即SDK），包含Java编译环境jdk和Java运行环境jre；Tomcat，由Apache和Sun为主力共同开发，支持最新的Servlet和JSP规范。因其技术先进性能稳定且免费而成为时下最流行的Web应用服务器。"
				"productDetailsBas":"Windows平台Java运行环境，全能环境，Apache tomcat整合环境;Apache 2.4.7，Nginx 1.5.8，LightTPD 1.4.32，MySQL 5.5.35，MySQL-Front 5.3，phpMyAdmin 4.1.0，OpenSSL 1.0.1e，Zend Loader 5.5.0，Zend Loader 6.0.0，Apache tomcat 6.0.45，Apache tomcat 7.0.69，Apache tomcat 8.0.36，Apache tomcat 9.0.0，jdk1.6.38，jdk1.7.79，jdk1.8.92<br/>【注意：本镜像为Apache整合tomcat，需要一定技术功底才能使用；本环境默认配置仅支持Java程序运行，如需PHP环境或者PHP+Java多站点共用，需修改配置文件，可联系在线技术支持，此操作收费，本镜像为免费镜像，不含技术支持，如需帮助请联系客服付费处理】<br/>该镜像采用Windows Server 2008 R2 操作系统，服务器远程管理端口默认3389，账户administrator，默认密码为购买镜像时设置的密码；<br/>phpmyadmin管理地址，http://localhost/phpMyAdmin/<br/>mysql默认的管理用户名:root 默认密码:cldera.com<br/>产品说明 <br/>1、全面适合 Win2000/XP/2003/win7/win8/win2008 操作系统 ,支持Apache、IIS、Nginx和LightTPD。<br/>2、该程序包集成以下软件，多版本可任意切换。<br/>Apache 2.4.7  最流行的HTTP服务器软件，快速、可靠、开源。<br/>Nginx 1.5.8 <br/>LightTPD 1.4.32 <br/>MySQL 5.5.35 执行性能高，运行速度快，容易使用，非常棒数据库。<br/>MySQL-Front 5.3 <br/>phpMyAdmin 4.1.0 开源、基于WEB而小巧的MySQL管理程序。<br/>OpenSSL 1.0.1e 密码算法库、SSL协议库以及应用程序。<br/>Zend Loader 5.5.0 免费的PHP优化引擎 <br/>Zend Loader 6.0.0 <br/>3、MySQL数据库用户名：root，密码cldera.com，安装后请重新设置密码。<br/>4、本程序支持PHP5.3和PHP5.4一键切换，支持系统服务和非服务两种启动方式，自由切换。改变安装路径或拷贝到别的电脑上也可正常运行；即便是运行完再更改路径也能运行，真正做到无须配置。重写控制面板更加有效直观地进行控制程序的启停。<br/>5、新增站点和配置网站，使用『其他选项菜单』-『站点域名管理』，添加域名、目录；<br/>6、自带FTP服务器，支持多用户，无需再安装FTP服务器。使用『其他选项菜单』-『phpStudy设置』-『Ftp Serv管理器』用户设置，FTP设置，IP限制等都在菜单设置下。<br/>7、如有软件不能正常使用的情况请联系在线技术支持；<br/>售后支持<br/>其他技术难题，新建网站，网站调试，网站不能正常访问等问题，请联系在线技术支持。"
			},
			{
				"index":1,
				"code":1,
				"image":"os",
				"osType":"WIN",
				"image_div_id":1091,
				"productName":"PHP免安装环境Windows Server 2012 企业版",
				"productDesc":"系统概述：WINSRV_2008,PHP5.3",
				"osDisk":50,
				"os":"Windows",
				"provider":"云数据公司",
				"version":"1.0",
				"url":"PHP_Windows_Server_2012",
				"productBriefBas":"WINSRV_2008,PHP5.3",
				//"productDetailsBas":"内置主机宝WANMP版本管理面板，轻松管理服务器、网站、数据库、数据备份和FTP等，全能环境支持市面所有常见程序。凭借站长网八年运维经验，针对系统安全和设置进行优化，提高系统本身的安全性和稳定性。主机宝简易直观的操作还可以规避常见的网站程序漏洞引起的安全风险，网站之间分别以独立账号运行互不干扰，杜绝提权入侵。面板迁移功能可以一键切换数据库、站点到云主机数据磁盘，帮您最大化利用云主机磁盘空间，同时也避免了因操作系统故障引起数据丢失的风险。7x24全天候在线售后支持全力为您的应用保驾护航，站长网诚挚为您服务！"
				"productDetailsBas":"Windows平台Java运行环境，全能环境，Apache tomcat整合环境：<br/>PHP 5.2.17，PHP 5.3.28，PHP 5.4.23，PHP 5.5.7；Apache 2.4.7，Nginx 1.5.8，LightTPD 1.4.32，MySQL 5.5.35，MySQL-Front 5.3，phpMyAdmin 4.1.0，OpenSSL 1.0.1e，Zend Loader 5.5.0，Zend Loader 6.0.0;<br/>该镜像采用Windows Server 2012 R2 操作系统，服务器远程管理端口默认3389，账户administrator，默认密码为购买镜像时设置的密码；<br/>phpmyadmin管理地址，http://localhost/phpMyAdmin/<br/>mysql默认的管理用户名:root 默认密码:cldera.com<br/>【注意：本镜像为Apache整合tomcat，需要一定技术功底才能使用；本环境默认配置仅支持Java程序运行，如需PHP环境或者PHP+Java多站点共用，需修改配置文件，可联系在线技术支持，此操作收费,本镜像为免费镜像，不含技术支持，如需帮助请联系客服付费处理】<br/>产品说明<br/>1、全面适合 Win2000/XP/2003/win7/win8/win2012 操作系统 ,支持Apache、IIS、Nginx和LightTPD。<br/>2、该程序包集成以下软件，多版本可任意切换。<br/>默认PHP版本为 PHP 5.3.28，如需切换PHP版本，打开软件，选择“其他选项菜单”——“PHP版本切换”，选择适合自己的版本；<br/>PHP 5.2.17  新型的CGI程序编写语言，易学易用、速度快、跨平台。<br/>PHP 5.3.28  新型的CGI程序编写语言，易学易用、速度快、跨平台。<br/>PHP 5.4.23  新型的CGI程序编写语言，易学易用、速度快、跨平台。<br/>PHP 5.5.7   新型的CGI程序编写语言，易学易用、速度快、跨平台。<br/>Apache 2.4.7  最流行的HTTP服务器软件，快速、可靠、开源。<br/>Nginx 1.5.8 <br/>LightTPD 1.4.32 <br/>MySQL 5.5.35 执行性能高，运行速度快，容易使用，非常棒数据库。<br/>MySQL-Front 5.3 <br/>phpMyAdmin 4.1.0 开源、基于WEB而小巧的MySQL管理程序。<br/>OpenSSL 1.0.1e 密码算法库、SSL协议库以及应用程序。<br/>Zend Loader 5.5.0 免费的PHP优化引擎 <br/>Zend Loader 6.0.0 <br/>3、MySQL数据库用户名：root，密码cldera.com，安装后请重新设置密码。<br/>4、本程序支持PHP5.3和PHP5.4一键切换，支持系统服务和非服务两种启动方式，自由切换。改变安装路径或拷贝到别的电脑上也可正常运行；即便是运行完再更改路径也能运行，真正做到无须配置。重写控制面板更加有效直观地进行控制程序的启停。<br/>5、新增站点和配置网站，使用『其他选项菜单』-『站点域名管理』，添加域名、目录；<br/>6、自带FTP服务器，支持多用户，无需再安装FTP服务器。使用『其他选项菜单』-『phpStudy设置』-『Ftp Serv管理器』用户设置，FTP设置，IP限制等都在菜单设置下。<br/>7、如有软件不能正常使用的情况请联系在线技术支持；<br/>售后支持<br/>其他技术难题，新建网站，网站调试，网站不能正常访问等问题，请联系在线技术支持。"
			},
			{
				"index":2,
				"code":1,
				"image":"os",
				"osType":"CENT",
				"image_div_id":1090,
				"productName":"PHP运行环境（CentOS7.1 64位 | Apache2.2 | PHP5.3 |Mysql5.1）",
				"productDesc":"系统概述：Centos6.5，Apache2.2，MSQ5.1，PHP5.3",
				"osDisk":20,
				"os":"Windows",
				"provider":"云数据公司",
				"version":"1.0",
				"url":"PHP_LAMP",
				"productBriefBas":"Centos6.5，Apache2.2，MSQ5.1，PHP5.3",
				//"productDetailsBas":"镜像集成CentOS7.1 64位 | Apache2.2 | PHP5.3 |Mysql5.1，已针对网站环境和系统安全设置优化，有效提升访问速度和负载能力，所有市面程序均可正常安装运行。通过内置的主机宝控制面板轻松管理服务器、网站和备份数据等，省去了繁琐的配置流程，简易直观的操作让您零基础安全轻松的使用云主机。"
				"productDetailsBas":"产品亮点 <br/>1. 系统源码安装，安全、稳定、高效！<br/>2. 源码编译安装，细节安全优化，纯命令行，占用系统资源低 。<br/>3. 默认PHP5.6，支持PHP5.3、5.4、5.5和7.0版本自由切换 。<br/>4. jemalloc优化MySQL、Nginx内存管理。 <br/>5. 交互添加Nginx虚拟主机，方便快捷 <br/>6. 菜单式FTP账号管理脚本，轻松建立ftp虚拟用户 。<br/>7. 提供在线Nginx、MySQL、PHP、Redis、phpMyAdmin升级脚本 。<br/>8. 提供本地备份和远程备份（服务器之间rsync）。<br/>使用指南<br/>文档下载链接：加载镜像后，浏览器访问购买的服务器公网IP地址，看到demo页面，下载文档<br/>产品组成 <br/>Nginx1.10.2 <br/>PHP5.3.29、PHP5.4.45、PHP5.5.38、PHP5.6.28、PHP7.0.13、PHP7.1.0 <br/>MySQL5.6.34 <br/>Redis3.2.5 <br/>Memcached1.4.33 <br/>Jemalloc4.3.1 <br/>Pure-FTPd1.0.43 <br/>phpMyAdmin4.4.15.9<br/>售后支持 <br/>09:00--18:00 （工作日）在线客服 <br/>注意：非人为的产品自身BUG，官方免费修复；人为处理产生的售后服务，我司酌情收费 "
			},
			{
				"index":3,
				"code":1,
				"image":"os",
				"osType":"CENT",
				"image_div_id":1089,
				"productName":"Java运行环境（CentOS7.1 64位 | Tomcat7 | Java7 |Mysql5.1）",
				"productDesc":"系统概述：Centos6.5，MSQ5.1，JDK1.7,TOMCAT7",
				"osDisk":20,
				"os":"Windows",
				"provider":"云数据公司",
				"version":"1.0",
				"url":"Java_Linux",
				"productBriefBas":"Centos6.5，MSQ5.1，JDK1.7,TOMCAT7",
				//"productDetailsBas":"镜像集成CentOS7.1 64位 | Tomcat7 | Java7 |Mysql5.1，已针对网站环境和系统安全设置优化，有效提升访问速度和负载能力，所有市面程序均可正常安装运行。通过内置的主机宝控制面板轻松管理服务器、网站和备份数据等，省去了繁琐的配置流程，简易直观的操作让您零基础安全轻松的使用云主机。"
				"productDetailsBas":"产品亮点<br/>1. 系统源码安装，安全、稳定、高效！<br/>2. 源码编译安装，细节安全优化，纯命令行，占用系统资源低<br/>3. MySQL 5.5.35 执行性能高，运行速度快，容易使用，非常棒数据库。 <br/>4. jemalloc优化MySQL、Nginx内存管理；<br/> 5. 交互添加Nginx虚拟主机，方便快捷 <br/>6. 菜单式FTP账号管理脚本，轻松建立ftp虚拟用户 <br/>7. 提供在线Nginx、MySQL、PHP、Redis、phpMyAdmin升级脚本 <br/>8. 提供本地备份和远程备份（服务器之间rsync）。<br/>使用指南 <br/>文档下载链接：加载镜像后，浏览器访问购买的服务器公网IP地址，看到demo页面，下载文档。<br/>产品组成 <br/>Nginx1.10.2，<br/>Apache 2.4.7，<br/>LightTPD 1.4.32，<br/>MySQL 5.5.35，<br/>MySQL-Front 5.3，<br/>OpenSSL 1.0.1e，<br/>Zend Loader 5.5.0，<br/>Zend Loader 6.0.0，<br/>Apache tomcat 6.0.45，<br/>Apache tomcat 7.0.69，<br/>Apache tomcat 8.0.36，<br/>Apache tomcat 9.0.0，<br/>jdk1.6.38，jdk1.7.79，<br/>jdk1.8.92。<br/>售后支持 <br/>09:00--18:00 （工作日）在线客服。<br/>注意：非人为的产品自身BUG，官方免费修复；人为处理产生的售后服务，我司酌情收费。 "
			},
			{
				"index":4,
				"code":1,
				"image":"os",
				"osType":"WIN",
				"image_div_id":1088,
				"productName":"Windows Server 2012 安全加固",
				"productDesc":"系统概述：系统安全加固",
				"osDisk":50,
				"os":"Windows",
				"provider":"云数据公司",
				"version":"1.0",
				"url":"CENTOS",
				"productBriefBas":"系统安全加固",
				//"productDetailsBas":"Windows Server 2012 安全加固环境支持: php 5.2， php 5.3，php 5.4，php 5.5，MySQL 5.5，.NET 2.0， .NET 3.5， .NET 4.0；php组件: Zend，OpenSSL， GD，MySQLi， PDO MySQL等；FTP用户名和密码，MySQL root密码，phpMyAdmin访问地址在桌面的配置信息里面，登录远程桌面即可查看；"
				"productDetailsBas":"系统安全加固<br/>Windows Server 2012中文系统，增加了系统安全防护。<br/>Windows平台Java运行环境，全能环境，Apache tomcat整合环境：<br/>PHP 5.2.17，PHP 5.3.28，PHP 5.4.23，PHP 5.5.7；Apache 2.4.7，Nginx 1.5.8，LightTPD 1.4.32，MySQL 5.5.35，MySQL-Front 5.3，phpMyAdmin 4.1.0，OpenSSL 1.0.1e，Zend Loader 5.5.0，Zend Loader 6.0.0;<br/>该镜像采用Windows Server 2012 R2 操作系统，服务器远程管理端口默认3389，账户administrator，默认密码为购买镜像时设置的密码；<br/>phpmyadmin管理地址，http://localhost/phpMyAdmin/<br/>mysql默认的管理用户名:root 默认密码:cldera.com<br/>【注意：本镜像为Apache整合tomcat，需要一定技术功底才能使用；本环境默认配置仅支持Java程序运行，如需PHP环境或者PHP+Java多站点共用，需修改配置文件，可联系在线技术支持，此操作收费,本镜像为免费镜像，不含技术支持，如需帮助请联系客服付费处理】<br/>产品介绍 <br/>1、全面适合 Win2000/XP/2003/win7/win8/win2012 操作系统 ,支持Apache、IIS、Nginx和LightTPD。<br/>2、该程序包集成以下软件，多版本可任意切换。<br/>默认PHP版本为 PHP 5.3.28，如需切换PHP版本，打开软件，选择“其他选项菜单”——“PHP版本切换”，选择适合自己的版本；<br/>PHP 5.2.17  新型的CGI程序编写语言，易学易用、速度快、跨平台。<br/>PHP 5.3.28  新型的CGI程序编写语言，易学易用、速度快、跨平台。<br/>PHP 5.4.23  新型的CGI程序编写语言，易学易用、速度快、跨平台。<br/>PHP 5.5.7   新型的CGI程序编写语言，易学易用、速度快、跨平台。<br/>Apache 2.4.7  最流行的HTTP服务器软件，快速、可靠、开源。<br/>Nginx 1.5.8 <br/>LightTPD 1.4.32 <br/>MySQL 5.5.35 执行性能高，运行速度快，容易使用，非常棒数据库。<br/>MySQL-Front 5.3 <br/>phpMyAdmin 4.1.0 开源、基于WEB而小巧的MySQL管理程序。<br/>OpenSSL 1.0.1e 密码算法库、SSL协议库以及应用程序。<br/>Zend Loader 5.5.0 免费的PHP优化引擎 <br/>Zend Loader 6.0.0 <br/>3、MySQL数据库用户名：root，密码cldera.com，安装后请重新设置密码。<br/>4、本程序支持PHP5.3和PHP5.4一键切换，支持系统服务和非服务两种启动方式，自由切换。改变安装路径或拷贝到别的电脑上也可正常运行；即便是运行完再更改路径也能运行，真正做到无须配置。重写控制面板更加有效直观地进行控制程序的启停。<br/>5、新增站点和配置网站，使用『其他选项菜单』-『站点域名管理』，添加域名、目录；<br/>6、自带FTP服务器，支持多用户，无需再安装FTP服务器。使用『其他选项菜单』-『phpStudy设置』-『Ftp Serv管理器』用户设置，FTP设置，IP限制等都在菜单设置下。<br/>7、如有软件不能正常使用的情况请联系在线技术支持；<br/>售后支持<br/>其他技术难题，新建网站，网站调试，网站不能正常访问等问题，请联系在线技术支持"
			},
			{
				"index":5,
				"code":1,
				"image":"os",
				"osType":"WIN",
				"image_div_id":1087,
				"productName":"Windows Server 2008 安全加固",
				"productDesc":"系统概述：系统安全加固",
				"osDisk":50,
				"os":"Windows",
				"provider":"云数据公司",
				"version":"1.0",
				"url":"Windows2012",
				"productBriefBas":"系统安全加固",
				//"productDetailsBas":"全自动部署环境，为用户省去了繁杂配置工作，用户仅需点点鼠标即可建立自己想要的站点以及ftp。全面支持asp/.net/php/java/mysql等脚本语言，用户可以随意切换，运用自如。"
				"productDetailsBas":"系统安全加固<br/>Windows Server 2008中文系统，增加了系统安全防护。<br/>Windows平台Java运行环境，全能环境，Apache tomcat整合环境;Apache 2.4.7，Nginx 1.5.8，LightTPD 1.4.32，MySQL 5.5.35，MySQL-Front 5.3，phpMyAdmin 4.1.0，OpenSSL 1.0.1e，Zend Loader 5.5.0，Zend Loader 6.0.0，Apache tomcat 6.0.45，Apache tomcat 7.0.69，Apache tomcat 8.0.36，Apache tomcat 9.0.0，jdk1.6.38，jdk1.7.79，jdk1.8.92<br/>【注意：本镜像为Apache整合tomcat，需要一定技术功底才能使用；本环境默认配置仅支持Java程序运行，如需PHP环境或者PHP+Java多站点共用，需修改配置文件，可联系在线技术支持，此操作收费，本镜像为免费镜像，不含技术支持，如需帮助请联系客服付费处理】<br/>该镜像采用Windows Server 2008 R2 操作系统，服务器远程管理端口默认3389，账户administrator，默认密码为购买镜像时设置的密码；<br/>phpmyadmin管理地址，http://localhost/phpMyAdmin/<br/>mysql默认的管理用户名:root 默认密码:cldera.com<br/>产品说明 <br/>1、全面适合 Win2000/XP/2003/win7/win8/win2008 操作系统 ,支持Apache、IIS、Nginx和LightTPD。<br/>2、该程序包集成以下软件，多版本可任意切换。<br/>Apache 2.4.7  最流行的HTTP服务器软件，快速、可靠、开源。<br/>Nginx 1.5.8 <br/>LightTPD 1.4.32 <br/>MySQL 5.5.35 执行性能高，运行速度快，容易使用，非常棒数据库。<br/>MySQL-Front 5.3 <br/>phpMyAdmin 4.1.0 开源、基于WEB而小巧的MySQL管理程序。<br/>OpenSSL 1.0.1e 密码算法库、SSL协议库以及应用程序。<br/>Zend Loader 5.5.0 免费的PHP优化引擎 <br/>Zend Loader 6.0.0 <br/>3、MySQL数据库用户名：root，密码cldera.com，安装后请重新设置密码。<br/>4、本程序支持PHP5.3和PHP5.4一键切换，支持系统服务和非服务两种启动方式，自由切换。改变安装路径或拷贝到别的电脑上也可正常运行；即便是运行完再更改路径也能运行，真正做到无须配置。重写控制面板更加有效直观地进行控制程序的启停。<br/>5、新增站点和配置网站，使用『其他选项菜单』-『站点域名管理』，添加域名、目录；<br/>6、自带FTP服务器，支持多用户，无需再安装FTP服务器。使用『其他选项菜单』-『phpStudy设置』-『Ftp Serv管理器』用户设置，FTP设置，IP限制等都在菜单设置下。<br/>7、如有软件不能正常使用的情况请联系在线技术支持；<br/>售后支持<br/>其他技术难题，新建网站，网站调试，网站不能正常访问等问题，请联系在线技术支持"
			},
			{
				"index":6,
				"code":1,
				"image":"os",
				"osType":"CENT",
				"image_div_id":1086,
				"productName":"CentOS 7.3 64位 安全加固",
				"productDesc":"系统概述：系统安全加固",
				"osDisk":20,
				"os":"Linux",
				"provider":"云数据公司",
				"version":"1.0",
				"url":"winnew",
				"productBriefBas":"系统安全加固",
				//"productDetailsBas":"由Websoft9提供的全能环境稳定可靠，预装了IIS、Tomcat应用服务器，支持.NET、JAVA、PHP、MySQL以及其他必要组件，帮助您在CENT服务器下快速的安装部署多语言应用程序。"
				"productDetailsBas":"系统安全加固<br/>CentOS 7.3 64位操作系统，增加了系统安全防护。<br/>产品亮点 <br/>1. 全自动部署环境，全自动挂载硬盘，为用户省去了大部分繁杂的工作，用户仅需点点鼠标即可建立自己想要的站点。<br/>2. 齐全而完备的功能，让用户几乎不需要登陆服务器，就可以通过面板来管理服务器。<br/>3. 全面支持php/java等脚本语言，用户可以随意切换，运用自如。<br/>4. 完善的数据采集分析功能，图表显示cpu、内存、带宽的使用情况，让用户对服务器情况了如指掌，访问统计及流量分析的数据可以对网站访问情况有个充分掌握。<br/>5. 数据库的定期备份和自助恢复，保证了的站点数据不会丢失，自助数据库导入不限大小，更是给用户带来了方便。<br/>6.PHP系列支持memcache​ 支持连接云数据库（RDS） 脚本为php5.3/5.4/5.5/5.6时支持连接云数据库 Memcache 版。<br/>产品说明 <br/>核心架构基于沃云服务器CentOS 7.3 64位操作系统，全面支持shopex、php168、phpwind、wordpress、ecshop、discuz、dedecms、phpcms、hishop等主流程序 <br/>支持软件版本： Nginx 1.8.x、PHP5.2/5.3/5.4/5.5/5.6/7.0、MySQL5.x、ZendOptimizer、Java 1.8、Tomcat 6/Tomcat 7/Tomcat 8 <br/>基本模块： php mysql zend ctype filter hash session standard Reflection SPL suhosin json ldap pcntl pcre ftp zip zlib Suhosin libxml memcache <br/>xml解析： xml xmlrpc xmlreader xmlwriter SimpleXML libxml <br/>数据库扩展： PDO pdo_mysql pdo_sqlite pdo_sqlite SQLite mysql mysqli <br/>优化/安全/加密： Zend Optimizer mcrypt openssl <br/>图形/文字： gd ctype mbstring iconv gettext imagick <br/>网络/压缩： curl ftp sockets zip zlib<br/>售后支持 <br/>技术难题，新建网站，网站调试，网站不能正常访问等问题，请联系在线技术支持。"
			},
			{
				"index":7,
				"code":1,
				"image":"os",
				"osType":"CENT",
				"image_div_id":1085,
				"productName":"CentOS 6.8 64位 安全加固",
				"productDesc":"系统概述：系统安全加固",
				"osDisk":20,
				"os":"Linux",
				"provider":"云数据公司",
				"version":"1.0",
				"url":"linuxnew",
				"productBriefBas":"系统安全加固",
				//"productDetailsBas":"集成了CentOS 6.8 64位 安全加固、IIS8.5、FTP、ASP、ASP.NET2.0/3.5/4.0/4.5/4.6、PHP5.2~5.6、URLRewrite伪静态、RAR工具等"
				"productDetailsBas":"<br/>系统安全防护<br/>CentOS 6.8 64位操作系统，增加了系统安全防护。<br/>产品说明 <br/>MySQL的root密码：cldera <br/>phpmyadmin后台管理账户：root    密码：cldera <br/>CentOS 6.8 64位 PHP5.5 MySQL5.5 <br/>MySQL配置文件：/etc/my.cnf <br/>PHP配置文件：/etc/php-fpm.d/ <br/>Nginx配置目录在：/etc/nginx/ <br/>phpMyAdmin的配置文件：/etc/phpMyAdmin/ <br/>切换Apache作为默认的WEB服务器 <br/>chkconfig nginx off <br/>chkconfig php-fpm off <br/>修改Apache配置文件httpd.conf，将88端口改为80端口 <br/>chkconfig httpd on <br/>/etc/init.d/httpd start <br/>/etc/init.d/httpd stop <br/>/etc/init.d/httpd restart <br/>1、环境采用CentOS纯净版安装，所有软件均为yum更新；<br/>2、从CentOS官方获取相应软件，安装目录均为系统和软件默认路径，维护方便，程序稳定；<br/>3、可在云主机上初始化镜像环境。<br/>4、openssl已升级至最新版本1.0.1e。<br/>5、apache+php和nginx+php的组合，自由搭配，nginx更加高效，稳定，速度更快。<br/>售后支持 <br/>1、如有软件不能正常使用的情况请联系在线技术支持；<br/>2、如需在线技术支持，配置、调试、故障排查等根据本公司服务类商品定价；<br/>注意 <br/>镜像操作系统为公司定制，并经过反复测试验证，免费镜像为客户体验使用，收费镜像为镜像制作费用，除镜像本身默认环境问题，均不含任何人工技术支持。"
			}
		];
		var index=$("#indexBasics").val();
		var listUrl=list[index].url;
		var listProductName=list[index].productName;
		var listProductBriefBas=list[index].productBriefBas;
		var listProductDetailsBas=list[index].productDetailsBas;
		$("#productLogo").attr("src","../../images/"+listUrl+".png");
		$("#productName").html(listProductName);
		$("#feature").html(listProductBriefBas);
		$("#productDesc").html(listProductDetailsBas);
		//href="'+ctx+'/jsp/maintain/createVMfan.jsp?code=1&osDisk='+ p.osDisk+'&image='+ p.image+'&osType='+ p.osType+'&image_div_id='+ p.image_div_id+'&productName='+ encodeURI(encodeURI(p.productName))+'"
		$("#btnOrder").attr("href",ctx+'/jsp/maintain/createVMfan.jsp?code=1&osDisk='+ list[index].osDisk+'&image='+ list[index].image+'&osType='+ list[index].osType+'&image_div_id='+ list[index].image_div_id+'&productName='+ encodeURI(encodeURI(list[index].productName)))
	}
};
$(function(){
	basicsObj.init();
});