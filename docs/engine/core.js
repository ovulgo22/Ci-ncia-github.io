/* ARQUIVO 4 de 8: engine/core.js (Versão 6.0 - Symbiont) */
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
    this.renderer = null; // O renderizador será carregado dinamicamente.
    this.init();
  }

  /**
   * Ponto de entrada: inicia o processo de bootstrapping.
   */
  async init() {
    console.log(`Symbiont Engine v6.0 Initializing... | ${new Date().toLocaleTimeString()}`);
    try {
      this.manifest = await this.fetchJSON('/manifest.json');
      await this.loadRenderer();
      await this.initShell();
      this.setupRouter();
    } catch (error) {
      console.error('Symbiont Engine critical failure during initialization:', error);
      this.dom.root.innerHTML = '<p>Falha crítica ao carregar a aplicação.</p>';
    }
  }

  /**
   * Carrega o módulo do renderizador, uma dependência essencial do núcleo.
   */
  async loadRenderer() {
    const rendererPath = this.manifest.engine.renderer;
    const { Renderer } = await import(rendererPath);
    this.renderer = new Renderer(this.manifest.templates, this.cache.templates);
  }

  /**
   * Carrega o template do shell, renderiza a estrutura base e inicializa os módulos principais.
   */
  async initShell() {
    const shellTemplateContent = await this.renderer.fetchTemplate('Shell');
    this.dom.root.innerHTML = '';
    this.dom.root.appendChild(shellTemplateContent);
    // Renova as referências do DOM para os elementos do shell
    this.dom.header = this.dom.root.querySelector('.site-header');
    this.dom.nav = this.dom.root.querySelector('.site-nav');
    this.dom.main = this.dom.root.querySelector('.main-content');
    this.dom.footer = this.dom.root.querySelector('.site-footer');
    this.loadCoreModules();
  }

  /**
   * Carrega módulos JS essenciais que funcionam em toda a aplicação.
   */
  loadCoreModules() {
    const coreModules = ['theme', 'search', 'accessibility']; // Definido no manifesto
    coreModules.forEach(async (moduleName) => {
      try {
        const modulePath = this.manifest.modules[moduleName];
        if (!modulePath) return;
        const { default: Module } = await import(modulePath);
        Module.init(this); // Passa a instância do motor para o módulo, permitindo comunicação.
      } catch (error) {
        console.warn(`Failed to load core module: ${moduleName}`, error);
      }
    });
  }

  /**
   * Configura o roteador para reagir a mudanças de hash na URL.
   */
  setupRouter() {
    window.addEventListener('hashchange', () => this.handleRouteChange());
    this.handleRouteChange(); // Lida com a rota inicial
  }

  /**
   * Orquestra o carregamento de recursos e a renderização de uma nova página.
   */
  async handleRouteChange() {
    const routeId = window.location.hash.slice(1) || this.manifest.defaultRoute;
    const route = this.manifest.routes[routeId];
    if (!route) {
      console.warn(`Route not found: ${routeId}. Redirecting to default.`);
      window.location.hash = this.manifest.defaultRoute;
      return;
    }

    try {
      // Carrega todos os recursos da rota em paralelo
      const [content] = await Promise.all([
        this.loadContent(route.content),
        this.loadStyles(route.styles),
        this.loadRouteModules(route.modules),
      ]);
      
      // Passa os dados para o renderizador
      await this.renderer.renderPage(this.dom.main, content);
      document.title = `${route.title} | ${this.manifest.appName}`;
      
      // Notifica os módulos que a página foi renderizada
      window.dispatchEvent(new CustomEvent('symbiont:page-rendered', { detail: { routeId, content } }));
      
    } catch (error) {
      console.error(`Failed to render route: ${routeId}`, error);
      this.dom.main.innerHTML = `<p>Erro ao carregar o conteúdo da página.</p>`;
    }
  }
  
  /**
   * Busca e armazena em cache o conteúdo JSON de uma página.
   */
  async loadContent(contentPath) {
    if (!this.cache.content.has(contentPath)) {
      const contentData = await this.fetchJSON(contentPath);
      this.cache.content.set(contentPath, contentData);
    }
    return this.cache.content.get(contentPath);
  }

  /**
   * Carrega um array de arquivos CSS sob demanda, evitando duplicatas.
   */
  loadStyles(stylePaths = []) {
    const promises = stylePaths.map(path => {
      if (this.cache.styles.has(path)) return Promise.resolve();
      return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = path;
        link.onload = () => {
          this.cache.styles.add(path);
          resolve();
        };
        link.onerror = reject;
        this.dom.head.appendChild(link);
      });
    });
    return Promise.all(promises);
  }

  /**
   * Carrega módulos JS específicos de uma rota.
   */
  loadRouteModules(moduleNames = []) {
      const promises = moduleNames.map(async name => {
          const path = this.manifest.modules[name];
          if (!path) return;
          const { default: Module } = await import(path);
          Module.init(this);
      });
      return Promise.all(promises);
  }

  /**
   * Função utilitária para buscar e parsear JSON.
   */
  async fetchJSON(path) {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status} for ${path}`);
    return response.json();
  }
}

// Instancia o motor para iniciar a aplicação.
new SymbiontEngine();
