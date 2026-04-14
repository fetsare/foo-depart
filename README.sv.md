# Foo Depart

[![English](https://img.shields.io/badge/English-1f6feb?style=for-the-badge)](README.md)
[![Svenska](https://img.shields.io/badge/Svenska-f59e0b?style=for-the-badge)](README.sv.md)

En Next.js-baserad avgångstavla som visar avgångar i Stockholmsregionen via [Trafiklab Resrobot API](https://www.trafiklab.se/api/our-apis/resrobot-v21/).

## Innehåll

- [Snabbstart](#snabbstart)
- [Miljövariabler](#miljövariabler)
- [Distribution](#distribution)
- [Kioskläge](#kioskläge)
- [Noteringar](#noteringar)

## Snabbstart

1. Forka och klona.

```bash
git clone https://github.com/<ditt-användarnamn>/foo-depart.git
cd foo-depart
```

2. Installera dependencies.

```bash
npm install
```

3. Skapa lokal env fil.

```bash
cp .env.example .env.local
```

4. Lägg in egen data.

```bash
# Redigera hållplats/stationsdata
code lib/departures.json
```

5. Starta utvecklingsservern.

```bash
npm run dev
```

6. Öppna verktyget för stopp-ID-sökning.

```bash
# i din webbläsare
http://localhost:3000/stop-lookup
# eller i min deployment
https://depart.fredriketsare/stop-lookup
```

## Miljövariabler

Trafiklab/Resrobot API

- `RESROBOT_ACCESS_ID`
- `RESROBOT_API_BASE_URL`
- `API_DURATION`

Krävs för kontakt-/ärendeflöde:

- `RESEND_API_KEY`
- `JWT_SECRET`
- `ADMIN_EMAIL`

Krävs för GitHub issue/branch-automation:

- `GITHUB_TOKEN`
- `GITHUB_OWNER`
- `GITHUB_REPO`
- `GITHUB_BASE_BRANCH` (standard: `main`)

Kanonisk publik site-URL (används för sitemap och intern URL-generering):

- `NEXT_PUBLIC_SITE_URL`

Publika för UI:

- `NEXT_PUBLIC_GITHUB_REPO_URL`
- `NEXT_PUBLIC_GITHUB_BADGE_REPO`
- `NEXT_PUBLIC_DEFAULT_MIN_TIME_THRESHOLD`
- `NEXT_PUBLIC_MAX_DEPARTURES_TO_DISPLAY`

Valfri e-postsignatur för godkännande/avslag:

- `CONTACT_SIGNATURE_NAME`

## Distribution

Deploya på Vercel.

1. Importera din fork i Vercel.
2. Lägg in samma miljövariabler som i `.env.local`.
3. Sätt `NEXT_PUBLIC_SITE_URL` till din produktions-URL.
4. Deploya.

## Kioskläge

För att köra detta som en live avgångstavla behöver du:

- en dator (Raspberry Pi, mini-PC eller äldre laptop)
- en skärm/TV
- en webbläsare i kioskläge (fullskärm utan webbläsar-UI)

Guide för Raspberry Pi:

- https://www.raspberrypi.com/tutorials/how-to-use-a-raspberry-pi-in-kiosk-mode/

## Noteringar

- Projektet lanserades först på studentpuben [Foo Bar](https://maps.app.goo.gl/TgiGXqVqhSn2ttnFA) under [Studentkaren DISK](https://disk.su.se).
- Du kan ange egna visningsnamn för contributors i [lib/contributor_names.json](lib/contributor_names.json).
