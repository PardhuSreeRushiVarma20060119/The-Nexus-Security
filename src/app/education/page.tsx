'use client';

import { Card } from '@tremor/react';
import {
  AcademicCapIcon,
  BookOpenIcon,
  DocumentTextIcon,
  PlayCircleIcon,
} from '@heroicons/react/24/outline';

const courses = [
  {
    id: 1,
    title: 'Introduction to Cybersecurity',
    description: 'Learn the fundamentals of cybersecurity and basic threat detection.',
    duration: '2 hours',
    level: 'Beginner',
    icon: AcademicCapIcon,
  },
  {
    id: 2,
    title: 'Network Security Essentials',
    description: 'Understanding network vulnerabilities and protection mechanisms.',
    duration: '3 hours',
    level: 'Intermediate',
    icon: BookOpenIcon,
  },
  {
    id: 3,
    title: 'Advanced Penetration Testing',
    description: 'Learn advanced techniques for identifying system vulnerabilities.',
    duration: '4 hours',
    level: 'Advanced',
    icon: DocumentTextIcon,
  },
];

const resources = [
  {
    id: 1,
    title: 'Security Best Practices Guide',
    type: 'PDF Document',
    icon: DocumentTextIcon,
  },
  {
    id: 2,
    title: 'Video Tutorial: SQL Injection Prevention',
    type: 'Video',
    icon: PlayCircleIcon,
  },
  {
    id: 3,
    title: 'OWASP Top 10 Vulnerabilities',
    type: 'Interactive Guide',
    icon: BookOpenIcon,
  },
];

export default function EducationPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-white mb-8">Security Education</h1>

      <div className="mb-8">
        <h2 className="text-xl font-medium text-white mb-4">Available Courses</h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="bg-gray-800 border-gray-700">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <course.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">{course.title}</h3>
                  <p className="mt-1 text-sm text-gray-400">{course.description}</p>
                  <div className="mt-4 flex items-center gap-4">
                    <span className="text-xs text-gray-500">{course.duration}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-500/10 text-purple-500">
                      {course.level}
                    </span>
                  </div>
                  <button className="mt-4 w-full bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors">
                    Start Course
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-medium text-white mb-4">Learning Resources</h2>
        <div className="grid grid-cols-1 gap-4">
          {resources.map((resource) => (
            <Card key={resource.id} className="bg-gray-800 border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-700 rounded-lg">
                    <resource.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">{resource.title}</h3>
                    <p className="text-sm text-gray-400">{resource.type}</p>
                  </div>
                </div>
                <button className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
                  Access
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 