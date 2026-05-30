/**
 * 构建脚本 - 从数据生成多页面静态站点
 * 运行: node build.js
 */
const fs = require('fs');
const path = require('path');
const { SITE_CONFIG, categories, tools } = require('./data/tools');

const DIST = __dirname; // 直接输出到根目录，Vercel可以直接服务

// 清理旧的生成文件（只删除HTML和XML文件，不删除源代码）
const filesToClean = ['index.html', 'sitemap.xml', 'robots.txt', 'ads.txt'];
filesToClean.forEach(f => {
  const fp = path.join(__dirname, f);
  if (fs.existsSync(fp)) fs.unlinkSync(fp);
});
['tool', 'category'].forEach(dir => {
  const dp = path.join(__dirname, dir);
  if (fs.existsSync(dp)) fs.rmSync(dp, { recursive: true });
});
fs.mkdirSync(path.join(__dirname, 'tool'), { recursive: true });
fs.mkdirSync(path.join(__dirname, 'category'), { recursive: true });

// ========== 公共组件 ==========

function headHTML(title, description, keywords, canonical) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta name="keywords" content="${keywords}">
  <link rel="canonical" href="${canonical}">
  <!-- Open Graph -->
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonical}">
  <meta property="og:site_name" content="${SITE_CONFIG.name}">
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <!-- Google Analytics -->
  ${SITE_CONFIG.gaId !== "G-XXXXXXXXXX" ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${SITE_CONFIG.gaId}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${SITE_CONFIG.gaId}');
  </script>` : ''}
  <!-- Google AdSense -->
  ${SITE_CONFIG.adsenseId !== "ca-pub-XXXXXXXXXX" ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${SITE_CONFIG.adsenseId}" crossorigin="anonymous"></script>` : ''}
  <style>${CSS}</style>
</head>`;
}

function headerHTML() {
  return `<header class="header">
  <div class="header-inner">
    <a href="/" class="logo">🚀 ${SITE_CONFIG.name}</a>
    <div class="search-container">
      <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
      </svg>
      <input type="text" class="search-input" id="searchInput" placeholder="搜索AI工具...">
    </div>
  </div>
</header>`;
}

function navHTML(activeCategory) {
  const btns = categories.map(c =>
    `<a href="/category/${c.id}.html" class="category-btn ${activeCategory === c.id ? 'active' : ''}">${c.icon} ${c.name}</a>`
  ).join('');
  return `<nav class="categories">
  <div class="categories-container">
    <a href="/" class="category-btn ${!activeCategory ? 'active' : ''}">🔥 全部</a>
    ${btns}
  </div>
</nav>`;
}

function adBannerHTML(slot) {
  const labels = {
    top: '顶部横幅广告',
    middle: '内容区域广告',
    bottom: '底部横幅广告',
  };
  return `<div class="ad-banner">
  <div class="ad-inner">
    <span class="ad-label">广告</span>
    <div class="ad-placeholder">${labels[slot] || '广告位'} - 联系我们投放</div>
  </div>
</div>`;
}

function footerHTML() {
  const catLinks = categories.map(c =>
    `<a href="/category/${c.id}.html">${c.icon} ${c.name}</a>`
  ).join('');
  return `<footer class="footer">
  <div class="footer-content">
    <div class="footer-grid">
      <div class="footer-col">
        <h4>分类导航</h4>
        <div class="footer-links">${catLinks}</div>
      </div>
      <div class="footer-col">
        <h4>关于</h4>
        <div class="footer-links">
          <a href="/about.html">关于我们</a>
          <a href="/submit.html">提交工具</a>
          <a href="/contact.html">广告合作</a>
          <a href="/contact.html">联系方式</a>
          <a href="/privacy.html">隐私政策</a>
        </div>
      </div>
      <div class="footer-col">
        <h4>热门工具</h4>
        <div class="footer-links">
          <a href="/tool/chatgpt.html">ChatGPT</a>
          <a href="/tool/midjourney.html">Midjourney</a>
          <a href="/tool/claude.html">Claude</a>
          <a href="/tool/elevenlabs.html">ElevenLabs</a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© 2024 ${SITE_CONFIG.name} - 发现最佳AI工具</p>
    </div>
  </div>
