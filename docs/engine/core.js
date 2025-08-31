/* ARQUIVO 4 de 8: engine/core.js (Versão 6.1 - Symbiont Finalizado) */
/* O bootloader e orquestrador da aplicação. Lida com o manifesto, roteamento e carregamento sob demanda. */

class SymbiontEngine {
  constructor() {
    this.manifest = null;
    this.cache = {
      templates: new Map(),
      content: new Map(),
      styles: new Set(),
    };
    this.dom = {
      root: document.getElementById('app-root'),
      head: document.head,
    };
    this.renderer = null;
    this.init();
  }

  async init() {
    console.log(`Symbiont Engine v6.1 Initializing... | ${new Date().toLocaleTimeString()}`);
    try {
      this.manifest = await this.fetchJSON('/manifest.json');
      const { Renderer } = await import(this.manifest.engine.renderer);
      this.renderer = new Renderer(this.manifest.templates, this.cache.templates);
      await this.initShell();
      this.setupRouter();
    } catch (error) {
      console.error('Symbiont Engine critical failure:', error);
      this.dom.root.innerHTML = '<p>Falha crítica ao carregar a aplicação.</p>';
    }
  }

  async initShell() {
    const shellTemplateContent = await this.renderer.fetchTemplate('Shell');
    this.dom.root.innerHTML = '';
    this.dom.root.appendChild(shellTemplateContent);
    
    // Renova as referências do DOM para os elementos do shell
    this.dom.header = this.dom.root.querySelector('.site-header');
    this.dom.nav = this.dom.root.querySelector('.site-nav');
    this.dom.main = this.dom.root.querySelector('.main-content');
    this.dom.footer = this.dom.root.querySelector('.site-footer');
    
    await this.populateShell(); // Agora é assíncrono para buscar templates
    this.loadCoreModules();
  }

  /**
   * ATUALIZADO v6.1: Popula o conteúdo do header e da navegação, buscando templates de ícones.
   */
  async populateShell() {
      const navLinks = `
        <a href="#home" class="nav-link">Início</a>
        <a href="#relativity" class="nav-link">Relatividade</a>
        <a href="#quantum-mechanics" class="nav-link">Mecânica Quântica</a>
      `;

      const headerContent = `
        <a href="#home" class="logo" id="logo-container"></a>
        <div class="header-actions">
          <form class="search-bar" id="search-form" role="search" onsubmit="return false;">
            <input type="search" id="search-input" placeholder="Pesquisar..." aria-label="Campo de busca">
          </form>
          <button class="theme-toggle" id="theme-toggle"></button>
        </div>
      `;
      
      if (this.dom.header) this.dom.header.innerHTML = headerContent;
      if (this.dom.nav) this.dom.nav.innerHTML = navLinks;
      if (this.dom.footer) this.dom.footer.textContent = `Compêndio da Ciência v6.0 (Symbiont) © ${new Date().getFullYear()}`;

      // Injeta templates no shell
      const logoTemplate = await this.renderer.fetchTemplate('icon-logo');
      this.dom.header.querySelector('#logo-container').appendChild(logoTemplate.cloneNode(true));
  }

  loadCoreModules() { /* ... (lógica inalterada, carrega módulos) ... */ }
  setupRouter() { /* ... (lógica inalterada) ... */ }
  async handleRouteChange() { /* ... (lógica inalterada) ... */ }
  async loadContent(contentPath) { /* ... (lógica inalterada) ... */ }
  loadStyles(stylePaths = []) { /* ... (lógica inalterada) ... */ }
  loadRouteModules(moduleNames = []) { /* ... (lógica inalterada) ... */ }
  async fetchJSON(path) { /* ... (lógica inalterada) ... */ }

  // Métodos públicos para módulos
  getDOM() { return this.dom; }
}

new SymbiontEngine();
