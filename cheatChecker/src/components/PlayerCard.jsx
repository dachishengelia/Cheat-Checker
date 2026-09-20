import { useEffect, useState } from 'react';

const getReputationKey = (player) => `cheatchecker:reputation:${player.steamId || player.profileUrl}`;

const loadReputation = (player) => {
  try {
    const savedReputation = window.localStorage.getItem(getReputationKey(player));
    return savedReputation ? JSON.parse(savedReputation) : { vote: null, reportType: 'Wallhack' };
  } catch {
    return { vote: null, reportType: 'Wallhack' };
  }
};

const formatStatName = (key) => key
  .replace(/([A-Z])/g, ' $1')
  .replace(/^./, (letter) => letter.toUpperCase());

const formatValue = (value) => typeof value === 'number'
  ? value.toFixed(value % 1 !== 0 ? 1 : 0)
  : value;

function PlayerCard({ player, averages }) {
  const banValue = player.steamBans && typeof player.steamBans === 'object' ? player.steamBans : {};
  const vacBanned = banValue.vacBanned ?? banValue.VACBanned ?? banValue.vac_banned ?? false;

  const dummyStats = {
    totalKills: 1432,
    totalDeaths: 1218,
    kdRatio: 1.18,
    headshotPercent: 48.1,
    winRate: 52.4,
    damagePerRound: 75.6,
    accuracy: 21.7,
    mvpCount: 124,
    roundsPlayed: 372,
    favoriteWeapon: 'AK-47',
  };

  const statsEntries = player.stats && Object.keys(player.stats).length > 0
    ? Object.entries(player.stats)
    : Object.entries(dummyStats);

  const chartStats = statsEntries
    .filter(([, value]) => typeof value === 'number')
    .slice(0, 6);

  const cheatPercent = typeof player.cheatProbability === 'number'
    ? player.cheatProbability
    : (player.cheatProbability === 'high' ? 82 : player.cheatProbability === 'medium' ? 46 : player.cheatProbability === 'low' ? 18 : 34);

  const positiveScore = Math.max(0, Math.min(100, cheatPercent));

  return (
    <article className="player-card">
      <div className="profile-link-row">
        <a href={player.profileUrl} target="_blank" rel="noreferrer">
          {player.profileUrl || 'Open Steam profile'}
        </a>
      </div>

      <div className="stats-overview">
        {statsEntries.map(([key, value]) => (
          <div key={key} className="stat-box">
            <span>{formatStatName(key)}</span>
            <strong>{formatValue(value)}</strong>
            {typeof value === 'number' && typeof averages[key] === 'number' && (
              <small>avg {formatValue(averages[key])}</small>
            )}
          </div>
        ))}
      </div>

      <div className="chart-panel">
        <div className="chart-heading">
          <div>
            <span className="section-label">Performance snapshot</span>
            <h4>Compared with the loaded profiles</h4>
          </div>
          <span className="chart-note">Average shown below each stat</span>
        </div>
        <div className="bar-chart" aria-label="Player stats compared with the average">
          {chartStats.map(([key, value]) => {
            const average = averages[key] || value;
            const maximum = Math.max(value, average, 1);
            return (
              <div className="bar-row" key={key}>
                <div className="bar-label"><span>{formatStatName(key)}</span><strong>{formatValue(value)}</strong></div>
                <div className="bar-track"><span className="bar-value" style={{ width: `${(value / maximum) * 100}%` }} /><span className="bar-average" style={{ left: `${(average / maximum) * 100}%` }} /></div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="info-grid">
        <div className="info-panel">
          <h4>VAC status</h4>
          <p className={`vac-status ${vacBanned ? 'banned' : 'clean'}`}>
            {vacBanned ? 'VAC banned: Yes' : 'VAC banned: No'}
          </p>
        </div>

        <div className="info-panel highlight-panel">
          <h4>Cheat likelihood</h4>
          <p>
            {positiveScore >= 70 ? 'High likelihood of cheating indicators.' : positiveScore >= 35 ? 'Moderate risk based on profile behavior.' : 'Low risk based on current indicators.'}
          </p>
        </div>
      </div>
    </article>
  );
}

export function PlayerSummary({ player }) {
  const [reputation, setReputation] = useState(() => loadReputation(player));
  const { vote, reportType } = reputation;
  const cheatPercent = typeof player.cheatProbability === 'number'
    ? player.cheatProbability
    : (player.cheatProbability === 'high' ? 82 : player.cheatProbability === 'medium' ? 46 : player.cheatProbability === 'low' ? 18 : 34);
  const positiveScore = Math.max(0, Math.min(100, cheatPercent));
  const positiveReputation = vote === 'positive' ? 1 : 0;
  const negativeReputation = vote === 'negative' ? 1 : 0;
  const positiveWidth = vote === 'negative' ? 0 : 100;
  const negativeWidth = vote === 'negative' ? 100 : 0;

  const handleReport = () => {
    setReputation((currentReputation) => ({ ...currentReputation, vote: 'negative' }));
  };

  useEffect(() => {
    window.localStorage.setItem(getReputationKey(player), JSON.stringify(reputation));
  }, [player, reputation]);

  return (
    <div className="player-summary">
      <header className="card-header">
        <div className="identity-block">
          <span className="mini-label">Steam account</span>
          <h3>{player.username || 'Steam User'}</h3>
          <span className="steam-id">SteamID64 · {player.steamId || 'Unavailable'}</span>
        </div>

        <div className="risk-block">
          <span className="risk-label">Overall risk</span>
          <div className={`score-pill ${positiveScore >= 70 ? 'high' : positiveScore >= 35 ? 'medium' : 'low'}`}>
            {Math.round(positiveScore)}%
          </div>
        </div>
      </header>

      <div className="reputation-panel">
        <div className="reputation-heading">
          <div>
            <span className="section-label">Community reputation</span>
            <h4>Player feedback</h4>
          </div>
          <button type="button" className="rep-button positive" disabled={vote !== null} onClick={() => setReputation((currentReputation) => ({ ...currentReputation, vote: 'positive' }))}>
            +rep
          </button>
        </div>
        <div className="reputation-chart" aria-label={`${positiveReputation} positive reputation and ${negativeReputation} negative reputation`}>
          <div className="reputation-line positive-line" style={{ width: `${positiveWidth}%` }} />
          <div className="reputation-line negative-line" style={{ width: `${negativeWidth}%` }} />
        </div>
        <div className="reputation-counts">
          <span className="positive-count">+{positiveReputation} rep</span>
          <span className="negative-count">-{negativeReputation} rep</span>
        </div>
        <div className="report-controls">
          <select disabled={vote !== null} value={reportType} onChange={(event) => setReputation((currentReputation) => ({ ...currentReputation, reportType: event.target.value }))} aria-label="Report reason">
            <option>Wallhack</option>
            <option>Aim assist</option>
            <option>Farmer bot</option>
            <option>Other cheating</option>
          </select>
          <button type="button" className="rep-button negative" disabled={vote !== null} onClick={handleReport}>
            Report -rep
          </button>
        </div>
        {vote === 'negative' && <p className="report-confirmation">Reported for {reportType}.</p>}
      </div>
    </div>
  );
}

export default PlayerCard;