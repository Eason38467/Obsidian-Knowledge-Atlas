import {
  addIcon,
  ItemView,
  Plugin,
  PluginSettingTab,
  Setting,
  TFile
} from "obsidian";

const VIEW_TYPE = "knowledge-atlas-view";
const ROOT_NOTES = "@root-notes";
const SVG_NS = "http://www.w3.org/2000/svg";
const GRAPH_WIDTH = 1400;
const GRAPH_HEIGHT = 1080;
const GRAPH_CENTER_X = GRAPH_WIDTH / 2;
const GRAPH_CENTER_Y = GRAPH_HEIGHT / 2;
const ICON_ID = "knowledge-atlas-orbit";
const ICON_SVG = `
  <ellipse cx="50" cy="50" rx="42" ry="19" fill="none" stroke="currentColor" stroke-width="6" />
  <ellipse cx="50" cy="50" rx="19" ry="42" fill="none" stroke="currentColor" stroke-width="6" transform="rotate(-35 50 50)" />
  <circle cx="50" cy="50" r="9" fill="currentColor" stroke="none" />
  <circle cx="88" cy="44" r="6" fill="currentColor" stroke="none" />
  <circle cx="33" cy="17" r="5" fill="currentColor" stroke="none" />
`;
const PALETTE = ["#22d3ee", "#5b8cff", "#a855f7", "#f43f8e", "#ff8a34", "#34d399", "#facc15", "#fb7185"];
const PLANET_PROFILES = [
  { surface: "#2876d2", mid: "#0d4a91", dark: "#041326", atmosphere: "#71e7ff", texture: "#63c98c", accent: "#d9fbff", pattern: "terra", ring: false },
  { surface: "#d89a62", mid: "#9d5938", dark: "#351711", atmosphere: "#ffd5a1", texture: "#f1c582", accent: "#fff0c7", pattern: "gas", ring: true },
  { surface: "#68b9d2", mid: "#327c9a", dark: "#10243e", atmosphere: "#c9f5ff", texture: "#e7fbff", accent: "#ffffff", pattern: "ice", ring: true },
  { surface: "#be5639", mid: "#78311f", dark: "#29100d", atmosphere: "#ffad78", texture: "#e9945f", accent: "#ffd4aa", pattern: "rust", ring: false },
  { surface: "#7b68d7", mid: "#443686", dark: "#130e35", atmosphere: "#c8b7ff", texture: "#a996ef", accent: "#eee9ff", pattern: "storm", ring: false },
  { surface: "#54a777", mid: "#286447", dark: "#09251c", atmosphere: "#7fffd0", texture: "#b8d774", accent: "#eaffc8", pattern: "terra", ring: false },
  { surface: "#d3ba55", mid: "#8e6c27", dark: "#2c1c08", atmosphere: "#fff09a", texture: "#f2d77a", accent: "#fff8c4", pattern: "storm", ring: false }
];
const SOLAR_ORBIT_PROFILES = [
  { reference: "Mercury", periodDays: 87.97 },
  { reference: "Venus", periodDays: 224.7 },
  { reference: "Earth", periodDays: 365.26 },
  { reference: "Mars", periodDays: 686.98 },
  { reference: "Jupiter", periodDays: 4332.59 },
  { reference: "Saturn", periodDays: 10759.22 },
  { reference: "Uranus", periodDays: 30688.5 },
  { reference: "Neptune", periodDays: 60182 }
];
const OVERVIEW_MOONS_PER_PLANET = 3;
const GALAXY_INNER_ORBIT = 170;
const GALAXY_OUTER_ORBIT = 580;
const GALAXY_MAX_ORBIT_GAP = 76;
const FREE_LAYOUT_MIN_WIDTH = 1051;
const DEFAULT_DASHBOARD_LAYOUT = {
  viewportWidth: 1500,
  items: {
    canvas: { x: 0, y: 0, width: 1106, height: 1082, z: 2 },
    clock: { x: 1120, y: 0, width: 380, height: 176, z: 3 },
    calendar: { x: 1120, y: 190, width: 380, height: 312, z: 4 },
    legend: { x: 1120, y: 516, width: 380, height: 150, z: 5 },
    heatmap: { x: 1120, y: 680, width: 380, height: 280, z: 6 },
    trajectory: { x: 1120, y: 976, width: 380, height: 512, z: 7 },
    health: { x: 0, y: 1096, width: 368, height: 392, z: 8 },
    review: { x: 382, y: 1096, width: 352, height: 392, z: 9 },
    recent: { x: 748, y: 1096, width: 358, height: 392, z: 10 }
  }
};

function cloneDefaultDashboardLayout() {
  return JSON.parse(JSON.stringify(DEFAULT_DASHBOARD_LAYOUT));
}
const DEFAULT_SETTINGS = {
  excludedFolders: [".trash", "Templates", "assets"],
  maxFolders: 48,
  maxNotes: 54,
  sampleNotes: 18,
  recentLimit: 8,
  openNotesInNewLeaf: false,
  language: "auto",
  openOnStartup: true,
  staleDays: 180,
  dashboardLayout: DEFAULT_DASHBOARD_LAYOUT,
  motionEnabled: true,
  orbitSpeed: 1
};

const COPY = {
  en: {
    kicker: "VAULT / KNOWLEDGE ATLAS",
    title: "Knowledge Atlas",
    subtitle: "Explore folders, notes, and the links between them.",
    notes: "notes",
    folders: "folders",
    links: "links",
    search: "Search every note…",
    back: "← Back",
    overview: "⌂ Overview",
    orbit: "Galaxy",
    tree: "Tree",
    refresh: "Refresh",
    layoutEdit: "Arrange layout",
    layoutDone: "Done",
    layoutReset: "Reset",
    layoutHint: "Drag the upper-left handle to move · drag the lower-right corner to resize",
    moveItem: "Move",
    resizeItem: "Resize",
    canvas: "Galaxy canvas",
    motionSpeed: "Orbit speed",
    pauseMotion: "Pause motion",
    playMotion: "Play motion",
    readGraph: "How to read",
    folder: "Folder / drill down",
    note: "Note / open",
    noteLink: "Note link",
    sample: "Recent sample",
    star: "Star / vault",
    planet: "Planet / top-level folder",
    moon: "Moon / second-level folder",
    comet: "Comet / root note",
    recent: "Recently updated",
    collapsed: "The galaxy shows the vault, top-level planets, and second-level moons.",
    complete: "All nodes in this level are visible. Dashed lines are real note links.",
    moreFolders: "more folders",
    moreNotes: "more notes",
    hiddenHint: "Continue drilling down or use search.",
    noResults: "No matching notes. Try a title or folder name.",
    noNotes: "No Markdown notes are available with the current exclusions.",
    orbitHint: "Galaxy · wheel to zoom · drag to pan",
    treeHint: "Tree · wheel to zoom · drag to pan",
    rootNotes: "Root notes",
    vault: "VAULT",
    graphLabel: "Interactive knowledge atlas",
    language: "Language",
    languageAuto: "Auto",
    languageChinese: "中文",
    languageEnglish: "English",
    fit: "Fit",
    zoomOut: "Zoom out",
    zoomIn: "Zoom in",
    heatmapTitle: "Growth heatmap",
    heatmapMeta: "last 53 weeks",
    less: "Less",
    more: "More",
    notesCreated: "notes created",
    trajectoryTitle: "Growth trajectory",
    trajectoryMeta: "Based on note creation time",
    annualRhythm: "The year in motion",
    weeklyRhythm: "Rhythm of the week",
    clockTitle: "Clock",
    clockKicker: "NOW / LOCAL TIME",
    calendarTitle: "Calendar",
    previousMonth: "Previous month",
    nextMonth: "Next month",
    goodMorning: "Good morning",
    goodAfternoon: "Good afternoon",
    goodEvening: "Good evening",
    goodNight: "Good night",
    today: "Today",
    settingsLanguage: "Interface language",
    settingsLanguageDesc: "Choose a language for the atlas, or follow Obsidian's system language.",
    settingsStartup: "Open Atlas on startup",
    settingsStartupDesc: "Open Knowledge Atlas after the Obsidian workspace is ready.",
    settingsExcluded: "Excluded folders",
    settingsExcludedDesc: "Comma-separated folder paths or prefixes that should not appear in the atlas.",
    settingsMaxFolders: "Maximum folders",
    settingsMaxFoldersDesc: "Maximum folder nodes drawn in one level.",
    settingsMaxNotes: "Maximum notes",
    settingsMaxNotesDesc: "Maximum note nodes drawn in one level.",
    settingsRecent: "Recent notes",
    settingsRecentDesc: "Number of recently modified notes shown in the side panel.",
    settingsNewTab: "Open notes in a new tab",
    settingsNewTabDesc: "Keep the atlas open when a note node is selected.",
    settingsStaleDays: "Stale note threshold",
    settingsStaleDaysDesc: "A note is considered stale after this many days without an update.",
    healthKicker: "KNOWLEDGE HEALTH",
    healthTitle: "Health and review",
    orphanNotes: "Orphan notes",
    brokenLinks: "Broken links",
    staleNotes: "Stale notes",
    healthEmpty: "No notes in this category.",
    brokenTargets: "broken targets",
    staleFor: "days quiet",
    dailyReview: "Daily review",
    dailyReviewHint: "Three older notes, refreshed each day.",
    createdOn: "Created on",
    dayEmpty: "No notes were created on this day.",
    showDayNotes: "Show notes created on this day",
    moreDayNotes: "more notes",
    moreHealthNotes: "more notes · use search to continue"
  },
  zh: {
    kicker: "知识库 / KNOWLEDGE ATLAS",
    title: "知识星图",
    subtitle: "沿目录浏览笔记，并发现它们之间的真实双链。",
    notes: "笔记",
    folders: "目录",
    links: "链接",
    search: "搜索全部笔记…",
    back: "← 返回",
    overview: "⌂ 总览",
    orbit: "星系",
    tree: "树状",
    refresh: "刷新",
    layoutEdit: "调整布局",
    layoutDone: "完成",
    layoutReset: "重置",
    layoutHint: "拖动左上角手柄移动 · 拖动右下角缩放",
    moveItem: "移动",
    resizeItem: "调整大小",
    canvas: "星系画布",
    motionSpeed: "转动速率",
    pauseMotion: "暂停转动",
    playMotion: "继续转动",
    readGraph: "读图方式",
    folder: "目录 / 下钻",
    note: "笔记 / 打开",
    noteLink: "双链关系",
    sample: "最近采样",
    star: "恒星 / Vault",
    planet: "行星 / 一级目录",
    moon: "卫星 / 二级目录",
    comet: "彗星 / 根目录笔记",
    recent: "最近更新",
    collapsed: "总览显示 Vault 恒星、一级目录行星与二级目录卫星。",
    complete: "当前层级节点已完整显示；虚线表示真实双链。",
    moreFolders: "个目录未绘制",
    moreNotes: "篇笔记未绘制",
    hiddenHint: "可继续下钻或使用搜索。",
    noResults: "没有找到匹配笔记，可尝试标题或目录名称。",
    noNotes: "按当前排除规则，没有可显示的 Markdown 笔记。",
    orbitHint: "星系 · 滚轮缩放 · 拖动画布",
    treeHint: "树状 · 滚轮缩放 · 拖动画布",
    rootNotes: "根目录笔记",
    vault: "知识库",
    graphLabel: "交互式知识星图",
    language: "语言",
    languageAuto: "跟随系统",
    languageChinese: "中文",
    languageEnglish: "English",
    fit: "适配",
    zoomOut: "缩小",
    zoomIn: "放大",
    heatmapTitle: "年度增长热力图",
    heatmapMeta: "最近 53 周",
    less: "少",
    more: "多",
    notesCreated: "篇新增笔记",
    trajectoryTitle: "增长轨迹",
    trajectoryMeta: "按笔记创建时间统计",
    annualRhythm: "这一年的起伏轨迹",
    weeklyRhythm: "一周里的节奏",
    clockTitle: "时钟",
    clockKicker: "此刻 / 本地时间",
    calendarTitle: "日历",
    previousMonth: "上个月",
    nextMonth: "下个月",
    goodMorning: "早上好",
    goodAfternoon: "下午好",
    goodEvening: "晚上好",
    goodNight: "夜深了",
    today: "今天",
    settingsLanguage: "界面语言",
    settingsLanguageDesc: "选择星图界面语言，或跟随 Obsidian 的系统语言。",
    settingsStartup: "启动时打开知识星图",
    settingsStartupDesc: "Obsidian 工作区加载完成后自动打开 Knowledge Atlas。",
    settingsExcluded: "排除目录",
    settingsExcludedDesc: "以英文逗号分隔，不在星图中显示的目录路径或前缀。",
    settingsMaxFolders: "目录节点上限",
    settingsMaxFoldersDesc: "单个层级最多绘制的目录节点数量。",
    settingsMaxNotes: "笔记节点上限",
    settingsMaxNotesDesc: "单个层级最多绘制的笔记节点数量。",
    settingsRecent: "最近笔记数量",
    settingsRecentDesc: "右侧面板显示的最近修改笔记数量。",
    settingsNewTab: "在新标签页打开笔记",
    settingsNewTabDesc: "打开笔记节点时保留知识星图。",
    settingsStaleDays: "长期未更新阈值",
    settingsStaleDaysDesc: "超过该天数未修改的笔记会被标记为长期未更新。",
    healthKicker: "知识健康",
    healthTitle: "知识健康与回顾",
    orphanNotes: "孤立笔记",
    brokenLinks: "断链",
    staleNotes: "长期未更新",
    healthEmpty: "这个分类中没有笔记。",
    brokenTargets: "个断链目标",
    staleFor: "天未更新",
    dailyReview: "每日回顾",
    dailyReviewHint: "每天固定随机挑选 3 篇较旧笔记。",
    createdOn: "创建于",
    dayEmpty: "当天没有新增笔记。",
    showDayNotes: "查看当天新增笔记",
    moreDayNotes: "篇未展开",
    moreHealthNotes: "篇未展开 · 可继续使用全库搜索"
  }
};

function createElement(parent, tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  parent.appendChild(element);
  return element;
}

function createButton(parent, className, text, label) {
  const button = createElement(parent, "button", className, text);
  button.type = "button";
  if (label) button.setAttribute("aria-label", label);
  return button;
}

function createSvg(tag, attributes = {}) {
  const element = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, String(value));
  return element;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function snap(value, step = 8) {
  return Math.round(value / step) * step;
}

