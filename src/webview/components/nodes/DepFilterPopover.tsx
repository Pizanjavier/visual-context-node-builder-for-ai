import { memo, useCallback } from 'react';
import type { DependencyCategory } from '../../../shared/types/dependency-categories';
import { CATEGORY_LABELS } from '../../../shared/types/dependency-categories';
import { useDepFilterStore } from '../../store/dep-filter-store';
import {
  popoverStyle,
  popoverTitleStyle,
  popoverRowStyle,
  popoverCheckboxStyle,
  expandBtnStyle,
} from './dep-filter-popover-styles';

const CATEGORIES: DependencyCategory[] = ['source', 'styles', 'data'];

type Props = {
  onExpand: () => void;
};

/** Popover with category checkboxes shown before expanding dependencies. */
// Implemented by: react-canvas agent
export const DepFilterPopover = memo(function DepFilterPopover({
  onExpand,
}: Props): React.ReactElement {
  const filter = useDepFilterStore((s) => s.filter);
  const toggleCategory = useDepFilterStore((s) => s.toggleCategory);

  const handleToggle = useCallback(
    (category: DependencyCategory) => {
      toggleCategory(category);
    },
    [toggleCategory],
  );

  return (
    <div style={popoverStyle} onClick={(e) => e.stopPropagation()}>
      <div style={popoverTitleStyle}>Filter Categories</div>
      {CATEGORIES.map((cat) => (
        <label key={cat} style={popoverRowStyle}>
          <input
            type="checkbox"
            checked={filter[cat]}
            onChange={() => handleToggle(cat)}
            style={popoverCheckboxStyle}
          />
          <span>{CATEGORY_LABELS[cat]}</span>
        </label>
      ))}
      <button type="button" onClick={onExpand} style={expandBtnStyle}>
        Expand
      </button>
    </div>
  );
});
