## XSwitch

XSwitch是一个可以高度自定义的全屏滑动jQuery插件。
你可以[点击这里](http://xxthink.com/XSwitch)查看效果。

### 如何使用

需要有一个基本的HTML结构

    <!-- 插件基本结构 -->
    <div id="container">
        <div class="sections">
            <div class="section" id="section0"></div>
            <div class="section" id="section1"></div>
            <div class="section" id="section2"></div>
            <div class="section" id="section3"></div>
        </div>
    </div>

需要一些基础的样式支持

    <style media="screen">
        /*简单reset*/
        * {
            margin: 0;
            padding: 0;
        }
        /*必须，关系到单个page能否全屏显示*/
        html,
        body {
            height: 100%;
            overflow: hidden;
        }
        #container,
        .sections,
        .section {
            /*必须，兼容，在浏览器不支持transform属性时，通过改变top/left完成滑动动画*/
            position: relative;
            /*必须，关系到单个page能否全屏显示*/
            height: 100%;
        }
        .section {
            /*有背景图时必须，关系到背景图能否全屏显示*/
            background-color: #000;
            background-size: cover;
            background-position: 50% 50%;
        }
        /*非必需，只是用来设置背景图，id不会被插件用到*/
        #section0 {
            background-image: url(img/img1.jpg);
        }
        #section1 {
            background-image: url(img/img2.jpg);
        }
        #section2 {
            background-image: url(img/img3.jpg);
        }
        #section3 {
            background-image: url(img/img4.jpg);
        }
        /*以下样式用来设置slider样式，可自行修改*/
        .pages {
            position:fixed;
            right: 10px;
            top: 50%;
            list-style: none;
        }
        .pages li {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #fff;
            margin: 15px 0 0 7px;
        }
        .pages li.active {
            margin-left: 0;
            width: 14px;
            height: 14px;
            border: 4px solid #FFFFFF;
            background: none;
        }
    </style>

并引入JQuery与插件

    <script src="js/jquery-1.12.3.min.js" charset="utf-8"></script>
    <script src="js/XSwitch.js" charset="utf-8"></script>

插件的调用

设置了两种调用插件的方法：

+ 方法一 通过给```div#container```添加属性```data-XSwitch```调用，插件将会使用默认配置，如
```
    <div id="container" data-XSwitch>
        ...
    </div>
```
+ 方法二 通过js调用，使用这种方法可设置参数
```
    <script>
    $('#container').XSwitch({
        direction: 'horizontal'
    });
    </script>
```
插件配置相关

    /*默认配置*/
    {
        selectors: {
            sections: '.sections', //容器类名
            section: '.section', //子容器类名，即每个单页
            page: '.pages', //slider类名 插件会生成一个ul侧边栏
            active: '.active' //被选中的slider下li的类名
        },
        index: 0,  //起始页下标
        easing: 'ease',  //动画类型，支持transition所有类型
        duration: 500,  //动画执行时间 单位毫秒
        loop: false, //是否支持循环滑动
        pagination: true, //是否分页
        keyboard: true, //是否支持键盘滚动事件
        direction: 'vertical', //滑动方向 默认为垂直 设置为 horizontal 将水平滑动
        callback: '' //滑动完成后的回调函数
    }

### 插件源码下载

+ [压缩版](http://xxthink.com/XSwitch/js/XSwitch-min.js)
+ [未压缩未注释版](http://xxthink.com/XSwitch/js/XSwitch.js)
+ [详细注释版](http://xxthink.com/XSwitch/js/XSwitch-Annotation.js)
+ [演示DEMO源码地址](https://github.com/XxinLiang/XSwitch)
