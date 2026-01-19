import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Card } from './ui/Card';
import { colors, spacing, borderRadius, shadows, typography } from '../theme/colors';

interface ProgressCardProps {
  item: any;
  onPress: () => void;
  type?: 'single' | 'event';
}

export function ProgressCard({ item, onPress, type = 'single' }: ProgressCardProps) {
  const progress = item.progress || 0;
  const title = type === 'single' 
    ? item.title || item.name || 'Sem título'
    : item.eventName || item.name || 'Evento sem nome';
  
  const subtitle = type === 'single'
    ? item.artist || 'Artista'
    : item.venue || item.city || 'Local';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={styles.container}
    >
      <Card variant="elevated" style={styles.card}>
        {/* Header com cor sólida (pode usar gradiente depois) */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          </View>
          <View style={styles.progressBadge}>
            <Text style={styles.progressText}>{progress}%</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBackground}>
            <Animated.View
              style={[
                styles.progressBarFill,
                { width: `${progress}%` },
              ]}
            />
          </View>
          <Text style={styles.progressLabel}>
            {item.currentStep !== undefined && item.totalSteps !== undefined
              ? `Etapa ${item.currentStep + 1} de ${item.totalSteps}`
              : 'Em progresso'}
          </Text>
        </View>

        {/* Footer */}
        {item.date && (
          <View style={styles.footer}>
            <Text style={styles.date}>
              {new Date(item.date).toLocaleDateString('pt-PT', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  card: {
    overflow: 'hidden',
    borderRadius: borderRadius.lg,
  },
  header: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerContent: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    ...typography.h4,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodySmall,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  progressBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minWidth: 50,
    alignItems: 'center',
  },
  progressText: {
    ...typography.label,
    color: '#FFFFFF',
    fontSize: 14,
  },
  progressContainer: {
    padding: spacing.md,
    paddingTop: spacing.sm,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: colors.borderLight,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  progressLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.sm,
  },
  date: {
    ...typography.caption,
    color: colors.textTertiary,
  },
});
