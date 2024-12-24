'use strict';

/**
 * Plot result from the beam analysis calculation into a graph
 */
class AnalysisPlotter {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
    }

    /**
     * Plot equation.
     *
     * @param {Object{beam : Beam, load : float, equation: Function}}  The equation data
     */
    plot(data, options) {
        const ctx = this.canvas.getContext('2d');
        new Chart(ctx, {
            type: options.type || 'line',
            data: {
                labels: data.x,
                datasets: [{
                    label: options.label || 'Analysis Result',
                    data: data.y,
                    borderColor: options.color || 'blue',
                    borderWidth: 2,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: { title: { display: true, text: options.xLabel || 'Position (x)' } },
                    y: { title: { display: true, text: options.yLabel || 'Value (y)' } }
                }
            }
        });
        // console.log('Plotting data : ', data);
    }
}