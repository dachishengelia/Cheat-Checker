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

export default PlayerCard;