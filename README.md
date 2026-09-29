# Eaglercraft 1.12.2 mobile touch controls

An **experimental, source-only** mobile controller for compatible Eaglercraft 1.12.2 browser clients on Android and iPhone. It uses EaglerForge `ModAPI` and the `nlei_PlatformInput` input bridge. Features include a movement joystick, drag-to-look camera, jump, hit/use, crouch, sprint, hotbar buttons, touch-to-click menus, and chat input. It is disabled on desktop unless explicitly enabled.

Built by [MineX](https://minex.gg/) while adapting its browser game for phones, and released so other 1.12.2 hosts can improve and reuse the work. The repository contains no MineX launcher, account, wallet, event, server, game binary, or deployment configuration. **It is not a complete Eaglercraft client.**

## Why this exists

[EaglerMobile](https://github.com/FlamedDogo99/EaglerMobile) is useful prior art for mobile Eaglercraft, but its documented focus is 1.8.8. This project provides a separate 1.12.2-specific adapter based on our own input-bridge work. We did not copy EaglerMobile's script. EaglerMobile remains the better starting point for its supported versions; this adapter is for hosts whose 1.12.2 build exposes the hooks below.

## Quick start

1. Use a legally obtained, self-hosted 1.12.2 browser build with EaglerForge `ModAPI` available.
2. Place [`src/eagler-touch-1122.js`](src/eagler-touch-1122.js) next to your client assets.
3. Add the following **after ModAPI exists and before its `load` event**:

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<script>
  window.EaglerTouch1122Config = {
    canvasSelector: '#game_frame canvas'
  };
</script>
<script src="./eagler-touch-1122.js"></script>
```

4. Keep your client startup tap/consent prompt visible and clickable above any loading overlay. This controller does not replace that prompt or bypass browser user-activation rules.
5. Check the browser console. Missing `ModAPI` or input hooks produces a clear warning/error and the controller does not mount. See [integration](docs/INTEGRATION.md) and [compatibility](docs/COMPATIBILITY.md) before shipping.

`#game_frame canvas` is only a default selector. Set `canvasSelector` to the actual canvas in your host page. If the script loads after the ModAPI `load` event, set `mountNow: true` **only once the API and client are ready**.

## Supported configuration

```js
window.EaglerTouch1122Config = {
  enabled: true, // Optional. Default: only (pointer: coarse) devices.
  canvasSelector: '#game_frame canvas',
  isActive: () => true, // Optional. Return false during launcher/error screens.
  mountNow: false // Optional. For integration after ModAPI load.
};
```

The `isActive` callback is useful when a host page has a separate account or connection flow. It prevents touches on a loading/error page from reaching the game. Do not base it only on a successful network connection: the native game menus should remain usable.

## Validation and scope

Run `npm ci && npx playwright install chromium webkit && npm test`. The test suite exercises movement, look, action release, hotbar, GUI clicks, chat entry, portrait layout, desktop gating, and incompatibility handling in mobile browser emulation. Earlier integration work also exercised a compatible 1.12.2 single-player world in Android Chromium emulation. **Physical Android/iPhone tests, a fresh public-client integration, and all 1.12.2 build variants remain unverified.** Emulated WebKit is not a substitute for an iPhone.

The bridge relies on internal names that can change between Eaglercraft/ModAPI builds. It assumes default Minecraft key bindings. Treat `0.1.0` as a starting point for compatible hosts, not universal 1.12.2 support. See the [test plan](docs/TESTING.md).

## Community and licensing

Contributions and compatibility reports are welcome. Include the client build/version, ModAPI version, browser/device, and which hook check fails. Do not include account details or server credentials in reports.

This controller's code is MIT-licensed. EaglerMobile is separately Apache-2.0-licensed; this repository credits it as prior art without redistributing its code. All game/client assets are excluded and retain their own terms.
