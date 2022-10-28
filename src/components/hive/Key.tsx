import Clipboard from '@react-native-community/clipboard';
import {Account, KeyTypes} from 'actions/interfaces';
import Copy from 'assets/settings/copy.svg';
import Remove from 'assets/settings/remove.svg';
import ViewIcon from 'assets/settings/view.svg';
import EllipticButton from 'components/form/EllipticButton';
import AddKey from 'components/modals/AddKey';
import RoundButton from 'components/operations/OperationsButtons';
import Separator from 'components/ui/Separator';
import {MainNavigation} from 'navigators/Root.types';
import React, {useEffect, useState} from 'react';
import {StyleProp, StyleSheet, Text, View, ViewProps} from 'react-native';
import Toast from 'react-native-simple-toast';
import {KeyUtils} from 'utils/key.utils';
import {translate} from 'utils/localize';

type Props = {
  type: KeyTypes;
  account: Account;
  containerStyle: StyleProp<ViewProps>;
  forgetKey: (username: string, key: KeyTypes) => void;
  navigation: MainNavigation;
};
export default ({
  type,
  account,
  forgetKey,
  containerStyle,
  navigation,
}: Props) => {
  if (!account) {
    return null;
  }

  const privateKey = account.keys[type];
  const publicKey = account.keys[`${type}Pubkey` as KeyTypes];
  const [isPKShown, showPK] = useState(false);
  const [isAuthorizedAccount, setIsAuthorizedAccount] = useState(false);

  useEffect(() => {
    if (publicKey) {
      setIsAuthorizedAccount(KeyUtils.isAuthorizedAccount(publicKey));
    }
  }, [publicKey]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      showPK(false);
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={containerStyle}>
      <View style={styles.row}>
        <Text style={styles.keyAuthority}>
          {translate('keys.key_type', {
            type: translate(`keys.${type}`),
          }).toUpperCase()}
        </Text>
        {privateKey && (
          <RemoveKey
            forgetKey={() => {
              forgetKey(account.name, type);
            }}
          />
        )}
      </View>
      <Separator height={20} />
      {privateKey ? (
        <>
          <View style={styles.row}>
            <Text style={styles.keyType}>
              {translate('common.public').toUpperCase()}
            </Text>
            {!isAuthorizedAccount && <CopyKey wif={publicKey} />}
          </View>
          <Separator height={5} />

          <Text style={styles.key}>
            {isAuthorizedAccount
              ? translate('keys.using_authorized_account', {
                  authorizedAccount: publicKey,
                })
              : publicKey}
          </Text>
          <Separator height={20} />
          <View style={styles.row}>
            <Text style={styles.keyType}>
              {translate('common.private').toUpperCase()}
            </Text>
            <View style={[styles.row, styles.privateActions]}>
              <ViewKey
                isPKShown={isPKShown}
                toggle={() => {
                  showPK(!isPKShown);
                }}
              />
              <CopyKey wif={privateKey} />
            </View>
          </View>
          <Separator height={5} />
          <Text style={isPKShown ? styles.key : styles.keyHidden}>
            {isPKShown ? privateKey : hidePrivateKey(privateKey)}
          </Text>
        </>
      ) : (
        <View>
          <Separator />
          <EllipticButton
            title={translate('settings.keys.add')}
            style={styles.addKey}
            onPress={() => {
              navigation.navigate('ModalScreen', {
                modalContent: <AddKey type={type} name={account.name} />,
              });
            }}
          />
          <Separator height={30} />
        </View>
      )}
    </View>
  );
};

const RemoveKey = ({forgetKey}: {forgetKey: () => void}) => {
  return (
    <RoundButton
      onPress={forgetKey}
      size={30}
      backgroundColor="#000000"
      content={<Remove />}
    />
  );
};

const CopyKey = ({wif}: {wif: string}) => {
  return (
    <RoundButton
      onPress={() => {
        Clipboard.setString(wif);
        Toast.show(translate('toast.keys.copied'));
      }}
      size={30}
      backgroundColor="#7E8C9A"
      content={<Copy />}
    />
  );
};
type ViewKeyProps = {toggle: () => void; isPKShown: boolean};
const ViewKey = ({toggle, isPKShown}: ViewKeyProps) => {
  return (
    <RoundButton
      onPress={toggle}
      size={30}
      backgroundColor={isPKShown ? '#B9122F' : '#7E8C9A'}
      content={<ViewIcon />}
    />
  );
};

const hidePrivateKey = (privateKey: string) => {
  let hiddenKey = '';
  for (let i = 0; i < privateKey.length; i++) {
    hiddenKey += '\u25cf ';
  }
  return hiddenKey;
};

const styles = StyleSheet.create({
  keyAuthority: {color: '#7E8C9A', fontSize: 20},
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  keyType: {color: '#404950', fontSize: 14},
  key: {color: '#404950', fontSize: 10, lineHeight: 12},
  keyHidden: {color: '#404950', fontSize: 5, lineHeight: 12},
  privateActions: {width: '20%'},
  addKey: {
    backgroundColor: '#7E8C9A',
  },
});
