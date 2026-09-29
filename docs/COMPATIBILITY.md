# Compatibility and design decision

| Approach | Version fit | Integration cost | Main limitation |
| --- | --- | --- | --- |
| EaglerMobile userscript | Documented focus: 1.8.8 | Low for its supported clients | 1.12.2 bridge and UI behavior are not established |
| This ModAPI input-bridge adapter | Specific compatible 1.12.2 builds | Low-to-medium | Internal hook names can change between builds |
| Native touch port into the client | Potentially broad for one maintained fork | High | Requires source-level game/client modifications and ongoing maintenance |

We chose the adapter because it can be tested separately and shared without a client binary. The value is a concrete 1.12.2 input bridge plus touch UI and tests; it is not a replacement for EaglerMobile or native upstream support.

## Required bridge

At startup the script checks:

```js
ModAPI.hooks._rippedStaticProperties.nlei_PlatformInput
ModAPI.hooks.methods.nlei_PlatformInput_mouseSetGrabbed
```

It also reads `ModAPI.mcinstance`, optionally `ModAPI.player`, and optionally `ModAPI.util.getNearestProperty` and `ModAPI.reflect` for GUI detection. The `nlei_` bridge is an implementation detail, not a stable public API. A build that exposes different property names needs a port. EaglerForge's own API documentation describes how TeaVM-generated property names can vary, which is why this project checks the bridge and fails closed.

The controller changes `pointerLockSupported` and the compatible `mouseSetGrabbed` implementation only after mobile gating and compatibility checks. It preserves the client's own grab transitions without requesting native pointer lock. This solved the pause/menu loop in the tested build; other builds may handle grab differently.

## Expected failures

- No `ModAPI`: incorrect load order or a non-ModAPI client.
- Missing `nlei_PlatformInput`: incompatible input bridge; do not guess at obfuscated names in production.
- Controls visible but no movement: browser events are not reaching the build's key bridge, custom key binds are in use, or the host thinks the client is in a different state.
- Touch works in menus but not world: verify player detection, input grab behavior, and canvas selection.
- Second startup tap inaccessible: host loading overlay covers the native prompt. Fix overlay stacking in the host.
- Mobile connects then times out: investigate the client/network join path separately; controls do not own it.

## References

- [EaglerMobile](https://github.com/FlamedDogo99/EaglerMobile) (1.8.8-focused prior art; Apache-2.0)
- [EaglerForge ModAPI documentation](https://github.com/eaglerfabric/EaglerFabric/blob/main/docs/apidoc/index.md) (API concepts and unstable generated property names)

These references are informational. No code or binary from them is included here.
