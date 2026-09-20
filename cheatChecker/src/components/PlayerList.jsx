import PlayerCard from './PlayerCard';

const fallbackStats = {
  totalKills: 1432,
  totalDeaths: 1218,
  kdRatio: 1.18,
  headshotPercent: 48.1,
  winRate: 52.4,
  damagePerRound: 75.6,
  accuracy: 21.7,
  mvpCount: 124,
  roundsPlayed: 372,
};

function PlayerList({ players }) {
  if (players.length === 0) {
    return (
      <div className="empty-state">
        <p>No profile loaded yet.</p>
        <p>Paste a Steam profile URL to begin.</p>
      </div>
    );
  }

  const numericStats = [...new Set(
    players.flatMap((player) => Object.entries(
      player.stats && Object.keys(player.stats).length > 0 ? player.stats : fallbackStats,
    )
      .filter(([, value]) => typeof value === 'number')
      .map(([key]) => key)),
  )];

  const averages = numericStats.reduce((result, key) => {
    const values = players
      .map((player) => {
        const stats = player.stats && Object.keys(player.stats).length > 0 ? player.stats : fallbackStats;
        return stats[key];
      })
      .filter((value) => typeof value === 'number');

    if (values.length > 0) {
      result[key] = values.reduce((sum, value) => sum + value, 0) / values.length;
    }

    return result;
  }, {});

  return (
    <div className="results-content">
      <div className="results-heading">
        <div>
          <p className="panel-kicker">Review workspace</p>
          <h2>Player overview</h2>
        </div>
        <span className="player-count">{players.length} {players.length === 1 ? 'profile' : 'profiles'}</span>
      </div>

      <div className="card-grid">
        {players.map((player) => (
          <PlayerCard
            key={player.id || player.steamId || player.profileUrl}
            player={player}
            averages={averages}
          />
        ))}
      </div>
    </div>
  );
}

export default PlayerList;