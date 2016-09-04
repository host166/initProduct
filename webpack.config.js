var webpack = require("webpack");
var path = require("path");
var fs = require("fs"); //fs模块
var cndhref = require("./cndrouter");
var HtmlWebpackPlugin = require("html-webpack-plugin"); //生成新的html
var ExtractTextPlugin = require("extract-text-webpack-plugin"); //生成css文件
var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;//require("webpack/lib/optimize/CommonsChunkPlugin");
var uglifyJsPlugin = webpack.optimize.UglifyJsPlugin;   //压缩js工具

var srcDir = path.resolve(process.cwd(), "src");   //process.cwd:返回运行当前脚本工作目录的路径

//获取多页面的每个入口文件，用于配置中的entry
function getCustomFile(regexpexec){
    var getPath = srcDir,urljson = [];
    var getExplorerFileCSS = function(path){
        var filesPath = fs.readdirSync(path);
        //遍历文件列表
        filesPath.forEach(function(item){
            var itemPath = path + "\\" + item;
            //读取目录和文件信息
            var statSyncData = fs.statSync(itemPath + '');
            if( statSyncData.isDirectory() && item != "lib" ){
                getExplorerFileCSS(itemPath);
            }else{
                var isMatch = item.match(regexpexec);
                if( !!isMatch ){
                    var pathNatchFile = itemPath;   //项目中所有的css文件路径
                    if( pathNatchFile.indexOf("cssreset.css") != -1 ){  //如果有初始化css请升级到顶级
                        urljson.unshift(pathNatchFile);
                    }else{
                        urljson.push(pathNatchFile);
                    };
                };
            };
        });
    };
    getExplorerFileCSS(getPath);
    return urljson;
};

//获取需要打包的js和css文件 出去jquery或lib文件夹中的
function getFileAllFunc(regexpexec){
    var getPath = srcDir,url=[],cssobj={};
    var getExplorerFileCSS = function(path){
        var filesPath = fs.readdirSync(path);
        //遍历文件列表
        filesPath.forEach(function(item){
            var itemPath = path + "\\" + item;
            //读取目录和文件信息
            var statSyncData = fs.statSync(itemPath + '');
            if( statSyncData.isDirectory() && item != "lib" ){
                getExplorerFileCSS(itemPath);
            }else{
                var isMatch = item.match(regexpexec);
                if( !!isMatch ){
                    var pathNatchFile = itemPath;   //项目中所有的文件路径 ( css || js)
                    if( pathNatchFile.indexOf("cssreset.css") != -1 ){  //如果有初始化css请升级到顶级
                        url.unshift(pathNatchFile);
                    }else{
                        url.push(pathNatchFile);
                    };
                };
            };
        });
    };
    getExplorerFileCSS(getPath);
    // for( var i in url ){
    //     cssobj[i] = url[i];
    // };
    return url;
};

//获取lib中的js框架
function getLibraryJsFile(){
    var getPath = path.resolve(srcDir,"./js/lib"),urljson = [],datajson={},page=0;
    var filesPath = fs.readdirSync(getPath);
    filesPath.forEach(function(item){
        var isMatch = item.match(/(.+)\.js$/);
        if( !!isMatch ){
            //保证jquery插件在最顶级
            if( item.indexOf("jquery.js") != -1 ){
                urljson.unshift(getPath+"\\"+item);
            }else{
                urljson.push(getPath+"\\"+item);
            };
        };
        datajson[isMatch[1]] = urljson[page];
        page++;
    });
    return urljson;
};

//alias简称别名路径设计 css js
function aliasFunc(regexpexec){
    var getPath = srcDir,url=[],cssobj={};
    var getExplorerFileCSS = function(path){
        var filesPath = fs.readdirSync(path);
        //遍历文件列表
        filesPath.forEach(function(item){
            var itemPath = path + "\\" + item;
            //读取目录和文件信息
            var statSyncData = fs.statSync(itemPath + '');
            if( statSyncData.isDirectory() && item != "lib" ){
                getExplorerFileCSS(itemPath);
            }else{
                var isMatch = item.match(regexpexec);
                if( !!isMatch ){
                    var pathNatchFile = itemPath;   //项目中所有的css文件路径
                    if( pathNatchFile.indexOf("cssreset.css") != -1 ){  //如果有初始化css请升级到顶级
                        url.unshift(pathNatchFile);
                    }else{
                        url.push(pathNatchFile);
                    };
                };
            };
        });
    };
    getExplorerFileCSS(getPath);
    for( var i in url ){
        cssobj[i] = url[i];
    };
    return cssobj;
};


