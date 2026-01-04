const axios = require('axios');
const TokenManager = require('../utils/tokenManager');
require('dotenv').config();

const BANORTE_API_URL = process.env.BANORTE_API_URL || 'https://api.banorte.com'; // Placeholder
const CLIENT_ID = process.env.BANORTE_CLIENT_ID;
const CLIENT_SECRET = process.env.BANORTE_CLIENT_SECRET;

// Token endpoint usually follows standard OAuth2 paths, waiting for user to confirm exact URL
const TOKEN_ENDPOINT = `${BANORTE_API_URL}/oauth/token`;

const tokenManager = new TokenManager(TOKEN_ENDPOINT, CLIENT_ID, CLIENT_SECRET, 'codi_payments');

const banorteService = {
    /**
     * Generates a CoDi QR code for a specific amount and concept.
     * @param {number} amount Payment amount
     * @param {string} concept Description of payment
     * @param {string} reference Internal reference ID
     */
    generateQr: async (amount, concept, reference) => {
        try {
            const token = await tokenManager.getToken();

            const payload = {
                monto: parseFloat(amount).toFixed(2),
                mensaje: concept.substring(0, 20), // Max length often restricted
                referencia: reference,
                tipo: 'QR_ESTATICO' // Or DINAMICO depending on flow
            };

            // Using hypothetical endpoint /codi/qr - will need update with real docs
            const response = await axios.post(`${BANORTE_API_URL}/codi/qr`, payload, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            return {
                success: true,
                qr_image: response.data.qr_image_base64, // Hypothetical response structure
                transaction_id: response.data.id
            };

        } catch (error) {
            console.error('Banorte QR Generation Error:', error.response ? error.response.data : error.message);

            // MOCK RESPONSE FOR DEVELOPMENT WITHOUT CREDENTIALS
            if (!CLIENT_ID || error.message.includes('authenticate')) {
                console.warn('⚠️ USING MOCK QR DATA due to missing credentials or API error');
                const QRCode = require('qrcode');
                const mockData = `CODI://PAY?amount=${amount}&concept=${concept}`;
                const qrImage = await QRCode.toDataURL(mockData);
                return {
                    success: true,
                    qr_image: qrImage, // Returns a real data URL of a fake QR
                    transaction_id: `MOCK-${Date.now()}`
                };
            }

            throw error;
        }
    },

    /**
     * Sends a CoDi "Cobro Digital" request (Push Notification) to a phone number.
     * @param {number} amount Payment amount
     * @param {string} concept Description
     * @param {string} reference Internal Reference
     * @param {string} phoneNumber Buyer's Phone Number (10 digits)
     */
    sendPaymentRequest: async (amount, concept, reference, phoneNumber) => {
        try {
            const token = await tokenManager.getToken();

            const payload = {
                monto: parseFloat(amount).toFixed(2),
                mensaje: concept.substring(0, 20),
                referencia: reference,
                telefono: phoneNumber,
                tipo: 'SOLICITUD_COBRO'
            };

            const response = await axios.post(`${BANORTE_API_URL}/codi/request`, payload, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            return {
                success: true,
                transaction_id: response.data.id
            };

        } catch (error) {
            console.error('Banorte CoDi Request Error:', error.response ? error.response.data : error.message);

            // MOCK RESPONSE
            if (!CLIENT_ID || error.message.includes('authenticate') || error.message.includes('404')) {
                console.warn(`⚠️ USING MOCK CODI REQUEST for ${phoneNumber}`);
                return {
                    success: true,
                    transaction_id: `MOCK-REQ-${Date.now()}`
                };
            }
            throw error;
        }
    },

    /**
     * Verifies payment status (polling fallback)
     */
    checkStatus: async (transactionId) => {
        try {
            const token = await tokenManager.getToken();
            const response = await axios.get(`${BANORTE_API_URL}/codi/status/${transactionId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            // Mock response
            return { status: 'PENDING' };
        }
    }
};

module.exports = banorteService;
