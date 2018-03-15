document.addEventListener('deviceready', deviceReady(), false);


function deviceReady(){
    console.log("Device ready!");

    $('#login_btn').on('click', (e)=>{
        e.preventDefault();
        
        var email_input = $('#login_email_input');
        var password_input = $('#login_password_input');
        
        var data = {
            email: email_input.val(),
            password: password_input.val()
        }

        $.post('http://localhost:8080/login', data, (data, status)=>{
            console.log(status);
            console.log(data);

            var token = data.token;
            var secret = '7raputr5pU2rERudaCRASpUphUguPewR3uTrachaqaswEnapheZUPradRespedruspuchu8ruphayachuxa2Akacuzejezut3unAf5marE2usTewuDEgedeBrAg6dR2q';

            if(KJUR.jws.JWS.verifyJWT(token, secret, {alg: ['HS256']})){
                var headerObj = KJUR.jws.JWS.readSafeJSONString(b64utoutf8(token.split(".")[0]));
                var payloadObj = KJUR.jws.JWS.readSafeJSONString(b64utoutf8(token.split(".")[1]));

                console.log(headerObj);
                var id = payloadObj.id;
                var friends = payloadObj.friends;
                
                user = {
                    id: id,
                    friends: friends,
                    token: token
                }
                localStorage.setItem('user', JSON.stringify(user));

                if(localStorage.getItem('user') != null){
                    console.log(localStorage.getItem('user'));
                    //Go to home page
                    var home_page = $('#home_page');
                    $.mobile.changePage(home_page);
                } else {
                    console.log("Something bad happened!")
                }
            }
        })

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
                var secret = '7raputr5pU2rERudaCRASpUphUguPewR3uTrachaqaswEnapheZUPradRespedruspuchu8ruphayachuxa2Akacuzejezut3unAf5marE2usTewuDEgedeBrAg6dR2q';
                //var db = window.sqlitePlugin.openDatabase({name:"hereby.db", location: 2, createFromLocation: 1});
                
                if(KJUR.jws.JWS.verifyJWT(token, secret, {alg: ['HS256']})){
                    var headerObj = KJUR.jws.JWS.readSafeJSONString(b64utoutf8(token.split(".")[0]));
                    var payloadObj = KJUR.jws.JWS.readSafeJSONString(b64utoutf8(token.split(".")[1]));

                    console.log(headerObj);
                    var id = payloadObj.id;
                    var friends = payloadObj.friends;
                    
                    user = {
                        id: id,
                        friends: friends,
                        token: token
                    }
                    localStorage.setItem('user', JSON.stringify(user));

                    if(localStorage.getItem('user') != null){
                        console.log(localStorage.getItem('user'));
                        //Change to username set page
                        var edit_username_page = $('#edit_username_page');
                        $.mobile.changePage(edit_username_page);
                    } else {
                        console.log("Something bad happened!")
                    }
                }
            }
        })
    })

    $("#username_set_send_btn").on('click', (e)=>{
        var user = JSON.parse(localStorage.getItem('user'));
        var username = $('#username_input').val();
        var data = {
            username: username,
            token: user.token
        }
        $.post('http://localhost:8080/update-username', data, (data, status)=>{
            console.log(status);
            console.log(data);

            var token = data.token;
            var secret = '7raputr5pU2rERudaCRASpUphUguPewR3uTrachaqaswEnapheZUPradRespedruspuchu8ruphayachuxa2Akacuzejezut3unAf5marE2usTewuDEgedeBrAg6dR2q';

            if(KJUR.jws.JWS.verifyJWT(token, secret, {alg: ['HS256']})){
                var headerObj = KJUR.jws.JWS.readSafeJSONString(b64utoutf8(token.split(".")[0]));
                var payloadObj = KJUR.jws.JWS.readSafeJSONString(b64utoutf8(token.split(".")[1]));

                console.log(headerObj);
                var id = payloadObj.id;
                var friends = payloadObj.friends;

                user = {
                    id: id,
                    friends: friends,
                    token: token
                }
                localStorage.setItem('user', JSON.stringify(user));

                if(localStorage.getItem('user') != null){
                    console.log(localStorage.getItem('user'));
                    var home_page = $('#home_page');
                    $.mobile.changePage(home_page);
                    
                } else {
                    console.log("Something bad happened!")
                }
            }

        })
        .done(()=>{
            //Done
        })
        .fail(()=>{
            console.log("failed");
        })
    })
}



/* SQLITE STUFF */

// db.transaction((transaction)=>{
    //     alert("DB TRANSACTION");
    //     /* 1. Drop users table if it exists*/
    //     /* 2. Create users table if it doesn't exist */
    //     /* 3. Insert token, username and friends list into database */
    //     /* 4. Check and make sure data is stored correctly in the database */
    //     var isErr = false;
    //     transaction.executeSql("CREATE TABLE IF NOT EXISTS users (id integer primary key, token text, friends text)", [], (tx, res)=>{
    //         console.log(tx);
    //         console.log(res);
    //     }, 
    //     (err)=>{
    //         isErr = true;
    //         console.log(err);
    //     });
    //     if(!isErr){
    //         transaction.executeSql("INSERT INTO users (id, token, friends) VALUES (?,?,?)", [id, token, friends], (tx, res)=>{
    //             console.log(tx);
    //             console.log(res);
    //         }, 
    //         (err)=>{
    //             isErr = true;
    //             console.log(err);
    //         });
    //     }
    //     if(!isErr){
    //         transaction.executeSql("SELECT * FROM users", [], (tx, res)=>{
    //             console.log(tx);
    //             console.log(res);
    //             alert(res);
    //         }, 
    //         (err)=>{
    //             isErr = true;
    //             console.log(err);
    //         });
    //     }
    // })