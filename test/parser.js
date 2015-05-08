var assert = require('assert');
var parser = require('../');


describe('HTML2Jsx', function() {
    it('should return attributes', function(done) {
        parser('<h1 foo="beep">Hello World</h1>', function(err, jsx) {
            if (err) return done(err);
            assert.equal(jsx, 'React.createElement("h1", { "foo": "beep"}, [ "Hello World" ])', 'success')
            done();
        })
    });

    it('should return children', function(done) {
        parser('<p>Hello\n<b>World</b></p>', function(err, jsx) {
            if (err) return done(err);
            assert.equal(jsx, 'React.createElement("p", null, [ "Hello\\n", React.createElement("b", null, [ "World" ]) ])', 'success')
            done();
        })
    });

    it('should handle correctly pre', function(done) {
        parser('<pre>Hello\nWorld</pre>', function(err, jsx) {
            if (err) return done(err);
            assert.equal(jsx, 'React.createElement("pre", null, [ "Hello\\nWorld" ])', 'success')
            done();
        })
    });
});

