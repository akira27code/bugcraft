// ==================== ОСНОВНЫЕ ПЕРЕМЕННЫЕ ====================
let SIZE = 10;
let grid = [];
let score = 500;
let gameActive = true;
let waveActive = true;
let shopActive = false;
let spawnInterval = null;
let baseSpawnDelay = 1.8;
let maxBugs = 15;
let gameOverFlag = false;
let gameStartTime = Date.now();
let currentWave = 1;
let waveKills = 0;
let waveTarget = 15;
let waveBonus = 0;
let waveHpMult = 1.0;
let bossEvent = false;
let waveStarted = false;
let bossRelicClaimed = true;
let waveKillCount = 0;
let gameStage = 1;
let slimeBossHpMult = 1;
let tricksterBossHpMult = 1;
let bossTimer = 90;
let bossTimerInterval = null;
let slimeStage = 0;
let canClick = true;
let clickBlockTimeout = null;
let totalKills = 0;
let purchaseCount = 0;
let plagueAuraInterval = null;
let stats = {clicks: 0, bugsKilled: 0, bossKills: 0, gachaCount: 0};
let nukeUsedThisWave = false;
let hunterActive = false;

let bonuses = {
    damage: 0, critChance: 0.05, critDamage: 1.5, scoreMult: 1.0, devilBonus: 1.0, limit: 0,
    speedReduction: 0, spawnRateIncrease: 0, nukeCharges: 1, berserkStacks: 0, chainLightning: 0,
    accuracy: 1.0, phoenixLife: false, phoenixUsed: false, dragonHeart: 1.0, anvilDamage: 0,
    cursedDamage: 0, cursedCrit: 0, poisonDamage: 0, poisonStacks: 1, poisonDelay: 2000,
    luck: 0, doubleDmgChance: 0, vengeanceSpark: 0, stardust: 0, echoBlade: false,
    crystalCannon: false, gasCloud: 0, gasCloudRadius: 1, gasCloudDmgFalloff: 0.5,
    plagueAura: false, plagueAuraDamage: 0, hairyHook: false, executeMultiplier: 1.0, bonusGoldChance: 0
};

let artifacts = [];
let artifactCounts = {};
let currentShop = [];
let bossShop = [];
let totalSpins = 0;
let illusions = [];
let illusionInterval = null;
let illusionistReal = null;
let devilSpawnTimers = {};
let vampireTimers = {};
let bossSpawnedDevils = [];

const artifactPool = {
    common: [
        {id: "crit1", name: "🔮 Линза крита", desc: "+1% крит шанса", rarity: "common", effect: () => { bonuses.critChance += 0.01 }},
        {id: "critDmg1", name: "💥 Усилитель крита", desc: "+5% крит урона", rarity: "common", effect: () => { bonuses.critDamage += 0.05 }},
        {id: "dmg1", name: "⚔️ Точильный камень", desc: "+0.5 урона", rarity: "common", effect: () => { bonuses.damage += 0.5 }},
        {id: "limit1", name: "📦 Расширитель", desc: "+1 лимит (макс 60)", rarity: "common", effect: () => { if (maxBugs < 60) { bonuses.limit += 1; updateMaxBugs() } }},
        {id: "score1", name: "💰 Мешок монет", desc: "+5% бонус очков", rarity: "common", effect: () => { bonuses.scoreMult += 0.05 }},
        {id: "speed1", name: "👢 Лёгкие сапоги", desc: "+0.10с к спавну", rarity: "common", effect: () => { bonuses.speedReduction += 0.10; updateSpawnSpeed() }}
    ],
    rare: [
        {id: "score2", name: "💎 Золотой слиток", desc: "+10% бонус очков", rarity: "rare", effect: () => { bonuses.scoreMult += 0.10 }},
        {id: "devil1", name: "👿 Охотник на демонов", desc: "+20% очков за боссов", rarity: "rare", effect: () => { bonuses.devilBonus += 0.20 }},
        {id: "limit2", name: "🏰 Бастион", desc: "+4 лимит (макс 60)", rarity: "rare", effect: () => { if (maxBugs < 60) { bonuses.limit += 4; updateMaxBugs() } }},
        {id: "sniper1", name: "🎯 Снайперский выстрел", desc: "+5% крит, -0.5 урона", rarity: "rare", effect: () => { bonuses.critChance += 0.05; bonuses.damage -= 0.5 }},
        {id: "toxin1", name: "🧪 Флакон токсина", desc: "+1 урон яда", rarity: "rare", effect: () => { bonuses.poisonDamage += 1 }},
        {id: "luck1", name: "🍀 Клевер", desc: "+1% удачи", rarity: "rare", effect: () => { bonuses.luck += 0.01 }}
    ],
    epic: [
        {id: "nuke1", name: "💣 Ядерное ядро", desc: "+1 заряд ядерки (макс 1)", rarity: "epic", effect: () => { if (bonuses.nukeCharges < 1) { bonuses.nukeCharges++; updateNukeDisplay() } }},
        {id: "crit2", name: "🎯 Снайперский прицел", desc: "+5% крит шанса", rarity: "epic", effect: () => { bonuses.critChance += 0.05 }},
        {id: "beads1", name: "📿 Чётки", desc: "3% шанс +100 очков", rarity: "epic", effect: () => { bonuses.bonusGoldChance += 0.03 }},
        {id: "poison2", name: "☠️ Концентрированный яд", desc: "+1 яда, +1 стак (до 3)", rarity: "epic", effect: () => { bonuses.poisonDamage += 1; bonuses.poisonStacks = Math.min(3, bonuses.poisonStacks + 1) }},
        {id: "luck2", name: "🌟 Звезда удачи", desc: "+5% удачи", rarity: "epic", effect: () => { bonuses.luck += 0.05 }},
        {id: "execute1", name: "🗡️ Кинжал добивания", desc: "+50% урона по HP<30%", rarity: "epic", effect: () => { bonuses.executeMultiplier += 0.5 }}
    ],
    legendary: [
        {id: "berserk1", name: "🪓 Топор берсерка", desc: "+1 урон/10 убийств", rarity: "legendary", effect: () => { bonuses.berserkStacks += 1 }},
        {id: "chain1", name: "⚡ Цепная молния", desc: "+1 цель", rarity: "legendary", effect: () => { bonuses.chainLightning++ }},
        {id: "doubleDmg1", name: "🪶 Лёгкое перо", desc: "+5% шанс x2 урона", rarity: "legendary", effect: () => { bonuses.doubleDmgChance += 0.05 }},
        {id: "vengeance1", name: "🔥 Искра возмездия", desc: "+1% урона/врага (до 50%)", rarity: "legendary", effect: () => { bonuses.vengeanceSpark += 0.01 }},
        {id: "stardust1", name: "🌌 Звёздная пыль", desc: "+1 урон/50 убийств (до +20)", rarity: "legendary", effect: () => { bonuses.stardust += 1 }},
        {id: "gasCloud1", name: "☁️ Газовое облако", desc: "+1 яда, яд на соседей 2x2", rarity: "legendary", effect: () => { bonuses.poisonDamage += 1; bonuses.gasCloud++; }}
    ],
    cursed: [
        {id: "cursed1", name: "💀 Ускорение ада", desc: "-0.1с спавн, +5% урона", rarity: "cursed", effect: () => { bonuses.spawnRateIncrease += 0.1; bonuses.cursedDamage += 0.05; updateSpawnSpeed() }},
        {id: "cursed2", name: "🎲 Рискованный бросок", desc: "-5% точности, +10% крит", rarity: "cursed", effect: () => { bonuses.accuracy -= 0.05; bonuses.cursedCrit += 0.10 }},
        {id: "cursed3", name: "👁️ Проклятый глаз", desc: "-10 лимит, +10% крит", rarity: "cursed", effect: () => { bonuses.limit -= 10; bonuses.cursedCrit += 0.10; updateMaxBugs() }},
        {id: "cursed4", name: "🔮 Проклятая меткость", desc: "+5% точности, -0.5 урона", rarity: "cursed", effect: () => { bonuses.accuracy += 0.05; bonuses.damage -= 0.5 }},
        {id: "cursed5", name: "💎 Хрустальная пушка", desc: "+20% урона, 5% самооглушение", rarity: "cursed", effect: () => { bonuses.cursedDamage += 0.20; bonuses.crystalCannon = true }},
        {id: "cursed6", name: "⌛ Песочные часы", desc: "-0.1с спавн, +10% очков", rarity: "cursed", effect: () => { bonuses.spawnRateIncrease += 0.1; bonuses.scoreMult += 0.10; updateSpawnSpeed() }}
    ],
    boss: [
        {id: "phoenix", name: "🔥 Перо феникса", desc: "Воскрешение (1 раз)", rarity: "boss", effect: () => { bonuses.phoenixLife = true }},
        {id: "dragon", name: "🐉 Сердце дракона", desc: "+10% к урону/криту/очкам", rarity: "boss", effect: () => { bonuses.dragonHeart += 0.10 }},
        {id: "anvil", name: "🔨 Наковальня", desc: "30% урона 3x3", rarity: "boss", effect: () => { bonuses.anvilDamage += 0.30 }},
        {id: "echoBlade1", name: "⚡ Эхо клинка", desc: "10% шанс перекинуть остаток урона", rarity: "boss", effect: () => { bonuses.echoBlade = true }},
        {id: "plague1", name: "☠️ Аура чумы", desc: "+5 яда, каждые 10с яд на всех", rarity: "boss", effect: () => { bonuses.poisonDamage += 5; bonuses.plagueAura = true; bonuses.plagueAuraDamage = bonuses.poisonDamage; startPlagueAura() }},
        {id: "hook1", name: "🪝 Волосатый крюк", desc: "20% притянуть врага на клетку атаки", rarity: "boss", effect: () => { bonuses.hairyHook = true }}
    ]
};

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================
function getBerserkBonus() { return Math.floor(waveKillCount / 10) * bonuses.berserkStacks }
function getStardustBonus() { return Math.min(20, Math.floor(totalKills / 50) * bonuses.stardust) }
function getVengeanceBonus() { return Math.min(0.50, countBugs() * bonuses.vengeanceSpark) }
function getArtifactPrice(r) {
    let b = 0;
    if (r === 'common') b = 150;
    else if (r === 'rare') b = 200;
    else if (r === 'epic') b = 300;
    else if (r === 'legendary') b = 500;
    else if (r === 'cursed') b = 650;
    else if (r === 'boss') return 0;
    return Math.floor(b * Math.pow(1.15, purchaseCount));
}
function addArtifactToInventory(a) { artifactCounts[a.id] = (artifactCounts[a.id] || 0) + 1; if (!artifacts.includes(a)) artifacts.push(a) }

