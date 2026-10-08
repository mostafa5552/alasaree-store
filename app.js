/* ============================================
   🎮 متجر عالسريع - DESHA.245
   app.js - الجزء 1: الأساسيات
   ============================================ */

// ============ مفاتيح LocalStorage ============
const STORAGE_KEYS = {
    GAMES: 'alasree_games',
    PATCHES: 'alasree_patches',
    USER: 'alasree_user',
    DEV: 'alasree_dev',
    THEME: 'alasree_theme',
    FAVORITES: 'alasree_favorites',
    RATINGS: 'alasree_ratings',
    DOWNLOADS: 'alasree_downloads'
};

// ============ بيانات المطور (ثابتة) ============
const DEV_ACCOUNT = {
    email: 'sasamahmoud2452012@gmail.com',
    password: 'mostafa2452012',
    name: 'DESHA.245'
};

// ============ أسماء الأقسام ============
const CATEGORY_NAMES = {
    action: 'أكشن',
    adventure: 'مغامرات',
    sports: 'رياضة',
    puzzle: 'ألغاز',
    strategy: 'استراتيجية',
    racing: 'سباق',
    other: 'أخرى'
};

// ============ الحالة العامة ============
let currentUser = null;
let isDeveloper = false;
let currentPage = 'home';
let currentGameId = null;

// ============ دوال LocalStorage ============

function getFromStorage(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
        console.error('خطأ في قراءة البيانات:', e);
        return defaultValue;
    }
}

function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (e) {
        console.error('خطأ في حفظ البيانات:', e);
        return false;
    }
}

// ============ الألعاب ============

function getGames() {
    return getFromStorage(STORAGE_KEYS.GAMES, []);
}

function saveGames(games) {
    return saveToStorage(STORAGE_KEYS.GAMES, games);
}

// ============ الباتشات ============

function getPatches() {
    return getFromStorage(STORAGE_KEYS.PATCHES, []);
}

function savePatches(patches) {
    return saveToStorage(STORAGE_KEYS.PATCHES, patches);
}

// ============ المستخدم ============

function getUser() {
    return getFromStorage(STORAGE_KEYS.USER, null);
}

function saveUser(user) {
    if (user) {
        saveToStorage(STORAGE_KEYS.USER, user);
        currentUser = user;
    } else {
        localStorage.removeItem(STORAGE_KEYS.USER);
        currentUser = null;
    }
    updateUserButton();
}

// ============ المطور ============

function getDev() {
    return getFromStorage(STORAGE_KEYS.DEV, null);
}

function saveDev(dev) {
    if (dev) {
        saveToStorage(STORAGE_KEYS.DEV, dev);
        isDeveloper = true;
    } else {
        localStorage.removeItem(STORAGE_KEYS.DEV);
        isDeveloper = false;
    }
    updateDevPanelLink();
}

// ============ الوضع الليلي ============

function getTheme() {
    return getFromStorage(STORAGE_KEYS.THEME, 'light');
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    saveToStorage(STORAGE_KEYS.THEME, theme);
    updateThemeIcon(theme);
}

function toggleTheme() {
    const current = getTheme();
    const newTheme = current === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    showToast(newTheme === 'dark' ? '🌙 الوضع الليلي' : '☀️ الوضع النهاري', 'success');
}

function updateThemeIcon(theme) {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    const icon = btn.querySelector('i');
    if (icon) {
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// ============ التنقل بين الصفحات ============

function navigateTo(page) {
    // إخفاء كل الصفحات
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // إظهار الصفحة المطلوبة
    const target = document.getElementById('page-' + page);
    if (target) {
        target.classList.add('active');
        currentPage = page;
    }
    
    // تحديث الروابط النشطة
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.page === page);
    });
    
    // إغلاق قائمة الموبايل
    const navLinks = document.getElementById('navLinks');
    if (navLinks) navLinks.classList.remove('open');
    
    // تحديث محتوى الصفحات
    switch (page) {
        case 'home':
            renderHomePage();
            break;
        case 'games':
            renderGamesPage();
            break;
        case 'patches':
            renderPatchesPage();
            break;
        case 'favorites':
            renderFavoritesPage();
            break;
        case 'devpanel':
            if (!isDeveloper) {
                showToast('يجب تسجيل دخول المطور أولاً', 'error');
                navigateTo('home');
                return;
            }
            renderDevPanel();
            break;
    }
    
    // تحديث الرابط في الـ URL (اختياري)
    history.replaceState(null, '', '#' + page);
    
    // التمرير للأعلى
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============ قائمة الموبايل ============

function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    if (navLinks) navLinks.classList.toggle('open');
}

// إغلاق القائمة عند الضغط خارجها
document.addEventListener('click', function(e) {
    const navLinks = document.getElementById('navLinks');
    const menuBtn = document.getElementById('menuToggle');
    if (!navLinks || !menuBtn) return;
    
    if (!navLinks.contains(e.target) && !menuBtn.contains(e.target)) {
        navLinks.classList.remove('open');
    }
});

// ============ الإشعارات (Toast) ============

