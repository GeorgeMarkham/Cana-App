document.addEventListener('deviceready', deviceReady(), false);
//$().ready(deviceReady());

function deviceReady(){

    var push = PushNotification.init({
        android: {
        },
        browser: {
            pushServiceURL: 'http://push.api.phonegap.com/v1/push'
        },
        ios: {
            alert: "true",
            badge: "true",
            sound: "true"
        },
        windows: {}
    });
    console.log(push);
    push.on('registration', (data) => {
        // data.registrationId
        navigator.notification.alert(
            data.registrationId,
            ()=>{},
            "Registered!",
            "Okedoke"
        );
    });
    
    push.on('notification', (data) => {
        // data.message,
        // data.title,
        // data.count,
        // data.sound,
        // data.image,
        // data.additionalData
    });
    
    push.on('error', (e) => {
        // e.message
    });
   

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



    if(firebase.auth().currentUser){
        friends_ref = firebase.database().ref('users/');
        friends_ref.on('value', (snapshot)=>{
            console.log(snapshot.val());
        });
    }

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
        //e.preventDefault();
        var email_input = $('#login_email_input');
        var password_input = $('#login_password_input');
        console.log(email_input.val());
        console.log(password_input.val());
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
            navigator.notification.alert(
                "Something didn't go to plan, try again!",  // message
                ()=>{
                    //do nothing
                }, // callback
                "Error", // title
                'Done' // buttonName
            );
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
                                navigator.notification.alert(
                                    "Something's not quite right, try again in a minute!",  // message
                                    ()=>{
                                        //do nothing
                                    }, // callback
                                    "Error", // title
                                    'Done' // buttonName
                                );
                            });
                        });
                        }).catch((err)=>{
                            console.log(err);
                        })
                    } else {
                        navigator.notification.alert(
                            "That username is so good it's already been taken, try something different",  // message
                            ()=>{
                                //do nothing
                            }, // callback
                            "Error", // title
                            'Done' // buttonName
                        );
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
        var friends_ref = firebase.database().ref('users').orderByChild('username').limitToFirst(1).equalTo(search_term).once('value', (snapshot) => {
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
        var users_ref = firebase.database().ref('users');

        var add_friend_ref = users_ref.child(firebase.auth().currentUser.uid).child('friends').child(uid);
        add_friend_ref.set({
            uid: uid,
            username: username,
            accepted: false
        });
        firebase.database().ref('/users/' + firebase.auth().currentUser.uid).once('value').then(function(snapshot) {
            var add_friend_ref = users_ref.child(uid).child('friends').child(firebase.auth().currentUser.uid);
            add_friend_ref.set({
                username: snapshot.val().username,
                accepted: false
            });
        });
    });

    //Page Events

    $('#setup_page').on('pageshow', (e) => {
        var file_num = Math.floor(Math.random()*3);
        $('#profile_pic_input').css('background-image', 'url(../imgs/profile_pics/' + file_num + '.png)');
    });
    $('#home_page').on('pageshow', (e) => {

        var file_num = Math.floor(Math.random()*3);
        // $('#profile_btn').attr('src', './imgs/profile_pics/' + file_num + '.png')
        $('#profile_btn').css('background-image', 'url(./imgs/profile_pics/' + file_num + '.png)')

        //Grab the user object
        var user = firebase.auth().currentUser;
        
        /* This should never be false but just to make sure*/
        if(user){
            console.log(user.uid);
            friends_ref = firebase.database().ref('users/' +  user.uid).child('friends');
            friends_ref.once("value", (snapshot) => {
                console.log("hi");
                $('#friends_list_view').html('');
                snapshot.forEach((friend) => {
                    friend_name = friend.val().username;
                    friend_uid = friend.key;
                    console.log(friend.key + ": " + friend_name);
                    $('#friends_list_view').append("<span><i class='fa fa-user-circle-o fa-lg'></i></span><li data-name='" + friend_name + "' data-uid ='" + friend_uid + "' data-swiped='false' id='"+friend_name+"'>"+ friend_name + "</li>");
                });
            }, (err)=>{
                console.log(err);
            });
            //Set profile pic
            if(typeof(localStorage) != "undefined"){
                if(localStorage.getItem(user.uid+".profile_pic")){
                    $('#profile_btn').css('background-image', 'url(data:image/png;base64,' + localStorage.getItem(user.uid+'.profile_pic') + ')');
                    // document.getElementById('profile_pic').setAttribute(
                    //     'src', 'data:image/png;base64,' + localStorage.getItem(user.uid+".profile_pic")
                    // );
                } else {
                    var profile_pic_ref = storage.refFromURL(user.photoURL);
                    profile_pic_ref.getDownloadURL().then((url)=>{
                        /*document.getElementById('profile_pic').setAttribute(
                            'src', url
                        );*/
                        $('#profile_btn').css('background-image', 'url('+ url + ')');
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

$('#friends_list_view').on('vclick', 'li', (event) => {
    var friend_name = $('#' + event.target.id).attr('data-name');
    var friend_uid = $('#' + event.target.id).attr('data-uid');
    //Get current location
    navigator.geolocation.getCurrentPosition((location)=>{
        var location_str = location.coords.latitude + ";" + location.coords.longitude;
        var location_obj = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
        };
        //Success
        //Send a message to a user
        var locations_ref = firebase.database().ref().child('users').child(friend_uid).child('friends').child(firebase.auth().currentUser.uid).child('location');
        locations_ref.set(location_obj, (error) => {
            if (error) {
                navigator.notification.alert(
                    "We couldn't send your location, sorry!",  // message
                    ()=>{
                        //do nothing
                    }, // callback
                    "Error", // title
                    'Done' // buttonName
                );
                console.log(error);
            } else {
            navigator.notification.alert(
                "Sent your location to " + friend_name,  // message
                ()=>{
                    //do nothing
                }, // callback
                "Location Sent!", // title
                'Done' // buttonName
            );
            }
        });
        
    }, (err)=>{
        //error
        console.log(err);
    });
})

$('#profile_btn').on('vclick', (event)=>{
    // console.log("Profile pic click");
    // navigator.notification.alert(
    //     "I'll show you the settings page in a bit",
    //     ()=>{},
    //     "🥝",
    //     "Okedoke"
    // );
    $.mobile.changePage('#settings_page');
})

$('#back_btn').on('click', (event)=>{
    $.mobile.back();
});

$('#friends_list_view').on('swipeleft', 'li', (event) => {
    //var swiped = event.target.attributes[1].nodeValue;
    console.log("swiped left");
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
    console.log("swiped right");
    var swiped = $('#' + event.target.id).attr('data-swiped')
    if(swiped == 'true'){
       $('#' + event.target.id).css({transform: ""});
       var swiped = $('#' + event.target.id).attr('data-swiped', 'false')
    }
})

//Get Firebase Data
// if(firebase.auth().currentUser){
//     friends_ref = firebase.database().ref('users/' +  firebase.auth().currentUser.uid).child('friends');
//     // snapshot.forEach((friend) => {
//     //     console.log(friend.key + ": " + JSON.stringify(friend.val()));
//     // });
// }


//Listen for locations
// if(firebase.auth().currentUser){
//     friends_ref = firebase.database().ref('users/' +  firebase.auth().currentUser.uid).child('friends');
//     friends_ref.on('child_changed', (snapshot)=>{
//         console.log(snapshot.val());
//         navigator.notification.alert(
//             snapshot.val(),  // message
//             ()=>{
//                 //do nothing
//             }, // callback
//             "Location Recieved!", // title
//             'Done' // buttonName
//         );
//     })
// }

}


