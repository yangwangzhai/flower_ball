<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>登录 - 后台管理系统</title>
    <link href="static/system/assets/css/bootstrap.min.css" rel="stylesheet" />
    <link href="static/system/assets/css/font-awesome.min.css" rel="stylesheet" />
    <link id="beyond-link" href="static/system/assets/css/beyond.min.css" rel="stylesheet" />
    <link rel="stylesheet" href="static/system/admin_img/admincp.css" type="text/css" media="all" />
    <link rel="stylesheet" href="static/system/js/kindeditor410/themes/default/default.css" />
    <link rel="stylesheet" type="text/css"	href="static/system/css/font-awesome.min.css" />
    <link rel="stylesheet" type="text/css"	href="static/system/css/font-awesome-ie7.min.css" />
    <script type="text/javascript" src="static/system/js/jquery-1.7.1.min.js"></script>
    <script charset="utf-8" src="static/system/js/kindeditor410/kindeditor.js?aa"></script>
    <script type="text/javascript" src="static/system/js/lhgdialog/lhgdialog.min.js?skin=idialog"></script>
    <script charset="utf-8" src="static/system/js/kindeditor410/lang/zh_CN.js"></script>
    <script type="text/javascript" src="static/system/js/common.js?23974928734"></script>
    <meta content="tangjianft@qq.com" name="Copyright" />
</head>
<body>

<style>
    .maintable {
        -moz-border-bottom-colors: none;
        -moz-border-left-colors: none;
        -moz-border-right-colors: none;
        -moz-border-top-colors: none;
        border-collapse: collapse;
        border-color: #86b9d6 #d8dde5 #d8dde5;
        border-image: none;
        border-style: solid;
        border-width: 2px 1px 1px;
        width: 100%;
    }
    .maintable th, .maintable td {
        border: 1px solid #d8dde5;
        padding: 5px;
    }
    .maintable th {
        background: #f3f7ff none repeat scroll 0 0;
        color: #0d58a5;
        font-weight: normal;
        text-align: left;
        width: 210px;
    }
    .maintable td th, .maintable td td {
        border: medium none;
        padding: 1px;
    }
    .maintable th p {
        color: #909dc6;
        margin: 0;
    }
    .input {
        cursor: pointer;
        font-size: 16px;
        height: 25px;
        width: 200px;
    }
    .input2 {
        cursor: pointer;
        font-size: 14px;
        height: 22px;
        width: auto;
    }
    .table_list td:hover {
        background: #f2f9fd none repeat scroll 0 0;
    }
</style>
<div class="mainbox nomargin" style="margin:10px 0px 0px 10px;">
    <form action="index.php?d=flower_ball&c=rate_set&ActiveID=20&ChannelID=1&RoomID=8&m=save" method="post">
        <input type="hidden" name="id" value="1">
        <table class="maintable">

            <tr>
                <td><b>1.设置闲对的概率</b></td>
            </tr>
            <tr>
                <td>起始量<input name="value[coin1_start]" style="width:50px;" id="coin1_start_1" type="text" onchange="add_sum('1')" class="txt " value="60"/>%
                    （下注龙币为5时，系统赢的概率）
                </td>
            </tr>
            <tr>
                <td>增涨量<input name="value[coin1_add]" style="width:50px;" id="coin1_add_1" type="text" onchange="add_sum('1')" class="txt " value="8"/>%
                    （每增加5个比倍龙币，系统赢的概率）
                </td>
            <tr>
                <td><b id="sum1" style="color:#F00"></b></td>
            </tr>

            <tr>
                <td><input type="submit" name="submit" value=" 提 交 " class="btn"
                           tabindex="3" /></td>
            </tr>
        </table>
    </form>
</div>

<!-- power by tangjian  -->
</div>
<p style="height: 60px;"></p>
</body>
</html>

