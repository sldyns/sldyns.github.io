import {readFile, access} from 'node:fs/promises';
import {resolve, dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const index = process.argv.indexOf('--out');
const root = index < 0 ? join(repo, 'dist') : resolve(process.argv[index + 1]);
const preview = process.argv.includes('--preview');
const routes = ['/', '/publications/', '/software/', '/cv/', '/zh/', '/zh/publications/', '/zh/software/', '/zh/cv/'];
const pages = new Map(await Promise.all(routes.map(async path => [path,await readFile(join(root,path,'index.html'),'utf8')])));
const ids = new Map();
let links = 0;
for (const [path, html] of pages) {
  const found = [...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(found.length,new Set(found).size,`${path}: duplicate IDs`);
  ids.set(path,new Set(found));
  assert.equal((html.match(/<h1\b/g)||[]).length,1,`${path}: one primary heading`);
  assert.match(html,new RegExp(`<html lang="${path.startsWith('/zh/') ? 'zh-CN' : 'en'}">`));
  assert.match(html,/rel="canonical"/);
  assert.match(html,/hreflang="zh-CN"/);
  assert.match(html,/hreflang="en"/);
  for (const id of ['site-like','like-status','like-count','visitor-count','like-label','like-heart']) assert.ok(ids.get(path).has(id),`${path}: missing ${id}`);
  assert.match(html,new RegExp(`data-track="${!preview}"`));
  assert.doesNotMatch(html,/@@|\{%|\{\{|main\.min\.js|main\.scss|jquery|AcademicPages|Powered by/i);
  const samePage = path.replace(/^\/zh\//,'/');
  const languageLinks = [...html.matchAll(/<a href="([^"]+)"[^>]*data-language="(en|zh)"/g)];
  assert.equal(languageLinks.length,2);
  for (const [,url,lang] of languageLinks) assert.equal(url,lang==='en' ? samePage : `/zh${samePage}`);
}
for (const [path,html] of pages) {
  for (const [,raw] of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const url = new URL(raw.replaceAll('&amp;','&'),`https://sldyns.github.io${path}`);
    if (url.origin !== 'https://sldyns.github.io') continue;
    // Project sites have their own repositories and deployment roots.
    if (['/bioscape/','/PKU-3D/'].includes(url.pathname)) continue;
    const target = decodeURIComponent(url.pathname);
    await access(join(root,target,target.endsWith('/') ? 'index.html' : ''));
    if (url.hash) assert.ok(ids.get(target)?.has(decodeURIComponent(url.hash.slice(1))),`${path}: missing anchor ${raw}`);
    links++;
  }
}
const publications = JSON.parse(await readFile(join(repo,'site/publications.json'),'utf8'));
assert.equal(publications.length,10);
for (const paper of publications) {
  assert.ok(paper.authors.includes('Kun Qian'));
  assert.doesNotMatch(paper.authors,/<|>|\n/);
  assert.ok(new URL(paper.url).protocol==='https:');
  assert.equal((paper.url.match(/\(/g)||[]).length,(paper.url.match(/\)/g)||[]).length);
  assert.ok(paper.description.en && paper.description.zh);
}
for (const prefix of ['/','/zh/']) {
  assert.equal((pages.get(`${prefix}publications/`).match(/class="publication"/g)||[]).length,10);
  assert.equal((pages.get(`${prefix}software/`).match(/class="software-card"/g)||[]).length,4);
  assert.equal((pages.get(prefix).match(/class="home-project"/g)||[]).length,2);
  const home = pages.get(prefix);
  assert.deepEqual([...home.matchAll(/data-science="([^"]+)"/g)].map(m=>m[1]),['helix','network','distribution']);
  // Each illustration must exist before JavaScript runs, not just as an empty mount point.
  assert.equal((home.match(/<g data-science-shapes><(?:line|path|circle) /g)||[]).length,3);
  assert.match(home,/data-science-toggle[^>]+hidden/);
  assert.doesNotMatch(home,/NaN|Infinity/);
}
await access(join(root,'.nojekyll'));
for (const [path,target] of [['about/index.html','/'],['about.html','/'],['resume/index.html','/cv/'],['publications.html','/publications/']]) {
  const html = await readFile(join(root,path),'utf8');
  assert.ok(html.includes(`content="0;url=${target}"`),`${path}: redirect target`);
}
const sitemap = await readFile(join(root,'sitemap.xml'),'utf8');
for (const path of routes) assert.ok(sitemap.includes(`<loc>https://sldyns.github.io${path}</loc>`));
console.log(`Verified 8 pages, ${links} internal links/assets, 10 publications per language, static science illustrations, locale pairs, counters, and tracking mode.`);
