> Vue官方文档同步学习，掌握基本语法和基础知识之后引入Demo巩固学习。
>> 文档晦涩艰深的部分没有实际例子作为补充，特此引入，理解用法与作用。

## Vue 基础篇

- [Vue实例与模板语法](https://github.com/Corbusier/Awesome-Vue/issues/1)
- [计算属性](https://github.com/Corbusier/Awesome-Vue/issues/2)
- [Class 与 Style绑定](https://github.com/Corbusier/Awesome-Vue/issues/3)
- [条件渲染与列表渲染](https://github.com/Corbusier/Awesome-Vue/issues/4)
- [事件处理器](https://github.com/Corbusier/Awesome-Vue/issues/5)
- [表单控件绑定](https://github.com/Corbusier/Awesome-Vue/issues/6)
- [组件](https://github.com/Corbusier/Awesome-Vue/issues/7)

## Vue 进阶篇

- [深入响应式原理](https://github.com/Corbusier/Awesome-Vue/issues/8)
- [过渡效果](https://github.com/Corbusier/Awesome-Vue/issues/9)
- [过渡状态](https://github.com/Corbusier/Awesome-Vue/issues/10)
- [自定义指令](https://github.com/Corbusier/Awesome-Vue/issues/11)
- [Vue-Router入门『上』](https://github.com/Corbusier/Awesome-Vue/issues/12)
- [Vue-Router入门『下』](https://github.com/Corbusier/Awesome-Vue/issues/13)

## Vue-Demo

[简易计算器](https://corbusier.github.io/Awesome-Vue/My-Calculator/index.html)

[代码地址](https://github.com/Corbusier/Awesome-Vue/tree/master/My-Calculator)

### 简介
利用组件渲染html内容，通过prop传递数据给子组件，实现动态修改数据。将input的数据储存在对象中，进行运算时再push到string中计算。

### 功能
实现基本的加减乘除，包括浮点数。清除、开方及平方，删除上次输入项等功能。

### 改进
> 关于js浮点数格式的二进制表示法问题，这样会带来诸如`0.1+0.2 == 0.3 //false`的问题。为了保证浮点数计算的正确性，这个简易的计算器采用了先升幂再降幂的方式，处理浮点数计算。

截取demo中一段代码：
```js
    Exponentiation:function(){
	var n1 = (this.result(this.string)[0]).toString().split(".").length;
        var n2 = (this.result(this.string)[1]).toString().split(".").length;
        var n = Math.pow(10,Math.max(n1,n2));
        return n;
    }
	
    if(this.type == "plus"){
        this.inputShow.value = ( ( this.result(this.string)[1] )*this.Exponentiation() + ( this.result(this.string)[0] )*this.Exponentiation() ) /this.Exponentiation();
        this.inputShow.name = "type";
    }
```
