/* ARQUIVO 4 de 7: theme.js */
/* Responsável pela lógica de alternância de tema (claro/escuro) e persistência de dados. */

document.addEventListener('DOMContentLoaded', () => {

  'use strict';
  
  const themeToggle = document.getElementById('theme-toggle');
  const docElement = document.documentElement;

  // Se o botão não existir, o script não precisa rodar.
  if (!themeToggle) {
    return;
  }

  /**
   * Aplica o tema e atualiza a interface e o localStorage.
   * @param {string} theme - O tema a ser aplicado ('light' or 'dark').
   */
  const applyTheme = (theme) => {
    // Aplica a classe ao elemento <html>
    docElement.className = theme === 'dark' ? 'theme-dark' : 'theme-light';
    
    // Salva a preferência do usuário
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {
      console.warn('LocalStorage is not available.');
    }

    // Atualiza o aria-label do botão para acessibilidade
    const newLabel = theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro';
    themeToggle.setAttribute('aria-label', newLabel);
  };

  /**
   * Obtém o tema atual com base na classe do <html>.
   * @returns {string} - 'light' ou 'dark'.
   */
  const getCurrentTheme = () => {
    return docElement.classList.contains('theme-light') ? 'light' : 'dark';
  };

  // Adiciona o listener de clique ao botão
  themeToggle.addEventListener('click', () => {
    const currentTheme = getCurrentTheme();
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
  });
  
  // Garante que o aria-label do botão esteja correto no carregamento inicial
  const initialTheme = getCurrentTheme();
  const initialLabel = initialTheme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro';
  themeToggle.setAttribute('aria-label', initialLabel);

});
