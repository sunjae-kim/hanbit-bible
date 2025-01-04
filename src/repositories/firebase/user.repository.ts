import { FirebaseBaseRepository } from '@/repositories/firebase/firebase-base.repository'
import { User } from '@/types/user'
import { Timestamp } from 'firebase/firestore'

export class UserRepository extends FirebaseBaseRepository<User> {
  protected collectionName = 'users'

  protected mapToModel(data: any): User {
    return {
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    }
  }

  protected mapFromModel(model: Partial<User>): any {
    return {
      ...model,
      createdAt: model.createdAt && Timestamp.fromDate(model.createdAt),
      updatedAt: model.updatedAt && Timestamp.fromDate(model.updatedAt),
    }
  }
}
