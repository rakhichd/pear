'use client';

import Link from "next/link";
import { useState } from "react";
import { ArrowRightIcon, CheckIcon, UserGroupIcon, LightBulbIcon, DocumentTextIcon, AcademicCapIcon, BuildingOfficeIcon } from "@heroicons/react/24/outline";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin } from '@fortawesome/free-brands-svg-icons';  // Import the LinkedIn icon


// Team member interface
interface TeamMember {
  name: string;
  role: string;
  bio: string;
  imgUrl: string;
  linkedinUrl: string;
}

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState<'mission'|'team'|'story'|'partners'>('mission');
  
  // Team members data
  const teamMembers: TeamMember[] = [
    {
      name: "Mohan Xu",
      role: "Founder",
      bio: "Former hiring manager at Google who saw firsthand how the right resume could make all the difference. Started ResumeFind to help job seekers learn from successful examples.",
      imgUrl: "https://randomuser.me/api/portraits/men/32.jpg",
      linkedinUrl: "https://www.linkedin.com/in/mohan-xu-/"
    },
    {
      name: "Winston Lo",
      role: "Chief Technology Officer",
      bio: "Background in AI and data science. Built the resume analysis engine that powers our matching and recommendation systems. CTO of FlowNow.",
      imgUrl: "https://randomuser.me/api/portraits/women/44.jpg",
      linkedinUrl: "https://www.linkedin.com/in/winston-lo-194a63239/"
    },
    {
      name: "Mahit Namburu",
      role: "Founder",
      bio: "Former career coach with 10+ years experience helping people land jobs at top companies. Oversees our resume collection and verification process.",
      imgUrl: "https://randomuser.me/api/portraits/men/67.jpg",
      linkedinUrl: "https://www.linkedin.com/in/mahitn/"
    },
    {
      name: "Rakhi Chadalavada",
      role: "Founder",
      bio: "Works with universities, bootcamps, and career services to provide customized resume resources for their students and alumni.",
      imgUrl: "https://randomuser.me/api/portraits/women/65.jpg",
      linkedinUrl: "https://www.linkedin.com/in/rakhi-c/"
    }
  ];
  
  // Company milestones
  const milestones = [
    { year: 2020, title: "The Beginning", description: "ResumeFind started as a small collection of verified resumes from successful job applicants." },
    { year: 2021, title: "First Major Growth", description: "Expanded to over 1,000 verified resumes across 12 different industries." },
    { year: 2022, title: "AI-Powered Features", description: "Launched our AI-powered resume analysis and matching technology." },
    { year: 2023, title: "Corporate Partnerships", description: "Partnered with 50+ companies to provide resume insights specific to their hiring processes." },
    { year: 2024, title: "Going Global", description: "Expanded our collection to include international resumes from 20+ countries." }
  ];
  
  // Partners
  const partners = [
    { name: "TechTalent", type: "Recruiting Agency" },
    { name: "CodeAcademy", type: "Education" },
    { name: "JobConnect", type: "Job Board" },
    { name: "Future Leaders", type: "Career Coaching" },
    { name: "HiringNation", type: "HR Services" },
    { name: "CareerLaunch", type: "University Partner" },
    { name: "SkillBridge", type: "Online Learning" },
    { name: "TalentMatch", type: "AI Recruiting" }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <svg className="h-full w-full" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="lines" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 0,15 L 30,15 M 15,0 L 15,30" stroke="white" strokeWidth="1" fill="none"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#lines)"/>
          </svg>
        </div>
        <div className="container mx-auto px-6 py-16 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About ResumeFind</h1>
            <p className="text-xl text-indigo-100 mb-8">
              We're on a mission to help job seekers create winning resumes by learning from real success stories.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/main/search"
                className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition shadow-md"
              >
                Explore Resumes
              </Link>
              <Link
                href="/main/resume/upload"
                className="px-6 py-3 bg-indigo-800 text-white border border-indigo-300 rounded-lg font-medium hover:bg-indigo-700 transition shadow-md"
              >
                Contribute Your Resume
              </Link>
            </div>
          </div>
        </div>
        
        {/* Wave divider */}
        <div className="absolute bottom-0 w-full">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" fill="#f9fafb">
            <path d="M0,64L60,58.7C120,53,240,43,360,42.7C480,43,600,53,720,58.7C840,64,960,64,1080,56C1200,48,1320,32,1380,24L1440,16L1440,100L1380,100C1320,100,1200,100,1080,100C960,100,840,100,720,100C600,100,480,100,360,100C240,100,120,100,60,100L0,100Z"></path>
          </svg>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        {/* Tabs */}
        <div className="flex flex-wrap border-b border-gray-200 mb-10">
          {[
            { id: 'mission', label: 'Our Mission', icon: <LightBulbIcon className="h-5 w-5" /> },
            { id: 'team', label: 'Our Team', icon: <UserGroupIcon className="h-5 w-5" /> },
            { id: 'story', label: 'Our Story', icon: <DocumentTextIcon className="h-5 w-5" /> },
            { id: 'partners', label: 'Our Partners', icon: <BuildingOfficeIcon className="h-5 w-5" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`flex items-center px-6 py-4 font-medium text-sm border-b-2 transition ${
                activeTab === tab.id 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab(tab.id as any)}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Tab Content */}
        <div className="mt-8">
          {/* Mission Tab */}
          {activeTab === 'mission' && (
            <div className="animate-fadeIn">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                      Our Mission & Values
                    </span>
                  </h2>
                  <p className="text-lg text-gray-600 mb-6">
                    At ResumeFind, we believe that everyone deserves access to the tools and insights that can help them land their dream job. 
                    Our mission is to democratize the job search process by providing real resume examples that have actually secured interviews and job offers.
                  </p>
                  <div className="space-y-4">
                    {[
                      "Transparency in what works in the job market",
                      "Accessibility for job seekers at all levels",
                      "Community-driven approach to resume improvement",
                      "Personalized guidance based on real-world success",
                      "Privacy and security for all contributors"
                    ].map((value, index) => (
                      <div key={index} className="flex items-start">
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                          <CheckIcon className="h-4 w-4 text-green-600" />
                        </div>
                        <p className="ml-3 text-gray-700">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute -inset-4 bg-indigo-50 rounded-lg transform rotate-3"></div>
                  <div className="relative bg-white p-8 rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold mb-4 text-indigo-700">How We Achieve Our Mission</h3>
                    <ul className="space-y-4">
                      <li className="flex">
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center mt-0.5">
                          <span className="text-indigo-600 font-bold text-sm">1</span>
                        </div>
                        <p className="ml-3 text-gray-700">Collecting verified resumes from successful job applicants</p>
                      </li>
                      <li className="flex">
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center mt-0.5">
                          <span className="text-indigo-600 font-bold text-sm">2</span>
                        </div>
                        <p className="ml-3 text-gray-700">Creating a searchable database with advanced filtering options</p>
                      </li>
                      <li className="flex">
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center mt-0.5">
                          <span className="text-indigo-600 font-bold text-sm">3</span>
                        </div>
                        <p className="ml-3 text-gray-700">Providing AI-powered analysis and personalized recommendations</p>
                      </li>
                      <li className="flex">
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center mt-0.5">
                          <span className="text-indigo-600 font-bold text-sm">4</span>
                        </div>
                        <p className="ml-3 text-gray-700">Building a community of job seekers who help each other succeed</p>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Team Tab */}
          {activeTab === 'team' && (
            <div className="animate-fadeIn">
              <div className="max-w-3xl mx-auto mb-12 text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                    Meet Our Team
                  </span>
                </h2>
                <p className="text-lg text-gray-600">
                  Our diverse team brings together expertise in recruiting, technology, and career development to create
                  the most comprehensive resume resource available.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {teamMembers.map((member, index) => (
                  <div 
                    key={index}
                    className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                  >
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={member.imgUrl} 
                        alt={member.name} 
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                      <p className="text-indigo-600 text-sm mb-3">{member.role}</p>
                      <p className="text-gray-600 text-sm">{member.bio}</p>
                      <p className="text-gray-600 text-sm">
                        <a href={member.linkedinUrl} target="_blank" rel="noopener noreferrer">
                          <FontAwesomeIcon icon={faLinkedin} className="w-6 h-6 text-blue-600" />
                        </a>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-16 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-8">
                <div className="text-center mb-8">
                  <h3 className="text-xl font-bold text-gray-900">Join Our Team</h3>
                  <p className="text-gray-600 mt-2">
                    We're always looking for passionate people to join our mission
                  </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    { 
                      title: "Data Scientist", 
                      type: "Full-time", 
                      location: "Remote" 
                    },
                    { 
                      title: "Resume Specialist", 
                      type: "Contract", 
                      location: "Remote" 
                    },
                    { 
                      title: "Frontend Developer", 
                      type: "Full-time", 
                      location: "San Francisco" 
                    }
                  ].map((job, index) => (
                    <div key={index} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition">
                      <h4 className="font-semibold text-gray-900">{job.title}</h4>
                      <div className="mt-2 mb-4 flex space-x-3">
                        <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                          {job.type}
                        </span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          {job.location}
                        </span>
                      </div>
                      <Link href="/careers" className="text-indigo-600 text-sm font-medium hover:text-indigo-800 flex items-center">
                        View Details 
                        <ArrowRightIcon className="ml-1 h-4 w-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Story Tab */}
          {activeTab === 'story' && (
            <div className="animate-fadeIn">
              <div className="max-w-3xl mx-auto mb-12 text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                    Our Story
                  </span>
                </h2>
                <p className="text-lg text-gray-600">
                  From a small collection of resumes to a comprehensive platform helping job seekers around the world.
                </p>
              </div>
              
              <div className="relative border-l-4 border-indigo-200 ml-6 pl-10 pb-8">
                {milestones.map((milestone, index) => (
                  <div key={index} className="mb-12 relative">
                    <div className="absolute -left-14 mt-1.5 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">
                      {milestone.year}
                    </div>
                    <div className={`bg-white p-6 rounded-lg shadow-md ${index % 2 === 0 ? 'md:ml-12' : 'md:ml-0 md:mr-12'}`}>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                    {/* Connect line to next milestone except for the last one */}
                    {index < milestones.length - 1 && (
                      <div className="absolute h-10 w-0.5 bg-indigo-200 left-0 top-full -ml-0.5"></div>
                    )}
                  </div>
                ))}
                
                {/* Current moment */}
                <div className="absolute -left-3.5 bottom-0 w-6 h-6 rounded-full bg-green-500 border-4 border-white shadow"></div>
                <div className="absolute -bottom-1 -left-36 text-sm font-medium text-green-600">Today</div>
              </div>
              
              <div className="mt-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">The Future of ResumeFind</h3>
                <p className="max-w-3xl mx-auto mb-6">
                  Our journey continues as we expand our library of successful resumes and develop new AI-powered tools to 
                  provide even more personalized feedback and recommendations.
                </p>
                <Link 
                  href="/main/search" 
                  className="inline-block px-6 py-3 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition shadow-md"
                >
                  Explore Our Platform
                </Link>
              </div>
            </div>
          )}
          
          {/* Partners Tab */}
          {activeTab === 'partners' && (
            <div className="animate-fadeIn">
              <div className="max-w-3xl mx-auto mb-12 text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                    Our Partners
                  </span>
                </h2>
                <p className="text-lg text-gray-600">
                  We collaborate with industry leaders to provide the best resources for job seekers.
                </p>
              </div>
              
              <div className="grid md:grid-cols-4 gap-6 mb-16">
                {partners.map((partner, index) => (
                  <div 
                    key={index} 
                    className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition text-center"
                  >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-100 flex items-center justify-center">
                      {index % 4 === 0 && <BuildingOfficeIcon className="h-8 w-8 text-indigo-600" />}
                      {index % 4 === 1 && <AcademicCapIcon className="h-8 w-8 text-indigo-600" />}
                      {index % 4 === 2 && <DocumentTextIcon className="h-8 w-8 text-indigo-600" />}
                      {index % 4 === 3 && <UserGroupIcon className="h-8 w-8 text-indigo-600" />}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{partner.name}</h3>
                    <p className="text-indigo-600 text-sm">{partner.type}</p>
                  </div>
                ))}
              </div>
              
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-8">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Become a Partner</h3>
                    <p className="text-gray-600 mb-6">
                      Join our network of partners and help your community access valuable resume insights tailored to your industry.
                    </p>
                    <ul className="space-y-3 mb-6">
                      {[
                        "Access to industry-specific resume examples",
                        "Co-branded resume feedback tools",
                        "Custom analytics on resume effectiveness",
                        "Integration with your existing career services"
                      ].map((benefit, index) => (
                        <li key={index} className="flex">
                          <CheckIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
                          <span className="ml-2">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                    <Link 
                      href="/partners" 
                      className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition shadow-md"
                    >
                      Partner With Us
                    </Link>
                  </div>
                  <div className="hidden md:block">
                    <img 
                      src="https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=987&q=80" 
                      alt="Partnership" 
                      className="rounded-lg shadow-lg object-cover h-80 w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Transform Your Job Search?</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Explore our collection of successful resumes or contribute your own to help others in their career journey.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/main/search"
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition shadow-md"
            >
              Search Resumes
            </Link>
            <Link
              href="/main/resume/feedback"
              className="px-6 py-3 bg-white text-indigo-600 border border-indigo-200 rounded-lg font-medium hover:bg-indigo-50 transition shadow-md"
            >
              Get Resume Feedback
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}