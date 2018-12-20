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

});
