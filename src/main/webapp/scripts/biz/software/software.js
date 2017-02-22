$().ready(function() {
	Menu.listSpan();
});
var Menu ={
	menuTree : null,
	service : com.skyform.service.menuService,
	imgNames:["soft-groud.png","soft-app.png","soft-safe.png","soft-offices.png"],
	sortProduct:[103,101,104,102],
	//lb_fan 存放基础类id
	basicsSeoId:null,
	listTree : function(){
		var tree = '<h2 class="left_tit">全部软件分类</h2>';
		var child = '';
		var parent = '';
		var url = ctx+"/jsp/software/shopprolist.jsp";
		Menu.service.listTree(function(data){
			if(data && data[0] && data[0].child){
				var root = data[0].child;
				//console.log(root)
				//menuTree = root;
				$(root).each(function(i,p){
					var logo = p.logo!=null&&p.logo.length>0?p.logo:"fa-tasks";
					parent = '<h2 class="le01"><i class="fa mr5 '+logo+'"></i>'+p.serviceTypeName+'</h2>';
					if(p.child){
						$(p.child).each(function(i,c){
							child = '<ul><li class="cl01" code="'+c.seoId+'" id="'+c.seoId+'"><a class="" href="'+url+'?code='+c.seoId+'&serviceType='+c.serviceTypeId+'">'+c.serviceTypeName+'</a></li></ul>';
							parent += child;
						});
					}
					tree += parent;
				});

			}
			$(".erji_lc").empty().append(tree);

			if(code.length == 0) code = "123";
			$(".erji_lc li[code !='"+code+"'] a").removeClass("hover");
			$(".erji_lc li[code='"+code+"'] a").addClass("hover");
			if(!$(".erji_lc li a").hasClass("hover")){
				$(".erji_lc li a:first").addClass("hover").click();
			}
		})
	} ,
	//
	listSpan :function(){
		var tree = '<h2 class="left_tit">全部软件分类</h2>';
		var child = '';
		var parent = '';
		var url = ctx+"/jsp/software/shopprolist.jsp";
		var more =  '<div class="home-title" id="more"><h1>敬请期待<i class="fa fa-circle-thin"></i></h1>'
			+'</div>';
		//企业软件3 云安全2 基础软件1
		Menu.service.listTree(function(data){
			if(data&&data.child){
				var parents = data.child;
				//console.log(parents)
				var father = "";
				//显示三个类型的头标题
				$(parents).each(function(i,p){
					//显示三个类型的头标题 以及更多按钮
					//if(p.serviceTypeId == "1" || p.serviceTypeId == "3"){
						father = '<div class="home-title" id="'+p.serviceTypeId+'"><h1>'+p.serviceTypeName+'<i class="fa fa-circle-thin"></i></h1>'
						+'<a href="shopprolist.jsp?code='+p.seoId+'&serviceType='+p.serviceTypeId+'" class="text-info" style="margin-left:1100px">更多>></a>'
						+'</div>';
						//lb_fan 更改基础类位置以及隐藏更多按钮
						Menu.positionAndDisplay(p.seoId,father,p.serviceTypeId);
						Menu.listProduct(1,i,p.seoId,p.serviceTypeId,function(child){
							if(child){
								$("#"+p.serviceTypeId).after(child);
							}
						});
					//}
				});
			}
		})
	},
	listProduct : function(page,index,code,serviceType,call){
		var timestamp = new Date().getTime();
		com.skyform.service.shopProductService.listProducts(serviceType,page,timestamp,function(data){
			var child = '<div class="row" style="margin-left:30px;">';
			if(data&&data.list){
				var list = data.list;
				//lb_fan 加了判断 如果是基础类型则修改去订购按钮的跳转路径及传参
				if(serviceType==1){
					//lb_fan 修改去订购按钮的跳转路径及传参
					child=Menu.rejiggerUrl(child);
				}
				if(serviceType==2){
					//遍历list 生成每一个类型中的四个产品展示的div.span3
					var list=[
						{
							"seoId":2016111718,
							"productId":10533,
							"productName":"hillstone",
							"provider":"云数据公司",
							"version":null,
							"logo":"1logo.jpeg",
							"os":null,
							"price":0,
							"productDesc":"基于软件的虚拟化防火墙，适于虚拟化环境部署在虚拟化环境中，用户的计算、存储、数据资源都是运行在服务器的虚拟机上，在考虑安全防护的设计时，山石下一代防火墙虚拟化版SG-6000-VM系列可在虚拟机上实现快速灵活的部署，支持在VMware、LinuxKVM虚拟化平台上运行。以虚拟化的形式部署的设备，能够克服物理防火墙的限制，在虚拟化环境中可部署于更加靠近VM的位置，对于VM主机内部流量进行过滤，实现同时对于南北向和东西向流量的安全防护。同时，用户可以根据网络搭建需求，弹性调配和管理网络资源，调整网络接口数量等，并且能够按需进行灵活迁移，充分发挥虚拟化优势。拥有专业NGFW安全防护功能山石网科SG-6000-VM系列虚拟化设备拥有与NGFW相同的操作系统，具有丰富的网络安全防护功能，对网络威胁进行防御，能够满足企业分支及公有云多租户环境中的网络安全需求。",
							"productDetail":null,
							"hotSale":"0",
							"sellerId":"lizs001",
							"url":"../../images/photos01/1logo.jpeg",
							"href":"shopprodetail_anQuan.jsp?code=A"
						},
						{
							"seoId":14781532,
							"productId":10530,
							"productName":"明御运维审计与风险控制系统(安恒云堡垒机)",
							"provider":"杭州安恒信息技术有限公司",
							"version":null,
							"logo":"anhengbaolei.png",
							"os":null,
							"price":0,
							"productDesc":"（一）云堡垒机是什么云堡垒机是一款针对云主机、云数据库、网络设备等的访问权限、操作行为进行管理和审计的工具。主要解决云上IT运维过程中系统账号复用、数据泄露、访问权限混乱、操作过程不透明等难题。（二）选配参考表云堡垒的关键参数包含最大资产数和最大连接数，资产数和连接数越大对云主机的配置要求越高。以下是经过严格测试的规格配置，推荐大家根据自身规模情况选择合适的配置；当然云主机的配置也可以自定义，但请必须满足以下最低要求：1)内存至少1G、CPU至少1核、系统盘至少20G。2)数据盘至少100G且为独立云盘（非分区），仅支持单个数据盘；数据盘越大，存储的审计日志就越久。表格参数说明：1)资产数：可以简单理解成一个IP地址的数量，一个云主机有一个IP、多个系统账号是属于一个资产；一个云主机有两个IP，算两个资产。2)连接数：指SSH、远程桌面等TCP连接会话数。（三）应用效果云堡垒机可以对运维行为进行阻断和控制，所有运维、开发人员对主机的登录、命令、文件传输等",
							"productDetail":null,
							"hotSale":"0",
							"sellerId":"lizs001",
							"url":"../../images/photos01/anhengbaolei.png",
							"href":"shopprodetail_anQuan.jsp?code=B"
						}
					];
					$(list).each(function(i,p){
						var productNameLength=transNullStr(p.productName).length;
						var textproductName=null;
						if(productNameLength>17){
							textproductName=transNullStr(p.productName).substring(0,14);
						}else{
							textproductName=transNullStr(p.productName);
						}
						child += '<div class="span3 shophotpro">'
						+'<a href="'+p.href+'"><img src="'+ p.url+'" class="prologo" title="'+transNullStr(p.productName)+'"></a>'
						+'<h2>'+textproductName+'</h2>'
						+'<p class="softpb">'+transNullStr(p.productDesc).substring(0,30)+'...</p>'
						+'<p class="softprice"></p>'
						+'<p class="shopprodetail" style="margin-top:22px">'
						+'<a class="buybtn" style="margin-left: 0" href="'+ p.href+'">'
						+'<i class="fa fa-arrow-right mr5"></i>去订购</a>'
						+'</p></div>';
					});
				}
				if(serviceType==3){
					//遍历list 生成每一个类型中的四个产品展示的div.span3
					var timestamp = new Date().getTime();
					var pagesize=5;
						com.skyform.service.shopProductService.listAllProduct(3,1,timestamp,pagesize,function(data){
							var list = data.list;
							var child = '<div class="row" style="margin-left:30px;">';
							$(list).each(function(i,p){
								//控制页面值显示四条数据
								if(i>=4){return}
								if(transNullStr(p.productName) !="hillstone" && transNullStr(p.productName) !="明御运维审计与风险控制系统(安恒云堡垒机)" ){
									//Config.imageUrl------http://172.20.2.144:8089/wo-cloud-dev
									var logo = Config.imageUrl + "software/downloadForSoftware?";
									var logo1 = ctx+'/images/';
									logo = p.logo!=null&&p.logo.length>0?logo+"downName="+p.logo+"&provider="+p.sellerId:logo1+"proicon01.png";
									var productNameLength=transNullStr(p.productName).length;
									var textproductName=null;
									if(productNameLength>17){
										textproductName=transNullStr(p.productName).substring(0,14);
									}else{
										textproductName=transNullStr(p.productName);
									}
									child += '<div class="span3 shophotpro">'
									+'<a href="'+ctx+'/jsp/software/shopprodetail.jsp?code='+code+'&productId='+p.productId+'"><img src="'+logo+'" class="prologo" title="'+transNullStr(p.productName)+'"></a>'
										//+'<h2>'+transNullStr(p.productName).substring(0,17)+'</h2>'
									+'<h2>'+textproductName+'</h2>'
									+'<p class="softpb">'+transNullStr(p.productDesc).substring(0,30)+'...</p>'
									+'<p class="softprice"></p>'
									+'<p class="shopprodetail" style="margin-top:22px">'
									+'<a class="buybtn" style="margin-left: 0" href="'+ctx+'/jsp/software/shopprodetail.jsp?code='+code+'&productId='+p.productId+'">'
									+'<i class="fa fa-arrow-right mr5"></i>去订购</a>'
									+'</p></div>';
								}
							});
							child += '</div>';
							call(child);
						})
				}
			}
			child += '</div>';
			call(child);
		})
	},
	positionAndDisplay:function(seoId,father,serviceTypeId){
		if(serviceTypeId==1){
			$(".shopbanner").after(father);
			//$("#"+seoId).find("a").hide();
			$("#"+serviceTypeId).find("a").attr("href",'shopprolist_fan.jsp?code='+seoId+'&serviceType='+serviceTypeId);
		}else{
			$("#more").before(father);
		}
		if(serviceTypeId==2){
			$("#"+serviceTypeId).find("a").attr("href",'shopprolist_anQuan.jsp?code='+seoId+'&serviceType='+serviceTypeId);
		}
	},
	rejiggerUrl:function(child){
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
				"url":"Java_Linux",
				"productBriefBas":"Centos6.5，MSQ5.1，JDK1.7,TOMCAT7",
				"productDetailsBas":"镜像集成CentOS7.1 64位 | Tomcat7 | Java7 |Mysql5.1，已针对网站环境和系统安全设置优化，有效提升访问速度和负载能力，所有市面程序均可正常安装运行。通过内置的主机宝控制面板轻松管理服务器、网站和备份数据等，省去了繁琐的配置流程，简易直观的操作让您零基础安全轻松的使用云主机。"
			}
		];
		$(list).each(function(i,p){
			//Config.imageUrl------http://172.20.2.144:8089/wo-cloud-dev
			var logo = Config.imageUrl + "/software/downloadForSoftware?";
			var logo1 = ctx+'/images/';
			logo ="../../images/"+ p.url+".png";
			child += '<div class="span3 shophotpro">'
			+'<a href="'+ctx+'/jsp/software/basicsPage.jsp?index='+ p.index+'"><img src="'+logo+'" class="prologo" title="'+ transNullStr(p.productName)+'"></a>'
			+'<h2>'+transNullStr(p.productName).substring(0,20)+'</h2>'
			+'<p class="softpb">'+transNullStr(p.productDesc).substring(0,30)+'...</p>'
			+'<p class="softprice"></p>'
			+'<p class="shopprodetail" style="margin-top:22px">'
			//+'<a class="buybtn" style="margin-left: 0" href="'+ctx+'/jsp/maintain/createVMfan.jsp?code=1&osDisk='+ p.osDisk+'&image='+ p.image+'&osType='+ p.osType+'&image_div_id='+ p.image_div_id+'&productName='+ encodeURI(encodeURI(p.productName))+'">'
			+'<a class="buybtn" style="margin-left: 0" href="'+ctx+'/jsp/software/basicsPage.jsp?index='+ p.index+'">'
			+'<i class="fa fa-arrow-right mr5"></i>去订购</a>'
			+'</p></div>';
		});
		return child;
	}
}