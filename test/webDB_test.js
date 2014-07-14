describe('webDB', function() {
    var webDB = new window.WebDB('test', 'id,name'.split(','));
    var KEY = '1',
        KEY_EXT = '2',
        VALUE = {
            id: 1,
            name: 'text'
        },
        VALUE_EXT = {
            id: 1
        },
        VALUE_EXT_MORE = {
            id: 1,
            name: 'text',
            c: 'dd'
        }
        DATA_OBJECT = {};
    DATA_OBJECT[KEY] = VALUE;
    DATA_OBJECT[KEY_EXT] = VALUE_EXT;

    describe('#clear()', function() {
        it('Should be clear success', function(done) {
            webDB.clear(function() {
                done();
            });
        });
    });


    describe('#set()', function() {
        it('Should be insert success', function(done) {
            webDB.set(KEY, VALUE, function() {
                done()
            });
        });

        it('Result should be changed.', function(done) {
            webDB.set(KEY, VALUE_EXT, function() {
                done();
            });
        });
    });

    describe('#setBatch()', function() {
        it('Should be insert success', function(done) {
            webDB.setBatch(DATA_OBJECT, function() {
                done();
            })
        })
    });

    describe('Fields', function() {


        it('Should be set success, value is ' + JSON.stringify(VALUE_EXT_MORE), function(done) {
            webDB.set(KEY, VALUE_EXT_MORE, function() {
                done();
            });
        });

        it('Result fields should be only id and name', function(done) {
            webDB.get(KEY, function(result) {
                result.should.eql(VALUE);
                done();
            })
        });
    })

    describe('#get()', function() {
        it('Should be equal to ' + JSON.stringify(VALUE_EXT), function(done) {
            webDB.get(KEY_EXT, function(result) {
                result.should.eql(VALUE_EXT);
                done();
            });
        });

        it('Should be null.', function(done) {
            webDB.get(KEY + '_none', function(result) {
                Should(result).be.exactly(null);
                done();
            });
        });
    });

    describe('#getBatch()', function(done) {
        it('Should be equal to ' + JSON.stringify(DATA_OBJECT), function(done) {
            webDB.getBatch(Object.keys(DATA_OBJECT), function(dataObject) {
                dataObject.should.eql(DATA_OBJECT);
                done();
            })
        })
    });

    describe('#all()', function() {
        it('Should be equal to ' + JSON.stringify(DATA_OBJECT), function(done) {
            webDB.all(function(dataObject) {
                dataObject.should.eql(DATA_OBJECT);
                done();
            });
        });
    });

    describe('#filter()', function() {
        var obj = {};
        obj[KEY_EXT] = VALUE_EXT;
        it('Should be equal to ' + JSON.stringify(obj), function(done) {
            webDB.filter(function(item) {
                return !item.hasOwnProperty('name');
            }, function(result) {
                result.should.eql(obj);
                done();
            });
        });
    });

    describe('#remove()', function() {
        it('Should be remove success', function(done) {
            webDB.remove(KEY, function() {
                done();
            });
        });
    })

    describe('#removeBatch()', function() {
        it('Should be remove success include nonexistent key.', function(done) {
            webDB.remove(Object.keys(DATA_OBJECT), function() {
                done();
            });
        });
    });

    describe('#delete()', function() {
        it('Should be delete success', function(done) {
            webDB.delete(function() {
                done();
            })
        });
    });
});

describe('webDB() With No Fields', function() {
    var webDB = window.WebDB('test2'),
        key = 2;
    var obj = {
        id: 1,
        c: 2
    };
    var obj2 = {
        id: 2,
        f: 2
    }
    it('should be set success.', function(done) {
        webDB.set(key, obj, function() {
            done();
        });
    });
    it('Result should ' + JSON.stringify(obj), function(done) {
        webDB.get(key, function(result) {
            result.should.eql(obj);
            done();
        });
    });
    it('should be set success for insert different value.', function(done) {
        webDB.set(key, obj2, function() {
            done();
        });
    });
    it('Result should ' + JSON.stringify(obj2), function(done) {
       webDB.get(key, function(result) {
           result.should.eql(obj2);
           done();
       });
    });
});

describe('webDB() With No cName', function() {
    var webDB = window.WebDB(),
        key = 2;
    var obj = {
        id: 1,
        c: 2
    };
    var obj2 = {
        id: 2,
        f: 2
    }
    it('should be set success.', function(done) {
        webDB.set(key, obj, function() {
            done();
        });
    });
    it('Result should ' + JSON.stringify(obj), function(done) {
        webDB.get(key, function(result) {
            result.should.eql(obj);
            done();
        });
    });
    it('should be set success for insert different value.', function(done) {
        webDB.set(key, obj2, function() {
            done();
        });
    });
    it('Result should ' + JSON.stringify(obj2), function(done) {
        webDB.get(key, function(result) {
            result.should.eql(obj2);
            done();
        });
    });
});