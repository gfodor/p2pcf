var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/get-browser-rtc/index.js
var require_get_browser_rtc = __commonJS({
  "node_modules/get-browser-rtc/index.js"(exports, module) {
    module.exports = function getBrowserRTC2() {
      if (typeof globalThis === "undefined")
        return null;
      var wrtc = {
        RTCPeerConnection: globalThis.RTCPeerConnection || globalThis.mozRTCPeerConnection || globalThis.webkitRTCPeerConnection,
        RTCSessionDescription: globalThis.RTCSessionDescription || globalThis.mozRTCSessionDescription || globalThis.webkitRTCSessionDescription,
        RTCIceCandidate: globalThis.RTCIceCandidate || globalThis.mozRTCIceCandidate || globalThis.webkitRTCIceCandidate
      };
      if (!wrtc.RTCPeerConnection)
        return null;
      return wrtc;
    };
  }
});

// node_modules/events/events.js
var require_events = __commonJS({
  "node_modules/events/events.js"(exports, module) {
    "use strict";
    var R = typeof Reflect === "object" ? Reflect : null;
    var ReflectApply = R && typeof R.apply === "function" ? R.apply : function ReflectApply2(target, receiver, args) {
      return Function.prototype.apply.call(target, receiver, args);
    };
    var ReflectOwnKeys;
    if (R && typeof R.ownKeys === "function") {
      ReflectOwnKeys = R.ownKeys;
    } else if (Object.getOwnPropertySymbols) {
      ReflectOwnKeys = function ReflectOwnKeys2(target) {
        return Object.getOwnPropertyNames(target).concat(Object.getOwnPropertySymbols(target));
      };
    } else {
      ReflectOwnKeys = function ReflectOwnKeys2(target) {
        return Object.getOwnPropertyNames(target);
      };
    }
    function ProcessEmitWarning(warning) {
      if (console && console.warn)
        console.warn(warning);
    }
    var NumberIsNaN = Number.isNaN || function NumberIsNaN2(value) {
      return value !== value;
    };
    function EventEmitter2() {
      EventEmitter2.init.call(this);
    }
    module.exports = EventEmitter2;
    module.exports.once = once;
    EventEmitter2.EventEmitter = EventEmitter2;
    EventEmitter2.prototype._events = void 0;
    EventEmitter2.prototype._eventsCount = 0;
    EventEmitter2.prototype._maxListeners = void 0;
    var defaultMaxListeners = 10;
    function checkListener(listener) {
      if (typeof listener !== "function") {
        throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
      }
    }
    Object.defineProperty(EventEmitter2, "defaultMaxListeners", {
      enumerable: true,
      get: function() {
        return defaultMaxListeners;
      },
      set: function(arg) {
        if (typeof arg !== "number" || arg < 0 || NumberIsNaN(arg)) {
          throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + ".");
        }
        defaultMaxListeners = arg;
      }
    });
    EventEmitter2.init = function() {
      if (this._events === void 0 || this._events === Object.getPrototypeOf(this)._events) {
        this._events = /* @__PURE__ */ Object.create(null);
        this._eventsCount = 0;
      }
      this._maxListeners = this._maxListeners || void 0;
    };
    EventEmitter2.prototype.setMaxListeners = function setMaxListeners(n) {
      if (typeof n !== "number" || n < 0 || NumberIsNaN(n)) {
        throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + ".");
      }
      this._maxListeners = n;
      return this;
    };
    function _getMaxListeners(that) {
      if (that._maxListeners === void 0)
        return EventEmitter2.defaultMaxListeners;
      return that._maxListeners;
    }
    EventEmitter2.prototype.getMaxListeners = function getMaxListeners() {
      return _getMaxListeners(this);
    };
    EventEmitter2.prototype.emit = function emit(type) {
      var args = [];
      for (var i = 1; i < arguments.length; i++)
        args.push(arguments[i]);
      var doError = type === "error";
      var events = this._events;
      if (events !== void 0)
        doError = doError && events.error === void 0;
      else if (!doError)
        return false;
      if (doError) {
        var er;
        if (args.length > 0)
          er = args[0];
        if (er instanceof Error) {
          throw er;
        }
        var err = new Error("Unhandled error." + (er ? " (" + er.message + ")" : ""));
        err.context = er;
        throw err;
      }
      var handler = events[type];
      if (handler === void 0)
        return false;
      if (typeof handler === "function") {
        ReflectApply(handler, this, args);
      } else {
        var len = handler.length;
        var listeners = arrayClone(handler, len);
        for (var i = 0; i < len; ++i)
          ReflectApply(listeners[i], this, args);
      }
      return true;
    };
    function _addListener(target, type, listener, prepend) {
      var m;
      var events;
      var existing;
      checkListener(listener);
      events = target._events;
      if (events === void 0) {
        events = target._events = /* @__PURE__ */ Object.create(null);
        target._eventsCount = 0;
      } else {
        if (events.newListener !== void 0) {
          target.emit(
            "newListener",
            type,
            listener.listener ? listener.listener : listener
          );
          events = target._events;
        }
        existing = events[type];
      }
      if (existing === void 0) {
        existing = events[type] = listener;
        ++target._eventsCount;
      } else {
        if (typeof existing === "function") {
          existing = events[type] = prepend ? [listener, existing] : [existing, listener];
        } else if (prepend) {
          existing.unshift(listener);
        } else {
          existing.push(listener);
        }
        m = _getMaxListeners(target);
        if (m > 0 && existing.length > m && !existing.warned) {
          existing.warned = true;
          var w = new Error("Possible EventEmitter memory leak detected. " + existing.length + " " + String(type) + " listeners added. Use emitter.setMaxListeners() to increase limit");
          w.name = "MaxListenersExceededWarning";
          w.emitter = target;
          w.type = type;
          w.count = existing.length;
          ProcessEmitWarning(w);
        }
      }
      return target;
    }
    EventEmitter2.prototype.addListener = function addListener(type, listener) {
      return _addListener(this, type, listener, false);
    };
    EventEmitter2.prototype.on = EventEmitter2.prototype.addListener;
    EventEmitter2.prototype.prependListener = function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };
    function onceWrapper() {
      if (!this.fired) {
        this.target.removeListener(this.type, this.wrapFn);
        this.fired = true;
        if (arguments.length === 0)
          return this.listener.call(this.target);
        return this.listener.apply(this.target, arguments);
      }
    }
    function _onceWrap(target, type, listener) {
      var state = { fired: false, wrapFn: void 0, target, type, listener };
      var wrapped = onceWrapper.bind(state);
      wrapped.listener = listener;
      state.wrapFn = wrapped;
      return wrapped;
    }
    EventEmitter2.prototype.once = function once2(type, listener) {
      checkListener(listener);
      this.on(type, _onceWrap(this, type, listener));
      return this;
    };
    EventEmitter2.prototype.prependOnceListener = function prependOnceListener(type, listener) {
      checkListener(listener);
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };
    EventEmitter2.prototype.removeListener = function removeListener(type, listener) {
      var list, events, position, i, originalListener;
      checkListener(listener);
      events = this._events;
      if (events === void 0)
        return this;
      list = events[type];
      if (list === void 0)
        return this;
      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = /* @__PURE__ */ Object.create(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit("removeListener", type, list.listener || listener);
        }
      } else if (typeof list !== "function") {
        position = -1;
        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }
        if (position < 0)
          return this;
        if (position === 0)
          list.shift();
        else {
          spliceOne(list, position);
        }
        if (list.length === 1)
          events[type] = list[0];
        if (events.removeListener !== void 0)
          this.emit("removeListener", type, originalListener || listener);
      }
      return this;
    };
    EventEmitter2.prototype.off = EventEmitter2.prototype.removeListener;
    EventEmitter2.prototype.removeAllListeners = function removeAllListeners(type) {
      var listeners, events, i;
      events = this._events;
      if (events === void 0)
        return this;
      if (events.removeListener === void 0) {
        if (arguments.length === 0) {
          this._events = /* @__PURE__ */ Object.create(null);
          this._eventsCount = 0;
        } else if (events[type] !== void 0) {
          if (--this._eventsCount === 0)
            this._events = /* @__PURE__ */ Object.create(null);
          else
            delete events[type];
        }
        return this;
      }
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === "removeListener")
            continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners("removeListener");
        this._events = /* @__PURE__ */ Object.create(null);
        this._eventsCount = 0;
        return this;
      }
      listeners = events[type];
      if (typeof listeners === "function") {
        this.removeListener(type, listeners);
      } else if (listeners !== void 0) {
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }
      return this;
    };
    function _listeners(target, type, unwrap) {
      var events = target._events;
      if (events === void 0)
        return [];
      var evlistener = events[type];
      if (evlistener === void 0)
        return [];
      if (typeof evlistener === "function")
        return unwrap ? [evlistener.listener || evlistener] : [evlistener];
      return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
    }
    EventEmitter2.prototype.listeners = function listeners(type) {
      return _listeners(this, type, true);
    };
    EventEmitter2.prototype.rawListeners = function rawListeners(type) {
      return _listeners(this, type, false);
    };
    EventEmitter2.listenerCount = function(emitter, type) {
      if (typeof emitter.listenerCount === "function") {
        return emitter.listenerCount(type);
      } else {
        return listenerCount.call(emitter, type);
      }
    };
    EventEmitter2.prototype.listenerCount = listenerCount;
    function listenerCount(type) {
      var events = this._events;
      if (events !== void 0) {
        var evlistener = events[type];
        if (typeof evlistener === "function") {
          return 1;
        } else if (evlistener !== void 0) {
          return evlistener.length;
        }
      }
      return 0;
    }
    EventEmitter2.prototype.eventNames = function eventNames() {
      return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
    };
    function arrayClone(arr, n) {
      var copy = new Array(n);
      for (var i = 0; i < n; ++i)
        copy[i] = arr[i];
      return copy;
    }
    function spliceOne(list, index) {
      for (; index + 1 < list.length; index++)
        list[index] = list[index + 1];
      list.pop();
    }
    function unwrapListeners(arr) {
      var ret = new Array(arr.length);
      for (var i = 0; i < ret.length; ++i) {
        ret[i] = arr[i].listener || arr[i];
      }
      return ret;
    }
    function once(emitter, name) {
      return new Promise(function(resolve, reject) {
        function errorListener(err) {
          emitter.removeListener(name, resolver);
          reject(err);
        }
        function resolver() {
          if (typeof emitter.removeListener === "function") {
            emitter.removeListener("error", errorListener);
          }
          resolve([].slice.call(arguments));
        }
        ;
        eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
        if (name !== "error") {
          addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
        }
      });
    }
    function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
      if (typeof emitter.on === "function") {
        eventTargetAgnosticAddListener(emitter, "error", handler, flags);
      }
    }
    function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
      if (typeof emitter.on === "function") {
        if (flags.once) {
          emitter.once(name, listener);
        } else {
          emitter.on(name, listener);
        }
      } else if (typeof emitter.addEventListener === "function") {
        emitter.addEventListener(name, function wrapListener(arg) {
          if (flags.once) {
            emitter.removeEventListener(name, wrapListener);
          }
          listener(arg);
        });
      } else {
        throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
      }
    }
  }
});

