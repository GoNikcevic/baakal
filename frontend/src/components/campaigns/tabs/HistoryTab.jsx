import VersionDiff from '../VersionDiff';

export default function HistoryTab({ campaign: c }) {
  return (
    <div>
      <VersionDiff campaignId={c._backendId || c.id} sequence={c.sequence} />
    </div>
  );
}
