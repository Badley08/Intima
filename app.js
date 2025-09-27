// 🌍 Traductions
const translations = {
  fr: {
    greeting: "Bienvenue, {name} 💖",
    start: "Commencer ✨",
    placeholderAlias: "Choisis ton petit nom (ex: Lune, Étoile, Rose...)",
    newEntry: "➕",
    exportData: "📤 Exporter",
    importData: "📥 Importer",
    entryTitle: "Un titre doux...",
    entryContent: "Écris ce que tu ressens... sans filtre, sans peur.",
    save: "Enregistrer dans ton cœur 💖",
    moodLabel: "Choisis ton émotion du moment :",
    noEntries: "Ton journal est vide... Écris ta première pensée 💌",
    exportSuccess: "Ton journal a été exporté avec amour ! 💞",
    importSuccess: "Ton journal secret est de retour ! 🌙",
    invalidFile: "Ce fichier ne vient pas de ton cœur... ❌",
    deleteConfirm: "Supprimer cette pensée pour toujours ? 😢",
    passwordCreate: "Crée ton mot de passe secret",
    passwordEnter: "Entre ton mot de passe",
    passwordSubtitle: "Il protégera ton journal intime 💖",
    passwordWrong: "Mot de passe incorrect... essaie encore 🔒",
    passwordMatch: "Les mots de passe ne correspondent pas",
    joy: "😊", sadness: "😢", love: "💗", peace: "🕊️", fire: "🔥",
    star: "⭐", moon: "🌙", flower: "🌸"
  },
  en: {
    greeting: "Welcome, {name} 💖",
    start: "Start ✨",
    placeholderAlias: "Choose your sweet name (e.g. Moon, Star, Rose...)",
    newEntry: "➕",
    exportData: "📤 Export",
    importData: "📥 Import",
    entryTitle: "A soft title...",
    entryContent: "Write what you feel... no filter, no fear.",
    save: "Save in your heart 💖",
    moodLabel: "Choose your current emotion:",
    noEntries: "Your journal is empty... Write your first thought 💌",
    exportSuccess: "Your journal has been exported with love! 💞",
    importSuccess: "Your secret journal is back! 🌙",
    invalidFile: "This file doesn't come from your heart... ❌",
    deleteConfirm: "Delete this thought forever? 😢",
    passwordCreate: "Create your secret password",
    passwordEnter: "Enter your password",
    passwordSubtitle: "It will protect your intimate journal 💖",
    passwordWrong: "Wrong password... try again 🔒",
    passwordMatch: "Passwords don't match",
    joy: "😊", sadness: "😢", love: "💗", peace: "🕊️", fire: "🔥",
    star: "⭐", moon: "🌙", flower: "🌸"
  },
  es: {
    greeting: "Bienvenida, {name} 💖",
    start: "Empezar ✨",
    placeholderAlias: "Elige tu nombre dulce (ej: Luna, Estrella, Rosa...)",
    newEntry: "➕",
    exportData: "📤 Exportar",
    importData: "📥 Importar",
    entryTitle: "Un título suave...",
    entryContent: "Escribe lo que sientes... sin filtros, sin miedo.",
    save: "Guardar en tu corazón 💖",
    moodLabel: "Elige tu emoción actual:",
    noEntries: "Tu diario está vacío... ¡Escribe tu primer pensamiento! 💌",
    exportSuccess: "¡Tu diario se exportó con amor! 💞",
    importSuccess: "¡Tu diario secreto ha vuelto! 🌙",
    invalidFile: "Este archivo no viene de tu corazón... ❌",
    deleteConfirm: "¿Borrar este pensamiento para siempre? 😢",
    passwordCreate: "Crea tu contraseña secreta",
    passwordEnter: "Introduce tu contraseña",
    passwordSubtitle: "Protegerá tu diario íntimo 💖",
    passwordWrong: "Contraseña incorrecta... intenta de nuevo 🔒",
    passwordMatch: "Las contraseñas no coinciden",
    joy: "😊", sadness: "😢", love: "💗", peace: "🕊️", fire: "🔥",
    star: "⭐", moon: "🌙", flower: "🌸"
  }
};

// 🔧 Variables globales (stockage en mémoire pendant la session)
let currentLang = 'fr';
let userAlias = null;
let userPassword = null;
let entries = [];
let currentEditingIndex = null;
let activeFilters = [];
let easterEggClicks = 0;

