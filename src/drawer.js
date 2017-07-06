import {createLoop} from 'loop';


let {register, clear} = createLoop();

function easeIn(step, start, change) {
    return change * (1 - Math.pow(1 - step, 3)) + start;
}

function startAnimation(renderFn, duration) {
    return new Promise((resolve) => {
        let startTime;
        register(function(t) {
            startTime = startTime || t;
            let step = (t - startTime) / duration;
            renderFn(step);
            if (step >= 1) {
                resolve();
                return false;
            }
            return true;
        });
    });
}

function dist([x1, y1], [x2, y2]) {
    let xDist = x2 - x1;
    let yDist = y2 - y1;
    return Math.sqrt(xDist * xDist + yDist * yDist);
}

function drawCircle(ctx, [x, y], radius, startAngle, endAngle, color, width) {
    ctx.beginPath();
    ctx.arc(x, y, radius, startAngle, endAngle);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
}

function drawLine(ctx, start, end, color, width) {
    ctx.beginPath();
    ctx.moveTo(...start);
    ctx.lineTo(...end);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
}

function drawArc(ctx, arc, color, width) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.moveTo(...arc[0]);
    arc.slice(1).forEach(pt => ctx.lineTo(...pt));
    ctx.stroke();
}

function getArcDist(arc) {
    let last = arc[0];
    return arc.reduce((total, pt) => {
        total += dist(last, pt);
        last = pt;
        return total;
    }, 0);
}

function cutArc(arc, perc) {
    let last = arc[0];
    let toGo = getArcDist(arc) * perc;
    let toDraw = [last];
    for (let i = 1, len = arc.length; i < len; i++) {
        let pt = arc[i];
        let segmentDist = dist(last, pt);
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
        let cutPerc = toGo / segmentDist;
        let x = (pt[0] - last[0]) * cutPerc + last[0];
        let y = (pt[1] - last[1]) * cutPerc + last[1];
        toDraw.push([x, y]);
        break;
    }
    return toDraw;
}

class Drawer {
    constructor(container, opts = {}) {
        let canvas;
        if (container.tagName === 'CANVAS') {
            canvas = container;
        } else {
            let {height, width} = container.getBoundingClientRect();
            canvas = document.createElement('canvas');
            canvas.style.height = `${height}px`;
            canvas.style.width = `${width}px`;
            canvas.height = height;
            canvas.width = width;
            container.appendChild(canvas);
        }
        if (opts.retina) {
            canvas.height *= 2;
            canvas.width *= 2;
        }

        this.retina = opts.retina || false;
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
    }

    circle(center, radius, startAngle, duration, color, width = 1) {
        center = center.map(num => num * 2);
        radius *= 2;
        return startAnimation(step => {
            let angle = easeIn(step, startAngle, 2);
            drawCircle(
                this.ctx,
                center,
                radius,
                startAngle * Math.PI,
                angle * Math.PI,
                color,
                width
            );
        }, duration);
    }

    line(start, end, duration, color, width = 1) {
        start = start.map(num => num * 2);
        let [startX, startY] = start;
        let [endX, endY] = end.map(num => num * 2);
        return startAnimation(step => {
            let x = easeIn(step, startX, endX - startX);
            let y = easeIn(step, startY, endY - startY);
            drawLine(this.ctx, start, [x, y], color, width);
        }, duration);
    }

    arc(arc, duration, color, width = 1) {
        return startAnimation(step => {
            let perc = easeIn(step, 0, 1);
            let toDraw = cutArc(arc, perc);
            drawArc(this.ctx, toDraw, color, width);
        }, duration);
    }

    stop() {
        clear();
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

module.exports = Drawer;
