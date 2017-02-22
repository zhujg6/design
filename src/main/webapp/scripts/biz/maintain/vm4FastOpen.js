


var CommonEnum = {
		protocol:[],
		loopType:[],
		billType:'',
		//billType:{0:"包月",3:"包年"},
		offLineBill:false, 
		//billType:{0:"包月",1:"计时",2:"包天"},
		//serviceType:{"vm":1001,"vdisk":1002,"subnet":1003,"route":1004,"lb":1005,"ip":1006,"obs":1012},
		//运营产品定义
		//1001;虚拟机 //1002;弹性块存储 //1003;负载均衡 //1006;公网带宽 //1007;云专享 //1008;路由器 //1009;私有网络
		//1010;安全策略组//1012;对象存储 //1013;文件存储
		serviceType:{"vm":1001,"vdisk":1002,"lb":1003,"ip":1006,"route":1008,"subnet":1009,"obs":1012,"nas":1013},

		
		init : function(){
//			CommonEnum.initProtocol(function(data){
//				CommonEnum.protocol = $.parseJSON(data);
//			});
			
//			CommonEnum.initLoopType(function(data){
//				CommonEnum.loopType = $.parseJSON(data);
//			});
			CommonEnum.billType = com.skyform.service.BillService.getBillTypeOut();
			

		}

	};

//var CommonEnum = {
//	protocol:[],
//	loopType:[],
//	//billType:{0:"包月",3:"包年"},
//	billType:'',
//	offLineBill:false, 
//	//billType:{0:"包月",1:"计时",2:"包天"},
//	//serviceType:{"vm":1001,"vdisk":1002,"subnet":1003,"route":1004,"lb":1005,"ip":1006,"obs":1012},
//	//运营产品定义
//	//1001;虚拟机 //1002;弹性块存储 //1003;负载均衡 //1006;公网带宽 //1007;云专享 //1008;路由器 //1009;私有网络
//	//1010;安全策略组//1012;对象存储 //1013;文件存储
//	serviceType:{"vm":1001,"vdisk":1002,"lb":1003,"ip":1006,"route":1008,"subnet":1009,"obs":1012,"nas":1013,"pm":1016},
//	initProtocol : function(callback){
//		com.skyform.service.PortalInstanceService.queryProtocol(function(data){				
//			callback(data);
//		});	
//	},
//	initLoopType : function(callback){
//		com.skyform.service.PortalInstanceService.queryLoopType(function(data){				
//			callback(data);	
//		});
//	},
//	initBillType : function(callback){
//		com.skyform.service.BillService.qryCustPayType(function(data){
//			callback(data);
//		});
//	},
//	init : function(){
//		CommonEnum.initProtocol(function(data){
//			CommonEnum.protocol = $.parseJSON(data);
//		});
//		
//		CommonEnum.initLoopType(function(data){
//			CommonEnum.loopType = $.parseJSON(data);
//		});
//		CommonEnum.billType = com.skyform.service.BillService.getBillType();
////		listResourcePool();
//		$.each(CommonEnum.billType, function(index) {
//			if(5 == index){
//				CommonEnum.offLineBill = true;
//				return false;
//			}
//			else {
//				$("th[name='expireDate']").attr("contentVisiable","");
//				$(".period_div").show();
//				$(".renew_btn").show();
//				$(".feeInput_div").show();
//				$(".changeProperty").hide();//配置变更隐藏
//				return false;
//			}
//		});
////		listResourcePool(CommonEnum.offLineBill);
//	}
//
//}

var VM4FastOpen = {	
		init : function(loginornot){
			$("#btnCreateVM").bind('click',function(e){		
				if(loginornot == 1){
					var modalId = "hideModal";
					VM4quick.createVM4quick2(modalId);								
				}else{
					$.growlUI("提示", "请登录后再购买产品,如果没有注册请先注册");
				}
			});	
		}	
		
};
