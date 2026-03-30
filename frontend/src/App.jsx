import React from 'react';
import './App.css';
import DeliveryMap from './components/DeliveryMap';

function App() {
  return (
      <div style={{ width: '100%', height: '100vh' }}>
        <DeliveryMap center={[37.618423, 55.751244]} zoom={12} />
      </div>
  );
}

export default App;