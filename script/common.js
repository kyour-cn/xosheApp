/**
 * 云安APP端公共脚本 34.8M
 * verson 0.3.45
 * @author 李世靖 kyour@vip.qq.com
 * 每个页面必须引入本文件，以确保程序正常运行
 * 部分方法依赖于 api.js
 */
'use strict'; //启用严格模式
const APP_ID = 'A6044910518982'; //AC平台的APPid

const maxDistance = 40;		     //巡查、处警最大坐标偏移/米

const appName = "Kyour";
var IOS_EXAMINE = true;          //ios审核时开启

var apikey,
	isDebug; //是否调试模式 - 自动识别

var host = getHost();//主域名
var res_host = getHost('res');//资源域名域名

//获取域名
function getHost(type) {

	//默认为main
	if (type == null) {
		type = 'main';
	}
	var host = {
		main: 'http://tp6.cloud-an.com',
		res: 'http://oss.cloud-an.com',
		// ws  : 'ws://ws.cloud-an.com:8101/apps'
	};
	return host[type];
}

//http安全访问 (添加header) 继承原生api.ajax
function sefeAjax(params, callback) {

	if (isDebug)
		console.log('HTTP访问：' + params.url);
	//从加密文件获取秘钥
	if (typeof apikey == "undefined")
		apikey = api.loadSecureValue({
			sync: true,
			key: 'ApiKey'
		});
	//将秘钥加入请求头
	if (!params.not_headkey) {
		if (params.headers) {
			params.headers.APIKEY = apikey;//将秘钥添加至Header
		} else {
			params.headers = { APIKEY: apikey };
		}
	}

	// 设置缓存开启
	// params.cache = true;

	//超时时间
	if (!params.timeout)
		params.timeout = 10;

	//开始请求
	api.ajaxx(params, callback);
}

//调试对象
function dump(data, isprint) {
	var str = JSON.stringify(data);
	alert(str);
	if (isprint) {
		console.log(str);
	}
}

//显示ajax错误
function derr(err, msg) {
	// if(err.code == 1 && err.statusCode == 0){
	// 	toast('请重试:'+err.body);
	// }
	if (isDebug) {
		alert('Err：' + err.body);
	} else {
		toast(msg ? msg : '网络连接错误');
	}
}

//弹出底部提示
function toast(text, location) {
	api.toast({
		msg: text,
		duration: 2500,
		location: location ? location : 'bottom'
	});
}

function getHis(ns) {

	if (!ns) {
		return '';
	}
	var d, s;
	d = new Date(parseInt(ns) * 1000);
	s = d.getFullYear() + "-";
	s += ("0" + (d.getMonth() + 1)).slice(-2) + "-";
	s += ("0" + d.getDate()).slice(-2) + " ";
	s += ("0" + d.getHours()).slice(-2) + ":";
	s += ("0" + d.getMinutes()).slice(-2) + ":";
	s += ("0" + d.getSeconds()).slice(-2);

	return s;

}

function getHi(ns) {

	var h = parseInt(ns / 3600);
	h = h < 10 ? '0' + h : h;
	var m = parseInt(ns % 3600 / 60);
	m = m < 10 ? '0' + m : m;
	return h + ':' + m;

}

function getYmd(ns, str) {
	var d, s;
	if (!str) {
		str = '.';
	}
	d = new Date(parseInt(ns) * 1000);
	s = d.getFullYear() + str;
	s += ("0" + (d.getMonth() + 1)).slice(-2) + str;
	s += ("0" + d.getDate()).slice(-2);
	return s;
}

//判断是否json
function isJSON(str) {
	try {
		var obj = JSON.parse(str);
		return { status: true, data: obj };
	} catch (e) {
		return { status: false };
	}
}

//判断数组中是否存在某值
function isInArray(arr, value) {
	for (var i in arr) {
		if (arr[i] == value) {
			return true;
		}
	}
	return false;
}

//打开默认窗口函数
function openWin(name, url, param, isreload) {
	api.openWin({
		reload: isreload ? true : false,
		name: name,
		url: url,
		overScrollMode: 'scrolls', //设置页面滚动到头部或尾部时，显示回弹阴影效果的模式，仅Android有效。
		pageParam: (param == null ? {} : param)
	});
}

