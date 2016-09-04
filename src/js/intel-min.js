export var intelligentRyan = (function(){
    function F(config){
        this.option = { //数据输出格式
            showWay : "",
            globalAda : false,
            border : [640,1136],
            cssUrl : [false,""],
            oID : "common_css_style",
            prefix : true,
            endcss : false,
            callback : function(){}
        };
        for(var i in config){
            this.option[i] = config[i];
        };
        var _this = this;

        this.function_list = {};    //窗口变化时的方法
        if(!!this.option.cssUrl[0]){
            $.ajax({
                url : this.option.cssUrl[1],
                dataType: "html",
                type: "GET",
                data: "",
                success: function(rst) {
                    _this.original_css = rst;   //原始的css数据
                    //$("head:first").append('<style type="text/css" id='+_this.option.oID+'></style>');
                    _this.initialization();
                    if(!!_this.option.callback)_this.option.callback();
                }
            });
        }else{
            this.original_css = $("#"+this.option.oID).text();   //原始的css数据
            _this.initialization();
            if(!!this.option.callback)this.option.callback();
        };
        this.change_window("adaptionChange",function(){
            if( /android/gi.test(navigator.userAgent.toLowerCase()) ){
                setTimeout(function(){
                    _this.initialization();
                },1000);
            }else{
                _this.initialization();
            };
        });
    };
    F.prototype.initialization = function(){  //初始化
        var _this = this;
        var original_css = this.original_css;

        this.window_width = $(window).width(),
        this.window_height = $(window).height();
        //css数据记录
        this.startdata = "";//original_css.substring(0, original_css.indexOf("/*startdom*/"));   //处理数据之前的数据
        this.maindata  = //original_css.substring(original_css.indexOf("/*startdom*/")+"/*startdom*/".length,original_css.indexOf("/*enddom*/"));   //需要处理的数据
        this.endOther  = //original_css.substring(original_css.indexOf("/*enddom*/")+"/*enddom*/".length);   //剩余其他的css
        this.newdata   = original_css;//(!!this.option.endcss)?(this.maindata+this.endOther):this.maindata;   //整理好的数据
        
        //浏览器前缀处理
        this.css_data_prefix();
        //处理css数据
        this.pixed_data_processing();
    };
    F.prototype.css_data_prefix = function(){   //浏览器前缀处理
        if(!this.option.prefix) return false;
        var css_data_usable = this.newdata;
        //当前浏览器支持的前缀名称数组
        var prefixName = "";
        //判断当前的浏览器对前缀的支持是哪种
        var vendors = [window.requestAnimationFrame,window.webkitRequestAnimationFrame,window.mozRequestAnimationFrame,window.msRequestAnimationFrame,window.oRequestAnimationFrame];
        $.each(vendors,function(i,val){
            if( !!val ){
                var strPrefix = String(val).toLowerCase();
                prefixName = strPrefix.match(/(webkit|moz|ms|o)+?(?=r)/gi); //正则处理得到浏览器支持的前缀名称
            };
        });
        //判断是否需要添加前缀
        if(!prefixName) return false;
        
        var _repalce = css_data_usable.replace(/(\{|\;|\@| )+(keyframes|animation|transform|transition|perspective|linear-gradient|overflow-scrolling)/gi,"<=&*&=>");
        var _match   = css_data_usable.match(/(\{|\;|\@| )+(keyframes|animation|transform|transition|perspective|linear-gradient|overflow-scrolling)/gi);

        if( !!_match ){
            css_data_usable = "";
            var css3str = _repalce.split("<=&*&=>");
            $.each(css3str,function(i,value){
                if( i == _match.length ){
                    css_data_usable += value;
                }else{
                    var elem = _match[i];
                    var result = elem.replace(/\{/gi,"{-"+prefixName+"-").replace(/@/gi,"@-"+prefixName+"-").replace(/(\; |\;)/gi,";-"+prefixName+"-");
                    css_data_usable += value + result;
                };
            });
        };
        
        this.newdata = css_data_usable;
    };
    F.prototype.pixed_data_processing = function(){   //处理css中pixed的数据
        //pixed处理
        var css_data_usable = this.newdata;
        var view_width = null;
        if(this.option.showWay === "showall"){   //宽度适配
            view_width = !!this.option.globalAda ? this.window_width : (this.window_width>this.option.border[0]?this.option.border[0]:this.window_width);
        }else if(this.option.showWay === "noborder"){   //高度适配
            var design_proportion = this.option.border[0]/this.option.border[1],    //设计比例
                window_proportion = this.window_width/this.window_height;   //窗口比例
            view_width = (design_proportion<window_proportion)?this.window_height*design_proportion:this.window_width;
        };
        
        var splitCss = css_data_usable.replace(/([\d\.]+)(?:px)/gi,"&&").split("&&");
        var matchCss = css_data_usable.match(/([\d\.]+)(?:px)/gi);
        if(!!matchCss){
            css_data_usable = "";  //默认清空
            for( var i=0,len=splitCss.length; i<len; i++ ){
                if( i == matchCss.length ){
                    css_data_usable += splitCss[i];
                }else{
                    //var comp = (parseInt(matchCss[i]) / this.num * this.viewWidth);
                    var result = (parseInt(matchCss[i]) / this.option.border[0]) * view_width; //Math.round(parseInt(matchCss[i]) / this.num * this.viewWidth) + "px";
                    if(result < 1 && result != 0){
                        css_data_usable += (splitCss[i] + 1) + "px";
                    }else{
                        css_data_usable += (splitCss[i] + result) + "px";
                    };
                    //css_data_usable += splitCss[i] + result;
                };
            };
        };
        this.newdata = css_data_usable;
        this.back_data_processing();
    };
    F.prototype.back_data_processing = function(){   //处理css数据
        var css_data_usable = this.newdata;
        var repalce = css_data_usable.replace(/\([a-zA-Z0-9-_/:.]+\.(jpg|png|gif)\)/gi,"<凸>").split("<凸>");
        var match = css_data_usable.match(/\([a-zA-Z0-9-_/:.]+\.(jpg|png|gif)\)/gi);
        
        if( !!match ){
            css_data_usable = "";
            $.each(repalce,function(i){
                if( i == match.length ){
                    css_data_usable += repalce[i];
                }else{
                    //var result = match[i].replace(/(\.\.\/)/gi,""); //去掉../
                    css_data_usable += repalce[i] + match[i];  //repalce[i] + "null";
                };
            });
        };
        this.newdata = css_data_usable;
        this.append_data_processing();
    };
    F.prototype.append_data_processing = function(){   //append处理,添加处理完毕之后最新的css数据
        //先清空后添加
        $("#"+this.option.oID).remove();
        $("head:first").append('<style type="text/css" id='+this.option.oID+'>'+(this.startdata+this.newdata)+'</style>');
        //$("#"+this.option.oID).text(this.startdata+this.newdata);
    };
    F.prototype.change_window = function(name,callback){ //改变窗口的时候
        var _this = this;
        this.function_list[name] = callback;

        var timer = "";
        if (typeof window.onorientationchange == "undefined") {
            window.onresize = function(){
                clearTimeout(timer);
                timer = setTimeout(function() {
                    for( var x in _this.function_list){
                        _this.function_list[x]();
                    };
                },50);
            };
        } else {
            window.onorientationchange = function() {
                if (window.orientation == 0 || window.orientation == 180 || window.orientation == 90 || window.orientation == -90) {
                    for( var x in _this.function_list){
                        _this.function_list[x]();
                    };
                };
            };
        };
    };

    return {
        init : function(config){
            return new F(config);
        }
    };
})();

// intelligentRyan.init({
//     showWay : "showall",
//     cssUrl : [true,"css/common.css"],
//     border : [640,1136]
// });