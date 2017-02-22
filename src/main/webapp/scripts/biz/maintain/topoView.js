window.Controller = {
	flag : true,
	init : function() {
		initView($("#eInstanceId").val(), Controller.showVM);
//		$("#toppopvm").hide();
		Controller.showVM();
		$("#dismiss").bind("click",
		function() {
//			window.clearTimeout(t);
//			var t = window.setTimeout(function() {
//			$('#toppopvm').popover('toggle');
						$("#toppopvm").hide();
						$("#toppopvm ul").empty();
						Controller.flag = true;
//					}, 5000);
		}
		);
	},
	showVolume2 : function() {
		$(".show-volume2").hover(function() {
			var arr = [];
			if ($(this).attr("volume") != null && $(this).attr("volume") != "") {
				arr = $(this).attr("volume").split(" ");
				for (var i = 0; i < arr.length; i++) {
					var vm_name = arr[i];
					$("#volume ul").append('<li><img src="' + $("#path").val()
							+ '/css/topoImage/ebs.png"><span>' + vm_name + " "
							+ '</span></li>')
				};
				$("#volume").css({
							position : "absolute",
							left : $(this).offset().left - 100,
							top : Number($(this).offset().top) - 100
						})
				if (arr.length != 0)
					$("#volume").show();
			}
		}, function() {
			window.clearTimeout(t);
			var t = window.setTimeout(function() {
						$("#volume ul").empty();
						$("#volume").hide();
					}, 1);
		});
	},
	showVolume : function() {
		$(".show-volume").hover(function() {
			var arr = [];
			if ($(this).attr("volume") != null && $(this).attr("volume") != "") {
				arr = $(this).attr("volume").split(" ");
				for (var i = 0; i < arr.length; i++) {
					var vm_name = arr[i];
					$("#volume ul").append('<li><img src="' + $("#path").val()
							+ '/css/topoImage/ebs.png"><span>' + vm_name + " "
							+ '</span></li>')
				};
				$("#volume").css({
							position : "absolute",
							left : $(this).offset().left - 120,
							top : Number($(this).offset().top) - 80
						})
				if (arr.length != 0)
					$("#volume").show();
			}
		}, function() {
			window.clearTimeout(t);
			var t = window.setTimeout(function() {
						$("#volume ul").empty();
						$("#volume").hide();
					}, 1);
		});
	},
	showVM : function() {
		$(".component-vxnet-slb").mousedown(function() {
			if(Controller.flag){
			$("#toppopvm ul").empty();
			Controller.flag = false;
			var arr = [];
			
			if ($(this).attr("vm_name") != null&& $(this).attr("vm_name") != "") {
				arr = $(this).attr("vm_name").split(",");
				arr_volume = $(this).attr("volume").split(",");
			}
			for (var i = 0; i < arr.length; i++) {
				var vm_name = arr[i];
				var volume_name = arr_volume[i];
				$("#toppopvm ul").append('<li  class="show-volume2"volume="'
						+ volume_name + '"><img src="' + $("#path").val()
						+ '/css/topoImage/topimg04.png"><span>' + vm_name + " "
						+ '</span></li>')
			}
			$("#toppopvm").css({
						position : "absolute",
						left : $(this).offset().left - 120,
						top : Number($(this).offset().top) - 80
					})
			if (arr.length != 0){
				$("#toppopvm").show();
//				$('#toppopvm').popover('toggle');
			}
				 if(true){
				 Controller.showVolume2();
				 }
			}
		}
//		, function() {
//			window.clearTimeout(t);
//			var t = window.setTimeout(function() {
//						$("#toppopvm").hide();
//						$("#toppopvm ul").empty();
//						Controller.flag = true;
//					}, 5000);
//		}
		);
		Controller.showVolume();
	}
}
function initView(id, callback) {
	var param = {
		id : id
	};
	Dcp.JqueryUtil.dalinAsyncReq("/pr/routerTop", {
				id : id
			}, function(data) {
				var json = JSON.stringify(data);
				if(!data.data){
					data.data = data;
				}
				var info = data.data.routetopresponse.route;
				$(".tree").empty();
				var route_name = info.name;
				var subnet_num = info.subnet.length;
				$("a.router-id").text(route_name.slice(0,6)+"...");
				$("a.router-id").attr("title",route_name);
				var total_height = subnet_num * 140 + "px";
				var total_width = "";
				var publicIP = "";
				var publicIPlength = info.publicip.length;
				for (var u = 0; u < info.publicip.length; u++)
					publicIP = publicIP + info.publicip[u].ipaddress + " ";
				$(".top-router-linkip").css({
						height : publicIPlength*20
					})
				for (var i = 0; i < subnet_num; i++) {
					var vm_num = 0;
					if(info.subnet[i].vm)
						vm_num = info.subnet[i].vm.length;
					var lb_num = 0;
					if(info.subnet[i].lbs)
						lb_num = info.subnet[i].lbs.length;
					if (vm_num + lb_num > 3)
						total_width = 250 + (vm_num + lb_num - 3) * 55;
					$("div.tree")
							.append('<div class="top-router-vxnet" style="height: 125px;">'
									+ '<a class="ip-network" data-permalink="" href="#" style="top: 72.5px;">'
									+ "网段:"
									+ info.subnet[i].ipsegments
									+ " 网关:"
									+ info.subnet[i].gateway
									+ '</a>'
									+ '<a class="vxnet-name" data-permalink="" title="'
									+info.subnet[i].name
									+'" href="#">'
									+ info.subnet[i].name.slice(0,6)
									+"..."
									+ '</a>'
									+ '<div class="top-router-vxnet-instances" id="test_'
									+ i
									+ '" style="height: 125px; width: '
									+ total_width + 'px;"></div>');
					for (var m = 0; m < lb_num; m++) {
						var vm_name = "";
						if (info.subnet[i].lbs[m] != null) {
							var lbs_vm_num = 0;
							if(info.subnet[i].lbs[m].vm)
								lbs_vm_num = info.subnet[i].lbs[m].vm.length
							if (lbs_vm_num != 0) {
								var vm_volume_name2 = "";
								for (var n = 0; n < lbs_vm_num; n++) {
									var vm_volume_length2 = 0;
									if(info.subnet[i].lbs[m].vm[n].volume)
										vm_volume_length2 = info.subnet[i].lbs[m].vm[n].volume.length;
									for (var q = 0; q < vm_volume_length2; q++) {
										if (info.subnet[i].lbs[m].vm[n].volume[q] != null) {
											if (p != vm_volume_length2 - 1)
												vm_volume_name2 = vm_volume_name2
														+ info.subnet[i].lbs[m].vm[n].volume[q].name
														+ " ";
											else
												vm_volume_name2 = vm_volume_name2
														+ info.subnet[i].lbs[m].vm[n].volume[q].name;
										}
									}
								if (info.subnet[i].lbs[m].vm[n] != null) {
									if (n != lbs_vm_num - 1) {
										vm_name = vm_name
												+ info.subnet[i].lbs[m].vm[n].instancename
												+ ",";
										vm_volume_name2 = vm_volume_name2 + ",";
									} else {
										vm_name = vm_name
												+ info.subnet[i].lbs[m].vm[n].instancename;

									}
								}
								}
							}
							if (info.subnet[i].lbs[m].name.length > 5)
								name = info.subnet[i].lbs[m].name.slice(0, 6);
							$("#test_" + i)
									.append('<a class="component-vxnet-slb show" title="点击查看挂载的虚拟机" volume="'
											+ vm_volume_name2
											+ '" vm_name="'
											+ vm_name
											+ '"style="margin-top: 18px;'
											+ 'margin-bottom:18px;" href="#" id="a1"><span class="instance-name" data-permalink="" title="'
											+ info.subnet[i].lbs[m].name
											+ '">'
											+ name + '</span></a>')
						}
					}
					for (var j = 0; j < vm_num; j++) {
						var vm_volume_length = 0;
						if(info.subnet[i].vm[j].volume)
							vm_volume_length = info.subnet[i].vm[j].volume.length;
						var vm_volume_name = "";
						for (var p = 0; p < vm_volume_length; p++) {
							if (info.subnet[i].vm[j].volume[p] != null) {
								if (p != vm_volume_length - 1)
									vm_volume_name = vm_volume_name
											+ info.subnet[i].vm[j].volume[p].name
											+ " ";
								else
									vm_volume_name = vm_volume_name
											+ info.subnet[i].vm[j].volume[p].name;
							}
						}
						var subnet_vm_ip = "";
						var thisip = "";
						if(info.subnet[i].vm[j].ip){
							thisip = info.subnet[i].vm[j].ip;
							subnet_vm_ip = info.subnet[i].vm[j].ip.split(".")[3];
						}
						$("#test_" + i)
								.append('<div class="component-vxnet-instance show-volume"  volume="'
										+ vm_volume_name
										+ '" style="margin-top: 18px; margin-bottom:18px;">'
										+ '<a class="instance-name" title="'
										+info.subnet[i].vm[j].instancename+"(内网ip："+thisip+")"
										+'" data-permalink="" href="#">'
										+ info.subnet[i].vm[j].instancename.slice(0,4)
										+"..."
										+ "(."
										+ subnet_vm_ip
										+ ")" + '</a></div>');
					}
				}
				$("#publicIP").text(publicIP);
				$("div.top-router-vxnets").css({
							height : total_height
						});
				$(".top-router").show();
				if (callback) {
					callback();
				}
			});
};