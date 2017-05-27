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

注意 v-show 不支持 <template> 语法。


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
如果v-for与v-if在同一节点，v-for的优先级更高，条件渲染会等到循环迭代完之后再运行。
```js
    <ul>
        <li v-for="todo in todos" v-if="!todo.isComplete">
	    {{ todo }}
	</li>
    </ul>
	
    new Vue({
	el:"ul",
	data:{
	    todos:{
		firstName:'John',
		lastName : "Doe",
		age:30,
		isComplete:true/false
	    }
	}
    })
```
条件渲染会直到每一个循环都结束时才开始执行。所以v-if在这个例子中的作用就是只渲染todos里还未完成的部分，且必须等另一部分已经被v-for先干完才能开始工作。

相反，如果想按条件渲染来跳过循环的执行，可以将v-if放在包装元素中：
```js
    <ul v-if="shouldRenderTodos">
	<li v-for="todo in todos">
	    {{ todo }}
	</li>	
    </ul>
	
    new Vue({
	el:"ul",
	data:{
	    shouldRenderTodos:false,
	    todos:{
		firstName:'John',
		lastName : "Doe",
		age:30
	    }
	}
    })
```
#### key
当Vue使用v-for更新已渲染过的元素列表时，默认"就地复用"策略。如果数据项的顺序被改变，Vue不是操纵DOM元素来配合修改后的顺序，而是复用此处每个元素，并确保它在特定索引下显示被渲染过的每个元素。

这个默认的模式是有效的，但是只适用于不依赖子组件状态或临时DOM状态(例如：表单输入值)的列表渲染输出。为了能跟踪每个节点的身份，然后实现复用和重排序现有元素，需要为每项提供一个唯一的key属性。

建议使用v-for来提供key，除非是DOM特别简单，或者是希望通过默认行为来获得性能提升。

> key的用途在之后还有涉及，暂时先不深入了解

#### 数组更新检测
##### 变异方法
 - push()
 - pop()
 - shift()
 - unshift()
 - splice()
 - sort()
 - reverse()

以上的数组在原生方法中都会修改原数组的内容，而在Vue中，它们也会触发视图更新。
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
    /*< !-- 在控制台下输入以下内容 -- >*/
    example1.items.push({ message: 'Baz' })
```
> push方法会引起视图的更新。

##### 重塑数组
和变异方法相对的是不会改变原数组内容，但总是返回一个新数组的非变异方法。例如：
filter( )、concat( )、slice( )。使用以上的方法可以用新数组替换旧数组。
```js
    example1.items = example1.items.filter(function(item){
        return item.message.match(/Foo/)
    }) 
```
Vue使用了一些方法来最大化地重用DOM元素，用一个含有相同元素的数组去替代原数组是非常高效的。

#### 注意事项
由于JS的限制，Vue不能检测以下变动的数组：

1.利用索引直接设置一个项时，例如：
```js
    vm.items[indexOfItem] = newValue;
```
2.修改数组的长度时，例如：
```js
    vm.items.length = newLength;
```
为了避免第一种情况，以下两种方式都可以达到第一种的目的，同时触发状态更新：
```js
    //Vue.set
    Vue.set(example1.items,indexOfItem,newValue);
    
    //Array.prototype.splice
    example1.items.splice(indexOfItem,1,newValue)
```
避免第二种情况：
```js
    example1.items.splice(newLength)
```

#### 显示过滤/排序结果
有时想要显示一个数组的过滤或排序副本，但是不修改或重置原始数据。这时可以创建返回过滤或排序数组的计算属性。
例如：
```js
    <ul>
	<li v-for="n in evenNumbers">{{ n }}</li>
    </ul>
    new Vue({
	el:"ul"
	,data: {
	    numbers: [ 1, 2, 3, 4, 5 ]
	}
	,computed:{
	    evenNumbers:function(){
	        return this.numbers.filter(function(number){
	            return number % 2 === 0
	        })
	    }
	}
    })
```
也可以在不适用计算属性情况下（例如在嵌套的列表渲染中）使用method方法
```js
    <ul>
        <li v-for="n in even(numbers)">{{ n }}</li>
    </ul>
    
    new Vue({
	el:"ul"
	,data: {
	    numbers: [ 1, 2, 3, 4, 5 ]
	},
	methods:{
	    even:function(numbers){
	        return numbers.filter( (number) => number %2 === 0 );
	    }
	}
    })
