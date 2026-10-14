# @vcs/sdk

How apps built on VCS reach company data, safely.

Apps never hold passwords or API keys. Every call goes to the VCS connector gateway inside your company's environment, which checks the [access rule](https://github.com/VibeCodeStore/vcs-policy) before it touches any system.

```js
import { useVcs } from '@vcs/sdk';

const vcs = useVcs({ appId: 'bounty-board' });

const me = await vcs.me();                         // from company single sign-on
const open = await vcs.data('bounties').list({ status: 'open' });
await vcs.data('bounties').update(id, { status: 'claimed', by: me.id });
await vcs.store.set('lastViewed', Date.now());     // the app's own database
```

If an app tries something it wasn't approved for, the call fails with `SCOPE_DENIED`. It never silently gets more access.

## Test

```
npm test
```

Part of [VCS, the Vibe Code Store](https://vibecodestore.com).
