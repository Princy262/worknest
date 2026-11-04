import { useEffect, useState } from 'react';

const FullPageLoader = () => {
  const [slow, setSlow] = useState(false);

  // After 4 seconds, explain why it is taking a while
  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 bg-background p-6 text-center">
      <img src="/worknest-icon.png" alt="WorkNest" className="h-14 w-14 rounded-xl" />
      <div
        className="h-8 w-8 rounded-full border-4 border-line border-t-primary animate-spin"
        role="status"
        aria-label="Loading"
      />
      {slow && (
        <p className="max-w-xs text-sm text-muted">
          Waking the server up. This can take up to a minute after a quiet period, and then it is
          fast again.
        </p>
      )}
    </div>
  );
};

export default FullPageLoader;