document.addEventListener('deviceready', deviceReady(), false);


function alertCB(){
    //Do Nothing!
}


function deviceReady(){
    console.log("Device ready!");
    navigator.notification.alert(
        "Device is now ready!",
        alertCB(),
        "Device Status",
        "Great!"
    );

    $("#loginBtn").on('click', (e)=>{
        navigator.notification.alert(
            "Login Button clicked!",
            alertCB(),
            "Login Button",
            "Great!"
        );
    });
    
}