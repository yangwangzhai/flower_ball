<?php if (!defined('BASEPATH')) exit('No direct script access allowed');

class twoplayer extends CI_Controller
{
    private $nodekey = 'wx263e9fc25c21324f';
    private $openid = '';

    public $ActiveID = 0;
    public $ChannelID = 0;
    public $RoomID = 0;

    function __construct()
    {
        parent::__construct();
        $this->ActiveID = $this->input->get('ActiveID') ? $this->input->get('ActiveID') : $this->input->get('AID');
        $this->ChannelID = $this->input->get('ChannelID') ? $this->input->get('ChannelID') : $this->input->get('CID');
        $this->RoomID = $this->input->get('RoomID') ? $this->input->get('RoomID') : $this->input->get('RID');

        $this->ActiveID = intval($this->ActiveID);
        $this->ChannelID = intval($this->ChannelID);
        $this->RoomID = intval($this->RoomID);

        if ($this->ActiveID && !$this->ChannelID) {
            $this->content_model->set_table('zy_active_main');
            $row = $this->content_model->get_one($this->ActiveID, 'ActiveID');
            $this->ChannelID = $row['ChannelID'];
            $this->RoomID = $row['RoomID'];
        }
        $this->game_sign = "&AID=$this->ActiveID&CID=$this->ChannelID&RID=$this->RoomID";
        $this->game_sign_sql = addslashes("  ActiveID=$this->ActiveID AND ChannelID=$this->ChannelID AND RoomID=$this->RoomID");
       // $this->load->model('my_common_model', 'common');
       // $this->load->model('lb_model');


    }


