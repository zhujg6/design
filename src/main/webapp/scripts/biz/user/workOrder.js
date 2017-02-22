$(function() {
	workOrder.init();
});
	var workOrder = {
			dataInstances:null,
			workOrderTable:null,
			totalPage:null,
			currentPage:1,
			countDiv:0,
			config:null,
			ContentTypeO:{
					".png":"image/png",
					".jpg":"image/jpeg",
					".txt":"text/plain",
					".pdf":"application/pdf",
					".doc":"application/msword",
					".docx":"application/msword",
					".xlsx":"application/vnd.ms-excel",
					".xls":"application/vnd.ms-excel"
				},
			service:com.skyform.service.workOrderService,
			init:function(){
				workOrder.bindEvent();
				workOrder.config = workOrder.getConfig();
				workOrder.getStatus();
				var account = $("#currentUserNameWork").val();
				/*workOrder.service.getUser(account,function(result){
					var users= $.parseJSON(result).users;
					if(users.length > 0){
						$("#workUserId").val(users[0].id);
						workOrder.refresh();
					}else{
						alert(Dict.val("wo_data_error_contact_administrator"));
					}
					
				},function(error){
					alert(Dict.val("wo_data_error"));
				});*/
				Dcp.biz.getCurrentUser(function(data){
					console.log(data);
					$("#workUserId").val(data.id);
					workOrder.refresh();
				})
			},
			refresh:function(){
				workOrder.currentPage=1;
				var apiUrl = workOrder.getCondition();
				workOrder.query(apiUrl,function(result){
					workOrder.dataInstances =$.parseJSON(result);
					workOrder.totalPage = workOrder.getTotalPage(parseInt(workOrder.dataInstances.total_count), parseInt(workOrder.dataInstances.limit));
					workOrder.initDataTable();
					workOrder.checkSelected();
				});
			},
			getStatus:function(){
				$("#status_id").empty();
	    		var optionAll = "<option value=''>"+Dict.val("wo_please_select_state")+"</option>";
	    		$("#status_id").append(optionAll);
	    		$.each(workOrder.config.workStatusList,function(key,value){
	    			$("#status_id").append("<option value='"+key+"'>"+value+"</option");
	    		});
			},
			initDataTable:function(){
				if(workOrder.workOrderTable == null){
					workOrder.renderDataTable();
				}else{
					workOrder.updateDataTable();
				}
			},
			renderDataTable:function(){
				var self = this;
				workOrder.workOrderTable= new com.skyform.component.DataTable();
				workOrder.workOrderTable.renderByData("#workOrderTable", {
					'selfPaginate' : true,	
					"onColumnRender" : function(columnIndex, columnMetaData, columnData) {
						var text =  "";
						if (columnMetaData.name == "id") {
							text ="<input type='checkbox' value='"+columnData.id+"'/>";
						}else if (columnMetaData.name == "created_on") {
							//text = dt.Format("yyyy-MM-dd HH:mm:ss");
							text = workOrder.dateForamtGelin(columnData.created_on);
						}else if (columnMetaData.name == "updated_on") {
//							var dt = new Date(columnData.updated_on);
//							text = dt.Format("yyyy-MM-dd HH:mm:ss");
							text = workOrder.dateForamtGelin(columnData.updated_on);
						}else if (columnMetaData.name == "subject") {
							var temp = columnData.subject;
							if(temp.length > 10){
								text = "<span title='"+temp+"'>"+temp.substring(0,10)+"...."+"</span>";
							}else{
								text = columnData.subject;
							}
							
						}else if (columnMetaData.name == "status") {
							text = com.skyform.service.StateService.workOrderStatus[workOrder.config.workStatus[columnData.status.id]];
						}else if(columnMetaData.name == "category"){
							var cf = columnData.custom_fields;
							$(cf).each(function(index,item){
								if(item.id == workOrder.config.relationId){
									text = item.value;
								}
							});
							
						}else if(columnMetaData.name == "IDs") {
							text =columnData.id;
						}
						return text;
					}, 
					"afterRowRender" : function(rowIndex, data, tr){
						tr.find("input[type='checkbox']").click(function(){
							workOrder.checkSelected();
						});
						tr.attr("status",data.status.id);
					},
					"pageInfo" : {
						"totalPage" : workOrder.totalPage,
						"currentPage": 1,	
						"data" : workOrder.dataInstances.issues
					},
					"onPaginate" : function(targetPage) {
						workOrder.currentPage = targetPage;
						var apiUrl = workOrder.getCondition();
						workOrder.query(apiUrl,function(result){
							workOrder.dataInstances =$.parseJSON(result);
							workOrder.totalPage = workOrder.getTotalPage(workOrder.dataInstances.total_count, workOrder.dataInstances.limit);
							workOrder.initDataTable();
							var pageInfo = {
									"totalPage" : workOrder.totalPage,
									"currentPage" : targetPage,
									"data" : workOrder.dataInstances.issues
								};
							workOrder.workOrderTable.setPaginateInfo(pageInfo);
						});
							
					 }
				});
				workOrder.workOrderTable.addToobarButton("#toolbar");
			},
			updateDataTable : function(){
				var pageInfo = {
						"totalPage" :workOrder.totalPage,
						"currentPage" : 1,
						"data" : workOrder.dataInstances.issues
					};
				workOrder.workOrderTable.setPaginateInfo(pageInfo);
			},
			dateForamtGelin:function(date){
				var datefor = date.replace(/(\d{4})-(\d{2})-(\d{2})T(.*)Z/, "$1-$2-$3-$4");
				var arr = datefor.split("-");
				var date = new Date();
				var hms = arr[3].split(":");
				date.setFullYear(arr[0]);
				date.setMonth(arr[1] -1);
				date.setDate(arr[2]);
				var hour = Number(hms[0])+8;
				date.setHours(hour);
				date.setMinutes(hms[1]);
				date.setSeconds(hms[2]);
				var test = date.getTime();
				return date.format("yyyy-MM-dd hh:mm:ss");
				
			},
			query : function(condition, callback){
				workOrder.service.getListWorkOrders(condition, function(result) {
					if(callback&& typeof callback == 'function') callback(result);
				}, function(error) {
					alert(error);
				});
			},
			getCondition:function(){
				var apiUrl = "";
				var set = workOrder.currentPage - 1;
				apiUrl = "&offset="+set * 5+"&limit=5&sort=updated_on:desc" +
						"&project_id="+workOrder.config.redmineProductId+
						"&cf_"+workOrder.config.userNameId+"="+$("#currentUserNameWork").val()+
						"&cf_"+workOrder.config.customerServiceId+"=no";
				var startTime = $("#startTime").val();
				var endTime = $("#endTime").val();
				
				if(startTime.length > 0){
					var sta = startTime.split("-");
				    var sTemp = parseInt(sta[0]+sta[1]+sta[2]);
					if(endTime.length > 0){
						var ena = endTime.split("-");
					    var eTemp = parseInt(ena[0]+ena[1]+ena[2]);
					    if(sTemp > eTemp){
					    	alert(Dict.val("wo_start_time_can_not_exceed_end_time"));
					    	return
					    }
						apiUrl+="&updated_on=%3E%3c"+startTime+"|"+endTime;
					}else{
						apiUrl+="&updated_on=%3E="+startTime;
					}
				}else{
					if(endTime.length > 0){
						apiUrl+="&updated_on=%3c="+endTime;
					}
				}
				var status = $("#status_id").val();
				if(status&&status.length > 0){
					apiUrl += "&status_id="+status;
				}else{
					apiUrl += "&status_id=*";
				}
				var subject = $("#subjectQuery").val();
				if(subject&&subject.length>0){
					apiUrl += "&subjectW="+encodeURIComponent("~"+subject);
				}
				return apiUrl;
				
				
			},
			bindEvent:function(){
				workOrder.checkSelected();
				$(".basicDatepickerTime").datepicker({
					showButtonPanel : true,
					changeYear : true,
					changeMonth : true,
					dateFormat : "yy-mm-dd",
		            closeText:Dict.val("vdisk_close"),
		            nextText:Dict.val("common_next_month"),
		            prevText:Dict.val("common_previous_month"),
		            hideIfNoPrevNext: true,
		            currentText: Dict.val("common_today"),
		            monthNamesShort: [Dict.val("common_january"),
		                              Dict.val("common_february"),
		                              Dict.val("common_march"),
		                              Dict.val("common_april"),
		                              Dict.val("common_may"),
		                              Dict.val("common_june"),
		                              Dict.val("common_july"),
		                              Dict.val("common_august"),
		                              Dict.val("common_september"),
		                              Dict.val("common_october"),
		                              Dict.val("common_november"),
		                              Dict.val("common_december")],
			         dayNamesMin: [Dict.val("common_day"),
			                       Dict.val("common_one"),
			                       Dict.val("common_two"),
			                       Dict.val("common_three"),
			                       Dict.val("common_four"),
			                       Dict.val("common_Fives"),
			                       Dict.val("common_six")],
			         showMonthAfterYear: true,
				});
				$.datepicker._gotoToday = function(id) {
					 var target = $(id);
					 var inst = this._getInst(target[0]);
					 if (this._get(inst, 'gotoCurrent') && inst.currentDay) {
					   inst.selectedDay = inst.currentDay;
					   inst.drawMonth = inst.selectedMonth = inst.currentMonth;
					   inst.drawYear = inst.selectedYear = inst.currentYear;
					 }
					 else {
					   var date = new Date();
					   inst.selectedDay = date.getDate();
					   inst.drawMonth = inst.selectedMonth = date.getMonth();
					   inst.drawYear = inst.selectedYear = date.getFullYear();
					   // the below two lines are new
					   this._setDateDatepicker(target, date);
					   this._selectDate(id, this._getDateDatepicker(target));
					 }
					 this._notifyChange(inst);
					 this._adjustDate(target);
					};
			},
			updateWorkDesc:function(){
				var notes = $("#noteBack").val();
				if(notes.length == 0){
					$("#noteBackMsg").text(Dict.val("wo_reply_can_not_be_empty"));
					return
				}else{
					$("#noteBackMsg").text("");
				}
				var tokenConfig = workOrder.getTokenConfigUpdate();
				var wrder = {
						"id":$("#workOrderId").val(),
						  "issue": {
						    "author":$("#currentUserNameWork").val(),
						    "notes":notes,
						    "uploads":tokenConfig
						  }
			};
				workOrder.service.updateAttachment(wrder,function(result){
					var id = $("#workOrderId").val();
					$("#attachment_filesUpdate").empty();
						workOrder.service.getRecord(id,function(result){
							workOrder.showRecordDetail($.parseJSON(result));
							$(tokenConfig).each(function(index,item){
								var d ="<li class='popr'>" +
								"<div class='gdspan'><span>" +
								$("#currentUserNameWork").val() +
								"</span>" +
								"<br>" +
								"<span>" +
								new Date().Format("yyyy-MM-dd HH:mm:ss") +
								"</span></div>" +
								" <div class='popover-r'><i class='icon-caret-right'></i>"
								+Dict.val("wo_successfully_uploaded")+item.filename+"</div>"+
			                       "</li>";;
								$("#recordDetail").append(d);
							});
						    $(tokenConfig).each(function(index,item){
						    	var msg = {
										"id":$("#workOrderId").val(),
										  "issue": {
										    "author":$("#currentUserNameWork").val(),
										    "notes":Dict.val("wo_successfully_uploaded")+item.filename
										  }
								};
								workOrder.service.insertJournals(msg,function(result){
								},function(error){
							    	alert(Dict.val("wo_data_error"));
								});
						    });
					},function(error){
				    	alert(Dict.val("wo_data_error"));
					});
			    },function(error){
			    	alert(Dict.val("wo_data_error"));
				});
				
				
			},
			
			hasNoFileWorkOrder:function(){
				var wrder = this.shareWorkOrder();
				return wrder;
			},
			hasFileWorkOrder:function(){
				var tokenConfig = workOrder.getTokenConfig();
				var wrder = this.shareWorkOrder();
				wrder.issue.uploads = tokenConfig;
			return wrder;
		},
		shareWorkOrder:function(){
			var wrder = {
					  "issue": {
					    "project_id": workOrder.config.redmineProductId,
					    "subject": $("#subjectCreate").val(),
					    "description":$("#descriptionCreate").val(),
					    "status_id":1,
					   // "category_id":$("#catagory_select").val(),
					    "author":$("#currentUserNameWork").val()
					  }
		};
		var arr = new Array();
		var telephone = {
				"id":workOrder.config.telephoneId,
				"value":$("#telephone").val()
		};
		arr.push(telephone);
		var wotype={//类别
				"id":workOrder.config.catagoryTypeId,
				"value":$("#catagory_select").val()
		};
		arr.push(wotype);
		
		var rv=$("input[name='relationRes']:checked").attr("value");
		var relationId = {// 关于
				"id":workOrder.config.relationId,
				"value":workOrder.config.relationResource[rv]
		};
		arr.push(relationId);
		if(rv == workOrder.config.relationX){
			wrder.issue.tracker_id = workOrder.config.trade_xun_id;
		}else if(rv == workOrder.config.relationT){
			wrder.issue.tracker_id = workOrder.config.trade_T_id;
		}
		
		var userName={//沃云用户
				"id":workOrder.config.userNameId,
				"value":$("#currentUserNameWork").val()
		};
		arr.push(userName);
		var customerServiceId={
				"id":workOrder.config.customerServiceId,
				"value":"no"
		};
		arr.push(customerServiceId);
		var serviceType = $("#instanceServiceType").val();
		if(serviceType&&serviceType.length > 0&&rv == workOrder.config.relationT){
			var innerIP = {
					"id":workOrder.config.innerIPID,
					"value":$("#instanceInnerIP").val()
			};
			arr.push(innerIP);
			var instancePublicIP = {
					"id":workOrder.config.publicIPID,
					"value":$("#instancePublicIP").val()
			};
			arr.push(instancePublicIP);
			var instancePool = {
					"id":workOrder.config.poolId,
					"value":$("#instancePool").val()
			};
			arr.push(instancePool);
			var instanceId = {
					"id":workOrder.config.instanceId,
					"value":$("#instanceId").val()
			};
			arr.push(instanceId);
			var instanceNameId = {
					"id":workOrder.config.instanceNameId,
					"value":$("#instanceName").val()
			};
			arr.push(instanceNameId);
			var instanceStatus = {
					"id":workOrder.config.instanceStatusId,
					"value":$("#instanceStatus").val()
			};
			arr.push(instanceStatus);
			
		}
		wrder.issue.custom_fields = arr;
			return wrder;
		},
		
		getTokenConfig:function(){
			var arrp= $("#attachment_files").find("input[name='attachment']");
			var tokens=[];
			$(arrp).each(function(index,item){
				var token =
						{
							 "token": $(item).attr("attachmentToken"), 
							        "filename":$(item).attr("attachmentName"),
							        "description": $(item).attr("value"),
							        "content_type": $(item).attr("attachmentContentType")
							      };
				tokens.push(token);
			});
			return tokens;
		},
		getTokenConfigUpdate:function(){
			var arrp= $("#attachment_filesUpdate").find("input[name='attachment']");
			var tokens=[];
			$(arrp).each(function(index,item){
				var token =
						{
							 "token": $(item).attr("attachmentToken"), 
							        "filename":$(item).attr("attachmentName"),
							        "description": $(item).attr("value"),
							        "content_type": $(item).attr("attachmentContentType")
							      };
				tokens.push(token);
			});
			return tokens;
		},
			getTotalPage:function(totalCount,limit){
				var result = totalCount % limit;
				var count = (totalCount-result) / limit;
				if(result != 0){
					count +=1;
				}
				return count;
			},
				showWorkOrderDetail:function(){
					var id = $("#workOrderId").val();
					$("#attachment_filesUpdate").empty();
					$("#attachmentUpdate").val("");
					$("#noteBackMsg").text("");
					$("#tipFile2uploadUpdate").text("");
					$("#workOrderList").addClass("hide");
					$("#allWorkOrder").removeClass("hide");
					workOrder.service.getWorkOrder(id,function(result){
						workOrder.showWorkDetail($.parseJSON(result));
					},function(error){
						alert(Dict.val("wo_data_error"));
					});
					workOrder.service.getRecord(id,function(result){
						workOrder.showRecordDetail($.parseJSON(result));
					},function(error){
						alert(Dict.val("wo_data_error"));
					});
				},
				showWorkDetail:function(workDetail){
					$("#subjectDetail").text(workDetail.issue.subject);
					$("#idDetail").text(workDetail.issue.id);
					if(workDetail.issue.category){
						$("#catagoryDetail").text(workDetail.issue.category.name);
					}
					$(workDetail.issue.custom_fields).each(function(index,item){
						if(item.id == workOrder.config.catagoryTypeId){
							$("#catagoryDetail").text(item.value);
						}else if(item.id == workOrder.config.relationId){
							$("#relationDetail").text(item.value);
						}
					});
					$("#statusDetail").html(com.skyform.service.StateService.workOrderStatus[workOrder.config.workStatus[workDetail.issue.status.id]]);
					$("#descriptionOrder").text(workDetail.issue.description);
					$("#createOnDetail").text(workOrder.dateForamtGelin(workDetail.issue.created_on));
					$("#updateOnDetail").text(workOrder.dateForamtGelin(workDetail.issue.updated_on));
					$("#indefinedDetail").empty();
					this.showColumnDef(workDetail.issue.custom_fields);
				},
				showColumnDef:function(custom_fields){
					$("#indefinedDetail").empty();
					var count = 0;
					$(custom_fields).each(function(index,item){
						if(item.value&&item.value.length > 0){
							var flag = workOrder.getParameters(item);
							if(flag){
								if(count % 2 == 0){
									var tr = "<tr><th>"+item.name+":</th><td>"+item.value+"</td></tr>";
									$("#indefinedDetail").append(tr);
								}else{
									var tds ="<th>"+item.name+":</th><td>"+item.value+"</td>";
									$("#indefinedDetail tr:last").append(tds);
								}
								count++;
							}
						}
					});
				},
				getParameters:function(data){
					var flag = false;
				    $.each(workOrder.config.userData,function(index,value){
				    	if(data.id == value){
				    		flag = true;
				    		return false;
				    	}
				    });
				    return flag;
				},
				showRecordDetail:function(recordDetail){
					$("#workOrderId").val(recordDetail.issue.id);
					$("#workOrderSubject").val(recordDetail.issue.subject);
					$("#workOrderStatusId").val(recordDetail.issue.status.id);
					$("#workOrderDescription").val(recordDetail.issue.description);
					$("#recordDetail").empty();
					if(recordDetail.issue.journals.length > 0){
						$(recordDetail.issue.journals).each(function(index,item){
							var accountId = $("#workUserId").val();
							if(item.notes.length > 0){
								if(accountId != item.user.id){
									var d ="  <li class='popl'>" +
									"<div class='gdspan'><span>" +
									item.user.name +
									"</span>" +
									"<br>" +
									"<span>" +new Date(item.created_on).Format("yyyy-MM-dd HH:mm:ss")
									 +
									"</span></div>" +
									"<div class='popover-l'><i class='icon-caret-left'></i>"+
									item.notes+"</div></li>";
									$("#recordDetail").append(d);
								}else{
									var d ="<li class='popr'>" +
									"<div class='gdspan'><span>" +
									item.user.name +
									"</span>" +
									"<br>" +
									"<span>" +
									new Date(item.created_on).Format("yyyy-MM-dd HH:mm:ss") +
									"</span></div>" +
									" <div class='popover-r'><i class='icon-caret-right'></i>"
		                              +item.notes+"</div>"+
		                               "</li>";;
									$("#recordDetail").append(d);
									
								}
							}
							
						});
					}
					var arrp = $("#recordDetail").find("li");
					if(arrp.length == 0){
						var d ="  <li class='popl'>" +
						"<div class='gdspan'><span>" +
						Dict.val("wo_no_communication_record") +
						"</span>" +
						"</div></li>";;
						$("#recordDetail").append(d);
					}
				},
				createWorkOrder:function(){
					$("#createWorkOrderShow").modal("show");
					$("#attachment_files").empty();
					$("#attachment").val("");
					$("#tipFile2upload").text("");
					$("#telephoneCreateMsg").text("");
					var instanceId = $("#instanceId").val();
					var instanceName = $("#instanceName").val();
					var instanceStatus = $("#instanceStatus").val();
					workOrder.listRelationResources();
					$("#allWorkOrder").addClass("hide");
				},
				listRelationResources:function(){
					$("#relationRadio").empty();
					$.each(workOrder.config.relationResource,function(key,value){
						var radio=$("#relationRadio").append("<div><label class='radio radioW'><input type='radio' name='relationRes' id='res_"+key+"'value='"+key+"'>"+value+'</label></div>');
					});
					$("input[name='relationRes']").click(function(){
					   $("#showMsg").removeClass("hide");
					   $("#relationMsg").text(" "+workOrder.config.relationMsg[this.value]);
					   workOrder.showCatagories(this.value);
					});
					var serviceType = $("#instanceServiceType").val();
					if(serviceType&&serviceType.length > 0){
						$("input[id='res_"+workOrder.config.relationT+"']").attr("checked",true);
						 $("#showMsg").removeClass("hide");
						$("#relationMsg").text(" "+workOrder.config.relationMsg[workOrder.config.relationT]);
						workOrder.showCatagories(workOrder.config.relationT);
						$("#catagory_select").val(workOrder.config.catagoryIds[serviceType]);
					}else{
						$("input[id='res_"+workOrder.config.relationDefault+"']").attr("checked",true);
						 $("#showMsg").removeClass("hide");
						$("#relationMsg").text(" "+workOrder.config.relationMsg[workOrder.config.relationDefault]);
						workOrder.showCatagories(workOrder.config.relationDefault);
					}
					
				},
				showCatagories:function(relationId){
					if(relationId == workOrder.config.relationX){
						$("#catagory_select").empty();
			    		var optionAll = "<option value=''>"+Dict.val("wo_please_select_type")+"</option>";
			    		$("#catagory_select").append(optionAll);
			    		$.each(workOrder.config.xunCatagory,function(key,value){
			    			$("#catagory_select").append("<option value='"+value+"'>"+value+"</option");
			    		});
					}else if(relationId == workOrder.config.relationT){
						$("#catagory_select").empty();
			    		var optionAll = "<option value=''>"+Dict.val("wo_please_select_type")+"</option>";
			    		$("#catagory_select").append(optionAll);
			    		$.each(workOrder.config.catagoryIds,function(key,value){
			    			$("#catagory_select").append("<option value='"+value+"'>"+value+"</option");
			    		});
					}
				},
				checkSelected:function(){
					$(".operation").addClass("disabled");
					var runningState = false;
					var oneBox = $("#workOrderTable input[type='checkbox']:checked");
					var selectRadio = oneBox.length == 1;
					var status = $("#workOrderTable input[type='checkbox']:checked").eq(0).closest("tr").attr("status");
					if(selectRadio){
						var selectInstanceId = $("#workOrderTable input[type='checkbox']:checked").eq(0).attr("value");
						$("#workOrderId").val(selectInstanceId);
					}
					
					$(".operation").each(function(index,operation){
						var condition = $(operation).attr("condition");
						var action = $(operation).attr("action");
						var enabled = true;
						eval("enabled=("+condition+")");
						if(enabled) {
							$(operation).removeClass("disabled");
							$(operation).unbind("click").click(function(){
								workOrder.onOptionSelected(action||"");
							});
						} else {
							$(operation).addClass("disabled");
							$(operation).unbind();
						}
					});
				},
				onOptionSelected:function(action){
					if ("refresh" == action) {
						workOrder.refresh();
					}else if("createWorkOrder" == action){
						workOrder.createWorkOrder();
					}else if("uploadingfile" == action){
						workOrder.uploadingfile();
					}else if("uploadingfileUpdate" == action){
						workOrder.uploadingfileUpdate();
					}else if("closeWork" == action){
						workOrder.closeWork();
					}else if("workListOrder" == action){
						workOrder.workListOrder();
					}else if("cancel" == action){
						workOrder.cancel();
					}else if("updateWorkDesc" == action){
						workOrder.updateWorkDesc();
					}else if("showWorkOrderDetail" == action){
						workOrder.showWorkOrderDetail();
					}else if("saveWorkOrder" == action){
						workOrder.saveWorkOrder();
					}else if("emptyBack"==action){
						workOrder.emptyBack();
					}
				},
				cancel:function(){
					workOrder.workListOrder();
				},
				saveWorkOrder:function(){
					var alength = $("#attachment_files").find("input[name='attachment']").length;
					var wo = null;
					var category_id = $("#catagory_select").val();
					if(category_id.length == 0){
						$("#catagoryCreateMsg").text(Dict.val("wo_please_select_type"));
						return
					}else{
						$("#catagoryCreateMsg").text("");
					}
					
					var subject = $("#subjectCreate").val();
					if(subject.length == 0){
						$("#subjectCreateMsg").text(Dict.val("wo_title_not_empty"));
						return
					}else{
						$("#subjectCreateMsg").text("");
					}
					var telephone = $("#telephone").val();
					if(telephone.length == 0){
						$("#telephoneCreateMsg").text(Dict.val("wo_phone_number_not_empty"));
						return
					}else{
						$("#telephoneCreateMsg").text("");
						if(valiter.cellphone(telephone)){
							$("#telephoneCreateMsg").text(Dict.val("wo_fill_incorrect_phone_number"));
							return
						}
					}
					var description = $("#descriptionCreate").val();
					if(description.length == 0){
						$("#descriptionCreateMsg").text(Dict.val("wo_content_can_notempty"));
						return
					}else{
						$("#descriptionCreateMsg").text("");
					}
				    if(alength == 0){
				    	wo = workOrder.hasNoFileWorkOrder();
				    }else{
				    	wo = workOrder.hasFileWorkOrder();
				    }	
				    $("#createWorkOrderShow").modal("hide");
				    workOrder.service.createIssue(wo,function(result){
				    	
				    	workOrder.refresh();
				    	
						//$("#workOrderList").removeClass("hide");
						//$("#allWorkOrder").addClass("hide");
						$("#instanceId").val("");
						$("#instanceName").val("");
						$("#instanceStatus").val("");
						$("#instanceServiceType").val("");
						$("#instancePool").val("");
						$("#instanceInnerIP").val("");
						$("#instancePublicIP").val("");
						if(wo.issue.uploads){
							$(wo.issue.uploads).each(function(index,item){
								var msg = {
										"id":result.issue.id,
										"issue": {
										    "author":$("#currentUserNameWork").val(),
										    "notes":Dict.val("filenamewo_successfully_uploaded")+item
										}
								};
								workOrder.service.insertJournals(msg,function(result){
									
									},function(error){
										alert(Dict.val("wo_data_error"));
									});
						});
						}
				    },function(error){
				    	alert(Dict.val("wo_data_error"));
				    });
				
				},
				uploadingfile:function(){

					var arrp = $("#attachment_files").find("input[name='attachment']");
					
					if(arrp.length < 3 ){
						var attachment = $("#attachment").val();
						var attachmentarray=attachment.split(".");
//						alert(attachmentarray.length);
//						var str1 = attachment.substring(attachment.indexOf("."),attachment.length);
						var str1 = "."+attachmentarray[attachmentarray.length-1];
//						alert("."+attachmentarray[attachmentarray.length-1]);
						if(workOrder.ContentTypeO[str1]){
							var flag = true;
							$(arrp).each(function(index,item){
								var fn = $(item).attr("attachmentName");
								if(fn == attachment){
									flag = false;
									return false;
								}
							});
							if(flag){
								if(attachment.length > 0){
							    	$("#tipFile2upload").removeClass("onError").html("");
									var options = { 
								            data: {},
								            type : "POST",
								            dataType:  'json',
								            timeout  : 1800000,
								            async:false,
								            success: function(rs) {	
								            	if(rs.successFlag == '2'){
								            		$("#tipFile2upload").addClass("onError").html(Dict.val("wo_image_size_more_2M"));
								            	}else if(rs.successFlag == "1"){
								            		$("#tipFile2upload").removeClass("onError").html("");
								            		var str = attachment.substring(attachment.indexOf("."),attachment.length);
								            		var date = new Date();
								            	    var filename = "CN"+ date.getTime()+str;
								            	    var options = { 
								            	            data: { "objectName1":filename},
								            	            type : "POST",
								            	            dataType:  'json',
								            	            timeout  : 1800000,
								            	            success: function(rs) {
								            	            	if(rs){
								            	            		var temp = workOrder.countDiv;
								            	            		var tempName = attachment;
								            	            		if(tempName.length > 20){
								            	            			tempName = tempName.substring(0,6)+"....."+tempName.substring(tempName.length-9,tempName.length);
								            	            		}
								            	            		  var fileSpan = "<div id='divA_"+workOrder.countDiv+"'" +
								            	            		  		"style='background:#eee;padding:5px 10px;margin-bottom:5px;'><span title='"+attachment+"'>" +tempName+
								            	            		  		"</span><br><input type='text' style='width:258px;'" +
								            	            		  		"attachmentToken='"+rs.upload.token+"' name='attachment' " +
								            	            		  		"attachmentContentType='" +workOrder.ContentTypeO[str]+"'"+
								            	            		  		"attachmentName='"+attachment+"' placeholder='附件描述'/>" +
								            	            		  				"<a class='icon-remove fr' title='删除上传图片'  style='margin-top:-51px;cursor:pointer;' id='attS_"+workOrder.countDiv
								            	            		           +"'></a>" +
								            	            		           		"</div>";
								            	            		  
								            	                	  $("#attachment_files").append(fileSpan);
								            	                	 // $("#divA_"+workOrder.countDiv).append("<a class='icon-remove btn' id='attS_"+workOrder.countDiv+"'></a>");
								            	                	  $("#attS_"+temp).unbind("click").click(function(){
								          								$("#divA_"+temp).remove();
								          							});
								            	                	  workOrder.countDiv++;
								            	            	}else{
								            	            		$("#tipFile2upload").addClass("onError").html(Dict.val("wo_image_upload_failed"));
								            	            	}
								            	            	
								            	    	    },			            	
								            	            error    : function() {
								            	    		}
								            	            };
								            	    var ctx = $("#ctx").val();
								            	     $("#createForm").attr("action",ctx+"/pr/uploadR");
								            	     $("#createForm").ajaxSubmit(options);
								            	}						            	
								    	    },			            	
								            error    : function() {
								            	
								    		}
								    }; 
								    var ctx = $("#ctx").val();
								    $("#createForm").attr("action",ctx+"/pr/indent/isObjectSizeOver2MIndent");
							        $("#createForm").ajaxSubmit(options);
							    }else{
							    	$("#tipFile2upload").addClass("onError").html(Dict.val("common_please_select_file"));
							    }
							}else{
								$("#tipFile2upload").addClass("onError").html(Dict.val("wo_you_can_not_upload_the_same_file"));
							}
						}else{
							$("#tipFile2upload").addClass("onError").html(Dict.val("wo_upload_attachment_format"));
						}
					}else{
						$("#tipFile2upload").addClass("onError").html(Dict.val("wo_upload_up_to_three_annexes"));
					}
			
				},
				uploadingfileUpdate:function(){
					var arrp = $("#attachment_filesUpdate").find("input[name='attachment']");
					if(arrp.length < 3 ){
						var attachment = $("#attachmentUpdate").val();
						var str1 = attachment.substring(attachment.indexOf("."),attachment.length);
						if(workOrder.ContentTypeO[str1]){
							var flag = true;
							$(arrp).each(function(index,item){
								var fn = $(item).attr("attachmentName");
								if(fn == attachment){
									flag = false;
									return false;
								}
							});
							if(flag){
								 if(attachment.length > 0){
								    	$("#tipFile2uploadUpdate").removeClass("onError").html("");
										var options = { 
									            data: {},
									            type : "POST",
									            dataType:  'json',
									            timeout  : 1800000,
									            async:false,
									            success: function(rs) {	
									            	if(rs.successFlag == '2'){
									            		$("#tipFile2uploadUpdate").addClass("onError").html(Dict.val("wo_image_size_more_2M"));
									            	}else if(rs.successFlag == '1'){
									            		$("#tipFile2uploadUpdate").removeClass("onError").html("");
									            		var str = attachment.substring(attachment.indexOf("."),attachment.length);
									            		var date = new Date();
									            	    var filename = "CN"+ date.getTime()+str;
									            	    var options = { 
									            	            data: { "objectName1":filename},
									            	            type : "POST",
									            	            dataType:  'json',
									            	            timeout  : 1800000,
									            	            success: function(rs) {
									            	            	if(rs){
									            	            		var temp = workOrder.countDiv;
									            	            		var tempName = attachment;
									            	            		if(tempName.length > 20){
									            	            			tempName = tempName.substring(0,6)+"....."+tempName.substring(tempName.length-9,tempName.length);
									            	            		}
									            	                	  var fileSpan = "<div id='divAU_"+workOrder.countDiv+"' style='background:#eee;padding:5px 10px;margin-bottom:5px;margin-top:10px;width:480px;'><span title='"+attachment+"'>" +tempName+
								            	            		  		"</span><br><input type='text' " +
								            	            		  		"attachmentToken='"+rs.upload.token+"' name='attachment' " +
								            	            		  		"attachmentContentType='" +workOrder.ContentTypeO[str]+"'"+
								            	            		  		"attachmentName='"+attachment+"' placeholder='附件描述' style='width:263px;'/><a class='icon-remove fr' title='删除上传图片' style='margin-top:-51px;cursor:pointer;' id='attSU_"+workOrder.countDiv
								            	            		           +"'></a></div>";
								            	            		  
								            	                	  $("#attachment_filesUpdate").append(fileSpan);
								            	                	 // $("#divA_"+workOrder.countDiv).append("<a class='icon-remove btn' id='attS_"+workOrder.countDiv+"'></a>");
								            	                	  $("#attSU_"+temp).unbind("click").click(function(){
								          								$("#divAU_"+temp).remove();
								          							});
								            	                	  workOrder.countDiv++;
									            	            	}else{
									            	            		$("#tipFile2uploadUpdate").addClass("onError").html(Dict.val("wo_image_upload_failed"));
									            	            	}
									            	            	
									            	    	    },			            	
									            	            error    : function() {
									            	    		}
									            	            };
									            	    var ctx = $("#ctx").val();
									            	     $("#fileUpdateForm").attr("action",ctx+"/pr/uploadR");
									            	     $("#fileUpdateForm").ajaxSubmit(options);
									            	}						            	
									    	    },			            	
									            error    : function() {
									            	
									    		}
									    }; 
									    var ctx = $("#ctx").val();
									    $("#fileUpdateForm").attr("action",ctx+"/pr/indent/isObjectSizeOver2MIndent");
								        $("#fileUpdateForm").ajaxSubmit(options);
								    }else{
								    	$("#tipFile2uploadUpdate").addClass("onError").html(Dict.val("common_please_select_file"));
								    }
							}else{
								$("#tipFile2uploadUpdate").addClass("onError").html(Dict.val("wo_you_can_not_upload_the_same_file"));
							}
						}else{
							$("#tipFile2uploadUpdate").addClass("onError").html(Dict.val("wo_upload_attachment_format"));
						}
					}else{
						$("#tipFile2uploadUpdate").addClass("onError").html(Dict.val("wo_upload_up_to_three_annexes"));
					}
				
				},
				closeWork:function(){

					var woder = 
							{
							      "id":$("#workOrderId").val(),
								  "issue": {
								    "status_id":13
								  }

					};
					$("#workOrderList").removeClass("hide");
					$("#allWorkOrder").addClass("hide");
					workOrder.service.closeWorkOrder(woder,function(result){
						workOrder.refresh();
					},function(error){
						alert(Dict.val("wo_data_error"));
					});
					
				
				},
				workListOrder:function(){
					$("#workOrderList").removeClass("hide");
					$("#allWorkOrder").addClass("hide");
					workOrder.refresh();
				},
				getConfig:function(){
					var value = "";
					$.ajax({
						"url" : CONTEXT_PATH+"/ajax/workOrder.json",
						"type" : "GET",
						"dataType" : "json",
						"async" : false,
						"success" : function(result) {
							value = result;
						},
						"error" : function(result) {
							alert();
						}		
					});
					return value;
				},
				"emptyBack":function(){
					$("#noteBack").val("");
					$("#attachment_filesUpdate").empty();
					$("#attachmentUpdate").val("");
					workOrder.countDiv = 0;
				}
				
};