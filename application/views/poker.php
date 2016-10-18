<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>抢绣球</title>
    <meta name="apple-mobile-web-app-capable" content="yes"/>
    <meta name="full-screen" content="yes"/>
    <meta name="screen-orientation" content="portrait"/>
    <meta name="x5-fullscreen" content="true"/>
    <meta name="360-fullscreen" content="true"/>
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Cache-control" content="no-cache">
    <meta http-equiv="Cache" content="no-cache">
    <style>
        body, canvas, div {
            -moz-user-select: none;
            -webkit-user-select: none;
            -ms-user-select: none;
            -khtml-user-select: none;
            -webkit-tap-highlight-color: rgba(255, 255, 255, 0);
        }
    </style>
</head>
<body style="padding:0; margin: 0; background: #000;">
<script>
    var font_type = "楷体";
    var wx_info = {openid:'<?=$wx_info["Openid"]?>',nickname:'<?=$wx_info["NickName"]?>',imgUrl:'<?=$wx_info["HeadImg"]?>',total_gold:<?=$wx_info["TotalGold"]?>,gamekey:'<?=$wx_info["gamekey"]?>',MusicSet:<?=$wx_info["MusicSet"]?>,EffectsSet:<?=$wx_info["EffectsSet"]?>,first_time:'<?=$wx_info["first_time"]?>',ChannelID:<?=$wx_info["ChannelID"]?>,ActiveID:<?=$wx_info["ActiveID"]?>,RoomID:<?=$wx_info["RoomID"]?>};
    var res_arr = new Array();
    res_arr = <?=$wx_info["GameUI"]?>;
    var base_url = './index.php?c=poker<?=$this->game_sign?>';

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


<script src="res/loading.js"></script>
<canvas id="gameCanvas" width="320" height="480"></canvas>
<script src="http://192.168.1.217:3008/socket.io/socket.io.js"></script>
<!--<script src="frameworks/cocos2d-html5/CCBoot.js"></script>
<script cocos src="main.js"></script>-->
<script src="publish/html5/game.min.js"></script>
<script type="text/javascript">
    var playerType = '';//player1是闲家
    var room_id = 0;
    var socket = io.connect('ws://192.168.1.217:3008');//h5game.gxziyun.com
</script>

</body>
</html>
