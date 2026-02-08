"use client"

import React from 'react';
import { cn, capitalizeFirstLetter } from '@/lib/utils';
import type { WordState } from '@/data/types';

interface WordChipProps {
    text: string;
    index: number;
    state: WordState;
    onClick: () => void;
    disabled: boolean;
}

export const WordChip: React.FC<WordChipProps> = ({
    text,
    state,
    onClick,
    disabled,
}) => {
    const displayText = (state === 'selected' || state === 'correct')
        ? capitalizeFirstLetter(text)
        : text;

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "relative px-4 py-2.5 rounded-lg text-lg font-medium transition-all duration-150 select-none",
                "border active:scale-[0.97] touch-manipulation",
                state === 'default' && "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20",
                state === 'selected' && "bg-blue-600 border-blue-600 text-white shadow-md",
                state === 'correct' && "bg-emerald-500 border-emerald-500 text-white shadow-sm",
                state === 'incorrect' && "bg-rose-500 border-rose-500 text-white",
                state === 'missed' && "bg-amber-50 dark:bg-amber-900/20 border-amber-400 dark:border-amber-600 text-amber-900 dark:text-amber-200 border-dashed",
                disabled && "cursor-default active:scale-100"
            )}
        >
            {displayText}
        </button>
    );
};
