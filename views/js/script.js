$(document).ready(function () {
    $('#searchInput').on('keyup', function () {
        var thisValue = $(this).val().toLowerCase();

        $("#dataTable tbody tr").filter(function () {
            if (thisValue) {
                if ($(this).text().toLowerCase().indexOf(thisValue) > -1) {
                    if (!$(this).hasClass("highlight")) {
                        $(this).addClass("highlight");
                    }
                } else {
                    $(this).removeClass("highlight");
                }
            } else {
                $(this).removeClass("highlight");
            }
        });
    })
})