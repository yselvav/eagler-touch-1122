# Testing and release checklist

## Automated checks

Run:

```sh
npm ci
npx playwright install chromium webkit
npm test
```

On a minimal Linux host, install Playwright's browser libraries with `npx playwright install --with-deps chromium webkit` or run the suite in the matching official Playwright container. CI runs the browser suite on every push and pull request.

The suite uses a small `ModAPI` fixture rather than shipping a game client. It checks desktop gating, missing hooks, joystick press/release, simultaneous look and movement, pointer cancellation, hit/use release, hotbar, GUI click/back, chat text entry, and portrait layout in Android Chromium and WebKit mobile emulation. Passing these tests proves the DOM adapter behavior against the fixture; it does **not** prove a particular game build accepts every event.

## Compatible-client smoke test

Use a legally hosted 1.12.2 client that exposes the required hooks, ideally a local single-player world first. On Android Chrome and iPhone Safari, test:

1. First load from empty cache and returning load from cache. Tap the native startup prompt if shown.
2. Enter a world. Hold the stick forward, then add a simultaneous look drag. Confirm the player moves and rotates.
3. Test jump, hit, use, crouch, sprint, hotbar, inventory, chat, pause/back, and menu taps.
4. Rotate portrait to landscape and back. Confirm usable layout with notches, browser bars and keyboard visible.
5. Cancel a gesture (browser interruption, incoming call, tab switch). Confirm no held key or mouse button remains.
6. Disconnect and reconnect if multiplayer is used. Confirm the host's `isActive` state suppresses controls on overlays.
7. Test desktop with a mouse and keyboard and confirm normal pointer lock and controls are unchanged.

Record the client build, ModAPI version, browser, OS, device, screen orientation, and exact failure. Do not publish server addresses or session identifiers in a public issue.

## Release boundary

Before publishing, scan tracked files for organization-specific URLs, credentials, wallet/account code, server configuration, and packaged game assets. This repository should contain only the controller, its tests, and documentation. A public repository should explicitly describe which client build and physical devices its maintainer has personally verified.
