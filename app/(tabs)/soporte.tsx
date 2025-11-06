import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function SoporteScreen() {
  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch((err) => console.error('Error abriendo link:', err));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Soporte</Text>
        
        <TouchableOpacity 
          style={styles.option}
          onPress={() => handleOpenLink('https://wa.me/5215645530082')}
        >
          <MaterialIcons name="chat" size={24} color="#25D366" />
          <Text style={styles.optionText}>Soporte Técnico / Ventas</Text>
          <MaterialIcons name="open-in-new" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.option}
          onPress={() => handleOpenLink('https://chat.whatsapp.com/Lryh2qr01r24zLPw3Yojmt?mode=ems_copy_c')}
        >
          <MaterialIcons name="group" size={24} color="#25D366" />
          <Text style={styles.optionText}>Grupo WhatsApp</Text>
          <MaterialIcons name="open-in-new" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.option}
          onPress={() => handleOpenLink('https://t.me/todoss0mostr4ders')}
        >
          <MaterialIcons name="send" size={24} color="#0088cc" />
          <Text style={styles.optionText}>Grupo Telegram</Text>
          <MaterialIcons name="open-in-new" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.option}
          onPress={() => handleOpenLink('https://es.trustpilot.com/review/tradingsinperdidas.com')}
        >
          <MaterialIcons name="star" size={24} color="#FFD700" />
          <Text style={styles.optionText}>Testimonios</Text>
          <MaterialIcons name="open-in-new" size={20} color="#999" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Redes Sociales</Text>
        
        <TouchableOpacity 
          style={styles.option}
          onPress={() => handleOpenLink('https://www.facebook.com/share/1Jq9XMZ6xN/')}
        >
          <MaterialIcons name="facebook" size={24} color="#1877F2" />
          <Text style={styles.optionText}>Facebook</Text>
          <MaterialIcons name="open-in-new" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.option}
          onPress={() => handleOpenLink('https://x.com/todoss0mostr4dr?t=Bg2Cq-mbev0HsZm0_CyzFg&s=09')}
        >
          <MaterialIcons name="alternate-email" size={24} color="#000" />
          <Text style={styles.optionText}>X (Twitter)</Text>
          <MaterialIcons name="open-in-new" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.option}
          onPress={() => handleOpenLink('https://www.instagram.com/todoss0mostr4ders?igsh=eDJtZTkzZHVodWp0')}
        >
          <MaterialIcons name="camera-alt" size={24} color="#E4405F" />
          <Text style={styles.optionText}>Instagram</Text>
          <MaterialIcons name="open-in-new" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.option}
          onPress={() => handleOpenLink('https://www.youtube.com/@todossomostraders')}
        >
          <MaterialIcons name="play-circle" size={24} color="#FF0000" />
          <Text style={styles.optionText}>YouTube</Text>
          <MaterialIcons name="open-in-new" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.option}
          onPress={() => handleOpenLink('https://www.tiktok.com/@todossomostraders0?_t=ZS-90TOLp5oE53&_r=1')}
        >
          <MaterialIcons name="music-note" size={24} color="#000" />
          <Text style={styles.optionText}>TikTok</Text>
          <MaterialIcons name="open-in-new" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.option}
          onPress={() => handleOpenLink('https://www.threads.com/@todoss0mostr4ders')}
        >
          <MaterialIcons name="forum" size={24} color="#000" />
          <Text style={styles.optionText}>Threads</Text>
          <MaterialIcons name="open-in-new" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.option}
          onPress={() => handleOpenLink('https://www.linkedin.com/in/david-del-rio-93512538a?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app')}
        >
          <MaterialIcons name="business" size={24} color="#0077B5" />
          <Text style={styles.optionText}>LinkedIn</Text>
          <MaterialIcons name="open-in-new" size={20} color="#999" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    marginLeft: 12,
  },
});

