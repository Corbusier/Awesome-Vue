# Vue上手实践

> 文档晦涩艰深的部分没有实际例子作为补充，特此引入，理解用法与作用

## 模板语法

### 插值

1. 文本

```js
    <div id="app"> <p>message is :{{message}}</p></div>
    
    var data={message:"hello vue.js"};
    var app=new Vue({
        el:"#app",
        data:data,
    })
    app.message="21212";
```
2. HTML

```js
    <div id = "app"> <p v-html="html">message is :{{ html }}</p></div>
    var data = {
		html:"<h1>Saas</h1>" 
	};
    var app = new Vue({
        el:"#app",
        data:data
    })
```
但是这个不建议使用，会造成XSS漏洞，文档说明：
> Dynamically rendering arbitrary HTML on your website can be very dangerous because it can easily lead to XSS vulnerabilities. Only use HTML interpolation on trusted content and never on user-provided content.

3. 绑定属性

```js
    <div id = "app"> 
	 	<p v-html="html">message is :{{html}}</p> 
	 	<p v-bind:id="cc"></p>
 	</div>
    
    var data = {
 		html:"<h1>sasas</h1>",
 		cc:"dd"
 	}
    var app = new Vue({
        el:"#app",
        data:data,
    })
```
v-html内部的html被改为了
```js
    <h1>sasas</h1>
```
而v-bind的id被修改为dd

### 过滤器
原文档：
> Vue 2.x 中，过滤器只能在 mustache 绑定和 v-bind 表达式（从 2.1.0 开始支持）中使用，因为过滤器设计目的就是用于文本转换。为了在其他指令中实现更复杂的数据变换，你应该使用计算属性。

使用自定义的过滤器的目的是对一些常见的文本对其进行格式化，过滤器的使用：

 1. 全局方法 Vue.filter() 注册一个自定义过滤器,必须放在Vue实例化前面 
 2. 过滤器函数始终以表达式的值作为第一个参数。带引号的参数视为字符串，而不带引号的参数按表达式计算 
 3. 可以设置两个过滤器参数,前提是这两个过滤器处理的不冲突 
 4. 用户从input输入的数据在回传到model之前也可以先处理 

```js
    <div class="test">
 		<p>{{ message | sum }}</p> 
	</div>
	
	Vue.filter("sum",function(value){
        return value + 4;
    });
    var myVue = new Vue({
        el: ".test",
        data: {
            message:12
        }
    });
```

> 文档中的例子写的真是烂透了，没有说出具体是干什么的，怎么用。

```js
    {{ message | capitalize }}
    new Vue({
        // ...
        filters: {
            capitalize: function (value) {
                if (!value) return ''
                value = value.toString()
                return value.charAt(0).toUpperCase() + value.slice(1)
            }
        }
    })
```
过滤器可以串联：

```js
    {{ message | filterA | filterB }}
```
过滤器是 JavaScript 函数，因此可以接受参数：

```js
    {{ message | filterA('arg1', arg2) }}
```

> !!! 过滤器部分暂存，过后再看。
    
### 缩写

#### v-bind
```js
    //<!-- 完整语法 -->
    <a v-bind:href="url"></a>
    //<!-- 缩写 -->
    <a :href="url"></a>
```

#### v-on
```js
    //<!-- 完整语法 -->
    <a v-on:click="doSomething"></a>
    //<!-- 缩写 -->
    <a @click="doSomething"></a>
```

## 计算属性
模板的逻辑都是清晰简单的，如果有复杂的逻辑应该使用计算属性。

```js
    <div id="example">
		<p>Original message: {{ message }}</p>
		<p>Computed reversed message: {{ reversedMessage }}</p>
	</div>
	
	var vm = new Vue({
		el:"#example",
		data:{
			message:"hello"
		},
		computed:{
			reversedMessage:function(){
				return this.message.split("").reverse().join("");
			}
		}
	})
```
而这种属性之间的"依赖"Vue也是能发现的，当vm.message做出改变时，reversedMessage也会改变。

