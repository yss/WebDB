(function (name, definition, global) {
    if (typeof define === 'function') {
        define(name, [], definition);
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = definition();
    } else {
        global[name] = definition();
    }
})('WebDB', function() {
    var _collections = {};
    /**
     * 数据库
     * @param {String} [cName] 在indexeddb中叫集合名，websql中叫表名 default: _local_
     * @param {Array} [fields] 一个集合或表中的所有字段 default: []
     * @param {Number} [maxSize] 最大存储空间，默认 200M 即：200 * 1024 * 1024
     * @return {this}
     */
    return function(cName, fields, maxSize) {
        if (_collections.hasOwnProperty(cName)) {
            return _collections[cName];
        }
        var db;
        cName = cName || '_local_';
        fields = fields || [];
        maxSize = maxSize || 200 * 1024 * 1024;
        try {
            db = new WebDB.IndexedDB(cName, fields, maxSize);
        } catch (e) {
            try {
                db = new WebDB.WebSql(cName, fields, maxSize);
            } catch (e) {
                db = new WebDB.LocalStorage(cName, fields, maxSize);
            }
        }

        return (_collections[cName] = db);
    }
}, this);