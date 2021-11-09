/**
 * 文件：problem.js
 * 功能：逻辑处理
 */

//import SgfTools from './sgftools'
//import QIMIAN from './qimian'
//import STEP from './step'
//import QIWEI from './qiwei'

//let EMPTY = 0;
//let BLACK = 1;
//let WHITE = 2;

let QIPUSTATUS_NOTSTART = 1;
let QIPUSTATUS_CORRECT = 2;
let QIPUSTATUS_WRONG = 3;
let QIPUSTATUS_FINISHED = 4;


function Problem() 
{
    //constructor(page) 
    //{
        //this.page = page

		//棋谱（静态数据，从sgf字符串读出后不变）
		this.m_qipu = null;

        //状态（动态数据，随着落子变化）
        this.m_qimianCurrent = new QIMIAN(); //当前棋面
        this.m_iNextColor = BLACK;  //下一个轮到谁????????
		this.m_stackHistoryQimian = []; //棋局的历史状态(QIMIAN堆栈)
        this.m_lstRealSteps = []; //实际的步骤(STEP队列)	
        this.m_iWrongX = -1;
        this.m_iWrongY = -1; //点错的位置

    //}

		//获取当前棋面
	this.GetQimian = function()
	{
		return this.m_qimianCurrent
	}

	//属性：某个交叉点的状态
	this.GetPointStatus = function(x, y)
	{
		return this.m_qimianCurrent.m_iPointStatus[x][y];
	}

	//属性：下一步
	this.GetNextColor = function()
	{
		return this.m_iNextColor;
	}



	//开始一个题目
	//bBlackFirst：强制转换成黑先（仅用于早期的死活手筋练习）
	this.Start = function(strSgf, bBlackFirst)
    {
		//读取棋谱
		this.m_qipu = SgfTools.ExpSgf(strSgf, bBlackFirst);
		if(this.m_qipu == null)
			return false;

		//初始化
		this.m_qimianCurrent.cloneFrom(this.m_qipu.m_firstQimian);
		this.m_iNextColor = this.m_qipu.m_iFirstColor;
		this.m_stackHistoryQimian.length = 0;
		this.m_lstRealSteps.length = 0;
		this.m_iWrongX = this.m_iWrongY = -1;

		return true;
	}

	//放一个子
	//人工放子、机器放子，都用本函数
	this.PutPiece = function(x, y)
	{
		this.m_iWrongX = this.m_iWrongY = -1;
 
        if (this.m_qimianCurrent.m_iPointStatus[x][y] != EMPTY)
			return false;
			

		//检查是否自杀
        this.m_qimianCurrent.m_iPointStatus[x][y] = this.m_iNextColor;
        var iMyDeadCount = this.RemoveDeadPieces(this.m_iNextColor, true); //我方死子数量
        var iEnemyDeadCount = 0;
        if (iMyDeadCount > 0)
            iEnemyDeadCount = this.RemoveDeadPieces(this.m_iNextColor == BLACK ? WHITE : BLACK, true); //对方死子数量
        this.m_qimianCurrent.m_iPointStatus[x][y] = EMPTY; //恢复
        if (iMyDeadCount > 0 && iEnemyDeadCount == 0)
        {
            this.m_iWrongX = x;
            this.m_iWrongY = y;
            return false;
        }

		//记录历史状态
        var qimian = new QIMIAN();
		qimian.cloneFrom(this.m_qimianCurrent);
        this.m_stackHistoryQimian.push(qimian); //不能直接push(this.m_qimianCurrent)，会引用同一个对象

		//改变当前状态
        this.m_qimianCurrent.m_iPointStatus[x][y] = this.m_iNextColor;

		//记录步骤，如果步骤符合棋谱，要复制注释（以后可能增加复制标注）
		var step = new STEP(x, y, this.m_iNextColor);
		var correctsteps = this.GetNextCorrectSteps();
		for(var i=0; i<correctsteps.length; i++){
			if(step.Xiangdeng(correctsteps[i])){
				//step.comment = correctsteps[i].comment; //记录备注
				step.m_extraInfo.cloneFrom(correctsteps[i].m_extraInfo); //复制额外信息
				break;
			}
		}
        this.m_lstRealSteps.push(step)
		
        this.RemoveDeadPieces(this.m_iNextColor == BLACK ? WHITE : BLACK, false);
        this.m_iNextColor = this.m_iNextColor == BLACK ? WHITE : BLACK; //换颜色

		return true;
	}

	//悔棋
	this.Withdraw = function()
	{
        if (this.m_lstRealSteps.length == 0)
			return;

		//恢复棋局
        this.m_qimianCurrent = this.m_stackHistoryQimian.pop();

		//恢复状态
        this.m_lstRealSteps.pop();
        this.m_iNextColor = this.m_iNextColor == BLACK ? WHITE : BLACK; //换颜色

        //去掉错误子
        this.m_iWrongX = this.m_iWrongY = -1;
	}

	//去掉死子
	//输入：检查这种颜色的死子
	//返回：死子个数
	this.RemoveDeadPieces = function(color, bCheckOnly)
	{
		var lstDeadPieces = [];
		var lstLivePieces = [];

        //第一步：假定所有的都是死子
        for (var ix = 0; ix < 19; ix++)
		{
			for (var iy = 0; iy < 19; iy++)
			{
                if (this.m_qimianCurrent.m_iPointStatus[ix][iy] == color)
					lstDeadPieces.push(new QIWEI(ix, iy));
			}
		}

		//第二步：一轮一轮地“死变活”
		while (true)
		{
			var iCheckLiveCount = 0; //本轮“死变活”的数量

            for (var i = 0; i < lstDeadPieces.length; i++) //逐个死子检查
			{
                var pt = lstDeadPieces[i];
                var ptNeighbour = new Array(new QIWEI(), new QIWEI(), new QIWEI(), new QIWEI());
				ptNeighbour[0].set(pt.x, pt.y - 1); //上
				ptNeighbour[1].set(pt.x, pt.y + 1); //下
				ptNeighbour[2].set(pt.x - 1, pt.y); //左
				ptNeighbour[3].set(pt.x + 1, pt.y); //右
				for (var d = 0; d < 4; d++) //4个邻居
				{
					if (ptNeighbour[d].x >= 0 && ptNeighbour[d].x < 19 && ptNeighbour[d].y >= 0 && ptNeighbour[d].y < 19)
					{
                        var bIsNeighbourLive = false; //邻居是否活的

						if (this.m_qimianCurrent.m_iPointStatus[ptNeighbour[d].x][ptNeighbour[d].y] == EMPTY) //空的
                            bIsNeighbourLive = true;
                        else
                            for (var iLiveIndex = 0; iLiveIndex < lstLivePieces.length; iLiveIndex++)
						    {
							    if (lstLivePieces[iLiveIndex].x == ptNeighbour[d].x && lstLivePieces[iLiveIndex].y == ptNeighbour[d].y) //活的
							    {
								    bIsNeighbourLive = true;
								    break;
							    }
                            }

						if (bIsNeighbourLive == true) //邻居是活的
						{
							lstLivePieces.push(new QIWEI(pt.x, pt.y)); //有邻居是空的或活的，那么我也是活的
                            lstDeadPieces.splice(i, 1);
							iCheckLiveCount++;
							i--; //死子队列中移除了一个，因此序号减一，以免漏掉
							break;
						}
					}
				}
			}

			if (iCheckLiveCount == 0) //本轮“死变活”的数量为0，检查结束
				break;
		}

		//第三步：真正地改变棋局
		if (bCheckOnly == false)
        {
            for (var iDeadIndex = 0; iDeadIndex < lstDeadPieces.length; iDeadIndex++)
			{
				this.m_qimianCurrent.m_iPointStatus[lstDeadPieces[iDeadIndex].x][lstDeadPieces[iDeadIndex].y] = EMPTY;
				console.log("lstDeadPieces[iDeadIndex].x=" + lstDeadPieces[iDeadIndex].x);
				console.log("lstDeadPieces[iDeadIndex].y=" + lstDeadPieces[iDeadIndex].y);
			}
		}

        return lstDeadPieces.length;
	}

	//实际步骤与棋谱比较
	this.GetQipuStatus = function()
    {
		if(this.m_qipu.m_lstStepArrays.length == 0) //没有实际步骤，一开始就结束（用于某些定式）
			return QIPUSTATUS_FINISHED;
        else if (this.m_lstRealSteps.length == 0)
			return QIPUSTATUS_NOTSTART;
		else
		{
			for(var i=0; i<this.m_qipu.m_lstStepArrays.length; i++){
				var lstCorrectSteps = this.m_qipu.m_lstStepArrays[i];
				var correct = true;

				//取较小的长度
				var minlength = this.m_lstRealSteps.length < lstCorrectSteps.length ? this.m_lstRealSteps.length : lstCorrectSteps.length;
				for(var k=0; k<minlength; k++){
					if(this.m_lstRealSteps[k].Xiangdeng(lstCorrectSteps[k]) == false){
						correct = false;
						break;
					}
				}

				if(correct){//直接返回
					if(this.m_lstRealSteps.length >= lstCorrectSteps.length)
						return QIPUSTATUS_FINISHED;
					else
						return QIPUSTATUS_CORRECT; 
				}
			}
			return QIPUSTATUS_WRONG; //都不符合
		}
	}

	//属性：取下一步正确的子（可能有多个）
	//如没有，返回[]，不是null
	this.GetNextCorrectSteps = function()
	{
		var steps = [];

		for(var i=0; i<this.m_qipu.m_lstStepArrays.length; i++){
			var lstCorrectSteps = this.m_qipu.m_lstStepArrays[i];

			if(this.m_lstRealSteps.length >= lstCorrectSteps.length) //实际步数>=正确步数
				continue;

			//现有步骤不一致
			var correct = true;
			for (var k = 0; k < this.m_lstRealSteps.length; k++){
				if (!this.m_lstRealSteps[k].Xiangdeng(lstCorrectSteps[k])){
					correct = false;
					break;
				}
			}	
			;
			//符合棋谱
			if(correct)
				steps.push(lstCorrectSteps[this.m_lstRealSteps.length]);
		}

		return steps;
	}

    this.getCurrentComment = function()
	{
		//if(this.m_lstRealSteps.length == 0){
		//	return this.m_qipu.m_extraInfo.m_strComment;
		//}else{
		//	var index = this.m_lstRealSteps.length - 1;
		//	return this.m_lstRealSteps[index].m_extraInfo.m_strComment; //产生realstep时已经复制了comment，这里可直接使用
		//}
		return this.getCurrentExtraInfo().m_strComment;
	}

	this.getCurrentExtraInfo = function(){
		if(this.m_lstRealSteps.length == 0){
			if(this.m_qipu == null)
				return null;
			return this.m_qipu.m_extraInfo;
		}else{
			var index = this.m_lstRealSteps.length - 1;
			return this.m_lstRealSteps[index].m_extraInfo; //产生realstep时已经复制了extrainfo，这里可直接使用
		}	
	}


		/**
	* 是否可以提示
	*/
	this.canTishi = function(){
		var iStatus = this.GetQipuStatus()
		if (iStatus == QIPUSTATUS_CORRECT || iStatus == QIPUSTATUS_NOTSTART)
		{
			var steps = this.GetNextCorrectSteps();
			if (steps.length > 0){
				return true;
			}
		}
		return false;
	}
}



