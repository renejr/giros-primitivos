// src/scenes/UIScene.js

export default class UIScene extends Phaser.Scene {

    constructor() {
        super({ key: 'UIScene', active: true });
        this.balanceText = null;
        this.betText = null; // Mantenha como null inicialmente
        this.playerProfile = null;
        this.spinButton = null;

        // --- ADICIONADO: Controle de Aposta ---
        this.currentBet = 1.00; // Valor inicial padrão ou mínimo
        this.minBet = 1.00;     // Aposta mínima permitida
        this.maxBet = 10.00;    // Aposta máxima permitida (ajuste!)
        this.betStep = 1.00;    // Quanto a aposta aumenta/diminui por clique (ajuste!)
        this.betPlusButton = null;
        this.betMinusButton = null;
        
        this.balanceText = null; // Inicializa
        this.betText = null;
        this.playerProfile = null;
        this.spinButton = null;
        this.betPlusButton = null;
        this.betMinusButton = null;
        // Definir min/max/step aqui ou buscar de config
        this.minBet = 1.00;
        this.maxBet = 10.00;
        this.betStep = 1.00;

        this.winText = null;
    }

    preload() {
        console.log('UIScene: preload()');
        // Carregar assets da UI...
    }

    showWinText(amount) {
        // Só executa se o objeto de texto existir
        if (!this.winText) return;

        console.log(`UIScene: Received 'winAnnounced' event with amount: ${amount}`);
        if (amount > 0) {
            const formattedWin = amount.toFixed(2);
            this.winText.setText(`Ganhou: $${formattedWin}`);
            this.winText.setVisible(true); // Torna visível

            // Remove qualquer timer anterior para esconder (caso haja cliques rápidos)
            if (this.winTextTimer) {
                this.winTextTimer.remove(false);
            }

            // Esconde o texto após alguns segundos (ex: 3000ms = 3 segundos)
            this.winTextTimer = this.time.delayedCall(3000, () => {
                if (this.winText) { // Verifica se ainda existe antes de esconder
                    this.winText.setVisible(false);
                    console.log("UIScene: Hiding win text.");
                }
            }, [], this);
        } else {
            // Garante que está escondido se o ganho for 0 (não deve ser chamado, mas por segurança)
            this.winText.setVisible(false);
        }
    }

    updateBalanceDisplay(newBalance) {
        // Se newBalance não for fornecido, tenta pegar do registry
        const balanceToShow = newBalance !== undefined ? newBalance : this.registry.get('balance');
        if (this.balanceText && balanceToShow !== undefined) {
           const formattedBalance = parseFloat(balanceToShow).toFixed(2);
           this.balanceText.setText(`Saldo: $${formattedBalance}`);
           console.log(`UIScene: Balance display updated to ${formattedBalance}`);
       } else if(this.balanceText) {
            console.warn("UIScene: Balance text object exists, but no balance value found to update.");
            this.balanceText.setText('Saldo: ---.--');
       }
   }

    updateBetDisplay() {
        const currentBet = this.registry.get('currentBet'); // Lê do registry
        if (this.betText && currentBet !== undefined) {
           const formattedBet = currentBet.toFixed(2);
           this.betText.setText(`Aposta: $${formattedBet}`);
           console.log(`UIScene: Bet display updated to ${formattedBet}`);
       } else if (this.betText) {
           console.warn("UIScene: Bet text object exists, but no currentBet value found to update.");
           this.betText.setText('Aposta: ---.--');
       }
   }

