// src/game.js - Ponto de Entrada e Configuração do Phaser 3

// import Phaser from 'phaser';
console.log("src/game.js: File loaded, starting Phaser setup..."); // LOG ADICIONADO
// Importar a primeira cena (Ainda vamos criar este arquivo!)
import PreloaderScene from './scenes/PreloaderScene.js';
import GameScene from './scenes/GameScene.js';       // Descomentar depois
import UIScene from './scenes/UIScene.js';           // Descomentar depois

// Configuração principal do jogo Phaser
const config = {
  // type: Phaser.AUTO, // Altere esta linha
  type: Phaser.WEBGL,
  width: 1024,
  height: 768,
  // parent: null, // Podemos remover ou comentar 'parent' agora
  canvas: document.getElementById('game-canvas'), // <--- ADICIONE ESTA LINHA
  backgroundColor: '#1a1a1a',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }
    }
  },
  scene: [
    PreloaderScene,
    GameScene,
    UIScene
  ]
};

// Cria a instância do jogo Phaser
const game = new Phaser.Game(config);

console.log('Phaser game instance created.');

// Exportar a instância do jogo pode ser útil em alguns casos, mas não essencial agora
// export default game;