</footer>`;
}

function toolCardHTML(tool) {
  const tagHTML = tool.tags.map(tag => {
    const cls = ['免费', '免费试用', '开源'].includes(tag) ? 'free' : (tag === '付费' ? 'paid' : '');
    return `<span class="tool-tag ${cls}">${tag}</span>`;
  }).join('');
  return `<a href="/tool/${tool.id}.html" class="tool-card">
  <div class="tool-icon" style="background: ${tool.color}15;">${tool.icon}</div>
  <div class="tool-info">
    <h3>${tool.name}</h3>
    <p>${tool.description.substring(0, 60)}...</p>
    <div class="tool-tags">${tagHTML}</div>
  </div>
  <span class="tool-arrow">→</span>
</a>`;
}

// ========== CSS ==========
const CSS = `
* { margin: 0; padding: 0; box-sizing: border-box; }
:root {
  --primary: #4F46E5;
  --primary-light: #818CF8;
  --bg: #F8FAFC;
  --card-bg: #FFFFFF;
  --text: #1E293B;
  --text-sec: #64748B;
  --border: #E2E8F0;
  --shadow: 0 1px 3px rgba(0,0,0,0.08);
  --shadow-hover: 0 8px 30px rgba(0,0,0,0.1);
}
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.6;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
a { text-decoration: none; color: inherit; }

/* Header */
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0 20px;
}
.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 0;
  gap: 20px;
}
.logo {
  color: white;
  font-size: 1.4rem;
  font-weight: 700;
  white-space: nowrap;
}
.search-container {
  position: relative;
  flex: 1;
  max-width: 500px;
}
.search-input {
  width: 100%;
  padding: 12px 16px 12px 44px;
  font-size: 0.95rem;
  border: none;
  border-radius: 50px;
  background: rgba(255,255,255,0.95);
  outline: none;
  transition: box-shadow 0.3s;
}
.search-input:focus { box-shadow: 0 0 0 3px rgba(255,255,255,0.3); }
.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-sec);
}

/* Categories Nav */
.categories {
  background: white;
  padding: 12px 20px;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
}
.categories-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
}
.categories-container::-webkit-scrollbar { display: none; }
.category-btn {
  padding: 8px 18px;
  border-radius: 25px;
  font-size: 0.88rem;
  white-space: nowrap;
  transition: all 0.2s;
  color: var(--text-sec);
  background: var(--bg);
  font-weight: 500;
}
.category-btn:hover { background: var(--primary-light); color: white; }
.category-btn.active { background: var(--primary); color: white; }

/* Main */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
  flex: 1;
  width: 100%;
}

