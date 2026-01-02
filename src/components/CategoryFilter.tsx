import { FriendCategory } from '../types';
import { CATEGORY_INFO } from '../constants';
import { useLanguage } from '@/i18n/LanguageContext';

interface CategoryFilterProps {
  selectedCategory: FriendCategory | 'all';
  onSelectCategory: (category: FriendCategory | 'all') => void;
}

export const CategoryFilter = ({ selectedCategory, onSelectCategory }: CategoryFilterProps) => {
  const { t } = useLanguage();
  const categories = Object.entries(CATEGORY_INFO) as [FriendCategory, typeof CATEGORY_INFO[FriendCategory]][];

  const getCategoryLabel = (category: FriendCategory) => t(`category.${category}`);

  return (
    <div className="flex gap-4 overflow-x-auto -mx-4 px-4">
      <button
        onClick={() => onSelectCategory('all')}
        className={`shrink-0 text-sm font-medium transition-colors ${
          selectedCategory === 'all'
            ? 'text-primary'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        {t('friends.all')}
      </button>

      {categories.map(([key, info]) => (
        <button
          key={key}
          onClick={() => onSelectCategory(key)}
          className={`shrink-0 text-sm font-medium transition-colors ${
            selectedCategory === key
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {getCategoryLabel(key).split(' ')[0]}
        </button>
      ))}
    </div>
  );
};
