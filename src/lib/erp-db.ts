import sql from 'mssql';

// Conexão central para o banco de dados SQL Server do ERP (Fonesat_log)
const sqlConfig = {
    user: 'willi',
    password: 'Will#2026',
    database: 'Fonesat_log',
    server: 'localhost\\SQLEXPRESS', // Em ambiente local costuma resolver conectando em localhost com a instância
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        encrypt: false, // para testes locais
        trustServerCertificate: true, // importante para SQL Express
        instanceName: 'SQLEXPRESS' // Configura explícita a instância
    }
};

let poolPromise: Promise<sql.ConnectionPool> | null = null;

export async function getErpDbConnection() {
    if (!poolPromise) {
        poolPromise = sql.connect(sqlConfig)
            .then(pool => {
                console.log('✅ Conectado ao SQL Server ERP com sucesso!');
                return pool;
            })
            .catch(err => {
                console.error('❌ Falha ao conectar ao SQL Server:', err);
                poolPromise = null;
                throw err;
            });
    }
    return poolPromise;
}

// ==========================================
// FUNÇÕES DE EXTRAÇÃO DAS VIEWS FINANCEIRAS
// ==========================================

export async function fetchContasPagarAberto() {
    try {
        const pool = await getErpDbConnection();
        // Ajuste a consulta conforme os nomes exatos dos campos da sua View. 
        // Estamos limitando a 50 para não estourar os tokens da IA se a base for muito grande.
        const result = await pool.request().query('SELECT TOP 50 * FROM VW_DOC_FIN_PAG_ABERTO ORDER BY DATAVENCIMENTO ASC');
        return result.recordset;
    } catch (error: any) {
        console.error("Erro em fetchContasPagarAberto:", error.message);
        return { error: "Erro ao consultar as contas a pagar em aberto." };
    }
}

export async function fetchContasPagarPago() {
    try {
        const pool = await getErpDbConnection();
        const result = await pool.request().query('SELECT TOP 50 * FROM VW_DOC_FIN_PAG_PAGO ORDER BY DATAPAGAMENTO DESC');
        return result.recordset;
    } catch (error: any) {
        console.error("Erro em fetchContasPagarPago:", error.message);
        return { error: "Erro ao consultar as contas já pagas." };
    }
}

export async function fetchContasReceberAberto() {
    try {
        const pool = await getErpDbConnection();
        const result = await pool.request().query('SELECT TOP 50 * FROM VW_DOC_FIN_REC_ABERTO ORDER BY DATAVENCIMENTO ASC');
        return result.recordset;
    } catch (error: any) {
        console.error("Erro em fetchContasReceberAberto:", error.message);
        return { error: "Erro ao consultar as contas a receber em aberto." };
    }
}

export async function fetchContasReceberPago() {
    try {
        const pool = await getErpDbConnection();
        const result = await pool.request().query('SELECT TOP 50 * FROM VW_DOC_FIN_REC_PAGO ORDER BY DATARECEBIMENTO DESC');
        return result.recordset;
    } catch (error: any) {
        console.error("Erro em fetchContasReceberPago:", error.message);
        return { error: "Erro ao consultar as contas já recebidas." };
    }
}
