import { BaseRepository } from '@/repositories/base.repository'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  getFirestore,
} from 'firebase/firestore'

export abstract class FirebaseBaseRepository<T> implements BaseRepository<T> {
  protected abstract collectionName: string
  protected db = getFirestore()

  protected getCollection() {
    return collection(this.db, this.collectionName)
  }

  protected getDocRef(id: string) {
    return doc(this.db, this.collectionName, id)
  }

  protected abstract mapToModel(data: any): T
  protected abstract mapFromModel(model: T): any

  async create(data: Omit<T, 'id'>): Promise<T> {
    const docRef = doc(this.getCollection())
    const timestamp = Timestamp.now()

    const saveData = {
      ...this.mapFromModel(data as T),
      id: docRef.id,
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    await setDoc(docRef, saveData)
    return this.mapToModel(saveData)
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const docRef = this.getDocRef(id)
    const timestamp = Timestamp.now()

    const updateData = {
      ...this.mapFromModel(data as T),
      updatedAt: timestamp,
    }

    await updateDoc(docRef, updateData)
    const updated = await getDoc(docRef)
    return this.mapToModel(updated.data())
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(this.getDocRef(id))
  }

  async findById(id: string): Promise<T | null> {
    const docSnap = await getDoc(this.getDocRef(id))
    return docSnap.exists() ? this.mapToModel(docSnap.data()) : null
  }

  async findAll(): Promise<T[]> {
    const querySnapshot = await getDocs(this.getCollection())
    return querySnapshot.docs.map((doc) => this.mapToModel(doc.data()))
  }
}
