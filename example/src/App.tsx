import type {
  CropperCanvas as CropperCanvasElement,
  CropperImage as CropperImageElement,
  CropperSelection as CropperSelectionElement,
} from 'cropperjs';
import {
  CropperCanvas,
  CropperCrosshair,
  CropperGrid,
  CropperHandle,
  CropperImage,
  CropperSelection,
  CropperShade,
} from 'cropperjs-react-wrapper';
import { useEffect, useRef, useState } from 'react';
import image1 from '../assets/image1.png';
import image2 from '../assets/image2.png';

const App = () => {
  const cropperRef = useRef<CropperCanvasElement>(null);
  const imageRef = useRef<CropperImageElement>(null);
  const selectionRef = useRef<CropperSelectionElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image state
  const [imgSrc, setImgSrc] = useState(image1);
  const [croppedImage, setCroppedImage] = useState<string | undefined>();
  const [livePreview, setLivePreview] = useState<string | undefined>();

  // Canvas controls
  const [canvasBackground, setCanvasBackground] = useState(true);
  const [canvasDisabled, setCanvasDisabled] = useState(false);

  // Image transformation controls (track flip state)
  const [scaleX, setScaleX] = useState(1);
  const [scaleY, setScaleY] = useState(1);

  // Selection controls
  const [showShade, setShowShade] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showCrosshair, setShowCrosshair] = useState(true);
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(undefined);
  const [themeColor, setThemeColor] = useState('#3399ff');
  const [movable, setMovable] = useState(true);
  const [resizable, setResizable] = useState(true);
  const [zoomable, setZoomable] = useState(true);

  // Grid controls
  const [gridRows, setGridRows] = useState(3);
  const [gridColumns, setGridColumns] = useState(3);

  // Export controls
  const [exportFormat, setExportFormat] = useState<'png' | 'jpeg' | 'webp'>(
    'png',
  );
  const [exportQuality, setExportQuality] = useState(0.92);
  const [cropData, setCropData] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState<
    'basic' | 'transform' | 'advanced' | 'actions'
  >('basic');

  const updateLivePreview = async () => {
    const selection = selectionRef.current;
    if (selection) {
      const canvas = await selection.$toCanvas();
      setLivePreview(canvas.toDataURL());
    }
  };

  const onCrop = () => {
    updateLivePreview();
    const selection = selectionRef.current;
    if (selection) {
      setCropData({
        x: Math.round(selection.x),
        y: Math.round(selection.y),
        width: Math.round(selection.width),
        height: Math.round(selection.height),
      });
    }
  };

  const handleGetResult = async () => {
    const selection = selectionRef.current;
    if (selection) {
      const canvas = await selection.$toCanvas();
      const mimeType = `image/${exportFormat}`;
      const dataUrl = canvas.toDataURL(mimeType, exportQuality);
      setCroppedImage(dataUrl);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          setImgSrc(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRotate = (degrees: number) => {
    const image = imageRef.current;
    if (image) {
      image.$rotate(`${degrees}deg`);
    }
  };

  const handleFlipHorizontal = () => {
    const newScaleX = scaleX * -1;
    setScaleX(newScaleX);
  };

  const handleFlipVertical = () => {
    const newScaleY = scaleY * -1;
    setScaleY(newScaleY);
  };

  const handleZoom = (delta: number) => {
    const image = imageRef.current;
    if (image) {
      image.$zoom(delta);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: normal
  useEffect(() => {
    const image = imageRef.current;
    if (image) {
      image.$scale(-1, scaleY);
    }
  }, [scaleX]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: normal
  useEffect(() => {
    const image = imageRef.current;
    if (image) {
      image.$scale(scaleX, -1);
    }
  }, [scaleY]);

  const handleResetTransformations = () => {
    const image = imageRef.current;
    if (image) {
      image.$resetTransform();
    }
  };

  const applyPreset = (preset: 'profile' | 'banner' | 'thumbnail') => {
    switch (preset) {
      case 'profile':
        setAspectRatio(1);
        break;
      case 'banner':
        setAspectRatio(16 / 9);
        break;
      case 'thumbnail':
        setAspectRatio(4 / 3);
        break;
    }
  };

  const downloadImage = async () => {
    if (!livePreview) return;

    try {
      // Convert data URL to blob
      const response = await fetch(livePreview);
      const blob = await response.blob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cropped-image-${Date.now()}.${exportFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>CropperJS-React-Wrapper Demo</h1>

        <div className="cropper-wrapper">
          <div className="cropper-container">
            <CropperCanvas
              style={{ height: '500px' }}
              ref={cropperRef}
              background={canvasBackground}
              disabled={canvasDisabled}
              themeColor={themeColor}
            >
              <CropperImage
                ref={imageRef}
                src={imgSrc}
                alt="Picture"
                rotatable={true}
                scalable={true}
                skewable={true}
                translatable={true}
              />
              {showShade && <CropperShade themeColor={themeColor} />}
              <CropperHandle action="select" plain />
              <CropperSelection
                ref={selectionRef}
                initialAspectRatio={1}
                aspectRatio={aspectRatio}
                movable={movable}
                resizable={resizable}
                zoomable={zoomable}
                keyboard={true}
                outlined={true}
                bounded={true}
                onChange={onCrop}
                themeColor={themeColor}
              >
                {showGrid && (
                  <CropperGrid
                    rows={gridRows}
                    columns={gridColumns}
                    bordered
                    covered
                    themeColor={themeColor}
                  />
                )}
                {showCrosshair && (
                  <CropperCrosshair centered themeColor={themeColor} />
                )}
                <CropperHandle
                  action="move"
                  themeColor="rgba(255, 255, 255, 0.35)"
                />
                <CropperHandle action="n-resize" themeColor={themeColor} />
                <CropperHandle action="e-resize" themeColor={themeColor} />
                <CropperHandle action="s-resize" themeColor={themeColor} />
                <CropperHandle action="w-resize" themeColor={themeColor} />
                <CropperHandle action="ne-resize" themeColor={themeColor} />
                <CropperHandle action="nw-resize" themeColor={themeColor} />
                <CropperHandle action="se-resize" themeColor={themeColor} />
                <CropperHandle action="sw-resize" themeColor={themeColor} />
              </CropperSelection>
            </CropperCanvas>
          </div>

          <div className="live-preview-section">
            <h3>Live Preview</h3>
            {livePreview ? (
              <div>
                <img
                  src={livePreview}
                  alt="Live Preview"
                  className="live-preview-image"
                />
                <button
                  type="button"
                  onClick={downloadImage}
                  className="primary"
                  style={{ width: '100%', marginTop: '8px' }}
                >
                  Download Image
                </button>
              </div>
            ) : null}
            {cropData && (
              <div className="crop-data">
                <div>X: {cropData.x}</div>
                <div>Y: {cropData.y}</div>
                <div>Width: {cropData.width}</div>
                <div>Height: {cropData.height}</div>
              </div>
            )}
          </div>
        </div>

        <div className="param-section">
          <div className="tabs">
            <button
              type="button"
              className={activeTab === 'basic' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('basic')}
            >
              Basic Controls
            </button>
            <button
              type="button"
              className={activeTab === 'transform' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('transform')}
            >
              Transformations
            </button>
            <button
              type="button"
              className={activeTab === 'advanced' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('advanced')}
            >
              Advanced
            </button>
            <button
              type="button"
              className={activeTab === 'actions' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('actions')}
            >
              Actions
            </button>
          </div>

          <div className="controls">
            {activeTab === 'basic' && (
              <>
                <div className="control-section">
                  <h3>Image Source</h3>
                  <div className="control-group">
                    <button type="button" onClick={() => setImgSrc(image1)}>
                      Image 1
                    </button>
                    <button type="button" onClick={() => setImgSrc(image2)}>
                      Image 2
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Upload Image
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleFileUpload}
                    />
                  </div>
                </div>

                <div className="control-section">
                  <h3>Selection Options</h3>
                  <div className="control-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={showShade}
                        onChange={(e) => setShowShade(e.target.checked)}
                      />
                      Show Shade
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={showGrid}
                        onChange={(e) => setShowGrid(e.target.checked)}
                      />
                      Show Grid
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={showCrosshair}
                        onChange={(e) => setShowCrosshair(e.target.checked)}
                      />
                      Show Crosshair
                    </label>
                  </div>
                  <div className="control-group">
                    <label>
                      Aspect Ratio:
                      <select
                        value={aspectRatio}
                        onChange={(e) => setAspectRatio(Number(e.target.value))}
                      >
                        <option value={16 / 9}>16:9 (Landscape)</option>
                        <option value={4 / 3}>4:3</option>
                        <option value={1}>1:1 (Square)</option>
                        <option value={3 / 4}>3:4 (Portrait)</option>
                        <option value={9 / 16}>9:16 (Story)</option>
                        <option value={NaN}>Free</option>
                      </select>
                    </label>
                    <label>
                      Theme Color:
                      <input
                        type="color"
                        value={themeColor}
                        onChange={(e) => setThemeColor(e.target.value)}
                      />
                    </label>
                  </div>
                </div>

                <div className="control-section">
                  <h3>Presets</h3>
                  <div className="control-group">
                    <button
                      type="button"
                      onClick={() => applyPreset('profile')}
                    >
                      Profile Picture (1:1)
                    </button>
                    <button type="button" onClick={() => applyPreset('banner')}>
                      Banner (16:9)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('thumbnail')}
                    >
                      Thumbnail (4:3)
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'transform' && (
              <>
                <div className="control-section">
                  <h3>Rotation</h3>
                  <div className="control-group">
                    <button type="button" onClick={() => handleRotate(90)}>
                      Rotate 90° CW
                    </button>
                    <button type="button" onClick={() => handleRotate(-90)}>
                      Rotate 90° CCW
                    </button>
                    <button type="button" onClick={() => handleRotate(180)}>
                      Rotate 180°
                    </button>
                  </div>
                </div>

                <div className="control-section">
                  <h3>Flip</h3>
                  <div className="control-group">
                    <button type="button" onClick={handleFlipHorizontal}>
                      Flip Horizontal
                    </button>
                    <button type="button" onClick={handleFlipVertical}>
                      Flip Vertical
                    </button>
                  </div>
                </div>

                <div className="control-section">
                  <h3>Zoom</h3>
                  <div className="control-group">
                    <button type="button" onClick={() => handleZoom(0.1)}>
                      Zoom In (+)
                    </button>
                    <button type="button" onClick={() => handleZoom(-0.1)}>
                      Zoom Out (-)
                    </button>
                    <button type="button" onClick={handleResetTransformations}>
                      Reset Transformations
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'advanced' && (
              <>
                <div className="control-section">
                  <h3>Canvas Options</h3>
                  <div className="control-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={canvasBackground}
                        onChange={(e) => setCanvasBackground(e.target.checked)}
                      />
                      Show Background
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={canvasDisabled}
                        onChange={(e) => setCanvasDisabled(e.target.checked)}
                      />
                      Disable Canvas
                    </label>
                  </div>
                </div>

                <div className="control-section">
                  <h3>Selection Behavior</h3>
                  <div className="control-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={movable}
                        onChange={(e) => setMovable(e.target.checked)}
                      />
                      Movable
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={resizable}
                        onChange={(e) => setResizable(e.target.checked)}
                      />
                      Resizable
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={zoomable}
                        onChange={(e) => setZoomable(e.target.checked)}
                      />
                      Zoomable
                    </label>
                  </div>
                </div>

                <div className="control-section">
                  <h3>Grid Customization</h3>
                  <div className="control-group">
                    <label>
                      Rows:
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={gridRows}
                        onChange={(e) => setGridRows(Number(e.target.value))}
                      />
                    </label>
                    <label>
                      Columns:
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={gridColumns}
                        onChange={(e) => setGridColumns(Number(e.target.value))}
                      />
                    </label>
                  </div>
                </div>

                <div className="control-section">
                  <h3>Export Options</h3>
                  <div className="control-group">
                    <label>
                      Format:
                      <select
                        value={exportFormat}
                        onChange={(e) =>
                          setExportFormat(
                            e.target.value as 'png' | 'jpeg' | 'webp',
                          )
                        }
                      >
                        <option value="png">PNG</option>
                        <option value="jpeg">JPEG</option>
                        <option value="webp">WebP</option>
                      </select>
                    </label>
                    {exportFormat !== 'png' && (
                      <label>
                        Quality: {Math.round(exportQuality * 100)}%
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={exportQuality}
                          onChange={(e) =>
                            setExportQuality(Number(e.target.value))
                          }
                        />
                      </label>
                    )}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'actions' && (
              <div className="control-section">
                <h3>Actions</h3>
                <div className="control-group">
                  <button type="button" onClick={onCrop}>
                    Log Data (Console)
                  </button>
                  <button
                    type="button"
                    onClick={handleGetResult}
                    className="primary"
                  >
                    Crop Image
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {croppedImage && (
          <div className="result-section">
            <h2>Cropped Result</h2>
            <img src={croppedImage} alt="Cropped" className="preview-image" />
            <div className="control-group">
              <a href={croppedImage} download={`cropped.${exportFormat}`}>
                <button type="button">Download</button>
              </a>
            </div>
          </div>
        )}

        <div className="info-section">
          <h3>Keyboard Shortcuts</h3>
          <ul>
            <li>
              <kbd>Delete</kbd> or <kbd>⌘ + Backspace</kbd> - Remove active
              selection
            </li>
            <li>
              <kbd>←</kbd> - Move selection left by 1px
            </li>
            <li>
              <kbd>→</kbd> - Move selection right by 1px
            </li>
            <li>
              <kbd>↑</kbd> - Move selection up by 1px
            </li>
            <li>
              <kbd>↓</kbd> - Move selection down by 1px
            </li>
            <li>
              <kbd>+</kbd> - Zoom in by 10%
            </li>
            <li>
              <kbd>-</kbd> - Zoom out by 10%
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default App;
