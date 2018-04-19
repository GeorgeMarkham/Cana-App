//document.addEventListener('deviceready', deviceReady(), false);
$().ready(deviceReady());

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
    
    var profile_pic_url = "";
    
    //Firebase storage references
    // Get a reference to the storage service, which is used to create references in your storage bucket
    var storage = firebase.storage();

    // Create a storage reference from our storage service
    var storageRef = storage.ref();

    var imagesRef = storageRef.child('images');

    //Observe user state
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // Go to home page if account is setup
            if(user.displayName){
                if(typeof(localStorage) != "undefined"){
                    localStorage.setItem(user.uid, JSON.stringify(user));
                    //console.log(localStorage.getItem(user.uid));
                }
                $.mobile.changePage('#home_page');
            } else {
                //Go to setup page if the account is not setup
                $.mobile.changePage('#setup_page');
            }
        } else {
            // Go to login page
            $.mobile.changePage('#login_page');
        }
    });
    
    //Get user data
    function getUserData(userId){
        firebase.database().ref('/users/' + userId).once('value').then((snapshot) => {
            return snapshot.val();
        });
    }

    //Buttons
    $('#login_btn').on('tap', (e)=>{
        e.preventDefault();
        var email_input = $('#login_email_input');
        var password_input = $('#login_password_input');

        firebase.auth().signInWithEmailAndPassword(email_input.val(), password_input.val()).catch((error) => {
            console.log(error.code + ": " + error.message);
        });
    });

    $('#send_to_signup_btn').on('tap', (e)=>{
        e.preventDefault();
        $.mobile.changePage('#signup_page')
    });

    $('#signup_btn').on('tap', (e)=>{
        e.preventDefault();
        var email_input = $('#signup_email_input');
        var password_input = $('#signup_password_input');

        firebase.auth().createUserWithEmailAndPassword(email_input.val(), password_input.val()).catch((error) => {
            console.log(error.code + ": " + error.message);
        });
    });

    $('#profile_pic_input').on('tap', (e)=>{
        e.preventDefault();
        navigator.camera.getPicture((imgData)=>{
            user = firebase.auth().currentUser;
            /*profileImgRef = imagesRef.child(''+user.uid).child('/profile_picture');
            profileImgRef.putString(imgData, 'base64').then((snapshot)=>{
                console.log(snapshot.downloadURL);
                if(typeof(localStorage) != "undefined"){
                    localStorage.setItem(user.uid+".photoURL", snapshot.downloadURL);
                }
            });*/
            if(typeof(localStorage) != "undefined"){
                localStorage.setItem(user.uid+".profile_pic", imgData);
            }
            $('#profile_pic_input').css('background-image', 'url(data:image/jpeg;base64,' + imgData + ')');
        }, (err)=>{
            console.log(err);
            alert("Something didn't go to plan, try again!");
        }, {
            sourceType: 0
        });
    });

    $('#account_setup_send_btn').on('tap', (e)=>{
        e.preventDefault();
        var user = firebase.auth().currentUser;
        if(user){
            if(typeof(localStorage) != "undefined"){
                
                var imgData = localStorage.getItem(user.uid+'.profile_pic');
                var username = $('#username_input').val();
                username = username.toLowerCase();
                firebase.database().ref("users").orderByChild("username").equalTo(username).once('value').then((snapshot)=>{
                    if(!snapshot.hasChildren()){
                        firebase.database().ref('users/' + user.uid).set({
                            username: username
                        }).then(()=>{
                            //All good carry on!
                            profileImgRef = imagesRef.child(''+user.uid).child('/profile_picture');
                            profileImgRef.putString(imgData, 'base64').then((snapshot)=>{
                            user.updateProfile({
                                displayName: username,
                                photoURL: snapshot.downloadURL
                            }).then(()=>{
                                console.log(user.displayName);
                                localStorage.setItem(user.uid, JSON.stringify(user));
                                $.mobile.changePage('#home_page');
                            }).catch((err)=>{
                                console.log(err);
                                alert("Somethings not quite right, try again in a minute!");
                            });
                        });
                        }).catch((err)=>{
                            console.log(err);
                        })
                    } else {
                        alert("That username is so good it's already been taken, try something different");
                    }
                    ret = true;
                }).catch((err)=>{
                    console.log(err);
                });
            }
        }
    });

    //Page Events

    $('#setup_page').on('pageshow', (e) => {
        var file_num = Math.floor(Math.random()*3);
        $('#profile_pic_input').css('background-image', 'url(../imgs/profile_pics/' + file_num + '.png)');
    })

    $('#home_page').on('pageshow', (e) => {
        //Grab the user object
        var user = firebase.auth().currentUser;
        
        /* This should never be false but just to make sure*/
        if(user){
            //Set profile pic
            if(typeof(localStorage) != "undefined"){
                if(localStorage.getItem(user.uid+".profile_pic")){
                    document.getElementById('profile_pic').setAttribute(
                        'src', 'data:image/png;base64,' + localStorage.getItem(user.uid+".profile_pic")
                    );
                } else {
                    var profile_pic_ref = storage.refFromURL(user.photoURL);
                    profile_pic_ref.getDownloadURL().then((url)=>{
                        document.getElementById('profile_pic').setAttribute(
                            'src', url
                        );
                        //Maybe get image as bas64 string and save to local storage to save constantly downloading the image?
                    }).catch((err)=>{
                        console.log(err);
                        var file_num = Math.floor(Math.random()*3);
                        document.getElementById('profile_pic').setAttribute(
                            'src', '../imgs/profile_pics/' + file_num + '.png'
                        );
                    });
                }
            }

            //Populate friends list from array
            var friends = ['Chandler', 'Joey', 'Pheobe', 'Monica', 'Rachel', 'Ross']; //Default friends for testing
            friends.forEach(friend => {
                $('#friends_list_view').append("<li><a>" + friend + "</a></li>");
            });

        } else {
            $.mobile.changePage('#login_page');
        }
    });

}

//Deal with friends list scroll
document.addEventListener('scroll', (event)=>{
    if(event.target.id == '#friends_list_view'){
        //Transition profile pic to be smaller (50px by 50px) and in the top left corner
        $('#profile_pic').animate({
            height:'50px',
            width:'50px'
        });
    }
})