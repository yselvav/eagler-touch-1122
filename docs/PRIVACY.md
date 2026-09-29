# Runtime privacy and publication scope

The controller is ordinary, readable JavaScript. It creates its own controls, reads game input/GUI state, sends keyboard and mouse events to the game, and updates the compatible mouse-input bridge. The text field handles text the player explicitly submits to the game. Following a real click on the native launch button, it can resume the game's existing audio context and hide a leftover startup panel after the native gate completes.

The controller contains no analytics, network requests, remote script imports, cookie access or persistent-storage access. There are no runtime dependencies. Playwright is a development dependency used only by the test suite. The MineX scanner link in the README is an attribution link, not a connection made by the controller.

The repository publishes the controller implementation, documentation, tests, license and CI configuration. It does not include the originating host's backend, authentication, player records, account integrations, server configuration or game/client assets. Public GitHub ownership and commit attribution remain visible.

These statements describe this controller. A host game, launcher, browser extension or modified fork can have its own network and data behavior. Loading this script grants it the same page access as other host JavaScript; review the source and pin a reviewed revision when integrating it. Removing telemetry from an adapter is not a security audit of the whole game or its hosting site.

The MIT license intentionally allows others to reuse and modify the published controller. It does not publish or license unrelated private code. See [LICENSE](../LICENSE) for the actual terms.
