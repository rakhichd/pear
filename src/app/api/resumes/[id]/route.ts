import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { error: 'Resume ID is required' },
        { status: 400 }
      );
    }

    // In a real implementation, you would fetch the resume data from Firestore
    // const resumeRef = doc(db, 'resumes', id);
    // const resumeSnap = await getDoc(resumeRef);
    
    // if (!resumeSnap.exists()) {
    //   return NextResponse.json(
    //     { error: 'Resume not found' },
    //     { status: 404 }
    //   );
    // }
    
    // Mock implementation
    const mockResume = {
      id: id,
      title: "Senior Software Engineer Resume",
      author: "Anonymous User",
      lastUpdated: "December 2023",
      education: "B.S. Computer Science, UC Berkeley",
      yearsExperience: "5+ years",
      skills: ["React", "TypeScript", "Node.js", "AWS", "Python", "GraphQL"],
      offers: ["Google", "Meta", "Amazon"],
      interviews: ["Apple", "Microsoft", "Netflix"],
      content: `
        <div class="mb-6">
          <h3 class="text-lg font-bold mb-2">EDUCATION</h3>
          <p><strong>University of California, Berkeley</strong> - B.S. Computer Science, 2018</p>
          <p class="text-sm">GPA: 3.8/4.0, Dean's List all semesters</p>
        </div>
        
        <div class="mb-6">
          <h3 class="text-lg font-bold mb-2">EXPERIENCE</h3>
          
          <div class="mb-4">
            <p class="font-semibold">Senior Software Engineer | Meta</p>
            <p class="text-sm">June 2021 - Present</p>
            <ul class="list-disc pl-5 mt-2 text-sm">
              <li>Led development of React-based frontend for new advertising analytics platform</li>
              <li>Implemented real-time data visualization components reducing load time by 40%</li>
              <li>Mentored junior engineers and conducted technical interviews</li>
            </ul>
          </div>
          
          <div class="mb-4">
            <p class="font-semibold">Software Engineer | Dropbox</p>
            <p class="text-sm">August 2018 - May 2021</p>
            <ul class="list-disc pl-5 mt-2 text-sm">
              <li>Developed and maintained RESTful APIs serving 10k+ requests per second</li>
              <li>Migrated legacy Python services to TypeScript microservices architecture</li>
              <li>Improved test coverage from 65% to 92% across core services</li>
            </ul>
          </div>
        </div>
        
        <div class="mb-6">
          <h3 class="text-lg font-bold mb-2">SKILLS</h3>
          <p><strong>Languages:</strong> JavaScript/TypeScript, Python, Go, SQL, HTML/CSS</p>
          <p><strong>Frameworks:</strong> React, Node.js, Express, Next.js, Django</p>
          <p><strong>Tools:</strong> AWS, Docker, Kubernetes, Git, CI/CD pipelines</p>
        </div>
      `,
      isPublic: true,
      role: "Software Engineer",
      experienceLevel: "senior" as const,
      companies: ["Meta", "Dropbox", "Google"],
      educationLevel: "bachelor" as const,
      formattingStyle: "professional" as const,
    };
    
    // Simulate a premium content check
    const isPremiumUser = false; // In a real app, this would be determined by authentication
    
    if (!isPremiumUser && mockResume.isPublic === false) {
      return NextResponse.json(
        { error: 'This resume requires a premium subscription' },
        { status: 403 }
      );
    }

    return NextResponse.json(mockResume);
  } catch (error) {
    console.error('Resume fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resume' },
      { status: 500 }
    );
  }
} 