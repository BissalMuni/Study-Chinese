import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Layers } from 'lucide-react';
import { DataCategory } from '../../contexts/GlobalStateContext';
import { useAdTrigger } from '../../contexts/AdContext';

interface CategorySelectorProps {
  onSelectCategory: (category: DataCategory) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ onSelectCategory }) => {
  const { triggerAd } = useAdTrigger();

  const handleSelectCategory = (category: DataCategory) => {
    triggerAd('CATEGORY_SELECT');
    onSelectCategory(category);
  };

  return (
    <div className="p-4 flex flex-col items-center justify-center min-h-[60vh]">
      <motion.h1
        className="text-2xl font-bold text-gray-800 dark:text-white mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        학습 모드 선택
      </motion.h1>

      <div className="w-full max-w-sm space-y-4">
        <motion.button
          onClick={() => handleSelectCategory('currently')}
          className="w-full p-6 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl text-white shadow-xl shadow-cyan-500/30"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.03, y: -3 }}
          whileTap={{ scale: 0.97 }}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Calendar size={28} />
            </div>
            <div className="text-left">
              <div className="text-xl font-bold">Currently</div>
              <div className="text-sm text-white/80">월별 학습 자료</div>
            </div>
          </div>
        </motion.button>

        <motion.button
          onClick={() => handleSelectCategory('integrated')}
          className="w-full p-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white shadow-xl shadow-purple-500/30"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.03, y: -3 }}
          whileTap={{ scale: 0.97 }}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Layers size={28} />
            </div>
            <div className="text-left">
              <div className="text-xl font-bold">Integrated</div>
              <div className="text-sm text-white/80">체계적인 단계별 학습</div>
            </div>
          </div>
        </motion.button>
      </div>
    </div>
  );
};

export default CategorySelector;
