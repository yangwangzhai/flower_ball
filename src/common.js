/**
 * Created by Administrator on 2016/9/26.
 */
/**
 *  创建滚动字幕
 * @param txt
 * @param fontsize
 * @param {cc.Color|null} color
 * @param width
 * @param height
 * @returns {cc.Node|*}
 */
var xhr = cc.loader.getXMLHttpRequest();
var xlb_ids=0;
function createClipRoundText (txt,fontsize,color,width,height,target){
    this.xlb_text = new cc.LabelTTF(txt,"Arial",fontsize);
    var text = this.xlb_text;
    console.log('text width:'+text.width);
    text.setColor(color?color:cc.color.BLUE);
    text.anchorX = 0;
    if(text.width<=width){
        text.anchorY = 0;
        text.y = 610;
        text.x = 1;
        text.setRotation(90);
        target.addChild(text, 15, 123);
        return text;
    }
    var cliper = new cc.ClippingNode();
    var drawNode = new cc.DrawNode();
    drawNode.drawRect(cc.p(0,0),cc.p(width,height),cc.color.WHITE);
    cliper.setStencil(drawNode);
    cliper.anchorX = 0.5;
    cliper.anchorY = 0.5;
    text.y = height/2;
    cliper.addChild(text,15);
    text.x = width+fontsize;
    text.runAction(cc.repeatForever(cc.sequence(
        cc.moveTo(text.width/width*5,cc.p(-text.width,text.y)),
        cc.callFunc(function(){
            text.x = width+fontsize;
        }))));

    cliper.y = 610;
    cliper.x = 1;
    cliper.setRotation(90);
    target.addChild(cliper, 15, 123);

}

function setXlbText(target){
    //喇叭公告
    var self = this;
    xhr.open("GET", base_url + "&m=get_xlb&ids="+xlb_ids, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 207)) {
            var httpStatus = xhr.statusText;
            responseObj = eval('(' + xhr.responseText + ')');
            var content = responseObj.content;
            var is_update = responseObj.is_update;
            if(is_update == 1) {
                target.removeChildByTag(123);
                xlb_ids = responseObj.ids;
                createClipRoundText(content, 20, cc.color(237, 240, 39), 100, 40, target);
                self.xlb_ids = responseObj.ids;
            }
        }
    };
    xhr.send();
}
