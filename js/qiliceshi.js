let image_urls = [
	"images/blackpiece.png",
	"images/whitepiece.png",
	"images/wrongpiece.png",
	"images/tishipiece.black.png",
	"images/tishipiece.white.png",
	"images/triggerpiece.png",
	"images/circlepiece.png",
	"images/markpiece.png",
	"images/squarepiece.png",
	//"images/labelapiece.png",
	//"images/labelbpiece.png",
	//"images/labelcpiece.png",
	//"images/labeldpiece.png",
	//"images/labelepiece.png",
];

var images = [];
var image_loadcount = 0;

var m_iChangIndex, m_iTiIndex; //第几场，第几题（从0开始）
var m_questions;
var m_questionStatuses = []; //本场成绩

var m_problem = new Problem();
var m_board = new Board();

//function $(id) {
//  return document.getElementById(id);
//}

document.addEventListener('DOMContentLoaded', load);


//页面启动
function load() {
	initJqueryEvents();
	loadAllImages();
}



//初始化jquery的事件，必须在load中调用，放在外面没用
function initJqueryEvents(){
	$('.select').on('click', '.placeholder', function(e) {
		var parent = $(this).closest('.select');
		if (!parent.hasClass('is-open')) {
			parent.addClass('is-open');
			$('.select.is-open').not(parent).removeClass('is-open');
		} else {
			parent.removeClass('is-open');
		}
		e.stopPropagation();
	}).on('click', 'ul>li>span', function() {
		//选中一个
		var parent = $(this).closest('.select');
		parent.removeClass('is-open').find('.placeholder'); //.text($(this).text());
		var newChang = parseInt($(this).text());
		newChang--;
		clickChangeChang(newChang);
	});
	
	$(document).on('click', function() {
		$('.select.is-open').removeClass('is-open');
	});

	$('#qipan').on('click', clickQipan);
}

//加载全部图片
function loadAllImages(){
	image_loadcount = 0;
	for(var i = 0 ; i < image_urls.length ; i++){
		images[i] = new Image()
		images[i].src = image_urls[i]
		images[i].onload = function(){
       		//第i张图片加载完成
			image_loadcount++
       		if(image_loadcount == image_urls.length ){
          		//全部加载完成
				loadImagesFinished();
       		}
    	}
	}
}

//图片加载完成后
function loadImagesFinished(){
	var canvas = $('#qipan');
	m_board.initBoard(canvas, m_problem, false);
	m_board.image_blackpiece = images[0];
	m_board.image_whitepiece = images[1];
	m_board.image_wrongpiece = images[2];
	m_board.image_tishiblackpiece = images[3];
	m_board.image_tishiwhitepiece = images[4];
	m_board.image_triggerpiece = images[5];
	m_board.image_circlepiece = images[6];
	m_board.image_markpiece = images[7];
	m_board.image_squarepiece = images[8];

	initPageData();
	
}

//初始化整页数据
function initPageData(){
	//第几场，第几题，从url参数获取
	m_iChangIndex = 0; 
	m_iTiIndex = 0;
	
	var paraChang = getQueryVariable("chang");
	var paraTi = getQueryVariable("ti");
	var iChang = parseInt(paraChang);
	var iTi = parseInt(paraTi);

	if(!isNaN(iChang) && !isNaN(iTi) && iChang>=0 && iChang<32 && iTi>=0 && iTi<10){
		m_iChangIndex = iChang;
		m_iTiIndex = iTi;
	}

	initChangData();
}

//以下JS函数用于获取url参数:
function getQueryVariable(variable)
{
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return(0);
}

//初始化一场的数据
function initChangData(){
	//读出棋谱
	m_questions = g_wqqlzwcs[m_iChangIndex];  

	//清空成绩
	m_questionStatuses = []; //当前的答题情况
	for(var i=0; i<m_questions.length; i++){
		m_questionStatuses.push({});
		m_questionStatuses[i] = {
			manfen: 10,
			tixing: getTixing(m_questions[i]),
			answered: false,
			defen: null
		};
	}

	startProblem();
}

//开始一题
function startProblem(){
	var strSgf = m_questions[m_iTiIndex];
	//console.log("strSgf = " + strSgf);

	m_problem.Start(strSgf, false);
			
	customizeqipu(m_problem.m_qipu);

	m_board.showBoard();
	
	showProblemInfo();
}

