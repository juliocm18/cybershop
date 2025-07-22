// Lógica para sistema de likes ilimitados o limitados por día
// Simulación en memoria (reemplazar por persistencia real en producción)

interface UserLikeStatus {
  userId: string;
  isPremium: boolean;
  likesToday: number;
  lastReset: number; // timestamp
}

const LIKE_LIMIT = 20; // Configurable
const ONE_DAY = 24 * 60 * 60 * 1000;

let userLikeStatus: Record<string, UserLikeStatus> = {};

export function canLike(userId: string, isPremium: boolean): { allowed: boolean; remaining: number } {
  const now = Date.now();
  let user = userLikeStatus[userId];
  if (!user) {
    user = {
      userId,
      isPremium,
      likesToday: 0,
      lastReset: now,
    };
    userLikeStatus[userId] = user;
  }
  // Reset diario
  if (now - user.lastReset > ONE_DAY) {
    user.likesToday = 0;
    user.lastReset = now;
  }
  if (isPremium) {
    return { allowed: true, remaining: -1 };
  }
  if (user.likesToday < LIKE_LIMIT) {
    return { allowed: true, remaining: LIKE_LIMIT - user.likesToday };
  }
  return { allowed: false, remaining: 0 };
}

export function registerLike(userId: string, isPremium: boolean) {
  if (isPremium) return;
  const now = Date.now();
  let user = userLikeStatus[userId];
  if (!user) {
    user = {
      userId,
      isPremium,
      likesToday: 0,
      lastReset: now,
    };
    userLikeStatus[userId] = user;
  }
  // Reset diario
  if (now - user.lastReset > ONE_DAY) {
    user.likesToday = 0;
    user.lastReset = now;
  }
  user.likesToday += 1;
}

export function getLikeStatus(userId: string, isPremium: boolean): { remaining: number; isPremium: boolean } {
  const status = canLike(userId, isPremium);
  return { remaining: status.remaining, isPremium };
}
