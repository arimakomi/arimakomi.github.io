import React, { useEffect, useState } from 'react';

function App() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch('https://starly.webi-artin.workers.dev/categories')
      .then(res => res.json())
      .then(data => setCategories(data.data || []))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Starly Mini</h1>
      <h2 className="text-xl font-semibold mb-2">Categories:</h2>
      <ul className="list-disc pl-5">
        {categories.map(cat => (
          <li key={cat.id}>{cat.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
