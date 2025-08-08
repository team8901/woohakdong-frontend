/**
 * Prettier Configuration
 * @see https://prettier.io/docs/options
 */
module.exports = {
  /**
   * 한 줄 최대 길이 80자로 제한 (자동 줄바꿈 기준)
   * @see https://prettier.io/docs/options#print-width
   */
  printWidth: 80,

  /**
   * 들여쓰기 간격을 스페이스 2칸으로 설정
   * @see https://prettier.io/docs/options#tab-width
   */
  tabWidth: 2,

  /**
   * 탭 대신 스페이스로 들여쓰기
   * @see https://prettier.io/docs/options#tabs
   */
  useTabs: false,

  /**
   * 문장 끝에 세미콜론(;)을 항상 추가
   * @see https://prettier.io/docs/options#semicolons
   */
  semi: true,

  /**
   * 문자열을 작은따옴표(')로 표시
   * @see https://prettier.io/docs/options#quotes
   */
  singleQuote: true,

  /**
   * 가능한 곳에는 항상 마지막에 쉼표 추가
   * @see https://prettier.io/docs/options#trailing-commas
   */
  trailingComma: 'all',

  /**
   * 객체 리터럴의 중괄호 안에 공백 추가 → { foo: bar }
   * @see https://prettier.io/docs/options#bracket-spacing
   */
  bracketSpacing: true,

  /**
   * JSX/HTML에서 마지막 >를 마지막 속성과 같은 줄에 배치
   * @see https://prettier.io/docs/options#bracket-line
   */
  bracketSameLine: true,

  /**
   * 화살표 함수 매개변수가 하나여도 괄호 항상 표시 → (x) => x
   * @see https://prettier.io/docs/options#arrow-function-parentheses
   */
  arrowParens: 'always',

  /**
   * 파일 상단에 특정 주석(pragma)이 없어도 포맷팅 수행
   * @see https://prettier.io/docs/options#require-pragma
   */
  requirePragma: false,

  /**
   * 마크다운 등에서 원문 줄바꿈을 유지
   * @see https://prettier.io/docs/options#prose-wrap
   */
  proseWrap: 'preserve',

  /**
   * HTML에서 공백 감도 무시 (레이아웃 영향 최소화)
   * @see https://prettier.io/docs/options#html-whitespace-sensitivity
   */
  htmlWhitespaceSensitivity: 'ignore',

  /**
   * OS에 맞는 줄바꿈 자동 선택 (LF/CRLF)
   * @see https://prettier.io/docs/options#end-of-line
   */
  endOfLine: 'auto',

  /**
   * Tailwind CSS 클래스 자동 정렬 플러그인
   * @see https://github.com/tailwindlabs/prettier-plugin-tailwindcss
   */
  plugins: [
    'prettier-plugin-tailwindcss',
  ],
}
