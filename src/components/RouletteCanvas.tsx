import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { ThemeConfig, RouletteStyle, Participant } from '../types';

interface RouletteCanvasProps {
  participants: Participant[];
  theme: ThemeConfig;
  style: RouletteStyle;
  isSpinning: boolean;
  onSpinEnd: (winner: Participant) => void;
  forcedWinnerId: string | null;
  blockedWinnerId: string | null;
}

const FRICTION = 0.994;
const MIN_VELOCITY = 0.0005;
const TOP_ZOOM_START_VELOCITY = 0.025;
const TOP_ZOOM_SCALE = 1.35;
const TOP_ZOOM_Y_OFFSET_PERCENT = ((TOP_ZOOM_SCALE - 1) / 2) * 100;
const MAX_SPIN_DURATION_MS = 18000;

const RouletteCanvas: React.FC<RouletteCanvasProps> = ({
  participants,
  theme,
  style,
  isSpinning,
  onSpinEnd,
  forcedWinnerId,
  blockedWinnerId
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const wheelCacheRef = useRef<HTMLCanvasElement | null>(null);
  const rotationRef = useRef(0);
  const velocityRef = useRef(0);
  const isSpinningRef = useRef(false);
  const requestRef = useRef<number | null>(null);
  const spinStartTimeRef = useRef(0);
  const participantsRef = useRef(participants);
  const onSpinEndRef = useRef(onSpinEnd);
  const isTopZoomedRef = useRef(false);
  const [isTopZoomed, setIsTopZoomed] = useState(false);

  const activateTopZoom = useCallback(() => {
    if (isTopZoomedRef.current) return;
    isTopZoomedRef.current = true;
    setIsTopZoomed(true);
  }, []);

  const deactivateTopZoom = useCallback(() => {
    if (!isTopZoomedRef.current) return;
    isTopZoomedRef.current = false;
    setIsTopZoomed(false);
  }, []);

  const setupCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return false;

    const rect = container.getBoundingClientRect();
    const baseSize = Math.max(280, Math.floor(Math.min(rect.width, rect.height || rect.width)));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pixelSize = Math.max(1, Math.floor(baseSize * dpr));

    if (canvas.width !== pixelSize || canvas.height !== pixelSize) {
      canvas.width = pixelSize;
      canvas.height = pixelSize;
    }

    return true;
  }, []);

  const drawStaticWheel = useCallback((ctx: CanvasRenderingContext2D, size: number) => {
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = Math.min(centerX, centerY) - 40;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 15, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fill();

    if (participants.length === 0) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#e5e7eb';
      ctx.fill();
      ctx.strokeStyle = '#9ca3af';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#6b7280';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Adicione nomes', centerX, centerY);
      return;
    }

    const segmentAngle = (Math.PI * 2) / participants.length;
    const fontSize = Math.max(12, 24 - participants.length * 0.3);

    participants.forEach((participant, i) => {
      const startAngle = i * segmentAngle;
      const endAngle = (i + 1) * segmentAngle;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      switch (style) {
        case 'solid':
          ctx.fillStyle = theme.wheelColors[0];
          break;
        case 'gradient': {
          const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
          grad.addColorStop(0, theme.wheelColors[i % theme.wheelColors.length]);
          grad.addColorStop(1, theme.accent);
          ctx.fillStyle = grad;
          break;
        }
        case 'crystal':
          ctx.fillStyle = `${theme.wheelColors[i % theme.wheelColors.length]}88`;
          break;
        default:
          ctx.fillStyle = theme.wheelColors[i % theme.wheelColors.length];
      }

      ctx.fill();

      if (style !== 'minimalist') {
        ctx.strokeStyle = style === 'neon' ? theme.accent : '#ffffff44';
        ctx.lineWidth = style === 'neon' ? 3 : 1;
        ctx.stroke();
      }

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + segmentAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = theme.text;
      ctx.font = `bold ${fontSize}px sans-serif`;

      if (style === 'neon') {
        ctx.shadowBlur = 10;
        ctx.shadowColor = theme.accent;
      }

      ctx.fillText(participant.name, radius - 20, 10);
      ctx.restore();
    });

    if (style === '3d') {
      const grad = ctx.createRadialGradient(centerX, centerY, radius * 0.8, centerX, centerY, radius);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(0,0,0,0.3)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(centerX, centerY, 25, 0, Math.PI * 2);
    ctx.fillStyle = theme.text;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 8;
    ctx.stroke();
  }, [participants, style, theme]);

  const rebuildWheelCache = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const offscreen = document.createElement('canvas');
    offscreen.width = canvas.width;
    offscreen.height = canvas.height;

    const offscreenCtx = offscreen.getContext('2d');
    if (!offscreenCtx) return;

    offscreenCtx.clearRect(0, 0, offscreen.width, offscreen.height);
    drawStaticWheel(offscreenCtx, offscreen.width);
    wheelCacheRef.current = offscreen;
  }, [drawStaticWheel]);

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const wheelCache = wheelCacheRef.current;
    if (!wheelCache) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (participants.length > 0) {
      const center = canvas.width / 2;
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(rotationRef.current);
      ctx.drawImage(wheelCache, -center, -center);
      ctx.restore();
      return;
    }

    ctx.drawImage(wheelCache, 0, 0);
  }, [participants.length]);

  const stopAnimationLoop = useCallback(() => {
    if (requestRef.current !== null) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
  }, []);

  const finishSpin = useCallback(() => {
    const currentParticipants = participantsRef.current;
    if (currentParticipants.length === 0) return;

    const segmentAngle = (Math.PI * 2) / currentParticipants.length;
    const normalizedRotation = (rotationRef.current % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
    const relativeRotation = (normalizedRotation + Math.PI / 2) % (Math.PI * 2);
    const adjustedRotation = (relativeRotation + Math.PI * 2) % (Math.PI * 2);
    const winningIndex = Math.floor(((Math.PI * 2 - adjustedRotation) % (Math.PI * 2)) / segmentAngle) % currentParticipants.length;

    onSpinEndRef.current(currentParticipants[winningIndex]);
  }, []);

  const animate = useCallback(() => {
    if (!isSpinningRef.current) return;

    const elapsed = performance.now() - spinStartTimeRef.current;
    if (elapsed > MAX_SPIN_DURATION_MS || !Number.isFinite(velocityRef.current)) {
      isSpinningRef.current = false;
      velocityRef.current = 0;
      stopAnimationLoop();
      deactivateTopZoom();
      finishSpin();
      return;
    }

    rotationRef.current += velocityRef.current;
    velocityRef.current *= FRICTION;

    if (velocityRef.current <= TOP_ZOOM_START_VELOCITY) {
      activateTopZoom();
    }

    drawFrame();

    if (velocityRef.current < MIN_VELOCITY) {
      isSpinningRef.current = false;
      velocityRef.current = 0;
      stopAnimationLoop();
      deactivateTopZoom();
      finishSpin();
      return;
    }

    requestRef.current = requestAnimationFrame(animate);
  }, [activateTopZoom, deactivateTopZoom, drawFrame, finishSpin, stopAnimationLoop]);

  const setVelocityToTargetIndex = useCallback((targetIndex: number) => {
    if (targetIndex < 0 || targetIndex >= participants.length) return false;

    const segmentAngle = (Math.PI * 2) / participants.length;
    const pointerAngle = -Math.PI / 2;
    const segmentMiddle = (targetIndex + 0.5) * segmentAngle;
    const targetRotation = pointerAngle - segmentMiddle;

    const normalizedTarget = (targetRotation % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
    const currentRotation = (rotationRef.current % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);

    const distanceToTarget = (normalizedTarget - currentRotation + Math.PI * 2) % (Math.PI * 2);
    const extraSpins = 8 + Math.floor(Math.random() * 4);
    const totalDistance = extraSpins * Math.PI * 2 + distanceToTarget;

    velocityRef.current = totalDistance * (1 - FRICTION) + MIN_VELOCITY;
    return true;
  }, [participants.length]);

  const startSpin = useCallback(() => {
    if (participants.length < 2) return;

    spinStartTimeRef.current = performance.now();
    deactivateTopZoom();
    isSpinningRef.current = true;

    if (forcedWinnerId) {
      const targetIndex = participants.findIndex((participant) => participant.id === forcedWinnerId);
      const applied = setVelocityToTargetIndex(targetIndex);
      if (!applied) velocityRef.current = 0.25 + Math.random() * 0.15;
    } else if (blockedWinnerId) {
      const blockedIndex = participants.findIndex((participant) => participant.id === blockedWinnerId);
      const availableIndexes = participants
        .map((_, index) => index)
        .filter((index) => index !== blockedIndex);

      if (availableIndexes.length > 0) {
        const randomIndex = availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
        setVelocityToTargetIndex(randomIndex);
      } else {
        velocityRef.current = 0.25 + Math.random() * 0.15;
      }
    } else {
      velocityRef.current = 0.25 + Math.random() * 0.15;
    }

    stopAnimationLoop();
    requestRef.current = requestAnimationFrame(animate);
  }, [
    animate,
    blockedWinnerId,
    deactivateTopZoom,
    forcedWinnerId,
    participants,
    setVelocityToTargetIndex,
    stopAnimationLoop
  ]);

  useEffect(() => {
    participantsRef.current = participants;
  }, [participants]);

  useEffect(() => {
    onSpinEndRef.current = onSpinEnd;
  }, [onSpinEnd]);

  useEffect(() => {
    const updated = setupCanvasSize();
    if (!updated) return;
    rebuildWheelCache();
    drawFrame();
  }, [drawFrame, rebuildWheelCache, setupCanvasSize]);

  useEffect(() => {
    if (isSpinning) {
      if (!isSpinningRef.current || requestRef.current === null) {
        startSpin();
      }
      return;
    }

    isSpinningRef.current = false;
    velocityRef.current = 0;
    stopAnimationLoop();
    deactivateTopZoom();
  }, [isSpinning, startSpin, stopAnimationLoop, deactivateTopZoom]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleResize = () => {
      const updated = setupCanvasSize();
      if (!updated) return;
      rebuildWheelCache();
      drawFrame();
    };

    handleResize();

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    window.addEventListener('resize', handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      isSpinningRef.current = false;
      velocityRef.current = 0;
      stopAnimationLoop();
      deactivateTopZoom();
    };
  }, [drawFrame, rebuildWheelCache, setupCanvasSize, stopAnimationLoop, deactivateTopZoom]);

  return (
    <div ref={containerRef} className="relative w-full aspect-square mx-auto">
      <canvas
        ref={canvasRef}
        width={800}
        height={800}
        className="w-full h-full drop-shadow-2xl will-change-transform transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          transformOrigin: '50% 50%',
          transform: isTopZoomed
            ? `translateY(${TOP_ZOOM_Y_OFFSET_PERCENT}%) scale(${TOP_ZOOM_SCALE})`
            : 'translateY(0) scale(1)'
        }}
      />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-12 z-10"
        style={{
          filter: style === 'neon' ? `drop-shadow(0 0 10px ${theme.accent})` : 'none'
        }}
      >
        <div
          className="w-full h-full bg-white clip-path-triangle"
          style={{
            backgroundColor: theme.accent,
            clipPath: 'polygon(50% 100%, 0 0, 100% 0)'
          }}
        />
      </div>
    </div>
  );
};

export default memo(RouletteCanvas);
