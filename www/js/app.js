document.addEventListener('deviceready', onDeviceReady(), false);


function alertCB(){
    //Do Nothing!
}


function onDeviceReady(){
    navigator.notification.alert(
        "Device is now ready!",
        alertCB(),
        "Device Status",
        "Great!"
    )
}