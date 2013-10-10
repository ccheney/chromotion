/* ---------------------------------------------------------------------
Initialize Scripts
------------------------------------------------------------------------ */
var STATUS = STATUS || {};

(function($, APP){
    $(function() {
        var carousel = new APP.Carousel({
            carouselWrapperSelector: '.js-carousel',
            slideWrapperSelector: '.js-carouselWrapper',
            slideListSelector: '.js-carousel-list',
            navWrapperClass: 'carousel-nav',
            navItemClass: 'carousel-nav-item',
            navItemActiveClass: 'carousel-nav-item-is-active',
            buttonClass: 'js-carousel-btn',
            buttonPrevClass: 'js-carousel-btn-prev',
            buttonPrevActiveClass: 'carousel-btn-prev_isActive',
            buttonNextClass: 'js-carousel-btn-next',
            buttonNextActiveClass: 'carousel-btn-next_isActive',
            animationDuration: 300,
            swipeXThresholdModifier: 0.3
        });
    });
}(jQuery, STATUS));
