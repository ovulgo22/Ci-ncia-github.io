/* ARQUIVO 6 de 8: modules/theme.js (Versão 6.0 - Symbiont) */
/* Módulo plugável para o Symbiont Engine. Gerencia o tema visual (light/dark). */

const ThemeModule = {
  // O estado do módulo é encapsulado
  isInitialized: false,
  toggleButton: null,
  docElement: null,
  
  /**
   * Ponto de entrada público, chamado pelo Symbiont Engine.
   * @param {SymbiontEngine} engine - A instância do motor principal.
   */
  init(engine) {
    if (this.isInitialized) return;

    const dom = engine.getDOM(); // Obtém referências do DOM a partir do motor
    this.toggleButton = dom.root.querySelector('#theme-toggle');
    this.docElement = document.documentElement;
    this.themeColorMeta = document.querySelector('meta[name="theme-color"]');

    if (!this.toggleButton) {
      console.warn('ThemeModule: Toggle button not found in rendered shell.');
      return;
    }
    
    this.toggleButton.addEventListener('click', () => this.toggleTheme());
    
    this.syncUI();
    this.isInitialized = true;
    console.log('ThemeModule Initialized.');
  },

  /**
   * Alterna entre o tema claro e escuro.
   */
  toggleTheme() {
    const currentTheme = this.getCurrentTheme();
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme);
  },
  
  /**
   * Aplica um tema específico.
   * @param {string} theme - O tema a ser aplicado ('light' ou 'dark').
   */
  applyTheme(theme) {
    this.docElement.className = theme === 'dark' ? 'theme-dark' : 'theme-light';
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {
      console.warn('LocalStorage not available.');
    }
    this.syncUI();
  },

  /**
   * Sincroniza elementos da UI que dependem do tema atual.
   */
  syncUI() {
    const theme = this.getCurrentTheme();
    const newLabel = theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro';
    this.toggleButton.setAttribute('aria-label', newLabel);
    this.updateThemeColor();
  },

  /**
   * Atualiza a meta tag 'theme-color' com base na variável CSS.
   */
  updateThemeColor() {
    if (!this.themeColorMeta) return;
    // Pequeno delay para garantir que o CSS foi aplicado após a troca de classe
    setTimeout(() => {
        const newColor = getComputedStyle(this.docElement).getPropertyValue('--color-background').trim();
        this.themeColorMeta.setAttribute('content', newColor);
    }, 50);
  },

  /**
   * Obtém o tema atual.
   * @returns {string} 'light' ou 'dark'.
   */
  getCurrentTheme() {
    return this.docElement.classList.contains('theme-light') ? 'light' : 'dark';
  }
};

export default ThemeModule;
