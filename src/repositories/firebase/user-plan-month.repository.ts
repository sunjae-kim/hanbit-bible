import { db } from '@/lib/firebase'
import { UserPlanMonth } from '@/types/userPlan'
import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'

export class UserPlanMonthRepository {
  protected normalizeDayString(day: string | number): string {
    return String(parseInt(String(day)))
  }

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

  async findAllMonths(userId: string, planId: string, year: number, signal?: AbortSignal): Promise<UserPlanMonth[]> {
    const monthsRef = this.getMonthsCollection(userId, planId)
    const q = query(monthsRef, where('year', '==', year))

    return new Promise((resolve, reject) => {
      // AbortSignal 이벤트 리스너
      if (signal) {
        signal.addEventListener('abort', () => {
          reject(new DOMException('Aborted', 'AbortError'))
        })
      }

      getDocs(q)
        .then((querySnapshot) => {
          // 이미 abort 되었는지 확인
          if (signal?.aborted) {
            reject(new DOMException('Aborted', 'AbortError'))
            return
          }
          resolve(querySnapshot.docs.map((doc) => this.mapToModel(doc.data())))
        })
        .catch(reject)
    })
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
      likes: {},
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
    const normalizedDay = this.normalizeDayString(day)

    const updateData = {
      [`completions.${normalizedDay}`]: completed,
      updatedAt: timestamp,
    }

    await updateDoc(docRef, updateData)
    const updated = await getDoc(docRef)
    return this.mapToModel(updated.data())
  }

  async updateLike(
    userId: string,
    planId: string,
    year: number,
    month: number,
    day: string,
    liked: boolean,
  ): Promise<UserPlanMonth> {
    const docRef = this.getMonthDoc(userId, planId, year, month)
    const timestamp = Timestamp.now()
    const normalizedDay = this.normalizeDayString(day)

    const updateData = {
      [`likes.${normalizedDay}`]: liked,
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
        likes: {},
        createdAt: timestamp.toDate(),
        updatedAt: timestamp.toDate(),
      }

      batch.set(docRef, this.mapFromModel(newMonth))
    }

    await batch.commit()
  }

  listenToPlanStats(
    planId: string,
    date: Date,
    callback: (stats: { totalLikes: number; totalCompletions: number }) => void,
  ) {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = this.normalizeDayString(date.getDate())

    const monthsRef = collectionGroup(db, 'months')
    const q = query(monthsRef, where('planId', '==', planId), where('year', '==', year), where('month', '==', month))

    return onSnapshot(q, (snapshot) => {
      let totalLikes = 0
      let totalCompletions = 0

      snapshot.forEach((doc) => {
        const data = doc.data()
        if (data.likes?.[day]) totalLikes++
        if (data.completions?.[day]) totalCompletions++
      })

      callback({ totalLikes, totalCompletions })
    })
  }
}
