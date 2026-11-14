import { useEffect, useState } from 'react';

const SlowNotice = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <p className="text-xs text-muted text-center">
      Waking the server up. This can take up to a minute after a quiet period. Please keep this
      page open.
    </p>
  );
};

export default SlowNotice;