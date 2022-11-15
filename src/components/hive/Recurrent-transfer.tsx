import {ActiveAccount, Transaction} from 'actions/interfaces';
import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import {RecurrentTransfer as RecurrentTransferInterface} from 'src/interfaces/transaction.interface';
import {Height} from 'utils/common.types';
import {translate} from 'utils/localize';
import Icon from './Icon';

type Props = {
  user: ActiveAccount;
  transaction: Transaction;
  token?: boolean;
  locale: string;
  useIcon?: boolean;
};

const RecurrentTransfer = ({
  transaction,
  user,
  locale,
  token = false,
  useIcon,
}: Props) => {
  const [toggle, setToggle] = useState(false);
  const username = user.name;
  const {
    timestamp,
    from,
    to,
    amount,
    memo,
    executions,
    recurrence,
  } = transaction as RecurrentTransferInterface;
  const other = from === username ? to : from;
  const direction = from === username ? '-' : '+';
  const color = direction === '+' ? '#3BB26E' : '#B9122F';
  const date = new Date(
    token ? ((timestamp as unknown) as number) * 1000 : timestamp,
  ).toLocaleDateString([locale], {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
  });

  const styles = getDimensionedStyles({
    ...useWindowDimensions(),
    color,
  });
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => {
        setToggle(!toggle);
      }}>
      <View style={styles.main}>
        <View style={[styles.row, styles.alignedContent]}>
          {useIcon && <Icon name={transaction.type} />}
          <Text>{date}</Text>
        </View>
        <View style={styles.rowContainer}>
          <Text style={styles.username}>
            {direction === '-'
              ? translate(
                  'wallet.operations.transfer.start_recurrent_transfer_out',
                  {
                    amount,
                    other,
                    recurrence,
                    executions,
                  },
                )
              : null}
          </Text>
        </View>
        {/* <Text style={styles.amount}>{`${direction} ${withCommas(amount)} ${
          amount.split(' ')[1]
        }`}</Text> */}
      </View>
      {toggle && memo && memo.length ? (
        <View>
          <Text>
            Each: {recurrence} / Executions: {executions}
          </Text>
          <Text>Memo: {memo}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

const getDimensionedStyles = ({height, color}: Height & {color: string}) =>
  StyleSheet.create({
    container: {
      borderBottomWidth: 1,
      borderColor: 'black',
      padding: height * 0.01,
    },
    main: {
      display: 'flex',
      flexDirection: 'column',
    },
    username: {},
    amount: {color},
    row: {
      display: 'flex',
      flexDirection: 'row',
    },
    rowContainer: {
      display: 'flex',
      flexDirection: 'row',
    },
    alignedContent: {
      alignItems: 'center',
    },
  });

export default RecurrentTransfer;
