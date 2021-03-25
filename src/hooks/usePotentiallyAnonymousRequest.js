import {useState} from 'react';
import {getValidAuthorityAccounts} from 'utils/keychain';

export default (request, accounts) => {
  const {method, username} = request;

  let initAcc;
  if (username) {
    initAcc = accounts.find((e) => e.name === username);
  } else {
    accounts = getValidAuthorityAccounts(accounts, method.toLowerCase());
    initAcc = accounts[0];
  }
  const [account, setAccount] = useState(initAcc);

  const getAccountKey = () => {
    return account.keys[method.toLowerCase()];
  };
  const getAccountPublicKey = () => {
    return account.keys[`${method.toLowerCase()}Pubkey`];
  };
  return [account, setAccount, getAccountKey, getAccountPublicKey];
};