function startPlagueAura() {
    if (plagueAuraInterval) clearInterval(plagueAuraInterval);
    plagueAuraInterval = setInterval(() => {
        if (!gameActive || !waveActive || shopActive) return;
        for (let i = 0; i < SIZE; i++) {
            for (let j = 0; j < SIZE; j++) {
                if (grid[i] && grid[i][j] && grid[i][j].type !== 'empty' && !grid[i][j].isIllusion) {
                    if (!grid[i][j].poisonStacks) grid[i][j].poisonStacks = 0;
                    grid[i][j].poisonStacks = Math.min(bonuses.poisonStacks, (grid[i][j].poisonStacks || 0) + 1);
                    grid[i][j].poisonDamageTotal = (grid[i][j].poisonDamageTotal || 0) + bonuses.plagueAuraDamage;
                    if (!grid[i][j].poisonTimer) schedulePoisonTick(i, j, grid[i][j]);
                }
            }
        }
        updateUI();
    }, 10000);
}

function filterNukeFromPool(pool) {
    return pool.filter(item => {
        if (item.id === 'nuke1' && bonuses.nukeCharges >= 1) return false;
        return true;
    });
}

function generateShop() {
    let s = [], rars = ['common', 'rare', 'epic', 'legendary', 'cursed'];
    let bp = {common: 0.50, rare: 0.30, epic: 0.10, legendary: 0.07, cursed: 0.03}, lb = bonuses.luck;
    let p = {
        common: Math.max(0.20, bp.common - lb * 0.8),
        rare: bp.rare + lb * 0.2,
        epic: bp.epic + lb * 0.3,
        legendary: bp.legendary + lb * 0.2,
        cursed: bp.cursed + lb * 0.1
    };
    let t = p.common + p.rare + p.epic + p.legendary + p.cursed;
    for (let k in p) p[k] /= t;
    for (let i = 0; i < 3; i++) {
        let r = Math.random(), a = 0, cr = 'common';
        for (let ra of rars) { a += p[ra]; if (r <= a) { cr = ra; break } }
        let pool = filterNukeFromPool(artifactPool[cr] || []);
        if (pool && pool.length > 0) {
            let art = pool[Math.floor(Math.random() * pool.length)];
            s.push({...art, price: getArtifactPrice(cr)});
        }
    }
    return s;
}

function generateBossShop() {
    let s = [], pool = artifactPool['boss'], sh = [...pool].sort(() => 0.5 - Math.random());
    for (let i = 0; i < Math.min(3, sh.length); i++) s.push({...sh[i], price: 0});
    return s;
}

function renderArtifactShop() {
    let c = document.getElementById('artifactShop');
    if (!c) return;
    c.innerHTML = '<h4>🎁 АРТЕФАКТЫ</h4>';
    if (currentShop.length > 0) {
        for (let a of currentShop) {
            let d = document.createElement('div');
            d.className = `artifact-card rarity-${a.rarity}`;
            let rl = a.rarity.toUpperCase();
            if (a.rarity === 'cursed') rl = 'ПРОКЛЯТЫЙ';
            let pt = a.price === 0 ? 'БЕСПЛАТНО' : `💰 ${a.price}`;
            d.innerHTML = `<b>${a.name}</b> [${rl}]<br><span style="font-size:10px">${a.desc}</span><br><span style="color:#faa">${pt}</span>`;
            d.onclick = () => {
                if (a.price === 0 || score >= a.price) {
                    if (a.price > 0) { score -= a.price; purchaseCount++ }
                    a.effect();
                    addArtifactToInventory(a);
                    currentShop = currentShop.filter(x => x !== a);
                    showToast(`✅ ${a.name}`);
                    renderArtifactShop();
                    updateUI();
                    renderStats();
                } else showToast("❌ Не хватает!");
            };
            c.appendChild(d);
        }
    } else c.innerHTML += '<div style="color:gray">Нет артефактов</div>';
    
    if (bossShop.length > 0) {
        c.innerHTML += '<h4 style="color:#f00">👑 БОСС-АРТЕФАКТЫ (выберите 1)</h4><div style="color:#f66;font-size:10px">⚠️ Заберите реликвию!</div>';
        for (let a of bossShop) {
            let d = document.createElement('div');
            d.className = `artifact-card rarity-${a.rarity}`;
            d.innerHTML = `<b>${a.name}</b> [BOSS]<br><span style="font-size:10px">${a.desc}</span><br><span style="color:#f00">БЕСПЛАТНО</span>`;
            d.onclick = () => {
                a.effect();
                addArtifactToInventory(a);
                bossShop = [];
                bossRelicClaimed = true;
                showToast(`✅ ${a.name}`);
                renderArtifactShop();
                updateUI();
                renderStats();
                checkStartWaveButton();
            };
            c.appendChild(d);
        }
    }
}

function getTotalDamage() {
    let d = 1 + bonuses.damage + getBerserkBonus() + getStardustBonus();
    d = d * bonuses.dragonHeart * (1 + bonuses.cursedDamage + getVengeanceBonus());
    return Math.max(0.1, d);
}

function renderStats() {
    let c = document.getElementById('statsDisplay');
    if (!c) return;
    let td = getTotalDamage(), dd = bonuses.doubleDmgChance, v = getVengeanceBonus(), sd = getStardustBonus();
    c.innerHTML = `
        <div class="stat-item">⚔️ Урон: ${td.toFixed(1)}</div>
        <div class="stat-item">🎯 Крит: ${Math.floor((bonuses.critChance + bonuses.cursedCrit) * 100)}%</div>
        <div class="stat-item">💥 Крит урон: x${bonuses.critDamage.toFixed(2)}</div>
        <div class="stat-item">☠️ Яд: ${bonuses.poisonDamage} (ст:${bonuses.poisonStacks})</div>
        <div class="stat-item">💰 Очки: +${Math.floor((bonuses.scoreMult - 1) * 100)}%</div>
        <div class="stat-item">😈 Босс-очки: +${Math.floor((bonuses.devilBonus - 1) * 100)}%</div>
        <div class="stat-item">🍀 Удача: ${Math.floor(bonuses.luck * 100)}%</div>
        <div class="stat-item">⚡ Цепь: ${bonuses.chainLightning}</div>
        <div class="stat-item">💀 Берсерк: +${getBerserkBonus()} (${waveKillCount}/10)</div>
        <div class="stat-item">🪶 x2 урон: ${Math.floor(dd * 100)}%</div>
        <div class="stat-item">🔥 Возмездие: +${Math.floor(v * 100)}%</div>
        <div class="stat-item">🌌 Зв.пыль: +${sd}</div>
        <div class="stat-item">🎯 Точность: ${Math.floor(bonuses.accuracy * 100)}%</div>
        <div class="stat-item">💣 Ядерок: ${bonuses.nukeCharges}</div>
        <div class="stat-item">🔨 Наковальня: ${Math.floor(bonuses.anvilDamage * 100)}%</div>
        <div class="stat-item">🐉 Дракон: +${Math.floor((bonuses.dragonHeart - 1) * 100)}%</div>
    `;
    
    let inv = document.getElementById('inventoryList');
    if (!inv) return;
    inv.innerHTML = '<div class="inventory-grid"></div>';
    let g = inv.querySelector('.inventory-grid'), sh = [];
    for (let a of artifacts) {
        let cnt = artifactCounts[a.id] || 0;
        if (cnt > 0 && !sh.includes(a.id)) {
            sh.push(a.id);
            let d = document.createElement('div');
            d.className = `artifact-card rarity-${a.rarity}`;
            d.style.fontSize = '9px';
            d.style.padding = '4px';
            let rl = a.rarity === 'cursed' ? 'ПРОКЛЯТЫЙ' : a.rarity.toUpperCase();
            d.innerHTML = `<b>${a.name}</b> x${cnt}<br><span style="font-size:8px">[${rl}] ${a.desc}</span>`;
            g.appendChild(d);
        }
    }
    if (sh.length === 0) g.innerHTML = '<div style="color:gray">Нет артефактов</div>';
}

function getSlotPrice(c) {
    let m = 1 + (totalSpins * 0.05);
    if (c === 1) return Math.floor(100 * m);
    if (c === 3) return Math.floor(270 * m);
    return Math.floor(400 * m);
}

function updateSlotPrices() {
    let e1 = document.getElementById('slot1Price'), e2 = document.getElementById('slot3Price'), e3 = document.getElementById('slot5Price');
    if (e1) e1.innerText = getSlotPrice(1);
    if (e2) e2.innerText = getSlotPrice(3);
    if (e3) e3.innerText = getSlotPrice(5);
}

async function animateReel(id, fv, dur = 250) {
    let el = document.getElementById(id + 'value');
    if (!el) return;
    let s = ['🔵', '🟣', '🟠', '🔴', '⚫', '💪', '🛡️', '🍀', '💰', '✨', '⚔️', '🔥', '💎'];
    for (let i = 0; i < 12; i++) {
        el.innerText = s[Math.floor(Math.random() * s.length)];
        await new Promise(r => setTimeout(r, dur / 12));
    }
    el.innerText = fv;
}

let isSpinning = false;
async function spinSlot(count) {
    if (isSpinning) { showToast("Подожди!"); return }
    let price = getSlotPrice(count);
    if (score < price) { showToast("Не хватает!"); return }
    
    score -= price;
    totalSpins += count;
    updateSlotPrices();
    isSpinning = true;
    let rd = document.getElementById('slotResult');
    rd.innerHTML = '<div>🎰 КРУТИМ...</div>';
    let bc = count === 1 ? 0.05 : count === 3 ? 0.15 : 0.25, lb = bonuses.luck;
    
    for (let s = 0; s < count; s++) {
        let rars = [
            {n: 'common', e: '🔵', c: 0.50 - lb * 0.3 - bc * 0.3},
            {n: 'rare', e: '🟣', c: 0.30 + lb * 0.1 - bc * 0.1},
            {n: 'epic', e: '🟠', c: 0.10 + lb * 0.1 + bc * 0.1},
            {n: 'legendary', e: '🔴', c: 0.07 + lb * 0.05 + bc * 0.2},
            {n: 'cursed', e: '⚫', c: 0.03 + lb * 0.05 + bc * 0.1}
        ];
        let tot = rars.reduce((a, b) => a + b.c, 0);
        rars.forEach(r => r.c /= tot);
        let r = Math.random(), acc = 0, chR = rars[0];
        for (let ra of rars) { acc += ra.c; if (r <= acc) { chR = ra; break } }
        await animateReel('reel1', chR.e, 200);
        await animateReel('reel2', ['💪', '🛡️', '🍀', '💰'][Math.floor(Math.random() * 4)], 200);
        let pool = filterNukeFromPool(artifactPool[chR.n] || artifactPool['common']);
        let item = pool[Math.floor(Math.random() * pool.length)];
        await animateReel('reel3', '✨', 200);
        item.effect();
        addArtifactToInventory(item);
        let rl = chR.n === 'cursed' ? 'ПРОКЛЯТЫЙ' : chR.n.toUpperCase();
        let rc = chR.n === 'cursed' ? '#666' : chR.n === 'legendary' ? '#fa0' : '#4f4';
        rd.innerHTML = `<div>🎰 ${s + 1}: <span style="color:${rc}">${rl}</span> | <b>${item.name}</b></div>` + rd.innerHTML;
        await new Promise(r => setTimeout(r, 150));
    }
    stats.gachaCount += count;
    showToast("🎰 Предметы!");
    renderStats();
    updateUI();
    isSpinning = false;
}

