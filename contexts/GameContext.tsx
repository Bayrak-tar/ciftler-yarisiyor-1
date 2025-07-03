import React, { createContext, useContext, useState, useEffect } from 'react';

export type GameMode = 'couple-vs-couple' | 'individual-vs-individual' | 'mixed-match';
export type GameRound = 'common-mind' | 'popular-answer' | 'general-knowledge';
export type GameState = 'waiting' | 'starting' | 'playing' | 'finished';

export interface GameRoom {
  id: string;
  mode: GameMode;
  players: Player[];
  currentRound: GameRound;
  roundNumber: number;
  state: GameState;
  scores: { [playerId: string]: number };
  currentQuestion?: Question;
}

export interface Player {
  id: string;
  username: string;
  isCouple?: boolean;
  couplePartner?: string;
}

export interface Question {
  id: string;
  text: string;
  type: 'common-mind' | 'popular' | 'general-knowledge';
  category?: string;
  options?: string[];
  correctAnswer?: string;
  timeLimit: number;
}

interface GameContextType {
  currentRoom: GameRoom | null;
  isLoading: boolean;
  joinRoom: (mode: GameMode) => Promise<void>;
  leaveRoom: () => void;
  submitAnswer: (answer: string) => void;
  sendChatMessage: (message: string) => void;
  chatMessages: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  playerId: string;
  username: string;
  message: string;
  timestamp: number;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const joinRoom = async (mode: GameMode) => {
    setIsLoading(true);
    try {
      // Simulate finding/creating a room
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockRoom: GameRoom = {
        id: 'room-' + Math.random().toString(36).substr(2, 9),
        mode,
        players: [
          { id: '1', username: 'Sen' },
          { id: '2', username: 'Partner', couplePartner: '1' },
          { id: '3', username: 'Rakip1' },
          { id: '4', username: 'Rakip2', couplePartner: '3' }
        ],
        currentRound: 'common-mind',
        roundNumber: 1,
        state: 'starting',
        scores: { '1': 0, '2': 0, '3': 0, '4': 0 }
      };
      
      setCurrentRoom(mockRoom);
    } finally {
      setIsLoading(false);
    }
  };

  const leaveRoom = () => {
    setCurrentRoom(null);
    setChatMessages([]);
  };

  const submitAnswer = (answer: string) => {
    // Handle answer submission
    console.log('Answer submitted:', answer);
  };

  const sendChatMessage = (message: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      playerId: '1',
      username: 'Sen',
      message,
      timestamp: Date.now()
    };
    setChatMessages(prev => [...prev, newMessage]);
  };

  return (
    <GameContext.Provider value={{
      currentRoom,
      isLoading,
      joinRoom,
      leaveRoom,
      submitAnswer,
      sendChatMessage,
      chatMessages
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}