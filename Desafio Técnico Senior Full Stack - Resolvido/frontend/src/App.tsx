import { useState } from 'react';
import { ProcessosList } from './components/ProcessosList';
import { ProcessoDetail } from './components/ProcessoDetail';
import './App.css';

type View = 'list' | 'detail';

function App() {
  const [view, setView] = useState<View>('list');
  const [selectedProcesso, setSelectedProcesso] = useState<string | null>(null);

  const handleSelectProcesso = (numeroProcesso: string) => {
    setSelectedProcesso(numeroProcesso);
    setView('detail');
  };

  const handleBack = () => {
    setView('list');
    setSelectedProcesso(null);
  };

  return (
    <div className="app">
      {view === 'list' ? (
        <ProcessosList onSelectProcesso={handleSelectProcesso} />
      ) : (
        selectedProcesso && (
          <ProcessoDetail
            numeroProcesso={selectedProcesso}
            onBack={handleBack}
          />
        )
      )}
    </div>
  );
}

export default App;
