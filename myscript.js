var UP = 0, DW = 0, NSTATES = 0, NOWPOS = 0; 
var STATES = [{'up': 0, 'dw': -1, 'beg': 0, 'end': -1, 'val': 0, 'bsn': 0}];
var ASIZE = {'n': 0, 'm': 0}, ARR = new Array, ANS = -Infinity;
var STOPFLAG, SPEED = 1, VER = false, HOR = false;
function getFile(){//获取用户选择的文件并进行计算，画出初始状态
	var form = document.getElementById('fileform');
	if (form["uploadfile"].files.length > 0){
		var file = form["uploadfile"].files[0];
		var reader = new FileReader();

		reader.onload = function() { 
			var sStr = reader.result;
			if(strtoarr(sStr, ARR, ASIZE)){
				cparr(ARR, ASIZE);
				calculate();
				paint(STATES[0]);
			}
		} 
		reader.readAsText(file);
	}
}
function randFile(){//随机生成用户指定大小的矩阵并计算，画出初始状态
	var form = document.getElementById('textform');
	var tn = Number(form["nrow"].value);
	var tm = Number(form["ncol"].value);
	if(!isNaN(tn) && !isNaN(tm) && tn > 0 && tm >0){
		ASIZE = {'n': tn, 'm': tm};
		(function(arr, asize){
			var i, j;
			for(i = 1; i <= asize.n; i ++){
				arr[i] = new Array;
				for(j = 1; j <= asize.m; j ++)
					arr[i][j] = Math.floor(Math.random()*100)*(Math.random() > 0.5 ? 1 : -1);
			}
		})(ARR, ASIZE);
		cparr(ARR, ASIZE);
		calculate();
		paint(STATES[0]);
	}
	else
		alert("Error: invalid input");
}
function calculate(){//计算最优解并保存中间状态
	stop();
	reset();
	var tsize = new Object;
	tsize.n = ASIZE.n;
	tsize.m = ASIZE.m;
	if(VER)tsize.m = 2 * ASIZE.m - 1;
	if(HOR)tsize.n = 2 * ASIZE.n - 1;
	ANS = rect(tsize, ASIZE);
}
function cparr(arr, asize){//复制数组，行列均变为原来的2倍，用于横纵连接时用
	var i, j;
	for(i = 1; i <= asize.n; i ++)
		for(j = asize.m + 1; j <= 2 * asize.m; j ++)
			arr[i][j] = arr[i][j - asize.m];
	for(i = asize.n + 1; i <= 2 * asize.n; i ++){
		arr[i] = new Array;
		for(j = 1; j <= 2 * asize.m; j ++)
			arr[i][j] = arr[i - asize.n][j];
	}
}
function resetvh(){//用户点击reset后改变横纵连接标志并重新计算与绘制初始状态
	var checkform = document.getElementById('checkform');
	VER = checkform['ver'].checked;
	HOR = checkform['hor'].checked;
	calculate();
	paint(STATES[0]);
}
function reset(){//每次重新计算前重置一部分全局变量
	UP = 0; DW = 0; NSTATES = 0; NOWPOS = 0;
	STATES = [{'up': 0, 'dw': -1, 'beg': 0, 'end': -1, 'val': 0, 'bsn': 0}];
	ANS = -Infinity;
}
function stop(){//停止自动循环
	clearInterval(STOPFLAG);
}
function next(){//绘制下一步
	stop();
	if(NOWPOS < NSTATES)NOWPOS ++;
	paint(STATES[NOWPOS]);
}
function prev(){//绘制上一步
	stop();
	if(NOWPOS > 0)NOWPOS --;
	paint(STATES[NOWPOS]);
}
function nnext(){//从当前状态开始向后自动循环
	stop();
	var f = function(){
		if(NOWPOS < NSTATES){
			next();
			STOPFLAG = setTimeout(f, 1000 / SPEED);
		}
		else stop();
	};
	f();
}
function pprev(){//从当前状态开始自动逐步后退
	stop();
	var f = function(){
		if(NOWPOS > 0){
			prev();
			STOPFLAG = setTimeout(f, 1000 / SPEED);
		}
		else stop();
	};
	f();
}
function upspeed(){//用户点击+后更改速度标志
	if(SPEED < 10)SPEED ++;
	var label = document.getElementById("speed");
	label.innerHTML = "&nbsp;&nbsp;" + SPEED + "&nbsp;&nbsp;";
}
function dwspeed(){//用户点击-后更改速度标志
	if(SPEED > 1)SPEED --;
	var label = document.getElementById("speed");
	label.innerHTML = "&nbsp;&nbsp;" + SPEED + "&nbsp;&nbsp;";
}
function paint(state){//先按state进行染色，然后按染色结果输出当前状态
	var i, j;
	col = new Array;
	for(i = 1; i <= ASIZE.n; i ++){
		col[i] = new Array;
		for(j = 1; j <= ASIZE.m; j ++){
			col[i][j] = 0;
		}
	}
	for(i = state.up; i <= state.dw; i ++){
		for(j = state.beg; j <= state.end; j ++){
			col[(i - 1) % ASIZE.n + 1][(j - 1) % ASIZE.m +1] += 1;
		}
	}
	for(i = STATES[state.bsn].up; i <= STATES[state.bsn].dw; i ++){
		for(j = STATES[state.bsn].beg; j <= STATES[state.bsn].end; j ++){
			col[(i - 1) % ASIZE.n + 1][(j - 1) % ASIZE.m +1] += 2;
		}
	}
	output(state.val, STATES[state.bsn].val, col);
}
function rect(asize, alim){//真正的计算过程，asize是矩阵大小，alim是对子矩阵大小的限制
	var sum = new Array, sum1 = new Array;
	var minN, ans, temp, i, j, k;
	for(i = 0; i <= asize.n; i ++){
		sum[i] = new Array(asize.m + 1);
		for(j = 0; j <= asize.m; j ++){
			sum[i][j] = 0;
		}
	}

	for(i = 1; i <= asize.n; i ++){
		for(j = 1; j <= asize.m; j ++){
			sum[i][j] = sum[i-1][j] + sum[i][j-1] - sum[i-1][j-1] + ARR[i][j];
		}
	}
	ans = -Infinity;
	for(i = 1; i <= asize.n; i ++){
		UP = i;
		if(i + alim.n - 1 < asize.n)
			minN = i + alim.n - 1;
		else
			minN = asize.n;

		for(j = i; j <= minN; j ++){
			DW = j;
			for(k = 0; k <= asize.m; k ++)
				sum1[k] = sum[j][k] - sum[i-1][k];
			temp = monoList(sum1, asize.m, alim.m);
			if(temp > ans)
				ans = temp;
		}
	}
	return ans;
}
function monoList(x, len, lim){//单调队列，用于计算一维情况
	var head, tail, ans, temp, i;
	var list = new Array;

	list[1] = 0;
	head = 1;
	tail = 1;
	//if(x[list[tail]] >= x[1])
	//	list[tail] = 1;
	//else
	//	list[++tail] = 1;

	ans = -Infinity;
	for(i = 1; i <= len; i ++){
		while(i - list[head] > lim)head ++;
		temp = x[i] - x[list[head]];
		saveData(i, list[head], temp, (temp > STATES[STATES[NSTATES].bsn].val ? 
						NSTATES + 1 : STATES[NSTATES].bsn));
		if(temp > ans)ans = temp;
		while(tail >= head && x[list[tail]] >= x[i])
			tail --;
		list[++ tail] = i;
	}
	return ans;
}
function saveData(t, h, v, beststateno){//保存数据，t是当前子矩阵的右边界，h是左边界，v是和，beststateno是到目前为止最大子数组的状态编号
	STATES[++ NSTATES] = {'beg': h + 1,
					'end': t,
					'val': v,
					'up': UP,
					'dw': DW,
					'bsn': beststateno,
	}; 
}
function strtoarr(sstr, aarr, asize){//将文件读入的字符串转为数组，只检查文件内的数字
	var temp = new Array;
	var i, j;
	temp = sstr.match(/[+-]?\d+(\.\d+)?/g);
	if(!temp || temp.length < 2){
		alert("Error: invalid input file");
		return false;
	}
	for(i = 0; i < temp.length; i ++){
		temp[i] = Number(temp[i]);
	}
	asize.n = temp.shift();
	asize.m = temp.shift();
	if(asize.n < 1){
		alert("Error: n < 1");
		return false;
	}
	if(asize.m < 1){
		alert("Error: m < 1");
		return false;
	}
	if(temp.length < asize.n * asize.m){
		alert("Error: no enough numbers!");
		return false;
	}
	for(i = 1; i <= asize.n; i ++){
		aarr[i] = new Array(asize.m + 1);
		for(j = 1; j <= asize.m; j++){
			aarr[i][j] = temp.shift();
		}
	}
	return true;
}
function output(val, ansnow, col){//按col输出当前状态，col是染色结果，val是当前区域的和，ansnow是到目前为止的最优解的值
	var table = document.getElementById("mytable");
	var i, j;
	var html = "<caption>Max = " + ANS + "<br />Red = " + val + "<br />Yellow = " + ansnow + "</caption>";
	for(i = 1; i <= ASIZE.n; i ++){
		html += "<tr>";
		for(j = 1; j <= ASIZE.m; j ++){
			html += "<td" + 
				(col[i][j] == 0 ? "" : 
				 (col[i][j] == 1 ? " bgcolor='red'" :
				  (col[i][j] == 2 ? " bgcolor='yellow'" : " bgcolor='orange'")))
				+ " align='right'>" + ARR[i][j] + "</td>";
		}
		html += "</tr>";
	}
	table.innerHTML = html;
}
