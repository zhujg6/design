<%
	String path = request.getContextPath();
%>
	<link rel="stylesheet" type="text/css" href="<%=path%>/css/skyform-component.css">
	<link rel="stylesheet" type="text/css" href="<%=path%>/css/jqueryui/jquery-ui-1.10.0.custom.css">	
	<link rel="stylesheet" type="text/css" href="<%=path%>/css/jquery.dataTables.css">
	<link rel="stylesheet" type="text/css" href="<%=path%>/css/software/bootstrap.css">
	<link rel="stylesheet" type="text/css" href="<%=path%>/css/bootstrap-responsive.min.css">
	<link rel="stylesheet" type="text/css" href="<%=path%>/css/bootstrap-switch.css">
	<link rel="stylesheet" type="text/css" href="<%=path%>/css/bootstrap-wizard.css">
	<link rel="stylesheet" type="text/css" href="<%=path%>/css/smart_wizard.css">
	<link rel="stylesheet" type="text/css" href="<%=path%>/css/base.css">
	<link rel="stylesheet" type="text/css" href="<%=path%>/css/software/all.css">
	<link rel="stylesheet" type="text/css" href="<%=path%>/css/software/shopindex.css">
	<link rel="stylesheet" type="text/css" href="<%=path%>/css/blue/skyform.css">
	<link rel="stylesheet" type="text/css" href="<%=path%>/css/software/font-awesome/css/font-awesome.css">
	<link rel="stylesheet" type="text/css" href="<%=path%>/css/software/font-awesome/css/font-awesome-ie7.css">
	
	<!--[if lte IE 8]>
	<script type="text/javascript" src="${ctx}/scripts/common/html5.js"   charset="utf-8"></script>
	<![endif]-->
	
	<script type="text/javascript" src="<%=path%>/jsp/i18njs.jsp"></script>
	<script type="text/javascript" src="<%=path%>/scripts/jquery/jquery-1.7.2.min.js"></script>
	<script type="text/javascript" src="<%=path%>/scripts/jquery/jquery.placeholder.js"></script>
	<script type="text/javascript" src="<%=path%>/scripts/common/avoidSubmit.js"></script>
	<script type="text/javascript" src="<%=path%>/scripts/jquery/jquery.json-2.2.min.js"></script>
	<!-- <script type="text/javascript" src="<%=path%>/scripts/jquery/jquery.form.js"></script> -->
	<script type="text/javascript" src="<%=path%>/scripts/common/Dcp.js"></script>
	<!-- <script type="text/javascript" src="<%=path%>/scripts/common/DcpJqueryUtils.js"></script>-->	
	<script type="text/javascript" src="<%=path%>/scripts/common/DcpJqueryUtils4Yaxin.js"></script>
	<script type="text/javascript" src="<%=path%>/scripts/common/common.js"></script>
	<script type="text/javascript" src="<%=path%>/scripts/jquery/jquery-ui-1.10.3.custom.min.js"></script>
	<script type="text/javascript" src="<%=path%>/scripts/jquery/jquery.dataTables.js"></script>
	<script type="text/javascript" src="<%=path%>/scripts/bootstrap/bootstrap.js"></script>
	<script type="text/javascript" src="<%=path%>/scripts/bootstrap/bootstrap-switch.js"></script>
	<script type="text/javascript" src="<%=path%>/scripts/jquery/jquery.smartWizard.js"></script>
	<script type="text/javascript" src="<%=path%>/scripts/common/com.skyform.component.js"></script>
	<script type="text/javascript" src="<%=path%>/scripts/bootstrap/jqBootstrapValidation.js"></script>
	<script type="text/javascript" src="<%=path%>/scripts/jquery/jquery.blockUI.js"></script>
	<script type="text/javascript" src="<%=path%>/scripts/biz/software/services.js"></script>
	<script type="text/javascript" src="<%=path%>/scripts/biz/software/transJson4Soft.js"></script>
	<script type="text/javascript" src="<%=path%>/jsp/user.js.jsp"></script>
	<script type="text/javascript" src="<%=path%>/scripts/common/commonUtils.js"></script>
	
	<%
		String _local = request.getLocale().toString();
		if(_local.toLowerCase().contains("en")){
	%>	
	<%		
		}else  {
	%>	
	<script type="text/javascript" src="<%=path%>/scripts/common/com.skyform.component.i18n.zh_CN.js"></script>
	<%				
		}
	%>
