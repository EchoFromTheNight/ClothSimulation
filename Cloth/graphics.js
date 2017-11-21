/*
 * Author : Ph. Meseure
 * Institute : University of Poitiers
 * Note : Some part of this code have been freely adaptated from Nehe webgl tutorial
*/
var gl;
var shaderProgram;
var mvMatrixStack = [];

var cube;
var sphere;


function pushMatrix(matrix)
{
  var copy = mat4.create();
  mat4.set(matrix, copy);
  mvMatrixStack.push(copy);
}

function popMatrix()
{
  if (mvMatrixStack.length == 0)
  {
      throw "Invalid popMatrix!";
  }
  return mvMatrixStack.pop();
}


function initShaders()
{
  var fragshader;
  fragshader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragshader,fragsrc);
  gl.compileShader(fragshader);
  if (!gl.getShaderParameter(fragshader, gl.COMPILE_STATUS))
  {
    alert(gl.getShaderInfoLog(fragshader));
  }
  
  var vertshader;
  vertshader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertshader,vertsrc);
  gl.compileShader(vertshader);
  if (!gl.getShaderParameter(vertshader, gl.COMPILE_STATUS))
  {
    alert(gl.getShaderInfoLog(vertshader));
  }
  
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertshader);
  gl.attachShader(shaderProgram, fragshader);
  gl.linkProgram(shaderProgram);
  
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
  {
    alert("Could not initialise shaders");
  }
  
  gl.useProgram(shaderProgram);
  setGlVariables(shaderProgram);
}



function initWGL(canvas)
{
  try
  {
    gl = canvas.getContext("experimental-webgl");
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
  }
  catch (e) {}
  if (!gl)
  {
    alert("Could not initialise WebGL, sorry :-(");
  }
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  initShaders();
}


function Sphere(radius,slices,stacks)
{
  /* Constructor */
  /* ----------- */
  var vertexdata = [];
  var normaldata = [];

  for (var latitude=0; latitude <= stacks; latitude++)
  {
    var theta = latitude * Math.PI / stacks;
    var sintheta = Math.sin(theta);
    var costheta = Math.cos(theta);

    for (var longitude=0; longitude <= slices; longitude++)
    {
      var phi = longitude * 2 * Math.PI / slices;
      var sinphi = Math.sin(phi);
      var cosphi = Math.cos(phi);

      var x = cosphi * sintheta;
      var y = costheta;
      var z = sinphi * sintheta;

      normaldata.push(x);
      normaldata.push(y);
      normaldata.push(z);
      vertexdata.push(radius * x);
      vertexdata.push(radius * y);
      vertexdata.push(radius * z);
    }
  }

  var indexdata = [];
  for (var latitude=0; latitude < stacks; latitude++)
  {
    for (var longitude=0; longitude < slices; longitude++)
    {
      var first = (latitude * (slices + 1)) + longitude;
      var second = first + slices + 1;
      indexdata.push(first);      
      indexdata.push(first + 1);
      indexdata.push(second);

      indexdata.push(second);
      indexdata.push(first + 1);
      indexdata.push(second + 1);
    }
  }

  this.normals = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.normals);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normaldata), gl.STATIC_DRAW);
  this.normals.itemSize = 3;
  this.normals.numItems = normaldata.length / 3;

  this.vertices = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertices);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexdata), gl.STATIC_DRAW);
  this.vertices.itemSize = 3;
  this.vertices.numItems = vertexdata.length / 3;

  this.indices = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indices);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexdata), gl.STATIC_DRAW);
  this.indices.itemSize = 1;
  this.indices.numItems = indexdata.length;
}

function drawObject(object)
{
  gl.bindBuffer(gl.ARRAY_BUFFER, object.vertices);
  setPositionsPointer(object.vertices.itemSize,gl.FLOAT);

  gl.bindBuffer(gl.ARRAY_BUFFER, object.normals);
  setNormalsPointer(object.normals.itemSize,gl.FLOAT);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.indices);
  gl.drawElements(gl.TRIANGLES, object.indices.numItems, gl.UNSIGNED_SHORT, 0);    
}

/* Dedicated functions for Texture */
/* =============================== */
function initTexture(file)
{
  var texture;
  texture = gl.createTexture();
  texture.image = new Image();
  texture.image.onload = function () {
      handleLoadedTexture(texture)
  }
  texture.image.src = file;
  return texture
}

function handleLoadedTexture(texture)
{
  gl.bindTexture(gl.TEXTURE_2D, texture);
//  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.bindTexture(gl.TEXTURE_2D, null);
}
