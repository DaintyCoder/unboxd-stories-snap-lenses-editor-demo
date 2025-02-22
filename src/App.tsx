import { useCallback, useEffect, useRef, useState } from 'react';
import { useCameraKit } from './hooks/useCameraKit';
import { createImageSource, Lens } from '@snap/camera-kit';
import './App.css';

/**
 * Resizes an image to fill the target dimensions (cover strategy).
 */
const resizeImageToFill = (
  img: HTMLImageElement,
  targetWidth: number,
  targetHeight: number
): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d')!;

  // Use Math.max so that the image fills the container completely
  const ratio = Math.max(targetWidth / img.width, targetHeight / img.height);
  const newWidth = img.width * ratio;
  const newHeight = img.height * ratio;

  // Center the image, cropping any excess
  const xOffset = (targetWidth - newWidth) / 2;
  const yOffset = (targetHeight - newHeight) / 2;

  ctx.drawImage(img, xOffset, yOffset, newWidth, newHeight);
  return canvas;
};

function App() {
  const { session, lenses } = useCameraKit();
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null);
  const [selectedLens, setSelectedLens] = useState<Lens | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const mediaContainerRef = useRef<HTMLDivElement>(null);

  // Append the session's live canvas to our canvas container
  useEffect(() => {
    if (!session) {
      console.log('Session not available');
      return;
    }
    console.log('Session available, attempting to append live canvas');
    if (canvasContainerRef.current) {
      console.log('Canvas container found, appending live output');
      // Remove existing child if any (to avoid duplicates)
      if (canvasContainerRef.current.firstChild) {
        canvasContainerRef.current.removeChild(canvasContainerRef.current.firstChild);
      }
      canvasContainerRef.current.appendChild(session.output.live);
    } else {
      console.log('Canvas container not found');
    }
  }, [session]);

  // Handle image upload and resize based on media container's dimensions
  const handleImageUpload = useCallback((file: File) => {
    console.log('Image upload initiated');
    const reader = new FileReader();
    reader.onload = (e) => {
      console.log('FileReader onload triggered');
      const img = new Image();
      img.onload = () => {
        console.log('Image loaded successfully');
        // Get dimensions of the media container
        if (mediaContainerRef.current) {
          const { clientWidth, clientHeight } = mediaContainerRef.current;
          console.log(`Resizing image to fill media container: ${clientWidth}x${clientHeight}`);
          const resizedCanvas = resizeImageToFill(img, clientWidth, clientHeight);
          const resizedImg = new Image();
          resizedImg.onload = () => {
            console.log('Resized image ready');
            setUploadedImage(resizedImg);
          };
          resizedImg.src = resizedCanvas.toDataURL('image/png');
        } else {
          console.warn('Media container ref not found. Using original image dimensions.');
          setUploadedImage(img);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  // When an image is uploaded, create and set the Camera Kit source
  useEffect(() => {
    if (!uploadedImage) {
      console.log('No uploaded image to process');
      return;
    }
    if (!session) {
      console.log('Session not available for image processing');
      return;
    }

    const applyImageSource = async () => {
      try {
        console.log('Applying image source');
        const source = createImageSource(uploadedImage, { cameraType: 'user' });
        console.log('Image source created:', source);
        await session.setSource(source);
        console.log('Image source set on session');
        if (selectedLens) {
          console.log('Applying selected lens');
          await session.applyLens(selectedLens);
        }
        session.play('live');
        console.log('Session playback started');
      } catch (error) {
        console.error('Error applying image source:', error);
      }
    };

    applyImageSource();
  }, [uploadedImage, session, selectedLens]);

  const handleLensSelect = async (lens: Lens) => {
    try {
      console.log(`Applying lens: ${lens.name}`);
      await session?.applyLens(lens);
      setSelectedLens(lens);
    } catch (error) {
      console.error('Error applying lens:', error);
    }
  };

  const handleDownload = () => {
    const canvas = session?.output.live;
    if (!canvas) {
      console.log('No canvas available for download');
      return;
    }
    console.log('Downloading image');
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'snapchat-ar-photo.png';
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="app-container">
      <div className="media-container" ref={mediaContainerRef}>
        {/* Canvas container inside media container */}
        <div className="canvas-container" ref={canvasContainerRef} />
        {uploadedImage && (
          <>
            <div className="snap-lens-scroller">
              {lenses.map((lens) => (
                <button
                  key={lens.id}
                  title={lens.name} // <-- Tooltip will show the lens name on hover
                  className={`snap-lens-item ${selectedLens?.id === lens.id ? 'active' : ''}`}
                  onClick={() => handleLensSelect(lens)}
                >
                  <img
                    src={lens.iconUrl || '/default-lens-icon.png'}
                    alt={lens.name}
                    className="snap-lens-icon"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/default-lens-icon.png';
                    }}
                  />
                </button>
              ))}
            </div>
            <div className="controls">
              <button className="download-button" onClick={handleDownload}>
                💾 Download
              </button>
            </div>
          </>
        )}
      </div>
      {!uploadedImage && (
        <div className="upload-container">
          <label className="upload-button">
            📸 Upload Photo
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  console.log('File selected for upload');
                  handleImageUpload(file);
                }
              }}
            />
          </label>
        </div>
      )}
    </div>
  );
}

export default App;
