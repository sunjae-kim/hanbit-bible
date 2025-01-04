export interface BaseRepository<T> {
  create(data: Omit<T, 'id'>): Promise<T>
  update(id: string, data: Partial<T>): Promise<T>
  delete(id: string): Promise<void>
  findById(id: string): Promise<T | null>
  findAll(): Promise<T[]>
}
