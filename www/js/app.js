document.addEventListener('deviceready', deviceReady(), false);


function alertCB(){
    //Do Nothing!
}

function deviceReady(){
    console.log("Device ready!");
    function alertDismissed() {
        // do something
    }
    
    navigator.notification.alert(
        'You are the winner!',  // message
        alertDismissed,         // callback
        'Game Over',            // title
        'Done'                  // buttonName
    );

    $("#loginBtn").on('click', (e)=>{
        function alertDismissed() {
            // do something
        }
        
        navigator.notification.alert(
            'You are the winner!',  // message
            alertDismissed,         // callback
            'Game Over',            // title
            'Done'                  // buttonName
        );
    });
}