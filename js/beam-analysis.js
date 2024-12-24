'use strict';

/** ============================ Beam Analysis Data Type ============================ */

/**
 * Beam material specification.
 *
 * @param {String} name         Material name
 * @param {Object} properties   Material properties {EI : 0, GA : 0, ....}
 */
class Material {
    constructor(name, properties) {
        this.name = name;
        this.properties = properties;
    }
}

/**
 *
 * @param {Number} primarySpan          Beam primary span length
 * @param {Number} secondarySpan        Beam secondary span length
 * @param {Material} material           Beam material object
 */
class Beam {
    constructor(primarySpan, secondarySpan, material) {
        this.primarySpan = primarySpan;
        this.secondarySpan = secondarySpan;
        this.material = material;
    }
}

/** ============================ Beam Analysis Class ============================ */

class BeamAnalysis {
    constructor() {
        this.options = {
            condition: 'simply-supported'
        };

        this.analyzer = {
            'simply-supported': new BeamAnalysis.analyzer.simplySupported(),
            'two-span-unequal': new BeamAnalysis.analyzer.twoSpanUnequal()
        };
    }
    /**
     *
     * @param {Beam} beam
     * @param {Number} load
     */
    getDeflection(beam, load, condition) {
        var analyzer = this.analyzer[condition];

        if (analyzer) {
            return {
                beam: beam,
                load: load,
                equation: analyzer.getDeflectionEquation(beam, load)
            };
        } else {
            throw new Error('Invalid condition');
        }
    }
    getBendingMoment(beam, load, condition) {
        var analyzer = this.analyzer[condition];

        if (analyzer) {
            return {
                beam: beam,
                load: load,
                equation: analyzer.getBendingMomentEquation(beam, load)
            };
        } else {
            throw new Error('Invalid condition');
        }
    }
    getShearForce(beam, load, condition) {
        var analyzer = this.analyzer[condition];

        if (analyzer) {
            return {
                beam: beam,
                load: load,
                equation: analyzer.getShearForceEquation(beam, load)
            };
        } else {
            throw new Error('Invalid condition');
        }
    }
}




/** ============================ Beam Analysis Analyzer ============================ */

/**
 * Available analyzers for different conditions
 */
BeamAnalysis.analyzer = {};

/**
 * Calculate deflection, bending stress and shear stress for a simply supported beam
 *
 * @param {Beam}   beam   The beam object
 * @param {Number}  load    The applied load
 */
BeamAnalysis.analyzer.simplySupported = class {
    // constructor(beam, load) {
    //     this.beam = beam;
    //     this.load = load;
    // }
    getDeflectionEquation(beam, load) {
        const { primarySpan } = beam
        const EI = beam.material.properties.EI
        return function (x) {
            const L = primarySpan
            const w = load
            let y = 0

            if (x >= 0 && x <= L) {
                y = -((w * x) / (24 * EI)) * (L ** 3 - 2 * L * x ** 2 + x ** 3) * 1000
            }

            return {
                x: x,
                y: y
            };
        };
    }
    getBendingMomentEquation(beam, load) {
        const { primarySpan } = beam
        return function (x) {
            const L = primarySpan
            const w = load
            let M = 0

            if (x >= 0 && x <= L) {
                M = -((w * x) / 2) * (L - x)
            }
            return {
                x: x,
                y: M
            };
        };
    }
    getShearForceEquation(beam, load) {
        const { primarySpan } = beam
        return function (x) {
            const L = primarySpan
            const w = load
            let V = 0

            if (x >= 0 && x <= L) {
                V = w * ((L / 2) - x)
            }
            return {
                x: x,
                y: V
            };
        };
    }
};


/**
 * Calculate deflection, bending stress and shear stress for a beam with two spans of equal condition
 *
 * @param {Beam}   beam   The beam object
 * @param {Number}  load    The applied load
 */
BeamAnalysis.analyzer.twoSpanUnequal = class {
    constructor(beam, load) {
        this.beam = beam;
        this.load = load;
    }
    getDeflectionEquation(beam, load) {
        const { L1, L2 } = beam
        const { w1, w2, R1, R2, R3 } = load
        return function (x) {
            let V = 0
            if (x === 0) { 
                V = R1
            } else if (x > 0 && x <= L1) {
                V = R1 - w1 * x
            } else if (x > L1 && x <= L1 + L2) {
                const x2 = x - L1
                V = R1 + R2 - w1 * L1 - w2 * x2
            } else if (x > L1 + L2) {
                V = R1 + R2 + R3 - w1 * L1 - w2 * L2
            }
            return {
                x: x,
                y: V.toFixed(2),
            };
        };
    }
    getBendingMomentEquation(beam, load) {
        const { L1, L2 } = beam
        const { w1, w2, R1, R2, R3 } = load
        return function (x) {
            let M = 0
            if (x === 0) {
                M = 0
            } else if (x > 0 && x <= L1) {
                M = R1 * x - (w1 * Math.pow(x, 2)) / 2
            } else if (x > L1 && x <= L1 + L2) {
                const x2 = x - L1
                M = R1 * x + R2 * x2 - (w1 * Math.pow(L1, 2)) / 2 - (w2 * Math.pow(x2, 2)) / 2
            } else if (x > L1 + L2) {
                M = 0
            }
            return {
                x: x,
                y: M.toFixed(2),
            };
        };
    }
    getShearForceEquation(beam, load) {
        const { L1, L2 } = beam
        const { w1, w2, R1, R2, R3 } = load
        return function (x) {
            let V = 0
            if (x === 0) {
                V = R1
            } else if (x > 0 && x <= L1) {
                V = R1 - (w1 * x)
            } else if (x > L1 && x <= L1 + L2) {
                V = R1 + R2 - (w1 * L1) - (w2 * (x - L1))
            } else if (x > L1 + L2) {
                V = R1 + R2 + R3 - (w1 * L1) - (w2 * L2)
            }
            return {
                x: x,
                y: V.toFixed(2),
            };
        };
    }
};