/* Hero Section (Homepage) */
.hero {
  text-align: center;
  padding: 50px 20px 30px;
}
.hero h1 {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hero p { color: var(--text-sec); font-size: 1.1rem; }
.stats {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-top: 25px;
}
.stat-item { text-align: center; }
.stat-num { font-size: 1.8rem; font-weight: 700; color: var(--primary); }
.stat-label { font-size: 0.85rem; color: var(--text-sec); }

/* Section */
.section { margin-bottom: 45px; }
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.section-title {
  font-size: 1.35rem;
  font-weight: 600;
}
.section-more {
  color: var(--primary);
  font-size: 0.9rem;
  font-weight: 500;
}
.section-more:hover { text-decoration: underline; }

/* Tools Grid */
.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

/* Tool Card */
.tool-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 18px 20px;
  transition: all 0.25s;
}
.tool-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
  border-color: var(--primary-light);
}
.tool-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}
.tool-info { flex: 1; min-width: 0; }
.tool-info h3 { font-size: 1rem; font-weight: 600; margin-bottom: 4px; }
.tool-info p { font-size: 0.85rem; color: var(--text-sec); line-height: 1.4; }
.tool-tags { display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap; }
.tool-tag {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.72rem;
  background: var(--bg);
  color: var(--text-sec);
}
.tool-tag.free { background: #D1FAE5; color: #059669; }
.tool-tag.paid { background: #FEF3C7; color: #D97706; }
.tool-arrow {
  color: var(--text-sec);
  font-size: 1.2rem;
  flex-shrink: 0;
  transition: transform 0.2s;
}
.tool-card:hover .tool-arrow { transform: translateX(3px); color: var(--primary); }

/* Tool Detail Page */
.tool-detail { max-width: 800px; margin: 0 auto; }
.tool-detail-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}
.tool-detail-icon {
  width: 72px;
  height: 72px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
}
.tool-detail-header h1 { font-size: 2rem; font-weight: 700; }
.tool-detail-header .tags { display: flex; gap: 8px; margin-top: 8px; }
.tool-detail-body h2 { font-size: 1.3rem; margin: 30px 0 15px; font-weight: 600; }
.tool-detail-body p { color: var(--text-sec); line-height: 1.8; margin-bottom: 15px; }
.highlights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}
.highlight-item {
  background: var(--bg);
  padding: 14px;
  border-radius: 10px;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 500;
}
.visit-btn {
  display: inline-block;
  padding: 14px 40px;
  background: var(--primary);
  color: white;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  margin-top: 20px;
  transition: all 0.3s;
}
.visit-btn:hover { background: #4338CA; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(79,70,229,0.4); }
.breadcrumb {
  margin-bottom: 25px;
  font-size: 0.9rem;
  color: var(--text-sec);
}
.breadcrumb a { color: var(--primary); }
.breadcrumb a:hover { text-decoration: underline; }

/* Ad Banner */
.ad-banner {
  background: var(--bg);
  border: 1px dashed var(--border);
  border-radius: 12px;
  padding: 10px;
  margin: 30px 0;
}
.ad-inner { text-align: center; }
.ad-label {
  display: inline-block;
  font-size: 0.7rem;
  color: var(--text-sec);
  background: var(--border);
  padding: 2px 8px;
  border-radius: 4px;
  margin-bottom: 8px;
}
.ad-placeholder {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
}

/* Footer */
.footer {
  background: white;
  border-top: 1px solid var(--border);
  padding: 40px 20px;
  margin-top: auto;
}
.footer-content { max-width: 1200px; margin: 0 auto; }
.footer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 30px;
  margin-bottom: 30px;
}
.footer-col h4 {
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 12px;
}
.footer-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.footer-links a {
  color: var(--text-sec);
  font-size: 0.88rem;
  transition: color 0.2s;
}
.footer-links a:hover { color: var(--primary); }
.footer-bottom {
  border-top: 1px solid var(--border);
  padding-top: 20px;
  text-align: center;
}
.footer-bottom p { color: var(--text-sec); font-size: 0.85rem; }

/* Legal Pages */
.legal-page { max-width: 800px; margin: 0 auto; }
.legal-page h1 { font-size: 2rem; margin-bottom: 10px; }
.legal-page h2 { font-size: 1.3rem; margin: 30px 0 15px; font-weight: 600; }
.legal-page p { color: var(--text-sec); line-height: 1.8; margin-bottom: 15px; }
.legal-page ul { color: var(--text-sec); line-height: 2; margin-bottom: 15px; padding-left: 20px; }
.legal-page a { color: var(--primary); }
.submit-form { background: var(--bg); border-radius: 12px; padding: 25px; margin: 20px 0; }
.form-item { margin-bottom: 20px; }
.form-item label { font-weight: 600; display: block; margin-bottom: 5px; }
.form-item p { color: var(--text-sec); font-size: 0.9rem; margin: 0; }

/* No Results */
.no-results { text-align: center; padding: 60px 20px; color: var(--text-sec); }
.no-results h3 { font-size: 1.2rem; margin-bottom: 8px; }

