export interface Task {
    id?: number;
    user_id: number;
    title: string;
    description: string;
    status: 'pending' | 'completed';
    created_at?: Date;
  }