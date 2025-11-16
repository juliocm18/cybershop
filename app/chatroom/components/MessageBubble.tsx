import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Alert, Clipboard, Modal, TextInput, Linking, ActivityIndicator, StyleSheet, Dimensions, Platform, SafeAreaView } from 'react-native';
import { MessageBubbleProps } from '../types';
import { styles as baseStyles } from '../styles';
import { MessageReactions } from './MessageReactions';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { supabase } from '../../supabase';
import * as FileSystem from 'expo-file-system';
import * as WebBrowser from 'expo-web-browser';
// We'll use these modules without type checking for now
// @ts-ignore
import { Audio, ResizeMode, Video, VideoFullscreenUpdate } from 'expo-av';
// @ts-ignore
import * as MediaLibrary from 'expo-media-library';
// @ts-ignore
import * as Sharing from 'expo-sharing';
// @ts-ignore
import * as IntentLauncher from 'expo-intent-launcher';

const mediaStyles = StyleSheet.create({
  imageMessage: {
    width: 240,
    height: 240,
    borderRadius: 16,
    overflow: 'hidden',
  },
  mediaCaption: {
    fontSize: 11,
    color: '#888',
    marginTop: 6,
    fontWeight: '500',
  },
  documentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  documentIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#fff5f0',
  },
  documentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  documentTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  documentMeta: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  videoContainer: {
    width: 260,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
  },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoDurationBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoDurationText: {
    fontSize: 11,
    color: '#fff',
    marginLeft: 4,
    fontWeight: '600',
  },
  videoPlayer: {
    width: 260,
    height: 200,
    borderRadius: 16,
    backgroundColor: '#000000',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  playIconOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 240,
    padding: 12,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  audioPlayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fb8436',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#fb8436',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  audioInfo: {
    flex: 1,
    marginLeft: 12,
  },
  audioWaveform: {
    height: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  audioWaveformBar: {
    width: 3,
    backgroundColor: '#fb8436',
    marginHorizontal: 1.5,
    borderRadius: 2,
    opacity: 0.7,
  },
  audioDuration: {
    fontSize: 11,
    color: '#888',
    marginTop: 4,
    fontWeight: '600',
  },
  locationContainer: {
    width: 260,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  locationHeader: {
    padding: 14,
    backgroundColor: '#fff9f5',
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 10,
    color: '#333',
    flex: 1,
  },
  locationAddress: {
    fontSize: 13,
    color: '#666',
    padding: 14,
    lineHeight: 18,
  },
  locationFooter: {
    padding: 14,
    backgroundColor: '#fafafa',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationLink: {
    fontSize: 13,
    color: '#fb8436',
    fontWeight: '600',
  },
  fullImageModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  fullImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    resizeMode: 'contain',
  },
  closeFullImageButton: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  downloadFullImageButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  downloadProgressContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 10,
  },
  downloadProgressText: {
    fontSize: 12,
    color: '#fff',
  },
  downloadProgressBarContainer: {
    width: 100,
    height: 5,
    borderRadius: 5,
    backgroundColor: '#333',
    marginTop: 5,
  },
  downloadProgressBar: {
    height: 5,
    borderRadius: 5,
    backgroundColor: '#e74c3c',
  },
});

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwnMessage, currentUserId, onUserPress, onMessageDeleted }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [audioPlaybackPosition, setAudioPlaybackPosition] = useState(0);
  const [audioSound, setAudioSound] = useState<Audio.Sound | null>(null);
  const [userAlias, setUserAlias] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const audioPlaybackTimer = useRef<NodeJS.Timeout | null>(null);

  // Fetch user alias when component mounts
  useEffect(() => {
    const fetchUserAlias = async () => {
      // Only fetch alias for other users' messages
      if (!isOwnMessage && message.user_id) {
        try {
          const { data, error } = await supabase
            .from('user_aliases')
            .select('alias')
            .eq('user_id', currentUserId)
            .eq('target_user_id', message.user_id)
            .single();

          if (data && !error) {
            setUserAlias(data.alias);
          }
        } catch (error) {
          console.error('Error fetching user alias:', error);
        }
      }
    };

    fetchUserAlias();
  }, [currentUserId, message.user_id, isOwnMessage]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  const copyMessage = () => {
    Clipboard.setString(message.content);
    Alert.alert('Copied', 'Message copied to clipboard');
    setShowOptions(false);
  };

  const deleteMessage = async () => {
    if (!currentUserId || message.user_id !== currentUserId) return;

    Alert.alert(
      'Eliminar Mensaje',
      '¿Estás seguro de que quieres eliminar este mensaje?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              const { error } = await supabase
                .from('messages')
                .delete()
                .eq('id', message.id)
                .eq('user_id', currentUserId);

              if (error) {
                console.error('Error deleting message:', error);
                Alert.alert('Error', 'No se pudo eliminar el mensaje. Por favor, intenta de nuevo.');
              } else {
                // Message deleted successfully
                setShowOptions(false);
                // Call the callback to update the parent component
                if (onMessageDeleted) {
                  onMessageDeleted(message.id);
                }
              }
            } catch (error) {
              console.error('Error in deleteMessage:', error);
              Alert.alert('Error', 'Un error inesperado ocurrió. Por favor, intenta de nuevo.');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
    );
  };

  const openReportModal = () => {
    setShowReportModal(true);
    setShowOptions(false);
  };

  const submitReport = async () => {
    if (!reportReason.trim()) {
      Alert.alert('Error', 'Por favor, proporcione un motivo para reportar este mensaje.');
      return;
    }

    try {
      const { error } = await supabase
        .from('message_reports')
        .insert({
          message_id: message.id,
          reporter_id: currentUserId,
          reason: reportReason,
          status: 'pending', // Initial status
        });

      if (error) {
        console.error('Error reporting message:', error);
        Alert.alert('Error', 'No se pudo reportar el mensaje. Por favor, intenta de nuevo.');
      } else {
        Alert.alert('Gracias', 'Tu reporte ha sido enviado y será revisado.');
        setShowReportModal(false);
        setReportReason('');
      }
    } catch (error) {
      console.error('Error in reportMessage:', error);
      Alert.alert('Error', 'Un error inesperado ocurrió. Por favor, intenta de nuevo.');
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 KB';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };


  const downloadFile = async () => {
    if (!message.media_info?.url) return;

    try {
      setDownloadProgress(0);

      const url = message.media_info.url;
      const fileName = message.media_info.filename || 'downloaded_file.png';

      // Descargar en cache temporal
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        fileUri,
        {},
        (progress) => {
          if (progress.totalBytesExpectedToWrite > 0) {
            const progressPercent = progress.totalBytesWritten / progress.totalBytesExpectedToWrite;
            setDownloadProgress(Math.round(progressPercent * 100));
          }
        }
      );

      const result = await downloadResumable.downloadAsync();

      if (!result || !result.uri) {
        throw new Error('No se pudo descargar el archivo correctamente.');
      }

      const uri = result.uri;

      // Solicitar permisos para galería
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'No se puede guardar la imagen sin permiso.');
        return;
      }

      // Crear asset multimedia
      const asset = await MediaLibrary.createAssetAsync(uri);

      if (Platform.OS === 'android') {
        // En Android, guardamos en álbum "Download"
        await MediaLibrary.createAlbumAsync('Download', asset, false);
      } else {
        // En iOS, solo crear asset ya la galería lo detecta
        // Opcional: podrías crear álbum personalizado también si quieres
      }

      Alert.alert('Descarga completa', 'La imagen se guardó en tu galería.');
    } catch (error) {
      console.error('Error downloading file:', error);
      Alert.alert('Error', 'No se pudo descargar el archivo');
    }
  };

  const downloadFile2 = async () => {
    console.log("message.media_info", message.media_info);
    if (!message.media_info?.url) return;

    try {
      setDownloadProgress(0);

      const url = message.media_info.url;
      const fileName = message.media_info.filename || 'downloaded_file';
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        fileUri,
        {},
        (progress) => {
          if (progress.totalBytesExpectedToWrite > 0) {
            const progressPercent = progress.totalBytesWritten / progress.totalBytesExpectedToWrite;
            setDownloadProgress(Math.round(progressPercent * 100));
          }
        },
      );

      const result = await downloadResumable.downloadAsync();

      if (result) {
        Alert.alert('Download Complete1', `File saved to ${result.uri}`, [
          { text: 'OK' },
        ]);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      Alert.alert('Error', 'Failed to download file');
    }
  };

  const openLocation = async () => {
    try {
      if (!message.location_info) {
        Alert.alert('Error', 'Location information not available');
        return;
      }

      // Try to open in Google Maps or Apple Maps
      const { latitude, longitude } = message.location_info;
      let url = '';

      if (Platform.OS === 'ios') {
        url = `maps:?q=${latitude},${longitude}`;
      } else {
        url = `geo:${latitude},${longitude}?q=${latitude},${longitude}`;
      }

      const canOpen = await Linking.canOpenURL(url);

      if (canOpen) {
        await Linking.openURL(url);
      } else {
        // Fallback to Google Maps web URL
        await Linking.openURL(
          `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
        );
      }
    } catch (error) {
      console.error('Error opening location:', error);
      Alert.alert('Error', 'Failed to open location');
    }
  };

  const handlePlayAudio = async () => {
    try {
      if (isAudioPlaying && audioSound) {
        await audioSound.stopAsync();
        setIsAudioPlaying(false);
        return;
      }

      if (message.media_info?.url) {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: message.media_info.url },
          { shouldPlay: true },
        );

        setAudioSound(newSound);
        setIsAudioPlaying(true);

        // Use type any for status to avoid TypeScript errors
        newSound.setOnPlaybackStatusUpdate((status: any) => {
          if (status.isLoaded) {
            if (status.didJustFinish) {
              setIsAudioPlaying(false);
            }
          }
        });
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      Alert.alert('Error', 'Failed to play audio file');
    }
  };

  // openLocation function is already defined above

  const openPdfPreview = async () => {
    try {
      if (!message.media_info?.url) {
        Alert.alert('Error', 'PDF URL not available');
        return;
      }
      const viewerUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(message.media_info.url)}`;
      // Use WebBrowser to open the PDF in an in-app browser
      await WebBrowser.openBrowserAsync(viewerUrl);
    } catch (error) {
      console.error('Error opening PDF preview:', error);
      Alert.alert('Error', 'Failed to open PDF preview');
    }
  };

  const renderMessageContent = () => {
    switch (message.message_type) {
      case 'image':
        return (
          <TouchableOpacity 
            onPress={() => setShowFullImage(true)}
            activeOpacity={0.9}
          >
            <View style={{ borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 }}>
              <Image
                source={{ uri: message.media_info?.url }}
                style={mediaStyles.imageMessage}
                resizeMode="cover"
              />
            </View>
            {message.media_info?.filesize && (
              <Text style={mediaStyles.mediaCaption}>
                {formatFileSize(message.media_info.filesize)}
              </Text>
            )}
          </TouchableOpacity>
        );

      case 'pdf':
        return (
          <TouchableOpacity 
            style={mediaStyles.documentContainer} 
            onPress={openPdfPreview}
            activeOpacity={0.7}
          >
            <View style={mediaStyles.documentIconContainer}>
              <MaterialIcons name="picture-as-pdf" size={28} color="#fb8436" />
            </View>
            <View style={mediaStyles.documentInfo}>
              <Text style={mediaStyles.documentTitle} numberOfLines={1}>
                {message.media_info?.filename || 'Document.pdf'}
              </Text>
              <Text style={mediaStyles.documentMeta}>
                PDF • {formatFileSize(message.media_info?.filesize)}
              </Text>
            </View>
            <View style={{ backgroundColor: '#fff5f0', padding: 8, borderRadius: 8 }}>
              <Ionicons name="eye-outline" size={20} color="#fb8436" />
            </View>
          </TouchableOpacity>
        );

      case 'video':
        return (
          <View style={{ borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 5 }}>
            <View style={mediaStyles.videoContainer}>
              {showVideoPlayer && message.media_info?.url ? (
                <Video
                  source={{ uri: message.media_info.url }}
                  style={mediaStyles.videoPlayer}
                  resizeMode={ResizeMode.CONTAIN}
                  useNativeControls
                  shouldPlay
                  onFullscreenUpdate={async ({ fullscreenUpdate }) => {
                    if (fullscreenUpdate === VideoFullscreenUpdate.PLAYER_DID_DISMISS) {
                      setShowVideoPlayer(false);
                    }
                  }}
                />
              ) : (
                <TouchableOpacity onPress={() => setShowVideoPlayer(true)} activeOpacity={0.9}>
                  <View style={mediaStyles.videoPlaceholder}>
                    <Image source={{ uri: message.media_info?.thumbnail_url || message.media_info?.url }} style={mediaStyles.videoThumbnail} onError={() => console.log('Error loading thumbnail')} />
                    <View style={mediaStyles.playIconOverlay}>
                      <View style={{ backgroundColor: 'rgba(251, 132, 54, 0.95)', width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' }}>
                        <Ionicons name="play" size={32} color="#ffffff" style={{ marginLeft: 4 }} />
                      </View>
                    </View>
                    {message.media_info?.duration && (
                      <View style={mediaStyles.videoDurationBadge}>
                        <Ionicons name="time-outline" size={11} color="#ffffff" />
                        <Text style={mediaStyles.videoDurationText}>
                          {formatDuration(message.media_info.duration)}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              )}
            </View>
            {message.media_info?.filesize && !showVideoPlayer && (
              <Text style={[mediaStyles.mediaCaption, { marginTop: 8 }]}>
                {formatFileSize(message.media_info.filesize)}
              </Text>
            )}
          </View>
        );

      case 'audio':
        return (
          <View style={mediaStyles.audioContainer}>
            <TouchableOpacity 
              style={mediaStyles.audioPlayButton} 
              onPress={handlePlayAudio}
              activeOpacity={0.8}
            >
              {isAudioPlaying ? (
                <Ionicons name="pause" size={22} color="#ffffff" />
              ) : (
                <Ionicons name="play" size={22} color="#ffffff" style={{ marginLeft: 2 }} />
              )}
            </TouchableOpacity>
            <View style={mediaStyles.audioInfo}>
              <View style={mediaStyles.audioWaveform}>
                {Array.from({ length: 30 }).map((_, i) => (
                  <View
                    key={`audio-bar-${message.id}-${i}`}
                    style={[
                      mediaStyles.audioWaveformBar,
                      { height: 4 + Math.random() * 16 },
                    ]}
                  />
                ))}
              </View>
              <Text style={mediaStyles.audioDuration}>
                {formatDuration(message.media_info?.duration)}
              </Text>
            </View>
          </View>
        );

      case 'location':
        return (
          <TouchableOpacity 
            style={mediaStyles.locationContainer} 
            onPress={openLocation}
            activeOpacity={0.8}
          >
            <View style={mediaStyles.locationHeader}>
              <View style={{ backgroundColor: '#fb8436', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="location" size={18} color="#ffffff" />
              </View>
              <Text style={mediaStyles.locationTitle} numberOfLines={1}>
                {message.location_info?.name || 'Ubicación Compartida'}
              </Text>
            </View>
            {message.location_info?.address && (
              <Text style={mediaStyles.locationAddress} numberOfLines={2}>
                {message.location_info.address}
              </Text>
            )}
            <View style={mediaStyles.locationFooter}>
              <Text style={mediaStyles.locationLink}>Abrir en Mapas</Text>
              <View style={{ backgroundColor: '#fff5f0', padding: 6, borderRadius: 6 }}>
                <Ionicons name="arrow-forward" size={14} color="#fb8436" />
              </View>
            </View>
          </TouchableOpacity>
        );

      case 'text':
        if (message.content) {
          return (
            <Text style={[baseStyles.messageText, isOwnMessage ? baseStyles.ownMessageText : baseStyles.otherMessageText]}>
              {message.content}
            </Text>
          );
        }

      default:
        return null;
    }
  };

  return (
    <View style={[baseStyles.messageContainer, isOwnMessage ? baseStyles.ownMessageContainer : baseStyles.otherMessageContainer]}>
      {!isOwnMessage && (
        <View style={baseStyles.messageAvatarContainer}>
          <Image
            source={
              message.user?.avatar_url
                ? { uri: message.user.avatar_url }
                : require('./default-avatar.png')
            }
            style={baseStyles.messageAvatar}
          />
        </View>
      )}

      <View style={{ position: 'relative', maxWidth: '85%' }}>
        <View style={[baseStyles.messageBubble, isOwnMessage ? baseStyles.ownMessage : baseStyles.otherMessage, { position: 'relative', flexShrink: 0 }]}>
          {/* Botón de opciones en la esquina superior derecha */}
          <TouchableOpacity 
            onPress={toggleOptions} 
            style={{ 
              position: 'absolute',
              top: 4,
              right: 4,
              padding: 6,
              zIndex: 10,
              backgroundColor: isOwnMessage ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.05)',
              borderRadius: 12,
            }}
            activeOpacity={0.6}
          >
            <Ionicons name="ellipsis-horizontal" size={16} color={isOwnMessage ? '#fff' : '#999'} />
          </TouchableOpacity>

          {!isOwnMessage && (
            <TouchableOpacity
              onPress={() => {
                if (onUserPress && message.user) {
                  onUserPress({
                    id: message.user_id,
                    name: message.user.name,
                    avatar_url: message.user.avatar_url,
                    alias: userAlias || undefined
                  });
                }
              }}
              disabled={isOwnMessage}
            >
              <Text style={baseStyles.messageUserName}>
                {userAlias || message.user?.name || 'Unknown'}
              </Text>
            </TouchableOpacity>
          )}

          {renderMessageContent()}

          {currentUserId && (
            <MessageReactions messageId={message.id} currentUserId={currentUserId} />
          )}
        </View>

        {showOptions && (
          <View style={[baseStyles.messageOptionsContainer, isOwnMessage ? baseStyles.ownMessageOptions : baseStyles.otherMessageOptions, { borderRadius: 12, paddingVertical: 4 }]}>
            <TouchableOpacity 
              style={[baseStyles.messageOption, { borderRadius: 8 }]} 
              onPress={copyMessage}
              activeOpacity={0.7}
            >
              <View style={{ backgroundColor: '#f5f5f5', padding: 6, borderRadius: 6 }}>
                <Ionicons name="copy-outline" size={16} color="#666" />
              </View>
              <Text style={[baseStyles.messageOptionText, { fontWeight: '500' }]}>Copiar</Text>
            </TouchableOpacity>
            {isOwnMessage && (
              <TouchableOpacity 
                style={[baseStyles.messageOption, { borderRadius: 8 }]} 
                onPress={deleteMessage} 
                disabled={isDeleting}
                activeOpacity={0.7}
              >
                <View style={{ backgroundColor: '#fff5f5', padding: 6, borderRadius: 6 }}>
                  <Ionicons name="trash-outline" size={16} color="#ff6b6b" />
                </View>
                <Text style={[baseStyles.messageOptionText, { color: '#ff6b6b', fontWeight: '500' }]}>
                  {isDeleting ? 'Eliminando...' : 'Eliminar'}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={[baseStyles.messageOption, { borderRadius: 8 }]} 
              onPress={openReportModal}
              activeOpacity={0.7}
            >
              <View style={{ backgroundColor: '#fff9f5', padding: 6, borderRadius: 6 }}>
                <Ionicons name="flag-outline" size={16} color="#fb8436" />
              </View>
              <Text style={[baseStyles.messageOptionText, { fontWeight: '500' }]}>Reportar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {isOwnMessage && (
        <View style={baseStyles.messageAvatarContainer}>
          <Image
            source={
              message.user?.avatar_url
                ? { uri: message.user.avatar_url }
                : require('./default-avatar.png')
            }
            style={baseStyles.messageAvatar}
          />
        </View>
      )}

      <Modal
        visible={showFullImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFullImage(false)}
      >
        <TouchableOpacity
          style={mediaStyles.fullImageModalContainer}
          activeOpacity={1}
          onPress={() => setShowFullImage(false)}
        >
          <Image
            source={{ uri: message.media_info?.url }}
            style={mediaStyles.fullImage}
            resizeMode="contain"
          />
          <TouchableOpacity
            style={mediaStyles.closeFullImageButton}
            onPress={() => setShowFullImage(false)}
          >
            <Ionicons name="close-circle" size={36} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={mediaStyles.downloadFullImageButton}
            onPress={downloadFile}
          >
            <Ionicons name="download" size={30} color="#ffffff" />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showReportModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowReportModal(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}>
          <View style={{
            width: '80%',
            backgroundColor: 'white',
            borderRadius: 10,
            padding: 20,
            elevation: 5,
          }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15 }}>
              Reportar Mensaje
            </Text>
            <Text style={{ marginBottom: 10 }}>
              Por favor, proporcione un motivo para reportar este mensaje:
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 5,
                padding: 10,
                marginBottom: 15,
                height: 100,
                textAlignVertical: 'top',
              }}
              multiline
              placeholder="Ingrese el motivo..."
              value={reportReason}
              onChangeText={setReportReason}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity
                style={{
                  padding: 10,
                  marginRight: 10,
                }}
                onPress={() => {
                  setShowReportModal(false);
                  setReportReason('');
                }}
              >
                <Text style={{ color: '#666' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: '#fb8436',
                  padding: 10,
                  borderRadius: 5,
                }}
                onPress={submitReport}
              >
                <Text style={{ color: 'white' }}>Enviar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {downloadProgress > 0 && downloadProgress < 100 && (
        <View style={mediaStyles.downloadProgressContainer}>
          <Text style={mediaStyles.downloadProgressText}>Descargando: {downloadProgress}%</Text>
          <View style={mediaStyles.downloadProgressBarContainer}>
            <View style={[mediaStyles.downloadProgressBar, { width: `${downloadProgress}%` }]} />
          </View>
        </View>
      )}
    </View>
  );
};
