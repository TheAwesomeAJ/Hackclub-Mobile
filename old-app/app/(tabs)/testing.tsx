import { Book, Camera, Search } from 'lucide-react-native';
import { Text, View } from 'react-native';

export default function App() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Camera color="#007AFF" size={48} />
      <Text style={{ marginTop: 10 }}>Lucide Icons in React Native 🎨</Text>
      <Book color="#444" size={128} />
      <Search color="green" size={32} />
    </View>
  );
}