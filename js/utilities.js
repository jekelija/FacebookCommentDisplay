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
    recursiveGetComments(postDiv, '/' + comment.id + '/comments');
    return postDiv;
}

var recursiveGetComments = function(attachTo, url) {
    FB.api(
        url,
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
                    recursiveGetComments(commentsDiv, response.paging.next);
                }
            }
            else {
                ShowError(response.error);
            }
        }
    );
}

function ShowError(errMessage) {
    // instantiate new modal
    var modal = new tingle.modal();
    // set content
    modal.setContent('<h1 class="alert alert-danger">' + errMessage + '</h1>');
    modal.open();
}