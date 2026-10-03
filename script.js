document.head.insertAdjacentHTML('beforeend', '<link rel="stylesheet" href="contact.css"><link rel="stylesheet" href="features.css"><link rel="stylesheet" href="sidebar.css"><link rel="stylesheet" href="project-enhancements.css">');
const page = document.body.dataset.page;
const items = [
  ['home', 'index.html', '首页概览', '⌂'], ['profile', 'profile.html', '个人档案', '◉'],
  ['study', 'study.html', '学业表现', '▤'], ['projects', 'projects.html', '项目成果', '◇'],
  ['honors', 'honors.html', '荣誉奖项', '★'], ['experience', 'experience.html', '实践经历', '◎'],
  ['campus', 'campus.html', '校园工作', '□']
];
const mainContent = document.querySelector('main');
if (mainContent) {
  mainContent.id = 'main-content';
  document.body.insertAdjacentHTML('afterbegin', '<a class="skip-link" href="#main-content">跳到主要内容</a>');
  mainContent.insertAdjacentHTML('beforeend', '<footer class="site-footer"><span>© 2026 王耀堂</span><i aria-hidden="true">·</i><span>Last updated: 2026.10</span></footer>');
}
const contactIcons = {
  wechat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.4 4.2c-4.1 0-7.4 2.7-7.4 6 0 1.9 1.1 3.5 2.8 4.6l-.7 2.4 2.8-1.4c.8.2 1.6.4 2.5.4h.4a5.7 5.7 0 0 1-.3-1.8c0-3.2 3-5.8 6.8-6.1C15.3 5.9 12.6 4.2 9.4 4.2Zm-2.6 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm5 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"/><path d="M22 14.5c0-2.8-2.7-5.1-6-5.1s-6 2.3-6 5.1 2.7 5.1 6 5.1c.7 0 1.4-.1 2.1-.3l2.3 1.2-.6-2c1.4-.9 2.2-2.4 2.2-4Zm-8-1.7a.8.8 0 1 1 0-1.6.8.8 0 0 1 0 1.6Zm4 0a.8.8 0 1 1 0-1.6.8.8 0 0 1 0 1.6Z"/></svg>',
  github: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.69c-2.78.6-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.35 1.09 2.92.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.57 9.57 0 0 1 12 7c.85 0 1.71.11 2.51.34 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85V21c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"/></svg>',
  qq: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2c-3.1 0-5.5 2.6-5.5 6 0 .8.1 1.5.3 2.2-.9 1.3-1.5 2.9-1.5 4.5 0 .8.2 1.4.6 1.5.3.1.8-.2 1.3-.8.2.6.5 1.2.9 1.7-.9.5-1.5 1.2-1.3 1.8.3.8 2.1.7 3.5-.1.5.2 1 .2 1.7.2s1.2 0 1.7-.2c1.4.8 3.2.9 3.5.1.2-.6-.4-1.3-1.3-1.8.4-.5.7-1.1.9-1.7.5.6 1 1 1.3.8.4-.1.6-.7.6-1.5 0-1.6-.6-3.2-1.5-4.5.2-.7.3-1.4.3-2.2 0-3.4-2.4-6-5.5-6Zm-2 5.4c-.5 0-.9-.6-.9-1.3S9.5 5 10 5s.9.6.9 1.3-.4 1.3-.9 1.3Zm4 0c-.5 0-.9-.6-.9-1.3S13.5 5 14 5s.9.6.9 1.3-.4 1.3-.9 1.3Z"/></svg>',
  csdn: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.2 7.2A9.5 9.5 0 0 1 18 5.5l-2.3 2.3a6.2 6.2 0 0 0-8.4 1.1H19l-3.2 3.2H3.4c-.1-1.7.2-3.4.8-4.9Zm15.6 9.6A9.5 9.5 0 0 1 6 18.5l2.3-2.3a6.2 6.2 0 0 0 8.4-1.1H5l3.2-3.2h12.4c.1 1.7-.2 3.4-.8 4.9Z"/></svg>'
};
document.querySelector('#sidebar').innerHTML = `<div class="identity"><a class="avatar" href="index.html"><img loading="eager" decoding="async" src="assets/portrait.webp" alt="王耀堂"></a><h2>王耀堂</h2><p>功不唐捐，玉汝于成</p><div class="identity-tags"><span>自律</span><span>主动</span><span>成长</span></div></div><nav class="side-nav" aria-label="页面导航">${items.map(([id, href, label, icon]) => `<a class="${page === id ? 'active' : ''}" href="${href}"${page === id ? ' aria-current="page"' : ''}><i>${icon}</i><span>${label}</span></a>`).join('')}</nav><div class="contact-links" aria-label="联系方式"><button class="contact-wechat" type="button" data-copy-contact="w18315872969" data-contact-label="微信" aria-label="复制微信号">${contactIcons.wechat}</button><a class="contact-github" href="https://github.com/xiao1783" target="_blank" rel="noopener noreferrer" aria-label="在新窗口打开 GitHub">${contactIcons.github}</a><button class="contact-qq" type="button" data-copy-contact="3401172986" data-contact-label="QQ" aria-label="复制 QQ 号">${contactIcons.qq}</button><button class="contact-csdn" type="button" data-copy-contact="anew___" data-contact-label="CSDN" aria-label="复制 CSDN 用户名">${contactIcons.csdn}</button></div><p class="copy-status" role="status" aria-live="polite"></p><div class="side-foot"><p>中国石油大学（华东）<br>XAI研究组成员<br>24级 · 智能科学与技术<br>本科生 · 2006年生</p><span>持续学习，持续创造</span></div>`;
const sidebar = document.querySelector('#sidebar');
const menuButton = document.querySelector('#menuButton');
const copyStatus = sidebar.querySelector('.copy-status');
const copyContact = async (text) => {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const input = document.createElement('textarea');
  input.value = text;
  input.style.position = 'fixed';
  input.style.opacity = '0';
  document.body.append(input);
  input.select();
  document.execCommand('copy');
  input.remove();
};
document.querySelectorAll('[data-copy-contact]').forEach((button) => button.addEventListener('click', async () => {
  try {
    await copyContact(button.dataset.copyContact);
    const status = button.closest('.home-actions')?.querySelector('.home-contact-status') || copyStatus;
    status.textContent = `${button.dataset.contactLabel}已复制`;
  } catch {
    const status = button.closest('.home-actions')?.querySelector('.home-contact-status') || copyStatus;
    status.textContent = '复制失败，请手动复制';
  }
}));
menuButton?.setAttribute('aria-expanded', 'false');
menuButton?.addEventListener('click', () => {
  const open = sidebar.classList.toggle('open');
  menuButton.textContent = open ? '关闭' : '导航';
  menuButton.setAttribute('aria-expanded', String(open));
});
sidebar.querySelectorAll('nav a').forEach((link) => link.addEventListener('click', () => {
  sidebar.classList.remove('open');
  menuButton?.setAttribute('aria-expanded', 'false');
}));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && sidebar.classList.contains('open')) {
    sidebar.classList.remove('open');
    menuButton.textContent = '导航';
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.focus();
  }
});