// 🌸 Fonction de traduction
function t(key, replacements = {}) {
  let str = translations[currentLang][key] || key;
  for (let [k, v] of Object.entries(replacements)) {
    str = str.replace(`{${k}}`, v);
  }
  return str;
}

// 🔐 Gestion du mot de passe
function initPasswordScreen() {
  const savedPasswordHash = localStorage.getItem('intima-password-hash');
  const passwordTitle = document.getElementById('password-title');
  const passwordSubtitle = document.getElementById('password-subtitle');
  const passwordConfirm = document.getElementById('password-confirm');
  const passwordBtn = document.getElementById('password-btn');
  
  if (!savedPasswordHash) {
    // Premier lancement - créer le mot de passe
    passwordTitle.textContent = t('passwordCreate');
    passwordSubtitle.textContent = t('passwordSubtitle');
    passwordConfirm.style.display = 'block';
    passwordBtn.textContent = 'Sécuriser mon journal 🔐';
    passwordBtn.onclick = createPassword;
  } else {
    // Journal existant - demander le mot de passe
    passwordTitle.textContent = t('passwordEnter');
    passwordSubtitle.textContent = t('passwordSubtitle');
    passwordConfirm.style.display = 'none';
    passwordBtn.textContent = 'Déverrouiller 🔓';
    passwordBtn.onclick = verifyPassword;
  }
}

function createPassword() {
  const password = document.getElementById('password-input').value;
  const confirmPassword = document.getElementById('password-confirm').value;
  const errorEl = document.getElementById('password-error');
  
  if (!password || password.length < 4) {
    errorEl.textContent = 'Le mot de passe doit contenir au moins 4 caractères';
    errorEl.style.display = 'block';
    return;
  }
  
  if (password !== confirmPassword) {
    errorEl.textContent = t('passwordMatch');
    errorEl.style.display = 'block';
    return;
  }
  
  const passwordHash = CryptoJS.SHA256(password).toString();
  localStorage.setItem('intima-password-hash', passwordHash);
  userPassword = password;
  
  // Passer à l'écran de bienvenue
  document.getElementById('password-screen').classList.remove('active');
  document.getElementById('welcome-screen').classList.add('active');
}

function verifyPassword() {
  const password = document.getElementById('password-input').value;
  const savedHash = localStorage.getItem('intima-password-hash');
  const passwordHash = CryptoJS.SHA256(password).toString();
  const errorEl = document.getElementById('password-error');
  
  if (passwordHash === savedHash) {
    userPassword = password;
    userAlias = localStorage.getItem('intima-alias');
    
    if (userAlias) {
      // Aller directement au journal
      document.getElementById('password-screen').classList.remove('active');
      document.getElementById('journal-screen').classList.add('active');
      loadEntries();
      updateUITexts();
    } else {
      // Aller à l'écran de bienvenue
      document.getElementById('password-screen').classList.remove('active');
      document.getElementById('welcome-screen').classList.add('active');
    }
  } else {
    errorEl.textContent = t('passwordWrong');
    errorEl.style.display = 'block';
    document.getElementById('password-input').value = '';
  }
}

// 🎨 Gestion des langues et thèmes
function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('intima-lang', lang);
  document.getElementById('html-root').setAttribute('lang', lang);
  updateUITexts();
}

function setTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  localStorage.setItem('intima-theme', theme);
}

function updateUITexts() {
  if (userAlias) {
    document.getElementById('greeting').textContent = t('greeting', { name: userAlias });
  }
}

// 🚀 Démarrage après mot de passe
document.getElementById('start-btn').addEventListener('click', () => {
  const aliasInput = document.getElementById('user-alias');
  const alias = aliasInput.value.trim() || 'Belle Inconnue';

  userAlias = alias;
  localStorage.setItem('intima-alias', alias);

  document.getElementById('welcome-screen').classList.remove('active');
  document.getElementById('journal-screen').classList.add('active');

  loadEntries();
  updateUITexts();
});

// 🔐 Chiffrement et déchiffrement
function getEncryptionKey() {
  return CryptoJS.SHA256(userPassword + userAlias).toString();
}

function encryptData(data) {
  return CryptoJS.AES.encrypt(JSON.stringify(data), getEncryptionKey()).toString();
}

function decryptData(encrypted) {
  if (!encrypted) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, getEncryptionKey());
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (e) {
    return null;
  }
}

// 💾 Gestion des entrées
function saveEntries() {
  localStorage.setItem('intima-entries', encryptData(entries));
}

