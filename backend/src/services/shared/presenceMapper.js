import { isUserOnline } from "../../socket/presenceManager.js";

export const getPresenceForUser = (user) => {
  const userId = Number(user?.id ?? user?.userId);
  const online = Number.isInteger(userId)
    ? isUserOnline(userId) || Boolean(user?.isOnline)
    : Boolean(user?.isOnline);

  return {
    isOnline: online,
    lastSeenAt: online ? null : user?.lastSeenAt || null,
  };
};

export const mapParticipantPresence = (participant) => {
  const presence = getPresenceForUser(participant.user);

  return {
    userId: participant.userId,
    username: participant.user?.username,
    fullName: participant.user?.profile?.fullName || null,
    avatar: participant.user?.profile?.avatar || null,
    role: participant.role,
    joinedAt: participant.joinedAt,
    isOnline: presence.isOnline,
    lastSeenAt: presence.lastSeenAt,
  };
};

export const countOnlineParticipants = (participants) =>
  participants.reduce((count, participant) => {
    const presence = getPresenceForUser(participant.user);
    return count + (presence.isOnline ? 1 : 0);
  }, 0);
