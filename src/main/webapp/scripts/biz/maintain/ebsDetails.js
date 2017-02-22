var ebsDetail = {
		ebsId : '',
		ownUserId : '',
		hostDatatable : null,
		volumeState: [],
//		state : '',
		init : function(insId) {
			ebsDetail.volumeState = {
					"pending" : "待审核",
					"reject" : "审核拒绝",
					"opening" : "正在开通",
					"changing" : "正在变更",
					"deleting" : "正在销毁",
					"deleted" : "已销毁",
					"running" : "未挂载"	,// 就绪
					"using" : "已挂载",
					"attaching" : "正在挂载",
					"unattaching" : "正在卸载"
			};			
			
			ebsDetail.ebsId = insId;
			ebsDetail.initEbsById(insId);
			//挂载
			$("#ebsLoad_save").bind('click',function(e){
				ebs.attachEbs(ebsDetail.ebsId,ebs.getCheckedHostIds());
			});
			//修改
			$("#ebsAmend_save").bind('click',function(e){
				var modName = $("#modInsName").val();
				var modComment = $("#modComment").val();
				ebs.modifyEbs(ebsDetail.ebsId,modName,modComment);
			});		

			//扩容
			$("#ebsExpand_save").bind('click',function(e){
				var storageSize = $("#amount1").val();
				
				ebs.modifyEbsStorageSize(ebsDetail.ebsId,storageSize);
			});		
			//关联资源
			ebsDetail.getRelateHosts();
		},
		getRelateHosts : function(){
			var params = {
					"diskInstanceInfoId" : ebsDetail.ebsId,				
					"state" : 2
			};
			Dcp.biz.apiRequest("/instance/ebs/describeIris", params, function(data) {
				if (data.code != "0") {
					$.growlUI("提示", "查询用户已经购买的运行状态的关联资源发生错误：" + data.msg); 
				} else {
					var array = data.data;
					if(array == null || array.length == 0) {
						return;
					}else{
						var dom = "<tbody>";
						$(array).each(function(i) {							
							dom += "<tr>"
									+"<th>"+array[i].vmInstanceInfoName+"</th>"
									+"<td>"+array[i].id+"</td>"
									+"</tr>";
						});
						dom += "</tbody>";
						$("#relateHosts").append(dom);
					}
				}
			});
		},

		initEbsById : function(ebsId){
			Dcp.biz.apiRequest("/instance/ebs/describeEbsDetail", {"id":ebsId}, function(data) {
				if (data.code != "0") {
					$.growlUI("提示", "查询资源的详细信息发生错误：" + data.msg); 
				} else {
					var detail = data.data;
					$("#ebsName_bread").html(detail.instanceName);				
					$("#ebsName").html(detail.instanceName);
//					ebsDetail.state = detail.state;
					$("#state").html(ebsDetail.volumeState[detail.state]);
//					$("#hostName").html("待讨论");
					$("#comment").html(detail.comment);
					var text = new Date(detail.createDate).toLocaleString();
					$("#createDate").html(text);
					$("#storageSize").html(detail.storageSize);
					$("#used").html(0);
					$("#notUsed").html(detail.storageSize);
					ebsDetail.ownUserId = detail.ownUserId;				
				}

			});			
		},
		getInstancesToDetach : function(){
			var params = {
					"diskInstanceInfoId" : ebsDetail.ebsId,				
					"state" : 2
			};
			Dcp.biz.apiRequest("/instance/ebs/describeIris", params, function(data) {
				if (data.code != "0") {
					$.growlUI("提示", "查询用户已经购买的运行状态的资源发生错误：" + data.msg); 
				} else {
					if(null != ebsDetail.hostDatatable){
						ebsDetail.hostDatatable.updateData(data.data);
					} else {
						ebsDetail.hostDatatable =  new com.skyform.component.DataTable();
						ebsDetail.detachDataTable(data.data);
					}
				}
			});
	},
	detachDataTable : function(data) {
		ebsDetail.hostDatatable.renderByData("#ebsUnloadTable", {
			"data" : data,
			"columnDefs" : [
			     {title : "<input type='checkbox' id='checkAll'>", name : "vmInstanceInfoId"},
			     {title : "ID", name : "vmInstanceInfoId"},
			     {title : "名称", name : "vmInstanceInfoName"}
			],
			"onColumnRender" : function(columnIndex,columnMetaData,columnData) {
				 var text = columnData[''+columnMetaData.name] || "";
				 if(columnIndex ==0) {
					 text = '<input type="checkbox" value="'+text+'">';
				 }
				 return text;
			}
		});
		
	},
	//解挂弹性块存储
	detachEbs : function(id) {
		var checkedArr = $("#ebsUnloadTable tbody input[type='checkbox']:checked");
		var volumeNames = "";
		var volumeIds = [];
		$(checkedArr).each(function(index, item) {
			var tr = $(item).parents("tr");
			volumeNames += $($("td", tr)[2]).text();
			var id = $("input[type='checkbox']", $("td", tr)[0]).val();
			volumeIds.push(id);
			if (index < checkedArr.length - 1) {
				volumeNames += ",";
			}
		});
		
		var _hostIds = volumeIds.join(",");
		
				var params = {
						"id" : ebsDetail.ebsId,
						"hostIds": _hostIds
				};
				Dcp.biz.apiRequest("/instance/ebs/detachEbsVolumes", params, function(data){
					if(data.code == "0"){
						$.growlUI("提示", "解挂弹性块存储成功！"); 
						$("#ebsUnload").modal("hide");
					} else {
						$.growlUI("提示", "解挂弹性块存储发生错误：" + data.msg); 
					}
				});
	}
		
		
};


