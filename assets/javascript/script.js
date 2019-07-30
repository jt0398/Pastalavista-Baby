const FAMILY_TYPE = "family";
const FRIEND_TYPE = "friend";

//List of cities
var cities = ["Toronto, Canada", "London, England", "Paris, France", "New York, United States", "Barcelona, Spain"];

//cities = ["Toronto, Canada", "Bangkok, China", "London, England", "Paris, France", "Dubai, United Arab Emirates", "Singapore, ‎Singapore ", "New York, United States", "Kuala Lumpur, ‎Malaysia", "Tokyo, Japan", "Istanbul, ‎Turkey", "Seoul, Korea", "Antalya, ‎Turkey", "Phuket, Thailand", "Mecca, Saudi Arabia", "Hong Kong, China", "Milan, Italy", "Palma de Mallorca, Spain", "Barcelona, Spain", "Pattaya, Thailand", "Osaka, Japan", "Bali, Indonesian"];

//Fix CORS error
let corsUrl = "https://cors-anywhere.herokuapp.com/";

$(document).ready(function() {
    //Update page title and link
    updateTitleLink();

    let city = "Toronto,Ontario";

    localStorage.setItem("city", city);

    getData(city);

    $("#type").on("click", function(event) {
        event.preventDefault();

        localStorage.setItem("type", $(this).attr("data-type"));

        //Update page title and link
        updateTitleLink();

        let city = localStorage.getItem("city");

        getData(city);
    });

    //On load create the dropdown city list
    cities.forEach(function(city) {
        let html = `<a class="dropdown-item city" data-city="${city}">${city}</a>`;
        let menu = $(html);

        //Select Toronto by default
        if (city.indexOf("Toronto") >= 0) {
            menu.addClass("active");
        }

        $(".listCities").append(menu);
    })

    //When user selects a city
    $(".city").on("click", function() {
        //Unselect other cities
        $(this).siblings(".active").removeClass("active");

        //Make selected city active
        $(this).addClass("active");

        //Get the city text
        let city = $(this).text();

        //Update button text
        $(this).parent().siblings(".btn").text(city);

        city = city.replace(" ", "+");

        //Store user selection in local storage
        localStorage.setItem("city", city);

        //Get city data
        getData(city);
    });

});

//Update the page title and type link
function updateTitleLink() {
    let type = localStorage.getItem("type");

    if (type == undefined) {
        type = "family";
    }

    localStorage.setItem("type", type);

    if (type === FAMILY_TYPE) {
        $("#typeTitle").text("Family Friendly");
        $("#type").text("Friend Friendly");
        $("#type").attr("data-type", "friend");
    } else {
        $("#typeTitle").text("Friend Friendly");
        $("#type").text("Family Friendly");
        $("#type").attr("data-type", "family");
    }

    return type;
}

function getData(city) {
    let type = localStorage.getItem("type");

    let keyword;

    if (type === FRIEND_TYPE) {
        keyword = "friends";
    } else {
        keyword = "family";
    }

    $("#restaurants").empty();
    $("#socialEvents").empty();
    getCityGeoLocation(city, keyword);
    getSocialEvents(city, keyword);
}

//Get social data
function getSocialEvents(city, keyword) {
    let APIsrc = `https://app.ticketmaster.com/discovery/v2/events?apikey=3Yd3T3a3nBNMGIoErStG8ijjzU0A77um&keyword=${keyword}&locale=*&city=${city}&includeFamily=yes`;

    APIsrc = corsUrl + APIsrc;

    $.ajax({
        url: APIsrc,
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
    }).then(function(response) {

        if (response.page.totalPages != 0) {
            let res = response._embedded.events;

            let count = res.length;

            if (count > 3) {
                count = 3;
            }

            for (var i = 0; i < count; i++) {
                let info = res[i].info ? res[i].info : "Not Available";

                let familySocialEvents = `
                <div class="col-12 col-md-4 mt-2">
                    <div class="card">
                        <img src="${res[i].images[0].url}" class="card-img-top">
                        <div class="card-body">
                            <p class="card-text">
                            <strong>Event:</strong> ${res[i].name}<br>
                            
                            <strong>Start Date:</strong> ${
                                res[i].dates ? res[i].dates.start.localDate : "Not Available"
                            }<br>
                            <strong>Start Time:</strong> ${
                                res[i].dates ? res[i].dates.start.localTime : "Not Available"
                            }<br>
                            <strong>Venue:</strong> ${
                              res[i]._embedded.venues && res[i]._embedded.venues[0].address ? res[i]._embedded.venues[0].address.line1 : "Not Available"
                            }, ${ res[i]._embedded.venues && res[i]._embedded.venues[0].city ? res[i]._embedded.venues[0].city.name : ""},${
                                res[i]._embedded.venues && res[i]._embedded.venues[0].postalCode ? res[i]._embedded.venues[0].postalCode : ""
                            }   <br>
                            <strong>Please Note:</strong> ${res[i].pleaseNote ? res[i].pleaseNote : ""}<br>
                            <strong>Price Range(Minimum):</strong> ${
                                res[i].priceRanges ? res[i].priceRanges[0].min : "Not Available"
                            }<br>
                            <strong>Price Range(Maximum):</strong> ${
                                res[i].priceRanges ? res[i].priceRanges[0].max : "Not Available"
                            }<br>
                            <strong>Currency:</strong> ${
                                res[i].priceRanges ? res[i].priceRanges[0].currency : "Not Available"
                            }<br>
                            <strong>Special Note:</strong> ${info}<br>
                            
                            </p>
                            
                        </div>
                    </div>
                </div>
            `;

                $("#socialEvents").append(familySocialEvents);
            }
        } else {
            $("#socialEvents").append('<div class="col-sm-4">No events found.</div>');
        }

    });
}


