$(function() {
	indent.init();
});

var indent = {
		
		init:function(){
			indent.descriptUser();
		},
		descriptUser:function(){
			com.skyform.service.indentService.queryCustIdentStatus(function(result){
				
				if(result[0].hasOwnProperty("status")){
					console.log(" is contains");
				}else{
					result=[[]];
				}
				
				 if(result[0].length == 0){
					 indent.showIndentStatus("submit");
				 }else if(result[0].status == "1"){
					 indent.showIndentStatus("authentication");
				 }else if(result[0].status == "2"){
					 indent.showIndentStatus("success");
				 }else if(result[0].status== "3"){
				     indent.showIndentStatus("refuse");
				}
			},function(error){
				$.growlUI("提示", error); 
		    });
		},
		showIndentStatus:function(status){
			$(".showStatus li").each(function(i,item){
				var idProperty = $(item).attr("id");
				if(idProperty==status||(idProperty == "submit"&& status=="refuse")){
					$(item).removeClass("currentindent");
					$(item).addClass("currentindent");
					$(item).find("span").removeClass("hui");
					indent.showIndentMessage(status);
				}else{
					$(item).removeClass("currentindent");
					$(item).find("span").addClass("hui");
				}
				
			});
		},
		showIndentMessage:function(status){
			switch(status){
			case "submit":
				$(".indentmessage").show();
				$("#indentResult").text("您还未进行实名认证!");
				$("#indentMsg").text("为了您能更好更安全的使用沃云服务，请尽快进行实名认证。");
				$("#btnIndent").show();
				break;
			case "authentication":
				indent.showIndentTime("authentication");
				break;
			case "success":
				indent.showIndentTime("success");
				break;
			case "refuse":
				indent.showIndentTime("refuse");
				break;
			}
		},
		showIndentTime:function(type){
			var id = $("#currentUserId").val();
			var condition = {
					"id":id
			};
			 com.skyform.service.indentService.indentDetailShow(condition,function(result){
				 $(".indentmessage").show();
				if(type=="authentication"){
					$("#indentResult").text("您进行的实名认证已提交!");
					var createTime = "";
					if(result.chgDate){
						createTime = indent.showDataFormate(result.chgDate);
					}else{
						createTime = indent.showDataFormate(result.createDate);
					}
					$("#indentMsg").html(createTime+" 进行实名认证.");
					$("#btnIndent").hide();
				}else if(type == "refuse"){
					$("#indentResult").text("您进行的实名认证已驳回!");
					var createTime = indent.showDataFormate(result.createDate);
					var chgDate = indent.showDataFormate(result.chgTime);
					var infor = "";
					if(result.identInfo){
						infor = result.identInfo;
					}
					$("#indentMsg").html(createTime+" 进行实名认证.<br>"+chgDate+" 对认证记录进行了审核<br>"+infor);
					$("#btnIndent").show();
				}else if(type == "success"){
					$("#indentResult").text("您进行的实名认证已成功!");
					var createTime = indent.showDataFormate(result.createDate);
					var chgDate = indent.showDataFormate(result.chgTime);
					$("#indentMsg").html(createTime+" 进行实名认证.<br>"+chgDate+" 对认证记录进行了审核");
					$("#btnIndent").hide();
				}
			 },function(error){
				 $.growlUI("提示", error); 
			 });
		},
		showDataFormate:function(text){
		
			var obj = eval('(' + "{Date: new Date(" + text + ")}" + ')');
			var dateValue = obj["Date"];
			return  dateValue.format('yyyy-MM-dd hh:mm:ss');
//			return text.split(".")[0];
		},
		toSubmit:function(){
			window.location.href="indentSubmit.jsp?code=indent&cataCode=user";
		}
		
};