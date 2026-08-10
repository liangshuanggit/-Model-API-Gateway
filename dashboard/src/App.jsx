import React from 'react';

export default function App(){
  return <main>
    <h1>Model API Gateway Dashboard</h1>
    <section>
      <h2>Overview</h2>
      <p>Gateway status: online</p>
    </section>
    <section>
      <h2>Providers</h2>
      <ul>
        <li>deepseek-web</li>
        <li>openai</li>
      </ul>
    </section>
  </main>;
}
