
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

var startx = shape[0], starty = shape[1];
var vertices = [startx, starty];
var curve_recursion_limit = 32;
var curve_distance_epsilon = 1e-30;
var curve_collinearity_epsilon = 1e-30;
var curve_angle_tolerance_epsilon = 0.01;
var m_distance_tolerance = 0.5;
var m_angle_tolerance = 0.0;
function recursive_bezier(x1,y1, x2,y2, x3,y3, x4,y4, level) {
  if (level > curve_recursion_limit) {
    return;
  }

  // midpoints
  var x12 = (x1 + x2) / 2, y12 = (y1 + y2) / 2,
    x23   = (x2 + x3) / 2, y23   = (y2 + y3) / 2,
    x34   = (x3 + x4) / 2, y34   = (y3 + y4) / 2,
    x123  = (x12 + x23) / 2, y123  = (y12 + y23) / 2,
    x234  = (x23 + x34) / 2, y234  = (y23 + y34) / 2,
    x1234 = (x123 + x234) / 2, y1234 = (y123 + y234) / 2;

  // always subdivide the first time
  if (level > 0) {
    // Try to approximate the full cubic curve by a single straight line
    //------------------
    var dx = x4-x1, dy = y4-y1;

    var d2 = Math.abs(((x2 - x4) * dy - (y2 - y4) * dx));
    var d3 = Math.abs(((x3 - x4) * dy - (y3 - y4) * dx));

    var da1, da2;

    if (d2 > curve_collinearity_epsilon && d3 > curve_collinearity_epsilon) { 
      // Regular care
      //-----------------
      if ((d2 + d3)*(d2 + d3) <= m_distance_tolerance * (dx*dx + dy*dy)) {
        // If the curvature doesn't exceed the distance_tolerance value
        // we tend to finish subdivisions.
        //----------------------
        if (m_angle_tolerance < curve_angle_tolerance_epsilon) {
          vertices.push(x1234, y1234);
          return;
        }

        // Angle & Cusp Condition
        //----------------------
        var a23 = Math.atan2(y3 - y2, x3 - x2);
        da1 = Math.abs(a23 - Math.atan2(y2 - y1, x2 - x1));
        da2 = Math.abs(Math.atan2(y4 - y3, x4 - x3) - a23);
        if (da1 >= Math.pi) da1 = 2*Math.pi - da1;
        if (da2 >= Math.pi) da2 = 2*Math.pi - da2;

        if (da1 + da2 < m_angle_tolerance) {
          // Finally we can stop the recursion
          //----------------------
          vertices.push(x1234, y1234);
          return;
        }

        if (m_cusp_limit != 0.0) {
          if (da1 > m_cusp_limit) {
            vertices.push(x2, y2);
            return;
          }

          if (da2 > m_cusp_limit) {
            vertices.push(x3, y3);
            return;
          }
        }
      }
    }
    else {
      if (d2 > curve_collinearity_epsilon) {
          // p1,p3,p4 are collinear, p2 is considerable
          //----------------------
          if (d2 * d2 <= m_distance_tolerance * (dx*dx + dy*dy)) {
              if (m_angle_tolerance < curve_angle_tolerance_epsilon) {
                vertices.push(x1234, y1234);
                return;
              }

              // Angle Condition
              //----------------------
              da1 = Math.abs(Math.atan2(y3 - y2, x3 - x2) - Math.atan2(y2 - y1, x2 - x1));
              if (da1 >= Math.pi) da1 = 2*Math.pi - da1;

              if (da1 < m_angle_tolerance) {
                vertices.push(x2,y2, x3,y3);
                return;
              }

              if (m_cusp_limit != 0.0 && da1 > m_cusp_limit) {
                vertices.push(x2,y2);
                return;
              }
          }
      }
      else if (d3 > curve_collinearity_epsilon) {
        // p1,p2,p4 are collinear, p3 is considerable
        //----------------------
        if (d3 * d3 <= m_distance_tolerance * (dx*dx + dy*dy)) {
          if (m_angle_tolerance < curve_angle_tolerance_epsilon) {
            vertices.push(x1234, y1234);
            return;
          }

          // Angle Condition
          //----------------------
          da1 = Math.abs(Math.atan2(y4 - y3, x4 - x3) - Math.atan2(y3 - y2, x3 - x2));
          if (da1 >= pi) da1 = 2*pi - da1;

          if (da1 < m_angle_tolerance) {
            vertices.push(x2,y2, x3,y3);
            return;
          }

          if (m_cusp_limit !== 0.0 && da1 > m_cusp_limit) {
            vertices.push(x3,y3);
            return;
          }
        }
      }
      else {
        // Collinear case
        //-----------------
        dx = x1234 - (x1 + x4) / 2;
        dy = y1234 - (y1 + y4) / 2;
        if (dx*dx + dy*dy <= m_distance_tolerance) {
          vertices.push(x1234, y1234);
          return;
        }
      }
    }
  }

  recursive_bezier(x1, y1, x12, y12, x123, y123, x1234, y1234, level + 1);
  recursive_bezier(x1234, y1234, x234, y234, x34, y34, x4, y4, level + 1);
}
for (var i = 2; i < shape.length; i += 6) {
  var c1x = shape[i], c1y = shape[i+1],
      c2x = shape[i+2], c2y = shape[i+3],
      endx = shape[i+4], endy = shape[i+5];
  recursive_bezier(startx, starty, c1x, c1y, c2x, c2y, endx, endy, 0);
  startx = endx;
  starty = endy;
}
shape.push(shape[0], shape[1]);

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
