$(function() {
	$("#dtmm").val("");
	$("#get-dyn").click(function() {		
		getDynCode();
	});	
});
function changeImg(){
    var imgSrc = $("#find_imgvercode");    
    var src = imgSrc.attr("src");    
    imgSrc.attr("src",chgUrl(src));    
}
function changeMessageImg(){
    var imgSrc = $("#find_imgvercode_msg");    
    var src = imgSrc.attr("src");    
    imgSrc.attr("src",chgUrl(src));    
}
//时间戳    
//为了使每次生成图片不一致，即不让浏览器读缓存，所以需要加上时间戳 
function chgUrl(url){
    var timestamp = (new Date()).valueOf();    

    if((url.indexOf("?")>=0)){
        url = url.substring(0,url.indexOf("?"));    
    }

    if((url.indexOf("&")>=0)){    
        url = url + "×tamp=" + timestamp;    
    }else{    
        url = url + "?timestamp=" + timestamp;    
    }    

    return url;    
}    






