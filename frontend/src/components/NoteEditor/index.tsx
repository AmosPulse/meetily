'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Heading2, 
  Quote,
  Save,
  Tag,
  Calendar,
  Users,
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

interface NoteEditorProps {
  note?: Note;
  onSave: (note: Partial<Note>) => void;
  onAutoSave?: (content: string) => void;
  autoSaveInterval?: number;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  onSave,
  onAutoSave,
  autoSaveInterval = 5000
}) => {
  const [title, setTitle] = useState(note?.title || '');
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [category, setCategory] = useState(note?.category || 'general');
  const [attendees, setAttendees] = useState<string[]>(note?.attendees || []);
  const [meetingTime, setMeetingTime] = useState(note?.meetingTime || '');
  const [newTag, setNewTag] = useState('');
  const [newAttendee, setNewAttendee] = useState('');

  const editor = useEditor({
    extensions: [StarterKit],
    content: note?.content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-4',
      },
    },
  });

  // Auto-save functionality
  useEffect(() => {
    if (!editor || !onAutoSave) return;

    const interval = setInterval(() => {
      const content = editor.getHTML();
      if (content !== note?.content) {
        onAutoSave(content);
      }
    }, autoSaveInterval);

    return () => clearInterval(interval);
  }, [editor, onAutoSave, autoSaveInterval, note?.content]);

  const handleSave = useCallback(() => {
    if (!editor) return;

    const noteData: Partial<Note> = {
      id: note?.id || `note-${Date.now()}`,
      title: title || 'Untitled Note',
      content: editor.getHTML(),
      tags,
      category,
      date: note?.date || new Date().toISOString().split('T')[0],
      attendees: attendees.length > 0 ? attendees : undefined,
      meetingTime: meetingTime || undefined,
    };

    onSave(noteData);
  }, [editor, title, tags, category, attendees, meetingTime, note?.id, note?.date, onSave]);

  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addAttendee = () => {
    if (newAttendee && !attendees.includes(newAttendee)) {
      setAttendees([...attendees, newAttendee]);
      setNewAttendee('');
    }
  };

  const removeAttendee = (attendeeToRemove: string) => {
    setAttendees(attendees.filter(attendee => attendee !== attendeeToRemove));
  };

  const categories = ['general', 'meeting', 'project', 'personal', 'ideas', 'action-items'];

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header Section */}
      <div className="mb-6 space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter note title..."
          className="w-full text-3xl font-bold border-none outline-none bg-transparent placeholder-gray-400"
        />

        {/* Metadata Row */}
        <div className="flex flex-wrap gap-4 items-center text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{note?.date || new Date().toLocaleDateString()}</span>
          </div>
          
          {meetingTime && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <input
                type="text"
                value={meetingTime}
                onChange={(e) => setMeetingTime(e.target.value)}
                placeholder="Meeting time"
                className="bg-transparent border-none outline-none"
              />
            </div>
          )}
        </div>

        {/* Category Selection */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Category:</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm border-none outline-none"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Tags Section */}
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <div key={tag} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                <Tag className="w-3 h-3" />
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                placeholder="Add tag"
                className="bg-gray-100 px-2 py-1 rounded text-sm border-none outline-none"
              />
              <button
                onClick={addTag}
                className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Attendees Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">Attendees:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {attendees.map((attendee) => (
              <div key={attendee} className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                {attendee}
                <button
                  onClick={() => removeAttendee(attendee)}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newAttendee}
                onChange={(e) => setNewAttendee(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addAttendee()}
                placeholder="Add attendee"
                className="bg-gray-100 px-2 py-1 rounded text-sm border-none outline-none"
              />
              <button
                onClick={addAttendee}
                className="bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg mb-4">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-gray-300' : ''}`}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-gray-300' : ''}`}
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-300' : ''}`}
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bulletList') ? 'bg-gray-300' : ''}`}
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('orderedList') ? 'bg-gray-300' : ''}`}
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('blockquote') ? 'bg-gray-300' : ''}`}
        >
          <Quote className="w-4 h-4" />
        </button>
        
        <div className="ml-auto">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            <Save className="w-4 h-4" />
            Save Note
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="border border-gray-200 rounded-lg">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};