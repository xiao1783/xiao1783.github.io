(() => {
  const page = document.body.dataset.page;
  const supportedLanguages = ['home', 'profile', 'study', 'projects', 'honors', 'experience', 'campus'];
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
    '3 项软件著作权': '3 Software Copyrights', '风和气象、智能 OJ、识物英语均获登记': 'Registered for Weather, Intelligent OJ, and Visual English',
    '查看详情 →': 'View Details →',
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
    '8 个系统项目，3 项软件著作权': '8 System Projects and 3 Software Copyrights', '项目材料持续整理中；软著数量按已确认信息单独统计。': 'Project materials are continually organized; copyright counts reflect confirmed registrations only.',
    '跳到主要内容': 'Skip to main content', '导航': 'Menu',
    '王耀堂': 'Yaotang Wang',
    '© 2026 王耀堂': '© 2026 Yaotang Wang',
    '中国石油大学（华东）': 'China University of Petroleum (East China)',
    'XAI研究组成员': 'XAI Research Group Member',
    '24级 · 智能科学与技术': 'Class of 2024 · Intelligent Science and Technology',
    '本科生 · 2006年生': 'Undergraduate · Born in 2006',
    '科研训练：公安执法大模型与“智筑安盾”系统': 'Research Training: Public-Security LLM and the "ZhiZhuAnDun" Smart Supervision System',
    '围绕公安执法监督场景研发专用大模型与“智筑安盾”（智慧督察）系统，构建智能化执法监督体系，服务新质公安战斗力建设。课题通过警校合作共建“数矩”监督联合实验室，开展大模型赋能研讨会，相关工作获《人民公安报》等媒体报道。': 'Developed a domain LLM and the "ZhiZhuAnDun" (smart supervision) system for law-enforcement oversight, building an intelligent supervision framework for modern public-security capabilities. The program established the "ShuJu" joint lab with police academies, held LLM enablement seminars, and was covered by People’s Public Security Daily and other media.',
    '27.3 万起': '273k+', '累计筛查警情': 'Police incidents screened',
    '1.5 万起': '15k+', '行政刑事案件': 'Administrative & criminal cases',
    '1170 余份': '1,170+', '执法监督报告': 'Oversight reports',
    '1327 个': '1,327', '整改问题隐患': 'Issues rectified',
    '↓ 38%': '↓ 38%', '涉法投诉量同比': 'Law-related complaints YoY',
    '一等奖': '1st Prize', '省公安厅科技进步奖': 'Provincial Public Security S&T Progress Award',
    '注：以上为课题团队整体应用成效，本人作为学生成员参与系统开发与研究工作。': 'Note: figures reflect the research team’s overall outcomes; I participated as a student member in development and research.',
    '警校合作': 'Police–University Collaboration', '大模型赋能研讨会': 'LLM Enablement Seminar',
    '人民公安报报道': 'Featured by People’s Public Security Daily', '厅长听取汇报': 'Briefed the Provincial Director',
    '稳定的课程基础，以及可复用的学习方法。': 'A steady course foundation with reusable study methods.',
    '课程达到 80 分以上': 'Courses scored 80 or above',
    '课程达到 90 分以上': 'Courses scored 90 or above',
    '课程达到 95 分以上': 'Courses scored 95 or above',
    '本科生成绩证明': 'Undergraduate Academic Record',
    '中国石油大学（华东）本科生前 5 学期成绩记录。': 'Course records for the first five semesters at China University of Petroleum (East China).',
    '学业成绩趋势': 'Grade Trend',
    '连续两年成绩稳步上升，大二学年每门课程分数均 90+。': 'Steady gains for two straight years; every course in year two scored 90+.',
    '前 5 学期平均学分绩': 'Average weighted score, first 5 semesters',
    '平均学分绩点（五分制）': 'Average GPA (5-point scale)',
    '学期一': 'Semester 1', '学期二': 'Semester 2', '学期三': 'Semester 3', '学期四': 'Semester 4',
    '代表课程成绩': 'Selected Course Scores', '专业课程': 'Major Courses', '通识课程': 'General Courses',
    '程序设计实习': 'Programming Practicum', '面向对象程序设计（Java）': 'Object-Oriented Programming (Java)',
    '算法分析与设计': 'Algorithm Analysis and Design', '计算机组成原理': 'Computer Organization',
    '数据库原理': 'Database Principles', '毛概': 'Intro to Mao Zedong Thought', '习概': 'Intro to Xi Jinping Thought',
    '线性代数': 'Linear Algebra', '大学物理': 'University Physics',
    '高等数学（2-2）': 'Calculus (2-2)', '高等数学（2-1）': 'Calculus (2-1)',
    '通用英语（2-2）': 'General English (2-2)', '大学物理实验': 'University Physics Lab',
    '学习方法': 'Study Methods',
    '计划与时间管理：拆解目标、规划时间': 'Planning & time management: break down goals, schedule tasks',
    '学习与内化：读、写、讲结合，定期回顾': 'Learning & internalizing: read, write, explain, review regularly',
    '实践应用：通过小项目检验理解': 'Application: test understanding through small projects',
    '资源与交流：主动检索并参与讨论': 'Resources & exchange: search actively and join discussions',
    '高数经验分享会': 'Calculus Experience Sharing Session',
    '将学习方法整理后分享给同学。': 'Organized my study methods and shared them with classmates.',
    '记录阶段性成果，证书编号与个人标识信息不公开展示。': 'Milestone achievements; certificate numbers and personal identifiers are not displayed.',
    '全部': 'All', '国家级': 'National', '区域赛': 'Regional', '华东赛区': 'East China Division',
    '省级': 'Provincial', '数学竞赛': 'Mathematics Competition', '竞赛': 'Competition',
    '服创赛国家三等奖': 'China Service Outsourcing Competition · National Third Prize',
    '以项目实践参加服务创新类竞赛': 'Competed with a hands-on service innovation project',
    '服创赛北部区域赛二等奖': 'China Service Outsourcing Competition · Northern Regional Second Prize',
    '人工智能专项赛道获区域赛二等奖': 'Second prize in the AI track at the regional round',
    '网络技术挑战赛国家三等奖': 'Network Technology Challenge · National Third Prize',
    '项目成果获得国家级竞赛认可': 'Project results recognized at the national level',
    '网络技术挑战赛华东赛区二等奖': 'Network Technology Challenge · East China Second Prize',
    '获得网络技术挑战赛华东赛区二等奖': 'Second prize in the East China division',
    '机创赛省级三等奖': 'Mechanical Innovation Contest · Provincial Third Prize',
    '参加中国大学生机械工程创新创意大赛省选拔赛': 'Provincial round of the national mechanical innovation contest',
    '全国大学生数学竞赛二等奖': 'National College Mathematics Competition · Second Prize',
    '系统梳理高等数学知识并参与竞赛': 'Systematically reviewed advanced mathematics and competed',
    '综合表现与校园实践获学校认可': 'Recognized for overall performance and campus practice',
    '优秀共青团员': 'Outstanding Communist Youth League Member',
    '思想表现与集体服务获得认可': 'Recognized for conduct and service to the collective',
    '《蓝色守护者：海洋如何为地球碳中和助力》': '“Blue Guardians: How the Oceans Power Carbon Neutrality on Earth”',
    '参与学校学生资助宣传工作': 'Joined university student financial aid outreach',
    '风和气象软件著作权': 'Fenghe Weather · Software Copyright',
    '基于爬虫的天气预报系统 V1.0': 'Crawler-Based Weather Forecast System V1.0',
    'UPCOJ 软件著作权': 'UPCOJ · Software Copyright',
    '基于 Flask 框架的智能 OJ 系统 V1.0': 'Flask-Based Intelligent OJ System V1.0',
    '识物英语软件著作权': 'Visual English · Software Copyright',
    '基于 YOLOv5 模型的智能识物英语系统 V1.0': 'YOLOv5-Based Visual English System V1.0',
    '运动会男子 200 米第七名': 'Men’s 200m, 7th Place',
    '进入学院运动会项目决赛': 'Reached the final at the college sports meet',
    '党校发展对象培训班结业': 'Completed Party Development-Stage Training',
    '完成党校发展对象培训班学习，考核合格、准予结业': 'Finished Party school training with a passing assessment',
    '思创赛三等奖': 'Innovation Contest · Third Prize',
    '参与创新创意类竞赛，作品获三等奖': 'Third prize for an innovation and creativity entry',
    '已通过大学英语四级、六级考试，成绩均达到合格线以上。': 'Passed CET-4 and CET-6, both above the pass line.',
    '听力 198 · 阅读 214 · 写作与翻译 146': 'Listening 198 · Reading 214 · Writing & Translation 146',
    '听力 194 · 阅读 181 · 写作与翻译 163': 'Listening 194 · Reading 181 · Writing & Translation 163',
    '558 分': '558 pts', '538 分': '538 pts',
    '服务同学、记录校园，也在具体事务中积累责任感。': 'Serving classmates and documenting campus life, building responsibility through concrete work.',
    '生活委员': 'Class Life Officer',
    '统筹协调班级日常事务，服务同学需求，参与物资代订、卫生与安全监督。': 'Coordinates daily class affairs, supports classmates, and helps with supplies, hygiene, and safety oversight.',
    '宿舍长': 'Dormitory Leader',
    '督促内务整理与学业进度，维护积极、友好、互相支持的宿舍氛围。': 'Keeps the dorm tidy and studies on track, maintaining a positive and supportive atmosphere.',
    '融媒体工作': 'Campus Media Team',
    '参与学院活动报道和内容制作，在学院公众号发布二十余篇推文。': 'Reports on college events and produces content, with 20+ articles on the college WeChat account.',
    '用内容记录校园': 'Recording Campus through Content',
    '内容覆盖校运会、榜样宣传、节目介绍、学习方法、学院会议和文艺活动，累计浏览量 7000+、点赞转发 800+。': 'Coverage spans sports meets, role models, shows, study tips, meetings, and arts — 7,000+ views and 800+ likes and shares.',
    '班级与校园事务': 'Class & campus affairs', '文明宿舍与集体建设': 'Model dorm & collective building', '团日活动': 'League Day activities',
    '从志愿服务、文化宣讲到集体活动，在真实协作中理解责任、沟通与行动。': 'From volunteering and cultural talks to team events — learning responsibility, communication, and action through real collaboration.',
    '志愿服务小时': 'Volunteer Hours',
    '长期参与环境维护、社区陪伴、文化宣讲等志愿活动。': 'Long-term volunteering in cleanups, elder companionship, and cultural talks.',
    '博物馆宣讲': 'Museum Talks',
    '在文化场馆与社会实践中完成五次主题讲解。': 'Five themed talks delivered at cultural venues and social programs.',
    '集体实践': 'Team Activities',
    '参与篮球赛、院运会、支教协作与宿舍共建等集体活动。': 'Basketball games, sports meets, teaching support, dormitory building, and more.',
    '博物馆讲解与文化传播': 'Museum Guiding & Cultural Outreach',
    '参与青岛海军博物馆、青岛一战遗址等相关实践，并在齐河县博物馆担任讲解员，累计完成 5 次博物馆宣讲。准备讲解内容、面对参观者表达并进行现场交流，让我逐步提升信息组织、临场沟通和公共表达能力。': 'Practiced at the Qingdao Naval Museum and the Qingdao WWI Site, and served as a docent at the Qihe County Museum with five themed talks. Preparing scripts, speaking to visitors, and engaging on site steadily sharpened my organization, communication, and public speaking.',
    '现场讲解': 'Live guiding', '参观交流': 'Visitor engagement',
    'CSDN 技术分享与交流': 'CSDN Technical Writing & Exchange',
    '持续在 CSDN 记录编程学习、项目开发和实践过程中遇到的问题，将调试思路、实现步骤与经验总结整理成文章。内容涵盖 Python、人工智能、Arduino 与项目实战等方向，累计发布 170 余篇原创内容，获得 7.8 万余次访问。': 'I keep a running CSDN blog on programming, project development, and problems solved along the way, turning debugging notes and lessons into articles — 170+ original posts and 78,000+ visits across Python, AI, Arduino, and hands-on projects.',
    '写作既是对知识的再次梳理，也是与其他学习者互相交流的方式。通过评论反馈、经验补充与问题讨论，在分享中巩固理解，也从他人的思路中持续学习。': 'Writing is a way to reorganize knowledge and exchange ideas with other learners. Through comments, additions, and discussions, sharing consolidates my understanding and keeps me learning from others.',
    '持续记录 · 分享经验 · 互相学习': 'Keep writing · Share lessons · Learn together',
    '志愿服务': 'Volunteering', '环境净化': 'Environmental Cleanup',
    '与同学共同清理公共区域，在分工协作中完成环境维护，把志愿服务落实到具体行动。': 'Cleaned shared spaces with classmates, dividing the work and turning service into concrete action.',
    '社区服务': 'Community Service', '陪伴与手工活动': 'Companionship & Crafts',
    '参与面向老人的志愿活动，制作艾草锤、手织粽子，在交流和协作中体会陪伴的价值。': 'Joined elder-focused volunteering, making mugwort hammers and hand-woven zongzi — experiencing the value of companionship.',
    '团队实践': 'Team Programs', '校支教队协作': 'Teaching Team Collaboration',
    '参与校支教队集体实践，在活动准备、现场配合与团队沟通中承担力所能及的工作。': 'Supported the university teaching team on preparation, on-site coordination, and communication.',
    '体育实践': 'Sports', '篮球比赛': 'Basketball Matches',
    '参与学院篮球活动，在对抗与配合中体会团队分工、沟通和共同承担。': 'Played college basketball, learning teamwork, communication, and shared responsibility.',
    '男子 200 米': 'Men’s 200m',
    '参加学院运动会并进入男子 200 米决赛，获得第七名。训练与比赛进一步磨炼了耐力与意志。': 'Reached the men’s 200m final at the college sports meet and finished 7th — training and racing built endurance and willpower.',
    '劳动实践': 'Hands-on Labor', '优秀宿舍共建': 'Model Dormitory Building',
    '参与宿舍环境维护和日常共建，宿舍获评优秀，在共同劳动中增强责任意识。': 'Helped maintain our dorm daily; it earned a Model Dormitory award, strengthening our sense of responsibility.',
    '多场': 'Many',
    '班级': 'Class', '智科 2402': 'Intelligent Science 2402',
    '政治面貌': 'Political Status', '担任职务': 'Class Role',
    '学院': 'College', '计算机学院': 'College of Computer Science',
    '数据可视化': 'Data Visualization', '项目协作 · 技术分享': 'Project Collaboration · Tech Talks',
    '智能 OJ · 风和气象': 'Intelligent OJ · Fenghe Weather', '智能 OJ · MyLife': 'Intelligent OJ · MyLife',
    '识物英语 · MotionLens': 'Visual English · MotionLens',
    '综合成绩与课程学分绩排名': 'Overall academic ranking',
    '获得 2024—2025 学年度本科生国家奖学金。': 'National Scholarship for the 2024–2025 academic year.',
    '学生资助宣传大使': 'Student Financial Aid Ambassador',
    '团日与志愿活动': 'League Day & volunteering',
    '思想成长 · 入党历程': 'Growth in Thought · Joining the Party',
    '递交入党申请书': 'Submitted Party Application',
    '主动向党组织递交入党申请。': 'Applied to the Party organization on my own initiative.',
    '入党积极分子': 'Party Activist',
    '确定为入党积极分子，系统学习党的理论。': 'Confirmed as an activist and studied Party theory systematically.',
    '党员发展对象': 'Development-Stage Candidate',
    '确定为发展对象，参加党校培训并结业。': 'Confirmed as a candidate; completed Party school training.',
    '中共预备党员': 'Probationary Member of the CPC',
    '光荣成为中共预备党员。': 'Proudly became a probationary CPC member.'
  };

  const languageButton = utility.querySelector('.utility-language');
  if (languageButton) {
    const titleMap = {
      home: ['王耀堂｜首页', 'Yaotang Wang | Home'], profile: ['个人档案｜王耀堂', 'Profile | Yaotang Wang'],
      study: ['学业表现｜王耀堂', 'Academics | Yaotang Wang'], projects: ['项目成果｜王耀堂', 'Projects | Yaotang Wang'],
      honors: ['荣誉奖项｜王耀堂', 'Honors | Yaotang Wang'], experience: ['实践经历｜王耀堂', 'Experience | Yaotang Wang'],
      campus: ['校园工作｜王耀堂', 'Campus | Yaotang Wang']
    };
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
