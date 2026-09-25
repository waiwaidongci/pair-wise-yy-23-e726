export const DOT_COUNT = 6;

// 渲染顺序：网格按行填充时依次是 1、4、2、5、3、6 号点（左列 1-3，右列 4-6）
export const DOT_RENDER_ORDER = [0, 3, 1, 4, 2, 5] as const;

// cell_pattern 是 6 位 0/1 字符串，依次对应盲文 1-6 号点
export function parsePattern(pattern: string): boolean[] {
  const dots = new Array<boolean>(DOT_COUNT).fill(false);
  for (let i = 0; i < DOT_COUNT; i += 1) {
    dots[i] = pattern?.[i] === "1";
  }
  return dots;
}

export function patternFromDots(dots: boolean[]): string {
  return dots.slice(0, DOT_COUNT).map((on) => (on ? "1" : "0")).join("");
}

// 把用户输入的点位（如 "134"、"1,3,4"、"1 3 4"）归一化成 cell_pattern
export function normalizeDotInput(input: string): string {
  const dots = new Array<boolean>(DOT_COUNT).fill(false);
  for (const ch of input.replace(/[^1-6]/g, "")) {
    dots[Number(ch) - 1] = true;
  }
  return patternFromDots(dots);
}

export function dotsToLabel(pattern: string): string {
  const labels: string[] = [];
  parsePattern(pattern).forEach((on, i) => {
    if (on) labels.push(String(i + 1));
  });
  return labels.join("") || "空";
}
