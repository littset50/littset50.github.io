//import ExtraInfo from './extrainfo'


/**
 * 定义一步落子
 */
function STEP(ix,  iy,  icolor)
{
		this.x = ix;
		this.y = iy;
        this.color = icolor;

        this.m_extraInfo = new ExtraInfo(); //额外信息

	//比较两个步骤是否相等，注意：额外信息不能参与比较
	this.Xiangdeng = function(s)
	{
		return this.x == s.x && this.y == s.y && this.color == s.color;
    }
    
    this.cloneFrom = function(step)
    {
        this.x = step.x;
        this.y = step.y;
        this.color = step.color;
        //this.comment = step.comment;
        this.m_extraInfo.cloneFrom(step.m_extraInfo);
    }
}
