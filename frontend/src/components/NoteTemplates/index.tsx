'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Users, 
  Target, 
  CheckSquare, 
  Lightbulb,
  Calendar,
  TrendingUp,
  MessageSquare
} from 'lucide-react';

export interface NoteTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  category: string;
  tags: string[];
  content: string;
  attendeesRequired?: boolean;
  timeRequired?: boolean;
}

const noteTemplates: NoteTemplate[] = [
  {
    id: 'team-standup',
    name: 'Team Standup',
    description: 'Daily team standup meeting template',
    icon: Users,
    category: 'meeting',
    tags: ['standup', 'daily', 'team'],
    attendeesRequired: true,
    timeRequired: true,
    content: `# Team Standup - {{date}}

## Attendees
{{attendees}}

## What did we accomplish yesterday?


## What are we working on today?


## Blockers/Impediments


## Action Items
- [ ] 
- [ ] 

## Notes

`
  },
  {
    id: 'project-planning',
    name: 'Project Planning',
    description: 'Template for project planning meetings',
    icon: Target,
    category: 'project',
    tags: ['planning', 'project', 'roadmap'],
    attendeesRequired: true,
    timeRequired: true,
    content: `# Project Planning Meeting - {{date}}

## Attendees
{{attendees}}

## Project Overview
**Project Name:**
**Duration:**
**Priority:**

## Objectives
1. 
2. 
3. 

## Success Criteria


## Timeline & Milestones
| Milestone | Date | Owner |
|-----------|------|-------|
|           |      |       |

## Resources Required


## Risks & Mitigation


## Action Items
- [ ] 
- [ ] 

## Next Steps

`
  },
  {
    id: 'retrospective',
    name: 'Retrospective',
    description: 'Sprint or project retrospective template',
    icon: TrendingUp,
    category: 'meeting',
    tags: ['retrospective', 'improvement', 'team'],
    attendeesRequired: true,
    content: `# Retrospective - {{date}}

## Attendees
{{attendees}}

## What went well? 😊
- 
- 

## What could be improved? 🤔
- 
- 

## What should we start doing? ✨
- 
- 

## What should we stop doing? 🛑
- 
- 

## Action Items
- [ ] 
- [ ] 

## Team Mood
Rating: __ / 10

## Notes

`
  },
  {
    id: 'one-on-one',
    name: 'One-on-One',
    description: 'Template for one-on-one meetings',
    icon: MessageSquare,
    category: 'meeting',
    tags: ['1:1', 'feedback', 'personal'],
    attendeesRequired: true,
    content: `# One-on-One Meeting - {{date}}

## Participants
{{attendees}}

## Agenda
1. How are things going?
2. Recent wins and challenges
3. Goals and priorities
4. Feedback and support needed
5. Career development

## Discussion Points

### Recent Work
- What's going well?
- What's challenging?

### Goals & Priorities
- Progress on current goals
- Upcoming priorities

### Feedback
- What support do you need?
- Any blockers I can help with?

### Growth & Development
- Learning opportunities
- Skill development interests

## Action Items
- [ ] 
- [ ] 

## Notes

`
  },
  {
    id: 'brainstorming',
    name: 'Brainstorming Session',
    description: 'Creative brainstorming and ideation session',
    icon: Lightbulb,
    category: 'ideas',
    tags: ['brainstorming', 'creativity', 'ideas'],
    attendeesRequired: true,
    content: `# Brainstorming Session - {{date}}

## Attendees
{{attendees}}

## Challenge/Problem Statement


## Ground Rules
- No judgment
- Build on ideas
- Stay focused
- Encourage wild ideas

## Ideas Generated

### Idea 1
**Description:**
**Pros:**
**Cons:**
**Effort:** Low/Medium/High

### Idea 2
**Description:**
**Pros:**
**Cons:**
**Effort:** Low/Medium/High

### Idea 3
**Description:**
**Pros:**
**Cons:**
**Effort:** Low/Medium/High

## Prioritization
1. 
2. 
3. 

## Next Steps
- [ ] 
- [ ] 

## Notes

`
  },
  {
    id: 'client-meeting',
    name: 'Client Meeting',
    description: 'Template for client meetings and check-ins',
    icon: Users,
    category: 'meeting',
    tags: ['client', 'business', 'external'],
    attendeesRequired: true,
    timeRequired: true,
    content: `# Client Meeting - {{date}}

## Attendees
{{attendees}}

## Meeting Objective


## Agenda
1. Welcome and introductions
2. Project status update
3. Discussion points
4. Q&A
5. Next steps

## Project Status
**Current Phase:**
**Progress:**
**Timeline:**

## Discussion Points


## Client Feedback


## Decisions Made


## Action Items
- [ ] 
- [ ] 

## Next Meeting
**Date:**
**Agenda:**

## Notes

`
  },
  {
    id: 'action-items',
    name: 'Action Items',
    description: 'Simple action items and task tracking',
    icon: CheckSquare,
    category: 'action-items',
    tags: ['tasks', 'todo', 'tracking'],
    content: `# Action Items - {{date}}

## High Priority
- [ ] 
- [ ] 
- [ ] 

## Medium Priority
- [ ] 
- [ ] 

## Low Priority
- [ ] 
- [ ] 

## Completed
- [x] 

## Notes

`
  },
  {
    id: 'general-notes',
    name: 'General Notes',
    description: 'Simple general-purpose note template',
    icon: FileText,
    category: 'general',
    tags: ['general', 'notes'],
    content: `# {{title}} - {{date}}

## Summary


## Key Points
- 
- 
- 

## Action Items
- [ ] 
- [ ] 

## Notes

`
  }
];

interface NoteTemplatesProps {
  onSelectTemplate: (template: NoteTemplate) => void;
  onClose: () => void;
}

export const NoteTemplates: React.FC<NoteTemplatesProps> = ({
  onSelectTemplate,
  onClose
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const categories = ['all', ...Array.from(new Set(noteTemplates.map(t => t.category)))];
  
  const filteredTemplates = selectedCategory === 'all' 
    ? noteTemplates 
    : noteTemplates.filter(t => t.category === selectedCategory);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Choose a Template</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedCategory === category
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
            {filteredTemplates.map((template) => {
              const IconComponent = template.icon;
              return (
                <div
                  key={template.id}
                  onClick={() => onSelectTemplate(template)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <IconComponent className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{template.name}</h3>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    {template.tags.map((tag) => (
                      <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    {template.attendeesRequired && '• Attendees field '}
                    {template.timeRequired && '• Time field '}
                    {template.category && `• ${template.category} category`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export { noteTemplates };