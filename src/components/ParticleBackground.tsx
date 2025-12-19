import React, { useEffect, useRef } from 'react';
const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let particles: any[] = [];
    let animationFrameId: number;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', resize); resize();

    class Particle {
      x: number; y: number; vx: number; vy: number; size: number;
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.size = Math.random() * 2;
      }
      update() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
      draw() {
        if(!ctx) return; ctx.fillStyle = 'rgba(139, 92, 246, 0.4)';
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
      }
    }
    const init = () => { particles = []; for (let i = 0; i < 60; i++) particles.push(new Particle()); }
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let a = 0; a < particles.length; a++) {
          for (let b = a; b < particles.length; b++) {
              let dx = particles[a].x - particles[b].x;
              let dy = particles[a].y - particles[b].y;
              let dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 120) {
                  ctx.strokeStyle = `rgba(139, 92, 246, ${0.15 - dist/1000})`;
                  ctx.lineWidth = 0.5;
                  ctx.beginPath(); ctx.moveTo(particles[a].x, particles[a].y); ctx.lineTo(particles[b].x, particles[b].y); ctx.stroke();
              }
          }
      }
      particles.forEach(p => { p.update(); p.draw(); });
      animationFrameId = requestAnimationFrame(animate);
    };
    init(); animate();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animationFrameId); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />;
};
export default ParticleBackground;