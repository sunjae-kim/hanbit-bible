import { db } from '@/lib/firebase'
import { UserPlanMonth } from '@/types/userPlan'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'

export class UserPlanMonthRepository {
  protected getMonthDoc(userId: string, planId: string, _year: number, month: number) {
    return doc(db, 'userPlans', userId, 'yearPlans', planId, 'months', `${month}`)
  }

  protected getMonthsCollection(userId: string, planId: string) {
    return collection(db, 'userPlans', userId, 'yearPlans', planId, 'months')
  }

  protected mapToModel(data: any): UserPlanMonth {
    return {
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    }
  }

  protected mapFromModel(model: Partial<UserPlanMonth>): any {
    const mapped: any = { ...model }

    if (model.createdAt) {
      mapped.createdAt = Timestamp.fromDate(model.createdAt)
    }
    if (model.updatedAt) {
      mapped.updatedAt = Timestamp.fromDate(model.updatedAt)
    }

    Object.keys(mapped).forEach((key) => {
      if (mapped[key] === undefined) {
        delete mapped[key]
      }
    })

    return mapped
  }

  async findMonth(userId: string, planId: string, year: number, month: number): Promise<UserPlanMonth | null> {
    const docRef = this.getMonthDoc(userId, planId, year, month)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) return null

    return this.mapToModel(docSnap.data())
  }

  async findAllMonths(userId: string, planId: string, year: number): Promise<UserPlanMonth[]> {
    const monthsRef = this.getMonthsCollection(userId, planId)
    const q = query(monthsRef, where('year', '==', year))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => this.mapToModel(doc.data()))
  }

  async createMonth(userId: string, planId: string, year: number, month: number): Promise<UserPlanMonth> {
    const docRef = this.getMonthDoc(userId, planId, year, month)
    const timestamp = Timestamp.now()

    const newMonth: UserPlanMonth = {
      userId,
      planId,
      year,
      month,
      completions: {},
      createdAt: timestamp.toDate(),
      updatedAt: timestamp.toDate(),
    }

    await setDoc(docRef, this.mapFromModel(newMonth))
    return newMonth
  }

  async updateCompletion(
    userId: string,
    planId: string,
    year: number,
    month: number,
    day: string,
    completed: boolean,
  ): Promise<UserPlanMonth> {
    const docRef = this.getMonthDoc(userId, planId, year, month)
    const timestamp = Timestamp.now()

    const updateData = {
      [`completions.${day}`]: completed,
      updatedAt: timestamp,
    }

    await updateDoc(docRef, updateData)
    const updated = await getDoc(docRef)
    return this.mapToModel(updated.data())
  }

  // 필요한 경우 여러 월을 한 번에 생성
  async initializeYear(userId: string, planId: string, year: number): Promise<void> {
    const batch = writeBatch(db)
    const timestamp = Timestamp.now()

    for (let month = 1; month <= 12; month++) {
      const docRef = this.getMonthDoc(userId, planId, year, month)
      const newMonth: UserPlanMonth = {
        userId,
        planId,
        year,
        month,
        completions: {},
        createdAt: timestamp.toDate(),
        updatedAt: timestamp.toDate(),
      }

      batch.set(docRef, this.mapFromModel(newMonth))
    }

    await batch.commit()
  }
}
