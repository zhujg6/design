/* ===================================================
 * com.skyform.component.js v0.1
 * ===================================================
 * Copyright 2013 SkyForm, Inc.
 * www.skyform.com.cn
 * ========================================================== */
window.com = window.com || {};
com.skyform = com.skyform || {};
com.skyform.component = com.skyform.component || {};
com.skyform.component.utils = com.skyform.component.utils || {
	getAllAttributes : function(ele) {
		var result = [];
		for(var i =0 ;i < ele.attributes.length; i++) {
			var attr = ele.attributes[i];
			result.push({
				name : attr.name,
				value : attr.value
			});
		}
		return result;
	},
	logger : {
		debug : function(msg) {
			if(typeof console == 'object') {
			} else if (typeof opera == 'object') {
				opera.postError(msg);
			} else if (typeof java == 'object' && typeof java.lang == 'object') {
				java.lang.System.out.println(msg);
			}
		}
	},
	restrainInputFieldToMatchIntNumber : function(input,fixFunction){
		$(input).unbind("keyup").bind("keyup",function(e){
			var value = $(this).val();
			value = value.replace(/\D/g,"");
			$(this).val(value);
		});
		
		$(input).unbind("paste").bind("paste",function(e){
			e.preventDefault();
		});
		
		if(fixFunction && typeof fixFunction == 'function' ) {
			$(input).unbind("blur").bind("blur",function(){
				fixFunction($(this));
			});
			
			$(input).unbind("change").bind("change",function(){
				fixFunction($(this));
			});
		}
	}
};
/**
 * data table for skyform 
 * This component depends on jQuery and jquery datatable. 
 */
