import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, GraduationCap, MessageCircle, Repeat } from 'lucide-react';
import { IntegratedType, CurrentlyType, DataCategory } from '../../contexts/GlobalStateContext';

interface TypeSelectorProps {
  dataCategory: DataCategory;
  onSelectType: (type: IntegratedType | CurrentlyType) => void;
}

interface TypeOption {
  type: IntegratedType | CurrentlyType;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  color: string;
}

const integratedTypes: TypeOption[] = [
  {
    type: '01_초급반_제1-10과',
    label: '초급반',
    sublabel: '제1-10과',
    icon: <BookOpen size={24} />,
    color: 'from-green-400 to-green-600',
  },
  {
    type: '02_중급반_제11-25과',
    label: '중급반',
    sublabel: '제11-25과',
    icon: <GraduationCap size={24} />,
    color: 'from-blue-400 to-blue-600',
  },
  {
    type: '03_고급반_제26-40과',
    label: '고급반',
    sublabel: '제26-40과',
    icon: <GraduationCap size={24} />,
    color: 'from-purple-400 to-purple-600',
  },
  {
    type: '04_실전회화_제41-50과',
    label: '실전회화',
    sublabel: '제41-50과',
    icon: <MessageCircle size={24} />,
    color: 'from-orange-400 to-orange-600',
  },
  {
    type: '05_패턴_제1-90과',
    label: '패턴회화',
    sublabel: '제1-90과',
    icon: <Repeat size={24} />,
    color: 'from-pink-400 to-pink-600',
  },
];

const currentlyTypes: TypeOption[] = [
  {
    type: '202508',
    label: '2025년 8월',
    sublabel: '현재 학습',
    icon: <Clock size={24} />,
    color: 'from-cyan-400 to-cyan-600',
  },
];

const TypeSelector: React.FC<TypeSelectorProps> = ({ dataCategory, onSelectType }) => {
  const types = dataCategory === 'integrated' ? integratedTypes : currentlyTypes;

  return (
    <div className="p-3">
      <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
        {dataCategory === 'integrated' ? '통합 코스 선택' : '현재 학습'}
      </h2>

      <div className="grid gap-4">
        {types.map((item, index) => (
          <motion.button
            key={item.type}
            onClick={() => onSelectType(item.type)}
            className={`relative overflow-hidden p-3 rounded-2xl text-white bg-gradient-to-r ${item.color} shadow-lg`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* 배경 장식 */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                {item.icon}
              </div>
              <div className="text-left">
                <div className="text-xl font-bold">{item.label}</div>
                <div className="text-sm text-white/80">{item.sublabel}</div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default TypeSelector;
