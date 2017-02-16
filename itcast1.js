/**
 * Created by liugang on 2017/2/16.
 */
(function (global) {
    var init;
    var document=global.document,
        arr=[],
        slice=arr.slice,
        push=arr.push;
    var itcast= function (selector, context) {
        return new itcast.prototype.init(selector,context); /// itcast()
    }

    itcast.fn=itcast.prototype={
        constructor:itcast,
        length:0,//保持itcast对象   在任何条件下都是伪数组
        toArray: function () {
            return Array.prototype.slice.call(this);
        },
        //get方法
        get: function (index) {
            //若为null或者undefined 就将所有元素以数组形式返回、
            if(index==null){
                return slice.call(this);
            }
            //根据索引值 获取对应的dom元素
            return this[index>=0?index-0:index-0+this.length];
        },
        eq: function (index) {
            return itcast(this.get(index));
        },
        first: function () {
            return itcast(this.get(0));
        },
        last: function () {
            return itcast(this.get(-1));
        }
    };
    init=itcast.fn.init= function (selector, context) {
        //过滤null  undefined
        if(!selector){
            return this;
        }
        //处理字符串类型
        if(itcast.isString(selector)){
            //html字符串<p>
            if(itcast.isHTML(selector)){
                //创建dom
                //将html字符串转换为html元素以伪数组形成存储在this上
               var doms=itcast.parseHTML(selector);
               Array.prototype.push.apply(this,doms);
            }else{
                //选择器
               var doms=select(selector,context);
                Array.prototype.push.apply(this,doms);
            }
        }
        //处理dom对象
        else if(itcast.isDOM(selector)){
            this[0]=selector;
            this.length=1;
        }
        //处理dom数组或者伪数组对象
        else if(itcast.isArrayLike(selector)){
            push.apply(this,selector);
        }
        //处理函数()
        //
        //
        else if(typeof selector==='function'){
            //首先判断dom树是否加载完毕
            //若加载完毕，就直接执行该函数
            if(itcast.isReady){
                selector();
            }else{
                ///没有加载完毕时，就将该函数先注册到DOMContentLoaded上
                document.addEventListener('DOMContentLoaded', function () {
                    itcast.isReady=true;
                    selector();
                });
            }
        }
    };
    init.prototype=itcast.fn;

    //提供可扩展的接口
    itcast.extend=itcast.fn.extend= function (source) {
        // for in枚举 source对象上的所有属性
        for(var k in source){
            this[k]=source[k];
        }
    };

    //分开书写
    //类型判断方法

    itcast.extend({
        isString: function (obj) {
            return typeof obj=='string';
        },
        //判断是否为html字符串
        isHTML: function (obj) {
            return (obj+'').charAt(0)==='<'&&//以‘<’开头
                (obj+'').charAt((obj+'').length-1==='>'&&(obj+'').length>=3);
        },
        //判断为元素节点
        isDOM: function (obj) {
            return 'nodeType' in obj&&obj.nodeType===1;
        },
        //判断是否为全局对象
        isWindow: function (obj) {
            return !!obj&&obj.window===obj;
        },
        //判断是否为伪数组或者  伪数组对象
        isArrayLike: function (obj) {
            var length=!!obj&&'length' in obj&&obj.length,
                type=itcast.type(obj);

            //过滤函数和window对象
            if(type=='function'||itcast.isWindow(obj)){
                return false;
            }
            return type ==='array'||length===0||typeof length==='number'&&length>0&&(length-1) in obj;
        }
    })
    //工具类
    itcast.extend({
        isReady:false,
        each: function (obj, callback) {
            for(var i=0;i<obj.length;i++){
                if(false==callback.call(obj[i],obj[i],i)){
                    break;
                }
            }
        },
        //将html字符串  转化为 html元素
        parseHTML: function (html) {
            //存储创建出来的所有元素节点
            var ret=[];
            var div=document.createElement('div');
            div.innerHTML=html;
            for(var i=0;i<div.childNodes.length;i++){
                if(div.childNodes[i].nodeType==1){
                    ret.push(div.childNodes[i]);
                }
            }
            //
            return ret;
        },
        type: function (obj) {
            if(obj==null){
                return obj+'';
            }
            return typeof obj=='object'?Object.prototype.toString.call(obj).slice(8,-1).toLowerCase():
                typeof obj;
        }
    });

    //选择器引擎
    //通过selector函数  来查询 dom元素
    var select= function (selector, context) {
        var ret=[];
        if(context){
            if(context.nodeType==1){
                return Array.prototype.slice.call(context.querySelectorAll(selector));
            }
            else if(context instanceof Array||(typeof context=='object'&&'length' in context)){
                for(var i=0;i<context.length;i++){
                    var doms=context[i].querySelectorAll(selector);
                    for(var j=0;i<doms.length;j++){
                        ret.push(doms[j]);
                    }
                }
            }
            else{
                return Array.prototype.slice.call(document.querySelectorAll(context+' '+selector));
            }
            return ret;
        }
        else{
            return Array.prototype.slice.call(document.querySelectorAll(selector));
        }
    }


//更新 itcast.isReady的值
     document.addEventListener('DOMContentLoaded', function () {
         itcast.isReady=true;
     })

    global.$=global.itcast=itcast;
}(window))