```

## 事件处理器
### 监听事件
用 v-on 指令监听DOM事件来触发JavaScript代码。

```js
    <div id="example-1">
		<button v-on:click="counter += 1">增加1</button>
		<p>这个按钮被点击了{{ counter }}次</p>
	</div>
	
    var example1 = new Vue({
	el:'#example-1',
	data:{
	    counter: 0
	}
    })
```

### 方法事件处理器
直接使用行间事件处理对于逻辑复杂的代码时不可行的。因此可以定义一个事件来调用。

```js
    <div id="example-2">
	<button v-on:click="greet">Greet</button>
    </div>
	
    var example2 = new Vue({
	el:"#example-2",
	data:{
	    name :"Vue.js"
	},
	methods:{
	    greet:function(ev){
		alert("Hello" + this.name + "!")
	        if(ev){
		    alert(ev.target.tagName.toLowerCase())
		}
	    }
	}
    })
```

或者直接调用：
```js
    example2.greet();
```

### 内联处理器方法
除了绑定一个方法，还可以使用内联JS语句：
```js
    <div id="example-3">
	<button @click="say('hi')">Say hi</button>
	<button @click="say('what')">Say What</button>
    </div>
	
    new Vue({
	el:'#example-3',
	methods:{
	    say: function(message){
		alert(message)
	    }
	}
    })
```

还可以在内联语句处理器中访问原生DOM事件。用特殊的变量$event传入即可：

```js
    <div id="example-4">
	<button @click="warn('Form cannot be submitted yet.',$ev)">
	    Submit
	</button>
    </div>
	
    new Vue({
	el:"#example-4",
	methods:{
	    warn:function(message,ev){
		if(ev) ev.preventDefault()
		alert(message)
            }
	}
    })
```

### 事件修饰符
在原生JS中往往需要手动的去处理事件冒泡、阻止默认行为。在Vue中，可以把这些都放到methods中去处理，但是有更好的方式，v-on提供了修饰符来处理DOM事件细节。由点(.)表示的指令后缀来调用修饰符。

 - .stop
 - .prevent
 - .capture
 - .self
 - .once
 
示例：
```js
    <div id="div" @click="clickme">
	<section id="section" @click.stop="clickme">
		<p id="p" @click="clickme"> 
		    <span id="span" @click.once="clickme">
			<a href="www.baidu.com" title="" @click.prevent="clickme">Click me!</a>
	        </span>
	    </p>
	</section>
	点击事件的响应顺序如下：{{ message }}
    </div>
	
	var v1 = new Vue({
	    el:"#div",
	    data:{
		message:""
	    },
	    methods:{
		clickme:function(event){
		    if(this.message === ""){
			this.message = event.currentTarget.id
		    }else{
			this.message = this.message + '->' + event.currentTarget.id
		    }
		}
	    }
	})
	
	/*
	    如果不采用阻止默认行为，冒泡，那么a会跳转链接，即使阻止后不跳转，那么内容也是 span -> p -> section -> div(冒泡的事件流)	
	    而如果采用了以上代码的书写，那么结果是 span -> p -> section -> p -> section ...
	*/
	
```
修饰符的具体作用如下：
```js

    <!-- 阻止单击事件冒泡 -->
    <a v-on:click.stop="doThis"></a>
    
    <!-- 提交事件不再重载页面 -->
    <form v-on:submit.prevent="onSubmit"></form>
    
    <!-- 修饰符可以串联  -->
    <a v-on:click.stop.prevent="doThat"></a>
    
    <!-- 只有修饰符 -->
    <form v-on:submit.prevent></form>
    
    <!-- 添加事件侦听器时使用事件捕获模式 -->
    <div v-on:click.capture="doThis">...</div>
    
    <!-- 只当事件在该元素本身（而不是子元素）触发时触发回调 -->
    <div v-on:click.self="doThat">...</div>
    
    <!-- 点击事件将只会触发一次 -->
    <a v-on:click.once="doThis"></a>
    
```

### 按键修饰符
Vue允许v-on在监听键盘事件是添加按键修饰符
```js
    <div id="div">
        <input v-on:keyup.13="fn">
    </div>
	
    var v2 = new Vue({
	el:"#div",
	methods:{
	    fn:function(ev){
		console.log(ev.keyCode)
	    }
	}
    }) 
    
    /*< !-- Vue为常用的按键提供了别名： --  */
    <!-- 缩写语法 -->
    <input @keyup.enter="submit">
```

全部的按键别名：

 - .enter
 - .tab
 - .delete (捕获 “删除” 和 “退格” 键)
 - .up
 - .down
 - .left
 - .right
 - space
 
还可以通过全局 config.keyCodes 对象自定义按键修饰符别名：
```js
    //可以使用 v-on:keyup.f1
    Vue.config.keyCodes.f1 = 112
