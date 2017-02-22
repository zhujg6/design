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
var DesktopBase = {
	_init : function(){
    	$("#tabsUl a").unbind("click").bind("click", function(e){
			e.preventDefault();
			$(this).tab('show');
			var href = $(e.target).attr("href");
			if(href=="#desktopCloud_content") {
				window.currentInstanceType='desktopCloud4Sijie';
				desktopCloud.init();
			} else if(href=="#desktop_dataDesk") {
				window.currentInstanceType='desktopdataDesk4Sijie';
				desktopDataDesk.init();
			} else if(href=="#desktop_manager") {
				window.currentInstanceType='desktopmanage4Sijie';
				desktopmanage.init();
			} else if(href=="#desktop_distribution") {
				window.currentInstanceType='desktopDistribution4Sijie';
				desktopDistribution.init();
			}
		});
    	$("#tabsUl a:eq(0)").click();
	}
};
window.Controller = {
		init : function(){
			DesktopBase._init();
		}
};