const scoreButtons = [...document.querySelectorAll('[data-score-view]')];
const scorePanels = [...document.querySelectorAll('[data-score-panel]')];
const applyScoreView = (view, focus = false) => {
  scoreButtons.forEach((button) => {
    const active = button.dataset.scoreView === view;
    button.classList.toggle('active', active);
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-selected', String(active));
    button.tabIndex = active ? 0 : -1;
    if (active && focus) button.focus();
  });
  scorePanels.forEach((panel) => {
    const active = panel.dataset.scorePanel === view;
    panel.classList.toggle('active', active);
    panel.setAttribute('role', 'tabpanel');
    panel.hidden = !active;
  });
};
scoreButtons.forEach((button, index) => {
  button.addEventListener('click', () => applyScoreView(button.dataset.scoreView));
  button.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const offset = event.key === 'ArrowRight' ? 1 : -1;
    const next = scoreButtons[(index + offset + scoreButtons.length) % scoreButtons.length];
    applyScoreView(next.dataset.scoreView, true);
  });
});
if (scoreButtons.length) applyScoreView(scoreButtons.find((button) => button.classList.contains('active'))?.dataset.scoreView || scoreButtons[0].dataset.scoreView);

const honorFilters = document.querySelectorAll('[data-honor-filter]');
const honorItems = document.querySelectorAll('[data-honor-category]');
const honorGrid = document.querySelector('.honor-grid');
const applyHonorFilter = (filter) => {
  honorFilters.forEach((item) => {
    const active = item.dataset.honorFilter === filter;
    item.classList.toggle('active', active);
    item.setAttribute('aria-pressed', String(active));
  });
  honorItems.forEach((item) => { item.hidden = filter !== 'all' && item.dataset.honorCategory !== filter; });
  if (honorGrid) honorGrid.hidden = !honorGrid.querySelector('article:not([hidden])');
};
honorFilters.forEach((button) => button.addEventListener('click', () => applyHonorFilter(button.dataset.honorFilter)));
const requestedHonorFilter = new URLSearchParams(window.location.search).get('category');
if ([...honorFilters].some((button) => button.dataset.honorFilter === requestedHonorFilter)) applyHonorFilter(requestedHonorFilter);

