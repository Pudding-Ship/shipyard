$( document ).ready(makeActivePage);

function makeActivePage(){

  try{
    pageNavID
  } catch(e) {
    console.log('cannot highlight active navbar -- no pageNavID')
    setTimeout(makeActivePage,100)
    return
  }
  console.log("active page: "+pageNavID);

  var activeNav = document.getElementById(pageNavID+"Nav");
  // console.log(activeNav)
  if(!activeNav){
    console.log('cannot highlight active navbar -- no activeNav element')
    setTimeout(makeActivePage,100)
  }

  $("#"+pageNavID+"Nav").addClass("activePage");
  document.title="Loveship's Shipyard - "+pageName;

  starryInit();

}