function schedulePoisonTick(i, j, cell) {
    if (cell.poisonTimer) return;
    cell.poisonTimer = setTimeout(() => {
        if (!grid[i] || !grid[i][j] || grid[i][j].type === 'empty') { cell.poisonTimer = null; return }
        let td = cell.poisonDamageTotal || 0;
        if (td > 0) {
            cell.hp -= td;
            let rect = document.querySelector(`#gameGrid .cell:nth-child(${i * SIZE + j + 1})`)?.getBoundingClientRect();
            if (rect) showDamageNumber(rect.left + rect.width / 2, rect.top + rect.height / 2, td, 'poison');
            if (cell.hp <= 0) handleDeath(i, j, cell);
        }
        cell.poisonStacks = 0;
        cell.poisonDamageTotal = 0;
        cell.poisonTimer = null;
        updateUI();
    }, bonuses.poisonDelay);
}

function showTrollDialog() {
    let m = ["🧌 Привет!", "🧌 Не пройдёшь!", "🧌 Ха-ха!", "🧌 Я тут!", "🧌 Тролль!", "🧌 Смотри!", "🧌 Отвлёкся?", "🧌 Не угадал!"];
    let c = 3 + Math.floor(Math.random() * 3);
    for (let k = 0; k < c; k++) {
        setTimeout(() => {
            let msg = m[Math.floor(Math.random() * m.length)];
            let x = 50 + Math.random() * (innerWidth - 350);
            let y = 50 + Math.random() * (innerHeight - 250);
            let d = document.createElement('div');
            d.className = 'troll-dialog';
            d.style.left = x + 'px';
            d.style.top = y + 'px';
            d.innerHTML = `<div>${msg}</div><button>ОК</button>`;
            document.body.appendChild(d);
            d.querySelector('button').onclick = () => d.remove();
            setTimeout(() => { if (d.parentNode) d.remove() }, 4000);
        }, k * 500);
    }
}

function spawnDevil(x, y, bossSpawned = false) {
    let hp = getCurrentHp(18);
    grid[x][y] = {type: 'devil', hp, maxHp: hp, bossSpawned: bossSpawned};
    showToast(bossSpawned ? "😈 ДЬЯВОЛ (босс)!" : "😈 ДЬЯВОЛ! Элитные через 3с!");
    let tk = `${x},${y}`;
    if (bossSpawned) { bossSpawnedDevils.push(tk) }
    let tid = setTimeout(() => {
        if (!gameActive || !grid[x] || !grid[x][y] || grid[x][y].type !== 'devil') return;
        let e = [];
        for (let i = 0; i < SIZE; i++) for (let j = 0; j < SIZE; j++) if (grid[i] && grid[i][j] && grid[i][j].type === 'empty') e.push([i, j]);
        let ts = bossSpawned ? Math.min(3, e.length) : Math.min(5, e.length);
        for (let k = 0; k < ts; k++) {
            let idx = Math.floor(Math.random() * e.length);
            let [ex, ey] = e[idx];
            grid[ex][ey] = {type: 'elite', hp: getCurrentHp(4), maxHp: getCurrentHp(4), bossSpawned: bossSpawned};
            e.splice(idx, 1);
        }
        if (ts > 0) showToast(`😈 +${ts} элитных!`);
        updateUI();
        delete devilSpawnTimers[tk];
        if (bossSpawned) bossSpawnedDevils = bossSpawnedDevils.filter(d => d !== tk);
    }, 3000);
    devilSpawnTimers[tk] = tid;
}

function spawnIllusionist(x, y) {
    illusionistReal = {x, y};
    grid[x][y] = {type: 'illusionist_real', hp: getCurrentHp(20), maxHp: getCurrentHp(20), hideHp: true, isRealIllusionist: true};
    spawnIllusionsForIllusionist(x, y);
    if (illusionInterval) clearInterval(illusionInterval);
    illusionInterval = setInterval(() => {
        if (!gameActive || !waveActive) { clearIllusions(); return }
        if (illusionistReal && grid[illusionistReal.x]?.[illusionistReal.y]?.type === 'illusionist_real' && grid[illusionistReal.x][illusionistReal.y].isRealIllusionist) {
            spawnIllusionsForIllusionist(illusionistReal.x, illusionistReal.y);
        } else clearIllusions();
    }, 4000);
}

function spawnIllusionsForIllusionist(rx, ry) {
    let e = [];
    for (let i = 0; i < SIZE; i++) for (let j = 0; j < SIZE; j++) if (grid[i] && grid[i][j] && grid[i][j].type === 'empty') e.push([i, j]);
    let cnt = Math.min(5, e.length);
    for (let k = 0; k < cnt; k++) {
        let idx = Math.floor(Math.random() * e.length);
        let [ix, iy] = e[idx];
        grid[ix][iy] = {type: 'illusionist_real', hp: 1, maxHp: 1, hideHp: true, isIllusion: true, realX: rx, realY: ry};
        illusions.push({x: ix, y: iy});
        e.splice(idx, 1);
    }
    updateUI();
}

function clearIllusions() {
    for (let ill of illusions) {
        if (grid[ill.x] && grid[ill.x][ill.y] && grid[ill.x][ill.y].isIllusion) grid[ill.x][ill.y] = {type: 'empty'};
    }
    illusions = [];
    if (illusionInterval) { clearInterval(illusionInterval); illusionInterval = null }
    illusionistReal = null;
}

function spawnHunter(x, y) {
    let hp = getCurrentHp(25);
    grid[x][y] = {type: 'hunter', hp, maxHp: hp};
    hunterActive = true;
    showToast("🏹 ОХОТНИК! Можно атаковать только его!");
}

function killHunter() {
    if (clickBlockTimeout) { clearTimeout(clickBlockTimeout); clickBlockTimeout = null }
    canClick = true;
    hunterActive = false;
}

// ==================== БОССЫ ====================
function spawnSlimeBoss() {
    clearAllEnemies();
    slimeStage = 0;
    for (let i = 3; i <= 5; i++) for (let j = 3; j <= 5; j++) grid[i][j] = {type: 'slime_boss', hp: 34 * slimeBossHpMult, maxHp: 34 * slimeBossHpMult, slimeType: 'big'};
    showToast("🟢 СЛИЗЕНЬ! 3x3!");
    updateUI();
}

function spawnSlimeMedium(x, y) {
    for (let i = x; i < x + 2; i++) for (let j = y; j < y + 2; j++) if (i < SIZE && j < SIZE) grid[i][j] = {type: 'slime_medium', hp: 38 * slimeBossHpMult, maxHp: 38 * slimeBossHpMult, slimeType: 'medium'};
}

function spawnSlimeSmall(cx, cy) {
    grid[cx][cy] = {type: 'slime_small_final', hp: 70 * slimeBossHpMult, maxHp: 70 * slimeBossHpMult, slimeType: 'small'};
}

function checkSlimeStageCleared() {
    if (slimeStage === 0) {
        let ba = false;
        for (let i = 0; i < SIZE; i++) for (let j = 0; j < SIZE; j++) if (grid[i] && grid[i][j] && grid[i][j].slimeType === 'big') ba = true;
        if (!ba) {
            slimeStage = 1;
            showToast("🟢 2 средних!");
            let e = [];
            for (let i = 0; i < SIZE - 1; i++) {
                for (let j = 0; j < SIZE - 1; j++) {
                    let cp = true;
                    for (let di = 0; di < 2; di++) for (let dj = 0; dj < 2; dj++) if (grid[i + di] && grid[i + di][j + dj] && grid[i + di][j + dj].type !== 'empty') cp = false;
                    if (cp) e.push([i, j]);
                }
            }
            if (e.length >= 2) {
                let [x1, y1] = e[Math.floor(Math.random() * e.length)];
                e = e.filter(([ex, ey]) => Math.abs(ex - x1) >= 2 || Math.abs(ey - y1) >= 2);
                if (e.length > 0) {
                    let [x2, y2] = e[Math.floor(Math.random() * e.length)];
                    spawnSlimeMedium(x1, y1);
                    spawnSlimeMedium(x2, y2);
                } else spawnSlimeMedium(x1, y1);
            }
            updateUI();
        }
    } else if (slimeStage === 1) {
        let ma = false;
        for (let i = 0; i < SIZE; i++) for (let j = 0; j < SIZE; j++) if (grid[i] && grid[i][j] && grid[i][j].slimeType === 'medium') ma = true;
        if (!ma) {
            slimeStage = 2;
            showToast("🟢 4 маленьких!");
            let e = [];
            for (let i = 0; i < SIZE; i++) for (let j = 0; j < SIZE; j++) if (grid[i] && grid[i][j] && grid[i][j].type === 'empty') e.push([i, j]);
            for (let k = 0; k < Math.min(4, e.length); k++) {
                let idx = Math.floor(Math.random() * e.length);
                let [ex, ey] = e[idx];
                spawnSlimeSmall(ex, ey);
                e.splice(idx, 1);
            }
            updateUI();
        }
    } else if (slimeStage === 2) {
        let sa = false;
        for (let i = 0; i < SIZE; i++) for (let j = 0; j < SIZE; j++) if (grid[i] && grid[i][j] && grid[i][j].slimeType === 'small') sa = true;
        if (!sa) {
            score += 2000;
            stopBossTimer();
            showToast("👑 СЛИЗЕНЬ ПОВЕРЖЕН! +2000!");
            stats.bossKills++;
            slimeBossHpMult *= 2;
            bossShop = generateBossShop();
            bossRelicClaimed = false;
            if (gameStage === 1) gameStage = 2;
            endWave();
        }
    }
}

// ИСПРАВЛЕНО: Трикстер спавнит 3 мини-босса при промахе
function spawnTricksterBoss() {
    clearAllEnemies();
    bossSpawnedDevils = [];
    grid[4][4] = {
        type: 'trickster_boss', 
        hp: getCurrentHp(800 * tricksterBossHpMult), 
        maxHp: getCurrentHp(800 * tricksterBossHpMult), 
        missChance: 0.3,
        isBoss: true
    };
    showToast("🎭 ТРИКСТЕР! При промахе спавнит 3 мини-боссов!");
    updateUI();
}

