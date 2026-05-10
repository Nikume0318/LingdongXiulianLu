const STORAGE_KEY = "cultivationQuestStateV2";
const LEGACY_KEY = "sportQuestMvpState";
const DAY_MS = 24 * 60 * 60 * 1000;

const activityTypes = [
  { id: "run", label: "跑步", method: "御风术", school: "身法", icon: "风" },
  { id: "bike", label: "骑行", method: "踏云行", school: "身法", icon: "云" },
  { id: "strength", label: "力量", method: "炼体诀", school: "炼体", icon: "体" },
  { id: "ball", label: "球类", method: "斗法演练", school: "斗法", icon: "斗" },
  { id: "stretch", label: "拉伸", method: "调息术", school: "调息", icon: "息" },
  { id: "other", label: "其他", method: "自由历练", school: "综合", icon: "游" },
];

const intensityRules = {
  easy: { label: "调息", multiplier: 1, stoneRate: 0.8, physiqueRate: 0.8 },
  normal: { label: "凝气", multiplier: 1.5, stoneRate: 1.2, physiqueRate: 1 },
  hard: { label: "淬体", multiplier: 2, stoneRate: 1.6, physiqueRate: 1.35 },
};

const realms = [
  { id: "qi-1", name: "练气一层", threshold: 0, badge: "realm-qi-v3.png" },
  { id: "qi-2", name: "练气二层", threshold: 100, badge: "realm-qi-v3.png" },
  { id: "qi-3", name: "练气三层", threshold: 240, badge: "realm-qi-v3.png" },
  { id: "foundation-early", name: "筑基初期", threshold: 420, badge: "realm-foundation-v3.png" },
  { id: "foundation-mid", name: "筑基中期", threshold: 680, badge: "realm-foundation-v3.png" },
  { id: "foundation-late", name: "筑基后期", threshold: 1000, badge: "realm-foundation-v3.png" },
  { id: "golden-core", name: "金丹初成", threshold: 1400, badge: "realm-golden-core-v3.png" },
];

const techniques = [
  { id: "qingyun", name: "青云吐纳诀", school: "均衡", description: "所有修炼收益稳定，适合第一阶段入门。" },
  { id: "xuanwu", name: "玄武炼体经", school: "炼体", description: "力量与高强度修炼更容易积累体魄。" },
  { id: "liuguang", name: "流光御风篇", school: "身法", description: "跑步与骑行更贴合身法修炼。" },
];

const sectRanks = [
  { name: "外门弟子", min: 0 },
  { name: "内门弟子", min: 55 },
  { name: "精英弟子", min: 100 },
  { name: "亲传弟子", min: 145 },
];

const characterProfiles = {
  male: {
    id: "male",
    label: "男修",
    image: "cultivator-male-v5.png",
    seal: "乾",
    fallbackName: "清风子",
  },
  female: {
    id: "female",
    label: "女修",
    image: "cultivator-female-v5.png",
    seal: "坤",
    fallbackName: "云栖月",
  },
};

const treasures = [
  {
    id: "wind-boots",
    name: "疾风靴",
    image: "treasure-wind-boots-v4.png",
    description: "累计修炼 3 次后解锁。",
    test: (stats) => stats.totalCount >= 3,
    growth: {
      title: "御风共鸣",
      hint: "跑步与骑行会提升共鸣。",
      thresholds: [30, 90, 180],
      match: (record) => ["run", "bike"].includes(record.type),
    },
    skill: {
      name: "踏风轻身",
      fantasy: "步伐轻快时，风灵会托住脚踝，让下一次出门更容易开始。",
      value: "对应跑步与骑行，强化速度感和出门启动感。",
      stages: ["感风", "踏风", "逐风", "御风"],
    },
  },
  {
    id: "iron-wristguards",
    name: "玄铁护腕",
    image: "treasure-iron-wristguards-v4.png",
    description: "完成一次淬体修炼后解锁。",
    test: (stats) => stats.hasHardPractice,
    growth: {
      title: "炼体共鸣",
      hint: "力量修炼与淬体强度会提升共鸣。",
      thresholds: [20, 60, 120],
      match: (record) => record.type === "strength" || record.intensity === "hard",
    },
    skill: {
      name: "玄铁护脉",
      fantasy: "气血上涌时，护腕会稳住手臂和核心，提醒你把动作做扎实。",
      value: "对应力量训练和高强度修炼，强化体魄与抗压感。",
      stages: ["温铁", "凝铁", "玄铁", "护脉"],
    },
  },
  {
    id: "jade-pendant",
    name: "凝神玉佩",
    image: "treasure-jade-pendant-v4.png",
    description: "首次突破境界后解锁。",
    test: (stats) => stats.breakthroughCount >= 1,
    growth: {
      title: "凝神共鸣",
      hint: "拉伸与调息修炼会提升共鸣。",
      thresholds: [20, 60, 120],
      match: (record) => record.type === "stretch" || record.intensity === "easy",
    },
    skill: {
      name: "静心归息",
      fantasy: "玉佩会在呼吸放缓时微微发亮，把杂念收回到一呼一吸之间。",
      value: "对应拉伸和调息，强化恢复、专注和低门槛开始。",
      stages: ["听息", "凝息", "归息", "静心"],
    },
  },
];

const fates = [
  { id: "first-practice", name: "初入洞府", icon: "初", category: "practice", description: "第一次入定收功", test: (stats) => stats.totalCount >= 1 },
  { id: "three-practices", name: "三日小成", icon: "三", category: "practice", description: "累计 3 次入定", test: (stats) => stats.totalCount >= 3 },
  { id: "seven-practices", name: "七转周天", icon: "七", category: "practice", description: "累计 7 次入定", test: (stats) => stats.totalCount >= 7 },
  { id: "streak-three", name: "连续入定", icon: "连", category: "habit", description: "连续修炼 3 天", test: (stats) => stats.streak >= 3 },
  { id: "minutes-120", name: "百二周天", icon: "时", category: "practice", description: "累计修炼 120 分钟", test: (stats) => stats.totalMinutes >= 120 },
  { id: "hard-practice", name: "淬体试炼", icon: "体", category: "practice", description: "进行一次淬体入定", test: (stats) => stats.hasHardPractice },
  { id: "first-breakthrough", name: "破境有声", icon: "破", category: "breakthrough", description: "第一次冲破境界", test: (stats) => stats.breakthroughCount >= 1 },
  { id: "first-pill", name: "丹成一炉", icon: "丹", category: "collection", description: "炼成第一枚聚气丹", test: (stats) => stats.pillsCrafted >= 1 },
  { id: "first-treasure", name: "法宝认主", icon: "宝", category: "collection", description: "激活第一件法宝", test: (stats) => stats.treasureCount >= 1 },
];

const fateFilters = [
  { id: "all", label: "全部", summary: (count) => `全部仙缘 ${count} 项。` },
  { id: "unlocked", label: "已解锁", summary: (count) => `已解锁仙缘 ${count} 项。` },
  { id: "locked", label: "待解锁", summary: (count) => `待解锁仙缘 ${count} 项。` },
  { id: "practice", label: "修炼", summary: (count) => `修炼类仙缘 ${count} 项。` },
  { id: "habit", label: "连续", summary: (count) => `连续习惯类仙缘 ${count} 项。` },
  { id: "breakthrough", label: "突破", summary: (count) => `境界突破类仙缘 ${count} 项。` },
  { id: "collection", label: "收藏", summary: (count) => `丹药与法宝收藏类仙缘 ${count} 项。` },
];

const defaultState = {
  user: {
    cultivation: 0,
    spiritStones: 0,
    physique: 0,
    weeklyGoal: 3,
    dailyGoalMinutes: 20,
    spiritualRoot: "风木双灵根",
    activeTechnique: "qingyun",
    character: {
      gender: "male",
      nickname: "",
    },
    unlockedFates: [],
    unlockedTreasures: [],
    breakthroughs: [],
    pills: {
      gatheringQi: 0,
      progress: 0,
      crafted: 0,
      used: 0,
    },
  },
  records: [],
};

