# Captain

Two sailing worlds. The root page lets you pick.

## The wind over the ball — [`planet/`](planet/README.md)

Sailing on the skin of a stylised water-ball a couple of hundred metres across,
with a curve savage enough to hide the other boat a few lengths away. The wind
blows from a point in space and flows over the sphere: dead calm on the nose,
half again the free stream on the limb, and a separated lee full of shedding
back-eddies. Each boat blankets the air downwind of her, so you can sail over
your rival and kill her wind — or drop over the curve and vanish. Ball size and
simulation quality are adjustable. No keys, no network, no build step.

## Voice-controlled sailing — `fft-ocean/`

A Napoleonic-era sailing demo you command entirely by voice. Hold **Space** (or the
Hold-to-Talk button) and speak an order — "helm a-starboard twenty degrees", "ease the
main sheet", "how are we doing" — and the crew answers in character while the ship
responds through a real sailing model (apparent wind, leeway, the no-go zone, keel bite).

**Play:** open the page, paste your own OpenAI API key when asked (it stays in your
browser's localStorage and is sent only to api.openai.com — this site has no server and
collects nothing), then press V for the quarterdeck helm view, S for settings, or Run
Demo to watch her tack herself.

Built on [fft-ocean](https://github.com/jbouny/fft-ocean) (MIT) for the ocean rendering,
with sail lift/drag data from [By The Lee](https://github.com/leeboardtools/bythelee)
(Apache-2.0). Voice pipeline: OpenAI transcription + tool-calling.
