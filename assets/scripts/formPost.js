$(function(){
	$(".confirm").hide();
    event.preventDefault();
    $( "#sendStatus" ).click(function() {
        var $form = $('#statusUpdate');
        var serializedData = $form.serialize();
        console.log(serializedData);
        $.ajax({
            url: "http://www.panthersweat.com/dash/updateStatus.php",
            type: "post",
            data: serializedData,
            success: function(){
                console.log("success");
                $(".confirm").addClass("bounceInDown").show(".confirm");
                setTimeout(function (){
					$(".confirm").addClass("bounceOutDown");
			 	}, 2000);
			 	$(".confirm").removeClass("bounceOutDown");
            },
            error:function(){
                console.log("failure");
            }
        });
    });
});
