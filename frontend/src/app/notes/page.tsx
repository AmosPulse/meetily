'use client';

import React, { useState, useEffect } from 'react';
import { NotesManager } from '@/components/NotesManager';
import { NoteEditor } from '@/components/NoteEditor';
import { NoteTemplates, noteTemplates, NoteTemplate } from '@/components/NoteTemplates';
import { downloadMarkdown, downloadHTML, printNote, copyToClipboard } from '@/utils/noteExport';

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

const NotesPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentView, setCurrentView] = useState<'list' | 'editor'>('list');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load notes from localStorage on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('meetily-notes');
    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes);
        setNotes(parsedNotes);
      } catch (error) {
        console.error('Failed to load notes from localStorage:', error);
      }
    }
    setIsLoading(false);
  }, []);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('meetily-notes', JSON.stringify(notes));
    }
  }, [notes, isLoading]);

  const createNewNote = () => {
    setEditingNote(null);
    setCurrentView('editor');
  };

  const createFromTemplate = () => {
    setShowTemplates(true);
  };

  const handleTemplateSelect = (template: NoteTemplate) => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });

    // Replace template variables
    let content = template.content;
    content = content.replace(/\{\{date\}\}/g, dateStr);
    content = content.replace(/\{\{time\}\}/g, timeStr);
    content = content.replace(/\{\{title\}\}/g, template.name);
    content = content.replace(/\{\{attendees\}\}/g, '');

    // Convert markdown-style content to HTML for the editor
    content = content.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    content = content.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    content = content.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    content = content.replace(/^\- \[ \] (.*$)/gm, '<ul><li>$1</li></ul>');
    content = content.replace(/^\- \[x\] (.*$)/gm, '<ul><li><strike>$1</strike></li></ul>');
    content = content.replace(/^\- (.*$)/gm, '<ul><li>$1</li></ul>');
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
    content = content.replace(/\n/g, '<br>');

    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: template.name,
      content,
      tags: template.tags,
      category: template.category,
      date: dateStr,
      attendees: template.attendeesRequired ? [] : undefined,
      meetingTime: template.timeRequired ? timeStr : undefined,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    setEditingNote(newNote);
    setShowTemplates(false);
    setCurrentView('editor');
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setCurrentView('editor');
  };

  const handleSaveNote = (noteData: Partial<Note>) => {
    const now = new Date().toISOString();

    if (editingNote && editingNote.id) {
      // Update existing note
      setNotes(prev => prev.map(note => 
        note.id === editingNote.id 
          ? { ...note, ...noteData, updatedAt: now }
          : note
      ));
    } else {
      // Create new note
      const newNote: Note = {
        id: noteData.id || `note-${Date.now()}`,
        title: noteData.title || 'Untitled Note',
        content: noteData.content || '',
        tags: noteData.tags || [],
        category: noteData.category || 'general',
        date: noteData.date || new Date().toISOString().split('T')[0],
        attendees: noteData.attendees,
        meetingTime: noteData.meetingTime,
        createdAt: now,
        updatedAt: now
      };
      setNotes(prev => [newNote, ...prev]);
    }

    setCurrentView('list');
    setEditingNote(null);
  };

  const handleDeleteNote = (noteId: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      setNotes(prev => prev.filter(note => note.id !== noteId));
    }
  };

  const handleExportNote = async (note: Note, format: 'md' | 'pdf' | 'html' | 'copy' | 'print') => {
    try {
      switch (format) {
        case 'md':
          downloadMarkdown(note);
          break;
        case 'html':
          downloadHTML(note);
          break;
        case 'print':
          printNote(note);
          break;
        case 'copy':
          await copyToClipboard(note);
          // You could show a toast notification here
          break;
        default:
          console.warn('Unsupported export format:', format);
      }
    } catch (error) {
      console.error('Export failed:', error);
      // You could show an error notification here
    }
  };

  const handleAutoSave = (content: string) => {
    if (editingNote) {
      const now = new Date().toISOString();
      const updatedNote = { ...editingNote, content, updatedAt: now };
      
      setNotes(prev => prev.map(note => 
        note.id === editingNote.id ? updatedNote : note
      ));
      
      setEditingNote(updatedNote);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === 'list' && (
        <div>
          <NotesManager
            notes={notes}
            onCreateNote={createNewNote}
            onEditNote={handleEditNote}
            onDeleteNote={handleDeleteNote}
            onExportNote={(note, format) => handleExportNote(note, format)}
          />
          
          {/* Floating Action Button for Templates */}
          <button
            onClick={createFromTemplate}
            className="fixed bottom-8 right-8 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors z-40"
            title="Create from template"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
        </div>
      )}

      {currentView === 'editor' && (
        <div>
          <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setCurrentView('list')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Notes
            </button>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {editingNote ? 'Editing' : 'Creating'} Note
              </span>
              {editingNote && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleExportNote(editingNote, 'md')}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Export MD
                  </button>
                  <button
                    onClick={() => handleExportNote(editingNote, 'print')}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Print
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <NoteEditor
            note={editingNote || undefined}
            onSave={handleSaveNote}
            onAutoSave={handleAutoSave}
            autoSaveInterval={3000}
          />
        </div>
      )}

      {showTemplates && (
        <NoteTemplates
          onSelectTemplate={handleTemplateSelect}
          onClose={() => setShowTemplates(false)}
        />
      )}
    </div>
  );
};

export default NotesPage;