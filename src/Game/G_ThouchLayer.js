/**
 * Created by lkl on 2016/8/12.
 */
var G_ThouchLayer = cc.Layer.extend({
    sprite: null,
    curr_selected_OBJ: null,//当前选中的押号按钮
    curr_bet_obj: null,//当前选中的下注按钮
    bet_on_obj: null,   //存放押注对象
    my_YD: null,//我的烟豆(与数据库同步)
    UI_YD: null,//UI显示的烟豆数
    show_xz: null,    //游戏底部下注数组
    poker_value:null,//玩家背景牌精灵
    poker_value2:null,//庄家背景牌精灵
    player_num:null,//玩家、庄家的牌数（从后台异步获取）
    player_num2:null,//玩家、庄家的牌数（从后台异步获取）
    bgmusic_flag:null,
    MusicSet:null,
    EffectsSet:null,
    WaitOut:null,

    ctor: function () {
        // 1. super init first
        this._super();
        this.WinSize = cc.winSize;  //获取当前游戏窗口大小
        this.my_YD = wx_info.total_gold;
        this.UI_YD = wx_info.total_gold;
        this.MusicSet = wx_info.MusicSet;
        this.EffectsSet = wx_info.EffectsSet;
        var self = this;
        cc.spriteFrameCache.addSpriteFrames(res.s_card_plist);

        //第一个人下注后,将下注信息发送给第二个人,第二个人通过此函数接收下注信息（第二个人使用此函数）
        socket.on('updatescroce', function(obj) {
            if(obj.openid!=wx_info.openid){
                self.changeOtherXz(obj);
            }
        });

        //第一个人下注完成，点击“准备就绪”按钮后，发送一个信号给第二个人，第二个人通过此函数接收该信号后，生成“开始发牌”按钮
        socket.on('get_player_ready', function(obj) {
            if(obj.openid!=wx_info.openid){
                if(obj.player_ready==1){
                    self._start_menu.setVisible(true);
                    self.bet_on_obj.total = obj.score;
                }
            }
        });

        //第二个人点击“开始发牌”按钮后，后台生成相应的结果和牌面，第一个人通过此函数获取结果和牌面（此函数第一个人使用）
        socket.on('otherPlayerGetPoker', function(obj) {
            if(obj.openid!=wx_info.openid){
                self.showOtherPoker(obj);
            }
        });


        //喇叭公告
        setXlbText(this);
        this.schedule(function noting() {
                setXlbText(self);
            }, 20
        );

        this.initBgMusicBtn();//设置喇叭播放按钮位置

        this.initBgMusicStopBtn();//设置喇叭禁止播放按钮位置

        this.initBgMusic(); //播放背景音乐

        this.initHelpBtn();//设置"帮助"按钮位置

        this.initBetOnObj();//初始化押注值：0

        this.initBetArea();//设置投注值位置（10 20 50 100）

        this.initXzArea();//设置下注数值

        this.initCancelArea();//设置”取消下注按“钮位置（点击下注前，隐藏）

        this.initStartArea();//设置”开始发牌“按钮位置（点击下注前，隐藏）

        this.initShowDownArea();//设置”摊牌“按钮位置（点击下注前，隐藏）

        this.initReadyArea();//设置”“准备按钮位置，点击之后可以重新下注（点击下注前，隐藏）

        this.initPlayerReadyBtn();//玩家“准备就绪”按钮，下好注之后，点击该按钮，发送一个信号给庄家，庄家接收到准备就绪信号后，生成开始发牌按钮

        this.initOtherXzArea();//设置对方的下注值位置

        this.initPlayAgainBtn();//再玩一局按钮

        this.schedule(this.showOtherid,1);

        //是否是第一次进来，是则弹出游戏指引
        cc.log("是否是第一次进入游戏："+wx_info.first_time);
        if(wx_info.first_time=='yes'){
            var guideUI = new GuideUI("正在匹配玩家");
            this.addChild(guideUI,30);
        }else{
            //加载匹配玩家界面，匹配成功后，自动退出等待界面
            if(!OtherPlayerOpenid){
             var waitUI = new WaitUI("正在匹配玩家");
             this.addChild(waitUI,30);
             }
        }

        this.schedule(this.chooseBaker, 1 ,10, 1);    //定时函数，每1秒执行一次chooseBaker函数

        return true;
    },

    showOtherid:function(){
        //cc.log("showOtherid-other_id："+OtherPlayerOpenid);
        if(typeof(OtherPlayerOpenid) != "undefined" && OtherPlayerOpenid != null){
            this.WaitOut = OtherPlayerOpenid;
            this.unschedule(this.showOtherid);
        }
    },

    //玩家“准备就绪”按钮
    initPlayerReadyBtn:function(){
        this.s_btn_PlayerreadyArea = new cc.MenuItemImage(res.s_ready_go,res.s_ready_go,this.PlayerReadyCallback,this);
        this.s_btn_PlayerreadyArea.attr({
            x:50,
            y:100+this.s_btn_startArea.height
        });
        this.s_btn_PlayerreadyArea.setRotation(90);
        this._Playerready_menu = new cc.Menu(this.s_btn_PlayerreadyArea);
        this._Playerready_menu.x=0;
        this._Playerready_menu.y=0;
        this.addChild(this._Playerready_menu);
        this._Playerready_menu.setVisible(false);
    },

    PlayerReadyCallback:function(){
        if(game_type==1){
            cc.log("现在是人机对战");
            this.xt_beginCallback();
            this._Playerready_menu.setVisible(false);//隐藏“准备就绪”按钮
            this._cancel_bet_menu.setVisible(false);//隐藏“取消下注”按钮
        }else{
            xhr.open("POST", base_url + "&m=send_player_ready");
            xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded;charset=UTF-8");
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 207)) {
                    var httpStatus = xhr.statusText;
                    var responseObj = {sum: 0, game_id: 0, status: 0};
                    responseObj = eval('(' + xhr.responseText + ')');
                    socket.emit('send_player_ready', {score:responseObj.score, openid:wx_info.openid, key:responseObj.key,player_ready:responseObj.player_ready,roomid:room_id});
                }
            };
            var data = this.postData2(this.bet_on_obj.total);//转换格式
            xhr.send(data);
            this._Playerready_menu.setVisible(false);
        }

    },

    //选择谁是庄家
    chooseBaker:function(){
        if(PlayerType!=null){
            if(PlayerType=="player2"){
                //是庄家
                this._bet_menu.setVisible(false);
            }
            this.unschedule(this.chooseBaker);
        }
    },

    //播放背景音乐
    initBgMusic: function () {
        if(this.MusicSet){
            cc.audioEngine.playMusic(res.s_bg_music,true);
            this._s_horn_menu.setVisible(true);
        }else{
            cc.audioEngine.stopMusic();
            this._s_hornStop_menu.setVisible(true);
        }

    },

    //设置喇叭播放按钮位置
    initBgMusicBtn: function () {
        this.s_hornArea = new cc.MenuItemImage(res.s_horn,res.s_horn,this.BgMusicCallback,this);
        this.s_hornArea.attr({
            x:75,
            y:30
        });
        this.s_hornArea.setRotation(90);
        this._s_horn_menu = new cc.Menu(this.s_hornArea);
        this._s_horn_menu.x=0;
        this._s_horn_menu.y=0;
        this.addChild(this._s_horn_menu);
        this._s_horn_menu.setVisible(false);
    },

    //设置喇叭禁止播放按钮位置
    initBgMusicStopBtn: function () {
        this.s_hornStopArea = new cc.MenuItemImage(res.s_stop_horn,res.s_stop_horn,this.BgMusicCallback,this);
        this.s_hornStopArea.attr({
            x:75,
            y:30
        });
        this.s_hornStopArea.setRotation(90);
        this._s_hornStop_menu = new cc.Menu(this.s_hornStopArea);
        this._s_hornStop_menu.x=0;
        this._s_hornStop_menu.y=0;
        this.addChild(this._s_hornStop_menu);
        this._s_hornStop_menu.setVisible(false);
    },

    BgMusicCallback: function(){
        if(this.MusicSet){
            cc.audioEngine.stopMusic();
            this._s_hornStop_menu.setVisible(true);
            this._s_horn_menu.setVisible(false);
            this.MusicSet = 0;
        }else{
            cc.audioEngine.playMusic(res.s_bg_music,true);
            this._s_hornStop_menu.setVisible(false);
            this._s_horn_menu.setVisible(true);
            this.MusicSet = 1;
        }

        var xhr = cc.loader.getXMLHttpRequest();
        xhr.open("POST",  base_url +"&m=set_music");
        //set Content-type "text/plain;charset=UTF-8" to post plain text
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status >= 200 && xhr.status <= 207) {
                    var response = eval("("+xhr.responseText+")");//接收服务器返回结果
                    if(response.Code == 0){
                        //cc.log(response.MusicSet);
                    }else{
                        alert(response.Msg);
                    }
                }else {
                    var tipUI = new TipUI("网络故障，请稍后再试试~");
                    this.addChild(tipUI,100);
                }
            }
        };
        xhr.send("MusicSet="+this.MusicSet+"&Openid="+wx_info.openid);//发送下注信息到服务器

    },

    //设置帮助按钮位置
    initHelpBtn:function(){
        this.s_helpArea = new cc.MenuItemImage(res.s_help,res.s_help,this.HelpCallback,this);
        this.s_helpArea.attr({
            x:25,
            y:30
        });
        this.s_helpArea.setRotation(90);
        this._s_help_menu = new cc.Menu(this.s_helpArea);
        this._s_help_menu.x=0;
        this._s_help_menu.y=0;
        this.addChild(this._s_help_menu);
    },

    HelpCallback:function(){
        var helpUI = new HelpUI();
        this.addChild(helpUI,999);
    },

    //初始化押注值：0
    initBetOnObj: function () {
        this.bet_on_obj = {'total': 0};
    },

    //设置投注值位置（10 20 50 100）
    initBetArea: function () {
        var PositionX = this.WinSize.width/2;

        this._bet_5 = new cc.MenuItemImage(res.s_bet5,res.s_bet5, this.betCallBack, this);
        this._bet_5.attr({
            x: PositionX,
            y: this.WinSize.height/2+2*this._bet_5.height,
            bet_num: 5
        });
        this._bet_5.setRotation(90);

        this._bet_10 = new cc.MenuItemImage(res.s_bet10,res.s_bet10, this.betCallBack, this);
        this._bet_10.attr({
            x: PositionX,
            y: this.WinSize.height/2+this._bet_10.height,
            bet_num: 10
        });
        this._bet_10.setRotation(90);

        this._bet_20 = new cc.MenuItemImage(res.s_bet20,res.s_bet20, this.betCallBack, this);
        this._bet_20.attr({
            x: PositionX,
            y: this.WinSize.height/2,
            bet_num: 20
        });
        this._bet_20.setRotation(90);

        this._bet_50 = new cc.MenuItemImage(res.s_bet50,res.s_bet50, this.betCallBack, this);
        this._bet_50.attr({
            x: PositionX,
            y: this.WinSize.height/2-this._bet_10.height,
            bet_num: 50
        });
        this._bet_50.setRotation(90);

        this._bet_100 = new cc.MenuItemImage(res.s_bet100,res.s_bet100, this.betCallBack, this);
        this._bet_100.attr({
            x: PositionX,
            y: this.WinSize.height/2-2*this._bet_5.height,
            bet_num: 100
        });
        this._bet_100.setRotation(90);

        this._bet_menu = new cc.Menu(this._bet_5,this._bet_10,this._bet_20,this._bet_50,this._bet_100);
        this._bet_menu.attr({
            x: 0,
            y: 0
        });
        this.addChild(this._bet_menu);

    },
    //投注之后回调函数：依次累加每次投注的值
    betCallBack: function (sender){
        var self = this;
        var effect_ya = cc.audioEngine.playEffect(res.s_ya,false);
        //cc.log("此前的下注值："+this.bet_on_obj.total);
        //cc.log("当前的下注值："+sender.bet_num);
        if(this.checkYD(this.bet_on_obj.total+sender.bet_num)){
            xhr.open("POST", base_url + "&m=compare");
            xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded;charset=UTF-8");
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 207)) {
                    responseObj = eval('(' + xhr.responseText + ')');
                    if(responseObj.com_result){
                        self._Playerready_menu.setVisible(true);//显示”准备就绪“按钮
                        self._cancel_bet_menu.setVisible(true); //显示"取消下注"按钮
                        self.bet_on_obj.total += sender.bet_num;    //累加每次投注的值
                        //cc.log("总的下注值："+self.bet_on_obj.total);
                        self.show_xz.setString(self.bet_on_obj.total); //设置文本框中的文本
                        //cc.log("扣除本次前，总剩余龙币："+self.UI_YD);
                        self.UI_YD -= sender.bet_num;
                        //cc.log("扣除本次后，总剩余龙币："+self.UI_YD);
                        BG_Object._mybean.setString(self.UI_YD); //设置文本框中的文本

                        socket.emit('savescroce', {score:responseObj.score, openid:wx_info.openid, key:responseObj.key ,roomid:room_id});
                    }else{
                        var tipUI = new TipUI("庄家龙币不足！");
                        self.addChild(tipUI,100);
                    }
                }
            };
            var data = this.bet_on_obj.total+sender.bet_num;
            var params = "openid="+wx_info.openid+"&gamekey="+wx_info.gamekey+"&score="+data+"&other_opendid="+OtherPlayerOpenid+"&game_type="+game_type;
            xhr.send(params);
        }else{
            var tipUI = new TipUI("龙币不足！");
            this.addChild(tipUI,100);
        }
    },

    //总的押注数值
    initXzArea:function(){
        var fontColor = new cc.Color(255, 255, 255);  //实列化颜色对象
        this.show_xz = new cc.LabelTTF('0', 'Arial', 20);
        this.show_xz.attr({
            x: 58,
            y: 590,
            anchorX: 0.5,
            anchorY: 0.5
        });
        this.show_xz.setRotation(90);
        this.show_xz.setColor(fontColor);
        this.addChild(this.show_xz);
        //this.show_xz.setVisible(false);
    },

    //“取消下注”按钮
    initCancelArea:function(){
        this.s_cancel_betArea = new cc.MenuItemImage(res.s_cancel_bet,res.s_cancel_bet,this.cancelCallback,this);
        this.s_cancel_betArea.attr({
            x:50,
            y:300+this.s_cancel_betArea.height
        });
        this.s_cancel_betArea.setRotation(90);
        this._cancel_bet_menu = new cc.Menu(this.s_cancel_betArea);
        this._cancel_bet_menu.x=0;
        this._cancel_bet_menu.y=0;
        this.addChild(this._cancel_bet_menu);
        this._cancel_bet_menu.setVisible(false);
    },

    cancelCallback:function(){
        this.UI_YD = parseInt(this.UI_YD)+parseInt(this.bet_on_obj.total);//归还已下注的龙币回玩家
        //cc.log("最后剩余："+this.UI_YD);
        BG_Object._mybean.setString(this.UI_YD);  //显示最新的龙币值
        this.bet_on_obj.total = 0;//下注值清空
        this.show_xz.setString(this.bet_on_obj.total); //下注值显示为0
        this._Playerready_menu.setVisible(false);//隐藏准备就绪按钮
        //对方庄家同步更新玩家下注值
        xhr.open("POST", base_url + "&m=compare");
        xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded;charset=UTF-8");
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 207)) {
                responseObj = eval('(' + xhr.responseText + ')');
                    socket.emit('savescroce', {score:responseObj.score, openid:wx_info.openid, key:responseObj.key ,roomid:room_id});

            }
        };
        var data = 0;
        var params = "openid="+wx_info.openid+"&gamekey="+wx_info.gamekey+"&score="+data+"&other_opendid="+OtherPlayerOpenid+"&game_type="+game_type;
        xhr.send(params);

    },

    //“开始发牌”按钮
    initStartArea:function(){
        this.s_btn_startArea = new cc.MenuItemImage(res.s_btn_start,res.s_btn_start,this.beginCallback,this);
        this.s_btn_startArea.attr({
            x:50,
            y:100+this.s_btn_startArea.height
        });
        this.s_btn_startArea.setRotation(90);
        this._start_menu = new cc.Menu(this.s_btn_startArea);
        this._start_menu.x=0;
        this._start_menu.y=0;
        this.addChild(this._start_menu);
        this._start_menu.setVisible(false);
    },

    //“摊牌”
    initShowDownArea:function(){
        this.s_show_downArea = new cc.MenuItemImage(res.s_btn_show,res.s_btn_show,this.resultCallback,this);
        this.s_show_downArea.attr({
            x:145,
            y:210
        });
        this.s_show_downArea.setRotation(90);
        this._s_show_down_menu = new cc.Menu(this.s_show_downArea);
        this._s_show_down_menu.x=0;
        this._s_show_down_menu.y=0;
        this.addChild(this._s_show_down_menu);
        this._s_show_down_menu.setVisible(false);
    },

    //人人对战发牌动作
    beginCallback:function(){
        var effect_send = cc.audioEngine.playEffect(res.s_send,false);
        var self=this;
        //异步
        xhr.open("POST", base_url +"&m=main");
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status >= 200 && xhr.status <= 207) {
                    var response = eval("("+xhr.responseText+")");//接收服务器返回结果
                    self.player_num =response ; //玩家、庄家的牌数赋值给全景变量
                    //将结果和具体牌面发给对手
                    socket.emit('sendPokerNum', {score:response.bets,winner:response.winner, openid:wx_info.openid, p_1:response.p_1,p_2:response.p_2, b_1:response.b_1,b_2:response.b_2,key:response.key,F_My_YD:response.Other_YD,F_Other_YD:response.My_YD,roomid:room_id});
                    if(response.Code == 0){
                        //给闲家发背面牌
                        //self.resultAreaHide();
                        //发牌前，先隐藏“开始”按钮，“下注”按钮
                        self._start_menu.setVisible(false);
                        self._bet_menu.setVisible(false);
                        self.poker_value  = new cc.Sprite(res.s_bg_poker);
                        self.poker_value.attr({
                            x:self.WinSize.width/2-120,
                            y:165
                        });
                        self.poker_value.setRotation(92);
                        self.addChild( self.poker_value );
                        var action1 = cc.moveTo(0.5,cc.p(185, self.WinSize.height/2));
                        var callback = cc.callFunc(self.showCallBack,self);
                        var sequence = cc.sequence(action1,callback);
                        self.poker_value.runAction(sequence);
                        self.s_show_downArea.setVisible(true);
                        //玩家翻牌
                        self.scheduleOnce(function(){
                            var b1 = self.player_num.b_1;
                            var b2 = self.player_num.b_2;
                            var player_poker = new cc.Sprite('#'+b1+'_'+b2+'.png');
                            player_poker.attr({
                                x : self.poker_value.width/2,
                                y : self.poker_value.height/2
                            });
                            self.poker_value.addChild(player_poker);
                            self.resultAreaShow();//显示“翻牌”按钮
                        },0.5);

                    }else{
                        alert(response.Msg);
                    }
                }else {
                    alert('网络故障，请稍后再试试~');
                }
            }
        };
        var params = "openid="+wx_info.openid+"&gamekey="+wx_info.gamekey+"&bet_num="+this.bet_on_obj.total+"&otherplayeropenid="+OtherPlayerOpenid;
        xhr.send(params);//发送下注信息到服务器

    },

    //放置一张扑克牌（正面）隐藏
    showCallBack:function(node){
        //给对手发背面牌
        this.poker_value2  = new cc.Sprite(res.s_bg_poker);
        this.poker_value2.attr({
            x:this.WinSize.width/2-120,
            y:165
        });
        this.poker_value2.setScale(0.6,0.6);//设置精灵的缩放比例
        this.poker_value2.setRotation(90);
        this.addChild( this.poker_value2 );
        var action2 = cc.moveTo(0.5,cc.p(400, this.WinSize.height/2));
        var sequence2 = cc.sequence(action2);
        this.poker_value2.runAction(sequence2);
    },

    //点击“摊牌”按钮后的回调函数：摊开庄家的底牌。。。
    resultCallback:function(){
        var p1 = this.player_num.p_1;
        var p2 = this.player_num.p_2;
        var baker_poker = new cc.Sprite('#'+p1+'_'+p2+'.png');
        baker_poker.attr({
            x :  this.poker_value2.width/2,
            y :  this.poker_value2.height/2
        });
        this.poker_value2.addChild(baker_poker);
        //判断谁赢
        if(this.player_num.winner=='baker'){
            var effect_player_win = cc.audioEngine.playEffect(res.s_player_win,false);
            this.playerWin();
        }else{
            var effect_baker_win = cc.audioEngine.playEffect(res.s_baker_win,false);
            this.bankerWin();
        }
        this.s_show_downArea.setVisible(false);
    },

    //闲家赢的动画
    playerWin:function(){
        //押注图标从庄家移动到闲家
        this.playerChips  = new cc.Sprite(res.s_win);
        this.playerChips.attr({
            x:this.WinSize.width/2,
            y:this.WinSize.height/2
        });
        this.playerChips.setOpacity(0);
        this.playerChips.setRotation(90);
        this.addChild( this.playerChips );
        var delay = cc.delayTime(1);
        var action1 = cc.fadeIn(0.2);
        var callback1 = cc.callFunc(this.playerAdd,this);   //龙币加
        var action2 = cc.fadeOut(0.2);
        var callback2 = cc.callFunc(this.playerFadeOut,this);
        var sequence = cc.sequence(action1,callback1,delay,action2,callback2);
        this.playerChips.runAction(sequence);
    },

    playerAdd:function(node){
        this.show_xz.setVisible(false);
        this.my_YD = this.player_num.My_YD;   //更新我的龙币值
        this.UI_YD = this.player_num.My_YD;   //更新我的龙币值
        BG_Object._mybean.setString(this.UI_YD);  //显示最新的龙币值
        BG_Object.scoreLabel2.setString(this.player_num.Other_YD);  //显示对方最新的龙币值
        this.other_show_xz.setString("0");  //对方下注值归零
    },

    playerFadeOut:function(node){
        this._s_play_again_menu.setVisible(true);//显示”再玩一局“按钮，点击清空台面，重新开始下一局
    },


    //庄家赢的动画
    bankerWin:function(){
        //押注图标从闲家移动到庄家
        this.playerChipsTemp  = new cc.Sprite(res.s_lose);
        this.playerChipsTemp.attr({
            x:this.WinSize.width/2,
            y:this.WinSize.height/2
        });
        this.playerChipsTemp.setOpacity(0);
        this.playerChipsTemp.setRotation(90);
        this.addChild( this.playerChipsTemp );
        var delay = cc.delayTime(1);
        var callback1 = cc.callFunc(this.bakerFadeOut,this);
        var action1 = cc.fadeIn(0.2);
        var callback2 = cc.callFunc(this.bakerFadeOut2,this);
        var action2 = cc.fadeOut(0.2);
        var sequence = cc.sequence(callback1,action1,delay,callback2,action2);
        this.playerChipsTemp.runAction(sequence);
    },

    bakerFadeOut:function(){
        this.show_xz.setVisible(false);
        this.my_YD = this.player_num.My_YD;   //更新我的龙币值
        this.UI_YD = this.player_num.My_YD;   //更新我的龙币值
        BG_Object._mybean.setString(this.UI_YD);  //显示最新的龙币值
        BG_Object.scoreLabel2.setString(this.player_num.Other_YD);  //显示对方最新的龙币值
        this.other_show_xz.setString("0");  //对方下注值归零
    },

    bakerFadeOut2:function(){
        this._s_play_again_menu.setVisible(true);//显示”再玩一局“按钮，点击清空台面，重新开始下一局
    },

    //设置”再玩一局“按钮
    initPlayAgainBtn:function(){
        this.s_play_again = new cc.MenuItemImage(res.s_play_again,res.s_play_again,this.PlayAgainCallback,this);
        this.s_play_again.attr({
            x:310,
            y:480
        });
        this.s_play_again.setRotation(90);
        this._s_play_again_menu = new cc.Menu(this.s_play_again);
        this._s_play_again_menu.x=0;
        this._s_play_again_menu.y=0;
        this.addChild(this._s_play_again_menu);
        this._s_play_again_menu.setVisible(false);
    },

    PlayAgainCallback:function(){
        this._s_play_again_menu.setVisible(false);
        this.poker_value.setVisible(false);
        this.poker_value2.setVisible(false);
        this._s_show_down_menu.setVisible(false);
        this.bet_on_obj.total = 0;
    },


    initReadyArea:function(){
        this.s_btn_readyArea = new cc.MenuItemImage(res.s_play_again,res.s_play_again,this.readyCallback,this);
        this.s_btn_readyArea.attr({
            x:310,
            y:480
        });
        this.s_btn_readyArea.setRotation(90);
        this._ready_menu = new cc.Menu(this.s_btn_readyArea);
        this._ready_menu.x=0;
        this._ready_menu.y=0;
        this.addChild(this._ready_menu);
        this._ready_menu.setVisible(false);
    },

    //点击“准备”按钮后的回调函数：隐藏当前显示的扑克、准备按钮、摊牌按钮；显示投注框、投注的值
    readyCallback:function(){
        this.poker_value.setVisible(false);
        this.poker_value2.setVisible(false);
        this._bet_menu.setVisible(true);
        this._ready_menu.setVisible(false);
        this._s_show_down_menu.setVisible(false);
        //上一盘的下注值清零
        this.bet_on_obj.total = 0;
    },

    //显示结果
    resultAreaShow : function() {
        this._s_show_down_menu.setVisible(true);
    },

    //隐藏结果
    resultAreaHide : function() {
        //发牌前，先隐藏“开始”按钮，“下注”按钮
        this._start_menu.setVisible(false);
        this._bet_menu.setVisible(false);
    },

    //判断是否有充足的烟豆下注
    checkYD: function (bet_num) {
        if (!bet_num) {
            return false;
        }
        //判断，若用户烟豆>=下注的总数
        if (this.my_YD >= bet_num) {
            return true;
        }else{
            return false;
        }

    },

    postData2: function(data){
        var params = "openid="+wx_info.openid+"&gamekey="+wx_info.gamekey+"&score="+data;
        return params;
    },

    //对方总的押注数值
    initOtherXzArea:function(){
        var fontColor = new cc.Color(255, 255, 0);  //实列化颜色对象
        this.other_show_xz = new cc.LabelTTF('0', 'Arial', 20);
        this.other_show_xz.attr({
            x: this.WinSize.width-120,
            y: this.WinSize.height-30,
            anchorX: 0.5,
            anchorY: 0.5
        });
        this.other_show_xz.setRotation(90);
        this.other_show_xz.setColor(fontColor);
        this.addChild(this.other_show_xz);
    },

    changeOtherXz:function(obj){
        cc.log(obj.score);
        var value = Number(obj.score);
        this.other_show_xz.setString( value );
    },

    //开始给第一个人发牌（第一个人调用此函数）
    showOtherPoker:function(obj){
        //给第一个人自己发背景牌
        this.player_num2 = obj;
        var self = this;
        self.resultAreaHide();
        self.poker_value  = new cc.Sprite(res.s_bg_poker);
        self.poker_value.attr({
            x:self.WinSize.width/2,
            y:265
        });
        self.poker_value.setRotation(92);
        self.addChild( self.poker_value );
        var action1 = cc.moveTo(0.5,cc.p(185, self.WinSize.height/2));
        var callback = cc.callFunc(self.showCallBack,self);
        var sequence = cc.sequence(action1,callback);
        self.poker_value.runAction(sequence);
        //self.s_show_downArea.setVisible(true);
        //翻开第一个人自己的牌
        self.scheduleOnce(function(){
            var p1 = obj.p_1;
            var p2 = obj.p_2;
            var player_poker = new cc.Sprite('#'+p1+'_'+p2+'.png');
            player_poker.attr({
                x : self.poker_value.width/2,
                y : self.poker_value.height/2
            });
            self.poker_value.addChild(player_poker);
            self.initShowOtherDownArea();
        },0.5);

    },

    //“摊牌”
    initShowOtherDownArea:function(){
        this.s_other_show_downArea = new cc.MenuItemImage(res.s_btn_show,res.s_btn_show,this.resultOtherCallback,this);
        this.s_other_show_downArea.attr({
            x:145,
            y:210
        });
        this.s_other_show_downArea.setRotation(90);
        this._s_other_show_down_menu = new cc.Menu(this.s_other_show_downArea);
        this._s_other_show_down_menu.x=0;
        this._s_other_show_down_menu.y=0;
        this.addChild(this._s_other_show_down_menu);
    },

    //点击“摊牌”按钮后的回调函数：摊开庄家的底牌。。。
    resultOtherCallback:function(){
        var b1 = this.player_num2.b_1;
        var b2 = this.player_num2.b_2;
        var baker_poker = new cc.Sprite('#'+b1+'_'+b2+'.png');
        baker_poker.attr({
            x :  this.poker_value2.width/2,
            y :  this.poker_value2.height/2
        });
        this.poker_value2.addChild(baker_poker);
        //判断谁赢
        if(this.player_num2.winner=='baker'){
            var effect_baker_win = cc.audioEngine.playEffect(res.s_baker_win,false);
            this.otherbankerWin();
        }else{
            var effect_player_win = cc.audioEngine.playEffect(res.s_player_win,false);
            this.otherplayerWin();
        }
        this.s_other_show_downArea.setVisible(false);
    },

    otherplayerWin:function(){
        //押注图标从庄家移动到闲家
        this.playerChips  = new cc.Sprite(res.s_win);
        this.playerChips.attr({
            x:this.WinSize.width/2,
            y:this.WinSize.height/2
        });
        this.playerChips.setOpacity(0);
        this.playerChips.setRotation(90);
        this.addChild( this.playerChips );
        var delay = cc.delayTime(1);
        var action1 = cc.fadeIn(0.2);
        var callback1 = cc.callFunc(this.playerAdd2,this);
        var action2 = cc.fadeOut(0.2);
        var callback2 = cc.callFunc(this.otherplayerFadeOut,this);
        var sequence = cc.sequence(action1,callback1,delay,action2,callback2);
        this.playerChips.runAction(sequence);
    },

    playerAdd2:function(){
        this.show_xz.setString("0");
        this.my_YD = this.player_num2.FF_My_YD;   //更新我的龙币值
        this.UI_YD = this.player_num2.FF_My_YD;   //更新我的龙币值
        BG_Object._mybean.setString(this.player_num2.FF_My_YD);  //显示最新的龙币值
        BG_Object.scoreLabel2.setString(this.player_num2.FF_Other_YD);    //显示对方最新龙币值
    },

    otherplayerFadeOut:function(){
        this._ready_menu.setVisible(true);
    },


    otherbankerWin:function(){
        //押注图标从闲家移动到庄家
        this.playerChipsTemp  = new cc.Sprite(res.s_lose);
        this.playerChipsTemp.attr({
            x:this.WinSize.width/2,
            y:this.WinSize.height/2
        });
        this.playerChipsTemp.setOpacity(0);
        this.playerChipsTemp.setRotation(90);
        this.addChild( this.playerChipsTemp );
        var delay = cc.delayTime(1);
        var callback1 = cc.callFunc(this.otherbakerFadeOut,this);
        var action1 = cc.fadeIn(0.2);
        var callback2 = cc.callFunc(this.otherbakerFadeOut2,this);
        var action2 = cc.fadeOut(0.2);
        var sequence = cc.sequence(callback1,action1,delay,callback2,action2);
        this.playerChipsTemp.runAction(sequence);
    },

    otherbakerFadeOut:function(){
        this.show_xz.setString("0");
        this.my_YD = this.player_num2.FF_My_YD;   //更新我的龙币值
        this.UI_YD = this.player_num2.FF_My_YD;   //更新我的龙币值
        BG_Object._mybean.setString(this.player_num2.FF_My_YD);  //显示最新的龙币值
        BG_Object.scoreLabel2.setString(this.player_num2.FF_Other_YD);    //显示对方最新龙币值
    },

    otherbakerFadeOut2:function(){
        this._ready_menu.setVisible(true);
    },

    //人机对战时发牌动作
    xt_beginCallback:function(){
        var effect_send = cc.audioEngine.playEffect(res.s_send,false);
        var self=this;
        //异步
        xhr.open("POST", base_url +"&m=main");
        //set Content-type "text/plain;charset=UTF-8" to post plain text
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status >= 200 && xhr.status <= 207) {
                    var response = eval("("+xhr.responseText+")");//接收服务器返回结果
                    self.player_num =response ; //玩家、庄家的牌数赋值给全景变量
                    //cc.log("返回的数据："+self.player_num);
                    if(response.Code == 0){
                        //给闲家发背面牌
                        self.resultAreaHide();
                        self.poker_value  = new cc.Sprite(res.s_bg_poker);
                        self.poker_value.attr({
                            x:self.WinSize.width/2-120,
                            y:165
                        });
                        self.poker_value.setRotation(92);
                        self.addChild( self.poker_value );
                        var action1 = cc.moveTo(0.5,cc.p(185, self.WinSize.height/2));
                        var delay = cc.delayTime(0.3);
                        var callback = cc.callFunc(self.xt_baker_fun,self);
                        var sequence = cc.sequence(action1,callback);
                        self.poker_value.runAction(sequence);
                        self.s_show_downArea.setVisible(true);

                        //玩家翻牌
                        self.scheduleOnce(function(){
                            var p1 = self.player_num.p_1;
                            var p2 = self.player_num.p_2;
                            var player_poker = new cc.Sprite('#'+p1+'_'+p2+'.png');
                            player_poker.attr({
                                x : self.poker_value.width/2,
                                y : self.poker_value.height/2
                            });
                            self.poker_value.addChild(player_poker);
                            self.xt_resultAreaShow();//显示人机对战的“翻牌”按钮
                        },0.5);

                    }else{
                        alert(response.Msg);
                    }
                }else {
                    alert('网络故障，请稍后再试试~');
                }
            }
        };
        var params = "openid="+wx_info.openid+"&gamekey="+wx_info.gamekey+"&bet_num="+this.bet_on_obj.total+"&otherplayeropenid="+OtherPlayerOpenid+"&game_type="+1;
        xhr.send(params);//发送下注信息到服务器
    },

    xt_baker_fun:function(){
        //给庄家发背面牌
        this.poker_value2  = new cc.Sprite(res.s_bg_poker);
        this.poker_value2.attr({
            x:this.WinSize.width/2-120,
            y:165
        });
        this.poker_value2.setScale(0.6,0.6);//设置精灵的缩放比例
        this.poker_value2.setRotation(90);
        this.addChild( this.poker_value2 );
        var action2 = cc.moveTo(0.5,cc.p(400, this.WinSize.height/2));
        var sequence2 = cc.sequence(action2);
        this.poker_value2.runAction(sequence2);
    },

    //人机对战“翻牌”按钮（只有人机对战情况下使用）
    xt_resultAreaShow:function(){
        this.xt_show_downArea = new cc.MenuItemImage(res.s_btn_show,res.s_btn_show,this.xt_showCallBack,this);
        this.xt_show_downArea.attr({
            x:145,
            y:210
        });
        this.xt_show_downArea.setRotation(90);
        this._xt_show_down_menu = new cc.Menu(this.xt_show_downArea);
        this._xt_show_down_menu.x=0;
        this._xt_show_down_menu.y=0;
        this.addChild(this._xt_show_down_menu);
    },

    xt_showCallBack:function(){
        //翻庄家的牌
        var b1 = this.player_num.b_1;
        var b2 = this.player_num.b_2;
        this.baker_poker = new cc.Sprite('#'+b1+'_'+b2+'.png');
        this.baker_poker.attr({
            x :  this.poker_value2.width/2,
            y :  this.poker_value2.height/2
        });
        this.poker_value2.addChild(this.baker_poker);
        //判断谁赢
        if(this.player_num.winner=='baker'){
            var effect_baker_win = cc.audioEngine.playEffect(res.s_baker_win,false);
            this.xt_bankerWin();
        }else{
            var effect_player_win = cc.audioEngine.playEffect(res.s_player_win,false);
            this.xt_playerWin();
        }
        this._xt_show_down_menu.setVisible(false);
    },

    xt_bankerWin:function(){
        //押注图标从闲家移动到庄家
        this.playerChipsTemp  = new cc.Sprite(res.s_lose);
        this.playerChipsTemp.attr({
            x:this.WinSize.width/2,
            y:this.WinSize.height/2
        });
        this.playerChipsTemp.setOpacity(0);
        this.playerChipsTemp.setRotation(90);
        this.addChild( this.playerChipsTemp );
        var callback1 = cc.callFunc(this.xt_bakerFadeOut,this);
        var action1 = cc.fadeIn(0.5);
        var delay = cc.delayTime(1);
        var action2 = cc.fadeOut(0.2);
        var callback2 = cc.callFunc(this.xt_bakerFadeOut2,this);
        var sequence = cc.sequence(callback1,action1,delay,action2,callback2);
        this.playerChipsTemp.runAction(sequence);
    },

    xt_bakerFadeOut:function(){
        this.show_xz.setString("0"); //下注值清空
        this.my_YD = this.player_num.My_YD;   //更新我的龙币值
        this.UI_YD = this.player_num.My_YD;   //更新我的龙币值
        BG_Object._mybean.setString(this.UI_YD);  //显示最新的龙币值
        BG_Object.scoreLabel2.setString(this.player_num.Other_YD);  //显示对方最新的龙币值
    },

    xt_bakerFadeOut2:function(){
        this._ready_menu.setVisible(true);
    },

    xt_playerWin:function(){
        //押注图标从庄家移动到闲家
        this.playerChips  = new cc.Sprite(res.s_win);
        this.playerChips.attr({
            x:this.WinSize.width/2,
            y:this.WinSize.height/2
        });
        this.playerChips.setOpacity(0);
        this.playerChips.setRotation(90);
        this.addChild( this.playerChips );
        //var action1 = cc.scaleTo(1,0.5);
        var callback1 = cc.callFunc(this.xt_playerAdd,this);   //龙币加
        var action1 = cc.fadeIn(0.5);
        var delay = cc.delayTime(1);
        var action2 = cc.fadeOut(0.2);
        var callback2 = cc.callFunc(this.xt_playerFadeOut,this);
        var sequence = cc.sequence(callback1,action1,delay,action2,callback2);
        this.playerChips.runAction(sequence);
    },

    xt_playerAdd:function(){
        this.show_xz.setString("0"); //下注值归零
        this.my_YD = this.player_num.My_YD;   //更新我的龙币值
        this.UI_YD = this.player_num.My_YD;   //更新我的龙币值
        BG_Object._mybean.setString(this.my_YD);  //显示最新的龙币值
        BG_Object.scoreLabel2.setString(this.player_num.Other_YD);  //显示对方最新的龙币值
    },

    xt_playerFadeOut:function(){
        this._ready_menu.setVisible(true);
    }










});


