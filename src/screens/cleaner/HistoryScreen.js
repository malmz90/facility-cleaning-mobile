import React, { useCallback, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AppText from '../../components/AppText';
import useAuth from '../../hooks/useAuth';
import { fetchCleanerHistory } from '../../services/cleaner.service';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';

export default function HistoryScreen() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadHistory = useCallback(
    async ({ isRefresh = false } = {}) => {
      if (!user?.id) {
        setLogs([]);
        setLoading(false);
        setRefreshing(false);
        setErrorMessage('');
        return;
      }

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data, error } = await fetchCleanerHistory({ authUserId: user.id });
      if (error) {
        setErrorMessage(error.message || 'Kunde inte hämta historik.');
      } else {
        setErrorMessage('');
      }
      setLogs(data ?? []);
      setLoading(false);
      setRefreshing(false);
    },
    [user?.id]
  );

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  const formatCleanedAt = useMemo(() => {
    const dateFormatter = new Intl.DateTimeFormat('sv-SE', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return cleanedAt => {
      if (!cleanedAt) {
        return '-';
      }

      const date = new Date(cleanedAt);
      if (Number.isNaN(date.getTime())) {
        return '-';
      }

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterdayStart = new Date(todayStart);
      yesterdayStart.setDate(todayStart.getDate() - 1);

      const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const timePart = dateFormatter.format(date);

      if (dateStart.getTime() === todayStart.getTime()) {
        return `Idag ${timePart}`;
      }

      if (dateStart.getTime() === yesterdayStart.getTime()) {
        return `Igår ${timePart}`;
      }

      const fullDate = new Intl.DateTimeFormat('sv-SE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(date);

      return `${fullDate} ${timePart}`;
    };
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <AppText variant="subtitle">{item.room_name || 'Namnlöst rum'}</AppText>
      <AppText variant="caption" style={styles.cardMeta}>
        {formatCleanedAt(item.cleaned_at)}
      </AppText>
    </View>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <AppText variant="title">Historik</AppText>

        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={logs}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={logs.length === 0 ? styles.emptyList : styles.list}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadHistory({ isRefresh: true })}
              />
            }
            ListEmptyComponent={
              <AppText variant="caption" style={styles.emptyText}>
                Ingen städhistorik än.
              </AppText>
            }
          />
        )}

        {errorMessage ? (
          <AppText variant="caption" style={styles.errorText}>
            {errorMessage}
          </AppText>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: COLORS.backgroundPrimary,
    flex: 1,
  },
  container: {
    flex: 1,
    padding: SPACING.x4,
  },
  centerContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  list: {
    paddingBottom: SPACING.x4,
    paddingTop: SPACING.x3,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingTop: SPACING.x3,
  },
  emptyText: {
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.backgroundTertiary,
    borderColor: COLORS.borderSubtle,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: SPACING.x2,
    padding: SPACING.x3,
  },
  cardMeta: {
    marginTop: SPACING.x1,
  },
  errorText: {
    color: COLORS.error,
    marginTop: SPACING.x2,
  },
});
