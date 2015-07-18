(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _require = require('utils');

var startAnimation = _require.startAnimation;
var easeIn = _require.easeIn;

function dist(_ref, _ref3) {
    var _ref2 = _slicedToArray(_ref, 2);

    var x1 = _ref2[0];
    var y1 = _ref2[1];

    var _ref32 = _slicedToArray(_ref3, 2);

    var x2 = _ref32[0];
    var y2 = _ref32[1];

    var xDist = x2 - x1;
    var yDist = y2 - y1;
    return Math.sqrt(xDist * xDist + yDist * yDist);
}

function drawCircle(ctx, _ref4, radius, startAngle, endAngle, color, width) {
    var _ref42 = _slicedToArray(_ref4, 2);

    var x = _ref42[0];
    var y = _ref42[1];

    ctx.beginPath();
    ctx.arc(x, y, radius, startAngle, endAngle);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
}

function drawLine(ctx, start, end, color, width) {
    ctx.beginPath();
    ctx.moveTo.apply(ctx, _toConsumableArray(start));
    ctx.lineTo.apply(ctx, _toConsumableArray(end));
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
}

function drawArc(ctx, arc, color, width) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.moveTo.apply(ctx, _toConsumableArray(arc[0]));
    arc.slice(1).forEach(function (pt) {
        return ctx.lineTo.apply(ctx, _toConsumableArray(pt));
    });
    ctx.stroke();
}

function getArcDist(arc) {
    var last = arc[0];
    return arc.reduce(function (total, pt) {
        total += dist(last, pt);
        last = pt;
        return total;
    }, 0);
}

function cutArc(arc, perc) {
    var last = arc[0];
    var toGo = getArcDist(arc) * perc;
    var toDraw = [last];
    for (var i = 1, len = arc.length; i < len; i++) {
        var pt = arc[i];
        var segmentDist = dist(last, pt);
        if (!segmentDist) {
            continue;
        }
        if (toGo === 0) {
            break;
        }
        if (segmentDist <= toGo) {
            toDraw.push(pt);
            toGo -= segmentDist;
            last = pt;
            continue;
        }
        var cutPerc = toGo / segmentDist;
        var x = (pt[0] - last[0]) * cutPerc + last[0];
        var y = (pt[1] - last[1]) * cutPerc + last[1];
        toDraw.push([x, y]);
        break;
    }
    return toDraw;
}

var Drawer = (function () {
    function Drawer(container) {
        _classCallCheck(this, Drawer);

        var _container$getBoundingClientRect = container.getBoundingClientRect();

        var height = _container$getBoundingClientRect.height;
        var width = _container$getBoundingClientRect.width;

        var canvas = document.createElement('canvas');
        canvas.style.height = height + 'px';
        canvas.style.width = width + 'px';
        canvas.height = height * 2;
        canvas.width = width * 2;
        container.appendChild(canvas);
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
    }

    _createClass(Drawer, [{
        key: 'circle',
        value: function circle(center, radius, startAngle, duration, color) {
            var _this = this;

            var width = arguments.length <= 5 || arguments[5] === undefined ? 1 : arguments[5];

            center = center.map(function (num) {
                return num * 2;
            });
            radius *= 2;
            return startAnimation(function (step) {
                var angle = easeIn(step, startAngle, 2);
                drawCircle(_this.ctx, center, radius, startAngle * Math.PI, angle * Math.PI, color, width);
            }, duration);
        }
    }, {
        key: 'line',
        value: function line(start, end, duration, color) {
            var _this2 = this;

            var width = arguments.length <= 4 || arguments[4] === undefined ? 1 : arguments[4];

            start = start.map(function (num) {
                return num * 2;
            });

            var _start = _slicedToArray(start, 2);

            var startX = _start[0];
            var startY = _start[1];

            var _end$map = end.map(function (num) {
                return num * 2;
            });

            var _end$map2 = _slicedToArray(_end$map, 2);

            var endX = _end$map2[0];
            var endY = _end$map2[1];

            return startAnimation(function (step) {
                var x = easeIn(step, startX, endX - startX);
                var y = easeIn(step, startY, endY - startY);
                drawLine(_this2.ctx, start, [x, y], color, width);
            }, duration);
        }
    }, {
        key: 'arc',
        value: function arc(_arc, duration, color) {
            var _this3 = this;

            var width = arguments.length <= 3 || arguments[3] === undefined ? 1 : arguments[3];

            return startAnimation(function (step) {
                var perc = easeIn(step, 0, 1);
                var toDraw = cutArc(_arc, perc);
                drawArc(_this3.ctx, toDraw, color, width);
            }, duration);
        }
    }, {
        key: 'clear',
        value: function clear() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }]);

    return Drawer;
})();

module.exports = Drawer;

},{"utils":2}],2:[function(require,module,exports){
var utils = {
    uniqueId: function uniqueId() {
        var r = (Math.random() * 100000000) | 0;
        return Date.now().toString(32) + r.toString(32);
    },

    getCookie: function getCookie(name) {
        var cookies = document.cookie.split(';');
        var nameEQ = name + '=';
        for (var i = 0; i < cookies.length; i++) {
            var c = cookies[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1, c.length);
            }
            if (c.indexOf(nameEQ) === 0) {
                return c.substring(nameEQ.length, c.length);
            }
        }
        return null;
    },

    encodeQueryParams: function encodeQueryParams(paramsObj) {
        var eUC = encodeURIComponent;
        return Object.keys(paramsObj).map(function(param) {
            return eUC(param) + '=' + eUC(paramsObj[param]);
        }).join('&');
    },

    extend: function extend(target, source, overwrite) {
        for (var key in source)
            if (overwrite || !(key in target)) {
                target[key] = source[key];
            }
        return target;
    },

    onReady: function onReady(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    },

    getJSON: function getJSON(url) {
        return new Promise(function(resolve, reject) {
            var request = new XMLHttpRequest();
            request.open('GET', url, true);
            request.onload = function() {
                if (this.status >= 200 && this.status < 400) {
                    try {
                        resolve(JSON.parse(this.response));
                    } catch (err) {
                        reject(this.response);
                    }
                } else {
                    reject(this.response);
                }
            };
            request.onerror = function() {
                reject(this.response);
            };
            request.send();
        });
    },

    startAnimation: function startAnimation(renderFn, duration) {
        var startTime;
        return new Promise(function(resolve) {
            function _render(t) {
                startTime = startTime || t;
                var step = (t - startTime) / duration;
                renderFn(step);
                if (step < 1) {
                    requestAnimationFrame(_render);
                } else {
                    resolve();
                }
            }
            requestAnimationFrame(_render);
        });
    },

    easeOut: function easeOut(step, start, change) {
        return change * Math.pow(step, 2) + start;
    },

    easeIn: function easeIn(step, start, change) {
        return change * (1 - Math.pow(1 - step, 3)) + start;
    },

    shuffle: function shuffle(list) {
        list = list.slice();
        var shuffled = [];
        while (list.length) {
            var i = Math.random() * list.length | 0;
            shuffled.push(list.splice(i, 1)[0]);
        }
        return shuffled;
    },

    random: function random(low, high) {
        if (Array.isArray(low)) {
            return low[Math.random() * low.length | 0];
        }
        if (high === undefined) {
            high = low;
            low = 0;
        }
        return Math.random() * (high - low) + low | 0;
    }
};

if (module !== undefined) {
    module.exports = utils;
}

},{}]},{},[1])
//# sourceMappingURL=drawer.js.map
