1.3.1
-----

Add ability to pass options to RTCPeerConnection and custom sdp transformer.

1.3.0
-----

No longer forcibly close peers when network settings change. Clear packages
upon connection instead.

1.2.0
-----

Migrate to using tiny-simple-peer to reduce bundle size and improve performance.

Fix up entropy issues with ICE credentials.

1.1.0
-----

Stop deflating payloads, since recent changes now only send packages when they
change, meaning the benefits of the deflation doesn't offset the increase in
bundle size.


1.0.10
-----

Initial working release.
