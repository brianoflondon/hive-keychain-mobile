import {DynamicGlobalProperties, ExtendedAccount} from '@hiveio/dhive';
import {Bittrex} from 'actions/interfaces';
import api from 'api/keychain';
import {toHP} from 'utils/format';

export const getBittrexPrices = async () => {
  return (await api.get('/hive/v2/bittrex')).data;
};

export const getAccountValue = (
  {
    hbd_balance,
    balance,
    vesting_shares,
    savings_balance,
    savings_hbd_balance,
  }: ExtendedAccount,
  {hive, hbd}: Bittrex,
  props: DynamicGlobalProperties,
) => {
  if (!hbd.Usd || !hive.Usd) return 0;
  return (
    (parseFloat(hbd_balance as string) +
      parseFloat(savings_hbd_balance as string)) *
      parseFloat(hbd.Usd) +
    (toHP(vesting_shares as string, props) +
      parseFloat(balance as string) +
      parseFloat(savings_balance as string)) *
      parseFloat(hive.Usd)
  ).toFixed(3);
};
