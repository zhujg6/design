var ctx = "/portal";
var vBeginTime = "2014-12-07";
var vEndTime = "2014-12-17";
var range = 4;
var Present = {
	packageSaleModal : null,
	userType : 1,
	identStatus : 1,
	qualification : 1,
	presentService : com.skyform.service.PresentService,
	currentUser:null,
	startDate : "",
		
	init : function(){
		ctx = $("#ctx").val();	
//		if(!Present.isValidateDate()){
//			ConfirmWindow.setTitle("提示").setContent("<h4><span class='text-success'>请于"+vBeginTime+"至"+vEndTime+"期间参加活动！</span></h4>").onSave = function(){
//				ConfirmWindow.hide();
//			};
//			ConfirmWindow.show();
//		
//		}else {}		
		//根据红包名额判断活动有效时间
		Dcp.biz.getCurrentUser(function(data){
			Present.currentUser = data;
			//console.log(Present.currentUser);
			Present.presentService.queryPresentDate(Present.currentUser.id,function(data){
				if(data.data != 1){
					ConfirmWindow.setTitle("提示").setContent("<h4><span class='text-success'>今天红包已经抽完了！</span></h4>").onSave = function(){
						ConfirmWindow.hide();
					};
					ConfirmWindow.show();
				}
				else {
					Present.queryCustIdent();
				}
			});
		});
	
			
	},	
	
	isValidateDate:function(){	
		var beginTime = vBeginTime;
		var endTime = vEndTime;
		var now = new Date();
		
		var begin = new Date(beginTime.replace("-", "/").replace("-", "/"));  
		var end = new Date(endTime.replace("-", "/").replace("-", "/"));  
		
		if(begin<=now&&now<end){
	    	return true;
	    }
	    else return false;	   
		
	},
	
	queryCustIdent:function(){
		com.skyform.service.vmService.queryCustIdent(function(data){
			//customerType:1个人2企业3大客户 ； identStatus:1待审2通过3驳回4缺资料； qualification:1未申请2申请
//			data.qualification = 2;
//			data.customerType = 2;
//			data.identStatus = 2;
//			Sale.userType = data.customerType;
//			Sale.identStatus = data.identStatus;
//			Sale.qualification = data.qualification;


			//未认证，则跳转到认证页面
			if(data.identStatus != 2){				
				setTimeout(function(){
					var url = ctx+"/jsp/user/indent.jsp?code=indent";
					window.location.assign(url);
				},2000);
				$.growlUI("提示", "您尚未进行实名认证，2秒后将跳转到认证界面...");				
			}
			else {					
					Present.queryUserPresent();
			}
		})
	},
	
	queryUserPresent : function(){
		Present.presentService.queryUserPresent(Present.currentUser.id,function(data){
			//console.log(data.data);
			if(data.data == 1){
				ConfirmWindow.setTitle("提示").setContent("<h4><span class='text-success'>您已经获取过红包，谢谢参与！</span></h4>").onSave = function(){
					ConfirmWindow.hide();
				};
				ConfirmWindow.show();
			}
			else if(data.data == 2){
				ConfirmWindow.setTitle("提示").setContent("<h4><span class='text-success'>您今天已经抽过红包了！</span></h4>").onSave = function(){
					ConfirmWindow.hide();
				};
				ConfirmWindow.show();
			}
			else if(data.data == 300){
				ConfirmWindow.setTitle("提示").setContent("<h4><span class='text-success'>您已经获取红包满300元，谢谢参与！</span></h4>").onSave = function(){
					ConfirmWindow.hide();
				};
				ConfirmWindow.show();
			}
			else if(data.data == 0){
				$(".lot-btn").unbind().click(function(){
					Present.present();
				});
				$(".try").show();
			}
		})
	},
	present:function(){
		$(".try").hide();

		Present.presentService.present(Present.currentUser.id,function(data){
			if(data.data>0){
				Present.presentIMG_start(data.data);
				setTimeout(function(){
					ConfirmWindow.setTitle("提示").setContent("<h4><span class='text-success'>恭喜您获得<strong class='text-error'>"+data.data+"</strong>元红包！</span></h4>").onSave = function(){
						ConfirmWindow.hide();
					};
					ConfirmWindow.show();
				},8000);
			}else if(0 == data.data){
				Present.presentIMG_start(data.data);
				setTimeout(function(){
					ConfirmWindow.setTitle("提示").setContent("<h4><span class='text-success'>谢谢您的参与！</span></h4>").onSave = function(){
						ConfirmWindow.hide();
					};
					ConfirmWindow.show();
				},8000);
			}else if(-5 == data.data){
				ConfirmWindow.setTitle("提示").setContent("<h4><span class='text-success'>活动时间已停止！</span></h4>").onSave = function(){
					ConfirmWindow.hide();
				};
				ConfirmWindow.show();
			}else if(-1 == data.data){
				ConfirmWindow.setTitle("提示").setContent("<h4><span class='text-success'>登录失效，请重新登录！</span></h4>").onSave = function(){
					ConfirmWindow.hide();
				};
				ConfirmWindow.show();
			}else if(-2 == data.data){
				ConfirmWindow.setTitle("提示").setContent("<h4><span class='text-success'>您已经获取过红包，谢谢参与！</span></h4>").onSave = function(){
					ConfirmWindow.hide();
				};
				ConfirmWindow.show();
			}else if(-3 == data.data){
				ConfirmWindow.setTitle("提示").setContent("<h4><span class='text-success'>您今天已经抽过红包了，请明天再来！</span></h4>").onSave = function(){
					ConfirmWindow.hide();
				};
				ConfirmWindow.show();
			}else if(-4 == data.data){
				ConfirmWindow.setTitle("提示").setContent("<h4><span class='text-success'>今天的红包已经抽完了！</span></h4>").onSave = function(){
					ConfirmWindow.hide();
				};
				ConfirmWindow.show();
			}			
			
		});
	},
	presentIMG_start:function(presentAMT){
		var jiaodu=3600;
		if(200 == Number(presentAMT)){
			jiaodu=jiaodu - 22;
		}else if(150 == Number(presentAMT)){
			jiaodu=jiaodu + 68;
		}else if(100 == Number(presentAMT)){
			jiaodu=jiaodu + 23;
			$("#imgs").rotate(215);
		}else if( 50 == Number(presentAMT)){
			jiaodu=jiaodu + 113;
		}else{
			jiaodu=jiaodu + 248;
		}
		for (var i = 0; i <= 10000; i++) {
			$("#imgs").rotate({
				animateTo: i, 
				duration: 10000
			});
			if (i >= jiaodu) {
				break;
			}
		}
	}

};
var ConfirmWindow = new com.skyform.component.Modal("confirmWindow","","",{
	buttons : [
	  {
		  name : '确认',
		  attrs : [{name:'class',value:'btn btn-primary'}],
		  onClick : function(){
			  if(ConfirmWindow.onSave && typeof ConfirmWindow.onSave == 'function') {
				  ConfirmWindow.onSave();
			  } else {
				  ConfirmWindow.hide();
			  }
		  }
	  },
//	  {
//		  name : '取消',
//		  attrs : [{name:'class',value:'btn'}],
//		  onClick : function(){
//			  ConfirmWindow.hide();
//		  }
//	  }
	  ]
}).setWidth(400).autoAlign().setTop(100);


