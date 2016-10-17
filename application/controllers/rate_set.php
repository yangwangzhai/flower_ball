<?php

if (! defined('BASEPATH'))
    exit('No direct script access allowed');

// 管理员  控制器 by tangjian

include 'application/controllers/admin/content.php';

class rate_set extends Content
{
    function __construct ()
    {
        parent::__construct();
        $this->ChannelID = intval($_GET['ChannelID']);
        $this->ActiveID = intval($_GET['ActiveID']);
        $this->RoomID = intval($_GET['RoomID']);
        $this->control = 'rate_set';
        $this->baseurl = 'index.php?d=flower_ball&c=rate_set&ActiveID='.$this->ActiveID.'&ChannelID='.$this->ChannelID.'&RoomID='.$this->RoomID;
        $this->table = 'zy_fb_rate';
        $this->list_view = 'rate_set_list';
    }

    public function index(){
        $data = '';
        $this->load->view($this->list_view, $data);
    }

    public function delete(){
        $id = $_GET['id'];
        if ($id) {
            $this->db->query("delete from $this->table where id=$id");
        } else {
            $ids = implode(",", $_POST['delete']);
            $this->db->query("delete from $this->table where id in ($ids)");
        }
        show_msg('删除成功！', $_SESSION['url_forward']);
    }

}
