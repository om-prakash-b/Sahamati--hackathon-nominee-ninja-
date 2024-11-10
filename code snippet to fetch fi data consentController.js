const axios = require('axios');
const cron = require('node-cron');
const { ConsentRequest, ApiResponse, AuthToken } = require('../models');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080';

// Function to get the current auth token
async function getAuthToken() {
  const authToken = await AuthToken.findOne({ where: { id: 1 } });
  if (!authToken || new Date() > authToken.expires_at) {
    throw new Error('Auth token is missing or expired');
  }
  return `Bearer ${authToken.token}`;
}

exports.requestConsent = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestData = {
      redirect_params: {
        callback_url: "https://b_ixfq1of9uum.v0.build/"
      },
      consents: [
        {
          consent_start: new Date().toISOString(),
          consent_expiry: "2026-12-31T00:00:00.000Z",
          consent_mode: "STORE",
          fetch_type: "PERIODIC",
          consent_types: ["PROFILE", "SUMMARY"],
          fi_types: ["DEPOSIT", "RECURRING_DEPOSIT", "TERM_DEPOSIT"],
          customer: {
            identifiers: [
              {
                type: "MOBILE",
                value: req.body.mobileNumber
              }
            ]
          },
          purpose: {
            code: "101",
            text: "Monitoring Account profiles for incompleteness"
          },
          fi_data_range: {
            from: "2023-01-01T00:00:00.000Z",
            to: "2025-12-31T00:00:00.000Z"
          },
          data_life: {
            unit: "MONTH",
            value: 10
          },
          frequency: {
            unit: "MONTH",
            value: 31
          }
        }
      ]
    };

    const authHeader = await getAuthToken();

    const response = await axios.post(`${API_BASE_URL}/v2/consents/request`, requestData, {
      headers: {
        'fiu_entity_id': 'Ice-FIU',
        'aa_entity_id': 'saafe-sandbox',
        'Content-Type': 'application/json',
        'Authorization': authHeader
      }
    });

    const { redirect_url, handle } = response.data;

    // Store the consent request in the database
    const consentRequest = await ConsentRequest.create({
      UserId: userId,
      handle,
      redirect_url,
    });

    // Store the API response
    await ApiResponse.create({
      UserId: userId,
      endpoint: '/v2/consents/request',
      request_data: JSON.stringify(requestData),
      response_data: JSON.stringify(response.data)
    });

    res.status(200).json({ redirect_url, handle });
  } catch (error) {
    console.error('Error requesting consent:', error);
    res.status(500).json({ message: 'Error requesting consent', error: error.message });
  }
};

