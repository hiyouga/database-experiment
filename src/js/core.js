"use strict";

var marked = require("marked");

// AJAX cache on

$(function () {
	$.ajaxSetup ({
		cache: false
	});
});

// Main

$(document).ready(function () {
	$("#blogtitle").text("Demo Blog")
	$("#author").text("BUAA DBMS Group");
	if ($.cookie("username")) {
		$("#username").text("欢迎回来，" + $.cookie("username"));
		$(".login-before").hide();
		$(".login-after").show();
	}
	motionIntegrator.bootstrap();
	switch (GetUrlValue('type')) {
		case "article": // Article page
			Loader.getArticle(GetUrlValue("aid"));
			break;
		default: // Homepage
			Loader.getHome();
	}
	Loader.getArticleList();
});

// Methods

var Loader = {
	my_pn: 1,
	max_pn: 99999,
	per_page: 10,
	history: "null",
	getNone: function () {
		console.log("null");
	},
	getHome: function () {
		$.ajax({
			url: "src/server/metadata.php",
			success: function (data) {
				Loader.max_pn = Math.ceil(data.article_num / Loader.per_page);
				Loader.getMoreArticles();
			},
			error: function () {
				console.log("get home error");
			}
		});
	},
	getArticle: function (aid) {
		$("#mainloader").show();
		$.ajax({
			url: "src/server/article.php?aid=" + aid,
			success: function (data) {
				$("#mainloader").hide();
				$("#backbtn").show();
				$("#blog-main").addClass("blog-main-after");
				$("#blog-content-title").text(data.title);
				$("#blog-content-time").text(convTime(data.created_at));
				$("#blog-content-author").text(data.author);
				$("#blog-content-likes").text(data.likes);
				$("#blog-content-dislikes").text(data.dislikes);
				$("#blog-content-html").html(marked(data.body));
				Loader.history = data.history;
				if (Loader.history == "liked") {
					$("#likebtn").attr("class", function (i, origValue) {
						return origValue.replace(/btn-outline-success/, "btn-success");
					});
				}
				if (Loader.history == "disliked") {
					$("#dislikebtn").attr("class", function (i, origValue) {
						return origValue.replace(/btn-outline-danger/, "btn-danger");
					});
				}
				$("#blog-content").velocity('transition.fadeIn');
				if (data.comments) {
					$.each(data.comments, function (index, item){
						var html = "<div class=\"p-2 blog-comment\">";
						html += "<p class=\"blog-comment-meta\">" + item.author + " " + convTime(item.created_at) + "</p>";
						html += "<p>" + marked(item.body) + "</p>";
						html += "</div><!-- /.blog-comment -->";
						$("#comments").append(html);
					});
				}
				$("#blog-comments").velocity('transition.fadeIn');
			},
			error: function () {
				console.log("get article error");
			}
		});
	},
	getMoreArticles: function () {
		$("#pagination").hide();
		$("#mainloader").show();
		$.ajax({
			url: "src/server/archive.php?page=" + Loader.my_pn + "&perpage=" + Loader.per_page,
			success: function (data) {
				$("#mainloader").hide();
				$.each(data, function (index, item) {
					var html = "<div class=\"p-2 blog-post\">";
					html += "<h3 class=\"blog-title\"><a style=\"color:black;text-decoration:none;\" href=\"?type=article&aid=" + item.aid + "\">" + item.title + "</a></h3>";
					html += "<p class=\"blog-meta\">" + convTime(item.created_at) + " by " + item.author;
					html += "&nbsp;&nbsp;<i class=\"fa fa-thumbs-o-up\"></i>&nbsp;" + item.likes + "&nbsp;<i class=\"fa fa-thumbs-o-down\"></i>&nbsp;" + item.dislikes + "</p>";
					html += "<p>" + item.preview + "…… <a href=\"?type=article&aid="+ item.aid + "\">阅读全文 &raquo;</a></p>";
					html += "</div><!-- /.blog-post -->";
					$("#blog-posts").append(html);
				});
				//$("#blog-posts").velocity('transition.fadeIn');
				if (Loader.my_pn < Loader.max_pn) {
					$("#pagination").show();
				} else {
					$("#pagination").hide();
				}
				Loader.my_pn++;
			},
			error: function () {
				console.log("get more articles error");
			}
		});
	},
	getArticleList: function () {
		$("#sideloader").show();
		$.ajax({
			url: "src/server/archive.php?perpage=" + Loader.per_page,
			success: function (data) {
				$("#sideloader").hide();
				$.each(data, function (index, item) {
					$("#side-list").append("<li><a href=\"?type=article&aid=" + item.aid + "\">" + item.title + "</a></li>");
				});
				$("#side-list").velocity("transition.fadeIn");
			},
			error: function () {
				console.log("get article list error");
			}
		});
	}
}