// ИСПРАВЛЕНО: Трикстер спавнит 3 случайных мини-босса
function spawnTricksterMinions(x, y) {
    let minionTypes = [
        {name: 'devil', hp: 18, spawnFunc: (ex, ey) => spawnDevil(ex, ey, true)},
        {name: 'hunter', hp: 25, spawnFunc: (ex, ey) => spawnHunter(ex, ey)},
        {name: 'vampire', hp: 5, spawnFunc: (ex, ey) => {
            let hp = getCurrentHp(5);
            grid[ex][ey] = {type: 'vampire', hp, maxHp: hp, bossSpawned: true};
            let vk = `${ex},${ey}`;
            let vtid = setInterval(() => {
                if (!gameActive || !grid[ex] || !grid[ex][ey] || grid[ex][ey].type !== 'vampire') {
                    clearInterval(vtid);
                    delete vampireTimers[vk];
                    return;
                }
                score = Math.max(0, score - 20);
                showToast("🧛 -20!");
                updateUI();
            }, 2000);
            vampireTimers[vk] = vtid;
        }}
    ];
    
    // Ищем 3 случайные пустые клетки рядом с местом промаха
    let emptyCells = [];
    for (let dx = -2; dx <= 2; dx++) {
        for (let dy = -2; dy <= 2; dy++) {
            let nx = x + dx, ny = y + dy;
            if (nx >= 0 && nx < SIZE && ny >= 0 && ny < SIZE && grid[nx] && grid[nx][ny] && grid[nx][ny].type === 'empty') {
                emptyCells.push([nx, ny]);
            }
        }
    }
    
    // Если рядом нет пустых клеток, ищем по всему полю
    if (emptyCells.length < 3) {
        emptyCells = [];
        for (let i = 0; i < SIZE; i++) {
            for (let j = 0; j < SIZE; j++) {
                if (grid[i] && grid[i][j] && grid[i][j].type === 'empty') {
                    emptyCells.push([i, j]);
                }
            }
        }
    }
    
    let spawnCount = Math.min(3, emptyCells.length);
    let spawnedTypes = [];
    
    for (let i = 0; i < spawnCount; i++) {
        let idx = Math.floor(Math.random() * emptyCells.length);
        let [ex, ey] = emptyCells[idx];
        let minion = minionTypes[Math.floor(Math.random() * minionTypes.length)];
        minion.spawnFunc(ex, ey);
        spawnedTypes.push(minion.name);
        emptyCells.splice(idx, 1);
    }
    
    showToast(`🎭 Трикстер призвал: ${spawnedTypes.join(', ')}!`);
}

// ИСПРАВЛЕНО: Телепортация с спавном 3 мини-боссов
function teleportTrickster(x, y, cell) {
    // Спавним 3 мини-боссов
    spawnTricksterMinions(x, y);
    
    // Ищем пустые клетки для телепортации
    let emptyCells = [];
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            if (grid[i] && grid[i][j] && grid[i][j].type === 'empty') {
                emptyCells.push([i, j]);
            }
        }
    }
    
    if (emptyCells.length > 0) {
        let [nx, ny] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        
        let currentHp = cell.hp;
        let maxHp = cell.maxHp || getCurrentHp(800 * tricksterBossHpMult);
        let missChance = cell.missChance || 0.3;
        
        grid[x][y] = {type: 'empty'};
        
        grid[nx][ny] = {
            type: 'trickster_boss',
            hp: currentHp,
            maxHp: maxHp,
            missChance: missChance,
            isBoss: true
        };
        
        showToast(`🎭 Трикстер телепортировался!`);
    } else {
        showToast("🎭 Трикстеру некуда телепортироваться!");
    }
}

function checkTricksterDead() {
    let foundTrickster = false;
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            if (grid[i] && grid[i][j] && grid[i][j].type === 'trickster_boss') {
                foundTrickster = true;
                break;
            }
        }
        if (foundTrickster) break;
    }
    
    if (!foundTrickster) {
        score += 5000;
        stopBossTimer();
        showToast("👑 ТРИКСТЕР ПОВЕРЖЕН! +5000!");
        stats.bossKills++;
        tricksterBossHpMult *= 2;
        bossShop = generateBossShop();
        bossRelicClaimed = false;
        if (gameStage === 2) gameStage = 3;
        clearBossSpawnedEnemies();
        endWave();
    }
}

function clearBossSpawnedEnemies() {
    for (let i = 0; i < SIZE; i++) for (let j = 0; j < SIZE; j++) if (grid[i] && grid[i][j] && grid[i][j].bossSpawned) grid[i][j] = {type: 'empty'};
    bossSpawnedDevils = [];
}

function showToast(msg) {
    let t = document.createElement('div');
    t.className = 'toast';
    t.innerText = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2000);
}

function gameOver(reason = "💀 ИГРА ОКОНЧЕНА!") {
    gameActive = false;
    gameOverFlag = true;
    if (spawnInterval) clearInterval(spawnInterval);
    stopBossTimer();
    clearIllusions();
    killHunter();
    for (let k in devilSpawnTimers) clearTimeout(devilSpawnTimers[k]);
    devilSpawnTimers = {};
    for (let k in vampireTimers) clearInterval(vampireTimers[k]);
    vampireTimers = {};
    if (plagueAuraInterval) clearInterval(plagueAuraInterval);
    showToast(reason);
    updateUI();
}

function showDamageNumber(x, y, dmg, type = 'normal') {
    let d = document.createElement('div');
    d.className = 'damage-number';
    if (type === 'crit') {
        d.classList.add('crit-number');
        d.innerText = `${Math.floor(dmg)} ★CRIT★`;
    } else if (type === 'miss') {
        d.classList.add('miss-number');
        d.innerText = 'ПРОМАХ!';
    } else if (type === 'shield') {
        d.classList.add('shield-number');
        d.innerText = `🛡 ${Math.floor(dmg)}`;
    } else if (type === 'poison') {
        d.classList.add('poison-number');
        d.innerText = `☠ ${Math.floor(dmg)}`;
    } else if (type === 'bonus') {
        d.classList.add('bonus-number');
        d.innerText = `+${Math.floor(dmg)}🌟`;
    } else if (type === 'chain') {
        d.classList.add('chain-number');
        d.innerText = `⚡${Math.floor(dmg)}`;
    } else {
        d.classList.add('normal-number');
        d.innerText = `-${Math.floor(dmg)}`;
    }
    d.style.left = (x - 15) + 'px';
    d.style.top = (y - 20) + 'px';
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 800);
}

function updateMaxBugs() {
    maxBugs = Math.min(60, 15 + bonuses.limit);
    let el = document.getElementById('maxBugs');
    if (el) el.innerText = maxBugs;
}

function updateSpawnSpeed() {
    let wsi = (currentWave - 1) * 0.05;
    baseSpawnDelay = Math.max(0.2, 1.8 - bonuses.speedReduction + bonuses.spawnRateIncrease - wsi);
    let el = document.getElementById('spawnSpeed');
    if (el) el.innerText = baseSpawnDelay.toFixed(1);
    if (spawnInterval && waveActive && !shopActive) {
        clearInterval(spawnInterval);
        startSpawnLoop();
    }
    document.getElementById('poisonDmg').innerText = bonuses.poisonDamage;
}

function updateNukeDisplay() {
    let el = document.getElementById('nukeCount');
    if (el) el.innerText = bonuses.nukeCharges;
    let nukeBtn = document.getElementById('nukeBtn');
    if (nukeBtn) {
        nukeBtn.disabled = (nukeUsedThisWave || bonuses.nukeCharges <= 0);
        if (nukeUsedThisWave) nukeBtn.style.background = '#552200';
        else nukeBtn.style.background = '#ff2200';
    }
    let nukeStatus = document.getElementById('nukeStatusContainer');
    if (nukeStatus) {
        nukeStatus.style.display = nukeUsedThisWave ? 'block' : 'none';
    }
}

function countBugs() {
    let c = 0;
    for (let i = 0; i < SIZE; i++) for (let j = 0; j < SIZE; j++) if (grid[i] && grid[i][j] && grid[i][j].type !== 'empty' && !grid[i][j].isIllusion) c++;
    return c;
}

function addWaveKill() {
    if (!waveActive || shopActive) return;
    waveKills++;
    waveKillCount++;
    totalKills++;
    let e1 = document.getElementById('waveKills'), e2 = document.getElementById('waveProgress');
    if (e1) e1.innerText = waveKills;
    if (e2) e2.style.width = `${(waveKills / waveTarget) * 100}%`;
    if (waveKills >= waveTarget) endWave();
}

function checkStartWaveButton() {
    let sb = document.getElementById('startWaveBtn');
    if (sb) sb.disabled = (bossEvent && !bossRelicClaimed) || (shopActive && bossShop.length > 0 && !bossRelicClaimed);
}

function startBossTimer() {
    bossTimer = 90;
    document.getElementById('bossTimerContainer').style.display = 'block';
    document.getElementById('bossTimer').innerText = bossTimer;
    document.getElementById('bossTimerProgress').style.width = '100%';
    if (bossTimerInterval) clearInterval(bossTimerInterval);
    bossTimerInterval = setInterval(() => {
        bossTimer--;
        document.getElementById('bossTimer').innerText = bossTimer;
        document.getElementById('bossTimerProgress').style.width = `${(bossTimer / 90) * 100}%`;
        if (bossTimer <= 0) {
            clearInterval(bossTimerInterval);
            bossTimerInterval = null;
            document.getElementById('bossTimerContainer').style.display = 'none';
            gameOver("💀 БОСС НЕ ПОБЕЖДЁН!");
        }
    }, 1000);
}

function stopBossTimer() {
    if (bossTimerInterval) { clearInterval(bossTimerInterval); bossTimerInterval = null }
    document.getElementById('bossTimerContainer').style.display = 'none';
}

function getStageName() {
    if (gameStage === 1) return '1 - ЛЕС';
    if (gameStage === 2) return '2 - ЗАМОК';
    return '3 - БЕСКОНЕЧНОСТЬ';
}

function endWave() {
    waveActive = false;
    shopActive = true;
    waveStarted = false;
    nukeUsedThisWave = false;
    hunterActive = false;
    updateNukeDisplay();
    if (spawnInterval) { clearInterval(spawnInterval); spawnInterval = null }
    clearIllusions();
    killHunter();
    stopBossTimer();
    bossEvent = false;
    clearBossSpawnedEnemies();
    let se = document.getElementById('waveStatus');
    if (se) { se.innerHTML = '🛒 ВЫБЕРИ АРТЕФАКТ'; se.style.background = '#1a4a1a' }
    currentShop = generateShop();
    renderArtifactShop();
    updateUI();
    checkStartWaveButton();
    for (let k in vampireTimers) clearInterval(vampireTimers[k]);
    vampireTimers = {};
}