// node_modules/ms/index.js
var require_ms = __commonJS({
  "node_modules/ms/index.js"(exports, module) {
    var s = 1e3;
    var m = s * 60;
    var h = m * 60;
    var d = h * 24;
    var w = d * 7;
    var y = d * 365.25;
    module.exports = function(val, options) {
      options = options || {};
      var type = typeof val;
      if (type === "string" && val.length > 0) {
        return parse(val);
      } else if (type === "number" && isFinite(val)) {
        return options.long ? fmtLong(val) : fmtShort(val);
      }
      throw new Error(
        "val is not a non-empty string or a valid number. val=" + JSON.stringify(val)
      );
    };
    function parse(str) {
      str = String(str);
      if (str.length > 100) {
        return;
      }
      var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        str
      );
      if (!match) {
        return;
      }
      var n = parseFloat(match[1]);
      var type = (match[2] || "ms").toLowerCase();
      switch (type) {
        case "years":
        case "year":
        case "yrs":
        case "yr":
        case "y":
          return n * y;
        case "weeks":
        case "week":
        case "w":
          return n * w;
        case "days":
        case "day":
        case "d":
          return n * d;
        case "hours":
        case "hour":
        case "hrs":
        case "hr":
        case "h":
          return n * h;
        case "minutes":
        case "minute":
        case "mins":
        case "min":
        case "m":
          return n * m;
        case "seconds":
        case "second":
        case "secs":
        case "sec":
        case "s":
          return n * s;
        case "milliseconds":
        case "millisecond":
        case "msecs":
        case "msec":
        case "ms":
          return n;
        default:
          return void 0;
      }
    }
    function fmtShort(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return Math.round(ms / d) + "d";
      }
      if (msAbs >= h) {
        return Math.round(ms / h) + "h";
      }
      if (msAbs >= m) {
        return Math.round(ms / m) + "m";
      }
      if (msAbs >= s) {
        return Math.round(ms / s) + "s";
      }
      return ms + "ms";
    }
    function fmtLong(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return plural(ms, msAbs, d, "day");
      }
      if (msAbs >= h) {
        return plural(ms, msAbs, h, "hour");
      }
      if (msAbs >= m) {
        return plural(ms, msAbs, m, "minute");
      }
      if (msAbs >= s) {
        return plural(ms, msAbs, s, "second");
      }
      return ms + " ms";
    }
    function plural(ms, msAbs, n, name) {
      var isPlural = msAbs >= n * 1.5;
      return Math.round(ms / n) + " " + name + (isPlural ? "s" : "");
    }
  }
});

// node_modules/debug/src/common.js
var require_common = __commonJS({
  "node_modules/debug/src/common.js"(exports, module) {
    function setup(env) {
      createDebug.debug = createDebug;
      createDebug.default = createDebug;
      createDebug.coerce = coerce;
      createDebug.disable = disable;
      createDebug.enable = enable;
      createDebug.enabled = enabled;
      createDebug.humanize = require_ms();
      createDebug.destroy = destroy;
      Object.keys(env).forEach((key) => {
        createDebug[key] = env[key];
      });
      createDebug.names = [];
      createDebug.skips = [];
      createDebug.formatters = {};
      function selectColor(namespace) {
        let hash = 0;
        for (let i = 0; i < namespace.length; i++) {
          hash = (hash << 5) - hash + namespace.charCodeAt(i);
          hash |= 0;
        }
        return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
      }
      createDebug.selectColor = selectColor;
      function createDebug(namespace) {
        let prevTime;
        let enableOverride = null;
        let namespacesCache;
        let enabledCache;
        function debug(...args) {
          if (!debug.enabled) {
            return;
          }
          const self = debug;
          const curr = Number(new Date());
          const ms = curr - (prevTime || curr);
          self.diff = ms;
          self.prev = prevTime;
          self.curr = curr;
          prevTime = curr;
          args[0] = createDebug.coerce(args[0]);
          if (typeof args[0] !== "string") {
            args.unshift("%O");
          }
          let index = 0;
          args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
            if (match === "%%") {
              return "%";
            }
            index++;
            const formatter = createDebug.formatters[format];
            if (typeof formatter === "function") {
              const val = args[index];
              match = formatter.call(self, val);
              args.splice(index, 1);
              index--;
            }
            return match;
          });
          createDebug.formatArgs.call(self, args);
          const logFn = self.log || createDebug.log;
          logFn.apply(self, args);
        }
        debug.namespace = namespace;
        debug.useColors = createDebug.useColors();
        debug.color = createDebug.selectColor(namespace);
        debug.extend = extend;
        debug.destroy = createDebug.destroy;
        Object.defineProperty(debug, "enabled", {
          enumerable: true,
          configurable: false,
          get: () => {
            if (enableOverride !== null) {
              return enableOverride;
            }
            if (namespacesCache !== createDebug.namespaces) {
              namespacesCache = createDebug.namespaces;
              enabledCache = createDebug.enabled(namespace);
            }
            return enabledCache;
          },
          set: (v) => {
            enableOverride = v;
          }
        });
        if (typeof createDebug.init === "function") {
          createDebug.init(debug);
        }
        return debug;
      }
      function extend(namespace, delimiter) {
        const newDebug = createDebug(this.namespace + (typeof delimiter === "undefined" ? ":" : delimiter) + namespace);
        newDebug.log = this.log;
        return newDebug;
      }
      function enable(namespaces) {
        createDebug.save(namespaces);
        createDebug.namespaces = namespaces;
        createDebug.names = [];
        createDebug.skips = [];
        let i;
        const split = (typeof namespaces === "string" ? namespaces : "").split(/[\s,]+/);
        const len = split.length;
        for (i = 0; i < len; i++) {
          if (!split[i]) {
            continue;
          }
          namespaces = split[i].replace(/\*/g, ".*?");
          if (namespaces[0] === "-") {
            createDebug.skips.push(new RegExp("^" + namespaces.slice(1) + "$"));
          } else {
            createDebug.names.push(new RegExp("^" + namespaces + "$"));
          }
        }
      }
      function disable() {
        const namespaces = [
          ...createDebug.names.map(toNamespace),
          ...createDebug.skips.map(toNamespace).map((namespace) => "-" + namespace)
        ].join(",");
        createDebug.enable("");
        return namespaces;
      }
      function enabled(name) {
        if (name[name.length - 1] === "*") {
          return true;
        }
        let i;
        let len;
        for (i = 0, len = createDebug.skips.length; i < len; i++) {
          if (createDebug.skips[i].test(name)) {
            return false;
          }
        }
        for (i = 0, len = createDebug.names.length; i < len; i++) {
          if (createDebug.names[i].test(name)) {
            return true;
          }
        }
        return false;
      }
      function toNamespace(regexp) {
        return regexp.toString().substring(2, regexp.toString().length - 2).replace(/\.\*\?$/, "*");
      }
      function coerce(val) {
        if (val instanceof Error) {
          return val.stack || val.message;
        }
        return val;
      }
      function destroy() {
        console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
      }
      createDebug.enable(createDebug.load());
      return createDebug;
    }
    module.exports = setup;
  }
});

// node_modules/debug/src/browser.js
var require_browser = __commonJS({
  "node_modules/debug/src/browser.js"(exports, module) {
    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load;
    exports.useColors = useColors;
    exports.storage = localstorage();
    exports.destroy = (() => {
      let warned = false;
      return () => {
        if (!warned) {
          warned = true;
          console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
        }
      };
    })();
    exports.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function useColors() {
      if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) {
        return true;
      }
      if (typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
        return false;
      }
      return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function formatArgs(args) {
      args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module.exports.humanize(this.diff);
      if (!this.useColors) {
        return;
      }
      const c = "color: " + this.color;
      args.splice(1, 0, c, "color: inherit");
      let index = 0;
      let lastC = 0;
      args[0].replace(/%[a-zA-Z%]/g, (match) => {
        if (match === "%%") {
          return;
        }
        index++;
        if (match === "%c") {
          lastC = index;
        }
      });
      args.splice(lastC, 0, c);
    }
    exports.log = console.debug || console.log || (() => {
    });
    function save(namespaces) {
      try {
        if (namespaces) {
          exports.storage.setItem("debug", namespaces);
        } else {
          exports.storage.removeItem("debug");
        }
      } catch (error) {
      }
    }
    function load() {
      let r;
      try {
        r = exports.storage.getItem("debug");
      } catch (error) {
      }
      if (!r && typeof process !== "undefined" && "env" in process) {
        r = process.env.DEBUG;
      }
      return r;
    }
    function localstorage() {
      try {
        return localStorage;
      } catch (error) {
      }
    }
    module.exports = require_common()(exports);
    var { formatters } = module.exports;
    formatters.j = function(v) {
      try {
        return JSON.stringify(v);
      } catch (error) {
        return "[UnexpectedJSONParseError]: " + error.message;
      }
    };
  }
});

// node_modules/random-string/lib/random-string.js
var require_random_string = __commonJS({
  "node_modules/random-string/lib/random-string.js"(exports, module) {
    "use strict";
    var numbers = "0123456789";
    var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    var specials = "!$%^&*()_+|~-=`{}[]:;<>?,./";
    function _defaults(opts) {
      opts || (opts = {});
      return {
        length: opts.length || 8,
        numeric: typeof opts.numeric === "boolean" ? opts.numeric : true,
        letters: typeof opts.letters === "boolean" ? opts.letters : true,
        special: typeof opts.special === "boolean" ? opts.special : false,
        exclude: Array.isArray(opts.exclude) ? opts.exclude : []
      };
    }
    function _buildChars(opts) {
      var chars2 = "";
      if (opts.numeric) {
        chars2 += numbers;
      }
      if (opts.letters) {
        chars2 += letters;
      }
      if (opts.special) {
        chars2 += specials;
      }
      for (var i = 0; i <= opts.exclude.length; i++) {
        chars2 = chars2.replace(opts.exclude[i], "");
      }
      return chars2;
    }
    module.exports = function randomString(opts) {
      opts = _defaults(opts);
      var i, rn, rnd = "", len = opts.length, exclude = opts.exclude, randomChars = _buildChars(opts);
      for (i = 1; i <= len; i++) {
        rnd += randomChars.substring(rn = Math.floor(Math.random() * randomChars.length), rn + 1);
      }
      return rnd;
    };
  }
});

// node_modules/queue-microtask/index.js
var require_queue_microtask = __commonJS({
  "node_modules/queue-microtask/index.js"(exports, module) {
    var promise;
    module.exports = typeof queueMicrotask === "function" ? queueMicrotask.bind(typeof window !== "undefined" ? window : window) : (cb) => (promise || (promise = Promise.resolve())).then(cb).catch((err) => setTimeout(() => {
      throw err;
    }, 0));
  }
});

