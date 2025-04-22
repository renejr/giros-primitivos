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
    checkWins(finalStopIndexes, currentBet) { // <<< ACEITA currentBet COMO PARÂMETRO
        console.log(`--- GameScene: checkWins() called with Bet: ${currentBet} ---`);
        const wildSymbolKey = 'symbol_wild';
    
        // 1. Construir a grade visível (como antes, com verificações)
        let visibleSymbolGrid = [];
        // ... (código idêntico ao anterior para construir visibleSymbolGrid a partir de finalStopIndexes) ...
        for (let i = 0; i < this.numReels; i++) {
            visibleSymbolGrid[i] = [];
            const stopIndex = finalStopIndexes[i];
            const strip = this.reelSymbolStrips[i];
            if (!strip || stopIndex === undefined || stopIndex < 0 || stopIndex >= strip.length) {
                 console.error(`Invalid stopIndex (${stopIndex}) or strip for reel ${i} in checkWins`);
                 visibleSymbolGrid[i] = [null, null, null];
                 continue;
            }
            const indexRow0 = (stopIndex - 1 + strip.length) % strip.length;
            const indexRow1 = stopIndex;
            const indexRow2 = (stopIndex + 1) % strip.length;
            visibleSymbolGrid[i][0] = strip[indexRow0];
            visibleSymbolGrid[i][1] = strip[indexRow1];
            visibleSymbolGrid[i][2] = strip[indexRow2];
        }
        console.log('Visible Grid for Win Check:');
        // ... (log formatado da grade como antes) ...
         for (let r = 0; r < this.visibleRows; r++) {
             let rowStr = "";
             for (let c = 0; c < this.numReels; c++) {
                 rowStr += (visibleSymbolGrid[c][r] || 'NULL').padEnd(20);
             }
             console.log(`[${rowStr}]`);
        }
    
        // 2. Inicializar ganhos
        let totalWin = 0;
        let winningLinesInfo = [];
    
        // --- CÁLCULO DA APOSTA POR LINHA ---
        // Assume que currentBet é a APOSTA TOTAL. Dividimos pelo nº de linhas ativas.
        // Se PAYLINES estiver vazio, usamos a aposta total como aposta por linha (ou erro).
        const numberOfPaylines = PAYLINES.length > 0 ? PAYLINES.length : 1;
        const betPerLine = currentBet / numberOfPaylines; // <<< USA O currentBet PASSADO
        console.log(`Bet per line used for calculation: ${betPerLine.toFixed(2)} (Total Bet: ${currentBet})`);
        // --- FIM CÁLCULO APOSTA ---
    
        // 3. Iterar sobre cada PAYLINE (lógica como antes)
        for (let lineIndex = 0; lineIndex < PAYLINES.length; lineIndex++) {
            // ... (lógica como antes para pegar lineSymbols, paySymbol, matchCount incluindo Wilds) ...
            const currentPayline = PAYLINES[lineIndex];
            let lineSymbols = [];
            for (let reelIndex = 0; reelIndex < this.numReels; reelIndex++) {
                 if(reelIndex < currentPayline.length){
                     const rowIndex = currentPayline[reelIndex];
                     lineSymbols.push(visibleSymbolGrid[reelIndex][rowIndex]);
                 } else { lineSymbols.push(null); }
            }
            let firstSymbol = lineSymbols[0];
            if (firstSymbol === null) continue;
            let paySymbol = firstSymbol;
            let matchCount = 0;
            if (firstSymbol === wildSymbolKey) {
                matchCount = 1;
                for (let k = 1; k < this.numReels; k++) {
                     if(lineSymbols[k] === null) break;
                     if (lineSymbols[k] !== wildSymbolKey) { paySymbol = lineSymbols[k]; break; }
                     matchCount++;
                }
                 if (matchCount === this.numReels) paySymbol = wildSymbolKey;
            } else { paySymbol = firstSymbol; }
            if (!PAYTABLE[paySymbol]) { continue; }
            matchCount = 0;
            for (let i = 0; i < this.numReels; i++) {
                 if (lineSymbols[i] === null) break;
                 if (lineSymbols[i] === paySymbol || lineSymbols[i] === wildSymbolKey) { matchCount++; }
                 else { break; }
            }
    
    
            // 5. Calcula o ganho se houver 3 ou mais, USANDO betPerLine
            if (matchCount >= 3) {
                const payoutIndex = matchCount - 3;
                const payoutMultiplier = (PAYTABLE[paySymbol] && PAYTABLE[paySymbol].length > payoutIndex)
                                         ? PAYTABLE[paySymbol][payoutIndex]
                                         : 0;
                if (payoutMultiplier > 0) {
                    // --- USA betPerLine REAL ---
                    const lineWin = payoutMultiplier * betPerLine;
                    // --- FIM ---
                    totalWin += lineWin;
                    console.log(`%cWIN!%c Payline ${lineIndex + 1} ([${currentPayline.join(',')}]), Symbol: ${paySymbol}, Count: ${matchCount}, Payout: ${lineWin.toFixed(2)} (Multiplier: ${payoutMultiplier})`, 'color: green; font-weight: bold;', 'color: inherit;');
                    winningLinesInfo.push({ line: lineIndex + 1, symbol: paySymbol, count: matchCount, amount: lineWin });
                }
            }
        } // Fim do loop de Paylines
    
        // --- TODO: Verificação de Scatters ---
    
        console.log('Winning Lines Info:', winningLinesInfo);
        console.log(`Total Win Calculated: ${totalWin.toFixed(2)}`);
    
        // --- Adicionar Ganhos ao Saldo ---
        if (totalWin > 0) {
            let currentBalance = this.registry.get('balance') || 0; // Pega do registry
            currentBalance += totalWin;
            this.registry.set('balance', currentBalance); // Atualiza registry
            console.log(`Win amount ${totalWin.toFixed(2)} added. New balance (local): ${currentBalance.toFixed(2)}`);
            // Salva o novo saldo no DB via IPC
            if (window.electronAPI?.updateProfile) {
                window.electronAPI.updateProfile({ balance: currentBalance })
                    .then(success => console.log('GameScene: Balance update (after win) sent to DB:', success))
                    .catch(err => console.error('GameScene: Error sending balance update (after win):', err));
            }
            // Emite evento para UI atualizar o saldo APÓS adicionar ganho
            this.events.emit('balanceUpdated', currentBalance);
        }
        // --- Fim Adicionar Ganhos ---
    
    
        return totalWin; // Retorna o valor numérico do ganho
    }
    // --- FIM DO MÉTODO checkWins ---

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
    
        // --- Desabilitar o Botão na UI ---
        const uiScene = this.scene.get('UIScene');
        if (uiScene && typeof uiScene.disableSpinButton === 'function') {
            uiScene.disableSpinButton();
        } else {
            console.warn('GameScene: Could not get UIScene or disableSpinButton function.');
        }
    
        // --- Ler Aposta e Saldo do Registry ---
        let currentBet = this.registry.get('currentBet');
        let balance = this.registry.get('balance');
    
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