'use client';

import { useState, useEffect, useCallback } from 'react';
import { Transcript } from '@/types';

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

export const useMeetingNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load notes from localStorage
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

  // Save notes to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('meetily-notes', JSON.stringify(notes));
    }
  }, [notes, isLoading]);

  const createNoteFromTranscript = useCallback((
    transcripts: Transcript[],
    meetingTitle: string,
    attendees: string[] = []
  ) => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    
    // Convert transcripts to readable content
    let content = '<h1>Meeting Transcript</h1><br><br>';
    
    transcripts.forEach((transcript, index) => {
      content += `<div style="margin-bottom: 1rem; padding: 0.5rem; background-color: #f8f9fa; border-radius: 0.375rem;">`;
      content += `<small style="color: #6b7280; display: block; margin-bottom: 0.25rem;">${transcript.timestamp}</small>`;
      content += `<p>${transcript.text}</p>`;
      content += `</div>`;
    });

    content += '<br><h2>Summary</h2><br>';
    content += '<p><em>Add your meeting summary here...</em></p><br><br>';
    
    content += '<h2>Action Items</h2><br>';
    content += '<ul><li>Review transcript and add action items</li></ul><br><br>';
    
    content += '<h2>Key Decisions</h2><br>';
    content += '<p><em>Document any key decisions made during the meeting...</em></p>';

    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: meetingTitle || `Meeting - ${dateStr}`,
      content,
      tags: ['meeting', 'transcript', 'auto-generated'],
      category: 'meeting',
      date: dateStr,
      attendees: attendees.length > 0 ? attendees : undefined,
      meetingTime: now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    setNotes(prev => [newNote, ...prev]);
    return newNote;
  }, []);

  const createNote = useCallback((noteData: Partial<Note>) => {
    const now = new Date().toISOString();
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
    return newNote;
  }, []);

  const updateNote = useCallback((noteId: string, updates: Partial<Note>) => {
    const now = new Date().toISOString();
    setNotes(prev => prev.map(note => 
      note.id === noteId 
        ? { ...note, ...updates, updatedAt: now }
        : note
    ));
  }, []);

  const deleteNote = useCallback((noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
  }, []);

  const getNoteById = useCallback((noteId: string) => {
    return notes.find(note => note.id === noteId);
  }, [notes]);

  const searchNotes = useCallback((
    query: string,
    category?: string,
    tag?: string
  ) => {
    return notes.filter(note => {
      const matchesQuery = !query || 
        note.title.toLowerCase().includes(query.toLowerCase()) ||
        note.content.toLowerCase().includes(query.toLowerCase()) ||
        note.tags.some(t => t.toLowerCase().includes(query.toLowerCase()));
      
      const matchesCategory = !category || category === 'all' || note.category === category;
      const matchesTag = !tag || tag === 'all' || note.tags.includes(tag);
      
      return matchesQuery && matchesCategory && matchesTag;
    });
  }, [notes]);

  return {
    notes,
    isLoading,
    createNote,
    createNoteFromTranscript,
    updateNote,
    deleteNote,
    getNoteById,
    searchNotes
  };
};