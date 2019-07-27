
//Objective:
/*When users click "Friends" button on the main loaded web page, it should bring them to family-Friendly.html web page and automatically give them 3 social events options displayed on the web page
 *
 *
 */

let corsUrl = 'https://cors-anywhere.herokuapp.com/';

$(document).ready(function() {
    let city = "Toronto,+Ontario";

    $("#restaurants").empty();
    getCityGeoLocation(city);
    getFamilySocialEvents();
});
function getFamilySocialEvents() {
  let APIsrc = `https://app.ticketmaster.com/discovery/v2/events?apikey=3Yd3T3a3nBNMGIoErStG8ijjzU0A77um&keyword=family&locale=*&city=toronto&countryCode=CA&includeFamily=yes`;

  //APIUrl = corsUrl + APIUrl;

  $.ajax({
    url: APIsrc
  }).then(function(response) {
    let res = response._embedded.events;
    console.log(res[0].sales.public, res[0].sales.presales, res[0].name);
    for (var i = 0; i < 3; i++) {
      let info = res[i].info ? res[i].info : "Not Available";
      let prSale = res[i].prSale ? res[i].prSale : "Not Available";
      let familySocialEvents = `
        <div class="col-sm-4">
                <div class="card container-fluid">
                    <img src="${res[i].images[0].url}" class="card-img-top">
                    <div class="card-body">
                        <p class="card-text">
                        <strong>Event:</strong> ${res[i].name}<br>
                        
                        <strong>Start Date:</strong> ${
                          res[i].dates.start.localDate
                        }<br>
                        <strong>Start Time:</strong> ${
                          res[i].dates.start.localTime
                        }<br>
                        <strong>Venue:</strong> ${
                          res[i]._embedded.venues[0].address.line1
                        }, ${res[i]._embedded.venues[0].city.name},${
        res[i]._embedded.venues[0].postalCode
      }   <br>
                        <strong>Please Note:</strong> ${res[i].pleaseNote}<br>
                        <strong>Price Range(Minimum):</strong> ${
                          res[i].priceRanges[0].min
                        }<br>
                        <strong>Price Range(Maximum):</strong> ${
                          res[i].priceRanges[0].max
                        }<br>
                        <strong>Currency:</strong> ${
                          res[i].priceRanges[0].currency
                        }<br>
                        <strong>Special Note:</strong> ${info}<br>
                        
                        </p>
                        
                    </div>
                </div>
            </div>
        `;
      $("#socialEvents").append(familySocialEvents);
    }
  });
}


let apiKey = 'AIzaSyCjnZvvcW5Eoy-OCXMhN2vJZuanidwbOIU'


function getCityGeoLocation(city) {
    let APIUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${city}&key=${apiKey}`;

    let geoLocation;


    $.ajax({ url: APIUrl }).then(function(response) {

        let latitude = response.results[0].geometry.location.lat;
        let longitude = response.results[0].geometry.location.lng;


        geoLocation = latitude + "," + longitude;

        return response;

    }).then(function(response) {
        return getCityRestaurants(geoLocation);

    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.log(textStatus, errorThrown);
    });
}

function getCityRestaurants(geoLocation) {
    let APIUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${geoLocation}&type=restaurant&keyword=kids,family&key=${apiKey}&rankby=distance`;

    APIUrl = corsUrl + APIUrl;

    $.ajax({
            url: APIUrl
        }).then(function(response) {

            for (let i = 0; i < 3; i++) {

                let html = `
                <div class="col-12 col-md-4 mt-2">
                    <div class="card" data-placeid="${response.results[i].place_id}">
                        <img src="" class="card-img-top img-fluid">
                        <div class="card-body">
                            <h5 class="card-title">${response.results[i].name}</h5>
                            <p class="card-text">
                                <strong>Rating:</strong> ${response.results[i].rating} (${response.results[i].user_ratings_total} Reviews) <br>
                                <strong>Open:</strong> ${response.results[i].opening_hours.open_now ? "Yes" : "No"}
                            </p>
                            <button class="btn btn-success btn-sm addToMyList">Add to My List</button>
                        </div>
                    </div>
                </div>
            `;

                $("#restaurants").append(html);
            }

            return response;

        })
        .then(function(response) {
            getRestaurantDetails(response);
            getRestaurantPhoto(response);
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
        });
}

function getRestaurantDetails(response) {

    for (let i = 0; i < 3; i++) {

        let placeID = response.results[i].place_id;

        let APIUrl = `https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeID}&key=${apiKey}`;

        APIUrl = corsUrl + APIUrl;

        $.ajax({
                url: APIUrl
            })
            .then(function(response2) {

                let divRestaurant = $(`#restaurants div[data-placeid='${placeID}'] .card-text`);

                let html = `<strong>Address:</strong> ${response2.result.formatted_address}<br>
                        <strong>Phone:</strong> ${response2.result.formatted_phone_number}<br>
                `;

                divRestaurant.prepend(html);

            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            });

    }

}

function getRestaurantPhoto(response) {

    for (let i = 0; i < 3; i++) {

        let placeID = response.results[i].place_id;

        let photoRef = response.results[i].photos[0].photo_reference;

        let APIUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=6000&photoreference=${photoRef}&key=${apiKey}`;

        APIUrl = corsUrl + APIUrl;

        let imgUrl;

        $.ajax({
                url: APIUrl,
                contentType: "text/html;charset=utf-8",
                // dataType: "json",
                success: function(data, textStatus, request) {
                    imgUrl = request.getResponseHeader('x-final-url');
                },
            })
            .then(function(response2) {
                let divRestaurant = $(`#restaurants div[data-placeid='${placeID}']`);

                let imgRestaurant = $(`#restaurants div[data-placeid='${placeID}'] img`);

                imgRestaurant.attr("src", imgUrl);

                console.log(imgUrl);
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            });

    }

}

