"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var v4_1 = require("uuid/v4");
var initialState = {
    results: [],
    isLoading: false,
    error: null,
};
var cors = process.env.NODE_ENV !== 'production'
    ? 'https://cors-anywhere.herokuapp.com/'
    : '';
function useGoogleAutocomplete(_a) {
    var apiKey = _a.apiKey, query = _a.query, _b = _a.debounceMs, debounceMs = _b === void 0 ? 400 : _b, _c = _a.options, options = _c === void 0 ? {} : _c;
    var _d = react_1.default.useReducer(reducer, initialState), results = _d[0], dispatch = _d[1];
    var sessionToken = react_1.default.useRef(v4_1.default());
    var sessionTokenTimeout = react_1.default.useRef();
    react_1.default.useEffect(function () {
        sessionTokenTimeout.current = window.setInterval(resetSessionToken, 180000);
        return function () { return clearInterval(sessionTokenTimeout.current); };
    }, []);
    var initialRender = react_1.default.useRef(false);
    var debouncedFn = react_1.default.useRef();
    react_1.default.useEffect(function () {
        if (initialRender.current === false) {
            initialRender.current = true;
            return;
        }
        if (debouncedFn.current)
            debouncedFn.current.clear();
        dispatch({
            type: 'LOADING',
        });
        debouncedFn.current = debounce(function () {
            var types = options.types ? "&types=" + options.types : '';
            var language = options.language ? "&language=" + options.language : '';
            var location = options.location ? "&location=" + options.location : '';
            var radius = options.radius ? "&radius=" + options.radius : '';
            var strictbounds = options.strictbounds ? "&strictbounds" : '';
            var url = cors + "https://maps.googleapis.com/maps/api/place/autocomplete/json?input=" + query + types + language + location + radius + strictbounds + "&key=" + apiKey + "&sessiontoken=" + sessionToken.current;
            fetch(url)
                .then(function (data) { return data.json(); })
                .then(function (data) {
                console.log('data', data);
                dispatch({
                    type: data.status,
                    payload: {
                        data: data,
                    },
                });
            });
        }, debounceMs);
        debouncedFn.current();
    }, [
        query,
        debounceMs,
        apiKey,
        options.types,
        options.language,
        options.location,
        options.radius,
        options.strictbounds,
    ]);
    var resetSessionToken = function () {
        sessionToken.current = v4_1.default();
    };
    return {
        results: results,
    };
}
exports.default = useGoogleAutocomplete;
var reducer = function (state, action) {
    switch (action.type) {
        case 'LOADING':
            return __assign({}, state, { isLoading: true });
        case 'OK':
            return __assign({}, state, { results: action.payload.data, isLoading: false, error: null });
        case 'ZERO_RESULTS':
            return __assign({}, state, { results: [], isLoading: false, error: null });
        case 'INVALID_REQUEST':
            return __assign({}, state, { isLoading: false, error: null });
        case 'REQUEST_DENIED':
            return __assign({}, state, { isLoading: false, error: "Invalid 'key' parameter" });
        case 'UNKNOWN_ERROR':
            return __assign({}, state, { isLoading: false, error: "Unknown error, refresh and try again." });
        default:
            return state;
    }
};
function debounce(func, wait, immediate) {
    var timeout;
    var executedFunction = function () {
        var context = this;
        var args = arguments;
        var later = function () {
            timeout = null;
            if (!immediate)
                func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow)
            func.apply(context, args);
    };
    executedFunction.clear = function () {
        clearTimeout(timeout);
        timeout = null;
    };
    return executedFunction;
}
//# sourceMappingURL=use-google-places-autocomplete.js.map