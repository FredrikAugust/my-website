import { codeToHtml } from 'shiki'

export async function CodeBlock({ code, language }: { code: string; language?: string }) {
  const html = await codeToHtml(code, {
    lang: language || 'text',
    theme: 'github-light',
  })

  return (
    <div
      className="rounded text-sm overflow-x-auto [&_pre]:p-4 [&_pre]:rounded"
      // biome-ignore lint: shiki generates safe HTML
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
