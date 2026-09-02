MessageBubble is a single conversational turn. A companion turn may contain several stacked children (a sentence, an InsetPanel of extracted data, then a follow-up question) — that is the standard pattern.

```jsx
<MessageBubble from="companion">
  <div>Four hours is not enough, and this is the fourth night this week.</div>
  <InsetPanel label="Added to Dad's log">…</InsetPanel>
  <div>Was the kitchen the destination?</div>
</MessageBubble>
<MessageBubble from="caregiver">He was up at 2 and again at 4.</MessageBubble>
```
