//当前刷新实例的类型为虚拟机
//window.currentInstanceType='backupCloud1';

window.Controller = {
		init : function(){
			BackupCloud.init();		
			$(".provider-filter").tooltip();
		},
		refresh : function(){
//			BackupCloud.describleVM();
//			BackupCloud._refreshDtTable([]);
		}
	};



var BackupCloud = {
	setupType:{"1":"文件备份","2":"网络文件备份","3":"数据库文件备份"},
	exeType:{"1":"定时执行","2":"立即执行"},
	exebackupVal:{"0":"是","1":"否"},
	backupPriod:{"1":"每天","7":"每周"},
	backupsdays:{"1":"星期一","2":"星期二","3":"星期三","4":"星期四","5":"星期五","6":"星期六","0":"星期日"},
	boolFlagDB:false,
	exeBackupYorNVal:null,
	vmName:null,
	backupCloudData:{},
	backupCreateDay:[16,180],
	backupParams:{
		"period": 1,
		"count": 1,
		"productList":[]
	},
	inited : false,
	inited2 : false,
	inited3 : false,
	wizard : null,
	modifyVMNameModal : null,
	delBCupDirModal:null,
	instanceName : null,
	selectedInstanceId : null,
	selectedProductId : null,
	selectedInstanceOsId:null,
	selectedInstanceDisk:null,
	selectedInstanceOs:null,
	newFormModal:null,
	inMenu : null,
	datatable : new com.skyform.component.DataTable(),
	datatable2 : new com.skyform.component.DataTable(),
	datatable4 : new com.skyform.component.DataTable(),
	dtTable5:null,
	service : com.skyform.service.vmService,
	backupCloudService:com.skyform.service.backupCloudService,
	lastCheckedArr:null,
	init : function() {
		BackupCloud.inMenu = false; // 用于判断鼠标当前是否在下拉操作框中即$("#contextMenu")和$("#dropdown-menu")
		BackupCloud.selectedInstanceId = null;
		BackupCloud.selectedProductId = null;
		BackupCloud.instanceName = null;
		BackupCloud.instances = [],
		BackupCloud.instancesSelect = [],
		$("#content_container #checkAll").attr("checked", false);
		$("#tbody2 input[type='checkbox']").attr("checked", false);
		$("#moreAction").addClass("disabled");
		BackupCloud.describleVM();
//		BackupCloud.backupCloudService.listBackupCloudByParams({},function(){},function(error){});
//		BackupCloud._refreshDtTable([]);
		
	},
	getInstanceInfoById : function(instanceId) {
		var result = null;
		$(BackupCloud.instances).each(function(i,instance){
			if(instance.id+"" == instanceId+"") {
				result = instance;
				return false;
			}
		});
		return result;
	},
	showorHideByBackupType:function(){
		var firstOptionVal=$("#areaNameId").find("option:selected").val();
		BackupCloud.showOrHide(firstOptionVal);
		$("#areaNameId").change(function(){
   		 var showorhideVal= $(this).val();
			if(showorhideVal==1){
				BackupCloud.backupCreateDay=[16,180];
				$("#backupSvaePeriod").val("30");
				$("#backupSvaePeriodTips").html("（范围为16~180天，至少大于完全备份周期，建议是完全周期的2倍）");
				$("#_showos2").show();
				$("span[name='backupContent']").show();
			}else if(showorhideVal==3){
				BackupCloud.backupCreateDay=[7,90];
				$("#backupSvaePeriod").val("7");
				$("#backupSvaePeriodTips").html("（设置范围为7~90天）");
				$("#_showos2").hide();
				$("span[name='backupContent']").hide();
			};
			$("select[name='backupperiod']").change();
			$("#backupSvaePeriod").change();
   		BackupCloud.showOrHide(showorhideVal);
   	  });
	},
	showOrHide:function(sorh){
		$("#_backupType").html(BackupCloud.setupType[sorh]);
		BackupCloud.backupCloudData.backupType=sorh;
		 if(sorh=="3"){
   			 $("#dbAttribute").show();
   			 $("#dbAttrInof").show();
			 $("#fullBackupCycle").parents('div.fullBackupCycle').hide();
			 $("#backUpPathContainer").hide();
			 $("#_showos10").hide();
			 $("span[name='fullBackupCycle']").hide();
   		 }else if(sorh=="1"){
   			 $("#dbAttribute").hide();
   			 $("#dbAttrInof").hide();
			 $("#fullBackupCycle").parents('div.fullBackupCycle').show();
			 $("#_showos10").show();
			 $("span[name='fullBackupCycle']").show();
			 $("#backUpPathContainer").show();
   		 }
	},
	createVM : function() {
		//$('#createDataDiskSize').val('1');
			if(!BackupCloud.newFormModal){
				BackupCloud.newFormModal = new com.skyform.component.Modal("newDesktopCloudForm3","<h3>"+"云备份任务创建"+"</h3>",
			      $("script#new_backup4cloud_form3").html(),{
			        buttons : [
			                   {name:Dict.val("common_determine"),
							       onClick:function(){
							    	   if($("#vmip2").val().trim().length==0){
							    		   $("#ipMsg").empty().html("请选择云要备份的云主机");
							    		   return;
							    	   }
							    	   if($("#contentbackup_").val().trim().length==0&&BackupCloud.backupCloudData.backupType=="1"){
							    		   $("#contentMsg").empty().html("请选择需要备份的文件路径");
							    		   return;
							    	   }
							    	   if(BackupCloud.backupCloudData.backupType=="3"){
							    		   if($("#dbName").val().trim().length==0){
								    		   $("#dbNameMsg").empty().html("请输入数据库的用户名");
								    		   return;
								    	   }
							    		   if($("#dbPassword").val().trim().length==0){
								    		   $("#dbPasswordMsg").empty().html("请输入数据库的密码");
								    		   return;
								    	   }
							    		   if($("#dbPort").val().trim().length==0){
								    		   $("#dbPortMsg").empty().html("请输入数据库的端口号");
								    		   return;
								    	   }
							    		   if($("#dbaseName").val().trim().length==0){
								    		   $("#dbaseNameMsg").empty().html("请输入数据库的名称");
								    		   return;
								    	   }
							    		   
							    	   }
							    	 
							    	  BackupCloud.saveBackupCloud(BackupCloud.backupCloudData);
							    	 
							       },
			                   attrs:[{name:'class',value:'btn btn-primary'}]},
			                   {name:Dict.val("common_cancel"),
			                   onClick:function(){
			                	   BackupCloud.newFormModal.hide();
			                   },
			                   attrs:[{name:'class',value:'btn'}]}
			                   ],
			       beforeShow : function(container){
			        },
			      afterShow : function(){
					  $('#browsePath').hide();
			    	  $("#vmip2").val("");
			    	  $("#contentbackup_").val("");
					  $("#backUpPathContainer .contentbackup").val("");
			    	  $("#vmName4").empty();
			    	  $("#innerIp").empty();
			    	  $("span[name='backupContent']").html("");
			    	  BackupCloud.showorHideByBackupType();
			    	  BackupCloud.showrenderDtTable();
			    	   var exeBackupYorNVal=$('input:radio[name="exeBackupYorN"]:checked').val();
			    	   BackupCloud.exeBackupYorNVal=exeBackupYorNVal;
			    	   $("#_exeBackupYorN").html(BackupCloud.exebackupVal[exeBackupYorNVal]);
			    	   $('input:radio[name="exeBackupYorN"]').unbind().bind("click",function(){
			    		   exeBackupYorNVal=$('input:radio[name="exeBackupYorN"]:checked').val();
			    		   $("#_exeBackupYorN").html(BackupCloud.exebackupVal[exeBackupYorNVal]);
			    		   BackupCloud.exeBackupYorNVal=$('input:radio[name="exeBackupYorN"]:checked').val();
			    	   });
					  $("#vmip2").change(function(){
						  $("#contentbackup_").val("");
						  $("#backUpPathContainer .contentbackup").val("");
					  });
			  		$("#dbName").unbind().bind("blur",function(){
						if($("#dbName").val().length==0){
							dbNameFlag=false;
							if(!contentFlag&&dbNameFlag&&dbPasswordFlag&&dbPortFlag){
//								$("button[class='btn wizard-next btn-primary']").attr("disabled","true");
							}
							
//							$("button[class='btn wizard-next btn-primary']").attr("disabled","true");
							$("#dbNameMsg").html("请输入数据库的用户名");
						}else if($("#dbName").val().length>30){
							$("#dbName").val("");
							$("#dbNameMsg").html("数据库用户名不能超过30个字符");
						}else{
							dbNameFlag=true;
							if(contentFlag&&dbNameFlag&&dbPasswordFlag&&dbPortFlag){
//								$("button[class='btn wizard-next btn-primary']").removeAttr("disabled","true");
							}
							BackupCloud.backupCloudData.dbUser=$("#dbName").val();
							$("span[name='DBUser']").html(BackupCloud.backupCloudData.dbUser);
							$("#dbNameMsg").empty();
						}
						
					});
					$("#dbPassword").unbind().bind("blur",function(){
						if($("#dbPassword").val().length==0){
							dbPasswordFlag=false;
							if(!contentFlag&&dbNameFlag&&dbPasswordFlag&&dbPortFlag){
//								$("button[class='btn wizard-next btn-primary']").attr("disabled","true");
							}
							
							$("#dbPasswordMsg").html("请输入数据库的密码");
						}else if(6>$("#dbPassword").val().length||$("#dbPassword").val().length>64){
							$("#dbPassword").val("");
							$("#dbPasswordMsg").html("密码6~64位");
						}else{
							dbPasswordFlag=true;
							if(contentFlag&&dbNameFlag&&dbPasswordFlag&&dbPortFlag){
//								$("button[class='btn wizard-next btn-primary']").removeAttr("disabled","true");
							}
							BackupCloud.backupCloudData.dbPassword=$("#dbPassword").val();
							$("#dbPasswordMsg").empty();
						}
						
					});
					$("#dbPort").unbind().bind("blur",function(){
						if($("#dbPort").val().length==0){
							dbPortFlag=false;
							if(!contentFlag&&dbNameFlag&&dbPasswordFlag&&dbPortFlag){
//								$("button[class='btn wizard-next btn-primary']").attr("disabled","true");
							}
							$("#dbPortMsg").html("请输入数据库的端口号");
						}else if(0>$("#dbPort").val()||$("#dbPort").val()>65535){
							$("#dbPort").val("1433");
							$("#dbPortMsg").html("端口号范围为0~65535");
						}else{
							dbPortFlag=true;
							if(contentFlag&&dbNameFlag&&dbPasswordFlag&&dbPortFlag){
//								$("button[class='btn wizard-next btn-primary']").removeAttr("disabled","true");
							}
							BackupCloud.backupCloudData.dbPort=$("#dbPort").val();
							$("span[name='DBPort']").html(BackupCloud.backupCloudData.dbPort);
							$("#dbPortMsg").empty();
						}
						
					});
					  $("#dbPort").blur();
				$("#dbaseName").unbind().bind("blur",function(){
						
						if($("#dbaseName").val().length==0){
							dbaseNameFlag=false;
							$("div[class='wizard-nav-container'] >ul >li:eq(1)").removeClass("already-visited");
							$("#dbaseNameMsg").html("请输入数据库的名称");
						}else if($("#dbaseName").val().length>128){
							$("#dbaseName").val("");
							$("#dbaseNameMsg").html("数据库的名称不能超过128位");
						}else{
							dbaseNameFlag=true;
							BackupCloud.backupCloudData.dbSchema=$("#dbaseName").val();
							$("span[name='dbaseName']").html(BackupCloud.backupCloudData.dbSchema);
							$("#dbaseNameMsg").empty();
						}
					});
			  		$("#contentbackup_").unbind().bind("change",function(){
						if($("#contentbackup_").val().length==0){
							contentFlag=false;
							//$("#contentMsg").html("请选择需要备份的文件路径");
							$("span[name='backupContent']").html("");
						}else{
							contentFlag=true;
							BackupCloud.backupCloudData.filePath="\""+$("#contentbackup_").val()+"\"";
							for(var i=0;i<$("#backUpPathContainer .contentbackup").length;i++){
								if(i==0){
									if($("#contentbackup_").val()!=$("#backUpPathContainer .contentbackup").eq(i).val()){
										BackupCloud.backupCloudData.filePath+="|"+"\""+$("#backUpPathContainer .contentbackup").eq(i).val()+"\"";
									}else{
										$("#backUpPathContainer .contentbackup").eq(i).val("")
									}
								};
								for(var j=0;j<i;j++){
									if($("#backUpPathContainer .contentbackup").eq(i).val()!=$("#backUpPathContainer .contentbackup").eq(j).val()){
										if($("#backUpPathContainer .contentbackup").eq(i).val()!=""){
											BackupCloud.backupCloudData.filePath+="|"+"\""+$("#backUpPathContainer .contentbackup").eq(i).val()+"\"";
										}
									}else{
										$("#backUpPathContainer .contentbackup").eq(i).val("");
									}
								};
							}
							var showPath=BackupCloud.backupCloudData.filePath;
							showPath=showPath.split("\"|\"");
							showPath=showPath.join(";");
							$("span[name='backupContent']").html(showPath);
							$("#contentMsg").empty();
							//BackupCloud.backupCloudData.filePath=BackupCloud.backupCloudData.filePath.split(";");
						}
						
					});
					  $("#backUpPathContainer .contentbackup").unbind().bind("change",function(){
						  //if($(this).val().length!=0){
							//  contentFlag=true;
							//  BackupCloud.backupCloudData.filePath=$("#contentbackup").val()+$(this).val();
							//  $("span[name='backupContent']").html(BackupCloud.backupCloudData.filePath);
							//  $("#contentMsg").empty();
						  //}
						  $("#contentbackup_").change();
					  });
			    	  var contentFlag=false;
			  		var dbNameFlag=false;
			  		var dbPasswordFlag=false;
			  		var dbPortFlag=false;
			  		var dbaseNameFlag=false;
			  		var taskNameFlag=false;
			  		BackupCloud.backupCloudData.backupType=$("#areaNameId option:selected").val();
			  		$("span[name='backupType']").html(BackupCloud.setupType[$("#areaNameId").val()]);
			  		$("select[name='dataBackupType']").change(function(){
			  			BackupCloud.clearWizardTable();
			  			BackupCloud.clearWizardInputInfo();
			  			if("3"==$(this).val()){
			  				
			  				$("#databaseControal").show();
			  				$("span[name='dbsqlserver']").html("sqlserver");
			  			}else{
			  				$("#databaseControal").hide();
			  			}
			  			$("span[name='backupType']").html(BackupCloud.setupType[$(this).val()]);
			  			BackupCloud.backupCloudData.backupType=$(this).val();
			  			
			  		});
			  		$("span[name='backupPeriod']").empty();
			  		var everyDay="";
			  		var week="";
			  		BackupCloud.backupCloudData.period=$("select[name='backupperiod']").val();
			  		$("span[name='backupPeriod']").html(BackupCloud.backupPriod[$("select[name='backupperiod']").val()]);
			  		$("select[name='backupperiod']").change(function(){
			  			if("7"==$(this).val()){
			  				$("#backupsdays").show();
			  				$("span[name='backupPeriod']").empty();
							var backupsdaysInfo="";
							for(var i=0;i<$("#backupsdays").find("input:checked").length;i++){
								if(i==0){
									backupsdaysInfo+=BackupCloud.backupsdays[$("#backupsdays").find("input:checked").eq(i).val()];
								}else{
									backupsdaysInfo+=","+BackupCloud.backupsdays[$("#backupsdays").find("input:checked").eq(i).val()];
								}
							}
			  				$("span[name='backupPeriod']").html(BackupCloud.backupPriod["7"]+"/"+backupsdaysInfo);
			  				BackupCloud.boolFlagDB=true;
//			  				if(contentFlag&&dbNameFlag&&dbPasswordFlag&&dbPortFlag){
//			  					
//			  					$("button[class='btn wizard-next btn-primary']").removeAttr("disabled","true");
//			  				}else{
//			  					$("button[class='btn wizard-next btn-primary']").attr("disabled","true");
//			  				}
			  				
			  				
			  			}else{
			  				week=$(this).val();
			  				if(typeof(week)=="undefined"){
			  					week=$("select[name='backupperiod']").val();
			  				}
			  				$("span[name='backupPeriod']").empty();
			  				$("span[name='backupPeriod']").html(BackupCloud.backupPriod[week]);
			  				$("#backupsdays").hide();
			  				BackupCloud.boolFlagDB=false;
			  			}
			  			
//			  			$("span[name='backupPeriod']").html(BackupCloud.backupPriod[$(this).val()]);
			  			BackupCloud.backupCloudData.period=$(this).val();
			  		});
					  var backupsdaysInfo_="";
					  for(var i=0;i<$("#backupsdays").find("input:checked").length;i++){
						  if(i==0){
							  backupsdaysInfo_+=$("#backupsdays").find("input:checked").eq(i).val();
						  }else{
							  backupsdaysInfo_+=","+$("#backupsdays").find("input:checked").eq(i).val();
						  }

					  };
			  		BackupCloud.backupCloudData.backupsdays=backupsdaysInfo_;
			  		
			  		$("#backupsdays input").click(function(){
			  			//everyDay=$(this).val();
						var _backupsdaysInfo_="";
						var backupsdaysInfoCh="";
						for(var i=0;i<$("#backupsdays").find("input:checked").length;i++){
							if(i==0){
								_backupsdaysInfo_+=$("#backupsdays").find("input:checked").eq(i).val();
								backupsdaysInfoCh+=BackupCloud.backupsdays[$("#backupsdays").find("input:checked").eq(i).val()];
							}else{
								_backupsdaysInfo_+=","+$("#backupsdays").find("input:checked").eq(i).val();
								backupsdaysInfoCh+=","+BackupCloud.backupsdays[$("#backupsdays").find("input:checked").eq(i).val()];
							}
						}
			  			$("span[name='backupPeriod']").empty();
			  			$("span[name='backupPeriod']").html(BackupCloud.backupPriod["7"]+"/"+backupsdaysInfoCh);
			  			BackupCloud.backupCloudData.backupsdays=_backupsdaysInfo_;
			  		});
//			  		$("span[name='backupPeriod']").html(BackupCloud.backupPriod[week]+"/"+BackupCloud.backupsdays[$("select[name='backupsdays']").val()]);
			  		
			  		var timeHour="4";
			  		var timeMinute="25";
			  		BackupCloud.backupCloudData.backupsHour=$("select[name='backupsHour']").val();
			  		$("span[name='backTime']").html(BackupCloud.backupCloudData.backupsHour+":"+timeMinute);
			  		$("select[name='backupsHour']").change(function(){
			  			BackupCloud.backupCloudData.backupsHour=$(this).val();
			  			timeHour=$(this).val();
			  			$("span[name='backTime']").empty();
			  			$("span[name='backTime']").html(timeHour+":"+timeMinute);
			  		});
			  		BackupCloud.backupCloudData.backupsMinute=$("select[name='backupsMinute']").val();
			  		$("select[name='backupsMinute']").change(function(){
			  			timeMinute=$(this).val();
			  			BackupCloud.backupCloudData.backupsMinute=$(this).val();
			  			$("span[name='backTime']").empty();
			  			//if(parseInt(timeMinute)<10){
			  			//	$("span[name='backTime']").html(timeHour+":00");
			  			//}else{
			  			//	$("span[name='backTime']").html(timeHour+":"+timeMinute);
			  			//}
						$("span[name='backTime']").html(timeHour+":"+timeMinute);
			  		});
					  $("#fullBackupCycle").change(function(){
						  var fullBackupCycle=$(this).val();
						  if(15<=fullBackupCycle&&fullBackupCycle<=90){
							  $("span[name='fullBackupCycle']").html(fullBackupCycle+"天");
						  }else if(fullBackupCycle<15){
							  $(this).val('15');
							  $("span[name='fullBackupCycle']").html("15"+"天");
						  }else if(fullBackupCycle>90){
							  $(this).val('90');
							  $("span[name='fullBackupCycle']").html("90"+"天");
						  }else{
							  $(this).val('15');
							  $("span[name='fullBackupCycle']").html("15"+"天");
						  }

					  });
					  $("#backupSvaePeriod").change(function(){
						  var backupSvaePeriod=$(this).val();
						  if(BackupCloud.backupCreateDay[0]<=backupSvaePeriod&&backupSvaePeriod<=BackupCloud.backupCreateDay[1]){
							  $("span[name='backupSvaePeriod']").html(backupSvaePeriod+"天");
						  }else if(backupSvaePeriod<BackupCloud.backupCreateDay[0]){
							  $(this).val(BackupCloud.backupCreateDay[0]||"");
							  $("span[name='backupSvaePeriod']").html(BackupCloud.backupCreateDay[0]+"天");
						  }else if(backupSvaePeriod>BackupCloud.backupCreateDay[1]){
							  $(this).val(BackupCloud.backupCreateDay[1]||"");
							  $("span[name='backupSvaePeriod']").html(BackupCloud.backupCreateDay[1]+"天");
						  }else{
							  $(this).val(BackupCloud.backupCreateDay[0]||"");
							  $("span[name='backupSvaePeriod']").html(BackupCloud.backupCreateDay[0]+"天");
						  }

					  });
					  $("select[name='backupperiod']").change();
			    	  
			      }
			      });
			    }
				BackupCloud.newFormModal.setWidth(1100).autoAlign().setTop(30).show();
		
		
		
		
		
		
		
//		if (BackupCloud.wizard == null) {
//			BackupCloud.wizard = new com.skyform.component.Wizard("#wizard-createVM");
//			
//			BackupCloud.wizard.onLeaveStep = function(from, to) {
//	//				if(1==to){
//	//					
//	//					if($("#vmip").val().length==0){
//	//						$("#ipMsg").html("请选择要备份的云主机");
//	////						$("button[class='btn wizard-next btn-primary']").attr("disabled","true");
//	//						return;
//	//					}else{
//	//						$("#ipMsg").empty();
//	//					}
//	//					
//	//				}
//				
//				
//				
//				
//				
//			};
//			BackupCloud.wizard.onToStep = function(from, to) {
//				if(1==to){
//					if($("#vmip").val().length==0){
//						$("#ipMsg").html("请选择要备份的云主机");
//						$("button[class='btn wizard-back']").trigger("click");
//						$("div[class='wizard-nav-container'] >ul >li:eq(1)").removeClass("already-visited");
//						
//					}else{
//						$("#ipMsg").empty();
//					}
//					
//					if($("#contentbackup").val().length==0){
//						$("#contentMsg").html("请输入需要备份的文件路径");
//						$("button[class='btn wizard-back']").trigger("click");
//						$("div[class='wizard-nav-container'] >ul >li:eq(1)").removeClass("already-visited");
//					
//					}else{
//						$("#contentMsg").empty();
//					}
//					if($("#taskName").val().length==0){
//						$("#taskNameMsg").html("请输入云备份名称");
//						$("button[class='btn wizard-back']").trigger("click");
//						$("div[class='wizard-nav-container'] >ul >li:eq(1)").removeClass("already-visited");
//						
//					}else{
//						$("#taskName").empty();
//					}
//					if($("select[name='dataBackupType']").val()==3){
//						if($("#dbName").val().length==0){
//							$("#dbNameMsg").html("请输入数据库的用户名");
//							$("button[class='btn wizard-back']").trigger("click");
//							$("div[class='wizard-nav-container'] >ul >li:eq(1)").removeClass("already-visited");
//							
//						}else{
//							$("#dbNameMsg").empty();
//						}
//						if($("#dbPassword").val().length==0){
//							$("#dbPasswordMsg").html("请输入数据库的密码");
//							$("button[class='btn wizard-back']").trigger("click");
//							$("div[class='wizard-nav-container'] >ul >li:eq(1)").removeClass("already-visited");
//							
//						}else{
//							$("#dbPasswordMsg").empty();
//						}
//						if($("#dbPort").val().length==0){
//							$("#dbPortMsg").html("请输入数据库的端口号");
//							$("button[class='btn wizard-back']").trigger("click");
//							$("div[class='wizard-nav-container'] >ul >li:eq(1)").removeClass("already-visited");
//							
//						}else{
//							$("#dbPortMsg").empty();
//						}
//						if($("#dbaseName").val().length==0){
//							$("#dbaseNameMsg").html("请输入数据库的名称");
//							$("button[class='btn wizard-back']").trigger("click");
//							$("div[class='wizard-nav-container'] >ul >li:eq(1)").removeClass("already-visited");
//							
//						}else{
//							$("#dbaseNameMsg").empty();
//						}
//					}
//			
//				}
//			};
//			BackupCloud.wizard.onFinish = function(from, to) {				
////				BackupCloud.createVMPost(BackupCloud.wizard);
//				//清理表单数据:
//				BackupCloud.clearWizardInputInfo();
//				
//				BackupCloud.saveBackupCloud(BackupCloud.backupCloudData,BackupCloud.wizard);
//			};
//		}
//		
//		
//		
//		var contentFlag=false;
//		var dbNameFlag=false;
//		var dbPasswordFlag=false;
//		var dbPortFlag=false;
//		var dbaseNameFlag=false;
//		var taskNameFlag=false;
//		BackupCloud.backupCloudData.backupType=$("select[name='dataBackupType']").val();
//		$("span[name='backupType']").html(BackupCloud.setupType[$("select[name='dataBackupType']").val()]);
//		$("select[name='dataBackupType']").change(function(){
//			BackupCloud.clearWizardTable();
//			BackupCloud.clearWizardInputInfo();
//			if("3"==$(this).val()){
//				
//				$("#databaseControal").show();
//				$("span[name='dbsqlserver']").html("sqlserver");
//			}else{
//				$("#databaseControal").hide();
//			}
//			$("span[name='backupType']").html(BackupCloud.setupType[$(this).val()]);
//			BackupCloud.backupCloudData.backupType=$(this).val();
//			
//		});
//		$("span[name='backupPeriod']").empty();
//		var everyDay="";
//		var week="";
//		BackupCloud.backupCloudData.period=$("select[name='backupperiod']").val();
//		$("span[name='backupPeriod']").html(BackupCloud.backupPriod[$("select[name='backupperiod']").val()]);
//		$("select[name='backupperiod']").change(function(){
//			if("7"==$(this).val()){
//				$("select[name='backupsdays']").show();
//				$("span[name='backupPeriod']").empty();
//				$("span[name='backupPeriod']").html(BackupCloud.backupPriod["7"]+"/"+BackupCloud.backupsdays[$("select[name='backupsdays']").val()]);
//				BackupCloud.boolFlagDB=true;
////				if(contentFlag&&dbNameFlag&&dbPasswordFlag&&dbPortFlag){
////					
////					$("button[class='btn wizard-next btn-primary']").removeAttr("disabled","true");
////				}else{
////					$("button[class='btn wizard-next btn-primary']").attr("disabled","true");
////				}
//				
//				
//			}else{
//				week=$(this).val();
//				if(typeof(week)=="undefined"){
//					week=$("select[name='backupperiod']").val();
//				}
//				$("span[name='backupPeriod']").empty();
//				$("span[name='backupPeriod']").html(BackupCloud.backupPriod[week]);
//				$("select[name='backupsdays']").hide();
//				BackupCloud.boolFlagDB=false;
//			}
//			
////			$("span[name='backupPeriod']").html(BackupCloud.backupPriod[$(this).val()]);
//			BackupCloud.backupCloudData.period=$(this).val();
//		});
//		BackupCloud.backupCloudData.backupsdays=$("select[name='backupsdays']").val();
//		
//		$("select[name='backupsdays']").change(function(){
//			everyDay=$(this).val();
//			$("span[name='backupPeriod']").empty();
//			$("span[name='backupPeriod']").html(BackupCloud.backupPriod[week]+"/"+BackupCloud.backupsdays[everyDay]);
//			BackupCloud.backupCloudData.backupsdays=$(this).val();
//		});
////		$("span[name='backupPeriod']").html(BackupCloud.backupPriod[week]+"/"+BackupCloud.backupsdays[$("select[name='backupsdays']").val()]);
//		
//		var timeHour="";
//		var timeMinute="00";
//		BackupCloud.backupCloudData.backupsHour=$("select[name='backupsHour']").val();
//		$("span[name='backTime']").html(BackupCloud.backupCloudData.backupsHour+":"+timeMinute);
//		$("select[name='backupsHour']").change(function(){
//			BackupCloud.backupCloudData.backupsHour=$(this).val();
//			timeHour=$(this).val();
//			$("span[name='backTime']").empty();
//			$("span[name='backTime']").html(timeHour+":"+timeMinute);
//		});
//		BackupCloud.backupCloudData.backupsMinute=$("select[name='backupsMinute']").val();
//		$("select[name='backupsMinute']").change(function(){
//			timeMinute=$(this).val();
//			BackupCloud.backupCloudData.backupsMinute=$(this).val();
//			$("span[name='backTime']").empty();
//			$("span[name='backTime']").html(timeHour+":"+timeMinute);
//		});
//		
//		
//		
//		$("#contentMsg").empty();
//		if($("#contentbackup").val().length==0){
//			contentFlag=false;
////			$("#contentMsg").html("请输入需要备份的文件路径");
////			$("button[class='btn wizard-next btn-primary']").attr("disabled","true");
//		}else{
//			contentFlag=true;
////			$("button[class='btn wizard-next btn-primary']").removeAttr("disabled");
//			$("#contentMsg").empty();
//		}
//		
//		$("#taskNameMsg").empty();
//		if($("#taskName").val().length==0){
//			taskNameFlag=false;
////			$("#contentMsg").html("请输入需要备份的文件路径");
////			$("button[class='btn wizard-next btn-primary']").attr("disabled","true");
//		}else{
//			taskNameFlag=true;
////			$("button[class='btn wizard-next btn-primary']").removeAttr("disabled");
//			$("#taskNameMsg").empty();
//		}
//	
//		if(BackupCloud.boolFlagDB){
//			if($("#dbName").val().length==0){
//				$("#dbNameMsg").html("请输入数据库的用户名");
//				dbNameFlag=false;
////				$("button[class='btn wizard-next btn-primary']").attr("disabled","true");
//			}else{
//				dbNameFlag=true;
////				$("button[class='btn wizard-next btn-primary']").removeAttr("disabled");
//				$("#dbNameMsg").empty();
//			}
//			if($("#dbPassword").val().length==0){
//				$("#dbPasswordMsg").html("请输入数据库的密码");
////				$("button[class='btn wizard-next btn-primary']").attr("disabled","true");
//				dbPasswordFlag=false;
//			}else{
////				$("button[class='btn wizard-next btn-primary']").removeAttr("disabled");
//				dbPasswordFlag=true;
//				$("#dbNameMsg").empty();
//			}
//			if($("#dbPort").val().length==0){
//				$("#dbPortMsg").html("请输入数据库的端口号");
//				dbPortFlag=false;
////				$("button[class='btn wizard-next btn-primary']").attr("disabled","true");
//			}else{
//				dbPortFlag=true;
////				$("button[class='btn wizard-next btn-primary']").removeAttr("disabled");
//				$("#dbPortMsg").empty();
//			}
//			if($("#dbaseName").val().length==0){
//				$("#dbaseNameMsg").html("请输入数据库的名称");
//				$("div[class='wizard-nav-container'] >ul >li:eq(1)").removeClass("already-visited");
//				dbaseNameFlag=false;
////				$("button[class='btn wizard-next btn-primary']").attr("disabled","true");
//			}else{
//				dbaseNameFlag=true;
////				$("button[class='btn wizard-next btn-primary']").removeAttr("disabled");
//				$("#dbaseNameMsg").empty();
//			}
//		}else{
//			dbNameFlag=true;
//			dbPasswordFlag=true;
//			dbPortFlag=true;
//			dbaseNameFlag=true;
//		}
//		
//		
//	
//		
//		$("#contentbackup").unbind().bind("blur keyup",function(){
//			if($("#contentbackup").val().length==0){
//				contentFlag=false;
//				
//				$("#contentMsg").html("请输入需要备份的文件路径");
//			}else{
//				contentFlag=true;
//				
//				BackupCloud.backupCloudData.filePath=$("#contentbackup").val();
//				$("span[name='backupContent']").html(BackupCloud.backupCloudData.filePath);
//				$("#contentMsg").empty();
//			}
//			
//		});
//		$("#taskName").unbind().bind("blur keyup",function(){
//			if($("#taskName").val().length==0){
//				taskNameFlag=false;
//				
//				$("#taskNameMsg").html("请输入云备份名称");
//			}else{
//				taskNameFlag=true;
//				
//				BackupCloud.backupCloudData.instanceName=$("#taskName").val();
//				$("span[name='taskName']").html(BackupCloud.backupCloudData.instanceName);
//				$("#taskNameMsg").empty();
//			}
//			
//		});
//		
//		
//		$("#dbName").unbind().bind("blur keyup",function(){
//			if($("#dbName").val().length==0){
//				dbNameFlag=false;
//				if(!contentFlag&&dbNameFlag&&dbPasswordFlag&&dbPortFlag){
////					$("button[class='btn wizard-next btn-primary']").attr("disabled","true");
//				}
//				
////				$("button[class='btn wizard-next btn-primary']").attr("disabled","true");
//				$("#dbNameMsg").html("请输入数据库的用户名");
//			}else{
//				dbNameFlag=true;
//				if(contentFlag&&dbNameFlag&&dbPasswordFlag&&dbPortFlag){
////					$("button[class='btn wizard-next btn-primary']").removeAttr("disabled","true");
//				}
//				BackupCloud.backupCloudData.dbUser=$("#dbName").val();
//				$("span[name='DBUser']").html(BackupCloud.backupCloudData.dbUser);
//				$("#dbNameMsg").empty();
//			}
//			
//		});
//		$("#dbPassword").unbind().bind("blur keyup",function(){
//			if($("#dbPassword").val().length==0){
//				dbPasswordFlag=false;
//				if(!contentFlag&&dbNameFlag&&dbPasswordFlag&&dbPortFlag){
////					$("button[class='btn wizard-next btn-primary']").attr("disabled","true");
//				}
//				
//				$("#dbPasswordMsg").html("请输入数据库的密码");
//			}else{
//				dbPasswordFlag=true;
//				if(contentFlag&&dbNameFlag&&dbPasswordFlag&&dbPortFlag){
////					$("button[class='btn wizard-next btn-primary']").removeAttr("disabled","true");
//				}
//				BackupCloud.backupCloudData.dbPassword=$("#dbPassword").val();
//				$("#dbPasswordMsg").empty();
//			}
//			
//		});
//		$("#dbPort").unbind().bind("blur keyup",function(){
//			
//			if($("#dbPort").val().length==0){
//				dbPortFlag=false;
//				if(!contentFlag&&dbNameFlag&&dbPasswordFlag&&dbPortFlag){
////					$("button[class='btn wizard-next btn-primary']").attr("disabled","true");
//				}
//				$("#dbPortMsg").html("请输入数据库的端口号");
//			}else{
//				dbPortFlag=true;
//				if(contentFlag&&dbNameFlag&&dbPasswordFlag&&dbPortFlag){
////					$("button[class='btn wizard-next btn-primary']").removeAttr("disabled","true");
//				}
//				BackupCloud.backupCloudData.dbPort=$("#dbPort").val();
//				$("span[name='DBPort']").html(BackupCloud.backupCloudData.dbPort);
//				$("#dbPortMsg").empty();
//			}
//			
//		});
//	$("#dbaseName").unbind().bind("blur keyup",function(){
//			
//			if($("#dbaseName").val().length==0){
//				dbaseNameFlag=false;
//				$("div[class='wizard-nav-container'] >ul >li:eq(1)").removeClass("already-visited");
//				$("#dbaseNameMsg").html("请输入数据库的名称");
//			}else{
//				dbaseNameFlag=true;
//				BackupCloud.backupCloudData.dbSchema=$("#dbaseName").val();
//				$("span[name='dbaseName']").html(BackupCloud.backupCloudData.dbSchema);
//				$("#dbaseNameMsg").empty();
//			}
//			
//		});
//		$("button[class='btn wizard-next btn-primary']").attr("disabled","true");
//		
//		
//		
//		BackupCloud.wizard.markSubmitSuccess();
//		BackupCloud.wizard.reset();
//		BackupCloud.wizard.render(function onShow(){
//			
//			BackupCloud.showrenderDtTable();
//			
//		});
////		BackupCloud.wizard.render(function(){
////			
////			BackupCloud.showrenderDtTable();
////			
////		});
//		
	},
	clearWizardInputInfo:function(){
//		$("#taskName").val("");
//		$("#vmip").val("");
//		$("#contentbackup").val("");
		$("#dbName").val("");
		$("#dbPassword").val("");
		$("#dbPort").val("");
		$("#dbaseName").val("");
		
		
	},
	clearWizardTable:function(){
//		$("span[name='taskName']").html("");
//		$("span[name='vmName']").html("");
//		$("span[name='innerIp']").html("");
		$("span[name='backupType']").html("");
//		$("span[name='backupContent']").html("");
		$("span[name='DBUser']").html("");
		$("span[name='DBPort']").html("");
		$("span[name='dbaseName']").html("");
		$("span[name='dbsqlserver']").html("");
		
//		$("span[name='backupPeriod']").html("");
//		$("span[name='backTime']").html("");
		
	},
	showrenderDtTable:function(){
		if(BackupCloud.inited2){
			BackupCloud.datatable2.updateData(BackupCloud.instances);
			return;
		}
		
		BackupCloud.datatable2.renderByData(
				"#tbody3",// 要渲染的table所在的jQuery选择器
				{
					"data" : BackupCloud.instances, // 要渲染的数据选择器					
					"pageSize" : 5,
					"onColumnRender" : function(columnIndex,columnMetaData, columnData) {
						var text = '';
						if(columnMetaData.name=='id1') {
				              return '<input type="radio" name="check" id="' + columnData.id + '" value="'+columnData.id+'">';
				           } else if ("ID1" == columnMetaData.name) {
				              return columnData.id;
				           } else if ("instanceName1" == columnMetaData.name) {
				        	   if(null!=columnData.uuid&&""!=columnData.uuid){
									text = '<a  href="monitor.jsp?code=monitor&vmId='+columnData.uuid+'&vmName='+encodeURI(encodeURI(columnData.instanceName))+'" >'+columnData.instanceName+'</a>'
									+BackupCloud.getWorkOrderUrl(columnData);
								}
								else 
				        	   
				        	   text = (columnData.vmName.length>15?"<span title='"+columnData.vmName+"'>"+columnData.vmName.slice(0,15)+"..."+"</span>":columnData.vmName)+BackupCloud.getWorkOrderUrl(columnData);
				        	   return text;
				           } else if ("state1" == columnMetaData.name) {
				              return com.skyform.service.StateService.getState("vm",columnData.state||columnData);
				           } else if ("createDate1" == columnMetaData.name) {
								try {
									var obj = eval('(' + "{Date: new Date("
											+ columnData.createDate + ")}"
											+ ')');
									var dateValue = obj["Date"];
									text = dateValue
											.format('yyyy-MM-dd hh:mm:ss');
								} catch (e) {

								}
								return text;
							}
						return columnData[columnMetaData.name];
					},

//					{"message":"success","data":[{"vmPrice":1,"mem":"0.5","state":"opening","expireDate":1412493362000,"productId":101,"createDate":1409901362000,"cpu":"1","instanceName":"VM_67786912","disk":"50","osId":"1","id":67786912,"ip":" ","period":1,"os":"Cetnos6.4-x86_64"},{"vmPrice":1,"mem":"0.5","state":"opening","expireDate":1412476682000,"productId":101,"createDate":1409884682000,"cpu":"1","instanceName":"VM_67784939","disk":"50","osId":"1","id":67784939,"ip":" ","period":1,"os":"Cetnos6.4-x86_64"}],"code":0}
					"afterRowRender" : function(rowIndex, data, tr) {
						
						tr.attr("id",data.vmId);
						tr.attr("uuid",data.uuid);
						tr.attr("name",data.vmName);
						tr.attr("ip",data.ip);
						tr.attr("state",data.state);
						tr.attr("instanceId",data.vmId);
						tr.attr("networkId",data.networkId);
						tr.attr("createDate",data.createDate);
						tr.attr("osType",data.osType);

						tr.attr("disk",data.disk);
						
						BackupCloud.bindEventForTr(rowIndex, data, tr);
					},
					"afterTableRender" : function() {
						BackupCloud.bindEvent();
						
						var firstRow = $("#tbody3 tbody").find("tr:eq(0)");
						firstRow.mousedown();
						firstRow.click();
						var	instanceId = firstRow.attr("instanceId");
						var instance = BackupCloud.getInstanceInfoById(instanceId);
						BackupCloud.backupCloudData.vmId=instanceId;
						BackupCloud.backupCloudData.vmName=firstRow.attr("name");
						BackupCloud.backupCloudData.networkId=firstRow.attr("networkid");
						firstRow.css("background-color","#BCBCBC");
						
						BackupCloud.setSelectRowBackgroundColor(firstRow);
//						}
					}
					
				});
		
		BackupCloud.inited2 = true;

		
		
	
		
		
		/*if (BackupCloud._generateContent_tmp)
		{
			FireWallCfg.reset();
			FireWallCfg._generateContent = VM._generateContent_tmp;
		}*/
	
		
		
		
		
	
		
	
	
		
		
	},
	saveBackupCloud:function(params){
//		*　　*　　*　　*　　*　　command
//		分　时　日　月　周　命令 
//		第1列表示分钟1～59 （每分钟用*或者 */1表示，*/5 代表每5分钟）
//		第2列表示小时1～23（0表示0点）
//		第3列表示日期1～31*/1
//		第4列表示月份1～12*
//		第5列标识号星期0～6（0表示星期天）
//		第6列要运行的命令
//		params.backupsHour//时
//		params.backupsMinute//分
//		params.backupsdays//天  每天值为1，每周，值为星期几
//		params.period//每周
		var minute=params.backupsMinute+" ";
		var hour=params.backupsHour+" ";
		var day="";
		var month="* ";
//		var month=params.backupsHour+"/";
		var week="";
		if(params.period=="7"){
			week=params.backupsdays;
			day="* ";
		}else{
//			day=params.backupsdays+"/";
			day="* ";
			week="*";
		}
		
		//if(BackupCloud.backupCloudData.backupType=="3"){
		//	BackupCloud.backupCloudData.filePath="";
		//}
		params.schedule=minute+hour+day+month+week;
		BackupCloud.backupParams.period=parseInt(params.period);
		
		delete params.period; 
		delete params.backupsHour//时
		delete params.backupsMinute//分
		delete params.backupsdays//天  每天值为1，每周，值为星期几
		BackupCloud.backupParams.productList[0]=params;
		if($("#fullBackupCycle").val()==""&&BackupCloud.backupParams.productList[0].backupType==1){
			$("#fullBackupCycleMsg").html("请填写完全备份周期");
			return;
		};
		if($("#backupSvaePeriod").val()==""){
			$("#backupSvaePeriodMsg").html("请填写备份数据保留时长");
			return;
		};
		if(BackupCloud.backupParams.productList[0].backupType==1){
			BackupCloud.backupParams.productList[0].fullBackupCycle=$("#fullBackupCycle").val();
		};
		BackupCloud.backupParams.productList[0].backupFileTime=$("#backupSvaePeriod").val();

		 if(BackupCloud.exeBackupYorNVal=="0"){
   		com.skyform.service.backupCloudService.createAndExecuteCloudBackupTask(BackupCloud.backupParams,function(instance){
			$.growlUI("提示", "申请已提交，请等待！");
//			wizard.markSubmitSuccess();
//			BackupCloud.wizard.close();
//			BackupCloud.wizard.reset();
			BackupCloud.newFormModal.hide();
			BackupCreate.refreshData();
		},function(error){
			$.growlUI("提示", "申请云备份任务失败");
//			BackupCloud.wizard.close();
//			BackupCloud.wizard.reset();
			BackupCloud.newFormModal.hide();
			BackupCreate.refreshData();
//			wizard.markSubmitError();
		});
   	  }else if(BackupCloud.exeBackupYorNVal=="1"){
   		com.skyform.service.backupCloudService.saveBackupCloud(BackupCloud.backupParams,function(instance){
//			BackupCloud.describleVM();
			
			$.growlUI("提示", "申请已提交，请等待！");
//			wizard.markSubmitSuccess();
//			BackupCloud.wizard.close();
//			BackupCloud.wizard.reset();
			BackupCloud.newFormModal.hide();
			BackupCreate.refreshData();
			//订单提交成功后校验用户余额是否不足
//			com.skyform.service.BillService.wizardConfirmTradeSubmit(0,instance.tradeId,BackupCloud.wizard, function onSuccess(data){				
//				$.growlUI("提示", "申请已提交，请等待！");
//				wizard.markSubmitSuccess();
//				BackupCloud.describleVM();
//			},function onError(msg){
//				$.growlUI("提示", "申请云备份任务已提交，扣款失败");
//				wizard.markSubmitError();
//			});
			
			
//			FormWindow.setTitle("开启").setContent(
//					"" + $("#update_route_form").html()).onSave = function() {
//				
//				BackupCreate.service.update(BackupCreate.selectedInstanceId, {
//					"subscriptionId" : parseInt(BackupCreate.selectedInstanceId),
//					"instanceName" : $("#update_form_route_name").val(),
//					"comment" : $("#update_form_route_desc").val()
//				}, function(result) {
//					FormWindow.hide();
//					$.growlUI("修改路由器", "修改成功！");
//					BackupCreate.refreshData();
//				}, function(error) {
//					FormWindow.showError(error);
//				});
//			};
//			FormWindow.beforeShow = function(container) {
//				var oldInstanceName = $(
//						"#instanceTable tbody input[type='checkbox']:checked")
//						.parents("tr").attr("instanceName");
//				container.find("#update_form_route_name").val(
//						oldInstanceName || "");
//				// container.find("#update_form_route_name").val(route.name||"");
//			};
//			FormWindow.setWidth(500).autoAlign().setTop(100);
//			FormWindow.show();
		},function(error){
			$.growlUI("提示", "申请云备份任务失败");
//			BackupCloud.wizard.close();
//			BackupCloud.wizard.reset();
			BackupCloud.newFormModal.hide();
			BackupCreate.refreshData();
//			wizard.markSubmitError();
		});
   	  }
	},
	
	describleVM : function() {
		$("a#createVM").unbind().click(BackupCloud.createVM);
		com.skyform.service.backupCloudService.queryVmInfoForBackup(function(result){
			$("#load_waiting_tbl").hide()
			var instances=result;
			BackupCloud.instances = result;
			var selectResult=[];
			$(result).each(function(i,instance){
				if(instance.osType!="WIN"){
					selectResult.push(result[i]);
				}
			});
			BackupCloud.instancesSelect = selectResult;
			if(instances && instances.length>0) {
				$("#details").show();
				BackupCloud.showInstanceInfo(instances[0]);
			} else {
				$("#details").hide();
			}
			
			BackupCloud.renderDataTable(instances);
			BackupCloud.checkSelected();//初始化按钮置灰
			
			
		},function(errorMsg){
			$.growlUI(Dict.val("common_tip"), Dict.val("net_select_vm_error") + errorMsg);
		});
//		BackupCloud.service.listInstances(function(instances){
//			$("#load_waiting_tbl").hide()
//			BackupCloud.instances = instances;
//			if(instances && instances.length>0) {
//				$("#details").show();
//				BackupCloud.showInstanceInfo(instances[0]);
//			} else {
//				$("#details").hide();
//			}
//			
//			BackupCloud.renderDataTable(instances);
//			BackupCloud.checkSelected();//初始化按钮置灰
//			
//			$("a#createVM").unbind().click(BackupCloud.createVM);
//		}, function(errorMsg){
//			$.growlUI(Dict.val("common_tip"), Dict.val("net_select_vm_error") + errorMsg);
//		});
	},
	getWorkOrderUrl:function(columnData){
		var ipurl ='';
		var ctx = $("#ctx").val();
		if(columnData.publicIp){
			ipurl += "&publicIP="+columnData.publicIp;
		}
		if(columnData.ip){
			ipurl += "&innerIP="+columnData.ip;
		}
		var url = "<a title='咨询建议' href='"+ctx+"/jsp/user/workOrder.jsp?code=workOrder&cataCode=service&instanceId="+columnData.id+"&serviceType=vm&instanceName="+encodeURIComponent(columnData.instanceName)+"" +
		"&instanceStatus="+columnData.state
		+"&currentPoolW="+encodeURIComponent(CommonEnum.pools[CommonEnum.currentPool])+ipurl+
		"'><i class='icon-comments' ></i></a>"
		return url;
	},
	renderDataTable : function(data) {
//		if(BackupCloud.inited){
//			BackupCloud.datatable.updateData(data);
//			return;
//		}
//		if(BackupCloud.inited3){
//			BackupCloud.datatable4.updateData(data);
//			return;
//		}
		
		
		
		
		
//		BackupCloud.datatable.renderByData(
//						"#tbody2",// 要渲染的table所在的jQuery选择器
//						{
//							"data" : data, // 要渲染的数据选择器					
//							"pageSize" : 5,
//							"onColumnRender" : function(columnIndex,columnMetaData, columnData) {
//								var text = '';
//								if(columnMetaData.name=='id') {
//						              return '<input type="checkbox" name="check" id="' + columnData.id + '" value="'+columnData.id+'">';
//						           } else if ("ID" == columnMetaData.name) {
//						              return columnData.id;
//						           } else if ("instanceName" == columnMetaData.name) {
//						        	   if(null!=columnData.uuid&&""!=columnData.uuid){
//											text = '<a  href="monitor.jsp?code=monitor&vmId='+columnData.uuid+'&vmName='+encodeURI(encodeURI(columnData.instanceName))+'" >'+columnData.instanceName+'</a>'
//											+BackupCloud.getWorkOrderUrl(columnData);
//										}
//										else 
//						        	   
//						        	   text = (columnData.instanceName.length>15?"<span title='"+columnData.instanceName+"'>"+columnData.instanceName.slice(0,15)+"..."+"</span>":columnData.instanceName)+BackupCloud.getWorkOrderUrl(columnData);
//						        	   return text;
//						           } else if ("state" == columnMetaData.name) {
//						              return com.skyform.service.StateService.getState("vm",columnData.state||columnData);
//						           } else if ("createDate" == columnMetaData.name) {
//										try {
//											var obj = eval('(' + "{Date: new Date("
//													+ columnData.createDate + ")}"
//													+ ')');
//											var dateValue = obj["Date"];
//											text = dateValue
//													.format('yyyy-MM-dd hh:mm:ss');
//										} catch (e) {
//
//										}
//										return text;
//									}else if ("expireDate" == columnMetaData.name) {
//										try {
//											var obj = eval('(' + "{Date: new Date("
//													+ columnData.expireDate + ")}"
//													+ ')');
//											var dateValue = obj["Date"];
//											text = dateValue
//													.format('yyyy-MM-dd hh:mm:ss');
//										} catch (e) {
//
//										}
//										return text;
//									}else if ("descrInfo" == columnMetaData.name) {										
//						        	   try {
//						        		   var cpuNum = "";
//						        		   var mem = "";
//						        		   var os = "";
//						        		   if(columnData.cpu&&columnData.cpu.toString().length>0){
//						        			   cpuNum = columnData.cpu;
//						        		   }
//						        		   if(columnData.os&&columnData.os.length>0){
//							        			  os = columnData.os; 
//							        		   }
//						        		   if(columnData.mem&&columnData.mem.toString().length>0){
//						        			  mem = columnData.mem; 
//						        		   }
//											var appendText = "CPU:"
//													+ cpuNum + Dict.val("vm_he")+","+Dict.val("dc_ram")+":"
//													+ mem + "G,"
//													+ os;
//											text = text + appendText;
//										} catch (e) {
//
//										}
//									return text;
//						           }
//								return columnData[columnMetaData.name];
//							},
//							
//							"afterRowRender" : function(rowIndex, data, tr) {
//								
//								tr.attr("id",data.id);
//								tr.attr("uuid",data.uuid);
//								tr.attr("act",data.instanceName);
//								
//								tr.attr("state",data.state);
//								tr.attr("instanceId",data.id);
//								tr.attr("productID",data.productId);
//								tr.attr("cpu",data.cpu);
//								tr.attr("mem",data.mem);
//								tr.attr("os",data.os);
//								tr.attr("period",data.period);
//								tr.attr("vmPrice",data.vmPrice);
//								tr.attr("productId",data.productId);
//								tr.attr("osId",data.osId);
//								
//								tr.attr("disk",data.disk);
//								
//								BackupCloud.bindEventForTr(rowIndex, data, tr);
//							},
//							"afterTableRender" : function() {
//								BackupCloud.bindEvent();
////								$("#tbody2 tbody").find("tr").css("background-color","");
//								var firstRow = $("#tbody2 tbody").find("tr:eq(0)");
//								var	instanceId = firstRow.attr("instanceId");
//								var instance = BackupCloud.getInstanceInfoById(instanceId);
//								//VM.showInstanceInfo(instance);//加载数据之后不再查询关联信息和日志
//								firstRow.css("background-color","#BCBCBC");
//								BackupCloud.setSelectRowBackgroundColor(firstRow);
//								if($("#vmName").val() !=null&&$("#vmName").val() != ""&&$("#vmName").val() !="null"){
//								$("#tbody2_filter").find("input[type='text']").val($("#vmName").val());
//								$("#tbody2_filter").find("input[type='text']").trigger("keyup");
//								}
//							}
//							
//						});
		
		
//		BackupCloud.datatable4.renderByData(
//				"#tbody4",// 要渲染的table所在的jQuery选择器
//				{
//					"data" : data, // 要渲染的数据选择器					
//					"pageSize" : 5,
//					"onColumnRender" : function(columnIndex,columnMetaData, columnData) {
//						var text = '';
//						if(columnMetaData.name=='id4') {
//				              return '<input type="checkBox" name="check" id="' + columnData.id + '" value="'+columnData.id+'">';
//				           } else if ("ID1" == columnMetaData.name) {
//				              return columnData.id;
//				           } else if ("instanceName4" == columnMetaData.name) {
//				        	   if(null!=columnData.uuid&&""!=columnData.uuid){
//									text = '<a  href="monitor.jsp?code=monitor&vmId='+columnData.uuid+'&vmName='+encodeURI(encodeURI(columnData.instanceName))+'" >'+columnData.instanceName+'</a>'
//									+BackupCloud.getWorkOrderUrl(columnData);
//								}
//								else 
//				        	   
//				        	   text = (columnData.instanceName.length>15?"<span title='"+columnData.instanceName+"'>"+columnData.instanceName.slice(0,15)+"..."+"</span>":columnData.instanceName)+BackupCloud.getWorkOrderUrl(columnData);
//				        	   return text;
//				           } else if ("state4" == columnMetaData.name) {
//				              return com.skyform.service.StateService.getState("vm",columnData.state||columnData);
//				           } else if ("createDate4" == columnMetaData.name) {
//								try {
//									var obj = eval('(' + "{Date: new Date("
//											+ columnData.createDate + ")}"
//											+ ')');
//									var dateValue = obj["Date"];
//									text = dateValue
//											.format('yyyy-MM-dd hh:mm:ss');
//								} catch (e) {
//
//								}
//								return text;
//							}else if ("expireDate4" == columnMetaData.name) {
//								try {
//									var obj = eval('(' + "{Date: new Date("
//											+ columnData.expireDate + ")}"
//											+ ')');
//									var dateValue = obj["Date"];
//									text = dateValue
//											.format('yyyy-MM-dd hh:mm:ss');
//								} catch (e) {
//
//								}
//								return text;
//							}else if ("descrInfo4" == columnMetaData.name) {										
//				        	   try {
//				        		   var cpuNum = "";
//				        		   var mem = "";
//				        		   var os = "";
//				        		   if(columnData.cpu&&columnData.cpu.toString().length>0){
//				        			   cpuNum = columnData.cpu;
//				        		   }
//				        		   if(columnData.os&&columnData.os.length>0){
//					        			  os = columnData.os; 
//					        		   }
//				        		   if(columnData.mem&&columnData.mem.toString().length>0){
//				        			  mem = columnData.mem; 
//				        		   }
//									var appendText = "CPU:"
//											+ cpuNum + Dict.val("vm_he")+","+Dict.val("dc_ram")+":"
//											+ mem + "G,"
//											+ os;
//									text = text + appendText;
//								} catch (e) {
//
//								}
//							return text;
//				           }
//						return columnData[columnMetaData.name];
//					},
//					
////					{"message":"success","data":[{"vmPrice":1,"mem":"0.5","state":"opening","expireDate":1412493362000,"productId":101,"createDate":1409901362000,"cpu":"1","instanceName":"VM_67786912","disk":"50","osId":"1","id":67786912,"ip":" ","period":1,"os":"Cetnos6.4-x86_64"},{"vmPrice":1,"mem":"0.5","state":"opening","expireDate":1412476682000,"productId":101,"createDate":1409884682000,"cpu":"1","instanceName":"VM_67784939","disk":"50","osId":"1","id":67784939,"ip":" ","period":1,"os":"Cetnos6.4-x86_64"}],"code":0}
//					"afterRowRender" : function(rowIndex, data, tr) {
//						
//						tr.attr("id",data.id);
//						tr.attr("uuid",data.uuid);
//						tr.attr("act",data.instanceName);
//						tr.attr("ip",data.ip);
//						tr.attr("state",data.state);
//						tr.attr("instanceId",data.id);
//						tr.attr("productID",data.productId);
//						tr.attr("cpu",data.cpu);
//						tr.attr("mem",data.mem);
//						tr.attr("os",data.os);
//						tr.attr("period",data.period);
//						tr.attr("vmPrice",data.vmPrice);
//						tr.attr("productId",data.productId);
//						tr.attr("osId",data.osId);
//						
//						tr.attr("disk",data.disk);
//						
//						BackupCloud.bindEventForTr(rowIndex, data, tr);
//					},
//					"afterTableRender" : function() {
//						BackupCloud.bindEvent2();
////						$("#tbody2 tbody").find("tr").css("background-color","");
//						var firstRow = $("#tbody4 tbody").find("tr:eq(0)");
//						var	instanceId = firstRow.attr("instanceId");
//						var instance = BackupCloud.getInstanceInfoById(instanceId);
//						//VM.showInstanceInfo(instance);//加载数据之后不再查询关联信息和日志
//						firstRow.css("background-color","#BCBCBC");
//						BackupCloud.setSelectRowBackgroundColor(firstRow);
//						if($("#vmName").val() !=null&&$("#vmName").val() != ""&&$("#vmName").val() !="null"){
//						$("#tbody4_filter").find("input[type='text']").val($("#vmName").val());
//						$("#tbody4_filter").find("input[type='text']").trigger("keyup");
//						}
//					}
//					
//				});
		BackupCloud.inited3=true;
		BackupCloud.inited = true;

//		BackupCloud.datatable.addToobarButton("#toolbar4tbl");
//		BackupCloud.datatable.enableColumnHideAndShow("right");
//		
//		BackupCloud.datatable4.addToobarButton("#toolbar4tbl4");
//		BackupCloud.datatable4.enableColumnHideAndShow("right");
//		BackupCloud.datatable4.updateData(data);
		
	},
	bindEventForTr : function(rowIndex, data, tr) {
		$(tr).attr("state", data.optState || data.state);
		$(tr).attr("name", data.instanceName);
		$(tr).attr("jobState", data.jobState);
		$(tr).unbind().mousedown(
			function(e) {
				tr.find("input[type='radio']").attr("checked", true);
				if (3 == e.which) {return;
					$("#tbody2 input[type='checkbox']").attr("checked", false);
					$("#content_container #checkAll").attr("checked", false);
					tr.find("input[type='checkbox']").attr("checked", true);
					BackupCloud.selectedInstanceId = tr.attr("instanceId");
					BackupCloud.selectedProductId = tr.attr("productid");
					BackupCloud.selectedInstanceDisk = tr.attr("disk");
					BackupCloud.selectedInstanceOsId = tr.attr("osId");
					BackupCloud.selectedInstanceOs = tr.attr("os");
					$("#moreAction").removeClass("disabled");
					document.oncontextmenu = function() {
						return false;
					}
					var screenHeight = $(document).height();
					var top = e.pageY;
					
					if (e.pageY >= screenHeight / 2) {
						top = e.pageY - $("#contextMenu").height();
						// 如果鼠标所在位置在屏幕高度中线的下半部分，则弹出框往上弹出
					}
					$("#contextMenu").hide();
					$("#contextMenu").attr(
							"style",
							"display: block; position: absolute; top:"
									+ top + "px; left:" + e.pageX
									+ "px; width: 180px;");
					$("#contextMenu").show();
					e.stopPropagation();
					BackupCloud.checkSelected(data);

				}
				BackupCloud.showInstanceInfo(data);
				BackupCloud.setSelectRowBackgroundColor(tr);
		});
		$(tr).click(function() {
			BackupCloud.checkboxClick(tr);
			$('#browsePath').hide();
			$("#contentbackup_").val("");
			$("#backUpPathContainer .contentbackup").val("");
			$(".removeMultiPath").click();
			$("#contentbackup_").change();
		});
	},
	bindEventForTr2 : function(rowIndex, data, tr) {
		$(tr).attr("state", data.optState || data.state);
		$(tr).attr("name", data.instanceName);
		$(tr).attr("jobState", data.jobState);
		$(tr).unbind().mousedown(
			function(e) {
				
				if (3 == e.which) {
					$("#tbody2 input[type='checkbox']").attr("checked", false);
					$("#content_container #checkAll").attr("checked", false);
					tr.find("input[type='checkbox']").attr("checked", true);
					BackupCloud.selectedInstanceId = tr.attr("instanceId");
					BackupCloud.selectedProductId = tr.attr("productid");
					BackupCloud.selectedInstanceDisk = tr.attr("disk");
					BackupCloud.selectedInstanceOsId = tr.attr("osId");
					BackupCloud.selectedInstanceOs = tr.attr("os");
					$("#moreAction").removeClass("disabled");
					document.oncontextmenu = function() {
						return false;
					}
					var screenHeight = $(document).height();
					var top = e.pageY;
					
					if (e.pageY >= screenHeight / 2) {
						top = e.pageY - $("#contextMenu").height();
						// 如果鼠标所在位置在屏幕高度中线的下半部分，则弹出框往上弹出
					}
					$("#contextMenu").hide();
					$("#contextMenu").attr(
							"style",
							"display: block; position: absolute; top:"
									+ top + "px; left:" + e.pageX
									+ "px; width: 180px;");
					$("#contextMenu").show();
					e.stopPropagation();
					BackupCloud.checkSelected(data);

				}
				BackupCloud.showInstanceInfo(data);
				BackupCloud.setSelectRowBackgroundColor(tr);
		});
		$(tr).click(function() {
			BackupCloud.checkboxClick(tr);
		});
	},
	setSelectRowBackgroundColor : function(handler) {
		$("#content_container tr").css("background-color","");
		$("#tbody3 tr").css("background-color","");
		handler.css("background-color","#d9f5ff");
	},
	showInstanceInfo : function(instanceInfo) {
		if (instanceInfo==null) return;
		$("div#details span.detail_value").each(function(i,item){
			var prop = $(this).attr("prop");
			$(this).html("" + instanceInfo[""+prop]);
		});
		var array = new Array();
		$("#vmRelations").html("");
		//查询详情
//		BackupCloud.service.listRelatedInstances(instanceInfo.id,function(data){
//			data = data;
//		},function(e){
//		});
		$("#opt_logs").empty();
//		com.skyform.service.LogService.describeLogsUIInfo(instanceInfo.id);
		
	},
	bindEvent : function() {
		
		// 为table的右键菜单添加监听事件
		$("#contextMenu").unbind("mouseover").bind('mouseover', function() {
			BackupCloud.inMenu = true;
		});

		$("#contextMenu").unbind("mouseout").bind('mouseout', function() {
			BackupCloud.inMenu = false;
		});
		$("#contextMenu li").unbind("mousedown").bind('mousedown', function(e) {
			$("#contextMenu").hide();
			if (!$(this).hasClass("disabled"))BackupCloud.onOptionSelected($(this).attr("action"));
		});
		$("body").unbind('mousedown').bind('mousedown', function() {
			if (!BackupCloud.inMenu) {
				$("#contextMenu").hide();
			}
		});
		
		$("#delBackup").unbind('click').bind("click",function(){
			BackupCloud.delCloudBackupDir();
		});
		// 更改配置中添加点击div的效果


		$("#content_container #checkAll").unbind().click(function(e) {
			e.stopPropagation();
			var checked = $(this).attr("checked") || false;
			if(checked) $("#content_container tbody input[type='checkbox']").attr("checked",true);
			else $("#content_container tbody input[type='checkbox']").removeAttr("checked");
			
			BackupCloud.checkSelected();
		});
	},
	bindEvent2 : function() {
		
		// 为table的右键菜单添加监听事件
		$("#contextMenu").unbind("mouseover").bind('mouseover', function() {
			BackupCloud.inMenu = true;
		});

		$("#contextMenu").unbind("mouseout").bind('mouseout', function() {
			BackupCloud.inMenu = false;
		});
		$("#contextMenu li").unbind("mousedown").bind('mousedown', function(e) {
			$("#contextMenu").hide();
			if (!$(this).hasClass("disabled"))BackupCloud.onOptionSelected($(this).attr("action"));
		});
		$("body").unbind('mousedown').bind('mousedown', function() {
			if (!BackupCloud.inMenu) {
				$("#contextMenu").hide();
			}
		});
		
		$("#delBackup").unbind('click').bind("click",function(){
			
			BackupCloud.delCloudBackupDir();
		});
		// 更改配置中添加点击div的效果


		$("#content_container #checkAll").unbind().click(function(e) {
			e.stopPropagation();
			var checked = $(this).attr("checked") || false;
			if(checked) $("#content_container tbody input[type='checkbox']").attr("checked",true);
			else $("#content_container tbody input[type='checkbox']").removeAttr("checked");

			BackupCloud.checkSelected();


		});
	},
	checkboxClick : function(tr) {
		BackupCloud.checkSelected();
	},
	checkSelected : function(selectInstance) {
		$("#vmip").empty();
		
		var allCheckedRadio = $("#tbody3 input[type='radio']:checked");
		var ip = $(allCheckedRadio[0]).parents("tr").attr("ip");
		var instanceName=$(allCheckedRadio[0]).parents("tr").attr("name");
		var networkid = $(allCheckedRadio[0]).parents("tr").attr("networkid");
		var instanceId1 = $(allCheckedRadio[0]).parents("tr").attr("instanceid");
		var ip = $(allCheckedRadio[0]).parents("tr").attr("ip");
		BackupCloud.vmName=instanceName;
		
		
		BackupCloud.backupCloudData.vmId=instanceId1;
		BackupCloud.backupCloudData.vmName=instanceName;
		BackupCloud.backupCloudData.networkId=networkid;
		$("#vmName4").html(BackupCloud.vmName);
		
		BackupCloud.backupCloudData.ip=ip;	
		BackupCloud.backupCloudData.productId=10300;
		
		$("#innerIp").html(BackupCloud.backupCloudData.ip);
		$("#ipMsg").empty();
		$("#vmip2").val(ip);
		//$('#browsePath').hide();
		//$("#contentbackup_").val("");
		//$("#contentbackup_").val("");
		var rightClicked = selectInstance?true:false;
		
		var allCheckedBox = $("#tbody2 input[type='checkbox']:checked");
		
		var oneSelected = allCheckedBox.length == 1;
		var hasSelected = allCheckedBox.length > 0;
		
		$(".operation").addClass("disabled");
		
		var state = $(allCheckedBox[0]).parents("tr").attr("state");
		var osType = $(allCheckedBox[0]).parents("tr").attr("osType")=='WIN' ? false : true;
		var down = ($(allCheckedBox[0]).parents("tr").attr("backupType")=='3' ? false : true)||($(allCheckedBox[0]).parents("tr").attr("osType")=='WIN' ? false : true);
		var os = $(allCheckedBox[0]).parents("tr").attr("os");
		var rollbackup_state=$(allCheckedBox[0]).parents("tr").attr("rollbackup_state")=='3' ? false : true||$(allCheckedBox[0]).parents("tr").attr("rollbackup_state")=='0' ? false : true;
		
		var jobState = $(allCheckedBox[0]).parents("tr").attr("jobState");
		
		var allInstanceHasTheSameState = true;
		
		var allInstanceStateCanBeDestroy = true;
		
		$(allCheckedBox).each(function(index,checkbox){
			var _state = $(checkbox).parents("tr").attr("state");
			if(_state != state) {
				allInstanceHasTheSameState = false;
				return false;
			}
		});
		
		$(allCheckedBox).each(function(index,checkbox){
			var _state = $(checkbox).parents("tr").attr("state");
			var backupType = $(checkbox).parents("tr").attr("backupType");
			var _jobState = $(checkbox).parents("tr").attr("jobState");
			if(_state =='deleting' || _state=='opening' || _jobState=='lock'){
				allInstanceStateCanBeDestroy = false;
				return false;
			}
		});
		
		$(".operation").each(function(index,operation){
			var condition = $(operation).attr("condition");
			var action = $(operation).attr("action");
			var enabled = true;
			eval("enabled=("+condition+")");
			if(enabled) {
				$(operation).removeClass("disabled");
				$(operation).unbind("click").click(function(){
					BackupCloud.onOptionSelected(action||"");
				});
			} else {
				$(operation).addClass("disabled");
				$(operation).unbind();
			}
		});
		
		
		
	},

	onOptionSelected : function(action) {
		
			if ("delCBup" == action) {
				BackupCloud.delCloudBackup(); // 删除云备份
			}
			if ("backupStart" == action) {
				BackupCloud.backupStart(); // 删除云备份
			}
			if ("backupClosed" == action) {
				BackupCloud.backupClosed(); // 删除云备份
			}
			if ("nowExecute" == action) {
				BackupCloud.nowExecute(); // 删除云备份
			}
			if ("delBackup" == action) {
				 // 删除云备份
			}
			
		
	},
	
	
	
	delCloudBackup : function(id) {
		var oldInstanceName = BackupCloud.getCheckedArr().parents("tr").find("td[name='instanceName']").text();//删除数据的id
		BackupCloud.instanceName = oldInstanceName;
		if (BackupCloud.modifyVMNameModal == null) {
			BackupCloud.modifyVMNameModal = new com.skyform.component.Modal(
					new Date().getTime(),
					"删除云备份",
					'<div class="modal-body"> <form  class=\"form-horizontal\"> '
					        + '<fieldset>'
						        + '<div class=\"control-group\">'
							        + '<label class=\"control-label\" for=\"input01\">'+"备份名称"+':</label>'
									+ '<div class=\"controls\"><input type=\"text\" readonly=\"readonly\" name=\"instance_name\" id=\"updateName\" value='+BackupCloud.instanceName+' maxlength=\"32\"><font color=\'red\'></font><br>'
									+ '</div>'
								+ '</div>'
							+ '</fieldset>'
					 + '</form></div>',
					{
						buttons : [
								{
									name : "确定",
									onClick : function() {
										var value = $("#updateName")[0].value;
										if (value == null || value == "") {
											return;
										}
									},
									attrs : [ {
										name : 'class',
										value : 'btn btn-primary'
									} ]
								}, {
									name :"取消",
									attrs : [ {
										name : 'class',
										value : 'btn'
									} ],
									onClick : function() {
										BackupCloud.modifyVMNameModal.hide();
									}
								} ],
						beforeShow : function(){
							$("#updateName").val(BackupCloud.instanceName);
						}
					});

		}
		BackupCloud.modifyVMNameModal.show();
	},
	backupStart : function(id) {
		var oldInstanceName = BackupCloud.getCheckedArr().parents("tr").find("td[name='instanceName']").text();//删除数据的id
		BackupCloud.instanceName = oldInstanceName;
		if (BackupCloud.modifyVMNameModal == null) {
			BackupCloud.modifyVMNameModal = new com.skyform.component.Modal(
					new Date().getTime(),
					"开启",
					'<div class="modal-body"> <form  class=\"form-horizontal\"> '
					        + '<fieldset>'
						        + '<div class=\"control-group\">'
							        + '<label class=\"control-label\" for=\"input01\">'+"备份名称"+':</label>'
									+ '<div class=\"controls\"><input type=\"text\" readonly=\"readonly\" name=\"instance_name\" id=\"updateName\" value='+BackupCloud.instanceName+' maxlength=\"32\"><font color=\'red\'></font><br>'
									+ '</div>'
								+ '</div>'
							+ '</fieldset>'
					 + '</form></div>',
					{
						buttons : [
								{
									name : "确定",
									onClick : function() {
										var value = $("#updateName")[0].value;
										if (value == null || value == "") {
											return;
										}
									},
									attrs : [ {
										name : 'class',
										value : 'btn btn-primary'
									} ]
								}, {
									name :"取消",
									attrs : [ {
										name : 'class',
										value : 'btn'
									} ],
									onClick : function() {
										BackupCloud.modifyVMNameModal.hide();
									}
								} ],
						beforeShow : function(){
							$("#updateName").val(BackupCloud.instanceName);
						}
					});

		}
		BackupCloud.modifyVMNameModal.show();
	},
	backupClosed : function(id) {
		var oldInstanceName = BackupCloud.getCheckedArr().parents("tr").find("td[name='instanceName']").text();//删除数据的id
		BackupCloud.instanceName = oldInstanceName;
		if (BackupCloud.modifyVMNameModal == null) {
			BackupCloud.modifyVMNameModal = new com.skyform.component.Modal(
					new Date().getTime(),
					"关闭",
					'<div class="modal-body"> <form  class=\"form-horizontal\"> '
					        + '<fieldset>'
						        + '<div class=\"control-group\">'
							        + '<label class=\"control-label\" for=\"input01\">'+"备份名称"+':</label>'
									+ '<div class=\"controls\"><input type=\"text\" readonly=\"readonly\" name=\"instance_name\" id=\"updateName\" value='+BackupCloud.instanceName+' maxlength=\"32\"><font color=\'red\'></font><br>'
									+ '</div>'
								+ '</div>'
							+ '</fieldset>'
					 + '</form></div>',
					{
						buttons : [
								{
									name : "确定",
									onClick : function() {
										var value = $("#updateName")[0].value;
										if (value == null || value == "") {
											return;
										}
									},
									attrs : [ {
										name : 'class',
										value : 'btn btn-primary'
									} ]
								}, {
									name :"取消",
									attrs : [ {
										name : 'class',
										value : 'btn'
									} ],
									onClick : function() {
										BackupCloud.modifyVMNameModal.hide();
									}
								} ],
						beforeShow : function(){
							$("#updateName").val(BackupCloud.instanceName);
						}
					});

		}
		BackupCloud.modifyVMNameModal.show();
	},
	nowExecute : function(id) {
		var oldInstanceName = BackupCloud.getCheckedArr().parents("tr").find("td[name='instanceName']").text();//删除数据的id
		BackupCloud.instanceName = oldInstanceName;
		if (BackupCloud.modifyVMNameModal == null) {
			BackupCloud.modifyVMNameModal = new com.skyform.component.Modal(
					new Date().getTime(),
					"立即执行",
					'<div class="modal-body"> <form  class=\"form-horizontal\"> '
					        + '<fieldset>'
						        + '<div class=\"control-group\">'
							        + '<label class=\"control-label\" for=\"input01\">'+"备份名称"+':</label>'
									+ '<div class=\"controls\"><input type=\"text\" readonly=\"readonly\" name=\"instance_name\" id=\"updateName\" value='+BackupCloud.instanceName+' maxlength=\"32\"><font color=\'red\'></font><br>'
									+ '</div>'
								+ '</div>'
							+ '</fieldset>'
					 + '</form></div>',
					{
						buttons : [
								{
									name : "确定",
									onClick : function() {
										var value = $("#updateName")[0].value;
										if (value == null || value == "") {
											return;
										}
									},
									attrs : [ {
										name : 'class',
										value : 'btn btn-primary'
									} ]
								}, {
									name :"取消",
									attrs : [ {
										name : 'class',
										value : 'btn'
									} ],
									onClick : function() {
										BackupCloud.modifyVMNameModal.hide();
									}
								} ],
						beforeShow : function(){
							$("#updateName").val(BackupCloud.instanceName);
						}
					});

		}
		BackupCloud.modifyVMNameModal.show();
	},
	
	delCloudBackupDir : function(id) {
//		var oldInstanceName = BackupCloud.getCheckedArr().parents("tr").find("td[name='instanceName']").text();//删除数据的id
//		BackupCloud.instanceName = oldInstanceName;
		if (BackupCloud.delBCupDirModal == null) {
			BackupCloud.delBCupDirModal = new com.skyform.component.Modal(
					new Date().getTime(),
					"删除云备份",
					'<div class="modal-body"> <form  class=\"form-horizontal\"> '
					        + '<fieldset>'
						        + '<div class=\"control-group\">'
							        + '<label class=\"control-label\" for=\"input01\">'+"备份名称"+':</label>'
									+ '<div class=\"controls\"><input type=\"text\" readonly=\"readonly\" name=\"instance_name\" id=\"updateName\" value='+BackupCloud.instanceName+' maxlength=\"32\"><font color=\'red\'></font><br>'
									+ '</div>'
								+ '</div>'
							+ '</fieldset>'
					 + '</form></div>',
					{
						buttons : [
								{
									name : "确定",
									onClick : function() {
										var value = $("#updateName")[0].value;
										if (value == null || value == "") {
											return;
										}
									},
									attrs : [ {
										name : 'class',
										value : 'btn btn-primary'
									} ]
								}, {
									name :"取消",
									attrs : [ {
										name : 'class',
										value : 'btn'
									} ],
									onClick : function() {
										BackupCloud.delBCupDirModal.hide();
									}
								} ],
						beforeShow : function(){
							$("#updateName").val(BackupCloud.instanceName);
						}
					});

		}
		BackupCloud.delBCupDirModal.show();
	},
	getCheckedArr : function() {
		var checkedArr = $("#tbody2 tbody input[type='checkbox']:checked");
		if(checkedArr.length == 0){
			checkedArr = BackupCloud.lastCheckedArr;
		}
		else BackupCloud.lastCheckedArr = checkedArr;
		return checkedArr;
		
		return $("#tbody2 tbody input[type='checkbox']:checked");
	}
};

	
