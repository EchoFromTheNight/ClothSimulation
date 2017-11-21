/*
 * Author : Ph. Meseure
 * Institute : University of Poitiers
*/
function ClothPoint(x,y,z,nx,ny,nz)
{
  this.position=vec3.create([x,y,z]);
  this.normal=vec3.create([nx,ny,nz]);
}