/* Responsive */
@media (max-width: 768px) {
  .header-inner { flex-direction: column; padding: 15px 0; }
  .hero h1 { font-size: 1.6rem; }
  .stats { gap: 25px; }
  .tools-grid { grid-template-columns: 1fr; }
  .tool-detail-header { flex-direction: column; text-align: center; }
  .tool-detail-header .tags { justify-content: center; }
}
`;

// ========== 页面生成 ==========

// 1. 首页
function generateIndex() {
  const categorySections = categories.map(cat => {
    const catTools = tools.filter(t => t.category === cat.id);
    const cards = catTools.map(t => toolCardHTML(t)).join('');
    return `<div class="section">
  <div class="section-header">
    <h2 class="section-title">${cat.icon} ${cat.name}</h2>
    <a href="/category/${cat.id}.html" class="section-more">查看全部 →</a>
  </div>
  <div class="tools-grid">${cards}</div>
</div>`;
  }).join('');

  const html = `${headHTML(
    `${SITE_CONFIG.name} - 发现最佳AI工具`,
    SITE_CONFIG.description,
    SITE_CONFIG.keywords,
    SITE_CONFIG.domain
  )}
<body>
  ${headerHTML()}
  ${navHTML('')}
  <main class="main-content">
    <div class="hero">
      <h1>发现最佳AI工具</h1>
      <p>精选优质AI工具，助你提升工作效率和创造力</p>
      <div class="stats">
        <div class="stat-item"><div class="stat-num">${tools.length}+</div><div class="stat-label">收录工具</div></div>
        <div class="stat-item"><div class="stat-num">${categories.length}</div><div class="stat-label">工具分类</div></div>
        <div class="stat-item"><div class="stat-num">日更</div><div class="stat-label">内容更新</div></div>
      </div>
    </div>
    ${adBannerHTML('top')}
    ${categorySections}
    ${adBannerHTML('bottom')}
  </main>
  ${footerHTML()}
  <script>
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && this.value.trim()) {
          window.location.href = '/category/all.html?q=' + encodeURIComponent(this.value.trim());
        }
      });
    }
  </script>
</body>
</html>`;
  fs.writeFileSync(path.join(DIST, 'index.html'), html);
  console.log('✅ 首页生成完成');
}

// 2. 分类页
function generateCategoryPages() {
  // 全部分类页（搜索结果也用这个）
  const allTools = tools;
  const allHtml = buildCategoryPage('all', '全部工具', '所有AI工具合集', allTools, '');
  fs.writeFileSync(path.join(DIST, 'category', 'all.html'), allHtml);
  console.log('✅ 全部分类页生成完成');

  categories.forEach(cat => {
    const catTools = tools.filter(t => t.category === cat.id);
    const html = buildCategoryPage(cat.id, cat.name, cat.description, catTools, cat.icon);
    fs.writeFileSync(path.join(DIST, 'category', `${cat.id}.html`), html);
    console.log(`✅ 分类页 ${cat.name} 生成完成`);
  });
}

function buildCategoryPage(catId, catName, catDesc, catTools, catIcon) {
  const cards = catTools.map(t => toolCardHTML(t)).join('');
  const html = `${headHTML(
    `${catName} - ${SITE_CONFIG.name}`,
    `${catDesc}。${SITE_CONFIG.name}收录了${catTools.length}个${catName}，包括${catTools.slice(0,3).map(t=>t.name).join('、')}等热门工具。`,
    `${catName},AI${catName},${catTools.map(t=>t.name).join(',')}`,
    `${SITE_CONFIG.domain}/category/${catId}.html`
  )}