```

> 2.1.0新增

 - .ctrl
 - .alt
 - .shift
 - .meta

### 为什么在 HTML 中监听事件？
Vue的事件绑定函数都在行间上定义了，或者绑定的是函数名，这样背离了结构、样式、行为分离的传统观点。但是在Vue中事件处理方法和表达式都绑定在当前视图的ViewModel上，不会导致维护上的困难。使用v-on有以下的好处：

 1. HTML 模板和JS代码的方法两者之间很容易定位
 2. 无需在JS中手动绑定事件，ViewModel代码是纯粹的逻辑，和DOM完全解藕，更容易测试。
 3. 当ViewModel被销毁时，所有的事件处理器都会被自动移除，有利于释放内存。

## 表单控件绑定

### 基础用法
使用 v-model 可以在表单控件元素上创建双向数据绑定。

#### 文本
```js
    <div>
	<input v-model="message" placeholder="edit me">
	<p>Message is : {{ message }}</p>
    </div>
    new Vue({
	el:"div",
	data:{
	    message:''
	}
    })
```

#### 多行文本
```js
    <div>
	<span>Multiline message is:</span>
	<p style="white-space:pre">{{ message }}</p>
	<br>
	<textarea v-model="message" placeholder="add multiple lines"></textarea>
    </div>
	
    new Vue({
	el:"div",
	data:{
	    message:''
	}
    })
```
#### 复选框
单个勾选框
```js
    <div>
	<input type="checkbox" name="" id="check" v-model="checked">
	<label for="checkbox">{{ checked }}</label>
    </div>
	
    new Vue({
	el:"div",
	data:{
	    checked:'true'
	}
    })
```

多个勾选框，绑定到同一个数组：

```js   
    <div id="div">
	<input type="checkbox" id="jack" value="Jack" v-model="checkedNames">
	<label for="jack">Jack</label>
	<input type="checkbox" id="john" value="John" v-model="checkedNames">
	<label for="john">John</label>
	<input type="checkbox" id="mike" value="Mike" v-model="checkedNames">
	<label for="mike">Mike</label>
	<br>
	<span>Checked names: {{ checkedNames }}</span>
    </div>
	//注意checkedNames是数组
    new Vue({
	el: '#div',
	data:{
	    checkedNames :[]
	}
    })
```
 
#### 单选按钮
```js
    <div>
	<input type="radio" id="one" value="One" v-model="picked">
	<label for="one">One</label>
	<br>
	<input type="radio" id="two" value="Two" v-model="picked">
	<label for="two">Two</label>
	<br>
	<span>Piced:{{ picked }}</span>
    </div>
	
    new Vue({
	el:"div",
	data:{
	    picked:""
	}
    })
```

#### 选择列表

单选列表：

```js
    <div>
        <select v-model="selected">
	    <option disabled value="">Please select one</option>
	    <option>A</option>
	    <option>B</option>
	    <option>C</option>
	</select>
	<span>Selected : {{ selected }}</span>
    </div>
	
    new Vue({
        el:"div",
	data:{
	    selected:""
	}
    })
```

> 如果v-model的初始值没有匹配任何的选项，select元素会渲染为"unselected"状态。在IOS中会导致无法选择第一项，因为这种情况下IOS没有启动change event，因此建议像以上的例子一样，给disabled的option设定一个空值value。

多选列表(绑定到一个数组)：
```js
    <div>
	<select v-model="selected" multiple>
	    <option>A</option>
	    <option>B</option>
	    <option>C</option>
	</select>
	<br>
	<span>Selected:{{ selected }}</span>
    </div>
	
    new Vue({
	el:"div",
	data:{
	    selected:""
	}
    })
```

动态选项，使用v-for列表渲染：

```js
    <div>
	<select v-model="selected">
	    <option v-for="option in options" v-bind:value="option.value">
		{{ option.text }}
	    </option>
	</select>
	<span>Selected: {{ selected }}</span>
    </div>
	
    new Vue({
	el:"div",
	data:{
	    selected:"A",
	    options:[
		{ text: 'One', value: 'A' },
  		{ text: 'Two', value: 'B' },
  		{ text: 'Three', value: 'C' }
	    ]
	}
    })
