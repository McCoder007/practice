# Nail Technician Q&A Reel Plan

## Goal

Create a new flashcard-style Nail Technician Q&A Reel using the existing bilingual dataset. The module should preserve the smooth vertical swipe behavior of the current Word Reel and Nail Technician Reel while adding a reliable tap-to-reveal answer interaction.

The module is English and Chinese only, using the dataset's existing `en` and `zh` fields.

## Route and Data

- Add a new route at `app/nail-technician-qa-reel/page.tsx`.
- Import `nailTechnicianQuestions` from `data/nail-technician-qa/index.ts`.
- Use `app/nail-technician-reel/page.tsx` as the implementation base because it is the closest existing reel.
- Keep the existing dataset shape:

```ts
{
  question: { en: string; zh: string }
  answer: { en: string; zh: string }
}
```

- Add a new navigation item in `components/NavigationMenu.tsx`.
- Place the new Nail Technician Q&A Reel second in the main menu, immediately after the Home item and before the Word Reel.
- Do not modify the existing Word Reel or Nail Technician Reel during the initial implementation.
- Do not introduce a shared reel framework in the same change. Small pure helpers for shuffling and gesture classification are acceptable.

## Random Question Order

- Shuffle all questions each time the Q&A Reel starts.
- Use an unbiased Fisher-Yates shuffle rather than sorting with `Math.random()`.
- Shuffle a copied array so the imported dataset is never mutated.
- Perform the shuffle once when the client-side reel session initializes.
- Keep that shuffled order stable while the user moves forward and backward through the reel.
- Do not reshuffle when an answer is revealed, audio is played, or the component rerenders.
- Starting the reel again, including revisiting or refreshing the route, should create a new order.
- Avoid a server/client hydration mismatch by not calling randomization directly during server rendering. Initialize the shuffled deck on the client and show a minimal loading state until it is ready.

## Card Layout

Each card should have two clear sections.

### Question Section

- Always show the English question.
- Always show the Chinese question.
- Make the English question tappable for text-to-speech.
- Do not display a question number or deck position.

### Answer Section

- Initially show a simple concealed answer surface.
- A single tap in this bottom section reveals the answer.
- After reveal, show the English answer and Chinese answer.
- Make the revealed English answer tappable for text-to-speech.
- Do not show a “Tap answer to hear English” hint.
- Use a short fade or vertical reveal animation rather than flipping the entire card.

## Reveal State

- Track the revealed card by its stable dataset identity, not only by its shuffled array position.
- Prefer adding a stable internal card identifier while mapping the imported data, such as the original dataset index.
- Only the currently revealed card should be open.
- Navigating to any other question should hide the answer.
- Returning to a previously viewed question should present it as concealed again.
- Reaching the next card by swiping must never reveal either card accidentally.

## Gesture Handling

Preserve the current reel gesture implementation and its three-card structure:

- Previous card positioned above the viewport.
- Current card positioned in the viewport.
- Next card positioned below the viewport.
- Cards follow the finger or pointer during a vertical drag.
- A completed swipe uses the current threshold of 10% of viewport height.
- An incomplete swipe snaps back smoothly.
- Navigation wraps from the last shuffled card to the first and from the first to the last.

Add tap detection to the same gesture lifecycle rather than creating a competing card-level click handler:

1. On pointer start, record the pointer ID, starting X coordinate, starting Y coordinate, and whether the gesture began in the concealed answer region.
2. Capture the active pointer so movement and release remain reliable if it leaves the original element.
3. Continue using the existing movement logic during the gesture.
4. On release, calculate total horizontal and vertical movement.
5. If vertical movement reaches the existing 10% viewport-height swipe threshold, commit normal reel navigation.
6. If the gesture began in the concealed answer region and horizontal and vertical movement both remain below approximately 24 pixels, reveal the answer.
7. Otherwise, classify the gesture as canceled and snap the card back without revealing anything.

Implement the decision as a small pure helper:

```ts
type GestureOutcome = "swipeNext" | "swipePrevious" | "tapReveal" | "cancel"

type GestureInput = {
  deltaX: number
  deltaY: number
  startedInAnswerRegion: boolean
  swipeThresholdPx: number
}
```

Evaluate swipe outcomes before tap reveal so a completed drag always wins.

A drag must always take priority over a tap. A short drag, diagonal movement, canceled gesture, or completed swipe must not trigger answer reveal.

Use Pointer Events for the new Q&A Reel so touch, mouse, and pen share one implementation. Use pointer capture for the active gesture. Do not retrofit Pointer Events into the existing reels.

Multi-touch, pointer cancellation, unexpected pointer loss, and gestures begun while animation is locked must always cancel without revealing. Do not impose a strict tap-duration limit in the first version; movement, pointer identity, and starting region are the primary signals.

