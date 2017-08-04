var statTable;
var statDicts;
var shipJson={}


$( document ).ready(function() {

  $.get("/universal/ssrc.txt",parseSrc);

});


var statExtraction = [
  ["Tier",/(?:name:".*?",.*?:)([^,]*)/g],
  ["Ship Name",/(?:name:")([^"]*)/g],
  ["Shield Regen",/(?:shield:{.*?reload:\[)([^\]]*)/g],
  ["Shield Cap",/(?:shield:{capacity:\[)([^\]]*)/g],
  ["Energy Regen",/(?:generator:{.*?reload:\[)([^\]]*)/g],
  ["Energy Cap",/(?:generator:{.*?capacity:\[)([^\]]*)/g],
  ["Ship Speed",/(?:ship:{mass:.*?,.*?:\[)([^\]]*)/g],
  ["Rotate",/(?:ship:{.*?rotation:\[)([^\]]*)/g],
  ["Accel",/(?:ship:{.*?acceleration:\[)([^\]]*)/g],
  ["Mass",/(?:ship:{.*?mass:)([^,]*)/g]

]


var getStatArray = function(text, aRegex){
  var statArray = [];
  var match = aRegex.exec(text);
  while (match != null) {
    // every time you run an exec on shipNamesRE, it appears to grab the next match
    //grabbing results: match[desiredCapturingGroup]
    statArray.push(match[1]);
    // console.log(match[1])
    match = aRegex.exec(text);
  }
  return statArray;
};

function parseSrc(data){

  var ssrc = data;

  var statSectionRE = /shiptypes[\S\s]*math/;
  var statSection = statSectionRE.exec(ssrc);

  statTable=[]
  for (var i=0;i<statExtraction.length;i++){
    var regex = statExtraction[i][1];
    var statArray = getStatArray(statSection,regex);
    statTable.push(statArray)
  }

  //get array, each item containing bulk text of a ship's weapon data
  var bulkRE=/(.add\({name:[\s\S]*?\))/g

  var bulkArr=getStatArray(statSection, bulkRE)

  //now we'll want to iterate over all of these ships, and add up all the weapon stuff for each one, to create some useful min/max stats
  var DPSarr=[];
  var ShotgunArr=[];
  $.each(bulkArr, function( index, weaponSet ) {
    // $(".bodyWrapper").append( index + ": " + weaponSet +"<br>" );

    //array of shots per second for each weapon
    var weaponRatesRE=/(?:rate:)([^,]*)/g
    var rateArray=getStatArray(weaponSet, weaponRatesRE)

    //array of damage per shot
    var damageRE=/(?:z:.*?,.*?,.*?:.)([^\]]*)/g
    var damageArray=getStatArray(weaponSet, damageRE)
    // console.log(""+statSection)
    console.log(bulkArr)
    console.log(weaponSet)
    console.log(damageArray)

    //array of number of shots spreading from this weapon
    var shotRE=/(?:number:)(\d*)/g
    var shots=getStatArray(weaponSet, shotRE)

    var totalMinDPS=0;
    var totalMaxDPS=0;
    var totalMinShotgun=0;
    var totalMaxShotgun=0;
    // console.log('starting dps calc for a weapon set. weapon origin count:'+rateArray.length);

    console.log("num rates:"+bulkArr.length)
    console.log("num ships:"+statTable[1].length)
    for(var i=0;i<rateArray.length;i++){
        var minDamage=0;
        var maxDamage=0;
        var rate=0;
        var weaponCount=0;
        //will only work if ship has weapons (barracuda doesn't)
        try{
          minDamage = damageArray[i].split(",")[0];
          maxDamage = damageArray[i].split(",")[1];
          rate = rateArray[i];
          weaponCount = shots[i];
        } catch(e){

        }



        var minDPS = Math.floor(minDamage*rate*weaponCount);
        var maxDPS = Math.floor(maxDamage*rate*weaponCount);

        var minShotgun=minDamage*weaponCount;
        var maxShotgun=maxDamage*weaponCount;

        totalMinDPS=totalMinDPS+minDPS;
        totalMaxDPS=totalMaxDPS+maxDPS;

        totalMinShotgun+=minShotgun;
        totalMaxShotgun+=maxShotgun;

        // console.log(statTable[1][index]+" weapon"+i+" rate:"+rate+", count:"+weaponCount+", mindam:"+minDamage);
    }

    DPSarr.push(totalMinDPS+","+totalMaxDPS);
    ShotgunArr.push(totalMinShotgun+","+totalMaxShotgun);

  });

  statExtraction.push(["Burst DPS",0])
  statTable.push(DPSarr);
  statExtraction.push(["Empty DPS",0])
  statTable.push(statTable[4]);
  statExtraction.push(["One-Shot",0])
  statTable.push(ShotgunArr);
  // FINISH: adding calculated damage stats

  statDicts=[
    {"name":"Shield Capacity","class":"shield","column":3,"minStats":[],"maxStats":[],"max":0,"minPercents":[],"maxPercents":[],"image":"shieldc.png"},
    {"name":"Shield Regen","class":"shield","column":2,"minStats":[],"maxStats":[],"max":0,"minPercents":[],"maxPercents":[],"image":"shieldr.png"},
    {"name":"Energy Capacity","class":"energy","column":5,"minStats":[],"maxStats":[],"max":0,"minPercents":[],"maxPercents":[],"image":"energyc.png"},
    {"name":"Energy Regen","class":"energy","column":4,"minStats":[],"maxStats":[],"max":0,"minPercents":[],"maxPercents":[],"image":"energyr.png"},
    {"name":"Burst Damage","class":"damage","column":10,"minStats":[],"maxStats":[],"max":0,"minPercents":[],"maxPercents":[],"image":"damage.png"},
    {"name":"Speed","class":"speed","column":6,"minStats":[],"maxStats":[],"max":0,"minPercents":[],"maxPercents":[],"image":"speed.png"}
  ]

  $.each(statDicts, function( index, dict ) {
    var rawStats = statTable[dict.column];
    if (rawStats[0].includes(',')){
      $.each(rawStats, function( index, rawStat ) {
        var splitt=rawStat.split(',');
        dict.minStats.push(splitt[0]);
        dict.maxStats.push(splitt[1]);
      });
    }
  })

  makeShipJson();
}


function makeShipJson(){
  var shipNames = statTable[1];
    $.each(shipNames, function( shipIndex, shipName ) {
      var shipProperties={}
      shipProperties["nameWithSpaces"]=shipName;
      $.each(statDicts, function( statIndex, statData ) {
        shipProperties[statData["name"]] = statData["maxStats"][shipIndex];
      })
      shipJson[shipName.replace(/\s+/g, '')]=shipProperties;
    })
}
