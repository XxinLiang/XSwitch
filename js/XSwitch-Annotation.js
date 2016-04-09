/* 闭包，防止全局变量污染，防止与其他第三方插件起冲突 */
(function ($) {
    $.fn.XSwitch = function (options) {
        /* 保持链式调用 */
        return this.each(function () {
            /* 单例模式 */
            var _this = $(this),
                instance = _this.data('XSwitch');

            if (!instance) {
                instance = new XSwitch(_this, options);
                _this.data('XSwitch', instance);
            }
            /* 可以在外部直接调用插件内部的方法 */
            if ($.type(options) === 'string') {
                return instance[options]();
            }
        });
    }
    /* 添加默认配置 */
    $.fn.XSwitch.defaults = {
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

    /* 获取浏览器前缀 */
    var _prefix = (function (temp) {
        var aPrefix = ['webkit', 'moz', 'o', 'ms'],
            props = '';
        for (var i = 0, len = aPrefix.length; i < len; i ++) {
            props = aPrefix[i] + 'Transition';
            if (temp.style[props] !== undefined) {
                return '-' + aPrefix[i].toLowerCase() + '-';
            }
            return false;
        }
    })(document.createElement('div'));

    var XSwitch = (function () {
        function XSwitch(element, options) {
            /* 深拷贝并合并 */
            this.settings = $.extend(true, $.fn.XSwitch.defaults, options);
            this.element = element;
            this.init();
        }
        XSwitch.prototype = {
            /* 初始化DOM操作，布局，分页及绑定事件 */
            init: function () {
                var _this = this;
                this.selectors = this.settings.selectors;
                /* 获取相应的DOM元素 */
                this.sections = this.element.find(this.selectors.sections);
                this.section = this.sections.find(this.selectors.section);

                /* 获取方向，垂直为true，水平为false */
                this.direction = this.settings.direction === 'vertical' ? true : false;
                /* 获取滑动页面数量 */
                this.pagesCount = this.pagesCount();
                /* 获取起始下标 */
                this.index = (this.settings.index >=0 && this.settings.index < this.pagesCount) ? this.settings.index : 0;
                /* 用于判断页面是否滚动中 */
                this.canScroll = true;

                /* 如果为横屏，进行横屏布局 */
                if (!this.direction) {
                    _initLayout(_this);
                }
                /* 如果设置可分页，实现分页的DOM及CSS样式 */
                if (this.settings.pagination) {
                    _initPaging(_this);
                }
                /* 绑定事件 */
                _initEvent(_this);
            },
            /* 获取滑动页面数量 */
            pagesCount: function () {
                return this.section.size();
            },
            /* 根据方向获取滑动页面的高度或宽度 */
            switchLength: function () {
                return this.duration ? this.element.height() : this.element.width();
            },
            /* 向上/前滑动 */
            prve: function () {
                var _this = this;
                /* 边界值判断 */
                if (this.index > 0) {
                    this.index --;
                } else if (this.settings.loop) {
                    this.index = this.pagesCount - 1;
                }
                _scrollPage(_this);
            },
            /* 向下/后滑动 */
            next: function () {
                var _this = this;
                if (this.index < this.pagesCount) {
                    this.index ++;
                } else if (this.settings.loop) {
                    this.index = 0;
                }
                _scrollPage(_this);
            }
        };
        /* 私有方法 */
        /* 横屏布局 */
        function _initLayout(_this) {
            var width = (_this.pagesCount * 100) + '%',
                cellWidth = (100 / _this.pagesCount).toFixed(2) + '%';

            _this.sections.width(width);
            _this.section.width(cellWidth).css('float', 'left');
        }
        /* 实现分页的DOM结构以及CSS样式 */
        function _initPaging(_this) {
            /* 去点 */
            var pagesClass = _this.selectors.page.substring(1),
                pageHtml = '<ul class="' + pagesClass + '">';
            _this.activeClass = _this.selectors.active.substring(1);

            for (var i = 0, len = _this.pagesCount; i < len; i ++) {
                pageHtml += '<li></li>';
            }
            pageHtml += '</ul>';

            _this.element.append(pageHtml);
            var pages = _this.element.find(_this.selectors.page);
            _this.pageItem = pages.find('li');
            _this.pageItem.eq(_this.index).addClass(_this.activeClass);
            if (_this.direction) {
                pages.addClass('vertical');
            } else {
                pages.addClass('horizontal');
            }
        }
        /* 绑定事件 */
        function _initEvent(_this) {
            /* slider li点击事件 */
            _this.element.on('click', _this.selectors.page + ' li', function () {
                _this.index = $(this).index();
                _scrollPage(_this);
            });
            /* 鼠标滚轮事件 */
            _this.element.on('mousewheel DOMMouseScroll', function (e) {
                /* 判断动画是否执行，在执行中则不重复触发 */
                if (!_this.canScroll) {
                    return;
                }
                /* 兼容火狐 || chrome || IE9+ */
                var delta = -e.originalEvent.detail || -e.originalEvent.deltaY || e.originalEvent.wheelDelta;

                if (delta > 0 && (_this.index && !_this.settings.loop || _this.settings.loop)) {
                    _this.prve();
                } else if (delta < 0 && (_this.index < (_this.pagesCount - 1) && !_this.settings.loop || _this.settings.loop)) {
                    _this.next();
                }
            });
            /* 键盘事件 */
            if (_this.settings.keyboard) {
                $(window).on('keydown', function (e) {
                    var keyCode = e.keyCode;
                    if (keyCode === 37 || keyCode === 38) {
                        _this.prve();
                    } else if (keyCode === 39 || keyCode === 40) {
                        _this.next();
                    }
                });
            }
            /* 浏览器尺寸改变 */
            $(window).resize(function () {
                var currentLength = _this.switchLength(),
                    offset = _this.settings.direction ? _this.section.eq(_this.index).offset().top : _this.section.eq(_this.index).offset().left;

                if (Math.abs(offset) > currentLength / 2 && _this.index < (_this.pagesCount - 1)) {
                    _this.index ++;
                }
                if (_this.index) {
                    _scrollPage(_this);
                }
            });
            /* 动画执行结束 */
            _this.sections.on('transitionend webkitTransitionEnd oTransitionEnd otransitionend', function () {
                _this.canScroll = true;
                if (_this.settings.callback && type(_this.settings.callback) === 'function') {
                    _this.settings.callback();
                }
            });
        }
        /* 滑动动画 */
        function _scrollPage(_this) {
            var dest = _this.section.eq(_this.index).position();
            if (!dest) {
                return;
            }
            _this.canScroll = false;
            if (_prefix) {
                _this.sections.css(_prefix + 'transition', 'all ' + _this.settings.duration + 'ms ' + _this.settings.easing);
                var translate = _this.direction ? 'translateY(-' + dest.top + 'px)' : 'translateX(-' + dest.left + 'px)';
                _this.sections.css(_prefix + 'transform', translate);
            } else {
                var animateCss = _this.direction ? {top: -dest.top} : {left: -dest.left};
                _this.sections.animate(animateCss, _this.settings.duration, function () {
                    _this.canScroll = true;
                    if (_this.settings.callback && type(_this.settings.callback) === 'function') {
                        _this.settings.callback();
                    }
                });
            }

            if (_this.settings.pagination) {
                _this.pageItem.eq(_this.index).addClass(_this.activeClass).siblings('li').removeClass(_this.activeClass);
            }
        }
        return XSwitch;
    })();

})(jQuery);

/* 通过添加属性名调用插件默认执行XSwitch方法 */
$(function () {
    $('[data-XSwitch]').XSwitch();
})
