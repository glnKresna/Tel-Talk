export interface UserProfile {
    uid:         string;
    displayName: string;
    email:       string;
    photoURL:    string | null;
    bio:         string;
    createdAt:   string;
    status:      "online" | "offline" | "away";
    stats:       { messages: number; groups: number; contacts: number };
}

export interface ChatPreview {
    id:        string;
    name:      string;
    lastMsg:   string;
    time:      string;
    unread?:   number;
    initials:  string;
    color:     string;
    online?:   boolean;
    isGroup?:  boolean;
}

export interface NotifSetting {
    key:   string;
    label: string;
    sub:   string;
    on:    boolean;
}