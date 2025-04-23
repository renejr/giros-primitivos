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
        // Ajuste do cálculo da largura total e posicionamento
        const totalReelsWidth = (this.numReels * this.symbolWidth) + ((this.numReels - 1) * this.reelSpacing);
        const firstReelX = this.cameras.main.centerX - (totalReelsWidth / 2) + (this.symbolWidth / 2) - 75; // Deslocado 70 pixels para a esquerda
        const reelsCenterY = this.cameras.main.centerY - 80;

        this.reels = [];

        for (let i = 0; i < this.numReels; i++) {
            const reelX = firstReelX + i * (this.symbolWidth + this.reelSpacing);
            const reelContainer = this.add.container(reelX, reelsCenterY);
            this.reels.push(reelContainer);
            console.log(`Container for Reel ${i+1} created at X: ${reelX}`);

            const currentStrip = this.reelSymbolStrips[i];
            const stripHeight = currentStrip.length * (this.symbolHeight + this.symbolPaddingY);

            for (let k = 0; k < currentStrip.length; k++) {
                const symbolKey = currentStrip[k];
                const symbolY = k * (this.symbolHeight + this.symbolPaddingY);

                const cellBg = this.add.rectangle(0, symbolY, this.symbolWidth, this.symbolHeight + this.symbolPaddingY, 0x000000, 0.1).setOrigin(0.5);
                reelContainer.add(cellBg);

                const symbolImage = this.add.image(0, symbolY, symbolKey).setOrigin(0.5);
                reelContainer.add(symbolImage);
            }

            const middleSymbolIndex = Math.floor(currentStrip.length / 2);
            const middleSymbolY = middleSymbolIndex * (this.symbolHeight + this.symbolPaddingY);
            reelContainer.y = reelsCenterY - middleSymbolY;
        }

        console.log('Creating reels mask...');
        // Ajuste do cálculo da largura da máscara para incluir todo o espaço necessário
        const maskWidth = totalReelsWidth;
        const maskHeight = this.visibleRows * (this.symbolHeight + this.symbolPaddingY) - this.symbolPaddingY;
        const maskX = firstReelX - this.symbolWidth / 2;
        const maskY = reelsCenterY + this.reelStartYOffset - this.symbolHeight / 2;

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
    
    checkWins(finalStopIndexes, currentBet) {
        console.log(`--- GameScene: checkWins() called with Bet: ${currentBet} ---`);
        const wildSymbolKey = 'symbol_wild';
    
        // 1. Construir a grade visível (keys E objects)
        let visibleSymbolGridKeys = []; // Guarda as chaves (como antes)
        let visibleSymbolObjects = []; // Guarda as referências aos GameObjects Image
    
        for (let i = 0; i < this.numReels; i++) {
            visibleSymbolGridKeys[i] = [];
            visibleSymbolObjects[i] = []; // Inicializa array para objetos desta coluna
            const stopIndex = finalStopIndexes[i];
            const strip = this.reelSymbolStrips[i];
            const reelContainer = this.reels[i]; // Pega o container
    
            if (!strip || !reelContainer || stopIndex === undefined || stopIndex < 0 || stopIndex >= strip.length) {
                console.error(`Invalid stopIndex (${stopIndex}), strip, or container for reel ${i} in checkWins`);
                visibleSymbolGridKeys[i] = [null, null, null];
                visibleSymbolObjects[i] = [null, null, null];
                continue;
            }
    
            for (let j = 0; j < this.visibleRows; j++) {
                 // Calcula o índice do símbolo na tira completa baseado no stopIndex (meio)
                const stripIndex = (stopIndex + (j - Math.floor(this.visibleRows / 2)) + strip.length) % strip.length;
                const symbolKey = strip[stripIndex];
                visibleSymbolGridKeys[i][j] = symbolKey;
    
                // Acha o GameObject Image correspondente no container
                // Assumindo que adicionamos [cellBg0, symbol0, cellBg1, symbol1, ...]
                // O índice na lista do container é k * 2 + 1
                const gameObjectIndex = stripIndex * 2 + 1;
                if (reelContainer.list && gameObjectIndex < reelContainer.list.length && reelContainer.list[gameObjectIndex] instanceof Phaser.GameObjects.Image) {
                     visibleSymbolObjects[i][j] = reelContainer.list[gameObjectIndex];
                } else {
                     console.error(`Could not find symbol GameObject at stripIndex ${stripIndex} (list index ${gameObjectIndex}) for reel ${i}`);
                     visibleSymbolObjects[i][j] = null;
                }
            }
        }
        // Log da grade (como antes)
        console.log('Visible Grid for Win Check (Keys):');
        // ... (log formatado de visibleSymbolGridKeys) ...
         for (let r = 0; r < this.visibleRows; r++) {
             let rowStr = "";
             for (let c = 0; c < this.numReels; c++) {
                 rowStr += (visibleSymbolGridKeys[c][r] || 'NULL').padEnd(20);
             }
             console.log(`[${rowStr}]`);
        }
    
    
        // 2. Inicializar ganhos
        let totalWin = 0;
        let winningLinesInfo = [];
        let winningSymbolObjects = new Set(); // Usar Set para evitar duplicatas
    
        // --- CÁLCULO DA APOSTA POR LINHA (como antes) ---
        const numberOfPaylines = PAYLINES.length > 0 ? PAYLINES.length : 1;
        const betPerLine = currentBet / numberOfPaylines;
        console.log(`Bet per line used for calculation: ${betPerLine.toFixed(2)} (Total Bet: ${currentBet})`);
    
        // 3. Iterar sobre cada PAYLINE
        for (let lineIndex = 0; lineIndex < PAYLINES.length; lineIndex++) {
            const currentPayline = PAYLINES[lineIndex];
            let lineSymbolsKeys = []; // Chaves dos símbolos na linha
            let lineSymbolsObjs = []; // Objetos dos símbolos na linha
    
            // Coleta símbolos (keys e objects) da payline
            for (let reelIndex = 0; reelIndex < this.numReels; reelIndex++) {
                if(reelIndex < currentPayline.length){
                    const rowIndex = currentPayline[reelIndex];
                    lineSymbolsKeys.push(visibleSymbolGridKeys[reelIndex][rowIndex]);
                    lineSymbolsObjs.push(visibleSymbolObjects[reelIndex][rowIndex]); // Guarda o objeto
                } else {
                     lineSymbolsKeys.push(null);
                     lineSymbolsObjs.push(null);
                }
            }
    
            // 4. Verifica combinações L-to-R (como antes, usando lineSymbolsKeys)
            // ... (lógica idêntica para achar firstSymbol, paySymbol, matchCount) ...
             let firstSymbol = lineSymbolsKeys[0];
             if (firstSymbol === null) continue;
             let paySymbol = firstSymbol;
             let matchCount = 0;
             if (firstSymbol === wildSymbolKey) { /* ... lógica wild ... */ matchCount=1;for(let k=1;k<this.numReels;k++){if(lineSymbolsKeys[k]===null)break;if(lineSymbolsKeys[k]!==wildSymbolKey){paySymbol=lineSymbolsKeys[k];break;}matchCount++;}if(matchCount===this.numReels)paySymbol=wildSymbolKey;}else{paySymbol=firstSymbol;}
             if (!PAYTABLE[paySymbol]){continue;}
             matchCount = 0;
             for (let i = 0; i < this.numReels; i++){if(lineSymbolsKeys[i]===null)break;if(lineSymbolsKeys[i]===paySymbol||lineSymbolsKeys[i]===wildSymbolKey){matchCount++;}else{break;}}
    
            // 5. Calcula ganho e ADICIONA OBJETOS VENCEDORES ao Set
            if (matchCount >= 3) {
                const payoutIndex = matchCount - 3;
                const payoutMultiplier = (PAYTABLE[paySymbol] && PAYTABLE[paySymbol].length > payoutIndex) ? PAYTABLE[paySymbol][payoutIndex] : 0;
                if (payoutMultiplier > 0) {
                    const lineWin = payoutMultiplier * betPerLine;
                    totalWin += lineWin;
                    console.log(`%cWIN!%c Payline ${lineIndex + 1} ... Payout: ${lineWin.toFixed(2)} ...`, 'color: green; font-weight: bold;', 'color: inherit;');
                    let currentWinningObjects = [];
                    // Adiciona os objetos dos símbolos que fizeram parte da vitória ao Set
                    for (let k = 0; k < matchCount; k++) {
                         if(lineSymbolsObjs[k]) { // Verifica se o objeto existe
                             winningSymbolObjects.add(lineSymbolsObjs[k]);
                             currentWinningObjects.push(lineSymbolsObjs[k]); // Guarda objs desta linha para info
                         }
                    }
                    winningLinesInfo.push({ line: lineIndex + 1, symbol: paySymbol, count: matchCount, amount: lineWin, objects: currentWinningObjects });
                }
            }
        } // Fim do loop de Paylines
    
        // --- TODO: Verificação de Scatters ---
    
        console.log('Winning Lines Info:', winningLinesInfo);
        console.log(`Total Win Calculated: ${totalWin.toFixed(2)}`);
    
        // --- Adicionar Ganhos ao Saldo ---
        if (totalWin > 0) {
            // Obter o saldo atual do registry
            let currentBalance = this.registry.get('balance') || 0;
            // Adicionar o ganho ao saldo
            currentBalance += totalWin;
            // Atualizar o registry
            this.registry.set('balance', currentBalance);
            
            // Atualizar o banco de dados via IPC
            if (window.electronAPI?.updateProfile) {
                window.electronAPI.updateProfile({ balance: currentBalance })
                    .then(success => console.log('Balance updated in DB after win:', success))
                    .catch(err => console.error('Error updating balance after win:', err));
            }
            
            // Emitir eventos para atualizar UI
            this.events.emit('balanceUpdated', currentBalance);
            this.events.emit('winAnnounced', totalWin);

            // Destacar os símbolos vencedores
            this.highlightWins(Array.from(winningSymbolObjects));
        }
    
        // Retorna um objeto com o total e os objetos vencedores únicos
        return { totalWin, winningObjects: Array.from(winningSymbolObjects) }; // Converte Set para Array
    }

    // Aplica o efeito de destaque
    highlightWins(winningObjects) {
        console.log("Highlighting winning symbols:", winningObjects);
        const dimAlpha = 0.5; // Alpha para símbolos não vencedores
        const highlightAlpha = 1.0; // Alpha para vencedores

        // 1. Diminui o alpha de TODOS os símbolos primeiro
        for (let i = 0; i < this.numReels; i++) {
            if (this.reels[i]) {
                for (let k = 1; k < this.reels[i].list.length; k += 2) {
                    const symbol = this.reels[i].list[k];
                    if (symbol instanceof Phaser.GameObjects.Image) {
                        symbol.setAlpha(dimAlpha);
                    }
                }
            }
        }

        // 2. Aplica o efeito de blink nos símbolos vencedores
        for (const winner of winningObjects) {
            if (winner) {
                winner.setAlpha(highlightAlpha);
                
                // Cria o efeito de blink usando tween
                this.tweens.add({
                    targets: winner,
                    alpha: { from: highlightAlpha, to: 0.3 },
                    duration: 200,
                    yoyo: true,
                    repeat: 5, // Número de vezes que vai piscar
                    ease: 'Sine.easeInOut'
                });
            }
        }

        // 3. Agenda a limpeza dos highlights após um tempo
        if (this.highlightTimer) { this.highlightTimer.remove(); }
        this.highlightTimer = this.time.delayedCall(2500, this.clearHighlights, [], this);
    }

    // Remove todos os efeitos de destaque
    clearHighlights() {
        console.log("Clearing highlights");
        if(this.highlightTimer) { this.highlightTimer.remove(); this.highlightTimer = null; } // Limpa timer

        for (let i = 0; i < this.numReels; i++) {
            if (this.reels[i]) {
                // Itera pelos filhos do container. Ímpares são os símbolos
                for (let k = 1; k < this.reels[i].list.length; k += 2) {
                    const symbol = this.reels[i].list[k];
                    if (symbol instanceof Phaser.GameObjects.Image) {
                        symbol.setAlpha(1.0); // Restaura alpha normal
                        // symbol.clearTint(); // Limpa tint se usou
                    }
                }
            }
        }
    }
    // --- Fim dos Novos Métodos ---

    // --- MÉTODO ATUALIZADO ---
    startSpin() {
        // --- PASSO 0: Verificar se já está girando ---
        if (this.isSpinning) {
            console.warn(`%cSpin Ignore: Already spinning. Flag is ${this.isSpinning}`, "color: orange;");
            return;
        }
        console.log('%c--- GameScene: startSpin() called! ---', "color: blue; font-weight: bold;");
        this.isSpinning = true; // <<< Define a flag como true
        console.log(`%cSpin Start: Flag set to ${this.isSpinning}`, "color: blue;");

        // --- ADICIONADO: Limpar highlights do giro anterior ---
        this.clearHighlights();
        // --- FIM ADIÇÃO ---
    
        // --- Desabilitar o Botão na UI ---
        const uiScene = this.scene.get('UIScene');
        if (uiScene && typeof uiScene.disableSpinButton === 'function') {
            uiScene.disableSpinButton();
        } else {
            console.warn('GameScene: Could not get UIScene or disableSpinButton function.');
        }
    
        // --- Ler Aposta e Saldo do Registry ---
        let currentBet = this.registry.get('currentBet') ?? 1;
        let balance = this.registry.get('balance') ?? 0;
    
        // Usa valores padrão se não encontrados no registry (importante na primeira vez)
        if (currentBet === undefined) { currentBet = this.minBet || 1; }
        if (balance === undefined) { balance = 1000; } // Ou buscar do profile default se necessário
        console.log(`Spin Start: Bet= ${currentBet}, Balance= ${balance}`);
    
        // --- Verificar Saldo ---
        if (balance < currentBet) {
            console.warn(`Spin aborted. Insufficient balance (${balance}) for bet (${currentBet}).`);
            // Reabilita o botão imediatamente e reseta a flag se não puder girar
            if (uiScene && typeof uiScene.enableSpinButton === 'function') { uiScene.enableSpinButton(); }
            this.isSpinning = false;
            return;
        }
    
        // --- Deduzir Aposta e Salvar ---
        balance -= currentBet;
        this.registry.set('balance', balance); // Atualiza registry localmente
        console.log(`Bet ${currentBet.toFixed(2)} deducted. New balance (local): ${balance.toFixed(2)}`);
        // Salva o novo saldo no DB via IPC
        if (window.electronAPI?.updateProfile) {
            window.electronAPI.updateProfile({ balance: balance })
                .then(success => console.log('GameScene: Balance update (after bet) sent to DB:', success))
                .catch(err => console.error('GameScene: Error sending balance update (after bet):', err));
        }
        // Emite evento para UI atualizar o saldo IMEDIATAMENTE após deduzir
        this.events.emit('balanceUpdated', balance);
        // --- Fim Deduzir Aposta ---
    
        // --- Configurações e Geração de Resultados (como antes) ---
        const reelsCenterY = this.cameras.main.centerY - 75;
        const stopDurationBase = 960;
        const reelDelay = 180;
        const stepY = this.symbolHeight + this.symbolPaddingY;
    
        let finalStopIndexes = [];
        // ... (Loop for para gerar finalStopIndexes como antes)...
         for (let i = 0; i < this.numReels; i++) {
             const buffer = this.visibleRows;
             if (!this.reelSymbolStrips[i] || this.reelSymbolStrips[i].length <= buffer * 2) {
                 console.error(`Invalid reel strip for reel ${i}.`);
                 finalStopIndexes[i] = 0;
             } else {
                  const stripLength = this.reelSymbolStrips[i].length;
                  finalStopIndexes[i] = Phaser.Math.RND.between(buffer, stripLength - 1 - buffer);
             }
         }
        console.log('Spin Start: Random stop indexes determined:', finalStopIndexes);
        const finalStopIndexesCopy = [...finalStopIndexes];
    
        // --- Iniciar Animações de Parada (Versão Estável) ---
        console.log('%cSpin Start: Starting final position tweens...', "color: blue;");
        let tweensCompleted = 0;
    
        for (let i = 0; i < this.numReels; i++) {
            const targetStopIndex = finalStopIndexes[i];
            const reelContainer = this.reels[i];
    
            if (!reelContainer) {
                console.error(`Spin Error: Invalid reel container for reel ${i}`);
                tweensCompleted++;
                 if (tweensCompleted === this.numReels) { this.isSpinning = false; }
                continue;
            }
    
            // Calcula Posição Final
            const finalContainerY = reelsCenterY - (targetStopIndex * stepY);
            const tweenDuration = stopDurationBase + i * reelDelay;
    
            // Log Detalhado Antes do Tween
            console.log(`Reel ${i+1}: PRE-TWEEN State - CurrentY=${reelContainer.y.toFixed(2)}`);
            console.log(`Reel ${i+1}: PRE-TWEEN Calc - TargetY=${finalContainerY.toFixed(2)}, Duration=${tweenDuration}, Ease=Expo.easeOut, Delay=${i * 100}`);
    
            // Cria a Animação (Tween) Direta para o Ponto Final
            this.tweens.add({
                targets: reelContainer,
                y: finalContainerY,
                duration: tweenDuration,
                ease: 'Expo.easeOut',
                delay: i * 100,
                onComplete: () => {
                    tweensCompleted++;
                    console.log(`%cReel ${i + 1}: STOPPED at Y=${reelContainer.y.toFixed(2)} (Target index: ${targetStopIndex}) - (${tweensCompleted}/${this.numReels})`, "color: green;");
                    console.log(`%cReel ${i + 1}: POST-TWEEN State - Alpha=${reelContainer.alpha}, Visible=${reelContainer.visible}`, "color: green;");
    
                    // Verifica se TODOS os tweens terminaram
                    if (tweensCompleted === this.numReels) {
                        console.log('%c--- All reels stopped! ---', "color: blue; font-weight: bold;");
    
                        // Verifica Ganhos PASSANDO A APOSTA ATUAL
                        let totalWin = 0;
                        try {
                            // Lê a aposta atual do registry novamente para garantir
                            let betForWinCheck = this.registry.get('currentBet') ?? 1;
                            totalWin = this.checkWins(finalStopIndexesCopy, betForWinCheck); // <<< PASSA APOSTA
                        } catch (winError) {
                            console.error("Error during checkWins:", winError);
                        }
                        // A lógica de adicionar ganhos ao saldo foi movida para DENTRO de checkWins
    
                        // --- Reabilitar o Botão e Resetar Flag ---
                        console.log('%cSpin Complete: Attempting to re-enable spin button and reset flag...', "color: blue;");
                        // Busca a referência da UIScene novamente por segurança
                        const finalUiScene = this.scene.get('UIScene');
                        if (finalUiScene && typeof finalUiScene.enableSpinButton === 'function') {
                            finalUiScene.enableSpinButton();
                        } else {
                             console.warn('GameScene: Could not get UIScene or enableSpinButton function on final complete.');
                        }
                        this.isSpinning = false;
                        console.log(`%cSpin Complete: Flag set to ${this.isSpinning}`, "color: blue;");
                        // --- Fim Reabilitar / Resetar ---
                    }
                },
                onCompleteScope: this
            });
        } // Fim do loop for
    }
    // --- FIM DO MÉTODO startSpin ---

    update(time, delta) {
        // O loop de jogo principal (executa a cada frame)
        // console.log('GameScene: update()'); // Descomente para ver o log a cada frame
    }
}