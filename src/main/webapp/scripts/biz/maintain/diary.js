window.currentInstanceType='diary';
window.Controller = {
	init : function(){
		$("#queryForm select").append($("<option value=''>"+Dict.val("common_all")+"</option>"));
		$.each(diary.serviceTypeToName,function(key,value){
			$("select[name='serviceType']").append($("<option value='"+key+"'>"+value+"</option>"));
		})
		diary.init();
		diary.bindEvent();
	}
}
diary = {
		serviceTypeToName : {
			"1001" : Dict.val("common_virtual_machine"),
			"1003" : Dict.val("common_load_balanc"),
			"1008" : Dict.val("nic_router"),
			"1016" : Dict.val("common_physical_machine"),
			"1013" : Dict.val("common_file_storage"),
			"1017" : Dict.val("vdisk_snapshot"),
			"1015" : Dict.val("dc_desktop_cloud"),
			"1002" : Dict.val("common_volume"),
			"1006" : Dict.val("nic_public_network"),
			"1012" : Dict.val("common_obs"),
			"1018" : Dict.val("vm_cloud_hosting_image"),
			"1009" : Dict.val("nic_subnet"),
			"1020" : Dict.val("common_disaster_resilient_block"),
			"1021" : Dict.val("common_disaster_resilient_block_backup_task"),
			"1023" : Dict.val("common_obs_backup"),
			"1024" : Dict.val("common_obs_backup_task"),
			"1025" : Dict.val("common_file_backup"),
			"1026" : Dict.val("common_file_backup_task"),
			"8211" : Dict.val("common_nic")
		},
		serviceTypeToDesc : {
			"1001" : "vm",
			"1003" : "lb",
			"1008" : "net",
			"1016" : "pm",
			"1013" : "nas2",
			"1017" : "snap2",
			"1015" : "desktopmanage",
			"1002" : "vdisk",
			"1006" : "ip",
			"1012" : "obs_new",
			"1018" : "imageMent",
			"1009" : "net",
			"1020" : "backup4vdisk",
			"1023" : "backup4osb",
			"1025" : "backup4nas",
			"8211" : "multiNIC",
			"1010" : "firewall"
		},
		counter : 1,
		getQueryCondition : function(){
			var condition = {};
			condition = $("#queryForm").serializeObject();
			return condition;
		},
		qeury : function(targetpage){
			var condition = diary.getQueryCondition();
			condition['targetPage'] = targetpage;
			condition['pagesize'] = 10;
			$.each(condition,function(key,value){
				if(value == "")
					delete condition[key];
			});
			com.skyform.service.diaryService.search(condition,function(result){
				diary.appendData(result);
			});
		},
		init : function(){
			$(".activities-items").empty();
			diary.counter = 1;
			diary.qeury(1);
		},
		bindEvent : function(){
			$( ".search" ).on("click",function(){
				diary.init();
			});
			$(".btn-load-more-activities").on("click",function(event){
				diary.qeury(++diary.counter);
				return false;
			});
			$(".availableTime").datepicker({
				showButtonPanel : true,
				changeYear : true,
				changeMonth : true,
				dateFormat : "yymmdd",
	            closeText:Dict.val("vdisk_close"),
	            nextText:Dict.val("common_next_month"),
	            prevText:Dict.val("common_previous_month"),
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
		         showMonthAfterYear: true
			});
		},
		appendData : function(result){
			$.each(result.data,function(item,index){
//				var desc = this.optDesc+"("+diary.serviceTypeToName[this.serviceType]+")";
				var desc = this.optDesc;
				var name = this.subscriptionName;
				var href = diary.serviceTypeToDesc[this.serviceType];
//				if(this.queryType == "1"){
//					desc = this.optDesc+"("+diary.serviceTypeToName[this.serviceType1]+")";
//					name = this.subscriptionName1;
//					href = diary.serviceTypeToDesc[this.serviceType1];
//				}
//				else if(this.queryType == "2"&&item.subscriptionName2 == ""){
//					desc = this.subscriptionName1||"" +"("+diary.serviceTypeToName[this.serviceType1]+ ")添加规则";
//					name = this.subscriptionName1||"";
//					href = diary.serviceTypeToDesc[this.serviceType1];
//				}
//				else if(this.queryType == "2"&&item.subscriptionName2 != ""){
//					desc = this.subscriptionName2+"("+diary.serviceTypeToName[this.serviceType2]+")绑定"+subscriptionName1||""+"("+diary.serviceTypeToName[this.serviceType1]+")";
//					name = this.subscriptionName2||"";
//					href = diary.serviceTypeToDesc[this.serviceType2];
//				}
//				else if(this.queryType == "3"){
//					desc = this.subscriptionName1||""+"("+diary.serviceTypeToName[this.serviceType1]+")绑定"+this.subscriptionName2||""+"("+diary.serviceTypeToName[this.serviceType2]+")";
//					name = this.subscriptionName1||"";
//					href = diary.serviceTypeToDesc[this.serviceType1];
//				}
				var html =  '<li><span class="job-status successful"></span>' +
							'<div class="job-details">' +
							'<a data-job-action="TerminateInstances" href="#" class="job-action">'+desc+'</a>' +
							'<span class="consumed"></span><span class="job-time">'+this.createTime+'</span>' +
							'<a data-permalink="" target="_blank" href="/portal/jsp/maintain/'+href+'.jsp?instanceName='+name+'&code='+href+'" class="id">'+name+'</a></div></li>'
				$(".activities-items").append(html);
			});
			if(Number(result.totalPage) == Number(diary.counter) || Number(result.totalPage) == 0)
				$(".btn-load-more-activities").css({"display":"none"});
			else{
				$(".btn-load-more-activities").css({"display":"block"});
			}
		}
}