com.skyform.component.DataTable = function() {
	this.container = null;
	this.columnDefs = [];
	this.data = [];
	this.columnShowOrHideCtrlDlg = null;
	
	this.$datatable = null;
	
	var _utils = com.skyform.component.utils;
	
	this.toolbarBtns = [];
	
	this.currentPage = 1;
	this.totalPage = 1;
	
	this.pageInfo = {
		currentPage : 1,
		totalPage : 1,
		data : []
	};
	
	this.defaultContent = null;
	
	var self = this;
	this.defaultOptions = {
		"oLanguage" : (com.skyform.component.i18n && com.skyform.component.i18n.datatable) ? com.skyform.component.i18n.datatable.Language : {
			"sLengthMenu": "Display _MENU_ records",
			"sZeroRecords": "No records to display",
			"sInfo": "Got a total of _TOTAL_ entries to show (_START_ to _END_)",
			"sInfoEmpty": "No entries to show",
			"sInfoFiltered": " - filtering from _MAX_ records",
			"sLoadingRecords": "Please wait - loading...",
		    "sSearch": "Filter records:",
		    "oPaginate": {
		    	"sFirst": "First page",
		    	"sLast": "Last page",
		    	"sNext": "Next page",
		    	"sPrevious": "Previous page"
		      },
			"column" : {
				"showOrHide" : 'Show Or Hide Columns',
				"customizeColumns" : 'Columns'
			},
			"columnCustomizePlaceHolder":"Type to filter"
		},
		//"bScrollCollapse": true,
		//"bJQueryUI": true,
        "sPaginationType": "full_numbers",
        //"sScrollY": "400px",
        //"bPaginate": false,
        "iDisplayLength": 15,
        "showPageSize" : false,
        "sScrollX": "100%",
        //"sScrollXInner": "110%",
        "bScrollCollapse": true,
        "bAutoWidth" : false,
        "fnDrawCallback": function( oSettings ) {
        	if(self.defaultContent) self.container.find("tbody:eq(0)").prepend(self.defaultContent.detach());
        	self.afterTableRender(self);
        	if(self.defaultOptions.selfPaginate) {
        		_configPaginateBar(self,self.pageInfo.totalPage,self.pageInfo.currentPage,self.pageInfo._TOTAL_,self.pageInfo.pageSize);
        	}
        	if($("#instanceName").val() !=null&&$("#instanceName").val() != ""&&$("#instanceName").val() !="null"){
				$("#tbody2_filter").find("input[type='text']").val($("#instanceName").val());
				$("#tbody2_filter").find("input[type='text']").trigger("keyup");
			}
         }
	}; 
	
	this.getContainer = function() {
		return this.container;
	};
	/*
	 * 直接通过表格渲染datatable
	 */
	this.renderFromTable = function(tblSelector,options) {
		options = options || {};
		this.container = $(tblSelector);
		_validate(this.container);
		
		this.columnDefs = _parseTable(this.container);
		$.extend(this.defaultOptions,options);
		if(options.pageSize) {
			this.defaultOptions.iDisplayLength = options.pageSize;
		}
		this.afterTableRender = options.afterTableRender || this.afterTableRender;
		this.$datatable = this.container.dataTable(this.defaultOptions);
		_initHead(this);
		
		_initHidenColumns(this);
		
		this.afterTableRender(this);
		return this;
	};
	/*
	 * 显示或者隐藏列
	 */
	this.hideOrShowColumn = function(columnIndex,visable) {
		_hideAndShowColumn(this.$datatable,columnIndex,visable);
		if(!visable) {
			this.columnDefs[columnIndex].contentVisiable = "hide";
		} else {
			this.columnDefs[columnIndex].contentVisiable = "show";
		}

	};
	
	this.isColumnVisiable = function(columnIndex){
		return this.$datatable.fnSettings().aoColumns[columnIndex].bVisible;
	};
	/*
	 * 开启自定义显示列功能
	 */
	this.enableColumnHideAndShow = function(position){
		this.customColumnBtnPosition = position || "left";
		if(this.columnShowOrHideCtrlDlg != null) return;
		_addColumnShowOrHidenSwitchBtn(this,position);
		var content = $("<table class='table'></table>");
		var ths = $(this.container).find("th");
		for(var i=0; i<this.columnDefs.length; i++) {
			var columnDef = this.columnDefs[i];
			if(columnDef.contentVisiable == 'always' ) continue;
			if(columnDef.contentVisiable == 'hide' ) {
				content.append("<tr><td>"+columnDef.title+"</td><td><div class='switch switch-small' columnIndex='"+i+"'><input type='checkbox'/></div></td></tr>");
			} else {
				content.append("<tr><td>"+columnDef.title+"</td><td><div class='switch switch-small' columnIndex='"+i+"'><input type='checkbox' checked /></div></td></tr>");
			}
		}
		var self = this;
		var switchInited = false;
		this.columnShowOrHideCtrlDlg = new com.skyform.component.Modal(new Date().getTime()+Math.random(),this.defaultOptions.oLanguage.column.showOrHide,content.get(0).outerHTML,{
			afterShow: function(modal) {
				if(switchInited) return;
				var switches = $(modal).find(".modal-body .switch").bootstrapSwitch();
				switches.on('switch-change', function (e, data) {
					var columnIndex = $(this).attr("columnIndex");
					var visable = data.value;
						self.hideOrShowColumn(columnIndex,visable);
				});
				switchInited = true;
			}
		});
		return this.columnShowOrHideCtrlDlg;
	};
	
	/*
	 * 当渲染列时，会调用
	 */
	this.onColumnRender = function(columnIndex,columnMetaData,columnData) {
		return _renderColumn(columnIndex,columnMetaData,columnData);
	};
	
	this.onHeadRender = function(headIndex,columnMetaData) {
		return _onheadRender(headIndex,columnMetaData);
	};
	/*
	 * 当头被渲染完成之后会调用
	 */
	this.afterHeadRender = function(thead) {
	};
	/*
	 * 当行被渲染完成之后会调用
	 */
	this.afterRowRender = function(rowIndex,data,tr) {
	};
	/*
	 * 当表格渲染完成之后,调用
	 */
	this.afterTableRender = function(dtTable){};
	/*
	 * 通过数据渲染
	 * @param container : 渲染容器，当前强制要求是一个table
	 * options 一些渲染的选项：
	 * 
	 */
	this.renderByData = function(container,options) {
		options = options || {};
		this.container = $(container);
		
		this.defaultContent = $(this.container).find("tbody tr");
		
		_validate(this.container);
		$.extend(this.defaultOptions,options);
		if(options.pageSize) {
			this.defaultOptions.iDisplayLength = options.pageSize;
		}
		this.columnDefs = options.columnDefs || [];
		this.data = options.data || [];
		this.onColumnRender = options.onColumnRender || this.onColumnRender;
		this.afterRowRender = options.afterRowRender || this.afterRowRender;
		this.afterTableRender = options.afterTableRender || this.afterTableRender;
		this.onPaginate = options.onPaginate || this.onPaginate;
		
		_renderByData(this);
		if(options.selfPaginate) {
			this.defaultOptions.bPaginate = false;
			this.data = options.pageInfo.data;
		}
		
		
		this.$datatable = this.container.dataTable(this.defaultOptions);
		if(options.pageInfo) {
			this.setPaginateInfo(options.pageInfo);
			return this;
		}
		_initHead(this);
		_initHidenColumns(this);
		return this;
	};
	
	this.refresh = function(){
		this.updateData(this.data);
	};
	this.addToobarButton = function(btn) {
		this.toolbarBtns.push(btn);
		var _btn = $(btn);
		_addElementToTbl(_btn.detach(),"left",this);
	};
	this.updateData = function(data) {
		for(var i =0; i< this.toolbarBtns.length;i++) {
			$(this.toolbarBtns[i]).detach().appendTo($("body")).hide();
		}
		this.container.empty();
		
		this.data = data;
		
		_renderByData(this);
		this.$datatable.fnDestroy();
		
		this.$datatable = this.container.dataTable(this.defaultOptions);
		_initHead(this);
		if(this.columnShowOrHideCtrlDlg != null)_addColumnShowOrHidenSwitchBtn(this,this.customColumnBtnPosition);
		for(var i =0; i< this.toolbarBtns.length;i++) {
			_addElementToTbl($(this.toolbarBtns[i]).detach().show(),"left",this);
		}
		_initHidenColumns(this);
		return this;
	};
	this.onPaginate = function(targetPage) {
		this.currentPage = targetPage;
	};
	var _initHead = function($datatable) {
		if(!$datatable.defaultOptions.showPageSize) $datatable.container.parents(".dataTables_wrapper").find(".dataTables_length").remove()
		$datatable.container.parents(".dataTables_wrapper").find(".dataTables_scrollHeadInner").css("width","100%");
		$datatable.container.parents(".dataTables_wrapper").find("table.dataTable").css("width","100%");
	};
	var _validate = function(container) {
		if(!container) throw "No such a table matches your jquery selector '" + tblSelector + "'!";
		if(container.length > 1) throw "More than one table matches your jquery selector '" + tblSelector + "'!";
		if(container.get(0).outerHTML.toLowerCase().replace(" ").indexOf("<table")<0) throw "No such a table matches your jquery selector '" + tblSelector + "'!";;
	};
	var _hideAndShowColumn = function(datatable,columnIndex,visable) {
		//var contentVisiable = datatable.fnSettings().aoColumns[columnIndex].bVisible;
		datatable.fnSetColumnVis( columnIndex, visable );
	};
	var _initHidenColumns = function(datatable) {
		for(var i=0;i<datatable.columnDefs.length;i++) {
			var columnDef = datatable.columnDefs[i];
			if("hide" == columnDef.contentVisiable) {
				_hideAndShowColumn(datatable.$datatable,i,false);
			}
		}
	};
	var _parseTable = function(table) {
		var ths = $(table).find("th");
		var columnDefs = [];
		for(var i =0; i< ths.length;i++) {
			var th = $(ths[i]);
			var columnDef  = {};
			columnDef.name = th.attr("name") || "";
			columnDef.title = th.text();
			columnDef.contentVisiable = th.attr("contentVisiable") || "show";
			columnDef.attrs = _utils.getAllAttributes(ths[i]);
			
			columnDefs.push(columnDef);
		}
		return columnDefs;
	};
	var _renderByData = function(self) {
		self.container.find("tbody").empty();
		_renderHeader(self);
		_renderBody(self);
		_renderFooter(self);
	};
	var _renderHeader = function(self){
		if(self.container.find("th").length > 0) {
			self.columnDefs = _parseTable(self.container);
			return;
		}
		var thead = $("<thead/>");
		var tr = $("<tr/>").appendTo(thead);
		for(var i =0; i< self.columnDefs.length;i++) {
			var columnDef = self.columnDefs[i];
			var thText = self.onHeadRender(i,columnDef);
			var th = $("<th>"+thText+"</th>");
			th.appendTo(tr);
			if(!columnDef.attrs || columnDef.attrs.length==0) continue;
			for(var j =0; j< columnDef.attrs.length;j++) {
				var attr = columnDef.attrs[j];
				th.attr(''+attr.name,attr.value);
			}
		}
		self.afterHeadRender(thead);
		thead.appendTo(self.container);
	};
	var _onheadRender = function(i,columnDef) {
		return columnDef['title'];
	};
	var _renderBody = function(self){
		var tbody = self.container.find("tbody").detach();
		if(!tbody || tbody.length<1)tbody = $("<tbody/>");
		if((self.data) == null || (self.data) == ""){
		}else{
			for (var i =0 ;i<self.data.length;i++ ) {
				var tr = $("<tr/>").appendTo(tbody);
				var data = self.data[i];
				self.updateRow(tr,data);
			}
		}
		tbody.appendTo(self.container);
	};
	
	this.updateRow = function(row,data,checked) {
		row.empty();
		var self = this;
		for(var j=0;j<self.columnDefs.length;j++) {
			var td = $("<td/>").appendTo(row);
			var columnDef = self.columnDefs[j];
			td.attr("name",columnDef.name);//每一数据行设置一个name的attribite
			var columnText = self.onColumnRender(j,columnDef,data);
			td.html(columnText);
			if(this.$datatable && !this.isColumnVisiable(j)) {
				td.hide();
			} else {
				td.show();
			}
		}
		self.afterRowRender(row.index(),data,row);
		row.bind("mouseover",function(){
			$(this).addClass("over")
		});
		
		row.bind("mouseout",function(){
			$(this).removeClass("over");
		});
		if(checked){
			$("input[type='checkbox']",row).attr("checked",true);
		}else{
			$("input[type='checkbox']",row).attr("checked",false);
		}
	};
	var _renderFooter = function(){};
	
	var _renderColumn = function(columnIndex,columnMetaData,columnData){
		return eval("columnData."+columnMetaData.name);
	};
	var _addColumnShowOrHidenSwitchBtn = function($datatable,position) {
		var floatPosition = position||"left";
		var btn = $("<button type='button' style='margin-left:5px;margin-right:5px;' class='btn'>"+$datatable.defaultOptions.oLanguage.column.customizeColumns+"</button>");
		//btn.attr("placeHolder",$datatable.defaultOptions.oLanguage.columnCustomizePlaceHolder);
		//btn.prependTo($datatable.container.parent().find(".ui-toolbar:first"));
		//btn.prependTo($datatable.container.parents(".dataTables_wrapper"));
		_addElementToTbl(btn,floatPosition,$datatable);
		btn.click(function(){
			$datatable.columnShowOrHideCtrlDlg.show()
		});
	};
	
	var _addElementToTbl = function(ele,position,$datatable) {
		var container = $datatable.container.parents(".dataTables_wrapper");
		ele.css("float",position || "left");
		ele.prependTo(container);
	};
	var toPage = function(targetPage) {
		
	};
	var _onPaginate = function(targetPage,pageSize,callback) {
		
	};
	this.setPaginateInfo = function(pageInfo) {
		this.updateData(pageInfo.data);
		this.pageInfo = pageInfo;
		_configPaginateBar(this,pageInfo.totalPage,pageInfo.currentPage,pageInfo._TOTAL_,pageInfo.pageSize);
	};
	var _configPaginateBar = function($datatable,totalPage,currentPage,_TOTAL_,pageSize) {
		var _page = currentPage;
		var _currentPage = currentPage;
		var showPageCount = 5;
		var pages = "";
		var centerPage = Math.floor(showPageCount/2);
		var pageCount = 0;
		var pageIndex = 1;
		if(currentPage + centerPage> totalPage) {
			currentPage = totalPage-centerPage;
			if(currentPage<=0) currentPage = 1;
		}
		for(var i = currentPage-centerPage;i>0&&i<currentPage;i++) {
			pages += "<li  pageIndex='"+i+"'><a href='#'>" + (i) + "</a></li>\n";
			pageCount ++;
			pageIndex = i;
		}
		pages += "<li class='page-current' pageIndex='"+currentPage +"'><a href='#'>" + currentPage  + "</a></li>\n";
		pageCount ++;
		pageIndex = currentPage;
		for(var i = 1 ; i<=centerPage && pageCount < showPageCount && pageIndex<totalPage;i++) {
			pages += "<li  pageIndex='"+(currentPage + i)+"'><a href='#'>" + (currentPage + i) + "</a></li>\n";
			pageCount ++;
			pageIndex = (currentPage + i);
		}
		while(pageCount < showPageCount && pageIndex<totalPage) {
			pageIndex ++;
			pages += "<li  pageIndex='"+pageIndex+"'><a href='#'>" + (pageIndex) + "</a></li>\n";
			pageCount ++;
		}
	    var i18n = $datatable.defaultOptions.oLanguage.oPaginate;
		var template =
			$("<div class='pagination'>\n"+
				"<ul>\n"+
					"<li class='page-first' pageIndex='1'><a href='#'>" + i18n.sFirst+"</a></li>\n"+
					"<li class='page-previous' pageIndex='"+(_currentPage-1>=1? _currentPage-1 : _currentPage)+"'><a href='#'>" + i18n.sPrevious +"</a></li>\n"+
					pages+
					"<li class='page-next' pageIndex='"+(_currentPage+1<=totalPage? _currentPage+1 : _currentPage)+"'><a href='#'>" + i18n.sNext +"</a></li>\n"+
					"<li class='page-last' pageIndex='"+totalPage+"'><a href='#'>" + i18n.sLast +"</a></li>\n"+
				"</ul>\n"+
			"</div>\n");
		template.find("li[pageIndex='"+_currentPage+"']").addClass('active');
		if(pageSize){
			var start = _page*pageSize-pageSize+1;
			if(Math.floor(_TOTAL_/pageSize) == (_page - 1))
				var end = _TOTAL_;
			else
				var end = pageSize*_page;
			var total = _TOTAL_;
		}
		if(totalPage == 0) {
			template.find("li[pageIndex='"+0+"']").addClass('active');
			if(pageSize){
				start = 0;
				end = 0;
				_TOTAL_ = 0;
			}
		}
		template.find("li").click(function(e){
			$datatable.onPaginate(parseInt($(this).attr("pageIndex")));
			return false;
		});
		$datatable.container.parents(".dataTables_wrapper").find(".dataTables_filter label").remove();

		var paginateContainer = $datatable.container.parents(".dataTables_wrapper").find(".dataTables_info").empty();
		paginateContainer.empty();
		paginateContainer.css("float","right");
		paginateContainer.append(template);
		if(pageSize){
			paginateContainer.css("width","100%");
			paginateContainer.append($("<span class='left_binfo'></span>"));
			paginateContainer.find(".left_binfo").empty().text("共"+total+"条记录,当前"+start+"-"+end+"条");
		}
	}
}
com.skyform.component.Modal = function(id,title,content,options) {
	this.settings = {
		beforeShow : function(){},
		afterShow : function(){},
		afterHidden : function(){},
		publicButtonFlag:false
	};
	
	this.id = id;
	this.title = title;
	this.content = title;
	this.options = options;
	this.container = $("#"+id);
	
	$.extend(this.settings,options);
	
	
	this.destory = function() {
		return this.container.modal("destroy");
	};
	
	this.hide = function() {
		this.container.modal("hide");
		this.settings.publicButtonFlag=false;
	};
	this.setHeight = function(height){
		this.container.height(height);
		this.container.find(".modal-body").css("max-height",(height-50-32)+"px");
		this.container.find(".modal-body").height(height-50-32);
		return this;
	};
	
	this.setWidth = function(width) {
		this.container.width(width);
		this.container.find(".modal-body").css("max-width",(width-50)+"px");
		this.container.find(".modal-body").width(width-50);
		return this;
	};
	
	this.setLeft = function(left) {
		this.container.css("left",left+"px");
		return this;
	};
	
	this.setTop = function(top) {
		this.container.css("top",top+"px");
		return this;
	};
	
	this.setZIndex = function(zIndex) {
		this.container.css("z-index",zIndex);
		return this;
	}
	
	
	this.autoAlign = function(){
		var left = ($(document).width()-this.container.width())/2;
		this.setLeft(left);
		
		var top = ($(document).height()-this.container.height())/4;
		this.setTop(top);
		
		this.container.css({
			"margin-left" : '0px',
			"margin-top" : "0px"
		});
		
		this.container.find(".modal-body").css({
			"margin-left" : '0px',
			"margin-top" : "0px"
		});
		return this;
	};
	
	this.setTitle = function(title){
		this.container.find(".modal-header").find("h3").html(title);
		return this;
	};
	
	this.setContent = function(content) {
		this.container.find(".modal-body").html(content);
		return this;
	};
	
	var html = "";
	if(this.container == null || this.container.length == 0) {
		html = $("<div id='" + id + "' class='modal hide fade' tabindex='-1' role='dialog' aria-labelledby='myModalLabel' aria-hidden='true'/>");
		this.container = html;
	};
	html.appendTo($("body"));
	var modalHeader = $("<div class='modal-header'><button type='button' class='close' data-dismiss='modal' aria-hidden='true'>×</button><h3>"+title+"</h3></div>");
	modalHeader.appendTo(html);
	var modalBody = $("<div class='modal-body'>"+ content + "</div>");
	var modalFooter = $("<div class='modal-footer'></div>");
	if(!this.settings.publicButtonFlag){
		com.skyform.component.showButtons(options,modalFooter);
	}
	modalBody.appendTo(html);
	modalFooter.appendTo(html);
//	$(html).find(":input").on("focus",function(){
//		com.skyform.component.showButtons(options,modalFooter);
//	});
//	 $(html).find(".ui-slider").slider({
//         "change":function(){
//        	 com.skyform.component.showButtons(options,modalFooter);
//         }
//      })
	this.show = function() {
		var self = this;
		this.container.modal({
			"backdrop" : "static",
			"keyboard" : false,
			"show"	   : false
		});
		this.container.off("show").on("show",function(){
			self.settings.beforeShow(self.container);});
		this.container.off("shown").on("shown",function(){
			$('input[placeholder]').placeholder();
			self.settings.afterShow(self.container);
			if(!self.settings.publicButtonFlag){
				com.skyform.component.showButtons(options,modalFooter);
			}
		});
		this.container.off("hidden").on("hidden",function(){
			self.settings.afterHidden(self.container);
			self.settings.publicButtonFlag = false;
		});
		this.container.modal("show");
		return this;
	};
};
com.skyform.component.showButtons=function(options,modalFooter){
	$(modalFooter).empty();
	if(options.buttons) {
		for(var i =0; i< options.buttons.length; i++) {
			var button = options.buttons[i];
			var btn = $("<button type='button'>"+(button.name||"") + "</button>");
			btn.appendTo(modalFooter);
			if(button.attrs) {
				for(var j =0 ; j<button.attrs.length; j++) {
					var attr = button.attrs[j];
					btn.attr(attr.name,attr.value);
				}
			}
			if(button.onClick && typeof button.onClick == 'function') {
				//btn.click(button.onClick);
				$(btn).on("btnClick",button.onClick);
				$(btn).click(function(event){
//					$(this).css({
//						"cursor": "default",
//				         "opacity": 0.65,
//				         "background":"#e6e6e6",
//				         "color":"#333333"
//					});
//					$(this).text("提交中");
//					$(this).unbind("click");
					if($.trim($(this).text())!="取消"){
						$(this).attr("avoidFlag","true");
					}
					$(this).trigger("btnClick");
				});
			}
		}
	}
};
com.skyform.component.Renew = function(subsId,options) {
	this.settings = {
			beforeShow : function(){},
			afterShow : function(){},
			afterHidden : function(){}
	};
	this.options = options;	
	this.container = $("#renewModal");
	$.extend(this.settings,options);
	
	this.show = function(){
		var self = this;
		this.container.modal({
			"backdrop" : "static",
			"keyboard" : false,
			"show"	   : false			
		});
		this.container.off("show").on("show",function(){
			self.settings.beforeShow(self.container);
		});
		this.container.off("shown").on("shown",function(){
			$('input[placeholder]').placeholder();
			self.settings.afterShow(self.container);
		});
		this.container.off("hidden").on("hidden",function(){
			self.settings.afterHidden(self.container);
		});
		this.container.modal("show");
		return this;
	};
	this.destroy = function(){
		return this.container.modal("destroy");
	};
	this.hide = function(){
		this.container.modal("hide");
	};
	this.getFee_renew = function(subsId){
		var period = createPeridInput_renew.getValue();
		//获取续订周期单位
		var unit_name = Dict.val("common_month");//默认为"按月"
		var paramUnit = {
				"subscriptionId":parseInt(subsId)
		};
		Dcp.biz.apiAsyncRequest("/account/queryBillType",paramUnit, function(data) {
			if(0 == data.code){
				var unit_code =  data.data;
				unit_name = com.skyform.service.UnitService.getUnitName("",unit_code);
				$("#unit_name").html(unit_name);
			}else{
				$("#unit_name").html(unit_name);
			}
		});
		
		//获取续订价格
		var param = {
				"period":parseInt(period),
				"subsId":parseInt(subsId)
		};
		Dcp.biz.apiAsyncRequest("/pm/queryCaculateFeeBySubsId",param, function(data) {
			if(0 == data.code){

				var fee2=data.data.fee;
				var fee =  (typeof fee2=='number')?data.data.fee:data.data;
				$("#feeInput_renew").text(fee/1000);
			}
		});		
	};

	//呼和浩特资源池获取续订价格
	this.hhht_getFee_renew = function(subsId){
		var period = createPeridInput_renew.getValue();
		//获取续订周期单位
		var unit_name = Dict.val("common_month");//默认为"按月"
		var paramUnit = {
				"subscriptionId":parseInt(subsId)
		};
		Dcp.biz.apiAsyncRequest("/desktopCloud/account/queryBillType",paramUnit, function(data) {
			if(0 == data.code){
				var unit_code =  data.data;
				unit_name = com.skyform.service.UnitService.getUnitName("",unit_code);
				$("#unit_name").html(unit_name);
			}else{
				$("#unit_name").html(unit_name);
			}
		});
		
		//获取续订价格
		var param = {
				"period":parseInt(period),
				"subsId":parseInt(subsId)
		};
		Dcp.biz.apiAsyncRequest("/desktopCloud/pm/queryCaculateFeeBySubsId",param, function(data) {
			if(0 == data.code){

				var fee2=data.data.fee;
				var fee =  (typeof fee2=='number')?data.data.fee:data.data;
				$("#feeInput_renew").text(fee/1000);
			}
		});		
	};
	

	var html = "";
	if(this.container == null || this.container.length == 0){
		html = $("<div id='renewModal' class='modal hide fade' tabindex='-1' role='dialog' aria-labelledby='myModalLabel' aria-hidden='true'/>");
		this.container = html;
	}
	html.appendTo($("body"));
	var modalHeader = $("<div class='modal-header'><button type='button' class='close' data-dismiss='modal' aria-hidden='true'>×</button><h3>"+Dict.val("common_renew")+"</h3></div>");
	modalHeader.appendTo(html);
	var modalBody = $("<div class='modal-body'></div>");
	var modalFooter = $("<div class='modal-footer'></div>");
	if (CommonEnum.offLineBill){
		var content = 
			$('<form class="form-horizontal">' +	    
			'	<fieldset>' +
			'		<div class="control-group">' +
			'			<label class="control-label" style="width:80px;">'+Dict.val("common_renew_duration")+':</label>' +
			'			<div class="controls" style="margin-left:0px;">' +
			'				<span id="perid_renew" class="subFee_renew"></span>' +
			'				&nbsp;&nbsp;<span id="unit_name"></span>&nbsp;&nbsp;<font color="red" >*</font><span id="peridUnit_renew"></span>&nbsp;&nbsp;' +
			'				<span id="tipPerid_renew" style="color: red"></span>' +
			'			</div>' +
			'		</div>' +		
			'		<div class="control-group">' +
			'			<label style="">'+Dict.val("common_renew_tip")+'</label>' +
			'		</div>' +
			'	</fieldset>' +
			'</form>' );
	}else{
		var content = 
			$('<form class="form-horizontal">' +	    
			'	<fieldset>' +
			'		<div class="control-group">' +
			'			<label class="control-label" style="width:80px;">'+Dict.val("common_renew_duration")+':</label>' +
			'			<div class="controls" style="margin-left:0px;">' +
			'				<span id="perid_renew" class="subFee_renew"></span>' +
			'				&nbsp;&nbsp;<span id="unit_name"></span>&nbsp;&nbsp;<font color="red" >*</font><span id="peridUnit_renew"></span>&nbsp;&nbsp;' +
			'				<span id="tipPerid_renew" style="color: red"></span>' +
			'				<span id="feeInput_renew"  required="required" class="text-info" style="left:right;color: orange;font-size: 20px;"/></span> 元' +
			'			</div>' +
			'		</div>' +		
			'		<div class="control-group">' +
			'			<label style="">'+Dict.val("common_renew_tip")+'</label>' +
			'		</div>' +
			'	</fieldset>' +
			'</form>' );
	}
	content.appendTo(modalBody);
		if(options.buttons) {
			for(var i =0; i< options.buttons.length; i++) {
				var button = options.buttons[i];
				var btn = $("<button type='button'>"+(button.name||"") + "</button>");
				btn.appendTo(modalFooter);
				if(button.attrs) {
					for(var j =0 ; j<button.attrs.length; j++) {
						var attr = button.attrs[j];
						btn.attr(attr.name,attr.value);
					}
				}
				if(button.onClick && typeof button.onClick == 'function') {
					btn.click(button.onClick);
				}
			}
		};
				
	modalBody.appendTo(html);
	modalFooter.appendTo(html);
	// 带+-的输入框
	var container = $("#perid_renew").empty();				
	var max = 12;
	var createPeridInput_renew = new com.skyform.component.RangeInputField(container, {
		min : 1,
		defaultValue : 1,
		max:max,
		textStyle : "width:137px"
	}).render();
	createPeridInput_renew.reset();	
	this.getPeriod = function(){
		return createPeridInput_renew;
	};
};

