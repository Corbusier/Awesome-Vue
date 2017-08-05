> 之前已经做过一次单页面的尝试，对于vue-cli中的webpack配置并不是特别的熟悉，所以特意找来文章分析其中的配置。

## 目录结构

<!-- more -->

<pre>
.
├── README.md
├── build
│   ├── build.js
│   ├── check-versions.js
│   ├── dev-client.js
│   ├── dev-server.js
│   ├── utils.js
│   ├── webpack.base.conf.js
│   ├── webpack.dev.conf.js
│   └── webpack.prod.conf.js
├── config
│   ├── dev.env.js
│   ├── index.js
│   └── prod.env.js
├── index.html
├── package.json
├── src
│   ├── App.vue
│   ├── assets
│   │   └── logo.png
│   ├── components
│   │   └── Hello.vue
│   └── main.js
└── static
.
</pre>

主要的关注点集中在：

- build - 编译任务的代码
- config - webpack 的配置文件
- package.json - 项目的基本信息

## 入口

从 package.json 中可以看到
```js

    "scripts": {
        "dev": "node build/dev-server.js",
        "start": "node build/dev-server.js",
        "build": "node build/build.js",
        "unit": "cross-env BABEL_ENV=test karma start test/unit/karma.conf.js --single-run",
        "e2e": "node test/e2e/runner.js",
        "test": "npm run unit && npm run e2e"
    },
    
```
当执行 npm run dev / npm run build 时运行的是 node build/dev-server.js 或 node build/build.js

### dev-server.js
build/dev-server.js 

```js
    require('./check-versions')() //检查 Node 和 npm 版本

    var config = require('../config') //获取 config/index.js 的默认配置
    
    /* 
        ** 如果 Node 的环境无法判断当前是 dev / product 环境
        ** 使用 config.dev.env.NODE_ENV 作为当前的环境
    */
    
    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = JSON.parse(config.dev.env.NODE_ENV)
    }
    
    var opn = require('opn') // 一个可以强制打开浏览器并跳转到指定 url 的插件
    var path = require('path') //使用 NodeJS 自带的文件路径工具
    var express = require('express') //使用express
    var webpack = require('webpack') //使用webpack
    var proxyMiddleware = require('http-proxy-middleware') // 使用 proxyTable 
    var webpackConfig = process.env.NODE_ENV === 'testing'
      ? require('./webpack.prod.conf')
      : require('./webpack.dev.conf') // 使用 dev 环境的 webpack 配置
    
    /* 如果没有指定运行端口，使用 config.dev.port 作为运行端口 */
    var port = process.env.PORT || config.dev.port
    
    var autoOpenBrowser = !!config.dev.autoOpenBrowser
    
    /* 使用 config.dev.proxyTable 的配置作为 proxyTable 的代理配置 */
    /* 项目参考 https://github.com/chimurai/http-proxy-middleware */
    var proxyTable = config.dev.proxyTable
    
    /* 使用 express 启动一个服务 */
    var app = express()
    var compiler = webpack(webpackConfig)// 启动 webpack 进行编译
    
    /* 启动 webpack-dev-middleware，将编译后的文件暂存到内存中 */
    var devMiddleware = require('webpack-dev-middleware')(compiler, {
      publicPath: webpackConfig.output.publicPath,
      quiet: true
    })
    
    /* 启动 webpack-hot-middleware，也就是我们常说的 Hot-reload */
    var hotMiddleware = require('webpack-hot-middleware')(compiler, {
      log: false,
      heartbeat: 2000
    })
    
    /* 当 html-webpack-plugin 模板更新的时候强制刷新页面 */
    compiler.plugin('compilation', function (compilation) {
      compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
        hotMiddleware.publish({ action: 'reload' })
        cb()
      })
    })
    
    // 将 proxyTable 中的请求配置挂在到启动的 express 服务上
    Object.keys(proxyTable).forEach(function (context) {
      var options = proxyTable[context]
      if (typeof options === 'string') {
        options = { target: options }
      }
      app.use(proxyMiddleware(options.filter || context, options))
    })
    
    // 使用 connect-history-api-fallback 匹配资源，如果不匹配就可以重定向到指定地址
    app.use(require('connect-history-api-fallback')())
    
    // 将暂存到内存中的 webpack 编译后的文件挂在到 express 服务上
    app.use(devMiddleware)
    
    // 将 Hot-reload 挂在到 express 服务上并且输出相关的状态、错误
    app.use(hotMiddleware)
    
    // 拼接 static 文件夹的静态资源路径
    var staticPath = path.posix.join(config.dev.assetsPublicPath, config.dev.assetsSubDirectory)
    // 为静态资源提供响应服务
    app.use(staticPath, express.static('./static'))
    
    var uri = 'http://localhost:' + port
    
    var _resolve
    var readyPromise = new Promise(resolve => {
      _resolve = resolve
    })
    
    console.log('> Starting dev server...')
    devMiddleware.waitUntilValid(() => {
      console.log('> Listening at ' + uri + '\n')
      // 如果不是测试环境，自动打开浏览器并跳到我们的开发地址
      if (autoOpenBrowser && process.env.NODE_ENV !== 'testing') {
        opn(uri)
      }
      _resolve()
    })
    
    // 让我们这个 express 服务监听 port 的请求，并且将此服务作为 dev-server.js 的接口暴露
    var server = app.listen(port)
    
    module.exports = {
      ready: readyPromise,
      close: () => {
        server.close()
      }
    }

```