function startNextWave() {
    if (waveActive && waveStarted) { showToast("❌ Сначала заверши волну!"); return }
    if (!bossRelicClaimed) { showToast("❌ Заберите реликвию!"); return }
    if (!gameActive || gameOverFlag) return;
    
    shopActive = false;
    currentShop = [];
    bossShop = [];
    bossRelicClaimed = true;
    bossEvent = false;
    nukeUsedThisWave = false;
    hunterActive = false;
    document.getElementById('artifactShop').innerHTML = '';
    currentWave++;
    waveStarted = true;
    waveTarget = 15 + (currentWave - 1) * 2;
    waveBonus = Math.min(200, (currentWave - 1) * 5);
    waveHpMult = Math.pow(1.12, currentWave - 1);
    waveKillCount = 0;
    slimeStage = 0;
    updateSpawnSpeed();
    updateNukeDisplay();
    
    let isBossEventWave = false;
    if (currentWave === 7 && gameStage === 1) {
        isBossEventWave = true;
        bossEvent = true;
        clearAllEnemies();
        spawnSlimeBoss();
        startBossTimer();
    } else if (currentWave === 8 && gameStage === 1) {
        gameStage = 2;
    } else if (currentWave === 14 && gameStage === 2) {
        isBossEventWave = true;
        bossEvent = true;
        clearAllEnemies();
        spawnTricksterBoss();
        startBossTimer();
    } else if (currentWave === 15 && gameStage === 2) {
        gameStage = 3;
    } else if (gameStage === 3 && currentWave % 7 === 0) {
        isBossEventWave = true;
        bossEvent = true;
        clearAllEnemies();
        if (Math.random() < 0.5) {
            spawnSlimeBoss();
            showToast("🟢 СЛИЗЕНЬ!");
        } else {
            spawnTricksterBoss();
            showToast("🎭 ТРИКСТЕР!");
        }
        startBossTimer();
    }
    
    let e1 = document.getElementById('waveNum'), e2 = document.getElementById('waveTarget'),
        e3 = document.getElementById('waveBonus'), e4 = document.getElementById('hpMult'),
        e5 = document.getElementById('waveStatus'), e6 = document.getElementById('startWaveBtn'),
        e7 = document.getElementById('stageDisplay');
    
    if (e1) e1.innerHTML = isBossEventWave ? `<span class="boss-wave">${currentWave} 👑 БОСС!</span>` : currentWave;
    if (e2) e2.innerText = waveTarget;
    if (e3) e3.innerText = waveBonus;
    if (e4) e4.innerText = waveHpMult.toFixed(2);
    if (e5) {
        e5.innerHTML = isBossEventWave ? '👑 БОСС! 90с!' : '⚔️ БОЙ';
        e5.style.background = isBossEventWave ? '#4a0000' : '#2a1a0a';
    }
    if (e6) e6.disabled = true;
    if (e7) e7.innerText = getStageName();
    
    waveKills = 0;
    waveActive = true;
    if (!isBossEventWave) {
        if (spawnInterval) clearInterval(spawnInterval);
        startSpawnLoop();
    }
    updateUI();
    showToast(`⚔️ ВОЛНА ${currentWave}!${isBossEventWave ? ' 👑 БОСС!' : ''}`);
}

function clearAllEnemies() {
    for (let i = 0; i < SIZE; i++) for (let j = 0; j < SIZE; j++) grid[i][j] = {type: 'empty'};
    clearIllusions();
    killHunter();
    for (let k in devilSpawnTimers) clearTimeout(devilSpawnTimers[k]);
    devilSpawnTimers = {};
    for (let k in vampireTimers) clearInterval(vampireTimers[k]);
    vampireTimers = {};
    bossSpawnedDevils = [];
}

function startSpawnLoop() {
    if (spawnInterval) clearInterval(spawnInterval);
    if (!gameActive || !waveActive || shopActive) return;
    spawnInterval = setInterval(() => {
        if (gameActive && waveActive && !shopActive && !bossEvent) addRandomEnemy();
    }, baseSpawnDelay * 1000);
}

function getCurrentHp(base) {
    return Math.max(1, Math.floor(base * waveHpMult));
}

function addRandomEnemy() {
    if (!gameActive || !waveActive || shopActive || bossEvent) return;
    let empty = [];
    for (let i = 0; i < SIZE; i++) for (let j = 0; j < SIZE; j++) if (grid[i] && grid[i][j] && grid[i][j].type === 'empty') empty.push([i, j]);
    if (empty.length === 0) return;
    
    let [x, y] = empty[Math.floor(Math.random() * empty.length)];
    let r = Math.random();
    let mbc = Math.min(0.20, 0.03 + currentWave * 0.006);
    
    if (gameStage === 1) {
        if (r < mbc * 0.5 && currentWave >= 3) {
            let hp = getCurrentHp(15);
            grid[x][y] = {type: 'troll', hp, maxHp: hp, hideHp: true};
            showTrollDialog();
            showToast("🧌 ТРОЛЛЬ!");
        } else if (r < mbc && currentWave >= 3) {
            spawnDevil(x, y);
        } else if (r < 0.12) {
            grid[x][y] = {type: 'mimic', hp: 1, maxHp: 1};
            showToast("🎁 МИМИК!");
        } else if (r < 0.22) {
            let hp = getCurrentHp(3), sh = getCurrentHp(2);
            grid[x][y] = {type: 'skeleton', hp, maxHp: hp, shield: sh, maxShield: sh};
        } else if (r < 0.35) {
            grid[x][y] = {type: 'elite', hp: getCurrentHp(4), maxHp: getCurrentHp(4)};
        } else {
            grid[x][y] = {type: 'bug', hp: 1, maxHp: 1};
        }
    } else if (gameStage === 2) {
        if (r < mbc * 0.4 && currentWave >= 10) {
            spawnHunter(x, y);
        } else if (r < mbc * 0.8 && currentWave >= 10) {
            spawnIllusionist(x, y);
            showToast("🎭 ИЛЛЮЗИОНИСТ!");
        } else if (r < mbc && currentWave >= 10) {
            let hp = getCurrentHp(18);
            grid[x][y] = {type: 'devil', hp, maxHp: hp};
            showToast("😈 ДЬЯВОЛ!");
            let tk = `${x},${y}`;
            let tid = setTimeout(() => {
                if (!gameActive || !grid[x] || !grid[x][y] || grid[x][y].type !== 'devil') return;
                let e = [];
                for (let i = 0; i < SIZE; i++) for (let j = 0; j < SIZE; j++) if (grid[i] && grid[i][j] && grid[i][j].type === 'empty') e.push([i, j]);
                let ts = Math.min(5, e.length);
                for (let k = 0; k < ts; k++) {
                    let idx = Math.floor(Math.random() * e.length);
                    let [ex, ey] = e[idx];
                    grid[ex][ey] = {type: 'elite', hp: getCurrentHp(4), maxHp: getCurrentHp(4)};
                    e.splice(idx, 1);
                }
                updateUI();
                delete devilSpawnTimers[tk];
            }, 3000);
            devilSpawnTimers[tk] = tid;
        } else if (r < 0.15) {
            let hp = getCurrentHp(5);
            grid[x][y] = {type: 'vampire', hp, maxHp: hp};
            let vk = `${x},${y}`;
            let vtid = setInterval(() => {
                if (!gameActive || !grid[x] || !grid[x][y] || grid[x][y].type !== 'vampire') {
                    clearInterval(vtid);
                    delete vampireTimers[vk];
                    return;
                }
                score = Math.max(0, score - 20);
                showToast("🧛 -20!");
                updateUI();
            }, 2000);
            vampireTimers[vk] = vtid;
        } else if (r < 0.28) {
            grid[x][y] = {type: 'screamer', hp: getCurrentHp(4), maxHp: getCurrentHp(4)};
        } else if (r < 0.40) {
            let hp = getCurrentHp(3), sh = getCurrentHp(2);
            grid[x][y] = {type: 'skeleton', hp, maxHp: hp, shield: sh, maxShield: sh};
        } else if (r < 0.53) {
            grid[x][y] = {type: 'elite', hp: getCurrentHp(4), maxHp: getCurrentHp(4)};
        } else {
            grid[x][y] = {type: 'bug', hp: 1, maxHp: 1};
        }
    } else {
        if (r < mbc * 0.25) {
            let hp = getCurrentHp(15);
            grid[x][y] = {type: 'troll', hp, maxHp: hp, hideHp: true};
            showTrollDialog();
            showToast("🧌 ТРОЛЛЬ!");
        } else if (r < mbc * 0.5) {
            spawnDevil(x, y);
        } else if (r < mbc * 0.7) {
            spawnHunter(x, y);
        } else if (r < mbc * 0.9) {
            spawnIllusionist(x, y);
            showToast("🎭 ИЛЛЮЗИОНИСТ!");
        } else if (r < mbc) {
            let hp = getCurrentHp(18);
            grid[x][y] = {type: 'devil', hp, maxHp: hp};
            showToast("😈 ДЬЯВОЛ!");
        } else if (r < 0.15) {
            grid[x][y] = {type: 'mimic', hp: 1, maxHp: 1};
            showToast("🎁 МИМИК!");
        } else if (r < 0.25) {
            let hp = getCurrentHp(5);
            grid[x][y] = {type: 'vampire', hp, maxHp: hp};
            let vk = `${x},${y}`;
            let vtid = setInterval(() => {
                if (!gameActive || !grid[x] || !grid[x][y] || grid[x][y].type !== 'vampire') {
                    clearInterval(vtid);
                    delete vampireTimers[vk];
                    return;
                }
                score = Math.max(0, score - 20);
                showToast("🧛 -20!");
                updateUI();
            }, 2000);
            vampireTimers[vk] = vtid;
        } else if (r < 0.35) {
            grid[x][y] = {type: 'screamer', hp: getCurrentHp(4), maxHp: getCurrentHp(4)};
        } else if (r < 0.48) {
            let hp = getCurrentHp(3), sh = getCurrentHp(2);
            grid[x][y] = {type: 'skeleton', hp, maxHp: hp, shield: sh, maxShield: sh};
        } else if (r < 0.60) {
            grid[x][y] = {type: 'elite', hp: getCurrentHp(4), maxHp: getCurrentHp(4)};
        } else {
            grid[x][y] = {type: 'bug', hp: 1, maxHp: 1};
        }
    }
    updateUI();
}

function useNuke() {
    if (bonuses.nukeCharges <= 0) { showToast("❌ Нет зарядов!"); return }
    if (!gameActive) return;
    if (bossEvent) { showToast("❌ Нельзя во время босса!"); return }
    if (nukeUsedThisWave) { showToast("❌ Ядерка уже использована в этой волне!"); return }
    
    bonuses.nukeCharges--;
    nukeUsedThisWave = true;
    updateNukeDisplay();
    
    let killed = 0;
    let totalPointsEarned = 0;
    
    let enemiesToKill = [];
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            if (grid[i] && grid[i][j] && grid[i][j].type !== 'empty' && 
                !grid[i][j].slimeType && !grid[i][j].isIllusion && !grid[i][j].bossSpawned &&
                grid[i][j].type !== 'trickster_boss') {
                enemiesToKill.push({i, j, cell: grid[i][j]});
            }
        }
    }
    
    for (let {i, j, cell} of enemiesToKill) {
        let points = 15;
        if (cell.type === 'elite') points = 35;
        else if (cell.type === 'devil') points = 100;
        else if (cell.type === 'troll') points = 80;
        else if (cell.type === 'skeleton') points = 30;
        else if (cell.type === 'vampire') points = 50;
        else if (cell.type === 'screamer') points = 40;
        else if (cell.type === 'hunter') points = 150;
        
        let pm = bonuses.scoreMult * bonuses.dragonHeart * (1 + waveBonus / 100);
        if (['devil', 'troll', 'hunter'].includes(cell.type)) {
            pm *= bonuses.devilBonus;
        }
        
        let earnedPoints = Math.floor(points * pm);
        score += earnedPoints;
        totalPointsEarned += earnedPoints;
        
        stats.bugsKilled++;
        killed++;
        addWaveKill();
        
        if (cell.type === 'hunter') {
            killHunter();
        }
        if (cell.type === 'vampire') {
            let vk = `${i},${j}`;
            if (vampireTimers[vk]) {
                clearInterval(vampireTimers[vk]);
                delete vampireTimers[vk];
            }
        }
        
        grid[i][j] = {type: 'empty'};
        
        if (Math.random() < bonuses.bonusGoldChance) {
            score += 100;
            let rect = document.querySelector(`#gameGrid .cell:nth-child(${i * SIZE + j + 1})`)?.getBoundingClientRect();
            if (rect) showDamageNumber(rect.left + rect.width / 2, rect.top + rect.height / 2, 100, 'bonus');
        }
    }
    
    clearIllusions();
    
    if (killed > 0) {
        showToast(`💣 ЯДЕРКА! -${killed} врагов! +${totalPointsEarned} очков`);
    } else {
        showToast("💣 ЯДЕРКА! Врагов не обнаружено");
    }
    
    updateUI();
}

