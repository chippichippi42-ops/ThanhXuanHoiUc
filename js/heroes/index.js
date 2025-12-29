(function() {
    const HEROES = {
        vanheo: window.VanHeo,
        zephy: window.Zephy,
        lalo: window.Lalo,
        nemo: window.Nemo,
        balametany: window.Balametany
    };

    // Make HEROES available globally
    if (typeof window !== 'undefined') {
        window.HEROES = HEROES;
    }
})();
