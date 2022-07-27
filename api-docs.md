# Documentation

* [Class: `P2PT extends EventEmitter`](#class-p2pt-extends-eventemitter)
  * [Event: `peerconnect`](#event-peerconnect)
  * [Event: `data`](#event-data)
  * [Event: `msg`](#event-msg)
  * [Event: `peerclose`](#event-peerclose)
  * [Event: `trackerconnect`](#event-trackerconnect)
  * [Event: `trackerwarning`](#event-trackerwarning)
  * [`new P2PT(announceURLs = [], identifierString = '')`](#new-p2ptannounceurls---identifierstring--)
  * [`setIdentifier(identifierString)`](#setidentifieridentifierstring)
  * [`start()`](#start)
  * [`requestMorePeers()`](#requestmorepeers)
  * [`send(peer, msg[, msgID = ''])`](#sendpeer-msg-msgid--)
  * [`destroy()`](#destroy)

## Class: `P2PT extends EventEmitter`
The P2PT class is defined and exposed by the `p2pt` module :
```javascript
const P2PT = require('p2pt')
```
In Typescript, you can use
```typescript
import P2PT from "p2pt";
```


This is the base class that needs to be instantiated to use this library. It provides the API to implement P2P connections, communicate messages (even large content!) using WebTorrent WebSocket Trackers as the signalling server.

### Event: `peerconnect`
This event is emitted when a new peer connects.

Arguments passed to Event Handler: `peer` Object

### Event: `data`
This event is emitted for every chunk of data received.

Arguments passed to Event Handler: `peer` Object, `data` Object

### Event: `msg`
This event is emitted once all the chunks are received for a message.

Arguments passed to Event Handler: `peer` Object, `msg` Object

### Event: `peerclose`
This event is emitted when a peer disconnects.

Arguments passed to Event Handler: `peer` Object

### Event: `trackerconnect`
This event is emitted when a successful connection to tracker is made.

Arguments passed to Event Handler: `WebSocketTracker` Object, `stats` Object

### Event: `trackerwarning`
This event is emitted when some error happens with connection to tracker.

Arguments passed to Event Handler: `Error` object, `stats` Object

### `new P2PT(announceURLs = [], identifierString = '')`
Instantiates the class
* **Arguments:**
  * **announceURLs:** `Array`
    * **Description:** List of announce tracker URLs
    * **Default:** `[]`
  * **identifierString:** `String`
    * **Description:** Identifier used to discover peers in the network
    * **Default:** `''`

```javascript
// Find public WebTorrent tracker URLs here : https://github.com/ngosang/trackerslist/blob/master/trackers_all_ws.txt
var trackersAnnounceURLs = [
  "wss://tracker.openwebtorrent.com",
  "wss://tracker.sloppyta.co:443/",
  "wss://tracker.novage.com.ua:443/",
  "wss://tracker.btorrent.xyz:443/",
]

// This 'myApp' is called identifier and should be unique to your app
var p2pt = new P2PT(trackersAnnounceURLs, 'myApp')
```

In Typescript, the `P2PT` class accepts an optional type parameter to constrain the type of messages you can pass to the `send` function. It doesn't constrain the type of messages you recieve, since any peer *could* send anything.
```typescript
type Msg = 'hello' | { goodbye: boolean }
const p2pt = new P2PT<Msg>(trackersAnnounceURLs, 'myApp')
// ... find a peer ...
p2pt.send(peer, 'some_message') // TS typecheck error: Argument of type 'string' is not assignable to parameter of type 'Msg'.
p2pt.send(peer, 'hello') // ok!
p2pt.send(peer, { goodbye: true }) // ok!
```

### `setIdentifier(identifierString)`
Sets the identifier string used to discover peers in the network
* **Arguments:**
  * **identifierString:** `String`
    * **Description:** Identifier used to discover peers in the network
* **Returns:** `void`

### `start()`
Connects to network and starts discovering peers
* **Arguments:** None
* **Returns:** `void`

### `requestMorePeers()`
Request More Peers
* **Arguments:** None
* **Returns:** `Promise`
  * **resolve(peers)**
    * **peers:** Object

### `send(peer, msg[, msgID = ''])`

* **Arguments:**
  * **peer:** `Object`
    * **Description:** Stores information of a Peer
  * **msg:** `Object`
    * **Description:** Message to send
  * **msgID:** `Number`
    * **Description:** ID of message if it's a response to a previous message. You won't need to pass this
    * **Default:** `''`
* **Returns:** `Promise`
  * **resolve([peer, msg])**
    * **peer:** `Object`
    * **msg:** `Object`

### `destroy()`
Destroy the P2PT Object
* **Arguments:** None
* **Returns:** `void`
