function ShowError(errMessage) {
    // instantiate new modal
    var modal = new tingle.modal();
    // set content
    modal.setContent('<h1 class="alert alert-danger">' + errMessage + '</h1>');
    modal.open();
}