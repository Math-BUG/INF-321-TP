"use client";
import React from "react";
import { useRouter } from "next/navigation";

type Props = {
  challengeId?: number | null;
  levelId?: number | null;
  name: string;
  instructions?: string | null;
  levels?: Array<{ id: number; name: string }>;
};

export default function MatchStart({ challengeId, levelId, name, instructions, levels = [] }: Props) {
  const router = useRouter();
  const [selectedLevelId, setSelectedLevelId] = React.useState<number | null>(levelId || null);

  const handleClose = () => {
    const ok = window.confirm("Tem certeza que deseja fechar? A partida não será salva.");
    if (ok) router.push('/');
  };

  const handleStart = () => {
    console.log('Starting match', { challengeId, levelId });
    // TODO: start the match flow
  };

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0f172a',
      color: 'white',
      padding: 24,
      boxSizing: 'border-box'
    }}>
      <div style={{ position: 'absolute', top: 16, right: 16 }}>
        <button onClick={handleClose} aria-label="Fechar" style={{
          background: 'transparent',
          border: 'none',
          color: 'white',
          fontSize: 24,
          cursor: 'pointer'
        }}>✕</button>
      </div>

      <div style={{ maxWidth: 900, textAlign: 'center' }}>
        <h1 style={{ fontSize: 48, marginBottom: 16 }}>{name}</h1>
        <p style={{ fontSize: 18, marginBottom: 32, whiteSpace: 'pre-wrap', color: '#cbd5e1' }}>{instructions || 'Sem instruções disponíveis.'}</p>

        {levels.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <label style={{ fontSize: 16, marginRight: 12, color: '#cbd5e1' }}>Nível de dificuldade:</label>
            <select
              value={selectedLevelId || ''}
              onChange={(e) => setSelectedLevelId(e.target.value ? parseInt(e.target.value, 10) : null)}
              style={{
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid #475569',
                background: '#1e293b',
                color: 'white',
                fontSize: 14,
                cursor: 'pointer'
              }}
            >
              <option value='' disabled>Selecionar nível...</option>
              {levels.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <button onClick={handleStart} style={{
          background: '#10b981',
          border: 'none',
          color: 'white',
          padding: '12px 24px',
          borderRadius: 8,
          fontSize: 16,
          cursor: 'pointer'
        }}>Pronto? Vamos lá!</button>
      </div>
    </div>
  );
}
