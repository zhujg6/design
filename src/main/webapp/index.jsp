
<%
	//String portal = "http://"+request.getServerName()+":"+request.getServerPort();
	String portal = "http://"+request.getServerName();
	response.sendRedirect(portal);
	
%>