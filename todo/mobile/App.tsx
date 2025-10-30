import { StatusBar } from 'expo-status-bar'
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import DetailScreen from './src/screens/DetailScreen'
import ListScreen from './src/screens/ListScreen'
import { TodoProvider, useTodoStore } from './src/state/TodoStore'

function Navigator() {
  const { user, loadingUser, selectedListId, signIn } = useTodoStore()

  if (loadingUser) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#020617' }}>
        <ActivityIndicator size="large" color="#38bdf8" />
      </SafeAreaView>
    )
  }

  if (!user) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
          gap: 16,
          backgroundColor: '#020617'
        }}
      >
        <Text style={{ color: '#e2e8f0', fontSize: 18, fontWeight: '600' }}>ログインが必要です</Text>
        <Text style={{ color: '#94a3b8', textAlign: 'center', fontSize: 14 }}>
          Googleでログインすると、Specsy Todo のデータをアプリで閲覧・操作できます。
        </Text>
        <TouchableOpacity
          onPress={() => void signIn()}
          style={{
            backgroundColor: '#38bdf8',
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 999,
            shadowColor: '#38bdf8',
            shadowOpacity: 0.6,
            shadowRadius: 18
          }}
        >
          <Text style={{ color: '#020617', fontWeight: '700', fontSize: 15 }}>Googleでログイン</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  return selectedListId ? <DetailScreen listId={selectedListId} /> : <ListScreen />
}

export default function App() {
  return (
    <TodoProvider>
      <View style={{ flex: 1 }}>
        <StatusBar style="light" />
        <Navigator />
      </View>
    </TodoProvider>
  )
}
