

// $(() => {
//   $.ajax({
//     method: "GET",
//     url: "/api/events"
//   }).done((users) => {
//     for(user of users) {
//       $("<div>").text(user.name).appendTo($("body"));
//     }
//   });;
// });

//TOGGLE NEW RSVP FORM
function getRSVPForm() {
  $('.toggleRSVP').slideToggle(100);
  if ($('.toggleRSVP').is(':visible')){
    //get timeSlots.
  }
}

// function displayTimeSlots() {
//   let timeSlotLists = `
//             <li><p class="timeOfEvents">${}</p><label class="switch"><input type="checkbox"><span class="slider round"></span></label>
//             </li>`;

// }

// button to set multiple timeslots.
function loadTimeSlots(){
    console.log("loadTimeSlots");
    time = $('.eventSetup #getDate').val();
    let theText = `<p>${time}</p> <input type="hidden" value="${time}" name="eventTimes[]"/>`;
    $('.eventSetup .timeZone').append(theText);

}

function composeEvent(){
  $('.eventSetup').slideToggle(100)
}

function removeItem(element){
  console.log($(element).parent());
  console.log("it's :", $(element).closest("li").innerText);
  $(element).closest("li").remove();
  $(element).find("input[type='hidden']").remove();

  // $(element).closest("input:hidden").remove();
  // $('input[type="hidden"][value="guestNames[]"]').remove();
  // console.log("To delete: ", $('input[type="hidden"][value="guestNames[]"]'));
}

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
  }
  // console.log(event);
}

function getEventUrl(){
  console.log($('#eventURL').val());
  let ind = "http://localhost:8080/" + generateRandomString();
  $('#eventURL').val(ind);
  console.log($('#eventURL').val());
  $('#eventURL').select;
  document.execCommand("copy");
}

function copyUrl(){
  const theDoc = document.getElementById("eventURL");
  console.log(theDoc);
  theDoc.select();
  document.execCommand("copy");
}

function getSchedules() {
  $.ajax({ url: "/api/events/invite", method: 'GET' })
    .done(function() {
      console.log("the schedule is:  ", totalInfo.eventSchedules);
      console.log("weird: ", totalInfo);
      let scheduleTables = `<li>${totalInfo.eventSchedules}   <label class="switch"><input class="switchToggle">
       <span class="slider round"></span></label></li>`;
      $('#attendeeRSVP .scheduleList').append(scheduleTables);
    });
}


// function renderTimeSlots(time){
//   // for (let time of timeArray) {
//   //   let $time = createTimeElement(time);
//   //   $('.eventSetup .timeZone').append($time);
//   // }
//   let $time = createTimeSlots(time)
//   $('.eventSetup .timeZone').append($time);
//   console.log("try it:  ", $('.eventSetup .timeZone').val());
// }

// function createTimeSlots(time){
//   var $article = $('<p></p>').addClass('timeZone');
//   let $time = $($article).addClass('timeZone')
//   $article.append($time);
//   return $article;
// }



// function postTimeSlots() {
//   let $input = $('Button[type="button"]');
  // $input.on('click', function (event) {
//     event.preventDefault();
//     let newTime = $(".eventSetup #getDate");
//     $.ajax({url: "/", data: newTime, method: 'POST'}).then(function(newTime) {
//       console.log("We got a new time slot!!!")

//     })
//   })

// }




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


$( document ).ready(function() {
  $('.toggleRSVP').hide();
  $('.toggleEdit').hide();
  $('.eventSetup').hide();
  $('#rsvp').on("click", getSchedules);
  $('#rsvp').on("click", getRSVPForm);
  loadTimeSlots();
  $('#addAttendee').on("click", addAttendeeInfo);
  console.log("got it!");
  getEventUrl();
  $('.copyButton').on("click", copyUrl);

})