//获取题型
function getTixing(strSgf)
{
	var tixing = "";
	if(strSgf.indexOf("（布局）") >= 0){
		tixing = "布局";
	}else if(strSgf.indexOf("（中盘）") >= 0){
		tixing = "中盘";
	}else if(strSgf.indexOf("（官子）") >= 0){
		tixing = "官子";
	}else if(strSgf.indexOf("（手筋）") >= 0){
		tixing = "手筋";
	}else if(strSgf.indexOf("（死活）") >= 0){
		tixing = "死活";
	}else if(strSgf.indexOf("（终盘）") >= 0){
		tixing = "终盘";
	}
	return tixing;
}

//对棋谱进行二次加工
function customizeqipu(qipu)
{
	qipu.fenzhis = [];

	//去掉“附图”分支		
	for(var i=qipu.m_lstStepArrays.length - 1; i>=0; i--){
		var steps = qipu.m_lstStepArrays[i];
		var isFutu = false; //是否为附图
		for(var k=0; k<steps.length; k++){
			var nodename = steps[k].m_extraInfo.m_strNodeName;
			if(nodename.indexOf("附图") >= 0){
				isFutu = true;
				break;
			}
		}
		if(isFutu){
			qipu.m_lstStepArrays.splice(i, 1); //删除这个分支
		}
	}		

	//注释中“图x”改成“着法x”
	for(var i=qipu.m_lstStepArrays.length - 1; i>=0; i--){
		var steps = qipu.m_lstStepArrays[i];
		for(var k=0; k<steps.length; k++){
			steps[k].m_extraInfo.m_strComment = steps[k].m_extraInfo.m_strComment.replace(/图1/g, "着法1");
			steps[k].m_extraInfo.m_strComment = steps[k].m_extraInfo.m_strComment.replace(/图2/g, "着法2");
			steps[k].m_extraInfo.m_strComment = steps[k].m_extraInfo.m_strComment.replace(/图3/g, "着法3");
			steps[k].m_extraInfo.m_strComment = steps[k].m_extraInfo.m_strComment.replace(/图4/g, "着法4");
		}
	}		


	//提取信息
	for(var i=0; i<qipu.m_lstStepArrays.length; i++){
		qipu.fenzhis.push({});

		qipu.fenzhis[i].firstStep = qipu.m_lstStepArrays[i][0]; //提取每个分支的第一个step

		//提取每个分支的得分
		var nodename = qipu.m_lstStepArrays[i][0].m_extraInfo.m_strNodeName;
		qipu.fenzhis[i].defen = 0;
		if(nodename.indexOf("10分") >= 0){
			qipu.fenzhis[i].defen = 10;
		}else if(nodename.indexOf("9分") >= 0){
			qipu.fenzhis[i].defen = 9;
		}else if(nodename.indexOf("8分") >= 0){
			qipu.fenzhis[i].defen = 8;
		}else if(nodename.indexOf("7分") >= 0){
			qipu.fenzhis[i].defen = 7;
		}else if(nodename.indexOf("6分") >= 0){
			qipu.fenzhis[i].defen = 6;
		}else if(nodename.indexOf("5分") >= 0){
			qipu.fenzhis[i].defen = 5;
		}else if(nodename.indexOf("4分") >= 0){
			qipu.fenzhis[i].defen = 4;
		}else if(nodename.indexOf("3分") >= 0){
			qipu.fenzhis[i].defen = 3;
		}else if(nodename.indexOf("2分") >= 0){
			qipu.fenzhis[i].defen = 2;
		}else if(nodename.indexOf("1分") >= 0){
			qipu.fenzhis[i].defen = 1;
		}
	}
}

//测试画棋盘
/*function drawQipan(){
	var ctx = $('#qipan')[0].getContext('2d');

	//ctx.fillStyle="#0000ff";
	//ctx.fillRect(0, 0, $('qipan').offsetWidth,100);

	//ctx.drawImage(image_blackpiece, 0, 0);
	
	var cx = 75;
	var cy = 77;

	ctx.lineWidth = 5;
	ctx.strokeStyle = '#696969';
	ctx.globalAlpha = 0.5;
	ctx.beginPath();
	ctx.moveTo(0, 0);
	ctx.lineTo(100, 200);
	ctx.stroke();
}*/


