// src/helpers/Constants.js

// Definição das Linhas de Pagamento (Paylines)
// Cada linha é um array de 3 ou 5 números, indicando a LINHA (0=topo, 1=meio, 2=base)
// para cada uma das 5 COLUNAS (índice 0 a 4 do array interno).
// Exemplo com 9 linhas:
export const PAYLINES = [
    [1, 1, 1, 1, 1], // Linha reta no meio
    [0, 0, 0, 0, 0], // Linha reta em cima
    [2, 2, 2, 2, 2], // Linha reta embaixo
    [0, 1, 2, 1, 0], // Forma de V
    [2, 1, 0, 1, 2], // Forma de V invertido
    [0, 0, 1, 2, 2], // Zigue-zague descendo
    [2, 2, 1, 0, 0], // Zigue-zague subindo
    [1, 0, 0, 0, 1], // Forma de U
    [1, 2, 2, 2, 1]  // Forma de U invertido
    // Adicione mais linhas se desejar (até 25 ou mais é comum)
];

// Definição da Tabela de Pagamentos (Paytable)
// Mapeia a CHAVE do símbolo para um array de pagamentos [3 iguais, 4 iguais, 5 iguais]
// Os valores são multiplicadores da aposta por linha (ou da aposta total, dependendo da regra)
// Ajuste estes valores conforme o balanceamento do seu jogo!
export const PAYTABLE = {
    // Símbolos de Baixo Valor
    'symbol_J': [5, 10, 25],
    'symbol_Q': [5, 10, 25],
    'symbol_K': [10, 20, 50],
    'symbol_A': [10, 20, 50],
    // Símbolos de Alto Valor
    'symbol_egg':         [20, 50, 100],
    'symbol_pterodactyl': [20, 50, 125],
    'symbol_saber':       [25, 75, 150],
    'symbol_mammoth':     [25, 100, 200],
    'symbol_caveman':     [50, 150, 300],
    'symbol_cavewoman':   [75, 200, 500], // Símbolo mais valioso normal
    // Símbolos Especiais (Regras podem ser tratadas separadamente)
    'symbol_wild': [0, 0, 0],     // Wild geralmente não paga por si só, só substitui
    'symbol_scatter': [2, 10, 50] // Scatter geralmente paga por quantidade (ex: 3, 4, 5 em qualquer lugar) e ativa bônus
                                  // Estes valores podem ser multiplicadores da APOSTA TOTAL.
};

// Outras constantes úteis
export const NUM_REELS = 5;
export const VISIBLE_ROWS = 3;