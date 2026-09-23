// page.js
// ponytail: page is client-only (ssr:false below) so sessionStorage/localStorage reads never run on the server
'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const App = dynamic(() => import('./components/RecipeApp'), { ssr: false });

const page = () => {
  return (
    <div>
      <App />
    </div>
  )
}

export default page