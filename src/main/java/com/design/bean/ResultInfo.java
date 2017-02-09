package com.design.bean;


public class ResultInfo {
	public int code = -1;
	public String info="";//如果返回的是字符串 resType str
	public Object retObj;//如果调用该方法的时候需要返回一个对象 可以塞进去 resType bean
	
	public ResultInfo() {
		super();
	}

	public ResultInfo(int code,  String info, Object retObj) {
		super();
		this.code = code;
		this.info = info;
		this.retObj = retObj;
	}

	public int getCode() {
		return code;
	}

	public void setCode(int code) {
		this.code = code;
	}

	public String getInfo() {
		return info;
	}

	public void setInfo(String info) {
		this.info = info;
	}

	public Object getRetObj() {
		return retObj;
	}

	public void setRetObj(Object retObj) {
		this.retObj = retObj;
	}
	
	public boolean IsSuccss() {
		return code == 0;
	}


	

}
