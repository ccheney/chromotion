$(function(){
    $(".js-accordion").click(function () {
        $(".js-accordion-list").stop().toggle();
    });

    $(".js-status-item").click(function () {
        var value = $(this).children("label").attr("data-value");
        var innerValue = $(this).children("label").html();
        $(".js-status").val(value);
        $(".js-accordion-value").text(innerValue);
    });
});
