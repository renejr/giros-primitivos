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

        // --- ADICIONADO: Definir as tiras de símbolos ---
        this.reelSymbolStrips = [];
        const baseStrip = [...this.symbolKeys]; // Copia a lista base

        for (let i = 0; i < this.numReels; i++) {
            // Cria uma tira longa embaralhando e repetindo a base
            // Exemplo: 3 repetições = 3 * 12 = 36 símbolos por tira (ajuste!)
            let strip = [];
            for(let k=0; k < 3; k++) {
                 strip = strip.concat(Phaser.Utils.Array.Shuffle([...baseStrip]));
            }
            this.reelSymbolStrips[i] = strip;
        }
        console.log("Reel strips defined:", this.reelSymbolStrips);
        // --- FIM DAS DEFINIÇÕES NO CONSTRUCTOR ---
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
        // --- Constantes e Cálculos de Posição X (como antes) ---
        const totalReelsWidth = (this.numReels * this.symbolWidth) + ((this.numReels - 1) * this.reelSpacing);
        const firstReelX = this.cameras.main.centerX - (totalReelsWidth / 2) + (this.symbolWidth / 2) - 75; // Seu ajuste horizontal
        const reelsCenterY = this.cameras.main.centerY - 75; // Seu ajuste vertical final

        this.reels = [];
        // this.visibleSymbols = []; // Não vamos mais popular isso diretamente aqui

        for (let i = 0; i < this.numReels; i++) {
            const reelX = firstReelX + i * (this.symbolWidth + this.reelSpacing);
            const reelContainer = this.add.container(reelX, reelsCenterY); // Container ainda centrado
            this.reels.push(reelContainer);
            console.log(`Container for Reel ${i+1} created at X: ${reelX}`);

            const currentStrip = this.reelSymbolStrips[i]; // Pega a tira para esta coluna
            const stripHeight = currentStrip.length * (this.symbolHeight + this.symbolPaddingY);

            // Adiciona TODOS os símbolos da tira ao container
            for (let k = 0; k < currentStrip.length; k++) {
                const symbolKey = currentStrip[k];
                // Calcula a posição Y relativa ao *topo* da tira imaginária
                // A posição 0 seria o topo do primeiro símbolo
                const symbolY = k * (this.symbolHeight + this.symbolPaddingY);

                // Adiciona fundo da célula (opcional, pode remover se a máscara bastar)
                const cellBg = this.add.rectangle(0, symbolY, this.symbolWidth, this.symbolHeight + this.symbolPaddingY, 0x000000, 0.1).setOrigin(0.5); // Alpha menor
                reelContainer.add(cellBg);

                // Cria e adiciona a imagem do símbolo
                const symbolImage = this.add.image(0, symbolY, symbolKey).setOrigin(0.5);
                reelContainer.add(symbolImage);

                // Não precisamos mais guardar visibleSymbols aqui da mesma forma
            }

            // --- AJUSTE INICIAL DA POSIÇÃO Y DO CONTAINER ---
            // Para começar mostrando os símbolos do "meio" da tira na área visível
            // Vamos calcular o Y do símbolo do meio da tira e ajustar o container
            // para que esse Y fique no centro (reelsCenterY, que é a origem Y do container)
            const middleSymbolIndex = Math.floor(currentStrip.length / 2);
            const middleSymbolY = middleSymbolIndex * (this.symbolHeight + this.symbolPaddingY);
            // Ajusta a posição inicial Y do container. O container em si é movido.
            // A origem Y do container (reelContainer.y) foi definida como reelsCenterY.
            // Os símbolos são adicionados com Y relativo a 0 dentro do container.
            // Para centralizar o símbolo do meio da *tira* no centro da *tela*,
            // precisamos deslocar o *conteúdo* do container para cima por middleSymbolY.
            // Como não podemos mover o conteúdo diretamente, ajustamos a origem Y inicial
            // ou aplicamos uma posição inicial que simule isso.
            // Uma forma é definir a posição Y inicial do *container* para esconder parte da tira.
            // Vamos posicionar o *topo* do container (y=0 interno) um pouco acima da área visível.
            // A área visível começa em roughly reelsCenterY + reelStartYOffset - symbolHeight/2
            // Ajuste inicial Y do container (pode precisar de ajuste fino)
            reelContainer.y = reelsCenterY - middleSymbolY; // Tentativa inicial de centralizar o meio da tira

        } // Fim do loop i

        // --- Código da Máscara (como antes, mas verifique as coordenadas) ---
        console.log('Creating reels mask...');
        // Recalcular maskWidth/Height/X/Y baseado nas propriedades `this.`
        const maskWidth = (this.numReels * this.symbolWidth) + ((this.numReels - 1) * this.reelSpacing) - this.reelSpacing; // Ajustado
        const maskHeight = this.visibleRows * (this.symbolHeight + this.symbolPaddingY) - this.symbolPaddingY;
        const maskX = firstReelX - this.symbolWidth / 2;
        // O Y da máscara deve ser o topo da área visível
        const maskY = reelsCenterY + this.reelStartYOffset - this.symbolHeight / 2; // Topo da linha 0

        const maskGraphics = this.make.graphics();
        maskGraphics.fillStyle(0xffffff);
        maskGraphics.fillRect(maskX, maskY, maskWidth, maskHeight);
        const mask = maskGraphics.createGeometryMask();

        for (let i = 0; i < this.numReels; i++) {
            if (this.reels[i]) {
                this.reels[i].setMask(mask);
            }
        }
        console.log('Reels mask created and applied.');
        console.log('Finished creating initial reels display with full strips.');
    }
    // ... startSpin e displaySpinResult precisam ser modificados ...
    
    // ... (create, startSpin, update como antes ou com modificações futuras) ...

    // --- NOVO MÉTODO: Iniciar o Giro (Stub) ---
    // SUBSTITUA O MÉTODO startSpin INTEIRO POR ESTE:
    startSpin() {
        console.log('--- GameScene: startSpin() called! ---');

        const reelsCenterY = this.cameras.main.centerY - 75;

        // TODO: Lógica de custo da aposta e verificação de saldo...
        // TODO: Desabilitar botão de Spin na UIScene...

        // 1. Gerar o resultado final: um ÍNDICE de parada para cada coluna
        let finalStopIndexes = [];
        for (let i = 0; i < this.numReels; i++) {
            // Escolhe um índice aleatório dentro da tira de símbolos para esta coluna
            // Evita escolher os primeríssimos ou últimíssimos para ter margem para "girar"
            const buffer = this.visibleRows; // Quantos símbolos deixar de margem no início/fim
            finalStopIndexes[i] = Phaser.Math.RND.between(buffer, this.reelSymbolStrips[i].length - 1 - buffer);
        }
        console.log('Random stop indexes determined:', finalStopIndexes);

        // --- REMOVIDA A CHAMADA PARA displaySpinResult ---
        // this.displaySpinResult(finalResult); // <<< REMOVIDO

        const spinDurationBase = 2500; // Ex: 2.5 segundos base (ajuste!)
        const reelDelay = 300;        // Atraso maior entre paradas (ajuste!)       // Atraso entre o início do giro de cada coluna

        console.log('Starting tween animations...');
        for (let i = 0; i < this.numReels; i++) {
            const targetStopIndex = finalStopIndexes[i];
            const reelContainer = this.reels[i];
            const stepY = this.symbolHeight + this.symbolPaddingY;
            const targetSymbolInternalY = targetStopIndex * stepY;
            
            // O centro visual da grade corresponde à linha do meio (j=1)
            // A posição Y interna da linha do meio é: this.reelStartYOffset + 1 * stepY
            const middleRowInternalY = this.reelStartYOffset + Math.floor(this.visibleRows / 2) * stepY;
            // A posição final do container é sua posição central menos o deslocamento
            // necessário para alinhar o targetSymbolInternalY com o middleRowInternalY.
            // Posição Y final REAL onde o container deve parar
            const finalContainerY = reelsCenterY - (targetStopIndex * stepY);

            // --- Melhoria da Animação ---
            // const revolutions = 2; // Nº de "voltas" extras para simular velocidade (ajuste!)
            // const stripPixelHeight = this.reelSymbolStrips[i].length * stepY; // Altura total da tira de símbolos
            // Faz o tween ir muito além da posição final (mais para cima = Y negativo maior)
            // const targetYTween = finalContainerY - (revolutions * stripPixelHeight);
            // Aumenta a duração base e adiciona mais tempo por revolução extra
            const tweenDuration = spinDurationBase + i * reelDelay
            // --- Fim da Melhoria ---

            console.log(`Reel <span class="math-inline">\{i\+1\}\: Animating to Y\=</span>{targetYTween.toFixed(2)}, Final Y will be ${finalContainerY.toFixed(2)}`);

            // --- Cria a Animação (Tween) ---
            this.tweens.add({
                targets: reelContainer,
                y: finalContainerY,     // Continua mirando na posição final correta
                duration: tweenDuration, // <<< DURAÇÃO MAIOR
                // Escolha uma função de Easing que desacelere no final:
                // 'Expo.easeOut' - Desaceleração exponencial forte (bom para paradas)
                // 'Circ.easeOut' - Desaceleração circular
                // 'Back.easeOut' - Desacelera e dá um leve "overshoot" (passa um pouco e volta) - interessante!
                // 'Bounce.easeOut' - Efeito de "quicar" na parada
                // Experimente! Vamos começar com Expo.easeOut:
                ease: 'Expo.easeOut', // <<< MUDAR O EASE
                // easeParams: [ 1.5 ], // Parâmetro opcional para 'Back.easeOut' (intensidade do overshoot)
                delay: i * 100, // Atraso inicial um pouco maior (opcional)
                onComplete: () => {
                    // Mantém o log, não precisamos mais do "snap" se o tween parar corretamente
                    console.log(`Reel <span class="math-inline">\{i \+ 1\} stopped at Y\=</span>{reelContainer.y.toFixed(2)} (Target index: ${targetStopIndex})`);
        
                    if (i === this.numReels - 1) {
                        console.log('--- All reels stopped! ---');
                        // TODO: checkWins, enable button...
                    }
                }
            });
        }
        // --- FIM DA ANIMAÇÃO ---

        // TODO Lógica futura...
    }

    update(time, delta) {
        // O loop de jogo principal (executa a cada frame)
        // console.log('GameScene: update()'); // Descomente para ver o log a cada frame
    }
}