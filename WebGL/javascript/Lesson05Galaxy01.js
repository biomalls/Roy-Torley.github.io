var gl;

var mvMatrix = mat4.create();
var pMatrix = mat4.create();
var mvMatrixStack = [];

var shaderProgram;

var cubeVertexPositionBuffer;
var cubeVertexTextureCoordBuffer;
var cubeVertexIndexBuffer;

var neheTexture;

var lastTime = 0;

var xRot = 0;
var yRot = 0;
var zRot = 0;

function degToRad( degrees ) {
  return degrees * Math.PI / 180;
}

function mvPushMatrix() {
  var copy = mat4.create();
  mat4.set( mvMatrix, copy );
  mvMatrixStack.push( copy );
}

function mvPopMatrix() {
  if( mvMatrixStack.length == 0 ) {
    throw "Invalid popMatrix!";
  }

  mvMatrix = mvMatrixStack.pop();
}

function initBuffers() {
  cubeVertexPositionBuffer = gl.createBuffer();

  gl.bindBuffer( gl.ARRAY_BUFFER, cubeVertexPositionBuffer );

  vertices = [
    // Front face
    -1.0, -1.0, 1.0,
     1.0, -1.0, 1.0,
     1.0,  1.0, 1.0,
    -1.0,  1.0, 1.0,
    // Back face
    -1.0, -1.0, -1.0,
    -1.0,  1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0, -1.0, -1.0,
    // Top face
     -1.0,  1.0, -1.0,
     -1.0,  1.0,  1.0,
      1.0,  1.0,  1.0,
      1.0,  1.0, -1.0,
    // Bottom face
    -1.0, -1.0, -1.0,
     1.0, -1.0, -1.0,
     1.0, -1.0,  1.0,
    -1.0, -1.0,  1.0,
    // Right face
     1.0, -1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0,  1.0,  1.0,
     1.0, -1.0,  1.0,
    // Left face
    -1.0, -1.0, -1.0,
    -1.0, -1.0,  1.0,
    -1.0,  1.0,  1.0,
    -1.0,  1.0, -1.0
  ];

  gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( vertices ), gl.STATIC_DRAW );

  cubeVertexPositionBuffer.itemSize = 3;
  cubeVertexPositionBuffer.numItems = 24;

  cubeVertexTextureCoordBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer );

  var textureCoords = [
    // Front face
     0.0, 0.0,
     1.0, 0.0,
     1.0, 1.0,
     0.0, 1.0,

    // Back face
     1.0, 0.0,
     1.0, 1.0,
     0.0, 1.0,
     0.0, 0.0,

    // Top face
     0.0, 1.0,
     0.0, 0.0,
     1.0, 0.0,
     1.0, 1.0,

    // Bottom face
     1.0, 1.0,
     0.0, 1.0,
     0.0, 0.0,
     1.0, 0.0,

    // Right face
     1.0, 0.0,
     1.0, 1.0,
     0.0, 1.0,
     0.0, 0.0,

    // Left face
     0.0, 0.0,
     1.0, 0.0,
     1.0, 1.0,
     0.0, 1.0
  ];

  gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( textureCoords ), gl.STATIC_DRAW );
  cubeVertexTextureCoordBuffer.itemSize = 2;
  cubeVertexTextureCoordBuffer.numItems = 24;

  cubeVertexIndexBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer );

  var cubeVertexIndices = [
     0,  1,  2,   0,  2,  3,   // Front face
     4,  5,  6,   4,  6,  7,   // Back face
     8,  9, 10,   8, 10, 11,   // Top face
    12, 13, 14,  12, 14, 15,   // Bottom face
    16, 17, 18,  16, 18, 19,   // Right face
    20, 21, 22,  20, 22, 23    // Left face
  ];

  gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( cubeVertexIndices ),
    gl.STATIC_DRAW );
  cubeVertexIndexBuffer.itemSize = 1;
  cubeVertexIndexBuffer.numItems = 36;
}

function initTexture() {
  neheTexture = gl.createTexture();
  neheTexture.image = new Image();
  neheTexture.image.onload = function() {
    handleLoadedTexture( neheTexture );
  }

  /* neheTexture.image.src =
    "Spiral-Galaxies-Larger-Than-Previously-Thought256x256.jpg"; */
  neheTexture.image.src = "../images/hoaghubble960_256x256.jpg";
  neheTexture.image.crossOrigin = "anonymous";
}

function handleLoadedTexture( texture ) {
  gl.bindTexture( gl.TEXTURE_2D, texture );
  gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );
  gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
  gl.bindTexture( gl.TEXTURE_2D, null );
}

function animate() {
  var timeNow = new Date().getTime();
  if( lastTime != 0 ) {
    var elapsed = timeNow - lastTime;

    xRot += ( 25 * elapsed ) / 1000.0;
    yRot += ( 25 * elapsed ) / 1000.0;
    zRot += ( 25 * elapsed ) / 1000.0;
  }

  lastTime = timeNow;
}


