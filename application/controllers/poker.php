<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

// 通用页 默认控制器

class poker extends CI_Controller
{
    public $ActiveID = 0;
    public $ChannelID = 0;
    public $RoomID = 0;
    private $nodekey = 'wx263e9fc25c21324f';
    private $openid = '';

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
        //$this->load->model('my_common_model', 'common');
        //$this->load->model('lb_model');


    }

	function index() {
	    $data = array();
	    if(isset($_GET['test'])){
            $test = $_GET['test'];
            if($test=="a"){
                $HeadImg = './res/oREekjljkTwZVmxiNYUHMkDxQjPc.jpg';
            }elseif($test=="b"){
                $HeadImg = './res/b.jpg';
            }elseif($test=="c"){
                $HeadImg = './res/c.jpg';
            }elseif($test=="d"){
                $HeadImg = './res/d.jpg';
            }elseif($test=="e"){
                $HeadImg = './res/e.jpg';
            }
	        $data['wx_info'] = array(
	            'Openid' => "user-".$test,
	            'NickName' => "用户".$test,
	            'HeadImg' => $HeadImg
	        );
	    }else{
	        $data['wx_info'] = array(
                'Openid' => trim($_REQUEST['openid']),
                'NickName' => $_REQUEST['nickName'],
                'HeadImg' => $_REQUEST['headPhoto']
            );
	    }

	    if(!$data['wx_info']['Openid']){
	        $this->load->view('tip',array('msg'=>'没有获取到用户信息！！！'));
	        return;
	    }

        //获取烟豆信息并跟新数据库
        //$my_YD = $this->getYD($data['wx_info']['Openid']);
        if($this->checkUser($data['wx_info']['Openid'])){
            $Udata['UpdateTime'] = time();  //最新登陆时间
            $Udata['TotalGold'] = $this->getYD($data['wx_info']['Openid']);
            $this->updateUser($Udata,array('Openid'=>$data['wx_info']['Openid']));
            $data['wx_info']['first_time'] = "no";
        }else{
            $Udata['Openid'] = $data['wx_info']['Openid'];
            $Udata['NickName'] = $data['wx_info']['NickName'];
            $Udata['HeadImg'] = $data['wx_info']['HeadImg'];
            $Udata['AddTime'] = time();
            $Udata['TotalGold'] = 1000;//$my_YD
            $Udata['UpdateTime'] = time();
            $this->addUser($Udata);
            $data['wx_info']['first_time'] = "yes";
        }
        $gamekey = $this->getKey();
        //存验证码
		$this->saveGameKey($data['wx_info']['Openid'],$gamekey);
        //获取背景音乐、音效设置
        $ms = $this->getMusicFlag($data['wx_info']['Openid']);
        $data['wx_info']['MusicSet'] = $ms['MusicSet'];
        $data['wx_info']['EffectsSet'] = $ms['EffectsSet'];
        $data['wx_info']['TotalGold'] = $Udata['TotalGold'];
		$data['wx_info']['gamekey'] = $gamekey;

		$this->load->view('poker',$data);
	}


    /**
     *  A : 黑桃
     *  B ：红心
     *  C ：梅花
     *  D ：方块
     */
    public function main(){
        if($this->checkGameKey()){  //验证用户身份
            $openid = trim($_POST['openid']);
            $other_openid = trim($_POST['otherplayeropenid']);
            $game_type = trim($_POST['game_type']);//0代表两个真正的玩家对战，1代表一个玩家一个系统。
            //验证烟豆是否够下注
            $my_YD = $this->getYD($openid);
            $sum = intval($_POST['bet_num']);
            if($my_YD<$sum || $sum<0){  //判断龙币是否够下注
                $result = array('Code'=>-2,'Msg'=>'龙币不足');
                $this->addErrorLog(-2,'龙币不足');//添加记录到数据库
                echo json_encode($result);
                exit();
            }else{
                    //控制扑克牌的生成
                    $arr_all = array();
                    $arr_hs = array(1=>"D",2=>"C",3=>"B",4=>"A");
                    $arr_1 = array(1,2,3,4);  //花色
                    $arr_2 = array(1,2,3,4,5,6,7,8,9,10,11,12,13);//点数
                    foreach($arr_2 as $value){
                        foreach($arr_1 as $val){
                            $arr_all[] = $value.$val;  //扑克牌全部点数（包括花色）
                        }
                    }
                    $p_key = array_rand($arr_all);
                    //$p_key = 51;
                    //echo "<br>";
                    /*echo "<pre>";
                    print_r($arr_all);
                    echo "<pre/>";*/
                    //echo $p_key;
                    if($p_key==count($arr_all)-1||$p_key==0){
                        //玩家抽到的是最大的牌或者最小的牌
                        $arr_all_temp = $arr_all;
                        unset($arr_all_temp[$p_key]);
                        $b_key = array_rand($arr_all_temp);
                        /*echo "<pre>";
                        print_r($arr_all_temp);
                        echo "<pre/>";
                        echo $b_key;echo "<br>";*/
                    }else{
                        if($game_type){
                            $b_key = $this->getProbability($arr_all,$sum,$p_key);
                        }else{
                            $arr_all_temp = $arr_all;
                            unset($arr_all_temp[$p_key]);
                            $b_key = array_rand($arr_all_temp);
                        }

                    }
                    $p = $arr_all[$p_key];
                    //echo "玩家的值：".$p;echo "<br>";
                    $p_1 = $arr_hs[$p%10];  //玩家牌的花色
                    $p_2 = intval($p/10);   //玩家牌的点数
                    //echo "<br>";echo $p_1."||".$p_2;echo "<br>";
                    $b = $arr_all[$b_key];
                    //echo "庄家的值：".$b;echo "<br>";
                    $b_1 = $arr_hs[$b%10];  //庄家牌的花色
                    $b_2 = intval($b/10);   //庄家牌的点数
                    //echo $b_1."||".$b_2;echo "<br>";

                    if($b_key>$p_key){
                        $winner = "baker";
                    }else{
                        $winner = "player";
                    }
                    //增加或者扣除龙币
                    //赢的要被抽水
                    if(0<$sum&&$sum<10){
                        $rent = 1;
                    }elseif(10<=$sum&&$sum<30){
                        $rent = 2;
                    }elseif(30<=$sum&&$sum<50){
                        $rent = 5;
                    }elseif(50<=$sum&&$sum<100){
                        $rent = 10;
                    }else{
                        $rent = 20;
                    }
                    $win_sum = $sum-$rent;
                    if($game_type){
                        if($winner=="baker"){
                            $Other_YD = $this->xt_addYD($other_openid,abs($win_sum)); //系统庄家赢，增加龙币
                            $My_YD = $this->subYD($openid,abs($sum)); //玩家家输，扣除龙币
                        }else{
                            $My_YD = $this->addYD($openid,abs($win_sum)); //玩家赢，增加龙币
                            $Other_YD = $this->xt_subYD($other_openid,abs($sum)); //系统庄家输，扣除龙币
                        }
                    }else{
                        if($winner=="baker"){
                            $My_YD = $this->addYD($openid,abs($win_sum)); //庄家赢，增加龙币
                            $Other_YD = $this->subYD($other_openid,abs($sum)); //玩家输，扣除龙币
                        }else{
                            $Other_YD = $this->addYD($other_openid,abs($win_sum)); //玩家赢，增加龙币
                            $My_YD = $this->subYD($openid,abs($sum)); //庄家输，扣除龙币
                        }
                    }

                    //下注信息写入数据库
                    $BetOndata['Openid'] = $openid;
                    $BetOndata['PlayerOpenid'] = $other_openid;
                    $BetOndata['bet'] = $sum;
                    $BetOndata['p_poker_face'] = $p_1."_".$p_2;
                    $BetOndata['b_poker_face'] = $b_1."_".$b_2;
                    $BetOndata['bet'] = $sum;
                    if($winner=="baker"){
                        $BetOndata['Result'] = -$sum;
                    }else{
                        $BetOndata['Result'] = $sum;
                    }
                    $BetOndata['AddTime'] = time();
                    $this->db->insert('zy_fb_bet_on',$BetOndata);
                    $key = md5($openid . $sum . $this->nodekey);
                    $result = array('Code'=>0,'Msg'=>'成功','p_1'=>$p_1,'p_2'=>$p_2,'b_1'=>$b_1,'b_2'=>$b_2,'winner'=>$winner,'bets'=>$sum,'My_YD'=>$My_YD,'Other_YD'=>$Other_YD,'key'=>$key);
            }
        }else{
            $result = array('Code'=>-1,'Msg'=>'数据异常');
            $this->addErrorLog(-1,'Gamekey不正确');//添加记录
        }
        echo json_encode($result);
    }

    private function getProbability($arr_all,$sum,$key){
        $count = count($arr_all)-1;
        $b_arr = array_slice($arr_all, $key+1,$count,true);
        /*echo "<pre>";
        print_r($b_arr);
        echo "<pre/>";*/
        $p_arr = array_slice($arr_all, 0,$key);
        /*echo "<pre>";
        print_r($p_arr);
        echo "<pre/>";*/
        $res = $this->get_rate();
        $rate_base = $res['rate_base']?$res['rate_base']:55;
        $rate_inc = $res['rate_inc']?$res['rate_inc']:8;
        $bet_max = 5+ceil((100-$rate_base)/$rate_inc)*5;
        if($sum<$bet_max){
            $b_rate_init = $rate_base+ceil(($sum-5)/5)*$rate_inc;
            $p_rate_init = 100-$b_rate_init;
            $divisor = $this->baseDefine($b_rate_init,$p_rate_init);//求两个最大公约数
            $b_rate = $b_rate_init/$divisor;
            $p_rate = $p_rate_init/$divisor;
        }else{
            $b_rate = 10;
            $p_rate = 0;
        }

        /*if($sum<=20){
            //当下注值小于等于20时，庄家中奖概率为55%
            $b_rate = 11;
            $p_rate = 9;
        }elseif($sum>20&&$sum<=50){
            //当下注值大于20且小于等于50时，庄家中奖概率为60%
            $b_rate = 3;
            $p_rate = 2;
        }elseif($sum>50&&$sum<=100){
            //当下注值大于50且小于等于100时，庄家中奖概率为62%
            $b_rate = 31;
            $p_rate = 19;
        }elseif($sum>100&&$sum<=200){
            //当下注值大于100时，庄家中奖概率为65%
            $b_rate = 13;
            $p_rate = 7;
        }elseif($sum>200&&$sum<=300){
            //当下注值大于100时，庄家中奖概率为68%
            $b_rate = 17;
            $p_rate = 8;
        }elseif($sum>300){
            //当下注值大于100时，庄家中奖概率为70%
            $b_rate = 7;
            $p_rate = 3;
        }*/

        //下注值<=20，庄家赢概率65%。生成一个数组，其中有13个是庄家赢的点数，7个是玩家赢的
        if(count($b_arr)>=$b_rate){    //从$b_arr中随机抽取13张牌
            $rand_keys_b = array_rand($b_arr, $b_rate);
        }else{
            $rand_keys_b = $this->arr_copy($b_arr,$b_rate);
        }
        if(count($p_arr)>=$p_rate){    //从$b_arr中随机抽取13张牌
            $rand_keys_p = array_rand($p_arr, $p_rate);
        }else{
            $rand_keys_p = $this->arr_copy($p_arr,$p_rate);
        }
        //合并数组
        $arr_final = array_merge($rand_keys_b,$rand_keys_p);
        /*echo "<pre>";
        print_r($rand_keys_b);
        echo "<pre/>";
        echo "<pre>";
        print_r($rand_keys_p);
        echo "<pre/>";
        echo "<pre>";
        print_r($arr_final);
        echo "<pre/>";*/
        //从合并数组中随机获取一个值，此值为庄家的牌数
        $key_final = $this->arr_rand($arr_final);
        //echo "庄家随机数：".$key_final;echo "<br>";
        return $key_final;
    }

    //从数据库获取概率表
    private function get_rate(){
        $searchsql = "ChannelID = {$this->ChannelID} AND ActiveID = {$this->ActiveID} AND RoomID = {$this->RoomID}";
        $query = $this->db->query("select rate_base,rate_inc from zy_fb_rate WHERE $searchsql");
        $data = $query->row_array();
        return $data;
    }

    //求两个数最大的公约数
    private function baseDefine($m, $n) {
        if($m ==0 && $n == 0) {
            return false;
        }
        $min = min($m, $n);
        while($min >= 1) {
            if($m % $min == 0){
                if($n % $min ==0) {
                    return $min;
                }
            }
            $min -= 1;
        }
        return $min;
    }

    private function arr_copy($arr,$num){
        $temp = array();
        $max = ceil($num/count($arr));
        for($i=0;$i<$max;$i++){
            foreach($arr as $key=>$value){
                if(count($temp)==$num){
                    break;
                }else{
                    $temp[] = $key;
                }
            }
        }
        return $temp;
    }

	/*
	*下注
	*Code : 0 成功， -1 gamekey验证失败， -2 烟豆不足 -3 其他
	*返回结果 : json格式  {Code:错误码,Count:骰子点数,Msg:提示信息,My_YD:结算后我的总烟豆,result:每个下注输赢情况}
	*/
	public function betOn() {

		if($this->checkGameKey()){//验证gamekey

			$betdata['Bet1'] = intval($_POST['1']);
			$betdata['Bet2'] = intval($_POST['2']);
			$betdata['Bet3'] = intval($_POST['3']);
			$betdata['Bet4'] = intval($_POST['4']);
			$betdata['Bet5'] = intval($_POST['5']);
			$betdata['Bet6'] = intval($_POST['6']);
			$betdata['BetBig'] = intval($_POST['big']);
			$betdata['BetSmall'] = intval($_POST['small']);
			$betdata['BetSingle'] = intval($_POST['single']);
			$betdata['BetDouble'] = intval($_POST['double']);

			$openid = trim($_POST['openid']);

			//验证烟豆是否够下注
			$my_YD = $this->getYD($openid);
			$sum = 0;
			foreach($betdata as $v){
				$sum += $v;
			}
			if($my_YD < $sum){
				$result = array('Code'=>-2,'Msg'=>'烟豆不足');
                $this->addErrorLog(-2,'烟豆不足');//添加记录到数据库
                echo json_encode($result);
                exit();
			}

            //控制概率生成点数
			$count = $this->getCountByProbability($betdata);

			//结算
			$jiesuan = array();
			$betCount = $betdata['Bet'.$count];//猜点数下注结算
			foreach($betdata as $k => $b){
				if($k == 'Bet'.$count){
					$jiesuan[$k] = $b * 5;
				}else{
					$jiesuan[$k] = -$b;
				}
			}

			//猜单双下注结算
			if($count % 2 == 0){
				//双
				$jiesuan['BetDouble'] = $betdata['BetDouble'];
				$jiesuan['BetSingle'] = -$betdata['BetSingle'];
			}else {
				//单
				$jiesuan['BetSingle'] = $betdata['BetSingle'];
                $jiesuan['BetDouble'] = -$betdata['BetDouble'];
			}

			//猜大小下注结算
			if($count >= 1 && $count <=3){
				//小
				$jiesuan['BetSmall'] = $betdata['BetSmall'];
                $jiesuan['BetBig'] = -$betdata['BetBig'];
			}else{
				//大
				$jiesuan['BetBig'] = $betdata['BetBig'];
                $jiesuan['BetSmall'] = -$betdata['BetSmall'];
			}

			//var_dump($jiesuan);

			//扣除烟豆
			$YDsum = 0;
			foreach($jiesuan as $v){
				$YDsum += $v;
			}

			if($YDsum >0){
				$My_YD = $this->addYD($openid,abs($YDsum));
			}else{
				$My_YD = $this->subYD($openid,abs($YDsum));
			}

			//下注信息写入数据库
			$BetOndata = $betdata;
			$BetOndata['Openid'] = $openid;
			$BetOndata['Result'] = $YDsum;
			$BetOndata['Rmark'] = array2string($jiesuan);
			$BetOndata['AddTime'] = time();

			$this->db->insert('zy_fb_bet_on',$BetOndata);



			$result = array('Code'=>0,'Count'=>$count,'Msg'=>'成功','My_YD'=>$My_YD,'result'=>$jiesuan);


		}else{
			$result = array('Code'=>-1,'Msg'=>'数据异常');
			$this->addErrorLog(-1,'Gamekey不正确');//添加记录
		}


		echo json_encode($result);
	}

	//根据概率获取点数,待完善
	private function getCountByProbability($betdata){

		/*$betdata['Bet1'] = 50;
		$betdata['Bet2'] = 100;
		$betdata['Bet3'] = 50;
		$betdata['Bet4'] = 30;
		$betdata['Bet5'] = 50;
		$betdata['Bet6'] = 100;
		$betdata['BetBig'] = 50;
		$betdata['BetSmall'] = 0;
		$betdata['BetSingle'] = 30;
		$betdata['BetDouble'] = 20;*/

		$temp_arr = array();//6种推算结果
		$tuisuan = array();
		for($i=1;$i<7;$i++){
			$sum = 0;
			$betCount = $betdata['Bet'.$i];//猜点数下注结算
			foreach($betdata as $k => $b){
				if($k == 'Bet'.$i){
					$temp_arr[$i][$k] = $b * 5;

				}else{
					$temp_arr[$i][$k] = -$b;
				}
				switch ($k)
                {
                case 'Bet1':
                case 'Bet2':
                case 'Bet3':
                case 'Bet4':
                case 'Bet5':
                case 'Bet6':
                	$sum += $temp_arr[$i][$k];
                }

			}

			//猜单双下注结算
			if($i % 2 == 0){
				//双
				$temp_arr[$i]['BetDouble'] = $betdata['BetDouble'];
				$temp_arr[$i]['BetSingle'] = -$betdata['BetSingle'];
			}else {
				//单
				$temp_arr[$i]['BetSingle'] = $betdata['BetSingle'];
				$temp_arr[$i]['BetDouble'] = -$betdata['BetDouble'];
			}

			$sum += $temp_arr[$i]['BetSingle'];
			$sum += $temp_arr[$i]['BetDouble'];

			//猜大小下注结算
			if($i >= 1 && $i <=3){
				//小
				$temp_arr[$i]['BetSmall'] = $betdata['BetSmall'];
				$temp_arr[$i]['BetBig'] = -$betdata['BetBig'];
			}else{
				//大
				$temp_arr[$i]['BetBig'] = $betdata['BetBig'];
				$temp_arr[$i]['BetSmall'] = -$betdata['BetSmall'];
			}

			$sum += $temp_arr[$i]['BetBig'];
			$sum += $temp_arr[$i]['BetSmall'];

			$temp_arr[$i]['sum'] = $sum;
			$tuisuan[$i] = $sum;
		}
		arsort($tuisuan);
		//var_dump($tuisuan);

		$prize_arr = array(
			'0' => array('id'=>1,'prize'=>'1','v'=>100),
			'1' => array('id'=>2,'prize'=>'2','v'=>100),
			'2' => array('id'=>3,'prize'=>'3','v'=>100),
			'3' => array('id'=>4,'prize'=>'4','v'=>100),
			'4' => array('id'=>5,'prize'=>'5','v'=>100),
			'5' => array('id'=>6,'prize'=>'6','v'=>100),
		);

		$j = 0.01;
		foreach($tuisuan as $k =>$v){
			$prize_arr[$k-1]['v'] = $prize_arr[$k-1]['v']*$j;
			$j += 0.05;
		}

		//var_dump($prize_arr);

		foreach ($prize_arr as $key => $val) {
			$arr[$val['id']] = $val['v'];
		}

		$rid = $this->get_rand($arr); //根据概率获取奖项id

		$res['yes'] = $prize_arr[$rid-1]['prize']; //中奖项

		//echo $res['yes'];
		return $res['yes'];

	}

	//检查用户数据库是否有记录
	private function checkUser($openid) {
	    if(!$openid){
	        return false;
	    }
	    return $this->db->get_where('zy_fb_player',array('Openid'=>$openid))->num_rows();
	}

	private function addUser($Udata){
	    if(!$Udata){
	        return false;
	    }

	    return $this->db->insert('zy_fb_player',$Udata);
	}

	private function updateUser($Udata,$where){
        if(!$Udata){
            return false;
        }

        return $this->db->update('zy_fb_player', $Udata, $where);
    }

    private function getYD($openid) {//人人对战时，获取龙币接口
        if(!$openid){
            return false;
        }
        $Pdata = $this->db->get_where('zy_fb_player',array('Openid'=>$openid))->row_array();
        return $Pdata['TotalGold'];
    }

    private function xt_getYD($openid) {//人人对战时，获取龙币接口
        if(!$openid){
            return false;
        }
        $Pdata = $this->db->get_where('zy_fb_xt_player',array('Openid'=>$openid))->row_array();
        return $Pdata['TotalGold'];
    }

    private function getMusicFlag($openid) {//获取背景音乐、音效设置
        if(!$openid){
            return false;
        }
        $Pdata = $this->db->get_where('zy_fb_player',array('Openid'=>$openid))->row_array();
        return $Pdata;
    }

	//人人对战添加烟豆
    private function addYD($openid,$num){
    	if(!is_numeric($num) || $num < 0){
    		return false;
    	}
    	$this->db->set('TotalGold', 'TotalGold+'.$num, FALSE);
        $this->db->where(array('Openid'=>$openid));
    	$this->db->update('zy_fb_player');
    	return $this->getYD($openid);
    }

    //人机对战添加烟豆
    private function xt_addYD($openid,$num){
        if(!is_numeric($num) || $num < 0){
            return false;
        }
        $this->db->set('TotalGold', 'TotalGold+'.$num, FALSE);
        $this->db->where(array('Openid'=>$openid));
        $this->db->update('zy_fb_xt_player');
        return $this->xt_getYD($openid);
    }

    //人人对战扣除烟豆
	private function subYD($openid,$num){
        //判断下注值是否为数字或者是否<0
		if(!is_numeric($num) || $num < 0){
			return false;
		}
		$this->db->set('TotalGold', 'TotalGold-'.$num, FALSE);
        $this->db->where(array('Openid'=>$openid));
		$this->db->update('zy_fb_player');
		return $this->getYD($openid);
	}

    //人机对战扣除烟豆
    private function xt_subYD($openid,$num){
        //判断下注值是否为数字或者是否<0
        if(!is_numeric($num) || $num < 0){
            return false;
        }
        $this->db->set('TotalGold', 'TotalGold-'.$num, FALSE);
        $this->db->where(array('Openid'=>$openid));
        $this->db->update('zy_fb_xt_player');
        return $this->xt_getYD($openid);
    }

    private function getKey(){
    	$src_str = "abcdefghijklmnopqrstuvwxyz0123456789";
    	return substr(str_shuffle($src_str),1,10);
    }

	//存gamekey
    private function saveGameKey($openid,$gamekey){
    	if(!$openid){
			return false;
		}
    	$num = $this->db->get_where('zy_fb_session',array('Openid'=>$openid))->num_rows();

    	if($num){
    		$this->db->update('zy_fb_session', array('GameKey'=>$gamekey,'AddTime'=>time()), array('Openid'=>$openid));

    	}else{
    		$this->db->insert('zy_fb_session',array('Openid'=>$openid,'GameKey'=>$gamekey,'AddTime'=>time()));
    	}

    	//删除过期session 24小时
    	$time = time();
    	$this->db->delete('zy_fb_session',"AddTime < ".($time - 24*3600));
    }

    //验证gamekey
   	private function checkGameKey(){
   		$key = trim($_POST['gamekey']);
   		$openid = trim($_POST['openid']);
   		$res = false;
   		if($this->db->get_where('zy_fb_session',array('Openid'=>$openid,'GameKey'=>$key))->num_rows()){
   			$res = true;
   		}

   		return $res;

   	}

   	private function addErrorLog($code,$msg){
		$data['Openid'] = trim($_POST['openid']);
		$data['ErrorCode'] = $code;
		$data['Msg'] = $msg;
		$data['Browser'] = getbrowser();
		$data['Ip'] = ip();
		$data['ComeFrom'] = $_SERVER['HTTP_REFERER'];
		$data['AddTime'] = time();

		$this->db->insert('zy_fb_log',$data);


   	}

    //从数组中随机获取一个数
    private function arr_rand($arr){
        $rand_keys = array_rand($arr);
        return $arr[$rand_keys];
    }

   	function get_rand($proArr) {
        $result = '';

        //概率数组的总概率精度
        $proSum = array_sum($proArr);

        //概率数组循环
        foreach ($proArr as $key => $proCur) {
            $randNum = mt_rand(1, $proSum);
            if ($randNum <= $proCur) {
                $result = $key;
                break;
            } else {
                $proSum -= $proCur;
            }
        }
        unset ($proArr);

        return $result;
    }

    public function set_music(){
        $Udata['MusicSet'] = trim($_POST['MusicSet']);
        $Openid = trim($_POST['Openid']);
        $this->updateUser($Udata,array('Openid'=>$Openid));
        $result = array('Code'=>0,'Msg'=>'成功','MusicSet'=>$Udata['MusicSet']);
        echo json_encode($result);
    }

    //喇叭公告
    function get_xlb(){
        $this->game_sign_sql = addslashes("  ActiveID=$this->ActiveID AND ChannelID=$this->ChannelID AND RoomID=$this->RoomID");
        $xlb_ids = $this->input->get('ids');
        // $where['ActiveID'] = $this->ActiveID;
        //$where['ChannelID'] = $this->ChannelID;
        $where['ChannelID'] = 1;
        //$where['RoomID'] = $this->RoomID;
        $where['RoomID'] = 6;
        $this->db->order_by("addtime", "desc");
        $query = $this->db->get_where('zy_fb_game_xlb', $where, 5);
        $result = $query->result_array();

        $ids = array();
        $xlb_text = '';
        foreach($result as $r){
            $ids[] = $r['id'];
            $xlb_text .= $r['content'] ;
        }
        $ids_in = implode(',',$ids );
        $diff_time = time() - 60*2;
        if( $result && $result[0]['addtime'] <  $diff_time){
            $this->db->query("update zy_fb_game_xlb set addtime =0  where  $this->game_sign_sql");
            $time = time();
            $this->db->query("update zy_fb_game_xlb set addtime =$time  where  $this->game_sign_sql and id not in($ids_in)  ORDER BY RAND() LIMIT 5 ");

            $this->db->order_by("addtime", "desc");
            $query = $this->db->get_where('zy_fb_game_xlb', $where, 5);
            $result = $query->result_array();
            $xlb_text = '';
            $ids = array();
            foreach($result as $r){
                $ids[] = $r['id'];
                $xlb_text .= $r['content'];
            }
            $ids_in = implode(',',$ids );
        }
        $data['is_update'] = 0;
        if($xlb_ids != $ids_in) $data['is_update'] = 1;
        $data['ids'] = $ids_in;
        $data['content'] = $xlb_text;
        echo json_encode($data);

    }

    //异步获取下注的值
    function save_result(){
        $openid = $this->input->post('openid');
        $score = $this->input->post('score');
        $data['score'] = $score;
        $data['key'] = md5($openid . $score . $this->nodekey);
        echo json_encode($data);
    }

    //获取玩家准备就绪信号
    function send_player_ready(){
        $openid = $this->input->post('openid');
        $score = $this->input->post('score');
        $data['score'] = $score;
        $data['player_ready'] = 1;
        $data['key'] = md5($openid . $score . $this->nodekey);
        echo json_encode($data);
    }

    //比较玩家下注值是否比庄家现有的龙币大
    function compare(){
        $openid = $this->input->post('openid');
        $other_openid = $this->input->post('other_opendid');
        $score = $this->input->post('score');
        $game_type = $this->input->post('game_type');
        $data['score'] = $score;
        $data['key'] = md5($openid . $score . $this->nodekey);

        //数据库查询当前龙币
        if($game_type==1){
            $table = "zy_fb_xt_player";
        }else{
            $table = "zy_fb_player";
        }
        $sql = "select TotalGold from $table WHERE Openid='$other_openid'";
        $data['sql'] = $sql;
        $data['game_type'] = $game_type;
        $query = $this->db->query($sql);
        $total_gold = $query->row_array();
        $data['TotalGold'] = $total_gold['TotalGold'];
        if($score<=$total_gold['TotalGold']){
            $data['com_result'] = 1;
        }else{
            $data['com_result'] = 0;
        }

        echo json_encode($data);
    }


}