// Langues
const translations = {
  fr: {
    greeting: "Bienvenue, {name}",
    newEntry: "+ Nouvelle entrée",
    exportData: "💾 Exporter",
    importData: "📂 Importer",
    logout: "🚪 Déconnexion",
    login: "Se connecter",
    register: "Créer un compte",
    entryTitle: "Titre de l'entrée",
    entryContent: "Écrivez votre pensée...",
    save: "Sauvegarder",
    delete: "Supprimer",
    mood: "Humeur",
    happy: "😊 Heureux",
    sad: "😢 Triste",
    angry: "😠 En colère",
    calm: "😌 Calme",
    excited: "🤩 Excité",
    noEntries: "Aucune entrée. Commencez à écrire !",
    exportSuccess: "Données exportées avec succès !",
    importSuccess: "Données importées avec succès !",
    invalidFile: "Fichier invalide.",
    loginFailed: "Identifiants incorrects.",
    registerSuccess: "Compte créé avec succès !",
    registerFailed: "Ce nom d'utilisateur existe déjà.",
    deleteConfirm: "Êtes-vous sûr de vouloir supprimer cette entrée ?"
  },
  en: {
    greeting: "Welcome, {name}",
    newEntry: "+ New Entry",
    exportData: "💾 Export",
    importData: "📂 Import",
    logout: "🚪 Logout",
    login: "Login",
    register: "Register",
    entryTitle: "Entry Title",
    entryContent: "Write your thoughts...",
    save: "Save",
    delete: "Delete",
    mood: "Mood",
    happy: "😊 Happy",
    sad: "😢 Sad",
    angry: "😠 Angry",
    calm: "😌 Calm",
    excited: "🤩 Excited",
    noEntries: "No entries yet. Start writing!",
    exportSuccess: "Data exported successfully!",
    importSuccess: "Data imported successfully!",
    invalidFile: "Invalid file.",
    loginFailed: "Invalid credentials.",
    registerSuccess: "Account created successfully!",
    registerFailed: "Username already exists.",
    deleteConfirm: "Are you sure you want to delete this entry?"
  },
  es: {
    greeting: "Bienvenido, {name}",
    newEntry: "+ Nueva entrada",
    exportData: "💾 Exportar",
    importData: "📂 Importar",
    logout: "🚪 Cerrar sesión",
    login: "Iniciar sesión",
    register: "Registrarse",
    entryTitle: "Título de la entrada",
    entryContent: "Escribe tus pensamientos...",
    save: "Guardar",
    delete: "Eliminar",
    mood: "Estado de ánimo",
    happy: "😊 Feliz",
    sad: "😢 Triste",
    angry: "😠 Enojado",
    calm: "😌 Tranquilo",
    excited: "🤩 Emocionado",
    noEntries: "Aún no hay entradas. ¡Empieza a escribir!",
    exportSuccess: "¡Datos exportados con éxito!",
    importSuccess: "¡Datos importados con éxito!",
    invalidFile: "Archivo inválido.",
    loginFailed: "Credenciales inválidas.",
    registerSuccess: "¡Cuenta creada con éxito!",
    registerFailed: "El nombre de usuario ya existe.",
    deleteConfirm: "¿Estás seguro de que quieres eliminar esta entrada?"
  }
};

let currentLang = localStorage.getItem('intima-lang') || 'fr';
let currentUser = null;

// Appliquer la langue
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
  document.getElementById('greeting').innerText = currentUser ? t('greeting', { name: currentUser }) : t('greeting', { name: '' });
  document.getElementById('new-entry-btn').innerText = t('newEntry');
  document.getElementById('export-btn').innerText = t('exportData');
  document.getElementById('import-btn').innerText = t('importData');
  document.getElementById('logout-btn').innerText = t('logout');
  document.getElementById('login-btn').innerText = t('login');
  document.getElementById('register-btn').innerText = t('register');
  document.getElementById('entry-title').placeholder = t('entryTitle');
  document.getElementById('entry-content').placeholder = t('entryContent');
  document.getElementById('save-entry-btn').innerText = t('save');
  document.getElementById('entry-mood').innerHTML = `
    <option value="happy">${t('happy')}</option>
    <option value="sad">${t('sad')}</option>
    <option value="angry">${t('angry')}</option>
    <option value="calm">${t('calm')}</option>
    <option value="excited">${t('excited')}</option>
  `;
}

// Chiffrement
function encryptData(data, password) {
  return CryptoJS.AES.encrypt(JSON.stringify(data), password).toString();
}

