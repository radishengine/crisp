
require(['earcut'], function(earcut) {

var shape = [
  213,67,
  204,80, 186,76, 175,66,
  165,57, 162,43, 161,29,
  161,15, 132,12, 131,27,
  130,42, 120,51, 108,45,
  95,39, 89,32, 77,23,
  66,13, 39,31, 43,46,
  46,60, 70,49, 71,63,
  72,77, 53,73, 40,74,
  27,75, 14,100, 30,102,
  47,104, 49,120, 37,125,
  25,131, 6,132, 11,145,
  17,159, 35,152, 43,144,
  52,136, 71,135, 75,145,
  79,155, 57,171, 73,170,
  89,169, 96,151, 103,138,
  111,125, 123,142, 125,155,
  127,167, 153,171, 159,160,
  166,148, 155,133, 166,123,
  176,113, 197,126, 191,139,
  184,151, 190,168, 203,166,
  217,164, 234,162, 231,148,
  227,135, 203,131, 211,116,
  218,101, 233,118, 237,130,
  241,142, 260,142, 267,134,
  275,126, 288,128, 291,115,
  294,103, 274,93, 263,97,
  252,101, 234,104, 233,88,
  232,71, 255,74, 266,68,
  277,62, 279,43, 263,44,
  246,45, 222,54, 213,67,
];

var target = document.getElementById('target');

var gl = target.getContext('webgl', {antialias: false});

var vshader = gl.createShader(gl.VERTEX_SHADER);
var fshader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(vshader,''
+'\n'+'attribute vec2 attVertexPos;'
+'\n'+'uniform mat4 projectionMatrix;'
+'\n'+''
+'\n'+'void main() {'
+'\n'+'  gl_Position = vec4(attVertexPos, 0, 1) * projectionMatrix;'
+'\n'+'}'
+'\n');
gl.shaderSource(fshader, 'precision mediump float;'
+'\n'+'uniform mat4 gradientMatrix;'
+'\n'+'uniform sampler2D gradientSampler;'
+'\n'+'uniform vec4 fixedColor;'
+'\n'+''
+'\n'+'void main() {'
+'\n'+'  gl_FragColor = fixedColor;' // texture2D(gradientSampler, vec2(gl_FragCoord * gradientMatrix));'
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

var startx = Math.floor(shape[0]), starty = Math.floor(shape[1]);
var vertices = [startx, starty, startx, starty];
var curve_recursion_limit = 32;
var curve_distance_epsilon = 1e-30;
var curve_collinearity_epsilon = 1e-30;
var curve_angle_tolerance_epsilon = 0.01;
var m_distance_tolerance = 1;
var m_angle_tolerance = 0.0;
function vertex(x, y) {
  x = Math.floor(x);
  y = Math.floor(y);
  vertices.push(x, y);
}
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
          vertex(x1234, y1234);
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
          vertex(x1234, y1234);
          return;
        }

        if (m_cusp_limit != 0.0) {
          if (da1 > m_cusp_limit) {
            vertex(x2, y2);
            return;
          }

          if (da2 > m_cusp_limit) {
            vertex(x3, y3);
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
                vertex(x1234, y1234);
                return;
              }

              // Angle Condition
              //----------------------
              da1 = Math.abs(Math.atan2(y3 - y2, x3 - x2) - Math.atan2(y2 - y1, x2 - x1));
              if (da1 >= Math.pi) da1 = 2*Math.pi - da1;

              if (da1 < m_angle_tolerance) {
                vertex(x2,y2);
                vertex(x3,y3);
                return;
              }

              if (m_cusp_limit != 0.0 && da1 > m_cusp_limit) {
                vertex(x2,y2);
                return;
              }
          }
      }
      else if (d3 > curve_collinearity_epsilon) {
        // p1,p2,p4 are collinear, p3 is considerable
        //----------------------
        if (d3 * d3 <= m_distance_tolerance * (dx*dx + dy*dy)) {
          if (m_angle_tolerance < curve_angle_tolerance_epsilon) {
            vertex(x1234, y1234);
            return;
          }

          // Angle Condition
          //----------------------
          da1 = Math.abs(Math.atan2(y4 - y3, x4 - x3) - Math.atan2(y3 - y2, x3 - x2));
          if (da1 >= pi) da1 = 2*pi - da1;

          if (da1 < m_angle_tolerance) {
            vertex(x2,y2);
            vertex(x3,y3);
            return;
          }

          if (m_cusp_limit !== 0.0 && da1 > m_cusp_limit) {
            vertex(x3,y3);
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
          vertex(x1234, y1234);
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
for (var i = 2; i < vertices.length; i+= 2) {
  console.log(vertices[i] - vertices[i-2], vertices[i+1] - vertices[i-1]);
}

var vertex_buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertices), gl.STATIC_DRAW);
  
var triangles = earcut(vertices);
  
var triverts = [];
for (var i = 0; i < triangles.length; i += 3) {
  triverts.push(
    vertices[triangles[i] * 2], vertices[triangles[i] * 2 + 1],
    vertices[triangles[i + 1] * 2], vertices[triangles[i + 1] * 2 + 1],
    vertices[triangles[i + 2] * 2], vertices[triangles[i + 2] * 2 + 1]
  );
}

var trivert_buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, trivert_buffer);
gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(triverts), gl.STATIC_DRAW);

var vertexPositionAttribute = gl.getAttribLocation(program, "attVertexPos");
gl.enableVertexAttribArray(vertexPositionAttribute);
gl.vertexAttribPointer(vertexPositionAttribute, 2, gl.FLOAT, false, 0, 0);

gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, [
  2 / width,0,0,-1 + (0.5 / width),
  0,-2 / height,0,1 - (0.5 / height),
  0,0,0,0,
  0,0,0,1,
]);

gl.uniformMatrix4fv(gl.getUniformLocation(program, "gradientMatrix"), false, [
  1/width,0,0,0,
  0,1,0,0,
  0,0,0,0,
  0,0,0,1,
]);
  
var fixedColor_uniform = gl.getUniformLocation(program, 'fixedColor');

function createGradientTexture(r, g, b, a, r2,g2,b2,a2) {
  var data = new Uint8Array([r,g,b,a, r2,g2,b2,a2]);
  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 2, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return texture;
}

gl.uniform1i(gl.getUniformLocation(program, "gradientSampler"), 6);
gl.activeTexture(gl.TEXTURE6);
gl.bindTexture(gl.TEXTURE_2D, createGradientTexture(0,0,0,255, 255,255,255,255));

gl.clearColor(0,0,0.2, 1);

function doFrame() {
  requestAnimationFrame(doFrame);
  
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  gl.uniform4f(fixedColor_uniform, 1,0,0,1);
  gl.bindBuffer(gl.ARRAY_BUFFER, trivert_buffer);
  gl.drawArrays(gl.TRIANGLES, 0, triverts.length/2);
  
  //gl.uniform4f(fixedColor_uniform, 0,1,0,1);
  //gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
  //gl.drawArrays(gl.LINE_LOOP, 0, vertices.length/2);
}

doFrame();

});