function showToast(message, type = 'success', duration = 3500) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    toast.innerHTML = `
        <i class="fas ${icons[type] || icons.info}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 400);
    }, duration);
}

// ============ Modal للتأكيد ============

let confirmCallback = null;

function showConfirm(title, message, onYes) {
    const modal = document.getElementById('confirmModal');
    if (!modal) return;
    
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    confirmCallback = onYes;
    modal.classList.add('active');
}

function closeConfirm() {
    const modal = document.getElementById('confirmModal');
    if (modal) modal.classList.remove('active');
    confirmCallback = null;
}

function setupConfirmButtons() {
    const yesBtn = document.getElementById('confirmYes');
    const noBtn = document.getElementById('confirmNo');
    
    if (yesBtn) {
        yesBtn.onclick = () => {
            if (typeof confirmCallback === 'function') confirmCallback();
            closeConfirm();
        };
    }
    if (noBtn) {
        noBtn.onclick = closeConfirm;
    }
}

// ============ دوال مساعدة ============

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 30) return `منذ ${diffDays} يوم`;
    
    return date.toLocaleDateString('ar-EG');
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function extractPackageFromObb(obbUrl) {
    if (!obbUrl) return null;
    // مثال: main.1.com.example.game.obb → com.example.game
    const match = obbUrl.match(/\.\d+\.([a-z0-9_.]+)\.obb$/i);
    return match ? match[1] : null;
}

// ============ تحديث زر المستخدم ============

function updateUserButton() {
    const btn = document.getElementById('userBtn');
    if (!btn) return;
    
    if (currentUser || isDeveloper) {
        btn.classList.add('logged-in');
        btn.title = isDeveloper ? 'DESHA.245' : currentUser.name;
    } else {
        btn.classList.remove('logged-in');
        btn.title = 'تسجيل الدخول';
    }
}

// ============ تحديث رابط لوحة المطور ============

function updateDevPanelLink() {
    const link = document.getElementById('devPanelLink');
    if (link) {
        link.style.display = isDeveloper ? 'block' : 'none';
    }
}

// ============ تبديل تبويبات لوحة المطور ============

function switchTab(tabId) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    const tab = document.querySelector(`[data-tab="${tabId}"]`);
    const content = document.getElementById(tabId);
    
    if (tab) tab.classList.add('active');
    if (content) content.classList.add('active');
    
    // تحديث القوائم عند فتح التبويب
    if (tabId === 'tab-manage-games') renderManageGames();
    if (tabId === 'tab-manage-patches') renderManagePatches();
}

// ============ حساب الإحصائيات ============

function getStats() {
    const games = getGames();
    const patches = getPatches();
    const downloads = getFromStorage(STORAGE_KEYS.DOWNLOADS, 0);
    const users = getFromStorage('alasree_users_count', 0);
    
    return {
        games: games.length,
        patches: patches.length,
        downloads: downloads,
        users: Math.max(users, games.length > 0 ? 1 : 0)
    };
}

function incrementDownloads() {
    const current = getFromStorage(STORAGE_KEYS.DOWNLOADS, 0);
    saveToStorage(STORAGE_KEYS.DOWNLOADS, current + 1);
}

// ============ التهيئة الأولية ============

document.addEventListener('DOMContentLoaded', function() {
    // تحميل الوضع الليلي
    setTheme(getTheme());
    
    // تحميل المستخدم
    currentUser = getUser();
    
    // تحميل المطور
    isDeveloper = !!getDev();
    
    // تحديث الأزرار
    updateUserButton();
    updateDevPanelLink();
    
    // ربط زر الوضع الليلي
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
    
    // ربط زر القائمة
    const menuBtn = document.getElementById('menuToggle');
    if (menuBtn) menuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleMenu();
    });
    
    // إعداد أزرار التأكيد
    setupConfirmButtons();
    
    // ربط بحث الألعاب
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
    
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFilters);
    }
    
    const sortFilter = document.getElementById('sortFilter');
    if (sortFilter) {
        sortFilter.addEventListener('change', applyFilters);
    }
    
    // فتح الصفحة من الـ URL
    const hash = window.location.hash.replace('#', '');
    if (hash && document.getElementById('page-' + hash)) {
        navigateTo(hash);
    } else {
        renderHomePage();
    }
    
    console.log('%c🎮 عالسريع - DESHA.245', 'color: #00d4ff; font-size: 20px; font-weight: bold;');
    console.log('%cمرحباً بك في لوحة التحكم', 'color: #ffd700; font-size: 14px;');
});/* ============================================
   🎮 متجر عالسريع - DESHA.245
   app.js - الجزء 2: التسجيل + عرض الألعاب
   ============================================ */

// ============ فتح/غلق نافذة التسجيل ============

function openAuthModal() {
    // لو المستخدم مسجل بالفعل، نوديه لصفحة البروفايل أو نسأله
    if (isDeveloper) {
        showConfirm('تسجيل خروج', 'هل تريد تسجيل الخروج من حساب المطور؟', () => {
            saveDev(null);
            showToast('تم تسجيل خروج المطور', 'success');
            navigateTo('home');
        });
        return;
    }
    
    if (currentUser) {
        showConfirm('تسجيل خروج', `هل تريد تسجيل الخروج يا ${currentUser.name}؟`, () => {
            saveUser(null);
            showToast('تم تسجيل الخروج', 'success');
        });
        return;
    }
    
    const modal = document.getElementById('authModal');
    if (modal) modal.classList.add('active');
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) modal.classList.remove('active');
}

// إغلاق عند الضغط خارج النافذة
document.addEventListener('click', function(e) {
    const modal = document.getElementById('authModal');
    if (modal && e.target === modal) closeAuthModal();
});

// ============ تبديل تبويبات التسجيل ============

function switchAuthTab(type) {
    const userTab = document.getElementById('tabUserLogin');
    const devTab = document.getElementById('tabDevLogin');
    const userContent = document.getElementById('authUser');
    const devContent = document.getElementById('authDev');
    
    if (type === 'user') {
        userTab.classList.add('active');
        devTab.classList.remove('active');
        userContent.classList.add('active');
        devContent.classList.remove('active');
    } else {
        devTab.classList.add('active');
        userTab.classList.remove('active');
        devContent.classList.add('active');
        userContent.classList.remove('active');
    }
}

// ============ تسجيل المستخدم العادي ============

function handleUserLogin(event) {
    event.preventDefault();
    
    const nameInput = document.getElementById('userNameInput');
    const name = nameInput.value.trim();
    
    if (!name) {
        showToast('اكتب اسمك أولاً', 'error');
        return;
    }
    
    if (name.length < 2) {
        showToast('الاسم قصير جداً', 'error');
        return;
    }
    
    const user = {
        name: name,
        joinedAt: Date.now(),
        isGuest: false
    };
    
    saveUser(user);
    closeAuthModal();
    showToast(`أهلاً بك يا ${name} 👋`, 'success');
    
    // تحديث عدد المستخدمين
    const count = getFromStorage('alasree_users_count', 0);
    saveToStorage('alasree_users_count', count + 1);
    
    // إعادة تحميل الصفحة الحالية
    navigateTo(currentPage);
    
    // تفريغ الحقل
    nameInput.value = '';
}

// ============ الدخول كضيف ============

function continueAsGuest() {
    const guest = {
        name: 'ضيف',
        joinedAt: Date.now(),
        isGuest: true
    };
    
    saveUser(guest);
    closeAuthModal();
    showToast('أهلاً بك كضيف', 'info');
    navigateTo(currentPage);
}

// ============ تسجيل دخول المطور ============

function handleDevLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('devEmailInput').value.trim();
    const password = document.getElementById('devPasswordInput').value;
    
    // التحقق من البيانات
    if (email !== DEV_ACCOUNT.email || password !== DEV_ACCOUNT.password) {
        showToast('بيانات الدخول غير صحيحة ❌', 'error');
        return;
    }
    
    const dev = {
        email: DEV_ACCOUNT.email,
        name: DEV_ACCOUNT.name,
        loginAt: Date.now()
    };
    
    saveDev(dev);
    closeAuthModal();
    showToast('مرحباً DESHA.245 👑', 'success');
    
    // تفريغ الحقول
    document.getElementById('devEmailInput').value = '';
    document.getElementById('devPasswordInput').value = '';
    
    // الانتقال للوحة المطور
    navigateTo('devpanel');
}

// ============ الصفحة الرئيسية ============

function renderHomePage() {
    const games = getGames();
    const patches = getPatches();
    const stats = getStats();
    
    // تحديث الإحصائيات
    const statGames = document.getElementById('statGames');
    const statDownloads = document.getElementById('statDownloads');
    const statPatches = document.getElementById('statPatches');
    const statUsers = document.getElementById('statUsers');
    
    if (statGames) statGames.textContent = stats.games;
    if (statDownloads) statDownloads.textContent = stats.downloads;
    if (statPatches) statPatches.textContent = stats.patches;
    if (statUsers) statUsers.textContent = stats.users;
    
    // عرض أحدث 4 ألعاب
    const container = document.getElementById('latestGames');
    if (!container) return;
    
    if (games.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <i class="fas fa-gamepad"></i>
                <h3>لا توجد ألعاب بعد</h3>
                <p>سيتم إضافة الألعاب قريباً</p>
            </div>
        `;
        return;
    }
    
    // ترتيب حسب الأحدث
    const sorted = [...games].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    const latest = sorted.slice(0, 4);
    
    container.innerHTML = latest.map(game => renderGameCard(game)).join('');
}