//显示题目信息：
function showProblemInfo(){
	
	//第几场
	var chang = "0" + (m_iChangIndex+1);
	chang = chang.substring(chang.length - 2);
	$('#currentChang')[0].innerHTML = "第" + chang + "场";

	//成绩表格
	var zongdefen = 0;
	for(var i=0; i<m_questionStatuses.length; i++){
		var trid = "#chengjirow" + i;
		if(i == m_iTiIndex){
			$(trid).addClass("currentchengjirow");
		}else{
			$(trid).removeClass("currentchengjirow");
		}
		$(trid)[0].innerHTML="<td>" + (i+1) +"</td><td>"
					+ m_questionStatuses[i].tixing + "</td><td>10</td><td>" 
					+ (m_questionStatuses[i].answered ? m_questionStatuses[i].defen : "") + "</td>";
		if(m_questionStatuses[i].answered){
			zongdefen += m_questionStatuses[i].defen;
		}
	}
	$("#chengjizong")[0].innerHTML = "<td></td><td>本场得分</td><td>100</td><td>"
			+ zongdefen +"</td>";

	//显示提示
	var strComment = m_problem.getCurrentComment();
	if(m_problem.m_lstRealSteps.length == 1 && strComment == '') //第一步，没有选择预定着法
		strComment = '着法错误，0分。';
	$("#comment")[0].innerHTML = strComment;

	//刷新按钮状态
	$("#buttonPrevProblem").attr("disabled", !(m_iTiIndex > 0));
	$("#buttonNextProblem").attr("disabled", !(m_iTiIndex < m_questions.length - 1));
	$("#buttonWithdraw").attr("disabled", !(m_problem.m_lstRealSteps.length > 0));
	$("#buttonNextStep").attr("disabled", !(m_problem.canTishi() && m_problem.m_lstRealSteps.length > 0));
}



//按钮事件
function clickPrevProblem(){
	if($("#buttonPrevProblem").attr("disabled") == "disabled"){
		return;
	}

	if(m_iTiIndex > 0){
		m_iTiIndex--;
		startProblem();
	}
}

//按钮事件
function clickNextProblem(){
	if($("#buttonNextProblem").attr("disabled") == "disabled"){
		return;
	}

	if(m_iTiIndex < m_questions.length - 1){
		m_iTiIndex++;
		startProblem();
	}
}

//按钮事件
//function clickRestartProblem(){
//}

//按钮事件
function clickWithdraw(){
	if($("#buttonWithdraw").attr("disabled") == "disabled"){
		return;
	}

	if(m_problem.m_lstRealSteps.length > 0){
		m_problem.Withdraw();
		m_board.showBoard();
		showProblemInfo();
	}		
}

//按钮事件
function clickNextStep(){
	if($("#buttonNextStep").attr("disabled") == "disabled"){
		return;
	}

	var res = m_board.autoPutNext();
	if(res){
		showProblemInfo();
	}
}

//按钮事件：切换第几场
function clickChangeChang(newChang){
	if(m_iChangIndex == newChang){
		return;
	}
	
	m_iChangIndex = newChang;
	m_iTiIndex = 0;

	initChangData();
}

//点击canvas
function clickQipan(e)
{
	//相对于canvas左上角的坐标：e.offsetX，e.offsetY
	//console.log("e.offsetX = " + e.offsetX);
	//console.log("e.offsetY = " + e.offsetY);

	var result =  m_board.clickQipan(e.offsetX, e.offsetY);
	if(result){
		checkChengji();
		showProblemInfo();
	}
}

//计算成绩
function checkChengji()
{
	//只处理第一步
	if(m_problem.m_lstRealSteps.length != 1)
		return;

	//本题的当前状态
	var questionstatus = m_questionStatuses[m_iTiIndex];
	
	//只处理第一次答题
	if(questionstatus.answered)
		return;
	questionstatus.answered = true;

	//属于哪个分支，得分多少
	questionstatus.defen = 0;
	var fenzhis = m_problem.m_qipu.fenzhis;
	for(var i=0; i<fenzhis.length; i++){
		if(fenzhis[i].firstStep.Xiangdeng(m_problem.m_lstRealSteps[0])){
			questionstatus.defen = fenzhis[i].defen;
			break;
		}
	}
}


