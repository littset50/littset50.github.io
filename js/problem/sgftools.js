
//import QIMIAN from './qimian'
//import STEP from './step'
//import QIWEI from './qiwei'
//import LABEL from './label'
//import ExtraInfo from './extrainfo'

 //常量
let EMPTY = 0
let BLACK = 1
let WHITE = 2






/**
 * 定义一个棋谱
 */
function Qipu()
{

        //初始状态
        this.m_firstQimian = new QIMIAN(); //初始棋面
        this.m_iFirstColor = BLACK; //谁先

        //走法（二维数组，STEP队列的队列）
        this.m_lstStepArrays = []; 
        
        //qipu的初始信息
        this.m_extraInfo = new ExtraInfo();
    
	this.print = function(){
	/*
		this.m_firstQimian.print();
		console.log("first color:" + this.m_iFirstColor);
		console.log("step array count=" + this.m_lstStepArrays.length);
		for(var i=0; i<this.m_lstStepArrays.length; i++){
            var steps = this.m_lstStepArrays[i];
            var line = "";
            for(var k=0; k<steps.length; k++){
                line += "[" + steps[k].x + "," + steps[k].y + "]" + steps[k].color + "(" + steps[k].m_extraInfo.m_strComment + ")";
            }
            console.log(line);
		}
	*/
	}
}

const SGFWORD_KEY = 0; //键，即[]外的词
const SGFWORD_VALUE = 1; //值，即[]内的词
const SGFWORD_LEFTBRACKET = 2; //左括号 (
const SGFWORD_RIGHTBRACKET = 3; //右括号 )
/**
 * sgf语法分析的结果，一个词
 */
function SgfWord(word, type)
{
    //m_strWord = "";
    //m_iType = 0; 

        this.m_strWord = word;
        this.m_iType = type;
}

function SgfTools()
{
}


/**
 * 检查sgf是否合法 
 */
SgfTools.checkSgf = function(strSgf){
    //长度
	if(strSgf == null || strSgf.length < 10)
		return false;

	//console.log("strSgf = " + strSgf);
    //第一个字符为(，最后一个字符为)
	if(!(strSgf.substring(0,1) == "(" && (strSgf.substring(strSgf.length-1) == ")" || strSgf.substring(strSgf.length-1) == "!"))){
		//console.log(strSgf);
		//console.log("sgf must (....)");
		return false;
	}
    
    //不能有连续 ((
	if(strSgf.indexOf("((") >= 0){
		//console.log("sgf can not ((");
		return false;
	}

	return true;
}

/**
 * 语法分析，提取单词 
 * 返回SgfWord的数组
 */
