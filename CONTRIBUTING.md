# Contributing

This project helps hosts add touch controls to compatible Eaglercraft 1.12.2 builds. Compatibility reports, small fixes and physical-device testing are useful contributions.

## Report a problem

Use the compatibility-report issue template. Include the client build and ModAPI version, device/browser versions, expected behavior and a short reproduction. Describe whether the failure occurred in the menu, world, chat or after switching apps. A report from a physical phone is different evidence from browser emulation; state which you used.

Share only the relevant, redacted error. Remove account details, authentication links, session IDs, private hostnames and personal messages from screenshots or logs. Do not attach complete game files or server exports.

## Propose code

For a large change, explain the problem in an issue before doing the implementation. Keep patches focused and preserve normal desktop input. Run `npm ci`, `npx playwright install --with-deps chromium webkit` and `npm run check`. Include a regression test for an input or integration bug when practical.

The browser tests use an API fixture. They do not establish compatibility with every client or physical device. Changes to engine hooks also need a compatible-client smoke test as described in [TESTING.md](docs/TESTING.md).

Keep the runtime dependency-free. Do not add telemetry, remote script loading, deployment configuration, account integrations or game assets. Credit relevant prior work; do not copy third-party code without preserving its applicable license and attribution.

Contributions are accepted under this repository's MIT license. Contributors retain credit for their work. The project has no guaranteed support or response time; tested, reproducible reports make review easier.
