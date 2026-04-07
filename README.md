## Link-in-Bio (화면설계서 구현)

`/{username}` 형태의 공개 프로필 페이지와 `/dashboard` 관리 페이지를 제공하는 **Link-in-Bio** 예제입니다.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Demo

- 공개 페이지: `/spider`
- 로그인: 아이디 `spider` / 비밀번호 `spider`
- 대시보드: `/dashboard`

### Environment Variables

프로젝트 루트에 `.env.local`을 만들고 필요 시 아래를 설정하세요. (배포/Vercel에서는 Environment Variables로 설정)

```bash
# (선택) 세션 쿠키 서명 키 — 운영에서는 반드시 변경
SESSION_SECRET="change-me"

# (선택) 문의하기 → Notion DB 저장
NOTION_API_KEY="secret_..."
NOTION_DATABASE_ID="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

> `.env*` 파일은 기본적으로 Git에 커밋되지 않도록 설정되어 있습니다.
> 예시는 `.env.example`을 참고하세요.

### Data Storage (로컬)

개발 편의를 위해 로컬 JSON 파일에 데이터를 저장합니다.

- 파일: `/.data/db.json` (Git ignore)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