/*
 * SkyForm Wizard Component 
 * require bootstrap.wizard.js: http://www.panopta.com/2013/02/06/bootstrap-application-wizard/
 */
com.skyform.component.Wizard = function(container) {
	this.container = container;
	this.defaultOptions = {};
	this.defaultOptions.Language = (com.skyform.component.i18n  && com.skyform.component.i18n.wizard) ? com.skyform.component.i18n.wizard.Language : {
		"next" : "next",
		"previous" : "previous",
		"finish" : "finish",
		"submiting" : "submiting"
	};
	this._wizard = null;
	this.render = function(afterShow){
		if(afterShow && typeof afterShow == 'function') {
			this._wizard.show(afterShow);
		}
		this._wizard.show();
		$('input[placeholder]').placeholder();
	};
	
	this.onHidden = function(wizardWindow){
	};
	
	this.getContentPanelByIndex = function(index) {
		return $(".wizard-card:eq(" + index +")",this._wizard.el);
	};
	var _init = function($this) {
		$this._wizard = $($this.container).wizard({
			buttons: {
				nextText : $this.defaultOptions.Language.next,
				backText : $this.defaultOptions.Language.previous,
				submitText : $this.defaultOptions.Language.finish,
				submittingText : $this.defaultOptions.Language.submiting
			},
			width:860
		});
		$this._wizard.on("incrementCard",function(){
			var ctx = {fromStep:0,toStep:1};
			ctx.fromStep = $this._wizard.getActiveCard().index -1;
			ctx.toStep = ctx.fromStep+1;
			
			$this.onToStep(ctx.fromStep,ctx.toStep);
			$this.onLeaveStep(ctx.fromStep,ctx.toStep);
		});
		
		$this._wizard.on("decrementCard",function(){
			var ctx = {fromStep:1,toStep:0};
			ctx.fromStep = $this._wizard.getActiveCard().index +1;
			ctx.toStep = ctx.fromStep-1;
			
			$this.onToStep(ctx.fromStep,ctx.toStep);
			$this.onLeaveStep(ctx.fromStep,ctx.toStep);
		});
		
		$this._wizard.el.on("hidden",function(){
			$this.onHidden($this._wizard.el);
		});
		
		$this._wizard.on("submit",function(){
			var ctx = {fromStep:1,toStep:0};
			ctx.fromStep = $this._wizard.getActiveCard().index -1;
			ctx.toStep = ctx.fromStep+1;
			$this.onFinish(ctx.fromStep,ctx.toStep);
		});
		
	};
	
	this.onLeaveStep = function(from,to) {
		return true;
	};
	
	this.onToStep = function(from,to) {
		return true;
	};
	
	this.onFinish = function(from,to){
		return true;
	};
	
	this.goToStep = function(step) {
		return true;
	};
	this.reset = function(){
		this._wizard.reset();
	};
	this.hide = function() {
		this._wizard.hide();
	};
	this.close = function(){
		this._wizard.close();
	};
	this.markSubmitSuccess = function(){
		 this._wizard.submitSuccess(); 
		 this._wizard.hideButtons(); 
		 this._wizard.updateProgressBar(0);
	};
	this.markSubmitError = function() {
		this._wizard.submitError(); 
		this._wizard.hideButtons(); 
	};
	_init(this);
};
/*
 * Portalet: basic component for flexable widget layout. it is resizable, draggable, closable
 */
