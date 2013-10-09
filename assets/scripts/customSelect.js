$(function(){
    $(".js-accordion").click(function () {
        $(".js-accordion-list").toggle();
    });

    $(".js-status-item").click(function () {
    	var value = $(this).children("label").attr("data-value");
        $(".js-status").val(value);
        $(".js-accordion-value").text(value);
    });
});
