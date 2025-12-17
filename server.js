const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Simpan sementara di memory (tidak permanen)
const messages = [];

// API untuk menerima pesan dari frontend
app.post('/api/send-message', async (req, res) => {
    try {
        const { message } = req.body;
        
        // Validasi
        if (!message || message.trim().length < 3) {
            return res.status(400).json({
                success: false,
                error: 'Pesan terlalu pendek (minimal 3 karakter)'
            });
        }
        
        if (message.length > 500) {
            return res.status(400).json({
                success: false,
                error: 'Pesan terlalu panjang (maksimal 500 karakter)'
            });
        }
        
        // Generate ID unik
        const messageId = 'MSG_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        // Format pesan untuk WhatsApp (nanti akan dikirim)
        const whatsappMessage = `📨 *PESAN RAHASIA BARU*\n\n📝 Isi Pesan:\n${message}\n\n🆔 ID: ${messageId}\n⏰ Waktu: ${new Date().toLocaleString('id-ID')}\n\n⚠️ *Pesan anonim via website. Identitas pengirim tidak diketahui.*`;
        
        // SIMULASI: Untuk sekarang hanya simpan di memory
        // NANTI: Di sini akan ditambahkan integrasi Twilio/WhatsApp API
        messages.push({
            id: messageId,
            message: message,
            timestamp: new Date().toISOString(),
            ip: req.ip.replace(/\.\d+$/, '.xxx') // Anonimkan IP
        });
        
        console.log(`📩 Pesan diterima: ${message.substring(0, 50)}... (ID: ${messageId})`);
        
        // Kirim respons ke frontend
        res.json({
            success: true,
            messageId: messageId,
            note: 'Pesan diterima sistem. WhatsApp integration akan ditambahkan.',
            timestamp: new Date().toISOString(),
            preview: message.substring(0, 100) + (message.length > 100 ? '...' : '')
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error. Silakan coba lagi.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Health check endpoint (penting untuk Railway)
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'online', 
        service: 'secret-message-api',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        messages_received: messages.length,
        environment: process.env.NODE_ENV || 'development'
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Secret Message API</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                .status { background: #d4edda; padding: 15px; border-radius: 5px; }
                .endpoint { background: #f8f9fa; padding: 10px; margin: 10px 0; }
            </style>
        </head>
        <body>
            <h1>🔐 WhatsApp Secret Message API</h1>
            <div class="status">
                <h3>✅ Status: Online</h3>
                <p>Total pesan diterima: ${messages.length}</p>
                <p>Environment: ${process.env.NODE_ENV || 'development'}</p>
            </div>
            <h3>Endpoints:</h3>
            <div class="endpoint">
                <strong>POST /api/send-message</strong><br>
                Menerima pesan dari frontend
            </div>
            <div class="endpoint">
                <strong>GET /api/health</strong><br>
                Health check untuk monitoring
            </div>
            <h3>Frontend Integration:</h3>
            <p>URL backend ini harus di-set di file <code>script.js</code> frontend:</p>
            <pre>const BACKEND_URL = '${req.protocol}://${req.get('host')}/api/send-message';</pre>
        </body>
        </html>
    `);
});

// Port dari environment variable (Railway otomatis set)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
});