exports.fetchConsentStatus = async (req, res) => {
  try {
    const { handle } = req.params;
    const authHeader = await getAuthToken();

    const response = await axios.post(`${API_BASE_URL}/v2/consents/fetch`, { handle }, {
      headers: {
        'x-simulate-res': 'Ok',
        'Content-Type': 'application/json',
        'Authorization': authHeader
      }
    });

    const consentRequest = await ConsentRequest.findOne({ where: { handle } });
    if (consentRequest) {
      consentRequest.status = response.data.status;
      await consentRequest.save();
    }

    // Store the API response
    await ApiResponse.create({
      UserId: consentRequest.UserId,
      endpoint: '/v2/consents/fetch',
      request_data: JSON.stringify({ handle }),
      response_data: JSON.stringify(response.data)
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching consent status:', error);
    res.status(500).json({ message: 'Error fetching consent status', error: error.message });
  }
};

// Function to poll consent status
const pollConsentStatus = async (handle) => {
  try {
    const authHeader = await getAuthToken();

    const response = await axios.post(`${API_BASE_URL}/v2/consents/fetch`, { handle }, {
      headers: {
        'x-simulate-res': 'Ok',
        'Content-Type': 'application/json',
        'Authorization': authHeader
      }
    });

    const consentRequest = await ConsentRequest.findOne({ where: { handle } });
    if (consentRequest) {
      consentRequest.status = response.data.status;
      await consentRequest.save();

      // Store the API response
      await ApiResponse.create({
        UserId: consentRequest.UserId,
        endpoint: '/v2/consents/fetch',
        request_data: JSON.stringify({ handle }),
        response_data: JSON.stringify(response.data)
      });

      if (response.data.status === 'ACTIVE') {
        console.log(`Consent request ${handle} is now active.`);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error(`Error polling consent status for handle ${handle}:`, error);
    return false;
  }
};

// Schedule polling for pending consent requests
cron.schedule('* * * * *', async () => {
  const pendingRequests = await ConsentRequest.findAll({ where: { status: 'PENDING' } });
  for (const request of pendingRequests) {
    const isActive = await pollConsentStatus(request.handle);
    if (isActive) {
      // You can add additional logic here when a consent becomes active
      console.log(`Consent ${request.handle} is now active. Perform necessary actions.`);
    }
  }
});

module.exports = exports;


const axios = require('axios');
const cron = require('node-cron');
const { ConsentRequest, ApiResponse, AuthToken, DataRequestSession } = require('../models');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080';

// ... (previous functions)

// Function to request data
async function requestData(consentHandle, userId) {
  try {
    const authHeader = await getAuthToken();

    const requestData = {
      consent_handle: consentHandle,
      from: "2023-09-26T00:00:00.000Z",
      to: new Date().toISOString(),
      curve: "Curve25519"
    };

    const response = await axios.post(`${API_BASE_URL}/v2/data/request`, requestData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      }
    });

    const { session_id } = response.data;

    // Store the data request session
    await DataRequestSession.create({
      session_id,
      consent_handle: consentHandle,
      status: 'PENDING',
      UserId: userId,
    });

    // Store the API response
    await ApiResponse.create({
      UserId: userId,
      endpoint: '/v2/data/request',
      request_data: JSON.stringify(requestData),
      response_data: JSON.stringify(response.data)
    });

    console.log(`Data request initiated for consent ${consentHandle}. Session ID: ${session_id}`);
  } catch (error) {
    console.error(`Error requesting data for consent ${consentHandle}:`, error);
  }
}

// Function to poll consent status
const pollConsentStatus = async (handle) => {
  try {
    const authHeader = await getAuthToken();

    const response = await axios.post(`${API_BASE_URL}/v2/consents/fetch`, { handle }, {
      headers: {
        'x-simulate-res': 'Ok',
        'Content-Type': 'application/json',
        'Authorization': authHeader
      }
    });

    const consentRequest = await ConsentRequest.findOne({ where: { handle } });
    if (consentRequest) {
      consentRequest.status = response.data.status;
      await consentRequest.save();

      // Store the API response
      await ApiResponse.create({
        UserId: consentRequest.UserId,
        endpoint: '/v2/consents/fetch',
        request_data: JSON.stringify({ handle }),
        response_data: JSON.stringify(response.data)
      });

      if (response.data.status === 'ACTIVE') {
        console.log(`Consent request ${handle} is now active.`);
        // Initiate data request when consent becomes active
        await requestData(handle, consentRequest.UserId);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error(`Error polling consent status for handle ${handle}:`, error);
    return false;
  }
};

// Schedule polling for pending consent requests
cron.schedule('* * * * *', async () => {
  const pendingRequests = await ConsentRequest.findAll({ where: { status: 'PENDING' } });
  for (const request of pendingRequests) {
    const isActive = await pollConsentStatus(request.handle);
    if (isActive) {
      console.log(`Consent ${request.handle} is now active. Data request initiated.`);
    }
  }
});

// New function to manually trigger data request
exports.triggerDataRequest = async (req, res) => {
  try {
    const { consentHandle } = req.params;
    const consentRequest = await ConsentRequest.findOne({ where: { handle: consentHandle } });
    
    if (!consentRequest) {
      return res.status(404).json({ message: 'Consent request not found' });
    }

    await requestData(consentHandle, consentRequest.UserId);
    res.status(200).json({ message: 'Data request initiated successfully' });
  } catch (error) {
    console.error('Error triggering data request:', error);
    res.status(500).json({ message: 'Error triggering data request', error: error.message });
  }
};

// Function to fetch data
async function fetchData(sessionId) {
  try {
    const authHeader = await getAuthToken();

    const requestData = {
      session_id: sessionId
    };

    const response = await axios.post(`${API_BASE_URL}/v2/data/fetch`, requestData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      }
    });

    // Update the data request session status
    const dataRequestSession = await DataRequestSession.findOne({ where: { session_id: sessionId } });
    if (dataRequestSession) {
      dataRequestSession.status = response.data.status || 'COMPLETED';
      await dataRequestSession.save();
    }

    // Store the API response
    await ApiResponse.create({
      UserId: dataRequestSession.UserId,
      endpoint: '/v2/data/fetch',
      request_data: JSON.stringify(requestData),
      response_data: JSON.stringify(response.data)
    });

    console.log(`Data fetched for session ${sessionId}. Status: ${response.data.status}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching data for session ${sessionId}:`, error);
    throw error;
  }
}

// Function to request data
async function requestData(consentHandle, userId) {
  try {
    const authHeader = await getAuthToken();

    const requestData = {
      consent_handle: consentHandle,
      from: "2023-09-26T00:00:00.000Z",
      to: new Date().toISOString(),
      curve: "Curve25519"
    };

    const response = await axios.post(`${API_BASE_URL}/v2/data/request`, requestData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      }
    });

    const { session_id } = response.data;

    // Store the data request session
    await DataRequestSession.create({
      session_id,
      consent_handle: consentHandle,
      status: 'PENDING',
      UserId: userId,
    });

    // Store the API response
    await ApiResponse.create({
      UserId: userId,
      endpoint: '/v2/data/request',
      request_data: JSON.stringify(requestData),
      response_data: JSON.stringify(response.data)
    });

    console.log(`Data request initiated for consent ${consentHandle}. Session ID: ${session_id}`);

    // Fetch data immediately after requesting
    await fetchData(session_id);
  } catch (error) {
    console.error(`Error requesting data for consent ${consentHandle}:`, error);
  }
}

// ... (previous functions)

// New function to manually trigger data fetch
exports.triggerDataFetch = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const dataRequestSession = await DataRequestSession.findOne({ where: { session_id: sessionId } });
    
    if (!dataRequestSession) {
      return res.status(404).json({ message: 'Data request session not found' });
    }

    const fetchedData = await fetchData(sessionId);
    res.status(200).json({ message: 'Data fetched successfully', data: fetchedData });
  } catch (error) {
    console.error('Error triggering data fetch:', error);
    res.status(500).json({ message: 'Error triggering data fetch', error: error.message });
  }
};

// Schedule polling for pending data request sessions
cron.schedule('*/5 * * * *', async () => {
  const pendingSessions = await DataRequestSession.findAll({ where: { status: 'PENDING' } });
  for (const session of pendingSessions) {
    try {
      await fetchData(session.session_id);
    } catch (error) {
      console.error(`Error fetching data for session ${session.session_id}:`, error);
    }
  }
});

module.exports = exports;
