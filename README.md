<div align="center">

# Workout Log

**A simple lifting tracker for your phone: log a set in two taps and watch your strength go up over time.**

<img alt="Built with Next.js" src="https://img.shields.io/badge/Built_with-Next.js-24292f?style=for-the-badge"> <img alt="Data in Postgres" src="https://img.shields.io/badge/Data_in-Postgres-24292f?style=for-the-badge"> <img alt="Made for your phone" src="https://img.shields.io/badge/Made_for-your_phone-24292f?style=for-the-badge">

</div>

<br>

Most workout apps want you to plan programs, follow routines and fill in a dozen fields. This one only asks what you lifted and how many times. Every set is saved as a new entry and nothing is ever overwritten, so your full history is always there. It's a personal app: there are no accounts, just a private link you add to your home screen.

## What you can do with it

- Log a set (weight and reps) for any exercise, grouped by muscle: shoulders, chest, back, biceps, triceps, core and legs.
- See the last thing you lifted for each exercise right on the home screen, so you know what to beat.
- Find an exercise fast with a forgiving search: typing "bp" finds Bench Press, and spaces, dashes and capitals don't matter.
- Open an exercise to see every set you've logged for it.
- Check the analytics page for estimated one-rep-max trends and how each muscle group is growing, over the range you choose.
- Add it to your iPhone home screen, where it opens like a regular app.

## How it's built

Next.js and TypeScript on Vercel, with Postgres on Neon queried in plain SQL (no ORM). Charts are drawn as plain SVG, with no chart library. The logic for analytics, search and validation lives in small tested modules under `lib/`.

## Run it locally

You need Node 20+ and a Postgres database.

```bash
git clone https://github.com/james-helou/workout-log.git
cd workout-log
npm install
psql "$DATABASE_URL" -f lib/schema.sql   # once, to create the tables
echo 'DATABASE_URL=postgres://...' > .env.local
npm run dev
```

Then open `http://localhost:3000/<any-slug>`. Run the tests with `npm test`.
