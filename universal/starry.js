


// window.onload=starryInit();

var nebCanvas;
var nebWindowWidths=2;
var nebulaSpeed=.5;
function starryInit(){

  var canvasHolder = document.getElementById('canvasHolder');
  if(!canvasHolder){
    setTimeout(starryInit,100);
    console.log("no holder for canvas")
    return;
  }
  var canvas = document.createElement('canvas');
  canvas.id = 'parallaxStars';
  canvas.style.cssText = `
  padding: 0;
  margin: 0;
  position: absolute;
  top:0;
  left:0;
  z-index=-100;
  pointer-events: none;
  `;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  canvasHolder.appendChild(canvas);

  nebcanvas = document.createElement('canvas');

  nebcanvas.id = 'nebcanvas';
  nebcanvas.style.cssText = `
  padding: 0;
  margin: 0;
  top:0;
  left:0;
  z-index-200;
  pointer-events: none;
  opacity: 0;
  `;
  nebcanvas.width = window.innerWidth;
  nebcanvas.height = window.innerHeight;
  canvasHolder.appendChild(nebcanvas);
  regenerate();
  window.requestAnimationFrame(generateAndDraw);

}

window.onresize=instigateRegen;
window.onblur=instigateRegen;

// nebctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
var nebulaWorker;
var fadeoutReady=true;
var requestFadeout=false;

function instigateRegen(){
  requestFadeout=true;
  fadeoutReady=false;
  regenerate();
}


var emergRegen=false;
function emergencyRegen(){
  emergRegen=true;
  requestFadeout=false;
  fadeoutReady=true;
  regenerate();
  // console.log('emer regen');
}


var regenReady=true;
function regenerate(){

  // if (!regenReady){
  //   return;
  // }
  // regenReady=false;

  // console.log('requesting regen');
  if(!fadeoutReady&&!emergRegen){
    // console.log("still fading for window resize regeneration")
    setTimeout(regenerate, 100);
    return;
  }
  // console.log("redoing")


  var cnv = document.getElementById('parallaxStars');
  var nebcanvas = document.getElementById('nebcanvas');
  nebcanvas.width = window.innerWidth;
  nebcanvas.height = window.innerHeight;
  cnv.width = window.innerWidth;
  cnv.height = window.innerHeight;





  if(nebulaWorker){
    nebulaWorker.terminate();
  }



  //star density = stars/(100,000 pixels)
  //we have window.innerWidth * window.innerHeight pixels == ~ 1,211,634 pixels on full screen
  //we want perhaps 1000 stars on full screen.
  //thusly, density = (1,000 stars) width*height*(100,000 pixels/1 star) / (1,211,634 pixels)
  // ~ 8
  // for a modified density, star count = density * width * height / (100,000)
  starSet=[]
  randomizeSizeAndDensity();
  var starCount = starDensity * window.innerWidth*window.innerHeight/100000
  // console.log("stars:"+starCount)
  for(var i=0;i<starCount;i++){
    starSet.push(new Star());
  }
  starSet.sort(compareByRadius);

  var nebcanvas = document.getElementById('nebcanvas');
  nebctx = nebcanvas.getContext('2d');
  var imageData = nebctx.createImageData(window.innerWidth*nebWindowWidths, window.innerHeight);

  nebulaWorker = new Worker('/universal/nebmaker.js');
  nebcanvas.ready=false;
  nebcanvas.style.opacity=0;
  nebulaX=-(nebWindowWidths-1)*window.innerWidth;
  nebulaWorker.postMessage(imageData);
  nebulaWorker.onmessage = function(e) {
    nebulaImage = e.data;
    nebctx.putImageData(nebulaImage, nebulaX, 0);
    nebcanvas.ready=true;
  }
  regenReady=true;
}
debugger;
var doBackgroundDraw = Boolean(+ localStorage.getItem('drawBackground'));

function updateBackgroundDrawUI() {
    var toggleButton = document.getElementById("backgroundToggle");
    if (doBackgroundDraw) {
        toggleButton.innerHTML = "Stars: On";
        toggleButton.classList.remove('disabledBackgroundButton');
    } else {
        toggleButton.innerHTML = "Stars: Off";
        toggleButton.classList.add('disabledBackgroundButton');
    }
}
document.addEventListener("DOMContentLoaded", function (event) {
    updateBackgroundDrawUI();
});
function toggleBackgroundDraw(){
  doBackgroundDraw=!doBackgroundDraw;

  updateBackgroundDrawUI();
  localStorage.setItem('drawBackground', +doBackgroundDraw);
}

var nebulaImage;
var nebulaX;
var then = Date.now();
var slowingFactor=1;

function generateAndDraw(){
  if(!doBackgroundDraw){
    setTimeout(generateAndDraw, 1000);
    return;
  }
  // console.log("requesting draw")

  let now = Date.now();
  let timeDelta = now-then;
  then = now;

  //we'll knock it off by ten, since this gives ~1, leading to one "movment" per unit time, since I was initially running this without a time delta
  timeDelta=timeDelta/10/slowingFactor;
  // console.log("delta:"+timeDelta)

  // if (timeDelta>10 && !tooSlow){
  //   // console.log(timeDelta)
  //   console.warn("TOO SLOW");
  //   tooSlow=true;
  //   emergencyRegen();
  //   return;
  // }

  // console.log("drawing")


  var cnv = document.getElementById('parallaxStars');
  var nebcanvas = document.getElementById('nebcanvas');
  var nebOpacity=Number(nebcanvas.style.opacity);
  var starOpacity=Number(cnv.style.opacity);

  if(nebcanvas.ready) {
    if(Number(nebcanvas.style.opacity)<1 && !requestFadeout){
      nebcanvas.style.opacity=Number(nebcanvas.style.opacity)+.01*timeDelta;
    }
    nebctx = nebcanvas.getContext('2d');
    nebctx.clearRect(0, 0, nebcanvas.width, nebcanvas.height);
    nebctx.putImageData(nebulaImage, nebulaX, 0);
    nebulaX+=nebulaSpeed*timeDelta;
    // console.log(nebulaX)
    if(nebulaX>-100 && !requestFadeout){
      instigateRegen();
    }
  }


  if(requestFadeout){

    // console.log(starOpacity)
    if(nebOpacity>0){
      nebcanvas.style.opacity=nebOpacity-.01*timeDelta;
    }
    if(starOpacity>0){
      cnv.style.opacity=starOpacity-.01*timeDelta;
    }
    if(starOpacity<=0 && nebOpacity<=0){
      fadeoutReady=true;
      requestFadeout=false;
      cnv.style.opacity=0;
      nebcanvas.style.opacity=0;
    }
    // console.log(nebOpacity)
    // console.log(starOpacity)
  } else {
    if(starOpacity<1){
      cnv.style.opacity=starOpacity+.01*timeDelta;
    }
  }










  var ctx = cnv.getContext('2d');
  ctx.clearRect(0, 0, cnv.width, cnv.height);
  ctx.font = "30px Arial";
  ctx.fillStyle = 'red';
  // ctx.fillText("yaya!",600,400);

  for(var i=0;i<starSet.length;i++){
    starSet[i].draw(ctx);
  }


  window.requestAnimationFrame(generateAndDraw);
}
