export interface UserPlanMonth {
  userId: string
  planId: string
  year: number
  month: number // 1-12
  completions: {
    [day: string]: boolean // "1" to "31"
  }
  createdAt: Date
  updatedAt: Date
}