com.skyform.component.Portalet = com.skyform.component.Portalet || function(options) {
	this.container = options.container || null;
	this.toolbar = null;
	this.contentPanel = null;
	
	this.maxWindow = null;
	
	this.windowX = window.scrollX;
	this.windowY = window.scrollY;
	
	this.minimized = false;
	this.maximized = false;
	this.collasped = false;
	
	
	this.options = {
		"minimizable" : false,
		"maximizable" : false,
		"collapsible" : true,
		"closable" : false,
		"title" : 'untitiled',
		"content" : ''
	};
	
	this.getContentPanel = function(){
		return this.contentPanel;
	};
	this.options = $.extend(this.options,options);
	
	this.setContent = function(content) {
		this.contentPanel.html(content);
	};
	
	this.getPanel = function() {
		return this.container;
	};
	this.destroy = function() {
		this.container.remove();
	}
	var _init = function($portalet) {
		_initFrame($portalet);
		_initToolbar($portalet);
		_initContentPanel($portalet);
	};
	var _initFrame = function($portalet) {
		if($portalet.container == null) {
			$portalet.container = $("<div class='box ui-helper-clearfix ui-widget-content'></div>");
		}
	};
	var _initToolbar=function($portalet) {
		var toolbar = $("<div class='box-header well'>"+$portalet.options.title+"</div>");
		
		if($portalet.options.buttons) {
			$($portalet.options.buttons).each(function(i,btn){
				var btnEle = $("<span class='btn-round' style='float:right;'></span>").appendTo(toolbar);
				var cls = btn.cls || 'btn';
				var onClick = btn.onClick || function(){};
				btnEle.addClass(cls);
				btnEle.click(onClick)
			});
		}
		
		if($portalet.options.maximizable) {
			var maxIcon = $("<a class='btn btn-minimize btn-round' href='#' style='float:right;'><i class='icon-plus-sign'></i></a>").appendTo(toolbar);
			maxIcon.click(function(){
				$("i",this).toggleClass("icon-plus-sign").toggleClass("icon-minus-sign");
				if($("i",this).hasClass("icon-minus-sign")) {
					_maxWindowSize($portalet);
				} else {
					_restoreWindowSize($portalet);
				}
				return false;
			});
		}
		if($portalet.options.minimizable) {
			var minIcon = $("<span class='icon-minus-sign' style='float:right;'></span>").appendTo(toolbar);
			minIcon.click(function(){
				if($("i",this).hasClass("icon-minus-sign")) {
					_minWindowSize($portalet);
				} else {
					_restoreWindowSize($portalet);
				}
				$("i",this).toggleClass("icon-plus-sign").toggleClass("icon-minus-sign");
				return false;
			});
		}
		if($portalet.options.collapsible) {
			var collapseIcon = $("<a class='btn btn-minimize btn-round' href='#' style='float:right;'><i class='icon-chevron-up'></i></a>").appendTo(toolbar);
			collapseIcon.click(function(){
				$("i",this).toggleClass("icon-chevron-up").toggleClass("icon-chevron-down");
				var contentPanel = $(this).parents( ".skyform-portalet:first" ).find( ".skyform-portalet-content" ).slideUp();
				if($("i",this).hasClass("icon-chevron-down")) {
					$portalet.contentPanel.slideUp();
					$portalet.collasped = true;
					if($portalet.maximized) {
						$portalet.container.height(40);
					}
				} else {
					$portalet.contentPanel.slideDown();
					$portalet.collasped = true;
					if($portalet.maximized) {
						$portalet.container.css("height","100%");
					}
				}
				return false;
			});
		}
		if($portalet.options.closable) {
			var closeIcon = $("<span class='icon-remove-sign' style='float:right;'></span>").appendTo(toolbar);
			closeIcon.click(function(){
				$portalet.destroy();
			});
		}
		toolbar.prependTo($portalet.container);
	};
	var _initContentPanel=function($portalet) {
		var contentPanel = $("<div class='skyform-portalet-content'></div>");
		$portalet.contentPanel = contentPanel;
		contentPanel.appendTo($portalet.container);
	};
	
	var _savePosition = function($portalet) {
		$portalet.windowX = window.scrollX;
		$portalet.windowY = window.scrollY;
	};
	
	var _maxWindowSize = function($portalet) {
		_savePosition($portalet);
		var maxWindow = $portalet.container;
		window.scrollTo(0,0);
		
		maxWindow.css('position','absolute');
		maxWindow.css('z-index','5999');
		maxWindow.css({
			'left': '0px',
			'top':  '0px',
			'width': '100%',
			'height': '100%'
		});
		$portalet.maximized = true;
	};
	var _minWindowSize = function($portalet) {
		var maxWindow = $portalet.container;
		$($portalet.contentPanel).hide();
		maxWindow.css('position','absolute');
		maxWindow.css('z-index','5999');
		maxWindow.css('float','left');
		maxWindow.css('margin','10px');
		maxWindow.css({
			'bottom':  '0px',
			'width': '150px',
			'height': '50px'
		});
		$portalet.minimized = true;
	};
	var _restoreWindowSize = function($portalet){
		window.scrollTo($portalet.windowX,$portalet.windowY);
		$portalet.container.removeAttr("style");
		$($portalet.contentPanel).show();
		$portalet.height = $portalet.container.height();
		this.minimized = false;
		this.maximized = false;
		this.collasped = false;
	}
	
	_init(this);
};
com.skyform.component.PortaletContainer = com.skyform.component.PortaletContainer || function(container,columncount,options) {
	this.container = $(container);
	this.columncount = columncount;
	
	this.options = {
		sortable : true
	};
	
	$.extend(this.options,options);
	
	this.addPortalet = function(columnIndex,portalet) {
		var column = this.getColumnByIndex(columnIndex);
		if(column.length == 0) throw "Can not find a column with your index : " + columnIndex;
		column.append(portalet.getPanel());
	};
	
	this.getColumnByIndex = function(columnIndex) {
		return $(".skyform-portalet-column[skyform-column='"+columnIndex+"']",this.container);
	};
	
	this.saveLayout=function(){};
	this.restoreLayout = function(){};
	
	var _init = function($portalContainer) {
		var widthPercent = (1.0 / $portalContainer.columncount * 100-2) + "%";
		for(var i =0 ;i < $portalContainer.columncount;i++) {
			 var column = $("<div class='skyform-portalet-column' skyform-column='"+i+"'/>");
			 column.appendTo($portalContainer.container);
			 column.css("width",widthPercent);
		}
		if($portalContainer.options.sortable) {
			$( ".skyform-portalet-column" ).sortable({
			      connectWith: ".skyform-portalet-column",
			      forcePlaceholderSize: true,
			      "forceHelperSize": true
			    });
				$( ".skyform-portalet-column" ).disableSelection();
		}
		
	};
	
	_init(this);
};
/*
 * 范围输入框.
 */
