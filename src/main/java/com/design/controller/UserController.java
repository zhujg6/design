package com.design.controller;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSONObject;
import com.design.bean.BeanFactoryUtil;
import com.design.bean.ResultInfo;
import com.design.bean.UserBean;
import com.design.service.UserService;
import com.design.util.JsonPluginsUtil;
import com.design.util.WebUtil;

@Controller
@RequestMapping("user")
public class UserController {
	/**
	 * 登录
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	
	@RequestMapping(value="login",method=RequestMethod.POST,produces="application/json; charset=utf-8")
	public void login(HttpServletRequest request,HttpServletResponse response)throws Exception{
		ResultInfo ret = new ResultInfo();
		UserService userService = (UserService) BeanFactoryUtil.getBean("userService");
		JSONObject obj = WebUtil.getJson(request);
		ret = userService.login(obj);
		request.getSession().setAttribute("userInfo", JsonPluginsUtil.beanToJson(ret));
		WebUtil.setResponse(response, JsonPluginsUtil.beanToJson(ret));
	}
	/**
	 * 
	 * @param request
	 * @param response
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value="index")
	public String index(HttpServletRequest request,HttpServletResponse response)throws Exception{
		return "index";
	}
	/**
	 * 忘记密码
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	@RequestMapping(value="forgetPassww",method=RequestMethod.POST,produces="application/json; charset=utf-8")
	public void forgetPassww(HttpServletRequest request,HttpServletResponse response)throws Exception{
		ResultInfo ret = new ResultInfo();
		UserService userService = (UserService) BeanFactoryUtil.getBean("userService");
		JSONObject obj = WebUtil.getJson(request);
		ret = userService.forgetPassww(obj);
		WebUtil.setResponse(response, JsonPluginsUtil.beanToJson(ret));
	}
	/**
	 * 修改用户信息
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	@RequestMapping(value="modifyUserInfo",method=RequestMethod.POST,produces="application/json; charset=utf-8")
	public void modifyUserInfo(HttpServletRequest request,HttpServletResponse response)throws Exception{
		ResultInfo ret = new ResultInfo();
		UserService userService = (UserService) BeanFactoryUtil.getBean("userService");
		JSONObject obj = WebUtil.getJson(request);
		ret = userService.modifyUser(obj);
		WebUtil.setResponse(response, JsonPluginsUtil.beanToJson(ret));
	}
	/**
	 * 添加用户
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	@RequestMapping(value="addUserInfo",method=RequestMethod.POST,produces="application/json; charset=utf-8")
	public void addUserInfo(HttpServletRequest request,HttpServletResponse response)throws Exception{
		ResultInfo ret = new ResultInfo();
		UserService userService = (UserService) BeanFactoryUtil.getBean("userService");
		JSONObject obj = WebUtil.getJson(request);
		ret = userService.register(obj);
		request.getSession().setAttribute("userInfo", JsonPluginsUtil.beanToJson(ret));
		WebUtil.setResponse(response, JsonPluginsUtil.beanToJson(ret));
	}
}