function decryptData(encrypted, password) {
  const bytes = CryptoJS.AES.decrypt(encrypted, password);
  try {
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (e) {
    return null;
  }
}

// Stockage
function saveUserData(username, passwordHash, entries) {
  const data = { username, passwordHash, entries };
  localStorage.setItem('intima-user', JSON.stringify(data));
}

function loadUserData() {
  const data = localStorage.getItem('intima-user');
  return data ? JSON.parse(data) : null;
}

// Auth
document.getElementById('register-btn').addEventListener('click', () => {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  if (!username || !password) return alert("Veuillez remplir tous les champs");

  const userData = loadUserData();
  if (userData && userData.username === username) {
    return alert(t('registerFailed'));
  }

  const passwordHash = CryptoJS.SHA256(password).toString();
  saveUserData(username, passwordHash, []);
  alert(t('registerSuccess'));
});

document.getElementById('login-btn').addEventListener('click', () => {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const userData = loadUserData();

  if (!userData || userData.username !== username) {
    return alert(t('loginFailed'));
  }

  const passwordHash = CryptoJS.SHA256(password).toString();
  if (passwordHash !== userData.passwordHash) {
    return alert(t('loginFailed'));
  }

  currentUser = username;
  showJournal(userData.entries);
  document.getElementById('auth-screen').classList.remove('active');
  document.getElementById('journal-screen').classList.add('active');
  updateUITexts();
});

document.getElementById('logout-btn').addEventListener('click', () => {
  currentUser = null;
  document.getElementById('journal-screen').classList.remove('active');
  document.getElementById('auth-screen').classList.add('active');
});

// Journal
function showJournal(entries) {
  const container = document.getElementById('entries-container');
  container.innerHTML = '';

  if (entries.length === 0) {
    container.innerHTML = `<p>${t('noEntries')}</p>`;
    return;
  }

  entries.forEach((entry, index) => {
    const card = document.createElement('div');
    card.className = 'entry-card';
    card.innerHTML = `
      <h3>${entry.title || 'Sans titre'}</h3>
      <div class="date">${new Date(entry.date).toLocaleDateString(currentLang)}</div>
      <div class="mood">${getMoodEmoji(entry.mood)}</div>
      <p>${entry.content.substring(0, 100)}${entry.content.length > 100 ? '...' : ''}</p>
      <button class="delete-btn" data-index="${index}">${t('delete')}</button>
    `;
    container.appendChild(card);
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = e.target.dataset.index;
      if (confirm(t('deleteConfirm'))) {
        const userData = loadUserData();
        userData.entries.splice(index, 1);
        saveUserData(currentUser, userData.passwordHash, userData.entries);
        showJournal(userData.entries);
      }
    });
  });
}

function getMoodEmoji(mood) {
  const emojis = {
    happy: "😊",
    sad: "😢",
    angry: "😠",
    calm: "😌",
    excited: "🤩"
  };
  return emojis[mood] || "💭";
}

// Modal
const modal = document.getElementById('entry-modal');
const closeModal = document.querySelector('.close');
closeModal.onclick = () => modal.style.display = "none";
window.onclick = (event) => {
  if (event.target == modal) modal.style.display = "none";
};

document.getElementById('new-entry-btn').addEventListener('click', () => {
  document.getElementById('entry-title').value = '';
  document.getElementById('entry-content').value = '';
  document.getElementById('entry-mood').value = 'calm';
  modal.style.display = "block";
});

document.getElementById('save-entry-btn').addEventListener('click', () => {
  const title = document.getElementById('entry-title').value.trim();
  const content = document.getElementById('entry-content').value.trim();
  const mood = document.getElementById('entry-mood').value;

  if (!content) return alert("Le contenu ne peut pas être vide");

  const userData = loadUserData();
  userData.entries.push({
    title,
    content,
    mood,
    date: new Date().toISOString()
  });

  saveUserData(currentUser, userData.passwordHash, userData.entries);
  modal.style.display = "none";
  showJournal(userData.entries);
});

// Export / Import
document.getElementById('export-btn').addEventListener('click', () => {
  const userData = loadUserData();
  const encrypted = encryptData({ entries: userData.entries }, document.getElementById('password').value);
  const blob = new Blob([encrypted], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${currentUser}.intima`;
  a.click();
  URL.revokeObjectURL(url);
  alert(t('exportSuccess'));
});

document.getElementById('import-btn').addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.intima';
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const encrypted = event.target.result;
      const decrypted = decryptData(encrypted, document.getElementById('password').value);
      if (!decrypted) return alert(t('invalidFile'));

      const userData = loadUserData();
      userData.entries = decrypted.entries;
      saveUserData(currentUser, userData.passwordHash, userData.entries);
      showJournal(userData.entries);
      alert(t('importSuccess'));
    };
    reader.readAsText(file);
  };
  input.click();
});

// Langue
document.getElementById('lang-select').value = currentLang;
document.getElementById('lang-select').addEventListener('change', (e) => {
  setLanguage(e.target.value);
});

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  setLanguage(currentLang);
  const saved = loadUserData();
  if (saved) {
    document.getElementById('username').value = saved.username;
  }
});

// PWA : Enregistrement du Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('Service Worker registered'))
      .catch(err => console.log('Service Worker registration failed:', err));
  });
}