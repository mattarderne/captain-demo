# The wind over the ball

A second, stylised world for Captain: instead of a flat ocean stretching to a
flat horizon, you sail on the skin of a water-ball a couple of hundred metres
across. The curve is savage enough that the other boat drops out of sight a few
boat lengths away, and the wind is not a constant arrow — it is a flow field
around a sphere, with a real windward face, a real lee, and real dirty air.

Open `planet/index.html` (or pick it from the root page). No build step, no
network, no keys — it borrows the three.js copy the flat-ocean demo already
vendors.

## The wind

The ball sits in a free stream blowing from a point out in space. Three effects
stack up, all in `js/windfield.js`:

**Potential flow round a sphere.** Surface speed is `1.5 * U * sin(theta)`,
`theta` measured from the windward stagnation point. That gives you dead calm on
the nose of the ball, half again the free stream on the circumference you see as
the limb, and a slow decline round towards the back. The same doublet solution is
evaluated in three dimensions for the streaks flying past out in space, so what
you see out there and what you feel on the water are the same field.

**Separation.** Real flow cannot stay attached round the back of a bluff body.
Past the separation angle (108° by default, and adjustable) the field breaks down
into a wake: weak, partly running back up the ball, and swirling. The swirl sign
alternates round the wake axis and in time — vortex shedding — so the shelter
behind the ball is genuinely sheltered but never steady. Sit in it and your wind
will back and fill on you.

**Boat shadows.** Every boat drags a cone of dead air downwind of her sails: a
Gaussian across the cone, exponential decay along it, widening as it goes. It
costs about 77% of the wind a length astern and is still worth 10% at fifteen
lengths. Air squeezed out of the shadow bends round its edges, so a boat on the
margin gets a shift rather than just a lull. Shadows compound, and a boat only
blankets as hard as she has wind working her own sails.

The same maths runs in the ball's fragment shader, which is how the wind field
and the boats' shadows come to be painted directly onto the water — the dark
patch trailing a boat is not a decal, it is the field.

## Sailing

A boat is a unit position vector plus a heading tangent to the sphere there.
Sailing her forward is one rotation about `pos x head`, so she can cross the pole
without noticing. On top of that: a polar curve with a 34° no-go zone and a best
angle on a beam reach, sheet trim (auto by default), leeway, speed-dependent helm
authority, and heel to leeward.

You start in the worst place: a rival to windward and a couple of lengths ahead,
her dirty air lying across your bow. Sail out of it low, or tack away, or take her
wind back. She will cover you when she is close, run for clean air when you have
her blanketed, and occasionally give up and hide over the curve where you cannot
see her at all.

## Reading the picture

- **Colour on the water** — the wind field. Deep indigo is calm; pale cyan is the
  hard stuff on the limb. The water is only textured where the wind is working it,
  so a hole in the breeze reads as a glassy patch from a long way off.
- **Streamlines** — the flow itself, crawling over the surface. Watch them thin
  out and die where a boat's shadow lies.
- **The card, bottom left** — the ball side-on, wind blowing left to right. The
  dark half is the separated lee. Shaded wedges are dirty air. The dashed ring is
  as far as your lookout can see before the curve gets in the way.

## Controls

| | |
|---|---|
| `←` `→` | helm |
| `↑` `↓` | sheet in / ease |
| `T` | auto-trim |
| `C` | camera: follow / masthead / orbit (drag to orbit) |
| `L` `P` `K` | streamlines / painted wind / dirty-air cones |
| `G` | settings |
| `H` | hide the HUD |
| `Space` | pause |
| `R` | reset the race |

## Settings

Everything is live. **Ball radius** (60–700 m) is the big one: the boats, their
shadows and their turning circles all scale with it, so the tactics hold while the
horizon comes in or goes out. **Simulation quality** runs low / medium / high /
ultra as presets, or set the pieces yourself — streamer count and length, flow
substeps, ball tessellation, pixel ratio, and how many boat shadows the painted
field resolves. Wind strength, source bearing and elevation, separation angle, lee
strength, back-eddy, swirl, shedding rate and gustiness are all exposed, as is
every parameter of the dirty air.

## Layout

    js/core.js        sphere maths, rotations, tangent frames
    js/params.js      every tunable, and the quality presets
    js/windfield.js   the flow field: potential flow, wake, boat shadows
    js/sim.js         boats, polar, geodesic motion, the rival's tactics
    js/streamers.js   surface streamlines and space streaks (ring buffers)
    js/render.js      three.js scene, ball shader, boats, cameras
    js/minimap.js     the tactician's card
    js/ui.js          instruments, settings drawer, keyboard
    js/main.js        boot and frame loop
