/**
 * ==========================================================================
 *        MÓDULO DE INTERFAZ Y RENDERIZADO WARP 3D - ZYRA PORTAL (PREMIUM)
 * ==========================================================================
 */

class ZyraUI {
    constructor(config) {
        this.config = config || {};
        
        // Elementos DOM
        this.logoContainer = document.getElementById('logo-container');
        this.serverClaim = document.getElementById('server-claim');
        this.socialsContainer = document.getElementById('social-links-grid');
        this.bgVideo = document.getElementById('bg-video');
        
        // Canvas del Túnel de Estrellas Warp 3D
        this.warpCanvas = document.getElementById('warp-canvas');
        
        // Parámetros de Hiperespacio
        window.warpSpeedScale = 1.0; // Controlado dinámicamente por progress.js
        this.centerX = window.innerWidth / 2;
        this.centerY = window.innerHeight / 2;
        this.targetCenterX = this.centerX;
        this.targetCenterY = this.centerY;
        
        this.init();
    }

    init() {
        this.applyConfigToggles();
        this.renderBranding();
        this.renderSocials();
        this.renderBackgroundVideo();
        this.applyDynamicStyles();
        
        // Iniciar Animación de Salto de Hiperespacio
        this.initWarpTunnel();
        this.bindMouseEvents();
    }

    applyConfigToggles() {
        const comps = this.config.components;
        if (!comps) return;

        // Ocultar música si está desactivada
        const musicCard = document.getElementById('music-card-wrapper');
        if (musicCard && !comps.enableMusic) {
            musicCard.classList.add('hidden');
        }

        // Ocultar redes si está desactivado
        const socialsPanel = document.getElementById('socials-panel');
        if (socialsPanel && !comps.enableSocials) {
            socialsPanel.classList.add('hidden');
        }
    }

    renderBranding() {
        if (!this.logoContainer) return;
        const brand = this.config.branding;

        if (brand.logoUrl) {
            this.logoContainer.innerHTML = `<img src="${brand.logoUrl}" alt="${brand.serverName}">`;
        } else {
            this.logoContainer.innerHTML = `<h1>${brand.serverName}</h1>`;
        }

        if (this.serverClaim) {
            this.serverClaim.innerText = brand.claim;
        }
    }

    renderSocials() {
        if (!this.socialsContainer || !this.config.components.enableSocials) return;
        const socialsList = this.config.socials || [];
        
        let html = "";
        socialsList.forEach(social => {
            html += `
                <a href="${social.url}" target="_blank" class="social-btn">
                    <span>${social.name}</span>
                </a>`;
        });
        
        this.socialsContainer.innerHTML = html;
    }

    renderBackgroundVideo() {
        if (!this.bgVideo) return;
        const bg = this.config.background;

        if (this.config.components.enableBackgroundVideo && bg.videoUrl) {
            this.bgVideo.src = bg.videoUrl;
            this.bgVideo.style.opacity = bg.videoOpacity;
            this.bgVideo.classList.remove('hidden');
            this.bgVideo.play().catch(() => {});
        } else {
            this.bgVideo.classList.add('hidden');
        }
    }

    bindMouseEvents() {
        window.addEventListener('mousemove', (e) => {
            // Desviar el centro del túnel ligeramente según la posición del cursor
            const dx = e.clientX - window.innerWidth / 2;
            const dy = e.clientY - window.innerHeight / 2;
            this.targetCenterX = window.innerWidth / 2 + dx * 0.18;
            this.targetCenterY = window.innerHeight / 2 + dy * 0.18;
        });

        window.addEventListener('mouseleave', () => {
            this.targetCenterX = window.innerWidth / 2;
            this.targetCenterY = window.innerHeight / 2;
        });
    }

    /* ==========================================================================
       SIMULADOR DEL TÚNEL DE HIPERESPACIO 3D (WARP STARFIELD)
       ========================================================================== */
    initWarpTunnel() {
        if (!this.warpCanvas) return;
        if (!this.config.components.enableParticles) {
            this.warpCanvas.classList.add('hidden');
            return;
        }
        
        const canvas = this.warpCanvas;
        const ctx = canvas.getContext('2d');
        const count = this.config.background.particleCount || 200;
        const baseSpeed = this.config.background.particleSpeed || 1.5;
        const maxDepth = 1000;
        const stars = [];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            this.centerX = canvas.width / 2;
            this.centerY = canvas.height / 2;
        };
        window.addEventListener('resize', resize);
        resize();

