$(function(){	
	$(".compyReset").click(function(){
		reset();
	})
});

function reset() {	
	$('#setMoreInfo').modal('hide');
    $('#setMoreInfo').on('hidden', function () {
    	$("#setMoreInfo :input").each(function() {
    		$(this).val('');
    	});	
    	$(".icon-lock").removeClass("onError").empty();
    	$(".msg").removeClass("onError").empty();	
     })
}