// node_modules/err-code/index.js
var require_err_code = __commonJS({
  "node_modules/err-code/index.js"(exports, module) {
    "use strict";
    function assign(obj, props) {
      for (const key in props) {
        Object.defineProperty(obj, key, {
          value: props[key],
          enumerable: true,
          configurable: true
        });
      }
      return obj;
    }
    function createError(err, code, props) {
      if (!err || typeof err === "string") {
        throw new TypeError("Please pass an Error to err-code");
      }
      if (!props) {
        props = {};
      }
      if (typeof code === "object") {
        props = code;
        code = "";
      }
      if (code) {
        props.code = code;
      }
      try {
        return assign(err, props);
      } catch (_) {
        props.message = err.message;
        props.stack = err.stack;
        const ErrClass = function() {
        };
        ErrClass.prototype = Object.create(Object.getPrototypeOf(err));
        const output = assign(new ErrClass(), props);
        return output;
      }
    }
    module.exports = createError;
  }
});

// node_modules/tiny-simple-peer/index.js
var require_tiny_simple_peer = __commonJS({
  "node_modules/tiny-simple-peer/index.js"(exports, module) {
    var debug = require_browser()("simple-peer");
    var getBrowserRTC2 = require_get_browser_rtc();
    var randomstring2 = require_random_string();
    var queueMicrotask2 = require_queue_microtask();
    var EventEmitter2 = require_events();
    var errCode = require_err_code();
    var MAX_BUFFERED_AMOUNT = 64 * 1024;
    var ICECOMPLETE_TIMEOUT = 5 * 1e3;
    var CHANNEL_CLOSING_TIMEOUT = 5 * 1e3;
    function filterTrickle(sdp) {
      return sdp.replace(/a=ice-options:trickle\s\n/g, "");
    }
    function warn(message) {
      console.warn(message);
    }
    var Peer2 = class extends EventEmitter2 {
      constructor(opts) {
        opts = Object.assign({
          allowHalfOpen: false
        }, opts);
        super(opts);
        this.id = opts.id || randomstring2({ length: 20 });
        this._debug("new peer %o", opts);
        this.channelName = opts.initiator ? opts.channelName || randomstring2({ length: 20 }) : null;
        this.initiator = opts.initiator || false;
        this.channelConfig = opts.channelConfig || Peer2.channelConfig;
        this.channelNegotiated = this.channelConfig.negotiated;
        this.config = Object.assign({}, Peer2.config, opts.config);
        this.proprietaryConstraints = Object.assign({}, Peer2.proprietaryConstraints, opts.proprietaryConstraints);
        this.offerOptions = opts.offerOptions || {};
        this.answerOptions = opts.answerOptions || {};
        this.sdpTransform = opts.sdpTransform || ((sdp) => sdp);
        this.streams = opts.streams || (opts.stream ? [opts.stream] : []);
        this.trickle = opts.trickle !== void 0 ? opts.trickle : true;
        this.allowHalfTrickle = opts.allowHalfTrickle !== void 0 ? opts.allowHalfTrickle : false;
        this.iceCompleteTimeout = opts.iceCompleteTimeout || ICECOMPLETE_TIMEOUT;
        this.destroyed = false;
        this.destroying = false;
        this._connected = false;
        this.remoteAddress = void 0;
        this.remoteFamily = void 0;
        this.remotePort = void 0;
        this.localAddress = void 0;
        this.localFamily = void 0;
        this.localPort = void 0;
        this._wrtc = opts.wrtc && typeof opts.wrtc === "object" ? opts.wrtc : getBrowserRTC2();
        if (!this._wrtc) {
          if (typeof window === "undefined") {
            throw errCode(new Error("No WebRTC support: Specify `opts.wrtc` option in this environment"), "ERR_WEBRTC_SUPPORT");
          } else {
            throw errCode(new Error("No WebRTC support: Not a supported browser"), "ERR_WEBRTC_SUPPORT");
          }
        }
        this._pcReady = false;
        this._channelReady = false;
        this._iceComplete = false;
        this._iceCompleteTimer = null;
        this._channel = null;
        this._pendingCandidates = [];
        this._isNegotiating = false;
        this._firstNegotiation = true;
        this._batchedNegotiation = false;
        this._queuedNegotiation = false;
        this._sendersAwaitingStable = [];
        this._senderMap = /* @__PURE__ */ new Map();
        this._closingInterval = null;
        this._remoteTracks = [];
        this._remoteStreams = [];
        this._chunk = null;
        this._cb = null;
        this._interval = null;
        try {
          this._pc = new this._wrtc.RTCPeerConnection(this.config, this.proprietaryConstraints);
        } catch (err) {
          this.destroy(errCode(err, "ERR_PC_CONSTRUCTOR"));
          return;
        }
        this._isReactNativeWebrtc = typeof this._pc._peerConnectionId === "number";
        this._pc.oniceconnectionstatechange = () => {
          this._onIceStateChange();
        };
        this._pc.onicegatheringstatechange = () => {
          this._onIceStateChange();
        };
        this._pc.onconnectionstatechange = () => {
          this._onConnectionStateChange();
        };
        this._pc.onsignalingstatechange = () => {
          this._onSignalingStateChange();
        };
        this._pc.onicecandidate = (event) => {
          this._onIceCandidate(event);
        };
        if (typeof this._pc.peerIdentity === "object") {
          this._pc.peerIdentity.catch((err) => {
            this.destroy(errCode(err, "ERR_PC_PEER_IDENTITY"));
          });
        }
        if (this.initiator || this.channelNegotiated) {
          this._setupData({
            channel: this._pc.createDataChannel(this.channelName, this.channelConfig)
          });
        } else {
          this._pc.ondatachannel = (event) => {
            this._setupData(event);
          };
        }
        if (this.streams) {
          this.streams.forEach((stream) => {
            this.addStream(stream);
          });
        }
        this._pc.ontrack = (event) => {
          this._onTrack(event);
        };
        this._debug("initial negotiation");
        this._needsNegotiation();
        this._onFinishBound = () => {
          this._onFinish();
        };
        this.once("finish", this._onFinishBound);
      }
      get bufferSize() {
        return this._channel && this._channel.bufferedAmount || 0;
      }
      get connected() {
        return this._connected && this._channel.readyState === "open";
      }
      address() {
        return { port: this.localPort, family: this.localFamily, address: this.localAddress };
      }
      signal(data) {
        if (this.destroying)
          return;
        if (this.destroyed)
          throw errCode(new Error("cannot signal after peer is destroyed"), "ERR_DESTROYED");
        if (typeof data === "string") {
          try {
            data = JSON.parse(data);
          } catch (err) {
            data = {};
          }
        }
        this._debug("signal()");
        if (data.renegotiate && this.initiator) {
          this._debug("got request to renegotiate");
          this._needsNegotiation();
        }
        if (data.transceiverRequest && this.initiator) {
          this._debug("got request for transceiver");
          this.addTransceiver(data.transceiverRequest.kind, data.transceiverRequest.init);
        }
        if (data.candidate) {
          if (this._pc.remoteDescription && this._pc.remoteDescription.type) {
            this._addIceCandidate(data.candidate);
          } else {
            this._pendingCandidates.push(data.candidate);
          }
        }
        if (data.sdp) {
          this._pc.setRemoteDescription(new this._wrtc.RTCSessionDescription(data)).then(() => {
            if (this.destroyed)
              return;
            this._pendingCandidates.forEach((candidate) => {
              this._addIceCandidate(candidate);
            });
            this._pendingCandidates = [];
            if (this._pc.remoteDescription.type === "offer")
              this._createAnswer();
          }).catch((err) => {
            this.destroy(errCode(err, "ERR_SET_REMOTE_DESCRIPTION"));
          });
        }
        if (!data.sdp && !data.candidate && !data.renegotiate && !data.transceiverRequest) {
          this.destroy(errCode(new Error("signal() called with invalid signal data"), "ERR_SIGNALING"));
        }
      }
      _addIceCandidate(candidate) {
        const iceCandidateObj = new this._wrtc.RTCIceCandidate(candidate);
        this._pc.addIceCandidate(iceCandidateObj).catch((err) => {
          if (!iceCandidateObj.address || iceCandidateObj.address.endsWith(".local")) {
            warn("Ignoring unsupported ICE candidate.");
          } else {
            this.destroy(errCode(err, "ERR_ADD_ICE_CANDIDATE"));
          }
        });
      }
      send(chunk) {
        if (this.destroying)
          return;
        if (this.destroyed)
          throw errCode(new Error("cannot send after peer is destroyed"), "ERR_DESTROYED");
        this._channel.send(chunk);
      }
      addTransceiver(kind, init) {
        if (this.destroying)
          return;
        if (this.destroyed)
          throw errCode(new Error("cannot addTransceiver after peer is destroyed"), "ERR_DESTROYED");
        this._debug("addTransceiver()");
        if (this.initiator) {
          try {
            this._pc.addTransceiver(kind, init);
            this._needsNegotiation();
          } catch (err) {
            this.destroy(errCode(err, "ERR_ADD_TRANSCEIVER"));
          }
        } else {
          this.emit("signal", {
            type: "transceiverRequest",
            transceiverRequest: { kind, init }
          });
        }
      }
      addStream(stream) {
        if (this.destroying)
          return;
        if (this.destroyed)
          throw errCode(new Error("cannot addStream after peer is destroyed"), "ERR_DESTROYED");
        this._debug("addStream()");
        stream.getTracks().forEach((track) => {
          this.addTrack(track, stream);
        });
      }
      addTrack(track, stream) {
        if (this.destroying)
          return;
        if (this.destroyed)
          throw errCode(new Error("cannot addTrack after peer is destroyed"), "ERR_DESTROYED");
        this._debug("addTrack()");
        const submap = this._senderMap.get(track) || /* @__PURE__ */ new Map();
        let sender = submap.get(stream);
        if (!sender) {
          sender = this._pc.addTrack(track, stream);
          submap.set(stream, sender);
          this._senderMap.set(track, submap);
          this._needsNegotiation();
        } else if (sender.removed) {
          throw errCode(new Error("Track has been removed. You should enable/disable tracks that you want to re-add."), "ERR_SENDER_REMOVED");
        } else {
          throw errCode(new Error("Track has already been added to that stream."), "ERR_SENDER_ALREADY_ADDED");
        }
      }
      replaceTrack(oldTrack, newTrack, stream) {
        if (this.destroying)
          return;
        if (this.destroyed)
          throw errCode(new Error("cannot replaceTrack after peer is destroyed"), "ERR_DESTROYED");
        this._debug("replaceTrack()");
        const submap = this._senderMap.get(oldTrack);
        const sender = submap ? submap.get(stream) : null;
        if (!sender) {
          throw errCode(new Error("Cannot replace track that was never added."), "ERR_TRACK_NOT_ADDED");
        }
        if (newTrack)
          this._senderMap.set(newTrack, submap);
        if (sender.replaceTrack != null) {
          sender.replaceTrack(newTrack);
        } else {
          this.destroy(errCode(new Error("replaceTrack is not supported in this browser"), "ERR_UNSUPPORTED_REPLACETRACK"));
        }
      }
      removeTrack(track, stream) {
        if (this.destroying)
          return;
        if (this.destroyed)
          throw errCode(new Error("cannot removeTrack after peer is destroyed"), "ERR_DESTROYED");
        this._debug("removeSender()");
        const submap = this._senderMap.get(track);
        const sender = submap ? submap.get(stream) : null;
        if (!sender) {
          throw errCode(new Error("Cannot remove track that was never added."), "ERR_TRACK_NOT_ADDED");
        }
        try {
          sender.removed = true;
          this._pc.removeTrack(sender);
        } catch (err) {
          if (err.name === "NS_ERROR_UNEXPECTED") {
            this._sendersAwaitingStable.push(sender);
          } else {
            this.destroy(errCode(err, "ERR_REMOVE_TRACK"));
          }
        }
        this._needsNegotiation();
      }
      removeStream(stream) {
        if (this.destroying)
          return;
        if (this.destroyed)
          throw errCode(new Error("cannot removeStream after peer is destroyed"), "ERR_DESTROYED");
        this._debug("removeSenders()");
        stream.getTracks().forEach((track) => {
          this.removeTrack(track, stream);
        });
      }
      _needsNegotiation() {
        this._debug("_needsNegotiation");
        if (this._batchedNegotiation)
          return;
        this._batchedNegotiation = true;
        queueMicrotask2(() => {
          this._batchedNegotiation = false;
          if (this.initiator || !this._firstNegotiation) {
            this._debug("starting batched negotiation");
            this.negotiate();
          } else {
            this._debug("non-initiator initial negotiation request discarded");
          }
          this._firstNegotiation = false;
        });
      }
      negotiate() {
        if (this.destroying)
          return;
        if (this.destroyed)
          throw errCode(new Error("cannot negotiate after peer is destroyed"), "ERR_DESTROYED");
        if (this.initiator) {
          if (this._isNegotiating) {
            this._queuedNegotiation = true;
            this._debug("already negotiating, queueing");
          } else {
            this._debug("start negotiation");
            setTimeout(() => {
              this._createOffer();
            }, 0);
          }
        } else {
          if (this._isNegotiating) {
            this._queuedNegotiation = true;
            this._debug("already negotiating, queueing");
          } else {
            this._debug("requesting negotiation from initiator");
            this.emit("signal", {
              type: "renegotiate",
              renegotiate: true
            });
          }
        }
        this._isNegotiating = true;
      }
      destroy(err) {
        this._destroy(err, () => {
        });
      }
      _destroy(err, cb) {
        if (this.destroyed || this.destroying)
          return;
        this.destroying = true;
        this._debug("destroying (error: %s)", err && (err.message || err));
        queueMicrotask2(() => {
          this.destroyed = true;
          this.destroying = false;
          this._debug("destroy (error: %s)", err && (err.message || err));
          this._connected = false;
          this._pcReady = false;
          this._channelReady = false;
          this._remoteTracks = null;
          this._remoteStreams = null;
          this._senderMap = null;
          clearInterval(this._closingInterval);
          this._closingInterval = null;
          clearInterval(this._interval);
          this._interval = null;
          this._chunk = null;
          this._cb = null;
          if (this._onFinishBound)
            this.removeListener("finish", this._onFinishBound);
          this._onFinishBound = null;
          if (this._channel) {
            try {
              this._channel.close();
            } catch (err2) {
            }
            this._channel.onmessage = null;
            this._channel.onopen = null;
            this._channel.onclose = null;
            this._channel.onerror = null;
          }
          if (this._pc) {
            try {
              this._pc.close();
            } catch (err2) {
            }
            this._pc.oniceconnectionstatechange = null;
            this._pc.onicegatheringstatechange = null;
            this._pc.onsignalingstatechange = null;
            this._pc.onicecandidate = null;
            this._pc.ontrack = null;
            this._pc.ondatachannel = null;
          }
          this._pc = null;
          this._channel = null;
          if (err)
            this.emit("error", err);
          this.emit("close");
          cb();
        });
      }
      _setupData(event) {
        if (!event.channel) {
          return this.destroy(errCode(new Error("Data channel event is missing `channel` property"), "ERR_DATA_CHANNEL"));
        }
        this._channel = event.channel;
        this._channel.binaryType = "arraybuffer";
        if (typeof this._channel.bufferedAmountLowThreshold === "number") {
          this._channel.bufferedAmountLowThreshold = MAX_BUFFERED_AMOUNT;
        }
        this.channelName = this._channel.label;
        this._channel.onmessage = (event2) => {
          this._onChannelMessage(event2);
        };
        this._channel.onbufferedamountlow = () => {
          this._onChannelBufferedAmountLow();
        };
        this._channel.onopen = () => {
          this._onChannelOpen();
        };
        this._channel.onclose = () => {
          this._onChannelClose();
        };
        this._channel.onerror = (event2) => {
          const err = event2.error instanceof Error ? event2.error : new Error(`Datachannel error: ${event2.message} ${event2.filename}:${event2.lineno}:${event2.colno}`);
          this.destroy(errCode(err, "ERR_DATA_CHANNEL"));
        };
        let isClosing = false;
        this._closingInterval = setInterval(() => {
          if (this._channel && this._channel.readyState === "closing") {
            if (isClosing)
              this._onChannelClose();
            isClosing = true;
          } else {
            isClosing = false;
          }
        }, CHANNEL_CLOSING_TIMEOUT);
      }
      _read() {
      }
      _write(chunk, encoding, cb) {
        if (this.destroyed)
          return cb(errCode(new Error("cannot write after peer is destroyed"), "ERR_DATA_CHANNEL"));
        if (this._connected) {
          try {
            this.send(chunk);
          } catch (err) {
            return this.destroy(errCode(err, "ERR_DATA_CHANNEL"));
          }
          if (this._channel.bufferedAmount > MAX_BUFFERED_AMOUNT) {
            this._debug("start backpressure: bufferedAmount %d", this._channel.bufferedAmount);
            this._cb = cb;
          } else {
            cb(null);
          }
        } else {
          this._debug("write before connect");
          this._chunk = chunk;
          this._cb = cb;
        }
      }
      _onFinish() {
        if (this.destroyed)
          return;
        const destroySoon = () => {
          setTimeout(() => this.destroy(), 1e3);
        };
        if (this._connected) {
          destroySoon();
        } else {
          this.once("connect", destroySoon);
        }
      }
      _startIceCompleteTimeout() {
        if (this.destroyed)
          return;
        if (this._iceCompleteTimer)
          return;
        this._debug("started iceComplete timeout");
        this._iceCompleteTimer = setTimeout(() => {
          if (!this._iceComplete) {
            this._iceComplete = true;
            this._debug("iceComplete timeout completed");
            this.emit("iceTimeout");
            this.emit("_iceComplete");
          }
        }, this.iceCompleteTimeout);
      }
      _createOffer() {
        if (this.destroyed)
          return;
        this._pc.createOffer(this.offerOptions).then((offer) => {
          if (this.destroyed)
            return;
          if (!this.trickle && !this.allowHalfTrickle)
            offer.sdp = filterTrickle(offer.sdp);
          offer.sdp = this.sdpTransform(offer.sdp);
          const sendOffer = () => {
            if (this.destroyed)
              return;
            const signal = this._pc.localDescription || offer;
            this._debug("signal");
            this.emit("signal", {
              type: signal.type,
              sdp: signal.sdp
            });
          };
          const onSuccess = () => {
            this._debug("createOffer success");
            if (this.destroyed)
              return;
            if (this.trickle || this._iceComplete)
              sendOffer();
            else
              this.once("_iceComplete", sendOffer);
          };
          const onError = (err) => {
            this.destroy(errCode(err, "ERR_SET_LOCAL_DESCRIPTION"));
          };
          this._pc.setLocalDescription(offer).then(onSuccess).catch(onError);
        }).catch((err) => {
          this.destroy(errCode(err, "ERR_CREATE_OFFER"));
        });
      }
      _requestMissingTransceivers() {
        if (this._pc.getTransceivers) {
          this._pc.getTransceivers().forEach((transceiver) => {
            if (!transceiver.mid && transceiver.sender.track && !transceiver.requested) {
              transceiver.requested = true;
              this.addTransceiver(transceiver.sender.track.kind);
            }
          });
        }
      }
      _createAnswer() {
        if (this.destroyed)
          return;
        this._pc.createAnswer(this.answerOptions).then((answer) => {
          if (this.destroyed)
            return;
          if (!this.trickle && !this.allowHalfTrickle)
            answer.sdp = filterTrickle(answer.sdp);
          answer.sdp = this.sdpTransform(answer.sdp);
          const sendAnswer = () => {
            if (this.destroyed)
              return;
            const signal = this._pc.localDescription || answer;
            this._debug("signal");
            this.emit("signal", {
              type: signal.type,
              sdp: signal.sdp
            });
            if (!this.initiator)
              this._requestMissingTransceivers();
          };
          const onSuccess = () => {
            if (this.destroyed)
              return;
            if (this.trickle || this._iceComplete)
              sendAnswer();
            else
              this.once("_iceComplete", sendAnswer);
          };
          const onError = (err) => {
            this.destroy(errCode(err, "ERR_SET_LOCAL_DESCRIPTION"));
          };
          this._pc.setLocalDescription(answer).then(onSuccess).catch(onError);
        }).catch((err) => {
          this.destroy(errCode(err, "ERR_CREATE_ANSWER"));
        });
      }
      _onConnectionStateChange() {
        if (this.destroyed)
          return;
        if (this._pc.connectionState === "failed") {
          this.destroy(errCode(new Error("Connection failed."), "ERR_CONNECTION_FAILURE"));
        }
      }
      _onIceStateChange() {
        if (this.destroyed)
          return;
        const iceConnectionState = this._pc.iceConnectionState;
        const iceGatheringState = this._pc.iceGatheringState;
        this._debug(
          "iceStateChange (connection: %s) (gathering: %s)",
          iceConnectionState,
          iceGatheringState
        );
        this.emit("iceStateChange", iceConnectionState, iceGatheringState);
        if (iceConnectionState === "connected" || iceConnectionState === "completed") {
          this._pcReady = true;
          this._maybeReady();
        }
        if (iceConnectionState === "failed") {
          this.destroy(errCode(new Error("Ice connection failed."), "ERR_ICE_CONNECTION_FAILURE"));
        }
        if (iceConnectionState === "closed") {
          this.destroy(errCode(new Error("Ice connection closed."), "ERR_ICE_CONNECTION_CLOSED"));
        }
      }
      getStats(cb) {
        const flattenValues = (report) => {
          if (Object.prototype.toString.call(report.values) === "[object Array]") {
            report.values.forEach((value) => {
              Object.assign(report, value);
            });
          }
          return report;
        };
        if (this._pc.getStats.length === 0 || this._isReactNativeWebrtc) {
          this._pc.getStats().then((res) => {
            const reports = [];
            res.forEach((report) => {
              reports.push(flattenValues(report));
            });
            cb(null, reports);
          }, (err) => cb(err));
        } else if (this._pc.getStats.length > 0) {
          this._pc.getStats((res) => {
            if (this.destroyed)
              return;
            const reports = [];
            res.result().forEach((result) => {
              const report = {};
              result.names().forEach((name) => {
                report[name] = result.stat(name);
              });
              report.id = result.id;
              report.type = result.type;
              report.timestamp = result.timestamp;
              reports.push(flattenValues(report));
            });
            cb(null, reports);
          }, (err) => cb(err));
        } else {
          cb(null, []);
        }
      }
      _maybeReady() {
        this._debug("maybeReady pc %s channel %s", this._pcReady, this._channelReady);
        if (this._connected || this._connecting || !this._pcReady || !this._channelReady)
          return;
        this._connecting = true;
        const findCandidatePair = () => {
          if (this.destroyed)
            return;
          this.getStats((err, items) => {
            if (this.destroyed)
              return;
            if (err)
              items = [];
            const remoteCandidates = {};
            const localCandidates = {};
            const candidatePairs = {};
            let foundSelectedCandidatePair = false;
            items.forEach((item) => {
              if (item.type === "remotecandidate" || item.type === "remote-candidate") {
                remoteCandidates[item.id] = item;
              }
              if (item.type === "localcandidate" || item.type === "local-candidate") {
                localCandidates[item.id] = item;
              }
              if (item.type === "candidatepair" || item.type === "candidate-pair") {
                candidatePairs[item.id] = item;
              }
            });
            const setSelectedCandidatePair = (selectedCandidatePair) => {
              foundSelectedCandidatePair = true;
              let local = localCandidates[selectedCandidatePair.localCandidateId];
              if (local && (local.ip || local.address)) {
                this.localAddress = local.ip || local.address;
                this.localPort = Number(local.port);
              } else if (local && local.ipAddress) {
                this.localAddress = local.ipAddress;
                this.localPort = Number(local.portNumber);
              } else if (typeof selectedCandidatePair.googLocalAddress === "string") {
                local = selectedCandidatePair.googLocalAddress.split(":");
                this.localAddress = local[0];
                this.localPort = Number(local[1]);
              }
              if (this.localAddress) {
                this.localFamily = this.localAddress.includes(":") ? "IPv6" : "IPv4";
              }
              let remote = remoteCandidates[selectedCandidatePair.remoteCandidateId];
              if (remote && (remote.ip || remote.address)) {
                this.remoteAddress = remote.ip || remote.address;
                this.remotePort = Number(remote.port);
              } else if (remote && remote.ipAddress) {
                this.remoteAddress = remote.ipAddress;
                this.remotePort = Number(remote.portNumber);
              } else if (typeof selectedCandidatePair.googRemoteAddress === "string") {
                remote = selectedCandidatePair.googRemoteAddress.split(":");
                this.remoteAddress = remote[0];
                this.remotePort = Number(remote[1]);
              }
              if (this.remoteAddress) {
                this.remoteFamily = this.remoteAddress.includes(":") ? "IPv6" : "IPv4";
              }
              this._debug(
                "connect local: %s:%s remote: %s:%s",
                this.localAddress,
                this.localPort,
                this.remoteAddress,
                this.remotePort
              );
            };
            items.forEach((item) => {
              if (item.type === "transport" && item.selectedCandidatePairId) {
                setSelectedCandidatePair(candidatePairs[item.selectedCandidatePairId]);
              }
              if (item.type === "googCandidatePair" && item.googActiveConnection === "true" || (item.type === "candidatepair" || item.type === "candidate-pair") && item.selected) {
                setSelectedCandidatePair(item);
              }
            });
            if (!foundSelectedCandidatePair && (!Object.keys(candidatePairs).length || Object.keys(localCandidates).length)) {
              setTimeout(findCandidatePair, 100);
              return;
            } else {
              this._connecting = false;
              this._connected = true;
            }
            if (this._chunk) {
              try {
                this.send(this._chunk);
              } catch (err2) {
                return this.destroy(errCode(err2, "ERR_DATA_CHANNEL"));
              }
              this._chunk = null;
              this._debug('sent chunk from "write before connect"');
              const cb = this._cb;
              this._cb = null;
              cb(null);
            }
            if (typeof this._channel.bufferedAmountLowThreshold !== "number") {
              this._interval = setInterval(() => this._onInterval(), 150);
              if (this._interval.unref)
                this._interval.unref();
            }
            this._debug("connect");
            this.emit("connect");
          });
        };
        findCandidatePair();
      }
      _onInterval() {
        if (!this._cb || !this._channel || this._channel.bufferedAmount > MAX_BUFFERED_AMOUNT) {
          return;
        }
        this._onChannelBufferedAmountLow();
      }
      _onSignalingStateChange() {
        if (this.destroyed)
          return;
        if (this._pc.signalingState === "stable") {
          this._isNegotiating = false;
          this._debug("flushing sender queue", this._sendersAwaitingStable);
          this._sendersAwaitingStable.forEach((sender) => {
            this._pc.removeTrack(sender);
            this._queuedNegotiation = true;
          });
          this._sendersAwaitingStable = [];
          if (this._queuedNegotiation) {
            this._debug("flushing negotiation queue");
            this._queuedNegotiation = false;
            this._needsNegotiation();
          } else {
            this._debug("negotiated");
            this.emit("negotiated");
          }
        }
        this._debug("signalingStateChange %s", this._pc.signalingState);
        this.emit("signalingStateChange", this._pc.signalingState);
      }
      _onIceCandidate(event) {
        if (this.destroyed)
          return;
        if (event.candidate && this.trickle) {
          this.emit("signal", {
            type: "candidate",
            candidate: {
              candidate: event.candidate.candidate,
              sdpMLineIndex: event.candidate.sdpMLineIndex,
              sdpMid: event.candidate.sdpMid
            }
          });
        } else if (!event.candidate && !this._iceComplete) {
          this._iceComplete = true;
          this.emit("_iceComplete");
        }
        if (event.candidate) {
          this._startIceCompleteTimeout();
        }
      }
      _onChannelMessage(event) {
        if (this.destroyed)
          return;
        this.emit("data", event.data);
      }
      _onChannelBufferedAmountLow() {
        if (this.destroyed || !this._cb)
          return;
        this._debug("ending backpressure: bufferedAmount %d", this._channel.bufferedAmount);
        const cb = this._cb;
        this._cb = null;
        cb(null);
      }
      _onChannelOpen() {
        if (this._connected || this.destroyed)
          return;
        this._debug("on channel open");
        this._channelReady = true;
        this._maybeReady();
      }
      _onChannelClose() {
        if (this.destroyed)
          return;
        this._debug("on channel close");
        this.destroy();
      }
      _onTrack(event) {
        if (this.destroyed)
          return;
        const { track, receiver, streams } = event;
        streams.forEach((eventStream) => {
          this._debug("on track");
          this.emit("track", track, eventStream, receiver);
          this._remoteTracks.push({ track, stream: eventStream });
          if (this._remoteStreams.some((remoteStream) => {
            return remoteStream.id === eventStream.id;
          }))
            return;
          this._remoteStreams.push(eventStream);
          queueMicrotask2(() => {
            this._debug("on stream");
            this.emit("stream", eventStream, receiver);
          });
        });
      }
      _debug() {
        const args = [].slice.call(arguments);
        args[0] = "[" + this.id + "] " + args[0];
        debug.apply(null, args);
      }
    };
    Peer2.WEBRTC_SUPPORT = !!getBrowserRTC2();
    Peer2.config = {
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:global.stun.twilio.com:3478"
          ]
        }
      ],
      sdpSemantics: "unified-plan"
    };
    Peer2.channelConfig = {};
    Peer2.proprietaryConstraints = {};
    module.exports = Peer2;
  }
});

