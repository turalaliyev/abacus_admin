import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import { Button, Space, Tooltip } from 'antd'
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  LinkOutlined,
} from '@ant-design/icons'

/** Convert plain text to simple HTML so existing content still loads. */
export function toEditorHtml(value: string | undefined): string {
  const v = value?.trim() ?? ''
  if (!v) return ''
  if (/<[a-z][\s\S]*>/i.test(v)) return v
  return `<p>${v.replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br>')}</p>`
}

function normalizeEditorHtml(html: string): string {
  const trimmed = html.trim()
  if (!trimmed || trimmed === '<p></p>') return ''
  return trimmed
}

export function RichTextEditor({
  value,
  onChange,
}: {
  value?: string
  onChange?: (html: string) => void
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-blue-600 underline' },
      }),
    ],
    content: toEditorHtml(value),
    onUpdate: ({ editor: ed }) => {
      onChange?.(ed.isEmpty ? '' : ed.getHTML())
    },
    editorProps: {
      attributes: {
        class:
          'min-h-[160px] max-h-[320px] overflow-y-auto px-3 py-2 text-sm outline-none prose prose-sm max-w-none',
      },
    },
  })

  useEffect(() => {
    if (!editor) return
    const next = normalizeEditorHtml(toEditorHtml(value))
    const current = normalizeEditorHtml(editor.isEmpty ? '' : editor.getHTML())
    if (next === current) return
    editor.commands.setContent(next || '<p></p>', { emitUpdate: false })
  }, [editor, value])

  if (!editor) return null

  const setLink = () => {
    const prev = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('URL', prev ?? 'https://')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 px-2 py-1.5">
        <Space size={4} wrap>
          <Tooltip title="Bold">
            <Button
              type={editor.isActive('bold') ? 'primary' : 'text'}
              size="small"
              icon={<BoldOutlined />}
              onClick={() => editor.chain().focus().toggleBold().run()}
            />
          </Tooltip>
          <Tooltip title="Italic">
            <Button
              type={editor.isActive('italic') ? 'primary' : 'text'}
              size="small"
              icon={<ItalicOutlined />}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            />
          </Tooltip>
          <Tooltip title="Underline">
            <Button
              type={editor.isActive('underline') ? 'primary' : 'text'}
              size="small"
              icon={<UnderlineOutlined />}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            />
          </Tooltip>
          <Tooltip title="Heading">
            <Button
              type={editor.isActive('heading', { level: 2 }) ? 'primary' : 'text'}
              size="small"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
              H2
            </Button>
          </Tooltip>
          <Tooltip title="Bullet list">
            <Button
              type={editor.isActive('bulletList') ? 'primary' : 'text'}
              size="small"
              icon={<UnorderedListOutlined />}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            />
          </Tooltip>
          <Tooltip title="Numbered list">
            <Button
              type={editor.isActive('orderedList') ? 'primary' : 'text'}
              size="small"
              icon={<OrderedListOutlined />}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            />
          </Tooltip>
          <Tooltip title="Link">
            <Button
              type={editor.isActive('link') ? 'primary' : 'text'}
              size="small"
              icon={<LinkOutlined />}
              onClick={setLink}
            />
          </Tooltip>
        </Space>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
