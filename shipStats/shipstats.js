

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



function makeTableHTML(myArray) {
    var result = "<table id='statTable'>";
    result+="<thead id='statTableHead' class='blueBox'><tr>"

    // create all the headers
    for(var i=0;i<statExtraction.length;i++){
      try{
        if (myArray[0][i].includes(",")){
          result+="<th class='minStat hidden'>Min "+statExtraction[i][0]+"</th><th class='maxStat'>Max "+statExtraction[i][0]+"</th>";
        } else {
          result+="<th>"+statExtraction[i][0]+"</th>";
        }
      } catch(e) {
          console.log("Regex likely fucked for: "+statExtraction[i][0])
      }
    }


    result+="</tr></thead>"
    result+="<tbody id='statTableBody'>";
    for(var i=0; i<myArray.length; i++) {
        result += "<tr>";
        for(var j=0; j<myArray[i].length; j++){
          if (myArray[0][j].includes(",")){
            var splitt = myArray[i][j].split(',');
            result += "<td class='minStat hidden'>"+splitt[0]+"</td>";
            result += "<td class='maxStat'>"+splitt[1]+"</td>";
          } else {
            result += "<td>"+myArray[i][j]+"</td>";
          }

        }
        result += "</tr>";
    }
    result+="</tbody>";
    result += "</table>";

    return result;
}

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


function transpose(a) {
return Object.keys(a[0]).map(
    function (c) { return a.map(function (r) { return r[c]; }); }
    );
}

$( document ).ready(function() {

  $.get("/universal/ssrc.txt",parseSrc);

});

var statTable;
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




  statTable = transpose(statTable);
  var tableHTML = makeTableHTML(statTable);
  $("body").append(tableHTML);
  $("#statTable").tablesorter();

  $("#htmlHolder").val(tableHTML);

  $("#header").addClass("fixed");


};

function swapMinMax(){

  if ($("#minMaxButton").prop('checked')) {
    $('.minStat').addClass('hidden');
    $('.maxStat').removeClass('hidden');
  } else {
    $('.maxStat').addClass('hidden');
    $('.minStat').removeClass('hidden');
  }

}
