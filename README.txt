ADNEX AI STUDIO — REAL VIDEO API STARTER

This version integrates a backend with Runway Dev's text-to-video API.
It is a starter template, not a hosted service. It needs your own Runway Dev account and API key.
Video generation may cost credits; check the provider's current pricing before running it.

REQUIREMENTS
- Node.js LTS installed
- Internet connection
- Runway Dev API account and API key

WINDOWS SETUP
1. Extract this ZIP to a folder.
2. Open that folder in File Explorer.
3. Copy `.env.example` and rename the copy to `.env`.
4. Open `.env` in Notepad. Replace PASTE_YOUR_RUNWAY_API_KEY_HERE with your real key.
   Do not share the key or put it into public HTML/JavaScript.
5. In that folder, click the address bar, type `cmd`, and press Enter.
6. Run:
   npm install
   npm start
7. Open http://localhost:3000 in Chrome.
8. Enter a detailed video prompt and click Generate AI Video.

HOW IT WORKS
- Browser sends the prompt to the local Express backend.
- Backend calls Runway Dev POST /v1/text_to_video.
- The browser checks GET /v1/tasks/{id} until it completes and then shows the video URL.

CURRENT LIMITS
- Uses the `gen4.5` model by default; model availability, parameters, credit cost and policies can change.
- Generates one short 5-second clip per request.
- This is not yet a full 60-second editor, multi-scene renderer, or public production app.
- Before public deployment add user authentication, rate limiting, spending limits, abuse protection and secure secret management.
- The provider's video URL may have its own expiry/retention rules; save the clip if needed.

OFFICIAL DOCS
https://docs.dev.runwayml.com/guides/using-the-api/
https://docs.dev.runwayml.com/api/
