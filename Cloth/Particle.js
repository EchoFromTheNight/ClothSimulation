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

  this.forces = vec3.zero();
  this.accTmp =vec3.zero();
  this.translationTmp =vec3.zero();
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
      //calcul de l'accélération
      vec3.scale(this.velocity,-this.damping/this.mass,this.accTmp);//viscosité
      vec3.add(this.accTmp,this.envi.gravity);//gravity

      vec3.add(this.externalforces,this.internalforces,this.forces);//add the forces

      vec3.scale(this.forces,1.0/this.mass);//calcul accélération
      vec3.add(this.accTmp,this.forces);

      //calcul de la vélocité en fonction de l'accélération
      vec3.scale(this.accTmp,this.envi.dt);//transformation en vitesse
      vec3.add(this.velocity,this.accTmp);//ajout de la nouvelle vitesse

      //calcul de la position grace à la vélocité
      vec3.scale(this.velocity,this.envi.dt,this.translationTmp);//transformation en déplacement
      vec3.add(this.position,this.translationTmp);

  }
  vec3.zero(this.normal); // since position has changed, normal must be updated
  vec3.zero(this.internalforces); // must be set to 0, for next step...
}
