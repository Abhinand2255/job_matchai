import React from 'react';
import { X } from 'lucide-react';

const CATEGORY_COLORS = {
  FRONTEND: 'bg-blue-50 text-blue-700 border-blue-200',
  BACKEND: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  DATABASE: 'bg-amber-50 text-amber-700 border-amber-200',
  CLOUD_DEVOPS: 'bg-purple-50 text-purple-700 border-purple-200',
  AI_ML: 'bg-rose-50 text-rose-700 border-rose-200',
  MOBILE: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  TESTING: 'bg-teal-50 text-teal-700 border-teal-200',
  OTHER: 'bg-slate-100 text-slate-700 border-slate-200',
};

const SkillBadge = ({ name, category = 'OTHER', proficiency, onRemove }) => {
  const colorClass = CATEGORY_COLORS[category] || CATEGORY_COLORS.OTHER;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${colorClass} transition shadow-xs`}
    >
      <span>{name}</span>
      {proficiency && (
        <span className="opacity-70 text-[10px] font-normal uppercase tracking-wider">
          ({proficiency.slice(0, 3)})
        </span>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="hover:opacity-75 focus:outline-none p-0.5 rounded-full"
          title={`Remove ${name}`}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </span>
  );
};

export default SkillBadge;
