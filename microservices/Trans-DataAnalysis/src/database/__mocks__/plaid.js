const plaid = jest.createMockFromModule('plaid');

plaid.Configuration = jest.fn();
plaid.PlaidApi = jest.fn();

plaid.PlaidEnvironments = {
    sandbox: 'sandbox',
};

module.exports = plaid;
