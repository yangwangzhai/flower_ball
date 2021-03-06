/****************************************************************************
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2014 Chukong Technologies Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/
/**
 * <p>cc.LoaderScene is a scene that you can load it when you loading files</p>
 * <p>cc.LoaderScene can present thedownload progress </p>
 * @class
 * @extends cc.Scene
 * @example
 * var lc = new cc.LoaderScene();
 */
cc.LoaderScene = cc.Scene.extend({
    _interval : null,
    _label : null,
    _className:"LoaderScene",
    cb: null,
    target: null,
    /**
     * Contructor of cc.LoaderScene
     * @returns {boolean}
     */
    init : function(){
        var self = this;
        var size = this.sizes = cc.winSize;
        //logo
        var logoWidth = 160;
        var logoHeight = 200;

        // bg
        var fontSize = 24, lblHeight =  -logoHeight / 2 + 100;
        var bgLayer = self._bgLayer = new cc.Sprite(res.S_lg); //new cc.LayerColor(cc.color(32, 32, 32, 255));
        bgLayer.setPosition(cc.visibleRect.bottom.x, cc.visibleRect.right.y);
        // bgLayer.setScale(0.65);
        // bgLayer.setRotation(90);
        //bgLayer.setScale(0.5);
        //bgLayer.setRotation(90);
        self.addChild(bgLayer, 0);



        /*  var bgLayer = self._bgLayer = new cc.LayerColor(cc.color(32, 32, 32, 255));
         self.addChild(bgLayer, 0);

         //image move to CCSceneFile.js

         if(cc._loaderImage){
         //loading logo
         cc.loader.loadImg(cc._loaderImage, {isCrossOrigin : false }, function(err, img){
         logoWidth = img.width;
         logoHeight = img.height;
         self._initStage(img, cc.visibleRect.center);
         });
         fontSize = 14;
         lblHeight = -logoHeight / 2 - 10;
         }*/

        this.LoadingBarBackgrounp  = new cc.Sprite(res.s_jin_du1);
        this.LoadingBarBackgrounp.setPosition(cc.pAdd(cc.visibleRect.center, cc.p(-16, cc.visibleRect.center.y-575)));
        this.LoadingBarBackgrounp.setRotation(90);
        this.addChild(this.LoadingBarBackgrounp,11);
        //进度条：
        this.loadingBar = new ccui.LoadingBar();
        this.loadingBar.setName("LoadingBar");
        this.loadingBar.loadTexture(res.s_jin_du);
        this.loadingBar.setRotation(90);
        this.loadingBar.setDirection(ccui.LoadingBar.TYPE_LEFT);
        //  this.loadingBar.scale = 1.1;
        this.loadingBar.setPercent(0);
        this.loadingBar.setPosition(cc.pAdd(cc.visibleRect.center, cc.p(-18, cc.visibleRect.center.y-575)));//-18  -153
        this.addChild(this.loadingBar,20);


        //loading percent
        var label = self._label = new cc.LabelTTF("正在加载游戏资源...... 0%", "Arial", fontSize);
        label.setPosition(size.width/2 , size.height/2 );
        label.setColor(cc.color(255, 255, 255));
        label.setRotation(90);
        //bgLayer.addChild(this._label, 10);
        return true;
    },

    _initStage: function (img, centerPos) {
        var self = this;
        var texture2d = self._texture2d = new cc.Texture2D();
        texture2d.initWithElement(img);
        texture2d.handleLoadedTexture();
        var logo = self._logo = new cc.Sprite(texture2d);
        logo.setScale(cc.contentScaleFactor());
        logo.x = centerPos.x;
        logo.y = centerPos.y;
        self._bgLayer.addChild(logo, 10);
    },
    /**
     * custom onEnter
     */
    onEnter: function () {
        var self = this;
        cc.Node.prototype.onEnter.call(self);
        self.schedule(self._startLoading, 0.3);
    },
    /**
     * custom onExit
     */
    onExit: function () {
        cc.Node.prototype.onExit.call(this);
        var tmpStr = "Loading... 0%";
        this._label.setString(tmpStr);
    },

    /**
     * init with resources
     * @param {Array} resources
     * @param {Function|String} cb
     * @param {Object} target
     */
    initWithResources: function (resources, cb, target) {
        if(cc.isString(resources))
            resources = [resources];
        this.resources = resources || [];
        this.cb = cb;
        this.target = target;
    },

    _startLoading: function () {
        var self = this;
        self.unschedule(self._startLoading);
        //self.schedule(self._startLoading,1);
        var res = self.resources;
        cc.loader.load(res,
            function (result, count, loadedCount) {
                var percent = (loadedCount / count * 100) | 0;
                percent = Math.min(percent, 100);
                self._label.setString("Loading... " + percent + "%");
                //更改进度条的进度：
                self.loadingBar.setPercent(percent);
            }, function () {
                if (self.cb)
                    self.cb.call(self.target);
            });
    }
});
/**
 * <p>cc.LoaderScene.preload can present a loaderScene with download progress.</p>
 * <p>when all the resource are downloaded it will invoke call function</p>
 * @param resources
 * @param cb
 * @param target
 * @returns {cc.LoaderScene|*}
 * @example
 * //Example
 * cc.LoaderScene.preload(g_resources, function () {
        cc.director.runScene(new HelloWorldScene());
    }, this);
 */
cc.LoaderScene.preload = function(resources, cb, target){
    var _cc = cc;
    if(!_cc.loaderScene) {
        _cc.loaderScene = new cc.LoaderScene();
        _cc.loaderScene.init();
    }
    _cc.loaderScene.initWithResources(resources, cb, target);

    cc.director.runScene(_cc.loaderScene);
    return _cc.loaderScene;
};