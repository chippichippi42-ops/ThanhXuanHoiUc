import './vanheo.js';
import './zephy.js';
import './lalo.js';
import './nemo.js';
import './balametany.js';

const HEROES = {
    vanheo: window.VanHeo,
    zephy: window.Zephy,
    lalo: window.Lalo,
    nemo: window.Nemo,
    balametany: window.Balametany
};

export { HEROES };

// Make HEROES available globally
if (typeof window !== 'undefined') {
    window.HEROES = HEROES;
}
