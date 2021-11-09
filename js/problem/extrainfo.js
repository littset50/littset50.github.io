//import QIWEI from './qiwei'
//import LABEL from './label'

/**
 * 定义一个额外信息
 * 包括：C,N，LB,TR,MA,CR,SQ
 * 分为两种：qipu的初始信息，一个step的信息
 */
function ExtraInfo()
{
		this.m_strNodeName = ""; //节点名称
        this.m_strComment = ""; //注释
		this.m_lstLB = []; //标注（交叉点写a、b、c等文字）数据类型：LABEL
		this.m_lstTR = []; //三角 数据类型：QIWEI
		this.m_lstMA = []; //X 形记号  Mark 数据类型：QIWEI
		this.m_lstCR = []; //圆形  Circle 数据类型：QIWEI
		this.m_lstSQ = []; //方块 Square 数据类型：QIWEI

    this.cloneFrom = function(info){
		this.m_strNodeName = info.m_strNodeName;
        this.m_strComment = info.m_strComment;
        
        this.m_lstLB = [];
        for(var i=0; i<info.m_lstLB.length; i++){
            this.m_lstLB.push(new LABEL(info.m_lstLB[i].x, info.m_lstLB[i].y, info.m_lstLB[i].s));
        }

        this.m_lstTR = [];
        for(var i=0; i<info.m_lstTR.length; i++){
            this.m_lstTR.push(new QIWEI(info.m_lstTR[i].x, info.m_lstTR[i].y));
        }

        this.m_lstMA = [];
        for(var i=0; i<info.m_lstMA.length; i++){
            this.m_lstMA.push(new QIWEI(info.m_lstMA[i].x, info.m_lstMA[i].y));
        }

        this.m_lstCR = [];
        for(var i=0; i<info.m_lstCR.length; i++){
            this.m_lstCR.push(new QIWEI(info.m_lstCR[i].x, info.m_lstCR[i].y));
        }

        this.m_lstSQ = [];
        for(var i=0; i<info.m_lstSQ.length; i++){
            this.m_lstSQ.push(new QIWEI(info.m_lstSQ[i].x, info.m_lstSQ[i].y));
        }

    }
}
