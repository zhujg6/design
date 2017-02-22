//当前刷新实例的类型为子网
window.currentInstanceType='subvScan';
window.Controller = {
		init : function(){
			ScanResult.init();
		},
		refresh : function(){
		}
	}
var ScanResult = {
		  data : [],
		  dtTable : null,
		  newFormModal : null,
		  ContextMenuScanResult : null,
		  scope : "scanResult",
		  init : function(){
		    ScanResult.refreshData();
		    ScanResult._bindAction();
		  },
		  
	  	  ///////////////////////////////////////////////////////////////////////////
		  //	Actions  start
		  ///////////////////////////////////////////////////////////////////////////
		  
		  refreshData : function(){
			  if (ScanResult.dtTable)
				  ScanResult.dtTable.container
							.find("tbody")
							.html(
									"<tr ><td colspan='7' style='text-align:center;'><img src='"
											+ CONTEXT_PATH
											+ "/images/loader.gif'/><strong>"+Dict.val("common_retrieving_data_please_wait")+"</strong></td></tr>");
	//		  var condation={"pool":$("#pool").val()};
			  var condation={};
			  
			  ScanResult.scanResultService.describeScannerResult(condation,function onSuccess(data){
	//		  ScanResult.scanResultService.describeVMHealthCondition(condation,function onSuccess(data){
//				  data=[
//				          {
//				              "id":12406115,
//				              "instanceName":"34rr_12406115",
//				               "fileName":"34rr_12406115",
//				              "resultState":"opening",
//				              "createDate":1455692578000
//				          },
//				          {
//				              "id":12406116,
//				              "instanceName":"34rr_12406115",
//				               "fileName":"34rr_12406115",
//				              "resultState":"running",
//				              "createDate":1455692578000
//				          }
//				      ];

				ScanResult.data=data;
				if(ScanResult.data.length>0){
				//	ScanResult.getLbHealthyRelation(ScanResult.data[0].lbId, ScanResult.data[0].lbHealthId);
					ScanResult.showDetails(ScanResult.data[0]); 
				}
		    	ScanResult._refreshDtTable(data);
		    	ScanResult.onInstanceSelected();
		    },function onError(msg){
		    	$.growlUI("提示", "查询扫描结果失败：" + msg); 
		    });
		  },
		  
		  //下载
		  downResult:function(){
			  var row = $("#scan_result_instanceTable tbody input[type='checkbox']:checked").closest("tr");
			  var fileType=row.attr("fileType");
			  var filePath=row.attr("filePath");
			  var fileExtensions=row.attr("fileExtensions");
			  if(fileType==null ||fileType==""|| filePath==null||filePath==""){
				  $.growlUI("提示", "扫描结果文件不存在"); 
				  return;
			  }
			  var vmName=row.attr("vmName");
			  if(vmName==null || vmName==undefined){
				  vmName='';
			  }
			 // var param ={"fileType":fileType,"filePath":filePath,"aliasName":"漏洞扫描报告","fileSuffix":fileExtensions};
//			  ScanResult.scanResultService.downloadShareFile(param,function onSuccess(data){
//			  },function onError(msg){
//			    	$.growlUI("提示", "下载失败：" + msg); 
//			    });
			    
				$("#exportFormAdd #fileType").val(fileType);
				$("#exportFormAdd #filePath").val(filePath);
				$("#exportFormAdd #fileSuffix").val(fileExtensions);
				$("#exportFormAdd #aliasName").val("漏洞扫描报告_"+vmName);
		        window.open("","_self");
		        $("#exportFormAdd").submit();
//			    var data = JSON.stringify(desktopCloud.instances);	 
//				$("#exportFormAdd #paramAdd").val(data);	
//		        window.open("","newWinAdd");
//		        $("#exportFormAdd").submit();
			  
		  },
		  showDetails : function(instance){
			  if(!ScanResult.data || ScanResult.data.length < 1) return;
			  if(!instance) {
				  instance = ScanResult.data[0];
			  }
//			  $("div[scope='"+ScanResult.scope+"'] .detail_value").each(function (i,item){
//				  var prop = $(item).attr("prop");
//				  var value = instance['' + prop] || "---";
//				  if(prop == "state") {
//					  value = com.skyform.service.StateService.getState("common",value);
//				  } 
//				  $(item).html(value);
//			  });
			  $("#subnet_logs").empty();
//			  com.skyform.service.LogService.describeLogsUIInfo(instance.id);
			  com.skyform.service.LogService.describeLogsInfo(instance.id,function(logs){
				  $("#subnet_logs").empty();
					$(logs).each(function(i,v){
						var desc = "";
						if(v.description){
							if(v.description != ""){
								desc = "("+v.description+")";
							}						
						}
						var _name = "";
						if(v.subscription_name){
							_name = v.subscription_name;
						}
						$("<li class='detail-item'><span>" + v.createTime + "  " +v.subscription_name+"  "+ v.controle +desc+ "</span></li>").appendTo($("#subnet_logs"));
						  });
			  },function onError(msg){
//					$.growlUI("提示", "查询弹性块存储日志发生错误：" + msg); 
				});
		  },
		  ///////////////////////////////////////////////////////////////////////////
		  //	Actions  end
		  ///////////////////////////////////////////////////////////////////////////
		  
		  _bindAction : function(){
				$("div[scope='"+ScanResult.scope+"'] #toolbar4scanresult .actionBtn").unbind("click").click(function(){
					if($(this).hasClass("disabled")) return;
					var action = $(this).attr("action");
					ScanResult._invokeAction(action);
				});
		  },
			
		  _invokeAction : function(action){
				var invoker = ScanResult["" + action];
				if(invoker && typeof invoker == 'function') {
					invoker();
				}
		  },
		  
		  _refreshDtTable : function(data) {
		    if(ScanResult.dtTable) {
		      ScanResult.dtTable.updateData(data);
		    } else {
		      ScanResult.dtTable = new com.skyform.component.DataTable();
		      ScanResult.dtTable.renderByData("#scan_result_instanceTable",{
		    	pageSize : 5,		        
		        data : data,
		        onColumnRender : function(columnIndex,columnMetaData,columnData){
		          if(columnMetaData.name=='ID') {
					  return columnData.id;
				  } else if(columnMetaData.name=="id") {
		              return "<input type='checkbox' value='" + columnData["id"] +"'/>" ;
		          } else if (columnMetaData.name == 'resultState') {
		        	  return com.skyform.service.StateService.getState("vScan",columnData.resultState||columnData);
		          }else if(columnMetaData.name == 'createDate'){
					  var text = '';
					  if(columnData.createDate == '' || columnData.createDate == undefined){
					  	return text;
					  }
					  try {
							var obj = eval('(' + "{Date: new Date(" + columnData.createDate + ")}" + ')');
							var dateValue = obj["Date"];
							text = dateValue.format('yyyy-MM-dd hh:mm:ss');
						} catch (e) {
					    }
					  return text;
		          }else {
		        	  return columnData[columnMetaData.name];
		          }
		        },
		        afterRowRender : function(rowIndex,data,tr){
		          tr.attr("id",data.id);
		          tr.attr("createDate",data.createDate);
		          tr.attr("resultState",data.resultState);
		          tr.attr("fileName",data.fileName);
		          tr.attr("instanceName",data.instanceName);
		          tr.attr("fileType",data.fileType);
		          tr.attr("filePath",data.filePath);
		          tr.attr("fileExtensions",data.fileExtensions);
		          tr.attr("vmName",data.vmName);
		          
		          tr.find("input[type='checkbox']").click(function(){
		        	 ScanResult.onInstanceSelected(); 
		          });
		          
		          tr.unbind("click").click(function(){
		        //	 ScanResult.getLbHealthyRelation(data.lbId,data.lbHealthId);
		        	 ScanResult.showDetails(data); 
		          });
		        },
		        afterTableRender : ScanResult._afterDtTableRender
		      });
		      
		      ScanResult.dtTable.addToobarButton($("#toolbar4scanresult"));
		      ScanResult.dtTable.enableColumnHideAndShow("right");
		    }
		  },
		  
		  _afterDtTableRender : function(){
		    var check = $("input#scanResultCheckAll[type='checkbox']").unbind("click").click(function(e){
		      e.stopPropagation();
		      var check = $(this).attr("checked");
		      ScanResult.checkAll(check);
		    });
		    if(!ScanResult.ContextMenuScanResult) {
		    	
		      ScanResult.ContextMenuScanResult = new ContextMenuScanResult({
		    	container : "#contextMenuPrivateNet",
		        beforeShow : function(tr){
		          ScanResult.checkAll(false);
		          tr.find("input[type='checkbox']").attr("checked",true);
		        },
		        afterShow : function(tr) {
		          ScanResult.onInstanceSelected({
//		            instanceName : tr.attr("instanceName"),
		            id : tr.attr("id"),
		            state : tr.attr("resultState")
		          });
		        },
		        onAction : function(action) {
		        	ScanResult._invokeAction(action);
		        },
		        trigger : "#scan_result_instanceTable tr"
		      });
		    } else {
		      ScanResult.ContextMenuScanResult.reset();
		    }
		    ScanResult.showDetails();
		  },
		  
		  checkAll : function(check){//全选触发的操作
		    if(check) $("#scan_result_instanceTable tbody input[type='checkbox']").attr("checked",true);
		    else $("#scan_result_instanceTable tbody input[type='checkbox']").removeAttr("checked");
		    ScanResult.onInstanceSelected(false);
		  },
		  
		  onInstanceSelected : function(selectInstance){//单选一个触发的操作
		    var allCheckedBox = $("#scan_result_instanceTable tbody input[type='checkbox']:checked");
		    var rightClicked = selectInstance?true:false;
		    var resultState = $(allCheckedBox[0]).parents("tr").attr("resultState");
		    
			if(selectInstance) {
				resultState = selectInstance.state;
			}
		    var oneSelected = allCheckedBox.length == 1;
		    var hasSelected = allCheckedBox.length > 0;
		    $("div[scope='"+ScanResult.scope+"'] .operation").addClass("disabled");
		    $("div[scope='"+ScanResult.scope+"'] .operation").each(function(index,operation){
		      var condition = $(operation).attr("condition");
		      var action = $(operation).attr("action");
		      var enabled = true;
		      eval("enabled=("+condition+")");
		      if(enabled) {
		        $(operation).removeClass("disabled");
		      } else {
		        $(operation).addClass("disabled");
		      }
		      ScanResult._bindAction();
		    });
		    if(rightClicked) {
		      ScanResult.instanceName = selectInstance.instanceName;
		      ScanResult.selectedInstanceId = selectInstance.id; 
		    } else {
		      for ( var i = 0; i < allCheckedBox.length; i++) {
		        var currentCheckBox = $(allCheckedBox[i]);
		        if (i == 0) {
		          ScanResult.instanceName = currentCheckBox.parents("tr").attr("name");
		          ScanResult.selectedInstanceId = currentCheckBox.attr("value");
		        } else {
		          ScanResult.instanceName += "," + currentCheckBox.parents("tr").attr("name");
		          ScanResult.selectedInstanceId += "," + currentCheckBox.attr("value");
		        }
		      }
		    }
		  },
		  scanResultService : com.skyform.service.scanService
};

