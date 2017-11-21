/*
 * Author : Ph. Meseure
 * Institute : University of Poitiers
 */

// General function to compute the force exerted by a spring
// ---------------------------------------------------------
function computeSpring(x1,x2,stiffness,length0)
{ // returned force should be applied to x1
  var u = vec3.create();
  vec3.subtract(x2,x1,u);
  var norm = vec3.length(u);
  var f = stiffness * (1-length0/norm);
  vec3.scale(u,f/1);
  return u;
}

// General function to compute the normal of a triangle
// ----------------------------------------------------
function computeFaceNormal(p0,p1,p2,n)
{
  var v1=vec3.create();
  var v2=vec3.create();
  vec3.subtract(p1,p0,v1);
  vec3.subtract(p2,p0,v2);
  vec3.cross(v1,v2,n);
}


/****************
 * class Cloth *
 ****************/
function Cloth(texturefile,_mass,_damp,_xsize,_ysize,_nbx,_nby,_envi)
{
  /* Constructor */
  this.nbx=_nbx;
  this.nby=_nby;
  this.envi=_envi;
  this.init(_mass,_damp,_xsize,_ysize);
  this.initSprings(_xsize,_ysize);
  this.initGfx(texturefile);
}


/*
 * Construction of the model
 * -------------------------
 */
Cloth.prototype.init = function(mass,damp,xsize,ysize)
{
  var patchmass=mass/(this.nbx*this.nby);
  var x,y;
  this.particles=new Array(this.nby+1);
  for(var i=0;i<=this.nby;i++)
  {
    y=ysize*i/this.nby-ysize/2.0;
    this.particles[i]=new Array(this.nbx+1);
    for(var j=0;j<=this.nbx;j++)
    {
      x=xsize*j/this.nbx-xsize/2.0;
      var particle=new Particle(patchmass,damp,
                                  x,y,0.0, // position
                                  0.0,0.0,1.0, // normal
                                  this.envi);
      this.particles[i][j]=particle;
    }
  }
  // Mass correction on the edges : only two patches bring mass
  for(var i=1;i<=this.nby-1;i++)
  {
    this.particles[i][0].mass=patchmass/2.0;
    this.particles[i][this.nbx].mass=patchmass/2.0;
    this.particles[i][0].damping=damp/2.0;
    this.particles[i][this.nbx].damping=damp/2.0;

  }
  for(var j=1;j<=this.nbx-1;j++)
  {
    this.particles[0][j].mass=patchmass/2.0;
    this.particles[this.nby][j].mass=patchmass/2.0;
    this.particles[0][j].damping=damp/2.0;
    this.particles[this.nby][j].damping=damp/2.0;
  }
  // Mass correction at the corner of the Cloth :
  // Only 1 patch brings mass
  this.particles[0][0].mass=patchmass/4.0;
  this.particles[0][0].damping=damp/4.0;
  this.particles[this.nby][0].mass=patchmass/4.0;
  this.particles[this.nby][0].damping=damp/4.0;
  this.particles[0][this.nbx].mass=patchmass/4.0;
  this.particles[0][this.nbx].damping=damp/4.0;
  this.particles[this.nby][this.nbx].mass=patchmass/4.0;
  this.particles[this.nby][this.nbx].damping=damp/4.0;

  // Choose fixed nodes
  for(var i=0;i<=this.nby;i++)
    this.particles[i][0].pfixed=true;

  // Array to memorize the center of each patch
  // (patch must be divided into 4 triangles)
  this.centers=new Array(this.nby);
  for(var i=0;i<this.nby;i++)
  {
    this.centers[i]=new Array(this.nbx);
    for(var j=0;j<this.nbx;j++)
    {
      this.centers[i][j]=new ClothPoint(
         0.0,0.0,0.0, // real position computed in next step
         0.0,0.0,1.0); // so does the normal
    }
  }
  this.updateGeometry();
}


/*
 * Geometry update when particles have moved
 * -----------------------------------------
 */
