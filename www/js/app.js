document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady(){
    if (window.navigator.offLine) {
        navigator.notification.alert(
            "Check your network connection and try again in a bit",
            ()=>{},
            "No Connection",
            "OK"
        );
    } else {
        setupPush();
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

        var friends_list = [];

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
                //Clear user data
                localStorage.clear();
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
            //Clear user data
            localStorage.clear();
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
            //Clear user data
            localStorage.clear();
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
            var user = firebase.auth().currentUser;
            navigator.camera.getPicture((imgData)=>{
                if(typeof(localStorage) != "undefined"){
                    localStorage.setItem(user.uid+".profile_pic", imgData);
                }
                $('#profile_pic_input').css('background-image', 'url(data:image/jpeg;base64,' + imgData + ')');
            }, (err)=>{
                console.log(err);
                navigator.notification.alert(
                    "Something didn't go to plan, try again!",  // message
                    ()=>{}, // callback
                    "Error", // title
                    'Done' // buttonName
                );
            }, { quality: 75, destinationType: Camera.DestinationType.DATA_URL, correctOrientation: 1});
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

        $('#logout_btn').on('vclick', (event)=>{
            firebase.auth().signOut().then(function() {
                navigator.notification.alert(
                    "We've signed you out, come back soon!",
                    ()=>{},
                    "Signed Out",
                    "Ok"
                );
                //Clear user data
                localStorage.clear();
              }, function(error) {
                    console.log(error);
                    navigator.notification.alert(
                        "We couldn't sign you out, try again soon",
                        ()=>{},
                        "Error",
                        "Ok"
                    );
              });
        });

        $("#search_page_btn").on('vclick', (event)=>{
            $.mobile.changePage('#search_page');
        })


        //Search for a user on keyboard input
        $('#user_search_input').on('keyup', (e)=>{
            $('#search_results').html('');
            var search_term =  $('#user_search_input').val().toLowerCase();
            $('#user_search_input').val(search_term);
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

        $('#settings_page').on('pageshow', (e) => {
            var file_num = Math.floor(Math.random()*3);
            $('#change_profile_pic_input').css('background-image', 'url(../imgs/profile_pics/' + file_num + '.png)');
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
                        $('#friends_list_view').append("<span id='" + friend_uid + "_btn' data-name='" + friend_name + "' data-uid ='" + friend_uid + "' class='fa fa-user-circle-o fa-lg'></span><li data-name='" + friend_name + "' data-uid ='" + friend_uid + "' data-swiped='false' id='"+friend_name+"'>"+ friend_name + "</li>");
                        friends_list.push(friend_uid);
                    });
                }, (err)=>{
                    console.log(err);
                });
                //Set profile pic
                if(typeof(localStorage) != "undefined"){
                    if(localStorage.getItem(user.uid+".profile_pic")){
                        $('#profile_btn').css('background-image', 'url(data:image/png;base64,' + localStorage.getItem(user.uid+'.profile_pic') + ')');
                    } else {
                        var profile_pic_ref = storage.refFromURL(user.photoURL);
                        profile_pic_ref.getDownloadURL().then((url)=>{
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
                    lat: location.coords.latitude,
                    lng: location.coords.longitude
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
            $.mobile.changePage('#settings_page', {transition:'slidedown'});
        })

        $('#friends_list_view').on('swipeleft', 'li', (event) => {
            console.log("swiped left");
            var swiped = $('#' + event.target.id).attr('data-swiped')
            $('*[data-swiped="true"]').css({transform: ""});
            $('*[data-swiped="true"]').attr('data-swiped', 'false')
            if(swiped == 'false'){
            $('#' + event.target.id).css({transform: "translateX(-75px)"});
            $('#' + event.target.id + '_span').css({zIndex: "1"});
            var swiped = $('#' + event.target.id).attr('data-swiped', 'true')
            }
        })
        $('#friends_list_view').on('swiperight', 'li', (event) => {
            console.log("swiped right");
            var swiped = $('#' + event.target.id).attr('data-swiped')
            if(swiped == 'true'){
                $('#' + event.target.id + '_span').css({zIndex: "-1"});
            $('#' + event.target.id).css({transform: ""});
            var swiped = $('#' + event.target.id).attr('data-swiped', 'false')
            }
        });

        $(document).on('vclick', (event)=>{
            //Because button is obscured this hack is necessary
            if(friends_list.indexOf(event.target.id.split('_')[0]) >= 0){
                var uid = event.target.id.split('_')[0];
                var name = $('#' + event.target.id).attr('data-name');
                console.log(name)
                localStorage.setItem("current_friend", JSON.stringify({uid: uid, name: name}));
                $.mobile.changePage('#friend_page');
            }
        })

        $('#friend_page').on('pageshow', (e) => {
            $('#map').css('opacity', '0.0');
            $('#unfriend_btn').attr('data-uid', friend_uid);
            $('#user_distance').html('');

            var friend = JSON.parse(localStorage.getItem("current_friend"));
            var friend_uid = friend.uid;
            var friend_name = friend.name;

            $('#user_distance').html('<h2>' + friend_name + " hasn't sent you their location yet</h2>");

            var user = firebase.auth().currentUser;
            //if(firebase.database().ref().child('users').child(user.uid).child('friends').child(friend_uid).hasChild('location')){
            var friend_ref = firebase.database().ref().child('users').child(user.uid).child('friends').child(friend_uid).child('location');
            friend_ref.once('value').then((snapshot) => {
                if(snapshot.val()){
                    $('#map').css('opacity', '1.0');
                    var friend_location = snapshot.val();
                    var map = new google.maps.Map(document.getElementById('map'), {
                        zoom: 15,
                        center: friend_location
                    });
                    var marker = new google.maps.Marker({
                        position: friend_location,
                        map: map
                    });
                    navigator.geolocation.getCurrentPosition((user_location)=>{
                        var location_obj = {
                            lat: user_location.coords.latitude,
                            lng: user_location.coords.longitude
                        };
                        var distance_from_user = distanceBetweenPoints(location_obj, friend_location);
                        $('#user_distance').html('<h2>You\'re ' + distance_from_user + 'm away from ' + friend_name + '</h2>')
                    });
                }
            });
            //}
        });


        $('div[data-pagetype="main"]').on('swiperight',(e)=>{
            $.mobile.back();
        });

        $('#account_delete_btn').on('vclick', (e)=>{
            var uid = firebase.auth().currentUser.uid;
            alert(uid);
            // firebase.auth().currentUser.delete().then(()=>{
            //     firebase.database().ref().child('users').child(uid).remove();
            // });
        });

        $('#unfriend_btn').on('vclick', (e)=>{
            var uid = firebase.auth().currentUser.uid;
            var friend_uid = $('#unfriend_btn').attr('data-uid');
            firebase.database().ref().child('users').child(uid).child('friends').child(friend_uid).remove();
            $.mobile.changePage('#home_page');
            // firebase.auth().currentUser.delete().then(()=>{
            //     firebase.database().ref().child('users').child(uid).remove();
            // });
        });
    }
}



//Setup push notifications
function setupPush() {
    var push = PushNotification.init({
        "android": {
            "senderID": "228293665430"
        },
        "browser": {
            pushServiceURL: 'http://push.api.phonegap.com/v1/push'
        },
        "ios": {
            "sound": true,
            "vibration": true,
            "badge": true
        },
        "windows": {}
    });

    push.on('registration', function(data) {
        console.log('registration event: ' + data.registrationId);
        alert('registration event: ' + data.registrationId);
        var oldRegId = localStorage.getItem('registrationId');
        if (oldRegId !== data.registrationId) {
            // Save new registration ID
            localStorage.setItem('registrationId', data.registrationId);
            // Post registrationId to your app server as the value has changed
        }
    });

    push.on('error', function(e) {
        console.log("push error = " + e.message);
    });

    push.on('notification', function(data) {
        console.log('notification event');
        navigator.notification.alert(
            data.message,         // message
            null,                 // callback
            data.title,           // title
            'Ok'                  // buttonName
        );
    });
    push.subscribe(
        'locations',
        () => {
          console.log('success');
        },
        err => {
          console.log('error:', err);
        }
    );
};

function distanceBetweenPoints(point_one, point_two){
    var earth_radius = 6371000;
    lat_one = toRadians(parseFloat(point_one.lat));
    lat_two = toRadians(point_two.lat);
    console.log(point_two);
    console.log(JSON.stringify(point_two));
    diff_lat = toRadians(parseFloat(point_two.lat)-parseFloat(point_one.lat));
    diff_lng = toRadians(parseFloat(point_two.lng)-parseFloat(point_one.lng));

    var a = Math.sin(diff_lat/2) * Math.sin(diff_lat/2) + Math.cos(lat_one) * Math.cos(lat_two) * Math.sin(diff_lng/2) * Math.sin(diff_lng/2);
    var b = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return (earth_radius * b).toFixed(2);
}

function toRadians(num){
    return (num*Math.PI)/180;
}

function convertToBase64(img){
    var canvas = document.getElementById('convert_img');
    if(canvas.getContext){
        ctx = canvas.getContext('2d');
        var image = new Image();
        image.onload = function(){
            ctx.drawImage(image, 0, 0);
            //ctx.fillStyle = "rgba(255,255,255,1.0)";
            //ctx.fillRect(0,0,500,500);
        };
        image.src = img;
    }
    return canvas.toDataURL("image/jpeg");
}