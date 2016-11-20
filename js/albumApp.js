var albumNameToId = {};

$(document).ready(function() {
    //add blank option to albums to force change
    var option = $("<option>");
    option.appendTo($("#fb-albums"));

    
    $("#fb-albums").change(function(e) {
        var albumId = albumNameToId[$("#fb-albums").val()];
        processAlbum('/' + albumId + '/photos');
    }); 
});

var processPhoto = function(photo, url) {
    FB.api(
        url,
        function(response) {
            if (response && !response.error) {
                var soldDiv = $("#sold");
                var added = false;
                
                for(var i = 0; i < response.data.length; ++i) {
                    var comment = response.data[i];
                    if(comment.message.toLowerCase().includes('sold')) {
                        if(!added) {
                            var newDiv = $("<div>");
                            var addImg = $("<img>")
                            addImg.attr("src", photo.picture);
                            addImg.appendTo(newDiv);
                            newDiv.appendTo(soldDiv);
                            added = true;
                        }
                        else {
                            //TODO need to add all comments to photo
                        }
                    }
                }
                
                if(response.paging && response.paging.next) {
                    //TODO
                }
            }
            else {
                ShowError(response.error);
            }
        }
    );
}

//process an album and look for sold items
var processAlbum = function(url) {
    FB.api(
        url,
        {
            fields : "picture"
        },
        function(response) {
            if (response && !response.error) {
                for(var i = 0; i < response.data.length; ++i) {
                    processPhoto(response.data[i], '/' + response.data[i].id + '/comments');
                }
                
                if(response.paging && response.paging.next) {
                    //recurse for paging
                    processAlbum(response.paging.next);
                }
            }
            else {
                ShowError(response.error);
            }
        }
    );
}

//get albums function that we use to assist in pagination
var _getAlbums = function(url, firstRequest) {
    FB.api(
        url,
        function (response) {                
            if (response && !response.error) {
                //only want to deal w/ showing/hiding no albums on first page
                if(firstRequest) {
                    if(response.data.length == 0) {
                        //show the error about being no albums
                        $("#no-albums").removeClass("hidden");
                    }
                    else {
                        //hide the error about being no albums
                        $("#no-albums").addClass("hidden");
                    }
                }
                
                var selectObj = $("#fb-albums");

                //build a map so when a user chooses a stream, we know the id
                for(var i = 0; i < response.data.length; ++i) {
                    albumNameToId[response.data[i].name] = response.data[i].id;
                    var option = $("<option>").html(response.data[i].name);
                    option.appendTo(selectObj);
                }
                
                if(response.paging && response.paging.next) {
                    _getAlbums(response.paging.next, false /*not first request*/);
                }
            }
            else {
                ShowError(response.error);
            }
        }
    );
}

// get all albums for a given user and populate the dropdown
var getAlbums = function(userID) {
    _getAlbums("/" + userID + "/albums", true/*first request*/);
}

var facebook = new FacebookController(getAlbums); 
function loginAlbums() {
    facebook.checkLoginState();
}