// contexts/CameraKitContext.tsx
import { bootstrapCameraKit, CameraKitSession, Lens } from '@snap/camera-kit';
import { createContext,/*  useEffect, */ useRef, useState } from 'react';

// STEP 2:
// Define API token and Lens group ID
// These can be found in My Lenses and will be used to bootstrap Camera Kit as well as fetch Lenses.
const apiToken = import.meta.env.VITE_CAMERA_KIT_API_TOKEN;
const lensGroupId = import.meta.env.VITE_LENS_GROUP_ID;

// STEP 3:
// Define CameraKitState interface
// This represents the properties available to components within this context.
export interface CameraKitState {
    session: CameraKitSession;
    lenses: Lens[];
}

// STEP 4:
// Create the context
// Initially, set the context value to null. After Camera Kit is initialized, the context will be populated with the appropriate data.
export const CameraKitContext = createContext<CameraKitState | null>(null);

// STEP 5:
// Create a CameraKit wrapper component
// This component can be used to wrap parts of the application where Camera Kit will be used.
export const CameraKit: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // STEP 6:
    // Create a reference to track initialization
    // To ensure Camera Kit is only bootstrapped once, create a reference with useRef to be used to track when Camera Kit has been initialized.
    const isInitialized = useRef<boolean>(false);

    // STEP 7:
    // Define state for the Camera Kit session and Lenses
    // These values will ultimately become accessible by consumers of the CameraKitContext.
    const [session, setSession] = useState<CameraKitSession | null>(null);
    const [lenses, setLenses] = useState<Lens[]>([]);

    // STEP 8:
    // Create a Effect that calls a new initializeCameraKit function
    // This Effect will set all the logic to initialize the Camera Kit Sesson and fetch Lenses.
    const initializeCameraKit = async () => {
        // STEP 9:
        // Bootstrap Camera Kit
        // Using the API token defined at the top of this file, bootstrap Camera Kit.
        const cameraKit = await bootstrapCameraKit({ apiToken });
        // STEP 10:
        // Create a Camera Kit Session
        // This session will be used to manage video sources and apply Lenses.
        const session = await cameraKit.createSession();
        // STEP 11:
        // Fetch Lenses
        // Using the Lens Group ID defined at the top of this file, fetch Lenses from the Camera Kit backend.
        const { lenses } = await cameraKit.lensRepository.loadLensGroups([lensGroupId]);

        // STEP 12:
        // Set the Camera Kit Session and Lenses to state.
        setLenses(lenses);
        setSession(session);
    };

    // STEP 13:
    // Implement the isInitialized reference
    // To prevent Camera Kit from being initialized multiple times, check if isInitialized is true and return early if it is; otherwise, set isInitialized to true.
    const handleUserGesture = () => {
        if (isInitialized.current) return;
        isInitialized.current = true;
        initializeCameraKit();
    };

    // STEP 14:
    // Render a loading state
    // While Camera Kit is initializing and there is no active session, render a loading state.
    return !session ? (
        <div>
            <button onClick={handleUserGesture}>Initialize Camera Kit</button>
        </div>
    ) : (
        // STEP 16:
        // Provide the Camera Kit context
        // Once Camera Kit is initialized and we have an active session, provide the context to the children components.
        // The children components will have access to both the Camera Kit session and the Lenses from the specified Lens group.
        <CameraKitContext.Provider value={{ session, lenses }}>
            {children}
        </CameraKitContext.Provider>
    );
};