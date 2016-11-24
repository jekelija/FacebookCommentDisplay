/**
 * Constructor for facebook controller. Immediately attempts login after async initializing facebook
 */ 
var FacebookController = function(loginCallback) {
    this.loginCallback = loginCallback;
    
    var that = this;
    
    window.fbAsyncInit = function() {
        FB.init({
            appId      : '221164891653854',
            cookie     : true,  // enable cookies to allow the server to access the session
            xfbml      : true,
            version    : 'v2.8'
        });

        //check status to start
        that.checkLoginState();
    };

    (function initializeFacebook(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement(s); js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk')
    );
}

// If logged in, get all live streams
FacebookController.prototype.statusChangeCallback = function(response) {
    if(response.status == 'connected') {
        FB.api(
            "/" + response.authResponse.userID,
            function (response) {
                if (response && !response.error) {
                    $("#fb-name").html("Welcome, " + response.name);
                }
                else {
                    ShowError(response.error);
                    console.error(response.error);
                }
            }
        );
        if(this.loginCallback) {
            this.loginCallback(response.authResponse.userID);
        }
    }
    else {
        $("#fb-name").html("Please log-in to use this app");
    }
}

// This function gets the state of the
// person visiting this page and can return one of three states to
// the callback you provide.  They can be:
//
// 1. Logged into your app ('connected')
// 2. Logged into Facebook, but not your app ('not_authorized')
// 3. Not logged into Facebook and can't tell if they are logged into
//    your app or not.
//
// These three cases are handled in the callback function.
FacebookController.prototype.checkLoginState = function() {
    var that = this;
    FB.getLoginStatus(function(response) {
        that.statusChangeCallback(response);
    });
}