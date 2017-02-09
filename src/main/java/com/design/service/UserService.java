package com.design.service;

import com.alibaba.fastjson.JSONObject;
import com.design.bean.ResultInfo;

public interface UserService {

	//登录
	public ResultInfo login(JSONObject obj);
	
	//增加用户
	public ResultInfo register(JSONObject obj);
	
	//修改用户信息
	public ResultInfo modifyUser(JSONObject obj);
	
	//忘记密码
	public ResultInfo forgetPassww(JSONObject obj);
	
	
	
}
