import { useState } from 'react';

function PlayerForm({ onAddPlayer, isSubmitting }) {
  const [formData, setFormData] = useState({
    profileUrl: '',
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

    onAddPlayer({
      profileUrl: formData.profileUrl,
    });

    setFormData({
      profileUrl: '',
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

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Checking...' : 'Check Player'}
      </button>
    </form>
  );
}

export default PlayerForm;