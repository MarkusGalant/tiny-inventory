# MUI v7 Select Component Testing Best Practices

## Overview
This document outlines best practices for adding `data-testid` attributes to Material-UI v7 `TextField` components with `select` prop for testing purposes.

## Best Practice: Use `slotProps.select`

For MUI v7, when using a `TextField` with the `select` prop, the `data-testid` should be placed on the Select component itself (the clickable element), not on the FormControl root or the input element.

### Correct Implementation

```tsx
<TextField
  select
  label="Category"
  slotProps={{
    select: {
      'data-testid': 'category-select',  // ✅ On the Select component (clickable)
      inputProps: {
        'data-testid': 'category-select-input',  // Optional: for reference
      },
    },
  }}
>
  <MenuItem value="option1">Option 1</MenuItem>
  <MenuItem value="option2">Option 2</MenuItem>
</TextField>
```

### Why This Works

1. **The Select component is the clickable element**: The actual interactive element that users click to open the dropdown is the Select component, not the input (which has `pointer-events: none`).

2. **Proper DOM structure**: In MUI v7, the structure is:
   ```
   FormControl (root)
     └─ InputLabel
     └─ Select (clickable element) ← testid should be here
         └─ Input (has pointer-events: none)
   ```

3. **Testing compatibility**: When using `screen.getByTestId('category-select')`, you get the actual clickable element that can be interacted with in tests.

### Incorrect Approaches

❌ **Don't use `slotProps.root`** - This targets the FormControl, not the clickable Select:
```tsx
slotProps={{
  root: {
    'data-testid': 'category-select',  // ❌ Wrong - targets FormControl
  },
}}
```

❌ **Don't put testid only on inputProps** - The input has `pointer-events: none`:
```tsx
slotProps={{
  select: {
    inputProps: {
      'data-testid': 'category-select',  // ❌ Wrong - not clickable
    },
  },
}}
```

## Testing Pattern

In your tests, you can now directly use the testid:

```tsx
const categorySelect = screen.getByTestId('category-select');
await user.click(categorySelect);
const option = await screen.findByText('Option 1');
await user.click(option);
```

## Alternative: Semantic Queries (Preferred by MUI)

While `data-testid` works, MUI recommends using semantic queries when possible:

```tsx
// Preferred approach
const categorySelect = screen.getByRole('combobox', { name: /category/i });
await user.click(categorySelect);
```

However, `data-testid` is acceptable when:
- Semantic queries are not reliable
- You need consistent test selectors across the codebase
- The component structure makes semantic queries difficult

## Summary

✅ **Best Practice for MUI v7:**
- Use `slotProps.select` with `'data-testid'` directly on the select object
- This targets the clickable Select component
- Optionally add `inputProps` testid for reference
- Use semantic queries (`getByRole`) when possible, but `data-testid` is acceptable

## References

- [MUI v7 TextField API](https://mui.com/material-ui/api/text-field/)
- [MUI Testing Guide](https://mui.com/material-ui/guides/testing/)
- [Overriding Component Structure](https://mui.com/material-ui/customization/overriding-component-structure/)
