// instantiate new modal
var modal = new tingle.modal();

function ShowError(errMessage) {
    // set content
    modal.setContent('<h1 class="alert alert-danger">' + errMessage + '</h1>');
    modal.open();
}