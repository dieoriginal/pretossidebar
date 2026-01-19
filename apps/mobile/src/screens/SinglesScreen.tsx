import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiClient } from '../services/api';
import { ProgressCard } from '../components/ProgressCard';
import { colors, spacing, typography } from '../theme/colors';

export default function SinglesScreen() {
  const navigation = useNavigation();
  const [singles, setSingles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSingles = async () => {
    try {
      const response = await apiClient.getPublicProjects();
      const filtered = response.projects.filter((p: any) => p.type === 'single');
      setSingles(filtered);
    } catch (error) {
      console.error('Error loading singles:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSingles();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadSingles();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerIcon}>🎵</Text>
          <View>
            <Text style={styles.title}>Singles em Produção</Text>
            <Text style={styles.subtitle}>
              Acompanha o progresso dos singles em desenvolvimento
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        data={singles}
        renderItem={({ item }) => (
          <ProgressCard
            item={item}
            type="single"
            onPress={() => {
              navigation.navigate('SingleDetail' as never, { id: item.id } as never);
            }}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>A carregar...</Text>
            </View>
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🎵</Text>
              <Text style={styles.emptyText}>Nenhum single em produção no momento</Text>
            </View>
          )
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerIcon: {
    fontSize: 32,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  list: {
    padding: spacing.md,
  },
  empty: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