// ============ عرض بطاقة لعبة ============

function renderGameCard(game) {
    const favorites = getFavorites();
    const isFav = favorites.includes(game.id);
    const categoryName = CATEGORY_NAMES[game.category] || game.category;
    
    return `
        <div class="game-card" onclick="openGameDetail('${game.id}')">
            <div class="game-card-image">
                <img src="${escapeHtml(game.cover)}" 
                     alt="${escapeHtml(game.title)}"
                     onerror="this.src='https://via.placeholder.com/300x300/0066ff/ffffff?text=Game'">
                <span class="game-category-badge">${categoryName}</span>
                <button class="game-fav-btn ${isFav ? 'active' : ''}" 
                        onclick="event.stopPropagation(); toggleFavorite('${game.id}')">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
            <div class="game-card-info">
                <h3 class="game-card-title">${escapeHtml(game.title)}</h3>
                <div class="game-card-meta">
                    <span class="game-card-rating">
                        <i class="fas fa-star"></i> ${game.rating || '4.5'}
                    </span>
                    <span class="game-card-size">
                        <i class="fas fa-database"></i> ${escapeHtml(game.size)}
                    </span>
                </div>
            </div>
        </div>
    `;
}

// ============ صفحة كل الألعاب ============

function renderGamesPage() {
    applyFilters();
}

