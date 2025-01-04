export interface BibleRange {
  book: string // 책 (예: "창")
  startChapter: number // 시작 장
  endChapter: number // 끝 장
}

export interface DailyReading {
  ranges: BibleRange[] // 하루에 여러 범위가 있을 수 있음
}

export interface MonthlyPlan {
  [day: string]: DailyReading // "1" ~ "31"
}

export interface Plan {
  id: string // 플랜 식별자
  name: string // 플랜 이름
  year: number // 연도
  description?: string // 설명
  months: {
    [month: string]: MonthlyPlan // "1" ~ "12"
  }
}