let state = loadState();
let selectedActivity = "run";
let selectedFateFilter = "all";
let selectedPavilionLayer = "report";
let isAffairsOpen = false;
let isCharacterSetupOpen = false;
let setupCharacterGender = state.user.character.gender;
let shouldShowInitialCharacterSetup = state.records.length === 0 && !state.user.character.nickname;
let latestWeeklyReportText = "";
let toastTimer;
let ritualFeedbackTimer;
const rewardSequenceTimers = [];
const recentCollectionUnlocks = {
  treasureIds: new Set(),
  fateIds: new Set(),
};
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const elements = {
  views: document.querySelectorAll(".view"),
  navItems: document.querySelectorAll(".nav-item"),
  jumpButtons: document.querySelectorAll("[data-jump-view]"),
  closeOverlayButtons: document.querySelectorAll("[data-close-overlay]"),
  openAffairsButton: document.querySelector("#openAffairsButton"),
  closeAffairsButtons: document.querySelectorAll("[data-close-affairs]"),
  affairsPanel: document.querySelector("#affairsPanel"),
  affairsBackdrop: document.querySelector("#affairsBackdrop"),
  affairsPavilionButtons: document.querySelectorAll("[data-affairs-pavilion-layer]"),
  characterSetup: document.querySelector("#characterSetup"),
  closeSetupButtons: document.querySelectorAll("[data-close-setup]"),
  setupGenderButtons: document.querySelectorAll("[data-character-setup-gender]"),
  setupNicknameInput: document.querySelector("#setupNicknameInput"),
  confirmCharacterSetup: document.querySelector("#confirmCharacterSetup"),
  skipCharacterSetup: document.querySelector("#skipCharacterSetup"),
  activityTypeGrid: document.querySelector("#activityTypeGrid"),
  practiceForm: document.querySelector("#practiceForm"),
  ritualStage: document.querySelector(".ritual-stage"),
  ritualCore: document.querySelector(".ritual-core"),
  ritualStageLabel: document.querySelector(".ritual-stage p"),
  harvestButton: document.querySelector(".ritual-actions .primary-button"),
  durationInput: document.querySelector("#durationInput"),
  intensityInput: document.querySelector("#intensityInput"),
  noteInput: document.querySelector("#noteInput"),
  rewardHint: document.querySelector("#rewardHint"),
  rewardDialog: document.querySelector("#rewardDialog"),
  rewardBurst: document.querySelector("#rewardBurst"),
  rewardEyebrow: document.querySelector("#rewardEyebrow"),
  rewardTitle: document.querySelector("#rewardTitle"),
  rewardSummary: document.querySelector("#rewardSummary"),
  rewardGains: document.querySelector("#rewardGains"),
  rewardEvents: document.querySelector("#rewardEvents"),
  ascensionOverlay: document.querySelector("#ascensionOverlay"),
  ascensionSeal: document.querySelector("#ascensionSeal"),
  ascensionTitle: document.querySelector("#ascensionTitle"),
  ascensionSummary: document.querySelector("#ascensionSummary"),
  closeRewardDialog: document.querySelector("#closeRewardDialog"),
  continuePracticeButton: document.querySelector("#continuePracticeButton"),
  viewCollectionButton: document.querySelector("#viewCollectionButton"),
  viewRecordsButton: document.querySelector("#viewRecordsButton"),
  toast: document.querySelector("#toast"),
  taskList: document.querySelector("#taskList"),
  fateFilterList: document.querySelector("#fateFilterList"),
  fateFilterSummary: document.querySelector("#fateFilterSummary"),
  fateEmpty: document.querySelector("#fateEmpty"),
  fateGrid: document.querySelector("#fateGrid"),
  treasureGrid: document.querySelector("#treasureGrid"),
  pavilionTabs: document.querySelector("#pavilionTabs"),
  pavilionTabButtons: document.querySelectorAll("[data-pavilion-tab]"),
  pavilionPanels: document.querySelectorAll("[data-pavilion-panel]"),
  recordList: document.querySelector("#recordList"),
  emptyRecords: document.querySelector("#emptyRecords"),
  realmValue: document.querySelector("#realmValue"),
  stonesValue: document.querySelector("#stonesValue"),
  weeklyCountValue: document.querySelector("#weeklyCountValue"),
  weeklyMinutesValue: document.querySelector("#weeklyMinutesValue"),
  fateCountValue: document.querySelector("#fateCountValue"),
  realmProgressBar: document.querySelector("#realmProgressBar"),
  realmProgressText: document.querySelector("#realmProgressText"),
  characterArt: document.querySelector("#characterArt"),
  characterName: document.querySelector("#characterName"),
  characterRealmLine: document.querySelector("#characterRealmLine"),
  protagonistRealmSeal: document.querySelector("#protagonistRealmSeal"),
  characterGenderButtons: document.querySelectorAll("[data-character-gender]"),
  heroGreeting: document.querySelector("#heroGreeting"),
  heroSummary: document.querySelector("#heroSummary"),
  noviceGuide: document.querySelector("#noviceGuide"),
  noviceGuideSeal: document.querySelector("#noviceGuideSeal"),
  noviceGuideTitle: document.querySelector("#noviceGuideTitle"),
  noviceGuideSummary: document.querySelector("#noviceGuideSummary"),
  noviceGuideSteps: document.querySelector("#noviceGuideSteps"),
  noviceGuideAction: document.querySelector("#noviceGuideAction"),
  heroStreak: document.querySelector("#heroStreak"),
  techniqueValue: document.querySelector("#techniqueValue"),
  physiqueValue: document.querySelector("#physiqueValue"),
  pillCopy: document.querySelector("#pillCopy"),
  pillProgressBar: document.querySelector("#pillProgressBar"),
  techniqueList: document.querySelector("#techniqueList"),
  usePillButton: document.querySelector("#usePillButton"),
  sectRankValue: document.querySelector("#sectRankValue"),
  sectContributionValue: document.querySelector("#sectContributionValue"),
  sectProgressBar: document.querySelector("#sectProgressBar"),
  sectSummary: document.querySelector("#sectSummary"),
  sectMissionList: document.querySelector("#sectMissionList"),
  dungeonGradeValue: document.querySelector("#dungeonGradeValue"),
  dungeonNameValue: document.querySelector("#dungeonNameValue"),
  dungeonSummary: document.querySelector("#dungeonSummary"),
  dungeonProgressBar: document.querySelector("#dungeonProgressBar"),
  dungeonStageList: document.querySelector("#dungeonStageList"),
  practiceSectSummary: document.querySelector("#practiceSectSummary"),
  practiceSectProgressBar: document.querySelector("#practiceSectProgressBar"),
  practiceSectList: document.querySelector("#practiceSectList"),
  sectPanel: document.querySelector(".sect-panel"),
  dungeonPanel: document.querySelector(".dungeon-panel"),
  demonThreatValue: document.querySelector("#demonThreatValue"),
  demonNameValue: document.querySelector("#demonNameValue"),
  demonSummary: document.querySelector("#demonSummary"),
  demonProgressBar: document.querySelector("#demonProgressBar"),
  demonTrialList: document.querySelector("#demonTrialList"),
  storyTagValue: document.querySelector("#storyTagValue"),
  storyNameValue: document.querySelector("#storyNameValue"),
  storySummary: document.querySelector("#storySummary"),
  storyProgressBar: document.querySelector("#storyProgressBar"),
  storyChapterList: document.querySelector("#storyChapterList"),
  practiceDemonSummary: document.querySelector("#practiceDemonSummary"),
  practiceDemonProgressBar: document.querySelector("#practiceDemonProgressBar"),
  practiceDemonList: document.querySelector("#practiceDemonList"),
  demonPanel: document.querySelector(".demon-panel"),
  storyPanel: document.querySelector(".story-panel"),
  dashboardRealmBadgeImage: document.querySelector("#dashboardRealmBadgeImage"),
  realmPanelBadgeImage: document.querySelector("#realmPanelBadgeImage"),
  realmBadgeImage: document.querySelector("#realmBadgeImage"),
  profileRealm: document.querySelector("#profileRealm"),
  profileTitleSeal: document.querySelector("#profileTitleSeal"),
  profileTitleName: document.querySelector("#profileTitleName"),
  profileSummary: document.querySelector("#profileSummary"),
  stageTitlePanel: document.querySelector("#stageTitlePanel"),
  stageTitleCount: document.querySelector("#stageTitleCount"),
  stageTitleSeal: document.querySelector("#stageTitleSeal"),
  stageTitleName: document.querySelector("#stageTitleName"),
  stageTitleSummary: document.querySelector("#stageTitleSummary"),
  stageTitleNext: document.querySelector("#stageTitleNext"),
  stageTitleList: document.querySelector("#stageTitleList"),
  weeklyReportPanel: document.querySelector("#weeklyReportPanel"),
  weeklyReportRange: document.querySelector("#weeklyReportRange"),
  weeklyReportSeal: document.querySelector("#weeklyReportSeal"),
  weeklyReportTitle: document.querySelector("#weeklyReportTitle"),
  weeklyReportLead: document.querySelector("#weeklyReportLead"),
  weeklyReportStats: document.querySelector("#weeklyReportStats"),
  weeklyReportCopy: document.querySelector("#weeklyReportCopy"),
  copyWeeklyReportButton: document.querySelector("#copyWeeklyReportButton"),
  weeklyReportHint: document.querySelector("#weeklyReportHint"),
  nicknameInput: document.querySelector("#nicknameInput"),
  practiceReportPanel: document.querySelector("#practiceReportPanel"),
  practiceReportBadge: document.querySelector("#practiceReportBadge"),
  practiceReportState: document.querySelector("#practiceReportState"),
  practiceReportMetrics: document.querySelector("#practiceReportMetrics"),
  practiceReportSeal: document.querySelector("#practiceReportSeal"),
  practiceReportTitle: document.querySelector("#practiceReportTitle"),
  practiceReportSummary: document.querySelector("#practiceReportSummary"),
  practiceReportAction: document.querySelector("#practiceReportAction"),
  weeklyGoalInput: document.querySelector("#weeklyGoalInput"),
  dailyGoalInput: document.querySelector("#dailyGoalInput"),
  savePreferencesButton: document.querySelector("#savePreferencesButton"),
  resetDemoButton: document.querySelector("#resetDemoButton"),
  realmPanel: document.querySelector(".realm-panel"),
  questPanel: document.querySelector(".quest-panel"),
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return normalizeState(JSON.parse(raw));
    }

    const legacyRaw = localStorage.getItem(LEGACY_KEY);
    if (legacyRaw) {
      const migrated = migrateLegacyState(JSON.parse(legacyRaw));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }
  } catch {
    return structuredClone(defaultState);
  }

  return structuredClone(defaultState);
}

function normalizeState(saved) {
  return {
    user: {
      ...structuredClone(defaultState.user),
      ...(saved.user || {}),
      pills: {
        ...defaultState.user.pills,
        ...(saved.user?.pills || {}),
      },
      character: normalizeCharacter(saved.user?.character),
    },
    records: Array.isArray(saved.records) ? saved.records : [],
  };
}

function normalizeCharacter(character = {}) {
  const gender = characterProfiles[character.gender] ? character.gender : defaultState.user.character.gender;
  return {
    ...defaultState.user.character,
    ...character,
    gender,
    nickname: sanitizeNickname(character.nickname || ""),
  };
}

function migrateLegacyState(legacy) {
  const migrated = structuredClone(defaultState);
  migrated.user.cultivation = Number(legacy.user?.xp) || 0;
  migrated.user.spiritStones = Number(legacy.user?.points) || 0;
  migrated.user.weeklyGoal = Number(legacy.user?.weeklyGoal) || 3;
  migrated.user.dailyGoalMinutes = Number(legacy.user?.dailyGoalMinutes) || 20;
  migrated.records = (legacy.records || []).map((record) => ({
    id: record.id || crypto.randomUUID(),
    type: record.type || "other",
    method: getActivity(record.type || "other").method,
    duration: Number(record.duration) || 0,
    intensity: record.intensity || "normal",
    note: record.note || "由旧版运动记录迁移而来",
    createdAt: record.createdAt || new Date().toISOString(),
    dateKey: record.dateKey || todayKey(new Date(record.createdAt || Date.now())),
    reward: {
      cultivation: Number(record.reward?.xp) || 0,
      spiritStones: Number(record.reward?.points) || 0,
      physique: Math.round(Number(record.duration) || 0),
    },
  }));
  migrated.user.physique = migrated.records.reduce((sum, record) => sum + record.reward.physique, 0);
  const migratedRealm = getRealmInfo(migrated.user.cultivation);
  migrated.user.breakthroughs = realms.slice(1, migratedRealm.currentIndex + 1).map((realm) => realm.id);
  unlockProgression(migrated, false);
  return migrated;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function todayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfWeek(date = new Date()) {
  const copy = new Date(date);
  const day = copy.getDay() || 7;
  copy.setHours(0, 0, 0, 0);
  copy.setDate(copy.getDate() - day + 1);
  return copy;
}

function startOfLocalDay(date = new Date()) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function getActivity(id) {
  return activityTypes.find((item) => item.id === id) || activityTypes.at(-1);
}

function getTechnique(id) {
  return techniques.find((item) => item.id === id) || techniques[0];
}

function getCharacterProfile(gender = state.user.character.gender) {
  return characterProfiles[gender] || characterProfiles.male;
}

function sanitizeNickname(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, "")
    .slice(0, 8);
}

function getCharacterDisplayName() {
  return state.user.character.nickname || "校园修士";
}

function setAffairsOpen(open) {
  isAffairsOpen = Boolean(open);
  document.body.classList.toggle("affairs-open", isAffairsOpen);
  elements.openAffairsButton?.setAttribute("aria-expanded", String(isAffairsOpen));
  elements.affairsPanel?.setAttribute("aria-hidden", String(!isAffairsOpen));
}

