console.log('tree!')
$.get("/universal/tree.txt",makeTree);

var lightBlue="rgba(113,185,255,.8)";
var highlight="#fff3a8";


/*
ulimate objective:

a tier consists of: ship, possible incoming line to the right (piltr), ship, piltr -- that's all that's necessary to build a tier

{
 tier4:
  ship1:
    name:
    image:
    incomingRight:true or false
}

a given ship has an incoming right *only* if a pair of this ship, and the next ship in the tier, exists among the upgrade choices

step1: make list of upgrade choices
step2: flesh out tier dictionary with ships. a ship is in the next tier if and only if it was mentioned by the previous tier
step3: grab pair of ships, add incoming right property iff the pair is mentioned among upgrade choices


*/
var choiceTriplets=[];
var shipTierDict=[];
var shipsByTier=[];
function makeTree(treeTxt){
  // console.log(treeTxt)
  var textLines = treeTxt.split('\n');




  $.each(textLines, function( textIndex, text ) {
    // console.log(text)
    var nameAndChoices = text.split(' => ');
    var shipName = nameAndChoices[0];
    //skip blank lines
    if (shipName.length<2) return;

    var choicesString = nameAndChoices[1];
    var choices =choicesString.split(" or ");
    choiceTriplets.push([shipName.trim(),choices[0].trim(),choices[1].trim()]);
  });
  // console.log(choiceTriplets)

  shipsByTier.push(["Fly"])

  //iterate over all tiers but the last, first adding a blank next tier, then filling up that next tier with all ships that are one of the current tier's upgrade options
  for(var tierIndex=0;tierIndex<6;tierIndex++){
    shipsByTier.push([]);
    $.each(choiceTriplets, function( choiceIndex, triplet ) {
      var chooser = triplet[0];
      var choice1 = triplet[1];
      var choice2 = triplet[2];
      //if chooser exists among current tier, choices are in next tier. add choices to next tier if they're not already present
      var thisTierChoosers=shipsByTier[tierIndex]
      if (shipsByTier[tierIndex].includes(chooser)){
        // console.log("found"+chooser)
        if(!shipsByTier[tierIndex+1].includes(choice1)) shipsByTier[tierIndex+1].push(choice1)
        if(!shipsByTier[tierIndex+1].includes(choice2)) shipsByTier[tierIndex+1].push(choice2)
      }
    })
  }
  // create a dictionary, iterating over all shipsByTier, and adding incomingRight property if this ship and next ship exist among upgrade pairs
  shipTierDict=[]
  $.each(shipsByTier, function( tierIndex, tier ){
    var currentTierDictArray=[]
    $.each(tier, function( shipIndex, ship ){
      var incomingRight=false;
      //if the next ship on this tier exists, check if an upgrade pair with it exists
      if(tier[shipIndex+1]){
        var nextShip = tier[shipIndex+1];
          $.each(choiceTriplets, function( choiceIndex, triplet ) {
            if(triplet[1]==ship && triplet[2]==nextShip){
              // console.log("pair found:"+ship+" and "+nextShip);
              incomingRight=true;
            }
          });
      }
      currentTierDictArray.push({
        "name":ship,
        "incomingRight":incomingRight
      })
    })
    shipTierDict.push(currentTierDictArray);

  })


  //now print
  var fullString="";
  // $.each(shipTierDict, function( tierIndex, tier ){

  for (var tierIndex=shipTierDict.length-1; tierIndex>-1;--tierIndex){
    var tier = shipTierDict[tierIndex]

    var specialTierClass=""
    if(tierIndex==0) specialTierClass="firstTier"
    if(tierIndex==shipTierDict.length-1) specialTierClass="lastTier"
    fullString+=`<div class="tier ${specialTierClass}">`


    //ship positions are given by (1+shipIndex*2)/(2*shipTierDict[tierIndex].length)
    //centers of connecting lines below are given by (2+connectingIndex*2)/(2*shipTierDict[nextTierIndex].length)
    //assuming a ship always connects with the closest connecting line, its outlet should go right if the nearest line's center is greater than its position, and so on
    var nextTierLineCenters=[];
    $.each(shipTierDict[tierIndex+1], function( shipIndex, ship ){
      //don't add the last position, which would be 1
      if(shipIndex == shipTierDict[tierIndex+1].length-1) return;
      nextTierLineCenters.push((2+2*shipIndex)/(2*shipTierDict[tierIndex+1].length))
    })
    // console.log(nextTierLineCenters)

    $.each(tier, function( shipIndex, ship ){


      var incomingLeft=false;
      var previousShip = tier[shipIndex-1];
      if(previousShip){
        if(previousShip.incomingRight) incomingLeft=true;
      }

      var shipPosition = (1+shipIndex*2)/(2*tier.length);
      // console.log(shipPosition)

      var closestLineCenter=0;
      var nearestDistance=9999;
      $.each(nextTierLineCenters, function( centerIndex, centerPosition ){
        var distance = Math.abs(centerPosition-shipPosition)
        if(distance<nearestDistance) {
          closestLineCenter=centerPosition;
          nearestDistance=distance
        }
      })
      // console.log("nearest:"+closestLineCenter)
      var leftOutlet=false;
      var middleOutlet=false;
      var rightOutlet=false;
      if(closestLineCenter<shipPosition) leftOutlet=true;
      if(closestLineCenter==shipPosition) middleOutlet=true;
      if(closestLineCenter>shipPosition) rightOutlet=true;

      var shipString=`
        <span class='shipAreaWrapper'>



          <div class='shipWideWrapper'>

            <span class='outletLineWrapper'>
              <span id=${ship.name.replace(/\s+/g, '')+'outgoingL'} class='outletLine show${leftOutlet}'></span>
              <span id=${ship.name.replace(/\s+/g, '')+'outgoingM'} class='outletLine show${middleOutlet}'></span>
              <span id=${ship.name.replace(/\s+/g, '')+'outgoingR'} class='outletLine show${rightOutlet}'></span>
            </span>



            <span  id=${ship.name.replace(/\s+/g, '')+'shipBox'} class='shipBox blueBox' onmouseenter='showUpgrades("${ship.name.replace(/\s+/g, '')}") '   onmouseleave=' hideUpgrades("${ship.name.replace(/\s+/g, '')}") '>
              <span id=${ship.name.replace(/\s+/g, '')+'name'} class="shipNameStroke">
                ${ship.name}
              </span>
              <span id=${ship.name.replace(/\s+/g, '')+'stroke'} class="shipName">
                ${ship.name}
              </span>
              <span id=${ship.name.replace(/\s+/g, '')+'stats'} class='shipStatsBox'>
                <span class='statWrapper'><img class='statImage' src="/miscImages/shieldc.png"/> <span id=${ship.name.replace(/\s+/g, '')+'shieldc'}>4</span>  </span>
                <span class='statWrapper'><img class='statImage' src="/miscImages/shieldr.png"/>  <span id=${ship.name.replace(/\s+/g, '')+'shieldr'}>4</span> </span>
                <span class='statWrapper'><img class='statImage' src="/miscImages/energyc.png"/> <span id=${ship.name.replace(/\s+/g, '')+'energyc'}>4</span>  </span>
                <span class='statWrapper'><img class='statImage' src="/miscImages/energyr.png"/> <span id=${ship.name.replace(/\s+/g, '')+'energyr'}>4</span>  </span>
                <span class='statWrapper'><img class='statImage' src="/miscImages/speed.png"/>  <span id=${ship.name.replace(/\s+/g, '')+'speed'}>4</span> </span>
                <span class='statWrapper'><img class='statImage' src="/miscImages/damage.png"/>  <span id=${ship.name.replace(/\s+/g, '')+'damage'}>4</span> </span>
              </span>
              <img class="shipImage" src="/shipImages/${ship.name.replace(/\s+/g, '')}.png" onerror="this.onerror=null;this.src='/shipImages/question.png';" />
            </span>
          </div>

          <span class='incomingWrapper'>
            <span id=${ship.name.replace(/\s+/g, '')+'incomingLeft'} class="incomingLeft show${incomingLeft}"></span>
            <span class='incomingSpacer'></span>
            <span id=${ship.name.replace(/\s+/g, '')+'incomingRight'} class="incomingRight show${ship.incomingRight}"></span>
          </span>

        </span>
      `

      fullString+=shipString;
    })

    fullString+="</div>"

  }

  $("#shipTree").html(fullString);
  $("#shipTree").html("ddd");


  treeHtml=fullString;
  // setInterval(writeShipTreeHtml,5000)
  writeShipTreeHtml();
}

