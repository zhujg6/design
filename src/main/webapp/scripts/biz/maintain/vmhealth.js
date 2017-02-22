window.currentInstanceType='net';
window.Controller = {
		init : function(){
		},
		refresh : function(){
		}
	}
var ConfirmWindow = new com.skyform.component.Modal("confirmWindow","","",{
	buttons : [
	  {
		  name : '确定',
		  attrs : [{name:'class',value:'btn btn-primary'}],
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
			FormWindow.beforeShow(container);
		}
	},
	beforeShow : function(container){
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
		  window.currentInstanceType='route';
		  container.find(".modal-footer").find(".btn").show();
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
$(function(){
	var privateNetworkInited = false;
	//
	Route.init();
	
	$("#private_net_tab").on("show",function(){
		$("div.details_content[scope !='" + PrivateNetwork.scope+"']").addClass("hide");
		$("div.details_content[scope ='" + PrivateNetwork.scope+"']").removeClass("hide");
	});
	$("#private_net_tab").on("shown",function(){
		if(!privateNetworkInited) {
			privateNetworkInited = true;
			PrivateNetwork.init();
		}
	});
	
	$("#route_tab").on("show",function(){
		$("div.details_content[scope !='" + Route.scope+"']").addClass("hide");
		$("div.details_content[scope ='" + Route.scope+"']").removeClass("hide");
	});
	
	ErrorMgr.init();
	
});