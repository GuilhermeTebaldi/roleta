import React, { memo, useEffect, useRef } from 'react';
import { ThemeConfig } from '../types';

interface BackgroundProps {
  theme: ThemeConfig;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
}

const MAX_DPR = 1.5;
const FRAME_INTERVAL_MS = 1000 / 30;

const Background: React.FC<BackgroundProps> = ({ theme }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number | null = null;
    let particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let lastFrameTime = 0;

    const createParticle = (): Particle => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 4 + 1,
      speedX: Math.random() * 0.6 - 0.3,
      speedY: Math.random() * 0.6 - 0.3,
      color: theme.particles[Math.floor(Math.random() * theme.particles.length)]
    });

    const initParticles = () => {
      const particleCount = Math.max(10, Math.min(24, Math.floor((width * height) / 90000)));
      particles = Array.from({ length: particleCount }, createParticle);
    };

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;

      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      initParticles();
    };

    const updateAndDraw = (timestamp: number) => {
      if (!document.hidden && timestamp - lastFrameTime >= FRAME_INTERVAL_MS) {
        lastFrameTime = timestamp;

        ctx.clearRect(0, 0, width, height);

        for (const particle of particles) {
          particle.x += particle.speedX;
          particle.y += particle.speedY;

          if (particle.x > width) particle.x = 0;
          else if (particle.x < 0) particle.x = width;

          if (particle.y > height) particle.y = 0;
          else if (particle.y < 0) particle.y = height;

          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(updateAndDraw);
    };

    const handleVisibilityChange = () => {
      lastFrameTime = 0;
    };

    resizeCanvas();
    animationFrameId = requestAnimationFrame(updateAndDraw);

    window.addEventListener('resize', resizeCanvas);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [theme.particles]);

  return (
    <div className={`fixed inset-0 -z-10 bg-gradient-to-br ${theme.background} transition-colors duration-1000 overflow-hidden`}>
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-white/10 blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-black/20 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />

      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-40"
      />
    </div>
  );
};

export default memo(Background);
