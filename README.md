# ProcrastiPet

ProcrastiPet is a cozy New Tab page with two separate webpage visitors: a full-body Snorlax that shares a lazy-themed message, and a tiny edge-peeking Snorlax head that can earn coins when tapped.

## Build

Use Node.js 18 or newer, then from the project directory run:

```powershell
npm install
npm run build
```

The build includes the New Tab app and copies the extension service worker, content scripts, popup, styles, and artwork into `dist`.

## Load in Chrome

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the project's `dist` folder.
5. Open a new tab for the ProcrastiPet home page. Visit an ordinary `http` or `https` webpage to receive a visit.

After rebuilding, click **Reload** for ProcrastiPet on `chrome://extensions`.

## How visits work

- **Message Snorlax:** its own repeating alarm appears every one minute for testing. The full-body visitor stays in the bottom-right for eight seconds and can be dismissed; dismissal snoozes message visits on that tab for fifteen minutes.
- **Peek-a-boo Snorlax:** its own one-shot alarm schedules a random 30–120 second delay after the previous peek retreats. The tiny head peeks from the left, right, or top edge of the webpage viewport for about 6.5 seconds. Chrome alarms have a 30-second minimum and can be delayed while the browser is busy.
- Tap the peek sprite once during its appearance to add exactly 10 coins to the same persistent balance used by the New Tab tasks. The New Tab coin counter listens for storage changes and updates while open.
- The peek bubble appears initially. A successful tap hides the bubble on the next five peeks; five ignored peeks also bring the reminder bubble back. Interaction state survives browser restarts.
- The toolbar popup has independent toggles for message visits and peek-a-boo coins. The supplied yawning artwork is used by the message visitor; the peek-a-boo visitor keeps its original pixel sprite.
- Message text lives in `messages.js`; the peek appearance state and safe coin awarding live in `peek-logic.js` and `background.js`.

Chrome internal pages are skipped. The extension needs the `alarms` and `storage` permissions, plus access to `http` and `https` pages to show either visitor there. It does not read page contents or send browsing data anywhere.