        class Star {
            constructor() {
                this.reset();
                // Repartir la profundidad inicial para que no salgan todas a la vez
                this.z = Math.random() * maxDepth;
            }

            reset() {
                // Posicionar aleatoriamente en un círculo alrededor del túnel
                this.x = (Math.random() - 0.5) * window.innerWidth * 1.5;
                this.y = (Math.random() - 0.5) * window.innerHeight * 1.5;
                this.z = maxDepth;
            }

            update(speed) {
                this.z -= speed;
                if (this.z <= 0) {
                    this.reset();
                }
            }

            draw(centerX, centerY) {
                const scale = 250; // Factor de perspectiva 3D
                
                // Coordenadas actuales proyectadas a 2D
                const px = centerX + (this.x / this.z) * scale;
                const py = centerY + (this.y / this.z) * scale;

                if (px < 0 || px > window.innerWidth || py < 0 || py > window.innerHeight) {
                    return;
                }

                // Calcular opacidad basada en cercanía (más cerca del espectador = más brillante)
                const opacity = Math.min((1 - this.z / maxDepth) * 1.2, 1.0);

                // Estiramiento: Calcular la posición anterior para dibujar una estela láser
                // A mayor velocidad, la estela es más larga
                const prevZ = this.z + 18 * window.warpSpeedScale;
                const prevX = centerX + (this.x / prevZ) * scale;
                const prevY = centerY + (this.y / prevZ) * scale;

                // Dibujar línea láser / estela de luz
                ctx.strokeStyle = `rgba(223, 186, 95, ${opacity * 0.75})`;
                ctx.lineWidth = 1.0 + (1 - this.z / maxDepth) * 1.2;
                ctx.beginPath();
                ctx.moveTo(prevX, prevY);
                ctx.lineTo(px, py);
                ctx.stroke();
            }
        }

        const init = () => {
            for (let i = 0; i < count; i++) {
                stars.push(new Star());
            }
        };

        const renderLoop = () => {
            // Limpieza con un ligero rastro de barrido para potenciar el blur
            ctx.fillStyle = 'rgba(2, 2, 2, 0.22)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Interpolación elástica para suavizar el desplazamiento de cámara con ratón
            this.centerX += (this.targetCenterX - this.centerX) * 0.08;
            this.centerY += (this.targetCenterY - this.centerY) * 0.08;

            // Velocidad actual del túnel escalada según el porcentaje de carga
            const speed = baseSpeed * window.warpSpeedScale;

            stars.forEach(star => {
                star.update(speed);
                star.draw(this.centerX, this.centerY);
            });

            requestAnimationFrame(renderLoop);
        };

        init();
        renderLoop();
    }

    applyDynamicStyles() {
        const theme = this.config.theme;
        const typo = this.config.typography;
        const root = document.documentElement;

        if (theme.colorPrimary) root.style.setProperty('--bg-pure-black', theme.colorPrimary);
        if (theme.colorSecondary) root.style.setProperty('--bg-panel-dark', theme.colorSecondary);
        if (theme.colorAccent) {
            root.style.setProperty('--accent-pure-white', theme.colorAccent);
            root.style.setProperty('--accent-glow', `rgba(${this.hexToRgb(theme.colorAccent)}, 0.22)`);
        }
        if (theme.colorTextPrimary) root.style.setProperty('--text-primary', theme.colorTextPrimary);
        if (theme.colorTextSecondary) root.style.setProperty('--text-secondary', theme.colorTextSecondary);
        if (theme.colorTextMuted) root.style.setProperty('--text-muted', theme.colorTextMuted);
        if (theme.colorBorder) root.style.setProperty('--border-cinematic', `1px solid ${theme.colorBorder}`);
        if (theme.colorBorderActive) root.style.setProperty('--border-cinematic-active', `1px solid ${theme.colorBorderActive}`);
        
        if (typo.fontFamily) root.style.setProperty('--font-body', typo.fontFamily);
        if (typo.fontSizeBase) root.style.setProperty('--font-size-base', typo.fontSizeBase);
    }

    hexToRgb(hex) {
        let c;
        if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
            c = hex.substring(1).split('');
            if (c.length == 3) {
                c = [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c = '0x' + c.join('');
            return [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',');
        }
        return '223,186,95';
    }
}
window.ZyraUI = ZyraUI;
