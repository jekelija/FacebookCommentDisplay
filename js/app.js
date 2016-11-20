var streamToId = {};
var CurrentStateController = null;

$(document).ready(function() {
    //add blank option to live stream to force change
    var option = $("<option>");
    option.appendTo($("#fb-live-streams"));

    
    $("#fb-live-streams").change(function(e) {
        var streamId = streamToId[$("#fb-live-streams").val()];
        if(CurrentStateController) {
            CurrentStateController.stopPolling();
        }
        CurrentStateController = new StateController(streamId);
    }); 
});

// If logged in, get all live streams
function statusChangeCallback(response) {
    if(response.status == 'connected') {
        FB.api(
            "/" + response.authResponse.userID,
            function (response) {
                if (response && !response.error) {
                    $("#fb-name").html("Welcome, " + response.name);
                }
                else {
                    console.error(response.error);
                }
            }
        );
        FB.api(
            "/" + response.authResponse.userID + "/live_videos",
            {
                broadcast_status : ["LIVE"], 
                fields : "description"
            },
            function (response) {                
                if (response && !response.error) {
                    if(response.data.length == 0) {
                        //show the error about being no streams
                        $("#no-stream").removeClass("hidden");
                    }
                    else {
                        //hide the error about being no streams
                        $("#no-stream").addClass("hidden");
                        
                        var selectObj = $("#fb-live-streams");
                        
                        //build a map so when a user chooses a stream, we know the id
                        for(var i = 0; i < response.data.length; ++i) {
                            streamToId[response.data[i].description] = response.data[i].id;
                            var option = $("<option>").html(response.data[i].description);
                            option.appendTo(selectObj);
                        }
                    }
                }
                else {
                    console.error(response.error);
                }
            }
        );
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
function checkLoginState() {
    FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
    });
}