Cloth.prototype.updateGeometry = function ()
{
  // Compute center of each patch
  for(var i=0;i<this.nby;i++)
    for(var j=0;j<this.nbx;j++)
    {
      vec3.add(this.particles[i][j].position,this.particles[i+1][j+1].position,
        this.centers[i][j].position);
      vec3.add(this.centers[i][j].position,this.particles[i+1][j].position);
      vec3.add(this.centers[i][j].position,this.particles[i][j+1].position);
      vec3.scale(this.centers[i][j].position,0.25);
      vec3.zero(this.centers[i][j].normal);
    }
  // Compute normals for particles and patch centers
  // normal are defined for one point as the mean normal of all surrounding faces
  var n=vec3.create();
  for(var i=0;i<this.nby;i++)
    for(var j=0;j<this.nbx;j++)
    {
      // compute face normal and report it to its vertices
      computeFaceNormal(this.centers[i][j].position,
        this.particles[i][j].position,this.particles[i][j+1].position,n);
      vec3.add(this.centers[i][j].normal,n);
      vec3.add(this.particles[i][j].normal,n);
      vec3.add(this.particles[i][j+1].normal,n);

      computeFaceNormal(this.centers[i][j].position,
        this.particles[i][j+1].position,this.particles[i+1][j+1].position,n);
      vec3.add(this.centers[i][j].normal,n);
      vec3.add(this.particles[i][j+1].normal,n);
      vec3.add(this.particles[i+1][j+1].normal,n);

      computeFaceNormal(this.centers[i][j].position,
        this.particles[i+1][j+1].position,this.particles[i+1][j].position,n);
      vec3.add(this.centers[i][j].normal,n);
      vec3.add(this.particles[i+1][j+1].normal,n);
      vec3.add(this.particles[i+1][j].normal,n);

      computeFaceNormal(this.centers[i][j].position,
        this.particles[i+1][j].position,this.particles[i][j].position,n);
      vec3.add(this.centers[i][j].normal,n);
      vec3.add(this.particles[i+1][j].normal,n);
      vec3.add(this.particles[i][j].normal,n);
    }
  // normalization of particles' normal
  for(var i=0;i<=this.nby;i++)
    for(var j=0;j<=this.nbx;j++)
    {
      vec3.normalize(this.particles[i][j].normal);
    }
  // normalization of patch centers' normal
  for(var i=0;i<this.nby;i++)
    for(var j=0;j<this.nbx;j++)
    {
      vec3.normalize(this.centers[i][j].normal);
    }
}




/*
 * Initialization of spring constants
 * ----------------------------------
 */
Cloth.prototype.initSprings=function(xsize,ysize)
{
  var xpatch=xsize/this.nbx;
  var ypatch=ysize/this.nby;

  this.xstretch_k=50; this.xstretch_l0=xpatch;
  this.ystretch_k=50; this.ystretch_l0=ypatch;
  this.shear_k=10;
    this.shear_l0=Math.sqrt(xpatch*xpatch+ypatch*ypatch);
  this.xbend_k=50; this.xbend_l0=2.0*xpatch;
  this.ybend_k=50; this.ybend_l0=2.0*ypatch;
}

/*
 * Internal forces computation
 * ---------------------------
 */
