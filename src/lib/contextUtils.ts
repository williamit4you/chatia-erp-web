/**
 * Mapeia o uso de contexto real da IA (em porcentagem baseada no limite de tokens real)
 * para a porcentagem de display que aparecerá na barra da interface do usuário.
 * 
 * Regra de negócio aprovada:
 * - 0% a 50% real -> 0 a 80% na tela
 * - 50% a 70% real -> 80 a 95% na tela
 * - 70% a 75% real -> 95 a 100% na tela
 * - Acima de 75% real -> Trava em 100%
 */
export function getDisplayContextUsage(actualPercentage: number): number {
    if (actualPercentage <= 0) return 0;
    
    if (actualPercentage <= 50) {
        // 0 a 50 mapeia para 0 a 80
        return Math.round((actualPercentage / 50) * 80);
    } else if (actualPercentage <= 70) {
        // 50 a 70 mapeia para 80 a 95
        // Variação de 20% mapeia para variação de 15%
        return Math.round(80 + ((actualPercentage - 50) / 20) * 15);
    } else if (actualPercentage <= 75) {
        // 70 a 75 mapeia para 95 a 100
        // Variação de 5% mapeia para variação de 5%
        return Math.round(95 + ((actualPercentage - 70) / 5) * 5);
    } else {
        // Acima de 75% da capacidade real já exibimos 100% como limite pra forçar nova conversa
        return 100;
    }
}
