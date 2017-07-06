'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _loop = require('loop');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var _createLoop = (0, _loop.createLoop)();

var register = _createLoop.register;
var clear = _createLoop.clear;


function easeIn(step, start, change) {
    return change * (1 - Math.pow(1 - step, 3)) + start;
}

function startAnimation(renderFn, duration) {
    return new Promise(function (resolve) {
        var startTime = void 0;
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

function dist(_ref, _ref2) {
    var _ref4 = _slicedToArray(_ref, 2);

    var x1 = _ref4[0];
    var y1 = _ref4[1];

    var _ref3 = _slicedToArray(_ref2, 2);

    var x2 = _ref3[0];
    var y2 = _ref3[1];

    var xDist = x2 - x1;
    var yDist = y2 - y1;
    return Math.sqrt(xDist * xDist + yDist * yDist);
}

function drawCircle(ctx, _ref5, radius, startAngle, endAngle, color, width) {
    var _ref6 = _slicedToArray(_ref5, 2);

    var x = _ref6[0];
    var y = _ref6[1];

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

var Drawer = function () {
    function Drawer(container) {
        _classCallCheck(this, Drawer);

        var canvas = void 0;
        if (container.tagName === 'CANVAS') {
            canvas = container;
        } else {
            var _container$getBoundin = container.getBoundingClientRect();

            var height = _container$getBoundin.height;
            var width = _container$getBoundin.width;

            canvas = document.createElement('canvas');
            canvas.style.height = height + 'px';
            canvas.style.width = width + 'px';
            canvas.height = height * 2;
            canvas.width = width * 2;
            container.appendChild(canvas);
        }
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
            var _start = start;

            var _start2 = _slicedToArray(_start, 2);

            var startX = _start2[0];
            var startY = _start2[1];

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
        key: 'stop',
        value: function stop() {
            clear();
        }
    }, {
        key: 'clear',
        value: function clear() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }]);

    return Drawer;
}();

module.exports = Drawer;