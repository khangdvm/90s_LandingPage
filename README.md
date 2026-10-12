# 90s Homestay — React + Vite

Frontend-only React prototype, converted from the supplied 90sLanding demo. Uses JavaScript functional components, hooks and plain CSS; preserves the original layout, red branding, typography and all frontend interactions.

## Requirements and local run

Use Node.js 22.12+ (or a newer supported LTS version) and npm.

```sh
cd 90s_LandingPage
npm install
npm run dev
```

For a production build:

```sh
npm run build
npm run preview
```

Deploy the generated `dist/` directory to static hosting. `base: './'` supports deployment within a subdirectory. Use Vite or static hosting; opening the React source `index.html` through `file://` is not supported.

## Structure

- `src/main.jsx`: React root and CSS import.
- `src/App.jsx`: shared room/date state and modal routing.
- `src/components/`: Header, HeroSlider, About, Rooms, Restaurant, Cafe, Offers, News, ConsultationModal and Footer. Related detail views are exported alongside their section components.
- `src/data/data.js`: contacts, rooms, restaurant/cafe data, hero campaigns, news and asset/date helpers.
- `src/styles/styles.css`: original plain CSS, with asset paths adapted for Vite.
- `public/assets/images/`: hero, room/food/cafe collages, logo and news placeholder.
- `public/assets/fonts/`: Be Vietnam Pro fonts and SIL Open Font License.

## Features

- Room view/capacity filters, indicative prices, details and all-room view.
- Expected arrival/departure dates used solely as consultation context.
- Shared native dialog with Escape, focus containment and focus restoration.
- Room consultation preserves the selected room and expected stay context.
- Restaurant menu, cafe detail views and demo offers.
- Data-driven hero slider: six-second autoplay, previous/next, dots, pause, keyboard and swipe. Pauses on hover/focus and hidden tabs; reduced motion disables autoplay/transitions.
- Mobile navigation, news categories and client-side pagination at six articles per page.

## Official content to replace

Set `PLACEHOLDER_HOTLINE`, `PLACEHOLDER_ZALO_URL` and `PLACEHOLDER_FACEBOOK_URL` in `src/data/data.js`. Do not enter invented business details. Placeholder links are clearly marked unavailable and intercepted; configured hotline uses `tel:`, social links open with `noopener noreferrer`.

Replace demo room data, news titles/excerpts/dates/links and campaign content with approved information. News thumbnails and campaign images currently reuse the original hero photo. Add a campaign as one object in `HERO_SLIDES`. Store images under `public/assets/images/` and reference them as `assets/images/...` in data.

The uploaded ZIP had no image files and zero-byte fonts. Complete image/font assets were restored from the earlier supplied prototype; no empty assets are included. Collage quadrants preserve the original presentation. Fonts are self-hosted and licensed under `public/assets/fonts/OFL.txt`.

## Backend

There is no backend, API, database, CMS, authentication, booking engine or payment in this project. No information is submitted or stored. Vite is only a frontend development/build tool; dates do not check room availability.

## Repository

The React application lives at the repository root. Source, configuration, npm lockfile, assets and README are committed. `node_modules/` and generated `dist/` are ignored; run the commands above to reproduce them.
