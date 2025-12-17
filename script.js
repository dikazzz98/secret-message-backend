document.addEventListener('DOMContentLoaded', function() {
    // Elemen DOM
    const messageInput = document.getElementById('messageInput');
    const charCount = document.getElementById('charCount');
    const sendButton = document.getElementById('sendButton');
    const successModal = document.getElementById('successModal');
    const errorModal = document.getElementById('errorModal');
    const closeModal = document.getElementById('closeModal');
    const closeErrorModal = document.getElementById('closeErrorModal');
    const modalMessage = document.getElementById('modalMessage');
    const errorMessage = document.getElementById('errorMessage');
    
    // Konfigurasi WhatsApp
    const WHATSAPP_NUMBER = "6285321851127"; // Ganti dengan nomor WhatsApp Anda
    const API_BACKEND_URL = "https://secret-message-backend-9i38.onrender.com/api/send-message"; // Ganti dengan URL backend Anda
    
    // Karakter counter
    messageInput.addEventListener('input', function() {
        const length = messageInput.value.length;
        charCount.textContent = length;
        
        // Warna berdasarkan jumlah karakter
        if (length > 450) {
            charCount.style.color = '#e74c3c';
        } else if (length > 300) {
            charCount.style.color = '#f39c12';
        } else {
            charCount.style.color = '#636e72';
        }
    });
    
    // Fungsi validasi pesan
    function validateMessage(message) {
        if (!message || message.trim() === '') {
            return { valid: false, error: 'Pesan tidak boleh kosong' };
        }
        
        if (message.trim().length < 3) {
            return { valid: false, error: 'Pesan terlalu pendek (minimal 3 karakter)' };
        }
        
        if (message.length > 500) {
            return { valid: false, error: 'Pesan terlalu panjang (maksimal 500 karakter)' };
        }
        
        return { valid: true };
    }
    
    // Fungsi untuk mengirim pesan ke WhatsApp
    async function sendToWhatsApp(message) {
        try {
            // Data yang dikirim (tanpa identitas pengirim)
            const payload = {
                message: message,
                timestamp: new Date().toISOString()
            };

            // Kirim ke backend yang sebenarnya (Render)
            const response = await fetch(API_BACKEND_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
        
            if (!response.ok) {
                throw new Error(data.error || 'Gagal mengirim pesan ke server');
            }
        
            return { 
                success: true, 
                messageId: data.messageId,
                note: data.note || 'Pesan berhasil dikirim'
            };
        
        } catch (error) {
            console.error('Error mengirim pesan:', error);
            return { 
                success: false, 
                error: error.message || 'Gagal terhubung ke server. Periksa koneksi internet Anda.' 
            };
        }
    }
    
    // Fungsi untuk membuat pesan WhatsApp
    function createWhatsAppMessage(message) {
        const timestamp = new Date().toLocaleString('id-ID');
        const randomId = Math.random().toString(36).substring(2, 10);
        
        return `📨 *PESAN RAHASIA BARU*
        
📝 Pesan:
${message}

🆔 ID: ${randomId}
⏰ Waktu: ${timestamp}

⚠️ *Catatan: Pesan ini dikirim secara anonim. Identitas pengirim tidak diketahui.*`;
    }
    
    // Event listener untuk tombol kirim
    sendButton.addEventListener('click', async function() {
        const message = messageInput.value.trim();
        const validation = validateMessage(message);
        
        if (!validation.valid) {
            errorMessage.textContent = validation.error;
            errorModal.style.display = 'flex';
            return;
        }
        
        // Disable tombol dan tampilkan loading
        sendButton.disabled = true;
        const originalText = sendButton.innerHTML;
        sendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';
        
        try {
            // Simulasi pengiriman pesan
            const result = await sendToWhatsApp(message);
            
            if (result.success) {
                // Tampilkan modal sukses
                const whatsappMessage = createWhatsAppMessage(message);
                modalMessage.textContent = `"${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`;
                successModal.style.display = 'flex';
                
                // Reset form
                messageInput.value = '';
                charCount.textContent = '0';
                charCount.style.color = '#636e72';
            } else {
                // Tampilkan modal error
                errorMessage.textContent = result.error;
                errorModal.style.display = 'flex';
            }
        } catch (error) {
            errorMessage.textContent = 'Terjadi kesalahan jaringan. Periksa koneksi internet Anda.';
            errorModal.style.display = 'flex';
        } finally {
            // Enable tombol kembali
            sendButton.disabled = false;
            sendButton.innerHTML = originalText;
        }
    });
    
    // Event listener untuk tombol tutup modal
    closeModal.addEventListener('click', function() {
        successModal.style.display = 'none';
    });
    
    closeErrorModal.addEventListener('click', function() {
        errorModal.style.display = 'none';
    });
    
    // Tutup modal ketika klik di luar konten
    window.addEventListener('click', function(event) {
        if (event.target === successModal) {
            successModal.style.display = 'none';
        }
        if (event.target === errorModal) {
            errorModal.style.display = 'none';
        }
    });
    
    // Fitur tambahan: Kirim dengan Enter (Ctrl+Enter atau Cmd+Enter)
    messageInput.addEventListener('keydown', function(event) {
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            sendButton.click();
        }
    });
    
    // Fitur tambahan: Animasi tombol
    sendButton.addEventListener('mousedown', function() {
        if (!sendButton.disabled) {
            sendButton.style.transform = 'scale(0.98)';
        }
    });
    
    sendButton.addEventListener('mouseup', function() {
        if (!sendButton.disabled) {
            sendButton.style.transform = 'translateY(-3px)';
        }
    });
    
    // Fitur tambahan: Copy username
    const usernameElement = document.getElementById('username');
    usernameElement.addEventListener('click', function() {
        const username = usernameElement.textContent.substring(1); // Hapus @
        navigator.clipboard.writeText(username)
            .then(() => {
                const originalText = usernameElement.textContent;
                usernameElement.textContent = '✅ Username disalin!';
                setTimeout(() => {
                    usernameElement.textContent = originalText;
                }, 2000);
            })
            .catch(err => {
                console.log('Gagal menyalin: ', err);
            });
    });
    
    // Console log untuk pengembangan
    console.log('Website Pesan Rahasia siap digunakan!');
    console.log('Nomor WhatsApp penerima:', WHATSAPP_NUMBER);
});