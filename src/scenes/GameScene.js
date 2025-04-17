// src/scenes/GameScene.js

// Não precisamos importar Phaser aqui se ele já está global
// import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {

    constructor() {
        super({ key: 'GameScene' });
        this.reels = []; // Array para guardar referência às colunas (reels)

        // --- ADICIONADO: Lista com as chaves de TODOS os símbolos carregados ---
        // Certifique-se que estas chaves correspondem EXATAMENTE às usadas no PreloaderScene!
        this.symbolKeys = [
            'symbol_A', 'symbol_K', 'symbol_Q', 'symbol_J', // Adicione 'symbol_10' se tiver
            'symbol_egg', 'symbol_pterodactyl', 'symbol_saber',
            'symbol_mammoth', 'symbol_caveman', 'symbol_cavewoman',
            'symbol_wild', 'symbol_scatter'
        ];
        // Será um array 2D: this.visibleSymbols[coluna][linha]
        this.visibleSymbols = [];

        // --- DEFINIR CONSTANTES DE LAYOUT COMO PROPRIEDADES DA CLASSE ---
        this.symbolWidth = 150;
        this.symbolHeight = 150;
        this.symbolPaddingY = 15;
        this.visibleRows = 3;
        this.numReels = 5;
        this.reelSpacing = 10;
        // Calcula o offset baseado nas propriedades da classe
        this.reelStartYOffset = -(this.visibleRows - 1) / 2 * (this.symbolHeight + this.symbolPaddingY);
        // --- FIM DAS DEFINIÇÕES NO CONSTRUCTOR ---

        // --- FIM DA ADIÇÃO ---
    }

    preload() {
        // O preload da GameScene normalmente carregaria assets específicos desta cena,
        // mas muitos assets comuns já podem ter sido carregados no PreloaderScene.
        console.log('GameScene: preload()');
        // Deixe vazio por enquanto.
    }

    create() {
        console.log('GameScene: create()');
    
        // --- ADICIONAR O BACKGROUND PRIMEIRO ---
        // Adiciona a imagem carregada com a chave 'background'
        // Define a origem para o centro e a profundidade para -1 (atrás de outros elementos)
        const bg = this.add.image(
                this.cameras.main.centerX,
                this.cameras.main.centerY,
                'background' // <<< Certifique-se que esta é a chave usada no Preloader
            )
            .setOrigin(0.5)
            .setDepth(-1); // <<< Coloca a imagem atrás (profundidade menor)
    
        // Log opcional para verificar se a imagem foi adicionada
        console.log('Background added:', bg.texture.key, bg.width, bg.height, bg.visible, bg.alpha, bg.depth);
    
        // --- Adicionar outros elementos DEPOIS do background ---
        // Mantém o texto de teste (agora ficará sobre o fundo)
        /* this.add.text(
            this.cameras.main.centerX,
            50, // Posição Y
            'GameScene Carregada!',
            { fontSize: '40px', fill: '#ffffff', fontStyle: 'bold' }
        ).setOrigin(0.5); // Centraliza o texto horizontalmente
 */
        // Chama a função para criar as colunas
        this.createReels(); // <<< ADICIONADO 
    
        // Linha comentada do background sólido (correto)
        // this.cameras.main.setBackgroundColor('#444');
    
        // Aqui é onde a lógica principal do jogo começará
    }

    createReels() {
        console.log('GameScene: createReels() called');
    
        // --- Constantes de Layout (Ajuste conforme necessário) ---
        // const SYMBOL_WIDTH = 150;  // Largura estimada de cada símbolo
        // const SYMBOL_HEIGHT = 150; // Altura estimada de cada símbolo
        // const SYMBOL_PADDING_Y = 15; // Espaço vertical entre os símbolos
        // const VISIBLE_ROWS = 3;    // Quantas linhas são visíveis
        // const NUM_REELS = 5;       // Quantas colunas
        // const REEL_SPACING = 10;   // Espaço horizontal entre as colunas
        // // Offset para centralizar verticalmente (AGORA CONSIDERA O PADDING)
        // const REEL_START_Y_OFFSET = -(VISIBLE_ROWS - 1) / 2 * (SYMBOL_HEIGHT + SYMBOL_PADDING_Y); // <<< MODIFICADO
        // const REEL_START_Y_OFFSET = -(VISIBLE_ROWS - 1) / 2 * SYMBOL_HEIGHT; // Offset para centralizar verticalmente

    
        // Largura total ocupada pelas colunas e espaços
        // Cálculos que dependem das propriedades da classe
        const totalReelsWidth = (this.numReels * this.symbolWidth) + ((this.numReels - 1) * this.reelSpacing);
        const firstReelX = this.cameras.main.centerX - (totalReelsWidth / 2) + (this.symbolWidth / 2) - 75; // Seu ajuste horizontal
        const reelsCenterY = this.cameras.main.centerY - 75; // Seu ajuste vertical final
    
        // Limpa o array de reels anterior, se houver
        this.reels = [];
        this.visibleSymbols = []; // Limpa/inicializa antes de preencher
    
        // Cria cada coluna (reel)
        for (let i = 0; i < this.numReels; i++) { // Usa this.numReels
            const reelX = firstReelX + i * (this.symbolWidth + this.reelSpacing);
            this.visibleSymbols[i] = [];
            const reelContainer = this.add.container(reelX, reelsCenterY);
            this.reels.push(reelContainer);
            console.log(`Container for Reel ${i+1} created at X: ${reelX}`);

            for (let j = 0; j < this.visibleRows; j++) { // Usa this.visibleRows
                const randomSymbolKey = Phaser.Math.RND.pick(this.symbolKeys);
                // Usa this.reelStartYOffset, this.symbolHeight, this.symbolPaddingY
                const symbolY = this.reelStartYOffset + j * (this.symbolHeight + this.symbolPaddingY);

                const cellBg = this.add.rectangle(
                    0, symbolY,
                    this.symbolWidth, this.symbolHeight + this.symbolPaddingY, // Usa this.
                    0x000000, 0.2
                ).setOrigin(0.5);
                reelContainer.add(cellBg);

                const symbolImage = this.add.image(0, symbolY, randomSymbolKey)
                    .setOrigin(0.5); // Garante origem
                reelContainer.add(symbolImage);
                this.visibleSymbols[i][j] = symbolImage;
            }
        }
        console.log('Finished creating initial reels display and storing symbol references.');

        // --- CORRIGIDO: Criar e Aplicar Máscara usando this. ---
        console.log('Creating reels mask...');
        // Calcula a área total ocupada visualmente pelos reels visíveis
        // *** USA this. para acessar as propriedades da classe ***
        const maskWidth = totalReelsWidth - this.reelSpacing;
        const maskHeight = this.visibleRows * (this.symbolHeight + this.symbolPaddingY) - this.symbolPaddingY;

        // Calcula a posição inicial da máscara (canto superior esquerdo da área dos reels)
        // *** USA this. para acessar as propriedades da classe ***
        const maskX = firstReelX - this.symbolWidth / 2;
        const maskY = reelsCenterY + this.reelStartYOffset - this.symbolHeight / 2;

        // Cria um objeto Graphics para desenhar a forma da máscara
        const maskGraphics = this.make.graphics();
        maskGraphics.fillStyle(0xffffff); // Cor não importa
        maskGraphics.beginPath();
        maskGraphics.fillRect(
            maskX,
            maskY,
            maskWidth,
            maskHeight
        );

        // Cria a GeometryMask a partir da forma desenhada
        const mask = maskGraphics.createGeometryMask();

        // Aplica a máscara a CADA container de reel
         // *** USA this. para acessar as propriedades da classe ***
        for (let i = 0; i < this.numReels; i++) {
            // Aplica ao container correto guardado em this.reels
            if(this.reels[i]) { // Adiciona verificação se o reel existe
               this.reels[i].setMask(mask);
            }
        }
        console.log('Reels mask created and applied.');
        // --- FIM DA CORREÇÃO ---
    }
    // --- FIM DA SUBSTITUIÇÃO ---
    
    // ... (create, startSpin, update como antes ou com modificações futuras) ...

    // --- NOVO MÉTODO: Iniciar o Giro (Stub) ---
    startSpin() {
        console.log('--- GameScene: startSpin() called! ---');
    
        // TODO: Adicionar lógica de custo da aposta e verificação de saldo aqui
        // let currentBet = this.registry.get('currentBet'); // Exemplo
        // let balance = this.registry.get('balance');
        // if (balance < currentBet) { console.log("Saldo insuficiente!"); return; }
        // balance -= currentBet;
        // this.registry.set('balance', balance);
        // Chamar IPC para atualizar saldo no DB...
    
        // TODO: Desabilitar botão de Spin na UIScene
        // const uiScene = this.scene.get('UIScene');
        // if (uiScene) uiScene.disableSpinButton();
    
        // 1. Gerar o resultado final aleatório (3 símbolos para cada coluna)
        let finalResult = [];
        for (let i = 0; i < this.numReels; i++) { // <<<<<<<<<<<<<<<<<<< USA this.numReels
            finalResult[i] = [];
            for (let j = 0; j < this.visibleRows; j++) { // <<<<<<<<<<<<<<<< USA this.visibleRows
                finalResult[i][j] = Phaser.Math.RND.pick(this.symbolKeys);
            }
        }
        console.log('Random spin result determined:', finalResult);
    
        // 2. Exibir o resultado (por enquanto, sem animação, apenas "troca" as imagens)
        this.displaySpinResult(finalResult);
    
        // TODO: Implementar animação de giro aqui antes de chamar displaySpinResult
    
        // TODO: Após a parada (e animação), verificar vitórias
        // this.checkWins(finalResult);
    
        // TODO: Reabilitar o botão de Spin na UIScene (após tudo terminar)
        // if (uiScene) uiScene.enableSpinButton();
    }

    // --- NOVO MÉTODO: Exibe o resultado final nos símbolos visíveis ---
    displaySpinResult(result) {
        console.log('GameScene: displaySpinResult() called');
         // --- USA AS PROPRIEDADES DA CLASSE (this.) ---
        for (let i = 0; i < this.numReels; i++) { // <<<<<<<<<<<<<<<<<<< USA this.numReels
            for (let j = 0; j < this.visibleRows; j++) { // <<<<<<<<<<<<<<<< USA this.visibleRows
                const symbolImage = this.visibleSymbols[i][j];
                const resultKey = result[i][j];
                if (symbolImage && resultKey) {
                    symbolImage.setTexture(resultKey);
                } else {
                    console.error(`Error setting texture for Reel ${i} Row ${j}`);
                }
            }
        }
        console.log('Finished displaying spin result.');
    }
    // --- FIM DO NOVO MÉTODO ---

    update(time, delta) {
        // O loop de jogo principal (executa a cada frame)
        // console.log('GameScene: update()'); // Descomente para ver o log a cada frame
    }
}