import { StyleSheet, Text, View } from 'react-native'

import type { RecentXpGain } from '../types'

type Props = {
  level: number
  xpTotal: number
  xpNeededForNextLevel: number
  xpProgressPercent: number
  recentXpGain: RecentXpGain | null
}

export default function XpProgressCard({
  level,
  xpTotal,
  xpNeededForNextLevel,
  xpProgressPercent,
  recentXpGain
}: Props) {
  const width = Math.min(100, Math.max(0, xpProgressPercent))
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>Lv.{level}</Text>
        </View>
        <Text style={styles.headerText}>アドベンチャー進捗</Text>
      </View>
      <Text style={styles.summaryText}>
        合計 {xpTotal} XP ・ 次のレベルまで {xpNeededForNextLevel} XP
      </Text>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${width}%` }]} />
      </View>
      {recentXpGain ? (
        <View style={styles.gainBadge}>
          <Text style={styles.gainText}>✨ +{recentXpGain.amount} XP 獲得！</Text>
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    borderRadius: 20,
    backgroundColor: 'rgba(14, 116, 144, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
    gap: 12
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  levelBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999
  },
  levelText: {
    color: '#e0f2fe',
    fontWeight: '700'
  },
  headerText: {
    color: '#bae6fd',
    fontWeight: '600',
    fontSize: 14
  },
  summaryText: {
    color: '#e2e8f0'
  },
  progressBar: {
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(7, 89, 133, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'rgba(129, 140, 248, 0.75)'
  },
  gainBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.4)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    alignSelf: 'flex-start'
  },
  gainText: {
    color: '#bbf7d0',
    fontWeight: '700'
  }
})
