var groupNameToGroup = {};

$(document).ready(function() {
    //add blank option to albums to force change
    var option = $("<option>");
    option.appendTo($("#fb-groups"));

    
    $("#fb-groups").change(function(e) {
        var group = groupNameToGroup[$("#fb-groups").val()];
        getAlbums('/' + group.id + '/albums');
    }); 
    
    $("#getAlbumBtn").on('click', function(e) {
        $('.checkbox input:checked').each(function() {
            processAlbum($(this).next().text(), '/' + $(this).attr('value') + '/photos');
        });    
    });
});

var processPhoto = function(albumDiv, photo, url) {
    FB.api(
        url,
        function(response) {
            if (response && !response.error) {
                var added = false;
                
                var commentsDiv = null;
                for(var i = 0; i < response.data.length; ++i) {
                    var comment = response.data[i];
                    if(comment.message.toLowerCase().includes('sold')) {
                        if(!commentsDiv) {
                            var photoDiv = $("<div>").addClass("photo");
                            var addImg = $("<img>")
                            addImg.attr("src", photo.picture);
                            addImg.appendTo(photoDiv);
                            
                            commentsDiv = $("<div>");
                            commentsDiv.appendTo(photoDiv);
                            photoDiv.appendTo(albumDiv);
                        }
                        var name = $("<h4>").html(comment.from.name);
                        name.appendTo(commentsDiv);
                        var comment = $("<p>").html(comment.message);
                        comment.appendTo(commentsDiv);
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
var processAlbum = function(albumName, url) {
    FB.api(
        url,
        {
            fields : "picture",
            limit : 200 /*never have more than 200 pics in an album*/
        },
        function(response) {
            if (response && !response.error) {
                var albumDiv = $("<div>").addClass("album");
                var header = $("<h3>").html(albumName);
                header.appendTo(albumDiv);
                albumDiv.appendTo($("#all"));

                for(var i = 0; i < response.data.length; ++i) {
                    processPhoto(albumDiv, response.data[i], '/' + response.data[i].id + '/comments');
                }
                
                
                if(response.paging && response.paging.next) {
                    //recurse for paging
                    processAlbum(albumName, response.paging.next);
                }
            }
            else {
                ShowError(response.error);
            }
        }
    );
}

//get albums function that we use to assist in pagination
var getAlbums = function(url, firstRequest) {
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
                    var div = $("<div>").addClass("checkbox");
                    var input = $("<input>").attr("type", "checkbox").attr("value", response.data[i].id);
                    input.appendTo(div);
                    
                    var label = $("<label>").html(response.data[i].name);
                    label.appendTo(div);
                    div.appendTo(selectObj);
                }
                
                if(response.paging && response.paging.next) {
                    getAlbums(response.paging.next);
                }
            }
            else {
                ShowError(response.error);
            }
        }
    );
}

// get all albums for a given user and populate the dropdown
var getGroups = function(userID) {
    FB.api(
        "/" + userID + "/groups",
        function (response) {                
            if (response && !response.error) {
                //only want to deal w/ showing/hiding groups on first page
                if(response.data.length == 0) {
                    //show the error about being no albums
                    $("#no-groups").removeClass("hidden");
                }
                else {
                    //hide the error about being no albums
                    $("#no-groups").addClass("hidden");
                }
                
                var selectObj = $("#fb-groups");

                //build a map so when a user chooses a stream, we know the id
                for(var i = 0; i < response.data.length; ++i) {
                    groupNameToGroup[response.data[i].name] = response.data[i];
                    var option = $("<option>").html(response.data[i].name);
                    option.appendTo(selectObj);
                }
            }
            else {
                ShowError(response.error);
            }
        }
    );
}

var facebook = new FacebookController(getGroups); 
function loginAlbums() {
    facebook.checkLoginState();
}