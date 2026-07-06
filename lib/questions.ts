import type { Category, Question } from "./types";

export const categories: Category[] = [
  { id: "math", name: "수학은 배신하지 않는다" },
  { id: "science", name: "과학인데 왜 이래" },
  { id: "movie", name: "이모티콘 영화관" },
  { id: "biology", name: "해골 보고 맞히기" },
  { id: "life", name: "생활의 잡기술" },
  { id: "history", name: "History in Frame" },
  { id: "literature", name: "책 읽은 척 금지" },
  { id: "geography", name: "세계는 넓고 문제는 이상하다" },
  { id: "entertainment", name: "연예계 현장검증" },
  { id: "culture", name: "문화충격" }
];

export const questions: Question[] = [
  { id: "math-1", categoryId: "math", points: 250, type: "math", q: "155² - 145² = ?", a: "3000", explanation: "a² - b² = (a-b)(a+b), so 10 × 300 = 3000." },
  { id: "math-2", categoryId: "math", points: 100, type: "math", q: "숫자 1, 2, 3, 4, 5로 만든 다섯 자리 정수 중 숫자 1이 숫자 2의 왼쪽에 오는 경우는 몇 개인가?", a: "60", explanation: "전체 5! = 120개 중 1과 2의 상대적 순서는 절반씩 나뉘므로 60개." },
  { id: "math-3", categoryId: "math", points: 350, type: "math", q: "TAEJAETAEJAETAEJAE... 2026번째 위치에 오는 글자는?", a: "J", explanation: "TAEJAE is length 6. 2026 mod 6 = 4, so the 4th character is J." },
  { id: "math-4", categoryId: "math", points: 50, type: "image", q: "이미지 속 도형/수식 문제를 풀어라.", a: "호스트 준비 답안", image: "/images/placeholder-math.jpg", hostNote: "이미지 기반 수학 문제 placeholder." },
  { id: "math-5", categoryId: "math", points: 450, type: "image", q: "이미지를 보고 숨겨진 규칙의 다음 값을 맞혀라.", a: "호스트 준비 답안", image: "/images/placeholder-math.jpg", hostNote: "고난도 이미지 수학 placeholder." },

  { id: "science-1", categoryId: "science", points: 150, type: "image", q: "이미지의 알코올 구조/사진을 보고 이름을 맞혀라.", a: "호스트 준비 답안", image: "/images/placeholder-alcohol.jpg" },
  { id: "science-2", categoryId: "science", points: 300, type: "image", q: "이미지의 방정식/공식을 보고 이름을 맞혀라.", a: "호스트 준비 답안", image: "/images/placeholder-equation.jpg" },
  { id: "science-3", categoryId: "science", points: 50, type: "normal", q: "지구가 1년에 외부 관찰자 기준으로 몇 바퀴 회전하는가?", a: "약 366.25바퀴", explanation: "태양 기준 하루와 별 기준 하루가 달라 1년 동안 태양일보다 항성일이 약 하루 더 많다." },
  { id: "science-4", categoryId: "science", points: 400, type: "normal", q: "무게와 질량의 차이를 설명하라.", a: "질량은 물체의 고유한 물질량, 무게는 중력에 의해 받는 힘이다.", partialCredit: true },
  { id: "science-5", categoryId: "science", points: 200, type: "normal", q: "물은 왜 하필 100도에서 끓을까?", a: "표준 대기압에서 물은 100°C에 끓고, 끓는점은 압력에 따라 달라진다. 섭씨 온도 눈금도 역사적으로 물의 어는점과 끓는점을 기준으로 정의되었다.", partialCredit: true },

  { id: "movie-1", categoryId: "movie", points: 100, type: "emoji", q: "🧊🚢💔 이 영화는?", a: "타이타닉" },
  { id: "movie-2", categoryId: "movie", points: 350, type: "emoji", q: "🧑‍🚀🌽⏳📚 이 영화는?", a: "인터스텔라" },
  { id: "movie-3", categoryId: "movie", points: 200, type: "image", q: "장면 이미지를 보고 영화 제목을 맞혀라.", a: "호스트 준비 답안", image: "/images/placeholder-movie.jpg" },
  { id: "movie-4", categoryId: "movie", points: 450, type: "image", q: "다른 장면 이미지를 보고 영화 제목을 맞혀라.", a: "호스트 준비 답안", image: "/images/placeholder-movie.jpg" },
  { id: "movie-5", categoryId: "movie", points: 50, type: "normal", q: "현재 개봉 예정 영화의 개봉일에 가장 가까운 날짜를 맞혀라.", a: "호스트 확인 필요", hostNote: "최신 개봉일 확인 필요." },

  { id: "biology-1", categoryId: "biology", points: 150, type: "image", q: "동물 사진을 보고 이름을 맞혀라.", a: "호스트 준비 답안", image: "/images/placeholder-biology.jpg" },
  { id: "biology-2", categoryId: "biology", points: 300, type: "image", q: "현미경 이미지를 보고 무엇인지 맞혀라.", a: "호스트 준비 답안", image: "/images/placeholder-biology.jpg" },
  { id: "biology-3", categoryId: "biology", points: 50, type: "image", q: "해골 이미지를 보고 동물을 맞혀라.", a: "호스트 준비 답안", image: "/images/placeholder-skull.jpg" },
  { id: "biology-4", categoryId: "biology", points: 400, type: "image", q: "기관/세포/생물학 구조 이미지를 보고 이름을 맞혀라.", a: "호스트 준비 답안", image: "/images/placeholder-biology.jpg" },
  { id: "biology-5", categoryId: "biology", points: 250, type: "image", q: "어려운 해골/화석/확대 이미지를 보고 정체를 맞혀라.", a: "호스트 준비 답안", image: "/images/placeholder-skull.jpg" },

  { id: "life-1", categoryId: "life", points: 200, type: "image", q: "이미지 속 빈칸에 들어갈 말을 맞혀라.", a: "호스트 준비 답안", image: "/images/placeholder-biology.jpg", partialCredit: true },
  { id: "life-2", categoryId: "life", points: 50, type: "image", q: "사진을 보고 스포츠 종목을 맞혀라.", a: "호스트 준비 답안", image: "/images/placeholder-sport.jpg" },
  { id: "life-3", categoryId: "life", points: 350, type: "image", q: "서명을 보고 인물을 맞혀라.", a: "호스트 준비 답안", image: "/images/placeholder-signature.jpg" },
  { id: "life-4", categoryId: "life", points: 100, type: "normal", q: "테니스에서 0점을 뜻하는 단어는?", a: "love" },
  { id: "life-5", categoryId: "life", points: 450, type: "image", q: "MT/생활 물건 이미지를 보고 정체를 맞혀라.", a: "호스트 준비 답안", image: "/images/placeholder-culture.jpg" },

  { id: "history-1", categoryId: "history", points: 150, type: "image", q: "유명 역사 사진을 보고 사건/장면을 맞혀라.", a: "호스트 준비 답안", image: "/images/placeholder-history.jpg" },
  { id: "history-2", categoryId: "history", points: 300, type: "image", q: "인물 사진을 보고 누구인지 맞혀라.", a: "호스트 준비 답안", image: "/images/placeholder-history.jpg" },
  { id: "history-3", categoryId: "history", points: 50, type: "image", q: "유물/건축물 사진을 보고 이름을 맞혀라.", a: "호스트 준비 답안", image: "/images/placeholder-history.jpg" },
  { id: "history-4", categoryId: "history", points: 400, type: "image", q: "역사적 사건 사진을 보고 사건명을 맞혀라.", a: "호스트 준비 답안", image: "/images/placeholder-history.jpg" },
  { id: "history-5", categoryId: "history", points: 250, type: "image", q: "어려운 History in Frame 사진의 정체를 맞혀라.", a: "호스트 준비 답안", image: "/images/placeholder-history.jpg" },

  { id: "literature-1", categoryId: "literature", points: 100, type: "image", q: "표지/장면 이미지를 보고 책 제목을 맞혀라.", a: "호스트 준비 답안", image: "/images/placeholder-literature.jpg" },
  { id: "literature-2", categoryId: "literature", points: 300, type: "image", q: "내용 이미지를 보고 책 제목을 맞혀라.", a: "호스트 준비 답안", image: "/images/placeholder-literature.jpg" },
  { id: "literature-3", categoryId: "literature", points: 50, type: "normal", q: "인용문 또는 키워드를 보고 책 제목을 맞혀라.", a: "호스트 준비 답안", partialCredit: true },
  { id: "literature-4", categoryId: "literature", points: 400, type: "normal", q: "등장인물 관계를 보고 책 제목을 맞혀라.", a: "호스트 준비 답안" },
  { id: "literature-5", categoryId: "literature", points: 200, type: "normal", q: "이상한 줄거리 요약을 보고 책 제목을 맞혀라.", a: "호스트 준비 답안" },

  { id: "geography-1", categoryId: "geography", points: 50, type: "location", q: "현재 MT 장소의 정확한 위치/주소를 맞혀라.", a: "호스트 준비 답안", hostNote: "현장 주소로 수정하세요." },
  { id: "geography-2", categoryId: "geography", points: 250, type: "multiple-choice", q: "다음 중 영국을 제외하고 영어가 공식 언어인 유럽 국가는?", a: "아일랜드 또는 몰타", options: ["프랑스", "아일랜드", "독일", "스웨덴"], explanation: "선택지 기준 정답은 아일랜드. 몰타도 영어가 공식 언어이므로 선택지 구성으로 모호함을 제거했다." },
  { id: "geography-3", categoryId: "geography", points: 150, type: "image", q: "국기를 보고 나라를 맞혀라.", a: "호스트 준비 답안", image: "/images/placeholder-flag.jpg" },
  { id: "geography-4", categoryId: "geography", points: 350, type: "image", q: "국가 모양/국경 이미지를 보고 나라를 맞혀라.", a: "호스트 준비 답안", image: "/images/placeholder-country-shape.jpg" },
  { id: "geography-5", categoryId: "geography", points: 100, type: "normal", q: "지구에서 가장 큰 사막은?", a: "Antarctica" },

  { id: "entertainment-1", categoryId: "entertainment", points: 50, type: "normal", q: "완규형 관련 개인/친구 기반 문제.", a: "호스트 준비 답안", hostNote: "멤버들이 아는 내부 질문으로 수정하세요." },
  { id: "entertainment-2", categoryId: "entertainment", points: 300, type: "image", q: "합성된 얼굴을 보고 누구와 누구인지 맞혀라.", a: "호스트 준비 답안", image: "/images/placeholder-face-merge.jpg" },
  { id: "entertainment-3", categoryId: "entertainment", points: 150, type: "image", q: "아기 사진을 보고 인물을 맞혀라.", a: "호스트 준비 답안", image: "/images/placeholder-baby.jpg" },
  { id: "entertainment-4", categoryId: "entertainment", points: 400, type: "normal", q: "현재 뉴스/팝컬처 질문.", a: "호스트 확인 필요", hostNote: "최신 정보 확인 필요." },
  { id: "entertainment-5", categoryId: "entertainment", points: 200, type: "mission", q: "공연/미션 성공 시 점수를 획득한다.", a: "호스트 판정", event: "performance_bonus", bonusPoints: 300 },

  { id: "culture-1", categoryId: "culture", points: 150, type: "normal", q: "일본의 전통 나막신 게타는 왜 높은 굽 형태로 만들어졌을까?", a: "흙탕물, 비, 눈, 진흙 등에서 옷과 발을 보호하고 통풍을 돕기 위해서.", partialCredit: true },
  { id: "culture-2", categoryId: "culture", points: 50, type: "normal", q: "카자흐스탄 국기에 있는 동물은?", a: "eagle" },
  { id: "culture-3", categoryId: "culture", points: 100, type: "normal", q: "미국의 국조는?", a: "bald eagle" },
  { id: "culture-4", categoryId: "culture", points: 250, type: "normal", q: "애국가 4절 빈칸: 가을 하늘 공활한데 / 높고 구름 없이 / 밝은 달은 우리 가슴 / ____ 일세 일편단심", a: "밝힌" },
  { id: "culture-5", categoryId: "culture", points: 450, type: "image", q: "러시아 문화 관련 이미지/상식 문제.", a: "호스트 확인 필요", image: "/images/placeholder-culture.jpg", hostNote: "현재 정보 또는 표현 적절성 확인 필요." }
];

export const finalQuestion: Question = {
  id: "final-1",
  categoryId: "final",
  points: 0,
  type: "final",
  q: "최종 문제 placeholder: 호스트가 MT 현장에 맞는 베팅 문제로 교체하세요.",
  a: "호스트 준비 답안",
  hostNote: "각 팀 베팅 입력 후 공개하세요."
};

export function getQuestion(id?: string) {
  if (!id) return undefined;
  return id === finalQuestion.id ? finalQuestion : questions.find((question) => question.id === id);
}

export function getCategoryName(categoryId?: string) {
  if (categoryId === "final") return "Final Question";
  return categories.find((category) => category.id === categoryId)?.name ?? "";
}
