import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ChatSidebarProps {
  isVisible: boolean;
  onClose: () => void;
  onViewMyChats: () => void;
  onNavigateToGroups: () => void;
  onViewInvitations: () => void;
  pendingInvitationsCount: number;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  isVisible,
  onClose,
  onViewMyChats,
  onNavigateToGroups,
  onViewInvitations,
  pendingInvitationsCount
}) => {
  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlayTouch} onPress={onClose} />
        <View style={styles.sidebar}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Navegación</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.menuItems}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                onViewMyChats();
                onClose();
              }}
            >
              <Ionicons name="chatbubbles" size={24} color="#fb8436" />
              <Text style={styles.menuItemText}>Mis Chats</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                onNavigateToGroups();
                onClose();
              }}
            >
              <Ionicons name="people" size={24} color="#fb8436" />
              <Text style={styles.menuItemText}>Grupos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                onViewInvitations();
                onClose();
              }}
            >
              <View style={styles.invitationContainer}>
                <Ionicons name="mail" size={24} color="#fb8436" />
                {pendingInvitationsCount > 0 && (
                  <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>{pendingInvitationsCount}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.menuItemText}>Invitaciones</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection: 'row',
  },
  overlayTouch: {
    flex: 1,
  },
  sidebar: {
    width: 280,
    backgroundColor: '#fff',
    paddingTop: 50,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  menuItems: {
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
    fontWeight: '500',
  },
  invitationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeContainer: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ChatSidebar;
