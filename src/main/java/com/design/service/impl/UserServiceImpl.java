package com.design.service.impl;

import java.util.List;

import org.apache.log4j.Logger;

import com.alibaba.fastjson.JSONObject;
import com.design.bean.BeanFactoryUtil;
import com.design.bean.Mail;
import com.design.bean.ResultInfo;
import com.design.bean.UserBean;
import com.design.common.Constants;
import com.design.dao.UserDao;
import com.design.service.UserService;
import com.design.util.CreatePassww;
import com.design.util.JsonPluginsUtil;
import com.design.util.MailUtil;
import com.design.util.Md5Util;

public class UserServiceImpl implements UserService {

	private static Logger logger = Logger.getLogger(UserServiceImpl.class);
	/**
	 * 登录
	 */
	public ResultInfo login(JSONObject obj) {
		ResultInfo ret = new ResultInfo();
		if(obj!=null && obj.get("loginName")!=null && obj.get("passww")!=null){
			logger.info("入参是"+obj);
			UserDao userDao = (UserDao) BeanFactoryUtil.getBean("userDao");
			UserBean userBean = new UserBean();
			userBean.setLoginName(obj.getString("loginName"));
			userBean.setPassww(Md5Util.getMd5(obj.getString("passww")));
			List<UserBean> users= userDao.validationUser(userBean);
			if(users.size()==1){
				ret.setCode(0);
				ret.setInfo("登录成功！");
				ret.setRetObj(users.get(0));
			}else{
				ret.setCode(-1);
				ret.setInfo("登录失败！");
				ret.setRetObj(null);
			}
		}else{
			ret.setCode(-1);
			ret.setInfo("登录失败！参数错误");
			ret.setRetObj(null);
		}
		return ret;
	}
	/**
	 * 增加用户
	 */