function renderGrid() {
    let c = document.getElementById('gameGrid');
    if (!c) return;
    c.innerHTML = '';
    c.style.gridTemplateColumns = `repeat(${SIZE}, 54px)`;
    
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            let cell = (grid[i] && grid[i][j]) ? grid[i][j] : {type: 'empty'};
            let div = document.createElement('div');
            div.className = 'cell';
            
            if (cell.type === 'troll') div.classList.add('cell-stealth');
            
            let emoji = '⬛';
            if (cell.type === 'bug') emoji = '🐛';
            else if (cell.type === 'elite') emoji = '⭐🐛';
            else if (cell.type === 'devil') emoji = '😈';
            else if (cell.type === 'troll') emoji = '🧌';
            else if (cell.type === 'illusionist_real') emoji = '🎭❓';
            else if (cell.type === 'skeleton') emoji = '🧟';
            else if (cell.type === 'mimic') emoji = '🎁';
            else if (cell.type === 'vampire') emoji = '🧛';
            else if (cell.type === 'screamer') emoji = '👻';
            else if (cell.type === 'hunter') emoji = '🏹';
            else if (cell.type === 'slime_boss') emoji = '🟢';
            else if (cell.type === 'slime_medium') emoji = '🟢';
            else if (cell.type === 'slime_small_final') emoji = '🟢';
            else if (cell.type === 'trickster_boss') emoji = '🎭';
            
            let ih = `<div class="cell-emoji">${emoji}</div>`;
            
            if (cell.type === 'skeleton' && cell.shield > 0) {
                let sp = (cell.shield / cell.maxShield) * 100;
                ih += `<div class="shield-bar-container"><div class="shield-bar" style="width:${sp}%;"></div></div>`;
            }
            
            if (cell.type !== 'empty' && cell.maxHp && !cell.hideHp) {
                let hpP = (cell.hp / cell.maxHp) * 100;
                let poisonFuture = cell.poisonDamageTotal || 0;
                let remainingAfterPoison = Math.max(0, cell.hp - poisonFuture);
                let remainingP = (remainingAfterPoison / cell.maxHp) * 100;
                let hpCl = cell.type === 'troll' ? ' hp-bar-stealth' : '';
                ih += `<div class="hp-bar-container"><div class="hp-bar${hpCl}" style="width:${remainingP}%;"></div><div class="poison-bar" style="width:${hpP}%; left:${remainingP}%;"></div></div>`;
            }
            
            div.innerHTML = ih;
            div.addEventListener('click', ((x, y) => () => handleClick(x, y))(i, j));
            c.appendChild(div);
        }
    }
}

function getEnemyName(cell) {
    if (!cell) return 'враг';
    if (cell.type === 'bug') return '🐛 Гусеницу';
    if (cell.type === 'elite') return '⭐ Элит';
    if (cell.type === 'devil') return '😈 Дьявола';
    if (cell.type === 'troll') return '🧌 Тролля';
    if (cell.type === 'skeleton') return '🧟 Скелета';
    if (cell.type === 'vampire') return '🧛 Вампира';
    if (cell.type === 'screamer') return '👻 Скримера';
    if (cell.type === 'hunter') return '🏹 Охотника';
    if (cell.type === 'illusionist_real') return '🎭 Иллюзиониста';
    if (cell.type === 'trickster_boss') return '🎭 Трикстера';
    return 'врага';
}

// ИСПРАВЛЕНО: Газовое облако работает при убийстве
function spreadGasCloud(i, j, cell) {
    if (bonuses.gasCloud > 0 && cell.poisonDamageTotal > 0) {
        let gasDamage = cell.poisonDamageTotal * 0.5; // 50% урона яда переходит соседям
        let radius = 2; // Радиус 2x2
        
        // Ищем всех соседей в радиусе 2
        for (let dx = -radius; dx <= radius; dx++) {
            for (let dy = -radius; dy <= radius; dy++) {
                if (dx === 0 && dy === 0) continue;
                let nx = i + dx, ny = j + dy;
                if (nx >= 0 && nx < SIZE && ny >= 0 && ny < SIZE && 
                    grid[nx] && grid[nx][ny] && grid[nx][ny].type !== 'empty' && 
                    !grid[nx][ny].isIllusion) {
                    
                    // Применяем яд к соседу
                    if (!grid[nx][ny].poisonStacks) grid[nx][ny].poisonStacks = 0;
                    grid[nx][ny].poisonStacks = Math.min(bonuses.poisonStacks, (grid[nx][ny].poisonStacks || 0) + 1);
                    grid[nx][ny].poisonDamageTotal = (grid[nx][ny].poisonDamageTotal || 0) + gasDamage;
                    
                    // Запускаем тик яда для соседа
                    if (!grid[nx][ny].poisonTimer) schedulePoisonTick(nx, ny, grid[nx][ny]);
                }
            }
        }
        
        let rect = document.querySelector(`#gameGrid .cell:nth-child(${i * SIZE + j + 1})`)?.getBoundingClientRect();
        if (rect) showDamageNumber(rect.left + rect.width / 2, rect.top + rect.height / 2, gasDamage, 'poison');
    }
}

function handleDeath(i, j, cell) {
    let isSlime = !!cell.slimeType, isIllusion = !!cell.isIllusion;
    if (cell.isRealIllusionist) { clearIllusions(); showToast("🎭 Иллюзионист повержен!") }
    
    // ИСПРАВЛЕНО: Газовое облако срабатывает ДО очистки ячейки
    if (!isSlime && !isIllusion && cell.type !== 'trickster_boss') {
        spreadGasCloud(i, j, cell);
    }
    
    if (!isSlime && !isIllusion) {
        if (!cell.bossSpawned && cell.type !== 'trickster_boss') {
            let bp = 10;
            if (cell.type === 'elite') bp = 30;
            else if (cell.type === 'devil') bp = 100;
            else if (cell.type === 'troll') bp = 80;
            else if (cell.type === 'illusionist_real') bp = 120;
            else if (cell.type === 'skeleton') bp = 25;
            else if (cell.type === 'vampire') bp = 50;
            else if (cell.type === 'screamer') bp = 35;
            else if (cell.type === 'hunter') bp = 150;
            
            if (['devil', 'troll', 'illusionist_real', 'hunter'].includes(cell.type)) stats.bossKills++;
            
            if (cell.type === 'vampire') {
                for (let k in vampireTimers) {
                    let [kx, ky] = k.split(',');
                    if (+kx === i && +ky === j) { clearInterval(vampireTimers[k]); delete vampireTimers[k] }
                }
            }
            
            let pm = bonuses.scoreMult * bonuses.dragonHeart * (1 + waveBonus / 100);
            if (['devil', 'troll', 'illusionist_real', 'hunter'].includes(cell.type)) pm *= bonuses.devilBonus;
            score += Math.floor(bp * pm);
            stats.bugsKilled++;
            addWaveKill();
            
            if (Math.random() < bonuses.bonusGoldChance) {
                score += 100;
                let rect = document.querySelector(`#gameGrid .cell:nth-child(${i * SIZE + j + 1})`)?.getBoundingClientRect();
                if (rect) showDamageNumber(rect.left + rect.width / 2, rect.top + rect.height / 2, 100, 'bonus');
            }
        }
        
        if (bonuses.echoBlade && cell.hp < 0 && Math.random() < 0.1 && !cell.bossSpawned && cell.type !== 'trickster_boss') {
            let overkill = Math.abs(cell.hp);
            let targets = [];
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    if (dx === 0 && dy === 0) continue;
                    let nx = i + dx, ny = j + dy;
                    if (nx >= 0 && nx < SIZE && ny >= 0 && ny < SIZE && grid[nx] && grid[nx][ny] && grid[nx][ny].type !== 'empty' && !grid[nx][ny].bossSpawned) {
                        targets.push([nx, ny]);
                    }
                }
            }
            if (targets.length > 0) {
                let [tx, ty] = targets[Math.floor(Math.random() * targets.length)];
                grid[tx][ty].hp -= overkill;
                let rect = document.querySelector(`#gameGrid .cell:nth-child(${tx * SIZE + ty + 1})`)?.getBoundingClientRect();
                if (rect) showDamageNumber(rect.left + rect.width / 2, rect.top + rect.height / 2, overkill, 'chain');
                showToast(`⚡ Эхо клинка! +${Math.floor(overkill)} урона соседу!`);
                if (grid[tx][ty].hp <= 0) handleDeath(tx, ty, grid[tx][ty]);
            }
        }
        
        if (cell.type !== 'trickster_boss') {
            grid[i][j] = {type: 'empty'};
        }
    }
    
    if (cell.type === 'hunter') { killHunter(); showToast("🏹 Охотник повержен!") }
    if (cell.type === 'trickster_boss') {
        grid[i][j] = {type: 'empty'};
        checkTricksterDead();
    }
    
    if (isSlime) {
        grid[i][j] = {type: 'empty'};
        addWaveKill();
        stats.bugsKilled++;
        checkSlimeStageCleared();
    }
    
    let dmg = getTotalDamage();
    if (bonuses.chainLightning > 0 && !cell.bossSpawned && cell.type !== 'trickster_boss') {
        let ts = [];
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) continue;
                let nx = i + dx, ny = j + dy;
                if (nx >= 0 && nx < SIZE && ny >= 0 && ny < SIZE && grid[nx] && grid[nx][ny] && grid[nx][ny].type !== 'empty') ts.push([nx, ny]);
            }
        }
        for (let t = 0; t < Math.min(bonuses.chainLightning, ts.length); t++) {
            let [tx, ty] = ts[t];
            if (!grid[tx][ty].bossSpawned && grid[tx][ty].type !== 'trickster_boss') {
                grid[tx][ty].hp -= 3;
                let rect = document.querySelector(`#gameGrid .cell:nth-child(${tx * SIZE + ty + 1})`)?.getBoundingClientRect();
                if (rect) showDamageNumber(rect.left + rect.width / 2, rect.top + rect.height / 2, 3, 'chain');
                if (grid[tx][ty].hp <= 0) handleDeath(tx, ty, grid[tx][ty]);
            }
        }
    }
}

