
Auto-commit setup for Accion-Contact-Tree

Goal

Allow admins (who know the admin password) to update the contact list in the browser and have the site automatically commit the changes to GitHub without requiring the admin to paste a token.

How it works

- The front-end (running on GitHub Pages or Netlify) detects when an admin successfully logs in.
- If a meta tag named `auto-commit-endpoint` exists in the page (or the tag is injected server-side), the site will POST the contacts JSON and the admin password to that endpoint.
- A serverless function (example provided for Netlify) verifies the admin password against an environment variable and, if valid, commits `contacts.json` to the configured GitHub repo using a server-side GITHUB_TOKEN.

Files added

- `netlify/functions/commit-contacts.js` — Netlify serverless function implementing the commit flow.
- Front-end changes in `app.js` and `index.html` to call the endpoint automatically when admin logs in.

Deployment (Netlify)

1. Create a Netlify site connected to this repository.
2. In the Netlify site settings, add the following environment variables:
	- `GITHUB_TOKEN` — a Personal Access Token with `repo` (or `public_repo`) scope. Keep it secret.
	- `OWNER` — repository owner (e.g., `ketchumj13`).
	- `REPO` — repository name (e.g., `Accion-Contact-Tree`).
	- `ADMIN_PASSWORD` — the admin password to validate (should match the password used in the front-end, currently `accionmicrosoft25`).

3. Deploy the site. Netlify will build and expose the function at:
	https://<your-site>.netlify.app/.netlify/functions/commit-contacts

4. Configure your front-end to include the following meta tag in `index.html` (served to browsers):

	<meta name="auto-commit-endpoint" content="https://<your-site>.netlify.app/.netlify/functions/commit-contacts">

	You can place that meta tag directly in `index.html` (it's commented as an example already), or inject it server-side if you have a build step.

Security notes

- The server-side `GITHUB_TOKEN` must remain secret and should be stored as an environment variable in your hosting platform.
- The browser-side admin password is sent to the server for validation over HTTPS; ensure the endpoint is HTTPS.
- Use a short-lived token or rotate the token per security policies where possible.

Alternatives

- If you don't want to run a serverless function, the safer manual flow is to Export JSON and commit the `contacts.json` file through the GitHub web UI or git locally.
- I can also add a GitHub Action that listens for PRs or files uploaded to a specific branch and automatically merges them, if preferred.

Backup branch behavior

- Before updating `contacts.json` on the target branch (e.g., `main`), the Netlify function now creates a timestamped backup branch named `backup-contacts-YYYY-MM-DDTHH-MM-SS-sssZ` and commits the full `contacts.json` into that branch. This is a best-effort backup so you can inspect or restore previous content if a merged change is problematic.
- You can view backups in your repository's branch list on GitHub. Each backup branch contains the commit that was taken just before the main update.

If you'd like automatic cleanup of old backup branches, I can add logic to prune backups older than N days.

Automatic prune workflow

- A GitHub Actions workflow `.github/workflows/prune-backups.yml` has been added. It runs daily (03:00 UTC) and deletes `backup-contacts-*` branches older than 30 days.
- The script used is `.github/scripts/prune-backups.js`. The retention period is controlled by the `DAYS` environment variable in the workflow (defaults to 30). To change retention, edit the workflow and set `DAYS` to the desired number.

Security note: the workflow uses the built-in `GITHUB_TOKEN` to delete branches and does not require additional secrets.

If you want, I can also:
- Add a small confirmation modal UI before the auto-commit happens.
- Add versioning/timestamps to contacts so the function can detect stale updates.