```
### 绑定value
对于单选按钮，勾选框及选择列表选项， v-model 绑定的 value 通常是静态字符串（对于勾选框是逻辑值）：
```js
    /* <!-- 当选中时，`picked` 为字符串 "a" --> */
    <input type="radio" v-model="picked" value="a">
    
    /* <!-- 初始时在控制台下输入vm.picked结果为"" 勾选后得到"a" --> */
    var vm = new Vue({
	el:"div",
	data:{
	    picked:''
	}
    })
	
    <!-- `toggle` 为 true 或 false -->
    <input type="checkbox" v-model="toggle">
    /* <!-- 同上可知，初始时在控制台下输入vm.toggle结果为"" ，
            勾选后得到"true"，之后为false --> */
    var vm = new Vue({
	el:"div",
	data:{
	    toggle:''
	}
    })
	
    <!-- 当选中时，`selected` 为字符串 "abc" -->
    <select v-model="selected">
      <option value="abc">ABC</option>
    </select>
```

有时候绑定value到实例上的一个动态属性上，可以使用v-bind实现，并且可以不是字符串。
#### 复选框
```js
    <div id="ooo">
	<input type="checkbox" v-model="toggle" :true-value="a" :false-value="b">
    </div>
    var app2 = new Vue({
        el: '#ooo',
        data: {
            toggle: '',
            a: {
        	v:"Messi",
        	champion:"Millan"
            },
            b: false
        }
    })
    /* 
        <!-- 
             初始时在控制台下输入app2.toggle结果为"" ，勾选后得到的是一个对象
             Object{__ob__: Observer}，需要再次调用对象的属性才能获取值
             再次输入app2.toggle.v
             "Messi"
             app2.toggle.champion
             "Millan"
        -->
    */
```

#### 单选按钮
```js
    <div id="ooo">
	    <input type="radio" v-model="pick" :value="a">
	</div>
	var app2 = new Vue({
        el: '#ooo',
        data: {
           	pick: '',
           	a:"leo"
        }
    })
```

#### 选择列表设置
```js
    <div id="ooo">
	    <select v-model="selected">
	    	<option :value="{ number:123 }">123</option>
	    </select>
	</div>
	
	var app2 = new Vue({
        el: '#ooo',
        data:{
           	selected:[]
        }
    })
    //当选中时
    typeof app2.selected //'object'
    app2.selected.num //"123"
```
### 修饰符
#### .lazy
默认情况下，v-model会使用双向绑定，同步输入框的值与数据，而使用该修饰符可以变为在 change 事件中才发生同步：
```js
    <div id="ooo">
	    <input v-model.lazy="msg" >
	    <p>{{ msg }}</p>
	</div>
	/*输入完成之后enter才可以同步*/
	var app2 = new Vue({
        el: '#ooo',
        data: {
           msg:''	
        }
    })
```

#### .number
如果想自动将用户的输入值转为 Number 类型（如果原值的转换结果为 NaN 则返回原值），可以添加一个修饰符 number 给 v-model 来处理输入值：
```js
    /*
        此处和文档有出入，默认text类型input下.number修饰符是有效的，
        number类型input输入e会value会被清空
    */
    <input v-model.number="age">
```
#### .trim
如果要自动过滤用户输入的首尾空格，可以添加 trim 修饰符到 v-model 上过滤输入：
```js
    /*此处和文档也有出入，无效！*/
    <input v-model.trim="msg">
```

## 组件
### 什么是组件？
有了一些模块化的基础认识，再来看组件，理解起来应该是组件更强调复用，并没有上下级的包含关系。模块强调的是高内聚，低耦合，而组件则显得更加松散，这样才可以更容易运用到项目中去。

### 使用组件
#### 注册
可以通过构造函数的方式创建一个Vue实例：
```js
    new Vue({
        el:"#some-element"
    })
```
如果要注册全局组件，可以使用Vue.component(tagName,options)，例如：
```js
    Vue.component('my-component', {
      // 选项
    })
```
组件在注册之后就可以在父实例的模块中以自定义元素 my-component 的形式使用。在初始化根实例之前注册了组件：
```js
    <div id="example">
        <my-component></my-component>
    </div>
    //注册
    Vue.component("my-component",{
        template:'<div>A custom component!</div>'
    })
    //创建根实例
    new Vue({
        el:"#example"
    })
```
渲染为：
```js
    <div id="example">
        <div>A custom component!</div>
    </div>
```

#### 局部注册
不必在全局注册每个组件。通过实例选项注册，可以使组件在另一个实例、组件的作用域中可用：
```js
    var Child = {
        template:'<div>A custom component!</div>'
    }
    
    /*注意该选项是components*/
    new Vue({
        el:"#example",
        components:{
            'my-component':Child
        }
    })
