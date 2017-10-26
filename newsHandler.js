console.log('doop')
$("#currentPlayerCount").text(44)


//json is a list of servers, each listing its total player count then detailing each instance
var totalPlayers;



function refreshPlayerCount(){
  $.getJSON('https://starblast.io/simstatus.json', function(servers) {
    totalPlayers=0;
    $.each(servers, function(index,server) {
      // console.log(server["location"]+":"+server["current_players"])
      totalPlayers+=server["current_players"];
    })
    console.log("total:"+totalPlayers)
    if($("#currentPlayerCount")) {
      $("#currentPlayerCount").text(totalPlayers)
      $("#currentPlayersWrapper").css("opacity",1)
    }
    setTimeout(refreshPlayerCount,5000)
  })

}

refreshPlayerCount()
