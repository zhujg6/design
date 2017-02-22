/**
 * jQuery Ajax 防止重复提交
 * @author : suntiger035
 * @data   : 2012-5-31 17:13
 */

(function($){
    var $ajax = $.ajax;
    $avoidUrl=[
				"/instance/vm/describeInstances",
				"/instance/hostSecurity/describeInstancesWithSafe",
				"/instance/hostSecurity/describeAllAntivirusConfig",
				"/instance/securitygroup/qrySecurityGroupRulesBySecurityGroup",
				"/instance/securitygroup/delSecurityGroupRule",
				"/subnet/describeSubNet",
			    "/instance/route/describeRouter",
				"/instance/route/describeRouter/",
				"/instance/eip/describeEipServices",
				"/instance/lb/describeLbVolumes",
				"/instance/lb/describeLbRuleVM",
			    "/instance/ebs/describeEbsVolumes",
				"/instance/nas/describeNasVolumes",
				"/instance/pm/describePmInstances",
				"/image/listImage",
				"/snapshot/searchSnap",
				"/instance/cloudtab/describeCloudTabs",
				"/instance/networkcard/listNetworkCards",
				"/instance/securitygroup/qrySecurityGroup",
				"/instance/commquery/listCommRelationSources",
				"/user/describeLogsInfo",
				"/pm/queryCaculateFeeByPrtyList",
				"/agent/checkAgentCouponCode",
				"/instance/commquery/querySamecustSubsnameExist"
		];
    $submitUrl=[
             "/pr/createNas",
             "/instance/nas/createNasVolumesForTask",
             "/pr/obs/listBucketResorcePool",
             "/pr/obs/createBucket"
          ];
    $ajax._reuqestsCache = {};
    //设置全局 AJAX 默认选项。
    $.ajaxSetup({
        mode: "block",
        index: 0,
        cache: false,
        beforeSend: function(xhr, s) {
//            if (s.mode) {
//                if (s.mode === "abort" && s.index) {
//                    if ($ajax._reuqestsCache[s.index]) {
//                        $ajax._reuqestsCache[s.index].abort();
//                    }
//                }
//                $ajax._reuqestsCache[s.index] = xhr;
//            }
        }
    });    
       var contains= function(arr, str) {
    	   if(str.indexOf("/instance/nas/describeNasVolumes?SRC_RES_POOL") > -1){
    		   return false;
    	   }
    	    var i = arr.length;
    	    while (i--) {
    	           if (str.indexOf(arr[i]) > 0) {
    	           return true;
    	           }   
    	    }   
    	    
    	    return false;
    	};
    //这里我是重写了getJSON方法，当然了，这名字随便你改，别覆盖jQuery本身的就可以了
    
    $.extend({
        getDateJSON: function(options,sucsCb,errorCb) {
        	options.beforeSend = function(){
        			$(".modal.in").each(function(index,item){
           			   if(!contains($avoidUrl,options.url)){
           				   $($(item).find(".modal-footer").find("button")).each(function(index,item){
          			    		 if($(item).attr("avoidFlag")=="true"&&(options.data != null&&options.data !=""&&(typeof(options.data)!="undefined"))&&($.parseJSON(options.data)!=null)&&!$.parseJSON(options.data).verifyFlag){
          			    			var text = $(item).text();
             			    	   if($.trim(text) != "取消"){
             			    		 $(item).on("buttonDisabled",function(){
             						   $(this).css({
             						   "cursor": "default",
             				           "opacity": 0.65,
             				           "background":"#e6e6e6",
             				           "color":"#333333"
             					    });
             					    $(item).attr("disabled",true);
             					    $(item).text(Dict.val("common_submiting"));
             						});	
             						$(item).trigger("buttonDisabled"); 
             			    	   }
          			    		 }
            			       });
           			   }
            			    	 
     			       $(item).on("shown",function(){
     			    	 $(item).find(".modal-footer").find("button").removeAttr("disabled").removeAttr("style");
     			       });
    // 			       var modalCurrent = item;
//     			       $(item).find(".ui-slider").slider({
//     			          "change":function(){
//     			               $(modalCurrent).find(".modal-footer").find("button").removeAttr("disabled").removeAttr("style");
//     			          }
//     			       });
//     			       $($(item).find(":input")).each(function(j,item){
//     			           $(item).on("focus",function(){
//     			           $(modalCurrent).find(".modal-footer").find("button").removeAttr("disabled").removeAttr("style");
//     			           });
//     			        });
     			    });
        	};
            if (options.mode === "block" && options.index) {
                if ($ajax._reuqestsCache[options.index]) {
                    return false;
                }
                $ajax._reuqestsCache[options.index] = true;
            } 
            options = $.extend({}, options);
            options.success = function(rs){
            	sucsCb(rs);
            	if(options.index){
            			if(!contains($avoidUrl,options.index)&&!contains($submitUrl,options.index)){
            				$(".modal.in").each(function(index,item){
                    			$($(item).find(".modal-footer").find("button")).each(function(index,item){
                   			    			var text = $(item).text();
                      			    	   if($.trim(text) == Dict.val("common_submiting")){
                      			    		 $(item).removeAttr("style");
                      			    		 $(item).removeAttr("disabled");
                      			    		$(item).text(Dict.val("common_determine"));
                      			    	   }
                     			       });
              			    });
            			}
            	}
            };
            if(errorCb){
            	 options.error=function(rs){
                 	errorCb(rs);
                 	if(options.index){
                 			if(!contains($avoidUrl,options.index)&&!contains($submitUrl,options.index)){
                 				$(".modal.in").each(function(index,item){
                         			$($(item).find(".modal-footer").find("button")).each(function(index,item){
                        			    			var text = $(item).text();
                           			    	   if($.trim(text) == Dict.val("common_submiting")){
                           			    		 $(item).removeAttr("style");
                           			    		 $(item).removeAttr("disabled");
                           			    		$(item).text(Dict.val("common_determine"));
                           			    	   }
                          			       });
                   			    });
                 			}
                 	}
                 };
            }
            return $.ajax(options);
        }
    });    
    
    $(document).ajaxComplete(function(a,b,c){
//    	if(c.index){
//    		var arr = c.index.split("=");
//    		if(arr.length==2){
//    			if(!contains($avoidUrl,arr[1])){
//    				$(".modal.in").each(function(index,item){
//            			$($(item).find(".modal-footer").find("button")).each(function(index,item){
//           			    			var text = $(item).text();
//              			    	   if($.trim(text) == "提交中..."){
//              			    		   console.log("test");
//              			    		 $(item).removeAttr("style");
//              			    		 $(item).removeAttr("disabled");
//              			    		$(item).text("确定");
//              			    	   }
//             			       });
//      			    });
//    			}
//    		}
//    	}
        if (c.index) $ajax._reuqestsCache[c.index] = null;  
    });
    
})(jQuery);