
var target = document.getElementById('target');

var gl = target.getContext('webgl', {antialias: false});

gl.clearColor(0,0,0, 1);

gl.clear(gl.COLOR_BUFFER_BIT);
