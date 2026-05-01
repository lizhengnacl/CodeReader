import React from 'react';
import {
  FileText, FileCode2, FileJson, FileImage, FileVideo,
  FileAudio, FileArchive, File, FileType, Database,
  Terminal, BookOpen, Cog, Globe, LayoutTemplate,
} from 'lucide-react';

interface FileIconProps {
  fileName: string;
  className?: string;
}

const EXT_MAP: Record<string, { icon: React.ElementType; color: string; darkColor: string }> = {
  '.ts': { icon: FileCode2, color: 'text-blue-500', darkColor: 'dark:text-blue-400' },
  '.tsx': { icon: FileCode2, color: 'text-blue-500', darkColor: 'dark:text-blue-400' },
  '.js': { icon: FileCode2, color: 'text-yellow-500', darkColor: 'dark:text-yellow-400' },
  '.jsx': { icon: FileCode2, color: 'text-yellow-500', darkColor: 'dark:text-yellow-400' },
  '.mjs': { icon: FileCode2, color: 'text-yellow-500', darkColor: 'dark:text-yellow-400' },
  '.cjs': { icon: FileCode2, color: 'text-yellow-500', darkColor: 'dark:text-yellow-400' },
  '.css': { icon: FileCode2, color: 'text-purple-500', darkColor: 'dark:text-purple-400' },
  '.scss': { icon: FileCode2, color: 'text-pink-500', darkColor: 'dark:text-pink-400' },
  '.less': { icon: FileCode2, color: 'text-pink-500', darkColor: 'dark:text-pink-400' },
  '.html': { icon: Globe, color: 'text-orange-500', darkColor: 'dark:text-orange-400' },
  '.xml': { icon: Globe, color: 'text-orange-500', darkColor: 'dark:text-orange-400' },
  '.svg': { icon: FileImage, color: 'text-orange-500', darkColor: 'dark:text-orange-400' },
  '.json': { icon: FileJson, color: 'text-green-500', darkColor: 'dark:text-green-400' },
  '.yaml': { icon: FileText, color: 'text-red-500', darkColor: 'dark:text-red-400' },
  '.yml': { icon: FileText, color: 'text-red-500', darkColor: 'dark:text-red-400' },
  '.toml': { icon: FileText, color: 'text-red-500', darkColor: 'dark:text-red-400' },
  '.md': { icon: BookOpen, color: 'text-gray-500', darkColor: 'dark:text-gray-400' },
  '.mdx': { icon: BookOpen, color: 'text-gray-500', darkColor: 'dark:text-gray-400' },
  '.py': { icon: FileCode2, color: 'text-green-600', darkColor: 'dark:text-green-400' },
  '.pyi': { icon: FileCode2, color: 'text-green-600', darkColor: 'dark:text-green-400' },
  '.go': { icon: FileCode2, color: 'text-cyan-600', darkColor: 'dark:text-cyan-400' },
  '.rs': { icon: FileCode2, color: 'text-orange-600', darkColor: 'dark:text-orange-400' },
  '.java': { icon: FileCode2, color: 'text-red-500', darkColor: 'dark:text-red-400' },
  '.kt': { icon: FileCode2, color: 'text-purple-500', darkColor: 'dark:text-purple-400' },
  '.swift': { icon: FileCode2, color: 'text-orange-500', darkColor: 'dark:text-orange-400' },
  '.c': { icon: FileCode2, color: 'text-blue-600', darkColor: 'dark:text-blue-400' },
  '.cpp': { icon: FileCode2, color: 'text-blue-600', darkColor: 'dark:text-blue-400' },
  '.h': { icon: FileCode2, color: 'text-blue-600', darkColor: 'dark:text-blue-400' },
  '.hpp': { icon: FileCode2, color: 'text-blue-600', darkColor: 'dark:text-blue-400' },
  '.rb': { icon: FileCode2, color: 'text-red-500', darkColor: 'dark:text-red-400' },
  '.php': { icon: FileCode2, color: 'text-indigo-500', darkColor: 'dark:text-indigo-400' },
  '.sh': { icon: Terminal, color: 'text-green-500', darkColor: 'dark:text-green-400' },
  '.bash': { icon: Terminal, color: 'text-green-500', darkColor: 'dark:text-green-400' },
  '.zsh': { icon: Terminal, color: 'text-green-500', darkColor: 'dark:text-green-400' },
  '.sql': { icon: Database, color: 'text-blue-400', darkColor: 'dark:text-blue-300' },
  '.graphql': { icon: Database, color: 'text-pink-500', darkColor: 'dark:text-pink-400' },
  '.vue': { icon: LayoutTemplate, color: 'text-green-500', darkColor: 'dark:text-green-400' },
  '.svelte': { icon: LayoutTemplate, color: 'text-orange-500', darkColor: 'dark:text-orange-400' },
  '.png': { icon: FileImage, color: 'text-pink-500', darkColor: 'dark:text-pink-400' },
  '.jpg': { icon: FileImage, color: 'text-pink-500', darkColor: 'dark:text-pink-400' },
  '.jpeg': { icon: FileImage, color: 'text-pink-500', darkColor: 'dark:text-pink-400' },
  '.gif': { icon: FileImage, color: 'text-pink-500', darkColor: 'dark:text-pink-400' },
  '.ico': { icon: FileImage, color: 'text-pink-500', darkColor: 'dark:text-pink-400' },
  '.webp': { icon: FileImage, color: 'text-pink-500', darkColor: 'dark:text-pink-400' },
  '.mp3': { icon: FileAudio, color: 'text-purple-500', darkColor: 'dark:text-purple-400' },
  '.wav': { icon: FileAudio, color: 'text-purple-500', darkColor: 'dark:text-purple-400' },
  '.mp4': { icon: FileVideo, color: 'text-red-500', darkColor: 'dark:text-red-400' },
  '.mov': { icon: FileVideo, color: 'text-red-500', darkColor: 'dark:text-red-400' },
  '.zip': { icon: FileArchive, color: 'text-yellow-600', darkColor: 'dark:text-yellow-400' },
  '.tar': { icon: FileArchive, color: 'text-yellow-600', darkColor: 'dark:text-yellow-400' },
  '.gz': { icon: FileArchive, color: 'text-yellow-600', darkColor: 'dark:text-yellow-400' },
  '.rar': { icon: FileArchive, color: 'text-yellow-600', darkColor: 'dark:text-yellow-400' },
  '.7z': { icon: FileArchive, color: 'text-yellow-600', darkColor: 'dark:text-yellow-400' },
  '.pdf': { icon: FileType, color: 'text-red-500', darkColor: 'dark:text-red-400' },
  '.doc': { icon: FileType, color: 'text-blue-500', darkColor: 'dark:text-blue-400' },
  '.docx': { icon: FileType, color: 'text-blue-500', darkColor: 'dark:text-blue-400' },
  '.xls': { icon: FileType, color: 'text-green-500', darkColor: 'dark:text-green-400' },
  '.xlsx': { icon: FileType, color: 'text-green-500', darkColor: 'dark:text-green-400' },
  '.csv': { icon: FileType, color: 'text-green-500', darkColor: 'dark:text-green-400' },
  '.env': { icon: Cog, color: 'text-yellow-500', darkColor: 'dark:text-yellow-400' },
  '.lock': { icon: Cog, color: 'text-gray-400', darkColor: 'dark:text-gray-500' },
  '.conf': { icon: Cog, color: 'text-gray-500', darkColor: 'dark:text-gray-400' },
  '.config': { icon: Cog, color: 'text-gray-500', darkColor: 'dark:text-gray-400' },
};

