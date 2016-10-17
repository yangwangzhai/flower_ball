/**
 * Created by Administrator on 2016/3/24.
 */
var  FAIL_UI_SIZE = cc.size(292, 277);
var GuideUI = cc.Layer.extend({
    activate : false,
    notifySprite :null,
    replaySprite :null,
    win : false,
    tipText : null,
    winPanel : null,
    zzLayer : null,
    listener : null,
    maxTime: 30,
    firstReturn: true,
    step: 0,
    ctor : function () {
        var self = this;
        this._super(cc.color(10,10,10,100),640,960);
        this.zzLayer = new cc.LayerColor(cc.color(10,10,10,100));
        this.addChild( this.zzLayer,1);

        this.Guide1 = new cc.Sprite(res.s_guide1);
        this.Guide1.x = (cc.winSize.width )/2+120 ;
        this.Guide1.y = cc.winSize.height/2;
        this.Guide1.anchorY = 0.5;
        this.addChild(this.Guide1,5);

        this.Guide2 = new cc.Sprite(res.s_guide2);
        this.Guide2.x = (cc.winSize.width )/2-130 ;
        this.Guide2.y = cc.winSize.height/2+135;
        this.Guide2.anchorY = 0.5;
        this.addChild(this.Guide2,6);
        this.Guide2.setVisible(false);

        this.Guide3 = new cc.Sprite(res.s_guide3);
        this.Guide3.x = (cc.winSize.width )/2+150 ;
        this.Guide3.y = cc.winSize.height/2+100;
        this.Guide3.anchorY = 0.5;
        this.addChild(this.Guide3,7);
        this.Guide3.setVisible(false);

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

        var w = this.zzLayer.width, h = this.zzLayer.height;
        var NextStep = new cc.MenuItemImage(
            res.s_guide_next,
            res.s_guide_next,
            function(NextStep){
                if(self.step==0){
                    self.Guide1.setVisible(false);
                    self.Guide2.setVisible(true);
                }else if(self.step==1){
                    self.Guide2.setVisible(false);
                    self.Guide3.setVisible(true);
                }else if(self.step==2){
                    self.Guide3.setVisible(false);
                    NextStep.setVisible(false);
                    var GuideStart = new cc.MenuItemImage(
                        res.s_guide_start,
                        res.s_guide_start,
                        function(GuideStart){
                            //self.onExit();'
                            GuideStart.setVisible(false);
                            var wait_out = self.getParent().WaitOut;
                            if(typeof(wait_out) != "undefined" && wait_out != null){
                                self.unschedule(self.countDown);
                                self.onExit();
                            }else{
                                self.winPanel = new cc.Sprite(res.s_tip2);
                                self.winPanel.x = (cc.winSize.width )/2 ;
                                self.winPanel.anchorY = 0.5;
                                self.winPanel.y = cc.winSize.height/2;
                                self.winPanel.setRotation(90);
                                self.zzLayer.addChild(self.winPanel,8);
                                var w = self.winPanel.width, h = self.winPanel.height;
                                var label = new cc.LabelTTF("正在匹配玩家", "宋体", 36);
                                label.x = w/2;
                                label.y = h/2;
                                label.textAlign = cc.LabelTTF.TEXT_ALIGNMENT_CENTER;
                                label.color = cc.color(249,233,87);
                                self.winPanel.addChild(label);

                                self.schedule(self.countDown,1);
                            }

                        }
                    );
                    GuideStart.x = cc.winSize.width/2;
                    GuideStart.y = cc.winSize.height/2;
                    var GuideStartMenu = new cc.Menu(GuideStart);
                    GuideStartMenu.x=0;
                    GuideStartMenu.y=0;
                    self.zzLayer.addChild(GuideStartMenu);
                }
                self.step++;
            }
        );
        NextStep.x = w/2;
        NextStep.y = h/2 -300;
        NextStep.setTag(2);
        var menu = new cc.Menu(NextStep);
        menu.x=0;
        menu.y=0;
        this.zzLayer.addChild(menu);
        this.activate = true;
        
    },

    onExit : function () {
        this._super();
        this.activate = false;
        this.removeChild(this.zzLayer);
        cc.eventManager.removeListener(this.listener);
        this.getParent().isFirstReturn = true;//设置为
        return false;
    },
    countDown:function(){
        var wait_out = this.getParent().WaitOut;
        if(typeof(wait_out) != "undefined" && wait_out != null){
            this.unschedule(this.countDown);
            this.onExit();
        }
    }

});

var GuideScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new GuideUI();
        this.addChild(layer);
    }
});