<body>
  ${headerHTML()}
  ${navHTML(catId)}
  <main class="main-content">
    <div class="breadcrumb">
      <a href="/">首页</a> / <span>${catIcon} ${catName}</span>
    </div>
    <h1 class="section-title">${catIcon} ${catName}</h1>
    <p style="color:var(--text-sec);margin-bottom:25px;">${catDesc}，共收录 ${catTools.length} 个工具</p>
    ${adBannerHTML('top')}
    <div class="tools-grid" id="toolsGrid">${cards}</div>
    ${adBannerHTML('bottom')}
  </main>
  ${footerHTML()}
  <script>
    // 搜索过滤
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    const searchInput = document.getElementById('searchInput');
    if (q && searchInput) {
      searchInput.value = q;
      filterTools(q);
    }
    if (searchInput) {
      searchInput.addEventListener('input', function() {
        filterTools(this.value);
      });
    }
    function filterTools(query) {
      const cards = document.querySelectorAll('.tool-card');
      const q = query.toLowerCase();
      cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(q) ? '' : 'none';
      });
    }
  </script>
</body>
</html>`;
  return html;
}

// 3. 工具详情页
function generateToolPages() {
  tools.forEach(tool => {
    const cat = categories.find(c => c.id === tool.category);
    const relatedTools = tools.filter(t => t.category === tool.category && t.id !== tool.id).slice(0, 4);
    const relatedHTML = relatedTools.map(t => toolCardHTML(t)).join('');

    const highlightsHTML = (tool.highlights || []).map(h =>
      `<div class="highlight-item">${h}</div>`
    ).join('');

    const tagHTML = tool.tags.map(tag => {
      const cls = ['免费', '免费试用', '开源'].includes(tag) ? 'free' : (tag === '付费' ? 'paid' : '');
      return `<span class="tool-tag ${cls}">${tag}</span>`;
    }).join('');

    const html = `${headHTML(
      `${tool.name} - ${cat.name}AI工具评测 - ${SITE_CONFIG.name}`,
      `${tool.description}。了解${tool.name}的功能特点、定价方案和替代工具推荐。`,
      `${tool.name},${tool.name}替代品,${tool.name}免费版,${tool.name}评测,${cat.name}AI工具`,
      `${SITE_CONFIG.domain}/tool/${tool.id}.html`
    )}
<body>
  ${headerHTML()}
  ${navHTML(tool.category)}
  <main class="main-content">
    <div class="tool-detail">
      <div class="breadcrumb">
        <a href="/">首页</a> / <a href="/category/${tool.category}.html">${cat.icon} ${cat.name}</a> / <span>${tool.name}</span>
      </div>

      <div class="tool-detail-header">
        <div class="tool-detail-icon" style="background:${tool.color}15;">${tool.icon}</div>
        <div>
          <h1>${tool.name}</h1>
          <div class="tags">${tagHTML}</div>
        </div>
      </div>

      ${adBannerHTML('top')}

      <div class="tool-detail-body">
        <h2>工具简介</h2>
        <p>${tool.description}</p>

        <h2>核心功能</h2>
        <div class="highlights-grid">${highlightsHTML}</div>

        <h2>定价方案</h2>
        <p>${tool.pricing}</p>

        <div style="text-align:center;">
          <a href="${tool.url}" target="_blank" rel="noopener noreferrer" class="visit-btn">访问 ${tool.name} →</a>
        </div>
      </div>

      ${adBannerHTML('middle')}

      <div class="section" style="margin-top:40px;">
        <h2 class="section-title">同类工具推荐</h2>
        <div class="tools-grid">${relatedHTML}</div>
      </div>

      ${adBannerHTML('bottom')}
    </div>
  </main>
  ${footerHTML()}
