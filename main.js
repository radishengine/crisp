
var target = document.getElementById('target');

var gl = target.getContext('webgl', {antialias: false});

var vshader = gl.createShader(gl.VERTEX_SHADER);
var fshader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(vshader,''
+'\n'+'attribute vec2 attVertexPos;'
+'\n'+'uniform mat4 projectionMatrix;'
+'\n'+'void main() {'
+'\n'+'  gl_Position = vec4(attVertexPos, 0, 1) * projectionMatrix;'
+'\n'+'}'
+'\n');
gl.shaderSource(fshader, ''
+'\n'+'void main() {'
+'\n'+'  gl_FragColor = vec4(1, 1, 1, 1);'
+'\n'+'}'
+'\n');

gl.compileShader(vshader);
gl.compileShader(fshader);

var program = gl.createProgram();
gl.attachShader(program, vshader);
gl.attachShader(program, fshader);
gl.linkProgram(program);
gl.useProgram(program);

var vertices = [
  0, 0,
  1, 1];

var vertex_buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertices), gl.STATIC_DRAW);

var vertexPositionAttribute = gl.getAttribLocation(program, "attVertexPos");
gl.enableVertexAttribArray(vertexPositionAttribute);
gl.vertexAttribPointer(vertexPositionAttribute, 2, gl.FLOAT, false, 0, 0);

var projectionMatrixUniform = gl.getUniformLocation(program, "projectionMatrix");
gl.uniformMatrix4fv(projectionMatrixUniform, false, [
  1,0,0,-1,
  0,-1,0,0,
  0,0,0,0,
  0,0,0,1,
]);

gl.clearColor(0,0,0, 1);

function doFrame() {
  requestAnimationFrame(doFrame);
  
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  gl.drawArrays(gl.LINE_STRIP, 0, 2);
}

doFrame();