### 计算属性与Methods
```js
    //<!-- 注意Methods中需要执行函数 -->
    <p>Original message: {{ message }}</p>
	<p>Computed reversed message: {{ reversedMessage() }}</p>
	methods:{
        reverseMessage: function(){
            return this.message.split('').reverse().join('');
        }
    }
```
虽然最后结果是一样的，但是methods方法在每一次渲染的过程中都要执行一次，而计算缓存在message不修改的前提下，是不需要计算的，所以这样的计算属性很可能不会被更新：
```js
    computed:{
        now:function(){
            return Date.now();
        }
    }
```
使用计算缓存的原因是，如果属性的逻辑过程比较复杂，而其他的计算属性又依赖于这个属性，如果有缓存，可以避免无谓的计算。

### 计算属性与Watched Property
$watch用于观察Vue实例上的数据变动。当数据需要根据其他数据变化时，$watch看上去不错，但是通常情况下计算属性要优于命令式的$watch回调。
```js
    <div id="demo">{{ fullName }}</div>
    
    var vm = new Vue({
        el:"#demo",
        data:{
            firstName : 'Foo',
            lastName : 'Bar',
            fullName : 'Foo Bar'
        },
        watch:{
            firstName:function(val){
                this.fullName = val + " " + this.lastName
            },
            lastNam:function(val){
                this.fullName = this.firstName + " " + val
            }
        }   
    })
```
以上的代码是命令式和重复的，以下是计算属性的方式：
```js
    var vm = new Vue({
		el:"#demo",
		data:{
			firstName : "Foo",
			lastName : "Bar"
		},
		computed:{
			fullName:function(){
				return this.fullName = this.firstName + ' ' + this.lastName;
			}
		}
	})
```

### 计算Setter
计算属性默认只有getter，在适当的时候可以提供一个setter：
```js
    var vm = new Vue({
		el:"#demo",
		data:{
			firstName : "Foo",
			lastName : "Bar"
		},
		computed:{
			fullName: {
		        // getter
			    get: function () {
                    return this.firstName + ' ' + this.lastName
			    },
			    // setter
			    set: function (newValue) {
			        var names = newValue.split(' ')
			        this.firstName = names[0]
			        this.lastName = names[names.length - 1]
			    }
		  	}	
		}
	})
	vm.fullName = "John Doe";
	console.log(vm.firstName);
	console.log(vm.lastName);
```
可以看到当fullName改变时，正是由于set的存在，使得firstName和lastName都会被修改。

### 观察 Watchers
Vue 提供一个更通用的方法通过 watch 选项，来响应数据的变化。当你想要在数据变化响应时，执行异步操作或开销较大的操作，这是很有用的。以下的例子在anxios异步获取数据的过程中，根据返回的response再决定answer数据的值，此时计算属性就无能为力了，只能动态的方式展现答案，所以要使用watch
```js
    <div id="watch-example">
    <p>
        Ask a yes/no question:
        <input v-model="question">
    </p>
        <p>{{ answer }}</p>
    </div>
    
    var watchExample = new Vue({
		el:"#watch-example",
		data:{
			question:'',
			answer: 'I cannot give you an answer until you ask a question!'
		}
		,watch:{
			question:function(newQuestion){
				this.answer = 'Waitting for you to stop typing...';
				this.getAnswer();
			}
		}
		,methods:{
			getAnswer:_.debounce(
				function(){
					if(this.question.indexOf("?") === -1){
						this.answer = 'Questions usually contain a question mark. ;-)';
          				return;
					}
					this.answer = "Thinking...";
					var vm = this;
					axios.get('https://yesno.wtf/api')
						.then(function(response){
						vm.answer = _.capitalize(response.data.answer)
					})
					.catch(function(error){
						vm.answer = 'Error! Could not reach the API. ' + error
					})
				}
				,500
			)
		}
	})
```
> lodash封装的_.debounce与节流函数(throttling)和防抖动(debouncing)功能一致

这样的一次请求有几次的中间时态的过渡，这是computed无法做到的(静态，不再渲染)。

## Class 与 Style绑定

### 绑定HTML Class

