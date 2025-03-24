'use client'; // Error boundaries must be Client Components

import { useEffect } from 'react';

const GlobalError = ({ error, reset }: {
  error: Error & { digest?: string }
  reset: () => void
}) => {
  useEffect(() => {
    // Sentry.captureException(error);
  }, [error]);

  return (
    // global-error must include html and body tags
    <html>
    <body>
    <h2>Something went wrong!</h2>
    <button onClick={() => reset()}>Try again</button>
    </body>
    </html>
  );
}

export default GlobalError;