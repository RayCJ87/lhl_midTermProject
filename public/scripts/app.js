$(document).ready(function () {

  // $(() => {
  //   $.ajax({
  //     method: "GET",
  //     url: "/api/users"
  //   }).done((users) => {
  //     for(user of users) {
  //       $("<div>").text(user.name).appendTo($("body"));
  //     }
  //   });;
  // });

//TOGGLE NEW RSVP FORM
  $('#rsvp').click(function () {
    let $newRSVP = $('.toggleRSVP');
    if ($newRSVP.is(':hidden')) {
      $newRSVP.slideDown();
      $('#nameNew').focus();
    } else {
      $newRSVP.slideUp();
    }
  });

  //TOGGLE EDIT RSVP FORM
  $('#rsvpEdit').click(function () {
    let $editRSVP = $('.toggleEdit');
    if ($editRSVP.is(':hidden')) {
      $editRSVP.slideDown();
      $('nameEdit').focus();
    } else {
      $editRSVP.slideUp();
    }
  });

//TOGGLE NEW RSVP FORM
  $('#rsvp').click(function () {
    let $newRSVP = $('.toggleRSVP');
    if ($newRSVP.is(':hidden')) {
      $newRSVP.slideDown();
      $('#nameNew').focus();
    } else {
      $newRSVP.slideUp();
    }
  });

  //TOGGLE EDIT RSVP FORM
  $('#rsvpEdit').click(function () {
    let $editRSVP = $('.toggleEdit');
    if ($editRSVP.is(':hidden')) {
      $editRSVP.slideDown();
      $('nameEdit').focus();
    } else {
      $editRSVP.slideUp();
    }
  });

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
  //$(this).parent().remove();
  $(element).closest("li").remove();
  $('input[type="hidden"][value="guestNames[]"]').remove();
  console.log("To delete: ", $('input[type="hidden"][value="guestNames[]"]'));
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
  $('.eventSetup').hide();
  loadTimeSlots();
  $('#addAttendee').on("click", addAttendeeInfo);
  console.log("got it!");
  getEventUrl();
  $('.copyButton').on("click", copyUrl);
})

