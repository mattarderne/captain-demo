# Captain — voice-controlled sailing

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
