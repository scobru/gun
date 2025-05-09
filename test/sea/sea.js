const exp = require('constants');
const expect = require('../expect');
const SeaArray = require('../../sea/array.js');

var root;
var Gun;
(function(){
  var env;
  if(typeof global !== 'undefined'){ env = global }
  if(typeof window !== 'undefined'){ env = window }
  root = env.window? env.window : global;
  try{ env.window && root.localStorage && root.localStorage.clear() }catch(e){}
  //try{ indexedDB.deleteDatabase('radatatest') }catch(e){}
  if(root.Gun){
    root.Gun = root.Gun;
    root.Gun.TESTING = true;
  } else {
    try{ require('fs').unlinkSync('data.json') }catch(e){}
    try{ require('../../lib/fsrm')('radatatest') }catch(e){}
    root.Gun = require('../../gun');
    root.Gun.TESTING = true;
    require('../../lib/store');
    require('../../lib/rfs');
  }

  try{ var expect = global.expect = require("../expect") }catch(e){}

  if(!root.Gun.SEA){
    require('../../sea.js');
  }
}(this));


;(function(){
Gun = root.Gun
var SEA = Gun.SEA
if(!SEA){ return }

describe('SEA', function(){
  this.timeout(1000 * 9);
  var user;
  var gun;
  var pub;

  var prep = async function(d,k, n,s){ return {'#':s,'.':k,':': await SEA.opt.parse(d),'>':Gun.state.is(n, k)} }; // shim for old - prep for signing.
  var pack = function(d,cb,k, n,s){ return new Promise(function(res, rej){ SEA.opt.pack(d, function(r){ res(r) }, k,n,s) }) }; // make easier to upgrade test, cb to await
  describe('Utility', function(){
    it('deleting old SEA tests (may take long time)', function(done){
        done(); // Mocha doesn't print test until after its done, so show this first.
    });
    it('deleted', function(done){
        this.timeout(60 * 1000);
        if(!Gun.window){ return done() }
        indexedDB.deleteDatabase('radatatest').onsuccess = function(e){ done() }
    });
    /*it('generates aeskey from jwk', function(done) { // DEPRECATED!!!
      console.log("WARNING: THIS DOES NOT WORK IN BROWSER!!!! NEEDS FIX");
      SEA.opt.aeskey('x','x').then(k => {
        //console.log("DATA", k.data);
        expect(k.data.toString('base64')).to.be('Xd6JaIf2dUybFb/jpEGuSAbfL96UABMR4IvxEGIuC74=')
        done()
      })
    })*/
    it('quickstart', function(done){
      SEA.pair(function(pair){
      SEA.encrypt('hello self', pair, function(enc){
      SEA.sign(enc, pair, function(data){
      SEA.verify(data, pair.pub, function(msg){
      SEA.decrypt(msg, pair, function(dec){
      expect(dec).to.be('hello self');
      SEA.work(dec, pair, function(proof){
      SEA.work('hello self', pair, function(check){
      expect(proof).to.be(check);
      SEA.pair(function(alice){
      SEA.pair(function(bob){
      SEA.secret(bob.epub, alice, function(aes){
      SEA.encrypt('shared data', aes, function(enc){
      SEA.secret(alice.epub, bob, function(aes){
      SEA.decrypt(enc, aes, function(dec){
      expect(dec).to.be('shared data');
      done();
      });});});});});});});});});});});});});
    })

    it('quickwrong', function(done){
      SEA.pair(function(alice){
      SEA.pair(function(bob){
      SEA.sign('asdf', alice, function(data){
      SEA.verify(data, bob.pub, function(msg){
      expect(msg).to.be(undefined);
      SEA.verify(data.slice(0,20)+data.slice(21), alice.pub, function(msg){
      expect(msg).to.be(undefined);
      SEA.encrypt('secret', alice, function(enc){
      SEA.decrypt(enc, bob, function(dec){
      expect(dec).to.be(undefined);
      SEA.decrypt(enc.slice(0,20)+enc.slice(21), alice, function(dec){
      expect(dec).to.be(undefined);
      done();
      });});});});});});});});
    })

    it('types', function(done){
      var pair, s, v;
      SEA.pair(function(pair){
      SEA.sign(null, pair, function(s){
      SEA.verify(s, pair, function(v){
      expect(null).to.be(v);
      SEA.sign(true, pair, function(s){
      SEA.verify(s, pair, function(v){
      expect(true).to.be(v);
      SEA.sign(false, pair, function(s){
      SEA.verify(s, pair, function(v){
      expect(false).to.be(v);
      SEA.sign(0, pair, function(s){
      SEA.verify(s, pair, function(v){
      expect(0).to.be(v);
      SEA.sign(1, pair, function(s){
      SEA.verify(s, pair, function(v){
      expect(1).to.be(v);
      SEA.sign(1.01, pair, function(s){
      SEA.verify(s, pair, function(v){
      expect(1.01).to.be(v);
      SEA.sign('', pair, function(s){
      SEA.verify(s, pair, function(v){
      expect('').to.be(v);
      SEA.sign('a', pair, function(s){
      SEA.verify(s, pair, function(v){
      expect('a').to.be(v);
      SEA.sign([], pair, function(s){
      SEA.verify(s, pair, function(v){
      expect([]).to.eql(v);
      SEA.sign([1], pair, function(s){
      SEA.verify(s, pair, function(v){
      expect([1]).to.eql(v);
      SEA.sign({}, pair, function(s){
      SEA.verify(s, pair, function(v){
      expect({}).to.eql(v);
      SEA.sign({a:1}, pair, function(s){
      SEA.verify(s, pair, function(v){
      expect({a:1}).to.eql(v);
      SEA.sign(JSON.stringify({a:1}), pair, function(s){
      SEA.verify(s, pair, function(v){
      expect({a:1}).to.eql(v);
      done();
      });});});});});});});});});});});});});});});});});});});});});});});});});});});
    })

    it('atypes', function(done){
      var pair, s, v;
      SEA.pair(function(pair){
      SEA.encrypt(null, pair, function(s){
      SEA.decrypt(s, pair, function(v){
      expect(null).to.be(v);
      SEA.encrypt(true, pair, function(s){
      SEA.decrypt(s, pair, function(v){
      expect(true).to.be(v);
      SEA.encrypt(false, pair, function(s){
      SEA.decrypt(s, pair, function(v){
      expect(false).to.be(v);
      SEA.encrypt(0, pair, function(s){
      SEA.decrypt(s, pair, function(v){
      expect(0).to.be(v);
      SEA.encrypt(1, pair, function(s){
      SEA.decrypt(s, pair, function(v){
      expect(1).to.be(v);
      SEA.encrypt(1.01, pair, function(s){
      SEA.decrypt(s, pair, function(v){
      expect(1.01).to.be(v);
      SEA.encrypt('', pair, function(s){
      SEA.decrypt(s, pair, function(v){
      expect('').to.be(v);
      SEA.encrypt('a', pair, function(s){
      SEA.decrypt(s, pair, function(v){
      expect('a').to.be(v);
      SEA.encrypt([], pair, function(s){
      SEA.decrypt(s, pair, function(v){
      expect([]).to.eql(v);
      SEA.encrypt([1], pair, function(s){
      SEA.decrypt(s, pair, function(v){
      expect([1]).to.eql(v);
      SEA.encrypt({}, pair, function(s){
      SEA.decrypt(s, pair, function(v){
      expect({}).to.eql(v);
      SEA.encrypt({a:1}, pair, function(s){
      SEA.decrypt(s, pair, function(v){
      expect({a:1}).to.eql(v);
      SEA.encrypt(JSON.stringify({a:1}), pair, function(s){
      SEA.decrypt(s, pair, function(v){
      expect({a:1}).to.eql(v);
      done();
      });});});});});});});});});});});});});});});});});});});});});});});});});});});
    })
    
    /*it('DOESNT DECRYPT SCIENTIFIC NOTATION', function(done){
      var pair, s, v;
      SEA.pair(function(pair){
      SEA.encrypt('4e2', pair, function(s){
      SEA.decrypt(s, pair, function(v){
      expect(400).to.be(v);
      done();
      });});});
    })*/

    it('hash array buffer', function(done) {
      (async function() {
        // Create a random ArrayBuffer (buffer 1)
        var buff1 = new ArrayBuffer(16);
        var view1 = new Uint8Array(buff1); // Use a Uint8Array to modify the buffer
        for (var i = 0; i < view1.length; i++) {
          view1[i] = Math.floor(Math.random() * 256);
        }
        var hash1 = await SEA.work(buff1, "salt");
    
        // Create another random ArrayBuffer (buffer 2)
        var buff2 = new ArrayBuffer(16);
        var view2 = new Uint8Array(buff2);
        for (var i = 0; i < view2.length; i++) {
          view2[i] = Math.floor(Math.random() * 256);
        }
        var hash2 = await SEA.work(buff2, "salt");
    
        // Ensure the hashes are strings and different from each other
        expect(typeof hash1 === "string" && typeof hash2 === "string" && hash1 !== hash2).to.be(true);
        done(); // Signal that the test is complete
      })();
    });
    
    it('legacy', function(done){ (async function(){
      var pw = 'test123';
      // https://cdn.jsdelivr.net/npm/gun@0.9.99999/sea.js !
      var old = JSON.parse(atob("eyJfIjp7IiMiOiJ+TkJhdDdKeUk0REw1ZDlPMEZNbWVFN0RacVZRZUVPblhKcldycDVUUGlyMC5PckV6WVIwc3h0NHRtV0tiajFQdHRaeW1HUmdyc1FVVDNHaTk1UE9vMUdBIiwiPiI6eyJwdWIiOjEsImFsaWFzIjoxLCJlcHViIjoxLCJhdXRoIjoxfX0sInB1YiI6Ik5CYXQ3SnlJNERMNWQ5TzBGTW1lRTdEWnFWUWVFT25YSnJXcnA1VFBpcjAuT3JFellSMHN4dDR0bVdLYmoxUHR0WnltR1JncnNRVVQzR2k5NVBPbzFHQSIsImFsaWFzIjoiU0VBe1wibVwiOlwiXFxcImJvYlxcXCJcIixcInNcIjpcIt4uXFx1MDAwNCpbcECT/sxe83eYe/M+bmBF+q5dQr7eYELndMJkXFx1MDAwYlxcbtFu6HNWUKh6XFxyfrWqwcRcXHUwMDE1e3BMv2poWlxcYktcXHUwMDEzZ5H/Z5VcIn0iLCJlcHViIjoiU0VBe1wibVwiOlwiXFxcIkdJUGY2dl8zeV9DZUpQMWtFZkt2OWpmZ3QwT2ZGeDRycHBKS01wSE9MLVEuTmM2dElDUlpwbGwxMG45V2NsRzhXNC1tdDFXZnI2cmh3c0JyN1pRTlduY1xcXCJcIixcInNcIjpcIlxcdTAwMTZcXHUwMDAwzVxcdTAwMGahrvVcXHUwMDBm9y77iP1V3IhkWOajKMxcXHUwMDEy/VxcdTAwMDHN+VxcbozxNWRcXHUwMDA1Zej5XFx1MDAwMpSOXFx1MDAwNny4IclB+lxcdTAwMWTgoXnR8S1OyuZcXHUwMDAx9PqwXFxiXFx1MDAwMFF3XCJ9IiwiYXV0aCI6IlNFQXtcIm1cIjpcIntcXFwiZWtcXFwiOlxcXCJTRUF7XFxcXFxcXCJjdFxcXFxcXFwiOlxcXFxcXFwiXFxcXFxcXFx1MDAwMGvAI6W0L03DwFxcXFxcXFxcdTAwMDZcXFxcXFxcXHUwMDA0ZibqQdE0XFxcXFxcXFx1MDAxY4VvtTZcXFxcXFxcXG7xXfBcXFxcXFxcXHUwMDAzo5xcXFxcXFxcXHUwMDE3XFxcXFxcXFx1MDAwMf9PXFxcXFxcXFx1MDAxMJhnXFxcXFxcXFx1MDAwNccti2pifouBhtu7qcw4/mPs1SHS4uyBTo1RTuReXFxcXFxcXFx1MDAxMK9W4clcXFxcXFxcXHUwMDBmYt1oSIRcXFxcXFxcXHUwMDE4PF5gxoRS2UYtV/1LwHn1SlxcXFxcXFxcXFxcXFxcXFyYuFU3cUVf09/AXFxcXFxcXFx1MDAwZlxcXFxcXFxcdTAwMDRQN8RlXFxcXFxcXFx1MDAwNlxcXFxcXFxcdTAwMGXM4G3fXFxcXFxcXFx1MDAxZt+eRoV9XFxcXFxcXCIsXFxcXFxcXCJpdlxcXFxcXFwiOlxcXFxcXFwiVU5Lv+Zko1xcXFxcXFxcdTAwMDOt1ET2JHhcXFxcXFxcXHUwMDE1/1xcXFxcXFwiLFxcXFxcXFwic1xcXFxcXFwiOlxcXFxcXFwiz0VOO9GwaJlcXFxcXFxcIn1cXFwiLFxcXCJzXFxcIjpcXFwiZ0F4TFJpa2dEakIzbXJDNGpucUFRak5NNEZXemF0a1Eyb2xDR2Z5TTc2amg3azNEUzAyRlp1MEV1eWg2RGFITlxcXCJ9XCIsXCJzXCI6XCKze+BcXHUwMDBilPlcXHUwMDA2z1srodVcXHUwMDA0P1xcXCJcXFwib2rndUadtqJcXHUwMDE2bFtf0PSvJNdcXHUwMDE2Y71nnlxcdTAwMWOZXFx1MDAwN1xcdTAwMTlcXHUwMDE36NZcXHUwMDA0Uk7DQK/y/oixrIr1XFx1MDAxZnVcXHUwMDE3oCBhXCJ9In0="));
      var okey = {"pub":"NBat7JyI4DL5d9O0FMmeE7DZqVQeEOnXJrWrp5TPir0.OrEzYR0sxt4tmWKbj1PttZymGRgrsQUT3Gi95POo1GA","epub":"GIPf6v_3y_CeJP1kEfKv9jfgt0OfFx4rppJKMpHOL-Q.Nc6tICRZpll10n9WclG8W4-mt1Wfr6rhwsBr7ZQNWnc","priv":"leIA-BOFLECsOOdT_B8B0s1Ii0VHZZGlHz8q_dK-xLs","epriv":"1BTJpYdwSLesrtuB7pYQdsrFHsxKSJ-d9PXt2qp6NyQ"}
      var auth = await SEA.verify(old.auth, old.pub);
      var proof = await SEA.work(pw, auth.s, null, {encode: 'utf8'});
      var dec = await SEA.decrypt(auth.ek, proof, null);
      expect(dec.priv).to.be(okey.priv);
      expect(dec.epriv).to.be(okey.epriv);

      var gun = Gun({super: true}), tmp = old._['#'];
      var graph = {};
      gun._.graph[tmp] = graph[tmp] = old;
      var alias = await SEA.verify(old.alias, false);
      expect(alias).to.be('bob');
      alias = Gun.state.ify({}, tmp, 1, {'#': tmp}, tmp = '~@'+alias);
      graph[tmp] = alias;
      gun._.graph[tmp] = alias;//gun.on('test', {$: gun, put: graph});
      var use = gun.user();
      use.auth('bob', 'test123', function(ack){
        expect(ack.err).to.not.be.ok();
        done();
      });
    }())});
    
    it('legacy []', function(done){ (async function(){
      var pw = 'test123';
      // https://cdn.jsdelivr.net/npm/gun@0.9.99999/sea.js !
      var old = JSON.parse(atob("eyJfIjp7IiMiOiJ+VThkS0dySFJhX01sMFZ1YlR5OUZBYTlQS1ZlYlh0eTFjS05zWWxnYjduNC5QeVd5cUVVb0ZpYVduUElOV0Nad0xBbzFobjN1MldPWTU3SzZHZnpsNjhVIiwiPiI6eyJwdWIiOjE1NDY5MDI1MDQ5NzksImFsaWFzIjoxNTQ2OTAyNTA0OTc5LCJlcHViIjoxNTQ2OTAyNTA0OTc5LCJhdXRoIjoxNTQ2OTAyNTA0OTc5fX0sInB1YiI6IlU4ZEtHckhSYV9NbDBWdWJUeTlGQWE5UEtWZWJYdHkxY0tOc1lsZ2I3bjQuUHlXeXFFVW9GaWFXblBJTldDWndMQW8xaG4zdTJXT1k1N0s2R2Z6bDY4VSIsImFsaWFzIjoiU0VBe1wibVwiOltcIn5VOGRLR3JIUmFfTWwwVnViVHk5RkFhOVBLVmViWHR5MWNLTnNZbGdiN240LlB5V3lxRVVvRmlhV25QSU5XQ1p3TEFvMWhuM3UyV09ZNTdLNkdmemw2OFVcIixcImFsaWFzXCIsXCJhbGljZVwiLDE1NDY5MDI1MDQ5NzldLFwic1wiOlwienpuaGtIZjhZdFpZM2lGd3FVd0lJUldMTjhZMmlHbmNkcnVTaStGNDNmU1BLYWpSZlI0VzhXVHM4bElSMDBndGJmTWJxS0NjQkpGN3VNSkdGRC9WV2c9PVwifSIsImVwdWIiOiJTRUF7XCJtXCI6W1wiflU4ZEtHckhSYV9NbDBWdWJUeTlGQWE5UEtWZWJYdHkxY0tOc1lsZ2I3bjQuUHlXeXFFVW9GaWFXblBJTldDWndMQW8xaG4zdTJXT1k1N0s2R2Z6bDY4VVwiLFwiZXB1YlwiLFwiRkRzM1VvNTNFZEp6eFNocEpDaVctRGZPQ3lUS0M2U3cxeS1PZVJxam5ZRS5xVGdyYTlFQk1maEpNdVlMVmNaejRZYklLRm85enNBMHpMcV82dEVPMHI0XCIsMTU0NjkwMjUwNDk3OV0sXCJzXCI6XCJPZzRVVjY4OTluSjE4dC9ybWVnV0lkdnNqN01KaEpFc29ranZYQmdteVVRUXVNVjFTdnh4cXJqOFoyV1o2Q25XSkZnTlVDbEVYYWxuMURjUFE3M1R6UT09XCJ9IiwiYXV0aCI6IlNFQXtcIm1cIjpbXCJ+VThkS0dySFJhX01sMFZ1YlR5OUZBYTlQS1ZlYlh0eTFjS05zWWxnYjduNC5QeVd5cUVVb0ZpYVduUElOV0Nad0xBbzFobjN1MldPWTU3SzZHZnpsNjhVXCIsXCJhdXRoXCIsXCJ7XFxcImVrXFxcIjpcXFwiU0VBe1xcXFxcXFwiY3RcXFxcXFxcIjpcXFxcXFxcIi94ZnNPdVNkQUtrNkJiR00zbUV6MnVlSjI3Y0tJNThYMEtUL1FsaExSZXpWcjRkNzVZb2M5QlZNRjkzejl4QXI4N080S2FDNjJUWGVoeERQN0FFa2V4N1paaEpYL2hsVm9kK1FIcVFaaUZMK2lVQzFvL2hpUEJGWElBZmtINGRrcklGOFdqcEVaU3NIVmRSOVRhY2ZzbTB3aHN5NGJXN1ZLSEUySGc9PVxcXFxcXFwiLFxcXFxcXFwiaXZcXFxcXFxcIjpcXFxcXFxcIjhWekduTStEc1lTUktIU3Z4cSszTGc9PVxcXFxcXFwiLFxcXFxcXFwic1xcXFxcXFwiOlxcXFxcXFwibVVSSlJ4TzUvdXM9XFxcXFxcXCJ9XFxcIixcXFwic1xcXCI6XFxcImE1SlA3VFpuVE9jYjEwMGJOejlscEU4dnpqcUE3TWl0NHcwN3pjQTdIOFV0bml1WnVHSmdpZnNNQlFNSGdRdE5cXFwifVwiLDE1NDY5MDI1MDQ5NzldLFwic1wiOlwiSGFzMytJaHFEZTYyN016cElXZVE1cVFrZ2NOMlk3WHRpNGw0TFU3T2JyaktxSlBnSllrVWE2bk9YdlRmQkFzV1BPVzVnemh4Q2RPVGNFQm5icWlpWXc9PVwifSJ9"));
      var okey = {"pub":"U8dKGrHRa_Ml0VubTy9FAa9PKVebXty1cKNsYlgb7n4.PyWyqEUoFiaWnPINWCZwLAo1hn3u2WOY57K6Gfzl68U","epub":"FDs3Uo53EdJzxShpJCiW-DfOCyTKC6Sw1y-OeRqjnYE.qTgra9EBMfhJMuYLVcZz4YbIKFo9zsA0zLq_6tEO0r4","priv":"jMy7WfcldJ4esZEijAj4LTb99smtY_H0yKJLemJl2HI","epriv":"1DszMh-85pGTPLYtRunG-Q-xB78AE4k07PPkbedYYwk"}

      var gun = Gun({super: true}), tmp = old._['#'];//Gun.node.soul(old);
      var graph = {};
      gun._.graph[tmp] = graph[tmp] = old;
      var alias = SEA.opt.unpack(await SEA.verify(old.alias, false), 'alias', old);
      expect(alias).to.be('alice');
      alias = Gun.state.ify({}, tmp, 1, {'#': tmp}, tmp = '~@'+alias);
      gun._.graph[tmp] = alias;
      //gun.on('test', {$: gun, put: graph});
      var use = gun.user();
      use.auth('alice', 'test123', function(ack){
        expect(ack.err).to.not.be.ok();
        done();
      });
    }())})

    it('JSON escape', function(done){ (async function(){
      var plain = "hello world";
      var json = JSON.stringify({hello:'world'});

      var n1 = Gun.state.ify({}, 'key', 1, plain, 'soul');
      var n2 = Gun.state.ify({}, 'key', 1, json, 'soul');
      var tmp = await prep(plain, 'key', n1, 'soul');
      expect(tmp[':']).to.be("hello world");
      tmp = await prep(json, 'key', n2, 'soul');
      expect(tmp[':'].hello).to.be("world");
      tmp = SEA.opt.unpack(tmp);
      expect(tmp.hello).to.be("world");
      done();
    }())});

    it('double sign', function(done){ (async function(){
      var pair = await SEA.pair();
      var sig = await SEA.sign('hello world', pair);
      var dup = await SEA.sign(sig, pair);
      expect(dup).to.be(sig);

      var json = JSON.stringify({hello:'world'});
      var n1 = Gun.state.ify({}, 'key', 1, json, 'soul');
      var sig = await SEA.sign(await prep(json, 'key', n1, 'soul'), pair, null, {raw:1 , check: await pack(json, 'key', n1, 'soul')});
      var dup = await SEA.sign(await prep(sig, 'key', n1, 'soul'), pair, null, {raw:1 , check: await pack(sig, 'key', n1, 'soul')});
      expect(dup).to.be.eql(sig);

      var json = JSON.stringify({hello:'world'});
      var n1 = Gun.state.ify({}, 'key', 1, json, 'soul');
      var bob = await SEA.pair();
      var sig = await SEA.sign(await prep(json, 'key', n1, 'soul'), bob, null, {raw:1 , check: await pack(json, 'key', n1, 'soul')});
      var dup = await SEA.sign(await prep(sig, 'key', n1, 'soul'), pair, null, {raw:1 , check: await pack(sig, 'key', n1, 'soul')});
      expect(dup).to.not.be.eql(sig);

      var json = JSON.stringify({hello:'world'});
      var bob = await SEA.pair();
      var sig = await SEA.sign(json, bob);
      var dup = await SEA.sign(sig, pair);
      expect(dup).to.not.be.eql(sig);
      done();
    }())})
  });

  describe('Seed-based Key Generation', function() {
    this.timeout(5000); // Set timeout for all tests in this suite
    
    it('generates deterministic key pairs from same seed', async function () {
      // Seed string tests
      const pair1 = await SEA.pair(null, { seed: "my secret seed" });
      const pair2 = await SEA.pair(null, { seed: "my secret seed" });
      const pair3 = await SEA.pair(null, { seed: "not my seed" });

      // Check if pairs with same seed are identical
      const sameKeys = pair1.priv === pair2.priv && 
                      pair1.pub === pair2.pub && 
                      pair1.epriv === pair2.epriv && 
                      pair1.epub === pair2.epub;

      // Check if pairs with different seeds are different
      const differentKeys = pair1.priv !== pair3.priv && 
                            pair1.pub !== pair3.pub && 
                            pair1.epriv !== pair3.epriv && 
                            pair1.epub !== pair3.epub;

      expect(sameKeys).to.be(true);
      expect(differentKeys).to.be(true);
      
      // Test consistent generation across multiple calls
      const numTests = 5;
      const pairs = [];
      const seed = "consistency test seed";
      
      // Generate multiple pairs with the same seed
      for (let i = 0; i < numTests; i++) {
        pairs.push(await SEA.pair(null, { seed }));
      }
      
      // Verify all pairs are identical
      let allMatch = true;
      for (let i = 1; i < numTests; i++) {
        if (pairs[i].pub !== pairs[0].pub || 
            pairs[i].priv !== pairs[0].priv ||
            pairs[i].epub !== pairs[0].epub ||
            pairs[i].epriv !== pairs[0].epriv) {
          allMatch = false;
          break;
        }
      }
      
      expect(allMatch).to.be(true);
      
      // Test that the created pair works with SEA functions
      var enc = await SEA.encrypt('hello self', pair1);
      var data = await SEA.sign(enc, pair1);
      var msg = await SEA.verify(data, pair1.pub);
      expect(msg).to.be(enc);
      var dec = await SEA.decrypt(msg, pair1);
      expect(dec).to.be('hello self');
      var proof = await SEA.work(dec, pair1);
      var check = await SEA.work('hello self', pair1);
      expect(proof).to.be(check);
    });

    it('generates deterministic key pairs from ArrayBuffer seed', async function () {
      // Create ArrayBuffer seeds
      const textEncoder = new TextEncoder();
      const seedData1 = textEncoder.encode("my secret seed");  // Convert string to Uint8Array
      const seedBuffer1 = seedData1.buffer;  // Get the underlying ArrayBuffer
      
      // Create a second identical seed
      const seedData2 = textEncoder.encode("my secret seed");
      const seedBuffer2 = seedData2.buffer;
      
      // Create a different seed
      const seedData3 = textEncoder.encode("not my seed");
      const seedBuffer3 = seedData3.buffer;
      
      // Generate key pairs using ArrayBuffer seeds
      const pair1 = await SEA.pair(null, { seed: seedBuffer1 });
      const pair2 = await SEA.pair(null, { seed: seedBuffer2 });
      const pair3 = await SEA.pair(null, { seed: seedBuffer3 });
      
      // Check if pairs with same seed content are identical
      const sameKeys = pair1.priv === pair2.priv && 
                     pair1.pub === pair2.pub && 
                     pair1.epriv === pair2.epriv && 
                     pair1.epub === pair2.epub;
      
      // Check if pairs with different seeds are different
      const differentKeys = pair1.priv !== pair3.priv && 
                          pair1.pub !== pair3.pub && 
                          pair1.epriv !== pair3.epriv && 
                          pair1.epub !== pair3.epub;
      
      expect(sameKeys).to.be(true);
      expect(differentKeys).to.be(true);
      
      // Test with different ways to create ArrayBuffer seeds
      // Method 1: Direct encoding
      const buffer1 = textEncoder.encode("buffer-seed-test").buffer;
      
      // Method 2: Clone buffer from another array
      const tempArray = textEncoder.encode("buffer-seed-test");
      const buffer2 = tempArray.buffer.slice(0);
      
      // Generate key pairs
      const bufPair1 = await SEA.pair(null, { seed: buffer1 });
      const bufPair2 = await SEA.pair(null, { seed: buffer2 });
      
      // Keys should be identical
      expect(bufPair1.pub).to.be(bufPair2.pub);
      expect(bufPair1.priv).to.be(bufPair2.priv);
      expect(bufPair1.epub).to.be(bufPair2.epub);
      expect(bufPair1.epriv).to.be(bufPair2.epriv);
      
      // Test that different buffers produce different keys
      const buffer3 = textEncoder.encode("different-buffer-seed").buffer;
      const bufPair3 = await SEA.pair(null, { seed: buffer3 });
      
      expect(bufPair1.pub).to.not.be(bufPair3.pub);
      
      // Test that the created pair works with SEA functions
      var enc = await SEA.encrypt('hello self', bufPair1);
      var data = await SEA.sign(enc, bufPair1);
      var msg = await SEA.verify(data, bufPair1.pub);
      expect(msg).to.be(enc);
      var dec = await SEA.decrypt(msg, bufPair1);
      expect(dec).to.be('hello self');
      var proof = await SEA.work(dec, bufPair1);
      var check = await SEA.work('hello self', bufPair1);
      expect(proof).to.be(check);
    });
    
    it('generate key pairs from private key', async function () {
      var gun = Gun()
      var user = gun.user()
      const test1 = await SEA.pair(null, { seed: "seed" });
      const test2 = await SEA.pair(null, { priv: test1.priv });
      expect(test2.priv).to.be(test1.priv);
      expect(test2.pub).to.be(test1.pub);
      
      // Test that the created pair works with SEA functions
      var enc = await SEA.encrypt('hello self', test2);
      var data = await SEA.sign(enc, test2);
      var msg = await SEA.verify(data, test2.pub);
      expect(msg).to.be(enc);
      var dec = await SEA.decrypt(msg, test2);
      expect(dec).to.be('hello self');
      var proof = await SEA.work(dec, test2);
      var check = await SEA.work('hello self', test2);
      expect(proof).to.be(check);
      await user.auth(test2);
      expect(user.is.pub).to.be(test2.pub);
      expect(user.is.pub).to.be(test1.pub);
      user.leave();
      const test3 = await SEA.pair(null, { epriv: test2.epriv });
      expect(test3.epriv).to.be(test2.epriv);
      await user.auth(test3);
      expect(user.is.epub).to.be(test3.epub);
      expect(user.is.epub).to.be(test2.epub);
      user.leave();
    });
    
    it('handles different types of seed values correctly', async function () {
      // Test different seed types
      const testCases = [
        { type: "empty string", seed: "" },
        { type: "numeric", seed: "12345" },
        { type: "special chars", seed: "!@#$%^&*()" },
        { type: "long string", seed: "a".repeat(1000) },
        { type: "unicode", seed: "😀🔑🔒👍" }
      ];
      
      // Generate pairs for each test case
      const results = [];
      for (const test of testCases) {
        try {
          const pair = await SEA.pair(null, { seed: test.seed });
          
          // Check if pair has all required properties
          const isValid = pair && 
                        typeof pair.pub === 'string' && 
                        typeof pair.priv === 'string' &&
                        typeof pair.epub === 'string' &&
                        typeof pair.epriv === 'string';
                        
          results.push({ ...test, success: isValid, pair: pair });
        } catch (e) {
          results.push({ ...test, success: false, error: e.message });
        }
      }
      
      // All test cases should succeed
      const allSucceeded = results.every(r => r.success);
      expect(allSucceeded).to.be(true);
      
      // All pairs should be different from each other
      const uniquePairs = new Set(results.map(r => r.pair?.pub));
      expect(uniquePairs.size).to.be(results.length);
      
      // Similar seeds should produce different key pairs
      const seed1 = "test-seed";
      const seed2 = "test-seed1";
      const seed3 = "test-seed ";  // note the space
      const seed4 = "Test-seed";   // capitalization
      
      const pairs = await Promise.all([
        SEA.pair(null, { seed: seed1 }),
        SEA.pair(null, { seed: seed2 }),
        SEA.pair(null, { seed: seed3 }),
        SEA.pair(null, { seed: seed4 })
      ]);
      
      // Check that all pairs are different
      const [p1, p2, p3, p4] = pairs;
      expect(p1.pub).to.not.equal(p2.pub);
      expect(p1.pub).to.not.equal(p3.pub);
      expect(p1.pub).to.not.equal(p4.pub);
      expect(p2.pub).to.not.equal(p3.pub);
      expect(p2.pub).to.not.equal(p4.pub);
      expect(p3.pub).to.not.equal(p4.pub);
    });
    
    it('works with SEA operations (sign, verify, encrypt, decrypt)', async function () {
      // Test with sign/verify
      const seed = "sign-verify-seed";
      const pair = await SEA.pair(null, { seed });
      const message = "Hello deterministic world!";
      
      // Test signing and verification
      const signature = await SEA.sign(message, pair);
      const verified = await SEA.verify(signature, pair.pub);
      expect(verified).to.be(message);
      
      // Test with encrypt/decrypt
      const encryptSeed = "encrypt-decrypt-seed";
      const encPair = await SEA.pair(null, { seed: encryptSeed });
      const secretMessage = "Secret deterministic message";
      
      // Test encryption and decryption
      const encrypted = await SEA.encrypt(secretMessage, encPair);
      const decrypted = await SEA.decrypt(encrypted, encPair);
      expect(decrypted).to.be(secretMessage);
      
      // Test with SEA.secret (key exchange)
      const aliceSeed = "alice-deterministic";
      const bobSeed = "bob-deterministic";
      
      const alice = await SEA.pair(null, { seed: aliceSeed });
      const bob = await SEA.pair(null, { seed: bobSeed });
      
      // Generate shared secrets
      const aliceShared = await SEA.secret(bob.epub, alice);
      const bobShared = await SEA.secret(alice.epub, bob);
      
      expect(aliceShared).to.be(bobShared);
      
      // Test shared secret for encryption
      const sharedMessage = "Secret shared deterministically";
      const sharedEncrypted = await SEA.encrypt(sharedMessage, aliceShared);
      const sharedDecrypted = await SEA.decrypt(sharedEncrypted, bobShared);
      
      expect(sharedDecrypted).to.be(sharedMessage);
      
      // Test complete workflow
      const workflowSeed = "workflow-test-seed";
      const workflowPair = await SEA.pair(null, { seed: workflowSeed });
      const workflowMessage = "hello deterministic self";
      
      // Complete workflow: encrypt, sign, verify, decrypt
      const wfEncrypted = await SEA.encrypt(workflowMessage, workflowPair);
      const wfSigned = await SEA.sign(wfEncrypted, workflowPair);
      const wfVerified = await SEA.verify(wfSigned, workflowPair.pub);
      const wfDecrypted = await SEA.decrypt(wfVerified, workflowPair);
      
      expect(wfDecrypted).to.be(workflowMessage);
      
      // Test with SEA.work
      const proof1 = await SEA.work(workflowMessage, workflowPair);
      const proof2 = await SEA.work(workflowMessage, workflowPair);
      
      expect(proof1).to.be(proof2);
    });
  });

  describe('User', function(){
    var gun = Gun(), gtmp;

    it("put to user graph without having to be authenticated (provide pair)", function(done){(async function(){
      var bob = await SEA.pair();
      gun.get(`~${bob.pub}`).get('test').put('this is Bob', (ack) => {
        gun.get(`~${bob.pub}`).get('test').once((data) => {
          expect(ack.err).to.not.be.ok()
          expect(data).to.be('this is Bob')
          done();
        })
      }, {opt: {authenticator: bob}})
    })()});

    it("put to user graph using external authenticator (nested SEA.sign)", function(done){(async function(){
      var bob = await SEA.pair();
      async function authenticator(data) {
        const sig = await SEA.sign(data, bob)
        return sig
      }
      gun.get(`~${bob.pub}`).get('test').put('this is Bob', (ack) => {
        gun.get(`~${bob.pub}`).get('test').once((data) => {
          expect(ack.err).to.not.be.ok()
          expect(data).to.be('this is Bob')
          done();
        })
      }, {opt: {authenticator: authenticator}})
    })()});

    it('test', function(done){
      var g = Gun();
      user = g.user();
      var gid;
      SEA.pair(function(p){
        user.is = user._.sea = p;
        gtmp = gid = 'test~'+p.pub;
        g.get(gid).put({yo: 'hi'}, async function(ack){
          var data = await SEA.opt.parse(g._.graph[gid].yo);
          expect(data[':']).to.be('hi');
          expect(data['~']).to.be.ok();
          g.get(gid).get('yo').once(function(r){
            expect(r).to.be('hi');
            user.leave();
            done();
          })
        })
      })
    });

    it('is instantiable', function(done){
      user.leave();
      user = gun.user();
      done();
    })

    it('register users', function(done){
      user.create('carl', 'testing123', function(ack){
        pub = '~'+ack.pub;
        expect(ack.err).to.not.be.ok();
        done();
      })
    });

    it('login users', function(done){
      user.auth('carl', 'testing123', function(ack){
        expect(ack.err).to.not.be.ok();
        done()
      })
    })

    it('logout, login via {pub}', function(done){
      var pub = user.is.pub;
      user.leave();
      user.auth({pub:pub}, 'testing123', function(ack){
        expect(ack.err).to.not.be.ok();
        done();
      })
    })

    it('save data', function(done){
      user.get('a').get('b').put(0, function(ack){
        expect(ack.err).to.not.be.ok();
        done();
      });
    })
    it('read data', function(done){
      user.get('a').get('b').once(function(data){
        expect(data).to.be(0);
        done();
      });
    })

    it('save json', function(done){
      user.get('a').get('c').put(JSON.stringify({hello:'world'}), function(ack){
        expect(ack.err).to.not.be.ok();
        done();
      });
    })

    it('read json', function(done){
      user.get('a').get('c').once(function(data){
        expect(data).to.be(JSON.stringify({hello:'world'}));
        done();
      });
    })

    it('save & read encrypt', function(done){
      SEA.encrypt('hi', user._.sea, function(data){
        var is = data.slice();
        user.get('a').get('d').put(data, function(ack){
          expect(ack.err).to.not.be.ok();
          setTimeout(function(){
            user.get('a').get('d').once(function(data){
              expect(data).to.be(is);
              done();
            });
          })
        });
      })
    })

    it('refresh login', function(done){
      this.timeout(9000);
      setTimeout(function(){
        gun = Gun();
        user = gun.user();
        user.auth('carl', 'testing123', function(ack){
          expect(ack.err).to.not.be.ok();
          done()
        })
      }, 800);
    })

    it('gun put JSON', function(done){
      gun.get('x').get('y').put(JSON.stringify({hello:'world'}), function(ack){
        expect(ack.err).to.not.be.ok();
        done();
      });
    })

    it('gun get JSON', function(done){
      gun.get('x').get('y').once(function(data){
        expect(data).to.be(JSON.stringify({hello:'world'}));
        done();
      });
    })

    it('set user ref should be found', function(done){
      var gun = Gun();
      var user = gun.user();
      var msg = {what: 'hello world'};
      user.create('zach', 'password');
      gun.on('auth', function(){
        var ref = user.get('who').get('all').set(msg);
        user.get('who').get('said').set(ref);
        user.get('who').get('said').map().once(function(data){
          //console.log("*****", data);
          expect(data.what).to.be.ok();
          done();
        })
      })
    });

    it('set user ref null override', function foo(done){
      this.timeout(9000);
      var gun = Gun();
      //user.leave();
      var user = gun.user();
      var msg = {what: 'hello world'};
      user.create('xavier', 'password');
      gun.on('auth', function(){
        //console.log(1);
        if(done.a){ return } done.a = 1;
        var ref = user.get('who').get('all').set(msg, A);
        var stub = user.get('stub').put({});
        function A(){
          //console.log(2);
          user.get('who').put(stub, B);
          function B(){
            //console.log(3);
            var tmp = ref._.has || ref._.soul;
            user.get('who').get('all').get(tmp).put({boom: 'ah'}, C);
            function C(){
              //console.log(4);
              user.get('who').get('all').map().once(function(data){
                //console.log(5);
                expect(data).to.be.ok();
                expect(data.what).to.not.be.ok();
                done();
              });
            }
          }
        };
      });
    });

    it("User's nodes must be signed when on user scope!", function(done) {
      /// https://github.com/amark/gun/issues/850
      /// https://github.com/amark/gun/issues/616
      this.timeout(9000);
      var gun = Gun();
      var user = gun.user();
      user.create('xavier2', 'password2');
      gun.on('auth', function(){
        user.get("testauthed").get("arumf").set({"this": "is", "an": {"obj2": "again2"}}, function(ack) {
          var notsigned = [];
          //Gun.obj.map(gun._.graph, function(v,k) {
          Object.keys(gun._.graph).forEach(function(k,v){ v = gun._.graph[k]; 
            if (k[0]==='~' || k.indexOf('~', 1)!==-1) { return; } /// ignore '~pubkey' and '~@alias'
            notsigned.push(k);
          });
          expect(notsigned.length).to.be(0); /// all souls must have to be suffixed with the user's pubkey.
          done();
        });
      });
    });

    describe('predictable souls', function(){
      var alice = {
        "pub": "sT1s6lOaUgia5Aiy_Qg_Z4ubCCVFDyGVJsi-i0VmKJI.UTmwQrcKxkHfw0lFK2bkVDaYbd4_2T1Gj-MONFMostM",
        "priv": "HUmmMsaphGuOsUHAGGg9HHrYOA5FCrsueY6QexE79AE",
        "epub": "MIPYx3rdRJbJSvtan0ruwIjMYaB5W7t42MJ4U1Y2jsk.HFNKa-LoIp5MPI-KFXZhvANjhAxL8dzgXWzLVhewtuk",
        "epriv": "7X9rN1NxDYi9jtNU7daIA33__KYEIw3bN5amI-Rc5sw"
      };
      it("user's", function(done){
        var gun = Gun();
        gun.on('auth', function(){
          gun.user().get('z').get('y').get('x').put({c: {b: {a: 1}}}, function(ack){setTimeout(function(){
            if(done.c){ return } done.c = 1;
            var g = gun._.graph;
            var p = '~'+alice.pub+'/';
            //console.log(p, g);
            expect(g[p+'z']).to.be.ok();
            expect(g[p+'z/y']).to.be.ok();
            expect(g[p+'z/y/x']).to.be.ok();
            expect(g[p+'z/y/x/c']).to.be.ok();
            expect(g[p+'z/y/x/c/b']).to.be.ok();
            done();
          },200)});
        });
        gun.user().auth(alice);
      });

      it('user mix', function(done){
        var gun = Gun();
        gun.on('auth', async function(){
          if(done.a){ return } done.a = 1;
          var c = 0, go = function(){ check(++c) }
          var ref = gun.user().get('zasdf').put({a: 9}, go);
          //ref._.REF = 'ref!';
          //console.only.i=1;console.log("=================");
          var at = gun.user().get('zfdsa').get('y').get('x').get('c').put(ref, go);
          //ref._.DAT = 'dat!';
          at.get('foo').get('bar').put('yay', go);
          ref.get('foo').get('ah').put(1, go);
          function check(){
            if(c !== 4){ return }
            setTimeout(function(){
            if(done.c){ return } done.c = 1;
            var g = gun._.graph;
            var p = '~'+alice.pub;
            //console.log(g);
            expect(Object.keys(g[p]).sort()).to.be.eql(['_', 'zasdf', 'zfdsa'].sort());
            expect(Object.keys(g[p+'/zasdf']).sort()).to.be.eql(['_', 'a', 'foo'].sort());
            expect(Object.keys(g[p+'/zasdf/foo']).sort()).to.be.eql(['_', 'bar', 'ah'].sort());
            expect(Object.keys(g[p+'/zfdsa']).sort()).to.be.eql(['_', 'y'].sort());
            expect(Object.keys(g[p+'/zfdsa/y']).sort()).to.be.eql(['_', 'x'].sort());
            expect(Object.keys(g[p+'/zfdsa/y/x']).sort()).to.be.eql(['_', 'c'].sort());
            expect(g[p+'/zfdsa'].y.indexOf('/zfdsa/y"') > 0).to.be.ok();
            expect(g[p+'/zfdsa/y'].x.indexOf('/zfdsa/y/x"') > 0).to.be.ok();
            expect(g[p+'/zfdsa/y/x'].c.indexOf('/zasdf"') > 0).to.be.ok();
            done();
          },100)};
        });
        gun.user().auth(alice);
      });
      
      it('user thread', function(done){
        // grr this doesn't properly replicate the issue I saw before
        var gun = Gun();
        gun.on('auth', async function(){
          if(done.a){ return } done.a = 1;
          var to = gun.user().get('pchat').get('their.pub');
          var enc = await SEA.encrypt('hi', 'secret');
          var msg = { msg: enc };
          to.get('2020').put(msg, function(){
            if(done.c){ return } done.c = 1;
            var g = gun._.graph;
            var p = '~'+alice.pub+'/';
            //console.log(p, Object.keys(g[p+'pchat/their.pub/2020']||{}).sort());
            expect(Object.keys(g[p+'pchat/their.pub/2020']).sort()).to.be.eql(['_', 'msg'].sort());
            expect(g[p+'2020']).to.not.be.ok();
            done();
          });
        });
        gun.user().auth(alice);
      });
    });

    describe('node', function(){
      var u;
      if(''+u === typeof process){ return }
      console.log("REMEMBER TO RUN mocha test/sea/nodeauth !!!!");
    });

  });

  describe('CERTIFY', function () {
    var gun = Gun()
    var user = gun.user()

    it('Certify: Simple', function(done){(async function(){
      var alice = await SEA.pair()
      var bob = await SEA.pair()
      var dave = await SEA.pair()
      var cert = await SEA.certify(bob, {"*": "private"}, alice)
      
      user.leave()
      user.auth(bob, () => {
        var data = Gun.state().toString(36)
        gun.get("~" + alice.pub)
          .get("private")
          .get("asdf")
          .get("qwerty")
          .put(data, () => {
            // Bob reads
            gun.get("~" + alice.pub)
            .get("private")
            .get("asdf")
            .get("qwerty").once(_data=>{
              expect(_data).to.be(data)
              user.leave()
              // everyone reads
              gun.get("~" + alice.pub)
              .get("private")
              .get("asdf")
              .get("qwerty").once(_data=>{
                expect(_data).to.be(data)
                user.auth(dave, () => {
                  // Dave reads
                  gun.get("~" + alice.pub)
                  .get("private")
                  .get("asdf")
                  .get("qwerty").once(_data=>{
                    expect(_data).to.be(data)
                    user.leave()
                    done()
                  })
                })
              })
            })
          }, { opt: { cert } })
      })
    }())})

    it('Certify: Attack', function(done){(async function(){
      var alice = await SEA.pair()
      var bob = await SEA.pair()
      var cert = await SEA.certify(bob, {"*": "private"}, alice);
      
      user.leave()
      user.auth(bob, () => {
        var data = Gun.state().toString(36)
        gun.get("~" + alice.pub)
          .get("wrongway")
          .get("asdf")
          .get("qwerty")
          .put(data, ack => {
            expect(ack.err).to.be.ok()
            user.leave()
            done()
          }, { opt: { cert } })
      })
    }())})

    it('Certify: Public inbox', function(done){(async function(){
      var alice = await SEA.pair()
      var bob = await SEA.pair()
      var cert = await SEA.certify('*', [{"*": "test", "+": "*"}, {"*": "inbox", "+": "*"}], alice)
      user.leave()
      user.auth(bob, () => {
        var data = Gun.state().toString(36)
        gun.get("~" + alice.pub)
          .get("inbox")
          .get(user.is.pub)
          .put(data, ack => {
            expect(ack.err).to.not.be.ok()
            user.leave()
            done()
          }, { opt: { cert } })
      })
    }())});

    it('Certify: Expiry', function(done){(async function(){
      var alice = await SEA.pair()
      var bob = await SEA.pair()
      var cert = await SEA.certify(bob, {"*": "private"}, alice, null, {
        expiry: Gun.state() - 100, // expired 100 milliseconds ago
      })

      user.leave()
      user.auth(bob, () => {
        var data = Gun.state().toString(36)
        gun.get("~" + alice.pub)
          .get("private")
          .get("asdf")
          .get("qwerty")
          .put(data, ack => {
            expect(ack.err).to.be.ok()
            user.leave()
            done()
          }, { opt: { cert } })
      })
    }())})

    it('Certify: Path or Key must contain Certificant Pub', function(done){(async function(){
      var alice = await SEA.pair()
      var bob = await SEA.pair()
      var cert = await SEA.certify(bob, {"*": "private", "+": "*"}, alice)

      user.leave()
      user.auth(bob, () => {
        var data = Gun.state().toString(36)
        gun.get("~" + alice.pub)
          .get("private")
          .get('wrongway')
          .put(data, ack => {
            expect(ack.err).to.be.ok()
            gun.get("~" + alice.pub)
            .get("private")
            .get(bob.pub)
            .get('today')
            .put(data, ack => {
              expect(ack.err).to.not.be.ok()
              gun.get("~" + alice.pub)
              .get("private")
              .get(bob.pub)
              .get('today')
              .once(_data => {
                expect(_data).to.be(data)
                user.leave();
                done()
              })
            }, { opt: { cert } })
          }, { opt: { cert } })
      })
    }())})

    it('Certify: Advanced - Block', function(done){(async function(){
      var alice = await SEA.pair()
      var dave = await SEA.pair()
      var bob = await SEA.pair()
      var cert = await SEA.certify(bob, {"*": "private"}, alice, null, {
        expiry: Gun.state() + 5000, // expires in 5 seconds
        block: 'block' // path to block in Alice's graph
      })

      // Alice points her block to Dave's graph
      await user.auth(alice)
      if (user.is) {
        await user.get('block').put({'#': '~'+dave.pub+'/block'});
        await user.leave()
      }

      // Dave logins, he adds Bob to his block, which is connected to the certificate that Alice issued for Bob
      await user.auth(dave)
      if (user.is) {
        await user.get('block').get(bob.pub).put(true)
        await user.leave()
      }

      // Bob logins and tries to hack Alice
      await user.auth(bob)
      if (user.is) {
        var data = Gun.state().toString(36)
        gun.get("~" + alice.pub)
            .get("private")
            .get("asdf")
            .get("qwerty")
            .put(data, ack => {
              expect(ack.err).to.be.ok()
              user.leave()
              done()
            }, { opt: { cert } })
      }
    }())})

  });

  describe('Frozen', function () {
    it('Across spaces', function(done){
      var gun = Gun();
      var user = gun.user();

      user.create('alice/as', 'password');
      
      gun.on('auth', async function(){

        user.put({name: "Alice", country: "USA"});

        var data = "hello world";
        var hash = await SEA.work(data, null, null, {name: "SHA-256"});
        hash = hash.slice(-20);
        await gun.get('#users').get(hash).put(data);
        var test = await gun.get('#users').get(hash);
        expect(test).to.be(data);
        done();
      });
    });
  });
})

}());
