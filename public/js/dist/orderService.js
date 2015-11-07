angular.module('OrderService', []).service('OrderService', [

    function() {
        var order = {};
        return {
            get: function(modulo, item) {
                if (order[modulo] == undefined) {
                    order[modulo] = {};
                }

                if (order[modulo][item] == undefined) {
                    order[modulo][item] = -1;
                }

                order[modulo][item] += 1;

                if (order[modulo][item] === 2) {
                    delete order[modulo][item];

                    return getOrder(order[modulo]);
                }

                return getOrder(order[modulo]);
            },

            byOrder: function(modulo, item) {
                if (order[modulo] == undefined) {
                    return 'random';
                }

                if (order[modulo][item] == undefined) {
                    return 'random';
                }

                if (order[modulo][item] === 0) {
                    return 'asc';
                }

                return 'desc';
            },

            reset: function(modulo){
                delete order[modulo];
            },

            resetAll: function()
            {
                for (var key in order) {
                    delete order[key];
                }
            }
        };

        function getOrder(modulo) {
            var myOrder = [];
            for (var key in modulo) {
                if (modulo.hasOwnProperty(key)) {
                    if (modulo[key] === 1) {
                        myOrder.push('-' + key);
                    } else {
                        myOrder.push(key);
                    }
                }
            }
            return myOrder;
        }
    }
]);