</body>
</html>`;
    fs.writeFileSync(path.join(DIST, 'tool', `${tool.id}.html`), html);
    console.log(`✅ 工具页 ${tool.name} 生成完成`);
  });
}

// 4. Sitemap
function generateSitemap() {
  const today = new Date().toISOString().split('T')[0];
  let urls = [];

  // 首页
  urls.push(`  <url><loc>${SITE_CONFIG.domain}/</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>`);

  // 分类页
  categories.forEach(cat => {
    urls.push(`  <url><loc>${SITE_CONFIG.domain}/category/${cat.id}.html</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`);
  });

  // 工具详情页
  tools.forEach(tool => {
    urls.push(`  <url><loc>${SITE_CONFIG.domain}/tool/${tool.id}.html</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`);
  });

  // 功能页
  ['privacy', 'about', 'contact', 'submit'].forEach(page => {
    urls.push(`  <url><loc>${SITE_CONFIG.domain}/${page}.html</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>`);
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
  fs.writeFileSync(path.join(DIST, 'sitemap.xml'), sitemap);
  console.log('✅ sitemap.xml 生成完成');
}

// 5. ads.txt
function generateAdsTxt() {
  // 从 adsenseId 中提取 publisher ID
  const pubId = SITE_CONFIG.adsenseId.replace('ca-pub-', '');
  const adsTxt = `google.com, pub-${pubId}, DIRECT, f08c47fec0942fa0`;
  fs.writeFileSync(path.join(DIST, 'ads.txt'), adsTxt);
  console.log('✅ ads.txt 生成完成');
}

// 6. robots.txt
function generateRobots() {
  const robots = `User-agent: *
Allow: /
Sitemap: ${SITE_CONFIG.domain}/sitemap.xml`;
  fs.writeFileSync(path.join(DIST, 'robots.txt'), robots);
  console.log('✅ robots.txt 生成完成');
}

// 7. 隐私政策页
function generatePrivacyPage() {
  const html = `${headHTML(
    `隐私政策 - ${SITE_CONFIG.name}`,
    `${SITE_CONFIG.name}的隐私政策，了解我们如何收集、使用和保护您的个人信息。`,
    `隐私政策,隐私保护,${SITE_CONFIG.name}`,
    `${SITE_CONFIG.domain}/privacy.html`
  )}
<body>
  ${headerHTML()}
  ${navHTML('')}
  <main class="main-content">
    <div class="legal-page">
      <h1>隐私政策</h1>
      <p>最后更新日期：2024年5月</p>
      
      <h2>1. 信息收集</h2>
      <p>我们使用 Google Analytics 收集网站访问数据，包括：</p>
      <ul>
        <li>访问的页面和浏览时长</li>
        <li>设备类型和浏览器信息</li>
        <li>地理位置（大致区域）</li>
        <li>流量来源</li>
      </ul>
      <p>我们使用 Google AdSense 展示广告，Google 可能会使用 Cookie 来根据用户之前的访问记录展示相关广告。</p>

      <h2>2. Cookie 使用</h2>
      <p>本网站使用以下类型的 Cookie：</p>
      <ul>
        <li><strong>分析 Cookie</strong>：用于了解访客如何与网站互动（Google Analytics）</li>
        <li><strong>广告 Cookie</strong>：用于展示个性化广告（Google AdSense）</li>
      </ul>
      <p>您可以通过浏览器设置管理或禁用 Cookie。</p>

      <h2>3. 第三方服务</h2>
      <p>本网站使用以下第三方服务：</p>
      <ul>
        <li><strong>Google Analytics</strong>：网站流量分析</li>
        <li><strong>Google AdSense</strong>：广告展示和变现</li>
        <li><strong>Vercel</strong>：网站托管服务</li>
      </ul>
      <p>这些服务可能会收集上述信息。请参阅各服务的隐私政策了解详情。</p>

      <h2>4. 数据安全</h2>
      <p>我们采取合理的技术措施保护用户数据安全。本网站不直接收集个人身份信息（如姓名、邮箱、电话号码）。</p>

      <h2>5. 外部链接</h2>
      <p>本网站包含指向第三方 AI 工具的链接。我们不对这些外部网站的内容和隐私做法负责。建议您在访问这些网站时查看各自的隐私政策。</p>

      <h2>6. 儿童隐私</h2>
      <p>本网站的服务不针对13岁以下的儿童。我们不会有意收集13岁以下儿童的个人信息。</p>

      <h2>7. 政策更新</h2>
      <p>我们可能会不时更新本隐私政策。更新后的政策将在此页面上发布，并更新"最后更新日期"。</p>

      <h2>8. 联系我们</h2>
      <p>如果您对本隐私政策有任何疑问，请通过以下方式联系我们：</p>
      <ul>
        <li>邮箱：2939604175@qq.com</li>
        <li><a href="/contact.html">联系方式页面</a></li>
      </ul>
    </div>
  </main>
  ${footerHTML()}
