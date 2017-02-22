function checkIpGateWay(gateway,cidr) {
	var flag = true;
	var obj = cidrToRangeByObject(cidr);
	var array = gateway.split(".");
	var segment1 = array[0];
	var segment2 = array[1];
	var segment3 = array[2];
	var segment4 = array[3];
	if(obj.ip1[0] == "10"){
		if(segment1 == obj.ip1[0]
		&&(segment2 <= obj.ip2[1]&&segment2 >= obj.ip2[0])
		&&(segment3 <= obj.ip3[1]&&segment3 >= obj.ip3[0])
		&&(segment4 < obj.ip4[1]&&segment4 > obj.ip4[0])){
			flag = true;
		}
		else{
			flag = false;
		}
	}
	else{
		if(segment1 == obj.ip1[0]&&segment2 == obj.ip2[0]
		&&(segment3 <= obj.ip3[1]&&segment3 >= obj.ip3[0])
		&&(segment4 < obj.ip4[1]&&segment4 > obj.ip4[0])){
			flag = true;
		}
		else{
			flag = false;
		}
	}
	return (checkRange(".gateway .range") && flag);
};
function checkIpInCIDR(gateway,cidr) {
	var flag = true;
	var obj = cidrToRangeByObject(cidr);
	var array = gateway.split(".");
	var segment1 = array[0];
	var segment2 = array[1];
	var segment3 = array[2];
	var segment4 = array[3];
	if(obj.ip1[0] == "10"){
		if(segment1 == obj.ip1[0]
		&&(segment2 <= obj.ip2[1]&&segment2 >= obj.ip2[0])
		&&(segment3 <= obj.ip3[1]&&segment3 >= obj.ip3[0])
		&&(segment4 < obj.ip4[1]&&segment4 > obj.ip4[0])){
			flag = true;
		}
		else{
			flag = false;
		}
	}
	else{
		if(segment1 == obj.ip1[0]&&segment2 == obj.ip2[0]
		&&(segment3 <= obj.ip3[1]&&segment3 >= obj.ip3[0])
		&&(segment4 < obj.ip4[1]&&segment4 > obj.ip4[0])){
			flag = true;
		}
		else{
			flag = false;
		}
	}
	return flag;
};
function isIpSegmentCoincide(cidr,array,routeId){
	if(typeof(cidr) == "undefined"){
			return true;
	}
	if(routeId == "")
		return true;
	var first = (cidr.split("/")[0]).split(".")[0];
	var flag = true;
	var obj = cidrToRangeByObject(cidr);
	var ip2 = obj.ip2;
	var ip3 = obj.ip3;
	var ip4 = obj.ip4;
	$.each(array,function(){
		if(typeof(this.cidr) == "undefined"){
			return true;
		}
		if(typeof(this.routerId) == "undefined"){
			return true;
		}
		var obj2 = cidrToRangeByObject(this.cidr);
		var _ip1 = obj2.ip1;
		var _ip2 = obj2.ip2;
		var _ip3 = obj2.ip3;
		var _ip4 = obj2.ip4;
		if(routeId == this.routerId){
			if(first == "10"&&_ip1 == "10"){
				if((ip2[0] <= _ip2[1]&&ip2[0] >= _ip2[0])
					||(_ip2[0] <= ip2[1]&&_ip2[0] >= ip2[0])
					||(_ip2[1] <= ip2[1]&&_ip2[0] >= ip2[0])
					||(_ip2[1] >= ip2[1]&&_ip2[0] <= ip2[0])){
					if((ip3[0] <= _ip3[1]&&ip3[0] >= _ip3[0])
						||(_ip3[0] <= ip3[1]&&_ip3[0] >= ip3[0])
						||(_ip3[1] <= ip3[1]&&_ip3[0] >= ip3[0])
						||(_ip3[1] >= ip3[1]&&_ip3[0] <= ip3[0])){
						if((ip4[0] <= _ip4[1]&&ip4[0] >= _ip4[0])
							||(_ip4[0] <= ip4[1]&&_ip4[0] >= ip4[0])
							||(_ip4[1] <= ip4[1]&&_ip4[0] >= ip4[0])
							||(_ip4[1] >= ip4[1]&&_ip4[0] <= ip4[0])){
							flag = false;
						}
					}
				}
			}
			else if(first == "172"&&_ip1 == "172"){
				if(ip2[0] == _ip2[0]){
					if((ip3[0] <= _ip3[1]&&ip3[0] >= _ip3[0])
							||(_ip3[0] <= ip3[1]&&_ip3[0] >= ip3[0])
							||(_ip3[1] <= ip3[1]&&_ip3[0] >= ip3[0])
							||(_ip3[1] >= ip3[1]&&_ip3[0] <= ip3[0])){
							if((ip4[0] <= _ip4[1]&&ip4[0] >= _ip4[0])
								||(_ip4[0] <= ip4[1]&&_ip4[0] >= ip4[0])
								||(_ip4[1] <= ip4[1]&&_ip4[0] >= ip4[0])
								||(_ip4[1] >= ip4[1]&&_ip4[0] <= ip4[0])){
								flag = false;
							}
					}
				}
			}
			else if(first == "192"&&_ip1 == "192"){
				if((ip3[0] <= _ip3[1]&&ip3[0] >= _ip3[0])
						||(_ip3[0] <= ip3[1]&&_ip3[0] >= ip3[0])
						||(_ip3[1] <= ip3[1]&&_ip3[0] >= ip3[0])
						||(_ip3[1] >= ip3[1]&&_ip3[0] <= ip3[0])){
						if((ip4[0] <= _ip4[1]&&ip4[0] >= _ip4[0])
							||(_ip4[0] <= ip4[1]&&_ip4[0] >= ip4[0])
							||(_ip4[1] <= ip4[1]&&_ip4[0] >= ip4[0])
							||(_ip4[1] >= ip4[1]&&_ip4[0] <= ip4[0])){
							flag = false;
						}
				}
			}
		}
		else{
			return true;
		}
	});
	return flag;
};
function cidrToRangeByObject(cidr){
	if(!cidr)
		return;
	var obj = {ip1:[],ip2:[],ip3:[],ip4:[]};
	var array = cidr.split("/");
	var mask = Number(array[1]);
	var ipArray = array[0].split(".");
	var segment1 = ipArray[0];
	var segment2 = Number(ipArray[1]);
	var segment3 = Number(ipArray[2]);
	var segment4 = Number(ipArray[3]);
	var tempBin = fomartIP(segment1)+fomartIP(segment2)+fomartIP(segment3)+fomartIP(segment4);
	var str = "";
	for(var i=0;i<32-mask;i++){
		str += "1";
	}
	var bin = tempBin.slice(0,mask)+str;
	var binSegment1 = bin.slice(0,8);
	var binSegment2 = bin.slice(8,16);
	var binSegment3 = bin.slice(16,24);
	var binSegment4 = bin.slice(24,32);
	var _segment1 = Number(ConvertToDecimal(binSegment1));
	var _segment2 = Number(ConvertToDecimal(binSegment2));
	var _segment3 = Number(ConvertToDecimal(binSegment3));
	var _segment4 = Number(ConvertToDecimal(binSegment4));
	if(segment1 == "10"){
		obj.ip1.push("10")
		obj.ip2.push(segment2);
		obj.ip2.push(_segment2);
	}
	else if(segment1 == "172"){
		obj.ip1.push("172");
		obj.ip2.push(segment2);
	}
	else if(segment1 == "192"){
		obj.ip1.push("192");
		obj.ip2.push("168");
	}
	obj.ip3.push(segment3);
	obj.ip3.push(_segment3);
	obj.ip4.push(segment4);
	obj.ip4.push(_segment4);
	return obj;
}