function writeShipTreeHtml(){

  if(!$("#shipTree").html()){
    setTimeout(writeShipTreeHtml,100)
  }
  $("#shipTree").html(treeHtml);
}

function getUpgrades(shipname){
  var choice1=""
  var choice2=""
  $.each(choiceTriplets, function( tripletIndex, triplet ){
    if(triplet[0].replace(/\s+/g, '')==shipname){
      //remove spaces
      choice1=triplet[1].replace(/\s+/g, '');
      choice2=triplet[2].replace(/\s+/g, '');
    }
  })
  if(choice1=="") return;
  return [choice1,choice2];
}

function hideUpgrades(shipname){
  setAll(shipname,0,lightBlue);
}

function showUpgrades(shipname){
  setAll(shipname,1,highlight);
}

function setAll(shipname,opacity,color){
  var upgrades=getUpgrades(shipname);
  if(!upgrades) return;
  setOpacity(upgrades[0],opacity)
  setOpacity(upgrades[1],opacity)
  setOpacity(shipname,opacity)
  setIncoming(upgrades[0],"incomingRight",color)
  setIncoming(upgrades[1],"incomingLeft",color)
  setOutgoing(shipname,color)

  $("#"+shipname+"shipBox").css('border-color', color)
  $("#"+upgrades[0]+"shipBox").css('border-color', color)
  $("#"+upgrades[1]+"shipBox").css('border-color', color)
}



function setOpacity(ship,opacity){
  $("#"+ship+'stats').css('opacity', opacity)
  $("#"+ship+'stroke').css('opacity', opacity)
  $("#"+ship+'name').css('opacity', opacity)
}

function setIncoming(ship,incomingDirection,color){
  $("#"+ship+incomingDirection).css('border-color', color)
}

function setOutgoing(ship,color){
  $("#"+ship+"outgoingL").css('background', color)
  $("#"+ship+"outgoingM").css('background', color)
  $("#"+ship+"outgoingR").css('background', color)
}

function setStats(shipName){
  $(shipName+'shieldc').text(2)
  $(shipName+'shieldr').text(2)
  $(shipName+'energyc').text(2)
  $(shipName+'energyr').text(2)
  $(shipName+'speed').text(2)
}

function setRelativeStats(shipOrigin,upgrades){

}
