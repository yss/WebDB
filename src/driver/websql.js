/**
 * 这里是websql的封装
 */

(function(global) {
    "use strict";
    var DB;
    var EXECUTE_SQL = 'executeSql';

    var _executeSql = function(tx, sql, params, onSuccess, onFail) {
        if (tx && EXECUTE_SQL in tx) {
            console.info('[SQL]' + sql);
            tx[EXECUTE_SQL](sql, params, function(tx, result) {
                onSuccess && onSuccess(tx, result);
            }, function(tx, e) {
                onFail && onFail(tx, e);
            });
        } else {
            DB.transaction(function(tx) {
                _executeSql(tx, sql, params, onSuccess, onFail);
            });
        }
    };

    var _onEvent = function(eventFn) {
        return function(tx, result) {
            eventFn && eventFn(result);
        }
    };

    var _execute = function(sql, onSuccess, onFail) {
        _executeSql(null, sql, [], _onEvent(onSuccess), _onEvent(onFail))
    };

    /**
     * 数据库
     * @param {String} [cName] 在indexeddb中叫集合名，websql中叫表名 default: _local_
     * @param {Array} [fields] 一个集合或表中的所有字段 default: []
     * @param {Number} [maxSize] 最大存储空间，默认 200M 即：200 * 1024 * 1024
     * @return {this}
     * @constructor
     */
    function WebSql(cName, fields, maxSize) {
        this.cName = cName;
        this.fields = fields;
        this.maxSize = maxSize;

        this._create();
        return this;
    }

    WebSql.prototype = {
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
                        storeObj[fields[i]] = obj[fields[i]];
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
            var sql = "CREATE TABLE IF NOT EXISTS `" + this.cName + '` (key TEXT PRIMARY KEY, value TEXT)';
            if (!DB) {
                DB = openDatabase('DB', '1.0', 'Database', this.maxSize);
            }

            _execute(sql);
        },

        /**
         * 查询数据库
         * @param {null|Object} conditions
         * @param {Function} onSuccess
         * @param {Function} onFail
         * @param {Transaction} tx
         * @private
         */
        _find: function(conditions, onSuccess, onFail, tx) {
            var k, con = [], sql;
            for (k in (conditions || {})) {
                con.push(k.toUpperCase() + ' ' + conditions[k]);
            }
            sql = "SELECT * FROM `" + this.cName + "` " + con.join(" ");

            _executeSql(tx, sql, [], _onEvent(onSuccess), _onEvent(onFail));
        },

        /**
         * 获取单个数据
         * @param {String|Number} key
         * @param {Function} onSuccess
         * @param {Function} onFail
         */
        get: function(key, onSuccess, onFail) {
            this.getBatch([key], function(dataObject) {
                onSuccess && onSuccess(dataObject[key] || null);
            }, onFail);
        },

        /**
         * 批量获取数据
         * @param {Array} keys
         * @param {Function} onSuccess
         * @param {Function} onFail
         */
        getBatch: function(keys, onSuccess, onFail) {
            var _this = this;
            _this._find({ where: "key IN ('" + keys.join("','") + "')" }, function(result) {
                onSuccess && onSuccess(_this._dealResult(result.rows));
            }, onFail, null);
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
            var obj = {};
            obj[key] = value;
            this.setBatch(obj, onSuccess, onFail);
        },

        /**
         * 批量插入一组数据
         * @param {Object} dataObject
         * @param {Function} onSuccess
         * @param {Function} onFail
         */
        setBatch: function(dataObject, onSuccess, onFail) {
            var sqlArr = ["INSERT OR REPLACE INTO `" + this.cName + "`(key, value) SELECT '"],
                _this = this;

            Object.keys(dataObject).forEach(function(key, i) {
                if (i === 0) {
                    sqlArr.push(key, "' as 'column1', '", _this._mapFields(dataObject[key]), "' as 'column2'");
                } else {
                    sqlArr.push(" UNION SELECT '", key, "', '", _this._mapFields(dataObject[key]), "'");
                }
            });

            _execute(sqlArr.join(''), onSuccess, onFail);
        },

        /**
         * 删除一项数据
         * @param {String|Number} key
         * @param {Function} onSuccess
         * @param {Function} onFail
         */
        remove: function(key, onSuccess, onFail) {
            this.removeBatch([key], onSuccess, onFail);
        },

        /**
         * 批量删除一组数据
         * @param {Array} keys
         * @param {Function} onSuccess
         * @param {Function} onFail
         */
        removeBatch: function(keys, onSuccess, onFail) {
            var sql = "DELETE FROM `" + this.cName + "` WHERE key IN ('" + keys.join("', '") + "')";

            _execute(sql, onSuccess, onFail);
        },

        /**
         * 获取所有的数据
         * @param {Function} onSuccess
         * @param {Function} onFail
         */
        all: function(onSuccess, onFail) {
            var _this = this;
            _this._find(null, function(result) {
                onSuccess && onSuccess(_this._dealResult(result.rows));
            }, onFail);
        },

        /**
         * 清空所有数据
         * @param {Function} onSuccess
         * @param {Function} onFail
         */
        clear: function(onSuccess, onFail) {
            var sql = "DELETE FROM `" + this.cName + "`";
            _execute(sql, onSuccess, onFail);
        },

        /**
         * 删除表
         * @param {Function} onSuccess
         * @param {Function} onFail
         */
        "delete": function(onSuccess, onFail) {
            var sql = "DROP TABLE IF EXISTS `" + this.cName + "`";
            _execute(sql, onSuccess, onFail);
        },

        /**
         * 过滤内容，类似Array.filter
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

    global.WebSql = WebSql;

})(this.WebDB || this);