function handleClick(i, j) {
    if (!gameActive || gameOverFlag || !waveActive) return;
    if (shopActive) return;
    if (!canClick) { showToast("❌ Оглушены!"); return }
    if (!grid[i] || !grid[i][j] || grid[i][j].type === 'empty') return;
    
    let cell = grid[i][j];
    
    if (hunterActive && cell.type !== 'hunter') {
        showToast("🏹 Сначала убейте Охотника!");
        return;
    }
    
    stats.clicks++;
    
    if (bonuses.hairyHook && Math.random() < 0.2 && !cell.slimeType && !cell.isIllusion && !cell.bossSpawned && cell.type !== 'trickster_boss') {
        let tgts = [];
        for (let dx = -3; dx <= 3; dx++) {
            for (let dy = -3; dy <= 3; dy++) {
                if (dx === 0 && dy === 0) continue;
                let nx = i + dx, ny = j + dy;
                if (nx >= 0 && nx < SIZE && ny >= 0 && ny < SIZE && grid[nx] && grid[nx][ny] && grid[nx][ny].type !== 'empty' && !grid[nx][ny].slimeType && !grid[nx][ny].isIllusion && !grid[nx][ny].bossSpawned && grid[nx][ny].type !== 'trickster_boss') {
                    tgts.push([nx, ny]);
                }
            }
        }
        if (tgts.length > 0) {
            let [tx, ty] = tgts[Math.floor(Math.random() * tgts.length)];
            let movedEnemy = grid[tx][ty];
            
            let nearbyEmpty = [];
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    if (dx === 0 && dy === 0) continue;
                    let nx = i + dx, ny = j + dy;
                    if (nx >= 0 && nx < SIZE && ny >= 0 && ny < SIZE && grid[nx] && grid[nx][ny] && grid[nx][ny].type === 'empty') {
                        nearbyEmpty.push([nx, ny]);
                    }
                }
            }
            
            if (nearbyEmpty.length > 0) {
                let [ex, ey] = nearbyEmpty[Math.floor(Math.random() * nearbyEmpty.length)];
                grid[ex][ey] = movedEnemy;
                grid[tx][ty] = {type: 'empty'};
                let rect = document.querySelector(`#gameGrid .cell:nth-child(${ex * SIZE + ey + 1})`)?.getBoundingClientRect();
                if (rect) showDamageNumber(rect.left + rect.width / 2, rect.top + rect.height / 2, 0, 'chain');
                showToast(`🪝 ${getEnemyName(movedEnemy)} притянут!`);
            }
            updateUI();
            return;
        }
    }
    
    if (cell.type === 'screamer') {
        document.body.style.background = '#f00';
        setTimeout(() => document.body.style.background = '', 100);
        setTimeout(() => document.body.style.background = '#f00', 150);
        setTimeout(() => document.body.style.background = '', 250);
    }
    
    // ИСПРАВЛЕНО: Трикстер спавнит 3 мини-босса при промахе
    if (cell.type === 'trickster_boss' && cell.missChance) {
        if (Math.random() < cell.missChance) {
            let rect = document.querySelector(`#gameGrid .cell:nth-child(${i * SIZE + j + 1})`)?.getBoundingClientRect();
            if (rect) showDamageNumber(rect.left + rect.width / 2, rect.top + rect.height / 2, 0, 'miss');
            teleportTrickster(i, j, cell);
            updateUI();
            return;
        }
    }
    
    if (Math.random() > bonuses.accuracy) {
        let rect = document.querySelector(`#gameGrid .cell:nth-child(${i * SIZE + j + 1})`)?.getBoundingClientRect();
        if (rect) showDamageNumber(rect.left + rect.width / 2, rect.top + rect.height / 2, 0, 'miss');
        updateUI();
        return;
    }
    
    if (cell.isIllusion) {
        grid[i][j] = {type: 'empty'};
        illusions = illusions.filter(il => il.x !== i || il.y !== j);
        updateUI();
        return;
    }
    
    let dmg = getTotalDamage();
    if (cell.maxHp && cell.hp / cell.maxHp < 0.3) dmg = Math.floor(dmg * bonuses.executeMultiplier);
    if (Math.random() < bonuses.doubleDmgChance) dmg *= 2;
    let cc = bonuses.critChance + bonuses.cursedCrit;
    let isCrit = Math.random() < cc;
    if (isCrit) dmg = Math.floor(dmg * bonuses.critDamage);
    
    if (bonuses.crystalCannon && Math.random() < 0.05) {
        canClick = false;
        clickBlockTimeout = setTimeout(() => { canClick = true }, 3000);
        showToast("💎 Самооглушение! 3с!");
    }
    
    let rect = document.querySelector(`#gameGrid .cell:nth-child(${i * SIZE + j + 1})`)?.getBoundingClientRect();
    
    if (cell.type === 'mimic') {
        score = Math.max(0, score - 50);
        grid[i][j] = {type: 'empty'};
        showToast("🎁 МИМИК! -50!");
        updateUI();
        return;
    }
    
    if (cell.type === 'skeleton' && cell.shield > 0) {
        let sd = Math.min(dmg, cell.shield);
        cell.shield -= sd;
        if (rect) showDamageNumber(rect.left + rect.width / 2, rect.top + rect.height / 2, sd, 'shield');
        updateUI();
        return;
    }
    
    if (rect) showDamageNumber(rect.left + rect.width / 2, rect.top + rect.height / 2, dmg, isCrit ? 'crit' : 'normal');
    cell.hp -= dmg;
    
    if (bonuses.poisonDamage > 0 && !cell.isIllusion) {
        if (!cell.poisonStacks) cell.poisonStacks = 0;
        cell.poisonStacks = Math.min(bonuses.poisonStacks, (cell.poisonStacks || 0) + 1);
        cell.poisonDamageTotal = (cell.poisonDamageTotal || 0) + bonuses.poisonDamage;
        if (!cell.poisonTimer) schedulePoisonTick(i, j, cell);
    }
    
    if (cell.hp <= 0) handleDeath(i, j, cell);
    updateUI();
}

function updateUI() {
    let se = document.getElementById('score');
    if (se) se.innerText = Math.floor(score);
    let be = document.getElementById('bugCounter');
    if (be) be.innerText = countBugs();
    updateMaxBugs();
    
    let ce = document.getElementById('statClicks');
    if (ce) ce.innerText = stats.clicks;
    let bue = document.getElementById('statBugs');
    if (bue) bue.innerText = stats.bugsKilled;
    let bse = document.getElementById('bossKills');
    if (bse) bse.innerText = stats.bossKills;
    let ge = document.getElementById('gachaCount');
    if (ge) ge.innerText = stats.gachaCount;
    
    let s2 = document.getElementById('stageDisplay');
    if (s2) s2.innerText = getStageName();
    
    renderGrid();
    checkStartWaveButton();
    updateNukeDisplay();
    
    if (countBugs() >= maxBugs && gameActive && !gameOverFlag && waveActive && !shopActive && !bossEvent) {
        gameActive = false;
        if (spawnInterval) clearInterval(spawnInterval);
        if (bonuses.phoenixLife && !bonuses.phoenixUsed) {
            bonuses.phoenixUsed = true;
            bonuses.phoenixLife = false;
            let cl = 0, tc = Math.floor(countBugs() / 2);
            for (let i = 0; i < SIZE && cl < tc; i++) {
                for (let j = 0; j < SIZE && cl < tc; j++) {
                    if (grid[i] && grid[i][j] && grid[i][j].type !== 'empty') {
                        grid[i][j] = {type: 'empty'};
                        cl++;
                    }
                }
            }
            gameActive = true;
            if (waveActive && !shopActive) startSpawnLoop();
            showToast("🔥 ВОСКРЕШЕНИЕ!");
            updateUI();
        } else gameOver("💀 ПРОД УПАЛ!");
    }
}

setInterval(() => {
    if (gameActive && !gameOverFlag && !shopActive) {
        let te = document.getElementById('gameTime');
        if (te) te.innerText = Math.floor((Date.now() - gameStartTime) / 1000);
    }
}, 1000);

function startGame() {
    document.getElementById('mainMenu').classList.add('hidden');
    document.getElementById('gameContainer').classList.remove('hidden');
    resetGame();
}

function goToMenu() {
    gameActive = false;
    if (spawnInterval) clearInterval(spawnInterval);
    stopBossTimer();
    clearIllusions();
    killHunter();
    for (let k in devilSpawnTimers) clearTimeout(devilSpawnTimers[k]);
    for (let k in vampireTimers) clearInterval(vampireTimers[k]);
    if (plagueAuraInterval) clearInterval(plagueAuraInterval);
    document.getElementById('gameContainer').classList.add('hidden');
    document.getElementById('mainMenu').classList.remove('hidden');
}

function resetGame() {
    gameActive = true;
    waveActive = true;
    shopActive = false;
    gameOverFlag = false;
    waveStarted = false;
    bossEvent = false;
    bossRelicClaimed = true;
    slimeStage = 0;
    gameStage = 1;
    slimeBossHpMult = 1;
    tricksterBossHpMult = 1;
    nukeUsedThisWave = false;
    hunterActive = false;
    
    score = 500;
    baseSpawnDelay = 1.8;
    maxBugs = 15;
    currentWave = 1;
    waveKills = 0;
    waveKillCount = 0;
    totalKills = 0;
    purchaseCount = 0;
    waveTarget = 15;
    waveBonus = 0;
    waveHpMult = 1.0;
    totalSpins = 0;
    currentShop = [];
    bossShop = [];
    artifacts = [];
    artifactCounts = {};
    
    clearIllusions();
    killHunter();
    stopBossTimer();
    if (plagueAuraInterval) clearInterval(plagueAuraInterval);
    for (let k in devilSpawnTimers) clearTimeout(devilSpawnTimers[k]);
    devilSpawnTimers = {};
    for (let k in vampireTimers) clearInterval(vampireTimers[k]);
    vampireTimers = {};
    canClick = true;
    bossSpawnedDevils = [];
    
    stats = {clicks: 0, bugsKilled: 0, bossKills: 0, gachaCount: 0};
    bonuses = {
        damage: 0, critChance: 0.05, critDamage: 1.5, scoreMult: 1.0, devilBonus: 1.0, limit: 0,
        speedReduction: 0, spawnRateIncrease: 0, nukeCharges: 1, berserkStacks: 0, chainLightning: 0,
        accuracy: 1.0, phoenixLife: false, phoenixUsed: false, dragonHeart: 1.0, anvilDamage: 0,
        cursedDamage: 0, cursedCrit: 0, poisonDamage: 0, poisonStacks: 1, poisonDelay: 2000,
        luck: 0, doubleDmgChance: 0, vengeanceSpark: 0, stardust: 0, echoBlade: false,
        crystalCannon: false, gasCloud: 0, gasCloudRadius: 1, gasCloudDmgFalloff: 0.5,
        plagueAura: false, plagueAuraDamage: 0, hairyHook: false, executeMultiplier: 1.0, bonusGoldChance: 0
    };
    
    gameStartTime = Date.now();
    updateNukeDisplay();
    updateSlotPrices();
    updateSpawnSpeed();
    
    grid = [];
    for (let i = 0; i < SIZE; i++) {
        grid[i] = [];
        for (let j = 0; j < SIZE; j++) grid[i][j] = {type: 'empty'};
    }
    
    for (let k = 0; k < 3; k++) {
        let e = [];
        for (let i = 0; i < SIZE; i++) for (let j = 0; j < SIZE; j++) if (grid[i][j].type === 'empty') e.push([i, j]);
        if (e.length) {
            let [x, y] = e[Math.floor(Math.random() * e.length)];
            grid[x][y] = {type: 'bug', hp: 1, maxHp: 1};
        }
    }
    
    if (spawnInterval) clearInterval(spawnInterval);
    startSpawnLoop();
    
    document.getElementById('waveNum').innerText = currentWave;
    document.getElementById('waveTarget').innerText = waveTarget;
    document.getElementById('waveKills').innerText = waveKills;
    document.getElementById('waveProgress').style.width = '0%';
    document.getElementById('waveBonus').innerText = waveBonus;
    document.getElementById('hpMult').innerText = waveHpMult.toFixed(2);
    document.getElementById('spawnSpeed').innerText = baseSpawnDelay.toFixed(1);
    document.getElementById('waveStatus').innerHTML = '⚔️ БОЙ';
    document.getElementById('waveStatus').style.background = '#2a1a0a';
    document.getElementById('startWaveBtn').disabled = true;
    document.getElementById('artifactShop').innerHTML = '';
    document.getElementById('bossTimerContainer').style.display = 'none';
    document.getElementById('nukeStatusContainer').style.display = 'none';
    document.getElementById('stageDisplay').innerText = getStageName();
    document.getElementById('poisonDmg').innerText = 0;
    
    updateUI();
    renderStats();
    showToast("⚔️ НОВАЯ ИГРА! Стадия 1 - ЛЕС");
}

