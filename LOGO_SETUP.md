# Logo Setup Instructions

## To use your exact Third Wave Coffee logo:

1. **Save your logo image** as `logo.png` in the `public/assets/` folder
2. **Update the Login component** to use the actual image

## Steps:

### 1. Save the Logo
- Take the logo image you uploaded
- Save it as `logo.png` 
- Place it in: `public/assets/logo.png`

### 2. Update Login Component
Once the logo is saved, replace the SVG section in `components/Login.tsx` with:

```tsx
<img 
  src="/assets/logo.png"
  alt="Third Wave Coffee Logo"
  className="w-32 h-32 object-contain drop-shadow-lg bg-white rounded-2xl p-4"
/>
```

## Current Status
- ✅ Login component is prepared for your logo
- ⏳ Need to manually add logo.png to public/assets/
- ⏳ Uncomment the image tag once logo is added

## File Locations
- Logo should go here: `public/assets/logo.png`
- Login component: `components/Login.tsx`

The current implementation shows a temporary SVG version. Once you add your logo file, it will automatically use the real logo image.