//通用工具集合
var pub_tools = (function(){
    //处理数组获取最大最小值
    Array.prototype.max = function() {
        return Math.max.apply(null, this);
    };
    Array.prototype.min = function() {
        return Math.min.apply(null, this);
    };
    //trim去除字符创两端空格
    String.prototype.trim=function(){
        return this.replace(/(^\s*)|(\s*$)/g, "");
    };
    //indexOf 兼容ie
    if(!Array.indexOf){    
        Array.prototype.indexOf = function(obj) {
            for (var i = 0; i < this.length; i++) {
                if (this[i] == obj) {
                    return i;
                };
            };
            return -1;
        };
    };

    //js事件绑定方法
    var addEventBind = function(element,type,handler) {
        if (window.addEventListener) {
            element.addEventListener(type, handler, false);
        } else {
            element.attachEvent("on" + type, handler.bind( element, window.event) );
        };
    };
    //window.onload可重用方法
    var addLoadEvent = function(func){
        var oldonload = window.onload;
        if (typeof window.onload != "function") {
            window.onload = func;
        } else {
            window.onload = function() {
                oldonload();
                func();
            };
        };
    };
    //兼容屏幕变化的脚本 主要用于移动设备
    var orientationJson = {};
    var autoWindowSize = function(name,fn){
        orientationJson[name] = fn;
        var timer = "";
        if (typeof window.onorientationchange == "undefined") {
            window.onresize = function(){
                clearTimeout(timer);
                timer = setTimeout(function() {
                    for( var x in orientationJson){
                        orientationJson[x]();
                    };
                },50);
            };
        } else {
            window.onorientationchange = function() {
                if (window.orientation == 0 || window.orientation == 180 || window.orientation == 90 || window.orientation == -90) {
                    for( var x in orientationJson){
                        orientationJson[x](window.orientation);
                    };
                };
            };
        };
    };
    //模拟mouseenter和mouseleave方法 ele为目标元素，type为事件类型不用'on'，func为事件响应函数  
    var addEvent = function(ele,type,func){  
        if(window.document.all)   
            ele.attachEvent("on"+type,func);//ie系列直接添加执行  
        else{//ff  
            if(type==='mouseenter'){
                ele.addEventListener("mouseover",withoutChildFunction(func),false);  
            }else if(type==="mouseleave"){
                ele.addEventListener("mouseout",withoutChildFunction(func),false);  
            }else{ 
                ele.addEventListener(type,func,false);  
            };      
        };

        function withoutChildFunction(func){  
            return function(e){  
                var parent=e.relatedTarget;//上一响应mouseover/mouseout事件的元素  
                while(parent!=this&&parent){//假如存在这个元素并且这个元素不等于目标元素（被赋予mouseenter事件的元素）  
                    try{  
                        parent=parent.parentNode;}//上一响应的元素开始往上寻找目标元素  
                    catch(e){  
                        break;  
                    };
                };
                if(parent!=this);    //以mouseenter为例，假如找不到，表明当前事件触发点不在目标元素内  
                func(e);    //运行目标方法，否则不运行  
            }  
        };
    };
    //原声js获取window窗口高度和宽度
    var vQueryWindowSize = (function(){
        var width,height;
        //获取窗口宽度
        width = (window.innerWidth) ? window.innerWidth : ( (document.body&&document.body.clientWidth)?document.body.clientWidth:0);
        //获取窗口高度
        height = (window.innerHeight) ? window.innerHeight : ( (document.body && document.body.clientHeight)?document.body.clientHeight:0 );
        //通过深入 Document 内部对 body 进行检测，获取窗口大小
        if( (document.documentElement && document.documentElement.clientHeight && document.documentElement.clientWidth) ){
            width = document.documentElement.clientWidth;
            height = document.documentElement.clientHeight;
        };

        return {
            width : width,
            height : height
        };
    })();
    //用于图片对象加载
    var imagesLoaded = function(obj,fn){
        var appname = navigator.appName.toLowerCase();
        if( appname.indexOf("netscape") == -1 ){  //IE
            obj.onreadystatechange = function () {
                if( obj.readyState == "complete" ){
                    if(!!fn) fn();
                };
            };
        }else{
            obj.onload = function () {
                if( !!obj.complete ){
                    if(!!fn) fn();
                };
            };
        };
    };
    //判断是否支持html5
    var isSupportHTML5 = function(sfn,nfn){
        return !!window.applicationCache ? sfn(): nfn();   //为true是支持
    };
    //获取路由参数--链接中的指定参数
    var getUrlParam = function(name){
        var url = window.location.search.substr(1),
            reg = /([^\?\=\&]+)\=([^\?\=\&]*)/g,
            obj = {};
        while( reg.exec(url) != null ){
            obj[RegExp.$1] = RegExp.$2;
        };
        return obj[name];
    };
    //ajax数据调用方法 -- 原生javascript
    var ryanAjax = function(options){   //参数：url；type：data：dataType；success：fail： POST|{}|"json"
        options = options || {};
        options.type = (options.type || "GET").toUpperCase();
        options.dataType = options.dataType || "json";
        var params = formatParams(options.data);

        //创建 - 非IE6 - 第一步
        if (window.XMLHttpRequest) {
            var xhr = new XMLHttpRequest();
        } else { //IE6及其以下版本浏览器
            var xhr = new ActiveXObject('Microsoft.XMLHTTP');
        };

        //接收 - 第三步
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                var status = xhr.status;
                if (status >= 200 && status < 300) {
                    options.success && options.success(xhr.responseText, xhr.responseXML);
                } else {
                    options.fail && options.fail(status);
                };
            };
        };

        //连接 和 发送 - 第二步
        if (options.type == "GET") {
            xhr.open("GET", options.url + "?" + params, true);
            xhr.send(null);
        } else if (options.type == "POST") {
            xhr.open("POST", options.url, true);
            //设置表单提交时的内容类型
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.send(params);
        };
        //格式化参数
        function formatParams(data) {
            var arr = [];
            for (var name in data) {
                arr.push(encodeURIComponent(name) + "=" + encodeURIComponent(data[name]));
            };
            arr.push(("v=" + Math.random()).replace(".",""));
            return arr.join("&");
        };
    };
    //ajax数据调用方法 -- jQuery版本
    var queryAjaxFunc = function(url,dataType,types,args,fn1,fn2){
        $.ajax({
            crossDomain: true,
            dataType: dataType,
            type: types,
            url : url,
            data: args,
            success: function(rst) {
                if(!!fn1) fn1(rst);
            },
            error : function(XMLHttpRequest, textStatus, errorThrown){
                //ajaxIncludeFunc(url,dataType,gets,getData,callback);    //重新请求
                if(!!fn2) fn2(XMLHttpRequest, textStatus, errorThrown);
                // console.log("无法打开，请检查网络是否存在问题。");
            }
        });
    };
    //根据本地时间getTime()方法的计时器
    var timelineObject = {};
    var vQueryTimes = function(n,t,fn){
        timelineObject[n] = _timelinefunc;  //timelineObject={}; 对象
        function _timelinefunc(){
            var startTime = (new Date()).getTime(),
                timer = timelineObject[n];
            timer = setInterval(function(){
                var changeTime = new Date(),
                    second = t * 1000,
                    scale = 1 - Math.max(0,startTime - changeTime + second) / second;

                if( scale == 1 ){
                    clearInterval(timer);
                    timelineObject[n] = null;
                    delete timelineObject[n];   //删除对象
                    if(!!fn) fn();
                };
            },1000/60);
        };
        for( var i in timelineObject ){
            timelineObject[i]();
        };
    };
    //拖拽执行的时候用来判断方向
    var swipeDirection = function(x1, x2, y1, y2){
        return Math.abs(x1 - x2) >= Math.abs(y1 - y2) ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down');
    };
    //适配宽度的设计
    var elastic = function(pixel,direction){
        if( direction === "width" ){
            return [pixel]*vQueryWindowSize.width;
        }else if( direction === "height" ){
            alert("高度方法暂不支持");  //求设计图比值；页面宽高比值
        }else{
            alert("调用的elastic方法中参数错误!");
        };
    };
    //获得元素id或class
    var getID = function(oName){
        return document.querySelector(oName) || document.getElementById(oName.replace(/(\#|\.)/gi,""));
    };
    //原生js模拟添加class方法
    var isClassName = (function(){
        var hasClass = function(obj, cls) {  
            return obj.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));  
        };
        var addClass = function(obj, cls) {  
            if (!hasClass(obj, cls)) obj.className += " " + cls;  
        };
        var removeClass = function(obj, cls) {  
            if (hasClass(obj, cls)) {  
                var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');  
                obj.className = obj.className.replace(reg, ' ');  
            };
        };
        var toggleClass = function(obj,cls){  
            if(hasClass(obj,cls)){  
                removeClass(obj, cls);  
            }else{  
                addClass(obj, cls);  
            };
        };

        return {
            addClass : addClass,
            removeClass : removeClass,
            toggleClass : toggleClass
        }
    })();
    //深度克隆一个对象的属性
    var deepClone = function(cloneObj){
        function _clone(){};
        _clone.prototype = cloneObj;
        var obj = new _clone();
        for( var i in obj ){
            if( typeof(obj[i]) == "object" ){
                obj[i] = deepClone(obj[i]);
            };
        };
        return obj;
    };
    //深度克隆的另外一个方法 递归调用
    var deepCopy = function(p,c){
        var c = c || {};
        for( var i in p ){
            if( typeof p[i] === "object" ){

                c[i] = (p[i].constructor===Array)?[]:{};
                deepCopy(p[i],c[i]);

            }else{
                c[i] = p[i];
            };
        };
        return c;
    };
    //冒泡排序
    var bubbleSort = function(arr) {
        var flag = true;
        var len = arr.length;
        for (var i = 0; i < len - 1; i++) { //i=0,1; arr[i]=1,0;
            flag = true;
            for (var j = 0; j < len - 1 - i; j++) {     //len=3; j=0,1|0; arr[j]=1,0|1
                if( arr[j] > arr[j+1] ){
                    var temp = arr[j+1];    //先记录了 对应下标中j和j+1对比中j>j+1的值
                    //两步操作 下标1中变为下标0中的值
                    //下标0中变成之前保存在变量中的下标1中的值
                    //然后通过对比 前者大于后者的规则来排序
                    arr[j+1] = arr[j];
                    arr[j] = temp;
                    flag = false;
                };
            };
            if(flag) break;
        }
        // console.log(arr);
    };
    //检测数据类型
    var constructorType = function(o){
        var _toString = Object.prototype.toString;
        var _type ={
            "undefined": "undefined",
            "number": "number",
            "boolean": "boolean",
            "string": "string",
            "[object Function]": "function",
            "[object RegExp]": "RegExp",
            "[object Array]": "Array",
            "[object Date]": "Date",
            "[object Error]": "Error"
        };
        return _type[typeof o] || _type[_toString.apply(o)] || (o?"object":"null")
    };
    //匹配这些中文标点符号 。 ？ ！ ， 、 ； ： “ ” ‘ ' （ ） 《 》 〈 〉 【 】 『 』 「 」 ﹃ ﹄ 〔 〕 … — ～ ﹏ ￥
    var chinesePun = function(txt){
        var reg = /[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/gi;
        return reg.test(txt);
    };
    //检测hash变化
    var ryanRouterHash = function(func){
        var oldonhashchange = window.onhashchange;
        if (typeof window.onhashchange != "function") {
            window.onhashchange = func;
        } else {
            window.onhashchange = function() {
                oldonhashchange();
                func();
            };
        };
    };
    //
    /**
     * 新建、追加、删除、改变hash的值
     * newadd : 添加hash
     * append : 追加hash
     * empty : 删除指定hash
     *
     * pub_tools.setRyanRouter("newadd",{
     *     "user" : "10000000"
     * });
     * 
     */
    var setRyanRouter = function(staname,arg){
        var option = {};

        //操作路由 返回当前路由的值
        (function(){
            var url = window.location.hash.substr(1),
                obj = {},
                reg = /([^\?\#\=\&]+)\=([^\?\#\=\&]*)/gi;
            var str = "",
                num = 0;
            while( reg.exec(url) != null ){ //遍历 去重
                obj[RegExp.$1] = RegExp.$2;
            };
            for( var x in obj ){    //重新组合
                if( typeof obj[x] === "undefined" ){
                    return false;
                };
                if( num == 0 ){
                    str += x+"="+obj[x];
                }else{
                    str += "&"+x+"="+obj[x];
                };
                num++;
            };
            option = pub_tools.deepCopy(obj);   //深度复制
            // return option;
        })();
        
        //遍历对象操作
        for( var i in arg ){
            option[i] = arg[i]
        };

        //新加操作
        if( staname == "newadd" ){
            //协议 + 路径
            // var winOriginPathname = location.origin+location.pathname;
            location.hash = pub_tools.formatParam(arg);
        };
        //追加操作
        if( staname == "append" ){
            location.hash = pub_tools.formatParam(option);
        };
    };
    

    //事件回调方法
    return {
        addEventBind : addEventBind,
        addLoadEvent : addLoadEvent,
        autoWindowSize : autoWindowSize,
        imagesLoaded : imagesLoaded,
        isSupportHTML5 : isSupportHTML5,
        getUrlParam : getUrlParam,
        ryanAjax : ryanAjax,
        queryAjaxFunc : queryAjaxFunc,
        vQueryTimes : vQueryTimes,
        vQueryWindowSize : vQueryWindowSize,
        swipeDirection : swipeDirection,
        bubbleSort : bubbleSort,
        elastic : elastic,
        deepCopy : deepCopy,
        deepClone : deepClone,
        getID : getID,
        constructorType : constructorType,
        chinesePun : chinesePun,
        addEvent : addEvent,
        ryanRouterHash : ryanRouterHash,
        setRyanRouter : setRyanRouter
    };
})();

//通用UI方法集合  依赖于pub_tools方法
var ui_tools = (function(){
    //加载等待进度条
    var loadingBar = function(oID,loadQueue,everyfn,onefn){
        var myLoad = pub_tools.getID(oID),
            queue = loadQueue || [],
            thispage = 0;

        var addImgSrc = function(){ //附加图片链接的操作方法
            if(!queue||queue.length==0) return false;
            var newImg = new Image();   //构建图片对象
            pub_tools.imagesLoaded(newImg,function(){ //图片加载完毕的时候
                thispage++;
                var number = Math.round(thispage/queue.length*100);
                if(!!everyfn) everyfn(number);    //执行成功一次返回一次数据
                //全部执行完毕的时候
                if( thispage == queue.length ){
                    myLoad.style.display = "none";
                    if(!!onefn) onefn();
                    return false;
                };
                addImgSrc();
            });
            newImg.src = queue[thispage]; 
        };
        addImgSrc();
    };
    //DOM3级事件滚轮方法
    var myMouseweel = function(){

    };
    //DOM3级事件页面滚动方法
    var myMouseScroll = function(fn){
        var win = window || document,
            delay = null;

        var callfuncs = function(){
            clearTimeout(delay);
            delay = setTimeout(function(){
                if(!!fn) fn(document.body.scrollTop || document.documentElement.scrollTop);  
            },100);
        };    
        win.removeEventListener("scroll",callfuncs,false);
        win.addEventListener("scroll",callfuncs,false);
        
        callfuncs = null;
    };
    //template前端模板引擎引用
    var bt_tpl = function(){
        var baidu=typeof module==='undefined'?(window.baidu=window.baidu||{}):module.exports;baidu.template=function(str,data){var fn=(function(){if(!window.document){return bt._compile(str)};var element=document.getElementById(str);if(element){if(bt.cache[str]){return bt.cache[str]};var html=/^(textarea|input)$/i.test(element.nodeName)?element.value:element.innerHTML;return bt._compile(html)}else{return bt._compile(str)}})();var result=bt._isObject(data)?fn(data):fn;fn=null;return result};var bt=baidu.template;bt.versions=bt.versions||[];bt.versions.push('1.0.6');bt.cache={};bt.LEFT_DELIMITER=bt.LEFT_DELIMITER||'<%';bt.RIGHT_DELIMITER=bt.RIGHT_DELIMITER||'%>';bt.ESCAPE=true;bt._encodeHTML=function(source){return String(source).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\\/g,'&#92;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')};bt._encodeReg=function(source){return String(source).replace(/([.*+?^=!:${}()|[\]/\\])/g,'\\$1')};bt._encodeEventHTML=function(source){return String(source).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/\\\\/g,'\\').replace(/\\\//g,'\/').replace(/\\n/g,'\n').replace(/\\r/g,'\r')};bt._compile=function(str){var funBody="var _template_fun_array=[];\nvar fn=(function(__data__){\nvar _template_varName='';\nfor(name in __data__){\n_template_varName+=('var '+name+'=__data__[\"'+name+'\"];');\n};\neval(_template_varName);\n_template_fun_array.push('"+bt._analysisStr(str)+"');\n_template_varName=null;\n})(_template_object);\nfn = null;\nreturn _template_fun_array.join('');\n";return new Function("_template_object",funBody)};bt._isObject=function(source){return'function'===typeof source||!!(source&&'object'===typeof source)};bt._analysisStr=function(str){var _left_=bt.LEFT_DELIMITER;var _right_=bt.RIGHT_DELIMITER;var _left=bt._encodeReg(_left_);var _right=bt._encodeReg(_right_);str=String(str).replace(new RegExp("("+_left+"[^"+_right+"]*)//.*\n","g"),"$1").replace(new RegExp("<!--.*?-->","g"),"").replace(new RegExp(_left+"\\*.*?\\*"+_right,"g"),"").replace(new RegExp("[\\r\\t\\n]","g"),"").replace(new RegExp(_left+"(?:(?!"+_right+")[\\s\\S])*"+_right+"|((?:(?!"+_left+")[\\s\\S])+)","g"),function(item,$1){var str='';if($1){str=$1.replace(/\\/g,"&#92;").replace(/'/g,'&#39;');while(/<[^<]*?&#39;[^<]*?>/g.test(str)){str=str.replace(/(<[^<]*?)&#39;([^<]*?>)/g,'$1\r$2')}}else{str=item}return str});str=str.replace(new RegExp("("+_left+"[\\s]*?var[\\s]*?.*?[\\s]*?[^;])[\\s]*?"+_right,"g"),"$1;"+_right_).replace(new RegExp("("+_left+":?[hvu]?[\\s]*?=[\\s]*?[^;|"+_right+"]*?);[\\s]*?"+_right,"g"),"$1"+_right_).split(_left_).join("\t");if(bt.ESCAPE){str=str.replace(new RegExp("\\t=(.*?)"+_right,"g"),"',typeof($1) === 'undefined'?'':baidu.template._encodeHTML($1),'")}else{str=str.replace(new RegExp("\\t=(.*?)"+_right,"g"),"',typeof($1) === 'undefined'?'':$1,'")};str=str.replace(new RegExp("\\t:h=(.*?)"+_right,"g"),"',typeof($1) === 'undefined'?'':baidu.template._encodeHTML($1),'").replace(new RegExp("\\t(?::=|-)(.*?)"+_right,"g"),"',typeof($1)==='undefined'?'':$1,'").replace(new RegExp("\\t:u=(.*?)"+_right,"g"),"',typeof($1)==='undefined'?'':encodeURIComponent($1),'").replace(new RegExp("\\t:v=(.*?)"+_right,"g"),"',typeof($1)==='undefined'?'':baidu.template._encodeEventHTML($1),'").split("\t").join("');").split(_right_).join("_template_fun_array.push('").split("\\").join("\'");return str};
        return baidu;
    };
    //基于jQuery的移动端单页面适配
    var queryMobileWeb = (function(){
        var intelligentRyan=function(){function a(a){var b,c;this.option={showWay:"",globalAda:!1,border:[640,1136],cssUrl:[!1,""],oID:"common_css_style",prefix:!0,endcss:!1,callback:function(){}};for(b in a)this.option[b]=a[b];c=this,this.function_list={},this.option.cssUrl[0]?$.ajax({url:this.option.cssUrl[1],dataType:"html",type:"GET",data:"",success:function(a){c.original_css=a,c.initialization(),c.option.callback&&c.option.callback()}}):(this.original_css=$("#"+this.option.oID).text(),c.initialization(),this.option.callback&&this.option.callback()),pub_tools.autoWindowSize("adaptionChange",function(){/android/gi.test(navigator.userAgent.toLowerCase())?setTimeout(function(){c.initialization()},1e3):c.initialization()})}return a.prototype.initialization=function(){var b=this.original_css;this.window_width=$(window).width(),this.window_height=$(window).height(),this.startdata=b.substring(0,b.indexOf("/*startdom*/")),this.maindata=b.substring(b.indexOf("/*startdom*/")+"/*startdom*/".length,b.indexOf("/*enddom*/")),this.endOther=b.substring(b.indexOf("/*enddom*/")+"/*enddom*/".length),this.newdata=this.option.endcss?this.maindata+this.endOther:this.maindata,this.css_data_prefix(),this.pixed_data_processing()},a.prototype.css_data_prefix=function(){var a,b,c,d,e,f;return this.option.prefix?(a=this.newdata,b="",c=[window.requestAnimationFrame,window.webkitRequestAnimationFrame,window.mozRequestAnimationFrame,window.msRequestAnimationFrame,window.oRequestAnimationFrame],$.each(c,function(a,c){if(c){var d=String(c).toLowerCase();b=d.match(/(webkit|moz|ms|o)+?(?=r)/gi)}}),b?(d=a.replace(/(\{|\;|\@| )+(keyframes|animation|transform|transition|perspective|linear-gradient|overflow-scrolling)/gi,"<=&*&=>"),e=a.match(/(\{|\;|\@| )+(keyframes|animation|transform|transition|perspective|linear-gradient|overflow-scrolling)/gi),e&&(a="",f=d.split("<=&*&=>"),$.each(f,function(c,d){var f,g;c==e.length?a+=d:(f=e[c],g=f.replace(/\{/gi,"{-"+b+"-").replace(/@/gi,"@-"+b+"-").replace(/(\; |\;)/gi,";-"+b+"-"),a+=d+g)})),this.newdata=a,void 0):!1):!1},a.prototype.pixed_data_processing=function(){var c,d,e,f,g,h,i,a=this.newdata,b=null;if("showall"===this.option.showWay?b=this.option.globalAda?this.window_width:this.window_width>this.option.border[0]?this.option.border[0]:this.window_width:"noborder"===this.option.showWay&&(c=this.option.border[0]/this.option.border[1],d=this.window_width/this.window_height,b=d>c?this.window_height*c:this.window_width),e=a.replace(/([\d\.]+)(?:px)/gi,"&&").split("&&"),f=a.match(/([\d\.]+)(?:px)/gi))for(a="",g=0,h=e.length;h>g;g++)g==f.length?a+=e[g]:(i=parseInt(f[g])/this.option.border[0]*b,a+=1>i&&0!=i?e[g]+1+"px":e[g]+i+"px");this.newdata=a,this.back_data_processing()},a.prototype.back_data_processing=function(){var a=this.newdata,b=a.replace(/\([a-zA-Z0-9-_\/:.]+\.(jpg|png|gif)\)/gi,"<凸>").split("<凸>"),c=a.match(/\([a-zA-Z0-9-_\/:.]+\.(jpg|png|gif)\)/gi);c&&(a="",$.each(b,function(d){a+=d==c.length?b[d]:b[d]+c[d]})),this.newdata=a,this.append_data_processing()},a.prototype.append_data_processing=function(){$("#"+this.option.oID).remove(),$("head:first").append('<style type="text/css" id='+this.option.oID+">"+(this.startdata+this.newdata)+"</style>")},{init:function(b){return new a(b)}}}(); //intelligentRyan.init({showWay:"showall",cssUrl:[true,"css/common.css"],border:[640,1136]});
        return {
            intelligentRyan : intelligentRyan
        };
    })();

    return {
        loadingBar : loadingBar,
        myMouseweel : myMouseweel,
        myMouseScroll : myMouseScroll,
        bt_tpl : bt_tpl,
        queryMobileWeb : queryMobileWeb
    };
})();

//第三方API接口集合 其中依赖的有pub_tools
var otherAPI_tools = (function(){

})();