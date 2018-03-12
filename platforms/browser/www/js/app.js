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
                var db = window.sqlitePlugin.openDatabase({name:"user.db"});

                db.transaction((tx)=>{
                    /* 1. Drop users table if it exists*/
                    /* 2. Create users table if it doesn't exist */
                    /* 3. Insert token, username and friends list into database */
                    /* 4. Check and make sure data is stored correctly in the database */
                })
            }
        })
    })
}