function calc() {
		var count = parseInt($("#amount01").val()),capacity=parseInt($("#amount").val());	
		$("#span1").html(capacity/100);
		$("#span2").html(count);
		$("#span3").html((count*capacity/100).toFixed(1));
		$("#span4").html((count*capacity*7.2).toFixed(1));		
	};
	function calcChange(){
		var count1 = parseInt($("#amount01").val()),capacity1=parseInt($("#amount1").val());
		$("#span5").html(capacity1/100);
		$("#span6").html(count1);
		$("#span7").html((count1*capacity1/100).toFixed(1));
		$("#span8").html((count1*capacity1*7.2).toFixed(1));	
	};
	$(function() {		
		$(".dropdown-menu").bind('mouseover',function(){
			inMenu = true;
		});
		
		$(".dropdown-menu").bind('mouseout',function(){
			inMenu = false;
		});
		$(".dropdown-menu li").bind('click',function(e){
			handleLi($(this).index());					
		});	
	
		$( "#slider-range-min" ).slider({
			range: "min",
			value: 10,
			min: 10,
			max: 500,
			step: 10,
			slide: function( event, ui ) {
				var sp = $("#amount01").val();
				$("#amount").val(ui.value);
				calc();
			}
		});
		
		
		
		$( "#amount" ).val($( "#slider-range-min" ).slider( "value" ) );
		
		$("#amount01").bind("blur",function(){
			calc();
		});
		var realValue;
		$("#amount").bind("keydown",function(e){
			if (e.which == 13) {
				e.preventDefault(); 
				realValue = parseInt(parseInt($("#amount").val())/10) * 10 ;
				$( "#slider-range-min" ).slider( "option", "value", realValue);
				$("#amount").val(realValue);			
			}
		});
		$("#amount").bind("blur",function(e){
				e.preventDefault(); 
				realValue = parseInt(parseInt($("#amount").val())/10) * 10 ;
				$( "#slider-range-min" ).slider( "option", "value", realValue);
				$("#amount").val(realValue);			
		});
		
		
		$( "#slider-range-min1" ).slider({
			range: "min",
			value: 10,
			min: realValue,
			max: 500,
			step: 10,
			slide: function( event, ui ) {			
				$("#amount1").val(ui.value);
				var sp = $("#amount01").val();
				calcChange();
			}
		});
		$( "#amount1" ).val($( "#slider-range-min1" ).slider( "value" ) );
		$("#amount1").bind("keydown",function(e){
			if (e.which == 13) {
				e.preventDefault();
				var realValue1 = parseInt(parseInt($("#amount1").val())/10) * 10 ;
				$( "#slider-range-min1" ).slider( "option", "value", realValue1);
				$("#amount1").val(realValue1);			
			}
		});
		$("#amount1").bind("blur",function(e){
				e.preventDefault();
				var realValue1 = parseInt(parseInt($("#amount1").val())/10) * 10 ;
				$( "#slider-range-min1" ).slider( "option", "value", realValue1);
				$("#amount1").val(realValue1);			
		});
		//解挂
		$("#ebsUnload_save").bind('click',function(e){
			ebsDetail.detachEbs();
		});
	});
	
	
	var inMenu;
	$(function(){
			$("#contextMenu").bind('mouseover',function(){
				inMenu = true;
			});
		
			$("#contextMenu").bind('mouseout',function(){
				inMenu = false;
			});
			$("#contextMenu li").bind('click',function(e){
				$("#contextMenu").hide();
				handleLi($(this).index());					
			});
			$("body").bind('mousedown',function(){
				if(!inMenu){
					$("#contextMenu").hide();
				}
			});
	
	
		$("tbody tr").mousedown(function(e) {  
		    if (3 == e.which) {  
		             document.oncontextmenu = function() {return false;};  
		             var screenHeight = $(document).height();
		             var top = e.pageY;
		             if(e.pageY>=screenHeight/2 ) {
		             	top = e.pageY-$("#contextMenu").height();
		             }
		             $("#contextMenu").hide();  
		             $("#contextMenu").attr("style","display: block; position: absolute; top:"  
		             + top  
		             + "px; left:"  
		             + e.pageX  
		             + "px; width: 180px;");  
		             $("#contextMenu").show();  
		             e.stopPropagation();
		     } 
		});  
		$("#selectAllHostComputer").click(function(event){
			var checked = $(this).attr("checked")||false;                                                                                                                                    
			$("#thostcomputer1 input[type='checkbox']").attr("checked",checked);
		}); 
		$("#selectAllHCom").click(function(event){
			var checked = $(this).attr("checked")||false;
			$("#thostcomputer2 input[type='checkbox']").attr("checked",checked);
		});
		
		$("#selectAllDisk").click(function(event){
			var checked = $(this).attr("checked")||false;                                                                                                                                    
			$("#thc1 input[type='checkbox']").attr("checked",checked);
		}); 
		$("#selectAllUnloadDisk").click(function(event){
			var checked = $(this).attr("checked")||false;
			$("#thc2 input[type='checkbox']").attr("checked",checked);
		});
		
	});

   	 function handleLi(index){
		if(index==0){
			var oldInstanceName = $("#ebsName").text();
			var oldComment = $("#comment").text();
			$("#modInsName").val(oldInstanceName);
			$("#modComment").val(oldComment);
			
//			$("#myModalAmend").modal("show");
		}
		else if(index==1){				
			if($("#state").text() == '未挂载'){
				$("#modifyEbsStorageSizeModal").modal("show");
			}else{
				$.growlUI("提示", "扩容只能对未挂载的弹性块存储进行操作"); 
			}
			
//			$("#myModalExpand").modal("show");
		}
		else if(index==2){
			//显示用户可以挂载的资源
			ebs.getInstancesToAttach(ebsDetail.ebsId,ebsDetail.ownUserId);					
//			$("#myModalLoad").modal("show");
		}
		else if(index==3){
			ebsDetail.getInstancesToDetach();
//			$("#myModalUnLoad").modal("show");
		}			
	} 	
	