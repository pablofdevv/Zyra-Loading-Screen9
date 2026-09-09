/**
 * ==========================================================================
 *        MÓDULO DE TRANSICIONES Y REVEALS - ZYRA PORTAL (PREMIUM)
 * ==========================================================================
 */

class ZyraAnimations {
    constructor() {
        this.init();
    }

    init() {
        // Revelar el logo central
        const logo = document.querySelector('.portal-logo-wrapper');
        if (logo) {
            logo.style.opacity = '0';
            logo.style.transform = 'scale(0.85)';
            logo.style.transition = 'opacity 1.8s cubic-bezier(0.16, 1, 0.3, 1), transform 1.8s cubic-bezier(0.16, 1, 0.3, 1)';
            
            setTimeout(() => {
                logo.style.opacity = '1';
                logo.style.transform = 'scale(1)';
            }, 150);
        }
    }
}
window.ZyraAnimations = ZyraAnimations;
