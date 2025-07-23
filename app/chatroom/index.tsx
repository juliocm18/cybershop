import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { supabase } from '../supabase';
import { User } from '@supabase/supabase-js';
import { useAuth } from '../context/AuthContext';
import { ChatRoom } from './ChatRoom';
import { LoginModal } from './components/LoginModal';
import { styles } from './styles';
import { UserProfile } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import CreateGroupModal from './components/CreateGroupModal';
import GroupInvitationsModal from './components/GroupInvitationsModal';
import GroupMembersModal from './components/GroupMembersModal';
import GroupsScreen from './GroupsScreen';

export default function ChatRoomScreen() {
  const params = useLocalSearchParams();
  const roomIdParam = params.roomIdParam as string;
  const recipientIdParam = params.recipientId as string;
  const chatTypeParam = params.chatType as 'group' | 'individual';
  
  const { session } = useAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState<string>(roomIdParam);
  const [chatType, setChatType] = useState<'group' | 'individual'>(chatTypeParam || 'group');
  const [selectedRecipient, setSelectedRecipient] = useState<string | undefined>(recipientIdParam);
  const [isCreateGroupModalVisible, setIsCreateGroupModalVisible] = useState(false);
  const [isInvitationsModalVisible, setIsInvitationsModalVisible] = useState(false);
  const [isGroupMembersModalVisible, setIsGroupMembersModalVisible] = useState(false);
  const [pendingInvitationsCount, setPendingInvitationsCount] = useState(0);
  const [currentRoomIsPrivate, setCurrentRoomIsPrivate] = useState(false);
  const [roomDetails, setRoomDetails] = 
  useState<{id: string, name: string, is_private: boolean, created_by: string} | null>(null);

  const updateUserStatus = async (userId: string, isOnline: boolean) => {
    try {
      await supabase
        .from('user_status')
        .upsert({
          user_id: userId,
          is_online: isOnline,
          last_seen: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  // Fetch pending invitations for the current user
  const fetchPendingInvitations = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('group_invitations')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending');

      if (error) throw error;
      setPendingInvitationsCount(data?.length || 0);
    } catch (error) {
      console.error('Error fetching pending invitations:', error);
    }
  };

  // Fetch room details
  const fetchRoomDetails = async (roomId: string) => {
    try {
      console.log("index:fetchRoomDetails: Fetching room details for room ID:", roomId)
      const { data, error } = await supabase
      .from('rooms')
      .select(`
        id,
        name,
        is_private,
        created_by
      `)
      .eq('id', roomId)
      .single();
      if (error) throw error;
      //console.log("index:fetchRoomDetails: Room details:", data)
      setRoomDetails(data);
      setCurrentRoomIsPrivate(data?.is_private || false);
    } catch (error) {
      console.error("index:fetchRoomDetails: Error fetching room details:", error);
    }
  };

  useEffect(() => {
    const user = session?.user ?? null;
    setCurrentUser(user);
    if (user) {
      updateUserStatus(user.id, true);
      fetchPendingInvitations(user.id);
      setShowLoginModal(false);
    } else {
      setShowLoginModal(true);
    }
  }, [session]);

  useEffect(() => {
    // Set up interval to update last_seen
    const statusInterval = setInterval(() => {
      if (currentUser) {
        updateUserStatus(currentUser.id, true);
      }
    }, 30000);
    return () => {
      clearInterval(statusInterval);
    };
  }, [currentUser]);

  // Subscribe to invitations changes
  useEffect(() => {
    if (!currentUser) return;

    // Create a unique channel name per user
    const channelName = `group-invitations-changes-${currentUser.id}`;

    // Remove any existing channel with this topic before creating a new one
    const existingChannels = supabase.getChannels();
    const existingChannel = existingChannels.find(channel => channel.topic === channelName);
    if (existingChannel) {
      supabase.removeChannel(existingChannel);
    }

    // Create a new channel instance and subscribe
    const invitationsChannel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'group_invitations',
        filter: `user_id=eq.${currentUser.id}`,
      }, () => {
        fetchPendingInvitations(currentUser.id);
      });

    invitationsChannel.subscribe();

    return () => {
      supabase.removeChannel(invitationsChannel);
    };
  }, [currentUser?.id]);

  // Fetch room details when room changes
  useEffect(() => {
    if (currentRoomId) {
      fetchRoomDetails(currentRoomId);
    }
  }, [currentRoomId]);

  const handleLoginSuccess = async (userId: string) => {
    await updateUserStatus(userId, true);
  };

  const handleParticipantSelect = (user: UserProfile & { roomId: string }) => {
    //console.log("Participant selected:", user);
    setCurrentRoomId(user.roomId);
    setSelectedRecipient(user.id);
    setChatType('individual');
  };

  const [showGroupsScreen, setShowGroupsScreen] = useState(false);

  const navigateToGroups = () => {
    setShowGroupsScreen(true);
  };

  const handleBackFromGroups = () => {
    setShowGroupsScreen(false);
  };

  // const handleCreateGroup = () => {
  //   setIsCreateGroupModalVisible(true);
  // };

  const handleViewInvitations = () => {
    setIsInvitationsModalVisible(true);
  };

  const handleManageMembers = () => {
    setIsGroupMembersModalVisible(true);
  };

  const renderHeaderButtons = () => {
    if (!currentUser) return null;
    //console.log("index:renderHeaderButtons: roomDetails", roomDetails)
    
    return (
      <View style={styles.headerButtonsContainer}>
        <TouchableOpacity
          key="groups-button"
          style={styles.headerButton}
          onPress={navigateToGroups}
        >
          <Ionicons name="people" size={24} color="#fb8436" />
          <Text style={styles.headerButtonText}>Grupos</Text>
        </TouchableOpacity>
              
        
        <TouchableOpacity
          key="invitations-button"
          style={styles.headerButton}
          onPress={handleViewInvitations}
        >
          <View style={{flexDirection: 'row'}}>
            <Ionicons name="mail" size={24} color="#fb8436" />
            {pendingInvitationsCount > 0 && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{pendingInvitationsCount}</Text>
              </View>
            )}
          </View>
          <Text style={styles.headerButtonText}>Invitaciones</Text>
        </TouchableOpacity>        
        {chatType === 'group' && roomDetails?.created_by === currentUser?.id && (
          <TouchableOpacity
            key="manage-members-button"
            style={styles.headerButton}
            onPress={handleManageMembers}
          >
            <Ionicons name="settings" size={24} color="#fb8436" />
            <Text style={styles.headerButtonText}>Gestionar</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: showGroupsScreen ? 'Grupos' : (roomDetails?.is_private ? 'Chat Privado' : 'Chat Público'),
          headerRight: () => !showGroupsScreen && renderHeaderButtons(),
          headerLeft: () => showGroupsScreen ? (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackFromGroups}
            >
              <Ionicons name="arrow-back" size={24} color="#fb8436" />             
            </TouchableOpacity>
          ) : undefined,
        }}
      />
      
      <LoginModal 
        isVisible={showLoginModal} 
        onLoginSuccess={handleLoginSuccess}
        onClose={() => setShowLoginModal(false)}
      />

      {currentUser && (
        <>
          {showGroupsScreen ? (
            <GroupsScreen currentUserId={currentUser.id} />
          ) : (
            <ChatRoom
              roomId={currentRoomId}
              currentUser={currentUser}
              chatType={chatType}
              recipientId={selectedRecipient}
              onParticipantSelect={handleParticipantSelect}
            />
          )}
          
          <CreateGroupModal
            isVisible={isCreateGroupModalVisible}
            onClose={() => setIsCreateGroupModalVisible(false)}
            currentUserId={currentUser.id}
            // onGroupCreated={(roomId) => {
            //   console.log("🚀 ~ onGroupCreated ~ roomId:", roomId)              
            //   setCurrentRoomId(roomId);
            //   setChatType('group');
            //   setSelectedRecipient(undefined);
            //   setShowGroupsScreen(false); // Return to chat after creating a group
            // }}
          />
          
          {currentRoomId && (
            <GroupMembersModal
              isVisible={isGroupMembersModalVisible}
              onClose={() => setIsGroupMembersModalVisible(false)}
              roomId={currentRoomId}
              currentUserId={currentUser.id}
              isGroupClosed={currentRoomIsPrivate}
            />
          )}
          
          <GroupInvitationsModal
            isVisible={isInvitationsModalVisible}
            onClose={() => setIsInvitationsModalVisible(false)}
            currentUserId={currentUser.id}
            onInvitationAccepted={(roomId) => {
              setCurrentRoomId(roomId);
              setChatType('group');
              setSelectedRecipient(undefined);
              setShowGroupsScreen(false);
              fetchPendingInvitations(currentUser.id);
            }}
          />
        </>
      )}
    </View>
  );
}
