export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');

    console.log(`[${req.method}] Teste DELETE - Método: ${req.method}`);

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        console.log('[OPTIONS] Preflight request');
        return res.status(200).end();
    }

    // Testar DELETE sem Supabase
    if (req.method === 'DELETE') {
        console.log('[DELETE] Método DELETE funcionando!');
        return res.status(200).json({ 
            success: true, 
            message: 'DELETE funcionando sem Supabase',
            method: req.method,
            url: req.url
        });
    }

    // Outros métodos
    return res.status(200).json({ 
        success: true, 
        message: `Método ${req.method} recebido`,
        method: req.method 
    });
}