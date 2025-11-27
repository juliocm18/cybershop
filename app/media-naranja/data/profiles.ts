import { supabase } from '../../supabase';
import { clientProfile } from '@/app/user/model';

// Fetch profiles from Supabase where accept_media_naranja is true
export async function getProfilesFromSupabase(
  userId?: string, 
  sexualPreference?: string,
  userGender?: string
): Promise<clientProfile[]> {
  console.log("userId",userId, "sexualPreference", sexualPreference, "userGender", userGender);
  // Step 1: Get liked and noped user IDs
  let excludeIds: string[] = [];
  if (userId) {
    // Always add the current user's ID to the exclude list
    excludeIds.push(userId);
    
    const [likesRes, nopesRes] = await Promise.all([
      supabase.from('likes').select('liked_user_id').eq('user_id', userId),
      supabase.from('nopes').select('noped_user_id').eq('user_id', userId)
    ]);
    const likedIds = likesRes.data ? likesRes.data.map((row: any) => row.liked_user_id) : [];
    const nopedIds = nopesRes.data ? nopesRes.data.map((row: any) => row.noped_user_id) : [];
    excludeIds = [...excludeIds, ...likedIds, ...nopedIds];
  }
  // Step 2: Query profiles, excluding those IDs (including the current user)
  let query = supabase
    .from('profiles')
    .select('*')
    .eq('accept_media_naranja', true);
  
  // Filter by gender based on sexual preference
  if (sexualPreference && userGender) {
    if (sexualPreference === 'heterosexual') {
      // Heterosexual: show opposite gender
      const oppositeGender = userGender === 'masculino' ? 'femenino' : 'masculino';
      query = query.eq('gender', oppositeGender);
      // Show profiles that are heterosexual or prefer both genders
      query = query.or(`sexual_preference.eq.heterosexual,sexual_preference.eq.ambos`);
    } else if (sexualPreference === 'homosexual') {
      // Homosexual: show same gender
      query = query.eq('gender', userGender);
      // Show profiles that are homosexual or prefer both genders
      query = query.or(`sexual_preference.eq.homosexual,sexual_preference.eq.ambos`);
    } else if (sexualPreference === 'ambos') {
      // Bisexual: show all genders
      // Show profiles that could be interested (heterosexual of opposite gender, homosexual of same gender, or ambos)
      if (userGender === 'masculino') {
        query = query.or(`and(gender.eq.femenino,sexual_preference.eq.heterosexual),and(gender.eq.masculino,sexual_preference.eq.homosexual),sexual_preference.eq.ambos`);
      } else {
        query = query.or(`and(gender.eq.masculino,sexual_preference.eq.heterosexual),and(gender.eq.femenino,sexual_preference.eq.homosexual),sexual_preference.eq.ambos`);
      }
    }
  }
  
  if (excludeIds.length > 0) {
    query = query.not('id', 'in', `(${excludeIds.join(',')})`)
  }
  const { data, error } = await query;
  if (error) {
    console.error('Error fetching profiles:', error);
    return [];
  }
  return (data as clientProfile[]) || [];
}

// Handle Like: Insert a like into Supabase and check for matches
export async function handleLikeSupabase(userId: string, likedUserId: string) {
  try {
    // First check if there's already a mutual like (match) before inserting
    const { data: existingLike, error: checkError } = await supabase
      .from('likes')
      .select('*')
      .eq('user_id', likedUserId)
      .eq('liked_user_id', userId)
      .single();

      console.log(likedUserId, userId)
      console.log('existingLike', existingLike);
      console.log('checkError', checkError);
      
    
    // Insert the like
    const { error } = await supabase.from('likes').insert([
      { user_id: userId, liked_user_id: likedUserId, created_at: new Date().toISOString() }
    ]);
    
    if (error) {
      console.error('Error inserting like:', error);
      return { success: false, isMatch: false, matchedProfile: null };
    }
    
    // If there was an existing like (mutual match)
    const isMatch = existingLike !== null && !checkError;
    
    if (isMatch) {
      console.log('isMatch', isMatch);
      // Get the matched user's profile
      const { data: matchedProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', likedUserId)
        .single();
      
      if (profileError) {
        console.error('Error fetching matched profile:', profileError);
        return { success: true, isMatch: true, matchedProfile: null };
      }
      
      return { success: true, isMatch: true, matchedProfile };
    }
    
    return { success: true, isMatch: false, matchedProfile: null };
  } catch (error) {
    console.error('Unexpected error in handleLikeSupabase:', error);
    return { success: false, isMatch: false, matchedProfile: null };
  }
}

// Handle Nope: Insert a nope into Supabase
export async function handleNopeSupabase(userId: string, nopedUserId: string) {
  const { error } = await supabase.from('nopes').insert([
    { user_id: userId, noped_user_id: nopedUserId, created_at: new Date().toISOString() }
  ]);
  if (error) {
    console.error('Error inserting nope:', error);
    return false;
  }
  return true;
}