com.skyform.component.RangeInputField= function(container,options) {
	this.container = $(container);
	var _options = {
		min : 0,
		max : 100,
		step : 1,
		defaultValue : 0,
		textClass : "input-medium",  // size for input text field , can be : input-mini,input-small,input-medium,input-large,input-xlarge,input-xxlarge
		placeHolder : '请输入',
		textStyle : '',
		isInput:true,
		
		language : {
			illegal : 'Illegal number! ',
			toolarge : 'Too large!',
			toosmall : 'Too small! '
		}
	};
	$.extend(_options,options);
	
	var view = {reduceBtn:null,inputField:null,addBtn:null};
	var currentValue = _options.defaultValue;
	
	var logger = com.skyform.component.utils.logger;
	
	if(com.skyform.component.i18n && com.skyform.component.i18n.RangeInputField && com.skyform.component.i18n.RangeInputField.Language) {
		_options.language = com.skyform.component.i18n.RangeInputField.Language;
	}

	this.getValue = function() {
		return currentValue;
	};
	
	this.onUpdate = function(targetValue) {
		return true;
	};
	
	this.setValue = function(newValue){
		_setValue(this,newValue);
	};
	
	this.showErrorMsg = function(msg){
		view.inputField.popover('destroy');
		view.inputField.popover({content:msg});
		view.inputField.popover("show");
		view.inputField.focus();
		view.inputField.addClass("error");
	};
	
	this.hideErrorMsg = function () {
		view.inputField.popover("destroy");
		view.inputField.removeClass("error");
	};
	
	this.render = function() {
		var template = 
			$("<div class=\"input-prepend input-append\">\n"+
				"<button class=\"btn\" type=\"button\">-</button>"+
				"<input style=\""+_options.textStyle+"\" maxlength=\"3\" class=\""+_options.textClass+"\"  type=\"text\" placeHolder=\""+_options.placeHolder+"\"  value=\""+currentValue+"\">\n"+
				"<button class=\"btn\" type=\"button\">+</button>"+
			"</div>");
		if(!_options.isInput){
			template.find("input[type='text']").attr("readonly","readonly");
		}
		template.appendTo(this.container);		
		var self = this;
		view.reduceBtn = template.find("button:eq(0)").click(function(){
			_reduceByStep(self);
		});
		view.inputField = template.find("input").blur(function(){
			var newValue = $(this).val();
			_setValue(self,newValue);
		});
		view.inputField = template.find("input").change(function(){
			var newValue = $(this).val();
			_setValue(self,newValue);
		});
		view.addBtn = template.find("button:eq(1)").click(function(){
			_addByStep(self);
		});
		
		com.skyform.component.utils.restrainInputFieldToMatchIntNumber(view.inputField);
		
		template.find("input").keyup(function(){			
			$(this).triggerHandler("blur");
		});
		template.find("input").change(function(){
			$(this).triggerHandler("blur");
		});
		
		_update();
		return this;
	};
	
	this.destroy = function() {
		this.container.empty();
	};
	
	this.reset = function () {
		currentValue = _options.defaultValue;
		_update();
	};
	
	this.validate = function () {
		var inputValue = view.inputField.val();
		return _validate(inputValue);
	};

	var _addByStep = function($this){
		var targetValue = $this.getValue() + _options.step;
		if($this.onUpdate(targetValue) && targetValue <= _options.max) {
			currentValue = new Number(targetValue).valueOf();
		}
		_update();
	};
	
	var _reduceByStep = function($this) {
		var targetValue = $this.getValue() - _options.step;
		if($this.onUpdate(targetValue) && targetValue >= _options.min) {
			currentValue = new Number(targetValue).valueOf();
		}
		_update();
	};
	
	var _setValue = function($this,newValue) {
		var validateResult = _validate(newValue);
		if(validateResult.code == 0) {
			if(true == $this.onUpdate(newValue)) {
				currentValue = new Number(newValue).valueOf();
				_update();
				$this.hideErrorMsg();
			} 
		} else {
			$this.showErrorMsg(validateResult.msg);
		}
	};
	var _validate = function(targetValue) {
		if(!/^[1-9]+[0-9]*$/.test("" + targetValue)) return {code : 1, msg : _options.language.illegal};
		if(targetValue>_options.max)
		{
			currentValue = _options.defaultValue;
			_update();
			return {code : 1, msg : _options.language.toolarge};
		}
		if(targetValue<_options.min) return {code : 1, msg : _options.language.toosmall};
		
		var valid = (targetValue - _options.defaultValue)%_options.step == 0;
		if(!valid) return {code:1,msg : _options.language.illegal};
		return {code : 0, msg : ''};
	};
	var _update = function() {
		view.inputField.val(currentValue);
		if(currentValue == _options.max) view.addBtn.addClass("disabled");else view.addBtn.removeClass("disabled");
		if(currentValue == _options.min) view.reduceBtn.addClass("disabled");else view.reduceBtn.removeClass("disabled");
	};
};
com.skyform.component.StepBar = function(container,options){
	 var steps = [];
	 var currentStep = 0;
	 var _initEvent = function(stepBar,ul) {
		 ul.find("li").click(function(){
			 var index = $(this).index();
			 var actived = index <= currentStep;
			 stepBar.onStepClicked(index, actived);
		 });
	 };
	 
	 this.container = $(container);
	 
	 this.onStepClicked = function(step, actived) {
		System.logDao.debug("step:" + step + " actived : " + actived + " is clicked!"); 
	 };
	 
	 
	 this.addStep = function(step){
		 steps.push(step);
	 };
	 
	 this.getCurrentStep = function(){
		 return currentStep;
	 };
	 
	 this.setCurrentStep = function(step) {
		 currentStep = step;
	 };
	 
	 this.render = function(){
		 if(steps.length<1) throw "No step to render!";
		 
		 this.container.empty();
		 var ol = $("<ol class='stepbar'/>");
		 for(var i =0 ; i < steps.length; i++) {
			 var step = steps[i];
			 var li = $("<li style='cursor: pointer;'></li>");
			 var div = $("<div class='step-div'> " +
					 		"<div class=\"step-name\">"+step + "</div>"+
					 		"<div class=\"step-no scend\"></div>"+
					 	"</div>");
			 div.appendTo(li);
			 if(i <= currentStep) {
				 div.addClass("step-done");
			 }
			 if(i==0) li.addClass("step-first");
			 else if (i==steps.length-1) {
				 li.addClass("step-last");
				 if(currentStep==steps.length-1) li.find("div.step-no").addClass("completed");
			 }
			 else li.addClass("step-scend");
			 li.css("width",(1.0/steps.length*100) + "%");
			 li.appendTo(ol);
		 }
		 _initEvent(this,ol);
		 ol.appendTo(this.container);
	 };
	 
	 this.getAllSteps = function(){
		 return [].conact(steps);
	 };
	 
};


