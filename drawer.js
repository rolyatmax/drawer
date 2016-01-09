(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _rAF = require('./rAF');

var callbacks = [];
var request = null;

function loop(t) {
    callbacks = callbacks.map(function (cb) {
        return cb(t) ? cb : null;
    }).filter(function (cb) {
        return cb;
    });
    request = callbacks.length ? (0, _rAF.requestAnimationFrame)(loop) : null;
}

function register(cb) {
    var running = !!callbacks.length;
    callbacks.push(cb);
    if (!running) {
        request = (0, _rAF.requestAnimationFrame)(loop);
    }

    return function remove() {
        var index = callbacks.indexOf(cb);
        if (index < 0) {
            return;
        }
        callbacks.splice(index, 1);
    };
}

function clear() {
    (0, _rAF.cancelAnimationFrame)(request);
    request = null;
    callbacks = [];
}

exports['default'] = {
    register: register,
    clear: clear
};
module.exports = exports['default'];

},{"./rAF":2}],2:[function(require,module,exports){
// using this as a module so we can mock this when testing
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = { requestAnimationFrame: requestAnimationFrame, cancelAnimationFrame: cancelAnimationFrame };
module.exports = exports["default"];

},{}],3:[function(require,module,exports){
'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _require = require('loop');

var register = _require.register;

function easeIn(step, start, change) {
    return change * (1 - Math.pow(1 - step, 3)) + start;
}

function startAnimation(renderFn, duration) {
    return new Promise(function (resolve) {
        var startTime = undefined;
        register(function (t) {
            startTime = startTime || t;
            var step = (t - startTime) / duration;
            renderFn(step);
            if (step >= 1) {
                resolve();
                return false;
            }
            return true;
        });
    });
}

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

},{"loop":1}]},{},[3])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvdGJhbGR3aW4vZHJhd2VyL25vZGVfbW9kdWxlcy9sb29wL3NyYy9sb29wLmpzIiwiL3RiYWxkd2luL2RyYXdlci9ub2RlX21vZHVsZXMvbG9vcC9zcmMvckFGLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7O21CQ0EwRCxPQUFPOztBQUdqRSxJQUFJLFNBQVMsR0FBRyxFQUFFLENBQUM7QUFDbkIsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDOztBQUVuQixTQUFTLElBQUksQ0FBQyxDQUFDLEVBQUU7QUFDYixhQUFTLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFBLEVBQUU7ZUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUk7S0FBQSxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQUEsRUFBRTtlQUFJLEVBQUU7S0FBQSxDQUFDLENBQUM7QUFDcEUsV0FBTyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEdBQUcsU0FSekIscUJBQXFCLEVBUTBCLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQztDQUNuRTs7QUFFRCxTQUFTLFFBQVEsQ0FBQyxFQUFFLEVBQUU7QUFDbEIsUUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFDakMsYUFBUyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNuQixRQUFJLENBQUMsT0FBTyxFQUFFO0FBQ1YsZUFBTyxHQUFHLFNBZlYscUJBQXFCLEVBZVcsSUFBSSxDQUFDLENBQUM7S0FDekM7O0FBRUQsV0FBTyxTQUFTLE1BQU0sR0FBRztBQUNyQixZQUFJLEtBQUssR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2xDLFlBQUksS0FBSyxHQUFHLENBQUMsRUFBRTtBQUNYLG1CQUFPO1NBQ1Y7QUFDRCxpQkFBUyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDOUIsQ0FBQztDQUNMOztBQUVELFNBQVMsS0FBSyxHQUFHO0FBQ2IsYUE1QjJCLG9CQUFvQixFQTRCMUIsT0FBTyxDQUFDLENBQUM7QUFDOUIsV0FBTyxHQUFHLElBQUksQ0FBQztBQUNmLGFBQVMsR0FBRyxFQUFFLENBQUM7Q0FDbEI7O3FCQUVjO0FBQ1gsWUFBUSxFQUFSLFFBQVE7QUFDUixTQUFLLEVBQUwsS0FBSztDQUNSOzs7Ozs7Ozs7O3FCQ25DYyxFQUFDLHFCQUFxQixFQUFyQixxQkFBcUIsRUFBRSxvQkFBb0IsRUFBcEIsb0JBQW9CLEVBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IHtyZXF1ZXN0QW5pbWF0aW9uRnJhbWUsIGNhbmNlbEFuaW1hdGlvbkZyYW1lfSBmcm9tICcuL3JBRic7XG5cblxubGV0IGNhbGxiYWNrcyA9IFtdO1xubGV0IHJlcXVlc3QgPSBudWxsO1xuXG5mdW5jdGlvbiBsb29wKHQpIHtcbiAgICBjYWxsYmFja3MgPSBjYWxsYmFja3MubWFwKGNiID0+IGNiKHQpID8gY2IgOiBudWxsKS5maWx0ZXIoY2IgPT4gY2IpO1xuICAgIHJlcXVlc3QgPSBjYWxsYmFja3MubGVuZ3RoID8gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGxvb3ApIDogbnVsbDtcbn1cblxuZnVuY3Rpb24gcmVnaXN0ZXIoY2IpIHtcbiAgICBsZXQgcnVubmluZyA9ICEhY2FsbGJhY2tzLmxlbmd0aDtcbiAgICBjYWxsYmFja3MucHVzaChjYik7XG4gICAgaWYgKCFydW5uaW5nKSB7XG4gICAgICAgIHJlcXVlc3QgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUobG9vcCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgICAgICAgbGV0IGluZGV4ID0gY2FsbGJhY2tzLmluZGV4T2YoY2IpO1xuICAgICAgICBpZiAoaW5kZXggPCAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY2FsbGJhY2tzLnNwbGljZShpbmRleCwgMSk7XG4gICAgfTtcbn1cblxuZnVuY3Rpb24gY2xlYXIoKSB7XG4gICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUocmVxdWVzdCk7XG4gICAgcmVxdWVzdCA9IG51bGw7XG4gICAgY2FsbGJhY2tzID0gW107XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgICByZWdpc3RlcixcbiAgICBjbGVhclxufTtcbiIsIi8vIHVzaW5nIHRoaXMgYXMgYSBtb2R1bGUgc28gd2UgY2FuIG1vY2sgdGhpcyB3aGVuIHRlc3RpbmdcbmV4cG9ydCBkZWZhdWx0IHtyZXF1ZXN0QW5pbWF0aW9uRnJhbWUsIGNhbmNlbEFuaW1hdGlvbkZyYW1lfTtcbiJdfQ==
