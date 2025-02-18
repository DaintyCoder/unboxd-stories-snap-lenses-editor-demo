// main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
// STEP 22:
// Provide the Camera Kit context
// In main.tsx, use the CameraKit component to provide the context to the App component and its children. 
// This ensures that all components within App can access the Camera Kit context.
import { CameraKit } from './contexts/CameraKitContext';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <CameraKit>
            <App />
        </CameraKit>
    </StrictMode>,
);