function post() {
	var title = $("#post-title").val();
	var body = $("#post-content").val();
	if (title == "" || body == "") {
		return false;
	}
	$.ajax({
		type: "POST",
		url: "src/server/post.php",
		data: {
			'title': title,
			'body': body
		},
		success: function (data) {
			switch (data.status) {
				case 0: // unknown error
					$("#post-warning").text("未知错误");
					$("#post-warning").show();
					break;
				case 1: // succeed
					$("#postModal").modal("hide");
					$("#tipsMessage").text("文章发布成功！");
					$("#tipsbtn").attr("onclick", "refresh()");
					$("#tipsModal").modal("show");
					break;
				case 2: // user not logged in
					$("#post-warning").text("用户未登录");
					$("#post-warning").show();
					break;
				default:
					console.log("null");
			}
		},
		dataType: "json"
	});
	return false;
}

function comment() {
	var aid = GetUrlValue("aid");
	var body = $("#comment-text").val();
	if (aid == null || body == "") {
		return false;
	}
	$.ajax({
		type: "POST",
		url: "src/server/comment.php",
		data: {
			'aid': aid,
			'body': body
		},
		success: function (data) {
			switch (data.status) {
				case 0: // unknown error
					$("#comment-warning").text("未知错误");
					$("#comment-alert").show();
					break;
				case 1: // succeed
					refresh();
					break;
				case 2: // user not logged in
					$("#comment-warning").text("用户未登录");
					$("#comment-alert").show();
					break;
				default:
					console.log("null");
			}
		},
		dataType: "json"
	});
	return false;
}

function like() {
	var aid = GetUrlValue("aid");
	if (aid == null) {
		return false;
	}
	$.ajax({
		type: "POST",
		url: "src/server/like.php",
		data: {
			'aid': aid,
			'opt': 1
		},
		success: function (data) {
			switch (data.status) {
				case 0: // unknown error
					$("#tipsMessage").text("未知错误");
					$("#tipsModal").modal("show");
					break;
				case 1: // succeed
					if (Loader.history == "liked") {
						$("#likebtn").attr("class", function (i, origValue) {
							return origValue.replace(/btn-success/, "btn-outline-success");
						});
						Loader.history = "null";
					} else {
						if (Loader.history == "disliked") {
							$("#dislikebtn").attr("class", function (i, origValue) {
								return origValue.replace(/btn-danger/, "btn-outline-danger");
							});
						}
						$("#likebtn").attr("class", function (i, origValue) {
							return origValue.replace(/btn-outline-success/, "btn-success");
						});
						Loader.history = "liked";
					}
					break;
				case 2: // user not logged in
					$("#tipsMessage").text("用户未登录");
					$("#tipsModal").modal("show");
					break;
				default:
					console.log("null");
			}
		},
		dataType: "json"
	});
	return false;
}

function dislike() {
	var aid = GetUrlValue("aid");
	if (aid == null) {
		return false;
	}
	$.ajax({
		type: "POST",
		url: "src/server/like.php",
		data: {
			'aid': aid,
			'opt': 0
		},
		success: function (data) {
			switch (data.status) {
				case 0: // unknown error
					$("#tipsMessage").text("未知错误");
					$("#tipsModal").modal("show");
					break;
				case 1: // succeed
					if (Loader.history == "disliked") {
						$("#dislikebtn").attr("class", function (i, origValue) {
							return origValue.replace(/btn-danger/, "btn-outline-danger");
						});
						Loader.history = "null";
					} else {
						if (Loader.history == "liked") {
							$("#likebtn").attr("class", function (i, origValue) {
								return origValue.replace(/btn-success/, "btn-outline-success");
							});
						}
						$("#dislikebtn").attr("class", function (i, origValue) {
							return origValue.replace(/btn-outline-danger/, "btn-danger");
						});
						Loader.history = "disliked";
					}
					break;
				case 2: // user not logged in
					$("#tipsMessage").text("用户未登录");
					$("#tipsModal").modal("show");
					break;
				default:
					console.log("null");
			}
		},
		dataType: "json"
	});
	return false;
}

