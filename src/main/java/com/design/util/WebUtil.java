package com.design.util;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.OutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.log4j.Logger;
import com.alibaba.fastjson.JSONObject;

public class WebUtil {
	private static final Logger logger = Logger.getLogger(WebUtil.class);
	public static void setResponse(HttpServletResponse response,String str) {
		
		//·µ»Ø½á
		try{
			OutputStream out = response.getOutputStream();
			byte[] bt=str.getBytes("UTF-8");
			response.setContentLength(bt.length);
			response.setContentType("application/json;charset=UTF-8");
			out.write(bt);
			out.close();
			out.flush();
		}catch (Exception e) {
			// TODO: handle exception
		}
	}
	
    public static JSONObject getJson(HttpServletRequest request) throws IOException{
    	JSONObject json=new JSONObject();
    	BufferedReader param=request.getReader();
    	StringBuffer sb=new StringBuffer();
    	String tempString = null;
    	while ((tempString=param.readLine())!=null) {
    		sb.append(tempString);
		}
		String jsonStr=sb.toString();
		if(jsonStr!=null&&jsonStr.length()>0){
			json=JsonPluginsUtil.strToJsonObj(jsonStr);
		}
		return json;
    }
    
}
