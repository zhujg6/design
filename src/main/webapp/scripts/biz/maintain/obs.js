$(function(){
	obs.init();
});
var obs = {
//	obsState: [],
	obsInstance : null,
	s3_url : null,
	account : null,
	password : null,
	s3_access_key : null,
	s3_secure_key : null,
	obsInsState : null,
	init : function() {
//		$("iframe#OStore1").hide();
		obs.getObsUrl();
//		obs.obsState = {
//				"pending" : "待审核",
//				"reject" : "审核拒绝",
//				"opening" : "正在开通",
//				"changing" : "正在变更",
//				"deleting" : "正在销毁",
//				"deleted" : "已销毁",
//				"running" : "就绪"	,// 就绪
//				"using" : "已挂载"
//		};			
		$("#createObsA").unbind("click").bind("click", function() {	
//			$("#OStorediv").hide();
			$("#createObsModal form")[0].reset();
			$("#createObsModal").modal("show");
		});
	
		// 新建obs
		$("#btnCreateObs").bind('click',function(e){
			obs.createObs();
		});	
		//点击修改按钮
		$("#btn_modifyObs").bind('click',function(e){
			obs.handleLi(0);					
		});	
		//修改obs
		$("#modify_save").bind('click',function(e){
			var instanceName = $("#modifyObsModal  input[name='instance_name']").val();
//			var comment = $("#modifyObsModal textarea").val();
			obs.modifyObs(instanceName);		
		});

		//点击删除按钮
		$("#btn_delete").bind('click',function(e){
			obs.handleLi(3);					
		});	
		
	    $('#modifyObsModal').on('hidden', function () {
	    	$("#IOperate").show();
//	    	$("#OStorediv").show();
	    });
	    
		$("#btn_s3_key").bind('click',function(e){
			$("#s3KeyModal").modal("show");					
		});	
		$("#creating_refresh").bind('click',function(e){
			obs.refreshObs();			
		});	

		$("#deleting_refresh").bind('click',function(e){
			obs.refreshObs();			
		});	
		$("#btnRefresh").unbind("click").bind("click", function() {
			obs.refreshObs();
		});

		obs.refreshObs();
//		obs.describeObsDetail();
		if(obs.obsInstance != null && obs.obsInstance.id>0){
			obs.showInstanceInfo(obs.obsInstance.id);
		}
	},
	refreshObs : function(){
		obs.getObsInstance();		
		obs.showOrHideCreateBtn();
		obs.showOrHideDeleteBtn();
		obs.showOrHideModifyBtn();
		obs.showOrHideS3KeyBtn();
		obs.showOrHideObsName();
		obs.showOrHideS3Operate();
		obs.showOrHideCreatingDiv();
		obs.showOrHideDeletingDiv();	
		if(obs.obsInstance != null){
			if(obs.obsInstance.state=='error'){
				$.growlUI("提示", "对象存储操创建失败,请删除");		
			}
		}
	},
	showOrHideCreateBtn : function(){
		var hideCreate = false;
		//如果用户申请过了存在running或者opening状态的实例，则disabled
		if(obs.obsInstance != null){
			if(obs.obsInstance.state=='running' || obs.obsInstance.state=='opening' || obs.obsInstance.state=='deleting' || obs.obsInstance.state=='error'){
				hideCreate = true;
			}
		}else{
			hideCreate = false;
		}
		if (!hideCreate) {
			$("#createObsA").attr("disabled",false);
			$("#createObsA").unbind("click").bind("click", function() {	
				$("#createObsModal form")[0].reset();
				$("#createObsModal").modal("show");
			});			
		}else{			
			$("#createObsA").attr("disabled",true);
			$("#createObsA").unbind("click");
		}
	},
	showOrHideDeleteBtn : function(){
		var hideDelete = false;
		if(obs.obsInstance != null){
			if(obs.obsInstance.state!='running' && obs.obsInstance.state!='error'){
				hideDelete = true;
			}			
		}else{
			hideDelete = true;
		}
		if (!hideDelete) {
			$("#btn_delete").attr("disabled",false);
		}else{
			$("#btn_delete").attr("disabled",true);
		}
	},
	showOrHideModifyBtn : function(){
		var hideModify = false;
		if(obs.obsInstance == null){
			hideModify = true;
		}else{
			if(obs.obsInstance.state=='deleting' || obs.obsInstance.state=='error'){
				hideModify = true;
			}
		}
		if (!hideModify) {
			$("#btn_modifyObs").attr("disabled",false);
		}else{
			$("#btn_modifyObs").attr("disabled",true);
		}
	},
	showOrHideS3KeyBtn : function(){
		var hideS3Key = false;
		if(obs.obsInstance == null){
			hideS3Key = true;
		}else{
			if(obs.obsInstance.state!='running'){
				hideS3Key = true;
			}
		}
		if (!hideS3Key) {
			$("#btn_s3_key").attr("disabled",false);
		}else{
			$("#btn_s3_key").attr("disabled",true);
		}
	},
	showOrHideS3Operate : function(){
		var showS3Iframe = false;
		//如果用户申请过了存在running状态的实例
		if(obs.obsInstance != null){
			if(obs.obsInstance.state=='running'){ //存在running状态的实例
				if(obs.getS3User()){  //用户在s3上已经存在
					showS3Iframe = true;
				}							
			}
		}
		if (showS3Iframe) {
	    	obs.show_user(obs.account, obs.password);				  
		}else{
			$("iframe#IOperate").hide();	
		}
	},
	showOrHideObsName : function(){
		var hideObsName = false;
		//如果用户申请过了存在running状态的实例，则disabled
		if(obs.obsInstance == null){
			hideObsName = true;
		}
		if (!hideObsName) {
			$("#obsInsName").html(obs.obsInstance.instanceName);
			$("#obsInsNameDiv").show();			
		}else{
			$("#obsInsNameDiv").hide();
		}
	},
	showOrHideCreatingDiv : function(){
		var showCreatingDiv = false;
		if(obs.obsInstance != null){
			if(obs.obsInstance.state=='opening'){
				showCreatingDiv = true;
			}
		}
		if(showCreatingDiv){
			$("#OSCreatingdiv").show();
		}else{
			$("#OSCreatingdiv").hide();
		}
	},
	showOrHideDeletingDiv : function(){
		var showObsDeletingDiv = false;
		if(obs.obsInstance != null){
			if(obs.obsInstance.state=='deleting'){
				showObsDeletingDiv = true;
			}
		}
		if(showObsDeletingDiv){
			$("#OSDeletingdiv").show();
		}else{
			$("#OSDeletingdiv").hide();
		}
	},
	getObsUrl : function() {		
		Dcp.biz.apiRequest("/instance/obs/getObsUrl", null, function(data){
			if(data.code == "0"){
				var _data = data.data;
		          if(typeof(_data) == "string" && _data.indexOf("error") == 0) {		        	  	
			            return "";
			          }else {
			        	var ostoreURI  = _data.url;
			        	obs.s3_url = _data.url;
			        	var account = _data.account;
			        	obs.account = account;		        	
				      }				
			} else {
				$.growlUI("提示", "获取对象存储操作页面的地址发生错误：" + data.msg);				
			}
		});
	},
	getSecureToken : function() {
		var secure_token = "";
		Dcp.biz.apiRequest("/instance/obs/getSecureToken", null, function(data){			
			if(data.code == "0"){
				var _data = data.data;
		        if(typeof(_data) == "string" && _data.indexOf("error") == 0) {		        	  			        	
			    }else {
			    	secure_token = _data;  //_data.secure_token;
//			        	$.cookie("secure_token",secure_token);			        	
				}				
			}
		});
		return secure_token;
	},
	getS3User : function() {		
		var result = true;
		Dcp.biz.apiRequest("/instance/obs/getObsUser", null, function(data){
			if(data.code == "0"){
				var _data = data.data;
		        if(_data == null){
		        	result = false;
		        }else{
					if(typeof(_data) == "string" && _data.indexOf("error") == 0) {
			        	result = false;
				    }else {
				    	//{"username":"chenqiang","status":"active","created":1385360793000,"allocated":1099511627776,"used":0,"password":"523b74a7067e566fd00754f12d11aeca","accesskey":"34YI5Z05NUHIEFFDGNWT","secretkey":"E+cUpssfo1oRNg+NPszVKGT7AcpqZ2ygl5wQjOHr"}
				    	if(_data.result == 'failed'){
				    		result = false;
				    		$.growlUI("提示", "对象存储正在开通中...");
				    	}else{
				    		if(_data.status='active'){  //pause
						    	obs.s3_access_key = _data.accesskey;
								obs.s3_secure_key = _data.secretkey;
								$("#s3_access_key").val(_data.accesskey);
								$("#s3_secure_key").val(_data.secretkey);
								obs.password = _data.password;
				    		}else{
				    			result = false;
				    			$.growlUI("提示", "对象存储用户状态为暂停");
				    		}
				    	}			    	
					}						        	
		        }
			} else {
				result = false;			
			}
		});
		return result;
	},
	
//	showS3 : function(ostoreURI){
//		$("#OIOperate).removeAttr("onload");
//  		$("#OStore1").attr("src", ostoreURI);
//  		$("#OStore1").show();	
//	},
    show_user : function(account,pwd){
    	$("#OStore1").attr("src", obs.s3_url+"/index.php?get_action=webdav_logout");    	   	
    	$("#OStore1").bind("load",function(){
    		$(this).remove();
    		$("<iframe id='loginiframe' src='"+obs.s3_url+"/index.php?get_action=login&userid="+account+"&login_seed=-1&password="+pwd+"&_method=put'/>").appendTo("body");
    		$("#loginiframe").bind("load",function(){
    			$(this).remove();
    			$("<iframe id='IOperate' src='"+obs.s3_url+"' width='100%' height='550' frameborder='0' style='z-index:1;'>").appendTo($("#content_container"));
    		});
    	});    	    	
    },
	getObsInstance : function() {
		var params = {
				"templateType" : 11
		};		
		//查询running状态的obs
		Dcp.biz.apiRequest("/instance/obs/describeObsDetail", params, function(data){
			if(data.code == "0"){
				var _data = data.data;
		          if(typeof(_data) == "string" && _data.indexOf("error") == 0) {
			            
			      }else {
			    	  if(_data == null){
			    		  obs.obsInstance = null;
			    	  }else{
			    		  if(_data.id>0){
			    			  obs.obsInstance = _data;
			    		  }
			    	  }
				  }				
			}
		});
	},
	// 创建对象存储
	createObs : function() {
		var isSubmit = true;
		var instanceName = $.trim($("#createInsName").val());
		// 验证
		$("#createInsName").jqBootstrapValidation();
		
      var scoreReg = /^[\u4E00-\u9FA0A-Za-z\-0-9\_]+$/;
      if(instanceName != ""){
          if(! scoreReg.exec(instanceName)) {
        	  $("#tipCreateInsName").text("请输入中文,字母,数字,下划线及连接符");
              $("#createInsName").focus();
              isSubmit = false;
          }else{
        	  $("#tipCreateInsName").text("");
          }     	  
      	}
		
		if (!isSubmit) {
			return;
		}

		var params = {
				"instanceName" : instanceName,
				"storageSize" : 1024
		};
		Dcp.biz.apiRequest("/instance/obs/createObsVolumes", params, function(data) {
			if (data.code == "0") {
				$("#createObsModal").modal("hide");
				$.growlUI("提示", "对象存储服务申请成功，正在开通..."); 
				obs.refreshObs();
				$("#IOperate").show();
//				$("#OStorediv").show();
			} else {
				$.growlUI("提示", "对象存储服务申请失败：" + data.msg); 
			}
		});
	},
	// 修改对象存储名称和描述  createUserId??????
	modifyObs : function(name) {		
				var params = {
						"id" : obs.obsInstance.id,
						"instanceName": name,
//						"comment" : comment,
						"modOrLarge" : 1
				};
				Dcp.biz.apiRequest("/instance/obs/modifyObsVolumeAttributes", params, function(data){
					if(data.code == "0"){
						$("#obsInsName").html(name);
						obs.obsInstance.instanceName = name;
//						obs.obsInstance.comment = comment;						
						$("#modifyObsModal").modal("hide");
						$("#IOperate").show();
//						$("#OStorediv").show();
						$.growlUI("提示", "修改对象存储信息成功！"); 												
					} else {
						$.growlUI("提示", "修改对象存储信息发生错误：" + data.msg); 
					}
				});
	},
	// 根据选中的虚拟硬盘的选择状态判断是否将修改选项置为灰色
	showOrHideOpt : function() {
//		var checkboxArr = $("#obsTable tbody input[type='checkbox']:checked");
		var applycount = 1;
		if(applycount == 1){
			$("#btn_modifyObs").attr("disabled",false);
			$("#btn_delete").attr("disabled",false);
		} else {
			$("#btn_modifyObs").attr("disabled",true);
			$("#btn_delete").attr("disabled",true);

		}
	},
	handleLi : function(index){
		$("#IOperate").hide();
//		$("#OStorediv").hide();
		if(index==0){
			//只有当选中一个对象存储时修改名称和备注，其他情况友情提示
			var oldInstanceName = "";
//			var oldComment = "";
			if(obs.obsInstance){
				oldInstanceName = obs.obsInstance.instanceName;
//				oldComment = obs.obsInstance.comment;
			}else{
				oldInstanceName = $("#obsInsName").html();
			}

				$("#modInsName").val(oldInstanceName);
//				$("#modComment").val(oldComment);
				$("#modifyObsModal").modal("show");										
		}
		else if(index==3){
//			if(obs.beforeDelete()){
			$("#IOperate").remove();
			$('<iframe src="" id="OStore1" name="OStore1" width="100%" height="550" frameborder="0" style="z-index:1;display:none;"></iframe>').appendTo("body");
			obs.destroyDisk();					
//			}
		}	
	}, 
   	beforeDelete : function(){
//		var checkedArr =  obs.getCheckedArr();
		var _reuslt = true;
//		$(checkedArr).each(function(index, item) {
//			var tr = $(item).parents("tr");					
//			var id = $("input[type='checkbox']", $("td", tr)[0]).val();
			var state = obs.obsInstance.state;
			if(state != 'running'){
				$.growlUI("提示", "id为"+id+"的对象存储不是就绪状态, 删除只能对就绪状态的对象存储进行操作，请重新进行选择！");
				_reuslt = false;
			}
//		});	
   		return _reuslt;
   	},
   	destroyDisk : function() {			
		var confirmModal = new com.skyform.component.Modal(new Date().getTime(),"销毁对象存储","<h4>您确认要销毁对象存储吗?</h4>",{
			buttons : [
				{
					name : "确定",
					onClick : function(){
						// 删除对象存储
						var params = {
								"id" : obs.obsInstance.id
//								"userName" : 1115
						};
						Dcp.biz.apiRequest("/instance/obs/deleteObsVolumes", params, function(data) {
							if (data.code == 0) {
								$.growlUI("提示", "销毁对象存储申请提交成功！"); 
//								$("#OStorediv").hide();
								obs.refreshObs();
								confirmModal.hide();
							} else {
								$.growlUI("提示", "销毁对象存储申请提交失败：" + data.msg); 
							}
						});												
					},
					attrs : [
						{
							name : 'class',
							value : 'btn btn-primary'
						}
					]
				},
				{
					name : "取消",
					attrs : [
						{
							name : 'class',
							value : 'btn'
						}
					],
					onClick : function(){
						$("#IOperate").show();
//						$("#OStorediv").show();
						confirmModal.hide();
					}
				}
			]
		});
		confirmModal.setWidth(300).autoAlign();
		confirmModal.show();
	},
	showInstanceInfo : function(obsId){
		if(!obsId || obsId<=0) return;
		com.skyform.service.LogService.getVdiskLogByNetId(obsId,function(logs){
			$("#opt_logs").empty();
			$(logs).each(function(i,v){
				$("<li class='detail-item'><span>" + new Date(v.createTime).format("yyyy-MM-dd hh:mm:ss") + ":" + v.operateContent + "</span></li>").appendTo($("#opt_logs"));
			});
		});			
	}
	
	};	   	