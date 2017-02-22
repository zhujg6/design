package com.design.controller;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
@Controller
public class BaseController {
	/**
	 * 登录界面
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	@RequestMapping(value="logining")
	public String logining(HttpServletRequest request,HttpServletResponse response)throws Exception{
		return "login";
	}
	/**
	 * 注册界面
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	@RequestMapping(value="register")
	public String register(HttpServletRequest request,HttpServletResponse response)throws Exception{
		return "register";
	}
}
