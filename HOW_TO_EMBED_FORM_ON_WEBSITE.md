# ✅ How to Add Your Form to Your Website

## You Already Have Everything You Need!

Your form is **live and working right now** at:
### **https://7more-embedded-form1.vercel.app**

---

## Step 1: Copy This Code

```html
<iframe
  src="https://7more-embedded-form1.vercel.app"
  width="100%"
  height="800"
  frameborder="0"
  scrolling="auto"
  style="border: none;"
></iframe>
```

---

## Step 2: Add to Your Wix Website

### In Wix Editor:

1. Click the **`+`** button (Add Elements)
2. Search for **"HTML iframe"** or go to **Embed Code** → **HTML iframe**
3. **Paste the code** from Step 1
4. **Resize** the iframe box to fit your page layout
5. Click **"Publish"** at the top right

---

## Step 3: Test It!

1. Visit your live website
2. Fill out the form with test data
3. Submit the form
4. Open your Vibecode app
5. Go to Bridge Team dashboard
6. Your test submission should appear there!

---

## That's It!

Your form is now embedded on your website and connected directly to your app's database. Every submission will automatically appear in your Bridge Team queue.

---

## What This Form Collects

- **Name** (required)
- **Email** (optional - for email communication)
- **Phone** (optional - for SMS/call communication)
- **Notes** (optional - additional information)

---

## Questions?

**Form not showing?**
- Make sure you selected "HTML iframe" (not custom code or embed)
- Check that the iframe height is at least 800px
- Try increasing the height to 1000px if content is cut off

**Form showing but submissions not appearing?**
- Check that your Firebase is connected in the app
- Verify environment variables in Vercel dashboard
- Test by visiting the form URL directly (not embedded)

**Want a different form?**
- See `QUICK_FIX_INSTRUCTIONS.md` for deploying the advanced dynamic form
- The current form works perfectly for most use cases
