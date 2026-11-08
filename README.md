# BTGC Group — Static Website

HTML + Tailwind CSS v4 + GSAP (ScrollTrigger, SplitText) + Lenis smooth scroll.
No framework and no server code. Every page is a plain `.html` file.

## Pages
| File | Content |
|---|---|
| `index.html` | Home: hero, about intro, services (horizontal scroll), selected projects, clients, why BTGC, delivery process, certifications, CTA |
| `about.html` | Story, leadership, resources, capability & strength, organisation chart, quality policy, HSE, completion in time, certificates |
| `services.html` | 7 disciplines in detail with photo galleries, plus the 5-stage work breakdown structure |
| `projects.html` | 6 flagship case studies with galleries, and a filterable portfolio of 14 other projects |
| `contact.html` | Contact details, enquiry form, map, Abu Dhabi and Dubai offices |
| `404.html` | Not-found page |

## Run it
Open `index.html` in a browser. For best results (fonts and page transitions), serve the folder:

```bash
npx serve .            # or: python -m http.server 8000
```

## Edit styles (Tailwind v4)
The compiled CSS is already in `assets/css/style.css`. To change the design:

```bash
npm install
npm run dev     # watches src/input.css and the HTML, rebuilds assets/css/style.css
npm run build   # minified production build
```

Design tokens (colours, fonts, easing) are in the `@theme` block of `src/input.css`.
Brand colours come from the BTGC logo: navy `#00387b` and red `#d52b20`.
Layout language follows mnjprojects.in: inset rounded hero card, diagonal panel, round menu button + side drawer, pill labels, "Keep in touch" footer.

## Replace before going live
These placeholders appear in every page:
- Phone: `+971 2 XXX XXXX` and `tel:+9712XXXXXXX`
- WhatsApp: `https://wa.me/9712XXXXXXX`
- Email: `info@btgc-uae.com` (please confirm this is the right address)

Use find-and-replace across all `.html` files.

## Enquiry form
This is a static site, so the form opens the visitor's email app with the enquiry pre-filled,
addressed to the `data-email` value on `<form id="enquiry-form">`. To receive submissions
directly instead, point the form at a service such as Formspree, Web3Forms or Netlify Forms.

## Animation hooks (assets/js/main.js)
Add these attributes to any element:
- `data-split`: heading lines slide up on scroll
- `data-words`: words light up as you scroll
- `data-reveal` (`data-delay="0.1"`): fade and slide up
- `data-stagger`: children animate in sequence
- `data-img-reveal` (`="left"` or `"right"`): clip-path image reveal
- `data-parallax="0.12"`: parallax on scroll
- `data-count="60"`: number counter
- `data-lightbox="group"` on an `<a href="image">`: opens in the gallery viewer
- `data-magnetic`: magnetic hover on buttons

Animations are switched off for visitors who set "reduce motion" in their system settings.

## Folders
```
assets/css/style.css      compiled Tailwind
assets/js/main.js         all interactions
assets/js/vendor/         gsap, ScrollTrigger, SplitText, lenis (served locally)
assets/fonts/             Be Vietnam Pro + Great Vibes (self-hosted, matching the reference)
assets/img/               WebP images taken from the company profile
src/input.css             Tailwind source
```