</body>
</html>`;
  fs.writeFileSync(path.join(DIST, 'privacy.html'), html);
  console.log('✅ 隐私政策页生成完成');
}

// 8. 关于我们页
function generateAboutPage() {
  const html = `${headHTML(
    `关于我们 - ${SITE_CONFIG.name}`,
    `了解${SITE_CONFIG.name}的使命和团队，我们致力于帮助用户发现最优质的AI工具。`,
    `关于我们,${SITE_CONFIG.name},AI工具导航`,
    `${SITE_CONFIG.domain}/about.html`
  )}
<body>
  ${headerHTML()}
  ${navHTML('')}
  <main class="main-content">
    <div class="legal-page">
      <h1>关于我们</h1>
      
      <h2>🚀 我们的使命</h2>
      <p>${SITE_CONFIG.name} 致力于帮助每个人发现和使用最优质的 AI 工具。随着人工智能技术的快速发展，越来越多的 AI 工具涌现，我们希望帮助用户快速找到最适合自己需求的工具，提升工作和生活效率。</p>

      <h2>📋 我们做什么</h2>
      <ul>
        <li><strong>精选收录</strong>：我们精心筛选和测试每一个收录的 AI 工具，确保推荐的都是高质量的产品</li>
        <li><strong>分类整理</strong>：按用途将工具分为写作、绘画、视频、音频、编程、聊天、效率等类别，方便查找</li>
        <li><strong>持续更新</strong>：AI 领域日新月异，我们持续关注并收录最新的 AI 工具</li>
        <li><strong>客观评测</strong>：提供每个工具的功能介绍、定价方案和使用建议</li>
      </ul>

      <h2>📊 网站数据</h2>
      <ul>
        <li>收录工具：<strong>${tools.length}+</strong> 个</li>
        <li>工具分类：<strong>${categories.length}</strong> 个</li>
        <li>更新频率：每周更新</li>
      </ul>

      <h2>🤝 合作联系</h2>
      <p>如果您是 AI 工具开发者，希望将您的产品收录到我们的导航站，或者有广告合作需求，欢迎联系我们：</p>
      <ul>
        <li>邮箱：2939604175@qq.com</li>
        <li><a href="/contact.html">联系方式页面</a></li>
        <li><a href="/submit.html">提交工具页面</a></li>
      </ul>
    </div>
  </main>
  ${footerHTML()}
</body>
</html>`;
  fs.writeFileSync(path.join(DIST, 'about.html'), html);
  console.log('✅ 关于我们页生成完成');
}

// 9. 联系我们页
function generateContactPage() {
  const html = `${headHTML(
    `联系我们 - ${SITE_CONFIG.name}`,
    `通过邮件或表单联系${SITE_CONFIG.name}团队，我们会在24小时内回复。`,
    `联系我们,${SITE_CONFIG.name},合作咨询`,
    `${SITE_CONFIG.domain}/contact.html`
  )}
<body>
  ${headerHTML()}
  ${navHTML('')}
  <main class="main-content">
    <div class="legal-page">
      <h1>联系我们</h1>
      <p>我们很乐意听到您的声音！无论是工具推荐、合作咨询还是问题反馈，都欢迎联系我们。</p>

      <h2>📧 邮箱联系</h2>
      <p>如果您有任何问题或建议，请发送邮件至：</p>
      <p style="font-size:1.2rem;font-weight:600;color:var(--primary);">2939604175@qq.com</p>
      <p>我们会在 24 小时内回复您的邮件。</p>

      <h2>🤝 合作咨询</h2>
      <p>我们接受以下类型的合作：</p>
      <ul>
        <li><strong>工具收录</strong>：提交您的 AI 工具，免费收录到导航站</li>
        <li><strong>广告投放</strong>：在我们的网站投放品牌广告</li>
        <li><strong>内容合作</strong>：联合发布 AI 工具评测或教程</li>
        <li><strong>友情链接</strong>：与相关网站交换链接</li>
      </ul>

      <h2>💬 常见问题</h2>
      <p><strong>Q：如何提交我的 AI 工具？</strong></p>
      <p>请访问我们的 <a href="/submit.html">提交工具页面</a>，填写工具信息即可。</p>
      
      <p><strong>Q：收录是免费的吗？</strong></p>
      <p>是的，基础收录完全免费。我们也提供优先展示等增值服务。</p>
      
      <p><strong>Q：如何修改已收录的工具信息？</strong></p>
      <p>请通过邮件联系我们，说明需要修改的内容。</p>
    </div>
  </main>
  ${footerHTML()}
