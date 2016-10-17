<?php $this->load->view('admin/header');?>
<script src="static/system/js/date/WdatePicker.js"></script>
<script type="text/javascript">
$(function($)
{
	// 数据列表 点击开始排序
	var sortFlag = 0;	
	$("#sortTable th").click(function()
	{		
		var tdIndex = $(this).index();		
		var temp = "";
		var trContent = new Array();
		//alert($(this).text());	
		
		// 把要排序的字符放到行的最前面，方便排序
		$("#sortTable .sortTr").each(function(i){ 
			temp = "##" + $(this).find("td").eq(tdIndex).text() + "##";			
			trContent[i] = temp + '<tr class="sortTr">' + $(this).html() + "</tr>";	
				
		});
		
		// 排序
		if(sortFlag==0) {
			trContent.sort(sortNumber);
			sortFlag = 1;
		} else {
			trContent.sort(sortNumber);
			trContent.reverse();
			sortFlag = 0;
		}
		
		// 删除原来的html 添加排序后的
		$("#sortTable .sortTr").remove();
		$("#sortTable tr").first().after( trContent.join("").replace(/##(.*?)##/, "") );		
	});
	
});

function selectTime(){
  var starttime = $('#starttime').val();
  var endtime = $('#endtime').val();
  if(starttime == '' || endtime == ''){
    alert('请选择一个时间段');
    return false;
  }
  location.href="<?=$this->baseurl?>&m=index&starttime="+starttime+'&endtime='+endtime;
}


</script>
<style>
.tab_btn {
	width: 100px;
	height: 30px;
	margin-right: 10px;
	border-radius: 5px;
	border-color: #eee;
	background-color: #F2F9FD;
	font-weight: bold;
}
.tab_btn_selected {
	width: 100px;
	height: 30px;
	margin-right: 10px;
	border-radius: 5px;
	border-color: #eee;
	background-color: #e2e9eD;
	font-weight: bold;
}
.datalist2 {
  margin-top: 10px;
  border-bottom: 2px solid #b5cfd9;
  border-top: 2px solid #b5cfd9;
  clear: both;
  width: 100%;
}
.datalist2 th {
  border-bottom: 1px dashed #ccc;
  color: #9ebecb;
  font-size: 12px;
  height: 25px;
  line-height: 20px;
  padding: 5px;
  text-align: left;
  word-break: break-all;
}
.datalist2 tr:hover {
	background: #F2F9FD
}

.datalist2 td {
	padding: 10px 3px;
	background: url(./static/system/admin_img/bg_repd.gif) repeat-x 0 bottom;
	height: 25px; word-break:break-all;
}

</style>
<div class="col-xs-12 col-md-12">
<div class="widget">
<div class="well with-header wellpadding">
<div class="header bordered-blue">游戏统计</div> 
<div>
	
	<input class="<?=($_GET['day']=='today' || !$_GET['day'])?'tab_btn_selected':'tab_btn'?>" type="button" onclick="location.href='<?=$this->baseurl?>&m=index&day=today'" value=" 今天 ">
  	<input class="<?=($_GET['day']=='yesterday')?'tab_btn_selected':'tab_btn'?>" type="button" onclick="location.href='<?=$this->baseurl?>&m=index&day=yesterday'" value=" 昨天 ">
  	
  	<input type="input" class="px" id="starttime" value="<?=date('Y-m-d H:i:s',$startTime)?>" onClick="WdatePicker({dateFmt:'yyyy-MM-dd HH:mm:ss'})" name="starttime">
  	到
  	<input type="input" class="px" id="endtime" value="<?=date('Y-m-d H:i:s',$endTime)?>" onClick="WdatePicker({dateFmt:'yyyy-MM-dd HH:mm:ss'})" name="endtime">
  	
  	<input type="button" onclick="selectTime()" value=" 查询 " class="btn">
	<p style="color:#F00; margin:10px 0; display:none;">
	    <?=date('Y-m-d H:i:s',$startTime)?>
	    到
	    <?=date('Y-m-d H:i:s',$endTime)?>
	    ,总共赢进龙币：
	    <?=$win_total?>
	    , 总共支出龙币：
	    <?=$lost_total?>
	    , 赢进+支出=
	    <?=$win_total+$lost_total?>
	</p>
	<table width="100%" border="0" cellpadding="3" cellspacing="0" class="datalist2">

		<tr>
		  	<td width="90">日期区间： </td>
			<td colspan="2"><?=date('Y-m-d H:i:s',$startTime)?>
			到
			<?=date('Y-m-d H:i:s',$endTime)?></td>
		</tr>
		<tr>
		    <td>系统总赢龙币：</td>
		    <td style="color:#090;" width="120"><?=$win_total?>  </td>
		    <td style="color:#090;">当前时段：<?=$win_today_total?></td>  
		</tr>
		<tr>
		    <td>系统总输龙币：</td>
		    <td style=" color:#00F"><?=$lost_total?>  </td>
		    <td style=" color:#00F">当前时段：<?=$lost_today_total?></td>
		</tr>
		<tr> 
		    <td>系统实际收支：</td>
		    <td style=" color: #F00"><?=$win_total+$lost_total > 0 ? '+'.($win_total+$lost_total) : $win_total+$lost_total?>  </td>
		    <td style=" color: #F00">当前时段：<?=$win_today_total+$lost_today_total > 0 ? '+'.($win_today_total+$lost_today_total) : $win_today_total+$lost_today_total?></td>
		</tr>
		<tr> 
		    <td>总访问量：</td>
		    <td style=" color: #F00"><?=$view_total?>  </td>
		    <td style=" color: #F00">当前时段：<?=$curr_view_total?></td>
		</tr>
		<tr> 
		    <td>总玩家数量：</td>
		    <td style=" color: #F00"><?=$player_total?>  </td>
		    <td style=" color: #F00">新增：<?=$player_add_total?></td>
		</tr>
		<tr> 
		    <td>活跃玩家数量：</td>
		    <td style=" color: #F00"><?=$active_player_total?>  </td>
		    <td></td>
		</tr>
	</table>

</div>
</div>
</div>
</div>


<?php $this->load->view('admin/footer');?>