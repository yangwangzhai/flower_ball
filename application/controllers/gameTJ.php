<?php

if (! defined('BASEPATH'))
    exit('No direct script access allowed');
    
    // 管理员  控制器 by tangjian 

include 'application/controllers/admin/content.php';

class gameTJ extends Content
{
    function __construct ()
    {    
        parent::__construct();

        $this->ChannelID = intval($_GET['ChannelID']);
        $this->ActiveID = intval($_GET['ActiveID']);
        $this->RoomID = intval($_GET['RoomID']);
            
        $this->control = 'gameTJ';
        $this->baseurl = 'index.php?d=flower_ball&c=gameTJ&ActiveID='.$this->ActiveID.'&ChannelID='.$this->ChannelID.'&RoomID='.$this->RoomID;
        $this->table = 'zy_fb_bet_on';
        $this->list_view = 'flower_ball/gameTJ_list';
    }

    public function index(){

        $this->game_sign_sql = "  ActiveID=$this->ActiveID AND ChannelID=$this->ChannelID AND RoomID=$this->RoomID";
        
        $searchsql = ' '. $this->game_sign_sql; 
        // 是否是查询
        
        $config['base_url'] = $this->baseurl . "&m=index";
        

        if($_GET['day'] == 'today' || !$_GET['day']){
            //默认显示今天的统计
            $startTime = strtotime(date('Y-m-d 0:0:0'));
            $endTime = strtotime(date('Y-m-d 23:59:59'));
        }else if($_GET['day'] == 'yesterday'){
            $startTime = strtotime(date('Y-m-d 0:0:0',time()-86400));
            $endTime = strtotime(date('Y-m-d 23:59:59',time()-86400));
            
        }
        //echo date('Y-m-d H:i:s',$startTime),'<br/>';
        //echo date('Y-m-d H:i:s',$endTime),'<br/>';  

        if($_GET['starttime'] && $_GET['endtime']){
            $startTime = strtotime($_GET['starttime']);
            $endTime = strtotime($_GET['endtime']);
            $config['base_url'] .= "&starttime=".date("Y-m-d H:i:s",$startTime)."&endtime=".date("Y-m-d H:i:s",$endTime);
        }

        //echo $startTime,'<br/>';
        //echo $endTime,'<br/>';

        $data['startTime'] = $startTime;
        $data['endTime'] = $endTime;

        

        
        /*if($_GET['starttime'] && $_GET['endtime']){
            $startTime = strtotime($_GET['starttime']);
            $endTime = strtotime($_GET['endtime']);            
        }else{
            $startTime = strtotime(date('2016-07-20 0:0:0'));
            $endTime = strtotime(date('Y-m-d 23:59:59'));   
        }*/
        
        $data['Stime'] =  $startTime;
        $data['Etime'] =  $endTime;
        
        //系统赢得
        $win_sql = "SELECT sum(Result) as total  FROM `zy_fb_bet_on` where Status = 1 and Result < 0 and $searchsql";
        $query = $this->db->query($win_sql);
        $win_row = $query->row_array();
        $data['win_total'] = '+' . abs($win_row['total']);
        //系统输
        $lost_sql = "SELECT sum(Result) as total  FROM `zy_fb_bet_on` where Status = 1 and Result > 0 and $searchsql";
        $query = $this->db->query($lost_sql);
        $lost_row = $query->row_array();
        $data['lost_total'] = -$lost_row['total'];
        
        //今日系统赢得
        $win_sql = "SELECT sum(Result) as total  FROM `zy_fb_bet_on` where Status = 1 and Result < 0 and AddTime > ".$startTime." and AddTime < ".$endTime." and $searchsql";
        $query = $this->db->query($win_sql);
        $win_row = $query->row_array();
        $data['win_today_total'] = '+' . abs($win_row['total']);
        //今日系统输
        $lost_sql = "SELECT sum(Result) as total  FROM `zy_fb_bet_on` where Status = 1 and Result > 0 and AddTime > ".$startTime." and AddTime < $endTime and $searchsql";
        $query = $this->db->query($lost_sql);
        $lost_row = $query->row_array();
        $data['lost_today_total'] = -$lost_row['total'];

        //总访问量
        $view_sql = "SELECT count(*) as total  FROM `zy_game_log` where ActiveID = $this->ActiveID";
        $query = $this->db->query($view_sql);
        $view_row = $query->row_array();
        $data['view_total'] = $view_row['total'];

        //当前时段访问量
        $curr_view_sql = "SELECT count(*) as total  FROM `zy_game_log` where ActiveID = $this->ActiveID and AddTime > ".$startTime." and AddTime < $endTime";
        $query = $this->db->query($curr_view_sql);
        $curr_view_row = $query->row_array();
        $data['curr_view_total'] = $curr_view_row['total'];

        //玩家总数
        $player_num_sql = "SELECT count(*) as total FROM `zy_fb_player` where $searchsql";
        $query = $this->db->query($player_num_sql);
        $player_row = $query->row_array();
        $data['player_total'] = $player_row['total'];

        //新增玩家数
        $player_add_sql = "SELECT count(*) as total FROM `zy_fb_player` where $searchsql and AddTime > ".$startTime." and AddTime < $endTime";
        $query = $this->db->query($player_add_sql);
        $player_add_row = $query->row_array();
        $data['player_add_total'] = $player_add_row['total'];

        //当前活跃家数
        $active_player_sql = "SELECT count(distinct Openid) as total FROM `zy_game_log` where ActiveID = $this->ActiveID and AddTime > ".$startTime." and AddTime < $endTime";
        $query = $this->db->query($active_player_sql);
        $active_player_row = $query->row_array();
        $data['active_player_total'] = $active_player_row['total'];
        

        $_SESSION['url_forward'] =  $config['base_url']. "&per_page=$offset";
        $this->load->view($this->list_view, $data);
    }

    
}
