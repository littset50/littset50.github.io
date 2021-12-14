//棋盘区域的显示和操作
function Board()
{	
	//数据
	this.m_bCanDraw = false; //是否可以画棋盘，如界面太小就不画

	this.initBoard = function(canvas, problem, is_autoput)
	{
		this.m_canvas = canvas;
		this.m_ctx = canvas[0].getContext('2d');
		this.m_problem = problem;
		this.is_autoput = is_autoput;
	}

	this.showBoard = function()
	{
		this.m_ctx.clearRect(0,0,this.m_canvas[0].width,this.m_canvas[0].height);  
		this.calcuBoard();
		this.drawChessLines();
		this.drawChessPieces();
	}

	this.calcuBoard = function()
	{
		var dblCanvasWidth = this.m_canvas.width();
		var dblCanvasHeight = this.m_canvas.height();

		this.m_bCanDraw = (dblCanvasWidth >= 300 && dblCanvasHeight >= 300); //如果画布太小，就不画

		var dblBoardWidth = (dblCanvasWidth < dblCanvasHeight ? dblCanvasWidth : dblCanvasHeight) * 19.0 / 20.0; //棋盘宽度
		if (dblBoardWidth > 1000) //屏幕太大时，周边留空白
			dblBoardWidth = 1000;

		this.m_dblBoardLeft = (dblCanvasWidth - dblBoardWidth) / 2.0;
		this.m_dblBoardTop = (dblCanvasHeight - dblBoardWidth) / 2.0;
		this.m_dblCellWidth = dblBoardWidth / 19.0;
		var dblPieceWidth = this.m_dblCellWidth * 0.9; //棋子宽度/格子宽度

		//m_rectCanvas = new Rect(0, 0, dblCanvasWidth, dblCanvasHeight);
		//m_rectBoard = new Rect(m_dblBoardLeft, m_dblBoardTop, dblBoardWidth, dblBoardWidth);

		this.m_rectPiece = [];
		for (var ix = 0; ix < 19; ix++)
		{
			this.m_rectPiece.push([]);
			for (var iy = 0; iy < 19; iy++)
			{
				var dblLeft = this.m_dblBoardLeft + this.m_dblCellWidth * 0.5 + this.m_dblCellWidth * ix - dblPieceWidth / 2.0;
				var dblTop = this.m_dblBoardTop + this.m_dblCellWidth * 0.5 + this.m_dblCellWidth * iy - dblPieceWidth / 2.0;
				this.m_rectPiece[ix].push(new Rect(dblLeft, dblTop, dblPieceWidth, dblPieceWidth));
			}
		}

		//m_symbolStep.FontSize = (float)(m_dblCellWidth * 0.4); //步数的字体
		//m_symbolLabel.FontSize = (float)(m_dblCellWidth * 0.8);
	}

	this.drawChessLines = function()
	{
		this.m_ctx.strokeStyle =  '#7a582a'; //'#880015'; //线条颜色

		//横线
		var ox1 = this.m_dblBoardLeft + this.m_dblCellWidth / 2, 
			ox2 = this.m_dblBoardLeft + this.m_dblCellWidth / 2 + this.m_dblCellWidth * (19 - 1) + 1, 
			oy = this.m_dblBoardTop + this.m_dblCellWidth / 2; 
		for (var i = 0; i < 19; i++)
		{
			this.m_ctx.beginPath(); //必须反复beginPath和stroke，才能画粗细不同的线条
			this.m_ctx.lineWidth = (i == 0 || i == 19 - 1 ? 3 : 1); //边线宽一些
			//console.log(this.m_ctx.lineWidth);
			this.m_ctx.moveTo(ox1, oy);
			this.m_ctx.lineTo(ox2, oy);
			this.m_ctx.stroke();
			oy += this.m_dblCellWidth;
		}

		//竖线
		var oy1 = this.m_dblBoardTop + this.m_dblCellWidth / 2, 
			oy2 = this.m_dblBoardTop + this.m_dblCellWidth / 2 + this.m_dblCellWidth * (19 - 1) + 1, 
			ox = this.m_dblBoardLeft + this.m_dblCellWidth / 2;
		for (var i = 0; i < 19; i++)
		{
			this.m_ctx.beginPath(); 
			this.m_ctx.lineWidth = (i == 0 || i == 19 - 1 ? 3 : 1); //边线宽一些
			this.m_ctx.moveTo(ox, oy1);
			this.m_ctx.lineTo(ox, oy2);
			this.m_ctx.stroke();
			ox += this.m_dblCellWidth;
		}

		//画小黑点
		var dotpoints = [[3, 3], [9, 3], [15, 3], [3, 9], [9, 9], [15, 9], [3, 15], [9, 15], [15, 15]];
		for (var i = 0; i < 9; i++)
		{
			var xdot = this.m_dblBoardLeft + this.m_dblCellWidth / 2 + this.m_dblCellWidth * dotpoints[i][0];
			var ydot = this.m_dblBoardTop + this.m_dblCellWidth / 2 + this.m_dblCellWidth * dotpoints[i][1];
			var fDotRadio = 3; 
			this.m_ctx.fillStyle = "#880015";
			this.m_ctx.beginPath(); 
			this.m_ctx.arc(xdot, ydot, fDotRadio, 0, 10, false);
			this.m_ctx.fill();
			this.m_ctx.closePath();
		}
	}

	this.drawChessPieces = function()
	{
		for (var ix = 0; ix < 19; ix++)
		{
			for (var iy = 0; iy < 19; iy++)
			{
				var iStatus = this.m_problem.GetPointStatus(ix, iy);
				if (iStatus == BLACK || iStatus == WHITE)
				{
					this.m_ctx.drawImage(iStatus == BLACK ? this.image_blackpiece : this.image_whitepiece, 
						this.m_rectPiece[ix][iy].left, this.m_rectPiece[ix][iy].top, this.m_rectPiece[ix][iy].width, this.m_rectPiece[ix][iy].height);
					var iStepIndex = -1; //第几步（从0开始）
					for (var i = this.m_problem.m_lstRealSteps.length - 1; i >= 0; i--)
					{
						if (this.m_problem.m_lstRealSteps[i].x == ix && this.m_problem.m_lstRealSteps[i].y == iy)
						{
							iStepIndex = i;
							break;
						}
					}
					if (iStepIndex >= 0) //显示序号
					{
						var strStep = "" + (iStepIndex + 1);
						var fontSize = this.m_dblCellWidth * 0.6;
						this.m_ctx.textAlign="center"; //左右居中
						this.m_ctx.textBaseline="middle"; //上下居中
						this.m_ctx.fillStyle = (iStatus == BLACK ? "white" : "black");
						this.m_ctx.font= "" + fontSize + "px Georgia"; //可以带小数，如："13.222228px Georgia"
						this.m_ctx.fillText(strStep, this.m_rectPiece[ix][iy].centerx, this.m_rectPiece[ix][iy].centery);
					}
				}
				else //空白
				{
					if (ix == this.m_problem.m_iWrongX && iy == this.m_problem.m_iWrongY) //下错的位置
					{
						this.m_ctx.drawImage(this.image_wrongpiece, 
							this.m_rectPiece[ix][iy].left, this.m_rectPiece[ix][iy].top, this.m_rectPiece[ix][iy].width, this.m_rectPiece[ix][iy].height);
					}
					//else if (this.m_problem.needTishi(ix, iy)) //ix == m_problem.m_iTishiX && iy == m_problem.m_iTishiY) //提示的位置
					//{
					//	//一秒画60次，0.5秒闪烁一次
					//	if (this.m_iDrawTick % 60 < 30)
					//	{
					//		var iNextColor = this.m_problem.GetNextColor();
					//		this.m_ctx.drawImage(iStatus == BLACK ? this.image_tishiblackpiece : this.image_tishiwhitepiece, 
					//			this.m_rectPiece[ix][iy].left, this.m_rectPiece[ix][iy].top, this.m_rectPiece[ix][iy].width, this.m_rectPiece[ix][iy].height);
					//	}
					//}
				}

				//显示TR（三角）和LB（a、b等标注），不管是否有子都要显示
				var info = this.m_problem.getCurrentExtraInfo();

				//标注
				var lstLB = info.m_lstLB;
				for (var i = 0; i < lstLB.length; i++)
				{
					if (ix == lstLB[i].x && iy == lstLB[i].y)
					{
						//args.DrawingSession.DrawText(lstLB[i].s, m_rectPiece[ix, iy], Colors.Red, m_symbolLabel);
						var fontSize = this.m_dblCellWidth * 1.2;
						this.m_ctx.textAlign="center"; //左右居中
						this.m_ctx.textBaseline="middle"; //上下居中
						this.m_ctx.fillStyle = "red";
						this.m_ctx.font= "" + fontSize + "px Georgia"; //可以带小数，如："13.222228px Georgia"
						this.m_ctx.fillText(lstLB[i].s, this.m_rectPiece[ix][iy].centerx, this.m_rectPiece[ix][iy].centery);
						break;
					}
				}

				//三角
				var lstTR = info.m_lstTR;
				for (var i = 0; i < lstTR.length; i++)
				{
					if (ix == lstTR[i].x && iy == lstTR[i].y)
					{
						this.m_ctx.drawImage(this.image_triggerpiece, 
							this.m_rectPiece[ix][iy].left, this.m_rectPiece[ix][iy].top, this.m_rectPiece[ix][iy].width, this.m_rectPiece[ix][iy].height);
						break;
					}
				}

				//X 形记号  Mark
				var lstMA = info.m_lstMA;
				for (var i = 0; i < lstMA.length; i++)
				{
					if (ix == lstMA[i].x && iy == lstMA[i].y)
					{
						this.m_ctx.drawImage(this.image_markpiece, 
							this.m_rectPiece[ix][iy].left, this.m_rectPiece[ix][iy].top, this.m_rectPiece[ix][iy].width, this.m_rectPiece[ix][iy].height);
						break;
					}
				}

				//圆形  Circle
				var lstCR = info.m_lstCR;
				for (var i = 0; i < lstCR.length; i++)
				{
					if (ix == lstCR[i].x && iy == lstCR[i].y)
					{
						this.m_ctx.drawImage(this.image_circlepiece, 
							this.m_rectPiece[ix][iy].left, this.m_rectPiece[ix][iy].top, this.m_rectPiece[ix][iy].width, this.m_rectPiece[ix][iy].height);
						break;
					}
				}

				//方块 Square
				var lstSQ = info.m_lstSQ;
				for (var i = 0; i < lstSQ.length; i++)
				{
					if (ix == lstSQ[i].x && iy == lstSQ[i].y)
					{
						this.m_ctx.drawImage(this.image_squarepiece, 
							this.m_rectPiece[ix][iy].left, this.m_rectPiece[ix][iy].top, this.m_rectPiece[ix][iy].width, this.m_rectPiece[ix][iy].height);
						break;
					}
				}
			}
		}

	}

	this.clickQipan = function(offsetX, offsetY)
	{
		for (var ix = 0; ix < 19; ix++)
		{
			for (var iy = 0; iy < 19; iy++)
			{
				if(this.m_rectPiece[ix][iy].hit(offsetX, offsetY))
				{
					//摆子模式，直接通知上级scene
					//if(this.baizimode)
					//{
					//	this.m_scene.baizied(ix, iy); //通知scene
					//	return;
					//}
	
					if (this.m_problem.GetPointStatus(ix, iy) == EMPTY){
						var iOldStatus = this.m_problem.GetQipuStatus();
						var bPutRes = this.m_problem.PutPiece(ix, iy);
						//cc.audioEngine.playEffect(bPutRes ? this.keypressAudio : this.wrongAudio, false);
	
						//自动落下一个子
						//if(this.is_autoput)
						//{
						//	if (bPutRes && this.m_problem.GetNextColor() == WHITE && this.m_problem.GetQipuStatus() == QIPUSTATUS_CORRECT)
						//	{
						//		var nextsteps2 = this.m_problem.GetNextCorrectSteps();
						//		if (nextsteps2.length > 0){
						//			this.m_problem.PutPiece(nextsteps2[0].x, nextsteps2[0].y); //机器落子。如有多种下法，取第一个
						//		}
						//	}
						//}
	
						//本局结束，播放胜利的声音
						if (iOldStatus != QIPUSTATUS_FINISHED && this.m_problem.GetQipuStatus() == QIPUSTATUS_FINISHED){
							//cc.audioEngine.playEffect(this.successAudio, false);
						}
	
						this.showBoard(); //刷新显示
						return true;
					}else{
						return false;;
					}
				}
			}
		}
		return false;
	}	


	this.autoPutNext = function()
	{
		if(!this.m_problem.canTishi())
			return false;

		var nextsteps2 = this.m_problem.GetNextCorrectSteps();
		if (nextsteps2 != null){
			this.m_problem.PutPiece(nextsteps2[0].x, nextsteps2[0].y); //机器落子。如有多种下法，取第一个
			this.showBoard(); //刷新显示
			return true; //通知scene
		}

		return false;
	}

}

function Rect(left, top, width, height)
{
	this.left = left;
	this.top = top;
	this.width = width;
	this.height = height;
	this.centerx = this.left + this.width / 2;
	this.centery = this.top + this.height / 2;

	this.hit =  function(x, y){
		return x >= this.left && x <= this.left+this.width && y >= this.top && y <= this.top+this.height;
	}
}

/*



	//是否需要提示
	setTishiMode : function(tishiMode)
	{
		this.m_bTishiMode = tishiMode;
		this.showBoard();
	},
	*/