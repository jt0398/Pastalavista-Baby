// Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyDGKkc8H1GnDvfgOCOkBkfYo5JlrcuHUCM",
    authDomain: "jtbootcamp.firebaseapp.com",
    databaseURL: "https://jtbootcamp.firebaseio.com",
    projectId: "jtbootcamp",
    storageBucket: "jtbootcamp.appspot.com",
    messagingSenderId: "381037064879",
    appId: "1:381037064879:web:6c80a374056d4f7d"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

//Create database object
var database = firebase.database();

/* 
    Get user's input
    Add train to Firebase database 
*/
$("#add-feeback-btn").on("click", function(event) {

    event.preventDefault();

    //Gets form object
    let form = $(".needs-validation")[0];

    //Prevent form from being submitted if there's a validation error
    if (form.checkValidity() === false) {
        form.classList.add("was-validated");
        return;
    }

    //Retrieve user input. Extra spaces are removed.
    let name = $("#name-input").val().trim();
    let email = $("#email-input").val().trim().toLowerCase();
    let comment = $("#comment-input").val().trim();
    let dateSubmitted = moment().format("YYYY-MM-DD").toString();
    let rating = $(".rating").val();

    //Add user input to the Firebase database
    database.ref("/pastalavista").push({
        name,
        email,
        rating,
        comment,
        dateSubmitted
    });

    form.classList.remove("was-validated");

    form.reset();
});

//Display All Submitted Train Schedule
database.ref("/pastalavista").on("child_added", function(snapshot) {
        let feedback = snapshot.val();

        let feedbackHTML = `<div class=""><p><strong>${feedback.name}</strong><br />
        
        <fieldset class="rating">
            <input type="radio" id="star5" name="rating-${snapshot.key}" value="5" disabled ${feedback.rating == 5 ? "checked" : ""} /><label class = "full" for="star5" title="Awesome - 5 stars" disabled></label>
            <input type="radio" id="star4half" name="rating-${snapshot.key}" value="4 and a half" disabled ${feedback.rating == 4.5 ? "checked" : ""} /><label class="half" for="star4half" title="Pretty good - 4.5 stars" disabled></label>
            <input type="radio" id="star4" name="rating-${snapshot.key}" value="4" disabled ${feedback.rating == 4 ? "checked" : ""} /><label class = "full" for="star4" title="Pretty good - 4 stars" disabled></label>
            <input type="radio" id="star3half" name="rating-${snapshot.key}" value="3 and a half" disabled ${feedback.rating == 3.5 ? "checked" : ""} /><label class="half" for="star3half" title="Meh - 3.5 stars" disabled></label>
            <input type="radio" id="star3" name="rating-${snapshot.key}" value="3" disabled ${feedback.rating == 3 ? "checked" : ""} /><label class = "full" for="star3" title="Meh - 3 stars" disabled></label>
            <input type="radio" id="star2half" name="rating-${snapshot.key}" value="2 and a half" disabled ${feedback.rating == 2.5 ? "checked" : ""} /><label class="half" for="star2half" title="Kinda bad - 2.5 stars" disabled></label>
            <input type="radio" id="star2" name="rating-${snapshot.key}" value="2" disabled ${feedback.rating == 2 ? "checked" : ""} /><label class = "full" for="star2" title="Kinda bad - 2 stars" disabled></label>
            <input type="radio" id="star1half" name="rating-${snapshot.key}" value="1 and a half" disabled ${feedback.rating == 1.5 ? "checked" : ""} /><label class="half" for="star1half" title="Meh - 1.5 stars" disabled></label>
            <input type="radio" id="star1" name="rating-${snapshot.key}" value="1" disabled ${feedback.rating == 1 ? "checked" : ""} /><label class = "full" for="star1" title="Sucks big time - 1 star" disabled></label>
            <input type="radio" id="starhalf" name="rating-${snapshot.key}" value="half" disabled ${feedback.rating == 0.5 ? "checked" : ""} /><label class="half" for="starhalf" title="Sucks big time - 0.5 stars" disabled></label>
        </fieldset>
        
        </p>
        <div class="clearfix">&nbsp;</div>
        <p>"${feedback.comment}"</p>
        <p class="text-muted small pb-5">Date submitted ${feedback.dateSubmitted}</p></div>`;

        $("#feedback-list").append(feedbackHTML);


    },
    function(errorObject) {
        console.log("Errors handled: " + errorObject.code);
    }, );


$(document).ready(function() {
    $(".type").on("click", function(event) {
        event.preventDefault();

        let type = $(this).attr("data-type");

        localStorage.setItem("type", type);

        window.location = "listfriendly.html";
    });
});