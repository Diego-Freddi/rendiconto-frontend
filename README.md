# 🎨 Rendiconto Frontend

Applicazione web React per la compilazione di rendiconti per amministratori di sostegno. Interfaccia moderna e intuitiva per gestire beneficiari, rendiconti e generare PDF conformi al modello ufficiale.

## 🚀 Tecnologie Utilizzate

- **Framework**: React 18.2.0
- **Routing**: React Router DOM 6.22.3
- **Styling**: Bootstrap 5.3.3 + Bootstrap Icons 1.13.1
- **State Management**: Context API
- **HTTP Client**: Axios 1.9.0
- **PDF Generation**: @react-pdf/renderer 4.3.0
- **Notifications**: react-toastify 11.0.5
- **Form Handling**: react-hook-form 7.57.0 + @hookform/resolvers 5.1.1
- **Validation**: yup 1.6.1
- **UI Components**: react-bootstrap 2.10.8

## ✨ Funzionalità Implementate

### 🔐 Autenticazione
- ✅ Login/Registrazione con validazione
- ✅ Gestione sessioni con JWT
- ✅ Profilo amministratore completo
- ✅ Logout automatico su token scaduto

### 👥 Gestione Beneficiari
- ✅ Lista beneficiari con ricerca e paginazione
- ✅ Creazione/modifica beneficiari
- ✅ Dati anagrafici completi
- ✅ Condizioni personali
- ✅ Situazione patrimoniale (beni immobili, mobili, titoli)
- ✅ Soft delete e riattivazione

### 📊 Gestione Rendiconti
- ✅ Lista rendiconti con filtri
- ✅ Form multi-step per compilazione
- ✅ Periodo flessibile (data inizio/fine)
- ✅ Conto economico (entrate/uscite)
- ✅ Categorie personalizzabili
- ✅ Stati: bozza/completato/inviato

### ✍️ Firma Digitale
- ✅ Upload immagine firma (PNG, JPG, JPEG)
- ✅ Drag & drop per caricamento file
- ✅ Applicazione firma ai rendiconti
- ✅ Visualizzazione in dettaglio e PDF
- ✅ Verifica password per operazioni sensibili

### 📄 Generazione PDF
- ✅ PDF conforme al modello ufficiale (7 pagine)
- ✅ Layout professionale
- ✅ Calcoli automatici e totali
- ✅ Download diretto dal browser

### 🎨 UI/UX
- ✅ Design moderno con Bootstrap 5
- ✅ Interfaccia responsive
- ✅ Dashboard con statistiche
- ✅ Sidebar di navigazione
- ✅ Loading states e feedback utente
- ✅ Toast notifications

## 🛠️ Setup Locale

### 1. Prerequisiti
```bash
node --version  # Node.js richiesto
npm --version   # npm richiesto
```

### 2. Installazione
```bash
cd frontend
npm install
```

### 3. Configurazione
```bash
# Crea file .env.local
touch .env.local

# Aggiungi variabili d'ambiente
echo "REACT_APP_API_URL=http://localhost:5050/api" >> .env.local
```

### 4. Avvio
```bash
# Sviluppo
npm start

# Build produzione
npm run build

# Test build locale
npm run build && npx serve -s build
```

L'applicazione sarà disponibile su `http://localhost:3000`

## 🔧 Variabili d'Ambiente

Crea un file `.env.local` nella root del progetto:

```env
# API Backend
REACT_APP_API_URL=http://localhost:5050/api
```

### Per Deploy
```env
# Produzione
REACT_APP_API_URL=https://rendiconto-backend.onrender.com/api
```

## 🚀 Deploy su Vercel

