import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { globalStyles } from '@/constants/theme';
import { useAuthStore } from '@/store/auth-store';
import { useMessageStore } from '@/store/message-store';
import { Avatar } from '@/components/Avatar';
import { Input } from '@/components/Input';
import { formatMessageTime } from '@/utils/date-utils';

interface ConversationPreview {
  userId: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
}

export default function MessagesScreen() {
  const router = useRouter();
  const { user, isTrainer, clients } = useAuthStore();
  const { getMessages } = useMessageStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  
  useEffect(() => {
    if (!user) return;
    
    const messages = getMessages();
    const conversationMap = new Map<string, ConversationPreview>();
    
    // For each message, create or update a conversation preview
    messages.forEach(message => {
      // Determine the other user in the conversation
      const isCurrentUserSender = message.senderId === user.id;
      const otherUserId = isCurrentUserSender ? message.receiverId : message.senderId;
      
      // Skip if this message is not part of a conversation with the current user
      if (message.senderId !== user.id && message.receiverId !== user.id) return;
      
      // Get the other user's details
      let otherUser;
      if (isTrainer) {
        otherUser = clients.find(client => client.id === otherUserId);
      } else {
        // For clients, the other user is always the trainer
        otherUser = { id: otherUserId, name: 'Your Trainer', avatar: undefined };
      }
      
      if (!otherUser) return;
      
      // Get existing conversation or create a new one
      const existingConversation = conversationMap.get(otherUserId);
      
      // Check if this message is newer than the last one we have
      if (!existingConversation || new Date(message.timestamp) > new Date(existingConversation.timestamp)) {
        conversationMap.set(otherUserId, {
          userId: otherUserId,
          name: otherUser.name,
          avatar: otherUser.avatar,
          lastMessage: message.content,
          timestamp: message.timestamp,
          unread: !message.read && message.receiverId === user.id,
        });
      }
    });
    
    // Convert map to array and sort by timestamp (newest first)
    const conversationArray = Array.from(conversationMap.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    setConversations(conversationArray);
  }, [user, isTrainer, clients, getMessages]);
  
  const filteredConversations = conversations.filter(conversation => 
    conversation.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={styles.container}>
        <Input
          placeholder="Search conversations..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<Search size={20} color={colors.textSecondary} />}
          containerStyle={styles.searchContainer}
        />
        
        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item.userId}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.conversationItem}
              onPress={() => router.push(`/messages/${item.userId}`)}
            >
              <Avatar source={item.avatar} name={item.name} size={50} />
              
              <View style={styles.conversationContent}>
                <View style={styles.conversationHeader}>
                  <Text style={styles.conversationName}>{item.name}</Text>
                  <Text style={styles.conversationTime}>{formatMessageTime(item.timestamp)}</Text>
                </View>
                
                <View style={styles.conversationFooter}>
                  <Text 
                    style={[
                      styles.conversationMessage,
                      item.unread && styles.unreadMessage
                    ]}
                    numberOfLines={1}
                  >
                    {item.lastMessage}
                  </Text>
                  
                  {item.unread && (
                    <View style={styles.unreadIndicator} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No conversations found</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
  },
  searchContainer: {
    marginBottom: theme.spacing.md,
  },
  listContent: {
    paddingBottom: theme.spacing.md,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    backgroundColor: colors.card,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
  },
  conversationContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  conversationTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  conversationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  conversationMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  unreadMessage: {
    color: colors.text,
    fontWeight: '600',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: theme.spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});