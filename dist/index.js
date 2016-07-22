(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.ManagedHistory = factory());
}(this, function () { 'use strict';

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var _class = function () {
    function _class() {
      classCallCheck(this, _class);

      // props
      this.length = 0;
      this.current = null;
    }

    createClass(_class, [{
      key: "splice",
      value: function splice() {}
    }, {
      key: "push",
      value: function push() {}
    }, {
      key: "replace",
      value: function replace() {}
    }, {
      key: "reset",
      value: function reset() {}
    }, {
      key: "pop",
      value: function pop() {}
    }, {
      key: "go",
      value: function go() {}
    }, {
      key: "back",
      value: function back() {}
    }, {
      key: "forward",
      value: function forward() {}
    }, {
      key: "get",
      value: function get() {}
    }, {
      key: "setState",
      value: function setState() {}
    }]);
    return _class;
  }();

  return _class;

}));
//# sourceMappingURL=index.js.map