// ==================== МОД-МЕНЮ ====================
let modMenuOpen = false;

function createModMenu() {
    let modMenu = document.createElement('div');
    modMenu.id = 'modMenu';
    modMenu.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.95);
        border: 3px solid #ffaa00;
        border-radius: 20px;
        padding: 20px;
        z-index: 3000;
        color: #ffaa66;
        font-family: 'Courier New', monospace;
        min-width: 300px;
        display: none;
        box-shadow: 0 0 50px rgba(255,170,0,0.5);
        animation: fadeIn 0.3s ease;
    `;
    
    modMenu.innerHTML = `
        <h3 style="color:#ffaa00;text-align:center;margin-top:0;">⚡ МОД-МЕНЮ ⚡</h3>
        <div style="margin:15px 0;">
            <label style="display:block;margin-bottom:5px;">💰 Добавить очки:</label>
            <div style="display:flex;gap:5px;">
                <input type="number" id="modScoreInput" value="1000" style="flex:1;background:#1a1a2a;color:#ffaa66;border:1px solid #ff6600;border-radius:10px;padding:5px;font-family:monospace;">
                <button id="modAddScoreBtn" style="width:auto;padding:5px 15px;">Добавить</button>
            </div>
        </div>
        <div style="margin:15px 0;">
            <label style="display:block;margin-bottom:5px;">🌊 Перейти на волну:</label>
            <div style="display:flex;gap:5px;">
                <input type="number" id="modWaveInput" value="${currentWave}" min="1" max="999" style="flex:1;background:#1a1a2a;color:#ffaa66;border:1px solid #ff6600;border-radius:10px;padding:5px;font-family:monospace;">
                <button id="modSetWaveBtn" style="width:auto;padding:5px 15px;">Перейти</button>
            </div>
        </div>
        <div style="margin:15px 0;">
            <label style="display:block;margin-bottom:5px;">📊 Стадия:</label>
            <select id="modStageSelect" style="width:100%;background:#1a1a2a;color:#ffaa66;border:1px solid #ff6600;border-radius:10px;padding:5px;font-family:monospace;">
                <option value="1" ${gameStage===1?'selected':''}>1 - ЛЕС</option>
                <option value="2" ${gameStage===2?'selected':''}>2 - ЗАМОК</option>
                <option value="3" ${gameStage===3?'selected':''}>3 - БЕСКОНЕЧНОСТЬ</option>
            </select>
        </div>
        <div style="margin:15px 0;">
            <button id="modKillAllBtn" style="background:#ff0000;">💀 Убить всех врагов</button>
        </div>
        <div style="margin:15px 0;">
            <button id="modGodModeBtn" style="background:#44aa44;">🛡️ Режим бога (100500 HP врагам)</button>
        </div>
        <div style="margin:15px 0;">
            <button id="modResetBonusesBtn" style="background:#ff6600;">🔄 Сбросить бонусы</button>
        </div>
        <div style="text-align:center;margin-top:20px;">
            <button id="modCloseBtn" style="background:#333;width:auto;padding:5px 30px;">Закрыть</button>
        </div>
    `;
    
    document.body.appendChild(modMenu);
    
    let modToggle = document.createElement('button');
    modToggle.id = 'modToggleBtn';
    modToggle.textContent = '⚡';
    modToggle.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(0,0,0,0.8);
        border: 2px solid #ffaa00;
        color: #ffaa00;
        font-size: 20px;
        cursor: pointer;
        z-index: 2999;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 10px rgba(255,170,0,0.3);
    `;
    modToggle.onclick = toggleModMenu;
    document.body.appendChild(modToggle);
    
    document.getElementById('modAddScoreBtn').onclick = () => {
        let val = parseInt(document.getElementById('modScoreInput').value) || 0;
        score += val;
        showToast(`💰 +${val} очков!`);
        updateUI();
    };
    
    document.getElementById('modSetWaveBtn').onclick = () => {
        let val = parseInt(document.getElementById('modWaveInput').value) || 1;
        if (val < 1) val = 1;
        currentWave = val - 1;
        startNextWave();
        toggleModMenu();
        showToast(`🌊 Переход на волну ${val}!`);
    };
    
    document.getElementById('modStageSelect').onchange = (e) => {
        gameStage = parseInt(e.target.value);
        showToast(`📊 Стадия изменена на ${getStageName()}!`);
        updateUI();
    };
    
    document.getElementById('modKillAllBtn').onclick = () => {
        let killed = 0;
        for (let i = 0; i < SIZE; i++) {
            for (let j = 0; j < SIZE; j++) {
                if (grid[i] && grid[i][j] && grid[i][j].type !== 'empty') {
                    grid[i][j] = {type: 'empty'};
                    killed++;
                }
            }
        }
        clearIllusions();
        killHunter();
        showToast(`💀 Убито ${killed} врагов!`);
        updateUI();
    };
    
    document.getElementById('modGodModeBtn').onclick = () => {
        for (let i = 0; i < SIZE; i++) {
            for (let j = 0; j < SIZE; j++) {
                if (grid[i] && grid[i][j] && grid[i][j].type !== 'empty') {
                    grid[i][j].hp = 100500;
                    grid[i][j].maxHp = 100500;
                }
            }
        }
        showToast("🛡️ Режим бога активирован! У всех врагов 100500 HP!");
        updateUI();
    };
    
    document.getElementById('modResetBonusesBtn').onclick = () => {
        bonuses = {
            damage: 0, critChance: 0.05, critDamage: 1.5, scoreMult: 1.0, devilBonus: 1.0, limit: 0,
            speedReduction: 0, spawnRateIncrease: 0, nukeCharges: 1, berserkStacks: 0, chainLightning: 0,
            accuracy: 1.0, phoenixLife: false, phoenixUsed: false, dragonHeart: 1.0, anvilDamage: 0,
            cursedDamage: 0, cursedCrit: 0, poisonDamage: 0, poisonStacks: 1, poisonDelay: 2000,
            luck: 0, doubleDmgChance: 0, vengeanceSpark: 0, stardust: 0, echoBlade: false,
            crystalCannon: false, gasCloud: 0, gasCloudRadius: 1, gasCloudDmgFalloff: 0.5,
            plagueAura: false, plagueAuraDamage: 0, hairyHook: false, executeMultiplier: 1.0, bonusGoldChance: 0
        };
        artifacts = [];
        artifactCounts = {};
        updateSpawnSpeed();
        updateNukeDisplay();
        renderStats();
        showToast("🔄 Все бонусы сброшены!");
    };
    
    document.getElementById('modCloseBtn').onclick = toggleModMenu;
}

function toggleModMenu() {
    let modMenu = document.getElementById('modMenu');
    if (modMenu) {
        modMenuOpen = !modMenuOpen;
        modMenu.style.display = modMenuOpen ? 'block' : 'none';
        
        if (modMenuOpen) {
            document.getElementById('modWaveInput').value = currentWave;
            document.getElementById('modStageSelect').value = gameStage;
        }
    }
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'F1') {
        e.preventDefault();
        toggleModMenu();
    } else if (e.key === 'Escape' && modMenuOpen) {
        toggleModMenu();
    }
});

createModMenu();

document.addEventListener('mousemove', (e) => {
    window.mouseX = e.clientX;
    window.mouseY = e.clientY;
});

document.getElementById('resetBtn').onclick = goToMenu;
document.getElementById('startWaveBtn').onclick = startNextWave;
document.getElementById('nukeBtn').onclick = useNuke;

document.getElementById('tabArtifactBtn').onclick = () => {
    document.getElementById('artifactPanel').style.display = 'block';
    document.getElementById('gachaPanel').style.display = 'none';
    document.getElementById('statsPanel').style.display = 'none';
    document.getElementById('tabArtifactBtn').classList.add('active');
    document.getElementById('tabGachaBtn').classList.remove('active');
    document.getElementById('tabStatsBtn').classList.remove('active');
    renderArtifactShop();
};

document.getElementById('tabGachaBtn').onclick = () => {
    document.getElementById('artifactPanel').style.display = 'none';
    document.getElementById('gachaPanel').style.display = 'block';
    document.getElementById('statsPanel').style.display = 'none';
    document.getElementById('tabGachaBtn').classList.add('active');
    document.getElementById('tabArtifactBtn').classList.remove('active');
    document.getElementById('tabStatsBtn').classList.remove('active');
};

document.getElementById('tabStatsBtn').onclick = () => {
    document.getElementById('artifactPanel').style.display = 'none';
    document.getElementById('gachaPanel').style.display = 'none';
    document.getElementById('statsPanel').style.display = 'block';
    document.getElementById('tabStatsBtn').classList.add('active');
    document.getElementById('tabArtifactBtn').classList.remove('active');
    document.getElementById('tabGachaBtn').classList.remove('active');
    renderStats();
};

document.getElementById('slot1Btn').onclick = () => spinSlot(1);
document.getElementById('slot3Btn').onclick = () => spinSlot(3);
document.getElementById('slot5Btn').onclick = () => spinSlot(5);

document.getElementById('mainMenu').classList.remove('hidden');
document.getElementById('gameContainer').classList.add('hidden');


