/*
 * Author : Ph. Meseure
 * Institute : University of Poitiers
*/
function Simulation()
{
  // Observer's rotation
  this.rotview = 0.0;
  // Gravity
  this.gravity=vec3.create([0.0,-9.81,0.0]);
  // integration timestep
  this.dt=1e-3;

  this.cloth=new Cloth("xlim.jpg", // texture
                         0.2, // mass : Kg
                         1.0, // damping : N.s/m
                         0.8,0.6, // x and y size
                         10,10, // number of patches for x and y
                         this);
}

/*
 * Graphics initialization
 */
Simulation.prototype.initGraphics = function()
{
  var pmatrix=mat4.create();    
  mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pmatrix);
  setProjectionMatrix(pmatrix);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.disable(gl.BLEND);
  setLighting(true);
  setAmbiantLight([0.4,0.4,0.4,1.0]);
  setLightPosition([10.0,20.0,10.0]);
  setLightColor([0.8,0.8,0.8,1.0]);
  setNormalizing(false);
}
  
/*
 * Creation of a wind force around x axis
 */
Simulation.prototype.createXWind = function()
{
  var v=vec3.create();
  var alpha=Math.PI*Math.random()/6.0;
  var beta=2.0*Math.PI*Math.random();
  v[0]=Math.cos(alpha);
  v[1]=Math.sin(alpha)*Math.cos(beta);
  v[2]=Math.sin(alpha)*Math.sin(beta);
  var force=Math.random()*0.5;
  vec3.scale(v,force);
  return v;
}

/*
 * Simulation step
 */
Simulation.prototype.step = function ()
{
  var wind=this.createXWind();
  this.cloth.step(wind);
}

/*
 * Drawing function
 */
Simulation.prototype.draw = function(elapsed)
{
  var mvmatrix = mat4.create();
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  mat4.identity(mvmatrix);
  mat4.translate(mvmatrix, [0.0, 0.0, -1.3]); // -0.2 for zoom...
//    mat4.rotate(mvmatrix, Math.PI/6.0, [1, 0, 0]);
  mat4.rotate(mvmatrix, this.rotview, [0, 1, 0]);

  setModelViewMatrix(mvmatrix);
  this.cloth.draw();
  // Next line can be uncommented if particle should be displayed
  // this.cloth.drawParticles(mvmatrix);

  this.rotview += elapsed*1e-4; /* here is specified the rotation velocity in rad/s */    
}

