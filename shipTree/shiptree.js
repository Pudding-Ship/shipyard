console.log('tree!')
$.get("/universal/tree.txt",makeTree);


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
  console.log(treeTxt)
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
  console.log(choiceTriplets)

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
        console.log("found"+chooser)
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
              console.log("pair found:"+ship+" and "+nextShip);
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
  $.each(shipTierDict, function( tierIndex, tier ){
    fullString+="<div>"

    $.each(tier, function( shipIndex, ship ){

      var incomingLeft=false;
      var previousShip = tier[shipIndex-1];
      if(previousShip){
        if(previousShip.incomingRight) incomingLeft=true;
      }

      var shipString="<span class='shipAreaWrapper'><span class='incomingWrapper'>";
      // shipString+="<span class='incomingLeft ${ship.name} '"
      if(incomingLeft) shipString+="\\"
      if (ship.incomingRight){
        shipString+="/<br>"
      } else {
        shipString+="<br>"
      }
      shipString+=ship.name;
      shipString+="</span>"

      fullString+=shipString
    })

    fullString+="</div>"

  })

  $("#shipTree").html(fullString);
  $("#shipTree").html("ddd");

  // document.write(fullString)
  console.log($("#shipTree").html())
  console.log(fullString)
  treeHtml=fullString;
  writeShipTreeHtml();
}

function writeShipTreeHtml(){

  if(!$("#shipTree").html()){
    setInterval(writeShipTreeHtml,100)
  }
  // $("#shipTree").html(treeHtml);
}
