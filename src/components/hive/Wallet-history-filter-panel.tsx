import {ActionPayload, ActiveAccount} from 'actions/interfaces';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {Icons} from 'src/enums/icons.enums';
import {
  ClaimReward,
  CollateralizedConvert,
  Convert,
  Delegation,
  DepositSavings,
  FillCollateralizedConvert,
  FillConvert,
  PowerDown,
  PowerUp,
  ReceivedInterests,
  Transaction,
  Transactions,
  Transfer,
  WithdrawSavings,
} from 'src/interfaces/transaction.interface';
import {WalletHistoryFilter} from 'src/types/wallet.history.types';
import {translate} from 'utils/localize';
import {
  HAS_IN_OUT_TRANSACTIONS,
  MINIMUM_FETCHED_TRANSACTIONS,
  NB_TRANSACTION_FETCHED,
  TRANSFER_TYPE_TRANSACTIONS,
} from 'utils/transactions.utils';
import {WalletHistoryUtils} from 'utils/walletHistoryUtils';
import Icon from './Icon';

interface WalletHistoryFilterPanelProps {
  DEFAULT_WALLET_FILTER: WalletHistoryFilter;
  transactions: Transactions;
  flatListRef: React.MutableRefObject<FlatList>;
  setDisplayedTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  setPreviousTransactionLength: React.Dispatch<React.SetStateAction<number>>;
  user: ActiveAccount;
  previousTransactionLength: number;
  finalizeDisplayedList: (list: Transaction[]) => void;
  setLoading: (value: React.SetStateAction<boolean>) => void;
  fetchAccountTransactions: (accountName: string, start: number) => void;
  walletFilters: WalletHistoryFilter;
  updateWalletFilter: (
    walletFilters: WalletHistoryFilter,
  ) => ActionPayload<WalletHistoryFilter>;
  clearWalletFilters: () => ActionPayload<WalletHistoryFilter>;
}

type Props = WalletHistoryFilterPanelProps;

