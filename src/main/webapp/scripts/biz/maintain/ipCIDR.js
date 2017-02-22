function compareIp(ip1, ip2) {
			var ip1Max = findIpMax(ip1);
			var ip1Min = findIpMin(ip1);
			var ip2Max = findIpMax(ip2);
			var ip2Min = findIpMin(ip2);
			for (com = 0; com < 4; com++) {
				if (ip1Min[com] > ip2Max[com] || ip2Min[com] > ip1Max[com]) {
					break;
				} else if (ip1Min[com] == ip2Max[com]
						&& ip2Min[com] == ip1Max[com]) {
					continue;
				} else {
					return false;//有重叠
					break;
				}
			}
			return true;//无重叠
		}

		function findIpMax(ip) {
			ipMatrix = ip.split("/");
			net = ipMatrix[0];
			netNum = Number(ipMatrix[1]);
			var netMatrix = net.split(".");
			var netCodeMatrix = new Array(32);
			for (k = 0; k < 4; k++) {
				var netk = fromIntToCode(netMatrix[k]);
				for (j = 0; j < 8; j++) {
					netCodeMatrix[8 * k + j] = netk[j];
				}
			}
			for (max = netNum; max < 32; max++) {
				netCodeMatrix[max] = 1;
			}
			var netMaxMatrix = new Array(4);
			for (i = 0; i < 4; i++) {
				netMaxMatrix[i] = 0;
				for (j = 0; j < 8; j++) {
					netMaxMatrix[i] = netMaxMatrix[i]
							+ netCodeMatrix[8 * i + j] * Math.pow(2, 7 - j);
				}
			}
			netMaxMatrix[3] = netMaxMatrix[3] - 1;//全1的ip不用
			return netMaxMatrix;
		}

		function findIpMin(ip) {
			for (i = 0; i < ip.length; i++) {
				if (ip.charAt(i) == '/') {
					var net = ip.substring(0, i);
					var netNum = Number(ip.substring(i + 1, ip.length));
				}
			}
			var netMatrix = net.split(".");
			var netCodeMatrix = new Array(32);
			for (k = 0; k < 4; k++) {
				var netk = fromIntToCode(netMatrix[k]);
				for (j = 0; j < 8; j++) {
					netCodeMatrix[8 * k + j] = netk[j];
				}
			}
			for (min = netNum; min < 32; min++) {
				netCodeMatrix[min] = 0;
			}
			var netMinMatrix = new Array(4);
			for (i = 0; i < 4; i++) {
				netMinMatrix[i] = 0;
				for (j = 0; j < 8; j++) {
					netMinMatrix[i] = netMinMatrix[i]
							+ netCodeMatrix[8 * i + j] * Math.pow(2, 7 - j);
				}
			}
			netMinMatrix[3] = netMinMatrix[3] + 1;//全0的ip不用
			return netMinMatrix;
		}

		function fromIntToCode(num) {
			var num = Number(num);
			var numArray = new Array(8);
			var s = num;
			for (i = 7; i >= 0; i--) {
				if (s >= Math.pow(2, i)) {
					numArray[7 - i] = 1;
					s = s - Math.pow(2, i);
				} else {
					numArray[7 - i] = 0;
				}
			}
			return numArray;
		}
