import React, {useRef, useMemo, useEffect, useState, useCallback} from "react";

const DEFAULT_ZOOM = 2;
const SCROLL_SENSITIVITY = 0.005;
const MAX_ZOOM = 5;
const MIN_ZOOM = 0.1;

const ZoomImageV2 = ({ image }) => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [engaged, setEngaged] = useState(false);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const background = useMemo(() => new Image(), [image]);
  const initRef = useRef({x: 0, y: 0})

  const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

  const handleWheel = (event) => {
    const { deltaY } = event;
    if (engaged) {
      setZoom((zoom) =>
          clamp(zoom + deltaY * SCROLL_SENSITIVITY * -1, MIN_ZOOM, MAX_ZOOM)
      );
    }
  };

  const handleMouseMove = useCallback((event) => {
    if (engaged) {
      const { nativeEvent } = event;
      const { width, height } = canvasRef.current;
      initRef.current = { x: nativeEvent.offsetX, y: nativeEvent.offsetY };
      setOffset({
        x: width / 2 - nativeEvent.offsetX * zoom,
        y: height / 2 - nativeEvent.offsetY * zoom,
      });
    }
  }, [engaged, setOffset, zoom]);

  const handleMouseDown = useCallback((event) => {
    setEngaged(true);
    const { nativeEvent } = event;
    const { width, height } = canvasRef.current;
    initRef.current = { x: nativeEvent.offsetX, y: nativeEvent.offsetY };
    setOffset({
      x: width / 2 - nativeEvent.offsetX * zoom,
      y: height / 2 - nativeEvent.offsetY * zoom,
    });
  }, [initRef, zoom]);

  const draw = useCallback(() => {
    if (canvasRef.current && engaged) {
      const { width, height } = canvasRef.current;
      const context = canvasRef.current.getContext("2d");

      // Set canvas dimensions
      canvasRef.current.width = width;
      canvasRef.current.height = height;

      // Clear canvas and scale it
      context.translate(offset.x, offset.y);
      context.scale(zoom, zoom);
      context.clearRect(0, 0, width, height);

      // Draw image
      context.drawImage(background, 0 ,0);
    }
  }, [engaged, offset.x, offset.y, zoom, background]);

  useEffect(() => {
    background.src = image;

    if (canvasRef.current) {
      background.onload = () => {
        // Get the image dimensions
        const { width, height } = background;
        canvasRef.current.width = width;
        canvasRef.current.height = height;

        // Set image as background
        canvasRef.current.getContext("2d").drawImage(background, 0, 0);
      };
    }
  }, [background, image]);

  useEffect(() => {
    draw();
  }, [offset, draw, engaged, initRef]);

  return (
      <div ref={containerRef}>
        <canvas ref={canvasRef}
                onMouseDown={handleMouseDown}
                onWheel={handleWheel}
                onMouseMove={(event) => handleMouseMove(event)}
        />
      </div>
  );
};

export default ZoomImageV2;
