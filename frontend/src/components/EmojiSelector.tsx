"use client";

import { motion } from "framer-motion";

const EMOJIS = ["🍻", "🥂", "🍾", "🍷", "🍹", "🎯", "😂", "👉", "🏹", "💃🏻", "🕺🏽"];

export function EmojiSelector({ onSelect, disabled }: { onSelect: (emoji: string) => void, disabled?: boolean }) {
  return (
    <div className="flex flex-wrap gap-1 mt-2 mb-1">
      {EMOJIS.map((emoji, index) => (
        <motion.button
          key={index}
          whileHover={{ scale: 1.2, y: -2 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onSelect(emoji)}
          disabled={disabled}
          className="text-xl p-1.5 hover:bg-white/10 rounded-lg transition-colors duration-200"
          type="button"
          title="Add emoji"
        >
          {emoji}
        </motion.button>
      ))}
    </div>
  );
}
