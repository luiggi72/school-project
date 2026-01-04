const axios = require('axios');
const TokenManager = require('../utils/tokenManager');
require('dotenv').config();

const SANTANDER_API_URL = process.env.SANTANDER_API_URL || 'https://api.santander.com.mx';
const CLIENT_ID = process.env.SANTANDER_CLIENT_ID;
const CLIENT_SECRET = process.env.SANTANDER_CLIENT_SECRET;

// Hypothetical OAuth path for Santander, similar to others.
const TOKEN_ENDPOINT = `${SANTANDER_API_URL}/oauth/token`;

const tokenManager = new TokenManager(TOKEN_ENDPOINT, CLIENT_ID, CLIENT_SECRET, 'codi_payments');

const santanderService = {
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
                amount: parseFloat(amount).toFixed(2),
                description: concept.substring(0, 20),
                reference: reference,
                type: 'STATIC_QR' // Santander specific enum might differ
            };

            const response = await axios.post(`${SANTANDER_API_URL}/codi/v1/qr`, payload, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'X-IBM-Client-Id': CLIENT_ID // Common in Santander/IBM setups
                }
            });

            return {
                success: true,
                qr_image: response.data.qrImage, // Adapting to hypothetical Santander response
                transaction_id: response.data.transactionId
            };

        } catch (error) {
            console.error('Santander QR Generation Error:', error.response ? error.response.data : error.message);

            // MOCK RESPONSE IF NO CREDENTIALS
            if (!CLIENT_ID || error.message.includes('authenticate')) {
                console.warn('⚠️ USING MOCK QR DATA (Santander) due to missing credentials');
                const QRCode = require('qrcode');
                const mockData = `CODI://PAY?amount=${amount}&concept=${concept}&bank=SANTANDER`;
                const qrImage = await QRCode.toDataURL(mockData);
                return {
                    success: true,
                    qr_image: qrImage,
                    transaction_id: `MOCK-SAN-${Date.now()}`
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
                amount: parseFloat(amount).toFixed(2),
                description: concept.substring(0, 20),
                reference: reference,
                payerPhone: phoneNumber,
                type: 'PUSH_NOTIFICATION'
            };

            const response = await axios.post(`${SANTANDER_API_URL}/codi/v1/request`, payload, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'X-IBM-Client-Id': CLIENT_ID
                }
            });

            return {
                success: true,
                transaction_id: response.data.transactionId
            };

        } catch (error) {
            console.error('Santander CoDi Request Error:', error.response ? error.response.data : error.message);

            // MOCK RESPONSE
            if (!CLIENT_ID || error.message.includes('authenticate')) {
                console.warn(`⚠️ USING MOCK CODI REQUEST (Santander) for ${phoneNumber}`);
                return {
                    success: true,
                    transaction_id: `MOCK-SAN-REQ-${Date.now()}`
                };
            }
            throw error;
        }
    },

    /**
     * Verifies payment status
     */
    checkStatus: async (transactionId) => {
        try {
            const token = await tokenManager.getToken();
            const response = await axios.get(`${SANTANDER_API_URL}/codi/v1/status/${transactionId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-IBM-Client-Id': CLIENT_ID
                }
            });
            return response.data;
        } catch (error) {
            return { status: 'PENDING' };
        }
    }
};

module.exports = santanderService;
