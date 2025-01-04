import { BibleLoadingState } from '@/types/bible'

interface BibleVerse {
  [verseNumber: string]: string
}

interface BibleChapter {
  verses: BibleVerse
}

interface BibleBook {
  chapters: {
    [chapterNumber: string]: BibleChapter
  }
}

interface BibleData {
  books: {
    [bookName: string]: BibleBook
  }
}

interface SearchResult {
  book: string
  chapter: string
  verse: string
  text: string
}

interface InitializeOptions {
  url?: string
  useIndexedDB?: boolean
}

class BibleError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BibleError'
  }
}

interface InitializeOptions {
  url?: string
  useIndexedDB?: boolean
  onProgress?: (stage: BibleLoadingState['stage'], message: string) => void
}

class BibleManager {
  private bibleData: BibleData | null = null
  private isInitialized: boolean = false
  private readonly baseUrl: string

  constructor() {
    this.baseUrl = 'https://hb-read-bible.web.app/bible.json'
  }

  /**
   * Bible 데이터를 초기화합니다.
   */
  public async initialize(options: InitializeOptions = {}): Promise<void> {
    const { url = this.baseUrl, useIndexedDB = true, onProgress } = options

    if (this.isInitialized) return

    try {
      if (useIndexedDB) {
        const cachedData = await this.loadFromIndexedDB()
        if (cachedData) {
          this.bibleData = cachedData
          this.isInitialized = true
          return
        }
      }

      onProgress?.('downloading', '성경 데이터 다운로드 중...')
      const response = await fetch(url)
      if (!response.ok) {
        throw new BibleError(`HTTP error! status: ${response.status}`)
      }

      onProgress?.('initializing', '데이터 초기화 중...')
      const data = await response.json()
      this.bibleData = data as BibleData

      if (useIndexedDB && this.bibleData) {
        onProgress?.('initializing', '캐시 저장 중...')
        await this.saveToIndexedDB(this.bibleData)
      }

      await new Promise((resolve) => setTimeout(resolve, 500))

      this.isInitialized = true
      onProgress?.('complete', '성경 불러오기 성공')

      await new Promise((resolve) => setTimeout(resolve, 500))
    } catch (error) {
      if (error instanceof Error) {
        throw new BibleError(`Bible 초기화 실패: ${error.message}`)
      }
      throw new BibleError('Bible 초기화 중 알 수 없는 오류가 발생했습니다.')
    }
  }

  /**
   * IndexedDB에서 데이터를 로드합니다.
   */
  private async loadFromIndexedDB(): Promise<BibleData | null> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('BibleDB', 1)