### webpack.dev.conf.js
在 dev-server.js 中用到了 webpack.dev.conf.js 和 index.js，先来看一下 webpack.dev.conf.js

```js
    var utils = require('./utils')// 使用一些小工具
    var webpack = require('webpack')// 使用 webpack
    var config = require('../config')// 同样的使用了 config/index.js
    var merge = require('webpack-merge')// 使用 webpack 配置合并插件
    var baseWebpackConfig = require('./webpack.base.conf')// 加载 webpack.base.conf
    /* 使用 html-webpack-plugin 插件，这个插件可以帮我们自动生成 html 并且注入到 .html 文件中 */
    var HtmlWebpackPlugin = require('html-webpack-plugin')
    var FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
    
    // 将 Hol-reload 相对路径添加到 webpack.base.conf 的 对应 entry 前
    Object.keys(baseWebpackConfig.entry).forEach(function (name) {
      baseWebpackConfig.entry[name] = ['./build/dev-client'].concat(baseWebpackConfig.entry[name])
    })
    
    /* 将 webpack.dev.conf.js 的配置和 webpack.base.conf.js 的配置合并 */
    module.exports = merge(baseWebpackConfig, {
      module: {
        // 使用 styleLoaders
        rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap })
      },
      // 使用 #cheap-module-eval-source-map 模式作为开发工具
      devtool: '#cheap-module-eval-source-map',
      plugins: [
        /* definePlugin 接收字符串插入到代码当中, 所以需要的话可以写上 JS 的字符串 */
        new webpack.DefinePlugin({
          'process.env': config.dev.env
        }),
        /* HotModule 插件在页面进行变更的时候只会重回对应的页面模块，不会重绘整个 html 文件 */
        new webpack.HotModuleReplacementPlugin(),
        /* 使用了 NoErrorsPlugin 后页面中的报错不会阻塞，但是会在编译结束后报错 */
        new webpack.NoEmitOnErrorsPlugin(),
        /* 将 index.html 作为入口，注入 html 代码后生成 index.html文件 */
        new HtmlWebpackPlugin({
          filename: 'index.html',
          template: 'index.html',
          inject: true
        }),
        new FriendlyErrorsPlugin()
      ]
    })

```

### webpack.base.conf.js
在 webpack.dev.conf.js 中又引入了 webpack.base.conf.js， 它看起来很重要的样子，所以我们只能在下一章来看看 config/index.js 了（摊手）

```js
    var path = require('path')// 使用 NodeJS 自带的文件路径插件
    var utils = require('./utils')// 引入一些小工具
    var config = require('../config')// 引入 config/index.js
    var vueLoaderConfig = require('./vue-loader.conf')// 引入 vue-loader.conf
    
    function resolve (dir) {
      return path.join(__dirname, '..', dir)
    }
    
    module.exports = {
      entry: {
        app: './src/main.js' // 编译文件入口
      },
      output: {
        path: config.build.assetsRoot,// 编译输出的静态资源根路径
        filename: '[name].js',// 编译输出的文件名
        // 正式发布环境下编译输出的上线路径的根路径
        publicPath: process.env.NODE_ENV === 'production'
          ? config.build.assetsPublicPath
          : config.dev.assetsPublicPath
      },
      resolve: {
        //自动补全的扩展名
        extensions: ['.js', '.vue', '.json'],
        alias: {
          /* 默认路径代理，例如 import Vue from 'vue'，
          会自动到 'vue/dist/vue.common.js'中寻找*/
          'vue$': 'vue/dist/vue.esm.js',
          '@': resolve('src')
        }
      },
      module: {
        rules: [
          // 需要处理的文件及使用的 loader
          {
            test: /\.vue$/,
            loader: 'vue-loader',
            options: vueLoaderConfig
          },
          {
            test: /\.js$/,
            loader: 'babel-loader',
            include: [resolve('src'), resolve('test')]
          },
          {
            test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
            loader: 'url-loader',
            options: {
              limit: 10000,
              name: utils.assetsPath('img/[name].[hash:7].[ext]')
            }
          },
          {
            test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
            loader: 'url-loader',
            options: {
              limit: 10000,
              name: utils.assetsPath('media/[name].[hash:7].[ext]')
            }
          },
          {
            test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
            loader: 'url-loader',
            options: {
              limit: 10000,
              name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
            }
          }
        ]
      }
    }

```

