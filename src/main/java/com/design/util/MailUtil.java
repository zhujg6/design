package com.design.util;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.Properties;

import org.apache.commons.mail.EmailException;
import org.apache.commons.mail.HtmlEmail;
import org.apache.log4j.Logger;

import com.design.bean.Mail;


public class MailUtil {
	
	private static Logger logger = Logger.getLogger(MailUtil.class);
	
	public static boolean send(Mail mail){
		HtmlEmail email = new HtmlEmail();
		try {
			Properties properties = new Properties();
			properties.load(MailUtil.class.getResourceAsStream("mail.properties"));
			logger.info(properties.get("host")+"");
			logger.info(properties.get("name")+"");
			logger.info(properties.get("sender")+"");
			logger.info(properties.get("password")+"");
			email.setHostName(properties.get("host")+"");
			email.setCharset(Mail.ENCODEING);
			email.addTo(mail.getReceiver());
			email.setFrom(properties.get("sender")+"", properties.get("name")+"");
			email.setAuthentication(properties.get("name")+"", properties.get("password")+"");
			email.setSubject(mail.getSubject());
			email.setMsg(mail.getMessage());
			email.send();
			return true;
		} catch (EmailException e) {
			e.printStackTrace();
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
		return false;
	}
	public static void main(String[] args) {
		
		try {
			Properties properties = new Properties();
			properties.load(MailUtil.class.getResourceAsStream("mail.properties"));
			System.out.println(properties.get("name"));
			System.out.println(properties.get("password"));
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
}
