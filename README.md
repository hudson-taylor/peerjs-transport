# peerjs-transport
Experimental P2P WebRTC transport for HT

*This transport is not officially supported.*

## Usage

This transport requires you get yourself an API key from peerjs.com
It also requires that you include a copy of peerjs on your page before trying to use this transport.

### new PeerJSTransport(config)

When instantating an instance of PeerJSTransport you must pass a configuration object in.

The object must contain a key called *key*, which contains your PeerJS API key.

If you're creating an instance that is going to be used by a service, it needs to contain a key called *id*, which is what the service will advertise itself as to clients.

If you're creating one for a client, *id* is still required, but should contain the name of the remote service you wish to connect to.

## Example

### Service

```js
var ht              = require('hudson-taylor');
var PeerJSTransport = require('ht-peerjs-transport');

var service = new ht.Service(new PeerJSTransport({
  id:  'math',
  key: 'yourAPIkeygoeshere'
}));

service.on('multiply', function(data, callback) {
  return callback(null, data.one * data.two);
});

service.listen(function(err) {
  if(err) throw err;
  console.log("Service is listening...");
});
```

### Client

```js
var ht              = require('hudson-taylor');
var PeerJSTransport = require('ht-peerjs-transport');

var client = new ht.Client({
  math: new PeerJSTransport({
    id:  'math',
    key: 'yourAPIkeygoeshere'
  })
});

client.connect(function(err) {

  if(err) throw err;

  client.call('math', 'multiply', {
    one: 2341,
    two: 2
  }, function(err, response) {

    if(err) throw err;

    console.log("Got response from service:", response);

  });

});
```

## License

ISC