### config/index.js
index.js 中有 dev 和 production 两种环境的配置

```js
    var path = require('path')

    module.exports = {
      build: {// production 环境
        env: require('./prod.env'),
        // 编译输入的 index.html 文件
        index: path.resolve(__dirname, '../dist/index.html'),
        // 编译输出的静态资源路径
        assetsRoot: path.resolve(__dirname, '../dist'),
        // 编译输出的二级目录
        assetsSubDirectory: 'static',
        // 编译发布的根目录，可配置为资源服务器域名或 CDN 域名
        assetsPublicPath: '/',
        // 是否开启 cssSourceMap
        productionSourceMap: true,
        productionGzip: false,// 是否开启 gzip
        productionGzipExtensions: ['js', 'css'],// 需要使用 gzip 压缩的文件扩展名
        bundleAnalyzerReport: process.env.npm_config_report
      },
      dev: {// dev 环境
        env: require('./dev.env'),// 使用 config/dev.env.js 中定义的编译环境
        port: 8080,// 运行测试页面的端口
        autoOpenBrowser: true,
        assetsSubDirectory: 'static',// 编译输出的二级目录
        // 编译发布的根目录，可配置为资源服务器域名或 CDN 域名
        assetsPublicPath: '/',
        proxyTable: {},// 需要 proxyTable 代理的接口（可跨域）
        // 是否开启 cssSourceMap(因为一些 bug 此选项默认关闭
        cssSourceMap: false
      }
    }

```

至此，我们的 npm run dev 命令就讲解完毕，下面来看一看执行 npm run build 命令时发生了什么～

### build.js

```js
    require('./check-versions')()// 检查 Node 和 npm 版本
    process.env.NODE_ENV = 'production'
    
    var ora = require('ora')// 一个 loading 插件
    var rm = require('rimraf')
    var path = require('path')
    var chalk = require('chalk')
    var webpack = require('webpack')
    var config = require('../config') // 加载 config.js
    var webpackConfig = require('./webpack.prod.conf')// 加载 webpack.prod.conf
    // 使用 ora 打印出 loading + log
    var spinner = ora('building for production...')
    // 开始 loading 动画
    spinner.start()
    
    /* 拼接编译输出文件路径 */
    rm(path.join(config.build.assetsRoot, config.build.assetsSubDirectory), err => {
      if (err) throw err
      //  开始 webpack 的编译
      webpack(webpackConfig, function (err, stats) {
        // 编译成功的回调函数
        spinner.stop()
        if (err) throw err
        process.stdout.write(stats.toString({
          colors: true,
          modules: false,
          children: false,
          chunks: false,
          chunkModules: false
        }) + '\n\n')
    
        console.log(chalk.cyan('  Build complete.\n'))
        console.log(chalk.yellow(
          '  Tip: built files are meant to be served over an HTTP server.\n' +
          '  Opening index.html over file:// won\'t work.\n'
        ))
      })
    })

```

### webpack.prod.conf.js

