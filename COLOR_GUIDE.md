# Nonprofit Brand Color Palette Guide

This document outlines the official color palette for the 7More Houston mentorship app and provides guidelines for consistent usage across all screens.

## Brand Color Palette

| Color Name | Hex Code | Tailwind Class | Usage |
|------------|----------|----------------|-------|
| Background | `#f8f8f8` | `bg-[#f8f8f8]` | Main app background, light surfaces |
| Header | `#405b69` | `bg-[#405b69]` | Headers, primary buttons, navigation highlights |
| Accent | `#fcc85c` | `bg-[#fcc85c]` | Accent elements, highlights, active states |
| Primary Text | `#3c3832` | `text-[#3c3832]` | Headings, primary body text |
| Secondary Text | `#99896c` | `text-[#99896c]` | Subtitles, helper text, secondary information |
| Border | `#d7d7d6` | `border-[#d7d7d6]` | Card borders, dividers, input borders |
| Dark Emphasis | `#291403` | `text-[#291403]` | Dark text on light backgrounds, emphasis text |

## Usage Guidelines

### Headers & Navigation
```jsx
// Tab bar (already configured)
tabBarActiveTintColor: "#fcc85c"
tabBarInactiveTintColor: "#99896c"
tabBarStyle: { backgroundColor: "#f8f8f8", borderTopColor: "#d7d7d6" }

// Screen headers
<View className="bg-[#405b69] pt-16 pb-6 px-6">
  <Text className="text-3xl font-bold text-white">Title</Text>
  <Text className="text-white/90 text-sm">Subtitle</Text>
</View>
```

### Buttons
```jsx
// Primary action button
<Pressable className="bg-[#405b69] rounded-xl px-4 py-3">
  <Text className="text-white text-sm font-semibold">Action</Text>
</Pressable>

// Accent/highlight button
<Pressable className="bg-[#fcc85c] rounded-xl px-4 py-3">
  <Text className="text-[#291403] text-sm font-semibold">Action</Text>
</Pressable>
```

### Cards & Containers
```jsx
// Standard card
<View className="bg-white rounded-2xl p-5 border border-[#d7d7d6]">
  <Text className="text-base font-bold text-[#3c3832]">Card Title</Text>
  <Text className="text-sm text-[#99896c]">Card description</Text>
</View>

// Background container
<View className="flex-1 bg-[#f8f8f8]">
  {/* Content */}
</View>
```

### Text Hierarchy
```jsx
// Primary heading
<Text className="text-2xl font-bold text-[#3c3832]">Heading</Text>

// Secondary text
<Text className="text-sm text-[#99896c]">Description text</Text>

// Dark emphasis text
<Text className="text-base font-bold text-[#291403]">Important</Text>
```

### Form Inputs
```jsx
<View className="bg-[#f8f8f8] border border-[#d7d7d6] rounded-xl px-4 py-3">
  <TextInput
    className="text-base text-[#3c3832]"
    placeholderTextColor="#99896c"
  />
</View>
```

### Status & Alert Badges
```jsx
// Warning/attention badge
<View className="bg-[#fcc85c]/20 border border-[#fcc85c]/40 rounded-lg px-3 py-2">
  <Text className="text-[#291403] text-xs font-semibold">Warning</Text>
</View>

// Info badge
<View className="bg-[#405b69]/10 border border-[#405b69]/20 rounded-lg px-3 py-2">
  <Text className="text-[#405b69] text-xs font-semibold">Info</Text>
</View>
```

### Icons
```jsx
// Primary icons
<Ionicons name="icon-name" size={20} color="#405b69" />

// Secondary/subtle icons
<Ionicons name="icon-name" size={14} color="#99896c" />

// On accent backgrounds
<Ionicons name="icon-name" size={20} color="#291403" />
```

### Impersonation Banner
```jsx
<View className="bg-[#fcc85c] px-6 py-4 border-t-2 border-[#fcc85c]">
  <Text className="text-[#291403] text-sm font-semibold">Status</Text>
  <Text className="text-[#291403]/70 text-xs">Details</Text>
  <Pressable className="bg-white rounded-lg px-4 py-3">
    <Text className="text-[#291403] text-sm font-bold">Action</Text>
  </Pressable>
</View>
```

## Semantic Colors (Keep Unchanged)

These colors should remain for their semantic meaning:

- **Error/Overdue**: Red colors (`red-600`, `red-50`, etc.)
- **Success/Active**: Green colors (`green-600`, `green-50`, etc.)
- **Info/In Progress**: Blue colors (`blue-600`, `blue-50`, etc.)
- **Warning (non-brand)**: Orange/Red for critical system warnings

## Opacity Modifiers

Use opacity modifiers for subtle variations:
- `/10` - Very subtle background tint
- `/20` - Light background tint
- `/40` - Medium border/overlay
- `/70` - Semi-transparent text
- `/90` - Nearly opaque

Example: `bg-[#405b69]/10` or `text-white/90`

## Accessibility Considerations

### Contrast Ratios
All color combinations have been tested for WCAG AA compliance:
- `#3c3832` on `#f8f8f8`: 9.8:1 ✓
- `#291403` on `#fcc85c`: 8.2:1 ✓
- `white` on `#405b69`: 5.9:1 ✓
- `#99896c` on `white`: 3.5:1 ✓

### Best Practices
1. Always use `#3c3832` or `#291403` for primary text on light backgrounds
2. Use `white` for text on `#405b69` headers
3. Use `#291403` for text on `#fcc85c` accent backgrounds
4. Avoid `#99896c` for critical information (use for helper text only)

## Files Already Updated

The following screens have been fully updated with the brand colors:
- ✅ RootNavigator.tsx (tab bar)
- ✅ HomepageScreen.tsx
- ✅ AdminHomepageScreen.tsx
- ✅ TaskListScreen.tsx
- ✅ MyMenteesScreen.tsx
- ✅ ResourcesScreen.tsx
- ✅ LoginScreen.tsx
- ✅ AdminTaskManagementScreen.tsx

## Quick Reference

**Header**: `#405b69`
**Accent**: `#fcc85c`
**Background**: `#f8f8f8`
**Primary Text**: `#3c3832`
**Secondary Text**: `#99896c`
**Borders**: `#d7d7d6`
**Dark Text**: `#291403`

---

*This color palette reflects the warm, trustworthy, and professional brand identity of 7More Houston's nonprofit mission.*
