import {loadAccount} from 'actions/hive';
import {setRpc} from 'actions/index';
import {Rpc} from 'actions/interfaces';
import {removePreference} from 'actions/preferences';
import CustomPicker from 'components/form/CustomPicker';
import UserPicker from 'components/form/UserPicker';
import CollapsibleSettings from 'components/settings/CollapsibleSettings';
import FocusAwareStatusBar from 'components/ui/FocusAwareStatusBar';
import SafeArea from 'components/ui/SafeArea';
import Separator from 'components/ui/Separator';
import useLockedPortrait from 'hooks/useLockedPortrait';
import {SettingsNavigation} from 'navigators/MainDrawer.types';
import React from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import {connect, ConnectedProps} from 'react-redux';
import {RootState} from 'store';
import {rpcList} from 'utils/hiveUtils';
import {translate} from 'utils/localize';

const Settings = ({
  setRpc,
  settings,
  accounts,
  active,
  loadAccount,
  preferences,
  removePreference,
  navigation,
}: PropsFromRedux & {navigation: SettingsNavigation}) => {
  useLockedPortrait(navigation);
  const showPreferencesHandler = () => {
    const userPreference = preferences.find((e) => e.username === active.name);
    if (!userPreference || !userPreference.domains.length)
      return <Text>{translate('settings.settings.no_pref')}</Text>;
    return (
      <FlatList
        data={userPreference.domains}
        renderItem={(preference) => {
          return (
            <CollapsibleSettings
              username={active.name}
              key={preference.item.domain}
              index={preference.index}
              domainPref={preference.item}
              removePreference={removePreference}
            />
          );
        }}
      />
    );
  };

  const customSortRpctList = (orderedRpcList: Rpc[]) => {
    if (typeof settings.rpc === 'object') {
      const selectedIndex = orderedRpcList.findIndex(
        (item) => item.uri === (settings.rpc as Rpc).uri,
      );
      const temp = orderedRpcList[0];
      orderedRpcList[0] = orderedRpcList[selectedIndex];
      orderedRpcList[selectedIndex] = temp;
    }
    return orderedRpcList;
  };

  return (
    <SafeArea>
      <FocusAwareStatusBar barStyle="light-content" backgroundColor="black" />
      <View style={styles.view}>
        <Text style={styles.title}>
          {translate('settings.settings.global')}
        </Text>
        <Text style={styles.subtitle}>
          {translate('settings.settings.rpc')}
        </Text>
        {//@ts-ignore
        translate('settings.settings.disclaimer').map((disclaimer, i) => (
          <Text key={i} style={styles.disclaimer}>
            {disclaimer}
          </Text>
        ))}
        <Separator height={20} />
        <CustomPicker
          list={customSortRpctList(rpcList)}
          onSelected={setRpc}
          selectedValue={settings.rpc}
          labelCreator={(rpc: Rpc) =>
            `${rpc.uri} ${rpc.testnet ? '(TESTNET)' : ''}`
          }
          prompt={translate('components.picker.prompt_rpc')}
        />
        <View style={styles.separator}></View>
        <Text style={[styles.title, styles.userSettings]}>
          {translate('settings.settings.user')}
        </Text>
        <UserPicker
          accounts={accounts.map((e) => e.name)}
          username={active.name}
          onAccountSelected={(account) => {
            loadAccount(account, true);
          }}
        />
        <Separator />
        <Text style={styles.subtitle}>
          {' '}
          {translate('settings.settings.whitelisted')}
        </Text>
        <Separator />
        {showPreferencesHandler()}
      </View>
    </SafeArea>
  );
};

const styles = StyleSheet.create({
  separator: {borderBottomWidth: 1, paddingTop: 15},
  view: {paddingHorizontal: 20, backgroundColor: 'white', height: '100%'},
  title: {
    color: '#404950',
    fontWeight: 'bold',
    fontSize: 18,
    marginVertical: 15,
    textTransform: 'uppercase',
  },
  subtitle: {
    color: '#404950',
    fontSize: 16,
    marginBottom: 15,
    textTransform: 'uppercase',
  },
  disclaimer: {color: '#404950', marginVertical: 2},
  button: {backgroundColor: '#B9122F'},
  userSettings: {marginBottom: 0},
});

const mapStateToProps = (state: RootState) => ({
  settings: state.settings,
  accounts: state.accounts,
  active: state.activeAccount,
  preferences: state.preferences,
});
const connector = connect(mapStateToProps, {
  setRpc,
  loadAccount,
  removePreference,
});
type PropsFromRedux = ConnectedProps<typeof connector>;
export default connector(Settings);
