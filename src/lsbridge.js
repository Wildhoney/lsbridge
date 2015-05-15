(function main($window, $localStorage) {

    "use strict";

    /**
     * @module LSBridge
     * @constructor
     */
    var LSBridge = function LSBridge() {
        $window.addEventListener('storage', invokeListeners.bind(this));
    };

    /**
     * @property prototype
     * @type {Object}
     */
    LSBridge.prototype = {

        /**
         * @property listeners
         * @type {Array}
         */
        listeners: [],

        /**
         * @property isLSAvailable
         * @type {Boolean}
         */
        isLSAvailable: (function() {

            var mod = '_';

            try {
                $localStorage.setItem(mod, mod);
                $localStorage.removeItem(mod);
                return true;
            } catch(e) {
                return false;
            }

        })(),

        /**
         * @method send
         * @param {String} namespace
         * @param {*} data
         * @return {void}
         */
        send: function send(namespace, data) {
            $localStorage.setItem(namespace, serialize(data));
        },

        /**
         * @method subscribe
         * @param {String} namespace
         * @param {Function} fn
         * @return {void}
         */
        subscribe: function subscribe(namespace, fn) {
            this.listeners.push({ ns: namespace, fn: fn });
        }

    };

    /**
     * @method serialize
     * @param {*} data
     * @return {*}
     */
    function serialize(data) {

        var serialized = '';
        
        switch (typeof data) {
            case 'function': serialized = JSON.stringify(data()); break;
            case 'object'  : serialized = JSON.stringify(data); break;
            default        : serialized = data;
        }
        
        return serialized;

    }

    /**
     * @method unserialize
     * @param {*} data
     * @return {*}
     */
    function unserialize(data) {

        try {

            var parsed = JSON.parse(data);

            if (parsed) {
                data = parsed
            }

        } catch(e) {}

        return data;

    }

    /**
     * @method invokeListeners
     * @property {StorageEvent} event
     * @return {void}
     */
    function invokeListeners(event) {

        this.listeners.forEach(function forEach(listener) {

            if (listener.ns === event.key) {
                listener.fn.call(this, event, unserialize(event.newValue));
            }

        });

    }

    $window.lsbridge = new LSBridge();

})(window, window.localStorage);