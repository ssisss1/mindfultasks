export interface Todo {
  id: string
  title: string
  completed: boolean
  createdAt: number
}

export type MeditationStatus = 'idle' | 'running' | 'paused' | 'completed'

export interface User {
  id: string
  email: string
}
