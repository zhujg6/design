<%@ include file="/include/mainHeader.inc" %>

<html>
<body>
<h2>Hello World!</h2>
</body>
</html>
<script type="text/javascript">
//Dcp.biz.apiRequest("/user/describeUsers", {name:'系统管理员'}, function(data){
//	alert(JSON.stringify(data));
//});
Dcp.biz.apiRequest("/instance/vm/describeInstances", {}, function(data){
	alert(JSON.stringify(data));
});

</script>