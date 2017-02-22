<%@ taglib prefix="fmt" uri="http://java.sun.com/jstl/fmt" %>
<%
	String path = request.getContextPath();
	String _local = request.getLocale().toString();
	if(_local.toLowerCase().contains("en")){
%>	
		<fmt:setLocale value="en_US"/>
<%		
	}else  {
%>	
		<fmt:setLocale value="zh_CN"/>		
<%				
	}
%>