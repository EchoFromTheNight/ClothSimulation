/*
 * Author : Ph. Meseure
 * Institute : University of Poitiers
*/

/******************
 * Class Particle *
 ******************/

// Particle derives from ClothPoint
Particle.prototype = new ClothPoint();
Particle.prototype.constructor = Particle;

function Particle(_mass,_damp,x,y,z,nx,ny,nz,_envi)
{
  // call for constructor of super class
  ClothPoint.call(this,x,y,z,nx,ny,nz);
  
  this.velocity=vec3.zero();
  this.pfixed=false;
  this.internalforces=vec3.zero();
  this.externalforces=vec3.zero();
  this.mass=_mass;
  this.damping=_damp;
  this.envi=_envi;
}

/*
 * Add wind force as external force
 */
Particle.prototype.addWindForce = function(wind)
{
  /* to complete */
}


/*
 * Compute new particle state
 * --------------------------
 */
Particle.prototype.step = function ()
{
  if (!this.pfixed)
  {
    /* To complete */
  }
  vec3.zero(this.normal); // since position has changed, normal must be updated
  vec3.zero(this.internalforces); // must be set to 0, for next step...
}

