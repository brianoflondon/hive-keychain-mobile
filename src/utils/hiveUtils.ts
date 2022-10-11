import {ExtendedAccount} from '@hiveio/dhive';
import {
  CollateralizedConversion,
  Delegator,
  GlobalProperties,
  Rpc,
} from 'actions/interfaces';
import api from 'api/keychain';
import {getClient} from './hive';

const HIVE_VOTING_MANA_REGENERATION_SECONDS = 432000;
const HIVE_100_PERCENT = 10000;

export const getVP = (account: ExtendedAccount) => {
  if (!account.name) {
    return null;
  }
  const estimated_max =
    (getEffectiveVestingSharesPerAccount(account) -
      parseFloat(account.vesting_withdraw_rate as string)) *
    1000000;
  const current_mana = parseFloat(
    account.voting_manabar.current_mana as string,
  );
  const last_update_time = account.voting_manabar.last_update_time;
  const diff_in_seconds = Math.round(Date.now() / 1000 - last_update_time);
  let estimated_mana =
    current_mana +
    (diff_in_seconds * estimated_max) / HIVE_VOTING_MANA_REGENERATION_SECONDS;
  if (estimated_mana > estimated_max) {
    console.log('is max'); //TODO to remove
    estimated_mana = estimated_max;
  }
  const estimated_pct = (estimated_mana / estimated_max) * 100;
  return estimated_pct;
};

const getEffectiveVestingSharesPerAccount = (account: ExtendedAccount) => {
  const effective_vesting_shares =
    parseFloat((account.vesting_shares as string).replace(' VESTS', '')) +
    parseFloat(
      (account.received_vesting_shares as string).replace(' VESTS', ''),
    ) -
    parseFloat(
      (account.delegated_vesting_shares as string).replace(' VESTS', ''),
    );
  return effective_vesting_shares;
};

export const getVotingDollarsPerAccount = (
  voteWeight: number,
  properties: GlobalProperties,
  account: ExtendedAccount,
  full: boolean,
) => {
  if (!properties.globals || !account.name) {
    return null;
  }
  const vp = getVP(account)! * 100;
  const rewardBalance = getRewardBalance(properties);
  const recentClaims = getRecentClaims(properties);
  const hivePrice = getHivePrice(properties);
  const votePowerReserveRate = getVotePowerReserveRate(properties);
  if (rewardBalance && recentClaims && hivePrice && votePowerReserveRate) {
    const effective_vesting_shares = Math.round(
      getEffectiveVestingSharesPerAccount(account) * 1000000,
    );
    const current_power = full ? 10000 : vp;
    const weight = voteWeight * 100;

    const max_vote_denom =
      (votePowerReserveRate * HIVE_VOTING_MANA_REGENERATION_SECONDS) /
      (60 * 60 * 24);
    let used_power = Math.round((current_power * weight) / HIVE_100_PERCENT);
    used_power = Math.round((used_power + max_vote_denom - 1) / max_vote_denom);
    const rshares = Math.round(
      (effective_vesting_shares * used_power) / HIVE_100_PERCENT,
    );
    const voteValue = ((rshares * rewardBalance) / recentClaims) * hivePrice;
    return isNaN(voteValue) ? '0' : voteValue.toFixed(2);
  } else {
    return;
  }
};
/* istanbul ignore next */
export const getRC = async (account: ExtendedAccount) => {
  const rcAcc = await getClient().rc.findRCAccounts([account.name]);
  const rc = await getClient().rc.calculateRCMana(rcAcc[0]);
  return rc;
};

const getRewardBalance = (properties: GlobalProperties) => {
  return parseFloat(properties.rewardFund!.reward_balance);
};

const getRecentClaims = (properties: GlobalProperties) => {
  return parseInt(properties.rewardFund!.recent_claims, 10);
};

const getHivePrice = (properties: GlobalProperties) => {
  return (
    parseFloat(properties.price!.base + '') /
    parseFloat(properties.price!.quote + '')
  );
};

const getVotePowerReserveRate = (properties: GlobalProperties) => {
  return properties.globals!.vote_power_reserve_rate;
};

export const getDelegators = async (name: string) => {
  return ((await api.get(`/hive/delegators/${name}`)).data as Delegator[])
    .filter((e) => e.vesting_shares !== 0)
    .sort((a, b) => b.vesting_shares - a.vesting_shares);
};

export const getDelegatees = async (name: string) => {
  return (await getClient().database.getVestingDelegations(name, '', 1000))
    .filter((e) => parseFloat(e.vesting_shares + '') !== 0)
    .sort(
      (a, b) =>
        parseFloat(b.vesting_shares + '') - parseFloat(a.vesting_shares + ''),
    );
};

export const getConversionRequests = async (name: string) => {
  const [hbdConversions, hiveConversions] = await Promise.all([
    getClient().database.call('get_conversion_requests', [name]),
    getClient().database.call('get_collateralized_conversion_requests', [name]),
  ]);

  return [
    ...hiveConversions.map((e: CollateralizedConversion) => ({
      amount: e.collateral_amount,
      conversion_date: e.conversion_date,
      id: e.id,
      owner: e.owner,
      requestid: e.requestid,
      collaterized: true,
    })),
    ...hbdConversions,
  ].sort(
    (a, b) =>
      new Date(a.conversion_date).getTime() -
      new Date(b.conversion_date).getTime(),
  );
};
/* istanbul ignore next */
export const getSavingsRequests = async (name: string) => {
  return await getClient().database.call('get_savings_withdraw_to', [name]);
};
/* istanbul ignore next */
export const rpcList: Rpc[] = [
  {uri: 'DEFAULT', testnet: false},
  {uri: 'https://api.deathwing.me', testnet: false},
  {uri: 'https://api.hive.blog', testnet: false},
  {uri: 'https://api.openhive.network', testnet: false},
  {uri: 'https://api.hivekings.com', testnet: false},
  {uri: 'https://anyx.io', testnet: false},
  {uri: 'https://api.pharesim.me', testnet: false},
  {uri: 'https://hived.emre.sh', testnet: false},
  {uri: 'https://hived.hive-engine.com', testnet: false},
  {uri: 'https://hived.privex.io', testnet: false},
  {uri: 'https://hive.roelandp.nl', testnet: false},
  {uri: 'https://rpc.ausbit.dev', testnet: false},
  {uri: 'https://rpc.ecency.com', testnet: false},
  {uri: 'https://techcoderx.com', testnet: false},
  {uri: 'https://hive-api.arcange.eu', testnet: false},
  {
    uri: 'https://testnet.openhive.network',
    testnet: true,
    chainId: '18dcf0a285365fc58b71f18b3d3fec954aa0c141c44e4e5cb4cf777b9eab274e',
  },
];

export const getAccountKeys = async (username: string) => {
  const account = (await getClient().database.getAccounts([username]))[0];
  return {
    memo: account.memo_key,
    active: account.active,
    posting: account.posting,
  };
};

export const sanitizeUsername = (username: string) =>
  username.toLowerCase().trim();

export const sanitizeAmount = (
  amount: string | number,
  currency?: string,
  decimals = 3,
) => {
  if (typeof amount !== 'string') {
    amount = amount.toString();
  }
  if (currency) {
    return `${parseFloat(amount.replace(/,/g, '.')).toFixed(
      decimals,
    )} ${currency}`;
  } else {
    return `${amount.replace(/,/g, '.')}`;
  }
};