// node_modules/convert-hex/convert-hex.js
var require_convert_hex = __commonJS({
  "node_modules/convert-hex/convert-hex.js"(exports, module) {
    !function(globals) {
      "use strict";
      var convertHex = {
        bytesToHex: function(bytes) {
          return arrBytesToHex(bytes);
        },
        hexToBytes: function(hex) {
          if (hex.length % 2 === 1)
            throw new Error("hexToBytes can't have a string with an odd number of characters.");
          if (hex.indexOf("0x") === 0)
            hex = hex.slice(2);
          return hex.match(/../g).map(function(x) {
            return parseInt(x, 16);
          });
        }
      };
      function arrBytesToHex(bytes) {
        return bytes.map(function(x) {
          return padLeft(x.toString(16), 2);
        }).join("");
      }
      function padLeft(orig, len) {
        if (orig.length > len)
          return orig;
        return Array(len - orig.length + 1).join("0") + orig;
      }
      if (typeof module !== "undefined" && module.exports) {
        module.exports = convertHex;
      } else {
        globals.convertHex = convertHex;
      }
    }(exports);
  }
});

// node_modules/array-buffer-to-hex/index.js
var require_array_buffer_to_hex = __commonJS({
  "node_modules/array-buffer-to-hex/index.js"(exports, module) {
    module.exports = function arrayBufferToHex2(arrayBuffer) {
      if (typeof arrayBuffer !== "object" || arrayBuffer === null || typeof arrayBuffer.byteLength !== "number") {
        throw new TypeError("Expected input to be an ArrayBuffer");
      }
      var view = new Uint8Array(arrayBuffer);
      var result = "";
      var value;
      for (var i = 0; i < view.length; i++) {
        value = view[i].toString(16);
        result += value.length === 1 ? "0" + value : value;
      }
      return result;
    };
  }
});

