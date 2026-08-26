const fs = require("node:fs/promises");

const username = process.env.GITHUB_REPOSITORY_OWNER || "LieL420";
const brandName = process.env.PROFILE_BRAND_NAME || "LyelStudio.Web";
const token = process.env.GITHUB_TOKEN;

const headers = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

if (token) {
  headers.Authorization = `Bearer ${token}`;
}

async function getJson(url) {
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`GitHub request failed: ${response.status} ${url}`);
  }
  return response.json();
}

async function getPaginated(url) {
  const results = [];
  let nextUrl = url;

  while (nextUrl) {
    const response = await fetch(nextUrl, { headers });
    if (!response.ok) {
      throw new Error(`GitHub request failed: ${response.status} ${nextUrl}`);
    }

    results.push(...(await response.json()));
    const link = response.headers.get("link") || "";
    const nextMatch = link.match(/<([^>]+)>;\s*rel="next"/);
    nextUrl = nextMatch ? nextMatch[1] : "";
  }

  return results;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function repoRow(repo) {
  const description = repo.description || "Profile repository";
  const language = repo.language || "Markdown / README";
  const updated = new Date(repo.updated_at).toISOString().slice(0, 10);

  return `| [${repo.name}](${repo.html_url}) | ${escapeHtml(description)} | ${language} | ${repo.stargazers_count} | ${repo.forks_count} | ${updated} |`;
}

function languageBadge(name, percent) {
  const label = encodeURIComponent(name);
  const message = encodeURIComponent(`${percent}%`);
  return `<img src="https://img.shields.io/badge/${label}-${message}-0e75b6?style=flat" alt="${escapeHtml(name)} ${percent}%" />`;
}

async function main() {
  const user = await getJson(`https://api.github.com/users/${username}`);
  const repos = await getPaginated(
    `https://api.github.com/users/${username}/repos?per_page=100&type=owner&sort=updated`,
  );

  const activeRepos = repos.filter((repo) => !repo.archived);
  const totalStars = activeRepos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  const totalForks = activeRepos.reduce((sum, repo) => sum + repo.forks_count, 0);
  const languages = new Map();

  for (const repo of activeRepos) {
    const data = await getJson(repo.languages_url);
    for (const [name, bytes] of Object.entries(data)) {
      languages.set(name, (languages.get(name) || 0) + bytes);
    }
  }

  const totalLanguageBytes = [...languages.values()].reduce((sum, bytes) => sum + bytes, 0);
  const languageBadges = totalLanguageBytes
    ? [...languages.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, bytes]) => languageBadge(name, Math.round((bytes / totalLanguageBytes) * 100)))
        .join("\n  ")
    : "No programming language data detected yet.";

  const repoRows = activeRepos.length
    ? activeRepos.map(repoRow).join("\n")
    : "| No public repositories found | - | - | - | - | - |";

  const updatedAt = new Date().toISOString().slice(0, 10);
  const displayName = user.name || username;
  const joined = new Date(user.created_at).toISOString().slice(0, 10);

  const readme = `<h1 align="center">Hey 👋, I'm ${escapeHtml(displayName)}</h1>
<h3 align="center">${escapeHtml(brandName)}</h3>

<p align="center">
  <img src="https://komarev.com/ghpvc/?username=${username}&label=Profile%20Views&color=0e75b6&style=flat" alt="Profile Views" />
  <img src="https://img.shields.io/github/followers/${username}?label=Followers&style=flat" alt="Followers" />
  <img src="https://img.shields.io/badge/Public_repos-${user.public_repos}-0e75b6?style=flat&logo=github" alt="Public repositories" />
</p>

<table align="center" width="100%">
  <tr>
    <td align="center"><strong>${user.public_repos}</strong><br />public repositories</td>
    <td align="center"><strong>${user.followers}</strong><br />followers</td>
    <td align="center"><strong>${user.following}</strong><br />following</td>
    <td align="center"><strong>${totalStars}</strong><br />stars</td>
    <td align="center"><strong>${totalForks}</strong><br />forks</td>
  </tr>
</table>

<table align="center" width="100%">
  <tr>
    <td width="50%" align="center">
      <img
        src="https://github-stats-extended.vercel.app/api?username=${username}&show_icons=true&include_all_commits=true&theme=tokyonight&hide_border=true&rank_icon=github"
        alt="GitHub Stats"
        width="100%"
      />
    </td>
    <td width="50%" align="center">
      <img
        src="https://github-readme-streak-stats-eight.vercel.app/?user=${username}&theme=tokyonight&hide_border=true"
        alt="GitHub Streak"
        width="100%"
      />
    </td>
  </tr>
</table>

<h2 align="center">📌 Real GitHub Data</h2>

| Field | Value |
| --- | --- |
| Username | \`${username}\` |
| Public name | ${escapeHtml(displayName)} |
| GitHub profile | [github.com/${username}](${user.html_url}) |
| Joined GitHub | ${joined} |
| Last automatic update | ${updatedAt} |

<h2 align="center">📁 Current Public Repositories</h2>

| Repository | Description | Main language | Stars | Forks | Updated |
| --- | --- | --- | ---: | ---: | --- |
${repoRows}

<h2 align="center">🛠️ Detected Languages</h2>

<p align="center">
  ${languageBadges}
</p>

<table align="center" width="100%">
  <tr>
    <td width="75%" align="center">
      <h3>📈 Profile Details</h3>
      <img
        src="https://github-profile-summary-cards.vercel.app/api/cards/profile-details?username=${username}&theme=tokyonight"
        alt="Profile Details"
        width="100%"
      />
    </td>
    <td width="25%" align="center">
      <h3>📌 GitHub Overview</h3>
      <img
        src="https://github-profile-summary-cards.vercel.app/api/cards/stats?username=${username}&theme=tokyonight"
        alt="GitHub Overview"
        width="100%"
      />
    </td>
  </tr>
</table>

<table align="center" width="100%">
  <tr>
    <td width="50%" align="center">
      <img
        src="https://github-profile-summary-cards.vercel.app/api/cards/repos-per-language?username=${username}&theme=tokyonight"
        alt="Languages by Repository"
        width="100%"
      />
    </td>
    <td width="50%" align="center">
      <img
        src="https://github-profile-summary-cards.vercel.app/api/cards/most-commit-language?username=${username}&theme=tokyonight"
        alt="Languages by Commit"
        width="100%"
      />
    </td>
  </tr>
</table>

<!-- This README is generated by scripts/update-readme.js using live GitHub data. -->
`;

  await fs.writeFile("README.md", readme);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
