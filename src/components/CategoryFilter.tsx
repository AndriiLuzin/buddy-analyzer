import { FriendCategory } from '../types';
import { CATEGORY_INFO } from '../constants';

interface CategoryFilterProps {
  selectedCategory: FriendCategory | 'all';
  onSelectCategory: (category: FriendCategory | 'all') => void;
}

export const CategoryFilter = ({ selectedCategory, onSelectCategory }: CategoryFilterProps) => {
  const categories = Object.entries(CATEGORY_INFO) as [FriendCategory, typeof CATEGORY_INFO[FriendCategory]][];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
      <button
        onClick={() => onSelectCategory('all')}
        className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
          selectedCategory === 'all'
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
        }`}
      >
        Все
      </button>

      {categories.map(([key, info]) => (
        <button
          key={key}
          onClick={() => onSelectCategory(key)}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
            selectedCategory === key
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          <span>{info.emoji}</span>
          <span>{info.label.split(' ')[0]}</span>
        </button>
      ))}
    </div>
  );
};
