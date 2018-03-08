document.addEventListener('deviceready', deviceReady(), false);


function deviceReady(){
    console.log("Device ready!");

    $('#login_btn').on('click', (e)=>{
        e.preventDefault();
    })

    $('#signup_btn').on('click', (e)=>{
        e.preventDefault();

        var email_input = $('#signup_email_input');
        var password_input = $('#signup_password_input');
        
        var data = {
            email: email_input.val(),
            password: password_input.val()
        }

        $.post('http://localhost:8080/signup', data, (data, status)=>{
            if(status == 'success' && data.success == true){
                var token = data.token;
            }
            
        })
    })
}