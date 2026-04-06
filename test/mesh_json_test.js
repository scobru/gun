var expect = require('./expect');

describe('Mesh JSON Fallback', function() {
	var Mesh;

	before(function() {
		// Ensure we test the internal fallback in src/mesh.js
		// by temporarily removing JSON.stringifyAsync if it exists.
		this.oldStringifyAsync = JSON.stringifyAsync;
		delete JSON.stringifyAsync;

		// Clear cache to ensure src/mesh.js is reloaded with JSON.stringifyAsync missing
		delete require.cache[require.resolve('../src/mesh')];
		Mesh = require('../src/mesh');
	});

	after(function() {
		JSON.stringifyAsync = this.oldStringifyAsync;
	});

	it('should catch circular reference errors in the fallback json function via Mesh.raw', function(done) {
		var sayCalled = false;
		var root = {
			opt: {
				log: function() {}
			},
			dup: {
				check: function() {},
				track: function() { return { via: {} } },
				s: {}
			},
			on: function() {}
		};

		var mesh = Mesh(root);

		// Override mesh.say to check if it's called
		mesh.say = function() {
			sayCalled = true;
		};

		var circular = {};
		circular.self = circular;

		// mesh.raw calls json(msg, res)
		// res(err, raw) returns early if err is truthy.
		mesh.raw(circular, {});

		// Since it's synchronous in our fallback, we can check immediately.
		expect(sayCalled).to.be(false);
		done();
	});

	it('should handle errors in mesh.hash fallback', function(done) {
		var sayCalled = false;
		var root = {
			opt: {
				log: function() {}
			},
			dup: {
				check: function() {},
				track: function() { return { via: {} } },
				s: {}
			},
			on: function() {}
		};

		var mesh = Mesh(root);
		mesh.say = function() {
			sayCalled = true;
		};

		var circular = {};
		circular.self = circular;

		var msg = {
			put: circular,
			'#': 'test',
			'_': {}
		};

		// mesh.hash calls json(msg.put, function hash(err, text){ ... })
		// In src/mesh.js:
		// json(msg.put, function hash(err, text){
		//    var ss = (s || (s = t = text||'')).slice(0, 32768);
		//    ...
		//    mesh.say(msg, peer);
		// }, sort);
		// If 'err' is present, 'text' will be undefined.
		// text||'' will be ''.
		// It will still call mesh.say with empty hash?
		// Actually mesh.say might be called with '##' = String.hash('', h)

		mesh.hash(msg, {});

		// We expect it NOT to crash.
		expect(msg['##']).to.be.a('number');
		expect(sayCalled).to.be(true);
		done();
	});
});