var ContextMenuScanResult = function(options){
	var _options = {
		container : options.container || $("#contextMenuPrivateNet"),
		onAction : options.onAction || function(action){},
		trigger  : options.trigger || $("body"),
		beforeShow : options.beforeShow || function(){},
		afterShow : options.afterShow || function(){},
		beforeHide : options.beforeHide || function(){},
		afterHide : options.afterHide || function() {}
	};
	
	
	this.setTrigger = function(trigger) {
		_options.trigger = trigger;
		_init();
	};
	
	this.reset = function(){
		_init();
	};
	this.inMenu = false;
	
	var _init = function(){
		_options.container = $(_options.container);
		_options.container.hide();
		$(_options.trigger).unbind("mousedown").bind("mousedown",function(e) {
			if (3 == e.which) {
				document.oncontextmenu = function() {
					return false;
				}
				var screenHeight = $(document).height();
				var top = e.pageY;
				if (e.pageY >= screenHeight / 2) {
					top = e.pageY - _options.container.height();// 如果鼠标所在位置在屏幕高度中线的下半部分，则弹出框往上弹出
				}
				_options.container.hide();
				_options.container.attr(
						"style",
						"display: block; position: absolute; top:"
								+ top + "px; left:" + e.pageX
								+ "px; width: 180px;");
				_options.beforeShow($(this));
				_options.container.show();
				e.stopPropagation();
				_options.afterShow($(this));

			} else {
				_options.container.hide();
			}
			
		});
		var self = this;
		_options.container.unbind("mouseover").bind('mouseover', function() {
			self.inMenu = true;
		});

		_options.container.unbind("mouseout").bind('mouseout', function() {
			self.inMenu = false;
		});
		_options.container.find("li").unbind("mousedown").bind('mousedown', function(e) {
			_options.container.hide();
			if (!$(this).hasClass("disabled")){
				var action = $(this).attr("action");
				if(action) _options.onAction(action);
			}
		});
		$("body").unbind('mousedown').bind('mousedown', function() {
			if (!self.inMenu) {
				_options.beforeHide();
				_options.container.hide();
				_options.afterHide();
			}
		});
	};
	
	_init();
};
