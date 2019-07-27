let corsUrl = 'https://cors-anywhere.herokuapp.com/';

$(document).ready(function() {
    let city = "Toronto,+Ontario";

    $("#restaurants").empty();
    getCityGeoLocation(city);
});

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