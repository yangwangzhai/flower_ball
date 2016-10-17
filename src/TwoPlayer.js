var TwoPlayerLayer = cc.Layer.extend({
    sprite: null,
    coin1_sprite: null,
    coin2_sprite: null,
    coin3_sprite: null,
    coin4_sprite: null,
    coin5_sprite: null,
    coin1_add_y: 6,
    win_index_arr:[],
    lost_index_arr:[],
    last_gold:0,

    ctor: function () {
        // 1. super init first
        this._super();
        var self = this;
        var size = cc.winSize;
        cc.spriteFrameCache.addSpriteFrames(res.s_card_plist);
        var coin_values = [5, 10, 20, 50 , 100];
        this.last_gold = wx_info.total_gold;

        cc.eventManager.addCustomListener(cc.game.EVENT_HIDE, function(){
            cc.log("游戏进入后台");
        });
        cc.eventManager.addCustomListener(cc.game.EVENT_SHOW, function(){
            cc.log("重新返回游戏");
        });

        //把自己的信息传到nodejs
        socket.emit('login', {openid:wx_info.openid, headimgurl:wx_info.headimgurl, total_gold:wx_info.total_gold, nickname:wx_info.nickname });
        socket.on('enter', function(obj) {
            cc.log(obj);
            room_id = obj.room_id;
        });

        //接收
        socket.on('sendOther', function(obj) {
            cc.log(obj);
            if(obj.openid != wx_info.openid){
                self.changeOtherPlayer(obj);
            }

        });

        //接收另一个人的信息
        socket.on('sendMyself', function(obj) {
                self.changeOtherPlayer(obj);
        });

        //接收下注信息
        socket.on('updatescroce', function(obj) {
            self.NumLabel.value = self.NumLabel.value + Number(obj.score);
            self.NumLabel.setString( self.NumLabel.value );

        });

        //下注提交
        // 创建一个事件监听器 OneByOne 为单点触摸
        var listener2 = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,                       // 设置是否吞没事件，在 onTouchBegan 方法返回 true 时吞掉事件，不再向下传递。
            onTouchBegan: function (touch, event) {     //实现 onTouchBegan 事件处理回调函数
                var target = event.getCurrentTarget();  // 获取事件所绑定的 target, 通常是cc.Node及其子类

                // 获取当前触摸点相对于按钮所在的坐标
                var locationInNode = target.convertToNodeSpace(touch.getLocation());
                var s = target.getContentSize();
                var rect = cc.rect(0, 0, s.width, s.height);
                var point = touch.getLocation();
                if (cc.rectContainsPoint(rect, locationInNode)) {       // 判断触摸点是否在按钮范围内
                    cc.log("sprite began... x = " + locationInNode.x + ", y = " + locationInNode.y);

                    xhr.open("POST", base_url + "&m=save_result");
                    xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded;charset=UTF-8");
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 207)) {
                            var httpStatus = xhr.statusText;
                            var responseObj = {sum: 0, game_id: 0, status: 0};
                            responseObj = eval('(' + xhr.responseText + ')');
                            socket.emit('savescroce', {score:responseObj.score, openid:wx_info.openid, key:responseObj.key });
                        }
                    };
                    var dataObj = {openid:wx_info.openid,score:5};
                    var data = postData(dataObj);//转换格式
                    xhr.send(data);


                    return true;
                }
                return false;
            }
        });
        cc.eventManager.addListener(listener2, this);


        //加载自己微信头像
        cc.loader.loadImg(wx_info.headimgurl, {isCrossOrigin : false }, function(err, img)
        {
            var sprite = new cc.Sprite(img);
            sprite.x = 73;
            sprite.y =  910;
            sprite.setAnchorPoint(0.5, 0.5);
            this.addChild(sprite, -1);

        }.bind(this));

        var my_info_font_size = 24;
        //昵称
        this.nickname = new cc.LabelTTF(wx_info.nickname, font_type, 22, cc.size(140,22));
        this.nickname.x = 140;
        this.nickname.y = 932;
        this.nickname.setAnchorPoint(0,0.5);
        this.nickname.setColor(cc.color(255, 255, 255));
        this.addChild(this.nickname, 10);
        //龙币数
        this.scoreLabel = new cc.LabelTTF(wx_info.total_gold.toString(), "Arial", my_info_font_size);
        this.scoreLabel.x = 178;
        this.scoreLabel.y = 892;
        this.scoreLabel.value = wx_info.total_gold,
        this.scoreLabel.setAnchorPoint(0,1);
        this.addChild(this.scoreLabel, 5);

        //总的下注信息
        this.NumLabel = new cc.LabelTTF("0", "Arial", 22);
        this.NumLabel.x = 327;
        this.NumLabel.y = 260;
        this.NumLabel.value = 0;
        this.NumLabel.setAnchorPoint(0,1);
        this.addChild(this.NumLabel, 5);




        this.sprite = new cc.Sprite(res.s_bg);
        this.sprite.attr({
            x: size.width / 2,
            y: size.height / 2,
            scale: 1
        });
        this.addChild(this.sprite, 1);

        var otherObj = {headimgurl:'null.png', nickname:'', total_gold:''};
        this.showOtherPlayer(otherObj);
        return true;
    },

    //加载对方的微信头像
    showOtherPlayer:function(obj){
        var self = this;
        cc.loader.loadImg(obj.headimgurl, {isCrossOrigin : false }, function(err, img)
        {
            self.headsprite = new cc.Sprite(img);
            self.headsprite.x =283;
            self.headsprite.y =  110;
            self.headsprite.setAnchorPoint(0.5, 0.5);
            self.addChild(self.headsprite, 21);

        }.bind(this));
        var my_info_font_size = 24;
        //昵称
        this.nickname2 = new cc.LabelTTF(obj.nickname, font_type, 22, cc.size(140,22));
        this.nickname2.x = 340;
        this.nickname2.y =132;
        this.nickname2.setAnchorPoint(0,0.5);
        this.nickname2.setColor(cc.color(255, 255, 255));
        this.addChild(this.nickname2, 10);
        //龙币数
        this.scoreLabel2 = new cc.LabelTTF(obj.total_gold.toString(), "Arial", my_info_font_size);
        this.scoreLabel2.x = 328;
        this.scoreLabel2.y = 120;
        this.scoreLabel2.value = obj.total_gold,
        this.scoreLabel2.setAnchorPoint(0,1);
        this.addChild(this.scoreLabel2, 5);


},

    changeOtherPlayer:function(obj){
       var self = this;
        cc.loader.loadImg(obj.headimgurl, {isCrossOrigin : false }, function(err, img) {
            self.removeChild(self.headsprite);
            self.headsprite = new cc.Sprite(img);
            self.headsprite.x =283;
            self.headsprite.y =  110;
            self.headsprite.setAnchorPoint(0.5, 0.5);
            self.addChild(self.headsprite, 21);
        }.bind(this));

        this.nickname2.setString(obj.nickname);
        this.scoreLabel2.setString(obj.total_gold);

    }
});

var TwoPlayerScene = cc.Scene.extend({
    onEnter: function () {
        this._super();
        var layer = new TwoPlayerLayer();
        this.addChild(layer);
    }
});

