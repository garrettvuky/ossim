import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

export { default as Card } from './components/Card';
export { default as Button } from './components/Button';
export { default as Modal } from './components/Modal';
export { default as ProcessList } from './components/ProcessList';
export { MemoryDisplay } from './components/MemoryDisplay';
export { FileSystemTree } from './components/FileSystemTree';
export { DeviceList } from './components/DeviceList';
export { LogViewer } from './components/LogViewer';
