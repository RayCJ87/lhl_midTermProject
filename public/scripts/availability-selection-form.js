 $(document).ready(function () {

  // RENDERS TIMESLOT CHOICES ON FORM
  //   function renderTimeslots(timeslots) {
  //     timeslots.forEach(function (timeslots) {
  //       let $timeslot = createTimeslotElement(timeslots);
  //       $('ul #attendeeRSVP').append($timeslot);
  //   });
  // }

  //CREATE STRUCTURE FOR TIMESLOT CHOICES
  function createTimeslotElement(timeslots) {
    let $listItem = $('<li></li>');
    let $checkbox = $('<input>').addType('checkbox');
    let $h4 = $('<h4></h4>');

    $listItem.append($checkbox);
    $checkbox.append($h4.text(timeslots.start_time + ' to ' + timeslots.end_time));

    return $listItem;
  }

  const $submitRSVP = $('.submitRSVP');

  //STOPS BUTTON ON NEW RSVP AND EDIT RSVP FORMS FROM REDIRECTING
  $submitRSVP.submit(function (event) {
    event.preventDefault();
  });

  //RENDERS LIST OF ATTENDEE RESPONSES ON PAGE
  function renderGuestList(guestList) {
    guestList.forEach(function (attendeeData) {
      let $attendee = createGuestList(attendeeData);
      $('#attendeeList').append($attendee);
    });
  }

  //CREATE STRUCTURE FOR GUEST LIST
  //need to figure out joins and make a variable to represent
  //attendee's availability choices?
  //also need a function to add every choice under attendee's name
  function createGuestList(attendeeData) {
    let $span = $('<span></span>').addClass('attendeeListItem');
    let $h4 = $('<h4></h4>');
    let $p = $('<p></p>').addClass('attendeeAvailability');
    let $ul = $('<ul></ul>');
    let $li = $('<li></li>');

    $span.append($h4.text(attendees.name));
    $h4.append($p.text('Availability:'));
    $p.append($ul);
    $ul.append($li);
    $li.append($('<p></p>').text(timeslots.start_time + ' to ' + timeslots.end_time));

    return $span;
  }

  //LOADS LIST OF ATTENDEES TO PAGE
  // '/rsvp' is just a filler value for now, not yet created
  function loadGuestList() {
    $.get('/rsvp', function (data) {
      $('#attendeeList').empty();
      renderGuestList(data);
    });
  }
  loadGuestList();

 });

<span class="attendeeListItem">
          <h4>John Smith (sample entry)</h4>
          <p class="attendeeAvailability">Availability:</p>
          <ul>
            <li>
              <p>Mon 12/04 from 1:00pm - 4:30pm</p>
            </li>
          </ul>
        </span>
        <span class="attendeeListItem">
          <h4>Adam Jones (sample entry)</h4>
          <p class="attendeeAvailability">Availability:</p>
          <ul>
            <li>
              <p>Mon 12/04 from 12:00pm - 3:30pm</p>
            </li>
            <li>
              <p>Mon 12/04 from 1:00pm - 4:30pm</p>
            </li>
          </ul>
        </span>