## Interactive Element Isolation

- English question and answer text should stop event propagation before starting text-to-speech.
- Tapping English text must not reveal the answer or navigate cards.
- Navigation controls and the menu must not start reel drag gestures.
- The concealed answer surface should be a real button with `aria-expanded`.
- Keyboard users should be able to reveal with `Enter` or `Space`.
- Arrow Up and Arrow Down may provide optional previous/next keyboard navigation.

## Text-to-Speech

- Reuse `playText()` from `lib/tts.ts` for immediate tap-to-speak playback.
- Tapping the English question speaks the full English question.
- Tapping the revealed English answer speaks the full English answer.
- Chinese text should not trigger English text-to-speech.
- Preload the current English question and answer plus adjacent English questions with `preloadTexts()`.
- Stop current speech immediately when navigation commits so audio from the previous card cannot continue after the card changes.
- Clear queued audio on unmount and anywhere a queued playback path is introduced.
- Never automatically speak a concealed answer.
- Do not add auto-speak in the first version.

## Reusable Card Rendering

- Create a small internal `QuestionCard` component or render helper.
- Use it for the previous, current, and next cards so their typography and layout remain consistent.
- Pass an `isCurrent` flag so only the current card can reveal an answer or play interactive audio.
- Keep adjacent cards visually complete but noninteractive while they participate in the swipe animation.
- Reuse the existing reel background utilities so adjacent cards retain distinct backgrounds.

## Responsive Layout

- Size question and answer text based on content length and viewport width.
- Allow long questions and answers to wrap naturally.
- Keep the answer section reachable on small mobile screens.
- Prevent body scrolling so it does not compete with reel navigation.
- Do not add nested vertical scrolling in the first version.
- Fit content through wrapping, responsive spacing, and responsive typography.
- Do not clip or hide question or answer text. If real dataset content cannot fit, adjust the card layout explicitly rather than introducing nested gesture handoff or making content unreadable.
- Respect `prefers-reduced-motion` for the answer reveal animation.

## Analytics

- Reuse the existing analytics initialization.
- Continue logging English text-to-speech interactions.
- Add focused events if useful:
  - `qa_answer_revealed`
  - `qa_question_audio_played`
  - `qa_answer_audio_played`
- Do not include full question or answer text in analytics if avoiding content payloads is preferred; use the stable internal card identifier instead.

## Validation

### Data and Randomization

- Confirm all 227 dataset items are included exactly once in each shuffled deck.
- Confirm the imported source array remains unchanged.
- Confirm repeated reel starts produce different orders under normal use.
- Confirm rerenders, reveals, and audio playback do not reshuffle the active deck.
- Confirm forward and backward wraparound follow the same shuffled order.
- Validate the shuffle helper directly to confirm it preserves every item exactly once without mutating the source array.

### Gestures

- Test slow swipes, fast swipes, short drags, diagonal drags, taps, and canceled gestures.
- Confirm swiping from the concealed answer section navigates instead of revealing.
- Confirm a completed swipe never reveals the skipped question.
- Confirm an incomplete drag snaps back without revealing.
- Confirm a stationary single tap on the concealed answer section reveals exactly once.
- Confirm ordinary finger jitter within the chosen tap tolerance still reveals.
- Confirm movement beyond the tap tolerance but below the swipe threshold cancels cleanly.
- Confirm pointer cancellation, multi-touch, and pointer loss never reveal.
- Confirm tapping a revealed answer does not alter navigation or reveal state.
- Validate the gesture classifier directly with representative boundary values.

### Audio

- Confirm the English question speaks before and after answer reveal.
- Confirm the English answer speaks only after it is visible.
- Confirm Chinese text does not trigger English speech.
- Confirm rapid navigation does not play stale audio from the previous question.

### Devices and Accessibility

- Test iPhone Safari, Android Chrome, and desktop mouse dragging.
- Test keyboard reveal behavior and screen-reader labels.
- Test long questions and answers at narrow viewport sizes.
- Verify reduced-motion behavior.

### Project Checks

- Run TypeScript validation.
- Run the production build.
- Manually verify the new navigation entry and static-export route.

## Recommended Implementation Order

1. Add the new route and typed dataset mapping.
2. Add client-only session shuffle initialization.
3. Reproduce the existing three-card vertical reel behavior.
4. Extract shared question-card rendering.
5. Add concealed and revealed answer states.
6. Add the pure gesture classifier and Pointer Events integration.
7. Add English question and answer text-to-speech.
8. Add navigation and accessibility support.
9. Validate randomization, gestures, audio, and responsive layout.

## Core Interaction Rule

Preserve the current swipe algorithm. Evaluate swipe first, reveal only after the gesture ends within the tap tolerance, and reveal only when the gesture began in the bottom answer section.
