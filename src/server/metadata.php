<?php
/**
 * given a total number of articles
 *
 * @return integer $article_num total number of articles
 *
 * @example array('article_num' => 15);
 *
 */

header("Content-type:application/json;charset=utf-8");	
require_once('database.php');

$sql = "SELECT COUNT(aid) AS article_num
		FROM articles";
$res = $mysqli -> query($sql);
$row = $res -> fetch_assoc();
$article_num = $row['article_num'];
$data = array('article_num' => $article_num);

echo json_encode($data);
$mysqli -> close();
