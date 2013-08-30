'use strict';

/* Directives */
angular.module('jsGen.directives', []).
directive('genParseMarkdown', ['MdParse', 'sanitize', function (MdParse, sanitize) {
    // <div gen-parse-markdown="document"></div>
    // document是Markdown格式或一般文档字符串，解析成DOM后插入<div>
    return function (scope, element, attr) {
        element.addClass('ng-binding parse-markdown').data('$binding', attr.genParseMarkdown);
        scope.$watch(attr.genParseMarkdown, function genParseMarkdownWatchAction(value) {
            value = value || '';
            value = MdParse(value);
            value = sanitize(value);
            element.html(value);
            element.find('pre').addClass('prettyprint'); // linenums have bug!
            element.find('a').attr('target', function () {
                if (this.host !== location.host) {
                    return '_blank';
                }
            });
            prettyPrint();
        });
    };
}]).
directive('genTiming', ['$timeout', function ($timeout) {
    return {
        transclude: true,
        scope: true,
        template: '<i>{{timing}}</i>',
        link: function (scope, element, attr) {
            element.addClass('ng-binding').data('$binding', attr.genTiming);
            var eventName = attr.genTiming;
            scope.$watch(attr.genTiming, function genTimingWatchAction(value) {
                var time = +value || 0;
                if (time <= 0) {
                    return;
                }
                (function timing() {
                    scope.timing = time;
                    time -= 1;
                    if (time >= 0) {
                        $timeout(timing, 1000);
                    } else {
                        scope.$emit(eventName);
                    }
                })();
            });
        }
    };
}]).
directive('genPagination', function () {
    // <div gen-pagination="pagination"></div>
    // 基于Bootstrap框架
    // pagination是一个对象，如：
    // {
    //     now: 1,  // 默认当前页
    //     total: 1,  //总页数
    //     num: 20, //分页的每页数量
    //     nums: [20, 50, 100]  //自定义num，不定长，可留空
    //     display: {first: '首页', prev: '上一页', next: '下一页', last: '尾页'}
    // }
    // 翻页事件发生时触发pagination事件
    return {
        transclude: true,
        scope: true,
        template: '<ul class="pagination">' +
                            '<li id="pagination-first"><a href="#" ng-click="paginationTo(\'first\')">{{display.first}}</a></li>' +
                            '<li id="pagination-prev"><a href="#" ng-click="paginationTo(\'prev\')">{{display.prev}}</a></li>' +
                            '<li class="disabled"><a>{{now}}</a></li>' +
                            '<li id="pagination-next"><a href="#" ng-click="paginationTo(\'next\')">{{display.next}}</a></li>' +
                            '<li id="pagination-last"><a href="#" ng-click="paginationTo(\'last\')">{{display.last}}</a></li>' +
                            '<li ng-repeat="n in nums"><a href="#" ng-click="setNum(n)" title="每页{{n}}">{{n}}</a></li>' +
                        '</ul>',
        link: function (scope, element, attr) {
            element.addClass('ng-binding').data('$binding', attr.genPagination);
            var eventName = attr.genPagination;
            scope.$watch(attr.genPagination, function genPaginationWatchAction(value) {
                if (!value) {
                    return;
                }
                scope.now = value.now || 1;
                scope.nums = value.nums || 20;
                if (!scope.display) {
                    scope.display = value.display || {
                        first: '首页',
                        prev: '上一页',
                        next: '下一页',
                        last: '尾页'
                    };
                    if (!scope.display.first) {
                        var dom = document.getElementById('pagination-first');
                        dom.parentNode.removeChild(dom);
                    }
                    if (!scope.display.prev) {
                        var dom = document.getElementById('pagination-prev');
                        dom.parentNode.removeChild(dom);
                    }
                    if (!scope.display.next) {
                        var dom = document.getElementById('pagination-next');
                        dom.parentNode.removeChild(dom);
                    }
                    if (!scope.display.last) {
                        var dom = document.getElementById('pagination-last');
                        dom.parentNode.removeChild(dom);
                    }
                }
                scope.paginationTo = function (to) {
                    var p = 1;
                    var params = {};
                    var last = Math.ceil(value.total / value.num);
                    switch (to) {
                        case 'first':
                            p = 1;
                            break;
                        case 'prev':
                            p = scope.now - 1;
                            if (p < 1) {
                                p = 1;
                            }
                            break;
                        case 'next':
                            p = scope.now + 1;
                            if (p > last) {
                                p = last;
                            }
                            break;
                        case 'last':
                            p = last;
                            break;
                    }
                    params = {
                        n: value.num,
                        p: p
                    };
                    if (scope.now !== p) {
                        scope.$emit(eventName, params);
                    }
                };
                scope.setNum = function (num) {
                    scope.$emit(eventName, {
                        n: num,
                        p: 1
                    });
                };
            }, true);
        }
    };
}).
directive('genTabActive', function () {
    //<ul>
    //<li gen-tab-active="className"></li>
    //<li gen-tab-active="className"></li>
    //</ul>
    // 点击li元素时，该元素将赋予className类，并移除其它兄弟元素的className类
    return {
        link: function (scope, element, attr) {
            var className = attr.genTabActive;
            element.bind('click', function () {
                element.parent().children().removeClass(className);
                element.addClass(className);
            });
        }
    };
});
