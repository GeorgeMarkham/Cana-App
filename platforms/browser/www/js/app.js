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
    $('#login_btn').on('vclick', (e)=>{
        e.preventDefault();
        var email_input = $('#login_email_input');
        var password_input = $('#login_password_input');

        firebase.auth().signInWithEmailAndPassword(email_input.val(), password_input.val()).catch((error) => {
            console.log(error.code + ": " + error.message);
        });
    });

    $('#send_to_signup_btn').on('vclick', (e)=>{
        e.preventDefault();
        $.mobile.changePage('#signup_page')
    });

    $('#signup_btn').on('vclick', (e)=>{
        e.preventDefault();
        var email_input = $('#signup_email_input');
        var password_input = $('#signup_password_input');

        firebase.auth().createUserWithEmailAndPassword(email_input.val(), password_input.val()).catch((error) => {
            console.log(error.code + ": " + error.message);
        });
    });

    $('#profile_pic_input').on('vclick', (e)=>{
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

    $('#account_setup_send_btn').on('vclick', (e)=>{
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


    $("#search_page_btn").on('vclick', (event)=>{
        $.mobile.changePage('#search_page');
    })


    //Search for a user on keyboard input
    $('#user_search_input').on('keyup', (e)=>{
        $('#search_results').html('');
        var search_term =  $('#user_search_input').val();
        friends_ref = firebase.database().ref('users').orderByChild('username').limitToFirst(1).equalTo(search_term).once('value', (snapshot) => {
            if(snapshot.val() != null){
                var user_obj = snapshot.toJSON()
                var uid = Object.keys(user_obj)[0]
                var username = user_obj[uid]['username']
                $('#search_results').html('');
                $('#search_results').append('<li>' + username + '</li>');
                $("#add_friend_btn").css("background-color", "#FF3B30");
                $("#add_friend_btn").attr('data-uid', uid);
                $("#add_friend_btn").attr('data-username', username);
            } else {
                $("#add_friend_btn").css("background-color", "lightgray")
            }
        });
    })
    
    $("#add_friend_btn").on('vclick', (event)=>{
        var uid = $("#add_friend_btn").attr('data-uid');
        var username = $("#add_friend_btn").attr('data-username');
    });

    //Page Events

    $('#setup_page').on('pageshow', (e) => {
        var file_num = Math.floor(Math.random()*3);
        $('#profile_pic_input').css('background-image', 'url(../imgs/profile_pics/' + file_num + '.png)');
    })
    $('#home_page').on('pageshow', (e) => {

        var file_num = Math.floor(Math.random()*3);
        $('#profile_pic').attr('src', './imgs/profile_pics/' + file_num + '.png')

        //Grab the user object
        var user = firebase.auth().currentUser;
        
        /* This should never be false but just to make sure*/
        if(user){
            console.log(user.uid);
            friends_ref = firebase.database().ref('users/' +  user.uid).child('friends');
            friends_ref.once("value", (snapshot) => {
                console.log("hi");
                snapshot.forEach((friend) => {
                    console.log(friend.key + ": " + friend.val().name);
                    friend_name = friend.val().name;
                    $('#friends_list_view').append("<span><i class='fa fa-user-circle-o'></i></span><li data-name='" + friend_name + "' data-swiped='false' id='"+friend_name+"'>"+ friend_name + "</li>");
                });
            }, (err)=>{
                console.log(err);
            });
            //Set profile pic
            if(typeof(localStorage) != "undefined"){
                if(localStorage.getItem(user.uid+".profile_pic")){
                    document.getElementById('profile_pic').setAttribute(
                        'src', 'data:image/png;base64,' + localStorage.getItem(user.uid+".profile_pic")
                    );
                } else {
                    var profile_pic_ref = storage.refFromURL(user.photoURL);
                    profile_pic_ref.getDownloadURL().then((url)=>{
                        /*document.getElementById('profile_pic').setAttribute(
                            'src', url
                        );*/
                        $('#profile_pic').attr('src', url)
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
        } else {
            $.mobile.changePage('#login_page');
        }
    });

}

$('#friends_list_view').on('click', 'li', (event) => {
    var friend_name = $('#' + event.target.id).attr('data-name');

    //Get current location
    navigator.geolocation.getCurrentPosition((location)=>{
        var location_str = location.coords.latitude + ";" + location.coords.longitude;
        var location_obj = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
        };
        //Success
        //Send a message to a user
        var locations_ref = firebase.database().ref().child('locations');
        navigator.notification.alert(
            location_str,  // message
            ()=>{
                //do nothing
            }, // callback
            friend_name, // title
            'Done' // buttonName
        );
    }, (err)=>{
        //error
        console.log(err);
    });
    //$.mobile.changePage("#friend_page", data : {''})
})

$('#friends_list_view').on('swipeleft', 'li', (event) => {
    //var swiped = event.target.attributes[1].nodeValue;
    var swiped = $('#' + event.target.id).attr('data-swiped')
    $('*[data-swiped="true"]').css({transform: ""});
    $('*[data-swiped="true"]').attr('data-swiped', 'false')
    if(swiped == 'false'){
       $('#' + event.target.id).css({transform: "translateX(-75px)"});
       var swiped = $('#' + event.target.id).attr('data-swiped', 'true')
    }
})
$('#friends_list_view').on('swiperight', 'li', (event) => {
    //var swiped = event.target.attributes[1].nodeValue;
    var swiped = $('#' + event.target.id).attr('data-swiped')
    if(swiped == 'true'){
       $('#' + event.target.id).css({transform: ""});
       var swiped = $('#' + event.target.id).attr('data-swiped', 'false')
    }
})

//Get Firebase Data
friends_ref = firebase.database().ref('users/' +  user.uid).child('friends');
snapshot.forEach((friend) => {
    console.log(friend.key + ": " + JSON.stringify(friend.val()));
});