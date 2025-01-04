import { FirebaseBaseRepository } from '@/repositories/firebase/firebase-base.repository'
import { Plan } from '@/types/plan'
import { getDocs, query, where } from 'firebase/firestore'

export class PlanRepository extends FirebaseBaseRepository<Plan> {
  protected collectionName = 'plans'

  protected mapToModel(data: any): Plan {
    return data as Plan // Plan 모델은 Date 필드가 없으므로 변환이 필요 없음
  }

  protected mapFromModel(model: Partial<Plan>): any {
    return model
  }

  // 특정 연도의 플랜 조회
  async findByYear(year: number): Promise<Plan[]> {
    const querySnapshot = await getDocs(query(this.getCollection(), where('year', '==', year)))
    return querySnapshot.docs.map((doc) => this.mapToModel(doc.data()))
  }
}
