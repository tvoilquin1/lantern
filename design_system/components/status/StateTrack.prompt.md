StateTrack is the burnout gauge. Prefer the segmented form: it reads as a named tier rather than an unexplained score.

```jsx
<StateTrack segments={4} value={70} tone="caution" labels={["Coping", "Stretched", "At risk"]} />
```

Always pair it with a plain-language headline ("Stretched thin"). Any clinical score (Zarit, PHQ-9) belongs in the supporting sentence, never as the headline number.
