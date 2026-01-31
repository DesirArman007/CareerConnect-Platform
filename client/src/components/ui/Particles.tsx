import React, { useEffect, useRef } from 'react';

export const Particles: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let particles: {
            x: number;
            y: number;
            size: number;
            speedX: number;
            speedY: number;
            opacity: number;
        }[] = [];

        const resize = () => {
            canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth;
            canvas.height = canvas.parentElement?.offsetHeight || window.innerHeight;
        };

        const createParticles = () => {
            const count = 100; // Denser dust
            particles = [];
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * canvas.width * 0.6, // Bias towards left
                    y: canvas.height - (Math.random() * canvas.height * 0.8), // Bias towards bottom
                    size: Math.random() * 2 + 0.5,
                    speedX: Math.random() * 0.8 + 0.1, // Drift right
                    speedY: Math.random() * -0.8 - 0.2, // Drift up
                    opacity: Math.random() * 0.5 + 0.1,
                });
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((p) => {
                p.x += p.speedX;
                p.y += p.speedY;

                // Reset if out of bounds - recycle to bottom-left area
                if (p.y < 0 || p.x > canvas.width) {
                    p.x = Math.random() * canvas.width * 0.5; // Reset to left
                    p.y = canvas.height + 10; // Reset to bottom
                    p.opacity = Math.random() * 0.5 + 0.1;
                }

                // Warm Orange/Gold Color
                ctx.fillStyle = `rgba(255, 165, 0, ${p.opacity})`;
                ctx.shadowBlur = 4;
                ctx.shadowColor = "orange";

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0; // Reset for performance
            });

            requestAnimationFrame(animate);
        };

        resize();
        createParticles();
        animate();

        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none opacity-60"
        />
    );
};
