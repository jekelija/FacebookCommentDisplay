var streamToId = {};
var CurrentStateController = null;

$(document).ready(function() {
    //add blank option to live stream to force change
    var option = $("<option>");
    option.appendTo($("#fb-live-streams"));

    
    $("#fb-live-streams").change(function(e) {
        $('#fb-live-streams').attr('disabled', true);
        var streamId = streamToId[$("#fb-live-streams").val()];
        if(CurrentStateController) {
            CurrentStateController.stopPolling();
        }
        CurrentStateController = new StateController(streamId, ShowError, EndCallback);
    }); 
});

var EndCallback = function() {
    $('#fb-live-streams').attr('disabled', false);
}

// get all live streams for a given user and populate the dropdown
var getLiveStreams = function(userID) {
    FB.api(
        "/" + userID + "/live_videos",
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
                        var desc = response.data[i].description;
                        if(!desc) {
                            desc = "Unnamed";
                        }
                        streamToId[desc] = response.data[i].id;
                        var option = $("<option>").html(desc);
                        option.appendTo(selectObj);
                    }
                }
            }
            else {
                ShowError(response.error);
                console.error(response.error);
            }
        }
    );
}

var facebook = new FacebookController(getLiveStreams); 
function loginLive() {
    facebook.checkLoginState();
}