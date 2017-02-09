package com.design.bean;

import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class BeanFactoryUtil {
	static ApplicationContext context=new ClassPathXmlApplicationContext("applicationContext.xml");


	public static Object getBean(String beanName){
		return context.getBean(beanName);
	}
}