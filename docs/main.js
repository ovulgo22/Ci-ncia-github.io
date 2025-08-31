/* ARQUIVO 3 de 7: main.js (Versão 4.0 - Nébula) */
/* Orquestrador da UI: hidrata templates, gerencia interatividade e estado de navegação. */

document.addEventListener('DOMContentLoaded', () => {

  'use strict';

  /**
   * NOVIDADE v4.0: Módulo de Hidratação da UI
   * Responsável por popular elementos da UI a partir dos <template> centralizados.
   * Esta é a primeira função a ser executada para garantir que a UI esteja completa.
   */
  const initTemplates = () => {
    const templates = document.getElementById('app-templates');
    if (!templates) return;

    /**
     * Clona o conteúdo de um <template> e o anexa a um alvo.
     * @param {string} templateId - O ID do <template> a ser usado.
     * @param {string} targetSelector - O seletor do elemento onde o conteúdo será inserido.
     */
    const stampTemplate = (templateId, targetSelector) => {
      const template = document.getElementById(templateId);
      const target = document.querySelector(targetSelector);
      if (template && target) {
        const content = template.content.cloneNode(true);
        target.appendChild(content);
      }
    };

    stampTemplate('icon-logo', '#logo-container');
    stampTemplate('icon-moon', '#theme-toggle');
    stampTemplate('icon-sun', '#theme-toggle');
    stampTemplate('icon-menu', '.mobile-nav-toggle');
  };


  /**
   * Módulo: Navegação Móvel
   * (Inalterado na lógica, mas agora depende da hidratação do ícone)
   */
  const initMobileMenu = () => {
    const toggleButton = document.querySelector('.mobile-nav-toggle');
    const siteNav = document.querySelector('.site-nav');
    if (!toggleButton || !siteNav) return;

    toggleButton.addEventListener('click', () => {
      siteNav.classList.toggle('is-open');
      const isExpanded = siteNav.classList.contains('is-open');
      toggleButton.setAttribute('aria-expanded', isExpanded);
    });
  };

  /**
   * Módulo: Geração da Tabela de Conteúdos (TOC)
   * (Refinado para só executar se houver títulos suficientes)
   */
  const generateTOC = () => {
    const tocList = document.querySelector('#toc-list');
    const tocTemplate = document.querySelector('#toc-item-template');
    const headings = document.querySelectorAll('.main-content article h2[id]');

    if (!tocList || !tocTemplate || headings.length < 2) {
        // Esconde o TOC se houver menos de 2 seções para listar
        const tocContainer = document.querySelector('.page-toc');
        if(tocContainer) tocContainer.hidden = true;
        return;
    }

    tocList.innerHTML = '';
    headings.forEach(heading => {
      const templateContent = tocTemplate.content.cloneNode(true);
      const link = templateContent.querySelector('a');
      link.href = `#${heading.id}`;
      link.textContent = heading.textContent;
      tocList.appendChild(templateContent);
    });
  };

  /**
   * Módulo: Scroll Spy Hierárquico
   * Destaca o link ativo na TOC e na navegação principal, incluindo itens pais.
   */
  const initScrollSpy = () => {
    const headings = Array.from(document.querySelectorAll('.main-content article h2[id]'));
    if (headings.length === 0) return;

    const observerOptions = {
      rootMargin: '0px 0px -50% 0px', // Limiar de ativação ajustado
      threshold: 1.0
    };

    const observerCallback = (entries) => {
      entries.forEach(entry => {
        const id = entry.target.getAttribute('id');
        if (entry.isIntersecting) {
          // Limpa todos os links ativos
          document.querySelectorAll('.nav-link.active, .page-toc a.active').forEach(link => link.classList.remove('active'));

          // Ativa o link na TOC
          const tocLink = document.querySelector(`.page-toc a[href="#${id}"]`);
          if (tocLink) tocLink.classList.add('active');

          // NOVIDADE v4.0: Ativa o link na navegação principal e seus pais
          const mainNavLink = document.querySelector(`.site-nav a[href="#${id}"]`);
          if (mainNavLink) {
            mainNavLink.classList.add('active');
            
            // Procura por um <details> pai e o marca como ativo visualmente (se necessário)
            const parentDetails = mainNavLink.closest('details');
            if (parentDetails) {
              parentDetails.querySelector('summary').classList.add('active-parent');
            }
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    headings.forEach(heading => observer.observe(heading));
  };

  /**
   * Módulo: Rolagem Suave
   * (Inalterado, a lógica é robusta)
   */
  const initSmoothScrolling = () => {
    document.body.addEventListener('click', event => {
        if (event.target.matches('a[href^="#"]')) {
            const link = event.target;
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                event.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
  };


  // --- PONTO DE ENTRADA v4.0 ---
  // A ordem de execução agora é crucial.
  initTemplates();       // 1. Constrói a UI a partir dos templates.
  initMobileMenu();      // 2. Anexa eventos aos elementos construídos.
  generateTOC();         // 3. Gera a lista de conteúdos.
  initScrollSpy();       // 4. Inicia a observação dos conteúdos.
  initSmoothScrolling(); // 5. Habilita a rolagem suave globalmente.

});
