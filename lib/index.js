var crypto = require('crypto');

function _PeerJSServer(config) {

  function PeerJSServer(fn) {
    this.fn = fn;
    this.createPeer();
  }

  PeerJSServer.prototype.createPeer = function() {
    var self = this;
    if(this.peer) return;
    this.peer = new Peer(config.id, {
      key: config.key
    });
    this.peer.on('connection', function(conn) {
      conn.on('data', function(request) {
        var data = JSON.parse(request);
        var id   = data.id;
        var name = data.name;
        var args = data.data;
        self.fn(name, args, function(err, d) {
          conn.send({
            id: id,
            data: d,
            error: err
          });
        });
      });
    });
  }

  PeerJSServer.prototype.listen = function(done) {
    this.createPeer();
    return done();
  }

  PeerJSServer.prototype.stop = function(done) {
    this.peer.destroy();
    return done();
  }

  return PeerJSServer;

}

function _PeerJSClient(config) {

  function PeerJSClient() {
    this.fns = {};
    this.peer = new Peer({
      key: config.key
    });
  }

  PeerJSClient.prototype.connect = function(done) {
    var self = this;
    this.conn = this.peer.connect(config.id);
    this.conn.on('open', function() {
      done();
      self.conn.on('data', function(response) {
        var id    = response.id;
        var error = response.error;
        var data  = response.data;
        var fn = self.fns[id];
        if(!fn) {
          console.error('unknown id', id);
          return;
        }
        if(error) {
          return fn(error);
        } else {
          return fn(null, data);
        }
      });
    });
  }

  PeerJSClient.prototype.disconnect = function(done) {
    return done();
  }

  PeerJSClient.prototype.call = function(method, data, callback) {
    var id = crypto.randomBytes(10).toString("hex");
    this.conn.send(JSON.stringify({
      id:   id,
      name: method,
      data: data
    }));
    this.fns[id] = callback;
  }

  return PeerJSClient;

}

function PeerJSTransport(config) {
  if(typeof Peer === 'undefined') {
    throw new Error("PeerJS Transport requires PeerJS to be loaded already.");
  }
  this.Server = _PeerJSServer(config);
  this.Client = _PeerJSClient(config);
}

module.exports = PeerJSTransport;
