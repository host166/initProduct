var path = require("path");
var fs = require("fs"); //fs模块
var srcDir = path.resolve(process.cwd(), "src"); //process.cwd:返回运行当前脚本工作目录的路径

//删除目录 便于重新组合
var deleteFolderRecursive = function(path) {
    var files = [];
    if (fs.existsSync(path)) { //判断路径是否存在
        files = fs.readdirSync(path); //找到路径
        
        files.forEach(function(file, index) {
            var curPath = path + "/" + file;
            if (fs.statSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath); //删除文件
            };
        });
        
        fs.rmdirSync(path);
        console.log("临时文件删除成功--准备重新创建");
    }
};

//获取到打包处理之后的css内容并且打包处理
var getRyanAfterCSS = function(pathname) {
    var thislink = path.resolve(process.cwd(), pathname);

    //找到文件和目录
    var getExplorerFileCSS = function(filepath) {
        var filesPath = fs.readdirSync(filepath); //readdirSync 同步读取目录
        filesPath.forEach(function(elem) {
            var isCSS = elem.match(/(.+)\.css$/);
            if (!!isCSS) {
                // console.log(filepath , elem , isCSS);
                fs.readFile(filepath + "\\" + elem, function(err, data) { //
                    if (err) {
                        return console.error(err);
                    };

                    //读取成功 准备写入文件中
                    writeFileData(srcDir + "/js/intelJson.js", "export var intelCssData='" + data.toString().replace(/([\n\r])/gi,"") + "';");

                    deleteFolderRecursive("./dist"); //删除操作
                });
            };
        });

        //写入文件
        function writeFileData(jsfilepath, fileparse) {
            fs.writeFileSync(jsfilepath, fileparse, { //appendFile
                encoding: "utf8",
                flags: "a",
                mode: 438
            });
            console.log("读取成功--正在写入");
        };

    };
    getExplorerFileCSS(thislink);
};
getRyanAfterCSS("dist/css");


































































// var bg = "background:url(../img/sharePrompt_pics.png) no-repeat;background-size:100px auto;";
//     bg = bg.replace(/((background)+([\:\s]+(url))|background-image)+([\w\d\s\#\-\_\%\:\,\.\/\(\)])+?(\;|(?=\}))/gi,"");
// console.log(bg);


//删除方法 使用系统命令
// var exec = require('child_process').exec,
//     child;
// child = exec('rm -rf test', function(err, out) {
//     console.log(out);
//     err && console.log(err);
// });

//var cndhref = require("./cndrouter"); //cnd路径地址
//获取多个组件中的css和通用css文件和内容 同步获取
// var getSyncCSS = (function(){

//     var getPath = srcDir,cssdata = {},cssResult = [];  //cssResult 最后保存的css资源

//     //读取css信息
//     var getReadFileCSS = function(statPath,mtcname){
//         var readFileData = fs.readFileSync(statPath);   //同步读取文件内容 去掉Sync是异步
//         var backPathModify = readFileData.toString().replace(/(\()+([\.\/]*(\/))/gi,"("+cndhref.cndlink).replace(/([\n\r])/gi,"");
//         //如果组件的名称一样则添加文件指纹
//         if( mtcname[1] === "index" ){
//             mtcname[1] = mtcname[1] +"_"+ cndhref.hashChunk();
//         };
//         cssdata[mtcname[1]] = backPathModify;
//     };
//     //读取资源管理器CSS文件
//     var getExplorerFileCSS = function(path){
//         var filesPath = fs.readdirSync(path);   //readdir读取目录
//         //遍历文件列表
//         filesPath.forEach(function(item){
//             var itemPath = path + "\\" + item;
//             //获取文件信息
//             var statSyncData = fs.statSync(itemPath + '');
//             if( statSyncData.isDirectory() && item != "lib" ){
//                 getExplorerFileCSS(itemPath);
//             }else{
//                 var isCSS = item.match(/(.+)\.css$/);
//                 if( !!isCSS ){
//                     var pathcss = itemPath;   //项目中所有的css文件路径
//                     //执行读取css内容方法
//                     getReadFileCSS(itemPath,isCSS);
//                     // console.log(itemPath);
//                 };
//             };
//             // console.log(itemPath);  //跳过lib文件夹
//         });
//     };
//     getExplorerFileCSS(getPath);


//     //循环重组方法
//     var loopElement = function(obj){
//         for( var i in obj ){
//             if( i === "cssreset" ){
//                 cssResult.unshift(obj[i]);
//             }else{
//                 cssResult.push(obj[i]);
//             };
//         };
//     };
//     loopElement(cssdata);
    
//     //创建一个文件 当做js模块来用
//     var createJsFile = function(path,obj){
//         var fileParseObj = obj;//JSON.stringify({data:obj});  //创建一个对象添加到新创建的js模块中
//         fs.writeFile(path,fileParseObj,{  //appendFile
//             encoding:"utf8", flags : "a", mode : 438
//         },function(err){
//             if( err ){
//                 return console.log(err);
//             };
//             // console.log("create file");
//         });
//     };
//     createJsFile(getPath+"/js/intelJson.js","export var intelCssData='"+cssResult.join("")+"';");
    

//     //创建一个文件目录 新的js模块文件
//     var createFilePath = function(path){
//     	fs.mkdir(path,function(err){
//             if(err) { 
//                 return console.error(err); 
//             };
//             // console.log("创建文件成功");
//         });
//     };

//     // var a = 'var aa = "aaac"';
//     // console.log(new Object(a));

//     return {
//         cssResult : cssResult,
//         createFilePath : createFilePath
//     }
// })();

//获取多页面的每个入口文件，用于配置中的entry
// function getCustomFile(regexpexec){
//     var getPath = srcDir,urljson = [];
//     var getExplorerFileCSS = function(path){
//         var filesPath = fs.readdirSync(path);
//         //遍历文件列表
//         filesPath.forEach(function(item){
//             var itemPath = path + "\\" + item;
//             //读取目录和文件信息
//             var statSyncData = fs.statSync(itemPath + '');
//             if( statSyncData.isDirectory() && item != "lib" ){
//                 getExplorerFileCSS(itemPath);
//             }else{
//                 var isMatch = item.match(regexpexec);
//                 if( !!isMatch ){
//                     var pathNatchFile = itemPath;   //项目中所有的css文件路径
//                     if( pathNatchFile.indexOf("cssreset.css") != -1 ){
//                         urljson.unshift(pathNatchFile);
//                     }else{
//                         urljson.push(pathNatchFile);
//                     };
//                 };
//             };
//         });
//     };
//     getExplorerFileCSS(getPath);
//     return urljson;
// };

//获取lib中的js框架
// function getLibraryJsFile(){
//     var getPath = path.resolve(srcDir,"./js/lib"),urljson = [];
//     var filesPath = fs.readdirSync(getPath);
//     filesPath.forEach(function(item){
//         var isMatch = item.match(/(.+)\.js$/);
//         if( !!isMatch ){
//             //保证jquery插件在最顶级
//             if( item.indexOf("jquery") != -1 ){
//                 urljson.unshift(getPath+"\\"+item);
//             }else{
//                 urljson.push(getPath+"\\"+item);
//             };
//         };
//     });

//     return urljson;
// };
//getLibraryJsFile();

