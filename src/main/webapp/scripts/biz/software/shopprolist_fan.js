$().ready(function(){
	var code = $("#code").val();
	Shop.listProduct(1,code);
	Page.qingkong();
});

var Shop = {
	service : com.skyform.service.shopProductService,
	listProduct : function(page,code){
		code = $("#code").val();
		$("#productList").empty();
		var serviceType = $("#serviceType").val();
		var timestamp=null;
		var pagesize=null;
		Shop.service.listAllProduct(serviceType,page,timestamp,pagesize,function(data){
			if(data&&data.list){
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
						"productDetailsBas":"镜像环境均采用官方发布的软件安装，Tomcat与MySQL采用官方的免安装版，开放镜像环境安装的脚本源代码，可自行用脚本在对应云主机上初始化镜像环境；所有软件均使用开源版本或评估版（WinRAR），不存在侵权问题；Jdk是面向对象的跨平台应用软件的程序设计语言Java的软件开放工具包（即SDK），包含Java编译环境jdk和Java运行环境jre；Tomcat，由Apache和Sun为主力共同开发，支持最新的Servlet和JSP规范。因其技术先进性能稳定且免费而成为时下最流行的Web应用服务器。"

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
						"productDetailsBas":"内置主机宝WANMP版本管理面板，轻松管理服务器、网站、数据库、数据备份和FTP等，全能环境支持市面所有常见程序。凭借站长网八年运维经验，针对系统安全和设置进行优化，提高系统本身的安全性和稳定性。主机宝简易直观的操作还可以规避常见的网站程序漏洞引起的安全风险，网站之间分别以独立账号运行互不干扰，杜绝提权入侵。面板迁移功能可以一键切换数据库、站点到云主机数据磁盘，帮您最大化利用云主机磁盘空间，同时也避免了因操作系统故障引起数据丢失的风险。7x24全天候在线售后支持全力为您的应用保驾护航，站长网诚挚为您服务！"
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
						"os":"Centos",
						"provider":"云数据公司",
						"version":"1.0",
						"url":"PHP_LAMP",
						"productBriefBas":"Centos6.5，Apache2.2，MSQ5.1，PHP5.3",
						"productDetailsBas":"镜像集成CentOS7.1 64位 | Apache2.2 | PHP5.3 |Mysql5.1，已针对网站环境和系统安全设置优化，有效提升访问速度和负载能力，所有市面程序均可正常安装运行。通过内置的主机宝控制面板轻松管理服务器、网站和备份数据等，省去了繁琐的配置流程，简易直观的操作让您零基础安全轻松的使用云主机。"
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
						"os":"Centos",
						"provider":"云数据公司",
						"version":"1.0",
						"url":"Java_Linux",
						"productBriefBas":"Centos6.5，MSQ5.1，JDK1.7,TOMCAT7",
						"productDetailsBas":"镜像集成CentOS7.1 64位 | Tomcat7 | Java7 |Mysql5.1，已针对网站环境和系统安全设置优化，有效提升访问速度和负载能力，所有市面程序均可正常安装运行。通过内置的主机宝控制面板轻松管理服务器、网站和备份数据等，省去了繁琐的配置流程，简易直观的操作让您零基础安全轻松的使用云主机。"
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
						"productDetailsBas":"Windows Server 2012 安全加固环境支持: php 5.2， php 5.3，php 5.4，php 5.5，MySQL 5.5，.NET 2.0， .NET 3.5， .NET 4.0；php组件: Zend，OpenSSL， GD，MySQLi， PDO MySQL等；FTP用户名和密码，MySQL root密码，phpMyAdmin访问地址在桌面的配置信息里面，登录远程桌面即可查看；"
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
						"productDetailsBas":"全自动部署环境，为用户省去了繁杂配置工作，用户仅需点点鼠标即可建立自己想要的站点以及ftp。全面支持asp/.net/php/java/mysql等脚本语言，用户可以随意切换，运用自如。"
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
						"productDetailsBas":"由Websoft9提供的全能环境稳定可靠，预装了IIS、Tomcat应用服务器，支持.NET、JAVA、PHP、MySQL以及其他必要组件，帮助您在CENT服务器下快速的安装部署多语言应用程序。"
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
						"productDetailsBas":"集成了CentOS 6.8 64位 安全加固、IIS8.5、FTP、ASP、ASP.NET2.0/3.5/4.0/4.5/4.6、PHP5.2~5.6、URLRewrite伪静态、RAR工具等"
					}
				];
				$(list).each(function(i,p){
					var logo = Config.imageUrl + "/software/downloadForSoftware?";
					var logo1 = ctx+'/images/';
					logo =logo1+ p.url+".png";
					var product = $('<div class="softlist" productId="'+p.productId+'">'
					//+'<div class="span2"><a href="'+ctx+'/jsp/maintain/createVMfan.jsp?code=1&osDisk='+ p.osDisk+'&image='+ p.image+'&osType='+ p.osType+'&image_div_id='+ p.image_div_id+'&productName='+ encodeURI(encodeURI(p.productName))+'"><img src="'+logo+'"/></a></div>'
					+'<div class="span2"><a href="'+ctx+'/jsp/software/basicsPage.jsp?index='+ p.index+'"><img src="'+logo+'"/></a></div>'
					+'<div class="span4">'
					+'<h2 class="mb10"><a href="'+ctx+'/jsp/software/basicsPage.jsp?index='+ p.index+'">'+transNullStr(p.productName)+'</h2><p class="tcolor7">'+transNullStr(p.productDesc)+'</p></a></div>'
					+'<div class="span1 mt30"><p class="softprice mb10"></p></div>'
					+'<div class="span3 mt30"><p class="softos">系统：'+transNullStr(p.os)+'</p>'
					+'<p class=" tcolor5">软件提供商：'+transNullStr(p.provider)+'</p><p class=" tcolor5">软件版本：'+transNullStr(p.version)+'</p>'
					+'</div></div>'	);
					product.appendTo($("#productList"));
				});
				//Page.initPage(data.pages,page);
				Page.initPage(1,page);
			}
		})
	}
};

