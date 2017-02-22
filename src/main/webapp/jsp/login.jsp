<%@ page contentType="text/html; charset=utf-8" pageEncoding="utf-8" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jstl/fmt" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%--
	String ctx = (String)application.getAttribute("ctx");
--%>
 <%
	String local_login = request.getLocale().toString();
 	String strPath = "http://"+request.getServerName()+":"+request.getServerPort()+request.getContextPath()+"/";
%>	
<!DOCTYPE html>
<html>
<head>
<title>中国联通云服务平台</title>
<link href="<c:url value='/css/bootstrap.css'/>" rel="stylesheet">
<link href="<c:url value='/css/bootstrap-responsive.min.css'/>" rel="stylesheet">
<link href="<c:url value='/css/login.css'/>" rel="stylesheet" />
</head>
<body>
<div class=" login_header">
    <div class="container">
        <div class="row">
            <div class="span6">
                <div style="float:left;margin-top: 5px;">
                    <!-- <a href="/" class="logo"><img src="/u/cms/www/201407/images/logo.svg" border="0" /></a>-->
                    <a href="<%=strPath %>" class="sf-logo">
                        <svg width="155" height="58" style="float: left;border:0">
                            <image xlink:href="<c:url value='/images/logo_bl.svg'/>" src="<c:url value='/images/logo_bl.png'/>" width="155" height="58"></image>
                        </svg>
                    </a>
                    <!-- <a href="/" class="logo"><img src="/u/cms/www/201407/images/logo.svg" onerror="this.src=/u/cms/www/201407/logo.png" border="0" /></a> -->
                </div>
                <div style="line-height:72px;font-size:20px;padding-left:15px;float:left;">登录</div>
            </div>
            <div class="span6 text-right">
                <a href="<%=strPath %>">沃云首页</a>&nbsp;&nbsp;|&nbsp;&nbsp;<a href="http://www.wocloud.com.cn/webclient/">沃家云盘</a>&nbsp;&nbsp;|&nbsp;&nbsp;<a href="http://www.10010.com/">联通官网</a>
            </div>
        </div>
    </div>
</div>
<div class="login_mian">
    <div class="container">
        <div class="row">
            <div class="span6">
                <div class="left">
                    <img src="<%=strPath %>images/left.png" style="width:350px" />
                </div>
            </div>
            <div class="span6">
                <div class="login_box">
                    <h1>登录沃云<span id="publicRegister">没有沃云账号？<a href="<%=strPath%>register">立即注册</a></span></h1>
                    <form onsubmit="javascript:return false;">
                        <p class="add-on" id="logMsg" style="font-size: 14px;color: red;min-height:30px;"></p>
                        <div id="username_con" style="position: relative;">
                            <input type="text" name="username" id="username" placeholder="用户名/邮箱/手机号" data-provide="typeahead" autocomplete="off" data-source='' >
                        </div>
                        <p class="add-on"><i class="text-error" id="nameMsg"></i></p>
                        <input type="password" name="password" id="password" placeholder="密码" placeholderb="18px">
                        <p class="add-on"><i class="text-error" id="pwdMsg "></i></p>
                        <div class="" style="display:none;" id="capDiv">
                            <input type="text" placeholder="请输入验证码" id="captcha">
                            <img src="<%=request.getContextPath()%>/gernerateCodeServlet" id="find_imgvercode" onclick="changeImg();" />
                            <span onclick="changeImg();" style="cursor: pointer;padding-left: 15px;">换一张</span>
                        </div>
                        <div id="btnDiv">
                            <input type="button" id="loginSubmit" state="0" value="登录">
                        </div>
                        <label id="checkDiv" class="checkbox" style="text-align: right;" for="">
                                <span>
                                <a href="<%=strPath %>/jsp/forgetPwd.jsp"  style="float:right;">忘记密码?</a>
                                </span>
                        </label>


                    </form>
                </div>
            </div>
        </div>
    </div>

</div>
<div class="login_footer">
    <div class="container">
        <p class="text-center">
            Copyright©1999-2015 中国联通 版权所有
        </p>
        <p class="text-center">
            中华人民共和国增值电信业务经营许可证 经营许可证编号：A2.B1.B2-20090003
        </p>
    </div>
