$().ready(function(){
	var code = $("#code").val();
	Shop.listProduct(1,code);
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
					var logo = Config.imageUrl + "software/downloadForSoftware?";
					var logo1 = ctx+'/images/';
					//logo = p.logo!=null&&p.logo.length>0?logo+"downName="+p.logo+"&provider="+p.sellerId:logo1+"proicon01.png";
					var product = $('<div class="softlist" productId="'+p.productId+'">'
						+'<div class="span2"><a href="'+ctx+'/jsp/software/shopprodetail.jsp?code='+code+'&productId='+p.productId+'"><img src="'+ p.url+'"/></a></div>'
						+'<div class="span4">'
						+'<h2 class="mb10"><a href="'+ctx+'/jsp/software/shopprodetail.jsp?code='+code+'&productId='+p.productId+'">'+transNullStr(p.productName)+'</h2><p class="tcolor7">'+transNullStr(p.productDesc)+'</p></a></div>'
						+'<div class="span1 mt30"><p class="softprice mb10"></p></div>'
						+'<div class="span3 mt30"><p class="softos">系统：'+transNullStr(p.os)+'</p>'
						+'<p class=" tcolor5">软件提供商：'+transNullStr(p.provider)+'</p><p class=" tcolor5">软件版本：'+transNullStr(p.version)+'</p>'
						+'</div></div>'	);				
					product.appendTo($("#productList"));
				});
				Page.initPage(data.pages,page);
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
	}
};