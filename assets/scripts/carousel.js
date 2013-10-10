/**
 * @fileOverview Carousel View Module File
 *
 * @author Zach Walders
 */
STATUS.Carousel = function($) {
    'use strict';

    var $window = $(window);

    /**
     * Determines current wrapper and creates carousels for each related wrapper found
     */
    var CarouselFactory = function(options) {
        this.options = options;

        if (!this.checkOptions()) {
            return;
        }

        this.buildCarousels();
    };

    /**
     * checks to see if options and dom elements exist
     * if options are missing, throws error
     * if dom elements exist, return true, if not return false
     */
    CarouselFactory.prototype.checkOptions = function() {
        var requiredOptions = [
            'carouselWrapperSelector',
            'slideWrapperSelector',
            'slideListSelector',
            'buttonClass',
            'buttonPrevClass',
            'buttonPrevActiveClass',
            'buttonNextClass',
            'buttonNextActiveClass',
            'animationDuration',
            'swipeXThresholdModifier'
        ];

        var requiredDomElements = [
            'carouselWrapperSelector',
            'slideWrapperSelector',
            'slideListSelector'
        ];

        var length = requiredOptions.length;
        var i = 0;

        for (; i < length; i++) {
            if (!this.options[requiredOptions[i]]) {
                throw new Error(requiredOptions[i] + ' not found in options');
            }
        }

        length = requiredDomElements.length;
        i = 0;

        for (; i < length; i++) {
            if (!$(this.options[requiredDomElements[i]]).length) {
                console.log(this.options[requiredDomElements[i]] + ' not found in the dom');

                return false;
            }
        }

        return true;
    };

    /**
     * Builds new carousels for each wrapper found
     */
    CarouselFactory.prototype.buildCarousels= function() {
        var $wrappers = $(this.options.carouselWrapperSelector);
        var length = $wrappers.length;
        var i = 0;

        this.carousels = [];

        for (; i < length; i++) {
            this.options.$wrapper = $wrappers.eq(i);

            this.carousels.push(new Carousel(this.options));
        }
    };

    /**
     * Initializes a single carousel
     */
    var Carousel = function(options) {
        this.options = options;

        this.init();
    };

    /**
     * Initializes the UI Component View
     * Runs a single setupHandlers call, followed by createChildren and layout
     */
    Carousel.prototype.init = function() {
        this.isUiEnabled = false;
        this.isResizable = false;
        this.hasWebkitTransforms = 'WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix();

        return this
            .setupHandlers()
            .createChildren()
            .renderNav()
            .enableUi()
            .enableResize();
    };

    /**
     * Binds the scope of any handler functions
     * Should only be run on initialization of the view
     */
    Carousel.prototype.setupHandlers = function() {
        this.onPrevHandler = $.proxy(this.onPrev, this);
        this.onNextHandler = $.proxy(this.onNext, this);
        this.onResizeHandler = $.proxy(this.onResize, this);
        this.onTouchWrapperStartHandler = $.proxy(this.onTouchWrapperStart, this);
        this.onTouchWrapperMoveHandler = $.proxy(this.onTouchWrapperMove, this);
        this.onTouchWrapperEndHandler = $.proxy(this.onTouchWrapperEnd, this);

        return this;
    };

    /**
     * Create any child objects or references to DOM elements
     * Should only be run on initialization of the view
     */
    Carousel.prototype.createChildren = function() {
        this.$wrapper = this.options.$wrapper;
        this.wrapperWidth = this.$wrapper.outerWidth();
        this.$slideWrapper = this.$wrapper.find(this.options.slideWrapperSelector);
        this.$slideList = this.$wrapper.find(this.options.slideListSelector);
        this.$slides = this.$slideList.children();
        this.$prevButton = null;
        this.$nextButton = null;
        this.totalSlides = 0;
        this.activeIndex = 0;
        this.animationDuration = this.options.animationDuration;
        this.isResizing = false;

        this.swipeXThreshold = Math.round(this.wrapperWidth * this.options.swipeXThresholdModifier);
        this.isDragging = false;
        this.dragDirection = null;
        this.isSwipeReady = false;
        this.isScrolling = false;
        this.touchStartX = 0;
        this.touchStartY = 0;

        return this;
    };

    /**
     * Enables the view
     * Performs any event binding to handlers
     * Exits early if it is already enabled
     */
    Carousel.prototype.enableUi = function() {
        if (this.isUiEnabled) {
            return this;
        }

        this.isUiEnabled = true;

        this.$slideList.on('touchstart', this.onTouchWrapperStartHandler);
        this.$slideList.on('touchmove', this.onTouchWrapperMoveHandler);
        this.$slideList.on('touchend', this.onTouchWrapperEndHandler);
        this.$prevButton.on('tap', this.onPrevHandler);
        this.$nextButton.on('tap', this.onNextHandler);

        return this;
    };

    /**
     * Disables the view
     * Tears down any event binding to handlers
     * Exits early if it is already disabled
     */
    Carousel.prototype.disableUi = function() {
        if (!this.isUiEnabled) {
            return this;
        }

        this.isUiEnabled = false;

        this.$slideList.off('touchstart', this.onTouchWrapperStartHandler);
        this.$slideList.off('touchmove', this.onTouchWrapperMoveHandler);
        this.$slideList.off('touchend', this.onTouchWrapperEndHandler);
        this.$prevButton.off('tap', this.onPrevHandler);
        this.$nextButton.off('tap', this.onNextHandler);

        return this;
    };

    /**
     * Enables the windwow resize event
     */
    Carousel.prototype.enableResize = function() {
        if (this.isResizable) {
            return this;
        }

        this.isResizable = true;

        $window.on('resize', this.onResizeHandler);

        return this;
    };

    /**
     * Disable the windwow resize event
     */
    Carousel.prototype.disableResize = function() {
        if (!this.isResizable) {
            return this;
        }

        this.isResizable = false;

        $window.off('resize', this.onResizeHandler);

        return this;
    };

    /**
     * onPrev Handler
     * handles using the previous button to jump to the previous slide 
     */
    Carousel.prototype.onPrev = function(e) {
        e.preventDefault()

        this.prev();
    };

    /**
     * prev
     * jumps to the previous slide
     */
    Carousel.prototype.prev = function() {
        var isAtStart = this.activeIndex === 0;

        if (isAtStart) {
            return false;
        }

        this.activeIndex -= 1;

        this.slide();
    };

    /**
     * onNext Handler
     * handles using the next button to jump to the next slide 
     */
    Carousel.prototype.onNext = function(e) {
        e.preventDefault();

        this.next();
    };

    /**
     * next
     * jumps to the mext slide
     */
    Carousel.prototype.next = function(e) {
        var isAtEnd = this.activeIndex === (this.totalSlides - 1);

        if (isAtEnd) {
            return false;
        }

        this.activeIndex += 1;

        this.slide();
    };

    /**
     * onTouchWrapperStart Handler
     * Performs this action on touchstart of the slide wrapper
     */
    Carousel.prototype.onTouchWrapperStart = function(e) {
        this.touchStartX = e.originalEvent.touches[0].screenX;
        this.touchStartY = e.originalEvent.touches[0].screenY;
        this.dragDirection = null;
        this.isSwipeReady = false;
        this.isDragging = false;
        this.isScrolling = false;
    };

    /**
     * onTouchWrapperMove Handler
     * Performs this action on touchmove of the slide wrapper
     */
    Carousel.prototype.onTouchWrapperMove = function(e) {
        var touchCurrentX = e.originalEvent.touches[0].screenX;
        var touchCurrentY = e.originalEvent.touches[0].screenY;
        var touchXDistance =  this.touchStartX - touchCurrentX;
        var touchYDistance =  this.touchStartY - touchCurrentY;
        var isSwipeXThresholdMet = Math.abs(touchXDistance) > this.swipeXThreshold;
        var isHorizontalDrag = Math.abs(touchXDistance) > Math.abs(touchYDistance);
        this.dragDirection = touchXDistance > 0 ? 'left' : 'right';

        if (isHorizontalDrag) {
            e.preventDefault();
        } else {
            this.isScrolling = true;
        }

        if (this.isScrolling) {
            return;
        }

        this.drag(-touchXDistance);

        if (isSwipeXThresholdMet) {
            this.isSwipeReady = true;

            return;
        }

        this.isSwipeReady = false;
    };

    /**
     * onTouchWrapperEnd Handler
     * Performs this action on touchend of the slide wrapper
     */
    Carousel.prototype.onTouchWrapperEnd = function(e) {
        if (!this.isSwipeReady) {
            this.bounce();

            return false;
        }

        if (this.dragDirection === 'left') {
            this.next();

            return false;
        }

        if (this.dragDirection === 'right') {
            this.prev();

            return false;
        }

        return false;
    };

    /**
     * onResize Handler
     * Performs this action on window resize
     */
    Carousel.prototype.onResize = function(e) {
        var progressPercentage = (this.activeIndex / (this.totalSlides - 1));

        this.isResizing = true;

        this.animationDuration = 0;
        this.$slideList.css('-webkit-transition-duration', (0 + 'ms'));

        this
            .updateLayout(progressPercentage)
            .slide();
    };

    /**
     * Appends new nav elements to the dom and updates their references
     */
    Carousel.prototype.renderNav = function() {
        var visibleSlides = Math.round(this.$slideList.outerWidth() / this.$slides.eq(0).outerWidth());
        var i = 0;

        this.totalSlides = Math.round(this.$slides.length / visibleSlides);

        this.$prevButton = this.$wrapper.find('.' + this.options.buttonPrevClass);
        this.$nextButton = this.$wrapper.find('.' + this.options.buttonNextClass);

        return this.updateButtons();
    };

    /**
     * updateButtons
     * Hides or show prev and next buttons if you're at the beginning or end of the carousel
     */
    Carousel.prototype.updateButtons = function() {
        if (this.activeIndex === 0) {
            this.$prevButton.removeClass(this.options.buttonPrevActiveClass);
            this.$nextButton.addClass(this.options.buttonNextActiveClass);

            return this;
        }

        if (this.activeIndex === (this.totalSlides - 1)) {
            this.$prevButton.addClass(this.options.buttonPrevActiveClass);
            this.$nextButton.removeClass(this.options.buttonNextActiveClass);

            return this;
        }

        this.$prevButton.addClass(this.options.buttonPrevActiveClass);
        this.$nextButton.addClass(this.options.buttonNextActiveClass);

        return this;
    };

    /**
     * updateLayout
     * Carries out updates necessary after resize
     */
    Carousel.prototype.updateLayout = function(progressPercentage) {
        this.wrapperWidth = this.$wrapper.outerWidth();
        this.activeIndex = Math.round((this.totalSlides - 1) * progressPercentage);
        this.swipeXThreshold = Math.round(this.wrapperWidth * this.options.swipeXThresholdModifier);

        return this;
    };

    /**
     * drag
     * Sets up values for animating on drag and calls animate
     */
    Carousel.prototype.drag = function(dragDistance) {
        var animateValue;
        var isAtStartAndDragRight = this.activeIndex === 0 && this.dragDirection === 'right';
        var isAtEndAndDragLeft = this.activeIndex === (this.totalSlides - 1) && this.dragDirection === 'left';

        if (isAtStartAndDragRight || isAtEndAndDragLeft) {
            return;
        }

        this.isDragging = true;
        animateValue = (-(this.activeIndex * this.wrapperWidth) + dragDistance);

        this.animationDuration = 0;
        this.$slideList.css('-webkit-transition-duration', (0 + 'ms'));

        this.animate(animateValue);
    };

    /**
     * slide
     * Sets up values for animating when a slide changes and calls animate
     */
    Carousel.prototype.slide = function() {
        var animateValue = -(this.activeIndex * this.wrapperWidth);

        if (this.isResizing) {
            this.isResizing = false;
        } else {
            this.animationDuration = this.options.animationDuration;
            this.$slideList.css('-webkit-transition-duration', (this.animationDuration + 'ms'));
        }

        return this
            .animate(animateValue)
            .updateButtons();
    };

    /**
     * bounce
     * Animates the slides back to original position after drag if conditions for swipe aren't met
     */
    Carousel.prototype.bounce = function() {
        if (!this.isDragging) {
            return;
        }

        this.slide();
    };

    /**
     * animate
     * Animates the slides to the passed in animateValue
     */
    Carousel.prototype.animate = function(animateValue) {
        if (this.hasWebkitTransforms) {
            this.$slideList.css('-webkit-transform', 'translate3d(' + animateValue + 'px, 0, 0)');

            return this;
        }

        this.$slides.eq(0).stop().animate({
            'margin-left': (animateValue + 'px')
        }, this.animationDuration);

        return this;
    };

    /**
     * Destroys the view
     * Tears down any events, handlers, elements
     * Should be called when the object should be left unused
     */
    Carousel.prototype.destroy = function() {
        this
            .disableUi()
            .disableResize();

        return this;
    };

    return CarouselFactory;
}(jQuery);