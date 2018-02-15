document.addEventListener('deviceready', onDeviceReady(), false);


function alertCB(){
    //Do Nothing!
}


function onDeviceReady(){
    navigator.notification(
        "Device is now ready!",
        alertCB(),
        "Device Status",
        "Great!"
    )
}