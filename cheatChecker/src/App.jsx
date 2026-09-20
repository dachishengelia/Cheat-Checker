import { useEffect, useState } from 'react';
import './App.css';
import PlayerForm from './components/PlayerForm';
import PlayerList from './components/PlayerList';
import { PlayerSummary } from './components/PlayerCard';

const configuredApiUrl = import.meta.env.VITE_API_URL;
const API_URL = configuredApiUrl && !configuredApiUrl.includes('localhost')
  ? configuredApiUrl
  : 'https://cheat-checker-backend.vercel.app';

function App() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchPlayers = async () => {
    try {
      const response = await fetch(`${API_URL}/players`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Unable to load saved players.');
      }

      const fetchedPlayers = Array.isArray(result.data) ? result.data : result.data ? [result.data] : [];
      setPlayers(fetchedPlayers);
      return fetchedPlayers;
    } catch (err) {
      setError(err.message || 'Failed to fetch players.');
      return [];
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      setLoading(true);
      setError('');
      setSuccessMessage('');
      await fetchPlayers();
      setLoading(false);
    };

    bootstrap();
  }, []);

  const handleAddPlayer = async ({ profileUrl, stats }) => {
    setError('');
    setSuccessMessage('');
    setSubmitting(true);

    try {
      const trimmedUrl = (profileUrl || '').trim();
      const validUrl = /^https?:\/\/steamcommunity\.com\/(id\/[^/?#]+|profiles\/\d{17})\/?$/i;

      if (!trimmedUrl || !validUrl.test(trimmedUrl)) {
        throw new Error('Please enter a valid Steam profile URL.');
      }

      const payload = { profileUrl: trimmedUrl };

      if (stats && Object.keys(stats).length > 0) {
        payload.stats = stats;
      }

      const response = await fetch(`${API_URL}/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Unable to submit the Steam profile.');
      }

      const refreshedPlayers = await fetchPlayers();
      const returnedPlayers = Array.isArray(result.data) ? result.data : result.data ? [result.data] : [];
      const newestPlayer = returnedPlayers[returnedPlayers.length - 1] || refreshedPlayers[refreshedPlayers.length - 1];

      if (newestPlayer) {
        setPlayers([newestPlayer]);
        setSuccessMessage(`Profile loaded for ${newestPlayer.username || 'this account'}.`);
      } else {
        setPlayers([]);
        setSuccessMessage('Player check submitted successfully.');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong while submitting the profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-wrap">
          <p className="eyebrow">Steam profile intelligence</p>
          <h1>CheatChecker</h1>
          <p className="brand-description">A clear read on player patterns, risk signals, and match performance.</p>
        </div>

      </header>

      <main className="dashboard">
        <section className="panel form-panel">
          <div className="panel-header">
            <span className="panel-kicker">Player lookup</span>
            <h2>Check a Steam profile</h2>
          </div>

          <PlayerForm onAddPlayer={handleAddPlayer} isSubmitting={submitting} />
          {players[0] && (
            <PlayerSummary
              key={players[0].steamId || players[0].profileUrl}
              player={players[0]}
            />
          )}
        </section>

        <section className="panel results-panel">
          {error && <div className="message error">{error}</div>}
          {successMessage && <div className="message success">{successMessage}</div>}

          {loading ? (
            <div className="loading-state">
              <span className="loader" />
              <p>Loading profile…</p>
            </div>
          ) : (
            <PlayerList players={players} />
          )}
        </section>
      </main>
    </div>
  );
}

export default App;