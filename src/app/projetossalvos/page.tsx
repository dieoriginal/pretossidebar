'use client';

import { useEffect, useState } from 'react';
import { loadProjectsFromCloud } from '../../lib/firebase';
import { auth } from '../../lib/firebase-config';

export default function ProjetosSalvos() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      loadProjectsFromCloud(user.uid).then(setProjects);
    }
  }, []);

  return (
    <div className="grid grid-cols-3 gap-4">
      {projects.map(project => (
        <div key={project.id} className="border p-4">
          <h3>{project.title}</h3>
          <p>Last modified: {project.lastModified.toDateString()}</p>
          {/* Add open/delete buttons */}
        </div>
      ))}
    </div>
  );
} 