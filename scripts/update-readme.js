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

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function main() {
  const user = await getJson(`https://api.github.com/users/${username}`);
  const displayName = user.name || username;

  const readme = `<h1 align="center">Hey 👋, I'm ${escapeHtml(displayName)}</h1>
<h3 align="center">${escapeHtml(brandName)}</h3>

<p align="center">
  <img src="https://komarev.com/ghpvc/?username=${username}&label=Profile%20Views&color=0e75b6&style=flat" alt="Profile Views" />
  <img src="https://img.shields.io/github/followers/${username}?label=Followers&style=flat" alt="Followers" />
</p>

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

<h2 align="center">🛠️ Tech Stack</h2>

<p align="center">
  <img
    src="https://skillicons.dev/icons?i=html,css,js,ts,react,nextjs,nodejs,express,tailwind,git,github,figma,vercel&perline=13&size=10"
    alt="Tech Stack"
  />
</p>

<table align="center" width="100%">
  <tr>
    <td width="75%" align="center">
      <h3>📈 Contribution Activity</h3>
      <img
        src="https://github-profile-summary-cards.vercel.app/api/cards/profile-details?username=${username}&theme=tokyonight"
        alt="Contribution Activity"
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
`;

  await fs.writeFile("README.md", readme);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
