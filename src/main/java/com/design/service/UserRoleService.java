package com.design.service;

import com.alibaba.fastjson.JSONObject;
import com.design.bean.ResultInfo;

public interface UserRoleService {

		//修改角色
		public ResultInfo modifyAd(JSONObject obj);
			
		//增加角色(管理员)
//		public ResultInfo addUserAd(JSONObject obj);
}