SgfTools.pickupWords = function(strSgf){
    var listWords = [];

    //循环内的临时变量
    var strTmpItem = ""; //当前正在拼凑的单词
    var bIsItem = false; //当前是否在一个单词中
    var bIsInBracket = false; //当前是否在[]中

    for (var i = 0; i < strSgf.length; i++)
    {
        var ch = strSgf.substring(i,i+1)

        if(ch == "("){
			if(bIsInBracket) //C[]内可能有()
                strTmpItem += ch;
            else
	            listWords.push(new SgfWord("(", SGFWORD_LEFTBRACKET));
        }else if(ch == ")"){
			if(bIsInBracket)
                strTmpItem += ch;
            else
	            listWords.push(new SgfWord("(", SGFWORD_RIGHTBRACKET));
        }else if(ch == "[")
        {
            if(bIsItem == true)
            {
                bIsItem = false;
                listWords.push(new SgfWord(strTmpItem, SGFWORD_KEY));
            }
            bIsInBracket = true;
            strTmpItem = "";
        }
        else if(ch == "]")
        {
            if (bIsInBracket)
            {
                bIsInBracket = false;
                listWords.push(new SgfWord(strTmpItem, SGFWORD_VALUE));
            }
        }
        else
        {
            if(bIsInBracket)
            {
                strTmpItem += ch;
            }
            else
            {
                if ((ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z') || (ch >= '0' && ch <= '9'))
                {
                    if (!bIsItem)
                    {
                        strTmpItem = "";
                        bIsItem = true;
                    }
                    strTmpItem += ch;
                }
                else
                {
                    if (bIsItem)
                    {
                        bIsItem = false;
                        listWords.push(new SgfWord(strTmpItem, SGFWORD_KEY));
                    }
                }
            }
        }
    }

    return listWords;
}

/**
 * 从sgf导入棋谱
 * 不访问外部变量
 * 如失败，返回null
 * 
		(;GM[1]FF[3]SZ[19]AB[il][kl][kj][hj][ii]AW[jk]PL[W];W[jj];B[ki];W[ik];B[hl];W[ji];B[jh];
		W[ih];B[kk];W[hi];B[ij];W[hk])
		GM[1]表示围棋
		FF[3]表示SGF的版本
		SZ[19]表示棋盘大小=19
		TR[**][**]表示三角标记
		AB表示预先放的白子
		AW表示预先方的黑子
		PL表示谁先走，[B]黑先，[W]白先。通常没有此项。有棋谱出现PL[2]，可能是笔误，按照PL[1]黑先、PL[2]白先处理
		B表示下白子
		W表示下黑子
		oa表示横坐标o（=15），纵坐标a（=1）
		C表示注释
        LB[mp:a][lp:b][mo:c][mn:d] 标注
        TR[nq] 三角
        MA[aa]   X 形记号  Mark
        CR[aa]  圆形  Circle
        SQ[aa]  方块 Square
 */
SgfTools.ExpSgf = function(strSgf, bBlackFirst){

    //检查
    var bCheck = SgfTools.checkSgf(strSgf);
    if(bCheck == false){
        return null;
    }

    //语法分析
    var listWords = SgfTools.pickupWords(strSgf);

    var qipu = new Qipu();
    
    var bHasPL = false; //发现有的棋谱没有PL，要用正确步骤来判断谁先走
    var bHasPopArray = false; //有从堆栈弹出的行
    var strCurrentKey = ""; //当前正在处理的key
    var currentStepArray = null; //当前正在处理的队列
    var stackForks = []; //堆栈，记录分叉位置
    for (var i = 0; i < listWords.length; i++){
        var word = listWords[i];
		var strItem = word.m_strWord;

        if(word.m_iType == SGFWORD_LEFTBRACKET){
            if(i == 0){ 
                //第1个字符为(，不处理
            }else{
                if(currentStepArray == null){ //一开始就分叉
                    qipu.m_lstStepArrays[0] = [];
                    currentStepArray = qipu.m_lstStepArrays[0];
                }
                var fork = []; //因成员是引用，不是变量，不能用slice()
                for(var k=0; k<currentStepArray.length; k++){
                    var step = new STEP();
                    step.cloneFrom(currentStepArray[k]);
                    fork.push(step);
                }
                stackForks.push(fork); //压入堆栈
            }
        }else if(word.m_iType == SGFWORD_RIGHTBRACKET){
            if(i == listWords.length - 1){ 
                //最后一个字符为)，不处理
            }else{
                var fork = stackForks.pop(); //弹出堆栈
                var index = qipu.m_lstStepArrays.length;//新建一行
				if(i > 0 && listWords[i-1].m_iType == SGFWORD_RIGHTBRACKET) { //上一个也是 )， 则本array作废，直接用弹出的
					if(index <= 0)
						return null; //sgf非法
					index--;
				}
                qipu.m_lstStepArrays[index] = fork; 
                currentStepArray = qipu.m_lstStepArrays[index];
                bHasPopArray = true;
            }
        }else if (word.m_iType == SGFWORD_KEY){
            strCurrentKey = strItem
        }else if (word.m_iType == SGFWORD_VALUE){
            if (strCurrentKey == "GM"){
            }else if (strCurrentKey == "FF"){
            }else if (strCurrentKey == "SZ"){
            }else if (strCurrentKey == "AB" || strCurrentKey == "AW"){
                if (strItem.length == 2){
                    var x = strItem.substring(0,1).charCodeAt(0) - "a".charCodeAt(0)
                    var y = strItem.substring(1,2).charCodeAt(0) - "a".charCodeAt(0)
                    if (x >= 0 && x < 19 && y >= 0 && y < 19)
                        qipu.m_firstQimian.m_iPointStatus[x][y] = (strCurrentKey == "AB" ? BLACK : WHITE)
                }
            }else if (strCurrentKey == "PL"){
                bHasPL = true
                if (strItem == "W" || strItem == "w" || strItem == "2")
                    qipu.m_iFirstColor = WHITE
                else
                    qipu.m_iFirstColor = BLACK
            }else if (strCurrentKey == "B" || strCurrentKey == "W"){
                if (strItem.length == 2){
                    var x = strItem.substring(0, 1).charCodeAt(0) - 'a'.charCodeAt(0)
                    var y = strItem.substring(1,2).charCodeAt(0) - 'a'.charCodeAt(0)
                    if (x >= 0 && x < 19 && y >= 0 && y < 19){
                        var step = new STEP(x, y, strCurrentKey == "B" ? BLACK : WHITE);
                        if(currentStepArray == null){
                            qipu.m_lstStepArrays[0] = [];
                            currentStepArray = qipu.m_lstStepArrays[0];
                        }
                        currentStepArray.push(step);
                    }
                }
			}else if(strCurrentKey == "N"){
                if(currentStepArray == null)
                    qipu.m_extraInfo.m_strNodeName = strItem;
                else{
                    if(currentStepArray.length > 0){ 
						currentStepArray[currentStepArray.length-1].m_extraInfo.m_strNodeName = strItem;
                    }	
                }			
            }else if(strCurrentKey == "C"){
                if(currentStepArray == null)
                    qipu.m_extraInfo.m_strComment = strItem;
                else{
                    if(currentStepArray.length > 0){ //如果一个步骤下有多个comment，则合并
						currentStepArray[currentStepArray.length-1].m_extraInfo.m_strComment += strItem;
                    }
                }
            }else if(strCurrentKey == "TR"){//TR[nq]
                if (strItem.length == 2){
                    var x = strItem.substring(0, 1).charCodeAt(0) - 'a'.charCodeAt(0);
                    var y = strItem.substring(1,2).charCodeAt(0) - 'a'.charCodeAt(0);
                    if (x >= 0 && x < 19 && y >= 0 && y < 19){
						if(currentStepArray == null)
	                        qipu.m_extraInfo.m_lstTR.push(new QIWEI(x, y));
						else if(currentStepArray.length > 0)
							currentStepArray[currentStepArray.length-1].m_extraInfo.m_lstTR.push(new QIWEI(x, y));
                    }
                }
            }else if(strCurrentKey == "LB"){//LB[rr:a][oq:b][qp:c]
                if (strItem.length == 4){
                    var x = strItem.substring(0, 1).charCodeAt(0) - 'a'.charCodeAt(0);
                    var y = strItem.substring(1, 2).charCodeAt(0) - 'a'.charCodeAt(0);
                    var s = strItem.substring(3, 4);
                    if (x >= 0 && x < 19 && y >= 0 && y < 19){
						if(currentStepArray == null)
	                        qipu.m_extraInfo.m_lstLB.push(new LABEL(x, y, s));
						else if(currentStepArray.length > 0)
							currentStepArray[currentStepArray.length-1].m_extraInfo.m_lstLB.push(new LABEL(x, y, s));
                    }
                }
            }else if(strCurrentKey == "MA") //X 形记号  Mark
            {
                if (strItem.length == 2){
                    var x = strItem.substring(0, 1).charCodeAt(0) - 'a'.charCodeAt(0);
                    var y = strItem.substring(1,2).charCodeAt(0) - 'a'.charCodeAt(0);
                    if (x >= 0 && x < 19 && y >= 0 && y < 19){
						if(currentStepArray == null)
	                        qipu.m_extraInfo.m_lstMA.push(new QIWEI(x, y));
 						else if(currentStepArray.length > 0)
							currentStepArray[currentStepArray.length-1].m_extraInfo.m_lstMA.push(new QIWEI(x, y));
                   }
                }
            }
            else if(strCurrentKey == "CR") {//圆形  Circle
                if (strItem.length == 2){
                    var x = strItem.substring(0, 1).charCodeAt(0) - 'a'.charCodeAt(0);
                    var y = strItem.substring(1,2).charCodeAt(0) - 'a'.charCodeAt(0);
                    if (x >= 0 && x < 19 && y >= 0 && y < 19){
						if(currentStepArray == null)
	                        qipu.m_extraInfo.m_lstCR.push(new QIWEI(x, y));
 						else if(currentStepArray.length > 0)
							currentStepArray[currentStepArray.length-1].m_extraInfo.m_lstCR.push(new QIWEI(x, y));
                   }
                }
            }else if(strCurrentKey == "SQ") {//方块 Square
                if (strItem.length == 2){
                    var x = strItem.substring(0, 1).charCodeAt(0) - 'a'.charCodeAt(0);
                    var y = strItem.substring(1,2).charCodeAt(0) - 'a'.charCodeAt(0);
                    if (x >= 0 && x < 19 && y >= 0 && y < 19){
						if(currentStepArray == null)
	                        qipu.m_extraInfo.m_lstSQ.push(new QIWEI(x, y));
 						else if(currentStepArray.length > 0)
							currentStepArray[currentStepArray.length-1].m_extraInfo.m_lstSQ.push(new QIWEI(x, y));
                   }
                }
            }
        }
    }

    //删除最后从堆栈弹出的行
    if(bHasPopArray && qipu.m_lstStepArrays.length > 1){
        qipu.m_lstStepArrays.splice(qipu.m_lstStepArrays.length-1, 1);
    }

    //如果没有PL，用实际步骤判断
    if (bHasPL == false && qipu.m_lstStepArrays.length > 0 && qipu.m_lstStepArrays[0].length > 0)
        qipu.m_iFirstColor = qipu.m_lstStepArrays[0][0].color;

    //是否需要转换成黑先
    if(bBlackFirst && qipu.m_iFirstColor == WHITE){
		qipu.m_iFirstColor = BLACK;
		for (var x = 0; x < 19; x++){
			for (var y = 0; y < 19; y++){
				if (qipu.m_firstQimian.m_iPointStatus[x][y] == BLACK)
					qipu.m_firstQimian.m_iPointStatus[x][y] = WHITE;
				else if (qipu.m_firstQimian.m_iPointStatus[x][y] == WHITE)
					qipu.m_firstQimian.m_iPointStatus[x][y] = BLACK;
			}
		}

		//console.log("qipu.m_lstStepArrays.length = " + qipu.m_lstStepArrays.length);
		//qipu.print();
		//console.log("0=" + qipu.m_lstStepArrays[0] + "5=" + qipu.m_lstStepArrays[5] + "6=" + qipu.m_lstStepArrays[6] + "7=" + qipu.m_lstStepArrays[7]);

		for (var i = 0; i < qipu.m_lstStepArrays.length; i++){
			//console.log("i=" + i);
			for(var k=0; k<qipu.m_lstStepArrays[i].length; k++){
				//console.log("k=" + k);
				qipu.m_lstStepArrays[i][k].color = (qipu.m_lstStepArrays[i][k].color == BLACK ? WHITE : BLACK);
			}
		}
		//不转换注释中的文字
	}
		
	return qipu;
}

