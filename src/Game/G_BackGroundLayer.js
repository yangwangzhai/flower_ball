/**
 * Created by lkl on 2016/8/12.
 * 加载背景图片
 * 加载微信头像
 * 加载微信昵称
 * 加载我的烟豆
 * 加载赚取烟豆
 *
 */

var BG_Object = null;
var PlayerType = null;
var OtherPlayerOpenid = null;
var room_id = null;
var game_type = null;

var G_BackGroundLayer = cc.Layer.extend({
    sprite:null,
    _Avatar : null,

    ctor:function () {
        // 1. super init first
        this._super();
        BG_Object = this;
        var self = this;
        this.WinSize = cc.winSize;
        this.my_win_bean = 0;

        cc.eventManager.addCustomListener(cc.game.EVENT_HIDE, function(){
            //cc.log("游戏进入后台");
        });
        cc.eventManager.addCustomListener(cc.game.EVENT_SHOW, function(){
            //cc.log("重新返回游戏");
        });

        //把自己的信息传到nodejs
        socket.emit('login', {openid:wx_info.openid, headimgurl:wx_info.imgUrl, total_gold:wx_info.total_gold, nickname:wx_info.nickname ,ActiveID:wx_info.ActiveID});
        socket.on('enter', function(obj) {
            //cc.log(obj);
            room_id = obj.room_id;
            PlayerType = obj.playerType;
            //cc.log(PlayerType);
        });

        //第一个人进来后，等待第二个人进来，匹配成功后，接收第二个人的信息（第一个人执行的是此函数）
        socket.on('sendOther', function(obj) {
            if(obj.openid != wx_info.openid){
                OtherPlayerOpenid = obj.openid;
                //cc.log("sendOther-接收第二个人的openid："+OtherPlayerOpenid);
                self.changeOtherPlayer(obj);
            }

        });

        //第二个人进来后，匹配第一个人的信息，成功后接收第一个人的信息（第二个人执行此函数）
        socket.on('sendMyself', function(obj) {
            if(obj.openid == wx_info.openid){
                //cc.log("sendMyself-接收第一个人的openid："+obj.OtherPlayerOpenid);
                //cc.log("sendMyself-游戏类型为："+obj.game_type);
                OtherPlayerOpenid = obj.OtherPlayerOpenid;
                game_type = obj.game_type;
                self.changeOtherPlayer(obj);
            }
        });

        //接收系统随机抽取的人（人机对战时，才执行此函数；人人对战不执行此函数）
        socket.on('xt_send',function(obj){
            //cc.log("xt_send-接收系统的openid："+obj.OtherPlayerOpenid);
            //cc.log("xt_send-游戏类型为："+obj.game_type);
            OtherPlayerOpenid = obj.OtherPlayerOpenid;
            game_type = obj.game_type;
            self.changeOtherPlayer(obj);
        });

        //加载背景图片
        this.initBackGround();

        //加载微信头像、微信昵称、我的烟豆、赚取烟豆
        this.initHeader();

        //加载对方面板图片
        this.initOtherPanel();

        var otherObj = {headimgurl:'null.png', nickname:'', total_gold:''};
        this.initPlayerHeader(otherObj);

        return true;
    },

    //加载背景图片
    initBackGround : function() {
        this._bg = new cc.Sprite(res.S_bg);
        this._bg.attr({
            x:this.WinSize.width/2,
            y:this.WinSize.height/2
        });
        this._bg.setRotation(90);
        this.addChild(this._bg);

    },

    //加载自己的微信头像、微信昵称、我的烟豆、赚取烟豆
    initHeader : function() {
        var self = this;
        //加载微信头像到背景图的某个位置
        cc.loader.loadImg(wx_info.imgUrl, {isCrossOrigin : false }, function(err, img)
        {
            self._Avatar = new cc.Sprite(img);
            //设置精灵（图片）的锚点
            self._Avatar.attr({
                anchorX : 0.5,
                anchorY : 0.5
            });
            self._Avatar.setPosition(this._Avatar.width/2+11,this.WinSize.height-this._Avatar.height/2-3);  //设置微信头像的位置
            self._Avatar.setRotation(90);
            self.addChild(self._Avatar);

        }.bind(this));

        //微信昵称
        this._NickName_label = new cc.LabelTTF(wx_info.nickname,'Arial',20);
        this._NickName_label.attr({
            anchorX : 0,
            anchorY : 0.5
        });
        this._NickName_label.setPosition(75,850);
        this._NickName_label.setRotation(90);
        this.addChild(this._NickName_label);

        //我的烟豆
        this._mybean = new cc.LabelTTF(wx_info.total_gold,'Arial',20);
        this._mybean.attr({
            anchorX : 0,
            anchorY : 0.5
        });
        this._mybean.setPosition(21,805);
        this._mybean.setRotation(90);
        this.addChild(this._mybean);

    },

    initOtherPanel:function(){
        this.s_panelArea = new cc.Sprite(res.s_panel);
        this.s_panelArea.attr({
            x:this.WinSize.width-this.s_panelArea.height/2,
            y:this.WinSize.height-this.s_panelArea.width/2
        });
        this.s_panelArea.setRotation(90);
        this.addChild(this.s_panelArea);
    },

    //加载对手玩家微信头像、微信昵称、烟豆
    initPlayerHeader : function(obj) {
        var self = this;
        //加载微信头像到背景图的某个位置
        cc.loader.loadImg(obj.imgUrl, {isCrossOrigin : false }, function(err, img)
        {
            self.headsprite = new cc.Sprite(img);
            self.headsprite.x = this.WinSize.width-self.headsprite.width/2;
            self.headsprite.y = this.WinSize.height-250;
            self.headsprite.setAnchorPoint(0.5, 0.5);
            self.headsprite.setRotation(90);
            self.addChild(self.headsprite, 21);
        }.bind(this));

        var my_info_font_size = 24;
        //昵称
        this.nickname2 = new cc.LabelTTF('昵称：'+obj.nickname, font_type, 22, cc.size(140,22));
        this.nickname2.x = this.WinSize.width-120;
        this.nickname2.y = this.WinSize.height-190;
        this.nickname2.setAnchorPoint(0,0.5);
        this.nickname2.setColor(cc.color(0, 250, 154));
        this.nickname2.setRotation(90);
        this.addChild(this.nickname2, 10);

        //龙币数
        this.scoreLabel2 = new cc.LabelTTF(obj.total_gold.toString(), "Arial", my_info_font_size);
        this.scoreLabel2.x = this.WinSize.width-45;
        this.scoreLabel2.y = this.WinSize.height-20;
        this.scoreLabel2.value = obj.total_gold,
        this.scoreLabel2.setAnchorPoint(0,1);
        this.scoreLabel2.setRotation(90);
        this.addChild(this.scoreLabel2, 5);

    },

    changeOtherPlayer:function(obj){
        var self = this;
        cc.loader.loadImg(obj.headimgurl, {isCrossOrigin : false }, function(err, img) {
            self.removeChild(self.headsprite);
            self.headsprite = new cc.Sprite(img);
            self.headsprite.x = this.WinSize.width-self.headsprite.width/2;
            self.headsprite.y = this.WinSize.height-250;
            self.headsprite.setAnchorPoint(0.5, 0.5);
            self.headsprite.setRotation(90);
            self.addChild(self.headsprite, 21);
        }.bind(this));

        this.nickname2.setString(obj.nickname);
        this.scoreLabel2.setString(obj.total_gold);

    }


});