function syncSetupGenderButtons() {
  elements.setupGenderButtons.forEach((button) => {
    const isActive = button.dataset.characterSetupGender === setupCharacterGender;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function setCharacterSetupOpen(open) {
  isCharacterSetupOpen = Boolean(open);
  document.body.classList.toggle("character-setup-open", isCharacterSetupOpen);
  elements.characterSetup?.setAttribute("aria-hidden", String(!isCharacterSetupOpen));
  if (isCharacterSetupOpen) {
    setupCharacterGender = state.user.character.gender;
    elements.setupNicknameInput.value = state.user.character.nickname;
    syncSetupGenderButtons();
    window.requestAnimationFrame(() => elements.setupNicknameInput?.focus());
  }
}

function completeCharacterSetup(useDefault = false) {
  const nickname = sanitizeNickname(useDefault ? "" : elements.setupNicknameInput?.value);
  state.user.character.gender = characterProfiles[setupCharacterGender] ? setupCharacterGender : defaultState.user.character.gender;
  state.user.character.nickname = nickname || "校园修士";
  shouldShowInitialCharacterSetup = false;
  saveState();
  setCharacterSetupOpen(false);
  render();
  showToast("洞府化身已定，今日可以入阵修炼。");
}

function syncInitialCharacterSetup() {
  if (shouldShowInitialCharacterSetup && document.body.dataset.activeView === "dashboard" && !isCharacterSetupOpen) {
    setCharacterSetupOpen(true);
  }
}

function openPavilionLayer(layer) {
  selectedPavilionLayer = layer || "report";
  setAffairsOpen(false);
  switchView("profile");
  window.requestAnimationFrame(() => updatePavilionLayer({ scroll: true, force: true }));
}

function getRealmInfo(cultivation = state.user.cultivation) {
  let currentIndex = 0;
  realms.forEach((realm, index) => {
    if (cultivation >= realm.threshold) {
      currentIndex = index;
    }
  });

  const current = realms[currentIndex];
  const next = realms[currentIndex + 1];
  const currentAmount = cultivation - current.threshold;
  const nextAmount = next ? next.threshold - current.threshold : current.threshold || 1;
  const progress = next ? Math.min((currentAmount / nextAmount) * 100, 100) : 100;

  return { current, next, currentIndex, currentAmount, nextAmount, progress };
}

function getStats(source = state) {
  const weekStart = startOfWeek();
  const sortedRecords = [...source.records].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const lastRecord = sortedRecords.at(-1);
  const daysSinceLastPractice =
    lastRecord === undefined
      ? null
      : Math.max(0, Math.floor((startOfLocalDay() - startOfLocalDay(new Date(lastRecord.createdAt))) / DAY_MS));
  const uniqueDays = [...new Set(source.records.map((record) => record.dateKey))].sort();
  const totalMinutes = source.records.reduce((sum, record) => sum + record.duration, 0);
  const weeklyRecords = source.records.filter((record) => new Date(record.createdAt) >= weekStart);
  const weeklyMinutes = weeklyRecords.reduce((sum, record) => sum + record.duration, 0);
  const weeklyActiveDays = new Set(weeklyRecords.map((record) => record.dateKey)).size;
  const weeklyHardCount = weeklyRecords.filter((record) => record.intensity === "hard").length;
  const todayRecords = source.records.filter((record) => record.dateKey === todayKey());
  const todayMinutes = todayRecords.reduce((sum, record) => sum + record.duration, 0);

  return {
    totalCount: source.records.length,
    totalMinutes,
    weeklyCount: weeklyRecords.length,
    weeklyMinutes,
    weeklyActiveDays,
    weeklyHardCount,
    daysSinceLastPractice,
    todayCount: todayRecords.length,
    todayMinutes,
    streak: calculateStreak(uniqueDays),
    hasHardPractice: source.records.some((record) => record.intensity === "hard"),
    breakthroughCount: source.user.breakthroughs.length,
    pillsCrafted: source.user.pills.crafted,
    treasureCount: source.user.unlockedTreasures.length,
  };
}

function calculateStreak(sortedDays) {
  if (sortedDays.length === 0) {
    return 0;
  }

  const daySet = new Set(sortedDays);
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  if (!daySet.has(todayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!daySet.has(todayKey(cursor))) {
      return 0;
    }
  }

  let streak = 0;
  while (daySet.has(todayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function buildTasks(stats) {
  const dailyGoal = state.user.dailyGoalMinutes;
  const weeklyGoal = state.user.weeklyGoal;

  return [
    {
      icon: "日",
      title: `今日入定 ${dailyGoal} 分钟`,
      detail: `${Math.min(stats.todayMinutes, dailyGoal)} / ${dailyGoal} 分钟`,
      progress: Math.min(stats.todayMinutes / dailyGoal, 1),
      complete: stats.todayMinutes >= dailyGoal,
      reward: "丹炉进度",
    },
    {
      icon: "周",
      title: `本周历练 ${weeklyGoal} 次`,
      detail: `${Math.min(stats.weeklyCount, weeklyGoal)} / ${weeklyGoal} 次`,
      progress: Math.min(stats.weeklyCount / weeklyGoal, 1),
      complete: stats.weeklyCount >= weeklyGoal,
      reward: "仙缘加深",
    },
    {
      icon: "连",
      title: "保持连续入定",
      detail: `当前连续 ${stats.streak} 天`,
      progress: Math.min(stats.streak / 3, 1),
      complete: stats.streak >= 3,
      reward: "灵石加成",
    },
  ];
}

function buildSectMissions(stats) {
  const weeklyGoal = state.user.weeklyGoal;
  const weeklyMinuteGoal = state.user.dailyGoalMinutes * Math.max(weeklyGoal, 3);
  const activeDayGoal = Math.min(Math.max(weeklyGoal, 3), 5);

  return [
    {
      icon: "令",
      title: `达成 ${weeklyGoal} 次宗门历练`,
      detail: `${Math.min(stats.weeklyCount, weeklyGoal)} / ${weeklyGoal} 次`,
      progress: Math.min(stats.weeklyCount / weeklyGoal, 1),
      complete: stats.weeklyCount >= weeklyGoal,
      contribution: 40,
    },
    {
      icon: "时",
      title: `累计修炼 ${weeklyMinuteGoal} 分钟`,
      detail: `${Math.min(stats.weeklyMinutes, weeklyMinuteGoal)} / ${weeklyMinuteGoal} 分钟`,
      progress: Math.min(stats.weeklyMinutes / weeklyMinuteGoal, 1),
      complete: stats.weeklyMinutes >= weeklyMinuteGoal,
      contribution: 35,
    },
    {
      icon: "体",
      title: "进行一次淬体入定",
      detail: `${Math.min(stats.weeklyHardCount, 1)} / 1 次`,
      progress: Math.min(stats.weeklyHardCount, 1),
      complete: stats.weeklyHardCount >= 1,
      contribution: 25,
    },
    {
      icon: "勤",
      title: `本周活跃 ${activeDayGoal} 天`,
      detail: `${Math.min(stats.weeklyActiveDays, activeDayGoal)} / ${activeDayGoal} 天`,
      progress: Math.min(stats.weeklyActiveDays / activeDayGoal, 1),
      complete: stats.weeklyActiveDays >= activeDayGoal,
      contribution: 45,
    },
  ];
}

function getSectProgress(stats) {
  const missions = buildSectMissions(stats);
  const contribution = missions.reduce((sum, mission) => sum + (mission.complete ? mission.contribution : 0), 0);
  let rankIndex = 0;
  sectRanks.forEach((rank, index) => {
    if (contribution >= rank.min) {
      rankIndex = index;
    }
  });

  const currentRank = sectRanks[rankIndex];
  const nextRank = sectRanks[rankIndex + 1];
  const maxContribution = missions.reduce((sum, mission) => sum + mission.contribution, 0);
  const rankProgress = nextRank
    ? Math.min(((contribution - currentRank.min) / (nextRank.min - currentRank.min)) * 100, 100)
    : 100;

  return {
    missions,
    contribution,
    completed: missions.filter((mission) => mission.complete).length,
    total: missions.length,
    currentRank,
    nextRank,
    maxContribution,
    rankProgress,
  };
}

function getWeeklyDungeon(sectProgress) {
  const completion = Math.round((sectProgress.completed / sectProgress.total) * 100);
  const gradeTable = [
    { min: 0, label: "未入阵", name: "云阶试炼", summary: "本周副本尚未推进，完成任意委托即可开启清剿。" },
    { min: 1, label: "初入阵", name: "云阶试炼·初入", summary: "试炼阵已开启，继续完成委托可稳住清剿节奏。" },
    { min: 2, label: "小成", name: "云阶试炼·小成", summary: "本周副本已过半，保持节奏即可冲击更高评价。" },
    { min: 3, label: "大成", name: "云阶试炼·大成", summary: "清剿进展顺利，最后一项委托将决定本周圆满。" },
    { min: 4, label: "圆满", name: "云阶试炼·圆满", summary: "本周副本已圆满清剿，可以把这套节奏留到下周继续复用。" },
  ];
  const grade = gradeTable.reduce((current, item) => (sectProgress.completed >= item.min ? item : current), gradeTable[0]);
  const stageNames = ["山门集结", "灵脉巡行", "淬体关口", "云阶登顶"];
  const stages = sectProgress.missions.map((mission, index) => ({
    title: stageNames[index],
    detail: mission.complete ? "已清剿" : mission.detail,
    complete: mission.complete,
    icon: mission.icon,
  }));

  return {
    completion,
    grade,
    stages,
  };
}

function getMindDemonProgress(stats) {
  const dailyGoal = state.user.dailyGoalMinutes;
  const remainingMinutes = Math.max(dailyGoal - stats.todayMinutes, 0);
  const trials = [
    {
      icon: "起",
      title: "破除拖延",
      detail: stats.todayCount > 0 ? "今日已入阵" : "进行任意一次入定",
      progress: stats.todayCount > 0 ? 1 : 0,
      complete: stats.todayCount > 0,
    },
    {
      icon: "定",
      title: `定心 ${dailyGoal} 分钟`,
      detail: `${Math.min(stats.todayMinutes, dailyGoal)} / ${dailyGoal} 分钟`,
      progress: Math.min(stats.todayMinutes / dailyGoal, 1),
      complete: stats.todayMinutes >= dailyGoal,
    },
    {
      icon: "守",
      title: "守住连续道心",
      detail: stats.streak > 0 ? `当前连续 ${stats.streak} 天` : "今日完成一次修炼即可重启连续",
      progress: Math.min(stats.streak / 2, 1),
      complete: stats.streak >= 2 || stats.todayCount > 0,
    },
  ];
  const completed = trials.filter((trial) => trial.complete).length;
  let name = "拖延心魔";
  let threat = "中威胁";
  let summary = `还差 ${remainingMinutes} 分钟完成今日定心，先从一次短修炼开始。`;

  if (stats.todayMinutes >= dailyGoal) {
    name = "心魔已镇";
    threat = "已压制";
    summary = "今日修炼目标已完成，道心稳定，适合收功复盘。";
  } else if (stats.todayCount > 0) {
    name = "浮念未清";
    threat = "低威胁";
    summary = `今日已经起势，再补 ${remainingMinutes} 分钟即可彻底压制。`;
  } else if (stats.daysSinceLastPractice === null) {
    name = "初见心魔";
    threat = "低威胁";
      summary = "第一次入定收功，给自己的洞府点上第一缕灵气。";
  } else if (stats.daysSinceLastPractice >= 2) {
    name = "惰性心魔";
    threat = "高威胁";
    summary = `已间隔 ${stats.daysSinceLastPractice} 天未修炼，建议先做 5 分钟调息重启节奏。`;
  }

  return {
    name,
    threat,
    summary,
    trials,
    completed,
    total: trials.length,
    suppression: Math.round((completed / trials.length) * 100),
  };
}

function getStoryArc(stats, realmInfo, weeklyDungeon, mindDemon) {
  const chapters = [
    {
      tag: "序章",
      title: "洞府初启",
      detail: "第一次入定收功，洞府灵气开始流转。",
      progress: Math.min(stats.totalCount / 1, 1),
      complete: stats.totalCount >= 1,
    },
    {
      tag: "第一章",
      title: "练气成脉",
      detail: "稳住日常修炼，让周天从偶然变成习惯。",
      progress: Math.min(state.user.cultivation / realms[2].threshold, 1),
      complete: realmInfo.currentIndex >= 2,
    },
    {
      tag: "第二章",
      title: "筑基立心",
      detail: "以体魄作炉，以连续节奏夯实根基。",
      progress: Math.min(state.user.cultivation / realms[3].threshold, 1),
      complete: realmInfo.currentIndex >= 3,
    },
    {
      tag: "第三章",
      title: "金丹问道",
      detail: "清剿云阶试炼，向更高境界发起冲击。",
      progress: Math.min(state.user.cultivation / realms.at(-1).threshold, 1),
      complete: realmInfo.current.id === "golden-core",
    },
  ];
  const currentIndex = Math.max(0, chapters.findIndex((chapter) => !chapter.complete));
  const current = chapters[currentIndex] || chapters.at(-1);
  const sideNotes = [];

  if (weeklyDungeon.completion >= 100) {
    sideNotes.push("本周云阶试炼圆满，宗门已记下一笔漂亮战绩。");
  } else if (weeklyDungeon.completion >= 50) {
    sideNotes.push("云阶试炼已经过半，适合趁势补完本周委托。");
  } else {
    sideNotes.push("本周副本仍在开局阶段，先完成一次修炼就能推进剧情。");
  }

  if (mindDemon.suppression >= 100) {
    sideNotes.push("今日心魔已压制，道心稳定。");
  } else {
    sideNotes.push("今日心魔尚未完全退散，短修炼也能让剧情继续向前。");
  }

  return {
    current,
    chapters,
    summary: `${current.detail}${sideNotes.join("")}`,
  };
}

function getPracticeReport(stats, realmInfo, sectProgress, weeklyDungeon, mindDemon) {
  const favorite = getFavoritePractice();
  const strongestTreasure = getStrongestTreasure();
  let highlight = {
    badge: "稳",
    state: "道心稳定",
    seal: "进",
    variant: "is-steady",
    title: "节奏已经立住",
    summary: `当前境界为 ${realmInfo.current.name}，本周可继续把修炼节奏稳定下来。`,
    action: realmInfo.next ? `继续积累修为，距 ${realmInfo.next.name} 还需 ${realmInfo.next.threshold - state.user.cultivation} 修为。` : "当前版本境界已圆满，保持每周修炼节奏。",
  };

  if (stats.totalCount === 0) {
    highlight = {
      badge: "启",
      state: "待开篇",
      seal: "策",
      variant: "is-new",
      title: "洞府尚待点火",
      summary: "第一次收功后，报告会自动生成偏好、周常、法宝和心魔状态。",
      action: "先进行一次 5 分钟调息，建立第一条修炼卷宗。",
    };
  } else if (stats.todayCount === 0 && stats.daysSinceLastPractice >= 2) {
    highlight = {
      badge: "重",
      state: "需重启",
      seal: "醒",
      variant: "is-alert",
      title: "道心需要重新起势",
      summary: `距离上次修炼已 ${stats.daysSinceLastPractice} 天，不必追求强度，先把连续感找回来。`,
      action: "今天做一次低强度调息或拉伸，重启连续修炼。",
    };
  } else if (stats.todayCount === 0) {
    highlight = {
      badge: "今",
      state: "待入定",
      seal: "息",
      variant: "is-focus",
      title: "今日还差一缕灵气",
      summary: `本周已入定 ${stats.weeklyCount} 次，今天收功一次即可推进心魔压制和周常记录。`,
      action: `运转 ${state.user.dailyGoalMinutes} 分钟周天，点亮今日心魔试炼。`,
    };
  } else if (sectProgress.completed < sectProgress.total) {
    highlight = {
      badge: "周",
      state: "可推进",
      seal: "令",
      variant: "is-advance",
      title: "宗门委托还有推进空间",
      summary: `本周委托完成 ${sectProgress.completed} / ${sectProgress.total} 项，云阶试炼清剿率 ${weeklyDungeon.completion}%。`,
      action: "优先补齐未完成的周常委托，拿到更高宗门段位。",
    };
  } else if (mindDemon.suppression < 100) {
    highlight = {
      badge: "定",
      state: "再定心",
      seal: "心",
      variant: "is-focus",
      title: "心魔尚有余波",
      summary: `${mindDemon.name} 仍未完全压制，追加一次短修炼会让今日节奏更完整。`,
      action: "补一次短时调息，把今日心魔压制率推满。",
    };
  }

  return {
    highlight,
    metrics: [
      {
        label: "累计修炼",
        value: `${stats.totalCount} 次`,
        detail: `${stats.totalMinutes} 分钟`,
      },
      {
        label: "本周历练",
        value: `${stats.weeklyCount} / ${state.user.weeklyGoal} 次`,
        detail: `${stats.weeklyMinutes} 分钟 · 连续 ${stats.streak} 天`,
      },
      {
        label: "偏好方式",
        value: favorite.value,
        detail: favorite.detail,
      },
      {
        label: "最强法宝",
        value: strongestTreasure.value,
        detail: strongestTreasure.detail,
      },
    ],
  };
}

function getStageTitleState(stats, realmInfo, sectProgress, weeklyDungeon) {
  const unlockedFates = new Set(state.user.unlockedFates);
  const items = [
    {
      id: "first-cave",
      name: "洞府初启者",
      seal: "启",
      description: "第一次入定收功，洞府灵气开始流转。",
      unlocked: stats.totalCount >= 1,
      progress: Math.min(stats.totalCount / 1, 1),
      progressLabel: `${Math.min(stats.totalCount, 1)} / 1 次修炼`,
    },
    {
      id: "three-practices",
      name: "三炼入门生",
      seal: "三",
      description: "累计完成 3 次修炼，入门节奏初步成形。",
      unlocked: stats.totalCount >= 3,
      progress: Math.min(stats.totalCount / 3, 1),
      progressLabel: `${Math.min(stats.totalCount, 3)} / 3 次修炼`,
    },
    {
      id: "minutes-120",
      name: "百二周天客",
      seal: "时",
      description: "累计修炼 120 分钟，周天气脉渐稳。",
      unlocked: stats.totalMinutes >= 120,
      progress: Math.min(stats.totalMinutes / 120, 1),
      progressLabel: `${Math.min(stats.totalMinutes, 120)} / 120 分钟`,
    },
    {
      id: "streak-three",
      name: "连续入定者",
      seal: "连",
      description: "连续修炼 3 天，日常道心开始稳定。",
      unlocked: unlockedFates.has("streak-three") || stats.streak >= 3,
      progress: Math.min(stats.streak / 3, 1),
      progressLabel: `${Math.min(stats.streak, 3)} / 3 天连续`,
    },
    {
      id: "first-breakthrough",
      name: "破境有声者",
      seal: "破",
      description: "第一次冲破境界，修炼进入新阶段。",
      unlocked: stats.breakthroughCount >= 1,
      progress: Math.min(stats.breakthroughCount / 1, 1),
      progressLabel: `${Math.min(stats.breakthroughCount, 1)} / 1 次突破`,
    },
    {
      id: "sect-runner",
      name: "宗门执令者",
      seal: "令",
      description: "本周完成至少 2 项宗门委托，能独当一面。",
      unlocked: sectProgress.completed >= 2,
      progress: Math.min(sectProgress.completed / 2, 1),
      progressLabel: `${Math.min(sectProgress.completed, 2)} / 2 项委托`,
    },
    {
      id: "dungeon-clear",
      name: "云阶清剿者",
      seal: "云",
      description: "本周云阶试炼圆满清剿，周常节奏漂亮收束。",
      unlocked: weeklyDungeon.completion >= 100,
      progress: Math.min(weeklyDungeon.completion / 100, 1),
      progressLabel: `${weeklyDungeon.completion} / 100% 清剿率`,
    },
    {
      id: "foundation",
      name: "筑基行者",
      seal: "筑",
      description: "达到筑基初期，体魄与修为都立住了根基。",
      unlocked: realmInfo.currentIndex >= 3,
      progress: Math.min(realmInfo.currentIndex / 3, 1),
      progressLabel: `${Math.min(realmInfo.currentIndex, 3)} / 3 段境界`,
    },
    {
      id: "golden-core",
      name: "金丹问道者",
      seal: "丹",
      description: "达到金丹初成，当前版本主线境界圆满。",
      unlocked: realmInfo.current.id === "golden-core",
      progress: Math.min(state.user.cultivation / realms.at(-1).threshold, 1),
      progressLabel: `${Math.min(state.user.cultivation, realms.at(-1).threshold)} / ${realms.at(-1).threshold} 修为`,
    },
  ];
  const unlocked = items.filter((item) => item.unlocked);
  const current =
    unlocked.at(-1) || {
      id: "candidate",
      name: "候选修士",
      seal: "候",
      description: "洞府已备好，第一次收功即可获得正式称号。",
      unlocked: true,
      progress: 1,
      progressLabel: "等待首次修炼",
    };
  const next = items.find((item) => !item.unlocked);

  return {
    current,
    next,
    items,
    unlockedCount: unlocked.length,
    total: items.length,
  };
}

function getWeeklyReport(stats, realmInfo, sectProgress, weeklyDungeon, mindDemon, stageTitleState) {
  const favorite = getFavoritePractice();
  const strongestTreasure = getStrongestTreasure();
  const weekStart = startOfWeek();
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const remainingWeeklyCount = Math.max(state.user.weeklyGoal - stats.weeklyCount, 0);
  const title =
    stats.weeklyCount === 0
      ? "本周洞府待启"
      : weeklyDungeon.completion >= 100
        ? "本周云阶圆满"
        : stats.weeklyCount >= state.user.weeklyGoal
          ? "本周历练达标"
          : "本周修炼推进中";
  const seal = stats.weeklyCount === 0 ? "启" : weeklyDungeon.completion >= 100 ? "满" : "报";
  const lead =
    stats.weeklyCount === 0
      ? "本周还没有收功记录，先用一次短入定点亮周报。"
      : `本周入定 ${stats.weeklyCount} 次，累计 ${stats.weeklyMinutes} 分钟，当前称号为「${stageTitleState.current.name}」。`;
  const nextStep =
    stats.weeklyCount === 0
      ? "先进行一次 5 分钟调息，给本周周报开篇。"
      : remainingWeeklyCount > 0
        ? `再完成 ${remainingWeeklyCount} 次修炼，即可达成本周历练目标。`
        : weeklyDungeon.completion < 100
          ? "优先补齐未完成的宗门委托，冲击云阶试炼圆满。"
          : "本周节奏已经漂亮收束，下周继续复用这套修炼节奏。";
  const copyText = [
    "【灵动修炼录·本周修炼周报】",
    `周期：${formatShortDate(weekStart)} - ${formatShortDate(weekEnd)}`,
    `境界：${realmInfo.current.name}，当前称号：${stageTitleState.current.name}`,
    `本周入定：${stats.weeklyCount} 次，累计 ${stats.weeklyMinutes} 分钟，连续 ${stats.streak} 天`,
    `偏好方式：${favorite.value}（${favorite.detail}）`,
    `宗门进度：${sectProgress.completed}/${sectProgress.total} 项委托，${sectProgress.currentRank.name}，${sectProgress.contribution} 贡献`,
    `云阶试炼：${weeklyDungeon.grade.label}，清剿率 ${weeklyDungeon.completion}%`,
    `心魔状态：${mindDemon.name}，压制率 ${mindDemon.suppression}%`,
    `法宝共鸣：${strongestTreasure.value}（${strongestTreasure.detail}）`,
    `下一步：${nextStep}`,
  ].join("\n");

  return {
    title,
    seal,
    lead,
    range: `${formatShortDate(weekStart)} - ${formatShortDate(weekEnd)}`,
    copyText,
    stats: [
      { label: "本周入定", value: `${stats.weeklyCount} 次`, detail: `${stats.weeklyMinutes} 分钟` },
      { label: "宗门委托", value: `${sectProgress.completed} / ${sectProgress.total}`, detail: `${sectProgress.currentRank.name} · ${sectProgress.contribution} 贡献` },
      { label: "云阶试炼", value: weeklyDungeon.grade.label, detail: `${weeklyDungeon.completion}% 清剿率` },
      { label: "心魔压制", value: `${mindDemon.suppression}%`, detail: mindDemon.threat },
    ],
  };
}

function getFavoritePractice() {
  if (state.records.length === 0) {
    return {
      value: "待开脉",
      detail: "收功后生成偏好",
    };
  }

  const byType = new Map();
  state.records.forEach((record) => {
    const activity = getActivity(record.type);
    const current = byType.get(activity.id) || {
      activity,
      count: 0,
      minutes: 0,
    };
    current.count += 1;
    current.minutes += record.duration;
    byType.set(activity.id, current);
  });

  const favorite = [...byType.values()].sort((a, b) => b.minutes - a.minutes || b.count - a.count)[0];
  return {
    value: favorite.activity.method,
    detail: `${favorite.activity.label} · ${favorite.count} 次 · ${favorite.minutes} 分钟`,
  };
}

function getStrongestTreasure() {
  const unlocked = treasures
    .filter((treasure) => state.user.unlockedTreasures.includes(treasure.id))
    .map((treasure) => ({
      treasure,
      growth: getTreasureGrowth(treasure),
    }))
    .sort((a, b) => b.growth.level - a.growth.level || b.growth.amount - a.growth.amount);

  if (unlocked.length === 0) {
    return {
      value: "待认主",
      detail: "解锁法宝后显示共鸣",
    };
  }

  const strongest = unlocked[0];
  return {
    value: strongest.treasure.name,
    detail: `${strongest.growth.stage} · ${strongest.growth.amount} 分钟`,
  };
}

function calculateReward(duration, intensity) {
  const rule = intensityRules[intensity];
  const statsBefore = getStats();
  const baseCultivation = Math.round(duration * rule.multiplier);
  const spiritStones = Math.round(duration * rule.stoneRate);
  const physique = Math.round(duration * rule.physiqueRate);
  const dailyBonus = statsBefore.todayCount === 0 && duration >= state.user.dailyGoalMinutes ? 20 : 0;
  const streakBonus = statsBefore.streak >= 1 && statsBefore.todayCount === 0 ? 10 : 0;

  return {
    cultivation: baseCultivation + dailyBonus,
    spiritStones: spiritStones + streakBonus,
    physique,
    lines: [
      ["基础修为", `+${baseCultivation}`],
      ["灵石收入", `+${spiritStones}`],
      ["体魄成长", `+${physique}`],
      ...(dailyBonus ? [["今日目标加成", `+${dailyBonus} 修为`]] : []),
      ...(streakBonus ? [["连续入定加成", `+${streakBonus} 灵石`]] : []),
    ],
  };
}

function unlockProgression(source = state, allowBreakthrough = true, previousRealmIndex = 0) {
  const stats = getStats(source);
  const newlyUnlockedFates = [];
  const newlyUnlockedTreasures = [];
  const newBreakthroughs = [];
  const realmInfo = getRealmInfo(source.user.cultivation);

  if (allowBreakthrough && realmInfo.currentIndex > previousRealmIndex) {
    realms.slice(previousRealmIndex + 1, realmInfo.currentIndex + 1).forEach((realm) => {
      if (!source.user.breakthroughs.includes(realm.id)) {
        source.user.breakthroughs.push(realm.id);
        newBreakthroughs.push(realm);
      }
    });
  }

  const refreshedStats = getStats(source);

  treasures.forEach((treasure) => {
    if (!source.user.unlockedTreasures.includes(treasure.id) && treasure.test(refreshedStats)) {
      source.user.unlockedTreasures.push(treasure.id);
      newlyUnlockedTreasures.push(treasure);
    }
  });

  const finalStats = getStats(source);
  fates.forEach((fate) => {
    if (!source.user.unlockedFates.includes(fate.id) && fate.test(finalStats)) {
      source.user.unlockedFates.push(fate.id);
      newlyUnlockedFates.push(fate);
    }
  });

  return { newlyUnlockedFates, newlyUnlockedTreasures, newBreakthroughs };
}

function render() {
  const stats = getStats();
  const realmInfo = getRealmInfo();
  const technique = getTechnique(state.user.activeTechnique);
  const sectProgress = getSectProgress(stats);
  const weeklyDungeon = getWeeklyDungeon(sectProgress);
  const mindDemon = getMindDemonProgress(stats);
  const storyArc = getStoryArc(stats, realmInfo, weeklyDungeon, mindDemon);
  const practiceReport = getPracticeReport(stats, realmInfo, sectProgress, weeklyDungeon, mindDemon);
  const stageTitleState = getStageTitleState(stats, realmInfo, sectProgress, weeklyDungeon);
  const weeklyReport = getWeeklyReport(stats, realmInfo, sectProgress, weeklyDungeon, mindDemon, stageTitleState);
  const character = getCharacterProfile();
  const characterName = getCharacterDisplayName();

  elements.realmValue.textContent = realmInfo.current.name;
  elements.stonesValue.textContent = state.user.spiritStones.toString();
  elements.weeklyCountValue.textContent = `${stats.weeklyCount} 次`;
  elements.weeklyMinutesValue.textContent = `累计 ${stats.weeklyMinutes} 分钟`;
  elements.fateCountValue.textContent = `${state.user.unlockedFates.length} / ${fates.length}`;
  elements.realmProgressBar.style.width = `${realmInfo.progress}%`;
  elements.realmProgressText.textContent = realmInfo.next
    ? `${realmInfo.currentAmount} / ${realmInfo.nextAmount} 修为，距 ${realmInfo.next.name} 还需 ${realmInfo.next.threshold - state.user.cultivation}`
    : `已达当前版本最高境界，共 ${state.user.cultivation} 修为`;
  elements.heroStreak.textContent = stats.streak.toString();
  elements.heroGreeting.textContent =
    stats.totalCount === 0 ? "第一缕灵气，等你入阵" : stats.todayCount > 0 ? "今日灵气已入周天" : "准备开始今日修炼";
  elements.heroSummary.textContent =
    stats.totalCount === 0
      ? `${characterName} 完成第一次收功后，修为、仙缘和卷宗会一起亮起来。`
      : stats.todayCount > 0
        ? `${characterName} 今日已入定 ${stats.todayMinutes} 分钟，继续运功可累积修为与灵石。`
        : `${characterName} 入定一次，即可引动修为、灵石与体魄成长。`;
  elements.characterArt.src = `./assets/images/${character.image}`;
  elements.characterArt.alt = `${character.label}主角立绘`;
  elements.characterName.textContent = characterName;
  elements.characterRealmLine.textContent = `${realmInfo.current.name} · ${character.label}`;
  elements.protagonistRealmSeal.textContent = character.seal;
  elements.characterGenderButtons.forEach((button) => {
    const isActive = button.dataset.characterGender === character.id;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  elements.techniqueValue.textContent = technique.name;
  elements.physiqueValue.textContent = `体魄 ${state.user.physique}`;
  elements.pillCopy.textContent = `聚气丹 ${state.user.pills.gatheringQi} 枚，丹炉进度 ${state.user.pills.progress} / 3。`;
  elements.pillProgressBar.style.width = `${Math.min((state.user.pills.progress / 3) * 100, 100)}%`;
  elements.usePillButton.disabled = state.user.pills.gatheringQi <= 0;
  elements.dashboardRealmBadgeImage.src = `./assets/images/${realmInfo.current.badge}`;
  elements.realmPanelBadgeImage.src = `./assets/images/${realmInfo.current.badge}`;
  elements.realmBadgeImage.src = `./assets/images/${realmInfo.current.badge}`;
  elements.profileRealm.textContent = `${realmInfo.current.name} · ${state.user.spiritualRoot}`;
  elements.profileTitleSeal.textContent = stageTitleState.current.seal;
  elements.profileTitleName.textContent = stageTitleState.current.name;
  elements.profileSummary.textContent = `${characterName} 累计修炼 ${stats.totalCount} 次，共 ${stats.totalMinutes} 分钟，体魄 ${state.user.physique}，连续 ${stats.streak} 天。`;
  elements.nicknameInput.value = state.user.character.nickname;
  elements.weeklyGoalInput.value = state.user.weeklyGoal;
  elements.dailyGoalInput.value = state.user.dailyGoalMinutes;
  elements.sectRankValue.textContent = sectProgress.currentRank.name;
  elements.sectContributionValue.textContent = `${sectProgress.contribution} 贡献`;
  elements.sectProgressBar.style.width = `${sectProgress.rankProgress}%`;
  elements.sectSummary.textContent = sectProgress.nextRank
    ? `已完成 ${sectProgress.completed} / ${sectProgress.total} 项委托，距 ${sectProgress.nextRank.name} 还需 ${sectProgress.nextRank.min - sectProgress.contribution} 贡献。`
    : `已完成 ${sectProgress.completed} / ${sectProgress.total} 项委托，本周宗门贡献已达最高段位。`;
  elements.dungeonGradeValue.textContent = weeklyDungeon.grade.label;
  elements.dungeonNameValue.textContent = weeklyDungeon.grade.name;
  elements.dungeonSummary.textContent = `${weeklyDungeon.grade.summary} 当前清剿率 ${weeklyDungeon.completion}%。`;
  elements.dungeonProgressBar.style.width = `${weeklyDungeon.completion}%`;
  elements.practiceSectSummary.textContent = `本周宗门贡献 ${sectProgress.contribution} / ${sectProgress.maxContribution}，当前为 ${sectProgress.currentRank.name}。`;
  elements.practiceSectProgressBar.style.width = `${(sectProgress.completed / sectProgress.total) * 100}%`;
  elements.demonThreatValue.textContent = mindDemon.threat;
  elements.demonNameValue.textContent = mindDemon.name;
  elements.demonSummary.textContent = mindDemon.summary;
  elements.demonProgressBar.style.width = `${mindDemon.suppression}%`;
  elements.storyTagValue.textContent = storyArc.current.tag;
  elements.storyNameValue.textContent = storyArc.current.title;
  elements.storySummary.textContent = storyArc.summary;
  elements.storyProgressBar.style.width = `${storyArc.current.progress * 100}%`;
  elements.practiceDemonSummary.textContent = `${mindDemon.name}：${mindDemon.summary}`;
  elements.practiceDemonProgressBar.style.width = `${mindDemon.suppression}%`;

  renderTasks(stats);
  renderSectMissions(sectProgress);
  renderWeeklyDungeon(weeklyDungeon);
  renderMindDemon(mindDemon);
  renderStoryArc(storyArc);
  renderPracticeReport(practiceReport);
  renderStageTitles(stageTitleState);
  renderWeeklyReport(weeklyReport);
  renderNoviceGuide(stats);
  renderTechniques();
  renderTreasures();
  renderFates();
  renderRecords();
  updatePavilionLayer();
  updateRewardHint();
  syncInitialCharacterSetup();
}

function renderWeeklyReport(weeklyReport) {
  latestWeeklyReportText = weeklyReport.copyText;
  elements.weeklyReportRange.textContent = weeklyReport.range;
  elements.weeklyReportSeal.textContent = weeklyReport.seal;
  elements.weeklyReportTitle.textContent = weeklyReport.title;
  elements.weeklyReportLead.textContent = weeklyReport.lead;
  elements.weeklyReportCopy.textContent = weeklyReport.copyText;
  elements.weeklyReportStats.innerHTML = weeklyReport.stats
    .map(
      (item) => `
        <div class="weekly-report-stat">
          <span>${item.label}</span>
          <strong>${item.value}</strong>
          <small>${item.detail}</small>
        </div>
      `,
    )
    .join("");
}

function renderStageTitles(stageTitleState) {
  const { current, next, items, unlockedCount, total } = stageTitleState;
  elements.stageTitlePanel.className = `panel hud-panel title-panel title-${current.id}`;
  elements.stageTitleCount.textContent = `${unlockedCount} / ${total}`;
  elements.stageTitleSeal.textContent = current.seal;
  elements.stageTitleName.textContent = current.name;
  elements.stageTitleSummary.textContent = current.description;
  elements.stageTitleNext.textContent = next ? `${next.name}：${next.progressLabel}` : "当前版本称号已全部达成";
  elements.stageTitleList.innerHTML = items
    .map(
      (item) => `
        <article class="title-card ${item.unlocked ? "is-unlocked" : ""} ${item.id === current.id ? "is-current" : ""}">
          <span aria-hidden="true">${item.unlocked ? "✓" : item.seal}</span>
          <div>
            <strong>${item.name}</strong>
            <small>${item.unlocked ? item.description : item.progressLabel}</small>
            <div class="progress-track" aria-hidden="true"><span style="width: ${item.progress * 100}%"></span></div>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderPracticeReport(report) {
  const { highlight, metrics } = report;
  elements.practiceReportPanel.className = `panel hud-panel report-panel ${highlight.variant}`;
  elements.practiceReportBadge.textContent = highlight.badge;
  elements.practiceReportState.textContent = highlight.state;
  elements.practiceReportSeal.textContent = highlight.seal;
  elements.practiceReportTitle.textContent = highlight.title;
  elements.practiceReportSummary.textContent = highlight.summary;
  elements.practiceReportAction.textContent = highlight.action;
  elements.practiceReportMetrics.innerHTML = metrics
    .map(
      (metric) => `
        <div class="report-metric">
          <span>${metric.label}</span>
          <strong>${metric.value}</strong>
          <small>${metric.detail}</small>
        </div>
      `,
    )
    .join("");
}

function renderTasks(stats) {
  elements.taskList.innerHTML = buildTasks(stats)
    .map(
      (task) => `
        <article class="task-item">
          <div class="task-icon" aria-hidden="true">${task.icon}</div>
          <div class="task-copy">
            <strong>${task.title}</strong>
            <small>${task.complete ? "已入册" : task.detail}</small>
            <div class="progress-track" aria-hidden="true"><span style="width: ${task.progress * 100}%"></span></div>
          </div>
          <div class="task-reward">${task.reward}</div>
        </article>
      `,
    )
    .join("");
}

function getNoviceStepStatus(index, stats) {
  const hasFirstCollection = state.user.unlockedFates.length > 0 || state.user.unlockedTreasures.length > 0;
  const hasTreasure = state.user.unlockedTreasures.length > 0;
  const checkpoints = [stats.totalCount > 0, stats.totalCount > 0, hasFirstCollection, hasTreasure];
  if (checkpoints[index]) {
    return "complete";
  }
  const firstIncomplete = checkpoints.findIndex((item) => !item);
  return firstIncomplete === index ? "active" : "pending";
}

function getNoviceGuide(stats) {
  const remainingToTreasure = Math.max(3 - stats.totalCount, 0);

  if (stats.totalCount === 0) {
    return {
      state: "first",
      seal: "启",
      title: "先入阵，完成第一次收功",
      summary: `建议先做 ${state.user.dailyGoalMinutes} 分钟凝气。收功后会立刻结算修为，并点亮第一枚仙缘。`,
      action: "开始第一次入阵",
      view: "checkin",
      layer: "",
    };
  }

  if (recentCollectionUnlocks.fateIds.size > 0) {
    return {
      state: "collection",
      seal: "缘",
      title: "第一份仙缘已显现",
      summary: "刚刚解锁的仙缘已经收进命格阁，进去看一眼，会更有“这次没白练”的感觉。",
      action: "查看新仙缘",
      view: "profile",
      layer: "fate",
    };
  }

  if (recentCollectionUnlocks.treasureIds.size > 0) {
    return {
      state: "collection",
      seal: "宝",
      title: "新法宝已经入阁",
      summary: "法宝卡已点亮，查看共鸣阶段和下一阶目标，把下一次运动变成养成目标。",
      action: "查看新法宝",
      view: "profile",
      layer: "treasure",
    };
  }

  if (state.user.unlockedTreasures.length === 0) {
    return {
      state: "treasure",
      seal: "宝",
      title: remainingToTreasure > 0 ? `再修炼 ${remainingToTreasure} 次，唤醒第一件法宝` : "继续收功，法宝即将认主",
      summary: "累计修炼 3 次后，疾风靴会认主。先把短修炼做顺，收藏感会很快起来。",
      action: "继续入阵修炼",
      view: "checkin",
      layer: "",
    };
  }

  if (stats.todayCount === 0) {
    return {
      state: "daily",
      seal: "今",
      title: "今日还差一次入阵",
      summary: "完成一次短修炼即可稳住连续节奏，今日任务、心魔和宗门委托都会同步推进。",
      action: "开启今日修炼",
      view: "checkin",
      layer: "",
    };
  }

  if (stats.weeklyCount < state.user.weeklyGoal) {
    return {
      state: "weekly",
      seal: "周",
      title: "本周委托还能推进",
      summary: `本周已修炼 ${stats.weeklyCount} / ${state.user.weeklyGoal} 次，再补一次就更接近宗门委托奖励。`,
      action: "查看周报与委托",
      view: "profile",
      layer: "weekly",
    };
  }

  return {
    state: "archive",
    seal: "藏",
    title: "本周节奏已成，整理命格阁",
    summary: "可以回看周报、法宝共鸣和仙缘进度，把今天的成长收进自己的修炼藏阁。",
    action: "整理命格阁",
    view: "profile",
    layer: "report",
  };
}

function renderNoviceGuide(stats) {
  const guide = getNoviceGuide(stats);
  const labels = ["入阵", "收功", "入阁", "法宝"];

  elements.noviceGuide.className = `novice-guide is-${guide.state}`;
  elements.noviceGuideSeal.textContent = guide.seal;
  elements.noviceGuideTitle.textContent = guide.title;
  elements.noviceGuideSummary.textContent = guide.summary;
  elements.noviceGuideAction.textContent = guide.action;
  elements.noviceGuideAction.dataset.guideView = guide.view;
  elements.noviceGuideAction.dataset.pavilionLayer = guide.layer || "";
  elements.noviceGuideSteps.innerHTML = labels
    .map((label, index) => {
      const status = getNoviceStepStatus(index, stats);
      const marker = status === "complete" ? "✓" : index + 1;
      return `<li class="is-${status}"><span>${marker}</span><strong>${label}</strong></li>`;
    })
    .join("");
}

function renderSectMissions(sectProgress) {
  elements.sectMissionList.innerHTML = sectProgress.missions
    .map(
      (mission) => `
        <article class="sect-mission ${mission.complete ? "is-complete" : ""}">
          <div class="task-icon" aria-hidden="true">${mission.icon}</div>
          <div>
            <strong>${mission.title}</strong>
            <small>${mission.complete ? "已领功" : mission.detail}</small>
            <div class="progress-track" aria-hidden="true"><span style="width: ${mission.progress * 100}%"></span></div>
          </div>
          <span class="mission-contribution">+${mission.contribution}</span>
        </article>
      `,
    )
    .join("");

  elements.practiceSectList.innerHTML = sectProgress.missions
    .map(
      (mission) => `
        <div class="sect-mini-item ${mission.complete ? "is-complete" : ""}">
          <span>${mission.icon}</span>
          <strong>${mission.title}</strong>
          <small>${mission.complete ? "领功" : mission.detail}</small>
        </div>
      `,
    )
    .join("");
}

function renderWeeklyDungeon(weeklyDungeon) {
  elements.dungeonStageList.innerHTML = weeklyDungeon.stages
    .map(
      (stage, index) => `
        <article class="dungeon-stage ${stage.complete ? "is-complete" : ""}">
          <span aria-hidden="true">${stage.complete ? "✓" : index + 1}</span>
          <div>
            <strong>${stage.title}</strong>
            <small>${stage.detail}</small>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderMindDemon(mindDemon) {
  elements.demonTrialList.innerHTML = mindDemon.trials
    .map(
      (trial) => `
        <article class="demon-trial ${trial.complete ? "is-complete" : ""}">
          <span aria-hidden="true">${trial.icon}</span>
          <div>
            <strong>${trial.title}</strong>
            <small>${trial.complete ? "已压制" : trial.detail}</small>
            <div class="progress-track" aria-hidden="true"><span style="width: ${trial.progress * 100}%"></span></div>
          </div>
        </article>
      `,
    )
    .join("");

  elements.practiceDemonList.innerHTML = mindDemon.trials
    .map(
      (trial) => `
        <div class="demon-mini-item ${trial.complete ? "is-complete" : ""}">
          <span>${trial.icon}</span>
          <strong>${trial.title}</strong>
          <small>${trial.complete ? "压制" : trial.detail}</small>
        </div>
      `,
    )
    .join("");
}

function renderStoryArc(storyArc) {
  elements.storyChapterList.innerHTML = storyArc.chapters
    .map(
      (chapter) => `
        <article class="story-chapter ${chapter.complete ? "is-complete" : ""} ${chapter === storyArc.current ? "is-current" : ""}">
          <span>${chapter.complete ? "✓" : chapter.tag.replace("第", "").replace("章", "")}</span>
          <div>
            <strong>${chapter.title}</strong>
            <small>${chapter.complete ? "已开篇" : chapter.detail}</small>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderTechniques() {
  elements.techniqueList.innerHTML = techniques
    .map(
      (technique) => `
        <button class="technique-item ${state.user.activeTechnique === technique.id ? "is-active" : ""}" type="button" data-technique="${technique.id}">
          <strong>${technique.name}</strong>
          <small>${technique.school} · ${technique.description}</small>
        </button>
      `,
    )
    .join("");
}

function renderTreasures() {
  const unlocked = new Set(state.user.unlockedTreasures);
  elements.treasureGrid.innerHTML = treasures
    .map(
      (treasure) => {
        const isUnlocked = unlocked.has(treasure.id);
        const isNewlyUnlocked = recentCollectionUnlocks.treasureIds.has(treasure.id);
        const growth = getTreasureGrowth(treasure);
        return `
        <article class="treasure-card ${isUnlocked ? "is-unlocked" : "is-locked"} ${isNewlyUnlocked ? "is-newly-unlocked" : ""}">
          <div class="treasure-image-wrap">
            <img src="./assets/images/${treasure.image}" alt="${treasure.name}" />
            <span>${isUnlocked ? growth.stage : "未认主"}</span>
          </div>
          ${isNewlyUnlocked ? `<div class="collection-new-badge">新入阁</div>` : ""}
          <strong>${treasure.name}</strong>
          <small>${isUnlocked ? `${treasure.growth.title} · ${growth.amount} 分钟` : treasure.description}</small>
          <div class="treasure-skill">
            <span>${treasure.skill.name}</span>
            <p>${isUnlocked ? treasure.skill.fantasy : treasure.skill.value}</p>
          </div>
          <div class="progress-track treasure-progress" aria-hidden="true"><span style="width: ${isUnlocked ? growth.progress : 0}%"></span></div>
          <em>${isUnlocked ? `${growth.skillStage} · ${growth.detail}` : treasure.growth.hint}</em>
        </article>
      `;
      },
    )
    .join("");
}

function getTreasureGrowth(treasure) {
  const amount = state.records.reduce((sum, record) => {
    return treasure.growth.match(record) ? sum + record.duration : sum;
  }, 0);
  const thresholds = treasure.growth.thresholds;
  let level = 0;
  thresholds.forEach((threshold) => {
    if (amount >= threshold) {
      level += 1;
    }
  });

  const stageNames = ["初醒", "一阶", "二阶", "三阶"];
  const previousThreshold = level === 0 ? 0 : thresholds[level - 1];
  const nextThreshold = thresholds[level];
  const progress = nextThreshold ? Math.min(((amount - previousThreshold) / (nextThreshold - previousThreshold)) * 100, 100) : 100;
  const detail = nextThreshold
    ? `距 ${stageNames[level + 1]} 还需 ${Math.max(nextThreshold - amount, 0)} 分钟`
    : "共鸣圆满，继续修炼可保持状态";

  return {
    amount,
    level,
    stage: stageNames[level],
    skillStage: treasure.skill.stages[level],
    progress,
    detail,
  };
}

function renderFates() {
  const unlocked = new Set(state.user.unlockedFates);
  const visibleFates = getFilteredFates(unlocked);
  const activeFilter = fateFilters.find((filter) => filter.id === selectedFateFilter) || fateFilters[0];

  elements.fateFilterList.innerHTML = fateFilters
    .map((filter) => {
      const count = getFateFilterCount(filter.id, unlocked);
      return `
        <button class="fate-filter ${filter.id === selectedFateFilter ? "is-active" : ""}" type="button" data-fate-filter="${filter.id}" aria-pressed="${filter.id === selectedFateFilter}">
          <span>${filter.label}</span>
          <strong>${count}</strong>
        </button>
      `;
    })
    .join("");
  elements.fateFilterSummary.textContent = activeFilter.summary(visibleFates.length);
  elements.fateEmpty.classList.toggle("is-visible", visibleFates.length === 0);
  elements.fateGrid.classList.toggle("is-empty", visibleFates.length === 0);
  elements.fateGrid.innerHTML = visibleFates
    .map(
      (fate) => {
        const isUnlocked = unlocked.has(fate.id);
        const isNewlyUnlocked = recentCollectionUnlocks.fateIds.has(fate.id);
        return `
        <article class="fate-card ${isUnlocked ? "is-unlocked" : "is-locked"} ${isNewlyUnlocked ? "is-newly-unlocked" : ""}">
          <div class="fate-icon" aria-hidden="true">${fate.icon}</div>
          ${isNewlyUnlocked ? `<div class="collection-new-badge">新入阁</div>` : ""}
          <strong>${fate.name}</strong>
          <span class="fate-category">${getFateCategoryLabel(fate.category)}</span>
          <small>${isUnlocked ? fate.description : `未解锁：${fate.description}`}</small>
        </article>
      `;
      },
    )
    .join("");
}

function getFilteredFates(unlocked) {
  return fates.filter((fate) => {
    if (selectedFateFilter === "all") {
      return true;
    }
    if (selectedFateFilter === "unlocked") {
      return unlocked.has(fate.id);
    }
    if (selectedFateFilter === "locked") {
      return !unlocked.has(fate.id);
    }
    return fate.category === selectedFateFilter;
  });
}

function getFateFilterCount(filterId, unlocked) {
  if (filterId === "all") {
    return fates.length;
  }
  if (filterId === "unlocked") {
    return state.user.unlockedFates.length;
  }
  if (filterId === "locked") {
    return fates.length - state.user.unlockedFates.length;
  }
  return fates.filter((fate) => fate.category === filterId).length;
}

function getFateCategoryLabel(category) {
  const filter = fateFilters.find((item) => item.id === category);
  return filter ? filter.label : "仙缘";
}

function renderRecords() {
  const hasRecords = state.records.length > 0;
  elements.emptyRecords.classList.toggle("is-visible", !hasRecords);
  elements.recordList.innerHTML = [...state.records]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((record, index) => {
      const activity = getActivity(record.type);
      const intensity = intensityRules[record.intensity] || intensityRules.normal;
      return `
        <article class="record-item chronicle-entry">
          <div class="record-date">
            <span aria-hidden="true">${index + 1}</span>
            <strong>${formatDate(record.createdAt)}</strong>
          </div>
          <div class="record-copy">
            <strong>${activity.method} · ${record.duration} 分钟 · ${intensity.label}</strong>
            <small>${record.note || `${activity.label}化作一段稳定修炼。`}</small>
          </div>
          <div class="record-reward reward-runes" aria-label="本次修炼收益">
            <span>+${record.reward.cultivation}<small>修为</small></span>
            <span>+${record.reward.spiritStones}<small>灵石</small></span>
            <span>+${record.reward.physique}<small>体魄</small></span>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderActivityTypes() {
  elements.activityTypeGrid.innerHTML = activityTypes
    .map(
      (type) => `
        <button class="type-option ${type.id === selectedActivity ? "is-selected" : ""}" type="button" data-activity="${type.id}" aria-pressed="${type.id === selectedActivity}">
          <span aria-hidden="true">${type.icon}</span>
          <strong>${type.method}</strong>
          <small>${type.label} · ${type.school}</small>
        </button>
      `,
    )
    .join("");
}

function clearRitualFeedback() {
  window.clearTimeout(ritualFeedbackTimer);
  document.body.classList.remove("is-ritual-changing", "is-ritual-method", "is-ritual-intensity", "is-ritual-time", "is-ritual-technique");
}

function setRitualPhase(phase = "idle") {
  document.body.dataset.ritualPhase = phase;
  const labels = {
    idle: "周天静候",
    enter: "灵阵初启",
    channel: "周天运转",
    harvest: "收功聚气",
  };
  const cores = {
    idle: "静",
    enter: "入",
    channel: "炼",
    harvest: "收",
  };
  if (elements.ritualStageLabel) {
    elements.ritualStageLabel.textContent = labels[phase] || labels.idle;
  }
  if (elements.ritualCore) {
    elements.ritualCore.textContent = cores[phase] || cores.idle;
  }
}

function triggerRitualFeedback(kind = "method") {
  if (prefersReducedMotion) {
    setRitualPhase(kind === "time" ? "channel" : "enter");
    return;
  }
  clearRitualFeedback();
  setRitualPhase(kind === "time" ? "channel" : "enter");
  document.body.classList.add("is-ritual-changing", `is-ritual-${kind}`);
  ritualFeedbackTimer = window.setTimeout(clearRitualFeedback, 760);
}

function formatDate(value) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatShortDate(value) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function updateRewardHint(options = {}) {
  const duration = Number(elements.durationInput.value) || 0;
  const intensity = elements.intensityInput.value;
  const reward = calculateReward(duration, intensity);
  document.body.dataset.ritualIntensity = intensity;
  elements.rewardHint.textContent = `${duration} 分钟${intensityRules[intensity].label}运功，预计牵引 ${reward.cultivation} 修为、${reward.spiritStones} 灵石、${reward.physique} 体魄。`;
  if (options.animate) {
    triggerRitualFeedback(options.kind || "time");
  }
}

function captureRecentCollectionUnlocks(progression) {
  recentCollectionUnlocks.treasureIds = new Set(progression.newlyUnlockedTreasures.map((treasure) => treasure.id));
  recentCollectionUnlocks.fateIds = new Set(progression.newlyUnlockedFates.map((fate) => fate.id));

  if (recentCollectionUnlocks.treasureIds.size > 0) {
    selectedPavilionLayer = "treasure";
    return;
  }

  if (recentCollectionUnlocks.fateIds.size > 0) {
    selectedPavilionLayer = "fate";
  }
}

function switchView(viewId) {
  const target = viewId || "dashboard";
  if (target !== "dashboard") {
    setAffairsOpen(false);
  }
  document.body.dataset.activeView = target;
  document.body.classList.toggle("has-overlay", target !== "dashboard");
  document.body.classList.remove("is-harvesting");
  elements.views.forEach((view) => {
    if (view.id === "dashboard") {
      view.classList.add("is-active");
      return;
    }
    view.classList.toggle("is-active", view.id === target);
  });
  elements.navItems.forEach((item) => item.classList.toggle("is-active", item.dataset.view === target));
  const activeOverlay = target === "dashboard" ? null : document.getElementById(target);
  activeOverlay?.querySelector(".overlay-panel")?.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  if (target === "checkin") {
    setRitualPhase("enter");
    triggerRitualFeedback("method");
  } else {
    setRitualPhase("idle");
    clearRitualFeedback();
  }
  if (target === "profile") {
    updatePavilionLayer();
  }
}

function updatePavilionLayer(options = {}) {
  const activeLayer = selectedPavilionLayer || "report";
  elements.pavilionTabButtons.forEach((button) => {
    const isActive = button.dataset.pavilionTab === activeLayer;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  elements.pavilionPanels.forEach((panel) => {
    panel.classList.toggle("is-pavilion-active", panel.dataset.pavilionPanel === activeLayer);
  });

  if (!options.scroll) {
    return;
  }

  const activePanel = document.querySelector(`[data-pavilion-panel="${activeLayer}"]`);
  if (!activePanel || (!options.force && !window.matchMedia("(max-width: 720px)").matches)) {
    return;
  }

  activePanel.scrollIntoView({ block: "start", behavior: prefersReducedMotion ? "auto" : "smooth" });
}

function handlePractice(event) {
  event.preventDefault();

  const duration = Number(elements.durationInput.value);
  if (!Number.isFinite(duration) || duration < 5) {
    showToast("入定时长至少需要 5 分钟。");
    return;
  }

  clearRitualFeedback();
  setRitualPhase("harvest");
  document.body.classList.add("is-harvesting");

  const now = new Date();
  const activity = getActivity(selectedActivity);
  const intensity = elements.intensityInput.value;
  const previousRealmIndex = getRealmInfo().currentIndex;
  const reward = calculateReward(duration, intensity);
  const record = {
    id: crypto.randomUUID(),
    type: selectedActivity,
    method: activity.method,
    duration,
    intensity,
    note: elements.noteInput.value.trim(),
    createdAt: now.toISOString(),
    dateKey: todayKey(now),
    reward: {
      cultivation: reward.cultivation,
      spiritStones: reward.spiritStones,
      physique: reward.physique,
    },
  };

  state.records.push(record);
  state.user.cultivation += reward.cultivation;
  state.user.spiritStones += reward.spiritStones;
  state.user.physique += reward.physique;

  if (duration >= state.user.dailyGoalMinutes) {
    state.user.pills.progress += 1;
    while (state.user.pills.progress >= 3) {
      state.user.pills.progress -= 3;
      state.user.pills.gatheringQi += 1;
      state.user.pills.crafted += 1;
    }
  }

  const progression = unlockProgression(state, true, previousRealmIndex);
  captureRecentCollectionUnlocks(progression);
  saveState();
  render();
  showRewardDialog(reward, progression);
  pulseGrowthFeedback(["realm", "resources", "tasks", "sect", "dungeon", "demon", "story"]);
  elements.noteInput.value = "";
}

function usePill() {
  if (state.user.pills.gatheringQi <= 0) {
    showToast("丹炉中还没有可服用的聚气丹。");
    return;
  }

  const previousRealmIndex = getRealmInfo().currentIndex;
  state.user.pills.gatheringQi -= 1;
  state.user.pills.used += 1;
  state.user.cultivation += 35;
  clearRitualFeedback();
  setRitualPhase("harvest");
  document.body.classList.add("is-harvesting");
  const progression = unlockProgression(state, true, previousRealmIndex);
  captureRecentCollectionUnlocks(progression);
  saveState();
  render();
  showRewardDialog(
    { cultivation: 35, spiritStones: 0, physique: 0, lines: [["服用聚气丹", "+35 修为"]] },
    progression,
    { title: "丹药入腹", showZeroGains: false },
  );
  pulseGrowthFeedback(["realm", "resources"]);
}

function showRewardDialog(reward, progression, options = {}) {
  const feedback = buildRewardFeedback(reward, progression, options);

  setAffairsOpen(false);
  clearRewardSequenceTimers();
  elements.rewardDialog.classList.remove("is-breakthrough", "is-unlock", "is-normal", "is-entering", "is-settlement-staged", "is-gains-ready", "is-events-ready", "is-hud-ready");
  elements.rewardDialog.classList.add(`is-${feedback.status}`);
  elements.rewardDialog.dataset.rewardStatus = feedback.status;
  elements.rewardBurst.textContent = feedback.burst;
  elements.rewardEyebrow.textContent = feedback.eyebrow;
  elements.rewardTitle.textContent = feedback.title;
  elements.rewardSummary.textContent = feedback.summary;
  elements.rewardGains.innerHTML = feedback.gains.map(renderGainCard).join("");
  elements.rewardEvents.innerHTML = feedback.events.length
    ? feedback.events.map(renderRewardEvent).join("")
    : `<div class="reward-event is-quiet"><span>稳</span><div><strong>周天已稳</strong><small>保持节奏，下一次修炼会继续推进境界。</small></div></div>`;
  elements.viewCollectionButton.hidden = !feedback.collectionTarget;
  elements.viewCollectionButton.dataset.collectionTarget = feedback.collectionTarget || "";
  elements.viewCollectionButton.textContent = feedback.collectionLabel || "入阁查看";

  if (typeof elements.rewardDialog.showModal === "function") {
    elements.rewardDialog.showModal();
    elements.rewardDialog.scrollTop = 0;
    playRewardSequence(feedback);
  } else {
    showToast(elements.rewardSummary.textContent);
    playRewardSequence(feedback);
  }
}

function closeRewardDialogTo(viewId = "dashboard") {
  if (elements.rewardDialog.open) {
    elements.rewardDialog.close();
  }
  clearRewardSequenceTimers();
  document.body.classList.remove("settlement-active");
  document.body.classList.remove("is-harvesting");
  switchView(viewId);
}

function buildRewardFeedback(reward, progression, options = {}) {
  const breakthroughEvents = progression.newBreakthroughs.map((realm) => ({
    kind: "breakthrough",
    icon: "破",
    title: "境界突破",
    detail: realm.name,
  }));
  const treasureEvents = progression.newlyUnlockedTreasures.map((treasure) => ({
    kind: "treasure",
    icon: "宝",
    title: "法宝激活",
    detail: treasure.name,
  }));
  const fateEvents = progression.newlyUnlockedFates.map((fate) => ({
    kind: "fate",
    icon: "缘",
    title: "仙缘解锁",
    detail: fate.name,
  }));
  const events = [...breakthroughEvents, ...treasureEvents, ...fateEvents];
  const status = breakthroughEvents.length ? "breakthrough" : events.length ? "unlock" : "normal";
  const collectionTarget = treasureEvents.length ? "treasure" : fateEvents.length ? "fate" : "";
  const collectionLabel = treasureEvents.length ? "入阁看法宝" : fateEvents.length ? "入阁看仙缘" : "";
  const title = options.title || (status === "breakthrough" ? "破境成功" : status === "unlock" ? "机缘显现" : "收功完成");
  const summary =
    status === "breakthrough"
      ? `灵气贯通，成功突破至 ${breakthroughEvents.at(-1).detail}。`
      : status === "unlock"
        ? `本次修炼触发 ${events.length} 项成长，洞府底蕴又厚了一分。`
        : `获得 ${reward.cultivation} 修为，周天运行稳定。`;
  const showZeroGains = options.showZeroGains ?? true;
  const gains = [
    { key: "cultivation", label: "修为", value: reward.cultivation, unit: "", icon: "修" },
    { key: "spiritStones", label: "灵石", value: reward.spiritStones, unit: "", icon: "石" },
    { key: "physique", label: "体魄", value: reward.physique, unit: "", icon: "体" },
  ].filter((gain) => showZeroGains || gain.value > 0);

  return {
    status,
    title,
    summary,
    gains,
    events,
    collectionTarget,
    collectionLabel,
    burst: status === "breakthrough" ? "破" : status === "unlock" ? "缘" : "修",
    eyebrow: status === "breakthrough" ? "破境演出" : status === "unlock" ? "机缘显现" : "收功结算",
  };
}

function renderGainCard(gain) {
  return `
    <article class="gain-card gain-${gain.key}">
      <span aria-hidden="true">${gain.icon}</span>
      <small>${gain.label}</small>
      <strong>+${gain.value}${gain.unit}</strong>
    </article>
  `;
}

function renderRewardEvent(event) {
  return `
    <div class="reward-event is-${event.kind}">
      <span aria-hidden="true">${event.icon}</span>
      <div>
        <strong>${event.title}</strong>
        <small>${event.detail}</small>
      </div>
    </div>
  `;
}

function clearRewardSequenceTimers() {
  rewardSequenceTimers.splice(0).forEach((timer) => window.clearTimeout(timer));
  document.querySelectorAll(".reward-particle-layer").forEach((layer) => layer.remove());
  elements.ascensionOverlay.classList.remove("is-active");
  document.body.classList.remove("ascension-active");
  elements.rewardDialog.classList.remove("is-entering", "is-settlement-staged", "is-gains-ready", "is-events-ready", "is-hud-ready");
}

function queueRewardClass(className, delay) {
  rewardSequenceTimers.push(window.setTimeout(() => elements.rewardDialog.classList.add(className), delay));
}

function playRewardSequence(feedback) {
  if (feedback.status === "breakthrough") {
    playAscensionSequence(feedback);
  }

  if (prefersReducedMotion) {
    document.body.classList.add("settlement-active");
    elements.rewardDialog.classList.add("is-settlement-staged", "is-gains-ready", "is-events-ready", "is-hud-ready");
    rewardSequenceTimers.push(window.setTimeout(() => document.body.classList.remove("settlement-active"), 500));
    return;
  }

  document.body.classList.add("settlement-active");
  elements.rewardDialog.classList.add("is-entering", "is-settlement-staged");
  queueRewardClass("is-gains-ready", 320);
  queueRewardClass("is-events-ready", feedback.events.length ? 780 : 640);
  queueRewardClass("is-hud-ready", 1080);
  rewardSequenceTimers.push(window.setTimeout(() => launchRewardParticles(feedback), 180));
  rewardSequenceTimers.push(window.setTimeout(() => elements.rewardDialog.classList.remove("is-entering"), 1400));
}

function playAscensionSequence(feedback) {
  const breakthrough = feedback.events.find((event) => event.kind === "breakthrough");
  if (!breakthrough) {
    return;
  }

  elements.ascensionSeal.textContent = getCharacterProfile().seal;
  elements.ascensionTitle.textContent = "破境成功";
  elements.ascensionSummary.textContent = `${getCharacterDisplayName()} 晋升至 ${breakthrough.detail}，境界印已落定。`;
  document.body.classList.add("ascension-active");
  elements.ascensionOverlay.classList.add("is-active");
  rewardSequenceTimers.push(window.setTimeout(() => {
    elements.ascensionOverlay.classList.remove("is-active");
    document.body.classList.remove("ascension-active");
  }, prefersReducedMotion ? 900 : 2200));
}

function launchRewardParticles(feedback) {
  document.querySelectorAll(".reward-particle-layer").forEach((layer) => layer.remove());
  const particleLayer = document.createElement("div");
  particleLayer.className = `reward-particle-layer is-${feedback.status}`;
  document.body.append(particleLayer);

  const gainLabels = feedback.gains.map((gain) => gain.icon);
  const eventLabels = feedback.events.map((event) => event.icon);
  const labels = [...eventLabels, ...gainLabels, "定", "收"].filter(Boolean);
  const particleCount = feedback.status === "breakthrough" ? 12 : feedback.status === "unlock" ? 10 : 7;

  labels.slice(0, particleCount).forEach((label, index) => {
    const particle = document.createElement("span");
    particle.className = "reward-particle";
    particle.textContent = label;
    particle.style.setProperty("--x", `${Math.round(Math.cos(index * 0.86) * 22)}vw`);
    particle.style.setProperty("--y", `${Math.round(Math.sin(index * 0.72) * 15)}vh`);
    particle.style.setProperty("--delay", `${index * 34}ms`);
    particleLayer.append(particle);
  });

  rewardSequenceTimers.push(window.setTimeout(() => {
    particleLayer.remove();
    document.body.classList.remove("settlement-active");
  }, 1320));
}

function pulseGrowthFeedback(groups = []) {
  const targets = [];
  if (groups.includes("realm")) {
    targets.push(elements.realmPanel, elements.realmProgressBar, elements.realmValue);
  }
  if (groups.includes("resources")) {
    targets.push(elements.stonesValue, elements.physiqueValue, elements.pillCopy, elements.pillProgressBar);
  }
  if (groups.includes("tasks")) {
    targets.push(elements.questPanel, elements.taskList);
  }
  if (groups.includes("sect")) {
    targets.push(elements.sectPanel, elements.sectProgressBar, elements.practiceSectProgressBar);
  }
  if (groups.includes("dungeon")) {
    targets.push(elements.dungeonPanel, elements.dungeonProgressBar);
  }
  if (groups.includes("demon")) {
    targets.push(elements.demonPanel, elements.demonProgressBar, elements.practiceDemonProgressBar);
  }
  if (groups.includes("story")) {
    targets.push(elements.storyPanel, elements.storyProgressBar);
  }

  targets.filter(Boolean).forEach((target) => {
    target.classList.remove("is-pulsing");
    void target.offsetWidth;
    target.classList.add("is-pulsing");
    window.setTimeout(() => target.classList.remove("is-pulsing"), 900);
  });
}

function showToast(message) {
  clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  toastTimer = setTimeout(() => {
    elements.toast.classList.remove("is-visible");
  }, 2600);
}

function savePreferences() {
  const weeklyGoal = Number(elements.weeklyGoalInput.value);
  const dailyGoal = Number(elements.dailyGoalInput.value);
  state.user.weeklyGoal = Math.min(Math.max(weeklyGoal || 3, 1), 7);
  state.user.dailyGoalMinutes = Math.min(Math.max(dailyGoal || 20, 5), 120);
  state.user.character.nickname = sanitizeNickname(elements.nicknameInput.value);
  saveState();
  render();
  showToast("命格偏好已保存，洞府化身已同步。");
}

async function copyWeeklyReport() {
  const text = latestWeeklyReportText || elements.weeklyReportCopy.textContent.trim();
  if (!text) {
    showToast("当前还没有可复制的周报文案。");
    return;
  }

  if (!navigator.clipboard?.writeText) {
    showToast("当前浏览器不支持一键复制，请手动选中文案。");
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    showToast("修炼周报已复制。");
  } catch {
    showToast("复制失败，请手动选中文案。");
  }
}

function resetDemoData() {
  recentCollectionUnlocks.treasureIds.clear();
  recentCollectionUnlocks.fateIds.clear();
  selectedPavilionLayer = "report";
  setupCharacterGender = defaultState.user.character.gender;
  shouldShowInitialCharacterSetup = true;
  state = structuredClone(defaultState);
  saveState();
  render();
  switchView("dashboard");
  showToast("修炼档案已重置。");
}

function bindEvents() {
  elements.navItems.forEach((item) => {
    item.addEventListener("click", () => switchView(item.dataset.view));
  });

  elements.jumpButtons.forEach((button) => {
    button.addEventListener("click", () => switchView(button.dataset.jumpView));
  });

  elements.closeOverlayButtons.forEach((button) => {
    button.addEventListener("click", () => switchView("dashboard"));
  });

  elements.openAffairsButton?.addEventListener("click", () => {
    setAffairsOpen(!isAffairsOpen);
  });

  elements.closeAffairsButtons.forEach((button) => {
    button.addEventListener("click", () => setAffairsOpen(false));
  });

  elements.affairsPavilionButtons.forEach((button) => {
    button.addEventListener("click", () => openPavilionLayer(button.dataset.affairsPavilionLayer));
  });

  elements.setupGenderButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const gender = button.dataset.characterSetupGender;
      if (!characterProfiles[gender]) {
        return;
      }
      setupCharacterGender = gender;
      syncSetupGenderButtons();
    });
  });

  elements.confirmCharacterSetup?.addEventListener("click", () => completeCharacterSetup(false));
  elements.skipCharacterSetup?.addEventListener("click", () => completeCharacterSetup(true));
  elements.closeSetupButtons.forEach((button) => {
    button.addEventListener("click", () => completeCharacterSetup(true));
  });

  elements.characterGenderButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const gender = button.dataset.characterGender;
      if (!characterProfiles[gender] || state.user.character.gender === gender) {
        return;
      }
      state.user.character.gender = gender;
      saveState();
      render();
      showToast(`主角命形已切换为${characterProfiles[gender].label}。`);
    });
  });

  elements.activityTypeGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-activity]");
    if (!button) {
      return;
    }
    selectedActivity = button.dataset.activity;
    renderActivityTypes();
    updateRewardHint({ animate: true, kind: "method" });
  });

  elements.techniqueList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-technique]");
    if (!button) {
      return;
    }
    state.user.activeTechnique = button.dataset.technique;
    saveState();
    render();
    triggerRitualFeedback("technique");
  });

  elements.fateFilterList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-fate-filter]");
    if (!button) {
      return;
    }
    selectedFateFilter = button.dataset.fateFilter;
    renderFates();
  });

  elements.pavilionTabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-pavilion-tab]");
    if (!button) {
      return;
    }
    selectedPavilionLayer = button.dataset.pavilionTab;
    updatePavilionLayer({ scroll: true });
  });

  elements.practiceForm.addEventListener("submit", handlePractice);
  elements.durationInput.addEventListener("input", () => updateRewardHint({ animate: true, kind: "time" }));
  elements.intensityInput.addEventListener("change", () => updateRewardHint({ animate: true, kind: "intensity" }));
  elements.closeRewardDialog.addEventListener("click", () => {
    closeRewardDialogTo("dashboard");
  });
  elements.continuePracticeButton.addEventListener("click", () => {
    closeRewardDialogTo("checkin");
  });
  elements.viewCollectionButton.addEventListener("click", () => {
    const targetLayer = elements.viewCollectionButton.dataset.collectionTarget || selectedPavilionLayer || "treasure";
    selectedPavilionLayer = targetLayer;
    closeRewardDialogTo("profile");
    window.requestAnimationFrame(() => updatePavilionLayer({ scroll: true, force: true }));
  });
  elements.noviceGuideAction.addEventListener("click", () => {
    const targetView = elements.noviceGuideAction.dataset.guideView || "checkin";
    const targetLayer = elements.noviceGuideAction.dataset.pavilionLayer;
    if (targetLayer) {
      selectedPavilionLayer = targetLayer;
    }
    switchView(targetView);
    if (targetView === "profile" && targetLayer) {
      window.requestAnimationFrame(() => updatePavilionLayer({ scroll: true, force: true }));
    }
  });
  elements.viewRecordsButton.addEventListener("click", () => {
    closeRewardDialogTo("records");
  });
  elements.rewardDialog.addEventListener("close", () => {
    clearRewardSequenceTimers();
    document.body.classList.remove("settlement-active");
    document.body.classList.remove("is-harvesting");
  });
  elements.usePillButton.addEventListener("click", usePill);
  elements.savePreferencesButton.addEventListener("click", savePreferences);
  elements.copyWeeklyReportButton.addEventListener("click", copyWeeklyReport);
  elements.resetDemoButton.addEventListener("click", resetDemoData);
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }
    if (isCharacterSetupOpen) {
      completeCharacterSetup(true);
      return;
    }
    if (isAffairsOpen) {
      setAffairsOpen(false);
      return;
    }
    if (document.body.dataset.activeView !== "dashboard" && !elements.rewardDialog.open) {
      switchView("dashboard");
    }
  });
}

unlockProgression(state, false);
saveState();
renderActivityTypes();
bindEvents();
render();
