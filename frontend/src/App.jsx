import { useEffect, useState } from 'react';
import api from './api/axios';
import logo from './assets/worknest-logo.png';

const swatches = [
  ['primary', 'bg-primary text-white'],
  ['secondary', 'bg-secondary text-dark'],
  ['accent', 'bg-accent text-dark'],
  ['dark', 'bg-dark text-white'],
  ['surface', 'bg-surface text-ink border border-line'],
];

function App() {
  const [apiStatus, setApiStatus] = useState('Checking...');

  useEffect(() => {
    api
      .get('/health')
      .then((res) => setApiStatus(res.data.status))
      .catch(() => setApiStatus('Cannot reach the backend'));
  }, []);

  return (
    <div className="min-h-screen p-8">
      <img src={logo} alt="WorkNest" className="h-16 mb-6" />

      <div className="flex flex-wrap gap-3 mb-6">
        {swatches.map(([name, classes]) => (
          <div key={name} className={`px-5 py-3 rounded-lg text-sm font-medium ${classes}`}>
            {name}
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-6">
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-status-active-soft text-status-active-text">Active</span>
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-status-leave-soft text-status-leave-text">On Leave</span>
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-status-inactive-soft text-status-inactive-text">Inactive</span>
      </div>

      <button className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white font-medium">
        + Add Employee
      </button>

      <p className="mt-6 text-muted">
        Backend: <span className="text-ink font-medium">{apiStatus}</span>
      </p>
    </div>
  );
}

export default App;