#### 对象语法
```js
    <!-- key为类名，isActive如果为true则有active这个类，否则就没有这个类 -->
    <div v-bind:class="{ active: isActive }"></div>
    
    <!-- 或者以动态的形式切换多个class -->
    <div class="static"
        v-bind:class="{ active: isActive, 'text-danger': hasError }">
    </div>
    
    data:{
        isActive: true,
        hasError: false
    }
    
    <!-- 可得到 -->
    <div class="static active"></div>
```

还可以绑定一个对象：

```js
    <div class="static" v-bind:class="classObject"></div>
    data: {
    	classObject: {
    		active: true,
    		'text-danger': false
    	}
    }
    
```

配合计算属性使用：
```js
    <div class="static" v-bind:class="classObject"></div>
    
    data: {
		isActive:true,
		error:null
	}
	,computed: {
		classObject: function () {
			return {
				active: this.isActive && !this.error,
				'text-danger': this.error && this.error.type === 'fatal',
			}
		}
	}
```
```js
    <!-- 一个对象、多个key的对象以及计算属性均可得到 -->
    <div class="static active"></div>
```

#### 数组语法
```js
    <div v-bind:class="[activeClass, errorClass]">
    data:{
		activeClass: 'active',
		errorClass: 'text-danger'
	}
	<!-- 渲染为 -->
	<div class="active text-danger"></div>
``` 
当有多个条件 class 时可以在数组语法中使用对象语法：
```js
    <div v-bind:class="[{ active: isActive },errorClass]">
    data: {
		isActive:true,
		errorClass: 'text-danger'
	}
```
默认添加errorClass为'text-danger'，只有在 isActive 是 true 时添加 activeClass 。

#### 组件语法

> ! 了解Vue组件之后再阅读

#### 绑定内联样式

##### 对象语法
为了更清晰表达，可以使用这样的方式：
```js
    <div v-bind:style="styleObject">Hello</div>
    data: {
        styleObject: {
            color: 'red',
            fontSize: '13px'
        }
    }
```
同样可以结合返回对象的计算属性使用
```js
    new Vue({
		el:"div"
		,data: {
			
		}
		,computed:{
			styleObject:function(){
				return{
					color: 'red',
	            	fontSize: '13px'
				}
			}
		}
	})
```

##### 数组语法
```js
    <div v-bind:style="[baseStyles,overridingStyles]"></div>
    
    data: {
		baseStyles: {
            color: 'red',
            fontSize: '13px'
        },
        overridingStyles: {
   			textShadow:'4px 2px 2px #333'
        }
	}
```
对于需要前缀的CSS3属性，Vue会自动加上前缀

## 条件渲染

### v-if
#### <template>v-if条件组
v-if可以控制单个元素，如果要控制多个元素，可以将template元素作为包装元素，并且使用v-if，包装元素解析出的是虚拟的document.fragment元素，并不会显示出来。
```js
    <div id="example">
		<template v-if="ok">
			<h1>Title</h1>
			<p>Paragraph 1</p>
			<p>Paragraph 2</p>
		</template>
	</div>
	
    new Vue({
        el:"#example",
        data:{
            ok:true
        }
    })
```
#### v-else
```js
    <div id="math">
		<div v-if="Math.random() > 0.5">
		  	Sorry
		</div>
		<div v-else>
			Not sorry
		</div>
	</div>
	
    new Vue({
        el:"#math"
    })
```
v-else 元素必须紧跟在 v-if 元素或者 v-else-if的后面——否则它不能被识别。

#### v-else-if
> 2.1.0新增

```js
    <div id="div">
    	<div v-if="type === 'A'">
    		A
    	</div>
    	<div v-else-if="type === 'B'">
    	  	B
    	</div>
    	<div v-else-if="type === 'C'">
    	  	C
    	</div>
    	<div v-else>
    	  	Not A/B/C
    	</div>
    </div>
    new Vue({
        el:"#div",
        data:{
            type:'k'
        }
    })
```
与 v-else 相似，v-else-if 必须跟在 v-if 或者 v-else-if之后。

