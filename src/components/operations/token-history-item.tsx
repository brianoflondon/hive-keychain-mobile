import CustomAmountLabel, {
  LabelDataType,
} from 'components/form/CustomAmountLabel';
import Icon from 'components/hive/Icon';
import moment from 'moment';
import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import {connect, ConnectedProps} from 'react-redux';
import {Icons} from 'src/enums/icons.enums';
import {
  AuthorCurationTransaction,
  CommentCurationTransaction,
  CurationRewardTransaction,
  DelegateTokenTransaction,
  MiningLotteryTransaction,
  OperationsHiveEngine,
  StakeTokenTransaction,
  TokenTransaction,
  TransferTokenTransaction,
  UndelegateTokenDoneTransaction,
  UndelegateTokenStartTransaction,
  UnStakeTokenDoneTransaction,
  UnStakeTokenStartTransaction,
} from 'src/interfaces/tokens.interface';
import {RootState} from 'store';
import {Height} from 'utils/common.types';

interface TokenHistoryItemProps {
  transaction: TokenTransaction;
  useIcon?: boolean;
  ariaLabel?: string;
}

const TokenHistoryItem = ({
  transaction,
  activeAccountName,
  useIcon,
  ariaLabel,
}: TokenHistoryItemProps & PropsFromRedux) => {
  const [toggle, setToggle] = useState(false);
  let iconName = '';
  let iconNameSubType = '';
  const localePrefix = 'wallet.operations.tokens';
  let labelDataList: LabelDataType[];
  console.log(transaction);
  const getLabelsComponents = () => {
    function returnWithList(labelDataList: any) {
      return (
        <CustomAmountLabel
          list={labelDataList}
          translatePrefix={localePrefix}
        />
      );
    }

    switch (transaction.operation) {
      case OperationsHiveEngine.COMMENT_AUTHOR_REWARD: {
        const t = transaction as AuthorCurationTransaction;
        labelDataList = [
          {label: 'info_author_reward.part_1'},
          {
            label: 'info_author_reward.amount',
            data: {
              amount: t.amount,
            },
            color: '#3BB26E',
          },
          {label: 'info_author_reward.part_2'},
        ];
        return returnWithList(labelDataList);
      }
      case OperationsHiveEngine.COMMENT_CURATION_REWARD: {
        const t = transaction as CommentCurationTransaction;
        labelDataList = [
          {label: 'info_comment_curation_reward.part_1'},
          {
            label: 'info_comment_curation_reward.amount',
            data: {
              amount: t.amount,
            },
            color: '#3BB26E',
          },
          {label: 'info_comment_curation_reward.part_2'},
        ];
        return returnWithList(labelDataList);
      }
      case OperationsHiveEngine.MINING_LOTTERY: {
        const t = transaction as MiningLotteryTransaction;
        iconName = 'claim_reward_balance';
        labelDataList = [
          {label: 'info_mining_lottery.part_1'},
          {
            label: 'info_mining_lottery.amount',
            data: {
              amount: t.amount,
            },
            color: '#3BB26E',
          },
          {label: 'info_mining_lottery.part_2', data: {poolId: t.poolId}},
        ];
        return returnWithList(labelDataList);
      }
      case OperationsHiveEngine.TOKENS_TRANSFER: {
        const t = transaction as TransferTokenTransaction;
        iconName = 'transfer';
        if (t.from === activeAccountName) {
          labelDataList = [
            {label: 'info_transfer_out.part_1'},
            {
              label: 'info_transfer_out.amount',
              data: {
                amount: t.amount,
              },
              color: '#B9122F',
            },
            {label: 'info_transfer_out.part_2', data: {to: t.to}},
          ];
        } else {
          labelDataList = [
            {label: 'info_transfer_in.part_1'},
            {
              label: 'info_transfer_in.amount',
              data: {amount: t.amount},
              color: '#3BB26E',
            },
            {label: 'info_transfer_in.part_2', data: {from: t.from}},
          ];
        }
        return returnWithList(labelDataList);
      }
      case OperationsHiveEngine.TOKENS_DELEGATE: {
        const t = transaction as DelegateTokenTransaction;
        iconName = 'delegate_vesting_shares';
        if (t.delegator === activeAccountName) {
          labelDataList = [
            {label: 'info_delegation_out.part_1'},
            {
              label: 'info_delegation_out.amount',
              data: {
                amount: t.amount,
              },
              color: '#B9122F',
            },
            {
              label: 'info_delegation_out.part_2',
              data: {delegatee: t.delegatee},
            },
          ];
        } else {
          labelDataList = [
            {
              label: 'info_delegation_in.part_1',
              data: {delegator: t.delegator},
            },
            {
              label: 'info_delegation_in.amount',
              data: {
                amount: t.amount,
              },
              color: '#3BB26E',
            },
          ];
        }
        return returnWithList(labelDataList);
      }
      case OperationsHiveEngine.TOKEN_UNDELEGATE_START: {
        const t = transaction as UndelegateTokenStartTransaction;
        iconName = 'delegate_vesting_shares';
        if (t.delegator === activeAccountName) {
          labelDataList = [
            {
              label: 'info_start_cancel_delegation_out.part_1',
            },
            {
              label: 'info_start_cancel_delegation_out.amount',
              data: {
                amount: t.amount,
              },
              color: '#3BB26E',
            },
            {
              label: 'info_start_cancel_delegation_out.part_2',
              data: {delegatee: t.delegatee},
            },
          ];
        } else {
          labelDataList = [
            {
              label: 'info_start_cancel_delegation_in.part_1',
              data: {delegator: t.delegator},
            },
            {
              label: 'info_start_cancel_delegation_in.amount',
              data: {
                amount: t.amount,
              },
              color: '#B9122F',
            },
            {
              label: 'info_start_cancel_delegation_in.part_2',
            },
          ];
        }
        return returnWithList(labelDataList);
      }
      case OperationsHiveEngine.TOKEN_UNDELEGATE_DONE: {
        const t = transaction as UndelegateTokenDoneTransaction;
        iconName = 'delegate_vesting_shares';
        if (t.delegator === activeAccountName) {
          labelDataList = [
            {
              label: 'info_cancel_delegation_out.part_1',
            },
            {
              label: 'info_cancel_delegation_out.amount',
              data: {amount: t.amount},
              color: '#3BB26E',
            },
            {
              label: 'info_cancel_delegation_out.part_2',
              data: {delegatee: t.delegatee},
            },
          ];
        } else {
          labelDataList = [
            {
              label: 'info_cancel_delegation_in.part_1',
              data: {delegator: t.delegator},
            },
            {
              label: 'info_cancel_delegation_in.amount',
              data: {amount: t.amount},
              color: '#B9122F',
            },
            {
              label: 'info_cancel_delegation_out.part_2',
            },
          ];
        }
        return returnWithList(labelDataList);
      }
      case OperationsHiveEngine.TOKEN_STAKE: {
        const t = transaction as StakeTokenTransaction;
        iconName = 'power_up_down';
        iconNameSubType = 'transfer_to_vesting';
        if (t.from !== activeAccountName) {
          labelDataList = [
            {
              label: 'info_stake_other_user.part_1',
              data: {from: t.from},
            },
            {
              label: 'info_stake_other_user.amount',
              data: {amount: t.amount},
              color: '#3BB26E',
            },
            {
              label: 'info_stake_other_user.part_2',
              data: {to: t.to},
            },
          ];
        } else {
          labelDataList = [
            {
              label: 'info_stake.part_1',
            },
            {
              label: 'info_stake.amount',
              data: {amount: t.amount},
              color: '#3BB26E',
            },
          ];
        }
        return returnWithList(labelDataList);
      }
      case OperationsHiveEngine.TOKEN_UNSTAKE_START: {
        const t = transaction as UnStakeTokenStartTransaction;
        iconName = 'power_up_down';
        iconNameSubType = 'withdraw_vesting';
        labelDataList = [
          {
            label: 'info_start_unstake.part_1',
          },
          {
            label: 'info_start_unstake.amount',
            data: {amount: t.amount},
            color: '#B9122F',
          },
        ];
        return returnWithList(labelDataList);
      }
      case OperationsHiveEngine.TOKEN_UNSTAKE_DONE: {
        const t = transaction as UnStakeTokenDoneTransaction;
        iconName = 'power_up_down';
        iconNameSubType = 'withdraw_vesting';
        labelDataList = [
          {
            label: 'info_unstake_done.amount',
            data: {amount: t.amount},
            color: '#B9122F',
          },
          {
            label: 'info_unstake_done.part_1',
          },
        ];
        return returnWithList(labelDataList);
      }
      case OperationsHiveEngine.TOKEN_ISSUE:
        labelDataList = [
          {label: 'info_issue.part_1'},
          {
            label: 'info_issue.amount',
            data: {amount: transaction.amount},
            color: '#3BB26E',
          },
        ];
        return returnWithList(labelDataList);
      case OperationsHiveEngine.HIVE_PEGGED_BUY:
        iconName = 'convert';
        labelDataList = [
          {label: 'info_pegged_buy.part_1'},
          {
            label: 'info_pegged_buy.amount',
            data: {amount: transaction.amount},
            color: '#3BB26E',
          },
        ];
        return returnWithList(labelDataList);

      default:
        return null;
    }
  };

  const getMemo = () => {
    switch (transaction.operation) {
      case OperationsHiveEngine.TOKENS_TRANSFER: {
        const t = transaction as TransferTokenTransaction;
        return t.memo;
      }
      case OperationsHiveEngine.COMMENT_AUTHOR_REWARD:
      case OperationsHiveEngine.COMMENT_CURATION_REWARD: {
        const t = transaction as CurationRewardTransaction;
        return t.authorPerm;
      }
      default:
        return null;
    }
  };

  const toggleExpandMoreIcon = () => {
    return toggle ? (
      <Icon name={Icons.EXPAND_LESS} />
    ) : (
      <Icon name={Icons.EXPAND_MORE} />
    );
  };

  const label = getLabelsComponents();
  const memo = getMemo();
  const date = moment(transaction.timestamp * 1000).format('L');

  const styles = getDimensionedStyles({
    ...useWindowDimensions(),
  });

  return label ? (
    <View>
      <TouchableOpacity
        style={styles.container}
        onPress={() => {
          setToggle(!toggle);
        }}>
        <View style={styles.main}>
          <View style={styles.rowContainerSpaced}>
            <View style={[styles.row, styles.alignedContent]}>
              {useIcon && <Icon name={iconName} subType={iconNameSubType} />}
              <Text>{date}</Text>
            </View>
            <View>{memo && memo.length ? toggleExpandMoreIcon() : null}</View>
          </View>
          {label}
        </View>
        {toggle && memo && memo.length ? <Text>{memo}</Text> : null}
      </TouchableOpacity>
    </View>
  ) : null;
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccountName: state.activeAccount.name,
  };
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector> & TokenHistoryItemProps;

const getDimensionedStyles = ({height}: Height) =>
  StyleSheet.create({
    container: {
      padding: height * 0.01,
    },
    main: {
      display: 'flex',
      flexDirection: 'column',
    },
    username: {},
    row: {
      display: 'flex',
      flexDirection: 'row',
    },
    rowContainerSpaced: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    rowContainer: {
      flexDirection: 'row',
    },
    alignedContent: {
      alignItems: 'center',
    },
  });

export const TokenHistoryItemComponent = connector(TokenHistoryItem);
