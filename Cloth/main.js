/*
 * Author : Ph. Meseure
 * Institute : University of Poitiers
 * Note : this code has been freely adapted from Nehe webgl tutorials
*/
var lastTime = 0;

var simul;

function tick()
{
  requestAnimFrame(tick);

  var timeNow = new Date().getTime();
  if (lastTime != 0)
  {
    var elapsed = timeNow - lastTime;
    for (var i=0;i<elapsed/(1000.0*simul.dt);i++)
      simul.step();
    if (elapsed>40e-3) simul.draw(elapsed);
  }
  lastTime = timeNow;
}

function startSimul()
{
  var canvas = document.getElementById("webglcanvas");
  initWGL(canvas);
  simul=new Simulation();
  simul.initGraphics();

  tick();
}

