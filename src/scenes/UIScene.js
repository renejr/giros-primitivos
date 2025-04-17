// src/scenes/UIScene.js

export default class UIScene extends Phaser.Scene {

    constructor() {
        super({ key: 'UIScene', active: true });
        this.balanceText = null; // Inicializa propriedades
        this.betText = null;
        this.playerProfile = null; // Para guardar os dados recebidos
    }

    preload() {
        console.log('UIScene: preload()');
        // Carregar assets da UI...
    }

    // Torna o create assíncrono para poder usar await
    async create() {
        console.log('UIScene: create()');

        // Cria os textos placeholders primeiro
        /* this.balanceText = this.add.text(
            50, 50, 'Saldo: Carregando...',
            { fontSize: '24px', fill: '#fff', fontStyle: 'bold' }
        );

        this.betText = this.add.text(
            this.cameras.main.width - 50, 50, 'Aposta: Carregando...',
            { fontSize: '24px', fill: '#fff', fontStyle: 'bold' }
        ).setOrigin(1, 0); */

        // Chama a API exposta pelo preload para buscar os dados do perfil
        console.log('UIScene: Requesting profile data via electronAPI...');
        try {
            // Verifica se a API foi exposta corretamente
            if (window.electronAPI && typeof window.electronAPI.getProfile === 'function') {
                 this.playerProfile = await window.electronAPI.getProfile();
                 console.log('UIScene: Profile data received:', this.playerProfile);

                 // Atualiza os textos se os dados foram recebidos com sucesso
                 if (this.playerProfile) {
                      // Formata o saldo para exibir com 2 casas decimais
                      // const formattedBalance = parseFloat(this.playerProfile.balance).toFixed(2);
                      // this.balanceText.setText(`Saldo: $${formattedBalance}`);

                      // const formattedBet = parseFloat(this.playerProfile.last_bet).toFixed(2);
                      // this.betText.setText(`Aposta: $${formattedBet}`);
                 } else {
                      console.error('UIScene: Failed to retrieve profile data (null received).');
                      // this.balanceText.setText('Saldo: Erro');
                      // this.betText.setText('Aposta: Erro');
                 }
            } else {
                 console.error('UIScene: window.electronAPI or getProfile not found!');
                 this.balanceText.setText('Saldo: API Error');
                 this.betText.setText('Aposta: API Error');
            }
        } catch (error) {
            console.error('UIScene: Error calling getProfile:', error);
            this.balanceText.setText('Saldo: Erro');
            this.betText.setText('Aposta: Erro');
        }

        // TODO: Adicionar botões, etc.
        // --- Adicionar Botão de Spin ---
        // Posição (ex: canto inferior direito)
        const spinButtonX = this.cameras.main.width - 110;
        const spinButtonY = this.cameras.main.height - 160;

        // Cria o botão usando a imagem carregada no Preloader
        // Assumindo que a chave do asset é 'spinButton'
        const spinButton = this.add.image(spinButtonX, spinButtonY, 'spinButton')
            .setOrigin(0.5) // Centraliza a imagem na posição X, Y
            .setInteractive({ useHandCursor: true }); // Torna a imagem clicável e muda o cursor

        // Efeito visual simples ao clicar (opcional)
        spinButton.on('pointerdown', () => {
            spinButton.setAlpha(0.7); // Leve transparência ao pressionar
            console.log('Spin button clicked!');

            // Chama o método startSpin() da cena 'GameScene'
            const gameScene = this.scene.get('GameScene'); // Obtém referência à GameScene
            if (gameScene) { // Verifica se a cena foi encontrada
                gameScene.startSpin(); // Chama o método
            } else {
                console.error("UIScene: Could not find GameScene to start spin!");
            }

            // TODO: Talvez desabilitar o botão durante o giro
            // TODO: Chamar a lógica de spin na GameScene
            // Ex: this.scene.get('GameScene').startSpin(); (Precisaremos criar essa função)

            // Talvez deduzir a aposta aqui ou no início do spin na GameScene
            // e atualizar o saldo via IPC
        });

        spinButton.on('pointerup', () => {
            spinButton.setAlpha(1); // Restaura a aparência normal ao soltar
        });

         spinButton.on('pointerout', () => {
             spinButton.setAlpha(1); // Restaura se o mouse sair de cima enquanto pressionado
         });


        // TODO: Adicionar botões Bet+ e Bet- similarmente
    }
}