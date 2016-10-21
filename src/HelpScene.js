/**
 * Created by Administrator on 2016/3/24.
 */
var  FAIL_UI_SIZE = cc.size(600, 900);
var HelpUI = cc.Layer.extend({
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


        this.winPanel = new cc.Sprite(res.s_rule_bg);
        this.winPanel.x = (cc.winSize.width )/2 ;
        this.winPanel.anchorY = 0.5;
        this.winPanel.y = cc.winSize.height/2;
       // this.addChild(this.winPanel,5);
        this.addChild( this.zzLayer,1);


        self.helpTips = new cc.Sprite(res.s_rule_bg);
        self.helpTips.attr({
            x:size.width/2,
            y:size.height/2
        });
        var scrollView = new ccui.ScrollView();
        //设置方向
        scrollView.setDirection(ccui.ScrollView.DIR_VERTICAL);
        //触摸的属性
        scrollView.setTouchEnabled(true);
        //弹回的属性
        //scrollView.setBounceEnabled(true);
        //滑动的惯性
        //scrollView.setInertiaScrollEnabled(true);
        //scrollView.setBackGroundImageScale9Enabled(true);

        scrollView.setContentSize(cc.size(self.helpTips.width + 100, self.helpTips.height-200));
        //设置容器的大小 这个容器就是存放scrollview添加的节点，需要设置他的位置，上面已经讲清楚
        //scrollView.setInnerContainerSize(cc.size(self.helpTips.width, self.helpTips.height-110));
        //可以添加触摸事件监听器
        //scrollView.addTouchEventListener(this.scrollviewCall,this);
        //锚点默认是 （0,0）
        scrollView.setAnchorPoint(0.5,0.5);
        scrollView.x = self.helpTips.width/2-25;
        scrollView.y = self.helpTips.height/2 - 35;
        scrollView.setRotation(90);
        //自己新建一个节点


        var textView = new ccui.Text();
        var ruleText = "打鸡针，是一种简单的扑克牌比大小的游戏。玩法规则是：1、玩家和庄家各发一张牌。2、先比较扑克牌的点数，谁的点数大谁赢（A是1点，是最小的点数；K是13点，是最大的点数）。3、如果点数相同，则比较花色，黑桃>红心>梅花>方块，谁的花色大则谁赢。";
        textView.setString(ruleText);
        textView.fontSize = 30;
        textView.fontName = '楷体';
        textView.ignoreContentAdaptWithSize(false);
        textView.setSize(cc.size(560, textView.height+480));
        textView.setAnchorPoint(0.5,1);
        textView.y = textView.height;
        textView.x = scrollView.width/2-30 ;
        textView.setColor(cc.color(255, 255, 255));//255, 242, 93

        scrollView.addChild(textView);
        var innerWidth = scrollView.width;
        var innerHeight = textView.height;

        scrollView.setInnerContainerSize(cc.size(innerWidth, innerHeight));
        self.helpTips.addChild(scrollView);
        self.addChild(self.helpTips,10);


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



    },
    onEnter : function () {
        this._super();
        var self = this;
        var miny = cc.winSize.height/2 - FAIL_UI_SIZE.height / 2;

        this.winPanel.removeAllChildren();
        var w = this.winPanel.width, h = this.winPanel.height;
        var OKbtn = new cc.MenuItemImage(
            res.s_close,
            res.s_close,
            function(){
                self.onExit();
            }
        );
        OKbtn.x = w ;
        OKbtn.y = 0;
        OKbtn.scale = 1.12;

        OKbtn.setTag(2);
        var menu = new cc.Menu(OKbtn);
        menu.x=0;
        menu.y=0;
        this.helpTips.addChild(menu,20);

        this.activate = true;
    },
    onExit : function () {
        this._super();
        this.activate = false;
        this.removeChild(this.winPanel);
        this.removeChild(this.helpTips);
        this.removeChild(this.zzLayer);
        cc.eventManager.removeListener(this.listener);
        this.getParent().isFirstReturn = true;//设置为
        return false;
    }
});

var HelpScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new HelpUI();
        this.addChild(layer);
    }
});
