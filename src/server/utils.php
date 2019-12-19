<?php

/**
 * prevent xss attack
 */

function adv_xss($str) {
	$str = trim($str);
	$str = strip_tags($str);
	$str = htmlspecialchars($str);
	$str = addslashes($str);
	return $str;
}

/**
 * check login status
 */

define("EXPIRES", 604800);

function check_login() {
	if (!isset($_COOKIE['check'])) {
		echo json_encode(array('status' => 2));
		exit();
	}
	// check expires
	if (time() - $_COOKIE['created_at'] > EXPIRES) {
		echo json_encode(array('status' => 2));
		exit();
	}
	// check hash
	if (md5($_COOKIE['uid'] . $_COOKIE['username'] . $_COOKIE['created_at']) != $_COOKIE['check']) {
		echo json_encode(array('status' => 2));
		exit();
	}
}