function projectOrbit(radius, angle, flatten = .52, rotation = -.16) {
  const rawX = Math.cos(angle) * radius;
  const rawY = Math.sin(angle) * radius * flatten;
  const cosine = Math.cos(rotation);
  const sine = Math.sin(rotation);
  return {
    x: rawX * cosine - rawY * sine,
    y: rawX * sine + rawY * cosine,
    depth: (Math.sin(angle) + 1) / 2,
    tangent: Math.atan2(
      -Math.sin(angle) * radius * sine + Math.cos(angle) * radius * flatten * cosine,
      -Math.sin(angle) * radius * cosine - Math.cos(angle) * radius * flatten * sine
    )
  };
}

function appendGradientStop(gradient, offset, color, opacity = 1) {
  gradient.appendChild(createSvg("stop", { offset, "stop-color": color, "stop-opacity": opacity }));
}

function planetProfile(path) {
  return PLANET_PROFILES[deterministicScore(`planet-profile:${path}`) % PLANET_PROFILES.length];
}

function solarOrbitProfile(index) {
  if (index < SOLAR_ORBIT_PROFILES.length) return SOLAR_ORBIT_PROFILES[index];
  const last = SOLAR_ORBIT_PROFILES.at(-1);
  return {
    reference: `Beyond Neptune ${index - SOLAR_ORBIT_PROFILES.length + 1}`,
    periodDays: last.periodDays * Math.pow(1.85, index - SOLAR_ORBIT_PROFILES.length + 1)
  };
}

function visualOrbitVelocity(periodDays) {
  return clamp(Math.pow(SOLAR_ORBIT_PROFILES[2].periodDays / periodDays, .42), .055, 1.9);
}

function renderStarSphere(group, node, radius) {
  const token = `kap-star-${deterministicScore(node.id)}`;
  const auraId = `${token}-aura`;
  const surfaceId = `${token}-surface`;
  const clipId = `${token}-clip`;
  const defs = createSvg("defs");

  const aura = createSvg("radialGradient", { id: auraId, cx: "50%", cy: "50%", r: "50%" });
  appendGradientStop(aura, "0%", "#fff3ad", .34);
  appendGradientStop(aura, "24%", "#ffd36c", .26);
  appendGradientStop(aura, "52%", "#f6a23f", .13);
  appendGradientStop(aura, "76%", "#ed7132", .045);
  appendGradientStop(aura, "100%", "#d94a2d", 0);
  defs.appendChild(aura);

  const surfaceGradient = createSvg("radialGradient", {
    id: surfaceId,
    cx: "32%",
    cy: "27%",
    r: "76%",
    fx: "25%",
    fy: "20%"
  });
  appendGradientStop(surfaceGradient, "0%", "#fffef0");
  appendGradientStop(surfaceGradient, "20%", "#fff5b8");
  appendGradientStop(surfaceGradient, "48%", "#ffd66f");
  appendGradientStop(surfaceGradient, "73%", "#f5a33e");
  appendGradientStop(surfaceGradient, "91%", "#c45c24");
  appendGradientStop(surfaceGradient, "100%", "#6f2516");
  defs.appendChild(surfaceGradient);

  const clip = createSvg("clipPath", { id: clipId });
  clip.appendChild(createSvg("circle", { r: radius - .6 }));
  defs.appendChild(clip);
  group.appendChild(defs);

  const outerAura = createSvg("circle", { class: "kap-star-aura is-outer", r: radius * 2.58 });
  outerAura.style.fill = `url(#${auraId})`;
  group.appendChild(outerAura);
  const innerAura = createSvg("circle", { class: "kap-star-aura is-inner", r: radius * 1.78 });
  innerAura.style.fill = `url(#${auraId})`;
  group.appendChild(innerAura);

  const corona = createSvg("g", { class: "kap-star-corona", "aria-hidden": "true" });
  const coronaPaths = [
    `M ${-radius * 1.04} ${-radius * .63} C ${-radius * 1.5} ${-radius * .95}, ${-radius * 1.6} ${radius * .05}, ${-radius * 1.14} ${radius * .4}`,
    `M ${radius * .52} ${-radius * 1.04} C ${radius * .7} ${-radius * 1.54}, ${radius * 1.3} ${-radius * 1.36}, ${radius * 1.12} ${-radius * .82}`,
    `M ${radius * .82} ${radius * .88} C ${radius * 1.35} ${radius * 1.16}, ${radius * 1.52} ${radius * .4}, ${radius * 1.13} ${radius * .2}`
  ];
  coronaPaths.forEach((path, index) => corona.appendChild(createSvg("path", {
    class: `kap-star-prominence is-${index + 1}`,
    d: path
  })));
  group.appendChild(corona);

  const surface = createSvg("circle", { class: "kap-core kap-star-surface", r: radius });
  surface.style.fill = `url(#${surfaceId})`;
  group.appendChild(surface);

  const granulation = createSvg("g", { class: "kap-star-granulation", "clip-path": `url(#${clipId})`, "aria-hidden": "true" });
  for (let index = 0; index < 28; index += 1) {
    const seed = deterministicScore(`${node.id}:granule:${index}`);
    const xSeed = seed % 997;
    const ySeed = Math.floor(seed / 997) % 991;
    const sizeSeed = Math.floor(seed / 65537) % 101;
    granulation.appendChild(createSvg("ellipse", {
      class: `kap-star-grain ${index % 3 === 0 ? "is-bright" : "is-warm"}`,
      cx: (xSeed / 996 - .5) * radius * 1.7,
      cy: (ySeed / 990 - .5) * radius * 1.7,
      rx: radius * (.015 + sizeSeed / 2200),
      ry: radius * (.012 + sizeSeed / 2700),
      transform: `rotate(${seed % 180})`
    }));
  }
  group.appendChild(granulation);
  group.appendChild(createSvg("ellipse", {
    class: "kap-star-specular",
    cx: -radius * .3,
    cy: -radius * .34,
    rx: radius * .28,
    ry: radius * .15,
    transform: "rotate(-28)"
  }));
  group.appendChild(createSvg("circle", { class: "kap-star-limb", r: radius + .25, fill: "none" }));
}

function renderPlanetSphere(group, node, radius) {
  const profile = node.appearance || planetProfile(node.path);
  const token = `kap-planet-${deterministicScore(node.id)}`;
  const gradientId = `${token}-surface`;
  const clipId = `${token}-clip`;
  const defs = createSvg("defs");
  const gradient = createSvg("radialGradient", { id: gradientId, cx: "30%", cy: "24%", r: "78%", fx: "24%", fy: "18%" });
  appendGradientStop(gradient, "0%", profile.accent);
  appendGradientStop(gradient, "24%", profile.surface);
  appendGradientStop(gradient, "67%", profile.mid);
  appendGradientStop(gradient, "100%", profile.dark);
  defs.appendChild(gradient);
  const clip = createSvg("clipPath", { id: clipId });
  clip.appendChild(createSvg("circle", { r: radius - .7 }));
  defs.appendChild(clip);
  group.appendChild(defs);

  group.appendChild(createSvg("circle", { class: "kap-halo kap-planet-halo", r: radius * 1.72 }));
  if (profile.ring) group.appendChild(createSvg("ellipse", {
    class: "kap-planet-ring",
    rx: radius * 1.58,
    ry: Math.max(4.5, radius * .31),
    transform: "rotate(-16)"
  }));
  const surface = createSvg("circle", { class: "kap-core kap-celestial-sphere", r: radius });
  surface.style.fill = `url(#${gradientId})`;
  group.appendChild(surface);

  const textureClip = createSvg("g", { class: "kap-planet-texture-clip", "clip-path": `url(#${clipId})` });
  const texture = createSvg("g", { class: `kap-planet-texture is-${profile.pattern}` });
  const bandCount = profile.pattern === "gas" ? 7 : profile.pattern === "storm" ? 5 : 3;
  for (let index = 0; index < bandCount; index += 1) {
    const y = (-.68 + index * (1.36 / Math.max(bandCount - 1, 1))) * radius;
    const amplitude = radius * (.06 + (index % 2) * .025);
    const band = createSvg("path", {
      d: `M ${-radius * 3} ${y} Q ${-radius * 1.5} ${y - amplitude}, 0 ${y} T ${radius * 3} ${y}`,
      class: "kap-planet-band",
      fill: "none",
      stroke: index % 2 ? profile.texture : profile.accent,
      "stroke-width": Math.max(1.1, radius * (profile.pattern === "gas" ? .13 : .065))
    });
    band.style.opacity = String(profile.pattern === "gas" ? .28 : .13);
    texture.appendChild(band);
  }
  for (let index = -4; index <= 4; index += 1) {
    const seed = deterministicScore(`${node.path}:terrain:${index}`);
    const feature = createSvg("ellipse", {
      class: "kap-planet-feature",
      cx: index * radius * .72 + ((seed % 19) - 9) * radius * .018,
      cy: ((seed % 101) / 100 - .5) * radius * 1.12,
      rx: radius * (.18 + (seed % 23) / 100),
      ry: radius * (.07 + (seed % 17) / 150),
      fill: profile.pattern === "ice" ? profile.accent : profile.texture,
      transform: `rotate(${(seed % 42) - 21})`
    });
    feature.style.opacity = String(profile.pattern === "gas" ? .2 : .34);
    texture.appendChild(feature);
  }
  if (profile.pattern === "gas" || profile.pattern === "storm") texture.appendChild(createSvg("ellipse", {
    class: "kap-planet-storm",
    cx: radius * .24,
    cy: radius * .28,
    rx: radius * .28,
    ry: radius * .12,
    fill: profile.accent
  }));
  textureClip.appendChild(texture);
  group.appendChild(textureClip);
  group.appendChild(createSvg("ellipse", {
    class: "kap-planet-night",
    cx: radius * .58,
    cy: radius * .12,
    rx: radius * .72,
    ry: radius * 1.03,
    "clip-path": `url(#${clipId})`
  }));
  group.appendChild(createSvg("ellipse", {
    class: "kap-planet-specular",
    cx: -radius * .32,
    cy: -radius * .38,
    rx: radius * .22,
    ry: radius * .12,
    transform: "rotate(-28)"
  }));
  const atmosphere = createSvg("circle", { class: "kap-planet-atmosphere", r: radius + .7, fill: "none", stroke: profile.atmosphere });
  atmosphere.style.setProperty("--kap-atmosphere-color", profile.atmosphere);
  group.appendChild(atmosphere);
}

function renderMoonSphere(group, node, radius) {
  const token = `kap-moon-${deterministicScore(node.id)}`;
  const gradientId = `${token}-surface`;
  const clipId = `${token}-clip`;
  const defs = createSvg("defs");
  const gradient = createSvg("radialGradient", { id: gradientId, cx: "28%", cy: "23%", r: "80%" });
  appendGradientStop(gradient, "0%", "#f7fbff");
  appendGradientStop(gradient, "34%", "#a9b8d1");
  appendGradientStop(gradient, "74%", "#58657b");
  appendGradientStop(gradient, "100%", "#111827");
  defs.appendChild(gradient);
  const clip = createSvg("clipPath", { id: clipId });
  clip.appendChild(createSvg("circle", { r: radius - .4 }));
  defs.appendChild(clip);
  group.appendChild(defs);
  group.appendChild(createSvg("circle", { class: "kap-halo kap-moon-halo", r: radius * 2.15 }));
  const surface = createSvg("circle", { class: "kap-core kap-celestial-sphere", r: radius });
  surface.style.fill = `url(#${gradientId})`;
  group.appendChild(surface);
  const textureClip = createSvg("g", { class: "kap-moon-texture-clip", "clip-path": `url(#${clipId})` });
  const texture = createSvg("g", { class: "kap-moon-texture" });
  for (let index = 0; index < 4; index += 1) {
    const seed = deterministicScore(`${node.path}:crater:${index}`);
    texture.appendChild(createSvg("circle", {
      class: "kap-moon-crater",
      cx: ((seed % 101) / 100 - .5) * radius * 1.15,
      cy: (((seed >> 7) % 101) / 100 - .5) * radius * 1.15,
      r: radius * (.1 + (seed % 18) / 100)
    }));
  }
  textureClip.appendChild(texture);
  group.appendChild(textureClip);
  group.appendChild(createSvg("ellipse", { class: "kap-moon-night", cx: radius * .62, cy: radius * .08, rx: radius * .78, ry: radius * 1.08, "clip-path": `url(#${clipId})` }));
  group.appendChild(createSvg("circle", { class: "kap-moon-rim", r: radius + .35, fill: "none" }));
}

function shortLabel(value, length = 20) {
  const text = String(value || "");
  return text.length > length ? `${text.slice(0, length - 1)}…` : text;
}

function topLevel(path) {
  return String(path || "").split("/")[0] || ROOT_NOTES;
}

function stableColor(path) {
  const value = topLevel(path);
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

function resolveLanguage(setting = "auto") {
  if (setting === "zh" || setting === "en") return setting;
  return (navigator.language || "en").toLowerCase().startsWith("zh") ? "zh" : "en";
}

function dayKey(value) {
  const date = value instanceof Date ? value : new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function addDays(value, amount) {
  const date = new Date(value);
  date.setDate(date.getDate() + amount);
  return date;
}

function startOfWeek(value, firstDay = 1) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  const offset = (date.getDay() - firstDay + 7) % 7;
  date.setDate(date.getDate() - offset);
  return date;
}

function sameDay(left, right) {
  return dayKey(left) === dayKey(right);
}

function parseTimestamp(value, fallback) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.getTime();
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && !value.includes("{{")) {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return fallback;
}

function deterministicScore(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function formatDate(timestamp, includeTime = false, locale) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const options = includeTime
    ? { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }
    : { month: "2-digit", day: "2-digit" };
  return new Intl.DateTimeFormat(locale, options).format(date);
}

