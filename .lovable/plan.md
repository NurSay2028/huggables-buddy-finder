# Goal: Get the site indexed by Google

The site already has solid on-page SEO (titles, descriptions, Open Graph, robots.txt, sitemap.xml). What's missing is connecting the live domain to **Google Search Console** so Google knows the site exists, verifies ownership, and starts crawling/indexing it. Right now no property is registered.

## What I'll do

### 1. Generate a Google verification token
Use the Google Search Console connector to request a `META` verification token for the domain `https://drjanibek.uz/` (and `https://www.drjanibek.uz/`).

### 2. Add the verification meta tag to the site
Insert the connector-issued `google-site-verification` tag into the site `<head>` (`src/routes/__root.tsx`), replacing the existing stale token so Google can confirm ownership.

### 3. Publish (your step)
The meta tag must be live on the real domain before Google can verify it. After I add the tag, you click **Publish → Update**. I can't verify until the change is live.

### 4. Verify ownership + register the property
After publish, I call the connector to verify the meta tag and add the site as a property in your Search Console account.

### 5. Submit the sitemap
Tell Google about `https://drjanibek.uz/sitemap.xml` so it discovers all pages. I'll also confirm the sitemap's base URL matches your primary domain.

## Notes / things to confirm

- **Primary domain**: your canonical currently points to `https://www.drjanibek.uz/` but the site also serves `https://drjanibek.uz/`. I'll register the primary one and keep canonical consistent. If you have a preference for `www` vs non-`www`, tell me.
- **Indexing takes time**: even after this, Google typically takes a few days to a few weeks to start showing the site in search results. This setup is the required first step — it doesn't make it instant.
- This is mostly a backend/connector + small meta-tag change; no visual changes to the site.

After you approve, I'll add the verification tag, then ask you to Publish, then finish verification and submit the sitemap.
