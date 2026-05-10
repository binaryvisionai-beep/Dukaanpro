# Supabase Setup for DukaanPro

1. Create project at [https://app.supabase.com](https://app.supabase.com).
2. Open SQL Editor and run `supabase/schema.sql`.
3. Go to Project Settings -> API and copy:
   - Project URL
   - anon public key
4. Put both values in `app.json` under `expo.extra`.
5. Restart Expo after updating config.

## Recommended next step

Create authenticated users and per-shop ownership policies, then add RLS policies for each table.
