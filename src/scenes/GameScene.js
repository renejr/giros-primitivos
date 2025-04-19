// src/scenes/GameScene.js

// Não precisamos importar Phaser aqui se ele já está global
// import Phaser from 'phaser';

import { PAYLINES, PAYTABLE, NUM_REELS as GameConstants_NUM_REELS, VISIBLE_ROWS as GameConstants_VISIBLE_ROWS } from '../helpers/Constants.js'; // <<< IMPORTAR

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
    
// SUBSTITUA O MÉTODO checkWins INTEIRO POR ESTE:
    checkWins(finalStopIndexes) {
        console.log('--- GameScene: checkWins() called ---');
        const wildSymbolKey = 'symbol_wild'; // Chave do Wild definida em Constants.js
        // const scatterSymbolKey = 'symbol_scatter'; // Chave do Scatter (para TODO futuro)

        // 1. Construir a grade 5x3 visível a partir dos índices de parada
        let visibleSymbolGrid = [];
        for (let i = 0; i < this.numReels; i++) {
            visibleSymbolGrid[i] = [];
            const stopIndex = finalStopIndexes[i];
            const strip = this.reelSymbolStrips[i];
            if (!strip || stopIndex === undefined || stopIndex < 0 || stopIndex >= strip.length) {
                console.error(`Invalid stopIndex (${stopIndex}) or strip for reel ${i} in checkWins`);
                visibleSymbolGrid[i] = [null, null, null];
                continue;
            }
            const indexRow0 = (stopIndex - 1 + strip.length) % strip.length; // Topo
            const indexRow1 = stopIndex;                                   // Meio
            const indexRow2 = (stopIndex + 1) % strip.length;              // Base
            visibleSymbolGrid[i][0] = strip[indexRow0];
            visibleSymbolGrid[i][1] = strip[indexRow1];
            visibleSymbolGrid[i][2] = strip[indexRow2];
        }
        // Log formatado para melhor visualização da grade
        console.log('Visible Grid for Win Check:');
        for (let r = 0; r < this.visibleRows; r++) {
            let rowStr = "";
            for (let c = 0; c < this.numReels; c++) {
                rowStr += (visibleSymbolGrid[c][r] || 'NULL').padEnd(20); // Ajuste padEnd conforme necessário
            }
            console.log(`[${rowStr}]`);
        }


        // 2. Inicializar ganhos
        let totalWin = 0;
        let winningLinesInfo = [];

        // 3. Iterar sobre cada PAYLINE
        for (let lineIndex = 0; lineIndex < PAYLINES.length; lineIndex++) {
            const currentPayline = PAYLINES[lineIndex];
            let lineSymbols = [];

            // Coleta os símbolos da payline atual
            for (let reelIndex = 0; reelIndex < this.numReels; reelIndex++) {
                // Garante que não tentemos acessar fora dos limites da payline definida
                if(reelIndex < currentPayline.length){
                    const rowIndex = currentPayline[reelIndex];
                    lineSymbols.push(visibleSymbolGrid[reelIndex][rowIndex]);
                } else {
                    lineSymbols.push(null); // Preenche com null se payline for mais curta
                }
            }

            // 4. Verifica combinações da esquerda para a direita
            let firstSymbol = lineSymbols[0];
            if (firstSymbol === null) continue; // Pula linha se começar com erro/null

            let paySymbol = firstSymbol;
            let matchCount = 0;

            // Lógica para Wild no início
            if (firstSymbol === wildSymbolKey) {
                matchCount = 1;
                for (let k = 1; k < this.numReels; k++) { // Usa this.numReels aqui
                    if(lineSymbols[k] === null) break; // Para se a linha acabar
                    if (lineSymbols[k] !== wildSymbolKey) {
                        paySymbol = lineSymbols[k];
                        break;
                    }
                    matchCount++;
                }
                // Se linha inteira de Wilds, paySymbol = wildSymbolKey
                if (matchCount === this.numReels) paySymbol = wildSymbolKey;
            } else {
                paySymbol = firstSymbol;
            }

            // Pula linha se o símbolo base não paga (ou é Scatter, tratar depois)
            if (!PAYTABLE[paySymbol] /* && paySymbol !== scatterSymbolKey */) {
                continue;
            }

            // Reseta matchCount e conta de novo incluindo o símbolo base correto
            matchCount = 0;
            for (let i = 0; i < this.numReels; i++) {
                if (lineSymbols[i] === null) break; // Para se a linha acabar

                if (lineSymbols[i] === paySymbol || lineSymbols[i] === wildSymbolKey) {
                    matchCount++;
                } else {
                    break; // Combinação quebrada
                }
            }

            // 5. Calcula o ganho se houver 3 ou mais
            if (matchCount >= 3) {
                const payoutIndex = matchCount - 3; // Índice para array [3, 4, 5]
                const payoutMultiplier = (PAYTABLE[paySymbol] && PAYTABLE[paySymbol].length > payoutIndex)
                                        ? PAYTABLE[paySymbol][payoutIndex]
                                        : 0;

                if (payoutMultiplier > 0) {
                    // USA VALOR PLACEHOLDER PARA APOSTA POR LINHA!
                    const betPerLine = 1; // <<< PRECISA SER SUBSTITUÍDO PELA APOSTA REAL
                    const lineWin = payoutMultiplier * betPerLine;

                    totalWin += lineWin;
                    console.log(`%cWIN!%c Payline <span class="math-inline">\{lineIndex \+ 1\} \(\[</span>{currentPayline.join(',')}]), Symbol: ${paySymbol}, Count: ${matchCount}, Payout: ${lineWin} (Multiplier: ${payoutMultiplier})`, 'color: green; font-weight: bold;', 'color: inherit;');
                    winningLinesInfo.push({ line: lineIndex + 1, symbol: paySymbol, count: matchCount, amount: lineWin });
                }
            }
        } // Fim do loop de Paylines

        // --- TODO: Verificação de Scatters ---

        console.log('Winning Lines Info:', winningLinesInfo);
        console.log(`Total Win Calculated (based on betPerLine=1): ${totalWin}`);

        // --- TODO: Atualizar saldo e UI ---

        return totalWin;
    }
    // --- FIM DO MÉTODO checkWins ---

    
    // SUBSTITUA O MÉTODO startSpin INTEIRO POR ESTE:
    // =========================================================================
    // SUBSTITUA O MÉTODO startSpin INTEIRO POR ESTA VERSÃO FINAL E ESTÁVEL
    // =========================================================================
    startSpin() {
        // --- PASSO 0: Verificar se já está girando ---
        if (this.isSpinning) {
            console.warn("GameScene: Spin attempt ignored, already spinning.");
            return; // Sai imediatamente se já estiver em processo
        }
        console.log('--- GameScene: startSpin() called! ---');
        this.isSpinning = true; // <<< Define a flag para bloquear novos spins

        // --- Desabilitar o Botão na UI ---
        const uiScene = this.scene.get('UIScene');
        if (uiScene && typeof uiScene.disableSpinButton === 'function') {
            uiScene.disableSpinButton();
        } else {
            console.warn('GameScene: Could not get UIScene or disableSpinButton function.');
        }

        // --- Configurações e Cálculos ---
        const reelsCenterY = this.cameras.main.centerY - 75; // Seu offset Y final
        const stopDurationBase = 960;  // Duração lenta que você gostou
        const reelDelay = 180;        // Delay lento que você gostou
        const stepY = this.symbolHeight + this.symbolPaddingY;

        // TODO: Lógica de custo da aposta aqui...

        // 1. Gerar os índices de parada finais aleatórios
        let finalStopIndexes = [];
        for (let i = 0; i < this.numReels; i++) {
            const buffer = this.visibleRows;
            if (!this.reelSymbolStrips[i] || this.reelSymbolStrips[i].length <= buffer * 2) {
                console.error(`Invalid reel strip for reel ${i}.`);
                finalStopIndexes[i] = 0; // Índice padrão em caso de erro
            } else {
                const stripLength = this.reelSymbolStrips[i].length;
                finalStopIndexes[i] = Phaser.Math.RND.between(buffer, stripLength - 1 - buffer);
            }
        }
        console.log('Random stop indexes determined:', finalStopIndexes);
        const finalStopIndexesCopy = [...finalStopIndexes];

        // 2. Iniciar Animações (Versão Estável: Direto para o Final)
        console.log('Starting final position tweens...');
        let tweensCompleted = 0;

        for (let i = 0; i < this.numReels; i++) {
            const targetStopIndex = finalStopIndexes[i];
            const reelContainer = this.reels[i];

            if (!reelContainer) {
                console.error(`Error: Invalid reel container for reel ${i}`);
                tweensCompleted++;
                if (tweensCompleted === this.numReels) { this.isSpinning = false; } // Reseta se todos falharem
                continue;
            }

            // Calcula APENAS a posição Y final REAL
            const finalContainerY = reelsCenterY - (targetStopIndex * stepY);
            const tweenDuration = stopDurationBase + i * reelDelay;

            console.log(`Reel <span class="math-inline">\{i\+1\}\: Tweening from current Y\=</span>{reelContainer.y.toFixed(2)} to Final Y=${finalContainerY.toFixed(2)} (Index: ${targetStopIndex})`);

            // --- Cria a Animação (Tween) Direta para o Ponto Final ---
            this.tweens.add({
                targets: reelContainer,
                y: finalContainerY,         // Anima direto PARA a posição final
                duration: tweenDuration,    // Usa a duração mais longa que você gostou
                ease: 'Expo.easeOut',       // Mantém a desaceleração suave
                delay: i * 100,             // Mantém o atraso sequencial
                onComplete: () => {
                    tweensCompleted++;
                    console.log(`Reel <span class="math-inline">\{i \+ 1\} stopped at Y\=</span>{reelContainer.y.toFixed(2)} (Target index: <span class="math-inline">\{targetStopIndex\}\) \- \(</span>{tweensCompleted}/${this.numReels})`);

                    // Verifica se TODOS os tweens terminaram
                    if (tweensCompleted === this.numReels) {
                        console.log('--- All reels stopped! ---');
                        // Verifica Ganhos
                        try {
                            this.checkWins(finalStopIndexesCopy);
                        } catch (winError) {
                            console.error("Error during checkWins:", winError);
                        }

                        // TODO: Lógica de adicionar ganhos ao saldo...

                        // --- Reabilitar o Botão e Resetar Flag ---
                        console.log('Attempting to re-enable spin button and reset flag...');
                        const finalUiScene = this.scene.get('UIScene');
                        if (finalUiScene && typeof finalUiScene.enableSpinButton === 'function') {
                            finalUiScene.enableSpinButton();
                        } else {
                            console.warn('GameScene: Could not get UIScene or enableSpinButton function on final complete.');
                        }
                        this.isSpinning = false; // <<< RESETA A FLAG AQUI
                        console.log('isSpinning flag set to false.');
                        // --- Fim Reabilitar / Resetar ---
                    }
                },
                onCompleteScope: this
            });
        } // Fim do loop for
    } // --- FIM DO MÉTODO startSpin ---

    // ... (checkWins, create, createReels, preload, constructor... sem mudanças) ...

    update(time, delta) {
        // O loop de jogo principal (executa a cada frame)
        // console.log('GameScene: update()'); // Descomente para ver o log a cada frame
    }
}