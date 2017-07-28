
var tooSlow=false;

function isChrome() {
  var isChromium = window.chrome,
    winNav = window.navigator,
    vendorName = winNav.vendor,
    isOpera = winNav.userAgent.indexOf("OPR") > -1,
    isIEedge = winNav.userAgent.indexOf("Edge") > -1,
    isIOSChrome = winNav.userAgent.match("CriOS");

  if(isIOSChrome){
    return true;
  } else if(isChromium !== null && isChromium !== undefined && vendorName === "Google Inc." && isOpera == false && isIEedge == false) {
    return true;
  } else {
    return false;
  }
}


var defaultStarDensity=3;
var defaultMaximumRadius=8;
var starDensity;
var maximumRadius;

var minSpeed=.2;
var maxSpeed=.4;
var minAlpha=.5;
var twinkleSpeed=.002;
//var degreeOfWeightTowardWhite=50;
var minimumRadius=1;

var maxHalo = .6;

function randomizeSizeAndDensity(){
  // console.log('zzz')
  //plus or minus two for star density
  var densityVariation=2;
  var densityDelta = Math.random()*densityVariation*2-densityVariation;
  starDensity = defaultStarDensity + densityDelta;

  if (isChrome() && ! /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
    // starDensity=defaultStarDensity
  } else {
    // console.log('sss')
    starDensity=.1
  }
  // starDensity=.1

  // if (tooSlow){
  //   console.log("too slow dens")
  //   starDensity=1;
  // }

  //plus or minus 4 for star max radius
  var radiusVariation=3;
  var radiusDelta = Math.random()*radiusVariation*2-radiusVariation;
  maximumRadius = defaultMaximumRadius + radiusDelta;


  //uncomment to check maxes or mins
  // maximumRadius = defaultMaximumRadius + radiusVariation;
  // starDensity = defaultStarDensity + densityVariation;
  // maximumRadius = defaultMaximumRadius - radiusVariation;
  // starDensity = defaultStarDensity - densityVariation;
}
randomizeSizeAndDensity();

function getStarColorFromRand(){
  //want random temperature between 1500 K to 15000 K
  let randTemp = 1500+ (15000-1500)*Math.random();
  return colorTemperatureToRGB(randTemp);
}

// Start with a temperature, in Kelvin, somewhere between 1000 and 40000.
function colorTemperatureToRGB(kelvin){
  var temp = kelvin / 100;
  var red, green, blue;
  if( temp <= 66 ){
      red = 255;
      green = temp;
      green = 99.4708025861 * Math.log(green) - 161.1195681661;

      if( temp <= 19){
          blue = 0;
      } else {
          blue = temp-10;
          blue = 138.5177312231 * Math.log(blue) - 305.0447927307;
      }

  } else {

      red = temp - 60;
      red = 329.698727446 * Math.pow(red, -0.1332047592);

      green = temp - 60;
      green = 288.1221695283 * Math.pow(green, -0.0755148492 );

      blue = 255;
  }


  return {
      r : clamp(red,   0, 255),
      g : clamp(green, 0, 255),
      b : clamp(blue,  0, 255)
  }

}


function clamp( x, min, max ) {

if(x<min){ return min; }
if(x>max){ return max; }

return x;

}



function getRandWeightedTowardOne(){
  // x / sqrt(x^2 + 1) starts at 0 and approaches 1
  var randomX = Math.random()*degreeOfWeightTowardWhite;
  return randomX / Math.sqrt(randomX^2 + 1)


}

var starSet=[];

function rand(){
  return Math.random();
}


function compareByRadius(a,b) {
  if (a.radius < b.radius)
    return -1;
  if (a.radius > b.radius)
    return 1;
  return 0;
}

class Star {
  constructor(){

    //we'll not generate a new radius later, since that would mean we'd have to re-sort the stars
    // console.log(minimumRadius +rand()*(maximumRadius-minimumRadius))
    this.radius = minimumRadius +rand()*(maximumRadius-minimumRadius);

    this.generate();
    this.then= Date.now();

    //make the star start at a random place in the window
    this.x = Math.floor(Math.random()*window.innerWidth);



  }

  generate(){

    var starColor = getStarColorFromRand();
    // this.r = Math.floor(255*getRandWeightedTowardOne());
    // this.g =  Math.floor(255*getRandWeightedTowardOne());
    // this.b =  Math.floor(255*getRandWeightedTowardOne());
    this.r = Math.floor(starColor.r);
    this.g = Math.floor(starColor.g);
    this.b = Math.floor(starColor.b);


    this.alpha=minAlpha+Math.random()*(1-minAlpha);
    this.dimming = Math.random()>.5;

    this.color = `rgba(${this.r},${this.g},${this.b},${this.alpha})`;

    this.y = Math.floor(Math.random()*window.innerHeight);
    this.x = -10;

    var fractionMaxRadius = (this.radius-minimumRadius)/(maximumRadius-minimumRadius)

    this.speed = minSpeed + fractionMaxRadius*(maxSpeed-minSpeed)
  }

  changeAlpha(timeDelta){
    if (this.dimming){
      this.alpha=this.alpha-twinkleSpeed*timeDelta;
      if (this.alpha < minAlpha ) {
        this.alpha=minAlpha;
        this.dimming = false;
        this.supernova=false;
        if (Math.random()>.999) {
          console.log("nova!");
          this.supernova=true;
        }
      }
    } else {
      this.alpha=this.alpha+twinkleSpeed*timeDelta;
      if (this.alpha > .8) {
        this.dimming = true;
      }
    }
    this.color = `rgba(${this.r},${this.g},${this.b},${this.alpha})`;
  }


  draw(ctx){
    let now = Date.now();
    let timeDelta = now-this.then;
    this.then = now;

    //we'll knock it off by ten, since this gives ~1, leading to one "movment" per unit time, since I was initially running this without a time delta
    timeDelta=timeDelta/10;

    this.x = this.x+this.speed*timeDelta/slowingFactor;
    // console.log(requestFadeout);
    if (this.x>window.innerWidth+10 && !requestFadeout) this.generate();

    this.changeAlpha(timeDelta);

    var supernovaMultiplier=1;
    if (this.supernova) supernovaMultiplier=20;

    var haloRadius = this.radius*(1+(this.alpha-minAlpha)*maxHalo*supernovaMultiplier);
    var rad = ctx.createRadialGradient(this.x, this.y, 1, this.x, this.y, haloRadius);
    var darkenR = Math.floor(this.r*this.alpha);
    var darkenG = Math.floor(this.g*this.alpha);
    var darkenB = Math.floor(this.b*this.alpha);
    var colorStr = `${darkenR},${darkenG},${darkenB}`;
     rad.addColorStop(0, 'rgba('+colorStr+`,1)`);
     rad.addColorStop(.5, 'rgba('+colorStr+`,${this.alpha})`);
     rad.addColorStop(1, 'rgba('+colorStr+',0)');
     ctx.fillStyle = rad;



    ctx.beginPath();
    ctx.arc( this.x, this.y, haloRadius, 0, 2 * Math.PI, false );
    ctx.fill( );


  }
}
