var assert = require('assert');
var parser = require('../');


describe('HTML2Jsx', function() {
    it('should return attributes', function(done) {
        parser('<h1 foo="beep">Hello World</h1>', function(err, jsx) {
            if (err) return done(err);
            assert.equal(jsx, 'React.createElement("h1", { "foo": "beep" }, [ "Hello World" ])');
            done();
        })
    });

    it('should return children', function(done) {
        parser('<p>Hello\n<b>World</b></p>', function(err, jsx) {
            if (err) return done(err);
            assert.equal(jsx, 'React.createElement("p", null, [ "Hello\\n", React.createElement("b", null, [ "World" ]) ])');
            done();
        })
    });

    it('should handle correctly pre', function(done) {
        parser('<pre>Hello\nWorld</pre>', function(err, jsx) {
            if (err) return done(err);
            assert.equal(jsx, 'React.createElement("pre", null, [ "Hello\\nWorld" ])');
            done();
        })
    });

    it('should use className instead of class', function(done) {
        parser('<div class="test">Hello</div>', function(err, jsx) {
            if (err) return done(err);
            assert.equal(jsx, 'React.createElement("div", { "className": "test" }, [ "Hello" ])');
            done();
        })
    });

    it('should accept custom components', function(done) {
        parser('<p>This is some math: <TeX>a = b + 1</TeX></p>', {
            components: ['TeX']
        }, function(err, jsx) {
            if (err) return done(err);
            assert.equal(jsx, 'React.createElement("p", null, [ "This is some math: ", React.createElement(TeX, null, [ "a = b + 1" ]) ])');
            done();
        })
    });
});

