# Integration guide

## Load order

The script must run after `window.ModAPI` and `ModAPI.hooks` have been created. It subscribes to `ModAPI.addEventListener('load', ...)` to mount controls when the client is ready. If your host injects it after that event, use `mountNow: true` when the game is already ready. Do not load it twice; the script guards against duplicate initialization.

Configure `canvasSelector` for your page. The default `#game_frame canvas` matches one common embedded layout but is not a requirement of Eaglercraft. The CSS overlay is attached to `document.body`, uses safe-area insets, and has portrait and landscape positioning. Its element IDs use the `ec1122-touch` prefix so hosts can override appearance in their own stylesheet.

The controller activates on devices where `(pointer: coarse)` matches, or when `enabled: true` is set. Hosts with their own mobile detection can set this explicitly. A desktop session with `enabled: false` or a fine pointer leaves ModAPI and pointer lock untouched.

Activation is chosen when the script loads. This is a page-lifetime adapter: it does not currently provide an uninstall method to restore the original input hook. Reload the page with the adapter disabled when switching back to native mouse controls. `isActive: () => false` hides controls and releases input, but does not uninstall the hook.

## Host lifecycle

`isActive` defaults to `true`. If a launcher owns the page outside the game, return `false` while it shows a login, loading, disconnected, or error state. The controller then hides controls and releases held movement/buttons. When the native client shows a GUI screen, a back button and canvas touch-to-click remain active. In the world, the joystick and action buttons appear. An unloaded canvas hides the controls.

The host must keep the client's own mobile startup prompt accessible. Browsers require a real user activation to start some audio/fullscreen or pointer-related operations. If a loading overlay covers the prompt, fix the host overlay stacking; do not synthesize a click or silently remove the prompt. This project deliberately does not include launcher-specific prompt rewrites.

For the supported bridge, the adapter observes a trusted click on the engine-owned launch button and resumes its existing audio context. If the native panel remains attached after the game has advanced, the adapter hides it only after that click and the bridge reports a completed startup gate. The native click handler is preserved. This cleanup is separate from host overlay visibility.

## Input mapping

The stick emits `W/A/S/D` keydown/up. The control buttons use the default Minecraft keys (`Space`, `Shift`, `Control`, `E`, `T`, `Escape`). Look drag writes relative motion to `mouseDX` and `mouseDY` in the compatible input bridge. Hit/use dispatch mouse button 0/2 to the canvas. Hotbar arrows dispatch wheel events. GUI touches dispatch mouse movement and button 0. The text input emits key events followed by Enter.

Custom in-game key bindings are not tracked. If your game changes the mapping, adapt the `keyDefs` table and test the result. Text input is basic: test IME, non-Latin characters and sign/book editing separately before claiming support. Keep account entry forms in normal HTML rather than routing credentials through synthetic game key events.

## No server-side changes

This code runs in the browser only. It does not change multiplayer protocol, authentication, server plugins, world state, inventory, or transactions. A connection timeout or failed join needs separate diagnosis. Mobile controls alone cannot solve a network/session problem.
