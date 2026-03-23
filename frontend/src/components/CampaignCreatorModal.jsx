/* ===============================================================================
   BAKAL — Campaign Creator Modal (React)
   Step-by-step wizard for campaign creation.
   4 steps: Point de départ → Votre cible → Style & canal → Résumé
   =============================================================================== */

import { useState, useEffect } from 'react';
import { useApp } from '../context/useApp';
import { createCampaign, transformCampaign, campaignToBackend, fetchTemplates, fetchTemplate } from '../services/api-client';
import Confetti from './Confetti';

const SECTORS = [
  'Formation & Education',
  'Comptabilite & Finance',
  'Juridique & Avocats',
  'Conseil & Consulting',
  'IT & Infogerance',
  'Immobilier B2B',
  'Sante & Medical',
  'Marketing & Communication',
];

const POSITIONS = [
  'Dirigeant / Gérant / CEO',
  'DG / Directeur Général',
  'DAF / Directeur Financier',
  'DRH / Directeur RH',
  'Directeur Commercial',
  'DSI / Directeur IT',
];

const SIZES = ['1-10 salariés', '11-50 salariés', '51-200 salariés', '200+ salariés'];
const ZONES = ['Île-de-France', 'Lyon & Rhône-Alpes', 'Marseille & PACA', 'France entière'];
const TONES = ['Pro décontracté', 'Formel & Corporate', 'Direct & punchy'];
const CHANNELS = ['Email + LinkedIn', 'Email uniquement', 'LinkedIn uniquement'];
const ANGLES = ['Douleur client', 'Preuve sociale', 'Offre directe', 'Contenu éducatif'];
const VOLUMES = ['Standard (~100/semaine)', 'Modere (~50/semaine)', 'Agressif (~200/semaine)'];

const TOTAL_STEPS = 4;
const STEP_LABELS = ['Point de départ', 'Votre cible', 'Style & canal', 'Résumé'];

function SummaryItem({ label, value }) {
  return (
    <div style={{ padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: 8 }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 500 }}>{value}</div>
    </div>
  );
}

