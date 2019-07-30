const FAMILY_TYPE = "family";
const FRIEND_TYPE = "friend";

//List of cities
var cities = ["Toronto, Canada", "London, England", "Paris, France", "New York, United States", "Barcelona, Spain"];

//Fix CORS error
let corsUrl = ""; //"https://cors-anywhere.herokuapp.com/";

$(document).ready(function() {
    //Update page title and link
    updateTitleLink();

    //Toronto is default city
    let city = "Toronto,Ontario";

    localStorage.setItem("city", city);

    getData(city);

    $(".type").on("click", function(event) {
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
        window.location = "index.html";
    }

    localStorage.setItem("type", type);

    if (type === FAMILY_TYPE) {
        $("#typeTitle").text("Family Friendly");
    } else {
        $("#typeTitle").text("Friend Friendly");
    }

    return type;
}

//Get restaurant and social event data
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

//Use Ticketmaster API to get social data
function getSocialEvents(city, keyword) {
    let APIsrc = `https://app.ticketmaster.com/discovery/v2/events?apikey=3Yd3T3a3nBNMGIoErStG8ijjzU0A77um&keyword=${keyword}&locale=*&city=${city}&includeFamily=yes`;

    APIsrc = corsUrl + APIsrc;

    $.ajax({
        url: APIsrc,
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
    }).then(function(response) {

        if (response.page.totalPages != 0) {
            let res = response._embedded.events;

            //Get the number of results
            let count = res.results.length;

            //If the result is more than 3, only take the first 3
            if (count > 3) {
                count = 3;
            }

            //Loop thru the result and display event detail 
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
            //No events found
            $("#socialEvents").append('<div class="col-sm-4">No events found.</div>');
        }

    });
}


let googleAPIKey = 'AIzaSyCjnZvvcW5Eoy-OCXMhN2vJZuanidwbOIU';

//Use Google Geocode to get city geo coordinates
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
            //Get list of restaurants in a city
            getCityRestaurants(geoLocation, keyword);

        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
        });
}

//Use Google Nearby API to get restaurants in a city
function getCityRestaurants(geoLocation, keyword) {

    let APIUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${geoLocation}&type=restaurant&keyword=${keyword}&key=${googleAPIKey}&rankby=distance`;

    APIUrl = corsUrl + APIUrl;

    $.ajax({
            url: APIUrl
        }).then(function(response) {

            if (response.results.length > 0) {

                //Get the number of results
                let count = response.results.length;

                //If the result is more than 3, only take the first 3
                if (count > 3) {
                    count = 3;
                }

                //Loop thru the result and display restaurant detail 
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
                //No restaurants are found in the city
                $("#restaurants").append('<div class="col-sm-4">No restaurants found.</div>');
            }

            return response;

        })
        .then(function(response) {
            if (response.results) {
                //Get more details about the restaurant
                getRestaurantDetails(response);
                //Get restaurant photo
                getRestaurantPhoto(response);
            }
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
        });
}

//Uses Google Place Detail API to get more restaurant details such as address and phone number
function getRestaurantDetails(response) {

    //Get the number of results
    let count = response.results.length;

    //If the result is more than 3, only take the first 3
    if (count > 3) {
        count = 3;
    }

    //Loop thru the result and display restaurant detail 
    for (let i = 0; i < count; i++) {

        //Unique restaurant ID
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

//Uses Google Place Photo to get restaurant picture
function getRestaurantPhoto(response) {

    for (let i = 0; i < 3; i++) {

        //Unique restaurant ID
        let placeID = response.results[i].place_id;

        //Get image element
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
                        //Google redirect to another page. Image URL can be found in the Response Header x-final-url
                        imgUrl = request.getResponseHeader('x-final-url');
                    },
                })
                .then(function(response2) {
                    //Sets image URL
                    imgRestaurant.attr("src", imgUrl);
                })
                .fail(function(jqXHR, textStatus, errorThrown) {
                    console.log(textStatus, errorThrown);
                });
        } else {
            //Sets a default image if Google doesn't provide any
            imgUrl = "assets/images/defaultRestaurant.jpg";

            imgRestaurant.attr("src", imgUrl);
        }



    }

}