    async create() {
        console.log('UIScene: create()');

        this.balanceText = this.add.text(
            50, 30, 'Saldo: Carregando...',
            { 
                fontSize: '24px', 
                fill: '#FFFFFF', 
                fontStyle: 'bold', 
                fontWeight: '900',
                backgroundColor: '#333333',
                padding: { x: 10, y: 5 }
            }
        ).setAlpha(0.9);

        // Texto Aposta (como antes)
        this.betText = this.add.text(
            this.cameras.main.width - 50, 30, 'Aposta: Carregando...',
            { 
                fontSize: '24px', 
                fill: '#FFFFFF', 
                fontStyle: 'bold', 
                fontWeight: '900',
                backgroundColor: '#333333',
                padding: { x: 10, y: 5 }
            }
        ).setOrigin(1, 0).setAlpha(0.9);

        // --- Busca Dados Iniciais e Atualiza Aposta ---
        console.log('UIScene: Requesting profile data via electronAPI...');
        try {
            if (window.electronAPI && typeof window.electronAPI.getProfile === 'function') {
                this.playerProfile = await window.electronAPI.getProfile();
                console.log('UIScene: Profile data received:', this.playerProfile);

                if (this.playerProfile) {
                    // --- Inicializa Registry e UI ---
                    let initialBet = parseFloat(this.playerProfile.last_bet) || this.minBet;
                    initialBet = Math.max(initialBet, this.minBet);
                    initialBet = Math.min(initialBet, this.maxBet);

                    let initialBalance = parseFloat(this.playerProfile.balance) || 0;
                    this.registry.set('balance', initialBalance);
                    this.registry.set('currentBet', initialBet);

                    // Atualiza displays iniciais
                    this.updateBalanceDisplay(); // <<< CHAMA FUNÇÃO PARA SALDO
                    this.updateBetDisplay();
                    // --- Fim Inicializa ---
                } else {
                    console.error('UIScene: Failed to retrieve profile data (null received).');
                    if(this.balanceText) this.balanceText.setText('Saldo: Erro'); // <<< ATUALIZA SE balanceText EXISTIR
                    if(this.betText) this.betText.setText('Aposta: Erro');
                }
            } else {
                console.error('UIScene: window.electronAPI or getProfile not found!');
                 // Usar this. apenas se balanceText existir
                 // if(this.balanceText) this.balanceText.setText('Saldo: API Error');
                 if(this.betText) this.betText.setText('Aposta: API Error');
            }
        } catch (error) {
            console.error('UIScene: Error calling getProfile:', error);
             // Usar this. apenas se balanceText existir
             // if(this.balanceText) this.balanceText.setText('Saldo: Erro');
             if(this.betText) this.betText.setText('Aposta: Erro');
        }

        // --- Adicionar Botões + / - (Listeners agora atualizam Registry e chamam IPC) ---
        const buttonSize = 64;
        const buttonPadding = 10;
        // Recalcula bounds APÓS definir a posição Y do texto
        const betTextBounds = this.betText.getBounds();
        // Esta linha usa betTextBounds.bottom, que agora será menor devido ao Y=30
        const betButtonsY = betTextBounds.bottom + buttonPadding + (buttonSize / 2);
        const plusButtonX = betTextBounds.right - (buttonSize / 2) - buttonPadding;
        const minusButtonX = plusButtonX - buttonSize - buttonPadding;
        const maxBetButtonX = plusButtonX - (buttonSize / 2); // Ex: Alinhado horizontalmente entre +/-
        const maxBetButtonY = betButtonsY + buttonSize + buttonPadding; // Abaixo dos botões +/-

        // Tenta calcular uma posição Y abaixo dos reels
        // Valores baseados nas props da GameScene (idealmente viriam de config)
        const gameHeight = this.cameras.main.height;
        const reelCenterY_approx = gameHeight / 2 - 75; // Offset usado na GameScene
        const symbolTotalHeight = 150 + 15; // symbolHeight + symbolPaddingY
        const visibleRows = 3;
        const reelBlockBottom = reelCenterY_approx + (visibleRows / 2) * symbolTotalHeight; // Aproxima a borda inferior
        const winTextY = reelBlockBottom + 70; // Posição abaixo (ajuste este offset de 70)

        this.winText = this.add.text(
            this.cameras.main.centerX, // Centralizado horizontalmente
            winTextY,                  // Posição vertical abaixo dos reels (ajuste fino!)
            '',                        // Texto inicial vazio
            {
                fontSize: '36px',      // Fonte maior
                fill: '#FFD700',       // Cor amarelo-ouro
                fontStyle: 'bold',
                stroke: '#000000',     // Contorno preto
                strokeThickness: 4,
                align: 'center'        // Alinha texto no centro (caso tenha múltiplas linhas)
            }
        ).setOrigin(0.5)              // Origem no centro do texto
         .setDepth(10)                // Garante que fique sobre outros elementos da UI se necessário
         .setVisible(false); 

        this.maxBetButton = this.add.image(maxBetButtonX, maxBetButtonY, 'maxBetButton')
            // .setDisplaySize(100, 50) // Ajuste tamanho se necessário
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

            this.maxBetButton.on('pointerdown', () => {
                console.log("Max Bet button clicked!");
                // Define a aposta atual para a aposta máxima definida na cena
                this.registry.set('currentBet', this.maxBet);
                // Atualiza o display de texto da aposta
                this.updateBetDisplay();
                // Efeito visual
                this.maxBetButton.setAlpha(0.7);
                // Salva no DB (opcionalmente, igual aos botões +/-)
                if (window.electronAPI?.updateProfile) {
                    window.electronAPI.updateProfile({ last_bet: this.maxBet })
                        .then(success => console.log('UIScene: MAX BET (last_bet) update sent to DB:', success))
                        .catch(err => console.error('UIScene: Error sending MAX BET (last_bet) update:', err));
                }
            });
            this.maxBetButton.on('pointerup', () => { this.maxBetButton.setAlpha(1.0); });
            this.maxBetButton.on('pointerout', () => { this.maxBetButton.setAlpha(1.0); });

        // Botão Menos (-)
        this.betMinusButton = this.add.image(minusButtonX, betButtonsY, 'betMinusButton') /* ... setDisplaySize, etc ... */ .setInteractive();
        this.betMinusButton.on('pointerdown', () => {
            let currentBet = this.registry.get('currentBet'); // Lê do registry
            currentBet -= this.betStep;
            currentBet = Math.max(currentBet, this.minBet);
            this.registry.set('currentBet', currentBet); // Salva no registry
            this.updateBetDisplay(); // Atualiza texto
            this.betMinusButton.setAlpha(0.7);
            // Salva no DB
            if (window.electronAPI?.updateProfile) {
                 window.electronAPI.updateProfile({ last_bet: currentBet })
                      .then(success => console.log('UIScene: last_bet update sent to DB:', success))
                      .catch(err => console.error('UIScene: Error sending last_bet update:', err));
            }
        });
        this.betMinusButton.on('pointerup', () => { this.betMinusButton.setAlpha(1); });
        this.betMinusButton.on('pointerout', () => { this.betMinusButton.setAlpha(1); });

        // Botão Mais (+)
        this.betPlusButton = this.add.image(plusButtonX, betButtonsY, 'betPlusButton') /* ... setDisplaySize, etc ... */ .setInteractive();
        this.betPlusButton.on('pointerdown', () => {
            let currentBet = this.registry.get('currentBet'); // Lê do registry
            currentBet += this.betStep;
            currentBet = Math.min(currentBet, this.maxBet);
            this.registry.set('currentBet', currentBet); // Salva no registry
            this.updateBetDisplay(); // Atualiza texto
            this.betPlusButton.setAlpha(0.7);
            // Salva no DB
             if (window.electronAPI?.updateProfile) {
                 window.electronAPI.updateProfile({ last_bet: currentBet })
                      .then(success => console.log('UIScene: last_bet update sent to DB:', success))
                      .catch(err => console.error('UIScene: Error sending last_bet update:', err));
            }
        });
        this.betPlusButton.on('pointerup', () => { this.betPlusButton.setAlpha(1); });
        this.betPlusButton.on('pointerout', () => { this.betPlusButton.setAlpha(1); });
        // --- Fim Botões + / - ---

        // --- Adicionar Botão de Spin ---
        const spinButtonX = this.cameras.main.width - 110;  // Sua posição X ajustada
        const spinButtonY = this.cameras.main.height - 160; // Sua posição Y ajustada
        this.spinButton = this.add.image(spinButtonX, spinButtonY, 'spinButton')
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        // Listeners do botão Spin (como antes)
        this.spinButton.on('pointerdown', () => {
             this.spinButton.setAlpha(0.7);
             
             if (this.winText && this.winText.visible) {
                this.winText.setVisible(false);
                if (this.winTextTimer) { // Cancela o timer se ainda estiver ativo
                   this.winTextTimer.remove(false);
                }
                console.log("UIScene: Hiding previous win text on new spin.");
            }
            const gameScene = this.scene.get('GameScene');
            if (gameScene && this.spinButton.input?.enabled && !gameScene.isSpinning) {
                gameScene.startSpin();
            } else if(!gameScene) {
                console.error("UIScene: Could not find GameScene to start spin!");
            }
        });
        this.spinButton.on('pointerup', () => {
             if (this.spinButton.input?.enabled) { this.spinButton.setAlpha(1); }
        });
        this.spinButton.on('pointerout', () => {
             if (this.spinButton.input?.enabled) { this.spinButton.setAlpha(1); }
        });
         // --- Fim Botão Spin ---

         const gameSceneRefForBalance = this.scene.get('GameScene'); // Renomeado para clareza
         if(gameSceneRefForBalance) {
            gameSceneRefForBalance.events.on('balanceUpdated', this.updateBalanceDisplay, this);
             console.log("UIScene: Listener for 'balanceUpdated' event added.");
         } else {
            // Tenta de novo um pouco depois se a GameScene não estiver pronta imediatamente
            this.time.delayedCall(500, () => {
                 const gameSceneRetry = this.scene.get('GameScene');
                 if(gameSceneRetry) {
                     gameSceneRetry.events.on('balanceUpdated', this.updateBalanceDisplay, this);
                     console.log("UIScene: Listener for 'balanceUpdated' event added (on retry).");
                 } else {
                     console.error("UIScene: Could not find GameScene to add balance listener.");
                 }
            });
        }

        const gameSceneRefForWin = this.scene.get('GameScene'); // Renomeado para clareza
         if(gameSceneRefForWin) {
            gameSceneRefForWin.events.on('winAnnounced', this.showWinText, this); // <<< Ouve o novo evento
             console.log("UIScene: Listener for 'winAnnounced' event added.");
         } else {
            // Tenta de novo um pouco depois se a GameScene não estiver pronta imediatamente
            this.time.delayedCall(500, () => {
                const gameSceneRetry = this.scene.get('GameScene');
                if(gameSceneRetry) {
                    gameSceneRetry.events.on('balanceUpdated', this.updateBalanceDisplay, this);
                    console.log("UIScene: Listener for 'balanceUpdated' event added (on retry).");
                } else {
                    console.error("UIScene: Could not find GameScene to add balance listener.");
                }
           });
         }

    } 
    
    enableSpinButton() {
        if (this.spinButton) {
            console.log("UIScene: Enabling Spin Button (setInteractive)"); // Log
            this.spinButton.setInteractive({ useHandCursor: true });
            this.spinButton.setAlpha(1.0);
        }
    }
    disableSpinButton() {
        if (this.spinButton) {
            console.log("UIScene: Disabling Spin Button (disableInteractive)"); // Log
            this.spinButton.disableInteractive();
            this.spinButton.setAlpha(0.5);
        }
    }
}