class KnowledgeAtlasView extends ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this.currentFocus = "";
    this.currentLayout = "radial";
    this.viewport = null;
    this.viewTransform = { x: 0, y: 0, k: 1 };
    this.panState = null;
    this.clockTimer = null;
    this.calendarCursor = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    this.activeHealthType = "orphan";
    this.selectedActivityDay = "";
    this.layoutEditing = false;
    this.layoutItems = [];
    this.layoutZCounter = 20;
    this.layoutResizeObserver = null;
    this.layoutFrame = null;
    this.layoutAppliedWidth = 0;
    this.orbitPhase = 0;
    this.motionFrame = null;
    this.motionLastTime = 0;
    this.graphMotion = null;
    this.motionHoverPaused = false;
    this.reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches || false;
    this.applyLanguage();
  }

  applyLanguage() {
    this.language = resolveLanguage(this.plugin.settings.language);
    this.isChinese = this.language === "zh";
    this.locale = this.isChinese ? "zh-CN" : "en-US";
    this.copy = COPY[this.language];
  }

  getViewType() {
    return VIEW_TYPE;
  }

  getDisplayText() {
    return this.copy.title;
  }

  getIcon() {
    return ICON_ID;
  }

  async onOpen() {
    this.render();
  }

  async onClose() {
    if (this.clockTimer) window.clearInterval(this.clockTimer);
    if (this.layoutFrame) window.cancelAnimationFrame(this.layoutFrame);
    this.layoutResizeObserver?.disconnect();
    this.stopGraphMotion();
  }

  isExcluded(path) {
    return this.plugin.settings.excludedFolders.some(prefix => path === prefix || path.startsWith(`${prefix}/`));
  }

  buildModel() {
    const allMarkdownFiles = this.app.vault.getMarkdownFiles();
    const rootMarkdownFiles = allMarkdownFiles
      .filter(file => !file.parent?.path || file.parent.path === "/")
      .sort((left, right) => left.path.localeCompare(right.path));
    const cometSeed = dayKey(new Date());
    const cometFile = rootMarkdownFiles
      .map(file => ({ file, score: deterministicScore(`${cometSeed}:root-comet:${file.path}`) }))
      .sort((left, right) => left.score - right.score || left.file.path.localeCompare(right.file.path))[0]?.file || null;
    const files = allMarkdownFiles.filter(file => !this.isExcluded(file.path));
    const folders = new Map();

    const ensureFolder = (path, displayName) => {
      if (!folders.has(path)) {
        const parts = path === ROOT_NOTES ? [] : path.split("/");
        folders.set(path, {
          path,
          name: displayName || parts.at(-1) || this.copy.rootNotes,
          parent: path === ROOT_NOTES || parts.length <= 1 ? "" : parts.slice(0, -1).join("/"),
          children: new Set(),
          files: [],
          count: 0
        });
      }
      return folders.get(path);
    };

    for (const file of files) {
      const folderPath = file.parent?.path || "";
      if (!folderPath || folderPath === "/") {
        const root = ensureFolder(ROOT_NOTES, this.copy.rootNotes);
        root.files.push(file);
        root.count += 1;
        continue;
      }
      const parts = folderPath.split("/").filter(Boolean);
      for (let index = 0; index < parts.length; index += 1) {
        const path = parts.slice(0, index + 1).join("/");
        const folder = ensureFolder(path);
        folder.count += 1;
        if (index > 0) ensureFolder(parts.slice(0, index).join("/")).children.add(path);
      }
      ensureFolder(folderPath).files.push(file);
    }

    const roots = [...folders.values()]
      .filter(folder => folder.parent === "")
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    let linkCount = 0;
    const filePaths = new Set(files.map(file => file.path));
    const incomingByPath = new Map(files.map(file => [file.path, 0]));
    const outgoingByPath = new Map();
    const brokenByPath = new Map();
    for (const file of files) {
      const resolved = this.app.metadataCache.resolvedLinks[file.path] || {};
      linkCount += Object.values(resolved).reduce((sum, count) => sum + Number(count || 0), 0);
      const targets = Object.keys(resolved);
      outgoingByPath.set(file.path, targets.length);
      for (const target of targets) {
        if (filePaths.has(target)) incomingByPath.set(target, (incomingByPath.get(target) || 0) + 1);
      }

      const unresolved = this.app.metadataCache.unresolvedLinks[file.path] || {};
      const brokenTargets = Object.entries(unresolved)
        .map(([target, count]) => ({ target, count: Number(count || 0) }))
        .filter(item => item.count > 0);
      if (brokenTargets.length) brokenByPath.set(file.path, brokenTargets);
    }
    const createdByDay = new Map();
    const createdAtByPath = new Map();
    for (const file of files) {
      const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;
      const createdAt = parseTimestamp(frontmatter?.created ?? frontmatter?.created_at ?? frontmatter?.["date-created"], file.stat.ctime);
      createdAtByPath.set(file.path, createdAt);
      const key = dayKey(createdAt);
      if (!createdByDay.has(key)) createdByDay.set(key, []);
      createdByDay.get(key).push(file);
    }
    const orphanNotes = files
      .filter(file => (incomingByPath.get(file.path) || 0) === 0 && (outgoingByPath.get(file.path) || 0) === 0)
      .sort((a, b) => b.stat.mtime - a.stat.mtime);
    const brokenNotes = [...brokenByPath.entries()]
      .map(([path, targets]) => ({ file: this.app.vault.getAbstractFileByPath(path), targets, count: targets.reduce((sum, item) => sum + item.count, 0) }))
      .filter(item => item.file instanceof TFile)
      .sort((a, b) => b.count - a.count || a.file.path.localeCompare(b.file.path));
    const staleCutoff = Date.now() - this.plugin.settings.staleDays * 86400000;
    const staleNotes = files.filter(file => file.stat.mtime < staleCutoff).sort((a, b) => a.stat.mtime - b.stat.mtime);
    return {
      files,
      folders,
      roots,
      linkCount,
      createdByDay,
      createdAtByPath,
      cometFile,
      health: { orphanNotes, brokenNotes, staleNotes }
    };
  }

  render() {
    if (this.clockTimer) window.clearInterval(this.clockTimer);
    this.stopGraphMotion();
    if (this.layoutFrame) window.cancelAnimationFrame(this.layoutFrame);
    this.layoutResizeObserver?.disconnect();
    this.clockTimer = null;
    this.layoutFrame = null;
    this.layoutEditing = false;
    this.layoutItems = [];
    this.applyLanguage();
    this.contentEl.empty();
    this.contentEl.addClass("knowledge-atlas-plugin-view");
    this.model = this.buildModel();
    if (this.currentFocus && !this.model.folders.has(this.currentFocus)) this.currentFocus = "";

    const root = createElement(this.contentEl, "div", "kap-root");
    const header = createElement(root, "header", "kap-header");
    const titleWrap = createElement(header, "div", "kap-title-wrap");
    createElement(titleWrap, "div", "kap-kicker", this.copy.kicker);
    createElement(titleWrap, "h1", "kap-title", this.copy.title);
    createElement(titleWrap, "p", "kap-subtitle", this.copy.subtitle);
    const stats = createElement(header, "div", "kap-stats");
    [[this.model.files.length, this.copy.notes], [this.model.folders.size, this.copy.folders], [this.model.linkCount, this.copy.links]].forEach(([value, label]) => {
      const item = createElement(stats, "div", "kap-stat");
      createElement(item, "strong", "kap-stat-value", Number(value).toLocaleString(this.locale));
      createElement(item, "span", "kap-stat-label", label);
    });

    const toolbar = createElement(root, "div", "kap-toolbar");
    const searchWrap = createElement(toolbar, "div", "kap-search-wrap");
    const searchIcon = createElement(searchWrap, "span", "kap-search-icon");
    searchIcon.setAttribute("aria-hidden", "true");
    this.searchInput = createElement(searchWrap, "input", "kap-search");
    this.searchInput.type = "search";
    this.searchInput.placeholder = this.copy.search;
    this.searchInput.setAttribute("aria-label", this.copy.search);
    this.searchResults = createElement(searchWrap, "div", "kap-search-results");
    const controls = createElement(toolbar, "div", "kap-controls");
    this.backButton = createButton(controls, "kap-button", this.copy.back);
    this.overviewButton = createButton(controls, "kap-button", this.copy.overview);
    this.orbitButton = createButton(controls, "kap-button is-active", this.copy.orbit);
    this.treeButton = createButton(controls, "kap-button", this.copy.tree);
    this.layoutButton = createButton(controls, "kap-button kap-layout-toggle", this.copy.layoutEdit);
    this.layoutResetButton = createButton(controls, "kap-button kap-layout-reset", this.copy.layoutReset);
    this.refreshButton = createButton(controls, "kap-button", "↻", this.copy.refresh);

    this.domainRail = createElement(root, "div", "kap-domain-rail");
    this.renderDomainRail();

    const body = createElement(root, "div", "kap-body");
    this.body = body;
    this.layoutNotice = createElement(body, "div", "kap-layout-notice", this.copy.layoutHint);
    this.stage = createElement(body, "section", "kap-stage");
    const stageHeader = createElement(this.stage, "div", "kap-stage-header");
    this.breadcrumbs = createElement(stageHeader, "div", "kap-breadcrumbs");
    this.viewHint = createElement(stageHeader, "div", "kap-view-hint");
    this.graph = createSvg("svg", { class: "kap-graph", viewBox: `0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`, role: "img", "aria-label": this.copy.graphLabel });
    this.stage.appendChild(this.graph);
    this.limitNote = createElement(this.stage, "div", "kap-limit-note");
    this.createZoomControls();
    this.createMotionControls();

    const dock = createElement(body, "aside", "kap-dock kap-right-rail");
    this.dock = dock;
    const clockPanel = createElement(dock, "section", "kap-insight-panel kap-clock-panel");
    this.renderClock(clockPanel);
    const calendarPanel = createElement(dock, "section", "kap-insight-panel kap-calendar-panel");
    this.renderCalendar(calendarPanel);
    this.heatmapPanel = createElement(dock, "section", "kap-insight-panel kap-heatmap-panel");
    this.renderHeatmap(this.heatmapPanel);
    this.trajectoryPanel = createElement(dock, "section", "kap-insight-panel kap-trajectory-panel");
    this.renderTrajectory(this.trajectoryPanel);
    const healthPanel = createElement(dock, "section", "kap-insight-panel kap-health-panel");
    this.renderHealth(healthPanel);
    const reviewPanel = createElement(dock, "section", "kap-insight-panel kap-review-panel");
    this.renderDailyReview(reviewPanel);

    const legendPanel = createElement(dock, "section", "kap-panel");
    createElement(legendPanel, "h2", "kap-panel-title", this.copy.readGraph);
    const legend = createElement(legendPanel, "div", "kap-legend");
    [["star", this.copy.star, "#f8c86a"], ["planet", this.copy.planet, PALETTE[1]], ["moon", this.copy.moon, PALETTE[0]], ["comet", this.copy.comet, "#f4f0ff"]].forEach(([type, label, color]) => {
      const item = createElement(legend, "div", "kap-legend-item");
      const mark = createElement(item, "span", `kap-legend-mark is-${type}`);
      mark.style.setProperty("--kap-legend-color", color);
      createElement(item, "span", "", label);
    });

    const recentPanel = createElement(dock, "section", "kap-panel kap-recent-panel");
    createElement(recentPanel, "h2", "kap-panel-title", this.copy.recent);
    this.recentList = createElement(recentPanel, "div", "kap-recent-list");
    this.renderRecent();

    this.setupLayoutItems([
      ["canvas", this.stage, this.copy.canvas],
      ["clock", clockPanel, this.copy.clockTitle],
      ["calendar", calendarPanel, this.copy.calendarTitle],
      ["heatmap", this.heatmapPanel, this.copy.heatmapTitle],
      ["trajectory", this.trajectoryPanel, this.copy.trajectoryTitle],
      ["health", healthPanel, this.copy.healthTitle],
      ["review", reviewPanel, this.copy.dailyReview],
      ["legend", legendPanel, this.copy.readGraph],
      ["recent", recentPanel, this.copy.recent]
    ]);

    this.bindControls();

    if (!this.model.files.length) {
      this.graph.replaceWith(createElement(document.createDocumentFragment(), "div", "kap-empty", this.copy.noNotes));
    } else {
      this.setFocus(this.currentFocus || "");
    }
    this.layoutFrame = window.requestAnimationFrame(() => {
      this.layoutFrame = null;
      this.applySavedLayout();
      this.observeLayoutWidth();
    });
  }

  clearPanelContent(panel) {
    for (const child of [...panel.children]) {
      if (!child.classList.contains("kap-layout-handle") && !child.classList.contains("kap-resize-handle")) child.remove();
    }
  }

  setupLayoutItems(entries) {
    this.layoutItems = entries.map(([id, element, label], index) => ({ id, element, label, z: index + 2 }));
    for (const item of this.layoutItems) {
      item.element.classList.add("kap-layout-item");
      item.element.dataset.layoutId = item.id;
      item.element.style.setProperty("--kap-layout-order", String(item.z));
      const move = createElement(item.element, "button", "kap-layout-handle", "⠿");
      move.type = "button";
      move.title = `${this.copy.moveItem} ${item.label}`;
      move.setAttribute("aria-label", move.title);
      const resize = createElement(item.element, "button", "kap-resize-handle", "");
      resize.type = "button";
      resize.title = `${this.copy.resizeItem} ${item.label}`;
      resize.setAttribute("aria-label", resize.title);
      move.addEventListener("pointerdown", event => this.startLayoutInteraction(event, item, "move"));
      resize.addEventListener("pointerdown", event => this.startLayoutInteraction(event, item, "resize"));
    }
  }

  getLayoutMinimum(item) {
    if (item.id === "canvas") return { width: 560, height: 600 };
    if (item.id === "heatmap" || item.id === "trajectory") return { width: 300, height: 260 };
    if (item.id === "health" || item.id === "recent") return { width: 280, height: 240 };
    return { width: 250, height: 150 };
  }

  captureCurrentLayout() {
    if (!this.body || !this.layoutItems.length) return null;
    const bodyRect = this.body.getBoundingClientRect();
    const items = {};
    for (const item of this.layoutItems) {
      const rect = item.element.getBoundingClientRect();
      items[item.id] = {
        x: Math.max(0, rect.left - bodyRect.left),
        y: Math.max(0, rect.top - bodyRect.top),
        width: rect.width,
        height: rect.height,
        z: Number.parseInt(item.element.style.zIndex || item.z, 10) || item.z
      };
    }
    return { viewportWidth: Math.max(this.body.clientWidth, 1), items };
  }

  clearInlineLayout() {
    this.body?.classList.remove("is-free-layout", "is-layout-editing");
    this.body?.style.removeProperty("min-height");
    for (const item of this.layoutItems) {
      for (const property of ["left", "top", "width", "height", "z-index"]) item.element.style.removeProperty(property);
    }
  }

  applySavedLayout() {
    const layout = this.plugin.settings.dashboardLayout;
    const bodyWidth = this.body?.clientWidth || 0;
    if (!layout?.items || !bodyWidth || bodyWidth < FREE_LAYOUT_MIN_WIDTH) {
      this.clearInlineLayout();
      this.layoutAppliedWidth = bodyWidth;
      this.scrollHeatmapToLatest();
      return;
    }
    this.body.classList.add("is-free-layout");
    const scale = bodyWidth / Math.max(layout.viewportWidth || bodyWidth, 1);
    this.layoutZCounter = 20;
    for (const item of this.layoutItems) {
      const saved = layout.items[item.id];
      if (!saved) continue;
      const minimum = this.getLayoutMinimum(item);
      const width = clamp(saved.width * scale, minimum.width, bodyWidth);
      const height = Math.max(saved.height, minimum.height);
      const left = clamp(saved.x * scale, 0, Math.max(0, bodyWidth - width));
      const top = Math.max(0, saved.y);
      const z = Number(saved.z || item.z);
      item.element.style.left = `${left}px`;
      item.element.style.top = `${top}px`;
      item.element.style.width = `${width}px`;
      item.element.style.height = `${height}px`;
      item.element.style.zIndex = String(z);
      this.layoutZCounter = Math.max(this.layoutZCounter, z);
    }
    this.layoutAppliedWidth = bodyWidth;
    this.updateLayoutHeight();
    this.scrollHeatmapToLatest();
  }

  scrollHeatmapToLatest() {
    const viewport = this.heatmapPanel?.querySelector(".kap-heatmap-viewport");
    if (viewport) viewport.scrollLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
  }

  updateLayoutHeight() {
    if (!this.body?.classList.contains("is-free-layout")) return;
    const bottom = this.layoutItems.reduce((max, item) => {
      const top = Number.parseFloat(item.element.style.top || 0);
      const height = Number.parseFloat(item.element.style.height || item.element.offsetHeight || 0);
      return Math.max(max, top + height);
    }, 0);
    this.body.style.minHeight = `${Math.ceil(bottom + 24)}px`;
  }

  async persistCurrentLayout() {
    const layout = this.captureCurrentLayout();
    if (!layout) return;
    this.plugin.settings.dashboardLayout = layout;
    await this.plugin.saveSettings(false);
  }

  async setLayoutEditing(enabled) {
    if (!this.body || this.body.clientWidth < FREE_LAYOUT_MIN_WIDTH) return;
    if (enabled && !this.plugin.settings.dashboardLayout?.items) {
      this.plugin.settings.dashboardLayout = this.captureCurrentLayout();
      this.applySavedLayout();
      await this.plugin.saveSettings(false);
    } else if (enabled) this.applySavedLayout();
    this.layoutEditing = enabled;
    this.body.classList.toggle("is-layout-editing", enabled);
    this.layoutButton.classList.toggle("is-active", enabled);
    this.layoutButton.textContent = enabled ? this.copy.layoutDone : this.copy.layoutEdit;
    this.layoutResetButton.classList.toggle("is-visible", enabled);
    if (!enabled) await this.persistCurrentLayout();
  }

  async resetDashboardLayout() {
    this.plugin.settings.dashboardLayout = cloneDefaultDashboardLayout();
    await this.plugin.saveSettings(false);
    this.render();
  }

  startLayoutInteraction(event, item, mode) {
    if (!this.layoutEditing || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    const handle = event.currentTarget;
    const bodyRect = this.body.getBoundingClientRect();
    const itemRect = item.element.getBoundingClientRect();
    const origin = {
      x: itemRect.left - bodyRect.left,
      y: itemRect.top - bodyRect.top,
      width: itemRect.width,
      height: itemRect.height
    };
    const minimum = this.getLayoutMinimum(item);
    const startX = event.clientX;
    const startY = event.clientY;
    item.element.style.zIndex = String(++this.layoutZCounter);
    item.element.classList.add("is-layout-interacting");
    try { handle.setPointerCapture?.(event.pointerId); } catch { /* Synthetic events may not own a pointer capture. */ }
    const move = pointerEvent => {
      const dx = pointerEvent.clientX - startX;
      const dy = pointerEvent.clientY - startY;
      if (mode === "move") {
        const left = clamp(snap(origin.x + dx), 0, Math.max(0, this.body.clientWidth - origin.width));
        const top = Math.max(0, snap(origin.y + dy));
        item.element.style.left = `${left}px`;
        item.element.style.top = `${top}px`;
      } else {
        const maxWidth = Math.max(minimum.width, this.body.clientWidth - origin.x);
        item.element.style.width = `${clamp(snap(origin.width + dx), minimum.width, maxWidth)}px`;
        item.element.style.height = `${Math.max(minimum.height, snap(origin.height + dy))}px`;
      }
      this.updateLayoutHeight();
    };
    const finish = async pointerEvent => {
      try {
        if (handle.hasPointerCapture?.(pointerEvent.pointerId)) handle.releasePointerCapture(pointerEvent.pointerId);
      } catch { /* The pointer may already be released. */ }
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", finish);
      handle.removeEventListener("pointercancel", finish);
      item.element.classList.remove("is-layout-interacting");
      await this.persistCurrentLayout();
    };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", finish);
    handle.addEventListener("pointercancel", finish);
  }

  observeLayoutWidth() {
    if (typeof ResizeObserver === "undefined" || !this.body) return;
    this.layoutResizeObserver = new ResizeObserver(() => {
      const width = this.body?.clientWidth || 0;
      if (!this.layoutEditing && Math.abs(width - this.layoutAppliedWidth) > 2) this.applySavedLayout();
    });
    this.layoutResizeObserver.observe(this.body);
  }

  createInsightHeader(parent, kicker, title, meta) {
    const header = createElement(parent, "div", "kap-insight-header");
    const copy = createElement(header, "div", "kap-insight-heading");
    if (kicker) createElement(copy, "div", "kap-panel-kicker", kicker);
    createElement(copy, "h2", "kap-insight-title", title);
    if (meta) createElement(header, "div", "kap-insight-meta", meta);
    return header;
  }

  renderDayNotes(parent, date, files) {
    parent.replaceChildren();
    parent.classList.add("is-visible");
    const heading = createElement(parent, "div", "kap-day-detail-heading");
    createElement(heading, "strong", "", formatDate(date, false, this.locale));
    createElement(heading, "span", "", `${files.length} ${this.copy.notesCreated}`);
    if (!files.length) {
      createElement(parent, "div", "kap-health-empty", this.copy.dayEmpty);
      return;
    }
    const list = createElement(parent, "div", "kap-compact-note-list");
    const visibleFiles = [...files].sort((a, b) => a.path.localeCompare(b.path)).slice(0, 80);
    for (const file of visibleFiles) {
      const button = createButton(list, "kap-compact-note", "", file.basename);
      createElement(button, "span", "kap-compact-note-title", file.basename);
      createElement(button, "span", "kap-compact-note-meta", file.parent?.path || this.copy.rootNotes);
      button.addEventListener("click", () => this.openNote(file.path));
    }
    if (files.length > visibleFiles.length) {
      createElement(parent, "div", "kap-day-overflow", `+${files.length - visibleFiles.length} ${this.copy.moreDayNotes}`);
    }
  }

  renderHeatmap(panel) {
    this.clearPanelContent(panel);
    const today = new Date();
    const finalWeek = startOfWeek(today, 1);
    const firstWeek = addDays(finalWeek, -(53 - 1) * 7);
    const days = Array.from({ length: 53 * 7 }, (_, index) => {
      const week = Math.floor(index / 7);
      const weekday = index % 7;
      return addDays(firstWeek, week * 7 + weekday);
    });
    const activityFiles = this.model.files;
    const filesByDay = new Map();
    for (const file of activityFiles) {
      const key = dayKey(this.model.createdAtByPath.get(file.path) || file.stat.ctime);
      if (!filesByDay.has(key)) filesByDay.set(key, []);
      filesByDay.get(key).push(file);
    }
    const total = days.reduce((sum, date) => sum + (filesByDay.get(dayKey(date))?.length || 0), 0);
    this.createInsightHeader(
      panel,
      "",
      this.copy.heatmapTitle,
      `${total.toLocaleString(this.locale)} ${this.copy.notesCreated} · ${this.copy.heatmapMeta}`
    );
    const viewport = createElement(panel, "div", "kap-heatmap-viewport");
    const months = createElement(viewport, "div", "kap-heatmap-months");
    let lastMonth = "";
    for (let week = 0; week < 53; week += 1) {
      const marker = addDays(firstWeek, week * 7 + 3);
      const key = `${marker.getFullYear()}-${marker.getMonth()}`;
      if (key === lastMonth) continue;
      lastMonth = key;
      const label = createElement(months, "span", "", new Intl.DateTimeFormat(this.locale, { month: "short" }).format(marker));
      label.style.gridColumn = String(week + 1);
    }

    const grid = createElement(viewport, "div", "kap-heatmap-grid");
    const maxCount = Math.max(1, ...days.map(date => filesByDay.get(dayKey(date))?.length || 0));
    days.forEach((date, index) => {
      const key = dayKey(date);
      const dayFiles = filesByDay.get(key) || [];
      const count = dayFiles.length;
      const level = count ? Math.max(1, Math.ceil((Math.log1p(count) / Math.log1p(maxCount)) * 4)) : 0;
      const cell = createButton(grid, `kap-heat-cell level-${level}${date > today ? " is-future" : ""}${this.selectedActivityDay === key ? " is-selected" : ""}`, "", this.copy.showDayNotes);
      cell.style.gridColumn = String(Math.floor(index / 7) + 1);
      cell.style.gridRow = String((index % 7) + 1);
      cell.setAttribute("aria-label", `${formatDate(date, false, this.locale)} · ${count} ${this.copy.notesCreated}`);
      cell.setAttribute("title", `${formatDate(date, false, this.locale)} · ${count} ${this.copy.notesCreated}`);
      cell.addEventListener("click", () => {
        this.selectedActivityDay = key;
        for (const item of grid.querySelectorAll(".kap-heat-cell")) item.classList.remove("is-selected");
        cell.classList.add("is-selected");
        this.renderDayNotes(dayDetail, date, dayFiles);
      });
    });

    const dayDetail = createElement(panel, "div", "kap-day-detail");
    if (this.selectedActivityDay) {
      const selectedDate = new Date(`${this.selectedActivityDay}T12:00:00`);
      this.renderDayNotes(dayDetail, selectedDate, filesByDay.get(this.selectedActivityDay) || []);
    }

    const legend = createElement(panel, "div", "kap-heat-legend");
    createElement(legend, "span", "", this.copy.less);
    for (let level = 0; level <= 4; level += 1) createElement(legend, "span", `kap-heat-cell level-${level}`);
    createElement(legend, "span", "", this.copy.more);
  }

  renderTrajectory(panel) {
    this.clearPanelContent(panel);
    this.createInsightHeader(panel, "", this.copy.trajectoryTitle, this.copy.trajectoryMeta);
    const charts = createElement(panel, "div", "kap-chart-grid");
    const monthChart = createElement(charts, "section", "kap-chart");
    createElement(monthChart, "h3", "kap-chart-title", this.copy.annualRhythm);
    const monthData = [];
    const now = new Date();
    const activityFiles = this.model.files;
    for (let offset = 11; offset >= 0; offset -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      const count = activityFiles.filter(file => {
        const created = new Date(this.model.createdAtByPath.get(file.path) || file.stat.ctime);
        return created.getFullYear() === date.getFullYear() && created.getMonth() === date.getMonth();
      }).length;
      monthData.push({ label: new Intl.DateTimeFormat(this.locale, { month: "short" }).format(date), count });
    }
    this.renderBars(monthChart, monthData, "month");

    const weekChart = createElement(charts, "section", "kap-chart");
    createElement(weekChart, "h3", "kap-chart-title", this.copy.weeklyRhythm);
    const weekStart = this.isChinese ? 1 : 0;
    const weekdayFormatter = new Intl.DateTimeFormat(this.locale, { weekday: "short" });
    const weekData = Array.from({ length: 7 }, (_, index) => {
      const day = (weekStart + index) % 7;
      const sample = addDays(startOfWeek(new Date(), weekStart), index);
      return {
        label: weekdayFormatter.format(sample),
        count: activityFiles.filter(file => new Date(this.model.createdAtByPath.get(file.path) || file.stat.ctime).getDay() === day).length
      };
    });
    this.renderBars(weekChart, weekData, "week");
  }

  renderBars(parent, data, variant) {
    const bars = createElement(parent, "div", `kap-bars kap-bars-${variant}`);
    const max = Math.max(1, ...data.map(item => item.count));
    for (const item of data) {
      const column = createElement(bars, "div", "kap-bar-column");
      createElement(column, "span", "kap-bar-value", item.count.toLocaleString(this.locale));
      const track = createElement(column, "div", "kap-bar-track");
      const fill = createElement(track, "div", "kap-bar-fill");
      fill.style.height = `${item.count ? Math.max(4, (item.count / max) * 100) : 2}%`;
      fill.setAttribute("title", `${item.label} · ${item.count} ${this.copy.notesCreated}`);
      createElement(column, "span", "kap-bar-label", item.label);
    }
  }

  renderHealth(panel) {
    this.createInsightHeader(panel, this.copy.healthKicker, this.copy.healthTitle);
    const metrics = createElement(panel, "div", "kap-health-metrics");
    const definitions = [
      ["orphan", this.copy.orphanNotes, this.model.health.orphanNotes.length],
      ["broken", this.copy.brokenLinks, this.model.health.brokenNotes.reduce((sum, item) => sum + item.count, 0)],
      ["stale", this.copy.staleNotes, this.model.health.staleNotes.length]
    ];
    const list = createElement(panel, "div", "kap-health-list");
    for (const [type, label, count] of definitions) {
      const button = createButton(metrics, `kap-health-metric${this.activeHealthType === type ? " is-active" : ""}`, "", label);
      createElement(button, "strong", "", count.toLocaleString(this.locale));
      createElement(button, "span", "", label);
      button.addEventListener("click", () => {
        this.activeHealthType = type;
        for (const item of metrics.querySelectorAll(".kap-health-metric")) item.classList.remove("is-active");
        button.classList.add("is-active");
        this.renderHealthList(list, type);
      });
    }
    this.renderHealthList(list, this.activeHealthType);
  }

  renderHealthList(parent, type) {
    parent.replaceChildren();
    const source = type === "broken" ? this.model.health.brokenNotes : type === "stale" ? this.model.health.staleNotes : this.model.health.orphanNotes;
    if (!source.length) {
      createElement(parent, "div", "kap-health-empty", this.copy.healthEmpty);
      return;
    }
    const visibleEntries = source.slice(0, 100);
    for (const entry of visibleEntries) {
      const file = type === "broken" ? entry.file : entry;
      const button = createButton(parent, "kap-health-note", "", file.basename);
      createElement(button, "span", "kap-compact-note-title", file.basename);
      let meta = file.parent?.path || this.copy.rootNotes;
      if (type === "broken") {
        const targets = entry.targets.slice(0, 2).map(item => item.target).join(" · ");
        meta = `${entry.count} ${this.copy.brokenTargets}${targets ? ` · ${targets}` : ""}`;
      } else if (type === "stale") {
        const days = Math.max(1, Math.floor((Date.now() - file.stat.mtime) / 86400000));
        meta = `${days} ${this.copy.staleFor} · ${file.parent?.path || this.copy.rootNotes}`;
      }
      createElement(button, "span", "kap-compact-note-meta", meta);
      button.addEventListener("click", () => this.openNote(file.path));
    }
    if (source.length > visibleEntries.length) {
      createElement(parent, "div", "kap-day-overflow", `+${source.length - visibleEntries.length} ${this.copy.moreHealthNotes}`);
    }
  }

  renderDailyReview(panel) {
    this.createInsightHeader(panel, this.copy.healthKicker, this.copy.dailyReview, this.copy.dailyReviewHint);
    const sorted = [...this.model.files].sort((a, b) => a.stat.mtime - b.stat.mtime);
    const poolSize = Math.min(sorted.length, Math.max(3, Math.ceil(sorted.length * .35)));
    const pool = sorted.slice(0, poolSize);
    const seed = dayKey(new Date());
    const selected = pool
      .map(file => ({ file, score: deterministicScore(`${seed}:${file.path}`) }))
      .sort((a, b) => a.score - b.score)
      .slice(0, 3)
      .map(item => item.file);
    const list = createElement(panel, "div", "kap-review-list");
    if (!selected.length) {
      createElement(list, "div", "kap-health-empty", this.copy.healthEmpty);
      return;
    }
    selected.forEach((file, index) => {
      const button = createButton(list, "kap-review-note", "", file.basename);
      createElement(button, "span", "kap-review-index", String(index + 1).padStart(2, "0"));
      const copy = createElement(button, "span", "kap-review-copy");
      createElement(copy, "span", "kap-compact-note-title", file.basename);
      createElement(copy, "span", "kap-compact-note-meta", `${formatDate(file.stat.mtime, false, this.locale)} · ${file.parent?.path || this.copy.rootNotes}`);
      button.addEventListener("click", () => this.openNote(file.path));
    });
  }

  renderClock(panel) {
    createElement(panel, "div", "kap-panel-kicker", this.copy.clockKicker);
    this.clockGreeting = createElement(panel, "div", "kap-clock-greeting");
    this.clockTime = createElement(panel, "time", "kap-clock-time");
    this.clockDate = createElement(panel, "div", "kap-clock-date");
    const update = () => {
      const now = new Date();
      const hour = now.getHours();
      this.clockGreeting.textContent = hour < 6 ? this.copy.goodNight : hour < 12 ? this.copy.goodMorning : hour < 18 ? this.copy.goodAfternoon : this.copy.goodEvening;
      this.clockTime.textContent = new Intl.DateTimeFormat(this.locale, { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(now);
      this.clockTime.dateTime = now.toISOString();
      this.clockDate.textContent = new Intl.DateTimeFormat(this.locale, { year: "numeric", month: "long", day: "numeric", weekday: "long" }).format(now);
    };
    update();
    this.clockTimer = window.setInterval(update, 1000);
  }

  renderCalendar(panel) {
    this.clearPanelContent(panel);
    const heading = createElement(panel, "div", "kap-calendar-heading");
    const titles = createElement(heading, "div", "");
    createElement(titles, "h2", "kap-insight-title", this.copy.calendarTitle);
    const nav = createElement(heading, "div", "kap-calendar-nav");
    const previous = createButton(nav, "kap-calendar-nav-button", "‹", this.copy.previousMonth);
    const next = createButton(nav, "kap-calendar-nav-button", "›", this.copy.nextMonth);

    const monthTitle = createElement(panel, "div", "kap-calendar-month", new Intl.DateTimeFormat(this.locale, { month: "long", year: "numeric" }).format(this.calendarCursor));
    const grid = createElement(panel, "div", "kap-calendar-grid");
    const firstDay = this.isChinese ? 1 : 0;
    const weekdayFormatter = new Intl.DateTimeFormat(this.locale, { weekday: "narrow" });
    const weekStart = startOfWeek(new Date(), firstDay);
    for (let index = 0; index < 7; index += 1) createElement(grid, "span", "kap-calendar-weekday", weekdayFormatter.format(addDays(weekStart, index)));

    const monthStart = new Date(this.calendarCursor.getFullYear(), this.calendarCursor.getMonth(), 1);
    const calendarStart = startOfWeek(monthStart, firstDay);
    const today = new Date();
    for (let index = 0; index < 42; index += 1) {
      const date = addDays(calendarStart, index);
      const count = this.model.createdByDay.get(dayKey(date))?.length || 0;
      const button = createButton(grid, "kap-calendar-day", String(date.getDate()));
      button.classList.toggle("is-outside", date.getMonth() !== this.calendarCursor.getMonth());
      button.classList.toggle("is-today", sameDay(date, today));
      button.classList.toggle("has-activity", count > 0);
      button.setAttribute("title", `${formatDate(date, false, this.locale)} · ${count} ${this.copy.notesCreated}`);
    }
    previous.addEventListener("click", () => {
      this.calendarCursor = new Date(this.calendarCursor.getFullYear(), this.calendarCursor.getMonth() - 1, 1);
      this.renderCalendar(panel);
    });
    next.addEventListener("click", () => {
      this.calendarCursor = new Date(this.calendarCursor.getFullYear(), this.calendarCursor.getMonth() + 1, 1);
      this.renderCalendar(panel);
    });
    monthTitle.setAttribute("aria-live", "polite");
  }

  renderDomainRail() {
    this.domainRail.replaceChildren();
    for (const folder of this.model.roots) {
      const button = createButton(this.domainRail, "kap-domain", `${folder.name} · ${folder.count}`);
      button.style.setProperty("--kap-domain-color", stableColor(folder.path));
      button.addEventListener("click", () => this.setFocus(folder.path));
    }
  }

  renderRecent() {
    this.recentList.replaceChildren();
    [...this.model.files]
      .sort((a, b) => b.stat.mtime - a.stat.mtime)
      .slice(0, this.plugin.settings.recentLimit)
      .forEach(file => {
        const button = createButton(this.recentList, "kap-recent", file.basename);
        button.replaceChildren();
        const bar = createElement(button, "span", "kap-recent-bar");
        bar.style.setProperty("--kap-recent-color", stableColor(file.path));
        const copy = createElement(button, "span", "kap-recent-copy");
        createElement(copy, "span", "kap-recent-title", file.basename);
        createElement(copy, "span", "kap-recent-path", file.parent?.path || this.copy.rootNotes);
        createElement(button, "span", "kap-recent-date", formatDate(file.stat.mtime, false, this.locale));
        button.addEventListener("click", () => this.openNote(file.path));
      });
  }

  getGalaxyOverview() {
    const roots = [...this.model.roots].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    const orbitGap = roots.length > 1
      ? Math.min(GALAXY_MAX_ORBIT_GAP, (GALAXY_OUTER_ORBIT - GALAXY_INNER_ORBIT) / (roots.length - 1))
      : 0;
    const center = {
      id: "center",
      type: "star",
      label: this.copy.vault,
      path: "VAULT",
      color: "#f8c86a",
      radius: clamp(35 + Math.log2(Math.max(this.model.files.length, 2)) * 1.8, 46, 58),
      detail: `${this.model.files.length} ${this.copy.notes} · ${roots.length} ${this.copy.folders}`
    };
    const planets = roots.map((folder, index) => {
      const mass = folder.count + folder.children.size * 6;
      const appearance = planetProfile(folder.path);
      const orbitProfile = solarOrbitProfile(index);
      return {
        id: `folder:${folder.path}`,
        type: "planet",
        label: folder.name,
        path: folder.path,
        color: appearance.atmosphere,
        appearance,
        count: folder.count,
        radius: clamp(14 + Math.sqrt(Math.max(mass, 1)) * .82, 19, 40),
        orbitRadius: GALAXY_INNER_ORBIT + index * orbitGap,
        orbitVelocity: visualOrbitVelocity(orbitProfile.periodDays),
        orbitPeriodDays: orbitProfile.periodDays,
        orbitReference: orbitProfile.reference,
        baseAngle: -Math.PI / 2 + (index / Math.max(roots.length, 1)) * Math.PI * 2,
        spinVelocity: .75 + (deterministicScore(`spin:${folder.path}`) % 110) / 100,
        detail: `${folder.count} ${this.copy.notes} · ${folder.children.size} ${this.copy.folders}`
      };
    });
    const childQueues = roots.map(folder => {
      const children = [...folder.children]
        .map(path => this.model.folders.get(path))
        .filter(Boolean)
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
      return {
        parent: folder,
        totalChildren: children.length,
        children: children.slice(0, OVERVIEW_MOONS_PER_PLANET)
      };
    });
    const selected = [];
    let round = 0;
    while (selected.length < this.plugin.settings.maxFolders) {
      let added = false;
      for (const queue of childQueues) {
        const folder = queue.children[round];
        if (!folder || selected.length >= this.plugin.settings.maxFolders) continue;
        selected.push({ folder, parent: queue.parent });
        added = true;
      }
      if (!added) break;
      round += 1;
    }
    const moonCountByParent = new Map();
    for (const { parent } of selected) moonCountByParent.set(parent.path, (moonCountByParent.get(parent.path) || 0) + 1);
    const moonOrderByParent = new Map();
    const planetByPath = new Map(planets.map(planet => [planet.path, planet]));
    const moons = selected.map(({ folder, parent }) => {
      const mass = folder.count + folder.children.size * 4;
      const orbitSlot = moonOrderByParent.get(parent.path) || 0;
      moonOrderByParent.set(parent.path, orbitSlot + 1);
      const moonCount = moonCountByParent.get(parent.path) || 1;
      const parentPlanet = planetByPath.get(parent.path);
      const ringOffset = (deterministicScore(`moon-ring:${parent.path}`) % 6283) / 1000;
      return {
        id: `folder:${folder.path}`,
        type: "moon",
        label: folder.name,
        path: folder.path,
        parentId: `folder:${parent.path}`,
        color: stableColor(parent.path),
        count: folder.count,
        radius: clamp(5.5 + Math.sqrt(Math.max(mass, 1)) * .38, 7, 12),
        orbitSlot,
        orbitRing: 0,
        orbitIndex: orbitSlot,
        orbitCount: moonCount,
        orbitRadius: (parentPlanet?.radius || 24) + 54,
        orbitVelocity: 1.28 + (deterministicScore(`moon-orbit:${parent.path}`) % 42) / 100,
        baseAngle: ringOffset + (orbitSlot / Math.max(moonCount, 1)) * Math.PI * 2,
        spinVelocity: 1.4 + (deterministicScore(`moon-spin:${folder.path}`) % 120) / 100,
        detail: `${folder.count} ${this.copy.notes} · ${folder.children.size} ${this.copy.folders}`
      };
    });
    const comet = this.model.cometFile ? {
      id: `note:${this.model.cometFile.path}`,
      type: "comet",
      label: this.model.cometFile.name,
      path: this.model.cometFile.path,
      color: "#f4f0ff",
      file: this.model.cometFile,
      radius: 8,
      orbitRadius: 650,
      orbitVelocity: 1.62,
      baseAngle: 3.85,
      spinVelocity: 2.4,
      detail: `${this.copy.rootNotes} · ${formatDate(this.model.cometFile.stat.mtime, true, this.locale)}`
    } : null;
    const edges = [
      ...planets.map(node => ({ source: "center", target: node.id, type: "orbit", color: node.color })),
      ...moons.map(node => ({ source: node.parentId, target: node.id, type: "satellite", color: node.color }))
    ];
    const availableMoonCount = childQueues.reduce((sum, queue) => sum + queue.totalChildren, 0);
    return {
      overview: true,
      nodes: [center, ...planets, ...moons, ...(comet ? [comet] : [])],
      edges,
      hiddenFolders: Math.max(0, availableMoonCount - moons.length),
      hiddenNotes: 0
    };
  }

  getVisibleGraph() {
    if (!this.currentFocus) return this.getGalaxyOverview();
    const settings = this.plugin.settings;
    const focusFolder = this.currentFocus ? this.model.folders.get(this.currentFocus) : null;
    const center = {
      id: "center",
      type: "center",
      label: focusFolder?.name || this.copy.vault,
      path: this.currentFocus || "VAULT",
      color: stableColor(this.currentFocus || "Knowledge Atlas"),
      detail: focusFolder
        ? `${focusFolder.count} ${this.copy.notes} · ${focusFolder.children.size} ${this.copy.folders}`
        : `${this.model.files.length} ${this.copy.notes} · ${this.model.roots.length} ${this.copy.folders}`
    };
    const childFolders = (this.currentFocus
      ? [...(focusFolder?.children || [])].map(path => this.model.folders.get(path))
      : this.model.roots)
      .filter(Boolean)
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    const visibleFolders = childFolders.slice(0, settings.maxFolders);
    const folderNodes = visibleFolders.map(folder => ({
      id: `folder:${folder.path}`,
      type: "folder",
      label: folder.name,
      path: folder.path,
      color: stableColor(folder.path),
      count: folder.count,
      detail: `${folder.count} ${this.copy.notes} · ${folder.children.size} ${this.copy.folders}`
    }));

    let candidateNotes = this.currentFocus ? [...(focusFolder?.files || [])] : [];
    const sampled = new Set();
    if (this.currentFocus && this.currentFocus !== ROOT_NOTES && candidateNotes.length < settings.sampleNotes) {
      const descendants = this.model.files
        .filter(file => file.path.startsWith(`${this.currentFocus}/`))
        .filter(file => !candidateNotes.some(item => item.path === file.path))
        .sort((a, b) => b.stat.mtime - a.stat.mtime);
      for (const file of descendants.slice(0, settings.sampleNotes - candidateNotes.length)) {
        candidateNotes.push(file);
        sampled.add(file.path);
      }
    }
    candidateNotes = candidateNotes.sort((a, b) => b.stat.mtime - a.stat.mtime).slice(0, settings.maxNotes);
    const noteNodes = candidateNotes.map(file => ({
      id: `note:${file.path}`,
      type: "note",
      label: file.basename,
      path: file.path,
      color: stableColor(file.path),
      sample: sampled.has(file.path),
      file,
      detail: `${file.parent?.path || this.copy.rootNotes} · ${formatDate(file.stat.mtime, true, this.locale)}`
    }));

    const nodes = [center, ...folderNodes, ...noteNodes];
    const edges = folderNodes.map(node => ({ source: "center", target: node.id, type: "tree", color: node.color }));
    const folderIds = new Map(folderNodes.map(node => [node.path, node.id]));
    for (const note of noteNodes) {
      let parent = "center";
      if (note.sample) {
        const match = [...folderIds.keys()].filter(path => note.path.startsWith(`${path}/`)).sort((a, b) => b.length - a.length)[0];
        if (match) parent = folderIds.get(match);
      }
      edges.push({ source: parent, target: note.id, type: "tree", color: note.color });
    }

    const visibleNoteIds = new Map(noteNodes.map(node => [node.path, node.id]));
    const crossLinks = new Set();
    for (const note of noteNodes) {
      const resolved = this.app.metadataCache.resolvedLinks[note.path] || {};
      for (const targetPath of Object.keys(resolved)) {
        const target = visibleNoteIds.get(targetPath);
        if (!target || target === note.id) continue;
        const key = [note.id, target].sort().join("::");
        if (crossLinks.has(key)) continue;
        crossLinks.add(key);
        edges.push({ source: note.id, target, type: "cross", color: note.color });
      }
    }
    return {
      nodes,
      edges,
      hiddenFolders: Math.max(0, childFolders.length - visibleFolders.length),
      hiddenNotes: Math.max(0, (focusFolder?.files.length || 0) - candidateNotes.filter(file => !sampled.has(file.path)).length)
    };
  }

  galaxyLayout(nodes, edges, phase = this.orbitPhase) {
    const positions = new Map([["center", { x: GRAPH_CENTER_X, y: GRAPH_CENTER_Y, depth: .56, scale: 1 }]]);
    const planets = nodes.filter(node => node.type === "planet");
    const moons = nodes.filter(node => node.type === "moon");
    for (const planet of planets) {
      const angle = planet.baseAngle + phase * planet.orbitVelocity;
      const projected = projectOrbit(planet.orbitRadius, angle);
      positions.set(planet.id, {
        x: GRAPH_CENTER_X + projected.x,
        y: GRAPH_CENTER_Y + projected.y,
        depth: projected.depth,
        scale: .82 + projected.depth * .3,
        angle,
        tangent: projected.tangent
      });
    }
    for (const moon of moons) {
      const planet = positions.get(moon.parentId);
      const planetNode = planets.find(item => item.id === moon.parentId);
      if (!planet || !planetNode) continue;
      const localRadius = moon.orbitRadius || (planetNode.radius || 24) + 54;
      const angle = moon.baseAngle + phase * moon.orbitVelocity;
      const projected = projectOrbit(localRadius, angle, .58, -.28);
      const depth = planet.depth * .72 + projected.depth * .28;
      positions.set(moon.id, {
        x: planet.x + projected.x,
        y: planet.y + projected.y,
        depth,
        scale: .78 + depth * .28,
        angle,
        tangent: projected.tangent
      });
    }
    const comet = nodes.find(node => node.type === "comet");
    if (comet) {
      const angle = comet.baseAngle + phase * comet.orbitVelocity;
      const projected = projectOrbit(comet.orbitRadius, angle, .54, -.16);
      positions.set(comet.id, {
        x: GRAPH_CENTER_X + projected.x,
        y: GRAPH_CENTER_Y + projected.y,
        depth: projected.depth,
        scale: .86 + projected.depth * .22,
        angle,
        tangent: projected.tangent
      });
    }
    return positions;
  }

  radialLayout(nodes, edges) {
    const positions = new Map([["center", { x: GRAPH_CENTER_X, y: GRAPH_CENTER_Y }]]);
    const folders = nodes.filter(node => node.type === "folder");
    const notes = nodes.filter(node => node.type === "note");
    const folderAngles = new Map();
    folders.forEach((node, index) => {
      const angle = -Math.PI / 2 + (index / Math.max(folders.length, 1)) * Math.PI * 2;
      const radius = folders.length > 18 && index % 2 ? 340 : 280;
      folderAngles.set(node.id, angle);
      positions.set(node.id, { x: GRAPH_CENTER_X + Math.cos(angle) * radius, y: GRAPH_CENTER_Y + Math.sin(angle) * radius });
    });
    const parentByNote = new Map(edges.filter(edge => edge.type === "tree" && edge.target.startsWith("note:")).map(edge => [edge.target, edge.source]));
    const groups = new Map();
    for (const note of notes) {
      const parent = parentByNote.get(note.id) || "center";
      if (!groups.has(parent)) groups.set(parent, []);
      groups.get(parent).push(note);
    }
    for (const [parent, group] of groups) {
      const base = folderAngles.get(parent) ?? -Math.PI / 2;
      const spread = parent === "center" ? Math.PI * 2 : Math.min(1.65, .28 + group.length * .12);
      group.forEach((node, index) => {
        const angle = base - spread / 2 + ((index + .5) / Math.max(group.length, 1)) * spread;
        const radius = [390, 440, 490][index % 3];
        positions.set(node.id, { x: GRAPH_CENTER_X + Math.cos(angle) * radius, y: GRAPH_CENTER_Y + Math.sin(angle) * radius });
      });
    }
    return positions;
  }

  treeLayout(nodes, edges) {
    if (nodes.some(node => node.type === "planet")) {
      const positions = new Map([["center", { x: 100, y: GRAPH_CENTER_Y }]]);
      const planets = nodes.filter(node => node.type === "planet");
      const moons = nodes.filter(node => node.type === "moon");
      const bandHeight = 930 / Math.max(planets.length, 1);
      planets.forEach((planet, index) => {
        const centerY = 75 + bandHeight * (index + .5);
        positions.set(planet.id, { x: 390, y: centerY });
        const group = moons.filter(moon => moon.parentId === planet.id);
        const columns = Math.max(1, Math.ceil(group.length / 4));
        const rows = Math.max(1, Math.ceil(group.length / columns));
        group.forEach((moon, moonIndex) => {
          const column = Math.floor(moonIndex / rows);
          const row = moonIndex % rows;
          positions.set(moon.id, {
            x: 650 + column * 235,
            y: centerY - ((rows - 1) * 23) / 2 + row * 23
          });
        });
      });
      const comet = nodes.find(node => node.type === "comet");
      if (comet) positions.set(comet.id, { x: 1080, y: 55 });
      return positions;
    }
    const positions = new Map([["center", { x: 110, y: GRAPH_CENTER_Y }]]);
    const folders = nodes.filter(node => node.type === "folder");
    const notes = nodes.filter(node => node.type === "note");
    const columns = Math.max(1, Math.ceil(folders.length / 14));
    const rows = Math.max(1, Math.ceil(folders.length / columns));
    folders.forEach((node, index) => {
      const column = Math.floor(index / rows);
      const row = index % rows;
      positions.set(node.id, {
        x: columns === 1 ? 420 : 270 + column * (440 / Math.max(columns - 1, 1)),
        y: 70 + (row + .5) * (940 / rows)
      });
    });
    notes.forEach((node, index) => positions.set(node.id, {
      x: index % 2 ? 1060 : 850,
      y: 55 + (index + .5) * (970 / Math.max(notes.length, 1))
    }));
    return positions;
  }

  curvePath(source, target, edgeType = "tree") {
    if (edgeType === "satellite") return `M ${source.x} ${source.y} L ${target.x} ${target.y}`;
    if (this.currentLayout === "tree") {
      const middle = (source.x + target.x) / 2;
      return `M ${source.x} ${source.y} C ${middle} ${source.y}, ${middle} ${target.y}, ${target.x} ${target.y}`;
    }
    const cx = GRAPH_CENTER_X + (source.x + target.x - GRAPH_WIDTH) * .13;
    const cy = GRAPH_CENTER_Y + (source.y + target.y - GRAPH_HEIGHT) * .13;
    return `M ${source.x} ${source.y} Q ${cx} ${cy} ${target.x} ${target.y}`;
  }

  renderStarfield(parent) {
    const layer = createSvg("g", { class: "kap-starfield", "aria-hidden": "true" });
    for (let index = 0; index < 96; index += 1) {
      const x = 22 + (deterministicScore(`star-x:${index}`) % ((GRAPH_WIDTH - 44) * 100)) / 100;
      const y = 20 + (deterministicScore(`star-y:${index}`) % ((GRAPH_HEIGHT - 40) * 100)) / 100;
      const radius = .45 + (deterministicScore(`star-r:${index}`) % 150) / 100;
      const star = createSvg("circle", { cx: x, cy: y, r: radius, class: `kap-space-star is-${index % 3}` });
      star.style.animationDelay = `${-(index % 17) * .37}s`;
      layer.appendChild(star);
    }
    parent.appendChild(layer);
  }

  renderGalaxyScenery(parent, data, positions) {
    const scenery = createSvg("g", { class: "kap-galaxy-scenery", "aria-hidden": "true" });
    this.moonOrbitElements = new Map();
    scenery.appendChild(createSvg("ellipse", {
      cx: GRAPH_CENTER_X,
      cy: GRAPH_CENTER_Y,
      rx: 650,
      ry: 338,
      transform: `rotate(-9 ${GRAPH_CENTER_X} ${GRAPH_CENTER_Y})`,
      class: "kap-galaxy-disk"
    }));
    for (let index = 0; index < 24; index += 1) {
      const angle = (index / 24) * Math.PI * 2;
      const point = projectOrbit(650, angle);
      scenery.appendChild(createSvg("line", {
        x1: GRAPH_CENTER_X,
        y1: GRAPH_CENTER_Y,
        x2: GRAPH_CENTER_X + point.x,
        y2: GRAPH_CENTER_Y + point.y,
        class: "kap-orbit-spoke"
      }));
    }
    for (const planet of data.nodes.filter(node => node.type === "planet")) {
      scenery.appendChild(createSvg("ellipse", {
        cx: GRAPH_CENTER_X,
        cy: GRAPH_CENTER_Y,
        rx: planet.orbitRadius,
        ry: planet.orbitRadius * .52,
        transform: `rotate(-9 ${GRAPH_CENTER_X} ${GRAPH_CENTER_Y})`,
        class: "kap-planet-orbit"
      }));
    }
    for (const planet of data.nodes.filter(node => node.type === "planet")) {
      const position = positions.get(planet.id);
      if (!position) continue;
      const planetMoons = data.nodes.filter(node => node.type === "moon" && node.parentId === planet.id);
      if (!planetMoons.length) continue;
      const elements = [];
      const orbitRadius = planetMoons[0].orbitRadius || (planet.radius || 24) + 54;
      const ellipse = createSvg("ellipse", {
        cx: position.x,
        cy: position.y,
        rx: orbitRadius,
        ry: orbitRadius * .58,
        transform: `rotate(-16 ${position.x} ${position.y})`,
        class: "kap-moon-orbit"
      });
      scenery.appendChild(ellipse);
      elements.push(ellipse);
      this.moonOrbitElements.set(planet.id, elements);
    }
    scenery.appendChild(createSvg("ellipse", {
      cx: GRAPH_CENTER_X,
      cy: GRAPH_CENTER_Y,
      rx: 650,
      ry: 351,
      transform: `rotate(-9 ${GRAPH_CENTER_X} ${GRAPH_CENTER_Y})`,
      class: "kap-comet-orbit"
    }));
    parent.appendChild(scenery);
  }

  renderGraph() {
    this.stopGraphMotion(true);
    this.motionHoverPaused = false;
    this.stage?.classList.remove("is-orbit-hover-paused");
    this.motionControls?.classList.remove("is-hover-paused");
    this.graph.replaceChildren();
    this.renderBreadcrumbs();
    const data = this.getVisibleGraph();
    const positions = this.currentLayout === "radial"
      ? data.overview ? this.galaxyLayout(data.nodes, data.edges) : this.radialLayout(data.nodes, data.edges)
      : this.treeLayout(data.nodes, data.edges);
    const motionAvailable = Boolean(data.overview && this.currentLayout === "radial");
    this.motionControls?.classList.toggle("is-visible", motionAvailable);
    this.viewHint.textContent = this.currentLayout === "radial" ? this.copy.orbitHint : this.copy.treeHint;
    this.viewport = createSvg("g", { class: "kap-viewport" });
    this.graph.appendChild(this.viewport);
    this.applyViewTransform();
    this.renderStarfield(this.viewport);
    if (this.currentLayout === "radial") {
      if (data.overview) this.renderGalaxyScenery(this.viewport, data, positions);
      else {
        this.viewport.appendChild(createSvg("circle", { cx: GRAPH_CENTER_X, cy: GRAPH_CENTER_Y, r: 280, class: "kap-orbit" }));
        this.viewport.appendChild(createSvg("circle", { cx: GRAPH_CENTER_X, cy: GRAPH_CENTER_Y, r: 430, class: "kap-orbit kap-orbit-secondary" }));
      }
    }

    const edgeLayer = createSvg("g", { class: "kap-edges" });
    const edgeElements = [];
    for (const edge of data.edges) {
      const source = positions.get(edge.source);
      const target = positions.get(edge.target);
      if (!source || !target) continue;
      const path = createSvg("path", {
        d: this.curvePath(source, target, edge.type),
        fill: "none",
        class: `kap-edge is-${edge.type}${edge.type === "cross" ? " is-cross" : ""}`,
        "data-source": edge.source,
        "data-target": edge.target
      });
      path.style.setProperty("--kap-edge-color", edge.color);
      edgeLayer.appendChild(path);
      edgeElements.push({ edge, path });
    }
    this.viewport.appendChild(edgeLayer);

    const nodeLayer = createSvg("g", { class: "kap-nodes" });
    const nodeElements = new Map();
    const noteParents = new Map(data.edges.filter(edge => edge.type === "tree" && edge.target.startsWith("note:")).map(edge => [edge.target, edge.source]));
    const moonParents = new Map(data.edges.filter(edge => edge.type === "satellite").map(edge => [edge.target, edge.source]));
    const labelCounts = new Map();
    const renderNodes = motionAvailable
      ? [...data.nodes].sort((left, right) => (positions.get(left.id)?.depth || .5) - (positions.get(right.id)?.depth || .5))
      : data.nodes;
    for (const node of renderNodes) {
      const position = positions.get(node.id);
      if (!position) continue;
      const group = createSvg("g", {
        class: `kap-node kap-node-${node.type}`,
        tabindex: "0",
        role: "button",
        "aria-label": node.label
      });
      group.style.transform = `translate(${position.x}px, ${position.y}px) scale(${position.scale || 1})`;
      nodeElements.set(node.id, group);
      group.style.setProperty("--kap-node-color", node.color);
      const coreRadius = node.radius || (node.type === "center" ? 24 : node.type === "folder" ? 13 : 4.2);
      if (node.type === "star") {
        renderStarSphere(group, node, coreRadius);
      } else if (node.type === "planet") {
        renderPlanetSphere(group, node, coreRadius);
      } else if (node.type === "moon") {
        renderMoonSphere(group, node, coreRadius);
      } else if (node.type === "comet") {
        const tailGradientId = `kap-comet-tail-${deterministicScore(node.id)}`;
        const defs = createSvg("defs");
        const tailGradient = createSvg("linearGradient", {
          id: tailGradientId,
          gradientUnits: "userSpaceOnUse",
          x1: -102,
          y1: -67,
          x2: -2,
          y2: -2
        });
        appendGradientStop(tailGradient, "0%", "#9fc5ff", 0);
        appendGradientStop(tailGradient, "28%", "#afd0ff", .1);
        appendGradientStop(tailGradient, "72%", "#d9eaff", .54);
        appendGradientStop(tailGradient, "100%", "#ffffff", .94);
        defs.appendChild(tailGradient);
        group.appendChild(defs);
        const tailStroke = `url(#${tailGradientId})`;
        group.appendChild(createSvg("path", {
          class: "kap-comet-tail is-plume",
          d: "M -102 -67 C -76 -60, -38 -29, -4 -3",
          stroke: tailStroke
        }));
        group.appendChild(createSvg("path", {
          class: "kap-comet-tail is-ribbon",
          d: "M -88 -58 C -61 -49, -30 -22, -3 -2",
          stroke: tailStroke
        }));
        group.appendChild(createSvg("path", {
          class: "kap-comet-tail is-thread",
          d: "M -70 -46 C -47 -38, -23 -16, -2 -1",
          stroke: tailStroke
        }));
        group.appendChild(createSvg("circle", { class: "kap-halo", r: coreRadius * 2.8 }));
        group.appendChild(createSvg("circle", { class: "kap-core", r: coreRadius }));
        group.appendChild(createSvg("circle", { class: "kap-comet-spark is-one", cx: -28, cy: -18, r: 1.8 }));
        group.appendChild(createSvg("circle", { class: "kap-comet-spark is-two", cx: -46, cy: -31, r: 1.2 }));
        group.appendChild(createSvg("circle", { class: "kap-comet-spark is-three", cx: -68, cy: -45, r: .8 }));
      } else {
        const haloRadius = node.type === "center" ? 42 : node.type === "folder" ? 26 : 13;
        group.appendChild(createSvg("circle", { class: "kap-halo", r: haloRadius }));
        group.appendChild(createSvg("circle", { class: "kap-core", r: coreRadius }));
      }
      if (node.type === "folder" || node.type === "planet") {
        const count = createSvg("text", { x: 0, y: 3, "text-anchor": "middle", class: "kap-label kap-node-count" });
        count.textContent = String(node.count);
        group.appendChild(count);
      }
      let collapse = false;
      if (node.type === "note" && this.currentLayout === "radial") {
        const parent = noteParents.get(node.id) || "center";
        const count = labelCounts.get(parent) || 0;
        collapse = count >= 7;
        labelCounts.set(parent, count + 1);
      }
      const sideFolderLabel = node.type === "folder" && this.currentLayout === "tree";
      let labelX = node.type === "note" ? 10 : sideFolderLabel ? 20 : 0;
      let labelY = node.type === "center" ? 46 : sideFolderLabel ? 3 : node.type === "folder" ? 32 : 3;
      let labelAnchor = node.type === "note" || sideFolderLabel ? "start" : "middle";
      if (node.type === "star") labelY = coreRadius + 28;
      if (node.type === "planet") labelY = coreRadius + 20;
      if (node.type === "comet") {
        labelX = coreRadius + 11;
        labelY = 3;
        labelAnchor = "start";
      }
      if (node.type === "moon") {
        if (this.currentLayout === "tree") {
          labelX = coreRadius + 9;
          labelY = 3;
          labelAnchor = "start";
        } else {
          const parentPosition = positions.get(moonParents.get(node.id));
          const dx = position.x - (parentPosition?.x || GRAPH_CENTER_X);
          const dy = position.y - (parentPosition?.y || GRAPH_CENTER_Y);
          const length = Math.hypot(dx, dy) || 1;
          const ux = dx / length;
          const uy = dy / length;
          labelX = ux * (coreRadius + 9);
          labelY = uy * (coreRadius + 9) + 3;
          labelAnchor = ux > .18 ? "start" : ux < -.18 ? "end" : "middle";
        }
      }
      const label = createSvg("text", {
        x: labelX,
        y: labelY,
        "text-anchor": labelAnchor,
        class: `kap-label ${collapse ? "is-collapsed" : ""}`.trim()
      });
      label.textContent = shortLabel(node.label, node.type === "note" ? 24 : node.type === "moon" ? 16 : 18);
      group.appendChild(label);

      const illuminate = active => {
        for (const item of edgeElements) {
          if (item.edge.source === node.id || item.edge.target === node.id) item.path.classList.toggle("is-lit", active);
        }
      };
      const pausesCelestialMotion = motionAvailable && ["star", "planet", "moon", "comet"].includes(node.type);
      group.addEventListener("mouseenter", () => {
        illuminate(true);
        if (pausesCelestialMotion) {
          this.motionHoverPaused = true;
          this.stage?.classList.add("is-orbit-hover-paused");
          this.motionControls?.classList.add("is-hover-paused");
        }
      });
      group.addEventListener("mouseleave", () => {
        illuminate(false);
        if (pausesCelestialMotion) {
          this.motionHoverPaused = false;
          this.motionLastTime = performance.now();
          this.stage?.classList.remove("is-orbit-hover-paused");
          this.motionControls?.classList.remove("is-hover-paused");
        }
      });
      const activate = () => {
        if (node.type === "note" || node.type === "comet") this.openNote(node.path);
        else if (node.type === "folder" || node.type === "planet" || node.type === "moon") this.setFocus(node.path);
        else if (node.type === "center" && this.currentFocus) this.setFocus(this.model.folders.get(this.currentFocus)?.parent || "");
      };
      group.addEventListener("click", activate);
      group.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          activate();
        }
      });
      nodeLayer.appendChild(group);
    }
    this.viewport.appendChild(nodeLayer);

    if (!this.currentFocus) this.limitNote.textContent = data.hiddenFolders
      ? `${this.copy.collapsed} · ${data.hiddenFolders} ${this.copy.moreFolders} · ${this.copy.hiddenHint}`
      : this.copy.collapsed;
    else if (data.hiddenFolders || data.hiddenNotes) {
      const parts = [];
      if (data.hiddenFolders) parts.push(`${data.hiddenFolders} ${this.copy.moreFolders}`);
      if (data.hiddenNotes) parts.push(`${data.hiddenNotes} ${this.copy.moreNotes}`);
      this.limitNote.textContent = `${parts.join(" · ")} · ${this.copy.hiddenHint}`;
    } else this.limitNote.textContent = this.copy.complete;
    this.backButton.disabled = !this.currentFocus;
    this.overviewButton.disabled = !this.currentFocus;
    if (motionAvailable) {
      const motionNodes = data.nodes.map(node => {
        const element = nodeElements.get(node.id);
        return {
          node,
          element,
          planetTexture: element?.querySelector(".kap-planet-texture") || null,
          moonTexture: element?.querySelector(".kap-moon-texture") || null,
          starCorona: element?.querySelector(".kap-star-corona") || null,
          cometParts: element ? [...element.querySelectorAll(".kap-comet-tail, .kap-comet-spark")] : []
        };
      }).filter(item => item.element);
      this.graphMotion = {
        data,
        nodeElements,
        motionNodes,
        edgeElements,
        nodeLayer,
        lastGeometryTime: 0,
        lastSurfaceTime: 0,
        lastSortPhase: this.orbitPhase
      };
      this.updateGalaxyMotion();
      this.startGraphMotionLoop();
    }
  }

  updateGalaxyMotion(timestamp = 0) {
    if (!this.graphMotion) return;
    const { data, nodeElements, motionNodes, edgeElements, nodeLayer } = this.graphMotion;
    const positions = this.galaxyLayout(data.nodes, data.edges, this.orbitPhase);
    const geometryDue = !timestamp || timestamp - this.graphMotion.lastGeometryTime >= 80;
    const surfaceDue = !timestamp || timestamp - this.graphMotion.lastSurfaceTime >= 66;
    for (const item of motionNodes) {
      const { node, element } = item;
      const position = positions.get(node.id);
      if (!node || !position) continue;
      if (node.type !== "star") element.style.transform = `translate(${position.x}px, ${position.y}px) scale(${position.scale || 1})`;
      if (geometryDue) element.style.opacity = String(.82 + (position.depth || .5) * .18);
      if (!surfaceDue) continue;
      const spin = (this.orbitPhase * (node.spinVelocity || .7) * 180) % 360;
      if (node.type === "planet") {
        const textureOffset = ((spin / 360) * (node.radius || 24) * 1.44) % ((node.radius || 24) * 1.44);
        item.planetTexture?.setAttribute("transform", `translate(${textureOffset} 0)`);
      } else if (node.type === "moon") {
        item.moonTexture?.setAttribute("transform", `rotate(${spin} 0 0)`);
      } else if (node.type === "star") {
        item.starCorona?.setAttribute("transform", `rotate(${spin * .22})`);
      } else if (node.type === "comet") {
        const tailRotation = (position.tangent * 180) / Math.PI - 34;
        for (const tail of item.cometParts) tail.setAttribute("transform", `rotate(${tailRotation})`);
      }
    }
    if (surfaceDue) this.graphMotion.lastSurfaceTime = timestamp || performance.now();
    if (geometryDue) {
      for (const { edge, path } of edgeElements) {
        const source = positions.get(edge.source);
        const target = positions.get(edge.target);
        if (source && target) path.setAttribute("d", this.curvePath(source, target, edge.type));
      }
      for (const [planetId, ellipses] of this.moonOrbitElements || []) {
        const position = positions.get(planetId);
        if (!position) continue;
        for (const ellipse of ellipses) {
          ellipse.setAttribute("cx", position.x);
          ellipse.setAttribute("cy", position.y);
          ellipse.setAttribute("transform", `rotate(-16 ${position.x} ${position.y})`);
        }
      }
      this.graphMotion.lastGeometryTime = timestamp || performance.now();
      const phaseDelta = Math.abs(this.orbitPhase - this.graphMotion.lastSortPhase);
      if (phaseDelta > .28 || phaseDelta > Math.PI * 1.9) {
        [...data.nodes]
          .sort((left, right) => (positions.get(left.id)?.depth || .5) - (positions.get(right.id)?.depth || .5))
          .forEach(node => {
            const element = nodeElements.get(node.id);
            if (element) nodeLayer.appendChild(element);
          });
        this.graphMotion.lastSortPhase = this.orbitPhase;
      }
    }
  }

  startGraphMotionLoop() {
    if (this.motionFrame || !this.graphMotion || !this.plugin.settings.motionEnabled || this.reduceMotion) return;
    this.stage?.classList.add("is-motion-running");
    this.motionLastTime = performance.now();
    const tick = timestamp => {
      if (!this.graphMotion || !this.plugin.settings.motionEnabled || this.reduceMotion) {
        this.stage?.classList.remove("is-motion-running");
        this.motionFrame = null;
        return;
      }
      if (this.motionHoverPaused) {
        this.motionLastTime = timestamp;
        this.motionFrame = window.requestAnimationFrame(tick);
        return;
      }
      const elapsed = Math.min(.05, Math.max(0, (timestamp - this.motionLastTime) / 1000));
      this.motionLastTime = timestamp;
      this.orbitPhase += elapsed * .22 * Number(this.plugin.settings.orbitSpeed || 1);
      this.updateGalaxyMotion(timestamp);
      this.motionFrame = window.requestAnimationFrame(tick);
    };
    this.motionFrame = window.requestAnimationFrame(tick);
  }

  stopGraphMotion(clear = true) {
    if (this.motionFrame) window.cancelAnimationFrame(this.motionFrame);
    this.stage?.classList.remove("is-motion-running");
    this.motionFrame = null;
    this.motionLastTime = 0;
    if (clear) this.graphMotion = null;
  }

  renderBreadcrumbs() {
    this.breadcrumbs.replaceChildren();
    const home = createButton(this.breadcrumbs, "kap-crumb", this.copy.vault);
    home.addEventListener("click", () => this.setFocus(""));
    if (!this.currentFocus) return;
    if (this.currentFocus === ROOT_NOTES) {
      createElement(this.breadcrumbs, "span", "", "›");
      createElement(this.breadcrumbs, "span", "", this.copy.rootNotes);
      return;
    }
    const parts = this.currentFocus.split("/");
    parts.forEach((part, index) => {
      createElement(this.breadcrumbs, "span", "", "›");
      const button = createButton(this.breadcrumbs, "kap-crumb", part);
      button.addEventListener("click", () => this.setFocus(parts.slice(0, index + 1).join("/")));
    });
  }

  setFocus(path) {
    if (path && !this.model.folders.has(path)) return;
    this.currentFocus = path;
    this.resetView(false);
    this.rootElement?.style?.setProperty("--kap-accent", stableColor(path || "Knowledge Atlas"));
    this.renderGraph();
    for (const button of this.domainRail.querySelectorAll(".kap-domain")) {
      button.classList.toggle("is-active", button.textContent.startsWith(`${this.model.folders.get(path)?.name || "\0"} ·`));
    }
  }

  async openNote(path) {
    const file = this.app.vault.getAbstractFileByPath(path);
    if (!(file instanceof TFile)) return;
    const leaf = this.app.workspace.getLeaf(this.plugin.settings.openNotesInNewLeaf);
    await leaf.openFile(file);
  }

  runSearch() {
    const query = this.searchInput.value.trim().toLocaleLowerCase();
    this.searchResults.replaceChildren();
    if (!query) {
      this.searchResults.classList.remove("is-open");
      return;
    }
    const matches = this.model.files
      .map(file => {
        const name = file.basename.toLocaleLowerCase();
        const path = file.path.toLocaleLowerCase();
        const score = name === query ? 0 : name.startsWith(query) ? 1 : name.includes(query) ? 2 : path.includes(query) ? 3 : 99;
        return { file, score };
      })
      .filter(item => item.score < 99)
      .sort((a, b) => a.score - b.score || b.file.stat.mtime - a.file.stat.mtime)
      .slice(0, 10);
    if (!matches.length) createElement(this.searchResults, "div", "kap-search-empty", this.copy.noResults);
    for (const { file } of matches) {
      const button = createButton(this.searchResults, "kap-result", file.basename);
      button.replaceChildren();
      const dot = createElement(button, "span", "kap-result-dot");
      dot.style.setProperty("--kap-result-color", stableColor(file.path));
      const copy = createElement(button, "span", "kap-result-copy");
      createElement(copy, "span", "kap-result-title", file.basename);
      createElement(copy, "span", "kap-result-path", file.parent?.path || this.copy.rootNotes);
      createElement(button, "span", "kap-result-date", formatDate(file.stat.mtime, false, this.locale));
      button.addEventListener("click", () => this.openNote(file.path));
    }
    this.searchResults.classList.add("is-open");
  }

  createZoomControls() {
    const controls = createElement(this.stage, "div", "kap-zoom");
    this.zoomOutButton = createButton(controls, "kap-zoom-button", "−", this.copy.zoomOut);
    this.zoomValue = createElement(controls, "div", "kap-zoom-value", "100%");
    this.zoomInButton = createButton(controls, "kap-zoom-button", "+", this.copy.zoomIn);
    this.zoomResetButton = createButton(controls, "kap-zoom-button is-fit", this.copy.fit, this.copy.fit);
  }

  createMotionControls() {
    const controls = createElement(this.stage, "div", "kap-motion-controls");
    this.motionControls = controls;
    this.motionToggleButton = createButton(controls, "kap-motion-toggle", "Ⅱ", this.copy.pauseMotion);
    const label = createElement(controls, "label", "kap-motion-speed");
    createElement(label, "span", "kap-motion-label", this.copy.motionSpeed);
    this.motionSlider = createElement(label, "input", "kap-motion-slider");
    this.motionSlider.type = "range";
    this.motionSlider.min = ".25";
    this.motionSlider.max = "3";
    this.motionSlider.step = ".25";
    this.motionSlider.value = String(this.plugin.settings.orbitSpeed || 1);
    this.motionValue = createElement(label, "output", "kap-motion-value");
    this.updateMotionControls();
  }

  updateMotionControls() {
    if (!this.motionToggleButton) return;
    const enabled = this.plugin.settings.motionEnabled && !this.reduceMotion;
    this.motionToggleButton.textContent = enabled ? "Ⅱ" : "▶";
    this.motionToggleButton.title = enabled ? this.copy.pauseMotion : this.copy.playMotion;
    this.motionToggleButton.setAttribute("aria-label", this.motionToggleButton.title);
    this.motionToggleButton.classList.toggle("is-paused", !enabled);
    if (this.motionSlider) this.motionSlider.value = String(this.plugin.settings.orbitSpeed || 1);
    if (this.motionValue) this.motionValue.textContent = `${Number(this.plugin.settings.orbitSpeed || 1).toFixed(2).replace(/0+$/, "").replace(/\.$/, "")}×`;
  }

  applyViewTransform() {
    if (this.viewport) {
      const { x, y, k } = this.viewTransform;
      this.viewport.setAttribute("transform", `matrix(${k} 0 0 ${k} ${x} ${y})`);
    }
    if (this.zoomValue) this.zoomValue.textContent = `${Math.round(this.viewTransform.k * 100)}%`;
  }

  resetView(apply = true) {
    this.viewTransform = { x: 0, y: 0, k: 1 };
    if (apply) this.applyViewTransform();
  }

  clientToGraphPoint(event) {
    const matrix = this.graph.getScreenCTM();
    if (matrix) {
      const point = this.graph.createSVGPoint();
      point.x = event.clientX;
      point.y = event.clientY;
      const local = point.matrixTransform(matrix.inverse());
      return { x: local.x, y: local.y };
    }
    const rect = this.graph.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (GRAPH_WIDTH / Math.max(rect.width, 1)),
      y: (event.clientY - rect.top) * (GRAPH_HEIGHT / Math.max(rect.height, 1))
    };
  }

  zoomAt(factor, point = { x: GRAPH_CENTER_X, y: GRAPH_CENTER_Y }) {
    const previous = this.viewTransform.k;
    const next = clamp(previous * factor, .55, 3);
    if (Math.abs(next - previous) < .001) return;
    this.viewTransform.x = point.x - (point.x - this.viewTransform.x) * (next / previous);
    this.viewTransform.y = point.y - (point.y - this.viewTransform.y) * (next / previous);
    this.viewTransform.k = next;
    this.applyViewTransform();
  }

  bindControls() {
    this.rootElement = this.contentEl.querySelector(".kap-root");
    this.backButton.addEventListener("click", () => this.setFocus(this.model.folders.get(this.currentFocus)?.parent || ""));
    this.overviewButton.addEventListener("click", () => this.setFocus(""));
    this.orbitButton.addEventListener("click", () => {
      this.currentLayout = "radial";
      this.resetView(false);
      this.orbitButton.classList.add("is-active");
      this.treeButton.classList.remove("is-active");
      this.renderGraph();
    });
    this.treeButton.addEventListener("click", () => {
      this.currentLayout = "tree";
      this.resetView(false);
      this.treeButton.classList.add("is-active");
      this.orbitButton.classList.remove("is-active");
      this.renderGraph();
    });
    this.refreshButton.addEventListener("click", () => this.render());
    this.layoutButton.addEventListener("click", () => this.setLayoutEditing(!this.layoutEditing));
    this.layoutResetButton.addEventListener("click", () => this.resetDashboardLayout());
    this.searchInput.addEventListener("input", () => this.runSearch());
    this.searchInput.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        this.searchInput.value = "";
        this.runSearch();
        this.searchInput.blur();
      }
    });
    this.searchInput.closest(".kap-search-wrap").addEventListener("focusout", () => {
      window.setTimeout(() => {
        if (!this.searchInput.closest(".kap-search-wrap").contains(document.activeElement)) this.searchResults.classList.remove("is-open");
      }, 0);
    });
    this.zoomOutButton.addEventListener("click", () => this.zoomAt(1 / 1.22));
    this.zoomInButton.addEventListener("click", () => this.zoomAt(1.22));
    this.zoomResetButton.addEventListener("click", () => this.resetView());
    this.motionToggleButton.addEventListener("click", async () => {
      this.plugin.settings.motionEnabled = !this.plugin.settings.motionEnabled;
      this.updateMotionControls();
      if (this.plugin.settings.motionEnabled && !this.reduceMotion) this.startGraphMotionLoop();
      else this.stopGraphMotion(false);
      await this.plugin.saveSettings(false);
    });
    this.motionSlider.addEventListener("input", () => {
      this.plugin.settings.orbitSpeed = Number(this.motionSlider.value);
      this.updateMotionControls();
    });
    this.motionSlider.addEventListener("change", () => this.plugin.saveSettings(false));
    this.graph.addEventListener("wheel", event => {
      event.preventDefault();
      this.zoomAt(event.deltaY < 0 ? 1.14 : 1 / 1.14, this.clientToGraphPoint(event));
    }, { passive: false });
    this.graph.addEventListener("pointerdown", event => {
      if (event.button !== 0 || event.target.closest?.(".kap-node")) return;
      const point = this.clientToGraphPoint(event);
      this.panState = { pointerId: event.pointerId, startX: point.x, startY: point.y, originX: this.viewTransform.x, originY: this.viewTransform.y };
      this.graph.setPointerCapture(event.pointerId);
      this.graph.classList.add("is-panning");
    });
    this.graph.addEventListener("pointermove", event => {
      if (!this.panState || event.pointerId !== this.panState.pointerId) return;
      const point = this.clientToGraphPoint(event);
      this.viewTransform.x = this.panState.originX + point.x - this.panState.startX;
      this.viewTransform.y = this.panState.originY + point.y - this.panState.startY;
      this.applyViewTransform();
    });
    const stopPan = event => {
      if (!this.panState || event.pointerId !== this.panState.pointerId) return;
      if (this.graph.hasPointerCapture(event.pointerId)) this.graph.releasePointerCapture(event.pointerId);
      this.panState = null;
      this.graph.classList.remove("is-panning");
    };
    this.graph.addEventListener("pointerup", stopPan);
    this.graph.addEventListener("pointercancel", stopPan);
    this.graph.addEventListener("dblclick", event => {
      if (!event.target.closest?.(".kap-node")) this.resetView();
    });
  }
}

class KnowledgeAtlasSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();
    const copy = COPY[resolveLanguage(this.plugin.settings.language)];
    new Setting(containerEl)
      .setName(copy.settingsLanguage)
      .setDesc(copy.settingsLanguageDesc)
      .addDropdown(dropdown => dropdown
        .addOption("auto", copy.languageAuto)
        .addOption("zh", copy.languageChinese)
        .addOption("en", copy.languageEnglish)
        .setValue(this.plugin.settings.language || "auto")
        .onChange(async value => {
          this.plugin.settings.language = value;
          await this.plugin.saveSettings();
          this.display();
        }));
    new Setting(containerEl)
      .setName(copy.settingsStartup)
      .setDesc(copy.settingsStartupDesc)
      .addToggle(toggle => toggle.setValue(this.plugin.settings.openOnStartup).onChange(async value => {
        this.plugin.settings.openOnStartup = value;
        await this.plugin.saveSettings();
      }));
    new Setting(containerEl)
      .setName(copy.settingsExcluded)
      .setDesc(copy.settingsExcludedDesc)
      .addText(text => text
        .setPlaceholder("Folder, nested/folder")
        .setValue(this.plugin.settings.excludedFolders.join(", "))
        .onChange(async value => {
          this.plugin.settings.excludedFolders = value.split(",").map(item => item.trim()).filter(Boolean);
          await this.plugin.saveSettings();
        }));
    new Setting(containerEl)
      .setName(copy.settingsMaxFolders)
      .setDesc(copy.settingsMaxFoldersDesc)
      .addSlider(slider => slider.setLimits(8, 80, 4).setValue(this.plugin.settings.maxFolders).setDynamicTooltip().onChange(async value => {
        this.plugin.settings.maxFolders = value;
        await this.plugin.saveSettings();
      }));
    new Setting(containerEl)
      .setName(copy.settingsMaxNotes)
      .setDesc(copy.settingsMaxNotesDesc)
      .addSlider(slider => slider.setLimits(12, 120, 6).setValue(this.plugin.settings.maxNotes).setDynamicTooltip().onChange(async value => {
        this.plugin.settings.maxNotes = value;
        await this.plugin.saveSettings();
      }));
    new Setting(containerEl)
      .setName(copy.settingsStaleDays)
      .setDesc(copy.settingsStaleDaysDesc)
      .addSlider(slider => slider.setLimits(30, 730, 30).setValue(this.plugin.settings.staleDays).setDynamicTooltip().onChange(async value => {
        this.plugin.settings.staleDays = value;
        await this.plugin.saveSettings();
      }));
    new Setting(containerEl)
      .setName(copy.settingsRecent)
      .setDesc(copy.settingsRecentDesc)
      .addSlider(slider => slider.setLimits(3, 20, 1).setValue(this.plugin.settings.recentLimit).setDynamicTooltip().onChange(async value => {
        this.plugin.settings.recentLimit = value;
        await this.plugin.saveSettings();
      }));
    new Setting(containerEl)
      .setName(copy.settingsNewTab)
      .setDesc(copy.settingsNewTabDesc)
      .addToggle(toggle => toggle.setValue(this.plugin.settings.openNotesInNewLeaf).onChange(async value => {
        this.plugin.settings.openNotesInNewLeaf = value;
        await this.plugin.saveSettings();
      }));
  }
}

