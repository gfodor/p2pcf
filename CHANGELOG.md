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
