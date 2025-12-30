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
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
      <button
        onClick={() => onSelectCategory('all')}
        className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border ${
          selectedCategory === 'all'
            ? 'bg-primary text-primary-foreground border-primary'
            : 'bg-card text-foreground border-border hover:bg-muted'
        }`}
      >
        {t('friends.all')}
      </button>

      {categories.map(([key, info]) => (
        <button
          key={key}
          onClick={() => onSelectCategory(key)}
          className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5 border ${
            selectedCategory === key
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-card text-foreground border-border hover:bg-muted'
          }`}
        >
          <span>{info.emoji}</span>
          <span>{getCategoryLabel(key).split(' ')[0]}</span>
        </button>
      ))}
    </div>
  );
};
