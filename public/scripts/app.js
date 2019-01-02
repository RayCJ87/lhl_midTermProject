let scheduleData;

// button to set multiple timeslots.
function loadTimeSlots(){
    console.log("loadTimeSlots");
    time = $('.eventSetup #getDate').val();
    let theText = `<p>${time}</p> <input type="hidden" value="${time}" name="eventTimes[]"/>`;
    $('.eventSetup .timeZone').append(theText);

}

//show timeslots selection
function composeEvent(){
  $('.eventSetup').slideToggle(100)
}

//remove unwanted guests
function removeItem(element){
  console.log($(element).parent());
  console.log("it's :", $(element).closest("li").innerText);
  $(element).closest("li").remove();
  $(element).find("input[type='hidden']").remove();

  // $(element).closest("input:hidden").remove();
  // $('input[type="hidden"][value="guestNames[]"]').remove();
  // console.log("To delete: ", $('input[type="hidden"][value="guestNames[]"]'));
}

//add new guests
function addAttendeeInfo(event){
  event.preventDefault();
  let name = $('#aName').val();
  let mail = $('#aMail').val();
  console.log(name, mail);
  if ($('#aMail').val() && $('#aName').val()){
    let guestInfo = `Name: ${name} - email: ${mail}`;
    let possibleGuests = `<li>${guestInfo}  <button type="button" onClick="removeItem(this)" class="removeInvite">Delete</button></li>
                          <input type="hidden" value="${name}" name="guestNames[]"/> <input type="hidden" value="${mail}" name="guestMails[]"/>`
    $('.invitedList .peopleList').append(possibleGuests);
    clearInfo();
  }
  // console.log(event);
}

function clearInfo() {
  $('#aMail').val('');
  $('#aName').val('');
}

// generate an new Url
function getEventUrl(){
  let randomURL = generateRandomString();
  let totalURL = "http://localhost:8080/api/events/" + randomURL;
  $('#eventURL').val(totalURL);
  console.log($('#eventURL').val());
  return randomURL;
}

// copy the Url
function copyUrl(){
  const theDoc = document.getElementById("eventURL");
  console.log(theDoc);
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

    console.log($('.scheduleList'));
    console.log("The checkbox: ", $('.scheduleList .switchToggle'));
    console.log("The number is ", $('.scheduleList .switchToggle').length);
    let attTimeUpdate = {}
    for (let i = 0; i < $('.scheduleList .switchToggle').length; i++) {
      if (document.getElementById(`box${i}`).checked == true) {
        attTimeUpdate[i] = true;
        console.log("The box is:", document.getElementById(`box${i}`), "And", document.getElementById(`box${i}`).closest('li'));
        console.log("The time update is: ", attTimeUpdate);
      }
      else{
        attTimeUpdate[i] = false;
      }
    }
    let attInfo = {attName: $('#newAttendeeName').val(), attMail: $('#newAttendeeMail').val(), attTimes: attTimeUpdate};
    $.ajax({url: "/api/events/:id" , data: attInfo, method: 'PUT'}).done(function(){
      console.log("Successfully sent data!");
      // showDateSelections();
      // $('.attendeeStatus').append()
    })



}

// list all timeslots
function getSchedules() {

     scheduleData = $.ajax({url: "/api/events/invite" , method: 'GET'});
  // if ($('.toggleRSVP').is(':hidden')){
        scheduleData.done(function(response) {
         console.log("the schedule is:  ", response);
          // console.log("weird: ", totalInfo);
          for (let i in response) {
            let scheduleTables = `<li id="time${i}">${response[i]}  <label class="switch"><input class="switchToggle" type="checkbox" id="box${i}">
            <span class="sliderRound" data-on="Yes" data-off="off"></span></label></li>`;
            $('#attendeeRSVP .scheduleList').append(scheduleTables);
          }
      });

}

//
// function showDateSelections(){
//   $('#attendeeRSVP .scheduleList').empty();
//   let theuuu = window.location.pathname;
//   let thePath = theuuu.slice(-6);
//   console.log("the pathname: ", thePath);
//   // let theDates = $.parseJSON(theScheduleData);
//   // console.log(theDates);
//   let availableDates = $.ajax({url: "/api/events/id" , method: 'PUT'});
//     availableDates.done(function(response) {
//       console.log("The available dates are: ",  response);
//       let theIndex = 0;
//       for (let i in response) {
//         let timeOptions = `<li><span class=time${theIndex}>${i} </span><input class=toggle type="checkbox"></li>`;
//         $('#attendeeRSVP .scheduleList').append(timeOptions);
//         theIndex++;
//       }
//     });
// }


$( document ).ready(function() {
  // $('.toggleRSVP').hide();
  $('.toggleEdit').hide();
  $('.eventSetup').hide();
  // $('#rsvp').on("click", getSchedules);
  getSchedules();
  $('#copyButton').on("click", copyUrl);
  loadTimeSlots();
  $('#addAttendee').on("click", addAttendeeInfo);
  // $('#rsvp').on("click", showDateSelections);

  console.log("got it!");
  const secretURL = getEventUrl();
  const urlAddress = {secretURL: secretURL};
  console.log("The URL is: ", urlAddress);
  // Should show host and event info on the page
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

})
