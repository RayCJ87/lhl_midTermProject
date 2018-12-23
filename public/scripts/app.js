

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
  }
  // console.log(event);
}

// generate an new Url
function getEventUrl(){
  console.log($('#eventURL').val());
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

//list all timeslots
function getSchedules() {
  let scheduleData = $.ajax({url: "/api/events/invite" , method: 'GET'});
  if ($('.toggleRSVP').is(':hidden')){
        scheduleData.done(function(response) {
         console.log("the schedule is:  ", response);
          // console.log("weird: ", totalInfo);
          for (let i in response) {
            let scheduleTables = `<li>${response[i]}  <label class="switch"><input class="switchToggle" type="checkbox">
            <span class="sliderRound" data-on="Yes" data-off="off"></span></label></li>`;
            $('#attendeeRSVP .scheduleList').append(scheduleTables);
          }
          getRSVPForm();
      });
  }
  else{
    alert("Please RSVP!");
  }
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
  $('.copyButton').on("click", copyUrl);
  loadTimeSlots();
  $('#addAttendee').on("click", addAttendeeInfo);
  console.log("got it!");
  const secretURL = getEventUrl();
  const urlAddress = {secretURL: secretURL};
  console.log("The URL is: ", urlAddress);
  $.ajax({url: "/api/events/create", data: urlAddress, method: 'PUT'}).done(function(){
      console.log("Success!");
    });

})

