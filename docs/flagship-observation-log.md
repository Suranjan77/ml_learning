# Flagship Observation Log

Use one copy of this section per participant. Do not record names, accounts,
device identifiers, or unnecessary personal information.

## Session

- Date: 13/07/26
- Exhibit revision or commit: 
- Experience level: ML-familiar
- Primary input: pointer / keyboard
- Viewport class: laptop

## Before interaction

- What does the participant think the page is asking them to do?
=> Press the take step button. slide the learning rate slider.
- What do they expect a larger learning rate to change?
=> Larger learning rate should make the red ball skip larger area in the function.

## Unaided observation

- First action: 
=> Click and rotate the camera in 3d scene
- Was the principal manipulation discovered without help?
=> No
- Was the local downhill arrow understood?
=> No
- Was oscillation distinguished from divergence?
=> No
- Was the kept-path comparison understood?
=> No
- Did the participant understand why different starts can end differently?
=> Somewhat
- Confusions or misleading cues:
=> Its not clear what to do when I am on the page.

## After interaction

- In the participant's words, what changed when learning rate changed?
=> Making it higher took the red ball to the global minima, and making it lower stuck in local minima.
- Why did it change?
=> Higher rate means bigger steps and chance to skip a downhill.
- What surprised them?
=> Totally skipping a minima when learning rate is high.
- What does gradient descent know about the full surface?
=> It probably does not know anything of the surface except small area near it.
- What image or behaviour do they remember?
=> The red ball moving towards green.

## Design response

- Evidence supporting the intended causal takeaway: The participant connected a
  higher learning rate with larger steps, described skipping a minimum, and
  correctly inferred that gradient descent only knows the nearby surface.
- Changes required: Keep the learning-rate regimes explicit, show local descent
  with a real arrow rather than a text label, clarify move-versus-orbit cues,
  and retain a visible comparison path.
- Changes deliberately rejected and why: Restricting camera rotation was
  rejected. Orbit was the participant's first action and makes the locations of
  minima easier to inspect from different perspectives.
