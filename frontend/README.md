# Restored coursework frontend

The original GrubDash demo frontend was supplied with the Thinkful coursework. Its source was recovered from the public source map at https://grub-dash-front-end-xi.vercel.app/static/js/main.6db22b1b.chunk.js.map on October 21, 2026. The matching header image and menu styles were recovered from that same deployment. This is restored supplied code, not a claim of original UI design.

The repair changes the API base to the same origin, serves the React router below /demo, fixes the mobile-number label/default field, bundles the existing UI dependencies locally, and adds an explicit demonstration notice. `npm run build:demo` produces public/demo; `npm start` serves both API and frontend. The build uses esbuild instead of restoring the older Create React App toolchain.