#### 使用 key 控制元素的可重用
Vue会尽可能的复用已有元素而不是重新渲染，这样可以提升一些性能。
```js
    <div id="div">
        <template v-if="loginType === 'username'">
            <label>Username</label>
            <input placeholder="Enter your username" key="username-input">
        </template>
        <template v-else>
        	<label>Email</label>
        	<input placeholder="Enter your email address" key="email-input">
        </template>
    </div>
    <button id="btn" @click="changeloginType">Toggle login type</button>
    
    var div = new Vue({
		el:"#div",
		data:{
			loginType:'username'
		}
	})
	var btn = new Vue({
		el:"#btn",
		methods:{
			changeloginType:function(){
                /*< !--如何切换状态div.loginType？？ >*/
			}
		}
	})
```
切换Type的过程中并不会删除已经输入的内容，两个模版由于使用了相同的元素，input 会被复用，仅仅是替换了他们的 placeholder。

在有些情况下这并不是一个很好的决定，Vue提供一种方式让你决定是否要复用元素。在input中添加一个属性key，并且每个key是唯一的。之后input中的文本都会重新渲染。
> <lable>仍然会复用，因为它没有添加key属性

### v-show
```js
    <h1 v-show="ok">Hello!</h1>
    var h1 = new Vue({
		el:"h1",
		data:{
			ok:false
		}
	})
```
不同的是有 v-show 的元素会始终渲染并保持在 DOM 中。v-show 是简单的切换元素的 CSS 属性 display 。
> 注意 v-show 不支持 <template> 语法。

### v-if 与 v-show
(1)v-if是真实的渲染与卸载,只不过第一次渲染后,会将结果缓存一下
(2)v-show元素始终被编译并保留，只是简单地基于 CSS 切换
(3)总结: 如果需要频繁切换 v-show 较好，如果在运行时条件不大可能改变 v-if 较好

### v-if 与 v-for
当与v-for一起使用时，v-for具有比v-if更高的优先级。

## 列表渲染
### v-for

#### 基本用法
```js
    <ul id="example-1">
		<li v-for="item of items">
			{{ item.message }}
		</li>
	</ul>
	
	var example1 = new Vue({
		el:"#example-1",
		data:{
			items:[
				{message:'Foooo'},
				{message:'Bar'}
			]
		}
	})
```
在v-for块中，拥有对父作用域属性的完全访问权限，还支持一个可选的第二个参数作为当前项的索引值。
```js
    <ul id="example-2">
        <li v-for="(item, index) of items">
            {{ parentMessage }} - {{ index }} - {{ item.message }}
        </li>
    </ul>
    
    var example2 = new Vue({
        el: '#example-2',
        data: {
            parentMessage: 'Parent',
            items: [
                { message: 'Foo' },
                { message: 'Bar' }
            ]
        }
    })
```
#### Template v-for
```js
    <ul>
        <template v-for="item in items">
            <li>{{ item.msg }}</li>
            <li class="divider"></li>
        </template>
    </ul>
    
    var a = new Vue({
		el:"ul",
		data:{
			items:[
				{ msg: 'leo' },
				{ msg: 'Messi' }
			]
		}
	})
```
带有v-for的template标签来渲染多个元素块，这与v-if条件渲染模板相同。

#### 对象 v-for
也可以使用v-for迭代对象的属性
```js
    <ul id="repeat-object" class="demo">
		<li v-for="value in object">
			{{ value }}
		</li>
	</ul>
	
    new Vue({
		el:"#repeat-object",
		data:{
			object:{
				firstName:"John",
				lastName:"Doe",
				age:30
			}
		}
	})
```
同样的可以使用键名和索引作为参数，与对象数组不同的是第二个参数是键名，第三个参数是索引。
```js
    <div v-for="(value, key, index) in object">
        {{ index }}. {{ key }} : {{ value }}
    </div>
```
> 遍历对象时是按照Object.keys()的结果遍历，但是不同的引擎得到的结果不尽相同。

#### 范围 v-for
v-for可以取整数，此时它将重复多次模板
```js
    <div>
        <span v-for="n of 10">{{ n }}</span>
    </div>
    
    new Vue({
    	el:"div"
    })
```

#### 组件和v-for
> !!! 暂时跳过 了解组件后再阅读学习

#### v-for 和 v-if

