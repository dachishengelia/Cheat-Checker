import { useState } from 'react';

function PlayerForm({ onAddPlayer, isSubmitting }) {
  const [formData, setFormData] = useState({
    profileUrl: '',
    reactionTime: '',
    kdRatio: '',
    wallbangKillPercent: '',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const stats = {};

    if (formData.reactionTime !== '') {
      stats.reactionTime = Number(formData.reactionTime);
    }

    if (formData.kdRatio !== '') {
      stats.kdRatio = Number(formData.kdRatio);
    }

    if (formData.wallbangKillPercent !== '') {
      stats.wallbangKillPercent = Number(formData.wallbangKillPercent);
    }

    onAddPlayer({
      profileUrl: formData.profileUrl,
      stats: Object.keys(stats).length > 0 ? stats : undefined,
    });

    setFormData({
      profileUrl: '',
      reactionTime: '',
      kdRatio: '',
      wallbangKillPercent: '',
    });
  };

  return (
    <form className="player-form" onSubmit={handleSubmit}>
      <label htmlFor="profileUrl" className="sr-only">
        Steam profile URL
      </label>
      <input
        id="profileUrl"
        name="profileUrl"
        type="text"
        value={formData.profileUrl}
        onChange={handleChange}
        placeholder="https://steamcommunity.com/id/example"
      />

      <div className="stats-grid">
        <div className="field-box">
          <label htmlFor="reactionTime">Reaction time</label>
          <input
            id="reactionTime"
            type="number"
            name="reactionTime"
            value={formData.reactionTime}
            onChange={handleChange}
            placeholder="175"
            min="0"
          />
        </div>

        <div className="field-box">
          <label htmlFor="kdRatio">K/D ratio</label>
          <input
            id="kdRatio"
            type="number"
            name="kdRatio"
            value={formData.kdRatio}
            onChange={handleChange}
            placeholder="1.4"
            min="0"
            step="0.1"
          />
        </div>

        <div className="field-box">
          <label htmlFor="wallbangKillPercent">Wallbang %</label>
          <input
            id="wallbangKillPercent"
            type="number"
            name="wallbangKillPercent"
            value={formData.wallbangKillPercent}
            onChange={handleChange}
            placeholder="2.5"
            min="0"
            step="0.1"
          />
        </div>
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Checking...' : 'Check Player'}
      </button>
    </form>
  );
}

export default PlayerForm;