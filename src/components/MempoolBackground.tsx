import React, { useRef, useEffect, useCallback } from "react";

interface MempoolBackgroundProps {
  containerRef: React.RefObject<HTMLElement>;
}

const MempoolBackground: React.FC<MempoolBackgroundProps> = ({ containerRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const blocksRef = useRef<{ x: number; y: number; size: number; opacity: number; targetOpacity: number; hue: number }[]>([]);
  const sizeRef = useRef({ w: 0, h: 0 });

  const init = useCallback((w: number, h: number) => {
    const gap = 2;
    const cellSize = 16;
    const step = cellSize + gap;
    const cols = Math.ceil(w / step) + 1;
    const rows = Math.ceil(h / step) + 1;
    const blocks: typeof blocksRef.current = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        blocks.push({
          x: c * step,
          y: r * step,
          size: cellSize,
          opacity: 0.03 + Math.random() * 0.12,
          targetOpacity: 0.03 + Math.random() * 0.12,
          hue: 160 + Math.random() * 40,
        });
      }
    }
    blocksRef.current = blocks;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { w: rect.width, h: rect.height };
      init(rect.width, rect.height);
    };

    resize();
    window.addEventListener("resize", resize);

    const pulse = setInterval(() => {
      const blocks = blocksRef.current;
      const count = Math.floor(blocks.length * 0.05);
      for (let i = 0; i < count; i++) {
        const idx = Math.floor(Math.random() * blocks.length);
        blocks[idx].targetOpacity = 0.15 + Math.random() * 0.4;
      }
      for (let i = 0; i < blocks.length; i++) {
        if (Math.random() > 0.85) {
          blocks[i].targetOpacity = 0.02 + Math.random() * 0.08;
        }
      }
    }, 1200);

    const draw = () => {
      const { w, h } = sizeRef.current;
      ctx.clearRect(0, 0, w, h);
      for (const b of blocksRef.current) {
        b.opacity += (b.targetOpacity - b.opacity) * 0.05;
        ctx.fillStyle = `hsla(${b.hue}, 80%, 55%, ${b.opacity})`;
        ctx.fillRect(b.x, b.y, b.size, b.size);
      }
      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
      clearInterval(pulse);
    };
  }, [init, containerRef]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
    />
  );
};

export default MempoolBackground;
