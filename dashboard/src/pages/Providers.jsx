export default function Providers(){
  const providers = ['deepseek-web','openai'];

  return (
    <section>
      <h2>Providers</h2>
      <ul>
        {providers.map((provider)=>(
          <li key={provider}>{provider}: healthy</li>
        ))}
      </ul>
    </section>
  );
}
