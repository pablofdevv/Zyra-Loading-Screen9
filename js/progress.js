/**
 * ==========================================================================
 *        MÓDULO DE PROGRESO DE HIPERESPACIO - ZYRA PORTAL (PREMIUM)
 * ==========================================================================
 */

class ZyraProgress {
    constructor(config) {
        this.config = config || {};
        this.progressValText = document.getElementById('progress-val-text');
    }

    updateProgress(percentage) {
        const val = Math.min(Math.max(percentage, 0), 100);

        // Acelerar drásticamente el salto hiperespacial y estirar las partículas
        window.warpSpeedScale = 1.0 + (val / 100) * 12.0;

        // Actualizar porcentaje de carga
        if (this.progressValText) {
            this.progressValText.innerText = `${Math.round(val)}%`;
        }
    }
}
window.ZyraProgress = ZyraProgress;
