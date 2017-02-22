$().ready(function(){
	var code = $("#code").val();
	Shop.listProduct(1,code);
	//调整翻页按钮位置
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
				var list = data.list;
				$(list).each(function(i,p){
					if(transNullStr(p.productName) !="hillstone" && transNullStr(p.productName) !="明御运维审计与风险控制系统(安恒云堡垒机)" ) {
						var logo = Config.imageUrl + "software/downloadForSoftware?";
						var logo1 = ctx+'/images/';
						logo = p.logo!=null&&p.logo.length>0?logo+"downName="+p.logo+"&provider="+p.sellerId:logo1+"proicon01.png";
						var product = $('<div class="softlist" productId="'+p.productId+'">'
						+'<div class="span2"><a href="'+ctx+'/jsp/software/shopprodetail.jsp?code='+code+'&productId='+p.productId+'"><img src="'+logo+'"/></a></div>'
						+'<div class="span4">'
						+'<h2 class="mb10"><a href="'+ctx+'/jsp/software/shopprodetail.jsp?code='+code+'&productId='+p.productId+'">'+transNullStr(p.productName)+'</h2><p class="tcolor7">'+transNullStr(p.productDesc)+'</p></a></div>'
						+'<div class="span1 mt30"><p class="softprice mb10"></p></div>'
						+'<div class="span3 mt30"><p class="softos">系统：'+transNullStr(p.os)+'</p>'
						+'<p class=" tcolor5">软件提供商：'+transNullStr(p.provider)+'</p><p class=" tcolor5">软件版本：'+transNullStr(p.version)+'</p>'
						+'</div></div>'	);
						product.appendTo($("#productList"));
					}
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
	},
	qingkong:function(){
		$(".pagination").attr("style","position:relative;right:-216px;width:100%;");
	}
};