```
这种封装也适用于其他可注册的Vue功能，比如指令。

#### DOM模板解析说明

当使用DOM作为模板（将el选项挂载到一个已存在的元素上），这样会受到HTML的一些限制，因为Vue只会在浏览器解析或标准化HTML之后才能获取模板内容。而且有些元素限制了能被它包裹的元素，option只能出现在其他元素的内部。

在自定义组件时，使用受限制的元素会导致一些问题：

```js
    <table>
        <my-row>...</my-row>
    </table>
```
自定义组件 my-row会被认为是无效的内容，导致渲染错误。解决方式是使用特殊的 is 属性：

```js
    <table>
        <tr is="my-row"></tr>
    </table>
```
如果使用来自以下来源之一的字符串模板，则可以突破限制：

 - <script type="text/x-template">
 - JavaScript内联模版字符串
 - .vue 组件

#### data 必须是函数
使用组件时，传入到Vue构造函数中的选项可以在注册组件时使用，但有一个例外是， data 必须是函数。理解的过程：
```js
    <div id="example-2">
	<simple-counter></simple-counter>
	<simple-counter></simple-counter>
        <simple-counter></simple-counter>
    </div>
	
    var data = { counter: 0 }
    Vue.component('simple-counter', {
	template: '<button v-on:click="counter += 1">{{ counter }}</button>',
	// data 是一个函数，因此 Vue 不会警告，
	// 但是我们为每一个组件返回了同一个对象引用
	data:function (){
	    return data
	}
    })
    new Vue({
	el: '#example-2'
    })
```
而数据引用同一个对象的结果就是，button中的数值会保持"同步"，这显然不是我们期望看到的。通过为每个组件返回新的对象来解决这个问题，这样每个counter都拥有自己内部的状态：
```js
    data:function(){
        return {
            counter: 0
        }
    }
```

#### 构成组件
组件之间需要协同工作，组件A在模板中使用组件B，他们之间需要相互通信，父组件给子组件传递数据，子组件需要将内部发生的告知给父组件。而组件之间的解耦也是很重要的，保证每个组件可以在相对隔离的环境中书写和理解，增加组建的可维护性和可复用性。

在Vue中父组件通过props向下传递数据给子组件，子组件通过events给父组件发送消息。

### Prop

#### 使用Prop传递数据

组件实例的作用域是孤立的，这意味着不能且不应该在子组件的模板内直接引用父组件的数据。可以使用 props 把数据传递给子组件。

prop是父组件传递数据的一个自定义属性。子组件需要显式地用 prop 选项声明"prop"：

```js
    <div id="app">
	<child message="hello!"></child>
    </div>
    /* < ! -- 切记创建根实例之前注册组件！  -- > */
    Vue.component('child',{
	props:['message'],
	template:'<span>{{ message }}</span>'
    })
    new Vue({
	el:"#app"
    })
```

#### 短横线命名式 VS 驼峰命名式

HTML特性是不区分大小写，所以使用非字符串模板时，驼峰式命名的 prop 需要转换为相应的短横线命名式：
```js
    <div id="app">
	<child my-message="hello!"></child>
    </div>
	
    Vue.component('child', {
    // camelCase in JavaScript
	props: ['myMessage'],
        template: '<span>{{ myMessage }}</span>'
    })
    new Vue({
        el:"#app"
    })
```

> 如果使用字符串模板，可以不遵守这些限制！

#### 动态Prop

与 v-bind 绑定HTML特性到表达式类似，也可以使用 v-bind 动态绑定 props 的值到父组件的数据中。每当父组件的数据变化时，该变化也会传导给子组件：
```js
    <div id="app">
	<input v-model="parentMsg">
	<br>
	<child :my-message="parentMsg"></child>
    </div>
	
    Vue.component('child', {
	props: ['myMessage'],
	template: '<span>{{ myMessage }}</span>'
    })
    new Vue({
	el:"#app",
	data:{
	    parentMsg : 'Message from parent'
	}
    })
```

#### 字面量语法 VS 动态语法

如果使用字面量，那么它的值是以字符串"1"传递下去，而不是实际的数字。
```js
    /* <!-- 传递了一个字符串"1" --> */
    <comp some-prop="1"></comp
```
如果想传递实际的数字，那么需要动态的绑定数据，使这个值被当做JS表达式计算：
```js
    /* <!-- 传递实际的数字 --> */
    <comp :some-prop="1"></comp>