function register() {
	var username = $("#inputUsername").val();
	var password = $("#inputPassword").val();
	if (username == "" || password == "") {
		return false;
	}
	if (username.length < 3) {
		$("#inputUsername").attr("data-toggle", "popover");
		$("#inputUsername").attr("data-content", "用户名长度应大于3个字符");
		$("#inputUsername").popover('show');
		return false;
	}
	if (password.length < 6) {
		$("#inputPassword").attr("data-toggle", "popover");
		$("#inputPassword").attr("data-content", "密码长度应大于6个字符");
		$("#inputPassword").popover('show');
		return false;
	}
	$.ajax({
		type: "POST",
		url: "src/server/register.php",
		data: {
			'username': username,
			'password': password
		},
		success: function (data) {
			switch (data.status) {
				case 0: // unknown error
					$("#tipsMessage").text("未知错误");
					$("#tipsModal").modal("show");
					break;
				case 1: // succeed
					$("#tipsMessage").text("注册成功！");
					$("#tipsbtn").attr("onclick", "refresh()");
					$("#tipsModal").modal("show");
					break;
				case 2: // user exists
					$("#inputUsername").attr("data-toggle", "popover");
					$("#inputUsername").attr("data-content", "用户名已被使用");
					$("#inputUsername").popover('show');
					break;
				default:
					console.log("null");
			}
		},
		dataType: "json"
	});
	return false;
}

function login() {
	var username = $("#inputUsername").val();
	var password = $("#inputPassword").val();
	if (username == "" || password == "") {
		return false;
	}
	$.ajax({
		type: "POST",
		url: "src/server/login.php",
		data: {
			'username': username,
			'password': password
		},
		success: function (data) {
			switch (data.status) {
				case 0: // unknown error
					$("#tipsMessage").text("未知错误");
					$("#tipsModal").modal("show");
					break;
				case 1: // succeed
					$.cookie('uid', data.uid, {expires: 7, path: '/'});
					$.cookie('username', data.username, {expires: 7, path: '/'});
					$.cookie('created_at', data.created_at, {expires: 7, path: '/'});
					$.cookie('check', data.check, {expires: 7, path: '/'});
					$("#tipsMessage").text("登录成功！");
					$("#tipsbtn").attr("onclick", "refresh()");
					$("#tipsModal").modal("show");
					break;
				case 2: // user not found
					$("#inputUsername").attr("data-toggle", "popover");
					$("#inputUsername").attr("data-content", "用户不存在");
					$("#inputUsername").popover('show');
					break;
				case 3: // wrong password
					$("#inputPassword").attr("data-toggle", "popover");
					$("#inputPassword").attr("data-content", "密码错误");
					$("#inputPassword").popover('show');
					break;
				default:
					console.log("null");
			}
		},
		dataType: "json"
	});
	return false;
}

function logout() {
	if ($.cookie("username")) {
		$.removeCookie('uid', {path:'/'});
		$.removeCookie('username', {path:'/'});
		$.removeCookie('created_at', {path:'/'});
		$.removeCookie('check', {path:'/'});
		$("#tipsMessage").text("登出成功！");
		$("#tipsbtn").attr("onclick", "refresh()");
		$("#tipsModal").modal("show");
	} else {
		$("#tipsMessage").text("用户未登录");
		$("#tipsModal").modal("show");
	}
}

// Functions

var GetUrlValue = function(name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
        try {
            return decodeURIComponent(r[2]);
        } catch (e) {
            return null;
        }
    }
    return null;
}

Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "H+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        "S": this.getMilliseconds()
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

function convTime(str) {
	var nst = new Date(str);
	return nst.Format("yyyy-MM-dd HH:mm:ss");
}

function loadmore() {
	Loader.getMoreArticles();
}

function gohome() {
	window.location.href = '?';
}

function goback() {
	window.history.back();
}

function refresh() {
	window.location.reload();
}

// Backtop

var THRESHOLD = 50;
var $top = $('.back-to-top');

$(window).on('scroll', function () {
	$top.toggleClass('back-to-top-on', window.pageYOffset > THRESHOLD);
	var scrollTop = $(window).scrollTop();
	var docHeight = $('#content').height();
	var winHeight = $(window).height();
	var contentMath = (docHeight > winHeight) ? (docHeight - winHeight) : ($(document).height() - winHeight);
	var scrollPercent = (scrollTop) / (contentMath);
	var scrollPercentRounded = Math.round(scrollPercent*100);
	var scrollPercentMaxed = (scrollPercentRounded > 100) ? 100 : scrollPercentRounded;
	$('#scrollpercent>span').html(scrollPercentMaxed);
});

$top.on('click', function() {
	$('body').velocity('scroll');
});
