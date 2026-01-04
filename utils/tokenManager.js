const axios = require('axios');

class TokenManager {
    constructor(tokenEndpoint, clientId, clientSecret, scope) {
        this.tokenEndpoint = tokenEndpoint;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.scope = scope;
        this.token = null;
        this.expiry = null;
    }

    async getToken() {
        if (this.token && this.expiry && new Date() < this.expiry) {
            return this.token;
        }

        try {
            console.log('Requesting new OAuth token from Banorte...');
            const params = new URLSearchParams();
            params.append('grant_type', 'client_credentials');
            params.append('client_id', this.clientId);
            params.append('client_secret', this.clientSecret);
            if (this.scope) params.append('scope', this.scope);

            const response = await axios.post(this.tokenEndpoint, params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            this.token = response.data.access_token;
            // Set expiry slightly before actual expiration (e.g., subtract 60 seconds)
            const expiresIn = response.data.expires_in || 3600;
            this.expiry = new Date(new Date().getTime() + (expiresIn - 60) * 1000);

            console.log('New OAuth token obtained successfully.');
            return this.token;
        } catch (error) {
            console.error('Error fetching OAuth token:', error.response ? error.response.data : error.message);
            throw new Error('Failed to authenticate with Bank API');
        }
    }
}

module.exports = TokenManager;
