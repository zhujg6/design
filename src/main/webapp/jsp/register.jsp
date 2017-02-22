<%@ page contentType="text/html; charset=utf-8" pageEncoding="utf-8"%>
<%
String strPath = "http://"+request.getServerName()+":"+request.getServerPort()+request.getContextPath()+"/";
%>
<html>
<head>
    <meta name="decorator" content="blank">
    <title>中国联通云服务平台</title>
    
    <link rel="stylesheet" type="text/css" href="<%=strPath %>css/skyform-component.css" />
    <link rel="stylesheet" type="text/css" href="<%=strPath %>css/jquery.dataTables.css" />
    <link rel="stylesheet" type="text/css" href="<%=strPath %>css/bootstrap.css" />
    <link rel="stylesheet" type="text/css" href="<%=strPath %>css/bootstrap-responsive.min.css" />
    <link rel="stylesheet" type="text/css" href="<%=strPath %>css/bootstrap-switch.css" />
    <link rel="stylesheet" type="text/css" href="<%=strPath %>css/smart_wizard.css" />
    <link rel="stylesheet" type="text/css" href="<%=strPath %>css/bootstrap-wizard.css" />
    <link rel="stylesheet" type="text/css" href="<%=strPath %>css/base.css" />
    <link rel="stylesheet" type="text/css" href="<%=strPath %>css/skyform.css" />
    <link rel="stylesheet" type="text/css" href="<%=strPath %>css/font-awesome.css" />
     <script src="<%=strPath%>scripts/jquery/jquery-1.7.2.min.js"></script>
     <script src="<%=strPath%>scripts/jquery/jquery.placeholder.js"></script>
    <link rel="stylesheet" type="text/css" href="<%=strPath %>css/jquery.multiselect.css" />
    <script src="<%=strPath%>scripts/jquery/jquery.multiselect.js"></script>
    <script src="<%=strPath%>scripts/common/valiter.js"></script>
    <script src="<%=strPath%>scripts/biz/verifyCode.js"></script>
    <script src="<%=strPath%>scripts/biz/register.js"></script>
    <script src="<%=strPath%>scripts/common/avoidSubmit.js"></script>
    <script src="<%=strPath%>scripts/jquery/jquery-ui-1.9.2.custom.min.js"></script>
    jquery.json-2.2.min.js
    Dcp.js
    DcpJqueryUtils4Yaxin.js
    common.js
    jquery.dataTables.js
    bootstrap.js
    bootstrap-switch.js
	jquery.smartWizard.js
	com.skyform.component.js
    <style>
        .register p.add-on.mal{position: relative;}
        .register p.add-on.mal span{display: block;position: absolute;left:-10px;top:10px;width:10px;height:10px;background: url("../images/tip_border.png");}
        .register p.add-on.mal.onError{ background-color:#ffefef;border:1px solid #fe5e5e;padding:5px 8px;}
        .register p.add-on.mal.onError span{background: url("../images/tip_err_bor.png");}
        .register p.add-on.mal.onShow{border:1px solid #99c2e8;padding:5px 8px;}
		#emailMsg a{color:#3577b5;}
        #emailMsg a:hover{color:#4d95c8;}
		#sendMessage {margin-left: 0px\0;line-height: 25px;}
        .register .mal{*zoom:1;*display: inline;*margin-left: 16px;}
		.form-horizontal .controls{margin-left:180px;}
        #sendMessagesNew{cursor: pointer;position: absolute;left: 256px;top: 6px;}
        /*验证star*/
        .nocaptchaContainer{position:absolute;z-index:99;left:0px;top:0px;width:324px;height:240px;overflow:hidden;margin:0;border: 1px solid #cccccc;padding-left: 28px;background: #fff;}
        .nocaptchaContainer p{margin:16px 0px;height:20px;line-height: 20px;font-size: 15px;}
        .nocaptcha-img{position:relative;width:300px;background: url(loading.png) 50% 50% no-repeat #f2f2f2;}
        .nocaptcha-img .nocaptcha-ori{display: block;width:300px;height:150px;position:absolute;left:0px;top:0px;background:url('1.jpg');}
        .nocaptcha-img .nocaptcha-new{display: none;width:300px;height:150px;position:absolute;left:0px;top:0px;background:url('1-3.jpg')}
        .nocaptcha-img .nocaptcha-info-mask{display: none;width:300px;height:150px;background: rgba(0,0,0,0.6);background: #000\0;filter:alpha(opacity=60)\0;opacity: 0.6\0;*background: rgb(0,0,0);*filter:alpha(opacity=60);*opacity: 0.6;position: relative;z-index: 99;}
        .nocaptcha-img .nocaptcha-info-mask span{color: #fff;width: 100%;text-align: center;display: block;position: absolute;top: 104px;}
        .nocaptcha-change{text-align: right;position: absolute;bottom: 5px;right: 10px;font-size: 14px;}
        .nocaptcha-change a{color:#1f83bd;text-decoration:none;}
        .nocaptcha-change a:hover{color:#3498db;}
        .nocaptcha-slice{position:absolute;left:273px;top:0px;display: block; width: 60px; height: 60px; background-image: url('1-3-1.png');}
        /*验证end*/
    </style>
</head>
<body>
<!--
<div class="alert alert-info">
            欢迎您进入沃云服务，请注册您的帐户.
</div>
 -->
<div class="register">
    <h1>
        <img src="<%=strPath %>images/register.png" style="height:20px;margin-right:5px;">注册新用户
        <span >我已注册，现在就 <a class="btn btn-primary" style="padding: 2px 8px;" href="<%=strPath%>logining">登录</a></span>
    </h1>
    <form class="form-horizontal span7" style="width:100%;" onsubmit="javascript:return false;">
        <fieldset>
            <div class="reg-email">
                <div class="control-group">
                    <!-- Text input-->
                    <label class="control-label" for="email"><span style="color:red;">*</span>电子邮箱</label>
                    <div class="controls">
                        <input placeholder="请输入邮箱" class="input-xlarge placeholderClass" type="text" id="email">
                        <%--<p class="add-on mal"><span class=""></span><i class="text-error icon-ban-circle" id="emailMsg"></i></p>--%>
                        <p class="add-on mal" id="emailMsg"></p>
                    </div>
                </div>
                <div class="control-group">
                    <!-- Text input-->
                    <label class="control-label" for="password"><span style="color:red;">*</span>请设置密码</label>
                    <div class="controls">
                        <input type="password" size="30" name="password"  placeholder="请设置登录密码" id="password" class="input-xlarge">
                        <!--<div class="mmqd">
                          <div class="btn-group">
                            <button  id="weak" class="registerPassword">弱</button>
                            <button id="middle" class="registerPassword">中</button>
                            <button id="strength" class="registerPassword">强</button>
                          </div>
                        </div>-->
                        <p class="add-on mal" id="pwdMsg"></p>
                    </div>
                </div>
                <div class="control-group">
                    <!-- Text input-->
                    <label class="control-label" for="rePassword"><span style="color:red;">*</span>请确认密码</label>
                    <div class="controls">
                        <input placeholder="请确认登录密码" class="input-xlarge" type="password" id="rePassword">
                        <p class="add-on mal" id="rePwdMsg"></p>
                    </div>
                </div>
            </div>
            <div class="control-group hide" id="capDiv_" style="margin-top:30px;">
                <!-- Text input-->
                <label class="control-label" for="captcha"><span style="color:red;">*</span>数据中心</label>
                <select style="width : 356px;" name="resourcePool" id="resourcePool_update" multiple="multiple" ></select>
                <p class="add-on mal" style="margin-left: 180px;"><i class="text-error" id="poolMsg"></i></p>
            </div>
            <div class="control-group hide" id="personEmail">
                <!-- Text input-->
                <label class="control-label" for="username"><span style="color:red;">*</span> <span id="userNameShow">用户姓名</span></label>
                <div class="controls">
                    <label class="radio inline">
                        <input value="1"  name="group" type="radio" checked="checked">
                        个人
                    </label>
                    <label class="radio inline">
                        <input value="2" name="group" type="radio" >
                        企业
                    </label>
                    <input  class="input-xlarge" placeholder="请输入用户姓名" style="width:216px;margin-left:10px;" type="text" id="username" max="20"/>
                    <p class="add-on mal"><i class="text-error" id="nameMsg"></i></p>
                </div>
            </div>
            <div class="reg-tele">
                <div class="control-group">
                    <label class="control-label" for="mobile"><span style="color:red;">*</span>手机号码</label>
                    <div class="controls">
                        <input placeholder="请输入手机号码" class="input-xlarge"  type="text" id="mobile" >
                        <p class="add-on mal" id="mobileMsg"><p>
                    </div>
                </div>
                <div class="control-group hide">
                    <label class="control-label" for="messageCode"></label>
                    <div class="controls">
                        <input placeholder="输入本次请求验证码" class="input-xlarge" style="width:241px;" type="text" id="messageCode" >
                        <img src="<%=request.getContextPath()%>/messageCodeServlet" id="find_imgvercode_msg"
                             style="vertical-align: middle;cursor: pointer;margin-left:16px;" onclick="changeMessageImg();" />
                        <p class="add-on mal" id="messageCodeMsg"></p>
                    </div>
                </div>
                <div class="control-group hide">
                    <label class="control-label" for="mobile"></label>
                    <div class="controls">
                        <input type=button value="获取短信验证码" class="input-xlarge sendMess" id="sendMessage">
                        <i class="text-error" style="margin-left:3px;"></i>
                        <p class="add-on mal" id="sss"><p>
                    </div>
                </div>
            </div>
            <div class="control-group" id="capDiv" style="margin-top:30px;">
                <!-- Text input-->
                <label class="control-label" for="captcha"><span style="color:red;">*</span>短信验证码</label>
                <div class="controls" style="position: relative;">
                    <input placeholder="请输入短信验证码" class="input-xlarge" type="text" id="captcha">
                    <p class="add-on mal" id="capMsg"></p>
                    <span id="sendMessagesNew" class="text-info"></span>
                    <%--验证star--%>
                    <div id="captchaContainer" class="nocaptchaContainer hide">
                        <p style="">拖动右侧图片完成拼图以获取验证码</p>
                        <div class="nocaptcha-img">
                            <div class="nocaptcha-ori"></div>
                            <div id="mask" class="nocaptcha-new"></div>
                            <div class="nocaptcha-info-mask"><span style="">拼图好像不正确，请刷新重试</span></div>
                        </div>
                        <div class="nocaptcha-change"><span><a href="javascript:void(0);" id="nocaptcha-change">换一张</a></span></div>
                        <div id="silderElemnet" class="nocaptcha-slice"></div>
                    </div>
                    <%--验证end--%>
                </div>
            </div>
            <div class="control-group" style="margin-bottom: 68px;">
                <label class="control-label" for=""></label>
                <div class="controls" id="registerBtn">
                    <p style="margin-bottom:10px;"><input type="checkbox" checked="checked" id="agreeServiceTerm" style="margin-top:0px;">&nbsp;我同意<a href="serviceTerm.jsp" target= "_blank" style="color: #3498db; font-size: 14px;">《沃云用户服务条款》</a></p>
                    <button class="btn btn-primary" style="line-height:30px;margin-right: 0px;width:354px;font-size:16px;" id="regSubmit" keyFlag="0">注册</button>

                </div>
            </div>

        </fieldset>
    </form>
    <!--<div class="span4" style="color: #888; font-size: 15px; font-style: italic; margin-top: 50px;">
    "扫一扫沃云二维码,获取更多沃云前沿信息"
    <br>
    <img  src="<%=strPath%>images/erweim.png" style="margin:30px;">
  </div>-->
</div>
</body>
</html>