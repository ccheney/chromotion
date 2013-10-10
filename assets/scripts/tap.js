/**
 * @fileOverview TapController View Module File
 *
 * @author Zach Walders
 * @version 1.0
 */
(function($) {
    'use strict';

    var $document = $(document);
    var contexts = [];
    var objects = [];

    $.event.special.tap = {
        add: function(options) {
            contexts.push(this);

            /**
             * options.selector is only provided if delegation is being used
             */
            objects.push(new TapController({
                element: this,
                selector: options.selector,
                callback: options.handler,
                isDelegate: (options.selector !== undefined && options.selector !== null)
            }));
        },
        remove: function() {
            var index = $.inArray(this, contexts);

            objects[index].destroy();

            contexts.splice(index, 1);

            objects.splice(index, 1);
        }
    };

    var TapController = function(options) {
        this.options = options;
        
        this.init();
    };

    /**
     * Initializes the UI Component View
     * Runs a single setupHandlers call, followed by createChildren and enable
     *
     * @returns {TapController}
     * @since 1.0
     */
    TapController.prototype.init = function() {
        this.isEnabled = false;
        this.isTouchMoving = false;
        this.isClickCancelled = false;

        return this
            .setupHandlers()
            .createChildren()
            .enable();
    };

    /**
     * Binds the scope of any handler functions
     * Should only be run on initialization of the view
     *
     * @returns {TapController}
     * @since 1.0
     */
    TapController.prototype.setupHandlers = function() {
        this.onTouchStartHandler = $.proxy(this.onTouchStart, this);
        this.onTouchMoveHandler = $.proxy(this.onTouchMove, this);
        this.onTouchEndHandler = $.proxy(this.onTouchEnd, this);
        this.onClickHandler = $.proxy(this.onClick, this);

        /**
         * the callback handler is bound to the dom element passed in from the jQuery special event
         * this is to ensure that people using the event can still reference 'this'
           in a similar way as default jQuery event handlers
         */
        this.callbackHandler = $.proxy(this.options.callback, this.options.element);

        return this;
    };

    /**
     * Create any child objects or references to DOM elements
     * Should only be run on initialization of the view
     *
     * @returns {TapController}
     * @since 1.0
     */
    TapController.prototype.createChildren = function() {
        this.$element = $(this.options.element);

        return this;
    };

    /**
     * Enables the view
     * Performs any event binding to handlers
     * Exits early if it is already enabled
     *
     * @returns {TapController}
     * @since 1.0
     */
    TapController.prototype.enable = function() {
        if (this.isEnabled) {
            return this;
        }

        this.isEnabled = true;

        /**
         * conditional for whether or not the bound event is a delegate
           so we can make sure the right event references are passed into each event handler
         */
        if (this.options.isDelegate) {
            $document.on('touchstart', this.options.selector, this.onTouchStartHandler);
            $document.on('touchmove', this.options.selector, this.onTouchMoveHandler);
            $document.on('touchend', this.options.selector, this.onTouchEndHandler);
            $document.on('click', this.options.selector, this.onClickHandler);

            return this;
        }

        this.$element.on('touchstart', this.onTouchStartHandler);
        this.$element.on('touchmove', this.onTouchMoveHandler);
        this.$element.on('touchend', this.onTouchEndHandler);
        this.$element.on('click', this.onClickHandler);

        return this;
    };

    /**
     * Disables the view
     * Tears down any event binding to handlers
     * Exits early if it is already disabled
     *
     * @returns {TapController}
     * @since 1.0
     */
    TapController.prototype.disable = function() {
        if (!this.isEnabled) {
            return this;
        }

        this.isEnabled = false;

        /**
         * conditional for whether or not the bound event is a delegate
           so we can make sure the right event references are passed into each event handler
         */
        if (this.options.isDelegate) {
            $document.off('touchstart', this.options.selector, this.onTouchStartHandler);
            $document.off('touchmove', this.options.selector, this.onTouchMoveHandler);
            $document.off('touchend', this.options.selector, this.onTouchEndHandler);
            $document.off('click', this.options.selector, this.onClickHandler);

            return this;
        }

        this.$element.off('touchstart', this.onTouchStartHandler);
        this.$element.off('touchmove', this.onTouchMoveHandler);
        this.$element.off('touchend', this.onTouchEndHandler);
        this.$element.off('click', this.onClickHandler);

        return this;
    };

    /**
     * Destroys the view
     * Tears down any events, handlers, elements
     * Should be called when the object should be left unused
     *
     * @returns {TapController}
     * @since 1.0
     */
    TapController.prototype.destroy = function() {
        var key;

        this.disable();

        for (key in this) {
            if (this.hasOwnProperty(key)) {
                this[key] = null;
            }
        }

        return this;
    };

    /**
     * onTouchStart Handler
     * Performs this action on touchstart
     *
     * @param {TouchEvent} touchstart event
     * @since 1.0
     */
    TapController.prototype.onTouchStart = function(e) {
        this.isTouchMoving = false;
    };

    /**
     * onTouchMove Handler
     * Performs this action on touchmove
     *
     * @param {TouchEvent} touchmove event
     * @since 1.0
     */
    TapController.prototype.onTouchMove = function(e) {
        this.isTouchMoving = true;
    };

    /**
     * onTouchEnd Handler
     * Performs this action on touchend
     *
     * @param {TouchEvent} touchend event
     * @since 1.0
     */
    TapController.prototype.onTouchEnd = function(e) {
        if (this.isTouchMoving) {
            return;
        }

        this.isClickCancelled = true;

        this.callbackHandler(e);
    };

    /**
     * onClick Handler
     * Performs this action on click
     *
     * @param {MouseEvent} click event
     * @since 1.0
     */
    TapController.prototype.onClick = function(e) {
        if (this.isClickCancelled) {
            this.isClickCancelled = false;

            return;
        }

        this.callbackHandler(e);
    };
}(jQuery));