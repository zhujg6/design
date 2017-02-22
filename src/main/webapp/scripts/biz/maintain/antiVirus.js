/**
 * anti virus object
 */
var AntiVirus = {
    //var
    service : com.skyform.service.securityService,
    vmId: $("#vmId").val(),
	_init : function(){
    	$("#manager a").unbind("click").bind("click", function(e){
			e.preventDefault();
			$(this).tab('show');
			var href = $(e.target).attr("href");
			if(href=="#rule-manager") {
				window.currentInstanceType='antiVirusRule';
				AntiVirusRule._init();
			} else if(href=="#scan-manager") {
				window.currentInstanceType='antiVirusScan';
				AntiVirusScan._init();
			} else if(href=="#result") {
				window.currentInstanceType='antiVirusResult';
				AntiVirusResult._init();
			}
		});
    	if(AntiVirus.vmId){
    		AntiVirusResult.vmid=AntiVirus.vmId;
    		$("#manager a[href='#result']").tab("show");
    		window.currentInstanceType='antiVirusResult';
    		AntiVirusResult._init();
    	} else {
    		window.currentInstanceType='antiVirusRule';
    		AntiVirusRule._init();
    	}
	}
};
window.Controller = {
		init : function(){
			AntiVirus._init();
		}
};
