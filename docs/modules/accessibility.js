/* ARQUIVO 7 de 8: modules/accessibility.js (Versão 6.0 - Symbiont) */
/* Módulo de Acessibilidade: Trava de foco no menu móvel e aprimoramento do skip-link. */

const AccessibilityModule = {
  isInitialized: false,
  engine: null,
  dom: {},

  init(engine) {
    if (this.isInitialized) return;
    this.engine = engine;
    this.dom = engine.getDOM(); // Obtém referências do DOM a partir do motor

    // A inicialização agora acontece após a renderização do shell
    this.initSkipLink();
    this.initFocusTrap();

    this.isInitialized = true;
    console.log('AccessibilityModule Initialized.');
  },

  /**
   * Aprimora o comportamento do link "Pular para o Conteúdo".
   */
  initSkipLink() {
    const skipLink = this.dom.root.querySelector('.skip-link');
    if (!skipLink) return;

    skipLink.addEventListener('click', (event) => {
      event.preventDefault();
      const mainContent = this.dom.main; // Usa a referência do motor
      if (mainContent) {
        mainContent.setAttribute('tabindex', '-1');
        mainContent.focus({ preventScroll: true }); // Evita pulo brusco se já visível
        mainContent.addEventListener('blur', () => mainContent.removeAttribute('tabindex'), { once: true });
      }
    });
  },

  /**
   * Implementa a trava de foco (Focus Trap) para o menu de navegação móvel.
   */
  initFocusTrap() {
    const siteNav = this.dom.nav;
    const toggleButton = this.dom.root.querySelector('#mobile-nav-toggle');
    if (!siteNav || !toggleButton) return;

    document.addEventListener('keydown', (event) => {
      if (!siteNav.classList.contains('is-open')) return;

      if (event.key === 'Escape' || event.key === 'Esc') {
        // Fecha o menu com a tecla Escape e retorna o foco
        toggleButton.click(); // Simula o clique para fechar e gerenciar o estado
        toggleButton.focus();
      }

      if (event.key === 'Tab') {
        const focusableElements = Array.from(siteNav.querySelectorAll('a[href], button'));
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) { // Shift + Tab
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else { // Tab
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    });
  }
};

export default AccessibilityModule;
