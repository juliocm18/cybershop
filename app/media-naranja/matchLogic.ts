// Lógica de administración de likes, matches y perfiles vistos
import { clientProfile } from '@/app/user/model';

// Simulación de almacenamiento en memoria (puedes reemplazar con Supabase o AsyncStorage)
let likes: { userId: string; likedUserId: string }[] = [];
let matches: { userId1: string; userId2: string; timestamp: number }[] = [];
let userSeenProfiles: { userId: string; seenUserId: string }[] = [];

export function likeProfile(userId: string, likedUserId: string): boolean {
  // Guardar like
  likes.push({ userId, likedUserId });
  // Marcar como visto
  userSeenProfiles.push({ userId, seenUserId: likedUserId });
  // Verificar si existe like inverso
  const reciprocal = likes.find(l => l.userId === likedUserId && l.likedUserId === userId);
  if (reciprocal) {
    // Crear match
    const alreadyMatched = matches.find(
      m => (m.userId1 === userId && m.userId2 === likedUserId) || (m.userId1 === likedUserId && m.userId2 === userId)
    );
    if (!alreadyMatched) {
      matches.push({ userId1: userId, userId2: likedUserId, timestamp: Date.now() });
      return true; // Es un match
    }
  }
  return false; // No match todavía
}

export function nopeProfile(userId: string, dislikedUserId: string) {
  // Marcar como visto
  userSeenProfiles.push({ userId, seenUserId: dislikedUserId });
}

export function getNextProfile(userId: string, profiles: clientProfile[]): clientProfile | null {
  // Filtrar perfiles ya vistos
  const seenIds = userSeenProfiles.filter(u => u.userId === userId).map(u => u.seenUserId);
  return profiles.find(p => p.id !== userId && !seenIds.includes(p.id)) || null;
}

export function getMatches(userId: string): { userId: string; matchId: string; timestamp: number }[] {
  return matches
    .filter(m => m.userId1 === userId || m.userId2 === userId)
    .map(m => ({
      userId,
      matchId: m.userId1 === userId ? m.userId2 : m.userId1,
      timestamp: m.timestamp,
    }));
}

export function canChat(userId: string, otherUserId: string): boolean {
  return matches.some(
    m => (m.userId1 === userId && m.userId2 === otherUserId) || (m.userId1 === otherUserId && m.userId2 === userId)
  );
}
