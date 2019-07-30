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
    let email = $("#email-input").val().trim();
    let comment = $("#comment-input").val().trim();
    //let rating = $("rating-input").rating._getStars();


    /*var pos, out;
    pos = $("rating-input")._getTouchPosition(e);
    out = $("rating-input").calculate(pos);

    console.log(out);*/

    //Add user input to the Firebase database
    database.ref("/pastalavista").push({
        name,
        email,
        comment
    });

    form.classList.remove("was-validated");

    form.reset();
});

//Display All Submitted Train Schedule
database.ref("/pastalavista").on("child_added", function(snapshot) {
        let feedback = snapshot.val();

        let feedbackHTML = `<p>${feedback.name}</p>
        <p>${feedback.comment}</p>`;

        $("#feedback-list").append(feedbackHTML);

    },
    function(errorObject) {
        console.log("Errors handled: " + errorObject.code);
    });