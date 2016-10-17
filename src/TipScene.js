/**
 * Created by Administrator on 2016/3/24.
 */
var  FAIL_UI_SIZE = cc.size(292, 277);
var TipUI = cc.Layer.extend({
    activate : false,
    notifySprite :null,
    replaySprite :null,
    win : false,
    tipText : null,
    winPanel : null,
    zzLayer : null,
    listener : null,
    maxTime: 300,
    firstReturn: true,
    ctor : function (tip,time) {
        this._super(cc.color(10,10,10,100),640,960);
        this.zzLayer = new cc.LayerColor(cc.color(10,10,10,100));
        if(typeof(time) != "undefined" && time != null)  this.maxTime = time;

        this.tipText = tip;
        var size = cc.winSize;
        var self = this;
        this.winPanel = new cc.Sprite(res.s_tip2);
        this.winPanel.x = (cc.winSize.width )/2 ;
        this.winPanel.anchorY = 0.5;
        this.winPanel.y = cc.winSize.height/2;
        this.winPanel.setRotation(90);
        this.addChild(this.winPanel,5);
        this.addChild( this.zzLayer,1);

        //使得下层的点击事情无效
        this.listener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function (touch, event) {
                return true;
            },
            onTouchEnded: function (touch, event) {
            }
        });
        cc.eventManager.addListener(this.listener, this.zzLayer);
        this.schedule(this.countDown,1);
    },
    onEnter : function () {
        this._super();
        var self = this;
        var miny = cc.winSize.height/2 - FAIL_UI_SIZE.height / 2;
        this.winPanel.removeAllChildren();
        var w = this.winPanel.width, h = this.winPanel.height;
        var label = new cc.LabelTTF(this.tipText, "宋体", 36);
        label.x = w/2;
        label.y = h/2;
        label.textAlign = cc.LabelTTF.TEXT_ALIGNMENT_CENTER;
        //label.boundingWidth = w;
     //   label.width = w;
        label.color = cc.color(249,233,87);
        this.winPanel.addChild(label);
        var OKbtn = new cc.MenuItemImage(
            res.s_ok_btn,
            res.s_ok_btn,
            function(){
                self.onExit();
            }
        );
        OKbtn.x = w/2;
        OKbtn.y = h/2 -115;

        OKbtn.setTag(2);
        var menu = new cc.Menu(OKbtn);
        menu.x=0;
        menu.y=0;
        this.winPanel.addChild(menu);
        this.activate = true;
    },
    onExit : function () {
        this._super();
        this.activate = false;
        this.removeChild(this.winPanel);
        this.removeChild(this.zzLayer);
        cc.eventManager.removeListener(this.listener);
        this.getParent().isFirstReturn = true;//设置为
        return false;
    },
    countDown:function(){
        this.maxTime --;
        if(this.maxTime == 0){
            this.onExit();
        }
    }
});

var TipScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new TipUI();
        this.addChild(layer);
    }
});
