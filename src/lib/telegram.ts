const TELEGRAM_BOT_TOKEN = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN
const TELEGRAM_API_BASE = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`

interface TelegramUser {
  id: number;
  username?: string;
}

interface TelegramMessage {
  from?: TelegramUser;
}

interface TelegramUpdate {
  message?: TelegramMessage;
}

export async function getUserId(username: string): Promise<number | null> {
  try {
    // Get updates to find the user
    const response = await fetch(`${TELEGRAM_API_BASE}/getUpdates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Failed to get updates:', error);
      return null;
    }

    const data = await response.json();

    // Find the user in recent updates by their username
    const cleanUsername = username.replace(/^@/, '');
    const userUpdate = data.result?.find((update: TelegramUpdate) => 
      update.message?.from?.username?.toLowerCase() === cleanUsername.toLowerCase()
    );

    if (!userUpdate?.message?.from?.id) {
      return null;
    }

    return userUpdate.message.from.id;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
}

export async function inviteUserToChannel(username: string, channelId: string): Promise<boolean> {
  try {
    // Get the user's ID first
    const userId = await getUserId(username);
    if (!userId) {
      return false;
    }

    console.log('Found user ID:', userId);
    
    // Create an invite link for the channel
    const response = await fetch(`${TELEGRAM_API_BASE}/createChatInviteLink`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: channelId,
        name: `Invite for user ${userId}`,
        creates_join_request: false,
        expire_date: Math.floor(Date.now() / 1000) + 86400 // 24 hours from now
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Failed to create invite link:', error);
      return false;
    }

    const data = await response.json();
    if (!data.ok || !data.result?.invite_link) {
      console.error('Failed to create invite link:', data);
      return false;
    }

    // Send the invite link to the user
    const messageResponse = await fetch(`${TELEGRAM_API_BASE}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: userId,
        text: `Welcome to our community! Here's your exclusive invite link: ${data.result.invite_link}\n\nThis link will expire in 24 hours.`,
        parse_mode: 'HTML'
      })
    });

    if (!messageResponse.ok) {
      const error = await messageResponse.json();
      console.error('Failed to send invite message:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error inviting user to Telegram channel:', error);
    return false;
  }
}

export async function sendWelcomeMessage(username: string): Promise<boolean> {
  try {
    // Get the user's ID first
    const userId = await getUserId(username);
    if (!userId) {
      return false;
    }

    console.log('Sending welcome message to user ID:', userId);
    
    // Send welcome message
    const response = await fetch(`${TELEGRAM_API_BASE}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: userId,
        text: 'Welcome to the community! I\'ll send you an invite link to our exclusive channel in a moment.',
        parse_mode: 'HTML'
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Failed to send welcome message:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending welcome message:', error);
    return false;
  }
} 