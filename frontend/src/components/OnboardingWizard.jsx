/* ===============================================================================
   BAKAL — OnboardingWizard Component
   Multi-step modal wizard for first-time users.
   Steps: Welcome → Company Profile → Document Upload → API Keys Setup → Done
   =============================================================================== */

import { useState, useRef } from 'react';

/* ─── Constants ─── */

const STEPS = [
  { id: 'welcome', label: 'Bienvenue' },
  { id: 'company', label: 'Entreprise' },
  { id: 'documents', label: 'Documents' },
  { id: 'apikeys', label: 'Cl\u00e9s API' },
  { id: 'done', label: 'Termin\u00e9' },
];

const SECTOR_OPTIONS = [
  'Tech / SaaS',
  'Conseil / Consulting',
  'Agence / Marketing',
  'Finance / Assurance',
  'Immobilier',
  'Sant\u00e9',
  'Industrie',
  'Formation / \u00c9ducation',
  'E-commerce',
  'Autre',
];

const SIZE_OPTIONS = [
  '1-10 salari\u00e9s',
  '11-50 salari\u00e9s',
  '51-200 salari\u00e9s',
  '201-500 salari\u00e9s',
  '500+ salari\u00e9s',
];

const STORAGE_KEY = 'bakal_onboarding_complete';
const PROFILE_KEY = 'bakal_onboarding_profile';

/* ─── Inline styles following AuthGate / SettingsPage patterns ─── */

const s = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 10000,
    background: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font)',
    backdropFilter: 'blur(4px)',
  },
  modal: {
    width: '100%',
    maxWidth: 560,
    maxHeight: '90vh',
    overflowY: 'auto',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius, 12px)',
    padding: 32,
    position: 'relative',
  },
  skipBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: 12,
    cursor: 'pointer',
    fontFamily: 'var(--font)',
    padding: '4px 8px',
  },
  progressBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 600,
    border: '1.5px solid var(--border)',
    background: 'var(--bg-elevated)',
    color: 'var(--text-muted)',
    transition: 'all 0.2s',
    flexShrink: 0,
  },
  stepDotActive: {
    background: 'var(--text-primary)',
    borderColor: 'var(--text-primary)',
    color: 'var(--bg-primary)',
  },
  stepDotDone: {
    background: 'var(--success, #4caf50)',
    borderColor: 'var(--success, #4caf50)',
    color: 'white',
  },
  stepConnector: {
    width: 24,
    height: 1.5,
    background: 'var(--border)',
    flexShrink: 0,
  },
  stepConnectorDone: {
    background: 'var(--success, #4caf50)',
  },
  title: {
    fontSize: 20,
    fontWeight: 600,
    color: 'var(--text-primary)',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: 'var(--text-secondary)',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 1.6,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    display: 'block',
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--text-secondary)',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm, 8px)',
    color: 'var(--text-primary)',
    fontSize: 14,
    fontFamily: 'var(--font)',
    outline: 'none',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '10px 14px',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm, 8px)',
    color: 'var(--text-primary)',
    fontSize: 14,
    fontFamily: 'var(--font)',
    outline: 'none',
    boxSizing: 'border-box',
    appearance: 'none',
  },
  navRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 28,
    gap: 12,
  },
  btnPrimary: {
    padding: '10px 24px',
    background: 'var(--text-primary)',
    color: 'var(--bg-primary)',
    border: 'none',
    borderRadius: 'var(--radius-sm, 8px)',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'var(--font)',
  },
  btnGhost: {
    padding: '10px 20px',
    background: 'none',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm, 8px)',
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: 'var(--font)',
  },
  uploadZone: {
    border: '2px dashed var(--border)',
    borderRadius: 'var(--radius-sm, 8px)',
    padding: '32px 24px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'border-color 0.2s, background 0.2s',
    background: 'var(--bg-primary)',
  },
  uploadIcon: {
    fontSize: 28,
    marginBottom: 8,
    color: 'var(--text-muted)',
  },
  uploadText: {
    fontSize: 13,
    color: 'var(--text-secondary)',
    marginBottom: 4,
  },
  uploadHint: {
    fontSize: 11,
    color: 'var(--text-muted)',
  },
  fileItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm, 8px)',
    marginTop: 8,
    fontSize: 12,
    color: 'var(--text-primary)',
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: 14,
    padding: '0 4px',
    fontFamily: 'var(--font)',
  },
  apiKeyRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    marginBottom: 14,
  },
  apiKeyLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--text-secondary)',
  },
  hint: {
    fontSize: 11,
    color: 'var(--text-muted)',
    marginTop: 2,
  },
  brandRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
  },
  brandIcon: {
    width: 40,
    height: 40,
    background: 'var(--text-primary)',
    color: 'var(--bg-primary)',
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 20,
  },
  brandText: {
    fontSize: 24,
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  brandSuffix: {
    color: 'var(--text-muted)',
  },
  doneIcon: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    background: 'var(--success, #4caf50)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 28,
    margin: '0 auto 16px',
  },
};

