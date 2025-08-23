/**
 * 从一个字符串中提取被 ```md` 或 ```markdown` 包裹的内容。
 * 这个函数假设整个字符串都是一个代码块。
 * 如果匹配成功，它将返回代码块内部的内容。
 * 如果不匹配，它将原封不动地返回原始字符串。
 *
 * @param content AI返回的可能包含Markdown代码块的字符串。
 * @returns 提取出的纯Markdown内容或原始字符串。
 */
export function extractMarkdownContent(content: string): string {
  // 正则表达式解释:
  // ^\s* - 匹配字符串的开头，并允许任意数量的前导空白字符
  // ```           - 匹配代码块的起始反引号
  // (?:md|markdown) - 匹配 "md" 或 "markdown"，(?:...) 是一个非捕获组
  // \s* - 允许语言标识符后有任意空白
  // \n?           - 匹配一个可选的换行符
  // (.*?)         - **核心部分**: 捕获代码块内的所有内容。
  //               - . 匹配除换行符外的任何字符
  //               - *? 表示非贪婪匹配，匹配尽可能少的字符
  //               - (...) 创建一个捕获组，这是我们想要提取的内容
  // \n?           - 匹配一个可选的换行符
  // ```           - 匹配代码块的结束反引号
  // \s*$          - 匹配字符串的结尾，并允许任意数量的尾随空白字符
  // s             - "dotAll" 模式，允许 . 匹配换行符，这对于多行内容至关重要
  const regex = /^\s*```(?:md|markdown)\s*\n?(.*?)\n?\s*```\s*$/s;

  const match = content.match(regex);

  // 如果匹配成功，match会是一个数组
  // match[0] 是整个匹配到的字符串 (例如 "```md\n# Hello\n```")
  // match[1] 是我们用 (.*?) 捕获的第一个组的内容 (例如 "# Hello")
  if (match && typeof match[1] === 'string') {
    return match[1];
  }

  // 如果没有匹配，说明AI的输出是正常的，直接返回原始内容
  return content;
}