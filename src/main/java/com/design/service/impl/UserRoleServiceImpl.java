package com.design.service.impl;

import org.apache.log4j.Logger;

import com.alibaba.fastjson.JSONObject;
import com.design.bean.BeanFactoryUtil;
import com.design.bean.ResultInfo;
import com.design.bean.UserBean;
import com.design.dao.UserRoleDao;
import com.design.service.UserRoleService;
import com.design.util.JsonPluginsUtil;

public class UserRoleServiceImpl implements UserRoleService {

	private static Logger logger = Logger.getLogger(UserRoleServiceImpl.class);
	/**
	 * 修改角色
	 * @param obj
	 * @return
	 */
	public ResultInfo modifyAd(JSONObject obj) {
		ResultInfo ret = new ResultInfo();
		if(obj!=null){
			logger.info("入参是:"+obj);
			if(obj.get("id")!=null&&obj.get("roleId")!=null){
				UserBean userBean = JsonPluginsUtil.jsonObjToBean(obj, UserBean.class);
				UserRoleDao userRoleDao = (UserRoleDao) BeanFactoryUtil.getBean("userRoleDao");
				userRoleDao.modifyUserAd(userBean);
				ret.setCode(0);
				ret.setInfo("修改角色成功！");
			}else{
				ret.setCode(-1);
				ret.setInfo("变更角色失败！缺少必要参数");
				ret.setRetObj(null);
			}
		}else{
			ret.setCode(-1);
			ret.setInfo("变更角色失败！参数为空");
			ret.setRetObj(null);
		}
		return ret;
	}
	
		
}