```

简单理解就是：
（1）、不加 v-bind 传递的就是字符串，哪怕是数字1，也是一个字符串，而不是Number
（2）、加 v-bind 传递的就是Javascript 表达式，这样才能传递父组件中的值
（3）、加 v-bind 以后，如果能找到父组件的值，就使用父组件的值；如果找不到i，就看成是一个Javascript 表达式（例如1+2看做3，{a:1}看做是一个对象）

#### 单向数据流
prop 是单向绑定：当父组件变化时会传递给子组件，但是相反的方向并不会引起改变。每次父组件数据更新时，子组件的所有 prop 都会更新为最新值。这也意味着不应该在组件内部改变 prop。如果这么做了，Vue会在控制台给出警告。

```js
    <div id="app">
	    父组件：
	    <input v-model="msg">
	    <hr>
	    子组件：
	    <child :message="msg"></child>
	</div>
	
	var vm = new Vue({
        el:'#app',
        data:{
            msg:'Hello World'
        },
        components:{
            'child':{
                props:['message'],
                template:'<input v-model="message">'
            }
        }
    })
```
当父组件数据改变时，子组件内容也会变化，但是如果反过来修改子组件的值，控制台就会报错。

通常有两种改变 prop 的情况：

 1. prop 作为初始值传入，子组件之后只是将它的初始值作为本地数据的初始值使用；
 2. prop 作为需要被转变的原始值传入。
 
更确切的说这两种情况是：

1.定义一个局部 data 属性，并将 prop 的初始值作为局部数据的初始值。

```js
    props:['initialCounter'],
    data:function(){
        return { 
            counter: this.initialCounter 
        }
    }
```

2.定义一个 computed 属性，此属性从 prop 的值计算得出。
```js
    props: ['size'],
    computed: {
        normalizedSize:function(){
            return this.size.trim().toLowerCase()
        }
    }
```
> 在JavaScript中对象和数组是引用类型，指向同一个内存空间，如果prop是一个对象或数组，在子组件内部改变它会影响父组件的状态。

> ！！！改变 prop 的两种情况没理解，过后再深入思考

#### Prop验证
组件可以为 props 指定验证请求。如果未指定验证要求，Vue会发出警告。
prop是一个对象而不是字符串数组时，它包含验证要求：

```js
    Vue.component('example',{
        props:{
            propA:Number,
            propB:[String,Number],
            propC:{
                type:String,
                required:true
            },
            propD:{
                type:Number,
                default:100
            },
            propE:{
                type:Object,
                default:function(){
                    return{
                        message:'hello'
                    }
                }
            },
            propF:{
                validator:function(value){
                    return value > 10
                }
            }
        }
    })
```
type 可以是下面原生构造器：

 - String
 - Number
 - Boolean
 - Function
 - Object
 - Array
 
type 也可以是一个自定义构造器，使用 instanceof 检测。
当 prop 验证失败了，如果使用的是开发版本会抛出一条警告。

总结：子组件如果要想获取父组件data，在调用子组件时，
```js
    //在调用子组件：
    <someElement :m='数据'></someElement>
    
    //子组件内：
    props:['m','myMsg']
    
    props:{
        'm':String,
        'myMsg':Number
    }
```

### 自定义事件
父组件可以使用 props 传递数据给子组件，但如果子组件要把数据传递回去，就需要自定义事件。

#### 使用 v-on 绑定自定义事件
每个Vue实例都实现了**事件接口**：

 - 使用$on(eventName)监听事件
 
 - 使用 $emit(eventName) 触发事件
 

> Vue的事件系统分离自浏览器的EventTarget API。尽管它们的运行类似，但是$on 和 $emit 不是addEventListener 和 dispatchEvent 的别名。

另外，父组件可以在使用子组件的地方直接用 v-on 来监听子组件触发的事件。

示例一：
```js
    <div id="app">
        父组件：<br>
        <p>{{total}}</p>
        子组件：<br>
        <button-counter @increment="incrementTotal"></button-counter>
        <button-counter @increment="incrementTotal"></button-counter>
    </div>
    var vm = new Vue({
        el: '#app',
        data: {
            total: 0
        },
        methods: {
            incrementTotal: function() {
                this.total += 1;
            }
        },
        components: {
            'button-counter': {
                props: [],//父组件并没有往子组件传出数据，所以不需要
                template: '<button @click="increment">{{ counter }}</button>',
                data: function() {//data必须是一个函数并返回一个对象
                    return {
                        counter: 0
                    }
                },
                methods: {
                    increment: function() {
                        this.counter += 1;
                        this.$emit('increment');
                    }
                }
            }
        }
    })
```

这个例子中，子组件已经完全和它外部完全解耦了。它所做的只是触发一个父组件关心的内部事件

##### 给组件绑定原生事件
有时候，你可能想在某个组件的根元素上监听一个原生事件。可以使用 .native 修饰 v-on 。例如：
```js
    <my-component v-on:click.native="doTheThing"></my-component>
