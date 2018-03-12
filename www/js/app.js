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
                var db = window.sqlitePlugin.openDatabase({name:"hereby.db"});

                db.transaction((transaction)=>{
                    /* 1. Drop users table if it exists*/
                    /* 2. Create users table if it doesn't exist */
                    /* 3. Insert token, username and friends list into database */
                    /* 4. Check and make sure data is stored correctly in the database */
                    var isErr = false;
                    transaction.executeSql("CREATE TABLE IF NOT EXISTS users (id integer primary key, token text, friends text)", [], (tx, res)=>{
                        console.log(tx);
                        console.log(res);
                    }, 
                    (err)=>{
                        isErr = true;
                        console.error(err);
                    });
                    transaction.executeSql("INSERT INTO users (id, token, friends) VALUES (?,?,?)", [id, token, friends], (tx, res)=>{
                        console.log(tx);
                        console.log(res);
                    }, 
                    (err)=>{
                        isErr = true;
                        console.error(err);
                    });
                })
            }
        })
    })
}