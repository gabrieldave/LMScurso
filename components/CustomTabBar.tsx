import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { useTabBarVisibility } from '../lib/contexts/TabBarContext';

export default function CustomTabBar() {
  const { isVisible } = useTabBarVisibility();
  const pathname = usePathname();

  if (!isVisible) {
    return null;
  }

  const tabs = [
    {
      name: 'Catálogo',
      route: '/(tabs)/catalogo',
      icon: 'home',
    },
    {
      name: 'Soporte',
      route: '/(tabs)/soporte',
      icon: 'support-agent',
    },
    {
      name: 'Perfil',
      route: '/(tabs)/perfil',
      icon: 'person',
    },
  ];

  const isActive = (route: string) => {
    if (!pathname) return false;
    
    if (route === '/(tabs)/catalogo') {
      return pathname === '/catalogo' || 
             pathname === '/(tabs)/catalogo' || 
             pathname.startsWith('/curso/') ||
             pathname.startsWith('/leccion/');
    }
    if (route === '/(tabs)/soporte') {
      return pathname === '/soporte' || pathname === '/(tabs)/soporte';
    }
    if (route === '/(tabs)/perfil') {
      return pathname === '/perfil' || pathname === '/(tabs)/perfil';
    }
    return false;
  };

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => {
        const active = isActive(tab.route);
        return (
          <TouchableOpacity
            key={tab.route}
            style={styles.tabItem}
            onPress={() => {
              try {
                router.push(tab.route as any);
              } catch (error) {
                console.error('Error navegando:', error);
              }
            }}
          >
            <MaterialIcons
              name={tab.icon as any}
              size={24}
              color={active ? '#4285F4' : '#999'}
            />
            <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingBottom: 8,
    paddingTop: 8,
    height: 60,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  tabLabelActive: {
    color: '#4285F4',
  },
});