```

#### 使用自定义事件的表单输入组件

自定义事件也可以用来创建自定义的表单输入组件，使用 v-model 来进行数据双向绑定。
要让组件的 v-model 生效，它应该:

 - 接受一个 value 属性
 - 在有新的 value 时触发 input 事件
 
注意引用了 rawGit 转换后的gitHub上的第三方代码：`https://cdn.rawgit.com/chrisvfritz/5f0a639590d6e648933416f90ba7ae4e/raw/98739fb8ac6779cb2da11aaa9ab6032e52f3be00/currency-validator.js`

```js
    <div id="app">
        <currency-input 
            label="Price" 
            v-model="price"
        >
        </currency-input>
        <currency-input 
            label="Shipping" 
            v-model="shipping"
        >           
        </currency-input>
        <currency-input 
            label="Handling" 
            v-model="handling"
        >
        </currency-input>
        <currency-input 
            label="Discount" 
            v-model="discount"
        >          
        </currency-input>
      <p>Total: ${{ total }}</p>
    </div>
    <script src="https://cdn.rawgit.com/chrisvfritz/5f0a639590d6e648933416f90ba7ae4e/raw/98739fb8ac6779cb2da11aaa9ab6032e52f3be00/currency-validator.js"></script>
    <script>
        Vue.component('currency-input',{
            template: '\
                <div>\
                    <label v-if="label">{{ label }}</label>\
                    $\
                    <input\
                        ref="input"\
                        v-bind:value="value"\
                        v-on:input="updateValue($event.target.value)"\
                        v-on:focus="selectAll"\
                        v-on:blur="formatValue"\
                    >\
                </div>\
            ',
            props: {
                value:{
                    type: Number,
                    default: 0
                },
                label: {
                    type: String,
                    default: ''
                }
            },
            mounted: function () {
                this.formatValue()
            },
            methods: {
                updateValue: function(value){
                    var result = currencyValidator.parse(value, this.value)
                    if (result.warning) {
                        this.$refs.input.value = result.value
                    }
                        this.$emit('input',result.value)
                },
                formatValue: function () {
                    this.$refs.input.value = currencyValidator.format(this.value)
                },
                selectAll: function (event){
                // Workaround for Safari bug
                // http://stackoverflow.com/questions/1269722/selecting-text-on-focus-using-jquery-not-working-in-safari-and-chrome
                    setTimeout(function () {
                        event.target.select();
                    },0)
                }
            }
        })

        new Vue({
            el: '#app',
            data: {
                price: 0,
                shipping: 0,
                handling: 0,
                discount: 0
            },
            computed: {
                total: function (){
                    return ((
                        this.price * 100 + 
                        this.shipping * 100 + 
                        this.handling * 100 - 
                        this.discount * 100
                    ) / 100).toFixed(2)
                }
            }
        })
```

> ！！！先不要求完整看懂，需要知道几点： props 验证、双向绑定、自定义事件表单组件。

> 核心的两步：vm.$emit(自定义事件名, 数据)  <!-- 自定义事件名不推荐驼峰命名法-->
              v-on:自定义事件名= 方法


### 使用 Slot 分发内容
在使用组件时，有时需要组合他们使用，需要注意两点
```js
    <app>
        <app-header></app-header>
        <app-footer></app-footer>
    </app>
```

 1. app 组件不知道它的挂载点会有什么内容。挂载点的内容是由<app>的父组件决定的。
 2. app 组件很可能有它自己的模版。

原文档之后的解释并不特别清晰，直接来一段代码理解：
```js
    <div id="app">
        <parent>
            <div>
                <ul>
                    <li>苹果</li>
                    <li>香蕉</li>
                    <li>橙子</li>
                </ul>
            </div>
        </parent>
    </div>
    
    var vm = new Vue({
        el:'#app',
        components:{
            'parent':{
                template:'<h1>水果，水果，在哪里？</h1>'
            }
        }
    })
```
打开审查元素可以看到，结构中有子组件中定义的模板 h1 并没有ul元素。解决的方式就是使用**内容分发**。文档中提到的 slot 插槽。简单的意思就是占个位置。

#### 1.单个slot
 除非子组件模板包含 slot，否则父组件的内容将被抛弃。如果子组件模板只有一个没有疼特性的 slot，父组件的整个内容将插入 slot 所在位置，并替换。
 
将以上例子的代码修改：

