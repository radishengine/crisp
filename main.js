
var shape = [
  213.44421,67.365206,
  204.66288,80.230556, 186.62375,76.176616, 175.96136,66.594786,
  165.29897,57.012956, 162.41704,43.699976, 161.82375,29.637426,
  161.23046,15.574876, 132.75891,12.926706, 131.8641,27.617516,
  130.96929,42.308326, 120.11986,51.494156, 108.00486,45.397456,
  95.889857,39.300756, 89.165665,32.865756, 77.675215,23.148206,
  66.184765,13.430656, 39.552446,31.345746, 43.022451,46.113846,
  46.492456,60.881946, 70.870436,49.356306, 71.590751,63.382486,
  72.311066,77.408666, 53.142043,73.800296, 40.565908,74.471766,
  27.989772,75.143236, 14.037399,100.45018, 30.863686,102.46862,
  47.689972,104.48706, 49.756158,120.51624, 37.782937,125.89043,
  25.809715,131.26462, 6.6156179,132.30655, 11.924613,145.95044,
  17.233608,159.59434, 35.738988,152.60644, 43.925953,144.34754,
  52.112918,136.08863, 71.073191,135.4208, 75.412065,145.39294,
  79.750939,155.36504, 57.28839,171.05204, 73.366087,170.04684,
  89.443784,169.04164, 96.330837,151.73254, 103.67193,138.63834,
  111.01302,125.54415, 123.65838,142.87064, 125.50472,155.14384,
  127.35106,167.41704, 153.02156,171.72564, 159.64426,160.08154,
  166.26696,148.43744, 155.89727,133.64777, 166.07694,123.78107,
  176.25661,113.91438, 197.4991,126.46697, 191.12224,139.08194,
  184.74538,151.69694, 190.22111,168.26394, 203.79727,166.43284,
  217.37343,164.60174, 234.61207,162.45424, 231.01694,148.74244,
  227.42181,135.03059, 203.65642,131.69593, 211.23519,116.67164,
  218.81396,101.64734, 233.76881,118.73294, 237.71975,130.57231,
  241.67069,142.41164, 260.11638,142.67264, 267.89616,134.36397,
  275.67594,126.05528, 288.56098,128.55079, 291.42474,115.85853,
  294.2885,103.16626, 274.76789,93.833796, 263.69265,97.838366,
  252.61741,101.84294, 234.02857,104.91222, 233.26387,88.445956,
  232.49917,71.979696, 255.15318,74.735606, 266.12354,68.552876,
  277.0939,62.370146, 279.54456,43.619106, 263.02575,44.394016,
  246.50694,45.168926, 222.22554,54.499856, 213.44421,67.365206,
];

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

var viewport = gl.getParameter(gl.VIEWPORT);
var width = viewport[2], height = viewport[3];

var vertices = shape;

var vertex_buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertices), gl.STATIC_DRAW);

var vertexPositionAttribute = gl.getAttribLocation(program, "attVertexPos");
gl.enableVertexAttribArray(vertexPositionAttribute);
gl.vertexAttribPointer(vertexPositionAttribute, 2, gl.FLOAT, false, 0, 0);

var projectionMatrixUniform = gl.getUniformLocation(program, "projectionMatrix");
gl.uniformMatrix4fv(projectionMatrixUniform, false, [
  2 / width,0,0,-1 + (0.5 / width),
  0,-2 / height,0,1 - (0.5 / height),
  0,0,0,0,
  0,0,0,1,
]);

gl.clearColor(0,0,0, 1);

function doFrame() {
  requestAnimationFrame(doFrame);
  
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  gl.drawArrays(gl.LINE_STRIP, 0, vertices.length/2);
}

doFrame();