// src/p2pcf.js
var import_get_browser_rtc = __toESM(require_get_browser_rtc());
var import_events = __toESM(require_events());
var import_tiny_simple_peer = __toESM(require_tiny_simple_peer());

// node_modules/base64-arraybuffer/dist/base64-arraybuffer.es5.js
var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var lookup = typeof Uint8Array === "undefined" ? [] : new Uint8Array(256);
for (i = 0; i < chars.length; i++) {
  lookup[chars.charCodeAt(i)] = i;
}
var i;
var encode = function(arraybuffer) {
  var bytes = new Uint8Array(arraybuffer), i, len = bytes.length, base64 = "";
  for (i = 0; i < len; i += 3) {
    base64 += chars[bytes[i] >> 2];
    base64 += chars[(bytes[i] & 3) << 4 | bytes[i + 1] >> 4];
    base64 += chars[(bytes[i + 1] & 15) << 2 | bytes[i + 2] >> 6];
    base64 += chars[bytes[i + 2] & 63];
  }
  if (len % 3 === 2) {
    base64 = base64.substring(0, base64.length - 1) + "=";
  } else if (len % 3 === 1) {
    base64 = base64.substring(0, base64.length - 2) + "==";
  }
  return base64;
};
var decode = function(base64) {
  var bufferLength = base64.length * 0.75, len = base64.length, i, p = 0, encoded1, encoded2, encoded3, encoded4;
  if (base64[base64.length - 1] === "=") {
    bufferLength--;
    if (base64[base64.length - 2] === "=") {
      bufferLength--;
    }
  }
  var arraybuffer = new ArrayBuffer(bufferLength), bytes = new Uint8Array(arraybuffer);
  for (i = 0; i < len; i += 4) {
    encoded1 = lookup[base64.charCodeAt(i)];
    encoded2 = lookup[base64.charCodeAt(i + 1)];
    encoded3 = lookup[base64.charCodeAt(i + 2)];
    encoded4 = lookup[base64.charCodeAt(i + 3)];
    bytes[p++] = encoded1 << 2 | encoded2 >> 4;
    bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;
    bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63;
  }
  return arraybuffer;
};