```js
    <div id="app">
        <parent>
            <div>
                <ul>
                    <li>苹果</li>
                    <li>香蕉</li>
                    <li>橙子</li>
                </ul>
            </div>
        </parent>
    </div>
    <template id="fruit">
        <div>
            <h1>水果，水果，在哪里？</h1>
            <slot></slot>
        </div>
    </template>
    var vm = new Vue({
        el:'#app',
        components:{
            'parent':{
                template:'#fruit'
            }
        }
    })
```
slot 标签的内容视为回退内容，它在子组件的作用域内编译，当宿主元素为空并且没有内容插入时，显示这个回退内容。也就是说，在父组件 parent 内容为空时，slot中的内容会插入这个空位。

#### 2.具名slot
slot 元素可以用一个特殊特性 name 配置如何分发内容，多个 slot 可以有不同的名字，具名的 slot 将匹配内容片段中有对应 slot 特性的元素。

仍然可以有一个匿名 slot，作为找不到匹配的内容片段的回退插槽，它是默认 slot。如果没有默认 slot，这些找不到匹配的内容片段将被抛弃。

```js
    <div id="app">
        <parent>
            <div>
                <ul slot="fruit-slot">
                    <li>苹果</li>
                    <li>香蕉</li>
                    <li>橙子</li>
                </ul>
                <ul slot="turnip-slot">
                    <li>白萝卜</li>
                    <li>红萝卜</li>
                    <li>绿萝卜</li>
                </ul>
            </div>
        </parent>
        <hr>
        <parent>
     
        </parent>
    </div>
    <template id="fruit">
        <div>
            <h1>水果，水果，在哪里？</h1>
            <slot name="fruit-slot">默认情况一</slot>
            <slot>默认情况下</slot>
            <slot name="turnip-slot">默认情况二</slot> 
        </div>
    </template>
    
    var vm = new Vue({
        el:'#app',
        components:{
            'parent':{
                template:'#fruit'
            }
        }
    })
```
slot 元素为空时则无效，还有一点就是同一级具名 slot 会匹配对应的内容，如果匹配项之一与 parent 内的不符，那么以具名 slot 中的内容为准，比如：
```js
    <parent>
        <div>
            <ul slot="fruit-slot">
                <li>苹果</li>
                <li>香蕉</li>
                <li>橙子</li>
            </ul>
            <span>
                
            </span>
            <ul slot="turnip-slot">
                <li>白萝卜</li>
                <li>红萝卜</li>
                <li>绿萝卜</li>
            </ul>
        </div>
    </parent>
    <template id="fruit">
        <div>
            <h1>水果，水果，在哪里？</h1>
            <slot name="fruit-slot">默认情况一</slot>
            <slot name="fru">默认情况下</slot>
            <slot name="turnip-slot">默认情况二</slot> 
        </div>
    </template>
```
修改后的具名 slot 与上面的内容不能完全匹配，最终得到的结果是具名 slot 中的内容，并**不包含** ul 列表元素的任何元素。

### 动态组件
多个组件可以使用同一个挂载点，然后动态地在它们之间切换。使用保留的 component 元素，动态地绑定到它的 is 特性
```js
    <component :is="组件名称"></component>
```

示例一：
```js
    <div id="app">
        <div class="radio">
            <label for="one">
                <input type="radio" id="one" value="fast" v-model="currentView"> Six
            </label>
        </div>
        <div class="radio">
            <label for="two">
                <input type="radio" id="two" value="bus" v-model="currentView"> Thirteen
            </label>
        </div>
        <div class="radio">
            <label for="three">
                <input type="radio" id="three" value="business" v-model="currentView"> Eight
            </label>
        </div>
        <fast v-show="show"></fast>
     
        <bus v-show="show"></bus>
     
        <business v-show="show"></business>
     
        <component :is="currentView">
            /* <!--组件在 vm.currentView 变化时改变--> */
        </component>
    </div>
    
    var vm = new Vue({
        el:'#app',
        data:{
            currentView:'fast',
            show:false
        },
        components:{
            'fast':{
                template:'<h2>朝阳门</h2>'
            },
            'bus':{
                template:'<h2>望京</h2>'
            },
            'business':{
                template:'<h2>森林公园</h2>'
            }
        }
    })
```

通过 is 属性绑定 currentView 值，点击选项时，切换展示的组件。

#### keep-alive
在动态组件之后增加该属性，切换时之前的组件将保留在内存中，避免页面的重复渲染，提升视图更新的性能。

```js
    <component :is="currentView" kepp-alive>
        /* <!--组件在 vm.currentView 变化时改变--> */
    </component>
```
