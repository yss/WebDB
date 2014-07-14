/**
 * 这里是localstorage的封装
 */

(function(global) {
    "use strict";
    var DB = localStorage;
    /**
     * 数据库
     * @param {String} [cName] 在indexeddb中叫集合名，websql中叫表名 default: _local_
     * @param {Array} [fields] 一个集合或表中的所有字段 default: []
     * @param {Number} [maxSize] 最大存储空间，默认 200M 即：200 * 1024 * 1024
     * @return {this}
     * @constructor
     */
    function LocalStorage(cName, fields, maxSize) {
        this.cName = cName;
        this.fields = fields;
        this.maxSize = maxSize;
        return this;
    }

    LocalStorage.prototype = {
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
         * 获取单个key
         * @param key
         * @return {string}
         * @private
         */
        _getKey: function(key) {
            return this.cName + '-' + key;
        },

        /**
         * 获取所有的key
         * @return {Array}
         * @private
         */
        _getAllKeys: function() {
            var cName = this.cName + '-',
                len = cName.length;
            return Object.keys(DB).filter(function(key) {
                return key.indexOf(cName) === 0;
            }).map(function(key) {
                    return key.substr(len);
                });
        },

        /**
         * 获取单个数据
         * @param {String|Number} key
         * @param {Function} onSuccess
         * \@\param {Function} onFail
         */
        get: function(key, onSuccess) {
            var value = DB.getItem(this._getKey(key));
            onSuccess && onSuccess(value === null ?  value : JSON.parse(value));
        },

        /**
         * 批量获取数据
         * @param {Array} keys
         * @param {Function} onSuccess
         * \@\param {Function} onFail
         */
        getBatch: function(keys, onSuccess) {
            var obj = {},
                _this = this;
            keys.forEach(function(key) {
                var value = DB.getItem(_this._getKey(key));
                if (value !== null) {
                    obj[key] = JSON.parse(value);
                }
            });

            onSuccess && onSuccess(obj);
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
            try {
                DB.setItem(this._getKey(key), this._mapFields(value));
                onSuccess && onSuccess();
            } catch (e) {
                onFail && onFail(e);
            }
        },

        /**
         * 批量插入一组数据
         * @param {Object} dataObject
         * @param {Function} onSuccess
         * @param {Function} onFail
         */
        setBatch: function(dataObject, onSuccess, onFail) {
            try {
                for(var key in dataObject) {
                    DB.setItem(this._getKey(key), this._mapFields(dataObject[key]));
                }
                onSuccess && onSuccess();
            } catch (e) {
                onFail && onFail(e);
            }
        },

        /**
         * 删除一项数据
         * @param {String|Number} key
         * @param {Function} onSuccess
         * \@\param {Function} onFail
         */
        remove: function(key, onSuccess) {
            DB.removeItem(this._getKey(key));
            onSuccess && onSuccess();
        },

        /**
         * 批量删除一组数据
         * @param {Array} keys
         * @param {Function} onSuccess
         * \@\param {Function} onFail
         */
        removeBatch: function(keys, onSuccess) {
            var _this = this;
            keys.forEach(function(key) {
                _this.remove(key);
            });

            onSuccess && onSuccess();
        },

        /**
         * 获取所有的数据
         * @param {Function} onSuccess
         * \@\param {Function} onFail
         */
        all: function(onSuccess) {
            this.getBatch(this._getAllKeys(), onSuccess);
        },

        /**
         * 清空所有数据
         * @param {Function} onSuccess
         * \@\param {Function} onFail
         */
        clear: function(onSuccess) {
            this.removeBatch(this._getAllKeys(), onSuccess);
        },

        /**
         * 删除表
         * @param {Function} onSuccess
         * \@\param {Function} onFail
         */
        "delete": function(onSuccess) {
            this.clear(onSuccess);
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

    global.LocalStorage = LocalStorage;
})(this.WebDB || this);