function applyFilters() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortFilter = document.getElementById('sortFilter');
    
    const search = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const category = categoryFilter ? categoryFilter.value : 'all';
    const sortBy = sortFilter ? sortFilter.value : 'newest';
    
    let games = getGames();
    
    // فلترة حسب البحث
    if (search) {
        games = games.filter(g => 
            g.title.toLowerCase().includes(search) ||
            (g.description && g.description.toLowerCase().includes(search))
        );
    }
    
    // فلترة حسب القسم
    if (category !== 'all') {
        games = games.filter(g => g.category === category);
    }
    
    // الترتيب
    switch (sortBy) {
        case 'newest':
            games.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            break;
        case 'rating':
            games.sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0));
            break;
        case 'downloads':
            games.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
            break;
        case 'name':
            games.sort((a, b) => a.title.localeCompare(b.title, 'ar'));
            break;
    }
    
    // عرض النتائج
    const grid = document.getElementById('gamesGrid');
    const empty = document.getElementById('emptyGames');
    
    if (!grid) return;
    
    if (games.length === 0) {
        grid.innerHTML = '';
        if (empty) empty.style.display = 'block';
        return;
    }
    
    if (empty) empty.style.display = 'none';
    grid.innerHTML = games.map(game => renderGameCard(game)).join('');
}

// ============ فتح تفاصيل لعبة ============

function openGameDetail(gameId) {
    currentGameId = gameId;
    navigateTo('game-detail');
    renderGameDetail(gameId);
}/* ============================================
   🎮 متجر عالسريع - DESHA.245
   app.js - الجزء 3: باقي الوظائف
   ============================================ */

// ============ عرض تفاصيل اللعبة ============