//webpack.config配置
var configurable = {
    //devtool: "source-map",    //生成sourcemap,便于开发调试
    entry: {    //解析原始js路径用 文件输入口
        ryanCSS : getFileAllFunc(/(.+)+(\.css)$/),
        ryanPublic : getFileAllFunc(/(.+)+(\.js)$/),
        libraryJs : getLibraryJsFile()
    },         //获取项目入口js文件
    output: {
        path: path.join(__dirname, "dist/"), //文件输出目录 __dirname:变量获取当前模块文件所在目录的完整绝对路径
        publicPath: cndhref.cndlink,         //用于配置文件发布路径，如CDN或本地服务器  dist/js/
        filename: "js/[name].js",        //根据入口文件输出的对应多个文件名 _[chunkhash:6]
        chunkFilename: "js/[id].chunk.js"   //没有命名的时候一般都会是0.a5898fnub6.js之类
    },
    // 服务器配置相关，自动刷新!
    devServer: {
        historyApiFallback: true,
        hot: false,
        inline: true,
        grogress: true,
    },
    module: {
        //各种加载器，即让各种文件格式可用require引用
        loaders : [
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract("style-loader", "css-loader")
            }, {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel-loader"
            }, // /node_modules|vue\/dist|vue-router\/|vue-loader\/|vue-hot-reload-api\//
            {
                test: /\.(png|jpg|jpeg|gif)$/,
                loader: "url?limit=8192&name=img/[name].[ext]"
            }, //[hash]
            {
                test: /\.(html|tpl)$/,
                loader: "html-withimg-loader"
            } //html?config=htmlLoader|?config=otherHtmlLoaderConfig |html-withimg-loader | -minimize"    //避免压缩html,https://github.com/webpack/html-loader/issues/50
        ]
    },
    htmlLoader: {
        ignoreCustomFragments: [/\{\{.*?}}/]
    },
    resolve: {
        //root: "E:/vueProduct/tpl2.5/src", //绝对路径
        extensions: ["", ".js", ".json", ".scss", ".css", ".less"], //免写文件后缀名
        //配置别名，在项目中可缩减引用路径
        alias : getLibraryJsFile()//aliasFunc(/(.+)\.css$/)
    },
    plugins: [
        //提供全局的变量，在模块中使用无需用require引入
        // new webpack.ProvidePlugin({
        //     $ : "jquery"
        //     //jQuery : "jquery",
        //     // nie: "nie"
        // }),
        new ExtractTextPlugin("css/ryanStyle.css",{ //_[chunkhash:6]
            allChunks: true
        }),
        //将公共代码抽离出来合并为一个文件  new CommonsChunkPlugin( namestr,["",""] ); | ( {name:"",chunks:Object.keys(function)} )
        new CommonsChunkPlugin({
            name : ["libraryJs"],   //将公共模块提取
            minChunks : Infinity    //提取所有entry共同依赖的木块
            // filename : "js/ryanCommon.js"
        }),
        //压缩代码
        new uglifyJsPlugin({
            compress: {
                warnings: false
            },
            except: ['$super', "$", "exports", "require"] //排除关键字
        }),
        new HtmlWebpackPlugin({  //用来生成html的
            //favicon:'./src/img/favicon.ico', //favicon路径
            filename:path.join(__dirname, "./dist/index.html"),    //path.join | 生成的html存放路径，相对于 path
            template:path.join(__dirname,"./src/app/index.html"),    //html模板路径
            inject:true,    //允许插件修改哪些内容，包括head与body
            hash:false,    //为静态资源生成hash值
            minify:{    //压缩HTML文件
                removeComments:false,    //移除HTML中的注释
                collapseWhitespace:false    //删除空白符与换行符
            },
            excludeChunks: ["ryanCSS"]
        })
    ]
};

module.exports = configurable;
