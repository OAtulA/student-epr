import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

// Markdown Response Component
export const MarkdownResponse = ({ content }: { content: string }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    rehypePlugins={[rehypeSanitize]}
    components={{
      h1: ({ ...props }) => (
        <h1
          className="text-lg font-bold text-purple-900 mt-4 mb-2"
          {...props}
        />
      ),
      h2: ({ ...props }) => (
        <h2
          className="text-base font-semibold text-purple-800 mt-3 mb-2"
          {...props}
        />
      ),
      h3: ({ ...props }) => (
        <h3
          className="text-sm font-semibold text-purple-700 mt-2 mb-1"
          {...props}
        />
      ),
      ul: ({ ...props }) => (
        <ul className="list-disc list-inside ml-2 space-y-1 my-2" {...props} />
      ),
      ol: ({ ...props }) => (
        <ol
          className="list-decimal list-inside ml-2 space-y-1 my-2"
          {...props}
        />
      ),
      li: ({ ...props }) => <li className="text-purple-900 ml-2" {...props} />,
      p: ({ ...props }) => (
        <p className="text-purple-900 leading-relaxed my-2" {...props} />
      ),
      blockquote: ({ ...props }) => (
        <blockquote
          className="border-l-4 border-purple-400 pl-3 italic text-purple-800 my-2 bg-purple-100 bg-opacity-40 py-2"
          {...props}
        />
      ),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      code: (props: any) => {
        const { inline, children, ...restProps } = props;
        return (
          <code
            className={
              inline
                ? "bg-purple-100 text-purple-900 px-1.5 py-0.5 rounded font-mono text-xs"
                : "bg-purple-950 text-purple-50 p-3 rounded-lg block overflow-x-auto font-mono text-xs my-2"
            }
            {...restProps}
          >
            {children}
          </code>
        );
      },
      a: ({ ...props }) => (
        <a
          className="text-purple-600 hover:text-purple-700 underline"
          {...props}
        />
      ),
      strong: ({ ...props }) => (
        <strong className="font-semibold text-purple-900" {...props} />
      ),
      em: ({ ...props }) => (
        <em className="italic text-purple-800" {...props} />
      ),
      table: ({ ...props }) => (
        <table
          className="border-collapse border border-purple-300 my-2"
          {...props}
        />
      ),
      th: ({ ...props }) => (
        <th
          className="border border-purple-300 px-3 py-2 bg-purple-200 text-purple-900 font-semibold"
          {...props}
        />
      ),
      td: ({ ...props }) => (
        <td
          className="border border-purple-300 px-3 py-2 text-purple-800"
          {...props}
        />
      ),
    }}
  >
    {content}
  </ReactMarkdown>
);
