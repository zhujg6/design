package com.design.dao;

import java.util.List;

import com.design.bean.UserBean;

public interface UserDao {
	
	//增加用户
	public void addUser(UserBean userBean);
	
	//验证用户
	public List<UserBean> validationUser(UserBean userBean);
	
	//修改用户信息
	public void modifyUserInfo(UserBean userBean);
	
	//通过用户ID查询
	public UserBean queryUserInfoById(UserBean userBean);
	
	//通过登录名查询用户
	public List<UserBean> queryUserInfoByLoginName(UserBean userBean);
	
	//通过邮箱查询用户
	public List<UserBean> queryUserInfoByEmail(UserBean userBean);
	
	
}
