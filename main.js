// main.js (Electron Main Process)

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { PythonShell } = require('python-shell'); // <--- Importar PythonShell

// Caminho para o script Python (ajuste se necessário)
// __dirname aponta para a raiz do projeto onde main.js está
const DB_SCRIPT_PATH = path.join(__dirname, 'src', 'database_manager.py');
console.log(`Database script path: ${DB_SCRIPT_PATH}`);

// Opções padrão para python-shell
let pyshellOptions = {
  // pythonPath: 'path/to/python', // Descomente se o python não estiver no PATH
  scriptPath: path.dirname(DB_SCRIPT_PATH), // Diretório do script
  mode: 'json', // Espera que o Python imprima JSON no stdout
};

// Função auxiliar para rodar comandos Python
async function runDbCommand(command, args = []) {
  console.log(`Node: Running DB Command: ${command}`, args);
  const options = {
      ...pyshellOptions,
      args: [command, ...args] // O comando é o primeiro argumento para o script Python
  };

  try {
      // PythonShell.run retorna uma Promise com os resultados (já parseados por causa do mode: 'json')
      const results = await PythonShell.run(path.basename(DB_SCRIPT_PATH), options);
      console.log(`Node: Python script result for ${command}:`, results);
      if (results && results.length > 0) {
          // results[0] deve conter o objeto { data: ... } ou { error: ... }
          if (results[0].error) {
              console.error(`Node: Error from Python script (${command}): ${results[0].error}`);
              return null; // Ou lançar um erro
          }
          return results[0].data; // Retorna apenas o conteúdo de 'data'
      } else {
          console.error(`Node: No results received from Python script for ${command}.`);
          return null;
      }
  } catch (error) {
      console.error(`Node: Error running python script for command ${command}:`, error);
      return null; // Ou lançar um erro
  }
}

// --- Criação da Janela (sem mudanças aqui) ---
const createWindow = () => {
  const mainWindow = new BrowserWindow({ /* ... configurações como antes ... */
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    }
   });
  mainWindow.loadFile('index.html');
  // mainWindow.webContents.openDevTools(); // Útil para debug
};

// --- Ciclo de Vida do App Electron ---
app.whenReady().then(async () => { // Marcar como async para usar await
  console.log("Node: Electron App Ready. Initializing database...");
  // Chama o comando 'init' do script Python para garantir que o DB exista
  const initResult = await runDbCommand('init');
  if (initResult !== null) { // Idealmente, init retorna true ou data:{success:true}
      console.log("Node: Database initialization command executed.");
       // Só cria a janela se o DB inicializou (ou o comando rodou)
       createWindow();
  } else {
       console.error("Node: Failed to execute database initialization command. App might not work correctly.");
       // Poderia mostrar uma mensagem de erro para o usuário aqui
       app.quit(); // Sai se não conseguir inicializar DB? Ou continua?
  }


  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// --- Handlers IPC ---
console.log("Node: Setting up IPC Handlers...");

// Handler para buscar o perfil do jogador
ipcMain.handle('db:get-profile', async (event) => {
  console.log("Node: Received IPC request for 'db:get-profile'");
  const profileData = await runDbCommand('get_profile');
  return profileData; // Retorna os dados (ou null em caso de erro)
});

// Handler para atualizar o perfil (exemplo)
ipcMain.handle('db:update-profile', async (event, profileData) => {
  console.log("Node: Received IPC request for 'db:update-profile'", profileData);
  // Precisamos passar os dados como uma string JSON para o script Python
  const profileDataJson = JSON.stringify(profileData);
  const success = await runDbCommand('update_profile', [profileDataJson]);
  return success; // Retorna true/false (ou o que o python retornar)
});

// Handler para adicionar high score (exemplo)
ipcMain.handle('db:add-high-score', async (event, playerName, score) => {
    console.log("Node: Received IPC request for 'db:add-high-score'", playerName, score);
    // Passa nome e score como argumentos separados
    const success = await runDbCommand('add_high_score', [playerName, String(score)]); // Converte score para string
    return success;
});

// Handler para buscar high scores (exemplo)
ipcMain.handle('db:get-high-scores', async (event, limit = 10) => {
    console.log("Node: Received IPC request for 'db:get-high-scores'", limit);
    const scoresData = await runDbCommand('get_high_scores', [String(limit)]); // Converte limit para string
    return scoresData; // Retorna a lista de scores (ou null)
});


console.log("Electron main process logic loaded.");