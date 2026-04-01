# Sprint 1 install blocker analysis (npm 403)

## Summary
`npm install` fails with `E403` before dependency resolution completes.

## Reproduction
1. Run `npm install` in repository root.
2. `E403` is returned for public packages such as `@types/node`, `next`, `react`.

Observed error:

```text
npm ERR! code E403
npm ERR! 403 Forbidden - GET https://registry.npmjs.org/@types%2fnode
```

Current run (2026-04-01) also shows:

```text
npm warn Unknown env config "http-proxy".
```

## Investigation results
The root cause is environment-level outbound proxy policy, not package definitions.

- npm registry config is the public default: `https://registry.npmjs.org/`.
- Proxy environment variables are injected (`HTTP_PROXY`, `HTTPS_PROXY`, `npm_config_https_proxy`, etc.).
- Direct probe with proxy returns envoy `403`:

```bash
curl -I https://registry.npmjs.org/@types%2Fnode
# HTTP/1.1 403 Forbidden
# server: envoy
```

- Alternative public registries are also denied through the same proxy tunnel:

```bash
- Other public npm-compatible registries are also blocked via the same proxy policy:

```bash
curl -I https://registry.npmmirror.com/@types%2Fnode
# HTTP/1.1 403 Forbidden
# server: envoy

curl -I https://registry.yarnpkg.com/@types%2Fnode
# HTTP/1.1 403 Forbidden
# server: envoy
```

- Direct probe without proxy cannot reach internet from this runtime:

```bash
env -u HTTP_PROXY -u HTTPS_PROXY -u http_proxy -u https_proxy \
  curl -I https://registry.npmjs.org/@types%2Fnode
# curl: (7) Couldn't connect to server
```

## Verification attempt on April 1, 2026 (UTC)
The following Sprint 1 verification steps were executed in this runtime:

```bash
npm install
npm run build
npm run lint
npm test
```

Results:

- `npm install`: failed with `E403` on npm registry access.
- `npm run build`: failed because `next` is not installed (`sh: 1: next: not found`).
- `npm run lint`: failed because `next` is not installed (`sh: 1: next: not found`).
- `npm test`: failed because `vitest` is not installed (`sh: 1: vitest: not found`).

Because dependency installation is blocked externally, application-level verification and browser E2E (`/` -> compare -> `/result/{jobId}`) cannot be completed in this environment yet.

## Conclusion
In this runtime, package installation is blocked by network policy:

- **With proxy:** npm registries are denied (`403 Forbidden`).
- **Without proxy:** external connection is unavailable.

Therefore Sprint 1 verification commands (`build` / `lint` / `test`) remain blocked until registry egress policy is fixed.

## Workarounds
Use one of the following environment-level mitigations.

1. Allowlist npm registry endpoints in outbound proxy policy.
   - `registry.npmjs.org` (required)
   - Additional tarball/CDN endpoints used by npm packages if your proxy requires explicit allowlists
2. Or provide an approved internal npm mirror and set:

```bash
npm config set registry <internal_registry_url>
npm install
```

3. If the execution environment can access internet directly, run install with proxy vars unset:

```bash
env -u HTTP_PROXY -u HTTPS_PROXY -u http_proxy -u https_proxy \
  -u npm_config_http_proxy -u npm_config_https_proxy \
  npm install
```

## Next step after network fix
After dependency install is possible, run:

```bash
npm run build
npm run lint
npm test
```

Then complete browser validation (`/` -> compare -> `/result/{jobId}`) and finalize Sprint 1.

## Unblock requirements (environment-owned)
To complete Sprint 1 verification in this repository, the runtime must satisfy **one** of:

1. Proxy policy allowlists npm registry/mirror endpoints used by npm.
2. An internal npm mirror endpoint is provided and reachable from this runtime.
3. Direct internet egress is enabled for Node/npm traffic.

Without one of the above, `npm install` cannot succeed, and downstream checks (`build` / `lint` / `test` / browser E2E) remain blocked.