Cloth.prototype.computeSprings = function()
{
  var force;
  // Compute Springs forces
  // First step : stretch springs along x
  for(var i=0;i<=this.nby;i++)
  {
    for(var j=0;j<this.nbx;j++)
    {
      force=computeSpring(this.particles[i][j].position,
                          this.particles[i][j+1].position,
                          this.xstretch_k,
                          this.xstretch_l0);
      vec3.add(this.particles[i][j].internalforces,force);
      vec3.subtract(this.particles[i][j+1].internalforces,force);
    }
  }
  // Second step : stretch springs along y
  // To complete
  for(var i=0;i<this.nby;i++)
  {
    for(var j=0;j<=this.nbx;j++)
    {
      force=computeSpring(this.particles[i][j].position,
                          this.particles[i+1][j].position,
                          this.ystretch_k,
                          this.ystretch_l0);
      vec3.add(this.particles[i][j].internalforces,force);
      vec3.subtract(this.particles[i+1][j].internalforces,force);
    }
  }

  // Third step : shear springs
  // To complete
  for(var i=0;i<this.nby;i++)
  {
    for(var j=0;j<this.nbx;j++)
    {
        //diag1
      force=computeSpring(this.particles[i][j].position,
                          this.particles[i+1][j+1].position,
                          this.shear_k,
                          this.shear_l0);
      vec3.add(this.particles[i][j].internalforces,force);
      vec3.subtract(this.particles[i+1][j+1].internalforces,force);
      //diag2
      force=computeSpring(this.particles[i][j+1].position,
                          this.particles[i+1][j].position,
                          this.shear_k,
                          this.shear_l0);
      vec3.add(this.particles[i][j+1].internalforces,force);
      vec3.subtract(this.particles[i+1][j].internalforces,force);
    }
  }
  // Fourth step : bend springs along x
  // To complete

  // Fifth step : bend springs along y
  // To complete
}

/*
 * Compute external forces
 */
Cloth.prototype.applyWind = function(wind)
{
  var scal;
  for(var i=0;i<=this.nby;i++)
    for(var j=0;j<=this.nbx;j++)
    {
      this.particles[i][j].addWindForce(wind);
    }
}

/*
 * Simulation step
 * ---------------
 */
Cloth.prototype.step = function (wind)
{
  // Compute internal forces
  this.computeSprings();
  this.applyWind(wind);
  // Particle behavior computation
  for(var i=0;i<=this.nby;i++)
    for(var j=0;j<=this.nbx;j++)
    {
      this.particles[i][j].step();
    }
  this.updateGeometry(); // Normal must be computed for external forces, and not only for drawing
}


/*
 * Graphics initialization
 * -----------------------
 */
Cloth.prototype.initGfx=function(texturefile)
{
  // Sphere VBO to display particles
  this.sphere=new Sphere(0.01,20,20);
    // 0.01 is the ray of the displayed spheres. This value is arbitrary and can be changed.

  // vertex array and Webgl buffer allocation
  var nbparticles=(this.nby+1)*(this.nbx+1);
  var nbcenters=this.nby*this.nbx;
  this.vertexdata=new Float32Array(3*(nbparticles+nbcenters));
  this.vertices = gl.createBuffer();

  // normal array and Webgl buffer allocation
  this.normaldata = new Float32Array(this.vertexdata.length);
  this.normals = gl.createBuffer();

  // Texture coordinates array
  var texdata = [];
  for(var i=0;i<=this.nby;i++)
  {
    for(var j=0;j<=this.nbx;j++)
    {
      texdata.push(j/this.nbx);
      texdata.push(1.0-i/this.nby);
    }
  }
  for(var i=0;i<this.nby;i++)
  {
    for(var j=0;j<this.nbx;j++)
    {
      texdata.push((j+0.5)/this.nbx);
      texdata.push(1.0-(i+0.5)/this.nby);
    }
  }
  // Texture coords webgl buffer
  this.textcoords = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.textcoords);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texdata), gl.STATIC_DRAW);
  this.texture=initTexture(texturefile);

  // Face array
  var facedata = [];
  for(var i=0;i<this.nby;i++)
  {
    for(var j=0;j<this.nbx;j++)
    {
      // First method
      // Each patch is divided into 2 triangles
      // Problem : this creates a privilagiate direction for deformation
      // and lighting interpolation, that is truely visible

/*    facedata.push(i*(this.nbx+1)+j);
      facedata.push(i*(this.nbx+1)+j+1);
      facedata.push((i+1)*(this.nbx+1)+j+1);

      facedata.push(i*(this.nbx+1)+j);
      facedata.push((i+1)*(this.nbx+1)+j+1);
      facedata.push((i+1)*(this.nbx+1)+j); */

      // Second method (better)
      // Each patch is divided into 4 triangles around its center
      // (i.e. classic convex triangulation)
      var center_ind=nbparticles+i*(this.nbx)+j;
      facedata.push(center_ind);
      facedata.push(i*(this.nbx+1)+j);
      facedata.push(i*(this.nbx+1)+j+1);

      facedata.push(center_ind);
      facedata.push(i*(this.nbx+1)+j+1);
      facedata.push((i+1)*(this.nbx+1)+j+1);

      facedata.push(center_ind);
      facedata.push((i+1)*(this.nbx+1)+j+1);
      facedata.push((i+1)*(this.nbx+1)+j);

      facedata.push(center_ind);
      facedata.push((i+1)*(this.nbx+1)+j);
      facedata.push(i*(this.nbx+1)+j);
    }
  }

  // face webgl buffer
  this.indices = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indices);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(facedata), gl.STATIC_DRAW);
  this.indices.numitems = facedata.length;
}