```js
    var path = require('path')
    var utils = require('./utils')// 使用一些小工具
    var webpack = require('webpack')
    var config = require('../config')// 加载 confi.index.js
    var merge = require('webpack-merge')// 加载 webpack 配置合并工具
    var baseWebpackConfig = require('./webpack.base.conf')// 加载 webpack.base.conf.js
    var CopyWebpackPlugin = require('copy-webpack-plugin')
    /* 一个可以插入 html 并且创建新的 .html 文件的插件 */
    var HtmlWebpackPlugin = require('html-webpack-plugin')
    /* 一个 webpack 扩展，可以提取一些代码并且将它们和文件分离开 */ 
    /* 如果我们想将 webpack 打包成一个文件 css js 分离开，那我们需要这个插件 */
    var ExtractTextPlugin = require('extract-text-webpack-plugin')
    var OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
    
    var env = process.env.NODE_ENV === 'testing'
      ? require('../config/test.env')
      : config.build.env
    
    /* 合并 webpack.base.conf.js */
    var webpackConfig = merge(baseWebpackConfig, {
      module: {
        /* 使用的 loader */
        rules: utils.styleLoaders({
          sourceMap: config.build.productionSourceMap,
          extract: true
        })
      },
      /* 是否使用 #source-map 开发工具 */
      devtool: config.build.productionSourceMap ? '#source-map' : false,
      output: {
        /* 编译输出目录 */
        path: config.build.assetsRoot,
        /* 编译输出文件名 */
        filename: utils.assetsPath('js/[name].[chunkhash].js'),
        // 没有指定输出名的文件输出的文件名
        //可以在 hash 后加 :6 决定使用几位 hash 值
        chunkFilename: utils.assetsPath('js/[id].[chunkhash].js')
      },
      plugins: [
        /* definePlugin 接收字符串插入到代码当中,需要的话可以写上 JS 的字符串 */
        new webpack.DefinePlugin({
          'process.env': env
        }),
        /* 压缩 js (同样可以压缩 css) */
        new webpack.optimize.UglifyJsPlugin({
          compress: {
            warnings: false
          },
          sourceMap: true
        }),
        /* 将 css 文件分离出来 */
        new ExtractTextPlugin({
          filename: utils.assetsPath('css/[name].[contenthash].css')
        }),
        new OptimizeCSSPlugin({
          cssProcessorOptions: {
            safe: true
          }
        }),
        /* 构建要输出的 index.html 文件， HtmlWebpackPlugin 
        可以生成一个 html 并且在其中插入你构建生成的资源 */
        new HtmlWebpackPlugin({
          filename: process.env.NODE_ENV === 'testing'
            ? 'index.html'
            : config.build.index,// 生成的 html 文件名
          template: 'index.html',// 使用的模板
          inject: true,// 是否注入 html (有多重注入方式，可以选择注入的位置)
          minify: {// 压缩的方式
            removeComments: true,
            collapseWhitespace: true,
            removeAttributeQuotes: true
          },
          chunksSortMode: 'dependency'
        }),
        /*
          CommonsChunkPlugin用于生成在入口点之间共享的公共模块(比如jquery，vue)的块并将它们分成独立的包。
          而为什么要new两次这个插件，这是一个很经典的bug的解决方案,
          在webpack的一个issues有过深入的讨论webpack/webpack#1315 。
          ----为了将项目中的第三方依赖代码抽离出来，官方文档上推荐使用这个插件，
          当我们在项目里实际使用之后，发现一旦更改了 app.js 内的代码，vendor.js 的 hash 也会改变，
          那么下次上线时，用户仍然需要重新下载 vendor.js 与 app.js
        */
        new webpack.optimize.CommonsChunkPlugin({
          name: 'vendor',
          minChunks: function (module, count) {
            // 依赖的 node_modules 文件会被提取到 vendor 中
            return (
              module.resource &&
              /\.js$/.test(module.resource) &&
              module.resource.indexOf(
                path.join(__dirname, '../node_modules')
              ) === 0
            )
          }
        }),
        new webpack.optimize.CommonsChunkPlugin({
          name: 'manifest',
          chunks: ['vendor']
        }),
        new CopyWebpackPlugin([
          {
            from: path.resolve(__dirname, '../static'),
            to: config.build.assetsSubDirectory,
            ignore: ['.*']
          }
        ])
      ]
    })
    /* 开启 gzip 的情况下使用下方的配置 */
    if (config.build.productionGzip) {
      /* 加载 compression-webpack-plugin 插件 */
      var CompressionWebpackPlugin = require('compression-webpack-plugin')
      /* 向webpackconfig.plugins中加入下方的插件 */
      webpackConfig.plugins.push(
        /* 使用 compression-webpack-plugin 插件进行压缩 */
        new CompressionWebpackPlugin({
          asset: '[path].gz[query]',
          algorithm: 'gzip',
          test: new RegExp(
            '\\.(' +
            config.build.productionGzipExtensions.join('|') +
            ')$'
          ),
          threshold: 10240,
          minRatio: 0.8
        })
      )
    }
    
    if (config.build.bundleAnalyzerReport) {
      var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
      webpackConfig.plugins.push(new BundleAnalyzerPlugin())
    }
    
    module.exports = webpackConfig

```