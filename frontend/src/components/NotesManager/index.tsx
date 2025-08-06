'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search,
  Filter,
  Plus,
  Tag,
  Calendar,
  Users,
  FileText,
  Download,
  Trash2,
  Edit3,
  Clock
} from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category: string;
  date: string;
  attendees?: string[];
  meetingTime?: string;
  createdAt: string;
  updatedAt: string;
}

interface NotesManagerProps {
  notes: Note[];
  onCreateNote: () => void;
  onEditNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
  onExportNote: (note: Note, format: 'md' | 'pdf') => void;
}

export const NotesManager: React.FC<NotesManagerProps> = ({
  notes,
  onCreateNote,
  onEditNote,
  onDeleteNote,
  onExportNote
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'updated'>('updated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const categories = useMemo(() => {
    const cats = new Set(notes.map(note => note.category));
    return ['all', ...Array.from(cats)];
  }, [notes]);

  const allTags = useMemo(() => {
    const tags = new Set(notes.flatMap(note => note.tags));
    return ['all', ...Array.from(tags)];
  }, [notes]);

  const filteredAndSortedNotes = useMemo(() => {
    let filtered = notes.filter(note => {
      const matchesSearch = !searchTerm || 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || note.category === selectedCategory;
      
      const matchesTag = selectedTag === 'all' || note.tags.includes(selectedTag);
      
      return matchesSearch && matchesCategory && matchesTag;
    });

    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'updated':
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
        default:
          aValue = a.title;
          bValue = b.title;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [notes, searchTerm, selectedCategory, selectedTag, sortBy, sortOrder]);

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '').slice(0, 150) + '...';
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Notes</h1>
        <button
          onClick={onCreateNote}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          <Plus className="w-4 h-4" />
          New Note
        </button>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>

        <select
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {allTags.map(tag => (
            <option key={tag} value={tag}>
              {tag === 'all' ? 'All Tags' : tag}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'updated')}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="updated">Last Updated</option>
            <option value="date">Date</option>
            <option value="title">Title</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-100"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-6 text-sm text-gray-600">
        <span>{filteredAndSortedNotes.length} of {notes.length} notes</span>
        {searchTerm && <span>• Searching for "{searchTerm}"</span>}
        {selectedCategory !== 'all' && <span>• Category: {selectedCategory}</span>}
        {selectedTag !== 'all' && <span>• Tag: {selectedTag}</span>}
      </div>

      {/* Notes Grid */}
      {filteredAndSortedNotes.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">
            {notes.length === 0 ? 'No notes yet' : 'No notes match your filters'}
          </p>
          {notes.length === 0 && (
            <button
              onClick={onCreateNote}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Create Your First Note
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedNotes.map((note) => (
            <div key={note.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold line-clamp-2">{note.title}</h3>
                  <div className="flex gap-1">
                    <button
                      onClick={() => onEditNote(note)}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Edit note"
                    >
                      <Edit3 className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => onExportNote(note, 'md')}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Export as Markdown"
                    >
                      <Download className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => onDeleteNote(note.id)}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Delete note"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {stripHtml(note.content)}
                </p>

                {/* Metadata */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(note.date).toLocaleDateString()}</span>
                    </div>
                    {note.meetingTime && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{note.meetingTime}</span>
                      </div>
                    )}
                  </div>
                  
                  {note.attendees && note.attendees.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Users className="w-3 h-3" />
                      <span>{note.attendees.join(', ')}</span>
                    </div>
                  )}
                </div>

                {/* Category and Tags */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                      {note.category}
                    </span>
                  </div>
                  
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {note.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          <Tag className="w-2 h-2" />
                          {tag}
                        </span>
                      ))}
                      {note.tags.length > 3 && (
                        <span className="text-xs text-gray-500">+{note.tags.length - 3} more</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};