	public ResultInfo register(JSONObject obj) {
		ResultInfo ret = new ResultInfo();
		if(obj!=null){
			logger.info("入参是"+obj);
			UserBean userBean = JsonPluginsUtil.jsonObjToBean(obj, UserBean.class);
			if(userBean.getLoginName()!=null&&!"".equals(userBean.getLoginName())){
				if(userBean.getPassww()!=null&&!"".equals(userBean.getPassww())){
					if(userBean.getEmail()!=null&&!"".equals(userBean.getEmail())){
						UserDao userDao = (UserDao) BeanFactoryUtil.getBean("userDao");
						List<UserBean> userlogin = userDao.queryUserInfoByLoginName(userBean);
						if(userlogin.size()==0){
							List<UserBean> useremail =userDao.queryUserInfoByEmail(userBean);
							if(useremail.size()==0){
								String password = Md5Util.getMd5(userBean.getPassww());
								userBean.setPassww(password);
								userBean.setRoleId(Constants.USER_ROLE_ORDINARY);
								userDao.addUser(userBean);
								ret.setCode(0);
								ret.setInfo("注册成功！");
								Mail mail = new Mail();
								mail.setReceiver(userBean.getEmail());
								mail.setMessage("欢迎注册！");
								MailUtil.send(mail);
			//					ret.setRetObj(null);
							}else{
								ret.setCode(-1);
								ret.setInfo("注册失败！邮箱已存在");
								ret.setRetObj(null);
							}
						}else{
							ret.setCode(-1);
							ret.setInfo("注册失败！登录名已存在");
							ret.setRetObj(null);
						}
					}else{
						ret.setCode(-1);
						ret.setInfo("注册失败！邮箱不能为空");
						ret.setRetObj(null);	
					}
				}else{
					ret.setCode(-1);
					ret.setInfo("注册失败！密码不能为空");
					ret.setRetObj(null);
				}
			}else{
				ret.setCode(-1);
				ret.setInfo("注册失败！登录名不能为空");
				ret.setRetObj(null);
			}
			
		}else{
			ret.setCode(-1);
			ret.setInfo("注册失败！参数错误");
			ret.setRetObj(null);
		}
		return ret;
	}
/**
 * 修改用户信息
 */
	public ResultInfo modifyUser(JSONObject obj) {
		ResultInfo ret = new ResultInfo();
		if(obj != null){
			logger.info("入参是:"+obj);
			if(obj.get("id")!=null){
				UserBean userBean = JsonPluginsUtil.jsonObjToBean(obj, UserBean.class);
				UserDao userDao= (UserDao) BeanFactoryUtil.getBean("userDao");
				UserBean newUser = userDao.queryUserInfoById(userBean);
				newUser.setSex(userBean.getSex());
				if(userBean.getUsername()!=null&&!"".equals(userBean.getUsername())){
					newUser.setUsername(userBean.getUsername());
				}
				if(userBean.getPassww()!=null&&!"".equals(userBean.getPassww())){
					newUser.setPassww(userBean.getPassww());
				}
				if(userBean.getPhone()!=null&&!"".equals(userBean.getPhone())){
					newUser.setPhone(userBean.getPhone());
				}
				if(userBean.getTel()!=null&&!"".equals(userBean.getTel())){
					newUser.setTel(userBean.getTel());
				}
				if(userBean.getEmail()!=null&&!"".equals(userBean.getEmail())){
					List<UserBean> useremail =userDao.queryUserInfoByEmail(userBean);
					if(useremail.size()>0){
						ret.setCode(-1);
						ret.setInfo("修改用户失败！邮箱已存在");
						ret.setRetObj(null);
						return ret;
					}
					newUser.setEmail(userBean.getEmail());
				}
				userDao.modifyUserInfo(newUser);
				ret.setCode(0);
				ret.setInfo("修改成功！");
			}else{
				ret.setCode(-1);
				ret.setInfo("修改用户失败！缺少必要参数ID");
				ret.setRetObj(null);
			}
		}else{
			ret.setCode(-1);
			ret.setInfo("修改用户失败！参数错误");
			ret.setRetObj(null);
		}
		return ret;
	}
	/**
	 * 忘记密码
	 */
	public ResultInfo forgetPassww(JSONObject obj) {
		ResultInfo ret = new ResultInfo();
		if(obj!=null){
				logger.info("入参是:"+obj);
				UserBean userBean = JsonPluginsUtil.jsonObjToBean(obj, UserBean.class);
				UserDao userDao = (UserDao) BeanFactoryUtil.getBean("userDao");
				List<UserBean> useremail =userDao.queryUserInfoByEmail(userBean);
				if(useremail.size()>0){
					logger.info("邮箱正确！可以修改");
					userBean = useremail.get(0);
					String passww = CreatePassww.genRandomNum(8);
					Mail mail = new Mail();
					mail.setReceiver(userBean.getEmail());
					mail.setMessage("密码已经重置！初始化密码为"+passww);
					MailUtil.send(mail);
					userBean.setPassww(Md5Util.getMd5(passww));
					userDao.modifyUserInfo(userBean);
					ret.setCode(0);
					ret.setInfo("重置密码成功");
//					ret.setRetObj(null);
				}else{
					ret.setCode(-1);
					ret.setInfo("重置密码失败！邮箱不存在");
					ret.setRetObj(null);
				}
		}
		return ret;
	}
	
	
	public static void main(String[] args) {
		UserService userService = new UserServiceImpl();
		JSONObject obj = new JSONObject();
//		obj.put("loginName", "zjg");
//		obj.put("passww", "12345678");
//		obj.put("email", "915018368@qq.com");
		obj.put("id", 7);
//		obj.put("sex",1);
//		obj.put("username", "zjg");
		obj.put("roleId", Constants.USER_ROLE_ORDINARY);
//		logger.info(JsonPluginsUtil.beanToJson(userService.login(obj)));
//		logger.info(JsonPluginsUtil.beanToJson(userService.register(obj)));
//		logger.info(JsonPluginsUtil.beanToJson(userService.forgetPassww(obj)));
//		logger.info(JsonPluginsUtil.beanToJson(userService.modifyUser(obj)));
//		logger.info(JsonPluginsUtil.beanToJson(userService.modifyAd(obj)));
	}
	

}