export default class KnowledgeAtlasPlugin extends Plugin {
  async onload() {
    const savedSettings = await this.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, savedSettings);
    if (!this.settings.dashboardLayout?.items) this.settings.dashboardLayout = cloneDefaultDashboardLayout();
    addIcon(ICON_ID, ICON_SVG);
    this.registerView(VIEW_TYPE, leaf => new KnowledgeAtlasView(leaf, this));
    this.addRibbonIcon(ICON_ID, "Open knowledge atlas", () => this.activateView());
    this.addCommand({ id: "open-atlas", name: "Open atlas", callback: () => this.activateView() });
    this.addCommand({ id: "refresh-atlas", name: "Refresh atlas", callback: () => this.refreshViews() });
    this.addSettingTab(new KnowledgeAtlasSettingTab(this.app, this));
    this.app.workspace.onLayoutReady(() => {
      if (this.settings.openOnStartup) this.activateView();
    });
    ["create", "delete", "rename", "modify"].forEach(eventName => {
      this.registerEvent(this.app.vault.on(eventName, () => this.queueRefresh()));
    });
    this.registerEvent(this.app.metadataCache.on("resolved", () => this.queueRefresh()));
  }

  onunload() {
    if (this.refreshTimer) window.clearTimeout(this.refreshTimer);
  }

  async activateView() {
    let leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE)[0];
    if (!leaf) {
      leaf = this.app.workspace.getLeaf(true);
      await leaf.setViewState({ type: VIEW_TYPE, active: true });
    }
    this.app.workspace.revealLeaf(leaf);
    this.app.workspace.setActiveLeaf(leaf, { focus: true });
  }

  queueRefresh() {
    if (this.refreshTimer) window.clearTimeout(this.refreshTimer);
    this.refreshTimer = window.setTimeout(() => this.refreshViews(), 800);
  }

  refreshViews() {
    for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE)) {
      if (leaf.view instanceof KnowledgeAtlasView) leaf.view.render();
    }
  }

  async saveSettings(refresh = true) {
    await this.saveData(this.settings);
    if (refresh) this.refreshViews();
  }
};
