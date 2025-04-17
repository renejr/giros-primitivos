# Giros Primitivos - Jogo de Slot Machine

![Gameplay Screenshot](image_ffcaef.jpg) ## Introdução

Bem-vindo ao **Giros Primitivos**! Este é um projeto de desenvolvimento de um jogo de slot machine (caça-níqueis) com tema pré-histórico, construído como um aplicativo desktop multiplataforma utilizando tecnologias web modernas.

O objetivo deste projeto é explorar a integração entre o framework de jogos Phaser 3, a plataforma de aplicativos desktop Electron, e a persistência de dados usando Python e SQLite.

## Visão Geral

Giros Primitivos transporta o jogador para uma selva cartunesca da pré-história, com vulcões, dinossauros amigáveis, mamutes e homens das cavernas. O jogo principal é uma slot machine de 5 colunas por 3 linhas, onde o jogador tenta obter combinações vencedoras de símbolos temáticos.

## Tecnologias Utilizadas

* **[Electron](https://www.electronjs.org/):** Framework para criar aplicativos desktop multiplataforma usando JavaScript, HTML e CSS. Ele fornece a "casca" do aplicativo e acesso a APIs do sistema.
* **[Phaser 3](https://phaser.io/phaser3):** Um framework HTML5 rápido, gratuito e divertido para criação de jogos 2D para desktop e mobile. Usado para toda a lógica e renderização do jogo em si.
* **[Node.js](https://nodejs.org/):** Ambiente de execução JavaScript usado pelo Electron para o processo principal e gerenciamento de pacotes.
* **[npm](https://www.npmjs.com/):** Gerenciador de pacotes do Node.js, usado para instalar dependências como Electron, Phaser e python-shell.
* **[Python](https://www.python.org/):** Usado no backend para interagir com o banco de dados SQLite.
    * **[sqlite3 (módulo embutido)](https://docs.python.org/3/library/sqlite3.html):** Para criar e gerenciar o banco de dados local.
    * **[Pillow](https://python-pillow.org/):** Biblioteca usada nos scripts auxiliares para processamento de imagens (recorte, redimensionamento). Instalada via `pip`.
* **[python-shell](https://www.npmjs.com/package/python-shell):** Pacote npm usado no `main.js` do Electron para facilitar a comunicação (IPC) com o script Python `database_manager.py`.
* **Assets Gráficos:** Gerados utilizando IA (DALL-E) e editados com GIMP/Photopea.

## Funcionalidades Atuais (Estado em Ação 56)

* Aplicativo desktop funcional via Electron.
* Estrutura básica do jogo Phaser 3 com múltiplas cenas (`Preloader`, `Game`, `UI`).
* Carregamento de assets (background, botão, símbolos).
* Exibição da grade de reels 5x3 com símbolos iniciais aleatórios e espaçamento entre linhas/células.
* Interface de Usuário (`UIScene`) rodando em paralelo com a cena principal (`GameScene`).
* Botão de "Spin" interativo (visualmente funcional).
* Persistência de dados básica usando SQLite gerenciado por Python (`database_manager.py`).
    * Inicialização do banco de dados.
    * Armazenamento/Leitura do perfil do jogador (saldo, última aposta, configurações).
    * (Estrutura pronta para High Scores).
* Comunicação IPC entre Electron (Main Process) e Phaser (Renderer Process) via `preload.js` e `python-shell` para buscar dados iniciais do banco de dados.
* Repositório Git inicializado.

## Estrutura do Projeto
giros-primitivos/
├── assets/                 # Recursos gráficos e sonoros
│   ├── images/
│   │   ├── backgrounds/
│   │   ├── symbols/
│   │   └── ui/
│   └── audio/              # (Ainda não utilizado)
├── node_modules/           # Dependências do Node (ignorado pelo .gitignore)
├── src/                    # Código fonte do jogo Phaser e Python
│   ├── scenes/             # Cenas do Phaser (PreloaderScene, GameScene, UIScene)
│   ├── gameobjects/         # (Ainda não utilizado)
│   ├── helpers/            # (Ainda não utilizado)
│   └── database_manager.py # Script Python para gerenciar DB SQLite
├── .gitignore              # Arquivos/pastas a serem ignorados pelo Git
├── index.html              # Ponto de entrada HTML para o Phaser
├── main.js                 # Ponto de entrada do Electron (Processo Principal)
├── package-lock.json       # Lockfile do npm
├── package.json            # Manifest do projeto Node.js (dependências, scripts)
├── preload.js              # Script de pré-carregamento do Electron (ponte IPC)
├── README.md               # Este arquivo
├── giros_primitivos.db     # Arquivo do banco de dados SQLite (ignorado pelo .gitignore)
└── (Scripts auxiliares como process_background.py, process_button.py, resize_symbols.py)

## Configuração e Instalação

**Pré-requisitos:**

* **Node.js e npm:** [Instale a partir do site oficial](https://nodejs.org/) (versão LTS recomendada).
* **Python:** [Instale a partir do site oficial](https://www.python.org/downloads/) (certifique-se de adicionar Python ao PATH durante a instalação). `pip` geralmente vem junto.
* **Git:** [Instale a partir do site oficial](https://git-scm.com/downloads/).

**Passos:**

1.  **Clone o Repositório (se estiver no GitHub/GitLab):**
    ```bash
    git clone URL_DO_REPOSITORIO
    cd giros-primitivos
    ```
    *(Se você já tem a pasta localmente, pule este passo)*

2.  **Instale as Dependências Python:**
    Navegue até a pasta do projeto no terminal e instale o Pillow:
    ```bash
    pip install Pillow
    ```

3.  **Instale as Dependências Node.js:**
    Ainda na pasta do projeto no terminal, execute:
    ```bash
    npm install
    ```
    *(Isso instalará Electron, Phaser, python-shell e outras dependências listadas no `package.json`)*

## Como Executar

Com todas as dependências instaladas, execute o seguinte comando no terminal a partir da pasta raiz do projeto:

```bash
npm start

Isso iniciará o Electron, que por sua vez carregará o jogo Phaser. O script Python será chamado para inicializar o banco de dados e buscar os dados iniciais.

Próximos Passos / TODO
Implementar animação de giro visual para as colunas (reels).
Implementar lógica de parada dos reels baseada em resultado RNG.
Implementar verificação de linhas de pagamento (paylines) e cálculo de vitórias.
Adicionar lógica de aposta (custo por giro, botões +/-, atualização no DB).
Atualizar saldo do jogador com base em apostas e vitórias (com chamada IPC para DB).
Ativar/Desativar botão de Spin durante o giro.
Implementar sons (giro, vitória, botão, fundo).
Adicionar recursos bônus (Free Spins, Wilds especiais - conforme roteiro inicial).
Implementar tabela de pagamento (Paytable).
Configurar Content Security Policy (CSP) no Electron para remover o aviso de segurança.
Refinar assets visuais e adicionar mais animações.
Empacotar o aplicativo para distribuição (electron-builder / electron-packager).

Ótima iniciativa! Um bom README.md é essencial para qualquer projeto, mesmo os pessoais. Ele serve como documentação principal, explicando o que o projeto faz, como configurá-lo e quais tecnologias utiliza.

Com base em tudo que construímos até agora, aqui está uma sugestão de README.md detalhado e didático para o seu projeto "Giros Primitivos".

Ação 56: Criar o Arquivo README.md

Na pasta raiz do seu projeto giros-primitivos, crie um novo arquivo chamado exatamente README.md.
Abra este arquivo em um editor de texto ou no seu editor de código.
Copie e cole o conteúdo abaixo dentro do arquivo README.md:
Markdown

# Giros Primitivos - Jogo de Slot Machine

![Gameplay Screenshot](image_ffcaef.jpg) ## Introdução

Bem-vindo ao **Giros Primitivos**! Este é um projeto de desenvolvimento de um jogo de slot machine (caça-níqueis) com tema pré-histórico, construído como um aplicativo desktop multiplataforma utilizando tecnologias web modernas.

O objetivo deste projeto é explorar a integração entre o framework de jogos Phaser 3, a plataforma de aplicativos desktop Electron, e a persistência de dados usando Python e SQLite.

## Visão Geral

Giros Primitivos transporta o jogador para uma selva cartunesca da pré-história, com vulcões, dinossauros amigáveis, mamutes e homens das cavernas. O jogo principal é uma slot machine de 5 colunas por 3 linhas, onde o jogador tenta obter combinações vencedoras de símbolos temáticos.

## Tecnologias Utilizadas

* **[Electron](https://www.electronjs.org/):** Framework para criar aplicativos desktop multiplataforma usando JavaScript, HTML e CSS. Ele fornece a "casca" do aplicativo e acesso a APIs do sistema.
* **[Phaser 3](https://phaser.io/phaser3):** Um framework HTML5 rápido, gratuito e divertido para criação de jogos 2D para desktop e mobile. Usado para toda a lógica e renderização do jogo em si.
* **[Node.js](https://nodejs.org/):** Ambiente de execução JavaScript usado pelo Electron para o processo principal e gerenciamento de pacotes.
* **[npm](https://www.npmjs.com/):** Gerenciador de pacotes do Node.js, usado para instalar dependências como Electron, Phaser e python-shell.
* **[Python](https://www.python.org/):** Usado no backend para interagir com o banco de dados SQLite.
    * **[sqlite3 (módulo embutido)](https://docs.python.org/3/library/sqlite3.html):** Para criar e gerenciar o banco de dados local.
    * **[Pillow](https://python-pillow.org/):** Biblioteca usada nos scripts auxiliares para processamento de imagens (recorte, redimensionamento). Instalada via `pip`.
* **[python-shell](https://www.npmjs.com/package/python-shell):** Pacote npm usado no `main.js` do Electron para facilitar a comunicação (IPC) com o script Python `database_manager.py`.
* **Assets Gráficos:** Gerados utilizando IA (DALL-E) e editados com GIMP/Photopea.

## Funcionalidades Atuais (Estado em Ação 56)

* Aplicativo desktop funcional via Electron.
* Estrutura básica do jogo Phaser 3 com múltiplas cenas (`Preloader`, `Game`, `UI`).
* Carregamento de assets (background, botão, símbolos).
* Exibição da grade de reels 5x3 com símbolos iniciais aleatórios e espaçamento entre linhas/células.
* Interface de Usuário (`UIScene`) rodando em paralelo com a cena principal (`GameScene`).
* Botão de "Spin" interativo (visualmente funcional).
* Persistência de dados básica usando SQLite gerenciado por Python (`database_manager.py`).
    * Inicialização do banco de dados.
    * Armazenamento/Leitura do perfil do jogador (saldo, última aposta, configurações).
    * (Estrutura pronta para High Scores).
* Comunicação IPC entre Electron (Main Process) e Phaser (Renderer Process) via `preload.js` e `python-shell` para buscar dados iniciais do banco de dados.
* Repositório Git inicializado.

## Estrutura do Projeto

giros-primitivos/
├── assets/                 # Recursos gráficos e sonoros
│   ├── images/
│   │   ├── backgrounds/
│   │   ├── symbols/
│   │   └── ui/
│   └── audio/              # (Ainda não utilizado)
├── node_modules/           # Dependências do Node (ignorado pelo .gitignore)
├── src/                    # Código fonte do jogo Phaser e Python
│   ├── scenes/             # Cenas do Phaser (PreloaderScene, GameScene, UIScene)
│   ├── gameobjects/         # (Ainda não utilizado)
│   ├── helpers/            # (Ainda não utilizado)
│   └── database_manager.py # Script Python para gerenciar DB SQLite
├── .gitignore              # Arquivos/pastas a serem ignorados pelo Git
├── index.html              # Ponto de entrada HTML para o Phaser
├── main.js                 # Ponto de entrada do Electron (Processo Principal)
├── package-lock.json       # Lockfile do npm
├── package.json            # Manifest do projeto Node.js (dependências, scripts)
├── preload.js              # Script de pré-carregamento do Electron (ponte IPC)
├── README.md               # Este arquivo
├── giros_primitivos.db     # Arquivo do banco de dados SQLite (ignorado pelo .gitignore)
└── (Scripts auxiliares como process_background.py, process_button.py, resize_symbols.py)


## Configuração e Instalação

**Pré-requisitos:**

* **Node.js e npm:** [Instale a partir do site oficial](https://nodejs.org/) (versão LTS recomendada).
* **Python:** [Instale a partir do site oficial](https://www.python.org/downloads/) (certifique-se de adicionar Python ao PATH durante a instalação). `pip` geralmente vem junto.
* **Git:** [Instale a partir do site oficial](https://git-scm.com/downloads/).

**Passos:**

1.  **Clone o Repositório (se estiver no GitHub/GitLab):**
    ```bash
    git clone URL_DO_REPOSITORIO
    cd giros-primitivos
    ```
    *(Se você já tem a pasta localmente, pule este passo)*

2.  **Instale as Dependências Python:**
    Navegue até a pasta do projeto no terminal e instale o Pillow:
    ```bash
    pip install Pillow
    ```

3.  **Instale as Dependências Node.js:**
    Ainda na pasta do projeto no terminal, execute:
    ```bash
    npm install
    ```
    *(Isso instalará Electron, Phaser, python-shell e outras dependências listadas no `package.json`)*

## Como Executar

Com todas as dependências instaladas, execute o seguinte comando no terminal a partir da pasta raiz do projeto:

```bash
npm start
Isso iniciará o Electron, que por sua vez carregará o jogo Phaser. O script Python será chamado para inicializar o banco de dados e buscar os dados iniciais.

Próximos Passos / TODO
Implementar animação de giro visual para as colunas (reels).
Implementar lógica de parada dos reels baseada em resultado RNG.
Implementar verificação de linhas de pagamento (paylines) e cálculo de vitórias.
Adicionar lógica de aposta (custo por giro, botões +/-, atualização no DB).
Atualizar saldo do jogador com base em apostas e vitórias (com chamada IPC para DB).
Ativar/Desativar botão de Spin durante o giro.
Implementar sons (giro, vitória, botão, fundo).
Adicionar recursos bônus (Free Spins, Wilds especiais - conforme roteiro inicial).
Implementar tabela de pagamento (Paytable).
Configurar Content Security Policy (CSP) no Electron para remover o aviso de segurança.
Refinar assets visuais e adicionar mais animações.
Empacotar o aplicativo para distribuição (electron-builder / electron-packager).
Licença
(Opcional: Mencione a licença, ex: ISC conforme definido no package.json)


4.  **Salve** o arquivo `README.md`.
5.  **(Opcional, mas recomendado) Adicione e Faça Commit do README:**
    No seu terminal, na pasta raiz do projeto:
    ```bash
    git add README.md
    git commit -m "Adiciona README.md inicial detalhado"
    ```

Agora seu projeto tem uma excelente documentação inicial! Qualquer pessoa (incluindo você no futuro) pode abrir o `README.md` e entender rapidamente do que se trata o projeto e como colocá-lo para rodar.