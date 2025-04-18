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
        // const scatterSymbolKey = 'symbol_scatter'; // Chave do Scatter

        // 1. Construir a grade 5x3 visível (como antes)
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
            const indexRow0 = (stopIndex - 1 + strip.length) % strip.length;
            const indexRow1 = stopIndex;
            const indexRow2 = (stopIndex + 1) % strip.length;
            visibleSymbolGrid[i][0] = strip[indexRow0];
            visibleSymbolGrid[i][1] = strip[indexRow1];
            visibleSymbolGrid[i][2] = strip[indexRow2];
        }
        console.log('Visible Grid for Win Check:\n',
            `[${visibleSymbolGrid[0].join(',')}]\n`,
            `[${visibleSymbolGrid[1].join(',')}]\n`,
            `[${visibleSymbolGrid[2].join(',')}]\n`,
            `[${visibleSymbolGrid[3].join(',')}]\n`,
            `[${visibleSymbolGrid[4].join(',')}]`);

        // 2. Inicializar ganhos
        let totalWin = 0;
        let winningLinesInfo = []; // Para guardar detalhes

        // --- LÓGICA PRINCIPAL DE VERIFICAÇÃO ---

        // 3. Iterar sobre cada PAYLINE
        for (let lineIndex = 0; lineIndex < PAYLINES.length; lineIndex++) {
            const currentPayline = PAYLINES[lineIndex]; // Pega definição da linha (ex: [1,1,1,1,1])
            let lineSymbols = []; // Símbolos nesta linha específica

            // Coleta os símbolos da payline atual
            for (let reelIndex = 0; reelIndex < this.numReels; reelIndex++) {
                const rowIndex = currentPayline[reelIndex];
                lineSymbols.push(visibleSymbolGrid[reelIndex][rowIndex]);
            }

            // 4. Verifica combinações da esquerda para a direita
            let firstSymbol = lineSymbols[0];
            let paySymbol = firstSymbol; // Símbolo que definirá o pagamento
            let matchCount = 0;

            // Ignora se a linha começar com null (erro na construção da grade)
            if (firstSymbol === null) continue;

            // Lógica para Wild no início: define paySymbol como o primeiro NÃO-WILD
            if (firstSymbol === wildSymbolKey) {
                matchCount = 1; // O primeiro Wild já conta como 1
                for (let k = 1; k < lineSymbols.length; k++) {
                    if (lineSymbols[k] !== wildSymbolKey) {
                        paySymbol = lineSymbols[k]; // Encontrou o símbolo base
                        break;
                    }
                    matchCount++; // Conta Wilds consecutivos
                }
                // Se a linha inteira for de Wilds, paySymbol permanece wildSymbolKey
                // (Verifique se 'symbol_wild' tem entrada na PAYTABLE nesse caso)
            } else {
                paySymbol = firstSymbol; // O primeiro símbolo é a base
            }

            // Se o símbolo base não paga (não está na PAYTABLE, exceto talvez o Wild), pula linha
            if (!PAYTABLE[paySymbol]) {
                // console.log(`Payline ${lineIndex + 1}: Symbol ${paySymbol} has no payout defined.`);
                continue;
            }

            // Se não começou com Wild, o primeiro símbolo já conta como 1 match se for válido
            if (firstSymbol !== wildSymbolKey) {
                matchCount = 1;
            }

            // Continua a contagem a partir do segundo símbolo (ou do primeiro não-wild)
            for (let i = matchCount; i < lineSymbols.length; i++) {
                if (lineSymbols[i] === paySymbol || lineSymbols[i] === wildSymbolKey) {
                    matchCount++;
                } else {
                    break; // Combinação quebrada
                }
            }

            // 5. Calcula o ganho se houver 3 ou mais correspondências
            if (matchCount >= 3) {
                // PAYTABLE geralmente tem [pagamento_para_3, pagamento_para_4, pagamento_para_5]
                // O índice é matchCount - 3
                const payoutIndex = matchCount - 3;
                const payoutMultiplier = (PAYTABLE[paySymbol] && PAYTABLE[paySymbol].length > payoutIndex)
                                        ? PAYTABLE[paySymbol][payoutIndex]
                                        : 0; // Retorna 0 se não houver entrada

                if (payoutMultiplier > 0) {
                    // --- IMPORTANTE: Cálculo do Ganho Real ---
                    // Por enquanto, estamos apenas somando os multiplicadores.
                    // O ideal é multiplicar pela aposta POR LINHA.
                    // Precisamos obter o valor da aposta aqui.
                    // Vamos usar um valor fixo de 1 por enquanto como placeholder.
                    const betPerLine = 1; // <<< PLACEHOLDER - PRECISA SER DEFINIDO CORRETAMENTE
                    const lineWin = payoutMultiplier * betPerLine;
                    // --- FIM IMPORTANTE ---

                    totalWin += lineWin;
                    console.log(`%cWIN!%c Payline ${lineIndex + 1}, Symbol: ${paySymbol}, Count: ${matchCount}, Payout: ${lineWin} (Multiplier: ${payoutMultiplier})`, 'color: green; font-weight: bold;', 'color: inherit;');
                    winningLinesInfo.push({ line: lineIndex + 1, symbol: paySymbol, count: matchCount, amount: lineWin });
                }
            }
        } // Fim do loop de Paylines

        // --- TODO: Adicionar Verificação de Scatters (se aplicável) ---

        console.log('Winning Lines Info:', winningLinesInfo);
        console.log(`Total Win Calculated (sum of multipliers for now): ${totalWin}`);

        // TODO: Atualizar saldo (localmente e via IPC) se totalWin > 0
        // TODO: Mostrar animação de vitória / valor ganho na UI

        return totalWin;
    }
    // --- FIM DO MÉTODO checkWins ---

    // Modifique o startSpin para passar os índices finais para checkWins
    // (Nenhuma mudança necessária aqui se checkWins já estava sendo chamado corretamente)
    startSpin() {
        // ... (código como na Ação 57, garantindo que onComplete chama checkWins) ...
        // Exemplo da chamada dentro do onComplete do último tween:
        // onComplete: () => {
        //    ...
        //    if (i === this.numReels - 1) {
        //        console.log('--- All reels stopped! ---');
        //        this.checkWins(finalStopIndexesCopy); // Passa os índices finais
        //        // TODO: Reabilitar botão...
        //    }
        // },
        // onCompleteScope: this
        // ...
    }

    startSpin() {
        console.log('--- GameScene: startSpin() called! ---');
        // Use o offset Y final que você definiu em createReels (ex: -75)
        const reelsCenterY = this.cameras.main.centerY - 75;

        // TODO: Lógica de custo da aposta e verificação de saldo...
        // TODO: Desabilitar botão de Spin na UIScene...

        // 1. Gerar os índices de parada finais aleatórios
        let finalStopIndexes = [];
        for (let i = 0; i < this.numReels; i++) {
            const buffer = this.visibleRows;
            const stripLength = this.reelSymbolStrips[i].length;
            finalStopIndexes[i] = Phaser.Math.RND.between(buffer, stripLength - 1 - buffer);
        }
        console.log('Random stop indexes determined:', finalStopIndexes);

        // 2. Configurações da Animação de PARADA
        const stopDurationBase = 960;  // Duração da animação de DESACELERAÇÃO (ajuste!)
        const reelDelay = 180;        // Atraso entre as paradas das colunas
        const startOffsetSymbols = 15; // Quantos símbolos "acima" do ponto final a animação vai começar (simula vindo de um giro)
        const stepY = this.symbolHeight + this.symbolPaddingY;

        // Copie os índices finais para usar no onComplete
        const finalStopIndexesCopy = [...finalStopIndexes]; // Copia para evitar problemas de closure/timing

        console.log('Starting stopping tweens...');
        for (let i = 0; i < this.numReels; i++) {
            const targetStopIndex = finalStopIndexes[i];
            const reelContainer = this.reels[i];

            if (!reelContainer) {
                console.error(`Error: Invalid reel container for reel ${i}`);
                continue;
            }

            // Posição Y final REAL onde o container deve parar
            const finalContainerY = reelsCenterY - (targetStopIndex * stepY);

            // Calcula a posição Y inicial para a animação de parada
            const startTweenY = finalContainerY - (startOffsetSymbols * stepY);

            // --- Define a Posição Inicial INSTANTANEAMENTE ---
            reelContainer.y = startTweenY;
            // --------------------------------------------------

            // Duração da animação de parada
            const tweenDuration = stopDurationBase + i * reelDelay;

            console.log(`Reel <span class="math-inline">\{i\+1\}\: Setting start Y\=</span>{startTweenY.toFixed(2)}, tweening to Final Y=${finalContainerY.toFixed(2)} (Index: ${targetStopIndex})`);

            // --- Cria a Animação (Tween) de Parada ---
            this.tweens.add({
                targets: reelContainer,
                y: finalContainerY,         // Anima PARA a posição final correta
                duration: tweenDuration,
                ease: 'Expo.easeOut',       // Easing de desaceleração forte (experimente 'Back.easeOut', 'Circ.easeOut')
                delay: i * 100,             // Atraso para iniciar a animação de parada
                onComplete: () => {
                    // Log final - não precisa mais de snap
                    console.log(`Reel <span class="math-inline">\{i \+ 1\} stopped at Y\=</span>{reelContainer.y.toFixed(2)} (Target index: ${targetStopIndex})`);

                    if (i === this.numReels - 1) {
                        console.log('--- All reels stopped! ---');
                        // --- CHAMADA PARA checkWins ---
                        this.checkWins(finalStopIndexesCopy); // Passa os índices finais
                        // --- FIM DA CHAMADA ---
        
                        // TODO: Reabilitar o botão de Spin na UIScene
                    }
                },
                onCompleteScope: this
            });
        } // Fim do loop for
    }

    update(time, delta) {
        // O loop de jogo principal (executa a cada frame)
        // console.log('GameScene: update()'); // Descomente para ver o log a cada frame
    }
}