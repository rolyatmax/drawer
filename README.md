# drawer
A little library to help with animating lines and circles with the HTML canvas API.

An example of some stuff you can do with it: https://tbaldw.in/map

```
var Drawer = require('drawer');
var drawer = new Drawer(document.querySelector('.container'));

drawer.circle([150, 150], 25, Math.PI * 0.5, 2000, '#333333').then(function() {
    console.log('I just drew a circle!');
});
```

`Drawer`'s constructor takes a DOM Element which it uses as a container for a
canvas element it creates. The canvas dimensions are set to the height and width
of the container. The canvas resolution is doubled to support retina screens. All
values passed to the `Drawer`'s methods take care of doubling the values to fit
the resolution.

## Instance properties

### drawer.canvas
The canvas the instance renders to.

### drawer.ctx
The canvas' 2D rendering context.

## Instance methods

### drawer.circle(center, radius, startAngle, duration, color, width=1)
The `circle` method requires `center`, `radius`, `startAngle`, `duration`, and
`color`. `center` is a 2-element array of integers marking the center of the
circle. `radius` is an integer. `startAngle` is a float between `0` and
`Math.PI * 2`. `duration` is an integer indicating the duration of the animation
in milliseconds. `color` is a string representing the color of the line. And
`width` is an optional argument used for setting the line thickness. The default
`width` is `1`.

(This should probably also take `endAngle`, an optional easing method, and an
optional `counterclockwise` flag.)

### drawer.line(start, end, duration, color, width=1)
The `line` method requires `start`, `end`, `duration`, and `color`. `start` is a
2-element array of integers marking the starting point of the line. `end` is a
2-element array of integers marking the ending point of the line. `duration` is
an integer indicating the duration of the animation in milliseconds. `color` is
a string representing the color of the line. And `width` is an optional argument
used for setting the line thickness. The default `width` is `1`.

(This should probably also take an optional easing method.)

### drawer.arc(arc, duration, color, width=1)
The `arc` method might be a bit of a misnomer. It borrows its name from the
TopoJSON spec and refers to a multi-point line. The method requires `arc`,
`duration`, and `color`. `arc` is an array of points, each of which is a 2-
element array defining the coordinates for the point. `duration` is an integer
indicating the duration of the animation in milliseconds. `color` is a string
representing the color of the line. And `width` is an optional argument used for
setting the line thickness. The default `width` is `1`.

(This should probably also take an optional easing method.)

### drawer.clear()
Takes no arguments, and simply clears the canvas.
