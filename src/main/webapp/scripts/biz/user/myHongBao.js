$(function() {
	hongbao.describeLb();
});
var hongbao = {
datatable : new com.skyform.component.DataTable(),
instances : "",
describeLb : function(){	
//		alert("describeLb");
		//将自己编写的显示主机的table渲染
		Dcp.biz.apiAsyncRequest("/gift/getCustGiftInfo",{}, function(data) {
			if (data&&data.code != "0") {
				$.growlUI("提示", "查询红包发生错误发生错误：" + data.msg); 
			} else if(data){
					hongbao.instances = data.data;					
					hongbao.generateTable(data.data);
					if(data.data){
						if (data.data.length > 0){
						}						
					}
					//lb.describeLbRuleById(0);
//				}
			}
		},function onError(){
			hongbao.generateTable();
		});		
	},
generateTable : function(data){
		hongbao.datatable = new com.skyform.component.DataTable();
		 hongbao.datatable.renderByData("#account", {
				"data" : data,
				"pageSize" : 5,
				"onColumnRender" : function(columnIndex,columnMetaData,columnData) {
					 var text = columnData[''+columnMetaData.name] || "";
					 if(columnIndex ==0) {
						 text = '<input type="checkbox" value="'+text+'">';
					 }
					 
					 if (columnMetaData.name == "activeDate"||columnMetaData.name == "inactiveDate") {
						 //text = new Date(text).toLocaleString();
						  //console.log(columnData.expireDate);
						  if(columnData.expireDate == '' || columnData.expireDate == 'undefined'){
						  	return '';
						  }
						 try {
								var obj = eval('(' + "{Date: new Date(" + text + ")}" + ')');
								var dateValue = obj["Date"];
								text = dateValue.format('yyyy-MM-dd hh:mm:ss');
							} catch (e) {
						    }
					 }
					 if (columnMetaData.name == "fee") {
						 text = text/1000+"元";
					 }
					 return text;
				}, 
				"afterRowRender" : function(rowIndex,data,tr){
				},      
				"afterTableRender" : function() {
				}
		});
		 hongbao.datatable.addToobarButton("#toolbar4tb2");
		 //hongbao.datatable.enableColumnHideAndShow("right");		 
	}
}
