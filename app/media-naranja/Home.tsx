import React, { useEffect, useState } from 'react';
import LoginModal from './components/LoginModal';
import { View, StyleSheet, Animated, Platform, Text, TouchableOpacity } from 'react-native';
import AppHeader from './components/AppHeader';
import { getProfilesFromSupabase, handleLikeSupabase, handleNopeSupabase } from './data/profiles';
import ProfileCard from './components/ProfileCard';
import SwipeButtons from './components/SwipeButtons';
import ProfileDetail from './ProfileDetail';
import MatchModal from './MatchModal';
import { router } from 'expo-router';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';

interface loggedUserInfo {
  id: string;
  avatar_url: string;
  name: string;
  email: string;
  sexual_preference: string;
}

export default function Home() {
  const [sessionLoading, setSessionLoading] = useState(true);
  // Extract user info from session
  const { session } = useAuth();
  const userEmail = session?.user?.email || '';
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [userLoggedInfo, setUserLoggedInfo] = useState<loggedUserInfo | null>(null);
  const [loginModalVisible, setLoginModalVisible] = useState(true);
  const [loginError, setLoginError] = useState<string | undefined>(undefined);

  const [index, setIndex] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [matchVisible, setMatchVisible] = useState(false);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [matchedProfile, setMatchedProfile] = useState(null as null | any);

  const current = profiles[index];

  // Function to fetch user profile data
  const fetchUserProfile = async () => {
    if (!session?.user?.id) return;

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error.message);
        return;
      }

      if (profile) {
        setUserLoggedInfo(profile);
      }
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
    }
  };

  useEffect(() => {
    // Set session loading false when session is available (not undefined)
    if (session !== undefined) {
      setSessionLoading(false);
    }
    
    // Check if session exists
    if (session) {
      setUserLoggedIn(true);
      setLoginModalVisible(false);
      setLoadingProfiles(true);

      // Fetch user profile data when session is available
      fetchUserProfile();
      
      // Get userId and sexual preference
      const userId = session.user.id;
      const userSexualPreference = session.user.user_metadata?.sexual_preference;

      getProfilesFromSupabase(userId, userSexualPreference).then((data) => {
        setProfiles(data);
        setLoadingProfiles(false);
      });
    } else if (session === null) {
      // User is definitely logged out - reset all states and redirect
      setUserLoggedIn(false);
      setLoginModalVisible(false);
      setUserLoggedInfo(null);
      setProfiles([]);
      setLoadingProfiles(false);
      setIndex(0);
      setShowDetail(false);
      setMatchVisible(false);
      setMatchedProfile(null);
      setLoginError(undefined);
      // Redirect to main menu after logout
      router.replace('/main-menu');
    }
  }, [session]);

  if (sessionLoading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Cargando sesión...</Text>
    </View>;
  }
  if (loadingProfiles) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <AppHeader userEmail={userEmail} showBackButton={true} />
      <View style={{ marginTop: 20 }}><Text>Cargando perfiles...</Text></View>
    </View>;
  }
  if (!profiles.length) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <AppHeader userEmail={userEmail} showBackButton={true} />
      <View style={{ marginTop: 20 }}><Text>No hay perfiles disponibles.</Text></View>
      <TouchableOpacity
        style={styles.matchProfilesButton}
        onPress={() => router.push('/media-naranja/MatchProfiles')}
      >
        <Text style={styles.matchProfilesButtonText}>Ver Matches</Text>
      </TouchableOpacity>
    </View>;
  }

  const handleLike = async () => {
    if (!session?.user || !current) return;
    const userId = session.user.id;
    const likedUserId = current.id;

    // If userLoggedInfo is null, fetch it first
    let userProfile = userLoggedInfo;
    if (!userProfile) {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          console.error("Error fetching user profile in handleLike:", error.message);
        } else if (profile) {
          userProfile = profile;
          setUserLoggedInfo(profile);
        }
      } catch (error) {
        console.error("Error in profile fetch:", error);
      }
    }

    // Store the current profile data before any changes
    const currentProfileData = { ...current };

    // Call the updated handleLikeSupabase function that checks for matches
    const { success, isMatch, matchedProfile } = await handleLikeSupabase(userId, likedUserId);

    if (success) {
      // If it's a match, show the match modal and keep it visible until user closes it
      if (isMatch && matchedProfile) {
        // Set the matched profile first
        setMatchedProfile(matchedProfile);

        // Show the match modal
        setMatchVisible(true);

        // Only update the profiles list, but don't change the current index yet
        // This keeps the current profile visible behind the modal
        setProfiles(prev => {
          return prev.filter((p, i) => i !== index);
        });
      } else {
        // If no match, remove the profile and move to the next one
        setProfiles(prev => {
          const newProfiles = prev.filter((p, i) => i !== index);
          setIndex(i => (i >= newProfiles.length ? 0 : i));
          return newProfiles;
        });
      }
    }
  };

  const handleNope = async () => {
    if (!session?.user || !current) return;
    const userId = session.user.id;
    const nopedUserId = current.id;
    await handleNopeSupabase(userId, nopedUserId);
    setProfiles(prev => {
      const newProfiles = prev.filter((p, i) => i !== index);
      setIndex(i => (i >= newProfiles.length ? 0 : i));
      return newProfiles;
    });
  };


  const handleDetail = () => {
    setShowDetail(true);
  };

  const handleBack = () => {
    setShowDetail(false);
  };

  const handleCloseMatch = () => {
    // First hide the modal
    setMatchVisible(false);

    // Then move to the next profile if needed
    setIndex(i => (i >= profiles.length ? 0 : i));

    // Reset the matched profile
    setMatchedProfile(null);
  };

  if (!current) return null;

  if (!userLoggedIn) {
    return (
      <LoginModal
        visible={loginModalVisible}
        onLogin={async (username, password) => {

          if (!username || !password) {
            setLoginError('Campos Obligatorios');
            return;
          }

          const { data, error } = await supabase.auth.signInWithPassword({
            email: username,
            password: password,
          });

          if (error) {
            setLoginError('Usuario o contraseña incorrectos');
            throw error;
          }

          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user?.id)
            .single(); // como es solo un usuario

          if (profileError) {
            console.error("Error al obtener el perfil:", profileError.message);
            return;
          }

          if (data.user && profile) {
            setUserLoggedInfo(profile);
            setUserLoggedIn(true);
            setLoginModalVisible(false);
            setLoginError(undefined);
          } else {
            setLoginError('Usuario o contraseña incorrectos');
          }
        }}
        onClose={() => setLoginModalVisible(false)}
        onGoToRegister={() => {
          // Placeholder: navigate to register screen or show register modal
          setLoginModalVisible(false);
          router.push('/user/registerUser');
        }}
        error={loginError}
      />
    );
  }

  if (showDetail) {
    return (
      <ProfileDetail profile={current} onBack={handleBack} userEmail={userEmail} />
    );
  }


  return (
    <View style={styles.container}>
      <AppHeader userEmail={userEmail} showBackButton={true} />
      <View style={styles.content}>
        <ProfileCard profile={current} />
        <SwipeButtons onLike={handleLike} onNope={handleNope} onDetail={handleDetail} />
        {showDetail && (
          <ProfileDetail profile={current} onBack={handleBack} userEmail={userEmail} />
        )}
      </View>
      <TouchableOpacity
        style={styles.matchProfilesButton}
        onPress={() => router.push('/media-naranja/MatchProfiles')}
      >
        <Text style={styles.matchProfilesButtonText}>Ver Matches</Text>
      </TouchableOpacity>

      {/* Render MatchModal outside of other views to avoid z-index issues */}
      <MatchModal
        visible={matchVisible}
        onClose={handleCloseMatch}
        userPhoto={userLoggedInfo?.avatar_url || session?.user?.user_metadata?.avatar_url || 'https://via.placeholder.com/150'}
        matchPhoto={matchedProfile?.avatar_url || 'https://via.placeholder.com/150'}
        matchedProfile={matchedProfile}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8'
  },
  content: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 20 : 20, // match AppHeader height
    paddingHorizontal: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 5,
  },
  matchProfilesButton: {
    marginTop: 20,
    alignSelf: 'center',
    marginBottom: 60,
    backgroundColor: '#ff9800',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  matchProfilesButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
