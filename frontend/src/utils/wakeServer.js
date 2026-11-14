import api from '../api/axios';

// The backend's own address. It is the same one used in frontend/vercel.json.
// A request sent straight to it wakes the free Render server reliably.
const BACKEND_HEALTH_URL = 'https://worknest-api-60h1.onrender.com/api/health';

// On the live site, wait up to 2 minutes. On your computer, give up quickly.
const MAX_WAIT_SECONDS = import.meta.env.PROD ? 30 : 6;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Sends a request straight to the backend. We don't need to read the answer,
// because the request itself is what wakes the server up.
const pingBackend = () => {
  if (!import.meta.env.PROD) return;
  fetch(BACKEND_HEALTH_URL, { mode: 'no-cors', cache: 'no-store' }).catch(() => {});
};

// Does the backend answer properly through our own address?
const isAwake = async (timeoutMs) => {
  try {
    const { data } = await api.get('/health', { timeout: timeoutMs });
    return data?.status === 'WorkNest API is running';
  } catch {
    return false;
  }
};

let waking = null; // so that several callers share one wake-up instead of starting several

const wakeServer = () => {
  if (!waking) {
    waking = (async () => {
      // Fast path: it is already awake
      if (await isAwake(4000)) return true;

      const deadline = Date.now() + MAX_WAIT_SECONDS * 1000;
      while (Date.now() < deadline) {
        pingBackend();
        if (await isAwake(8000)) return true;
        await wait(3000);
      }
      return false;
    })().finally(() => {
      waking = null;
    });
  }
  return waking;
};

export default wakeServer;