### 1. Preparazione
- Account su [Vercel.com](https://vercel.com)
- Repository GitHub con il codice
- Backend deployato e funzionante

### 2. Deploy da GitHub
1. Vai su vercel.com
2. "New Project" → Importa da GitHub
3. Seleziona repository frontend
4. Configura variabili d'ambiente

### 3. Configurazione Vercel
**Build Settings**:
- **Framework Preset**: Create React App
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm install`

**Environment Variables**:
```
REACT_APP_API_URL = https://rendiconto-backend.onrender.com/api
```

## 📁 Struttura Progetto

```
frontend/
├── public/                 # File statici
│   ├── index.html         # Template HTML
│   ├── favicon.ico        # Icona sito
│   └── manifest.json      # PWA manifest
├── src/
│   ├── components/        # Componenti riutilizzabili
│   │   ├── Auth/          # ProtectedRoute
│   │   ├── Layout/        # Layout e navigazione
│   │   ├── PDF/           # RendicontoPDF
│   │   └── Firma/         # FirmaManager, FirmaApplicator
│   ├── contexts/          # Context API
│   │   ├── AuthContext.js # Autenticazione e profilo
│   │   ├── RendicontoContext.js # Gestione rendiconti
│   │   ├── BeneficiarioContext.js # Gestione beneficiari
│   │   └── CategoriaContext.js # Gestione categorie
│   ├── pages/             # Pagine principali
│   │   ├── Auth/          # Login, Register
│   │   ├── Dashboard/     # Dashboard
│   │   ├── Rendiconti/    # RendicontoList, RendicontoForm, RendicontoDetail
│   │   ├── Beneficiari/   # BeneficiariList, BeneficiarioForm, BeneficiarioDetail
│   │   ├── Categorie/     # Categorie
│   │   └── Profile/       # Profile
│   ├── utils/             # Utilità (categoriaUtils)
│   ├── App.js             # Componente principale con routing
│   ├── index.js           # Entry point
│   └── index.css          # Stili globali
├── package.json           # Dipendenze e script
└── README.md             # Questa documentazione
```

## 🧩 Componenti Principali

### Context Providers
```javascript
// AuthContext - Gestione autenticazione
const { user, login, logout, updateProfileCompleto, uploadFirma } = useAuth();

// RendicontoContext - Gestione rendiconti
const { rendiconti, fetchRendiconti, createRendiconto, updateRendiconto } = useRendiconto();

// BeneficiarioContext - Gestione beneficiari
const { beneficiari, fetchBeneficiari, createBeneficiario, updateBeneficiario } = useBeneficiario();

// CategoriaContext - Gestione categorie
const { categorie, fetchCategorie, createCategoria } = useCategoria();
```

### Routes Implementate
```javascript
// Routes pubbliche
/login                    # Login
/register                 # Registrazione

// Routes protette
/dashboard               # Dashboard principale
/rendiconti              # Lista rendiconti
/rendiconti/nuovo        # Nuovo rendiconto
/rendiconti/:id          # Dettaglio rendiconto
/rendiconti/:id/modifica # Modifica rendiconto
/beneficiari             # Lista beneficiari
/beneficiari/nuovo       # Nuovo beneficiario
/beneficiari/:id         # Dettaglio beneficiario
/beneficiari/:id/modifica # Modifica beneficiario
/categorie               # Gestione categorie
/profilo                 # Profilo amministratore
```

### Componenti Firma
```javascript
// Manager firma completo
<FirmaManager />

// Applicatore firma ai rendiconti
<FirmaApplicator 
  onFirmaApplicata={handleFirma}
  rendicontoId={id}
/>
```

### Generazione PDF
```javascript
// Componente PDF
<RendicontoPDF 
  rendiconto={rendiconto}
  amministratore={user}
/>

// Download PDF
<PDFDownloadLink 
  document={<RendicontoPDF />}
  fileName="rendiconto.pdf"
>
  Scarica PDF
</PDFDownloadLink>
```

## 📝 Script Disponibili

```bash
npm start            # Avvia server sviluppo
npm run build        # Build per produzione
npm test             # Esegue test
npm run eject        # Eject da Create React App (irreversibile)
```

## 🔒 Sicurezza

- **JWT Storage**: localStorage con auto-logout
- **API Calls**: Interceptors Axios per token automatico
- **CORS**: Configurato per backend specifico
- **Route Protection**: ProtectedRoute component
- **Form Validation**: react-hook-form + yup

## 🆘 Troubleshooting

### Errore CORS
```bash
# Verifica URL backend nel .env.local
echo $REACT_APP_API_URL

# Test connessione API
curl -X GET $REACT_APP_API_URL/health
```

### Errore Build
```bash
# Pulisci cache
rm -rf node_modules package-lock.json
npm install
```

### Errore PDF
```bash
# Verifica dipendenze PDF
npm list @react-pdf/renderer
```

---

**Versione**: 2.0.0  
**Ultimo aggiornamento**: Giugno 2025  
**Autore**: Diego Freddi 