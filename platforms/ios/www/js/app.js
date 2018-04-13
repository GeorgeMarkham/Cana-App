document.addEventListener('deviceready', deviceReady(), false);


function deviceReady(){
    console.log("Device ready!");

    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyDAa7z8Jo_pWHKqPsFFSotxYcf_w9PiaNY",
        authDomain: "cana-app.firebaseapp.com",
        databaseURL: "https://cana-app.firebaseio.com",
        projectId: "cana-app",
        storageBucket: "cana-app.appspot.com",
        messagingSenderId: "228293665430"
    };
    firebase.initializeApp(config);

    //Observe user state
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          // Go to home page
          console.log(user)
        } else {
          // Go to login page
        }
      });

    $('#login_btn').on('click', (e)=>{
        e.preventDefault();
        var email_input = $('#login_email_input');
        var password_input = $('#login_password_input');
        
        var data = {
            email: email_input.val(),
            password: password_input.val()
        }

        firebase.auth().createUserWithEmailAndPassword(email_input.val(), password_input.val()).catch((error) => {
            console.log(error.code + ": " + error.message);
        });
    });


}