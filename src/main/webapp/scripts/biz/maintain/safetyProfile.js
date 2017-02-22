//10.10.242.180

window.currentInstanceType = 'sp';
window.Controller = {
		
	init : function() {
		safetyProfile.init();
		safetyProfile._moreOpAction();
		com.skyform.service.dpService.cloudSecurityStatistics(function onSuccess(data){
			initHightcharts(data.data);
		},function onError(msg){
			//console.info(msg);
		});
	},
	refresh : function() {
	}
}
var ConfirmWindow = new com.skyform.component.Modal("confirmWindow", "", "", {
	buttons : [
			{
				name : '确定',
				attrs : [ {
					name : 'class',
					value : 'btn btn-primary'
				} ],
				onClick : function() {
					if (ConfirmWindow.onSave
							&& typeof ConfirmWindow.onSave == 'function') {
						ConfirmWindow.onSave();
					} else {
						ConfirmWindow.hide();
					}
				}
			}, {
				name : '取消',
				attrs : [ {
					name : 'class',
					value : 'btn'
				} ],
				onClick : function() {
					ConfirmWindow.hide();
				}
			} ]
}).setWidth(400).autoAlign().setTop(100);
var ContextMenu = function(options) {
	var _options = {
		container : options.container || $("#contextMenu"),
		onAction : options.onAction || function(action) {
		},
		trigger : options.trigger || $("body"),
		beforeShow : options.beforeShow || function() {
		},
		afterShow : options.afterShow || function() {
		},
		beforeHide : options.beforeHide || function() {
		},
		afterHide : options.afterHide || function() {
		}
	};

	this.setTrigger = function(trigger) {
		_options.trigger = trigger;
		_init();
	};

	this.reset = function() {
		_init();
	};
	this.inMenu = false;

	var _init = function() {
		_options.container = $(_options.container);
		_options.container.hide();
		$(_options.trigger).unbind("mousedown").bind(
				"mousedown",
				function(e) {
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
						_options.container.attr("style",
								"display: block; position: absolute; top:"
										+ top + "px; left:" + e.pageX
										+ "px; width: 180px;");
						_options.beforeShow($(this));
						_options.container.show();
						e.stopPropagation();
						_options.afterShow($(this));

					}
				});
		var self = this;
		_options.container.unbind("mouseover").bind('mouseover', function() {
			self.inMenu = true;
		});

		_options.container.unbind("mouseout").bind('mouseout', function() {
			self.inMenu = false;
		});
		_options.container.find("li").unbind("mousedown").bind('mousedown',
				function(e) {
					_options.container.hide();
					if (!$(this).hasClass("disabled")) {
						var action = $(this).attr("action");
						if (action)
							_options.onAction(action);
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
var safetyProfile = {	
	dtTable : null,
	datatable : new com.skyform.component.DataTable(),
	init : function() {
		safetyProfile.describeSafetyProfile();
	},
	generateTable : function(data) {
		if(safetyProfile.dtTable) {
			safetyProfile.dtTable.updateData(data);
		} else {
			safetyProfile.dtTable = new com.skyform.component.DataTable();
			safetyProfile.dtTable.renderByData(
						"#safetyProfileTable",
						{
							"data" : data,
							"pageSize" : 5,
							onColumnRender : function(columnIndex,
									columnMetaData, columnData) {
								if (columnMetaData.name == 'id') {
									return "<input type='checkbox' value='"
											+ columnData.id + "'/>";
								} else if (columnMetaData.name == 'vmId') {
									return columnData.id;
								}else if (columnMetaData.name == 'cdSwitch') {
									return com.skyform.service.dpService.getType(columnData.cdSwitch,'cdSwitch');
								}else if (columnMetaData.name == 'cfwSwitch') {
									return com.skyform.service.dpService.getType(columnData.cfwSwitch,'cfwSwitch');
								}else if (columnMetaData.name == 'caSwitch') {
									return com.skyform.service.dpService.getType(columnData.caSwitch,'caSwitch');
								}
								
								return columnData[columnMetaData.name];
							},
							afterRowRender : function(rowIndex, data, tr) {
								tr.attr("vmid",data.vmId);
								tr.click(function(){
									$("tbody input[type='checkbox']").attr("checked", false);
							        $(tr).find("input[type='checkbox']").attr("checked", true);
							        safetyProfile.onInstanceSelected();
						        });
								if(rowIndex == 0) {
									$(tr).find("input[type='checkbox']").attr("checked", true);
								}	
							},
							afterTableRender : function() {
								var firstRow = $("#safetyProfileTable tbody").find("tr:eq(0)");
								firstRow.find("td[name='id'] input[type='checkbox']").attr("checked", true);
							}
						});
		}
		
		//safetyProfile.datatable.addToobarButton("#toolbar4tb2");
	},
	describeSafetyProfile : function(state,csType) {
		if(state==null && csType==null ){
			safetyProfile.generateTable([]);
			return;
		}
		// 将自己编写的显示主机的table渲染
		com.skyform.service.dpService.cloudSecurityQuery({state:state,csType:csType},function (data) {
			safetyProfile.instances = data;
			safetyProfile.generateTable(data);
		})
	},
	showDetails:function(type){
		var vmId=safetyProfile.getCheckedArr().parents("tr").attr("vmid");
		if(vmId==null){
			$.growlUI("提示","请选择一条记录");
			return;
		}
		if(type=="cdSwitch"){
			window.location="deepPacket.jsp?code=deepPacket&&vmId="+vmId;
		}else if(type=="cfwSwitch"){
			window.location="safewall.jsp?code=safewall&&vmId="+vmId;
		}else if(type=="caSwitch"){
			window.location="antiVirus.jsp?code=antiVirus&&vmId="+vmId;
		}
	},
	getCheckedArr : function() {
		return $("#safetyProfileTable tbody input[type='checkbox']:checked");
	},
	// 按钮和更多操作 的action
	_moreOpAction : function() {
		$("#toolbar4tb2 .btn").unbind("click").click(function() {
			if ($(this).hasClass("disabled"))
				return;
			var action = $(this).attr("action");
			safetyProfile._invokeAction(action);
		});

		$(".operation").unbind("click").click(function() {
			if ($(this).hasClass("disabled"))
				return;
			var action = $(this).attr("action");
			safetyProfile._invokeAction(action);
		});
	},
	// 更多操作 的 invoke
	_invokeAction : function(action) {
		var invoker = safetyProfile["" + action];
		if (invoker && typeof invoker == 'function') {
			invoker();
		}
	},
	onInstanceSelected : function(selectInstance) {
		var allCheckedBox = $("#safetyProfileTable tbody input[type='checkbox']:checked");

		var rightClicked = selectInstance ? true : false;

		var state = $(allCheckedBox[0]).parents("tr").attr("state");
		if (selectInstance) {
			state = selectInstance.state;
		}

		var oneSelected = allCheckedBox.length == 1;
		var hasSelected = allCheckedBox.length > 0;

		$(".operation").addClass("disabled");

		$(".operation").each(function(index, operation) {
			var condition = $(operation).attr("condition");
			var action = $(operation).attr("action");
			var enabled = true;
			eval("enabled=(" + condition + ")");
			
			
			if (enabled) {
				$(operation).removeClass("disabled");
			} else {
				$(operation).addClass("disabled");
			}
			safetyProfile._moreOpAction();
		});

	}

};
var initHightcharts = function(data){
	var onList=[];
	onList.push(data.cdOnCount);
	onList.push(data.cfwOnCount);
	onList.push(data.caOnCount);
	var offList=[];
	offList.push(data.cdOffCount);
	offList.push(data.cfwOffCount);
	offList.push(data.caOffCount);
	Highcharts.setOptions({ 
	    colors: ['#787878', '#6495ED'] 
	}); 
	$('#container').highcharts({
        chart: {
            type: 'column'
        },
        title: {
            text: '云主机总数（台）：'+data.vmCount
        },
        xAxis: {
            categories: ['深度包', '防火墙', '防病毒']
        },
        yAxis: {
            allowDecimals: false,
            min: 0,
            title: {
                text: '所占比例'
            },
            labels: { 
                formatter: function() { //格式化标签名称 
                    return this.value + '%'; 
                }, 
                style: { 
                    color: '#89A54E' //设置标签颜色 
                } 
            }, 
        },
        tooltip: {
        	enabled:false,
            formatter: function() {
            	//this.point.stackTotal
                return this.series.name +': '+ Highcharts.numberFormat((this.y/this.point.stackTotal)*100,2) +'%<br/>'+'云主机个数: '+ this.y;
            }
        },
        plotOptions: {
            column: {
                stacking: 'percent',
                dataLabels:{
                enabled: true,
                align: 'center',
                //color: 'red',
                formatter: function(){
                     return this.series.name +': '+ Highcharts.numberFormat((this.y/this.point.stackTotal)*100,2) +'%<br/>'+'云主机个数: '+ this.y;
                }
                }
            },
            series: {  
            cursor: 'pointer',  
            events: {  
                click: function(e) {  
                    var state="";
                    if(e.point.series.name=="未开启"){
                    	state="off";
                    }
                    if(e.point.series.name=="已开启"){
                    	state="on";
                    }
                    if(e.point.category=='深度包'){
                    	safetyProfile.describeSafetyProfile(state, "1");
                    }else if(e.point.category=='防火墙'){
                    	safetyProfile.describeSafetyProfile(state, "2");
                    }else if(e.point.category=='防病毒'){
                    	safetyProfile.describeSafetyProfile(state, "3");
                    }
                }  
            }
            }
        },
        series: [{
            name: '未开启',
            data: offList
        }, {
            name: '已开启',
            data: onList
        }]
    });
}