export default function CampaignCreatorModal({ onClose }) {
  const { projects, setCampaigns, backendAvailable } = useApp();

  const [step, setStep] = useState(0);

  const [form, setForm] = useState({
    projectId: '',
    name: '',
    sector: SECTORS[0],
    position: POSITIONS[0],
    size: SIZES[0],
    zone: ZONES[0],
    tone: TONES[0],
    channel: CHANNELS[0],
    angle: ANGLES[0],
    volume: VOLUMES[0],
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  const projectsList = Object.values(projects);

  // Load templates on mount
  useEffect(() => {
    fetchTemplates()
      .then(setTemplates)
      .catch(() => setTemplates([]))
      .finally(() => setLoadingTemplates(false));
  }, []);

  const handleSelectTemplate = async (templateId) => {
    if (!templateId) {
      setSelectedTemplate(null);
      return;
    }
    try {
      const tpl = await fetchTemplate(templateId);
      setSelectedTemplate(tpl);
      // Pre-fill form with template data
      const channelMap = { email: 'Email uniquement', linkedin: 'LinkedIn uniquement', multi: 'Email + LinkedIn' };
      setForm((prev) => ({
        ...prev,
        name: prev.name || tpl.name,
        channel: channelMap[tpl.channel] || prev.channel,
      }));
    } catch {
      setSelectedTemplate(null);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  function next() {
    // Validate step 0: name is required
    if (step === 0 && !form.name.trim()) {
      setError('Le nom de la campagne est requis.');
      return;
    }
    setError(null);
    if (step < TOTAL_STEPS - 1) setStep((s) => s + 1);
  }

  function prev() {
    setError(null);
    if (step > 0) setStep((s) => s - 1);
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError('Le nom de la campagne est requis.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = campaignToBackend({
        ...form,
        client: form.projectId
          ? projectsList.find((p) => p.id === form.projectId)?.client || ''
          : '',
      });

      if (backendAvailable) {
        const created = await createCampaign({ ...form, client: payload.client });
        const transformed = transformCampaign(created, []);
        setCampaigns((prev) => ({ ...prev, [transformed.id]: transformed }));
      } else {
        // Offline — create local-only campaign
        const localId = 'local-' + Date.now();
        const localCampaign = {
          id: localId,
          _backendId: null,
          name: form.name,
          client: payload.client,
          projectId: form.projectId || null,
          status: 'prep',
          channel: payload.channel,
          channelLabel: payload.channel === 'linkedin' ? 'LinkedIn' : payload.channel === 'multi' ? 'Multi' : 'Email',
          channelColor: payload.channel === 'linkedin' ? 'var(--purple)' : payload.channel === 'multi' ? 'var(--orange)' : 'var(--blue)',
          sector: form.sector,
          sectorShort: form.sector.split(' ')[0],
          position: form.position,
          size: form.size,
          angle: form.angle,
          zone: form.zone,
          tone: form.tone,
          formality: 'Vous',
          length: 'Standard',
          cta: '',
          volume: { sent: 0, planned: payload.planned },
          iteration: 0,
          startDate: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
          lemlistRef: null,
          nextAction: null,
          kpis: { contacts: 0, openRate: null, replyRate: null, interested: 0, meetings: 0 },
          sequence: [],
          diagnostics: [],
          history: [],
          prepChecklist: undefined,
          info: { period: '', createdDate: '', copyDesc: `${form.tone} · Vous · ${form.angle} · FR`, channelsDesc: form.channel },
        };
        setCampaigns((prev) => ({ ...prev, [localId]: localCampaign }));
      }

      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Erreur lors de la création.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── Progress dots ─── */
  function renderDots() {
    return (
      <div className="wizard-steps" style={{ paddingBottom: 0 }}>
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <div
            key={i}
            className={`wizard-step-dot${i === step ? ' active' : ''}${i < step ? ' done' : ''}`}
            title={STEP_LABELS[i]}
          />
        ))}
      </div>
    );
  }

  /* ─── Step 1: Point de départ ─── */
  function renderStep1() {
    return (
      <div>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Point de départ</div>

        {/* Template selector */}
        <div style={{ marginBottom: 20 }}>
          <label className="form-label" style={{ marginBottom: 8, display: 'block', fontWeight: 600 }}>Partir d'un template</label>
          {loadingTemplates ? (
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Chargement des templates...</div>
          ) : templates.length > 0 ? (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                className={`btn ${!selectedTemplate ? 'btn-primary' : 'btn-ghost'}`}
                style={{ padding: '6px 12px', fontSize: 12, borderRadius: 6 }}
                onClick={() => handleSelectTemplate(null)}
              >
                Vierge
              </button>
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  className={`btn ${selectedTemplate?.id === tpl.id ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ padding: '6px 12px', fontSize: 12, borderRadius: 6 }}
                  onClick={() => handleSelectTemplate(tpl.id)}
                >
                  {tpl.name}
                  <span style={{ marginLeft: 6, opacity: 0.6, fontSize: 11 }}>{tpl.touchpointCount} msgs</span>
                </button>
              ))}
            </div>
          ) : null}
          {selectedTemplate && (
            <div style={{ marginTop: 8, padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{selectedTemplate.name}</div>
              <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{selectedTemplate.description}</div>
              <div style={{ color: 'var(--text-muted)', marginBottom: 6, fontSize: 12 }}>
                {selectedTemplate.touchpointCount || selectedTemplate.sequence?.length || '?'} touchpoints
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {selectedTemplate.tags?.map((tag) => (
                  <span key={tag} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'rgba(99,102,241,0.1)', color: 'var(--accent)' }}>{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Campaign name */}
        <div className="form-group full">
          <label className="form-label">Nom de la campagne</label>
          <input
            className="form-input"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Ex: DRH PME Lyon — Mars 2026"
            autoFocus
          />
        </div>

        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
          Etape 1/{TOTAL_STEPS}
        </div>
      </div>
    );
  }

  /* ─── Step 2: Votre cible ─── */
  function renderStep2() {
    return (
      <div>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Votre cible</div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Secteur</label>
            <select className="form-select" value={form.sector} onChange={(e) => handleChange('sector', e.target.value)}>
              {SECTORS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Poste décideur</label>
            <select className="form-select" value={form.position} onChange={(e) => handleChange('position', e.target.value)}>
              {POSITIONS.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Taille entreprise</label>
            <select className="form-select" value={form.size} onChange={(e) => handleChange('size', e.target.value)}>
              {SIZES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Zone géographique</label>
            <select className="form-select" value={form.zone} onChange={(e) => handleChange('zone', e.target.value)}>
              {ZONES.map((z) => <option key={z}>{z}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text-muted)' }}>
          Etape 2/{TOTAL_STEPS}
        </div>
      </div>
    );
  }

  /* ─── Step 3: Style & canal ─── */
  function renderStep3() {
    return (
      <div>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Style & canal</div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Ton</label>
            <select className="form-select" value={form.tone} onChange={(e) => handleChange('tone', e.target.value)}>
              {TONES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Canal</label>
            <select className="form-select" value={form.channel} onChange={(e) => handleChange('channel', e.target.value)}>
              {CHANNELS.map((ch) => <option key={ch}>{ch}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Angle d'approche</label>
            <select className="form-select" value={form.angle} onChange={(e) => handleChange('angle', e.target.value)}>
              {ANGLES.map((a) => <option key={a}>{a}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Volume</label>
            <select className="form-select" value={form.volume} onChange={(e) => handleChange('volume', e.target.value)}>
              {VOLUMES.map((v) => <option key={v}>{v}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text-muted)' }}>
          Etape 3/{TOTAL_STEPS}
        </div>
      </div>
    );
  }

  /* ─── Step 4: Résumé ─── */
  function renderStep4() {
    return (
      <div>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Récapitulatif</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <SummaryItem label="Template" value={selectedTemplate?.name || 'Vierge'} />
          <SummaryItem label="Nom" value={form.name || '\u2014'} />
          <SummaryItem label="Secteur" value={form.sector || '\u2014'} />
          <SummaryItem label="Poste" value={form.position || '\u2014'} />
          <SummaryItem label="Taille" value={form.size || '\u2014'} />
          <SummaryItem label="Zone" value={form.zone || '\u2014'} />
          <SummaryItem label="Ton" value={form.tone || '\u2014'} />
          <SummaryItem label="Canal" value={form.channel || '\u2014'} />
          <SummaryItem label="Angle" value={form.angle || '\u2014'} />
          <SummaryItem label="Volume" value={form.volume || '\u2014'} />
        </div>
        {selectedTemplate && (
          <div style={{ marginTop: 16, padding: 12, background: 'var(--bg-elevated)', borderRadius: 8, fontSize: 12, color: 'var(--text-muted)' }}>
            Template "{selectedTemplate.name}" — {selectedTemplate.touchpointCount || selectedTemplate.sequence?.length || '?'} touchpoints seront générés
          </div>
        )}

        <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text-muted)' }}>
          Etape 4/{TOTAL_STEPS}
        </div>
      </div>
    );
  }

  /* ─── Render ─── */
  return (
    <div className="creator-overlay show" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <Confetti trigger={showConfetti} />
      <div className="creator-modal">
        {/* Header */}
        <div className="creator-header">
          <h2>Nouvelle campagne</h2>
          <button className="creator-close" onClick={onClose}>&#x2715;</button>
        </div>

        {/* Progress dots */}
        {renderDots()}

        {/* Step label */}
        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
          {STEP_LABELS[step]}
        </div>

        {/* Step content with fadeInUp animation */}
        <div className="creator-body" style={{ animation: 'fadeInUp 0.2s ease-out' }} key={step}>
          {step === 0 && renderStep1()}
          {step === 1 && renderStep2()}
          {step === 2 && renderStep3()}
          {step === 3 && renderStep4()}

          {error && (
            <div style={{ color: 'var(--danger)', fontSize: 13, marginTop: 12 }}>{error}</div>
          )}
        </div>

        {/* Footer: Retour / Suivant or Créer */}
        <div className="creator-footer" style={{ justifyContent: 'space-between' }}>
          {step > 0 ? (
            <button className="btn btn-ghost" onClick={prev}>Retour</button>
          ) : (
            <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
          )}
          {step < TOTAL_STEPS - 1 ? (
            <button className="btn btn-primary" onClick={next}>Suivant</button>
          ) : (
            <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Création...' : 'Créer la campagne'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
