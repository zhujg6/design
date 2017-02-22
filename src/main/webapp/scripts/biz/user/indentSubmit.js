$(function() {
	indentSubmit.init();
});
var indentSubmit = {
		currentAccount:"",
		init:function(){
			indentSubmit.currentAccount=$("#loginName").val();
//			$("#imageShowId").addClass("hide");
//			$("#imageShowBl").addClass("hide");
			indentSubmit.describleIndentStatus();
			$("#btnSave").removeAttr("style");
			$("#btnSave").removeAttr("disabled");
			$("#btnSave").on("click",function(){
				indentSubmit.saveIndent();
			});
		},
		describleIndentStatus:function(){
			indentSubmit.describleIndent("submit");
		},
		describleIndent:function(status){
			var currentUserId = $("#currentUserId").val();
			var data = {
					id : currentUserId
				};
			Dcp.biz.apiAsyncRequest("/user/getCustomerByCustomerId", data,
					function(dto) {
//				   $("#custType").val(dto.data.custType);
				 $("#custType").val(dto.data.customerType+"");
				    indentSubmit.detailedStatus(status);
			});
		},
		detailedStatus:function(status){
			switch(status){
			case 'submit':
				indentSubmit.judgeTypeDiv("submit");
				break;
			}
		},
		showAuthentication:function(){
			window.location.href="indent.jsp?code=indent&cataCode=user";
		},
		judgeTypeDiv:function(status){
			var custType =  $("#custType").val();
			if(custType == "0"){
				$("#indentLbDiv").addClass("hide");
				$("#custTypeShowNum").text("身份证");
				$("#custTypeShowAttach").text("身份证附件");
				$("#createUserIndent").text("用户姓名");
				
			}else if(custType == "1"){
				$("#indentLbDiv").removeClass("hide");
				$("#custTypeShowNum").text("法人身份证");
				$("#custTypeShowAttach").text("法人身份证附件");
				$("#createUserIndent").text("公司名称");
			}
		},
		saveIndent:function(){
			var idCardNum = $("#idCardNum").val();
			if(!valiter.isNull(idCardNum)){
				$("#idCardNumMsg").html("");
				var str = valiter.checkIdcard(idCardNum);
				if(str != 1){
					$("#idCardNumMsg").html(str);
					return
				}
			}else{
				$("#idCardNumMsg").html("");
				$("#idCardNumMsg").html("请输入符合规范的身份证号码");
				return
			}
			var idAttachment = $("#attachmentShowId").attr("attachmentShowIdFileName");
			if(idAttachment){
				$("#idCardAttachmentMsg").html("");
			}else{
				$("#idCardAttachmentMsg").html("请上传身份证附件");
				return
			}
			var custType = $("#custType").val();
			if(custType == "1"){
				var blicenseNum = $("#blicenseNum").val();
				if(!valiter.businessLicense(blicenseNum)){
					$("#blicenseNumMsg").html("");
					$("#blicenseNumMsg").html("请输入符合规范的营业执照");
					return
				}else{
					$("#blicenseNumMsg").html("");
				}
				var lbAttachment = $("#attachmentShowLb").attr("attachmentShowLbFileName");
				if(lbAttachment){
					$("#blicenseAttachmentMsg").html("");
				}else{
					$("#blicenseAttachmentMsg").html("请上传营业执照附件");
					return
				}
			}
			
			var indentEntity = indentSubmit.getIndentEntity(custType);
			 $("#btnSave").css({
		        	"cursor": "default",
			           "opacity": 0.65,
			           "background":"#e6e6e6",
			           "color":"#333333"
		        });
		        $("#btnSave").attr("disabled",true);
				$("#btnSave").text(Dict.val("common_submiting"));
	       com.skyform.service.indentService.createIndet(indentEntity,function(result){
	    	   $("#btnSave").removeAttr("style");
	        	$("#btnSave").removeAttr("disabled");
	        	$("#btnSave").text("保存资料");
	    	   indentSubmit.showAuthentication();
	       },function(error){
	    	   msgModal.setContent("<span class='text-success'><h3>"+error+"<h3></span>");
	   		   msgModal.show();
	   		    $("#createIndetShow").removeClass("hide");
	       });
		},
		getIndentEntity:function(custType){
			var indentEntity = {
					"custType":custType,
					"certnum":$("#idCardNum").val(),
					"identFileURL":$("#attachmentShowId").attr("attachmentShowIdFileName")
			};
			
           if(custType == "1"){
				indentEntity.license = $("#blicenseNum").val();
				indentEntity.licenesFileURL=$("#attachmentShowLb").attr("attachmentShowLbFileName");
			}
           
           return indentEntity;
		},
		uploadFile:function(type){
			$("#blicenseMsg").removeClass("onError").html("");
			$("#idCardAttachmentMsg").removeClass("onError").html("");
			var attachment = "";
			if(type == "blicense"){
				attachment = $("#blicenseAttachment").val();
    		}else if(type == "idCard"){
    			attachment = $("#idCardAttachment").val();
//    			alert(attachment);
    		}
			if(indentSubmit.geshiTest(attachment)){
				var options = { 
			            data: {},
			            type : "POST",
			            dataType:  'json',
			            timeout  : 1800000,
			            async:false,
			            success: function(rs) {
			            	if(rs.successFlag == "2"){
			            		if(type == "blicense"){
			            			$("#blicenseAttachmentMsg").html("图片大小已超过2M");
			            		}else if(type == "idCard"){
			            			$("#idCardAttachmentMsg").html("图片大小已超过2M");
			            		}
			            	}else if(rs.successFlag == '1'){
			            		var str = attachment.substring(attachment.indexOf("."),attachment.length);
			            		var date = new Date();
			            	    var filename = "CN"+ date.getTime()+str;
			            	    var options = { 
			            	            data: { "objectName1":filename},
			            	            type : "POST",
			            	            dataType:  'json',
			            	            timeout  : 1800000,
			            	            success: function(rs) {
			            	            	if(rs.successFlag == '1'){
			            	            		 msgModal.setContent("<span class='text-success'>图片上传成功</span>");
				            	        		 msgModal.show();
				            	        		 var ctx = $("#ctx").val();
				            	        		 if(type == "blicense"){
				            	        			 $("#imageShowBl").removeClass("hide");
				            	        			 $("#attachmentShowLb").attr("src",ctx + "/indentShow/attachment?filename="+filename+"&username="+indentSubmit.currentAccount);
				            	        			 $("#attachmentShowLb").attr("attachmentShowLbFileName",filename);
				     		            		}else if(type == "idCard"){
				     		            			$("#imageShowId").removeClass("hide");
				     		            			$("#attachmentShowId").attr("src",ctx + "/indentShow/attachment?filename="+filename+"&username="+indentSubmit.currentAccount);
				     		            			$("#attachmentShowId").attr("attachmentShowIdFileName",filename);
				     		            		}
			            	            	}else if(rs.successFlag == '2'){
			            	            		if(type == "blicense"){
			        		            			$("#blicenseAttachmentMsg").html("图片上传失败");
			        		            		}else if(type == "idCard"){
			        		            			$("#idCardAttachmentMsg").html("图片上传失败");
			        		            		}
			            	            	}
			            	            	
			            	    	    },			            	
			            	            error    : function() {
			            	    		}
			            	            };
			            	    var ctx = $("#ctx").val();
			            	    if(type == "blicense"){
			            	    	$("#createFormLb").attr("action",ctx+"/pr/indent/uploadObjectIndent");
				            	     $("#createFormLb").ajaxSubmit(options);
			            		}else if(type == "idCard"){
			            			$("#createFormId").attr("action",ctx+"/pr/indent/uploadObjectIndent");
				            	     $("#createFormId").ajaxSubmit(options);
			            		}
			            	     
			            	}						            	
			    	    }
			    }; 
			    var ctx = $("#ctx").val();
			    if(type == "blicense"){
			    	$("#createFormLb").attr("action",ctx+"/pr/indent/isObjectSizeOver2MIndent");
			        $("#createFormLb").ajaxSubmit(options);
	    		}else if(type == "idCard"){
	    			$("#createFormId").attr("action",ctx+"/pr/indent/isObjectSizeOver2MIndent");
			        $("#createFormId").ajaxSubmit(options);
	    		}
			    
			}else{
				if(type == "blicense"){
        			$("#blicenseAttachmentMsg").html("图片以jpg,pdf格式提交");
        		}else if(type == "idCard"){
        			$("#idCardAttachmentMsg").html("图片以jpg,pdf格式提交");
        		}
			}
			
		
		},
		geshiTest:function(attachment){
			var str = attachment.substring(attachment.indexOf("."),attachment.length).toLowerCase();
			if(str == ".jpg" || str == ".pdf"){
				return true;
			}else{
				return false;
//				return true;
			}
		}
};
msgModal = new com.skyform.component.Modal("msgModal","<h4>信息</h4>","",{
	buttons : [
	           {name:'关闭',onClick:function(){	        	   
	        	   msgModal.hide();	    				        	   
	           },attrs:[{name:'class',value:'btn'}]}
	           ],
     afterHidden : function(){
   		if(msgModal.afterHidden && typeof msgModal.afterHidden == 'function') {
   			msgModal.afterHidden();
   		}
   	}           
});