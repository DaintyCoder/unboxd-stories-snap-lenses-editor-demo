// App.tsx
import { useCallback, useEffect, useRef, useState } from 'react';
import { useCameraKit } from './hooks/useCameraKit';
import { createImageSource, /* Transform2D, */ Lens } from '@snap/camera-kit';

function App() {
    const { session, lenses } = useCameraKit();
    const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null);
    const [selectedLens, setSelectedLens] = useState<Lens | null>(null);
    const canvasContainerRef = useRef<HTMLDivElement>(null);

    // Initialize canvas
    useEffect(() => {
        if (!session) return;
        canvasContainerRef.current?.replaceWith(session.output.live);
    }, [session]);

    // Handle image upload
    const handleImageUpload = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
               /*  if (img.height <= img.width) {
                    alert('Please upload a vertical photo (height > width)');
                    return;
                } */
                setUploadedImage(img);
            };
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    }, []);

    // Apply image source to session
    useEffect(() => {
        if (!uploadedImage || !session) return;

        const applyImageSource = async () => {
            try {
                const source = createImageSource(uploadedImage, {
                    cameraType: 'user'
                });
                await session.setSource(source);
                if (selectedLens) await session.applyLens(selectedLens);
                session.play('live');
            } catch (error) {
                console.error('Error applying image source:', error);
            }
        };

        applyImageSource();
    }, [uploadedImage, session, selectedLens]);

    // Handle lens selection
    const handleLensChange = async (lens: Lens) => {
        try {
            await session?.applyLens(lens);
            setSelectedLens(lens);
        } catch (error) {
            console.error('Error applying lens:', error);
        }
    };

    // Handle download
    const handleDownload = () => {
        const canvas = session?.output.live;
        if (!canvas) return;

        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'snapchat-ar-photo.png';
        link.href = dataUrl;
        link.click();
    };

    return (
        <div className="app-container">
            <div className="controls">
                <label className="upload-button">
                    📸 Upload Photo
                    <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                    />
                </label>

                {lenses.length > 0 && (
                    <select
                        className="lens-selector"
                        onChange={(e) => handleLensChange(lenses[Number(e.target.value)])}
                        disabled={!uploadedImage}
                    >
                        <option value="">Select AR Effect</option>
                        {lenses.map((lens, index) => (
                            <option key={lens.id} value={index}>
                                {lens.name}
                            </option>
                        ))}
                    </select>
                )}

                {uploadedImage && (
                    <button className="download-button" onClick={handleDownload}>
                        💾 Download
                    </button>
                )}
            </div>

            <div className="canvas-container" ref={canvasContainerRef} />
        </div>
    );
}

export default App;