var Page = {
	pre : $('<li id="pre"><a href="#">上一页</a></li>'),
	next : 	$('<li id="next"><a href="#">下一页</a></li>'),
	totalPage : 0,
	curPage : 0,
	initPage:function(pages,page){
		if(pages>0){
			$("#pageBar").empty().append(Page.pre);
			Page.totalPage =  pages;
			for(var i=1;i<=Page.totalPage;i++){
				var p = $('<li value="'+(i)+'"><a href="#">'+i+'</a></li>');
				p.click(function(){
					$("#pageBar li").removeClass("active");
					var curPage = $(this).val();
					Page.curPage = curPage;
					Page.turnToPage(Page.curPage);
				});
				p.appendTo($("#pageBar"));
			}
			$("#pageBar").append(Page.next);
			if(!isNaN(page)){
				$("#pageBar li[value='"+page+"']").addClass("active");
				$("#pre").removeClass("disabled");
				$("#pre a").removeAttr("disabled");
				$("#next").removeClass("disabled");
				$("#next a").removeAttr("disabled");
				if(page == 1){
					$("#pre").addClass("disabled");
					$("#pre a").attr("disabled",true);
				}
				if(page == Page.totalPage){
					$("#next").addClass("disabled");
					$("#next a").attr("disabled",true);
				}
			}
			else if(!$("#pageBar li").hasClass("active")){
				$("#pageBar li:eq(1)").addClass("active");
				$("#pre").addClass("disabled");
				if(Page.totalPage == 1){
					$("#next").addClass("disabled");
				}
			}

		}
		$("#pre").click(function(){
			if(Page.curPage > 1){
				Page.curPage = Page.curPage-1;
				Shop.listProduct(Page.curPage);
			}

		});
		$("#next").click(function(){
			if(Page.curPage < Page.totalPage){
				Page.curPage = Page.curPage+1;
				Shop.listProduct(Page.curPage);
			}

		});
	},

	turnToPage:function(page){
		Shop.listProduct(page);
	},

	getTotalPage:function(total){
		var totalPage = Math.floor(total / Shop.service.pagesize);
		console.log("pp:"+totalPage);
		if(total % Shop.service.pagesize != 0){
			totalPage = totalPage + 1;
		}
		return totalPage;
	},
	qingkong:function(){
		$(".pagination").attr("style","position:relative;right:-53px;");
	}
};