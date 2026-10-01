(() => {
  const page = document.body.dataset.page;
  const supportedLanguages = ['home', 'profile', 'projects'];
  const projectNames = {
    weather: '风和气象', 'smart-oj': '智能 OJ 系统', 'word-english': '识物英语',
    upcoj: 'UPCOJ', motionlens: 'MotionLens', wenmo: '文墨规整',
    mylife: 'MyLife Dashboard', neighbor: '邻易物'
  };
  const projectNamesEn = {
    weather: 'Weather and Forecasting', 'smart-oj': 'Intelligent OJ', 'word-english': 'Visual English',
    upcoj: 'UPCOJ', motionlens: 'MotionLens', wenmo: 'Wenmo Organizer',
    mylife: 'MyLife Dashboard', neighbor: 'Neighbor Exchange'
  };
  const storage = {
    read(key, fallback) {
      try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
    },
    write(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Local storage may be unavailable. */ }
    }
  };

  const statsKey = 'portfolioStatsV1';
  const stats = storage.read(statsKey, { pageViews: {}, projectViews: {}, resumeDownloads: 0, githubClicks: 0 });
  stats.pageViews[page] = (stats.pageViews[page] || 0) + 1;
  storage.write(statsKey, stats);

  const utility = document.createElement('div');
  utility.className = 'utility-bar';
  utility.setAttribute('aria-label', '页面工具');
  utility.innerHTML = `
    ${supportedLanguages.includes(page) ? '<button class="utility-language" type="button" aria-label="Switch to English" title="中英文切换">EN</button>' : ''}
    <button class="utility-theme" type="button" aria-label="切换深色模式" title="深色模式">◐</button>
    ${['projects', 'honors'].includes(page) ? '<button class="utility-directory" type="button" aria-label="打开页面目录" title="页面目录">☷</button>' : ''}
    <button class="utility-stats" type="button" aria-label="查看本地访问统计" title="访问统计">⌁</button>
    <button class="utility-top" type="button" aria-label="返回顶部" title="返回顶部">↑</button>`;
  document.body.append(utility);

  const topButton = utility.querySelector('.utility-top');
  const updateTopButton = () => topButton.classList.toggle('visible', window.scrollY > 420);
  window.addEventListener('scroll', updateTopButton, { passive: true });
  updateTopButton();
  topButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  const themeButton = utility.querySelector('.utility-theme');
  const applyTheme = (theme) => {
    document.documentElement.dataset.theme = theme;
    themeButton.textContent = theme === 'dark' ? '☀' : '◐';
    themeButton.setAttribute('aria-label', theme === 'dark' ? '切换浅色模式' : '切换深色模式');
    themeButton.title = theme === 'dark' ? '浅色模式' : '深色模式';
  };
  applyTheme(storage.read('portfolioTheme', 'light'));
  themeButton.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    storage.write('portfolioTheme', next);
  });

  const directoryButton = utility.querySelector('.utility-directory');
  if (directoryButton) {
    const directory = document.createElement('aside');
    directory.className = 'floating-directory';
    directory.setAttribute('aria-label', '页面目录');
    directory.setAttribute('aria-hidden', 'true');
    const projectEntries = Object.entries(projectNames).map(([id, name]) => `<a href="#${id}"><span>${name}</span><b>→</b></a>`).join('');
    const honorEntries = [
      ['all', '全部荣誉'], ['academic', '学业荣誉'], ['competition', '竞赛奖项'],
      ['copyright', '软件著作权'], ['campus', '校园荣誉'], ['language', '语言能力']
    ].map(([id, name]) => `<button type="button" data-directory-filter="${id}"><span>${name}</span><b>→</b></button>`).join('');
    directory.innerHTML = `<div><strong>页面目录</strong><button class="directory-close" type="button" aria-label="关闭页面目录">×</button></div>${page === 'projects' ? projectEntries : honorEntries}`;
    document.body.append(directory);
    const closeDirectory = () => {
      directory.classList.remove('open');
      directory.setAttribute('aria-hidden', 'true');
      directoryButton.setAttribute('aria-expanded', 'false');
    };
    directoryButton.setAttribute('aria-expanded', 'false');
    directoryButton.addEventListener('click', () => {
      const open = directory.classList.toggle('open');
      directory.setAttribute('aria-hidden', String(!open));
      directoryButton.setAttribute('aria-expanded', String(open));
    });
    directory.querySelector('.directory-close').addEventListener('click', closeDirectory);
    directory.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
      if (page === 'projects') document.querySelector('[data-project-filter="all"]')?.click();
      closeDirectory();
    }));
    directory.querySelectorAll('[data-directory-filter]').forEach((button) => button.addEventListener('click', () => {
      document.querySelector(`[data-honor-filter="${button.dataset.directoryFilter}"]`)?.click();
      document.querySelector('.honor-filters')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      closeDirectory();
    }));
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeDirectory(); });
  }

  const record = (field) => {
    stats[field] = (stats[field] || 0) + 1;
    storage.write(statsKey, stats);
  };
  document.querySelectorAll('.resume-download, [data-resume-download]').forEach((link) => link.addEventListener('click', () => record('resumeDownloads')));
  document.querySelector('.contact-github')?.addEventListener('click', () => record('githubClicks'));

  const recordProject = (id) => {
    stats.projectViews[id] = (stats.projectViews[id] || 0) + 1;
    storage.write(statsKey, stats);
  };
  document.querySelectorAll('a[href*="projects.html#"]').forEach((link) => link.addEventListener('click', () => {
    const id = link.hash.slice(1);
    if (id) recordProject(id);
  }));
  if (page === 'projects' && 'IntersectionObserver' in window) {
    const seen = new Set();
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting && !seen.has(entry.target.id)) {
        seen.add(entry.target.id);
        recordProject(entry.target.id);
      }
    }), { threshold: .45 });
    document.querySelectorAll('.project-detail[id]').forEach((project) => observer.observe(project));
  }

  const statsButton = utility.querySelector('.utility-stats');
  const statsModal = document.createElement('div');
  statsModal.className = 'stats-modal';
  statsModal.setAttribute('aria-hidden', 'true');
  statsModal.innerHTML = '<div class="stats-card" role="dialog" aria-modal="true" aria-labelledby="statsTitle"><button class="stats-close" type="button" aria-label="关闭统计">×</button><p class="eyebrow">LOCAL ANALYTICS</p><h2 id="statsTitle">本地访问统计</h2><p class="stats-privacy">数据仅保存在当前浏览器，不上传到服务器或第三方平台。</p><div class="stats-grid"></div></div>';
  document.body.append(statsModal);
  const closeStats = () => { statsModal.classList.remove('open'); statsModal.setAttribute('aria-hidden', 'true'); statsButton.focus(); };
  statsButton.addEventListener('click', () => {
    const latest = storage.read(statsKey, stats);
    const totalViews = Object.values(latest.pageViews || {}).reduce((sum, value) => sum + value, 0);
    const topEntry = Object.entries(latest.projectViews || {}).sort((a, b) => b[1] - a[1])[0];
    const isEnglish = document.documentElement.lang === 'en';
    const names = isEnglish ? projectNamesEn : projectNames;
    const topProject = topEntry ? `${names[topEntry[0]] || topEntry[0]} · ${topEntry[1]}${isEnglish ? ' views' : ' 次'}` : (isEnglish ? 'No records yet' : '暂无记录');
    statsModal.querySelector('.stats-grid').innerHTML = `<article><strong>${totalViews}</strong><span>${isEnglish ? 'Page Views' : '页面访问'}</span></article><article><strong>${topProject}</strong><span>${isEnglish ? 'Most Viewed Project' : '最常查看项目'}</span></article><article><strong>${latest.resumeDownloads || 0}</strong><span>${isEnglish ? 'Resume Downloads' : '简历下载'}</span></article><article><strong>${latest.githubClicks || 0}</strong><span>${isEnglish ? 'GitHub Clicks' : 'GitHub 点击'}</span></article>`;
    statsModal.classList.add('open');
    statsModal.setAttribute('aria-hidden', 'false');
    statsModal.querySelector('.stats-close').focus();
  });
  statsModal.addEventListener('click', (event) => { if (event.target === statsModal || event.target.closest('.stats-close')) closeStats(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && statsModal.classList.contains('open')) closeStats(); });

  const translations = {
    '首页概览': 'Home', '个人档案': 'Profile', '学业表现': 'Academics', '项目成果': 'Projects',
    '荣誉奖项': 'Honors', '实践经历': 'Experience', '校园工作': 'Campus',
    '页面目录': 'On This Page', '全部荣誉': 'All Honors', '学业荣誉': 'Academic Honors',
    '竞赛奖项': 'Competition Awards', '校园荣誉': 'Campus Honors', '语言能力': 'Language Skills',
    '本地访问统计': 'Local Analytics',
    '数据仅保存在当前浏览器，不上传到服务器或第三方平台。': 'Data stays in this browser and is never uploaded to a server or third party.',
    '功不唐捐，玉汝于成': 'Effort never goes unrewarded', '自律': 'Discipline', '主动': 'Initiative', '成长': 'Growth',
    '下载简历': 'Download Resume', '持续学习，持续创造': 'Keep learning, keep creating',
    '把想法做成作品': 'Turning Ideas into Working Products',
    '人工智能 · 数据应用 · 智能教育': 'AI · Data Applications · Intelligent Education',
    '从课程学习到系统开发，我用项目验证理解，也在真实需求中持续打磨产品思维与工程能力。': 'From coursework to system development, I validate what I learn through projects and refine my product and engineering skills through real needs.',
    '专业 1 / 61': 'Ranked 1 / 61', '专业排名 1 / 61': 'Ranked 1 / 61', '综合成绩与课程学分绩': 'Overall academic ranking',
    '综合成绩与课程学分绩位列专业第一': 'Ranked first in the major by overall academic performance',
    '查看学业表现 →': 'View Academics →', '查看荣誉证明 →': 'View Honor →',
    '获 2024—2025 学年本科生国家奖学金': 'Received the National Scholarship for the 2024-2025 academic year',
    '3 项软件著作权': '3 Software Copyrights', '服创赛、网络技术挑战赛国家三等奖': 'National third prizes in two major competitions',
    '查看成果与竞赛 →': 'View Results and Awards →', '查看详情 →': 'View Details →',
    '联系我': 'Contact Me', '微信号已复制': 'WeChat ID copied',
    '国家奖学金': 'National Scholarship', '2024—2025 学年': 'Academic Year 2024-2025',
    '3 项': '3', '软件著作权': 'Software Copyrights', '300+ 小时': '300+ Hours', '志愿服务': 'Volunteer Service',
    '近期成果': 'Recent Achievements', '全部荣誉': 'All Honors', '当前关注': 'Current Focus',
    '科普文学类优秀奖': 'Science Writing Excellence Award', '受聘学生资助宣传大使': 'Student Financial Aid Ambassador',
    '软件著作权累计 3 项': 'Three Software Copyrights Registered', '获得国家奖学金': 'Received the National Scholarship',
    '校级优秀学生': 'Outstanding Student', '智能学习工具': 'Intelligent Learning Tools',
    '围绕在线评测、智能出题与问答体验持续开发。': 'Developing online judging, intelligent question generation, and Q&A experiences.',
    '数据应用': 'Data Applications', '通过数据采集和可视化解决真实信息需求。': 'Solving real information needs through data collection and visualization.',
    '精选项目': 'Selected Projects', '查看项目页': 'View Projects', '天气预报系统': 'Weather Forecast System',
    '天气数据采集、云图与雷达图呈现': 'Weather data collection with satellite and radar visualization',
    '智能 OJ 系统': 'Intelligent OJ System', '在线评测、智能出题与智能问答': 'Online judging, question generation, and intelligent Q&A',
    '关于我的学习方向、做事方式和阶段目标。': 'My learning interests, working principles, and current goals.',
    '在学习中建立能力': 'Building Skills through Learning', '在实践中验证想法': 'Testing Ideas through Practice',
    '我是王耀堂，就读于中国石油大学（华东）计算机学院智能科学与技术专业。': 'I am Yaotang Wang, an undergraduate in Intelligent Science and Technology at China University of Petroleum (East China).',
    '我喜欢通过项目检验知识，也愿意在讲解、志愿服务和内容传播中接触更广阔的真实场景。': 'I enjoy testing knowledge through projects and learning from real settings through public speaking, volunteering, and content creation.',
    '认真学习，持续创造；把每一次尝试都变成下一步的基础。': 'Learn with purpose, keep creating, and turn every attempt into a foundation for the next step.',
    '技术能力矩阵': 'Technical Skills Matrix', '编程语言': 'Programming Languages', '应用开发': 'Application Development',
    '人工智能与数据': 'AI and Data', '工程与硬件': 'Engineering and Hardware', '实践落点': 'Applied In',
    '用于数据处理、后端服务、在线评测与前端交互开发。': 'Used for data processing, backend services, online judging, and frontend interaction.',
    '围绕业务流程完成接口、数据存储和交互界面的协同实现。': 'Building APIs, data storage, and interfaces around complete workflows.',
    '关注目标检测、模型应用和数据结果的清晰呈现。': 'Focused on object detection, model applications, and clear data presentation.',
    '用于版本管理、开发环境配置和传感器实践记录。': 'Used for version control, development environments, and sensor-based experiments.',
    '成长时间轴': 'Growth Timeline', '起点 · 学业': 'Starting Point · Study', '进入智能科学与技术专业': 'Started Intelligent Science and Technology',
    '入学中国石油大学（华东），从课程学习出发，逐步建立编程、数学与计算机基础。': 'Entered China University of Petroleum (East China) and began building foundations in programming, mathematics, and computing.',
    '查看学业表现 →': 'View Academics →', '积累 · 荣誉': 'Progress · Honors', '专业第一与国家奖学金': 'Top-ranked Major and National Scholarship',
    '综合成绩与课程学分绩排名 1 / 61，获校级优秀学生、国家奖学金及数学竞赛二等奖。': 'Ranked 1 / 61 overall; received the National Scholarship, Outstanding Student honor, and a mathematics competition award.',
    '查看学业荣誉 →': 'View Academic Honors →', '创造 · 项目': 'Creation · Projects', '项目成果持续落地': 'Turning Projects into Results',
    '完成多个系统项目，智能 OJ、识物英语与风和气象取得 3 项软件著作权登记。': 'Built multiple systems, with three software copyrights registered for Intelligent OJ, Visual English, and Weather applications.',
    '查看项目成果 →': 'View Projects →', '拓展 · 实践': 'Expansion · Practice', '竞赛与校园实践并行': 'Competitions and Campus Practice',
    '获得服创赛、网络技术挑战赛国家三等奖，并持续参与志愿服务、文化讲解与校园工作。': 'Received national third prizes in two competitions while continuing volunteer service, cultural interpretation, and campus work.',
    '查看实践经历 →': 'View Experience →', '我的做事方式': 'How I Work',
    '拆解目标、规划时间、保持专注，按重要性安排任务。': 'Break down goals, plan time, stay focused, and prioritize important tasks.',
    '主动寻找学习资源，也主动参与集体事务和真实项目。': 'Actively seek learning resources and contribute to teams and real projects.',
    '面对问题持续尝试，在反馈中修正方法，把经验沉淀下来。': 'Keep experimenting, improve through feedback, and turn experience into reusable knowledge.',
    '关注方向': 'Areas of Interest', '人工智能': 'Artificial Intelligence', '数据分析': 'Data Analysis', '智能教育': 'Intelligent Education',
    '计算机视觉': 'Computer Vision', '产品实践': 'Product Development',
    '覆盖智能教育、计算机视觉、数据应用和生活服务的系统实践。': 'System projects spanning intelligent education, computer vision, data applications, and everyday services.',
    '系统项目': 'System Projects', '风和气象': 'Weather and Forecasting',
    '全部项目': 'All Projects', 'Web 系统': 'Web Systems', '我的职责': 'My Role', '核心技术': 'Core Technology', '成果状态': 'Outcome',
    '气象数据采集与功能整合': 'Weather data collection and feature integration', 'Python · 数据可视化 · API': 'Python · Data Visualization · API',
    '软件著作权已登记': 'Software copyright registered', '在线评测流程与核心功能开发': 'Online judging workflow and core feature development',
    'Flask · Docker · 多语言沙箱': 'Flask · Docker · Multilingual Sandbox', '目标检测与词汇学习流程开发': 'Object detection and vocabulary learning workflow development',
    '综合题型与判题流程设计': 'Assessment format and judging workflow design', '课程测评系统持续完善': 'Course assessment system under continuous development',
    '姿态分析与评估结果可视化': 'Pose analysis and result visualization', '人体关键点识别 · 数据可视化': 'Pose Landmark Detection · Data Visualization',
    '动作分析功能已完成': 'Motion analysis features completed', 'OCR 流程与知识整理功能开发': 'OCR workflow and knowledge organization development',
    'OCR · 标签检索 · 多格式导出': 'OCR · Tag Search · Multi-format Export', '素材管理工作流已完成': 'Material management workflow completed',
    '个人效率模块与统一面板开发': 'Productivity modules and unified dashboard development', '核心生活管理功能已完成': 'Core personal management features completed',
    '交易流程与后台治理功能开发': 'Transaction workflow and moderation feature development', '商品检索 · 站内沟通 · 后台审核': 'Product Search · Messaging · Moderation',
    '完整交易流程已实现': 'Complete transaction workflow implemented',
    '聚合多源权威气象数据，提供未来与历史天气查询、趋势图、卫星与雷达云图，并通过语音播报和智能穿衣建议服务日常出行。': 'Aggregates authoritative weather sources for forecasts, history, trends, satellite and radar imagery, voice reports, and clothing suggestions.',
    '实时、未来与历史数据聚合': 'Real-time, forecast, and historical data', '温度和风力趋势可视化': 'Temperature and wind trend visualization', '语音播报与穿衣建议': 'Voice reports and clothing suggestions',
    '已获得软件著作权登记': 'Software copyright registered', '查看证书 →': 'View Certificate →',
    '面向编程教育的在线评测平台，支持学生、教师、管理员三类角色，将课程、题库、作业、代码评测与学习数据纳入统一流程。': 'An online judging platform for programming education, integrating courses, problems, assignments, code evaluation, and learning data for students, teachers, and administrators.',
    'Python、C++、Java 沙箱评测': 'Sandbox judging for Python, C++, and Java', '多题型作业与 AI 主观题评分': 'Multi-format assignments and AI-assisted scoring', '智能出题、错题本与讨论区': 'Question generation, error review, and discussions',
    '识物英语': 'Visual English', '基于目标检测的情境化英语学习平台，从生活图片中识别物体并给出中英释义与音标，让视觉认知自然衔接词汇学习与复习反馈。': 'A contextual English learning platform that detects objects in everyday images and connects visual recognition with bilingual definitions, pronunciation, practice, and feedback.',
    '目标识别与可视化标注': 'Object detection and visual annotation', '词汇测验、听写与口语跟读': 'Vocabulary quizzes, dictation, and speaking practice', '生词本与学习报告': 'Vocabulary review and learning reports',
    '面向高校程序设计与数据分析课程的在线测评系统，在传统代码判题之外支持函数断言、图片与动态图表等综合实践题型。': 'An online assessment system for university programming and data analysis courses, supporting assertions, images, and dynamic visualizations beyond conventional code judging.',
    'Monaco 在线编程与多语言评测': 'Monaco editor and multilingual judging', 'JudgeAssert 断言式判分': 'Assertion-based scoring with JudgeAssert', 'AI 辅助、多媒体判题与成绩分析': 'AI assistance, multimedia judging, and analytics',
    '利用人体关键点识别分析训练视频，为深蹲、演讲姿态等动作呈现关键帧、关节角度曲线，并给出可执行的改进建议。': 'Analyzes training videos with pose landmarks, presenting key frames, joint-angle curves, and actionable feedback for movements and presentation posture.',
    '动作识别与自定义分析模式': 'Motion recognition and custom modes', '关键帧、角度曲线与评估结果': 'Key frames, angle curves, and evaluation', '训练、饮食、BMI 与社区激励': 'Training, nutrition, BMI, and community motivation',
    '文墨规整': 'Wenmo Knowledge Organizer', '面向学习与办公资料的智能素材管理系统，将多格式导入、OCR 识别、文本规整、标签分类、检索和导出整合进统一工作流。': 'An intelligent material management system combining multi-format import, OCR, text cleanup, tagging, search, and export.',
    '图片与扫描件文字识别': 'OCR for images and scans', '规则标签与素材检索': 'Rule-based tagging and search', '统计图表与多格式导出': 'Statistics and multi-format export',
    '将任务、笔记、记账和习惯打卡集中在统一生活面板中，以每日聚焦视图和番茄钟帮助用户安排学习节奏与个人生活。': 'A unified dashboard for tasks, notes, expenses, and habits, with daily focus and Pomodoro tools.',
    '循环任务与子任务管理': 'Recurring tasks and subtasks', 'Markdown 笔记与收支统计': 'Markdown notes and finance tracking', '习惯打卡、番茄钟与每日概览': 'Habit tracking, Pomodoro, and daily overview',
    '邻易物': 'Neighbor Exchange', '服务社区与校园场景的二手物品交易系统，串联商品发布、分类检索、即时沟通、交易评价以及后台审核治理。': 'A second-hand marketplace for campus and community scenarios, covering listings, search, messaging, reviews, and moderation.',
    '多条件检索、收藏与浏览记录': 'Advanced search, favorites, and history', '站内聊天、交易与评价': 'Messaging, transactions, and reviews', '商品审核、举报与公告管理': 'Moderation, reports, and announcements',
    '8 个系统项目，3 项软件著作权': '8 System Projects and 3 Software Copyrights', '项目材料持续整理中；软著数量按已确认信息单独统计。': 'Project materials are continually organized; copyright counts reflect confirmed registrations only.'
  };

  const languageButton = utility.querySelector('.utility-language');
  if (languageButton) {
    const titleMap = { home: ['王耀堂｜首页', 'Yaotang Wang | Home'], profile: ['个人档案｜王耀堂', 'Profile | Yaotang Wang'], projects: ['项目成果｜王耀堂', 'Projects | Yaotang Wang'] };
    const nodes = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const original = node.nodeValue.trim();
      if (original && translations[original]) nodes.push({ node, original, raw: node.nodeValue });
    }
    const applyLanguage = (language) => {
      nodes.forEach(({ node, original, raw }) => {
        const replacement = language === 'en' ? translations[original] : original;
        node.nodeValue = raw.replace(original, replacement);
      });
      document.documentElement.lang = language === 'en' ? 'en' : 'zh-CN';
      document.title = titleMap[page][language === 'en' ? 1 : 0];
      languageButton.textContent = language === 'en' ? '中' : 'EN';
      languageButton.setAttribute('aria-label', language === 'en' ? '切换到中文' : 'Switch to English');
      storage.write('portfolioLanguage', language);
    };
    applyLanguage(storage.read('portfolioLanguage', 'zh'));
    languageButton.addEventListener('click', () => applyLanguage(document.documentElement.lang === 'en' ? 'zh' : 'en'));
  }
})();
