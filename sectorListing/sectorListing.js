function sortJSON(dataa, key, way) {
    return dataa.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        if (way === '123' ) { return ((x < y) ? -1 : ((x > y) ? 1 : 0)); }
        if (way === '321') { return ((x > y) ? -1 : ((x < y) ? 1 : 0)); }
    });
}


function changeAlert(key){
  // console.log('changingAlert:'+key);
  if ($("#alert-"+key.replace(/\s+/g, '')).prop('checked')) {
    // console.log('checjed');
    alertServers[key.replace(/\s+/g, '')]="checked";
    // $.each( alertServers, function( key, value ) {
    //   console.log( key + ": " + value );
    // });
  } else {
    // console.log('unchekd');
    alertServers[key.replace(/\s+/g, '')]="unchecked";
    // console.log(alertServers.toString());
    // $.each( alertServers, function( key, value ) {
    //   console.log( key + ": " + value );
    // });
  }

  // $("#alert-Asia").prop('checked',true);


  // console.log("#alert-"+key);
}

var alertServers={};

var icons={
  "survival":"accessibility",
  "team":"people",
  "deathmatch":"whatshot"
}

function refreshZones(){



  var Zones = {}



  $.getJSON('http://starblast.io/simstatus.json', function(data) {
      $.each(data, function(index) {

          var location = data[index].location

          var systems = data[index].systems

          $.each(systems, function(index2) {
              var system = systems[index2]
              var systemName = system.name
              var time = system.time
              var id = system.id
              var players = system.players
              var open = system.open
                // team or survival mode
              var mode = system.mode
              // var modeIcon=icons[mode];
              // if (mode=="team"){
              //   modeIcon = "people";
              // } else if (mode=="survival") {
              //   modeIcon = "accessibility";
              // } else {
              //   modeIcon = "favorite";
              // }

              var criminality = system.criminal_activity;

              var criminalState;
              if(criminality<4){
                criminalState="greenCriminalState";
              } else if(criminality<7){
                criminalState="yellowCriminalState";
              } else {
                criminalState="redCriminalState";
              }

              try{
              Zones[location].push({"name":systemName,"time":time,"players":players,"id":id,"open":open,"mode":mode,"criminality":criminality,"criminalState":criminalState});
              }
              catch(e){
                  Zones[location]=[];
                  Zones[location].push({"name":systemName,"time":time,"players":players,"id":id,"open":open,"mode":mode,"criminality":criminality,"criminalState":criminalState});
              }
          });

      });

      $("#zoneWrapper").html("");

      var ZonesTemp = Zones;
      Zones={};

      Object.keys(ZonesTemp).sort().forEach(function(key) {
        Zones[key] = ZonesTemp[key];
      });

      for (var key in Zones){
          // $("#zoneWrapper").append("<div class='zoneCard'><h2>"+key+"</h2>")
          var zoneString="<div class='zoneCard'><h2 class='zoneName'>"+key+"</h2>";
          zoneString+=`
            <div class='alertWrapper'>
              <span>New sector alert:</span>
              <input class="alertCheckBox" type="checkbox" ${alertServers[key.replace(/\s+/g, '')]} id="alert-${key.replace(/\s+/g, '')}" onClick="changeAlert('${key.replace(/\s+/g, '')}')">
            </div>
          `;
          sortJSON(Zones[key], "time", "123")
          $.each(Zones[key], function(index) {

              var sys = Zones[key][index];

              var mode = sys.mode;
              //if this sector is team, and team is not checked, skip
              //if this sector is survival, and survival is not checked, skip

              if(mode=="team" && !$("#enableTeam").is(':checked')){
                return;
              }
              if(mode=="survival" && !$("#enableSurvival").is(':checked')){
                return;
              }
              if(mode=="deathmatch" && !$("#enableDeathmatch").is(':checked')){
                return;
              }


              var newServer = "";
              minutes = Math.floor(sys.time / 60);
              if (minutes<15) {
                newServer = "newServer";
              }

              if (minutes==0){
                if (alertServers[key.replace(/\s+/g, '')]=="checked"){
                  alert("Fresh server for "+key+"!");
                  alertServers[key.replace(/\s+/g, '')]="unchecked";
                }
              }

              seconds = sys.time % 60;



              if (sys.open){
                  var link = "http://starblast.io/#"+sys.id
                  var linkname = "<a class='"+newServer+"' href='"+link+"''>"+sys.name+"</a>"
                  var systemClass=newServer;
              } else {
                  var linkname = "<span class='survivalServer'>(S) "+sys.name+"</span>"
                  var systemClass = "survivalServer";
              }

              // $("#zoneWrapper").append(`
              zoneString+=`

                <a class='system ${systemClass}' href='${link}'>
                  <i class="material-icons ${sys.mode}Icon modeIcon">${icons[sys.mode]}</i>
                  <span class='systemName'>${sys.name}</span>
                  <span class='minutes ${newServer}'>${minutes} min</span>
                  <i class="material-icons">face</i>
                  <span class='playerCount'>${sys.players} </span>
                  <i class="material-icons criminalityIcon ${sys.criminalState}">warning</i>
                  <span class='criminality ${sys.criminalState}'>${sys.criminality}</span>

                </a>

              `;
          });
          // close the zoneCard
          zoneString+='</div>';
          $("#zoneWrapper").append(zoneString);
      }


  });

  // setTimeout(
  // function(){
  //   checkBoxes();
  // },
  // 300);



}


var intervalID = setInterval(function(){refreshZones()}, 10000);
refreshZones();
