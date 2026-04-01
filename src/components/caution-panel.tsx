export function CautionPanel({ cautions }: { cautions: string[] }) {
  if (cautions.length === 0) {
    return (
      <div className="card">
        <h3>Cautions</h3>
        <p>注意点はありません。</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3>Cautions</h3>
      <ul>
        {cautions.map((caution, index) => (
          <li key={`${caution}-${index}`} className="warning">
            {caution}
          </li>
        ))}
      </ul>
    </div>
  );
}