</body>
</html>`;
  fs.writeFileSync(path.join(DIST, 'contact.html'), html);
  console.log('✅ 联系我们页生成完成');
}

// 10. 提交工具页
function generateSubmitPage() {
  const html = `${headHTML(
    `提交AI工具 - ${SITE_CONFIG.name}`,
    `向${SITE_CONFIG.name}提交您的AI工具，让更多用户发现您的产品。`,
    `提交工具,提交AI工具,${SITE_CONFIG.name}`,
    `${SITE_CONFIG.domain}/submit.html`
  )}
<body>
  ${headerHTML()}
  ${navHTML('')}
  <main class="main-content">
    <div class="legal-page">
      <h1>提交 AI 工具</h1>
      <p>如果您开发了一款 AI 工具，或者发现了一款好用的 AI 工具没有被收录，欢迎提交给我们！</p>

      <h2>📝 提交方式</h2>
      <p>请发送邮件至 <strong>2939604175@qq.com</strong>，包含以下信息：</p>

      <div class="submit-form">
        <div class="form-item">
          <label>工具名称 *</label>
          <p>您的 AI 工具名称</p>
        </div>
        <div class="form-item">
          <label>工具网址 *</label>
          <p>工具的官方网站链接</p>
        </div>
        <div class="form-item">
          <label>工具简介 *</label>
          <p>简要描述工具的功能和特点（50-200字）</p>
        </div>
        <div class="form-item">
          <label>工具分类 *</label>
          <p>选择最匹配的分类：写作、图像、视频、音频、编程、聊天、效率</p>
        </div>
        <div class="form-item">
          <label>定价方案</label>
          <p>免费 / 免费试用 / 付费 / Freemium</p>
        </div>
        <div class="form-item">
          <label>核心亮点</label>
          <p>列出 3-5 个核心功能亮点</p>
        </div>
      </div>

      <h2>✅ 收录标准</h2>
      <ul>
        <li>工具必须与人工智能相关</li>
        <li>工具网站可以正常访问</li>
        <li>工具描述真实准确</li>
        <li>不收录涉及违法违规内容的工具</li>
      </ul>

      <h2>⏱ 处理时间</h2>
      <p>我们会在 <strong>3 个工作日内</strong> 审核您的提交。审核通过后，工具将自动出现在导航站中。</p>
    </div>
  </main>
  ${footerHTML()}
</body>
</html>`;
  fs.writeFileSync(path.join(DIST, 'submit.html'), html);
  console.log('✅ 提交工具页生成完成');
}

// ========== 执行构建 ==========
console.log('\\n🚀 开始构建站点...\\n');
generateIndex();
generateCategoryPages();
generateToolPages();
generatePrivacyPage();
generateAboutPage();
generateContactPage();
generateSubmitPage();
generateSitemap();
generateAdsTxt();
generateRobots();
console.log(`\\n✨ 构建完成！共生成 ${tools.length + categories.length + 8} 个文件`);
console.log(`   - 1 个首页`);
console.log(`   - ${categories.length + 1} 个分类页`);
console.log(`   - ${tools.length} 个工具详情页`);
console.log(`   - 4 个功能页（隐私/关于/联系/提交）`);
console.log(`   - 1 个 sitemap.xml`);
console.log(`   - 1 个 ads.txt`);
console.log(`   - 1 个 robots.txt`);
