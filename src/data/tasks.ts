export type Task = { id: string; title: string; description: string; reward: number; healthReward: number };

export const tasks: Task[] = [
  { id: 'kick-marathon', title: 'Kick Marathon', description: 'Watch 1 hour of live streams on Kick.', reward: 15, healthReward: 10 },
  { id: 'cinematic-binge', title: 'Cinematic Binge', description: 'Watch 5 YouTube videos in full screen.', reward: 15, healthReward: 10 },
  { id: 'discord-chatterbox', title: 'Discord Chatterbox', description: 'Send 100 messages on Discord.', reward: 15, healthReward: 10 },
  { id: 'reddit-contributor', title: 'Reddit Contributor', description: 'Create a brand new post on Reddit.', reward: 10, healthReward: 5 },
  { id: 'youtube-shorts-pit', title: 'YouTube Shorts Pit', description: 'Scroll through 100 reels/shorts on YouTube Shorts.', reward: 20, healthReward: 15 },
  { id: 'instagram-doom-scroll', title: 'Instagram Doom-Scroll', description: 'Swipe through 100 videos on Instagram Reels.', reward: 20, healthReward: 15 },
  { id: 'time-sink', title: 'The Time Sink', description: 'Reach 10 cumulative hours of browser screen time.', reward: 20, healthReward: 15 },
  { id: 'night-owl-twitch', title: 'Night Owl Twitch', description: 'Watch 1 hour of Twitch streaming after midnight.', reward: 20, healthReward: 15 },
  { id: 'midnight-netflix', title: 'Midnight Netflix', description: 'Stream 1 hour of Netflix after midnight.', reward: 15, healthReward: 10 }
];
