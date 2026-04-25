# 메모장 앱 설계 (Notes App Design)

## 개요

기존 lead-collection Next.js 앱에 독립된 메모장 기능을 추가한다. 사용자는 회원가입/로그인 후 본인의 메모만 작성·수정·삭제할 수 있다. 데이터는 기존 Supabase PostgreSQL에 저장하며, Supabase Auth로 인증을 처리한다.

---

## 데이터 구조

### `notes` 테이블 (Supabase PostgreSQL)

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| `id` | uuid | PK, default gen_random_uuid() | 기본키 |
| `user_id` | uuid | NOT NULL, FK → auth.users | Supabase Auth 사용자 ID |
| `title` | text | NOT NULL | 메모 제목 |
| `content` | text | | 메모 본문 |
| `created_at` | timestamp with time zone | default now() | 생성일 |
| `updated_at` | timestamp with time zone | default now() | 수정일 |

### Row Level Security (RLS) 정책

- `notes` 테이블에 RLS 활성화
- SELECT / INSERT / UPDATE / DELETE 모두 `auth.uid() = user_id` 조건 적용
- 타인의 메모에는 접근 불가

### Drizzle ORM 스키마

`src/db/schema.ts`에 `notes` 테이블 정의 추가 (pgTable, uuid, text, timestamp 사용).

---

## 페이지 구조

| 경로 | 설명 | 인증 필요 |
|---|---|---|
| `/` | 기존 문의 폼 (변경 없음) | 불필요 |
| `/login` | 이메일/비밀번호 로그인 | 불필요 |
| `/signup` | 회원가입 | 불필요 |
| `/notes` | 내 메모 목록 (리스트 뷰) | 필요 |
| `/notes/new` | 새 메모 작성 | 필요 |
| `/notes/[id]` | 메모 상세 보기 + 수정 | 필요 |

### 미들웨어

`middleware.ts`에서 `/notes/*` 경로 보호. 비로그인 시 `/login`으로 리다이렉트. Supabase 세션 쿠키 기반 검증.

---

## API 라우트

| 메서드 | 경로 | 설명 |
|---|---|---|
| GET | `/api/notes` | 로그인 사용자의 메모 목록 반환 |
| POST | `/api/notes` | 새 메모 생성 |
| GET | `/api/notes/[id]` | 단건 메모 조회 |
| PUT | `/api/notes/[id]` | 메모 수정 |
| DELETE | `/api/notes/[id]` | 메모 삭제 |

모든 API는 서버사이드에서 Supabase 세션 쿠키로 `user_id` 검증. 미인증 요청은 401 반환.

---

## UI 설계

### 공통

- 현재 문의 폼과 동일한 스타일: 흰 카드, 인디고 버튼, Tailwind CSS

### 로그인 / 회원가입 (`/login`, `/signup`)

- 이메일 + 비밀번호 입력 폼
- 에러 메시지 인라인 표시
- 로그인 ↔ 회원가입 링크 상호 연결

### 메모 목록 (`/notes`)

- 상단: "새 메모" 버튼 + 로그아웃 버튼
- 세로 리스트: 각 항목에 제목, 수정일, 본문 미리보기(2줄 clamp)
- 각 항목 우측에 삭제 버튼
- 메모 없을 시 빈 상태 안내 문구

### 새 메모 / 수정 (`/notes/new`, `/notes/[id]`)

- 제목 입력란 (input)
- 본문 텍스트에어리어 (resize 가능)
- 저장 버튼
- 수정 시 기존 제목/내용 불러옴
- 목록으로 돌아가기 링크

---

## 기술 스택

- **인증**: Supabase Auth (이메일/비밀번호)
- **DB**: 기존 Supabase PostgreSQL + Drizzle ORM
- **패키지 추가**: `@supabase/ssr` (서버사이드 세션 관리), `@supabase/supabase-js`
- **미들웨어**: Next.js middleware.ts

---

## 범위 밖 (Out of Scope)

- 소셜 로그인 (Google 등)
- 메모 검색/필터
- 태그/카테고리
- 메모 공유