function checkBackupDNS() {
	var flag = false;
	$(".backup_dns .range").each(function(){
		if($(this).val() != "")
			flag = true;
	})
	if(!flag)
		return true;
	return checkRange(".backup_dns .range");
};
function checkDNS() {
	return checkRange(".dns .range");
};
//检查cidr是否合法
function checkCIDR(cidr) {
	var flag = checkRange(".cidr .range");
	if (!flag)
		return false;
	var arr1 = cidr.split("/");
	var arr2 = arr1[0].split(".");
	var mask = Number(arr1[1]);
	var ip_1 = arr2[0];
	var ip_2 = arr2[1];
	var ip_3 = arr2[2];
	var ip_4 = arr2[3];
	if (ip_1 != "10" && ip_1 != "172" && ip_1 != "192") {
		return false
	}
	//b类、c类地址第二段的取值范围
	if (ip_1 == "192" && ip_2 != "168") {
		return false;
	} else if (ip_1 == "172") {
		if (ip_2 < 16 || ip_2 > 31) {
			return false;
		}
	}
	//a类、b类、c类地址的掩码位范围
	if (ip_1 == "172") {
		if(mask < 12 || mask > 31)
			return false
	}else if (ip_1 == "192") {
		if(mask < 16 || mask > 31)
			return false
	}else if (ip_1 == "10") {
		if(mask < 8 || mask > 31)
			return false
	}
	var binaryIP = fomartIP(ip_1) + fomartIP(ip_2) + fomartIP(ip_3)
			+ fomartIP(ip_4);
	var subBinaryIP = binaryIP.slice(mask);
	if (subBinaryIP.indexOf("1") > -1) {
		return false
	}
	return true;
};
//将十进制数字转换成8位二进制
function fomartIP(ip) {
	dec = ip
	bin = "";
	while (dec > 0) {
		if (dec % 2 != 0) {
			bin = "1" + bin;
		} else {
			bin = "0" + bin;
		}
		dec = parseInt(dec / 2);
	}
	var length = bin.length;
	if (length < 8) {
		var nul = 8 - length;
		var count = 0;
		var str = "";
		while (count < nul) {
			str += "0";
			count++;
		}
		bin = str + bin;
	}
	return bin;
};
//根据掩码位生成掩码
function getMask(num) {
	var str = "";
	var subStr1 = "";
	var subStr2 = "";
	for(var i = 0;i < num;i++){
		subStr1 += "1";
	}
	var num2 = 32 - num;
	for(var i = 0;i < num2;i++){
		subStr2 +="0";
	}
	var str = subStr1 + subStr2;
	var ip1 = str.slice(0,8);
	var ip2 = str.slice(8,16);
	var ip3 = str.slice(16,24);
	var ip4 = str.slice(24,32);
	return ConvertToDecimal(ip1) + "." + ConvertToDecimal(ip2) + "." + ConvertToDecimal(ip3) + "." + ConvertToDecimal(ip4);
};
function StringToNumberArray(Bin) {
    var numberArray = [];
    for (var i = 0; i < Bin.length; i++) {
        numberArray.push(Bin.substring(i, i + 1));
    }
    return numberArray;
}
function ConvertToDecimal(Bin) {
    var decimalNumber = 0;
    var numberArray = StringToNumberArray(Bin);
    numberArray.reverse();
    for (var i = 0; i < numberArray.length; i++) {
        decimalNumber += numberArray[i] * Math.pow(2, i);
    }
    return decimalNumber;
}
//检查ip每一个输入框的取值范围0~255
function checkRange(selector) {
	var flag = true;
	$(selector).each(function() {
				if (!/^\d+$/.test($(this).val())) {
					flag = false;
				}
				var val = Number($(this).val());
				if (val < 0 || val > 255) {
					flag = false;
				}
			});
	return flag
};