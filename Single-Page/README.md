# Single-Page-A
> 该demo只是作为展示，加深vue的理解，转载自[vue-tutorial](https://github.com/MeCKodo/vue-tutorial)。中间会加入自己的一些理解，以及遇到的一些问题思考。

> vue-cli + vue-router + vue-resource + vuex

> 1. vue-cli创建项目
> 2. vue-router实现单页路由
> 3. vuex管理数据流
> 4. vue-resource请求node服务端
> 5. .vue组件进行组件化开发

## 安装
1. webpack
2. webpack模块热加载
3. css预处理
4. vue-cli

首先安装vue-cli(确保有node和npm)
```js
    npm i -g vue-cli
```

创建一个webpack项目并且下载依赖
```js
    vue init webpack vue-tutorial
    cd vue-tutorial
    npm i //下载依赖
```

> ！！！此处注意在init初始时，选择不要使用ESLint校验(Use ESLint to lint your code?)，ESLint太过灵敏，可能会导致无法运行应用。

接着使用`npm run dev`在热加载中运行应用。它会去找`package.json`的`script`对象，执行`node build/dev-server.js`，这个文件中配置了Webpack，让Webpack编译项目文件，并运行服务器，在`localhost:8080`即可查看应用。

以上都准备好之后，需要为路由、XHR请求、数据管理下载库，另外还使用了`bootstrap`作为UI库。
```js
    npm i vue-resource vue-router vuex bootstrap --save
```

## 初始化(main.js)
文件的目录结构如下所示

<pre>
.vue-tutorial
├── build
   ├── dev-server.js
   //...
├── config
   ├── dev.env
   //...
├── node_modules
├── src  
   ├── assets
   ├── components
       ├── Hello.vue
       ├── //...vue
   ├── router
   ├── store
       ├── actions
       ├── index
       ├── mutations-types
       ├── mutations
   ├── App.vue
   ├── main
├── static             
├── .babelrc
├── .editorconfig
├── .postcssrc
├── index
├── package
├── README
.
</pre>

在src目录下找到`App.vue`和`main.js`。`main.js`将会作为应用的入口文件，而`App.vue`作为应用的初始化组件，先来完善`main.js`。

```js
    // src/main.js
    import Vue from 'vue'
    import VueRouter from 'vue-router'
    import VueResource from 'vue-resource'
    
    import App from './App' //注意没有文件名后缀.vue
    import Home from './components/Home' //注意没有文件名后缀.vue
    import 'bootstrap/dist/css/bootstrap.css' //直接导入所以需要详细的路径及后缀
    
    const routes = [
        {
            path : '/',
            component : Home
        },
        {
            path : '/home',
            component : Home
        }
    ];
    const router = new VueRouter({
        routes
    });
    
    //实例化Vue
    var app = new Vue({
        el: "#app",
        router,
        ...App
    })
```

在`index.html`只保留基本结构即可。
```js
    //index.html
    <div id="app"></div>
```

## 创建首页组件
在App.vue中为应用写一个顶部导航。

```js
    // src/App.vue
    <template>
      <div id="wrapper">
        <nav class="navbar navbar-default">
          <div class="container">
            <a class="navbar-brand" href="#">
              <i class="glyphicon glyphicon-time"></i>
              计划板
            </a>
            <ul class="nav navbar-nav">
              <li><router-link to="/home">首页</router-link></li>
              <li><router-link to="/time-entries">计划列表</router-link></li>
            </ul>
          </div>
        </nav>
        <div class="container">
          <div class="col-sm-3">
            
          </div>
          <div class="col-sm-9">
            <router-view></router-view>
          </div>
        </div>
      </div>
    </template>
```

以上都是`vue-router`的基本套路，HTML结构也直接使用作者的。

接下来，需要创建一个`Home.vue`作为首页

```js
    // src/components/Home.vue
    <template>
      <div class="jumbotron">
        <h1>任务追踪</h1>
        <p>
          <strong>
            <router-link to="/time-entries">创建一个任务</router-link>
          </strong>
        </p>
      </div>
    </template>
```

`npm run dev`后就可以看到效果。

## 创建侧边栏组件
在首页左侧还有空白，放入一个侧边栏统计所有计划的总时间。

```js
    // src/App.vue
    //...
    <div class="container">
        <div class="col-sm-3">
            <sidebar></sidebar>
        </div>
        <div class="col-sm-9">
            <router-view></router-view>
        </div>
    </div>
    //...
```

```js
    import Sidebar from './components/Sidebar.vue'
    
    export default{
        components:{
            'sidebar': Sidebar
        }
    }
```
在`Sidebar.vue`中需要通过store获取总时间，总时间是共享的数据，这里用到的是vuex中的getters，**必须是函数，并且在计算属性中使用**。

```js
    <script>
        export default{
            computed:{
                time() {
                    return this.$store.state.totalTime
                }
            }
        }
    </script>
```

## 创建计划列表组件
创建事件跟踪列表。

```js
    // src/components/TimeEntries.vue
    <tempalte>
    	<div>
    		//$route.path是当前路由对象的路径，解析为绝对路径
    		<router-link
    		  v-if="$route.path !== '/time-entries/log-time'"
    		  to="/time-entries/log-time"
    		  class="btn btn-primary">
    		  创建
    	  	</router-link>
    	  	<div v-if="$route.path === '/time-entries/log-time'">
    	  		<h3>创建</h3>
    	  	</div>
    	  	<hr>
    	  	<router-view><router-view>
    	  	<div class="time-entries">
    	  		<p v-if="!plans.length"><strong>还没有任何计划</strong></p>
    	  		<div class="list-group">
    	  			//v-for循环，注意参数顺序为(item,index) in items
    	  			<a class="list-group-item" 
    	  			v-for="(plan,index) in plans">
    	  				<div class="row">
    	  					<div class="col-sm-2 user-details">
    	  						<img :src="plan.avatar" 
    	  						class="avatar img-circle img-responsive">
    	  						<p class="text-center">
    	  							<strong>
    	  								{{ plan.name }}
    	  							</strong>
    	  						</p>
    	  					</div>
    	  					<div class="col-sm-2 text-center time-block">
    	  						<h3 class="list-group-item-text total-time">
    	  							<i class="glyphicon glyphicon-time">
    	  								{{ plan.totalTime }}
    	  							</i>
    	  						</h3>
    	  						<p class="label label-primary text-center">
    	  							<i class="glyphicon gloyphicon-calendar"></i>
    	  							{{ plan.date }}
    	  						</p>
    	  					</div>
    	  					<div class="col-sm-7 comment-section">
    	  						<p>{{ plan.comment }}</p>
    	  					</div>
    	  					<div class="col-sm-1">
    	  						<button
    	  						  class="btn btn-xs btn-danger delete-button"
    	  						  @click="deletePlan(index)"
    	  						>
    	  						X	
    	  						</button>
    	  					</div>
    	  				</div>
    	  			</a>
    	  		</div>
    	  	</div>
    	</div>	
    </tempalte>
```

关于`script`：

```js
    // src/components/TimeEntries.vue
    <script>
    	export default {
    		name : 'TimeEntries',
    		computed : {
    			plans(){
    				//从store中取数据
    				return this.$store.list
    			}
    		},
    		methods : {
    			//存(修改)数据
    			deletePlan(idx){
    				//减去总时间
    				this.$store.dispatch('decTotalTime',this.plans[idx].totalTime)
    				//删除该计划
    				this.$store.dispatch('deletePlan',idx)
    			}
    		}
    	}
    </script>
```

再添加上一些样式：

```css
    // src/components/TimeEntries.vue
    <style>
    	.avatar{
    		height: 75px;
    		margin: 0 auto;
    		margin-top: 10px 0;
    	}
    	.user-details{
    		background-color: #f5f5f5;
    		border-right: 1px solid #ddd;
    		margin: -10px 0;
    	}
    	.time-block{
    		padding: 10px;
    	}
    	.comment-section{
    		padding: 20px;
    	}
    </style>
```

接下来是状态管理vuex的部分，把数据存在store中。在src目录下创建store目录。

<pre>
//..
   ├── store
       ├── actions
       ├── index
       ├── mutations-types
       ├── mutations
.
</pre>

```js
    // src/store/index.js
    import Vue from 'vue'
    import Vuex from 'vuex'
    
    Vue.use(Vuex)
    //先写假数据
    const state = {
        totalTime : 0,
        list : [{
            name : 'Via',
            avatar : 'https://cdn.pixabay.com/photo/2016/03/30/09/14/photography-1290291_960_720.jpg',
            date : '2017-7-27',
            totalTime : '2',
            comment : '凌晨2：45观看AC米兰欧联资格赛'
        }]
    }；
    
    export default new Vuex.Store({
        state
    })
```

由于新增了页面和stor，在入口js文件中需要配置

```js
    // src/main.js
    import store from './store'
    import TimeEntries from './components/TimeEntries.vue'
    //...
    
    const routes = [
        {
            path : '/',
            component : Home
        },
        {
            path : '/home',
            component : Home
        },
        {
            path : '/time-entries',
            component : TimeEntries
        }
    ];
    
    var app = new Vue({
        el : '#app',
        router,
        store,
        ...App
    })
```

在`localhost:8080`中可以看到伪数据构建的页面。

## 创建任务组件
当点击创建时，需要组件：

```js
    // src/components/LogTime.vue
    <template>
      <div class="form-horizontal">
        <div class="form-group">
          <div class="col-sm-6">
            <label>日期</label>
            <input
              type="date"
              class="form-control"
              v-model="date"
              placeholder="Date"
            />
          </div>
          <div class="col-sm-6">
            <label>时间</label>
            <input
              type="number"
              class="form-control"
              v-model="totalTime"
              placeholder="Hours"
            />
          </div>
        </div>
        <div class="form-group">
          <div class="col-sm-12">
            <label>备注</label>
            <input
              type="text"
              class="form-control"
              v-model="comment"
              placeholder="Comment"
            />
          </div>
        </div>
        <button class="btn btn-primary" @click="save()">保存</button>
        <router-link to="/time-entries" class="btn btn-danger">取消</router-link>
        <hr>
      </div>
    </template>

    <script>
    	export default {
    		name : 'LogTime',
    		data() {
    			return {
    				date : '',
    				totalTime : '',
    				comment : ''
    			}
    		},
    		methods:{
    			save(){
    				const plan = {
    					name : 'Via',
    		            avatar : 'https://cdn.pixabay.com/photo/2016/03/30/09/14/photography-1290291_960_720.jpg',
    		            date : this.date,
    		            totalTime : this.totalTime,
    		            comment : this.comment
    				};
    				this.$store.dispatch('savePlan',plan)
    				this.$store.dispatch('addTotalTime',this.totalTime)
    				this.$router.go(-1)
    			}
    		}
    	}
    </script>
```

这个组件包含了三个input输入框以及两个按钮，保存和取消。保存时需要把数据传入$store中。
`LogTime`属于`TimeEntries`组件的一个子路由，配置该路由，并且利用webpack让它懒加载，减少首屏加载的流量。

```js
    // src/main.js
    //...
    const routes = [
        {
            path : '/',
            component : Home
        },
        {
            path : '/home',
            component : Home
        },
        {
            path : '/time-entries',
            component : TimeEntries,
            children : [
                {
                    path : 'log-time',
                    //懒加载
                    component : resolve => require(['./components/LogTime.vue'],resolve)
                }
            ]
        }
    ];
    //...
```

## Vuex
**该项目使用了vuex实现数据通信**

需要两个全局数据，一个是所有计划的总时间，另一个是计划列表的数组。其中的`src/store/index.js`，传入`state`、`mutations`、`actions`初始化Store。

而`mutation-types.js`，明确操作与数据的关系，其实要不要都可以。

```js
    // src/store/mutation-types.js
    // 增加总时间或者减少总时间
    export const ADD_TOTAL_TIME = 'ADD_TOTAL_TIME';
    export const DEC_TOTAL_TIME = 'DEC_TOTAL_TIME';
    
    // 新增和删除一条计划
    export const SAVE_PLAN = 'SAVE_PLAN';
    export const DELETE_PLAN = 'DELETE_PLAN';
```

`mutation.js`修改数据，并储存state。
```js
    import * as types from './mutation-types'
    
    export default{
        //从mutation-types中导入的增加总时间
        [types.ADD_TOTAL_TIME](state,time){
            state.totalTime = parseFloat(state.totalTime) + parseFloat(time) //原作中会产生问题，得到的是字符串拼接后的结果，如下的减少时间也做相应处理
        },
        [types.DEC_TOTAL_TIME] (state, time) {
            state.totalTime = parseFloat(state.totalTime) - parseFloat(time)
        },
        // 新增计划
        [types.SAVE_PLAN] (state, plan) {
        // 设置默认值，未来我们可以做登入直接读取昵称和头像
            const avatar = 'https://cdn.pixabay.com/photo/2016/03/30/09/14/photography-1290291_960_720.jpg';
            
            state.list.push(
                Object.assign({ name: '二哲', avatar: avatar }, plan)
            )
        },
        // 删除某计划
        [types.DELETE_PLAN] (state, idx) {
            state.list.splice(idx, 1);
        }
    }
```

再对照`actions`(数据的中间处理)：
```js
    // src/store/actions.js
    import * as types from './mutation-types'
    
    export default {
      addTotalTime({ commit }, time) {
        commit(types.ADD_TOTAL_TIME, time)
      },
      decTotalTime({ commit }, time) {
        commit(types.DEC_TOTAL_TIME, time)
      },
      savePlan({ commit }, plan) {
        commit(types.SAVE_PLAN, plan);
      },
      deletePlan({ commit }, plan) {
        commit(types.DELETE_PLAN, plan)
      }
    };
```
做的事情其实就是触发事件和传入参数。

加入这三个文件之后，vuex算是完整了。在`index.js`中更新代码。
```js
    // src/store/index.js 完整代码
    import Vue from 'vue'
    import Vuex from 'vuex'
    import mutations from './mutations'
    import actions from './actions'
    
    Vue.use(Vuex);
    
    const state = {
      totalTime: 0,
      list: []
    };
    
    export default new Vuex.Store({
      state,
      mutations,
      actions
    })
```

`this.$store.dispatch('savePlan', plan)`修改之后，存数据。调用`actions.js`里的`savePlan`方法，而`savePlan`又会触发 `mutations`里的`types.SAVE_PLAN`储存修改数据，最后修改数据视图更新。

1. `mutation-types`记录所有的事件名
2. `mutations`注册各种数据变化的方法
3. `actions`则可以编写异步的逻辑，再去commit事件

最后一定要在`main.js`中使用`store`这个**"前端数据库"**。

```js
    // src/store/main.js
    import store from './store'
    // ...
    var app = new Vue({
      el: '#app',
      router,
      store,
      ...App,
    });
```

## 鸣谢
最后要感谢作者，有了这篇循序渐进的文章，才可以对vuex，vue-router，vue-cli脚手架，配合webpack进行single-page的开发有初步的认识。附上作者github地址[author](https://github.com/MeCKodo)。