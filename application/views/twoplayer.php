<!DOCTYPE HTML>
<html>
    <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <title>百家乐</title>
    <meta name="viewport"
        content="width=device-width,user-scalable=no,initial-scale=1, minimum-scale=1,maximum-scale=1,target-densitydpi=device-dpi"/>

    <!--https://developer.apple.com/library/safari/documentation/AppleApplications/Reference/SafariHTMLRef/Articles/MetaTags.html-->
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="format-detection" content="telephone=no">

    <!-- force webkit on 360 -->
    <meta name="renderer" content="webkit"/>
    <meta name="force-rendering" content="webkit"/>
    <!-- force edge on IE -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
    <meta name="msapplication-tap-highlight" content="no">

    <!-- force full screen on some browser -->
    <meta name="full-screen" content="yes"/>
    <meta name="x5-fullscreen" content="true"/>
    <meta name="360-fullscreen" content="true"/>

    <!-- force screen orientation on some browser -->
    <!-- <meta name="screen-orientation" content="portrait"/>
    <meta name="x5-orientation" content="portrait"> -->

    <meta name="browsermode" content="application">
    <meta name="x5-page-mode" content="app">
    <style>
body, canvas, div {
	-moz-user-select: none;
	-webkit-user-select: none;
	-ms-user-select: none;
	-khtml-user-select: none;
	-webkit-tap-highlight-color: rgba(0, 0, 0, 0);
	
   
}
body, canvas, div {
  margin: 0;
  padding: 0;
  outline: none;
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  -khtml-user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
}
 body{ background:url('static/gameroom/baccarat/res/loading_bg.png') no-repeat center center;
	 background-attachment:fixed;
	/* background-repeat:no-repeat;*/
	 background-size:cover;
	 -moz-background-size:cover;
	 -webkit-background-size:cover;
   
}
 .bodycss{ background:url('static/gameroom/baccarat/res/loading_bg.png') no-repeat center center;
	 background-attachment:fixed;
	/* background-repeat:no-repeat;*/
	 background-size:cover;
	 -moz-background-size:cover;
	 -webkit-background-size:cover;
   
}
</style>
    </head>

    <body>
  
<script src="res/loading.js"></script>
<canvas id="gameCanvas" width="320" height="480"></canvas>
<script src="http://static.gxtianhai.cn/racedog/static/js/jquery-1.7.1.min.js"></script>
<script src="http://res.wx.qq.com/open/js/jweixin-1.0.0.js"></script>

<script>
 var font_type = "楷体";
 var wx_info = {
     openid:'<?=$openid?>',
     nickname:'<?=$nickname?>',
     headimgurl:'<?=$headimgurl?>',
     total_gold:<?=$smokeBeansCount?>,    
     allowMusic:<?=$allowMusic?>,
     first_time:'<?=$first_time?>'
 };
// var resources = <?=$GameUI?>;
 
 var base_url = './index.php?c=twoplayer<?=$this->game_sign?>';
    (function () {
        var nav = window.navigator;
        var ua = nav.userAgent.toLowerCase();
        var uaResult = /android (\d+(?:\.\d+)+)/i.exec(ua) || /android (\d+(?:\.\d+)+)/i.exec(nav.platform);
        if (uaResult) {
            var osVersion = parseInt(uaResult[1]) || 0;
            var browserCheck = ua.match(/(qzone|micromessenger|qqbrowser)/i);
            if (browserCheck) {
                var gameCanvas = document.getElementById("gameCanvas");
                var ctx = gameCanvas.getContext('2d');
                ctx.fillStyle = '#000000';
                ctx.fillRect(0, 0, 1, 1);
            }
        }
    })();
	

</script>
<script src="http://192.168.1.217:3008/socket.io/socket.io.js"></script>
<script src="frameworks/cocos2d-html5/CCBoot.js"></script>
<script cocos src="main.js"></script>
</body>

<script type="text/javascript">
var playerType = '';//player1是闲家
var room_id = 0;
var socket = io.connect('ws://192.168.1.217:3008');//h5game.gxziyun.com
</script>




</html>