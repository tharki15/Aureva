AUREVA WEBSITE — QUICK START
============================

What's in this folder
---------------------
index.html        The website (all text + links)
styles.css        Royal green-white theme, fully responsive
intro.js          Welcome intro (Three.js emerald gem + gold halo, curtain reveal)
script.js         Mobile menu, lookbook filters + "show more", full-screen photo viewer
assets/fonts/     Cinzel, Cinzel Decorative and Jost (bundled — the site works offline)
assets/vendor/    three.min.js (Three.js r149, bundled)
assets/           Favicon
data/
  ultra-hd/       Large (1400px+) JPG versions of every photo, sorted by category
                  (still-life, worn-by-models, nature-inspired, macro-gemstones, craftsmanship)
  web/            Lightweight WebP versions used by the website itself
  manifest.json   List of every image: id, category, size, upscale method

Contact links already wired
---------------------------
WhatsApp  : +91 84017 69419  (https://wa.me/918401769419)
Instagram : @aureva.luxe21   (https://www.instagram.com/aureva.luxe21/)
To change either one, open index.html and replace the number/handle everywhere it appears.

Preview on your computer
------------------------
1. Unzip.  2. Double-click index.html.  Fonts and Three.js are bundled, so no internet is needed to preview.

Welcome intro
-------------
- Plays on every page load: ~4-5 seconds, then a curtain opens. Visitors can press "Skip intro" (or Esc).
- Skipped automatically for visitors who set "reduce motion"; a CSS-only gem shows if the device has no WebGL.
- To change its length: open intro.js and edit MIN_MS (milliseconds) at the top.
- To remove it completely: delete the <div class="intro" ...> block and the two <script> lines for
  three.min.js and intro.js at the bottom of index.html, and the small <script> in <head>.

Publish for free (Netlify Drop)
-------------------------------
1. Go to https://app.netlify.com/drop and sign in.
2. Drag the WHOLE extracted aureva-website folder (not just index.html) into the page.
3. Open the netlify.app address on your phone and test the menu, gallery, WhatsApp and Instagram buttons.
Tip: the data/ultra-hd folder is large. If you only want a fast site, you can delete
data/ultra-hd before uploading — the website works without it, only the "Open ultra HD"
button inside the photo viewer would stop working.

Please read — about the photos
------------------------------
- All photos are AI-generated campaign visuals (concept imagery), NOT photographs of your actual stock.
  Use them for the brand look; add real product photos before taking paid orders or running ads.
- They were cut out of your 14 collage sheets (one photo per frame). The source frames are ~350–450 px wide,
  so the "ultra-hd" files are 4x AI-upscaled (about 1400–1700 px), not true 4K. A few key photos
  used on the homepage were upscaled with a stronger model (EDSR); the rest with a faster one (FSRCNN).
  For real 4K print/ads, re-generate the favourites at full resolution in your image tool.
- The "under ₹599" claim is taken from your Instagram bio — confirm it is current.
- No delivery fees, return policy, materials or warranty have been invented. Add your real policies before launch.
