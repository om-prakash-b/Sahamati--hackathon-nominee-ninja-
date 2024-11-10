const { User, FamilyMember, FinancialAccount, Nominee, ApiResponse } = require('../models');
const bcrypt = require('bcrypt');

exports.createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password_hash });
    res.status(201).json({ message: 'User created successfully', userId: user.id });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
};

exports.addFamilyMember = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, relationship } = req.body;
    const familyMember = await FamilyMember.create({ name, relationship, UserId: userId });
    res.status(201).json({ message: 'Family member added successfully', familyMemberId: familyMember.id });
  } catch (error) {
    res.status(500).json({ message: 'Error adding family member', error: error.message });
  }
};

exports.addFinancialAccount = async (req, res) => {
  try {
    const { userId } = req.params;
    const { bank_name, account_type, account_number, balance } = req.body;
    const account = await FinancialAccount.create({
      bank_name,
      account_type,
      account_number,
      balance,
      UserId: userId,
    });
    res.status(201).json({ message: 'Financial account added successfully', accountId: account.id });
  } catch (error) {
    res.status(500).json({ message: 'Error adding financial account', error: error.message });
  }
};

exports.addNominee = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { familyMemberId, allocation_percentage } = req.body;
    const nominee = await Nominee.create({
      FinancialAccountId: accountId,
      FamilyMemberId: familyMemberId,
      allocation_percentage,
    });
    await FinancialAccount.update({ has_nominee: true }, { where: { id: accountId } });
    res.status(201).json({ message: 'Nominee added successfully', nomineeId: nominee.id });
  } catch (error) {
    res.status(500).json({ message: 'Error adding nominee', error: error.message });
  }
};

exports.storeApiResponse = async (req, res) => {
  try {
    const { userId } = req.params;
    const { endpoint, response_data } = req.body;
    const apiResponse = await ApiResponse.create({
      UserId: userId,
      endpoint,
      response_data,
    });
    res.status(201).json({ message: 'API response stored successfully', responseId: apiResponse.id });
  } catch (error) {
    res.status(500).json({ message: 'Error storing API response', error: error.message });
  }
};
