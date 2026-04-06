import { useState, useEffect } from 'react';
import api from '../../services/api-client';

/**
 * Panel to generate prospects via Apollo for a campaign in prep.
 * Pre-fills criteria from campaign params, lets user edit, search, and save.
 */
export default function ProspectGenerator({ campaign, onProspectsAdded }) {
  const [titles, setTitles] = useState(campaign.position || '');
  const [sectors, setSectors] = useState(campaign.sector || '');
  const [locations, setLocations] = useState(campaign.zone || '');
  const [companySizes, setCompanySizes] = useState(
    mapSizeToApollo(campaign.size) || '11-50'
  );
  const [limit, setLimit] = useState(25);

  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [existingCount, setExistingCount] = useState(0);

  useEffect(() => {
    const backendId = campaign._backendId || campaign.id;
    api.listCampaignProspects(backendId)
      .then(data => setExistingCount((data.prospects || []).length))
      .catch(() => {});
  }, [campaign._backendId, campaign.id]);

  const handleSearch = async () => {
    setSearching(true);
    setError(null);
    try {
      const criteria = {
        titles: titles.split(',').map(s => s.trim()).filter(Boolean),
        sectors: sectors.split(',').map(s => s.trim()).filter(Boolean),
        locations: locations.split(',').map(s => s.trim()).filter(Boolean),
        companySizes: [companySizes],
        limit: parseInt(limit, 10) || 25,
      };
      const data = await api.searchProspects(criteria);
      const contacts = data.contacts || [];
      setResults(contacts);
      setSelected(new Set(contacts.map(c => c.id)));
    } catch (err) {
      setError(err.message || 'Recherche échouée');
    }
    setSearching(false);
  };

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const contacts = results.filter(c => selected.has(c.id));
      const backendId = campaign._backendId || campaign.id;
      const data = await api.addProspectsToCampaign(backendId, contacts);
      setExistingCount(prev => prev + (data.created || 0));
      setResults([]);
      setSelected(new Set());
      if (onProspectsAdded) onProspectsAdded(data.created);
    } catch (err) {
      setError(err.message || 'Sauvegarde échouée');
    }
    setSaving(false);
  };

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        marginBottom: '24px',
      }}
    >
      <div
        style={{
          fontSize: '15px',
          fontWeight: 600,
          marginBottom: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        🎯 Générer des prospects via Apollo
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
        {existingCount > 0
          ? `${existingCount} prospect${existingCount > 1 ? 's' : ''} déjà dans la campagne`
          : 'Aucun prospect dans la campagne pour le moment'}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '12px',
        }}
      >
        <Field label="Titres (séparés par virgule)" value={titles} onChange={setTitles} placeholder="CEO, COO, Head of Lab" />
        <Field label="Secteurs (séparés par virgule)" value={sectors} onChange={setSectors} placeholder="Biotech, Diagnostics" />
        <Field label="Localisations" value={locations} onChange={setLocations} placeholder="France, Germany" />
        <div>
          <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Taille d'entreprise</label>
          <select
            className="form-input"
            value={companySizes}
            onChange={e => setCompanySizes(e.target.value)}
            style={{ marginTop: '4px' }}
          >
            <option value="1-10">1-10</option>
            <option value="11-50">11-50</option>
            <option value="51-200">51-200</option>
            <option value="201-500">201-500</option>
            <option value="501-1000">501-1000</option>
            <option value="1001+">1001+</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Nombre max</label>
          <input
            className="form-input"
            type="number"
            min="1"
            max="100"
            value={limit}
            onChange={e => setLimit(e.target.value)}
            style={{ marginTop: '4px' }}
          />
        </div>
      </div>

      <button
        className="btn btn-primary"
        onClick={handleSearch}
        disabled={searching}
        style={{ fontSize: '12px', padding: '8px 14px' }}
      >
        {searching ? 'Recherche en cours...' : '🔍 Chercher des prospects'}
      </button>

      {error && (
        <div style={{ marginTop: '12px', color: 'var(--danger)', fontSize: '12px' }}>
          ⚠️ {error}
        </div>
      )}

      {results.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
            {results.length} résultat{results.length > 1 ? 's' : ''} — {selected.size} sélectionné{selected.size > 1 ? 's' : ''}
          </div>
          <div style={{ maxHeight: 320, overflow: 'auto', border: '1px solid var(--border)', borderRadius: 8 }}>
            {results.map(c => (
              <div
                key={c.id}
                onClick={() => toggleSelect(c.id)}
                style={{
                  padding: '10px 12px',
                  borderBottom: '1px solid var(--border)',
                  cursor: 'pointer',
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'center',
                  background: selected.has(c.id) ? 'var(--bg-elevated)' : 'transparent',
                }}
              >
                <input type="checkbox" checked={selected.has(c.id)} readOnly />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>
                    {c.name} {!c.email && <span style={{ color: 'var(--warning)', fontSize: '10px' }}>(pas d'email)</span>}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {c.title} · {c.company} · {c.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            className="btn btn-success"
            onClick={handleSave}
            disabled={saving || selected.size === 0}
            style={{ fontSize: '12px', padding: '8px 14px', marginTop: '12px' }}
          >
            {saving ? 'Ajout en cours...' : `➕ Ajouter ${selected.size} à la campagne`}
          </button>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>{label}</label>
      <input
        className="form-input"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ marginTop: '4px' }}
      />
    </div>
  );
}

function mapSizeToApollo(size) {
  if (!size) return null;
  const s = String(size).toLowerCase();
  if (s.includes('1-10')) return '1-10';
  if (s.includes('11-50') || s.includes('10-50')) return '11-50';
  if (s.includes('50-200') || s.includes('51-200')) return '51-200';
  if (s.includes('200') || s.includes('500')) return '201-500';
  if (s.includes('500') || s.includes('1000')) return '501-1000';
  if (s.includes('1000+') || s.includes('1001')) return '1001+';
  return null;
}
