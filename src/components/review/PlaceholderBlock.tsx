/**
 * PlaceholderBlock — standalone amber callout for a single unfilled BCBA placeholder.
 * Used in document preview mode when listing detected placeholders from draftContent.
 *
 * The inline version (rendered inside contenteditable) uses the `.placeholder-block`
 * CSS class injected via parseContentForEditor() in InlineEditor.
 */

interface PlaceholderBlockProps {
  description: string;
  onClick?: () => void;
}

export const PlaceholderBlock = ({ description, onClick }: PlaceholderBlockProps) => (
  <span
    role="button"
    tabIndex={0}
    onClick={onClick}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') onClick?.();
    }}
    style={{
      display: 'inline',
      background: '#FEF3C7',
      color: '#92400E',
      fontStyle: 'italic',
      fontFamily: "'Instrument Sans', system-ui, sans-serif",
      fontSize: 13,
      padding: '2px 6px',
      borderRadius: 4,
      outline: '1px dashed rgba(146,64,14,0.4)',
      cursor: 'text',
    }}
  >
    [BCBA to complete: {description}]
  </span>
);

export default PlaceholderBlock;