function loadEntries() {
  const encrypted = localStorage.getItem('intima-entries');
  entries = decryptData(encrypted) || [];
  showEntries(entries);
  updateStats();
  updateFilterTags();
}

function showEntries(entriesToShow) {
  const container = document.getElementById('entries-container');
  container.innerHTML = '';

  if (entriesToShow.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📝</div>
        <p>${t('noEntries')}</p>
      </div>
    `;
    return;
  }

  // Trier: épinglés en premier, puis par date
  const sortedEntries = [...entriesToShow].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.date) - new Date(a.date);
  });

  sortedEntries.forEach((entry, index) => {
    const realIndex = entries.findIndex(e => e.date === entry.date && e.title === entry.title);
    const card = document.createElement('div');
    card.className = 'entry-card' + (entry.pinned ? ' pinned' : '');
    card.onclick = () => openReadModal(realIndex);
    
    card.innerHTML = `
      ${entry.pinned ? '<span class="pin-badge">📌</span>' : ''}
      <h3>${entry.title || 'Sans titre'}</h3>
      <div class="date">${new Date(entry.date).toLocaleDateString(currentLang, { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}</div>
      <div class="mood">${entry.mood}</div>
      ${entry.tags && entry.tags.length > 0 ? `
        <div class="entry-tags">
          ${entry.tags.map(tag => `<span class="entry-tag">${tag}</span>`).join('')}
        </div>
      ` : ''}
      ${entry.image ? `<img src="${entry.image}" class="entry-card-image" alt="Image">` : ''}
      <p>${entry.content}</p>
    `;
    container.appendChild(card);
  });
}

// ➕ Nouvelle entrée
document.getElementById('new-entry-btn').addEventListener('click', () => {
  currentEditingIndex = null;
  document.getElementById('modal-title').textContent = 'Nouvelle pensée 💭';
  document.getElementById('entry-title').value = '';
  document.getElementById('entry-content').value = '';
  document.getElementById('entry-tags').value = '';
  document.getElementById('image-preview').innerHTML = '';
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
  document.getElementById('entry-modal').style.display = 'block';
});

// 🎭 Sélection d'humeur
document.querySelectorAll('.mood-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  });
});

// 📷 Upload d'image
document.getElementById('entry-image').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (event) => {
    const preview = document.getElementById('image-preview');
    preview.innerHTML = `
      <img src="${event.target.result}" alt="Aperçu">
      <button onclick="document.getElementById('image-preview').innerHTML=''; document.getElementById('entry-image').value='';">
        ❌ Retirer l'image
      </button>
    `;
  };
  reader.readAsDataURL(file);
});

document.querySelector('.image-upload-label').addEventListener('click', () => {
  document.getElementById('entry-image').click();
});

// 💾 Sauvegarde d'entrée
document.getElementById('save-entry-btn').addEventListener('click', () => {
  const title = document.getElementById('entry-title').value.trim();
  const content = document.getElementById('entry-content').value.trim();
  const tagsInput = document.getElementById('entry-tags').value.trim();
  const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];
  const moodBtn = document.querySelector('.mood-btn.selected');
  const mood = moodBtn ? moodBtn.dataset.mood : 'peace';
  const imagePreview = document.querySelector('#image-preview img');
  const image = imagePreview ? imagePreview.src : null;

  if (!content) {
    alert('Écris au moins quelque chose dans ton journal 💭');
    return;
  }

  const entry = {
    title: title || 'Sans titre',
    content,
    mood: translations[currentLang][mood],
    tags,
    image,
    date: new Date().toISOString(),
    pinned: false
  };

  if (currentEditingIndex !== null) {
    // Modification
    entry.pinned = entries[currentEditingIndex].pinned;
    entries[currentEditingIndex] = entry;
  } else {
    // Nouvelle entrée
    entries.push(entry);
  }

  saveEntries();
  document.getElementById('entry-modal').style.display = 'none';
  loadEntries();
});

// 📖 Lecture d'entrée
function openReadModal(index) {
  currentEditingIndex = index;
  const entry = entries[index];
  
  document.getElementById('read-title').textContent = entry.title;
  document.getElementById('read-date').textContent = new Date(entry.date).toLocaleDateString(currentLang, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  document.getElementById('read-mood').textContent = entry.mood;
  
  const tagsContainer = document.getElementById('read-tags');
  if (entry.tags && entry.tags.length > 0) {
    tagsContainer.innerHTML = entry.tags.map(tag => `<span class="entry-tag">${tag}</span>`).join('');
  } else {
    tagsContainer.innerHTML = '';
  }
  
  const imageContainer = document.getElementById('read-image');
  if (entry.image) {
    imageContainer.innerHTML = `<img src="${entry.image}" alt="Image">`;
  } else {
    imageContainer.innerHTML = '';
  }
  
  document.getElementById('read-content').textContent = entry.content;
  document.getElementById('pin-entry-btn').textContent = entry.pinned ? '📍' : '📌';
  
  document.getElementById('read-modal').style.display = 'block';
}

// 📌 Épingler
document.getElementById('pin-entry-btn').addEventListener('click', () => {
  if (currentEditingIndex !== null) {
    entries[currentEditingIndex].pinned = !entries[currentEditingIndex].pinned;
    saveEntries();
    document.getElementById('read-modal').style.display = 'none';
    loadEntries();
  }
});

// ✏️ Modifier
document.getElementById('edit-entry-btn').addEventListener('click', () => {
  if (currentEditingIndex !== null) {
    const entry = entries[currentEditingIndex];
    
    document.getElementById('modal-title').textContent = 'Modifier ta pensée ✏️';
    document.getElementById('entry-title').value = entry.title;
    document.getElementById('entry-content').value = entry.content;
    document.getElementById('entry-tags').value = entry.tags ? entry.tags.join(', ') : '';
    
    // Sélectionner l'humeur
    const moodKey = Object.keys(translations[currentLang]).find(
      key => translations[currentLang][key] === entry.mood
    );
    if (moodKey) {
      const moodBtn = document.querySelector(`.mood-btn[data-mood="${moodKey}"]`);
      if (moodBtn) {
        document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
        moodBtn.classList.add('selected');
      }
    }
    
    // Afficher l'image si elle existe
    const imagePreview = document.getElementById('image-preview');
    if (entry.image) {
      imagePreview.innerHTML = `
        <img src="${entry.image}" alt="Image">
        <button onclick="document.getElementById('image-preview').innerHTML=''; document.getElementById('entry-image').value='';">
          ❌ Retirer l'image
        </button>
      `;
    } else {
      imagePreview.innerHTML = '';
    }
    
    document.getElementById('read-modal').style.display = 'none';
    document.getElementById('entry-modal').style.display = 'block';
  }
});

// 🗑️ Supprimer
document.getElementById('delete-entry-btn').addEventListener('click', () => {
  if (currentEditingIndex !== null) {
    if (confirm(t('deleteConfirm'))) {
      entries.splice(currentEditingIndex, 1);
      saveEntries();
      document.getElementById('read-modal').style.display = 'none';
      loadEntries();
    }
  }
});

// 🔍 Recherche
document.getElementById('search-box').addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  filterAndShowEntries(searchTerm, activeFilters);
});

// 🏷️ Filtres par tags
function updateFilterTags() {
  const allTags = new Set();
  entries.forEach(entry => {
    if (entry.tags) {
      entry.tags.forEach(tag => allTags.add(tag));
    }
  });
  
  const filterContainer = document.getElementById('filter-tags');
  filterContainer.innerHTML = '';
  
  allTags.forEach(tag => {
    const btn = document.createElement('button');
    btn.className = 'tag-filter';
    btn.textContent = `🏷️ ${tag}`;
    btn.onclick = () => toggleFilter(tag, btn);
    filterContainer.appendChild(btn);
  });
}

function toggleFilter(tag, btn) {
  const index = activeFilters.indexOf(tag);
  if (index > -1) {
    activeFilters.splice(index, 1);
    btn.classList.remove('active');
  } else {
    activeFilters.push(tag);
    btn.classList.add('active');
  }
  
  const searchTerm = document.getElementById('search-box').value.toLowerCase();
  filterAndShowEntries(searchTerm, activeFilters);
}

document.getElementById('clear-filters-btn').addEventListener('click', () => {
  activeFilters = [];
  document.getElementById('search-box').value = '';
  document.querySelectorAll('.tag-filter').forEach(btn => btn.classList.remove('active'));
  showEntries(entries);
});

function filterAndShowEntries(searchTerm, filters) {
  let filtered = entries;
  
  // Filtrer par recherche
  if (searchTerm) {
    filtered = filtered.filter(entry => 
      entry.title.toLowerCase().includes(searchTerm) ||
      entry.content.toLowerCase().includes(searchTerm) ||
      (entry.tags && entry.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
    );
  }
  
  // Filtrer par tags
  if (filters.length > 0) {
    filtered = filtered.filter(entry =>
      entry.tags && filters.every(filter => entry.tags.includes(filter))
    );
  }
  
  showEntries(filtered);
}

// 📊 Statistiques
function updateStats() {
  const total = entries.length;
  document.getElementById('stat-total').textContent = total;
  
  // Entrées ce mois-ci
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonth = entries.filter(entry => {
    const date = new Date(entry.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).length;
  document.getElementById('stat-month').textContent = thisMonth;
  
  // Humeur dominante
  const moodCount = {};
  entries.forEach(entry => {
    moodCount[entry.mood] = (moodCount[entry.mood] || 0) + 1;
  });
  const dominantMood = Object.keys(moodCount).reduce((a, b) => 
    moodCount[a] > moodCount[b] ? a : b, '😊'
  );
  document.getElementById('stat-mood').textContent = dominantMood || '😊';
  
  // Streak (jours consécutifs)
  const streak = calculateStreak();
  document.getElementById('stat-streak').textContent = streak;
}

function calculateStreak() {
  if (entries.length === 0) return 0;
  
  const dates = entries.map(e => new Date(e.date).toDateString()).sort();
  const uniqueDates = [...new Set(dates)].sort((a, b) => new Date(b) - new Date(a));
  
  let streak = 1;
  const today = new Date().toDateString();
  
  if (uniqueDates[0] !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (uniqueDates[0] !== yesterday.toDateString()) {
      return 0;
    }
  }
  
  for (let i = 1; i < uniqueDates.length; i++) {
    const current = new Date(uniqueDates[i]);
    const previous = new Date(uniqueDates[i - 1]);
    const diffTime = previous - current;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

document.getElementById('stats-btn').addEventListener('click', () => {
  const panel = document.getElementById('stats-panel');
  panel.classList.toggle('active');
  updateStats();
});

// 🎨 Thèmes
document.getElementById('theme-btn').addEventListener('click', () => {
  document.getElementById('theme-modal').style.display = 'block';
});

document.querySelectorAll('.theme-option').forEach(btn => {
  btn.addEventListener('click', () => {
    const theme = btn.dataset.theme;
    setTheme(theme);
    document.getElementById('theme-modal').style.display = 'none';
  });
});

// ⚙️ Paramètres
document.getElementById('settings-btn').addEventListener('click', () => {
  document.getElementById('settings-modal').style.display = 'block';
});

document.getElementById('change-password-btn').addEventListener('click', () => {
  const newPassword = prompt('Entre ton nouveau mot de passe (min. 4 caractères) :');
  if (newPassword && newPassword.length >= 4) {
    const confirmPassword = prompt('Confirme ton nouveau mot de passe :');
    if (newPassword === confirmPassword) {
      // Récupérer les entrées actuelles
      const currentEntries = entries;
      
      // Changer le mot de passe
      const newPasswordHash = CryptoJS.SHA256(newPassword).toString();
      localStorage.setItem('intima-password-hash', newPasswordHash);
      userPassword = newPassword;
      
      // Re-chiffrer les entrées avec le nouveau mot de passe
      entries = currentEntries;
      saveEntries();
      
      alert('Mot de passe changé avec succès ! 🔐');
      document.getElementById('settings-modal').style.display = 'none';
    } else {
      alert(t('passwordMatch'));
    }
  } else if (newPassword !== null) {
    alert('Le mot de passe doit contenir au moins 4 caractères');
  }
});

document.getElementById('change-alias-btn').addEventListener('click', () => {
  const newAlias = prompt('Choisis ton nouveau petit nom :', userAlias);
  if (newAlias && newAlias.trim()) {
    // Récupérer les entrées actuelles
    const currentEntries = entries;
    
    // Changer l'alias
    userAlias = newAlias.trim();
    localStorage.setItem('intima-alias', userAlias);
    
    // Re-chiffrer les entrées avec le nouvel alias
    entries = currentEntries;
    saveEntries();
    
    updateUITexts();
    alert('Ton nouveau petit nom est enregistré ! ✨');
    document.getElementById('settings-modal').style.display = 'none';
  }
});

document.getElementById('lock-journal-btn').addEventListener('click', () => {
  if (confirm('Verrouiller le journal ? Tu devras entrer ton mot de passe pour y accéder à nouveau.')) {
    document.getElementById('settings-modal').style.display = 'none';
    document.getElementById('journal-screen').classList.remove('active');
    document.getElementById('password-screen').classList.add('active');
    document.getElementById('password-input').value = '';
    document.getElementById('password-error').style.display = 'none';
    initPasswordScreen();
  }
});

document.getElementById('delete-all-btn').addEventListener('click', () => {
  const confirmation = prompt('⚠️ ATTENTION ! Pour tout supprimer, tape "SUPPRIMER" :');
  if (confirmation === 'SUPPRIMER') {
    if (confirm('Es-tu vraiment sûre ? Cette action est irréversible ! 😢')) {
      localStorage.clear();
      entries = [];
      alert('Tout a été supprimé. À bientôt... 💔');
      location.reload();
    }
  }
});

// 📤 Export
document.getElementById('export-btn').addEventListener('click', () => {
  if (entries.length === 0) {
    alert('Ton journal est vide, il n\'y a rien à exporter ! 📝');
    return;
  }
  
  const dataToExport = {
    alias: userAlias,
    entries: entries,
    exportDate: new Date().toISOString(),
    version: '2.0'
  };
  
  const encrypted = encryptData(dataToExport);
  const blob = new Blob([encrypted], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `intima-${userAlias}-${new Date().toISOString().split('T')[0]}.secret`;
  a.click();
  URL.revokeObjectURL(url);
  
  alert(t('exportSuccess'));
});

// 📥 Import
document.getElementById('import-btn').addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.secret';
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const encrypted = event.target.result;
      const imported = decryptData(encrypted);
      
      if (!imported || !imported.entries) {
        alert(t('invalidFile'));
        return;
      }

      if (confirm(`Importer ${imported.entries.length} entrées ? Cela va fusionner avec tes entrées actuelles.`)) {
        // Fusionner les entrées
        entries = [...entries, ...imported.entries];
        
        // Supprimer les doublons par date
        const uniqueEntries = [];
        const seenDates = new Set();
        entries.forEach(entry => {
          if (!seenDates.has(entry.date)) {
            seenDates.add(entry.date);
            uniqueEntries.push(entry);
          }
        });
        entries = uniqueEntries;
        
        saveEntries();
        loadEntries();
        alert(t('importSuccess'));
      }
    };
    reader.readAsText(file);
  };
  input.click();
});

// 🌙 Changement de langue
document.getElementById('lang-select').addEventListener('change', e => {
  setLanguage(e.target.value);
  loadEntries(); // Recharger pour mettre à jour les dates
});

// ❌ Fermer les modaux
document.querySelectorAll('.modal-close').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.closest('.modal').style.display = 'none';
  });
});

window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    e.target.style.display = 'none';
  }
});

// 🎀 Easter Egg
document.getElementById('easter-egg-trigger').addEventListener('click', () => {
  easterEggClicks++;
  if (easterEggClicks >= 5) {
    document.getElementById('easter-egg-message').style.display = 'block';
    easterEggClicks = 0;
    
    // Animation surprise
    document.body.style.animation = 'pulse 0.5s ease';
    setTimeout(() => {
      document.body.style.animation = '';
    }, 500);
  }
});

// 🎀 Initialisation
document.addEventListener('DOMContentLoaded', () => {
  // Charger la langue
  currentLang = localStorage.getItem('intima-lang') || 'fr';
  document.getElementById('lang-select').value = currentLang;
  setLanguage(currentLang);
  
  // Charger le thème
  const savedTheme = localStorage.getItem('intima-theme') || 'default';
  setTheme(savedTheme);
  
  // Vérifier si un mot de passe existe
  const hasPassword = localStorage.getItem('intima-password-hash');
  userAlias = localStorage.getItem('intima-alias');
  
  if (!hasPassword) {
    // Premier lancement - créer le mot de passe
    document.getElementById('password-screen').classList.add('active');
    initPasswordScreen();
  } else {
    // Demander le mot de passe
    document.getElementById('password-screen').classList.add('active');
    initPasswordScreen();
  }
});

// 📱 PWA Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker enregistré avec succès:', registration.scope);
      })
      .catch(error => {
        console.log('Échec de l\'enregistrement du Service Worker:', error);
      });
  });
}

// 🔄 Drag & Drop pour réorganiser (fonctionnalité future)
// Cette fonctionnalité peut être ajoutée plus tard pour permettre
// de réorganiser les entrées par glisser-déposer

// 💡 Tips: Appuyer sur Échap pour fermer les modaux
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal').forEach(modal => {
      modal.style.display = 'none';
    });
  }
});