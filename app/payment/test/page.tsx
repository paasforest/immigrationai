'use client';

import { useEffect, useState } from 'react';

export default function TestPage() {
  const [params, setParams] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accountNumber = urlParams.get('account_number');
    const plan = urlParams.get('plan');
    const billing = urlParams.get('billing');
    
    setParams({ accountNumber, plan, billing });
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Test Page</h1>
      <pre>{JSON.stringify(params, null, 2)}</pre>
    </div>
  );
}
