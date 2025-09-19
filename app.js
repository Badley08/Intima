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
    joy: "😊",
    sadness: "😢",
    love: "💗",
    peace: "🕊️",
    fire: "🔥"
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
    joy: "😊",
    sadness: "😢",
    love: "💗",
    peace: "🕊️",
    fire: "🔥"
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
    joy: "😊",
    sadness: "😢",
    love: "💗",
    peace: "🕊️",
    fire: "🔥"
  }
};

let currentLang = localStorage.getItem('intima-lang') || 'fr';
let userAlias = localStorage.getItem('intima-alias') || null;

// 🌸 Appliquer la langue
function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('intima-lang', lang);
  document.getElementById('html-root').setAttribute('lang', lang);
  updateUITexts();
}

function t(key, replacements = {}) {
  let str = translations[currentLang][key] || key;
  for (let [k, v] of Object.entries(replacements)) {
    str = str.replace(`{${k}}`, v);
  }
  return str;
}

function updateUITexts() {
  if (userAlias) {
    document.getElementById('greeting').innerText = t('greeting', { name: userAlias });
  }
  document.getElementById('start-btn').innerText = t('start');
  document.getElementById('user-alias').placeholder = t('placeholderAlias');
  document.getElementById('entry-title').placeholder = t('entryTitle');
  document.getElementById('entry-content').placeholder = t('entryContent');
  document.getElementById('save-entry-btn').innerText = t('save');
  document.querySelector('.mood-selector span').innerText = t('moodLabel');
}

// 🚀 Démarrage
document.getElementById('start-btn').addEventListener('click', () => {
  const aliasInput = document.getElementById('user-alias');
  const alias = aliasInput.value.trim() || 'Belle Inconnue';

  userAlias = alias;
  localStorage.setItem('intima-alias', alias);

  // Passer à l'écran du journal
  document.getElementById('welcome-screen').classList.remove('active');
  document.getElementById('journal-screen').classList.add('active');

  loadEntries();
  updateUITexts();
});

// 🔐 Chiffrement (basé sur l'alias — simple mais efficace pour usage perso)
function getEncryptionKey() {
  return CryptoJS.SHA256(userAlias).toString();
}

function encryptData(data) {
  return CryptoJS.AES.encrypt(JSON.stringify(data), getEncryptionKey()).toString();
}

function decryptData(encrypted) {
  const bytes = CryptoJS.AES.decrypt(encrypted, getEncryptionKey());
  try {
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (e) {
    return null;
  }
}

// 💾 Gestion des entrées
function saveEntries(entries) {
  localStorage.setItem('intima-entries', encryptData(entries));
}

function loadEntries() {
  const encrypted = localStorage.getItem('intima-entries');
  if (!encrypted) {
    showEntries([]);
    return;
  }
  const entries = decryptData(encrypted) || [];
  showEntries(entries);
}

function showEntries(entries) {
  const container = document.getElementById('entries-container');
  container.innerHTML = '';

  if (entries.length === 0) {
    container.innerHTML = `<p style="text-align:center; color:var(--text); font-style:italic; padding: 3rem 1rem;">${t('noEntries')}</p>`;
    return;
  }

  entries.forEach((entry, index) => {
    const card = document.createElement('div');
    card.className = 'entry-card';
    card.innerHTML = `
      <h3>${entry.title || 'Sans titre'}</h3>
      <div class="date">${new Date(entry.date).toLocaleDateString(currentLang)}</div>
      <div class="mood">${entry.mood}</div>
      <p>${entry.content}</p>
    `;
    container.appendChild(card);
  });
}

// ➕ Nouvelle entrée
const modal = document.getElementById('entry-modal');
document.getElementById('new-entry-btn').addEventListener('click', () => {
  document.getElementById('entry-title').value = '';
  document.getElementById('entry-content').value = '';
  modal.style.display = 'block';
});

document.querySelector('.modal-close').addEventListener('click', () => {
  modal.style.display = 'none';
});

// 🎭 Sélection d'humeur
document.querySelectorAll('.mood-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mood-btn').forEach(b => b.style.transform = 'scale(1)');
    btn.style.transform = 'scale(1.2)';
    document.getElementById('selected-mood').value = btn.dataset.mood;
  });
});

// 💾 Sauvegarde
document.getElementById('save-entry-btn').addEventListener('click', () => {
  const title = document.getElementById('entry-title').value.trim();
  const content = document.getElementById('entry-content').value.trim();
  const moodBtn = document.querySelector('.mood-btn[style*="scale(1.2)"]');
  const mood = moodBtn ? moodBtn.dataset.mood : 'peace';

  if (!content) return;

  const entries = decryptData(localStorage.getItem('intima-entries')) || [];
  entries.push({
    title,
    content,
    mood: translations[currentLang][mood],
    date: new Date().toISOString()
  });

  saveEntries(entries);
  modal.style.display = 'none';
  showEntries(entries);
});

// 📤 Export
document.getElementById('export-btn').addEventListener('click', () => {
  const encrypted = localStorage.getItem('intima-entries');
  if (!encrypted) return;

  const blob = new Blob([encrypted], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `intima-${userAlias}.secret`;
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
      const testDecrypt = decryptData(encrypted);
      if (!testDecrypt) {
        alert(t('invalidFile'));
        return;
      }

      localStorage.setItem('intima-entries', encrypted);
      showEntries(testDecrypt);
      alert(t('importSuccess'));
    };
    reader.readAsText(file);
  };
  input.click();
});

// 🌙 Changement de langue
document.getElementById('lang-select').value = currentLang;
document.getElementById('lang-select').addEventListener('change', e => {
  setLanguage(e.target.value);
});

// 🎀 Initialisation
document.addEventListener('DOMContentLoaded', () => {
  setLanguage(currentLang);

  // Si alias existe déjà → aller direct au journal
  if (userAlias) {
    document.getElementById('welcome-screen').classList.remove('active');
    document.getElementById('journal-screen').classList.add('active');
    loadEntries();
    updateUITexts();
  }
});

// 📱 PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .catch(console.error);
  });
}