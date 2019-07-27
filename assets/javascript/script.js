//Objective:
/*When users click "Friends" button on the main loaded web page, it should bring them to family-Friendly.html web page and automatically give them 3 social events options displayed on the web page
 *
 *
 */
$(document).ready(function() {
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
