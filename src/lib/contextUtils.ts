/**
 * Regra de negócio:
 * - 0% a 70% real -> 0 a 100% na tela (Linear)
 * - Acima de 70% real -> Trava em 100%
 * Isso garante que:
 * - 35% real = 50% na tela
 * - 70% real = 100% na tela
 */
export function getDisplayContextUsage(actualPercentage: number): number {
    if (actualPercentage <= 0) return 0;
    
    if (actualPercentage < 70) {
        // Mapeamento linear: (actual / 70) * 100
        return Math.round((actualPercentage / 70) * 100);
    }
    
    return 100;
}