const WalletHistoryFilterPanel = ({
  DEFAULT_WALLET_FILTER,
  transactions,
  flatListRef,
  user,
  setDisplayedTransactions,
  setPreviousTransactionLength,
  previousTransactionLength,
  finalizeDisplayedList,
  setLoading,
  fetchAccountTransactions,
  walletFilters,
  updateWalletFilter,
  clearWalletFilters,
}: Props) => {
  //removed WalletHistoryPropsFromRedux
  const [filter, setFilter] = useState<WalletHistoryFilter>(walletFilters);
  const [filterReady, setFilterReady] = useState<boolean>(false);
  const [isFilterOpened, setIsFilterPanelOpened] = useState(false);
  let filteredTransactions: Transaction[];

  useEffect(() => {
    initFilters();
  }, []);

  useEffect(() => {
    setPreviousTransactionLength(0);
    if (filterReady && transactions.list.length) {
      filterTransactions();
      saveFilterInLocalStorage();
    }
  }, [filter, transactions]);

  const saveFilterInLocalStorage = async () => {
    updateWalletFilter(filter);
  };

  const initFilters = () => {
    setFilter(walletFilters);
    setFilterReady(true);
  };

  const toggleFilterType = (transactionName: string) => {
    const newFilter = {
      ...filter?.selectedTransactionTypes,
      [transactionName]: !filter?.selectedTransactionTypes![transactionName],
    };
    updateFilter({
      ...filter,
      selectedTransactionTypes: newFilter,
    });
  };

  const toggleFilterIn = () => {
    const newFilter = {
      ...filter,
      inSelected: !filter.inSelected,
    };
    updateFilter(newFilter);
  };

  const toggleFilterOut = () => {
    const newFilter = {
      ...filter,
      outSelected: !filter.outSelected,
    };
    updateFilter(newFilter);
  };

  const updateFilterValue = (value: string) => {
    if (value.trim() !== '') {
      const newFilter = {
        ...filter,
        filterValue: value,
      };
      updateFilter(newFilter);
    }
  };

  const updateFilter = (filter: any) => {
    setFilter(filter);
  };

  const toggleFilter = () => {
    setIsFilterPanelOpened(!isFilterOpened);
  };

  const clearFilters = () => {
    updateWalletFilter(DEFAULT_WALLET_FILTER);
    setFilter(DEFAULT_WALLET_FILTER);
  };

  const handlePressedStyleFilterOperations = (filterOperationType: string) => {
    return filter.selectedTransactionTypes[filterOperationType]
      ? styles.filterSelectorItemPressed
      : styles.filterSelectorItem;
  };

  const handlePressedStyleInOut = (inOutSelected: boolean) => {
    return inOutSelected ? styles.inOutPressedItem : styles.inOutItem;
  };

  const filterTransactions = () => {
    const selectedTransactionsTypes = Object.keys(
      filter.selectedTransactionTypes,
    ).filter(
      (transactionName) => filter.selectedTransactionTypes[transactionName],
    );
    filteredTransactions = transactions.list.filter(
      (transaction: Transaction) => {
        const isInOrOutSelected = filter.inSelected || filter.outSelected;
        if (
          selectedTransactionsTypes.includes(transaction.type) ||
          selectedTransactionsTypes.length === 0
        ) {
          if (
            HAS_IN_OUT_TRANSACTIONS.includes(transaction.type) &&
            isInOrOutSelected
          ) {
            return (
              (filter.inSelected &&
                ((TRANSFER_TYPE_TRANSACTIONS.includes(transaction.type) &&
                  (transaction as Transfer).to === user.name!) ||
                  (transaction.type === 'delegate_vesting_shares' &&
                    (transaction as Delegation).delegatee === user.name!))) ||
              (filter.outSelected &&
                ((TRANSFER_TYPE_TRANSACTIONS.includes(transaction.type) &&
                  (transaction as Transfer).from === user.name!) ||
                  (transaction.type === 'delegate_vesting_shares' &&
                    (transaction as Delegation).delegator === user.name!)))
            );
          } else {
            return true;
          }
        }
      },
    );
    filteredTransactions = filteredTransactions.filter((transaction) => {
      return (
        (TRANSFER_TYPE_TRANSACTIONS.includes(transaction.type) &&
          WalletHistoryUtils.filterTransfer(
            transaction as Transfer,
            filter.filterValue,
            user.name!,
          )) ||
        (transaction.type === 'claim_reward_balance' &&
          WalletHistoryUtils.filterClaimReward(
            transaction as ClaimReward,
            filter.filterValue,
          )) ||
        (transaction.type === 'delegate_vesting_shares' &&
          WalletHistoryUtils.filterDelegation(
            transaction as Delegation,
            filter.filterValue,
            user.name!,
          )) ||
        (transaction.subType === 'withdraw_vesting' &&
          WalletHistoryUtils.filterPowerUpDown(
            transaction as PowerDown,
            filter.filterValue,
          )) ||
        (transaction.subType === 'transfer_to_vesting' &&
          WalletHistoryUtils.filterPowerUpDown(
            transaction as PowerUp,
            filter.filterValue,
          )) ||
        (transaction.subType === 'transfer_from_savings' &&
          WalletHistoryUtils.filterSavingsTransaction(
            transaction as WithdrawSavings,
            filter.filterValue,
          )) ||
        (transaction.subType === 'transfer_to_savings' &&
          WalletHistoryUtils.filterSavingsTransaction(
            transaction as DepositSavings,
            filter.filterValue,
          )) ||
        (transaction.subType === 'interest' &&
          WalletHistoryUtils.filterInterest(
            transaction as ReceivedInterests,
            filter.filterValue,
          )) ||
        (transaction.subType === 'fill_collateralized_convert_request' &&
          WalletHistoryUtils.filterFillConversion(
            transaction as FillCollateralizedConvert,
            filter.filterValue,
          )) ||
        (transaction.subType === 'fill_convert_request' &&
          WalletHistoryUtils.filterFillConversion(
            transaction as FillConvert,
            filter.filterValue,
          )) ||
        (transaction.subType === 'collateralized_convert' &&
          WalletHistoryUtils.filterConversion(
            transaction as CollateralizedConvert,
            filter.filterValue,
          )) ||
        (transaction.subType === 'convert' &&
          WalletHistoryUtils.filterConversion(
            transaction as Convert,
            filter.filterValue,
          )) ||
        (transaction.timestamp &&
          moment(transaction.timestamp)
            .format('L')
            .includes(filter.filterValue.toLowerCase()))
      );
    });
    if (
      (filteredTransactions.length >= MINIMUM_FETCHED_TRANSACTIONS &&
        filteredTransactions.length >= previousTransactionLength + 1) ||
      transactions.list.some((t) => t.last) ||
      transactions.lastUsedStart === 0
    ) {
      finalizeDisplayedList(filteredTransactions);
    } else {
      setLoading(true);
      fetchAccountTransactions(
        user.name!,
        transactions.lastUsedStart - NB_TRANSACTION_FETCHED,
      );
    }
  };

  return (
    <View aria-label="wallet-history-filter-panel">
      <View style={styles.filterTogglerContainer}>
        <View style={styles.filterTogglerInnerContainer}>
          <Text style={styles.filterTitleText}>
            {translate('wallet.filter.filters_title')}
          </Text>
          <TouchableOpacity
            style={styles.circularContainer}
            onPress={() => toggleFilter()}>
            {isFilterOpened ? (
              <Icon name={Icons.EXPAND_LESS} marginRight={false} />
            ) : (
              <Icon name={Icons.EXPAND_MORE} marginRight={false} />
            )}
          </TouchableOpacity>
        </View>
      </View>
      {isFilterOpened && (
        <View style={styles.filtersContainer}>
          <View style={styles.searchPanel}>
            <TextInput
              style={styles.customInputStyle}
              placeholder={translate('common.search_box_placeholder')}
              value={filter.filterValue}
              onChangeText={updateFilterValue}
            />
            <TouchableOpacity
              style={styles.touchableItem}
              aria-label="clear-filters"
              onPress={() => clearFilters()}>
              <Text>{translate('wallet.filter.clear_filters')}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.filterSelectors}>
            <View style={styles.filterSelectorContainer}>
              {filter.selectedTransactionTypes &&
                Object.keys(filter.selectedTransactionTypes).map(
                  (filterOperationType) => (
                    <TouchableOpacity
                      style={handlePressedStyleFilterOperations(
                        filterOperationType,
                      )}
                      aria-label={`filter-selector-${filterOperationType}`}
                      key={filterOperationType}
                      onPress={() => toggleFilterType(filterOperationType)}>
                      <Text>
                        {translate(`wallet.filter.${filterOperationType}`)}
                      </Text>
                    </TouchableOpacity>
                  ),
                )}
            </View>
            <View>
              <TouchableOpacity
                style={handlePressedStyleInOut(filter.inSelected)}
                aria-label="filter-by-incoming"
                onPress={() => toggleFilterIn()}>
                <Text>{translate('wallet.filter.filter_in')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={handlePressedStyleInOut(filter.outSelected)}
                aria-label="filter-by-outgoing"
                onPress={() => toggleFilterOut()}>
                <Text>{translate('wallet.filter.filter_out')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  filtersContainer: {
    flexDirection: 'column',
  },
  filterTogglerContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterTogglerInnerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  circularContainer: {
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    borderRadius: 100,
    margin: 4,
    height: 30,
    width: 30,
  },
  filterTogglerText: {
    color: 'black',
    fontWeight: 'bold',
  },
  inOutItem: {
    borderColor: 'black',
    width: 65,
    borderWidth: 1,
    borderRadius: 8,
    padding: 4,
    margin: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inOutPressedItem: {
    borderColor: 'black',
    width: 65,
    borderWidth: 1,
    borderRadius: 8,
    padding: 4,
    margin: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#b1aeae',
  },
  touchableItem: {
    borderColor: 'black',
    width: '20%',
    borderWidth: 1,
    borderRadius: 8,
    padding: 4,
    margin: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchableItem2: {
    borderColor: 'black',
    width: '50%',
    borderWidth: 1,
    borderRadius: 8,
    padding: 4,
    margin: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterSelectors: {
    flexDirection: 'row',
  },
  filterSelectorContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  filterSelectorItem: {
    width: '45%',
    margin: 4,
    borderWidth: 1,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    height: 30,
  },
  filterSelectorItemPressed: {
    width: '45%',
    margin: 4,
    borderWidth: 1,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    height: 30,
    backgroundColor: '#b1aeae',
  },
  pressedStyle: {
    borderColor: 'black',
    width: '20%',
    borderWidth: 1,
    borderRadius: 8,
    padding: 4,
    margin: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#b1aeae',
  },
  customInputStyle: {
    width: '60%',
    height: 40,
    borderWidth: 1,
    marginTop: 4,
    marginBottom: 4,
    borderRadius: 8,
    marginLeft: 4,
    padding: 6,
  },
  searchPanel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterTitleText: {
    fontWeight: 'bold',
  },
});

export default WalletHistoryFilterPanel;