/* ─── Core API keys for onboarding (subset of SettingsPage keys) ─── */

const ONBOARDING_API_KEYS = [
  {
    key: 'lemlistKey',
    name: 'Lemlist',
    icon: '\u2709\ufe0f',
    placeholder: 'Copiez depuis Lemlist \u2192 Settings \u2192 Integrations',
    hint: 'Lemlist \u2192 Settings \u2192 Integrations \u2192 API',
  },
  {
    key: 'claudeKey',
    name: 'Claude (Anthropic)',
    icon: '\ud83e\udd16',
    placeholder: 'sk-ant-...',
    hint: 'console.anthropic.com \u2192 Settings \u2192 API Keys',
  },
  {
    key: 'notionToken',
    name: 'Notion',
    icon: '\ud83d\udcdd',
    placeholder: 'Copiez depuis notion.so/my-integrations',
    hint: 'notion.so/my-integrations \u2192 Cr\u00e9er une int\u00e9gration',
  },
];

/* ─── Component ─── */

export default function OnboardingWizard({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const fileInputRef = useRef(null);

  // Form data
  const [profile, setProfile] = useState({
    companyName: '',
    sector: '',
    size: '',
  });
  const [files, setFiles] = useState([]);
  const [apiKeys, setApiKeys] = useState({
    lemlistKey: '',
    claudeKey: '',
    notionToken: '',
  });

  /* ─── Navigation ─── */

  function goNext() {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  }

  function goBack() {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }

  function handleSkip() {
    finishOnboarding();
  }

  function finishOnboarding() {
    // Save profile data
    const data = { ...profile, apiKeys, files: files.map((f) => f.name) };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(data));
    localStorage.setItem(STORAGE_KEY, 'true');
    if (onComplete) onComplete(data);
  }

  /* ─── File handling ─── */

  function handleFileSelect(e) {
    const newFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...newFiles]);
    // Reset input so re-selecting same file works
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removeFile(index) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  /* ─── Progress indicator ─── */

  function renderProgress() {
    return (
      <div style={s.progressBar}>
        {STEPS.map((step, i) => (
          <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                ...s.stepDot,
                ...(i === currentStep ? s.stepDotActive : {}),
                ...(i < currentStep ? s.stepDotDone : {}),
              }}
              title={step.label}
            >
              {i < currentStep ? '\u2713' : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div
                style={{
                  ...s.stepConnector,
                  ...(i < currentStep ? s.stepConnectorDone : {}),
                }}
              />
            )}
          </div>
        ))}
      </div>
    );
  }

  /* ─── Step: Welcome ─── */

  function renderWelcome() {
    return (
      <>
        <div style={s.brandRow}>
          <div style={s.brandIcon}>b</div>
          <span style={s.brandText}>
            bakal<span style={s.brandSuffix}>.ai</span>
          </span>
        </div>
        <div style={s.title}>Bienvenue sur Bakal</div>
        <div style={s.subtitle}>
          Configurons votre espace de prospection en quelques \u00e9tapes.
          <br />
          Cela ne prendra que 2 minutes.
        </div>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              flexDirection: 'column',
              gap: 12,
              textAlign: 'left',
              padding: '20px 24px',
              background: 'var(--bg-primary)',
              borderRadius: 'var(--radius-sm, 8px)',
              border: '1px solid var(--border)',
            }}
          >
            {[
              { num: '1', text: 'Profil de votre entreprise' },
              { num: '2', text: 'Import de documents (optionnel)' },
              { num: '3', text: 'Configuration des cl\u00e9s API' },
            ].map((item) => (
              <div
                key={item.num}
                style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-secondary)' }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    flexShrink: 0,
                  }}
                >
                  {item.num}
                </div>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  /* ─── Step: Company Profile ─── */

  function renderCompany() {
    return (
      <>
        <div style={s.title}>Profil de l'entreprise</div>
        <div style={s.subtitle}>
          Ces informations permettront de personnaliser vos campagnes de prospection.
        </div>
        <div style={s.fieldGroup}>
          <label style={s.label}>Nom de l'entreprise</label>
          <input
            style={s.input}
            type="text"
            placeholder="Ex: Stanko"
            value={profile.companyName}
            onChange={(e) => setProfile((prev) => ({ ...prev, companyName: e.target.value }))}
            autoFocus
          />
        </div>
        <div style={s.fieldGroup}>
          <label style={s.label}>Secteur d'activit\u00e9</label>
          <select
            style={s.select}
            value={profile.sector}
            onChange={(e) => setProfile((prev) => ({ ...prev, sector: e.target.value }))}
          >
            <option value="">-- S\u00e9lectionner --</option>
            {SECTOR_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div style={s.fieldGroup}>
          <label style={s.label}>Taille de l'entreprise</label>
          <select
            style={s.select}
            value={profile.size}
            onChange={(e) => setProfile((prev) => ({ ...prev, size: e.target.value }))}
          >
            <option value="">-- S\u00e9lectionner --</option>
            {SIZE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </>
    );
  }

  /* ─── Step: Document Upload ─── */

  function renderDocuments() {
    return (
      <>
        <div style={s.title}>Documents</div>
        <div style={s.subtitle}>
          Importez vos documents de r\u00e9f\u00e9rence (plaquettes, offres, cas clients) pour que l'IA
          personnalise mieux vos messages. Cette \u00e9tape est optionnelle.
        </div>
        <div
          style={s.uploadZone}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.style.borderColor = 'var(--text-primary)';
            e.currentTarget.style.background = 'var(--bg-elevated)';
          }}
          onDragLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.background = 'var(--bg-primary)';
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.background = 'var(--bg-primary)';
            const droppedFiles = Array.from(e.dataTransfer.files);
            setFiles((prev) => [...prev, ...droppedFiles]);
          }}
        >
          <div style={s.uploadIcon}>{'\u2191'}</div>
          <div style={s.uploadText}>Cliquez ou glissez vos fichiers ici</div>
          <div style={s.uploadHint}>PDF, DOCX, TXT, CSV (max 10 Mo par fichier)</div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.doc,.txt,.csv,.xlsx"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
        {files.length > 0 && (
          <div style={{ marginTop: 12 }}>
            {files.map((f, i) => (
              <div key={`${f.name}-${i}`} style={s.fileItem}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {f.name}
                </span>
                <button
                  style={s.removeBtn}
                  onClick={() => removeFile(i)}
                  title="Retirer"
                >
                  {'\u00d7'}
                </button>
              </div>
            ))}
          </div>
        )}
      </>
    );
  }

  /* ─── Step: API Keys ─── */

  function renderApiKeys() {
    return (
      <>
        <div style={s.title}>Cl\u00e9s API</div>
        <div style={s.subtitle}>
          Connectez vos outils principaux. Vous pourrez en ajouter d'autres plus tard dans les
          Param\u00e8tres.
        </div>
        {ONBOARDING_API_KEYS.map((cfg) => (
          <div key={cfg.key} style={s.apiKeyRow}>
            <div style={s.apiKeyLabel}>
              <span>{cfg.icon}</span>
              <span>{cfg.name}</span>
            </div>
            <input
              style={{ ...s.input, fontFamily: 'monospace', fontSize: 13 }}
              type="password"
              placeholder={cfg.placeholder}
              value={apiKeys[cfg.key]}
              onChange={(e) => setApiKeys((prev) => ({ ...prev, [cfg.key]: e.target.value }))}
            />
            <div style={s.hint}>{cfg.hint}</div>
          </div>
        ))}
      </>
    );
  }

  /* ─── Step: Done ─── */

  function renderDone() {
    return (
      <>
        <div style={s.doneIcon}>{'\u2713'}</div>
        <div style={s.title}>Tout est pr\u00eat !</div>
        <div style={s.subtitle}>
          Votre espace Bakal est configur\u00e9. Vous pouvez commencer \u00e0 cr\u00e9er vos premi\u00e8res campagnes
          de prospection.
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            padding: '16px 20px',
            background: 'var(--bg-primary)',
            borderRadius: 'var(--radius-sm, 8px)',
            border: '1px solid var(--border)',
            fontSize: 13,
            color: 'var(--text-secondary)',
          }}
        >
          {profile.companyName && (
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>Entreprise :</strong>{' '}
              {profile.companyName}
            </div>
          )}
          {profile.sector && (
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>Secteur :</strong> {profile.sector}
            </div>
          )}
          {profile.size && (
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>Taille :</strong> {profile.size}
            </div>
          )}
          {files.length > 0 && (
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>Documents :</strong>{' '}
              {files.length} fichier{files.length > 1 ? 's' : ''}
            </div>
          )}
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>Cl\u00e9s API :</strong>{' '}
            {Object.values(apiKeys).filter((v) => v.trim()).length} / {ONBOARDING_API_KEYS.length}{' '}
            configur\u00e9es
          </div>
        </div>
      </>
    );
  }

  /* ─── Step content dispatcher ─── */

  const STEP_RENDERERS = [renderWelcome, renderCompany, renderDocuments, renderApiKeys, renderDone];

  /* ─── Navigation buttons ─── */

  function renderNav() {
    const isFirst = currentStep === 0;
    const isLast = currentStep === STEPS.length - 1;

    return (
      <div style={s.navRow}>
        <div>
          {!isFirst && !isLast && (
            <button style={s.btnGhost} onClick={goBack}>
              Retour
            </button>
          )}
        </div>
        <div>
          {isLast ? (
            <button style={s.btnPrimary} onClick={finishOnboarding}>
              Commencer
            </button>
          ) : (
            <button style={s.btnPrimary} onClick={goNext}>
              {isFirst ? 'C\'est parti' : 'Suivant'}
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ─── Main render ─── */

  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        {currentStep > 0 && currentStep < STEPS.length - 1 && (
          <button style={s.skipBtn} onClick={handleSkip}>
            Passer
          </button>
        )}
        {renderProgress()}
        {STEP_RENDERERS[currentStep]()}
        {renderNav()}
      </div>
    </div>
  );
}
