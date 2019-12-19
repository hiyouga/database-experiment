<?php
/**
 * like or dislike an article
 *
 * @param integer $aid article ID
 * @param boolean $opt 0:dislike 1:like
 *
 * @return integer $status 0:error 1:succeed 2:user not logged in
 *
 */

header("Content-type:application/json;charset=utf-8");
require_once('database.php');
require_once('utils.php');
check_login();

if (isset($_POST['aid'])) {
	$aid = $_POST['aid'];
} else {
	echo json_encode(array('status' => 0));
	exit();
}

if (isset($_POST['opt'])) {
	$opt = $_POST['opt'];
} else {
	echo json_encode(array('status' => 0));
	exit();
}

$uid = $_COOKIE['uid'];
$sql = "SELECT polarity
		FROM likes
		WHERE uid = '$uid' AND aid = '$aid'";
$res = $mysqli -> query($sql);
$row = $res -> fetch_assoc();

if ($row != null) {
	if ($row['polarity'] == $opt) {
		$sql = "DELETE FROM likes
				WHERE uid = '$uid' AND aid = '$aid'";
		$res = $mysqli -> query($sql);
	} else {
		$sql = "UPDATE likes
				SET polarity = '$opt'
				WHERE uid = '$uid' AND aid = '$aid'";
		$res = $mysqli -> query($sql);
	}
} else {
	$sql = "INSERT INTO likes (uid, aid, polarity)
			VALUES ('$uid', '$aid', '$opt')";
	$res = $mysqli -> query($sql);
}

echo json_encode(array('status' => 1));
$mysqli -> close();