// src/p2pcf.js
var import_convert_hex = __toESM(require_convert_hex());
var import_array_buffer_to_hex = __toESM(require_array_buffer_to_hex());
var MAX_MESSAGE_LENGTH_BYTES = 16e3;
var CHUNK_HEADER_LENGTH_BYTES = 12;
var CHUNK_MAGIC_WORD = 8121;
var CHUNK_MAX_LENGTH_BYTES = MAX_MESSAGE_LENGTH_BYTES - CHUNK_HEADER_LENGTH_BYTES;
var SIGNAL_MESSAGE_HEADER_WORDS = [33451, 33229, 4757, 41419];
var CANDIDATE_TYPES = {
  host: 0,
  srflx: 1,
  relay: 2
};
var CANDIDATE_TCP_TYPES = {
  active: 0,
  passive: 1,
  so: 2
};
var CANDIDATE_IDX = {
  TYPE: 0,
  PROTOCOL: 1,
  IP: 2,
  PORT: 3,
  RELATED_IP: 4,
  RELATED_PORT: 5,
  TCP_TYPE: 6
};
var DEFAULT_STUN_ICE = [
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:global.stun.twilio.com:3478" }
];
var DEFAULT_TURN_ICE = [
  {
    urls: "turn:openrelay.metered.ca:80",
    username: "openrelayproject",
    credential: "openrelayproject"
  },
  {
    urls: "turn:openrelay.metered.ca:443",
    username: "openrelayproject",
    credential: "openrelayproject"
  },
  {
    urls: "turn:openrelay.metered.ca:443?transport=tcp",
    username: "openrelayproject",
    credential: "openrelayproject"
  }
];
var randomstring = (len) => {
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  const str = bytes.reduce((accum, v) => accum + String.fromCharCode(v), "");
  return btoa(str).replaceAll("=", "");
};
var textDecoder = new TextDecoder("utf-8");
var textEncoder = new TextEncoder();
var arrToText = textDecoder.decode.bind(textDecoder);
var textToArr = textEncoder.encode.bind(textEncoder);
var removeInPlace = (a, condition) => {
  let i = 0;
  let j = 0;
  while (i < a.length) {
    const val = a[i];
    if (!condition(val, i, a))
      a[j++] = val;
    i++;
  }
  a.length = j;
  return a;
};
var ua = window.navigator.userAgent;
var iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
var webkit = !!ua.match(/WebKit/i);
var iOSSafari = !!(iOS && webkit && !ua.match(/CriOS/i));
var isFirefox = !!(navigator?.userAgent.toLowerCase().indexOf("firefox") > -1);
var hexToBase64 = (hex) => encode((0, import_convert_hex.hexToBytes)(hex));
var base64ToHex = (b64) => (0, import_array_buffer_to_hex.default)(decode(b64));
function createSdp(isOffer, iceUFrag, icePwd, dtlsFingerprintBase64) {
  const dtlsHex = base64ToHex(dtlsFingerprintBase64);
  let dtlsFingerprint = "";
  for (let i = 0; i < dtlsHex.length; i += 2) {
    dtlsFingerprint += `${dtlsHex[i]}${dtlsHex[i + 1]}${i === dtlsHex.length - 2 ? "" : ":"}`.toUpperCase();
  }
  const sdp = [
    "v=0",
    "o=- 5498186869896684180 2 IN IP4 127.0.0.1",
    "s=-",
    "t=0 0",
    "a=msid-semantic: WMS",
    "m=application 9 UDP/DTLS/SCTP webrtc-datachannel",
    "c=IN IP4 0.0.0.0",
    "a=mid:0",
    "a=sctp-port:5000"
  ];
  if (isOffer) {
    sdp.push("a=setup:actpass");
  } else {
    sdp.push("a=setup:active");
  }
  sdp.push(`a=ice-ufrag:${iceUFrag}`);
  sdp.push(`a=ice-pwd:${icePwd}`);
  sdp.push(`a=fingerprint:sha-256 ${dtlsFingerprint}`);
  return sdp.join("\r\n") + "\r\n";
}
var parseCandidate = (line) => {
  let parts;
  if (line.indexOf("a=candidate:") === 0) {
    parts = line.substring(12).split(" ");
  } else {
    parts = line.substring(10).split(" ");
  }
  const candidate = [
    CANDIDATE_TYPES[parts[7]],
    parts[2].toLowerCase() === "udp" ? 0 : 1,
    parts[4],
    parseInt(parts[5], 10)
  ];
  for (let i = 8; i < parts.length; i += 2) {
    switch (parts[i]) {
      case "raddr":
        while (candidate.length < 5)
          candidate.push(null);
        candidate[4] = parts[i + 1];
        break;
      case "rport":
        while (candidate.length < 6)
          candidate.push(null);
        candidate[5] = parseInt(parts[i + 1], 10);
        break;
      case "tcptype":
        while (candidate.length < 7)
          candidate.push(null);
        candidate[6] = CANDIDATE_TCP_TYPES[parts[i + 1]];
        break;
      default:
        break;
    }
  }
  while (candidate.length < 8)
    candidate.push(null);
  candidate[7] = parseInt(parts[3], 10);
  return candidate;
};
var P2PCF = class extends import_events.default {
  constructor(clientId = "", roomId = "", options = {}) {
    super();
    if (!clientId || clientId.length < 4) {
      throw new Error("Client ID must be at least four characters");
    }
    if (!roomId || roomId.length < 4) {
      throw new Error("Room ID must be at least four characters");
    }
    this._step = this._step.bind(this);
    this.peers = /* @__PURE__ */ new Map();
    this.msgChunks = /* @__PURE__ */ new Map();
    this.connectedSessions = [];
    this.clientId = clientId;
    this.roomId = roomId;
    this.sessionId = randomstring(20);
    this.packages = [];
    this.dataTimestamp = null;
    this.lastPackages = null;
    this.lastProcessedReceivedDataTimestamps = /* @__PURE__ */ new Map();
    this.packageReceivedFromPeers = /* @__PURE__ */ new Set();
    this.startedAtTimestamp = null;
    this.peerOptions = options.rtcPeerConnectionOptions || {};
    this.peerProprietaryConstraints = options.rtcPeerConnectionProprietaryConstraints || {};
    this.peerSdpTransform = options.sdpTransform || ((sdp) => sdp);
    this.workerUrl = options.workerUrl || "https://p2pcf.minddrop.workers.dev";
    if (this.workerUrl.endsWith("/")) {
      this.workerUrl = this.workerUrl.substring(0, this.workerUrl.length - 1);
    }
    this.stunIceServers = options.stunIceServers || DEFAULT_STUN_ICE;
    this.turnIceServers = options.turnIceServers || DEFAULT_TURN_ICE;
    this.networkChangePollIntervalMs = options.networkChangePollIntervalMs || 15e3;
    this.stateExpirationIntervalMs = options.stateExpirationIntervalMs || 2 * 60 * 1e3;
    this.stateHeartbeatWindowMs = options.stateHeartbeatWindowMs || 3e4;
    this.fastPollingDurationMs = options.fastPollingDurationMs || 1e4;
    this.fastPollingRateMs = options.fastPollingRateMs || 750;
    this.slowPollingRateMs = options.slowPollingRateMs || 1500;
    this.wrtc = (0, import_get_browser_rtc.default)();
    this.dtlsCert = null;
    this.udpEnabled = null;
    this.isSymmetric = null;
    this.dtlsFingerprint = null;
    this.reflexiveIps = /* @__PURE__ */ new Set();
    this.isSending = false;
    this.finished = false;
    this.nextStepTime = -1;
    this.deleteKey = null;
    this.sentFirstPoll = false;
    this.stopFastPollingAt = -1;
    if (!window.history.state?._p2pcfContextId) {
      window.history.replaceState(
        {
          ...window.history.state,
          _p2pcfContextId: randomstring(20)
        },
        window.location.href
      );
    }
    this.contextId = window.history.state._p2pcfContextId;
  }
  async _init() {
    if (this.dtlsCert === null) {
      this.dtlsCert = await this.wrtc.RTCPeerConnection.generateCertificate({
        name: "ECDSA",
        namedCurve: "P-256"
      });
    }
  }
  async _step(finish = false) {
    const {
      sessionId,
      clientId,
      roomId,
      contextId,
      stateExpirationIntervalMs,
      stateHeartbeatWindowMs,
      packages,
      fastPollingDurationMs,
      fastPollingRateMs,
      slowPollingRateMs
    } = this;
    const now = Date.now();
    if (finish) {
      if (this.finished)
        return;
      if (!this.deleteKey)
        return;
      this.finished = true;
    } else {
      if (this.nextStepTime > now)
        return;
      if (this.isSending)
        return;
      if (this.reflexiveIps.length === 0)
        return;
    }
    this.isSending = true;
    try {
      const localDtlsFingerprintBase64 = hexToBase64(
        this.dtlsFingerprint.replaceAll(":", "")
      );
      const localPeerInfo = [
        sessionId,
        clientId,
        this.isSymmetric,
        localDtlsFingerprintBase64,
        this.startedAtTimestamp,
        [...this.reflexiveIps]
      ];
      const payload = { r: roomId, k: contextId };
      if (finish) {
        payload.dk = this.deleteKey;
      }
      const expired = this.dataTimestamp === null || now - this.dataTimestamp >= stateExpirationIntervalMs - stateHeartbeatWindowMs;
      const packagesChanged = this.lastPackages !== JSON.stringify(packages);
      let includePackages = false;
      if (expired || packagesChanged || finish) {
        this.dataTimestamp = now;
        removeInPlace(packages, (pkg) => {
          const sentAt = pkg[pkg.length - 2];
          return now - sentAt > 60 * 1e3;
        });
        includePackages = true;
      }
      if (finish) {
        includePackages = false;
      }
      if (this.sentFirstPoll) {
        payload.d = localPeerInfo;
        payload.t = this.dataTimestamp;
        payload.x = this.stateExpirationIntervalMs;
        if (includePackages) {
          payload.p = packages;
          this.lastPackages = JSON.stringify(packages);
        }
      }
      const body = JSON.stringify(payload);
      const headers = { "Content-Type": "application/json " };
      let keepalive = false;
      if (finish) {
        headers["X-Worker-Method"] = "DELETE";
        keepalive = true;
      }
      const res = await fetch(this.workerUrl, {
        method: "POST",
        headers,
        body,
        keepalive
      });
      const { ps: remotePeerDatas, pk: remotePackages, dk } = await res.json();
      if (dk) {
        this.deleteKey = dk;
      }
      if (finish)
        return;
      if (remotePeerDatas.length === 0 && !this.sentFirstPoll) {
        payload.d = localPeerInfo;
        payload.t = this.dataTimestamp;
        payload.x = this.stateExpirationIntervalMs;
        payload.p = packages;
        this.lastPackages = JSON.stringify(packages);
        const res2 = await fetch(this.workerUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const { dk: dk2 } = await res2.json();
        if (dk2) {
          this.deleteKey = dk2;
        }
      }
      this.sentFirstPoll = true;
      const previousPeerSessionIds = [...this.peers.keys()];
      this._handleWorkerResponse(
        localPeerInfo,
        localDtlsFingerprintBase64,
        packages,
        remotePeerDatas,
        remotePackages
      );
      const activeSessionIds = remotePeerDatas.map((p) => p[0]);
      const peersChanged = previousPeerSessionIds.length !== activeSessionIds.length || activeSessionIds.find((c) => !previousPeerSessionIds.includes(c)) || previousPeerSessionIds.find((c) => !activeSessionIds.includes(c));
      if (peersChanged) {
        this.stopFastPollingAt = now + fastPollingDurationMs;
      }
      if (now < this.stopFastPollingAt) {
        this.nextStepTime = now + fastPollingRateMs;
      } else {
        this.nextStepTime = now + slowPollingRateMs;
      }
    } catch (e) {
      console.error(e);
      this.nextStepTime = now + slowPollingRateMs;
    } finally {
      this.isSending = false;
    }
  }
  _handleWorkerResponse(localPeerData, localDtlsFingerprintBase64, localPackages, remotePeerDatas, remotePackages) {
    const localStartedAtTimestamp = this.startedAtTimestamp;
    const {
      dtlsCert: localDtlsCert,
      peers,
      lastProcessedReceivedDataTimestamps,
      packageReceivedFromPeers,
      stunIceServers,
      turnIceServers
    } = this;
    const [localSessionId, , localSymmetric] = localPeerData;
    const now = Date.now();
    for (const remotePeerData of remotePeerDatas) {
      const [
        remoteSessionId,
        remoteClientId,
        remoteSymmetric,
        remoteDtlsFingerprintBase64,
        remoteStartedAtTimestamp,
        remoteReflexiveIps,
        remoteDataTimestamp
      ] = remotePeerData;
      if (lastProcessedReceivedDataTimestamps.get(remoteSessionId) === remoteDataTimestamp) {
        continue;
      }
      const isPeerA = localSymmetric === remoteSymmetric ? localStartedAtTimestamp === remoteStartedAtTimestamp ? localSessionId > remoteSessionId : localStartedAtTimestamp > remoteStartedAtTimestamp : localSymmetric;
      const iceServers = localSymmetric || remoteSymmetric ? turnIceServers : stunIceServers;
      const delaySetRemoteUntilReceiveCandidates = isFirefox;
      const remotePackage = remotePackages.find((p) => p[1] === remoteSessionId);
      const peerOptions = { ...this.peerOptions, iceServers };
      if (localDtlsCert) {
        peerOptions.certificates = [localDtlsCert];
      }
      if (isPeerA) {
        if (peers.has(remoteSessionId))
          continue;
        if (!remotePackage)
          continue;
        lastProcessedReceivedDataTimestamps.set(
          remoteSessionId,
          remoteDataTimestamp
        );
        if (packageReceivedFromPeers.has(remoteSessionId))
          continue;
        packageReceivedFromPeers.add(remoteSessionId);
        const [
          ,
          ,
          remoteIceUFrag,
          remoteIcePwd,
          remoteDtlsFingerprintBase642,
          localIceUFrag,
          localIcePwd,
          ,
          remoteCandidates
        ] = remotePackage;
        const peer = new import_tiny_simple_peer.default({
          config: peerOptions,
          initiator: false,
          iceCompleteTimeout: 3e3,
          proprietaryConstraints: this.peerProprietaryConstraints,
          sdpTransform: (sdp) => {
            const lines = [];
            for (const l of sdp.split("\r\n")) {
              if (l.startsWith("a=ice-ufrag")) {
                lines.push(`a=ice-ufrag:${localIceUFrag}`);
              } else if (l.startsWith("a=ice-pwd")) {
                lines.push(`a=ice-pwd:${localIcePwd}`);
              } else {
                lines.push(l);
              }
            }
            return this.peerSdpTransform(lines.join("\r\n"));
          }
        });
        peer.id = remoteSessionId;
        peer.client_id = remoteClientId;
        this._wireUpCommonPeerEvents(peer);
        peers.set(peer.id, peer);
        const pkg = [
          remoteSessionId,
          localSessionId,
          null,
          null,
          null,
          null,
          null,
          now,
          []
        ];
        const pkgCandidates = pkg[pkg.length - 1];
        const initialCandidateSignalling = (e) => {
          if (!e.candidate?.candidate)
            return;
          pkgCandidates.push(e.candidate.candidate);
        };
        peer.on("signal", initialCandidateSignalling);
        const finishIce = () => {
          peer.removeListener("signal", initialCandidateSignalling);
          if (localPackages.includes(pkg))
            return;
          if (pkgCandidates.length === 0)
            return;
          localPackages.push(pkg);
        };
        peer.once("_iceComplete", finishIce);
        const remoteSdp = createSdp(
          true,
          remoteIceUFrag,
          remoteIcePwd,
          remoteDtlsFingerprintBase642
        );
        for (const candidate of remoteCandidates) {
          peer.signal({ candidate: { candidate, sdpMLineIndex: 0 } });
        }
        peer.signal({ type: "offer", sdp: remoteSdp });
      } else {
        if (!peers.has(remoteSessionId)) {
          lastProcessedReceivedDataTimestamps.set(
            remoteSessionId,
            remoteDataTimestamp
          );
          const remoteUfrag = randomstring(12);
          const remotePwd = randomstring(32);
          const peer2 = new import_tiny_simple_peer.default({
            config: peerOptions,
            proprietaryConstraints: this.rtcPeerConnectionProprietaryConstraints,
            iceCompleteTimeout: 3e3,
            initiator: true,
            sdpTransform: this.peerSdpTransform
          });
          peer2.id = remoteSessionId;
          peer2.client_id = remoteClientId;
          this._wireUpCommonPeerEvents(peer2);
          peers.set(peer2.id, peer2);
          const pkg = [
            remoteSessionId,
            localSessionId,
            null,
            null,
            null,
            remoteUfrag,
            remotePwd,
            now,
            []
          ];
          const pkgCandidates = pkg[pkg.length - 1];
          const initialCandidateSignalling = (e) => {
            if (!e.candidate?.candidate)
              return;
            pkgCandidates.push(e.candidate.candidate);
          };
          peer2.on("signal", initialCandidateSignalling);
          const finishIce = () => {
            peer2.removeListener("signal", initialCandidateSignalling);
            if (localPackages.includes(pkg))
              return;
            if (pkgCandidates.length === 0)
              return;
            localPackages.push(pkg);
          };
          peer2.once("_iceComplete", finishIce);
          const enqueuePackageFromOffer = (e) => {
            if (e.type !== "offer")
              return;
            peer2.removeListener("signal", enqueuePackageFromOffer);
            for (const l of e.sdp.split("\r\n")) {
              switch (l.split(":")[0]) {
                case "a=ice-ufrag":
                  pkg[2] = l.substring(12);
                  break;
                case "a=ice-pwd":
                  pkg[3] = l.substring(10);
                  break;
                case "a=fingerprint":
                  pkg[4] = hexToBase64(l.substring(22).replaceAll(":", ""));
                  break;
              }
            }
            let remoteSdp = createSdp(
              false,
              remoteUfrag,
              remotePwd,
              remoteDtlsFingerprintBase64
            );
            for (let i = 0; i < remoteReflexiveIps.length; i++) {
              remoteSdp += `a=candidate:0 1 udp ${i + 1} ${remoteReflexiveIps[i]} 30000 typ srflx\r
`;
            }
            if (!delaySetRemoteUntilReceiveCandidates) {
              peer2.signal({ type: "answer", sdp: remoteSdp });
            } else {
              peer2._pendingRemoteSdp = remoteSdp;
            }
          };
          peer2.once("signal", enqueuePackageFromOffer);
        }
        if (!remotePackage)
          continue;
        const [, , , , , , , , remoteCandidates] = remotePackage;
        if (packageReceivedFromPeers.has(remoteSessionId))
          continue;
        if (!peers.has(remoteSessionId))
          continue;
        const peer = peers.get(remoteSessionId);
        if (delaySetRemoteUntilReceiveCandidates && !peer._pc.remoteDescription && peer._pendingRemoteSdp) {
          if (!peer.connected) {
            for (const candidate of remoteCandidates) {
              peer.signal({ candidate: { candidate, sdpMLineIndex: 0 } });
            }
          }
          peer.signal({ type: "answer", sdp: peer._pendingRemoteSdp });
          delete peer._pendingRemoteSdp;
          packageReceivedFromPeers.add(remoteSessionId);
        }
        if (!delaySetRemoteUntilReceiveCandidates && peer._pc.remoteDescription && remoteCandidates.length > 0) {
          if (!peer.connected) {
            for (const candidate of remoteCandidates) {
              peer.signal({ candidate: { candidate, sdpMLineIndex: 0 } });
            }
          }
          packageReceivedFromPeers.add(remoteSessionId);
        }
      }
    }
    const remoteSessionIds = remotePeerDatas.map((p) => p[0]);
    for (const [sessionId, peer] of peers.entries()) {
      if (remoteSessionIds.includes(sessionId))
        continue;
      this._removePeer(peer, true);
    }
  }
  async start() {
    this.startedAtTimestamp = Date.now();
    await this._init();
    const [
      udpEnabled,
      isSymmetric,
      reflexiveIps,
      dtlsFingerprint
    ] = await this._getNetworkSettings(this.dtlsCert);
    this.udpEnabled = udpEnabled;
    this.isSymmetric = isSymmetric;
    this.reflexiveIps = reflexiveIps;
    this.dtlsFingerprint = dtlsFingerprint;
    this.networkSettingsInterval = setInterval(async () => {
      const [
        newUdpEnabled,
        newIsSymmetric,
        newReflexiveIps,
        newDtlsFingerprint
      ] = await this._getNetworkSettings(this.dtlsCert);
      if (newUdpEnabled !== this.udpEnabled || newIsSymmetric !== this.isSymmetric || newDtlsFingerprint !== this.dtlsFingerprint || !![...newReflexiveIps].find((ip) => ![...this.reflexiveIps].find((ip2) => ip === ip2)) || !![...reflexiveIps].find((ip) => ![...newReflexiveIps].find((ip2) => ip === ip2))) {
        this.dataTimestamp = null;
      }
      this.udpEnabled = newUdpEnabled;
      this.isSymmetric = newIsSymmetric;
      this.reflexiveIps = newReflexiveIps;
      this.dtlsFingerprint = newDtlsFingerprint;
    }, this.networkChangePollIntervalMs);
    this._step = this._step.bind(this);
    this.stepInterval = setInterval(this._step, 500);
    this.destroyOnUnload = () => this.destroy();
    for (const ev of iOSSafari ? ["pagehide"] : ["beforeunload", "unload"]) {
      window.addEventListener(ev, this.destroyOnUnload);
    }
  }
  _removePeer(peer, destroy = false) {
    const { packageReceivedFromPeers, packages, peers } = this;
    if (!peers.has(peer.id))
      return;
    removeInPlace(packages, (pkg) => pkg[0] === peer.id);
    packageReceivedFromPeers.delete(peer.id);
    peers.delete(peer.id);
    if (destroy) {
      peer.destroy();
    }
    this.emit("peerclose", peer);
  }
  send(peer, msg) {
    return new Promise((resolve, reject) => {
      let dataArrBuffer = null;
      let messageId = null;
      if (msg instanceof ArrayBuffer) {
        dataArrBuffer = msg;
      } else if (msg instanceof Uint8Array) {
        if (msg.buffer.byteLength === msg.length) {
          dataArrBuffer = msg.buffer;
        } else {
          dataArrBuffer = msg.buffer.slice(msg.byteOffset, msg.byteOffset + msg.byteLength);
        }
      } else {
        throw new Error("Unsupported send data type", msg);
      }
      if (dataArrBuffer.byteLength > MAX_MESSAGE_LENGTH_BYTES || new Uint16Array(dataArrBuffer, 0, 1) === CHUNK_MAGIC_WORD) {
        messageId = Math.floor(Math.random() * 256 * 128);
      }
      if (messageId !== null) {
        for (let offset = 0, chunkId = 0; offset < dataArrBuffer.byteLength; offset += CHUNK_MAX_LENGTH_BYTES, chunkId++) {
          const chunkSize = Math.min(
            CHUNK_MAX_LENGTH_BYTES,
            dataArrBuffer.byteLength - offset
          );
          let bufSize = CHUNK_HEADER_LENGTH_BYTES + chunkSize;
          while (bufSize % 4 !== 0) {
            bufSize++;
          }
          const buf = new ArrayBuffer(bufSize);
          new Uint8Array(buf, CHUNK_HEADER_LENGTH_BYTES).set(
            new Uint8Array(dataArrBuffer, offset, chunkSize)
          );
          const u16 = new Uint16Array(buf);
          const u32 = new Uint32Array(buf);
          u16[0] = CHUNK_MAGIC_WORD;
          u16[1] = messageId;
          u16[2] = chunkId;
          u16[3] = offset + CHUNK_MAX_LENGTH_BYTES >= dataArrBuffer.byteLength ? 1 : 0;
          u32[2] = dataArrBuffer.byteLength;
          peer.send(buf);
        }
      } else {
        peer.send(dataArrBuffer);
      }
    });
  }
  broadcast(msg) {
    const ps = [];
    for (const peer of this.peers.values()) {
      if (!peer.connected)
        continue;
      ps.push(this.send(peer, msg));
    }
    return Promise.all(ps);
  }
  destroy() {
    if (this._step) {
      this._step(true);
    }
    if (this.networkSettingsInterval) {
      clearInterval(this.networkSettingsInterval);
      this.networkSettingsInterval = null;
    }
    if (this.stepInterval) {
      clearInterval(this.stepInterval);
      this.stepInterval = null;
    }
    if (this.destroyOnUnload) {
      for (const ev of iOSSafari ? ["pagehide"] : ["beforeunload", "unload"]) {
        window.removeEventListener(ev, this.destroyOnUnload);
      }
      this.destroyOnUnload = null;
    }
    for (const peer of this.peers.values()) {
      peer.destroy();
    }
  }
  _chunkHandler(data, messageId, chunkId) {
    let target = null;
    if (!this.msgChunks.has(messageId)) {
      const totalLength = new Uint32Array(data, 0, 3)[2];
      target = new Uint8Array(totalLength);
      this.msgChunks.set(messageId, target);
    } else {
      target = this.msgChunks.get(messageId);
    }
    const offsetToSet = chunkId * CHUNK_MAX_LENGTH_BYTES;
    const numBytesToSet = Math.min(
      target.byteLength - offsetToSet,
      CHUNK_MAX_LENGTH_BYTES
    );
    target.set(
      new Uint8Array(data, CHUNK_HEADER_LENGTH_BYTES, numBytesToSet),
      chunkId * CHUNK_MAX_LENGTH_BYTES
    );
    return target.buffer;
  }
  _updateConnectedSessions() {
    this.connectedSessions.length = 0;
    for (const [sessionId, peer] of this.peers) {
      if (peer.connected) {
        this.connectedSessions.push(sessionId);
        continue;
      }
    }
  }
  async _getNetworkSettings() {
    await this._init();
    let dtlsFingerprint = null;
    const candidates = [];
    const reflexiveIps = /* @__PURE__ */ new Set();
    const peerOptions = { iceServers: this.stunIceServers };
    if (this.dtlsCert) {
      peerOptions.certificates = [this.dtlsCert];
    }
    const pc = new this.wrtc.RTCPeerConnection(peerOptions);
    pc.createDataChannel("x");
    const p = new Promise((resolve) => {
      setTimeout(() => resolve(), 5e3);
      pc.onicecandidate = (e) => {
        if (!e.candidate)
          return resolve();
        if (e.candidate.candidate) {
          candidates.push(parseCandidate(e.candidate.candidate));
        }
      };
    });
    pc.createOffer().then((offer) => {
      for (const l of offer.sdp.split("\n")) {
        if (l.indexOf("a=fingerprint") === -1)
          continue;
        dtlsFingerprint = l.split(" ")[1].trim();
      }
      pc.setLocalDescription(offer);
    });
    await p;
    pc.close();
    let isSymmetric = false;
    let udpEnabled = false;
    loop:
      for (const c of candidates) {
        if (c[0] !== CANDIDATE_TYPES.srflx)
          continue;
        udpEnabled = true;
        reflexiveIps.add(c[CANDIDATE_IDX.IP]);
        for (const d of candidates) {
          if (d[0] !== CANDIDATE_TYPES.srflx)
            continue;
          if (c === d)
            continue;
          if (typeof c[CANDIDATE_IDX.RELATED_PORT] === "number" && typeof d[CANDIDATE_IDX.RELATED_PORT] === "number" && c[CANDIDATE_IDX.RELATED_PORT] === d[CANDIDATE_IDX.RELATED_PORT] && c[CANDIDATE_IDX.PORT] !== d[CANDIDATE_IDX.PORT]) {
            isSymmetric = true;
            break;
          }
        }
      }
    return [udpEnabled, isSymmetric, reflexiveIps, dtlsFingerprint];
  }
  _handlePeerError(peer, err) {
    if (err.errorDetail === "sctp-failure" && err.message.indexOf("User-Initiated Abort") >= 0) {
      return;
    }
    console.error(err);
  }
  _checkForSignalOrEmitMessage(peer, msg) {
    if (msg.byteLength < SIGNAL_MESSAGE_HEADER_WORDS.length * 2) {
      this.emit("msg", peer, msg);
      return;
    }
    const u16 = new Uint16Array(msg, 0, SIGNAL_MESSAGE_HEADER_WORDS.length);
    for (let i = 0; i < SIGNAL_MESSAGE_HEADER_WORDS.length; i++) {
      if (u16[i] !== SIGNAL_MESSAGE_HEADER_WORDS[i]) {
        this.emit("msg", peer, msg);
        return;
      }
    }
    const u8 = new Uint8Array(msg, SIGNAL_MESSAGE_HEADER_WORDS.length * 2);
    let payload = arrToText(u8);
    if (payload.endsWith("\0")) {
      payload = payload.substring(0, payload.length - 1);
    }
    peer.signal(payload);
  }
  _wireUpCommonPeerEvents(peer) {
    peer.on("connect", () => {
      this.emit("peerconnect", peer);
      removeInPlace(this.packages, (pkg) => pkg[0] === peer.id);
      this._updateConnectedSessions();
    });
    peer.on("data", (data) => {
      let messageId = null;
      let u16 = null;
      if (data.byteLength >= CHUNK_HEADER_LENGTH_BYTES) {
        u16 = new Uint16Array(data, 0, CHUNK_HEADER_LENGTH_BYTES / 2);
        if (u16[0] === CHUNK_MAGIC_WORD) {
          messageId = u16[1];
        }
      }
      if (messageId !== null) {
        try {
          const chunkId = u16[2];
          const last = u16[3] !== 0;
          const msg = this._chunkHandler(data, messageId, chunkId, last);
          if (last) {
            this._checkForSignalOrEmitMessage(peer, msg);
            this.msgChunks.delete(messageId);
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        this._checkForSignalOrEmitMessage(peer, data);
      }
    });
    peer.on("error", (err) => {
      console.warn(err);
    });
    peer.on("close", () => {
      this._removePeer(peer);
      this._updateConnectedSessions();
    });
    peer.once("_iceComplete", () => {
      peer.on("signal", (signalData) => {
        const payloadBytes = textToArr(
          JSON.stringify(signalData)
        );
        let len = payloadBytes.byteLength + SIGNAL_MESSAGE_HEADER_WORDS.length * 2;
        if (len % 2 !== 0) {
          len++;
        }
        const buf = new ArrayBuffer(len);
        const u8 = new Uint8Array(buf);
        const u16 = new Uint16Array(buf);
        u8.set(payloadBytes, SIGNAL_MESSAGE_HEADER_WORDS.length * 2);
        for (let i = 0; i < SIGNAL_MESSAGE_HEADER_WORDS.length; i++) {
          u16[i] = SIGNAL_MESSAGE_HEADER_WORDS[i];
        }
        this.send(peer, buf);
      });
    });
  }
};
export {
  P2PCF as default
};
/*! queue-microtask. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
/*! simple-peer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
