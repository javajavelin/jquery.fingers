(function() {
  var $, calibrateDiff, extractTouchData, gestureDetected, thresholds, touchEndHandler, touchMoveHandler, touchStartHandler, touch_data, triggerEvents;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  $ = jQuery;
  thresholds = {
    distance: {
      scroll: 3,
      held: 3
    },
    time: {
      held: 300
    }
  };
  touch_data = {};
  touch_data.start = {};
  touch_data.last = {};
  touch_data.gestures = {};
  touch_data.gesture_detected = {};
  $.event.special.pullup = {};
  $.event.special.pulldown = {};
  $.event.special.pullright = {};
  $.event.special.pullleft = {};
  $.event.special.held = {};
  $.event.special.tapped = {};
  $(document).ready(function() {
    $(document).bind('touchstart.fingers', touchStartHandler);
    $(document).bind('touchmove.fingers', touchMoveHandler);
    return $(document).bind('touchend.fingers', touchEndHandler);
  });
  touchStartHandler = function(event) {
    touch_data.start = extractTouchData(event);
    touch_data.last = Object.create(touch_data.start);
    touch_data.gesture_detected = null;
    touch_data.gestures = {};
    touch_data.absolute_dx = 0;
    touch_data.absolute_dy = 0;
    touch_data.document_vertical_scrolling = false;
    touch_data.document_horizontal_scrolling = false;
    touch_data.dx = 0;
    touch_data.dy = 0;
    delay(thresholds.time.held, __bind(function() {
      var threshold;
      if (!touch_data.gesture_detected) {
        threshold = thresholds.distance.held;
        touch_data.gestures.held = touch_data.absolute_dx <= threshold && touch_data.absolute_dy <= threshold;
        gestureDetected();
      }
      if (touch_data.gestures.held) {
        return triggerEvents($(event.target));
      }
    }, this));
    return true;
  };
  touchMoveHandler = function(event) {
    var threshold;
    touch_data.last = extractTouchData(event);
    touch_data.absolute_dx = touch_data.last.x - touch_data.start.x;
    touch_data.absolute_dy = touch_data.last.y - touch_data.start.y;
    if (Math.abs(touch_data.absolute_dy) > thresholds.distance.scroll) {
      touch_data.document_vertical_scrolling = true;
    }
    if (Math.abs(touch_data.absolute_dx) > thresholds.distance.scroll) {
      touch_data.document_horizontal_scrolling = true;
    }
    threshold = thresholds.distance.held;
    if (!touch_data.gesture_detected && (touch_data.absolute_dx > threshold || touch_data.absolute_dy > threshold)) {
      gestureDetected();
    }
    if (touch_data.gesture_detected) {
      touch_data.dx = calibrateDiff(touch_data.absolute_dx, 'x');
      touch_data.dy = calibrateDiff(touch_data.absolute_dy, 'y');
      if (touch_data.gestures.held === true) {
        touch_data.gestures.pullup = false;
        touch_data.gestures.pulldown = false;
        touch_data.gestures.pullright = false;
        touch_data.gestures.pullleft = false;
      } else {
        if (touch_data.dy === 0) {
          touch_data.gestures.pullup = false;
          touch_data.gestures.pulldown = false;
        } else if (touch_data.dy > 0) {
          touch_data.gestures.pulldown = true;
          touch_data.gestures.pullup = false;
        } else if (touch_data.dy < 0) {
          touch_data.gestures.pullup = true;
          touch_data.gestures.pulldown = false;
        }
        if (touch_data.dx === 0) {
          touch_data.gestures.pullright = false;
          touch_data.gestures.pullleft = false;
        } else if (touch_data.dx > 0) {
          touch_data.gestures.pullright = true;
          touch_data.gestures.pullleft = false;
        } else if (touch_data.dx < 0) {
          touch_data.gestures.pullleft = true;
          touch_data.gestures.pullright = false;
        }
        triggerEvents($(event.target));
      }
    }
    return true;
  };
  touchEndHandler = function(event) {
    var threshold;
    if (Object.keys(touch_data.gestures).length === 0) {
      threshold = thresholds.distance.held;
      if (touch_data.absolute_dx <= threshold && touch_data.absolute_dy <= threshold) {
        touch_data.gestures.tapped = true;
        gestureDetected();
        triggerEvents($(event.target));
      }
    }
    return true;
  };
  gestureDetected = function() {
    return touch_data.gesture_detected = Object.create(touch_data.last);
  };
  triggerEvents = function(element) {
    var gesture, gesture_list, _i, _len, _results;
    gesture_list = Object.keys(touch_data.gestures);
    _results = [];
    for (_i = 0, _len = gesture_list.length; _i < _len; _i++) {
      gesture = gesture_list[_i];
      _results.push(touch_data.gestures[gesture] ? (console.log("triggering event on element. gesture: " + gesture + ". element: "), console.log(element), element.trigger(gesture, touch_data)) : void 0);
    }
    return _results;
  };
  extractTouchData = function(event) {
    return {
      x: event.originalEvent.touches[0].pageX,
      y: event.originalEvent.touches[0].pageY,
      time: new Date()
    };
  };
  calibrateDiff = function(diff, diff_key) {
    var calibrated, zero_diff;
    zero_diff = touch_data.gesture_detected[diff_key] - touch_data.start[diff_key];
    calibrated = diff;
    if (diff > zero_diff) {
      calibrated -= zero_diff;
    } else if (diff < -zero_diff) {
      calibrated += zero_diff;
    } else {
      calibrated = 0;
    }
    return calibrated;
  };
  window.delay = function(ms, func) {
    return setTimeout(func, ms);
  };
}).call(this);