/**
 * 功能封包 @李世靖 kyour@vip.qq.com
*/
(function (w) {

	//定义api加载完成事件 (js是函数先行，即便页面中定义了apiready函数也会被此处覆盖)
	w.apiready = function () {

		//存在关闭页面按钮 - 添加点击事件
		var close = $api.byId('close-win');
		if (close) {
			$api.addEvt(close, "click", function () {
				api.closeWin();
			});
		}

		//非ios系统 或 非ios审核版本
		if (api.systemType != 'ios' || $tools.readData('ios_examine') == '0') {
			//关闭审核模式
			IOS_EXAMINE = false;
		}

		//判断是否为测试版Loader
		if (String(api.appVersion).indexOf('00.0') == -1) {
			//正式版
			isDebug = false;

			console.log = console.w = function () { };
		} else {
			//测试版Loader
			isDebug = true;

			//打印页面路径 方便调试
			var path = window.document.location.href.split(APP_ID);
			console.w('当前页路径：' + path[1]);
		}

		//ajax更换为安全访问方法
		api.ajaxx = api.ajax;
		api.ajax = sefeAjax;

		//原生alert改名print 执行会暂停js进程
		window.print = window.alert;

		//弹出提示框 title选填 callback回调选填
		window.alert = function (msg, title, callback) {
			api.alert({
				title: title == null ? '提示' : title,
				msg: msg,
			}, callback);
		}

		//设置状态栏颜色 - light,dark
		api.setStatusBarStyle({
			style: 'light'
		});

		var headrr_ready = function () {
			//适配顶部导航栏优化
			var dom_v2 = $api.dom('.aui-bar-nav');
			var dom_v3 = $api.dom('.aui-header-bar');
			var padd = $api.dom('.padd-header');

			var dom = dom_v2 ? dom_v2 : dom_v3;

			if (dom && padd) {//必须两个元素都存在
				dom.style.paddingTop = api.safeArea.top + 'px';

				var padd_top = dom.clientHeight;
				padd.style.paddingTop = padd_top - 1 + 'px';
				padd.setAttribute('set_height', padd_top - 1);

			}
		}
		headrr_ready();

		// setTimeout(headrr_ready,500);

		//如果在页面中定义了myready函数则执行
		if (typeof myready === "function") {
			myready();
		}

	}

	//**************函数封装**************
	var g = {};//$tools对象

	//安全传输 - 使用signature模块进行des-ecs加密、解密
	g.desEncode = function (data, key) {
		var signature = api.require('signature');
		if (!key) key = api.loadSecureValue({
			sync: true,
			key: 'encodeKey'
		});
		return signature.desECBSync({
			data: data,
			key: key
		});
	}
	g.desDecode = function (data, key) {
		var signature = api.require('signature');
		if (!key) key = api.loadSecureValue({
			sync: true,
			key: 'encodeKey'
		});
		return signature.desDecodeECBSync({
			data: data,
			key: key
		});
	}

	//将jq的serialize(Array)方法数据转换为api.ajax格式的json对象 @李世靖
	g.serialize2Json = function (data, notdeurl) {

		if (typeof data == 'object') {
			//data类型为对象，结构调整
			var json = {};
			for (var i in data) {
				json[data[i].name] = data[i].value;
			}
			return json;
		} else if (typeof data == 'string') {
			//data类型为字符串，按序列化参数处理
			var list = String(data).split('&');
			var res = {};
			for (var i in list) {
				var a = list[i];

				var s = a.indexOf('=');
				var k = a.substring(0, s);
				var v = a.substring(s + 1, a.lenght);
				if (!notdeurl) v = decodeURI(v);

				if (k && v) {
					if (s == -1) {
						res[v] = '';
					} else {
						res[k] = v;
					}
				}
			}
			return res;
		}
	}

	//返回头像地址 type = 1:返回拆分的uid
	g.getAvatarUrl = function (uid, type) {

		var str = String(uid);
		//保留3位尾数
		var a = str.substr(0, str.length - 3);
		var b = str.substr(str.length - 3);
		var uid = b;
		if (a) {
			uid = a + '/' + b;
		}
		return type ? uid : 'uploads/avatar/' + uid + '.jpg';

	}

	//打开Progress 弹出框 type: 遮罩是否禁止操作
	g.loading = function (type, msg) {
		//延时100ms 否则不显示
		setTimeout(function () {
			api.showProgress({
				title: msg == null ? '努力加载中...' : msg,
				text: '请稍等',
				modal: type == 1 ? false : true
			});
		}, 300)
	};

	//关闭Progress 弹出框
	g.hideload = function () {
		//延时100ms 否则会出现无法关闭
		setTimeout(function () {
			api.hideProgress();
		}, 300);
	}

	/* 打开系统设置页面
	   1：打开设置页面 2：打开当前应用的详情页面 3：打开应用管理页面 4：打开蓝牙设置页面 5：打开日期时间设置页面
	   6：打开手机状态页面 7：打开显示设置页面 8：打开存储状态页面 9：打开位置设置页面 10：打开声音设置页面 11：打开wifi设置页面
	*/
	g.openSysSet = function (id) {
		var openset = api.require('openSet');
		openset.open({
			id: id
		});
	}

	//返回弹出对话框合适的尺寸
	g.getToastSize = function () {
		size = {};
		size.w = api.winWidth - parseInt(api.winWidth / 5);
		size.h = api.winHeight - parseInt(api.winHeight / 3.5);
		return size;
	}

	//存文件 文件名,数据,是否保存json对象
	g.saveData = function (name, data, isjson) {

		//是否转为json
		data = isjson ? JSON.stringify(data) : data;

		this.saveToFile('fs://cache_data/' + name + '.txt', String(data));

	}

	g.saveToFile = function (file, data) {
		api.writeFile({
			path: file,
			data: String(data)
		}, function (ret, err) {
			if (ret.status) {
				//成功
			} else {
				toast('数据保存失败！');
			}
		});
	}

	//取文件 文件名,是否返回json对象
	g.readData = function (name, isjson) {
		var data = api.readFile({
			sync: true,
			path: 'fs://cache_data/' + name + '.txt'
		});
		if (data == '') return '';//为空
		if (isjson) return JSON.parse(data);//返回将json字符串转换的对象
		return data;
	}

	//查看图片大图 path = 图片链接 或 数组
	g.openImage = function (path) {
		//判断是否不是数组
		if (!Array.isArray(path)) {
			path = [path];
		}
		var iB = api.require('imageBrowser');
		iB.openImages({
			imageUrls: path
		});
	}

	//文字合成语音并播放
	g.playText = function (msg) {
		//科大讯飞模块
		var iflyRecognition = api.require('iflyRecognition');
		iflyRecognition.createUtility({
			ios_appid: '5b753d7f',
			android_appid: '5b63ef66'
		}, function (ret2, err) {
			if (ret2.status) {
				iflyRecognition.read({
					readStr: msg,
					speed: 60,
					volume: 60,
					voice: 'xiaoyan',
					rate: 16000
				}, function (ret, err) {
					if (ret.status) {
						ret.speakProgress
					} else {
						toast(err.msg);
					}
				})
			}
		})
	}

	//获取对象长度
	g.getJsonLength = function (j) {
		var l = 0;
		for (var item in j) {
			l++;
		}
		return l;
	}

	g.isIos = function () {
		return (api.systemType == 'ios');
	}

	//封装image选择/拍摄功能
	g.chooseImg = function (backhook) {
		api.actionSheet({
			title: '选择图片',
			cancelTitle: '取消',
			buttons: ['拍照', '从手机相册选择']
		}, function (ret, err) {
			if (ret) {
				if (ret.buttonIndex == 1) { // 拍照
					api.getPicture({
						sourceType: 'camera',
						encodingType: 'jpg',
						mediaValue: 'pic',
						allowEdit: false,
						// destinationType: 'base64',
						quality: 50
					}, function (ret, err) {
						if (ret) {
							backhook(ret.data)
							// alert(ret.data);
						} else {
							alert("选取失败，请重试！");
						}
					});
				} else if (ret.buttonIndex == 2) { // 从相机中选择
					api.getPicture({
						sourceType: 'library',
						encodingType: 'jpg',
						mediaValue: 'pic',
						// destinationType: 'base64',
						quality: 50
					}, function (ret, err) {
						if (ret) {
							backhook(ret.data)
						} else {
							alert("选取失败，请重试！");
						}
					})
				}
			}
		});
	}

	//打开背景frame 用于弹动窗口 默认白色
	g.openbg = function (param) {
		api.openFrame({
			name: 'bg',
			url: 'widget://html/main/bg.html',
			bounces: false,
			rect: {
				x: 0,
				y: 'auto',
				w: 'auto',
				h: frameH
			},
			pageParam: param
		});
	}

	//动态加载js
	g.loadJs = function (url, callback) {
		var script = document.createElement('script');
		script.type = "text/javascript";
		if (typeof (callback) != "undefined") {
			if (script.readyState) {
				script.onreadystatechange = function () {
					if (script.readyState == "loaded" || script.readyState == "complete") {
						script.onreadystatechange = null;
						callback();
					}
				}
			} else {
				script.onload = function () {
					callback();
				}
			}
		}
		script.src = url;
		document.body.appendChild(script);
	}

	//window对象添加 $tools
	w.$tools = g;

	//**************排序**************
	var s = {};

	//数组随机排序法 用法：$sort.random($sort.random);
	s.random = function (a, b) {
		//用Math.random()函数生成0~1之间的随机数与0.5比较，返回-1或1
		return Math.random() > .5 ? -1 : 1;
	}

	//window对象添加 $sort
	w.$sort = s;

})(window);