      request.onerror = () => reject(new BibleError('IndexedDB 접근 오류'))
      request.onsuccess = () => {
        const db = request.result
        const tx = db.transaction('bible', 'readonly')
        const store = tx.objectStore('bible')
        const getRequest = store.get('bibleData')

        getRequest.onsuccess = () => resolve(getRequest.result as BibleData | null)
        getRequest.onerror = () => reject(new BibleError('IndexedDB 데이터 로드 실패'))
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains('bible')) {
          db.createObjectStore('bible')
        }
      }
    })
  }

  /**
   * IndexedDB에 데이터를 저장합니다.
   */
  private async saveToIndexedDB(data: BibleData): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('BibleDB', 1)

      request.onerror = () => reject(new BibleError('IndexedDB 접근 오류'))
      request.onsuccess = () => {
        const db = request.result
        const tx = db.transaction('bible', 'readwrite')
        const store = tx.objectStore('bible')
        store.put(data, 'bibleData')

        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(new BibleError('IndexedDB 저장 실패'))
      }
    })
  }

  /**
   * 특정 구절을 가져옵니다.
   */
  public getVerse(book: string, chapter: string | number, verse: string | number): string {
    this.checkInitialized()
    try {
      const verseText = this.bibleData?.books[book]?.chapters[chapter]?.verses[verse]
      if (!verseText) {
        throw new BibleError(`구절을 찾을 수 없습니다: ${book} ${chapter}:${verse}`)
      }
      return verseText
    } catch (error) {
      if (error instanceof BibleError) throw error
      throw new BibleError(`구절 조회 중 오류 발생: ${book} ${chapter}:${verse}`)
    }
  }

  /**
   * 특정 장의 모든 구절을 가져옵니다.
   */
  public getChapter(book: string, chapter: string | number): BibleVerse {
    this.checkInitialized()
    try {
      const verses = this.bibleData?.books[book]?.chapters[chapter]?.verses
      if (!verses) {
        throw new BibleError(`장을 찾을 수 없습니다: ${book} ${chapter}`)
      }
      return verses
    } catch (error) {
      if (error instanceof BibleError) throw error
      throw new BibleError(`장 조회 중 오류 발생: ${book} ${chapter}`)
    }
  }

  /**
   * 특정 책의 모든 장을 가져옵니다.
   */
  public getBook(book: string): BibleBook['chapters'] {
    this.checkInitialized()
    try {
      const chapters = this.bibleData?.books[book]?.chapters
      if (!chapters) {
        throw new BibleError(`책을 찾을 수 없습니다: ${book}`)
      }
      return chapters
    } catch (error) {
      if (error instanceof BibleError) throw error
      throw new BibleError(`책 조회 중 오류 발생: ${book}`)
    }
  }

  /**
   * 텍스트로 성경을 검색합니다.
   */
  public search(searchText: string): SearchResult[] {
    this.checkInitialized()
    if (!this.bibleData) {
      throw new BibleError('Bible 데이터가 초기화되지 않았습니다.')
    }

    const results: SearchResult[] = []

    for (const [bookName, book] of Object.entries(this.bibleData.books)) {
      for (const [chapterNum, chapter] of Object.entries(book.chapters)) {
        for (const [verseNum, verseText] of Object.entries(chapter.verses)) {
          if (verseText.includes(searchText)) {
            results.push({
              book: bookName,
              chapter: chapterNum,
              verse: verseNum,
              text: verseText,
            })
          }
        }
      }
    }

    return results
  }

  /**
   * 초기화 여부를 확인합니다.
   */
  private checkInitialized(): void {
    if (!this.isInitialized) {
      throw new BibleError('Bible이 초기화되지 않았습니다. initialize()를 먼저 호출하세요.')
    }
  }
}

export const bibleManager = new BibleManager()

export const BIBLE_BOOK_MAPPER: { [key: string]: string } = {
  // 구약
  창: '창세기',
  출: '출애굽기',
  레: '레위기',
  민: '민수기',
  신: '신명기',
  수: '여호수아',
  삿: '사사기',
  룻: '룻기',
  삼상: '사무엘상',
  삼하: '사무엘하',
  왕상: '열왕기상',
  왕하: '열왕기하',
  대상: '역대상',
  대하: '역대하',
  스: '에스라',
  느: '느헤미야',
  에: '에스더',
  욥: '욥기',
  시: '시편',
  잠: '잠언',
  전: '전도서',
  아: '아가',
  사: '이사야',
  렘: '예레미야',
  애: '예레미야애가',
  겔: '에스겔',
  단: '다니엘',
  호: '호세아',
  욜: '요엘',
  암: '아모스',
  옵: '오바댜',
  욘: '요나',
  미: '미가',
  나: '나훔',
  합: '하박국',
  습: '스바냐',
  학: '학개',
  슥: '스가랴',
  말: '말라기',

  // 신약
  마: '마태복음',
  막: '마가복음',
  눅: '누가복음',
  요: '요한복음',
  행: '사도행전',
  롬: '로마서',
  고전: '고린도전서',
  고후: '고린도후서',
  갈: '갈라디아서',
  엡: '에베소서',
  빌: '빌립보서',
  골: '골로새서',
  살전: '데살로니가전서',
  살후: '데살로니가후서',
  딤전: '디모데전서',
  딤후: '디모데후서',
  딛: '디도서',
  몬: '빌레몬서',
  히: '히브리서',
  약: '야고보서',
  벧전: '베드로전서',
  벧후: '베드로후서',
  요일: '요한일서',
  요이: '요한이서',
  요삼: '요한삼서',
  유: '유다서',
  계: '요한계시록',
}
