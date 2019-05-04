var storeLocations = [];
var loggedInState = false;

document.addEventListener('DOMContentLoaded', () => {

  console.log('IronGenerator JS imported successfully!');

}, false);
//---------------------------------------------------------------------------------------------------------
//-----------------------table define for add item hbs-----------------------------------------------------

$(document).ready(function () {
  var counter = 0;

  $("#addrow").on("click", function () {
      var newRow = $(`<tr class="row justify-content-center">`);
      var cols = "";

      cols += '<td class="col"><input type="date" class="form-control" name="buying_date" required/></td>';
      cols += '<td class="col"><input type="text" class="form-control" name="store_name"/></td>';
      cols += '<td class="col"><input type="text" class="form-control" name="product_name"/></td>';
      cols += '<td class="col"><input type="number" class="form-control" name="calorie" required/></td>';
      cols += '<td class="col"><input type="number" class="form-control" name="price" required/></td>';

      cols += '<td class="col"><input type="button" class="ibtnDel btn btn-md btn-danger "  value="Delete"></td>';
      newRow.append(cols);
      $("table.order-list").append(newRow);//--------------------add new row on button click
      counter++;
  });

  $("table.order-list").on("click", ".ibtnDel", function (event) {
      $(this).closest("tr").remove();       //----------------------remove row on delete button
      counter -= 1
  }); 

  //-----------------------------------------------------------------------------------------------------------------------
  //----------------------------------------calculating total price & calorie for dashboard statistic & chart---------------

  const buying_date = [...document.getElementsByName('buying_date')];
  const price = [...document.getElementsByName('item_price')];
  const calorie = [...document.getElementsByName('item_calorie')];
  const loggedInState = document.getElementById('loggedInState').value;

  if(loggedInState) {
    document.getElementById('dashboard-link').className = "nav-link";
    document.getElementById('logout-link').className = "nav-link";
    document.getElementById('login-link').className = "nav-link disabled";
    document.getElementById('chat-link').className = "nav-link";
  }

  var buying_date_array = [];
  var price_array = [];
  var calorie_array = [];

  for (i in buying_date) {
    buying_date_array.push(buying_date[i].innerText);
    price_array.push(price[i].innerText);
    calorie_array.push(calorie[i].innerText);
  }

/*  
function calculateRow(row) {
  var price = +row.find('input[name^="price"]').val();

}

function calculateGrandTotal() {
  var grandTotal = 0;
  $("table.order-list").find('input[name^="price"]').each(function () {
      grandTotal += +$(this).val();
  });
  $("#grandtotal").text(grandTotal.toFixed(2));
}
*/

//-------------------------------------------type of the chart defined for dashboard hbs--------------------------------
  let statsChart = new Chart(document.getElementById("myChart"), {
    type: 'line',
    data: {
      labels: buying_date_array,
      datasets: [{ 
          data: price_array,
          label: "Price",
          borderColor: "#3e95cd",
          fill: false
        }, { 
          data: calorie_array,
          label: "Calorie",
          borderColor: "#8e5ea2",
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      title: {
        display: true,
        position: "top",
        text: "Fitness and Finance tracker",
        fontSize: 18,
        fontColor: "#111"
      },
      legend: {
        display: true,
        position: "bottom",
        labels: {
          fontColor: "#333",
          fontSize: 16
        }
      }
    }
  });

  statsChart.canvas.parentNode.style.height = '350px'; //size of the canvas defined
  statsChart.canvas.parentNode.style.width = '700px';

//------------------------------------------------Conversational chat form ---------------------------------------------


  var conversationalForm = window.cf.ConversationalForm.startTheConversation({
    formEl: document.getElementById("chatform"),
    context: document.getElementById("cf-context"),
    userImage: "https://gulpjs.com/img/gulp-white-text.svg",
    robotImage:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpFNTE3OEEyRTk5QTAxMUUyOUExNUJDMTA0NkE4OTA0RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpFNTE3OEEyRjk5QTAxMUUyOUExNUJDMTA0NkE4OTA0RCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkU1MTc4QTJDOTlBMDExRTI5QTE1QkMxMDQ2QTg5MDREIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkU1MTc4QTJEOTlBMDExRTI5QTE1QkMxMDQ2QTg5MDREIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+FYrpWAAABrNJREFUeNrkW2ls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",
    submitCallback: function() {
      alert(
        "Custom submit callback reached, removing Conversational Form, see markup of this file"
      );
    }
  });

  new cf.ConversationalForm({
    // HTMLFormElement
    formEl/*: HTMLFormElement;*/
  });
  

});

//-------------------- Document ready ended ------------------

//------------------------------------------------------------------------------------------------------------------
//-------------------------------------------------google map integration on dashboard page locating stores---------
var map;
var service;
var infowindow;
var storeLocations;

function initMap() {
 
  var amsterdam = new google.maps.LatLng(52.3727598, 4.8936041);
  var lastStoreLoc;

  infowindow = new google.maps.InfoWindow();

  map = new google.maps.Map(
      document.getElementById('mymap'), {center: amsterdam, zoom: 10});

  service = new google.maps.places.PlacesService(map);
  storeLocations = document.getElementById('storeLocs').value.split(",");

  for (j in storeLocations) {
    var request = {
      query: storeLocations[j],
      fields: ['name', 'geometry'],
    };

    service.findPlaceFromQuery(request, function(results, status) {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
          createMarker(results[i]);
          lastStoreLoc = results[i];
        }
      }
    });
  }
  map.setCenter(lastStoreLoc.geometry.location);
  //map.setCenter(amsterdam);
}

function createMarker(place) {
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location
  });

  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(place.name);
    infowindow.open(map, this);
  });
}
