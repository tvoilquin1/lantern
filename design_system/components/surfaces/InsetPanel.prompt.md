InsetPanel nests inside a Card to show machine-extracted data the user should be able to see and correct.

```jsx
<InsetPanel label="Added to Dad's log">
  <ChipRow>
    <LogChip tone="steady">Sleep · 2 wakings</LogChip>
    <LogChip tone="caution">Your sleep · 4h</LogChip>
  </ChipRow>
</InsetPanel>
```

Never use it for controls — it is a read-back surface.
