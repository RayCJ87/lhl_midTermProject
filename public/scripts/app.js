let scheduleData;

// button to set multiple timeslots.
function loadTimeSlots(){
    time = $('.eventSetup #getDate').val();
    let theText = `<p>${time}</p> <input type="hidden" value="${time}" name="eventTimes[]"/>`;
    $('.eventSetup .timeZone').append(theText);

}

//show timeslots selection
function composeEvent(){
  $('.title').slideToggle(100);
  $('.eventSetup').slideToggle(100)
}

// generate an new Url
function getEventUrl(){
  let randomURL = generateRandomString();
  let totalURL = "http://localhost:8080/u/" + randomURL;
  $('#eventURL').val(totalURL);
  return randomURL;
}

// copy the Url
function copyUrl(){
  const theDoc = document.getElementById("eventURL");
  theDoc.select();
  document.execCommand("copy");
}


// generate a random string as new event id which can be used as URL
function generateRandomString() {
  const randomKey = "1qaz2wsx3edc4rfv5tgb6yhn7ujm8ik9ol0pQAZWSXEDCRFVTGBYHNUJMIKOLP";
  let output= "";
  while (output.length < 6){
    var tempNum = Math.floor(Math.random() * (randomKey.length));
    output+= randomKey[tempNum];
  }
  return output;
}

//send attendee info and selected timeslots to back end.
function updateAttStatus(){
    if ($('#newAttendeeMail').val() && $('#newAttendeeName').val()){

      let attTimeUpdate = {}
      for (let i = 0; i < $('.scheduleList .switchToggle').length; i++) {
        if (document.getElementById(`box${i}`).checked == true) {
          attTimeUpdate[i] = true;

        }
        else{
          attTimeUpdate[i] = false;
        }
      }
      let attInfo = {attName: $('#newAttendeeName').val(), attMail: $('#newAttendeeMail').val(), attTimes: attTimeUpdate};
      $.ajax({url: "/api/events/:id" , data: attInfo, method: 'PUT'}).done(function(){
        console.log("Successfully sent data!");
        location.reload(true);
      })
    }
}

// list all timeslots
function getSchedules() {
     scheduleData = $.ajax({url: "/api/events/invite" , method: 'GET'});
        scheduleData.done(function(response) {
          let checkList = [];
          for (let i in response) {
            if (!checkList.includes(response[i])){
              let scheduleTables = `<li id="time${i}">${response[i]}  <label class="switch"><input class="switchToggle" type="checkbox" id="box${i}">
              <span class="sliderRound" data-on="Yes" data-off="off"></span></label></li>`;
              $('#attendeeRSVP .scheduleList').append(scheduleTables);
            }
            checkList.push(response[i]);
          }
      });

}

$( document ).ready(function() {
  $('.toggleEdit').hide();
  $('.eventSetup').hide();
  $('#copyButton').on("click", copyUrl);
  getSchedules();
  loadTimeSlots();
  const secretURL = getEventUrl();
  const urlAddress = {secretURL: secretURL};
  console.log("The URL is: ", urlAddress);
  $('#submitAvailability').on("click", updateAttStatus);
  $.ajax({url: "/api/events/create", data: urlAddress, method: 'PUT'}).done(function(){
      console.log("Success!");
    });
  //to make first page toggle slide when click on "create an event" button
  $( '.content1' ).hide();
  $( '#start' ).on('click', function() {
    $( '.content1' ).slideDown(500)
    $( '#start' ).hide()
  })

  $( '#thankYou' ).hide()
  $( '#doneBtn' ).on('click', function(){
    $(' .eventWrapper ').hide()
    // $(' #thankYou ').fadeIn('slow').delay( 3000 ).fadeOut('slow');
    window.location.href = "http://localhost:8080";
  })

})
