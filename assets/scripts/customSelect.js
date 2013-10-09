$(function(){
    $(".js-status-item").click(function () {
        $(".js-status").val($(this).children("label").attr("data-value"));
    });
});
