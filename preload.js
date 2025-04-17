// preload.js

const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script loaded.');

// Expõe funcionalidades seguras para o processo de renderização (seu jogo Phaser)
// através do objeto window.electronAPI
contextBridge.exposeInMainWorld('electronAPI', {
  // Exemplo: Função para obter dados do perfil do jogador do processo principal
  // Usamos async/await porque invoke é assíncrono
  getProfile: async () => {
    try {
      const profile = await ipcRenderer.invoke('db:get-profile');
      console.log('Preload: Received profile data:', profile);
      return profile;
    } catch (error) {
      console.error('Error invoking db:get-profile:', error);
      return null; // Retorna null ou lança erro, dependendo de como quer tratar no jogo
    }
  },

  // Exemplo: Função para atualizar o perfil do jogador
  updateProfile: async (profileData) => {
    try {
      const result = await ipcRenderer.invoke('db:update-profile', profileData);
      console.log('Preload: Profile update result:', result);
      return result; // Geralmente true ou false indicando sucesso/falha
    } catch (error) {
      console.error('Error invoking db:update-profile:', error);
      return false;
    }
  },

  // Exemplo: Função para adicionar um novo high score
  addHighScore: async (playerName, score) => {
    try {
      const result = await ipcRenderer.invoke('db:add-high-score', playerName, score);
      console.log('Preload: Add high score result:', result);
      return result;
    } catch (error) {
      console.error('Error invoking db:add-high-score:', error);
      return false;
    }
  },

  // Exemplo: Função para buscar a lista de high scores
  getHighScores: async (limit = 10) => {
    try {
      const scores = await ipcRenderer.invoke('db:get-high-scores', limit);
      console.log('Preload: Received high scores:', scores);
      return scores;
    } catch (error) {
      console.error('Error invoking db:get-high-scores:', error);
      return null; // ou []
    }
  }

  // Você pode adicionar mais funções aqui conforme necessário
  // Por exemplo, para interagir com outras APIs do Electron/Node.js
  // de forma segura a partir do seu jogo.
});

// Mensagem para confirmar que o script foi carregado no console do DevTools da janela
console.log('ElectronAPI exposed on window object via contextBridge.');