const projectFilters = document.querySelectorAll('[data-project-filter]');
const projectItems = document.querySelectorAll('[data-project-category]');
const projectCount = document.querySelector('.project-count strong');
const applyProjectFilter = (filter) => {
  let visible = 0;
  projectFilters.forEach((button) => {
    const active = button.dataset.projectFilter === filter;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  projectItems.forEach((item) => {
    const show = filter === 'all' || item.dataset.projectCategory.split(' ').includes(filter);
    item.hidden = !show;
    if (show) visible += 1;
  });
  if (projectCount) projectCount.textContent = String(visible).padStart(2, '0');
};
projectFilters.forEach((button) => button.addEventListener('click', () => applyProjectFilter(button.dataset.projectFilter)));

const certificates = document.querySelectorAll('.honor-certificate, .academic-proof-image, .language-certificate, .experience-image, .campus-image, .project-image');
if (certificates.length) {
  const preview = document.createElement('div');
  preview.className = 'image-preview';
  preview.setAttribute('role', 'dialog');
  preview.setAttribute('aria-modal', 'true');
  preview.setAttribute('aria-label', '图片预览');
  preview.setAttribute('aria-hidden', 'true');
  preview.innerHTML = '<button type="button" aria-label="关闭图片预览">×</button><img alt="">';
  document.body.append(preview);
  const previewImage = preview.querySelector('img');
  const closeButton = preview.querySelector('button');
  let previousFocus = null;
  const closePreview = () => {
    if (!preview.classList.contains('open')) return;
    preview.classList.remove('open');
    preview.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    previewImage.removeAttribute('src');
    previousFocus?.focus();
  };
  const openPreview = (image) => {
    previousFocus = document.activeElement;
    previewImage.src = image.src;
    previewImage.alt = image.alt;
    preview.classList.add('open');
    preview.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeButton.focus();
  };
  certificates.forEach((image) => {
    image.tabIndex = 0;
    image.setAttribute('role', 'button');
    image.addEventListener('click', () => openPreview(image));
    image.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openPreview(image); }
    });
  });
  preview.addEventListener('click', (event) => { if (event.target === preview || event.target.tagName === 'BUTTON') closePreview(); });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closePreview();
    if (event.key === 'Tab' && preview.classList.contains('open')) { event.preventDefault(); closeButton.focus(); }
  });
}

const featureScript = document.createElement('script');
featureScript.src = 'features.js';
document.body.append(featureScript);