function drawScene() {
  gl.viewport( 0, 0, gl.viewportWidth, gl.viewportHeight );
  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

  mat4.perspective( 45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix );

  mat4.identity( mvMatrix );

  mat4.translate( mvMatrix, [ 0.0, 0.0, -5.0 ] );

  mat4.rotate( mvMatrix, degToRad( xRot ), [ 1, 0, 0 ] );
  mat4.rotate( mvMatrix, degToRad( yRot ), [ 0, 1, 0 ] );
  mat4.rotate( mvMatrix, degToRad( zRot ), [ 0, 0, 1 ] );

  gl.bindBuffer( gl.ARRAY_BUFFER, cubeVertexPositionBuffer );
  gl.vertexAttribPointer( shaderProgram.vertexPositionAttribute,
                          cubeVertexPositionBuffer.itemSize,
                          gl.FLOAT, false, 0, 0 );

  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
  gl.vertexAttribPointer( shaderProgram.textureCoordAttribute,
                          cubeVertexTextureCoordBuffer.itemSize,
                          gl.FLOAT, false, 0, 0);

  gl.activeTexture( gl.TEXTURE0 );
  gl.bindTexture( gl.TEXTURE_2D, neheTexture );
  gl.uniform1i( shaderProgram.samplerUniform, 0 );

  gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer );
  setMatrixUniforms();
  gl.drawElements( gl.TRIANGLES, cubeVertexIndexBuffer.numItems,
    gl.UNSIGNED_SHORT, 0 );
}

function initGL( canvas ) {
  try {
    gl = canvas.getContext( "experimental-webgl" );
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
  } catch( e ) {
  }

  if( !gl ) {
    alert( "Could not initialize WebGL, sorry!" );
  }
}

function initShaders() {
  var fragmentShader = getShader( gl, "shader-fs" );
  var vertexShader = getShader( gl, "shader-vs" );

  shaderProgram = gl.createProgram();
  gl.attachShader( shaderProgram, vertexShader );
  gl.attachShader( shaderProgram, fragmentShader );
  gl.linkProgram( shaderProgram );

  if( !gl.getProgramParameter( shaderProgram, gl.LINK_STATUS ) ) {
    alert( "Could not initialize shaders." );
  }

  gl.useProgram( shaderProgram );

  shaderProgram.vertexPositionAttribute
    = gl.getAttribLocation( shaderProgram, "aVertexPosition" );
  gl.enableVertexAttribArray( shaderProgram.vertexPositionAttribute );

  shaderProgram.textureCoordAttribute
    = gl.getAttribLocation( shaderProgram, "aTextureCoord" );
  gl.enableVertexAttribArray( shaderProgram.textureCoordAttribute );

  shaderProgram.pMatrixUniform = gl.getUniformLocation( shaderProgram, "uPMatrix" );
  shaderProgram.mvMatrixUniform = gl.getUniformLocation( shaderProgram, "uMVMatrix" );
  shaderProgram.samplerUniform = gl.getUniformLocation( shaderProgram, "uSampler" );
}

function getShader( gl, id ) {
  var shaderScript = document.getElementById( id );
  if( !shaderScript ) {
    return null;
  }

  var str = "";
  var k = shaderScript.firstChild;
  while( k ) {
    if( k.nodeType == 3 )
      str += k.textContent;

    k = k.nextSibling;
  }

  var shader;
  if( shaderScript.type == "x-shader/x-fragment" ) {
    shader = gl.createShader( gl.FRAGMENT_SHADER );
  } else if( shaderScript.type == "x-shader/x-vertex" ) {
    shader = gl.createShader( gl.VERTEX_SHADER );
  } else {
    return null;
  }

  gl.shaderSource( shader, str );
  gl.compileShader( shader );

  if( !gl.getShaderParameter( shader, gl.COMPILE_STATUS ) ) {
    alert( gl.getShaderInfoLog( shader ) );
    return null;
  }

  return shader;
}

function setMatrixUniforms() {
  gl.uniformMatrix4fv( shaderProgram.pMatrixUniform, false, pMatrix );
  gl.uniformMatrix4fv( shaderProgram.mvMatrixUniform, false, mvMatrix );
}

function tick() {
  // Use requestAnimationFrame() instead of requestAnimFrame().
  // requestAnimationFrame() shows smoother behavior.
  requestAnimationFrame( tick );
  drawScene();
  animate();
}

function webGLStart() {
  var canvas = document.getElementById( "lesson05-canvas" );
  initGL( canvas );
  initShaders();
  initBuffers();
  initTexture();

  gl.clearColor( 0.0, 0.0, 0.0, 1.0 );  // Starting background color is black, full opacity.
  gl.enable( gl.DEPTH_TEST );

  tick();
}
