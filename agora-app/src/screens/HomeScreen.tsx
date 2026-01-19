import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiClient } from '../services/api';
import { ProgressCard } from '../components/ProgressCard';
import { colors, spacing, typography, borderRadius } from '../theme/colors';
import { Button } from '../components/ui/Button';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [projects, setProjects] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [projectsRes, eventsRes] = await Promise.all([
        apiClient.getPublicProjects(),
        apiClient.getPublicEvents(),
      ]);
      
      const singles = projectsRes.projects.filter((p: any) => p.type === 'single');
      const activeEvents = eventsRes.events.filter((e: any) => {
        if (!e.date) return true;
        const eventDate = new Date(e.date);
        return eventDate >= new Date();
      });
      
      setProjects(singles);
      setEvents(activeEvents);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Bem-vindo</Text>
          <Text style={styles.subtitle}>
            Acompanha o progresso dos projetos em desenvolvimento
          </Text>
        </View>

        {/* Singles em Produção */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionIcon}>🎵</Text>
              <Text style={styles.sectionTitle}>Singles em Produção</Text>
            </View>
            {projects.length > 3 && (
              <TouchableOpacity
                onPress={() => navigation.navigate('Singles' as never)}
                activeOpacity={0.7}
              >
                <Text style={styles.seeAll}>Ver todos</Text>
              </TouchableOpacity>
            )}
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>A carregar...</Text>
            </View>
          ) : projects.length > 0 ? (
            <>
              {projects.slice(0, 3).map((project) => (
                <ProgressCard
                  key={project.id}
                  item={project}
                  type="single"
                  onPress={() => {
                    navigation.navigate('SingleDetail' as never, { id: project.id } as never);
                  }}
                />
              ))}
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🎵</Text>
              <Text style={styles.emptyText}>Nenhum single em produção no momento</Text>
            </View>
          )}
        </View>

        {/* Próximos Eventos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionIcon}>📅</Text>
              <Text style={styles.sectionTitle}>Próximos Eventos</Text>
            </View>
            {events.length > 3 && (
              <TouchableOpacity
                onPress={() => navigation.navigate('Events' as never)}
                activeOpacity={0.7}
              >
                <Text style={styles.seeAll}>Ver todos</Text>
              </TouchableOpacity>
            )}
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>A carregar...</Text>
            </View>
          ) : events.length > 0 ? (
            <>
              {events.slice(0, 3).map((event) => (
                <ProgressCard
                  key={event.id}
                  item={event}
                  type="event"
                  onPress={() => {
                    navigation.navigate('EventDetail' as never, { id: event.id } as never);
                  }}
                />
              ))}
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={styles.emptyText}>Nenhum evento próximo no momento</Text>
            </View>
          )}
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  greeting: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionIcon: {
    fontSize: 24,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
  },
  seeAll: {
    ...typography.label,
    color: colors.primary,
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  emptyContainer: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: spacing.xl,
  },
});