/*
 * Drawing function
 * ----------------
 */
Cloth.prototype.draw = function ()
{
  // Update arrays with new vertices' positions and normals
  var ind=0;
  for(var i=0;i<=this.nby;i++)
  {
    for(var j=0;j<=this.nbx;j++)
    {
      for(var k=0;k<3;k++)
      {
        this.vertexdata[ind+k]=this.particles[i][j].position[k];
        this.normaldata[ind+k]=this.particles[i][j].normal[k];
      }
      ind+=3;
    }
  }
  // Update arrays with new patch centers' positions and normals
  for(var i=0;i<this.nby;i++)
  {
    for(var j=0;j<this.nbx;j++)
    {
      for(var k=0;k<3;k++)
      {
        this.vertexdata[ind+k]=this.centers[i][j].position[k];
        this.normaldata[ind+k]=this.centers[i][j].normal[k];
      }
      ind+=3;
    }
  }

  // Update VBO vertex and normal buffers
  gl.bindBuffer(gl.ARRAY_BUFFER, this.normals);
  gl.bufferData(gl.ARRAY_BUFFER, this.normaldata, gl.STREAM_DRAW);
  setNormalsPointer(3,gl.FLOAT)

  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertices);
  gl.bufferData(gl.ARRAY_BUFFER, this.vertexdata, gl.STREAM_DRAW);
  setPositionsPointer(3,gl.FLOAT);

  // Texture
  gl.bindBuffer(gl.ARRAY_BUFFER, this.textcoords);
  setTextureCoordsPointer(2,gl.FLOAT);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, this.texture);
  setTextureSampler();

  // Cloth display
  setMaterialColor([1.0,0.9,0.75,1.0]);
  setTexturing(true);

  gl.cullFace(gl.FRONT); // begin with back faces
  negateNormals(); // Normals must be negated for back faces
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indices);
  gl.drawElements(gl.TRIANGLES, this.indices.numitems, gl.UNSIGNED_SHORT, 0);

  negateNormals(); // Return to front face normals
  gl.cullFace(gl.BACK); // return to backface culling
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indices);
  gl.drawElements(gl.TRIANGLES, this.indices.numitems, gl.UNSIGNED_SHORT, 0);

  setTexturing(false);
}


/*
 * Alternative Drawing function
 * ----------------------------
 */
Cloth.prototype.drawParticles = function(curmatrix)
{
  // Display particles (optionnal)
  setMaterialColor([1.0,0.0,0.0,1.0]);
  for(var i=0;i<=this.nby;i++)
  {
    for(var j=0;j<=this.nbx;j++)
    {
      pushMatrix(curmatrix);
      {
        mat4.translate(curmatrix,this.particles[i][j].position);
//        var scalfact=0.01;
//        var scale=[scalfact,scalfact,scalfact];
//        mat4.scale(curmatrix,scale);
        setModelViewMatrix(curmatrix);
        drawObject(this.sphere);
      }
      curmatrix=popMatrix();
    }
  }
}
