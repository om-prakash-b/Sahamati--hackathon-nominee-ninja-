const axios = require('axios');
const cron = require('node-cron');
const { AuthToken, ConsentRequest, DataRequestSession, ApiResponse } = require('../models');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080';
const AUTH_API_URL = 'https://api.sandbox.sahamati.org.in/iam/v1/user/token/generate';

async function generateToken() {
  try {
    const response = await axios.post(AUTH_API_URL, 
      new URLSearchParams({
        'username': process.env.API_USERNAME,
        'password': process.env.API_PASSWORD
      }),
      {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    await AuthToken.upsert({
      id: 1,
      token: response.data.access_token,
      expires_at: new Date(Date.now() + response.data.expires_in * 1000)
    });

    await ApiResponse.create({
      endpoint: '/iam/v1/user/token/generate',
      request_data: JSON.stringify({ username: process.env.API_USERNAME, password: '********' }),
      response_data: JSON.stringify(response.data)
    });

    console.log('Token refreshed successfully');
  } catch (error) {
    console.error('Error generating token:', error);
  }
}

async function getAuthToken() {
  const authToken = await AuthToken.findOne({ where: { id: 1 } });
  if (!authToken || new Date() > authToken.expires_at) {
    await generateToken();
    return getAuthToken();
  }
  return `Bearer ${authToken.token}`;
}

async function requestConsent(userId, mobileNumber) {
  try {
    const authHeader = await getAuthToken();
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
                value: mobileNumber
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

    const response = await axios.post(`${API_BASE_URL}/v2/consents/request`, requestData, {
      headers: {
        'fiu_entity_id': 'Ice-FIU',
        'aa_entity_id': 'saafe-sandbox',
        'Content-Type': 'application/json',
        'Authorization': authHeader
      }
    });

    const { redirect_url, handle } = response.data;

    await ConsentRequest.create({
      UserId: userId,
      handle,
      redirect_url,
      status: 'PENDING'
    });

    await ApiResponse.create({
      UserId: userId,
      endpoint: '/v2/consents/request',
      request_data: JSON.stringify(requestData),
      response_data: JSON.stringify(response.data)
    });

    return { redirect_url, handle };
  } catch (error) {
    console.error('Error requesting consent:', error);
    throw error;
  }
}

async function fetchConsentStatus(handle) {
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
    }

    await ApiResponse.create({
      UserId: consentRequest.UserId,
      endpoint: '/v2/consents/fetch',
      request_data: JSON.stringify({ handle }),
      response_data: JSON.stringify(response.data)
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching consent status:', error);
    throw error;
  }
}

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

    await DataRequestSession.create({
      session_id,
      consent_handle: consentHandle,
      status: 'PENDING',
      UserId: userId,
    });

    await ApiResponse.create({
      UserId: userId,
      endpoint: '/v2/data/request',
      request_data: JSON.stringify(requestData),
      response_data: JSON.stringify(response.data)
    });

    return session_id;
  } catch (error) {
    console.error('Error requesting data:', error);
    throw error;
  }
}

async function fetchData(sessionId) {
  try {
    const authHeader = await getAuthToken();
    const requestData = { session_id: sessionId };

    const response = await axios.post(`${API_BASE_URL}/v2/data/fetch`, requestData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      }
    });

    const dataRequestSession = await DataRequestSession.findOne({ where: { session_id: sessionId } });
    if (dataRequestSession) {
      dataRequestSession.status = response.data.status || 'COMPLETED';
      await dataRequestSession.save();
    }

    await ApiResponse.create({
      UserId: dataRequestSession.UserId,
      endpoint: '/v2/data/fetch',
      request_data: JSON.stringify(requestData),
      response_data: JSON.stringify(response.data)
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

// Schedule token refresh every 24 hours
cron.schedule('0 0 * * *', generateToken);

// Schedule consent status check and data fetching every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  const pendingConsents = await ConsentRequest.findAll({ where: { status: 'PENDING' } });
  for (const consent of pendingConsents) {
    try {
      const status = await fetchConsentStatus(consent.handle);
      if (status === 'ACTIVE') {
        const sessionId = await requestData(consent.handle, consent.UserId);
        await fetchData(sessionId);
      }
    } catch (error) {
      console.error(`Error processing consent ${consent.handle}:`, error);
    }
  }

  const pendingSessions = await DataRequestSession.findAll({ where: { status: 'PENDING' } });
  for (const session of pendingSessions) {
    try {
      await fetchData(session.session_id);
    } catch (error) {
      console.error(`Error fetching data for session ${session.session_id}:`, error);
    }
  }
});

