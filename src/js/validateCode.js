export var validateFunction = (function(){
    function F(config){
        this.option = { //出厂设置
            oBtn : undefined,
            ismobile : undefined,
            texts : ["获取验证码","重发"],
            ajaxjson : {
                url : "",
                dataType : "",
                types : "",
                args : "",
                fn : function(){}
            },
            times : 60
        };
        for( var i in config ){
            this.option[i] = config[i];
        };

        this.common();
    };

    F.prototype.common = function(){
        this.mesCountBoolean = false;   //用于点击发送验证码开关的锁
        this.keyBoolean = false;

        var _this = this,
            _elem = this.option,
            slowdown = _elem.times;   //倒计时

        _elem.oBtn.unbind().bind("click", function () {
            var _btnthis = $(this);
            var regPhone = !/((^1\d{10}$)|(^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$))/gi.test( _elem.ismobile.val() );
            if (regPhone) {
                alert("账号输入格式不正确");
                return false;
            };
            if (!!_this.keyBoolean) return false;
            _this.keyBoolean = true;

            //重发中
            _btnthis.text(_elem.texts[1] + "(" + (slowdown) + ")");
            _this.ajaxMessagePost(_elem.ismobile.val());
            _this.mesCountBoolean = false;
            //计时器
            _this.saveTimeline(1,function(){
                var cnum = --slowdown;
                if (cnum <= 0) {
                    //暂停计时器
                    _this.mesCountBoolean = true;
                    //恢复设置
                    _this.keyBoolean = false;
                    slowdown = _elem.times;
                    _btnthis.text(_elem.texts[0]);
                    return false;
                };
                //计时中
                _btnthis.text(_elem.texts[1] + "(" + cnum + ")");
            });
        });
    };

    F.prototype.ajaxMessagePost = function(pnum){   //pnum 手机号码
        var _elem = this.option;
        // window.phoneNumberCode = pnum;
        //1：请求的链接  2：请求的数据类型  3：请求方式  4：参数  5：传回来的值data和回调方法
        // console.log(_elem.ajaxjson.url+"?"+_elem.ajaxjson.args,_elem.ismobile.val());
        $.ajax({
            crossDomain : true,
            async : true,
            dataType : _elem.ajaxjson.dataType,
            type : _elem.ajaxjson.types,
            url : _elem.ajaxjson.url,
            data : _elem.ajaxjson.args+pnum,
            success: function (rst) {
                if (!!_elem.ajaxjson.fn) _elem.ajaxjson.fn(rst);
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                //if (!!fn2) fn2(XMLHttpRequest, textStatus, errorThrown);
            }
        });
    };
    F.prototype.saveTimeline = function(t,fn){
        var _this = this;
        _this.mesCountBoolean = false;
        _animate();
        function _animate() {
            if (!!_this.mesCountBoolean) return false;
            var startTime = _this.now(),
                timer = "";
            clearInterval(timer);
            timer = setInterval(function () {
                var changeTime = new Date(),
                    second = t * 1000;    //秒
                var scale = 1 - Math.max(0, startTime - changeTime + second) / second;

                if (scale == 1) {
                    clearInterval(timer);
                    if (!!fn) fn();
                    _animate();
                };
            }, 1000 / 60);
        };    
    };
    F.prototype.now = function () {
        return (new Date()).getTime();
    };
    return {
        init : function(options){
            return new F(options);
        }
    };
})();
//验证码发送
/*validateFunction.init({
    oBtn : validate_button,
    ismobile : inputphoneval,
    texts : ["获取验证码","重发"],
    ajaxjson : {
        url : "http://cmsact.locojoy.com/mt3/zhaomu/send_mobilecode",
        dataType : "jsonp",
        types : "POST",
        args : "&token="+token+"&mobile=",
        fn : function(rst){
            if( rst.errno != "" ){
                alert(rst['message']);
            }else{
                var data = rst['data'];
                //初始话接口获取数据
                token = data['token'];
            };
        }
    },
    times : 60
});*/