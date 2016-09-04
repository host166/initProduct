function wxshare(data) {

    wx.config({
        debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
        appId: data["appid"], // 必填，公众号的唯一标识
        timestamp: data["timestamp"], // 必填，生成签名的时间戳
        nonceStr: data["noncestr"], // 必填，生成签名的随机串
        signature: data["signature"], // 必填，签名，见附录1
        jsApiList: [
                'checkJsApi',
                'onMenuShareTimeline',
                'onMenuShareAppMessage',
                'onMenuShareQQ',
                'onMenuShareWeibo',
                'hideMenuItems',
                'showMenuItems',
                'hideAllNonBaseMenuItem',
                'showAllNonBaseMenuItem',
                'translateVoice',
                'startRecord',
                'stopRecord',
                'onRecordEnd',
                'playVoice',
                'pauseVoice',
                'stopVoice',
                'uploadVoice',
                'downloadVoice',
                'chooseImage',
                'previewImage',
                'uploadImage',
                'downloadImage',
                'getNetworkType',
                'openLocation',
                'getLocation',
                'hideOptionMenu',
                'showOptionMenu',
                'closeWindow',
                'scanQRCode',
                'chooseWXPay',
                'openProductSpecificView',
                'addCard',
                'chooseCard',
                'openCard'
            ] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
    });
    wx.ready(function() {
        wx.onMenuShareTimeline({
            title: sharelist.title,
            link: sharelist.link, //data["url"],
            imgUrl: sharelist.imgUrl,
            trigger: function(res) { //用户点击分享到朋友圈

            },
            success: function(res) { //用户确认分享后执行的回调函数

            },
            cancel: function(res) { //用户取消分享后执行的回调函数

            },
            fail: function(res) {
                //alert(JSON.stringify(res));
            }
        });
        wx.onMenuShareAppMessage({
            title: sharelist.title, // 分享标题
            desc: sharelist.desc, // 分享描述
            link: sharelist.link, //data["url"], // 分享链接
            imgUrl: sharelist.imgUrl, // 分享图标
            success: function() {
                // 用户确认分享后执行的回调函数
            },
            cancel: function() {
                // 用户取消分享后执行的回调函数
            }
        });

    });
};