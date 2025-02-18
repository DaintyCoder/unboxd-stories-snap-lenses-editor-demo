// useCameraKit.ts
// STEP 17:
// Import necessary modules
// Import the useContext method from React along with the recently created CameraKitContext.
import { useContext } from 'react';
import { CameraKitContext } from '../contexts/CameraKitContext';

// STEP 18:
// Define the custom hook
// Create a new custom hook named useCameraKit.
export const useCameraKit = () => {
    // STEP 19:
    // Access the CameraKitContext value
    // This value contains the Camera Kit session and array of Lenses.
    const state = useContext(CameraKitContext);

    // STEP 20: 
    // Add a guard clause
    // Ensure that the hook is used within a component that is wrapped by the CameraKitContext provider. If the context value is null, throw an error.
    if (!state) {
        throw new Error('useCameraKit must be used inside of a CameraKitContext');
    }
    // STEP 21:
    // Return the context value 
    // If the context value is not null, return the current state.
    return state;
};