const NAME_MAP: Record<string, { icon: React.ElementType; color: string; darkColor: string }> = {
  'dockerfile': { icon: Cog, color: 'text-blue-500', darkColor: 'dark:text-blue-400' },
  'makefile': { icon: Terminal, color: 'text-gray-500', darkColor: 'dark:text-gray-400' },
  'license': { icon: FileText, color: 'text-yellow-500', darkColor: 'dark:text-yellow-400' },
  'readme.md': { icon: BookOpen, color: 'text-blue-500', darkColor: 'dark:text-blue-400' },
  'package.json': { icon: FileJson, color: 'text-green-500', darkColor: 'dark:text-green-400' },
  'tsconfig.json': { icon: Cog, color: 'text-blue-500', darkColor: 'dark:text-blue-400' },
  '.gitignore': { icon: Cog, color: 'text-gray-500', darkColor: 'dark:text-gray-400' },
  '.eslintrc': { icon: Cog, color: 'text-purple-500', darkColor: 'dark:text-purple-400' },
  '.prettierrc': { icon: Cog, color: 'text-purple-500', darkColor: 'dark:text-purple-400' },
  '.editorconfig': { icon: Cog, color: 'text-gray-500', darkColor: 'dark:text-gray-400' },
  'vite.config.ts': { icon: Cog, color: 'text-purple-500', darkColor: 'dark:text-purple-400' },
  'vite.config.js': { icon: Cog, color: 'text-purple-500', darkColor: 'dark:text-purple-400' },
  'tailwind.config.js': { icon: Cog, color: 'text-cyan-500', darkColor: 'dark:text-cyan-400' },
  'tailwind.config.ts': { icon: Cog, color: 'text-cyan-500', darkColor: 'dark:text-cyan-400' },
  'postcss.config.js': { icon: Cog, color: 'text-purple-500', darkColor: 'dark:text-purple-400' },
};

const DEFAULT = { icon: File, color: 'text-gray-400', darkColor: 'dark:text-gray-500' };

export default function FileIconByType({ fileName, className }: FileIconProps) {
  const lower = fileName.toLowerCase();

  const nameMatch = NAME_MAP[lower];
  if (nameMatch) {
    const Icon = nameMatch.icon;
    return <Icon className={`${nameMatch.color} ${nameMatch.darkColor} ${className || ''}`} />;
  }

  const ext = '.' + lower.split('.').pop();
  const extMatch = EXT_MAP[ext];
  if (extMatch) {
    const Icon = extMatch.icon;
    return <Icon className={`${extMatch.color} ${extMatch.darkColor} ${className || ''}`} />;
  }

  const Icon = DEFAULT.icon;
  return <Icon className={`${DEFAULT.color} ${DEFAULT.darkColor} ${className || ''}`} />;
}
