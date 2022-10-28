import {addKey, forgetAccount, forgetKey} from 'actions/index';
import {KeyTypes} from 'actions/interfaces';
import EllipticButton from 'components/form/EllipticButton';
import UserPicker from 'components/form/UserPicker';
import Key from 'components/hive/Key';
import FocusAwareStatusBar from 'components/ui/FocusAwareStatusBar';
import SafeArea from 'components/ui/SafeArea';
import Separator from 'components/ui/Separator';
import useLockedPortrait from 'hooks/useLockedPortrait';
import {MainNavigation} from 'navigators/Root.types';
import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, Text, ViewStyle} from 'react-native';
import {connect, ConnectedProps} from 'react-redux';
import {RootState} from 'store';
import {translate} from 'utils/localize';
import {navigate} from 'utils/navigation';

const AccountManagement = ({
  account,
  forgetKey,
  forgetAccount,
  addKey,
  navigation,
  accounts,
}: PropsFromRedux & {navigation: MainNavigation}) => {
  const [username, setUsername] = useState(account.name);
  useLockedPortrait(navigation);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setUsername(account.name);
    });
    return unsubscribe;
  }, [navigation, account.name]);
  if (!username) return null;

  return (
    <SafeArea style={styles.safeArea}>
      <FocusAwareStatusBar barStyle="light-content" backgroundColor="black" />

      <ScrollView>
        <UserPicker
          username={username}
          accounts={accounts.map((acc) => acc.name)}
          onAccountSelected={(name) => {
            setUsername(name);
          }}
        />
        {//@ts-ignore
        translate('settings.keys.disclaimer').map((e, i) => (
          //@ts-ignore
          <Text key={i} style={styles[e.style_do_not_translate]}>
            {e.text}
          </Text>
        ))}
        <Separator height={20} />
        <Key
          type={KeyTypes.posting}
          containerStyle={styles.keyOdd as ViewStyle}
          account={accounts.find((e) => e.name === username)}
          forgetKey={forgetKey}
          navigation={navigation}
        />
        <Key
          type={KeyTypes.active}
          containerStyle={styles.keyEven as ViewStyle}
          account={accounts.find((e) => e.name === username)}
          forgetKey={forgetKey}
          navigation={navigation}
        />
        <Key
          type={KeyTypes.memo}
          containerStyle={styles.keyOdd as ViewStyle}
          account={accounts.find((e) => e.name === username)}
          forgetKey={forgetKey}
          navigation={navigation}
        />
        <Separator height={20} />
        <EllipticButton
          style={styles.button}
          title="FORGET ACCOUNT"
          onPress={() => {
            if (username) {
              forgetAccount(username);
              navigate('WALLET');
            }
          }}
        />
        <Separator height={50} />
      </ScrollView>
    </SafeArea>
  );
};

const styles = StyleSheet.create({
  disclaimer: {color: '#404950', marginVertical: 2, paddingHorizontal: 20},
  important: {
    color: '#A3112A',
    fontWeight: 'bold',
    marginVertical: 2,
    paddingHorizontal: 20,
  },
  button: {backgroundColor: '#B9122F'},
  keyOdd: {backgroundColor: '#E5EEF7', padding: 20},
  keyEven: {backgroundColor: '#FFFFFF', padding: 20},
  safeArea: {backgroundColor: 'white'},
});

const mapStateToProps = (state: RootState) => ({
  account: state.activeAccount,
  accounts: state.accounts,
});
const connector = connect(mapStateToProps, {
  forgetAccount,
  addKey,
  forgetKey,
});
type PropsFromRedux = ConnectedProps<typeof connector>;
export default connector(AccountManagement);