</div>
<%--绑定手机号弹窗--%>
<div id="bindPhoneDiv" class="modal hide fade" style="width: 400px;left: 53%" aria-hidden="true" data-backdrop="static">
	<div class="modal-header" style="background-color:#f5f5f5;border-top-right-radius: 5px;border-top-left-radius: 5px">
		<button type="button" class="close" data-dismiss="modal">×</button>
		<h3 style="color: #666;">绑定手机号</h3>
	</div>
	<div class="modal-body" id="bindPhone">
		<div style="margin-bottom: 20px;">
			<p style="text-align: center;font-size: 16px;color: #a7a7a7;font-family: '微软雅黑,宋体';width: 302px;">
				<image src="<c:url value='/images/icon/security.png'/>" style="margin-bottom: 15px;width: 26px;height: 26px;display: block;padding-left: 137px"></image>
				<span style="line-height:26px;">探测到您的账号存在安全风险，建议关联手机号提高安全性</span>
				<input type="hidden" value="true" id="bindMobileFlag">
			</p>
		</div>
		<form class="form-horizontal" style="text-align: center">
			<div class="control-group" style="margin-bottom: 0px;border-top: 2px solid lightgrey;width: 330px;position: relative">
				<i class="icon-tablet" style="font-size: 18px;color:lightgrey ;position: absolute;top: 12px;left: 6px"></i>&nbsp;&nbsp;
				<input type="text" id="phoneInput" placeholder="请输入手机号" style="width : 276px;height: 30px;border: none;outline: none;box-shadow: 0px 0px !important;outline-style: none;margin-left: 2px;"/>
			</div>
			<div class="control-group" style="width: 330px;margin-top:0px;margin-bottom: 0px;border-top: 2px solid lightgrey;border-bottom:2px solid lightgrey ;position: relative">
				<i class="icon-check"style="font-size: 18px;color:lightgrey;position: absolute;top: 11px;left: 5px"></i>&nbsp;&nbsp;
				<input placeholder="验证码" type="text" placeholder="验证码" id="confirmNumInput" style="width : 178px;height: 22px;border: none;outline: none;box-shadow: 0px 0px !important;outline-style:none;margin-left:10px"/>
				<span class="btn" style=" line-height: 22px;font-size: 14px;display: inline-block;padding-left:15px;background: #fff;box-shadow: 0 0;border: none;color: #a7a7a7;border-left: 1px solid #a7a7a7;position: relative;"id="getNum" ><span id="getNumMask" style="display:none;position: absolute;left:0px;top: 0px;width: 0px;height: 0px;background: #fff;"></span>获取验证码</span>
			</div>
		</form>
		<p style="margin:15px 0px 0px 20px;color: red;display: none" id="bindPhoneTip">*</p>
	</div>
	<div class="modal-footer" style="background-color:#fff;text-align: center;border:none;margin-top: -8px;margin-bottom: 10px">
		<button class="btn btn-primary action " action="bindPhone" id="bindPhoneBtn" style="width:330px;font-size: 15px">立即绑定</button>
	</div>
</div>
<%--绑定手机号成功弹窗--%>
<div id="bindOkDiv" class="modal hide fade " style="width: 340px;height: 180px;left: 53%" aria-hidden="true" data-backdrop="static" >
	<div class="modal-body" style="height: 70px">
			<div style="float: left;margin:33px 0 0 31px">
				<i class="icon-ok-circle" style="font-size: 35px;color:orange"></i>
			</div>
			<div style="float: left;margin:20px 0 0 20px">
				<p style="text-align: center;font-size: 14px;font-weight:700;line-height: 25px">
					<span>恭喜您，手机号已经绑定成功!</span><br/>
					<span>您可以用手机号登录沃云平台.</span>
				</p>
			</div>
	</div>
	<div class="modal-footer" style="background-color:#fff;text-align: center;border:none">
		<button class="btn btn-primary action " action="bindPhone" id="bindOk" style="width:250px;">确定</button>
	</div>
</div>
</body>
</html>
