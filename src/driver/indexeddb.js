/**
 * 这里是indexeddb的封装
 */

(function(global) {
    var DB;
    /**
     * 数据库
     * @param {String} [cName] 在indexeddb中叫集合名，websql中叫表名 default: _local_
     * @param {Array} [fields] 一个集合或表中的所有字段 default: []
     * @param {Number} [maxSize] 最大存储空间，默认 200M 即：200 * 1024 * 1024
     * @return {this}
     * @constructor
     */
    function IndexedDB(cName, fields, maxSize) {
        this.cName = cName;
        this.fields = fields;
        this.maxSize = maxSize;
        return this;
    }

    IndexedDB.prototype = {
        /**
         * 根据给定的存储数据，组装一个表/集合的所有字段
         * @param {Object|Any} obj fields为空时可以是任意一个数据
         * @return {String}
         * @private
         */
        _mapFields: function(obj) {
            var fields = this.fields,
                len = fields.length,
                i = 0,
                storeObj = {};

            // 为空时，相当于默认数据库
            if (len === i) {
                storeObj = obj;
            } else {
                while(i < len) {
                    if (Object.hasOwnProperty.call(obj, fields[i])) {
                        storeObj[fields[i]] = obj[fields[i]] || '';
                    }
                    i++;
                }
            }

            return JSON.stringify(storeObj);
        },

        /**
         * 把结果集变成对象
         * @param {Array} rows
         * @return {Object}
         * @private
         */
        _dealResult: function(rows) {
            var obj = {},
                i = 0,
                len = rows.length,
                item;

            while(i < len) {
                item = rows.item(i++);
                obj[item.key] = JSON.parse(item.value);
            }
            return obj;
        },

        /**
         * 创建数据库
         * @private
         */
        _create: function() {
            if (!DB) {
                // xxx
            }
        },

        /**
         * 获取单个数据
         * @param {String|Number} key
         * @param {Function} onSuccess
         * @param {Function} onFail
         */
        get: function(key, onSuccess, onFail) {

        },

        /**
         * 批量获取数据
         * @param {Array} keys
         * @param {Function} onSuccess
         * @param {Function} onFail
         */
        getBatch: function(keys, onSuccess, onFail) {

        },

        /**
         * 插入单个数据，插入时需要通过key去判断是否存在之前数据
         * @param {String|Number} key
         * @param {Object} value
         * @param {Function} onSuccess
         * @param {Function} onFail
         * @return
         */
        set: function(key, value, onSuccess, onFail) {

        },

        /**
         * 批量插入一组数据
         * @param {Object} dataObject
         * @param {Function} onSuccess
         * @param {Function} onFail
         */
        setBatch: function(dataObject, onSuccess, onFail) {

        },

        /**
         * 删除一项数据
         * @param {String|Number} key
         * @param {Function} onSuccess
         * @param {Function} onFail
         */
        remove: function(key, onSuccess, onFail) {

        },

        /**
         * 批量删除一组数据
         * @param {Array} keys
         * @param {Function} onSuccess
         * @param {Function} onFail
         */
        removeBatch: function(keys, onSuccess, onFail) {

        },

        /**
         * 获取所有的数据
         * @param {Function} onSuccess
         * @param {Function} onFail
         */
        all: function(onSuccess, onFail) {

        },

        /**
         * 清空所有数据
         * @param {Function} onSuccess
         * @param {Function} onFail
         */
        clear: function(onSuccess, onFail) {

        },

        /**
         * 删除表
         * @param {Function} onSuccess
         * @param {Function} onFail
         */
        "delete": function(onSuccess, onFail) {

        },

        /**
         * 过滤内容，同Array.filter
         * @param {Function} fn
         * @param {Function} onSuccess
         * @param {Function} onFail
         */
        filter: function(fn, onSuccess, onFail) {
            return this.all(function(dataObject) {
                var obj = {}, key;
                for(key in dataObject) {
                    if (fn(dataObject[key])) {
                        obj[key] = dataObject[key];
                    }
                }
                onSuccess(obj);
            }, onFail);
        }
    }

    global.IndexedDB = IndexedDB;
})(this.WebDB || this);
