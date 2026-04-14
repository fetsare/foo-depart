# Foo Depart

[![English](https://img.shields.io/badge/English-1f6feb?style=for-the-badge)](README.md)
[![Svenska](https://img.shields.io/badge/Svenska-f59e0b?style=for-the-badge)](README.sv.md)

A Next.js departure board for the Stockholm region using the [Trafiklab Resrobot API](https://www.trafiklab.se/api/our-apis/resrobot-v21/).

## Contents

- [Quickstart](#quickstart)
- [Env](#env)
- [Deploy](#deploy)
- [Kiosk](#kiosk)
- [Notes](#notes)
- [Stats](#stats)

## Quickstart

1. Fork and clone.

```bash
git clone https://github.com/<your-user>/foo-depart.git
cd foo-depart
```

2. Install dependencies.

```bash
npm install
```

3. Create local environment file.

```bash
cp .env.example .env.local
```

4. Add your own data.

```bash
# Edit station/stop data
code lib/departures.json
```

5. Start development server.

```bash
npm run dev
```

6. Open the stop ID lookup tool.

- Local: [http://localhost:3000/stop-lookup](http://localhost:3000/stop-lookup)
- Deployed: [https://depart.fredriketsare.se/stop-lookup](https://depart.fredriketsare.se/stop-lookup)

## Env

Required: Trafiklab/Resrobot API

- `RESROBOT_ACCESS_ID`
- `RESROBOT_API_BASE_URL`
- `API_DURATION`

Required for contact/inquiry flow:

- `RESEND_API_KEY`
- `JWT_SECRET`
- `ADMIN_EMAIL`

Required for GitHub issue/branch automation:

- `GITHUB_TOKEN`
- `GITHUB_OWNER`
- `GITHUB_REPO`
- `GITHUB_BASE_BRANCH` (default: `main`)

Canonical public site URL (used for sitemap and internal app URL generation):

- `NEXT_PUBLIC_SITE_URL`

Public GitHub links used in UI:

- `NEXT_PUBLIC_GITHUB_REPO_URL`
- `NEXT_PUBLIC_GITHUB_BADGE_REPO`

Public UI tuning:

- `NEXT_PUBLIC_DEFAULT_MIN_TIME_THRESHOLD`
- `NEXT_PUBLIC_MAX_DEPARTURES_TO_DISPLAY`

Optional email signature used in approval/rejection replies:

- `CONTACT_SIGNATURE_NAME`

## Deploy

Deploy on Vercel.

1. Import your fork in Vercel.
2. Add the same environment variables as in `.env.local`.
3. Set `NEXT_PUBLIC_SITE_URL` to your production URL.
4. Deploy.

## Kiosk

To run this as a live departure screen, you need:

- a computer (Raspberry Pi, mini-PC, or old laptop)
- a monitor/TV
- a browser in kiosk mode (full-screen, no browser UI)

Raspberry Pi guide: https://www.raspberrypi.com/tutorials/how-to-use-a-raspberry-pi-in-kiosk-mode/

## Notes

- The project was first launched at the student union pub [Foo Bar](https://maps.app.goo.gl/TgiGXqVqhSn2ttnFA) under [The Student union DISK](https://disk.su.se)
- You can add custom contributor display names in `lib/contributor_names.json`.

## Stats

![lighthouse state](/public/lh.png)