import {readFile, writeFile, mkdir, cp} from 'node:fs/promises';
import {resolve, dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {scienceFigure} from '../assets/js/science.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const outIndex = args.indexOf('--out');
const out = outIndex < 0 ? join(root, 'dist') : resolve(args[outIndex + 1]);
const preview = args.includes('--preview');
const origin = 'https://sldyns.github.io';
const papers = JSON.parse(await readFile(join(root, 'site/publications.json'), 'utf8'));
const assetVersions = Object.fromEntries(await Promise.all(['css/studio.css','css/home.css','js/studio.js','js/science.js','js/goatcounter.js'].map(async path => [path,createHash('sha256').update(await readFile(join(root,'assets',path))).digest('hex').slice(0,10)])));
const asset = path => `/assets/${path}?v=${assetVersions[path]}`;
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
const route = (lang, page = '') => `${lang === 'zh' ? '/zh/' : '/'}${page ? `${page}/` : ''}`;
async function save(path, content) {
  const file = join(out, path);
  await mkdir(dirname(file), {recursive:true});
  await writeFile(file, content, 'utf8');
}

const education = [
  {date:['2023 — Present','2023 — 至今'], degree:['Ph.D. candidate in Statistics','统计学博士研究生'], university:['Peking University','北京大学'], detail:['Supervisor: Ruibin Xi','导师：Ruibin Xi']},
  {date:['2020 — 2023','2020 — 2023'], degree:['M.S. in Mathematics','数学硕士'], university:['China University of Geosciences (Wuhan)','中国地质大学（武汉）'], detail:['Supervisor: Hongwei Li · Thesis: Research on Integration Analysis for Single-cell RNA Sequencing Data','导师：Hongwei Li · 学位论文：单细胞 RNA 测序数据整合分析研究']},
  {date:['2016 — 2020','2016 — 2020'], degree:['B.S. in Mathematics and Applied Mathematics','数学与应用数学学士'], university:['China University of Geosciences (Wuhan)','中国地质大学（武汉）'], detail:['','']},
];
const software = [
  {name:'SpaHDmap', area:['Spatial transcriptomics','空间转录组学'], desc:['Interpretable, high-resolution dimension reduction through the integration of spatial transcriptomics and histology images.','结合空间转录组数据与组织学图像，获得可解释的高分辨率表征。'], features:[['Multimodal learning','多模态学习'],['Multiple spatial datasets','多个空间转录组数据集的整合']], paper:2},
  {name:'scINSIGHT', area:['Single-cell integration','单细胞数据整合'], desc:['A matrix factorization model for analyzing single-cell samples from different biological conditions, including disease phases, treatment groups, and developmental stages.','用矩阵分解方法，联合分析来自不同疾病阶段、治疗组或发育阶段的单细胞样本。'], features:[['Shared and condition-specific patterns','共享与条件特异的表达模式'],['Batch correction','批次效应校正'],['Automated parameter selection','自动选择参数']], paper:9},
  {name:'scAce', area:['Adaptive clustering','自适应聚类'], desc:['Jointly learns cell embeddings and cluster assignments with a variational autoencoder and adaptive cluster merging.','利用变分自编码器学习细胞表征，并通过自适应簇合并不断更新聚类结果。'], features:[['Adaptive embedding and clustering','自适应表征学习与聚类'],['Large-scale scRNA-seq','适用于大规模单细胞 RNA 测序数据']], paper:8},
  {name:'scBiG', area:['Graph representation learning','图表征学习'], desc:['Learns cell and gene embeddings from a cell–gene bipartite graph using a graph autoencoder.','利用图自编码器，从细胞—基因二部图中学习细胞与基因的低维表征。'], features:[['Cell–gene relationships','细胞与基因关系建模'],['Biological structure preservation','保留生物学结构']], paper:7},
];

for (const lang of ['en', 'zh']) {
  const t = (en, zh) => lang === 'zh' ? zh : en;
  const displayName = t('Kun Qian', '钱坤');
  const pair = values => values[lang === 'zh' ? 1 : 0];
  const home = route(lang);
  const feedback = `<div id="site-feedback" class="site-feedback" aria-label="${t('Website feedback','网站反馈')}">
    <button id="site-like" class="site-feedback__like" type="button" disabled aria-pressed="false" aria-describedby="like-status" title="${t('Like this website once per browser','每个浏览器可点赞一次')}"><span id="like-heart" aria-hidden="true">♡</span><span id="like-label">${t('Like this site','喜欢这个网站')}</span><span id="like-count" class="site-feedback__count">—</span></button>
    <span id="like-status" class="site-feedback__status" role="status" aria-live="polite"></span><noscript>${t('Enable JavaScript to like this site.','启用 JavaScript 后可以点赞。')}</noscript></div>`;

  function layout(page, title, desc, content) {
    const nav = [[`${home}#research`,t('Research','研究'), 'research'], [route(lang,'publications'),t('Publications','论文'),'publications'], [route(lang,'software'),t('Software','软件'),'software'], [route(lang,'cv'),t('CV','简历'),'cv'], [`${home}#fun-projects`,t('Fun projects','个人项目'),'fun-projects']];
    const navLinks = nav.map(([href,label,id]) => `<a href="${href}"${page === id ? ' aria-current="page"' : ''}>${label}</a>`).join('');
    const languages = ['en','zh'].map(locale => `<a href="${route(locale,page)}" lang="${locale === 'zh' ? 'zh-CN' : 'en'}" hreflang="${locale === 'zh' ? 'zh-CN' : 'en'}"${lang === locale ? ' aria-current="true"' : ''} data-language="${locale}">${locale === 'en' ? 'EN' : '中文'}</a>`).join('');
    const fullTitle = page ? `${title} — ${displayName}` : `${displayName} — ${t('Bioinformatics & AI for Science','生物信息学与 AI for Science')}`;
    return `<!doctype html>
<html lang="${lang === 'zh' ? 'zh-CN' : 'en'}">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escape(fullTitle)}</title><meta name="description" content="${escape(desc)}">
<meta name="theme-color" content="#f7f4ee"><meta name="color-scheme" content="light">
${preview ? '<meta name="robots" content="noindex,nofollow">' : ''}
<link rel="canonical" href="${origin}${route(lang,page)}">
<link rel="alternate" hreflang="en" href="${origin}${route('en',page)}"><link rel="alternate" hreflang="zh-CN" href="${origin}${route('zh',page)}"><link rel="alternate" hreflang="x-default" href="${origin}${route('en',page)}">
<meta property="og:type" content="website"><meta property="og:title" content="${escape(fullTitle)}"><meta property="og:description" content="${escape(desc)}"><meta property="og:url" content="${origin}${route(lang,page)}"><meta property="og:image" content="${origin}/images/profile.png"><meta property="og:locale" content="${lang === 'zh' ? 'zh_CN' : 'en_US'}">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="${asset('css/studio.css')}">
${!page ? `<link rel="stylesheet" href="${asset('css/home.css')}"><script type="module" src="${asset('js/science.js')}"></script>` : ''}
<script src="${asset('js/studio.js')}" defer></script><script src="${asset('js/goatcounter.js')}" data-endpoint="https://sldyns.goatcounter.com/count" data-site-host="sldyns.github.io" data-track="${!preview}" defer></script>
</head><body class="home-view${page ? ' inner-view' : ' home-editorial'}">
<a class="studio-skip" href="#main">${t('Skip to content','跳至正文')}</a>
<header class="studio-header"><div class="studio-header__inner"><a class="studio-brand" href="${home}" aria-label="${displayName} ${t('home','首页')}">${displayName}</a><nav class="studio-nav" aria-label="${t('Main navigation','主导航')}">${navLinks}</nav><div class="studio-controls"><nav class="language-switch" aria-label="${t('Language','语言')}">${languages}</nav><details class="studio-menu"><summary>${t('Menu','菜单')}<span aria-hidden="true">+</span></summary><nav aria-label="${t('Mobile navigation','移动端导航')}">${navLinks}</nav></details></div></div></header>
<main id="main" class="home-page${page ? ' inner-page' : ''}" tabindex="-1">${content}</main>
<footer class="site-footer"><div class="site-footer__inner"><div><a class="footer-name" href="${home}">${displayName}</a><p>${t('Bioinformatics & AI for Science','生物信息学与 AI for Science')}</p><p class="footer-copyright">© ${new Date().getUTCFullYear()} ${displayName}</p></div><div class="footer-meta"><a href="mailto:kunqian@stu.pku.edu.cn">kunqian@stu.pku.edu.cn ↗</a><p>${t('Site views','网站浏览量')} <span id="visitor-count">—</span></p>${page ? feedback : ''}</div></div></footer>
</body></html>\n`;
  }

  const sourceHome = (await readFile(join(root,`site/home.${lang}.html`),'utf8')).replaceAll('@@HOME@@',home).replace('@@FEEDBACK@@',feedback).replace(/@@SCIENCE:(helix|network|distribution)@@/g,(_,kind)=>scienceFigure(kind));
  await save(`${home.slice(1)}index.html`,layout('', '', t('Kun Qian, Ph.D. candidate in Statistics at Peking University. Bioinformatics, AI for Science, statistical learning, and curious side projects.','钱坤，北京大学统计学博士研究生。研究生物信息学、AI for Science 与统计学习，也做一些有趣的交互项目。'), sourceHome));

  function intro(kicker,title,desc,extra='') {
    return `<section class="page-intro"><p class="home-eyebrow">${kicker}</p><h1>${title}</h1><p>${desc}</p>${extra}</section>`;
  }
  const years = [...new Set(papers.map(p=>p.year))];
  const jump = `<nav class="year-nav" aria-label="${t('Publication year','论文年份')}">${years.map(year=>`<a href="#year-${year}">${year}</a>`).join('')}</nav>`;
  const publicationBody = intro(t('Research / Publications','研究 / 论文'),t('Publications','学术论文'),t('Methods, applications, and perspectives in computational biology.','主要包括生物信息学方法、生物医学应用及相关综述。'),`<p class="contribution-note">${t('* Equal contribution.','* 表示共同贡献')}</p>${jump}`) + years.map(year=>`<section id="year-${year}" class="publication-year"><h2>${year}</h2><div>${papers.filter(p=>p.year===year).map(p=>`<article class="publication"><p class="publication-journal">${escape(p.journal)} <span>${p.year}</span></p><h3><a href="${escape(p.url)}">${escape(p.title)} <span aria-hidden="true">↗</span></a></h3><p class="publication-authors">${escape(p.authors).replaceAll('Kun Qian','<strong>Kun Qian</strong>')}</p><p class="publication-summary">${escape(p.description[lang])}</p></article>`).join('')}</div></section>`).join('');
  await save(`${route(lang,'publications').slice(1)}index.html`,layout('publications',t('Publications','学术论文'),t('Publications by Kun Qian in bioinformatics and computational biology.','钱坤 在生物信息学与计算生物学领域的学术论文。'),publicationBody));

  const softwareBody = intro(t('Research / Open-source tools','研究 / 开源软件'),t('Research software','科研软件'),t('Tools for exploring biological data, from single cells to spatial tissues.','我参与开发的单细胞与空间组学分析软件，代码和使用文档均已开源。'))+`<div class="software-grid">${software.map((s,i)=>`<article class="software-card"><div class="software-card__top"><p class="home-eyebrow">${pair(s.area)}</p><span aria-hidden="true">0${i+1}</span></div><h2>${s.name}</h2><p>${pair(s.desc)}</p><ul>${s.features.map(f=>`<li>${pair(f)}</li>`).join('')}</ul><div class="software-links"><a href="https://github.com/sldyns/${s.name}">${t('Code & documentation','代码与文档')} ↗</a><a href="${escape(papers[s.paper].url)}">${t('Paper','论文')} ↗</a></div></article>`).join('')}</div><aside class="software-more"><div><p class="home-eyebrow">${t('Beyond research','研究之外')}</p><h2>${t('A few things for fun','个人项目')}</h2><p>${t('Explore cells in BioScape, or take a virtual walk through Yanyuan in PKU-3D.','还做了两个三维交互项目：生物科普网站 BioScape 和北大校园地图 PKU-3D。')}</p></div><a class="home-text-link" href="${home}#fun-projects">${t('See fun projects','查看项目')} ↗</a></aside>`;
  await save(`${route(lang,'software').slice(1)}index.html`,layout('software',t('Software','科研软件'),t('Open-source bioinformatics software: SpaHDmap, scINSIGHT, scAce, and scBiG.','生物信息学开源软件：SpaHDmap、scINSIGHT、scAce 与 scBiG。'),softwareBody));

  const skills = [
    [t('Single-cell & spatial omics','单细胞与空间组学'),t('Data integration, clustering, representation learning, and multimodal analysis.','数据整合、聚类、表征学习与多模态分析。')],
    [t('Statistical & machine learning methods','统计与机器学习方法'),t('Statistical modeling, dimensionality reduction, graph neural networks, contrastive learning, and generative modeling.','统计建模、降维、图神经网络、对比学习与生成建模。')],
    [t('Programming','编程语言'),'Python · R · MATLAB'],
    [t('Languages','语言'),t('Chinese (native) · English (professional working proficiency)','中文（母语）· 英语（工作交流）')],
  ];
  const awards = [
    ['2026',t('National Scholarship for Postgraduates (Doctoral)','研究生国家奖学金（博士）')],
    ['2025',t('2025–2026 BICMR Mathematical Award for Graduate Students','2025–2026 北大数学研究生奖')],
    ['2022',t('Best Paper Award, RECOMB 2022','RECOMB 2022 最佳论文奖')],
    ['2022',t('National Scholarship for Postgraduates (Master’s)','研究生国家奖学金（硕士）')],
    ['2021',t('First Prize, China Post-Graduate Mathematical Contest in Modeling','中国研究生数学建模竞赛一等奖')],
  ];
  const cvBody = `<div class="cv-print-heading"><strong>${displayName}</strong><p>kunqian@stu.pku.edu.cn · sldyns.github.io</p></div>` + intro(t('Background / CV','关于我 / 简历'),t('Curriculum Vitae','个人简历'),t('Mathematics and statistics, with a focus on biological questions.','北京大学统计学博士研究生，研究方向为生物信息学与 AI for Science。'),`<button class="print-button" type="button" data-print hidden>${t('Print / Save as PDF','打印 / 保存为 PDF')} ↗</button>`)+
    `<section class="cv-section"><h2>${t('Education','教育经历')}</h2><ol class="home-education">${education.map(e=>`<li><span>${pair(e.date)}</span><div><h3>${pair(e.degree)}</h3><p>${pair(e.university)}</p>${pair(e.detail) ? `<p class="education-detail">${pair(e.detail)}</p>` : ''}</div></li>`).join('')}</ol></section><section class="cv-section"><h2>${t('Research interests','研究兴趣')}</h2><div class="cv-prose"><p>${t('Bioinformatics, AI for Science, single-cell and spatial omics, and statistical learning.','生物信息学、AI for Science、单细胞与空间组学，以及统计学习。')}</p><p>${t('Current interests also include genomics, epigenomics, and computational approaches to sequence design.','近期也关注基因组学、表观基因组学，以及序列设计的计算方法。')}</p></div></section><section class="cv-section"><h2>${t('Methods & skills','方法与技能')}</h2><dl class="cv-skills">${skills.map(([name,desc])=>`<div><dt>${name}</dt><dd>${desc}</dd></div>`).join('')}</dl></section><section class="cv-section"><h2>${t('Awards','奖励')}</h2><ol class="cv-awards">${awards.map(([year,name])=>`<li><span>${year}</span><p>${name}</p></li>`).join('')}</ol></section><div class="cv-links"><a class="home-text-link" href="${route(lang,'publications')}">${t('Full publication list','完整论文列表')} ↗</a><a class="home-text-link" href="mailto:kunqian@stu.pku.edu.cn">${t('Get in touch','联系我')} ↗</a></div>`;
  await save(`${route(lang,'cv').slice(1)}index.html`,layout('cv',t('CV','简历'),t('Education, research interests, methods, and awards of Kun Qian.','钱坤 的教育经历、研究兴趣、方法技能与奖励。'),cvBody));
}

await save('404.html', `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Page not found — Kun Qian</title><link rel="stylesheet" href="/assets/css/studio.css"><body class="home-view"><main class="not-found"><p class="home-eyebrow">404</p><h1>Page not found</h1><p lang="zh-CN">这个页面不存在，可能已被移到其他位置。</p><a class="home-button" href="/">English homepage ↗</a> <a class="home-text-link" href="/zh/">中文首页 ↗</a></main></body></html>\n`);
for (const [path,target] of [['about/index.html','/'],['about.html','/'],['resume/index.html','/cv/'],['publications.html','/publications/']]) {
  await save(path,`<!doctype html><html lang="en"><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${target}"><link rel="canonical" href="${origin}${target}"><meta name="robots" content="noindex"><title>Page moved — Kun Qian</title><a href="${target}">Continue to Kun Qian’s website</a></html>\n`);
}
await save('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['en','zh'].flatMap(lang=>['','publications','software','cv'].map(page=>`<url><loc>${origin}${route(lang,page)}</loc></url>`)).join('')}</urlset>\n`);
await save('robots.txt',preview ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
await save('.nojekyll','');
if (out !== root) {
  await cp(join(root,'assets'),join(out,'assets'),{recursive:true});
  await cp(join(root,'images'),join(out,'images'),{recursive:true});
}
console.log(`Built 8 bilingual pages, 404, redirects, and sitemap (${preview ? 'preview: tracking disabled' : 'production'}).`);
