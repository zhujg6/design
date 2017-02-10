<%@ page language="java" contentType="text/html; charset=utf-8"
    pageEncoding="utf-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<script type="text/javascript" src='<c:url value="/js/jquery-1.7.2.min.js"></c:url>'></script>
<script type="text/javascript">
	$(function(){
	 	/* 
		//登录
		$(".but").click(function(){
			$.ajax({
            	type: "post",
                url: "user/login",
                contentType: "application/json;charset=utf-8",
                dataType: "json",
                data:JSON.stringify({"loginName":"zhujg","passww":"12345678"}),
                success:function(data){
                	 $timeout(function(){
                		 console.log(data);
                	 })
                }
			})
		})
		   */
		/* 
		//忘记密码
		$(".but").click(function(){
				$.ajax({
	            	type: "post",
	                url: "user/forgetPassww",
	                contentType: "application/json;charset=utf-8",
	                dataType: "json",
	                data:JSON.stringify({"email":"15765517018@163.com"}),
	                success:function(data){
	                	 $timeout(function(){
	                		 console.log(data);
	                	 })
	                }
				})
			})
		*/
			
		/* 
		//修改用户
		$(".but").click(function(){
				$.ajax({
	            	type: "post",
	                url: "user/modifyUserInfo",
	                contentType: "application/json;charset=utf-8",
	                dataType: "json",
	                data:JSON.stringify({"id":7,"sex":0,"username":"zjg","passww":"12345678","phone":"","tel":""}),
	                success:function(data){
	                	 $timeout(function(){
	                		 console.log(data);
	                	 })
	                }
				})
			}) 
		*/
			
			
		/*
		//添加用户
		$(".but").click(function(){
				$.ajax({
	            	type: "post",
	                url: "user/addUserInfo",
	                contentType: "application/json;charset=utf-8",
	                dataType: "json",
	                data:JSON.stringify({"loginName":"zzz","email":"1984240328@qq.com","sex":0,"username":"zzz","passww":"12345678","phone":"","tel":""}),
	                success:function(data){
	                	 $timeout(function(){
	                		 console.log(data);
	                	 })
	                }
				})
			}) 
		*/
		
		//修改角色
		$(".but").click(function(){
				$.ajax({
	            	type: "post",
	                url: "userRole/modifyUserAd",
	                contentType: "application/json;charset=utf-8",
	                dataType: "json",
	                data:JSON.stringify({"id":8,"roleId":1003}),
	                success:function(data){
	                	 $timeout(function(){
	                		 console.log(data);
	                	 })
	                }
				})
			}) 
		    
	})
</script>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
</head>
<body>
<button class="but">点击</button>
</body>
</html>
