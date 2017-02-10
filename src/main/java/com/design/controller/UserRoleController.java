package com.design.controller;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.alibaba.fastjson.JSONObject;
import com.design.bean.BeanFactoryUtil;
import com.design.bean.ResultInfo;
import com.design.bean.UserBean;
import com.design.common.Constants;
import com.design.service.UserRoleService;
import com.design.util.JsonPluginsUtil;
import com.design.util.WebUtil;

@Controller
@RequestMapping("userRole")
public class UserRoleController {
	
	private static Logger logger = Logger.getLogger(UserRoleController.class);
	
	@RequestMapping(value="modifyUserAd",method=RequestMethod.POST,produces="application/json; charset=utf-8")
	public void modifyUserAd(HttpServletRequest request,HttpServletResponse response)throws Exception{
		ResultInfo ret = new ResultInfo();
		String userInfo = request.getSession().getAttribute("userInfo")+"";
		JSONObject json = JsonPluginsUtil.strToJsonObj(userInfo);
		if(json!=null){
			json = JsonPluginsUtil.strToJsonObj(json.getString("retObj"));
			UserBean userBean = JsonPluginsUtil.jsonObjToBean(json, UserBean.class);
			logger.info("session中的"+json);
			if(userBean!=null && userBean.getRoleId()==Constants.USER_ROLE_ADMIN){
				UserRoleService userRoleService = (UserRoleService) BeanFactoryUtil.getBean("userRoleService");
				JSONObject obj = WebUtil.getJson(request);
				ret = userRoleService.modifyAd(obj);
			}else{
				ret.setCode(-1);
				ret.setInfo("权限不足！");
			}
		}else{
			ret.setCode(-1);
			ret.setInfo("请重新登录！");
		}
		WebUtil.setResponse(response, JsonPluginsUtil.beanToJson(ret));
	}
}
