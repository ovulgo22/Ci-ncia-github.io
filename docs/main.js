/* ARQUIVO 3 de 7: main.js */
/* Responsável pela interatividade do cliente: menus, geração de conteúdo dinâmico e navegação. */

// Executa o script apenas quando o DOM estiver completamente carregado e parseado.
document.addEventListener('DOMContentLoaded', () => {

  'use strict';

  /**
   * Módulo: Navegação Móvel
   * Controla a exibição do menu lateral em dispositivos móveis.
   */
  const initMobileMenu = () => {
    const toggleButton = document.querySelector('.mobile-nav-toggle');
    const siteNav = document.querySelector('.site-nav');

    // Se os elementos não existirem, não faz nada.
    if (!toggleButton || !siteNav) {
      return;
    }

    toggleButton.addEventListener('click', () => {
      // Alterna a classe que o CSS usa para mostrar/esconder o menu
      siteNav.classList.toggle('is-open');

      // Atualiza o atributo ARIA para acessibilidade
      const isExpanded = siteNav.classList.contains('is-open');
      toggleButton.setAttribute('aria-expanded', isExpanded);
    });
  };

  /**
   * Módulo: Geração da Tabela de Conteúdos (TOC)
   * Popula dinamicamente a seção "Nesta Página" baseando-se nos títulos <h2> do artigo.
   */
  const generateTOC = () => {
    const tocList = document.querySelector('#toc-list');
    const tocTemplate = document.querySelector('#toc-item-template');
    const headings = document.querySelectorAll('.main-content article h2[id]');

    // Se os elementos necessários não existirem, aborta a função.
    if (!tocList || !tocTemplate || headings.length === 0) {
      return;
    }

    // Limpa qualquer conteúdo estático que possa existir
    tocList.innerHTML = '';

    headings.forEach(heading => {
      // Clona o conteúdo do template <template>
      const templateContent = tocTemplate.content.cloneNode(true);
      const link = templateContent.querySelector('a');

      // Configura o link com o ID e o texto do título
      link.href = `#${heading.id}`;
      link.textContent = heading.textContent;
      
      // Adiciona o novo item à lista
      tocList.appendChild(templateContent);
    });
  };

  /**
   * Módulo: Scroll Spy
   * Destaca o link ativo na TOC conforme o usuário rola a página.
   * Usa IntersectionObserver para alta performance.
   */
  const initScrollSpy = () => {
    const headings = document.querySelectorAll('.main-content article h2[id]');
    if (headings.length === 0) return;

    const observerOptions = {
      rootMargin: '0px 0px -60% 0px', // Ativa quando o título está no topo da tela
      threshold: 1.0
    };

    const observerCallback = (entries) => {
      entries.forEach(entry => {
        const id = entry.target.getAttribute('id');
        const tocLink = document.querySelector(`.page-toc a[href="#${id}"]`);

        if (entry.isIntersecting && tocLink) {
          // Remove a classe 'active' de todos os links
          document.querySelectorAll('.page-toc a.active').forEach(link => link.classList.remove('active'));
          
          // Adiciona a classe 'active' ao link correspondente
          tocLink.classList.add('active');
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    headings.forEach(heading => observer.observe(heading));
  };

  /**
   * Módulo: Rolagem Suave
   * Garante que cliques em links internos (âncoras) resultem em uma rolagem animada.
   */
  const initSmoothScrolling = () => {
    const internalLinks = document.querySelectorAll('a[href^="#"]');

    internalLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  };


  // --- PONTO DE ENTRADA ---
  // Inicializa todos os módulos da aplicação.
  initMobileMenu();
  generateTOC();
  initScrollSpy();
  initSmoothScrolling();

});
