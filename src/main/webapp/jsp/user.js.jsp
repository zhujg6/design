<%@ page contentType="application/javascript; charset=utf-8" pageEncoding="utf-8" trimDirectiveWhitespaces="true"%>
<%
response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
response.setHeader("Pragma", "no-cache"); // HTTP 1.0.
response.setDateHeader("Expires", 0); // Proxies.
 %>
(function(){
<%
com.skyform.admin.dto.UserDTO currentUser = (com.skyform.admin.dto.UserDTO)request.getSession().getAttribute(com.skyform.admin.controller.AdminController.SESSION_USER);
if(currentUser != null) {
%>
	window.portalUser = {
		"id"	: "<%=currentUser.getId() %>",
		"name" 	: "<%=currentUser.getName() %>",
		"account" : "<%=currentUser.getAccount() %>"		
	};
<%}else{ %>
	window.portalUser = null;
<%} %>	
})();
