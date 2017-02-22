window.currentInstanceType='backupCreate1';
window.Controller = {
		init : function(){
			BackupCreate.refreshData();
		},
		refresh : function(){
		}
	}
var ConfirmWindow = new com.skyform.component.Modal("confirmWindow","","",{
	buttons : [
	  {
		  name : '确定',
		  attrs : [{name:'class',value:'btn btn-primary '}],
		  onClick : function(){
			  if(ConfirmWindow.onSave && typeof ConfirmWindow.onSave == 'function') {
				  ConfirmWindow.onSave();
			  } else {
				  ConfirmWindow.hide();
			  }
		  }
	  },
	  {
		  name : '取消',
		  attrs : [{name:'class',value:'btn'}],
		  onClick : function(){
			  ConfirmWindow.hide();
		  }
	  }
	  ]
}).setWidth(400).autoAlign().setTop(100);
var FormWindow = new com.skyform.component.Modal("FormWindow","","",{
	afterShow : function(container){
		if(FormWindow.beforeShow && typeof FormWindow.beforeShow == 'function') {
//			container.find(".modal-footer").find(".btn-primary").addClass("hide");
			FormWindow.beforeShow(container);
		}
	},
	beforeShow : function(container){
//		console.log(container.find(".modal-footer").find(".btn-primary").remove())
		FormWindow.hideError();
	},
	buttons : [
	
	  {
		  name : '确定',
		  attrs : [{name:'class',value:'btn btn-primary'}],
		  onClick : function(){
			  if(FormWindow.onSave && typeof FormWindow.onSave == 'function') {
				  FormWindow.onSave();
			  } else {
				  FormWindow.hide();
			  }
		  }
	  },
	  {
		  name : '取消',
		  attrs : [{name:'class',value:'btn'}],
		  onClick : function(){
			  FormWindow.hide();
		  }
	  }
	  ],
	  afterHidden : function(container) {
		  window.currentInstanceType='backupCreate';
		  container.find(".modal-footer").find(".btn").show();
		  
//		  .hide();
		  FormWindow.setWidth(900).autoAlign();
	  }
}).setWidth(900).autoAlign().setTop(100);

FormWindow.showError = function(error){
	var errorInfo = $("<div class='alert alert-error' style='margin:1px;' id='form_window_error_info'><button class='close' data-dismiss='alert' type='button'>×</button>"+error+"</div>");
	$("#form_window_error_info").remove();
	$("#FormWindow").find(".modal-body").prepend(errorInfo);
},
FormWindow.hideError = function(){
	$("#form_window_error_info").remove();
}

var FormWindow1 = new com.skyform.component.Modal("FormWindow1","","",{
	afterShow : function(container){
		if(FormWindow1.beforeShow && typeof FormWindow1.beforeShow == 'function') {
//			container.find(".modal-footer").find(".btn-primary").addClass("hide");
			FormWindow1.beforeShow(container);
		}
	},
	beforeShow : function(container){
//		console.log(container.find(".modal-footer").find(".btn-primary").remove())
		FormWindow1.hideError();
	},
	buttons : [
	  {
		  name : '取消',
		  attrs : [{name:'class',value:'btn'}],
		  onClick : function(){
			  FormWindow1.hide();
		  }
	  }
	  ],
	  afterHidden : function(container) {
		  window.currentInstanceType='backupCreate';
		  container.find(".modal-footer").find(".btn").show();
		  
//		  .hide();
		  FormWindow1.setWidth(900).autoAlign();
	  }
}).setWidth(900).autoAlign().setTop(100);

FormWindow1.showError = function(error){
	var errorInfo = $("<div class='alert alert-error' style='margin:1px;' id='form_window_error_info'><button class='close' data-dismiss='alert' type='button'>×</button>"+error+"</div>");
	$("#form_window_error_info").remove();
	$("#FormWindow").find(".modal-body").prepend(errorInfo);
},
FormWindow1.hideError = function(){
	$("#form_window_error_info").remove();
}




var ContextMenu = function(options){
	var _options = {
		container : options.container || $("#contextMenu"),
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
			if (3 == e.which) {return;
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

$(function(){
	var privateNetworkInited = false;
	//
	BackupCreate.init();
	//BackupCreate.refreshData();
	$("#private_net_tab").on("show",function(){	
//		BackupCreate.refreshData();
		window.currentInstanceType='subnet';
		$("#_product").text(CommonEnum.product[window.currentInstanceType]);
		$("div.details_content[scope !='" + BackupSee.scope+"']").addClass("hide");
		$("div.details_content[scope ='" + BackupSee.scope+"']").removeClass("hide");
	});
	$("#private_net_tab").on("shown",function(){
		$("#taskName1").val("");
		$("#vmName1").val("");
		$("#backupTime1").val("");
		$("#backupTime2").val("");
		BackupSee.data=[];
		BackupSee.refreshData();
		if(!privateNetworkInited) {
		
		
			privateNetworkInited = true;
			BackupSee.tabClickFlag=true;
			BackupSee.init();
		}
	});
	
	$("#route_tab").on("show",function(){
//		BackupSee.refreshData();
		window.currentInstanceType='route';
		$("#_product").text(CommonEnum.product[window.currentInstanceType]);
		$("div.details_content[scope !='" + BackupCreate.scope+"']").addClass("hide");
		$("div.details_content[scope ='" + BackupCreate.scope+"']").removeClass("hide");
//		$("#backupCreate").trigger("click")
//		console.log($("#backupCreate").trigger("click"))
//		BackupCreate.refreshData();
		
	});
	$("#route_tab").on("shown",function(){
		
	    setTimeout(function () {

	    	BackupCreate.refreshData();

	    }, 100);
		
		
	});
//	BackupCreate._bindAction();
	ErrorMgr.init();
	
});