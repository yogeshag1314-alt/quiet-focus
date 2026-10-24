# Quiet Focus

A calm, beginner-friendly focus timer built with **HTML, CSS, and plain JavaScript**. No packages, build step, accounts, tracking, or external assets.

## Try it

1. Download this repository using **Code → Download ZIP**.
2. Extract the ZIP.
3. Open `index.html` in Brave or another modern browser.

The app works offline after downloading all four files. Keep them in the same folder.

## What you can do

- Start, pause, resume, and reset a focus session.
- Pick 15, 25, or 50 minutes, or enter a whole number from 1 to 120.
- Switch to a five-minute break. Switching modes resets the timer.
- Set one intention and see your completed focus sessions for the local calendar day.
- Use **Space** to start/pause when you are not typing or using a control.
- Use the timer on a phone, tablet, or desktop, with keyboard focus indicators and screen-reader status messages.

Your intention, focus duration, and daily session count are saved only in this browser using `localStorage`, when available. Private browsing or browser restrictions may prevent saving; the timer still works. An active countdown is not restored after closing or reloading the page.

The timer uses a clock deadline to catch up after a background tab is throttled. Completion appears when the page can run again; there is no system notification or alarm. A finished timer waits for your next action, so breaks and focus sessions never start automatically.

## Understand the project

| File | Purpose |
| --- | --- |
| `index.html` | Page content and accessible controls |
| `styles.css` | Colors, layout, timer ring, and responsive design |
| `app.js` | Countdown, button events, and local progress saving |
| `README.md` | Setup, behavior, and learning guide |

### Easy changes to make

- **Change the palette:** edit the color variables in `:root` at the top of `styles.css`.
- **Change the break length:** edit `BREAK_MINUTES` near the top of `app.js`, and update the matching help text.
- **Explore the countdown:** start with `toggleTimer()`, then read `tick()`, `finish()`, and `render()`.
- **Add a preset:** add another button with `data-minutes="30"` inside the presets group in `index.html`. The JavaScript finds it automatically.

## Quick manual check

1. Start a session; confirm the time decreases. Pause it; confirm it stops. Resume and reset.
2. Select each preset and a custom duration. Confirm values outside 1–120 and fractional minutes are rejected.
3. Select Short break; confirm `05:00`. Switch back to Focus.
4. Set a one-minute focus session and let it finish. The daily count should increase exactly once.
5. Reload the page; the intention, chosen duration, and today's count should remain if browser storage is available.
6. Narrow the window and navigate with Tab to check the mobile layout and keyboard controls.

Built as a small learning project: one task, a little time, a fresh start.
