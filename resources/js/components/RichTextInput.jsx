import { useRef, useEffect } from 'react';

// Minimal CSS that cannot be expressed via inline styles:
//   - :empty:before for placeholder text
//   - :focus outline suppression
//   - toolbar button active state via execCommand query
const STYLE = `
.rt-wrap { display: flex; flex-direction: column; width: 100%; }
.rt-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  padding: 0.3rem 0.4rem;
  background: #e8f8fb;
  border: 1px solid #ccc;
  border-bottom: none;
  border-radius: 0.13rem 0.13rem 0 0;
}
.rt-btn {
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 0.13rem;
  padding: 0.15rem 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  line-height: 1.4;
  transition: background 0.15s;
  min-width: 1.8rem;
  text-align: center;
}
.rt-btn:hover { background: #CBF1F6; }
.rt-editor {
  outline: none;
  border: 1px solid #ccc;
  border-radius: 0 0 0.13rem 0.13rem;
  padding: 0.45rem 0.55rem;
  background: #fff;
  font-size: 1rem;
  line-height: 1.6;
  width: 100%;
  box-sizing: border-box;
  overflow-y: auto;
}
.rt-editor:empty:before {
  content: attr(data-placeholder);
  color: #aaa;
  pointer-events: none;
  display: block;
}
`;

let styleInjected = false;
function injectStyle() {
    if (styleInjected || typeof document === 'undefined') return;
    const el = document.createElement('style');
    el.textContent = STYLE;
    document.head.appendChild(el);
    styleInjected = true;
}

const FORMATS = [
    { cmd: 'bold',          label: <strong>B</strong>,    title: 'Bold' },
    { cmd: 'italic',        label: <em>I</em>,             title: 'Italic' },
    { cmd: 'underline',     label: <u>U</u>,               title: 'Underline' },
    { cmd: 'strikeThrough', label: <s>S</s>,               title: 'Strikethrough' },
];

/**
 * RichTextInput
 *
 * A contenteditable-based rich text editor with a minimal formatting toolbar.
 * Produces HTML output (bold, italic, underline, strikethrough only).
 * Syncs to the parent via onChange(htmlString).
 *
 * Props:
 *   value       {string}   — controlled HTML value
 *   onChange    {function} — called with new HTML string on every keystroke
 *   placeholder {string}   — shown when editor is empty
 *   minRows     {number}   — minimum visible rows (default: 3)
 */
export default function RichTextInput({
    value       = '',
    onChange,
    placeholder = 'Write something...',
    minRows     = 3,
}) {
    injectStyle();

    const editorRef = useRef(null);

    // Sync external value changes (e.g., form.reset() → value becomes '')
    // without disturbing the cursor position during normal typing.
    useEffect(() => {
        const el = editorRef.current;
        if (!el) return;
        if (el.innerHTML !== value) {
            el.innerHTML = value;
        }
    }, [value]);

    function handleInput() {
        onChange?.(editorRef.current?.innerHTML ?? '');
    }

    function applyFormat(cmd) {
        editorRef.current?.focus();
        // execCommand is the pragmatic choice for inline rich text without
        // external dependencies. Deprecated in spec but universally supported.
        document.execCommand(cmd, false, null);
        handleInput();
    }

    return (
        <div className="rt-wrap">
            <div className="rt-toolbar" role="toolbar" aria-label="Text formatting">
                {FORMATS.map(({ cmd, label, title }) => (
                    <button
                        key={cmd}
                        type="button"
                        className="rt-btn"
                        title={title}
                        onMouseDown={(e) => {
                            // Prevent the editor from losing focus on toolbar click.
                            e.preventDefault();
                            applyFormat(cmd);
                        }}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <div
                ref={editorRef}
                className="rt-editor"
                contentEditable
                suppressContentEditableWarning
                onInput={handleInput}
                data-placeholder={placeholder}
                style={{ minHeight: `${minRows * 1.6}rem` }}
                role="textbox"
                aria-multiline="true"
                aria-label={placeholder}
            />
        </div>
    );
}
