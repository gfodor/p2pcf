# P2PCF

P2PCF enables free (or cheap) serverless WebRTC signalling using a [Cloudflare worker](https://workers.cloudflare.com/) and an [Cloudflare R2](https://www.cloudflare.com/products/r2/) bucket. The API is inspired by [P2PT](https://github.com/subins2000/p2pt), but instead of using WebTorrent trackers, which may go down, a custom Cloudflare worker is provided whose I/O is designed to be free for most use-cases, and otherwise very cheap.

The point of this is so people can deploy WebRTC-enabled applications without having to think (much) about managing a signaling server. 

P2PCF also has some additional features:

- Room-based keying for easy connection management + acquisition
- Minimal initial signalling (1 or 2 signalling messages) using the technique [put together](https://twitter.com/evan_brass/status/1549078627282722816) by [@evan_brass](https://twitter.com/evan_brass/status)
- Subsequent signalling over DataChannels
- Efficient chunking + delivery of DataChannel messages that exceed the ~16k limit
- Peers handed back from the API are [simple-peer](https://github.com/feross/simple-peer) instances which provides a nice API to managing the underlying PeerConnections

# Cloudflare Usage

The worker provides signalling via HTTP polling (with backoff when the room is idle), and each request to the server performs a small number of reads from R2. Each join will do at least 1 writes to R2 and up to N + 1 writes (one for each peer, and a metadata update) in the worst-case where all peers are behind symmetric NATs and need to perform bi-directional hole punching to establish their initial DataChannel. Subsequent renegoations are performed over the DataChannel and so do not incur any R2 writes. Clients also heartbeat to maintain livliness every 90 seconds, which incurs an additional write each time.

R2's free tier offers 1M writes per month and 10M reads per month. Cloudflare workers offer 1M requests per month. In general, these free tiers should support any modest WebRTC application's signalling needs without forcing developers to rely upon public signalling servers.
