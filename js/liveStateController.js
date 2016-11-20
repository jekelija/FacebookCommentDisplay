/**
 * State controller controls the state of the app for a single stream
 */
var StateController = function(streamId) {
    this.streamId = streamId;
    
    this.soldItems = [];
    
    this.lastComment = null;
    this.comments = [];
    
    var that = this;
    
    this.interval = setInterval(function(){ 
        FB.api(
            "/" + streamId + "/comments",
            {
                order : 'reverse_chronological'
            },
            function (response) {                
                if (response && !response.error) {
                    //we want to keep adding comments to the top
                    //as long as they have not already been added
                    if(response.data.length > 0) {
                        var i = 0;
                        var comment = response.data[i];
                        while(comment != that.lastComment 
                              && i < response.data.length)
                        {
                            var li = $("<li>").html(comment.message);
                            if(comment.message.includes('sold'))
                            {
                                li.appendTo($("sold-list"));
                            }
                            else 
                            {
                                li.appendTo($("comments-list"));
                            }
                            
                            //load up the next comment
                            ++i;
                            comment = response.data[i];
                        }
                            
                    }
                }
                else {
                    console.error(response.error);
                }
            }
        );
        
    }, 2000 /*2 seconds*/);
}

/**
 * Stops polling and cleans up a state controller
 */
StateController.prototype.stopPolling = function() {
    clearInterval(this.interval);
}