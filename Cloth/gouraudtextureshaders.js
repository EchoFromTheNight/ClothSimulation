var fragsrc=
"precision mediump float;\n"
+"uniform sampler2D uSampler;\n"
+"uniform bool uTexturing;\n"
+"varying vec4 vColor;\n"
+"varying vec2 vTexCoord;\n"
+"void main(void) {\n"
+"  if (uTexturing)\n"
+"    gl_FragColor = vColor*texture2D(uSampler, vec2(vTexCoord.s, vTexCoord.t));\n"
+"  else gl_FragColor = vColor;\n"
+"}\n";

var vertsrc=
// Matrices
 "uniform mat4 uModelViewMatrix;\n"
+"uniform mat4 uProjectionMatrix;\n"
+"uniform mat3 uNormalMatrix;\n"

// Light source definition
+"uniform vec4 uAmbiantLight;\n"
+"uniform bool uLighting;\n"
+"uniform vec3 uLightPos;\n"
+"uniform vec4 uLightColor;\n"

// Material definition
+"uniform bool uNormalizing;\n"
+"uniform vec4 uMaterialColor;\n"

// Attributes for each vertex
+"attribute vec3 aVertexPosition;\n"
+"attribute vec3 aVertexNormal;\n"
+"attribute vec2 aVertexTexCoord;\n"

// Interpolated data
+"varying vec4 vColor;\n"
+"varying vec2 vTexCoord;\n"

+"void main(void) {\n"
+"  vec4 pos=uModelViewMatrix*vec4(aVertexPosition, 1.0);\n"
+"  if (uLighting)\n"
+"  {\n"
+"    vec3 normal = uNormalMatrix * aVertexNormal;\n"
+"    if (uNormalizing) normal=normalize(normal);\n"
+"    vec3 lightdir=normalize(uLightPos-pos.xyz);\n"
+"    float weight = max(dot(normal, lightdir),0.0);\n"
+"    vColor = uMaterialColor*(uAmbiantLight+weight*uLightColor);\n"
+"  }\n"
+"  else vColor = uMaterialColor;\n"
+"  vTexCoord = aVertexTexCoord;\n"
+"  gl_Position= uProjectionMatrix*pos;\n"
+"}\n";

function setGlVariables(shaderProgram)
{
  // Matrices
  shaderProgram.uProjectionMatrix = gl.getUniformLocation(shaderProgram, "uProjectionMatrix");
  shaderProgram.uModelViewMatrix = gl.getUniformLocation(shaderProgram, "uModelViewMatrix");
  shaderProgram.uNormalMatrix = gl.getUniformLocation(shaderProgram, "uNormalMatrix");

  // Light source
  shaderProgram.uLighting = gl.getUniformLocation(shaderProgram, "uLighting");
  shaderProgram.uAmbiantLight = gl.getUniformLocation(shaderProgram, "uAmbiantLight");
  shaderProgram.uLightPosition = gl.getUniformLocation(shaderProgram, "uLightPos");
  shaderProgram.uLightColor = gl.getUniformLocation(shaderProgram, "uLightColor");
  
  // Material
  shaderProgram.uNormalizing = gl.getUniformLocation(shaderProgram, "uNormalizing");
  shaderProgram.uMaterialColor = gl.getUniformLocation(shaderProgram, "uMaterialColor");

  // Texture
  shaderProgram.uTexturing = gl.getUniformLocation(shaderProgram, "uTexturing");
  shaderProgram.uSampler = gl.getUniformLocation(shaderProgram, "uSampler");

  // vertex attributes
  shaderProgram.aVertexPosition = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(shaderProgram.aVertexPosition);

  shaderProgram.aVertexNormal = gl.getAttribLocation(shaderProgram, "aVertexNormal");
  gl.enableVertexAttribArray(shaderProgram.aVertexNormal);
  
  shaderProgram.aVertexTexCoord = gl.getAttribLocation(shaderProgram, "aVertexTexCoord");
  gl.enableVertexAttribArray(shaderProgram.aVertexTexCoord);
  
}

/* Matrices handling */
/* ================= */
function setModelViewMatrix(matrix)
{
  gl.uniformMatrix4fv(shaderProgram.uModelViewMatrix, false, matrix);
  
  var normal_matrix = mat3.create();
  mat4.toInverseMat3(matrix, normal_matrix);
  mat3.transpose(normal_matrix);
  gl.uniformMatrix3fv(shaderProgram.uNormalMatrix, false, normal_matrix);
}

function setProjectionMatrix(matrix)
{
  gl.uniformMatrix4fv(shaderProgram.uProjectionMatrix, false, matrix);
}

function negateNormals()
{
  var normal_matrix=gl.getUniform(shaderProgram,shaderProgram.uNormalMatrix);
  mat3.uniformscale(normal_matrix,-1.0);
  gl.uniformMatrix3fv(shaderProgram.uNormalMatrix, false, normal_matrix);
}

/* Light source handling */
/* ===================== */
function setLighting(state)
{
  gl.uniform1i(shaderProgram.uLighting,state);
}

function setAmbiantLight(amblight)
{
  gl.uniform4fv(shaderProgram.uAmbiantLight,amblight);
}

function setLightPosition(lightpos)
{
  gl.uniform3fv(shaderProgram.uLightPosition,lightpos);
}

function setLightColor(lightcolor)
{
  gl.uniform4fv(shaderProgram.uLightColor,lightcolor);
}

/* Material handling */
/* ================= */
function setNormalizing(state)
{
  gl.uniform1i(shaderProgram.uNormalizing,state);
}

function setMaterialColor(matcolor)
{
  gl.uniform4fv(shaderProgram.uMaterialColor,matcolor);
}

/* Texture handling */
/* ================ */
function setTextureSampler()
{
  gl.uniform1i(shaderProgram.uSampler,0);
}

function setTexturing(state)
{
  gl.uniform1i(shaderProgram.uTexturing,state);
}

/* Attributes handling */
/* =================== */
function setPositionsPointer(size,dtype)
{
  gl.vertexAttribPointer(shaderProgram.aVertexPosition,size,dtype,false,0,0);
}

function setNormalsPointer(size,dtype)
{
  gl.vertexAttribPointer(shaderProgram.aVertexNormal,
    size, dtype, false, 0, 0);
}

function setTextureCoordsPointer(size,dtype)
{
  gl.vertexAttribPointer(shaderProgram.aVertexTexCoord,2,gl.FLOAT,false,0,0);
}

