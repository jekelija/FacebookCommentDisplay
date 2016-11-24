var groupNameToGroup = {};

$(document).ready(function() {
    //add blank option to albums to force change
    var option = $("<option>");
    option.appendTo($("#fb-groups"));

    
    $("#fb-groups").change(function(e) {
        //clear out old albums
        $("#fb-albums").empty();
        
        var group = groupNameToGroup[$("#fb-groups").val()];
        getAlbums('/' + group.id + '/albums');
    }); 
    
    $("#getAlbumBtn").on('click', function(e) {
        $("#all").empty();
        
        $('.checkbox input:checked').each(function() {
            processAlbum($(this).next().text(), '/' + $(this).attr('value') + '/photos');
        });    
    });
});

var recursiveGetComments = function(attachTo, commentId) {
    FB.api(
        '/' + commentId + '/comments',
        function(response) {
            if (response && !response.error) {
                for(var i = 0; i < response.data.length; ++i) {
                    var comment = response.data[i];
                    var commentDiv = addComment(comment);
                    commentDiv.appendTo(attachTo);
                    //recursively get replies to this reply and attach internal
                    //to this comment so that we get the margin stacking effect
                    recursiveGetComments(commentDiv, comment.id);
                }
                
                if(response.paging && response.paging.next) {
                    _processPhoto(commentsDiv, response.paging.next);
                }
            }
            else {
                ShowError(response.error);
            }
        }
    );
}

/**
 * Creates a jquery div containing the given comment
 * @param comment Facebook comments object
 * @return jquery div
 */
var addComment = function(comment) {
    var postDiv = $("<div>").addClass("comment-container");
    if(comment.message.toLowerCase().includes('sold')) {
        postDiv.addClass("highlighted");
    }
    var nameEl = $("<h4>").html(comment.from.name);
    nameEl.appendTo(postDiv);
    var commentEl = $("<p>").html(comment.message);
    commentEl.appendTo(postDiv);
    recursiveGetComments(postDiv, comment.id);
    return postDiv;
}

//recursive
var _processPhoto = function(commentsDiv, url) {
    FB.api(
        url, 
        function(response) {
            if (response && !response.error) {
                for(var i = 0; i < response.data.length; ++i) {
                    var comment = response.data[i];
                    addComment(comment).appendTo(commentsDiv);                    
                }
                
                if(response.paging && response.paging.next) {
                    _processPhoto(commentsDiv, response.paging.next);
                }
            }
            else {
                ShowError(response.error);
            }
        }
    );
}
    
var processPhoto = function(albumDiv, photo) {
    FB.api(
        '/' + photo.id + '/comments',
        function(response) {
            if (response && !response.error) {
                var commentsDiv = null;
                for(var i = 0; i < response.data.length; ++i) {
                    var comment = response.data[i];
                    if(!commentsDiv) {
                        var photoDiv = $("<div>").addClass("photo");
                        var addImg = $("<img>")
                        addImg.attr("src", photo.picture);
                        addImg.appendTo(photoDiv);

                        commentsDiv = $("<div>").addClass("album-photo-div");
                        commentsDiv.appendTo(photoDiv);
                        photoDiv.appendTo(albumDiv);
                    }
                    addComment(comment).appendTo(commentsDiv);
                }
                
                //we know commentsdiv will not be null b/c comments div gets created
                //if there are any comments... if there are no comments, then there would be no paging
                if(response.paging && response.paging.next) {
                    _processPhoto(commentsDiv, response.paging.next);
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
                    processPhoto(albumDiv, response.data[i]);
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