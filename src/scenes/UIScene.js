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
        // --- FIM DA ADIÇÃO ---
    }

    preload() {
        console.log('UIScene: preload()');
        // Carregar assets da UI...
    }

    // --- NOVO MÉTODO: Atualizar Texto da Aposta ---
    updateBetDisplay() {
        if (this.betText) {
            // Formata para ter sempre 2 casas decimais
            const formattedBet = this.currentBet.toFixed(2);
            this.betText.setText(`Aposta: $${formattedBet}`);
             console.log(`UIScene: Bet display updated to ${formattedBet}`);
        } else {
             console.warn("UIScene: Bet text object not available to update.");
        }
    }

    // Cole este método COMPLETO no lugar do seu create() atual em UIScene.js
    async create() {
        console.log('UIScene: create()');

        // --- Cria e Posiciona Texto da Aposta ---
        // (Texto do Saldo ainda comentado, você pode reativar quando quiser)
        /*
        this.balanceText = this.add.text(
            50, 50, 'Saldo: Carregando...',
            { fontSize: '24px', fill: '#fff', fontStyle: 'bold' }
        );
        */
        this.betText = this.add.text(
            this.cameras.main.width - 50, // Alinhado à direita com padding
            50,                          // Posição Y no topo
            'Aposta: Carregando...',     // Texto inicial
            { fontSize: '24px', fill: '#fff', fontStyle: 'bold' }
        ).setOrigin(1, 0); // Origem no canto SUPERIOR DIREITO do texto

        // --- Busca Dados Iniciais e Atualiza Aposta ---
        console.log('UIScene: Requesting profile data via electronAPI...');
        try {
            if (window.electronAPI && typeof window.electronAPI.getProfile === 'function') {
                this.playerProfile = await window.electronAPI.getProfile();
                console.log('UIScene: Profile data received:', this.playerProfile);

                if (this.playerProfile) {
                    // Inicializa a aposta atual
                    this.currentBet = parseFloat(this.playerProfile.last_bet) || this.minBet;
                    this.currentBet = Math.max(this.currentBet, this.minBet);
                    this.currentBet = Math.min(this.currentBet, this.maxBet);
                    this.updateBetDisplay(); // Atualiza o texto da aposta com valor inicial

                    // TODO: Atualizar texto do saldo quando reativado
                    // if (this.balanceText) { /* ... código para atualizar saldo ... */ }

                } else {
                    console.error('UIScene: Failed to retrieve profile data (null received).');
                    if(this.balanceText) this.balanceText.setText('Saldo: Erro');
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

        // --- Adicionar Botões de Ajuste de Aposta (+ / -) ---
        const buttonSize = 64; // Usando 64x64 como sugerido (ajuste se usar outro tamanho)
        const buttonPadding = 10; // Espaço entre botões e texto

        // Calcula limites do texto APÓS ele ter sido potencialmente atualizado
        const betTextBounds = this.betText.getBounds();

        // --- Coordenadas CORRIGIDAS (Abaixo do Texto) ---
        const betButtonsY = betTextBounds.bottom + buttonPadding + (buttonSize / 2);
        // Posiciona o botão '+' um pouco à esquerda da borda direita do texto
        const plusButtonX = betTextBounds.right - (buttonSize / 2) - buttonPadding;
        // Posiciona o botão '-' à esquerda do '+'
        const minusButtonX = plusButtonX - buttonSize - buttonPadding;
        // --- Fim Coordenadas Corrigidas ---

        // Botão Menos (-)
        this.betMinusButton = this.add.image(minusButtonX, betButtonsY, 'betMinusButton')
            .setDisplaySize(buttonSize, buttonSize)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        this.betMinusButton.on('pointerdown', () => {
            this.currentBet -= this.betStep;
            this.currentBet = Math.max(this.currentBet, this.minBet); // Garante mínimo
            this.updateBetDisplay(); // Atualiza o texto
            this.betMinusButton.setAlpha(0.7);
            // TODO: Salvar last_bet no DB
        });
        this.betMinusButton.on('pointerup', () => { this.betMinusButton.setAlpha(1); });
        this.betMinusButton.on('pointerout', () => { this.betMinusButton.setAlpha(1); });

        // Botão Mais (+)
        this.betPlusButton = this.add.image(plusButtonX, betButtonsY, 'betPlusButton')
            .setDisplaySize(buttonSize, buttonSize)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        this.betPlusButton.on('pointerdown', () => {
            this.currentBet += this.betStep;
            this.currentBet = Math.min(this.currentBet, this.maxBet); // Garante máximo
            this.updateBetDisplay(); // Atualiza o texto
            this.betPlusButton.setAlpha(0.7);
            // TODO: Salvar last_bet no DB
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
             const gameScene = this.scene.get('GameScene');
             if (gameScene && this.spinButton.input?.enabled) { // Verifica se está habilitado
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

    } // --- FIM DO MÉTODO CREATE ---
    
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