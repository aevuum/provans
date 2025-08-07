'use client';

import { useState } from 'react';

interface Category {
  id: number;
  name: string;
  slug: string;
  subcategories?: Subcategory[];
}

interface Subcategory {
  id: number;
  name: string;
  slug: string;
  categoryId: number;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategories: string[];
  selectedSubcategories: string[];
  onCategoryChange: (categories: string[]) => void;
  onSubcategoryChange: (subcategories: string[]) => void;
}

export default function CategoryFilter({
  categories,
  selectedCategories,
  selectedSubcategories,
  onCategoryChange,
  onSubcategoryChange,
}: CategoryFilterProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleCategory = (slug: string) => {
    setExpandedCategories(prev =>
      prev.includes(slug)
        ? prev.filter(s => s !== slug)
        : [...prev, slug]
    );
  };

  const handleCategorySelect = (slug: string, checked: boolean) => {
    if (checked) {
      onCategoryChange([...selectedCategories, slug]);
    } else {
      onCategoryChange(selectedCategories.filter(s => s !== slug));
      // Также убираем все подкатегории этой категории
      const category = categories.find(c => c.slug === slug);
      if (category && category.subcategories) {
        const subcategorySlugs = category.subcategories.map(sc => sc.slug);
        onSubcategoryChange(
          selectedSubcategories.filter(s => !subcategorySlugs.includes(s))
        );
      }
    }
  };

  const handleSubcategorySelect = (slug: string, checked: boolean) => {
    if (checked) {
      onSubcategoryChange([...selectedSubcategories, slug]);
    } else {
      onSubcategoryChange(selectedSubcategories.filter(s => s !== slug));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Категории</h3>
      
      <div className="space-y-2">
        {categories.map((category) => (
          <div key={category.slug} className="border-b border-gray-100 pb-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.slug)}
                  onChange={(e) => handleCategorySelect(category.slug, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium">{category.name}</span>
              </label>
              
              {category.subcategories && category.subcategories.length > 0 && (
                <button
                  onClick={() => toggleCategory(category.slug)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  {expandedCategories.includes(category.slug) ? (
                    <span className="text-gray-500">▲</span>
                  ) : (
                    <span className="text-gray-500">▼</span>
                  )}
                </button>
              )}
            </div>
            
            {expandedCategories.includes(category.slug) && category.subcategories && category.subcategories.length > 0 && (
              <div className="ml-6 mt-2 space-y-1">
                {category.subcategories.map((subcategory) => (
                  <label
                    key={subcategory.slug}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSubcategories.includes(subcategory.slug)}
                      onChange={(e) => handleSubcategorySelect(subcategory.slug, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">{subcategory.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
