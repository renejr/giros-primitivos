// src/scenes/PreloaderScene.js

// import Phaser from 'phaser';

export default class PreloaderScene extends Phaser.Scene {

    constructor() {
        // Chave única para esta cena
        super({ key: 'PreloaderScene' });
    }

    preload() {
        console.log('PreloaderScene: preload() started');

        // --- Barra de Progresso Visual ---
        const progressBarWidth = this.cameras.main.width * 0.6;
        const progressBarHeight = 50;
        const progressBarX = this.cameras.main.centerX - progressBarWidth / 2;
        const progressBarY = this.cameras.main.centerY;

        // Caixa de fundo da barra de progresso
        const progressBarBackground = this.add.graphics();
        progressBarBackground.fillStyle(0x555555, 0.8); // Cinza escuro, semi-transparente
        progressBarBackground.fillRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight);

        // Barra de progresso que será preenchida
        const progressBar = this.add.graphics();

        // Texto de carregamento
        const loadingText = this.make.text({
            x: this.cameras.main.centerX,
            y: progressBarY - 30, // Um pouco acima da barra
            text: 'Carregando...',
            style: {
                font: '20px monospace',
                fill: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);

        // Texto de porcentagem
        const percentText = this.make.text({
            x: this.cameras.main.centerX,
            y: progressBarY + progressBarHeight / 2, // Centralizado na barra
            text: '0%',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });
        percentText.setOrigin(0.5, 0.5);

        // Texto para nome do arquivo (opcional)
        const assetText = this.make.text({
            x: this.cameras.main.centerX,
            y: progressBarY + progressBarHeight + 30, // Abaixo da barra
            text: '',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });
        assetText.setOrigin(0.5, 0.5);

        // --- Listeners de Eventos de Carregamento ---
        this.load.on('progress', (value) => {
            // value é um float entre 0 e 1
            percentText.setText(parseInt(value * 100) + '%');
            progressBar.clear(); // Limpa a barra anterior
            progressBar.fillStyle(0xffffff, 1); // Branco
            progressBar.fillRect(progressBarX, progressBarY, progressBarWidth * value, progressBarHeight);
        });

        this.load.on('fileprogress', (file) => {
            // Mostra qual arquivo está sendo carregado
            assetText.setText('Carregando asset: ' + file.key);
            console.log('Loading file:', file.key);
        });

        this.load.on('complete', () => {
            console.log('PreloaderScene: Loading complete!');
            progressBar.destroy();
            progressBarBackground.destroy();
            loadingText.destroy();
            percentText.destroy();
            assetText.destroy();

            // Inicia a próxima cena após o carregamento
            this.scene.start('GameScene'); // <<<---- VAMOS MUDAR ISSO DEPOIS! Por enquanto vai dar erro se não existir.
            // Para testar apenas o preloader, comente a linha acima e descomente a abaixo:
            // console.log('PreloaderScene: Would start GameScene now.');
            // this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Preload Complete!', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);

        });

        // --- Carregar os Assets Reais Aqui ---
        console.log('PreloaderScene: Starting asset loading...');

        // Exemplo (DESCOMENTE e ajuste os caminhos quando tiver os assets):
        // this.load.image('logo', 'assets/images/ui/logo.png');
        this.load.image('background', 'assets/images/backgrounds/bg_jungle.jpg');
        this.load.image('spinButton', 'assets/images/ui/button_spin.png');

        // Em PreloaderScene.preload()
        this.load.image('betPlusButton', 'assets/images/ui/button_plus.png');
        this.load.image('betMinusButton', 'assets/images/ui/button_minus.png');
        this.load.image('maxBetButton', 'assets/images/ui/button_maxbet.png');
        
        // --- Carregar Símbolos ---
        console.log('Loading symbols...');
        // Use chaves consistentes! Exemplo:
        this.load.image('symbol_mammoth', 'assets/images/symbols/high_mammoth.png');
        this.load.image('symbol_saber', 'assets/images/symbols/high_saber.png');
        this.load.image('symbol_pterodactyl', 'assets/images/symbols/high_pterodactyl.png'); // Adicione conforme seu roteiro
        this.load.image('symbol_egg', 'assets/images/symbols/high_egg.png');         // Adicione conforme seu roteiro
        this.load.image('symbol_caveman', 'assets/images/symbols/high_caveman.png');   // Adicione conforme seu roteiro
        this.load.image('symbol_cavewoman', 'assets/images/symbols/high_cavewoman.png'); // Adicione conforme seu roteiro
        this.load.image('symbol_wild', 'assets/images/symbols/wild_trex.png');        // Adicione conforme seu roteiro
        this.load.image('symbol_scatter', 'assets/images/symbols/scatter_volcano.png'); // Adicione conforme seu roteiro
        this.load.image('symbol_A', 'assets/images/symbols/low_a.png');           // Adicione conforme seu roteiro
        this.load.image('symbol_K', 'assets/images/symbols/low_k.png');           // Adicione conforme seu roteiro
        this.load.image('symbol_J', 'assets/images/symbols/low_j.png');           // Adicione conforme seu roteiro
        this.load.image('symbol_Q', 'assets/images/symbols/low_q.png');           // Adicione conforme seu roteiro

        // // Carregar sons
        // // this.load.audio('spinSound', 'assets/audio/sfx/spin_sound.wav');
        // // this.load.audio('winSound', 'assets/audio/sfx/win_small.wav');

        // this.load.audio('spinSound', ['assets/audio/sfx/spin_sound.ogg', 'assets/audio/sfx/spin_sound.mp3']); // Formatos múltiplos para compatibilidade
        // this.load.audio('winSound', ['assets/audio/sfx/win_small.ogg', 'assets/audio/sfx/win_small.mp3']);


        // **IMPORTANTE:** Para que a barra de progresso funcione e o 'complete' seja disparado,
        // você PRECISA ter pelo menos UMA chamada this.load.* aqui, mesmo que seja
        // um asset pequeno ou placeholder. Por enquanto, sem assets reais, o 'complete'
        // será disparado quase instantaneamente após o 'preload' começar.
        // Vamos adicionar uma carga mínima só para garantir:
         this.load.image('placeholder', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='); // Pixel transparente

    }

    create() {
        console.log('PreloaderScene: create() called');
        // O método create só é chamado APÓS o preload terminar.
        // A transição para a próxima cena é geralmente iniciada
        // no evento 'complete' do loader, dentro do preload().
        // Portanto, este método pode ficar vazio ou conter lógica
        // que precisa acontecer *exatamente* uma vez após o carregamento,
        // mas *antes* de iniciar a próxima cena (raro para um preloader simples).

         // Se você comentou o this.scene.start no 'complete', pode adicionar texto aqui:
         // this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Preload Complete! Create method reached.', { fontSize: '20px', fill: '#fff' }).setOrigin(0.5);
    }
}