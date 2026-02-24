import React, { useEffect, useRef } from 'react';

const TradingPreview: React.FC = () => {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.clientWidth * devicePixelRatio;
    let height = canvas.clientHeight * devicePixelRatio;
    canvas.width = width;
    canvas.height = height;
    ctx.scale(devicePixelRatio, devicePixelRatio);

    let t = 0;

    const draw = () => {
      if (!ctx) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      // background glow
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, 'rgba(16,24,39,0.9)');
      grad.addColorStop(1, 'rgba(7,10,20,0.6)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // draw grid lines
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 1;
      for (let i = 1; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(0, (h / 6) * i);
        ctx.lineTo(w, (h / 6) * i);
        ctx.stroke();
      }

      // waveform (price line)
      ctx.beginPath();
      const amplitude = h * 0.18;
      const centerY = h * 0.45;
      const points = 120;
      for (let i = 0; i <= points; i++) {
        const x = (i / points) * w;
        const noise = Math.sin((i * 0.35) + t * 0.02) * 0.6 + Math.cos((i * 0.13) + t * 0.01) * 0.4;
        const y = centerY - noise * amplitude;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(16,185,129,0.95)';
      ctx.stroke();

      // glow
      ctx.beginPath();
      for (let i = 0; i <= points; i++) {
        const x = (i / points) * w;
        const noise = Math.sin((i * 0.35) + t * 0.02) * 0.6 + Math.cos((i * 0.13) + t * 0.01) * 0.4;
        const y = centerY - noise * amplitude;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(16,185,129,0.12)';
      ctx.lineWidth = 8;
      ctx.stroke();

      // small bubbles
      for (let i = 0; i < 8; i++) {
        const px = ((t * 0.6 + i * 37) % points) / points * w;
        const py = centerY - Math.sin((i * 0.9) + t * 0.02) * amplitude * 0.6;
        ctx.beginPath();
        ctx.fillStyle = 'rgba(99,102,241,0.12)';
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      t += 1;
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    const onResize = () => {
      if (!canvas) return;
      const w = canvas.clientWidth * devicePixelRatio;
      const h = canvas.clientHeight * devicePixelRatio;
      canvas.width = w;
      canvas.height = h;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };
    window.addEventListener('resize', onResize);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div className="hidden lg:flex items-center justify-center p-6" style={{ minWidth: 480 }}>
      <div className="w-full h-[460px] rounded-xl overflow-hidden border border-white/6 shadow-lg">
        <canvas ref={ref} style={{ width: '100%', height: '100%', display: 'block' }} />
      </div>
    </div>
  );
};

export default TradingPreview;