com.skyform.component.AZSelect = function(id,div,service,callback) {
	var currentValue = 0;
	var noQuota_msg = "请联系管理员分配配额！";
	this.id = id;
	this.container = $("#"+id);	
	this.div = $("#"+div);
	this.container.css("position","relative");
	
	this.setHeight = function(height){
		this.container.height(height);
		this.container.find(".modal-body").css("max-height",(height-50-32)+"px");
		this.container.find(".modal-body").height(height-50-32);
		return this;
	};
	
	this.setWidth = function(width) {
		this.container.width(width);		
		return this;
	};
	this.setSelectWidth = function(width) {
		this.div.find("#azSelect").css("width",width+"px");
		return this;
	};
	
	this.setLeft = function(left) {
		this.container.css("left",left+"px");
		return this;
	};
	
	this.setTop = function(top) {
		this.container.css("top",top+"px");
		return this;
	};
	
	this.setZIndex = function(zIndex) {
		this.container.css("z-index",zIndex);
		return this;
	}
	this.setQuota = function(quota){
		this.quota = quota;
	}
	
	this.setOptionData = function(optionData){
		this.optionData = optionData;
	}	

	var _renderOption = function(self){
		var flagData = self.optionData;		
		if(flagData){
			flagData.sort(function(a,b){
		        return b.isQuotaExist - a.isQuotaExist;
		     });
			$(flagData).each(function(i,item){
				var option = $("<option value='"+item.availableZoneId+"'>"+item.availableZoneName+"</option>");
				if(item.isQuotaExist==0){
					option.attr("disabled","disabled");
					option.mouseover(function(){
						 $("#tip_msg").css({"left":parseInt(azSelect.position().left+azSelect.width())+13+"px","top":-(azSelect.height()-$("#"+id).height())/2+26+i*20+"px","position":"absolute","z-index":999,"width":"180px"});
						 $("#tip_msg").show();
					});
					option.mouseout(function(){
						 $("#tip_msg").hide();
					});
				}
				option.appendTo(azSelect);
			});
			// 公有云没有可用域
			var portalType = Dcp.biz.getCurrentPortalType();
			if(portalType == "public"){
				self.hide();
			} else {
				self.show();
				self.showValidateAZSelect();
			}
		}else self.hide();
	}

	this.show = function() {
		var self = this;			
		this.div.removeClass("hide");
		return this;
	};
	this.hide = function() {
		var self = this;
		this.div.addClass("hide");
		return this;
	};
	this.getAzSelectValue = function(){
		return azSelect.val();
	};
	this.getAzSelectValueName = function(){
		return azSelect.find("option:selected").text();
	};
	this.validateOptionValue = function(){	
		currentValue = this.getAzSelectValue(); 
		if(!currentValue){
			return false;
		}
		else return true;
	},
	this.showValidateAZSelect = function(msg){
		var p = this.div.find("#az_msg");
		var p2 = this.div.find("#tip_msg");
		p2.empty().html(noQuota_msg);
		if(!this.validateOptionValue()){
			msg = msg?msg:noQuota_msg;
			p.empty().html(msg);
			return false;
		}
		else return true;
	}
	var _initOptionData = function(self){
		com.skyform.service.resQuotaService.queryAZAndAzQuota(function(data){
			self.setOptionData(data);
			_renderOption(self);
			if(typeof callback == "function") 
				  callback();
		},function(){})	;
	};	

	var html = "";
	if(this.container == null || this.container.length == 0) {
		html = $("<div class='controls' style='margin-left:0px;position:relative' id='"+id+"'></div>");	
		html.appendTo(this.container);
	};
	
	var azSelect = $("<select id='azSelect'></select>");
	var az_msg = $("<p class='help-inline text-error' id='az_msg'></p>");
	var tip_msg= $("<p class='help-inline text-error hide' id='tip_msg'></p>");
	var inited = this.div.find("#azSelect");
	if(inited == null||inited.length == 0){
		azSelect.appendTo(this.container);
		az_msg.appendTo(this.container);
		tip_msg.appendTo(this.container);
	}
	_initOptionData(this);
};