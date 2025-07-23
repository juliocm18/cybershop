import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image
} from 'react-native';
import { supabase } from '@/app/supabase';
import { Ionicons } from '@expo/vector-icons';

interface MyChatsModalProps {
  isVisible: boolean;
  onClose: () => void;
  currentUserId: string;
  onChatSelected: (roomId: string, chatType: 'group' | 'individual', recipientId?: string) => void;
}

interface ChatRoom {
  id: string;
  name: string;
  is_private: boolean;
  is_group: boolean;
  last_message?: string;
  last_message_time?: string;
  unread_count?: number;
  recipient_id?: string;
  avatar_url?: string;
}

interface RoomParticipation {
  room_id: string;
  rooms: {
    id: string;
    name: string;
    is_private: boolean;
    created_at?: string;
  };
}

interface IndividualChat {
  room_id: string;
  user_id: string;
  rooms: {
    id: string;
    name: string;
    is_private: boolean;
  };
}

interface UserProfile {
  id: string;
  name: string;
  avatar_url?: string;
}

interface Message {
  room_id: string;
  content: string;
  created_at: string;
  type: 'text' | 'image' | 'document' | 'audio' | 'location' | string;
}

export default function MyChatsModal({
  isVisible,
  onClose,
  currentUserId,
  onChatSelected
}: MyChatsModalProps) {
  const [chats, setChats] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isVisible) {
      fetchUserChats();
    }
  }, [isVisible, currentUserId]);

  const fetchUserChats = async () => {
    setLoading(true);
    try {
      // Get all rooms where the user is a participant
      const { data: roomParticipations, error: participationError } = await supabase
        .from('room_participants')
        .select(`
          room_id,
          rooms:rooms(
            id,
            name,
            is_private,
            created_at
          )
        `)
        .eq('user_id', currentUserId);

      if (participationError) throw participationError;

      if (!roomParticipations || roomParticipations.length === 0) {
        setChats([]);
        setLoading(false);
        return;
      }

      // Extract room IDs
      const roomIds = roomParticipations.map(p => p.room_id);
      
      // Get individual chats (direct messages)
      const { data: individualChats, error: individualChatsError } = await supabase
        .from('room_participants')
        .select(`
          room_id,
          rooms:rooms(
            id,
            name,
            is_private
          ),
          user_id
        `)
        .in('room_id', roomIds)
        .neq('user_id', currentUserId);

      if (individualChatsError) throw individualChatsError;

      // Get user profiles for individual chats
      const userIds = individualChats?.map(chat => chat.user_id) || [];
      const { data: userProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Get last messages for each room
      const { data: lastMessages, error: messagesError } = await supabase
        .from('messages')
        .select('room_id, content, created_at, type')
        .in('room_id', roomIds)
        .order('created_at', { ascending: false });

      if (messagesError) throw messagesError;

      // Process and format the chat data
      const processedChats: ChatRoom[] = roomParticipations.map((p: any) => {
        const room = p.rooms;
        
        // Find if this is an individual chat
        const individualChat = individualChats?.find(chat => chat.room_id === p.room_id);
        const isGroup = !individualChat;
        
        // Get recipient info for individual chats
        let recipientId: string | undefined;
        let avatarUrl: string | undefined;
        if (!isGroup && individualChat) {
          recipientId = individualChat.user_id;
          const userProfile = userProfiles?.find(profile => profile.id === recipientId);
          avatarUrl = userProfile?.avatar_url;
        }

        // Get last message for this room
        const lastMessage = lastMessages?.find(msg => msg.room_id === p.room_id);
        
        // Format last message based on type
        let formattedLastMessage = '';
        if (lastMessage) {
          switch(lastMessage.type) {
            case 'text':
              formattedLastMessage = lastMessage.content;
              break;
            case 'image':
              formattedLastMessage = '📷 Imagen';
              break;
            case 'document':
              formattedLastMessage = '📄 Documento';
              break;
            case 'audio':
              formattedLastMessage = '🎵 Audio';
              break;
            case 'location':
              formattedLastMessage = '📍 Ubicación';
              break;
            default:
              formattedLastMessage = lastMessage.content;
          }
        }

        return {
          id: room.id,
          name: isGroup ? room.name : (userProfiles?.find(profile => profile.id === recipientId)?.name || 'Usuario'),
          is_private: room.is_private,
          is_group: isGroup,
          last_message: formattedLastMessage,
          last_message_time: lastMessage?.created_at,
          recipient_id: recipientId,
          avatar_url: avatarUrl
        };
      });

      // Sort chats by last message time (most recent first)
      processedChats.sort((a, b) => {
        if (!a.last_message_time) return 1;
        if (!b.last_message_time) return -1;
        return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime();
      });

      setChats(processedChats);
    } catch (error) {
      console.error('Error fetching user chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChat = (chat: ChatRoom) => {
    onChatSelected(
      chat.id, 
      chat.is_group ? 'group' : 'individual',
      chat.is_group ? undefined : chat.recipient_id
    );
    onClose();
  };

  const formatTime = (timestamp: string) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    
    // If today, show time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If this year, show day and month
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
    }
    
    // Otherwise show date
    return date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const renderChatItem = ({ item }: { item: ChatRoom }) => (
    <TouchableOpacity 
      style={styles.chatItem}
      onPress={() => handleSelectChat(item)}
    >
      <View style={styles.avatarContainer}>
        {item.avatar_url ? (
          <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.defaultAvatar]}>
            <Ionicons 
              name={item.is_group ? "people" : "person"} 
              size={24} 
              color="#ffffff" 
            />
          </View>
        )}
      </View>
      <View style={styles.chatInfo}>
        <Text style={styles.chatName}>{item.name}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.last_message || 'No hay mensajes'}
        </Text>
      </View>
      {item.last_message_time && (
        <Text style={styles.timeStamp}>
          {formatTime(item.last_message_time)}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Mis Chats</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#fb8436" />
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fb8436" />
            </View>
          ) : chats.length > 0 ? (
            <FlatList
              data={chats}
              renderItem={renderChatItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubble-ellipses-outline" size={48} color="#cccccc" />
              <Text style={styles.emptyText}>No tienes chats activos</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  listContainer: {
    padding: 10,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  defaultAvatar: {
    backgroundColor: '#fb8436',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  timeStamp: {
    fontSize: 12,
    color: '#999',
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  loadingContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});
