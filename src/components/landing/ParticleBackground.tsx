import React, { useEffect, useRef } from "react";

interface ParticleBackgroundProps {
  isDark: boolean;
}

const APP_COLORS = [
  { dark: "rgba(16, 185, 129, 0.7)", light: "rgba(16, 185, 129, 0.6)" },
  { dark: "rgba(59, 130, 246, 0.7)", light: "rgba(59, 130, 246, 0.6)" },
  { dark: "rgba(139, 92, 246, 0.7)", light: "rgba(139, 92, 246, 0.6)" },
  { dark: "rgba(124, 58, 237, 0.7)", light: "rgba(124, 58, 237, 0.6)" },
  { dark: "rgba(236, 72, 153, 0.7)", light: "rgba(236, 72, 153, 0.6)" },
  { dark: "rgba(245, 158, 11, 0.7)", light: "rgba(245, 158, 11, 0.6)" },
  { dark: "rgba(239, 68, 68, 0.7)", light: "rgba(239, 68, 68, 0.6)" },
].map((c) => {
  const parse = (str: string) => {
    const match = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
    return match
      ? {
          r: parseInt(match[1]),
          g: parseInt(match[2]),
          b: parseInt(match[3]),
          a: parseFloat(match[4]),
        }
      : { r: 0, g: 0, b: 0, a: 1 };
  };
  return {
    dark: parse(c.dark),
    light: parse(c.light),
  };
});

class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  width: number;
  height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.x = Math.random() * width;
    this.y = Math.random() * height;

    this.vx = (Math.random() * 1.2 - 0.6) * 0.6;
    this.vy = (Math.random() * 1.2 - 0.6) * 0.6;
    this.radius = Math.random() * 1.5 + 0.5;
  }

  updateDimensions(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  update(
    mouseX: number,
    mouseY: number,
    isMouseOn: boolean,
    timeFactor: number,
  ) {
    const scale = 0.005;
    const strength = 0.12;

    let fx = Math.sin(this.y * scale + timeFactor) * strength;
    let fy = Math.cos(this.x * scale + timeFactor) * strength;

    if (isMouseOn) {
      const dx = this.x - mouseX;
      const dy = this.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 120 && dist > 0) {
        const force = 15 / Math.max(dist, 1);

        fx += (dx / dist) * force;
        fy += (dy / dist) * force;
      }
    }

    this.vx += fx;
    this.vy += fy;

    this.vx *= 0.94;
    this.vy *= 0.94;

    this.x += this.vx;
    this.y += this.vy;

    if (this.x > this.width) this.x = 0;
    else if (this.x < 0) this.x = this.width;

    if (this.y > this.height) this.y = 0;
    else if (this.y < 0) this.y = this.height;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

    ctx.fill();
  }
}

export const ParticleBackground: React.FC<ParticleBackgroundProps> = ({
  isDark,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, isOn: false });
  const animationFrameRef = useRef<number | undefined>(undefined);

  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();

      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      ctx.scale(dpr, dpr);

      const logicalWidth = rect.width;
      const logicalHeight = rect.height;

      if (particlesRef.current.length === 0) {
        const particleCount = window.innerWidth < 768 ? 800 : 1500;
        particlesRef.current = Array.from(
          { length: particleCount },
          () => new Particle(logicalWidth, logicalHeight),
        );
      } else {
        particlesRef.current.forEach((p) =>
          p.updateDimensions(logicalWidth, logicalHeight),
        );
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.isOn = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.isOn = false;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    const animate = () => {
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);

      ctx.fillStyle = isDark ? "#09090b" : "#ffffff";
      ctx.fillRect(0, 0, width, height);

      timeRef.current += 0.002;

      const scaledTime = timeRef.current * 0.4;

      const currentIndex = Math.floor(scaledTime) % APP_COLORS.length;
      const nextIndex = (currentIndex + 1) % APP_COLORS.length;
      const transition = scaledTime % 1;

      const currentSet = isDark
        ? APP_COLORS[currentIndex].dark
        : APP_COLORS[currentIndex].light;
      const nextSet = isDark
        ? APP_COLORS[nextIndex].dark
        : APP_COLORS[nextIndex].light;

      const r = Math.round(
        currentSet.r + (nextSet.r - currentSet.r) * transition,
      );
      const g = Math.round(
        currentSet.g + (nextSet.g - currentSet.g) * transition,
      );
      const b = Math.round(
        currentSet.b + (nextSet.b - currentSet.b) * transition,
      );
      const a = currentSet.a + (nextSet.a - currentSet.a) * transition;

      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;

      particlesRef.current.forEach((particle) => {
        particle.update(
          mouseRef.current.x,
          mouseRef.current.y,
          mouseRef.current.isOn,
          timeRef.current,
        );
        particle.draw(ctx);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", updateSize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute pt-2 px-6 rounded-lg inset-0 w-full h-full"
      style={{ background: "transparent" }}
    />
  );
};

export default ParticleBackground;
