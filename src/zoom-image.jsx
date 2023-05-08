import React, {useRef, useMemo, useEffect, useState, useCallback} from "react";

const SCROLL_SENSITIVITY = 0.0005;
const MAX_ZOOM = 5;
const MIN_ZOOM = 0.1;

const ZoomImage = ({ image }) => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [draggind, setDragging] = useState(false);

  const touch = useRef({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const observer = useRef(null);
  const background = useMemo(() => new Image(), [image]);

  const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

  const handleWheel = (event) => {
    const { deltaY } = event;
    if (!draggind) {
      setZoom((zoom) =>
          clamp(zoom + deltaY * SCROLL_SENSITIVITY * -1, MIN_ZOOM, MAX_ZOOM)
      );
    }
  };

  const handleMouseMove = useCallback((event) => {
    if (draggind) {
      const { x, y } = touch.current;
      const { clientX, clientY } = event;
      setOffset({
        x: offset.x + (x - clientX),
        y: offset.y + (y - clientY),
      });
      touch.current = { x: clientX, y: clientY };
      console.log("Moving");
    }
  }, [draggind, touch, setOffset, offset]);

  const handleMouseDown = useCallback((event) => {
    setDragging(true);
    const { clientX, clientY } = event;
    touch.current = { x: clientX, y: clientY };
  }, [touch]);

  const handleMouseUp = () => setDragging(false);

  const draw = useCallback(() => {
    if (canvasRef.current) {
      const { width, height } = canvasRef.current;
      const context = canvasRef.current.getContext("2d");

      // Set canvas dimensions
      canvasRef.current.width = width;
      canvasRef.current.height = height;

      // Clear canvas and scale it
      context.translate(-offset.x, -offset.y);
      context.scale(zoom, zoom);
      context.clearRect(0, 0, width, height);

      // Make sure we're zooming to the center
      const x = (context.canvas.width / zoom - background.width) / 2;
      const y = (context.canvas.height / zoom - background.height) / 2;

      // Draw image
      context.drawImage(background, x, y);
    }
  }, [canvasRef, zoom, offset, background]);

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
  }, [background]);

  useEffect(() => {
    draw();
  }, [zoom, offset, draw]);

  return (
      <div ref={containerRef}>
        <canvas
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onWheel={handleWheel}
            onMouseMove={(event) => handleMouseMove(event)}
            ref={canvasRef}
        />
      </div>
  );
};

export default ZoomImage;
