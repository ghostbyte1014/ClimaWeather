import React, { useEffect, useRef } from "react";

/**
 * Enhanced Weather Atmosphere:
 * Renders ambient glowing light orbs, drifting clouds, falling rain splashes,
 * floating snow, twinkling night stars, and animated sun rays.
 */
export default function WeatherAtmosphere({ condition, isNight, reducedMotion }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    // Particle pool
    const particles = [];
    const isCloudy = condition === "cloudy" || condition === "partly-cloudy";
    const count = condition === "rain" || condition === "storm" ? 75 : condition === "snow" ? 50 : isCloudy ? 18 : 35;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        len: Math.random() * 16 + 8,
        speedY: Math.random() * 5 + 4,
        speedX: Math.random() * 0.8 - 0.4,
        radius: isCloudy ? Math.random() * 120 + 60 : Math.random() * 2.5 + 1,
        alpha: isCloudy ? Math.random() * 0.1 + 0.05 : Math.random() * 0.7 + 0.3,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
      });
    }

    let lightningTimer = 0;
    let shootingStar = null;

    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (condition === "rain" || condition === "drizzle" || condition === "storm") {
        // Falling Raindrops
        ctx.strokeStyle = "rgba(147, 197, 253, 0.45)";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        for (const p of particles) {
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.speedX * 2, p.y + p.len);
          p.y += p.speedY * (condition === "storm" ? 1.6 : 1);
          p.x += p.speedX;
          if (p.y > canvas.height) {
            p.y = -10;
            p.x = Math.random() * canvas.width;
          }
        }
        ctx.stroke();

        // Storm Lightning Flash
        if (condition === "storm") {
          lightningTimer += 1;
          if (lightningTimer > 160 && Math.random() > 0.94) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            lightningTimer = 0;
          }
        }
      } else if (condition === "snow") {
        // Floating Snowflakes
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        for (const p of particles) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
          p.y += p.speedY * 0.35;
          p.x += Math.sin(p.y * 0.02) * 0.6;
          if (p.y > canvas.height) {
            p.y = -5;
            p.x = Math.random() * canvas.width;
          }
        }
      } else if (isCloudy) {
        // Fog/Mist Particles
        ctx.fillStyle = "rgba(255, 255, 255, 1)";
        for (const p of particles) {
          ctx.beginPath();
          ctx.globalAlpha = p.alpha;
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
          p.x += p.speedX * 0.4;
          if (p.x > canvas.width + p.radius) p.x = -p.radius;
          if (p.x < -p.radius) p.x = canvas.width + p.radius;
        }
        ctx.globalAlpha = 1.0;
      } else if (isNight || condition === "clear-night") {
        // Twinkling Stars
        for (const p of particles) {
          p.alpha += p.twinkleSpeed;
          if (p.alpha > 0.95 || p.alpha < 0.15) p.twinkleSpeed = -p.twinkleSpeed;
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.abs(p.alpha)})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 0.9, 0, Math.PI * 2);
          ctx.fill();
        }

        // Shooting Star
        if (!shootingStar && Math.random() > 0.997) {
          shootingStar = {
            x: Math.random() * canvas.width,
            y: 0,
            len: Math.random() * 60 + 30,
            speed: Math.random() * 15 + 10,
            angle: Math.PI / 4 + (Math.random() * 0.2 - 0.1)
          };
        }
        if (shootingStar) {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(shootingStar.x, shootingStar.y);
          ctx.lineTo(shootingStar.x - Math.cos(shootingStar.angle) * shootingStar.len, shootingStar.y - Math.sin(shootingStar.angle) * shootingStar.len);
          ctx.stroke();
          
          shootingStar.x += Math.cos(shootingStar.angle) * shootingStar.speed;
          shootingStar.y += Math.sin(shootingStar.angle) * shootingStar.speed;
          
          if (shootingStar.y > canvas.height + 100 || shootingStar.x > canvas.width + 100) {
            shootingStar = null;
          }
        }
      }

      animId = requestAnimationFrame(render);
    }

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [condition, isNight, reducedMotion]);

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* Ambient Glowing Light Orbs for Rich Glassmorphism Aura */}
      <div
        className="absolute -top-32 left-1/4 h-96 w-96 rounded-full blur-3xl opacity-30 animate-pulse"
        style={{
          background: condition === "clear-day"
            ? "radial-gradient(circle, #F2994A 0%, transparent 70%)"
            : condition === "storm"
            ? "radial-gradient(circle, #7C3AED 0%, transparent 70%)"
            : "radial-gradient(circle, #3B82F6 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute top-1/2 -right-20 h-96 w-96 rounded-full blur-3xl opacity-20"
        style={{ background: "radial-gradient(circle, #0EA5E9 0%, transparent 70%)" }}
      />
      <canvas ref={canvasRef} className="h-full w-full opacity-70" />
    </div>
  );
}
