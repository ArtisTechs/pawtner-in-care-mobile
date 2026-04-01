# Pawtner In Care Mobile

Pawtner In Care Mobile is a React Native app for animal rescue and pet welfare workflows.  
It helps users report stray emergencies, discover veterinary clinics, support donation drives, browse adoptable pets, join community and volunteer activities, and manage their account in one app.

## Core Functionalities

- Authentication and account lifecycle:
  - Login and sign up
  - OTP verification for sign up and password reset
  - Forgot password and change password flows
  - Persisted user session with auth gate routing
- Home dashboard:
  - Promo cards and quick navigation to major modules
  - Categories for veterinary, pets, events, volunteer, heroes wall, and more
  - Notification shortcut with unread indicator
- Pet adoption:
  - Pet listing with search and filters (`All`, `Favorites`, `Dogs`, `Cats`)
  - Pet detail view with foster info and media
  - Favorite toggling
- Donations:
  - Donation intro, home, and listing screens
  - Filtered causes (`All`, `Urgent`, `Health`, `Foods`)
  - Payment method selection with QR preview
  - Copy payment details to clipboard
  - Save QR image to device gallery
  - Upload donation proof image from gallery
- Events and volunteer:
  - Calendar and list tabs
  - Local event date filters (`Today`, `Week`, `Month`, `Year`)
  - Event details modal and outbound Facebook link handling
- SOS rescue flow:
  - Capture report image via camera or choose from gallery
  - Select report type and submit details
  - Map-based location selection and reverse-geocoded location text
  - Waiting screen with responder contact actions (call/SMS)
  - Tracker map showing responder route and location progress
- Veterinary clinics:
  - Clinic listing with search, filters, and sorting
  - Clinic detail screen with map, service details, and media
  - Distance computation based on user location permission
- Community:
  - Scrollable feed of posts
  - Create local posts with caption, hashtags, photos, and optional video
  - Like toggle and basic engagement actions
- Notifications:
  - `Updates` and `Unread` tabs
  - Mark-as-read behavior
  - Notification-driven route navigation to related modules
- Heroes Wall:
  - Leaderboards for `Weekly`, `Monthly`, and `All Time` donor rankings
- Support chat:
  - In-app chat UI with bot replies for common support intents
- Profile:
  - User info display with badges
  - Edit profile name modal
  - Settings shortcuts and sign out action

## Data Sources

- Auth-related flows are wired to API endpoints (`/auth/*`).
- Most feature modules currently use local mock data for UI and interaction flows.

## Tech Stack

- Expo + React Native + TypeScript
- Expo Router (file-based routing)
- React Navigation
- Expo Camera, Image Picker, Media Library, Location
- React Native WebView (Leaflet map rendering)

## Environment Variables

Create a `.env` file in the project root if needed:

```bash
EXPO_PUBLIC_API_BASE_URL=http://<your-api-host>:<port>/api
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=<optional-google-maps-key>
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=<your-cloudinary-upload-preset>
EXPO_PUBLIC_CLOUDINARY_FOLDER=<optional-target-folder>
```

Notes:
- `EXPO_PUBLIC_API_BASE_URL` is used by the API client.
- `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` is optional; maps can fall back to Leaflet/OpenStreetMap behavior when no key is provided.
- `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME` and `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET` are required for profile photo upload.
- `EXPO_PUBLIC_CLOUDINARY_FOLDER` is optional.

## Requirements

- Node.js 20+
- npm 10+

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Start the app:

```bash
npm run start
```

Use a platform target as needed:

- `npm run android`
- `npm run ios`
- `npm run web`

## Quality Checks

```bash
npm run lint
npx tsc --noEmit
```
