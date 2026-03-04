import { NextResponse } from 'next/server';
import sql from 'mssql';

export async function GET() {
    try {
        const ERP_DATABASE_URL = process.env.ERP_DATABASE_URL;

        if (!ERP_DATABASE_URL) {
            return NextResponse.json({ error: "A variável de ambiente ERP_DATABASE_URL não está configurada." }, { status: 400 });
        }

        const config = {
            server: '127.0.0.1',
            port: 1433,
            user: 'willi',
            password: 'Will#2026',
            database: 'Fonesat_Log',
            options: {
                encrypt: false,
                trustServerCertificate: true
            }
        };

        const pool = await sql.connect(config);

        // Efectua a query solicitada
        const result = await pool.request().query('select top 1 * from ped_venda');

        return NextResponse.json({
            success: true,
            message: "Conexão de Teste estabelecida com sucesso usando Tedious e opções nativas do mssql!",
            linhasRetornadas: result.recordset.length,
            registro: result.recordset[0]
        });

    } catch (error: any) {
        console.error("Erro no teste de DB:", error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Erro desconhecido ao conectar no banco'
        }, { status: 500 });
    }
}
