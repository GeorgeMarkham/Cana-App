document.addEventListener('deviceready', onDeviceReady(), false);

function onDeviceReady(){
    navigator.notification(
        "Device is now ready!",
        alertCB(),
        "Device Status",
        "Great!"
    )
}