function renderGameDetail(gameId) {
    const games = getGames();
    const game = games.find(g => g.id === gameId);
    const container = document.getElementById('gameDetailContent');
    
    if (!container) return;
    
    if (!game) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>اللعبة غير موجودة</h3>
            </div>
        `;
        return;
    }
    
    const categoryName = CATEGORY_NAMES[game.category] || game.category;
    const favorites = getFavorites();
    const isFav = favorites.includes(game.id);
    const packageName = game.package || extractPackageFromObb(game.obbUrl) || 'com.example.game';
    
    container.innerHTML = `
        <div class="game-detail-card">
            <div class="game-detail-header">
                <div class="game-detail-cover">
                    <img src="${escapeHtml(game.cover)}" 
                         alt="${escapeHtml(game.title)}"
                         onerror="this.src='https://via.placeholder.com/300x300/0066ff/ffffff?text=Game'">
                </div>
                <div class="game-detail-info">
                    <h1>${escapeHtml(game.title)}</h1>
                    
                    <div class="game-detail-badges">
                        <span class="badge badge-blue">
                            <i class="fas fa-tag"></i> ${categoryName}
                        </span>
                        <span class="badge badge-gold">
                            <i class="fas fa-star"></i> ${game.rating || '4.5'}
                        </span>
                        <span class="badge badge-success">
                            <i class="fas fa-database"></i> ${escapeHtml(game.size)}
                        </span>
                        <span class="badge badge-blue">
                            <i class="fas fa-code-branch"></i> v${escapeHtml(game.version)}
                        </span>
                    </div>
                    
                    <p class="game-detail-description">${escapeHtml(game.description)}</p>
                    
                    <div class="game-detail-actions">
                        <button class="btn btn-primary" onclick="scrollToDownload()">
                            <i class="fas fa-download"></i> تحميل اللعبة
                        </button>
                        <button class="btn btn-secondary ${isFav ? 'active' : ''}" 
                                onclick="toggleFavorite('${game.id}'); renderGameDetail('${game.id}')"
                                style="background: ${isFav ? 'var(--danger)' : 'var(--bg-secondary)'}; 
                                       color: ${isFav ? '#fff' : 'var(--text-primary)'};
                                       border: 2px solid ${isFav ? 'var(--danger)' : 'var(--border-color)'};">
                            <i class="fas fa-heart"></i> ${isFav ? 'في المفضلة' : 'أضف للمفضلة'}
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="download-section" id="downloadSection">
                <h2><i class="fas fa-cloud-download-alt"></i> روابط التحميل</h2>
                <div class="download-buttons">
                    ${renderDownloadButton('apk', game.apkUrl, 'ملف APK', 'التطبيق الأساسي')}
                    ${game.obbUrl ? renderDownloadButton('obb', game.obbUrl, 'ملف OBB', `ضعه في: Android/obb/${packageName}`) : ''}
                    ${game.dataUrl ? renderDownloadButton('data', game.dataUrl, 'ملف DATA', 'ملف البيانات الإضافية') : ''}
                </div>
                
                <div class="install-steps">
                    <h3><i class="fas fa-list-ol"></i> خطوات التثبيت</h3>
                    <ol>
                        <li>حمّل ملف <strong>APK</strong>${game.obbUrl ? ' وملف <strong>OBB</strong>' : ''}${game.dataUrl ? ' وملف <strong>DATA</strong>' : ''}</li>
                        <li>فعّل خيار <strong>"مصادر غير معروفة"</strong> من إعدادات الهاتف</li>
                        ${game.obbUrl ? `<li>انقل ملف OBB إلى المسار: <code>Android/obb/${packageName}</code></li>` : ''}
                        ${game.dataUrl ? `<li>انقل ملف DATA إلى المسار: <code>Android/data/${packageName}</code></li>` : ''}
                        <li>ثبّت ملف الـ APK</li>
                        <li>افتح اللعبة واستمتع 🎮</li>
                    </ol>
                </div>
            </div>
        </div>
    `;
}

function renderDownloadButton(type, url, title, subtitle) {
    const icons = {
        apk: 'fa-android',
        obb: 'fa-archive',
        data: 'fa-folder-open'
    };
    
    const labels = {
        apk: 'تحميل',
        obb: 'تحميل',
        data: 'تحميل'
    };
    
    return `
        <button class="download-btn ${type}" onclick="handleDownload('${type}', '${escapeHtml(url)}')">
            <div class="download-btn-icon">
                <i class="fab ${icons[type]}"></i>
            </div>
            <div class="download-btn-text">
                <strong>${title}</strong>
                <small>${subtitle}</small>
            </div>
            <i class="fas fa-external-link-alt"></i>
        </button>
    `;
}

function scrollToDownload() {
    const section = document.getElementById('downloadSection');
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// ============ معالجة التحميل ============

function handleDownload(type, url) {
    if (!url) {
        showToast('الرابط غير متوفر', 'error');
        return;
    }
    
    // زيادة عدد التحميلات
    incrementDownloads();
    
    // زيادة تحميلات اللعبة
    if (currentGameId) {
        const games = getGames();
        const game = games.find(g => g.id === currentGameId);
        if (game) {
            game.downloads = (game.downloads || 0) + 1;
            saveGames(games);
        }
    }
    
    showToast(`جاري فتح رابط ${type.toUpperCase()}...`, 'success');
    
    // فتح الرابط في تاب جديد
    window.open(url, '_blank', 'noopener,noreferrer');
}

// ============ المفضلة ============

function getFavorites() {
    return getFromStorage(STORAGE_KEYS.FAVORITES, []);
}

function saveFavorites(favs) {
    saveToStorage(STORAGE_KEYS.FAVORITES, favs);
}

function toggleFavorite(gameId) {
    // لو مش مسجل، نطلب منه يسجل
    if (!currentUser) {
        showToast('سجّل دخولك أولاً لحفظ المفضلة', 'warning');
        openAuthModal();
        return;
    }
    
    let favorites = getFavorites();
    const index = favorites.indexOf(gameId);
    
    if (index > -1) {
        favorites.splice(index, 1);
        showToast('تم إزالة اللعبة من المفضلة', 'info');
    } else {
        favorites.push(gameId);
        showToast('تم إضافة اللعبة للمفضلة ❤️', 'success');
    }
    
    saveFavorites(favorites);
    
    // تحديث عرض البطاقات إن وجدت
    if (currentPage === 'home') renderHomePage();
    if (currentPage === 'games') applyFilters();
    if (currentPage === 'favorites') renderFavoritesPage();
    
    // تحديث زر المفضلة في صفحة التفاصيل
    if (currentPage === 'game-detail' && currentGameId) {
        renderGameDetail(currentGameId);
    }
}

function renderFavoritesPage() {
    const favorites = getFavorites();
    const games = getGames();
    const favGames = games.filter(g => favorites.includes(g.id));
    
    const grid = document.getElementById('favoritesGrid');
    const empty = document.getElementById('emptyFavorites');
    
    if (!grid) return;
    
    if (favGames.length === 0) {
        grid.innerHTML = '';
        if (empty) empty.style.display = 'block';
        return;
    }
    
    if (empty) empty.style.display = 'none';
    grid.innerHTML = favGames.map(game => renderGameCard(game)).join('');
}

// ============ الباتشات ============

function renderPatchesPage() {
    const patches = getPatches();
    const list = document.getElementById('patchesList');
    const empty = document.getElementById('emptyPatches');
    
    if (!list) return;
    
    if (patches.length === 0) {
        list.innerHTML = '';
        if (empty) empty.style.display = 'block';
        return;
    }
    
    if (empty) empty.style.display = 'none';
    
    // ترتيب حسب الأحدث
    const sorted = [...patches].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    
    list.innerHTML = sorted.map(patch => `
        <div class="patch-card">
            <h3><i class="fas fa-tools"></i> ${escapeHtml(patch.title)}</h3>
            <p>${escapeHtml(patch.description)}</p>
            <button class="btn" onclick="handlePatchDownload('${patch.id}')">
                <i class="fas fa-download"></i> تحميل الباتش
            </button>
        </div>
    `).join('');
}

function handlePatchDownload(patchId) {
    const patches = getPatches();
    const patch = patches.find(p => p.id === patchId);
    
    if (!patch || !patch.url) {
        showToast('الرابط غير متوفر', 'error');
        return;
    }
    
    incrementDownloads();
    showToast('جاري فتح رابط التحميل...', 'success');
    window.open(patch.url, '_blank', 'noopener,noreferrer');
}

// ============ لوحة المطور ============

function renderDevPanel() {
    // عرض إدارة الألعاب والباتشات
    renderManageGames();
    renderManagePatches();
}

// ============ إضافة لعبة جديدة ============

function handleAddGame(event) {
    event.preventDefault();
    
    if (!isDeveloper) {
        showToast('غير مصرح', 'error');
        return;
    }
    
    const form = event.target;
    const formData = new FormData(form);
    
    const newGame = {
        id: generateId(),
        title: formData.get('title').trim(),
        category: formData.get('category'),
        description: formData.get('description').trim(),
        version: formData.get('version').trim(),
        size: formData.get('size').trim(),
        cover: formData.get('cover').trim(),
        apkUrl: formData.get('apkUrl').trim(),
        obbUrl: formData.get('obbUrl').trim() || null,
        dataUrl: formData.get('dataUrl').trim() || null,
        package: formData.get('package').trim() || null,
        rating: formData.get('rating') || '4.5',
        downloads: 0,
        createdAt: Date.now(),
        createdBy: DEV_ACCOUNT.name
    };
    
    // التحقق
    if (!newGame.title || !newGame.apkUrl || !newGame.cover) {
        showToast('يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
    }
    
    // الحفظ
    const games = getGames();
    games.push(newGame);
    saveGames(games);
    
    showToast(`تم إضافة "${newGame.title}" بنجاح 🎮`, 'success');
    
    // تفريغ الفورم
    form.reset();
    
    // تحديث قائمة الإدارة
    renderManageGames();
}

// ============ عرض قائمة إدارة الألعاب ============

function renderManageGames() {
    const games = getGames();
    const list = document.getElementById('manageGamesList');
    
    if (!list) return;
    
    if (games.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <h3>لا توجد ألعاب</h3>
                <p>ابدأ بإضافة أول لعبة من التبويب السابق</p>
            </div>
        `;
        return;
    }
    
    // ترتيب حسب الأحدث
    const sorted = [...games].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    
    list.innerHTML = sorted.map(game => `
        <div class="manage-item">
            <img src="${escapeHtml(game.cover)}" 
                 alt="${escapeHtml(game.title)}"
                 onerror="this.src='https://via.placeholder.com/60x60/0066ff/ffffff?text=G'">
            <div class="manage-item-info">
                <h4>${escapeHtml(game.title)}</h4>
                <p>
                    ${CATEGORY_NAMES[game.category] || game.category} • 
                    v${escapeHtml(game.version)} • 
                    ${escapeHtml(game.size)} • 
                    ${game.downloads || 0} تحميل
                </p>
            </div>
            <div class="manage-item-actions">
                <button class="btn-edit" onclick="editGame('${game.id}')" title="تعديل">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" onclick="deleteGame('${game.id}')" title="حذف">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// ============ حذف لعبة ============

function deleteGame(gameId) {
    if (!isDeveloper) return;
    
    const games = getGames();
    const game = games.find(g => g.id === gameId);
    
    if (!game) return;
    
    showConfirm(
        '🗑️ حذف اللعبة',
        `هل أنت متأكد من حذف "${game.title}"؟ لا يمكن التراجع!`,
        () => {
            const updated = games.filter(g => g.id !== gameId);
            saveGames(updated);
            
            // حذفها من المفضلة
            let favorites = getFavorites();
            favorites = favorites.filter(id => id !== gameId);
            saveFavorites(favorites);
            
            showToast(`تم حذف "${game.title}"`, 'success');
            renderManageGames();
            renderHomePage();
        }
    );
}

// ============ تعديل لعبة ============

function editGame(gameId) {
    if (!isDeveloper) return;
    
    const games = getGames();
    const game = games.find(g => g.id === gameId);
    
    if (!game) return;
    
    // نستخدم prompt للتعديل السريع (بديل بسيط للفورم الكامل)
    const newTitle = prompt('اسم اللعبة:', game.title);
    if (newTitle === null) return; // المستخدم ألغى
    
    const newDescription = prompt('الوصف:', game.description);
    if (newDescription === null) return;
    
    const newVersion = prompt('الإصدار:', game.version);
    if (newVersion === null) return;
    
    const newSize = prompt('الحجم:', game.size);
    if (newSize === null) return;
    
    const newRating = prompt('التقييم (0-5):', game.rating);
    if (newRating === null) return;
    
    // تحديث البيانات
    game.title = newTitle.trim() || game.title;
    game.description = newDescription.trim() || game.description;
    game.version = newVersion.trim() || game.version;
    game.size = newSize.trim() || game.size;
    game.rating = newRating.trim() || game.rating;
    game.updatedAt = Date.now();
    
    saveGames(games);
    showToast('تم تحديث اللعبة ✅', 'success');
    renderManageGames();
    renderHomePage();
}

// ============ إضافة باتش جديد ============

function handleAddPatch(event) {
    event.preventDefault();
    
    if (!isDeveloper) {
        showToast('غير مصرح', 'error');
        return;
    }
    
    const form = event.target;
    const formData = new FormData(form);
    
    const newPatch = {
        id: generateId(),
        title: formData.get('title').trim(),
        description: formData.get('description').trim(),
        url: formData.get('url').trim(),
        createdAt: Date.now(),
        createdBy: DEV_ACCOUNT.name
    };
    
    if (!newPatch.title || !newPatch.url) {
        showToast('يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
    }
    
    const patches = getPatches();
    patches.push(newPatch);
    savePatches(patches);
    
    showToast(`تم إضافة الباتش "${newPatch.title}" 🔧`, 'success');
    
    form.reset();
    renderManagePatches();
}

// ============ إدارة الباتشات ============

function renderManagePatches() {
    const patches = getPatches();
    const list = document.getElementById('managePatchesList');
    
    if (!list) return;
    
    if (patches.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-tools"></i>
                <h3>لا توجد باتشات</h3>
                <p>ابدأ بإضافة أول باتش</p>
            </div>
        `;
        return;
    }
    
    const sorted = [...patches].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    
    list.innerHTML = sorted.map(patch => `
        <div class="manage-item">
            <div class="manage-item-info" style="padding-right: 0;">
                <h4><i class="fas fa-tools" style="color: var(--gold-dark);"></i> ${escapeHtml(patch.title)}</h4>
                <p>${escapeHtml(patch.description.substring(0, 80))}${patch.description.length > 80 ? '...' : ''}</p>
            </div>
            <div class="manage-item-actions">
                <button class="btn-edit" onclick="editPatch('${patch.id}')" title="تعديل">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" onclick="deletePatch('${patch.id}')" title="حذف">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// ============ حذف باتش ============

function deletePatch(patchId) {
    if (!isDeveloper) return;
    
    const patches = getPatches();
    const patch = patches.find(p => p.id === patchId);
    
    if (!patch) return;
    
    showConfirm(
        '🗑️ حذف الباتش',
        `هل أنت متأكد من حذف "${patch.title}"؟`,
        () => {
            const updated = patches.filter(p => p.id !== patchId);
            savePatches(updated);
            showToast(`تم حذف "${patch.title}"`, 'success');
            renderManagePatches();
        }
    );
}

// ============ تعديل باتش ============

function editPatch(patchId) {
    if (!isDeveloper) return;
    
    const patches = getPatches();
    const patch = patches.find(p => p.id === patchId);
    
    if (!patch) return;
    
    const newTitle = prompt('اسم الباتش:', patch.title);
    if (newTitle === null) return;
    
    const newDescription = prompt('الوصف:', patch.description);
    if (newDescription === null) return;
    
    const newUrl = prompt('الرابط:', patch.url);
    if (newUrl === null) return;
    
    patch.title = newTitle.trim() || patch.title;
    patch.description = newDescription.trim() || patch.description;
    patch.url = newUrl.trim() || patch.url;
    patch.updatedAt = Date.now();
    
    savePatches(patches);
    showToast('تم تحديث الباتش ✅', 'success');
    renderManagePatches();
}

// ============ اختصارات لوحة المفاتيح ============

document.addEventListener('keydown', function(e) {
    // ESC لإغلاق النوافذ
    if (e.key === 'Escape') {
        closeAuthModal();
        closeConfirm();
        const navLinks = document.getElementById('navLinks');
        if (navLinks) navLinks.classList.remove('open');
    }
});

// ============ نهاية الملف ============
console.log('%c✅ تم تحميل جميع وظائف المتجر بنجاح', 'color: #10b981; font-size: 14px; font-weight: bold;');

// ============ إظهار/إخفاء كلمة المرور ============

function togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    const icon = btn.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}
/* ============================================
   🎨 التحديثات الجديدة
   ============================================ */

// ============ شاشة الترحيب ============
function hideSplashScreen() {
    const splash = document.getElementById('splashScreen');
    if (!splash) return;
    
    setTimeout(() => {
        splash.classList.add('hidden');
        setTimeout(() => {
            splash.style.display = 'none';
        }, 700);
    }, 2200);
}

// ============ إظهار/إخفاء حقول OBB و DATA حسب نوع اللعبة ============
function toggleGameTypeFields() {
    const gameType = document.querySelector('input[name="gameType"]:checked');
    if (!gameType) return;
    
    const obbGroup = document.getElementById('obbFieldGroup');
    const dataGroup = document.getElementById('dataFieldGroup');
    const obbInput = document.getElementById('obbInput');
    const dataInput = document.getElementById('dataInput');
    
    const value = gameType.value;
    
    // OBB
    if (value === 'apk-obb' || value === 'apk-obb-data') {
        if (obbGroup) obbGroup.style.display = 'block';
    } else {
        if (obbGroup) obbGroup.style.display = 'none';
        if (obbInput) obbInput.value = '';
    }
    
    // DATA
    if (value === 'apk-obb-data') {
        if (dataGroup) dataGroup.style.display = 'block';
    } else {
        if (dataGroup) dataGroup.style.display = 'none';
        if (dataInput) dataInput.value = '';
    }
}

// ============ رفع ملف من الجهاز (تحويل لـ Base64) ============
function handleFileSelect(event, targetInputId) {
    const file = event.target.files[0];
    if (!file) return;
    
    const targetInput = document.getElementById(targetInputId);
    if (!targetInput) return;
    
    // لو الملف كبير (أكبر من 5MB) نحذره
    if (file.size > 5 * 1024 * 1024) {
        showToast('⚠️ الملف كبير! الأفضل ترفعه على MediaFire أو GitHub وحط الرابط', 'warning', 6000);
        event.target.value = '';
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        targetInput.value = e.target.result;
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        showToast(`✅ تم تحميل الملف (${sizeMB} MB)`, 'success');
    };
    
    reader.onerror = function() {
        showToast('❌ فشل قراءة الملف', 'error');
    };
    
    reader.readAsDataURL(file);
}

// ============ إظهار/إخفاء كلمة المرور ============
function togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    const icon = btn.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

// ============ تعديل دالة handleAddGame لدعم النوع الجديد ============
window.handleAddGame = function(event) {
    event.preventDefault();
    
    if (!isDeveloper) {
        showToast('غير مصرح', 'error');
        return;
    }
    
    const form = event.target;
    const formData = new FormData(form);
    
    // الحصول على نوع اللعبة
    const gameType = document.querySelector('input[name="gameType"]:checked')?.value || 'apk-only';
    
    const obbUrl = formData.get('obbUrl')?.trim() || null;
    const dataUrl = formData.get('dataUrl')?.trim() || null;
    
    // التحقق من الروابط حسب النوع
    if (gameType === 'apk-obb' && !obbUrl) {
        showToast('يجب إضافة رابط OBB', 'error');
        return;
    }
    if (gameType === 'apk-obb-data') {
        if (!obbUrl) {
            showToast('يجب إضافة رابط OBB', 'error');
            return;
        }
        if (!dataUrl) {
            showToast('يجب إضافة رابط DATA', 'error');
            return;
        }
    }
    
    const newGame = {
        id: generateId(),
        title: formData.get('title').trim(),
        category: formData.get('category'),
        description: formData.get('description').trim(),
        version: formData.get('version').trim(),
        size: formData.get('size').trim(),
        cover: formData.get('cover').trim(),
        apkUrl: formData.get('apkUrl').trim(),
        obbUrl: obbUrl,
        dataUrl: dataUrl,
        package: formData.get('package').trim() || null,
        rating: formData.get('rating') || '4.5',
        gameType: gameType,
        downloads: 0,
        createdAt: Date.now(),
        createdBy: DEV_ACCOUNT.name
    };
    
    // التحقق
    if (!newGame.title || !newGame.apkUrl || !newGame.cover) {
        showToast('يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
    }
    
    // الحفظ
    const games = getGames();
    games.push(newGame);
    saveGames(games);
    
    showToast(`تم إضافة "${newGame.title}" بنجاح 🎮`, 'success');
    
    // تفريغ الفورم وإعادة التهيئة
    form.reset();
    toggleGameTypeFields();
    
    // تحديث قائمة الإدارة
    renderManageGames();
};

// ============ تهيئة شاشة الترحيب عند التحميل ============
document.addEventListener('DOMContentLoaded', function() {
    // إخفاء شاشة الترحيب بعد التحميل
    hideSplashScreen();
    
    // تهيئة حقول النوع
    setTimeout(() => toggleGameTypeFields(), 100);
});
/* ============ فتح نافذة اختيار الملفات ============ */
function triggerFileInput(inputId) {
    const input = document.getElementById(inputId);
    if (!input) {
        console.error('لم يتم العثور على:', inputId);
        return;
    }
    input.value = '';
    input.click();
}

/* ============ تحديث زر لوحة المطور ============ */
function updateDevPanelLink() {
    const link = document.getElementById('devPanelLink');
    if (!link) return;
    
    if (isDeveloper) {
        link.classList.add('visible');
        link.style.display = 'block';
    } else {
        link.classList.remove('visible');
        link.style.display = 'none';
    }
}

/* ============ إضافة رابط لوحة المطور في الفوتر ============ */
function updateFooterDevLink() {
    const footerQuickLinks = document.getElementById('footerQuickLinks');
    if (!footerQuickLinks) return;
    
    const existingLink = document.getElementById('footerDevLink');
    if (existingLink) existingLink.remove();
    
    if (isDeveloper) {
        const li = document.createElement('li');
        li.id = 'footerDevLink';
        li.innerHTML = `
            <a href="#" onclick="navigateTo('devpanel'); return false;" 
               style="color: var(--gold-dark); font-weight: 800;">
                <i class="fas fa-cog"></i> لوحة المطور
            </a>
        `;
        footerQuickLinks.appendChild(li);
    }
}

/* ============ تعديل دالة حفظ المطور ============ */
function saveDevAndUpdate(dev) {
    if (dev) {
        saveToStorage(STORAGE_KEYS.DEV, dev);
        isDeveloper = true;
    } else {
        localStorage.removeItem(STORAGE_KEYS.DEV);
        isDeveloper = false;
    }
    updateDevPanelLink();
    updateFooterDevLink();
}

/* ============ تهيئة عند التحميل ============ */
document.addEventListener('DOMContentLoaded', function() {
    updateDevPanelLink();
    updateFooterDevLink();
    
    setTimeout(() => {
        updateDevPanelLink();
        updateFooterDevLink();
    }, 500);
});
// ============ إصلاح سريع: ربط زر لوحة المطور ============
setTimeout(() => {
    if (isDeveloper) {
        const link = document.getElementById('devPanelLink');
        if (link) {
            link.classList.add('visible');
            link.style.display = 'block';
        }
        
        // إضافة الرابط في الفوتر
        const footerLinks = document.getElementById('footerQuickLinks');
        if (footerLinks && !document.getElementById('footerDevLink')) {
            const li = document.createElement('li');
            li.id = 'footerDevLink';
            li.innerHTML = `
                <a href="#" onclick="navigateTo('devpanel'); return false;" 
                   style="color: var(--gold-dark); font-weight: 800;">
                    <i class="fas fa-cog"></i> لوحة المطور
                </a>
            `;
            footerLinks.appendChild(li);
        }
    }
}, 300);