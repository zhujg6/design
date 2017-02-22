<%@ page contentType="text/html; charset=utf-8" pageEncoding="utf-8"%>
<%
String strPath = "http://"+request.getServerName()+":"+request.getServerPort()+request.getContextPath()+"/";
%>
<html>
<head>
    <meta name="decorator" content="blank">
    <title>中国联通云服务平台</title>
     <link href="<%=strPath%>css/home.css?v=2" rel="stylesheet" type="text/css" />
     <script src="<%=strPath%>scripts/jquery/jquery-1.7.2.min.js"></script>

</head>
<body>
<div class="wrap">
  <div class="banner-show" id="js_ban_content">
    <div class="cell bns-01">
      <div class="con"> </div>
    </div>
    <div class="cell bns-02" style="display:none;">
      <div class="con"> <a href="http://www.js-css.cn" target="_blank" class="banner-link"> <i>圈子</i></a> </div>
    </div>
    <div class="cell bns-03" style="display:none;">
      <div class="con"> <a href="http://www.js-css.cn" target="_blank" class="banner-link"> <i>企业云</i></a> </div>
    </div>
  </div>
  <div class="banner-control" id="js_ban_button_box"> <a href="javascript:;" class="left">左</a> <a href="javascript:;" class="right">右</a> </div>
  <script type="text/javascript">
                ;(function(){
                    
                    var defaultInd = 0;
                    var list = $('#js_ban_content').children();
                    var count = 0;
                    var change = function(newInd, callback){
                        if(count) return;
                        count = 2;
                        $(list[defaultInd]).fadeOut(400, function(){
                            count--;
                            if(count <= 0){
                                if(start.timer) window.clearTimeout(start.timer);
                                callback && callback();
                            }
                        });
                        $(list[newInd]).fadeIn(400, function(){
                            defaultInd = newInd;
                            count--;
                            if(count <= 0){
                                if(start.timer) window.clearTimeout(start.timer);
                                callback && callback();
                            }
                        });
                    }
                    
                    var next = function(callback){
                        var newInd = defaultInd + 1;
                        if(newInd >= list.length){
                            newInd = 0;
                        }
                        change(newInd, callback);
                    }
                    
                    var start = function(){
                        if(start.timer) window.clearTimeout(start.timer);
                        start.timer = window.setTimeout(function(){
                            next(function(){
                                start();
                            });
                        }, 8000);
                    }
                    
                    start();
                    
                    $('#js_ban_button_box').on('click', 'a', function(){
                        var btn = $(this);
                        if(btn.hasClass('right')){
                            //next
                            next(function(){
                                start();
                            });
                        }
                        else{
                            //prev
                            var newInd = defaultInd - 1;
                            if(newInd < 0){
                                newInd = list.length - 1;
                            }
                            change(newInd, function(){
                                start();
                            });
                        }
                        return false;
                    });
                    
                })();
            </script>
  <div class="container">
    <div class="register-box">
      <div class="reg-slogan" style="margin-top:20px;"> <h3>新用户注册</h3></div>
      <div class="reg-form" id="js-form-mobile"> <br>
        <br>
        <div class="cell">
          <!-- <label for="js-mobile_ipt">填写手机号</label> -->
          <input type="text" name="mobile" id="js-mobile_ipt" class="text" maxlength="11" placeholder="填写手机号"/>
        </div>
        <div class="cell">
          <!-- <label for="js-mobile_pwd_ipt">设置密码</label> -->
          <input type="password" name="passwd" id="js-mobile_pwd_ipt" class="text" placeholder="设置密码"/>
          <input type="text" name="passwd" id="js-mobile_pwd_ipt_txt" class="text" maxlength="20" style="display:none;" />
          <b class="icon-form ifm-view js-view-pwd" title="查看密码" style="display: none"> 查看密码</b> </div>
        <!-- !短信验证码 -->
        <div class="cell vcode">
          <!-- <label for="js-mobile_vcode_ipt">输入验证码</label> -->
          <input type="text" name="code" id="js-mobile_vcode_ipt" class="text" maxlength="6" placeholder="输入验证码"/>
          <a href="javascript:;" id="js-get_mobile_vcode" class="button btn-disabled"> 免费获取验证码</a> </div>
        <div class="bottom"> <a id="js-mobile_btn" href="javascript:;" class="button btn-green"> 立即注册</a></div>
      </div>
       <div class="cell" style="margin-top:80px;margin-left:250px;">
       <font size="3px">已注册!&nbsp;&nbsp;&nbsp;去<a href="#">登录</a></font>
	   </div>
    </div>
  </div>
</div>
</body>
</html>