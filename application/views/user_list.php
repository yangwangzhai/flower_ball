<?php $this->load->view('admin/header');?>
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

</script>
<div class="col-xs-12 col-md-12">
<div class="widget">
<div class="well with-header wellpadding">
<div class="header bordered-blue">参与用户</div> 
<div>
	<div class="form-inline">
		<span>
			<form action="<?=$this->baseurl?>&m=index" method="post">
				<div class="form-group">
					<span class="input-icon">
						<input type="text" name="keywords" value="" class="form-control input-sm"> 
						<i class="glyphicon glyphicon-search blue"></i>
					</span>
				</div>
				<div class="form-group">
					<input type="submit" name="submit" value=" 搜索 " class="btn btn-blue">
				</div>
			</form>
		</span> 
	    
	</div>    
	<form action="<?=$this->baseurl?>&m=delete" method="post">
		<table width="100%" border="0" cellpadding="3" cellspacing="0" class="table table-hover table-bordered" id="sortTable">
			<tr>
				<th width="30"></th>
				<th width="30">排序</th>
                <th width="60">头像</th>
				<th>昵称</th>
				<th>Openid</th>
				<th>龙币数</th>
				<th>首次参与时间</th>
				<th>最近活动时间</th>
				
				<th width="100">操作</th>

			</tr>

    <?php foreach($list as $key=>$r) {?>
    <tr class="sortTr">
		<td>
				<input type="checkbox" name="delete[]" value="<?=$r['id']?>"class="checkbox" />
			
		</td>

				<td><?=$key+1 ?></td>
                <td class="td_c"><img src="<?=$r['HeadImg']?>" width="50" height="50" /></td>
                <td class="td_c"><?=$r['NickName']?></td>
                <td class="td_c"><?=$r['Openid']?></td>
                <td class="td_c"><?=$r['TotalGold']?></td>
                
                <td class="td_c" title="<?=date('Y-m-d H:i:s',$r['AddTime'])?>"><?=timeFromNow($r['AddTime'])?></td>
                <td class="td_c" title="<?=date('Y-m-d H:i:s',$r['UpdateTime'])?>"><?=timeFromNow($r['UpdateTime'])?></td>
				<td class="td_c">
				<!-- <span class="btn btn-success btn-xs icon-only white">
				                <a href="javascript:;" onclick="addBlackList(<?=$r['ActiveID']?>,'<?=$r['Openid']?>','<?=$r['NickName']?>');"><i class="fa fa-ban" title="加入黑名单"></i></a></span>
				                &nbsp;&nbsp; -->
                <span class="btn btn-danger btn-xs icon-only white">
                <a href="<?=$this->baseurl?>&m=delete&id=<?=$r['id']?>" onclick="return confirm('确定要删除吗？');"><i class="fa fa-trash" title="删除"></i></a></span>
                
                </td>
			</tr>
    <?php }?>
			<tr>
				<td colspan="9"><input type="checkbox" name="chkall" id="chkall"onclick="checkall('delete[]')" class="checkbox" /><label for="chkall">全选/反选</label>&nbsp; <input type="submit" value=" 删除 "class="btn" onclick="return confirm('确定要删除吗？');" /> &nbsp;</td>
			</tr>
		</table>

		<div class="margintop">共：<?=$count?>条&nbsp;&nbsp;<?=$pages?></div>

	</form>

</div>
</div>
</div>
</div>


<?php $this->load->view('admin/footer');?>