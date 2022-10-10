import {VestingDelegation} from '@hiveio/dhive';
import {Delegator} from 'actions/interfaces';

/**
 * Already ordered per vesting_shares
 */
const delegatees = [
  {
    id: 1350016,
    delegator: 'blocktrades',
    delegatee: 'usainvote',
    vesting_shares: '300.000000 VESTS',
    min_delegation_time: '2020-08-16T05:34:33',
  },
  {
    id: 933999,
    delegator: 'blocktrades',
    delegatee: 'ocdb',
    vesting_shares: '200.902605 VESTS',
    min_delegation_time: '2018-05-25T22:14:30',
  },
  {
    id: 270663,
    delegator: 'blocktrades',
    delegatee: 'buildawhale',
    vesting_shares: '100.000000 VESTS',
    min_delegation_time: '2017-09-29T02:19:03',
  },
  {
    id: 1350016,
    delegator: 'blocktrades',
    delegatee: 'usainvote2',
    vesting_shares: '0 VESTS',
    min_delegation_time: '2020-08-16T05:34:33',
  },
] as VestingDelegation[];

const delegators = [
  {
    delegation_date: '2017-08-09T15:30:36.000Z',
    delegator: 'kriborin',
    vesting_shares: 31692093.5887,
  },
  {
    delegation_date: '2017-08-09T15:29:42.000Z',
    delegator: 'kevtorin',
    vesting_shares: 31691975.1647,
  },
  {
    delegation_date: '2017-08-09T15:31:48.000Z',
    delegator: 'lessys',
    vesting_shares: 29188598.7866,
  },
  {
    delegation_date: '2017-08-09T15:31:48.000Z',
    delegator: 'quentin',
    vesting_shares: 0,
  },
  {
    delegation_date: '2017-08-09T15:31:48.000Z',
    delegator: 'cedricguillas',
    vesting_shares: 0,
  },
] as Delegator[];

export default {delegatees, delegators};
