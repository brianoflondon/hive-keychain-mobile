import {DrawerNavigationProp} from '@react-navigation/drawer';
import {
  ActionPayload,
  Browser,
  BrowserPayload,
  Page,
  TabFields,
} from 'actions/interfaces';
import Home from 'assets/browser/home.svg';
import Favorite from 'assets/browser/icon_favorite.svg';
import NotFavorite from 'assets/browser/icon_favorite_default.svg';
import DrawerButton from 'components/ui/DrawerButton';
import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {EdgeInsets, useSafeAreaInsets} from 'react-native-safe-area-context';
import GestureRecognizer from 'react-native-swipe-gestures';
import {urlTransformer} from 'utils/browser';
import {BrowserConfig} from 'utils/config';
import {translate} from 'utils/localize';

type Props = {
  browser: Browser;
  updateTab: (id: number, data: TabFields) => ActionPayload<BrowserPayload>;
  startSearch: (b: boolean) => void;
  addToFavorites: (page: Page) => ActionPayload<BrowserPayload>;
  removeFromFavorites: (url: string) => ActionPayload<BrowserPayload>;
  swipeToTab: (right: boolean) => void;
  landscape: boolean;
  navigation: DrawerNavigationProp<any>;
};

const BrowserHeader = ({
  browser: {activeTab, tabs, favorites, showManagement},
  navigation,
  updateTab,
  startSearch,
  addToFavorites,
  removeFromFavorites,
  swipeToTab,
  landscape,
}: Props) => {
  const {HEADER_HEIGHT} = BrowserConfig;
  const insets = useSafeAreaInsets();
  const styles = getStyles(HEADER_HEIGHT, insets, landscape);

  const goHome = () => {
    updateTab(activeTab, {url: BrowserConfig.HOMEPAGE_URL});
  };
  if (
    tabs &&
    activeTab &&
    tabs.find((e) => e.id === activeTab) &&
    !showManagement
  ) {
    const active = tabs.find((e) => e.id === activeTab);
    const activeUrl = active.url;
    console.log('From Header: ', {activeUrl});
    const renderFavoritesButton = () => {
      if (activeUrl === BrowserConfig.HOMEPAGE_URL) return null;
      return favorites.find((e) => e.url === activeUrl) ? (
        <TouchableOpacity
          style={[styles.icon]}
          onPress={() => {
            removeFromFavorites(activeUrl);
          }}>
          <Favorite width={17} height={16} color="#E5E5E5" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.icon]}
          onPress={() => {
            addToFavorites(active);
          }}>
          <NotFavorite width={17} height={16} color="#E5E5E5" />
        </TouchableOpacity>
      );
    };
    return (
      <GestureRecognizer
        style={styles.container}
        onSwipeLeft={() => {
          swipeToTab(false);
        }}
        onSwipeRight={() => {
          swipeToTab(true);
        }}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.icon} onPress={goHome}>
            <Home width={17} height={16} color="#E5E5E5" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.textContainer}
            onPress={() => {
              startSearch(true);
            }}>
            <Text
              style={
                activeUrl !== BrowserConfig.HOMEPAGE_URL
                  ? styles.url
                  : styles.search
              }
              numberOfLines={1}>
              {activeUrl !== BrowserConfig.HOMEPAGE_URL
                ? urlTransformer(activeUrl).hostname +
                  urlTransformer(activeUrl).pathname
                : translate('browser.search')}
            </Text>
          </TouchableOpacity>
          {renderFavoritesButton()}
        </View>

        <DrawerButton navigation={navigation} />
      </GestureRecognizer>
    );
  } else {
    return (
      <View style={styles.container}>
        <Text style={styles.browser}>{translate('navigation.browser')}</Text>
        <DrawerButton navigation={navigation} />
      </View>
    );
  }
};

const getStyles = (height: number, insets: EdgeInsets, landscape: boolean) =>
  StyleSheet.create({
    container: {
      height: height + insets.top,
      backgroundColor: 'black',
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: insets.top,
      paddingLeft: 20,
      paddingBottom: 7,
    },
    topBar: {
      height: 32,
      backgroundColor: '#535353',
      borderRadius: 6,
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    textContainer: {
      lineHeight: 32,
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    url: {color: 'white', fontSize: 18, flex: 1},
    search: {fontSize: 18, flex: 1, color: '#E5E5E5', fontStyle: 'italic'},
    browser: {color: 'white', fontSize: 18, fontWeight: 'bold'},
    icon: {paddingHorizontal: 10},
    drawerButton: {alignSelf: 'center'},
  });

export default BrowserHeader;