let googleAPIKey = 'AIzaSyCjnZvvcW5Eoy-OCXMhN2vJZuanidwbOIU';


function getCityGeoLocation(city, keyword) {
    let APIUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${city}&key=${googleAPIKey}`;

    let geoLocation;


    $.ajax({ url: APIUrl })
        .then(function(response) {

            let latitude = response.results[0].geometry.location.lat;
            let longitude = response.results[0].geometry.location.lng;


            geoLocation = latitude + "," + longitude;

            return response;

        }).then(function(response) {
            getCityRestaurants(geoLocation, keyword);

        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
        });
}

function getCityRestaurants(geoLocation, keyword) {

    let APIUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${geoLocation}&type=restaurant&keyword=${keyword}&key=${googleAPIKey}&rankby=distance`;

    APIUrl = corsUrl + APIUrl;

    $.ajax({
            url: APIUrl
        }).then(function(response) {

            if (response.results.length > 0) {

                let count = response.results.length;

                if (count > 3) {
                    count = 3;
                }

                for (let i = 0; i < count; i++) {

                    let html = `
                    <div class="col-12 col-md-4 mt-2">
                        <div class="card" data-placeid="${response.results[i].place_id}">
                            <img src="" class="card-img-top" width="340.33" height="190.58">
                            <div class="card-body">
                                <h5 class="card-title">${response.results[i].name}</h5>
                                <p class="card-text">
                                    <strong>Rating:</strong> ${response.results[i].rating ? response.results[i].rating : "0"} (${response.results[i].user_ratings_total ? response.results[i].user_ratings_total : "0" } Reviews) <br>
                                    <strong>Open:</strong> ${response.results[i].opening_hours && response.results[i].opening_hours.open_now ? "Yes" : "No"}
                                </p>
                            </div>
                        </div>
                    </div>
                `;

                    $("#restaurants").append(html);
                }
            } else {
                $("#restaurants").append('<div class="col-sm-4">No restaurants found.</div>');
            }

            return response;

        })
        .then(function(response) {
            if (response.results) {
                getRestaurantDetails(response);
                getRestaurantPhoto(response);
            }
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
        });
}

function getRestaurantDetails(response) {

    let count = response.results.length;

    if (count > 3) {
        count = 3;
    }

    for (let i = 0; i < count; i++) {

        let placeID = response.results[i].place_id;

        let APIUrl = `https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeID}&key=${googleAPIKey}`;

        APIUrl = corsUrl + APIUrl;

        $.ajax({
                url: APIUrl
            })
            .then(function(response2) {

                let divRestaurant = $(`#restaurants div[data-placeid='${placeID}'] .card-text`);

                let html = `<strong>Address:</strong> ${response2.result.formatted_address ? response2.result.formatted_address : "Not Available"}<br>
                    <strong>Phone:</strong> ${response2.result.formatted_phone_number ? response2.result.formatted_phone_number : "Not Available"}<br>
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

        let divRestaurant = $(`#restaurants div[data-placeid='${placeID}']`);

        let imgRestaurant = $(`#restaurants div[data-placeid='${placeID}'] img`);

        if (response.results[i].photos) {
            let photoRef = response.results[i].photos[0].photo_reference;

            let APIUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=6000&photoreference=${photoRef}&key=${googleAPIKey}`;

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
                    imgRestaurant.attr("src", imgUrl);
                })
                .fail(function(jqXHR, textStatus, errorThrown) {
                    console.log(textStatus, errorThrown);
                });
        } else {
            imgUrl = "assets/images/defaultRestaurant.jpg";

            imgRestaurant.attr("src", imgUrl);
        }



    }

}