    public function index()
    {

        if (isset($_GET['test'])) {
            $session_id = session_id();			
            $phone_os = $_SERVER['HTTP_USER_AGENT'];//访问设备的信息
            //头像地址
            $headurl = "http://wx.qlogo.cn/mmopen/GQfdS1CPWRJWI6Xu0Rn6mUqL3tICLeRiazbwFtr6pC3E5wxM5hM4Efw2CSo17Ow6ibPVns0otmphxY62BibVuBP4Y3743NEFkVO/0";
            if($_GET['test'] == 'a') $headurl = "http://wx.qlogo.cn/mmopen/tcWRs88LVHOiaaeqia4PVvwuBJxibfwRsAguPAl5icP2YlLiagYsXCnDCxXpBXRedziajFpFHpUoVsyoPbTaeIIVTPmYCP8icCFTRZJ/0";
			if($_GET['test'] == 'c') $headurl = "http://wx.qlogo.cn/mmopen/6Bvb7VtQHsJqLAqm4piazQjHumTWIcl7m4NreGASnyyStUIDYpD41VZ4PwDMCbVRJibWKNML6HKbBU4ibk6ZTqfIJs2bHs2ZuWp/0";
			if($_GET['test'] == 'd') $headurl = "http://wx.qlogo.cn/mmopen/ic1mIRHfNOKbdeoGhiahsbtb9Lp2xFBEQxRQU1Cmd6GiabBlYhIInOLzOUmoW5IUHXA2Rskoydgick3C1MfvVDa3AA/0";
			
			$wx_info = array('openid' => 'abc-'.$_GET['test'], 'nickname' => '昵称'.$_GET['test'], 'headimgurl' => $headurl, 'sex' => 1);
            $filename = 'static/wxheadimg/' . $wx_info['openid'] . '.jpg';
            //  $img_local_url = $this->getImg($wx_info['headimgurl'], $filename);
            //   $headPhoto = base_url() . $img_local_url;

            $data['first_time'] = 'no';
            $data['openid'] = $wx_info['openid'];
            $data['nickname'] = $wx_info['nickname'];
            // $data['headimgurl'] = $headPhoto;//$wx_info['headimgurl'];
            $this->openid = $data['openid'];
            //查询数据库是否存在此人
            $isexit = $this->db->query("select count(*) as num,nickname,head_img, local_img, score,allowMusic  from zy_baccarat_player where openID='" . $data['openid'] . "' AND $this->game_sign_sql ")->row_array();

            if ($isexit['num'] > 0) {
                if (!file_exists($filename) || $isexit['head_img'] != $headurl) {
                    $img_local_url =getImg($headurl, $filename);
                    $headLocalPhoto = base_url() . $img_local_url;
                    $data['headimgurl'] = $headLocalPhoto;
                } else {
                    $data['headimgurl'] = $isexit['local_img'] ? $isexit['local_img'] : base_url() . $filename;
                }
                $update_nickname = "";
                if ($isexit['nickname'] != $data['nickname']) $update_nickname = "  nickname='" . $data['nickname'] . "' , ";
                //total_gold =".$data['smokeBeansCount']."  ,
                $this->db->query("update zy_baccarat_player set {$update_nickname}  lasttime= " . time() . " ,head_img = '" . $headurl . "' ,session_id = '" . $session_id . "',phone_os = '" . $phone_os . "' ,local_img = '" . base_url() . $filename . "' where openID= '" . $data['openid'] . "' AND $this->game_sign_sql");//更新烟豆
                $data['smokeBeansCount'] = $isexit['score'];
                $data['allowMusic'] = $isexit['allowMusic'];
                //$data['headimgurl'] = 'woM0Mxs3oVcGxDn9vdeEKnL3HpdSo.jpg';
            } else {
                $img_local_url = getImg($headurl, $filename);
                $headLocalPhoto = base_url() . $img_local_url;

                $data['headimgurl'] = $headLocalPhoto;

                $user_data['openID'] = $data['openid'];
                $user_data['nickname'] = $data['nickname'];
                $user_data['head_img'] = $headurl;
                $user_data['local_img'] = $headLocalPhoto;
                $user_data['sex'] = 0;
                $user_data['addtime'] = time();
                $user_data['lasttime'] = time();
                $user_data['score'] = 10000;
                $user_data['session_id'] = $session_id;
                $user_data['phone_os'] = $phone_os;
                $user_data['ActiveID'] = $this->ActiveID;
                $user_data['ChannelID'] = $this->ChannelID;
                $user_data['RoomID'] = $this->RoomID;

                $insert_sql = $this->db->insert_string('zy_baccarat_player', $user_data);
                $insert_sql = str_replace('INSERT', 'INSERT ignore ', $insert_sql);
                $this->db->query($insert_sql);
                $data['smokeBeansCount'] = $user_data['score'];
                $data['last_result_gold'] = 0;
                $data['last_game_id'] = 0;
                $data['allowMusic'] = 1;
                $data['first_time'] = 'yes';
            }


        } else {
            $this->ActiveID = $this->input->get('ActiveID') ? $this->input->get('ActiveID') : $this->input->get('AID');
            $this->ChannelID = $this->input->get('ChannelID') ? $this->input->get('ChannelID') : $this->input->get('CID');
            $this->RoomID = $this->input->get('RoomID') ? $this->input->get('RoomID') : $this->input->get('RID');
            $game_sign = "&AID=$this->ActiveID&CID=$this->ChannelID&RID=$this->RoomID";
            $this->game_sign = $game_sign;
            $state_base64 = base64_encode('http://h5game.gxtianhai.cn/mntvdb/gamecenter/index.php?d=fruit&c=fruit&m=getUserInfo&ActiveID=' . $this->ActiveID);
            header('Location: https://open.weixin.qq.com/connect/oauth2/authorize?appid=' . $this->url_appid . '&redirect_uri=http://' . $this->yrurl . '/thirdInterface/thirdInterface!autoLogin2.action&response_type=code&scope=snsapi_base&state=' . $state_base64 . '#wechat_redirect');
            exit;
            /*   $ActiveID = $this->input->get('ActiveID');
               $ChannelID = $this->input->get('ChannelID');
               $RoomID = $this->input->get('RoomID');

               //判断活动、游戏状态
               $isRun = $this->common->get_active_game_status($ActiveID,$RoomID);
               if(!$isRun['status']) {
                   $data['msg'] = $isRun['msg'];
                   $this->load->view('tip', $data);
                   return;
               }

               if($ActiveID && $ChannelID && $RoomID){
                   $state_base64 = base64_encode('http://h5game.gxtianhai.cn/fruit/index.php?c=fruit&m=getUserInfo&CID='.$ChannelID.'&AID='.$ActiveID.'&RID='.$RoomID);
                   $this->load->model('ChannelApi_model');
                   $apiUrl = $this->ChannelApi_model->getApi($ChannelID,'GetUserInfo');
                   $temp = sprintf($apiUrl,$state_base64);
                   if(empty($temp)) show_msg('渠道接口获取失败ChannelID：'.$ChannelID.'！');
                   header("Location: ".$temp);

                   return;
               }else{
                   show_msg('非法访问！');
                   exit;
               }*/
        }
        //添加游戏访问量
        //$this->common->add_game_VistNum($this->RoomID, $this->ChannelID, $this->ActiveID, trim($this->openid));
        //$this->common->add_game_user($this->RoomID, $this->ChannelID, $this->ActiveID, trim($this->openid), $data['nickname'], $data['smokeBeansCount']);
        echo "<pre>";
        print_r($data);
        echo "<pre/>";
        exit;
        $this->load->view('twoplayer', $data);
    }
	
	private function createNonceStr($length = 16) {
	    $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	    $str = "";
	    for ($i = 0; $i < $length; $i++) {
	        $str .= substr($chars, mt_rand(0, strlen($chars) - 1), 1);
	    }
	    return $str;
	}
	

