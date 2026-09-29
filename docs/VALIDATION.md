# Validation record — 2026-09-29

Controller SHA-256: `8d3e2dda4c73a32622ca9febfcda403c533e077b159473c4bd6537417940b5d9`.

## Automated browser fixture

All nine tests passed with Playwright 1.56.1 in its matching Linux browser container, using Chromium and WebKit mobile profiles. The fixture verifies event translation, host CSS isolation, input release and the guarded native-startup cleanup. The test source is included in this repository and runs in GitHub Actions.

## Actual client smoke test

The same controller file was tested with a locally hosted 1.12.2 u2-derived client and EaglerForge ModAPI 2.7.97. Other application mods were disabled. The host exposed the native startup prompt and loaded this file with its matching integrity hash. External requests were blocked, and a local single-player world was used.

Environment: Chromium 154.0.8037.57 on Linux, Playwright Pixel 7 mobile emulation. This was an automated test, not a physical Android phone.

- A real browser click on the native launch button allowed the leftover panel to be hidden after the game advanced.
- Profile/setup screens and the single-player menus were traversed.
- A joystick hold moved the actual player approximately 3.41 horizontal blocks.
- A look drag changed the actual camera yaw by approximately 9 degrees.
- The inventory button opened the real inventory; Back closed it and returned to the world.
- Movement and look were released after the test actions.

The underlying client and the private host harness are not distributed here. This is a maintainer-recorded smoke result for one compatible build, not proof of universal 1.12.2 compatibility. The fixture suite is independently reproducible without those game files.

## Still unverified

Physical iPhone/iPad Safari and Android devices; a separate host's public vanilla-client integration; mobile keyboard/IME behavior across languages; multiplayer session recovery; long-session heat, memory and frame-rate behavior; remapped game controls. Linux WebKit fixture tests do not establish real-world gameplay in iPhone Safari.
