const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/database');

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
});

const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

const FamilyMember = sequelize.define('FamilyMember', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  relationship: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

const FinancialAccount = sequelize.define('FinancialAccount', {
  bank_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  account_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  account_number: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  balance: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  has_nominee: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

const Nominee = sequelize.define('Nominee', {
  allocation_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
  },
});

const ApiResponse = sequelize.define('ApiResponse', {
  endpoint: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  response_data: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
});

User.hasMany(FamilyMember);
FamilyMember.belongsTo(User);

User.hasMany(FinancialAccount);
FinancialAccount.belongsTo(User);

FinancialAccount.hasMany(Nominee);
Nominee.belongsTo(FinancialAccount);

FamilyMember.hasMany(Nominee);
Nominee.belongsTo(FamilyMember);

User.hasMany(ApiResponse);
ApiResponse.belongsTo(User);

module.exports = {
  sequelize,
  User,
  FamilyMember,
  FinancialAccount,
  Nominee,
  ApiResponse,
};


//COde to refresh the sahamati access token 
const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/database');

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
});
const AuthToken = sequelize.define('AuthToken', {
  token: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});


const ApiResponse = sequelize.define('ApiResponse', {
  endpoint: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  request_data: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  response_data: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

module.exports = {
  sequelize,
  ApiResponse,
};

const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/database');

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
});



const ConsentRequest = sequelize.define('ConsentRequest', {
  handle: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  redirect_url: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'PENDING',
  },
});

User.hasMany(ConsentRequest);
ConsentRequest.belongsTo(User);

const DataRequestSession = sequelize.define('DataRequestSession', {
  session_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  consent_handle: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'PENDING',
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
});

User.hasMany(DataRequestSession);
DataRequestSession.belongsTo(User);

module.exports = {
  sequelize,
  User,
  FamilyMember,
  FinancialAccount,
  Nominee,
  ApiResponse,
  ConsentRequest,
  AuthToken,
  DataRequestSession,
};
