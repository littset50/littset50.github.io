
 //常量
//let EMPTY = 0
//let BLACK = 1
//let WHITE = 2

//定义一个棋面，棋局的当前状态 
function QIMIAN()
{
		this.m_iPointStatus = new Array(19);
		for(var i=0; i<19; i++)
		{
			this.m_iPointStatus[i] = new Array(19);
			for(var k=0; k<19; k++){
				this.m_iPointStatus[i][k] = EMPTY;
			}
		}

    this.cloneFrom = function(qimian)
	{
		for(var x=0; x<19; x++)
		{
			for(var y=0; y<19; y++)
			{
				this.m_iPointStatus[x][y] = qimian.m_iPointStatus[x][y];
			}
		}
	}

	this.print = function(){
		for(var i=0; i<19; i++){
			var line = "";
			for(var k=0; k<19; k++){
				if(this.m_iPointStatus[i][k] == EMPTY)
					line += "-";
				else if(this.m_iPointStatus[i][k] == BLACK)
					line += "b";
				else if(this.m_iPointStatus[i][k] == WHITE)
					line += "w";
			}
			//console.log(line);
		}

	}
}  