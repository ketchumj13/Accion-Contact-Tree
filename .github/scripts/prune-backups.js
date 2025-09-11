#!/usr/bin/env node

(async function() {
	try {
		const token = process.env.GITHUB_TOKEN;
		const repo = process.env.GITHUB_REPOSITORY;
		const days = parseInt(process.env.DAYS || '30', 10);

		if (!token || !repo) {
			console.error('GITHUB_TOKEN and GITHUB_REPOSITORY must be set');
			process.exit(1);
		}

		const [owner, repoName] = repo.split('/');
		const headers = {
			Authorization: `token ${token}`,
			'User-Agent': 'prune-backups-script',
			Accept: 'application/vnd.github+json'
		};

		const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

		const refsUrl = `https://api.github.com/repos/${owner}/${repoName}/git/refs/heads?per_page=1000`;
		const refsResp = await fetch(refsUrl, { headers });
		if (!refsResp.ok) {
			const txt = await refsResp.text();
			throw new Error(`Failed to list refs: ${refsResp.status} ${txt}`);
		}

		const refs = await refsResp.json();
		const backups = refs.filter(r => r.ref && r.ref.startsWith('refs/heads/backup-contacts-'));

		console.log(`Found ${backups.length} backup branches to evaluate`);

		for (const ref of backups) {
			try {
				const sha = ref.object && ref.object.sha;
				if (!sha) continue;

				const commitUrl = `https://api.github.com/repos/${owner}/${repoName}/git/commits/${sha}`;
				const commitResp = await fetch(commitUrl, { headers });
				if (!commitResp.ok) {
					console.warn(`Failed to fetch commit ${sha} for ${ref.ref}: ${commitResp.status}`);
					continue;
				}

				const commit = await commitResp.json();
				const dateStr = (commit.committer && commit.committer.date) || (commit.author && commit.author.date) || null;
				if (!dateStr) {
					console.warn(`No date found for commit ${sha} (${ref.ref}), skipping`);
					continue;
				}

				const ts = new Date(dateStr).getTime();
				if (isNaN(ts)) {
					console.warn(`Invalid date ${dateStr} for ${ref.ref}, skipping`);
					continue;
				}

				if (ts < cutoff) {
					const branchName = ref.ref.replace('refs/heads/', '');
					const delUrl = `https://api.github.com/repos/${owner}/${repoName}/git/refs/heads/${encodeURIComponent(branchName)}`;
					const delResp = await fetch(delUrl, { method: 'DELETE', headers });
					if (delResp.ok) {
						console.log(`Deleted backup branch: ${branchName}`);
					} else {
						const t = await delResp.text();
						console.warn(`Failed to delete ${branchName}: ${delResp.status} ${t}`);
					}
				} else {
					console.log(`Keeping ${ref.ref} (age within retention)`);
				}
			} catch (err) {
				console.error('Error processing ref', ref.ref, err);
			}
		}

		console.log('Prune job completed');
	} catch (err) {
		console.error('Prune script failed:', err);
		process.exit(1);
	}
})();