    function getUserInfo()
    {
       // $this->check_game_rule('');
        $session_id = session_id();
        $phone_os = addslashes($_SERVER['HTTP_USER_AGENT']);
        $openid = addslashes($_REQUEST['openid']);
        $nickname = addslashes($_REQUEST['nickName']);
        $headPhoto = addslashes($_REQUEST['headPhoto']);
        $data = array();
        if (strpos($phone_os, 'MicroMessenger') === false) {
            // 非微信浏览器禁止浏览
            // $this->load->view('tip', $data);
            //  return;
        } else {
            if (strpos($phone_os, 'Windows Phone') === false) {
                // 非微信浏览器禁止浏览
                // $this->load->view('tip', $data);return;
            }
        }


        $data['openid'] = $openid;
        $data['nickname'] = $nickname;
        $data['sex'] = 0;
        $data['first_time'] = 'no';
        //查询龙币
        $lb_num = $this->lb_model->get_lb_num($openid, $this->ActiveID, $this->ChannelID, $this->RoomID);
        if (!$lb_num) return false;
        if ($lb_num['returncode'] == '000000') {
            $dcurrency = $lb_num['dcurrency']; //龙币数
            $data['smokeBeansCount'] = $dcurrency;
            $isexit = $this->db->query("select count(*) as num,nickname,head_img, local_img,score,allowMusic  from zy_baccarat_player where openID='" . $openid . "' AND $this->game_sign_sql ")->row_array();
            $filename = 'static/wxheadimg/' . $openid . '.jpg';

            if ($isexit['num'] > 0) {
                if (!file_exists($filename) || $isexit['head_img'] != $headPhoto) {
                    $img_local_url = getImg($headPhoto, $filename);
                    $headLocalPhoto = base_url() . $img_local_url;
                    $data['headimgurl'] = $headLocalPhoto;
                } else {
                    $data['headimgurl'] = $isexit['local_img'] ? $isexit['local_img'] : base_url() . $filename;
                }
                $update_nickname = "";
                if ($isexit['nickname'] != $nickname) $update_nickname = "  nickname='" . $nickname . "' , ";

                $this->db->query("update zy_baccarat_player set {$update_nickname} score =" . $data['smokeBeansCount'] . "  ,  lasttime= " . time() . " ,head_img = '" . $headPhoto . "' ,session_id = '" . $session_id . "',phone_os = '" . $phone_os . "' ,local_img = '" . base_url() . $filename . "' where openID= '" . $openid . "' AND $this->game_sign_sql ");//更新烟豆

                $data['allowMusic'] = $isexit['allowMusic'];
            } else {
                $img_local_url = getImg($headPhoto, $filename);
                $headLocalPhoto = base_url() . $img_local_url;

                $data['headimgurl'] = $headLocalPhoto;

                $user_data['openID'] = $openid;
                $user_data['nickname'] = $nickname;
                $user_data['head_img'] = $headPhoto;
                $user_data['local_img'] = $headLocalPhoto;
                $user_data['sex'] = 0;
                $user_data['addtime'] = time();
                $user_data['lasttime'] = time();
                $user_data['score'] = $dcurrency;
                $user_data['session_id'] = $session_id;
                $user_data['phone_os'] = $phone_os;
                $user_data['ActiveID'] = $this->ActiveID;
                $user_data['ChannelID'] = $this->ChannelID;
                $user_data['RoomID'] = $this->RoomID;
                $insert_sql = $this->db->insert_string('zy_baccarat_player', $user_data);
                $insert_sql = str_replace('INSERT', 'INSERT ignore ', $insert_sql);
                $this->db->query($insert_sql);
                $data['allowMusic'] = 1;
                $data['first_time'] = 'yes';
            }
            //微信分享用到的信息
            $signPackage = $this->common->getSignPackage();
            $data['signPackage'] = $signPackage;
            //获取游戏UI
            $data['GameUI'] = $this->common->get_game_ui($this->ActiveID, 'baccarat');

            //添加游戏访问量
            $this->common->add_game_VistNum($this->RoomID, $this->ChannelID, $this->ActiveID, trim($openid));
            $this->common->add_game_user($this->RoomID, $this->ChannelID, $this->ActiveID, trim($openid), $data['nickname'], $data['smokeBeansCount']);
            $this->load->view('baccarat/index', $data);

        } else {
            if ($lb_num['returncode'] == '300001') {
                $data['msg'] = '请先扫码关注《真龙服务号》公众号，并在公众号的积分商城绑定手机号注册成用户！';

            } else {
                $data['msg'] = $lb_num['returncode'] . '<br>' . $lb_num['returnmsg'];
            }
            $this->load->view('tip', $data);

        }

    }
	
	function save_result(){
		$openid = $this->input->post('openid');
		$score = $this->input->post('score');
		$data['score'] = $score;
        $data['key'] = md5($openid . $score . $this->nodekey);
		echo json_encode($data);
    }

   


}

?>