//buidlign family tree using class X certificate from apiSetu.gov.in
async function fetchCBSECertificate(userId) {
  try {
    const user = await User.findByPk(userId);
    if (!user || !user.class_X_rollno || !user.name) {
      throw new Error('User not found or missing required information');
    }

    const requestData = {
      txnId: uuidv4(),
      format: "xml",
      certificateParameters: {
        rollno: user.class_X_rollno,
        FullName: user.name
      },
      consentArtifact: {
        consent: {
          consentId: uuidv4(),
          timestamp: new Date().toISOString(),
          dataConsumer: {
            id: process.env.DATA_CONSUMER_ID
          },
          dataProvider: {
            id: "CBSE"
          },
          purpose: {
            description: "Verification of CBSE Class X certificate"
          },
          user: {
            idType: "MOBILE",
            idNumber: user.mobile,
            mobile: user.mobile,
            email: user.email
          },
          data: {
            id: "CBSE_CERTIFICATE"
          },
          permission: {
            access: "READ",
            dateRange: {
              from: new Date().toISOString(),
              to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
            },
            frequency: {
              unit: "MONTH",
              value: 1,
              repeats: 1
            }
          }
        },
        signature: {
          signature: "dummy_signature" // In a real scenario, this should be a valid signature
        }
      }
    };

    const response = await axios.get('https://apisetu.gov.in/certificate/v3/cbse/spcer', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.API_SETU_TOKEN}`
      },
      data: JSON.stringify(requestData)
    });

    await ApiResponse.create({
      UserId: userId,
      endpoint: '/certificate/v3/cbse/spcer',
      request_data: JSON.stringify(requestData),
      response_data: JSON.stringify(response.data)
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching CBSE certificate:', error);
    throw error;
  }
}


//parsing teh CBSe record to get the family tree for father and mother part:

async function parseCBSECertificate(xmlData) {
  return new Promise((resolve, reject) => {
    xml2js.parseString(xmlData, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

async function updateFamilyTree(userId, fatherName, motherName) {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Update or create father's entry
    await FamilyMember.upsert({
      UserId: userId,
      name: fatherName,
      relationship: 'Father'
    });

    // Update or create mother's entry
    await FamilyMember.upsert({
      UserId: userId,
      name: motherName,
      relationship: 'Mother'
    });

    console.log(`Family tree updated for user ${userId}`);
  } catch (error) {
    console.error('Error updating family tree:', error);
    throw error;
  }
}

async function fetchCBSECertificate(userId) {
  try {
    const user = await User.findByPk(userId);
    if (!user || !user.class_X_rollno || !user.name) {
      throw new Error('User not found or missing required information');
    }

    const requestData = {
      txnId: uuidv4(),
      format: "xml",
      certificateParameters: {
        rollno: user.class_X_rollno,
        FullName: user.name
      },
      consentArtifact: {
        consent: {
          consentId: uuidv4(),
          timestamp: new Date().toISOString(),
          dataConsumer: {
            id: process.env.DATA_CONSUMER_ID
          },
          dataProvider: {
            id: "CBSE"
          },
          purpose: {
            description: "Verification of CBSE Class X certificate"
          },
          user: {
            idType: "MOBILE",
            idNumber: user.mobile,
            mobile: user.mobile,
            email: user.email
          },
          data: {
            id: "CBSE_CERTIFICATE"
          },
          permission: {
            access: "READ",
            dateRange: {
              from: new Date().toISOString(),
              to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
            },
            frequency: {
              unit: "MONTH",
              value: 1,
              repeats: 1
            }
          }
        },
        signature: {
          signature: "dummy_signature" // In a real scenario, this should be a valid signature
        }
      }
    };

    const response = await 

module.exports = {
  generateToken,
  requestConsent,
  fetchConsentStatus,
  requestData,
  fetchData, 
  fetchCBSECertificate
};
